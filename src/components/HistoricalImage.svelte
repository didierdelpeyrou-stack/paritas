<script lang="ts">
  import { imageFor } from '../game/content/historicalImages';

  interface Props {
    /** ID dans le catalogue (id de personnage ou de scénario). */
    id: string | undefined | null;
    /** Hauteur cible en CSS, ex. '180px'. Largeur s'adapte. */
    height?: string;
    /** Variante visuelle : 'portrait' (carré) ou 'tableau' (paysage). */
    shape?: 'portrait' | 'tableau';
  }

  let { id, height = '180px', shape = 'tableau' }: Props = $props();
  const img = $derived(imageFor(id));

  let failed = $state(false);
</script>

{#if img && !failed}
  <figure class="historical" data-shape={shape} style="--h: {height};">
    <img
      src={img.src}
      alt={img.alt}
      loading="lazy"
      decoding="async"
      onerror={() => (failed = true)}
    />
    <figcaption>{img.credit}</figcaption>
  </figure>
{:else if img && failed}
  <!-- Fallback parchemin discret quand l'image ne charge pas. -->
  <div class="parchment-fallback" data-shape={shape} style="--h: {height};" aria-hidden="true">
    <span>archive indisponible</span>
  </div>
{/if}

<style>
  .historical {
    margin: 0;
    border: 1px solid rgba(200, 155, 60, 0.45);
    border-radius: 0.5rem;
    overflow: hidden;
    background:
      radial-gradient(ellipse at 30% 20%, rgba(200, 155, 60, 0.16) 0%, transparent 55%),
      linear-gradient(180deg, rgba(13, 16, 20, 0.85), rgba(13, 16, 20, 0.65));
  }

  .historical[data-shape='portrait'] {
    width: var(--h);
    aspect-ratio: 3 / 4;
  }

  .historical[data-shape='tableau'] {
    width: 100%;
    aspect-ratio: 16 / 9;
  }

  .historical img {
    width: 100%;
    height: calc(var(--h) - 1.4rem);
    object-fit: cover;
    display: block;
    /* Sépia léger pour cohérence avec la palette parchemin du jeu. */
    filter: grayscale(0.18) sepia(0.12) contrast(0.96);
  }

  .historical[data-shape='tableau'] img {
    height: auto;
    aspect-ratio: 16 / 9;
  }

  .historical figcaption {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: rgba(237, 228, 201, 0.6);
    padding: 0.32rem 0.55rem;
    background: rgba(13, 16, 20, 0.55);
    border-top: 1px solid rgba(200, 155, 60, 0.2);
  }

  .parchment-fallback {
    border: 1px dashed rgba(200, 155, 60, 0.35);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.32);
    color: rgba(237, 228, 201, 0.45);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--h);
  }

  .parchment-fallback[data-shape='portrait'] {
    width: var(--h);
    aspect-ratio: 3 / 4;
  }

  .parchment-fallback[data-shape='tableau'] {
    width: 100%;
    aspect-ratio: 16 / 9;
    height: auto;
  }
</style>
