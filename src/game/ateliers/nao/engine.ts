/* ============================================================
   PARITAS — Atelier "La NAO"
   Négociation Annuelle Obligatoire — simulation adversariale
   Employeur vs Délégué Syndical — 5 séances, 4 thèmes, 3 syndicats
   ============================================================
   Mécanique : négociation par séances simultanées.
   L'employeur distribue un budget de concessions sur 4 thèmes.
   Le délégué choisit la posture de chaque syndicat.
   Chaque tour révèle les mouvements simultanément.

   THÈMES :
   - Salaires      : hausse salariale (CCN)
   - Primes        : prime transport + participation
   - Télétravail   : jours/semaine
   - Égalité pro   : engagements plan d'action

   SYNDICATS (suffrages exprimés) :
   - CGT  38 % — revendicatif,  seuil élevé
   - CFDT 35 % — réformiste,   seuil bas
   - FO   20 % — autonome,     centré salaires

   Accord valide ↔ signataires ≥ 50 % des suffrages.
   Budget total employeur : 48 pts sur 5 séances max.
   ============================================================ */

export type NaoTheme  = 'salaires' | 'primes' | 'teletravail' | 'egalite_pro';
export type NaoUnion  = 'cgt' | 'cfdt' | 'fo';
export type NaoSide   = 'employeur' | 'syndicat';

export type EmployeurTactic =
  | 'offre_globale'    // +4 pts bonus répartis sur tous les thèmes ce tour
  | 'ultimatum'        // dernier tour forcé — sign or PV
  | 'communication'    // downgrade posture CGT d'un cran
  | 'audit_bloquant';  // bloque la carte Expertise syndicale ce tour

export type SyndicatTactic =
  | 'expertise'        // révèle l'enveloppe employeur restante
  | 'coordination'     // aligne les syndicats sur la posture la plus haute
  | 'mobilisation'     // chaque thème touché coûte 3 pts supplémentaires ce tour
  | 'accord_partiel';  // permet de signer sur les 2 thèmes prioritaires seulement

export type UnionPosture = 'pression' | 'patience' | 'compromis' | 'retrait';

export type NaoOutcome =
  | 'accord_majoritaire'   // ≥ 50 % signataires, texte complet
  | 'accord_partiel'       // ≥ 50 % mais limité à 2 thèmes (accord_partiel activé)
  | 'accord_minoritaire'   // signé mais < 50 % — légalement contestable
  | 'pv_desaccord';        // aucun syndicat ne signe ou ultimatum refusé

/* ============================================================
   Metadata
   ============================================================ */

export const ALL_THEMES: NaoTheme[] = ['salaires', 'primes', 'teletravail', 'egalite_pro'];
export const ALL_UNIONS: NaoUnion[] = ['cgt', 'cfdt', 'fo'];
export const MAX_SEANCES          = 5;

/* P1-3 (ORDA-008, AAR bêta-30 §V) — préset TPE/PME pour NAO.
   Bruno #30 (CPME, 28 salariés BTP) et Léa #20 (caissière) :
   « la NAO du jeu est calibrée pour un grand groupe (60 pts, 5
   séances). Chez moi, on signe en 2-3 séances avec un délégué
   unique ». Ce préset divise par 2.5 l'enveloppe et raccourcit
   la négociation, tout en gardant la mécanique identique. */
export type NaoPreset = 'standard' | 'tpe-pme';

export const NAO_PRESET_META: Record<NaoPreset, {
  label: string;
  description: string;
  enveloppe: number;
  maxSeances: number;
  seanceBudget: number;
}> = {
  standard: {
    label: 'NAO classique (grand groupe)',
    description: '5 séances · enveloppe 60 pts · 4 thèmes · 3 syndicats',
    enveloppe: 60,
    maxSeances: 5,
    seanceBudget: 13
  },
  'tpe-pme': {
    label: 'NAO TPE/PME',
    description: '3 séances · enveloppe 24 pts · format compact (Bruno P. #30)',
    enveloppe: 24,
    maxSeances: 3,
    seanceBudget: 9
  }
};
/* Argus ORDA-001 calibrage final après 2 swings extrêmes :
   - 48 pts → 100 % pv_desaccord (impossible)
   - 72 pts → 100 % accord_majoritaire (trivial)
   - 60 pts → variabilité (l'employeur DOIT focaliser sur salaires
     pour convaincre CFDT+FO ; étaler son budget = pv_desaccord). */
export const TOTAL_ENVELOPPE      = 60;
export const SEANCE_BUDGET        = 13;
export const SIGNING_MAJORITY     = 50;   // % de suffrages requis pour accord valide

