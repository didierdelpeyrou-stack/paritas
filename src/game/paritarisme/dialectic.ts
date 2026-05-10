/**
 * Paritas — Moteur dialectique de la Table paritaire.
 *
 * Cœur "math" du jeu : résout la collision Patron × Salarié à chaque
 * tour, applique les modulateurs (doctrine, manœuvre, contexte,
 * mémoire historique), produit les deltas KPI + déclenche
 * éventuellement un atelier (Émeute, Block Blast cotisations,
 * sous-jeu de marchandage).
 *
 * Pure-function. Aucune dépendance UI / Svelte. Voir doc design :
 * "Workflow Paritas — Deux pupitres, une table" §4 et §6.
 *
 * Architecture :
 *   resolveTable(patron, salarie, ctx) →
 *     applyMatrix → applyDoctrines → applyManoeuvre →
 *     applyContext → applyMemory → applyNoise →
 *     unlockAcquis → triggerAtelier → Outcome
 */

/* ============================================================
   1. POSTURES (3 par camp = 9 cellules)
   ============================================================ */

export type PatronPosture = 'cession' | 'tenir' | 'echange';
export type SalariePosture = 'rapportForce' | 'compromis' | 'acquisCibles';

export type Doctrine =
  /* Patron */
  | 'paternalisme'
  | 'neoliberal'
  | 'technocratique'
  | 'corporatiste'
  /* Salarié */
  | 'reformiste'
  | 'syndicalismeLutte'
  | 'autogestionnaire'
  | 'juridiste';

/* ============================================================
   2. KPI vectorisés (toutes valeurs bornées [0, 100])
   ============================================================ */

export interface PatronKPI {
  marge: number;
  climat: number;
  capPol: number;
  reputation: number;
}

export interface SalarieKPI {
  povAchat: number;
  droits: number;
  cohesion: number;
  legitimite: number;
}

export interface SharedKPI {
  /** 0 = paix sociale, 100 = explosion. Visible aux 2 joueurs. */
  tension: number;
}

/** Tous les deltas regroupés (signés, peuvent être négatifs). */
export interface DeltaVec {
  /* Patron */
  marge: number;
  climat: number;
  capPol: number;
  reputation: number;
  /* Salarié */
  povAchat: number;
  droits: number;
  cohesion: number;
  legitimite: number;
  /* Partagé */
  tension: number;
}

const ZERO_DELTA: DeltaVec = {
  marge: 0, climat: 0, capPol: 0, reputation: 0,
  povAchat: 0, droits: 0, cohesion: 0, legitimite: 0,
  tension: 0
};

/* ============================================================
   3. MATRICE NOMINALE 3×3 (9 cellules, deltas de base)

   Cellules les plus importantes (étoiles) sont annotées dans le
   doc design. ⚔️ = peut déclencher Émeute si tension finale > 70.
   🏛️ = candidat à un acquis irréversible.
   ============================================================ */

export const NOMINAL_MATRIX: Record<
  PatronPosture,
  Record<SalariePosture, DeltaVec>
