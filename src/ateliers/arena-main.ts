/* ============================================================
   Atelier "Arena Brawl" — entrée standalone
   Accessible en /mini/arena/
   ============================================================ */
import { mount } from 'svelte';
import ArenaStandalone from '../components/ateliers/ArenaStandalone.svelte';
import '../app.css';

const target = document.getElementById('atelier-root');
if (target) {
  mount(ArenaStandalone, { target });
}
