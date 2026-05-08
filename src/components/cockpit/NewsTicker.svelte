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
  import { causalTicker, type CausalNewsItem } from '$lib/stores/causalTicker.svelte';

  const camp = $derived(rebirth.state?.camp ?? 'salarie');
  const turn = $derived(rebirth.state?.turn ?? 1);

  /* Items actifs au tour courant — refresh quand le tour change.
     Causal d'abord (frais, en réaction au dernier choix), puis les
     news historiques d'arrière-plan. */
  const causalItems = $derived(causalTicker.active(turn));
  const historicalItems = $derived(activeNews(turn));

  /* Wrapper d'item unifié pour le rendu. Causal items portent un
     id stable, headline, category, year, tone, et un flag fresh. */
  type TickerEntry = {
    kind: 'causal' | 'historical';
    id: string;
    headline: string;
    category: HistoricalNews['category'];
    year?: number;
    tone?: 'acquiesce' | 'oppose' | 'neutral';
    fresh?: boolean;
    source?: HistoricalNews;
  };

  const items: TickerEntry[] = $derived([
    ...causalItems.map((c: CausalNewsItem): TickerEntry => ({
      kind: 'causal',
      id: c.id,
      headline: c.headline,
      category: c.category,
      year: c.year,
      tone: c.tone,
      fresh: causalTicker.isFresh(c, turn)
    })),
    ...historicalItems.map((h): TickerEntry => ({
      kind: 'historical',
      id: h.id,
      headline: h.headline,
      category: h.category,
      year: h.year,
      source: h
    }))
  ]);

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

  /* P0-2 (ORDA-008, AAR bêta-30 §V) — pause manuelle du ticker.
     Soueidan, Pascal, Manon, Wroblewski, Pope (5 mentions) :
     l'animation auto-défilante distrait. Bouton pause + stop sur
     focus clavier. Persisté en sessionStorage (vie d'onglet). */
  let paused = $state(false);
  $effect(() => {
    if (typeof window === 'undefined') return;
    paused = sessionStorage.getItem('paritas.ticker.paused') === '1';
  });
  function togglePause() {
    paused = !paused;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('paritas.ticker.paused', paused ? '1' : '0');
    }
  }

  function onClick(entry: TickerEntry) {
    /* Causal items : pas cliquables (réaction du monde, pas un side
       event). Seuls les historiques avec sideEventId sont cliquables. */
    if (entry.kind !== 'historical' || !entry.source) return;
    if (!isInteractive(entry.source, camp)) return;
    const ev = SIDE_EVENTS.find(e => e.id === entry.source!.sideEventId);
    if (!ev) return;
    sideEvents.forceTrigger(entry.source.sideEventId!);
  }

  function isEntryInteractive(entry: TickerEntry): boolean {
    return entry.kind === 'historical'
      && !!entry.source
      && isInteractive(entry.source, camp);
  }

  function tooltipFor(entry: TickerEntry): string {
    const base = `${categoryLabel(entry.category)} · ${entry.year ?? ''}\n${entry.headline}`;
    if (entry.kind === 'causal') {
      const toneLabel = entry.tone === 'acquiesce' ? '✓ Le monde acquiesce'
        : entry.tone === 'oppose' ? '✗ Le monde s\'oppose'
        : '· réaction du monde';
      return `${base}\n\n${toneLabel} (réaction à ton dernier choix).`;
    }
    if (isEntryInteractive(entry)) {
      return `${base}\n\n→ Clique pour t'engager dans cette affaire.`;
    }
    return base;
  }
</script>