> = {
  cession: {
    rapportForce: {
      ...ZERO_DELTA,
      /* Accord coûteux : patron a cédé sous pression frontale. */
      marge: -8, climat: 10, capPol: -3,
      povAchat: 12, legitimite: 4, tension: -15
    },
    compromis: {
      ...ZERO_DELTA,
      /* Accord doux. */
      marge: -4, climat: 6, capPol: 2,
      povAchat: 6, legitimite: 3, tension: -10
    },
    acquisCibles: {
      ...ZERO_DELTA,
      /* 🏛️ Réforme historique (1936-style). */
      marge: -2, climat: 5, capPol: 4,
      povAchat: 3, droits: 8, legitimite: 8, tension: -8
    }
  },
  tenir: {
    rapportForce: {
      ...ZERO_DELTA,
      /* ⚔️ Standoff explosif. */
      marge: 5, climat: -12, capPol: -8,
      povAchat: -10, legitimite: -2, tension: 25
    },
    compromis: {
      ...ZERO_DELTA,
      /* Salarié humilié (a tendu la main, refus). */
      marge: 3, climat: -3, capPol: 4,
      povAchat: -4, legitimite: -3, cohesion: -5, tension: 5
    },
    acquisCibles: {
      ...ZERO_DELTA,
      /* Standoff froid : aucun mouvement, mais salarié garde le qualitatif. */
      marge: 0, climat: -2, capPol: 2,
      povAchat: -2, legitimite: 3, tension: 3
    }
  },
  echange: {
    rapportForce: {
      ...ZERO_DELTA,
      /* Deal partiel : patron a sorti une concession latérale. */
      marge: -2, climat: 3, capPol: 1, reputation: 1,
      povAchat: 5, legitimite: 1, tension: -5
    },
    compromis: {
      ...ZERO_DELTA,
      /* 🤝 Deal optimal — accord paritaire mature. */
      marge: 2, climat: 4, capPol: 5, reputation: 2,
      povAchat: 3, legitimite: 2, cohesion: 2, tension: -8
    },
    acquisCibles: {
      ...ZERO_DELTA,
      /* 🏛️ Réforme structurante (1945-style). */
      marge: 0, climat: 5, capPol: 3,
      povAchat: 1, droits: 10, legitimite: 5, tension: -6
    }
  }
};

/* ============================================================
   4. CATALOGUE DOCTRINES — vecteurs μ multiplicatifs

   Chaque doctrine multiplie certains champs du delta. Les autres
   restent à 1.0 (neutre). On garde ça parcimonieux pour éviter
   un solveur dominé par une doctrine.
   ============================================================ */

type ModVec = Partial<Record<keyof DeltaVec, number>>;

export const DOCTRINE_MOD: Record<Doctrine, ModVec> = {
  paternalisme:        { climat: 1.2, marge: 0.85 },
  neoliberal:          { marge: 1.25, climat: 0.7, tension: 1.15 },
  technocratique:      { capPol: 1.2, legitimite: 0.85 },
  corporatiste:        { climat: 1.1, reputation: 1.1, tension: 0.9 },

  reformiste:          { reputation: 1.15, droits: 0.9, povAchat: 1.05 },
  syndicalismeLutte:   { tension: 1.3, povAchat: 1.15, cohesion: 1.1 },
  autogestionnaire:    { cohesion: 1.25, droits: 1.1, capPol: 0.9 },
  juridiste:           { legitimite: 1.2, droits: 1.15, tension: 0.85 }
};

/* ============================================================
   5. CONTEXTE — manœuvre, période, événement, mémoire
   ============================================================ */

/** Allocation budgétaire patron (somme = 100). */
export interface PatronManoeuvre {
  salaires: number;
  investissement: number;
  lobbying: number;
  sousTraitance: number;
  communication: number;
  reserve: number;
  /** Si posé, applique un μ caché à la cellule (T,R) ou (T,*). */
  planSocialLatent?: boolean;
}

/** Allocation énergie militante salarié (somme = 100). */
export interface SalarieManoeuvre {
  tracts: number;
  preavisGreve: number;
  saisinePrudhomale: number;
  coalitionInter: number;
  mediatisation: number;
  caisseSolidarite: number;
  /** Si verrouillée, multiplie le coût marge patron en cas de (T,R). */
  greveReconductible?: boolean;
}

export type AcquisId =
  | 'congesPayes_1936'
  | 'secu_1945'
  | 'sectionsSyndicales_1968'
  | 'chsct_1982'
  | 'rtt_2000'
  | 'cpe_retire_2006';

