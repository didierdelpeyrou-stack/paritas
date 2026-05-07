<script lang="ts">
  /**
   * LaPlace.svelte — Atelier "La Place"
   * Fusion BrawlArena + ManifSimulator en expérience épurée.
   *
   * 3 actes × 1 décision. Interface minimaliste, défouloir pur.
   * Standalone (/mini/place) ou embedded V2 (événement ou scénario).
   *
   * Props :
   *   onresolve — appelé à la fin avec les effets V2
   *   onskip    — passer l'atelier
   *   embedded  — si true, affiche en overlay (défaut false = plein écran)
   */
  import {
    startPlaceSession,
    applyAction,
    getCurrentAct,
    outcomeToV2Effects,
    OUTCOME_LABELS,
    type PlaceState,
    type ActionId,
    type PlaceEffects,
    type PlaceOutcome
  } from '../../game/ateliers/laplace/engine';

  interface Props {
    onresolve?: (effects: PlaceEffects) => void;
    onskip?: () => void;
    embedded?: boolean;
  }

  const { onresolve, onskip, embedded = false }: Props = $props();

  let state = $state<PlaceState>(startPlaceSession());
  let lastNarrative = $state<string | null>(null);
  let showNarrative = $state(false);
  let narrativeTimeout: ReturnType<typeof setTimeout> | null = null;

  const currentAct = $derived(getCurrentAct(state));
  const outcomeData = $derived(
    state.outcome ? OUTCOME_LABELS[state.outcome] : null
  );
  const effects = $derived(
    state.outcome ? outcomeToV2Effects(state.outcome, state.history) : null
  );

  // Pourcentage rempli de la jauge escalade
  const escaladeColor = $derived(
    state.escalade < 40 ? '#b8860b'
    : state.escalade < 70 ? '#c44a1a'
    : '#8b0000'
  );

  function choose(id: ActionId) {
    if (state.phase === 'ended') return;

    const action = currentAct.actions.find(a => a.id === id);
    if (!action) return;

    // Afficher narrative avant de passer à l'acte suivant
    lastNarrative = action.narrative;
    showNarrative = true;

    if (narrativeTimeout) clearTimeout(narrativeTimeout);

    const nextState = applyAction(state, id);

    // Délai court pour lire la narrative
    narrativeTimeout = setTimeout(() => {
      state = nextState;
      showNarrative = false;
      lastNarrative = null;
    }, 1800);
  }

  function finish() {
    if (effects && onresolve) {
      onresolve(effects);
    }
  }
</script>

