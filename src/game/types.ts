/* ============================================================
   Paritas — Rebirth V1
   Types du moteur narratif + simulation légère.
   ============================================================ */

import type { Camp } from '../lib/types';
import type { PlayerOrganization } from './org/types';
import type { ActiveStrategy } from './strategy/types';
import type { WorldAIState } from './ai/types';

/* ============================================================
   Identité du joueur — Rebirth
   ============================================================ */

export type PlayerTrait =
  | 'batisseur'
  | 'rupture'
  | 'technocrate'
  | 'pragmatique'
  | 'paternaliste'
  | 'tribun';

export const ALL_TRAITS: PlayerTrait[] = [
  'batisseur',
  'rupture',
  'technocrate',
  'pragmatique',
  'paternaliste',
  'tribun'
];

export type TraitScores = Record<PlayerTrait, number>;

/* ============================================================
   Modes de rendu — Réfléchi vs Compulsif
   ============================================================ */

export type RenderMode = 'reflechi' | 'compulsif';

/* ============================================================
   Eras (jalons historiques)
   ============================================================ */

export type EraId =
  | 'antiquite'
  | 'medieval'
  | 'revolution'
  | 'xixe'
  | 'belle_epoque'
  | 'entre_deux_guerres'
  | 'reconstruction'
  | 'guerre_froide'
  | 'trente_glorieuses'
  | 'crise'
  | 'mitterrand'
  | 'cohabitations'
  | 'sarkozy'
  | 'hollande'
  | 'macron_i'
  | 'macron_ii'
  | 'present';

/* ============================================================
   Simulation légère
   6 ressources, 4 acteurs.
   ============================================================ */

export interface Resources {
  /** Confiance de la base : crois-tu en moi ? (0-100) */
  confiance: number;
  /** Réserves financières et institutionnelles (0-100) */
  caisse: number;
  /** État du tissu social (0-100, jauge Hope/Discontent) */
  santeSociale: number;
  /** Légitimité publique perçue (0-100) */
  legitimite: number;
  /** Capacité à imposer dans le rapport de force (0-100) */
  rapportDeForce: number;
  /** Solidité durable des institutions paritaires construites (0-100) */
  institution: number;
}

export type ResourceKey = keyof Resources;

export const ALL_RESOURCES: ResourceKey[] = [
  'confiance',
  'caisse',
  'santeSociale',
  'legitimite',
  'rapportDeForce',
  'institution'
];

export type ActorId = 'base' | 'adversaire' | 'etat' | 'opinion';

export type ActorStance = 'cooperatif' | 'dur' | 'instable' | 'opportuniste';

export interface Actor {
  /** Confiance que l'acteur place dans le joueur (0-100) */
  trust: number;
  /** Niveau de pression que l'acteur met au joueur (0-100) */
  pressure: number;
  /** Patience restante avant rupture (0-100) */
  patience: number;
  /** Posture courante */
  stance: ActorStance;
}

export type Actors = Record<ActorId, Actor>;

/* ============================================================
   Effets et choix
   ============================================================ */

export interface Effects {
  /** Deltas appliqués aux ressources */
  resources?: Partial<Resources>;
  /** Deltas appliqués aux acteurs */
  actors?: Partial<Record<ActorId, Partial<Actor>>>;
}

export interface ChoiceConsequence {
  /** Conséquence narrative immédiate, écrite à la main */
  immediate: string;
  /** Optionnel : conséquence à long terme, qui pourra être déclenchée plus tard */
  longterm?: string;
  /** Optionnel : clé d'illustration à afficher */
  image?: string;
}

export interface Choice {
  id: string;
  /** Texte du bouton */
  text: string;
  /** Intention courte affichée en mode Réfléchi (label gris au-dessus du texte) */
  intent: string;
  /** Rappel théorique court en mode Réfléchi */
  theoryHint?: string;
  /** Effets numériques appliqués */
  effects: Effects;
  /** Conséquence narrative (immédiate + long terme) */
  consequence: ChoiceConsequence;
  /** Évolution des traits du joueur */
  traitShift?: Partial<TraitScores>;
  /** Pose un drapeau historique nommé (mémoire) */
  flag?: string;
}

/* ============================================================
   Scénarios
   ============================================================ */