export interface ResolveContext {
  /** Tour courant (1..100). */
  turn: number;
  /** Période historique pour calibrer les événements. */
  period: '1936' | '1945' | '1968' | '1982' | '2003' | 'contemporain';
  /** Événement actif ce tour, optionnel. */
  event?:
    | 'occupation_renault'
    | 'choc_petrolier'
    | 'mai_68'
    | 'plan_juppe'
    | 'cpe'
    | 'gilets_jaunes'
    | null;
  /** Doctrines actives par camp. */
  patronDoctrine: Doctrine;
  salarieDoctrine: Doctrine;
  /** Manœuvres déposées ce tour. */
  patronManoeuvre: PatronManoeuvre;
  salarieManoeuvre: SalarieManoeuvre;
  /** État courant des KPI (avant résolution). */
  patron: PatronKPI;
  salarie: SalarieKPI;
  shared: SharedKPI;
  /** Acquis irréversibles déjà débloqués. */
  acquis: Set<AcquisId>;
  /** Effets différés en attente. */
  delayed: DelayedEffect[];
  /** RNG injecté (testabilité). 0..1. */
  rng?: () => number;
}

export interface DelayedEffect {
  delta: Partial<DeltaVec>;
  turnsLeft: number;
  /** Condition optionnelle : si false au moment du tick, l'effet
     est annulé (ex: investissement avorté si climat < 40). */
  guard?: (state: { patron: PatronKPI; salarie: SalarieKPI; shared: SharedKPI }) => boolean;
  /** Étiquette pour logs/narration. */
  label: string;
}

/* ============================================================
   6. RÉSULTAT
   ============================================================ */

export type AtelierTrigger =
  | { kind: 'emeute'; reason: string }
  | { kind: 'blockblast_cotisations'; reason: string }
  | { kind: 'marchandage_4_leviers'; reason: string }
  | { kind: 'conseil'; reason: string };

export interface ResolveOutcome {
  /** Cellule jouée (pour journalisation/narration). */
  cell: { patron: PatronPosture; salarie: SalariePosture };
  /** Delta nominal AVANT modulateurs. */
  baseDelta: DeltaVec;
  /** Delta final APRÈS modulateurs et bruit. */
  finalDelta: DeltaVec;
  /** Détail des modulateurs appliqués (pour debug/log). */
  appliedMods: Array<{ source: string; mod: ModVec }>;
  /** État résultant. */
  nextPatron: PatronKPI;
  nextSalarie: SalarieKPI;
  nextShared: SharedKPI;
  /** Acquis débloqué ce tour (s'il y en a un). */
  unlocked: AcquisId | null;
  /** Atelier déclenché (s'il y en a un). */
  atelier: AtelierTrigger | null;
  /** Effets différés ajoutés à la queue. */
  newDelayed: DelayedEffect[];
}

/* ============================================================
   7. PIPELINE — fonctions pures composables
   ============================================================ */

function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Applique un ModVec (multiplicatif) à un DeltaVec. */
function applyMod(delta: DeltaVec, mod: ModVec): DeltaVec {
  const out: DeltaVec = { ...delta };
  for (const k of Object.keys(mod) as (keyof DeltaVec)[]) {
    const m = mod[k];
    if (m == null) continue;
    out[k] = out[k] * m;
  }
  return out;
}

/** μ vecteur dérivé de la manœuvre patron. */
export function patronManoeuvreMod(m: PatronManoeuvre, posture: PatronPosture): ModVec {
  const mod: ModVec = {};
  /* Lobbying lourd : amplifie capPol mais pénalise réputation. */
  if (m.lobbying >= 40) {
    mod.capPol = (mod.capPol ?? 1) * 1.3;
    mod.reputation = (mod.reputation ?? 1) * 0.85;
  }
  /* Salaires lourds : crédibilise le geste climat sur Cession. */
  if (m.salaires >= 30 && posture === 'cession') {
    mod.climat = (mod.climat ?? 1) * 1.15;
  }
  /* Sous-traitance : sape le climat sur Tenir (la base le sent). */
  if (m.sousTraitance >= 30 && posture === 'tenir') {
    mod.climat = (mod.climat ?? 1) * 0.7;
  }
  /* Plan social latent + Tenir : punit doublement le climat. */
  if (m.planSocialLatent && posture === 'tenir') {
    mod.climat = (mod.climat ?? 1) * 0.5;
  }
  /* Communication : adoucit la marge perçue. */
  if (m.communication >= 25) {
    mod.reputation = (mod.reputation ?? 1) * 1.1;
  }
  return mod;
}

