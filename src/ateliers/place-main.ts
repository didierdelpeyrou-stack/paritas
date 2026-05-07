/* ============================================================
   Atelier "La Place" — entrée standalone
   Accessible en /mini/place/
   ============================================================ */
import { mount } from 'svelte';
import LaPlace from '../components/ateliers/LaPlace.svelte';
import '../app.css';

const target = document.getElementById('atelier-root');
if (target) {
  mount(LaPlace, {
    target,
    props: {
      embedded: false,
      onresolve: undefined,   // standalone : pas d'effets V2
      onskip: undefined
    }
  });
}
