import type { ActorId, Resources } from '../types';
import type { OrganizationDelta } from '../org/types';

export type StrategyTarget = 'base' | 'adversaire' | 'etat' | 'opinion' | 'institution';

export interface StrategyCost {
  treasury?: number;
  cohesion?: number;
  resource?: Partial<Resources>;
}

export interface StrategyProgressWeights {
  militants?: number;
  permanentStaff?: number;
  legalTeam?: number;
  mediaRelay?: number;
  localSections?: number;
  cohesion?: number;
  reputation?: number;
}

export interface StrategyDefinition {
  id: string;
  label: string;
  description: string;
  unlockTurn: number;
  target: StrategyTarget;
  duration: number;
  risk: number;
  costPerTurn: StrategyCost;
  progressWeights: StrategyProgressWeights;
  success: {
    orgDelta?: OrganizationDelta;
    resourceDelta?: Partial<Resources>;
    actorDelta?: Partial<Record<ActorId, { trust?: number; pressure?: number; patience?: number }>>;
    narrative: string;
  };
  failure: {
    orgDelta?: OrganizationDelta;
    resourceDelta?: Partial<Resources>;
    actorDelta?: Partial<Record<ActorId, { trust?: number; pressure?: number; patience?: number }>>;
    narrative: string;
  };
}

export interface ActiveStrategy {
  id: string;
  startedTurn: number;
  remainingTurns: number;
  progress: number;
  risk: number;
}
