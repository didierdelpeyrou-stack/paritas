<script lang="ts">
  /* Era timeline compacte du cockpit — 36px de hauteur fixe.
     Affiche les 15 ères + curseur "tour actuel" sur l'axe.

     ⚠ Source de vérité : ERAS de game/content/eras.ts. Ne jamais
     hardcoder les fromTurn ici (cause de désalignement curseur). */
  import { ERAS as GAME_ERAS } from '../../game/content/eras';
  import { EXTERNAL_FORCINGS } from '$lib/orchestrator/thermodynamics';

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

  /* Tooltip enrichi par tic : ère + tour + forçages chevauchants.
     Réponse au retour live test patronat P1 — « les marqueurs
     timeline sont muets, je sais juste l'année ». */
  function tickTooltip(eraLabel: string, startTurn: number): string {
    const overlapping = EXTERNAL_FORCINGS.filter(
      f => f.fromTurn <= startTurn && f.toTurn >= startTurn
    );
    let s = `${eraLabel} — démarre au tour ${startTurn}`;
    if (overlapping.length) {
      s += '\n\n☄ Vent(s) actif(s) à ce moment :';
      for (const f of overlapping) {
        s += `\n• ${f.label} (T${f.fromTurn}–${f.toTurn})\n  ${f.description}`;
      }
    }
    return s;
  }

  /* Marqueurs des vents historiques sur la timeline (Krug : rendre
     l'invisible visible). Bande horizontale entre fromTurn/toTurn,
     pulse pour le vent actif. */
  const FORCING_BANDS = EXTERNAL_FORCINGS.map(f => ({
    label: f.label,
    description: f.description,
    fromTurn: f.fromTurn,
    toTurn: f.toTurn,
    leftPct: (f.fromTurn / 100) * 100,
    widthPct: ((f.toTurn - f.fromTurn + 1) / 100) * 100
  }));

  function isForcingActive(f: { fromTurn: number; toTurn: number }, t: number): boolean {
    return t >= f.fromTurn && t <= f.toTurn;
  }
  function isForcingPast(f: { toTurn: number }, t: number): boolean {
    return t > f.toTurn;
  }
</script>

<nav class="era-timeline" aria-label="Timeline des ères historiques">
  <div class="track">
    <!-- Axe + tic-marks -->
    <div class="axis"></div>

    <!-- Bandes des vents historiques (sous l'axe, semi-transparent) -->
    {#each FORCING_BANDS as f (f.label)}
      <div
        class="forcing-band"
        class:active={isForcingActive(f, turn)}
        class:past={isForcingPast(f, turn)}
        style:left="{f.leftPct}%"
        style:width="{f.widthPct}%"
        title={`☄ ${f.label} (T${f.fromTurn}–${f.toTurn})\n${f.description}`}
      ></div>
    {/each}

    {#each ERAS as e, i}
      {@const left = (e.startTurn / totalTurns) * 100}
      <div
        class="tick"
        class:active={i === currentEraIdx}
        class:past={i < currentEraIdx}
        style:left="{left}%"
        title={tickTooltip(e.label, e.startTurn)}
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

  /* Bandes des vents historiques sous l'axe (Krug : rendre
     l'invisible visible). Échelle dorée ambrée comme le banner
     d'anticipation pour cohérence sémantique. */
  .forcing-band {
    position: absolute;
    top: 50%;
    height: 4px;
    transform: translateY(2px);
    background: linear-gradient(90deg,
      rgba(217, 130, 28, 0.18),
      rgba(217, 130, 28, 0.32),
      rgba(217, 130, 28, 0.18));
    border-radius: 2px;
    pointer-events: auto;
    cursor: help;
    transition: opacity 0.2s ease;
  }
  .forcing-band:hover { opacity: 0.85; filter: brightness(1.2); }
  .forcing-band.past {
    background: linear-gradient(90deg,
      rgba(122, 92, 58, 0.20),
      rgba(122, 92, 58, 0.30),
      rgba(122, 92, 58, 0.20));
  }
  .forcing-band.active {
    background: linear-gradient(90deg,
      rgba(217, 130, 28, 0.45),
      rgba(244, 213, 140, 0.55),
      rgba(217, 130, 28, 0.45));
    box-shadow: 0 0 8px rgba(217, 130, 28, 0.5);
    animation: band-pulse 2.4s ease-in-out infinite;
  }
  @keyframes band-pulse {
    0%, 100% { box-shadow: 0 0 6px rgba(217, 130, 28, 0.4); }
    50%      { box-shadow: 0 0 12px rgba(217, 130, 28, 0.7); }
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
