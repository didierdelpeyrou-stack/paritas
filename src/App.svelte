<script lang="ts">
  /* ============================================================
     Paritas — entrée principale
     Intro narrative → tutoriel (1ère fois) → boucle → épilogue.
     ============================================================ */
  import { fade } from 'svelte/transition';
  import type { Camp } from '$lib/types';
  import type { RenderMode } from './game/types';
  import { rebirth } from './game/engine/gameState.svelte';
  import StartScreen from './components/intro/StartScreen.svelte';
  import Tutorial from './components/intro/Tutorial.svelte';
  import GameShell from './components/layout/GameShell.svelte';
  import ToastStack from './components/feedback/ToastStack.svelte';
  import { loadAllScenarios } from './game/content/scenarios';
  import { loadPipelineContent } from './game/narrative/pipelineContent';

  const TUTORIAL_KEY = 'paritas_tutorial_seen_v1';

  /* Préload des chunks narratifs en parallèle de l'affichage du
     tutoriel / StartScreen — par le temps que le joueur lit/choisit,
     les ~95 KB de scénarios et 60 KB de contenu pipeline sont déjà
     arrivés. */
  const contentReady = Promise.all([loadAllScenarios(), loadPipelineContent()]);

  type Phase = 'intro' | 'start' | 'game';

  function tutorialAlreadySeen(): boolean {
    try {
      return localStorage.getItem(TUTORIAL_KEY) === '1';
    } catch {
      return false;
    }
  }

  function markTutorialSeen() {
    try {
      localStorage.setItem(TUTORIAL_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  /* Tutoriel d'abord pour les nouveaux joueurs : on explique le
     paritarisme et les postures AVANT de demander de choisir un camp
     ou un personnage. Ceux qui sont déjà passés vont droit à
     StartScreen. */
  let phase = $state<Phase>(tutorialAlreadySeen() ? 'start' : 'intro');

  function handleIntroDone() {
    markTutorialSeen();
    phase = 'start';
  }

  async function handleStart(opts: {
    name: string;
    camp: Camp;
    mode: RenderMode;
    legendaryId?: string;
  }) {
    await contentReady;
    rebirth.start(opts);
    phase = 'game';
  }

  function handleReplay() {
    rebirth.reset();
    phase = 'start';
  }
</script>

<svelte:head>
  <title>Paritas — 25 siècles de paritarisme</title>
</svelte:head>

<ToastStack />

<main class="min-h-dvh px-4 py-6 max-w-7xl mx-auto">
  {#if phase === 'intro'}
    <div in:fade={{ duration: 300 }}>
      <Tutorial onDone={handleIntroDone} />
    </div>
  {:else if phase === 'start'}
    <div in:fade={{ duration: 300 }}>
      <StartScreen onStart={handleStart} />
    </div>
  {:else}
    <div in:fade={{ duration: 300 }}>
      <GameShell onReplay={handleReplay} />
    </div>
  {/if}
</main>
