import type { Camp } from '../../lib/types';
import type { ActorId, Resources } from '../types';

export type Doctrine =
  | 'compromis'
  | 'rupture'
  | 'expertise'
  | 'implantation'
  | 'influence';

export type OrgAssetType =
  | 'local'
  | 'media'
  | 'legal'
  | 'training'
  | 'strikeFund'
  | 'lobbying'
  | 'research';

export type TalentGroup = 'reflexion' | 'action' | 'communication';

/** Stratégie budgétaire active. Modifie les multiplicateurs de flux. */
export type BudgetStrategy = 'epargne' | 'equilibre' | 'distribution';

export interface EngagedTalent {
  /** ID du talent (référence vers le catalogue). */
  catalogId: string;
  /** Nom affiché (snapshot pour rester stable même si le catalogue bouge). */
  nom: string;
  /** Spécialité affichée. */
  specialite: string;
  /** Tour auquel le talent a été engagé. */
  hiredTurn: number;
  /** Groupe auquel le talent est affecté, ou null si en réserve. */
  group: TalentGroup | null;
}

export interface PlayerOrganization {
  name: string;
  camp: Camp;
  doctrine: Doctrine;
  treasury: number;
  membership: number;
  militants: number;
  permanentStaff: number;
  legalTeam: number;
  mediaRelay: number;
  localSections: number;
  cohesion: number;
  reputation: number;
  /** Fatigue militante (0-100). Faible = militants frais ; haute = épuisement, désengagement. */
  mobilisationFatigue: number;
  factions: InternalFaction[];
  election: InternalElectionState | null;
  assets: string[];
  /** Talents recrutés et leur affectation à un groupe (réflexion / action / communication). */
  engagedTalents: EngagedTalent[];
  /** Stratégie budgétaire active. */
  budgetStrategy: BudgetStrategy;
  actionHistory: string[];
  /**
   * Tour auquel chaque action ponctuelle de gestion (souscription, hausse de
   * cotisations, aide aux grévistes…) a été utilisée pour la dernière fois.
   * Sert au gating des cooldowns. Optionnel : les vieilles sauvegardes ne
   * possèdent pas le champ.
   */
  treasuryActionTurns?: Record<string, number>;
}

export type FactionId = 'reformistes' | 'radicaux' | 'institutionnels' | 'territoriaux';

export interface InternalFaction {
  id: FactionId;
  label: string;
  influence: number;
  loyalty: number;
  demand: string;
}

export interface InternalElectionState {
  active: boolean;
  startedTurn: number;
  roundsLeft: number;
  playerMomentum: number;
  oppositionMomentum: number;
  issue: string;
}

export interface OrganizationDelta {
  treasury?: number;
  membership?: number;
  militants?: number;
  permanentStaff?: number;
  legalTeam?: number;
  mediaRelay?: number;
  localSections?: number;
  cohesion?: number;
  reputation?: number;
  mobilisationFatigue?: number;
}

export interface OrgAction {
  id: string;
  label: string;
  description: string;
  unlockTurn: number;
  camp?: Camp | 'any';
  cost: number;
  doctrine?: Doctrine;
  orgDelta: OrganizationDelta;
  resourceDelta?: Partial<Resources>;
  actorDelta?: Partial<Record<ActorId, { trust?: number; pressure?: number; patience?: number }>>;
  narrative: string;
}

export interface OrgAsset {
  id: string;
  label: string;
  type: OrgAssetType;
  description: string;
  unlockTurn: number;
  camp?: Camp | 'any';
  purchaseCost: number;
  upkeep: number;
  resaleValue: number;
  orgDelta: OrganizationDelta;
  resourceDelta?: Partial<Resources>;
}
