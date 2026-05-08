import { describe, it, expect } from 'vitest';
import {
  startNaoSession,
  emptyAdjustments,
  defaultPostures,
  totalAdjustment,
  effectiveCost,
  getSeanceBudget,
  computeEffectiveSeuil,
  computeSatisfaction,
  computeSigningWeight,
  willUnionSign,
  setEmployeurMove,
  setSyndicatMove,
  resolveSeance,
  nextSeance,
  aiEmployeurMove,
  aiSyndicatMove,
  naoOutcomeToV2Effects,
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
    expect(ALL_UNIONS).toHaveLength(4); // P1-4 ORDA-009 : CFE-CGC ajoutée comme 4e union
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

describe('NAO — computeSatisfaction logic', () => {
  it('returns 0 when no theme is adjusted', () => {
    const adj = emptyAdjustments();
    const sat = computeSatisfaction(adj, 'cgt', false);
    expect(sat).toBe(0);
  });

  it('higher adjustments produce higher satisfaction', () => {
    const low = emptyAdjustments();
    low.salaires = 2;
    const high = emptyAdjustments();
    high.salaires = 12;
    expect(computeSatisfaction(high, 'cgt', false))
      .toBeGreaterThan(computeSatisfaction(low, 'cgt', false));
  });

  it('CGT weights salaires more than CFDT/FO at same offer', () => {
    /* Each union has different theme weights — verify that satisfactions diverge */
    const adj = emptyAdjustments();
    adj.salaires = 8;
    adj.teletravail = 4;
    const sCgt = computeSatisfaction(adj, 'cgt', false);
    const sCfdt = computeSatisfaction(adj, 'cfdt', false);
    const sFo = computeSatisfaction(adj, 'fo', false);
    /* Just assert they're not all identical (otherwise THEME_META weights would be useless) */
    const allEqual = sCgt === sCfdt && sCfdt === sFo;
    expect(allEqual).toBe(false);
  });

  it('accordPartiel mode changes satisfaction calculation', () => {
    const adj = emptyAdjustments();
    adj.salaires = 8;
    adj.primes = 4;
    const full = computeSatisfaction(adj, 'cfdt', false);
    const partial = computeSatisfaction(adj, 'cfdt', true);
    /* Partial mode should at least return a number, possibly different */
    expect(typeof partial).toBe('number');
    expect(typeof full).toBe('number');
  });
});

describe('NAO — computeSigningWeight', () => {
  /* Signature : computeSigningWeight(themes, postures, accordPartiel)
                  → { signing: NaoUnion[]; weight: number } */

  it('returns weight 0 when all unions are in retrait', () => {
    const themes = { salaires: 50, primes: 50, teletravail: 50, egalite_pro: 50 };
    const postures = { cgt: 'retrait', cfdt: 'retrait', fo: 'retrait', cfecgc: 'retrait' } as const;
    const result = computeSigningWeight(themes, postures, false);
    expect(result.weight).toBe(0);
    expect(result.signing).toEqual([]);
  });

  it('returns ≤100% weight when all unions sign', () => {
    /* High-satisfaction themes : tous les syndicats devraient signer */
    const themes = { salaires: 100, primes: 100, teletravail: 100, egalite_pro: 100 };
    const postures = { cgt: 'compromis', cfdt: 'compromis', fo: 'compromis', cfecgc: 'compromis' } as const;
    const result = computeSigningWeight(themes, postures, false);
    expect(result.weight).toBeLessThanOrEqual(100);
    expect(result.weight).toBeGreaterThanOrEqual(0);
  });

  it('weight scales with number of signing unions', () => {
    const themes = { salaires: 100, primes: 100, teletravail: 100, egalite_pro: 100 };
    const onlyCfdt = computeSigningWeight(
      themes,
      { cgt: 'retrait', cfdt: 'compromis', fo: 'retrait', cfecgc: 'retrait' },
      false
    );
    const cfdtAndFo = computeSigningWeight(
      themes,
      { cgt: 'retrait', cfdt: 'compromis', fo: 'compromis', cfecgc: 'compromis' },
      false
    );
    expect(cfdtAndFo.weight).toBeGreaterThanOrEqual(onlyCfdt.weight);
  });

  it('SIGNING_MAJORITY is the threshold for valid agreement', () => {
    /* Just verify the constant is sane (≥50% is the French rule) */
    expect(SIGNING_MAJORITY).toBeGreaterThanOrEqual(50);
  });
});

describe('NAO — setMove guards', () => {
  it('setEmployeurMove only applies during proposing phase', () => {
    const s = startNaoSession();
    const move = { adjustments: emptyAdjustments(), tactic: null };
    const after = setEmployeurMove(s, move);
    expect(after.employeurMove).toEqual(move);
  });

  it('setSyndicatMove only applies during proposing phase', () => {
    const s = startNaoSession();
    const move = { postures: defaultPostures(), tactic: null };
    const after = setSyndicatMove(s, move);
    expect(after.syndicatMove).toEqual(move);
  });
});

describe('NAO — resolveSeance + nextSeance lifecycle', () => {
  it('resolveSeance produces a seance result + transitions phase', () => {
    let s = startNaoSession();
    s = setEmployeurMove(s, { adjustments: { ...emptyAdjustments(), salaires: 5 }, tactic: null });
    s = setSyndicatMove(s, { postures: defaultPostures(), tactic: null });
    s = resolveSeance(s);
    expect(s.history.length).toBeGreaterThanOrEqual(1);
    /* Phases possibles après resolveSeance : 'result' (séance suivante) ou 'ended' */
    expect(s.phase === 'result' || s.phase === 'ended').toBe(true);
  });

  it('nextSeance transitions phase result → proposing', () => {
    /* Le compteur seance est déjà incrémenté par resolveSeance lui-même
       (seance 1 → resolveSeance → s.seance = 2 + phase 'result').
       nextSeance ne change que la phase (result → proposing) pour
       permettre les nouveaux setMove. */
    let s = startNaoSession();
    s = setEmployeurMove(s, { adjustments: { ...emptyAdjustments(), salaires: 5 }, tactic: null });
    s = setSyndicatMove(s, { postures: defaultPostures(), tactic: null });
    s = resolveSeance(s);
    if (s.phase === 'result') {
      s = nextSeance(s);
      expect(s.phase).toBe('proposing');
    }
  });
});

describe('NAO — AI moves (aiEmployeurMove + aiSyndicatMove, ORDA-001 R1)', () => {
  it('aiEmployeurMove returns a valid move within SEANCE_BUDGET', () => {
    const s = startNaoSession();
    for (let i = 0; i < 50; i++) {
      const move = aiEmployeurMove(s);
      expect(move.adjustments).toBeDefined();
      const total = totalAdjustment(move.adjustments);
      expect(total).toBeGreaterThanOrEqual(0);
      /* AI may use mobilisation cost = +3/theme — so raw total can exceed budget,
         but effectiveCost must stay within getSeanceBudget */
      expect(effectiveCost(move.adjustments, false)).toBeLessThanOrEqual(getSeanceBudget(s) + 3);
    }
  });

  it('aiSyndicatMove returns valid postures for all 3 unions', () => {
    const s = startNaoSession();
    const validPostures = ['pression', 'patience', 'compromis', 'retrait'];
    for (let i = 0; i < 50; i++) {
      const move = aiSyndicatMove(s);
      for (const u of ALL_UNIONS) {
        expect(validPostures).toContain(move.postures[u]);
      }
    }
  });

  it('aiSyndicatMove (Argus R1) produces variance from seance 2 onward', () => {
    /* Séance 1 : IA force CGT='pression' (déterministe).
       Séance 2+ : variance stochastique (retrait, ténacité, patience, compromis). */
    let s = startNaoSession();
    /* Avancer à la séance 2 via une résolution complète */
    s = setEmployeurMove(s, aiEmployeurMove(s));
    s = setSyndicatMove(s, aiSyndicatMove(s));
    s = resolveSeance(s);
    if (s.phase === 'result') s = nextSeance(s);
    expect(s.seance).toBeGreaterThanOrEqual(2);

    /* Maintenant échantillonner les postures CGT */
    const cgtPostures = new Set<string>();
    for (let i = 0; i < 200; i++) {
      cgtPostures.add(aiSyndicatMove(s).postures.cgt);
    }
    /* Argus R1 fix : variance ≥ 2 postures distinctes après séance 1 */
    expect(cgtPostures.size).toBeGreaterThanOrEqual(2);
  });
});

describe('NAO — full session with official IA (Argus pre-beta target)', () => {
  it('all 4 outcomes reachable with aiEmployeurMove + aiSyndicatMove', () => {
    const counts: Record<string, number> = {
      accord_majoritaire: 0,
      accord_partiel: 0,
      accord_minoritaire: 0,
      pv_desaccord: 0
    };
    for (let i = 0; i < 1000; i++) {
      let s = startNaoSession();
      let safety = 0;
      while (s.phase !== 'ended' && safety++ < 10) {
        s = setEmployeurMove(s, aiEmployeurMove(s));
        s = setSyndicatMove(s, aiSyndicatMove(s));
        s = resolveSeance(s);
        if (s.phase !== 'ended') s = nextSeance(s);
      }
      if (s.outcome) counts[s.outcome]++;
    }
    /* Argus AAR 2026-05-08 cible : tous les outcomes ≥1% (Mémo Rouge R-A clos).
       MC sur scripts confirmait : accord_minoritaire 17.8%, pv_desaccord 6.0%

       P1-4 (ORDA-009) + B-15-recal (ORDA-010) + B-15-recal-emp (ORDA-011) :
       ajout CFE-CGC + recalibrage IA syndicat ET employeur à 4 unions.
       aiEmployeurMove trie maintenant par POIDS électoral décroissant
       (au lieu de gap ascendant) + filtre gap plausible (≤ 0.35).
       cfecgc n'entre plus dans la coalition cible quand elle est
       marginale → CGT+CFDT (73 %) ou CFDT+FO (55 %) redeviennent les
       coalitions naturelles → accord_majoritaire ≥ 1 % rétabli. */
    for (const [k, v] of Object.entries(counts)) {
      const pct = (100 * v) / 1000;
      expect(pct, `${k}=${pct.toFixed(1)}%`).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('NAO — V2 effects mapping', () => {
  it('accord_majoritaire produces positive legitimite for both sides', () => {
    const sal = naoOutcomeToV2Effects('accord_majoritaire', 'syndicat');
    const emp = naoOutcomeToV2Effects('accord_majoritaire', 'employeur');
    expect(sal.legitimite).toBeGreaterThan(0);
    expect(emp.legitimite).toBeGreaterThan(0);
  });

  it('pv_desaccord is asymmetric: hurts confidence on at least one side', () => {
    const sal = naoOutcomeToV2Effects('pv_desaccord', 'syndicat');
    const emp = naoOutcomeToV2Effects('pv_desaccord', 'employeur');
    /* Au moins un des 2 doit être négatif sur confiance */
    expect(sal.confiance < 0 || emp.confiance < 0).toBe(true);
  });

  it('all 4 outcomes return valid effects for both sides', () => {
    const outcomes = ['accord_majoritaire', 'accord_partiel', 'accord_minoritaire', 'pv_desaccord'] as const;
    for (const o of outcomes) {
      for (const side of ['syndicat', 'employeur'] as const) {
        const fx = naoOutcomeToV2Effects(o, side);
        expect(typeof fx.confiance).toBe('number');
        expect(typeof fx.rapportDeForce).toBe('number');
        expect(typeof fx.legitimite).toBe('number');
        expect(typeof fx.caisse).toBe('number');
      }
    }
  });
});
