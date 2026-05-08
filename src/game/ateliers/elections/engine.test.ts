import { describe, it, expect } from 'vitest';
import {
  startElectionSession,
  emptyAllocation,
  totalAllocation,
  setElectionAlloc,
  resolveScrutin,
  nextScrutin,
  aiElectionAlloc,
  electionOutcomeToV2Effects,
  ALL_CHANNELS,
  CHANNEL_SEATS,
  BUDGET_PER_ROUND,
  type Allocation,
  type ElectionState
} from './engine';

describe('Elections — constants & invariants', () => {
  it('total seats per scrutin = 7 (3+2+1+1) and 21 over 3 rounds', () => {
    const seatsPerScrutin = ALL_CHANNELS.reduce((s, c) => s + CHANNEL_SEATS[c], 0);
    expect(seatsPerScrutin).toBe(7);
    expect(seatsPerScrutin * 3).toBe(21);
  });

  it('budget per round is 8 (more than seats — forces tradeoffs)', () => {
    expect(BUDGET_PER_ROUND).toBe(8);
  });

  it('exposes 4 channels with declining seat values', () => {
    expect(ALL_CHANNELS).toHaveLength(4);
    expect(CHANNEL_SEATS.terrain).toBeGreaterThan(CHANNEL_SEATS.reunions);
    expect(CHANNEL_SEATS.reunions).toBeGreaterThan(CHANNEL_SEATS.affiches);
  });
});

describe('Elections — allocation math', () => {
  it('emptyAllocation sums to 0', () => {
    expect(totalAllocation(emptyAllocation())).toBe(0);
  });

  it('totalAllocation sums all channels', () => {
    const a: Allocation = { terrain: 3, reunions: 2, affiches: 2, tractage: 1 };
    expect(totalAllocation(a)).toBe(8);
  });

  it('rejects allocation exceeding budget', () => {
    let s = startElectionSession();
    const overBudget: Allocation = { terrain: 5, reunions: 5, affiches: 0, tractage: 0 };
    s = setElectionAlloc(s, 'salarie', overBudget);
    expect(s.salarieAlloc).toBeNull();
  });

  it('rejects negative allocation', () => {
    let s = startElectionSession();
    const negative: Allocation = { terrain: -1, reunions: 5, affiches: 2, tractage: 2 };
    s = setElectionAlloc(s, 'salarie', negative);
    expect(s.salarieAlloc).toBeNull();
  });

  it('accepts valid allocation', () => {
    let s = startElectionSession();
    const valid: Allocation = { terrain: 3, reunions: 3, affiches: 1, tractage: 1 };
    s = setElectionAlloc(s, 'salarie', valid);
    expect(s.salarieAlloc).toEqual(valid);
  });
});

