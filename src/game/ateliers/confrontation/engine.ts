/* ============================================================
   PARITAS — Atelier "La Rue"
   Police vs Manifestants — 1v1 / 2v2 / 3v3 / 4v4 local.
   ============================================================
   Mécanique : zone cursor (0-100, 50 = centre).
   Chaque round : les deux camps choisissent simultanément
   une action → résolution → la zone se déplace.

   3 rounds. Si zone ≥ 70 → Manifestants contrôlent la place.
   Si zone ≤ 30 → Police disperse le cortège.
   Entre les deux → situation de blocage (résultat nul).

   Multiplayer local : deux moitiés de clavier / d'écran.
   Jamais de serveur, jamais de crash. Pure state machine.
   ============================================================ */

/* ============================================================
   Types
   ============================================================ */

export type Side = 'manif' | 'police';

export type ManifAction =
  | 'tenir'       // tenir la ligne — défensif
  | 'pousser'     // avancer d'un bloc — offensif
  | 'barricade'   // construire une barricade — fortification
  | 'chanter'     // rallier le moral — bonus prochain round
  | 'reculer';    // repli tactique — préserver les troupes

export type PoliceAction =
  | 'bouclier'    // former la ligne de boucliers — défensif
  | 'lacrymo'     // gaz lacrymogène — disperse
  | 'charge'      // charge frontale — offensif
  | 'nasse'       // encerclement — immobilise
  | 'retraite';   // retrait stratégique — regroupe

export type AnyAction = ManifAction | PoliceAction;

export interface ActionDef<T extends AnyAction> {
  id: T;
  label: string;
  icon: string;
  intent: string;
  /** Modificateur brut de zone si aucun contre (positif = vers manif, négatif = vers police) */
  basePush: number;
  /** Clés des actions adverses que cette action BAT (résolution pierre-papier-ciseau) */
  beats: string[];
  /** Modificateur bonus quand on gagne le matchup (+zone) */
  winBonus: number;
  /** Narratif si on gagne le round avec cette action */
  winText: string;
  /** Narratif si on perd le round avec cette action */
  loseText: string;
}

export type RoundResult = {
  manifAction: ManifAction;
  policeAction: PoliceAction;
  /** Δzone (positif = vers manif) */
  delta: number;
  outcome: 'manif_wins' | 'police_wins' | 'draw';
  /** Texte narratif du round */
  story: string;
  zoneAfter: number;
};

export type MatchOutcome = 'manif_victoire' | 'police_victoire' | 'blocage';

export interface ConfrState {
  round: 1 | 2 | 3;
  zone: number;           // 0-100, 50 = centre, 65+ = manif gagne, 35- = police gagne
  phase:
    | 'picking'           // les deux camps choisissent
    | 'result'            // résultat du round affiché
    | 'ended';            // match terminé
  manifPick: ManifAction | null;
  policePick: PoliceAction | null;
  /** Bonus de moral actif (du 'chanter' précédent) */
  manifMoralBonus: number;
  /** CRS renforcés (du 'nasse' précédent) */
  policeNasseBonus: number;
  history: RoundResult[];
  matchOutcome: MatchOutcome | null;
}

/* ============================================================
   Catalogue des actions
   ============================================================ */

/*
   REBALANCEMENT v2 (post-audit Argus) :
   — RECULER : basePush -8→+2, beats ajouté 'retraite', winBonus +8→+12
     → désormais gagne de la zone quand elle bat la nasse (+6)
   — CHANTER : basePush +2→+4, manifMoralBonus 6→12, beats → ['bouclier']
     → donne enfin un counter offensif + bonus moral doublé
   — RETRAITE (police) : basePush +6→-2, beats []→['chanter','barricade'], winBonus +5→+8
     → n'est plus une concession gratuite, punit les défenses statiques
   — BOUCLIER : retire 'chanter' des beats (chanter a déjà 2 autres contre-matchups)
   — CHARGE : winBonus +16→+12 (asymétrie extrême -38 → -24)
   — NASSE : winBonus +14→+10 (paire nasse+lacrymo moins écrasante)
*/
export const MANIF_ACTIONS: ActionDef<ManifAction>[] = [
  {
    id: 'tenir',
    label: 'TENIR',
    icon: '🪧',
    intent: 'Le rang tient. On ne lâche pas.',
    basePush: +5,
    beats: ['charge', 'lacrymo'],
    winBonus: +10,
    winText: 'Le rang absorbe la charge. Les CRS reculent d\'un mètre.',
    loseText: 'La nasse les encercle par les côtés. Le rang craque.'
  },
  {
    id: 'pousser',
    label: 'POUSSER',
    icon: '✊',
    intent: 'Avancer d\'un bloc — la force du nombre.',
    basePush: +12,
    beats: ['bouclier', 'retraite'],
    winBonus: +15,
    winText: 'La foule brise la ligne de boucliers. La place est à nous.',
    loseText: 'Le gaz les arrête net. Les premiers rangs reculent en toussant.'
  },
  {
    id: 'barricade',
    label: 'BARRICADE',
    icon: '🔥',
    intent: 'Fortifier — rendre la place imprenable.',
    basePush: +3,
    beats: ['charge', 'bouclier'],
    winBonus: +12,
    winText: 'Les barricades tiennent. La charge de CRS s\'écrase dessus.',
    loseText: 'La nasse contourne les barricades par le flanc.'
  },
  {
    id: 'chanter',
    label: 'CHANTER',
    icon: '📢',
    /* Seule action qui bat bouclier + donne +12 moral au prochain round.
       Risquée contre lacrymo et charge mais stratégiquement utile. */
    intent: 'Les chants fracturent la ligne immobile — et +12 de moral au prochain round.',
    basePush: +4,
    beats: ['bouclier'],
    winBonus: +10,
    winText: 'Les chants submergent la ligne. Les boucliers vacillent. La foule gonfle.',
    loseText: 'Les slogans se perdent dans les gaz. La foule recule malgré les chants.'
  },
  {
    id: 'reculer',
    label: 'RECULER',
    icon: '↩',
    /* Désormais offensif sur zone neutre : déjoue nasse + retraite.
       Reste vulnérable à charge et bouclier. */
    intent: 'Repli tactique — déjoue la nasse et la retraite feinte.',
    basePush: +2,
    beats: ['nasse', 'retraite'],
    winBonus: +12,
    winText: 'Le repli déjoue l\'encerclement. Les manifestants se regroupent plus loin en ordre.',
    loseText: 'Le repli laisse le terrain à la police. Elle en profite immédiatement.'
  }
];

