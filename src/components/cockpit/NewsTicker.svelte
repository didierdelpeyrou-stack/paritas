<script lang="ts">
  /* ============================================================
     NewsTicker — bandeau d'actualités historiques en marquee
     ============================================================
     Fil continu sous la timeline des ères. 4 catégories (tech,
     géopolitique, politique, société). Certains items sont
     cliquables — ils ouvrent une quête secondaire compatible
     avec le camp du joueur.

     Emplacement UX : juste sous la era timeline, c'est l'autre
     dimension du "temps qui passe" (les ères = lent, le bandeau
     = présent). Hauteur fine (24px desktop / 22px mobile) pour
     ne pas coûter cher au viewport-fit.

     Respecte prefers-reduced-motion (Norman / Soueidan).
     ============================================================ */
  import { rebirth } from '../../game/engine/gameState.svelte';
  import {
    activeNews, isInteractive, categoryLabel, categoryColor,
    type HistoricalNews
  } from '../../game/content/historicalNews';
  import { sideEvents } from '$lib/stores/sideEvents.svelte';
  import { SIDE_EVENTS } from '../../game/content/sideEvents';

  const camp = $derived(rebirth.state?.camp ?? 'salarie');
  const turn = $derived(rebirth.state?.turn ?? 1);

  /* Items actifs au tour courant — refresh quand le tour change. */
  const items = $derived(activeNews(turn));

  /* Si on a moins de 6 items, on duplique pour que le marquee
     ait toujours l'air continu sans "trou" visible. */
  const renderItems = $derived(items.length < 6
    ? [...items, ...items, ...items]
    : items);

  /* Vitesse adaptée à la longueur totale (lignes plus longues =
     défilement plus lent pour la lisibilité). */
  const durationSec = $derived(Math.max(40, renderItems.length * 7));

  let reducedMotion = $state(false);
  $effect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => { reducedMotion = mq.matches; };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  });

  function onClick(item: HistoricalNews) {
    if (!isInteractive(item, camp)) return;
    /* Vérifier que l'événement est dans le pool, et qu'il n'a pas
     * déjà été joué — si c'est le cas, on ignore silencieusement
     * (l'item reste affiché mais sans effet). */
    const ev = SIDE_EVENTS.find(e => e.id === item.sideEventId);
    if (!ev) return;
    sideEvents.forceTrigger(item.sideEventId!);
  }

  function tooltipFor(item: HistoricalNews): string {
    const interactive = isInteractive(item, camp);
    const base = `${categoryLabel(item.category)} · ${item.year ?? ''}\n${item.headline}`;
    if (interactive) {
      return `${base}\n\n→ Clique pour t'engager dans cette affaire.`;
    }
    return base;
  }
</script>

{#if items.length > 0}
  <div class="news-ticker"
    class:reduced={reducedMotion}
    role="marquee"
    aria-label="Fil d'actualités historiques"
    style:--duration="{durationSec}s"
  >
    <div class="ticker-track">
      {#each renderItems as item, i (item.id + ':' + i)}
        {@const interactive = isInteractive(item, camp)}
        <button
          type="button"
          class="ticker-item"
          class:interactive
          style:--cat-color={categoryColor(item.category)}
          onclick={() => onClick(item)}
          title={tooltipFor(item)}
          tabindex={interactive ? 0 : -1}
          aria-disabled={!interactive}
        >
          <span class="cat-tag">{categoryLabel(item.category)}</span>
          {#if item.year}
            <span class="year">{item.year}</span>
          {/if}
          <span class="headline">{item.headline}</span>
          {#if interactive}
            <span class="action-glyph" aria-hidden="true">▸</span>
          {/if}
        </button>
        <span class="dot" aria-hidden="true">·</span>
      {/each}
    </div>
  </div>
{/if}

<style>
  .news-ticker {
    height: 24px;
    overflow: hidden;
    background: linear-gradient(180deg, #1A1108 0%, #120B07 100%);
    border-bottom: 1px solid rgba(201, 178, 106, 0.18);
    position: relative;
    /* Fade aux extrémités pour adoucir l'entrée/sortie des items */
    mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
    flex-shrink: 0;
  }

  .ticker-track {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    height: 100%;
    padding-left: 100%;            /* démarre hors viewport à droite */
    white-space: nowrap;
    animation: ticker-scroll var(--duration, 60s) linear infinite;
  }

  /* Pause au hover pour laisser lire / cliquer */
  .news-ticker:hover .ticker-track,
  .news-ticker:focus-within .ticker-track {
    animation-play-state: paused;
  }

  /* prefers-reduced-motion : pas de défilement, on liste les
     items lentement (slide manuel via scroll-x). */
  .news-ticker.reduced .ticker-track {
    animation: none;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-left: 0.6rem;
  }
  .news-ticker.reduced { mask-image: none; -webkit-mask-image: none; }

  @keyframes ticker-scroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }

  .ticker-item {
    --cat-color: #C9B26A;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0 0.55rem;
    height: 22px;
    background: transparent;
    border: 0;
    border-left: 2px solid color-mix(in srgb, var(--cat-color) 65%, transparent);
    border-radius: 0;
    color: rgba(244, 239, 226, 0.7);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.74rem;
    cursor: default;
    transition: color 0.18s ease, background 0.18s ease;
  }

  .ticker-item.interactive {
    cursor: pointer;
    color: #F4D58C;
    background: rgba(201, 178, 106, 0.05);
    text-shadow: 0 0 6px color-mix(in srgb, var(--cat-color) 35%, transparent);
  }

  .ticker-item.interactive:hover,
  .ticker-item.interactive:focus-visible {
    background: color-mix(in srgb, var(--cat-color) 18%, transparent);
    color: #fff;
    outline: none;
  }

  .cat-tag {
    display: inline-flex;
    align-items: center;
    padding: 0 0.4rem;
    height: 14px;
    background: color-mix(in srgb, var(--cat-color) 22%, transparent);
    border: 1px solid color-mix(in srgb, var(--cat-color) 55%, transparent);
    border-radius: 999px;
    color: var(--cat-color);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.55rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    line-height: 1;
  }

  .year {
    font-family: 'Courier Prime', monospace;
    font-size: 0.7rem;
    color: rgba(201, 178, 106, 0.7);
    font-weight: 700;
  }

  .headline {
    font-style: italic;
    font-size: 0.76rem;
    line-height: 1;
  }

  .action-glyph {
    color: var(--cat-color);
    font-weight: 700;
    margin-left: 0.2rem;
    animation: action-pulse 1.6s ease-in-out infinite;
  }

  @keyframes action-pulse {
    0%, 100% { opacity: 0.5; transform: translateX(0); }
    50%      { opacity: 1; transform: translateX(2px); }
  }

  .dot {
    color: rgba(201, 178, 106, 0.3);
    font-weight: 700;
    margin: 0 0.1rem;
  }

  @media (max-width: 768px) {
    .news-ticker { height: 22px; }
    .ticker-item { height: 20px; font-size: 0.7rem; padding: 0 0.4rem; }
    .cat-tag { font-size: 0.5rem; height: 12px; }
    .year { font-size: 0.65rem; }
    .headline { font-size: 0.7rem; }
  }
</style>
