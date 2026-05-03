<script lang="ts">
  /* Era timeline compacte du cockpit — 36px de hauteur fixe.
     Affiche les 15 ères + curseur "tour actuel" sur l'axe.

     ⚠ Source de vérité : ERAS de game/content/eras.ts. Ne jamais
     hardcoder les fromTurn ici (cause de désalignement curseur). */
  import { ERAS as GAME_ERAS } from '../../game/content/eras';

  interface Props {
    turn: number;
    totalTurns?: number;
  }
  let { turn, totalTurns = 100 }: Props = $props();

  /* Adapter pour la timeline — short label année + position absolue */
  const ERAS = GAME_ERAS.map(e => ({
    label: e.name,
    short: String(e.firstYear ?? ''),
    startTurn: e.fromTurn
  }));

  let cursorPct = $derived((Math.min(turn, totalTurns) / totalTurns) * 100);
  let currentEraIdx = $derived(
    ERAS.findIndex((e, i) => {
      const next = ERAS[i + 1];
      return turn >= e.startTurn && (!next || turn < next.startTurn);
    })
  );
</script>

<nav class="era-timeline" aria-label="Timeline des ères historiques">
  <div class="track">
    <!-- Axe + tic-marks -->
    <div class="axis"></div>
    {#each ERAS as e, i}
      {@const left = (e.startTurn / totalTurns) * 100}
      <div
        class="tick"
        class:active={i === currentEraIdx}
        class:past={i < currentEraIdx}
        style:left="{left}%"
        title={`${e.label} — démarre au tour ${e.startTurn}`}
      >
        <span class="tick-mark"></span>
        <span class="tick-label">{e.short}</span>
      </div>
    {/each}
    <!-- Curseur tour actuel -->
    <div class="cursor" style:left="{cursorPct}%" aria-hidden="true">
      <span class="cursor-dot"></span>
    </div>
  </div>
</nav>

<style>
  .era-timeline {
    height: 36px;
    padding: 0 1rem;
    background: linear-gradient(180deg, #2A1A0E 0%, #1F1108 100%);
    border-bottom: 1px solid rgba(201, 178, 106, 0.2);
    flex-shrink: 0;
    position: relative;
    display: flex;
    align-items: center;
  }

  .track {
    position: relative;
    width: 100%;
    height: 24px;
  }

  .axis {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(201, 178, 106, 0.35) 8%,
      rgba(201, 178, 106, 0.5) 50%,
      rgba(201, 178, 106, 0.35) 92%,
      transparent 100%
    );
    transform: translateY(-50%);
  }

  .tick {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    color: rgba(201, 178, 106, 0.55);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.55rem;
    pointer-events: auto;
    cursor: help;
    transition: color 0.2s ease;
  }

  .tick:hover { color: #F4D58C; }

  .tick.past { color: rgba(201, 178, 106, 0.7); }
  .tick.active { color: #F4D58C; font-weight: 700; }

  .tick-mark {
    width: 2px;
    height: 6px;
    background: currentColor;
  }

  .tick.active .tick-mark {
    width: 3px;
    height: 9px;
  }

  .tick-label {
    margin-top: 1px;
    line-height: 1;
    letter-spacing: 0.04em;
  }

  /* Curseur — position du tour actuel */
  .cursor {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    pointer-events: none;
    transition: left 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
  }

  .cursor-dot {
    display: block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #F4D58C, #C9B26A 60%, #8a6520);
    box-shadow:
      0 0 12px rgba(244, 213, 140, 0.7),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    animation: cursor-pulse 2s ease-in-out infinite;
  }

  @keyframes cursor-pulse {
    0%, 100% { box-shadow: 0 0 12px rgba(244, 213, 140, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4); }
    50%      { box-shadow: 0 0 18px rgba(244, 213, 140, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.4); }
  }

  /* Mobile : on cache certains tics pour ne pas saturer */
  @media (max-width: 768px) {
    .tick:not(.active) .tick-label { display: none; }
    .era-timeline { height: 28px; padding: 0 0.5rem; }
  }
</style>
