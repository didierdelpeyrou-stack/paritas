<script lang="ts">
  /* Barre d'état (top du cockpit) — date/ère, mood, notifications,
     settings. Vague α-bis MVP. */
  import type { EraId, SceneMood } from '../../game/types';
  import { sfx } from '../../game/audio/sfx';

  interface Props {
    turn: number;
    era: EraId | null;
    mood: SceneMood | null;
    onOpenSettings?: () => void;
    onToggleClassic?: () => void;
  }
  let { turn, era, mood, onOpenSettings, onToggleClassic }: Props = $props();

  const ERA_LABEL: Record<string, string> = {
    revolution: 'Révolution',
    xixe: 'XIXe siècle',
    belle_epoque: 'Belle Époque',
    entre_deux_guerres: 'Entre-deux-guerres',
    reconstruction: 'Reconstruction',
    guerre_froide: 'Guerre froide',
    trente_glorieuses: 'Trente Glorieuses',
    crise: 'Crises 1973+',
    mitterrand: 'Mitterrand',
    cohabitations: 'Cohabitations',
    sarkozy: 'Sarkozy',
    hollande: 'Hollande',
    macron_i: 'Macron I',
    macron_ii: 'Macron II',
    present: 'Présent'
  };

  const MOOD_ICON: Record<string, string> = {
    calme: '☁',
    tendu: '⚡',
    grave: '🜃',
    euphorique: '🌅',
    melancolique: '🌧'
  };

  const MOOD_LABEL: Record<string, string> = {
    calme: 'Calme',
    tendu: 'Tendu',
    grave: 'Grave',
    euphorique: 'Euphorique',
    melancolique: 'Mélancolique'
  };

  let musicOn = $state(sfx.isMusicEnabled());
  $effect(() => sfx.onMusicChange((v) => (musicOn = v)));

  function toggleMusic() {
    sfx.toggleMusic();
  }
</script>

<header class="status-bar">
  <div class="status-left">
    <span class="clock" aria-hidden="true">
      <!-- Horloge analogique minimaliste SVG -->
      <svg viewBox="0 0 32 32" class="clock-svg">
        <circle cx="16" cy="16" r="14" fill="#1A1411" stroke="#C9B26A" stroke-width="1.2"/>
        <line x1="16" y1="16" x2="16" y2="6" stroke="#C9B26A" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="16" y1="16" x2="22" y2="16" stroke="#F4D58C" stroke-width="1" stroke-linecap="round"/>
        <circle cx="16" cy="16" r="1.4" fill="#C9B26A"/>
      </svg>
    </span>
    <span class="date-era">
      <span class="turn">Tour {turn}</span>
      {#if era}
        <span class="era-sep">·</span>
        <span class="era">{ERA_LABEL[era] ?? era}</span>
      {/if}
    </span>
  </div>

  <div class="status-center">
    {#if mood}
      <span class="mood-chip mood-{mood}" title="Climat émotionnel du scénario">
        <span aria-hidden="true">{MOOD_ICON[mood]}</span>
        <span class="mood-label">{MOOD_LABEL[mood]}</span>
      </span>
    {/if}
  </div>

  <div class="status-right">
    <button type="button" class="status-btn" onclick={toggleMusic}
      title={musicOn ? 'Couper la musique' : 'Lancer la musique'}
      aria-label={musicOn ? 'Couper la musique' : 'Lancer la musique'}>
      {musicOn ? '♫' : '♪'}
    </button>
    {#if onToggleClassic}
      <button type="button" class="status-btn classic-toggle" onclick={onToggleClassic}
        title="Basculer vers l'interface classique"
        aria-label="Basculer vers l'interface classique">
        ⊞
      </button>
    {/if}
    {#if onOpenSettings}
      <button type="button" class="status-btn" onclick={onOpenSettings}
        title="Ouvrir les réglages" aria-label="Réglages">
        ⚙
      </button>
    {/if}
  </div>
</header>

<style>
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
    border-bottom: 1px solid rgba(201, 178, 106, 0.25);
    color: #F4EFE2;
    font-family: 'Cinzel', Georgia, serif;
  }

  .status-left, .status-right {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-width: 0;
  }

  .status-center {
    flex: 1 1 auto;
    display: flex;
    justify-content: center;
    min-width: 0;
  }

  .clock-svg {
    width: 24px;
    height: 24px;
    display: block;
  }

  .date-era {
    display: inline-flex;
    align-items: baseline;
    gap: 0.35rem;
    font-size: 0.85rem;
  }

  .turn {
    color: #F4D58C;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .era-sep {
    color: rgba(201, 178, 106, 0.5);
  }

  .era {
    color: rgba(244, 239, 226, 0.85);
    letter-spacing: 0.04em;
  }

  .mood-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    background: rgba(201, 178, 106, 0.10);
    border: 1px solid rgba(201, 178, 106, 0.30);
    font-size: 0.78rem;
    color: #F4EFE2;
  }

  .mood-label {
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* Subtle glow per mood */
  .mood-calme       { box-shadow: 0 0 12px rgba(0, 200, 220, 0.10); }
  .mood-tendu       { box-shadow: 0 0 12px rgba(220, 100, 60, 0.18); animation: mood-pulse 1.6s ease-in-out infinite; }
  .mood-grave       { box-shadow: 0 0 12px rgba(180, 40, 40, 0.18); }
  .mood-euphorique  { box-shadow: 0 0 12px rgba(244, 213, 140, 0.20); }
  .mood-melancolique { box-shadow: 0 0 14px rgba(120, 80, 180, 0.18); }

  @keyframes mood-pulse {
    0%, 100% { opacity: 0.85; }
    50%      { opacity: 1; }
  }

  .status-btn {
    background: transparent;
    border: 1px solid rgba(201, 178, 106, 0.30);
    color: #F4D58C;
    width: 32px;
    height: 32px;
    border-radius: 0.35rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .status-btn:hover,
  .status-btn:focus-visible {
    background: rgba(201, 178, 106, 0.12);
    border-color: #C9B26A;
    outline: none;
  }

  .classic-toggle {
    font-size: 0.85rem;
  }

  @media (max-width: 600px) {
    .status-bar { padding: 0.4rem 0.6rem; gap: 0.4rem; }
    .era { display: none; }
    .mood-label { display: none; }
  }
</style>
