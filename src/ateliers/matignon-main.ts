/* ============================================================
   Atelier "Matignon 1936" — entrée standalone
   Accessible en /mini/matignon/
   ============================================================ */
import { mount } from 'svelte';
import MatignonStandalone from '../components/ateliers/MatignonStandalone.svelte';
import '../app.css';

const target = document.getElementById('atelier-root');
if (target) {
  mount(MatignonStandalone, { target });
}
