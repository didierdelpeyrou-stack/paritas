/* ============================================================
   PARITAS — Atelier "Les Élections Professionnelles"
   Salarié vs Patron — allocation cachée sur 4 canaux, 3 scrutins.
   ============================================================
   Mécanique : "hidden allocation" simultanée.
   Chaque scrutin, les deux camps disposent de 8 tokens à répartir
   sur 4 canaux de campagne. Dévoilement simultané.
   Qui dépense plus sur un canal l'emporte et gagne ses sièges.
   Égalité sur un canal → canaux partagés (0 siège pour les deux).

   CANAUX & VALEURS (sièges CSE) :
   - Terrain  : 3 sièges (contact direct, le plus cher stratégiquement)
   - Réunions : 2 sièges
   - Affiches : 1 siège
   - Tractage : 1 siège
   Total disponible par scrutin : 7 sièges.

   3 scrutins → 21 sièges totaux.
   Majorité absolue = 11 sièges.

   ÉQUILIBRE :
   Si les deux camps allouent de manière identique → toujours ex-æquo.
   La valeur inégale des canaux crée une tension de coordination :
   vouloir "Terrain" est rationnel → les deux le veulent → conflit.
   Anticiper l'adversaire et feinter sur les canaux secondaires.
   ============================================================ */

export type ElectionSide = 'salarie' | 'patron';
export type Channel = 'terrain' | 'reunions' | 'affiches' | 'tractage';

export const CHANNEL_SEATS: Record<Channel, number> = {
  terrain:  3,
  reunions: 2,
  affiches: 1,
  tractage: 1
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  terrain:  'Contact terrain',
  reunions: 'Réunions d\'usine',
  affiches: 'Affichage',
  tractage: 'Tractage'
};

export const CHANNEL_ICONS: Record<Channel, string> = {
  terrain:  '🤝',
  reunions: '🎙️',
  affiches: '📋',
  tractage: '📄'
};

export const CHANNEL_DESCRIPTIONS: Record<Channel, string> = {
  terrain:  '3 sièges — le contact direct a le plus de poids.',
  reunions: "2 sièges — mobiliser les ateliers l'un après l'autre.",
  affiches: "1 siège — visibilité dans l'espace de travail.",
  tractage: '1 siège — la masse de papier compte moins mais existe.'
};

export type Allocation = Record<Channel, number>;

export const BUDGET_PER_ROUND = 8;
export const ALL_CHANNELS: Channel[] = ['terrain', 'reunions', 'affiches', 'tractage'];

export interface ChannelResult {
  channel: Channel;
  salarieAlloc: number;
  patronAlloc: number;
  winner: ElectionSide | 'egalite';
  seats: number; // sièges remportés par le gagnant (0 si égalité)
}

export interface ScrutinResult {
  round: 1 | 2 | 3;
  salarieAlloc: Allocation;
  patronAlloc: Allocation;
  channels: ChannelResult[];
  salarieSeats: number;
  patronSeats: number;
  narrative: string;
}

export type ElectionMatchOutcome =
  | 'salarie_majorite'   // salarié ≥ 11 sièges
  | 'patron_majorite'    // patron ≥ 11 sièges
  | 'parite';            // égalité parfaite ou personne n'atteint 11

export interface ElectionState {
  round: 1 | 2 | 3;
  phase: 'allocating' | 'result' | 'ended';
  salarieAlloc: Allocation | null;
  patronAlloc: Allocation | null;
  salarieTotal: number;  // sièges cumulés
  patronTotal: number;
  history: ScrutinResult[];
  matchOutcome: ElectionMatchOutcome | null;
}

/* ============================================================
   Moteur
   ============================================================ */

export function startElectionSession(): ElectionState {
  return {
    round: 1,
    phase: 'allocating',
    salarieAlloc: null,
    patronAlloc: null,
    salarieTotal: 0,
    patronTotal: 0,
    history: [],
    matchOutcome: null
  };
}

export function emptyAllocation(): Allocation {
  return { terrain: 0, reunions: 0, affiches: 0, tractage: 0 };
}

export function totalAllocation(alloc: Allocation): number {
  return ALL_CHANNELS.reduce((s, c) => s + alloc[c], 0);
}

