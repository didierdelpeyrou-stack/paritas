<script lang="ts">
  /* ============================================================
     ArenaStandalone — configurateur + combat Place de la République
     Accessible via /mini/arena/
     ============================================================ */
  import { fade } from 'svelte/transition';
  import BrawlArena from '../org/BrawlArena.svelte';
  import {
    buildPlayerFaction,
    buildAdversaryFaction,
    resolveBrawl,
    type FactionRoster,
    type BrawlOutcome
  } from '../../game/org/factionBrawl';

  /* Config joueur */
  let fouleParis = $state(800);     // manifestants à République
  let militants   = $state(9);      // cadres permanents
  let cohesion    = $state(65);     // cohésion interne 0-100
  let policePressure = $state(55);  // pression policière 0-100

  /* État de la simulation */
  let arena = $state<{
    joueur: FactionRoster;
    adversaire: FactionRoster;
    outcome: BrawlOutcome;
  } | null>(null);

  function launch() {
    const joueur = buildPlayerFaction({
      camp: 'salarie',
      fouleParis,
      militants: 5000,
      cadres: militants,
      cohesion
    });
    const adversaire = buildAdversaryFaction({
      camp: 'salarie',
      fouleParis,
      era: 'trente_glorieuses',
      policePressure
    });
    const outcome = resolveBrawl({ joueur, adversaire });
    arena = { joueur, adversaire, outcome };
  }

  function reset() {
    arena = null;
  }
</script>

<div class="min-h-screen bg-stone-950 text-parchment font-body">
  <!-- Header -->
  <header class="border-b border-stone-800 p-4">
    <div class="max-w-2xl mx-auto">
      <span class="text-xs uppercase tracking-widest text-stone-500">Atelier PARITAS</span>
      <h1 class="font-display text-gold text-xl mt-0.5">⚔️ Arena Brawl</h1>
      <p class="text-xs text-stone-400">Place de la République · Factions s'affrontent</p>
    </div>
  </header>

  <main class="max-w-2xl mx-auto p-4 space-y-6">

    {#if !arena}
      <!-- Configurateur -->
      <div in:fade={{ duration: 200 }} class="space-y-5">
        <div class="bg-stone-900 border border-stone-700 rounded-lg p-4 space-y-4">
          <div class="text-xs uppercase tracking-widest text-stone-500">Configurer le rapport de force</div>

          <!-- Foule -->
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-stone-300">Manifestants à République</span>
              <span class="text-gold font-medium">{fouleParis.toLocaleString('fr')}</span>
            </div>
            <input
              type="range" min="100" max="5000" step="100"
              bind:value={fouleParis}
              class="w-full accent-gold"
            />
            <div class="flex justify-between text-[10px] text-stone-600 mt-0.5">
              <span>100</span><span>5 000</span>
            </div>
          </div>

          <!-- Cadres -->
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-stone-300">Cadres permanents (service d'ordre)</span>
              <span class="text-gold font-medium">{militants}</span>
            </div>
            <input
              type="range" min="2" max="30" step="1"
              bind:value={militants}
              class="w-full accent-gold"
            />
          </div>

          <!-- Cohésion -->
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-stone-300">Cohésion interne</span>
              <span class="text-gold font-medium">{cohesion}/100</span>
            </div>
            <input
              type="range" min="10" max="100" step="5"
              bind:value={cohesion}
              class="w-full accent-gold"
            />
            <div class="text-[10px] text-stone-600 mt-0.5">
              {cohesion < 40 ? '⚠ Cohésion < 40 : éléments de coup de force possibles' : '✓ Mouvement discipliné'}
            </div>
          </div>

          <!-- Pression police -->
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-stone-300">Pression policière (CRS)</span>
              <span class="text-gold font-medium">{policePressure}/100</span>
            </div>
            <input
              type="range" min="10" max="100" step="5"
              bind:value={policePressure}
              class="w-full accent-gold"
            />
          </div>
        </div>

        <!-- Prévisualisation factions -->
        {#snippet factionPreview()}
          {#if fouleParis > 0}
            {@const j = buildPlayerFaction({ camp: 'salarie', fouleParis, militants: 5000, cadres: militants, cohesion })}
            {@const a = buildAdversaryFaction({ camp: 'salarie', fouleParis, era: 'trente_glorieuses', policePressure })}
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-red-950/30 border border-red-800/30 rounded p-3">
                <div class="text-red-400 font-medium mb-1">✊ {j.label}</div>
                <div class="text-stone-400">Pouvoir : <span class="text-gold">{j.power}</span></div>
                <div class="text-stone-400">Combattants : <span class="text-gold">{j.total}</span></div>
              </div>
              <div class="bg-blue-950/30 border border-blue-800/30 rounded p-3">
                <div class="text-blue-400 font-medium mb-1">🛂 {a.label}</div>
                <div class="text-stone-400">Pouvoir : <span class="text-gold">{a.power}</span></div>
                <div class="text-stone-400">Combattants : <span class="text-gold">{a.total}</span></div>
              </div>
            </div>
          {/if}
        {/snippet}
        {@render factionPreview()}

        <button
          type="button"
          onclick={launch}
          class="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-700/60 text-red-300 hover:text-red-200 rounded-lg py-3 text-sm font-medium transition-colors"
        >
          ⚔️ Lancer la confrontation
        </button>
      </div>

    {:else}
      <!-- Arena en cours -->
      <div in:fade={{ duration: 200 }}>
        <BrawlArena
          joueur={arena.joueur}
          adversaire={arena.adversaire}
          outcome={arena.outcome}
          onClose={(rallyCount) => {
            console.info('[Arena standalone] rallies déclenchés:', rallyCount);
            reset();
          }}
        />
      </div>
    {/if}
  </main>
</div>
