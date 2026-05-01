<script lang="ts">
  /* ============================================================
     DialogueScene.svelte — Suzerain-style
     Dialogue multi-tours avec PNJ portraituré, puis choix
     Effet typewriter + sous-texte révélé en survol
  ============================================================ */
  import { fade, fly } from 'svelte/transition';
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
  let stepIdx = $state(0);
  let showSubtext = $state(false);
  let typed = $state('');
  let typingDone = $state(false);

  let dialogue = $derived(event.dialogue ?? []);
  let currentStep = $derived(dialogue[stepIdx]);
  let situation = $derived(typeof event.situation === 'function' ? event.situation({ camp }) : event.situation);

  $effect(() => {
    if (!currentStep) return;
    typed = '';
    typingDone = false;
    showSubtext = false;
    const target = currentStep.text;
    let i = 0;
    const tick = () => {
      typed = target.slice(0, i++);
      if (i > target.length) { typingDone = true; return; }
      setTimeout(tick, 16 + Math.random() * 12);
    };
    tick();
  });

  function next() {
    if (!typingDone) {
      typed = currentStep!.text;
      typingDone = true;
      return;
    }
    if (stepIdx < dialogue.length - 1) stepIdx++;
    else stepIdx = dialogue.length; // bascule vers les choix
  }

  let inChoiceMode = $derived(stepIdx >= dialogue.length);

  function speakerColor(who: string): string {
    if (who === 'pnj') return 'text-gold-soft';
    if (who === 'self') return 'text-rose-300';
    return 'text-violet-300';
  }
</script>

<div class="max-w-2xl mx-auto" in:fade={{ duration: 400 }}>
  <div class="bordered-card p-6 relative overflow-hidden">
    <!-- Header : époque + titre + PNJ -->
    {#if event.date}
      <div class="text-[0.7rem] uppercase tracking-[0.2em] text-gold font-display mb-1">{event.date}</div>
    {/if}
    <h2 class="font-display text-2xl text-gold-soft leading-tight mb-4">{event.title}</h2>

    {#if event.pnj}
      <div class="flex items-center gap-3 mb-4 pb-4 border-b border-line/60">
        <div class="w-14 h-14 rounded-full bg-gradient-to-br
                    {event.pnj.side === 'salarie' ? 'from-rose-700 to-rose-500' : event.pnj.side === 'patron' ? 'from-blue-800 to-blue-500' : 'from-stone-700 to-stone-500'}
                    flex items-center justify-center font-display font-bold text-xl text-white shadow-lg">
          {event.pnj.init}
        </div>
        <div>
          <div class="font-bold text-parchment">{event.pnj.name}</div>
          <div class="text-xs text-parchment-dim/60 italic">est en face de toi</div>
        </div>
      </div>
    {/if}

    {#if !inChoiceMode}
      <!-- Phase dialogue -->
      {#key stepIdx}
        <div class="min-h-[140px]" in:fly={{ y: 8, duration: 300 }}>
          {#if currentStep}
            <div class="text-[0.7rem] uppercase tracking-[0.2em] {speakerColor(currentStep.who)} font-display mb-2">
              {currentStep.who === 'pnj' ? (event.pnj?.name ?? 'Lui') : currentStep.who === 'self' ? 'Toi' : 'Narrateur'}
            </div>
            <p class="text-lg leading-relaxed text-parchment {!typingDone ? 'cursor-blink' : ''}">
              {typed}
            </p>
            {#if currentStep.subtext && typingDone}
              <button type="button"
                      class="mt-3 text-xs italic text-parchment-dim/70 hover:text-violet-300 transition-colors text-left"
                      onclick={() => showSubtext = !showSubtext}>
                {#if showSubtext}
                  <span in:fade={{ duration: 200 }}>↳ <i>{currentStep.subtext}</i></span>
                {:else}
                  ↳ <span class="underline decoration-dotted decoration-violet-400/60">lire entre les lignes</span>
                {/if}
              </button>
            {/if}
          {/if}
        </div>
      {/key}

      <div class="mt-5 flex justify-between items-center">
        <div class="flex gap-1">
          {#each dialogue as _, i}
            <div class="w-1.5 h-1.5 rounded-full transition-colors"
                 class:bg-amber-400={i <= stepIdx}
                 class:bg-line={i > stepIdx}></div>
          {/each}
        </div>
        <button class="btn-ghost" onclick={next}>
          {typingDone ? 'Continuer →' : '⏭ Passer'}
        </button>
      </div>
    {:else}
      <!-- Phase choix -->
      <div in:fly={{ y: 12, duration: 350 }}>
        <p class="text-sm italic text-parchment-dim/80 mb-4 leading-relaxed">{@html situation}</p>

        {#if event.historical}
          <div class="text-xs text-parchment-dim/80 italic border-l-2 border-gold/60 pl-3 my-4">
            📜 {@html event.historical}
          </div>
        {/if}

        {#if event.portee}
          <div class="text-xs text-parchment border border-sky-400/25 bg-sky-950/20 rounded-lg px-3 py-2 my-4">
            <div class="font-display uppercase tracking-[0.16em] text-sky-300 text-[0.62rem] mb-1">
              Portée socio-historique
            </div>
            <div class="leading-relaxed text-parchment-dim/90">{@html event.portee}</div>
          </div>
        {/if}

        <div class="space-y-2">
          {#each event.choices as ch, i}
            {@const enabled = !ch.req || ch.req({ camp })}
            <button type="button"
                    class="w-full text-left px-4 py-3 rounded-lg border-2 transition-all
                           {ch.recommended ? 'border-emerald-500/60 hover:border-emerald-400 bg-emerald-900/10' : ch.risky ? 'border-orange-500/60 hover:border-orange-400 bg-orange-900/10' : 'border-line hover:border-gold bg-surface-2/50'}
                           {!enabled ? 'opacity-40 cursor-not-allowed' : 'hover:translate-x-1'}"
                    disabled={!enabled}
                    onclick={() => onChoose(i)}>
              <div class="flex items-baseline gap-2">
                <span class="text-lg">{ch.icon ?? '◆'}</span>
                <div class="flex-1">
                  <div class="font-medium text-parchment text-sm">{ch.text}</div>
                  {#if ch.why}<div class="text-xs italic text-parchment-dim/70 mt-0.5">{ch.why}</div>{/if}
                  {#if mode === 'reflechi' && enabled}
                    <ReflectiveChoicePanel choice={ch} event={event} gameState={gameState} camp={camp} compact />
                  {/if}
                </div>
                {#if ch.recommended}<span class="text-[0.65rem] uppercase tracking-wider text-emerald-400 font-display whitespace-nowrap">★ Historien</span>{/if}
                {#if ch.risky}<span class="text-[0.65rem] uppercase tracking-wider text-orange-400 font-display whitespace-nowrap">⚡ Risqué</span>{/if}
              </div>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
