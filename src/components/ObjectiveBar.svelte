<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { game } from '$lib/stores/game.svelte';
  import { ERAS, eraForTurn } from '$lib/data/eras';

  let axes = $derived(game.axes);
  let era = $derived(eraForTurn(game.state.turn));

  const puiss = tweened(0, { duration: 600, easing: cubicOut });
  const legit = tweened(0, { duration: 600, easing: cubicOut });
  const dura = tweened(0, { duration: 600, easing: cubicOut });
  $effect(() => { puiss.set(axes.puissance); });
  $effect(() => { legit.set(axes.legitimite); });
  $effect(() => { dura.set(axes.durabilite); });
</script>

<div class="bordered-card p-3 mb-3">
  <div class="mb-3 rounded-md border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-xs text-parchment-dim/85 leading-relaxed">
    <b class="text-amber-300 font-display uppercase tracking-wider text-[0.65rem]">À toi de jouer</b>
    · Lis la situation, choisis une action. Les compétences renforcent tes décisions; les ressources et capitaux disent ce que ton camp gagne, use ou construit.
  </div>
  <div class="grid grid-cols-3 gap-3">
    <div class="text-center">
      <div class="text-[0.65rem] uppercase tracking-widest text-parchment-dim/70 font-display">⚡ Puissance</div>
      <div class="text-2xl font-bold font-display text-amber-400 leading-tight tabular-nums">{Math.round($puiss)}</div>
      <div class="h-1 bg-ink rounded-full overflow-hidden mt-1">
        <div class="h-full bg-amber-400 transition-all duration-500" style="width:{$puiss}%"></div>
      </div>
    </div>
    <div class="text-center">
      <div class="text-[0.65rem] uppercase tracking-widest text-parchment-dim/70 font-display">🌿 Légitimité</div>
      <div class="text-2xl font-bold font-display text-emerald-400 leading-tight tabular-nums">{Math.round($legit)}</div>
      <div class="h-1 bg-ink rounded-full overflow-hidden mt-1">
        <div class="h-full bg-emerald-400 transition-all duration-500" style="width:{$legit}%"></div>
      </div>
    </div>
    <div class="text-center">
      <div class="text-[0.65rem] uppercase tracking-widest text-parchment-dim/70 font-display">🏛 Durabilité</div>
      <div class="text-2xl font-bold font-display text-violet-300 leading-tight tabular-nums">{Math.round($dura)}</div>
      <div class="h-1 bg-ink rounded-full overflow-hidden mt-1">
        <div class="h-full bg-violet-300 transition-all duration-500" style="width:{$dura}%"></div>
      </div>
    </div>
  </div>
  <div class="mt-3 pt-3 border-t border-line/50 flex items-center justify-between text-xs">
    <span class="text-parchment-dim/80">
        <span class="font-display text-amber-400 uppercase tracking-wider text-[0.65rem]">Époque {era.id + 1}/{ERAS.length}</span>
      &nbsp;·&nbsp;<i>{era.name}</i>
    </span>
    <span class="text-parchment-dim/80 tabular-nums">
      Tour <b class="text-amber-400">{game.state.turn}</b><span class="opacity-60">/100</span>
    </span>
  </div>
  <div class="mt-2 flex gap-1">
    {#each ERAS as e, i}
      <div class="h-1 flex-1 rounded-full transition-colors duration-300"
           class:bg-amber-400={i < era.id}
           class:bg-emerald-400={i === era.id}
           class:shadow-glow-emerald={i === era.id}
           class:bg-line={i > era.id}></div>
    {/each}
  </div>
</div>

<style>
  :global(.shadow-glow-emerald) { box-shadow: 0 0 8px rgba(95, 181, 107, 0.6); }
</style>
