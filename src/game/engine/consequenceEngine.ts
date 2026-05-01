/* Paritas Rebirth — consequenceEngine.ts
 * Wrapper autour de consequenceWriter : produit le texte final exposé dans
 * la phase 'consequence' du tour, et stocke ce texte dans le state.
 */

import type { Choice, RebirthGameState } from '../types';
import { composeConsequence } from '../narrative/consequenceWriter';

export interface ConsequenceRender {
  text: string;
  numericSummary: string | null;
  voice: string | null;
}

export function buildConsequence(
  state: RebirthGameState,
  choice: Choice
): ConsequenceRender {
  return composeConsequence(state, choice, state.mode);
}
