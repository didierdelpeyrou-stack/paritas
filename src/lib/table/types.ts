/* ============================================================
   Paritas — La Table des Négociations
   ============================================================
   Types du mini-jeu central V2-3. Conçu pour fonctionner en
   fenêtre popup séparée, synchronisée avec le jeu principal via
   BroadcastChannel.

   Spec : V2_AVIS_MINIJEUX_TABLE.md §6.
   ============================================================ */

export type TableScenarioId =
  | 'secu-1945'
  | 'matignon-1936'   // futur
  | 'cogestion-1947'  // futur
  | 'ani-2013'        // futur
  | 'ordonnances-2017'; // futur

export type TablePhase = 'opening' | 'concessions' | 'vote' | 'outcome';

export type ActorId = string;

/** Ligne rouge d'un acteur : topic + seuil de tolérance + bluff possible */
export interface RedLine {
  /** Sujet narratif de la ligne rouge (ex. "couverture universelle") */
  topic: string;
  /** Description visible côté owner */
  description: string;
  /** Seuil 0-100 — si la concession s'éloigne de plus que threshold,
   *  l'acteur perd massivement Mandat. */
  threshold: number;
  /** Déclarée publiquement (pas de bluff) ou cachée. */
  declared: boolean;
  /** Vraie ligne rouge si bluff (sinon === ce qui est déclaré). */
  realThreshold: number;
}

export interface ActorResources {
  mandat: number;       // 0-100, capacité à négocier sans concessions
  caisse: number;       // 0-100, ressources matérielles
  legitimite: number;   // 0-100, crédit public
}

export interface ActorPersona {
  id: ActorId;
  name: string;
  organization: string;       // "CGT", "Haut fonctionnaire", "CFTC", "Ouvriers chrétiens"
  shortBio: string;           // 1 phrase pour l'identifier
  /** Style de négociation pour les bots (templates de réponse). */
  style: 'ferme-chaleur' | 'technique-rigueur' | 'conciliant-resistant' | 'solidaire-base';
  /** Probabilité de bluff (0-1). 0 = jamais. */
  bluffProbability: number;
}

export interface Actor {
  persona: ActorPersona;
  isPlayer: boolean;          // un seul acteur isPlayer = true
  isBot: boolean;             // les autres
  resources: ActorResources;
  redLine: RedLine;
  /** Revendications affichées publiquement (3-5). */
  publicAgenda: string[];
  /** Vote final : null = pas voté */
  vote: 'oui' | 'non' | 'abstention' | null;
}

export interface AccordArticle {
  id: string;
  /** Texte court de l'article. */
  text: string;
  /** Acteur(s) qui l'ont proposé / soutiennent. */
  proposedBy: ActorId[];
  /** Acteur(s) qui s'y opposent. */
  opposedBy: ActorId[];
  /** Distance par rapport à la ligne rouge de chaque acteur. */
  redLineDistance: Record<ActorId, number>;
}

export type ConcessionType =
  | 'add-article'      // ajout d'un article au draft
  | 'remove-article'   // retrait
  | 'modify-article'   // modification du texte
  | 'support'          // ajout de soutien à un article existant
  | 'oppose';          // ajout d'opposition

export interface Concession {
  id: string;
  by: ActorId;
  type: ConcessionType;
  articleId?: string;
  newText?: string;
  /** Coût Mandat pour l'acteur qui propose. Calculé selon distance ligne rouge. */
  mandatCost: number;
  /** Tour où la concession a été faite. */
  turn: number;
}

export interface NegotiationState {
  scenarioId: TableScenarioId;
  scenarioTitle: string;
  scenarioDate: string;       // "Octobre 1945"
  scenarioContext: string;    // 2-3 phrases narratives

  phase: TablePhase;
  turn: number;               // 1..9 (3 opening + 5 concessions + 1 vote)
  totalTurns: number;         // 9 par défaut

  /** Acteur dont c'est le tour de parler / agir. null en phase vote. */
  currentSpeaker: ActorId | null;
  speakingOrder: ActorId[];   // ordre cyclique

  actors: Actor[];

  /** Articles en cours de négociation. */
  draft: AccordArticle[];

  /** Historique des concessions faites pendant la session. */
  concessions: Concession[];

  /** Type de validation requise. */
  validation: 'unanimite' | 'majorite-qualifiee' | 'majorite-simple';

  /** Outcome final, défini en phase 'outcome'. */
  outcome: TableOutcome | null;

  /** Création — utilisé pour générer le seed propre à la table. */
  startedAt: number;
  seed: string;
}

export interface TableOutcome {
  result: 'signe' | 'force-minoritaire' | 'impasse';
  /** Texte d'épilogue narratif. */
  epilogue: string;
  /** Effets sur l'acteur joueur, à renvoyer au jeu principal. */
  playerEffects: {
    mandat: number;
    caisse: number;
    legitimite: number;
    /** Pour le moteur Paritas : honteFierte gain/loss. */
    honteFierte: number;
    /** Flag à poser dans state.flags. */
    flag?: string;
  };
  /** Articles signés au final (peut être un sous-ensemble du draft). */
  signedArticles: AccordArticle[];
}

/* ============================================================
   Messages BroadcastChannel pour sync entre fenêtres
   ============================================================ */

export type TableMessage =
  | { kind: 'launch'; sessionId: string; scenarioId: TableScenarioId; playerCamp: 'salarie' | 'patron'; playerSeed: string }
  | { kind: 'ready'; sessionId: string }
  | { kind: 'state'; sessionId: string; state: NegotiationState }
  | { kind: 'outcome'; sessionId: string; outcome: TableOutcome }
  | { kind: 'close'; sessionId: string };
