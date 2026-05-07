<script lang="ts">
  /* ============================================================
     LaGreve.svelte — Atelier "La Grève"
     Salarié vs Patron — attrition duale + zone de pression.
     5 rounds max. Deux barres asymétriques.
     ============================================================ */
  import { fade, fly } from 'svelte/transition';
  import {
    startGreveSession, pickGreveMove, resolveGreveRound, nextGreveRound,
    SALARIE_GREVE_MOVES, PATRON_GREVE_MOVES, GREVE_OUTCOME_LABELS,
    greveOutcomeToV2Effects,
    type GreveState, type SalarieGreveMove, type PatronGreveMove, type GreveSide
  } from '../../game/ateliers/greve/engine';

  interface Props {
    embedded?: boolean;
    startSide?: GreveSide | null;
    onresolve?: (effects: {
      confiance: number; rapportDeForce: number; santeSociale: number;
      legitimite: number; caisse: number; cohesionInterne: number;
    }) => void;
    onskip?: () => void;
  }
  let { embedded = false, startSide = null, onresolve, onskip }: Props = $props();

  let gameState: GreveState = $state(startGreveSession());
  let resolving = $state(false);
  let showResult = $state(false);
  let revealSalarieIcon = $state('');
  let revealPatronIcon  = $state('');

  const phase = $derived(gameState.phase);
  const lastRound = $derived(gameState.history.at(-1) ?? null);

  /* Couleurs barres */
  const solColor  = $derived(gameState.solidarite > 40 ? '#ef4444' : '#7f1d1d');
  const prodColor = $derived(gameState.production  > 40 ? '#3b82f6' : '#1e3a5f');
  const zoneColor = $derived(gameState.zone >= 65 ? '#C9A84C' : gameState.zone <= 34 ? '#7f1d1d' : '#78716c');

  /* IA */
  function aiPatron(): PatronGreveMove {
    const z = gameState.zone; const sol = gameState.solidarite;
    if (sol < 25) return 'lockout';
    if (z > 60) return 'juridique';
    const w: Record<PatronGreveMove, number> = {
      lockout: sol < 50 ? 4 : 1,
      recruter: 2,
      juridique: 2,
      negocier: z > 55 ? 2 : 0,
      conceder: z > 65 ? 2 : 0
    };
    return wrandom(w) as PatronGreveMove;
  }

  function aiSalarie(): SalarieGreveMove {
    const z = gameState.zone; const sol = gameState.solidarite;
    const w: Record<SalarieGreveMove, number> = {
      greve_totale: 2,
      greve_tournante: 2,
      caisse: sol < 40 ? 4 : 1,
      negocier: z > 55 ? 2 : 0,
      occuper: z < 40 ? 2 : 1
    };
    return wrandom(w) as SalarieGreveMove;
  }

  function wrandom(w: Record<string, number>): string {
    const e = Object.entries(w).filter(([,v]) => v > 0);
    const t = e.reduce((s,[,v]) => s+v, 0);
    let r = Math.random() * t;
    for (const [k,v] of e) { r -= v; if (r <= 0) return k; }
    return e[0][0];
  }

  function chooseSalarie(move: SalarieGreveMove) {
    if (phase !== 'picking' || gameState.salariePick) return;
    gameState = pickGreveMove(gameState, 'salarie', move);
    if (startSide === 'salarie' && !gameState.patronPick) gameState = pickGreveMove(gameState, 'patron', aiPatron());
    tryResolve();
  }

  function choosePatron(move: PatronGreveMove) {
    if (phase !== 'picking' || gameState.patronPick) return;
    gameState = pickGreveMove(gameState, 'patron', move);
    if (startSide === 'patron' && !gameState.salariePick) gameState = pickGreveMove(gameState, 'salarie', aiSalarie());
    tryResolve();
  }

  function tryResolve() {
    if (!gameState.salariePick || !gameState.patronPick) return;
    resolving = true;
    revealSalarieIcon = SALARIE_GREVE_MOVES.find(m => m.id === gameState.salariePick)?.icon ?? '';
    revealPatronIcon  = PATRON_GREVE_MOVES.find(m => m.id === gameState.patronPick)?.icon  ?? '';
    setTimeout(() => {
      gameState = resolveGreveRound(gameState);
      resolving = false;
      showResult = true;
    }, 700);
  }

  function continueRound() {
    showResult = false;
    if (gameState.phase === 'result') gameState = nextGreveRound(gameState);
    else if (gameState.phase === 'ended') handleEnd();
  }

  function handleEnd() {
    if (onresolve && gameState.matchOutcome) onresolve(greveOutcomeToV2Effects(gameState.matchOutcome));
  }

  function restart() { gameState = startGreveSession(); showResult = false; resolving = false; }

  function outcomeLabel(o: string | null) {
    if (!o) return null;
    return GREVE_OUTCOME_LABELS[o as keyof typeof GREVE_OUTCOME_LABELS] ?? null;
  }