/** μ vecteur dérivé de la manœuvre salarié. */
export function salarieManoeuvreMod(m: SalarieManoeuvre, posture: SalariePosture): ModVec {
  const mod: ModVec = {};
  /* Préavis grève lourd : amplifie tension et coût marge si rapport de force. */
  if (m.preavisGreve >= 40) {
    mod.tension = (mod.tension ?? 1) * 1.4;
    if (posture === 'rapportForce') {
      mod.marge = (mod.marge ?? 1) * 1.6;  // dégât sur la marge patron
    }
  }
  /* Coalition intersyndicale : multiplicateur table x1.3 sur povAchat / droits. */
  if (m.coalitionInter >= 25) {
    mod.povAchat = (mod.povAchat ?? 1) * 1.3;
    mod.droits = (mod.droits ?? 1) * 1.2;
  }
  /* Médiatisation : amplifie légitimité mais réduit autonomie (capPol patron baisse). */
  if (m.mediatisation >= 25) {
    mod.legitimite = (mod.legitimite ?? 1) * 1.2;
    mod.reputation = (mod.reputation ?? 1) * 0.9;
  }
  /* Saisine prud'homale : amplifie droits sur AcquisCiblés. */
  if (m.saisinePrudhomale >= 20 && posture === 'acquisCibles') {
    mod.droits = (mod.droits ?? 1) * 1.25;
  }
  /* Grève reconductible armée + Rapport de force : surcharge marge & tension. */
  if (m.greveReconductible && posture === 'rapportForce') {
    mod.marge = (mod.marge ?? 1) * 2.0;
    mod.tension = (mod.tension ?? 1) * 1.3;
  }
  return mod;
}

/** μ contexte historique. */
export function contextMod(ctx: ResolveContext): ModVec {
  const mod: ModVec = {};
  switch (ctx.event) {
    case 'occupation_renault':
      mod.tension = 1.3;
      mod.legitimite = 1.25;
      break;
    case 'choc_petrolier':
      mod.marge = 0.85;
      mod.povAchat = 0.9;
      break;
    case 'mai_68':
      mod.tension = 1.5;
      mod.cohesion = 1.2;
      mod.legitimite = 1.15;
      break;
    case 'plan_juppe':
      mod.tension = 1.25;
      mod.legitimite = 1.1;
      break;
    case 'cpe':
      mod.legitimite = 1.2;
      mod.tension = 1.15;
      break;
    case 'gilets_jaunes':
      mod.tension = 1.4;
      mod.cohesion = 0.85;  // mvt diffus, érode la cohésion syndicale classique
      break;
  }
  return mod;
}

/** μ mémoire (acquis empilés modifient la matrice de façon permanente). */
export function memoryMod(ctx: ResolveContext): ModVec {
  const mod: ModVec = {};
  if (ctx.acquis.has('congesPayes_1936')) {
    mod.cohesion = (mod.cohesion ?? 1) * 1.05;
  }
  if (ctx.acquis.has('secu_1945')) {
    mod.povAchat = (mod.povAchat ?? 1) * 1.10;
  }
  if (ctx.acquis.has('sectionsSyndicales_1968')) {
    mod.legitimite = (mod.legitimite ?? 1) * 1.08;
  }
  if (ctx.acquis.has('chsct_1982')) {
    mod.droits = (mod.droits ?? 1) * 1.05;
  }
  return mod;
}

/* ============================================================
   8. SILHOUETTE — info imparfaite calibrée
   ============================================================ */

export type SilhouetteLabel =
  | 'tres_bas'
  | 'bas'
  | 'moyen'
  | 'eleve'
  | 'tres_eleve';

const BUCKETS: SilhouetteLabel[] = [
  'tres_bas', 'bas', 'moyen', 'eleve', 'tres_eleve'
];

/**
 * Renvoie une étiquette imprécise d'une valeur réelle. Plus
 * observerSkill ∈ [0,1] est élevé, plus le bucket est juste.
 */
