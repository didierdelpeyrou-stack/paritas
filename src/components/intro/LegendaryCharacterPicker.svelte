<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import type { Camp } from '$lib/types';
  import {
    LEGENDARY_CHARACTERS,
    type LegendaryCharacter
  } from '../../game/content/legendaryCharacters';
  import { TRAIT_LABELS } from '../../game/narrative/personalityEngine';
  import type { PlayerTrait } from '../../game/types';
  import HistoricalImage from '../HistoricalImage.svelte';

  interface Props {
    selected: LegendaryCharacter | null;
    onSelect: (character: LegendaryCharacter | null) => void;
  }
  let { selected, onSelect }: Props = $props();

  let filter = $state<Camp | 'all'>('all');
  let detail = $state<LegendaryCharacter | null>(null);

  const visible = $derived(
    filter === 'all'
      ? LEGENDARY_CHARACTERS
      : LEGENDARY_CHARACTERS.filter(c => c.camp === filter)
  );

  const rarityClass: Record<LegendaryCharacter['rarity'], string> = {
    legendaire: 'border-amber-400/70 bg-gradient-to-br from-amber-500/10 to-amber-500/0',
    or: 'border-gold/40',
    argent: 'border-line/70'
  };

  const campAccent: Record<Camp, string> = {
    salarie: 'text-rose-300',
    patron: 'text-blue-300'
  };

  function topTraits(char: LegendaryCharacter): { trait: PlayerTrait; value: number }[] {
    const entries: { trait: PlayerTrait; value: number }[] = [];
    for (const [k, v] of Object.entries(char.traitBonus)) {
      if (typeof v === 'number' && v > 0) {
        entries.push({ trait: k as PlayerTrait, value: v });
      }
    }
    return entries.sort((a, b) => b.value - a.value).slice(0, 2);
  }

  function pick(c: LegendaryCharacter) {
    /* Clic carte = sélection directe (un seul clic au lieu de trois).
       La bio reste accessible via le bouton "Bio". */
    if (selected?.id === c.id) {
      onSelect(null);
    } else {
      onSelect(c);
    }
  }

  function openDetail(c: LegendaryCharacter, e?: Event) {
    e?.stopPropagation();
    detail = c;
  }

  function closeDetail() {
    detail = null;
  }

  function incarne(c: LegendaryCharacter) {
    onSelect(c);
    detail = null;
  }

  function deselect() {
    onSelect(null);
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && detail) closeDetail();
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="space-y-3" in:fade={{ duration: 240 }}>
  <header class="flex items-center justify-between gap-3">
    <div>
      <h3 class="font-display uppercase tracking-wider text-gold text-sm">
        Incarner une figure légendaire
      </h3>
      <p class="text-xs italic text-parchment-dim/70">
        Optionnel — chaque figure démarre avec ses propres traits et réserves.
      </p>
    </div>
    <div class="flex gap-1 text-xs">
      <button
        type="button"
        class="px-2 py-1 rounded border transition
               {filter === 'all' ? 'border-gold text-gold' : 'border-line text-parchment-dim/70 hover:border-line/80'}"
        onclick={() => (filter = 'all')}
      >
        Tous
      </button>
      <button
        type="button"
        class="px-2 py-1 rounded border transition
               {filter === 'salarie' ? 'border-rose-500 text-rose-300' : 'border-line text-parchment-dim/70 hover:border-line/80'}"
        onclick={() => (filter = 'salarie')}
      >
        Salariés
      </button>
      <button
        type="button"
        class="px-2 py-1 rounded border transition
               {filter === 'patron' ? 'border-blue-500 text-blue-300' : 'border-line text-parchment-dim/70 hover:border-line/80'}"
        onclick={() => (filter = 'patron')}
      >
        Patronat
      </button>
    </div>
  </header>

  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[44vh] overflow-y-auto pr-1">
    {#each visible as c, i (c.id)}
      <div
        class="card-wrap relative"
        in:fly={{ y: 6, duration: 220, delay: i * 18 }}
      >
        <button
          type="button"
          onclick={() => pick(c)}
          aria-label={`Incarner ${c.name}`}
          class="card-main text-left rounded-lg p-2.5 pb-7 border-2 transition-all w-full
                 {selected?.id === c.id
            ? 'border-amber-400 bg-gold/10 shadow-[0_0_0_1px_rgba(251,191,36,0.4)]'
            : rarityClass[c.rarity] + ' hover:border-gold/50 hover:bg-gold/5'}"
        >
          <div class="flex items-start gap-2">
            <div class="shrink-0 w-9 h-9 rounded-full bg-ink/60 border border-line/60 flex items-center justify-center font-display text-gold text-sm">
              {c.init}
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-display text-sm text-parchment leading-tight truncate">
                {c.name}
              </div>
              <div class="text-[10px] uppercase tracking-wider {campAccent[c.camp]} truncate">
                {c.camp === 'patron' ? 'Patronal' : 'Salarié'} · {c.years}
              </div>
            </div>
          </div>
          <p class="text-[11px] text-parchment-dim/80 leading-snug mt-1.5 line-clamp-3">
            {c.blurb}
          </p>
          <div class="flex flex-wrap gap-1 mt-1.5">
            {#each topTraits(c) as t}
              <span class="text-[10px] uppercase tracking-wider rounded px-1.5 py-0.5 border border-line/60 text-parchment-dim/80">
                {TRAIT_LABELS[t.trait]} +{t.value}
              </span>
            {/each}
          </div>
          {#if c.signature}
            <p class="text-[10px] italic text-gold-soft/70 mt-1.5 line-clamp-2">
              « {c.signature} »
            </p>
          {/if}
        </button>
        <button
          type="button"
          class="bio-btn"
          onclick={(e) => openDetail(c, e)}
          aria-label={`Lire la biographie de ${c.name}`}
          title="Lire la biographie complète"
        >Bio</button>
      </div>
    {/each}
  </div>

  {#if selected}
    <div class="text-xs italic text-gold-soft/80 text-center flex items-center justify-center gap-2" in:fade>
      <span>Tu incarneras <span class="not-italic font-display text-gold">{selected.name}</span>.</span>
      <button type="button" class="annul-btn" onclick={deselect}>Désélectionner</button>
    </div>
  {:else}
    <div class="text-xs italic text-parchment-dim/65 text-center" in:fade>
      Clic sur une carte pour incarner ; bouton « Bio » pour lire la vie complète.
    </div>
  {/if}
</div>

{#if detail}
  {@const t = detail}
  <div
    class="modal-backdrop"
    onclick={closeDetail}
    onkeydown={onKey}
    role="presentation"
    in:fade={{ duration: 220 }}
  >
    <div
      class="modal-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="char-modal-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <header class="modal-head">
        <div class="avatar-block">
          <HistoricalImage id={t.id} shape="portrait" height="120px" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 id="char-modal-title" class="font-display text-xl text-gold leading-tight">
            {t.name}
          </h2>
          <div class="text-xs uppercase tracking-wider {campAccent[t.camp]}">
            {t.camp === 'patron' ? 'Côté patronal' : 'Côté salarié'} · {t.years} · {t.era}
          </div>
        </div>
        <button type="button" class="close-btn" onclick={closeDetail} aria-label="Fermer">×</button>
      </header>

      <div class="modal-bio">
        {#each t.bio.split('\n\n') as paragraph}
          <p>{paragraph}</p>
        {/each}
      </div>

      {#if t.signature}
        <blockquote class="modal-quote">« {t.signature} »</blockquote>
      {/if}

      <div class="modal-traits">
        <div class="text-xs uppercase tracking-wider text-parchment-dim/85 mb-1.5">
          Traits de départ
        </div>
        <div class="flex flex-wrap gap-1.5">
          {#each topTraits(t) as tr}
            <span class="trait-pill">{TRAIT_LABELS[tr.trait]} +{tr.value}</span>
          {/each}
        </div>
      </div>

      <footer class="modal-foot">
        <button type="button" class="btn-ghost" onclick={closeDetail}>Fermer</button>
        <button type="button" class="btn-primary" onclick={() => incarne(t)}>
          Incarner {t.name.split(' ')[0]}
        </button>
      </footer>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(13, 16, 20, 0.85);
    backdrop-filter: blur(2px);
    padding: 1rem;
  }

  .modal-card {
    width: 100%;
    max-width: 42rem;
    max-height: 92vh;
    overflow-y: auto;
    border: 1px solid rgba(200, 155, 60, 0.45);
    border-radius: 0.85rem;
    background: linear-gradient(180deg, #1a1f26, #232a33);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.04);
    padding: 1.4rem 1.5rem;
    color: #ede4c9;
  }

  .modal-head {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    border-bottom: 1px solid rgba(237, 228, 201, 0.12);
    padding-bottom: 0.85rem;
    margin-bottom: 1rem;
  }

  .modal-head .avatar-block {
    flex-shrink: 0;
  }

  .modal-head .close-btn {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.4rem;
    background: transparent;
    color: rgba(237, 228, 201, 0.7);
    font-size: 1.3rem;
    line-height: 1;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;
  }

  .modal-head .close-btn:hover {
    border-color: rgba(244, 213, 139, 0.55);
    color: #f4d58b;
  }

  .modal-bio {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    color: rgba(237, 228, 201, 0.94);
    font-size: 0.92rem;
    line-height: 1.55;
    font-family: 'Source Serif 4', Georgia, serif;
  }

  .modal-bio p {
    margin: 0;
  }

  .modal-quote {
    border-left: 2px solid rgba(200, 155, 60, 0.55);
    padding: 0.4rem 0.85rem;
    margin: 1rem 0 0;
    color: #f4d58b;
    font-family: 'Source Serif 4', Georgia, serif;
    font-style: italic;
    font-size: 0.92rem;
  }

  .modal-traits {
    border-top: 1px solid rgba(237, 228, 201, 0.12);
    margin-top: 1rem;
    padding-top: 0.85rem;
  }

  .trait-pill {
    border: 1px solid rgba(200, 155, 60, 0.4);
    border-radius: 999px;
    padding: 0.16rem 0.6rem;
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .modal-foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.6rem;
    margin-top: 1rem;
    padding-top: 0.9rem;
    border-top: 1px solid rgba(237, 228, 201, 0.12);
  }

  .annul-btn {
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.35rem;
    background: transparent;
    color: rgba(237, 228, 201, 0.78);
    padding: 0.18rem 0.55rem;
    font-size: 0.78rem;
    transition: border-color 0.15s ease, color 0.15s ease;
  }

  .annul-btn:hover {
    border-color: rgba(244, 213, 139, 0.5);
    color: #f4d58b;
  }

  /* Petit lien "Bio" inline en bas-droite de chaque carte personnage.
     Ne déclenche pas la sélection — ouvre la modale détaillée. */
  .bio-btn {
    position: absolute;
    bottom: 0.4rem;
    right: 0.5rem;
    border: 1px solid rgba(244, 213, 139, 0.35);
    border-radius: 0.3rem;
    background: rgba(13, 16, 20, 0.55);
    color: rgba(244, 213, 139, 0.85);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.18rem 0.4rem;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
  }

  .bio-btn:hover,
  .bio-btn:focus-visible {
    border-color: #f4d58b;
    color: #f4d58b;
    background: rgba(201, 154, 64, 0.18);
    outline: none;
  }
</style>
