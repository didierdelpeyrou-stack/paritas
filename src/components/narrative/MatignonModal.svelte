<script lang="ts">
  /**
   * MatignonModal.svelte — Mini-jeu négociation Matignon 1936 (V3) intégré dans V2.
   * Déclenché quand gameState.phase === 'matignon'.
   * Émet 'resolve' avec le résultat quand la session se termine.
   */
  import {
    startMatignonSession,
    applyMatignonMove,
    availableMatignonMoves,
    buildMatignonReplay,
    type MatignonMoveId
  } from '../../game/negotiation/matignon';

  interface Props {
    onresolve: (result: { agreementId: string | null; quality: Record<string, number> }) => void;
    onskip: () => void;
  }

  const { onresolve, onskip }: Props = $props();

  let session = $state(startMatignonSession());
  const availableMoves = $derived(availableMatignonMoves(session));
  const currentBeat = $derived(session.history.at(-1)?.transition ?? {
    trigger: 'table_suspended',
    text: 'La table s\'ouvre. Chaque camp cherche encore ce qu\'il peut obtenir sans se perdre.'
  });

  function choose(id: MatignonMoveId) {
    session = applyMatignonMove(session, id);
  }

  function finish() {
    const replay = buildMatignonReplay(session);
    onresolve({
      agreementId: replay.result.agreementId,
      quality: replay.result.quality
        ? {
            materialGain: replay.result.quality.materialGain,
            legalStrength: replay.result.quality.legalStrength,
            internalAcceptability: replay.result.quality.internalAcceptability,
            publicLegibility: replay.result.quality.publicLegibility,
            durability: replay.result.quality.durability
          }
        : {}
    });
  }
</script>

