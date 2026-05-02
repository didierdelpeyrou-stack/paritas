/**
 * Module Caisse — comptabilité de l'organisation par tour.
 *
 * Remplace l'ancien `applyOrganizationUpkeep` minimaliste (cotisations
 * × adhérents – salaires permanents) par une vraie balance avec
 * plusieurs lignes nommées et historiques.
 *
 * Source d'inspiration réelle : ressources d'un syndicat français.
 *   Recettes : cotisations, dons, presse, subventions paritaires,
 *              compensation droit syndical, formation professionnelle.
 *   Dépenses : permanents, juristes, locaux, communication, formation
 *              interne, aide aux grévistes, déplacements, amortissements.
 */

import { assetById } from './catalog';
import type { BudgetStrategy, PlayerOrganization } from './types';

export interface BudgetLine {
  id: string;
  label: string;
  amount: number; // positif = recette, négatif = dépense
  /** Détail / formule pour le tooltip. */
  detail: string;
}

export interface BudgetSnapshot {
  recettes: BudgetLine[];
  depenses: BudgetLine[];
  totalRecettes: number;
  totalDepenses: number;
  net: number;
  strategy: BudgetStrategy;
}

const STRATEGY_MULT: Record<BudgetStrategy, { revenu: number; depense: number }> = {
  epargne: { revenu: 1.0, depense: 0.65 },     // -35% de dépenses (gels, économies)
  equilibre: { revenu: 1.0, depense: 1.0 },
  distribution: { revenu: 1.0, depense: 1.35 } // +35% de dépenses (aides, formations)
};

/**
 * Arrondi conscient de la stratégie : sur les petites dépenses, un mult
 * 1.18 perd au passage à `Math.round` (-1 × 1.18 = -1.18 → -1) — la
 * stratégie n'a aucun effet visible. On amplifie loin de zéro quand
 * mult > 1, on rapproche de zéro quand mult < 1.
 */
function strategyRound(rawAmount: number, mult: number): number {
  const scaled = rawAmount * mult;
  if (mult > 1) return scaled >= 0 ? Math.ceil(scaled) : Math.floor(scaled);
  if (mult < 1) return scaled >= 0 ? Math.floor(scaled) : Math.ceil(scaled);
  return Math.round(scaled);
}

const STRATEGY_LABELS: Record<BudgetStrategy, string> = {
  epargne: 'Épargne',
  equilibre: 'Équilibre',
  distribution: 'Distribution'
};

const STRATEGY_DESCRIPTIONS: Record<BudgetStrategy, string> = {
  epargne:
    'Gels d’embauche, communication contenue, formations reportées. Dépenses −35 % : la caisse gonfle, la cohésion s’érode (−1/tour).',
  equilibre: 'Régime normal : on dépense ce qui rentre, on ne touche pas aux réserves.',
  distribution:
    'Aide aux grévistes, formations massives, presse à plein. Dépenses +35 % : la caisse fond, la cohésion s’affermit (+1/tour).'
};

export function strategyLabel(s: BudgetStrategy): string {
  return STRATEGY_LABELS[s];
}

export function strategyDescription(s: BudgetStrategy): string {
  return STRATEGY_DESCRIPTIONS[s];
}

/* ========================================================================
   Recettes
   ======================================================================== */

function computeRecettes(org: PlayerOrganization, turn: number): BudgetLine[] {
  const out: BudgetLine[] = [];

  // 1. Cotisations des adhérents
  // Ratio salarié/patron ≈ 1:3 (et non 1:8 comme avant : un syndicat
  // patronal a moins d'adhérents mais des cotisations plus lourdes,
  // l'écart par tête est sensible mais pas écrasant).
  const cotisationRate = org.camp === 'salarie' ? 0.05 : 0.16;
  const cotisations = Math.round(org.membership * cotisationRate);
  if (cotisations > 0) {
    out.push({
      id: 'cotisations',
      label: 'Cotisations adhérents',
      amount: cotisations,
      detail: `${org.membership} ${org.camp === 'salarie' ? 'adhérents' : 'membres'} × ${cotisationRate.toFixed(2).replace('.', ',')}`
    });
  }

  // 1b. Dons et legs ponctuels — variable, déterministe sur le tour.
  // Hash du tour pour pseudo-aléatoire stable (même tour = même don).
  const donFactor = ((turn * 2654435761) >>> 0) % 100;
  if (donFactor < 22 && org.reputation >= 35) {
    const dons = Math.max(2, Math.round(org.reputation / 12));
    out.push({
      id: 'dons-legs',
      label: 'Dons & legs',
      amount: dons,
      detail: `Don ponctuel d'un sympathisant (réputation ${org.reputation})`
    });
  }

  // 2. Vente de presse syndicale (si on a un relais média)
  if (org.mediaRelay >= 1) {
    const presse = org.mediaRelay * 2;
    out.push({
      id: 'presse',
      label: 'Presse syndicale',
      amount: presse,
      detail: `${org.mediaRelay} média(s) × 2`
    });
  }

  // 3. Subventions paritaires (à partir du tour 23, après la Sécu de 1945)
  if (turn >= 23) {
    const subv = Math.round(org.localSections * 0.6);
    if (subv > 0) {
      out.push({
        id: 'subventions',
        label: 'Subventions paritaires',
        amount: subv,
        detail: `${org.localSections} sections × 0,6 (post-1945)`
      });
    }
  }

  // 4. Compensation droit syndical (post-1968)
  if (turn >= 28) {
    const droits = org.permanentStaff * 1;
    if (droits > 0) {
      out.push({
        id: 'droits-syndicaux',
        label: 'Droit syndical (loi 1968)',
        amount: droits,
        detail: `${org.permanentStaff} permanent(s) × 1`
      });
    }
  }

  // 5. Formation professionnelle (FNE 1971+)
  if (turn >= 30 && org.legalTeam >= 2) {
    out.push({
      id: 'fne',
      label: 'Formation pro (FNE)',
      amount: 3,
      detail: 'Loi formation continue de 1971'
    });
  }

  return out;
}

