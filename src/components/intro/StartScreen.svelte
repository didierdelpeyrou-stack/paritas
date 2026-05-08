<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { Camp } from '$lib/types';
  import type { RenderMode } from '../../game/types';
  import LegendaryCharacterPicker from './LegendaryCharacterPicker.svelte';
  import GlossaryText from '../GlossaryText.svelte';
  import type { LegendaryCharacter } from '../../game/content/legendaryCharacters';
  import {
    applyLaunchPreset,
    LAUNCH_PRESET_META,
    type LaunchPreset
  } from '$lib/a11y/launchPreset';
  import { ERAS } from '../../game/content/eras';

  interface Props {
    onStart: (opts: {
      name: string;
      camp: Camp;
      mode: RenderMode;
      legendaryId?: string;
      startTurn?: number;
    }) => void;
  }
  let { onStart }: Props = $props();

  let name = $state('');
  let camp = $state<Camp | null>(null);
  let mode = $state<RenderMode>('reflechi');
  let modeOpen = $state(false);
  let legendary = $state<LegendaryCharacter | null>(null);
  let nameTouched = $state(false);
  /* P1-1 (ORDA-009, AAR bêta-30 §V — FG-5 Goodwin/Camille/Jules) :
     3 boutons preset au launch (pédago/équilibré/littéraire) qui
     pré-cochent mode + a11y-cognitive. Persisté implicitement via
     le helper launchPreset.ts (DOM + localStorage). */
  let activePreset = $state<LaunchPreset>('balanced');

  /* ORDA-017 (P0 Aïcha #23) — Mode "Séance prof". Si activé dans les
     Réglages, on affiche un picker d'ère pour démarrer la partie à un
     tour précis (T17 Front pop, T29 Trente Glorieuses, T69 Macron…).
     Lu directement de localStorage (cf. Settings.svelte PED_KEY). */
  function loadPedagogicalMode(): boolean {
    try {
      return localStorage.getItem('paritas_pedagogical_mode') === 'true';
    } catch {
      return false;
    }
  }
  const pedagogicalMode = loadPedagogicalMode();
  /* `null` = démarrage normal T1 ; sinon, le tour de démarrage choisi. */
  let startTurn = $state<number | null>(null);

  function selectPreset(p: LaunchPreset) {
    activePreset = p;
    const result = applyLaunchPreset(p);
    mode = result.mode;
  }

  /* Quand un personnage légendaire est sélectionné, on pré-remplit le nom et le camp.
   * L'utilisateur garde la possibilité de surcharger le nom (cosplay).
   * Si on désélectionne, on reset name et camp seulement s'ils n'ont pas été touchés.
   */
  function handleLegendarySelect(c: LegendaryCharacter | null) {
    legendary = c;
    if (c) {
      camp = c.camp;
      if (!nameTouched || !name.trim()) {
        name = c.name;
      }
    }
  }

  function onNameInput() {
    nameTouched = true;
  }

  const canStart = $derived(!!name.trim() && !!camp);

  function start() {
    if (!canStart || !camp) return;
    onStart({
      name: name.trim(),
      camp,
      mode,
      legendaryId: legendary?.id,
      /* Mode pédagogique : on transmet le tour de démarrage si choisi.
         Sinon (null), comportement par défaut → T1. */
      startTurn: pedagogicalMode && startTurn !== null ? startTurn : undefined
    });
  }
</script>

