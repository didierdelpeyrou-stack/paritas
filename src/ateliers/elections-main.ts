/* ============================================================
   Atelier "Les Élections Professionnelles" — entrée standalone
   Accessible en /mini/elections/
   ============================================================ */
import { mount } from 'svelte';
import LesElections from '../components/ateliers/LesElections.svelte';
import '../app.css';

const target = document.getElementById('atelier-root');
if (target) {
  mount(LesElections, {
    target,
    props: {
      embedded: false,
      startSide: null,   // 2 joueurs locaux
      onresolve: undefined,
      onskip: undefined
    }
  });
}
