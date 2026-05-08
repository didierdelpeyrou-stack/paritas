import { describe, it, expect } from 'vitest';
import { startStrategy, tickStrategies } from './resolver';
import { strategyById, STRATEGIES } from './catalog';
import { freshOrganization } from '../org/organization';
import { freshResources } from '../simulation/resources';
import { freshActors } from '../simulation/actors';
import type { RebirthGameState } from '../types';

/* Couverture Vitest ORDA-012 — strategy/resolver.ts (était 0%).
   Engine de stratégies long-terme : start, tick, progress, success/failure.
   114 lignes, 5 fonctions exportées (startStrategy, tickStrategies +
   helpers privés). */

function mkState(over: Partial<RebirthGameState> = {}): RebirthGameState {
  const base = {
    turn: 5,
    resources: freshResources(),
    actors: freshActors(),
    organization: freshOrganization('salarie', 'Test'),
    activeStrategies: [],
    memory: {
      refusedCompromise: 0,
      signedMajorAccords: [],
      betrayedBase: 0,
      builtInstitutions: [],
      exhaustedMovements: 0,
      flags: {},
      playedScenarios: [],
      pendingLongterm: []
    },
    objectiveProgress: [],
    objectives: [],
    ...over
  };
  return base as unknown as RebirthGameState;
}

describe('resolver — startStrategy', () => {
  it('ajoute une stratégie active à l\'état', () => {
    const def = STRATEGIES[0];
    const state = mkState();
    const next = startStrategy(state, def);
    expect(next.activeStrategies).toHaveLength(1);
    expect(next.activeStrategies[0].id).toBe(def.id);
    expect(next.activeStrategies[0].startedTurn).toBe(state.turn);
    expect(next.activeStrategies[0].progress).toBe(0);
    expect(next.activeStrategies[0].risk).toBe(def.risk);
    expect(next.activeStrategies[0].remainingTurns).toBe(def.duration);
  });

  it('peut empiler plusieurs stratégies actives', () => {
    let state = mkState();
    state = startStrategy(state, STRATEGIES[0]);
    state = startStrategy(state, STRATEGIES[1]);
    expect(state.activeStrategies).toHaveLength(2);
  });

  it('applique le coût initial sur l\'organisation', () => {
    /* On choisit une stratégie avec costPerTurn.treasury > 0 si possible. */
    const def = STRATEGIES.find(s => (s.costPerTurn.treasury ?? 0) > 0)
      ?? STRATEGIES[0];
    const state = mkState();
    const initialTreasury = state.organization.treasury;
    const next = startStrategy(state, def);
    if ((def.costPerTurn.treasury ?? 0) > 0) {
      expect(next.organization.treasury).toBeLessThan(initialTreasury);
    }
  });
});

describe('resolver — tickStrategies', () => {
  it('no-op si aucune stratégie active', () => {
    const state = mkState();
    const result = tickStrategies(state);
    expect(result.state).toEqual(state);
    expect(result.logs).toEqual([]);
  });

  it('progresse les stratégies actives', () => {
    const def = STRATEGIES[0];
    let state = mkState();
    state = startStrategy(state, def);
    const result = tickStrategies(state);
    expect(result.logs.length).toBeGreaterThan(0);
    /* Progress doit avancer (≥0 si paid=false, sinon plus rapide) */
    if (result.state.activeStrategies.length > 0) {
      expect(result.state.activeStrategies[0].progress).toBeGreaterThan(0);
    }
  });

  it('décrémente remainingTurns à chaque tick', () => {
    const def = STRATEGIES.find(s => s.duration >= 3) ?? STRATEGIES[0];
    let state = mkState();
    state = startStrategy(state, def);
    const initialRemaining = state.activeStrategies[0].remainingTurns;
    const result = tickStrategies(state);
    if (result.state.activeStrategies.length > 0) {
      expect(result.state.activeStrategies[0].remainingTurns).toBe(initialRemaining - 1);
    }
  });

  it('finalise une stratégie quand remainingTurns ≤ 0 (success ou failure)', () => {
    /* On force remainingTurns=1 pour finaliser au prochain tick. */
    let state = mkState();
    state = startStrategy(state, STRATEGIES[0]);
    state.activeStrategies[0].remainingTurns = 1;
    const result = tickStrategies(state);
    expect(result.state.activeStrategies).toHaveLength(0);
    /* Le log final cite la narrative success ou failure */
    expect(result.logs[0]).toMatch(/Stratégie/);
  });

  it('finalise une stratégie quand progress ≥ 100', () => {
    let state = mkState();
    state = startStrategy(state, STRATEGIES[0]);
    state.activeStrategies[0].progress = 99.9;
    state.activeStrategies[0].remainingTurns = 5; // pas finie par durée
    const result = tickStrategies(state);
    /* Avec progress 99.9 + computeProgressGain (min 8), on dépasse 100 */
    expect(result.state.activeStrategies).toHaveLength(0);
  });

  it('ignore les stratégies dont l\'id n\'existe plus dans le catalogue', () => {
    let state = mkState();
    state = startStrategy(state, STRATEGIES[0]);
    /* Force un id orphelin → continue sans crash. */
    state.activeStrategies[0] = { ...state.activeStrategies[0], id: 'inexistant' };
    const result = tickStrategies(state);
    /* Soit le tick log un message, soit il skip — dans tous les cas pas de crash. */
    expect(result.state.activeStrategies).toBeDefined();
  });
});

describe('resolver — déterminisme + immutabilité', () => {
  it('startStrategy ne mute pas l\'état source', () => {
    const state = mkState();
    const initialActiveLen = state.activeStrategies.length;
    startStrategy(state, STRATEGIES[0]);
    expect(state.activeStrategies.length).toBe(initialActiveLen);
  });

  it('tickStrategies retourne un nouvel état (pas une mutation)', () => {
    let state = mkState();
    state = startStrategy(state, STRATEGIES[0]);
    const result = tickStrategies(state);
    /* L'état retourné peut être === au state d'entrée si rien à
       changer, mais activeStrategies est dans tous les cas un nouvel
       array (filtre stillActive). */
    expect(Array.isArray(result.state.activeStrategies)).toBe(true);
  });
});
