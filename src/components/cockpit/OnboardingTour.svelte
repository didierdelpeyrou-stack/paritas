<script lang="ts">
  /* ============================================================
     OnboardingTour — coachmarks contextuels par mode
     ============================================================
     Phase 3 du pivot 3 modes : maintenant que Théâtre et Atelier
     ont leurs identités propres, le joueur doit pouvoir LES
     DÉCOUVRIR sans avoir à lire la doc.

     Mécanique :
     - Activé au tour 1 si pas déjà vu pour ce mode
     - Une étape à la fois, bubble qui pointe l'élément clé
     - Position dynamique via getBoundingClientRect du sélecteur
     - Backdrop semi-transparent qui isole l'élément
     - Boutons précédent/suivant + skip/dismiss

     Rerendre quand le mode change (le joueur peut basculer en
     cours de partie), reset si l'élément cible n'est pas dans le DOM.
     ============================================================ */
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { onboarding, type OnboardingMode } from '$lib/stores/onboarding.svelte';

  interface Step {
    selector: string;
    title: string;
    body: string;
  }

  /** Steps par mode — ordre = ordre d'apparition. */
  const STEPS: Record<OnboardingMode, Step[]> = {
    theatre: [
      {
        selector: '.theatre-actions-panel',
        title: '◆ Tes actions',
        body: 'À gauche : tout ce que tu peux faire. Huit actions rapides, classées par énergie. Vert = recommandé. Orange = risqué. Le bouton du bas ouvre le tableau complet.'
      },
      {
        selector: '.sky',
        title: '✦ La scène historique',
        body: 'Au centre : l\'événement à décider. Tes choix sont écrits selon ton camp — un patron ne lit pas Matignon comme un syndicaliste.'
      },
      {
        selector: '.theatre-personality-panel',
        title: '⚭ Toi et les acteurs',
        body: 'À droite : ton portrait, ta tension intérieure, et les quatre acteurs en scène (base, adversaire, État, opinion). Leur ressenti évolue avec tes décisions.'
      }
    ],
    atelier: [
      {
        selector: '.atelier-panel .briefing',
        title: '◎ Briefing tactique',
        body: 'Top 3 des actions les plus puissantes ce tour, classées par énergie disponible. C\'est ton conseil d\'arbitrage hebdomadaire.'
      },
      {
        selector: '.atelier-panel .resources',
        title: '▣ Tes 7 ressources',
        body: 'Barres horizontales avec valeur, delta du tour, palier. Survole une barre pour voir ce qui est débloqué à ce niveau.'
      },
      {
        selector: '.atelier-panel .talents',
        title: '⚭ Tes talents par groupe',
        body: 'Réflexion / Action / Communication. Recrute et affecte tes talents depuis le mini-jeu Talents pour booster un domaine.'
      },
      {
        selector: '.sky',
        title: '✦ Le scénario',
        body: 'Reste central — mais en Atelier, la gestion est ta matière première. Tu prépares avant d\'engager.'
      }
    ],
    carnet: []  // Pas d'onboarding pour Carnet — Reigns est self-explanatory
  };

  const active = $derived(onboarding.active);
  const steps = $derived(active ? STEPS[active.mode] : []);
  const currentStep = $derived(active && steps.length > 0 ? steps[active.step] : null);

  /* Position du callout — recalculée à chaque step + au resize. */
  let calloutPos = $state<{
    top: number; left: number; width: number; height: number;
    placement: 'right' | 'left' | 'top' | 'bottom'
  } | null>(null);

  function recompute() {
    if (!currentStep) {
      calloutPos = null;
      return;
    }
    const el = document.querySelector(currentStep.selector);
    if (!el) {
      /* Cible absente du DOM — skip silencieusement. */
      calloutPos = null;
      return;
    }
    const rect = el.getBoundingClientRect();
    /* Place la bubble à droite par défaut, sinon à gauche, sinon en bas. */
    const vw = window.innerWidth;
    let placement: 'right' | 'left' | 'top' | 'bottom' = 'right';
    if (rect.right + 360 > vw) placement = 'left';
    if (rect.left < 360 && rect.right + 360 > vw) placement = 'bottom';
    calloutPos = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      placement
    };
  }

  $effect(() => {
    /* Reactivité sur active + step → recompute. */
    void active;
    if (typeof window === 'undefined') return;
    /* Léger délai pour laisser le DOM se settler après changement de step. */
    const t = window.setTimeout(recompute, 80);
    /* Recompute au resize aussi. */
    window.addEventListener('resize', recompute);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', recompute);
    };
  });

  function handleNext() {
    onboarding.next(steps.length);
  }
  function handlePrev() {
    onboarding.prev();
  }
  function handleSkip() {
    onboarding.dismiss();
  }
</script>

