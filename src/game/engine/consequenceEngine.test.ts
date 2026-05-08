import { describe, it, expect } from 'vitest';
import {
  scheduleActorCallback,
  dueActorCallbacks,
  consumeActorCallbacks
} from './consequenceEngine';
import type { Memory } from '../types';

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
