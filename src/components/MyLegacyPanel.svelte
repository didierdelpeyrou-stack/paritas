<script lang="ts">
  /**
   * Panneau « Mon œuvre » — UX-N2.
   *
   * Neuro : effet de dotation (Thaler). Une institution stockée comme
   * ID dans un array est sémantiquement plate. La même institution
   * affichée comme une carte avec sceau, année, blurb activates le
   * cortex orbitofrontal — l'attachement double.
   *
   * Réutilisable où on veut donner au joueur la sensation de « ce que
   * j'ai construit ». Plus la liste s'allonge, plus la perte d'une
   * institution coûte (cf. UX-N1, aversion à la perte).
   */
  import { fly } from 'svelte/transition';
  import { institutionById } from '../game/content/institutionsRegistry';
  import type { Memory } from '../game/types';

  interface Props {
    memory: Memory;
  }
  let { memory }: Props = $props();

  const built = $derived(
    memory.builtInstitutions
      .map(id => institutionById(id))
      .filter((i): i is NonNullable<typeof i> => !!i)
  );
</script>

<section class="bordered-card p-4 space-y-3">
  <header class="flex items-baseline justify-between gap-2">
    <h3 class="font-display text-gold text-base">Mon œuvre</h3>
    <span class="text-xs italic text-parchment-dim/70">
      {built.length} institution{built.length > 1 ? 's' : ''} construite{built.length > 1 ? 's' : ''}
    </span>
  </header>

  {#if built.length === 0}
    <p class="text-xs italic text-parchment-dim/65 leading-relaxed">
      Tu n'as encore rien construit qui te survivra. Les institutions
      paritaires que tu fonderas viendront s'inscrire ici.
    </p>
  {:else}
    <ul class="institutions-grid">
      {#each built as inst, i (inst.id)}
        <li
          class="institution-card"
          in:fly={{ y: 6, duration: 280, delay: i * 60 }}
        >
          <span class="seal" aria-hidden="true">{inst.seal}</span>
          <div class="info">
            <b class="label">{inst.label}</b>
            <em class="year">{inst.year}</em>
            <small class="blurb">{inst.blurb}</small>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .institutions-grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
  }

  .institution-card {
    display: grid;
    grid-template-columns: 2.4rem 1fr;
    gap: 0.7rem;
    align-items: start;
    border: 1px solid rgba(244, 213, 139, 0.32);
    border-left-width: 3px;
    border-radius: 0.55rem;
    background:
      linear-gradient(135deg, rgba(201, 154, 64, 0.1), rgba(201, 154, 64, 0.04));
    padding: 0.6rem 0.7rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  }

  .seal {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.4rem;
    height: 2.4rem;
    border: 1px solid rgba(244, 213, 139, 0.45);
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.55);
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.2rem;
    line-height: 1;
  }

  .info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.18rem;
  }

  .label {
    color: #ede4c9;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.84rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .year {
    font-style: italic;
    color: #f4d58b;
    font-size: 0.74rem;
  }

  .blurb {
    color: rgba(237, 228, 201, 0.78);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.78rem;
    line-height: 1.35;
    margin-top: 0.15rem;
  }
</style>
