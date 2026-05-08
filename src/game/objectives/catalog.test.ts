/* P2 ORDA-017 PARITAS — couverture résiduelle catalog.ts.
   Tests data-driven sur les 18 objectifs (2 base salariés + 2 base
   patrons + ~14 PER_CHARACTER). Vérifie shape, unicité id, weight
   1..3, condition kind valide, byTurn cohérent. */

import { describe, it, expect } from 'vitest';
import { objectivesForRole } from './catalog';
import type { ObjectiveCondition } from './types';

const VALID_CONDITION_KINDS: ObjectiveCondition['kind'][] = [
  'resource-min',
  'resource-max',
  'institutions-built',
  'accords-signed',
  'refuse-compromise',
  'no-betrayal',
  'flag-set',
  'trait-dominant'
];

describe('catalog — objectivesForRole base', () => {
  it('camp salarie sans character → 2 objectifs base', () => {
    const objs = objectivesForRole('salarie');
    expect(objs).toHaveLength(2);
    expect(objs.map(o => o.id)).toContain('salarie-build-institutions');
    expect(objs.map(o => o.id)).toContain('salarie-no-betrayal');
  });

  it('camp patron sans character → 2 objectifs base', () => {
    const objs = objectivesForRole('patron');
    expect(objs).toHaveLength(2);
    expect(objs.map(o => o.id)).toContain('patron-keep-treasury');
    expect(objs.map(o => o.id)).toContain('patron-secure-legitimacy');
  });
});

describe('catalog — objectivesForRole avec character', () => {
  it('jouhaux ajoute matignon avant tour 22', () => {
    const objs = objectivesForRole('salarie', 'jouhaux');
    const matignon = objs.find(o => o.id === 'jouhaux-matignon');
    expect(matignon).toBeDefined();
    expect(matignon!.byTurn).toBe(22);
    expect(matignon!.weight).toBe(3);
  });

  it('croizat ajoute secu avec deadline tour 24', () => {
    const objs = objectivesForRole('salarie', 'croizat');
    const secu = objs.find(o => o.id === 'croizat-secu');
    expect(secu).toBeDefined();
    expect(secu!.byTurn).toBe(24);
    expect(secu!.condition.kind).toBe('flag-set');
  });

  it('parisot a 2 objectifs (image + trait tribun)', () => {
    const objs = objectivesForRole('patron', 'parisot');
    /* base patron 2 + parisot 2 = 4 */
    expect(objs).toHaveLength(4);
    expect(objs.map(o => o.id)).toContain('parisot-image');
    expect(objs.map(o => o.id)).toContain('parisot-trait-tribun');
  });

  it('character inconnu → fallback sur base seule', () => {
    const objs = objectivesForRole('salarie', 'inconnu-xyz');
    expect(objs).toHaveLength(2);
  });
});

describe('catalog — invariants data-driven (18 objectifs)', () => {
  /* On agrège tous les objectifs uniques en parcourant les 12 characters
     définis (jouhaux, croizat, griffuelhes, bothereau, maire, souillot,
     binet, lambert-ribot, villiers, seilliere, parisot, roux-de-bezieux). */
  const characterIds = [
    'jouhaux', 'croizat', 'griffuelhes', 'bothereau', 'maire',
    'souillot', 'binet', 'lambert-ribot', 'villiers', 'seilliere',
    'parisot', 'roux-de-bezieux'
  ];

  function collectAll() {
    const map = new Map<string, ReturnType<typeof objectivesForRole>[number]>();
    for (const camp of ['salarie', 'patron'] as const) {
      for (const charId of [undefined, ...characterIds]) {
        for (const o of objectivesForRole(camp, charId)) {
          map.set(o.id, o);
        }
      }
    }
    return Array.from(map.values());
  }

  it('tous les ids d\'objectifs sont uniques', () => {
    const all = collectAll();
    const ids = all.map(o => o.id);
    const uniq = new Set(ids);
    expect(uniq.size).toBe(ids.length);
  });

  it('weight de chaque objectif est 1, 2 ou 3', () => {
    const all = collectAll();
    for (const o of all) {
      expect([1, 2, 3]).toContain(o.weight);
    }
  });

  it('condition.kind de chaque objectif est valide', () => {
    const all = collectAll();
    for (const o of all) {
      expect(VALID_CONDITION_KINDS).toContain(o.condition.kind);
    }
  });

  it('byTurn (si défini) ∈ [1..100]', () => {
    const all = collectAll();
    for (const o of all) {
      if (o.byTurn !== undefined) {
        expect(o.byTurn).toBeGreaterThan(0);
        expect(o.byTurn).toBeLessThanOrEqual(100);
      }
    }
  });
});