export type SceneMood = 'calme' | 'tendu' | 'grave' | 'euphorique' | 'melancolique';

export interface ScenarioSetup {
  /** Texte pédagogique court, fiche d'histoire (mode Réfléchi) */
  reflechi: string;
  /** Prose dense, voix intérieure, mood (mode Compulsif) */
  compulsif: string;
}

export interface VoiceLine {
  /** Trait qui parle */
  trait: PlayerTrait;
  /** Court (≤120 chars de préférence) */
  text: string;
}

export interface Scenario {
  id: string;
  /** Tour cible recommandé (peut être ajusté par scenarioEngine) */
  turn: number;
  /** Date affichée à l'écran ("7 juin 1936") */
  date: string;
  era: EraId;
  /** Titre court ("Hôtel Matignon") */
  title: string;
  /** Sous-titre / lieu */
  subtitle?: string;
  mood: SceneMood;

  /** Description du contexte historique pour la fiche */
  historicalContext: string;

  /** Setups Réfléchi & Compulsif */
  setup: ScenarioSetup;

  /** Acteurs présents */
  actors: ActorId[];

  /** Voix intérieures disponibles dans le mode Compulsif */
  voices?: VoiceLine[];

  /** Citations sourcées à exposer */
  quotes?: { text: string; source: string }[];

  /** Choix disponibles */
  choices: Choice[];

  /** Filtre pour ne montrer ce scénario qu'à un camp donné (ou null = tous) */
  campFilter?: Camp | null;

  /** Marqué premium (12 scénarios premium V1) */
  premium?: boolean;
}

/* ============================================================
   Mémoire historique
   ============================================================ */

export interface Memory {
  /** Compteur de compromis refusés */
  refusedCompromise: number;
  /** Liste d'IDs d'accords majeurs signés ("matignon", "grenelle", etc.) */
  signedMajorAccords: string[];
  /** Compteur de fois où la base a été trahie */
  betrayedBase: number;
  /** Liste d'IDs d'institutions construites ("prudhommes-1806", "secu-1945", etc.) */
  builtInstitutions: string[];
  /** Compteur de mouvements épuisés (grèves longues sans victoire) */
  exhaustedMovements: number;
  /** Drapeaux historiques nommés posés par les choix */
  flags: Record<string, number>;
  /** IDs de scénarios déjà joués (pour éviter répétition) */
  playedScenarios: string[];
  /** Conséquences "longterm" en attente de déclenchement */
  pendingLongterm: { fromScenario: string; text: string; turnPosed: number }[];
}

/* ============================================================
   État de jeu Rebirth
   ============================================================ */

export interface RebirthGameState {
  /* Identité */
  name: string;
  camp: Camp;
  mode: RenderMode;

  /* Progression */
  turn: number;          // 1..100
  era: EraId;
  currentScenarioId: string | null;

  /* Traits du joueur (personnalité émergente) */
  traits: TraitScores;
  /** Trait dominant calculé par personalityEngine */
  dominantTrait: PlayerTrait;

  /* Simulation */
  resources: Resources;
  actors: Actors;
  organization: PlayerOrganization;
  activeStrategies: ActiveStrategy[];
  worldAI: WorldAIState;

  /* Mémoire */
  memory: Memory;

  /* Phase du tour */
  phase: GamePhase;
  /** Dernier choix pris (pour la scène de conséquence) */
  lastChoice: { scenarioId: string; choiceId: string } | null;
  /** Texte de conséquence à afficher dans la phase 'consequence' */
  lastConsequenceText: string | null;

  /* Fin */
  endingId: EndingId | null;
}

export type GamePhase = 'idle' | 'scene' | 'consequence' | 'ended';

export type EndingId =
  | 'mutilation'
  | 'resistance'
  | 'refondation'
  | 'capture'
  | 'inacheve';

/* ============================================================
   Score final / fin de partie
   ============================================================ */

export interface RunStats {
  turnsPlayed: number;
  scenariosPlayed: number;
  institutionsBuilt: number;
  refusedCompromise: number;
  betrayedBase: number;
  exhaustedMovements: number;
  finalResources: Resources;
  finalDominantTrait: PlayerTrait;
  endingId: EndingId;
}