export function silhouette(
  realValue: number,
  observerSkill: number,
  rng: () => number = Math.random
): SilhouetteLabel {
  const skill = clamp(observerSkill, 0, 1);
  const noise = (1 - skill) * 30; // ±30 max
  const perceived = clamp(realValue + (rng() - 0.5) * 2 * noise);
  const idx = Math.min(4, Math.floor(perceived / 20));
  return BUCKETS[idx];
}

/** observerSkill du patron sur la caisse de grève / cohésion salariée. */
export function patronObserverSkill(m: PatronManoeuvre): number {
  /* Lobbying = renseignements (Bercy/RG/DRH). */
  return clamp(0.3 + m.lobbying / 100, 0, 1);
}

/** observerSkill du salarié sur la marge patron. */
export function salarieObserverSkill(m: SalarieManoeuvre): number {
  return clamp(0.3 + (m.mediatisation + m.coalitionInter * 0.5) / 100, 0, 1);
}

/* ============================================================
   9. ACQUIS IRRÉVERSIBLES (mémoire historique)
   ============================================================ */

/**
 * Détermine si un acquis se débloque ce tour. Règles :
 * - 1936 / occupation_renault + cellule (C, A) → congesPayes_1936
 * - 1945 + cellule (E, A) ou (C, A) → secu_1945
 * - 1968 / mai_68 + cellule (C, R) → sectionsSyndicales_1968
 * - 1982 + cellule (E, A) → chsct_1982
 * Un acquis ne peut être débloqué qu'une fois.
 */
export function unlockAcquis(
  p: PatronPosture,
  s: SalariePosture,
  ctx: ResolveContext
): AcquisId | null {
  const has = (id: AcquisId) => ctx.acquis.has(id);

  if (!has('congesPayes_1936') &&
      ctx.period === '1936' &&
      ctx.event === 'occupation_renault' &&
      p === 'cession' && s === 'acquisCibles') {
    return 'congesPayes_1936';
  }
  if (!has('secu_1945') &&
      ctx.period === '1945' &&
      (p === 'echange' || p === 'cession') && s === 'acquisCibles') {
    return 'secu_1945';
  }
  if (!has('sectionsSyndicales_1968') &&
      ctx.period === '1968' &&
      ctx.event === 'mai_68' &&
      p === 'cession' && s === 'rapportForce') {
    return 'sectionsSyndicales_1968';
  }
  if (!has('chsct_1982') &&
      ctx.period === '1982' &&
      p === 'echange' && s === 'acquisCibles') {
    return 'chsct_1982';
  }
  return null;
}

/* ============================================================
   10. SEUILS ATELIERS — l'Émeute & co. comme sortie d'escalade
   ============================================================ */

export function triggerAtelier(
  p: PatronPosture,
  s: SalariePosture,
  finalShared: SharedKPI,
  ctx: ResolveContext
): AtelierTrigger | null {
  /* Cellule (T, R) avec tension critique → Émeute. */
  if (p === 'tenir' && s === 'rapportForce' && finalShared.tension > 70) {
    return {
      kind: 'emeute',
      reason: `Tenir + Rapport de force, tension finale ${Math.round(finalShared.tension)}`
    };
  }
  /* Négo Sécu (cellule C/E + A) après 1945 → Block Blast cotisations. */
  if (s === 'acquisCibles' &&
      (p === 'cession' || p === 'echange') &&
      ctx.acquis.has('secu_1945')) {
    return {
      kind: 'blockblast_cotisations',
      reason: 'Négo Sécu, sous-jeu de cotisations'
    };
  }
  /* Cellule Échange × * → marchandage 4 leviers. */
  if (p === 'echange') {
    return {
      kind: 'marchandage_4_leviers',
      reason: 'Échange croisé : sous-jeu marchandage'
    };
  }
  /* Saisine prud'homale lourde → Conseil. */
  if (ctx.salarieManoeuvre.saisinePrudhomale >= 30 && s === 'acquisCibles') {
    return {
      kind: 'conseil',
      reason: 'Saisine prud\'homale : audience Conseil'
    };
  }
  return null;
}

