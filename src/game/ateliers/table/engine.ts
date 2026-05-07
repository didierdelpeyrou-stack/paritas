/* ============================================================
   PARITAS — Atelier "La Table"
   Salarié vs Patron — négo simultanée, 3 rounds.
   ============================================================
   Mécanique : zone cursor (0-100, 50 = statu quo).
   Chaque round, les deux camps choisissent simultanément
   une posture de table → résolution → la zone se déplace.

   Zone ≥ 65 → Accord ambitieux (salarié gagne)
   Zone 35-64 → Accord a minima (match nul — signé mais faible)
   Zone ≤ 34 → Rupture (patron gagne — aucune concession)

   Équilibre voulu : statu quo LÉGÈREMENT favorable au patron
   (le patron n'a rien à perdre à traîner). Le salarié doit
   créer le rapport de force pour dépasser 65.
   ============================================================ */

export type TableSide = 'salarie' | 'patron';

export type SalarieMove =
  | 'ancrer'        // tenir la position maximale — défensif/offensif
  | 'conceder'      // concession tactique surprise — débloque l'adversaire
  | 'mediatiser'    // exposer à la presse — pression externe
  | 'consulter'     // renouveler le mandat de la base — ressource morale
  | 'rompre';       // menacer la rupture totale — escalade

export type PatronMove =
  | 'maintenir'     // tenir la position sans bouger — attentisme
  | 'symbolique'    // geste symbolique à bas coût — récupération médias
  | 'juridique'     // verrouiller par le droit — cadrage légal
  | 'diviser'       // approcher les syndicats réformistes — coalition
  | 'suspendre';    // suspendre les séances — temporisation

export type AnyTableMove = SalarieMove | PatronMove;

export interface TableActionDef<T extends AnyTableMove> {
  id: T;
  label: string;
  icon: string;
  intent: string;
  basePush: number; // positif = vers accord ambitieux, négatif = vers rupture
  beats: string[];
  winBonus: number;
  winText: string;
  loseText: string;
}

export type TableRoundOutcome = 'salarie_wins' | 'patron_wins' | 'draw';

export interface TableRoundResult {
  salarieMove: SalarieMove;
  patronMove: PatronMove;
  delta: number;
  outcome: TableRoundOutcome;
  story: string;
  zoneAfter: number;
}

export type TableMatchOutcome =
  | 'accord_ambitieux'   // zone ≥ 65 — salarié obtient l'essentiel
  | 'accord_minimal'     // zone 35-64 — signé, mais faible
  | 'rupture';           // zone ≤ 34 — aucun accord

export interface TableState {
  round: 1 | 2 | 3;
  zone: number;
  phase: 'picking' | 'result' | 'ended';
  salariePick: SalarieMove | null;
  patronPick: PatronMove | null;
  salarieMoralBonus: number; // du 'consulter' précédent
  patronJuridiqueBonus: number; // du 'juridique' précédent
  history: TableRoundResult[];
  matchOutcome: TableMatchOutcome | null;
}

/* ============================================================
   Catalogue des actions
   ============================================================ */

/*
   ÉQUILIBRE v1 :
   Le patron part légèrement avantagé (basePush agrégé total : -34 vs +25).
   Le statu quo sans grève favorise l'employeur.
   Le salarié doit remporter les matchups via beats pour franchir 65.

   Zone de départ : 50 (statu quo)
   Seuil victoire salarié : 65   (+15 à gagner en 3 rounds)
   Seuil défaite salarié : 35    (-15 à perdre)
*/

export const SALARIE_MOVES: TableActionDef<SalarieMove>[] = [
  {
    id: 'ancrer',
    label: 'ANCRER',
    icon: '⚓',
    intent: 'Tenir la position maximale — rien ne bouge sans contrepartie réelle.',
    basePush: +8,
    beats: ['symbolique', 'juridique'],
    winBonus: +10,
    winText: 'L\'ancrage tient. Le patronat reconnaît que la position ne bougera pas. Il cherche une sortie.',
    loseText: 'La position rigide est contournée. Les réformistes sont approchés en coulisses.'
  },
  {
    id: 'conceder',
    label: 'CONCÉDER',
    icon: '🤝',
    intent: 'Concession tactique surprise — désarme et débloque.',
    basePush: -4,
    beats: ['suspendre', 'diviser'],
    winBonus: +18,
    winText: 'La concession inattendue coupe l\'herbe sous le pied. La table se débloque à l\'avantage du syndicat.',
    loseText: 'La concession est prise sans contrepartie. Le rapport de force s\'effondre.'
  },
  {
    id: 'mediatiser',
    label: 'MÉDIATISER',
    icon: '📡',
    intent: 'Rendre le conflit visible — la rue entre dans la salle.',
    basePush: +6,
    beats: ['maintenir', 'symbolique'],
    winBonus: +10,
    winText: 'Les caméras arrivent. Le patron ne peut plus maintenir l\'immobilisme en public.',
    loseText: 'La fuite est retournée contre le syndicat. La presse souligne l\'intransigeance.'
  },
  {
    id: 'consulter',
    label: 'CONSULTER',
    icon: '🗣️',
    intent: 'Renouveler le mandat — +10 de force morale au round suivant.',
    basePush: +3,
    beats: ['diviser'],
    winBonus: +8,
    winText: 'La base confirme le mandat. Le syndicat revient avec une légitimité renforcée.',
    loseText: 'La consultation prend du temps. Le cadre juridique se referme pendant ce délai.'
  },
  {
    id: 'rompre',
    label: 'ROMPRE',
    icon: '🚪',
    intent: 'Menacer la sortie totale — escalade ou accord.',
    basePush: +12,
    beats: ['suspendre'],
    winBonus: +12,
    winText: 'La menace de rupture est crédible. Le patron cède sur le point essentiel pour garder la table.',
    loseText: 'La rupture est formalisée. Le cadre légal reprend le dessus.'
  }
];

