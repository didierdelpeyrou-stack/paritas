/* ============================================================
   P1-1 (ORDA-008/009, AAR bêta-30 §V) — Launch presets

   FG-5 (Goodwin #12, Camille #27, Jules #26, Léa #20, Aïcha #23,
   Duflo #11) : 3 modes au launch — pédagogique / équilibré / littéraire.

   Chaque preset configure simultanément :
   - Le mode narratif (RenderMode : reflechi / compulsif)
   - Le preset a11y cognitive (line-height généreuse, ticker pause)

   Pédagogique → reflechi + a11y-cognitive ON  (jeunes curieux, scolaire)
   Équilibré   → reflechi + a11y-cognitive OFF (par défaut, public général)
   Littéraire  → compulsif + a11y-cognitive OFF (Disco-grade, Camille)

   Le preset n'est pas stocké en gameState — c'est un raccourci UX qui
   pré-coche les options. L'utilisateur peut toujours dévier dans
   Settings après. C'est le comportement validé en FG-5.
   ============================================================ */

import type { RenderMode } from '../../game/types';

export type LaunchPreset = 'pedagogical' | 'balanced' | 'literary';

export const LAUNCH_PRESET_META: Record<LaunchPreset, {
  label: string;
  short: string;
  desc: string;
  audience: string;
}> = {
  pedagogical: {
    label: 'Pédagogique',
    short: 'Pédago',
    desc: 'Lecture aérée, glossaire au survol, mode Réfléchi avec rappels théoriques.',
    audience: 'Lycéen, étudiant·e curieux·se, atelier scolaire'
  },
  balanced: {
    label: 'Équilibré',
    short: 'Équilibré',
    desc: 'Mode Réfléchi par défaut. Pas de filtre cognitif imposé. Tu choisis tes options dans Settings.',
    audience: 'Joueur lambda, première partie'
  },
  literary: {
    label: 'Littéraire',
    short: 'Littéraire',
    desc: 'Mode Compulsif : voix intérieures, suspense, moins de filets. Disco-grade.',
    audience: 'Lecteur de Disco Elysium, sociologue, profil exigeant'
  }
};

const COGNITIVE_KEY = 'paritas_cognitive_friendly';

/**
 * Applique un launch preset : configure le DOM + localStorage, retourne
 * le RenderMode à passer au gameState.
 */
export function applyLaunchPreset(preset: LaunchPreset): { mode: RenderMode } {
  if (typeof document === 'undefined') {
    /* SSR/test : juste retourner le mode, pas de side-effect DOM. */
    return { mode: preset === 'literary' ? 'compulsif' : 'reflechi' };
  }
  const root = document.documentElement;

  switch (preset) {
    case 'pedagogical':
      root.classList.add('a11y-cognitive');
      try { localStorage.setItem(COGNITIVE_KEY, 'true'); } catch { /* noop */ }
      return { mode: 'reflechi' };

    case 'literary':
      /* Pas de cognitive forcé — laisse le réglage utilisateur intact
         si déjà OFF, retire-le si déjà ON pour respecter l'esprit
         "moins de filets" du mode littéraire. */
      root.classList.remove('a11y-cognitive');
      try { localStorage.setItem(COGNITIVE_KEY, 'false'); } catch { /* noop */ }
      return { mode: 'compulsif' };

    case 'balanced':
    default:
      /* Default : garde le cognitive courant tel qu'il est, mode reflechi. */
      return { mode: 'reflechi' };
  }
}
