<script lang="ts">
  /* ============================================================
     CockpitActionsDrawer — drawer plein écran d'actions V3
     ============================================================
     Affiche les 17 actions du moteur orchestrator regroupées par
     catégorie. Chaque action = carte avec coût + effets +
     probabilité d'échec + cooldown. Cascade alerte si crise active.
     Forçage externe (vent historique) affiché en bandeau.

     Spec : V3_COCKPIT_THERMODYNAMIQUE.md §IV.
     ============================================================ */
  import { fade, fly, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { ACTIONS, actionsByCategory } from '$lib/orchestrator/actions';
  import type { ActionDef, ActionCategory } from '$lib/orchestrator/types';
  import { orchestrator } from '$lib/stores/orchestrator.svelte';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import CockpitIcon from './CockpitIcon.svelte';

  interface Props {
    open: boolean;
    onClose: () => void;
  }
  let { open, onClose }: Props = $props();

  const CATEGORY_META: Record<ActionCategory, { label: string; icon: string; accent: string }> = {
    mobilisation:   { label: 'Mobilisation',  icon: 'poing',     accent: '#D9821C' },
    institutionnel: { label: 'Institutionnel', icon: 'balance',  accent: '#C9B26A' },
    finance:        { label: 'Finance',        icon: 'sceau',     accent: '#3A6B47' },
    communication:  { label: 'Communication',  icon: 'presse',    accent: '#5C2D5C' },
    organisation:   { label: 'Organisation',   icon: 'bourse',    accent: '#993D1A' }
  };

  let activeCategory = $state<ActionCategory>('mobilisation');
  let hoveredAction = $state<string | null>(null);

  const grouped = $derived(actionsByCategory());
  const visibleActions = $derived(grouped[activeCategory] ?? []);

  const isCrisis = $derived(orchestrator.isCrisis);
  const critRes = $derived(orchestrator.criticalRes);
  const currentForcing = $derived(orchestrator.currentForcing);

  function handleExec(action: ActionDef) {
    orchestrator.dispatch(action);
    /* Garde le drawer ouvert — le user voit l'effet + peut faire
     * une autre action. */
  }

  function costSummary(action: ActionDef): string {
    const parts: string[] = [];
    if (action.cost.caisse) parts.push(`${action.cost.caisse} F`);
    if (action.cost.mandat) parts.push(`${action.cost.mandat} mandat`);
    if (action.cost.temps) parts.push(`${action.cost.temps}t`);
    return parts.join(' · ');
  }

  function effectChips(action: ActionDef): Array<{ key: string; delta: number; pos: boolean }> {
    if (!action.effects.resources) return [];
    return Object.entries(action.effects.resources)
      .filter(([_, v]) => typeof v === 'number' && v !== 0)
      .map(([key, v]) => ({ key, delta: v as number, pos: (v as number) > 0 }));
  }

  const RES_LABELS: Record<string, string> = {
    confiance: 'Conf.',
    caisse: 'Caisse',
    legitimite: 'Légi.',
    rapportDeForce: 'F.ext',
    cohesionInterne: 'F.int',
    santeSociale: 'S.soc',
    institution: 'Inst.'
  };

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) onClose();
  }
</script>

<svelte:window onkeydown={onKey} />

