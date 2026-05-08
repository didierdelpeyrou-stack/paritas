import { describe, it, expect } from 'vitest';
import { strategyById, STRATEGIES } from './catalog';

/* Couverture Vitest ORDA-011 — strategy/catalog.ts (était 0%).
   Catalogue de stratégies long-terme + lookup. */

describe('strategy/catalog — STRATEGIES list', () => {
  it('expose au moins 3 stratégies définies', () => {
    expect(STRATEGIES.length).toBeGreaterThanOrEqual(3);
  });

  it('chaque stratégie a un id unique', () => {
    const ids = STRATEGIES.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('chaque stratégie a label, description, target, duration, risk', () => {
    for (const s of STRATEGIES) {
      expect(s.id).toBeTruthy();
      expect(s.label).toBeTruthy();
      expect(s.description).toBeTruthy();
      expect(s.target).toBeTruthy();
      expect(s.duration).toBeGreaterThan(0);
      expect(s.risk).toBeGreaterThanOrEqual(0);
      expect(s.risk).toBeLessThanOrEqual(100);
    }
  });

  it('chaque stratégie a une narrative success + failure', () => {
    for (const s of STRATEGIES) {
      expect(s.success.narrative).toBeTruthy();
      expect(s.failure.narrative).toBeTruthy();
    }
  });

  it('P1-9 (ORDA-009) — "lobbying-parlementaire" a son label neutralisé', () => {
    const s = strategyById('lobbying-parlementaire');
    expect(s).toBeDefined();
    expect(s!.label).toBe('Influence institutionnelle');
    /* L'identifiant interne reste pour la rétro-compat des saves. */
    expect(s!.id).toBe('lobbying-parlementaire');
  });
});

describe('strategy/catalog — strategyById', () => {
  it('retourne la stratégie correcte par id', () => {
    const first = STRATEGIES[0];
    const found = strategyById(first.id);
    expect(found).toEqual(first);
  });

  it('retourne undefined pour un id inexistant', () => {
    expect(strategyById('inexistant-12345')).toBeUndefined();
  });

  it('est insensible à l\'ordre des stratégies (linear scan)', () => {
    const ids = STRATEGIES.map(s => s.id);
    for (const id of ids) {
      const found = strategyById(id);
      expect(found?.id).toBe(id);
    }
  });
});

describe('strategy/catalog — équilibre interne', () => {
  it('coût trésorerie ≥ 0 (cohesion peut être négatif = bonus de cohésion)', () => {
    for (const s of STRATEGIES) {
      expect((s.costPerTurn.treasury ?? 0)).toBeGreaterThanOrEqual(0);
      /* Note : costPerTurn.cohesion peut être négatif intentionnellement
         (« coût négatif » = bonus de cohésion lié à l'investissement
         dans la stratégie, ex: campagne interne qui rassemble). */
    }
  });

  it('progress weights non-negatifs (sinon progression négative)', () => {
    for (const s of STRATEGIES) {
      const w = s.progressWeights;
      for (const key of Object.keys(w)) {
        const v = w[key as keyof typeof w] ?? 0;
        expect(v).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('unlockTurn est dans la plage 1..100 si défini', () => {
    for (const s of STRATEGIES) {
      if (s.unlockTurn !== undefined) {
        expect(s.unlockTurn).toBeGreaterThanOrEqual(1);
        expect(s.unlockTurn).toBeLessThanOrEqual(100);
      }
    }
  });
});