export function setElectionAlloc(
  state: ElectionState,
  side: ElectionSide,
  alloc: Allocation
): ElectionState {
  if (state.phase !== 'allocating') return state;
  /* Validation : total ≤ BUDGET_PER_ROUND, valeurs ≥ 0 */
  if (totalAllocation(alloc) > BUDGET_PER_ROUND) return state;
  if (ALL_CHANNELS.some(c => alloc[c] < 0)) return state;
  if (side === 'salarie') return { ...state, salarieAlloc: alloc };
  return { ...state, patronAlloc: alloc };
}

export function resolveScrutin(state: ElectionState): ElectionState {
  const { salarieAlloc, patronAlloc } = state;
  if (!salarieAlloc || !patronAlloc) return state;

  const channels: ChannelResult[] = ALL_CHANNELS.map(channel => {
    const sA = salarieAlloc[channel];
    const pA = patronAlloc[channel];
    const seats = CHANNEL_SEATS[channel];
    if (sA > pA) return { channel, salarieAlloc: sA, patronAlloc: pA, winner: 'salarie', seats };
    if (pA > sA) return { channel, salarieAlloc: sA, patronAlloc: pA, winner: 'patron', seats };
    return { channel, salarieAlloc: sA, patronAlloc: pA, winner: 'egalite', seats: 0 };
  });

  const sSeats = channels.filter(c => c.winner === 'salarie').reduce((s, c) => s + c.seats, 0);
  const pSeats = channels.filter(c => c.winner === 'patron').reduce((s, c) => s + c.seats, 0);

  const scrutinResult: ScrutinResult = {
    round: state.round,
    salarieAlloc,
    patronAlloc,
    channels,
    salarieSeats: sSeats,
    patronSeats: pSeats,
    narrative: composeScrutinNarrative(channels, sSeats, pSeats)
  };

  const newSalarieTotal = state.salarieTotal + sSeats;
  const newPatronTotal = state.patronTotal + pSeats;
  const newHistory = [...state.history, scrutinResult];

  const nextRound = state.round < 3 ? (state.round + 1) as 1|2|3 : 3;
  const isLast = state.round === 3;

  /* Victoire anticipée : si un camp atteint 11 avant le round 3 */
  const salarieWins = newSalarieTotal >= 11;
  const patronWins = newPatronTotal >= 11;

  if (isLast || salarieWins || patronWins) {
    const matchOutcome = resolveElectionOutcome(newSalarieTotal, newPatronTotal);
    return {
      ...state,
      salarieTotal: newSalarieTotal,
      patronTotal: newPatronTotal,
      history: newHistory,
      phase: 'ended',
      salarieAlloc: null,
      patronAlloc: null,
      matchOutcome,
      round: nextRound
    };
  }

  return {
    ...state,
    round: nextRound,
    salarieTotal: newSalarieTotal,
    patronTotal: newPatronTotal,
    history: newHistory,
    phase: 'result',
    salarieAlloc: null,
    patronAlloc: null,
    matchOutcome: null
  };
}

export function nextScrutin(state: ElectionState): ElectionState {
  if (state.phase !== 'result') return state;
  return { ...state, phase: 'allocating', salarieAlloc: null, patronAlloc: null };
}

function resolveElectionOutcome(sSeats: number, pSeats: number): ElectionMatchOutcome {
  if (sSeats >= 11) return 'salarie_majorite';
  if (pSeats >= 11) return 'patron_majorite';
  return 'parite';
}

function composeScrutinNarrative(channels: ChannelResult[], sSeats: number, pSeats: number): string {
  const terrainWinner = channels.find(c => c.channel === 'terrain')?.winner;
  if (terrainWinner === 'salarie') {
    return `Le terrain a basculé côté syndicat. ${sSeats} sièges remportés ce scrutin contre ${pSeats}.`;
  }
  if (terrainWinner === 'patron') {
    return `La liste patronale a écrasé le terrain. ${pSeats} sièges contre ${sSeats}.`;
  }
  if (sSeats > pSeats) {
    return `Pas de victoire sur le terrain, mais les canaux secondaires ont penché pour le syndicat. ${sSeats} vs ${pSeats}.`;
  }
  if (pSeats > sSeats) {
    return `Le terrain est partagé, mais la liste patronale s'impose sur les canaux secondaires. ${pSeats} vs ${sSeats}.`;
  }
  return `Scrutin équilibré : mêmes investissements, mêmes résultats. ${sSeats} sièges chacun.`;
}

