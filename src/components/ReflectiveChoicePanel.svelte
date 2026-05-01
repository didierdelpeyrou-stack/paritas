<script lang="ts">
  import { analyzeChoiceExpert } from '$lib/game/gameTheory';
  import type { Camp, Choice, GameEvent, GameState, StatKey } from '$lib/types';

  interface Props {
    choice: Choice;
    event: GameEvent;
    gameState: GameState;
    camp: Camp;
    compact?: boolean;
  }

  let { choice, event, gameState, camp, compact = false }: Props = $props();
  let insight = $derived(analyzeChoiceExpert(choice, gameState, camp, event));
  let effects = $derived(effectNarrative(choice.effects));

  function effectNarrative(eff: Partial<Record<StatKey, number>>) {
    const entries = Object.entries(eff)
      .filter(([, value]) => value !== undefined && value !== 0)
      .map(([key, value]) => ({ key, value: value ?? 0, meta: statMeta(key) }));

    const strongest = entries.slice().sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0];
    return {
      entries,
      lead: strongest
        ? strongest.value > 0
          ? `${strongest.meta.label} se renforce : ce choix produit une capacité collective nouvelle.`
          : `${strongest.meta.label} se fragilise : le coût social de la décision devient visible.`
        : 'Ce choix agit surtout sur la trajectoire narrative.'
    };
  }

  function statMeta(key: string) {
    const meta: Record<string, { icon: string; label: string; family: string }> = {
      prestige: { icon: '🏆', label: 'Prestige', family: 'Légitimité' },
      caisse: { icon: '💰', label: 'Caisse', family: 'Puissance' },
      soutien: { icon: '❤️', label: 'Soutien', family: 'Légitimité' },
      influence: { icon: '🏛', label: 'Influence', family: 'Puissance' },
      sante: { icon: '💪', label: 'Santé collective', family: 'Durabilité' },
      economique: { icon: '💼', label: 'Capital économique', family: 'Puissance' },
      social: { icon: '🤝', label: 'Capital social', family: 'Légitimité' },
      militant: { icon: '🚩', label: 'Capital militant', family: 'Puissance' },
      institutionnel: { icon: '⚙️', label: 'Capital institutionnel', family: 'Durabilité' },
      symbolique: { icon: '📜', label: 'Capital symbolique', family: 'Légitimité' },
      negociation: { icon: '⚖️', label: 'Négociation', family: 'Compétence' },
      politique: { icon: '♟️', label: 'Politique', family: 'Compétence' },
      baratin: { icon: '🗣️', label: 'Tribune', family: 'Compétence' },
      production: { icon: '📈', label: 'Production', family: 'Compétence' },
      mobilisation: { icon: '✊', label: 'Mobilisation', family: 'Compétence' },
      expertise: { icon: '📚', label: 'Expertise', family: 'Compétence' }
    };
    return meta[key] ?? { icon: '◆', label: key, family: 'Effet' };
  }
</script>

