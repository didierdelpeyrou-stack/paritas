import { describe, it, expect } from 'vitest';
import {
  scheduleActorCallback,
  dueActorCallbacks,
  consumeActorCallbacks,
  buildConsequence,
  applyNarrativeEnrichment,
  applyNarrativeFallback
} from './consequenceEngine';
import { freshResources } from '../simulation/resources';
import { freshActors } from '../simulation/actors';
import { freshTraits } from '../narrative/personalityEngine';
import type { Memory, Choice, Scenario, RebirthGameState, PlayerTrait } from '../types';

/* P1-10-branch (ORDA-010) : tests + démonstration d'usage de l'API
   callbacks acteurs. Pattern :

     // 1. Au moment d'un choix marquant
     scheduleActorCallback(memory, currentTurn + 4, 'adversaire',
       "Pinot n'a pas oublié — il fait passer le mot dans la presse.",
       'corrompre-prefet', currentTurn);

     // 2. Au début de chaque tour (turn-resolver)
     const due = dueActorCallbacks(memory, currentTurn);
     // ...déclencher narratives, afficher dans ticker causal
     consumeActorCallbacks(memory, due);
*/

function emptyMemory(): Memory {
  return {
    refusedCompromise: 0,
    signedMajorAccords: [],
    betrayedBase: 0,
    builtInstitutions: [],
    exhaustedMovements: 0,
    flags: {},
    playedScenarios: [],
    pendingLongterm: []
  };
}

describe('consequenceEngine — scheduleActorCallback', () => {
  it('crée le tableau scheduledActorCallbacks au premier appel', () => {
    const memory = emptyMemory();
    expect(memory.scheduledActorCallbacks).toBeUndefined();

    scheduleActorCallback(
      memory, 5, 'adversaire',
      'Pinot n\'a pas oublié.',
      'corrompre-prefet', 1
    );

    expect(memory.scheduledActorCallbacks).toHaveLength(1);
    expect(memory.scheduledActorCallbacks?.[0]).toMatchObject({
      atTurn: 5,
      actor: 'adversaire',
      narrative: 'Pinot n\'a pas oublié.',
      fromChoiceId: 'corrompre-prefet',
      posedAtTurn: 1
    });
  });

  it('empile plusieurs callbacks indépendants', () => {
    const memory = emptyMemory();
    scheduleActorCallback(memory, 5, 'adversaire', 'A', 'choice-1', 1);
    scheduleActorCallback(memory, 7, 'base', 'B', 'choice-2', 2);
    scheduleActorCallback(memory, 6, 'etat', 'C', 'choice-3', 3);
    expect(memory.scheduledActorCallbacks).toHaveLength(3);
  });
});

describe('consequenceEngine — dueActorCallbacks', () => {
  it('retourne uniquement les callbacks dont atTurn ≤ currentTurn', () => {
    const memory = emptyMemory();
    scheduleActorCallback(memory, 5, 'adversaire', 'A', 'c-1', 1);
    scheduleActorCallback(memory, 8, 'base', 'B', 'c-2', 2);
    scheduleActorCallback(memory, 3, 'etat', 'C', 'c-3', 1);

    /* Au tour 4 : seul c-3 est dû (atTurn=3 ≤ 4). */
    const due4 = dueActorCallbacks(memory, 4);
    expect(due4).toHaveLength(1);
    expect(due4[0].fromChoiceId).toBe('c-3');

    /* Au tour 6 : c-3 (3≤6) et c-1 (5≤6) sont dus. */
    const due6 = dueActorCallbacks(memory, 6);
    expect(due6).toHaveLength(2);
    expect(due6.map(cb => cb.fromChoiceId).sort()).toEqual(['c-1', 'c-3']);

    /* Au tour 10 : tous dus. */
    const due10 = dueActorCallbacks(memory, 10);
    expect(due10).toHaveLength(3);
  });

  it('retourne [] si aucun callback programmé', () => {
    const memory = emptyMemory();
    expect(dueActorCallbacks(memory, 100)).toEqual([]);
  });

  it('retourne [] si scheduledActorCallbacks est undefined (rétro-compat saves)', () => {
    const memory = emptyMemory();
    delete memory.scheduledActorCallbacks;
    expect(dueActorCallbacks(memory, 100)).toEqual([]);
  });
});

