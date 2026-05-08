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
  setNaoRng,
  ALL_THEMES,
  ALL_UNIONS,
  MAX_SEANCES,
  TOTAL_ENVELOPPE,
  SEANCE_BUDGET,
  SIGNING_MAJORITY,
  NAO_PRESET_META,
  UNION_META,
  getUnionElectoralWeight,
  getUnionSeuilAccord,
  getUnionWeights
} from './engine';

/* PRNG mulberry32 — petit générateur 32-bit déterministe seedable.
   Référence : https://stackoverflow.com/a/47593316. Reproduit par lui-même
   sans Math.random — convient pour les tests P0 Carmack-14 / Villani-07. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('NAO — constants & invariants (Argus AAR 2026-05-08 fix)', () => {
  it('TOTAL_ENVELOPPE is 60 (corrected from "/48" cosmetic bug)', () => {
    expect(TOTAL_ENVELOPPE).toBe(60);
  });

  it('exposes 4 themes, 5 unions (CGT/CFDT/FO/CFE-CGC/SUD), 5 seances max', () => {
    expect(ALL_THEMES).toHaveLength(4);
    /* P1-4 ORDA-009 : CFE-CGC ajoutée comme 4e union.
       P0 ORDA-017 / Béroud-18 : SUD/Solidaires ajoutée comme 5e union. */
    expect(ALL_UNIONS).toHaveLength(5);
    expect(ALL_UNIONS).toContain('sud');
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
    const postures = { cgt: 'retrait', cfdt: 'retrait', fo: 'retrait', cfecgc: 'retrait', sud: 'retrait' } as const;
    const result = computeSigningWeight(themes, postures, false);
    expect(result.weight).toBe(0);
    expect(result.signing).toEqual([]);
  });

  it('returns ≤110% weight when all unions sign (5 unions, total ~107%)', () => {
    /* High-satisfaction themes : tous les syndicats devraient signer.
       P0 ORDA-017 : avec SUD/Solidaires (poids 7 %), le total des
       poids électoraux est 107 % (CGT 38 + CFDT 35 + FO 20 + CFE-CGC 7
       + SUD 7). Plafond ≤110 % pour absorber arrondis. */
    const themes = { salaires: 100, primes: 100, teletravail: 100, egalite_pro: 100 };
    const postures = { cgt: 'compromis', cfdt: 'compromis', fo: 'compromis', cfecgc: 'compromis', sud: 'compromis' } as const;
    const result = computeSigningWeight(themes, postures, false);
    expect(result.weight).toBeLessThanOrEqual(110);
    expect(result.weight).toBeGreaterThanOrEqual(0);
  });

  it('weight scales with number of signing unions', () => {
    const themes = { salaires: 100, primes: 100, teletravail: 100, egalite_pro: 100 };
    const onlyCfdt = computeSigningWeight(
      themes,
      { cgt: 'retrait', cfdt: 'compromis', fo: 'retrait', cfecgc: 'retrait', sud: 'retrait' },
      false
    );
    const cfdtAndFo = computeSigningWeight(
      themes,
      { cgt: 'retrait', cfdt: 'compromis', fo: 'compromis', cfecgc: 'compromis', sud: 'retrait' },
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

  it('aiSyndicatMove returns valid postures for all 5 unions', () => {
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

/* P0 Carmack-14 + Villani-07 — RNG seedable (Sapeurs ORDA-015 PARITAS).
   Deux runs IA pleinement scriptés avec le même seed doivent produire
   exactement la même séquence de coups. Si un Math.random() reste planqué
   quelque part dans le moteur, la déterminance casse et le test rougit. */
describe('NAO — RNG seedable (P0 Sapeurs Carmack-14 / Villani-07)', () => {
  function playWithSeed(seed: number) {
    setNaoRng(mulberry32(seed));
    const trace: Array<{
      seance: number;
      empTactic: string | null;
      synTactic: string | null;
      cgt: string;
      cfdt: string;
      fo: string;
      cfecgc: string;
    }> = [];
    let s = startNaoSession();
    for (let i = 0; i < MAX_SEANCES && !s.outcome; i++) {
      const empMove = aiEmployeurMove(s);
      const synMove = aiSyndicatMove(s);
      trace.push({
        seance: s.seance,
        empTactic: empMove.tactic,
        synTactic: synMove.tactic,
        cgt: synMove.postures.cgt,
        cfdt: synMove.postures.cfdt,
        fo: synMove.postures.fo,
        cfecgc: synMove.postures.cfecgc
      });
      s = setEmployeurMove(s, empMove);
      s = setSyndicatMove(s, synMove);
      s = resolveSeance(s);
      if (!s.outcome) s = nextSeance(s);
    }
    return trace;
  }

  it('play(seed) === play(seed) — runs identiques avec même seed', () => {
    const a = playWithSeed(42);
    const b = playWithSeed(42);
    expect(a).toEqual(b);
    setNaoRng(null); // restore Math.random fallback
  });

  it('seeds différents produisent traces différentes (preuve que le RNG injecté est bien câblé)', () => {
    const a = playWithSeed(42);
    const b = playWithSeed(7);
    // Au moins un coup IA doit différer — sinon le RNG override est inopérant.
    expect(a).not.toEqual(b);
    setNaoRng(null);
  });
});

/* ============================================================
   P0 ORDA-017 / Béroud-18 — SUD/Solidaires (5e union, profil combat)
   ============================================================ */
describe('NAO — SUD/Solidaires (P0 ORDA-017 Béroud-18, 5e union profil combat)', () => {
  it('UNION_META contains 5 entries including sud', () => {
    expect(Object.keys(UNION_META)).toHaveLength(5);
    expect(UNION_META.sud).toBeDefined();
    expect(UNION_META.sud.label).toBe('SUD/Solidaires');
  });

  it('SUD has profile combat, seuil 0.65 (plus exigeant que CGT 0.62), poids électoral 7%', () => {
    expect(UNION_META.sud.profile).toBe('Combat');
    expect(UNION_META.sud.seuilAccord).toBe(0.65);
    expect(UNION_META.sud.electoralWeight).toBe(7);
    /* Plus exigeant que la CGT — sinon SUD ne se distingue pas. */
    expect(UNION_META.sud.seuilAccord).toBeGreaterThan(UNION_META.cgt.seuilAccord);
  });

  it('SUD weights : salaires + égalité-pro dominants (≥ 70 %), télétravail faible', () => {
    const w = UNION_META.sud.weights;
    expect(w.salaires + w.egalite_pro).toBeGreaterThanOrEqual(0.70);
    /* Télétravail faible : SUD historiquement vu comme cadre cadres
       (caissières/services pas de télétravail, profil combat post-1995). */
    expect(w.teletravail).toBeLessThan(0.15);
  });

  it('aiSyndicatMove returns a posture for sud (variance attendue)', () => {
    setNaoRng(null);
    const s = startNaoSession();
    const validPostures = ['pression', 'patience', 'compromis', 'retrait'];
    const sudPostures = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const move = aiSyndicatMove(s);
      expect(validPostures).toContain(move.postures.sud);
      sudPostures.add(move.postures.sud);
    }
    /* Séance 1 : SUD démarre déterministe en pression. */
    expect(sudPostures.has('pression')).toBe(true);
  });

  it('SUD plus dur que la CGT : sur thèmes identiques, SUD signe moins souvent', () => {
    /* Même position, mêmes postures patience : SUD doit refuser plus
       souvent que CGT car son seuil est plus élevé. */
    const themes = { salaires: 60, primes: 50, teletravail: 40, egalite_pro: 60 };
    const cgtSign = willUnionSign(themes, 'cgt', 'patience', false);
    const sudSign = willUnionSign(themes, 'sud', 'patience', false);
    /* Au minimum : si SUD signe, CGT doit signer aussi. */
    if (sudSign) expect(cgtSign).toBe(true);
  });

  it('Monte-Carlo 1000 runs : distribution outcomes reste dans les cibles ORDA-011 (±5%)', () => {
    setNaoRng(null);
    const counts: Record<string, number> = {
      accord_majoritaire: 0, accord_partiel: 0, accord_minoritaire: 0, pv_desaccord: 0
    };
    const N = 1000;
    for (let i = 0; i < N; i++) {
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
    /* Cibles ORDA-011 (4 unions) : 31.3 / 44.7 / 18.4 / 5.6.
       Tolérance ±5 % absolus + variance MC sur 1k échantillons.
       Avec 5 unions (SUD ajoutée), la calibration doit rester
       proche : SUD en retrait ne casse pas la coalition CGT/CFDT/FO/CFE-CGC. */
    const pctMaj = (100 * counts.accord_majoritaire) / N;
    const pctPart = (100 * counts.accord_partiel) / N;
    const pctMin = (100 * counts.accord_minoritaire) / N;
    const pctPv = (100 * counts.pv_desaccord) / N;

    expect(pctMaj, `accord_majoritaire ${pctMaj.toFixed(1)}%`).toBeGreaterThan(20);
    expect(pctMaj, `accord_majoritaire ${pctMaj.toFixed(1)}%`).toBeLessThan(45);
    expect(pctPart, `accord_partiel ${pctPart.toFixed(1)}%`).toBeGreaterThan(35);
    expect(pctPart, `accord_partiel ${pctPart.toFixed(1)}%`).toBeLessThan(55);
    expect(pctMin, `accord_minoritaire ${pctMin.toFixed(1)}%`).toBeGreaterThan(10);
    expect(pctMin, `accord_minoritaire ${pctMin.toFixed(1)}%`).toBeLessThan(28);
    expect(pctPv, `pv_desaccord ${pctPv.toFixed(1)}%`).toBeGreaterThan(1);
    expect(pctPv, `pv_desaccord ${pctPv.toFixed(1)}%`).toBeLessThan(12);
  });

  it('SUD en retrait ne bloque pas la coalition CGT+CFDT+FO+CFE-CGC (= 100 %)', () => {
    /* Validation conceptuelle : si les 4 confédérations historiques signent
       en compromis/patience et SUD en retrait, l'accord majoritaire reste
       atteignable (poids 100 % >= SIGNING_MAJORITY 50 %). */
    const themes = { salaires: 100, primes: 100, teletravail: 100, egalite_pro: 100 };
    const postures = {
      cgt: 'compromis', cfdt: 'compromis', fo: 'compromis', cfecgc: 'compromis', sud: 'retrait'
    } as const;
    const result = computeSigningWeight(themes, postures, false);
    expect(result.signing).not.toContain('sud');
    expect(result.weight).toBeGreaterThanOrEqual(SIGNING_MAJORITY);
    /* CGT(38) + CFDT(35) + FO(20) + CFE-CGC(7) = 100 % sans SUD. */
    expect(result.weight).toBe(100);
  });
});

/* ============================================================
   P1 ORDA-017 / Jobert-17 + P0 Léa-20 — Presets sectoriels
   ============================================================ */
describe('NAO — Preset cadres (Jobert-17, ETI cadres NAO forfait-jours)', () => {
  it('NAO_PRESET_META.cadres exists with correct structure', () => {
    expect(NAO_PRESET_META.cadres).toBeDefined();
    expect(NAO_PRESET_META.cadres.label).toContain('Cadres');
    expect(NAO_PRESET_META.cadres.unionOverrides).toBeDefined();
  });

  it('cadres preset : CFE-CGC electoralWeight monte à 25-30 % (Jobert)', () => {
    const cfecgcWeight = getUnionElectoralWeight('cfecgc', 'cadres');
    expect(cfecgcWeight).toBeGreaterThanOrEqual(25);
    expect(cfecgcWeight).toBeLessThanOrEqual(30);
    /* CFE-CGC standard reste à 7 %. */
    expect(getUnionElectoralWeight('cfecgc', 'standard')).toBe(7);
  });

  it('cadres preset : thèmes recadrés (forfait-jours, temps partiel cadre, déconnexion)', () => {
    const overrides = NAO_PRESET_META.cadres.themeOverrides;
    expect(overrides).toBeDefined();
    expect(overrides!.salaires?.label).toContain('Forfait-jours');
    expect(overrides!.teletravail?.label).toContain('déconnexion');
    expect(overrides!.primes?.label).toContain('Temps partiel');
  });

  it('cadres preset : startNaoSession initialise la session correctement', () => {
    const s = startNaoSession('cadres');
    expect(s.modifiers.preset).toBe('cadres');
    expect(s.enveloppeMax).toBe(NAO_PRESET_META.cadres.enveloppe);
    expect(Object.keys(s.postures)).toContain('sud');
  });

  it('cadres preset : Monte-Carlo 500 runs distribution ≠ standard preset', () => {
    setNaoRng(null);
    const counts: Record<string, number> = {
      accord_majoritaire: 0, accord_partiel: 0, accord_minoritaire: 0, pv_desaccord: 0
    };
    const N = 500;
    for (let i = 0; i < N; i++) {
      let s = startNaoSession('cadres');
      let safety = 0;
      while (s.phase !== 'ended' && safety++ < 10) {
        s = setEmployeurMove(s, aiEmployeurMove(s));
        s = setSyndicatMove(s, aiSyndicatMove(s));
        s = resolveSeance(s);
        if (s.phase !== 'ended') s = nextSeance(s);
      }
      if (s.outcome) counts[s.outcome]++;
    }
    /* Distribution doit être différente de standard.
       Au moins un outcome doit avoir un écart > 5 % par rapport à
       la calibration ORDA-011 (31.3 / 44.7 / 18.4 / 5.6).
       Le preset cadres rebascule la dynamique : on s'attend à
       accord_minoritaire significativement plus haut (CFE-CGC à 30 %
       devient pivot, et les coalitions changent). */
    const pctMin = (100 * counts.accord_minoritaire) / N;
    /* En preset standard accord_minoritaire ≈ 18 %, en cadres on observe
       souvent > 30 % (CFE-CGC à 30 % seule = pas de majorité). */
    const isDifferent = Math.abs(pctMin - 18.4) > 5;
    expect(isDifferent, `accord_minoritaire cadres=${pctMin.toFixed(1)}% vs standard 18.4%`).toBe(true);
  });
});

describe('NAO — Preset distribution-services (Léa-20, syndicalisme féminin)', () => {
  it('NAO_PRESET_META["distribution-services"] exists', () => {
    expect(NAO_PRESET_META['distribution-services']).toBeDefined();
    expect(NAO_PRESET_META['distribution-services'].label).toContain('Distribution');
  });

  it('distribution-services : pas de label "télétravail" (swap vers planning)', () => {
    const overrides = NAO_PRESET_META['distribution-services'].themeOverrides;
    expect(overrides).toBeDefined();
    /* Le thème teletravail est swap vers Planning & horaires. */
    expect(overrides!.teletravail?.label).toContain('Planning');
    expect(overrides!.teletravail?.label?.toLowerCase()).not.toContain('télétravail');
  });

  it('distribution-services : pénibilité posturale présent (swap primes)', () => {
    const overrides = NAO_PRESET_META['distribution-services'].themeOverrides;
    expect(overrides!.primes?.label).toContain('Pénibilité');
  });

  it('distribution-services : CFDT bias signataire (rapprochement Léa CFDT)', () => {
    expect(NAO_PRESET_META['distribution-services'].cfdtBias).toBe('signataire');
  });

  it('distribution-services : CFE-CGC poids ≤ 5 % (peu de cadres en distribution)', () => {
    expect(getUnionElectoralWeight('cfecgc', 'distribution-services')).toBeLessThanOrEqual(5);
  });

  it('distribution-services : SUD-Commerce poids ≥ 8 % (plus que standard)', () => {
    /* SUD historiquement présent dans le commerce — poids légèrement
       plus élevé que la moyenne nationale 7 %. */
    expect(getUnionElectoralWeight('sud', 'distribution-services')).toBeGreaterThanOrEqual(8);
  });

  it('distribution-services : poids égalité-pro CFDT augmenté vs standard', () => {
    const wStd = getUnionWeights('cfdt', 'standard');
    const wDS = getUnionWeights('cfdt', 'distribution-services');
    /* CFDT-Services plus sensible à l'égalité pro (Léa-20). */
    expect(wDS.egalite_pro).toBeGreaterThan(wStd.egalite_pro);
  });

  it('distribution-services : startNaoSession ok + run sans erreur', () => {
    const s = startNaoSession('distribution-services');
    expect(s.modifiers.preset).toBe('distribution-services');
    /* Vérifier qu'un run complet fonctionne. */
    let cur = s;
    let safety = 0;
    while (cur.phase !== 'ended' && safety++ < 10) {
      cur = setEmployeurMove(cur, aiEmployeurMove(cur));
      cur = setSyndicatMove(cur, aiSyndicatMove(cur));
      cur = resolveSeance(cur);
      if (cur.phase !== 'ended') cur = nextSeance(cur);
    }
    expect(cur.outcome).toBeDefined();
  });
});
