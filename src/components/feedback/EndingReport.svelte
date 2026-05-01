<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { EndingRender } from '../../game/engine/endingEngine';
  import { TRAIT_LABELS, TRAIT_BLURBS } from '../../game/narrative/personalityEngine';

  interface Props {
    ending: EndingRender;
    onReplay: () => void;
  }
  let { ending, onReplay }: Props = $props();

  const trait = $derived(ending.stats.finalDominantTrait);
</script>

<article class="bordered-card p-6 space-y-4 max-w-2xl mx-auto" in:fade={{ duration: 360 }}>
  <header class="text-center space-y-1">
    <div class="text-xs uppercase tracking-wider text-parchment-dim/70">
      Épilogue · {ending.stats.turnsPlayed} tours joués
    </div>
    <h2 class="font-display text-3xl text-amber-400">{ending.title}</h2>
  </header>

  <div class="text-center">
    <div class="font-display text-6xl text-amber-400 leading-none">
      {ending.score}<span class="text-2xl text-parchment-dim/60">/100</span>
    </div>
    <p class="text-xs italic text-parchment-dim/70 mt-1">Score final</p>
  </div>

  <p class="text-parchment leading-relaxed text-sm whitespace-pre-line">
    {ending.text}
  </p>

  <div class="border-t border-line/60 pt-4 space-y-1.5 text-sm">
    <div class="font-display uppercase tracking-wider text-amber-400 text-xs">
      Ton style — {TRAIT_LABELS[trait]}
    </div>
    <p class="italic text-parchment-dim leading-snug">
      {TRAIT_BLURBS[trait]}
    </p>
  </div>

  <div class="grid grid-cols-2 gap-3 text-xs">
    <div class="rounded-md border border-line/60 p-2">
      <div class="text-parchment-dim/70 uppercase">Institutions</div>
      <div class="font-display text-amber-400 text-lg">
        {ending.stats.institutionsBuilt}
      </div>
    </div>
    <div class="rounded-md border border-line/60 p-2">
      <div class="text-parchment-dim/70 uppercase">Compromis refusés</div>
      <div class="font-display text-amber-400 text-lg">
        {ending.stats.refusedCompromise}
      </div>
    </div>
    <div class="rounded-md border border-line/60 p-2">
      <div class="text-parchment-dim/70 uppercase">Base trahie</div>
      <div class="font-display text-amber-400 text-lg">
        {ending.stats.betrayedBase}
      </div>
    </div>
    <div class="rounded-md border border-line/60 p-2">
      <div class="text-parchment-dim/70 uppercase">Mouvements épuisés</div>
      <div class="font-display text-amber-400 text-lg">
        {ending.stats.exhaustedMovements}
      </div>
    </div>
  </div>

  <button type="button" class="btn-primary w-full mt-2" onclick={onReplay}>
    Rejouer
  </button>
</article>