export const THEME_META: Record<NaoTheme, {
  label: string; icon: string; unit: string; demandLabel: string;
  unionDemand: number; employeurStart: number;
}> = {
  salaires:    { label: 'Augmentation salariale',    icon: '💰', unit: '%',           demandLabel: '+3,2 %',      unionDemand: 78, employeurStart: 22 },
  primes:      { label: 'Primes & participation',    icon: '🎁', unit: '€/an',        demandLabel: '500 €',       unionDemand: 72, employeurStart: 18 },
  teletravail: { label: 'Télétravail',               icon: '🏠', unit: 'j/sem',       demandLabel: '3 j/sem',     unionDemand: 65, employeurStart: 25 },
  egalite_pro: { label: 'Égalité professionnelle',   icon: '⚖️', unit: 'engagements', demandLabel: '5 mesures',   unionDemand: 60, employeurStart: 20 }
};

export const UNION_META: Record<NaoUnion, {
  label: string; icon: string; color: string;
  electoralWeight: number; seuilAccord: number;
  weights: Record<NaoTheme, number>;
  profile: string; description: string;
}> = {
  /* Argus ORDA-001 : seuils abaissés (-0.10) pour permettre des accords
     atteignables avec un budget réaliste. Reste hiérarchique :
     CGT > FO > CFDT (CFDT la plus pragmatique). */
  cgt: {
    label: 'CGT', icon: '✊', color: '#dc2626',
    electoralWeight: 38,
    seuilAccord: 0.62,
    weights: { salaires: 0.50, primes: 0.28, teletravail: 0.12, egalite_pro: 0.10 },
    profile: 'Revendicative',
    description: "Exige des hausses substantielles. Difficile à convaincre sans concession forte sur les salaires."
  },
  cfdt: {
    label: 'CFDT', icon: '🤝', color: '#2563eb',
    electoralWeight: 35,
    seuilAccord: 0.55,
    weights: { salaires: 0.35, primes: 0.20, teletravail: 0.25, egalite_pro: 0.20 },
    profile: 'Réformiste',
    description: "Pragmatique — sensible au télétravail et à l'égalité pro. Prête à signer si avancées concrètes."
  },
  fo: {
    label: 'FO', icon: '⚙️', color: '#d97706',
    electoralWeight: 20,
    seuilAccord: 0.55,
    weights: { salaires: 0.60, primes: 0.30, teletravail: 0.06, egalite_pro: 0.04 },
    profile: 'Autonome',
    description: "Centrée pouvoir d'achat. Salaires + primes = 90 % de sa grille de lecture."
  }
};

export const EMPLOYEUR_TACTIC_META: Record<EmployeurTactic, { label: string; icon: string; description: string }> = {
  offre_globale:  { label: 'Offre globale',    icon: '📦', description: '+4 pts bonus répartis sur les 4 thèmes ce tour.' },
  ultimatum:      { label: 'Ultimatum',         icon: '⏰', description: "Clôture la NAO après ce tour — accord ou PV de désaccord." },
  communication:  { label: 'Communication RH',  icon: '📢', description: "Réduit la posture CGT d'un cran (pression → patience)." },
  audit_bloquant: { label: 'Blocage expertise', icon: '🔒', description: "Bloque l'utilisation de la carte Expertise syndicale ce tour." }
};

export const SYNDICAT_TACTIC_META: Record<SyndicatTactic, { label: string; icon: string; description: string }> = {
  expertise:    { label: 'Expertise',              icon: '🔍', description: "Révèle l'enveloppe totale restante de l'employeur." },
  coordination: { label: 'Coordination syndicale', icon: '🔗', description: "Aligne les syndicats sur la posture la plus haute des trois." },
  mobilisation: { label: 'Mobilisation',           icon: '📣', description: "Chaque thème touché coûte 3 pts supplémentaires à l'employeur." },
  accord_partiel:{ label: 'Accord partiel',        icon: '📝', description: "Possibilité de signer sur les 2 thèmes les plus avancés seulement." }
};

/* Argus ORDA-001 : modifiers réduits de ±0.08 → ±0.06 pour amortir
   l'effet des postures (plus jouable, moins binaire). */
export const POSTURE_META: Record<UnionPosture, { label: string; icon: string; seuilMod: number; description: string }> = {
  pression:  { label: 'Pression',   icon: '🔥', seuilMod: +0.06, description: 'Exige plus. Seuil relevé de 6 pts.' },
  patience:  { label: 'Attente',    icon: '⏳', seuilMod:  0,    description: 'Posture neutre. Seuil inchangé.' },
  compromis: { label: 'Compromis',  icon: '🤝', seuilMod: -0.06, description: "Prêt à transiger. Seuil abaissé de 6 pts." },
  retrait:   { label: 'Retrait',    icon: '🚪', seuilMod:  0,    description: "Ne signera pas ce tour." }
};

/* ============================================================
   Types de données
   ============================================================ */

export type ThemeAdjustments = Record<NaoTheme, number>;
export type PostureMap       = Record<NaoUnion, UnionPosture>;

export interface EmployeurMove {
  adjustments: ThemeAdjustments;
  tactic: EmployeurTactic | null;
}

export interface SyndicatMove {
  postures: PostureMap;
  tactic: SyndicatTactic | null;
}

