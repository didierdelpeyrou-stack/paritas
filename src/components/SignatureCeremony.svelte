<script lang="ts">
  /**
   * Cérémonie de signature manuscrite — UX-#4.
   *
   * Lors de la ratification d'un accord majeur (Matignon, Sécu,
   * Unédic, ANI majeur), un écran cérémoniel demande au joueur
   * de signer littéralement avec sa souris ou son doigt.
   *
   * Neuro : effet de dotation (Thaler) maximisé par engagement
   * corporel. Loi de l'engagement (Cialdini) : un geste fait soi-
   * même ancre l'action mille fois plus qu'une simple validation
   * par bouton.
   *
   * La signature est stockée en base64 dans state.memory.signatures
   * pour réaffichage ultérieur (« le compromis Matignon que vous
   * avez signé en 1936 »).
   */
  import { fade, fly } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  import { sfx } from '../game/audio/sfx';
  import { deliverSpeech, stopSpeech, type SpeechPosture } from '../lib/audio/speech';
  import type { Camp } from '../lib/types';

  interface Props {
    title: string;
    location: string;
    date: string;
    blurb: string;
    onSign: (dataUrl: string) => void;
    onSkip?: () => void;
    /** Si fourni, déclenche un discours TTS et ambiance « cérémonie ». */
    camp?: Camp;
    posture?: SpeechPosture;
    /** Pour indexer la banque de discours par registre d'époque. */
    eraId?: string;
  }
  let { title, location, date, blurb, onSign, onSkip, camp, posture, eraId }: Props = $props();

  let canvas: HTMLCanvasElement | null = $state(null);
  let ctx: CanvasRenderingContext2D | null = null;
  let drawing = $state(false);
  let hasInk = $state(false);
  let lastX = 0;
  let lastY = 0;

  const W = 480;
  const H = 140;

  let speechSubtitle = $state('');

  onMount(() => {
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'rgba(245, 230, 197, 0.92)'; // crème-papier
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Ambiance : ouvre la scène cérémonie (chuchotements de salle).
    void sfx.beginScene('ceremonie');
    // Discours d'ouverture du signataire si camp fourni.
    if (camp) {
      const text = deliverSpeech({
        camp,
        moment: 'signature',
        posture: posture ?? 'pragmatique',
        scenarioTitle: title,
        eraId,
      });
      text.then((t) => { speechSubtitle = t; }).catch(() => {});
    }
  });

  onDestroy(() => {
    sfx.endScene();
    stopSpeech();
  });

  function getPos(e: PointerEvent | TouchEvent): { x: number; y: number } | null {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const t = e.touches[0] ?? e.changedTouches[0];
      if (!t) return null;
      return {
        x: ((t.clientX - rect.left) / rect.width) * W,
        y: ((t.clientY - rect.top) / rect.height) * H
      };
    }
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H
    };
  }

  function startStroke(e: PointerEvent | TouchEvent) {
    e.preventDefault();
    const p = getPos(e);
    if (!p) return;
    drawing = true;
    lastX = p.x;
    lastY = p.y;
    // Bruit papier+plume une seule fois par cérémonie, au début du tracé.
    if (!hasInk) void sfx.paperPen();
  }

  function moveStroke(e: PointerEvent | TouchEvent) {
    if (!drawing || !ctx) return;
    e.preventDefault();
    const p = getPos(e);
    if (!p) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x;
    lastY = p.y;
    hasInk = true;
  }

  function endStroke() {
    drawing = false;
  }

  function clear() {
    if (!ctx) return;
    ctx.fillStyle = 'rgba(245, 230, 197, 0.92)';
    ctx.fillRect(0, 0, W, H);
    hasInk = false;
  }

  function ratify() {
    if (!canvas || !hasInk) return;
    const dataUrl = canvas.toDataURL('image/png');
    /* Chime de validation d'abord (synth, ~600 ms), puis ovation
     * réelle 700 ms après. Sans ce délai, les testeurs entendaient
     * un « double applause » confus. */
    void sfx.play('ratify');
    setTimeout(() => { void sfx.ovation('soft'); }, 700);
    onSign(dataUrl);
  }
</script>

<div
  class="ceremony-backdrop"
  in:fade={{ duration: 360 }}
  role="dialog"
  aria-modal="true"
  aria-labelledby="ceremony-title"
