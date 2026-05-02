<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { onDestroy, onMount } from 'svelte';
  import type { ConsequenceRender } from '../../game/engine/consequenceEngine';
  import type { TensionAlert } from '../../game/simulation/tensions';
  import { TRAIT_LABELS } from '../../game/narrative/personalityEngine';

  interface Props {
    consequence: ConsequenceRender;
    alerts?: TensionAlert[];
    onContinue: () => void;
  }
  let { consequence, alerts = [], onContinue }: Props = $props();

  const alertHue: Record<TensionAlert['level'], string> = {
    info: 'border-cyan-500/40 bg-cyan-500/5 text-cyan-200',
    warning: 'border-gold/40 bg-gold/5 text-amber-200',
    critical: 'border-rose-500/40 bg-rose-500/5 text-rose-200'
  };

  /* === Révélation étagée ===
     Le texte arrive en premier, puis chaque bloc s'ajoute toutes ~360 ms.
     Cliquer n'importe où dans la carte saute la séquence et révèle tout
     d'un coup. Le bouton Continuer reste désactivé jusqu'à la dernière
     étape — c'est ce qui donne au joueur le temps de lire. */
  const STEP_MS = 360;
  const STEPS = 7; // mesures, headline, voix, mémoire, trait, chiffres, alertes
  let stage = $state(0);
  const timeouts: number[] = [];

  onMount(() => {
    for (let i = 1; i <= STEPS; i++) {
      timeouts.push(window.setTimeout(() => { stage = i; }, i * STEP_MS));
    }
  });

  onDestroy(() => {
    for (const t of timeouts) window.clearTimeout(t);
  });

  function revealAll() {
    for (const t of timeouts) window.clearTimeout(t);
    stage = STEPS;
  }

  const fullyRevealed = $derived(stage >= STEPS);
</script>

<article
  class="bordered-card p-5 space-y-4"
  in:fade={{ duration: 280 }}
  role="region"
  aria-label="Conséquence de ton choix"
  aria-live="polite"
