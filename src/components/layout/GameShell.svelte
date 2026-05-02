<script lang="ts">
  import { rebirth } from '../../game/engine/gameState.svelte';
  /* Lecture directe du slot actif depuis localStorage — la fonction
     exportée par gameState n'est pas réactive donc on la recopie
     localement. Le slot ne change que via SlotPicker, qui passe par
     rebirth.reset() et un re-mount, donc cette lecture suffit. */
  function getActiveSlot(): 1 | 2 | 3 {
    try {
      const v = localStorage.getItem('paritas_active_slot');
      if (v === '1' || v === '2' || v === '3') return parseInt(v, 10) as 1 | 2 | 3;
    } catch { /* ignore */ }
    return 1;
  }
  import type { ActorId, Choice } from '../../game/types';
  import { ALL_RESOURCES } from '../../game/types';
  import SceneCard from '../narrative/SceneCard.svelte';
  import ConsequenceScene from '../narrative/ConsequenceScene.svelte';
  import PipelinePanel from '../narrative/PipelinePanel.svelte';
  import ResourceGauge from '../simulation/ResourceGauge.svelte';
  import ActorPanel from '../simulation/ActorPanel.svelte';
  import OrganizationPanel from '../org/OrganizationPanel.svelte';
  import StrategyPanel from '../strategy/StrategyPanel.svelte';
  import ManifSimulator from '../org/ManifSimulator.svelte';
  import MeetingSimulator from '../org/MeetingSimulator.svelte';
  import FormationTalentsPanel from '../org/FormationTalentsPanel.svelte';
  import TreasuryPanel from '../org/TreasuryPanel.svelte';
  import ObjectivePanel from '../objectives/ObjectivePanel.svelte';
  import WorldStrategyPanel from '../world/WorldStrategyPanel.svelte';
  import EndingReport from '../feedback/EndingReport.svelte';
  import ToastStack from '../feedback/ToastStack.svelte';
  import EraTimeline from './EraTimeline.svelte';
  import Glossary from '../Glossary.svelte';
  import MyLegacyPanel from '../MyLegacyPanel.svelte';
  import Interlude from '../narrative/Interlude.svelte';
  import Settings from '../Settings.svelte';
  import GlossaryRefresher from '../GlossaryRefresher.svelte';
  import SignatureCeremony from '../SignatureCeremony.svelte';
  import StrategicRadar from '../StrategicRadar.svelte';
  import PersonalityPanel from '../PersonalityPanel.svelte';
  import { eraForTurn, yearForTurn } from '../../game/content/eras';
  import { TRAIT_LABELS } from '../../game/narrative/personalityEngine';
  import { computeFinalScore } from '../../game/simulation/scoring';
  import { sfx } from '../../game/audio/sfx';

  interface Props {
    onReplay: () => void;
  }
  let { onReplay }: Props = $props();

  const ACTOR_IDS: ActorId[] = ['base', 'adversaire', 'etat', 'opinion'];

  /* Trois familles d'onglets (UX-3) : la sidebar n'a plus 6 onglets
     dispersés mais 3 grandes familles. Manif/Meeting/Talents sont
     regroupés sous « Organisation » avec une sous-navigation. */
  type Tab = 'mandat' | 'organisation' | 'monde';
  type OrgSubTab = 'org' | 'manif' | 'meeting' | 'talents';
  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'mandat', label: 'Mandat' },
    { id: 'organisation', label: 'Organisation' },
    { id: 'monde', label: 'Monde' }
  ];
  const ORG_SUBTABS: Array<{ id: OrgSubTab; label: string }> = [
    { id: 'org', label: 'Trésorerie' },
    { id: 'manif', label: 'Manifestation' },
    { id: 'meeting', label: 'Meeting' },
    { id: 'talents', label: 'Talents' }
  ];

  const TAB_KEY = 'paritas_active_tab_v2';
  const SUB_TAB_KEY = 'paritas_org_subtab_v1';
  const FOCUS_KEY = 'paritas_focus_mode_v1';

  function loadActiveTab(): Tab {
    try {
      const v = localStorage.getItem(TAB_KEY);
      if (v && TABS.some(t => t.id === v)) return v as Tab;
      // Migration v1 → v2 : org/manif/meeting/talents → organisation
      const old = localStorage.getItem('paritas_active_tab_v1');
      if (old === 'org' || old === 'manif' || old === 'meeting' || old === 'talents') {
        return 'organisation';
      }
      if (old === 'mandat' || old === 'monde') return old as Tab;
    } catch {
      /* ignore */
    }
    return 'mandat';
  }

  function loadOrgSubTab(): OrgSubTab {
    try {
      const v = localStorage.getItem(SUB_TAB_KEY);
      if (v && ORG_SUBTABS.some(t => t.id === v)) return v as OrgSubTab;
      // Reprend l'ancien onglet manif/meeting/talents s'il existait
      const old = localStorage.getItem('paritas_active_tab_v1');
      if (old === 'manif' || old === 'meeting' || old === 'talents' || old === 'org') {
        return old as OrgSubTab;
      }
    } catch {
      /* ignore */
    }
    return 'org';
  }

  function loadFocusMode(): boolean {
    try {
      return localStorage.getItem(FOCUS_KEY) === 'true';
    } catch {
      return false;
    }
  }

  let activeTab = $state<Tab>(loadActiveTab());
  let orgSubTab = $state<OrgSubTab>(loadOrgSubTab());
  let glossaryOpen = $state(false);
  let settingsOpen = $state(false);
  /* UX-1 : mode lecture-scène. Replie la sidebar pour que la scène
     respire. Auto-activé en phase consequence (DMN priority). */
  let focusMode = $state<boolean>(loadFocusMode());

  /* === UX-N4 : interludes de restauration ===
     Tous les 6 tours, on intercepte la phase scène et on insère un
     interlude (image + citation, pause forcée 6s). Une fois consommé,
     on note dans dismissedInterludes pour ne pas le rejouer. */
  const INTERLUDE_INTERVAL = 6;
  let dismissedInterludes = $state<Set<number>>(new Set());

  const shouldShowInterlude = $derived.by(() => {
    const s = rebirth.state;
    if (!s) return false;
    if (s.phase !== 'scene') return false;
    if (s.turn < INTERLUDE_INTERVAL) return false;
    if (s.turn % INTERLUDE_INTERVAL !== 0) return false;
    return !dismissedInterludes.has(s.turn);
  });

  function dismissInterlude() {
    const s = rebirth.state;
    if (!s) return;
    dismissedInterludes = new Set([...dismissedInterludes, s.turn]);
  }

  /* === UX-#4 : cérémonie de signature ===
     On détecte l'apparition d'un nouvel accord signé dans la mémoire
     (signedMajorAccords ou builtInstitutions) et on déclenche la
     cérémonie pour les accords majeurs. La signature est stockée
     dans localStorage paritas_sig_{slot}_{accordId}. */
  interface CeremonyData {
    accordId: string;
    title: string;
    location: string;
    date: string;
    blurb: string;
  }

  const CEREMONY_REGISTRY: Record<string, Omit<CeremonyData, 'accordId'>> = {
    'matignon-1936': {
      title: 'Accords Matignon',
      location: 'Hôtel Matignon, Paris',
      date: '7 juin 1936',
      blurb: "Hausses de salaires, conventions collectives reconnues, congés payés. Le premier grand accord paritaire moderne."
    },
    'grenelle-1968': {
      title: 'Constat de Grenelle',
      location: 'Ministère du Travail, rue de Grenelle',
      date: '27 mai 1968',
      blurb: "SMIG +35%, salaires +10%, droit syndical d'entreprise. Le tournant institutionnel de Mai 68."
    },
    'secu-1945': {
      title: 'Ordonnances de la Sécurité sociale',
      location: 'Conseil des ministres, Paris',
      date: '4-19 octobre 1945',
      blurb: "Maladie, vieillesse, famille. Le pilier paritaire fondé par le programme du CNR « Les Jours heureux »."
    },
    'unedic-1958': {
      title: 'Convention Unédic',
      location: 'Paris',
      date: '31 décembre 1958',
      blurb: "Convention collective interprofessionnelle de l'assurance chômage. Gestion paritaire intégrale."
    },
    'conventions-collectives-1919': {
      title: 'Loi sur les conventions collectives',
      location: 'Paris',
      date: '25 mars 1919',
      blurb: 'Reconnaissance juridique du contrat collectif. Première institutionnalisation du dialogue social français.'
    },
    'syndicat-1884': {
      title: 'Loi Waldeck-Rousseau',
      location: 'Paris',
      date: '21 mars 1884',
      blurb: 'Légalisation des syndicats professionnels. Sortie de la clandestinité, entrée dans la République.'
    },
    'caisse-mutuelle-1864': {
      title: 'Loi Ollivier',
      location: 'Paris',
      date: '25 mai 1864',
      blurb: 'Dépénalisation du droit de coalition. Premier acquis légal du mouvement ouvrier moderne.'
    }
  };

  function sigKey(accordId: string): string {
    return `paritas_sig_slot${getActiveSlot()}_${accordId}`;
  }

  let ceremony = $state<CeremonyData | null>(null);
  let knownAccords = new Set<string>();
  let ceremonyInit = false;

  $effect(() => {
    const s = rebirth.state;
    if (!s) {
      knownAccords = new Set();
      ceremonyInit = false;
      return;
    }
    const all = new Set([...s.memory.signedMajorAccords, ...s.memory.builtInstitutions]);
    if (!ceremonyInit) {
      // Première lecture : init sans déclencher (saves chargés ne
      // doivent pas re-déclencher les cérémonies déjà passées).
      knownAccords = all;
      ceremonyInit = true;
      return;
    }
    for (const accordId of all) {
      if (knownAccords.has(accordId)) continue;
      const def = CEREMONY_REGISTRY[accordId];
      if (def && !ceremony) {
        // pas encore signé manuscritement ?
        try {
          if (localStorage.getItem(sigKey(accordId))) continue;
        } catch { /* ignore */ }
        ceremony = { accordId, ...def };
      }
    }
    knownAccords = all;
  });

  function handleSign(dataUrl: string) {
    if (!ceremony) return;
    try {
      localStorage.setItem(sigKey(ceremony.accordId), dataUrl);
    } catch { /* ignore */ }
    ceremony = null;
  }

  function handleSkipCeremony() {
    if (!ceremony) return;
    try {
      localStorage.setItem(sigKey(ceremony.accordId), 'skipped');
    } catch { /* ignore */ }
    ceremony = null;
  }

  function setActiveTab(t: Tab) {
    activeTab = t;
    try {
      localStorage.setItem(TAB_KEY, t);
    } catch {
      /* ignore */
    }
  }

  function setOrgSubTab(t: OrgSubTab) {
    orgSubTab = t;
    try {
      localStorage.setItem(SUB_TAB_KEY, t);
    } catch {
      /* ignore */
    }
  }

  function toggleFocus() {
    focusMode = !focusMode;
    try {
      localStorage.setItem(FOCUS_KEY, focusMode ? 'true' : 'false');
    } catch {
      /* ignore */
    }
  }

  /* Phase consequence = mode focus auto pour la révélation étagée. */
  const isConsequencePhase = $derived(rebirth.state?.phase === 'consequence');
  const effectiveFocus = $derived(focusMode || isConsequencePhase);

  const gameState = $derived(rebirth.state);
  const scenario = $derived(rebirth.currentScenario);
  const consequence = $derived(rebirth.consequence);
  const ending = $derived(rebirth.ending);
  const era = $derived(gameState ? eraForTurn(gameState.turn) : null);
  const reversedLog = $derived(rebirth.log.slice(-15).slice().reverse());

  const hueByEra: Record<string, 'amber' | 'rose' | 'emerald' | 'violet' | 'cyan' | 'slate'> = {
    revolution: 'rose',
    xixe: 'rose',
    belle_epoque: 'emerald',
    entre_deux_guerres: 'emerald',
    reconstruction: 'violet',
    guerre_froide: 'violet',
    trente_glorieuses: 'cyan',
    crise: 'slate',
    mitterrand: 'rose',
    cohabitations: 'slate',
    sarkozy: 'slate',
    hollande: 'slate',
    macron_i: 'slate',
    macron_ii: 'slate',
    present: 'amber'
  };

  function handleChoose(choice: Choice) {
    void sfx.play('click');
    rebirth.choose(choice);
    setTimeout(() => void sfx.play('consequence'), 280);
  }

  function subtitleFor(id: ActorId, s: typeof gameState): string | undefined {
    if (!s) return undefined;
    if (id === 'adversaire') return s.worldAI.opponent.factionName;
    if (id === 'etat') {
      const faction = s.worldAI.state.faction;
      if (faction === 'unitaire') return undefined;
      if (faction === 'bercy') return 'Bercy';
      if (faction === 'travail') return 'Ministère du Travail';
      if (faction === 'elysee') return 'Élysée';
    }
    if (id === 'base') return s.organization.name;
    return undefined;
  }

  function handleContinue() {
    void sfx.play('pageTurn');
    rebirth.continueAfterConsequence();
  }

  let sfxOn = $state(sfx.isEnabled());
  let musicOn = $state(sfx.isMusicEnabled());
  $effect(() => sfx.onChange(v => (sfxOn = v)));
  $effect(() => sfx.onMusicChange(v => (musicOn = v)));

  function toggleSfx() {
    sfx.toggle();
    if (sfx.isEnabled()) void sfx.play('click');
  }

  function toggleMusic() {
    sfx.toggleMusic();
  }

  /* Quand l'ère du jeu change, informe le moteur audio pour que la
     boucle ambient switche de scale. */
  $effect(() => {
    if (era?.id) sfx.setEra(era.id);
  });
