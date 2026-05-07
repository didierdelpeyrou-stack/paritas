/* ============================================================
   PARITAS — Atelier "La Grève"
   Salarié vs Patron — attrition à deux barres de ressources.
   ============================================================
   Mécanique : deux jauges asymétriques + zone de pression.
   Chaque round, les deux camps choisissent simultanément
   une action → résolution → les ressources et la zone évoluent.

   JAUGES :
   - solidarité (salarié) : 0-100, part à 80. ≤ 0 → grève épuisée.
   - production (patron) : 0-100, part à 75. ≤ 0 → cession forcée.
   - zone (pression) : 0-100, part à 50. ≥ 65 → accord favorable.

   5 rounds max.
   SPECIAL : si les deux camps choisissent 'negocier' le même round
   → "Ouverture de négociation" (fin anticipée, meilleure pour tous).

   Asymétrie voulue :
   - Le salarié perd de la solidarité plus vite (coût humain de la grève)
   - Le patron perd de la production plus lentement (réserves financières)
   - Mais le patron peut perdre "soudainement" si l'occupation tient
   ============================================================ */

export type GreveSide = 'salarie' | 'patron';

export type SalarieGreveMove =
  | 'greve_totale'    // grève générale — pression max, coût élevé
  | 'greve_tournante' // grèves ciblées — efficace, économe en solidarité
  | 'caisse'          // caisse de grève — recharge la solidarité
  | 'negocier'        // proposer la table — si patron aussi → ouverture
  | 'occuper';        // occupation d'usine — pression extrême, risky

export type PatronGreveMove =
  | 'lockout'         // lock-out — affame les grévistes
  | 'recruter'        // salariés remplaçants — brise la grève
  | 'juridique'       // injonction légale — attaque la solidarité
  | 'negocier'        // accepter la table — si salarié aussi → ouverture
  | 'conceder';       // concession partielle — améliore la zone

export type AnyGreveMove = SalarieGreveMove | PatronGreveMove;

export interface GreveActionDef<T extends AnyGreveMove> {
  id: T;
  label: string;
  icon: string;
  intent: string;
  /* Deltas de ressources */
  dSolidarite: number;   // Δsolidarité (salarié resource)
  dProduction: number;   // Δproduction (patron resource)
  dZone: number;         // Δzone (pression vers accord)
  /* Matchup : quelles actions adverses cette action BAT */
  beats: string[];
  /** Bonus de zone supplémentaire quand on gagne le matchup */
  winBonus: number;
  winText: string;
  loseText: string;
}

export interface GreveRoundResult {
  salarieMove: SalarieGreveMove;
  patronMove: PatronGreveMove;
  outcome: 'salarie_wins' | 'patron_wins' | 'draw' | 'ouverture';
  story: string;
  dSolidarite: number;
  dProduction: number;
  dZone: number;
  solidariteAfter: number;
  productionAfter: number;
  zoneAfter: number;
}

export type GreveMatchOutcome =
  | 'accord_victorieux'       // zone ≥ 65 ou production épuisée
  | 'accord_partiel'          // zone 40-64, grève tient
  | 'ouverture_negociation'   // double négocier au même round
  | 'echec_greve'             // solidarité épuisée ou zone ≤ 30
  | 'patron_impose';          // production tient, pas d'accord

export interface GreveState {
  round: 1 | 2 | 3 | 4 | 5;
  solidarite: number;          // 0-100
  production: number;          // 0-100
  zone: number;                // 0-100, 50 = départ
  phase: 'picking' | 'result' | 'ended';
  salariePick: SalarieGreveMove | null;
  patronPick: PatronGreveMove | null;
  /** Bonus caisse de grève actif (du 'caisse' précédent) */
  caisseBonus: number;
  history: GreveRoundResult[];
  matchOutcome: GreveMatchOutcome | null;
}

/* ============================================================
   Catalogue des actions
   ============================================================ */

