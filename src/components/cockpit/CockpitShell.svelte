<script lang="ts">
  /* ============================================================
     CockpitShell — Le Pupitre Paritaire (vague α-bis V2)
     ============================================================
     Layout strict viewport-fit (100dvh) :
     - Status bar : 48px (44px mobile)
     - Cockpit-main : flex-grow (Le Ciel + tabs latéraux desktop)
     - Instruments : ~92px (compact)
     - Action bar : 56px

     Total fixed = 196px desktop. Le Ciel a min-height: 0, et c'est
     la SEULE zone qui scrolle.

     Mobile : tabs latéraux masqués → drawer burger top.

     Spec : V2_AVIS_MINIJEUX_TABLE.md §9.
     ============================================================ */
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import { cockpit } from '$lib/stores/cockpit.svelte';
  import { sfx } from '../../game/audio/sfx';
  import type { Choice } from '../../game/types';
  import { eraForTurn } from '../../game/content/eras';

  import CockpitStatusBar from './CockpitStatusBar.svelte';
  import CockpitTopHeader from './CockpitTopHeader.svelte';
  import CockpitTabs from './CockpitTabs.svelte';
  import CockpitDashboardBar from './CockpitDashboardBar.svelte';
  import CockpitIcon from './CockpitIcon.svelte';
  import CockpitEraTimeline from './CockpitEraTimeline.svelte';
  import NewsTicker from './NewsTicker.svelte';
  import SideEventModal from '../narrative/SideEventModal.svelte';
  import CockpitLeftRail from './CockpitLeftRail.svelte';
  import CockpitRightRail from './CockpitRightRail.svelte';
  import CockpitPopover from './CockpitPopover.svelte';
  import type { IconKey } from './icons';

  import SceneCard from '../narrative/SceneCard.svelte';
  import ConsequenceScene from '../narrative/ConsequenceScene.svelte';
  import Settings from '../Settings.svelte';
  import EndingReport from '../feedback/EndingReport.svelte';

  import TreasuryPanel from '../org/TreasuryPanel.svelte';
  import FormationTalentsPanel from '../org/FormationTalentsPanel.svelte';
  import OrganizationPanel from '../org/OrganizationPanel.svelte';
  import ManifSimulator from '../org/ManifSimulator.svelte';
  import MeetingSimulator from '../org/MeetingSimulator.svelte';
  import ObjectivePanel from '../objectives/ObjectivePanel.svelte';
  import ActorPanel from '../simulation/ActorPanel.svelte';
  import PersonalityPanel from '../PersonalityPanel.svelte';
  import MyLegacyPanel from '../MyLegacyPanel.svelte';
  import StrategicRadar from '../StrategicRadar.svelte';
  import { GLOSSARY } from '../../game/content/glossary';
  import type { ActorId } from '../../game/types';
  import CockpitTableLauncher from './CockpitTableLauncher.svelte';
  import StatutJuridique from './StatutJuridique.svelte';
  import CockpitActionsDrawer from './CockpitActionsDrawer.svelte';
  import { orchestrator } from '$lib/stores/orchestrator.svelte';

  interface Props {
    onReplay?: () => void;
  }
  let { onReplay = () => {} }: Props = $props();

  const gameState = $derived(rebirth.state);
  const scenario = $derived(rebirth.currentScenario);
  const consequence = $derived(rebirth.consequence);
  const ending = $derived(rebirth.ending);
  const era = $derived(gameState ? eraForTurn(gameState.turn) : null);

  let settingsOpen = $state(false);
  let mobileMenuOpen = $state(false);
  let isMobile = $state(false);
  let actionsDrawerOpen = $state(false);
  /* Krug #2 : hint mécanique dismissable. Persisté en localStorage
   * pour que le user qui ferme ne soit pas réimposé au reload. */
  let hintDismissed = $state(false);
  if (typeof window !== 'undefined') {
    try {
      hintDismissed = localStorage.getItem('paritas_cockpit_hint_seen') === '1';
    } catch { /* ignore */ }
  }
  function dismissHint() {
    hintDismissed = true;
    try { localStorage.setItem('paritas_cockpit_hint_seen', '1'); } catch { /* ignore */ }
  }
  /* Nielsen #8 : rouvrir le hint mécanique à la demande. */
  function reopenHint() {
    hintDismissed = false;
    try { localStorage.removeItem('paritas_cockpit_hint_seen'); } catch { /* ignore */ }
  }
  /* Krug #1 : auto-dismiss dès qu'une action libre est exécutée
   * (preuve que le user a compris la mécanique). */
  $effect(() => {
    if (!hintDismissed && orchestrator.state.history.length > 0) {
      dismissHint();
    }
  });

  /* Détection responsive simple — évite import lourd. */
  $effect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => { isMobile = mq.matches; };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  });

  function handleChoose(choice: Choice) {
    void sfx.play('click');
    rebirth.choose(choice);
    setTimeout(() => void sfx.play('consequence'), 280);
  }

  function handleContinue() {
    rebirth.continueAfterConsequence();
  }

  function backToClassic() {
    cockpit.setEnabled(false);
  }

  function handleSettings() {
    settingsOpen = true;
    mobileMenuOpen = false;
  }

  /* Lock body scroll quand drawer/popover/menu/actions ouvert. */
  $effect(() => {
    const locked = !!cockpit.openTab || !!cockpit.openPopover
      || settingsOpen || mobileMenuOpen || actionsDrawerOpen;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = locked ? 'hidden' : '';
    }
    return () => {
      if (typeof document !== 'undefined') document.body.style.overflow = '';
    };
  });

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (actionsDrawerOpen) actionsDrawerOpen = false;
      else if (cockpit.openTab || cockpit.openPopover) cockpit.close();
      else if (mobileMenuOpen) mobileMenuOpen = false;
    }
  }

  /* Trait court pour le hint d'accueil tour 1 (Norman fix #2). */
  function traitLabelShort(t: string): string {
    const map: Record<string, string> = {
      batisseur: 'Bâtisseur·e',
      rupture: 'Tribun·e de la rupture',
      technocrate: 'Technocrate',
      pragmatique: 'Pragmatique',
      paternaliste: 'Paternaliste',
      tribun: 'Tribun·e'
    };
    return map[t] ?? 'camarade';
  }

  /* Helpers d'affichage du drawer (mini-jeux uniquement). Les rail-*
     sont passés en popover et n'utilisent plus le drawer. */
  const LEFT_TABS = new Set(['tresorerie', 'mandat', 'monde', 'manifestation']);
  function leftOrRight(id: string | null): 'left' | 'right' {
    return id && LEFT_TABS.has(id) ? 'left' : 'right';
  }
  function tabTitle(id: string | null): string {
    const t: Record<string, string> = {
      tresorerie: 'Trésorerie — Le Bureau',
      mandat: 'Mandat — La Salle du Congrès',
      monde: 'Monde — La Carte',
      manifestation: 'Manifestation — Le Cortège',
      organisation: 'Organisation — Le Siège',
      talents: 'Talents — L\'École Syndicale',
      meeting: 'Meeting — La Tribune',
      journal: 'Journal de partie',
      settings: 'Réglages',
      'rail-objectifs': 'Objectifs — Ce qu\'on attend de toi',
      'rail-acteurs': 'Acteurs — Pression et patience',
      'rail-personnalite': 'Personnalité — Trait dominant et tension',
      'rail-oeuvre': 'Mon œuvre — Institutions construites',
      'rail-trajectoire': 'Trajectoire stratégique — Radar',
      'rail-lexique': 'Lexique — Glossaire historique'
    };
    return t[id ?? ''] ?? '';
  }
  function tabIcon(id: string | null): IconKey {
    const t: Record<string, IconKey> = {
      tresorerie: 'sceau',
      mandat: 'urne',
      monde: 'hexagone',
      manifestation: 'poing',
      organisation: 'bourse',
      talents: 'cocarde',
      meeting: 'pupitre',
      journal: 'parchemin',
      settings: 'rouage',
      'rail-objectifs': 'parchemin',
      'rail-acteurs': 'carte',
      'rail-personnalite': 'masque',
      'rail-oeuvre': 'bourse',
      'rail-trajectoire': 'balance',
      'rail-lexique': 'plume'
    };
    return t[id ?? ''] ?? 'parchemin';
  }

  const ACTOR_IDS: ActorId[] = ['base', 'adversaire', 'etat', 'opinion'];

  function subtitleFor(id: ActorId): string | undefined {
    if (!gameState) return undefined;
    if (id === 'adversaire') return gameState.worldAI.opponent.factionName;
    if (id === 'etat') {
      const f = gameState.worldAI.state.faction;
      if (f === 'unitaire') return undefined;
      if (f === 'bercy') return 'Bercy';
      if (f === 'travail') return 'Ministère du Travail';
      if (f === 'elysee') return 'Élysée';
    }
    if (id === 'base') return gameState.organization.name;
    return undefined;
  }

  /* Mobile menu — liste les 9 tabs (déverrouillage Norman préservé). */
  interface MobileTab { id: string; icon: IconKey; label: string; unlockAt: number; }
  const ALL_TABS: MobileTab[] = [
    { id: 'tresorerie',    icon: 'sceau',     label: 'Trésorerie',    unlockAt: 1 },
    { id: 'mandat',        icon: 'urne',      label: 'Mandat',        unlockAt: 5 },
    { id: 'talents',       icon: 'cocarde',   label: 'Talents',       unlockAt: 8 },
    { id: 'organisation',  icon: 'bourse',    label: 'Organisation',  unlockAt: 12 },
    { id: 'manifestation', icon: 'poing',     label: 'Manifestation', unlockAt: 18 },
    { id: 'meeting',       icon: 'pupitre',   label: 'Meeting',       unlockAt: 25 },
    { id: 'monde',         icon: 'hexagone',  label: 'Monde',         unlockAt: 30 },
    { id: 'journal',       icon: 'parchemin', label: 'Journal',       unlockAt: 1 }
  ];

  let currentTurn = $derived(gameState?.turn ?? 1);

  function openFromMobile(id: string, unlockAt: number) {
    if (currentTurn < unlockAt) return;
    cockpit.open(id);
    mobileMenuOpen = false;
  }