/* ============================================================
   IA simple — mixed strategy avec biais adaptatif
   ============================================================ */

/**
 * Allocation IA selon le score courant.
 * Stratégie : si en retard → surpuissance sur terrain.
 * Si en avance → défense des canaux à faible valeur.
 * Toujours un peu de bruit pour éviter la prédictibilité.
 */
export function aiElectionAlloc(
  state: ElectionState,
  side: ElectionSide
): Allocation {
  const myScore = side === 'salarie' ? state.salarieTotal : state.patronTotal;
  const oppScore = side === 'salarie' ? state.patronTotal : state.salarieTotal;
  const lead = myScore - oppScore;

  /* Base : répartition sur terrain et réunions */
  let terrain = 4;
  let reunions = 2;
  let affiches = 1;
  let tractage = 1;

  if (lead < -3) {
    /* En retard → tout sur terrain */
    terrain = 6;
    reunions = 2;
    affiches = 0;
    tractage = 0;
  } else if (lead > 3) {
    /* En avance → défendre les petits canaux, feinter terrain */
    terrain = 2;
    reunions = 2;
    affiches = 2;
    tractage = 2;
  } else {
    /* Équilibré → légère variation aléatoire */
    const noise = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
    terrain = Math.max(1, Math.min(6, terrain + noise));
    reunions = Math.max(0, Math.min(4, reunions - noise));
  }

  /* Normaliser au budget */
  const total = terrain + reunions + affiches + tractage;
  if (total > BUDGET_PER_ROUND) {
    terrain = Math.max(0, terrain - (total - BUDGET_PER_ROUND));
  }

  return { terrain, reunions, affiches, tractage };
}

/* ============================================================
   Labels UI & V2 effects
   ============================================================ */

export const ELECTION_OUTCOME_LABELS: Record<ElectionMatchOutcome, {
  emoji: string;
  title: string;
  subtitle: string;
  salarie: string;
  patron: string;
}> = {
  salarie_majorite: {
    emoji: '🗳️',
    title: 'MAJORITÉ SYNDICALE',
    subtitle: 'Le syndicat contrôle le CSE.',
    salarie: 'La légitimité institutionnelle est acquise. Le CSE est un levier de négociation.',
    patron: 'La liste syndicale a la majorité. Les consultations obligatoires deviennent une contrainte.'
  },
  patron_majorite: {
    emoji: '📋',
    title: 'LISTE PATRONALE MAJORITAIRE',
    subtitle: 'La liste proche de la direction contrôle le CSE.',
    salarie: 'La défaite électorale affaiblit le mandat syndical. Il faut reconstruire le terrain.',
    patron: 'La liste proche est majoritaire. Les votes consultatifs sont maîtrisés.'
  },
  parite: {
    emoji: '⚖️',
    title: 'PARITÉ',
    subtitle: 'Aucune majorité absolue — gouvernance paritaire de fait.',
    salarie: 'Sans majorité, le rapport de force en séance devient l\'enjeu central.',
    patron: 'Sans majorité adverse, chaque vote est une négociation. Le paritarisme s\'impose.'
  }
};

export function electionOutcomeToV2Effects(outcome: ElectionMatchOutcome): {
  confiance: number;
  rapportDeForce: number;
  santeSociale: number;
  legitimite: number;
  caisse: number;
  cohesionInterne: number;
} {
  switch (outcome) {
    case 'salarie_majorite':
      return { confiance: +8, rapportDeForce: +6, santeSociale: +3, legitimite: +14, caisse: -3, cohesionInterne: +6 };
    case 'patron_majorite':
      return { confiance: -6, rapportDeForce: -4, santeSociale: -2, legitimite: -10, caisse: -2, cohesionInterne: -4 };
    case 'parite':
      return { confiance: +2, rapportDeForce: +1, santeSociale: +1, legitimite: +4, caisse: -2, cohesionInterne: +2 };
  }
}
