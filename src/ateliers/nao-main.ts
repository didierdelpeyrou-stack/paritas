/* ============================================================
   Atelier "La NAO" — entrée standalone
   Accessible en /mini/nao/
   ============================================================ */
import { mount } from 'svelte';
import NaoSimulation from '../components/ateliers/NaoSimulation.svelte';
import '../app.css';

const target = document.getElementById('atelier-root');
if (target) {
  mount(NaoSimulation, {
    target,
    props: {
      embedded: false,
      startSide: null,   // 2 joueurs locaux (hot-seat)
      onresolve: undefined,
      onskip: undefined
    }
  });
}
