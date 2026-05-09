<script lang="ts">
  /* ORDA-018 PARITAS — refacto CSS Confrontation (dette ORDA-006).
     Sous-composant 2/4 : Zone cursor + terrain visuel + round story.
     Extrait du monolithe Confrontation.svelte. */

  import ConfrSilhouette from '../ConfrSilhouette.svelte';
  import {
    MANIF_ACTIONS,
    POLICE_ACTIONS,
    zoneLabel,
    type ConfrState
  } from '../../../game/ateliers/confrontation/engine';

  interface Props {
    gameState: ConfrState;
    resolving: boolean;
    showResult: boolean;
    onAdvanceRound: () => void;
  }

  const { gameState, resolving, showResult, onAdvanceRound }: Props = $props();

  const zonePercent = $derived(gameState.zone);
  const zoneLbl = $derived(zoneLabel(gameState.zone));
  const zoneColor = $derived(
    gameState.zone >= 65 ? '#c44a1a'
    : gameState.zone <= 35 ? '#334466'
    : '#666'
  );
  const lastRound = $derived(gameState.history.at(-1));
</script>

<!-- Zone cursor — le cœur du jeu -->
<div class="zone-container">
  <div class="zone-label left">MANIFESTANTS</div>
  <div class="zone-track">
    <div class="zone-fill manif-fill" style="width: {zonePercent}%"></div>
    <div class="zone-cursor" style="left: {zonePercent}%"></div>
    <div class="threshold threshold-manif" title="Victoire manifestants"></div>
    <div class="threshold threshold-police" title="Victoire police"></div>
  </div>
  <div class="zone-label right">POLICE</div>
</div>
<div class="zone-status" style="color: {zoneColor}">{zoneLbl}</div>

