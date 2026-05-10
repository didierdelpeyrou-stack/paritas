/**
 * Tests du sous-jeu Conseil prud'homal.
 *
 * Vérifie :
 *   - Score d'une charge cohérent avec KPI / acquis / stratégies
 *   - 3 verdicts possibles (favorableSalarie, favorablePatron, renvoi)
 *   - Delta KPI signe correct selon verdict
 *   - Acquis empilés influencent le score
 *   - Stratégies asymétriques par charge
 *   - IA défaut par doctrine retourne une stratégie valide
 */
import { describe, it, expect } from 'vitest';
import {
  resolveConseil,
  defaultStrategieSalarie,
  defaultStrategiePatron,
  CHARGES,
  type ConseilInput,
  type Charge,
  type Verdict
} from './conseil';
import type { AcquisId, Doctrine } from './dialectic';

function baseInput(over: Partial<ConseilInput> = {}): ConseilInput {
  return {
    patron: { marge: 50, climat: 50, capPol: 50, reputation: 50 },
    salarie: { povAchat: 50, droits: 50, cohesion: 50, legitimite: 50 },
    acquis: new Set<AcquisId>(),
    charges: ['licenciement'],
    strategieSalarie: 'juridique',
    strategiePatron: 'procedural',
    ...over
  };
}

/* ============================================================
   1. Verdicts par configuration
   ============================================================ */

describe('resolveConseil — verdicts', () => {
  it('salarié très légitime + capPol patron faible → favorableSalarie', () => {
    const out = resolveConseil(baseInput({
      patron: { marge: 50, climat: 50, capPol: 10, reputation: 50 },
      salarie: { povAchat: 50, droits: 50, cohesion: 50, legitimite: 90 }
    }));
    expect(out.verdict).toBe('favorableSalarie');
    expect(out.scoreNet).toBeGreaterThan(0);
  });

  it('patron capPol très élevé + salarié peu légitime → favorablePatron', () => {
    const out = resolveConseil(baseInput({
      patron: { marge: 50, climat: 50, capPol: 95, reputation: 50 },
      salarie: { povAchat: 50, droits: 50, cohesion: 50, legitimite: 10 }
    }));
    expect(out.verdict).toBe('favorablePatron');
    expect(out.scoreNet).toBeLessThan(0);
  });

  it('mediation patron réduit la magnitude du score (pousse vers renvoi)', () => {
    /* Cas où le salarié est manifestement gagnant : legitimité 80,
       capPol 20. Avec contreFaute on atteint un score haut, avec
       mediation l'amplitude est divisée par 2. */
    const ctxBase = {
      salarie: { povAchat: 50, droits: 50, cohesion: 50, legitimite: 80 },
      patron: { marge: 50, climat: 50, capPol: 20, reputation: 50 }
    };
    const sansMediation = resolveConseil(baseInput({
      ...ctxBase,
      strategiePatron: 'contreFaute',
      strategieSalarie: 'juridique',
      charges: ['licenciement']
    }));
    const avecMediation = resolveConseil(baseInput({
      ...ctxBase,
      strategiePatron: 'mediation',
      strategieSalarie: 'juridique',
      charges: ['licenciement']
    }));
    expect(Math.abs(avecMediation.scoreNet)).toBeLessThan(Math.abs(sansMediation.scoreNet));
  });
});

/* ============================================================
   2. Acquis empilés
   ============================================================ */

describe('resolveConseil — acquis', () => {
  it('chsct_1982 + harcèlement → score salarié plus élevé qu\'avec aucun acquis', () => {
    const sansAcquis = resolveConseil(baseInput({
      charges: ['harcelement'],
      strategieSalarie: 'temoignage'
    }));
    const avecChsct = resolveConseil(baseInput({
      charges: ['harcelement'],
      strategieSalarie: 'temoignage',
      acquis: new Set<AcquisId>(['chsct_1982'])
    }));
    expect(avecChsct.scoreNet).toBeGreaterThan(sansAcquis.scoreNet);
  });

  it('5 acquis empilés sur conventionViolee → score significativement boosté', () => {
    const sans = resolveConseil(baseInput({
      charges: ['conventionViolee'],
      strategieSalarie: 'juridique'
    }));
    const avec = resolveConseil(baseInput({
      charges: ['conventionViolee'],
      strategieSalarie: 'juridique',
      acquis: new Set<AcquisId>([
        'congesPayes_1936', 'secu_1945', 'sectionsSyndicales_1968',
        'chsct_1982', 'rtt_2000'
      ])
    }));
    expect(avec.scoreNet).toBeGreaterThan(sans.scoreNet + 5);
  });
});

/* ============================================================
   3. Stratégies asymétriques par charge
   ============================================================ */

