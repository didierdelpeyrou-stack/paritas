<script lang="ts">
  /* ============================================================
     CockpitStatusBar — barre d'état top du cockpit (vague α-bis V2)
     ============================================================
     Date/ère/mood/notifications/contrôles. Hauteur fixe pour
     viewport-fit. Burger mobile pour ouvrir les tabs collapsées.
     ============================================================ */
  import type { EraId, SceneMood } from '../../game/types';
  import { sfx } from '../../game/audio/sfx';
  import CockpitIcon from './CockpitIcon.svelte';

  interface Props {
    turn: number;
    era: EraId | null;
    mood: SceneMood | null;
    onOpenSettings?: () => void;
    onToggleClassic?: () => void;
    onOpenMobileMenu?: () => void;
    showMobileBurger?: boolean;
    /** Total tours (100 par défaut). */
    totalTurns?: number;
    /** Bouton Actions (orchestrator drawer). */
    onOpenActions?: () => void;
    actionsThisTurn?: number;
    maxActions?: number;
    crisisActive?: boolean;
    /** Bouton Valider (cachet de cire). */
    pendingValidation?: boolean;
    onValidate?: () => void;
  }
  let {
    turn, era, mood,
    onOpenSettings, onToggleClassic, onOpenMobileMenu,
    showMobileBurger = false,
    totalTurns = 100,
    onOpenActions, actionsThisTurn = 0, maxActions = 2, crisisActive = false,
    pendingValidation = false, onValidate
  }: Props = $props();

  const ERA_LABEL: Record<string, string> = {
    revolution: 'Révolution',
    xixe: 'XIXe siècle',
    belle_epoque: 'Belle Époque',
    entre_deux_guerres: 'Entre-deux-guerres',
    reconstruction: 'Reconstruction',
    guerre_froide: 'Guerre froide',
    trente_glorieuses: 'Trente Glorieuses',
    crise: 'Crises 1973+',
    mitterrand: 'Mitterrand',
    cohabitations: 'Cohabitations',
    sarkozy: 'Sarkozy',
    hollande: 'Hollande',
    macron_i: 'Macron I',
    macron_ii: 'Macron II',
    present: 'Présent'
  };

  const MOOD_LABEL: Record<string, string> = {
    calme: 'Calme',
    tendu: 'Tendu',
    grave: 'Grave',
    euphorique: 'Euphorique',
    melancolique: 'Mélancolique'
  };

  let musicOn = $state(sfx.isMusicEnabled());
  $effect(() => sfx.onMusicChange((v) => (musicOn = v)));

  function toggleMusic() {
    sfx.toggleMusic();
  }
</script>

