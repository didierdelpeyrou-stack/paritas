/* ============================================================
   PARITAS — Atelier "La Place"
   Fusion BrawlArena + ManifSimulator en expérience épurée.
   ============================================================
   3 actes × 1 décision. Zéro setup, défouloir pur.
   Peut s'instancier standalone (/mini/place) ou embedded V2.

   Modèle :
   - escalade (0-100) : tension dans la rue → police au seuil 60
   - foule (0-100)    : mobilisation effective → vicoire si foule > 40
   - Chaque acte : le joueur choisit UNE action parmi 3-4
   - Résolution après l'acte 3 (ou plus tôt si escalade = 100)

   Sorties → effets V2 (confiance, rapportDeForce, santeSociale…)
   ============================================================ */

export type ActionId = 'tenir' | 'pousser' | 'forcer' | 'reculer';

export interface PlaceAction {
  id: ActionId;
  label: string;
  icon: string;
  /** Une phrase d'intention courte */
  intent: string;
  /** Delta escalade */
  deltaEscalade: number;
  /** Delta foule */
  deltaFoule: number;
  /** Texte narratif résultant */
  narrative: string;
}

export type PlaceOutcome =
  | 'victoire'      // foule > 50, escalade < 60 → manif pacifique gagnée
  | 'compromis'     // foule > 30, escalade 60-79 → dispersée mais accord
  | 'repression'    // escalade ≥ 100 → CRS charge
  | 'abandon';      // foule < 20 → bases déçues

export interface PlaceAct {
  num: 1 | 2 | 3;
  title: string;
  setup: string;
  policePresent: boolean;
  actions: PlaceAction[];
}

export interface PlaceHistory {
  act: number;
  action: ActionId;
  deltaEscalade: number;
  deltaFoule: number;
  narrative: string;
}

export interface PlaceState {
  act: 1 | 2 | 3;
  escalade: number;     // 0-100
  foule: number;        // 0-100
  history: PlaceHistory[];
  phase: 'playing' | 'ended';
  outcome: PlaceOutcome | null;
  policeArrived: boolean;
}

/* ============================================================
   Définition des actes
   ============================================================ */

const ACT_1: PlaceAct = {
  num: 1,
  title: 'RASSEMBLEMENT',
  setup: 'La place se remplit. Les premiers rangs tiennent l\'avenue. Les drapeaux claquent.',
  policePresent: false,
  actions: [
    {
      id: 'tenir',
      label: 'Tenir le rang',
      icon: '🪧',
      intent: 'Discipliner la foule — signal fort de cohérence.',
      deltaEscalade: -5,
      deltaFoule: +5,
      narrative: 'Les délégués serrent les rangs. Le cortège avance uni, digne. Les flics reculent d\'un mètre.'
    },
    {
      id: 'pousser',
      label: 'Pousser le cortège',
      icon: '✊',
      intent: 'Accélérer le mouvement — occuper l\'espace.',
      deltaEscalade: +15,
      deltaFoule: +12,
      narrative: 'La foule pousse en avant. Les chants montent d\'un cran. Des CRS en ligne regardent.'
    },
    {
      id: 'forcer',
      label: 'Forcer le barrage',
      icon: '⚡',
      intent: 'Rupture — occuper la place coûte que coûte.',
      deltaEscalade: +28,
      deltaFoule: +18,
      narrative: 'Les premiers rangs forcent les barrières de béton. La tension explose. Les caméras s\'allument.'
    },
    {
      id: 'reculer',
      label: 'Ordonner le recul',
      icon: '↩',
      intent: 'Stratégie — conserver les troupes pour plus tard.',
      deltaEscalade: -12,
      deltaFoule: -8,
      narrative: 'Tu ordonnes le recul tactique. Des militants grognent. La foule perd dix pas, mais reste soudée.'
    }
  ]
};

