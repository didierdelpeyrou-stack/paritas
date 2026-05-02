<script lang="ts">
  /**
   * Profil intérieur (style CK3) — affichage des 6 traits, du trait
   * dominant, du stress de personnalité, et de la cohérence
   * doctrinale avec le personnage légendaire choisi.
   *
   * Inspiration Crusader Kings 3 :
   *  - 6 traits visibles en permanence avec barres
   *  - Trait dominant marqué d'un sceau
   *  - Antagonisme du dominant assombri
   *  - Stress affiché comme jauge à part avec qualifier
   *  - Cohérence doctrinale : pourcentage de match avec le légendaire
   */
  import type { PlayerTrait, RebirthGameState } from '../game/types';
  import { ALL_TRAITS } from '../game/types';
  import {
    TRAIT_LABELS,
    TRAIT_BLURBS,
    TRAIT_ANTAGONISTS,
    stressLevel
  } from '../game/narrative/personalityEngine';
  import { legendaryById } from '../game/content/legendaryCharacters';

  interface Props {
    state: RebirthGameState;
  }
  let { state: gs }: Props = $props();

  const traits = $derived(gs.traits);
  const dominant = $derived(gs.dominantTrait);
  const antagonist = $derived(TRAIT_ANTAGONISTS[dominant]);
  const stress = $derived(gs.personalityStress);
  const stressInfo = $derived(stressLevel(stress));

  /* Maximum pour le scaling visuel des barres : on prend le max entre
     30 et la valeur max actuelle, pour que les barres aient du poids
     même en début de partie. */
  const maxScore = $derived(
    Math.max(30, ...ALL_TRAITS.map(t => Math.abs(traits[t])))
  );

  function pct(score: number): number {
    if (maxScore === 0) return 0;
    return Math.max(0, Math.min(100, (Math.max(0, score) / maxScore) * 100));
  }

  function color(t: PlayerTrait): string {
    if (t === dominant) return '#f4d58b';
    if (t === antagonist) return '#7f1d1d';
    return 'rgba(237, 228, 201, 0.7)';
  }

  /* Cohérence doctrinale avec le légendaire choisi : pour chaque trait
     bonus du légendaire, on vérifie si le joueur a poussé ce trait. */
  const legendary = $derived(gs.legendaryId ? legendaryById(gs.legendaryId) : undefined);

  const coherence = $derived.by<number | null>(() => {
    if (!legendary) return null;
    const bonusEntries = Object.entries(legendary.traitBonus) as Array<[PlayerTrait, number]>;
    if (bonusEntries.length === 0) return null;
    let sum = 0;
    let weightSum = 0;
    for (const [trait, weight] of bonusEntries) {
      const w = Math.max(1, weight);
      const playerScore = traits[trait];
      // 1 point joueur par point de bonus du légendaire = 100%
      // Sigmoid-like cap pour ne pas dépasser
      const ratio = Math.max(0, Math.min(1, playerScore / (w * 4)));
      sum += ratio * w;
      weightSum += w;
    }
    return Math.round((sum / weightSum) * 100);
  });

  const dominantLabel = $derived(TRAIT_LABELS[dominant]);
  const dominantBlurb = $derived(TRAIT_BLURBS[dominant]);

  /* Niveau symbolique du trait dominant : à mesure qu'il monte, le
     joueur s'enracine. Inspiré des « lifestyle perks » de CK3. */
  const dominantTier = $derived.by<{ level: number; label: string }>(() => {
    const v = traits[dominant];
    if (v >= 25) return { level: 5, label: 'Doctrine forgée' };
    if (v >= 18) return { level: 4, label: 'Identité affirmée' };
    if (v >= 12) return { level: 3, label: 'Voie tracée' };
    if (v >= 6) return { level: 2, label: 'Inclination naissante' };
    return { level: 1, label: 'Cherche encore' };
  });
</script>

