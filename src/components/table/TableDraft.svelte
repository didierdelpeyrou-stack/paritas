<script lang="ts">
  /* Le draft d'accord au centre de la table — articles en cours,
     soutiens et oppositions matérialisés. */
  import type { AccordArticle, Actor } from '$lib/table/types';

  interface Props {
    articles: AccordArticle[];
    actors: Actor[];
  }
  let { articles, actors }: Props = $props();

  function actorName(id: string): string {
    return actors.find(a => a.persona.id === id)?.persona.name.split(' ').slice(-1)[0] ?? id;
  }

  function actorColor(id: string): string {
    const colors: Record<string, string> = {
      croizat: '#B0181E', laroque: '#1E5C8A', parodi: '#5C2D5C', buisson: '#7A5C3A'
    };
    return colors[id] ?? '#C9B26A';
  }
</script>

<section class="draft" aria-labelledby="draft-title">
  <h2 id="draft-title" class="draft-title">
    <span class="draft-ornament" aria-hidden="true">❦</span>
    Projet d'accord
    <span class="draft-ornament" aria-hidden="true">❦</span>
  </h2>

  {#if articles.length === 0}
    <p class="empty">Aucun article au draft. La séance commence.</p>
  {:else}
    <ol class="articles">
      {#each articles as art, i (art.id)}
        <li class="article">
          <div class="article-num">Art. {i + 1}</div>
          <p class="article-text">{art.text}</p>
          <div class="article-supports">
            {#if art.proposedBy.length > 0}
              <div class="supports-line">
                <span class="supports-label">Soutiens :</span>
                {#each art.proposedBy as id}
                  <span class="chip" style:--c={actorColor(id)}>{actorName(id)}</span>
                {/each}
              </div>
            {/if}
            {#if art.opposedBy.length > 0}
              <div class="supports-line opposes">
                <span class="supports-label">Oppositions :</span>
                {#each art.opposedBy as id}
                  <span class="chip chip-opp" style:--c={actorColor(id)}>{actorName(id)}</span>
                {/each}
              </div>
            {/if}
          </div>
        </li>
      {/each}
    </ol>
  {/if}
</section>

<style>
  .draft {
    background:
      radial-gradient(ellipse at center top, rgba(244, 213, 140, 0.08), transparent 70%),
      linear-gradient(180deg, #FFF8E5 0%, #F4EFE2 100%);
    border: 1px solid rgba(140, 110, 64, 0.4);
    border-radius: 0.5rem;
    padding: 1rem 1.2rem;
    color: #1A1411;
    font-family: 'Source Serif 4', Georgia, serif;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      0 4px 14px rgba(0, 0, 0, 0.18);
  }

  .draft-title {
    margin: 0 0 0.85rem;
    text-align: center;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.05rem;
    color: #5A2F1C;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.7rem;
  }

  .draft-ornament {
    color: rgba(201, 178, 106, 0.6);
    font-size: 1.1rem;
  }

  .empty {
    text-align: center;
    font-style: italic;
    color: rgba(26, 20, 17, 0.55);
    margin: 1rem 0;
  }

  .articles {
    list-style: none;
    counter-reset: articles;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .article {
    display: grid;
    grid-template-columns: 4.5rem 1fr;
    gap: 0.6rem;
    padding: 0.55rem 0.7rem;
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(140, 110, 64, 0.25);
    border-radius: 0.35rem;
  }

  .article-num {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    color: #5A2F1C;
    letter-spacing: 0.04em;
    padding-top: 0.1rem;
  }

  .article-text {
    margin: 0;
    line-height: 1.5;
    font-size: 0.92rem;
    color: #1A1411;
    grid-column: 2;
  }

  .article-supports {
    grid-column: 2;
    margin-top: 0.35rem;
    font-size: 0.78rem;
  }

  .supports-line {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.3rem;
    margin-top: 0.2rem;
  }

  .supports-label {
    font-style: italic;
    color: rgba(26, 20, 17, 0.6);
    margin-right: 0.2rem;
  }

  .chip {
    --c: #C9B26A;
    display: inline-block;
    padding: 0.1rem 0.5rem;
    background: color-mix(in srgb, var(--c) 18%, transparent);
    color: color-mix(in srgb, var(--c) 80%, #1A1411);
    border: 1px solid color-mix(in srgb, var(--c) 40%, transparent);
    border-radius: 0.25rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    letter-spacing: 0.04em;
  }

  .chip-opp {
    background: color-mix(in srgb, #B0181E 12%, transparent);
    border-color: rgba(176, 24, 30, 0.4);
    color: #6B1014;
  }
</style>
