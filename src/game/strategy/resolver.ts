import type { ActorId, RebirthGameState, Resources } from '../types';
import { applyActorsDelta } from '../simulation/actors';
import { applyResourceDelta, clamp } from '../simulation/resources';
import { applyOrganizationDelta } from '../org/organization';
import type { OrganizationDelta, PlayerOrganization } from '../org/types';
import { strategyById } from './catalog';
import type { ActiveStrategy, StrategyDefinition } from './types';

export interface StrategyTickResult {
  state: RebirthGameState;
  logs: string[];
}

export function startStrategy(state: RebirthGameState, definition: StrategyDefinition): RebirthGameState {
  const active: ActiveStrategy = {
    id: definition.id,
    startedTurn: state.turn,
    remainingTurns: definition.duration,
    progress: 0,
    risk: definition.risk
  };
  return {
    ...state,
    organization: applyCostToOrganization(state.organization, definition),
    resources: definition.costPerTurn.resource
      ? applyResourceDelta(state.resources, definition.costPerTurn.resource)
      : state.resources,
    activeStrategies: [...state.activeStrategies, active]
  };
}

export function tickStrategies(state: RebirthGameState): StrategyTickResult {
  if (state.activeStrategies.length === 0) return { state, logs: [] };

  let next = state;
  const logs: string[] = [];
  const stillActive: ActiveStrategy[] = [];

  for (const active of state.activeStrategies) {
    const definition = strategyById(active.id);
    if (!definition) continue;

    const progressGain = computeProgressGain(next.organization, definition);
    const paid = canPayCost(next.organization, definition);
    const progress = clamp(active.progress + (paid ? progressGain : progressGain * 0.35));
    const risk = clamp(active.risk + (paid ? -2 : 8));
    const remainingTurns = active.remainingTurns - 1;

    next = {
      ...next,
      organization: applyCostToOrganization(next.organization, definition),
      resources: definition.costPerTurn.resource
        ? applyResourceDelta(next.resources, definition.costPerTurn.resource)
        : next.resources
    };

    if (remainingTurns <= 0 || progress >= 100) {
      const success = progress >= risk + 42;
      next = applyStrategyOutcome(next, definition, success);
      logs.push(`T${state.turn} — Stratégie : ${success ? definition.success.narrative : definition.failure.narrative}`);
    } else {
      stillActive.push({ ...active, progress, risk, remainingTurns });
      logs.push(`T${state.turn} — Stratégie ${definition.label} : progression ${Math.round(progress)}%, risque ${Math.round(risk)}%.`);
    }
  }

  next = { ...next, activeStrategies: stillActive };
  return { state: next, logs };
}

function computeProgressGain(org: PlayerOrganization, definition: StrategyDefinition): number {
  const weights = definition.progressWeights;
  return Math.max(
    8,
    (org.militants * (weights.militants ?? 0)) / 10 +
      org.permanentStaff * (weights.permanentStaff ?? 0) +
      org.legalTeam * (weights.legalTeam ?? 0) +
      org.mediaRelay * (weights.mediaRelay ?? 0) +
      org.localSections * (weights.localSections ?? 0) +
      org.cohesion * ((weights.cohesion ?? 0) / 10) +
      org.reputation * ((weights.reputation ?? 0) / 10)
  );
}

function canPayCost(org: PlayerOrganization, definition: StrategyDefinition): boolean {
  return org.treasury >= (definition.costPerTurn.treasury ?? 0);
}

function applyCostToOrganization(org: PlayerOrganization, definition: StrategyDefinition): PlayerOrganization {
  return applyOrganizationDelta(org, {
    treasury: -(definition.costPerTurn.treasury ?? 0),
    cohesion: -(definition.costPerTurn.cohesion ?? 0)
  });
}

function applyStrategyOutcome(
  state: RebirthGameState,
  definition: StrategyDefinition,
  success: boolean
): RebirthGameState {
  const outcome = success ? definition.success : definition.failure;
  return {
    ...state,
    organization: outcome.orgDelta
      ? applyOrganizationDelta(state.organization, outcome.orgDelta)
      : state.organization,
    resources: outcome.resourceDelta
      ? applyResourceDelta(state.resources, outcome.resourceDelta as Partial<Resources>)
      : state.resources,
    actors: outcome.actorDelta
      ? applyActorsDelta(state.actors, outcome.actorDelta as Partial<Record<ActorId, { trust?: number; pressure?: number; patience?: number }>>)
      : state.actors
  };
}