>
  <div class="ceremony-card" in:fly={{ y: 12, duration: 380 }}>
    <header class="ceremony-head">
      <div class="seal" aria-hidden="true">⚖</div>
      <h2 id="ceremony-title" class="font-display text-2xl text-gold">{title}</h2>
      <div class="meta">
        <em>{location}</em>
        <span>·</span>
        <em>{date}</em>
      </div>
    </header>

    <p class="blurb">{blurb}</p>

    {#if speechSubtitle}
      <blockquote class="speech-subtitle" aria-live="polite">
        « {speechSubtitle} »
      </blockquote>
    {/if}

    <div class="signature-zone">
      <div class="signature-label">— pour ratifier l'accord, signe ici —</div>
      <canvas
        bind:this={canvas}
        class="signature-pad"
        onpointerdown={startStroke}
        onpointermove={moveStroke}
        onpointerup={endStroke}
        onpointerleave={endStroke}
        ontouchstart={startStroke}
        ontouchmove={moveStroke}
        ontouchend={endStroke}
      ></canvas>
      <div class="signature-rule"></div>
    </div>

    <footer class="ceremony-foot">
      {#if onSkip}
        <button type="button" class="btn-skip" onclick={onSkip}>
          Refuser de signer
        </button>
      {/if}
      <button type="button" class="btn-clear" onclick={clear} disabled={!hasInk}>
        Effacer
      </button>
      <button type="button" class="btn-ratify" onclick={ratify} disabled={!hasInk}>
        Ratifier
      </button>
    </footer>
  </div>
</div>

<style>
  /* Sous-titre TTS — affiché en permanence (a11y :
     un sourd doit lire ce que la voix dit). aria-live polite. */
  .speech-subtitle {
    margin: 0;
    padding: 0.75rem 1rem;
    border-left: 2px solid rgba(244, 213, 139, 0.55);
    background: rgba(244, 213, 139, 0.05);
    color: rgba(245, 230, 197, 0.92);
    font-style: italic;
    font-size: 0.92rem;
    line-height: 1.5;
    border-radius: 0 0.4rem 0.4rem 0;
  }

  .ceremony-backdrop {
    position: fixed;
    inset: 0;
    z-index: 70;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(ellipse at center, rgba(13, 16, 20, 0.8) 0%, rgba(0, 0, 0, 0.95) 80%),
      rgba(13, 16, 20, 0.85);
    padding: 1rem;
  }

  .ceremony-card {
    width: 100%;
    max-width: 36rem;
    border: 1px solid rgba(244, 213, 139, 0.55);
    border-radius: 0.85rem;
    background: linear-gradient(180deg, #1a1f26, #232a33);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    padding: 1.6rem 1.7rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .ceremony-head {
    text-align: center;
  }

  .seal {
    font-size: 2.5rem;
    color: rgba(244, 213, 139, 0.7);
    font-family: 'Cinzel', Georgia, serif;
    margin-bottom: 0.4rem;
  }

  .meta {
    margin-top: 0.35rem;
    color: rgba(237, 228, 201, 0.6);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  .blurb {
    color: rgba(237, 228, 201, 0.85);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.95rem;
    line-height: 1.55;
    text-align: center;
    font-style: italic;
    margin: 0;
  }

  .signature-zone {
    text-align: center;
  }

  .signature-label {
    color: rgba(237, 228, 201, 0.55);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.78rem;
    font-style: italic;
    margin-bottom: 0.3rem;
  }

  .signature-pad {
    display: block;
    width: 100%;
    height: 140px;
    border: 1px solid rgba(244, 213, 139, 0.3);
    border-radius: 0.45rem;
    background: rgba(245, 230, 197, 0.92);
    cursor: crosshair;
    touch-action: none;
  }

  .signature-rule {
    margin: 0.2rem auto 0;
    width: 60%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(244, 213, 139, 0.45), transparent);
  }

  .ceremony-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.6rem;
  }

  .btn-skip,
  .btn-clear,
  .btn-ratify {
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.45rem;
    padding: 0.5rem 1rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
  }

  .btn-skip {
    background: transparent;
    color: rgba(224, 122, 110, 0.75);
  }

  .btn-skip:hover {
    border-color: rgba(224, 122, 110, 0.55);
    color: #fca5a5;
  }

  .btn-clear {
    background: rgba(13, 16, 20, 0.55);
    color: rgba(237, 228, 201, 0.65);
  }

  .btn-clear:hover:not(:disabled) {
    border-color: rgba(237, 228, 201, 0.35);
    color: #ede4c9;
  }

  .btn-ratify {
    background: rgba(201, 154, 64, 0.18);
    border-color: rgba(244, 213, 139, 0.6);
    color: #f4d58b;
    flex: 0 0 auto;
  }

  .btn-ratify:hover:not(:disabled) {
    background: rgba(201, 154, 64, 0.32);
    border-color: #f4d58b;
    color: #fde68a;
  }

  .btn-ratify:disabled,
  .btn-clear:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
