import { describe, it, expect } from 'vitest';
import {
  freshTraits,
  applyTraitShift,
  computeDominantTrait,
  computeStressDelta,
  clampStress,
  stressLevel,
  TRAIT_LABELS,
  TRAIT_BLURBS,
  TRAIT_ANTAGONISTS
} from './personalityEngine';
import { ALL_TRAITS } from '../types';

/* Couverture Vitest ORDA-014 — narrative/personalityEngine.ts (était 0%).
   Module CK3-grade : applique le traitShift, calcule dominantTrait,
   gère le stress de personnalité (antagonismes), labels/blurbs UI. */

describe('personalityEngine — freshTraits', () => {
  it('initialise les 6 traits à 0', () => {
    const t = freshTraits();
    for (const trait of ALL_TRAITS) {
      expect(t[trait]).toBe(0);
    }
  });

  it('retourne une nouvelle référence à chaque appel', () => {
    expect(freshTraits()).not.toBe(freshTraits());
  });
});

describe('personalityEngine — applyTraitShift', () => {
  it('applique un shift partiel', () => {
    const next = applyTraitShift(freshTraits(), { batisseur: 3, rupture: 1 });
    expect(next.batisseur).toBe(3);
    expect(next.rupture).toBe(1);
    expect(next.technocrate).toBe(0);
  });

  it('cumule sur les valeurs existantes', () => {
    const start = { ...freshTraits(), batisseur: 5 };
    const next = applyTraitShift(start, { batisseur: 2 });
    expect(next.batisseur).toBe(7);
  });

  it('immutabilité — ne mute pas la source', () => {
    const start = freshTraits();
    applyTraitShift(start, { batisseur: 10 });
    expect(start.batisseur).toBe(0);
  });

  it('shift vide = no-op (mêmes valeurs)', () => {
    const start = { ...freshTraits(), batisseur: 5 };
    const next = applyTraitShift(start, {});
    expect(next).toEqual(start);
  });

  it('accepte des deltas négatifs', () => {
    const start = { ...freshTraits(), pragmatique: 5 };
    const next = applyTraitShift(start, { pragmatique: -3 });
    expect(next.pragmatique).toBe(2);
  });
});

describe('personalityEngine — computeDominantTrait', () => {
  it('retourne le trait avec le score max', () => {
    const t = { ...freshTraits(), batisseur: 8, rupture: 3 };
    expect(computeDominantTrait(t)).toBe('batisseur');
  });

  it('en cas d\'égalité, retourne le premier trait dans ALL_TRAITS (batisseur)', () => {
    /* freshTraits → tous à 0. Le premier de ALL_TRAITS gagne le tie-break. */
    expect(computeDominantTrait(freshTraits())).toBe('batisseur');
  });

  it('gère les valeurs négatives', () => {
    const t = freshTraits();
    for (const trait of ALL_TRAITS) t[trait] = -5;
    t.tribun = -1; // moins négatif → dominant
    expect(computeDominantTrait(t)).toBe('tribun');
  });
});

describe('personalityEngine — TRAIT_LABELS, TRAIT_BLURBS, TRAIT_ANTAGONISTS', () => {
  it('expose un label pour chaque trait', () => {
    for (const trait of ALL_TRAITS) {
      expect(TRAIT_LABELS[trait]).toBeTruthy();
      expect(TRAIT_LABELS[trait].length).toBeGreaterThan(0);
    }
  });

  it('expose un blurb pour chaque trait', () => {
    for (const trait of ALL_TRAITS) {
      expect(TRAIT_BLURBS[trait]).toBeTruthy();
      expect(TRAIT_BLURBS[trait].length).toBeGreaterThan(20);
    }
  });

  it('antagonismes symétriques (a→b → b→a)', () => {
    for (const trait of ALL_TRAITS) {
      const ant = TRAIT_ANTAGONISTS[trait];
      expect(TRAIT_ANTAGONISTS[ant]).toBe(trait);
    }
  });

  it('aucun trait n\'est son propre antagoniste', () => {
    for (const trait of ALL_TRAITS) {
      expect(TRAIT_ANTAGONISTS[trait]).not.toBe(trait);
    }
  });
});

describe('personalityEngine — computeStressDelta', () => {
  it('retourne 0 si pas de shift', () => {
    expect(computeStressDelta(undefined, 'batisseur')).toBe(0);
  });

  it('+6 par point d\'antagoniste poussé', () => {
    /* batisseur dominant, rupture est antagoniste. */
    const delta = computeStressDelta({ rupture: 2 }, 'batisseur');
    expect(delta).toBe(12); // 2 × 6
  });

  it('-2 si le trait dominant gagne ≥2 points', () => {
    const delta = computeStressDelta({ batisseur: 3 }, 'batisseur');
    expect(delta).toBe(-2);
  });

  it('+4 si le trait dominant perd ≥2 points', () => {
    const delta = computeStressDelta({ batisseur: -3 }, 'batisseur');
    expect(delta).toBe(4);
  });

  it('combinaison : antagoniste poussé + dominant chuté', () => {
    /* +12 (rupture×2) + +4 (batisseur -3) = +16 */
    const delta = computeStressDelta({ rupture: 2, batisseur: -3 }, 'batisseur');
    expect(delta).toBe(16);
  });

  it('shift vide = 0', () => {
    expect(computeStressDelta({}, 'batisseur')).toBe(0);
  });

  it('un dominant +1 ne soulage pas (seuil ≥2)', () => {
    expect(computeStressDelta({ batisseur: 1 }, 'batisseur')).toBe(0);
  });
});

describe('personalityEngine — clampStress', () => {
  it('borne à [0, 100]', () => {
    expect(clampStress(-50)).toBe(0);
    expect(clampStress(0)).toBe(0);
    expect(clampStress(50)).toBe(50);
    expect(clampStress(100)).toBe(100);
    expect(clampStress(150)).toBe(100);
  });
});

describe('personalityEngine — stressLevel', () => {
  it('serein < 25', () => {
    expect(stressLevel(0).level).toBe('serein');
    expect(stressLevel(24).level).toBe('serein');
  });

  it('inquiet [25, 55)', () => {
    expect(stressLevel(25).level).toBe('inquiet');
    expect(stressLevel(54).level).toBe('inquiet');
  });

  it('tendu [55, 80)', () => {
    expect(stressLevel(55).level).toBe('tendu');
    expect(stressLevel(79).level).toBe('tendu');
  });

  it('effondré ≥ 80', () => {
    expect(stressLevel(80).level).toBe('effondré');
    expect(stressLevel(100).level).toBe('effondré');
  });

  it('chaque niveau a label + hint non vides', () => {
    for (const v of [10, 30, 60, 90]) {
      const s = stressLevel(v);
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.hint.length).toBeGreaterThan(10);
    }
  });
});
