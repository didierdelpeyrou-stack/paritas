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

/* === Antagonismes de traits (style CK3) ===
 * Chaque trait a un antagoniste fort. Agir contre son trait dominant
 * (ou pousser son antagoniste) génère du stress de personnalité.
 * Aligné = renforce le trait dominant → soulage. */
export const TRAIT_ANTAGONISTS: Record<PlayerTrait, PlayerTrait> = {
  rupture: 'pragmatique',     // tu ne peux pas être à la fois insurgé et négociateur
  pragmatique: 'rupture',
  tribun: 'technocrate',      // la rue contre le dossier
  technocrate: 'tribun',
  batisseur: 'paternaliste',  // institutions partagées vs autorité descendante
  paternaliste: 'batisseur'
};

/**
 * Calcule le delta de stress de personnalité induit par un choix.
 * - +6 par point d'antagoniste poussé
 * - −2 par point du trait dominant renforcé (au-delà de 1)
 * - +4 si le trait dominant lui-même perd ≥2 points
 *
 * Renvoie le delta brut (positif = ça tend, négatif = ça soulage).
 */
export function computeStressDelta(
  shift: Partial<TraitScores> | undefined,
  dominantTrait: PlayerTrait
): number {
  if (!shift) return 0;
  let delta = 0;
  const antagonist = TRAIT_ANTAGONISTS[dominantTrait];
  const dominantPush = shift[dominantTrait] ?? 0;
  const antagonistPush = shift[antagonist] ?? 0;

  if (antagonistPush > 0) delta += antagonistPush * 6;
  if (dominantPush <= -2) delta += 4;
  if (dominantPush >= 2) delta -= 2;
  return delta;
}

/** Bornes pour la jauge de stress de personnalité (0-100). */
export function clampStress(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/** Niveau qualitatif du stress, pour l'UI. */
export function stressLevel(value: number): {
  level: 'serein' | 'inquiet' | 'tendu' | 'effondré';
  label: string;
  hint: string;
} {
  if (value < 25) {
    return {
      level: 'serein',
      label: 'Serein·e',
      hint: 'Tes actes te ressemblent. Tu agis dans le sens de ton trait dominant.'
    };
  }
  if (value < 55) {
    return {
      level: 'inquiet',
      label: 'Inquiet·e',
      hint: 'Quelques décisions qui ne te ressemblent pas. Tu sens la dissonance.'
    };
  }
  if (value < 80) {
    return {
      level: 'tendu',
      label: 'En tension',
      hint: 'Tu as agi trop souvent contre toi-même. Le doute s\'installe.'
    };
  }
  return {
    level: 'effondré',
    label: 'Au bord de la rupture',
    hint: 'Tu n\'es plus celui que tu pensais être. Le miroir devient étranger.'
  };
}

