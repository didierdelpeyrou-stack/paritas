<script lang="ts">
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { fx } from '$lib/stores/fx.svelte';
  import type { StatKey } from '$lib/types';

  interface Props {
    value: number;
    label: string;
    icon?: string;
    statKey?: StatKey;
    target?: [number, number];
    onClick?: () => void;
  }

  let { value, label, icon = '•', statKey, target = [40, 80], onClick }: Props = $props();

  const display = new Tween(0, { duration: 600, easing: cubicOut });
  $effect(() => { display.target = value; });

  function zone(v: number): 'opt' | 'good' | 'warn' | 'crit' {
    if (v < 15) return 'crit';
    if (v < target[0]) return 'warn';
    if (v <= target[1]) return 'opt';
    if (v < target[1] + 15) return 'good';
    return 'warn';
  }

  let z = $derived(zone(value));
  const ZONE_BAR: Record<string, string> = {
    opt: 'from-emerald-500 to-emerald-300',
    good: 'from-amber-500 to-amber-300',
    warn: 'from-orange-500 to-amber-400',
    crit: 'from-red-500 to-red-400'
  };
  const ZONE_TEXT: Record<string, string> = {
    opt: 'text-emerald-400',
    good: 'text-amber-400',
    warn: 'text-orange-400',
    crit: 'text-red-400'
  };

  let activePops = $derived(statKey ? fx.pops.filter(p => p.stat === statKey) : []);
</script>

<button
  type="button"
  class="w-full text-left px-2 py-1.5 rounded-md hover:bg-amber-500/5 transition-colors flex flex-col gap-1 group relative"
  onclick={onClick}>
  <div class="flex items-baseline gap-2 text-sm">
    <span class="w-5 text-center text-base shrink-0">{icon}</span>
    <span class="flex-1 truncate text-parchment-dim">{label}</span>
    <span class="font-bold tabular-nums {ZONE_TEXT[z]} text-base font-display">{Math.round(display.current)}</span>
  </div>
  <div class="h-1.5 bg-ink rounded-full overflow-hidden ml-7 relative">
    <div class="h-full bg-gradient-to-r {ZONE_BAR[z]} transition-all duration-500"
         style="width: {Math.max(2, Math.min(100, display.current))}%"></div>
    {#if target}
      <div class="absolute top-0 h-full w-px bg-white/30" style="left: {target[0]}%"></div>
      <div class="absolute top-0 h-full w-px bg-white/30" style="left: {target[1]}%"></div>
    {/if}
  </div>

  {#each activePops as p (p.id)}
    <span class="delta-pop"
          class:up={p.value > 0}
          class:down={p.value < 0}
          in:fade={{ duration: 80 }}>
      {p.value > 0 ? '+' : ''}{Math.round(p.value)}
    </span>
  {/each}
</button>

<style>
  .delta-pop {
    position: absolute;
    top: 0;
    right: 6px;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.95rem;
    pointer-events: none;
    animation: delta-rise 1.4s ease-out forwards;
    text-shadow: 0 2px 4px rgba(0,0,0,0.7);
  }
  .delta-pop.up { color: #5fb56b; }
  .delta-pop.down { color: #e07a6e; }
  @keyframes delta-rise {
    0% { transform: translateY(0); opacity: 0; }
    20% { opacity: 1; }
    100% { transform: translateY(-28px); opacity: 0; }
  }
</style>
