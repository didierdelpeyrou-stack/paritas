<script lang="ts">
  /**
   * Portrait stylisé d'un acteur abstrait — UX-#5.
   *
   * Neuro : activation FFA (fusiform face area). Une silhouette
   * archétypale (pas un visage photo, pas une icône abstraite)
   * suffit à mobiliser le réseau facial. Six profils typés couvrent
   * les 4 acteurs du jeu + 2 personnages narratifs récurrents.
   *
   * Le tone détermine la posture : neutral (regard frontal),
   * angry (sourcils froncés), supportive (regard incliné), worried
   * (visage incliné / fuyant).
   */
  import type { ActorId } from '../game/types';

  type Tone = 'neutral' | 'angry' | 'supportive' | 'worried';

  interface Props {
    actor: ActorId | 'journaliste' | 'mentor';
    tone?: Tone;
    size?: number;
  }
  let { actor, tone = 'neutral', size = 56 }: Props = $props();

  const SCHEMES: Record<string, { primary: string; accent: string; symbol: string; archetype: string }> = {
    base: {
      primary: '#a52a2a',
      accent: '#f4d58b',
      symbol: 'casquette',
      archetype: 'Militante de base'
    },
    adversaire: {
      primary: '#1e3a5e',
      accent: '#c0c8d4',
      symbol: 'cravate',
      archetype: 'Patron d\'industrie'
    },
    etat: {
      primary: '#4a4d52',
      accent: '#c89b3c',
      symbol: 'rosette',
      archetype: 'Ministre / Préfet'
    },
    opinion: {
      primary: '#7a6a4f',
      accent: '#ede4c9',
      symbol: 'plume',
      archetype: 'Journaliste / Public'
    },
    journaliste: {
      primary: '#7a6a4f',
      accent: '#ede4c9',
      symbol: 'plume',
      archetype: 'Plume de la presse'
    },
    mentor: {
      primary: '#5b3e7f',
      accent: '#f4d58b',
      symbol: 'lunettes',
      archetype: 'Vétéran du mouvement'
    }
  };

  const scheme = $derived(SCHEMES[actor] ?? SCHEMES.base!);
</script>

<svg
  class="portrait"
  width={size}
  height={size}
  viewBox="0 0 56 56"
  data-tone={tone}
  aria-label={scheme.archetype}
>
  <!-- Cercle de fond -->
  <circle cx="28" cy="28" r="26"
          fill="rgba(13,16,20,0.85)"
          stroke={scheme.primary}
          stroke-width="1.5" />

  <!-- Buste / col -->
  <path d="M 12 56 L 12 50 Q 12 42 28 42 Q 44 42 44 50 L 44 56 Z"
        fill={scheme.primary}
        opacity="0.85" />

  <!-- Tête -->
  <ellipse cx="28" cy="26" rx="9" ry="11"
           fill="#d4b88a"
           opacity="0.95" />

  <!-- Cheveux/coiffe selon archétype -->
  {#if actor === 'base'}
    <!-- Casquette ouvrière -->
    <path d="M 18 22 L 18 19 Q 18 14 28 14 Q 38 14 38 19 L 38 22 Z"
          fill={scheme.primary} />
    <rect x="16" y="22" width="24" height="2" fill={scheme.primary} />
  {:else if actor === 'adversaire'}
    <!-- Coiffure stricte + cravate -->
    <path d="M 19 21 Q 19 16 28 16 Q 37 16 37 21 L 37 23 Q 28 19 19 23 Z"
          fill="#2a2a2a" opacity="0.7" />
    <path d="M 26 42 L 30 42 L 32 56 L 24 56 Z" fill={scheme.accent} />
  {:else if actor === 'etat'}
    <!-- Coiffure officielle + écharpe rosette -->
    <path d="M 19 21 Q 19 16 28 16 Q 37 16 37 21 Z"
          fill="#3a3a3a" opacity="0.65" />
    <circle cx="28" cy="48" r="2.4" fill={scheme.accent} />
    <circle cx="28" cy="48" r="1.2" fill={scheme.primary} />
  {:else if actor === 'opinion' || actor === 'journaliste'}
    <!-- Cheveux décoiffés (pensée libre) -->
    <path d="M 18 22 Q 16 14 22 13 Q 25 11 28 12 Q 33 11 36 14 Q 40 18 38 22 Q 32 17 28 18 Q 23 17 18 22 Z"
          fill={scheme.primary} opacity="0.75" />
  {:else if actor === 'mentor'}
    <!-- Lunettes + crâne dégarni (vétéran) -->
    <path d="M 19 22 Q 19 17 28 16 Q 37 17 37 22 L 35 21 Q 28 19 21 21 Z"
          fill="#888" opacity="0.55" />
    <circle cx="24" cy="26" r="2.8" fill="none"
            stroke="rgba(13,16,20,0.85)" stroke-width="1.2" />
    <circle cx="32" cy="26" r="2.8" fill="none"
            stroke="rgba(13,16,20,0.85)" stroke-width="1.2" />
    <line x1="26.8" y1="26" x2="29.2" y2="26"
          stroke="rgba(13,16,20,0.85)" stroke-width="1" />
  {/if}

  <!-- Yeux (sauf mentor déjà avec lunettes) -->
  {#if actor !== 'mentor'}
    {#if tone === 'angry'}
      <line x1="22" y1="25" x2="26" y2="27" stroke="#0d1014" stroke-width="1.4" stroke-linecap="round" />
      <line x1="34" y1="25" x2="30" y2="27" stroke="#0d1014" stroke-width="1.4" stroke-linecap="round" />
    {:else if tone === 'worried'}
      <circle cx="24" cy="26" r="0.9" fill="#0d1014" />
      <circle cx="32" cy="26" r="0.9" fill="#0d1014" />
      <line x1="22" y1="23" x2="26" y2="24.5" stroke="#0d1014" stroke-width="0.9" stroke-linecap="round" />
      <line x1="34" y1="23" x2="30" y2="24.5" stroke="#0d1014" stroke-width="0.9" stroke-linecap="round" />
    {:else}
      <circle cx="24" cy="26" r="1" fill="#0d1014" />
      <circle cx="32" cy="26" r="1" fill="#0d1014" />
    {/if}
  {/if}

  <!-- Bouche selon le ton -->
  {#if tone === 'angry'}
    <path d="M 23 33 Q 28 30 33 33" fill="none" stroke="#0d1014" stroke-width="1.3" stroke-linecap="round" />
  {:else if tone === 'supportive'}
    <path d="M 23 32 Q 28 36 33 32" fill="none" stroke="#0d1014" stroke-width="1.3" stroke-linecap="round" />
  {:else if tone === 'worried'}
    <line x1="25" y1="33" x2="31" y2="33" stroke="#0d1014" stroke-width="1.2" stroke-linecap="round" />
  {:else}
    <path d="M 24 33 Q 28 34 32 33" fill="none" stroke="#0d1014" stroke-width="1.1" stroke-linecap="round" />
  {/if}
</svg>

<style>
  .portrait {
    display: inline-block;
    flex-shrink: 0;
  }

  .portrait[data-tone='angry'] {
    filter: drop-shadow(0 0 6px rgba(220, 38, 38, 0.35));
  }

  .portrait[data-tone='supportive'] {
    filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.3));
  }

  .portrait[data-tone='worried'] {
    filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.3));
  }
</style>
