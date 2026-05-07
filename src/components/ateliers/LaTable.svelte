<script lang="ts">
  /* ============================================================
     LaTable.svelte — Atelier "La Table de négociation"
     Salarié (gauche) vs Patron (droite) — zone cursor, 3 rounds.
     Modes : 1v1 local, solo vs IA, embedded dans PARITAS V2.
     ============================================================ */
  import { fade, fly } from 'svelte/transition';
  import {
    startTableSession, pickTableMove, resolveTableRound, nextTableRound,
    SALARIE_MOVES, PATRON_MOVES, TABLE_OUTCOME_LABELS, tableZoneLabel,
    tableOutcomeToV2Effects,
    type TableState, type SalarieMove, type PatronMove, type TableSide
  } from '../../game/ateliers/table/engine';

  interface Props {
    embedded?: boolean;
    startSide?: TableSide | null; // null = 2 joueurs, 'salarie'/'patron' = solo vs IA
    onresolve?: (effects: {
      confiance: number; rapportDeForce: number; santeSociale: number;
      legitimite: number; caisse: number; cohesionInterne: number;
    }) => void;
    onskip?: () => void;
  }
  let { embedded = false, startSide = null, onresolve, onskip }: Props = $props();

  /* ============================================================
     State
     ============================================================ */
  let gameState: TableState = $state(startTableSession());
  let resolving = $state(false);
  let showResult = $state(false);
  let revealSalarieIcon: string = $state('');
  let revealPatronIcon: string = $state('');

  const phase = $derived(gameState.phase);
  const zone  = $derived(gameState.zone);
  const lastRound = $derived(gameState.history.at(-1) ?? null);

  /* IA : camp adverse simple */
  function aiPickSalarie(): SalarieMove {
    const weights: Record<SalarieMove, number> = {
      ancrer: zone < 45 ? 3 : 2,
      conceder: 1,
      mediatiser: zone < 50 ? 2 : 1,
      consulter: gameState.salarieMoralBonus === 0 ? 2 : 1,
      rompre: zone < 40 ? 3 : 1
    };
    return weightedRandom(weights) as SalarieMove;
  }

  function aiPickPatron(): PatronMove {
    const weights: Record<PatronMove, number> = {
      maintenir: zone > 55 ? 3 : 1,
      symbolique: 2,
      juridique: zone > 60 ? 2 : 1,
      diviser: gameState.salarieMoralBonus > 0 ? 3 : 1,
      suspendre: zone > 65 ? 3 : 1
    };
    return weightedRandom(weights) as PatronMove;
  }

  function weightedRandom(weights: Record<string, number>): string {
    const entries = Object.entries(weights);
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [k, w] of entries) { r -= w; if (r <= 0) return k; }
    return entries[0][0];
  }

  /* ============================================================
     Actions joueur
     ============================================================ */
  function chooseSalarie(move: SalarieMove) {
    if (phase !== 'picking') return;
    if (gameState.salariePick) return;
    gameState = pickTableMove(gameState, 'salarie', move);
    /* Mode solo IA patron */
    if (startSide === 'salarie' && !gameState.patronPick) {
      gameState = pickTableMove(gameState, 'patron', aiPickPatron());
    }
    tryResolve();
  }

  function choosePatron(move: PatronMove) {
    if (phase !== 'picking') return;
    if (gameState.patronPick) return;
    gameState = pickTableMove(gameState, 'patron', move);
    /* Mode solo IA salarié */
    if (startSide === 'patron' && !gameState.salariePick) {
      gameState = pickTableMove(gameState, 'salarie', aiPickSalarie());
    }
    tryResolve();
  }

  function tryResolve() {
    if (!gameState.salariePick || !gameState.patronPick) return;
    resolving = true;
    showResult = false;

    /* Capturer les icônes AVANT la résolution (qui efface les picks) */
    revealSalarieIcon = SALARIE_MOVES.find(m => m.id === gameState.salariePick)?.icon ?? '';
    revealPatronIcon  = PATRON_MOVES.find(m => m.id === gameState.patronPick)?.icon  ?? '';

    setTimeout(() => {
      gameState = resolveTableRound(gameState);
      resolving = false;
      showResult = true;
    }, 700);
  }

  function continueRound() {
    if (gameState.phase === 'result') {
      showResult = false;
      gameState = nextTableRound(gameState);
    } else if (gameState.phase === 'ended') {
      handleEnd();
    }
  }

  function handleEnd() {
    if (onresolve && gameState.matchOutcome) {
      onresolve(tableOutcomeToV2Effects(gameState.matchOutcome));
    }
  }

  function restart() { gameState = startTableSession(); showResult = false; resolving = false; }

  /* Zone labels */
  const zoneColor = $derived(zone >= 65 ? '#C9A84C' : zone <= 34 ? '#EF4444' : '#9ca3af');
  const zonePct   = $derived(zone);

  /* Sièges CSE fictifs dans le footer */
  function outcomeLabel(o: string | null) {
    if (!o) return null;
    return TABLE_OUTCOME_LABELS[o as keyof typeof TABLE_OUTCOME_LABELS];
  }