export const SALARIE_GREVE_MOVES: GreveActionDef<SalarieGreveMove>[] = [
  {
    id: 'greve_totale',
    label: 'GRÈVE TOTALE',
    icon: '✊',
    intent: 'Arrêt général — maximum de pression, coût élevé.',
    dSolidarite: -12,
    dProduction: -18,
    dZone: +8,
    beats: ['recruter', 'conceder'],
    winBonus: +10,
    winText: 'L\'arrêt total paralyse. Aucun remplaçant n\'absorbe le choc. Le patron cède du terrain.',
    loseText: 'Le lock-out répond immédiatement. Les grévistes restent dehors sans ressources.'
  },
  {
    id: 'greve_tournante',
    label: 'GRÈVE TOURNANTE',
    icon: '🔄',
    intent: 'Grèves ciblées par service — efficace et économe.',
    dSolidarite: -6,
    dProduction: -14,
    dZone: +5,
    beats: ['lockout', 'juridique'],
    winBonus: +8,
    winText: 'Les grèves ciblées désorganisent sans s\'épuiser. L\'injonction judiciaire ne sait pas où frapper.',
    loseText: 'Les remplaçants absorbent les absences tournantes. L\'impact est dilué.'
  },
  {
    id: 'caisse',
    label: 'CAISSE DE GRÈVE',
    icon: '💰',
    intent: 'Activer les réserves — recharger la solidarité pour tenir.',
    dSolidarite: +18,
    dProduction: -3,
    dZone: +2,
    beats: ['recruter', 'lockout'],
    winBonus: +6,
    winText: 'Les allocations de grève tiennent les militants. Le lock-out ne les affame plus.',
    loseText: 'La caisse soutient la base mais l\'injonction gèle les fonds syndicaux.'
  },
  {
    id: 'negocier',
    label: 'NÉGOCIER',
    icon: '🤝',
    intent: 'Proposer la table — si le patron accepte, accord immédiat.',
    dSolidarite: -2,
    dProduction: -2,
    dZone: +3,
    beats: [],
    winBonus: 0,
    winText: 'Les deux camps s\'assoient. Un accord est possible.',
    loseText: 'La proposition est rejetée. Le rapport de force reprend.'
  },
  {
    id: 'occuper',
    label: 'OCCUPATION',
    icon: '🏭',
    intent: 'Occuper l\'usine — pression maximale, risque maximal.',
    dSolidarite: -10,
    dProduction: -28,
    dZone: +14,
    beats: ['recruter', 'conceder'],
    winBonus: +12,
    winText: 'L\'occupation ferme l\'usine depuis l\'intérieur. Aucun remplaçant n\'entre. La direction capitule.',
    loseText: 'L\'injonction d\'expulsion est exécutée. L\'occupation tombe sous les matraques.'
  }
];

