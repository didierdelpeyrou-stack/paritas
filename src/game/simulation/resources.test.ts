import { describe, it, expect } from 'vitest';
import {
  freshResources,
  clamp,
  applyResourceDelta,
  formatResourceDelta,
  RESOURCE_LABELS,
  RESOURCE_TOOLTIPS
} from './resources';
import type { ResourceKey } from '../types';

/* Couverture Vitest ORDA-011 — simulation/resources.ts (était 0%).
   Module utilitaire fondamental : initialisation, clamp, application
   de deltas, formatage. Toute la couche moteur dépend de ces helpers. */

describe('resources — freshResources', () => {
  it('initialise les 7 ressources avec des valeurs par défaut sensées', () => {
    const r = freshResources();
    expect(r.confiance).toBe(50);
    expect(r.caisse).toBe(40);
    expect(r.santeSociale).toBe(60);
    expect(r.legitimite).toBe(40);
    expect(r.rapportDeForce).toBe(30);
    expect(r.cohesionInterne).toBe(50);
    expect(r.institution).toBe(20);
  });

  it('produit des références fraîches (pas de partage)', () => {
    const a = freshResources();
    const b = freshResources();
    a.confiance = 99;
    expect(b.confiance).toBe(50);
  });
});

describe('resources — clamp', () => {
  it('borne par défaut à [0, 100]', () => {
    expect(clamp(50)).toBe(50);
    expect(clamp(-5)).toBe(0);
    expect(clamp(150)).toBe(100);
    expect(clamp(0)).toBe(0);
    expect(clamp(100)).toBe(100);
  });

  it('accepte des bornes custom', () => {
    expect(clamp(50, 10, 90)).toBe(50);
    expect(clamp(5, 10, 90)).toBe(10);
    expect(clamp(95, 10, 90)).toBe(90);
  });
});

describe('resources — applyResourceDelta', () => {
  it('applique un delta positif', () => {
    const r1 = freshResources();
    const r2 = applyResourceDelta(r1, { confiance: 10 });
    expect(r2.confiance).toBe(60);
    expect(r2.caisse).toBe(40); // inchangé
  });

  it('applique un delta négatif', () => {
    const r1 = freshResources();
    const r2 = applyResourceDelta(r1, { caisse: -20 });
    expect(r2.caisse).toBe(20);
  });

  it('clampe à 0 si delta trop négatif', () => {
    const r1 = freshResources();
    const r2 = applyResourceDelta(r1, { caisse: -100 });
    expect(r2.caisse).toBe(0);
  });

  it('clampe à 100 si delta trop positif', () => {
    const r1 = freshResources();
    const r2 = applyResourceDelta(r1, { confiance: 200 });
    expect(r2.confiance).toBe(100);
  });

  it('applique plusieurs deltas en un seul appel', () => {
    const r1 = freshResources();
    const r2 = applyResourceDelta(r1, {
      confiance: 5, caisse: -10, institution: 30
    });
    expect(r2.confiance).toBe(55);
    expect(r2.caisse).toBe(30);
    expect(r2.institution).toBe(50);
  });

  it('immutable — r1 inchangé', () => {
    const r1 = freshResources();
    applyResourceDelta(r1, { confiance: 50 });
    expect(r1.confiance).toBe(50);
  });

  it('ignore les undefined dans delta', () => {
    const r1 = freshResources();
    const delta: Partial<{ confiance: number }> = { confiance: undefined };
    const r2 = applyResourceDelta(r1, delta);
    expect(r2.confiance).toBe(50);
  });
});

describe('resources — formatResourceDelta', () => {
  it('formate un delta positif avec +', () => {
    expect(formatResourceDelta('confiance', 5)).toBe('Confiance +5');
  });

  it('formate un delta négatif avec -', () => {
    expect(formatResourceDelta('caisse', -10)).toBe('Caisse -10');
  });

  it('formate 0 sans signe particulier', () => {
    expect(formatResourceDelta('confiance', 0)).toBe('Confiance +0');
  });

  it('arrondit les fractions', () => {
    expect(formatResourceDelta('confiance', 3.7)).toBe('Confiance +4');
    expect(formatResourceDelta('caisse', -2.4)).toBe('Caisse -2');
  });
});

describe('resources — labels & tooltips', () => {
  it('expose un label pour chaque ResourceKey', () => {
    const keys: ResourceKey[] = [
      'confiance', 'caisse', 'santeSociale', 'legitimite',
      'rapportDeForce', 'cohesionInterne', 'institution'
    ];
    for (const k of keys) {
      expect(RESOURCE_LABELS[k]).toBeDefined();
      expect(RESOURCE_LABELS[k].length).toBeGreaterThan(0);
    }
  });

  it('expose un tooltip pour chaque ResourceKey', () => {
    const keys: ResourceKey[] = [
      'confiance', 'caisse', 'santeSociale', 'legitimite',
      'rapportDeForce', 'cohesionInterne', 'institution'
    ];
    for (const k of keys) {
      expect(RESOURCE_TOOLTIPS[k]).toBeDefined();
      expect(RESOURCE_TOOLTIPS[k].length).toBeGreaterThan(10);
    }
  });
});
