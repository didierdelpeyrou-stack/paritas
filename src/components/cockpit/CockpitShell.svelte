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
  import CockpitTabs from './CockpitTabs.svelte';
  import CockpitInstruments from './CockpitInstruments.svelte';
  import CockpitActionBar from './CockpitActionBar.svelte';
  import CockpitIcon from './CockpitIcon.svelte';
  import CockpitEraTimeline from './CockpitEraTimeline.svelte';
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

  /* Lock body scroll quand drawer/popover/menu ouvert. */
  $effect(() => {
    const locked = !!cockpit.openTab || !!cockpit.openPopover
      || settingsOpen || mobileMenuOpen;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = locked ? 'hidden' : '';
    }
    return () => {
      if (typeof document !== 'undefined') document.body.style.overflow = '';
    };
  });

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (cockpit.openTab || cockpit.openPopover) cockpit.close();
      else if (mobileMenuOpen) mobileMenuOpen = false;
    }
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
  <div class="cockpit ambient-{gameState.mode}">

    <CockpitStatusBar
      turn={gameState.turn}
      era={era?.id ?? null}
      mood={scenario?.mood ?? null}
      onOpenSettings={handleSettings}
      onToggleClassic={backToClassic}
      onOpenMobileMenu={() => (mobileMenuOpen = true)}
      showMobileBurger={isMobile}
    />

    <CockpitEraTimeline turn={gameState.turn} />

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
              <SceneCard
                {scenario}
                mode={gameState.mode}
                dominantTrait={gameState.dominantTrait}
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

    <CockpitInstruments
      resources={gameState.resources}
      turn={gameState.turn}
    />

    <CockpitActionBar
      turn={gameState.turn}
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
    {#snippet children()}
      <ObjectivePanel
        objectives={gameState.objectives}
        progress={gameState.objectiveProgress}
        turn={gameState.turn} />
    {/snippet}
  </CockpitPopover>

  <CockpitPopover
    open={cockpit.openPopover?.id === 'rail-acteurs'}
    side="left"
    title="Acteurs — Pression et patience"
    icon="carte"
    onClose={() => cockpit.close()}
  >
    {#snippet children()}
      <div class="popover-actors">
        {#each ACTOR_IDS as id}
          <ActorPanel
            actorId={id}
            actor={gameState.actors[id]}
            subtitle={subtitleFor(id)} />
        {/each}
      </div>
    {/snippet}
  </CockpitPopover>

  <CockpitPopover
    open={cockpit.openPopover?.id === 'rail-personnalite'}
    side="right"
    title="Personnalité — Trait et tension"
    icon="masque"
    onClose={() => cockpit.close()}
  >
    {#snippet children()}
      <PersonalityPanel state={gameState} />
    {/snippet}
  </CockpitPopover>

  <CockpitPopover
    open={cockpit.openPopover?.id === 'rail-oeuvre'}
    side="right"
    title="Mon œuvre — Institutions construites"
    icon="bourse"
    onClose={() => cockpit.close()}
  >
    {#snippet children()}
      <MyLegacyPanel memory={gameState.memory} />
    {/snippet}
  </CockpitPopover>

  <CockpitPopover
    open={cockpit.openPopover?.id === 'rail-trajectoire'}
    side="right"
    title="Trajectoire stratégique"
    icon="balance"
    onClose={() => cockpit.close()}
  >
    {#snippet children()}
      <StrategicRadar resources={gameState.resources} />
    {/snippet}
  </CockpitPopover>

  <CockpitPopover
    open={cockpit.openPopover?.id === 'rail-lexique'}
    side="right"
    title="Lexique — Glossaire historique"
    icon="plume"
    onClose={() => cockpit.close()}
  >
    {#snippet children()}
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
    {/snippet}
  </CockpitPopover>

  <Settings open={settingsOpen} onClose={() => (settingsOpen = false)} />
{/if}

<style>
  .cockpit {
    display: grid;
    grid-template-rows: auto 1fr auto auto;
    height: 100dvh;
    max-height: 100dvh;
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.04), transparent 60%),
      linear-gradient(180deg, #1A1411 0%, #0F0B08 100%);
    color: #F4EFE2;
    font-family: 'Source Serif 4', Georgia, serif;
    overflow: hidden;
    position: relative;
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

  .cockpit-main {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0;
    min-height: 0;
    overflow: hidden;
  }

  .sky {
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.06), transparent 65%),
      linear-gradient(180deg, #F4EFE2 0%, #E8DCC8 100%);
    color: #1A1411;
    transition: filter 0.4s ease, opacity 0.4s ease;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(90, 47, 28, 0.25) transparent;
  }

  .sky::-webkit-scrollbar { width: 6px; }
  .sky::-webkit-scrollbar-thumb { background: rgba(90, 47, 28, 0.2); border-radius: 3px; }

  .sky.dimmed {
    filter: blur(4px) saturate(0.7);
    opacity: 0.45;
    pointer-events: none;
  }

  .sky-content {
    padding: 1.4rem clamp(0.8rem, 3vw, 2.4rem) 2rem;
    max-width: 56rem;
    margin: 0 auto;
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
