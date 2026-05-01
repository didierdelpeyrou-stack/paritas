<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { POSTURE_STYLES } from '../../game/narrative/choicePosture';

  interface Props {
    onDone: () => void;
  }
  let { onDone }: Props = $props();

  let step = $state(0);
  const TOTAL = 3;

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
    <div class="text-xs uppercase tracking-wider text-parchment-dim/85">Avant d'entrer · {step + 1}/{TOTAL}</div>
    <div class="flex gap-1">
      {#each Array(TOTAL) as _, i}
        <span class="dot" data-active={i <= step}></span>
      {/each}
    </div>
  </header>

  {#if step === 0}
    <div in:fly={{ y: 8, duration: 240 }}>
      <h2 class="font-display text-2xl text-amber-400 mb-3">Le paritarisme, en deux phrases</h2>
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
      <h2 class="font-display text-2xl text-amber-400 mb-3">Six ressources, un mandat</h2>
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
        À côté, ton <b class="text-amber-300">mandat</b> liste 2 à 3 objectifs nommés assignés à ton rôle. C'est ce qui mesure une partie réussie.
      </p>
    </div>
  {:else}
    <div in:fly={{ y: 8, duration: 240 }}>
      <h2 class="font-display text-2xl text-amber-400 mb-3">Six postures, un trait dominant</h2>
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
        Tes choix successifs sculptent un <b class="text-amber-300">trait dominant</b>. Certaines options sont réservées à ce trait — un syndicaliste pragmatique ne dispose pas des mêmes leviers qu'un syndicaliste de rupture.
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
        {step === TOTAL - 1 ? "Entrer dans l'histoire" : 'Suivant →'}
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
    font-size: 0.7rem;
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
</style>
