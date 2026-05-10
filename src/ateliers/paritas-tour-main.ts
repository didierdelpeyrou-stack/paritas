/* ============================================================
   Démo "Tour complet" — entrée /mini/paritas-tour/
   Met en scène un tour PARITAS : Pupitre Direction × Pupitre
   Intersyndicale → Table paritaire → arbitrage → résultat.
   ============================================================ */
import { mount } from 'svelte';
import ParitasTourDemo from '../components/paritarisme/ParitasTourDemo.svelte';
import '../app.css';

const target = document.getElementById('atelier-root');
if (target) {
  mount(ParitasTourDemo, { target });
}
