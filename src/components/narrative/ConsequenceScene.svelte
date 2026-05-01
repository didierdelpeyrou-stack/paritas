<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { ConsequenceRender } from '../../game/engine/consequenceEngine';
  import type { TensionAlert } from '../../game/simulation/tensions';

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

<article class="bordered-card p-5 space-y-4" in:fade={{ duration: 280 }}>
  <header class="flex items-center justify-between gap-3">
    <div class="text-xs uppercase tracking-wider text-parchment-dim/70">Conséquence</div>
    {#if consequence.enriched}
      <div class="text-[0.65rem] uppercase tracking-wider text-amber-300/80">enrichi</div>
    {/if}
  </header>

  <div class="text-parchment leading-relaxed whitespace-pre-line">
    {consequence.text}
  </div>

  {#if consequence.newspaperHeadline}
    <div class="border border-line/60 bg-ink/40 rounded-md px-3 py-2 text-xs">
      <div class="uppercase tracking-wider text-parchment-dim/60">À la une</div>
      <div class="font-display text-amber-300/90 mt-0.5">« {consequence.newspaperHeadline} »</div>
    </div>
  {/if}

  {#if consequence.innerVoice}
    <div class="border-l-2 border-violet-500/50 pl-3 italic text-sm text-violet-200/90">
      {consequence.innerVoice}
    </div>
  {:else if consequence.voice}
    <div class="border-l-2 border-violet-500/50 pl-3 italic text-sm text-violet-200/90">
      {consequence.voice}
    </div>
  {/if}

  {#if consequence.memoryLine}
    <div class="text-xs italic text-parchment-dim/70 border-t border-line/40 pt-2">
      {consequence.memoryLine}
    </div>
  {/if}

  {#if consequence.numericSummary}
    <div class="text-xs uppercase tracking-wider text-parchment-dim/70 border-t border-line/60 pt-3">
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