const ACT_2_SANS_POLICE: PlaceAct = {
  num: 2,
  title: 'LA CONFRONTATION',
  setup: 'L\'heure tourne. La préfecture observe. Dans la rue, le ton monte.',
  policePresent: false,
  actions: [
    {
      id: 'tenir',
      label: 'Tenir la ligne',
      icon: '🪧',
      intent: 'Ne pas lâcher — l\'endurance comme arme.',
      deltaEscalade: -8,
      deltaFoule: +6,
      narrative: 'Les rangs se resserrent encore. Personne ne bouge. La presse photographie.'
    },
    {
      id: 'pousser',
      label: 'Avancer',
      icon: '✊',
      intent: 'Progresser — chaque mètre compte.',
      deltaEscalade: +20,
      deltaFoule: +15,
      narrative: 'La foule avance d\'un bloc. Les badauds rejoignent les rangs. La police se réorganise.'
    },
    {
      id: 'forcer',
      label: 'Occuper la place',
      icon: '⚡',
      intent: 'Tout ou rien — prendre la place physiquement.',
      deltaEscalade: +35,
      deltaFoule: +20,
      narrative: 'Vous occupez la place. Les lacrymogènes s\'allument. Le choc est là.'
    },
    {
      id: 'reculer',
      label: 'Pause — tract',
      icon: '↩',
      intent: 'Reprendre souffle, relancer la mobilisation.',
      deltaEscalade: -15,
      deltaFoule: +2,
      narrative: 'Une pause. Les militants distribuent des tracts. La tension redescend. La manif dure.'
    }
  ]
};

const ACT_2_AVEC_POLICE: PlaceAct = {
  num: 2,
  title: 'LA POLICE ARRIVE',
  setup: 'Les bus de CRS se garent. Casques et boucliers. La préfecture a décidé.',
  policePresent: true,
  actions: [
    {
      id: 'tenir',
      label: 'Tenir sans violence',
      icon: '🪧',
      intent: 'Résistance pacifique — la légitimité comme bouclier.',
      deltaEscalade: +5,
      deltaFoule: +4,
      narrative: 'Assis par terre, bras liés. Les flashes crépitent. La préfecture hésite à charger.'
    },
    {
      id: 'pousser',
      label: 'Faire face',
      icon: '✊',
      intent: 'Ne pas reculer — l\'affrontement comme signal.',
      deltaEscalade: +25,
      deltaFoule: +8,
      narrative: 'Vous faites face aux boucliers. Les gaz arrivent. Quelques blessés légers. L\'opinion vacille.'
    },
    {
      id: 'forcer',
      label: 'Charger les lignes',
      icon: '⚡',
      intent: 'Rupture totale — la rue contre l\'État.',
      deltaEscalade: +40,
      deltaFoule: +10,
      narrative: 'La charge est donnée. Matraques, gaz, pavés. La ville brûle pour une heure.'
    },
    {
      id: 'reculer',
      label: 'Se replier proprement',
      icon: '↩',
      intent: 'Préserver les troupes — la rue sera pour demain.',
      deltaEscalade: -20,
      deltaFoule: -12,
      narrative: 'Tu ordonnes le repli. La manif se disperse sans casse. Demain sera un autre jour.'
    }
  ]
};

const ACT_3_NORMAL: PlaceAct = {
  num: 3,
  title: 'LE DÉNOUEMENT',
  setup: 'C\'est la dernière heure. Ce que tu décides maintenant reste dans les mémoires.',
  policePresent: false,
  actions: [
    {
      id: 'tenir',
      label: 'Clôturer dignement',
      icon: '🪧',
      intent: 'Finir fort — le discours de fin est une arme.',
      deltaEscalade: -10,
      deltaFoule: +8,
      narrative: 'Le discours de clôture. Les delégués signent le cahier de revendications. La journée est dans les livres.'
    },
    {
      id: 'pousser',
      label: 'Marcher sur la préfecture',
      icon: '✊',
      intent: 'Ultime pression — forcer la réponse politique.',
      deltaEscalade: +20,
      deltaFoule: +15,
      narrative: 'Dix mille personnes devant la préfecture. Le préfet sort. Il promet une réunion dans 48h.'
    },
    {
      id: 'forcer',
      label: 'Occuper la nuit',
      icon: '⚡',
      intent: 'Bivouac — la résistance continue après le coucher du soleil.',
      deltaEscalade: +30,
      deltaFoule: +12,
      narrative: 'Les tentes s\'installent. L\'occupation est déclarée. Les CRS reviendront à l\'aube.'
    },
    {
      id: 'reculer',
      label: 'Rentrer — préparer la suite',
      icon: '↩',
      intent: 'Stratégie longue — cette manif était une répétition.',
      deltaEscalade: -15,
      deltaFoule: -5,
      narrative: 'Tu rentres. Tu convies les délégués pour demain matin 8h. La vraie bataille commence.'
    }
  ]
};

