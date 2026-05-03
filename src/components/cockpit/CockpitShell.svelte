<script lang="ts">
  /* ============================================================
     CockpitShell — Le Pupitre Paritaire (vague α-bis MVP)
     ============================================================
     Interface alternative à GameShell. Layout 4 zones :
     - Barre d'état (top)
     - Tabs gauche + Le Ciel + Tabs droite (milieu)
     - Instruments (bas-milieu)
     - Barre d'action (bottom)

     Réutilise SceneCard pour Le Ciel et les org panels existants
     pour les onglets glissants.

     Spec : V2_AVIS_MINIJEUX_TABLE.md §9.
     ============================================================ */
  import { fade } from 'svelte/transition';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import { cockpit } from '$lib/stores/cockpit.svelte';
  import { sfx } from '../../game/audio/sfx';
  import type { Choice } from '../../game/types';
  import { eraForTurn } from '../../game/content/eras';

  import CockpitStatusBar from './CockpitStatusBar.svelte';
  import CockpitTabs from './CockpitTabs.svelte';
  import CockpitInstruments from './CockpitInstruments.svelte';
  import CockpitActionBar from './CockpitActionBar.svelte';

  import SceneCard from '../narrative/SceneCard.svelte';
  import ConsequenceScene from '../narrative/ConsequenceScene.svelte';
  import Settings from '../Settings.svelte';
  import EndingReport from '../feedback/EndingReport.svelte';

  interface Props {
    onReplay?: () => void;
  }
  let { onReplay = () => {} }: Props = $props();

  /* Panneaux mini-jeux gestion existants — chargés en lazy si possible
     mais pour MVP on importe direct (ils sont déjà dans le bundle). */
  import TreasuryPanel from '../org/TreasuryPanel.svelte';
  import FormationTalentsPanel from '../org/FormationTalentsPanel.svelte';
  import OrganizationPanel from '../org/OrganizationPanel.svelte';
  import ManifSimulator from '../org/ManifSimulator.svelte';
  import MeetingSimulator from '../org/MeetingSimulator.svelte';

  /* ==== State bindings ==== */
  const gameState = $derived(rebirth.state);
  const scenario = $derived(rebirth.currentScenario);
  const consequence = $derived(rebirth.consequence);
  const ending = $derived(rebirth.ending);
  const era = $derived(gameState ? eraForTurn(gameState.turn) : null);

  let settingsOpen = $state(false);

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
  }

  /* Empêche le scroll du body quand un onglet ou settings est ouvert. */
  $effect(() => {
    if (cockpit.openTab || settingsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  });

  /* Échap ferme l'onglet ouvert ou retourne au cockpit. */
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (cockpit.openTab) cockpit.close();
    }
  }

  /* Pour la révélation Norman des onglets, on lit le tour courant. */
  let currentTurn = $derived(gameState?.turn ?? 1);
</script>

<svelte:window onkeydown={onKey} />