<header class="status-bar">
  <div class="status-left">
    {#if showMobileBurger}
      <button type="button" class="status-btn burger"
        onclick={() => onOpenMobileMenu?.()}
        title="Ouvrir le menu" aria-label="Ouvrir le menu">
        <span class="burger-bars" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
      </button>
    {/if}
    <span class="clock-wrap" aria-hidden="true">
      <CockpitIcon name="horloge" size={20} />
    </span>
    <span class="date-era">
      <span class="turn">Tour <strong>{turn}</strong>/{totalTurns}</span>
      {#if era}
        <span class="era-sep">·</span>
        <span class="era">{ERA_LABEL[era] ?? era}</span>
      {/if}
    </span>
  </div>

  <div class="status-center">
    {#if mood}
      <span class="mood-chip mood-{mood}" title="Climat émotionnel du scénario">
        <span class="mood-dot" aria-hidden="true"></span>
        <span class="mood-label">{MOOD_LABEL[mood]}</span>
      </span>
    {/if}
  </div>

  <div class="status-right">
    <!-- Bouton Actions (orchestrator) — déplacé depuis l'ancienne barre d'action -->
    {#if onOpenActions}
      <button type="button" class="actions-btn" class:crisis={crisisActive}
        onclick={() => onOpenActions?.()}
        title="Ouvrir les actions disponibles ce tour">
        <CockpitIcon name="rouage" size={14} />
        <span class="actions-label">Actions</span>
        <span class="actions-count">{actionsThisTurn}/{maxActions}</span>
        {#if crisisActive}
          <span class="crisis-dot" aria-label="Crise active"></span>
        {/if}
      </button>
    {/if}

    <!-- Bouton Valider — cachet de cire compact -->
    {#if onValidate}
      <button type="button" class="validate-seal" class:pulsing={pendingValidation}
        onclick={() => onValidate?.()}
        disabled={!pendingValidation}
        title={pendingValidation ? 'Valider ton choix' : 'Sélectionne d\'abord un choix'}
        aria-label="Valider">
        ●
      </button>
    {/if}

    <button type="button" class="status-btn" onclick={toggleMusic}
      title={musicOn ? 'Couper la musique' : 'Lancer la musique'}
      aria-label={musicOn ? 'Couper la musique' : 'Lancer la musique'}
      aria-pressed={musicOn}>
      <CockpitIcon name="note" size={16} />
    </button>
    {#if onToggleClassic}
      <button type="button" class="status-btn" onclick={onToggleClassic}
        title="Basculer vers l'interface classique"
        aria-label="Basculer vers l'interface classique">
        ⊟
      </button>
    {/if}
    {#if onOpenSettings}
      <button type="button" class="status-btn" onclick={onOpenSettings}
        title="Ouvrir les réglages" aria-label="Réglages">
        <CockpitIcon name="rouage" size={16} />
      </button>
    {/if}
  </div>
</header>

<style>
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    padding: 0.5rem 0.95rem;
    background: linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
    border-bottom: 1px solid rgba(201, 178, 106, 0.28);
    box-shadow:
      inset 0 1px 0 rgba(244, 213, 140, 0.05),
      0 1px 3px rgba(0, 0, 0, 0.4);
    color: #F4EFE2;
    font-family: 'Cinzel', Georgia, serif;
    height: 48px;
    flex-shrink: 0;
  }

  .status-left, .status-right {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    min-width: 0;
  }

  .status-center {
    flex: 1 1 auto;
    display: flex;
    justify-content: center;
    min-width: 0;
  }

  .clock-wrap {
    display: inline-flex;
    align-items: center;
    color: #C9B26A;
  }

  .date-era {
    display: inline-flex;
    align-items: baseline;
    gap: 0.4rem;
    font-size: 0.85rem;
  }

  .turn {
    color: rgba(244, 239, 226, 0.85);
    font-weight: 400;
    letter-spacing: 0.04em;
  }

  .turn strong {
    color: #F4D58C;
    font-weight: 700;
    margin-left: 0.1rem;
  }

  .era-sep {
    color: rgba(201, 178, 106, 0.5);
  }

  .era {
    color: rgba(244, 239, 226, 0.85);
    letter-spacing: 0.04em;
  }

  .mood-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.22rem 0.7rem;
    border-radius: 999px;
    background: rgba(201, 178, 106, 0.10);
    border: 1px solid rgba(201, 178, 106, 0.30);
    font-size: 0.78rem;
    color: #F4EFE2;
    transition: box-shadow 0.4s ease, border-color 0.4s ease;
  }

  .mood-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #C9B26A;
    box-shadow: 0 0 8px rgba(244, 213, 140, 0.6);
  }

  .mood-label {
    text-transform: uppercase;
    letter-spacing: 0.10em;
    font-weight: 600;
  }

  /* Glow par mood — sobre, pas hyperactif */
  .mood-calme        { box-shadow: 0 0 14px rgba(0, 200, 220, 0.10); }
  .mood-calme .mood-dot       { background: #5CB6C8; box-shadow: 0 0 8px rgba(92, 182, 200, 0.7); }

  .mood-tendu        { box-shadow: 0 0 14px rgba(217, 130, 28, 0.18); border-color: rgba(217, 130, 28, 0.4); }
  .mood-tendu .mood-dot       { background: #D9821C; box-shadow: 0 0 8px rgba(217, 130, 28, 0.7); animation: tendu-pulse 1.6s ease-in-out infinite; }

  .mood-grave        { box-shadow: 0 0 14px rgba(180, 40, 40, 0.18); border-color: rgba(180, 40, 40, 0.35); }
  .mood-grave .mood-dot       { background: #B0181E; box-shadow: 0 0 8px rgba(176, 24, 30, 0.7); }

  .mood-euphorique   { box-shadow: 0 0 16px rgba(244, 213, 140, 0.22); border-color: rgba(244, 213, 140, 0.45); }
  .mood-euphorique .mood-dot  { background: #F4D58C; box-shadow: 0 0 10px rgba(244, 213, 140, 0.8); }

  .mood-melancolique { box-shadow: 0 0 14px rgba(120, 80, 180, 0.18); border-color: rgba(120, 80, 180, 0.35); }
  .mood-melancolique .mood-dot { background: #8E64C0; box-shadow: 0 0 8px rgba(142, 100, 192, 0.7); }

  @keyframes tendu-pulse {
    0%, 100% { opacity: 0.85; transform: scale(1); }
    50%      { opacity: 1; transform: scale(1.18); }
  }

  .status-btn {
    background: transparent;
    border: 1px solid rgba(201, 178, 106, 0.30);
    color: #F4D58C;
    width: 32px;
    height: 32px;
    border-radius: 0.35rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.95rem;
    cursor: pointer;
    transition:
      background 0.18s ease,
      border-color 0.18s ease,
      transform 0.18s cubic-bezier(0.34, 1.2, 0.64, 1),
      color 0.18s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .status-btn:hover,
  .status-btn:focus-visible {
    background: rgba(201, 178, 106, 0.14);
    border-color: #C9B26A;
    color: #F4D58C;
    transform: translateY(-1px);
    outline: none;
  }

  .status-btn[aria-pressed="true"] {
    background: rgba(201, 178, 106, 0.18);
    border-color: #C9B26A;
  }

  .burger-bars {
    display: inline-flex;
    flex-direction: column;
    gap: 3px;
    width: 16px;
  }
  .burger-bars span {
    display: block;
    height: 2px;
    background: currentColor;
    border-radius: 1px;
  }

  /* === Boutons rapatriés depuis l'ancienne barre d'action === */

  .actions-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.65rem;
    background: linear-gradient(180deg, #5A2F1C 0%, #3D2615 100%);
    border: 1px solid #C9B26A;
    color: #F4D58C;
    border-radius: 0.35rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: filter 0.18s ease, transform 0.18s ease;
    height: 32px;
  }

  .actions-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

  .actions-count {
    background: rgba(244, 213, 140, 0.18);
    padding: 0.05rem 0.4rem;
    border-radius: 999px;
    font-family: 'Courier Prime', monospace;
    font-size: 0.65rem;
  }

  .actions-btn.crisis {
    border-color: #E08F92;
    box-shadow: 0 0 12px rgba(176, 24, 30, 0.45);
    animation: btn-crisis 1.6s ease-in-out infinite;
  }

  .crisis-dot {
    position: absolute;
    top: -3px; right: -3px;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #B0181E;
    box-shadow: 0 0 6px rgba(176, 24, 30, 0.8);
    animation: btn-crisis-dot 1.2s ease-in-out infinite;
  }

  @keyframes btn-crisis {
    0%, 100% { box-shadow: 0 0 12px rgba(176, 24, 30, 0.35); }
    50%      { box-shadow: 0 0 18px rgba(176, 24, 30, 0.6); }
  }
  @keyframes btn-crisis-dot {
    0%, 100% { transform: scale(1); opacity: 0.85; }
    50%      { transform: scale(1.3); opacity: 1; }
  }

  /* Cachet de cire compact dans la status bar */
  .validate-seal {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #9B2A26 0%, #7A1E1B 60%, #5A1410 100%);
    border: 2px solid #5A1410;
    color: #F4D58C;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow:
      inset 0 1px 3px rgba(255, 255, 255, 0.2),
      inset 0 -2px 4px rgba(0, 0, 0, 0.3),
      0 2px 6px rgba(122, 30, 27, 0.4);
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
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
    0%, 100% { box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(122, 30, 27, 0.4); }
    50%      { box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.22), inset 0 -2px 4px rgba(0, 0, 0, 0.3), 0 4px 14px rgba(244, 213, 140, 0.5), 0 2px 6px rgba(122, 30, 27, 0.6); }
  }

  @media (max-width: 768px) {
    .status-bar { padding: 0.4rem 0.55rem; gap: 0.3rem; height: 44px; }
    .era { display: none; }
    .mood-label { display: none; }
    .clock-wrap { display: none; }
    .actions-label { display: none; }
  }

  @media (max-width: 480px) {
    .turn { font-size: 0.78rem; }
    .actions-count { display: none; }
  }
</style>