<div class="place-root" class:overlay={embedded}>
  <div class="place-shell">

    <!-- Header -->
    <div class="place-header">
      <div class="header-left">
        <span class="eyebrow">ATELIER · LA RUE</span>
        <h1>La Place</h1>
      </div>
      {#if onskip}
        <button class="skip-btn" onclick={onskip}>Passer →</button>
      {/if}
    </div>

    <!-- Jauges -->
    <div class="gauges">
      <div class="gauge-item">
        <span class="gauge-label">ESCALADE</span>
        <div class="gauge-track">
          <div
            class="gauge-fill escalade-fill"
            style="width: {state.escalade}%; background: {escaladeColor}"
          ></div>
        </div>
        <span class="gauge-val">{state.escalade}</span>
      </div>
      <div class="gauge-item">
        <span class="gauge-label">FOULE</span>
        <div class="gauge-track">
          <div class="gauge-fill foule-fill" style="width: {state.foule}%"></div>
        </div>
        <span class="gauge-val">{state.foule}</span>
      </div>
    </div>

    <!-- Silhouette scène -->
    <div class="scene" class:police={currentAct.policePresent} class:high-tension={state.escalade >= 70}>
      <div class="crowd-silhouette">
        {#each Array(Math.max(3, Math.round(state.foule / 10))) as _}
          <span class="person">▮</span>
        {/each}
      </div>
      {#if currentAct.policePresent}
        <div class="police-line">
          <span class="police-label">▰▰▰ CRS ▰▰▰</span>
        </div>
      {/if}
    </div>

    <!-- Acte en cours -->
    {#if state.phase === 'playing'}
      <div class="act-block">
        <div class="act-num">ACTE {state.act === 1 ? 'I' : state.act === 2 ? 'II' : 'III'}</div>
        <h2 class="act-title">{currentAct.title}</h2>
        <p class="act-setup">{currentAct.setup}</p>
      </div>

      <!-- Narrative flash (après choix) -->
      {#if showNarrative && lastNarrative}
        <div class="narrative-flash">
          <p>{lastNarrative}</p>
        </div>
      {:else}
        <!-- Boutons d'action -->
        <div class="actions-grid">
          {#each currentAct.actions as action}
            <button
              class="action-btn action-{action.id}"
              onclick={() => choose(action.id)}
              disabled={showNarrative}
            >
              <span class="action-icon">{action.icon}</span>
              <strong class="action-label">{action.label}</strong>
              <span class="action-intent">{action.intent}</span>
              <span class="action-deltas">
                {action.deltaEscalade > 0 ? `+${action.deltaEscalade}⚡` : `${action.deltaEscalade}⚡`}
                {action.deltaFoule > 0 ? `+${action.deltaFoule}👥` : `${action.deltaFoule}👥`}
              </span>
            </button>
          {/each}
        </div>
      {/if}
    {/if}

    <!-- Résultat final -->
    {#if state.phase === 'ended' && outcomeData && effects}
      <div class="result outcome-{state.outcome}">
        <div class="outcome-emoji">{outcomeData.emoji}</div>
        <h2 class="outcome-title">{outcomeData.title}</h2>
        <p class="outcome-body">{outcomeData.body}</p>

        <!-- Effets V2 -->
        {#if onresolve}
          <div class="effects-preview">
            {#each Object.entries(effects).filter(([, v]) => v !== 0) as [key, val]}
              <span class="effect-chip" class:positive={val > 0} class:negative={val < 0}>
                {val > 0 ? '+' : ''}{val} {key}
              </span>
            {/each}
          </div>
          <button class="finish-btn" onclick={finish}>
            Retourner au jeu →
          </button>
        {:else}
          <button class="finish-btn" onclick={() => { state = startPlaceSession(); }}>
            Rejouer
          </button>
        {/if}
      </div>
    {/if}

    <!-- Historique compact -->
    {#if state.history.length > 0 && state.phase === 'playing'}
      <div class="history-strip">
        {#each state.history as entry}
          <div class="history-dot" title="Acte {entry.act} — {entry.action}">
            {entry.action === 'tenir' ? '🪧' : entry.action === 'pousser' ? '✊' : entry.action === 'forcer' ? '⚡' : '↩'}
          </div>
        {/each}
      </div>
    {/if}

  </div>
</div>

<style>
  /* ====== Layout ====== */
  .place-root {
    background: #0d0d0d;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Georgia', 'Times New Roman', serif;
    color: #e8dcc8;
    padding: 1rem;
  }

  .place-root.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.92);
    z-index: 900;
  }

  .place-shell {
    max-width: 560px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* ====== Header ====== */
  .place-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .eyebrow {
    display: block;
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #b8860b;
    margin-bottom: 0.2rem;
    font-family: 'Courier New', monospace;
  }

  .place-header h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 400;
    letter-spacing: 0.05em;
    color: #fff;
  }

  .skip-btn {
    background: transparent;
    border: 1px solid #333;
    color: #666;
    padding: 0.35rem 0.7rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    transition: all 0.2s;
    font-family: inherit;
  }

  .skip-btn:hover { border-color: #b8860b; color: #e8dcc8; }

  /* ====== Jauges ====== */
  .gauges {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .gauge-item {
    display: grid;
    grid-template-columns: 80px 1fr 30px;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.65rem;
  }

  .gauge-label {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #666;
    font-family: 'Courier New', monospace;
  }

  .gauge-track {
    height: 6px;
    background: #1a1a1a;
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid #222;
  }

  .gauge-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .foule-fill { background: #4a8040; }

  .gauge-val {
    color: #888;
    text-align: right;
    font-family: 'Courier New', monospace;
  }

  /* ====== Scène silhouette ====== */
  .scene {
    background: #111;
    border: 1px solid #1e1e1e;
    border-radius: 8px;
    padding: 1rem;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background 0.5s, border-color 0.5s;
    overflow: hidden;
    position: relative;
  }

  .scene.police {
    background: #1a0a0a;
    border-color: #4a1010;
  }

  .scene.high-tension {
    background: #130808;
    border-color: #6a1818;
  }

  .crowd-silhouette {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 300px;
  }

  .person {
    font-size: 1.1rem;
    color: #c4a46a;
    line-height: 1;
    transition: color 0.3s;
  }

  .scene.police .person { color: #a06040; }
  .scene.high-tension .person { color: #c04020; }

  .police-line {
    width: 100%;
    text-align: center;
    margin-top: 0.5rem;
  }

  .police-label {
    font-size: 0.75rem;
    letter-spacing: 0.3em;
    color: #334466;
    font-family: 'Courier New', monospace;
  }

  /* ====== Acte ====== */
  .act-block {
    text-align: center;
  }

  .act-num {
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #b8860b;
    font-family: 'Courier New', monospace;
    margin-bottom: 0.25rem;
  }

  .act-title {
    margin: 0 0 0.4rem;
    font-size: 1.3rem;
    font-weight: 400;
    letter-spacing: 0.08em;
    color: #fff;
  }

  .act-setup {
    margin: 0;
    font-size: 0.85rem;
    color: #888;
    font-style: italic;
    line-height: 1.5;
  }

  /* ====== Narrative flash ====== */
  .narrative-flash {
    background: #0a0a0a;
    border-left: 3px solid #b8860b;
    padding: 1rem 1.25rem;
    border-radius: 0 6px 6px 0;
    animation: fadeIn 0.3s ease;
  }

  .narrative-flash p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.6;
    color: #d4c4a0;
    font-style: italic;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ====== Actions ====== */
  .actions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }

  .action-btn {
    background: #111;
    border: 1px solid #222;
    border-radius: 8px;
    padding: 0.9rem 0.75rem;
    text-align: left;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    color: #e8dcc8;
    transition: all 0.2s;
    font-family: inherit;
  }

  .action-btn:hover:not(:disabled) {
    border-color: #b8860b;
    background: #181006;
    transform: translateY(-1px);
  }

  .action-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  /* Couleur accent par type */
  .action-tenir:hover:not(:disabled)  { border-color: #4a8040; }
  .action-pousser:hover:not(:disabled){ border-color: #c44a1a; }
  .action-forcer:hover:not(:disabled) { border-color: #8b0000; }
  .action-reculer:hover:not(:disabled){ border-color: #446688; }

  .action-icon {
    font-size: 1.3rem;
    line-height: 1;
  }

  .action-label {
    font-size: 0.9rem;
    color: #fff;
    font-weight: 600;
    letter-spacing: 0.03em;
  }

  .action-intent {
    font-size: 0.72rem;
    color: #888;
    font-style: italic;
    line-height: 1.3;
  }

  .action-deltas {
    font-size: 0.65rem;
    color: #666;
    font-family: 'Courier New', monospace;
    margin-top: 0.2rem;
  }

  /* ====== Résultat ====== */
  .result {
    text-align: center;
    padding: 1.5rem;
    border-radius: 10px;
    animation: fadeIn 0.4s ease;
  }

  .outcome-victoire  { background: #050f05; border: 1px solid #1d4d15; }
  .outcome-compromis { background: #0a0807; border: 1px solid #4a3210; }
  .outcome-repression{ background: #0f0505; border: 1px solid #5a1515; }
  .outcome-abandon   { background: #080808; border: 1px solid #2a2a2a; }

  .outcome-emoji { font-size: 2.5rem; margin-bottom: 0.5rem; }

  .outcome-title {
    margin: 0 0 0.5rem;
    font-size: 1.4rem;
    font-weight: 400;
    color: #fff;
  }

  .outcome-body {
    margin: 0 0 1.25rem;
    font-size: 0.9rem;
    color: #a09070;
    font-style: italic;
    line-height: 1.6;
  }

  .effects-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    justify-content: center;
    margin-bottom: 1.25rem;
  }

  .effect-chip {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    border: 1px solid #333;
    background: #111;
    color: #888;
  }

  .effect-chip.positive { border-color: #2d5a27; color: #6ab860; background: #050f05; }
  .effect-chip.negative { border-color: #5a2727; color: #c86060; background: #0f0505; }

  .finish-btn {
    background: #b8860b;
    border: none;
    color: #0d0d0d;
    padding: 0.75rem 2rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: background 0.2s;
    font-family: inherit;
  }

  .finish-btn:hover { background: #d4a020; }

  /* ====== Historique ====== */
  .history-strip {
    display: flex;
    gap: 0.4rem;
    justify-content: center;
  }

  .history-dot {
    width: 2rem;
    height: 2rem;
    background: #111;
    border: 1px solid #222;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    cursor: default;
  }

  /* ====== Responsive ====== */
  @media (max-width: 480px) {
    .actions-grid { grid-template-columns: 1fr; }
    .place-header h1 { font-size: 1.5rem; }
  }
</style>
