<script lang="ts">
  /* ============================================================
     MeetingStandalone — Meeting Room en mode standalone
     Accessible via /mini/meeting/
     Utilise un mock gameState réaliste pour découpler du moteur V2.
     ============================================================ */
  import MeetingSimulator from '../org/MeetingSimulator.svelte';
  import { MOCK_GAME_STATE, MOCK_PATRON_GAME_STATE } from '../../ateliers/mockGameState';
  import type { RebirthGameState } from '../../game/types';
  import type { Camp } from '$lib/types';

  /* Argus IT B-IT4 : cast initial pour éviter le narrowing TS sur
     literal 'salarie' (sans cast, campChoice est typé comme la
     literal 'salarie' et la comparaison `=== 'patron'` est marquée
     "no overlap"). */
  let campChoice = $state('salarie' as Camp);
  const mockState = $derived<RebirthGameState>(
    campChoice === 'patron' ? MOCK_PATRON_GAME_STATE : MOCK_GAME_STATE
  );
</script>

<div class="min-h-screen bg-stone-950 text-parchment font-body">
  <!-- Header -->
  <header class="border-b border-stone-800 p-4">
    <div class="max-w-2xl mx-auto flex items-center justify-between">
      <div>
        <span class="text-xs uppercase tracking-widest text-stone-500">Atelier PARITAS</span>
        <h1 class="font-display text-gold text-xl mt-0.5">🤝 Meeting Room</h1>
        <p class="text-xs text-stone-400">Décision syndicale interne. Thème, arguments, slogan, posture.</p>
      </div>
      <!-- Toggle camp -->
      <div class="flex gap-1 text-xs">
        <button
          type="button"
          onclick={() => { campChoice = 'salarie'; }}
          class="px-3 py-1.5 rounded border transition-colors"
          class:border-red-700={campChoice === 'salarie'}
          class:text-red-400={campChoice === 'salarie'}
          class:bg-red-950={campChoice === 'salarie'}
          class:border-stone-700={campChoice !== 'salarie'}
          class:text-stone-400={campChoice !== 'salarie'}
        >Salarié</button>
        <button
          type="button"
          onclick={() => { campChoice = 'patron'; }}
          class="px-3 py-1.5 rounded border transition-colors"
          class:border-blue-700={campChoice === 'patron'}
          class:text-blue-400={campChoice === 'patron'}
          class:bg-blue-950={campChoice === 'patron'}
          class:border-stone-700={campChoice !== 'patron'}
          class:text-stone-400={campChoice !== 'patron'}
        >Patron</button>
      </div>
    </div>
  </header>

  <!-- Bandeau mock -->
  <div class="max-w-2xl mx-auto px-4 pt-3">
    <div class="bg-amber-950/30 border border-amber-700/30 rounded px-3 py-2 text-xs text-amber-400/80">
      Mode démonstration — ressources simulées (Légitimité 55, Caisse 45, Confiance 62).
      Les effets ne sont pas appliqués à une partie réelle.
    </div>
  </div>

  <main class="max-w-2xl mx-auto p-4">
    <MeetingSimulator gameState={mockState} />
  </main>
</div>