describe('resolveConseil — stratégies', () => {
  it('temoignage marche mieux sur harcèlement que sur convention', () => {
    const harcelement = resolveConseil(baseInput({
      charges: ['harcelement'],
      strategieSalarie: 'temoignage'
    }));
    const convention = resolveConseil(baseInput({
      charges: ['conventionViolee'],
      strategieSalarie: 'temoignage'
    }));
    expect(harcelement.scoreNet).toBeGreaterThan(convention.scoreNet);
  });

  it('juridique marche bien sur conventionViolee', () => {
    const out = resolveConseil(baseInput({
      charges: ['conventionViolee'],
      strategieSalarie: 'juridique'
    }));
    /* Avec base 50/50 et stratégie juridique sur convention, on devrait
       être positif (tend vers favorable salarié). */
    expect(out.scoreNet).toBeGreaterThan(0);
  });

  it('procedural patron pénalise le salarié sur licenciement', () => {
    const procedural = resolveConseil(baseInput({
      charges: ['licenciement'],
      strategiePatron: 'procedural'
    }));
    const mediation = resolveConseil(baseInput({
      charges: ['licenciement'],
      strategiePatron: 'mediation'
    }));
    expect(procedural.scoreNet).toBeLessThan(mediation.scoreNet);
  });
});

/* ============================================================
   4. Multi-charges
   ============================================================ */

describe('resolveConseil — multi-charges', () => {
  it('3 charges plaidées → delta amplifié', () => {
    const une = resolveConseil(baseInput({
      charges: ['licenciement']
    }));
    const trois = resolveConseil(baseInput({
      charges: ['licenciement', 'harcelement', 'conventionViolee']
    }));
    /* Pour le même verdict, le delta doit être plus important avec 3 charges. */
    if (une.verdict === trois.verdict) {
      const k1 = Math.abs(une.delta.legitimite ?? 0);
      const k3 = Math.abs(trois.delta.legitimite ?? 0);
      expect(k3).toBeGreaterThan(k1);
    }
  });

  it('charges non plaidées sont initialisées à renvoi dans parCharge', () => {
    const out = resolveConseil(baseInput({
      charges: ['licenciement']
    }));
    /* Les 2 autres charges ne sont pas dans input.charges → renvoi. */
    expect(out.parCharge.harcelement).toBe('renvoi');
    expect(out.parCharge.conventionViolee).toBe('renvoi');
  });

  it('throws si charges vide', () => {
    expect(() => resolveConseil(baseInput({ charges: [] }))).toThrow();
  });
});

/* ============================================================
   5. Delta KPI
   ============================================================ */

describe('resolveConseil — delta', () => {
  it('verdict salarié → légit ↑, marge ↓, réputation ↓', () => {
    const out = resolveConseil(baseInput({
      salarie: { povAchat: 50, droits: 50, cohesion: 50, legitimite: 90 },
      patron: { marge: 50, climat: 50, capPol: 10, reputation: 50 }
    }));
    expect(out.delta.legitimite!).toBeGreaterThan(0);
    expect(out.delta.marge!).toBeLessThan(0);
    expect(out.delta.reputation!).toBeLessThan(0);
  });

  it('verdict patron → capPol ↑, légit ↓, cohésion ↓', () => {
    const out = resolveConseil(baseInput({
      patron: { marge: 50, climat: 50, capPol: 95, reputation: 50 },
      salarie: { povAchat: 50, droits: 50, cohesion: 50, legitimite: 10 }
    }));
    expect(out.delta.capPol!).toBeGreaterThan(0);
    expect(out.delta.legitimite!).toBeLessThan(0);
    expect(out.delta.cohesion!).toBeLessThan(0);
  });

  it('renvoi → légit légèrement ↓ + capPol légèrement ↓ + tension ↑ (usure)', () => {
    const out = resolveConseil(baseInput({
      strategiePatron: 'mediation',
      salarie: { povAchat: 50, droits: 50, cohesion: 50, legitimite: 55 },
      patron: { marge: 50, climat: 50, capPol: 50, reputation: 50 }
    }));
    expect(out.verdict).toBe('renvoi');
    expect(out.delta.tension!).toBeGreaterThan(0);
    expect(out.delta.legitimite!).toBeLessThan(0);
    expect(out.delta.capPol!).toBeLessThan(0);
  });
});

/* ============================================================
   6. IA défaut
   ============================================================ */

describe('IA défauts', () => {
  it('defaultStrategieSalarie pour les 4 doctrines salarié', () => {
    const ds: Doctrine[] = ['reformiste', 'syndicalismeLutte', 'autogestionnaire', 'juridiste'];
    for (const d of ds) {
      const s = defaultStrategieSalarie(d);
      expect(['temoignage', 'juridique', 'mediatique']).toContain(s);
    }
  });

  it('defaultStrategiePatron pour les 4 doctrines patron', () => {
    const ds: Doctrine[] = ['paternalisme', 'neoliberal', 'technocratique', 'corporatiste'];
    for (const d of ds) {
      const s = defaultStrategiePatron(d);
      expect(['procedural', 'contreFaute', 'mediation']).toContain(s);
    }
  });

  it('neoliberal patron → contreFaute (logique offensive)', () => {
    expect(defaultStrategiePatron('neoliberal')).toBe('contreFaute');
  });

  it('syndicalismeLutte salarié → mediatique', () => {
    expect(defaultStrategieSalarie('syndicalismeLutte')).toBe('mediatique');
  });
});

/* ============================================================
   7. Couverture CHARGES
   ============================================================ */

describe('CHARGES — catalogue', () => {
  it('contient 3 charges', () => {
    expect(CHARGES).toHaveLength(3);
  });

  it('chaque charge a un verdict défini après résolution', () => {
    const out = resolveConseil(baseInput({
      charges: ['licenciement', 'harcelement', 'conventionViolee']
    }));
    for (const c of CHARGES) {
      expect(out.parCharge[c]).toBeDefined();
    }
  });
});
