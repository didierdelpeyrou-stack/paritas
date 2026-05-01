<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { Camp } from '$lib/types';
  import type { RenderMode } from '../../game/types';
  import LegendaryCharacterPicker from './LegendaryCharacterPicker.svelte';
  import type { LegendaryCharacter } from '../../game/content/legendaryCharacters';

  interface Props {
    onStart: (opts: {
      name: string;
      camp: Camp;
      mode: RenderMode;
      legendaryId?: string;
    }) => void;
  }
  let { onStart }: Props = $props();

  let name = $state('');
  let camp = $state<Camp | null>(null);
  let mode = $state<RenderMode>('reflechi');
  let modeOpen = $state(false);
  let legendary = $state<LegendaryCharacter | null>(null);
  let nameTouched = $state(false);

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
      legendaryId: legendary?.id
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
    Cent décisions, deux camps, deux siècles. Lois Le Chapelier, accords Matignon, Sécurité sociale, Mai 68, Auroux, Refondation sociale, Retraites 2023.
    À chaque tour, tu prends parti. Aucun choix n'est neutre.
    <span class="block mt-2 italic text-parchment-dim/80">Ce n'est pas un divertissement, c'est une simulation historique narrative.</span>
  </div>

  <!-- Sélecteur de figure légendaire -->
  <LegendaryCharacterPicker selected={legendary} onSelect={handleLegendarySelect} />

  <!-- Séparateur -->
  <div class="flex items-center gap-3 text-xs uppercase tracking-wider text-parchment-dim/80">
    <span class="flex-1 h-px bg-line"></span>
    <span>ou crée ton propre personnage</span>
    <span class="flex-1 h-px bg-line"></span>
  </div>

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

    <div>
      <button
        type="button"
        class="w-full text-left text-xs uppercase tracking-wider text-parchment-dim/85 flex items-center justify-between"
        onclick={() => (modeOpen = !modeOpen)}
      >
        <span>Style de jeu — {mode === 'reflechi' ? 'Réfléchi' : 'Compulsif'}</span>
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

    <button
      type="button"
      class="btn-primary w-full mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
      disabled={!canStart}
      onclick={start}
    >
      {legendary ? `Entrer dans l'histoire en ${legendary.name}` : "Entrer dans l'histoire"}
    </button>
  </div>
</div>