{#if open}
  <div class="actions-backdrop"
    in:fade={{ duration: 200 }} out:fade={{ duration: 160 }}
    onclick={onClose} role="presentation"
  ></div>

  <aside class="actions-drawer"
    in:fly={{ y: 18, duration: 280, easing: cubicOut }}
    out:fly={{ y: 18, duration: 200, easing: cubicOut }}
    aria-labelledby="actions-title"
  >
    <!-- Header -->
    <header class="drawer-head">
      <h2 id="actions-title">Actions disponibles</h2>
      <div class="head-meta">
        Tour {rebirth.state?.turn ?? '?'}/100
        · {orchestrator.state.actionsThisTurn}/{orchestrator.state.maxActionsPerTurn} jouées
      </div>
      <button type="button" class="close-btn" onclick={onClose}
        aria-label="Fermer">×</button>
    </header>

    <!-- Bandeau vent historique -->
    {#if currentForcing}
      <div class="forcing-banner" in:fly={{ y: -8, duration: 240 }}>
        <span class="forcing-icon"><CockpitIcon name="flamme" size={18} /></span>
        <div class="forcing-text">
          <strong>☄ {currentForcing.label}</strong>
          <em>{currentForcing.description}</em>
        </div>
      </div>
    {/if}

    <!-- Cascade alerte -->
    {#if isCrisis}
      <div class="crisis-banner" in:fly={{ y: -8, duration: 240 }}>
        <span class="crisis-icon"><CockpitIcon name="alerte" size={20} /></span>
        <div>
          <strong>⚠ CRISE SYSTÉMIQUE</strong>
          <em>{critRes.length} jauge{critRes.length > 1 ? 's' : ''} en zone critique :
            {critRes.map(r => RES_LABELS[r] ?? r).join(', ')}.
            Stabilise vite.</em>
        </div>
      </div>
    {/if}

    <!-- Tabs catégories -->
    <div class="cat-tabs" role="tablist" aria-label="Catégories d'actions">
      {#each Object.entries(CATEGORY_META) as [cat, meta]}
        {@const count = (grouped[cat as ActionCategory] ?? []).length}
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === cat}
          class="cat-tab"
          class:active={activeCategory === cat}
          style:--accent={meta.accent}
          onclick={() => (activeCategory = cat as ActionCategory)}
        >
          <span class="cat-icon"><CockpitIcon name={meta.icon as any} size={16} /></span>
          <span class="cat-label">{meta.label}</span>
          <span class="cat-count">{count}</span>
        </button>
      {/each}
    </div>

    <!-- Grille d'actions -->
    <div class="actions-grid">
      {#each visibleActions as action (action.id)}
        {@const exec = orchestrator.canExec(action)}
        {@const fails = action.failProbability ?? 0}
        {@const chips = effectChips(action)}
        <article
          class="action-card"
          class:disabled={!exec.ok}
          class:hovered={hoveredAction === action.id}
          style:--accent={action.accent}
          onmouseenter={() => (hoveredAction = action.id)}
          onmouseleave={() => (hoveredAction = null)}
        >
          <header class="card-head">
            <span class="card-icon" style:color={action.accent}>
              <CockpitIcon name={action.icon} size={22} />
            </span>
            <div class="card-id">
              <h3 class="card-name">{action.label}</h3>
              <p class="card-desc">{action.description}</p>
            </div>
          </header>

          <div class="card-cost">
            <span class="cost-label">Coût</span>
            <span class="cost-value">{costSummary(action)}</span>
          </div>

          {#if chips.length > 0}
            <div class="card-effects">
              {#each chips as c}
                <span class="effect-chip" class:pos={c.pos} class:neg={!c.pos}>
                  {c.pos ? '+' : ''}{c.delta} {RES_LABELS[c.key] ?? c.key}
                </span>
              {/each}
            </div>
          {/if}

          <footer class="card-foot">
            <div class="card-meta">
              {#if fails > 0.05}
                <span class="meta-fail" title="Probabilité d'échec">
                  ⚠ {Math.round(fails * 100)}%
                </span>
              {/if}
              {#if action.cooldown}
                <span class="meta-cd" title="Temps de repos après usage">
                  ⏳ {action.cooldown}t
                </span>
              {/if}
            </div>
            <button type="button" class="exec-btn"
              disabled={!exec.ok}
              title={exec.ok ? 'Exécuter cette action' : exec.reason}
              onclick={() => handleExec(action)}
            >
              {exec.ok ? 'Exécuter' : 'Indispo'}
            </button>
          </footer>

          {#if !exec.ok && exec.reason}
            <div class="block-reason">{exec.reason}</div>
          {/if}
        </article>
      {/each}
    </div>

    <!-- Feedback dernière action -->
    {#if orchestrator.lastResult}
      <div class="last-result"
        class:fail={orchestrator.lastResult.outcome === 'fail'}
        class:blocked={orchestrator.lastResult.outcome === 'blocked'}
        in:scale={{ duration: 280, easing: cubicOut, start: 0.85 }}
      >
        <strong>
          {orchestrator.lastResult.outcome === 'success' ? '✓ Action accomplie'
            : orchestrator.lastResult.outcome === 'fail' ? '✗ Échec'
            : '⊘ Bloqué'}
        </strong>
        {#if orchestrator.lastResult.narrative}
          <em>{orchestrator.lastResult.narrative}</em>
        {/if}
      </div>
    {/if}

  </aside>
{/if}

<style>
  .actions-backdrop {
    position: fixed; inset: 0;
    background: rgba(13, 11, 8, 0.55);
    backdrop-filter: blur(2px);
    z-index: 70;
  }

  .actions-drawer {
    position: fixed;
    top: 5dvh; bottom: 5dvh;
    left: 5vw; right: 5vw;
    max-width: 1280px;
    margin: 0 auto;
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.06), transparent 65%),
      linear-gradient(180deg, #211712 0%, #150F0B 100%);
    border: 1px solid #C9B26A;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.6);
    z-index: 71;
    display: grid;
    grid-template-rows: auto auto auto auto 1fr auto;
    color: #F4EFE2;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  /* ===== Header ===== */
  .drawer-head {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 1rem;
    padding: 0.85rem 1.2rem;
    background: linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
    border-bottom: 1px solid rgba(201, 178, 106, 0.25);
  }

  .drawer-head h2 {
    margin: 0;
    font-family: 'Cinzel', Georgia, serif;
    color: #F4D58C;
    font-size: 1.1rem;
    letter-spacing: 0.05em;
  }

  .head-meta {
    color: rgba(244, 239, 226, 0.75);
    font-size: 0.85rem;
    font-style: italic;
  }

  .close-btn {
    background: transparent;
    border: 1px solid rgba(201, 178, 106, 0.3);
    color: #F4D58C;
    width: 32px; height: 32px;
    border-radius: 0.35rem;
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
  }
  .close-btn:hover { background: rgba(201, 178, 106, 0.14); }

  /* ===== Bandeaux ===== */
  .forcing-banner {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.7rem;
    align-items: center;
    padding: 0.6rem 1.1rem;
    background: rgba(244, 213, 140, 0.08);
    border-bottom: 1px solid rgba(201, 178, 106, 0.2);
  }

  .forcing-icon {
    color: #F4D58C;
    display: inline-flex;
  }

  .forcing-text strong {
    display: block;
    color: #F4D58C;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.85rem;
    letter-spacing: 0.05em;
  }

  .forcing-text em {
    color: rgba(244, 239, 226, 0.75);
    font-size: 0.78rem;
    font-style: italic;
  }

  .crisis-banner {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.7rem;
    align-items: center;
    padding: 0.65rem 1.1rem;
    background: rgba(176, 24, 30, 0.18);
    border-bottom: 2px solid rgba(176, 24, 30, 0.55);
    animation: crisis-pulse 2.4s ease-in-out infinite;
  }

  .crisis-icon { color: #E08F92; display: inline-flex; }

  .crisis-banner strong {
    display: block;
    color: #E08F92;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
  }

  .crisis-banner em {
    color: rgba(244, 239, 226, 0.85);
    font-size: 0.82rem;
    font-style: italic;
  }

  @keyframes crisis-pulse {
    0%, 100% { background: rgba(176, 24, 30, 0.14); }
    50%      { background: rgba(176, 24, 30, 0.22); }
  }

  /* ===== Catégories ===== */
  .cat-tabs {
    display: flex;
    gap: 0.3rem;
    padding: 0.55rem 1.1rem;
    border-bottom: 1px solid rgba(201, 178, 106, 0.2);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .cat-tab {
    --accent: #C9B26A;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    background: rgba(13, 11, 8, 0.4);
    border: 1px solid rgba(201, 178, 106, 0.25);
    border-radius: 0.35rem;
    color: rgba(244, 213, 140, 0.75);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: all 0.18s ease;
    white-space: nowrap;
  }

  .cat-tab:hover {
    border-color: var(--accent);
    color: #F4D58C;
  }

  .cat-tab.active {
    background: linear-gradient(180deg, #4A2E1A 0%, #3A2418 100%);
    border-color: var(--accent);
    color: var(--accent);
    box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 30%, transparent);
  }

  .cat-icon { display: inline-flex; }

  .cat-count {
    background: rgba(201, 178, 106, 0.2);
    color: rgba(244, 239, 226, 0.85);
    border-radius: 999px;
    padding: 0.05rem 0.45rem;
    font-size: 0.7rem;
    font-family: 'Courier Prime', monospace;
  }

  /* ===== Grille d'actions ===== */
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.7rem;
    padding: 0.85rem 1.1rem 1.5rem;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(201, 178, 106, 0.3) transparent;
  }

  .actions-grid::-webkit-scrollbar { width: 6px; }
  .actions-grid::-webkit-scrollbar-thumb { background: rgba(201, 178, 106, 0.3); border-radius: 3px; }

  .action-card {
    --accent: #C9B26A;
    display: grid;
    grid-template-rows: auto auto auto auto;
    gap: 0.45rem;
    padding: 0.7rem 0.85rem 0.85rem;
    background: linear-gradient(180deg, rgba(45, 26, 13, 0.55) 0%, rgba(30, 18, 10, 0.55) 100%);
    border: 1px solid rgba(201, 178, 106, 0.25);
    border-left: 3px solid var(--accent);
    border-radius: 0.45rem;
    transition: transform 0.2s cubic-bezier(0.34, 1.2, 0.64, 1),
                border-color 0.2s ease, box-shadow 0.2s ease;
    position: relative;
  }

  .action-card.hovered:not(.disabled) {
    transform: translateY(-2px);
    border-color: var(--accent);
    box-shadow:
      0 6px 18px rgba(0, 0, 0, 0.35),
      0 0 14px color-mix(in srgb, var(--accent) 25%, transparent);
  }

  .action-card.disabled {
    opacity: 0.55;
    filter: grayscale(0.5);
  }

  .card-head {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.55rem;
    align-items: start;
  }

  .card-icon {
    display: inline-flex;
    align-items: center;
    padding-top: 0.1rem;
  }

  .card-name {
    margin: 0;
    font-family: 'Cinzel', Georgia, serif;
    color: #F4D58C;
    font-size: 0.9rem;
    letter-spacing: 0.04em;
    line-height: 1.2;
  }

  .card-desc {
    margin: 0.15rem 0 0;
    font-size: 0.74rem;
    color: rgba(244, 239, 226, 0.7);
    font-style: italic;
    line-height: 1.35;
  }

  .card-cost {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0.3rem 0.5rem;
    background: rgba(13, 11, 8, 0.45);
    border-radius: 0.3rem;
    border-left: 2px solid rgba(201, 178, 106, 0.3);
    font-size: 0.76rem;
  }

  .cost-label {
    color: rgba(244, 213, 140, 0.6);
    font-family: 'Cinzel', Georgia, serif;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.65rem;
  }

  .cost-value {
    color: #F4D58C;
    font-family: 'Courier Prime', monospace;
    font-weight: 600;
  }

  .card-effects {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .effect-chip {
    padding: 0.15rem 0.45rem;
    border-radius: 0.25rem;
    font-family: 'Courier Prime', monospace;
    font-size: 0.72rem;
    background: rgba(140, 110, 64, 0.18);
    border: 1px solid rgba(140, 110, 64, 0.4);
    color: rgba(244, 239, 226, 0.85);
  }

  .effect-chip.pos {
    background: rgba(58, 107, 71, 0.22);
    border-color: rgba(58, 107, 71, 0.5);
    color: #8DC09F;
  }

  .effect-chip.neg {
    background: rgba(176, 24, 30, 0.18);
    border-color: rgba(176, 24, 30, 0.4);
    color: #E08F92;
  }

  .card-foot {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
    align-items: center;
    margin-top: 0.2rem;
  }

  .card-meta {
    display: flex;
    gap: 0.5rem;
    font-size: 0.7rem;
    color: rgba(244, 213, 140, 0.65);
    font-family: 'Cinzel', Georgia, serif;
  }

  .meta-fail { color: #D9821C; }
  .meta-cd   { color: rgba(244, 213, 140, 0.7); }

  .exec-btn {
    background: var(--accent);
    color: #0d1014;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 0.35rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: filter 0.18s ease, transform 0.18s ease;
  }

  .exec-btn:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .exec-btn:disabled {
    background: rgba(140, 110, 64, 0.3);
    color: rgba(244, 239, 226, 0.5);
    cursor: not-allowed;
  }

  .block-reason {
    grid-column: 1 / -1;
    margin-top: 0.2rem;
    padding: 0.3rem 0.5rem;
    background: rgba(176, 24, 30, 0.10);
    border-left: 2px solid rgba(176, 24, 30, 0.4);
    border-radius: 0.25rem;
    font-size: 0.7rem;
    color: rgba(244, 239, 226, 0.75);
    font-style: italic;
  }

  /* ===== Last result ===== */
  .last-result {
    margin: 0 1.1rem 0.9rem;
    padding: 0.55rem 0.85rem;
    background: rgba(58, 107, 71, 0.18);
    border: 1px solid rgba(58, 107, 71, 0.5);
    border-radius: 0.4rem;
    color: #8DC09F;
    font-family: 'Source Serif 4', Georgia, serif;
    line-height: 1.4;
    font-size: 0.85rem;
  }

  .last-result.fail {
    background: rgba(176, 24, 30, 0.18);
    border-color: rgba(176, 24, 30, 0.5);
    color: #E08F92;
  }

  .last-result.blocked {
    background: rgba(140, 110, 64, 0.15);
    border-color: rgba(140, 110, 64, 0.4);
    color: rgba(244, 213, 140, 0.85);
  }

  .last-result strong {
    display: block;
    margin-bottom: 0.2rem;
    font-family: 'Cinzel', Georgia, serif;
    letter-spacing: 0.05em;
  }

  .last-result em {
    font-style: italic;
    opacity: 0.95;
  }

  /* Mobile : drawer fullscreen */
  @media (max-width: 768px) {
    .actions-drawer {
      top: 0; bottom: 0; left: 0; right: 0;
      max-width: none;
      border-radius: 0;
    }
    .actions-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
