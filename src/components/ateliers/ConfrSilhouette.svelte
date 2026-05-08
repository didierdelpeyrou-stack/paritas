<!--
  ConfrSilhouette.svelte — figure SVG des manifestants ou CRS
  Extrait de Confrontation.svelte (ORDA-006 refacto, dette technique).
  Frontière UI/moteur respectée : pure présentation, aucune logique de jeu.
-->
<script lang="ts">
  interface Props {
    side: 'manif' | 'police';
    delayIndex: number;
  }
  const { side, delayIndex }: Props = $props();
</script>

{#if side === 'manif'}
  <div class="figure manif-figure" style="animation-delay: {delayIndex * 0.12}s">
    <svg width="18" height="36" viewBox="0 0 18 36" fill="none" aria-hidden="true">
      <circle cx="9" cy="6" r="5" fill="#c44a1a"/>
      <rect x="4" y="12" width="10" height="14" rx="2" fill="#c44a1a"/>
      <rect x="2" y="14" width="4" height="10" rx="2" fill="#a03818"/>
      <rect x="12" y="14" width="4" height="10" rx="2" fill="#a03818"/>
      <rect x="4" y="26" width="4" height="10" rx="2" fill="#7a2a10"/>
      <rect x="10" y="26" width="4" height="10" rx="2" fill="#7a2a10"/>
    </svg>
  </div>
{:else}
  <div class="figure police-figure" style="animation-delay: {delayIndex * 0.15}s">
    <svg width="20" height="36" viewBox="0 0 20 36" fill="none" aria-hidden="true">
      <!-- casque -->
      <rect x="3" y="0" width="14" height="10" rx="3" fill="#334466"/>
      <circle cx="10" cy="6" r="4" fill="#445577"/>
      <!-- bouclier -->
      <rect x="0" y="12" width="8" height="16" rx="1" fill="#2a3a55"/>
      <!-- corps -->
      <rect x="8" y="12" width="8" height="14" rx="2" fill="#334466"/>
      <rect x="16" y="14" width="4" height="10" rx="2" fill="#2a3a55"/>
      <rect x="4" y="26" width="4" height="10" rx="2" fill="#223344"/>
      <rect x="12" y="26" width="4" height="10" rx="2" fill="#223344"/>
    </svg>
  </div>
{/if}

<style>
  .figure {
    display: inline-block;
    animation: breathe 2.5s ease-in-out infinite;
  }
  @keyframes breathe {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-2px); }
  }
</style>
