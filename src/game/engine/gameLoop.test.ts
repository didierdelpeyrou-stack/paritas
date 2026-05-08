/* P0 Pope-04 (Sapeurs ORDA-015 PARITAS) — tests gameLoop.processTurnCallbacks.
   La mémoire des acteurs cesse d'être purement narrative : un callback
   programmé avec un champ `effects` doit appliquer un vrai delta sur
   ressources et acteurs au moment du déclenchement. */

import { describe, it, expect } from 'vitest';
import { processTurnCallbacks } from './gameLoop';
import { scheduleActorCallback } from './consequenceEngine';
import { freshResources } from '../simulation/resources';
import { freshActors } from '../simulation/actors';
import { freshTraits } from '../narrative/personalityEngine';
import { freshMemory } from '../narrative/memoryEngine';
import { freshOrganization } from '../org/organization';
import type { RebirthGameState } from '../types';

function buildState(turn: number): RebirthGameState {
  return {
    name: 'Test',
    camp: 'salarie',
    mode: 'reflechi',
    legendaryId: null,
    turn,
    era: 'paritarisme-fondateur',
    currentScenarioId: null,
    traits: freshTraits(),
    dominantTrait: 'pragmatique',
    personalityStress: 0,
    resources: freshResources(),
    actors: freshActors(),
    organization: freshOrganization('salarie', 'Test'),
    activeStrategies: [],
    worldAI: { mode: 'neutral', aggression: 0, lastTrigger: null },
    activePipelines: [],
    memory: freshMemory(),
    objectives: [],
    objectiveProgress: [],
    phase: 'idle',
    lastChoice: null,
    lastConsequenceText: null,
    endingId: null
  } as unknown as RebirthGameState;
}

describe('gameLoop — processTurnCallbacks (P0 Sapeurs Pope-04)', () => {
  it('callback sans effects ne modifie ni ressources ni acteurs', () => {
    const state = buildState(5);
    scheduleActorCallback(
      state.memory, 5, 'base',
      'narratif pur',
      'choice-narratif', 1
    );
    const before = state.resources;
    const beforeActors = state.actors;
    const result = processTurnCallbacks(state);
    expect(result.triggered).toHaveLength(1);
    expect(result.state.resources).toEqual(before);
    expect(result.state.actors).toEqual(beforeActors);
  });

  it('callback avec effects.actors applique le delta sur l\'acteur ciblé', () => {
    const state = buildState(5);
    const trustBefore = state.actors.opinion.trust;
    scheduleActorCallback(
      state.memory, 5, 'base',
      'reconnaissance différée',
      'signe-matignon', 1,
      { actors: { opinion: { trust: 5 } } }
    );
    const result = processTurnCallbacks(state);
    expect(result.triggered).toHaveLength(1);
    expect(result.state.actors.opinion.trust).toBe(trustBefore + 5);
  });

  it('callback avec effects.resources applique le delta sur les ressources', () => {
    const state = buildState(5);
    const caisseBefore = state.resources.caisse;
    scheduleActorCallback(
      state.memory, 5, 'etat',
      'État rembourse',
      'cree-secu', 1,
      { resources: { caisse: 7 } }
    );
    const result = processTurnCallbacks(state);
    expect(result.state.resources.caisse).toBe(caisseBefore + 7);
  });

  it('plusieurs callbacks dus s\'empilent (FIFO)', () => {
    const state = buildState(5);
    const baseTrustBefore = state.actors.base.trust;
    scheduleActorCallback(state.memory, 5, 'base', 'A', 'c-1', 1, {
      actors: { base: { trust: -3 } }
    });
    scheduleActorCallback(state.memory, 5, 'base', 'B', 'c-2', 2, {
      actors: { base: { trust: -2 } }
    });
    const result = processTurnCallbacks(state);
    expect(result.triggered).toHaveLength(2);
    expect(result.state.actors.base.trust).toBe(baseTrustBefore - 5);
  });

  it('callback non-dû (atTurn > currentTurn) reste en file et n\'applique pas ses effets', () => {
    const state = buildState(3);
    const trustBefore = state.actors.opinion.trust;
    scheduleActorCallback(
      state.memory, 8, 'base', 'futur',
      'signe-matignon', 3,
      { actors: { opinion: { trust: 5 } } }
    );
    const result = processTurnCallbacks(state);
    expect(result.triggered).toHaveLength(0);
    expect(result.state.actors.opinion.trust).toBe(trustBefore);
    expect(result.state.memory.scheduledActorCallbacks).toHaveLength(1);
  });
});
