/* P2 ORDA-017 PARITAS — couverture résiduelle opponentFactions.ts.
   La grille historique des factions adverses (forPlayerCamp +
   fromTurn/toTurn) doit produire la bonne organisation à chaque
   période, et basculer correctement aux frontières. */

import { describe, it, expect } from 'vitest';
import { currentOpponentFaction } from './opponentFactions';

describe('opponentFactions — currentOpponentFaction (camp salarie)', () => {
  it('tour 1 (1830s) → Maîtres des forges', () => {
    const f = currentOpponentFaction(1, 'salarie');
    expect(f.id).toBe('maitres-des-forges');
    expect(f.shortName).toBe('Forges');
  });

  it('tour 14 (1864) → Comité des Forges (frontière inclusive)', () => {
    const f = currentOpponentFaction(14, 'salarie');
    expect(f.id).toBe('comite-des-forges');
  });

  it('tour 19 (1919) → CGPF (post-WW1)', () => {
    const f = currentOpponentFaction(19, 'salarie');
    expect(f.id).toBe('cgpf');
  });

  it('tour 23 (1946) → CNPF (post-Libération)', () => {
    const f = currentOpponentFaction(23, 'salarie');
    expect(f.id).toBe('cnpf');
  });

  it('tour 36 (1998) → MEDEF (refondation sociale)', () => {
    const f = currentOpponentFaction(36, 'salarie');
    expect(f.id).toBe('medef');
  });

  it('tour 80 (futur) → MEDEF (faction ouverte, pas de toTurn)', () => {
    const f = currentOpponentFaction(80, 'salarie');
    expect(f.id).toBe('medef');
  });
});

describe('opponentFactions — currentOpponentFaction (camp patron)', () => {
  it('tour 1 → Compagnonnages', () => {
    const f = currentOpponentFaction(1, 'patron');
    expect(f.id).toBe('compagnons-clandestins');
  });

  it('tour 14 → CGT naissante', () => {
    const f = currentOpponentFaction(14, 'patron');
    expect(f.id).toBe('cgt-naissante');
  });

  it('tour 19 → CGT/CGTU (scission communiste)', () => {
    const f = currentOpponentFaction(19, 'patron');
    expect(f.id).toBe('cgt-cgtu');
  });

  it('tour 22 → CGT réunifiée (Matignon)', () => {
    const f = currentOpponentFaction(22, 'patron');
    expect(f.id).toBe('cgt-reunifiee');
  });

  it('tour 25 → intersyndicale FO (post-1947)', () => {
    const f = currentOpponentFaction(25, 'patron');
    expect(f.id).toBe('intersyndicale-fo');
  });

  it('tour 30 + → intersyndicale large (faction ouverte)', () => {
    const f30 = currentOpponentFaction(30, 'patron');
    const f99 = currentOpponentFaction(99, 'patron');
    expect(f30.id).toBe('intersyndicale-large');
    expect(f99.id).toBe('intersyndicale-large');
  });
});

describe('opponentFactions — fallback', () => {
  it('tour 0 (avant tout) côté salarie → fallback "Patronat"', () => {
    const f = currentOpponentFaction(0, 'salarie');
    expect(f.id).toBe('patronat');
    expect(f.displayName).toBe('Patronat');
  });

  it('tour 0 (avant tout) côté patron → fallback "Syndicats"', () => {
    const f = currentOpponentFaction(0, 'patron');
    expect(f.id).toBe('syndicats');
  });
});
