/**
 * Paritas — Sous-jeu Marchandage 4 leviers.
 *
 * Déclenché par la cellule (Échange × *) du moteur dialectique.
 * Mécanique : chaque camp dépose 4 leviers — 2 qu'il VEUT, 2 qu'il
 * ACCEPTE de céder. Sur 2 rounds, on résout les overlaps :
 *
 *   - levier que les DEUX veulent → conflit (chacun perd un peu)
 *   - levier que les DEUX cèdent → consensus (les deux gagnent)
 *   - levier voulu par A et cédé par B → A gagne, B perd
 *   - levier hors-table (ni voulu ni cédé) → rien
 *
 * Pure-function. Indépendant du moteur dialectique mais retourne
 * un Partial<DeltaVec> directement consommable par resolveTable.
 */

import type { DeltaVec } from './dialectic';

/* ============================================================
   1. Catalogue des 4 leviers d'échange
   ============================================================ */

export type Levier =
  /** Hausse salariale (€). */
  | 'salaire'
  /** Réduction temps de travail. */
  | 'tempsTravail'
  /** Garanties juridiques (CDI, conventions). */
  | 'garanties'
  /** Flexibilité (annualisation, télétravail, mobilité). */
  | 'flexibilite';

export const LEVIERS: Levier[] = ['salaire', 'tempsTravail', 'garanties', 'flexibilite'];

export const LEVIER_LABEL: Record<Levier, string> = {
  salaire: 'Hausse salariale',
  tempsTravail: 'Temps de travail',
  garanties: 'Garanties juridiques',
  flexibilite: 'Flexibilité du travail'
};

/* ============================================================
   2. Dépôts (offre par camp)
   ============================================================ */

export interface Depot {
  /** Leviers que le camp VEUT obtenir. */
  veut: Levier[];
  /** Leviers que le camp ACCEPTE de céder. */
  cede: Levier[];
}

export interface MarchandageInput {
  patron: Depot;
  salarie: Depot;
}

/* ============================================================
   3. Résultat
   ============================================================ */

export type LevierIssue =
  /** Pas de match : ni voulu ni cédé par les deux. */
  | 'horsTable'
  /** Les deux camps veulent : conflit, statu quo cher. */
  | 'conflit'
  /** Les deux camps cèdent : consensus, gain pour les deux. */
  | 'consensus'
  /** Le patron gagne (il voulait, salarié cédait). */
  | 'gainPatron'
  /** Le salarié gagne (il voulait, patron cédait). */
  | 'gainSalarie';

export interface MarchandageOutcome {
  /** Verdict par levier. */
  parLevier: Record<Levier, LevierIssue>;
  /** Nombre de leviers résolus en accord (consensus + gainX). */
  accords: number;
  /** Nombre de leviers en conflit. */
  conflits: number;
  /** Delta KPI à appliquer après le sous-jeu. */
  delta: Partial<DeltaVec>;
  /** True si les deux camps repartent globalement satisfaits. */
  succes: boolean;
}

/* ============================================================
   4. Validation des dépôts
   ============================================================ */

/**
 * Un dépôt valide a exactement 2 leviers en "veut" et 2 en "cède",
 * sans intersection (on ne peut pas vouloir ce qu'on cède).
 */
export function validateDepot(d: Depot): { ok: boolean; reason?: string } {
  if (d.veut.length !== 2) {
    return { ok: false, reason: `veut doit contenir 2 leviers (a ${d.veut.length})` };
  }
  if (d.cede.length !== 2) {
    return { ok: false, reason: `cede doit contenir 2 leviers (a ${d.cede.length})` };
  }
  const all = new Set([...d.veut, ...d.cede]);
  if (all.size !== 4) {
    return { ok: false, reason: 'veut et cede ne peuvent pas se chevaucher' };
  }
  return { ok: true };
}

/* ============================================================
   5. Résolution
   ============================================================ */

function levierIssue(
  levier: Levier,
  patron: Depot,
  salarie: Depot
): LevierIssue {
  const pV = patron.veut.includes(levier);
  const pC = patron.cede.includes(levier);
  const sV = salarie.veut.includes(levier);
  const sC = salarie.cede.includes(levier);

  if (pV && sV) return 'conflit';
  if (pC && sC) return 'consensus';
  if (pV && sC) return 'gainPatron';
  if (sV && pC) return 'gainSalarie';
  return 'horsTable';
}

/**
 * Calcule le delta KPI pour un levier donné selon son issue.
 * Les magnitudes sont calibrées pour qu'un succès complet
 * (4 leviers en accord) donne un delta significatif sans être brutal.
 */
