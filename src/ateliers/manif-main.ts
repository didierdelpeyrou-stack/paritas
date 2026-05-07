/* ============================================================
   Atelier "Manif Simulator" — entrée standalone
   Accessible en /mini/manif/
   ============================================================ */
import { mount } from 'svelte';
import ManifStandalone from '../components/ateliers/ManifStandalone.svelte';
import '../app.css';

const target = document.getElementById('atelier-root');
if (target) {
  mount(ManifStandalone, { target });
}
