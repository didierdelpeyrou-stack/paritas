<script lang="ts">
  import { fade } from 'svelte/transition';
  import { MANIF_CITIES, type ManifCity } from '../../game/org/manifCities';

  interface Props {
    /** Ids des villes actuellement sélectionnées. */
    selected: string[];
    onToggle: (cityId: string) => void;
  }

  let { selected, onToggle }: Props = $props();

  let hovered = $state<ManifCity | null>(null);

  function isSelected(id: string) {
    return selected.includes(id);
  }
</script>

<div class="map-wrap">
  <svg viewBox="0 0 100 100" class="map-svg" aria-label="Carte stratégique : choisir les villes de la manifestation">
    <!-- Silhouette stylisée de la France -->
    <path
      class="hexagone"
      d="
        M 50 4
        L 60 5
        L 72 8
        L 84 14
        L 90 22
        L 92 32
        L 95 44
        L 90 58
        L 86 70
        L 80 82
        L 68 90
        L 56 92
        L 42 90
        L 28 88
        L 18 80
        L 10 64
        L 8 50
        L 12 36
        L 16 24
        L 26 14
        L 36 8
        Z
      "
    />

    <!-- Marqueurs villes -->
    {#each MANIF_CITIES as c (c.id)}
      <g
        class="city"
        data-selected={isSelected(c.id)}
        role="button"
        tabindex="0"
        aria-label={`${c.name}${isSelected(c.id) ? ' (sélectionnée)' : ''}`}
        onclick={() => onToggle(c.id)}
        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(c.id); } }}
        onmouseenter={() => (hovered = c)}
        onmouseleave={() => (hovered = null)}
      >
        <circle cx={c.x} cy={c.y} r={isSelected(c.id) ? 3.6 : 2.4} class="dot" />
        <!-- Si la ville est trop haute, on place le label en-dessous pour éviter qu'il soit coupé. -->
        <text
          x={c.x}
          y={c.y < 12 ? c.y + 6 : c.y - 4.2}
          class="label"
          text-anchor="middle"
        >{c.name}</text>
      </g>
    {/each}
  </svg>

  {#if hovered}
    <div class="map-tooltip" in:fade={{ duration: 150 }}>
      <b>{hovered.name}</b>
      <small>{hovered.tradition}</small>
      <em>poids ×{hovered.weight} · +{hovered.cost} caisse</em>
    </div>
  {:else}
    <div class="map-hint">
      <span>Choisis une ou plusieurs villes. Combinaisons historiques bonus.</span>
    </div>
  {/if}
</div>

<style>
  .map-wrap {
    position: relative;
    border: 1px solid rgba(237, 228, 201, 0.14);
    border-radius: 0.55rem;
    background:
      radial-gradient(ellipse at 30% 20%, rgba(200, 155, 60, 0.06) 0%, transparent 60%),
      radial-gradient(ellipse at 70% 80%, rgba(46, 94, 138, 0.06) 0%, transparent 60%),
      rgba(13, 16, 20, 0.42);
    padding: 0.55rem 0.55rem 0.4rem;
  }

  .map-svg {
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
    max-height: 280px;
    display: block;
    margin: 0 auto;
  }

  .hexagone {
    fill: rgba(200, 155, 60, 0.06);
    stroke: rgba(244, 213, 139, 0.4);
    stroke-width: 0.4;
    stroke-linejoin: round;
  }

  .city {
    cursor: pointer;
    outline: none;
  }

  .dot {
    fill: rgba(237, 228, 201, 0.85);
    stroke: rgba(13, 16, 20, 0.7);
    stroke-width: 0.6;
    transition: fill 0.18s ease, r 0.18s ease;
  }

  .city:hover .dot,
  .city:focus-visible .dot {
    fill: #f4d58b;
  }

  .city[data-selected='true'] .dot {
    fill: #c89b3c;
    stroke: #f4d58b;
    stroke-width: 1;
    filter: drop-shadow(0 0 4px rgba(244, 213, 139, 0.65));
  }

  .label {
    fill: rgba(237, 228, 201, 0.78);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 2.6px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    pointer-events: none;
  }

  .city[data-selected='true'] .label {
    fill: #f4d58b;
    font-weight: 700;
  }

  .map-tooltip,
  .map-hint {
    margin-top: 0.4rem;
    border-top: 1px solid rgba(237, 228, 201, 0.08);
    padding-top: 0.45rem;
    color: rgba(237, 228, 201, 0.85);
    font-size: 0.78rem;
    line-height: 1.3;
    min-height: 2.4rem;
  }

  .map-tooltip b {
    display: block;
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
  }

  .map-tooltip small {
    display: block;
    color: rgba(237, 228, 201, 0.78);
    font-style: italic;
    margin-top: 0.1rem;
  }

  .map-tooltip em {
    display: block;
    margin-top: 0.18rem;
    color: rgba(244, 213, 139, 0.7);
    font-family: 'Cinzel', Georgia, serif;
    font-style: normal;
    font-size: 0.72rem;
    letter-spacing: 0.05em;
  }

  .map-hint {
    color: rgba(237, 228, 201, 0.55);
    font-style: italic;
    text-align: center;
  }
</style>
