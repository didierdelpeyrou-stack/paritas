/* ============================================================
   Atelier "La Rue" — entrée standalone
   Accessible en /mini/confrontation/
   ============================================================ */
import { mount } from 'svelte';
import Confrontation from '../components/ateliers/Confrontation.svelte';
import '../app.css';

const target = document.getElementById('atelier-root');
if (target) {
  mount(Confrontation, {
    target,
    props: {
      embedded: false,
      startSide: null,        // 2 joueurs locaux (pas d'IA)
      onresolve: undefined,   // standalone : pas d'effets V2
      onskip: undefined       // standalone : pas de skip
    }
  });
}