export interface UnionSeanceState {
  satisfaction: number;    // 0-1
  effectiveSeuil: number;  // seuil modifié par posture
  willSign: boolean;
  posture: UnionPosture;
}

export interface SeanceResult {
  seance: number;
  employeurMove: EmployeurMove;
  syndicatMove: SyndicatMove;
  themesBefore: Record<NaoTheme, number>;
  themesAfter: Record<NaoTheme, number>;
  unionStates: Record<NaoUnion, UnionSeanceState>;
  signingWeight: number;
  narrative: string;
}

export interface NaoModifiers {
  mobilisationActive: boolean;   // l'employeur paie +3 pts par thème touché ce tour
  auditBloquant: boolean;        // expertise syndicale bloquée ce tour
  ultimatumActive: boolean;      // dernier tour forcé
  accordPartielActive: boolean;  // peut signer sur 2 thèmes seulement
  /** P1-3 (ORDA-008) — preset actif : 'standard' ou 'tpe-pme'.
   *  Optionnel pour rétro-compat (parties sauvegardées v2.1.x). */
  preset?: NaoPreset;
}

export interface NaoState {
  seance: number;                      // 1 → MAX_SEANCES
  phase: 'proposing' | 'result' | 'ended';
  themes: Record<NaoTheme, number>;    // positions employeur actuelles (0-100)
  postures: PostureMap;                // postures syndicales courantes
  enveloppeMax: number;                // budget total employeur (caché pour syndicat)
  enveloppeSpent: number;              // pts déjà dépensés
  enveloppeRevealed: boolean;          // révélé par expertise ?
  employeurMove: EmployeurMove | null;
  syndicatMove: SyndicatMove | null;
  history: SeanceResult[];
  tacticsUsed: { employeur: EmployeurTactic[]; syndicat: SyndicatTactic[] };
  modifiers: NaoModifiers;
  outcome: NaoOutcome | null;
  signingUnions: NaoUnion[];
}

/* ============================================================
   Initialisateur
   ============================================================ */

export function startNaoSession(preset: NaoPreset = 'standard'): NaoState {
  const meta = NAO_PRESET_META[preset];
  return {
    seance: 1,
    phase: 'proposing',
    themes: {
      salaires:    THEME_META.salaires.employeurStart,
      primes:      THEME_META.primes.employeurStart,
      teletravail: THEME_META.teletravail.employeurStart,
      egalite_pro: THEME_META.egalite_pro.employeurStart
    },
    postures: { cgt: 'pression', cfdt: 'patience', fo: 'patience' },
    enveloppeMax: meta.enveloppe,
    enveloppeSpent: 0,
    enveloppeRevealed: false,
    employeurMove: null,
    syndicatMove: null,
    history: [],
    tacticsUsed: { employeur: [], syndicat: [] },
    modifiers: {
      mobilisationActive: false,
      auditBloquant: false,
      ultimatumActive: false,
      accordPartielActive: false,
      preset
    },
    outcome: null,
    signingUnions: []
  };
}

/* ============================================================
   Helpers
   ============================================================ */

export function emptyAdjustments(): ThemeAdjustments {
  return { salaires: 0, primes: 0, teletravail: 0, egalite_pro: 0 };
}

export function defaultPostures(): PostureMap {
  return { cgt: 'patience', cfdt: 'patience', fo: 'patience' };
}

export function totalAdjustment(adj: ThemeAdjustments): number {
  return ALL_THEMES.reduce((s, t) => s + (adj[t] ?? 0), 0);
}

export function effectiveCost(adj: ThemeAdjustments, mobilisation: boolean): number {
  const base = totalAdjustment(adj);
  if (!mobilisation) return base;
  const touched = ALL_THEMES.filter(t => (adj[t] ?? 0) > 0).length;
  return base + touched * 3;
}

export function getSeanceBudget(state: NaoState): number {
  const remaining = state.enveloppeMax - state.enveloppeSpent;
  /* P1-3 — préset TPE/PME a un budget par séance plus serré (9 vs 13). */
  const presetBudget = NAO_PRESET_META[state.modifiers.preset ?? 'standard'].seanceBudget;
  return Math.min(presetBudget, remaining);
}

/** P1-3 — Nombre max de séances pour la partie courante (preset-aware). */
export function getMaxSeances(state: NaoState): number {
  return NAO_PRESET_META[state.modifiers.preset ?? 'standard'].maxSeances;
}

/** Satisfaction d'un syndicat par rapport aux positions actuelles (0-1). */
export function computeSatisfaction(
  themes: Record<NaoTheme, number>,
  union: NaoUnion,
  accordPartiel: boolean
): number {
  const meta = UNION_META[union];
  let activeThemes: NaoTheme[];
  let weights: Record<NaoTheme, number>;

  if (accordPartiel) {
    // Top-2 thèmes par poids syndicat, poids renormalisés
    const sorted = [...ALL_THEMES].sort((a, b) => meta.weights[b] - meta.weights[a]);
    activeThemes = sorted.slice(0, 2);
    const totalW = activeThemes.reduce((s, t) => s + meta.weights[t], 0);
    const renorm = {} as Record<NaoTheme, number>;
    activeThemes.forEach(t => { renorm[t] = meta.weights[t] / totalW; });
    weights = renorm;
  } else {
    activeThemes = ALL_THEMES;
    weights = meta.weights;
  }

  return activeThemes.reduce((sum, t) => {
    const demand = THEME_META[t].unionDemand;
    const ratio  = Math.min(themes[t] / demand, 1.0);
    return sum + ratio * (weights[t] ?? 0);
  }, 0);
}

