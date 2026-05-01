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
  epargne: { revenu: 1.0, depense: 0.78 },     // -22% de dépenses (gels, économies)
  equilibre: { revenu: 1.0, depense: 1.0 },
  distribution: { revenu: 1.0, depense: 1.18 } // +18% de dépenses (aides, formations)
};

const STRATEGY_LABELS: Record<BudgetStrategy, string> = {
  epargne: 'Épargne',
  equilibre: 'Équilibre',
  distribution: 'Distribution'
};

const STRATEGY_DESCRIPTIONS: Record<BudgetStrategy, string> = {
  epargne:
    'Gels d’embauche, communication contenue, formations reportées. La caisse gonfle, la base grogne.',
  equilibre: 'Régime normal : on dépense ce qui rentre, on ne touche pas aux réserves.',
  distribution:
    'Aide aux grévistes, formations massives, presse à plein. La caisse fond mais la cohésion s’affermit.'
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
  const cotisationRate = org.camp === 'salarie' ? 0.04 : 0.32;
  const cotisations = Math.round(org.membership * cotisationRate);
  if (cotisations > 0) {
    out.push({
      id: 'cotisations',
      label: 'Cotisations adhérents',
      amount: cotisations,
      detail: `${org.membership} ${org.camp === 'salarie' ? 'adhérents' : 'membres'} × ${cotisationRate.toFixed(2).replace('.', ',')}`
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

  return out;
}

/* ========================================================================
   Snapshot final avec multiplicateur de stratégie
   ======================================================================== */

export function computeBudget(org: PlayerOrganization, turn: number): BudgetSnapshot {
  const mult = STRATEGY_MULT[org.budgetStrategy];

  const recettesRaw = computeRecettes(org, turn);
  const depensesRaw = computeDepenses(org);

  const recettes = recettesRaw.map(l => ({ ...l, amount: Math.round(l.amount * mult.revenu) }));
  const depenses = depensesRaw.map(l => ({ ...l, amount: Math.round(l.amount * mult.depense) }));

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
