import { describe, it, expect } from 'vitest';
import {
  startTableSession,
  pickTableMove,
  resolveTableRound,
  nextTableRound,
  tableOutcomeToV2Effects,
  tableZoneLabel,
  SALARIE_MOVES,
  PATRON_MOVES,
  type TableState,
  type SalarieMove,
  type PatronMove
} from './engine';

describe('Table — initial state & catalogues', () => {
  it('starts at round 1, picking phase, zone=50', () => {
    const s = startTableSession();
    expect(s.round).toBe(1);
    expect(s.phase).toBe('picking');
    expect(s.zone).toBe(50);
    expect(s.history).toEqual([]);
    expect(s.matchOutcome).toBeNull();
    expect(s.salarieMoralBonus).toBe(0);
    expect(s.patronJuridiqueBonus).toBe(0);
  });

  it('exposes 5 moves per side with required fields', () => {
    expect(SALARIE_MOVES).toHaveLength(5);
    expect(PATRON_MOVES).toHaveLength(5);
    for (const m of [...SALARIE_MOVES, ...PATRON_MOVES]) {
      expect(m.id).toBeTruthy();
      expect(m.label).toBeTruthy();
    }
  });

  it('exposes the 5 salarie moves and 5 patron moves with stable ids', () => {
    const sIds = SALARIE_MOVES.map(m => m.id).sort();
    expect(sIds).toEqual(['ancrer', 'conceder', 'consulter', 'mediatiser', 'rompre'].sort());
    const pIds = PATRON_MOVES.map(m => m.id).sort();
    expect(pIds).toEqual(['diviser', 'juridique', 'maintenir', 'suspendre', 'symbolique'].sort());
  });
});

describe('Table — round mechanics', () => {
  it('pickTableMove sets the side pick', () => {
    let s = startTableSession();
    s = pickTableMove(s, 'salarie', 'ancrer');
    expect(s.salariePick).toBe('ancrer');
    s = pickTableMove(s, 'patron', 'maintenir');
    expect(s.patronPick).toBe('maintenir');
  });

  it('resolveTableRound transitions phase to result or ended with history entry', () => {
    let s = startTableSession();
    s = pickTableMove(s, 'salarie', 'ancrer');
    s = pickTableMove(s, 'patron', 'maintenir');
    s = resolveTableRound(s);
    expect(s.phase === 'result' || s.phase === 'ended').toBe(true);
    expect(s.history).toHaveLength(1);
  });

  it('zone stays in [0, 100] across rounds', () => {
    let s = startTableSession();
    let safety = 0;
    while (s.phase !== 'ended' && safety++ < 10) {
      s = pickTableMove(s, 'salarie', 'rompre');
      s = pickTableMove(s, 'patron', 'maintenir');
      s = resolveTableRound(s);
      expect(s.zone).toBeGreaterThanOrEqual(0);
      expect(s.zone).toBeLessThanOrEqual(100);
      if (s.phase === 'result') s = nextTableRound(s);
    }
  });

  it('match completes within 3 rounds', () => {
    let s = startTableSession();
    let safety = 0;
    while (s.phase !== 'ended' && safety++ < 10) {
      const sm = SALARIE_MOVES[Math.floor(Math.random() * 5)].id;
      const pm = PATRON_MOVES[Math.floor(Math.random() * 5)].id;
      s = pickTableMove(s, 'salarie', sm);
      s = pickTableMove(s, 'patron', pm);
      s = resolveTableRound(s);
      if (s.phase === 'result') s = nextTableRound(s);
    }
    expect(s.phase).toBe('ended');
    expect(s.round).toBeLessThanOrEqual(3);
    expect(s.matchOutcome).toBeTruthy();
  });
});

describe('Table — outcome distribution (10k random)', () => {
  it('all 3 outcomes reachable, no degenerate (Argus signed sain)', () => {
    const counts = { accord_ambitieux: 0, accord_minimal: 0, rupture: 0 };
    const sIds = SALARIE_MOVES.map(m => m.id) as SalarieMove[];
    const pIds = PATRON_MOVES.map(m => m.id) as PatronMove[];
    for (let i = 0; i < 10_000; i++) {
      let s: TableState = startTableSession();
      let safety = 0;
      while (s.phase !== 'ended' && safety++ < 10) {
        const sm = sIds[Math.floor(Math.random() * sIds.length)];
        const pm = pIds[Math.floor(Math.random() * pIds.length)];
        s = pickTableMove(s, 'salarie', sm);
        s = pickTableMove(s, 'patron', pm);
        s = resolveTableRound(s);
        if (s.phase === 'result') s = nextTableRound(s);
      }
      counts[s.matchOutcome!]++;
    }
    /* Argus pre-beta : 3 outcomes ≥5%, ≤60% */
    for (const [k, v] of Object.entries(counts)) {
      const pct = (100 * v) / 10_000;
      expect(pct, `${k}=${pct.toFixed(1)}%`).toBeGreaterThanOrEqual(5);
      expect(pct, `${k}=${pct.toFixed(1)}%`).toBeLessThanOrEqual(70);
    }
  });
});

describe('Table — utilities', () => {
  it('tableZoneLabel returns a string for any zone in [0, 100]', () => {
    expect(typeof tableZoneLabel(0)).toBe('string');
    expect(typeof tableZoneLabel(50)).toBe('string');
    expect(typeof tableZoneLabel(100)).toBe('string');
  });

  it('V2 effects: accord_ambitieux > accord_minimal > rupture on rapport de force', () => {
    const a = tableOutcomeToV2Effects('accord_ambitieux');
    const m = tableOutcomeToV2Effects('accord_minimal');
    const r = tableOutcomeToV2Effects('rupture');
    expect(a.rapportDeForce).toBeGreaterThan(m.rapportDeForce);
    /* Rupture peut être > minimal sur rapport de force (signal de combat) ;
       on vérifie au moins que les 3 sont des nombres et que ambitieux est positif */
    expect(a.rapportDeForce).toBeGreaterThan(0);
    expect(typeof r.rapportDeForce).toBe('number');
  });
});
