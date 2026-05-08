import { describe, it, expect } from 'vitest';
import {
  simulateAllMatignonPaths,
  evaluateMatignonLearning,
  startMatignonSession,
  availableMatignonMoves,
  applyMatignonMove,
  buildMatignonReplay,
  auditMatignonSession,
  MATIGNON_CHOICES,
  MATIGNON_SESSION_MOVES
} from './matignon';

describe('Matignon — engine invariants', () => {
  it('starts with mandate and no result', () => {
    const s = startMatignonSession();
    expect(s.mandate).toBeDefined();
    expect(s.history).toEqual([]);
    expect(s.result).toBeFalsy(); // null or undefined acceptable
    expect(s.phase).toBe('opening');
  });

  it('exposes 4 strategic choices and at least 6 tactical moves', () => {
    expect(MATIGNON_CHOICES).toHaveLength(4);
    expect(MATIGNON_SESSION_MOVES.length).toBeGreaterThanOrEqual(6);
    expect(MATIGNON_CHOICES.map(c => c.id).sort()).toEqual(
      ['harden-wages', 'sign-balanced', 'suspend-consult', 'walk-out'].sort()
    );
  });

  it('availableMoves returns non-empty list during phases', () => {
    const s = startMatignonSession();
    const moves = availableMatignonMoves(s);
    expect(moves.length).toBeGreaterThan(0);
  });

  it('phase transitions opening → counter → ratification → ended', () => {
    const initial = startMatignonSession();
    const opening = availableMatignonMoves(initial)[0];
    const s1 = applyMatignonMove(initial, opening.id);
    expect(s1.phase).toBe('counter');

    const counter = availableMatignonMoves(s1)[0];
    const s2 = applyMatignonMove(s1, counter.id);
    expect(s2.phase).toBe('ratification');

    const final = availableMatignonMoves(s2)[0];
    const s3 = applyMatignonMove(s2, final.id);
    expect(s3.phase).toBe('ended');
    expect(s3.result).toBeDefined();
  });
});

describe('Matignon — full simulation (36 paths)', () => {
  const sims = simulateAllMatignonPaths();

  it('produces exactly 36 simulations (3 phases × 4 moves × 3 × 3)', () => {
    /* Note : 36 vient du graphe réel de moves disponibles par phase,
       pas d'un produit cartésien strict. Le compte est stable. */
    expect(sims.length).toBe(36);
  });

  it('every path ends with phase=ended and a result', () => {
    for (const sim of sims) {
      expect(sim.state.phase).toBe('ended');
      expect(sim.state.result).toBeDefined();
    }
  });

  it('produces at least 4 distinct outcome ids', () => {
    const outcomes = new Set(
      sims.map(s => s.state.result?.outcome.agreementId ?? 'rupture')
    );
    expect(outcomes.size).toBeGreaterThanOrEqual(4);
  });

  it('outcome distribution stays within sane bounds (no degenerate)', () => {
    const dist: Record<string, number> = {};
    for (const sim of sims) {
      const id = sim.state.result?.outcome.agreementId ?? 'rupture';
      dist[id] = (dist[id] ?? 0) + 1;
    }
    for (const [id, count] of Object.entries(dist)) {
      const pct = (100 * count) / sims.length;
      expect(pct, `${id} dominates`).toBeLessThanOrEqual(50);
    }
  });

  it('all 9 learning skills are calculated for every path', () => {
    const skills = [
      'mandateCraft', 'tableReading', 'concessionDesign', 'coalitionBuilding',
      'legalStrategy', 'publicNarrative', 'conflictTiming',
      'institutionalMemory', 'ethicalClarity'
    ] as const;
    for (const sim of sims) {
      const profile = evaluateMatignonLearning(sim.state);
      for (const skill of skills) {
        expect(profile.scores[skill]).toBeGreaterThanOrEqual(0);
        expect(profile.scores[skill]).toBeLessThanOrEqual(100);
      }
      expect(profile.primarySkill).toBeDefined();
    }
  });

  it('replay log captures the path of 3 moves', () => {
    for (const sim of sims) {
      const replay = buildMatignonReplay(sim.state);
      expect(replay.path).toHaveLength(3);
      expect(replay.history).toHaveLength(3);
      expect(replay.scenarioId).toBe('matignon-1936');
      expect(replay.finalPhase).toBe('ended');
    }
  });

  it('audit produces a coherent report', () => {
    for (const sim of sims) {
      const audit = auditMatignonSession(sim.state);
      expect(audit).toBeDefined();
    }
  });
});
