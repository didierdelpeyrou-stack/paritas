/* ============================================================
   Atelier "La Grève" — entrée standalone
   Accessible en /mini/greve/
   ============================================================ */
import { mount } from 'svelte';
import LaGreve from '../components/ateliers/LaGreve.svelte';
import '../app.css';

const target = document.getElementById('atelier-root');
if (target) {
  mount(LaGreve, {
    target,
    props: {
      embedded: false,
      startSide: null,   // 2 joueurs locaux
      onresolve: undefined,
      onskip: undefined
    }
  });
}
