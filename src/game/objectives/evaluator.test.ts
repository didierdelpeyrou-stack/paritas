import { describe, it, expect } from 'vitest';
import { evaluateObjectives, objectiveScoreContribution } from './evaluator';
import type { RoleObjective, ObjectiveProgress } from './types';
import { freshResources } from '../simulation/resources';
import type { RebirthGameState, Memory, PlayerTrait } from '../types';

/* Couverture Vitest P0 ORDA-016 PARITAS — objectives/evaluator.ts (était 0%).
   Module léger (~76 LoC) qui transforme l'état courant en
   ObjectiveProgress[] et calcule la contribution finale au score. */

function emptyMemory(over: Partial<Memory> = {}): Memory {
  return {
    refusedCompromise: 0,
    signedMajorAccords: [],
    betrayedBase: 0,
    builtInstitutions: [],
    exhaustedMovements: 0,
    flags: {},
    playedScenarios: [],
    pendingLongterm: [],
    ...over
  };
}

function mkState(over: {
  turn?: number;
  resources?: Partial<ReturnType<typeof freshResources>>;
  memory?: Partial<Memory>;
  dominantTrait?: PlayerTrait;
} = {}): RebirthGameState {
  return {
    turn: over.turn ?? 1,
    resources: { ...freshResources(), ...over.resources },
    memory: emptyMemory(over.memory),
    dominantTrait: over.dominantTrait ?? 'pragmatique'
  } as unknown as RebirthGameState;
}

describe('evaluator — evaluateObjectives (état initial)', () => {
  it('retourne un progress par objectif passé', () => {
    const objs: RoleObjective[] = [
      {
        id: 'a', label: 'A', description: '', weight: 1,
        condition: { kind: 'institutions-built', count: 2 }
      },
      {
        id: 'b', label: 'B', description: '', weight: 2,
        condition: { kind: 'accords-signed', count: 1 }
      }
    ];
    const result = evaluateObjectives(mkState(), objs);
    expect(result).toHaveLength(2);
    expect(result.map(p => p.id)).toEqual(['a', 'b']);
  });

  it('progress=0 satisfied=false failed=false sur état neutre', () => {
    const objs: RoleObjective[] = [
      {
        id: 'inst', label: '', description: '', weight: 3,
        condition: { kind: 'institutions-built', count: 4 }
      }
    ];
    const [p] = evaluateObjectives(mkState(), objs);
    expect(p.progress).toBe(0);
    expect(p.satisfied).toBe(false);
    expect(p.failed).toBe(false);
  });
});

describe('evaluator — conditions diverses', () => {
  it('institutions-built : ratio = built / count, satisfied dès count atteint', () => {
    const objs: RoleObjective[] = [
      {
        id: 'inst', label: '', description: '', weight: 3,
        condition: { kind: 'institutions-built', count: 4 }
      }
    ];
    const partial = evaluateObjectives(
      mkState({ memory: { builtInstitutions: ['a', 'b'] } }),
      objs
    );
    expect(partial[0].progress).toBe(50);
    expect(partial[0].satisfied).toBe(false);

    const full = evaluateObjectives(
      mkState({ memory: { builtInstitutions: ['a', 'b', 'c', 'd'] } }),
      objs
    );
    expect(full[0].progress).toBe(100);
    expect(full[0].satisfied).toBe(true);
  });

  it('accords-signed : seuil sur signedMajorAccords.length', () => {
    const objs: RoleObjective[] = [
      {
        id: 'acc', label: '', description: '', weight: 3,
        condition: { kind: 'accords-signed', count: 2 }
      }
    ];
    const result = evaluateObjectives(
      mkState({ memory: { signedMajorAccords: ['matignon', 'grenelle'] } }),
      objs
    );
    expect(result[0].satisfied).toBe(true);
  });

  it('refuse-compromise : seuil sur memory.refusedCompromise', () => {
    const objs: RoleObjective[] = [
      {
        id: 'ref', label: '', description: '', weight: 2,
        condition: { kind: 'refuse-compromise', count: 2 }
      }
    ];
    const result = evaluateObjectives(
      mkState({ memory: { refusedCompromise: 3 } }),
      objs
    );
    expect(result[0].satisfied).toBe(true);
  });

  it('no-betrayal : satisfied tant que betrayedBase ≤ max, dégrade ensuite', () => {
    const objs: RoleObjective[] = [
      {
        id: 'nb', label: '', description: '', weight: 2,
        condition: { kind: 'no-betrayal', max: 1 }
      }
    ];
    const ok = evaluateObjectives(
      mkState({ memory: { betrayedBase: 1 } }),
      objs
    );
    expect(ok[0].satisfied).toBe(true);
    expect(ok[0].progress).toBe(100);

    const overflow = evaluateObjectives(
      mkState({ memory: { betrayedBase: 3 } }),
      objs
    );
    expect(overflow[0].satisfied).toBe(false);
    expect(overflow[0].progress).toBeLessThan(100);
  });

  it('flag-set : 1 si la clé existe dans memory.flags, 0 sinon', () => {
    const objs: RoleObjective[] = [
      {
        id: 'flag', label: '', description: '', weight: 3,
        condition: { kind: 'flag-set', flag: 'signe-matignon' }
      }
    ];
    const without = evaluateObjectives(mkState(), objs);
    expect(without[0].satisfied).toBe(false);

    const withFlag = evaluateObjectives(
      mkState({ memory: { flags: { 'signe-matignon': 1 } } }),
      objs
    );
    expect(withFlag[0].satisfied).toBe(true);
  });

  it('trait-dominant : 1 si dominantTrait === trait', () => {
    const objs: RoleObjective[] = [
      {
        id: 'tr', label: '', description: '', weight: 1,
        condition: { kind: 'trait-dominant', trait: 'tribun' }
      }
    ];
    expect(evaluateObjectives(mkState({ dominantTrait: 'pragmatique' }), objs)[0].satisfied).toBe(false);
    expect(evaluateObjectives(mkState({ dominantTrait: 'tribun' }), objs)[0].satisfied).toBe(true);
  });

  it('resource-min : ratio sur valeur courante / threshold', () => {
    const objs: RoleObjective[] = [
      {
        id: 'rmin', label: '', description: '', weight: 2,
        condition: { kind: 'resource-min', resource: 'caisse', threshold: 50 }
      }
    ];
    const result = evaluateObjectives(
      mkState({ resources: { caisse: 60 } }),
      objs
    );
    expect(result[0].satisfied).toBe(true);
  });

  it('resource-max : satisfied tant que valeur ≤ threshold, dégrade au-delà', () => {
    const objs: RoleObjective[] = [
      {
        id: 'rmax', label: '', description: '', weight: 1,
        condition: { kind: 'resource-max', resource: 'rapportDeForce', threshold: 30 }
      }
    ];
    const under = evaluateObjectives(
      mkState({ resources: { rapportDeForce: 20 } }),
      objs
    );
    expect(under[0].satisfied).toBe(true);

    const over = evaluateObjectives(
      mkState({ resources: { rapportDeForce: 90 } }),
      objs
    );
    expect(over[0].satisfied).toBe(false);
    expect(over[0].progress).toBeLessThan(100);
  });
});

