import { describe, it, expect } from 'vitest';
import { evaluateTensions, shouldEndEarly } from './tensions';
import { freshResources } from './resources';
import { freshActors } from './actors';
import type { RebirthGameState } from '../types';

/* Couverture Vitest ORDA-013 — simulation/tensions.ts (était 0%).
   Module de seuils critiques : alertes + fin de partie anticipée. */

function mkState(over: {
  resources?: Partial<ReturnType<typeof freshResources>>;
  actors?: { base?: { trust?: number; patience?: number } };
  turn?: number;
} = {}): RebirthGameState {
  const baseActors = freshActors();
  if (over.actors?.base) {
    baseActors.base = { ...baseActors.base, ...over.actors.base };
  }
  return {
    turn: over.turn ?? 5,
    resources: { ...freshResources(), ...over.resources },
    actors: baseActors,
    memory: {
      refusedCompromise: 0, signedMajorAccords: [], betrayedBase: 0,
      builtInstitutions: [], exhaustedMovements: 0, flags: {},
      playedScenarios: [], pendingLongterm: []
    },
    objectiveProgress: [],
    objectives: []
  } as unknown as RebirthGameState;
}

describe('tensions — evaluateTensions', () => {
  it('aucune alerte sur état sain', () => {
    const alerts = evaluateTensions(mkState());
    expect(alerts).toEqual([]);
  });

  it('santeSociale ≤ 20 → critical "tension_haute"', () => {
    const alerts = evaluateTensions(mkState({ resources: { santeSociale: 20 } }));
    expect(alerts.some(a => a.id === 'tension_haute' && a.level === 'critical')).toBe(true);
  });

  it('base.patience ≤ 15 → critical "base_rupture"', () => {
    const alerts = evaluateTensions(mkState({ actors: { base: { patience: 15 } } }));
    expect(alerts.some(a => a.id === 'base_rupture' && a.level === 'critical')).toBe(true);
  });

  it('base.trust ≤ 20 → warning "base_defiance"', () => {
    const alerts = evaluateTensions(mkState({ actors: { base: { trust: 20 } } }));
    expect(alerts.some(a => a.id === 'base_defiance' && a.level === 'warning')).toBe(true);
  });

  it('legitimite ≤ 20 → warning "legitimite"', () => {
    const alerts = evaluateTensions(mkState({ resources: { legitimite: 20 } }));
    expect(alerts.some(a => a.id === 'legitimite' && a.level === 'warning')).toBe(true);
  });

  it('caisse ≤ 15 → warning "caisse_basse"', () => {
    const alerts = evaluateTensions(mkState({ resources: { caisse: 15 } }));
    expect(alerts.some(a => a.id === 'caisse_basse' && a.level === 'warning')).toBe(true);
  });

  it('rapportDeForce ≤ 15 → info "rapport_force_bas"', () => {
    const alerts = evaluateTensions(mkState({ resources: { rapportDeForce: 15 } }));
    expect(alerts.some(a => a.id === 'rapport_force_bas' && a.level === 'info')).toBe(true);
  });

  it('plusieurs seuils franchis → plusieurs alertes simultanées', () => {
    const alerts = evaluateTensions(mkState({
      resources: { santeSociale: 10, legitimite: 5, caisse: 0, rapportDeForce: 5 },
      actors: { base: { trust: 10, patience: 10 } }
    }));
    /* 6 seuils franchis simultanément */
    expect(alerts.length).toBeGreaterThanOrEqual(5);
  });

  it('chaque alerte a id + level + text', () => {
    const alerts = evaluateTensions(mkState({ resources: { santeSociale: 10 } }));
    for (const a of alerts) {
      expect(a.id).toBeTruthy();
      expect(['info', 'warning', 'critical']).toContain(a.level);
      expect(a.text.length).toBeGreaterThan(5);
    }
  });
});

describe('tensions — shouldEndEarly', () => {
  it('false en état sain', () => {
    expect(shouldEndEarly(mkState())).toBe(false);
  });

  it('true si base.trust ≤ 5 ET turn > 10 (démission forcée)', () => {
    expect(shouldEndEarly(mkState({
      turn: 11, actors: { base: { trust: 5 } }
    }))).toBe(true);
  });

  it('false si base.trust ≤ 5 mais turn ≤ 10 (pas encore démission)', () => {
    expect(shouldEndEarly(mkState({
      turn: 8, actors: { base: { trust: 5 } }
    }))).toBe(false);
  });

  it('true si santeSociale ≤ 5 ET caisse ≤ 5 (effondrement)', () => {
    expect(shouldEndEarly(mkState({
      resources: { santeSociale: 5, caisse: 5 }
    }))).toBe(true);
  });

  it('false si seulement santeSociale basse (sans caisse à 0)', () => {
    expect(shouldEndEarly(mkState({
      resources: { santeSociale: 5, caisse: 50 }
    }))).toBe(false);
  });
});