</script>

<svelte:window onkeydown={onKey} />

{#if gameState}
  <div class="cockpit ambient-{gameState.mode} era-{era?.id ?? 'unknown'}"
    class:crisis-active={orchestrator.isCrisis}
  >

    <CockpitTopHeader
      state={gameState}
      era={era?.id ?? null}
      mood={scenario?.mood ?? null}
      onOpenSettings={handleSettings}
      onToggleClassic={backToClassic}
      onOpenMobileMenu={() => (mobileMenuOpen = true)}
      showMobileBurger={isMobile}
      onShowHint={reopenHint}
    />

    <!-- Bloc temporel : timeline (lent, ères) + ticker (présent,
         actualités) + bandeau d'anticipation des vents (Johnson #3).
         Wrappé dans un seul grid item pour ne pas décaler le 1fr
         de cockpit-main. -->
    <div class="time-strip">
      <CockpitEraTimeline turn={gameState.turn} />
      <NewsTicker />
      {#if orchestrator.upcomingForcing}
        <div class="upcoming-forcing-banner" in:fade={{ duration: 240 }}>
          <span class="ufb-icon" aria-hidden="true">☄</span>
          <span class="ufb-text">
            <strong>{orchestrator.upcomingForcing.forcing.label}</strong>
            dans {orchestrator.upcomingForcing.inTurns} tour{orchestrator.upcomingForcing.inTurns > 1 ? 's' : ''}
            — <em>{orchestrator.upcomingForcing.forcing.description}</em>
          </span>
        </div>
      {/if}
    </div>

    <!-- Modale de quête secondaire (déclenchée depuis le ticker). -->
    <SideEventModal />

    <div class="cockpit-main">
      <CockpitTabs side="left" turn={currentTurn} />

      <CockpitLeftRail
        objectives={gameState.objectives}
        progress={gameState.objectiveProgress}
        actors={gameState.actors}
        turn={gameState.turn}
      />

      <main class="sky" class:dimmed={cockpit.openTab !== null}>
        {#key gameState.turn + ':' + gameState.phase + ':' + (scenario?.id ?? 'none')}
          <div class="sky-content"
            in:fly={{ y: 14, duration: 360, easing: cubicOut, delay: 80 }}
          >
            {#if ending}
              <EndingReport ending={ending} onReplay={onReplay} />
            {:else if gameState.phase === 'consequence' && consequence}
              <ConsequenceScene
                {consequence}
                alerts={rebirth.alerts}
                onContinue={handleContinue}
              />
            {:else if scenario}
              <!-- Fix Norman #2 + #6 + Krug #1 + #2 : hint mécanique
                   dismissable, auto-éteint après la 1ʳᵉ action libre,
                   au tour 1-5 sinon. -->
              {#if gameState.turn <= 5 && !hintDismissed}
                <aside class="how-to-play" in:fade={{ duration: 240 }}>
                  <span class="htp-icon">
                    <CockpitIcon name="parchemin" size={16} />
                  </span>
                  <p>
                    {#if gameState.turn === 1}
                      <strong>Bienvenue, {traitLabelShort(gameState.dominantTrait)}.</strong>
                      Lis le scénario, puis clique l'une des options pour engager
                      ton choix. Tu peux aussi déclencher 1 à 2 actions libres
                      (tracts, meeting, manif…) depuis la barre du bas.
                    {:else}
                      <strong>Mécanique :</strong> 1 décision scénarique +
                      0 à 2 actions libres par tour.
                    {/if}
                  </p>
                  <button type="button" class="htp-close" onclick={dismissHint}
                    title="Compris, masquer ce rappel" aria-label="Fermer le rappel">×</button>
                </aside>
              {/if}
              <SceneCard
                {scenario}
                mode={gameState.mode}
                dominantTrait={gameState.dominantTrait}
                camp={gameState.camp}
                playerName={gameState.name}
                organizationName={gameState.organization?.name}
                onChoose={handleChoose}
              />
            {:else}
              <div class="sky-placeholder">
                <p>En attente de scénario…</p>
              </div>
            {/if}
          </div>
        {/key}
      </main>

      <CockpitRightRail state={gameState} />

      <CockpitTabs side="right" turn={currentTurn} />
    </div>

    <CockpitDashboardBar
      onOpenFullActions={() => (actionsDrawerOpen = true)}
      pendingValidation={false}
    />

    <!-- Drawer onglet -->
    {#if cockpit.openTab}
      <div class="drawer-backdrop"
        in:fade={{ duration: 220 }} out:fade={{ duration: 180 }}
        onclick={() => cockpit.close()}
        role="presentation"
      ></div>
      <aside class="drawer drawer-{leftOrRight(cockpit.openTab)}"
        in:fly={{
          x: leftOrRight(cockpit.openTab) === 'left' ? -360 : 360,
          duration: 320,
          easing: cubicOut
        }}
        out:fly={{
          x: leftOrRight(cockpit.openTab) === 'left' ? -360 : 360,
          duration: 240,
          easing: cubicOut
        }}
        aria-labelledby="drawer-title"
      >
        <header class="drawer-head">
          <span class="drawer-icon">
            <CockpitIcon name={tabIcon(cockpit.openTab)} size={22} />
          </span>
          <h2 id="drawer-title">{tabTitle(cockpit.openTab)}</h2>
          <button type="button" class="drawer-close"
            onclick={() => cockpit.close()} aria-label="Fermer le panneau">×</button>
        </header>
        <div class="drawer-body">
          {#if cockpit.openTab === 'tresorerie'}
            <TreasuryPanel gameState={gameState} />
          {:else if cockpit.openTab === 'talents'}
            <FormationTalentsPanel gameState={gameState} />
          {:else if cockpit.openTab === 'organisation'}
            <OrganizationPanel organization={gameState.organization} turn={gameState.turn} />
          {:else if cockpit.openTab === 'manifestation'}
            <ManifSimulator gameState={gameState} />
          {:else if cockpit.openTab === 'meeting'}
            <MeetingSimulator gameState={gameState} />
          {:else if cockpit.openTab === 'mandat'}
            <div class="placeholder">
              <h3>Mandat — La Salle du Congrès</h3>
              <p>Mini-jeu Mandat en construction (vague β).</p>
              <p style="margin-top: 0.8rem; font-style: italic; color: rgba(244, 239, 226, 0.65);">
                En attendant, tu peux ouvrir <strong>La Table des Négociations</strong>
                dans une fenêtre séparée — premier mini-jeu pivot V2 livré.
              </p>
              <div style="margin-top: 1rem;">
                <CockpitTableLauncher scenarioId="secu-1945" playerActorId="croizat" />
              </div>
            </div>
          {:else if cockpit.openTab === 'monde'}
            <div class="placeholder">
              <h3>Monde — La Carte</h3>
              <p>Carte régions + accords EU en construction (vague δ).</p>
              <p style="margin-top: 0.8rem; font-style: italic; color: rgba(244, 239, 226, 0.65);">
                En attendant : voici <strong>« Le Statut Juridique » 1864</strong> —
                premier mini-jeu pivot V2-1 livré (loi Ollivier).
              </p>
              <div style="margin-top: 1rem; background: rgba(244, 239, 226, 0.97); border-radius: 0.5rem; padding: 1rem;">
                <StatutJuridique />
              </div>
            </div>
          {:else if cockpit.openTab === 'journal'}
            <div class="placeholder">
              <h3>Journal de partie</h3>
              <ul class="log-list">
                {#each rebirth.log.slice(-30).reverse() as entry, i (i)}
                  <li>{entry}</li>
                {/each}
              </ul>
            </div>
          {:else if cockpit.openTab === 'settings'}
            <div class="placeholder">
              <p>Les réglages s'ouvrent dans une fenêtre dédiée.</p>
              <button type="button" class="primary-btn"
                onclick={() => { handleSettings(); cockpit.close(); }}>
                Ouvrir les réglages
              </button>
            </div>
          {/if}
        </div>
      </aside>
    {/if}

    <!-- Drawer mobile menu (burger) -->
    {#if mobileMenuOpen && isMobile}
      <div class="drawer-backdrop"
        in:fade={{ duration: 200 }} out:fade={{ duration: 160 }}
        onclick={() => (mobileMenuOpen = false)}
        role="presentation"
      ></div>
      <aside class="mobile-menu"
        in:fly={{ y: -360, duration: 280, easing: cubicOut }}
        out:fly={{ y: -360, duration: 200, easing: cubicOut }}
        aria-label="Menu mobile"
      >
        <header class="drawer-head">
          <h2 id="mobile-menu-title">Menu</h2>
          <button type="button" class="drawer-close"
            onclick={() => (mobileMenuOpen = false)} aria-label="Fermer">×</button>
        </header>
        <nav class="mobile-grid" aria-labelledby="mobile-menu-title">
          {#each ALL_TABS as t}
            {@const locked = currentTurn < t.unlockAt}
            <button
              type="button"
              class="mobile-tile"
              class:locked
              disabled={locked}
              title={locked ? `Déverrouillé au tour ${t.unlockAt}` : t.label}
              onclick={() => openFromMobile(t.id, t.unlockAt)}
            >
              <span class="mobile-tile-icon">
                <CockpitIcon name={t.icon} size={26} />
              </span>
              <span class="mobile-tile-label">{t.label}</span>
              {#if locked}
                <span class="mobile-tile-lock">T{t.unlockAt}</span>
              {/if}
            </button>
          {/each}
          <button type="button" class="mobile-tile"
            onclick={handleSettings}>
            <span class="mobile-tile-icon"><CockpitIcon name="rouage" size={26} /></span>
            <span class="mobile-tile-label">Réglages</span>
          </button>
        </nav>
      </aside>
    {/if}

  </div>

  <!-- Popovers ancrés aux rails (menus déroulants) -->
  <CockpitPopover
    open={cockpit.openPopover?.id === 'rail-objectifs'}
    side="left"
    title="Objectifs — Ce qu'on attend de toi"
    icon="parchemin"
    onClose={() => cockpit.close()}
  >
    <ObjectivePanel
      objectives={gameState.objectives}
      progress={gameState.objectiveProgress}
      turn={gameState.turn} />
  </CockpitPopover>

  <CockpitPopover
    open={cockpit.openPopover?.id === 'rail-acteurs'}
    side="left"
    title="Acteurs — Pression et patience"
    icon="carte"
    onClose={() => cockpit.close()}
  >
    <div class="popover-actors">
      {#each ACTOR_IDS as id}
        <ActorPanel
          actorId={id}
          actor={gameState.actors[id]}
          subtitle={subtitleFor(id)} />
      {/each}
    </div>
  </CockpitPopover>

  <CockpitPopover
    open={cockpit.openPopover?.id === 'rail-personnalite'}
    side="right"
    title="Personnalité — Trait et tension"
    icon="masque"
    onClose={() => cockpit.close()}
  >
    <PersonalityPanel state={gameState} />
  </CockpitPopover>

  <CockpitPopover
    open={cockpit.openPopover?.id === 'rail-oeuvre'}
    side="right"
    title="Mon œuvre — Institutions construites"
    icon="bourse"
    onClose={() => cockpit.close()}
  >
    <MyLegacyPanel memory={gameState.memory} />
  </CockpitPopover>

  <CockpitPopover
    open={cockpit.openPopover?.id === 'rail-trajectoire'}
    side="right"
    title="Trajectoire stratégique"
    icon="balance"
    onClose={() => cockpit.close()}
  >
    <StrategicRadar resources={gameState.resources} />
  </CockpitPopover>

  <CockpitPopover
    open={cockpit.openPopover?.id === 'rail-lexique'}
    side="right"
    title="Lexique — Glossaire historique"
    icon="plume"
    onClose={() => cockpit.close()}
  >
    <div class="lexique-inline">
      <p class="lex-intro">
        {GLOSSARY.length} termes du paritarisme et du syndicalisme français.
      </p>
      <ul class="lex-list">
        {#each GLOSSARY as g}
          <li class="lex-entry">
            <strong class="lex-term">{g.term}</strong>
            {#if g.marker}
              <span class="lex-marker">· {g.marker}</span>
            {/if}
            <p class="lex-def">{g.definition}</p>
          </li>
        {/each}
      </ul>
    </div>
  </CockpitPopover>

  <CockpitActionsDrawer
    open={actionsDrawerOpen}
    onClose={() => (actionsDrawerOpen = false)}
  />

  <Settings open={settingsOpen} onClose={() => (settingsOpen = false)} />
{/if}

<style>
  .cockpit {
    display: grid;
    /* 4 lignes : status (auto) + time-strip (auto, timeline+ticker) +
       main (1fr) + dashboard d'actions (auto). Le bandeau d'instruments
       analogiques a été retiré (les 7 res sont déjà au top header avec
       delta du tour) — gain de place + lisibilité. */
    grid-template-rows: auto auto 1fr auto;
    /* position: fixed pour échapper au max-w-7xl du parent App.svelte
       et garantir un alignement viewport-edge pour les rails et les
       popovers ancrés (sinon left:290px / right:290px tombent à
       côté des rails sur écran large). */
    position: fixed;
    inset: 0;
    z-index: 30;
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.04), transparent 60%),
      linear-gradient(180deg, #1A1411 0%, #0F0B08 100%);
    color: #F4EFE2;
    font-family: 'Source Serif 4', Georgia, serif;
    overflow: hidden;
    transition: background 0.8s ease;
  }

  /* Ambiances Réfléchi vs Compulsif (Grandin #89, Damasio #58) :
     mode Réfléchi = lumière chaude jaune apaisante (lecture
     studieuse). Mode Compulsif = contraste plus marqué, micro-
     vibration, halo plus serré (immersion émotionnelle). */
  .cockpit.ambient-reflechi {
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.06), transparent 65%),
      linear-gradient(180deg, #1F1813 0%, #110D0A 100%);
  }

  .cockpit.ambient-compulsif {
    background:
      radial-gradient(ellipse at top, rgba(176, 24, 30, 0.05), transparent 55%),
      linear-gradient(180deg, #1A0F0D 0%, #0D0807 100%);
    animation: compulsif-vibe 4s ease-in-out infinite;
  }

  @keyframes compulsif-vibe {
    0%, 100% { filter: contrast(1) brightness(1); }
    50%      { filter: contrast(1.04) brightness(0.97); }
  }

  /* === Couche ambiance par ère ===
     Voile coloré + grain texturé en overlay (::before) pour évoquer
     la matière de chaque période. Très subtil — n'écrase jamais le
     contenu (opacity ≤ 0.10). Transition douce entre ères. */
  .cockpit::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0.08;
    transition: background 1.6s ease, opacity 1.6s ease;
    background-blend-mode: overlay;
  }
  .cockpit > * { position: relative; z-index: 1; }

  /* Révolution — encre brune sur vélin, texture verge */
  .cockpit.era-revolution::before {
    background:
      repeating-linear-gradient(0deg,
        rgba(122, 70, 30, 0.18) 0,
        rgba(122, 70, 30, 0.18) 1px,
        transparent 1px,
        transparent 4px),
      radial-gradient(ellipse at 30% 20%, rgba(180, 140, 90, 0.4), transparent 65%);
  }

  /* XIXe — fumée d'usine, sépia industriel */
  .cockpit.era-xixe::before {
    background:
      radial-gradient(ellipse at 70% 80%, rgba(60, 40, 30, 0.5), transparent 70%),
      linear-gradient(180deg, rgba(110, 80, 50, 0.18) 0%, rgba(40, 30, 20, 0.30) 100%);
  }

  /* Belle Époque — gaz brûlé, halos dorés */
  .cockpit.era-belle_epoque::before {
    background:
      radial-gradient(ellipse at 40% 30%, rgba(244, 213, 140, 0.30), transparent 55%),
      radial-gradient(ellipse at 80% 70%, rgba(217, 130, 28, 0.20), transparent 60%);
  }

  /* Entre-deux-guerres — affiche Cassandre, contrastes ocres / verts */
  .cockpit.era-entre_deux_guerres::before {
    background:
      linear-gradient(135deg, rgba(122, 70, 30, 0.25) 0%, transparent 40%, rgba(58, 107, 71, 0.18) 100%);
  }

  /* Reconstruction / Trentes Glorieuses — papier kraft, pastels usés */
  .cockpit.era-reconstruction::before,
  .cockpit.era-trente_glorieuses::before {
    background:
      repeating-linear-gradient(45deg,
        rgba(180, 140, 90, 0.05) 0,
        rgba(180, 140, 90, 0.05) 6px,
        transparent 6px,
        transparent 14px),
      linear-gradient(180deg, rgba(180, 140, 90, 0.18), transparent 70%);
  }

  /* Guerre froide — gris béton, néon froid */
  .cockpit.era-guerre_froide::before {
    background:
      linear-gradient(180deg, rgba(80, 90, 105, 0.28) 0%, rgba(35, 40, 50, 0.30) 100%);
  }

  /* Crise — fumée acide, urgence orange */
  .cockpit.era-crise::before {
    background:
      radial-gradient(ellipse at 50% 80%, rgba(217, 130, 28, 0.30), transparent 70%),
      linear-gradient(180deg, rgba(60, 50, 35, 0.25), transparent 60%);
  }

  /* Mitterrand → Cohabitations — moquette rose pâle institutionnelle */
  .cockpit.era-mitterrand::before,
  .cockpit.era-cohabitations::before {
    background:
      radial-gradient(ellipse at 30% 30%, rgba(176, 24, 30, 0.18), transparent 55%),
      linear-gradient(180deg, rgba(122, 92, 110, 0.18), transparent 70%);
  }

  /* Sarkozy / Hollande — lumière froide LED, blanc bleuté */
  .cockpit.era-sarkozy::before,
  .cockpit.era-hollande::before {
    background:
      linear-gradient(180deg, rgba(180, 200, 220, 0.18) 0%, rgba(100, 120, 140, 0.18) 100%);
  }

  /* Macron — écran OLED, halos numériques */
  .cockpit.era-macron_i::before,
  .cockpit.era-macron_ii::before,
  .cockpit.era-present::before {
    background:
      radial-gradient(ellipse at 80% 20%, rgba(120, 180, 220, 0.22), transparent 55%),
      radial-gradient(ellipse at 20% 80%, rgba(244, 213, 140, 0.10), transparent 60%);
  }

  .cockpit-main {
    display: grid;
    /* 5 colonnes strict : tabs L (80) | rail L (200) | sky (flex) |
       rail R (200) | tabs R (80). Les composants enfants ont leur
       propre largeur fixe via leur CSS. */
    grid-template-columns: auto auto 1fr auto auto;
    gap: 0;
    min-height: 0;
    overflow: hidden;
  }

  /* Bandeau d'anticipation vent historique (Johnson #3 — donner
     au joueur le temps d'adapter sa stratégie). Slim 24px, en
     écho doré ambré pour ne pas confondre avec une crise. */
  /* time-strip wrappe la timeline + bandeau d'anticipation pour
     les présenter comme un seul grid item (sinon le bandeau
     conditionnel décalerait le 1fr de cockpit-main). */
  .time-strip {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }
  .upcoming-forcing-banner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    background: linear-gradient(90deg,
      rgba(217, 130, 28, 0.12) 0%,
      rgba(201, 178, 106, 0.16) 50%,
      rgba(217, 130, 28, 0.12) 100%);
    border-bottom: 1px solid rgba(217, 130, 28, 0.30);
    color: #F4D58C;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.78rem;
    line-height: 1.2;
    flex-shrink: 0;
  }
  .ufb-icon {
    font-size: 0.95rem;
    color: #D9821C;
    text-shadow: 0 0 6px rgba(217, 130, 28, 0.5);
    animation: ufb-twinkle 2.4s ease-in-out infinite;
    flex-shrink: 0;
  }
  .ufb-text { min-width: 0; }
  .ufb-text strong { color: #F4EFE2; font-weight: 700; letter-spacing: 0.02em; }
  .ufb-text em { color: rgba(244, 213, 140, 0.75); font-style: italic; }
  @keyframes ufb-twinkle {
    0%, 100% { opacity: 0.85; transform: scale(1); }
    50%      { opacity: 1;    transform: scale(1.12); }
  }
  @media (max-width: 768px) {
    .upcoming-forcing-banner { font-size: 0.7rem; padding: 0.2rem 0.5rem; }
    .ufb-text em { display: none; }
  }

  /* Tablet : rails masqués (display:none) → 3 colonnes restantes */
  @media (max-width: 1024px) {
    .cockpit-main {
      grid-template-columns: auto 1fr auto;
    }
  }

  /* Mobile : tabs aussi masqués (utilisation burger top) → 1 col */
  @media (max-width: 768px) {
    .cockpit-main {
      grid-template-columns: 1fr;
    }
  }

  .sky {
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    /* Pleine surface papier vélin — Le Ciel rempli intégralement
       entre les rails, pas de marges sombres. Le scénario respire
       sur toute la largeur disponible. */
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.10), transparent 70%),
      linear-gradient(180deg, #F4EFE2 0%, #EBDCC4 100%);
    color: #1A1411;
    transition: filter 0.4s ease, opacity 0.4s ease;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(90, 47, 28, 0.25) transparent;
    /* Bordures intérieures discrètes acajou pour séparer des rails
       sans liseré blanc */
    border-left: 1px solid rgba(90, 47, 28, 0.4);
    border-right: 1px solid rgba(90, 47, 28, 0.4);
    box-shadow:
      inset 8px 0 12px -8px rgba(90, 47, 28, 0.5),
      inset -8px 0 12px -8px rgba(90, 47, 28, 0.5);
  }

  .sky::-webkit-scrollbar { width: 6px; }
  .sky::-webkit-scrollbar-thumb { background: rgba(90, 47, 28, 0.2); border-radius: 3px; }

  .sky.dimmed {
    filter: blur(4px) saturate(0.7);
    opacity: 0.45;
    pointer-events: none;
  }

  .sky-content {
    /* Pleine surface — pas de cartouche centré, le scénario remplit
       toute la zone Le Ciel disponible entre les rails. Padding
       généreux (Chen #7) : 2.5rem inner pour respiration du texte. */
    padding: 2.2rem clamp(1.5rem, 4vw, 3rem);
    max-width: 64rem;
    margin: 0 auto;
    color: #1A1411;
  }

  /* === Hint mécanique (Norman fix #2 + #6 + Krug #1 + #2) === */
  :global(.sky-content .how-to-play) {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.6rem;
    padding: 0.7rem 0.95rem;
    margin: 0 auto 1.2rem;
    max-width: 64rem;
    background: rgba(244, 213, 140, 0.10);
    border-left: 3px solid #C9B26A;
    border-radius: 0.35rem;
    color: rgba(26, 20, 17, 0.85);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.88rem;
    line-height: 1.5;
  }

  :global(.sky-content .how-to-play .htp-close) {
    background: transparent;
    border: 1px solid rgba(90, 47, 28, 0.3);
    color: rgba(90, 47, 28, 0.8);
    width: 24px; height: 24px;
    border-radius: 0.25rem;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    align-self: start;
    transition: background 0.15s ease;
  }

  :global(.sky-content .how-to-play .htp-close:hover) {
    background: rgba(90, 47, 28, 0.1);
    color: #5A2F1C;
  }

  :global(.sky-content .how-to-play .htp-icon) {
    color: #5A2F1C;
    align-self: start;
    padding-top: 0.15rem;
  }

  :global(.sky-content .how-to-play strong) {
    color: #5A2F1C;
    font-family: 'Cinzel', Georgia, serif;
  }

  :global(.sky-content .how-to-play p) {
    margin: 0;
  }

  /* === Filigrane crise ===
     Migré sur ::after pour ne pas écraser ::before (couche ambiance
     par ère). Les deux overlays cohabitent désormais. */
  .cockpit.crisis-active::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse at center, rgba(176, 24, 30, 0.05) 0%, transparent 70%);
    z-index: 35;
    animation: crisis-overlay 2.4s ease-in-out infinite;
  }

  @keyframes crisis-overlay {
    0%, 100% { opacity: 0.4; }
    50%      { opacity: 0.8; }
  }

  .sky-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    color: rgba(26, 20, 17, 0.55);
    font-style: italic;
  }

  /* ===== Drawer onglet ===== */
  .drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(13, 16, 20, 0.55);
    backdrop-filter: blur(2px);
    z-index: 50;
  }

  .drawer {
    position: fixed;
    top: 0;
    bottom: 0;
    width: min(680px, 92vw);
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.04), transparent 55%),
      linear-gradient(180deg, #1A1411 0%, #0F0B08 100%);
    border: 1px solid #C9B26A;
    box-shadow:
      0 0 40px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(244, 213, 140, 0.08);
    z-index: 51;
    display: flex;
    flex-direction: column;
    color: #F4EFE2;
  }

  .drawer-left { left: 0; border-left: none; border-right: 1px solid #C9B26A; }
  .drawer-right { right: 0; border-right: none; border-left: 1px solid #C9B26A; }

  .drawer-head {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.85rem 1.1rem;
    border-bottom: 1px solid rgba(201, 178, 106, 0.25);
    background: linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
  }

  .drawer-icon {
    color: #F4D58C;
    display: inline-flex;
    align-items: center;
  }

  .drawer-head h2 {
    margin: 0;
    flex: 1 1 auto;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.05rem;
    color: #F4D58C;
    letter-spacing: 0.04em;
  }

  .drawer-close {
    background: transparent;
    border: 1px solid rgba(201, 178, 106, 0.3);
    color: #F4D58C;
    width: 32px;
    height: 32px;
    border-radius: 0.35rem;
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
    transition: background 0.18s ease, transform 0.18s ease;
  }

  .drawer-close:hover {
    background: rgba(201, 178, 106, 0.14);
    transform: scale(1.05);
  }

  .drawer-body {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 1rem 1.2rem 1.5rem;
    -webkit-overflow-scrolling: touch;
  }

  .placeholder {
    color: rgba(244, 239, 226, 0.85);
    line-height: 1.6;
  }

  .placeholder h3 {
    color: #F4D58C;
    font-family: 'Cinzel', Georgia, serif;
    margin: 0 0 0.6rem;
    font-size: 1rem;
    letter-spacing: 0.04em;
  }

  .log-list {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .log-list li {
    padding: 0.4rem 0.6rem;
    background: rgba(244, 213, 140, 0.05);
    border-left: 2px solid rgba(201, 178, 106, 0.4);
    border-radius: 0.25rem;
    font-size: 0.85rem;
    line-height: 1.45;
  }

  .primary-btn {
    margin-top: 0.8rem;
    padding: 0.55rem 1rem;
    background: #c89b3c;
    color: #0d1014;
    border: none;
    border-radius: 0.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .primary-btn:hover {
    filter: brightness(1.08);
  }

  /* ===== Lexique inline (drawer rail-lexique) ===== */
  .lexique-inline {
    color: rgba(244, 239, 226, 0.92);
    font-family: 'Source Serif 4', Georgia, serif;
  }

  .lex-intro {
    margin: 0 0 1rem;
    padding: 0.6rem 0.8rem;
    background: rgba(244, 213, 140, 0.06);
    border-left: 2px solid #C9B26A;
    border-radius: 0.3rem;
    font-size: 0.85rem;
    line-height: 1.5;
    font-style: italic;
    color: rgba(244, 239, 226, 0.8);
  }

  .lex-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .lex-entry {
    padding: 0.55rem 0.75rem;
    background: rgba(13, 11, 8, 0.4);
    border: 1px solid rgba(201, 178, 106, 0.18);
    border-radius: 0.35rem;
  }

  .lex-term {
    color: #F4D58C;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.9rem;
    letter-spacing: 0.04em;
  }

  .lex-marker {
    color: rgba(201, 178, 106, 0.65);
    font-size: 0.75rem;
    font-style: italic;
    margin-left: 0.3rem;
  }

  .lex-def {
    margin: 0.3rem 0 0;
    font-size: 0.86rem;
    line-height: 1.5;
    color: rgba(244, 239, 226, 0.85);
  }

  /* ===== Mobile menu burger ===== */
  .mobile-menu {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    max-height: 80dvh;
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.04), transparent 55%),
      linear-gradient(180deg, #1A1411 0%, #0F0B08 100%);
    border-bottom: 1px solid #C9B26A;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
    z-index: 52;
    display: flex;
    flex-direction: column;
    color: #F4EFE2;
  }

  .mobile-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.55rem;
    padding: 0.85rem;
    overflow-y: auto;
  }

  .mobile-tile {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    padding: 0.85rem 0.4rem;
    background: linear-gradient(180deg, #4A2E1A 0%, #3D2615 100%);
    border: 1px solid rgba(140, 110, 64, 0.4);
    border-radius: 0.5rem;
    color: rgba(244, 213, 140, 0.85);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition:
      transform 0.2s cubic-bezier(0.34, 1.2, 0.64, 1),
      border-color 0.18s ease,
      background 0.18s ease;
  }

  .mobile-tile:hover:not(.locked),
  .mobile-tile:active:not(.locked) {
    transform: translateY(-2px);
    border-color: #C9B26A;
    background: linear-gradient(180deg, #553420 0%, #432A18 100%);
    color: #F4D58C;
  }

  .mobile-tile.locked {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .mobile-tile-label {
    line-height: 1.1;
    text-align: center;
  }

  .mobile-tile-lock {
    position: absolute;
    top: 4px;
    right: 6px;
    font-size: 0.6rem;
    color: rgba(244, 213, 140, 0.5);
    font-weight: 700;
  }
</style>
