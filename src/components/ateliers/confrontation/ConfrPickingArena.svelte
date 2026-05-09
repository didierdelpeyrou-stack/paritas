<script lang="ts">
  /* ORDA-018 PARITAS — refacto CSS Confrontation (dette ORDA-006).
     Sous-composant 3/4 : Picking arena (2 colonnes manif/police) +
     resolving flash overlay. Extrait du monolithe. */

  import {
    MANIF_ACTIONS,
    POLICE_ACTIONS,
    type ConfrState,
    type Side,
    type ManifAction,
    type PoliceAction
  } from '../../../game/ateliers/confrontation/engine';

  interface Props {
    gameState: ConfrState;
    soloMode: boolean;
    startSide: Side | null;
    resolving: boolean;
    revealManifIcon: string | null;
    revealPoliceIcon: string | null;
    onPickManif: (id: ManifAction) => void;
    onPickPolice: (id: PoliceAction) => void;
  }

  const {
    gameState,
    soloMode,
    startSide,
    resolving,
    revealManifIcon,
    revealPoliceIcon,
    onPickManif,
    onPickPolice
  }: Props = $props();
</script>

{#if gameState.phase === 'picking' && !resolving}
  <div class="picking-arena">

    <!-- Côté Manifestants -->
    <div class="side side-manif" class:picked={!!gameState.manifPick}>
      <div class="side-title">
        {#if soloMode && startSide === 'police'}
          <span class="ia-badge">IA</span>
        {/if}
        ✊ MANIFESTANTS
      </div>
      <div class="actions-col">
        {#each MANIF_ACTIONS as action}
          <button
            class="action-btn manif-btn"
            class:selected={gameState.manifPick === action.id}
            class:disabled-btn={!!gameState.manifPick || (soloMode && startSide === 'police')}
            onclick={() => onPickManif(action.id)}
            disabled={!!gameState.manifPick || (soloMode && startSide === 'police')}
          >
            <span class="action-icon">{action.icon}</span>
            <span class="action-label">{action.label}</span>
            <span class="action-intent">{action.intent}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Séparateur -->
    <div class="vs-divider">
      <span>VS</span>
    </div>

    <!-- Côté Police -->
    <div class="side side-police" class:picked={!!gameState.policePick}>
      <div class="side-title">
        🛡️ POLICE
        {#if soloMode && startSide === 'manif'}
          <span class="ia-badge">IA</span>
        {/if}
      </div>
      <div class="actions-col">
        {#each POLICE_ACTIONS as action}
          <button
            class="action-btn police-btn"
            class:selected={gameState.policePick === action.id}
            class:disabled-btn={!!gameState.policePick || (soloMode && startSide === 'manif')}
            onclick={() => onPickPolice(action.id)}
            disabled={!!gameState.policePick || (soloMode && startSide === 'manif')}
          >
            <span class="action-icon">{action.icon}</span>
            <span class="action-label">{action.label}</span>
            <span class="action-intent">{action.intent}</span>
          </button>
        {/each}
      </div>
    </div>

  </div>
{/if}

{#if resolving}
  <div class="resolving-flash">
    <div class="resolving-inner">
      <span>{revealManifIcon ?? '?'}</span>
      <span class="clash">⚡</span>
      <span>{revealPoliceIcon ?? '?'}</span>
    </div>
  </div>
{/if}

<style>
  /* ====== Picking Arena ====== */
  .picking-arena {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 0.5rem;
    align-items: start;
  }

  .side {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    transition: opacity 0.3s;
  }

  .side.picked { opacity: 0.5; }

  .side-title {
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0 0.2rem;
  }

  .side-manif .side-title { color: #c44a1a; }
  .side-police .side-title { color: #5577aa; justify-content: flex-end; }

  .ia-badge {
    font-size: 0.55rem;
    background: #333;
    color: #888;
    padding: 0.1rem 0.3rem;
    border-radius: 2px;
  }

  .actions-col {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .action-btn {
    background: #0f0f0f;
    border: 1px solid #1a1a1a;
    border-radius: 6px;
    padding: 0.5rem 0.6rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: inherit;
    color: #d8c8a8;
    transition: all 0.15s;
    text-align: left;
  }

  .action-btn:hover:not(:disabled) {
    border-color: #333;
    background: #141414;
  }

  .action-btn.selected {
    border-color: #b8860b;
    background: #141006;
  }

  .manif-btn:hover:not(:disabled) { border-color: #6a2810; }
  .manif-btn.selected { border-color: #c44a1a; background: #140804; }

  .police-btn:hover:not(:disabled) { border-color: #223355; }
  .police-btn.selected { border-color: #334466; background: #08101a; }

  .side-police .action-btn {
    flex-direction: row-reverse;
    text-align: right;
  }

  .disabled-btn { opacity: 0.35; cursor: default; }

  .action-icon { font-size: 1.1rem; flex-shrink: 0; }

  .action-label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }

  .action-intent {
    font-size: 0.62rem;
    color: #666;
    font-style: italic;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ====== VS Divider ====== */
  .vs-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 1.4rem;
  }

  .vs-divider span {
    font-size: 0.75rem;
    color: #333;
    font-weight: 700;
    letter-spacing: 0.1em;
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }

  /* ====== Resolving flash ====== */
  .resolving-flash {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    animation: pulse 0.3s ease infinite alternate;
  }

  @keyframes pulse {
    from { opacity: 0.7; }
    to   { opacity: 1; }
  }

  .resolving-inner {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    font-size: 2.5rem;
  }

  .clash {
    font-size: 1.5rem;
    color: #b8860b;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* ====== Responsive picking ====== */
  @media (max-width: 580px) {
    .picking-arena {
      grid-template-columns: 1fr;
    }
    .vs-divider { display: none; }
    .action-intent { display: none; }
    .side-police .action-btn { flex-direction: row; text-align: left; }
  }
</style>
