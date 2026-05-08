<script lang="ts">
  /* ============================================================
     LesElections.svelte — Atelier "Les Élections Professionnelles"
     Salarié vs Patron — allocation cachée sur 4 canaux, 3 scrutins.
     Mécanique : hidden allocation → dévoilement simultané.
     ============================================================ */
  import { fade, fly } from 'svelte/transition';
  import {
    startElectionSession, setElectionAlloc, resolveScrutin, nextScrutin,
    aiElectionAlloc, emptyAllocation, totalAllocation,
    CHANNEL_LABELS, CHANNEL_ICONS, CHANNEL_DESCRIPTIONS, CHANNEL_SEATS,
    ELECTION_OUTCOME_LABELS, electionOutcomeToV2Effects,
    BUDGET_PER_ROUND, ALL_CHANNELS,
    type ElectionState, type Allocation, type Channel, type ElectionSide
  } from '../../game/ateliers/elections/engine';

  interface Props {
    embedded?: boolean;
    startSide?: ElectionSide | null; // null=2J, 'salarie'=patron IA, 'patron'=salarié IA
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
  let gameState: ElectionState = $state(startElectionSession());
  let salarieAlloc: Allocation = $state(emptyAllocation());
  let patronAlloc: Allocation = $state(emptyAllocation());
  let salarieReady = $state(false);
  let patronReady  = $state(false);
  let revealing = $state(false);
  let showResult = $state(false);

  const phase = $derived(gameState.phase);
  const lastScrutin = $derived(gameState.history.at(-1) ?? null);
  const sBudgetLeft = $derived(BUDGET_PER_ROUND - totalAllocation(salarieAlloc));
  const pBudgetLeft = $derived(BUDGET_PER_ROUND - totalAllocation(patronAlloc));

  /* 21 sièges total dispo, majorité = 11 */
  const seatsPct = $derived({
    s: Math.round((gameState.salarieTotal / 21) * 100),
    p: Math.round((gameState.patronTotal  / 21) * 100)
  });

  /* ============================================================
     Actions
     ============================================================ */
  function confirmSalarie() {
    if (salarieReady || totalAllocation(salarieAlloc) > BUDGET_PER_ROUND) return;
    salarieReady = true;
    gameState = setElectionAlloc(gameState, 'salarie', { ...salarieAlloc });
    if (startSide === 'salarie') {
      /* IA patron confirme aussi */
      const ai = aiElectionAlloc(gameState, 'patron');
      patronAlloc = { ...ai };
      gameState = setElectionAlloc(gameState, 'patron', ai);
      patronReady = true;
    }
    if (salarieReady && patronReady) triggerReveal();
  }

  function confirmPatron() {
    if (patronReady || totalAllocation(patronAlloc) > BUDGET_PER_ROUND) return;
    patronReady = true;
    gameState = setElectionAlloc(gameState, 'patron', { ...patronAlloc });
    if (startSide === 'patron') {
      const ai = aiElectionAlloc(gameState, 'salarie');
      salarieAlloc = { ...ai };
      gameState = setElectionAlloc(gameState, 'salarie', ai);
      salarieReady = true;
    }
    if (salarieReady && patronReady) triggerReveal();
  }

  function triggerReveal() {
    revealing = true;
    showResult = false;
    setTimeout(() => {
      gameState = resolveScrutin(gameState);
      revealing = false;
      showResult = true;
    }, 800);
  }

  function continueScrutin() {
    showResult = false;
    salarieAlloc = emptyAllocation();
    patronAlloc  = emptyAllocation();
    salarieReady = false;
    patronReady  = false;
    if (gameState.phase === 'result') gameState = nextScrutin(gameState);
    else if (gameState.phase === 'ended') handleEnd();
  }

  function handleEnd() {
    if (onresolve && gameState.matchOutcome) onresolve(electionOutcomeToV2Effects(gameState.matchOutcome));
  }

  function restart() {
    gameState = startElectionSession();
    salarieAlloc = emptyAllocation();
    patronAlloc  = emptyAllocation();
    salarieReady = false;
    patronReady  = false;
    revealing = false;
    showResult = false;
  }

  function setAlloc(side: ElectionSide, channel: Channel, val: number) {
    if (side === 'salarie' && salarieReady) return;
    if (side === 'patron'  && patronReady)  return;
    if (side === 'salarie') {
      const newA = { ...salarieAlloc, [channel]: val };
      if (totalAllocation(newA) <= BUDGET_PER_ROUND) salarieAlloc = newA;
    } else {
      const newA = { ...patronAlloc, [channel]: val };
      if (totalAllocation(newA) <= BUDGET_PER_ROUND) patronAlloc = newA;
    }
  }

  function outcomeLabel(o: string | null) {
    if (!o) return null;
    return ELECTION_OUTCOME_LABELS[o as keyof typeof ELECTION_OUTCOME_LABELS] ?? null;
  }

  function winnerColor(w: string) {
    if (w === 'salarie') return '#ef4444';
    if (w === 'patron')  return '#3b82f6';
    return '#78716c';
  }
  function winnerLabel(w: string) {
    if (w === 'salarie') return '✊ Syndicat';
    if (w === 'patron')  return '🏛️ Direction';
    return '— Partagé';
  }

  /* ============================================================
     Tutoriel diégétique (ORDA-015 PARITAS, Yanis-19)
     Trois bullets en JE pour expliquer les Élections en ~20 secondes.
     Persistance localStorage.
     ============================================================ */
  let tutoDismissed = $state(false);
  if (typeof window !== 'undefined') {
    try { tutoDismissed = localStorage.getItem('paritas:tuto-elections-dismissed') === '1'; }
    catch { /* ignore */ }
  }
  function dismissTuto() {
    tutoDismissed = true;
    try { localStorage.setItem('paritas:tuto-elections-dismissed', '1'); } catch { /* ignore */ }
  }
  const showTuto = $derived(phase === 'allocating' && gameState.round === 1 && !tutoDismissed);
</script>

<div class="elec-atelier" class:embedded-mode={embedded}>

  <!-- HEADER -->
  <header class="e-header">
    <div class="e-header-inner">
      <div>
        <span class="e-tag">Atelier PARITAS</span>
        <h1 class="e-title">🗳️ Les Élections Professionnelles</h1>
      </div>
      <div class="e-scrutin">Scrutin {gameState.round}/3</div>
      {#if onskip}
        <button class="e-skip" onclick={onskip}>Passer →</button>
      {/if}
    </div>
  </header>

  <!-- TUTORIEL DIÉGÉTIQUE (1er scrutin) -->
  {#if showTuto}
    <aside class="atelier-tuto" role="note" aria-label="Comment ça marche">
      <div class="atelier-tuto-head">
        <span class="atelier-tuto-icon" aria-hidden="true">🗳️</span>
        <h2 class="atelier-tuto-title">Premier scrutin — comment je joue</h2>
        <button type="button" class="atelier-tuto-close" onclick={dismissTuto} aria-label="Fermer le tutoriel">×</button>
      </div>
      <ul class="atelier-tuto-list">
        <li><strong>Je dispose d'un budget</strong> de {BUDGET_PER_ROUND} points par scrutin à répartir sur quatre <em>canaux</em> (terrain, presse, listes, expertise). L'autre camp fait pareil, en aveugle.</li>
        <li><strong>Je dévoile</strong> simultanément avec l'adversaire — le canal le mieux investi rafle ses sièges. Diversifier = plus stable, concentrer = coup de poker.</li>
        <li><strong>Je vise 11 sièges sur 21</strong> en trois scrutins. Au-delà, j'ai la majorité au CSE et je verrouille la doctrine d'établissement.</li>
      </ul>
    </aside>
  {/if}

  <!-- SCORE SIÈGES -->
  <div class="seats-row">
    <div class="seats-side salarie-seats">
      <span class="seats-label">✊ Syndicat</span>
      <span class="seats-count">{gameState.salarieTotal}</span>
      <span class="seats-total">/ 21 sièges</span>
      {#if gameState.salarieTotal >= 11}
        <span class="seats-majority">MAJORITÉ</span>
      {/if}
    </div>
    <!-- Barre de sièges -->
    <div class="seats-track">
      <div class="seats-fill salarie-fill" style="width: {seatsPct.s}%"></div>
      <div class="seats-fill patron-fill" style="width: {seatsPct.p}%; right:0"></div>
      <div class="seats-threshold"></div>
    </div>
    <div class="seats-side patron-seats">
      {#if gameState.patronTotal >= 11}
        <span class="seats-majority patron-maj">MAJORITÉ</span>
      {/if}
      <span class="seats-total">/ 21 sièges</span>
      <span class="seats-count">{gameState.patronTotal}</span>
      <span class="seats-label">🏛️ Direction</span>
    </div>
  </div>
  <div class="seats-info">Majorité absolue : 11 sièges sur 21</div>

  <!-- PHASE PRINCIPALE -->
  {#if phase !== 'ended'}
    <div class="e-main">

      <!-- RÉSULTAT SCRUTIN PRÉCÉDENT (si showResult) -->
      {#if (showResult || phase === 'result') && lastScrutin}
        <div class="scrutin-result" in:fly={{ y: -10, duration: 300 }}>
          <div class="sr-title">Scrutin {lastScrutin.round} — résultats</div>
          <p class="sr-narrative">{lastScrutin.narrative}</p>
          <div class="sr-channels">
            {#each lastScrutin.channels as ch}
              <div class="sr-channel">
                <div class="sr-ch-icon">{CHANNEL_ICONS[ch.channel]}</div>
                <div class="sr-ch-name">{CHANNEL_LABELS[ch.channel]}</div>
                <div class="sr-ch-bar">
                  <div class="sr-bar-s" style="flex: {ch.salarieAlloc}; background: {ch.winner==='salarie' ? '#ef4444' : '#7f1d1d'}"></div>
                  <div class="sr-bar-sep"></div>
                  <div class="sr-bar-p" style="flex: {ch.patronAlloc}; background: {ch.winner==='patron' ? '#3b82f6' : '#1e3a5f'}"></div>
                </div>
                <div class="sr-ch-winner" style="color:{winnerColor(ch.winner)}">
                  {winnerLabel(ch.winner)}
                  {#if ch.seats > 0} +{ch.seats}{/if}
                </div>
              </div>
            {/each}
          </div>
          <div class="sr-seats-delta">
            <span class="s-delta">Syndicat : +{lastScrutin.salarieSeats} siège{lastScrutin.salarieSeats > 1 ? 's' : ''}</span>
            <span class="p-delta">Direction : +{lastScrutin.patronSeats} siège{lastScrutin.patronSeats > 1 ? 's' : ''}</span>
          </div>
          <button class="e-continue" onclick={continueScrutin}>
            {phase === 'result' ? `Scrutin ${gameState.round} →` : 'Voir le résultat final'}
          </button>
        </div>

      {:else if revealing}
        <!-- Animation dévoilement -->
        <div class="revealing-anim" in:fade={{ duration: 100 }}>
          <div class="rev-icon">🗳️</div>
          <div class="rev-text">Dépouillement en cours…</div>
        </div>

      {:else}
        <!-- ALLOCATION -->
        <div class="allocation-grid">
          <!-- SALARIÉ -->
          <div class="alloc-panel alloc-salarie">
            <div class="alloc-header">
              <div>
                <div class="alloc-name">✊ Syndicat</div>
                <div class="alloc-sub">Section syndicale CGT / CFDT</div>
              </div>
              <div class="alloc-budget" class:budget-low={sBudgetLeft <= 1}>
                Budget restant : <strong>{sBudgetLeft}</strong> / {BUDGET_PER_ROUND}
              </div>
            </div>

            {#if !salarieReady && startSide !== 'patron'}
              <div class="alloc-channels">
                {#each ALL_CHANNELS as channel}
                  <div class="alloc-channel">
                    <div class="ch-header">
                      <span class="ch-icon">{CHANNEL_ICONS[channel]}</span>
                      <div>
                        <div class="ch-name">{CHANNEL_LABELS[channel]}</div>
                        <div class="ch-desc">{CHANNEL_DESCRIPTIONS[channel]}</div>
                      </div>
                    </div>
                    <div class="ch-slider">
                      <input
                        type="range"
                        min="0"
                        max={Math.min(8, salarieAlloc[channel] + sBudgetLeft)}
                        bind:value={salarieAlloc[channel]}
                        oninput={(e) => setAlloc('salarie', channel, Number((e.target as HTMLInputElement).value))}
                        class="slider-salarie"
                      />
                      <span class="ch-val">{salarieAlloc[channel]}</span>
                    </div>
                  </div>
                {/each}
              </div>
              <button
                class="alloc-confirm confirm-salarie"
                disabled={totalAllocation(salarieAlloc) === 0}
                onclick={confirmSalarie}
              >
                Valider l'allocation →
              </button>
            {:else if salarieReady}
              <div class="alloc-locked">
                <div class="locked-icon">🔒</div>
                <div class="locked-text">Allocation validée. En attente de l'adversaire…</div>
                <!-- Afficher l'allocation masquée (en attente du dévoilement) -->
                <div class="locked-summary">
                  {#each ALL_CHANNELS as ch}
                    {#if salarieAlloc[ch] > 0}
                      <span class="ls-chip">{CHANNEL_ICONS[ch]} {salarieAlloc[ch]}</span>
                    {/if}
                  {/each}
                </div>
              </div>
            {:else}
              <!-- IA joue ce side -->
              <div class="alloc-ia">
                <div class="ia-icon">🤖</div>
                <div class="ia-text">La section syndicale alloue son budget…</div>
              </div>
            {/if}
          </div>

          <!-- SÉPARATEUR -->
          <div class="alloc-sep">
            <div class="sep-line"></div>
            <div class="sep-label">VS</div>
            <div class="sep-line"></div>
          </div>

          <!-- PATRON -->
          <div class="alloc-panel alloc-patron">
            <div class="alloc-header">
              <div class="alloc-budget" class:budget-low={pBudgetLeft <= 1}>
                Budget restant : <strong>{pBudgetLeft}</strong> / {BUDGET_PER_ROUND}
              </div>
              <div class="text-right">
                <div class="alloc-name patron-name">🏛️ Direction</div>
                <div class="alloc-sub">Liste proche de la direction</div>
              </div>
            </div>

            {#if !patronReady && startSide !== 'salarie'}
              <div class="alloc-channels">
                {#each ALL_CHANNELS as channel}
                  <div class="alloc-channel">
                    <div class="ch-header ch-header-right">
                      <div class="text-right">
                        <div class="ch-name">{CHANNEL_LABELS[channel]}</div>
                        <div class="ch-desc">{CHANNEL_DESCRIPTIONS[channel]}</div>
                      </div>
                      <span class="ch-icon">{CHANNEL_ICONS[channel]}</span>
                    </div>
                    <div class="ch-slider ch-slider-right">
                      <span class="ch-val">{patronAlloc[channel]}</span>
                      <input
                        type="range"
                        min="0"
                        max={Math.min(8, patronAlloc[channel] + pBudgetLeft)}
                        bind:value={patronAlloc[channel]}
                        oninput={(e) => setAlloc('patron', channel, Number((e.target as HTMLInputElement).value))}
                        class="slider-patron"
                      />
                    </div>
                  </div>
                {/each}
              </div>
              <button
                class="alloc-confirm confirm-patron"
                disabled={totalAllocation(patronAlloc) === 0}
                onclick={confirmPatron}
              >
                ← Valider l'allocation
              </button>
            {:else if patronReady}
              <div class="alloc-locked alloc-locked-right">
                <div class="locked-icon">🔒</div>
                <div class="locked-text">Allocation validée. En attente du syndicat…</div>
                <div class="locked-summary">
                  {#each ALL_CHANNELS as ch}
                    {#if patronAlloc[ch] > 0}
                      <span class="ls-chip patron-chip">{CHANNEL_ICONS[ch]} {patronAlloc[ch]}</span>
                    {/if}
                  {/each}
                </div>
              </div>
            {:else}
              <div class="alloc-ia alloc-ia-right">
                <div class="ia-icon">🤖</div>
                <div class="ia-text">La direction alloue son budget…</div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

  {:else}
    <!-- RÉSULTAT FINAL -->
    {#if gameState.matchOutcome}
      {@const ol = outcomeLabel(gameState.matchOutcome)}
      <div class="e-outcome" in:fade={{ duration: 300 }}>
        <div class="e-o-emoji">{ol?.emoji}</div>
        <h2 class="e-o-title">{ol?.title}</h2>
        <p class="e-o-sub">{ol?.subtitle}</p>

        <!-- Score final -->
        <div class="final-score">
          <div class="fs-side fs-salarie">
            <div class="fs-count">{gameState.salarieTotal}</div>
            <div class="fs-label">sièges Syndicat</div>
          </div>
          <div class="fs-sep">—</div>
          <div class="fs-side fs-patron">
            <div class="fs-count">{gameState.patronTotal}</div>
            <div class="fs-label">sièges Direction</div>
          </div>
        </div>

        <div class="e-o-sides">
          <div class="e-o-side eo-salarie"><p>{ol?.salarie}</p></div>
          <div class="e-o-side eo-patron"><p>{ol?.patron}</p></div>
        </div>

        <!-- Historique par scrutin -->
        <div class="e-o-history">
          {#each gameState.history as s}
            <div class="eoh-scrutin">
              <div class="eoh-title">Scrutin {s.round}</div>
              <div class="eoh-seats">
                <span class="eoh-s">+{s.salarieSeats} ✊</span>
                <span class="eoh-p">+{s.patronSeats} 🏛️</span>
              </div>
            </div>
          {/each}
        </div>

        <div class="e-o-actions">
          {#if embedded && onresolve}
            <button class="e-o-btn primary" onclick={handleEnd}>Appliquer →</button>
          {/if}
          <button class="e-o-btn secondary" onclick={restart}>Rejouer</button>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .elec-atelier { background:#0c0a09; color:#e7e0d5; min-height:100vh; display:flex; flex-direction:column; font-family:var(--font-body,'Inter',sans-serif); }
  .embedded-mode { min-height:0; }

  /* header */
  .e-header { border-bottom:1px solid #292524; padding:0.6rem 1rem; }
  .e-header-inner { max-width:900px; margin:0 auto; display:flex; align-items:center; gap:0.75rem; }
  .e-tag { font-size:0.6rem; text-transform:uppercase; letter-spacing:0.1em; color:#78716c; }
  .e-title { font-size:1rem; font-weight:700; color:#C9A84C; margin:0; }
  .e-scrutin { font-size:0.7rem; background:#1c1917; border:1px solid #44403c; border-radius:999px; padding:0.2rem 0.6rem; color:#a8a29e; white-space:nowrap; }
  .e-skip { font-size:0.7rem; color:#78716c; background:none; border:1px solid #44403c; padding:0.2rem 0.5rem; border-radius:4px; cursor:pointer; margin-left:auto; }

  /* Tutoriel diégétique (ORDA-015 PARITAS) */
  .atelier-tuto {
    background: linear-gradient(135deg, rgba(96,165,250,0.10), rgba(239,68,68,0.05));
    border: 1px solid #44403c;
    border-left: 3px solid #C9A84C;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    margin: 0.6rem auto;
    max-width: 900px;
    width: calc(100% - 2rem);
  }
  .atelier-tuto-head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; }
  .atelier-tuto-icon { font-size: 1.05rem; }
  .atelier-tuto-title { flex: 1; font-size: 0.85rem; font-weight: 700; color: #C9A84C; margin: 0; }
  .atelier-tuto-close {
    background: transparent; border: 1px solid #44403c; color: #a8a29e;
    width: 26px; height: 26px; border-radius: 4px; cursor: pointer;
    font-size: 1rem; line-height: 1;
  }
  .atelier-tuto-close:hover { border-color: #C9A84C; color: #C9A84C; }
  .atelier-tuto-list {
    margin: 0; padding-left: 1.1rem;
    font-size: 0.8rem; color: #d6d3d1; line-height: 1.55;
  }
  .atelier-tuto-list li { margin-bottom: 0.3rem; }
  .atelier-tuto-list li:last-child { margin-bottom: 0; }
  .atelier-tuto-list strong { color: #f5f5f4; }
  .atelier-tuto-list em { color: #C9A84C; font-style: normal; }

  /* Sièges */
  .seats-row { display:flex; align-items:center; gap:0.5rem; padding:0.5rem 1rem; max-width:900px; margin:0 auto; width:100%; }
  .seats-side { display:flex; align-items:center; gap:0.4rem; min-width:0; }
  .salarie-seats { flex-direction:row; }
  .patron-seats  { flex-direction:row-reverse; }
  .seats-label { font-size:0.68rem; font-weight:600; white-space:nowrap; }
  .salarie-seats .seats-label { color:#ef4444; }
  .patron-seats  .seats-label { color:#60a5fa; }
  .seats-count { font-size:1.1rem; font-weight:800; }
  .salarie-seats .seats-count { color:#ef4444; }
  .patron-seats  .seats-count { color:#60a5fa; }
  .seats-total { font-size:0.6rem; color:#57534e; white-space:nowrap; }
  .seats-majority { font-size:0.6rem; font-weight:700; background:#166534; border:1px solid #15803d; border-radius:999px; padding:0.1rem 0.4rem; color:#4ade80; white-space:nowrap; }
  .patron-maj { background:#1e3a5f; border-color:#2563eb; color:#93c5fd; }
  .seats-track { flex:1; height:10px; background:#1c1917; border-radius:5px; position:relative; overflow:hidden; }
  .seats-fill { position:absolute; top:0; height:100%; border-radius:5px; transition:width 0.5s; }
  .salarie-fill { left:0; background:#ef4444; }
  .patron-fill  { right:0; background:#3b82f6; }
  .seats-threshold { position:absolute; left:50%; top:0; width:2px; height:100%; background:#44403c; }
  .seats-info { text-align:center; font-size:0.6rem; color:#57534e; padding-bottom:0.25rem; }

  /* allocation grid */
  .e-main { flex:1; max-width:900px; margin:0 auto; width:100%; padding:0.5rem; }
  .allocation-grid { display:grid; grid-template-columns:1fr auto 1fr; gap:0; }
  .alloc-panel { display:flex; flex-direction:column; gap:0.5rem; padding:0.75rem; }
  .alloc-salarie { border-right:1px solid #292524; }
  .alloc-patron  { border-left:1px solid #292524; }
  .alloc-header { display:flex; align-items:flex-start; justify-content:space-between; gap:0.5rem; }
  .alloc-name { font-size:0.82rem; font-weight:700; }
  .alloc-salarie .alloc-name { color:#ef4444; }
  .patron-name { color:#60a5fa; }
  .alloc-sub { font-size:0.6rem; color:#78716c; }
  .alloc-budget { font-size:0.65rem; color:#a8a29e; text-align:right; white-space:nowrap; }
  .alloc-budget.budget-low { color:#fbbf24; }
  .alloc-budget strong { color:#e7e0d5; }

  .alloc-channels { display:flex; flex-direction:column; gap:0.5rem; }
  .alloc-channel { background:#111; border:1px solid #1c1917; border-radius:6px; padding:0.4rem 0.5rem; display:flex; flex-direction:column; gap:0.3rem; }
  .ch-header { display:flex; align-items:flex-start; gap:0.4rem; }
  .ch-header-right { flex-direction:row-reverse; }
  .ch-icon { font-size:1rem; flex-shrink:0; }
  .ch-name { font-size:0.7rem; font-weight:600; color:#e7e0d5; }
  .ch-desc { font-size:0.58rem; color:#78716c; }
  .ch-slider { display:flex; align-items:center; gap:0.4rem; }
  .ch-slider-right { flex-direction:row-reverse; }
  .ch-slider input { flex:1; accent-color:#ef4444; }
  .slider-patron { accent-color:#3b82f6; }
  .ch-val { font-size:0.7rem; font-weight:700; color:#C9A84C; min-width:16px; text-align:center; }

  .alloc-confirm { width:100%; border-radius:6px; padding:0.5rem; font-size:0.75rem; font-weight:600; cursor:pointer; transition:all 0.15s; border:1px solid transparent; }
  .confirm-salarie { background:#2a0f0f; border-color:#7f1d1d; color:#fca5a5; }
  .confirm-salarie:hover:not(:disabled) { background:#3a1515; }
  .confirm-patron  { background:#0f1929; border-color:#1e3a5f; color:#93c5fd; }
  .confirm-patron:hover:not(:disabled) { background:#162035; }
  .alloc-confirm:disabled { opacity:0.4; cursor:not-allowed; }

  .alloc-locked { display:flex; flex-direction:column; align-items:center; gap:0.4rem; padding:1rem 0; text-align:center; }
  .alloc-locked-right { align-items:center; }
  .locked-icon { font-size:1.5rem; opacity:0.5; }
  .locked-text { font-size:0.68rem; color:#78716c; }
  .locked-summary { display:flex; gap:0.3rem; flex-wrap:wrap; justify-content:center; }
  .ls-chip { background:#1c1917; border:1px solid #292524; border-radius:999px; padding:0.15rem 0.5rem; font-size:0.65rem; color:#C9A84C; }
  .patron-chip { color:#60a5fa; }

  .alloc-ia { display:flex; flex-direction:column; align-items:center; gap:0.4rem; padding:1rem 0; opacity:0.5; }
  .alloc-ia-right { align-items:center; }
  .ia-icon { font-size:1.5rem; }
  .ia-text { font-size:0.65rem; color:#78716c; text-align:center; }

  .alloc-sep { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0.5rem; gap:0.5rem; }
  .sep-line { width:1px; flex:1; background:#292524; }
  .sep-label { font-size:0.65rem; font-weight:700; color:#44403c; writing-mode:vertical-lr; letter-spacing:0.1em; }

  /* Révélation */
  .revealing-anim { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.75rem; padding:3rem 1rem; }
  .rev-icon { font-size:2.5rem; animation:pulse 0.8s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
  .rev-text { font-size:0.8rem; color:#78716c; }

  /* Résultat scrutin */
  .scrutin-result { background:#1c1917; border:1px solid #44403c; border-radius:10px; padding:1rem; margin:0.5rem; display:flex; flex-direction:column; gap:0.6rem; }
  .sr-title { font-size:0.75rem; font-weight:700; color:#C9A84C; text-transform:uppercase; letter-spacing:0.06em; }
  .sr-narrative { font-size:0.72rem; color:#a8a29e; font-style:italic; margin:0; line-height:1.4; }
  .sr-channels { display:flex; flex-direction:column; gap:0.4rem; }
  .sr-channel { display:grid; grid-template-columns:auto 1fr 2fr auto; align-items:center; gap:0.5rem; }
  .sr-ch-icon { font-size:1rem; }
  .sr-ch-name { font-size:0.65rem; color:#a8a29e; }
  .sr-ch-bar { height:8px; display:flex; border-radius:4px; overflow:hidden; background:#0c0a09; }
  .sr-bar-s, .sr-bar-p { height:100%; min-width:4px; transition:flex 0.4s; }
  .sr-bar-sep { width:2px; background:#0c0a09; flex-shrink:0; }
  .sr-ch-winner { font-size:0.62rem; font-weight:600; white-space:nowrap; }
  .sr-seats-delta { display:flex; justify-content:space-between; font-size:0.68rem; font-weight:600; }
  .s-delta { color:#ef4444; }
  .p-delta { color:#3b82f6; }
  .e-continue { background:#C9A84C22; border:1px solid #C9A84C55; color:#C9A84C; border-radius:6px; padding:0.5rem 1rem; font-size:0.72rem; cursor:pointer; width:100%; }

  /* Outcome final */
  .e-outcome { flex:1; display:flex; flex-direction:column; align-items:center; padding:1.25rem 1rem; gap:0.75rem; max-width:700px; margin:0 auto; width:100%; }
  .e-o-emoji { font-size:2.2rem; }
  .e-o-title { font-size:1.3rem; font-weight:800; color:#C9A84C; margin:0; text-align:center; }
  .e-o-sub { font-size:0.78rem; color:#a8a29e; margin:0; text-align:center; }
  .final-score { display:flex; align-items:center; gap:1.5rem; }
  .fs-side { text-align:center; }
  .fs-count { font-size:2rem; font-weight:900; }
  .fs-salarie .fs-count { color:#ef4444; }
  .fs-patron  .fs-count { color:#60a5fa; }
  .fs-label { font-size:0.65rem; color:#78716c; }
  .fs-sep { font-size:1.5rem; color:#44403c; }
  .e-o-sides { display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; width:100%; }
  .e-o-side { border-radius:8px; padding:0.6rem; font-size:0.72rem; line-height:1.4; }
  .eo-salarie { background:#2a0f0f; border:1px solid #7f1d1d; color:#fca5a5; }
  .eo-patron  { background:#0f1929; border:1px solid #1e3a5f; color:#93c5fd; }
  .e-o-history { display:flex; gap:0.5rem; }
  .eoh-scrutin { background:#1c1917; border:1px solid #292524; border-radius:6px; padding:0.4rem 0.6rem; text-align:center; }
  .eoh-title { font-size:0.6rem; color:#57534e; margin-bottom:0.2rem; }
  .eoh-seats { display:flex; flex-direction:column; gap:0.1rem; font-size:0.68rem; font-weight:600; }
  .eoh-s { color:#ef4444; }
  .eoh-p { color:#60a5fa; }
  .e-o-actions { display:flex; gap:0.4rem; }
  .e-o-btn { border-radius:7px; padding:0.5rem 1rem; font-size:0.78rem; font-weight:600; cursor:pointer; border:1px solid transparent; }
  .e-o-btn.primary { background:#C9A84C22; border-color:#C9A84C55; color:#C9A84C; }
  .e-o-btn.secondary { background:#1c1917; border-color:#44403c; color:#a8a29e; }
  .text-right { text-align:right; }
</style>
