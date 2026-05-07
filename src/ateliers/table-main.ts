/* ============================================================
   Atelier "La Table" — entrée standalone
   Accessible en /mini/table/
   ============================================================ */
import { mount } from 'svelte';
import LaTable from '../components/ateliers/LaTable.svelte';
import '../app.css';

const target = document.getElementById('atelier-root');
if (target) {
  mount(LaTable, {
    target,
    props: {
      embedded: false,
      startSide: null,   // 2 joueurs locaux
      onresolve: undefined,
      onskip: undefined
    }
  });
}
