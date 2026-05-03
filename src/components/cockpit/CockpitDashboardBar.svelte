<script lang="ts">
  /* ============================================================
     CockpitDashboardBar — bandeau d'actions rapides CK3-style
     ============================================================
     Au-dessus des instruments, en bas du shell. Affiche :
     - 8 boutons d'actions rapides (icônes paritaires) avec
       indicateur de cooldown et coût mini
     - Compteur Actions N/M central avec barre de progression
     - Cachet de cire VALIDER à droite
     - Badge crise si état critique

     Inspiré CK3 : pas d'espace perdu, dense, ludique, le joueur
     a tout sous la main pour mener sa lutte.
     ============================================================ */
  import { ACTIONS } from '$lib/orchestrator/actions';
  import type { ActionDef } from '$lib/orchestrator/types';
  import { orchestrator } from '$lib/stores/orchestrator.svelte';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import CockpitIcon from './CockpitIcon.svelte';

  interface Props {
    /** Callback ouverture drawer complet (toutes catégories). */
    onOpenFullActions?: () => void;
    /** Callback de validation (cachet de cire). */
    pendingValidation?: boolean;
    onValidate?: () => void;
  }
  let { onOpenFullActions, pendingValidation = false, onValidate }: Props = $props();

  /* On expose 8 actions « rapides » : les plus emblématiques
     d'une lutte syndicale/patronale. Le drawer complet reste
     accessible via le bouton "Toutes" en bout de barre. */
  const QUICK_ACTION_IDS = [
    'tracts',         // mobilisation rapide
    'meeting',        // discours
    'manifestation',  // grève
    'petition',       // signatures
    'delegation',     // diplomatie
    'presse',         // médiatique
    'tresorerie',     // budget annuel
    'table'           // négociation
  ];

  const quickActions = $derived(
    QUICK_ACTION_IDS
      .map(id => ACTIONS.find(a => a.id === id))
      .filter((a): a is ActionDef => a !== undefined)
  );

  const isCrisis = $derived(orchestrator.isCrisis);
  const turn = $derived(rebirth.state?.turn ?? 1);

  function fire(action: ActionDef) {
    const exec = orchestrator.canExec(action);
    if (!exec.ok) return;
    orchestrator.dispatch(action);
  }
</script>

