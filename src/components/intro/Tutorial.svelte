<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { POSTURE_STYLES } from '../../game/narrative/choicePosture';

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
          <b>6 ressources</b> — Confiance, Caisse, Santé sociale, Légitimité, Rapport de force, Institution. Aucun choix ne les bouge toutes.
        </li>
        <li>
          <b>6 postures</b> — chaque choix porte une posture politique (rupture, institution, compromis, expertise, opinion, paternaliste). Tes choix sculptent un trait dominant.
        </li>
        <li>
          <b>Mandat</b> — 2 à 3 objectifs nommés (court ou long). Suivis dans la sidebar.
        </li>
        <li>
          <b>Conséquences en cascade</b> — texte, mesures concrètes, presse, voix intérieure, mémoire, chiffres. Clic pour tout révéler.
        </li>
        <li>
          <b>Mode lecture</b> — bouton « Lecture » en haut de la colonne principale pour replier la sidebar et lire en plein écran.
        </li>
      </ul>
      <p class="mt-3 text-parchment-dim/65 text-xs italic">
        Tu as joué {playedCount} partie{playedCount > 1 ? 's' : ''}. Tu peux toujours revoir le tutoriel complet via le bouton ci-dessus.
      </p>
    </div>
  {:else if step === 0}
    <div in:fly={{ y: 8, duration: 240 }}>
      <h2 class="font-display text-2xl text-gold mb-3">Le paritarisme, en deux phrases</h2>
      <p class="text-parchment leading-relaxed text-sm sm:text-base">
        Patron et salarié sont en désaccord, presque toujours.
        Quand ils acceptent malgré tout de s'asseoir à la même table et d'écrire des règles communes — sur les salaires, le chômage, la santé, la retraite — ils font du paritarisme.
      </p>
      <p class="mt-3 text-parchment-dim leading-relaxed text-sm">
        Tu vas incarner un de ces deux camps, sur un siècle ou plus. Cent décisions, cent tours.
        Chaque choix laisse une trace : dans les ressources de ton organisation, dans la mémoire des accords signés, dans le caractère même que tu te forges.
      </p>
    </div>
  {:else if step === 1}
    <div in:fly={{ y: 8, duration: 240 }}>
      <h2 class="font-display text-2xl text-gold mb-3">Six ressources, un mandat</h2>
      <p class="text-parchment-dim leading-relaxed text-sm mb-3">
        Six jauges (0–100) suivent ton organisation. Aucun choix ne les bouge toutes : il faut arbitrer.
      </p>
      <ul class="grid grid-cols-2 gap-2 text-xs">
        <li class="res-line"><b>Confiance</b><span>de la base envers toi</span></li>
        <li class="res-line"><b>Caisse</b><span>réserves financières</span></li>
        <li class="res-line"><b>Santé sociale</b><span>tissu militant et moral</span></li>
        <li class="res-line"><b>Légitimité</b><span>ce que l'opinion publique te concède</span></li>
        <li class="res-line"><b>Rapport de force</b><span>capacité à imposer dans la rue</span></li>
        <li class="res-line"><b>Institution</b><span>solidité de ce qui est construit pour durer</span></li>
      </ul>
      <p class="mt-3 text-parchment-dim leading-relaxed text-sm">
        À côté, ton <b class="text-gold-soft">mandat</b> liste 2 à 3 objectifs nommés assignés à ton rôle. C'est ce qui mesure une partie réussie.
      </p>
    </div>
  {:else if step === 2}
    <div in:fly={{ y: 8, duration: 240 }}>
      <h2 class="font-display text-2xl text-gold mb-3">Six postures, un trait dominant</h2>
      <p class="text-parchment-dim leading-relaxed text-sm mb-3">
        Chaque choix relève d'une <b>posture</b> politique. Le glyphe à gauche du bouton t'indique laquelle.
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
        Tes choix successifs sculptent un <b class="text-gold-soft">trait dominant</b>. Certaines options sont réservées à ce trait — un syndicaliste pragmatique ne dispose pas des mêmes leviers qu'un syndicaliste de rupture.
      </p>
    </div>
  {:else}
    <div in:fly={{ y: 8, duration: 240 }}>
      <h2 class="font-display text-2xl text-gold mb-3">Lire un scénario</h2>
      <p class="text-parchment-dim leading-relaxed text-sm mb-3">
        Chaque tour t'expose une situation historique réelle. Voici les couches d'information à repérer :
      </p>
      <ol class="scenario-anatomy">
        <li>
          <b>Bandeau temporel</b>
          <span>Date, ère, climat. Sert à comprendre les contraintes de l'époque (ex. coalitions interdites avant 1864).</span>
        </li>
        <li>
          <b>Contexte historique</b>
          <span>2-4 phrases qui posent les faits. Tout est sourcé, rien d'inventé.</span>
        </li>
        <li>
          <b>Mise en situation</b>
          <span>L'angle « où tu te trouves ». Mode <em>Réfléchi</em> = explicatif ; mode <em>Compulsif</em> = sensoriel.</span>
        </li>
        <li>
          <b>Choix (2 à 4)</b>
          <span>Chaque option indique sa posture (glyphe), une intention courte, parfois un indice théorique. Survole pour voir l'effet attendu sur les ressources.</span>
        </li>
        <li>
          <b>Conséquence</b>
          <span>Apparaît en cascade : texte, mesures concrètes, presse, voix intérieure, ligne mémoire, glissement de trait, chiffres.</span>
        </li>
      </ol>
      <p class="mt-3 text-parchment-dim leading-relaxed text-sm">
        Astuce : un terme syndical en <span class="gloss-demo">pointillés</span> ouvre une définition au survol. Pas besoin de tout connaître pour jouer.
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
