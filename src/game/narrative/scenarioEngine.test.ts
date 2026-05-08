import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RebirthGameState, Scenario } from '../types';

/* On mocke les 3 dépendances de scenarioEngine pour isoler la logique
   de sélection (sans dépendre du contenu réel des 100 scénarios). */
vi.mock('../content/scenarios', () => ({
  getAllScenarios: vi.fn(() => [] as Scenario[])
}));
vi.mock('../content/eventTemplates', () => ({
  buildTransitionScenario: vi.fn(() => ({
    id: 'transition-default',
    title: 'Transition',
    turn: 0,
    date: '—',
    era: 'antiquite'
  } as unknown as Scenario))
}));
vi.mock('./pipelineEngine', () => ({
  buildPipelineScenario: vi.fn(() => null)
}));

import { pickNextScenario } from './scenarioEngine';
import { getAllScenarios } from '../content/scenarios';
import { buildTransitionScenario } from '../content/eventTemplates';
import { buildPipelineScenario } from './pipelineEngine';

const mockGetAll = vi.mocked(getAllScenarios);
const mockBuildTransition = vi.mocked(buildTransitionScenario);
const mockBuildPipeline = vi.mocked(buildPipelineScenario);

/* Helper pour fabriquer un RebirthGameState minimal : on cast pour ne
   coder que les champs lus par scenarioEngine. */
function makeState(over: Partial<{
  turn: number;
  camp: 'salarie' | 'patron';
  legendaryId: string | null;
  playedScenarios: string[];
}> = {}): RebirthGameState {
  const base = {
    turn: over.turn ?? 1,
    camp: over.camp ?? ('salarie' as const),
    legendaryId: over.legendaryId ?? null,
    memory: {
      playedScenarios: over.playedScenarios ?? []
    }
  };
  return base as unknown as RebirthGameState;
}

function makeScenario(over: Partial<Scenario> & { id?: string; turn?: number }): Scenario {
  return {
    id: over.id ?? 'sc-test',
    turn: over.turn ?? 1,
    title: over.title ?? 'Test',
    date: '—',
    era: 'antiquite',
    ...over
  } as unknown as Scenario;
}

describe('scenarioEngine — pickNextScenario priority', () => {
  beforeEach(() => {
    mockGetAll.mockReset();
    mockBuildPipeline.mockReset();
    mockBuildTransition.mockReset();
    mockGetAll.mockReturnValue([]);
    mockBuildPipeline.mockReturnValue(null);
    mockBuildTransition.mockReturnValue(makeScenario({ id: 'transition-default' }));
  });

  it('returns a premium scenario when one is due (turn ≤ current turn, not played)', () => {
    const due = makeScenario({ id: 'matignon-1936', turn: 5 });
    mockGetAll.mockReturnValue([due]);
    const state = makeState({ turn: 5, playedScenarios: [] });

    const pick = pickNextScenario(state);
    expect(pick).not.toBeNull();
    expect(pick!.scenario.id).toBe('matignon-1936');
    expect(pick!.isFinal).toBe(false);
  });

  it('skips played scenarios and picks the next due one', () => {
    const played = makeScenario({ id: 'sc-played', turn: 3 });
    const due = makeScenario({ id: 'sc-current', turn: 5 });
    mockGetAll.mockReturnValue([played, due]);
    const state = makeState({ turn: 5, playedScenarios: ['sc-played'] });

    const pick = pickNextScenario(state);
    expect(pick!.scenario.id).toBe('sc-current');
  });

  it('respects campFilter (rejects mismatched camp)', () => {
    const patronOnly = makeScenario({ id: 'patron-only', turn: 5, campFilter: 'patron' });
    mockGetAll.mockReturnValue([patronOnly]);
    const state = makeState({ turn: 5, camp: 'salarie' });

    const pick = pickNextScenario(state);
    /* Le scénario premium est rejeté → fallback transition */
    expect(pick!.scenario.id).toBe('transition-default');
  });

  it('respects personaFilter (rejects mismatched legendary)', () => {
    const jouhauxOnly = makeScenario({ id: 'jouhaux-arc', turn: 5, personaFilter: ['leon-jouhaux'] });
    mockGetAll.mockReturnValue([jouhauxOnly]);
    const state = makeState({ turn: 5, legendaryId: 'autre-personnage' });

    const pick = pickNextScenario(state);
    expect(pick!.scenario.id).toBe('transition-default');
  });

  it('falls back to pipeline scenario when no premium is due', () => {
    mockGetAll.mockReturnValue([]);
    mockBuildPipeline.mockReturnValue(makeScenario({ id: 'pipeline-active' }));
    const state = makeState({ turn: 10 });

    const pick = pickNextScenario(state);
    expect(pick!.scenario.id).toBe('pipeline-active');
  });

  it('falls back to transition scenario when no premium and no pipeline', () => {
    mockGetAll.mockReturnValue([]);
    mockBuildPipeline.mockReturnValue(null);
    const state = makeState({ turn: 10 });

    const pick = pickNextScenario(state);
    expect(pick!.scenario.id).toBe('transition-default');
  });

  it('peeks next premium when it is exactly at turn+1 (anticipation)', () => {
    const upcoming = makeScenario({ id: 'next-turn-premium', turn: 11 });
    mockGetAll.mockReturnValue([upcoming]);
    const state = makeState({ turn: 10 });

    const pick = pickNextScenario(state);
    expect(pick!.scenario.id).toBe('next-turn-premium');
  });

  it('does NOT peek premium scenarios that are 2+ turns away', () => {
    const farAway = makeScenario({ id: 'far-premium', turn: 50 });
    mockGetAll.mockReturnValue([farAway]);
    const state = makeState({ turn: 10 });

    const pick = pickNextScenario(state);
    expect(pick!.scenario.id).toBe('transition-default');
  });

  it('isFinal=true when turn ≥ 99 and falling back to transition', () => {
    mockGetAll.mockReturnValue([]);
    mockBuildPipeline.mockReturnValue(null);
    const state = makeState({ turn: 99 });

    const pick = pickNextScenario(state);
    expect(pick!.isFinal).toBe(true);
  });

  it('isFinal=false when turn < 99', () => {
    mockGetAll.mockReturnValue([]);
    mockBuildPipeline.mockReturnValue(null);
    const state = makeState({ turn: 50 });

    const pick = pickNextScenario(state);
    expect(pick!.isFinal).toBe(false);
  });

  it('orders multiple due premium scenarios by turn (earliest first)', () => {
    const sc1 = makeScenario({ id: 'sc-early', turn: 3 });
    const sc2 = makeScenario({ id: 'sc-late', turn: 5 });
    mockGetAll.mockReturnValue([sc2, sc1]); // ordre arbitraire
    const state = makeState({ turn: 10, playedScenarios: [] });

    const pick = pickNextScenario(state);
    expect(pick!.scenario.id).toBe('sc-early');
  });
});