<!-- Terrain visuel (silhouettes SVG) -->
<div class="terrain" class:tense={gameState.zone > 65 || gameState.zone < 35} class:resolving>
  <!-- Foule manifestants (gauche) -->
  <div class="crowd crowd-manif">
    {#each Array(Math.max(2, Math.round(gameState.zone / 12))) as _, i}
      <ConfrSilhouette side="manif" delayIndex={i} />
    {/each}
    {#if (resolving || showResult || gameState.phase === 'result' || gameState.phase === 'ended') && lastRound}
      <span class="pick-badge manif-badge">{MANIF_ACTIONS.find(a => a.id === lastRound.manifAction)?.icon}</span>
    {/if}
    {#if gameState.manifMoralBonus > 0 && gameState.phase === 'picking'}
      <span class="bonus-badge moral-badge" title="+{gameState.manifMoralBonus} au prochain win">🎵+{gameState.manifMoralBonus}</span>
    {/if}
  </div>

  <!-- Centre — ligne de confrontation -->
  <div class="front-line" class:active={resolving}>
    <div class="front-line-inner"></div>
  </div>

  <!-- CRS (droite) -->
  <div class="crowd crowd-police">
    {#if (resolving || showResult || gameState.phase === 'result' || gameState.phase === 'ended') && lastRound}
      <span class="pick-badge police-badge">{POLICE_ACTIONS.find(a => a.id === lastRound.policeAction)?.icon}</span>
    {/if}
    {#if gameState.policeNasseBonus > 0 && gameState.phase === 'picking'}
      <span class="bonus-badge nasse-badge" title="+{gameState.policeNasseBonus} bonus nasse">⬛+{gameState.policeNasseBonus}</span>
    {/if}
    {#each Array(Math.max(2, Math.round((100 - gameState.zone) / 12))) as _, i}
      <ConfrSilhouette side="police" delayIndex={i} />
    {/each}
  </div>
</div>

<!-- Narrative flash de round -->
{#if (gameState.phase === 'result' || showResult) && lastRound}
  <div class="round-story" class:manif-story={lastRound.outcome === 'manif_wins'} class:police-story={lastRound.outcome === 'police_wins'}>
    <span class="story-outcome">
      {lastRound.outcome === 'manif_wins' ? '✊ Manifestants' : lastRound.outcome === 'police_wins' ? '🛡️ Police' : '⚖️ Égalité'}
    </span>
    <p>{lastRound.story}</p>
    {#if gameState.phase === 'result'}
      <button class="next-round-btn" onclick={onAdvanceRound}>
        {gameState.round < 3 ? `Round ${gameState.round} →` : 'Voir le résultat →'}
      </button>
    {/if}
  </div>
{/if}

<style>
  /* ====== Zone Cursor ====== */
  .zone-container {
    display: grid;
    grid-template-columns: 90px 1fr 90px;
    align-items: center;
    gap: 0.5rem;
  }

  .zone-label {
    font-size: 0.55rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .zone-label.left { color: #c44a1a; text-align: right; }
  .zone-label.right { color: #334466; text-align: left; }

  .zone-track {
    height: 12px;
    background: #0f0f0f;
    border: 1px solid #1a1a1a;
    border-radius: 6px;
    position: relative;
    overflow: visible;
  }

  .zone-fill {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: linear-gradient(90deg, #c44a1a 0%, #8b3010 60%, transparent 100%);
    border-radius: 6px;
    transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .zone-cursor {
    position: absolute;
    top: -6px;
    width: 4px;
    height: 24px;
    background: #fff;
    border-radius: 2px;
    transform: translateX(-50%);
    transition: left 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 8px rgba(255,255,255,0.4);
  }

  .threshold {
    position: absolute;
    top: -4px;
    width: 2px;
    height: 20px;
    opacity: 0.4;
  }
  .threshold-manif { left: 65%; background: #c44a1a; }
  .threshold-police { left: 35%; background: #334466; }

  .zone-status {
    text-align: center;
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    transition: color 0.5s;
    height: 1rem;
  }

  /* ====== Terrain ====== */
  .terrain {
    background: #0a0a0a;
    border: 1px solid #151515;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    min-height: 90px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.4s;
  }

  .terrain.tense { border-color: #2a1a0a; }
  .terrain.resolving { border-color: #444; }

  .crowd {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    position: relative;
  }

  .crowd-manif { flex-direction: row; }
  .crowd-police { flex-direction: row-reverse; }

  .pick-badge {
    position: absolute;
    top: -10px;
    font-size: 1.4rem;
    animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .manif-badge { left: 50%; transform: translateX(-50%); }
  .police-badge { right: 50%; transform: translateX(50%); }

  @keyframes popIn {
    from { transform: translateX(-50%) scale(0.4); opacity: 0; }
    to   { transform: translateX(-50%) scale(1); opacity: 1; }
  }

  .bonus-badge {
    position: absolute;
    bottom: -8px;
    font-size: 0.55rem;
    font-family: 'Courier New', monospace;
    letter-spacing: 0.05em;
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    animation: fadeIn 0.3s ease;
  }
  .moral-badge {
    left: 50%;
    transform: translateX(-50%);
    background: #1a1a0a;
    border: 1px solid #b8860b;
    color: #b8860b;
  }
  .nasse-badge {
    right: 50%;
    transform: translateX(50%);
    background: #0a0a1a;
    border: 1px solid #334466;
    color: #5577aa;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(2px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .front-line {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #1a1a1a;
    transform: translateX(-50%);
    transition: background 0.3s;
  }
  .front-line.active { background: #b8860b; box-shadow: 0 0 12px rgba(184,134,11,0.3); }
  .front-line-inner {
    width: 100%;
    height: 100%;
    background: inherit;
  }

  /* ====== Round story ====== */
  .round-story {
    border-radius: 6px;
    padding: 0.8rem 1rem;
    border-left: 3px solid #333;
    background: #0a0a0a;
    animation: slideIn 0.25s ease;
  }

  .round-story.manif-story { border-left-color: #c44a1a; }
  .round-story.police-story { border-left-color: #334466; }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .story-outcome {
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #888;
    display: block;
    margin-bottom: 0.3rem;
  }

  .round-story p {
    margin: 0 0 0.6rem;
    font-size: 0.85rem;
    font-family: 'Georgia', serif;
    font-style: italic;
    color: #c8b898;
    line-height: 1.5;
  }

  .next-round-btn {
    background: #1a1a1a;
    border: 1px solid #333;
    color: #b8860b;
    padding: 0.35rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    font-family: inherit;
    letter-spacing: 0.05em;
    transition: all 0.2s;
  }
  .next-round-btn:hover { background: #222; border-color: #b8860b; }
</style>
