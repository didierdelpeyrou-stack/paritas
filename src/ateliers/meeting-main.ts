/* ============================================================
   Atelier "Meeting Room" — entrée standalone
   Accessible en /mini/meeting/
   ============================================================ */
import { mount } from 'svelte';
import MeetingStandalone from '../components/ateliers/MeetingStandalone.svelte';
import '../app.css';

const target = document.getElementById('atelier-root');
if (target) {
  mount(MeetingStandalone, { target });
}