<div class:reflective-panel={!compact} class:reflective-panel-compact={compact}>
  <div class="mentor-watermark" aria-hidden="true">{insight.mentor.name}</div>
  <div class="reflective-head">
    <div class="scene-mark">{choice.icon ?? '◆'}</div>
    <div>
      <span>Lecture réfléchie</span>
      <p>{effects.lead}</p>
    </div>
  </div>

  <div class="effect-strip" aria-label="Effets socio-historiques">
    {#each effects.entries.slice(0, 5) as item}
      <div class:gain={item.value > 0} class:loss={item.value < 0}>
        <b>{item.meta.icon}</b>
        <span>{item.meta.label}</span>
        <strong>{item.value > 0 ? '+' : ''}{item.value}</strong>
        <small>{item.meta.family}</small>
      </div>
    {/each}
  </div>

  <div class="theory-note">
    <div>
      <span>Induction</span>
      <p>{insight.harvard.interests}</p>
    </div>
    <div>
      <span>Rappel théorique</span>
      <p>{insight.model.label} · {insight.behavioral.label} · {insight.agency.risk}</p>
    </div>
  </div>

  {#if choice.explanation || choice.longterm}
    <div class="socio-story">
      <span>Effet socio-historique</span>
      <p>{choice.explanation ?? choice.longterm}</p>
      {#if choice.longterm}
        <small>{choice.longterm}</small>
      {/if}
    </div>
  {/if}
</div>

<style>
  .reflective-panel,
  .reflective-panel-compact {
    position: relative;
    margin-top: 0.75rem;
    padding: 0.78rem;
    border-radius: 0.7rem;
    border: 1px solid rgba(120, 113, 108, 0.26);
    background:
      linear-gradient(135deg, rgba(255, 251, 235, 0.84), rgba(236, 253, 245, 0.56));
  }

  .mentor-watermark {
    position: absolute;
    right: 0.7rem;
    top: 0.45rem;
    max-width: 62%;
    color: rgba(146, 64, 14, 0.08);
    font-family: 'Cinzel', Georgia, serif;
    font-size: clamp(1.25rem, 4vw, 2.2rem);
    font-weight: 900;
    line-height: 1;
    text-align: right;
    text-transform: uppercase;
    pointer-events: none;
    z-index: 0;
  }

  .reflective-panel-compact .mentor-watermark {
    color: rgba(251, 191, 36, 0.08);
  }

  .reflective-head,
  .effect-strip,
  .theory-note,
  .socio-story {
    position: relative;
    z-index: 1;
  }

  .reflective-panel-compact {
    border-color: rgba(245, 158, 11, 0.24);
    background:
      linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(20, 83, 45, 0.16));
  }

  .reflective-head {
    display: grid;
    grid-template-columns: 2.2rem 1fr;
    gap: 0.6rem;
    align-items: start;
  }

  .scene-mark {
    width: 2.1rem;
    height: 2.1rem;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: rgba(180, 83, 9, 0.12);
    border: 1px solid rgba(146, 64, 14, 0.22);
    font-size: 1.15rem;
  }

  span {
    display: block;
    color: #92400e;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .reflective-panel-compact span {
    color: #fbbf24;
  }

  p,
  small {
    display: block;
    margin-top: 0.18rem;
    color: rgba(41, 37, 36, 0.78);
    font-size: 0.74rem;
    line-height: 1.3;
  }

  .reflective-panel-compact p,
  .reflective-panel-compact small {
    color: rgba(237, 228, 201, 0.76);
  }

  .effect-strip {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
    margin-top: 0.65rem;
  }

  .effect-strip div {
    min-width: 0;
    display: grid;
    grid-template-columns: auto 1fr auto;
    column-gap: 0.35rem;
    row-gap: 0.08rem;
    align-items: center;
    padding: 0.42rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(120, 113, 108, 0.18);
    background: rgba(255, 255, 255, 0.36);
  }

  .reflective-panel-compact .effect-strip div {
    background: rgba(2, 6, 23, 0.24);
  }

  .effect-strip div.gain strong {
    color: #047857;
  }

  .effect-strip div.loss strong {
    color: #be123c;
  }

  .effect-strip b {
    font-size: 0.9rem;
  }

  .effect-strip div > span {
    color: inherit;
    font-family: inherit;
    font-size: 0.72rem;
    letter-spacing: 0;
    text-transform: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .effect-strip strong {
    font-size: 0.78rem;
  }

  .effect-strip small {
    grid-column: 2 / 4;
    margin: 0;
    font-size: 0.72rem;
    opacity: 0.78;
  }

  .theory-note {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.55rem;
    margin-top: 0.65rem;
  }

  .socio-story {
    margin-top: 0.65rem;
    padding-top: 0.55rem;
    border-top: 1px solid rgba(120, 113, 108, 0.2);
  }

  .reflective-panel-compact .socio-story {
    border-top-color: rgba(245, 158, 11, 0.18);
  }

  @media (max-width: 520px) {
    .effect-strip,
    .theory-note {
      grid-template-columns: 1fr;
    }
  }
</style>
