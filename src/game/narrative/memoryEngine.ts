/* Paritas Rebirth — memoryEngine.ts
 * Gère la mémoire historique du joueur : flags, accords signés, institutions construites,
 * compromis refusés, base trahie, mouvements épuisés, conséquences longterm en attente.
 */

import type { Memory, Choice } from '../types';

export function freshMemory(): Memory {
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

/** Retourne une copie de Memory avec un flag posé. */
export function setFlag(memory: Memory, key: string, turn: number): Memory {
  return { ...memory, flags: { ...memory.flags, [key]: turn } };
}

/** Marque le scénario comme joué. */
export function markPlayed(memory: Memory, scenarioId: string): Memory {
  if (memory.playedScenarios.includes(scenarioId)) return memory;
  return { ...memory, playedScenarios: [...memory.playedScenarios, scenarioId] };
}

/** Ajoute un accord majeur signé. */
export function addAccord(memory: Memory, accordId: string): Memory {
  if (memory.signedMajorAccords.includes(accordId)) return memory;
  return {
    ...memory,
    signedMajorAccords: [...memory.signedMajorAccords, accordId]
  };
}

/** Ajoute une institution construite. */
export function addInstitution(memory: Memory, institutionId: string): Memory {
  if (memory.builtInstitutions.includes(institutionId)) return memory;
  return {
    ...memory,
    builtInstitutions: [...memory.builtInstitutions, institutionId]
  };
}

/** Pose une conséquence longterm en attente, à exposer plus tard. */
export function pushLongterm(
  memory: Memory,
  fromScenario: string,
  text: string,
  turnPosed: number
): Memory {
  return {
    ...memory,
    pendingLongterm: [
      ...memory.pendingLongterm,
      { fromScenario, text, turnPosed }
    ]
  };
}

/** Inspecte un Choice et applique les conséquences mémoire (flag, longterm). */
export function consumeChoice(
  memory: Memory,
  scenarioId: string,
  choice: Choice,
  turn: number
): Memory {
  let next = memory;
  if (choice.flag) next = setFlag(next, choice.flag, turn);
  if (choice.consequence.longterm) {
    next = pushLongterm(next, scenarioId, choice.consequence.longterm, turn);
  }
  return next;
}
