<script lang="ts">
  /* ============================================================
     ScenePreviewOverlay — silhouette sépia derrière le SceneCard
     ============================================================
     Rendu en position absolue dans le sky central, derrière le
     SceneCard, avec opacité progressive au hover des choices.
     Une silhouette différente par posture, un mot Cinzel en
     filigrane.

     Pointeur events : none (ne capture pas les clics — la
     SceneCard reste interactive par-dessus).

     Cf. critique designer §Manie 1.
     ============================================================ */
  import { fade } from 'svelte/transition';
  import { scenePreview } from '$lib/stores/scenePreview.svelte';

  const preview = $derived(scenePreview.current);
</script>

{#if preview}
  <div class="preview-overlay"
    in:fade={{ duration: 240 }} out:fade={{ duration: 200 }}
    aria-hidden="true"
    data-posture={preview.posture}
  >
    <!-- Silhouette SVG par posture, sépia translucide, géant en
         arrière-plan (pas spoiler — c'est une icône de l'archétype
         du choix). -->
    <svg viewBox="0 0 400 300" class="silhouette" preserveAspectRatio="xMidYMid meet">
      {#if preview.posture === 'institution'}
        <!-- Une main qui signe : plume + parchemin -->
        <g fill="currentColor" opacity="0.9">
          <rect x="80" y="170" width="240" height="6" opacity="0.3"/>
          <path d="M 100 170 Q 180 150 260 170 L 280 200 Q 200 215 95 200 Z"
                opacity="0.20"/>
          <path d="M 200 60 L 215 75 L 240 100 L 260 130 L 270 165
                   L 250 175 L 235 155 L 220 130 L 205 105 L 195 80 Z"
                opacity="0.55"/>
          <line x1="200" y1="60" x2="270" y2="165" stroke="currentColor" stroke-width="1.6" opacity="0.7"/>
        </g>
      {:else if preview.posture === 'rupture'}
        <!-- Une foule qui marche, drapeaux levés -->
        <g fill="currentColor" opacity="0.85">
          {#each [60, 100, 140, 180, 220, 260, 300, 340] as cx, i}
            {@const dy = (i % 3) * 4}
            <ellipse cx={cx} cy={150 + dy} rx="14" ry="6" opacity="0.20"/>
            <path d={`M ${cx - 8} ${158 + dy} L ${cx - 8} ${230 + dy} L ${cx + 8} ${230 + dy} L ${cx + 8} ${158 + dy} Z`} opacity="0.32"/>
            <circle cx={cx} cy={148 + dy} r="9" opacity="0.55"/>
            {#if i % 2 === 0}
              <line x1={cx - 4} y1={150 + dy} x2={cx - 4} y2={70 + dy} stroke="currentColor" stroke-width="1.4" opacity="0.7"/>
              <path d={`M ${cx - 4} ${70 + dy} L ${cx + 18} ${75 + dy} L ${cx - 4} ${88 + dy} Z`} opacity="0.7"/>
            {/if}
          {/each}
        </g>
      {:else if preview.posture === 'compromis'}
        <!-- Deux mains qui se serrent -->
        <g fill="currentColor" opacity="0.85">
          <path d="M 100 150 Q 130 130 170 145 L 210 150 L 230 158 L 230 178
                   L 210 175 L 175 175 Q 135 175 100 165 Z" opacity="0.55"/>
          <path d="M 300 150 Q 270 130 230 145 L 190 150 L 170 158 L 170 178
                   L 190 175 L 225 175 Q 265 175 300 165 Z" opacity="0.55"/>
          <ellipse cx="200" cy="165" rx="32" ry="14" opacity="0.30"/>
          <line x1="100" y1="150" x2="60" y2="120" stroke="currentColor" stroke-width="3" opacity="0.4"/>
          <line x1="300" y1="150" x2="340" y2="120" stroke="currentColor" stroke-width="3" opacity="0.4"/>
        </g>
      {:else if preview.posture === 'expertise'}
        <!-- Un compas + plan -->
        <g fill="none" stroke="currentColor" stroke-linecap="round" opacity="0.7">
          <rect x="80" y="80" width="240" height="160" stroke-width="1.2" opacity="0.25" fill="currentColor" fill-opacity="0.05"/>
          <line x1="100" y1="120" x2="300" y2="120" stroke-width="0.8" opacity="0.4"/>
          <line x1="100" y1="160" x2="300" y2="160" stroke-width="0.8" opacity="0.4"/>
          <line x1="100" y1="200" x2="300" y2="200" stroke-width="0.8" opacity="0.4"/>
          <circle cx="200" cy="160" r="55" stroke-width="1.6"/>
          <line x1="200" y1="160" x2="252" y2="115" stroke-width="2.2"/>
          <line x1="200" y1="160" x2="148" y2="115" stroke-width="2.2"/>
          <circle cx="200" cy="160" r="3" fill="currentColor"/>
        </g>
      {:else if preview.posture === 'opinion'}
        <!-- Tribune + micro -->
        <g fill="currentColor" opacity="0.8">
          <path d="M 160 100 Q 200 90 240 100 L 250 230 L 150 230 Z" opacity="0.45"/>
          <circle cx="200" cy="80" r="12" opacity="0.6"/>
          <line x1="200" y1="60" x2="200" y2="40" stroke="currentColor" stroke-width="2" opacity="0.7"/>
          <ellipse cx="200" cy="38" rx="6" ry="9" opacity="0.85"/>
          <!-- Ondes -->
          <path d="M 220 50 Q 240 50 250 70" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/>
          <path d="M 230 40 Q 260 45 280 75" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>
          <path d="M 180 50 Q 160 50 150 70" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/>
          <path d="M 170 40 Q 140 45 120 75" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>
        </g>
      {:else if preview.posture === 'paternaliste'}
        <!-- Un toit + foyer -->
        <g fill="currentColor" opacity="0.8">
          <path d="M 100 170 L 200 80 L 300 170 Z" opacity="0.55"/>
          <rect x="130" y="170" width="140" height="80" opacity="0.4"/>
          <rect x="180" y="200" width="40" height="50" opacity="0.6"/>
          <circle cx="200" cy="150" r="8" opacity="0.8"/>
          <path d="M 192 158 Q 200 170 208 158" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.7"/>
        </g>
      {:else}
        <!-- Neutre : balance suspendue -->
        <g fill="currentColor" opacity="0.7">
          <line x1="200" y1="60" x2="200" y2="160" stroke="currentColor" stroke-width="2" opacity="0.6"/>
          <line x1="120" y1="120" x2="280" y2="120" stroke="currentColor" stroke-width="1.6" opacity="0.6"/>
          <ellipse cx="120" cy="170" rx="36" ry="8" opacity="0.45"/>
          <ellipse cx="280" cy="170" rx="36" ry="8" opacity="0.45"/>
          <line x1="120" y1="120" x2="120" y2="170" stroke="currentColor" stroke-width="1" opacity="0.5"/>
          <line x1="280" y1="120" x2="280" y2="170" stroke="currentColor" stroke-width="1" opacity="0.5"/>
          <circle cx="200" cy="60" r="4" opacity="0.7"/>
        </g>
      {/if}
    </svg>

    <!-- Mot en filigrane (la nature du geste, pas son contenu). -->
    <div class="filigrane">
      <span class="word">{preview.label}</span>
      <span class="intent">{preview.intent}</span>
    </div>
  </div>
{/if}

<style>
  .preview-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    z-index: 0;
    /* Teinte sépia chaude — l'image n'est jamais une photo, toujours
       une marge encrée sur le parchemin. Opacité boostée à 0.80 pour
       être visible à travers la SceneCard rendue semi-transparente
       (cf. retour panel — la silhouette était quasi-invisible avant). */
    color: rgba(122, 80, 40, 0.80);
  }

  /* Mobile / tactile : désactiver l'overlay (l'effet hover Safari iOS
     reste collé après un tap et superpose le mot CINZEL géant au-dessus
     du texte du choix → illisible). Capture user 2026-05-04. */
  @media (max-width: 768px), (hover: none) and (pointer: coarse) {
    .preview-overlay { display: none; }
  }

  .silhouette {
    position: absolute;
    width: min(78%, 580px);
    max-height: 70%;
    opacity: 1;
    filter: blur(0.3px);
  }

  /* Variantes de teinte par posture (visibles désormais à travers
     le card semi-transparent). */
  .preview-overlay[data-posture='rupture']      { color: rgba(180, 70, 55, 0.75); }
  .preview-overlay[data-posture='institution']  { color: rgba(70, 110, 160, 0.75); }
  .preview-overlay[data-posture='compromis']    { color: rgba(190, 145, 60, 0.80); }
  .preview-overlay[data-posture='expertise']    { color: rgba(110, 160, 135, 0.75); }
  .preview-overlay[data-posture='opinion']      { color: rgba(155, 120, 195, 0.75); }
  .preview-overlay[data-posture='paternaliste'] { color: rgba(115, 155, 95, 0.75); }

  .filigrane {
    position: absolute;
    bottom: 7%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    text-align: center;
    color: rgba(244, 213, 140, 0.85);
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
    pointer-events: none;
    max-width: 80%;
  }
  .word {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.1rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 700;
  }
  .intent {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.78rem;
    font-style: italic;
    line-height: 1.3;
    opacity: 0.85;
  }
</style>
