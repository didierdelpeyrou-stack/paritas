<script lang="ts">
  /* ============================================================
     CockpitTabs — onglets latéraux du cockpit (vague α-bis V2)
     ============================================================
     9 onglets en cuir riveté (4 G + 5 D) avec icônes SVG paritaires
     custom. Animations nudge stables (Cooper #13, Frost #190,
     Vignelli #8 sobriété).

     Révélation Norman : déverrouillage progressif par tour, avec
     animation halo doré au moment du déverrouillage.
     ============================================================ */
  import { fly, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { cockpit } from '$lib/stores/cockpit.svelte';
  import CockpitIcon from './CockpitIcon.svelte';
  import type { IconKey } from './icons';

  interface Props {
    side: 'left' | 'right';
    turn: number;
    badges?: Record<string, number>;
  }
  let { side, turn, badges = {} }: Props = $props();

  interface Tab {
    id: string;
    icon: IconKey;
    label: string;
    unlockAt: number;
    accent: string;
  }

  /* Gauche (4) : Trésorerie, Mandat, Monde, Manifestation
     Droite (5) : Organisation, Talents, Meeting, Journal, Settings */
  const LEFT_TABS: Tab[] = [
    { id: 'tresorerie',    icon: 'sceau',    label: 'Trésorerie',    unlockAt: 1,  accent: '#C9B26A' },
    { id: 'mandat',        icon: 'urne',     label: 'Mandat',        unlockAt: 5,  accent: '#8B1F1B' },
    { id: 'monde',         icon: 'hexagone', label: 'Monde',         unlockAt: 30, accent: '#1E5C8A' },
    { id: 'manifestation', icon: 'poing',    label: 'Manifestation', unlockAt: 18, accent: '#D9821C' }
  ];
  const RIGHT_TABS: Tab[] = [
    { id: 'organisation', icon: 'bourse',    label: 'Organisation', unlockAt: 12, accent: '#993D1A' },
    { id: 'talents',      icon: 'cocarde',   label: 'Talents',      unlockAt: 8,  accent: '#3A6B47' },
    { id: 'meeting',      icon: 'pupitre',   label: 'Meeting',      unlockAt: 25, accent: '#5C2D5C' },
    { id: 'journal',      icon: 'parchemin', label: 'Journal',      unlockAt: 1,  accent: '#7A5C3A' },
    { id: 'settings',     icon: 'rouage',    label: 'Réglages',     unlockAt: 1,  accent: '#A8A095' }
  ];

  let tabs = $derived(side === 'left' ? LEFT_TABS : RIGHT_TABS);

  /* Pour animation halo de déverrouillage : on retient les ids déjà
     vus déverrouillés. Si turn franchit le seuil, on fait un pulse. */
  let recentlyUnlocked = $state(new Set<string>());
  let lastSeen = $state<Record<string, boolean>>({});
  $effect(() => {
    const t = turn;
    for (const tab of tabs) {
      const unlocked = t >= tab.unlockAt;
      const wasUnlocked = lastSeen[tab.id];
      if (unlocked && !wasUnlocked && wasUnlocked !== undefined) {
        // Premier déverrouillage en cours de partie
        recentlyUnlocked.add(tab.id);
        recentlyUnlocked = new Set(recentlyUnlocked);
        setTimeout(() => {
          recentlyUnlocked.delete(tab.id);
          recentlyUnlocked = new Set(recentlyUnlocked);
        }, 2400);
      }
      lastSeen[tab.id] = unlocked;
    }
  });

  function clickTab(tab: Tab) {
    if (turn < tab.unlockAt) return;
    cockpit.open(tab.id);
  }
</script>

<nav class="tabs-column tabs-{side}"
  aria-label="{side === 'left' ? 'Mini-jeux gauche' : 'Mini-jeux droite et journal'}">
  {#each tabs as tab}
    {@const locked = turn < tab.unlockAt}
    {@const active = cockpit.openTab === tab.id}
    {@const badge = badges[tab.id] ?? 0}
    {@const justUnlocked = recentlyUnlocked.has(tab.id)}
    <button
      type="button"
      class="tab"
      class:locked
      class:active
      class:just-unlocked={justUnlocked}
      style:--tab-accent={tab.accent}
      onclick={() => clickTab(tab)}
      disabled={locked}
      title={locked
        ? `${tab.label} — déverrouillé au tour ${tab.unlockAt}`
        : tab.label}
      aria-label={locked
        ? `${tab.label} verrouillé jusqu'au tour ${tab.unlockAt}`
        : `Ouvrir ${tab.label}`}
    >
      <span class="tab-icon-wrap">
        <CockpitIcon name={tab.icon} size={22} />
      </span>
      <span class="tab-label">{tab.label}</span>
      {#if badge > 0 && !locked}
        <span class="tab-badge"
          in:scale={{ duration: 220, easing: cubicOut, start: 0.6 }}
          aria-label="{badge} notifications">
          {badge > 9 ? '9+' : badge}
        </span>
      {/if}
      {#if locked}
        <span class="tab-lock" aria-hidden="true">⌐</span>
      {/if}
      {#if justUnlocked}
        <span class="unlock-halo" aria-hidden="true"></span>
      {/if}
    </button>
  {/each}
</nav>

<style>
  .tabs-column {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 0.4rem;
    padding: 0.6rem 0.35rem;
    background: linear-gradient(
      180deg,
      rgba(45, 26, 13, 0.55) 0%,
      rgba(30, 18, 10, 0.55) 100%
    );
    width: 80px;
    flex-shrink: 0;
  }

  .tabs-left {
    border-right: 1px solid rgba(201, 178, 106, 0.20);
    box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.3);
  }

  .tabs-right {
    border-left: 1px solid rgba(201, 178, 106, 0.20);
    box-shadow: inset 1px 0 0 rgba(0, 0, 0, 0.3);
  }

  .tab {
    --tab-accent: #C9B26A;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.55rem 0.25rem 0.5rem;
    background: linear-gradient(180deg, #4A2E1A 0%, #3D2615 100%);
    border: 1px solid rgba(140, 110, 64, 0.35);
    border-radius: 0.4rem;
    color: rgba(244, 213, 140, 0.78);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 -1px 1px rgba(0, 0, 0, 0.2),
      0 1px 2px rgba(0, 0, 0, 0.18);
    transition:
      transform 0.22s cubic-bezier(0.34, 1.2, 0.64, 1),
      border-color 0.18s ease,
      background 0.22s ease,
      color 0.18s ease,
      box-shadow 0.22s ease;
  }

  /* Rivet supérieur — texture cuir, signature Paritas */
  .tab::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(201, 178, 106, 0.4);
    box-shadow:
      inset 0 1px 0 rgba(0, 0, 0, 0.4),
      0 1px 0 rgba(255, 255, 255, 0.15);
  }

  /* Nudge animation : translation douce vers l'intérieur du Ciel
     (le geste signale "je vais ouvrir vers la zone centrale") */
  .tab:not(.locked):not(.active):hover,
  .tab:not(.locked):not(.active):focus-visible {
    transform: translateX(3px);
    border-color: var(--tab-accent);
    color: #F4D58C;
    background: linear-gradient(180deg, #553420 0%, #422A18 100%);
    outline: none;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      inset 0 -1px 1px rgba(0, 0, 0, 0.2),
      0 2px 6px rgba(0, 0, 0, 0.25),
      -2px 0 8px color-mix(in srgb, var(--tab-accent) 18%, transparent);
  }

  .tabs-right .tab:not(.locked):not(.active):hover,
  .tabs-right .tab:not(.locked):not(.active):focus-visible {
    transform: translateX(-3px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      inset 0 -1px 1px rgba(0, 0, 0, 0.2),
      0 2px 6px rgba(0, 0, 0, 0.25),
      2px 0 8px color-mix(in srgb, var(--tab-accent) 18%, transparent);
  }

  .tab.active {
    background: linear-gradient(180deg, #5C3622 0%, #4A2E1A 100%);
    border-color: var(--tab-accent);
    color: var(--tab-accent);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.14),
      inset 0 -1px 1px rgba(0, 0, 0, 0.2),
      0 0 14px color-mix(in srgb, var(--tab-accent) 38%, transparent);
  }

  .tab.locked {
    opacity: 0.4;
    cursor: not-allowed;
    background: linear-gradient(180deg, #2A1810 0%, #1F1108 100%);
    color: rgba(244, 213, 140, 0.45);
  }

  .tab.locked:hover {
    transform: none;
  }

  .tab-icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: inherit;
  }

  .tab.active .tab-icon-wrap {
    color: var(--tab-accent);
    transform: scale(1.04);
  }

  .tab-label {
    line-height: 1.05;
    text-align: center;
    word-break: keep-all;
    font-size: 0.6rem;
  }

  .tab-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: linear-gradient(180deg, #C12B30 0%, #8B1F1B 100%);
    color: #F4EFE2;
    font-size: 0.6rem;
    font-weight: 700;
    min-width: 17px;
    height: 17px;
    padding: 0 4px;
    border-radius: 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(0, 0, 0, 0.3);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    /* Pulse sobre — pas hyperactif (Vignelli #8) */
    animation: badge-tick 2.4s ease-in-out infinite;
  }

  .tab-lock {
    position: absolute;
    bottom: 4px;
    right: 6px;
    font-size: 0.65rem;
    opacity: 0.55;
  }

  /* Halo doré au moment du déverrouillage Norman */
  .tab.just-unlocked .unlock-halo {
    position: absolute;
    inset: -4px;
    border-radius: 0.55rem;
    pointer-events: none;
    background: radial-gradient(
      circle at center,
      rgba(244, 213, 140, 0.45) 0%,
      rgba(244, 213, 140, 0) 70%
    );
    animation: unlock-pulse 2.4s ease-out forwards;
  }

  @keyframes badge-tick {
    0%, 88%, 100% { transform: scale(1); }
    92%           { transform: scale(1.10); }
  }

  @keyframes unlock-pulse {
    0%   { opacity: 0; transform: scale(0.92); }
    25%  { opacity: 1; transform: scale(1.18); }
    100% { opacity: 0; transform: scale(1.6); }
  }

  /* Mobile : tabs masqués, ouverts via burger drawer dans Shell */
  @media (max-width: 768px) {
    .tabs-column {
      display: none;
    }
  }
</style>
