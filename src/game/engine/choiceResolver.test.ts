/* P0 Fåhraeus-09 + Théo-21 (Sapeurs ORDA-015 PARITAS) — tests choiceResolver.
   Vérifie le pénalty stress effondré (≥80) sur le multiplicateur final
   des effets numériques. Stress collapse → resources × 0.85 supplémentaire. */

import { describe, it, expect } from 'vitest';
import { resolveChoice } from './choiceResolver';
import { freshResources } from '../simulation/resources';
import { freshActors } from '../simulation/actors';
import { freshTraits } from '../narrative/personalityEngine';
import { freshMemory } from '../narrative/memoryEngine';
import { freshOrganization } from '../org/organization';
import type { RebirthGameState, Choice, Scenario } from '../types';

function buildState(stress: number): RebirthGameState {
  return {
    name: 'Test',
    camp: 'salarie',
    mode: 'reflechi',
    legendaryId: null,
    turn: 1,
    era: 'paritarisme-fondateur',
    currentScenarioId: null,
    traits: freshTraits(),
    dominantTrait: 'pragmatique',
    personalityStress: stress,
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

function makeChoice(): Choice {
  return {
    id: 'test-choice',
    text: 'choix',
    intent: 'i',
    effects: { resources: { caisse: 10 } },
    consequence: { immediate: 'ok' }
  };
}

function makeScenario(): Scenario {
  return {
    id: 'sc-test',
    turn: 1,
    date: 'test',
    era: 'paritarisme-fondateur',
    title: 't',
    mood: 'calme',
    historicalContext: '',
    setup: { reflechi: '', compulsif: '' },
    actors: [],
    choices: []
  } as unknown as Scenario;
}

describe('choiceResolver — stress effondré pénalise les choix (P0 Fåhraeus-09 / Théo-21)', () => {
  it('stress < 80 : delta caisse appliqué intact (+10)', () => {
    const state = buildState(50);
    const before = state.resources.caisse;
    const next = resolveChoice(state, makeScenario(), makeChoice());
    expect(next.resources.caisse).toBe(before + 10);
  });

  it('stress = 80 : seuil atteint, malus −15 % appliqué (+9)', () => {
    const state = buildState(80);
    const before = state.resources.caisse;
    const next = resolveChoice(state, makeScenario(), makeChoice());
    /* +10 × 0.85 = 8.5 → arrondi 9. Le burnout coupe les jambes. */
    expect(next.resources.caisse).toBe(before + 9);
  });

  it('stress = 95 : malus −15 % toujours appliqué une seule fois (+9)', () => {
    const state = buildState(95);
    const before = state.resources.caisse;
    const next = resolveChoice(state, makeScenario(), makeChoice());
    expect(next.resources.caisse).toBe(before + 9);
  });

  it('stress < 80 produit un effet strictement supérieur à stress ≥ 80 (preuve du couplage)', () => {
    const calm = buildState(40);
    const collapsed = buildState(85);
    const choice = makeChoice();
    const sc = makeScenario();
    const calmAfter = resolveChoice(calm, sc, choice).resources.caisse;
    const collapsedAfter = resolveChoice(collapsed, sc, choice).resources.caisse;
    expect(calmAfter).toBeGreaterThan(collapsedAfter);
  });
});