{#if gameState}
  <div class="cockpit" class:tab-open={!!cockpit.openTab}>

    <!-- BARRE D'ÉTAT -->
    <CockpitStatusBar
      turn={gameState.turn}
      era={era?.id ?? null}
      mood={scenario?.mood ?? null}
      onOpenSettings={handleSettings}
      onToggleClassic={backToClassic}
    />

    <!-- ZONE PRINCIPALE : tabs gauche · Le Ciel · tabs droite -->
    <div class="cockpit-main">
      <CockpitTabs side="left" turn={currentTurn} />

      <main class="sky" class:dimmed={cockpit.openTab !== null}>
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
      </main>

      <CockpitTabs side="right" turn={currentTurn} />
    </div>

    <!-- INSTRUMENTS -->
    <CockpitInstruments
      resources={gameState.resources}
      turn={gameState.turn}
    />

    <!-- BARRE D'ACTION -->
    <CockpitActionBar
      turn={gameState.turn}
      pendingValidation={false}
    />

    <!-- DRAWER ONGLETS : panneau qui glisse depuis le côté -->
    {#if cockpit.openTab}
      <div class="drawer-backdrop"
        in:fade={{ duration: 200 }} out:fade={{ duration: 180 }}
        onclick={() => cockpit.close()}
        role="presentation"
      ></div>
      <aside class="drawer drawer-{leftOrRight(cockpit.openTab)}"
        in:fade={{ duration: 250 }} out:fade={{ duration: 200 }}
        aria-labelledby="drawer-title"
      >
        <header class="drawer-head">
          <h2 id="drawer-title">{tabTitle(cockpit.openTab)}</h2>
          <button type="button" class="drawer-close"
            onclick={() => cockpit.close()} aria-label="Fermer">×</button>
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
              <p>Mini-jeu en construction (vague β). Pour l'instant,
                consulte ton statut dans Organisation.</p>
            </div>
          {:else if cockpit.openTab === 'monde'}
            <div class="placeholder">
              <h3>Monde — La Carte</h3>
              <p>Mini-jeu en construction (vague δ). Couverture
                régionale et accords européens à venir.</p>
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
              <p>Ouvre les réglages depuis l'icône ⚙ en haut à droite.</p>
              <button type="button" class="primary-btn" onclick={() => { handleSettings(); cockpit.close(); }}>
                Ouvrir les réglages
              </button>
            </div>
          {/if}
        </div>
      </aside>
    {/if}

  </div>

  <!-- Modal Settings (réutilisation telle quelle) -->
  <Settings open={settingsOpen} onClose={() => (settingsOpen = false)} />
{/if}

<script module lang="ts">
  /* Helpers internes — partagés entre instances. */
  const LEFT_TABS = new Set(['tresorerie', 'mandat', 'monde', 'manifestation']);
  function leftOrRight(id: string | null): 'left' | 'right' {
    return id && LEFT_TABS.has(id) ? 'left' : 'right';
  }
  function tabTitle(id: string | null): string {
    const titles: Record<string, string> = {
      tresorerie: 'Trésorerie — Le Bureau',
      mandat: 'Mandat — La Salle du Congrès',
      monde: 'Monde — La Carte',
      manifestation: 'Manifestation — Le Cortège',
      organisation: 'Organisation — Le Siège',
      talents: 'Talents — L\'École Syndicale',
      meeting: 'Meeting — La Tribune',
      journal: 'Journal de partie',
      settings: 'Réglages'
    };
    return titles[id ?? ''] ?? '';
  }
</script>

<style>
  .cockpit {
    display: grid;
    grid-template-rows: auto 1fr auto auto;
    height: 100dvh;
    background: linear-gradient(180deg, #1A1411 0%, #0F0B08 100%);
    color: #F4EFE2;
    font-family: 'Source Serif 4', Georgia, serif;
    overflow: hidden;
    position: relative;
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
    padding: 1.5rem clamp(0.8rem, 3vw, 2.4rem);
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.04), transparent 60%),
      linear-gradient(180deg, #F4EFE2 0%, #E8DCC8 100%);
    color: #1A1411;
    transition: filter 0.4s ease, opacity 0.4s ease;
    -webkit-overflow-scrolling: touch;
  }

  .sky.dimmed {
    filter: blur(4px);
    opacity: 0.45;
    pointer-events: none;
  }

  .sky-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgba(26, 20, 17, 0.55);
    font-style: italic;
  }

  /* Drawer onglet — slide depuis le côté */
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
    background: linear-gradient(180deg, #1A1411 0%, #0F0B08 100%);
    border: 1px solid #C9B26A;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.6);
    z-index: 51;
    display: flex;
    flex-direction: column;
    color: #F4EFE2;
  }

  .drawer-left {
    left: 0;
    border-left: none;
    border-right: 1px solid #C9B26A;
  }

  .drawer-right {
    right: 0;
    border-right: none;
    border-left: 1px solid #C9B26A;
  }

  .drawer-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1.2rem;
    border-bottom: 1px solid rgba(201, 178, 106, 0.25);
    background: linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
  }

  .drawer-head h2 {
    margin: 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.1rem;
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
    transition: background 0.15s ease;
  }

  .drawer-close:hover {
    background: rgba(201, 178, 106, 0.12);
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

  /* Mobile : tabs collapse en burger (à venir vague α-bis suite) */
  @media (max-width: 768px) {
    .cockpit-main { grid-template-columns: auto 1fr auto; }
    .sky { padding: 1rem 0.6rem; }
  }
</style>
