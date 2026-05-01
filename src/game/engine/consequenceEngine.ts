/* Paritas Rebirth — consequenceEngine.ts
 * Wrapper autour de consequenceWriter : produit le texte final exposé dans
 * la phase 'consequence' du tour, et stocke ce texte dans le state.
 */

import type { Choice, PlayerTrait, RebirthGameState, Scenario, TraitScores } from '../types';
import { composeConsequence } from '../narrative/consequenceWriter';
import { composeNarrativeFallback } from '../narrative/narrativeFallback';
import type { NarrativePromptOutput } from '../narrative/narrativeClient';

export interface TraitShiftSummary {
  /** Trait du delta positif le plus important pour ce choix. */
  trait: PlayerTrait;
  /** Valeur du delta (≥ 1). */
  delta: number;
}

export interface TraitChange {
  from: PlayerTrait;
  to: PlayerTrait;
}

export interface ConsequenceRender {
  text: string;
  numericSummary: string | null;
  voice: string | null;
  innerVoice: string | null;
  newspaperHeadline: string | null;
  memoryLine: string | null;
  enriched: boolean;
  /** Trait le plus poussé par ce choix (peut être null si traitShift vide). */
  traitShift: TraitShiftSummary | null;
  /** Changement de trait dominant déclenché par ce choix (rare, marquant). */
  traitChange: TraitChange | null;
}

export function buildConsequence(
  state: RebirthGameState,
  _scenario: Scenario,
  choice: Choice,
  previousDominantTrait: PlayerTrait
): ConsequenceRender {
  const base = composeConsequence(state, choice, state.mode);
  const traitShift = pickDominantShift(choice.traitShift);
  const traitChange =
    previousDominantTrait !== state.dominantTrait
      ? { from: previousDominantTrait, to: state.dominantTrait }
      : null;
  return {
    text: base.text,
    numericSummary: base.numericSummary,
    voice: base.voice,
    innerVoice: null,
    newspaperHeadline: null,
    memoryLine: null,
    enriched: false,
    traitShift,
    traitChange
  };
}

function pickDominantShift(shifts: Partial<TraitScores> | undefined): TraitShiftSummary | null {
  if (!shifts) return null;
  let bestTrait: PlayerTrait | null = null;
  let bestValue = 0;
  for (const [trait, value] of Object.entries(shifts) as [PlayerTrait, number][]) {
    if (typeof value !== 'number') continue;
    if (value > bestValue) {
      bestValue = value;
      bestTrait = trait;
    }
  }
  if (!bestTrait || bestValue < 1) return null;
  return { trait: bestTrait, delta: bestValue };
}

export function applyNarrativeEnrichment(
  current: ConsequenceRender,
  output: NarrativePromptOutput
): ConsequenceRender {
  const text = output.consequence?.trim() ? output.consequence : current.text;
  return {
    ...current,
    text,
    innerVoice: output.innerVoice ?? current.innerVoice,
    newspaperHeadline: output.newspaperHeadline ?? current.newspaperHeadline,
    memoryLine: output.memoryLine ?? current.memoryLine,
    enriched: true
  };
}

export function applyNarrativeFallback(
  current: ConsequenceRender,
  state: RebirthGameState,
  scenario: Scenario,
  choice: Choice
): ConsequenceRender {
  const fallback = composeNarrativeFallback(state, scenario, choice);
  return {
    ...current,
    innerVoice: fallback.innerVoice ?? current.innerVoice,
    newspaperHeadline: fallback.newspaperHeadline ?? current.newspaperHeadline,
    memoryLine: fallback.memoryLine ?? current.memoryLine,
    enriched: false
  };
}
