import type { RebirthGameState, Scenario } from '../types';
import { ALL_SCENARIOS } from '../content/scenarios';
import { buildTransitionScenario } from '../content/eventTemplates';
import { buildPipelineScenario } from './pipelineEngine';

export interface ScenarioPick {
  scenario: Scenario;
  /** True si tous les scénarios premium ont été joués. */
  isFinal: boolean;
}

export function pickNextScenario(
  state: RebirthGameState
): ScenarioPick | null {
  const duePremium = ALL_SCENARIOS.filter(
    s =>
      !state.memory.playedScenarios.includes(s.id) &&
      (!s.campFilter || s.campFilter === state.camp) &&
      s.turn <= state.turn
  ).sort((a, b) => a.turn - b.turn);

  if (duePremium.length > 0) {
    const next = duePremium[0]!;
    return { scenario: next, isFinal: false };
  }

  const pipelineScenario = buildPipelineScenario(state);
  if (pipelineScenario) {
    return { scenario: pipelineScenario, isFinal: false };
  }

  const nextPremium = ALL_SCENARIOS.filter(
    s =>
      !state.memory.playedScenarios.includes(s.id) &&
      (!s.campFilter || s.campFilter === state.camp) &&
      s.turn > state.turn
  ).sort((a, b) => a.turn - b.turn)[0];

  if (nextPremium && nextPremium.turn === state.turn + 1) {
    return { scenario: nextPremium, isFinal: false };
  }

  const next = buildTransitionScenario(state);
  return {
    scenario: next,
    isFinal: state.turn >= 99
  };
}
