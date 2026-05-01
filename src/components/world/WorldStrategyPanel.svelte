<script lang="ts">
  import type { WorldAIState } from '../../game/ai/types';
  import { CYCLE_LABELS, FACTION_LABELS } from '../../game/ai/stateStrategy';

  interface Props {
    worldAI: WorldAIState;
  }

  let { worldAI }: Props = $props();

  const factionLabel = $derived(FACTION_LABELS[worldAI.state.faction]);
  const cycleLabel = $derived(CYCLE_LABELS[worldAI.state.cycle]);
  const segmented = $derived(worldAI.state.faction !== 'unitaire');
</script>

<section class="bordered-card p-4 space-y-3">
  <div>
    <div class="text-xs uppercase tracking-wider text-parchment-dim/80">État & adversaire</div>
    <h3 class="font-display text-gold text-base">Signaux stratégiques</h3>
  </div>

  <div class="world-card state" data-faction={worldAI.state.faction}>
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <div class="state-header">
          <span class="faction" data-faction={worldAI.state.faction}>{factionLabel}</span>
          {#if segmented}
            <span class="cycle">· {cycleLabel}</span>
          {/if}
        </div>
        <b>{worldAI.state.label}</b>
        <p>{worldAI.state.signal}</p>
      </div>
      <em>{Math.round(worldAI.state.intensity)}</em>
    </div>
    <div class="world-track"><i style="width: {Math.max(4, Math.min(100, worldAI.state.intensity))}%"></i></div>
  </div>

  <div class="world-card opponent">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <div class="state-header">
          <span class="opponent-faction">{worldAI.opponent.factionName}</span>
        </div>
        <b>{worldAI.opponent.label}</b>
        <p>{worldAI.opponent.signal}</p>
      </div>
      <em>{Math.round(worldAI.opponent.intensity)}</em>
    </div>
    <div class="world-track"><i style="width: {Math.max(4, Math.min(100, worldAI.opponent.intensity))}%"></i></div>
  </div>
</section>

<style>
  .world-card {
    border: 1px solid rgba(237, 228, 201, 0.12);
    border-radius: 0.6rem;
    padding: 0.65rem 0.7rem;
    background: rgba(13, 16, 20, 0.26);
  }

  .world-card.state {
    border-color: rgba(126, 180, 255, 0.22);
    background: rgba(46, 94, 138, 0.09);
  }

  .world-card.state[data-faction='bercy'] {
    border-color: rgba(141, 180, 168, 0.32);
    background: rgba(141, 180, 168, 0.06);
  }

  .world-card.state[data-faction='travail'] {
    border-color: rgba(126, 180, 255, 0.32);
    background: rgba(46, 94, 138, 0.09);
  }

  .world-card.state[data-faction='elysee'] {
    border-color: rgba(244, 213, 139, 0.4);
    background: rgba(201, 154, 64, 0.08);
  }

  .world-card.opponent {
    border-color: rgba(224, 122, 110, 0.22);
    background: rgba(224, 122, 110, 0.06);
  }

  .state-header {
    display: flex;
    align-items: baseline;
    gap: 0.3rem;
    color: rgba(237, 228, 201, 0.85);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 0.18rem;
  }

  .state-header .faction[data-faction='bercy'] {
    color: #aedab5;
  }

  .state-header .faction[data-faction='travail'] {
    color: #b8d6ff;
  }

  .state-header .faction[data-faction='elysee'] {
    color: #f4d58b;
  }

  .state-header .faction[data-faction='unitaire'] {
    color: rgba(237, 228, 201, 0.7);
  }

  .state-header .cycle {
    color: rgba(237, 228, 201, 0.55);
  }

  .state-header .opponent-faction {
    color: #e8a09b;
  }

  .world-card b {
    display: block;
    color: #ede4c9;
    font-size: 0.78rem;
    line-height: 1.2;
  }

  .world-card p {
    margin-top: 0.22rem;
    color: rgba(237, 228, 201, 0.78);
    font-size: 0.72rem;
    line-height: 1.35;
  }

  .world-card em {
    color: #f4d58b;
    font-style: normal;
    font-family: 'Cinzel', Georgia, serif;
    white-space: nowrap;
  }

  .world-track {
    height: 0.3rem;
    margin-top: 0.5rem;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.55);
  }

  .world-track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #7eb4ff, #f4d58b);
    transition: width 0.3s ease;
  }

  .world-card.state[data-faction='bercy'] .world-track i {
    background: linear-gradient(90deg, #aedab5, #f4d58b);
  }

  .world-card.state[data-faction='elysee'] .world-track i {
    background: linear-gradient(90deg, #f4d58b, #e07a3a);
  }

  .world-card.opponent .world-track i {
    background: linear-gradient(90deg, #e07a6e, #f4d58b);
  }
</style>
