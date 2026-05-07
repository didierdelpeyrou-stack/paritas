<script lang="ts">
  /**
   * Confrontation.svelte — Atelier "La Rue"
   * Police vs Manifestants — 1v1 / 2v2 / 3v3 / 4v4 local.
   *
   * Deux joueurs sur le même écran.
   * 3 rounds de choix simultanés → zone cursor → vainqueur.
   *
   * Props :
   *   onresolve  — résultat pour V2 (optionnel, standalone sinon)
   *   onskip     — passer (optionnel)
   *   embedded   — overlay mode
   *   startSide  — forcer un camp (si joueur solo dans V2)
   */
  import {
    startConfrSession,
    pickAction,
    resolveRound,
    nextRound,
    MANIF_ACTIONS,
    POLICE_ACTIONS,
    MATCH_OUTCOME_LABELS,
    zoneLabel,
    type ConfrState,
    type Side,
    type ManifAction,
    type PoliceAction,
    type MatchOutcome
  } from '../../game/ateliers/confrontation/engine';

  interface Props {
    onresolve?: (outcome: MatchOutcome) => void;
    onskip?: () => void;
    embedded?: boolean;
    startSide?: Side | null;
  }

  const { onresolve, onskip, embedded = false, startSide = null }: Props = $props();

  let state = $state<ConfrState>(startConfrSession());
  let resolving = $state(false);
  let showResult = $state(false);
  /* Snapshot des picks au moment du reveal (avant que resolveRound les efface) */
  let revealManifIcon = $state<string | null>(null);
  let revealPoliceIcon = $state<string | null>(null);

  /* En mode 1-joueur (V2), on incarne un camp et l'IA joue l'autre */
  const soloMode = $derived(startSide !== null);

  /* Actions disponibles */
  const manifActions = $derived(MANIF_ACTIONS);
  const policeActions = $derived(POLICE_ACTIONS);

  /* Lecture de la jauge */
  const zonePercent = $derived(state.zone);
  const zoneLbl = $derived(zoneLabel(state.zone));

  /* Couleur de la zone */
  const zoneColor = $derived(
    state.zone >= 65 ? '#c44a1a'
    : state.zone <= 35 ? '#334466'
    : '#666'
  );

  const lastRound = $derived(state.history.at(-1));
  const outcomeData = $derived(
    state.matchOutcome ? MATCH_OUTCOME_LABELS[state.matchOutcome] : null
  );

  /* ======================================================
     Picking logic
     ====================================================== */

  function pickManif(id: ManifAction) {
    if (state.phase !== 'picking' || state.manifPick) return;
    state = pickAction(state, 'manif', id);
    maybeTriggerResolve();
  }

  function pickPolice(id: PoliceAction) {
    if (state.phase !== 'picking' || state.policePick) return;
    // En mode solo côté manif, l'IA joue police
    if (soloMode && startSide === 'manif') return;
    state = pickAction(state, 'police', id);
    maybeTriggerResolve();
  }

  function maybeTriggerResolve() {
    // Si les deux ont choisi (ou si IA joue l'autre côté) → résoudre
    const cur = state;

    /* IA police (si solo manif) */
    if (soloMode && startSide === 'manif' && cur.manifPick && !cur.policePick) {
      const aiPick = aiPolice(cur);
      state = pickAction(state, 'police', aiPick);
    }

    /* IA manif (si solo police) */
    if (soloMode && startSide === 'police' && cur.policePick && !cur.manifPick) {
      const aiPick = aiManif(cur);
      state = pickAction(state, 'manif', aiPick);
    }

    /* Les deux ont choisi → résolution */
    if (state.manifPick && state.policePick) {
      triggerResolve();
    }
  }

  function triggerResolve() {
    // Snapshot des icônes AVANT le resolve (les picks seront clearés après)
    revealManifIcon = MANIF_ACTIONS.find(a => a.id === state.manifPick)?.icon ?? '?';
    revealPoliceIcon = POLICE_ACTIONS.find(a => a.id === state.policePick)?.icon ?? '?';
    resolving = true;

    setTimeout(() => {
      state = resolveRound(state);
      resolving = false;

      // FIX B2 : toujours montrer la narrative — même au dernier round
      // (phase peut être 'result' OU 'ended', dans les deux cas on flash la story)
      showResult = true;
      setTimeout(() => {
        showResult = false;
      }, 2400);
    }, 600);
  }

  function advanceRound() {
    if (state.phase === 'result') {
      state = nextRound(state);
    }
  }

  function finish() {
    if (state.matchOutcome && onresolve) {
      onresolve(state.matchOutcome);
    }
  }

  function restart() {
    state = startConfrSession();
  }

  /* ======================================================
     IA simple (random pondéré par zone)
     ====================================================== */

  function aiPolice(s: ConfrState): PoliceAction {
    // Si zone haute (manif gagne), police devient plus agressive
    const aggressive = s.zone > 55;
    const opts: PoliceAction[] = aggressive
      ? ['charge', 'lacrymo', 'nasse', 'charge', 'bouclier']
      : ['bouclier', 'lacrymo', 'bouclier', 'nasse', 'retraite'];
    return opts[Math.floor(Math.random() * opts.length)];
  }

  function aiManif(s: ConfrState): ManifAction {
    const aggressive = s.zone < 45;
    const opts: ManifAction[] = aggressive
      ? ['pousser', 'barricade', 'chanter', 'pousser', 'tenir']
      : ['tenir', 'chanter', 'reculer', 'tenir', 'barricade'];
    return opts[Math.floor(Math.random() * opts.length)];
  }
