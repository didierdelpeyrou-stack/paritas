<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import type { Choice, PlayerTrait, RenderMode, Scenario } from '../../game/types';
  import {
    POSTURE_STYLES,
    RESOURCE_SHORT_LABEL,
    derivePosture,
    previewResources,
    resourceGlyph
  } from '../../game/narrative/choicePosture';
  import { TRAIT_LABELS } from '../../game/narrative/personalityEngine';
  import VoicePanel from './VoicePanel.svelte';
  import HistoricalImage from '../HistoricalImage.svelte';
  import GlossaryText from '../GlossaryText.svelte';
  import { imageFor } from '../../game/content/historicalImages';

  interface Props {
    scenario: Scenario;
    mode: RenderMode;
    dominantTrait: PlayerTrait;
    onChoose: (choice: Choice) => void;
  }
  let { scenario, mode, dominantTrait, onChoose }: Props = $props();
  const hasImage = $derived(!!imageFor(scenario.id));

  function isLocked(choice: Choice): boolean {
    return !!choice.requiresTrait && choice.requiresTrait !== dominantTrait;
  }

  /* === UX-#3 : swipe-to-decide sur mobile ===
     Gestes tactiles sur la liste des choix :
       swipe gauche  → choix 0 (premier)
       swipe haut    → choix 1 (deuxième)
       swipe droite  → choix 2 (troisième)
     Au-delà de 3 choix, le swipe est désactivé (impossible à mapper
     proprement). Un overlay visuel indique le choix ciblé en temps
     réel ; le tap normal continue de fonctionner pour ne pas casser
     le clavier ni le clic souris. */
  const SWIPE_THRESHOLD = 80; // px nécessaires pour confirmer
  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipeDX = $state(0);
  let swipeDY = $state(0);
  let swiping = $state(false);

  const swipeable = $derived(scenario.choices.length === 3 || scenario.choices.length === 2);

  const swipeTarget = $derived.by<number | null>(() => {
    if (!swiping) return null;
    const ax = Math.abs(swipeDX);
    const ay = Math.abs(swipeDY);
    if (ax < 30 && ay < 30) return null;
    if (scenario.choices.length === 3) {
      // gauche → 0, haut → 1, droite → 2
      if (ay > ax && swipeDY < 0) return 1;
      if (swipeDX < 0) return 0;
      return 2;
    }
    if (scenario.choices.length === 2) {
      if (swipeDX < 0) return 0;
      return 1;
    }
    return null;
  });

  function onTouchStart(e: TouchEvent) {
    if (!swipeable) return;
    const t = e.touches[0];
    if (!t) return;
    swipeStartX = t.clientX;
    swipeStartY = t.clientY;
    swipeDX = 0;
    swipeDY = 0;
    swiping = true;
  }

  function onTouchMove(e: TouchEvent) {
    if (!swiping) return;
    const t = e.touches[0];
    if (!t) return;
    swipeDX = t.clientX - swipeStartX;
    swipeDY = t.clientY - swipeStartY;
  }

  function onTouchEnd() {
    if (!swiping) return;
    const ax = Math.abs(swipeDX);
    const ay = Math.abs(swipeDY);
    const target = swipeTarget;
    swiping = false;
    if (target === null) return;
    if (ax < SWIPE_THRESHOLD && ay < SWIPE_THRESHOLD) return;
    const choice = scenario.choices[target];
    if (!choice || isLocked(choice)) return;
    onChoose(choice);
  }

  const setupText = $derived(
    mode === 'reflechi' ? scenario.setup.reflechi : scenario.setup.compulsif
  );
  const showVoices = $derived(mode === 'compulsif' && (scenario.voices?.length ?? 0) > 0);
  const moodHue: Record<string, string> = {
    calme: 'border-cyan-500/40 bg-cyan-500/5',
    tendu: 'border-gold/40 bg-gold/5',
    grave: 'border-rose-500/40 bg-rose-500/5',
    euphorique: 'border-emerald-500/40 bg-emerald-500/5',
    melancolique: 'border-violet-500/40 bg-violet-500/5'
  };
  const moodClass = $derived(moodHue[scenario.mood] ?? 'border-line/40');
</script>

<article
  class="bordered-card p-5 space-y-4 {moodClass}"
  in:fade={{ duration: 240 }}