export function computeEffectiveSeuil(union: NaoUnion, posture: UnionPosture): number {
  return UNION_META[union].seuilAccord + POSTURE_META[posture].seuilMod;
}

export function willUnionSign(
  themes: Record<NaoTheme, number>,
  union: NaoUnion,
  posture: UnionPosture,
  accordPartiel: boolean
): boolean {
  if (posture === 'retrait') return false;
  const sat   = computeSatisfaction(themes, union, accordPartiel);
  const seuil = computeEffectiveSeuil(union, posture);
  return sat >= seuil;
}

export function computeSigningWeight(
  themes: Record<NaoTheme, number>,
  postures: PostureMap,
  accordPartiel: boolean
): { signing: NaoUnion[]; weight: number } {
  const signing = ALL_UNIONS.filter(u => willUnionSign(themes, u, postures[u], accordPartiel));
  const weight  = signing.reduce((s, u) => s + UNION_META[u].electoralWeight, 0);
  return { signing, weight };
}

/* ============================================================
   Setters (phase 'proposing')
   ============================================================ */

export function setEmployeurMove(state: NaoState, move: EmployeurMove): NaoState {
  if (state.phase !== 'proposing') return state;
  return { ...state, employeurMove: move };
}

export function setSyndicatMove(state: NaoState, move: SyndicatMove): NaoState {
  if (state.phase !== 'proposing') return state;
  return { ...state, syndicatMove: move };
}

/* ============================================================
   Résolution d'une séance
   ============================================================ */

