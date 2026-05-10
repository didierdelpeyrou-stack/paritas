/**
 * Paritas — Sous-jeu Conseil prud'homal.
 *
 * Déclenché quand saisinePrudhomale ≥ 30 + cellule (*, AcquisCiblés).
 * Mécanique : 3 charges sont posées (licenciement, harcèlement,
 * convention non respectée). Chaque camp choisit une STRATÉGIE
 * de plaidoyer parmi 3 options. Le verdict découle d'un score
 * déterministe basé sur :
 *   - Légitimité salarié (force d'arguments)
 *   - Capital politique patron (puissance avocats)
 *   - Droits acquis empilés (jurisprudence en faveur du salarié)
 *   - Stratégie choisie (multiplicateurs)
 *
 * Pure-function. Pas de hasard. C'est le sous-jeu le plus calme,
 * mais aussi le plus prévisible — un patron avec faible capPol et
 * face à un salarié légitime + 4 acquis débloqués perd presque
 * sûrement, et c'est le but pédagogique.
 */

import type {
  DeltaVec,
  PatronKPI,
  SalarieKPI,
  AcquisId
} from './dialectic';

/* ============================================================
   1. Charges (cas plaidés)
   ============================================================ */

export type Charge =
  | 'licenciement'
  | 'harcelement'
  | 'conventionViolee';

export const CHARGES: Charge[] = ['licenciement', 'harcelement', 'conventionViolee'];

export const CHARGE_LABEL: Record<Charge, string> = {
  licenciement: 'Licenciement abusif',
  harcelement: 'Harcèlement moral',
  conventionViolee: 'Convention collective non respectée'
};

/* ============================================================
   2. Stratégies de plaidoyer (3 par camp)
   ============================================================ */

export type StrategieSalarie =
  /** Témoignages, narration personnelle. */
  | 'temoignage'
  /** Cadrage juridique strict, articles de loi. */
  | 'juridique'
  /** Pression médiatique en parallèle. */
  | 'mediatique';

export type StrategiePatron =
  /** Procédural : épuiser les délais. */
  | 'procedural'
  /** Contre-attaque : faute du salarié. */
  | 'contreFaute'
  /** Médiation : éviter la condamnation. */
  | 'mediation';

export const STRAT_SALARIE_LABEL: Record<StrategieSalarie, string> = {
  temoignage: 'Témoignages',
  juridique: 'Cadrage juridique',
  mediatique: 'Pression médiatique'
};

export const STRAT_PATRON_LABEL: Record<StrategiePatron, string> = {
  procedural: 'Procédural',
  contreFaute: 'Contre-attaque',
  mediation: 'Médiation'
};

/* ============================================================
   3. Verdict
   ============================================================ */

export type Verdict =
  | 'favorableSalarie'
  | 'favorablePatron'
  | 'renvoi';

export interface ConseilInput {
  patron: PatronKPI;
  salarie: SalarieKPI;
  acquis: Set<AcquisId>;
  charges: Charge[];
  strategieSalarie: StrategieSalarie;
  strategiePatron: StrategiePatron;
}

export interface ConseilOutcome {
  verdict: Verdict;
  /** Score net salarié - patron (positif = favorable salarié). */
  scoreNet: number;
  /** Détail par charge. */
  parCharge: Record<Charge, Verdict>;
  /** Delta KPI à appliquer. */
  delta: Partial<DeltaVec>;
}

/* ============================================================
   4. Score d'une charge — pure function
   ============================================================ */

/**
 * Calcule un score signé pour une charge :
 *   > 0 = favorable salarié, < 0 = favorable patron, ≈ 0 = renvoi.
 */
function scoreCharge(input: ConseilInput, charge: Charge): number {
  /* Base : légitimité salarié pèse positif, capPol patron pèse négatif. */
  let score = (input.salarie.legitimite - input.patron.capPol) * 0.5;

  /* Droits acquis empilés : chaque acquis pertinent ajoute du poids. */
  const acquisBoost = pertinentAcquis(charge, input.acquis);
  score += acquisBoost * 6;

  /* Stratégies salarié — chacune avantage selon le cas. */
  switch (input.strategieSalarie) {
    case 'temoignage':
      /* Marche bien sur harcèlement, faible sur convention. */
      score += charge === 'harcelement' ? 12 : charge === 'conventionViolee' ? -2 : 4;
      break;
    case 'juridique':
      /* Marche bien sur convention, neutre ailleurs. */
      score += charge === 'conventionViolee' ? 14 : 5;
      break;
    case 'mediatique':
      /* Léger mais omnidirectionnel. */
      score += 6;
      break;
  }
  /* Stratégies patron — coût pour le salarié. */
  switch (input.strategiePatron) {
    case 'procedural':
      /* Génial sur licenciement (vices de forme), faible sur harcèlement. */
      score -= charge === 'licenciement' ? 10 : 3;
      break;
    case 'contreFaute':
      /* Marche sur licenciement et conventionViolee, peu sur harcèlement. */
      score -= charge === 'harcelement' ? 2 : 8;
      break;
    case 'mediation':
      /* Réduit l'amplitude — pousse vers le renvoi. */
      score *= 0.5;
      break;
  }

  return score;
}