>
  <header class="space-y-1">
    <div class="flex items-center justify-between text-xs uppercase tracking-wider text-parchment-dim/85">
      <span>{scenario.date}</span>
      <span class="italic">{scenario.subtitle ?? ''}</span>
    </div>
    <h2 class="font-display text-2xl text-gold">{scenario.title}</h2>
  </header>

  {#if hasImage}
    <HistoricalImage id={scenario.id} shape="tableau" />
  {/if}

  <div class="text-parchment leading-relaxed whitespace-pre-line text-sm sm:text-base">
    <GlossaryText text={setupText} />
  </div>

  {#if mode === 'reflechi'}
    <div class="text-xs italic text-parchment-dim/85 border-l-2 border-line pl-3 py-1">
      <span class="not-italic uppercase tracking-wider text-parchment-dim/80 mr-1">
        Contexte —
      </span>
      <GlossaryText text={scenario.historicalContext} />
    </div>
  {/if}

  {#if showVoices && scenario.voices}
    <VoicePanel voices={scenario.voices} />
  {/if}

  {#if scenario.quotes && scenario.quotes.length > 0}
    <div class="space-y-1.5">
      {#each scenario.quotes as q}
        <blockquote class="historical-quote">
          <span class="quote-mark" aria-hidden="true">«</span>
          <p>{q.text}</p>
          <footer>— {q.source}</footer>
        </blockquote>
      {/each}
    </div>
  {/if}

  <ul
    class="space-y-2.5 mt-3 choices-list"
    aria-label="Choix disponibles"
    ontouchstart={onTouchStart}
    ontouchmove={onTouchMove}
    ontouchend={onTouchEnd}
    ontouchcancel={onTouchEnd}
  >
    {#if swipeable}
      <div class="swipe-hint" aria-hidden="true">
        <span class="hint-text">
          {#if scenario.choices.length === 3}
            ← • ↑ • → · glisse pour choisir
          {:else}
            ← • → · glisse pour choisir
          {/if}
        </span>
      </div>
    {/if}
    {#each scenario.choices as ch, i}
      {@const posture = derivePosture(ch)}
      {@const style = POSTURE_STYLES[posture]}
      {@const previews = mode === 'reflechi' ? previewResources(ch) : []}
      {@const locked = isLocked(ch)}
      <li>
        <button
          type="button"
          class="choice-btn"
          data-posture={posture}
          data-locked={locked}
          data-swipe-target={swipeTarget === i}
          disabled={locked}
          style="--accent: {style.accent}; --accent-soft: {style.accentSoft}; --accent-muted: {style.accentMuted};"
          onclick={() => onChoose(ch)}
          in:fly={{ y: 8, duration: 240, delay: 60 + i * 40 }}
        >
          <span class="glyph" aria-hidden="true">{style.glyph}</span>

          <span class="body">
            <span class="posture-tag" data-mode={mode}>
              {#if mode === 'reflechi'}{style.label} · {ch.intent}{:else}{style.label}{/if}
            </span>
            <span class="text">{ch.text}</span>
            {#if locked && ch.requiresTrait}
              <span class="lock-hint">
                Réservé au trait <b>{TRAIT_LABELS[ch.requiresTrait]}</b>
              </span>
            {/if}
            {#if !locked && mode === 'reflechi' && ch.theoryHint}
              <span class="hint">{ch.theoryHint}</span>
            {/if}
            {#if !locked && previews.length > 0}
              <span class="previews">
                {#each previews as p}
                  <span class="preview" data-direction={p.direction} data-magnitude={p.magnitude}>
                    <em>{resourceGlyph(p.resource)}</em>
                    <span>{RESOURCE_SHORT_LABEL[p.resource]}</span>
                    <i>{p.direction === 'up' ? '▲' : '▼'}{p.magnitude === 'major' ? p.direction === 'up' ? '▲' : '▼' : ''}</i>
                  </span>
                {/each}
              </span>
            {/if}
          </span>
        </button>
      </li>
    {/each}
  </ul>
</article>

<style>
  .choice-btn {
    display: grid;
    grid-template-columns: 2.4rem 1fr;
    gap: 0.75rem;
    align-items: stretch;
    width: 100%;
    border: 1px solid var(--accent-muted);
    border-left-width: 2px;
    border-radius: 0.55rem;
    background: var(--accent-soft);
    padding: 0.7rem 0.85rem 0.7rem 0.65rem;
    color: #ede4c9;
    text-align: left;
    transition:
      border-color 0.18s ease,
      background 0.18s ease,
      transform 0.18s ease,
      box-shadow 0.18s ease;
  }

  .choice-btn:hover,
  .choice-btn:focus-visible {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    transform: translateX(2px);
    box-shadow: -2px 0 0 0 var(--accent);
    outline: none;
  }

  /* === UX-#3 — visual feedback du swipe ===
     Pendant le glissement, la carte ciblée prend la couleur d'accent
     pleine et un halo plus ample. Animation lissée. */
  .choice-btn[data-swipe-target='true'] {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 22%, transparent);
    transform: scale(1.02);
    box-shadow: 0 0 0 2px var(--accent), 0 0 18px 4px color-mix(in srgb, var(--accent) 35%, transparent);
  }

  .choices-list {
    position: relative;
    user-select: none;
    -webkit-user-select: none;
    touch-action: pan-y; /* permet swipe vertical mais nous capturons quand même */
  }

  .swipe-hint {
    display: none;
    text-align: center;
    color: rgba(244, 213, 139, 0.45);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    margin-bottom: 0.4rem;
  }

  /* On affiche l'indication seulement sur écrans tactiles. */
  @media (hover: none) and (pointer: coarse) {
    .swipe-hint {
      display: block;
    }
  }

  .choice-btn[data-posture='rupture']:hover {
    transform: translateX(2px) skewX(-0.4deg);
  }

  .choice-btn[data-posture='institution']:hover {
    transform: translateX(2px) translateY(-1px);
  }

  .choice-btn[data-posture='compromis']:hover {
    transform: translateX(2px);
  }

  .choice-btn[data-posture='expertise']:hover {
    transform: translateX(1px) translateY(-0.5px);
  }

  .choice-btn[data-posture='opinion']:hover .glyph {
    transform: scale(1.1);
  }

  .choice-btn[data-locked='true'] {
    cursor: not-allowed;
    opacity: 0.45;
    filter: grayscale(0.3);
  }

  .choice-btn[data-locked='true']:hover {
    transform: none;
    box-shadow: none;
    background: var(--accent-soft);
    border-color: var(--accent-muted);
  }

  .choice-btn[data-locked='true']:hover .glyph {
    transform: none;
  }

  .choice-btn .lock-hint {
    color: rgba(237, 228, 201, 0.55);
    font-size: 0.78rem;
    font-style: italic;
  }

  .choice-btn .lock-hint b {
    color: var(--accent);
    font-style: normal;
    font-weight: 600;
  }

  .choice-btn .glyph {
    align-self: center;
    justify-self: center;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--accent-muted);
    border-radius: 50%;
    background: rgba(13, 16, 20, 0.5);
    color: var(--accent);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1rem;
    line-height: 1;
    transition: transform 0.2s ease, border-color 0.18s ease;
  }

  .choice-btn:hover .glyph {
    border-color: var(--accent);
  }

  .choice-btn .body {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.28rem;
  }

  .choice-btn .posture-tag {
    color: var(--accent);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .choice-btn .posture-tag[data-mode='compulsif'] {
    opacity: 0.55;
    font-size: 0.74rem;
  }

  .choice-btn .text {
    color: #ede4c9;
    font-size: 0.94rem;
    line-height: 1.35;
    transition: color 0.18s ease;
  }

  .choice-btn:hover .text {
    color: var(--accent);
  }

  .choice-btn .hint {
    color: rgba(237, 228, 201, 0.6);
    font-size: 0.74rem;
    font-style: italic;
    line-height: 1.35;
  }

  .choice-btn .previews {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.2rem;
  }

  .choice-btn .preview {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
    border: 1px solid rgba(237, 228, 201, 0.16);
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.45);
    padding: 0.12rem 0.5rem;
    font-size: 0.74rem;
    color: rgba(237, 228, 201, 0.78);
  }

  .choice-btn .preview em {
    font-family: 'Cinzel', Georgia, serif;
    font-style: normal;
    font-size: 0.78rem;
    color: rgba(237, 228, 201, 0.7);
  }

  .choice-btn .preview i {
    font-style: normal;
    font-size: 0.72rem;
    letter-spacing: -0.05em;
  }

  .choice-btn .preview[data-direction='up'] {
    border-color: rgba(95, 181, 107, 0.35);
    color: #aedab5;
  }

  .choice-btn .preview[data-direction='up'] em,
  .choice-btn .preview[data-direction='up'] i {
    color: #aedab5;
  }

  .choice-btn .preview[data-direction='down'] {
    border-color: rgba(224, 122, 110, 0.35);
    color: #e8a09b;
  }

  .choice-btn .preview[data-direction='down'] em,
  .choice-btn .preview[data-direction='down'] i {
    color: #e8a09b;
  }

  .choice-btn .preview[data-magnitude='major'] {
    font-weight: 600;
  }

  /* Citations historiques : esquisse de parchemin, sans renverser le mode sombre. */
  .historical-quote {
    position: relative;
    border: 1px solid rgba(200, 155, 60, 0.35);
    border-radius: 0.5rem;
    background:
      radial-gradient(ellipse at 30% 20%, rgba(200, 155, 60, 0.16) 0%, transparent 55%),
      radial-gradient(ellipse at 70% 80%, rgba(192, 57, 43, 0.08) 0%, transparent 50%),
      linear-gradient(180deg, rgba(237, 228, 201, 0.08), rgba(237, 228, 201, 0.04));
    padding: 0.85rem 1rem 0.75rem 2.2rem;
    color: #ede4c9;
    font-family: 'Source Serif 4', Georgia, serif;
    font-style: italic;
    font-size: 0.86rem;
    line-height: 1.5;
  }

  .historical-quote .quote-mark {
    position: absolute;
    top: 0.4rem;
    left: 0.85rem;
    color: #c89b3c;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.6rem;
    font-style: normal;
    line-height: 1;
    opacity: 0.7;
  }

  .historical-quote p {
    margin: 0;
  }

  .historical-quote footer {
    margin-top: 0.4rem;
    color: rgba(237, 228, 201, 0.7);
    font-style: normal;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
  }
</style>
