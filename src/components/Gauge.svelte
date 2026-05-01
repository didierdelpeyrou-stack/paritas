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
    good: 'text-gold',
    warn: 'text-orange-400',
    crit: 'text-red-400'
  };

  let activePops = $derived(statKey ? fx.pops.filter(p => p.stat === statKey) : []);
  let pulse = $state(false);
  let lastValue = $state<number | null>(null);
  $effect(() => {
    if (lastValue === null) {
      lastValue = value;
      return;
    }
    if (Math.round(value) !== Math.round(lastValue)) {
      pulse = true;
      setTimeout(() => (pulse = false), 520);
      lastValue = value;
    }
  });
</script>

<button
  type="button"
  class="gauge-row w-full text-left px-2 py-1.5 rounded-md hover:bg-gold/5 transition-colors flex flex-col gap-1 group relative {z}"
  class:pulse
  onclick={onClick}>
  <div class="flex items-baseline gap-2 text-sm">
    <span class="w-5 text-center text-base shrink-0">{icon}</span>
    <span class="flex-1 truncate text-parchment-dim">{label}</span>
    <span class="font-bold tabular-nums {ZONE_TEXT[z]} text-base font-display gauge-value">{Math.round(display.current)}</span>
  </div>
  <div class="h-1.5 bg-ink rounded-full overflow-hidden ml-7 relative">
    <div class="h-full bg-gradient-to-r {ZONE_BAR[z]} transition-all duration-500 gauge-fill"
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
  .gauge-row {
    border: 1px solid transparent;
  }
  .gauge-row.opt { background: linear-gradient(90deg, rgba(16, 185, 129, 0.07), transparent); }
  .gauge-row.good { background: linear-gradient(90deg, rgba(245, 158, 11, 0.07), transparent); }
  .gauge-row.warn { background: linear-gradient(90deg, rgba(249, 115, 22, 0.08), transparent); border-color: rgba(249, 115, 22, 0.12); }
  .gauge-row.crit { background: linear-gradient(90deg, rgba(239, 68, 68, 0.1), transparent); border-color: rgba(239, 68, 68, 0.18); }
  .gauge-row.pulse .gauge-value { animation: gauge-pulse 0.48s ease; }
  .gauge-fill { box-shadow: 0 0 10px rgba(255,255,255,0.12); }
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
  @keyframes gauge-pulse {
    0% { transform: scale(1); }
    45% { transform: scale(1.22); filter: brightness(1.4); }
    100% { transform: scale(1); }
  }
</style>
