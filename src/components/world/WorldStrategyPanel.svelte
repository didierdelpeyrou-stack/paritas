<script lang="ts">
  import type { WorldAIState } from '../../game/ai/types';

  interface Props {
    worldAI: WorldAIState;
  }

  let { worldAI }: Props = $props();
</script>

<section class="bordered-card p-4 space-y-3">
  <div>
    <div class="text-xs uppercase tracking-wider text-parchment-dim/60">État & adversaire</div>
    <h3 class="font-display text-gold text-base">Signaux stratégiques</h3>
  </div>

  <div class="world-card state">
    <div class="flex items-start justify-between gap-2">
      <div>
        <b>État — {worldAI.state.label}</b>
        <p>{worldAI.state.signal}</p>
      </div>
      <em>{Math.round(worldAI.state.intensity)}</em>
    </div>
    <div class="world-track"><i style="width: {Math.max(4, Math.min(100, worldAI.state.intensity))}%"></i></div>
  </div>

  <div class="world-card opponent">
    <div class="flex items-start justify-between gap-2">
      <div>
        <b>Adversaire — {worldAI.opponent.label}</b>
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

  .world-card.opponent {
    border-color: rgba(224, 122, 110, 0.22);
    background: rgba(224, 122, 110, 0.06);
  }

  .world-card b {
    display: block;
    color: #ede4c9;
    font-size: 0.78rem;
    line-height: 1.2;
  }

  .world-card p {
    margin-top: 0.22rem;
    color: rgba(237, 228, 201, 0.66);
    font-size: 0.7rem;
    line-height: 1.3;
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

  .world-card.opponent .world-track i {
    background: linear-gradient(90deg, #e07a6e, #f4d58b);
  }
</style>
