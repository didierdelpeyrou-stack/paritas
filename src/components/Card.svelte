<script lang="ts">
  /* ============================================================
     Card.svelte — carte de choix simple, clic uniquement
     Plus de swipe, plus de drag : boutons clairs et grands
     ============================================================ */
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import type { GameEvent, GameMode, GameState } from '$lib/types';
  import ReflectiveChoicePanel from './ReflectiveChoicePanel.svelte';

  interface Props {
    event: GameEvent;
    camp: 'salarie' | 'patron';
    mode: GameMode;
    gameState: GameState;
    onChoose: (idx: number) => void;
  }

  let { event, camp, mode, gameState, onChoose }: Props = $props();

  let situation = $derived(
    typeof event.situation === 'function' ? event.situation({ camp }) : event.situation
  );

  function illustrationGlyph(key?: string): string {
    if (!key) return '';
    return key === 'matignon' ? '🤝'
      : key === 'barricade' ? '🚩'
      : key === 'chains' ? '⛓️'
      : key === 'livre' ? '📜'
      : key === 'manif' ? '✊'
      : '◆';
  }
</script>

<div class="max-w-2xl mx-auto" in:fade={{ duration: 300 }}>
  <article
    class="parchment card-shadow rounded-2xl p-6 sm:p-8 relative"
    in:fly={{ y: 16, duration: 400, easing: cubicOut }}>
    <!-- Bordure ornementée -->
    <div class="absolute inset-0 rounded-2xl pointer-events-none border border-amber-700/20"></div>

    <!-- Date + Titre -->
    {#if event.date}
      <div class="text-[0.7rem] uppercase tracking-[0.2em] text-amber-700 font-display mb-1">
        {event.date}
      </div>
    {/if}
    <h2 class="font-display text-2xl sm:text-3xl text-amber-900 leading-tight mb-4">
      {event.title}
    </h2>

    <!-- Situation -->
    <p class="text-stone-800 text-base leading-relaxed mb-5">{@html situation}</p>

    <!-- Illustration optionnelle -->
    {#if event.illus}
      <div class="my-4 flex justify-center">
        <div class="w-24 h-24 rounded-full border-2 border-amber-900/30 bg-amber-50/60 flex items-center justify-center text-4xl">
          {illustrationGlyph(event.illus)}
        </div>
      </div>
    {/if}

    <!-- Encart historique -->
    {#if event.historical}
      <div class="text-sm text-stone-700 italic border-l-2 border-amber-700/50 pl-3 my-4">
        📜 {@html event.historical}
      </div>
    {/if}

    {#if event.portee}
      <div class="text-sm text-slate-900 border border-slate-700/25 bg-slate-100/70 rounded-lg px-4 py-3 my-4">
        <div class="text-[0.65rem] uppercase tracking-[0.16em] text-slate-700 font-display mb-1">
          Portée socio-historique
        </div>
        <div class="leading-relaxed">{@html event.portee}</div>
      </div>
    {/if}

    <!-- Le savais-tu ? -->
    {#if event.saviez}
      <div class="text-sm text-emerald-900/80 italic border-l-2 border-emerald-700/40 pl-3 my-4">
        💡 {@html event.saviez}
      </div>
    {/if}

    <!-- Choix -->
    <div class="mt-6 space-y-3">
      <div class="text-[0.7rem] uppercase tracking-[0.15em] text-stone-700 font-display mb-2">
        Quelle décision ?
      </div>
      {#each event.choices as ch, i}
        {@const enabled = !ch.req || ch.req({ camp })}
        <button
          type="button"
          class="w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all
                 {ch.recommended
                   ? 'border-emerald-700/50 hover:border-emerald-600 bg-emerald-50/60 hover:bg-emerald-100/80'
                   : ch.risky
                   ? 'border-orange-700/50 hover:border-orange-600 bg-orange-50/60 hover:bg-orange-100/80'
                   : 'border-amber-900/25 hover:border-amber-700 bg-amber-50/40 hover:bg-amber-100/60'}
                 {!enabled
                   ? 'opacity-40 cursor-not-allowed'
                   : 'hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'}"
          disabled={!enabled}
          onclick={() => onChoose(i)}>
          <div class="flex items-start gap-3">
            <span class="text-2xl shrink-0 mt-0.5">{ch.icon ?? '◆'}</span>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-stone-900 text-base leading-snug">
                {ch.text}
              </div>
              {#if ch.why}
                <div class="text-xs italic text-stone-600 mt-1">{ch.why}</div>
              {/if}
              {#if !enabled}
                <div class="text-xs italic text-stone-500 mt-1">
                  — indisponible pour ton camp
                </div>
              {/if}
              {#if mode === 'reflechi' && enabled}
                <ReflectiveChoicePanel choice={ch} event={event} gameState={gameState} camp={camp} />
              {/if}
            </div>
            {#if ch.recommended}
              <span class="text-[0.65rem] uppercase tracking-wider text-emerald-700 font-display whitespace-nowrap shrink-0">
                ★ Historien
              </span>
            {/if}
            {#if ch.risky}
              <span class="text-[0.65rem] uppercase tracking-wider text-orange-700 font-display whitespace-nowrap shrink-0">
                ⚡ Risqué
              </span>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </article>
</div>