describe('evaluator — failed (deadlines)', () => {
  it('sans byTurn, failed reste false même sur état non satisfait', () => {
    const objs: RoleObjective[] = [
      {
        id: 'a', label: '', description: '', weight: 2,
        condition: { kind: 'institutions-built', count: 4 }
      }
    ];
    const result = evaluateObjectives(mkState({ turn: 99 }), objs);
    expect(result[0].failed).toBe(false);
  });

  it('avec byTurn dépassé et non satisfait → failed = true', () => {
    const objs: RoleObjective[] = [
      {
        id: 'matignon', label: '', description: '', weight: 3,
        byTurn: 22,
        condition: { kind: 'flag-set', flag: 'signe-matignon' }
      }
    ];
    const result = evaluateObjectives(mkState({ turn: 23 }), objs);
    expect(result[0].failed).toBe(true);
    expect(result[0].satisfied).toBe(false);
  });

  it('failed est sticky : un objectif déjà failed reste failed même si on regagne le terrain', () => {
    const objs: RoleObjective[] = [
      {
        id: 'm', label: '', description: '', weight: 3,
        byTurn: 22,
        condition: { kind: 'flag-set', flag: 'f' }
      }
    ];
    const previous: ObjectiveProgress[] = [
      { id: 'm', progress: 0, satisfied: false, failed: true }
    ];
    /* On revient à un tour antérieur ET on satisfait la condition.
       failed reste true (sticky). */
    const result = evaluateObjectives(
      mkState({ turn: 10, memory: { flags: { f: 1 } } }),
      objs,
      previous
    );
    expect(result[0].failed).toBe(true);
    expect(result[0].satisfied).toBe(true);
  });
});

describe('evaluator — objectiveScoreContribution', () => {
  it('retourne 0 sur liste vide', () => {
    expect(objectiveScoreContribution([], [])).toBe(0);
  });

  it('100 si tous les objectifs sont satisfied', () => {
    const objs: RoleObjective[] = [
      {
        id: 'a', label: '', description: '', weight: 3,
        condition: { kind: 'institutions-built', count: 1 }
      },
      {
        id: 'b', label: '', description: '', weight: 1,
        condition: { kind: 'accords-signed', count: 1 }
      }
    ];
    const progress: ObjectiveProgress[] = [
      { id: 'a', progress: 100, satisfied: true, failed: false },
      { id: 'b', progress: 100, satisfied: true, failed: false }
    ];
    expect(objectiveScoreContribution(progress, objs)).toBe(100);
  });

  it('un objectif partiel pèse via progress×0.4 du poids', () => {
    /* 1 objectif weight=3, progress=50, !satisfied, !failed
       → earned = 3 * (50/100) * 0.4 = 0.6 ; achievable = 3
       → 100 * 0.6 / 3 = 20 */
    const objs: RoleObjective[] = [
      {
        id: 'a', label: '', description: '', weight: 3,
        condition: { kind: 'institutions-built', count: 4 }
      }
    ];
    const progress: ObjectiveProgress[] = [
      { id: 'a', progress: 50, satisfied: false, failed: false }
    ];
    expect(objectiveScoreContribution(progress, objs)).toBe(20);
  });

  it('un objectif failed ne contribue pas', () => {
    const objs: RoleObjective[] = [
      {
        id: 'a', label: '', description: '', weight: 3,
        condition: { kind: 'institutions-built', count: 4 }
      },
      {
        id: 'b', label: '', description: '', weight: 1,
        condition: { kind: 'accords-signed', count: 1 }
      }
    ];
    const progress: ObjectiveProgress[] = [
      { id: 'a', progress: 80, satisfied: false, failed: true },
      { id: 'b', progress: 100, satisfied: true, failed: false }
    ];
    /* earned = 0 (a échoué) + 1 (b satisfied) = 1 ; achievable = 4
       → round(100 / 4) = 25 */
    expect(objectiveScoreContribution(progress, objs)).toBe(25);
  });
});
