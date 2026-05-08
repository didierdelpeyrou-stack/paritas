/* Paritas Rebirth — gameLoop.ts
 * Pas pures, sans dépendance Svelte : avance d'un tour, change d'ère, vérifie fin.
 */

import type { RebirthGameState, ScheduledActorCallback } from '../types';
import { eraForTurn } from '../content/eras';
import { shouldEndEarly } from '../simulation/tensions';
import { applyResourceDelta } from '../simulation/resources';
import { applyActorsDelta } from '../simulation/actors';
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
  /* P1 Muratori-13 (Sapeurs ORDA-017 PARITAS) — consumeActorCallbacks
     est désormais pure : retourne un nouveau Memory sans mutation. */
  const nextMemory = consumeActorCallbacks(state.memory, due);

  /* P0 Pope-04 (Sapeurs ORDA-015) — applique les effets numériques
     éventuels portés par chaque callback. La mémoire des acteurs cesse
     d'être purement narrative : un Frachon qui te félicite +5 trust,
     une base trahie -3 patience. Les effets s'empilent dans l'ordre
     de la file (FIFO). */
  let nextResources = state.resources;
  let nextActors = state.actors;
  for (const cb of due) {
    if (!cb.effects) continue;
    if (cb.effects.resources) {
      nextResources = applyResourceDelta(nextResources, cb.effects.resources);
    }
    if (cb.effects.actors) {
      nextActors = applyActorsDelta(nextActors, cb.effects.actors);
    }
  }

  return {
    state: {
      ...state,
      memory: nextMemory,
      resources: nextResources,
      actors: nextActors
    },
    triggered: due
  };
}