export const PATRON_GREVE_MOVES: GreveActionDef<PatronGreveMove>[] = [
  {
    id: 'lockout',
    label: 'LOCK-OUT',
    icon: '🔒',
    intent: 'Fermer l\'usine — affamer les grévistes.',
    dSolidarite: -16,
    dProduction: -5,
    /* Argus B-MC13 : dZone -8 → -10. Le lock-out doit peser plus
       lourdement en zone (cadrage du conflit côté patron). */
    dZone: -10,
    beats: ['greve_totale', 'occuper'],
    winBonus: +10,
    winText: 'L\'usine est verrouillée. Les grévistes restent dehors sans salaire. La solidarité fond.',
    loseText: 'La grève tournante contourne le lock-out service par service. Il n\'y a pas de périmètre à fermer.'
  },
  {
    id: 'recruter',
    label: 'REMPLAÇANTS',
    icon: '👷',
    intent: 'Embaucher des intérimaires — briser le rapport de force.',
    dSolidarite: -8,
    /* Argus ORDA-002 B-MC9 : dProd +10 → +15 → +18 (itération 2).
       Le déséquilibre venait du fait que les remplaçants ne
       compensaient pas suffisamment la chute de production induite
       par les grèves. Patron_impose restait à 3% (sous cible 5%). */
    dProduction: +18,
    dZone: -6,
    beats: ['negocier', 'caisse'],
    winBonus: +8,
    winText: 'Les remplaçants relancent la production. Le rapport de force du syndicat s\'effondre.',
    loseText: 'La grève totale dépasse la capacité des remplaçants. L\'usine reste bloquée.'
  },
  {
    id: 'juridique',
    label: 'INJONCTION',
    icon: '⚖️',
    intent: 'Saisir la justice — attaquer la légalité de la grève.',
    dSolidarite: -12,
    dProduction: +0,
    /* Argus ORDA-002 B-MC10 : dZone -6 → -10. L'injonction judiciaire
       est un levier de cadrage du conflit, pas seulement un bruit
       légal — son poids en zone doit refléter cette autorité. */
    dZone: -10,
    beats: ['occuper', 'caisse'],
    winBonus: +10,
    winText: 'L\'injonction d\'expulsion est prononcée. La caisse syndicale est saisie provisoirement.',
    loseText: 'La grève tournante légale déjoue l\'injonction — pas de prise pour le juge.'
  },
  {
    id: 'negocier',
    label: 'NÉGOCIER',
    icon: '🤝',
    intent: 'Accepter la table — si le syndicat accepte aussi, accord immédiat.',
    dSolidarite: 0,
    dProduction: -3,
    /* Argus B-MC11 : dZone +2 → -2. Si le patron veut négocier seul
       (le syndicat ayant choisi autre chose), c'est un signe de
       faiblesse côté patron qu'il aurait pu exploiter — la zone
       n'avance pas pour autant côté salarié. */
    dZone: -2,
    beats: [],
    winBonus: 0,
    winText: 'Les deux camps s\'assoient. Un accord est possible.',
    loseText: 'La proposition est rejetée. La grève continue.'
  },
  {
    id: 'conceder',
    label: 'CÉDER PARTIEL',
    icon: '↘️',
    intent: 'Concession partielle — limiter les dégâts, avancer la zone.',
    dSolidarite: 0,
    /* Argus B-MC12 : dProd -8 → -3. Une concession patronale ne devrait
       pas ravager sa propre production — elle équivaut à signer un
       avenant local, pas à fermer l'usine. */
    dProduction: -3,
    dZone: +8,
    beats: ['negocier'],
    winBonus: +0,
    winText: 'La concession est acceptée. La zone de pression s\'améliore sans résoudre le conflit.',
    loseText: 'La concession partielle face à la grève totale est insuffisante. Elle n\'arrête rien.'
  }
];

/* ============================================================
   Moteur
   ============================================================ */

export function startGreveSession(): GreveState {
  return {
    round: 1,
    solidarite: 80,
    production: 75,
    zone: 50,
    phase: 'picking',
    salariePick: null,
    patronPick: null,
    caisseBonus: 0,
    history: [],
    matchOutcome: null
  };
}

export function pickGreveMove(
  state: GreveState,
  side: GreveSide,
  move: AnyGreveMove
): GreveState {
  if (state.phase !== 'picking') return state;
  if (side === 'salarie') return { ...state, salariePick: move as SalarieGreveMove };
  return { ...state, patronPick: move as PatronGreveMove };
}