describe('consequenceEngine — consumeActorCallbacks', () => {
  it('retire les callbacks consommés et garde les autres', () => {
    const memory = emptyMemory();
    scheduleActorCallback(memory, 5, 'adversaire', 'A', 'c-1', 1);
    scheduleActorCallback(memory, 8, 'base', 'B', 'c-2', 2);
    scheduleActorCallback(memory, 3, 'etat', 'C', 'c-3', 1);

    const due6 = dueActorCallbacks(memory, 6);
    consumeActorCallbacks(memory, due6);

    expect(memory.scheduledActorCallbacks).toHaveLength(1);
    expect(memory.scheduledActorCallbacks?.[0].fromChoiceId).toBe('c-2');
  });

  it('no-op si la liste consommée est vide', () => {
    const memory = emptyMemory();
    scheduleActorCallback(memory, 5, 'adversaire', 'A', 'c-1', 1);
    consumeActorCallbacks(memory, []);
    expect(memory.scheduledActorCallbacks).toHaveLength(1);
  });

  it('no-op si scheduledActorCallbacks est undefined', () => {
    const memory = emptyMemory();
    delete memory.scheduledActorCallbacks;
    /* Ne plante pas sur un tableau undefined */
    expect(() => consumeActorCallbacks(memory, [])).not.toThrow();
  });
});

/* Couverture ORDA-014 — buildConsequence + applyNarrative*. */

function mkState(over: Partial<RebirthGameState> = {}): RebirthGameState {
  return {
    name: 'Test',
    camp: 'salarie',
    mode: 'reflechi',
    legendaryId: null,
    turn: 5,
    era: 'belle-epoque',
    currentScenarioId: null,
    traits: freshTraits(),
    dominantTrait: 'batisseur',
    personalityStress: 0,
    resources: freshResources(),
    actors: freshActors(),
    memory: emptyMemory(),
    objectives: [],
    objectiveProgress: [],
    phase: 'consequence',
    lastChoice: null,
    lastConsequenceText: null,
    endingId: null,
    ...over
  } as unknown as RebirthGameState;
}

function mkChoice(over: Partial<Choice> = {}): Choice {
  return {
    id: 'c-test',
    text: 'Choix test',
    intent: 'test',
    effects: { resources: { confiance: 5 } },
    consequence: { immediate: 'Conséquence immédiate de test.' },
    ...over
  } as Choice;
}

function mkScenario(): Scenario {
  return {
    id: 'sc-test',
    title: 'Scénario test',
    subtitle: 'sous-titre',
    date: '1900',
    era: 'belle-epoque',
    mood: 'tendu',
    setup: { reflechi: 'reflechi setup', compulsif: 'compulsif setup' },
    historicalContext: 'context',
    choices: []
  } as unknown as Scenario;
}

describe('consequenceEngine — buildConsequence', () => {
  it('produit un ConsequenceRender avec les champs de base', () => {
    const r = buildConsequence(mkState(), mkScenario(), mkChoice(), 'batisseur');
    expect(r.text).toBeTruthy();
    expect(typeof r.text).toBe('string');
    expect(r.enriched).toBe(false);
    expect(r.innerVoice).toBeNull();
    expect(r.newspaperHeadline).toBeNull();
    expect(r.memoryLine).toBeNull();
    expect(Array.isArray(r.concreteMeasures)).toBe(true);
  });

  it('extrait le traitShift dominant (delta positif le plus fort)', () => {
    const choice = mkChoice({ traitShift: { batisseur: 1, technocrate: 3, rupture: 2 } });
    const r = buildConsequence(mkState(), mkScenario(), choice, 'batisseur');
    expect(r.traitShift).not.toBeNull();
    expect(r.traitShift!.trait).toBe('technocrate');
    expect(r.traitShift!.delta).toBe(3);
  });

  it('traitShift null si pas de shift', () => {
    const r = buildConsequence(mkState(), mkScenario(), mkChoice(), 'batisseur');
    expect(r.traitShift).toBeNull();
  });

  it('traitShift null si tous les deltas sont < 1', () => {
    const choice = mkChoice({ traitShift: { batisseur: 0, technocrate: 0 } });
    const r = buildConsequence(mkState(), mkScenario(), choice, 'batisseur');
    expect(r.traitShift).toBeNull();
  });

  it('traitChange détecte un changement de trait dominant', () => {
    const state = mkState({ dominantTrait: 'rupture' as PlayerTrait });
    const r = buildConsequence(state, mkScenario(), mkChoice(), 'batisseur');
    expect(r.traitChange).not.toBeNull();
    expect(r.traitChange!.from).toBe('batisseur');
    expect(r.traitChange!.to).toBe('rupture');
  });

  it('traitChange null si pas de bascule', () => {
    const state = mkState({ dominantTrait: 'batisseur' as PlayerTrait });
    const r = buildConsequence(state, mkScenario(), mkChoice(), 'batisseur');
    expect(r.traitChange).toBeNull();
  });
});

