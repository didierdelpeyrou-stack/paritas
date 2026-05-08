<script lang="ts">
  /* ============================================================
     ScenePreviewOverlay — halo sépia discret derrière le SceneCard
     ============================================================
     ORDA-015 : ancien rendu (silhouette SVG plume/foule/poignée +
     mot Cinzel géant en filigrane) retiré sur retour utilisateur —
     trop envahissant et redondant avec le posture-tag en tête de
     chaque choice card. Le type de choix est désormais indiqué :
     - dans la card : glyph + label posture + accent color (border)
     - en hover : halo border subtil via [data-preview-posture] dans
       SceneCard.svelte (lignes 484-499)

     Le store `scenePreview` est conservé : il alimente toujours
     `data-preview-posture` sur la card pour le halo de bordure.
     Ce composant ne rend plus rien visuellement.
     ============================================================ */
  import { scenePreview } from '$lib/stores/scenePreview.svelte';

  const preview = $derived(scenePreview.current);
</script>

{#if preview}
  <div class="preview-overlay"
    aria-hidden="true"
    data-posture={preview.posture}
  ></div>
{/if}

<style>
  /* Wrapper invisible — uniquement présent pour conserver le hook
     `data-posture` au cas où une future expérimentation visuelle
     (gradient subtil, vignette colorée) voudrait s'y accrocher. */
  .preview-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
  }
</style>