export const PATRON_MOVES: TableActionDef<PatronMove>[] = [
  {
    id: 'maintenir',
    label: 'MAINTENIR',
    icon: '🏛️',
    intent: 'Aucune concession — laisser le temps travailler.',
    basePush: -6,
    beats: ['conceder', 'consulter'],
    winBonus: +8,
    winText: 'L\'immobilisme paye. Le syndicat tarde, la base s\'impatiente.',
    loseText: 'La position statique est exposée par la presse. Le rapport de force bascule.'
  },
  {
    id: 'symbolique',
    label: 'SYMBOLIQUE',
    icon: '🎭',
    intent: 'Geste visible à faible coût — récupérer les médias.',
    basePush: -3,
    beats: ['rompre', 'consulter'],
    winBonus: +10,
    winText: 'La presse retient le geste. La menace de rupture s\'effondre face à l\'image de bonne volonté.',
    loseText: 'Le geste symbolique est lu comme une faiblesse. L\'ancrage tient.'
  },
  {
    id: 'juridique',
    label: 'JURIDIQUE',
    icon: '📜',
    intent: 'Cadrer par le droit — réduire la marge du syndicat.',
    basePush: -7,
    beats: ['mediatiser', 'rompre'],
    winBonus: +10,
    winText: 'L\'injonction redéfinit les termes légaux. La menace de rupture est rendue coûteuse.',
    loseText: 'Le cadrage juridique est dépassé par l\'ancrage syndical. La position tient.'
  },
  {
    id: 'diviser',
    label: 'DIVISER',
    icon: '✂️',
    intent: 'Approcher les syndicats réformistes — briser l\'unité.',
    basePush: -8,
    beats: ['ancrer', 'mediatiser'],
    winBonus: +10,
    winText: 'Un accord séparé est signé avec les réformistes. L\'unité syndicale se fissure.',
    loseText: 'La tentative de division échoue. La consultation de la base a renforcé l\'unité.'
  },
  {
    id: 'suspendre',
    label: 'SUSPENDRE',
    icon: '⏸️',
    intent: 'Interrompre les séances — temporiser.',
    basePush: -10,
    beats: ['ancrer', 'rompre'],
    winBonus: +12,
    winText: 'La suspension épuise le rapport de force syndical. Le temps travaille pour le patron.',
    loseText: 'La concession inattendue coupe la suspension dans l\'oeuf. La table reprend.'
  }
];

/* ============================================================
   Moteur de résolution
   ============================================================ */

export function startTableSession(): TableState {
  return {
    round: 1,
    zone: 50,
    phase: 'picking',
    salariePick: null,
    patronPick: null,
    salarieMoralBonus: 0,
    patronJuridiqueBonus: 0,
    history: [],
    matchOutcome: null
  };
}

export function pickTableMove(
  state: TableState,
  side: TableSide,
  move: AnyTableMove
): TableState {
  if (state.phase !== 'picking') return state;
  if (side === 'salarie') return { ...state, salariePick: move as SalarieMove };
  return { ...state, patronPick: move as PatronMove };
}

