<script lang="ts">
  /* ============================================================
     TheatreActionsPanel — colonne gauche permanente : ACTIONS
     ============================================================
     Brief UX expert : « tous les boutons d'action sont à gauche.
     Aucun bouton d'action principal ailleurs. » Réponse — colonne
     verticale 220px qui contient :
       - Compteur d'actions ce tour (X/Y) + indicateur de crise
       - 8 boutons d'actions rapides empilés verticalement, chacun
         avec icône + nom + coût + énergie + état (recommandé /
         disponible / dangereux / verrouillé)
       - « Toutes les actions » en bas → drawer complet
     Remplace le CockpitDashboardBar et le bouton flottant ⚙
     en mode Théâtre.
     ============================================================ */
  import { ACTIONS } from '$lib/orchestrator/actions';
  import type { ActionDef } from '$lib/orchestrator/types';
  import { orchestrator } from '$lib/stores/orchestrator.svelte';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import { fuelsFor, abilityFuelScore, type AbilityId } from '../../game/simulation/resourceUtility';
  import { RESOURCE_LABELS } from '../../game/simulation/resources';
  import CockpitIcon from './CockpitIcon.svelte';

  interface Props {
    onOpenFullActions?: () => void;
  }
  let { onOpenFullActions }: Props = $props();

  /* 8 actions rapides — les emblématiques d'une lutte. */
  const QUICK_ACTION_IDS = [
    'tracts', 'meeting', 'manifestation', 'petition',
    'delegation', 'presse', 'tresorerie', 'table'
  ];

  const quickActions = $derived(
    QUICK_ACTION_IDS
      .map(id => ACTIONS.find(a => a.id === id))
      .filter((a): a is ActionDef => a !== undefined)
  );

  const isCrisis = $derived(orchestrator.isCrisis);

  /* Labels courts pour ne pas tronquer en colonne 220px. */
  const SHORT_LABEL: Record<string, string> = {
    tracts: 'Tracts',
    meeting: 'Meeting',
    manifestation: 'Manif.',
    petition: 'Pétition',
    delegation: 'Délégation',
    presse: 'Presse',
    tresorerie: 'Budget',
    table: 'Table'
  };

  function shortLabel(a: ActionDef): string {
    return SHORT_LABEL[a.id] ?? a.label.split(' ').slice(0, 2).join(' ');
  }

  function fire(action: ActionDef) {
    const exec = orchestrator.canExec(action);
    if (!exec.ok) return;
    orchestrator.dispatch(action);
  }

  /* État sémantique du bouton — lecture rapide. */
  function actionState(action: ActionDef): 'recommande' | 'disponible' | 'dangereux' | 'verrouille' {
    const exec = orchestrator.canExec(action);
    if (!exec.ok) return 'verrouille';
    /* Énergie élevée → recommandé ; basse → dangereux. */
    const fs = rebirth.state ? abilityFuelScore(action.id as AbilityId, rebirth.state.resources) : 50;
    if (fs >= 65) return 'recommande';
    if (fs < 30) return 'dangereux';
    return 'disponible';
  }

  function tooltipFor(action: ActionDef): string {
    /* FALC : phrases courtes, sans abréviation. */
    const exec = orchestrator.canExec(action);
    if (!exec.ok) return `${action.label}\n${exec.reason ?? 'Action indisponible.'}`;
    const fs = rebirth.state ? abilityFuelScore(action.id as AbilityId, rebirth.state.resources) : 50;
    const fuels = fuelsFor(action.id as AbilityId, 2)
      .map(f => RESOURCE_LABELS[f.resource]).join(' et ');
    const c = action.cost.caisse ?? 0;
    const m = action.cost.mandat ?? 0;
    let cost = '';
    if (c && m) cost = `Coût : ${c} francs et ${m} mandat${m > 1 ? 's' : ''}`;
    else if (c) cost = `Coût : ${c} francs`;
    else if (m) cost = `Coût : ${m} mandat${m > 1 ? 's' : ''}`;
    else cost = 'Action gratuite';
    const energie = `Énergie : ${fs} sur 100`;
    const boost = fuels ? `\nBoosté par : ${fuels}` : '';
    return `${action.label}\n${cost}\n${energie}${boost}`;
  }
</script>

