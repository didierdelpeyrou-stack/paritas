import { describe, it, expect } from 'vitest';
import { INSTITUTIONS, institutionById } from './institutions';

/* Couverture Vitest ORDA-013 — simulation/institutions.ts (était 0%).
   Catalogue d'institutions paritaires (13 entrées) + lookup. */

describe('institutions — INSTITUTIONS catalogue', () => {
  it('expose au moins 10 institutions', () => {
    expect(INSTITUTIONS.length).toBeGreaterThanOrEqual(10);
  });

  it('chaque institution a id unique', () => {
    const ids = INSTITUTIONS.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('chaque institution a id, name, year, desc', () => {
    for (const i of INSTITUTIONS) {
      expect(i.id).toBeTruthy();
      expect(i.name).toBeTruthy();
      expect(i.year).toBeTruthy();
      expect(i.desc).toBeTruthy();
      expect(i.desc.length).toBeGreaterThan(10);
    }
  });

  it('couvre les institutions emblématiques du paritarisme français', () => {
    const ids = INSTITUTIONS.map(i => i.id);
    expect(ids).toContain('prudhommes');
    expect(ids).toContain('syndicat-1884');
    expect(ids).toContain('matignon-1936');
    expect(ids).toContain('secu-1945');
    expect(ids).toContain('chsct-1982');
  });

  it('ordre approximativement chronologique (par année)', () => {
    /* Les institutions sont listées dans l'ordre historique.
       On vérifie que l'index 0 est antérieur aux dernières. */
    expect(INSTITUTIONS[0].id).toBe('collegia'); // -300 av. J.-C.
    const lastIds = INSTITUTIONS.slice(-3).map(i => i.id);
    expect(lastIds).toContain('chsct-1982'); // 1982 dans les 3 dernières
  });
});

describe('institutions — institutionById', () => {
  it('retourne l\'institution correcte par id', () => {
    const i = institutionById('matignon-1936');
    expect(i).toBeDefined();
    expect(i!.year).toBe('1936');
    expect(i!.name).toBe('Accords de Matignon');
  });

  it('retourne undefined pour un id inexistant', () => {
    expect(institutionById('inexistant')).toBeUndefined();
  });

  it('lookup pour chaque institution du catalogue', () => {
    for (const inst of INSTITUTIONS) {
      const found = institutionById(inst.id);
      expect(found?.id).toBe(inst.id);
    }
  });
});