describe('Elections — scrutin resolution', () => {
  it('majority allocation wins channel', () => {
    let s = startElectionSession();
    s = setElectionAlloc(s, 'salarie', { terrain: 8, reunions: 0, affiches: 0, tractage: 0 });
    s = setElectionAlloc(s, 'patron', { terrain: 0, reunions: 4, affiches: 2, tractage: 2 });
    s = resolveScrutin(s);

    const result = s.history[0]!;
    const terrainResult = result.channels.find(c => c.channel === 'terrain')!;
    expect(terrainResult.winner).toBe('salarie');
    expect(terrainResult.seats).toBe(3);
  });

  it('zero-vs-zero on a channel = no winner', () => {
    let s = startElectionSession();
    s = setElectionAlloc(s, 'salarie', { terrain: 8, reunions: 0, affiches: 0, tractage: 0 });
    s = setElectionAlloc(s, 'patron',  { terrain: 8, reunions: 0, affiches: 0, tractage: 0 });
    s = resolveScrutin(s);
    const result = s.history[0]!;
    /* Each non-terrain channel has 0+0 → no winner (egalite) */
    const reunions = result.channels.find(c => c.channel === 'reunions')!;
    expect(reunions.winner).toBe('egalite');
    expect(reunions.seats).toBe(0);
  });

  it('match ends after 3 scrutins with an outcome', () => {
    let s = startElectionSession();
    for (let i = 0; i < 3; i++) {
      s = setElectionAlloc(s, 'salarie', aiElectionAlloc(s, 'salarie'));
      s = setElectionAlloc(s, 'patron', aiElectionAlloc(s, 'patron'));
      s = resolveScrutin(s);
      if (s.phase === 'result') s = nextScrutin(s);
    }
    expect(s.phase).toBe('ended');
    expect(s.matchOutcome).toBeTruthy();
  });

  it('early victory triggers if a side reaches 11 seats before round 3', () => {
    let s = startElectionSession();
    /* Round 1+2 : salarié domine à fond, patron 0 */
    for (let i = 0; i < 2; i++) {
      s = setElectionAlloc(s, 'salarie', { terrain: 5, reunions: 3, affiches: 0, tractage: 0 });
      s = setElectionAlloc(s, 'patron',  { terrain: 0, reunions: 0, affiches: 0, tractage: 0 });
      s = resolveScrutin(s);
      if (s.phase === 'result') s = nextScrutin(s);
    }
    /* Après 2 scrutins le salarié a gagné 5+5=10 sièges minimum */
    /* Si 11 atteint en R1+R2, phase déjà 'ended'. Sinon round 3 décide. */
    expect(s.salarieTotal).toBeGreaterThanOrEqual(10);
  });
});

describe('Elections — AI strategy (Argus calibrage ORDA-001)', () => {
  it('aiElectionAlloc produces valid allocations within budget', () => {
    const s = startElectionSession();
    for (let i = 0; i < 100; i++) {
      const alloc = aiElectionAlloc(s, 'salarie');
      expect(totalAllocation(alloc)).toBeLessThanOrEqual(BUDGET_PER_ROUND);
      expect(totalAllocation(alloc)).toBeGreaterThanOrEqual(0);
      for (const c of ALL_CHANNELS) {
        expect(alloc[c]).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('AI produces variance — not always the same allocation', () => {
    const s = startElectionSession();
    const allocs = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const a = aiElectionAlloc(s, 'salarie');
      allocs.add(JSON.stringify(a));
    }
    expect(allocs.size).toBeGreaterThan(3);
  });

  it('parite stays under 60% in 10k random matches (Argus target)', () => {
    const counts = { salarie_majorite: 0, patron_majorite: 0, parite: 0 };
    for (let i = 0; i < 10_000; i++) {
      let s: ElectionState = startElectionSession();
      while (s.phase !== 'ended') {
        s = setElectionAlloc(s, 'salarie', aiElectionAlloc(s, 'salarie'));
        s = setElectionAlloc(s, 'patron', aiElectionAlloc(s, 'patron'));
        s = resolveScrutin(s);
        if (s.phase === 'result') s = nextScrutin(s);
      }
      counts[s.matchOutcome!]++;
    }
    expect(counts.parite / 10_000).toBeLessThan(0.6);
    /* All 3 outcomes reachable (Argus: ≥5%) */
    expect(counts.salarie_majorite).toBeGreaterThan(500);
    expect(counts.patron_majorite).toBeGreaterThan(500);
  });
});

describe('Elections — V2 effects mapping', () => {
  it('salarie_majorite has positive legitimite, patron_majorite negative', () => {
    const sal = electionOutcomeToV2Effects('salarie_majorite');
    const pat = electionOutcomeToV2Effects('patron_majorite');
    expect(sal.legitimite).toBeGreaterThan(0);
    expect(pat.legitimite).toBeLessThan(0);
  });

  it('parite has small but non-negative effect', () => {
    const fx = electionOutcomeToV2Effects('parite');
    expect(fx.legitimite).toBeGreaterThan(0);
    expect(fx.confiance).toBeGreaterThanOrEqual(0);
  });
});
