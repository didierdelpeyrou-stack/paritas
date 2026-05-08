import { describe, it, expect } from 'vitest';
import {
  freshMemory,
  setFlag,
  markPlayed,
  addAccord,
  addInstitution,
  pushLongterm,
  consumeChoice
} from './memoryEngine';
import type { Choice, Memory } from '../types';

/* Couverture Vitest ORDA-010 — narrative/memoryEngine.ts (était à 0%).
   Module structurant : gère flags, accords, institutions, longterm,
   et pivot consumeChoice() qui orchestre. */

describe('memoryEngine — freshMemory', () => {
  it('initialise une mémoire vierge avec tous les compteurs à 0', () => {
    const m = freshMemory();
    expect(m.refusedCompromise).toBe(0);
    expect(m.signedMajorAccords).toEqual([]);
    expect(m.betrayedBase).toBe(0);
    expect(m.builtInstitutions).toEqual([]);
    expect(m.exhaustedMovements).toBe(0);
    expect(m.flags).toEqual({});
    expect(m.playedScenarios).toEqual([]);
    expect(m.pendingLongterm).toEqual([]);
  });

  it('produit des références fraîches (pas de partage entre appels)', () => {
    const m1 = freshMemory();
    const m2 = freshMemory();
    m1.flags.test = 1;
    expect(m2.flags).toEqual({});
    expect(m1.flags).toEqual({ test: 1 });
  });
});

describe('memoryEngine — setFlag', () => {
  it('pose un flag avec le tour comme valeur', () => {
    const m1 = freshMemory();
    const m2 = setFlag(m1, 'corrompu-prefecture', 7);
    expect(m2.flags['corrompu-prefecture']).toBe(7);
  });

  it('est immutable — m1 inchangé après setFlag', () => {
    const m1 = freshMemory();
    setFlag(m1, 'foo', 5);
    expect(m1.flags).toEqual({});
  });

  it('écrase un flag existant avec le nouveau tour', () => {
    let m = freshMemory();
    m = setFlag(m, 'foo', 3);
    m = setFlag(m, 'foo', 9);
    expect(m.flags.foo).toBe(9);
  });
});

describe('memoryEngine — markPlayed', () => {
  it('ajoute un scénario à playedScenarios', () => {
    const m = markPlayed(freshMemory(), 'matignon-1936');
    expect(m.playedScenarios).toEqual(['matignon-1936']);
  });

  it('idempotent — ne duplique pas un scénario déjà joué', () => {
    let m = markPlayed(freshMemory(), 'matignon-1936');
    m = markPlayed(m, 'matignon-1936');
    expect(m.playedScenarios).toEqual(['matignon-1936']);
  });

  it('immutable', () => {
    const m1 = freshMemory();
    markPlayed(m1, 'x');
    expect(m1.playedScenarios).toEqual([]);
  });
});

describe('memoryEngine — addAccord & addInstitution', () => {
  it('addAccord ajoute un id', () => {
    const m = addAccord(freshMemory(), 'matignon');
    expect(m.signedMajorAccords).toEqual(['matignon']);
  });

  it('addAccord est idempotent', () => {
    let m = addAccord(freshMemory(), 'matignon');
    m = addAccord(m, 'matignon');
    expect(m.signedMajorAccords).toEqual(['matignon']);
  });

  it('addInstitution ajoute un id', () => {
    const m = addInstitution(freshMemory(), 'secu-1945');
    expect(m.builtInstitutions).toEqual(['secu-1945']);
  });

  it('addInstitution est idempotent', () => {
    let m = addInstitution(freshMemory(), 'secu-1945');
    m = addInstitution(m, 'secu-1945');
    expect(m.builtInstitutions).toEqual(['secu-1945']);
  });
});

describe('memoryEngine — pushLongterm', () => {
  it('empile une conséquence longterm avec scénario + texte + tour', () => {
    const m = pushLongterm(freshMemory(), 'matignon-1936', 'La signature reste dans les annales.', 49);
    expect(m.pendingLongterm).toHaveLength(1);
    expect(m.pendingLongterm[0]).toEqual({
      fromScenario: 'matignon-1936',
      text: 'La signature reste dans les annales.',
      turnPosed: 49
    });
  });

  it('peut empiler plusieurs longterm', () => {
    let m = freshMemory();
    m = pushLongterm(m, 'sc-A', 'A', 1);
    m = pushLongterm(m, 'sc-B', 'B', 2);
    expect(m.pendingLongterm).toHaveLength(2);
  });
});

describe('memoryEngine — consumeChoice (pivot)', () => {
  function mkChoice(opts: {
    id?: string;
    flag?: string;
    longterm?: string;
  } = {}): Choice {
    return {
      id: opts.id ?? 'c1',
      text: 'Test',
      intent: 'Test intent',
      consequence: {
        immediate: 'Immediate',
        longterm: opts.longterm
      },
      effects: {},
      flag: opts.flag
    } as unknown as Choice;
  }

  it('aucun flag ni longterm → mémoire inchangée', () => {
    const m1 = freshMemory();
    const m2 = consumeChoice(m1, 'sc-1', mkChoice(), 5);
    expect(m2).toEqual(m1);
  });

  it('avec flag : pose le flag avec le tour', () => {
    const m = consumeChoice(
      freshMemory(),
      'sc-1',
      mkChoice({ flag: 'corrompu' }),
      7
    );
    expect(m.flags.corrompu).toBe(7);
    expect(m.pendingLongterm).toEqual([]);
  });

  it('avec longterm : empile la conséquence', () => {
    const m = consumeChoice(
      freshMemory(),
      'sc-1',
      mkChoice({ longterm: 'Conséquence à venir' }),
      3
    );
    expect(m.pendingLongterm).toHaveLength(1);
    expect(m.pendingLongterm[0]).toMatchObject({
      fromScenario: 'sc-1',
      text: 'Conséquence à venir',
      turnPosed: 3
    });
  });

  it('avec flag + longterm : applique les deux', () => {
    const m = consumeChoice(
      freshMemory(),
      'sc-pivot',
      mkChoice({ flag: 'choix-pivot', longterm: 'L\'écho persiste.' }),
      11
    );
    expect(m.flags['choix-pivot']).toBe(11);
    expect(m.pendingLongterm).toHaveLength(1);
  });
});
