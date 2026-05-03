<script lang="ts">
  /* ============================================================
     MiniGameFuelHeader — strip de carburant pour mini-jeu
     ============================================================
     Affiche les 3 ressources qui alimentent ce mini-jeu, avec :
     - leur valeur courante (0-100)
     - une jauge visuelle
     - le rôle qu'elles jouent (« mobilisation des militants »)
     - un score composite « fuel score » global

     À insérer en tête de chaque mini-jeu (Manif, Meeting,
     Trésorerie, Talents) pour rendre tactile le lien entre
     les ressources du top header et l'action en cours.

     Autodétermination (Deci & Ryan) : compétence (« je vois
     avec quoi je joue »), autonomie (« je peux préparer mes
     stats avant d'engager »).
     ============================================================ */
  import { rebirth } from '../../game/engine/gameState.svelte';
  import {
    fuelsFor, abilityFuelScore, fuelScoreLabel,
    type AbilityId
  } from '../../game/simulation/resourceUtility';
  import { RESOURCE_LABELS } from '../../game/simulation/resources';
  import type { ResourceKey } from '../../game/types';

  interface Props {
    ability: AbilityId;
    /** Titre humain pour la phrase d'introduction (« Carburant pour ta manif »). */
    title?: string;
  }
  let { ability, title }: Props = $props();

  const resources = $derived(rebirth.state?.resources);
  const entries = $derived(fuelsFor(ability, 3));
  const score = $derived(resources ? abilityFuelScore(ability, resources) : 0);
  const scoreLabel = $derived(fuelScoreLabel(score));
  const scoreClass = $derived(
    score >= 75 ? 'excellent' :
    score >= 55 ? 'solid' :
    score >= 35 ? 'limited' :
    score >= 18 ? 'fragile' : 'empty'
  );

  function colorForResource(r: ResourceKey): string {
    const map: Record<string, string> = {
      caisse:          '#C9B26A',
      confiance:       '#5BA3C8',
      santeSociale:    '#3A6B47',
      legitimite:      '#9B5BC8',
      rapportDeForce:  '#D9821C',
      cohesionInterne: '#E08F92',
      institution:     '#B09150'
    };
    return map[r] ?? '#C9B26A';
  }
</script>

