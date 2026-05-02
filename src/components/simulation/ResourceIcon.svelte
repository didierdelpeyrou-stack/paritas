<script lang="ts">
  /**
   * Pictogramme par ressource — UX-5.
   *
   * Neuro : cognition incarnée (Lakoff, Barsalou). Une jauge
   * abstraite n'active que les aires numériques pariétales. Un
   * pictogramme qui se remplit / se vide active le cortex
   * prémoteur (manipulation d'objet) ET le cortex visuel — donc
   * un encodage double, plus durable.
   *
   * Chaque ressource a sa métaphore corporelle :
   * - caisse → pile de pièces dans un coffre
   * - confiance → silhouettes de militants (luminosité)
   * - santeSociale → battement de cœur (amplitude)
   * - legitimite → laurier (densité de feuilles)
   * - rapportDeForce → poing dressé (montée/descente)
   * - institution → colonne (hauteur de fût)
   */
  import type { ResourceKey } from '../../game/types';

  interface Props {
    resource: ResourceKey;
    value: number; // 0-100
    size?: number; // px
  }
  let { resource, value, size = 36 }: Props = $props();

  const v = $derived(Math.max(0, Math.min(100, value)));
  /* On segmente sur 5 paliers (0, 20, 40, 60, 80, 100) pour que les
     jauges discrètes (pile de 5 pièces, etc.) parlent immédiatement. */
  const tier = $derived(Math.round(v / 20)); // 0..5
</script>

<svg
  class="resource-icon"
  width={size}
  height={size}
  viewBox="0 0 36 36"
  aria-hidden="true"
>
  {#if resource === 'caisse'}
    <!-- Coffre stylisé avec pièces empilées : tier détermine la
         hauteur de la pile -->
    <rect x="6" y="22" width="24" height="10" rx="1.5"
          fill="rgba(13,16,20,0.55)"
          stroke="rgba(244,213,139,0.6)" stroke-width="1" />
    <rect x="6" y="22" width="24" height="3"
          fill="rgba(244,213,139,0.18)" />
    {#each Array.from({ length: tier }) as _, i}
      <ellipse
        cx={9 + i * 4.5}
        cy={20 - i * 0.4}
        rx="2.2"
        ry="0.9"
        fill="#f4d58b"
        opacity={0.85 - i * 0.08}
      />
    {/each}
  {:else if resource === 'confiance'}
    <!-- Cinq silhouettes de militants. Chaque palier en allume une. -->
    {#each [0, 1, 2, 3, 4] as i}
      {@const lit = i < tier}
      <g opacity={lit ? 1 : 0.22}>
        <circle cx={5 + i * 6.5} cy="14" r="2.2"
                fill={lit ? '#f4d58b' : 'rgba(237,228,201,0.4)'} />
        <path d="M{3 + i * 6.5} 18 Q{5 + i * 6.5} 30 {7 + i * 6.5} 18 Z"
              fill={lit ? '#f4d58b' : 'rgba(237,228,201,0.4)'} />
      </g>
    {/each}
  {:else if resource === 'santeSociale'}
    <!-- ECG : ligne de battement plus ou moins ample -->
    {@const amp = 4 + tier * 1.6}
    <path
      d="M2 18 L8 18 L10 {18 - amp} L13 {18 + amp} L16 {18 - amp * 0.6} L18 18 L34 18"
      fill="none"
      stroke={tier >= 2 ? '#10b981' : tier >= 1 ? '#f59e0b' : '#dc2626'}
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="18" cy="18" r="1.5"
            fill={tier >= 2 ? '#10b981' : tier >= 1 ? '#f59e0b' : '#dc2626'} />
  {:else if resource === 'legitimite'}
    <!-- Couronne de laurier : nombre de feuilles ↗ avec tier -->
    <circle cx="18" cy="20" r="9" fill="none"
            stroke="rgba(244,213,139,0.4)" stroke-width="0.8" />
    {#each Array.from({ length: tier * 2 }) as _, i}
      {@const angle = (i / 10) * 360 - 90}
      {@const cx = 18 + Math.cos(angle * Math.PI / 180) * 9}
      {@const cy = 20 + Math.sin(angle * Math.PI / 180) * 9}
      <ellipse
        cx={cx}
        cy={cy}
        rx="2.2"
        ry="1"
        transform="rotate({angle + 90} {cx} {cy})"
        fill="#f4d58b"
        opacity="0.85"
      />
    {/each}
  {:else if resource === 'rapportDeForce'}
    <!-- Poing dressé : hauteur du bras dépend du tier -->
    {@const armBottom = 32}
    {@const armTop = 30 - tier * 4}
    <rect x="16" y={armTop + 4} width="4" height={armBottom - armTop - 4}
          fill="rgba(244,213,139,0.85)" />
    <!-- Poing -->
    <circle cx="18" cy={armTop + 2} r="3.5" fill="#f4d58b" />
    <line x1="14.5" y1={armTop + 2} x2="21.5" y2={armTop + 2}
          stroke="rgba(13,16,20,0.55)" stroke-width="0.6" />
    <line x1="14.5" y1={armTop + 0.5} x2="21.5" y2={armTop + 0.5}
          stroke="rgba(13,16,20,0.4)" stroke-width="0.4" />
  {:else if resource === 'institution'}
    <!-- Colonne dorique : hauteur du fût = tier -->
    {@const colTop = 28 - tier * 4}
    <!-- Base -->
    <rect x="9" y="29" width="18" height="3" fill="rgba(244,213,139,0.7)" />
    <!-- Fût -->
    <rect x="11" y={colTop} width="14" height={29 - colTop}
          fill="rgba(244,213,139,0.55)" />
    <!-- Cannelures -->
    {#if tier >= 1}
      {#each [13, 16, 19, 22] as fluteX}
        <line x1={fluteX} y1={colTop + 1} x2={fluteX} y2="28"
              stroke="rgba(13,16,20,0.4)" stroke-width="0.5" />
      {/each}
    {/if}
    <!-- Chapiteau -->
    {#if tier >= 1}
      <rect x="9" y={colTop - 2} width="18" height="2"
            fill="rgba(244,213,139,0.85)" />
    {/if}
  {/if}
</svg>

<style>
  .resource-icon {
    display: inline-block;
    flex-shrink: 0;
  }
</style>
