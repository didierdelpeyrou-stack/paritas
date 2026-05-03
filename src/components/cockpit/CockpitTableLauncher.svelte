<script lang="ts">
  /* ============================================================
     CockpitTableLauncher — bouton qui ouvre La Table dans une popup
     ============================================================
     Au clic : window.open('?session=…&scenario=…&actor=…') + ouvre
     un BroadcastChannel pour écouter le résultat. À la réception
     de l'outcome, applique les effets sur l'état du jeu principal.
     ============================================================ */
  import { onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import { makeTableSync, makeSessionId } from '$lib/table/sync';
  import type { TableSync } from '$lib/table/sync';
  import type { TableScenarioId, TableOutcome } from '$lib/table/types';
  import CockpitIcon from './CockpitIcon.svelte';

  interface Props {
    /** Scénario à lancer. Par défaut Sécu 1945. */
    scenarioId?: TableScenarioId;
    /** Acteur incarné par le joueur. */
    playerActorId?: string;
  }
  let { scenarioId = 'secu-1945', playerActorId = 'croizat' }: Props = $props();

  let activeWindow: Window | null = null;
  let activeSync: TableSync | null = null;
  let lastOutcome = $state<TableOutcome | null>(null);
  let popupBlocked = $state(false);

  function open() {
    const sessionId = makeSessionId();
    const seed = rebirth.state?.name
      ? sessionId + ':' + rebirth.state.turn
      : sessionId;

    /* Construit l'URL — préserve le path actuel pour que le bundle
     * soit chargé. */
    const path = window.location.pathname;
    const url = `${path}?session=${sessionId}&scenario=${scenarioId}&actor=${playerActorId}&seed=${encodeURIComponent(seed)}`;

    /* Ouverture popup — taille 1200×820, sinon une nouvelle tab si bloquée */
    const features = 'width=1200,height=820,resizable=yes,scrollbars=yes';
    const win = window.open(url, `paritas-table-${sessionId}`, features);
    if (!win) {
      popupBlocked = true;
      return;
    }
    popupBlocked = false;
    activeWindow = win;

    /* Channel pour recevoir le résultat. */
    activeSync = makeTableSync(sessionId);
    activeSync.onMessage((msg) => {
      if (msg.kind === 'outcome' && msg.sessionId === sessionId) {
        lastOutcome = msg.outcome;
        applyOutcomeToMainGame(msg.outcome);
      } else if (msg.kind === 'close' && msg.sessionId === sessionId) {
        cleanup();
      }
    });
  }

  function applyOutcomeToMainGame(outcome: TableOutcome) {
    /* Applique les effets sur l'état rebirth. Le mapping :
     * - mandat → confiance (proxy : ton mandat interne)
     * - caisse → caisse
     * - legitimite → legitimite
     * - honteFierte → flag spécifique (honteFierte est V1 only pour l'instant)
     * - flag → state.memory.flags */
    const s = rebirth.state;
    if (!s) return;
    const e = outcome.playerEffects;
    rebirth.state = {
      ...s,
      resources: {
        ...s.resources,
        confiance: clamp(s.resources.confiance + e.mandat),
        caisse: clamp(s.resources.caisse + e.caisse),
        legitimite: clamp(s.resources.legitimite + e.legitimite)
      }
    };
    /* Append immutable au log (cohérent avec le pattern rebirth) */
    const result = outcome.result === 'signe' ? 'Accord signé'
      : outcome.result === 'force-minoritaire' ? 'Accord forcé'
      : 'Impasse';
    rebirth.log = [
      ...rebirth.log,
      `T${s.turn} — Table des Négociations · ${result} : ${outcome.epilogue.slice(0, 80)}…`
    ].slice(-50);
  }

  function clamp(n: number): number { return Math.max(0, Math.min(100, n)); }

  function cleanup() {
    if (activeSync) {
      activeSync.close();
      activeSync = null;
    }
    activeWindow = null;
  }

  onDestroy(() => cleanup());
</script>

<div class="launcher">
  <button type="button" class="open-btn" onclick={open}
    title="Ouvrir La Table des Négociations dans une nouvelle fenêtre"
    aria-label="Ouvrir La Table des Négociations">
    <span class="open-icon"><CockpitIcon name="balance" size={20} /></span>
    <span class="open-label">
      <strong>La Table des Négociations</strong>
      <em>1945 · Sécurité sociale · 4 architectes</em>
    </span>
    <span class="open-cta" aria-hidden="true">↗</span>
  </button>

  {#if popupBlocked}
    <div class="popup-warning" in:fly={{ y: -4, duration: 240, easing: cubicOut }}>
      <p>La fenêtre popup a été bloquée par le navigateur. Autorise les
      popups pour ce site, ou clique de nouveau pour réessayer.</p>
    </div>
  {/if}

  {#if lastOutcome}
    <div class="recap" in:fly={{ y: 6, duration: 280, easing: cubicOut }}>
      <span class="recap-tag">Dernière session</span>
      <strong>{lastOutcome.result === 'signe' ? 'Accord signé'
        : lastOutcome.result === 'force-minoritaire' ? 'Accord forcé'
        : 'Impasse'}</strong>
      <p>{lastOutcome.epilogue}</p>
    </div>
  {/if}
</div>

<style>
  .launcher {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .open-btn {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.85rem;
    align-items: center;
    padding: 0.85rem 1rem;
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.1), transparent 70%),
      linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
    border: 1px solid #C9B26A;
    border-radius: 0.5rem;
    color: #F4D58C;
    font-family: 'Cinzel', Georgia, serif;
    text-align: left;
    cursor: pointer;
    box-shadow:
      inset 0 1px 0 rgba(244, 213, 140, 0.10),
      0 4px 14px rgba(0, 0, 0, 0.3);
    transition: transform 0.22s cubic-bezier(0.34, 1.2, 0.64, 1),
                box-shadow 0.22s ease,
                border-color 0.18s ease;
  }

  .open-btn:hover,
  .open-btn:focus-visible {
    transform: translateY(-2px);
    border-color: #F4D58C;
    box-shadow:
      inset 0 1px 0 rgba(244, 213, 140, 0.14),
      0 6px 22px rgba(0, 0, 0, 0.38),
      0 0 22px rgba(244, 213, 140, 0.18);
    outline: none;
  }

  .open-icon {
    display: inline-flex;
    color: #C9B26A;
  }

  .open-label {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    line-height: 1.2;
  }

  .open-label strong {
    font-size: 0.95rem;
    color: #F4D58C;
    letter-spacing: 0.04em;
  }

  .open-label em {
    font-size: 0.78rem;
    color: rgba(244, 239, 226, 0.7);
    font-style: italic;
    letter-spacing: 0.02em;
  }

  .open-cta {
    font-size: 1.4rem;
    color: #C9B26A;
    line-height: 1;
  }

  .popup-warning {
    padding: 0.6rem 0.85rem;
    background: rgba(217, 130, 28, 0.10);
    border: 1px solid rgba(217, 130, 28, 0.4);
    border-radius: 0.4rem;
    color: rgba(244, 239, 226, 0.88);
    font-size: 0.85rem;
    line-height: 1.45;
  }

  .recap {
    padding: 0.7rem 0.95rem;
    background: rgba(244, 213, 140, 0.08);
    border-left: 2px solid #C9B26A;
    border-radius: 0.35rem;
    color: rgba(244, 239, 226, 0.88);
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .recap-tag {
    display: inline-block;
    margin-bottom: 0.25rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.10em;
    color: rgba(244, 213, 140, 0.7);
  }

  .recap strong {
    display: block;
    color: #F4D58C;
    font-size: 0.95rem;
    margin: 0 0 0.4rem;
  }

  .recap p {
    margin: 0;
  }
</style>
