<script lang="ts">
  /* ============================================================
     ManifStandalone — Manif Simulator en mode standalone
     Accessible via /mini/manif/
     Utilise un mock gameState réaliste pour découpler du moteur V2.
     ============================================================ */
  import ManifSimulator from '../org/ManifSimulator.svelte';
  import { MOCK_GAME_STATE } from '../../ateliers/mockGameState';
  import type { RebirthGameState } from '../../game/types';

  /* Le mock peut être rendu réactif si on veut
     permettre à l'utilisateur d'ajuster les paramètres de base. */
  let mockState = $state<RebirthGameState>({ ...MOCK_GAME_STATE });
</script>

<div class="min-h-screen bg-stone-950 text-parchment font-body">
  <!-- Header -->
  <header class="border-b border-stone-800 p-4">
    <div class="max-w-2xl mx-auto">
      <span class="text-xs uppercase tracking-widest text-stone-500">Atelier PARITAS</span>
      <h1 class="font-display text-gold text-xl mt-0.5">📢 Manif Simulator</h1>
      <p class="text-xs text-stone-400">Organiser une grève. 7 paramètres, zéro crash.</p>
    </div>
  </header>

  <!-- Bandeau mock -->
  <div class="max-w-2xl mx-auto px-4 pt-3">
    <div class="bg-amber-950/30 border border-amber-700/30 rounded px-3 py-2 text-xs text-amber-400/80">
      Mode démonstration — ressources simulées (Confiance 62, Caisse 45, RdF 48).
      Les effets ne sont pas appliqués à une partie réelle.
    </div>
  </div>

  <main class="max-w-2xl mx-auto p-4">
    <ManifSimulator gameState={mockState} />
  </main>
</div>