</script>

{#if gameState && gameState.phase === 'ended' && ending}
  <EndingReport {ending} {onReplay} />
{:else if gameState && era}
  {@const s = gameState}
  {@const e = era}
  {@const year = yearForTurn(s.turn)}
  {@const liveScore = computeFinalScore(s)}
  <div class="game-grid gap-4" data-focus={effectiveFocus}>
    <!-- Sidebar : 3 onglets repliables + identité fixe -->
    <aside class="space-y-3 order-2 lg:order-1 sidebar-panel">
      <!-- Bandeau ère, toujours visible -->
      <section class="bordered-card p-4 space-y-2">
        <div class="flex items-baseline justify-between gap-2">
          <span class="text-xs uppercase tracking-wider text-parchment-dim/80">
            Tour {s.turn} / 100{#if year} · {year}{/if}
          </span>
          <span class="text-xs italic text-parchment-dim/80">{e.period}</span>
        </div>
        <div class="flex items-baseline justify-between gap-2">
          <h3 class="font-display text-gold text-lg leading-tight">{e.name}</h3>
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="sfx-toggle"
              data-on={sfxOn}
              onclick={toggleSfx}
              aria-label={sfxOn ? 'Couper les effets sonores' : 'Activer les effets sonores'}
              title={sfxOn ? 'Effets sonores actifs' : 'Effets sonores coupés'}
            >{sfxOn ? '♪' : '·'}</button>
            <button
              type="button"
              class="sfx-toggle"
              data-on={musicOn}
              onclick={toggleMusic}
              aria-label={musicOn ? 'Couper la musique' : 'Activer la musique'}
              title={musicOn ? 'Musique active' : 'Musique coupée'}
            >{musicOn ? '♫' : '·'}</button>
            <button
              type="button"
              class="sfx-toggle"
              onclick={() => (glossaryOpen = true)}
              aria-label="Ouvrir le glossaire"
              title="Glossaire — termes syndicaux et paritaires"
            >?</button>
            <button
              type="button"
              class="sfx-toggle"
              onclick={() => (settingsOpen = true)}
              aria-label="Options d'accessibilité"
              title="Accessibilité (taille texte, contraste, daltonien)"
            >⚙</button>
          </div>
        </div>
        <EraTimeline currentTurn={s.turn} />
      </section>

      <!-- Onglets : 3 grandes familles -->
      <div class="tab-bar" role="tablist" aria-label="Sections de la sidebar">
        {#each TABS as t}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            data-active={activeTab === t.id}
            onclick={() => setActiveTab(t.id)}
          >{t.label}</button>
        {/each}
      </div>

      <div class="space-y-3">
        {#if activeTab === 'mandat'}
          <ObjectivePanel objectives={s.objectives} progress={s.objectiveProgress} turn={s.turn} />

          <section class="bordered-card p-4 space-y-3">
            <div class="text-xs uppercase tracking-wider text-parchment-dim/80">
              Ressources
            </div>
            {#each ALL_RESOURCES as r}
              <ResourceGauge resource={r} value={s.resources[r]} hue={hueByEra[e.id]} era={e.id} />
            {/each}
          </section>

          <section class="bordered-card p-4 space-y-2">
            <div class="text-xs uppercase tracking-wider text-parchment-dim/80">
              Acteurs
            </div>
            {#each ACTOR_IDS as id}
              <ActorPanel
                actorId={id}
                actor={s.actors[id]}
                subtitle={subtitleFor(id, s)}
              />
            {/each}
          </section>

          <PersonalityPanel state={s} />

          <MyLegacyPanel memory={s.memory} />

          <StrategicRadar resources={s.resources} />

          <GlossaryRefresher turn={s.turn} />
        {:else if activeTab === 'organisation'}
          <!-- Sous-navigation pour les 4 outils d'organisation -->
          <div class="sub-tab-bar" role="tablist" aria-label="Sous-sections de l'organisation">
            {#each ORG_SUBTABS as sub}
              <button
                type="button"
                role="tab"
                aria-selected={orgSubTab === sub.id}
                data-active={orgSubTab === sub.id}
                onclick={() => setOrgSubTab(sub.id)}
              >{sub.label}</button>
            {/each}
          </div>

          {#if orgSubTab === 'org'}
            <TreasuryPanel gameState={s} />
            <OrganizationPanel organization={s.organization} turn={s.turn} />
            <StrategyPanel
              turn={s.turn}
              camp={s.camp}
              organization={s.organization}
              activeStrategies={s.activeStrategies}
            />
          {:else if orgSubTab === 'manif'}
            <ManifSimulator gameState={s} />
          {:else if orgSubTab === 'meeting'}
            <MeetingSimulator gameState={s} />
          {:else if orgSubTab === 'talents'}
            <FormationTalentsPanel gameState={s} />
          {/if}
        {:else}
          <WorldStrategyPanel worldAI={s.worldAI} />
          <PipelinePanel pipelines={s.activePipelines} />
        {/if}
      </div>

      <!-- Identité, toujours en pied -->
      <section class="bordered-card p-3 space-y-1">
        <div class="text-xs uppercase tracking-wider text-parchment-dim/80">
          {s.name}
        </div>
        <div class="text-sm">
          <span class="text-parchment-dim/85">Trait dominant —</span>
          <span class="text-gold font-display ml-1">
            {TRAIT_LABELS[s.dominantTrait]}
          </span>
        </div>
        <div class="text-xs text-parchment-dim/80">
          {s.camp === 'patron' ? 'Côté patronal' : 'Côté salarié'} ·
          mode {s.mode === 'reflechi' ? 'Réfléchi' : 'Compulsif'}
        </div>
      </section>
    </aside>

    <!-- Main column : scène ou conséquence (passe en premier sur mobile) -->
    <main class="space-y-4 order-1 lg:order-2">
      <!-- Mini barre d'outils main : score proéminent (UX-4) + focus (UX-1) -->
      <div class="main-toolbar">
        <div class="score-pill" title="Score provisoire — il évolue à chaque choix.">
          <span class="score-num">{liveScore}</span>
          <span class="score-den">/100</span>
        </div>
        <div class="flex-1"></div>
        <button
          type="button"
          class="focus-btn"
          data-active={focusMode}
          onclick={toggleFocus}
          aria-label={focusMode ? 'Quitter le mode lecture' : 'Mode lecture (replier la sidebar)'}
          title={focusMode ? 'Quitter le mode lecture (la sidebar revient)' : 'Mode lecture — sidebar masquée pour respirer'}
        >
          {focusMode ? '⤢ Quitter' : '⤡ Lecture'}
        </button>
      </div>

      {#if s.phase === 'scene' && shouldShowInterlude}
        <Interlude era={e.id} turn={s.turn} onContinue={dismissInterlude} />
      {:else if s.phase === 'scene' && scenario}
        <SceneCard
          {scenario}
          mode={s.mode}
          dominantTrait={s.dominantTrait}
          onChoose={handleChoose}
        />
      {:else if s.phase === 'consequence' && consequence}
        <ConsequenceScene
          {consequence}
          alerts={rebirth.alerts}
          onContinue={handleContinue}
        />
      {:else}
        <div class="bordered-card p-5 italic text-parchment-dim text-center">
          (Aucune scène — vérifie que des scénarios sont activés.)
        </div>
      {/if}

      {#if rebirth.log.length > 0}
        <details class="bordered-card p-3 text-xs">
          <summary class="cursor-pointer text-parchment-dim/85 uppercase tracking-wider">
            Journal · {rebirth.log.length}
          </summary>
          <ul class="mt-2 space-y-1 max-h-40 overflow-y-auto text-parchment-dim/80">
            {#each reversedLog as line}
              <li class="border-b border-line/40 pb-1 last:border-0">{line}</li>
            {/each}
          </ul>
        </details>
      {/if}
    </main>
  </div>
{:else}
  <div class="bordered-card p-5 italic text-parchment-dim text-center">
    (État du jeu non initialisé.)
  </div>
{/if}

<Glossary open={glossaryOpen} onClose={() => (glossaryOpen = false)} />
<Settings open={settingsOpen} onClose={() => (settingsOpen = false)} />

{#if ceremony}
  <SignatureCeremony
    title={ceremony.title}
    location={ceremony.location}
    date={ceremony.date}
    blurb={ceremony.blurb}
    onSign={handleSign}
    onSkip={handleSkipCeremony}
  />
{/if}

<style>
  /* === Grille principale (UX-1) ===
     En mode focus, la sidebar est repliée et la colonne principale
     prend toute la largeur — le récit et les choix respirent.
     Auto-déclenché en phase consequence (DMN priority). */
  .game-grid {
    display: grid;
    grid-template-columns: 1fr;
  }

  @media (min-width: 1024px) {
    .game-grid {
      grid-template-columns: 300px 1fr;
      transition: grid-template-columns 0.32s ease;
    }
    .game-grid[data-focus='true'] {
      grid-template-columns: 0 1fr;
    }
    .game-grid[data-focus='true'] .sidebar-panel {
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
      transform: translateX(-12px);
      transition: opacity 0.22s ease, transform 0.22s ease;
    }
  }

  .sidebar-panel {
    transition: opacity 0.32s ease, transform 0.32s ease;
  }

  /* === Barre d'outils du main (UX-4) ===
     Score proéminent (au lieu de minuscule en haut-droite de la
     sidebar), bouton focus à droite. Hierarchy: lit-vu en 1s. */
  .main-toolbar {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.4rem 0.2rem;
  }

  .score-pill {
    display: inline-flex;
    align-items: baseline;
    gap: 0.25rem;
    border: 1px solid rgba(244, 213, 139, 0.45);
    border-radius: 999px;
    background: rgba(201, 154, 64, 0.1);
    padding: 0.3rem 0.85rem 0.35rem;
    font-family: 'Cinzel', Georgia, serif;
  }

  .score-num {
    color: #f4d58b;
    font-size: 1.15rem;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .score-den {
    color: rgba(237, 228, 201, 0.55);
    font-size: 0.78rem;
  }

  .focus-btn {
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.45rem;
    background: rgba(13, 16, 20, 0.55);
    color: rgba(237, 228, 201, 0.78);
    padding: 0.35rem 0.7rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
  }

  .focus-btn:hover {
    border-color: rgba(244, 213, 139, 0.5);
    color: #f4d58b;
  }

  .focus-btn[data-active='true'] {
    border-color: rgba(244, 213, 139, 0.65);
    color: #f4d58b;
    background: rgba(201, 154, 64, 0.13);
  }

  /* Sous-onglets « Trésorerie / Manif / Meeting / Talents »
     dans la famille Organisation (UX-3, regroupement par familles). */
  .sub-tab-bar {
    display: flex;
    gap: 0;
    border: 1px solid rgba(237, 228, 201, 0.1);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.22);
    overflow-x: auto;
    margin-bottom: 0.25rem;
  }

  .sub-tab-bar button {
    flex: 1 0 auto;
    min-width: 5rem;
    border: 0;
    background: transparent;
    color: rgba(237, 228, 201, 0.55);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 0.5rem 0.45rem;
    min-height: 38px;
    cursor: pointer;
    transition: color 0.18s ease, background 0.18s ease;
    white-space: nowrap;
  }

  .sub-tab-bar button:hover {
    color: #ede4c9;
    background: rgba(201, 154, 64, 0.05);
  }

  .sub-tab-bar button[data-active='true'] {
    color: #f4d58b;
    background: rgba(201, 154, 64, 0.1);
    box-shadow: inset 0 -2px 0 0 rgba(200, 155, 60, 0.65);
  }

  .sub-tab-bar button + button {
    border-left: 1px solid rgba(237, 228, 201, 0.05);
  }

  .tab-bar {
    display: flex;
    gap: 0;
    border: 1px solid rgba(237, 228, 201, 0.16);
    border-radius: 0.6rem;
    background: rgba(13, 16, 20, 0.32);
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x proximity;
    scrollbar-width: thin;
  }

  .tab-bar::-webkit-scrollbar {
    height: 0.18rem;
  }

  .tab-bar::-webkit-scrollbar-thumb {
    background: rgba(244, 213, 139, 0.3);
    border-radius: 999px;
  }

  .tab-bar button {
    flex: 1 0 auto;
    min-width: 4.5rem;
    scroll-snap-align: start;
    border: 0;
    background: transparent;
    color: rgba(237, 228, 201, 0.6);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.62rem 0.55rem;
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease;
    min-height: 44px;
    white-space: nowrap;
  }

  .tab-bar button:hover {
    color: #ede4c9;
    background: rgba(201, 154, 64, 0.06);
  }

  .tab-bar button[data-active='true'] {
    color: #f4d58b;
    background: rgba(201, 154, 64, 0.14);
    box-shadow: inset 0 -2px 0 0 #c89b3c;
  }

  .tab-bar button + button {
    border-left: 1px solid rgba(237, 228, 201, 0.08);
  }

  .sfx-toggle {
    width: 1.8rem;
    height: 1.8rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.5);
    color: rgba(237, 228, 201, 0.5);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.85rem;
    line-height: 1;
    cursor: pointer;
    transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
  }

  .sfx-toggle[data-on='true'] {
    border-color: rgba(244, 213, 139, 0.55);
    color: #f4d58b;
    background: rgba(201, 154, 64, 0.13);
  }

  .sfx-toggle:hover {
    border-color: rgba(244, 213, 139, 0.45);
    color: #f4d58b;
  }
</style>