const ACT_3_REPRESSION: PlaceAct = {
  num: 3,
  title: 'L\'ÉTAT D\'URGENCE',
  setup: 'Les CRS ont chargé. Le gaz lacrymo flotte encore. Il faut choisir vite.',
  policePresent: true,
  actions: [
    {
      id: 'tenir',
      label: 'Résister sans céder',
      icon: '🪧',
      intent: 'Tenir malgré les coups — la dignité comme victoire.',
      deltaEscalade: +10,
      deltaFoule: +5,
      narrative: 'Des militants restent debout sous les matraques. L\'image fait le tour du monde.'
    },
    {
      id: 'pousser',
      label: 'Contre-offensive',
      icon: '✊',
      intent: 'Repousser la police — l\'honneur de la rue.',
      deltaEscalade: +30,
      deltaFoule: +8,
      narrative: 'Les rangs ripostent. Les forces reculent d\'un carré. Mais les renforts arrivent.'
    },
    {
      id: 'forcer',
      label: 'Incendier les barricades',
      icon: '⚡',
      intent: 'Aller jusqu\'au bout — quoi qu\'il en coûte.',
      deltaEscalade: +50,
      deltaFoule: +5,
      narrative: 'Le brasier monte. Les images dureront. Mais la répression sera totale demain matin.'
    },
    {
      id: 'reculer',
      label: 'Évacuer les blessés',
      icon: '↩',
      intent: 'Humanité — les corps avant la victoire.',
      deltaEscalade: -25,
      deltaFoule: -10,
      narrative: 'Tu ordonnes l\'évacuation. Les ambulances passent. La préfecture accepte un couloir humanitaire.'
    }
  ]
};

/* ============================================================
   API publique
   ============================================================ */

export function startPlaceSession(): PlaceState {
  return {
    act: 1,
    escalade: 20,
    foule: 30,
    history: [],
    phase: 'playing',
    outcome: null,
    policeArrived: false
  };
}

export function getCurrentAct(state: PlaceState): PlaceAct {
  const police = state.policeArrived;

  if (state.act === 1) return ACT_1;
  if (state.act === 2) return police ? ACT_2_AVEC_POLICE : ACT_2_SANS_POLICE;
  return police ? ACT_3_REPRESSION : ACT_3_NORMAL;
}

export function applyAction(state: PlaceState, actionId: ActionId): PlaceState {
  const act = getCurrentAct(state);
  const action = act.actions.find(a => a.id === actionId);
  if (!action || state.phase === 'ended') return state;

  const newEscalade = Math.min(100, Math.max(0, state.escalade + action.deltaEscalade));
  const newFoule = Math.min(100, Math.max(0, state.foule + action.deltaFoule));

  // Police déclenche à 60+ en fin d'acte 1
  const policeArrived = state.policeArrived || (state.act === 1 && newEscalade >= 60);

  const newHistory: PlaceHistory[] = [
    ...state.history,
    {
      act: state.act,
      action: actionId,
      deltaEscalade: action.deltaEscalade,
      deltaFoule: action.deltaFoule,
      narrative: action.narrative
    }
  ];

  // Fin immédiate si escalade = 100
  if (newEscalade >= 100) {
    return {
      ...state,
      escalade: 100,
      foule: newFoule,
      history: newHistory,
      phase: 'ended',
      outcome: 'repression',
      policeArrived: true
    };
  }

  // Fin de l'acte 3 → calcul outcome
  if (state.act === 3) {
    const outcome = resolveOutcome(newEscalade, newFoule, newHistory);
    return {
      ...state,
      act: 3,
      escalade: newEscalade,
      foule: newFoule,
      history: newHistory,
      phase: 'ended',
      outcome,
      policeArrived
    };
  }

  // Passage à l'acte suivant
  const nextAct = (state.act + 1) as 2 | 3;
  return {
    ...state,
    act: nextAct,
    escalade: newEscalade,
    foule: newFoule,
    history: newHistory,
    phase: 'playing',
    outcome: null,
    policeArrived
  };
}

