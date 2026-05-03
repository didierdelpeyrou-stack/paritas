<script lang="ts">
  /* ============================================================
     SideEventModal — quête secondaire / rencontre diégétique
     ============================================================
     Présente l'événement courant du store sideEvents, applique
     le choix, affiche l'outcome (succès ou échec), puis ferme.

     Inspiration : événements pop-up CK3, mais dans le grain
     paritaire (corruption, dignité, ruse).
     ============================================================ */
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { sideEvents } from '$lib/stores/sideEvents.svelte';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import type { SideEventChoice } from '../../game/types';
  import GlossaryText from '../GlossaryText.svelte';

  const ev = $derived(sideEvents.current);
  const outcome = $derived(sideEvents.lastOutcome);
  const dominantTrait = $derived(rebirth.state?.dominantTrait ?? 'pragmatique');

  function isLocked(c: SideEventChoice): boolean {
    return !!c.requiresTrait && c.requiresTrait !== dominantTrait;
  }

  function pick(c: SideEventChoice) {
    if (isLocked(c)) return;
    sideEvents.resolve(c);
  }

  function close() {
    sideEvents.dismiss();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && outcome) close();
  }
</script>

<svelte:window onkeydown={onKey} />

{#if ev}
  <!-- Phase 1 : présentation de l'événement + choix -->
  <div class="side-backdrop" in:fade={{ duration: 200 }} out:fade={{ duration: 160 }}
    role="presentation"
  ></div>
  <div class="side-card"
    in:fly={{ y: 16, duration: 280, easing: cubicOut }}
    out:fly={{ y: 16, duration: 200, easing: cubicOut }}
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-labelledby="side-title"
  >
    <header class="side-head">
      <span class="side-tag">Quête secondaire</span>
      <h2 id="side-title">{ev.title}</h2>
      {#if ev.subtitle}
        <p class="side-sub">{ev.subtitle}</p>
      {/if}
    </header>

    <div class="side-setup">
      <GlossaryText text={ev.setup} />
    </div>

    <ul class="side-choices">
      {#each ev.choices as c (c.id)}
        {@const locked = isLocked(c)}
        {@const failProb = c.failProbability ?? 0}
        <li>
          <button type="button" class="side-choice"
            class:locked
            disabled={locked}
            onclick={() => pick(c)}
          >
            <span class="ch-text">{c.text}</span>
            {#if c.intent}
              <span class="ch-intent">{c.intent}</span>
            {/if}
            {#if failProb > 0}
              <span class="ch-risk" title={`Probabilité d'échec : ${Math.round(failProb * 100)}%`}>
                ⚠ Risque {Math.round(failProb * 100)}%
              </span>
            {/if}
            {#if locked && c.requiresTrait}
              <span class="ch-lock">Réservé au trait <b>{c.requiresTrait}</b></span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  </div>

{:else if outcome}
  <!-- Phase 2 : résolution / outcome -->
  <div class="side-backdrop" in:fade={{ duration: 200 }} out:fade={{ duration: 160 }}
    onclick={close} role="presentation"
  ></div>
  <div class="side-card outcome-card"
    class:success={outcome.success}
    class:failure={!outcome.success}
    in:fly={{ y: 16, duration: 280, easing: cubicOut }}
    out:fly={{ y: 16, duration: 200, easing: cubicOut }}
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-labelledby="outcome-title"
  >
    <header class="side-head">
      <span class="side-tag" data-outcome={outcome.success ? 'ok' : 'ko'}>
        {outcome.success ? 'Résolution' : 'Conséquence imprévue'}
      </span>
      <h2 id="outcome-title">{outcome.success ? '✓ Tu as su jouer' : '✗ Le grain de sable'}</h2>
    </header>

    <div class="side-setup outcome-text">
      <GlossaryText text={outcome.text} />
    </div>

    <div class="outcome-actions">
      <button type="button" class="outcome-btn" onclick={close}>
        Continuer
      </button>
    </div>
  </div>
{/if}

<style>
  .side-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(13, 16, 20, 0.78);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 80;
  }

  .side-card {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 81;
    width: min(560px, calc(100vw - 2rem));
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    background:
      repeating-linear-gradient(0deg,
        rgba(180, 140, 90, 0.04) 0,
        rgba(180, 140, 90, 0.04) 1px,
        transparent 1px,
        transparent 5px),
      linear-gradient(180deg, #2A1A0E 0%, #1A1108 100%);
    border: 1px solid #C9B26A;
    border-radius: 0.6rem;
    box-shadow:
      0 16px 48px rgba(0, 0, 0, 0.65),
      inset 0 1px 0 rgba(244, 213, 140, 0.10);
    color: #F4EFE2;
    padding: 1.4rem 1.4rem 1.2rem;
  }

  .side-head { margin-bottom: 0.85rem; }

  .side-tag {
    display: inline-block;
    padding: 0.1rem 0.55rem;
    background: rgba(201, 178, 106, 0.16);
    border: 1px solid rgba(201, 178, 106, 0.45);
    border-radius: 999px;
    color: #C9B26A;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.45rem;
  }
  .side-tag[data-outcome='ok'] {
    background: rgba(58, 107, 71, 0.18);
    border-color: rgba(58, 107, 71, 0.55);
    color: #7BCBA1;
  }
  .side-tag[data-outcome='ko'] {
    background: rgba(176, 24, 30, 0.16);
    border-color: rgba(176, 24, 30, 0.55);
    color: #E08F92;
  }

  .side-card h2 {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.35rem;
    color: #F4D58C;
    margin: 0 0 0.2rem 0;
    letter-spacing: 0.02em;
  }

  .side-sub {
    margin: 0;
    color: rgba(244, 239, 226, 0.65);
    font-style: italic;
    font-size: 0.82rem;
  }

  .side-setup {
    font-family: 'Source Serif 4', Georgia, serif;
    color: #ede4c9;
    line-height: 1.55;
    font-size: 0.92rem;
    margin-bottom: 1rem;
    white-space: pre-line;
  }

  .outcome-text {
    border-left: 3px solid rgba(201, 178, 106, 0.4);
    padding-left: 0.9rem;
  }

  .side-choices {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .side-choice {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
    width: 100%;
    text-align: left;
    padding: 0.7rem 0.85rem;
    background: rgba(201, 178, 106, 0.06);
    border: 1px solid rgba(201, 178, 106, 0.3);
    border-left: 3px solid rgba(201, 178, 106, 0.55);
    border-radius: 0.4rem;
    color: #F4EFE2;
    cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
  }

  .side-choice:hover:not(.locked) {
    background: rgba(201, 178, 106, 0.14);
    border-color: #C9B26A;
    border-left-color: #F4D58C;
    transform: translateX(2px);
  }

  .side-choice.locked {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ch-text {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.95rem;
    line-height: 1.35;
    color: #F4D58C;
  }

  .ch-intent {
    font-size: 0.78rem;
    color: rgba(244, 239, 226, 0.7);
    font-style: italic;
  }

  .ch-risk {
    display: inline-block;
    margin-top: 0.18rem;
    padding: 0.05rem 0.45rem;
    background: rgba(176, 24, 30, 0.16);
    border: 1px solid rgba(176, 24, 30, 0.4);
    border-radius: 999px;
    color: #E08F92;
    font-family: 'Courier Prime', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.04em;
  }

  .ch-lock {
    font-size: 0.7rem;
    color: rgba(244, 239, 226, 0.45);
    font-style: italic;
  }
  .ch-lock b { color: var(--accent, #C9B26A); }

  .outcome-card.success { border-color: rgba(123, 203, 161, 0.6); }
  .outcome-card.failure { border-color: rgba(224, 143, 146, 0.6); }

  .outcome-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }

  .outcome-btn {
    padding: 0.55rem 1.2rem;
    background: linear-gradient(180deg, #c89b3c 0%, #a87a26 100%);
    color: #0d1014;
    border: 1px solid #c89b3c;
    border-radius: 0.35rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: filter 0.18s ease;
  }

  .outcome-btn:hover { filter: brightness(1.1); }

  @media (max-width: 600px) {
    .side-card { padding: 1rem 1rem 0.9rem; }
    .side-card h2 { font-size: 1.15rem; }
    .side-setup { font-size: 0.86rem; }
    .ch-text { font-size: 0.88rem; }
  }
</style>
