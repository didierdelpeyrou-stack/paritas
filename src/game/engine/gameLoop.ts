/* Paritas Rebirth — gameLoop.ts
 * Pas pures, sans dépendance Svelte : avance d'un tour, change d'ère, vérifie fin.
 */

import type { RebirthGameState } from '../types';
import { eraForTurn } from '../content/eras';
import { shouldEndEarly } from '../simulation/tensions';

export function advanceTurn(state: RebirthGameState): RebirthGameState {
  const nextTurn = state.turn + 1;
  const nextEra = eraForTurn(nextTurn).id;
  return { ...state, turn: nextTurn, era: nextEra };
}

export function isFinalTurn(state: RebirthGameState): boolean {
  return state.turn > 100 || shouldEndEarly(state);
}
