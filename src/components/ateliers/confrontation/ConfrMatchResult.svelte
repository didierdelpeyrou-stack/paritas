<script lang="ts">
  /* ORDA-018 PARITAS — refacto CSS Confrontation (dette ORDA-006).
     Sous-composant 4/4 : Résultat final du match + recap rounds.
     Extrait du monolithe Confrontation.svelte. */

  import {
    MANIF_ACTIONS,
    POLICE_ACTIONS,
    MATCH_OUTCOME_LABELS,
    type ConfrState
  } from '../../../game/ateliers/confrontation/engine';

  interface Props {
    gameState: ConfrState;
    onRestart: () => void;
    onFinish?: () => void;
  }

  const { gameState, onRestart, onFinish }: Props = $props();

  const outcomeData = $derived(
    gameState.matchOutcome ? MATCH_OUTCOME_LABELS[gameState.matchOutcome] : null
  );
</script>

<!-- Résultat final -->
{#if gameState.phase === 'ended' && outcomeData}
  <div class="match-result outcome-{gameState.matchOutcome}">
    <div class="outcome-emoji">{outcomeData.emoji}</div>
    <h2>{outcomeData.title}</h2>
    <p class="outcome-sub">{outcomeData.subtitle}</p>
    <div class="outcome-sides">
      <div class="outcome-side manif-side">
        <strong>Manifestants</strong>
        <p>{outcomeData.manif}</p>
      </div>
      <div class="outcome-side police-side">
        <strong>Police</strong>
        <p>{outcomeData.police}</p>
      </div>
    </div>
    <div class="result-btns">
      <button class="restart-btn" onclick={onRestart}>↺ Rejouer</button>
      {#if onFinish}
        <button class="finish-btn" onclick={onFinish}>Retourner au jeu →</button>
      {/if}
    </div>
  </div>
{/if}

<!-- Historique compact des rounds -->
{#if gameState.history.length > 0 && gameState.phase !== 'ended'}
  <div class="rounds-recap">
    {#each gameState.history as r, i}
      <div class="recap-round">
        <span class="recap-num">R{i + 1}</span>
        <span class="recap-manif">{MANIF_ACTIONS.find(a => a.id === r.manifAction)?.icon}</span>
        <span class="recap-clash"
          class:manif-win={r.outcome === 'manif_wins'}
          class:police-win={r.outcome === 'police_wins'}
        >
          {r.outcome === 'manif_wins' ? '◀' : r.outcome === 'police_wins' ? '▶' : '—'}
        </span>
        <span class="recap-police">{POLICE_ACTIONS.find(a => a.id === r.policeAction)?.icon}</span>
        <span class="recap-delta" class:pos={r.delta > 0} class:neg={r.delta < 0}>
          {r.delta > 0 ? `+${r.delta}` : r.delta}
        </span>
      </div>
    {/each}
  </div>
{/if}

<style>
  /* ====== Résultat final ====== */
  .match-result {
    border-radius: 10px;
    padding: 1.5rem;
    text-align: center;
    animation: fadeIn 0.4s ease;
  }

  .outcome-manif_victoire { background: #0a0402; border: 1px solid #5a2010; }
  .outcome-police_victoire { background: #02040a; border: 1px solid #102040; }
  .outcome-blocage { background: #080808; border: 1px solid #2a2a2a; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .outcome-emoji { font-size: 2.5rem; margin-bottom: 0.4rem; }

  .match-result h2 {
    margin: 0 0 0.3rem;
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    font-family: 'Georgia', serif;
  }

  .outcome-sub {
    margin: 0 0 1rem;
    font-size: 0.8rem;
    color: #666;
    font-style: italic;
  }

  .outcome-sides {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    text-align: left;
  }

  .outcome-side {
    padding: 0.75rem;
    border-radius: 6px;
    background: #0a0a0a;
  }

  .manif-side { border-left: 2px solid #c44a1a; }
  .police-side { border-left: 2px solid #334466; }

  .outcome-side strong {
    display: block;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.3rem;
    color: #888;
  }

  .outcome-side p {
    margin: 0;
    font-size: 0.78rem;
    color: #a09070;
    font-style: italic;
    line-height: 1.4;
  }

  .result-btns {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
  }

  .restart-btn {
    background: transparent;
    border: 1px solid #333;
    color: #888;
    padding: 0.5rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    font-family: inherit;
    transition: all 0.2s;
  }
  .restart-btn:hover { border-color: #555; color: #bbb; }

  .finish-btn {
    background: #b8860b;
    border: none;
    color: #080808;
    padding: 0.5rem 1.5rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.2s;
  }
  .finish-btn:hover { background: #d4a020; }

  /* ====== Rounds recap ====== */
  .rounds-recap {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    padding-top: 0.25rem;
  }

  .recap-round {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.7rem;
    background: #0a0a0a;
    border: 1px solid #1a1a1a;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
  }

  .recap-num { color: #555; font-size: 0.6rem; letter-spacing: 0.05em; }
  .recap-manif, .recap-police { font-size: 0.9rem; }

  .recap-clash { color: #555; }
  .recap-clash.manif-win { color: #c44a1a; }
  .recap-clash.police-win { color: #334466; }

  .recap-delta { font-size: 0.6rem; }
  .recap-delta.pos { color: #c44a1a; }
  .recap-delta.neg { color: #334466; }

  /* ====== Responsive résultat ====== */
  @media (max-width: 580px) {
    .outcome-sides { grid-template-columns: 1fr; }
  }
</style>
