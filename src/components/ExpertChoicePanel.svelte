<script lang="ts">
  import { analyzeChoiceExpert } from '$lib/game/gameTheory';
  import type { Camp, Choice, GameEvent, GameState } from '$lib/types';

  interface Props {
    choice: Choice;
    event: GameEvent;
    gameState: GameState;
    camp: Camp;
    compact?: boolean;
  }

  let { choice, event, gameState, camp, compact = false }: Props = $props();
  let insight = $derived(analyzeChoiceExpert(choice, gameState, camp, event));
</script>

<div class:expert-panel={!compact} class:expert-panel-compact={compact}>
  <div class="expert-grid">
    <div>
      <span>Jeux</span>
      <strong>{insight.model.label}</strong>
      <p>{insight.model.detail}</p>
    </div>
    <div>
      <span>Harvard</span>
      <strong>{insight.harvard.mesore}</strong>
      <p>{insight.harvard.interests}</p>
    </div>
    <div>
      <span>Psycho</span>
      <strong>{insight.behavioral.label}</strong>
      <p>{insight.behavioral.detail}</p>
    </div>
    <div>
      <span>Agence</span>
      <strong>{insight.agency.risk}</strong>
      <p>{insight.agency.detail}</p>
    </div>
  </div>

  <div class="expert-mentor">
    <span>{insight.mentor.name}</span>
    <p>{insight.mentor.signature}</p>
    <small>{insight.skills.improves}</small>
  </div>
</div>

<style>
  .expert-panel,
  .expert-panel-compact {
    margin-top: 0.75rem;
    padding: 0.7rem;
    border-radius: 0.65rem;
    border: 1px solid rgba(68, 64, 60, 0.22);
    background: rgba(255, 251, 235, 0.54);
  }

  .expert-panel-compact {
    border-color: rgba(245, 158, 11, 0.24);
    background: rgba(15, 23, 42, 0.28);
  }

  .expert-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem;
  }

  .expert-grid div {
    min-width: 0;
  }

  .expert-grid span,
  .expert-mentor span {
    display: block;
    color: #92400e;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.62rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .expert-panel-compact .expert-grid span,
  .expert-panel-compact .expert-mentor span {
    color: #fbbf24;
  }

  .expert-grid strong {
    display: block;
    margin-top: 0.08rem;
    color: #1c1917;
    font-size: 0.75rem;
    line-height: 1.15;
  }

  .expert-panel-compact .expert-grid strong {
    color: #fde68a;
  }

  .expert-grid p,
  .expert-mentor p,
  .expert-mentor small {
    display: block;
    margin-top: 0.16rem;
    color: rgba(41, 37, 36, 0.72);
    font-size: 0.72rem;
    line-height: 1.25;
  }

  .expert-panel-compact .expert-grid p,
  .expert-panel-compact .expert-mentor p,
  .expert-panel-compact .expert-mentor small {
    color: rgba(237, 228, 201, 0.72);
  }

  .expert-mentor {
    margin-top: 0.55rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(68, 64, 60, 0.18);
  }

  .expert-panel-compact .expert-mentor {
    border-top-color: rgba(245, 158, 11, 0.18);
  }

  @media (max-width: 520px) {
    .expert-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
