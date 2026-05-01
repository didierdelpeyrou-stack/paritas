<script lang="ts">
  import type { ActivePipeline } from '../../game/narrative/pipelineTypes';

  interface Props {
    pipelines: ActivePipeline[];
  }

  let { pipelines }: Props = $props();
</script>

{#if pipelines.length > 0}
  <section class="bordered-card p-4 space-y-3">
    <div>
      <div class="text-xs uppercase tracking-wider text-parchment-dim/60">Traces narratives</div>
      <h3 class="font-display text-amber-400 text-base">Ce que l’histoire retient</h3>
    </div>

    <div class="space-y-2">
      {#each pipelines.slice(0, 4) as pipeline}
        <div class="pipeline-row">
          <div class="flex items-start justify-between gap-2">
            <div>
              <b>{pipeline.label}</b>
              <small>étape {pipeline.stage + 1} · dernière secousse T{pipeline.lastTurn}</small>
            </div>
            <em>{Math.round(pipeline.pressure)}</em>
          </div>
          <div class="pipeline-track">
            <i style="width: {Math.max(4, Math.min(100, pipeline.pressure))}%"></i>
          </div>
        </div>
      {/each}
    </div>
  </section>
{/if}

<style>
  .pipeline-row {
    border: 1px solid rgba(201, 154, 64, 0.2);
    border-radius: 0.55rem;
    background: rgba(201, 154, 64, 0.06);
    padding: 0.55rem 0.65rem;
  }

  .pipeline-row b {
    display: block;
    color: #ede4c9;
    font-size: 0.78rem;
    line-height: 1.2;
  }

  .pipeline-row small {
    display: block;
    margin-top: 0.12rem;
    color: rgba(237, 228, 201, 0.58);
    font-size: 0.66rem;
  }

  .pipeline-row em {
    color: #f4d58b;
    font-style: normal;
    font-family: 'Cinzel', Georgia, serif;
  }

  .pipeline-track {
    height: 0.3rem;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.55);
    margin-top: 0.45rem;
  }

  .pipeline-track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #c89b3c, #7eb4ff);
    transition: width 0.3s ease;
  }
</style>