export function resolveSeance(state: NaoState): NaoState {
  const { employeurMove, syndicatMove } = state;
  if (!employeurMove || !syndicatMove) return state;

  const themesBefore = { ...state.themes };
  const newModifiers: NaoModifiers = { ...state.modifiers };

  /* --- Résoudre tactique employeur --- */
  const empTactic  = employeurMove.tactic;
  const empUsed    = state.tacticsUsed.employeur;
  const bonusAdj   = emptyAdjustments();

  if (empTactic && !empUsed.includes(empTactic)) {
    switch (empTactic) {
      case 'offre_globale':
        ALL_THEMES.forEach(t => { bonusAdj[t] = 1; }); // +4 pts total
        break;
      case 'ultimatum':
        newModifiers.ultimatumActive = true;
        break;
      case 'communication':
        // CGT downgrade applied after posture resolution below
        break;
      case 'audit_bloquant':
        newModifiers.auditBloquant = true;
        break;
    }
  }

  /* --- Résoudre tactique syndicat --- */
  const synTactic = syndicatMove.tactic;
  const synUsed   = state.tacticsUsed.syndicat;
  let enveloppeRevealed = state.enveloppeRevealed;
  let newPostures: PostureMap = { ...syndicatMove.postures };

  if (synTactic && !synUsed.includes(synTactic)) {
    switch (synTactic) {
      case 'expertise':
        if (!newModifiers.auditBloquant) enveloppeRevealed = true;
        break;
      case 'coordination': {
        const postureOrder: UnionPosture[] = ['retrait', 'compromis', 'patience', 'pression'];
        const maxIdx = Math.max(...ALL_UNIONS.map(u => postureOrder.indexOf(syndicatMove.postures[u])));
        const highest = postureOrder[maxIdx];
        ALL_UNIONS.forEach(u => { newPostures[u] = highest; });
        break;
      }
      case 'mobilisation':
        // Active uniquement à partir du tour SUIVANT pour la plupart des jeux ;
        // ici on l'applique ce même tour (simultané) comme dans les autres ateliers
        newModifiers.mobilisationActive = true;
        break;
      case 'accord_partiel':
        newModifiers.accordPartielActive = true;
        break;
    }
  }

  /* --- Communication RH : downgrade posture CGT --- */
  if (empTactic === 'communication' && !empUsed.includes('communication')) {
    if (newPostures.cgt === 'pression')  newPostures.cgt = 'patience';
    else if (newPostures.cgt === 'patience') newPostures.cgt = 'compromis';
  }

  /* --- Coût réel des concessions --- */
  const useMobilisation = state.modifiers.mobilisationActive; // actif depuis tour précédent
  const adjCost   = effectiveCost(employeurMove.adjustments, useMobilisation);
  const bonusCost = effectiveCost(bonusAdj, false);
  /* Cap : on ne peut pas dépenser plus que l'enveloppe restante.
     Si l'IA ou un joueur soumet un move qui dépasserait, on tronque. */
  const enveloppeRemaining = state.enveloppeMax - state.enveloppeSpent;
  const totalCost = Math.min(adjCost + bonusCost, enveloppeRemaining);
  const newEnveloppeSpent = state.enveloppeSpent + totalCost;

  /* --- Nouvelles positions thèmes --- */
  const themesAfter: Record<NaoTheme, number> = { ...themesBefore };
  ALL_THEMES.forEach(t => {
    themesAfter[t] = Math.min(100, themesBefore[t] + (employeurMove.adjustments[t] ?? 0) + bonusAdj[t]);
  });

  /* --- États syndicats --- */
  const accordPartiel = newModifiers.accordPartielActive;
  const unionStates: Record<NaoUnion, UnionSeanceState> = {} as Record<NaoUnion, UnionSeanceState>;
  ALL_UNIONS.forEach(u => {
    const posture       = newPostures[u];
    const satisfaction  = computeSatisfaction(themesAfter, u, accordPartiel);
    const effectiveSeuil = computeEffectiveSeuil(u, posture);
    const ws = willUnionSign(themesAfter, u, posture, accordPartiel);
    unionStates[u] = { satisfaction, effectiveSeuil, willSign: ws, posture };
  });

  const { signing, weight: signingWeight } = computeSigningWeight(themesAfter, newPostures, accordPartiel);

  /* --- Narrative --- */
  const narrative = composeSeanceNarrative(
    state.seance, themesAfter, themesBefore, unionStates, signingWeight, empTactic, synTactic
  );

  const seanceResult: SeanceResult = {
    seance: state.seance,
    employeurMove,
    syndicatMove,
    themesBefore,
    themesAfter,
    unionStates,
    signingWeight,
    narrative
  };

  const newHistory = [...state.history, seanceResult];

  /* --- Mise à jour tactics used --- */
  const newTacticsUsed = {
    employeur: empTactic && !empUsed.includes(empTactic) ? [...empUsed, empTactic] : empUsed,
    syndicat:  synTactic && !synUsed.includes(synTactic) ? [...synUsed, synTactic] : synUsed
  };

  /* --- Reset des modifiers pour le prochain tour --- */
  const nextModifiers: NaoModifiers = {
    mobilisationActive: synTactic === 'mobilisation' && !synUsed.includes('mobilisation'),
    auditBloquant: false,
    ultimatumActive: newModifiers.ultimatumActive,
    accordPartielActive: accordPartiel
  };

  /* --- Fin de négociation ? --- */
  /* P1-3 — preset-aware : MAX_SEANCES standard vs preset TPE/PME (3). */
  const maxSeances = NAO_PRESET_META[state.modifiers.preset ?? 'standard'].maxSeances;
  const isLast    = state.seance >= maxSeances;
  const shouldEnd = isLast || newModifiers.ultimatumActive;

  if (shouldEnd) {
    const outcome = resolveNaoOutcome(signing, signingWeight, accordPartiel);
    return {
      ...state,
      seance: state.seance,
      phase: 'ended',
      themes: themesAfter,
      postures: newPostures,
      enveloppeSpent: newEnveloppeSpent,
      enveloppeRevealed,
      employeurMove: null,
      syndicatMove: null,
      history: newHistory,
      tacticsUsed: newTacticsUsed,
      modifiers: nextModifiers,
      outcome,
      signingUnions: signing
    };
  }

  return {
    ...state,
    seance: (state.seance + 1) as NaoState['seance'],
    phase: 'result',
    themes: themesAfter,
    postures: newPostures,
    enveloppeSpent: newEnveloppeSpent,
    enveloppeRevealed,
    employeurMove: null,
    syndicatMove: null,
    history: newHistory,
    tacticsUsed: newTacticsUsed,
    modifiers: nextModifiers,
    outcome: null,
    signingUnions: signing
  };
}

export function nextSeance(state: NaoState): NaoState {
  if (state.phase !== 'result') return state;
  return { ...state, phase: 'proposing' };
}

/* ============================================================
   Résolution outcome
   ============================================================ */

function resolveNaoOutcome(
  signing: NaoUnion[],
  weight: number,
  accordPartiel: boolean
): NaoOutcome {
  if (signing.length === 0) return 'pv_desaccord';
  if (weight >= SIGNING_MAJORITY) {
    return accordPartiel ? 'accord_partiel' : 'accord_majoritaire';
  }
  return 'accord_minoritaire';
}

/* ============================================================
   Narrative
   ============================================================ */

