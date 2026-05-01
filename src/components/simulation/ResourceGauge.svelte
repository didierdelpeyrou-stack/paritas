<script lang="ts">
  import type { ResourceKey } from '../../game/types';
  import { RESOURCE_LABELS, RESOURCE_TOOLTIPS } from '../../game/simulation/resources';

  interface Props {
    resource: ResourceKey;
    value: number;
    /** Couleur clé tailwind ('amber','rose','emerald','violet','cyan') */
    hue?: 'amber' | 'rose' | 'emerald' | 'violet' | 'cyan' | 'slate';
  }
  let { resource, value, hue = 'amber' }: Props = $props();

  const hueMap: Record<string, { bar: string; track: string; text: string }> = {
    amber: { bar: 'bg-amber-500', track: 'bg-gold/10', text: 'text-gold' },
    rose: { bar: 'bg-rose-500', track: 'bg-rose-500/10', text: 'text-rose-400' },
    emerald: { bar: 'bg-emerald-500', track: 'bg-emerald-500/10', text: 'text-emerald-400' },
    violet: { bar: 'bg-violet-500', track: 'bg-violet-500/10', text: 'text-violet-400' },
    cyan: { bar: 'bg-cyan-500', track: 'bg-cyan-500/10', text: 'text-cyan-400' },
    slate: { bar: 'bg-slate-400', track: 'bg-slate-400/10', text: 'text-slate-300' }
  };
  const c = $derived(hueMap[hue]!);
  const pct = $derived(Math.max(0, Math.min(100, value)));
</script>

<div class="space-y-1" title={RESOURCE_TOOLTIPS[resource]}>
  <div class="flex items-center justify-between text-xs">
    <span class="uppercase tracking-wider {c.text}">{RESOURCE_LABELS[resource]}</span>
    <span class="text-parchment-dim/80 tabular-nums">{Math.round(value)}</span>
  </div>
  <div class="h-1.5 rounded-full {c.track} overflow-hidden">
    <div class="h-full {c.bar} transition-all duration-500" style="width:{pct}%"></div>
  </div>
</div>
