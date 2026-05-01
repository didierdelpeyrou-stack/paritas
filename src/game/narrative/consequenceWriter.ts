/* Paritas Rebirth — consequenceWriter.ts
 * Compose la conséquence finale affichée au joueur à partir :
 *  - du texte écrit à la main dans Choice.consequence.immediate
 *  - d'un résumé compact des deltas chiffrés (en mode Réfléchi)
 *  - d'éventuelles voix intérieures déclenchées par les traits dominants
 */

import type { Choice, Effects, RenderMode, RebirthGameState } from '../types';
import { RESOURCE_LABELS } from '../simulation/resources';
import { ACTOR_LABELS } from '../simulation/actors';

export interface ConsequenceComposition {
  /** Texte principal (toujours présent) */
  text: string;
  /** Résumé numérique court ("Confiance −5 · Caisse +10"), null en mode Compulsif */
  numericSummary: string | null;
  /** Voix intérieure à afficher (rare) */
  voice: string | null;
}

export function composeConsequence(
  state: RebirthGameState,
  choice: Choice,
  mode: RenderMode
): ConsequenceComposition {
  const text = choice.consequence.immediate;
  const numericSummary =
    mode === 'reflechi' ? formatEffectsSummary(choice.effects) : null;
  const voice = pickVoice(state, choice);
  return { text, numericSummary, voice };
}

function formatEffectsSummary(effects: Effects): string | null {
  const parts: string[] = [];
  if (effects.resources) {
    for (const [k, v] of Object.entries(effects.resources)) {
      if (typeof v !== 'number' || v === 0) continue;
      const sign = v > 0 ? '+' : '';
      parts.push(
        `${RESOURCE_LABELS[k as keyof typeof RESOURCE_LABELS]} ${sign}${Math.round(v)}`
      );
    }
  }
  if (effects.actors) {
    for (const [actor, delta] of Object.entries(effects.actors)) {
      if (!delta) continue;
      const sub: string[] = [];
      if (typeof delta.trust === 'number' && delta.trust !== 0) {
        sub.push(`confiance ${delta.trust > 0 ? '+' : ''}${delta.trust}`);
      }
      if (typeof delta.patience === 'number' && delta.patience !== 0) {
        sub.push(`patience ${delta.patience > 0 ? '+' : ''}${delta.patience}`);
      }
      if (sub.length > 0) {
        parts.push(
          `${ACTOR_LABELS[actor as keyof typeof ACTOR_LABELS]} (${sub.join(', ')})`
        );
      }
    }
  }
  return parts.length ? parts.join(' · ') : null;
}

function pickVoice(state: RebirthGameState, choice: Choice): string | null {
  // Si le choix a un fort traitShift sur le trait dominant déjà joueur, on commente.
  if (!choice.traitShift) return null;
  const shift = choice.traitShift[state.dominantTrait] ?? 0;
  if (shift >= 2) {
    return `Tu reconnais ta voix. Cette décision te ressemble.`;
  }
  if (shift <= -2) {
    return `Quelque chose en toi se tord. Tu as agi contre toi-même.`;
  }
  return null;
}
