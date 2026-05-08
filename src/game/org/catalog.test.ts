import { describe, it, expect } from 'vitest';
import {
  ORG_ACTIONS,
  ORG_ASSETS,
  availableOrgActions,
  availableOrgAssets,
  assetById
} from './catalog';

/* Couverture Vitest ORDA-014 — org/catalog.ts (était 0%).
   Catalogue d'actions et d'actifs débloquables pour l'organisation
   joueur, filtré par tour + camp. Pivot du panneau "Organisation". */

describe('catalog — ORG_ACTIONS', () => {
  it('expose ≥7 actions', () => {
    expect(ORG_ACTIONS.length).toBeGreaterThanOrEqual(7);
  });

  it('chaque action a id unique + champs requis', () => {
    const ids = new Set<string>();
    for (const a of ORG_ACTIONS) {
      expect(a.id).toBeTruthy();
      expect(ids.has(a.id)).toBe(false);
      ids.add(a.id);
      expect(a.label).toBeTruthy();
      expect(a.unlockTurn).toBeGreaterThan(0);
      expect(typeof a.cost).toBe('number');
      expect(a.orgDelta).toBeDefined();
      expect(a.narrative).toBeTruthy();
    }
  });

  it('contient des actions emblématiques', () => {
    const ids = ORG_ACTIONS.map(a => a.id);
    expect(ids).toContain('recruter-adherents');
    expect(ids).toContain('ouvrir-section');
    expect(ids).toContain('renforcer-caisse');
    expect(ids).toContain('campagne-presse');
  });
});

describe('catalog — ORG_ASSETS', () => {
  it('expose ≥5 actifs', () => {
    expect(ORG_ASSETS.length).toBeGreaterThanOrEqual(5);
  });

  it('chaque actif a id unique + champs requis', () => {
    const ids = new Set<string>();
    for (const a of ORG_ASSETS) {
      expect(a.id).toBeTruthy();
      expect(ids.has(a.id)).toBe(false);
      ids.add(a.id);
      expect(a.label).toBeTruthy();
      expect(a.type).toBeTruthy();
      expect(a.purchaseCost).toBeGreaterThan(0);
      expect(typeof a.upkeep).toBe('number');
      expect(a.upkeep).toBeGreaterThanOrEqual(0);
      expect(a.resaleValue).toBeGreaterThanOrEqual(0);
    }
  });

  it('resaleValue ≤ purchaseCost (pas de profit gratuit)', () => {
    for (const a of ORG_ASSETS) {
      expect(a.resaleValue).toBeLessThanOrEqual(a.purchaseCost);
    }
  });

  it('contient les actifs emblématiques', () => {
    const ids = ORG_ASSETS.map(a => a.id);
    expect(ids).toContain('local-syndical');
    expect(ids).toContain('journal-militant');
    expect(ids).toContain('fonds-greve');
  });
});

describe('catalog — availableOrgActions', () => {
  it('filtre par turn (unlockTurn ≤ turn)', () => {
    const t10 = availableOrgActions(10, 'salarie');
    const t14 = availableOrgActions(14, 'salarie');
    const t100 = availableOrgActions(100, 'salarie');
    expect(t10.length).toBeLessThan(t14.length);
    expect(t14.length).toBeLessThanOrEqual(t100.length);
    expect(t100.length).toBe(ORG_ACTIONS.filter(a => !a.camp || a.camp === 'any' || a.camp === 'salarie').length);
  });

  it('filtre par camp (salarie n\'a pas les actions patron)', () => {
    const sal = availableOrgActions(100, 'salarie');
    const pat = availableOrgActions(100, 'patron');
    /* Aucune action salarie-only ne doit apparaître côté patron. */
    expect(sal.find(a => a.id === 'recruter-adherents')).toBeDefined();
    expect(pat.find(a => a.id === 'recruter-adherents')).toBeUndefined();
    expect(pat.find(a => a.id === 'federer-branche')).toBeDefined();
    expect(sal.find(a => a.id === 'federer-branche')).toBeUndefined();
  });

  it('actions sans camp (any) apparaissent des deux côtés', () => {
    const sal = availableOrgActions(100, 'salarie');
    const pat = availableOrgActions(100, 'patron');
    expect(sal.find(a => a.id === 'former-delegues')).toBeDefined();
    expect(pat.find(a => a.id === 'former-delegues')).toBeDefined();
  });
});

describe('catalog — availableOrgAssets', () => {
  it('filtre par turn', () => {
    const t10 = availableOrgAssets(10, 'salarie', []);
    const t100 = availableOrgAssets(100, 'salarie', []);
    expect(t10.length).toBeLessThan(t100.length);
  });

  it('exclut les actifs déjà possédés', () => {
    const without = availableOrgAssets(100, 'salarie', []);
    const with1 = availableOrgAssets(100, 'salarie', ['local-syndical']);
    expect(with1.length).toBe(without.length - 1);
    expect(with1.find(a => a.id === 'local-syndical')).toBeUndefined();
  });

  it('filtre par camp', () => {
    const sal = availableOrgAssets(100, 'salarie', []);
    const pat = availableOrgAssets(100, 'patron', []);
    expect(sal.find(a => a.id === 'fonds-greve')).toBeDefined();
    expect(pat.find(a => a.id === 'fonds-greve')).toBeUndefined();
    expect(pat.find(a => a.id === 'cabinet-juridique')).toBeDefined();
  });

  it('actifs sans camp (any) apparaissent des deux côtés', () => {
    const sal = availableOrgAssets(100, 'salarie', []);
    const pat = availableOrgAssets(100, 'patron', []);
    expect(sal.find(a => a.id === 'institut-expertise')).toBeDefined();
    expect(pat.find(a => a.id === 'institut-expertise')).toBeDefined();
  });
});

describe('catalog — assetById', () => {
  it('retourne l\'actif par id', () => {
    const a = assetById('local-syndical');
    expect(a).toBeDefined();
    expect(a!.label).toBe('Local syndical');
  });

  it('retourne undefined si id inconnu', () => {
    expect(assetById('inconnu-xyz')).toBeUndefined();
  });

  it('retourne undefined sur id vide', () => {
    expect(assetById('')).toBeUndefined();
  });
});
