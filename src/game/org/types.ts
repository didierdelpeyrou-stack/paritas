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
  assets: string[];
  actionHistory: string[];
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