{#if active && currentStep && calloutPos}
  <!-- Backdrop semi-transparent, n'isole pas (on garde une lecture
       du contexte). Click n'importe où sauf bubble = skip. -->
  <div class="onboarding-backdrop"
    in:fade={{ duration: 240 }} out:fade={{ duration: 200 }}
    onclick={handleSkip}
    role="presentation"
  ></div>

  <!-- Halo autour de l'élément cible -->
  <div class="onboarding-halo"
    style:top="{calloutPos.top - 6}px"
    style:left="{calloutPos.left - 6}px"
    style:width="{calloutPos.width + 12}px"
    style:height="{calloutPos.height + 12}px"
    aria-hidden="true"
  ></div>

  <!-- Bubble du callout -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="onboarding-bubble"
    data-placement={calloutPos.placement}
    style:--target-top="{calloutPos.top}px"
    style:--target-left="{calloutPos.left}px"
    style:--target-width="{calloutPos.width}px"
    style:--target-height="{calloutPos.height}px"
    in:fly={{ y: 8, duration: 260, easing: cubicOut }}
    out:fade={{ duration: 180 }}
    onclick={(e) => e.stopPropagation()}
    role="dialog"
    tabindex="-1"
    aria-labelledby="ob-title"
    aria-modal="false"
  >
    <div class="bubble-step">{active.step + 1} / {steps.length}</div>
    <h3 id="ob-title">{currentStep.title}</h3>
    <p>{currentStep.body}</p>
    <div class="bubble-actions">
      <button type="button" class="btn-skip" onclick={handleSkip}>
        Passer
      </button>
      <div class="nav-group">
        {#if active.step > 0}
          <button type="button" class="btn-prev" onclick={handlePrev}>
            ← Précédent
          </button>
        {/if}
        <button type="button" class="btn-next" onclick={handleNext}>
          {active.step + 1 >= steps.length ? 'Compris' : 'Suivant →'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .onboarding-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(13, 16, 20, 0.55);
    backdrop-filter: blur(1.5px);
    -webkit-backdrop-filter: blur(1.5px);
    z-index: 200;
    cursor: pointer;
  }

  .onboarding-halo {
    position: fixed;
    z-index: 201;
    border: 2px solid #C9B26A;
    border-radius: 0.5rem;
    pointer-events: none;
    box-shadow:
      0 0 0 4px rgba(244, 213, 140, 0.15),
      0 0 24px rgba(244, 213, 140, 0.5);
    animation: halo-pulse 2.4s ease-in-out infinite;
  }
  @keyframes halo-pulse {
    0%, 100% { box-shadow: 0 0 0 4px rgba(244, 213, 140, 0.10), 0 0 16px rgba(244, 213, 140, 0.4); }
    50%      { box-shadow: 0 0 0 6px rgba(244, 213, 140, 0.20), 0 0 32px rgba(244, 213, 140, 0.65); }
  }

  .onboarding-bubble {
    position: fixed;
    z-index: 202;
    width: 320px;
    padding: 1rem 1.1rem 0.9rem;
    background: linear-gradient(180deg, #2A1A0E 0%, #1A1108 100%);
    border: 1px solid #C9B26A;
    border-radius: 0.55rem;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
    color: #F4EFE2;
    font-family: 'Source Serif 4', Georgia, serif;
  }

  /* Placement à droite de la cible */
  .onboarding-bubble[data-placement='right'] {
    top: var(--target-top);
    left: calc(var(--target-left) + var(--target-width) + 16px);
  }
  /* Placement à gauche */
  .onboarding-bubble[data-placement='left'] {
    top: var(--target-top);
    left: calc(var(--target-left) - 320px - 16px);
  }
  /* Placement en bas */
  .onboarding-bubble[data-placement='bottom'] {
    top: calc(var(--target-top) + var(--target-height) + 12px);
    left: var(--target-left);
  }
  /* Placement en haut */
  .onboarding-bubble[data-placement='top'] {
    top: calc(var(--target-top) - 220px);
    left: var(--target-left);
  }

  .bubble-step {
    display: inline-block;
    padding: 0.1rem 0.55rem;
    background: rgba(201, 178, 106, 0.16);
    border: 1px solid rgba(201, 178, 106, 0.45);
    border-radius: 999px;
    color: #C9B26A;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.55rem;
  }

  .onboarding-bubble h3 {
    margin: 0 0 0.45rem 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.05rem;
    color: #F4D58C;
    letter-spacing: 0.04em;
  }

  .onboarding-bubble p {
    margin: 0 0 0.95rem 0;
    color: rgba(244, 239, 226, 0.85);
    font-size: 0.86rem;
    line-height: 1.45;
  }

  .bubble-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .nav-group {
    display: flex;
    gap: 0.4rem;
  }

  .btn-skip,
  .btn-prev,
  .btn-next {
    padding: 0.4rem 0.8rem;
    border-radius: 0.3rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: filter 0.18s ease, background 0.18s ease;
  }

  .btn-skip {
    background: transparent;
    color: rgba(244, 239, 226, 0.55);
    border: 1px solid rgba(244, 239, 226, 0.18);
  }
  .btn-skip:hover {
    color: #F4EFE2;
    background: rgba(244, 239, 226, 0.06);
  }

  .btn-prev {
    background: transparent;
    color: #C9B26A;
    border: 1px solid rgba(201, 178, 106, 0.35);
  }
  .btn-prev:hover {
    background: rgba(201, 178, 106, 0.08);
  }

  .btn-next {
    background: linear-gradient(180deg, #c89b3c 0%, #a87a26 100%);
    color: #0d1014;
    border: 1px solid #c89b3c;
  }
  .btn-next:hover { filter: brightness(1.12); }

  @media (max-width: 600px) {
    .onboarding-bubble {
      width: calc(100vw - 2rem);
      max-width: 320px;
      left: 1rem !important;
      right: 1rem;
      top: auto !important;
      bottom: 1rem;
    }
  }
</style>
