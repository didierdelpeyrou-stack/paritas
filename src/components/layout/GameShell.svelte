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

  type Tab = 'mandat' | 'organisation' | 'monde';

  let activeTab = $state<Tab>('mandat');

  const gameState = $derived(rebirth.state);
  const scenario = $derived(rebirth.currentScenario);
  const consequence = $derived(rebirth.consequence);
  const ending = $derived(rebirth.ending);
  const era = $derived(gameState ? eraForTurn(gameState.turn) : null);
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

{#if gameState && gameState.phase === 'ended' && ending}
  <EndingReport {ending} {onReplay} />
{:else if gameState && era}
  {@const s = gameState}
  {@const e = era}
  <div class="grid lg:grid-cols-[300px_1fr] gap-4">
    <!-- Sidebar : 3 onglets repliables + identité fixe -->
    <aside class="space-y-3 order-2 lg:order-1">
      <!-- Bandeau ère, toujours visible -->
      <section class="bordered-card p-4 space-y-1.5">
        <div class="flex items-baseline justify-between">
          <span class="text-xs uppercase tracking-wider text-parchment-dim/80">
            Tour {s.turn} / 100
          </span>
          <span class="text-xs italic text-parchment-dim/80">{e.period}</span>
        </div>
        <h3 class="font-display text-gold text-lg leading-tight">{e.name}</h3>
      </section>

      <!-- Onglets -->
      <div class="tab-bar" role="tablist" aria-label="Sections de la sidebar">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'mandat'}
          data-active={activeTab === 'mandat'}
          onclick={() => (activeTab = 'mandat')}
        >Mandat</button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'organisation'}
          data-active={activeTab === 'organisation'}
          onclick={() => (activeTab = 'organisation')}
        >Organisation</button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'monde'}
          data-active={activeTab === 'monde'}
          onclick={() => (activeTab = 'monde')}
        >Monde</button>
      </div>

      <div class="space-y-3">
        {#if activeTab === 'mandat'}
          <ObjectivePanel objectives={s.objectives} progress={s.objectiveProgress} turn={s.turn} />

          <section class="bordered-card p-4 space-y-3">
            <div class="text-xs uppercase tracking-wider text-parchment-dim/80">
              Ressources
            </div>
            {#each ALL_RESOURCES as r}
              <ResourceGauge resource={r} value={s.resources[r]} hue={hueByEra[e.id]} />
            {/each}
          </section>

          <section class="bordered-card p-4 space-y-2">
            <div class="text-xs uppercase tracking-wider text-parchment-dim/80">
              Acteurs
            </div>
            {#each ACTOR_IDS as id}
              <ActorPanel actorId={id} actor={s.actors[id]} />
            {/each}
          </section>
        {:else if activeTab === 'organisation'}
          <OrganizationPanel organization={s.organization} turn={s.turn} />

          <StrategyPanel
            turn={s.turn}
            camp={s.camp}
            organization={s.organization}
            activeStrategies={s.activeStrategies}
          />
        {:else}
          <WorldStrategyPanel worldAI={s.worldAI} />

          <PipelinePanel pipelines={s.activePipelines} />
        {/if}
      </div>

      <!-- Identité, toujours en pied -->
      <section class="bordered-card p-3 space-y-1">
        <div class="text-xs uppercase tracking-wider text-parchment-dim/80">
          {s.name}
        </div>
        <div class="text-sm">
          <span class="text-parchment-dim/85">Trait dominant —</span>
          <span class="text-gold font-display ml-1">
            {TRAIT_LABELS[s.dominantTrait]}
          </span>
        </div>
        <div class="text-xs text-parchment-dim/80">
          {s.camp === 'patron' ? 'Côté patronal' : 'Côté salarié'} ·
          mode {s.mode === 'reflechi' ? 'Réfléchi' : 'Compulsif'}
        </div>
      </section>
    </aside>

    <!-- Main column : scène ou conséquence (passe en premier sur mobile) -->
    <main class="space-y-4 order-1 lg:order-2">
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
          <summary class="cursor-pointer text-parchment-dim/85 uppercase tracking-wider">
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

<style>
  .tab-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    border: 1px solid rgba(237, 228, 201, 0.16);
    border-radius: 0.6rem;
    background: rgba(13, 16, 20, 0.32);
    overflow: hidden;
  }

  .tab-bar button {
    border: 0;
    background: transparent;
    color: rgba(237, 228, 201, 0.6);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.62rem 0.45rem;
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease;
    min-height: 44px;
  }

  .tab-bar button:hover {
    color: #ede4c9;
    background: rgba(201, 154, 64, 0.06);
  }

  .tab-bar button[data-active='true'] {
    color: #f4d58b;
    background: rgba(201, 154, 64, 0.14);
    box-shadow: inset 0 -2px 0 0 #c89b3c;
  }

  .tab-bar button + button {
    border-left: 1px solid rgba(237, 228, 201, 0.08);
  }
</style>