/* ========================================================================
   Dépenses
   ======================================================================== */

function computeDepenses(org: PlayerOrganization): BudgetLine[] {
  const out: BudgetLine[] = [];

  // 1. Salaires des permanents
  if (org.permanentStaff > 0) {
    out.push({
      id: 'permanents',
      label: 'Permanents',
      amount: -org.permanentStaff * 2,
      detail: `${org.permanentStaff} permanent(s) × 2`
    });
  }

  // 2. Juristes
  if (org.legalTeam > 0) {
    out.push({
      id: 'juristes',
      label: 'Service juridique',
      amount: -org.legalTeam * 1,
      detail: `${org.legalTeam} juriste(s) × 1`
    });
  }

  // 3. Locaux des sections
  if (org.localSections > 0) {
    out.push({
      id: 'locaux',
      label: 'Loyers des sections',
      amount: -Math.ceil(org.localSections * 0.5),
      detail: `${org.localSections} section(s) × 0,5`
    });
  }

  // 4. Upkeep des actifs
  const upkeep = org.assets
    .map(id => assetById(id)?.upkeep ?? 0)
    .reduce((sum, value) => sum + value, 0);
  if (upkeep > 0) {
    out.push({
      id: 'actifs',
      label: 'Entretien des actifs',
      amount: -upkeep,
      detail: `${org.assets.length} actif(s) en service`
    });
  }

  // 5. Communication (tracts, affiches)
  if (org.mediaRelay >= 1) {
    out.push({
      id: 'communication',
      label: 'Communication',
      amount: -Math.max(1, org.mediaRelay),
      detail: `Tracts, presse, réseaux × ${org.mediaRelay} média(s)`
    });
  }

  // 6. Formation interne des militants
  if (org.militants >= 10) {
    out.push({
      id: 'formation-interne',
      label: 'Formation des militants',
      amount: -Math.max(1, Math.round(org.militants / 25)),
      detail: `${org.militants} militants à former`
    });
  }

  // 7. Aide sociale (bourses militantes, secours grévistes)
  if (org.mobilisationFatigue >= 50) {
    const aide = Math.ceil((org.mobilisationFatigue - 40) / 10);
    out.push({
      id: 'aide-sociale',
      label: 'Aide sociale (grévistes)',
      amount: -aide,
      detail: `Fatigue militante ${Math.round(org.mobilisationFatigue)}/100`
    });
  }

  // 8. Frais de fonctionnement (constants)
  out.push({
    id: 'fonctionnement',
    label: 'Frais de fonctionnement',
    amount: -1,
    detail: 'Téléphone, déplacements, papier'
  });

  // 9. Transferts UD/UL — la confédération reverse aux unions
  // départementales et locales. ~25% des cotisations remontent,
  // proportionnel au nombre de sections (relai administratif).
  if (org.localSections >= 2) {
    const ud = -Math.max(1, Math.round(org.localSections * 0.7));
    out.push({
      id: 'transferts-ud',
      label: 'Transferts UD/UL',
      amount: ud,
      detail: `${org.localSections} sections × 0,7 (cotisations remontées)`
    });
  }

  return out;
}

/** Coût exceptionnel d'un congrès — appliqué tous les `CONGRES_INTERVAL` tours. */
const CONGRES_INTERVAL = 8;

/* ========================================================================
   Snapshot final avec multiplicateur de stratégie
   ======================================================================== */

export function computeBudget(org: PlayerOrganization, turn: number): BudgetSnapshot {
  const mult = STRATEGY_MULT[org.budgetStrategy];

  const recettesRaw = computeRecettes(org, turn);
  const depensesRaw = computeDepenses(org);

  // Congrès : tous les CONGRES_INTERVAL tours (à partir de T15), gros poste
  // ponctuel proportionnel à la taille de l'organisation. Donne du rythme
  // budgétaire et oblige le joueur à anticiper.
  if (turn >= 15 && turn % CONGRES_INTERVAL === 0) {
    const cong = -Math.max(4, Math.round(org.membership / 30 + org.localSections * 0.4));
    depensesRaw.push({
      id: 'congres',
      label: 'Congrès confédéral',
      amount: cong,
      detail: 'Salle, hébergement délégués, motions imprimées (tous les 8 tours)'
    });
  }

  const recettes = recettesRaw.map(l => ({ ...l, amount: strategyRound(l.amount, mult.revenu) }));
  const depenses = depensesRaw.map(l => ({ ...l, amount: strategyRound(l.amount, mult.depense) }));

  const totalRecettes = recettes.reduce((s, l) => s + l.amount, 0);
  const totalDepenses = depenses.reduce((s, l) => s + l.amount, 0); // négatif

  return {
    recettes,
    depenses,
    totalRecettes,
    totalDepenses,
    net: totalRecettes + totalDepenses,
    strategy: org.budgetStrategy
  };
}
