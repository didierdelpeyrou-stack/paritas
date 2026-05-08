<script lang="ts">
  import { fade, fly, scale, blur } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  import type { EndingRender } from '../../game/engine/endingEngine';
  import { TRAIT_LABELS, TRAIT_BLURBS } from '../../game/narrative/personalityEngine';
  import { rebirth } from '../../game/engine/gameState.svelte';

  interface Props {
    ending: EndingRender;
    onReplay: () => void;
  }
  let { ending, onReplay }: Props = $props();

  const trait = $derived(ending.stats.finalDominantTrait);

  /* Argus UX-2 — Cérémonie épilogue en 4 actes (peak-end rule de
     Kahneman). Au lieu d'afficher tout le bilan en bloc, on séquence :
        Acte 1 — Le compte    (score 0 → final, drumroll, ~3s)
        Acte 2 — Le mandat    (objectifs apparaissent un par un)
        Acte 3 — Le verdict   (titre cinématique + texte ending)
        Acte 4 — Final        (style, stats, actions)
     prefers-reduced-motion ou clic « Passer » → saut direct à l'acte 4. */
  type Act = 1 | 2 | 3 | 4;
  let act = $state<Act>(1);
  let scoreDisplay = $state(0);
  let revealedObjectives = $state(0);

  const timers: ReturnType<typeof setTimeout>[] = [];
  let scoreRaf: number | null = null;

  function reducedMotion(): boolean {
    try {
      return (
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true ||
        document.documentElement.dataset.a11yReducedMotion === 'true'
      );
    } catch {
      return false;
    }
  }

  function jumpToFinal() {
    timers.forEach(clearTimeout);
    timers.length = 0;
    if (scoreRaf !== null) {
      cancelAnimationFrame(scoreRaf);
      scoreRaf = null;
    }
    scoreDisplay = ending.score;
    revealedObjectives = ending.objectives.length;
    act = 4;
  }

  function animateScoreTo(target: number, durationMs: number) {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic — drumroll qui ralentit en fin
      const eased = 1 - Math.pow(1 - t, 3);
      scoreDisplay = Math.round(target * eased);
      if (t < 1) {
        scoreRaf = requestAnimationFrame(tick);
      } else {
        scoreRaf = null;
        scoreDisplay = target;
      }
    };
    scoreRaf = requestAnimationFrame(tick);
  }

  /* Orchestration des actes via setTimeout. Chaque acte a une
     durée propre, on enchaîne. Le skip-button et reduced-motion
     court-circuitent toute la chaîne via jumpToFinal(). */
  onMount(() => {
    /* UX-N5 (existant) : compteur de parties terminées + profil
       d'apprentissage. Conservé tel quel. */
    try {
      const v = localStorage.getItem('paritas_played_count');
      const n = v ? parseInt(v, 10) : 0;
      const next = (Number.isFinite(n) ? n : 0) + 1;
      localStorage.setItem('paritas_played_count', String(next));
    } catch {
      /* ignore */
    }
    void import('../../game/learning/playerProfile').then(({ recordEnding }) => {
      recordEnding(ending.id);
    }).catch(() => {});

    if (reducedMotion()) {
      jumpToFinal();
      return;
    }

    /* Acte 1 — drumroll du score : 2.6s */
    animateScoreTo(ending.score, 2600);

    /* Acte 2 — passage au bilan mandat à 2.8s, puis stagger 350ms par objectif */
    timers.push(
      setTimeout(() => {
        act = 2;
        const stagger = 350;
        ending.objectives.forEach((_, i) => {
          timers.push(
            setTimeout(() => {
              revealedObjectives = i + 1;
            }, stagger * (i + 1))
          );
        });
        /* Acte 3 après que tous les objectifs soient révélés */
        const totalReveal = stagger * (ending.objectives.length + 1) + 400;
        timers.push(
          setTimeout(() => {
            act = 3;
          }, totalReveal)
        );
      }, 2800)
    );

    /* Acte 4 — final, ~2.3s après l'acte 3 (le temps de lire le verdict) */
    const finalDelay =
      2800 + 350 * (ending.objectives.length + 1) + 400 + 2300;
    timers.push(
      setTimeout(() => {
        act = 4;
      }, finalDelay)
    );
  });

  onDestroy(() => {
    timers.forEach(clearTimeout);
    if (scoreRaf !== null) cancelAnimationFrame(scoreRaf);
  });

  function statusOf(id: string): 'satisfied' | 'failed' | 'pending' {
    const item = ending.objectiveProgress.find(p => p.id === id);
    if (item?.satisfied) return 'satisfied';
    if (item?.failed) return 'failed';
    return 'pending';
  }

  /**
   * Export du journal de partie en Markdown — pensé pour le mode
   * formation paritaire : le formateur peut récupérer un compte-rendu
   * propre par stagiaire, l'imprimer ou l'archiver.
   */
  function exportJournal() {
    const s = rebirth.state;
    if (!s) return;
    const lines: string[] = [];
    lines.push(`# Paritas — Journal de partie`);
    lines.push('');
    lines.push(`**Joueur** : ${s.name || '—'}`);
    lines.push(`**Camp** : ${s.camp === 'salarie' ? 'Salarié' : 'Patronat'}`);
    lines.push(`**Tours joués** : ${ending.stats.turnsPlayed}`);
    lines.push(`**Score final** : ${ending.score}/100`);
    lines.push(`**Trait dominant** : ${TRAIT_LABELS[trait]}`);
    lines.push('');
    lines.push(`## Épilogue`);
    lines.push('');
    lines.push(`### ${ending.title}`);
    lines.push('');
    lines.push(ending.text);
    lines.push('');
    if (ending.objectives.length > 0) {
      lines.push(`## Mandat — bilan`);
      lines.push('');
      for (const o of ending.objectives) {
        const status = statusOf(o.id);
        const mark = status === 'satisfied' ? '✓' : status === 'failed' ? '✗' : '·';
        lines.push(`- **${mark} ${o.label}** — ${o.description}`);
      }
      lines.push('');
    }
    lines.push(`## Statistiques`);
    lines.push('');
    lines.push(`- Institutions construites : ${ending.stats.institutionsBuilt}`);
    lines.push(`- Compromis refusés : ${ending.stats.refusedCompromise}`);
    lines.push(`- Base trahie : ${ending.stats.betrayedBase}`);
    lines.push(`- Mouvements épuisés : ${ending.stats.exhaustedMovements}`);
    lines.push('');
    lines.push(`## Journal complet (${rebirth.log.length} entrées)`);
    lines.push('');
    for (const entry of rebirth.log) {
      lines.push(`- ${entry}`);
    }
    lines.push('');
    lines.push(`---`);
    lines.push(`*Exporté depuis Paritas le ${new Date().toLocaleDateString('fr-FR')}.*`);

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (s.name || 'partie').replace(/[^a-zA-Z0-9-_]/g, '_');
    a.download = `paritas-${safeName}-T${ending.stats.turnsPlayed}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<article class="bordered-card p-6 space-y-4 max-w-2xl mx-auto" in:fade={{ duration: 360 }}>
  {#if act < 4}
    <!-- Skip button : présent pendant la cérémonie pour les
         joueurs pressés ou en re-jouant. -->
    <button
      type="button"
      class="skip-btn"
      onclick={jumpToFinal}
      aria-label="Passer la cérémonie d'épilogue"
      in:fade={{ duration: 600, delay: 800 }}
    >
      Passer la cérémonie ↦
    </button>
  {/if}

  {#if act === 1}
    <!-- ACTE 1 — Le compte (drumroll du score) -->
    <div class="act act-count" in:fade={{ duration: 400 }}>
      <div class="text-xs uppercase tracking-wider text-parchment-dim/85 text-center mb-2">
        Épilogue · {ending.stats.turnsPlayed} tours joués
      </div>
      <div class="text-center" in:scale={{ duration: 600, start: 0.7 }}>
        <div class="font-display text-8xl text-gold leading-none drumroll">
          {scoreDisplay}<span class="text-3xl text-parchment-dim/80">/100</span>
        </div>
        <p class="text-sm italic text-parchment-dim/85 mt-3 tracking-wide">
          Score final
        </p>
      </div>
    </div>
  {:else if act === 2}
    <!-- ACTE 2 — Le mandat (objectifs un par un) -->
    <div class="act act-mandate" in:fade={{ duration: 400 }}>
      <header class="text-center space-y-1">
        <div class="font-display uppercase tracking-wider text-gold text-sm">
          Mandat — bilan
        </div>
      </header>
      <ul class="space-y-2 mt-4">
        {#each ending.objectives.slice(0, revealedObjectives) as objective, i (objective.id)}
          {@const s = statusOf(objective.id)}
          <li
            class="objective-line"
            data-status={s}
            in:fly={{ x: -16, duration: 360, delay: 0 }}
          >
            <span class="dot" aria-hidden="true">
              {#if s === 'satisfied'}✓{:else if s === 'failed'}✗{:else}·{/if}
            </span>
            <div class="min-w-0 flex-1">
              <b>{objective.label}</b>
              <small>{objective.description}</small>
            </div>
            <em>
              {#if s === 'satisfied'}atteint{:else if s === 'failed'}manqué{:else}inachevé{/if}
            </em>
          </li>
        {/each}
        {#each Array(Math.max(0, ending.objectives.length - revealedObjectives)) as _, i}
          <li class="objective-line objective-placeholder" aria-hidden="true">
            <span class="dot">·</span>
            <div class="min-w-0 flex-1"><b>...</b></div>
          </li>
        {/each}
      </ul>
    </div>
  {:else if act === 3}
    <!-- ACTE 3 — Le verdict (titre cinématique) -->
    <div class="act act-verdict" in:fade={{ duration: 500 }}>
      <div class="text-xs uppercase tracking-wider text-parchment-dim/70 text-center mb-1">
        Verdict
      </div>
      <h2
        class="font-display text-5xl text-gold text-center verdict-title"
        in:blur={{ duration: 700, amount: 8 }}
      >
        {ending.title}
      </h2>
      <p
        class="text-parchment leading-relaxed text-sm whitespace-pre-line mt-5"
        in:fade={{ duration: 700, delay: 600 }}
      >
        {ending.text}
      </p>
    </div>
  {:else}
    <!-- ACTE 4 — Final (synthèse complète + actions) -->
    <header class="text-center space-y-1" in:fade={{ duration: 360 }}>
      <div class="text-xs uppercase tracking-wider text-parchment-dim/85">
        Épilogue · {ending.stats.turnsPlayed} tours joués
      </div>
      <h2 class="font-display text-3xl text-gold">{ending.title}</h2>
    </header>

    <div class="text-center" in:fade={{ duration: 360, delay: 80 }}>
      <div class="font-display text-6xl text-gold leading-none">
        {ending.score}<span class="text-2xl text-parchment-dim/80">/100</span>
      </div>
      <p class="text-xs italic text-parchment-dim/85 mt-1">Score final</p>
    </div>

    <p
      class="text-parchment leading-relaxed text-sm whitespace-pre-line"
      in:fade={{ duration: 360, delay: 160 }}
    >
      {ending.text}
    </p>

    <div
      class="border-t border-line/60 pt-4 space-y-1.5 text-sm"
      in:fade={{ duration: 360, delay: 240 }}
    >
      <div class="font-display uppercase tracking-wider text-gold text-xs">
        Ton style — {TRAIT_LABELS[trait]}
      </div>
      <p class="italic text-parchment-dim leading-snug">
        {TRAIT_BLURBS[trait]}
      </p>
    </div>

    {#if ending.objectives.length > 0}
      <div
        class="border-t border-line/60 pt-4 space-y-2"
        in:fade={{ duration: 360, delay: 320 }}
      >
        <div class="font-display uppercase tracking-wider text-gold text-xs">
          Mandat — bilan
        </div>
        <ul class="space-y-1.5">
          {#each ending.objectives as objective}
            {@const s = statusOf(objective.id)}
            <li class="objective-line" data-status={s}>
              <span class="dot" aria-hidden="true">
                {#if s === 'satisfied'}✓{:else if s === 'failed'}✗{:else}·{/if}
              </span>
              <div class="min-w-0 flex-1">
                <b>{objective.label}</b>
                <small>{objective.description}</small>
              </div>
              <em>
                {#if s === 'satisfied'}atteint{:else if s === 'failed'}manqué{:else}inachevé{/if}
              </em>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <div
      class="grid grid-cols-2 gap-3 text-xs"
      in:fade={{ duration: 360, delay: 400 }}
    >
      <div class="rounded-md border border-line/60 p-2">
        <div class="text-parchment-dim/85 uppercase">Institutions</div>
        <div class="font-display text-gold text-lg">
          {ending.stats.institutionsBuilt}
        </div>
      </div>
      <div class="rounded-md border border-line/60 p-2">
        <div class="text-parchment-dim/85 uppercase">Compromis refusés</div>
        <div class="font-display text-gold text-lg">
          {ending.stats.refusedCompromise}
        </div>
      </div>
      <div class="rounded-md border border-line/60 p-2">
        <div class="text-parchment-dim/85 uppercase">Base trahie</div>
        <div class="font-display text-gold text-lg">
          {ending.stats.betrayedBase}
        </div>
      </div>
      <div class="rounded-md border border-line/60 p-2">
        <div class="text-parchment-dim/85 uppercase">Mouvements épuisés</div>
        <div class="font-display text-gold text-lg">
          {ending.stats.exhaustedMovements}
        </div>
      </div>
    </div>

    <div
      class="grid grid-cols-2 gap-2 mt-2"
      in:fade={{ duration: 360, delay: 480 }}
    >
      <button type="button" class="btn-ghost" onclick={exportJournal}>
        Exporter le journal
      </button>
      <button type="button" class="btn-primary" onclick={onReplay}>
        Rejouer
      </button>
    </div>
    <p class="text-[0.7rem] italic text-parchment-dim/65 text-center">
      L'export Markdown contient la partie complète — utile pour le mode formation paritaire.
    </p>
  {/if}
</article>

<style>
  /* Argus UX-2 : skip button minimaliste, top-right de l'épilogue */
  .skip-btn {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    border: 1px solid rgba(237, 228, 201, 0.18);
    background: rgba(13, 16, 20, 0.4);
    color: rgba(237, 228, 201, 0.65);
    border-radius: 999px;
    padding: 0.3rem 0.7rem;
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    z-index: 2;
    transition: color 180ms, border-color 180ms;
  }
  .skip-btn:hover,
  .skip-btn:focus-visible {
    color: #f4d58b;
    border-color: rgba(244, 213, 139, 0.45);
    outline: none;
  }

  /* Container ancré pour positionner le skip-btn */
  article {
    position: relative;
  }

  /* Acte 1 — drumroll : palpitation douce du score */
  .drumroll {
    text-shadow: 0 0 32px rgba(244, 213, 139, 0.18);
    animation: drumroll-pulse 1.4s ease-in-out infinite;
  }
  @keyframes drumroll-pulse {
    0%, 100% { text-shadow: 0 0 32px rgba(244, 213, 139, 0.18); }
    50%      { text-shadow: 0 0 48px rgba(244, 213, 139, 0.35); }
  }

  /* Acte 1 : centrage vertical confortable */
  .act-count {
    min-height: 220px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  /* Acte 2 — placeholder pour les objectifs pas encore révélés */
  .objective-placeholder {
    opacity: 0.18;
    border-style: dashed !important;
  }
  .objective-placeholder b {
    color: rgba(237, 228, 201, 0.4);
  }

  /* Acte 3 — verdict en grand, lettrage typographique */
  .verdict-title {
    letter-spacing: 0.04em;
    text-shadow: 0 4px 24px rgba(0, 0, 0, 0.6),
                 0 0 16px rgba(244, 213, 139, 0.15);
  }

  /* === Styles communs (objectifs, partagés acte 2 et acte 4) === */
  .objective-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid rgba(201, 154, 64, 0.18);
    border-radius: 0.5rem;
    background: rgba(201, 154, 64, 0.05);
    padding: 0.45rem 0.55rem;
  }

  .objective-line[data-status='satisfied'] {
    border-color: rgba(95, 181, 107, 0.4);
    background: rgba(95, 181, 107, 0.07);
  }

  .objective-line[data-status='failed'] {
    border-color: rgba(224, 122, 110, 0.4);
    background: rgba(224, 122, 110, 0.05);
    opacity: 0.78;
  }

  .objective-line .dot {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.45);
    color: rgba(244, 213, 139, 0.75);
    font-size: 0.78rem;
    line-height: 1;
  }

  .objective-line[data-status='satisfied'] .dot {
    background: rgba(95, 181, 107, 0.16);
    color: #aedab5;
  }

  .objective-line[data-status='failed'] .dot {
    background: rgba(224, 122, 110, 0.16);
    color: #e8a09b;
  }

  .objective-line b {
    display: block;
    color: #ede4c9;
    font-size: 0.78rem;
    line-height: 1.2;
  }

  .objective-line small {
    display: block;
    color: rgba(237, 228, 201, 0.62);
    font-size: 0.74rem;
    line-height: 1.3;
    margin-top: 0.1rem;
  }

  .objective-line em {
    flex-shrink: 0;
    font-style: normal;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #f4d58b;
  }

  .objective-line[data-status='satisfied'] em {
    color: #aedab5;
  }

  .objective-line[data-status='failed'] em {
    color: #e8a09b;
  }

  /* prefers-reduced-motion : neutralise les animations CSS
     décoratives (l'orchestration JS est court-circuitée par
     reducedMotion() qui appelle jumpToFinal). */
  @media (prefers-reduced-motion: reduce) {
    .drumroll {
      animation: none;
    }
  }
  :global([data-a11y-reduced-motion='true']) .drumroll {
    animation: none;
  }
</style>