/* ============================================================
   11. EFFETS DIFFÉRÉS — Investissement T+3, fuite plan social, etc.
   ============================================================ */

/** Génère les nouveaux effets différés à ajouter ce tour. */
export function buildDelayedEffects(
  p: PatronPosture,
  _s: SalariePosture,
  ctx: ResolveContext
): DelayedEffect[] {
  const effects: DelayedEffect[] = [];
  const m = ctx.patronManoeuvre;

  /* Investissement → +marge T+3 ssi climat > 40 sur la fenêtre. */
  if (m.investissement >= 25) {
    effects.push({
      label: `Investissement ROI T+3 (${m.investissement}u)`,
      delta: { marge: m.investissement * 0.4 },
      turnsLeft: 3,
      guard: (state) => state.patron.climat > 40
    });
  }

  /* Plan social latent + Tenir non démenti dans 3 tours → fuite presse. */
  if (m.planSocialLatent && p === 'tenir') {
    effects.push({
      label: 'Fuite presse — Plan Social latent',
      delta: { climat: -25, tension: 40, reputation: -15 },
      turnsLeft: 3
    });
  }

  /* Sous-traitance : effet retard climat. */
  if (m.sousTraitance >= 25) {
    effects.push({
      label: 'Sous-traitance — érosion climat T+2',
      delta: { climat: -m.sousTraitance * 0.3, cohesion: -m.sousTraitance * 0.2 },
      turnsLeft: 2
    });
  }

  /* Saisine prud'homale : effet T+4. */
  if (ctx.salarieManoeuvre.saisinePrudhomale >= 20) {
    effects.push({
      label: 'Saisine prud\'homale — effet T+4',
      delta: { legitimite: 12, droits: 5, reputation: -5 },
      turnsLeft: 4
    });
  }

  return effects;
}

/** Décrémente la queue, applique ce qui arrive à terme, retourne (newQueue, applied). */
export function tickDelayed(
  queue: DelayedEffect[],
  state: { patron: PatronKPI; salarie: SalarieKPI; shared: SharedKPI }
): { queue: DelayedEffect[]; applied: DelayedEffect[] } {
  const next: DelayedEffect[] = [];
  const applied: DelayedEffect[] = [];
  for (const eff of queue) {
    const turnsLeft = eff.turnsLeft - 1;
    if (turnsLeft <= 0) {
      if (!eff.guard || eff.guard(state)) {
        applied.push({ ...eff, turnsLeft: 0 });
      }
      /* sinon avorté (ex: investissement raté). */
    } else {
      next.push({ ...eff, turnsLeft });
    }
  }
  return { queue: next, applied };
}

/* ============================================================
   12. APPLICATION DELTA → ÉTAT (clamping et bornes)
   ============================================================ */

function applyDeltaToPatron(p: PatronKPI, d: DeltaVec): PatronKPI {
  return {
    marge: clamp(p.marge + d.marge),
    climat: clamp(p.climat + d.climat),
    capPol: clamp(p.capPol + d.capPol),
    reputation: clamp(p.reputation + d.reputation)
  };
}

function applyDeltaToSalarie(s: SalarieKPI, d: DeltaVec): SalarieKPI {
  let povAchat = s.povAchat + d.povAchat;
  /* Plancher dur si congesPayes débloqués. */
  return {
    povAchat: clamp(povAchat),
    droits: clamp(s.droits + d.droits),
    cohesion: clamp(s.cohesion + d.cohesion),
    legitimite: clamp(s.legitimite + d.legitimite)
  };
}

function applyDeltaToShared(sh: SharedKPI, d: DeltaVec): SharedKPI {
  return { tension: clamp(sh.tension + d.tension) };
}

/* ============================================================
   13. FAÇADE PUBLIQUE — resolveTable
   ============================================================ */

/**
 * Pipeline complet : matrice → modulateurs → bruit → état → seuils.
 * Pure : ne mute pas ctx, retourne tout dans Outcome.
 */
