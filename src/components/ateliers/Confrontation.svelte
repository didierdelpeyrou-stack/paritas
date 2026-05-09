<script lang="ts">
  /**
   * Confrontation.svelte — Atelier "La Rue"
   * Police vs Manifestants — 1v1 / 2v2 / 3v3 / 4v4 local.
   *
   * Deux joueurs sur le même écran.
   * 3 rounds de choix simultanés → zone cursor → vainqueur.
   *
   * Props :
   *   onresolve  — résultat pour V2 (optionnel, standalone sinon)
   *   onskip     — passer (optionnel)
   *   embedded   — overlay mode
   *   startSide  — forcer un camp (si joueur solo dans V2)
   *
   * ORDA-018 PARITAS — refacto CSS (dette ORDA-006 reportée 9 fois).
   * Le monolithe 1007 LoC est désormais un orchestrateur ~190 LoC qui
   * compose 4 sous-composants avec leur CSS scopée propre :
   *   - confrontation/ConfrHeader.svelte (header + tutoriel)
   *   - confrontation/ConfrTerrain.svelte (zone cursor + terrain + round story)
   *   - confrontation/ConfrPickingArena.svelte (2 colonnes + VS + resolving flash)
   *   - confrontation/ConfrMatchResult.svelte (résultat final + recap rounds)
   * La logique métier (state, picking, resolve, AI) reste ici, intacte.
   */
  import {
    startConfrSession,
    pickAction,
    resolveRound,
    nextRound,
    aiPolice,
    aiManif,
    MANIF_ACTIONS,
    POLICE_ACTIONS,
    type ConfrState,
    type Side,
    type ManifAction,
    type PoliceAction,
    type MatchOutcome
  } from '../../game/ateliers/confrontation/engine';
  import ConfrHeader from './confrontation/ConfrHeader.svelte';
  import ConfrTerrain from './confrontation/ConfrTerrain.svelte';
  import ConfrPickingArena from './confrontation/ConfrPickingArena.svelte';
  import ConfrMatchResult from './confrontation/ConfrMatchResult.svelte';

  interface Props {
    onresolve?: (outcome: MatchOutcome) => void;
    onskip?: () => void;
    embedded?: boolean;
    startSide?: Side | null;
  }

  const { onresolve, onskip, embedded = false, startSide = null }: Props = $props();

  let gameState: ConfrState = $state(startConfrSession());
  let resolving = $state(false);
  let showResult = $state(false);
  /* Snapshot des picks au moment du reveal (avant que resolveRound les efface) */
  let revealManifIcon: string | null = $state(null);
  let revealPoliceIcon: string | null = $state(null);

  /* En mode 1-joueur (V2), on incarne un camp et l'IA joue l'autre */
  const soloMode = $derived(startSide !== null);

  /* ======================================================
     Picking logic
     ====================================================== */

  function pickManif(id: ManifAction) {
    if (gameState.phase !== 'picking' || gameState.manifPick) return;
    gameState = pickAction(gameState, 'manif', id);
    maybeTriggerResolve();
  }

  function pickPolice(id: PoliceAction) {
    if (gameState.phase !== 'picking' || gameState.policePick) return;
    // En mode solo côté manif, l'IA joue police
    if (soloMode && startSide === 'manif') return;
    gameState = pickAction(gameState, 'police', id);
    maybeTriggerResolve();
  }

  function maybeTriggerResolve() {
    // Si les deux ont choisi (ou si IA joue l'autre côté) → résoudre
    const cur = gameState;

    /* IA police (si solo manif) */
    if (soloMode && startSide === 'manif' && cur.manifPick && !cur.policePick) {
      const aiPick = aiPolice(cur);
      gameState = pickAction(gameState, 'police', aiPick);
    }

    /* IA manif (si solo police) */
    if (soloMode && startSide === 'police' && cur.policePick && !cur.manifPick) {
      const aiPick = aiManif(cur);
      gameState = pickAction(gameState, 'manif', aiPick);
    }

    /* Les deux ont choisi → résolution */
    if (gameState.manifPick && gameState.policePick) {
      triggerResolve();
    }
  }

  function triggerResolve() {
    // Snapshot des icônes AVANT le resolve (les picks seront clearés après)
    revealManifIcon = MANIF_ACTIONS.find(a => a.id === gameState.manifPick)?.icon ?? '?';
    revealPoliceIcon = POLICE_ACTIONS.find(a => a.id === gameState.policePick)?.icon ?? '?';
    resolving = true;

    setTimeout(() => {
      gameState = resolveRound(gameState);
      resolving = false;

      // FIX B2 : toujours montrer la narrative — même au dernier round
      // (phase peut être 'result' OU 'ended', dans les deux cas on flash la story)
      showResult = true;
      setTimeout(() => {
        showResult = false;
      }, 2400);
    }, 600);
  }

  function advanceRound() {
    if (gameState.phase === 'result') {
      gameState = nextRound(gameState);
    }
  }

  function finish() {
    if (gameState.matchOutcome && onresolve) {
      onresolve(gameState.matchOutcome);
    }
  }

  function restart() {
    gameState = startConfrSession();
  }

  /* IA aiPolice / aiManif extraites vers engine.ts (Argus ORDA-006) */

  /* ============================================================
     Tutoriel diégétique (ORDA-015 PARITAS, Yanis-19)
     Trois bullets en JE pour expliquer la Confrontation en ~20 secondes.
     Persistance localStorage.
     ============================================================ */
  let tutoDismissed = $state(false);
  if (typeof window !== 'undefined') {
    try { tutoDismissed = localStorage.getItem('paritas:tuto-confrontation-dismissed') === '1'; }
    catch { /* ignore */ }
  }
  function dismissTuto() {
    tutoDismissed = true;
    try { localStorage.setItem('paritas:tuto-confrontation-dismissed', '1'); } catch { /* ignore */ }
  }
  const showTuto = $derived(gameState.phase === 'picking' && gameState.round === 1 && !tutoDismissed);
</script>

<div class="rue-root" class:overlay={embedded}>
  <div class="rue-shell">

    <ConfrHeader
      round={gameState.round}
      {onskip}
      {showTuto}
      onDismissTuto={dismissTuto}
    />

    <ConfrTerrain
      {gameState}
      {resolving}
      {showResult}
      onAdvanceRound={advanceRound}
    />

    <ConfrPickingArena
      {gameState}
      {soloMode}
      {startSide}
      {resolving}
      {revealManifIcon}
      {revealPoliceIcon}
      onPickManif={pickManif}
      onPickPolice={pickPolice}
    />

    <ConfrMatchResult
      {gameState}
      onRestart={restart}
      onFinish={onresolve ? finish : undefined}
    />

  </div>
</div>

<style>
  /* ====== Root + shell uniquement ======
     Tout le reste a migré dans les 4 sous-composants ORDA-018. */
  .rue-root {
    background: #080808;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Courier New', 'Consolas', monospace;
    color: #e8dcc8;
    padding: 1rem;
  }

  .rue-root.overlay {
    position: fixed;
    inset: 0;
    background: rgba(4, 4, 4, 0.96);
    z-index: 900;
    overflow-y: auto;
  }

  .rue-shell {
    max-width: 760px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