export function resolveGreveRound(state: GreveState): GreveState {
  const { salariePick, patronPick } = state;
  if (!salariePick || !patronPick) return state;

  /* Cas spécial "ouverture de négociation" */
  if (salariePick === 'negocier' && patronPick === 'negocier') {
    const newZone = Math.min(95, state.zone + 5);
    const roundResult: GreveRoundResult = {
      salarieMove: salariePick,
      patronMove: patronPick,
      outcome: 'ouverture',
      story: 'Les deux camps proposent la table au même moment. Une fenêtre s\'ouvre. Ce n\'est pas la victoire, mais c\'est la fin du conflit direct.',
      dSolidarite: -2,
      dProduction: -3,
      dZone: +5,
      solidariteAfter: Math.max(5, state.solidarite - 2),
      productionAfter: Math.max(5, state.production - 3),
      zoneAfter: newZone
    };
    return {
      ...state,
      solidarite: roundResult.solidariteAfter,
      production: roundResult.productionAfter,
      zone: newZone,
      history: [...state.history, roundResult],
      phase: 'ended',
      salariePick: null,
      patronPick: null,
      matchOutcome: 'ouverture_negociation',
      round: state.round
    };
  }

  /* Argus IT B-IT7 : garde défensive (fail-fast). */
  const salarieDef = SALARIE_GREVE_MOVES.find(a => a.id === salariePick);
  const patronDef = PATRON_GREVE_MOVES.find(a => a.id === patronPick);
  if (!salarieDef || !patronDef) {
    throw new Error(`Grève: invalid move (salarie=${salariePick}, patron=${patronPick})`);
  }

  /* Calcul brut */
  let dSol = salarieDef.dSolidarite + patronDef.dSolidarite;
  let dProd = salarieDef.dProduction + patronDef.dProduction;
  let dZone = salarieDef.dZone + patronDef.dZone;

  /* Matchup beats */
  const salarieBeats = salarieDef.beats.includes(patronPick);
  const patronBeats = patronDef.beats.includes(salariePick);

  let outcome: GreveRoundResult['outcome'] = 'draw';
  let story = '';

  if (salarieBeats && !patronBeats) {
    outcome = 'salarie_wins';
    dZone += salarieDef.winBonus;
    dZone += state.caisseBonus;
    story = salarieDef.winText;
  } else if (patronBeats && !salarieBeats) {
    outcome = 'patron_wins';
    dZone -= patronDef.winBonus;
    story = patronDef.winText;
  } else {
    story = `Choc équilibré. ${salarieDef.winText.split('.')[0]}. Mais ${patronDef.loseText.toLowerCase().split('.')[0]}.`;
  }

  const newSol = Math.max(0, Math.min(100, state.solidarite + dSol));
  const newProd = Math.max(0, Math.min(100, state.production + dProd));
  const newZone = Math.max(5, Math.min(95, state.zone + dZone));

  const roundResult: GreveRoundResult = {
    salarieMove: salariePick,
    patronMove: patronPick,
    outcome,
    story,
    dSolidarite: dSol,
    dProduction: dProd,
    dZone,
    solidariteAfter: newSol,
    productionAfter: newProd,
    zoneAfter: newZone
  };

  const newHistory = [...state.history, roundResult];
  const newCaisseBonus = salariePick === 'caisse' ? 8 : 0;

  /* Conditions de fin anticipée */
  const salarieCollapse = newSol <= 10;
  const patronForced = newProd <= 10;
  const nextRound = state.round < 5 ? (state.round + 1) as 1|2|3|4|5 : 5;
  const isLast = state.round === 5;

  if (isLast || salarieCollapse || patronForced || newZone >= 90 || newZone <= 10) {
    const matchOutcome = resolveGreveOutcome(newZone, newSol, newProd);
    return {
      ...state,
      solidarite: newSol,
      production: newProd,
      zone: newZone,
      history: newHistory,
      phase: 'ended',
      salariePick: null,
      patronPick: null,
      caisseBonus: newCaisseBonus,
      matchOutcome,
      round: nextRound
    };
  }

  return {
    ...state,
    round: nextRound,
    solidarite: newSol,
    production: newProd,
    zone: newZone,
    history: newHistory,
    phase: 'result',
    salariePick: null,
    patronPick: null,
    caisseBonus: newCaisseBonus,
    matchOutcome: null
  };
}

