import type { Scenario } from '../../types';
import { SCENARIO_1936_MATIGNON } from './1936-matignon';
import { PREMIUM_SCENARIOS } from './premium';

export const ALL_SCENARIOS: Scenario[] = [...PREMIUM_SCENARIOS, SCENARIO_1936_MATIGNON].sort(
  (a, b) => a.turn - b.turn
);

export function scenarioById(id: string): Scenario | undefined {
  return ALL_SCENARIOS.find(s => s.id === id);
}