function resolveOutcome(escalade: number, foule: number, history: PlaceHistory[]): PlaceOutcome {
  if (escalade >= 80) return 'repression';

  // Décrochage explicite : foule effondrée
  if (foule < 20) return 'abandon';

  /* Décrochage diégétique — « mouvement essoufflé »
     Argus AAR 2026-05-08 : abandon mathématiquement trop rare (1.8 %)
     car nécessitait 3 reculs consécutifs (proba random ~1.56 %).
     Élargi à : 2 reculs + foule mince (< 35) → la base décroche
     parce que les retraits successifs ont vidé la rue, même si la
     foule n'est pas tombée sous 20. Cible : abandon ≥ 5 %. */
  const reculCount = history.filter(h => h.action === 'reculer').length;
  if (reculCount >= 2 && foule < 35) return 'abandon';

  if (foule >= 45 && escalade < 55) return 'victoire';
  return 'compromis';
}

/* ============================================================
   Conversion outcome → effets V2
   ============================================================ */

export interface PlaceEffects {
  confiance: number;
  rapportDeForce: number;
  santeSociale: number;
  legitimite: number;
  caisse: number;
  cohesionInterne: number;
}

export function outcomeToV2Effects(outcome: PlaceOutcome, history: PlaceHistory[]): PlaceEffects {
  const actionsCount = history.length;
  const forcedActs = history.filter(h => h.action === 'forcer').length;

  const base: Record<PlaceOutcome, PlaceEffects> = {
    victoire: {
      confiance: +15, rapportDeForce: +12, santeSociale: +8,
      legitimite: +10, caisse: -4, cohesionInterne: +8
    },
    compromis: {
      confiance: +6, rapportDeForce: +6, santeSociale: -2,
      legitimite: +4, caisse: -6, cohesionInterne: +2
    },
    repression: {
      confiance: +18, rapportDeForce: +4, santeSociale: -16,
      legitimite: -8, caisse: -10, cohesionInterne: -6
    },
    abandon: {
      confiance: -12, rapportDeForce: -8, santeSociale: -6,
      legitimite: -6, caisse: -4, cohesionInterne: -10
    }
  };

  const fx = { ...base[outcome] };

  // Pénalité si trop de "forcer" (mouvement épuisé)
  if (forcedActs >= 2) {
    fx.santeSociale -= 4;
    fx.cohesionInterne -= 4;
  }

  return fx;
}

export const OUTCOME_LABELS: Record<PlaceOutcome, { emoji: string; title: string; body: string }> = {
  victoire: {
    emoji: '✊',
    title: 'La place est à nous',
    body: 'Le cortège a tenu. La préfecture recule. Ce soir, les journaux parleront de vous.'
  },
  compromis: {
    emoji: '🤝',
    title: 'Accord partiel',
    body: 'La manif s\'est dispersée — mais pas sans résultat. Les négociations reprennent demain.'
  },
  repression: {
    emoji: '🔥',
    title: 'La répression',
    body: 'Les CRS ont chargé. Des blessés, des interpellations. Mais la colère ne s\'éteint pas.'
  },
  abandon: {
    emoji: '🌧️',
    title: 'La base décroche',
    body: 'Trop peu, trop tôt. Les rangs se sont clairsemés avant la fin. Retour à la table.'
  }
};