export function resolveTable(
  patronPosture: PatronPosture,
  salariePosture: SalariePosture,
  ctx: ResolveContext
): ResolveOutcome {
  const baseDelta = NOMINAL_MATRIX[patronPosture][salariePosture];
  const appliedMods: Array<{ source: string; mod: ModVec }> = [];

  let d: DeltaVec = { ...baseDelta };

  const modPatron = DOCTRINE_MOD[ctx.patronDoctrine];
  const modSalarie = DOCTRINE_MOD[ctx.salarieDoctrine];
  const modManP = patronManoeuvreMod(ctx.patronManoeuvre, patronPosture);
  const modManS = salarieManoeuvreMod(ctx.salarieManoeuvre, salariePosture);
  const modCtx = contextMod(ctx);
  const modMem = memoryMod(ctx);

  d = applyMod(d, modPatron); appliedMods.push({ source: `doctrine:${ctx.patronDoctrine}`, mod: modPatron });
  d = applyMod(d, modSalarie); appliedMods.push({ source: `doctrine:${ctx.salarieDoctrine}`, mod: modSalarie });
  d = applyMod(d, modManP); appliedMods.push({ source: 'manoeuvre:patron', mod: modManP });
  d = applyMod(d, modManS); appliedMods.push({ source: 'manoeuvre:salarie', mod: modManS });
  d = applyMod(d, modCtx); appliedMods.push({ source: 'context', mod: modCtx });
  d = applyMod(d, modMem); appliedMods.push({ source: 'memory', mod: modMem });

  /* Bruit ε proportionnel au misjudge (silhouette adverse).
     Si tension finale très élevée et silhouette mal lue, on
     amplifie/dévie un peu les deltas — humanise le résultat. */
  const rng = ctx.rng ?? Math.random;
  const eps = (rng() - 0.5) * 0.1;        // ±5% sur tension
  d.tension = d.tension * (1 + eps);

  /* État résultant. */
  const nextPatron = applyDeltaToPatron(ctx.patron, d);
  const nextSalarie = applyDeltaToSalarie(ctx.salarie, d);
  const nextShared = applyDeltaToShared(ctx.shared, d);

  /* Plancher dur povAchat si congesPayes_1936 débloqués. */
  if (ctx.acquis.has('congesPayes_1936')) {
    nextSalarie.povAchat = Math.max(30, nextSalarie.povAchat);
  }

  const unlocked = unlockAcquis(patronPosture, salariePosture, ctx);
  const atelier = triggerAtelier(patronPosture, salariePosture, nextShared, ctx);
  const newDelayed = buildDelayedEffects(patronPosture, salariePosture, ctx);

  return {
    cell: { patron: patronPosture, salarie: salariePosture },
    baseDelta,
    finalDelta: d,
    appliedMods,
    nextPatron,
    nextSalarie,
    nextShared,
    unlocked,
    atelier,
    newDelayed
  };
}

/* ============================================================
   14. HELPER — création d'un contexte par défaut (factories tests)
   ============================================================ */

export function defaultPatronManoeuvre(): PatronManoeuvre {
  return {
    salaires: 15, investissement: 15, lobbying: 15,
    sousTraitance: 15, communication: 15, reserve: 25
  };
}

export function defaultSalarieManoeuvre(): SalarieManoeuvre {
  return {
    tracts: 15, preavisGreve: 15, saisinePrudhomale: 15,
    coalitionInter: 15, mediatisation: 15, caisseSolidarite: 25
  };
}

export function defaultContext(): ResolveContext {
  return {
    turn: 1,
    period: 'contemporain',
    event: null,
    patronDoctrine: 'technocratique',
    salarieDoctrine: 'reformiste',
    patronManoeuvre: defaultPatronManoeuvre(),
    salarieManoeuvre: defaultSalarieManoeuvre(),
    patron: { marge: 50, climat: 50, capPol: 50, reputation: 50 },
    salarie: { povAchat: 50, droits: 50, cohesion: 50, legitimite: 50 },
    shared: { tension: 30 },
    acquis: new Set(),
    delayed: []
  };
}
