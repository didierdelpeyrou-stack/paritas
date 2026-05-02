<script lang="ts">
  import type { EraId, ResourceKey } from '../../game/types';
  import { RESOURCE_LABELS, RESOURCE_TOOLTIPS } from '../../game/simulation/resources';
  import { currencyForEra } from '../../game/content/eras';
  import ResourceIcon from './ResourceIcon.svelte';

  interface Props {
    resource: ResourceKey;
    value: number;
    /** Couleur clé tailwind ('amber','rose','emerald','violet','cyan') */
    hue?: 'amber' | 'rose' | 'emerald' | 'violet' | 'cyan' | 'slate';
    /** Si fourni, la jauge `caisse` affiche la monnaie de l'ère plutôt que "Caisse". */
    era?: EraId;
  }
  let { resource, value, hue = 'amber', era }: Props = $props();

  const label = $derived(
    resource === 'caisse' && era
      ? capitalize(currencyForEra(era))
      : RESOURCE_LABELS[resource]
  );

  function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  const hueMap: Record<string, { bar: string; track: string; text: string; spark: string }> = {
    amber: { bar: 'bg-amber-500', track: 'bg-gold/10', text: 'text-gold', spark: 'rgba(244, 213, 139, 0.7)' },
    rose: { bar: 'bg-rose-500', track: 'bg-rose-500/10', text: 'text-rose-400', spark: 'rgba(248, 113, 113, 0.7)' },
    emerald: { bar: 'bg-emerald-500', track: 'bg-emerald-500/10', text: 'text-emerald-400', spark: 'rgba(110, 231, 183, 0.7)' },
    violet: { bar: 'bg-violet-500', track: 'bg-violet-500/10', text: 'text-violet-400', spark: 'rgba(196, 181, 253, 0.7)' },
    cyan: { bar: 'bg-cyan-500', track: 'bg-cyan-500/10', text: 'text-cyan-400', spark: 'rgba(103, 232, 249, 0.7)' },
    slate: { bar: 'bg-slate-400', track: 'bg-slate-400/10', text: 'text-slate-300', spark: 'rgba(203, 213, 225, 0.7)' }
  };
  const c = $derived(hueMap[hue]!);
  const pct = $derived(Math.max(0, Math.min(100, value)));

  /* === Compteur animé ===
     À chaque changement de `value`, on interpole de la valeur affichée
     précédente vers la nouvelle sur ~600 ms. Donne un comptage visible
     sur les jauges de la sidebar. */
  let displayed = $state(0);
  let raf: number | null = null;
  let initialized = false;

  $effect(() => {
    const target = value;
    if (!initialized) {
      displayed = target;
      initialized = true;
      return;
    }
    const start = displayed;
    if (Math.abs(target - start) < 0.5) {
      displayed = target;
      return;
    }
    const duration = 600;
    const t0 = performance.now();
    if (raf !== null) cancelAnimationFrame(raf);
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      displayed = start + (target - start) * eased;
      if (t < 1) raf = requestAnimationFrame(tick);
      else raf = null;
    };
    raf = requestAnimationFrame(tick);
  });

  /* === Sparkline ===
     Garde les 12 dernières valeurs effectives (pas l'animation lissée),
     trace une mini-courbe sous la jauge. Donne au joueur un signal sur
     la trajectoire de la ressource (montée/descente/stagnation). */
  const HISTORY_LEN = 12;
  let history = $state<number[]>([]);
  let lastTracked = 0;
  let historyInit = false;

  $effect(() => {
    if (!historyInit) {
      lastTracked = value;
      historyInit = true;
      return;
    }
    if (Math.abs(value - lastTracked) < 0.5) return;
    history = [...history, value].slice(-HISTORY_LEN);
    lastTracked = value;
  });

  const sparkPath = $derived(buildSparkPath(history));

  function buildSparkPath(pts: number[]): string {
    if (pts.length < 2) return '';
    const w = 60;
    const h = 12;
    const dx = w / (HISTORY_LEN - 1);
    return pts
      .map((p, i) => {
        const x = (i + (HISTORY_LEN - pts.length)) * dx;
        const y = h - (Math.max(0, Math.min(100, p)) / 100) * h;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }
</script>

<div class="space-y-1 resource-row" title={RESOURCE_TOOLTIPS[resource]}>
  <div class="flex items-center justify-between text-xs gap-2">
    <div class="flex items-center gap-2 min-w-0">
      <ResourceIcon {resource} value={value} size={28} />
      <span class="uppercase tracking-wider {c.text} truncate">{label}</span>
    </div>
    <div class="flex items-center gap-1.5">
      {#if sparkPath}
        <svg class="spark" viewBox="0 0 60 12" width="60" height="12" aria-hidden="true">
          <path d={sparkPath} fill="none" stroke={c.spark} stroke-width="1.2" stroke-linejoin="round" />
        </svg>
      {/if}
      <span class="text-parchment-dim/80 tabular-nums">{Math.round(displayed)}</span>
    </div>
  </div>
  <div class="h-1.5 rounded-full {c.track} overflow-hidden ml-9">
    <div class="h-full {c.bar} transition-all duration-500" style="width:{pct}%"></div>
  </div>
</div>

<style>
  .spark {
    opacity: 0.85;
  }
</style>
