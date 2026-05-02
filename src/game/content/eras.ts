/* Paritas Rebirth — eras.ts
 * Définition des époques du jeu et du mapping turn → era.
 * Calé sur la chronologie de 00_bibliographie_master.md (§2).
 */

import type { EraId } from '../types';

export interface EraDef {
  id: EraId;
  name: string;
  /** Période historique en clair */
  period: string;
  /** Tour minimum auquel cette ère devient active */
  fromTurn: number;
  /** Première année représentée par cette ère (pour le bandeau temporel). */
  firstYear?: number;
  /** Description courte (mode Réfléchi en intro d'ère) */
  blurb: string;
  /** Mood ambiance UI */
  hue: 'amber' | 'rose' | 'emerald' | 'violet' | 'cyan' | 'slate';
}

/** Liste des ères dans l'ordre chronologique.
 *  Le jeu démarre directement à la Révolution (T1 = 1789). Les ères
 *  pré-révolutionnaires (Antiquité, Moyen Âge) ont été retirées :
 *  elles ne portaient qu'un scénario chacune et sortaient du périmètre
 *  syndical/paritaire moderne. */
export const ERAS: EraDef[] = [
  {
    id: 'revolution',
    name: 'Révolution',
    period: '1789 — 1799',
    fromTurn: 1,
    firstYear: 1789,
    blurb: 'Le décret d\'Allarde abolit les corporations ; la loi Le Chapelier interdit toute coalition.',
    hue: 'rose'
  },
  {
    id: 'xixe',
    name: 'XIXe industriel',
    period: '1800 — 1900',
    fromTurn: 4,
    firstYear: 1800,
    blurb: 'Ligues clandestines, prud\'hommes, Canuts, Ollivier, Waldeck-Rousseau. Le syndicalisme remonte.',
    hue: 'rose'
  },
  {
    id: 'belle_epoque',
    name: 'Belle Époque',
    period: '1900 — 1914',
    fromTurn: 14,
    firstYear: 1900,
    blurb: 'CGT, Charte d\'Amiens. Le syndicalisme révolutionnaire pose son indépendance vis-à-vis des partis.',
    hue: 'emerald'
  },
  {
    id: 'entre_deux_guerres',
    name: 'Entre-deux-guerres',
    period: '1919 — 1939',
    fromTurn: 17,
    firstYear: 1919,
    blurb: 'Conventions collectives 1919. Front populaire 1936. Premier paritarisme ascendant.',
    hue: 'emerald'
  },
  {
    id: 'reconstruction',
    name: 'Reconstruction',
    period: '1944 — 1947',
    fromTurn: 23,
    firstYear: 1944,
    blurb: 'Programme du CNR "Les Jours heureux". Ordonnances Sécurité sociale du 4 octobre 1945.',
    hue: 'violet'
  },
  {
    id: 'guerre_froide',
    name: 'Guerre froide',
    period: '1947 — 1958',
    fromTurn: 25,
    firstYear: 1947,
    blurb: 'Scission CGT / FO. Constitution de FO. Deux confédérations rivales.',
    hue: 'violet'
  },
  {
    id: 'trente_glorieuses',
    name: 'Trente Glorieuses',
    period: '1958 — 1973',
    fromTurn: 29,
    firstYear: 1958,
    blurb: 'Unédic 1958, Jeanneney 1967, Grenelle 1968. Apogée du paritarisme.',
    hue: 'cyan'
  },
  {
    id: 'crise',
    name: 'Crise pétrolière',
    period: '1973 — 1981',
    fromTurn: 35,
    firstYear: 1973,
    blurb: 'Chômage de masse. Patronat cherche à réduire les coûts.',
    hue: 'slate'
  },
  {
    id: 'mitterrand',
    name: 'Mitterrand',
    period: '1981 — 1995',
    fromTurn: 37,
    firstYear: 1981,
    blurb: 'Lois Auroux 1982. Abstention massive 1983. Cohabitations.',
    hue: 'rose'
  },
  {
    id: 'cohabitations',
    name: 'Cohabitations',
    period: '1995 — 2007',
    fromTurn: 45,
    firstYear: 1995,
    blurb: 'Plan Juppé, 35h Aubry, MEDEF Seillière. Refondation sociale.',
    hue: 'slate'
  },
  {
    id: 'sarkozy',
    name: 'Sarkozy',
    period: '2007 — 2012',
    fromTurn: 57,
    firstYear: 2007,
    blurb: 'Loi Larcher. Reprise étatique de la formation professionnelle.',
    hue: 'slate'
  },
  {
    id: 'hollande',
    name: 'Hollande',
    period: '2012 — 2017',
    fromTurn: 63,
    firstYear: 2012,
    blurb: 'Loi El Khomri 2016. Premières inversions de la hiérarchie des normes.',
    hue: 'slate'
  },
  {
    id: 'macron_i',
    name: 'Macron I',
    period: '2017 — 2022',
    fromTurn: 69,
    firstYear: 2017,
    blurb: 'Ordonnances Macron, CSE, "lettre de cadrage" Unédic.',
    hue: 'slate'
  },
  {
    id: 'macron_ii',
    name: 'Macron II',
    period: '2022 — 2026',
    fromTurn: 79,
    firstYear: 2022,
    blurb: 'Réforme retraites 2023. Triple ponction Agirc-Arrco / Action Logement / Unédic.',
    hue: 'slate'
  },
  {
    id: 'present',
    name: 'Présent',
    period: '2026 →',
    fromTurn: 91,
    firstYear: 2026,
    blurb: 'Bras de fer en cours. Le paritarisme à la croisée des chemins.',
    hue: 'amber'
  }
];

