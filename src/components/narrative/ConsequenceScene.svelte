<script lang="ts">
  import { fade } from 'svelte/transition';
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
    warning: 'border-amber-500/40 bg-amber-500/5 text-amber-200',
    critical: 'border-rose-500/40 bg-rose-500/5 text-rose-200'
  };
</script>

<article
  class="bordered-card p-5 space-y-4"
  in:fade={{ duration: 280 }}
  role="region"
  aria-label="Conséquence de ton choix"
  aria-live="polite"
>
  <header>
    <div class="text-xs uppercase tracking-wider text-parchment-dim/85">Conséquence</div>
  </header>

  <div class="text-parchment leading-relaxed whitespace-pre-line">
    {consequence.text}
  </div>

  {#if consequence.newspaperHeadline}
    <div
      in:fade={{ duration: 380 }}
      class="border border-line/60 bg-ink/40 rounded-md px-3 py-2 text-xs"
    >
      <div class="uppercase tracking-wider text-parchment-dim/80">À la une</div>
      <div class="font-display text-amber-300/90 mt-0.5">« {consequence.newspaperHeadline} »</div>
    </div>
  {/if}

  {#if consequence.innerVoice}
    <div
      in:fade={{ duration: 380 }}
      class="border-l-2 border-violet-500/50 pl-3 italic text-sm text-violet-200/90"
    >
      {consequence.innerVoice}
    </div>
  {:else if consequence.voice}
    <div class="border-l-2 border-violet-500/50 pl-3 italic text-sm text-violet-200/90">
      {consequence.voice}
    </div>
  {/if}

  {#if consequence.memoryLine}
    <div
      in:fade={{ duration: 380 }}
      class="text-xs italic text-parchment-dim/85 border-t border-line/40 pt-2"
    >
      {consequence.memoryLine}
    </div>
  {/if}

  {#if consequence.traitChange}
    <div class="trait-change">
      <span class="from">{TRAIT_LABELS[consequence.traitChange.from]}</span>
      <span class="arrow">→</span>
      <span class="to">{TRAIT_LABELS[consequence.traitChange.to]}</span>
      <span class="hint">Tu deviens autre chose.</span>
    </div>
  {:else if consequence.traitShift}
    <div class="trait-shift">
      Trait : <b>{TRAIT_LABELS[consequence.traitShift.trait]}</b>
      <em>+{consequence.traitShift.delta}</em>
    </div>
  {/if}

  {#if consequence.numericSummary}
    <div class="text-xs uppercase tracking-wider text-parchment-dim/85 border-t border-line/60 pt-3">
      {consequence.numericSummary}
    </div>
  {/if}

  {#if alerts.length > 0}
    <div class="space-y-1.5">
      {#each alerts as a}
        <div class="text-xs rounded-md border px-3 py-2 {alertHue[a.level]}">
          <span class="uppercase tracking-wider mr-1">⚠</span>
          {a.text}
        </div>
      {/each}
    </div>
  {/if}

  <div class="pt-2">
    <button type="button" class="btn-primary w-full" onclick={onContinue}>
      Continuer
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
    font-size: 0.7rem;
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
    font-size: 0.7rem;
  }

  .trait-shift em {
    color: #aedab5;
    font-family: 'Cinzel', Georgia, serif;
    font-style: normal;
  }
</style>
