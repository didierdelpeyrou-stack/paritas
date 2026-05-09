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
  import TableWindow from './components/table/TableWindow.svelte';
  import { cockpit, resolveLayout } from '$lib/stores/cockpit.svelte';
  import ToastStack from './components/feedback/ToastStack.svelte';
  import DevVersionBadge from './components/feedback/DevVersionBadge.svelte';
  /* Overlays d'ateliers — Argus B-MR1 / B-MR2 :
     rendus AU TOP-LEVEL pour fonctionner quelle que soit la
     coque (GameShell carnet, CockpitShell théâtre/atelier).
     Sans cette remontée, MatignonModal/LaPlace étaient soit
     dupliqués dans le DOM (GameShell), soit invisibles
     (CockpitShell, qui ne les rendait pas du tout). */
  import MatignonModal from './components/narrative/MatignonModal.svelte';
  import LaPlace from './components/ateliers/LaPlace.svelte';

  /* Routing minimal : si l'URL contient ?session=…, on est dans la
   * fenêtre popup de La Table des Négociations. Aucun moteur de
   * jeu principal — uniquement le mini-jeu Table. */
  const isTableWindow = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).has('session');

  /* Layout responsive (post-critique designer) : trois layouts assumés
   * — Théâtre (≥1280px), Atelier (768-1280), Carnet (≤768). Le joueur
   * peut forcer un layout depuis le LayoutSwitcher (ex : Carnet sur
   * desktop pour lecture concentrée). Auto par défaut.
   * Initialisation depuis window dès l'init pour éviter un flicker
   * entre l'écran assumé (1280) et le viewport réel sur mobile. */
  let viewportWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1280);
  $effect(() => {
    if (typeof window === 'undefined') return;
    const apply = () => { viewportWidth = window.innerWidth; };
    apply();
    window.addEventListener('resize', apply, { passive: true });
    return () => window.removeEventListener('resize', apply);
  });

  const effectiveLayout = $derived(resolveLayout(cockpit.preference, viewportWidth));
  /* Théâtre + Atelier passent par CockpitShell (qui gère ses propres
   * breakpoints internes pour rails/popovers). Carnet passe par
   * GameShell (plein écran, lecture séquentielle). */
  const useCockpit = $derived(effectiveLayout !== 'carnet');
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
    /* ORDA-017 — Mode Séance prof. Si défini, démarre à ce tour. */
    startTurn?: number;
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
<DevVersionBadge />

<!-- ╔══════════════════════════════════════════════════════════
     Overlays d'ateliers (Argus B-MR1 / B-MR2)
     ══════════════════════════════════════════════════════════
     Rendus en top-level pour fonctionner sous Cockpit OU
     GameShell. Position fixed + z-index élevé dans leurs CSS.
     ══════════════════════════════════════════════════════════ -->
{#if phase === 'game' && rebirth.state?.phase === 'matignon'}
  <MatignonModal
    onresolve={(result) => rebirth.resolveMatignon(result)}
    onskip={() => rebirth.resolveMatignon({ agreementId: null, quality: {} })}
  />
{:else if phase === 'game' && rebirth.state?.phase === 'laplace'}
  <LaPlace
    embedded={true}
    onresolve={(effects) => rebirth.resolveLaPlace(effects)}
    onskip={() => rebirth.resolveLaPlace({ confiance: 0, rapportDeForce: 0, santeSociale: 0, legitimite: 0, caisse: 0, cohesionInterne: 0 })}
  />
{/if}

<!-- Le sélecteur de layout (Théâtre / Atelier / Carnet) n'est plus
     un badge flottant top-right (encombrait la status bar mobile).
     Il est désormais accessible :
     - Mobile : menu burger (CockpitShell mobileMenuOpen)
     - Partout : Paramètres → Affichage → Mode d'affichage. -->

{#if phase === 'game' && useCockpit}
  <!-- Cockpit en fullscreen au top level — pas dans <main max-w-7xl>
       pour que les rails et popovers s'alignent au viewport edge.
       useCockpit couvre Théâtre + Atelier ; Carnet retombe sur GameShell.
       layout passé pour adapter l'identité (CK3 vs Tycoon). -->
  <CockpitShell onReplay={handleReplay} layout={effectiveLayout} />
{:else}
<main class="paritas-main">
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

<style>
  /* ╔══════════════════════════════════════════════════════════
       Wrapper principal — Argus B-MR3 (mobile catastrophe)
       ══════════════════════════════════════════════════════════
       Avant : <main class="min-h-dvh px-4 py-6 max-w-7xl mx-auto">
       — px-4 (16px) sur iPhone SE (375px) laisse 343px utiles, et
         les <bordered-card> avec leur padding interne 16px font
         311px de contenu, ce qui ne suffit pas pour les barres
         de ressources étendues.
       — overflow horizontal apparaît avec certains éléments
         enfants (NewsTicker, EraTimeline) qui forcent des largeurs.

       Après :
       — clamp horizontal padding 8 → 16 → 24px selon viewport
       — overflow-x: hidden de défense au top-level
       — max-width inchangé (80rem)
       ══════════════════════════════════════════════════════════ */
  .paritas-main {
    min-height: 100dvh;
    padding: 1.25rem 0.75rem;
    max-width: 80rem;
    margin-left: auto;
    margin-right: auto;
    overflow-x: hidden;
  }
  @media (min-width: 480px) {
    .paritas-main { padding: 1.5rem 1rem; }
  }
  @media (min-width: 768px) {
    .paritas-main { padding: 1.5rem 1.5rem; }
  }
  /* Defense globale anti overflow horizontal mobile */
  :global(html), :global(body) {
    overflow-x: hidden;
  }
</style>
