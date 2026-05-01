import type { RebirthGameState } from '../types';
import type { ObjectiveCondition, ObjectiveProgress, RoleObjective } from './types';

export function evaluateObjectives(
  state: RebirthGameState,
  objectives: RoleObjective[],
  previous: ObjectiveProgress[] = []
): ObjectiveProgress[] {
  return objectives.map(objective => {
    const ratio = computeRatio(state, objective.condition);
    const satisfied = ratio >= 1;
    const previouslyFailed = previous.find(p => p.id === objective.id)?.failed ?? false;
    const failed =
      previouslyFailed ||
      (objective.byTurn !== undefined && state.turn > objective.byTurn && !satisfied);
    return {
      id: objective.id,
      progress: Math.round(Math.min(1, ratio) * 100),
      satisfied,
      failed
    };
  });
}

function computeRatio(state: RebirthGameState, condition: ObjectiveCondition): number {
  switch (condition.kind) {
    case 'resource-min':
      return safeRatio(state.resources[condition.resource], condition.threshold);
    case 'resource-max': {
      const value = state.resources[condition.resource];
      if (value <= condition.threshold) return 1;
      const overshoot = value - condition.threshold;
      const room = Math.max(1, 100 - condition.threshold);
      return Math.max(0, 1 - overshoot / room);
    }
    case 'institutions-built':
      return safeRatio(state.memory.builtInstitutions.length, condition.count);
    case 'accords-signed':
      return safeRatio(state.memory.signedMajorAccords.length, condition.count);
    case 'refuse-compromise':
      return safeRatio(state.memory.refusedCompromise, condition.count);
    case 'no-betrayal': {
      const used = state.memory.betrayedBase;
      if (used <= condition.max) return 1;
      const overflow = used - condition.max;
      return Math.max(0, 1 - overflow / Math.max(1, condition.max + 1));
    }
    case 'flag-set':
      return condition.flag in state.memory.flags ? 1 : 0;
    case 'trait-dominant':
      return state.dominantTrait === condition.trait ? 1 : 0;
  }
}

function safeRatio(actual: number, target: number): number {
  if (target <= 0) return 1;
  return Math.max(0, Math.min(1, actual / target));
}

export function objectiveScoreContribution(
  progress: ObjectiveProgress[],
  objectives: RoleObjective[]
): number {
  if (objectives.length === 0) return 0;
  let achievable = 0;
  let earned = 0;
  for (const objective of objectives) {
    const status = progress.find(p => p.id === objective.id);
    achievable += objective.weight;
    if (!status) continue;
    if (status.satisfied) earned += objective.weight;
    else if (!status.failed) earned += objective.weight * (status.progress / 100) * 0.4;
  }
  if (achievable === 0) return 0;
  return Math.round((earned / achievable) * 100);
}