export function nextGreveRound(state: GreveState): GreveState {
  if (state.phase !== 'result') return state;
  return { ...state, phase: 'picking', salariePick: null, patronPick: null };
}

function resolveGreveOutcome(zone: number, sol: number, prod: number): GreveMatchOutcome {
  if (prod <= 10) return 'accord_victorieux';    // patron forcé
  if (sol <= 10) return 'echec_greve';           // grève s'effondre
  if (zone >= 65) return 'accord_victorieux';
  if (zone >= 40) return 'accord_partiel';
  if (zone <= 30) return 'echec_greve';
  return 'patron_impose';
}

/* ============================================================
   Labels UI
   ============================================================ */

export const GREVE_OUTCOME_LABELS: Record<GreveMatchOutcome, {
  emoji: string;
  title: string;
  subtitle: string;
  salarie: string;
  patron: string;
}> = {
  accord_victorieux: {
    emoji: '✊',
    title: 'VICTOIRE SYNDICALE',
    subtitle: 'La grève a forcé la concession.',
    salarie: 'Les revendications sont obtenues. La base rentre avec des droits nouveaux.',
    patron: 'La pression était insoutenable. La concession est actée. Les coûts du conflit s\'évaluent dans les comptes.'
  },
  accord_partiel: {
    emoji: '⚖️',
    title: 'ACCORD PARTIEL',
    subtitle: 'La grève tient. Un compromis acceptable est trouvé.',
    salarie: 'Ni tout ni rien. L\'accord partiel préserve le rapport de force pour la suite.',
    patron: 'Le compromis limite les dégâts. La production reprend mais les revendications restent latentes.'
  },
  ouverture_negociation: {
    emoji: '🤝',
    title: 'OUVERTURE',
    subtitle: 'Les deux camps ont demandé la table au même moment.',
    salarie: 'C\'est rarement là que ça se passe — mais c\'est possible. La table reprend.',
    patron: 'L\'escalade aurait coûté plus. La table est une sortie honorable pour les deux camps.'
  },
  echec_greve: {
    emoji: '📉',
    title: 'GRÈVE ÉPUISÉE',
    subtitle: 'La solidarité s\'est effondrée avant les concessions.',
    salarie: 'Les caisses sont vides, les militants épuisés. La reprise du travail se fait sans gain.',
    patron: 'La grève s\'est essoufflée. La production reprend. Mais la mémoire reste dans les rangs.'
  },
  patron_impose: {
    emoji: '🏛️',
    title: 'STATU QUO PATRONAL',
    subtitle: 'Le rapport de force n\'a pas suffi.',
    salarie: 'Le conflit se termine sans gain réel. Le rapport de force est à reconstruire.',
    patron: 'L\'ordre préexistant tient. Mais les conditions qui ont produit le conflit sont intactes.'
  }
};

export function greveOutcomeToV2Effects(outcome: GreveMatchOutcome): {
  confiance: number;
  rapportDeForce: number;
  santeSociale: number;
  legitimite: number;
  caisse: number;
  cohesionInterne: number;
} {
  switch (outcome) {
    case 'accord_victorieux':
      return { confiance: +10, rapportDeForce: +12, santeSociale: -8, legitimite: +6, caisse: -8, cohesionInterne: +8 };
    case 'accord_partiel':
      return { confiance: +4, rapportDeForce: +4, santeSociale: -5, legitimite: +3, caisse: -5, cohesionInterne: +2 };
    case 'ouverture_negociation':
      return { confiance: +6, rapportDeForce: +2, santeSociale: -3, legitimite: +8, caisse: -3, cohesionInterne: +4 };
    case 'echec_greve':
      return { confiance: -8, rapportDeForce: -8, santeSociale: -10, legitimite: -4, caisse: -6, cohesionInterne: -8 };
    case 'patron_impose':
      return { confiance: -4, rapportDeForce: -5, santeSociale: -4, legitimite: -2, caisse: -4, cohesionInterne: -4 };
  }
}