function composeSeanceNarrative(
  seance: number,
  themesAfter: Record<NaoTheme, number>,
  themesBefore: Record<NaoTheme, number>,
  unionStates: Record<NaoUnion, UnionSeanceState>,
  signingWeight: number,
  empTactic: EmployeurTactic | null,
  synTactic: SyndicatTactic | null
): string {
  const totalGain = ALL_THEMES.reduce((s, t) => s + (themesAfter[t] - themesBefore[t]), 0);

  let narr = `Séance ${seance} — `;

  if (totalGain === 0) {
    narr += "Aucune concession employeur. Les syndicats durcissent leur position.";
  } else if (totalGain < 6) {
    narr += `Avancée modeste (+${totalGain} pts). La distance reste importante.`;
  } else if (totalGain < 13) {
    narr += `Concessions significatives (+${totalGain} pts). Le dialogue avance.`;
  } else {
    narr += `Offre ambitieuse (+${totalGain} pts). L'employeur cherche un accord rapide.`;
  }

  const signersLabels = ALL_UNIONS.filter(u => unionStates[u].willSign).map(u => UNION_META[u].label);

  if (signersLabels.length === 0) {
    narr += " Aucun syndicat ne signerait à ce stade.";
  } else if (signingWeight >= SIGNING_MAJORITY) {
    narr += ` ${signersLabels.join(' + ')} prêts à signer (${signingWeight} % — accord valide possible).`;
  } else {
    narr += ` ${signersLabels.join(' + ')} enclins à signer, mais insuffisant (${signingWeight} %).`;
  }

  if (synTactic === 'mobilisation')  narr += " La mobilisation a renchéri chaque concession.";
  if (empTactic === 'ultimatum')     narr += " L'ultimatum est posé — c'est la dernière séance.";
  if (synTactic === 'expertise')     narr += " L'enveloppe de l'employeur est maintenant connue.";
  if (synTactic === 'coordination')  narr += " Les syndicats ont aligné leurs positions.";

  return narr;
}

/* ============================================================
   Outcome labels & V2 effects
   ============================================================ */

export const NAO_OUTCOME_LABELS: Record<NaoOutcome, {
  emoji: string; title: string; subtitle: string; employeur: string; syndicat: string;
}> = {
  accord_majoritaire: {
    emoji: '✅',
    title: 'ACCORD MAJORITAIRE',
    subtitle: "Accord valide — plus de 50 % des suffrages représentés.",
    employeur: "L'accord est signé. La paix sociale est préservée. Coût maîtrisé.",
    syndicat: "Victoire négociée. L'accord engage l'employeur sur les 4 thèmes. Mandat tenu."
  },
  accord_partiel: {
    emoji: '📝',
    title: 'ACCORD PARTIEL',
    subtitle: "Accord majoritaire limité à 2 thèmes prioritaires.",
    employeur: "Solution de compromis. Deux thèmes restent ouverts pour la prochaine NAO.",
    syndicat: "Accord sur l'essentiel. Les thèmes secondaires seront renégociés l'an prochain."
  },
  accord_minoritaire: {
    emoji: '⚠️',
    title: 'ACCORD MINORITAIRE',
    subtitle: "Signé mais sans majorité — légalement contestable.",
    employeur: "Accord fragile. Les syndicats majoritaires peuvent le contester devant la DREETS.",
    syndicat: "Accord insuffisant. La CGT ou la CFDT peut saisir l'administration pour invalidation."
  },
  pv_desaccord: {
    emoji: '❌',
    title: 'PV DE DÉSACCORD',
    subtitle: "Aucun accord — procès-verbal de désaccord consigné.",
    employeur: "Échec de la NAO. L'employeur fixe unilatéralement les revalorisations minimales.",
    syndicat: "La mobilisation reprend. Le PV documente les positions pour l'éventuel contentieux."
  }
};

export function naoOutcomeToV2Effects(
  outcome: NaoOutcome,
  side: NaoSide
): {
  confiance: number; rapportDeForce: number; santeSociale: number;
  legitimite: number; caisse: number; cohesionInterne: number;
} {
  const effects: Record<NaoOutcome, Record<NaoSide, ReturnType<typeof naoOutcomeToV2Effects>>> = {
    accord_majoritaire: {
      employeur: { confiance: +4,  rapportDeForce: -3, santeSociale: +6,  legitimite: +5,  caisse: -9,  cohesionInterne: +3  },
      syndicat:  { confiance: +10, rapportDeForce: +8, santeSociale: +6,  legitimite: +12, caisse: -4,  cohesionInterne: +9  }
    },
    accord_partiel: {
      employeur: { confiance: +2,  rapportDeForce: -1, santeSociale: +3,  legitimite: +3,  caisse: -5,  cohesionInterne: +1  },
      syndicat:  { confiance: +5,  rapportDeForce: +4, santeSociale: +3,  legitimite: +6,  caisse: -2,  cohesionInterne: +4  }
    },
    accord_minoritaire: {
      employeur: { confiance: -2,  rapportDeForce: +2, santeSociale: -2,  legitimite: -4,  caisse: -3,  cohesionInterne: -2  },
      syndicat:  { confiance: -5,  rapportDeForce: -3, santeSociale: -2,  legitimite: -8,  caisse: -2,  cohesionInterne: -6  }
    },
    pv_desaccord: {
      employeur: { confiance: -6,  rapportDeForce: +3, santeSociale: -5,  legitimite: -4,  caisse: 0,   cohesionInterne: -4  },
      syndicat:  { confiance: -8,  rapportDeForce: +3, santeSociale: -6,  legitimite: -6,  caisse: -3,  cohesionInterne: -7  }
    }
  };
  return effects[outcome][side];
}

