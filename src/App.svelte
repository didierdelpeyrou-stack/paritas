<script lang="ts">
  /* ============================================================
     Paritas — entrée principale
     Landing → tutoriel (1ère fois) → slot → start → boucle → épilogue.
     ============================================================ */
  import { fade } from 'svelte/transition';
  import type { Camp } from '$lib/types';
  import type { RenderMode } from './game/types';
  import { rebirth, setActiveSlot } from './game/engine/gameState.svelte';
  import Landing from './components/intro/Landing.svelte';
  import StartScreen from './components/intro/StartScreen.svelte';
  import Tutorial from './components/intro/Tutorial.svelte';
  import SlotPicker from './components/intro/SlotPicker.svelte';
  import GameShell from './components/layout/GameShell.svelte';
  import CockpitShell from './components/cockpit/CockpitShell.svelte';
  import CockpitToggleBadge from './components/cockpit/CockpitToggleBadge.svelte';
  import TableWindow from './components/table/TableWindow.svelte';
  import { cockpit } from '$lib/stores/cockpit.svelte';
  import ToastStack from './components/feedback/ToastStack.svelte';

  /* Routing minimal : si l'URL contient ?session=…, on est dans la
   * fenêtre popup de La Table des Négociations. Aucun moteur de
   * jeu principal — uniquement le mini-jeu Table. */
  const isTableWindow = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).has('session');

  /* Retour live test : « garde le mode classique quand c'est sur
   * mobile ». Sous 768px, le cockpit est trop dense pour être
   * jouable confortablement → on force le mode classique
   * automatiquement, indépendamment du toggle utilisateur. */
  let isMobile = $state(false);
  $effect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => { isMobile = mq.matches; };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  });

  /* Cockpit effectif : enabled par préférence ET pas mobile. */
  const cockpitEffective = $derived(cockpit.enabled && !isMobile);
  import { loadAllScenarios } from './game/content/scenarios';
  import { loadPipelineContent } from './game/narrative/pipelineContent';

  const TUTORIAL_KEY = 'paritas_tutorial_seen_v1';
  const LANDING_KEY = 'paritas_landing_seen_v1';

  /* Préload des chunks narratifs en parallèle de l'affichage du
     tutoriel / StartScreen — par le temps que le joueur lit/choisit,
     les ~95 KB de scénarios et 60 KB de contenu pipeline sont déjà
     arrivés. */
  const contentReady = Promise.all([loadAllScenarios(), loadPipelineContent()]);

  type Phase = 'landing' | 'intro' | 'slot' | 'start' | 'game';

  function flag(key: string): boolean {
    try {
      return localStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  }

  function setFlag(key: string) {
    try {
      localStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }
  }

  /* Premier affichage : page d'accueil immersive (titre + pitch + CTA).
     Une fois entrée, on passe au tutoriel pour les nouveaux, ou direct
     au slot picker pour ceux qui sont déjà passés. */
  function initialPhase(): Phase {
    if (!flag(LANDING_KEY)) return 'landing';
    if (!flag(TUTORIAL_KEY)) return 'intro';
    return 'slot';
  }

  let phase = $state<Phase>(initialPhase());

  async function handleLandingDone() {
    setFlag(LANDING_KEY);
    /* La Marseillaise par défaut sur landing/tutoriel a été retirée
     * (audit : Derivière #34 ×2, Eno #35 — « évidence facile »).
     * Le joueur active la musique via le toggle ♫ quand il le
     * souhaite, ou elle démarre naturellement quand il entre dans
     * un scénario d'ère où la musique a un sens historique. */
    phase = flag(TUTORIAL_KEY) ? 'slot' : 'intro';
  }

  function handleIntroDone() {
    setFlag(TUTORIAL_KEY);
    phase = 'slot';
  }

  async function handleSlotPick(action: 'continue' | 'new', slot: 1 | 2 | 3) {
    setActiveSlot(slot);
    if (action === 'continue') {
      await contentReady;
      const ok = rebirth.load();
      phase = ok ? 'game' : 'start';
    } else {
      phase = 'start';
    }
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
    phase = 'slot';
  }
</script>

<svelte:head>
  <title>Paritas : la table des Ateliers</title>
</svelte:head>

{#if isTableWindow}
  <TableWindow />
{:else}
<ToastStack />

<!-- Badge bascule cockpit/classique TOUJOURS visible -->
{#if phase === 'game'}
  <CockpitToggleBadge />
{/if}

{#if phase === 'game' && cockpitEffective}
  <!-- Cockpit en fullscreen au top level — pas dans <main max-w-7xl>
       pour que les rails et popovers s'alignent au viewport edge.
       cockpitEffective = enabled ET pas mobile (force classique <768px). -->
  <CockpitShell onReplay={handleReplay} />
{:else}
<main class="min-h-dvh px-4 py-6 max-w-7xl mx-auto">
  {#if phase === 'landing'}
    <div in:fade={{ duration: 300 }}>
      <Landing onEnter={handleLandingDone} />
    </div>
  {:else if phase === 'intro'}
    <div in:fade={{ duration: 300 }}>
      <Tutorial onDone={handleIntroDone} />
    </div>
  {:else if phase === 'slot'}
    <div in:fade={{ duration: 300 }} class="max-w-3xl mx-auto bordered-card p-6 sm:p-8">
      <SlotPicker onPick={handleSlotPick} />
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
{/if}
{/if}
