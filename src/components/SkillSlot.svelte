<script lang="ts">
  /* ============================================================
     SkillSlot.svelte — tirage façon slot machine
     Révèle le brut avant d'ajouter compétence et bonus.
     ============================================================ */
  import { fade, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import type { RollOutcome, Bonus } from '$lib/game/dice';

  interface Props {
    open: boolean;
    skillLabel: string;
    skillValue: number;
    dc: number;
    bonuses: Bonus[];
    rolling: boolean;
    outcome: RollOutcome | null;
    onClose: () => void;
  }

  type DigitKey = 'ones' | 'tens' | 'hundreds';

  let { open, skillLabel, skillValue, dc, bonuses, rolling, outcome, onClose }: Props = $props();
  let skillContrib = $derived(Math.round(skillValue / 2));
  let bonusTotal = $derived(bonuses.reduce((a, b) => a + b.v, 0));
  let spin = $state({ hundreds: 0, tens: 0, ones: 0 });
  let revealed = $state<Set<DigitKey>>(new Set());
  let showFinal = $state(false);
  let lastOutcomeRoll: number | null = null;
  let timers: number[] = [];

  const skillIcons: Record<string, string> = {
    negociation: '⚖',
    politique: '♟',
    baratin: '✒',
    production: '▦',
    mobilisation: '✊',
    expertise: '◈'
  };

  function clearTimers() {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
  }

  function digitsFor(roll: number) {
    const clamped = Math.max(1, Math.min(100, roll));
    return {
      hundreds: clamped === 100 ? 1 : 0,
      tens: clamped === 100 ? 0 : Math.floor(clamped / 10),
      ones: clamped === 100 ? 0 : clamped % 10
    };
  }

  function resetReveal() {
    clearTimers();
    revealed = new Set();
    showFinal = false;
  }

  function revealDigit(key: DigitKey) {
    revealed = new Set([...revealed, key]);
  }

  function startReveal(roll: number) {
    resetReveal();
    spin = digitsFor(roll);
    const hasHundreds = roll === 100;
    timers = [
      window.setTimeout(() => revealDigit('ones'), 160),
      window.setTimeout(() => revealDigit('tens'), 560),
      window.setTimeout(() => {
        if (hasHundreds) revealDigit('hundreds');
      }, 960),
      window.setTimeout(() => {
        showFinal = true;
      }, hasHundreds ? 1380 : 1020)
    ];
  }

  function digitValue(key: DigitKey) {
    if (!outcome || !revealed.has(key)) return spin[key];
    return digitsFor(outcome.roll)[key];
  }

  function reelState(key: DigitKey) {
    if (!outcome) return rolling ? 'spin' : 'idle';
    return revealed.has(key) ? 'locked' : 'spin';
  }

  function rawLabel() {
    if (!outcome) return '...';
    if (!showFinal) return '...';
    return String(outcome.roll);
  }

  $effect(() => {
    if (!open) return;

    if (rolling) {
      resetReveal();
      const interval = window.setInterval(() => {
        spin = {
          hundreds: Math.random() > 0.985 ? 1 : 0,
          tens: Math.floor(Math.random() * 10),
          ones: Math.floor(Math.random() * 10)
        };
      }, 70);

      return () => window.clearInterval(interval);
    }
  });

  $effect(() => {
    if (!open || !outcome || outcome.roll === lastOutcomeRoll) return;
    lastOutcomeRoll = outcome.roll;
    startReveal(outcome.roll);
  });

  $effect(() => {
    if (open) return;
    resetReveal();
    lastOutcomeRoll = null;
  });
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4
              backdrop-blur-sm bg-ink/85"
       class:bg-amber-500={outcome?.jackpot}
       class:bg-opacity-30={outcome?.jackpot}
       class:bg-red-700={outcome?.epicFail}
       in:fade={{ duration: 200 }}>
    <div class="slot-shell" in:scale={{ duration: 400, easing: backOut, start: 0.6 }}>
      <div class="slot-header">
        <div class="slot-label">Tirage de compétence</div>
        <div class="dc-orb">
          <span>DC</span>
          <strong>{dc}</strong>
        </div>
      </div>

      <div class="skill-title">
        <span class="skill-icon">{skillIcons[skillLabel] ?? '◈'}</span>
        <span>{skillLabel}</span>
      </div>

      <div class="slot-stage" class:success={outcome?.success} class:fail={outcome && !outcome.success}>
        <div class="slot-topline">
          <span class:active={revealed.has('ones')}>unités</span>
          <span class:active={revealed.has('tens')}>dizaines</span>
          <span class:active={revealed.has('hundreds')}>centaine</span>
        </div>

        <div class="reels" aria-label="Tirage façon machine à sous">
          <div class="reel hundreds" class:hidden={!rolling && !outcome?.jackpot && !(outcome?.roll === 100)} data-state={reelState('hundreds')}>
            <span>{digitValue('hundreds')}</span>
          </div>
          <div class="reel tens" data-state={reelState('tens')}>
            <span>{digitValue('tens')}</span>
          </div>
          <div class="reel ones" data-state={reelState('ones')}>
            <span>{digitValue('ones')}</span>
          </div>
        </div>

        <div class="raw-result" class:revealed={showFinal}>
          <small>tirage brut</small>
          <strong>{rawLabel()}</strong>
        </div>
      </div>

      <div class="modifier-rail">
        <span class="mod-chip main">brut</span>
        <span class="mod-chip good">+{outcome?.skillContrib ?? skillContrib} compétence</span>
        {#each bonuses as b}
          <span class="mod-chip" class:good={b.v >= 0} class:bad={b.v < 0}>
            {b.v >= 0 ? '+' : ''}{b.v} {b.src}
          </span>
        {/each}
      </div>

      {#if outcome && showFinal}
        <div class="total-line">
          <span>{outcome.roll}</span>
          <small>+ {outcome.skillContrib + bonusTotal}</small>
          <strong>= {outcome.total}</strong>
        </div>

        <div class="verdict"
             class:success={outcome.success && !outcome.jackpot}
             class:fail={!outcome.success && !outcome.epicFail}
             class:jackpot={outcome.jackpot}
             class:critical={outcome.epicFail}>
          {outcome.jackpot ? 'JACKPOT' : outcome.epicFail ? 'CRITIQUE' : outcome.success ? 'RÉUSSITE' : 'ÉCHEC'}
        </div>

        <button class="btn-primary mt-5" onclick={onClose}>Continuer</button>
      {:else}
        <div class="rolling-caption">{outcome ? 'Lecture du tirage...' : 'Les rouleaux tournent...'}</div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .slot-shell {
    position: relative;
    width: min(560px, 94vw);
    padding: 1.25rem 1.25rem 1.35rem;
    text-align: center;
    border: 1px solid rgba(201, 154, 64, 0.42);
    border-radius: 18px;
    background:
      radial-gradient(circle at 50% 24%, rgba(201, 154, 64, 0.18), transparent 30%),
      linear-gradient(180deg, rgba(28, 31, 39, 0.97), rgba(11, 13, 18, 0.98));
    box-shadow:
      0 28px 90px rgba(0, 0, 0, 0.62),
      inset 0 1px 0 rgba(255, 240, 190, 0.1),
      inset 0 0 80px rgba(0, 0, 0, 0.42);
    overflow: hidden;
  }
  .slot-shell::after {
    content: "";
    position: absolute;
    top: 0;
    left: 14%;
    width: 72%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 230, 165, 0.75), transparent);
  }
  .slot-header {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    margin-bottom: 0.6rem;
  }
  .slot-label {
    grid-column: 1 / -1;
    color: rgba(237, 228, 201, 0.68);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }
  .dc-orb {
    grid-column: 2;
    width: 82px;
    height: 82px;
    margin-top: 0.45rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 1px solid rgba(255, 218, 140, 0.58);
    background:
      radial-gradient(circle at 50% 38%, rgba(255, 229, 154, 0.24), transparent 34%),
      linear-gradient(180deg, rgba(48, 34, 21, 0.96), rgba(16, 13, 12, 0.96));
    box-shadow:
      0 0 32px rgba(201, 154, 64, 0.28),
      inset 0 0 0 7px rgba(201, 154, 64, 0.08);
  }
  .dc-orb span,
  .dc-orb strong {
    display: block;
    font-family: 'Cinzel', Georgia, serif;
    line-height: 1;
  }
  .dc-orb span {
    color: rgba(237, 228, 201, 0.62);
    font-size: 0.7rem;
    letter-spacing: 0.16em;
  }
  .dc-orb strong {
    margin-top: -0.6rem;
    color: #ffd36d;
    font-size: 2rem;
    text-shadow: 0 0 16px rgba(255, 197, 79, 0.38);
  }
  .skill-title {
    position: relative;
    z-index: 2;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    color: #f7c95c;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.9rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .skill-icon {
    font-size: 1.5rem;
    letter-spacing: 0;
  }
  .slot-stage {
    position: relative;
    z-index: 1;
    width: min(430px, 88vw);
    min-height: 236px;
    margin: 0 auto;
    padding: 1rem 0.8rem 1.2rem;
    border: 1px solid rgba(255, 214, 132, 0.18);
    border-radius: 12px;
    background:
      linear-gradient(90deg, rgba(255, 214, 132, 0.09), transparent 17%, transparent 83%, rgba(255, 214, 132, 0.09)),
      linear-gradient(180deg, rgba(7, 9, 13, 0.78), rgba(24, 18, 20, 0.86));
    box-shadow:
      inset 0 0 40px rgba(0, 0, 0, 0.48),
      0 18px 42px rgba(0, 0, 0, 0.28);
  }
  .slot-stage::before,
  .slot-stage::after {
    content: "";
    position: absolute;
    left: 8%;
    right: 8%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 214, 132, 0.42), transparent);
  }
  .slot-stage::before { top: 86px; }
  .slot-stage::after { top: 158px; }
  .slot-stage.success {
    border-color: rgba(72, 214, 146, 0.32);
  }
  .slot-stage.fail {
    border-color: rgba(255, 95, 95, 0.3);
  }
  .slot-topline {
    display: flex;
    justify-content: center;
    gap: 0.7rem;
    min-height: 18px;
    color: rgba(237, 228, 201, 0.42);
    font-size: 0.63rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .slot-topline span {
    transition: color 0.2s, text-shadow 0.2s;
  }
  .slot-topline span.active {
    color: #ffd36d;
    text-shadow: 0 0 12px rgba(255, 211, 109, 0.42);
  }
  .reels {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: clamp(0.45rem, 3vw, 0.75rem);
    height: 118px;
    margin-top: 0.55rem;
  }
  .reel {
    position: relative;
    width: clamp(70px, 20vw, 94px);
    height: 104px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 229, 154, 0.32);
    border-radius: 8px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 22%, transparent 78%, rgba(0, 0, 0, 0.28)),
      linear-gradient(180deg, #efe5ca, #a58b60 48%, #241b16 49%, #efe1be 52%, #6b5439);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.28),
      inset 0 -12px 22px rgba(0, 0, 0, 0.28),
      0 12px 24px rgba(0, 0, 0, 0.32);
    overflow: hidden;
    transition: opacity 0.24s, transform 0.24s;
  }
  .reel.hidden {
    opacity: 0.25;
    transform: scale(0.9);
  }
  .reel::before,
  .reel::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 24px;
    z-index: 2;
    pointer-events: none;
  }
  .reel::before {
    top: 0;
    background: linear-gradient(180deg, rgba(13, 16, 20, 0.46), transparent);
  }
  .reel::after {
    bottom: 0;
    background: linear-gradient(0deg, rgba(13, 16, 20, 0.5), transparent);
  }
  .reel span {
    color: #15100c;
    font-family: 'Cinzel', Georgia, serif;
    font-size: clamp(3rem, 15vw, 4.35rem);
    font-weight: 900;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    text-shadow:
      0 1px 0 rgba(255, 255, 255, 0.42),
      0 0 14px rgba(255, 224, 144, 0.32);
  }
  .reel[data-state="spin"] span {
    animation: reel-spin 0.18s linear infinite;
    filter: blur(1px);
  }
  .reel[data-state="locked"] {
    animation: reel-lock 0.35s cubic-bezier(0.18, 0.9, 0.24, 1.25);
    border-color: rgba(255, 211, 109, 0.66);
  }
  @keyframes reel-spin {
    from { transform: translateY(-18px); opacity: 0.62; }
    to { transform: translateY(18px); opacity: 1; }
  }
  @keyframes reel-lock {
    0% { transform: translateY(-10px) scale(0.96); filter: brightness(1.5); }
    100% { transform: translateY(0) scale(1); filter: brightness(1); }
  }
  .raw-result {
    margin: 0.65rem auto 0;
    min-width: 104px;
    display: inline-grid;
    gap: 0.1rem;
    padding: 0.35rem 0.9rem 0.45rem;
    border: 1px solid rgba(200, 155, 60, 0.38);
    border-radius: 8px;
    background: rgba(13, 16, 20, 0.82);
    opacity: 0.72;
    transform: translateY(4px);
  }
  .raw-result.revealed {
    opacity: 1;
    transform: translateY(0);
    animation: raw-pop 0.36s cubic-bezier(0.18, 0.9, 0.24, 1.25);
  }
  .raw-result small {
    color: rgba(237, 228, 201, 0.5);
    font-size: 0.62rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }
  .raw-result strong {
    color: #ffd36d;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.35rem;
    line-height: 1;
  }
  @keyframes raw-pop {
    0% { transform: translateY(10px) scale(0.88); }
    100% { transform: translateY(0) scale(1); }
  }
  .modifier-rail {
    position: relative;
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.45rem;
    margin: 0.8rem auto 0;
    max-width: 450px;
  }
  .mod-chip {
    min-height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.35rem 0.65rem;
    border: 1px solid rgba(237, 228, 201, 0.15);
    border-radius: 999px;
    background: rgba(6, 8, 12, 0.78);
    color: rgba(237, 228, 201, 0.72);
    font-size: 0.78rem;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }
  .mod-chip.main {
    color: #ffd36d;
    border-color: rgba(255, 211, 109, 0.36);
  }
  .mod-chip.good {
    color: #8ef0ba;
    border-color: rgba(74, 222, 128, 0.32);
  }
  .mod-chip.bad {
    color: #fca5a5;
    border-color: rgba(248, 113, 113, 0.35);
  }
  .total-line {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.55rem;
    margin-top: 1rem;
    color: #f7d88b;
    font-family: 'Cinzel', Georgia, serif;
    animation: total-in 0.34s ease both;
  }
  .total-line span,
  .total-line small,
  .total-line strong {
    line-height: 1;
  }
  .total-line span {
    font-size: 1.25rem;
  }
  .total-line small {
    color: rgba(237, 228, 201, 0.62);
    font-size: 0.95rem;
  }
  .total-line strong {
    font-size: 1.55rem;
    color: #ffd36d;
  }
  @keyframes total-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .verdict {
    margin-top: 0.6rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: clamp(2.6rem, 8vw, 4.8rem);
    font-weight: 800;
    line-height: 1;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-shadow: 0 4px 0 #000, 0 0 24px currentColor;
    animation: verdict-in 0.42s cubic-bezier(0.18, 0.9, 0.24, 1.18) both;
  }
  .verdict.success { color: #7ff0b2; }
  .verdict.fail { color: #ff8c8c; }
  .verdict.jackpot { color: #ffd36d; }
  .verdict.critical { color: #fb7185; }
  @keyframes verdict-in {
    0% { opacity: 0; transform: translateY(10px) scale(0.9); filter: blur(4px); }
    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  }
  .rolling-caption {
    margin-top: 1rem;
    color: rgba(237, 228, 201, 0.58);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.8rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  @media (max-width: 480px) {
    .slot-shell {
      padding: 1rem 0.75rem 1.1rem;
    }
    .dc-orb {
      width: 70px;
      height: 70px;
    }
    .dc-orb strong {
      font-size: 1.7rem;
    }
    .slot-stage {
      width: min(320px, 92vw);
      min-height: 224px;
      padding-inline: 0.55rem;
    }
    .slot-topline {
      gap: 0.42rem;
      font-size: 0.58rem;
    }
  }
</style>
