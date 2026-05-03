<script lang="ts">
  /* ============================================================
     BrawlArena — visualisation Place de la République
     ============================================================
     S'affiche après le calcul de la manif quand le brawl est
     déclenché. Canvas 2D simple : Place avec statue + façades
     stylisées, deux factions face-à-face, animations de base
     (avancée, choc, recul), récit textuel à droite.

     Pas de Phaser, pas de sprites externes. Tout en stroke + fill
     procédural pour rester léger et stylisé Paritas (or + dark).
     ============================================================ */
  import { fade, fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import {
    BRAWLER_CATALOG,
    type FactionRoster,
    type BrawlOutcome,
    type BrawlerType
  } from '../../game/org/factionBrawl';

  interface Props {
    joueur: FactionRoster;
    adversaire: FactionRoster;
    outcome: BrawlOutcome;
    onClose: () => void;
  }
  let { joueur, adversaire, outcome, onClose }: Props = $props();

  let canvas: HTMLCanvasElement | null = $state(null);
  let currentRound = $state(0);
  let animating = $state(true);
  let visibleRounds = $derived(outcome.rounds.slice(0, currentRound));

  /* Animation : un round par 1.6s, puis affiche le récit final. */
  onMount(() => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      currentRound = step;
      if (step >= outcome.rounds.length) {
        clearInterval(interval);
        setTimeout(() => { animating = false; }, 800);
      }
    }, 1600);
    return () => clearInterval(interval);
  });

  /* Dessine le canvas à chaque update. */
  $effect(() => {
    if (!canvas) return;
    /* Re-render à chaque round. */
    void currentRound;
    drawScene(canvas, joueur, adversaire, currentRound, outcome);
  });

  function drawScene(
    cv: HTMLCanvasElement,
    j: FactionRoster,
    a: FactionRoster,
    round: number,
    out: BrawlOutcome
  ) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const W = cv.width;
    const H = cv.height;

    /* Background : place pavée nuit sombre + halo doré au centre */
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1F1813');
    bg.addColorStop(1, '#0a0807');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* Halo central — la statue de Marianne */
    const halo = ctx.createRadialGradient(W/2, H*0.45, 20, W/2, H*0.45, W/2);
    halo.addColorStop(0, 'rgba(244, 213, 140, 0.10)');
    halo.addColorStop(1, 'transparent');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);

    /* Pavés : grille subtile */
    ctx.strokeStyle = 'rgba(201, 178, 106, 0.06)';
    ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    for (let x = 0; x < W; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    /* Façades stylisées en haut */
    ctx.fillStyle = '#2A1A0E';
    ctx.fillRect(0, 0, W, 30);
    ctx.fillStyle = '#3D2615';
    for (let x = 8; x < W - 8; x += 22) {
      ctx.fillRect(x, 4, 14, 22);  // fenêtres
    }

    /* Statue de la République au centre, simplifiée */
    drawStatue(ctx, W/2, H*0.42);

    /* Joueur à gauche, adversaire à droite */
    drawFactionLine(ctx, j, 'left', round, out);
    drawFactionLine(ctx, a, 'right', round, out);

    /* Indicateur de round au centre haut */
    ctx.fillStyle = 'rgba(244, 213, 140, 0.75)';
    ctx.font = 'bold 12px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (round > 0 && round <= out.rounds.length) {
      ctx.fillText(`ROUND ${round} / ${out.rounds.length}`, W/2, 50);
    } else if (round > out.rounds.length) {
      const resultText = out.result === 'victoire' ? '✓ VICTOIRE'
                       : out.result === 'defaite' ? '✗ DÉFAITE'
                       : '— NUL —';
      ctx.fillStyle = out.result === 'victoire' ? '#7BCBA1'
                    : out.result === 'defaite' ? '#E08F92'
                    : '#C9B26A';
      ctx.font = 'bold 16px "Cinzel", serif';
      ctx.fillText(resultText, W/2, 50);
    }
  }

  function drawStatue(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    /* Socle */
    ctx.fillStyle = '#3D2615';
    ctx.fillRect(cx - 18, cy + 24, 36, 14);
    /* Marianne stylisée — silhouette */
    ctx.fillStyle = '#5A2F1C';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 8, 18, 0, 0, Math.PI * 2);  // corps
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - 16, 6, 0, Math.PI * 2);  // tête
    ctx.fill();
    /* Bonnet phrygien — détail */
    ctx.fillStyle = '#8B1F1B';
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 18);
    ctx.lineTo(cx + 6, cy - 18);
    ctx.lineTo(cx + 4, cy - 25);
    ctx.lineTo(cx - 4, cy - 25);
    ctx.closePath();
    ctx.fill();
    /* Bras tendu (drapeau) */
    ctx.strokeStyle = '#5A2F1C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy - 8);
    ctx.lineTo(cx + 16, cy - 22);
    ctx.stroke();
    /* Drapeau tricolore au bout du bras */
    ctx.fillStyle = '#1E5C8A'; ctx.fillRect(cx + 14, cy - 30, 4, 8);
    ctx.fillStyle = '#F4EFE2'; ctx.fillRect(cx + 18, cy - 30, 4, 8);
    ctx.fillStyle = '#B0181E'; ctx.fillRect(cx + 22, cy - 30, 4, 8);
  }

  function drawFactionLine(
    ctx: CanvasRenderingContext2D,
    faction: FactionRoster,
    side: 'left' | 'right',
    round: number,
    out: BrawlOutcome
  ) {
    /* Calcul des survivants à ce round (interpole). */
    const totalLossThisStep = side === 'left'
      ? out.rounds.slice(0, round).reduce((s, r) => s + r.joueurLosses, 0)
      : out.rounds.slice(0, round).reduce((s, r) => s + r.adversaireLosses, 0);
    const remaining = Math.max(0, faction.total - totalLossThisStep);

    /* Les brawlers sont dessinés en "vague" — packs par type. */
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    const baseX = side === 'left' ? 40 : W - 40;
    const dirX = side === 'left' ? 1 : -1;
    const baseY = H * 0.62;

    /* Avance vers le centre selon le round (les troupes avancent). */
    const advance = round * 18;
    const xStart = baseX + dirX * advance;

    /* Dessine packs par type. */
    let xCursor = xStart;
    let yCursor = baseY;
    const ratio = remaining / Math.max(1, faction.total);

    for (const [t, count] of Object.entries(faction.brawlers) as [BrawlerType, number][]) {
      if (!count || count <= 0) continue;
      const remainingInType = Math.max(0, Math.round(count * ratio));
      const meta = BRAWLER_CATALOG[t];
      drawPack(ctx, xCursor, yCursor, dirX, remainingInType, meta);
      /* Décale pour le prochain pack */
      xCursor += dirX * 38;
      /* Wrap si on s'approche du milieu */
      if (side === 'left' && xCursor > W / 2 - 30) {
        xCursor = xStart;
        yCursor += 28;
      } else if (side === 'right' && xCursor < W / 2 + 30) {
        xCursor = xStart;
        yCursor += 28;
      }
    }

    /* Étiquette de la faction */
    ctx.fillStyle = side === 'left' ? '#E08F92' : '#7DB1D8';
    ctx.font = 'bold 11px "Cinzel", serif';
    ctx.textAlign = side === 'left' ? 'left' : 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(faction.label.toUpperCase(),
      side === 'left' ? 12 : W - 12,
      H - 20);
    /* Compteur restant */
    ctx.fillStyle = 'rgba(244, 239, 226, 0.75)';
    ctx.font = '10px "Courier Prime", monospace';
    ctx.fillText(`${remaining} / ${faction.total}`,
      side === 'left' ? 12 : W - 12,
      H - 8);
  }

  function drawPack(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    dirX: number,
    count: number,
    meta: typeof BRAWLER_CATALOG[BrawlerType]
  ) {
    if (count <= 0) {
      /* Pack décimé : dessine une croix grise */
      ctx.strokeStyle = 'rgba(244, 239, 226, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6);
      ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6);
      ctx.stroke();
      return;
    }
    /* Cercle représentant le groupe, taille ∝ count, couleur de la faction */
    const r = Math.min(20, 6 + Math.log2(count + 1) * 2);
    /* Halo */
    ctx.fillStyle = meta.color + '33';
    ctx.beginPath();
    ctx.arc(x, y, r + 4, 0, Math.PI * 2);
    ctx.fill();
    /* Disque principal */
    ctx.fillStyle = meta.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    /* Glyph centré */
    ctx.fillStyle = '#F4EFE2';
    ctx.font = `bold ${Math.round(r * 0.9)}px "Cinzel", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(meta.glyph, x, y + 1);
    /* Compteur sous le disque */
    ctx.fillStyle = 'rgba(244, 239, 226, 0.75)';
    ctx.font = '9px "Courier Prime", monospace';
    ctx.textBaseline = 'top';
    ctx.fillText(String(count), x, y + r + 3);
  }
</script>

<div class="brawl-backdrop" in:fade={{ duration: 240 }} role="presentation"></div>

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<aside class="brawl-arena"
  in:fly={{ y: 18, duration: 320 }}
  role="dialog"
  tabindex="-1"
  aria-modal="true"
  aria-labelledby="brawl-title"
>
  <header class="arena-head">
    <span class="arena-tag">Place de la République</span>
    <h2 id="brawl-title">Affrontement</h2>
    <p class="arena-sub">{joueur.label} vs {adversaire.label}</p>
  </header>

  <div class="arena-body">
    <canvas
      bind:this={canvas}
      width="640"
      height="320"
      class="arena-canvas"
      aria-label="Visualisation de l'affrontement à Place de la République"
    ></canvas>

    <div class="arena-narrative">
      <h3>Récit de l'affrontement</h3>
      {#each visibleRounds as round (round.roundNumber)}
        <p class="round-line" in:fade={{ duration: 280 }}>
          {round.narrative}
        </p>
      {/each}
      {#if !animating}
        <p class="final-line" in:fade={{ duration: 320, delay: 200 }}>
          {outcome.finalNarrative}
        </p>
        <div class="effects-block" in:fade={{ duration: 320, delay: 400 }}>
          <span class="effects-tag">Conséquences :</span>
          <ul class="effects-list">
            {#each Object.entries(outcome.effects) as [k, v]}
              {#if typeof v === 'number' && v !== 0}
                <li class={v > 0 ? 'pos' : 'neg'}>
                  {labelForResource(k)} {v > 0 ? '+' : ''}{v}
                </li>
              {/if}
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>

  <footer class="arena-foot">
    <button type="button" class="close-btn" onclick={onClose} disabled={animating}
      title={animating ? 'Attends la fin du combat' : 'Refermer l\'arène'}>
      {animating ? 'Combat en cours…' : 'Refermer l\'arène'}
    </button>
  </footer>
</aside>

<script module lang="ts">
  function labelForResource(k: string): string {
    const map: Record<string, string> = {
      rapportDeForce: 'Force externe',
      confiance: 'Confiance',
      cohesionInterne: 'Cohésion',
      legitimite: 'Légitimité',
      santeSociale: 'Santé sociale',
      caisse: 'Caisse'
    };
    return map[k] ?? k;
  }
</script>

<style>
  .brawl-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(13, 16, 20, 0.86);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 100;
  }

  .brawl-arena {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 101;
    width: min(720px, calc(100vw - 2rem));
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    background: linear-gradient(180deg, #2A1A0E 0%, #1A1108 100%);
    border: 1px solid #C9B26A;
    border-radius: 0.6rem;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7);
    color: #F4EFE2;
    padding: 1.2rem 1.4rem 1rem;
    font-family: 'Source Serif 4', Georgia, serif;
  }

  .arena-head {
    border-bottom: 1px solid rgba(201, 178, 106, 0.25);
    padding-bottom: 0.7rem;
    margin-bottom: 0.85rem;
  }
  .arena-tag {
    display: inline-block;
    padding: 0.1rem 0.55rem;
    background: rgba(176, 24, 30, 0.16);
    border: 1px solid rgba(176, 24, 30, 0.5);
    border-radius: 999px;
    color: #E08F92;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.45rem;
  }
  .arena-head h2 {
    margin: 0 0 0.2rem 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.4rem;
    color: #F4D58C;
    letter-spacing: 0.04em;
  }
  .arena-sub {
    margin: 0;
    color: rgba(244, 239, 226, 0.75);
    font-style: italic;
    font-size: 0.85rem;
  }

  .arena-body {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }

  .arena-canvas {
    border: 1px solid rgba(201, 178, 106, 0.35);
    border-radius: 0.4rem;
    background: #1F1813;
    width: 360px;
    height: 200px;
    display: block;
  }

  .arena-narrative {
    min-width: 0;
  }
  .arena-narrative h3 {
    margin: 0 0 0.45rem 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #C9B26A;
  }

  .round-line {
    margin: 0 0 0.45rem 0;
    padding: 0.4rem 0.55rem;
    background: rgba(201, 178, 106, 0.06);
    border-left: 2px solid rgba(201, 178, 106, 0.45);
    border-radius: 0.25rem;
    font-size: 0.82rem;
    line-height: 1.45;
    color: rgba(244, 239, 226, 0.92);
  }

  .final-line {
    margin: 0.55rem 0;
    padding: 0.55rem 0.7rem;
    background: rgba(244, 213, 140, 0.10);
    border-left: 3px solid #C9B26A;
    border-radius: 0.3rem;
    font-style: italic;
    line-height: 1.5;
    color: #F4D58C;
  }

  .effects-block {
    margin-top: 0.55rem;
    padding-top: 0.55rem;
    border-top: 1px dashed rgba(201, 178, 106, 0.2);
  }
  .effects-tag {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(244, 213, 140, 0.7);
  }
  .effects-list {
    margin: 0.35rem 0 0 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }
  .effects-list li {
    padding: 0.1rem 0.5rem;
    border-radius: 999px;
    font-family: 'Courier Prime', monospace;
    font-size: 0.72rem;
    font-weight: 700;
  }
  .effects-list li.pos {
    background: rgba(58, 107, 71, 0.18);
    color: #7BCBA1;
    border: 1px solid rgba(58, 107, 71, 0.5);
  }
  .effects-list li.neg {
    background: rgba(176, 24, 30, 0.18);
    color: #E08F92;
    border: 1px solid rgba(176, 24, 30, 0.5);
  }

  .arena-foot {
    margin-top: 0.85rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(201, 178, 106, 0.18);
    display: flex;
    justify-content: flex-end;
  }
  .close-btn {
    padding: 0.55rem 1.2rem;
    background: linear-gradient(180deg, #c89b3c 0%, #a87a26 100%);
    color: #0d1014;
    border: 1px solid #c89b3c;
    border-radius: 0.35rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: filter 0.18s ease;
  }
  .close-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .close-btn:hover:not(:disabled) {
    filter: brightness(1.12);
  }

  @media (max-width: 720px) {
    .arena-body {
      grid-template-columns: 1fr;
    }
    .arena-canvas {
      width: 100%;
      height: 200px;
    }
  }
</style>
