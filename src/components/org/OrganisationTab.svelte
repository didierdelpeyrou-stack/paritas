<script lang="ts">
  import OrganizationPanel from './OrganizationPanel.svelte';
  import StrategyPanel from '../strategy/StrategyPanel.svelte';
  import ManifSimulator from './ManifSimulator.svelte';
  import MeetingSimulator from './MeetingSimulator.svelte';
  import FormationTalentsPanel from './FormationTalentsPanel.svelte';
  import type { RebirthGameState } from '../../game/types';
  import type { ActiveStrategy } from '../../game/strategy/types';

  interface Props {
    gameState: RebirthGameState;
  }
  let { gameState }: Props = $props();

  type SubTab = 'vue' | 'manif' | 'meeting' | 'talents';
  let active = $state<SubTab>('vue');

  const TABS: Array<{ id: SubTab; label: string; hint: string }> = [
    { id: 'vue', label: 'Vue', hint: 'Adhérents, factions, actions' },
    { id: 'manif', label: 'Manif', hint: 'Préparer une mobilisation' },
    { id: 'meeting', label: 'Meeting', hint: 'Tenir un discours' },
    { id: 'talents', label: 'Talents', hint: 'Former, affecter' }
  ];
</script>

<div class="sub-tab-bar" role="tablist" aria-label="Onglets de l'organisation">
  {#each TABS as t}
    <button
      type="button"
      role="tab"
      aria-selected={active === t.id}
      data-active={active === t.id}
      onclick={() => (active = t.id)}
      title={t.hint}
    >{t.label}</button>
  {/each}
</div>

<div class="space-y-3">
  {#if active === 'vue'}
    <OrganizationPanel organization={gameState.organization} turn={gameState.turn} />
    <StrategyPanel
      turn={gameState.turn}
      camp={gameState.camp}
      organization={gameState.organization}
      activeStrategies={gameState.activeStrategies as ActiveStrategy[]}
    />
  {:else if active === 'manif'}
    <ManifSimulator {gameState} />
  {:else if active === 'meeting'}
    <MeetingSimulator {gameState} />
  {:else}
    <FormationTalentsPanel {gameState} />
  {/if}
</div>

<style>
  .sub-tab-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    border: 1px solid rgba(237, 228, 201, 0.14);
    border-radius: 0.55rem;
    background: rgba(13, 16, 20, 0.4);
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  .sub-tab-bar button {
    border: 0;
    background: transparent;
    color: rgba(237, 228, 201, 0.55);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.66rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.55rem 0.3rem;
    cursor: pointer;
    min-height: 44px;
    transition: background 0.18s ease, color 0.18s ease;
  }

  .sub-tab-bar button:hover {
    color: #ede4c9;
    background: rgba(201, 154, 64, 0.05);
  }

  .sub-tab-bar button[data-active='true'] {
    color: #f4d58b;
    background: rgba(201, 154, 64, 0.13);
    box-shadow: inset 0 -2px 0 0 #c89b3c;
  }

  .sub-tab-bar button + button {
    border-left: 1px solid rgba(237, 228, 201, 0.07);
  }
</style>