{#if resources}
  <div class="fuel-header" class:crit={score < 18}>
    <div class="fuel-intro">
      <span class="fuel-label">Carburant{title ? ` pour ${title}` : ''}</span>
      <span class="fuel-score" data-status={scoreClass}>
        <span class="score-num">{score}</span>
        <span class="score-tag">/100 · {scoreLabel}</span>
      </span>
    </div>

    <div class="fuel-list">
      {#each entries as e (e.resource)}
        {@const v = (resources as any)[e.resource] ?? 0}
        {@const pct = Math.max(0, Math.min(100, v))}
        {@const c = colorForResource(e.resource)}
        <div class="fuel-row" style:--c={c}>
          <div class="fuel-row-head">
            <span class="weight" data-weight={e.weight} title={
              e.weight === 3 ? 'Critique pour cette action'
              : e.weight === 2 ? 'Important'
              : 'Secondaire'
            }>
              {e.weight === 3 ? '●●●' : e.weight === 2 ? '●●' : '●'}
            </span>
            <span class="res-name">{RESOURCE_LABELS[e.resource]}</span>
            <span class="res-val">{Math.round(v)}<small>/100</small></span>
          </div>
          <div class="fuel-bar">
            <i style:width="{pct}%"></i>
          </div>
          <span class="impact">{e.impact}</span>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .fuel-header {
    background:
      linear-gradient(180deg,
        rgba(58, 38, 21, 0.55) 0%,
        rgba(42, 26, 14, 0.4) 100%);
    border: 1px solid rgba(201, 178, 106, 0.32);
    border-left: 3px solid #C9B26A;
    border-radius: 0.45rem;
    padding: 0.6rem 0.85rem 0.7rem;
    color: #F4EFE2;
    margin-bottom: 0.85rem;
  }

  .fuel-header.crit {
    border-left-color: #B0181E;
    background:
      linear-gradient(180deg,
        rgba(176, 24, 30, 0.18) 0%,
        rgba(42, 14, 14, 0.4) 100%);
  }

  .fuel-intro {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.6rem;
    margin-bottom: 0.55rem;
    flex-wrap: wrap;
  }

  .fuel-label {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(244, 213, 140, 0.85);
  }

  .fuel-score {
    display: inline-flex;
    align-items: baseline;
    gap: 0.2rem;
    padding: 0.1rem 0.55rem;
    border-radius: 999px;
    font-family: 'Courier Prime', monospace;
  }
  .fuel-score[data-status='excellent'] {
    background: rgba(58, 107, 71, 0.22);
    border: 1px solid rgba(58, 107, 71, 0.55);
    color: #7BCBA1;
  }
  .fuel-score[data-status='solid'] {
    background: rgba(91, 163, 200, 0.18);
    border: 1px solid rgba(91, 163, 200, 0.5);
    color: #9CC8DD;
  }
  .fuel-score[data-status='limited'] {
    background: rgba(201, 178, 106, 0.16);
    border: 1px solid rgba(201, 178, 106, 0.45);
    color: #E0C97A;
  }
  .fuel-score[data-status='fragile'] {
    background: rgba(217, 130, 28, 0.18);
    border: 1px solid rgba(217, 130, 28, 0.5);
    color: #F0B870;
  }
  .fuel-score[data-status='empty'] {
    background: rgba(176, 24, 30, 0.22);
    border: 1px solid rgba(176, 24, 30, 0.6);
    color: #E08F92;
    animation: empty-pulse 1.6s ease-in-out infinite;
  }
  @keyframes empty-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(176, 24, 30, 0); }
    50%      { box-shadow: 0 0 0 4px rgba(176, 24, 30, 0.18); }
  }
  .score-num {
    font-size: 0.95rem;
    font-weight: 700;
  }
  .score-tag {
    font-size: 0.65rem;
    opacity: 0.75;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .fuel-list {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .fuel-row {
    display: flex;
    flex-direction: column;
    gap: 0.18rem;
  }

  .fuel-row-head {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: baseline;
    gap: 0.45rem;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.78rem;
  }

  .weight {
    color: var(--c, #C9B26A);
    font-family: 'Courier Prime', monospace;
    font-size: 0.62rem;
    letter-spacing: -0.05em;
    cursor: help;
    line-height: 1;
  }

  .res-name {
    color: var(--c, #C9B26A);
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .res-val {
    font-family: 'Courier Prime', monospace;
    color: rgba(244, 239, 226, 0.85);
    font-size: 0.78rem;
    font-weight: 700;
  }
  .res-val small {
    font-size: 0.62rem;
    color: rgba(244, 239, 226, 0.5);
  }

  .fuel-bar {
    height: 4px;
    background: rgba(201, 178, 106, 0.12);
    border-radius: 2px;
    overflow: hidden;
  }

  .fuel-bar i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, var(--c) 0%, color-mix(in srgb, var(--c) 70%, #fff) 100%);
    transition: width 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
    box-shadow: 0 0 6px color-mix(in srgb, var(--c) 50%, transparent);
  }

  .impact {
    font-style: italic;
    font-size: 0.72rem;
    color: rgba(244, 239, 226, 0.65);
    line-height: 1.25;
  }

  @media (max-width: 600px) {
    .fuel-header { padding: 0.5rem 0.65rem 0.6rem; }
    .fuel-row-head { grid-template-columns: auto 1fr auto; gap: 0.35rem; }
    .res-name { font-size: 0.74rem; }
    .impact { font-size: 0.68rem; }
  }
</style>