export const POLICE_ACTIONS: ActionDef<PoliceAction>[] = [
  {
    id: 'bouclier',
    label: 'BOUCLIERS',
    icon: '🛡️',
    /* Retire 'chanter' des beats — chanter avait déjà lacrymo+charge comme counters. */
    intent: 'La ligne tient. On avance mètre par mètre.',
    basePush: -5,
    beats: ['reculer'],
    winBonus: +10,
    winText: 'La ligne de boucliers absorbe le repli. Les CRS avancent d\'un bloc.',
    loseText: 'La foule brise la ligne. Les boucliers volent sous les chants.'
  },
  {
    id: 'lacrymo',
    label: 'LACRYMO',
    icon: '💨',
    intent: 'Disperser — le gaz ouvre le terrain.',
    basePush: -10,
    beats: ['pousser', 'chanter'],
    winBonus: +12,
    winText: 'Les grenades tombent. Les premiers rangs toussent et reculent.',
    loseText: 'Le vent retourne le gaz. Les manifestants tiennent malgré tout.'
  },
  {
    id: 'charge',
    label: 'CHARGER',
    icon: '⚡',
    /* winBonus réduit : +16→+12 pour limiter l'asymétrie extrême (-38→-24) */
    intent: 'Offensive — briser le dispositif par le choc.',
    basePush: -14,
    beats: ['reculer', 'chanter'],
    winBonus: +12,
    winText: 'La charge disperse les rangs en trente secondes.',
    loseText: 'La charge s\'écrase sur les barricades. Des CRS tombent.'
  },
  {
    id: 'nasse',
    label: 'NASSE',
    icon: '⬛',
    /* winBonus réduit : +14→+10 pour affaiblir la paire nasse+lacrymo */
    intent: 'Encercler — piéger et immobiliser.',
    basePush: -8,
    beats: ['tenir', 'barricade'],
    winBonus: +10,
    winText: 'La nasse referme. Des centaines d\'interpellations.',
    loseText: 'Le repli tactique déjoue l\'encerclement. La nasse se vide.'
  },
  {
    id: 'retraite',
    label: 'RETRAITE',
    icon: '↩',
    /* Rebalancée : n'est plus une concession gratuite.
       basePush -2 (neutre), beats chanter+barricade (punit les défenses statiques). */
    intent: 'Feinte — le vide attire, puis on referme sur barricades et chants.',
    basePush: -2,
    beats: ['chanter', 'barricade'],
    winBonus: +8,
    winText: 'La retraite feinte crée un vide. Les barricades s\'effondrent dans l\'avancée.',
    loseText: 'Le repli cède du terrain. Les manifestants occupent la brèche.'
  }
];

/* ============================================================
   Moteur de résolution
   ============================================================ */

export function startConfrSession(): ConfrState {
  return {
    round: 1,
    zone: 50,
    phase: 'picking',
    manifPick: null,
    policePick: null,
    manifMoralBonus: 0,
    policeNasseBonus: 0,
    history: [],
    matchOutcome: null
  };
}

export function pickAction(state: ConfrState, side: Side, action: AnyAction): ConfrState {
  if (state.phase !== 'picking') return state;
  if (side === 'manif') {
    return { ...state, manifPick: action as ManifAction };
  } else {
    return { ...state, policePick: action as PoliceAction };
  }
}