/** Renvoie l'ère active pour un tour donné. */
export function eraForTurn(turn: number): EraDef {
  let active = ERAS[0]!;
  for (const e of ERAS) {
    if (turn >= e.fromTurn) active = e;
    else break;
  }
  return active;
}

/** Renvoie la définition d'ère par id, ou la 1re si non trouvée. */
export function eraById(id: EraId): EraDef {
  return ERAS.find(e => e.id === id) ?? ERAS[0]!;
}

/**
 * Nom de la monnaie en circulation pour une ère donnée. Sert à libeller
 * les coûts de la caisse dans l'UI selon la période historique.
 *
 * - Révolution : livres tournois (la livre tournois reste la monnaie de
 *   compte courante jusqu'à l'introduction du franc germinal en l'an III ;
 *   pour la lisibilité du joueur, on la garde sur tout 1789-1799)
 * - 1800 → ~2000 : francs (germinal puis francs anciens, nouveaux francs
 *   à partir de 1960 — on garde "francs" pour ne pas surcharger)
 * - Sarkozy → présent : euros (l'euro fiduciaire entre en circulation
 *   en 2002 mais c'est sous Sarkozy qu'il devient le repère du quotidien)
 */
export function currencyForEra(eraId: EraId): string {
  switch (eraId) {
    case 'revolution':
      return 'livres';
    case 'sarkozy':
    case 'hollande':
    case 'macron_i':
    case 'macron_ii':
    case 'present':
      return 'euros';
    default:
      return 'francs';
  }
}

/** Idem mais singulier (pour les coûts à 1 unité). */
export function currencyForEraSingular(eraId: EraId): string {
  const c = currencyForEra(eraId);
  // sesterces → sesterce, livres → livre, francs → franc, euros → euro
  return c.replace(/s$/, '');
}

/** Libellé d'un coût en monnaie de l'époque ("12 livres", "1 sesterce"…). */
export function formatCurrency(cost: number, eraId: EraId): string {
  const word = Math.abs(cost) === 1 ? currencyForEraSingular(eraId) : currencyForEra(eraId);
  return `${cost} ${word}`;
}

/**
 * Année historique représentée par un tour donné — interpole linéairement
 * entre `firstYear` de l'ère active et `firstYear` de la suivante. Renvoie
 * `null` pour les ères pré-modernes (Antiquité, Moyen Âge) qui s'expriment
 * en siècles.
 */
export function yearForTurn(turn: number): number | null {
  const era = eraForTurn(turn);
  if (era.firstYear === undefined) return null;
  const idx = ERAS.indexOf(era);
  const nextWithYear = ERAS.slice(idx + 1).find(e => e.firstYear !== undefined);
  if (!nextWithYear || nextWithYear.firstYear === undefined) return era.firstYear;
  const span = nextWithYear.fromTurn - era.fromTurn;
  if (span <= 0) return era.firstYear;
  const yearsSpan = nextWithYear.firstYear - era.firstYear;
  const offset = (turn - era.fromTurn) / span;
  return Math.round(era.firstYear + offset * yearsSpan);
}
