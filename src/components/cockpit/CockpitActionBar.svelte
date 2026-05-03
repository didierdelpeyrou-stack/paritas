<script lang="ts">
  /* Barre d'action (bottom du cockpit) — tour, chapitre, bouton
     VALIDER cachet de cire, vitesse, replay. Vague α-bis MVP. */
  interface Props {
    turn: number;
    /** Total de tours (100 par défaut). */
    totalTurns?: number;
    /** Nom du chapitre courant si déterminable. */
    chapter?: string;
    /** Y a-t-il une action validable (choix sélectionné non confirmé) ? */
    pendingValidation?: boolean;
    /** Callback de validation. */
    onValidate?: () => void;
  }
  let { turn, totalTurns = 100, chapter, pendingValidation = false, onValidate }: Props = $props();

  let progressPct = $derived((Math.min(turn, totalTurns) / totalTurns) * 100);
</script>

<footer class="action-bar">
  <div class="progress-track">
    <div class="progress-fill" style:width="{progressPct}%"></div>
  </div>

  <div class="action-content">
    <div class="action-left">
      <span class="turn-counter">Tour <strong>{turn}</strong>/{totalTurns}</span>
      {#if chapter}
        <span class="chapter">· {chapter}</span>
      {/if}
    </div>

    <div class="action-center">
      <button
        type="button"
        class="validate-seal"
        class:pulsing={pendingValidation}
        onclick={() => onValidate?.()}
        disabled={!pendingValidation}
        title={pendingValidation ? 'Valider ton choix' : 'Sélectionne d\'abord un choix'}
        aria-label="Valider"
      >
        ●
      </button>
    </div>

    <div class="action-right">
      <!-- Slot futur pour Auto / Vitesse / Replay -->
      <span class="action-hint">{pendingValidation ? 'Choix prêt' : ''}</span>
    </div>
  </div>
</footer>

<style>
  .action-bar {
    position: relative;
    background: linear-gradient(180deg, #C9A878 0%, #B89568 100%);
    border-top: 1px solid rgba(90, 47, 28, 0.3);
    color: #1A1411;
    font-family: 'Cinzel', Georgia, serif;
  }

  .progress-track {
    height: 3px;
    background: rgba(90, 47, 28, 0.18);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #5A2F1C 0%, #C9B26A 100%);
    transition: width 0.6s cubic-bezier(0.34, 1.2, 0.64, 1);
  }

  .action-content {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 0.8rem;
    padding: 0.4rem 1rem;
  }

  .action-left {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    font-size: 0.85rem;
  }

  .turn-counter strong {
    font-size: 1rem;
    color: #5A2F1C;
  }

  .chapter {
    color: rgba(26, 20, 17, 0.65);
    font-size: 0.78rem;
    letter-spacing: 0.04em;
  }

  .action-center {
    display: flex;
    justify-content: center;
  }

  /* Bouton VALIDER style cachet de cire (cire rouge sang Vignelli OK) */
  .validate-seal {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #9B2A26 0%, #7A1E1B 60%, #5A1410 100%);
    border: 2px solid #5A1410;
    color: #F4D58C;
    font-size: 1.3rem;
    cursor: pointer;
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.18),
      inset 0 -3px 6px rgba(0, 0, 0, 0.3),
      0 3px 8px rgba(122, 30, 27, 0.4);
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  }

  .validate-seal:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .validate-seal.pulsing:not(:disabled) {
    animation: seal-pulse 1.4s ease-in-out infinite;
  }

  .validate-seal:hover:not(:disabled) {
    transform: scale(1.06);
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.22),
      inset 0 -3px 6px rgba(0, 0, 0, 0.3),
      0 5px 14px rgba(122, 30, 27, 0.55);
  }

  @keyframes seal-pulse {
    0%, 100% { box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.18), inset 0 -3px 6px rgba(0, 0, 0, 0.3), 0 3px 8px rgba(122, 30, 27, 0.4); }
    50%      { box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.22), inset 0 -3px 6px rgba(0, 0, 0, 0.3), 0 5px 18px rgba(244, 213, 140, 0.45), 0 3px 8px rgba(122, 30, 27, 0.6); }
  }

  .action-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-size: 0.78rem;
    color: rgba(90, 47, 28, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    min-height: 1rem;
  }

  @media (max-width: 600px) {
    .action-content { padding: 0.3rem 0.6rem; gap: 0.5rem; }
    .chapter { display: none; }
    .validate-seal { width: 40px; height: 40px; }
  }
</style>
