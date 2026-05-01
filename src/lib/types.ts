/* ============================================================
   Paritas — types du jeu
   ============================================================ */

export type Camp = 'salarie' | 'patron';

export type GameMode = 'perspicacite' | 'jet' | 'expert';

export type Difficulty = 0 | 1 | 2;

export type SkillKey =
  | 'negociation'
  | 'politique'
  | 'baratin'
  | 'production'
  | 'mobilisation'
  | 'expertise';

export type ResourceKey =
  | 'prestige'
  | 'caisse'
  | 'soutien'
  | 'influence'
  | 'sante';

export type CapitalKey =
  | 'economique'
  | 'social'
  | 'militant'
  | 'institutionnel'
  | 'symbolique';

export type StatKey = SkillKey | ResourceKey | CapitalKey;

/** Tag attaché à un choix : nourrit la détection de profil + capitaux. */
export type ChoiceTag =
  | 'signe'
  | 'negocie'
  | 'institution'
  | 'mobilise'
  | 'greve'
  | 'refuse'
  | 'discours'
  | 'lobbying'
  | 'production'
  | 'dur'
  | 'memoire';

/* ============================================================
   Événements
   ============================================================ */

/** Effets numériques sur stats (skills/resources/capitaux). */
export type Effects = Partial<Record<StatKey, number>>;

/** Choix offert au joueur sur une carte. */
export interface Choice {
  /** Texte du bouton ou label de swipe. */
  text: string;
  /** Pictogramme (emoji ou identifiant SVG). */
  icon?: string;
  /** Justification pédagogique courte. */
  why?: string;
  /** Effets directs en cas de succès. */
  effects: Effects;
  /** Variante en cas d'échec critique (sinon halveEffects). */
  effectsFail?: Effects;
  /** Compétence sollicitée (mode tirage). */
  skillUp?: SkillKey;
  /** Difficulté de classe pour le tirage (10 facile, 70+ très dur). */
  dc?: number;
  /** Tag pour la détection de profil et l'effet sur capitaux. */
  tag?: ChoiceTag;
  /** Drapeau historique posé en cas de réussite. */
  flag?: string;
  /** Filtre par camp ou par état du jeu. */
  req?: (ctx: ChoiceContext) => boolean;
  /** Marqué comme choix recommandé par l'historien. */
  recommended?: boolean;
  /** Marqué comme risqué (style visuel). */
  risky?: boolean;
  /** Mot d'impact (pour overlay de transition). */
  impact?: string;
  /** Explication post-choix (mode induction). */
  explanation?: string;
  /** Conséquence à long terme. */
  longterm?: string;
}

export interface ChoiceContext {
  camp: Camp;
}

/** Format d'un événement narratif. Hybride Reigns / Suzerain. */
export interface GameEvent {
  /** ID unique. */
  id: string;
  /** ID de l'époque (0..7). */
  era: number;
  /** Format de présentation. */
  format: 'reigns' | 'suzerain' | 'dilemma' | 'recap';
  /** Titre court. */
  title: string;
  /** Date / lieu pour ambiance. */
  date?: string;
  /** Texte d'introduction (peut dépendre du camp). */
  situation: string | ((ctx: ChoiceContext) => string);
  /** Encart historique sourcé. */
  historical?: string;
  /** Encadré court sur la portée socio-historique. */
  portee?: string;
  /** Anecdote curieuse. */
  saviez?: string;
  /** Choix offerts. */
  choices: Choice[];
  /** Pour Suzerain : dialogue multi-étapes avant les choix. */
  dialogue?: DialogueStep[];
  /** Pour Suzerain : portrait du PNJ (initiales). */
  pnj?: { name: string; init: string; side?: Camp | 'neutre' };
  /** Illustration vectorielle (clé d'asset). */
  illus?: string;
  /** Débloque une figure du carnet. */
  unlocks?: string;
  /** Pour Reigns : choix gauche/droite (indices dans choices). */
  swipe?: { left: number; right: number };
}

export interface DialogueStep {
  who: 'narrateur' | 'pnj' | 'self';
  text: string;
  /** Sous-texte implicite (couche 2 du modèle 3 couches). */
  subtext?: string;
}

/* ============================================================
   Profils doctrinaux & figures
   ============================================================ */

export interface Profil {
  id: string;
  nom: string;
  ico: string;
  camp: Camp | 'any';
  desc: string;
  figures: string;
  bonus?: Partial<Record<StatKey, number>>;
}

export interface Figure {
  id: string;
  nom: string;
  yr: string;
  init: string;
  rarete: 'argent' | 'or' | 'legendaire';
  bio: string;
  bonus?: Partial<Record<StatKey, number>>;
  unlocks: string[];
}

/* ============================================================
   État du jeu
   ============================================================ */

export interface GameState {
  /* Identité */
  name: string;
  camp: Camp | null;
  legendaryId: string | null;
  mode: GameMode;
  difficulty: Difficulty;

  /* Progression */
  turn: number;
  era: number;

  /* Trois couches */
  skills: Record<SkillKey, number>;
  resources: Record<ResourceKey, number>;
  capitaux: Record<CapitalKey, number>;

  /* Détection */
  profil: string | null;
  profilScores: Record<string, number>;

  /* Mémoire dialectique */
  lastChoiceTag: ChoiceTag | null;
  lastChoiceFailed: boolean;
  activeTensions: string[];
  systemLog: SystemLogEntry[];

  /* Collections */
  figures: string[];
  team: Record<string, number>; // role -> level 0..3

  /* Compteurs */
  flags: Record<string, number>;
  questsDone: Record<string, number>;
  eggsFound: string[];
  jackpotCount: number;
  epicFailCount: number;
  refusedAccords: number;
  resultStreak: { kind: 's' | 'f' | null; count: number };

  /* Stats de tirages cumulées (pour RollCounter et tooltips) */
  rollStats: {
    total: number;
    success: number;
    fail: number;
    jackpots: number;
    crits: number;
    bestRoll: number;        // meilleur tirage brut
    longestStreak: number;   // plus long enchainement de succès
    bySkill: Partial<Record<SkillKey, { rolls: number; success: number; sumRoll: number }>>;
  };

  /* Historique pour tendances */
  history: HistorySnapshot[];
  decisions: DecisionLog[];

  /* Rival */
  rival: { name: string; score: number; lastMove: string | null };

  /* Méta */
  log: string[];
  ended: 'evince' | 'fin' | false;
}

export interface SystemLogEntry {
  turn: number;
  resource?: string;
  delta?: number;
  reason?: string;
  type?: 'tension';
  label?: string;
}

export interface HistorySnapshot {
  turn: number;
  skills: Record<SkillKey, number>;
  resources: Record<ResourceKey, number>;
  capitaux: Record<CapitalKey, number>;
  score: number;
}

export interface DecisionLog {
  turn: number;
  era: string;
  title: string;
  choice: string;
  tag?: ChoiceTag;
  success: boolean;
}

/* ============================================================
   Roles & synergies
   ============================================================ */

export interface Role {
  id: string;
  nom: string;
  ico: string;
  desc: string;
  /** Multiplicateurs sur stats (1.2 = +20%). */
  bonus: Partial<Record<StatKey, number>>;
}

export interface Synergy {
  team: string[]; // role ids
  nom: string;
  bonus: Partial<Record<StatKey, number>>;
}
