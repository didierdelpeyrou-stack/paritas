/* Paritas Rebirth — consequenceEngine.ts
 * Wrapper autour de consequenceWriter : produit le texte final exposé dans
 * la phase 'consequence' du tour, et stocke ce texte dans le state.
 */

import type { Choice, RebirthGameState, Scenario } from '../types';
import { composeConsequence } from '../narrative/consequenceWriter';
import { composeNarrativeFallback } from '../narrative/narrativeFallback';
import type { NarrativePromptOutput } from '../narrative/narrativeClient';

export interface ConsequenceRender {
  text: string;
  numericSummary: string | null;
  voice: string | null;
  innerVoice: string | null;
  newspaperHeadline: string | null;
  memoryLine: string | null;
  enriched: boolean;
}

export function buildConsequence(
  state: RebirthGameState,
  _scenario: Scenario,
  choice: Choice
): ConsequenceRender {
  const base = composeConsequence(state, choice, state.mode);
  return {
    text: base.text,
    numericSummary: base.numericSummary,
    voice: base.voice,
    innerVoice: null,
    newspaperHeadline: null,
    memoryLine: null,
    enriched: false
  };
}

export function applyNarrativeEnrichment(
  current: ConsequenceRender,
  output: NarrativePromptOutput
): ConsequenceRender {
  return {
    ...current,
    text: output.consequence,
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