/* ============================================================
   IA — Employeur
   ============================================================ */

export function aiEmployeurMove(state: NaoState): EmployeurMove {
  const budget = getSeanceBudget(state);
  const adj = emptyAdjustments();
  const accordPartiel = state.modifiers.accordPartielActive;
  const useMobilisation = state.modifiers.mobilisationActive;

  // Calculer le gap de satisfaction pour chaque syndicat
  const gaps = ALL_UNIONS.map(u => ({
    union: u,
    gap: computeEffectiveSeuil(u, state.postures[u]) - computeSatisfaction(state.themes, u, accordPartiel),
    weight: UNION_META[u].electoralWeight
  })).sort((a, b) => a.gap - b.gap); // ceux qui sont le moins loin d'abord

  // Identifier la coalition la moins chère à convaincre (≥ 50 %)
  let targetWeight = 0;
  const targets: typeof gaps = [];
  for (const g of gaps) {
    if (g.gap <= 0) { targets.push(g); targetWeight += g.weight; }
    if (targetWeight >= SIGNING_MAJORITY) break;
  }
  // Si on n'y est pas encore, ajouter le prochain
  if (targetWeight < SIGNING_MAJORITY) {
    const next = gaps.find(g => g.gap > 0);
    if (next) { targets.push(next); targetWeight += next.weight; }
  }

  // Scorer les thèmes par importance pour les cibles
  const themeScores: Record<NaoTheme, number> = { salaires: 0, primes: 0, teletravail: 0, egalite_pro: 0 };
  targets.forEach(({ union, gap }) => {
    const w = UNION_META[union].weights;
    ALL_THEMES.forEach(t => { themeScores[t] += w[t] * Math.max(gap, 0.05); });
  });

  // Distribuer le budget en suivant les scores.
  // Sous mobilisation, chaque thème touché coûte 3 pts supplémentaires :
  // on doit anticiper ce malus pour ne pas dépasser le budget.
  const sortedThemes = [...ALL_THEMES].sort((a, b) => themeScores[b] - themeScores[a]);
  let remaining = Math.min(budget, state.enveloppeMax - state.enveloppeSpent);
  for (const t of sortedThemes) {
    const malus = useMobilisation ? 3 : 0;
    if (remaining <= malus) break;       // pas assez pour couvrir le malus + ≥1pt utile
    const target = Math.max(1, Math.round(themeScores[t] * 6));
    const give   = Math.min(remaining - malus, target);
    if (give <= 0) break;
    adj[t] = give;
    remaining -= give + malus;            // déduire malus + dépense réelle
  }
  // Compléter sur le thème prioritaire si reste — sans toucher de nouveau thème
  if (remaining > 0) {
    const empty = sortedThemes.find(t => adj[t] === 0);
    const targetTheme = adj[sortedThemes[0]] > 0 ? sortedThemes[0] : empty ?? sortedThemes[0];
    if (adj[targetTheme] > 0) adj[targetTheme] += remaining;
  }

  // Choisir une tactique
  const available = (['offre_globale', 'ultimatum', 'communication', 'audit_bloquant'] as EmployeurTactic[])
    .filter(t => !state.tacticsUsed.employeur.includes(t));
  let tactic: EmployeurTactic | null = null;

  if (state.seance >= 4 && available.includes('ultimatum')) {
    const { weight } = computeSigningWeight(state.themes, state.postures, accordPartiel);
    if (weight >= SIGNING_MAJORITY) tactic = 'ultimatum';
  }
  if (!tactic && available.length > 0 && Math.random() > 0.55) {
    tactic = available[Math.floor(Math.random() * available.length)];
    if (tactic === 'ultimatum') tactic = null; // ne jamais ultimer trop tôt via random
  }

  return { adjustments: adj, tactic };
}

/* ============================================================
   IA — Syndicat
   ============================================================ */

