import { describe, it, expect } from 'vitest';
import { composeNarrativeFallback } from './narrativeFallback';
import { ALL_TRAITS } from '../types';
import type { Choice, PlayerTrait, RebirthGameState, Scenario, SceneMood } from '../types';

/* Couverture Vitest P1 ORDA-016 PARITAS — narrative/narrativeFallback.ts.
   Cible : composeNarrativeFallback — produit l'enrichissement écrit-à-la-main
   utilisé quand Haiku est indispo. Sortie : { consequence, innerVoice,
   newspaperHeadline, memoryLine? }.
   Estimation couverture : 85 %. */

function mkState(over: Partial<RebirthGameState> = {}): RebirthGameState {
  const base = {
    name: 'T',
    camp: 'salarie',
    mode: 'reflechi',
    legendaryId: null,
    turn: 1,
    era: 'trente_glorieuses',
    currentScenarioId: null,
    traits: { batisseur: 0, rupture: 0, technocrate: 0, pragmatique: 0, paternaliste: 0, tribun: 0 },
    dominantTrait: 'batisseur',
    personalityStress: 0,
    resources: {},
    actors: {},
    organization: {},
    activeStrategies: [],
    worldAI: {},
    activePipelines: [],
    memory: {},
    objectives: [],
    objectiveProgress: [],
    phase: 'consequence',
    lastChoice: null,
    lastConsequenceText: null,
    endingId: null,
    ...over
  };
  return base as unknown as RebirthGameState;
}

function mkScenario(over: Partial<Scenario> = {}): Scenario {
  return {
    id: 'sc-1',
    turn: 1,
    date: '—',
    era: 'trente_glorieuses',
    title: 'Test',
    mood: 'calme',
    historicalContext: '',
    setup: { reflechi: '', compulsif: '' },
    actors: [],
    choices: [],
    ...over
  } as unknown as Scenario;
}

function mkChoice(over: Partial<Choice> = {}): Choice {
  return {
    id: 'c1',
    text: 'Test',
    intent: 'Test intent',
    effects: {},
    consequence: { immediate: 'Conséquence immédiate.' },
    ...over
  } as unknown as Choice;
}

describe('narrativeFallback — shape de sortie', () => {
  it('retourne { consequence, innerVoice, newspaperHeadline, memoryLine? }', () => {
    const out = composeNarrativeFallback(mkState(), mkScenario(), mkChoice());
    expect(out).toHaveProperty('consequence');
    expect(out).toHaveProperty('innerVoice');
    expect(out).toHaveProperty('newspaperHeadline');
    // memoryLine optionnel : undefined si pas de longterm
    expect(out.consequence).toBe('Conséquence immédiate.');
  });
});

describe('narrativeFallback — innerVoice non-null pour chaque trait dominant', () => {
  it('chaque trait possède un pool de voix et produit une ligne non-vide', () => {
    for (const trait of ALL_TRAITS) {
      const out = composeNarrativeFallback(
        mkState({ dominantTrait: trait as PlayerTrait }),
        mkScenario(),
        mkChoice()
      );
      expect(out.innerVoice).toBeTruthy();
      expect(typeof out.innerVoice).toBe('string');
      expect((out.innerVoice as string).length).toBeGreaterThan(10);
    }
  });
});

describe('narrativeFallback — newspaperHeadline reflète le mood du scénario', () => {
  it('mood "euphorique" salarié → headline du pool euphorique', () => {
    const out = composeNarrativeFallback(
      mkState({ camp: 'salarie' }),
      mkScenario({ mood: 'euphorique' }),
      mkChoice()
    );
    // Pool salarie/euphorique : "voix qu'on croyait perdue" ou "victoire courte"
    expect(out.newspaperHeadline).toMatch(/voix|victoire/i);
  });

  it('mood "melancolique" patron → headline mélancolique patronal', () => {
    const out = composeNarrativeFallback(
      mkState({ camp: 'patron' }),
      mkScenario({ mood: 'melancolique' }),
      mkChoice()
    );
    // Pool patron/melancolique : "époque se ferme" ou "regarde sa propre histoire"
    expect(out.newspaperHeadline).toMatch(/époque|histoire/i);
  });
});

describe('narrativeFallback — memoryLine nullable mais structuré quand présent', () => {
  it('sans longterm → memoryLine undefined', () => {
    const out = composeNarrativeFallback(
      mkState(),
      mkScenario(),
      mkChoice({ consequence: { immediate: 'x' } })
    );
    expect(out.memoryLine).toBeUndefined();
  });

  it('avec longterm → memoryLine string non-vide', () => {
    const out = composeNarrativeFallback(
      mkState(),
      mkScenario(),
      mkChoice({ consequence: { immediate: 'x', longterm: 'écho à long terme' } })
    );
    expect(out.memoryLine).toBeTruthy();
    expect(typeof out.memoryLine).toBe('string');
    expect((out.memoryLine as string).length).toBeGreaterThan(5);
  });
});

describe('narrativeFallback — cohérence sur les 5 SceneMood', () => {
  it('chaque SceneMood × camp produit une sortie cohérente (innerVoice + headline non-vides)', () => {
    const moods: SceneMood[] = ['calme', 'tendu', 'grave', 'euphorique', 'melancolique'];
    const camps = ['salarie', 'patron'] as const;
    for (const camp of camps) {
      for (const mood of moods) {
        const out = composeNarrativeFallback(
          mkState({ camp }),
          mkScenario({ mood }),
          mkChoice()
        );
        expect(out.innerVoice, `${camp}/${mood} innerVoice`).toBeTruthy();
        expect(out.newspaperHeadline, `${camp}/${mood} headline`).toBeTruthy();
        expect((out.newspaperHeadline as string).length).toBeGreaterThan(5);
      }
    }
  });
});

describe('narrativeFallback — déterminisme', () => {
  it('mêmes scenarioId + choiceId → mêmes lignes (idempotence)', () => {
    const state = mkState({ dominantTrait: 'tribun' });
    const scenario = mkScenario({ id: 'sc-stable', mood: 'tendu' });
    const choice = mkChoice({ id: 'ch-stable', consequence: { immediate: 'x', longterm: 'long' } });
    const a = composeNarrativeFallback(state, scenario, choice);
    const b = composeNarrativeFallback(state, scenario, choice);
    expect(a).toEqual(b);
  });
});