<div class="dashboard" class:crisis={isCrisis}>
  <!-- Actions rapides à gauche -->
  <div class="quick-actions">
    {#each quickActions as a (a.id)}
      {@const exec = orchestrator.canExec(a)}
      <button
        type="button"
        class="quick-btn"
        class:disabled={!exec.ok}
        style:--accent={a.accent}
        title={exec.ok
          ? `${a.label} — ${a.cost.caisse ?? 0}F · ${a.cost.mandat ?? 0}m`
          : `${a.label} — ${exec.reason}`}
        onclick={() => fire(a)}
      >
        <span class="quick-icon" style:color={a.accent}>
          <CockpitIcon name={a.icon} size={18} />
        </span>
        <span class="quick-label">{a.label.split(' ')[0]?.replace(/^(une|un|le|la|les|des)$/i, a.label.split(' ')[1] ?? a.label.split(' ')[0]) ?? a.label}</span>
        {#if a.cost.caisse}
          <span class="quick-cost">{a.cost.caisse}F</span>
        {/if}
      </button>
    {/each}

    <button type="button" class="quick-btn more"
      onclick={() => onOpenFullActions?.()}
      title="Voir toutes les actions disponibles"
    >
      <span class="quick-icon">
        <CockpitIcon name="rouage" size={18} />
      </span>
      <span class="quick-label">Toutes</span>
    </button>
  </div>

  <!-- Compteur Actions au centre -->
  <div class="actions-meter" class:crisis={isCrisis}>
    {#if isCrisis}
      <span class="meter-crisis-icon">
        <CockpitIcon name="alerte" size={14} />
      </span>
    {/if}
    <span class="meter-label">Actions ce tour</span>
    <span class="meter-count">{orchestrator.state.actionsThisTurn}/{orchestrator.state.maxActionsPerTurn}</span>
    <div class="meter-bar">
      <i style:width="{(orchestrator.state.actionsThisTurn / orchestrator.state.maxActionsPerTurn) * 100}%"></i>
    </div>
    <span class="meter-turn">T{turn}</span>
  </div>

  <!-- Cachet de cire VALIDER à droite -->
  {#if onValidate}
    <button type="button" class="validate-seal" class:pulsing={pendingValidation}
      onclick={() => onValidate?.()}
      disabled={!pendingValidation}
      title={pendingValidation ? 'Valider ton choix' : 'Sélectionne d\'abord un choix'}
      aria-label="Valider"
    >
      ●
    </button>
  {/if}
</div>

<style>
  .dashboard {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: stretch;
    gap: 0.6rem;
    padding: 0.5rem 0.85rem;
    background:
      repeating-linear-gradient(90deg,
        rgba(90, 47, 28, 0) 0,
        rgba(90, 47, 28, 0.04) 1px,
        rgba(90, 47, 28, 0) 2px,
        rgba(90, 47, 28, 0) 8px),
      linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
    border-top: 1px solid rgba(201, 178, 106, 0.3);
    box-shadow: inset 0 1px 0 rgba(244, 213, 140, 0.05);
    flex-shrink: 0;
    transition: background 0.4s ease;
  }

  .dashboard.crisis {
    background:
      repeating-linear-gradient(90deg,
        rgba(176, 24, 30, 0) 0,
        rgba(176, 24, 30, 0.05) 1px,
        rgba(176, 24, 30, 0) 2px,
        rgba(176, 24, 30, 0) 8px),
      linear-gradient(180deg, #3D1A1A 0%, #2A0E0E 100%);
    border-top-color: rgba(176, 24, 30, 0.5);
  }

  /* === Actions rapides === */
  .quick-actions {
    display: flex;
    gap: 0.35rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .quick-actions::-webkit-scrollbar { display: none; }

  .quick-btn {
    --accent: #C9B26A;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    padding: 0.4rem 0.55rem 0.45rem;
    background: linear-gradient(180deg, #4A2E1A 0%, #3D2615 100%);
    border: 1px solid rgba(140, 110, 64, 0.45);
    border-bottom: 2px solid var(--accent);
    border-radius: 0.35rem;
    color: rgba(244, 213, 140, 0.8);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: transform 0.18s cubic-bezier(0.34, 1.2, 0.64, 1),
                background 0.18s ease,
                box-shadow 0.18s ease;
    min-width: 64px;
  }

  .quick-btn:hover:not(.disabled) {
    transform: translateY(-2px);
    background: linear-gradient(180deg, #5A3622 0%, #4A2E1A 100%);
    color: #F4D58C;
    box-shadow:
      0 3px 10px rgba(0, 0, 0, 0.35),
      0 0 12px color-mix(in srgb, var(--accent) 25%, transparent);
  }

  .quick-btn.disabled {
    opacity: 0.45;
    cursor: not-allowed;
    filter: grayscale(0.5);
  }

  .quick-btn.more {
    border-color: rgba(244, 213, 140, 0.55);
    border-bottom-color: #F4D58C;
  }

  .quick-icon { display: inline-flex; }

  .quick-label {
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    max-width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .quick-cost {
    background: rgba(201, 178, 106, 0.18);
    color: #C9B26A;
    padding: 0.05rem 0.35rem;
    border-radius: 0.2rem;
    font-family: 'Courier Prime', monospace;
    font-size: 0.58rem;
    margin-top: 0.05rem;
  }

  /* === Compteur Actions === */
  .actions-meter {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto;
    align-items: center;
    gap: 0.15rem 0.5rem;
    padding: 0.4rem 0.7rem;
    background: rgba(13, 11, 8, 0.45);
    border: 1px solid rgba(201, 178, 106, 0.3);
    border-radius: 0.4rem;
    min-width: 160px;
    color: #F4D58C;
    font-family: 'Cinzel', Georgia, serif;
    position: relative;
  }

  .actions-meter.crisis {
    border-color: rgba(176, 24, 30, 0.6);
    box-shadow: 0 0 10px rgba(176, 24, 30, 0.35);
    animation: meter-crisis-glow 1.8s ease-in-out infinite;
  }

  .meter-crisis-icon {
    position: absolute;
    top: -8px; left: -8px;
    color: #E08F92;
    background: #2A0E0E;
    border: 1px solid #B0181E;
    border-radius: 50%;
    width: 20px; height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .meter-label {
    grid-column: 1;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(244, 213, 140, 0.7);
  }

  .meter-count {
    grid-column: 2;
    text-align: center;
    font-family: 'Courier Prime', monospace;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .meter-turn {
    grid-column: 3;
    font-family: 'Courier Prime', monospace;
    font-size: 0.78rem;
    color: rgba(201, 178, 106, 0.75);
  }

  .meter-bar {
    grid-column: 1 / -1;
    grid-row: 2;
    height: 3px;
    background: rgba(201, 178, 106, 0.18);
    border-radius: 2px;
    overflow: hidden;
  }

  .meter-bar i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #C9B26A, #F4D58C);
    transition: width 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
  }

  @keyframes meter-crisis-glow {
    0%, 100% { box-shadow: 0 0 10px rgba(176, 24, 30, 0.25); }
    50%      { box-shadow: 0 0 18px rgba(176, 24, 30, 0.5); }
  }

  /* === Cachet de cire compact === */
  .validate-seal {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #9B2A26 0%, #7A1E1B 60%, #5A1410 100%);
    border: 2px solid #5A1410;
    color: #F4D58C;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.18),
      inset 0 -3px 5px rgba(0, 0, 0, 0.3),
      0 3px 8px rgba(122, 30, 27, 0.4);
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: center;
  }

  .validate-seal:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .validate-seal.pulsing:not(:disabled) {
    animation: seal-pulse 1.4s ease-in-out infinite;
  }

  .validate-seal:hover:not(:disabled) {
    transform: scale(1.06);
  }

  @keyframes seal-pulse {
    0%, 100% { box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.18), inset 0 -3px 5px rgba(0, 0, 0, 0.3), 0 3px 8px rgba(122, 30, 27, 0.4); }
    50%      { box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.22), inset 0 -3px 5px rgba(0, 0, 0, 0.3), 0 5px 16px rgba(244, 213, 140, 0.5), 0 3px 8px rgba(122, 30, 27, 0.6); }
  }

  /* Mobile */
  @media (max-width: 768px) {
    .dashboard {
      grid-template-columns: 1fr auto;
      padding: 0.4rem 0.55rem;
    }
    .actions-meter {
      grid-column: 1 / 3;
      grid-row: 2;
      margin-top: 0.4rem;
    }
    .quick-btn {
      min-width: 56px;
      font-size: 0.55rem;
    }
    .quick-label { max-width: 50px; }
  }
</style>