>
  <header class="flex items-baseline justify-between gap-2">
    <div class="text-xs uppercase tracking-wider text-parchment-dim/85">Conséquence</div>
    {#if !fullyRevealed}
      <button
        type="button"
        class="reveal-skip"
        onclick={revealAll}
        aria-label="Tout révéler immédiatement"
      >tout révéler</button>
    {/if}
  </header>

  <div class="text-parchment leading-relaxed whitespace-pre-line">
    {consequence.text}
  </div>

  {#if stage >= 1 && consequence.concreteMeasures.length > 0}
    <ul class="concrete-list" in:fly={{ y: 6, duration: 320 }}>
      {#each consequence.concreteMeasures as m}
        <li>· {m}</li>
      {/each}
    </ul>
  {/if}

  {#if stage >= 2 && consequence.newspaperHeadline}
    <div
      in:fly={{ y: 6, duration: 380 }}
      class="border border-line/60 bg-ink/40 rounded-md px-3 py-2 text-xs"
    >
      <div class="uppercase tracking-wider text-parchment-dim/80">À la une</div>
      <div class="font-display text-gold-soft/90 mt-0.5">« {consequence.newspaperHeadline} »</div>
    </div>
  {/if}

  {#if stage >= 3}
    {#if consequence.innerVoice}
      <div
        in:fly={{ y: 6, duration: 380 }}
        class="border-l-2 border-violet-500/50 pl-3 italic text-sm text-violet-200/90"
      >
        {consequence.innerVoice}
      </div>
    {:else if consequence.voice}
      <div
        in:fly={{ y: 6, duration: 380 }}
        class="border-l-2 border-violet-500/50 pl-3 italic text-sm text-violet-200/90"
      >
        {consequence.voice}
      </div>
    {/if}
  {/if}

  {#if stage >= 4 && consequence.memoryLine}
    <div
      in:fly={{ y: 6, duration: 380 }}
      class="text-xs italic text-parchment-dim/85 border-t border-line/40 pt-2"
    >
      {consequence.memoryLine}
    </div>
  {/if}

  {#if stage >= 5}
    {#if consequence.traitChange}
      <div class="trait-change" in:fly={{ y: 6, duration: 380 }}>
        <span class="from">{TRAIT_LABELS[consequence.traitChange.from]}</span>
        <span class="arrow">→</span>
        <span class="to">{TRAIT_LABELS[consequence.traitChange.to]}</span>
        <span class="hint">Tu deviens autre chose.</span>
      </div>
    {:else if consequence.traitShift}
      <div class="trait-shift" in:fly={{ y: 6, duration: 380 }}>
        Trait : <b>{TRAIT_LABELS[consequence.traitShift.trait]}</b>
        <em>+{consequence.traitShift.delta}</em>
      </div>
    {/if}
  {/if}

  {#if stage >= 6 && consequence.numericSummary}
    <div
      in:fade={{ duration: 360 }}
      class="text-xs uppercase tracking-wider text-parchment-dim/85 border-t border-line/60 pt-3"
    >
      {consequence.numericSummary}
    </div>
  {/if}

  {#if stage >= 7 && alerts.length > 0}
    <div class="space-y-1.5" in:fade={{ duration: 320 }}>
      {#each alerts as a}
        <div class="text-xs rounded-md border px-3 py-2 {alertHue[a.level]}">
          <span class="uppercase tracking-wider mr-1">⚠</span>
          {a.text}
        </div>
      {/each}
    </div>
  {/if}

  <div class="pt-2">
    <button
      type="button"
      class="btn-primary w-full"
      class:btn-dim={!fullyRevealed}
      onclick={() => { if (!fullyRevealed) { revealAll(); return; } onContinue(); }}
      aria-label={fullyRevealed ? 'Continuer' : 'Révéler la suite, puis continuer'}
    >
      {fullyRevealed ? 'Continuer' : 'Révéler…'}
    </button>
  </div>
</article>

<style>
  .trait-change {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    border: 1px solid rgba(244, 213, 139, 0.45);
    border-radius: 0.55rem;
    background: rgba(201, 154, 64, 0.1);
    padding: 0.55rem 0.7rem;
  }

  .trait-change .from {
    color: rgba(237, 228, 201, 0.55);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    text-decoration: line-through;
  }

  .trait-change .arrow {
    color: rgba(244, 213, 139, 0.7);
    font-family: 'Cinzel', Georgia, serif;
  }

  .trait-change .to {
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.95rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .trait-change .hint {
    flex-basis: 100%;
    color: rgba(237, 228, 201, 0.6);
    font-size: 0.78rem;
    font-style: italic;
  }

  .trait-shift {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: rgba(237, 228, 201, 0.7);
    font-size: 0.74rem;
  }

  .trait-shift b {
    color: #ede4c9;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-size: 0.78rem;
  }

  .trait-shift em {
    color: #aedab5;
    font-family: 'Cinzel', Georgia, serif;
    font-style: normal;
  }

  .concrete-list {
    list-style: none;
    margin: 0;
    padding: 0.55rem 0.75rem;
    border-left: 2px solid rgba(244, 213, 139, 0.45);
    background: rgba(201, 154, 64, 0.06);
    border-radius: 0 0.45rem 0.45rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.28rem;
  }

  .concrete-list li {
    color: rgba(237, 228, 201, 0.92);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.86rem;
    line-height: 1.4;
  }

  .btn-dim {
    opacity: 0.65;
    filter: saturate(0.7);
    animation: pulse-cta 1.6s ease-in-out infinite;
  }

  .btn-dim:hover {
    opacity: 0.95;
    animation: none;
  }

  @keyframes pulse-cta {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(244, 213, 139, 0);
    }
    50% {
      box-shadow: 0 0 0 4px rgba(244, 213, 139, 0.2);
    }
  }

  .reveal-skip {
    color: rgba(244, 213, 139, 0.65);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: underline;
    text-underline-offset: 3px;
    background: transparent;
    border: 0;
    padding: 0.15rem 0.25rem;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .reveal-skip:hover {
    color: #f4d58b;
  }
</style>
