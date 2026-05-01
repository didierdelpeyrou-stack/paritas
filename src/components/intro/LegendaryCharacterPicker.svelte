<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import type { Camp } from '$lib/types';
  import {
    LEGENDARY_CHARACTERS,
    type LegendaryCharacter
  } from '../../game/content/legendaryCharacters';
  import { TRAIT_LABELS } from '../../game/narrative/personalityEngine';
  import type { PlayerTrait } from '../../game/types';

  interface Props {
    selected: LegendaryCharacter | null;
    onSelect: (character: LegendaryCharacter | null) => void;
  }
  let { selected, onSelect }: Props = $props();

  let filter = $state<Camp | 'all'>('all');

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
    if (selected?.id === c.id) {
      onSelect(null); // re-clic = désélection
    } else {
      onSelect(c);
    }
  }
</script>

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
      <button
        type="button"
        onclick={() => pick(c)}
        in:fly={{ y: 6, duration: 220, delay: i * 18 }}
        class="text-left rounded-lg p-2.5 border-2 transition-all
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
    {/each}
  </div>

  {#if selected}
    <div class="text-xs italic text-gold-soft/80 text-center" in:fade>
      Tu incarneras <span class="not-italic font-display text-gold">{selected.name}</span>.
      Clique à nouveau sur sa carte pour annuler.
    </div>
  {/if}
</div>
