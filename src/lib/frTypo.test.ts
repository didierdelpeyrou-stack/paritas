import { describe, it, expect } from 'vitest';
import { frTypo, countTypoViolations } from './frTypo';

/* Couverture BUG-7 (Paritas-QA 2026-05-10) — typographie française.
   Espaces insécables avant : ; ! ? » et après «. */

describe('frTypo — espaces insécables', () => {
  it('insère un nbsp avant deux-points', () => {
    expect(frTypo('Sur la table : 40h')).toBe('Sur la table : 40h');
  });

  it('insère un nbsp avant point-virgule', () => {
    expect(frTypo('Allez ; respire')).toBe('Allez ; respire');
  });

  it('insère un nbsp avant point d\'exclamation', () => {
    expect(frTypo('Vraiment !')).toBe('Vraiment !');
  });

  it('insère un nbsp avant point d\'interrogation', () => {
    expect(frTypo('Et toi ?')).toBe('Et toi ?');
  });

  it('insère un nbsp après guillemet ouvrant et avant guillemet fermant', () => {
    expect(frTypo('Il dit « bonjour »')).toBe('Il dit « bonjour »');
  });

  it('idempotent : nbsp déjà présent reste inchangé', () => {
    const once = frTypo('Salaire : 1500€');
    const twice = frTypo(once);
    expect(twice).toBe(once);
  });

  it('null / undefined → string vide', () => {
    expect(frTypo(null)).toBe('');
    expect(frTypo(undefined)).toBe('');
    expect(frTypo('')).toBe('');
  });

  it('ne touche pas aux URLs (heuristique ://)', () => {
    expect(frTypo('voir https://example.org : super')).toContain('https://example.org');
  });

  it('combine plusieurs ponctuations', () => {
    const out = frTypo('Quoi ? Vraiment ! On signe ; bon.');
    expect(out).toBe('Quoi ? Vraiment ! On signe ; bon.');
  });
});

describe('countTypoViolations', () => {
  it('compte 0 si tout est correct', () => {
    expect(countTypoViolations('Bonjour : tout va bien.')).toBe(0);
  });

  it('compte les violations brutes', () => {
    expect(countTypoViolations('Quoi ? Et alors ! Bon ; voilà.')).toBe(3);
  });

  it('texte vide → 0', () => {
    expect(countTypoViolations('')).toBe(0);
  });
});
