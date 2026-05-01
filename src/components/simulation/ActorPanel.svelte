<script lang="ts">
  import type { Actor, ActorId } from '../../game/types';
  import { ACTOR_LABELS, ACTOR_TOOLTIPS, stanceLabel } from '../../game/simulation/actors';

  interface Props {
    actorId: ActorId;
    actor: Actor;
  }
  let { actorId, actor }: Props = $props();

  const stanceHue = $derived(
    actor.stance === 'cooperatif'
      ? 'text-emerald-400'
      : actor.stance === 'dur'
      ? 'text-rose-400'
      : actor.stance === 'instable'
      ? 'text-violet-300'
      : 'text-gold'
  );
</script>

<div class="rounded-md border border-line/60 bg-ink/30 p-2.5 text-xs space-y-1.5"
     title={ACTOR_TOOLTIPS[actorId]}>
  <div class="flex items-center justify-between">
    <span class="font-display uppercase tracking-wider text-parchment">
      {ACTOR_LABELS[actorId]}
    </span>
    <span class="italic {stanceHue}">{stanceLabel(actor.stance)}</span>
  </div>
  <div class="grid grid-cols-3 gap-1 text-center">
    <div>
      <div class="text-parchment-dim/60 text-[10px] uppercase">Confiance</div>
      <div class="tabular-nums">{Math.round(actor.trust)}</div>
    </div>
    <div>
      <div class="text-parchment-dim/60 text-[10px] uppercase">Pression</div>
      <div class="tabular-nums">{Math.round(actor.pressure)}</div>
    </div>
    <div>
      <div class="text-parchment-dim/60 text-[10px] uppercase">Patience</div>
      <div class="tabular-nums">{Math.round(actor.patience)}</div>
    </div>
  </div>
</div>