function deltaFromLevier(levier: Levier, issue: LevierIssue): Partial<DeltaVec> {
  if (issue === 'horsTable') return {};
  if (issue === 'conflit') {
    /* Statu quo coûteux : tension monte, capPol patron baisse,
       cohésion salarié baisse. */
    return { tension: 4, capPol: -2, cohesion: -2 };
  }
  if (issue === 'consensus') {
    /* Tous les deux cèdent ce levier : c'est de la fluidification
       réciproque. Petit gain partagé. */
    return { climat: 2, povAchat: 1, tension: -2 };
  }
  /* gainPatron / gainSalarie : asymétrique selon le levier. */
  switch (levier) {
    case 'salaire':
      return issue === 'gainPatron'
        ? { marge: 5, povAchat: -3, climat: -1 }
        : { povAchat: 6, marge: -4, climat: 2 };
    case 'tempsTravail':
      return issue === 'gainPatron'
        ? { marge: 3, povAchat: -2, climat: -2 }
        : { povAchat: 3, marge: -2, climat: 3, droits: 2 };
    case 'garanties':
      return issue === 'gainPatron'
        ? { marge: 2, droits: -3, legitimite: -2 }
        : { droits: 5, legitimite: 4, marge: -2 };
    case 'flexibilite':
      return issue === 'gainPatron'
        ? { marge: 4, cohesion: -3, climat: -1 }
        : { cohesion: 3, droits: 2, marge: -2 };
  }
}

/**
 * Compose les deltas de tous les leviers en un seul.
 */
function composeDelta(parLevier: Record<Levier, LevierIssue>): Partial<DeltaVec> {
  const out: Partial<DeltaVec> = {};
  for (const lev of LEVIERS) {
    const d = deltaFromLevier(lev, parLevier[lev]);
    for (const k of Object.keys(d) as (keyof DeltaVec)[]) {
      out[k] = (out[k] ?? 0) + (d[k] ?? 0);
    }
  }
  return out;
}

/**
 * Résout un marchandage. Pure-function.
 */
export function resolveMarchandage(input: MarchandageInput): MarchandageOutcome {
  const vp = validateDepot(input.patron);
  const vs = validateDepot(input.salarie);
  if (!vp.ok) throw new Error(`Depot patron invalide: ${vp.reason}`);
  if (!vs.ok) throw new Error(`Depot salarie invalide: ${vs.reason}`);

  const parLevier: Record<Levier, LevierIssue> = {
    salaire: levierIssue('salaire', input.patron, input.salarie),
    tempsTravail: levierIssue('tempsTravail', input.patron, input.salarie),
    garanties: levierIssue('garanties', input.patron, input.salarie),
    flexibilite: levierIssue('flexibilite', input.patron, input.salarie)
  };

  let accords = 0;
  let conflits = 0;
  for (const lev of LEVIERS) {
    const i = parLevier[lev];
    if (i === 'consensus' || i === 'gainPatron' || i === 'gainSalarie') accords++;
    if (i === 'conflit') conflits++;
  }

  const delta = composeDelta(parLevier);

  /* Succès si plus d'accords que de conflits (au moins 2 accords). */
  const succes = accords >= 2 && accords > conflits;

  return { parLevier, accords, conflits, delta, succes };
}

/* ============================================================
   6. IA — politique automatique pour CPU adverse

   Si un seul camp est joué par l'humain, l'autre dépose un
   marchandage par défaut selon sa doctrine. On garde simple :
   - patron neoliberal : veut salaire+flexibilite, cède garanties+tempsTravail
   - patron paternalisme : veut tempsTravail+flexibilite, cède salaire+garanties
   - salarié syndicalismeLutte : veut salaire+garanties, cède flexibilite+tempsTravail
   - salarié reformiste : veut garanties+tempsTravail, cède salaire+flexibilite
   ============================================================ */

import type { Doctrine } from './dialectic';

export function defaultDepotForDoctrine(d: Doctrine): Depot {
  switch (d) {
    /* Patron */
    case 'neoliberal':
      return { veut: ['salaire', 'flexibilite'], cede: ['garanties', 'tempsTravail'] };
    case 'paternalisme':
      return { veut: ['tempsTravail', 'flexibilite'], cede: ['salaire', 'garanties'] };
    case 'technocratique':
      return { veut: ['flexibilite', 'garanties'], cede: ['salaire', 'tempsTravail'] };
    case 'corporatiste':
      return { veut: ['salaire', 'garanties'], cede: ['tempsTravail', 'flexibilite'] };
    /* Salarié */
    case 'syndicalismeLutte':
      return { veut: ['salaire', 'garanties'], cede: ['flexibilite', 'tempsTravail'] };
    case 'reformiste':
      return { veut: ['garanties', 'tempsTravail'], cede: ['salaire', 'flexibilite'] };
    case 'autogestionnaire':
      return { veut: ['tempsTravail', 'garanties'], cede: ['salaire', 'flexibilite'] };
    case 'juridiste':
      return { veut: ['garanties', 'salaire'], cede: ['flexibilite', 'tempsTravail'] };
  }
}