export function aiSyndicatMove(state: NaoState): SyndicatMove {
  const accordPartiel = state.modifiers.accordPartielActive;
  const postures: PostureMap = { cgt: 'pression', cfdt: 'patience', fo: 'patience' };

  /* Argus ORDA-001 R1 (post-AAR Argus 2026-05-08) — IA syndicat
     RECALIBRÉE : la version précédente était trop conservatrice
     → 0 % accord_minoritaire et 0 % pv_desaccord en MC.
     Ajout de variance stochastique pour produire de vrais blocages
     (R-A doctrine — Mémo Rouge Diplomates) :
     - CGT peut rester en `pression` ou `retrait` parfois jusqu'au
       bout (10 % de ténacité absolue, 5 % de retrait défensif)
     - FO peut refuser si position salaires reste sous son minimum
       (sensibilité salaires renforcée)
     - CFDT garde son pragmatisme — pivot des coalitions */

  const ROLL = () => Math.random();

  // CGT — revendicative + variance ténacité / retrait
  const cgtSat = computeSatisfaction(state.themes, 'cgt', accordPartiel);
  const cgtGap = UNION_META.cgt.seuilAccord - cgtSat;
  const cgtRoll = ROLL();
  if (state.seance === 1) {
    postures.cgt = 'pression';
  } else if (cgtRoll < 0.22) {
    /* 22 % de retrait stratégique (refus catégorique de signer ce tour).
       Argus R1 : taux calibré 5 % → 22 % pour franchir la cible
       pv_desaccord ≥ 5 % via couplage intersyndical (CFDT 50 % + FO 50 %
       suivent CGT en retrait). 22 % × 50 % × 50 % ≈ 5.5 % triple retrait. */
    postures.cgt = 'retrait';
  } else if (cgtRoll < 0.32 && cgtGap > 0.04) {
    /* 10 % de ténacité : reste en pression même proche du seuil */
    postures.cgt = 'pression';
  } else if (cgtGap < 0.05) {
    postures.cgt = 'compromis';
  } else if (cgtGap < 0.15) {
    postures.cgt = 'patience';
  } else if (state.seance >= 4) {
    postures.cgt = 'patience';
  } else {
    postures.cgt = 'pression';
  }

  // CFDT — pragmatique (pivot) + retrait conditionné
  const cfdtSat = computeSatisfaction(state.themes, 'cfdt', accordPartiel);
  const cfdtGap = UNION_META.cfdt.seuilAccord - cfdtSat;
  const cfdtRoll = ROLL();
  /* Argus R1 — couplage intersyndical (solidarité) : si CGT s'est
     mise en retrait, CFDT évalue le coût politique de signer seule.
     50 % de proba de suivre. Effet : pv_desaccord atteignable. */
  const cgtEnRetrait = postures.cgt === 'retrait';
  if (cgtEnRetrait && cfdtRoll < 0.50) {
    postures.cfdt = 'retrait';
  } else if (cfdtRoll < 0.05) {
    /* 5 % de retrait stratégique (consultation base réformiste) */
    postures.cfdt = 'retrait';
  } else if (cfdtGap < 0.05) {
    postures.cfdt = 'compromis';
  } else if (cfdtGap < 0.12) {
    postures.cfdt = 'patience';
  } else if (state.seance >= 3) {
    postures.cfdt = 'patience';
  } else {
    postures.cfdt = 'patience';
  }

  // FO — centrée salaires : refus si salaires sous minimum vital + variance
  const foSat = computeSatisfaction(state.themes, 'fo', accordPartiel);
  const foGap = UNION_META.fo.seuilAccord - foSat;
  /* Argus R1 : FO refuse explicitement si la position salaires reste
     basse en fin de partie (cohérent avec son profil "60 % salaires") */
  const salairesPos = state.themes.salaires;
  const foRoll = ROLL();
  const foSalairesRefus = state.seance >= 3 && salairesPos < 35 && foRoll < 0.5;
  /* Argus R1 — couplage solidarité : si CGT en retrait, FO a 50 %
     de proba de suivre (autonomie revendicative + solidarité). */
  const foSuitCgt = postures.cgt === 'retrait' && foRoll < 0.50;
  if (foSalairesRefus || foSuitCgt) {
    postures.fo = 'retrait';
  } else if (foRoll < 0.06) {
    /* 6 % de retrait stratégique (autonomie revendicative) */
    postures.fo = 'retrait';
  } else if (foGap < 0.05) {
    postures.fo = 'compromis';
  } else if (foGap < 0.12) {
    postures.fo = 'patience';
  } else if (state.seance >= 4) {
    postures.fo = 'patience';
  } else {
    postures.fo = 'patience';
  }

  // Tactique
  const available = (['expertise', 'coordination', 'mobilisation', 'accord_partiel'] as SyndicatTactic[])
    .filter(t => !state.tacticsUsed.syndicat.includes(t));
  let tactic: SyndicatTactic | null = null;

  if (state.seance === 1 && available.includes('mobilisation')) {
    tactic = 'mobilisation';
  } else if (state.seance === 2 && available.includes('expertise')) {
    tactic = 'expertise';
  } else if (state.seance === getMaxSeances(state) && available.includes('accord_partiel')) {
    /* Argus B-MC1 + B-MC2 :
       (B-MC1) condition inversée — accord_partiel ne se joue que si
              l'accord majoritaire est hors de portée.
       (B-MC2) ne plus jouer cette tactique à séance >=4 (trop tôt) :
              elle persiste via nextModifiers.accordPartielActive et
              force tous les outcomes en accord_partiel. UNIQUEMENT
              à la DERNIÈRE séance, en dernier recours. */
    const { weight } = computeSigningWeight(state.themes, postures, false);
    if (weight < SIGNING_MAJORITY) tactic = 'accord_partiel';
  }

  return { postures, tactic };
}