</script>

<div class="greve-atelier" class:embedded-mode={embedded}>

  <!-- HEADER -->
  <header class="g-header">
    <div class="g-header-inner">
      <div>
        <span class="g-tag">Atelier PARITAS</span>
        <h1 class="g-title">⏱️ La Grève</h1>
      </div>
      <div class="g-round">Round {gameState.round}/5</div>
      {#if onskip}
        <button class="g-skip" onclick={onskip}>Passer →</button>
      {/if}
    </div>
  </header>

  <!-- JAUGES RESSOURCES -->
  <div class="resources-row">
    <!-- Solidarité -->
    <div class="resource-block">
      <div class="res-label">
        <span>✊ Solidarité</span>
        <span style="color: {solColor}; font-weight: 700">{gameState.solidarite}</span>
      </div>
      <div class="res-track">
        <div class="res-fill" style="width: {gameState.solidarite}%; background: {solColor}; transition: width 0.6s"></div>
      </div>
      {#if gameState.caisseBonus > 0}
        <div class="res-bonus">💰 Caisse active +{gameState.caisseBonus} prochain round</div>
      {/if}
    </div>

    <!-- Zone pression -->
    <div class="pressure-block">
      <div class="pres-label" style="color: {zoneColor}">
        Pression {gameState.zone}
      </div>
      <div class="pres-track">
        <div class="pres-fill" style="width: {gameState.zone}%; background: {zoneColor}; transition: width 0.6s"></div>
        <div class="pres-threshold" style="left: 34%"></div>
        <div class="pres-threshold" style="left: 65%"></div>
      </div>
    </div>

    <!-- Production -->
    <div class="resource-block resource-right">
      <div class="res-label">
        <span style="color: {prodColor}; font-weight: 700">{gameState.production}</span>
        <span>Production 🏭</span>
      </div>
      <div class="res-track">
        <div class="res-fill" style="width: {gameState.production}%; background: {prodColor}; transition: width 0.6s; float: right"></div>
      </div>
    </div>
  </div>

  <!-- TERRAIN -->
  {#if phase !== 'ended'}
    <div class="g-terrain">
      <!-- SALARIÉ -->
      <div class="g-side g-salarie">
        <div class="g-side-header">
          <svg viewBox="0 0 48 56" class="g-avatar">
            <!-- foule stylisée : 3 silhouettes -->
            <circle cx="10" cy="18" r="6" fill="#D9291A"/>
            <rect x="5" y="24" width="10" height="14" rx="2" fill="#B81A12"/>
            <circle cx="24" cy="14" r="7" fill="#D9291A"/>
            <rect x="18" y="22" width="12" height="16" rx="2" fill="#B81A12"/>
            <circle cx="38" cy="18" r="6" fill="#D9291A"/>
            <rect x="33" y="24" width="10" height="14" rx="2" fill="#B81A12"/>
            <!-- Banderole -->
            <rect x="4" y="34" width="40" height="6" rx="2" fill="#C9A84C" opacity="0.8"/>
            <text x="24" y="40" text-anchor="middle" font-size="4" fill="#080808" font-weight="bold">EN GRÈVE</text>
          </svg>
          <div>
            <div class="g-name salarie">GRÉVISTES</div>
            <div class="g-role">Section syndicale</div>
          </div>
        </div>

        {#if (resolving || showResult) && lastRound}
          <div class="g-pick-badge g-badge-salarie">
            {SALARIE_GREVE_MOVES.find(m=>m.id===lastRound.salarieMove)?.icon}
            {SALARIE_GREVE_MOVES.find(m=>m.id===lastRound.salarieMove)?.label}
          </div>
        {:else if gameState.salariePick}
          <div class="g-pick-badge g-badge-salarie locked">✓ Posture choisie</div>
        {/if}

        {#if phase === 'picking' && !gameState.salariePick && startSide !== 'patron'}
          <div class="g-actions">
            {#each SALARIE_GREVE_MOVES as move}
              <button type="button" class="g-btn g-btn-salarie" onclick={() => chooseSalarie(move.id)} title={move.intent}>
                <span class="g-icon">{move.icon}</span>
                <div>
                  <div class="g-btn-label">{move.label}</div>
                  <div class="g-costs">
                    {#if move.dSolidarite !== 0}
                      <span class={move.dSolidarite < 0 ? 'cost-neg' : 'cost-pos'}>
                        Sol {move.dSolidarite > 0 ? '+' : ''}{move.dSolidarite}
                      </span>
                    {/if}
                    {#if move.dProduction !== 0}
                      <span class={move.dProduction < 0 ? 'cost-neg2' : 'cost-pos2'}>
                        Prod {move.dProduction > 0 ? '+' : ''}{move.dProduction}
                      </span>
                    {/if}
                    <span class={move.dZone > 0 ? 'cost-pos' : 'cost-neg'}>
                      P {move.dZone > 0 ? '+' : ''}{move.dZone}
                    </span>
                  </div>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- CENTRE -->
      <div class="g-center">
        {#if resolving}
          <div class="g-resolving">
            <span>{revealSalarieIcon}</span>
            <span class="g-vs">vs</span>
            <span>{revealPatronIcon}</span>
          </div>
        {:else if (showResult || phase === 'result') && lastRound}
          <div class="g-story" in:fly={{ y: -8, duration: 250 }}>
            <div class="g-outcome-label"
              class:win-s={lastRound.outcome === 'salarie_wins'}
              class:win-p={lastRound.outcome === 'patron_wins'}
              class:win-o={lastRound.outcome === 'ouverture'}>
              {lastRound.outcome === 'salarie_wins' ? '✊ Grévistes' :
               lastRound.outcome === 'patron_wins'  ? '🏭 Direction' :
               lastRound.outcome === 'ouverture'    ? '🤝 Ouverture' : '⚖️ Égal'}
            </div>
            <p class="g-story-text">{lastRound.story}</p>
            <div class="g-deltas">
              {#if lastRound.dSolidarite !== 0}
                <span class={lastRound.dSolidarite > 0 ? 'dpos' : 'dneg'}>Sol {lastRound.dSolidarite > 0 ? '+' : ''}{lastRound.dSolidarite}</span>
              {/if}
              {#if lastRound.dProduction !== 0}
                <span class={lastRound.dProduction < 0 ? 'dneg2' : 'dpos2'}>Prod {lastRound.dProduction > 0 ? '+' : ''}{lastRound.dProduction}</span>
              {/if}
              <span class={lastRound.dZone > 0 ? 'dpos' : 'dneg'}>P {lastRound.dZone > 0 ? '+' : ''}{lastRound.dZone}</span>
            </div>
            <button class="g-continue" onclick={continueRound}>
              {phase === 'result' ? `Round ${gameState.round} →` : 'Voir le résultat'}
            </button>
          </div>
        {:else}
          <div class="g-idle">
            <!-- Usine SVG -->
            <svg viewBox="0 0 80 60" class="factory-svg">
              <rect x="10" y="30" width="60" height="28" rx="3" fill="#1c1917" stroke="#44403c" stroke-width="1.5"/>
              <rect x="15" y="20" width="14" height="18" rx="2" fill="#292524" stroke="#44403c"/>
              <rect x="33" y="24" width="14" height="14" rx="2" fill="#292524" stroke="#44403c"/>
              <!-- Cheminées -->
              <rect x="22" y="8" width="5" height="14" rx="2" fill="#44403c"/>
              <circle cx="24" cy="7" r="4" fill="#78716c" opacity="0.3"/>
              <!-- Fenêtres usine -->
              <rect x="20" y="36" width="8" height="8" rx="1" fill="#C9A84C" opacity="0.3"/>
              <rect x="36" y="36" width="8" height="8" rx="1" fill="#C9A84C" opacity="0.3"/>
              <rect x="52" y="36" width="8" height="8" rx="1" fill="#C9A84C" opacity="0.3"/>
            </svg>
            <p class="g-hint">Choisissez votre posture de grève.</p>
          </div>
        {/if}
      </div>

      <!-- PATRON -->
      <div class="g-side g-patron">
        <div class="g-side-header g-patron-header">
          <div class="text-right">
            <div class="g-name patron">DIRECTION</div>
            <div class="g-role">Représentants patronaux</div>
          </div>
          <svg viewBox="0 0 48 56" class="g-avatar">
            <!-- Bâtiment direction -->
            <rect x="6" y="16" width="36" height="36" rx="3" fill="#1e3a5f"/>
            <rect x="10" y="10" width="28" height="10" rx="2" fill="#162d4a"/>
            <!-- Fenêtres -->
            <rect x="10" y="22" width="8" height="8" rx="1" fill="#3b82f6" opacity="0.5"/>
            <rect x="20" y="22" width="8" height="8" rx="1" fill="#3b82f6" opacity="0.5"/>
            <rect x="30" y="22" width="8" height="8" rx="1" fill="#3b82f6" opacity="0.5"/>
            <rect x="10" y="34" width="8" height="8" rx="1" fill="#3b82f6" opacity="0.5"/>
            <rect x="30" y="34" width="8" height="8" rx="1" fill="#3b82f6" opacity="0.5"/>
            <!-- Entrée -->
            <rect x="18" y="42" width="12" height="10" rx="1" fill="#0f2236"/>
          </svg>
        </div>

        {#if (resolving || showResult) && lastRound}
          <div class="g-pick-badge g-badge-patron">
            {PATRON_GREVE_MOVES.find(m=>m.id===lastRound.patronMove)?.icon}
            {PATRON_GREVE_MOVES.find(m=>m.id===lastRound.patronMove)?.label}
          </div>
        {:else if gameState.patronPick}
          <div class="g-pick-badge g-badge-patron locked">✓ Posture choisie</div>
        {/if}

        {#if phase === 'picking' && !gameState.patronPick && startSide !== 'salarie'}
          <div class="g-actions">
            {#each PATRON_GREVE_MOVES as move}
              <button type="button" class="g-btn g-btn-patron" onclick={() => choosePatron(move.id)} title={move.intent}>
                <span class="g-icon">{move.icon}</span>
                <div>
                  <div class="g-btn-label">{move.label}</div>
                  <div class="g-costs">
                    {#if move.dSolidarite !== 0}
                      <span class={move.dSolidarite < 0 ? 'cost-neg' : 'cost-pos'}>
                        Sol {move.dSolidarite > 0 ? '+' : ''}{move.dSolidarite}
                      </span>
                    {/if}
                    {#if move.dProduction !== 0}
                      <span class={move.dProduction < 0 ? 'cost-neg2' : 'cost-pos2'}>
                        Prod {move.dProduction > 0 ? '+' : ''}{move.dProduction}
                      </span>
                    {/if}
                    <span class={move.dZone > 0 ? 'cost-pos' : 'cost-neg'}>
                      P {move.dZone > 0 ? '+' : ''}{move.dZone}
                    </span>
                  </div>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>

  {:else}
    <!-- OUTCOME FINAL -->
    {#if gameState.matchOutcome}
      {@const ol = outcomeLabel(gameState.matchOutcome)}
      <div class="g-outcome" in:fade={{ duration: 300 }}>
        <div class="g-o-emoji">{ol?.emoji}</div>
        <h2 class="g-o-title">{ol?.title}</h2>
        <p class="g-o-sub">{ol?.subtitle}</p>
        <div class="g-o-bars">
          <div class="g-o-bar">
            <span class="label-s">✊ Solidarité finale</span>
            <div class="mini-track"><div style="width:{gameState.solidarite}%; background: {solColor}" class="mini-fill"></div></div>
            <span class="val">{gameState.solidarite}</span>
          </div>
          <div class="g-o-bar">
            <span class="label-p">🏭 Production finale</span>
            <div class="mini-track"><div style="width:{gameState.production}%; background: {prodColor}" class="mini-fill"></div></div>
            <span class="val">{gameState.production}</span>
          </div>
        </div>
        <div class="g-o-sides">
          <div class="g-o-side go-salarie"><p>{ol?.salarie}</p></div>
          <div class="g-o-side go-patron"><p>{ol?.patron}</p></div>
        </div>
        <!-- Historique rounds -->
        <div class="g-o-history">
          {#each gameState.history as r, i}
            <div class="g-o-hist-item">
              <span class="hist-rnd">R{i+1}</span>
              <span>{SALARIE_GREVE_MOVES.find(m=>m.id===r.salarieMove)?.icon}</span>
              <span class="hist-vs">vs</span>
              <span>{PATRON_GREVE_MOVES.find(m=>m.id===r.patronMove)?.icon}</span>
              <span class="hist-d" class:dpos={r.dZone>0} class:dneg={r.dZone<0}>P{r.dZone>0?'+':''}{r.dZone}</span>
            </div>
          {/each}
        </div>
        <div class="g-o-actions">
          {#if embedded && onresolve}
            <button class="g-o-btn primary" onclick={handleEnd}>Appliquer →</button>
          {/if}
          <button class="g-o-btn secondary" onclick={restart}>Rejouer</button>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .greve-atelier { background:#0c0a09; color:#e7e0d5; min-height:100vh; display:flex; flex-direction:column; font-family:var(--font-body,'Inter',sans-serif); }
  .embedded-mode { min-height:0; }

  /* header */
  .g-header { border-bottom:1px solid #292524; padding:0.6rem 1rem; }
  .g-header-inner { max-width:900px; margin:0 auto; display:flex; align-items:center; gap:0.75rem; }
  .g-tag { font-size:0.6rem; text-transform:uppercase; letter-spacing:0.1em; color:#78716c; }
  .g-title { font-size:1.1rem; font-weight:700; color:#C9A84C; margin:0; }
  .g-round { font-size:0.7rem; background:#1c1917; border:1px solid #44403c; border-radius:999px; padding:0.2rem 0.6rem; color:#a8a29e; }
  .g-skip { font-size:0.7rem; color:#78716c; background:none; border:1px solid #44403c; padding:0.2rem 0.5rem; border-radius:4px; cursor:pointer; margin-left:auto; }

  /* ressources */
  .resources-row { display:grid; grid-template-columns:1fr auto 1fr; gap:0.75rem; padding:0.6rem 1rem; max-width:900px; margin:0 auto; width:100%; align-items:end; }
  .resource-block { display:flex; flex-direction:column; gap:0.25rem; }
  .resource-right { align-items:flex-end; }
  .res-label { display:flex; justify-content:space-between; font-size:0.7rem; color:#a8a29e; }
  .res-track { height:7px; background:#1c1917; border-radius:4px; overflow:hidden; }
  .res-fill { height:100%; border-radius:4px; }
  .res-bonus { font-size:0.6rem; color:#C9A84C; }
  .pressure-block { display:flex; flex-direction:column; align-items:center; gap:0.25rem; }
  .pres-label { font-size:0.7rem; font-weight:600; }
  .pres-track { width:80px; height:7px; background:#1c1917; border-radius:4px; position:relative; overflow:visible; }
  .pres-fill { height:100%; border-radius:4px; }
  .pres-threshold { position:absolute; top:-2px; width:2px; height:11px; background:#44403c; border-radius:1px; transform:translateX(-1px); }

  /* terrain */
  .g-terrain { flex:1; display:grid; grid-template-columns:1fr auto 1fr; max-width:900px; margin:0 auto; width:100%; padding:0 0.5rem; }
  .g-side { display:flex; flex-direction:column; gap:0.4rem; padding:0.75rem; }
  .g-salarie { border-right:1px solid #292524; }
  .g-patron  { border-left:1px solid #292524; }
  .g-side-header { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem; }
  .g-patron-header { flex-direction:row-reverse; }
  .g-avatar { width:44px; height:52px; flex-shrink:0; }
  .g-name { font-weight:700; font-size:0.78rem; letter-spacing:0.06em; }
  .g-name.salarie { color:#ef4444; }
  .g-name.patron  { color:#60a5fa; }
  .g-role { font-size:0.6rem; color:#78716c; }

  .g-pick-badge { font-size:0.68rem; border-radius:4px; padding:0.25rem 0.5rem; font-weight:600; }
  .g-badge-salarie { background:#2a0f0f; border:1px solid #7f1d1d; color:#fca5a5; }
  .g-badge-patron  { background:#0f1929; border:1px solid #1e3a5f; color:#93c5fd; }
  .g-pick-badge.locked { opacity:0.6; }

  .g-actions { display:flex; flex-direction:column; gap:0.25rem; }
  .g-btn { display:flex; align-items:flex-start; gap:0.4rem; border:1px solid #292524; border-radius:6px; padding:0.35rem 0.5rem; cursor:pointer; font-size:0.7rem; background:#0c0a09; color:#a8a29e; width:100%; text-align:left; transition:all 0.12s; }
  .g-btn-salarie:hover { background:#2a0f0f; border-color:#7f1d1d; color:#fca5a5; }
  .g-btn-patron:hover  { background:#0f1929; border-color:#1e3a5f; color:#93c5fd; }
  .g-icon { font-size:1rem; line-height:1; margin-top:1px; }
  .g-btn-label { font-weight:600; font-size:0.68rem; letter-spacing:0.04em; }
  .g-costs { display:flex; gap:0.3rem; margin-top:0.1rem; flex-wrap:wrap; }
  .cost-neg { color:#f87171; font-size:0.58rem; }
  .cost-pos { color:#4ade80; font-size:0.58rem; }
  .cost-neg2 { color:#60a5fa; font-size:0.58rem; }
  .cost-pos2 { color:#34d399; font-size:0.58rem; }

  /* centre */
  .g-center { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0.75rem 0.5rem; min-width:130px; max-width:200px; }
  .g-resolving { display:flex; align-items:center; gap:0.4rem; font-size:1.5rem; animation:pulse 0.7s infinite; }
  .g-vs { font-size:0.6rem; color:#78716c; }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
  .g-story { background:#1c1917; border:1px solid #44403c; border-radius:8px; padding:0.6rem; display:flex; flex-direction:column; gap:0.35rem; text-align:center; }
  .g-outcome-label { font-size:0.68rem; font-weight:700; letter-spacing:0.05em; }
  .win-s { color:#ef4444; }
  .win-p { color:#60a5fa; }
  .win-o { color:#C9A84C; }
  .g-story-text { font-size:0.65rem; color:#a8a29e; font-style:italic; line-height:1.4; margin:0; }
  .g-deltas { display:flex; gap:0.3rem; justify-content:center; flex-wrap:wrap; }
  .dpos { color:#4ade80; font-size:0.62rem; font-weight:600; }
  .dneg { color:#f87171; font-size:0.62rem; font-weight:600; }
  .dpos2 { color:#34d399; font-size:0.62rem; font-weight:600; }
  .dneg2 { color:#60a5fa; font-size:0.62rem; font-weight:600; }
  .g-continue { background:#C9A84C22; border:1px solid #C9A84C55; color:#C9A84C; border-radius:5px; padding:0.35rem 0.6rem; font-size:0.65rem; cursor:pointer; }
  .g-idle { display:flex; flex-direction:column; align-items:center; gap:0.4rem; opacity:0.6; }
  .factory-svg { width:70px; }
  .g-hint { font-size:0.62rem; color:#57534e; text-align:center; margin:0; }

  /* outcome screen */
  .g-outcome { flex:1; display:flex; flex-direction:column; align-items:center; padding:1.25rem 1rem; gap:0.6rem; max-width:700px; margin:0 auto; width:100%; }
  .g-o-emoji { font-size:2.2rem; }
  .g-o-title { font-size:1.3rem; font-weight:800; color:#C9A84C; margin:0; text-align:center; }
  .g-o-sub { font-size:0.78rem; color:#a8a29e; margin:0; text-align:center; }
  .g-o-bars { display:flex; flex-direction:column; gap:0.3rem; width:100%; max-width:400px; }
  .g-o-bar { display:flex; align-items:center; gap:0.5rem; font-size:0.68rem; }
  .label-s { color:#ef4444; width:120px; }
  .label-p { color:#60a5fa; width:120px; text-align:right; }
  .mini-track { flex:1; height:6px; background:#1c1917; border-radius:3px; overflow:hidden; }
  .mini-fill { height:100%; border-radius:3px; transition:width 0.5s; }
  .val { font-weight:700; width:24px; text-align:right; color:#a8a29e; }
  .g-o-sides { display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; width:100%; }
  .g-o-side { border-radius:8px; padding:0.6rem; font-size:0.72rem; line-height:1.4; }
  .go-salarie { background:#2a0f0f; border:1px solid #7f1d1d; color:#fca5a5; }
  .go-patron  { background:#0f1929; border:1px solid #1e3a5f; color:#93c5fd; }
  .g-o-history { display:flex; gap:0.4rem; flex-wrap:wrap; justify-content:center; }
  .g-o-hist-item { display:flex; align-items:center; gap:0.2rem; background:#1c1917; border:1px solid #292524; border-radius:5px; padding:0.25rem 0.4rem; font-size:0.68rem; }
  .hist-rnd { color:#57534e; font-size:0.58rem; }
  .hist-vs { color:#44403c; font-size:0.55rem; }
  .hist-d { font-weight:700; font-size:0.62rem; }
  .hist-d.dpos { color:#4ade80; }
  .hist-d.dneg { color:#f87171; }
  .g-o-actions { display:flex; gap:0.4rem; }
  .g-o-btn { border-radius:7px; padding:0.5rem 1rem; font-size:0.78rem; font-weight:600; cursor:pointer; border:1px solid transparent; }
  .g-o-btn.primary { background:#C9A84C22; border-color:#C9A84C55; color:#C9A84C; }
  .g-o-btn.secondary { background:#1c1917; border-color:#44403c; color:#a8a29e; }

  .text-right { text-align:right; }

  /* Argus IT B-IT5 : empty ruleset retiré. */
</style>