<aside class="theatre-actions-panel" aria-label="Actions disponibles">

  <!-- En-tête : compteur d'actions + crise -->
  <header class="actions-head" class:crisis={isCrisis}>
    {#if isCrisis}
      <span class="crisis-badge" title="Crise systémique : 3+ ressources critiques">
        <CockpitIcon name="alerte" size={12} /> Crise
      </span>
    {/if}
    <div class="counter">
      <span class="counter-num">{orchestrator.state.actionsThisTurn}</span>
      <span class="counter-sep">/</span>
      <span class="counter-max">{orchestrator.state.maxActionsPerTurn}</span>
      <span class="counter-tag">actions ce tour</span>
    </div>
    <div class="counter-bar">
      <i style:width="{(orchestrator.state.actionsThisTurn / orchestrator.state.maxActionsPerTurn) * 100}%"></i>
    </div>
  </header>

  <!-- 8 actions rapides empilées -->
  <div class="actions-list">
    {#each quickActions as a (a.id)}
      {@const exec = orchestrator.canExec(a)}
      {@const state = actionState(a)}
      <button
        type="button"
        class="action-btn"
        data-state={state}
        disabled={!exec.ok}
        style:--accent={a.accent}
        onclick={() => fire(a)}
        title={tooltipFor(a)}
      >
        <span class="btn-icon" style:color={a.accent}>
          <CockpitIcon name={a.icon} size={16} />
        </span>
        <span class="btn-body">
          <span class="btn-label">{shortLabel(a)}</span>
          <span class="btn-meta">
            {#if a.cost.caisse}
              <span class="btn-cost">{a.cost.caisse}F</span>
            {/if}
            {#if state === 'recommande'}
              <span class="btn-tag rec" title="Énergie élevée — recommandé">▲</span>
            {:else if state === 'dangereux'}
              <span class="btn-tag dang" title="Énergie basse — risqué">▼</span>
            {/if}
          </span>
        </span>
      </button>
    {/each}
  </div>

  <!-- Bouton drawer complet en bas -->
  <button type="button" class="full-actions-btn"
    onclick={() => onOpenFullActions?.()}
    title="Ouvrir le tableau complet (17 actions)"
  >
    <CockpitIcon name="rouage" size={14} />
    <span>Toutes les actions</span>
  </button>
</aside>

<style>
  .theatre-actions-panel {
    width: 220px;
    flex-shrink: 0;
    padding: 0.75rem 0.6rem 0.75rem;
    /* Continuum visuel avec le sky : même base sombre, voile doré
       latéral pour suggérer la profondeur sans border franche. */
    background:
      linear-gradient(90deg, transparent 0%, rgba(244, 213, 140, 0.025) 100%),
      linear-gradient(180deg, #1F1813 0%, #110D0A 100%);
    /* Seam doré gradiant, prend l'accent de l'époque courante. */
    box-shadow: inset -1px 0 0 0 var(--epoque-glow, rgba(201, 178, 106, 0.18));
    color: #F4EFE2;
    font-family: 'Source Serif 4', Georgia, serif;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(201, 178, 106, 0.25) transparent;
  }

  /* === Header compteur + crise === */
  .actions-head {
    padding: 0.5rem 0.55rem;
    background: rgba(13, 11, 8, 0.45);
    border: 1px solid rgba(201, 178, 106, 0.25);
    border-radius: 0.4rem;
    transition: border-color 0.3s ease;
  }
  .actions-head.crisis {
    border-color: rgba(176, 24, 30, 0.6);
    box-shadow: 0 0 0 0 rgba(176, 24, 30, 0.3);
    animation: crisis-glow 1.8s ease-in-out infinite;
  }
  @keyframes crisis-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(176, 24, 30, 0.0); }
    50%      { box-shadow: 0 0 0 4px rgba(176, 24, 30, 0.18); }
  }

  .crisis-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.05rem 0.4rem;
    background: rgba(176, 24, 30, 0.18);
    border: 1px solid rgba(176, 24, 30, 0.5);
    border-radius: 999px;
    color: #E08F92;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.55rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.3rem;
  }

  .counter {
    display: flex;
    align-items: baseline;
    gap: 0.2rem;
    color: #F4D58C;
    font-family: 'Cinzel', Georgia, serif;
  }
  .counter-num {
    font-family: 'Courier Prime', monospace;
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1;
  }
  .counter-sep {
    color: rgba(244, 213, 140, 0.45);
    font-size: 0.95rem;
  }
  .counter-max {
    font-family: 'Courier Prime', monospace;
    font-size: 0.95rem;
    color: rgba(244, 213, 140, 0.65);
  }
  .counter-tag {
    margin-left: auto;
    font-size: 0.55rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(244, 239, 226, 0.55);
  }

  .counter-bar {
    height: 2px;
    background: rgba(201, 178, 106, 0.18);
    border-radius: 1px;
    overflow: hidden;
    margin-top: 0.35rem;
  }
  .counter-bar i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #C9B26A, #F4D58C);
    transition: width 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
  }

  /* === Liste actions === */
  .actions-list {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .action-btn {
    --accent: #C9B26A;
    display: grid;
    grid-template-columns: 1.6rem 1fr;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.6rem;
    background: linear-gradient(180deg, rgba(58, 38, 21, 0.6) 0%, rgba(42, 26, 14, 0.6) 100%);
    border: 1px solid rgba(140, 110, 64, 0.35);
    border-left: 3px solid var(--accent);
    border-radius: 0.4rem;
    color: rgba(244, 239, 226, 0.92);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    text-align: left;
    cursor: pointer;
    transition: transform 0.22s cubic-bezier(0.34, 1.36, 0.64, 1),
                background 0.22s ease,
                border-color 0.22s ease,
                box-shadow 0.22s ease;
    will-change: transform;
  }

  .action-btn:hover:not(:disabled) {
    transform: translateX(3px);
    background: linear-gradient(180deg, rgba(82, 52, 30, 0.78) 0%, rgba(64, 42, 24, 0.72) 100%);
    color: #F4D58C;
    border-color: rgba(201, 178, 106, 0.55);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(244, 213, 140, 0.08);
  }

  .action-btn:active:not(:disabled) {
    transform: translateX(1px) scale(0.98);
    transition-duration: 0.08s;
  }

  .action-btn:focus-visible {
    outline: 2px solid #F4D58C;
    outline-offset: 2px;
  }

  .action-btn:disabled,
  .action-btn[data-state='verrouille'] {
    opacity: 0.4;
    cursor: not-allowed;
    filter: grayscale(0.55);
  }

  .action-btn[data-state='recommande'] {
    border-color: rgba(58, 107, 71, 0.55);
    border-left-color: #7BCBA1;
    box-shadow: 0 0 0 1px rgba(123, 203, 161, 0.12),
                inset 0 1px 0 rgba(123, 203, 161, 0.08);
  }
  .action-btn[data-state='recommande']:hover:not(:disabled) {
    border-color: rgba(123, 203, 161, 0.7);
    box-shadow: 0 2px 12px rgba(123, 203, 161, 0.2),
                inset 0 1px 0 rgba(123, 203, 161, 0.12);
  }
  .action-btn[data-state='dangereux'] {
    border-color: rgba(217, 130, 28, 0.45);
    border-left-color: #F0B870;
  }
  .action-btn[data-state='dangereux']:hover:not(:disabled) {
    border-color: rgba(240, 184, 112, 0.65);
  }

  .btn-icon {
    display: inline-flex;
    line-height: 1;
  }

  .btn-body {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }

  .btn-label {
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btn-meta {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-family: 'Courier Prime', monospace;
    font-size: 0.6rem;
    line-height: 1;
  }

  .btn-cost {
    color: rgba(201, 178, 106, 0.75);
  }

  .btn-tag {
    font-size: 0.7rem;
    line-height: 1;
  }
  .btn-tag.rec { color: #7BCBA1; }
  .btn-tag.dang { color: #F0B870; }

  /* === Bouton drawer en bas === */
  .full-actions-btn {
    margin-top: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.55rem 0.7rem;
    background: linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
    color: #F4D58C;
    border: 1px solid rgba(201, 178, 106, 0.5);
    border-radius: 0.35rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: filter 0.18s ease, border-color 0.18s ease;
  }
  .full-actions-btn:hover {
    filter: brightness(1.12);
    border-color: #C9B26A;
  }

  @media (max-width: 1280px) {
    .theatre-actions-panel { display: none; }
  }
</style>