<div class="max-w-3xl mx-auto bordered-card p-6 sm:p-8 space-y-6" in:fade={{ duration: 400 }}>
  <header class="space-y-1">
    <h1 class="font-display text-4xl uppercase tracking-widest text-gold">
      Paritas
    </h1>
    <p class="text-parchment-dim text-sm sm:text-base">
      Tu négocies à la place des syndicats ou des patrons. Tes choix font l'histoire.
    </p>
  </header>

  <div class="bg-ink/40 border-l-2 border-gold px-4 py-3 text-parchment-dim leading-relaxed text-sm">
    <p>100 décisions. Deux camps. De 1789 à 2026.</p>
    <p class="mt-2">Tu rejoues les grands moments du syndicalisme français : <GlossaryText text="cahiers de doléances, Le Chapelier, Waldeck-Rousseau, charte d'Amiens, Matignon, Sécurité sociale, Mai 68, Auroux, Plan Juppé, ordonnances Macron" />, retraites 2023.</p>
    <p class="mt-2">À chaque tour, tu prends parti. Aucune décision n'est neutre.</p>
    <p class="mt-2 italic text-parchment-dim/80">Une simulation historique exigeante. Chaque choix engage la suite.</p>
  </div>

  <!-- UX-7 : voie principale recommandée — incarner une figure légendaire -->
  <div class="recommended-path">
    <span class="reco-tag">Voie recommandée</span>
    <LegendaryCharacterPicker selected={legendary} onSelect={handleLegendarySelect} />
  </div>

  <!-- Séparateur — voie secondaire, moins mise en avant -->
  <details class="custom-character-fold">
    <summary class="custom-summary">
      <span>Plutôt créer un personnage de zéro</span>
      <em class="text-parchment-dim/55 italic">(option avancée)</em>
    </summary>

  <!-- Form libre -->
  <div class="space-y-4">
    <label class="block">
      <span class="text-xs uppercase tracking-wider text-parchment-dim/85">
        Nom du protagoniste
      </span>
      <input
        bind:value={name}
        oninput={onNameInput}
        placeholder="ex. Marguerite, Léon…"
        autocapitalize="words"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        maxlength="40"
        class="mt-1 w-full px-3 py-2 bg-ink border border-line rounded-md text-parchment focus:border-gold focus:outline-none"
      />
    </label>

    <div>
      <span class="text-xs uppercase tracking-wider text-parchment-dim/85">Camp</span>
      <div class="grid grid-cols-2 gap-3 mt-2">
        <button
          type="button"
          onclick={() => (camp = 'salarie')}
          class="rounded-lg p-4 text-center border-2 transition-all
                 {camp === 'salarie'
            ? 'border-rose-500 bg-rose-500/10'
            : 'border-line hover:border-line/80'}"
        >
          <div class="font-display text-gold">Côté salarié 🚩</div>
          <div class="text-xs text-parchment-dim/85 mt-1">
            Délégué, syndicaliste
          </div>
        </button>
        <button
          type="button"
          onclick={() => (camp = 'patron')}
          class="rounded-lg p-4 text-center border-2 transition-all
                 {camp === 'patron'
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-line hover:border-line/80'}"
        >
          <div class="font-display text-gold">Côté patronal 🏛️</div>
          <div class="text-xs text-parchment-dim/85 mt-1">
            Industriel, dirigeant patronal
          </div>
        </button>
      </div>
    </div>

    <!-- P1-1 (ORDA-009) — 3 presets au launch (FG-5) -->
    <div>
      <div class="text-xs uppercase tracking-wider text-parchment-dim/85 mb-2">
        Mode d'expérience
      </div>
      <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Choisir le mode d'expérience">
        {#each ['pedagogical', 'balanced', 'literary'] as p (p)}
          {@const meta = LAUNCH_PRESET_META[p as LaunchPreset]}
          <button
            type="button"
            role="radio"
            aria-checked={activePreset === p}
            onclick={() => selectPreset(p as LaunchPreset)}
            class="rounded-lg p-2 text-left border-2 transition-all
                   {activePreset === p
              ? 'border-gold bg-gold/10'
              : 'border-line hover:border-line/80'}"
          >
            <div class="font-display text-gold text-xs">{meta.short}</div>
            <div class="text-[10px] text-parchment-dim/85 mt-1 leading-snug">
              {meta.audience}
            </div>
          </button>
        {/each}
      </div>
      <p class="text-[11px] text-parchment-dim/70 mt-1.5 leading-snug">
        {LAUNCH_PRESET_META[activePreset].desc}
      </p>
    </div>

    <div>
      <button
        type="button"
        class="w-full text-left text-xs uppercase tracking-wider text-parchment-dim/85 flex items-center justify-between"
        onclick={() => (modeOpen = !modeOpen)}
      >
        <span>Style de jeu (avancé) — {mode === 'reflechi' ? 'Réfléchi' : 'Compulsif'}</span>
        <span class="text-parchment-dim/50">{modeOpen ? '▴' : '▾'}</span>
      </button>

      {#if modeOpen}
        <div class="grid grid-cols-2 gap-3 mt-2">
          <button
            type="button"
            onclick={() => (mode = 'reflechi')}
            class="rounded-lg p-3 text-left border-2 transition-all
                   {mode === 'reflechi'
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-line hover:border-line/80'}"
          >
            <div class="font-display text-gold text-sm">Réfléchi</div>
            <div class="text-xs text-parchment-dim/85 mt-1 leading-snug">
              Tu vois l'intention de chaque choix et un rappel théorique. Idéal
              pédagogie / atelier.
            </div>
          </button>
          <button
            type="button"
            onclick={() => (mode = 'compulsif')}
            class="rounded-lg p-3 text-left border-2 transition-all
                   {mode === 'compulsif'
              ? 'border-violet-500 bg-violet-500/10'
              : 'border-line hover:border-line/80'}"
          >
            <div class="font-display text-gold text-sm">Compulsif</div>
            <div class="text-xs text-parchment-dim/85 mt-1 leading-snug">
              Plus de suspense, voix intérieures, moins de filets. Le jeu te
              parle.
            </div>
          </button>
        </div>
      {/if}
    </div>
    </div>
  </details>

  {#if pedagogicalMode}
    <!-- ORDA-017 (P0 Aïcha #23) — Mode Séance prof : picker d'ère
         pour démarrer à une période historique précise au lieu du T1.
         Placé après le sélecteur de camp et avant le bouton Démarrer. -->
    <div class="pedagogical-block">
      <span class="pedagogical-tag">Mode Séance prof</span>
      <p class="pedagogical-blurb">
        Démarre la partie à une période précise pour focaliser ta
        séance sur Matignon 1936, Grenelle 1968, ordonnances Macron 2017…
        L'état des forces sera ajusté au contexte historique.
      </p>
      <div class="era-list" role="radiogroup" aria-label="Choisir le tour de démarrage">
        <button
          type="button"
          role="radio"
          aria-checked={startTurn === null}
          class="era-option"
          data-active={startTurn === null}
          onclick={() => (startTurn = null)}
        >
          <span class="era-name">Début (T1)</span>
          <span class="era-period">Démarrage normal · 1789, Révolution</span>
        </button>
        {#each ERAS as era (era.id)}
          <button
            type="button"
            role="radio"
            aria-checked={startTurn === era.fromTurn}
            class="era-option"
            data-active={startTurn === era.fromTurn}
            onclick={() => (startTurn = era.fromTurn)}
          >
            <span class="era-name">{era.name} (T{era.fromTurn})</span>
            <span class="era-period">{era.period}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <button
    type="button"
    class="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
    disabled={!canStart}
    onclick={start}
  >
    {legendary ? `Entrer dans l'histoire en ${legendary.name}` : "Entrer dans l'histoire"}
  </button>
</div>

<style>
  .recommended-path {
    position: relative;
    border: 1px solid rgba(244, 213, 139, 0.3);
    border-radius: 0.7rem;
    background: rgba(201, 154, 64, 0.06);
    padding: 1rem 0.85rem 0.65rem;
  }

  .reco-tag {
    position: absolute;
    top: -0.65rem;
    left: 1rem;
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: linear-gradient(180deg, #1a1f26, #232a33);
    padding: 0.18rem 0.55rem;
    border-radius: 0.35rem;
    border: 1px solid rgba(244, 213, 139, 0.4);
  }

  .custom-character-fold {
    border-top: 1px solid rgba(237, 228, 201, 0.08);
    padding-top: 0.5rem;
  }

  .custom-summary {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    cursor: pointer;
    list-style: none;
    color: rgba(237, 228, 201, 0.65);
    font-size: 0.82rem;
    padding: 0.4rem 0.2rem;
    transition: color 0.15s ease;
  }

  .custom-summary:hover {
    color: #ede4c9;
  }

  .custom-summary::-webkit-details-marker {
    display: none;
  }

  .custom-summary::before {
    content: '▸';
    margin-right: 0.4rem;
    color: rgba(244, 213, 139, 0.5);
    transition: transform 0.18s ease;
    display: inline-block;
  }

  details[open] .custom-summary::before {
    transform: rotate(90deg);
  }

  /* ORDA-017 — Mode Séance prof. Encart pédago à l'écran de démarrage. */
  .pedagogical-block {
    position: relative;
    border: 1px solid rgba(102, 187, 106, 0.35);
    border-radius: 0.7rem;
    background: rgba(102, 187, 106, 0.06);
    padding: 1rem 0.85rem 0.75rem;
  }

  .pedagogical-tag {
    position: absolute;
    top: -0.65rem;
    left: 1rem;
    color: #a5d6a7;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: linear-gradient(180deg, #1a1f26, #232a33);
    padding: 0.18rem 0.55rem;
    border-radius: 0.35rem;
    border: 1px solid rgba(102, 187, 106, 0.45);
  }

  .pedagogical-blurb {
    color: rgba(237, 228, 201, 0.75);
    font-size: 0.82rem;
    line-height: 1.45;
    margin: 0 0 0.6rem;
  }

  .era-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: 0.4rem;
  }

  .era-option {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    text-align: left;
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.4);
    padding: 0.55rem 0.7rem;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .era-option:hover {
    border-color: rgba(244, 213, 139, 0.5);
    background: rgba(201, 154, 64, 0.06);
  }

  .era-option[data-active='true'] {
    border-color: #a5d6a7;
    background: rgba(102, 187, 106, 0.12);
  }

  .era-name {
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.82rem;
    letter-spacing: 0.04em;
  }

  .era-period {
    color: rgba(237, 228, 201, 0.65);
    font-size: 0.75rem;
    font-family: 'Source Serif 4', Georgia, serif;
  }
</style>
