<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { onDestroy, onMount } from 'svelte';
  import type { ConsequenceRender } from '../../game/engine/consequenceEngine';
  import type { TensionAlert } from '../../game/simulation/tensions';
  import type { PlayerTrait } from '../../game/types';
  import { TRAIT_LABELS, TRAIT_ANTAGONISTS } from '../../game/narrative/personalityEngine';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import { legendaryById } from '../../game/content/legendaryCharacters';

  interface Props {
    consequence: ConsequenceRender;
    alerts?: TensionAlert[];
    onContinue: () => void;
  }
  let { consequence, alerts = [], onContinue }: Props = $props();

  /* === Commentaire du légendaire (CK3-like) ===
     Si le joueur a choisi un personnage légendaire, et que le choix
     fait bouger un trait significatif pour ce légendaire, on rend
     une note manuscrite en marge — soit d'approbation, soit de
     désaveu. Donne une présence diégétique du légendaire. */
  const legendary = $derived.by(() => {
    const id = rebirth.state?.legendaryId;
    return id ? legendaryById(id) : undefined;
  });

  function legendarySignatureTrait(): PlayerTrait | null {
    if (!legendary) return null;
    let best: PlayerTrait | null = null;
    let bestVal = 0;
    for (const [trait, value] of Object.entries(legendary.traitBonus) as Array<[PlayerTrait, number]>) {
      if (typeof value === 'number' && value > bestVal) {
        bestVal = value;
        best = trait;
      }
    }
    return best;
  }

  /* Quatre tonalités de la voix légendaire (cf. critique designer
     §Décision 4) : APPROVE (alignement), SURPASS (dépassement),
     DRIFT (s'écarte sans renier), REBUKE (trahit). Chaque tonalité
     a 3 variantes — picked déterministiquement via un hash de
     l'id du légendaire + l'id du scénario, pour stabilité par scène.

     Voix attendue : un mort qui te regarde du plus loin où il est. */
  type LegendTone = 'approve' | 'surpass' | 'drift' | 'rebuke';

  const LEGEND_LINES: Record<LegendTone, ((name: string) => string)[]> = {
    approve: [
      (n) => `${n} hocherait la tête. Tu marches dans ses pas.`,
      (n) => `${n} reconnaîtrait sa main dans la tienne, ce soir.`,
      (n) => `Sur ce geste-là, ${n} aurait signé le même.`
    ],
    surpass: [
      (n) => `Tu fais ce que ${n} n'a pas osé.`,
      (n) => `${n} s'arrêtait là. Tu vas plus loin.`,
      (n) => `${n} aurait hésité. Toi, tu as tranché.`
    ],
    drift: [
      (n) => `${n} ne te regarde plus. Tu joues sans lui.`,
      (n) => `Tu sors du sillage de ${n}. Sans bruit, mais tu en sors.`,
      (n) => `${n} aurait regardé ailleurs ce soir.`
    ],
    rebuke: [
      (n) => `${n} t'aurait désavoué. Ce n'est pas la voie qu'il avait tracée.`,
      (n) => `${n} retirerait sa signature de la tienne.`,
      (n) => `${n} aurait quitté la salle quand tu as parlé.`
    ]
  };

  /* Hash stable très simple — pour piquer une variante sans aléatoire. */
  function pickVariant(seed: string, modulo: number): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
    return Math.abs(h) % modulo;
  }

  const legendaryComment = $derived.by<{ tone: LegendTone; text: string } | null>(() => {
    if (!legendary || !consequence.traitShift) return null;
    const sig = legendarySignatureTrait();
    if (!sig) return null;
    const shift = consequence.traitShift;
    const lastName = legendary.name.split(' ').pop() ?? legendary.name;

    /* Détermine la tonalité.
       - SURPASS  : delta sur le trait signature ≥ 4 (geste fort)
       - APPROVE  : delta sur le trait signature ∈ [2..3]
       - REBUKE   : delta sur l'antagoniste du trait signature ≥ 2
       - DRIFT    : delta négatif sur le trait signature ≤ -2
       - Sinon : pas de commentaire (geste neutre). */
    let tone: LegendTone | null = null;
    if (shift.trait === sig && shift.delta >= 4) tone = 'surpass';
    else if (shift.trait === sig && shift.delta >= 2) tone = 'approve';
    else if (shift.trait === sig && shift.delta <= -2) tone = 'drift';
    else if (shift.trait === TRAIT_ANTAGONISTS[sig] && shift.delta >= 2) tone = 'rebuke';
    if (!tone) return null;

    /* Seed = legendary id + texte de la conséquence (qui change à chaque
       scène) + tonalité. Garantit qu'un même choix montre toujours la
       même variante, mais que des choix différents en montrent d'autres. */
    const seed = `${legendary.id}:${consequence.text.slice(0, 40)}:${tone}`;
    const variants = LEGEND_LINES[tone];
    const idx = pickVariant(seed, variants.length);
    return { tone, text: variants[idx](lastName) };
  });

  const alertHue: Record<TensionAlert['level'], string> = {
    info: 'border-cyan-500/40 bg-cyan-500/5 text-cyan-200',
    warning: 'border-gold/40 bg-gold/5 text-amber-200',
    critical: 'border-rose-500/40 bg-rose-500/5 text-rose-200'
  };

  /* === Révélation étagée ===
     Le texte arrive en premier, puis chaque bloc s'ajoute toutes ~360 ms.
     Cliquer n'importe où dans la carte saute la séquence et révèle tout.
     Plus de bouton « Révéler… » à deux clics — le scellement final est
     le SEUL geste rituel (cf. critique designer §Manie 2). */
  const STEP_MS = 360;
  const STEPS = 7; // mesures, headline, voix, mémoire, trait, chiffres, alertes
  let stage = $state(0);
  const timeouts: number[] = [];

  onMount(() => {
    for (let i = 1; i <= STEPS; i++) {
      timeouts.push(window.setTimeout(() => { stage = i; }, i * STEP_MS));
    }
  });

  onDestroy(() => {
    for (const t of timeouts) window.clearTimeout(t);
  });

  function revealAll() {
    for (const t of timeouts) window.clearTimeout(t);
    stage = STEPS;
  }

  const fullyRevealed = $derived(stage >= STEPS);

  /* Cliquer n'importe où dans la carte (hors sceau) = saut de
     révélation. Cliquer le sceau = sceller + continuer (même si
     la révélation n'était pas terminée — c'est le geste explicite
     du joueur, ne le force pas à cliquer 2 fois). */
  function onCardClick(e: MouseEvent) {
    /* Ignorer les clics sur le sceau lui-même (il a son propre handler). */
    const target = e.target as HTMLElement;
    if (target.closest('.wax-seal')) return;
    if (!fullyRevealed) revealAll();
  }

  function seal() {
    /* Saut éventuel de la révélation + continuation immédiate.
       UN seul clic, comme le veut la critique designer §Manie 2. */
    if (!fullyRevealed) revealAll();
    onContinue();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<article
  class="bordered-card p-5 space-y-4"
  in:fade={{ duration: 280 }}
  role="region"
  aria-label="Conséquence de ton choix — cliquer ailleurs que sur le sceau pour sauter la révélation"
  aria-live="polite"
  onclick={onCardClick}
>
  <header class="flex items-baseline justify-between gap-2">
    <div class="text-xs uppercase tracking-wider text-parchment-dim/85">Conséquence</div>
    {#if !fullyRevealed}
      <button
        type="button"
        class="reveal-skip"
        onclick={revealAll}
        aria-label="Tout révéler immédiatement"
      >tout révéler</button>
    {/if}
  </header>

  <div class="text-parchment leading-relaxed whitespace-pre-line">
    {consequence.text}
  </div>

  {#if stage >= 1 && consequence.concreteMeasures.length > 0}
    <ul class="concrete-list" in:fly={{ y: 6, duration: 320 }}>
      {#each consequence.concreteMeasures as m}
        <li>· {m}</li>
      {/each}
    </ul>
  {/if}

  {#if stage >= 2 && consequence.newspaperHeadline}
    <div
      in:fly={{ y: 6, duration: 380 }}
      class="border border-line/60 bg-ink/40 rounded-md px-3 py-2 text-xs"
    >
      <div class="uppercase tracking-wider text-parchment-dim/80">À la une</div>
      <div class="font-display text-gold-soft/90 mt-0.5">« {consequence.newspaperHeadline} »</div>
    </div>
  {/if}

  {#if stage >= 3}
    {#if consequence.innerVoice}
      <div
        in:fly={{ y: 6, duration: 380 }}
        class="border-l-2 border-violet-500/50 pl-3 italic text-sm text-violet-200/90"
      >
        {consequence.innerVoice}
      </div>
    {:else if consequence.voice}
      <div
        in:fly={{ y: 6, duration: 380 }}
        class="border-l-2 border-violet-500/50 pl-3 italic text-sm text-violet-200/90"
      >
        {consequence.voice}
      </div>
    {/if}
  {/if}

  {#if stage >= 4 && consequence.memoryLine}
    <div
      in:fly={{ y: 6, duration: 380 }}
      class="text-xs italic text-parchment-dim/85 border-t border-line/40 pt-2"
    >
      {consequence.memoryLine}
    </div>
  {/if}

  {#if stage >= 5}
    {#if consequence.traitChange}
      <div class="trait-change" in:fly={{ y: 6, duration: 380 }}>
        <span class="from">{TRAIT_LABELS[consequence.traitChange.from]}</span>
        <span class="arrow">→</span>
        <span class="to">{TRAIT_LABELS[consequence.traitChange.to]}</span>
        <span class="hint">Tu deviens autre chose.</span>
      </div>
    {:else if consequence.traitShift}
      <div class="trait-shift" in:fly={{ y: 6, duration: 380 }}>
        Trait : <b>{TRAIT_LABELS[consequence.traitShift.trait]}</b>
        <em>+{consequence.traitShift.delta}</em>
      </div>
    {/if}

    {#if legendaryComment}
      <div class="legendary-margin" data-tone={legendaryComment.tone} in:fly={{ x: 8, duration: 420 }}>
        <span class="quill" aria-hidden="true">✒</span>
        <p>{legendaryComment.text}</p>
      </div>
    {/if}
  {/if}

  {#if stage >= 6 && consequence.numericSummary}
    <div
      in:fade={{ duration: 360 }}
      class="text-xs uppercase tracking-wider text-parchment-dim/85 border-t border-line/60 pt-3"
    >
      {consequence.numericSummary}
    </div>
  {/if}

  {#if stage >= 7 && alerts.length > 0}
    <div class="space-y-1.5" in:fade={{ duration: 320 }}>
      {#each alerts as a}
        <div class="text-xs rounded-md border px-3 py-2 {alertHue[a.level]}">
          <span class="uppercase tracking-wider mr-1">⚠</span>
          {a.text}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Sceau de cire (cf. designer note §Manie 2). Un seul geste
       rituel à la fin : sceller. Pas de double clic « Révéler »/
       « Continuer ». -->
  <div class="seal-row">
    <button
      type="button"
      class="wax-seal"
      class:ready={fullyRevealed}
      onclick={seal}
      aria-label={fullyRevealed ? 'Sceller ce choix et continuer' : 'Sauter la révélation et sceller'}
      title={fullyRevealed
        ? 'Ce choix a scellé une décision. Continuer.'
        : 'Sauter la révélation pour sceller maintenant.'}
    >
      <span class="seal-stamp" aria-hidden="true">
        <!-- Sceau circulaire stylisé -->
        <svg viewBox="0 0 60 60" width="48" height="48">
          <defs>
            <radialGradient id="wax-grad" cx="38%" cy="32%">
              <stop offset="0%" stop-color="#E03A35"/>
              <stop offset="55%" stop-color="#9B2A26"/>
              <stop offset="100%" stop-color="#5A1410"/>
            </radialGradient>
          </defs>
          <!-- Bavures de cire -->
          <path d="M30 4 Q42 8 50 18 Q56 30 50 42 Q42 54 30 56 Q18 54 10 42 Q4 30 10 18 Q18 8 30 4 Z"
                fill="url(#wax-grad)"
                stroke="#3A0A09" stroke-width="0.8"/>
          <!-- Empreinte centrale : monogramme P -->
          <text x="30" y="38" text-anchor="middle"
                fill="#F4D58C"
                font-family="Cinzel, Georgia, serif"
                font-size="22" font-weight="700"
                style="text-shadow: 0 1px 0 rgba(0,0,0,0.4)">P</text>
        </svg>
      </span>
      <span class="seal-text">
        {fullyRevealed
          ? 'Sceller ce choix · Continuer'
          : 'Apposer le sceau · Sauter la révélation'}
      </span>
    </button>
  </div>
</article>

<style>
  /* === Sceau de cire (geste rituel de fin) ===
     Remplace l'ancien double bouton « Révéler… » / « Continuer »
     par un sceau unique qui ferme l'épisode. Cf. critique designer
     §Manie 2 — un seul clic, pas deux. */
  .seal-row {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px dashed rgba(201, 178, 106, 0.25);
  }

  .wax-seal {
    display: inline-flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.4rem 1.1rem 0.4rem 0.45rem;
    background: linear-gradient(180deg, #2A1A0E 0%, #1A1108 100%);
    border: 1px solid rgba(201, 178, 106, 0.35);
    border-radius: 999px;
    color: rgba(244, 213, 140, 0.65);
    cursor: pointer;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: border-color 0.2s ease, color 0.2s ease, filter 0.18s ease;
  }

  .wax-seal:hover {
    border-color: #C9B26A;
    color: #F4D58C;
    filter: brightness(1.06);
  }

  .wax-seal.ready {
    border-color: #C9B26A;
    color: #F4D58C;
    box-shadow: 0 0 0 0 rgba(201, 178, 106, 0.35);
    animation: seal-ready-pulse 2.4s ease-in-out infinite;
  }

  @keyframes seal-ready-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(201, 178, 106, 0.0); }
    50%      { box-shadow: 0 0 0 8px rgba(201, 178, 106, 0.18); }
  }

  .seal-stamp {
    display: inline-flex;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 3px rgba(122, 30, 27, 0.4));
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .wax-seal:hover .seal-stamp { transform: scale(1.06) rotate(-3deg); }
  .wax-seal:active .seal-stamp {
    transform: scale(0.96) rotate(2deg);
    filter: drop-shadow(0 1px 1px rgba(122, 30, 27, 0.6));
  }

  .seal-text { line-height: 1; }


  .trait-change {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    border: 1px solid rgba(244, 213, 139, 0.45);
    border-radius: 0.55rem;
    background: rgba(201, 154, 64, 0.1);
    padding: 0.55rem 0.7rem;
  }

  .trait-change .from {
    color: rgba(237, 228, 201, 0.55);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    text-decoration: line-through;
  }

  .trait-change .arrow {
    color: rgba(244, 213, 139, 0.7);
    font-family: 'Cinzel', Georgia, serif;
  }

  .trait-change .to {
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.95rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .trait-change .hint {
    flex-basis: 100%;
    color: rgba(237, 228, 201, 0.6);
    font-size: 0.78rem;
    font-style: italic;
  }

  .trait-shift {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: rgba(237, 228, 201, 0.7);
    font-size: 0.74rem;
  }

  .trait-shift b {
    color: #ede4c9;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-size: 0.78rem;
  }

  .trait-shift em {
    color: #aedab5;
    font-family: 'Cinzel', Georgia, serif;
    font-style: normal;
  }

  .concrete-list {
    list-style: none;
    margin: 0;
    padding: 0.55rem 0.75rem;
    border-left: 2px solid rgba(244, 213, 139, 0.45);
    background: rgba(201, 154, 64, 0.06);
    border-radius: 0 0.45rem 0.45rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.28rem;
  }

  .concrete-list li {
    color: rgba(237, 228, 201, 0.92);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.86rem;
    line-height: 1.4;
  }

  .btn-dim {
    opacity: 0.65;
    filter: saturate(0.7);
    animation: pulse-cta 1.6s ease-in-out infinite;
  }

  .btn-dim:hover {
    opacity: 0.95;
    animation: none;
  }

  @keyframes pulse-cta {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(244, 213, 139, 0);
    }
    50% {
      box-shadow: 0 0 0 4px rgba(244, 213, 139, 0.2);
    }
  }

  .reveal-skip {
    color: rgba(244, 213, 139, 0.65);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: underline;
    text-underline-offset: 3px;
    background: transparent;
    border: 0;
    padding: 0.15rem 0.25rem;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .reveal-skip:hover {
    color: #f4d58b;
  }

  /* === Commentaire du légendaire en marge (CK3-like) === */
  .legendary-margin {
    display: grid;
    grid-template-columns: 1.6rem 1fr;
    gap: 0.55rem;
    align-items: start;
    border-left: 2px solid rgba(244, 213, 139, 0.55);
    background: rgba(201, 154, 64, 0.06);
    padding: 0.5rem 0.7rem;
    border-radius: 0 0.45rem 0.45rem 0;
  }

  .legendary-margin[data-tone='rebuke'] {
    border-left-color: rgba(220, 38, 38, 0.55);
    background: rgba(127, 29, 29, 0.12);
  }

  /* SURPASS — le légendaire dépassé. Doré plus chaud, halo discret. */
  .legendary-margin[data-tone='surpass'] {
    border-left-color: #F4D58C;
    background: rgba(244, 213, 140, 0.10);
    box-shadow: -1px 0 0 0 rgba(244, 213, 140, 0.3);
  }

  /* DRIFT — l'écart silencieux. Désaturé, plus froid. */
  .legendary-margin[data-tone='drift'] {
    border-left-color: rgba(125, 125, 138, 0.55);
    background: rgba(60, 60, 70, 0.12);
    color: rgba(180, 180, 195, 0.9);
  }

  .legendary-margin .quill {
    color: rgba(244, 213, 139, 0.7);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.95rem;
    line-height: 1;
    margin-top: 0.18rem;
  }

  .legendary-margin[data-tone='rebuke'] .quill {
    color: rgba(252, 165, 165, 0.85);
  }
  .legendary-margin[data-tone='surpass'] .quill {
    color: #F4D58C;
  }
  .legendary-margin[data-tone='drift'] .quill {
    color: rgba(180, 180, 195, 0.7);
  }
  .legendary-margin[data-tone='drift'] p {
    color: rgba(190, 190, 205, 0.75);
  }

  .legendary-margin p {
    margin: 0;
    color: rgba(237, 228, 201, 0.85);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.84rem;
    font-style: italic;
    line-height: 1.4;
  }
</style>