<div class="matignon-overlay">
  <div class="matignon-modal">

    <!-- Header -->
    <div class="matignon-header">
      <div class="header-left">
        <span class="eyebrow">7 juin 1936 · 23h40</span>
        <h2>Hôtel Matignon</h2>
        <p class="subtitle">La table des accords</p>
      </div>
      <button class="skip-btn" onclick={onskip} title="Passer la négociation">
        Passer →
      </button>
    </div>

    <!-- Table visuelle -->
    <div class="table-scene">
      <div class="actors">
        <div class="actor actor-cgt">CGT</div>
        <div class="actor actor-etat">État</div>
        <div class="actor actor-patronat">CGPF</div>
      </div>
      <div class="table-text">
        <span class="beat-trigger">{currentBeat.trigger.replaceAll('_', ' ')}</span>
        <p class="beat-text">{currentBeat.text}</p>
      </div>
    </div>

    <!-- Métriques -->
    {#if session.metrics}
      <div class="metrics-row">
        {#each Object.entries(session.metrics) as [key, value]}
          <div class="metric">
            <span class="metric-label">{key}</span>
            <div class="metric-bar">
              <div class="metric-fill" style="width: {value}%"></div>
            </div>
            <span class="metric-value">{value}</span>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Choix de négociation -->
    {#if session.phase !== 'ended'}
      <div class="choices-grid">
        {#each availableMoves as move}
          <button class="move-btn" onclick={() => choose(move.id)}>
            <strong>{move.label}</strong>
            <span>{move.intent}</span>
            <small class="risk">{move.risk}</small>
          </button>
        {/each}
      </div>
    {:else}
      <!-- Fin de négociation -->
      <div class="result-panel">
        {#if session.result}
          <div class="result-outcome" class:accord={session.result.outcome.agreementId} class:rupture={!session.result.outcome.agreementId}>
            <h3>{session.result.outcome.agreementId ? '🤝 Accord signé' : '💥 Table rompue'}</h3>
            {#if session.result.outcome.ruptureReason}
              <p class="rupture-reason">{session.result.outcome.ruptureReason}</p>
            {/if}
            {#if session.result.outcome.agreementId}
              <div class="quality-bars">
                {#each Object.entries(session.result.outcome.quality) as [key, val]}
                  <div class="quality-row">
                    <span>{key}</span>
                    <div class="quality-bar"><div style="width:{val}%"></div></div>
                    <em>{val}</em>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
        <button class="finish-btn" onclick={finish}>
          Retourner au jeu →
        </button>
      </div>
    {/if}

    <!-- Historique (compact) -->
    {#if session.history.length > 0}
      <div class="history">
        {#each session.history.slice(-3) as entry}
          <div class="history-entry">
            <strong>T{entry.turn}</strong>
            <span>{entry.move.label}</span>
            <em>{entry.actorIntent.actor} : {entry.actorIntent.strategy} (p{entry.actorIntent.pressure})</em>
          </div>
        {/each}
      </div>
    {/if}

  </div>
</div>

<style>
  .matignon-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .matignon-modal {
    background: #1a1a1a;
    border: 1px solid #4a3728;
    border-radius: 12px;
    max-width: 680px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 2rem;
    color: #e8dcc8;
    font-family: 'Georgia', serif;
  }

  .matignon-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #4a3728;
    padding-bottom: 1rem;
  }

  .eyebrow {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #b8860b;
    display: block;
    margin-bottom: 0.25rem;
  }

  .matignon-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #e8dcc8;
  }

  .subtitle {
    margin: 0;
    font-size: 0.85rem;
    color: #8b7355;
    font-style: italic;
  }

  .skip-btn {
    background: transparent;
    border: 1px solid #4a3728;
    color: #8b7355;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s;
  }

  .skip-btn:hover {
    border-color: #b8860b;
    color: #e8dcc8;
  }

  .table-scene {
    background: #111;
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
    border: 1px solid #2a2a2a;
  }

  .actors {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .actor {
    font-size: 0.75rem;
    font-weight: bold;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    background: #2a1f0f;
    border: 1px solid #4a3728;
    color: #c4a46a;
  }

  .beat-trigger {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #b8860b;
  }

  .beat-text {
    margin: 0.5rem 0 0;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #d4c4a0;
    font-style: italic;
  }

  .metrics-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
  }

  .metric {
    flex: 1;
    min-width: 80px;
    font-size: 0.7rem;
  }

  .metric-label {
    display: block;
    color: #8b7355;
    margin-bottom: 0.2rem;
    white-space: nowrap;
  }

  .metric-bar {
    height: 4px;
    background: #2a2a2a;
    border-radius: 2px;
    margin-bottom: 0.2rem;
  }

  .metric-fill {
    height: 100%;
    background: #b8860b;
    border-radius: 2px;
    transition: width 0.3s;
  }

  .metric-value {
    color: #c4a46a;
    font-size: 0.65rem;
  }

  .choices-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .move-btn {
    background: #111;
    border: 1px solid #4a3728;
    border-radius: 8px;
    padding: 0.75rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
    color: #e8dcc8;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .move-btn:hover {
    border-color: #b8860b;
    background: #1f1a10;
  }

  .move-btn strong {
    font-size: 0.85rem;
    color: #e8dcc8;
  }

  .move-btn span {
    font-size: 0.75rem;
    color: #a09070;
    font-style: italic;
  }

  .move-btn .risk {
    font-size: 0.7rem;
    color: #8b4040;
  }

  .result-panel {
    text-align: center;
    padding: 1.5rem;
  }

  .result-outcome {
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .result-outcome.accord {
    background: #0f1f0f;
    border: 1px solid #2d5a27;
  }

  .result-outcome.rupture {
    background: #1f0f0f;
    border: 1px solid #5a2727;
  }

  .result-outcome h3 {
    margin: 0 0 0.75rem;
    font-size: 1.2rem;
  }

  .quality-bars {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-top: 0.75rem;
  }

  .quality-row {
    display: grid;
    grid-template-columns: 1fr 3fr auto;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.75rem;
  }

  .quality-row span {
    color: #8b7355;
    text-align: right;
  }

  .quality-bar {
    height: 6px;
    background: #2a2a2a;
    border-radius: 3px;
  }

  .quality-bar div {
    height: 100%;
    background: #2d8a27;
    border-radius: 3px;
  }

  .quality-row em {
    color: #c4a46a;
    min-width: 2em;
    text-align: right;
  }

  .finish-btn {
    background: #b8860b;
    border: none;
    color: #1a1a1a;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }

  .finish-btn:hover {
    background: #d4a020;
  }

  .history {
    border-top: 1px solid #2a2a2a;
    padding-top: 0.75rem;
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .history-entry {
    display: flex;
    gap: 0.75rem;
    font-size: 0.72rem;
    align-items: center;
  }

  .history-entry strong {
    color: #b8860b;
    min-width: 2em;
  }

  .history-entry span {
    color: #e8dcc8;
  }

  .history-entry em {
    color: #8b7355;
    font-style: normal;
    font-size: 0.65rem;
  }

  @media (max-width: 600px) {
    .choices-grid {
      grid-template-columns: 1fr;
    }
    .matignon-modal {
      padding: 1.25rem;
    }
  }
</style>
