/* Couverture Vitest P1 ORDA-016 — org/factionBrawl.ts (était 0%).
   Module "Brawl Arena" (place de la République) : composition des
   factions, résolution stochastique seedable en 3 rounds, calcul
   d'effets ressources sur l'organisation. */

import { describe, it, expect } from 'vitest';
import {
  BRAWLER_CATALOG,
  buildPlayerFaction,
  buildAdversaryFaction,
  resolveBrawl,
  type FactionRoster
} from './factionBrawl';

describe('factionBrawl — BRAWLER_CATALOG', () => {
  it('expose les 8 types de combattants attendus', () => {
    const expected = [
      'manifestant', 'service-ordre', 'pigeon', 'coup-de-force',
      'securite-privee', 'bande-palis', 'infiltre', 'crs'
    ];
    for (const t of expected) {
      expect(BRAWLER_CATALOG[t as keyof typeof BRAWLER_CATALOG]).toBeDefined();
    }
  });

  it('chaque brawler a stats cohérentes (hp, atk, speed, strength > 0)', () => {
    for (const b of Object.values(BRAWLER_CATALOG)) {
      expect(b.hp).toBeGreaterThan(0);
      expect(b.speed).toBeGreaterThan(0);
      expect(b.strength).toBeGreaterThan(0);
      expect(b.label.length).toBeGreaterThan(0);
      expect(b.color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});

describe('factionBrawl — buildPlayerFaction (camp salarié)', () => {
  it('compose une faction joueur avec total et power > 0', () => {
    const f = buildPlayerFaction({
      camp: 'salarie',
      fouleParis: 30000,
      militants: 1000,
      cadres: 20,
      cohesion: 60
    });
    expect(f.side).toBe('joueur');
    expect(f.total).toBeGreaterThan(0);
    expect(f.power).toBeGreaterThan(0);
    expect(f.label).toBe('Cortège syndical');
    expect(f.brawlers.manifestant).toBeGreaterThan(0);
  });

  it('ajoute des coup-de-force quand cohésion < 40 (mouvement radicalisé)', () => {
    const calme = buildPlayerFaction({
      camp: 'salarie', fouleParis: 30000, militants: 1000, cadres: 20, cohesion: 70
    });
    const radical = buildPlayerFaction({
      camp: 'salarie', fouleParis: 30000, militants: 1000, cadres: 20, cohesion: 20
    });
    expect(calme.brawlers['coup-de-force']).toBeUndefined();
    expect(radical.brawlers['coup-de-force']).toBeGreaterThan(0);
  });

  it('cape les manifestants effectifs à 600 (Argus B-DT4)', () => {
    const f = buildPlayerFaction({
      camp: 'salarie', fouleParis: 1_000_000, militants: 5000, cadres: 50, cohesion: 60
    });
    expect(f.brawlers.manifestant).toBeLessThanOrEqual(600);
  });

  it('lève une erreur explicite côté patron (Conseil ORDA-003)', () => {
    expect(() =>
      buildPlayerFaction({
        camp: 'patron', fouleParis: 1000, militants: 100, cadres: 10, cohesion: 50
      })
    ).toThrow(/branche patron a été retirée/);
  });
});

describe('factionBrawl — buildAdversaryFaction', () => {
  it('compose des CRS face au camp salarié', () => {
    const f = buildAdversaryFaction({
      camp: 'salarie', fouleParis: 30000, era: 'present', policePressure: 60
    });
    expect(f.side).toBe('adversaire');
    expect(f.brawlers.crs).toBeGreaterThan(0);
    expect(f.label).toBe('Forces de l\'ordre');
  });

  it('réduit le base CRS sur les ères anciennes (révolution / xixe)', () => {
    const moderne = buildAdversaryFaction({
      camp: 'salarie', fouleParis: 10000, era: 'present', policePressure: 0
    });
    const ancien = buildAdversaryFaction({
      camp: 'salarie', fouleParis: 10000, era: 'xixe', policePressure: 0
    });
    expect((ancien.brawlers.crs ?? 0)).toBeLessThan(moderne.brawlers.crs ?? 0);
  });

  it('compose un cortège ouvrier face au camp patron', () => {
    const f = buildAdversaryFaction({
      camp: 'patron', fouleParis: 5000, era: 'present', policePressure: 30
    });
    expect(f.brawlers.manifestant).toBeGreaterThan(0);
    expect(f.label).toBe('Cortège ouvrier');
  });
});

describe('factionBrawl — resolveBrawl', () => {
  const buildRoster = (power: number, total: number, side: 'joueur' | 'adversaire' = 'joueur'): FactionRoster => ({
    side,
    brawlers: { manifestant: total },
    total,
    power,
    label: side === 'joueur' ? 'Joueur' : 'Adversaire'
  });

  it('produit un outcome avec rounds et effets pour des factions équilibrées', () => {
    const out = resolveBrawl({
      joueur: buildRoster(500, 200),
      adversaire: buildRoster(500, 100, 'adversaire'),
      seed: 42
    });
    expect(out.rounds.length).toBeGreaterThan(0);
    expect(out.rounds.length).toBeLessThanOrEqual(3);
    expect(['victoire', 'nul', 'defaite']).toContain(out.result);
    expect(out.effects).toBeDefined();
    expect(out.finalNarrative.length).toBeGreaterThan(20);
  });

  it('est déterministe avec le même seed (Argus B-DT3 reproductibilité)', () => {
    const j = buildRoster(800, 300);
    const a = buildRoster(400, 80, 'adversaire');
    const r1 = resolveBrawl({ joueur: j, adversaire: a, seed: 1234 });
    const r2 = resolveBrawl({ joueur: j, adversaire: a, seed: 1234 });
    expect(r1.result).toBe(r2.result);
    expect(r1.totalJoueurLosses).toBe(r2.totalJoueurLosses);
    expect(r1.totalAdversaireLosses).toBe(r2.totalAdversaireLosses);
  });

  it('victoire : effets positifs sur rapportDeForce et confiance', () => {
    /* Joueur largement supérieur → forçage statistique vers victoire. */
    const out = resolveBrawl({
      joueur: buildRoster(5000, 600),
      adversaire: buildRoster(200, 50, 'adversaire'),
      seed: 7
    });
    expect(out.result).toBe('victoire');
    expect(out.effects.rapportDeForce).toBeGreaterThan(0);
    expect(out.effects.confiance).toBeGreaterThan(0);
  });

  it('défaite : effets négatifs sur cohésion interne et confiance', () => {
    const out = resolveBrawl({
      joueur: buildRoster(150, 30),
      adversaire: buildRoster(6000, 800, 'adversaire'),
      seed: 99
    });
    expect(out.result).toBe('defaite');
    expect(out.effects.cohesionInterne).toBeLessThan(0);
    expect(out.effects.confiance).toBeLessThan(0);
  });

  it('idempotence : ne mute pas les rosters d\'entrée', () => {
    const j = buildRoster(500, 200);
    const a = buildRoster(500, 100, 'adversaire');
    const jSnap = JSON.stringify(j);
    const aSnap = JSON.stringify(a);
    resolveBrawl({ joueur: j, adversaire: a, seed: 7 });
    expect(JSON.stringify(j)).toBe(jSnap);
    expect(JSON.stringify(a)).toBe(aSnap);
  });
});