/** Résoudre le round une fois que les deux camps ont choisi. */
export function resolveRound(state: ConfrState): ConfrState {
  const { manifPick, policePick } = state;
  if (!manifPick || !policePick) return state;

  /* Argus IT B-IT7 : garde défensive (fail-fast). */
  const manifDef = MANIF_ACTIONS.find(a => a.id === manifPick);
  const policeDef = POLICE_ACTIONS.find(a => a.id === policePick);
  if (!manifDef || !policeDef) {
    throw new Error(`Confrontation: invalid move (manif=${manifPick}, police=${policePick})`);
  }

  /* Calcul delta zone */
  let delta = manifDef.basePush + policeDef.basePush;

  /* Résolution du matchup */
  const manifBeatsPolice = manifDef.beats.includes(policePick);
  const policeBeatsManif = policeDef.beats.includes(manifPick);

  let outcome: RoundResult['outcome'] = 'draw';
  let story = '';

  if (manifBeatsPolice && !policeBeatsManif) {
    outcome = 'manif_wins';
    delta += manifDef.winBonus;
    delta += state.manifMoralBonus;
    story = manifDef.winText;
  } else if (policeBeatsManif && !manifBeatsPolice) {
    outcome = 'police_wins';
    delta -= policeDef.winBonus;
    delta -= state.policeNasseBonus;
    story = policeDef.winText;
  } else {
    // Draw — les deux textes se neutralisent
    story = `${manifDef.winText.split('.')[0]}... mais ${policeDef.loseText.toLowerCase().split('.')[0]}.`;
  }

  /* Bonus persistants (appliqués au prochain round si manif/police gagne) */
  const newManifMoral = manifPick === 'chanter' ? 12 : 0;   // doublé v2 (audit Argus)
  const newPoliceNasse = policePick === 'nasse' ? 8 : 0;

  const newZone = Math.max(5, Math.min(95, state.zone + delta));
  const roundResult: RoundResult = {
    manifAction: manifPick,
    policeAction: policePick,
    delta,
    outcome,
    story,
    zoneAfter: newZone
  };

  const newHistory = [...state.history, roundResult];

  /* Fin de match si round 3 ou victoire nette */
  const nextRound = state.round < 3 ? (state.round + 1) as 1 | 2 | 3 : 3;
  const isLast = state.round === 3;
  const earlyEnd = newZone >= 90 || newZone <= 10;

  if (isLast || earlyEnd) {
    const matchOutcome = resolveMatchOutcome(newZone);
    return {
      ...state,
      zone: newZone,
      history: newHistory,
      phase: 'ended',
      manifPick: null,
      policePick: null,
      manifMoralBonus: newManifMoral,
      policeNasseBonus: newPoliceNasse,
      matchOutcome,
      round: nextRound
    };
  }

  return {
    ...state,
    round: nextRound,
    zone: newZone,
    history: newHistory,
    phase: 'result',
    manifMoralBonus: newManifMoral,
    policeNasseBonus: newPoliceNasse,
    matchOutcome: null
  };
}

/** Passer au round suivant après avoir vu le résultat. */
export function nextRound(state: ConfrState): ConfrState {
  if (state.phase !== 'result') return state;
  return { ...state, phase: 'picking', manifPick: null, policePick: null };
}

function resolveMatchOutcome(zone: number): MatchOutcome {
  if (zone >= 65) return 'manif_victoire';
  if (zone <= 35) return 'police_victoire';
  return 'blocage';
}

/* ============================================================
   Labels UI
   ============================================================ */

export const MATCH_OUTCOME_LABELS: Record<MatchOutcome, {
  emoji: string;
  title: string;
  subtitle: string;
  manif: string;
  police: string;
}> = {
  manif_victoire: {
    emoji: '✊',
    title: 'LA PLACE EST PRISE',
    subtitle: 'Les manifestants contrôlent la zone.',
    manif: 'Vous avez tenu. La rue vous appartient ce soir.',
    police: 'Les rangs ont cédé. La hiérarchie va appeler.'
  },
  police_victoire: {
    emoji: '🛡️',
    title: 'DISPERSION',
    subtitle: 'La police contrôle le terrain.',
    manif: 'Dispersés. La place est perdue pour ce soir.',
    police: 'Ordre rétabli. Le cortège est contenu.'
  },
  blocage: {
    emoji: '⚖️',
    title: 'FACE-À-FACE',
    subtitle: 'Ni victoire ni défaite — un accord s\'impose.',
    manif: 'La rue tient mais n\'avance pas. On négocie.',
    police: 'La ligne tient mais la pression reste. On négocie.'
  }
};

/* ============================================================
   Helpers pour l'affichage
   ============================================================ */

export function zoneLabel(zone: number): string {
  if (zone >= 65) return 'PLACE PRISE';      // aligné sur resolveMatchOutcome
  if (zone >= 55) return 'Avantage manif';
  if (zone > 45) return 'Légère avance';
  if (zone === 50) return 'Centre';
  if (zone >= 35) return 'Légère pression';  // aligné sur resolveMatchOutcome
  if (zone >= 25) return 'Avantage police';
  return 'DISPERSÉ';
}
