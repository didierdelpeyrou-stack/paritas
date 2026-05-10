/* ============================================================
   Démo du moteur dialectique — entrée /mini/table-arbiter/
   Permet de scénariser les 9 cellules de la matrice et de
   tester les déclenchements d'ateliers (Émeute, Marchandage,
   Conseil, Block Blast cotisations).
   ============================================================ */
import { mount } from 'svelte';
import TableArbiterDemo from '../components/paritarisme/TableArbiterDemo.svelte';
import '../app.css';

const target = document.getElementById('atelier-root');
if (target) {
  mount(TableArbiterDemo, { target });
}
