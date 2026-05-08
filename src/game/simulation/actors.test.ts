import { describe, it, expect } from 'vitest';
import {
  freshActors,
  applyActorDelta,
  applyActorsDelta,
  ACTOR_LABELS,
  ACTOR_TOOLTIPS,
  stanceLabel
} from './actors';
import type { ActorId, ActorStance } from '../types';

/* Couverture Vitest ORDA-012 — simulation/actors.ts (était 0%).
   4 acteurs (base, adversaire, etat, opinion) × 4 champs (trust,
   pressure, patience, stance). Helpers de delta + labels + stance. */

describe('actors — freshActors', () => {
  it('initialise les 4 acteurs avec stance cohérente', () => {
    const a = freshActors();
    expect(a.base.stance).toBe('cooperatif');
    expect(a.adversaire.stance).toBe('opportuniste');
    expect(a.etat.stance).toBe('opportuniste');
    expect(a.opinion.stance).toBe('instable');
  });

  it('valeurs par défaut sensées (≥ 20, ≤ 80)', () => {
    const a = freshActors();
    const ids: ActorId[] = ['base', 'adversaire', 'etat', 'opinion'];
    for (const id of ids) {
      expect(a[id].trust).toBeGreaterThanOrEqual(20);
      expect(a[id].trust).toBeLessThanOrEqual(80);
      expect(a[id].pressure).toBeGreaterThanOrEqual(0);
      expect(a[id].pressure).toBeLessThanOrEqual(100);
      expect(a[id].patience).toBeGreaterThanOrEqual(20);
      expect(a[id].patience).toBeLessThanOrEqual(100);
    }
  });

  it('produit des références fraîches', () => {
    const a1 = freshActors();
    const a2 = freshActors();
    a1.base.trust = 99;
    expect(a2.base.trust).toBe(60);
  });
});

describe('actors — applyActorDelta', () => {
  it('applique un delta partiel et clampe à 100', () => {
    const a = freshActors();
    const updated = applyActorDelta(a.base, { trust: 50, pressure: 200 });
    expect(updated.trust).toBe(100); // 60+50 clamped
    expect(updated.pressure).toBe(100); // 30+200 clamped
    expect(updated.patience).toBe(70); // inchangé
    expect(updated.stance).toBe('cooperatif'); // inchangé
  });

  it('applique un delta négatif et clampe à 0', () => {
    const a = freshActors();
    const updated = applyActorDelta(a.adversaire, { trust: -100 });
    expect(updated.trust).toBe(0);
  });

  it('préserve la stance si pas dans le delta', () => {
    const a = freshActors();
    const updated = applyActorDelta(a.base, { trust: 5 });
    expect(updated.stance).toBe('cooperatif');
  });

  it('change la stance si dans le delta', () => {
    const a = freshActors();
    const updated = applyActorDelta(a.base, { stance: 'dur' });
    expect(updated.stance).toBe('dur');
  });

  it('ne mute pas l\'acteur source', () => {
    const a = freshActors();
    applyActorDelta(a.base, { trust: 5 });
    expect(a.base.trust).toBe(60);
  });
});

describe('actors — applyActorsDelta', () => {
  it('applique des deltas à plusieurs acteurs simultanément', () => {
    const a = freshActors();
    const updated = applyActorsDelta(a, {
      base: { trust: +10 },
      adversaire: { pressure: -20 }
    });
    expect(updated.base.trust).toBe(70);
    expect(updated.adversaire.pressure).toBe(30); // 50-20
    expect(updated.etat.trust).toBe(50); // inchangé
    expect(updated.opinion.trust).toBe(50); // inchangé
  });

  it('ignore les acteurs absents du delta', () => {
    const a = freshActors();
    const updated = applyActorsDelta(a, { base: { trust: +5 } });
    expect(updated.adversaire).toEqual(a.adversaire);
    expect(updated.etat).toEqual(a.etat);
    expect(updated.opinion).toEqual(a.opinion);
  });

  it('no-op si delta vide', () => {
    const a = freshActors();
    const updated = applyActorsDelta(a, {});
    expect(updated.base).toEqual(a.base);
  });

  it('ne mute pas l\'objet source', () => {
    const a = freshActors();
    applyActorsDelta(a, { base: { trust: -100 } });
    expect(a.base.trust).toBe(60);
  });
});

describe('actors — labels & tooltips', () => {
  it('expose un label pour chaque ActorId', () => {
    const ids: ActorId[] = ['base', 'adversaire', 'etat', 'opinion'];
    for (const id of ids) {
      expect(ACTOR_LABELS[id]).toBeDefined();
      expect(ACTOR_LABELS[id].length).toBeGreaterThan(0);
    }
  });

  it('expose un tooltip pour chaque ActorId', () => {
    const ids: ActorId[] = ['base', 'adversaire', 'etat', 'opinion'];
    for (const id of ids) {
      expect(ACTOR_TOOLTIPS[id]).toBeDefined();
      expect(ACTOR_TOOLTIPS[id].length).toBeGreaterThan(15);
    }
  });
});

describe('actors — stanceLabel', () => {
  it('retourne un label français pour chaque stance', () => {
    const stances: ActorStance[] = ['cooperatif', 'dur', 'instable', 'opportuniste'];
    const labels = stances.map(stanceLabel);
    expect(labels).toEqual(['Coopératif', 'Dur', 'Instable', 'Opportuniste']);
  });
});
