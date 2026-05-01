<script lang="ts">
  /* ============================================================
     Paritas — entrée principale
     Intro narrative → boucle (scène → conséquence) → épilogue.
     ============================================================ */
  import { fade } from 'svelte/transition';
  import type { Camp } from '$lib/types';
  import type { RenderMode } from './game/types';
  import { rebirth } from './game/engine/gameState.svelte';
  import StartScreen from './components/intro/StartScreen.svelte';
  import GameShell from './components/layout/GameShell.svelte';

  let started = $state(false);

  function handleStart(opts: {
    name: string;
    camp: Camp;
    mode: RenderMode;
    legendaryId?: string;
  }) {
    rebirth.start(opts);
    started = true;
  }

  function handleReplay() {
    rebirth.reset();
    started = false;
  }
</script>

<svelte:head>
  <title>Paritas — 25 siècles de paritarisme</title>
</svelte:head>

<main class="min-h-dvh px-4 py-6 max-w-7xl mx-auto">
  {#if !started}
    <div in:fade={{ duration: 300 }}>
      <StartScreen onStart={handleStart} />
    </div>
  {:else}
    <div in:fade={{ duration: 300 }}>
      <GameShell onReplay={handleReplay} />
    </div>
  {/if}
</main>