</script>

<!-- ============================================================ -->
<!-- LAYOUT PRINCIPAL -->
<!-- ============================================================ -->
<div
  class="table-atelier"
  class:embedded-mode={embedded}
  class:standalone-mode={!embedded}
>
  <!-- HEADER -->
  <header class="atelier-header">
    <div class="header-inner">
      <div class="atelier-meta">
        <span class="atelier-tag">Atelier PARITAS</span>
        <h1 class="atelier-title">⚖️ La Table</h1>
      </div>
      <div class="round-badge">Round {gameState.round}/3</div>
      {#if onskip}
        <button class="skip-btn" onclick={onskip}>Passer →</button>
      {/if}
    </div>
  </header>

  <!-- ZONE CURSOR -->
  <div class="zone-track-wrapper">
    <div class="zone-label-left">RUPTURE</div>
    <div class="zone-track">
      <div class="zone-fill" style="width: {zonePct}%; background: {zoneColor}"></div>
      <!-- Seuils -->
      <div class="zone-threshold" style="left: 34%"></div>
      <div class="zone-threshold" style="left: 65%"></div>
    </div>
    <div class="zone-label-right">ACCORD</div>
  </div>
  <div class="zone-center-label" style="color: {zoneColor}">
    {tableZoneLabel(zone)} — {zone}
    {#if gameState.salarieMoralBonus > 0}
      <span class="bonus-badge">🗣️+{gameState.salarieMoralBonus}</span>
    {/if}
    {#if gameState.patronJuridiqueBonus > 0}
      <span class="bonus-badge patron">⚖️+{gameState.patronJuridiqueBonus}</span>
    {/if}
  </div>

  <!-- TERRAIN PRINCIPAL (picking / result) -->
  {#if phase !== 'ended'}
    <div class="terrain-split">
      <!-- SALARIÉ -->
      <div class="side-panel side-salarie">
        <div class="side-header">
          <!-- SVG Salarié -->
          <svg viewBox="0 0 60 70" class="side-avatar">
            <!-- Corps -->
            <circle cx="30" cy="14" r="10" fill="#D9291A" />
            <rect x="18" y="26" width="24" height="28" rx="4" fill="#B81A12" />
            <!-- Brassard syndicat -->
            <rect x="14" y="34" width="6" height="10" rx="2" fill="#C9A84C" />
            <!-- Jambes -->
            <rect x="20" y="52" width="8" height="14" rx="2" fill="#7A0F0F" />
            <rect x="32" y="52" width="8" height="14" rx="2" fill="#7A0F0F" />
          </svg>
          <div>
            <div class="side-name">SYNDICAT</div>
            <div class="side-role">Représentants des salariés</div>
          </div>
        </div>

        <!-- Picks en cours -->
        {#if (resolving || showResult) && lastRound}
          <div class="pick-badge badge-salarie" in:fade={{ duration: 200 }}>
            {SALARIE_MOVES.find(m => m.id === lastRound.salarieMove)?.icon}
            {SALARIE_MOVES.find(m => m.id === lastRound.salarieMove)?.label}
          </div>
        {:else if gameState.salariePick}
          <div class="pick-badge badge-salarie locked" in:fade={{ duration: 150 }}>✓ Choix verrouillé</div>
        {/if}

        <!-- Actions -->
        {#if phase === 'picking' && !gameState.salariePick && startSide !== 'patron'}
          <div class="action-grid" in:fade={{ duration: 150 }}>
            {#each SALARIE_MOVES as move}
              <button
                type="button"
                class="action-btn btn-salarie"
                onclick={() => chooseSalarie(move.id)}
                title={move.intent}
              >
                <span class="action-icon">{move.icon}</span>
                <span class="action-label">{move.label}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- CENTRE — STORY / RÉSOLUTION -->
      <div class="center-story">
        {#if resolving}
          <div class="resolving-anim" in:fade={{ duration: 150 }}>
            <span class="reveal-icon">{revealSalarieIcon}</span>
            <span class="vs-text">vs</span>
            <span class="reveal-icon">{revealPatronIcon}</span>
          </div>
        {:else if (showResult || phase === 'result') && lastRound}
          <div class="story-card" in:fly={{ y: -8, duration: 300 }}>
            <div class="story-outcome" class:outcome-salarie={lastRound.outcome === 'salarie_wins'} class:outcome-patron={lastRound.outcome === 'patron_wins'}>
              {lastRound.outcome === 'salarie_wins' ? '✊ Syndicat' : lastRound.outcome === 'patron_wins' ? '🏛️ Patronat' : '⚖️ Égal'}
            </div>
            <p class="story-text">{lastRound.story}</p>
            <div class="delta-badge" class:delta-pos={lastRound.delta > 0} class:delta-neg={lastRound.delta < 0}>
              {lastRound.delta > 0 ? '+' : ''}{lastRound.delta} zone
            </div>
            {#if phase === 'result'}
              <button class="continue-btn" onclick={continueRound}>
                Round {gameState.round} → Continuer
              </button>
            {/if}
          </div>
        {:else}
          <div class="center-instructions">
            <div class="table-svg-wrapper">
              <!-- SVG table de négociation -->
              <svg viewBox="0 0 120 80" class="table-svg">
                <!-- Table -->
                <rect x="20" y="30" width="80" height="30" rx="6" fill="#292524" stroke="#44403c" stroke-width="1.5"/>
                <!-- Micro -->
                <rect x="56" y="22" width="8" height="16" rx="3" fill="#C9A84C" opacity="0.7"/>
                <!-- Papiers côté salarié -->
                <rect x="26" y="36" width="20" height="14" rx="2" fill="#3a3028" stroke="#6b4c3b" stroke-width="1"/>
                <!-- Papiers côté patron -->
                <rect x="74" y="36" width="20" height="14" rx="2" fill="#2d3a4a" stroke="#3b5268" stroke-width="1"/>
              </svg>
            </div>
            <p class="center-hint">Chaque camp choisit une posture simultanément.</p>
          </div>
        {/if}
      </div>

      <!-- PATRON -->
      <div class="side-panel side-patron">
        <div class="side-header patron-header">
          <div class="text-right">
            <div class="side-name">PATRONAT</div>
            <div class="side-role">Direction & MEDEF</div>
          </div>
          <!-- SVG Patron -->
          <svg viewBox="0 0 60 70" class="side-avatar">
            <!-- Corps -->
            <circle cx="30" cy="14" r="10" fill="#1e3a5f" />
            <rect x="18" y="26" width="24" height="28" rx="4" fill="#162d4a" />
            <!-- Cravate -->
            <polygon points="30,26 27,40 30,45 33,40" fill="#C9A84C" opacity="0.9" />
            <!-- Jambes -->
            <rect x="20" y="52" width="8" height="14" rx="2" fill="#0f2236" />
            <rect x="32" y="52" width="8" height="14" rx="2" fill="#0f2236" />
          </svg>
        </div>

        {#if (resolving || showResult) && lastRound}
          <div class="pick-badge badge-patron" in:fade={{ duration: 200 }}>
            {PATRON_MOVES.find(m => m.id === lastRound.patronMove)?.icon}
            {PATRON_MOVES.find(m => m.id === lastRound.patronMove)?.label}
          </div>
        {:else if gameState.patronPick}
          <div class="pick-badge badge-patron locked" in:fade={{ duration: 150 }}>✓ Choix verrouillé</div>
        {/if}

        {#if phase === 'picking' && !gameState.patronPick && startSide !== 'salarie'}
          <div class="action-grid" in:fade={{ duration: 150 }}>
            {#each PATRON_MOVES as move}
              <button
                type="button"
                class="action-btn btn-patron"
                onclick={() => choosePatron(move.id)}
                title={move.intent}
              >
                <span class="action-icon">{move.icon}</span>
                <span class="action-label">{move.label}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>

  {:else}
    <!-- FIN DE MATCH -->
    {#if gameState.matchOutcome}
      {@const ol = outcomeLabel(gameState.matchOutcome)}
      <div class="outcome-screen" in:fade={{ duration: 400 }}>
        <div class="outcome-emoji">{ol?.emoji}</div>
        <h2 class="outcome-title">{ol?.title}</h2>
        <p class="outcome-subtitle">{ol?.subtitle}</p>
        <div class="outcome-sides">
          <div class="outcome-side salarie-outcome">
            <div class="outcome-side-label">Syndicat</div>
            <p>{ol?.salarie}</p>
          </div>
          <div class="outcome-side patron-outcome">
            <div class="outcome-side-label">Patronat</div>
            <p>{ol?.patron}</p>
          </div>
        </div>
        <!-- Historique -->
        <div class="history-strip">
          {#each gameState.history as r}
            <div class="history-item">
              <span class="h-icon">{SALARIE_MOVES.find(m=>m.id===r.salarieMove)?.icon}</span>
              <span class="h-vs">vs</span>
              <span class="h-icon">{PATRON_MOVES.find(m=>m.id===r.patronMove)?.icon}</span>
              <span class="h-delta" class:positive={r.delta > 0} class:negative={r.delta < 0}>
                {r.delta > 0 ? '+' : ''}{r.delta}
              </span>
            </div>
          {/each}
        </div>
        <div class="outcome-actions">
          {#if embedded && onresolve && gameState.matchOutcome}
            <button class="outcome-btn primary" onclick={handleEnd}>Appliquer les effets →</button>
          {/if}
          <button class="outcome-btn secondary" onclick={restart}>Rejouer</button>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .table-atelier {
    font-family: var(--font-body, 'Inter', sans-serif);
    background: #0c0a09;
    color: #e7e0d5;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .standalone-mode { min-height: 100vh; }
  .embedded-mode { min-height: 0; border-radius: 0.5rem; overflow: hidden; }

  .atelier-header { border-bottom: 1px solid #292524; padding: 0.75rem 1rem; }
  .header-inner { max-width: 900px; margin: 0 auto; display: flex; align-items: center; gap: 0.75rem; }
  .atelier-meta { flex: 1; }
  .atelier-tag { font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: #78716c; }
  .atelier-title { font-size: 1.1rem; font-weight: 700; color: #C9A84C; margin: 0; }
  .round-badge { font-size: 0.75rem; background: #1c1917; border: 1px solid #44403c; border-radius: 999px; padding: 0.25rem 0.75rem; color: #a8a29e; }
  .skip-btn { font-size: 0.75rem; color: #78716c; background: none; border: 1px solid #44403c; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; }
  .skip-btn:hover { color: #e7e0d5; }

  /* ZONE CURSOR */
  .zone-track-wrapper { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; max-width: 900px; margin: 0 auto; width: 100%; }
  .zone-label-left, .zone-label-right { font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; color: #57534e; white-space: nowrap; }
  .zone-track { flex: 1; height: 8px; background: #1c1917; border-radius: 4px; position: relative; overflow: visible; }
  .zone-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
  .zone-threshold { position: absolute; top: -3px; width: 2px; height: 14px; background: #44403c; border-radius: 1px; transform: translateX(-1px); }
  .zone-center-label { text-align: center; font-size: 0.75rem; font-weight: 600; padding-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
  .bonus-badge { font-size: 0.65rem; background: #2a2218; border: 1px solid #6b5c2e; border-radius: 999px; padding: 0.1rem 0.4rem; color: #C9A84C; }
  .bonus-badge.patron { background: #1a2030; border-color: #2d4a68; color: #6fa8d6; }

  /* TERRAIN SPLIT */
  .terrain-split { flex: 1; display: grid; grid-template-columns: 1fr auto 1fr; gap: 0; max-width: 900px; margin: 0 auto; width: 100%; padding: 0 0.5rem; }

  /* SIDE PANELS */
  .side-panel { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.75rem; }
  .side-salarie { border-right: 1px solid #292524; }
  .side-patron { border-left: 1px solid #292524; }
  .side-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
  .patron-header { flex-direction: row-reverse; }
  .side-avatar { width: 40px; height: 46px; flex-shrink: 0; }
  .side-name { font-weight: 700; font-size: 0.8rem; letter-spacing: 0.06em; }
  .side-salarie .side-name { color: #ef4444; }
  .side-patron .side-name { color: #60a5fa; }
  .side-role { font-size: 0.6rem; color: #78716c; }

  .pick-badge { font-size: 0.7rem; border-radius: 4px; padding: 0.3rem 0.5rem; font-weight: 600; }
  .badge-salarie { background: #2a0f0f; border: 1px solid #7f1d1d; color: #fca5a5; }
  .badge-patron  { background: #0f1929; border: 1px solid #1e3a5f; color: #93c5fd; }
  .pick-badge.locked { opacity: 0.7; }

  .action-grid { display: flex; flex-direction: column; gap: 0.3rem; }
  .action-btn { display: flex; align-items: center; gap: 0.4rem; border: 1px solid #292524; border-radius: 6px; padding: 0.4rem 0.6rem; cursor: pointer; font-size: 0.72rem; transition: all 0.12s; background: #0c0a09; color: #a8a29e; width: 100%; text-align: left; }
  .btn-salarie:hover { background: #2a0f0f; border-color: #7f1d1d; color: #fca5a5; }
  .btn-patron:hover  { background: #0f1929; border-color: #1e3a5f; color: #93c5fd; }
  .action-icon { font-size: 1rem; line-height: 1; }
  .action-label { font-weight: 600; letter-spacing: 0.04em; }

  /* CENTRE */
  .center-story { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.75rem 0.5rem; min-width: 140px; max-width: 220px; }
  .center-instructions { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; text-align: center; }
  .table-svg-wrapper { opacity: 0.5; }
  .table-svg { width: 90px; }
  .center-hint { font-size: 0.65rem; color: #57534e; text-align: center; margin: 0; }

  .resolving-anim { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; animation: pulse 0.7s ease-in-out infinite; }
  .vs-text { font-size: 0.7rem; color: #78716c; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

  .story-card { background: #1c1917; border: 1px solid #44403c; border-radius: 8px; padding: 0.75rem; text-align: center; display: flex; flex-direction: column; gap: 0.4rem; }
  .story-outcome { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; }
  .outcome-salarie { color: #ef4444; }
  .outcome-patron  { color: #60a5fa; }
  .story-text { font-size: 0.7rem; color: #a8a29e; margin: 0; line-height: 1.4; font-style: italic; }
  .delta-badge { font-size: 0.7rem; font-weight: 700; border-radius: 999px; padding: 0.15rem 0.5rem; background: #292524; }
  .delta-badge.delta-pos { color: #4ade80; background: #052e16; }
  .delta-badge.delta-neg { color: #f87171; background: #2a0f0f; }
  .continue-btn { background: #C9A84C22; border: 1px solid #C9A84C66; color: #C9A84C; border-radius: 6px; padding: 0.4rem 0.75rem; font-size: 0.7rem; cursor: pointer; transition: all 0.15s; }
  .continue-btn:hover { background: #C9A84C44; }

  /* OUTCOME SCREEN */
  .outcome-screen { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 1.5rem 1rem; gap: 0.75rem; max-width: 700px; margin: 0 auto; width: 100%; }
  .outcome-emoji { font-size: 2.5rem; }
  .outcome-title { font-size: 1.4rem; font-weight: 800; letter-spacing: 0.06em; color: #C9A84C; margin: 0; text-align: center; }
  .outcome-subtitle { font-size: 0.8rem; color: #a8a29e; margin: 0; text-align: center; }
  .outcome-sides { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; width: 100%; }
  .outcome-side { border-radius: 8px; padding: 0.75rem; font-size: 0.75rem; line-height: 1.5; }
  .salarie-outcome { background: #2a0f0f; border: 1px solid #7f1d1d; color: #fca5a5; }
  .patron-outcome  { background: #0f1929; border: 1px solid #1e3a5f; color: #93c5fd; }
  .outcome-side-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.7; margin-bottom: 0.25rem; }

  .history-strip { display: flex; gap: 0.5rem; }
  .history-item { display: flex; align-items: center; gap: 0.2rem; background: #1c1917; border: 1px solid #292524; border-radius: 6px; padding: 0.3rem 0.5rem; font-size: 0.75rem; }
  .h-vs { color: #57534e; font-size: 0.55rem; }
  .h-delta { font-weight: 700; font-size: 0.65rem; }
  .h-delta.positive { color: #4ade80; }
  .h-delta.negative { color: #f87171; }

  .outcome-actions { display: flex; gap: 0.5rem; }
  .outcome-btn { border-radius: 8px; padding: 0.6rem 1.25rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; }
  .outcome-btn.primary { background: #C9A84C22; border-color: #C9A84C66; color: #C9A84C; }
  .outcome-btn.primary:hover { background: #C9A84C44; }
  .outcome-btn.secondary { background: #1c1917; border-color: #44403c; color: #a8a29e; }
  .outcome-btn.secondary:hover { color: #e7e0d5; }
</style>
