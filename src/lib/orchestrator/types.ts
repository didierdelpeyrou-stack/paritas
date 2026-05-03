/* ============================================================
   Paritas — Moteur d'orchestration des mini-jeux
   ============================================================
   Vague β. Chaque tour, le joueur peut déclencher 1-3 ACTIONS
   parmi un catalogue. Chaque action :
   - consomme des coûts (Caisse, Mandat, temps)
   - produit des effets (jauges, flags)
   - peut ouvrir un mini-jeu détaillé (Trésorerie, Manif, Meeting,
     Tracts, Pétition, Délégation, Lock-out, Recrutement, Boycott,
     Affiches, Presse, Signature)
   - a un cooldown (réutilisable après N tours)
   - a des préconditions (déverrouillée à partir de tour X, exige
     telle institution, telle posture, etc.)

   Spec : V2_AVIS_MINIJEUX_TABLE.md §8 + suggestion utilisateur
   d'unification (tracts, signature, etc.).
   ============================================================ */

import type { IconKey } from '../../components/cockpit/icons';

/* ====== Identifiants ====== */

export type MiniJeuId =
  | 'tresorerie'      // alloue le budget annuel
  | 'manifestation'   // organise une manif
  | 'meeting'         // tient un meeting public
  | 'tracts'          // distribue des tracts
  | 'affiches'        // campagne d'affichage
  | 'petition'        // lance une pétition
  | 'delegation'      // envoie une délégation au pouvoir
  | 'signature'       // ratifie/signe un accord
  | 'recrutement'     // ouvre un bureau de recrutement
  | 'lockout'         // (patron) ferme l'usine
  | 'boycott'         // appelle au boycott
  | 'presse'          // publie un article
  | 'congres'         // tient un congrès interne (Mandat)
  | 'table'           // ouvre La Table des Négociations (popup)
  | 'organisation'    // gère le siège
  | 'talents'         // forme un talent
  | 'monde';          // gère la couverture régionale/EU

/* ====== Coûts et effets ====== */

export interface ActionCost {
  /** Caisse consommée (francs / euros). */
  caisse?: number;
  /** Mandat interne consommé (capital politique). */
  mandat?: number;
  /** Temps : nombre d'actions équivalentes. 1 = courte, 3 = lourde. */
  temps?: 1 | 2 | 3;
  /** Talents requis (juridique, médiatique, terrain, négociation). */
  talents?: Partial<Record<TalentKind, number>>;
}

export type TalentKind = 'juridique' | 'mediatique' | 'terrain' | 'negociation';

export interface ActionEffect {
  /** Deltas sur les ressources principales. */
  resources?: Partial<{
    confiance: number;
    caisse: number;
    legitimite: number;
    rapportDeForce: number;
    cohesionInterne: number;
    santeSociale: number;
    institution: number;
  }>;
  /** Posera ce flag (Memory). */
  flag?: string;
  /** Honte/Fierté delta (V1 GameState only pour l'instant). */
  honteFierte?: number;
  /** Modificateurs sur les acteurs (trust/pressure/patience). */
  actors?: Partial<Record<'base' | 'adversaire' | 'etat' | 'opinion',
    Partial<{ trust: number; pressure: number; patience: number }>>>;
  /** Résultat narratif visible (consequence text). */
  narrative?: string;
}

/* ====== Préconditions ====== */

export type ActionPrecondition =
  | { kind: 'turn-min'; turn: number }
  | { kind: 'turn-range'; from: number; to: number }
  | { kind: 'era-in'; eras: string[] }
  | { kind: 'flag-set'; flag: string }
  | { kind: 'flag-unset'; flag: string }
  | { kind: 'resource-min'; resource: string; min: number }
  | { kind: 'camp-only'; camp: 'salarie' | 'patron' }
  | { kind: 'organization-has'; assetId: string };

/* ====== Action ====== */

export interface ActionDef {
  id: MiniJeuId | string;
  /** Nom court affiché dans le menu d'actions. */
  label: string;
  /** Description courte (1 phrase, max 100 chars). */
  description: string;
  /** Icône SVG paritaire pour le menu. */
  icon: IconKey;
  /** Couleur d'accent (matche les onglets cockpit). */
  accent: string;
  /** Catégorie pour regroupement. */
  category: ActionCategory;
  /** Coût d'exécution. */
  cost: ActionCost;
  /** Effets garantis (succès baseline). */
  effects: ActionEffect;
  /** Effets en cas d'échec (probabilité par défaut 15%). */
  effectsFail?: ActionEffect;
  /** Probabilité d'échec (0-1). 0 = jamais, 0.15 = défaut. */
  failProbability?: number;
  /** Cooldown en tours après usage. */
  cooldown?: number;
  /** Préconditions à satisfaire pour pouvoir utiliser. */
  preconditions?: ActionPrecondition[];
  /** Si true, ouvre un mini-jeu détaillé (drawer / popup). */
  opensMinigame?: MiniJeuId;
  /** Tag narratif pour le journal de partie. */
  journalTag?: string;
}

export type ActionCategory =
  | 'mobilisation'   // manif, meeting, tracts, affiches, mégaphone
  | 'finance'        // trésorerie, recrutement, lock-out
  | 'institutionnel' // signature, délégation, congrès, table
  | 'communication'  // presse, pétition, boycott
  | 'organisation';  // siège, talents, monde

/* ====== État d'orchestration ====== */

export interface OrchestratorState {
  /** Tour courant — copie depuis gameState pour cooldowns. */
  turn: number;
  /** Cooldowns en cours : actionId → tour de fin. */
  cooldowns: Record<string, number>;
  /** Compteur d'actions ce tour-ci (limite 1-3 selon difficulté). */
  actionsThisTurn: number;
  /** Maximum d'actions par tour. */
  maxActionsPerTurn: number;
  /** Historique des actions exécutées (append-only). */
  history: ActionLog[];
}

export interface ActionLog {
  turn: number;
  actionId: string;
  outcome: 'success' | 'fail';
  effectsApplied: ActionEffect;
}

/* ====== Résultat d'exécution ====== */

export interface ActionResult {
  outcome: 'success' | 'fail' | 'blocked';
  /** Raison si bloqué (cooldown, précondition, etc.). */
  blockReason?: string;
  effectsApplied?: ActionEffect;
  narrative?: string;
}