describe('consequenceEngine — applyNarrativeEnrichment', () => {
  it('remplace le texte si fourni, marque enriched=true', () => {
    const base = buildConsequence(mkState(), mkScenario(), mkChoice(), 'batisseur');
    const enriched = applyNarrativeEnrichment(base, {
      consequence: 'Texte enrichi par le LLM.',
      innerVoice: 'voix intérieure',
      newspaperHeadline: 'Le journal titre',
      memoryLine: 'mémoire long terme'
    });
    expect(enriched.text).toBe('Texte enrichi par le LLM.');
    expect(enriched.innerVoice).toBe('voix intérieure');
    expect(enriched.newspaperHeadline).toBe('Le journal titre');
    expect(enriched.memoryLine).toBe('mémoire long terme');
    expect(enriched.enriched).toBe(true);
  });

  it('garde le texte original si consequence vide', () => {
    const base = buildConsequence(mkState(), mkScenario(), mkChoice(), 'batisseur');
    const enriched = applyNarrativeEnrichment(base, { consequence: '' });
    expect(enriched.text).toBe(base.text);
    expect(enriched.enriched).toBe(true);
  });

  it('garde les valeurs courantes si output partiel', () => {
    const base = buildConsequence(mkState(), mkScenario(), mkChoice(), 'batisseur');
    const seeded = { ...base, innerVoice: 'préexistante' };
    const enriched = applyNarrativeEnrichment(seeded, { consequence: 'X' });
    expect(enriched.innerVoice).toBe('préexistante');
  });
});

describe('consequenceEngine — applyNarrativeFallback', () => {
  it('marque enriched=false', () => {
    const base = buildConsequence(mkState(), mkScenario(), mkChoice(), 'batisseur');
    const out = applyNarrativeFallback(base, mkState(), mkScenario(), mkChoice());
    expect(out.enriched).toBe(false);
  });

  it('immutabilité : ne mute pas le ConsequenceRender source', () => {
    const base = buildConsequence(mkState(), mkScenario(), mkChoice(), 'batisseur');
    const beforeText = base.text;
    applyNarrativeFallback(base, mkState(), mkScenario(), mkChoice());
    expect(base.text).toBe(beforeText);
  });
});

describe('consequenceEngine — pattern complet "Matignon corruption préfet"', () => {
  it('démontre le cycle de vie complet d\'un callback Romero/Fåhraeus', () => {
    /* Tour 7 — joueur signe corruption préfet (1936 Matignon).
       On programme 2 callbacks différés : Pinot dans 4 tours
       (tour 11) + Frachon dans 5 tours (tour 12). */
    const memory = emptyMemory();
    const turnPosed = 7;

    scheduleActorCallback(
      memory, turnPosed + 4, 'adversaire',
      'Pinot ricane. Le mot court chez les patrons : « Le syndicat fait ses courses chez nous. »',
      'corrompre-prefet', turnPosed
    );
    scheduleActorCallback(
      memory, turnPosed + 5, 'base',
      'Frachon t\'écrit. Trois lignes seulement. Il sait. Il ne te le redira pas.',
      'corrompre-prefet', turnPosed
    );

    expect(memory.scheduledActorCallbacks).toHaveLength(2);

    /* Tours 8-10 : rien ne se passe. */
    expect(dueActorCallbacks(memory, 8)).toHaveLength(0);
    expect(dueActorCallbacks(memory, 9)).toHaveLength(0);
    expect(dueActorCallbacks(memory, 10)).toHaveLength(0);

    /* Tour 11 : Pinot se manifeste. Le moteur le déclenche puis consomme. */
    const dueT11 = dueActorCallbacks(memory, 11);
    expect(dueT11).toHaveLength(1);
    expect(dueT11[0].actor).toBe('adversaire');
    expect(dueT11[0].narrative).toContain('Pinot');
    consumeActorCallbacks(memory, dueT11);
    expect(memory.scheduledActorCallbacks).toHaveLength(1);

    /* Tour 12 : Frachon se manifeste. */
    const dueT12 = dueActorCallbacks(memory, 12);
    expect(dueT12).toHaveLength(1);
    expect(dueT12[0].actor).toBe('base');
    expect(dueT12[0].narrative).toContain('Frachon');
    consumeActorCallbacks(memory, dueT12);
    expect(memory.scheduledActorCallbacks).toHaveLength(0);
  });
});