function pertinentAcquis(charge: Charge, acquis: Set<AcquisId>): number {
  let n = 0;
  if (charge === 'licenciement' && acquis.has('chsct_1982')) n++;
  if (charge === 'licenciement' && acquis.has('sectionsSyndicales_1968')) n++;
  if (charge === 'conventionViolee' && acquis.has('congesPayes_1936')) n++;
  if (charge === 'conventionViolee' && acquis.has('secu_1945')) n++;
  if (charge === 'harcelement' && acquis.has('chsct_1982')) n++;
  if (acquis.has('rtt_2000')) n += 0.3; // jurisprudence générale
  return n;
}

function verdictFromScore(s: number): Verdict {
  if (s > 5) return 'favorableSalarie';
  if (s < -5) return 'favorablePatron';
  return 'renvoi';
}

/* ============================================================
   5. Résolution complète
   ============================================================ */

export function resolveConseil(input: ConseilInput): ConseilOutcome {
  if (input.charges.length === 0) {
    throw new Error('Conseil: au moins 1 charge requise');
  }

  const parCharge: Record<Charge, Verdict> = {} as Record<Charge, Verdict>;
  let totalScore = 0;
  for (const c of input.charges) {
    const s = scoreCharge(input, c);
    parCharge[c] = verdictFromScore(s);
    totalScore += s;
  }
  /* Initialise les charges non plaidées en 'renvoi'. */
  for (const c of CHARGES) {
    if (!(c in parCharge)) parCharge[c] = 'renvoi';
  }

  const verdict = verdictFromScore(totalScore / input.charges.length);
  const delta = deltaFromVerdict(verdict, input.charges.length);

  return {
    verdict,
    scoreNet: totalScore,
    parCharge,
    delta
  };
}

function deltaFromVerdict(v: Verdict, n: number): Partial<DeltaVec> {
  /* Multiplicateur selon le nombre de charges plaidées. */
  const m = Math.max(1, n);
  switch (v) {
    case 'favorableSalarie':
      return {
        legitimite: 6 * m,
        droits: 4 * m,
        povAchat: 2 * m,    // dommages-intérêts
        marge: -3 * m,      // condamnation pécuniaire
        reputation: -5 * m, // image patron écornée
        capPol: -3 * m,
        tension: -2 * m
      };
    case 'favorablePatron':
      return {
        capPol: 4 * m,
        marge: 1 * m,
        legitimite: -5 * m,
        cohesion: -3 * m,    // démobilisation après échec
        droits: -2 * m,
        tension: 3 * m
      };
    case 'renvoi':
      /* Audience renvoyée → pas de gain mais usure procédurale. */
      return {
        legitimite: -1 * m,
        capPol: -1 * m,
        tension: 1 * m
      };
  }
}

/* ============================================================
   6. IA — politique défaut pour CPU
   ============================================================ */

import type { Doctrine } from './dialectic';

export function defaultStrategieSalarie(d: Doctrine): StrategieSalarie {
  switch (d) {
    case 'syndicalismeLutte': return 'mediatique';
    case 'reformiste':        return 'juridique';
    case 'autogestionnaire':  return 'temoignage';
    case 'juridiste':         return 'juridique';
    /* Doctrines patron utilisées par erreur → fallback. */
    default: return 'juridique';
  }
}

export function defaultStrategiePatron(d: Doctrine): StrategiePatron {
  switch (d) {
    case 'neoliberal':       return 'contreFaute';
    case 'paternalisme':     return 'mediation';
    case 'technocratique':   return 'procedural';
    case 'corporatiste':     return 'mediation';
    /* Doctrines salarié utilisées par erreur → fallback. */
    default: return 'procedural';
  }
}
