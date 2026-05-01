<script lang="ts">
  import { rebirth } from '../../game/engine/gameState.svelte';
  import type { ActorId, Choice } from '../../game/types';
  import { ALL_RESOURCES } from '../../game/types';
  import SceneCard from '../narrative/SceneCard.svelte';
  import ConsequenceScene from '../narrative/ConsequenceScene.svelte';
  import PipelinePanel from '../narrative/PipelinePanel.svelte';
  import ResourceGauge from '../simulation/ResourceGauge.svelte';
  import ActorPanel from '../simulation/ActorPanel.svelte';
  import OrganizationPanel from '../org/OrganizationPanel.svelte';
  import ObjectivePanel from '../objectives/ObjectivePanel.svelte';
  import StrategyPanel from '../strategy/StrategyPanel.svelte';
  import WorldStrategyPanel from '../world/WorldStrategyPanel.svelte';
  import EndingReport from '../feedback/EndingReport.svelte';
  import { eraForTurn } from '../../game/content/eras';
  import { TRAIT_LABELS } from '../../game/narrative/personalityEngine';

  interface Props {
    onReplay: () => void;
  }
  let { onReplay }: Props = $props();

  const ACTOR_IDS: ActorId[] = ['base', 'adversaire', 'etat', 'opinion'];

  const state = $derived(rebirth.state);
  const scenario = $derived(rebirth.currentScenario);
  const consequence = $derived(rebirth.consequence);
  const ending = $derived(rebirth.ending);
  const era = $derived(state ? eraForTurn(state.turn) : null);
  const reversedLog = $derived(rebirth.log.slice(-15).slice().reverse());

  const hueByEra: Record<string, 'amber' | 'rose' | 'emerald' | 'violet' | 'cyan' | 'slate'> = {
    antiquite: 'amber',
    medieval: 'amber',
    revolution: 'rose',
    xixe: 'rose',
    belle_epoque: 'emerald',
    entre_deux_guerres: 'emerald',
    reconstruction: 'violet',
    guerre_froide: 'violet',
    trente_glorieuses: 'cyan',
    crise: 'slate',
    mitterrand: 'rose',
    cohabitations: 'slate',
    sarkozy: 'slate',
    hollande: 'slate',
    macron_i: 'slate',
    macron_ii: 'slate',
    present: 'amber'
  };

  function handleChoose(choice: Choice) {
    rebirth.choose(choice);
  }

  function handleContinue() {
    rebirth.continueAfterConsequence();
  }
</script>

{#if state && state.phase === 'ended' && ending}
  <EndingReport {ending} {onReplay} />
{:else if state && era}
  {@const s = state}
  {@const e = era}
  <div class="grid lg:grid-cols-[280px_1fr] gap-4">
    <!-- Sidebar : ère, ressources, acteurs, identité -->
    <aside class="space-y-4">
      <section class="bordered-card p-4 space-y-2">
        <div class="text-xs uppercase tracking-wider text-parchment-dim/60">
          Tour {s.turn} / 100
        </div>
        <h3 class="font-display text-amber-400 text-lg">{e.name}</h3>
        <div class="text-xs italic text-parchment-dim/70">{e.period}</div>
        <p class="text-xs text-parchment-dim/80 leading-snug pt-1 border-t border-line/50">
          {e.blurb}
        </p>
      </section>

      <ObjectivePanel objectives={s.objectives} progress={s.objectiveProgress} turn={s.turn} />

      <OrganizationPanel organization={s.organization} turn={s.turn} />

      <StrategyPanel
        turn={s.turn}
        camp={s.camp}
        organization={s.organization}
        activeStrategies={s.activeStrategies}
      />

      <WorldStrategyPanel worldAI={s.worldAI} />

      <PipelinePanel pipelines={s.activePipelines} />

      <section class="bordered-card p-4 space-y-3">
        <div class="text-xs uppercase tracking-wider text-parchment-dim/60">
          Ressources
        </div>
        {#each ALL_RESOURCES as r}
          <ResourceGauge resource={r} value={s.resources[r]} hue={hueByEra[e.id]} />
        {/each}
      </section>

      <section class="bordered-card p-4 space-y-2">
        <div class="text-xs uppercase tracking-wider text-parchment-dim/60">
          Acteurs
        </div>
        {#each ACTOR_IDS as id}
          <ActorPanel actorId={id} actor={s.actors[id]} />
        {/each}
      </section>

      <section class="bordered-card p-4 space-y-1">
        <div class="text-xs uppercase tracking-wider text-parchment-dim/60">
          {s.name}
        </div>
        <div class="text-sm">
          <span class="text-parchment-dim/70">Trait dominant —</span>
          <span class="text-amber-400 font-display ml-1">
            {TRAIT_LABELS[s.dominantTrait]}
          </span>
        </div>
        <div class="text-xs text-parchment-dim/60">
          {s.camp === 'patron' ? 'Côté patronal' : 'Côté salarié'} ·
          mode {s.mode === 'reflechi' ? 'Réfléchi' : 'Compulsif'}
        </div>
      </section>
    </aside>

    <!-- Main column : scène ou conséquence -->
    <main class="space-y-4">
      {#if s.phase === 'scene' && scenario}
        <SceneCard
          {scenario}
          mode={s.mode}
          dominantTrait={s.dominantTrait}
          onChoose={handleChoose}
        />
      {:else if s.phase === 'consequence' && consequence}
        <ConsequenceScene
          {consequence}
          alerts={rebirth.alerts}
          onContinue={handleContinue}
        />
      {:else}
        <div class="bordered-card p-5 italic text-parchment-dim text-center">
          (Aucune scène — vérifie que des scénarios sont activés.)
        </div>
      {/if}

      {#if rebirth.log.length > 0}
        <details class="bordered-card p-3 text-xs">
          <summary class="cursor-pointer text-parchment-dim/70 uppercase tracking-wider">
            Journal · {rebirth.log.length}
          </summary>
          <ul class="mt-2 space-y-1 max-h-40 overflow-y-auto text-parchment-dim/80">
            {#each reversedLog as line}
              <li class="border-b border-line/40 pb-1 last:border-0">{line}</li>
            {/each}
          </ul>
        </details>
      {/if}
    </main>
  </div>
{:else}
  <div class="bordered-card p-5 italic text-parchment-dim text-center">
    (État du jeu non initialisé.)
  </div>
{/if}
