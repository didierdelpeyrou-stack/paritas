import type { PlayerTrait, ResourceKey } from '../types';

export type ObjectiveCondition =
  | { kind: 'resource-min'; resource: ResourceKey; threshold: number }
  | { kind: 'resource-max'; resource: ResourceKey; threshold: number }
  | { kind: 'institutions-built'; count: number }
  | { kind: 'accords-signed'; count: number }
  | { kind: 'refuse-compromise'; count: number }
  | { kind: 'no-betrayal'; max: number }
  | { kind: 'flag-set'; flag: string }
  | { kind: 'trait-dominant'; trait: PlayerTrait };

export interface RoleObjective {
  /** Stable id, used for save serialization and progress lookup. */
  id: string;
  /** Short title surfaced in panels (≤ 28 chars). */
  label: string;
  /** One-sentence description of what is required. */
  description: string;
  /** Machine-checkable condition. */
  condition: ObjectiveCondition;
  /** Optional turn deadline. After this turn, an unsatisfied objective is permanently failed. */
  byTurn?: number;
  /** Importance for end-of-run score. 1 = modest, 3 = capital. */
  weight: 1 | 2 | 3;
}

export interface ObjectiveProgress {
  id: string;
  /** Current advancement, 0..100. */
  progress: number;
  /** Currently satisfied (snapshot, may flip back if values regress). */
  satisfied: boolean;
  /** Permanently failed (deadline elapsed without ever being satisfied). */
  failed: boolean;
}
