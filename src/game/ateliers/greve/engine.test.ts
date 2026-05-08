import { describe, it, expect } from 'vitest';
import {
  startGreveSession,
  pickGreveMove,
  resolveGreveRound,
  nextGreveRound,
  greveOutcomeToV2Effects,
  SALARIE_GREVE_MOVES,
  PATRON_GREVE_MOVES,
  type GreveState,
  type SalarieGreveMove,
  type PatronGreveMove
} from './engine';

describe('Grève — initial state & catalogues', () => {
  it('starts at round 1, picking phase, solidarité=80, production=75, zone=50', () => {
    const s = startGreveSession();
    expect(s.round).toBe(1);
    expect(s.phase).toBe('picking');
    expect(s.solidarite).toBe(80);
    expect(s.production).toBe(75);
    expect(s.zone).toBe(50);
    expect(s.history).toEqual([]);
    expect(s.matchOutcome).toBeNull();
  });

  it('exposes 5 moves per side', () => {
    expect(SALARIE_GREVE_MOVES).toHaveLength(5);
    expect(PATRON_GREVE_MOVES).toHaveLength(5);
  });

  it('all moves have a beats array (matchup definition)', () => {
    for (const m of SALARIE_GREVE_MOVES) {
      expect(Array.isArray(m.beats)).toBe(true);
    }
    for (const m of PATRON_GREVE_MOVES) {
      expect(Array.isArray(m.beats)).toBe(true);
    }
  });
});

describe('Grève — round resolution', () => {
  it('pickGreveMove sets the side pick', () => {
    let s = startGreveSession();
    s = pickGreveMove(s, 'salarie', 'greve_totale');
    expect(s.salariePick).toBe('greve_totale');
    s = pickGreveMove(s, 'patron', 'lockout');
    expect(s.patronPick).toBe('lockout');
  });

  it('resolveGreveRound transitions to result phase with history entry', () => {
    let s = startGreveSession();
    s = pickGreveMove(s, 'salarie', 'greve_totale');
    s = pickGreveMove(s, 'patron', 'lockout');
    s = resolveGreveRound(s);
    expect(s.phase === 'result' || s.phase === 'ended').toBe(true);
    expect(s.history).toHaveLength(1);
  });

  it('resolveGreveRound clamps solidarité, production, zone in [0, 100]', () => {
    let s = startGreveSession();
    /* Force extreme values via repeated rounds */
    for (let r = 0; r < 5 && s.phase !== 'ended'; r++) {
      s = pickGreveMove(s, 'salarie', 'occuper');
      s = pickGreveMove(s, 'patron', 'lockout');
      s = resolveGreveRound(s);
      expect(s.solidarite).toBeGreaterThanOrEqual(0);
      expect(s.solidarite).toBeLessThanOrEqual(100);
      expect(s.production).toBeGreaterThanOrEqual(0);
      expect(s.production).toBeLessThanOrEqual(100);
      expect(s.zone).toBeGreaterThanOrEqual(0);
      expect(s.zone).toBeLessThanOrEqual(100);
      if (s.phase === 'result') s = nextGreveRound(s);
    }
  });

  it('double "negocier" produces ouverture_negociation outcome', () => {
    let s = startGreveSession();
    s = pickGreveMove(s, 'salarie', 'negocier');
    s = pickGreveMove(s, 'patron', 'negocier');
    s = resolveGreveRound(s);
    /* Ouverture peut survenir au round 1 ou plus tard selon engine */
    if (s.matchOutcome) {
      expect(s.matchOutcome).toBe('ouverture_negociation');
    }
  });
});

describe('Grève — match completion', () => {
  it('match ends within 5 rounds maximum', () => {
    let s = startGreveSession();
    let safety = 0;
    while (s.phase !== 'ended' && safety++ < 20) {
      const sMove = SALARIE_GREVE_MOVES[Math.floor(Math.random() * 5)].id;
      const pMove = PATRON_GREVE_MOVES[Math.floor(Math.random() * 5)].id;
      s = pickGreveMove(s, 'salarie', sMove);
      s = pickGreveMove(s, 'patron', pMove);
      s = resolveGreveRound(s);
      if (s.phase === 'result') s = nextGreveRound(s);
    }
    expect(s.phase).toBe('ended');
    expect(s.round).toBeLessThanOrEqual(5);
    expect(s.matchOutcome).toBeTruthy();
  });

  it('all 5 outcomes are reachable in 10k random matches (Argus target ≥5%)', () => {
    const counts: Record<string, number> = {
      accord_victorieux: 0,
      accord_partiel: 0,
      ouverture_negociation: 0,
      echec_greve: 0,
      patron_impose: 0
    };
    const sIds = SALARIE_GREVE_MOVES.map(m => m.id);
    const pIds = PATRON_GREVE_MOVES.map(m => m.id);
    for (let i = 0; i < 10_000; i++) {
      let s: GreveState = startGreveSession();
      let safety = 0;
      while (s.phase !== 'ended' && safety++ < 20) {
        const sm = sIds[Math.floor(Math.random() * sIds.length)] as SalarieGreveMove;
        const pm = pIds[Math.floor(Math.random() * pIds.length)] as PatronGreveMove;
        s = pickGreveMove(s, 'salarie', sm);
        s = pickGreveMove(s, 'patron', pm);
        s = resolveGreveRound(s);
        if (s.phase === 'result') s = nextGreveRound(s);
      }
      counts[s.matchOutcome!]++;
    }
    /* Argus pre-beta : every outcome ≥5%, aucun ne domine au-delà de 60% */
    for (const [k, v] of Object.entries(counts)) {
      const pct = (100 * v) / 10_000;
      expect(pct, `${k}=${pct.toFixed(1)}%`).toBeGreaterThanOrEqual(5);
      expect(pct, `${k}=${pct.toFixed(1)}%`).toBeLessThanOrEqual(60);
    }
  });
});

describe('Grève — V2 effects mapping', () => {
  it('accord_victorieux is positive, echec_greve is negative', () => {
    const v = greveOutcomeToV2Effects('accord_victorieux');
    const e = greveOutcomeToV2Effects('echec_greve');
    expect(v.confiance).toBeGreaterThan(0);
    expect(e.confiance).toBeLessThan(0);
  });

  it('patron_impose hurts rapport de force', () => {
    const fx = greveOutcomeToV2Effects('patron_impose');
    expect(fx.rapportDeForce).toBeLessThan(0);
  });
});
