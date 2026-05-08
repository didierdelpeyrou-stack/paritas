import { describe, it, expect } from 'vitest';
import { composeConcreteMeasures } from './concreteMeasures';
import type { Choice, EraId, ResourceKey } from '../types';
import type { Camp } from '../../lib/types';
import { ALL_RESOURCES } from '../types';

/* Couverture Vitest P1 ORDA-016 PARITAS — narrative/concreteMeasures.ts.
   Cible : composeConcreteMeasures(state, choice, year) — mappe les deltas
   de ressources sur des phrases concrètes (cartes, francs, sites, etc.).
   Estimation couverture : 85 %. */

function mkState(over: Partial<{ camp: Camp; era: EraId; turn: number }> = {}) {
  return {
    camp: over.camp ?? 'salarie',
    era: over.era ?? 'trente_glorieuses',
    turn: over.turn ?? 1
  };
}

function mkChoice(over: Partial<Choice> = {}): Choice {
  return {
    id: 'c1',
    text: 'Test',
    intent: 'Test intent',
    effects: {},
    consequence: { immediate: 'Conséquence.' },
    ...over
  } as unknown as Choice;
}

describe('concreteMeasures — shape & retours par défaut', () => {
  it('retourne string[] (toujours)', () => {
    const out = composeConcreteMeasures(mkState(), mkChoice(), 1936);
    expect(Array.isArray(out)).toBe(true);
  });

  it('choix sans effects.resources → retourne [] (liste minimale)', () => {
    const out = composeConcreteMeasures(mkState(), mkChoice({ effects: {} }), 1936);
    expect(out).toEqual([]);
  });

  it('deltas trop faibles (|v|<4) → filtrés → []', () => {
    const choice = mkChoice({
      effects: { resources: { confiance: 2, caisse: 1 } }
    });
    const out = composeConcreteMeasures(mkState(), choice, 1936);
    expect(out).toEqual([]);
  });
});

describe('concreteMeasures — opposition deltas négatifs vs positifs', () => {
  it('confiance positive vs négative → phrases différentes', () => {
    const plus = composeConcreteMeasures(
      mkState({ camp: 'salarie' }),
      mkChoice({ effects: { resources: { confiance: 10 } } }),
      1936
    );
    const minus = composeConcreteMeasures(
      mkState({ camp: 'salarie' }),
      mkChoice({ effects: { resources: { confiance: -10 } } }),
      1936
    );
    expect(plus.length).toBeGreaterThan(0);
    expect(minus.length).toBeGreaterThan(0);
    expect(plus[0]).not.toBe(minus[0]);
    // signature : "cartes neuves" (positif) vs "ne renouvellent pas" (négatif)
    expect(plus[0]).toMatch(/cartes neuves/);
    expect(minus[0]).toMatch(/renouvellent/);
  });
});

describe('concreteMeasures — variation selon l\'année', () => {
  it('institution+ : 1789 (pré-1945) ≠ 2017 (post-1945)', () => {
    const choice = mkChoice({ effects: { resources: { institution: 8 } } });
    const ancien = composeConcreteMeasures(
      mkState({ era: 'revolution' }),
      choice,
      1789
    );
    const moderne = composeConcreteMeasures(
      mkState({ era: 'present' }),
      choice,
      2017
    );
    expect(ancien[0]).not.toBe(moderne[0]);
    expect(ancien[0]).toMatch(/règlement intérieur/);
    expect(moderne[0]).toMatch(/commission paritaire/);
  });

  it('legitimite+ : pré-1900 vs post-1900 → textes opposés', () => {
    const choice = mkChoice({ effects: { resources: { legitimite: 7 } } });
    const tot = composeConcreteMeasures(mkState(), choice, 1850);
    const tard = composeConcreteMeasures(mkState(), choice, 1936);
    expect(tot[0]).toMatch(/feuilles de chou/);
    expect(tard[0]).toMatch(/Petit Journal/);
  });
});

describe('concreteMeasures — toutes les ResourceKey reconnues (pas de "undefined")', () => {
  it('chaque clé Resources produit une phrase ou un null filtré (jamais "undefined")', () => {
    for (const key of ALL_RESOURCES) {
      const choice = mkChoice({
        effects: { resources: { [key as ResourceKey]: 8 } }
      });
      const out = composeConcreteMeasures(mkState(), choice, 1936);
      // Phrase produite ou liste vide. JAMAIS de "undefined" textuel.
      for (const line of out) {
        expect(line).not.toMatch(/undefined/i);
        expect(line.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('concreteMeasures — variation par camp', () => {
  it('confiance+ : camp salarie (cartes) vs patron (chefs d\'entreprise)', () => {
    const choice = mkChoice({ effects: { resources: { confiance: 10 } } });
    const sal = composeConcreteMeasures(mkState({ camp: 'salarie' }), choice, 1936);
    const pat = composeConcreteMeasures(mkState({ camp: 'patron' }), choice, 1936);
    expect(sal[0]).toMatch(/cartes neuves/);
    expect(pat[0]).toMatch(/chefs d'entreprise/);
  });
});

describe('concreteMeasures — limite à 3 entrées et tri par amplitude', () => {
  it('au plus 3 phrases retournées même si 5 deltas significatifs', () => {
    const choice = mkChoice({
      effects: {
        resources: {
          confiance: 10,
          caisse: 8,
          legitimite: 7,
          institution: 6,
          rapportDeForce: 5
        }
      }
    });
    const out = composeConcreteMeasures(mkState(), choice, 1936);
    expect(out.length).toBeLessThanOrEqual(3);
  });

  it('tri par amplitude : le delta le plus grand apparaît en premier', () => {
    const choice = mkChoice({
      effects: {
        // institution=12 (max) + confiance=5 (min)
        resources: { confiance: 5, institution: 12 }
      }
    });
    const out = composeConcreteMeasures(mkState(), choice, 1950);
    expect(out.length).toBe(2);
    // Premier élément = institution (greffe / commission paritaire)
    expect(out[0]).toMatch(/commission paritaire|greffe/);
  });
});

describe('concreteMeasures — currency par ère', () => {
  it('caisse+ en révolution → "livres"', () => {
    const choice = mkChoice({ effects: { resources: { caisse: 10 } } });
    const out = composeConcreteMeasures(
      mkState({ era: 'revolution', camp: 'salarie' }),
      choice,
      1789
    );
    expect(out[0]).toMatch(/livres/);
  });

  it('caisse+ en présent → "euros"', () => {
    const choice = mkChoice({ effects: { resources: { caisse: 10 } } });
    const out = composeConcreteMeasures(
      mkState({ era: 'present', camp: 'salarie' }),
      choice,
      2024
    );
    expect(out[0]).toMatch(/euros/);
  });
});
