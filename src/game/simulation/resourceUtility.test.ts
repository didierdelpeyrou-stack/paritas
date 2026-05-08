import { describe, it, expect } from 'vitest';
import {
  fuelsFor,
  abilitiesFor,
  abilityFuelScore,
  fuelBreakdown,
  fuelScoreLabel,
  fuelMultiplier,
  thresholdFor,
  nextThresholdFor,
  RESOURCE_FUELS,
  RESOURCE_THRESHOLDS,
  ABILITY_SHORT_LABEL
} from './resourceUtility';
import { freshResources } from './resources';
import type { ResourceKey } from '../types';

/* Couverture Vitest ORDA-013 — simulation/resourceUtility.ts (était 0%).
   Module pivot du gameplay : alimente les "fuel scores" qui modulent
   les mini-jeux. 11 fonctions exportées + maps de données. */

describe('resourceUtility — fuelsFor & abilitiesFor', () => {
  it('fuelsFor retourne au plus N entries', () => {
    const top3 = fuelsFor('manifestation', 3);
    expect(top3.length).toBeLessThanOrEqual(3);
    const top5 = fuelsFor('manifestation', 5);
    expect(top5.length).toBeLessThanOrEqual(5);
  });

  it('fuelsFor pour une ability inexistante retourne []', () => {
    /* On force un cast pour tester le path "ability inconnue". */
    const fuels = fuelsFor('inconnue' as never, 3);
    expect(fuels).toEqual([]);
  });

  it('abilitiesFor retourne le tableau pour une ressource donnée', () => {
    const a = abilitiesFor('confiance');
    expect(Array.isArray(a)).toBe(true);
  });
});

describe('resourceUtility — abilityFuelScore', () => {
  it('retourne 0 pour une ability sans fuel', () => {
    expect(abilityFuelScore('inconnue' as never, freshResources())).toBe(0);
  });

  it('retourne un score 0-100 pour une ability connue', () => {
    const score = abilityFuelScore('manifestation', freshResources());
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('score plus haut si ressources plus hautes', () => {
    const low = abilityFuelScore('manifestation', {
      confiance: 0, caisse: 0, santeSociale: 0, legitimite: 0,
      rapportDeForce: 0, cohesionInterne: 0, institution: 0
    });
    const high = abilityFuelScore('manifestation', {
      confiance: 100, caisse: 100, santeSociale: 100, legitimite: 100,
      rapportDeForce: 100, cohesionInterne: 100, institution: 100
    });
    expect(high).toBeGreaterThan(low);
  });
});

describe('resourceUtility — fuelBreakdown', () => {
  it('retourne string vide pour ability inconnue', () => {
    expect(fuelBreakdown('inconnue' as never, freshResources())).toBe('');
  });

  it('inclut au moins un nom de ressource + le score final', () => {
    const breakdown = fuelBreakdown('manifestation', freshResources());
    expect(breakdown).toMatch(/×/); // notation pondérée
    expect(breakdown).toMatch(/=/); // résultat final
  });

  it('breakdown self-consistent : score affiché = abilityFuelScore', () => {
    const res = { ...freshResources(), confiance: 67, caisse: 43 };
    const score = abilityFuelScore('manifestation', res);
    const breakdown = fuelBreakdown('manifestation', res);
    expect(breakdown).toContain(`= ${score}`);
  });
});

describe('resourceUtility — fuelScoreLabel', () => {
  it('seuils croissants : à sec < précaire < limité < solide < excellent', () => {
    expect(fuelScoreLabel(0)).toBe('À sec');
    expect(fuelScoreLabel(20)).toBe('Précaire');
    expect(fuelScoreLabel(40)).toBe('Limité');
    expect(fuelScoreLabel(60)).toBe('Solide');
    expect(fuelScoreLabel(80)).toBe('Excellent');
  });

  it('limites de seuil', () => {
    expect(fuelScoreLabel(75)).toBe('Excellent');
    expect(fuelScoreLabel(74)).toBe('Solide');
    expect(fuelScoreLabel(55)).toBe('Solide');
    expect(fuelScoreLabel(54)).toBe('Limité');
  });
});

describe('resourceUtility — fuelMultiplier', () => {
  it('centré sur 1.0 à fuel=50', () => {
    expect(fuelMultiplier(50)).toBeCloseTo(1.0, 5);
  });

  it('borné à 0.80 à fuel=0', () => {
    expect(fuelMultiplier(0)).toBeCloseTo(0.80, 5);
  });

  it('borné à 1.20 à fuel=100', () => {
    expect(fuelMultiplier(100)).toBeCloseTo(1.20, 5);
  });

  it('clampe les valeurs hors [0, 100]', () => {
    expect(fuelMultiplier(-50)).toBeCloseTo(0.80, 5);
    expect(fuelMultiplier(200)).toBeCloseTo(1.20, 5);
  });
});

describe('resourceUtility — thresholdFor & nextThresholdFor', () => {
  it('thresholdFor retourne un seuil pour chaque ressource', () => {
    const keys: ResourceKey[] = [
      'confiance', 'caisse', 'santeSociale', 'legitimite',
      'rapportDeForce', 'cohesionInterne', 'institution'
    ];
    for (const k of keys) {
      const t = thresholdFor(k, 50);
      expect(t).toBeDefined();
      expect(t.level).toBeTruthy();
      expect(t.unlock).toBeTruthy();
    }
  });

  it('thresholdFor varie selon la valeur', () => {
    const low = thresholdFor('confiance', 5);   // critique (min 0)
    const high = thresholdFor('confiance', 95); // excellent (min 75)
    expect(low.level).toBe('critique');
    expect(high.level).toBe('excellent');
  });

  it('nextThresholdFor retourne le seuil suivant ou null', () => {
    /* À 95 (excellent), plus de seuil au-delà — null attendu. */
    const next95 = nextThresholdFor('confiance', 95);
    expect(next95).toBeNull();

    /* À 30 (fragile), prochain seuil = solide (min 50). */
    const next30 = nextThresholdFor('confiance', 30);
    expect(next30).not.toBeNull();
    expect(next30!.level).toBe('solide');
  });
});

describe('resourceUtility — maps & labels', () => {
  it('RESOURCE_FUELS expose une entrée pour chaque ResourceKey', () => {
    const keys: ResourceKey[] = [
      'confiance', 'caisse', 'santeSociale', 'legitimite',
      'rapportDeForce', 'cohesionInterne', 'institution'
    ];
    for (const k of keys) {
      expect(Array.isArray(RESOURCE_FUELS[k])).toBe(true);
    }
  });

  it('RESOURCE_THRESHOLDS expose au moins 1 seuil par ResourceKey', () => {
    const keys: ResourceKey[] = [
      'confiance', 'caisse', 'santeSociale', 'legitimite',
      'rapportDeForce', 'cohesionInterne', 'institution'
    ];
    for (const k of keys) {
      expect(RESOURCE_THRESHOLDS[k].length).toBeGreaterThan(0);
    }
  });

  it('ABILITY_SHORT_LABEL est cohérent (chaque clé → label non vide)', () => {
    for (const id of Object.keys(ABILITY_SHORT_LABEL)) {
      const label = ABILITY_SHORT_LABEL[id as keyof typeof ABILITY_SHORT_LABEL];
      expect(label).toBeTruthy();
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
