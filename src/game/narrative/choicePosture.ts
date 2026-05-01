/* Paritas — choicePosture.ts
 * Each choice carries an implicit posture derived from the trait it pushes.
 * Postures are surfaced in the UI as distinct visual signatures (color,
 * glyph, animation), so the three options of a scene never look alike.
 */

import type { Choice, PlayerTrait, ResourceKey } from '../types';

export type Posture =
  | 'rupture'
  | 'institution'
  | 'compromis'
  | 'expertise'
  | 'opinion'
  | 'paternaliste'
  | 'neutre';

const TRAIT_TO_POSTURE: Record<PlayerTrait, Posture> = {
  rupture: 'rupture',
  batisseur: 'institution',
  pragmatique: 'compromis',
  technocrate: 'expertise',
  tribun: 'opinion',
  paternaliste: 'paternaliste'
};

export function derivePosture(choice: Choice): Posture {
  const shifts = choice.traitShift;
  if (!shifts) return 'neutre';
  let bestTrait: PlayerTrait | null = null;
  let bestValue = -Infinity;
  for (const [trait, value] of Object.entries(shifts) as [PlayerTrait, number][]) {
    if (typeof value !== 'number') continue;
    if (value > bestValue) {
      bestValue = value;
      bestTrait = trait;
    }
  }
  if (!bestTrait || bestValue <= 0) return 'neutre';
  return TRAIT_TO_POSTURE[bestTrait];
}

export interface PostureStyle {
  label: string;
  glyph: string;
  /** CSS variable values, applied via `style="..."` on the button. */
  accent: string;
  accentSoft: string;
  accentMuted: string;
}

export const POSTURE_STYLES: Record<Posture, PostureStyle> = {
  rupture: {
    label: 'Rupture',
    glyph: '⚡',
    accent: '#d96a5b',
    accentSoft: 'rgba(217, 106, 91, 0.12)',
    accentMuted: 'rgba(217, 106, 91, 0.45)'
  },
  institution: {
    label: 'Institution',
    glyph: '◈',
    accent: '#7eb4ff',
    accentSoft: 'rgba(126, 180, 255, 0.1)',
    accentMuted: 'rgba(126, 180, 255, 0.45)'
  },
  compromis: {
    label: 'Compromis',
    glyph: '◯',
    accent: '#c89b3c',
    accentSoft: 'rgba(200, 155, 60, 0.1)',
    accentMuted: 'rgba(200, 155, 60, 0.45)'
  },
  expertise: {
    label: 'Expertise',
    glyph: '⌬',
    accent: '#8db4a8',
    accentSoft: 'rgba(141, 180, 168, 0.1)',
    accentMuted: 'rgba(141, 180, 168, 0.45)'
  },
  opinion: {
    label: 'Opinion',
    glyph: '✶',
    accent: '#b497d6',
    accentSoft: 'rgba(180, 151, 214, 0.1)',
    accentMuted: 'rgba(180, 151, 214, 0.45)'
  },
  paternaliste: {
    label: 'Paternalisme',
    glyph: '⌂',
    accent: '#7aa37a',
    accentSoft: 'rgba(122, 163, 122, 0.1)',
    accentMuted: 'rgba(122, 163, 122, 0.45)'
  },
  neutre: {
    label: 'Choix',
    glyph: '·',
    accent: '#ede4c9',
    accentSoft: 'rgba(237, 228, 201, 0.05)',
    accentMuted: 'rgba(237, 228, 201, 0.25)'
  }
};

export interface ResourcePreview {
  resource: ResourceKey;
  direction: 'up' | 'down';
  magnitude: 'minor' | 'major';
}

const RESOURCE_GLYPH: Record<ResourceKey, string> = {
  confiance: '◉',
  caisse: '◐',
  santeSociale: '✚',
  legitimite: '✦',
  rapportDeForce: '✕',
  institution: '◈'
};

export function previewResources(choice: Choice): ResourcePreview[] {
  const deltas = choice.effects.resources;
  if (!deltas) return [];
  const out: ResourcePreview[] = [];
  for (const [resource, value] of Object.entries(deltas) as [ResourceKey, number][]) {
    if (typeof value !== 'number' || value === 0) continue;
    out.push({
      resource,
      direction: value > 0 ? 'up' : 'down',
      magnitude: Math.abs(value) >= 5 ? 'major' : 'minor'
    });
  }
  return out;
}

export function resourceGlyph(resource: ResourceKey): string {
  return RESOURCE_GLYPH[resource];
}

export const RESOURCE_SHORT_LABEL: Record<ResourceKey, string> = {
  confiance: 'confiance',
  caisse: 'caisse',
  santeSociale: 'santé soc.',
  legitimite: 'légitimité',
  rapportDeForce: 'rapport de force',
  institution: 'institution'
};