export function resolveTableRound(state: TableState): TableState {
  const { salariePick, patronPick } = state;
  if (!salariePick || !patronPick) return state;

  const salarieDef = SALARIE_MOVES.find(a => a.id === salariePick)!;
  const patronDef = PATRON_MOVES.find(a => a.id === patronPick)!;

  let delta = salarieDef.basePush + patronDef.basePush;

  const salarieBeats = salarieDef.beats.includes(patronPick);
  const patronBeats = patronDef.beats.includes(salariePick);

  let outcome: TableRoundOutcome = 'draw';
  let story = '';

  if (salarieBeats && !patronBeats) {
    outcome = 'salarie_wins';
    delta += salarieDef.winBonus;
    delta += state.salarieMoralBonus;
    story = salarieDef.winText;
  } else if (patronBeats && !salarieBeats) {
    outcome = 'patron_wins';
    delta -= patronDef.winBonus;
    delta -= state.patronJuridiqueBonus;
    story = patronDef.winText;
  } else {
    story = `${salarieDef.winText.split('.')[0]}. Mais ${patronDef.loseText.toLowerCase().split('.')[0]}.`;
  }

  /* Bonus persistants */
  const newSalarieMoral = salariePick === 'consulter' ? 10 : 0;
  const newPatronJuridique = patronPick === 'juridique' ? 6 : 0;

  const newZone = Math.max(5, Math.min(95, state.zone + delta));
  const roundResult: TableRoundResult = {
    salarieMove: salariePick,
    patronMove: patronPick,
    delta,
    outcome,
    story,
    zoneAfter: newZone
  };

  const newHistory = [...state.history, roundResult];
  const nextRound = state.round < 3 ? (state.round + 1) as 1 | 2 | 3 : 3;
  const isLast = state.round === 3;
  const earlyEnd = newZone >= 90 || newZone <= 10;

  if (isLast || earlyEnd) {
    return {
      ...state,
      zone: newZone,
      history: newHistory,
      phase: 'ended',
      salariePick: null,
      patronPick: null,
      salarieMoralBonus: newSalarieMoral,
      patronJuridiqueBonus: newPatronJuridique,
      matchOutcome: resolveTableOutcome(newZone),
      round: nextRound
    };
  }

  return {
    ...state,
    round: nextRound,
    zone: newZone,
    history: newHistory,
    phase: 'result',
    salariePick: null,
    patronPick: null,
    salarieMoralBonus: newSalarieMoral,
    patronJuridiqueBonus: newPatronJuridique,
    matchOutcome: null
  };
}

export function nextTableRound(state: TableState): TableState {
  if (state.phase !== 'result') return state;
  return { ...state, phase: 'picking', salariePick: null, patronPick: null };
}

function resolveTableOutcome(zone: number): TableMatchOutcome {
  if (zone >= 65) return 'accord_ambitieux';
  if (zone >= 35) return 'accord_minimal';
  return 'rupture';
}

/* ============================================================
   Labels UI & V2 effects
   ============================================================ */

export const TABLE_OUTCOME_LABELS: Record<TableMatchOutcome, {
  emoji: string;
  title: string;
  subtitle: string;
  salarie: string;
  patron: string;
}> = {
  accord_ambitieux: {
    emoji: '✍️',
    title: 'ACCORD AMBITIEUX',
    subtitle: 'Le syndicat a arraché l\'essentiel.',
    salarie: 'Salaires, droits, calendrier de mise en œuvre. La base peut rentrer la tête haute.',
    patron: 'Les concessions sont signées. Le texte reste gérable — mais la rue a gagné ce soir.'
  },
  accord_minimal: {
    emoji: '⚖️',
    title: 'ACCORD A MINIMA',
    subtitle: 'Signé, mais personne n\'est vraiment satisfait.',
    salarie: 'Le texte est maigre. La base va murmurer. Mais l\'accord existe — c\'est une base.',
    patron: 'Le minimum concédé. Le rapport de force reste défavorable à court terme.'
  },
  rupture: {
    emoji: '🚪',
    title: 'RUPTURE',
    subtitle: 'La table est rompue. Le conflit reprend une autre forme.',
    salarie: 'La table est vide. Le mouvement social doit trouver un autre levier.',
    patron: 'Aucun accord. Le droit du travail reprend le dessus. La rue peut s\'enflammer.'
  }
};

export function tableZoneLabel(zone: number): string {
  if (zone >= 65) return 'Accord ambitieux';
  if (zone >= 55) return 'Avantage salarié';
  if (zone >= 45) return 'Légère avance';
  if (zone === 50) return 'Statu quo';
  if (zone >= 35) return 'Légère pression';
  if (zone >= 25) return 'Avantage patron';
  return 'RUPTURE';
}

/** Effets V2 — connecté à resolveLaTable() dans gameState.svelte.ts */
export function tableOutcomeToV2Effects(outcome: TableMatchOutcome): {
  confiance: number;
  rapportDeForce: number;
  santeSociale: number;
  legitimite: number;
  caisse: number;
  cohesionInterne: number;
} {
  switch (outcome) {
    case 'accord_ambitieux':
      return { confiance: +12, rapportDeForce: +8, santeSociale: +6, legitimite: +10, caisse: -4, cohesionInterne: +6 };
    case 'accord_minimal':
      return { confiance: +3, rapportDeForce: +2, santeSociale: +2, legitimite: +4, caisse: -2, cohesionInterne: -2 };
    case 'rupture':
      return { confiance: -6, rapportDeForce: -4, santeSociale: -3, legitimite: -5, caisse: +0, cohesionInterne: -4 };
  }
}
