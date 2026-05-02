<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { POSTURE_STYLES } from '../../game/narrative/choicePosture';
  import GlossaryText from '../GlossaryText.svelte';

  interface Props {
    onDone: () => void;
  }
  let { onDone }: Props = $props();

  /* === UX-N5 : tutoriel adaptatif (Vygotsky ZPD) ===
     Si le joueur a déjà fini une partie, on lui propose un mode
     « rappel express » 1 écran. S'il en a fini ≥3, on lui propose
     directement de skipper.
     Le compteur paritas_played_count est incrémenté côté EndingReport. */
  function readPlayedCount(): number {
    try {
      const v = localStorage.getItem('paritas_played_count');
      const n = v ? parseInt(v, 10) : 0;
      return Number.isFinite(n) ? n : 0;
    } catch {
      return 0;
    }
  }

  const playedCount = readPlayedCount();
  const isReturning = playedCount >= 1;
  const isVeteran = playedCount >= 3;

  /* Vétéran : on saute immédiatement. */
  if (isVeteran) {
    queueMicrotask(() => onDone());
  }

  /* Mode express : 1 seul écran de rappel ; mode novice : 4 écrans. */
  let expressMode = $state<boolean>(isReturning);

  let step = $state(0);
  const TOTAL = $derived(expressMode ? 1 : 4);

  function next() {
    if (step >= TOTAL - 1) {
      onDone();
      return;
    }
    step += 1;
  }

  function back() {
    if (step > 0) step -= 1;
  }

  const POSTURE_ORDER = ['rupture', 'institution', 'compromis', 'expertise', 'opinion', 'paternaliste'] as const;
</script>