<section class="bordered-card p-4 space-y-3">
  <header>
    <div class="flex items-baseline justify-between gap-2">
      <h3 class="font-display text-gold text-base">Profil intérieur</h3>
      {#if coherence !== null && legendary}
        <span class="coh-tag" title="Cohérence doctrinale avec {legendary.name}">
          {coherence}%
        </span>
      {/if}
    </div>
    <div class="text-[0.72rem] italic text-parchment-dim/70 mt-0.5">
      {dominantTier.label} · <b class="text-gold-soft not-italic">{dominantLabel}</b>
    </div>
  </header>

  <p class="dominant-blurb">{dominantBlurb}</p>

  <ul class="trait-list">
    {#each ALL_TRAITS as t}
      {@const isDom = t === dominant}
      {@const isAnt = t === antagonist}
      <li class="trait-row" data-dom={isDom} data-ant={isAnt}>
        <span class="trait-name">
          {#if isDom}<span class="seal" aria-hidden="true">★</span>{/if}
          {TRAIT_LABELS[t]}
          {#if isAnt}<em class="ant-tag" title="Antagoniste de ton trait dominant">opposé</em>{/if}
        </span>
        <span class="trait-track">
          <i style="width: {pct(traits[t])}%; background: {color(t)};"></i>
        </span>
        <span class="trait-val tabular-nums">{Math.round(traits[t])}</span>
      </li>
    {/each}
  </ul>

  <!-- Stress de personnalité -->
  <div class="stress-box" data-level={stressInfo.level}>
    <div class="stress-head">
      <span class="stress-label">Tension intérieure</span>
      <span class="stress-state">{stressInfo.label}</span>
    </div>
    <div class="stress-track">
      <i style="width: {Math.max(2, Math.min(100, stress))}%"></i>
    </div>
    <p class="stress-hint">{stressInfo.hint}</p>
  </div>

  {#if legendary && coherence !== null}
    <div class="legendary-line">
      Tu incarnes <b>{legendary.name}</b>.
      {#if coherence >= 75}
        Tu lui ressembles fortement.
      {:else if coherence >= 50}
        Tu marches encore dans ses pas, par moments.
      {:else if coherence >= 25}
        Tu t'éloignes de sa doctrine.
      {:else}
        Tu n'as plus rien de lui — autre figure, autre histoire.
      {/if}
    </div>
  {/if}
</section>

<style>
  .dominant-blurb {
    color: rgba(237, 228, 201, 0.78);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.82rem;
    line-height: 1.42;
    font-style: italic;
    margin: 0;
    border-left: 2px solid rgba(244, 213, 139, 0.45);
    padding: 0.25rem 0.5rem;
    background: rgba(201, 154, 64, 0.05);
    border-radius: 0 0.4rem 0.4rem 0;
  }

  .trait-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.32rem;
  }

  .trait-row {
    display: grid;
    grid-template-columns: 6.5rem 1fr 1.6rem;
    align-items: center;
    gap: 0.5rem;
  }

  .trait-name {
    color: rgba(237, 228, 201, 0.78);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    letter-spacing: 0.04em;
    display: flex;
    align-items: baseline;
    gap: 0.3rem;
  }

  .trait-row[data-dom='true'] .trait-name {
    color: #f4d58b;
  }

  .trait-row[data-ant='true'] .trait-name {
    color: rgba(224, 122, 110, 0.55);
  }

  .seal {
    color: #f4d58b;
    font-size: 0.78rem;
    line-height: 1;
    text-shadow: 0 0 4px rgba(244, 213, 139, 0.6);
  }

  .ant-tag {
    color: rgba(224, 122, 110, 0.5);
    font-size: 0.62rem;
    font-style: normal;
    text-transform: lowercase;
    letter-spacing: 0;
  }

  .trait-track {
    height: 0.5rem;
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.55);
    overflow: hidden;
    border: 1px solid rgba(237, 228, 201, 0.05);
  }

  .trait-track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    transition: width 0.4s ease, background 0.3s ease;
  }

  .trait-row[data-dom='true'] .trait-track {
    box-shadow: 0 0 0 1px rgba(244, 213, 139, 0.4);
  }

  .trait-row[data-ant='true'] .trait-track i {
    opacity: 0.5;
  }

  .trait-val {
    color: rgba(237, 228, 201, 0.7);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    text-align: right;
  }

  .trait-row[data-dom='true'] .trait-val {
    color: #f4d58b;
    font-weight: 700;
  }

  /* === Stress de personnalité === */
  .stress-box {
    border: 1px solid rgba(237, 228, 201, 0.12);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.32);
    padding: 0.5rem 0.65rem;
    margin-top: 0.25rem;
  }

  .stress-box[data-level='inquiet'] {
    border-color: rgba(245, 158, 11, 0.3);
    background: rgba(245, 158, 11, 0.05);
  }

  .stress-box[data-level='tendu'] {
    border-color: rgba(220, 38, 38, 0.4);
    background: rgba(220, 38, 38, 0.06);
  }

  .stress-box[data-level='effondré'] {
    border-color: rgba(220, 38, 38, 0.7);
    background: rgba(127, 29, 29, 0.18);
    animation: stress-pulse 2.4s ease-in-out infinite;
  }

  @keyframes stress-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
    50% { box-shadow: 0 0 8px 2px rgba(220, 38, 38, 0.35); }
  }

  .stress-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .stress-label {
    color: rgba(237, 228, 201, 0.85);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .stress-state {
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
  }

  .stress-box[data-level='serein'] .stress-state {
    color: #aedab5;
  }

  .stress-box[data-level='inquiet'] .stress-state {
    color: #fbbf24;
  }

  .stress-box[data-level='tendu'] .stress-state,
  .stress-box[data-level='effondré'] .stress-state {
    color: #fca5a5;
  }

  .stress-track {
    height: 0.32rem;
    margin-top: 0.32rem;
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.6);
    overflow: hidden;
  }

  .stress-track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #aedab5 0%, #fbbf24 50%, #dc2626 100%);
    transition: width 0.45s ease;
  }

  .stress-hint {
    color: rgba(237, 228, 201, 0.65);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.74rem;
    font-style: italic;
    margin: 0.32rem 0 0;
    line-height: 1.3;
  }

  .coh-tag {
    border: 1px solid rgba(244, 213, 139, 0.5);
    border-radius: 999px;
    padding: 0.1rem 0.55rem;
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    background: rgba(201, 154, 64, 0.08);
  }

  .legendary-line {
    color: rgba(237, 228, 201, 0.78);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.78rem;
    line-height: 1.35;
    font-style: italic;
    border-top: 1px solid rgba(237, 228, 201, 0.08);
    padding-top: 0.5rem;
  }

  .legendary-line b {
    color: #f4d58b;
    font-style: normal;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
  }
</style>
