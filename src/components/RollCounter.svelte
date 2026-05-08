<script lang="ts">
  /* ============================================================
     RollCounter.svelte — palmarès de tirages, style slot machine
     Compteur tabulaire qui pulse à chaque incrément.
     ============================================================ */
  import { game } from '$lib/stores/game.svelte';
  /* P1-12 (ORDA-009, AAR bêta-30 §V — Carmack #14) : lazy import
     de audio.ts → Tone.js (~265 KB) ne plombe plus le bundle initial.
     Pattern fire-and-forget : la fanfare se déclenche au premier
     jackpot, le module se charge en parallèle (~50-100 ms), pas
     d'await bloquant côté UI. */

  let stats = $derived(game.state.rollStats);
  let rate = $derived(stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0);

  /* Pulse à chaque incrément */
  let lastTotal = $state(0);
  let pulseTotal = $state(false);
  $effect(() => {
    if (stats.total !== lastTotal) {
      pulseTotal = true;
      setTimeout(() => (pulseTotal = false), 500);
      lastTotal = stats.total;
    }
  });

  let lastJackpots = $state(0);
  let pulseJackpot = $state(false);
  $effect(() => {
    if (stats.jackpots !== lastJackpots) {
      pulseJackpot = true;
      /* P1-12 — dynamic import de audio.ts. Premier appel : ~50-100 ms
         de chargement Tone.js. Suivants : module en cache (instant). */
      import('$lib/audio/audio')
        .then(mod => mod.audio.fanfare())
        .catch(() => { /* audio non dispo / bloqué : silence acceptable */ });
      setTimeout(() => (pulseJackpot = false), 800);
      lastJackpots = stats.jackpots;
    }
  });
</script>

<div class="counter">
  <div class="counter-head">
    <span class="counter-title">Palmarès du run</span>
    <span class="counter-rate" class:pulse={pulseTotal}>{rate}<span class="pct">%</span></span>
  </div>

  <div class="counter-grid">
    <div class="cell">
      <div class="cell-label">Tirages</div>
      <div class="cell-value" class:pulse={pulseTotal}>{stats.total}</div>
    </div>
    <div class="cell">
      <div class="cell-label">Succès</div>
      <div class="cell-value text-emerald">{stats.success}</div>
    </div>
    <div class="cell">
      <div class="cell-label">Échecs</div>
      <div class="cell-value text-rose">{stats.fail}</div>
    </div>
    <div class="cell jackpot">
      <div class="cell-label">🌟 Jackpots</div>
      <div class="cell-value text-gold" class:pulse={pulseJackpot}>{stats.jackpots}</div>
    </div>
    <div class="cell crit">
      <div class="cell-label">💥 Critiques</div>
      <div class="cell-value text-rose-deep">{stats.crits}</div>
    </div>
    <div class="cell">
      <div class="cell-label">Meilleur brut</div>
      <div class="cell-value">{stats.bestRoll || '—'}</div>
    </div>
  </div>

  {#if stats.longestStreak >= 3}
    <div class="streak">🔥 Plus longue série : <b>{stats.longestStreak}</b> succès</div>
  {/if}
</div>

<style>
  .counter {
    background: linear-gradient(180deg, rgba(13, 16, 20, 0.85), rgba(26, 31, 38, 0.5));
    border: 1px solid rgba(200, 155, 60, 0.3);
    border-radius: 10px;
    padding: 10px 12px;
    font-family: 'Cinzel', Georgia, serif;
  }

  .counter-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px dotted rgba(200, 155, 60, 0.25);
  }
  .counter-title {
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #c89b3c;
  }
  .counter-rate {
    font-size: 1.1rem;
    color: #5fb56b;
    font-weight: 700;
  }
  .counter-rate .pct { font-size: 0.78rem; color: #5fb56b; opacity: 0.7; margin-left: 1px; }

  .counter-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }
  .cell {
    background: rgba(15, 16, 20, 0.45);
    border: 1px solid rgba(42, 52, 65, 0.6);
    border-radius: 6px;
    padding: 5px 6px;
    text-align: center;
  }
  .cell.jackpot { border-color: rgba(200, 155, 60, 0.45); background: rgba(200, 155, 60, 0.06); }
  .cell.crit { border-color: rgba(192, 57, 43, 0.4); background: rgba(192, 57, 43, 0.04); }

  .cell-label {
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    color: rgba(200, 194, 177, 0.65);
    text-transform: uppercase;
  }
  .cell-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #ede4c9;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
    transition: color 0.2s;
  }
  .text-emerald { color: #5fb56b; }
  .text-rose { color: #e07a6e; }
  .text-rose-deep { color: #c0392b; }
  .text-gold { color: #ffe090; text-shadow: 0 0 8px rgba(255, 224, 144, 0.5); }

  .pulse { animation: cell-pulse 0.5s ease; }
  @keyframes cell-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.18); filter: brightness(1.4); }
    100% { transform: scale(1); }
  }

  .streak {
    margin-top: 8px;
    text-align: center;
    font-size: 0.72rem;
    color: #ede4c9;
    background: linear-gradient(90deg, rgba(224, 122, 58, 0.15), rgba(200, 155, 60, 0.15));
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid rgba(224, 122, 58, 0.3);
  }
  .streak b { color: #ffe090; }
</style>