{#if items.length > 0}
  <div class="news-ticker"
    class:reduced={reducedMotion}
    class:paused={paused || reducedMotion}
    role="region"
    aria-live="polite"
    aria-atomic="false"
    aria-label="Fil d'actualités historiques"
    style:--duration="{durationSec}s"
  >
    <button
      type="button"
      class="ticker-pause"
      onclick={togglePause}
      aria-label={paused ? 'Reprendre le défilement du fil' : 'Mettre en pause le fil d\'actualités'}
      title={paused ? 'Reprendre' : 'Pause'}
    >{paused ? '▶' : '⏸'}</button>
    <div class="ticker-track">
      {#each renderItems as entry, i (entry.id + ':' + i)}
        {@const interactive = isEntryInteractive(entry)}
        <button
          type="button"
          class="ticker-item"
          class:interactive
          class:causal={entry.kind === 'causal'}
          class:fresh={entry.fresh}
          data-tone={entry.tone ?? ''}
          style:--cat-color={categoryColor(entry.category)}
          onclick={() => onClick(entry)}
          title={tooltipFor(entry)}
          tabindex={interactive ? 0 : -1}
          aria-disabled={!interactive}
        >
          {#if entry.kind === 'causal'}
            <span class="causal-tag" aria-hidden="true"
              title={entry.tone === 'acquiesce' ? 'Le monde acquiesce'
                : entry.tone === 'oppose' ? 'Le monde s\'oppose'
                : 'Réaction du monde'}
            >
              {entry.tone === 'oppose' ? '⚑' : '◎'}
            </span>
          {/if}
          <span class="cat-tag">{categoryLabel(entry.category)}</span>
          {#if entry.year}
            <span class="year">{entry.year}</span>
          {/if}
          <span class="headline">{entry.headline}</span>
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

  /* P0-2 : pause manuelle (bouton ou prefers-reduced-motion).
     Différent de :hover — état persistant. */
  .news-ticker.paused .ticker-track {
    animation-play-state: paused;
  }

  /* P0-2 : bouton pause/play accessible clavier, dans le tab order.
     ORDA-015 (P0 Wroblewski-01) : 22→32px tap-target WCAG 2.5.8.
     ORDA-015 (P0 Soueidan-03) : focus-visible restauré (outline +
     épaisseur), pas de retrait visuel. */
  .ticker-pause {
    flex: 0 0 auto;
    background: transparent;
    border: 1px solid var(--color-border, rgba(255, 255, 255, 0.12));
    color: var(--color-muted, rgba(255, 255, 255, 0.7));
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 0.85rem;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-right: 0.4rem;
    transition: background 120ms ease, color 120ms ease;
  }
  .ticker-pause:hover,
  .ticker-pause:focus-visible {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    outline: 2px solid var(--sem-action, #d6a949);
    outline-offset: 2px;
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

  /* ORDA-015 (P0 Jules-26 streamer + Soueidan-03 a11y) : contraste
     0.70 → 0.92 sur fond sombre — respecte WCAG AA en 720p stream
     bitrate dégradé. Le ticker est le composant le plus shareable. */
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
    color: rgba(244, 239, 226, 0.92);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.78rem;
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

  /* === Items causaux : réaction du monde aux choix du joueur ===
     Distincts visuellement des news historiques d'arrière-plan.
     Cf. critique designer §Décision 5. */
  .ticker-item.causal {
    background: rgba(244, 213, 140, 0.08);
    color: #F4D58C;
  }
  .ticker-item.causal[data-tone='oppose'] {
    background: rgba(176, 24, 30, 0.10);
    color: #E08F92;
    border-left-color: rgba(176, 24, 30, 0.7);
  }
  .ticker-item.causal[data-tone='acquiesce'] {
    background: rgba(58, 107, 71, 0.10);
    color: #7BCBA1;
    border-left-color: rgba(58, 107, 71, 0.7);
  }

  /* Frais : émis dans les 2 derniers tours, pulse subtil pour
     attirer l'œil. */
  .ticker-item.fresh {
    animation: causal-fresh-pulse 1.6s ease-in-out 3;
  }
  @keyframes causal-fresh-pulse {
    0%, 100% { box-shadow: 0 0 0 0 transparent; }
    50%      { box-shadow: 0 0 8px 0 currentColor; }
  }

  .causal-tag {
    display: inline-flex;
    color: currentColor;
    font-size: 0.85rem;
    line-height: 1;
    margin-right: 0.18rem;
    text-shadow: 0 0 4px currentColor;
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
