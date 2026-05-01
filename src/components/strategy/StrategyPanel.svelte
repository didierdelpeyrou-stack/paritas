<script lang="ts">
  import { rebirth } from '../../game/engine/gameState.svelte';
  import { availableStrategies, strategyById } from '../../game/strategy/catalog';
  import { canDevelopOrganization } from '../../game/org/organization';
  import type { Camp } from '../../lib/types';
  import type { ActiveStrategy } from '../../game/strategy/types';
  import type { PlayerOrganization } from '../../game/org/types';

  interface Props {
    turn: number;
    camp: Camp;
    organization: PlayerOrganization;
    activeStrategies: ActiveStrategy[];
  }

  let { turn, camp, organization, activeStrategies }: Props = $props();

  const unlocked = $derived(canDevelopOrganization(turn, camp));
  const activeIds = $derived(activeStrategies.map(strategy => strategy.id));
  const strategies = $derived(availableStrategies(turn, camp, organization, activeIds).slice(0, 4));

  function targetLabel(target: string): string {
    return {
      base: 'Base',
      adversaire: 'Adversaire',
      etat: 'État',
      opinion: 'Opinion',
      institution: 'Institution'
    }[target] ?? target;
  }
</script>

<section class="bordered-card p-4 space-y-3">
  <div>
    <div class="text-xs uppercase tracking-wider text-parchment-dim/60">Stratégies</div>
    <h3 class="font-display text-amber-400 text-base">Plans multi-tours</h3>
  </div>

  {#if !unlocked}
    <div class="rounded-md border border-line/70 bg-ink/35 px-3 py-2 text-xs text-parchment-dim/75 leading-snug">
      Les stratégies longues se débloquent quand ton organisation devient assez structurée.
    </div>
  {:else}
    {#if activeStrategies.length > 0}
      <div class="space-y-2">
        <div class="text-xs uppercase tracking-wider text-parchment-dim/60">En cours</div>
        {#each activeStrategies as active}
          {@const def = strategyById(active.id)}
          {#if def}
            <div class="strategy-active">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <b>{def.label}</b>
                  <small>{targetLabel(def.target)} · reste {active.remainingTurns} tour{active.remainingTurns > 1 ? 's' : ''}</small>
                </div>
                <em>{Math.round(active.progress)}%</em>
              </div>
              <div class="strategy-track">
                <i style="width: {Math.max(3, Math.min(100, active.progress))}%"></i>
              </div>
              <div class="strategy-risk">Risque {Math.round(active.risk)}%</div>
            </div>
          {/if}
        {/each}
      </div>
    {/if}

    <details open class="space-y-2">
      <summary class="cursor-pointer text-xs uppercase tracking-wider text-parchment-dim/70">
        Lancer un plan
      </summary>
      <div class="space-y-2 pt-2">
        {#if strategies.length === 0}
          <div class="text-xs italic text-parchment-dim/60">
            Aucun nouveau plan disponible avec tes ressources actuelles.
          </div>
        {/if}
        {#each strategies as strategy}
          {@const cost = strategy.costPerTurn.treasury ?? 0}
          {@const disabled = organization.treasury < cost}
          <button
            type="button"
            class="strategy-button"
            disabled={disabled}
            onclick={() => rebirth.startStrategy(strategy.id)}
            title={strategy.description}
          >
            <span>
              <b>{strategy.label}</b>
              <small>{strategy.description}</small>
              <small>Cible : {targetLabel(strategy.target)} · durée {strategy.duration} tours · risque {strategy.risk}%</small>
            </span>
            <em>{cost}/tour</em>
          </button>
        {/each}
      </div>
    </details>
  {/if}
</section>

<style>
  .strategy-active {
    border: 1px solid rgba(126, 180, 255, 0.22);
    border-radius: 0.55rem;
    background: rgba(46, 94, 138, 0.1);
    padding: 0.55rem 0.65rem;
  }

  .strategy-active b,
  .strategy-button b {
    display: block;
    color: #ede4c9;
    font-size: 0.78rem;
    line-height: 1.2;
  }

  .strategy-active small,
  .strategy-button small {
    display: block;
    margin-top: 0.14rem;
    color: rgba(237, 228, 201, 0.62);
    font-size: 0.68rem;
    line-height: 1.25;
  }

  .strategy-active em,
  .strategy-button em {
    color: #b8d6ff;
    font-style: normal;
    white-space: nowrap;
  }

  .strategy-track {
    height: 0.32rem;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.55);
    margin-top: 0.45rem;
  }

  .strategy-track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #7eb4ff, #f4d58b);
    transition: width 0.3s ease;
  }

  .strategy-risk {
    margin-top: 0.32rem;
    color: rgba(237, 228, 201, 0.55);
    font-size: 0.66rem;
  }

  .strategy-button {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr auto;
    gap: 0.65rem;
    align-items: center;
    border: 1px solid rgba(126, 180, 255, 0.23);
    border-radius: 0.55rem;
    background: rgba(46, 94, 138, 0.08);
    padding: 0.55rem 0.65rem;
    color: #ede4c9;
    text-align: left;
    transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
  }

  .strategy-button:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: rgba(126, 180, 255, 0.55);
    background: rgba(46, 94, 138, 0.15);
  }

  .strategy-button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
</style>
