<script lang="ts">
  import type { ObjectiveProgress, RoleObjective } from '../../game/objectives/types';

  interface Props {
    objectives: RoleObjective[];
    progress: ObjectiveProgress[];
    turn: number;
  }

  let { objectives, progress, turn }: Props = $props();

  function status(objective: RoleObjective): 'satisfied' | 'failed' | 'pending' {
    const item = progress.find(p => p.id === objective.id);
    if (item?.satisfied) return 'satisfied';
    if (item?.failed) return 'failed';
    return 'pending';
  }

  function progressOf(objective: RoleObjective): number {
    return progress.find(p => p.id === objective.id)?.progress ?? 0;
  }

  function deadlineHint(objective: RoleObjective): string | null {
    if (objective.byTurn === undefined) return null;
    const left = objective.byTurn - turn;
    if (left < 0) return 'délai dépassé';
    if (left === 0) return 'dernier tour';
    return `dans ${left} tour${left > 1 ? 's' : ''}`;
  }
</script>

{#if objectives.length > 0}
  <section class="bordered-card p-4 space-y-3">
    <div>
      <div class="text-xs uppercase tracking-wider text-parchment-dim/60">Mandat</div>
      <h3 class="font-display text-amber-400 text-base">Ce qu’on attend de toi</h3>
    </div>

    <ul class="space-y-2">
      {#each objectives as objective}
        {@const s = status(objective)}
        {@const pct = progressOf(objective)}
        {@const hint = deadlineHint(objective)}
        <li class="objective-row" data-status={s}>
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <b>{objective.label}</b>
              <small>{objective.description}</small>
            </div>
            <span class="status-pill" data-status={s}>
              {#if s === 'satisfied'}atteint{:else if s === 'failed'}manqué{:else}{pct}%{/if}
            </span>
          </div>
          <div class="track">
            <i style="width: {Math.max(2, Math.min(100, pct))}%"></i>
          </div>
          {#if hint && s === 'pending'}
            <div class="hint">{hint}</div>
          {/if}
        </li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .objective-row {
    border: 1px solid rgba(201, 154, 64, 0.18);
    border-radius: 0.55rem;
    background: rgba(201, 154, 64, 0.05);
    padding: 0.55rem 0.65rem;
  }

  .objective-row[data-status='satisfied'] {
    border-color: rgba(95, 181, 107, 0.35);
    background: rgba(95, 181, 107, 0.06);
  }

  .objective-row[data-status='failed'] {
    border-color: rgba(224, 122, 110, 0.35);
    background: rgba(224, 122, 110, 0.05);
    opacity: 0.78;
  }

  .objective-row b {
    display: block;
    color: #ede4c9;
    font-size: 0.78rem;
    line-height: 1.2;
  }

  .objective-row small {
    display: block;
    margin-top: 0.16rem;
    color: rgba(237, 228, 201, 0.62);
    font-size: 0.66rem;
    line-height: 1.3;
  }

  .status-pill {
    flex-shrink: 0;
    border-radius: 999px;
    border: 1px solid rgba(244, 213, 139, 0.3);
    background: rgba(13, 16, 20, 0.4);
    padding: 0.12rem 0.45rem;
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.62rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .status-pill[data-status='satisfied'] {
    border-color: rgba(95, 181, 107, 0.55);
    color: #aedab5;
  }

  .status-pill[data-status='failed'] {
    border-color: rgba(224, 122, 110, 0.55);
    color: #e8a09b;
  }

  .track {
    height: 0.28rem;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.55);
    margin-top: 0.5rem;
  }

  .track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #c89b3c, #f4d58b);
    transition: width 0.3s ease;
  }

  .objective-row[data-status='satisfied'] .track i {
    background: linear-gradient(90deg, #5fb56b, #aedab5);
  }

  .objective-row[data-status='failed'] .track i {
    background: linear-gradient(90deg, #b46963, #e8a09b);
  }

  .hint {
    margin-top: 0.35rem;
    color: rgba(237, 228, 201, 0.55);
    font-size: 0.62rem;
    font-style: italic;
  }
</style>
