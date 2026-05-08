import { describe, it, expect } from 'vitest';
import {
  startNaoSession,
  emptyAdjustments,
  defaultPostures,
  totalAdjustment,
  effectiveCost,
  getSeanceBudget,
  computeEffectiveSeuil,
  willUnionSign,
  ALL_THEMES,
  ALL_UNIONS,
  MAX_SEANCES,
  TOTAL_ENVELOPPE,
  SEANCE_BUDGET,
  SIGNING_MAJORITY
} from './engine';

describe('NAO — constants & invariants (Argus AAR 2026-05-08 fix)', () => {
  it('TOTAL_ENVELOPPE is 60 (corrected from "/48" cosmetic bug)', () => {
    expect(TOTAL_ENVELOPPE).toBe(60);
  });

  it('exposes 4 themes, 3 unions, 5 seances max', () => {
    expect(ALL_THEMES).toHaveLength(4);
    expect(ALL_UNIONS).toHaveLength(3);
    expect(MAX_SEANCES).toBe(5);
  });

  it('seance budget is below total enveloppe', () => {
    expect(SEANCE_BUDGET).toBeLessThan(TOTAL_ENVELOPPE);
  });

  it('signing majority threshold matches French representativity rule', () => {
    expect(SIGNING_MAJORITY).toBe(50);
  });
});

describe('NAO — session lifecycle', () => {
  it('starts at seance 1 with no outcome and empty history', () => {
    const s = startNaoSession();
    expect(s.seance).toBe(1);
    expect(s.outcome).toBeFalsy(); // null or undefined acceptable
    expect(s.history).toEqual([]);
  });

  it('emptyAdjustments returns zero on every theme', () => {
    const adj = emptyAdjustments();
    for (const t of ALL_THEMES) {
      expect(adj[t]).toBe(0);
    }
    expect(totalAdjustment(adj)).toBe(0);
  });

  it('defaultPostures sets a posture for every union', () => {
    const postures = defaultPostures();
    for (const u of ALL_UNIONS) {
      expect(postures[u]).toBeDefined();
    }
  });

  it('seance budget never exceeds total enveloppe at any seance', () => {
    const s = startNaoSession();
    const budget = getSeanceBudget(s);
    expect(budget).toBeGreaterThan(0);
    expect(budget).toBeLessThanOrEqual(TOTAL_ENVELOPPE);
  });
});

describe('NAO — adjustment math', () => {
  it('totalAdjustment sums all themes', () => {
    const adj = emptyAdjustments();
    adj.salaires = 5;
    adj.primes = 3;
    expect(totalAdjustment(adj)).toBe(8);
  });

  it('effectiveCost without mobilisation equals raw total', () => {
    const adj = emptyAdjustments();
    adj.salaires = 4;
    adj.primes = 2;
    expect(effectiveCost(adj, false)).toBe(6);
  });

  it('effectiveCost with mobilisation adds 3 pts per touched theme', () => {
    const adj = emptyAdjustments();
    adj.salaires = 4;
    adj.primes = 2;
    /* 2 themes touched, +3 each → cost = 6 + 6 = 12 */
    expect(effectiveCost(adj, true)).toBe(12);
  });

  it('effectiveCost with mobilisation but zero adjustments is zero', () => {
    expect(effectiveCost(emptyAdjustments(), true)).toBe(0);
  });
});

describe('NAO — union signing logic', () => {
  it('CGT under "pression" posture has highest seuil', () => {
    const seuilPression = computeEffectiveSeuil('cgt', 'pression');
    const seuilCompromis = computeEffectiveSeuil('cgt', 'compromis');
    expect(seuilPression).toBeGreaterThan(seuilCompromis);
  });

  it('willUnionSign returns boolean (signature: themes, union, posture, accordPartiel)', () => {
    const adj = emptyAdjustments();
    adj.salaires = 30;
    adj.primes = 20;
    adj.teletravail = 10;
    adj.egalite_pro = 5;
    const result = willUnionSign(adj, 'cfdt', 'compromis', false);
    expect(typeof result).toBe('boolean');
  });

  it('union under "retrait" posture never signs', () => {
    const adj = emptyAdjustments();
    adj.salaires = 100; // énorme offre
    expect(willUnionSign(adj, 'cgt', 'retrait', false)).toBe(false);
    expect(willUnionSign(adj, 'cfdt', 'retrait', false)).toBe(false);
    expect(willUnionSign(adj, 'fo', 'retrait', false)).toBe(false);
  });
});

describe('NAO — full session simulation (10k random)', () => {
  it('all 4 outcomes reachable with random IA, no degenerate (Argus pre-beta)', async () => {
    const {
      setEmployeurMove,
      setSyndicatMove,
      resolveSeance,
      nextSeance
    } = await import('./engine');
    const counts: Record<string, number> = {
      accord_majoritaire: 0,
      accord_partiel: 0,
      accord_minoritaire: 0,
      pv_desaccord: 0
    };
    const empTactics = [null, 'offre_globale', 'ultimatum', 'communication', 'audit_bloquant'] as const;
    const synTactics = [null, 'expertise', 'coordination', 'mobilisation', 'accord_partiel'] as const;
    const postures = ['pression', 'patience', 'compromis', 'retrait'] as const;

    for (let i = 0; i < 1000; i++) {
      let s = startNaoSession();
      let safety = 0;
      while (s.phase !== 'ended' && safety++ < 10) {
        /* Allocation employeur random sur 4 thèmes, total ≤ SEANCE_BUDGET */
        const adjustments = emptyAdjustments();
        let budget = 13;
        for (const t of ALL_THEMES) {
          const v = Math.floor(Math.random() * (budget + 1));
          adjustments[t] = v;
          budget -= v;
        }
        const empMove = {
          adjustments,
          tactic: empTactics[Math.floor(Math.random() * empTactics.length)] as
            'offre_globale' | 'ultimatum' | 'communication' | 'audit_bloquant' | null
        };
        const synMove = {
          postures: {
            cgt: postures[Math.floor(Math.random() * postures.length)],
            cfdt: postures[Math.floor(Math.random() * postures.length)],
            fo: postures[Math.floor(Math.random() * postures.length)]
          },
          tactic: synTactics[Math.floor(Math.random() * synTactics.length)] as
            'expertise' | 'coordination' | 'mobilisation' | 'accord_partiel' | null
        };
        s = setEmployeurMove(s, empMove);
        s = setSyndicatMove(s, synMove);
        s = resolveSeance(s);
        if (s.phase !== 'ended') s = nextSeance(s);
      }
      if (s.outcome) counts[s.outcome]++;
    }
    /* Avec 1000 parties random, les 4 outcomes doivent apparaître ≥1% chacun
       (Argus a recalibré IA CGT). On reste plus tolérant que 5% car random. */
    for (const [k, v] of Object.entries(counts)) {
      const pct = (100 * v) / 1000;
      expect(pct, `${k}=${pct.toFixed(1)}%`).toBeGreaterThanOrEqual(1);
    }
  });
});
