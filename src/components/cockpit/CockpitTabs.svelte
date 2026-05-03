<script lang="ts">
  /* Tabs latéraux du cockpit — colonnes gauche (4) + droite (5).
     Onglets en cuir rivetés. Au clic : ouvre le panneau correspondant
     en glissant depuis le côté. Vague α-bis MVP. */
  import { cockpit } from '$lib/stores/cockpit.svelte';

  interface Props {
    side: 'left' | 'right';
    /** Tour actuel — pour la révélation progressive (Norman). */
    turn: number;
    /** Notification badges par tab id. */
    badges?: Record<string, number>;
  }
  let { side, turn, badges = {} }: Props = $props();

  interface Tab {
    id: string;
    icon: string;
    label: string;
    /** Tour minimum de déverrouillage (Norman révélation progressive). */
    unlockAt: number;
    /** Couleur d'accent. */
    accent: string;
  }

  /* Mapping onglets selon V2 spec §9.5 :
     Gauche : Trésorerie, Mandat, Monde, Manifestation
     Droite : Organisation, Talents, Meeting, Journal, Settings */
  const LEFT_TABS: Tab[] = [
    { id: 'tresorerie',    icon: '💰', label: 'Trésorerie',    unlockAt: 1,  accent: '#C9B26A' },
    { id: 'mandat',        icon: '🏛',  label: 'Mandat',        unlockAt: 5,  accent: '#8B1F1B' },
    { id: 'monde',         icon: '🌍', label: 'Monde',         unlockAt: 30, accent: '#1E5C8A' },
    { id: 'manifestation', icon: '✊',  label: 'Manifestation', unlockAt: 18, accent: '#D9821C' }
  ];
  const RIGHT_TABS: Tab[] = [
    { id: 'organisation', icon: '🏢', label: 'Organisation', unlockAt: 12, accent: '#993D1A' },
    { id: 'talents',      icon: '🎓', label: 'Talents',      unlockAt: 8,  accent: '#3A6B47' },
    { id: 'meeting',      icon: '📢', label: 'Meeting',      unlockAt: 25, accent: '#5C2D5C' },
    { id: 'journal',      icon: '📓', label: 'Journal',      unlockAt: 1,  accent: '#7A5C3A' },
    { id: 'settings',     icon: '⚙',  label: 'Réglages',     unlockAt: 1,  accent: '#A8A095' }
  ];

  let tabs = $derived(side === 'left' ? LEFT_TABS : RIGHT_TABS);

  function clickTab(tab: Tab) {
    if (turn < tab.unlockAt) return;
    cockpit.open(tab.id);
  }
</script>

<nav class="tabs-column tabs-{side}" aria-label="{side === 'left' ? 'Mini-jeux gauche' : 'Mini-jeux droite et journal'}">
  {#each tabs as tab}
    {@const locked = turn < tab.unlockAt}
    {@const active = cockpit.openTab === tab.id}
    {@const badge = badges[tab.id] ?? 0}
    <button
      type="button"
      class="tab"
      class:locked
      class:active
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
      <span class="tab-icon" aria-hidden="true">{tab.icon}</span>
      <span class="tab-label">{tab.label}</span>
      {#if badge > 0 && !locked}
        <span class="tab-badge" aria-label="{badge} notifications">{badge > 9 ? '9+' : badge}</span>
      {/if}
      {#if locked}
        <span class="tab-lock" aria-hidden="true">🔒</span>
      {/if}
    </button>
  {/each}
</nav>

<style>
  .tabs-column {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.6rem 0.3rem;
    background: rgba(45, 26, 13, 0.4);
  }

  .tabs-left {
    border-right: 1px solid rgba(201, 178, 106, 0.20);
  }

  .tabs-right {
    border-left: 1px solid rgba(201, 178, 106, 0.20);
  }

  .tab {
    --tab-accent: #C9B26A;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    padding: 0.55rem 0.35rem;
    background: linear-gradient(180deg, #4A2E1A 0%, #3D2615 100%);
    border: 1px solid rgba(140, 110, 64, 0.4);
    border-radius: 0.4rem;
    color: rgba(244, 213, 140, 0.78);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
    min-width: 56px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 -1px 1px rgba(0, 0, 0, 0.2);
    transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
  }

  .tab::before {
    /* Rivet supérieur — texture cuir */
    content: '';
    position: absolute;
    top: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(201, 178, 106, 0.4);
    box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.3);
  }

  .tab:hover:not(.locked):not(.active) {
    transform: translateX(2px);
    border-color: var(--tab-accent);
    color: #F4D58C;
  }

  .tabs-right .tab:hover:not(.locked):not(.active) {
    transform: translateX(-2px);
  }

  .tab.active {
    background: linear-gradient(180deg, #5C3622 0%, #4A2E1A 100%);
    border-color: var(--tab-accent);
    color: var(--tab-accent);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      0 0 12px color-mix(in srgb, var(--tab-accent) 35%, transparent);
  }

  .tab.locked {
    opacity: 0.45;
    cursor: not-allowed;
    background: linear-gradient(180deg, #2A1810 0%, #1F1108 100%);
  }

  .tab-icon {
    font-size: 1.1rem;
    line-height: 1;
  }

  .tab-label {
    line-height: 1.1;
    text-align: center;
    word-break: keep-all;
  }

  .tab-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #B0181E;
    color: #F4EFE2;
    font-size: 0.62rem;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #1A1411;
    animation: badge-pulse 1.6s ease-in-out infinite;
  }

  .tab-lock {
    position: absolute;
    bottom: 4px;
    right: 4px;
    font-size: 0.6rem;
    opacity: 0.6;
  }

  @keyframes badge-pulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.12); }
  }
</style>
