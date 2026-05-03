/* ============================================================
   Paritas — Rebirth V1
   Types du moteur narratif + simulation légère.
   ============================================================ */

import type { Camp } from '../lib/types';
import type { PlayerOrganization } from './org/types';
import type { ActiveStrategy } from './strategy/types';
import type { WorldAIState } from './ai/types';
import type { ActivePipeline } from './narrative/pipelineTypes';
import type { ObjectiveProgress, RoleObjective } from './objectives/types';

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
   7 ressources, 4 acteurs.

   Note vague α (Omnès #88) : le rapport de force est désormais
   décomposé en deux dimensions distinctes que la sociologie des
   relations professionnelles distingue depuis Catherine Omnès :
   - rapportDeForce       = force EXTERNE (pression du syndicat
                            sur l'adversaire : manif, grève, presse)
   - cohesionInterne      = force INTERNE (pression de la base sur
                            le SG : assemblée, conseil, vote)
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
  /** Force EXTERNE : capacité à imposer dans la négociation face à
   *  l'adversaire (manif, grève, presse) (0-100) */
  rapportDeForce: number;
  /** Force INTERNE : cohésion entre toi et ta base (assemblée,
   *  conseil, vote interne). Ajoutée vague α (Omnès #88) pour
   *  distinguer la pression interne de la pression externe.
   *  (0-100) */
  cohesionInterne: number;
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
  'cohesionInterne',
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
  /** Texte du bouton (fallback si pas de campText pour le camp courant). */
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
  /** Nécessite que ce trait soit dominant pour être sélectionnable. Sinon, le bouton apparaît verrouillé. */
  requiresTrait?: PlayerTrait;
  /** Si défini, le choix n'apparaît QUE pour ce camp (filtrage strict).
   *  Permet d'ajouter des branches alternatives patron/salarié sans
   *  les imposer à l'autre camp. */
  camp?: Camp;
  /** Texte alternatif par camp — si présent, remplace `text` pour le
   *  camp donné. Permet de reformuler un choix universel pour qu'il
   *  reflète le point de vue stratégique du camp courant (vs. cadrage
   *  syndicaliste implicite). Audit asymétrie patron, retour live test. */
  campText?: Partial<Record<Camp, string>>;
  /** Idem pour l'intent (libellé court au-dessus du texte). */
  campIntent?: Partial<Record<Camp, string>>;
  /** Ability d'attache : si défini, les effets numériques de ce choix
   *  sont MODULÉS par l'énergie courante de cette ability (fuel score).
   *  Borné à ±20% (cf. resourceUtility.fuelMultiplier). Permet aux
   *  scénarios d'utiliser le système de carburant — préparer ses
   *  ressources en amont rend les choix correspondants plus puissants. */
  ability?:
    | 'tresorerie'
    | 'manifestation'
    | 'meeting'
    | 'talents'
    | 'tracts'
    | 'petition'
    | 'presse'
    | 'delegation'
    | 'table'
    | 'congres';
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

  /** Filtre pour ne montrer ce scénario qu'à certains personnages légendaires (ids). */
  personaFilter?: string[];

  /** Marqué premium (12 scénarios premium V1) */
  premium?: boolean;
}

/* ============================================================
   Quêtes secondaires & événements diégétiques (V3)
   ============================================================
   Petits vignettes interactives qui se glissent entre deux
   scénarios principaux pour donner de la chair au camp joué.
   Inspiration : événements CK3, "wandering encounters" RPG.
   ============================================================ */

export interface SideEventChoice {
  id: string;
  text: string;
  /** Phrase courte sous le bouton qui donne le tempo / la couleur. */
  intent?: string;
  effects: Effects;
  /** Texte de résolution affiché après le clic (court : 1-3 phrases). */
  outcome: string;
  /** Probabilité d'échec (0-1). Si tirée, applique `failOutcome` au lieu
   *  de `outcome`, et `failEffects` à la place de `effects`. Permet les
   *  choix risqués type "La police avec nous!". */
  failProbability?: number;
  failOutcome?: string;
  failEffects?: Effects;
  traitShift?: Partial<TraitScores>;
  /** Filtre par trait dominant pour verrouiller un choix de caractère. */
  requiresTrait?: PlayerTrait;
  /** Drapeau historique posé (mémoire). */
  flag?: string;
}

export interface SideEvent {
  id: string;
  /** Camp ciblé. Si absent → événement universel (rare). */
  camp?: Camp;
  /** Fenêtre temporelle (turns) — défaut : tout le jeu. */
  fromTurn?: number;
  toTurn?: number;
  /** Ères ciblées (alternative à fromTurn/toTurn). */
  eras?: EraId[];
  /** Trait dominant requis (filtre additionnel). */
  requiresTrait?: PlayerTrait;
  /** Conditions de ressources (ex : caisse < 30). */
  resourceCondition?: (r: Resources) => boolean;
  /** Poids de tirage relatif (défaut 1). Plus élevé = plus probable. */
  weight?: number;
  /** Titre affiché en bandeau. */
  title: string;
  /** Sous-titre / lieu. */
  subtitle?: string;
  /** Court setup (≤ 4 lignes). */
  setup: string;
  /** 2-4 choix. */
  choices: SideEventChoice[];
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
  /** Personnage légendaire incarné (id de legendaryCharacters), ou null. */
  legendaryId: string | null;

  /* Progression */
  turn: number;          // 1..100
  era: EraId;
  currentScenarioId: string | null;

  /* Traits du joueur (personnalité émergente) */
  traits: TraitScores;
  /** Trait dominant calculé par personalityEngine */
  dominantTrait: PlayerTrait;
  /** Stress de personnalité (0-100). Augmente quand le joueur agit
   *  contre son trait dominant ; diminue quand il agit dans son sens.
   *  Inspiré du système de stress de Crusader Kings 3. */
  personalityStress: number;

  /* Simulation */
  resources: Resources;
  actors: Actors;
  organization: PlayerOrganization;
  activeStrategies: ActiveStrategy[];
  worldAI: WorldAIState;
  activePipelines: ActivePipeline[];

  /* Mémoire */
  memory: Memory;

  /* Objectifs assignés au rôle (snapshot figé au démarrage) + suivi */
  objectives: RoleObjective[];
  objectiveProgress: ObjectiveProgress[];

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
