/* Paritas Rebirth — gameLoop.ts
 * Pas pures, sans dépendance Svelte : avance d'un tour, change d'ère, vérifie fin.
 */

import type { RebirthGameState, ScheduledActorCallback } from '../types';
import { eraForTurn } from '../content/eras';
import { shouldEndEarly } from '../simulation/tensions';
import {
  dueActorCallbacks,
  consumeActorCallbacks
} from './consequenceEngine';

export function advanceTurn(state: RebirthGameState): RebirthGameState {
  const nextTurn = state.turn + 1;
  const nextEra = eraForTurn(nextTurn).id;
  return { ...state, turn: nextTurn, era: nextEra };
}

export function isFinalTurn(state: RebirthGameState): boolean {
  return state.turn > 100 || shouldEndEarly(state);
}

/* P1-10-branch (ORDA-013, AAR bêta-30 §V — Fåhraeus #09, Romero #05) :
   Déclenchement automatique des callbacks acteurs au début de chaque tour.

   À appeler par le store gameState juste après advanceTurn() → on récupère
   les callbacks dus au nouveau tour, ils sont consommés (retirés de la
   file) et retournés pour affichage par l'appelant (typiquement le
   ticker causal et/ou le journal).

   Pure function : ne mute pas le state d'entrée. Retourne un nouveau
   state avec scheduledActorCallbacks filtré + la liste des callbacks
   à afficher au tour courant. */
export interface TurnCallbacksResult {
  state: RebirthGameState;
  triggered: ScheduledActorCallback[];
}

export function processTurnCallbacks(state: RebirthGameState): TurnCallbacksResult {
  const due = dueActorCallbacks(state.memory, state.turn);
  if (due.length === 0) {
    return { state, triggered: [] };
  }
  /* Clone defensif de memory pour ne pas muter le state d'entrée. */
  const nextMemory = {
    ...state.memory,
    scheduledActorCallbacks: [...(state.memory.scheduledActorCallbacks ?? [])]
  };
  consumeActorCallbacks(nextMemory, due);
  return {
    state: { ...state, memory: nextMemory },
    triggered: due
  };
}
