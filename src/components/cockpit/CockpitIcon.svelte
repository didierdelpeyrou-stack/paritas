<script lang="ts">
  /* Composant générique d'affichage des icônes paritaires.
     Utilise currentColor → couleur héritée du parent. */
  import { ICONS, type IconKey } from './icons';

  interface Props {
    name: IconKey;
    size?: number;
    class?: string;
    /** Aria-label : si présent, l'icône devient role="img" et lisible.
     *  Sinon elle est purement décorative (aria-hidden). */
    label?: string;
  }
  let { name, size = 20, class: cls = '', label }: Props = $props();
</script>

<svg
  viewBox="0 0 24 24"
  width={size}
  height={size}
  class="cockpit-icon {cls}"
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : true}
  fill="none"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  {@html ICONS[name]}
</svg>

<style>
  .cockpit-icon {
    display: inline-block;
    flex-shrink: 0;
    color: inherit;
    /* Pour transitions douces de couleur (hover, active states) */
    transition: color 0.2s ease, opacity 0.2s ease, transform 0.2s ease;
  }
</style>
