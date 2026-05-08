import { describe, it, expect } from 'vitest';
import { composeConsequence } from './consequenceWriter';
import type { Choice, RebirthGameState, Scenario } from '../types';

/* Couverture Vitest P1 ORDA-016 PARITAS — narrative/consequenceWriter.ts.
   Cible : composeConsequence(state, choice, mode) — texte principal,
   numericSummary (réfléchi only), voice (selon traitShift / dominantTrait).
   Estimation couverture : 85-90 %. */

function mkState(over: Partial<RebirthGameState> = {}): RebirthGameState {
  const base = {
    name: 'Test',
    camp: 'salarie',
    mode: 'reflechi',
    legendaryId: null,
    turn: 1,
    era: 'trente_glorieuses',
    currentScenarioId: null,
    traits: { batisseur: 0, rupture: 0, technocrate: 0, pragmatique: 0, paternaliste: 0, tribun: 0 },
    dominantTrait: 'batisseur',
    personalityStress: 0,
    resources: { confiance: 50, caisse: 50, santeSociale: 50, legitimite: 50, rapportDeForce: 50, cohesionInterne: 50, institution: 50 },
    actors: {},
    organization: {},
    activeStrategies: [],
    worldAI: {},
    activePipelines: [],
    memory: {},
    objectives: [],
    objectiveProgress: [],
    phase: 'consequence',
    lastChoice: null,
    lastConsequenceText: null,
    endingId: null,
    ...over
  };
  return base as unknown as RebirthGameState;
}

function mkChoice(over: Partial<Choice> = {}): Choice {
  return {
    id: 'c1',
    text: 'Test',
    intent: 'Test intent',
    effects: {},
    consequence: { immediate: 'Conséquence immédiate de référence.' },
    ...over
  } as unknown as Choice;
}

// Used for documentation/symmetry with sibling tests; kept minimal.
function mkScenario(over: Partial<Scenario> = {}): Scenario {
  return {
    id: 'sc-1',
    turn: 1,
    date: '—',
    era: 'trente_glorieuses',
    title: 'Test',
    mood: 'calme',
    historicalContext: '',
    setup: { reflechi: '', compulsif: '' },
    actors: [],
    choices: [],
    ...over
  } as unknown as Scenario;
}

describe('consequenceWriter — composeConsequence shape', () => {
  it('retourne { text, numericSummary, voice } avec text non-vide', () => {
    const out = composeConsequence(mkState(), mkChoice(), 'reflechi');
    expect(out).toHaveProperty('text');
    expect(out).toHaveProperty('numericSummary');
    expect(out).toHaveProperty('voice');
    expect(out.text.length).toBeGreaterThan(0);
    expect(out.text).toBe('Conséquence immédiate de référence.');
  });
});

describe('consequenceWriter — mode réfléchi vs compulsif', () => {
  it('mode "compulsif" force numericSummary à null (différent de réfléchi quand effets présents)', () => {
    const choice = mkChoice({
      effects: { resources: { confiance: -5, caisse: 10 } }
    });
    const reflechi = composeConsequence(mkState(), choice, 'reflechi');
    const compulsif = composeConsequence(mkState(), choice, 'compulsif');

    expect(compulsif.numericSummary).toBeNull();
    expect(reflechi.numericSummary).not.toBeNull();
    // sortie globale différente entre les 2 modes
    expect(reflechi.numericSummary).not.toBe(compulsif.numericSummary);
  });
});

describe('consequenceWriter — numericSummary refletant les effects.resources', () => {
  it('ressources non-vides → résumé contient labels + signes', () => {
    const choice = mkChoice({
      effects: { resources: { confiance: -5, caisse: 10 } }
    });
    const out = composeConsequence(mkState(), choice, 'reflechi');
    expect(out.numericSummary).not.toBeNull();
    expect(out.numericSummary).toMatch(/Confiance/);
    expect(out.numericSummary).toMatch(/-5/);
    expect(out.numericSummary).toMatch(/\+10/);
  });

  it('caisse → libellé en monnaie d\'époque (révolution = livres)', () => {
    const choice = mkChoice({ effects: { resources: { caisse: 5 } } });
    const out = composeConsequence(mkState({ era: 'revolution' }), choice, 'reflechi');
    // currencyForEra('revolution') = 'livres' → label capitalisé "Livres"
    expect(out.numericSummary).toMatch(/Livres/);
  });

  it('inclut les deltas d\'acteurs (trust/patience)', () => {
    const choice = mkChoice({
      effects: {
        actors: { base: { trust: 3, patience: -2 } }
      }
    });
    const out = composeConsequence(mkState(), choice, 'reflechi');
    expect(out.numericSummary).toMatch(/Base/);
    expect(out.numericSummary).toMatch(/confiance \+3/);
    expect(out.numericSummary).toMatch(/patience -2/);
  });
});

describe('consequenceWriter — voice selon traitShift × dominantTrait', () => {
  it('shift ≥ 2 sur le trait dominant → voix "te ressemble"', () => {
    const choice = mkChoice({ traitShift: { batisseur: 3 } });
    const out = composeConsequence(mkState({ dominantTrait: 'batisseur' }), choice, 'reflechi');
    expect(out.voice).not.toBeNull();
    expect(out.voice).toMatch(/ressemble/i);
  });

  it('shift ≤ -2 sur le trait dominant → voix "contre toi-même"', () => {
    const choice = mkChoice({ traitShift: { batisseur: -3 } });
    const out = composeConsequence(mkState({ dominantTrait: 'batisseur' }), choice, 'reflechi');
    expect(out.voice).not.toBeNull();
    expect(out.voice).toMatch(/toi-même/i);
  });

  it('pas de traitShift → voice null', () => {
    const out = composeConsequence(mkState(), mkChoice(), 'reflechi');
    expect(out.voice).toBeNull();
  });

  it('shift faible (|shift|<2) sur le trait dominant → voice null', () => {
    const choice = mkChoice({ traitShift: { batisseur: 1 } });
    const out = composeConsequence(mkState({ dominantTrait: 'batisseur' }), choice, 'reflechi');
    expect(out.voice).toBeNull();
  });
});

describe('consequenceWriter — fallback minimal', () => {
  it('choice.consequence minimal + pas d\'effets → text présent, numericSummary null, voice null', () => {
    const choice = mkChoice({
      consequence: { immediate: 'Texte minimal.' },
      effects: {}
    });
    const out = composeConsequence(mkState(), choice, 'reflechi');
    expect(out.text).toBe('Texte minimal.');
    expect(out.numericSummary).toBeNull();
    expect(out.voice).toBeNull();
  });
});

describe('consequenceWriter — idempotence', () => {
  it('appels successifs avec mêmes args produisent des sorties identiques', () => {
    const state = mkState({ dominantTrait: 'rupture' });
    const choice = mkChoice({
      effects: { resources: { confiance: -4, caisse: 12 } },
      traitShift: { rupture: 2 }
    });
    const a = composeConsequence(state, choice, 'reflechi');
    const b = composeConsequence(state, choice, 'reflechi');
    expect(a).toEqual(b);
  });
});

// scenarios fixture present pour cohérence avec sibling helpers (P1 ORDA-016)
void mkScenario;
