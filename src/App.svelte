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
     StartScreen — par le temps que le joueur lit/choisit, les ~95 KB
     de scénarios et 60 KB de contenu pipeline sont déjà arrivés. */
  const contentReady = Promise.all([loadAllScenarios(), loadPipelineContent()]);

  type Phase = 'start' | 'tutorial' | 'game';

  let phase = $state<Phase>('start');
  let pendingStart = $state<{
    name: string;
    camp: Camp;
    mode: RenderMode;
    legendaryId?: string;
  } | null>(null);

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

  async function handleStart(opts: {
    name: string;
    camp: Camp;
    mode: RenderMode;
    legendaryId?: string;
  }) {
    await contentReady;
    if (tutorialAlreadySeen()) {
      rebirth.start(opts);
      phase = 'game';
      return;
    }
    pendingStart = opts;
    phase = 'tutorial';
  }

  async function handleTutorialDone() {
    if (!pendingStart) {
      phase = 'start';
      return;
    }
    await contentReady;
    markTutorialSeen();
    rebirth.start(pendingStart);
    pendingStart = null;
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
  {#if phase === 'start'}
    <div in:fade={{ duration: 300 }}>
      <StartScreen onStart={handleStart} />
    </div>
  {:else if phase === 'tutorial'}
    <div in:fade={{ duration: 300 }}>
      <Tutorial onDone={handleTutorialDone} />
    </div>
  {:else}
    <div in:fade={{ duration: 300 }}>
      <GameShell onReplay={handleReplay} />
    </div>
  {/if}
</main>