<div class="max-w-3xl mx-auto bordered-card p-6 sm:p-8 space-y-6" in:fade={{ duration: 320 }}>
  <header class="flex items-center justify-between gap-3">
    <div class="text-xs uppercase tracking-wider text-parchment-dim/85">
      {expressMode ? 'Rappel express' : `Avant d'entrer · ${step + 1}/${TOTAL}`}
    </div>
    <div class="flex items-center gap-2">
      {#if isReturning}
        <button
          type="button"
          class="mode-switch"
          onclick={() => { expressMode = !expressMode; step = 0; }}
          title="Bascule entre rappel d'1 écran et tutoriel complet"
        >
          {expressMode ? 'Voir le tutoriel complet' : 'Mode express'}
        </button>
      {/if}
      <div class="flex gap-1">
        {#each Array(TOTAL) as _, i}
          <span class="dot" data-active={i <= step}></span>
        {/each}
      </div>
    </div>
  </header>

  {#if expressMode}
    <div in:fly={{ y: 8, duration: 240 }}>
      <h2 class="font-display text-2xl text-gold mb-3">Rappel — tu as déjà joué</h2>
      <ul class="express-list">
        <li>
          <b>6 ressources</b> — Confiance, Caisse, Santé sociale, Légitimité, Rapport de force, Institution. Aucune décision ne change tout.
        </li>
        <li>
          <b>6 postures</b> — chaque décision a une posture politique. Tes décisions forment un trait dominant.
        </li>
        <li>
          <b>Mandat</b> — 2 ou 3 objectifs à atteindre. Ils sont dans la sidebar.
        </li>
        <li>
          <b>Conséquences en cascade</b> — texte, mesures, presse, voix, mémoire, chiffres. Clique pour tout voir d'un coup.
        </li>
        <li>
          <b>Mode lecture</b> — clique sur Lecture pour cacher la sidebar et lire en grand.
        </li>
      </ul>
      <p class="mt-3 text-parchment-dim/65 text-xs italic">
        Tu as joué {playedCount} partie{playedCount > 1 ? 's' : ''}. Tu peux revoir le tutoriel complet avec le bouton plus haut.
      </p>
    </div>
  {:else if step === 0}
    <div in:fly={{ y: 8, duration: 240 }}>
      <h2 class="font-display text-2xl text-gold mb-3">Qu'est-ce que le paritarisme ?</h2>
      <p class="text-parchment leading-relaxed text-sm sm:text-base">
        Le patron et le salarié ne sont presque jamais d'accord.
      </p>
      <p class="text-parchment leading-relaxed text-sm sm:text-base mt-2">
        Parfois, ils acceptent de s'asseoir à la même table.
        Ils écrivent ensemble des règles.
        Ces règles parlent des salaires, du chômage, de la santé, de la retraite.
      </p>
      <p class="text-parchment leading-relaxed text-sm sm:text-base mt-2">
        C'est ce qu'on appelle le <GlossaryText text="paritarisme" />.
      </p>
      <p class="mt-3 text-parchment-dim leading-relaxed text-sm">
        Dans ce jeu, tu joues un de ces deux camps.
        Tu joues 100 tours.
        À chaque tour, tu prends une décision.
        Chaque décision laisse une trace : dans tes ressources, dans tes accords, dans ton caractère.
      </p>
    </div>
  {:else if step === 1}
    <div in:fly={{ y: 8, duration: 240 }}>
      <h2 class="font-display text-2xl text-gold mb-3">Six ressources, un mandat</h2>
      <p class="text-parchment-dim leading-relaxed text-sm mb-3">
        Tu as 6 jauges. Elles vont de 0 à 100. Elles montrent l'état de ton organisation. Aucune décision ne change toutes les jauges. Tu dois choisir.
      </p>
      <ul class="grid grid-cols-2 gap-2 text-xs">
        <li class="res-line"><b>Confiance</b><span>la base te suit ou non</span></li>
        <li class="res-line"><b>Caisse</b><span>l'argent dont tu disposes</span></li>
        <li class="res-line"><b>Santé sociale</b><span>solidité du collectif</span></li>
        <li class="res-line"><b>Légitimité</b><span>ce que l'opinion pense de toi</span></li>
        <li class="res-line"><b>Rapport de force</b><span>capacité à mobiliser</span></li>
        <li class="res-line"><b>Institution</b><span>ce que tu construis pour durer</span></li>
      </ul>
      <p class="mt-3 text-parchment-dim leading-relaxed text-sm">
        Ton <b class="text-gold-soft">mandat</b> liste 2 ou 3 objectifs.
        Ce sont les buts à atteindre. Ils mesurent ta réussite.
      </p>
    </div>
  {:else if step === 2}
    <div in:fly={{ y: 8, duration: 240 }}>
      <h2 class="font-display text-2xl text-gold mb-3">Six postures, un trait dominant</h2>
      <p class="text-parchment-dim leading-relaxed text-sm mb-3">
        Chaque décision a une <b>posture</b> politique.
        Le symbole à gauche du bouton te montre laquelle.
      </p>
      <ul class="grid grid-cols-2 gap-2">
        {#each POSTURE_ORDER as p}
          {@const s = POSTURE_STYLES[p]}
          <li class="posture-line" style="--accent: {s.accent}; --accent-soft: {s.accentSoft}; --accent-muted: {s.accentMuted};">
            <span class="glyph">{s.glyph}</span>
            <span class="lbl">{s.label}</span>
          </li>
        {/each}
      </ul>
      <p class="mt-3 text-parchment-dim leading-relaxed text-sm">
        Tes décisions forment un <b class="text-gold-soft">trait dominant</b>.
        Tu deviens pragmatique, ou tribun, ou autre.
        Certaines options sont réservées à ton trait.
      </p>
    </div>
  {:else}
    <div in:fly={{ y: 8, duration: 240 }}>
      <h2 class="font-display text-2xl text-gold mb-3">Lire un scénario</h2>
      <p class="text-parchment-dim leading-relaxed text-sm mb-3">
        À chaque tour, tu lis une situation historique réelle.
        Voici les 5 parties à repérer :
      </p>
      <ol class="scenario-anatomy">
        <li>
          <b>Bandeau temporel</b>
          <span>Date, ère, climat. Pour comprendre les règles de l'époque. Exemple : les coalitions sont interdites avant <GlossaryText text="Ollivier" />.</span>
        </li>
        <li>
          <b>Contexte historique</b>
          <span>Quelques phrases qui décrivent les faits. Tout est vrai. Rien n'est inventé.</span>
        </li>
        <li>
          <b>Mise en situation</b>
          <span>L'angle de la scène. Le mode <em>Réfléchi</em> explique. Le mode <em>Compulsif</em> fait sentir.</span>
        </li>
        <li>
          <b>Choix</b>
          <span>2 à 4 options. Chaque option a un symbole, une intention courte, parfois un indice. Survole le bouton pour voir l'effet sur les ressources.</span>
        </li>
        <li>
          <b>Conséquence</b>
          <span>Elle apparaît en plusieurs étapes : texte, mesures, presse, voix intérieure, mémoire, trait, chiffres.</span>
        </li>
      </ol>
      <p class="mt-3 text-parchment-dim leading-relaxed text-sm">
        Astuce : un mot en <span class="gloss-demo">pointillés italiques</span> est défini dans le glossaire. Survole pour lire la définition. Tu n'as pas besoin de tout connaître pour jouer.
      </p>
    </div>
  {/if}

  <footer class="flex items-center justify-between gap-3 pt-2">
    <button type="button" class="btn-ghost" onclick={onDone}>Passer</button>
    <div class="flex gap-2">
      {#if step > 0}
        <button type="button" class="btn-ghost" onclick={back}>← Précédent</button>
      {/if}
      <button type="button" class="btn-primary" onclick={next}>
        {step === TOTAL - 1 ? 'Choisir mon camp →' : 'Suivant →'}
      </button>
    </div>
  </footer>
</div>

<style>
  .dot {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 999px;
    background: rgba(237, 228, 201, 0.2);
    transition: background 0.2s ease, transform 0.2s ease;
  }

  .dot[data-active='true'] {
    background: #f4d58b;
    transform: scale(1.15);
  }

  .res-line {
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
    border: 1px solid rgba(237, 228, 201, 0.1);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.32);
    padding: 0.5rem 0.6rem;
  }

  .res-line b {
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 600;
    font-size: 0.74rem;
    letter-spacing: 0.04em;
  }

  .res-line span {
    color: rgba(237, 228, 201, 0.65);
    font-size: 0.78rem;
    line-height: 1.25;
  }

  .posture-line {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border: 1px solid var(--accent-muted);
    border-left-width: 2px;
    border-radius: 0.5rem;
    background: var(--accent-soft);
    padding: 0.5rem 0.6rem;
  }

  .posture-line .glyph {
    width: 1.6rem;
    height: 1.6rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--accent-muted);
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.5);
    color: var(--accent);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.85rem;
  }

  .posture-line .lbl {
    color: var(--accent);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .btn-ghost {
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.45rem;
    background: transparent;
    color: rgba(237, 228, 201, 0.75);
    padding: 0.5rem 0.85rem;
    font-size: 0.8rem;
    transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
  }

  .btn-ghost:hover {
    border-color: rgba(244, 213, 139, 0.5);
    color: #f4d58b;
    background: rgba(201, 154, 64, 0.05);
  }

  .scenario-anatomy {
    list-style: none;
    margin: 0;
    padding: 0;
    counter-reset: anatomy;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .scenario-anatomy li {
    counter-increment: anatomy;
    display: grid;
    grid-template-columns: 1.6rem 1fr;
    column-gap: 0.6rem;
    row-gap: 0.18rem;
    padding: 0.5rem 0.6rem;
    border-left: 2px solid rgba(244, 213, 139, 0.45);
    background: rgba(13, 16, 20, 0.32);
    border-radius: 0 0.45rem 0.45rem 0;
    align-items: baseline;
  }

  .scenario-anatomy li::before {
    content: counter(anatomy);
    grid-column: 1;
    grid-row: 1 / span 2;
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.95rem;
    line-height: 1;
    align-self: start;
  }

  .scenario-anatomy li b {
    grid-column: 2;
    grid-row: 1;
    color: #ede4c9;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.82rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .scenario-anatomy li span {
    grid-column: 2;
    grid-row: 2;
    color: rgba(237, 228, 201, 0.78);
    font-size: 0.84rem;
    line-height: 1.45;
    font-family: 'Source Serif 4', Georgia, serif;
  }

  .scenario-anatomy li em {
    font-style: italic;
    color: #f4d58b;
  }

  .gloss-demo {
    border-bottom: 1px dashed rgba(244, 213, 139, 0.6);
    color: #f4d58b;
    cursor: help;
  }

  .mode-switch {
    border: 1px solid rgba(244, 213, 139, 0.4);
    border-radius: 0.4rem;
    background: rgba(13, 16, 20, 0.55);
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.3rem 0.55rem;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .mode-switch:hover {
    background: rgba(201, 154, 64, 0.13);
  }

  .express-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .express-list li {
    border-left: 2px solid rgba(244, 213, 139, 0.45);
    background: rgba(201, 154, 64, 0.06);
    border-radius: 0 0.45rem 0.45rem 0;
    padding: 0.5rem 0.75rem;
    color: rgba(237, 228, 201, 0.85);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.86rem;
    line-height: 1.45;
  }

  .express-list b {
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-right: 0.3rem;
  }
</style>
