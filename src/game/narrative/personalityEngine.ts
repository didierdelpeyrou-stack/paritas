/* Paritas Rebirth — personalityEngine.ts
 * Fait évoluer le profil du joueur en agrégeant les traitShift au fil des choix.
 */

import type { PlayerTrait, TraitScores } from '../types';
import { ALL_TRAITS } from '../types';

export function freshTraits(): TraitScores {
  return {
    batisseur: 0,
    rupture: 0,
    technocrate: 0,
    pragmatique: 0,
    paternaliste: 0,
    tribun: 0
  };
}

export function applyTraitShift(
  traits: TraitScores,
  shift: Partial<TraitScores>
): TraitScores {
  const next = { ...traits };
  for (const t of Object.keys(shift) as PlayerTrait[]) {
    next[t] = next[t] + (shift[t] ?? 0);
  }
  return next;
}

/** Calcule le trait dominant à partir des scores cumulés. */
export function computeDominantTrait(traits: TraitScores): PlayerTrait {
  let dominant: PlayerTrait = 'pragmatique';
  let max = -Infinity;
  for (const t of ALL_TRAITS) {
    if (traits[t] > max) {
      max = traits[t];
      dominant = t;
    }
  }
  return dominant;
}

export const TRAIT_LABELS: Record<PlayerTrait, string> = {
  batisseur: 'Bâtisseur',
  rupture: 'Rupture',
  technocrate: 'Technocrate',
  pragmatique: 'Pragmatique',
  paternaliste: 'Paternaliste',
  tribun: 'Tribun'
};

export const TRAIT_BLURBS: Record<PlayerTrait, string> = {
  batisseur:
    'Tu construis. Ta foi est dans les institutions durables : caisses, conventions, accords.',
  rupture:
    'Tu romps. Tu refuses le compromis qui dilue. La grève, l\'insurrection, l\'abandon.',
  technocrate:
    'Tu maîtrises le dossier. Tu négocies par chiffres, par lettres, par directives.',
  pragmatique:
    'Tu sauves ce qui peut l\'être. La perfection est l\'ennemie du possible.',
  paternaliste:
    'Tu sais ce qui est bon pour les tiens. Tu ordonnes, tu protèges, tu décides.',
  tribun:
    'Tu parles aux foules. Ta force, c\'est la voix qui rassemble dans la rue.'
};
