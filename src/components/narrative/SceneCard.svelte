<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import type { Choice, RenderMode, Scenario } from '../../game/types';
  import VoicePanel from './VoicePanel.svelte';

  interface Props {
    scenario: Scenario;
    mode: RenderMode;
    onChoose: (choice: Choice) => void;
  }
  let { scenario, mode, onChoose }: Props = $props();

  const setupText = $derived(
    mode === 'reflechi' ? scenario.setup.reflechi : scenario.setup.compulsif
  );
  const showVoices = $derived(mode === 'compulsif' && (scenario.voices?.length ?? 0) > 0);
  const moodHue: Record<string, string> = {
    calme: 'border-cyan-500/40 bg-cyan-500/5',
    tendu: 'border-amber-500/40 bg-amber-500/5',
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
    <div class="flex items-center justify-between text-xs uppercase tracking-wider text-parchment-dim/70">
      <span>{scenario.date}</span>
      <span class="italic">{scenario.subtitle ?? ''}</span>
    </div>
    <h2 class="font-display text-2xl text-amber-400">{scenario.title}</h2>
  </header>

  <div class="text-parchment leading-relaxed whitespace-pre-line text-sm sm:text-base">
    {setupText}
  </div>

  {#if mode === 'reflechi'}
    <div class="text-xs italic text-parchment-dim/70 border-l-2 border-line pl-3 py-1">
      <span class="not-italic uppercase tracking-wider text-parchment-dim/80 mr-1">
        Contexte —
      </span>
      {scenario.historicalContext}
    </div>
  {/if}

  {#if showVoices && scenario.voices}
    <VoicePanel voices={scenario.voices} />
  {/if}

  {#if scenario.quotes && scenario.quotes.length > 0}
    <div class="space-y-1.5">
      {#each scenario.quotes as q}
        <blockquote class="border-l-2 border-amber-500/60 pl-3 italic text-sm text-parchment-dim">
          « {q.text} »
          <div class="text-xs not-italic text-parchment-dim/60 mt-0.5">— {q.source}</div>
        </blockquote>
      {/each}
    </div>
  {/if}

  <ul class="space-y-2 mt-3">
    {#each scenario.choices as ch, i}
      <li>
        <button
          type="button"
          class="w-full text-left rounded-md border border-line hover:border-amber-500/70 hover:bg-amber-500/5
                 transition-colors px-3.5 py-3 group"
          onclick={() => onChoose(ch)}
          in:fly={{ y: 8, duration: 240, delay: 60 + i * 40 }}
        >
          {#if mode === 'reflechi'}
            <div class="text-[11px] uppercase tracking-wider text-parchment-dim/60 mb-1">
              {ch.intent}
            </div>
          {/if}
          <div class="text-parchment group-hover:text-amber-200 transition-colors">
            {ch.text}
          </div>
          {#if mode === 'reflechi' && ch.theoryHint}
            <div class="text-xs italic text-parchment-dim/60 mt-1.5">
              {ch.theoryHint}
            </div>
          {/if}
        </button>
      </li>
    {/each}
  </ul>
</article>