</script>

<div class="rue-root" class:overlay={embedded}>
  <div class="rue-shell">

    <!-- Header -->
    <div class="rue-header">
      <div>
        <span class="eyebrow">ATELIER · LA RUE</span>
        <h1>Police <span class="vs">VS</span> Manifestants</h1>
      </div>
      <div class="header-right">
        <span class="round-badge">ROUND {state.round}/3</span>
        {#if onskip}
          <button class="skip-btn" onclick={onskip}>Passer →</button>
        {/if}
      </div>
    </div>

    <!-- Zone cursor — le cœur du jeu -->
    <div class="zone-container">
      <div class="zone-label left">MANIFESTANTS</div>
      <div class="zone-track">
        <div class="zone-fill manif-fill" style="width: {zonePercent}%"></div>
        <div class="zone-cursor" style="left: {zonePercent}%"></div>
        <!-- Lignes de seuil -->
        <div class="threshold threshold-manif" title="Victoire manifestants"></div>
        <div class="threshold threshold-police" title="Victoire police"></div>
      </div>
      <div class="zone-label right">POLICE</div>
    </div>
    <div class="zone-status" style="color: {zoneColor}">{zoneLbl}</div>

    <!-- Terrain visuel (silhouettes SVG) -->
    <div class="terrain" class:tense={state.zone > 65 || state.zone < 35} class:resolving>
      <!-- Foule manifestants (gauche) -->
      <div class="crowd crowd-manif">
        {#each Array(Math.max(2, Math.round(state.zone / 12))) as _, i}
          <div class="figure manif-figure" style="animation-delay: {i * 0.12}s">
            <svg width="18" height="36" viewBox="0 0 18 36" fill="none">
              <circle cx="9" cy="6" r="5" fill="#c44a1a"/>
              <rect x="4" y="12" width="10" height="14" rx="2" fill="#c44a1a"/>
              <rect x="2" y="14" width="4" height="10" rx="2" fill="#a03818"/>
              <rect x="12" y="14" width="4" height="10" rx="2" fill="#a03818"/>
              <rect x="4" y="26" width="4" height="10" rx="2" fill="#7a2a10"/>
              <rect x="10" y="26" width="4" height="10" rx="2" fill="#7a2a10"/>
            </svg>
          </div>
        {/each}
        <!-- FIX B1 : pick visible SEULEMENT pendant la résolution ou après le round
             (jamais pendant la phase 'picking' → anti-peek multiplayer) -->
        {#if (resolving || showResult || state.phase === 'result' || state.phase === 'ended') && lastRound}
          <span class="pick-badge manif-badge">{MANIF_ACTIONS.find(a => a.id === lastRound.manifAction)?.icon}</span>
        {/if}
        <!-- Indicateur bonus moral actif -->
        {#if state.manifMoralBonus > 0 && state.phase === 'picking'}
          <span class="bonus-badge moral-badge" title="+{state.manifMoralBonus} au prochain win">🎵+{state.manifMoralBonus}</span>
        {/if}
      </div>

      <!-- Centre — ligne de confrontation -->
      <div class="front-line" class:active={resolving}>
        <div class="front-line-inner"></div>
      </div>

      <!-- CRS (droite) -->
      <div class="crowd crowd-police">
        <!-- FIX B1 : même logique — pick caché pendant 'picking' -->
        {#if (resolving || showResult || state.phase === 'result' || state.phase === 'ended') && lastRound}
          <span class="pick-badge police-badge">{POLICE_ACTIONS.find(a => a.id === lastRound.policeAction)?.icon}</span>
        {/if}
        <!-- Indicateur nasse bonus actif -->
        {#if state.policeNasseBonus > 0 && state.phase === 'picking'}
          <span class="bonus-badge nasse-badge" title="+{state.policeNasseBonus} bonus nasse">⬛+{state.policeNasseBonus}</span>
        {/if}
        {#each Array(Math.max(2, Math.round((100 - state.zone) / 12))) as _, i}
          <div class="figure police-figure" style="animation-delay: {i * 0.15}s">
            <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
              <!-- casque -->
              <rect x="3" y="0" width="14" height="10" rx="3" fill="#334466"/>
              <circle cx="10" cy="6" r="4" fill="#445577"/>
              <!-- bouclier -->
              <rect x="0" y="12" width="8" height="16" rx="1" fill="#2a3a55"/>
              <!-- corps -->
              <rect x="8" y="12" width="8" height="14" rx="2" fill="#334466"/>
              <rect x="16" y="14" width="4" height="10" rx="2" fill="#2a3a55"/>
              <rect x="4" y="26" width="4" height="10" rx="2" fill="#223344"/>
              <rect x="12" y="26" width="4" height="10" rx="2" fill="#223344"/>
            </svg>
          </div>
        {/each}
      </div>
    </div>

    <!-- Narrative flash de round -->
    {#if (state.phase === 'result' || showResult) && lastRound}
      <div class="round-story" class:manif-story={lastRound.outcome === 'manif_wins'} class:police-story={lastRound.outcome === 'police_wins'}>
        <span class="story-outcome">
          {lastRound.outcome === 'manif_wins' ? '✊ Manifestants' : lastRound.outcome === 'police_wins' ? '🛡️ Police' : '⚖️ Égalité'}
        </span>
        <p>{lastRound.story}</p>
        {#if state.phase === 'result'}
          <button class="next-round-btn" onclick={advanceRound}>
            {state.round < 3 ? `Round ${state.round} →` : 'Voir le résultat →'}
          </button>
        {/if}
      </div>
    {/if}

    <!-- Picking phase — deux côtés -->
    {#if state.phase === 'picking' && !resolving}
      <div class="picking-arena">

        <!-- Côté Manifestants -->
        <div class="side side-manif" class:picked={!!state.manifPick}>
          <div class="side-title">
            {#if soloMode && startSide === 'police'}
              <span class="ia-badge">IA</span>
            {/if}
            ✊ MANIFESTANTS
          </div>
          <div class="actions-col">
            {#each manifActions as action}
              <button
                class="action-btn manif-btn"
                class:selected={state.manifPick === action.id}
                class:disabled-btn={!!state.manifPick || (soloMode && startSide === 'police')}
                onclick={() => pickManif(action.id)}
                disabled={!!state.manifPick || (soloMode && startSide === 'police')}
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
        <div class="side side-police" class:picked={!!state.policePick}>
          <div class="side-title">
            🛡️ POLICE
            {#if soloMode && startSide === 'manif'}
              <span class="ia-badge">IA</span>
            {/if}
          </div>
          <div class="actions-col">
            {#each policeActions as action}
              <button
                class="action-btn police-btn"
                class:selected={state.policePick === action.id}
                class:disabled-btn={!!state.policePick || (soloMode && startSide === 'manif')}
                onclick={() => pickPolice(action.id)}
                disabled={!!state.policePick || (soloMode && startSide === 'manif')}
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

    <!-- Resolving animation — utilise le snapshot capturé avant le resolve -->
    {#if resolving}
      <div class="resolving-flash">
        <div class="resolving-inner">
          <span>{revealManifIcon ?? '?'}</span>
          <span class="clash">⚡</span>
          <span>{revealPoliceIcon ?? '?'}</span>
        </div>
      </div>
    {/if}

    <!-- Résultat final -->
    {#if state.phase === 'ended' && outcomeData}
      <div class="match-result outcome-{state.matchOutcome}">
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
          <button class="restart-btn" onclick={restart}>↺ Rejouer</button>
          {#if onresolve}
            <button class="finish-btn" onclick={finish}>Retourner au jeu →</button>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Historique compact des rounds -->
    {#if state.history.length > 0 && state.phase !== 'ended'}
      <div class="rounds-recap">
        {#each state.history as r, i}
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

  </div>
</div>

<style>
  /* ====== Root ====== */
  .rue-root {
    background: #080808;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Courier New', 'Consolas', monospace;
    color: #e8dcc8;
    padding: 1rem;
  }

  .rue-root.overlay {
    position: fixed;
    inset: 0;
    background: rgba(4, 4, 4, 0.96);
    z-index: 900;
    overflow-y: auto;
  }

  .rue-shell {
    max-width: 760px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* ====== Header ====== */
  .rue-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .eyebrow {
    display: block;
    font-size: 0.6rem;
    letter-spacing: 0.18em;
    color: #666;
    margin-bottom: 0.15rem;
  }

  .rue-header h1 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #fff;
    font-family: 'Georgia', serif;
  }

  .vs {
    color: #666;
    font-size: 1rem;
    font-family: 'Courier New', monospace;
    margin: 0 0.4rem;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .round-badge {
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    color: #b8860b;
    border: 1px solid #4a3010;
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
  }

  .skip-btn {
    background: transparent;
    border: 1px solid #222;
    color: #555;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.7rem;
    font-family: inherit;
    transition: all 0.2s;
  }
  .skip-btn:hover { border-color: #555; color: #888; }

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

  .figure {
    animation: breathe 2.5s ease-in-out infinite;
  }

  @keyframes breathe {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }

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

  /* Badges de bonus actifs (moral manif, nasse police) */
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

  /* ====== Responsive ====== */
  @media (max-width: 580px) {
    .picking-arena {
      grid-template-columns: 1fr;
    }
    .vs-divider { display: none; }
    .action-intent { display: none; }
    .side-police .action-btn { flex-direction: row; text-align: left; }
    .outcome-sides { grid-template-columns: 1fr; }
  }
</style>
