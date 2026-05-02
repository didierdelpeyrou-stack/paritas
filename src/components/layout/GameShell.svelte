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
  let glossaryFocusTerm = $state<string | null>(null);
  let settingsOpen = $state(false);

  /* Écoute l'événement émis par GlossaryText quand un terme est
     cliqué — ouvre la modale et la positionne sur ce terme. */
  $effect(() => {
    if (typeof window === 'undefined') return;
    function onOpen(e: Event) {
      const detail = (e as CustomEvent<{ term: string }>).detail;
      if (!detail?.term) return;
      glossaryFocusTerm = detail.term;
      glossaryOpen = true;
    }
    window.addEventListener('paritas-open-glossary', onOpen);
    return () => window.removeEventListener('paritas-open-glossary', onOpen);
  });

  /* Sur desktop, les panneaux d'introspection sont ouverts par
     défaut (la place est là). Sur mobile, repliés (la sidebar est
     déjà saturée). */
  let detailsOpenByDefault = $state<boolean>(detectDesktop());

  function detectDesktop(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      return window.matchMedia('(min-width: 1024px)').matches;
    } catch {
      return true;
    }
  }
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
    // Scroll-to-top : sur mobile, le user peut être loin dans le panneau
    // précédent — on ramène en haut du nouveau panneau.
    queueMicrotask(() => {
      const el = document.getElementById('tab-content');
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
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
     boucle ambient switche de palette via crossfade. */
  $effect(() => {
    if (era?.id) sfx.setEra(era.id);
  });

  /* Mood de la scène courante : module l'intensité musicale. */
  $effect(() => {
    if (scenario?.mood) sfx.setMood(scenario.mood);
  });

  /* Cleanup TTS sur changement de phase de scénario : un discours
     démarré en phase 'scene' ne doit pas continuer à parler par-dessus
     la conséquence (testeur Pierre-Yves). Importé dynamiquement pour
     ne pas charger speech.ts si le joueur n'utilise jamais le TTS. */
  $effect(() => {
    const _phase = rebirth.state?.phase;
    void _phase;
    import('../../lib/audio/speech').then((m) => m.stopSpeech()).catch(() => {});
  });

  /* Triggers SFX par mots-clés du texte du scénario : pad atmosphérique
     (oiseaux/pluie/vent/feu/foule lointaine) + one-shots (cloche,
     applaudissements, cris) selon ce qui apparaît dans le titre,
     sous-titre, contexte historique et setup. */
  let lastTextSig = '';
  $effect(() => {
    if (!scenario) return;
    const text = [
      scenario.title,
      scenario.subtitle ?? '',
      scenario.historicalContext ?? '',
      scenario.setup?.reflechi ?? '',
    ].join(' ');
    if (text === lastTextSig) return;
    lastTextSig = text;
    void (async () => {
      try {
        const mod = await import('../../lib/audio/textTriggers');
        const result = mod.analyzeText(text);
        // Pad : continu sous la musique
        await sfx.setPad(result.pad?.id ?? null, result.pad?.gain ?? 0.35);
        // One-shots : joués avec leur délai propre
        for (const oneshot of result.oneshots) {
          setTimeout(() => sfx.playOneShot(oneshot.id, oneshot.gain), oneshot.delay);
        }
      } catch { /* ignore */ }
    })();
  });

  /* Scène politique : ambiance sonore (foule, murmures) selon le contexte
     du scénario courant. Détecte par mots-clés du titre/sous-titre. */
  function detectScene(s: { title: string; subtitle?: string } | null | undefined):
    'manifestation' | 'meeting' | null {
    if (!s) return null;
    const hay = `${s.title} ${s.subtitle ?? ''}`.toLowerCase();
    if (/manif|défilé|defile|grève|greve|cortège|cortege|barricade|piquet|occup/.test(hay)) {
      return 'manifestation';
    }
    if (/congrès|congres|assemblée|assemblee|réunion|reunion|comité|comite|table ronde|conférence|conference|hémicycle|hemicycle|bureau confédéral|bureau confederal/.test(hay)) {
      return 'meeting';
    }
    return null;
  }
  let activeScene = $state<'manifestation' | 'meeting' | null>(null);
  $effect(() => {
    const next = detectScene(scenario as any);
    if (next === activeScene) return;
    if (activeScene) sfx.endScene();
    if (next) void sfx.beginScene(next);
    activeScene = next;
  });

  /* Trait dominant : couleur de timbre. */
  $effect(() => {
    if (gameState?.dominantTrait) sfx.setTrait(gameState.dominantTrait);
  });

  /* Cérémonie de signature : on coupe l'ambient pendant le rituel,
     on le reprend une fois la cérémonie close. Le silence porte le
     poids dramatique (cf. SignatureCeremony Cialdini/engagement). */
  let ceremonyMutedFlag = false;
  $effect(() => {
    if (ceremony && !ceremonyMutedFlag) {
      sfx.muteForPivot();
      void sfx.play('signature');
      ceremonyMutedFlag = true;
    } else if (!ceremony && ceremonyMutedFlag) {
      sfx.unmute();
      ceremonyMutedFlag = false;
    }
  });

  /* Thème d'ending : déclenché une fois quand l'écran de fin apparaît. */
  let endingThemePlayed = false;
  $effect(() => {
    if (ending && !endingThemePlayed) {
      void sfx.playEndingTheme(ending.id);
      endingThemePlayed = true;
    }
    if (!ending) endingThemePlayed = false;
  });

  /* Pipeline narratif : on joue un cue à l'apparition d'un nouveau
     pipeline. On compare aux ids connus pour ne pas re-déclencher
     sur load de save. */
  let knownPipelineIds = new Set<string>();
  let pipelineWatcherInit = false;
  $effect(() => {
    const pipelines = gameState?.activePipelines ?? [];
    const currentIds = new Set(pipelines.map(p => p.id));
    if (!pipelineWatcherInit) {
      knownPipelineIds = currentIds;
      pipelineWatcherInit = true;
      return;
    }
    for (const id of currentIds) {
      if (!knownPipelineIds.has(id)) {
        void sfx.play('pipelineLaunch');
        break; // un seul cue par tick suffit
      }
    }
    knownPipelineIds = currentIds;
  });

  /* Élection interne : le résultat apparaît dans actionHistory[0]
     ("Élection gagnée…" / "Élection perdue…"). On se déclenche une
     fois sur le passage du marqueur. */
  let lastElectionMarker = '';
  let electionWatcherInit = false;
  $effect(() => {
    const head = gameState?.organization.actionHistory[0] ?? '';
    if (!electionWatcherInit) {
      lastElectionMarker = head;
      electionWatcherInit = true;
      return;
    }
    if (head !== lastElectionMarker && head.includes('Élection')) {
      if (head.includes('gagnée')) void sfx.play('electionWin');
      else if (head.includes('perdue')) void sfx.play('electionLose');
    }
    lastElectionMarker = head;
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
            >
              <!-- Haut-parleur SVG. Toujours visible. Barré si OFF. -->
              <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3z"/>
                {#if sfxOn}
                  <path fill="none" stroke="currentColor" stroke-width="1.6"
                    stroke-linecap="round" d="M16 8.5c1.3 1 1.3 6 0 7M19 6c2.5 1.7 2.5 10.3 0 12"/>
                {:else}
                  <line x1="3" y1="3" x2="21" y2="21"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                {/if}
              </svg>
            </button>
            <button
              type="button"
              class="sfx-toggle"
              data-on={musicOn}
              onclick={toggleMusic}
              aria-label={musicOn ? 'Couper la musique' : 'Activer la musique'}
              title={musicOn ? 'Musique active' : 'Musique coupée'}
            >
              <!-- Note de musique SVG. Toujours visible. Barrée si OFF. -->
              <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                {#if !musicOn}
                  <line x1="3" y1="3" x2="21" y2="21"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                {/if}
              </svg>
            </button>
            <button
              type="button"
              class="sfx-toggle"
              onclick={() => (glossaryOpen = true)}
              aria-label="Ouvrir le glossaire"
              title="Glossaire — termes syndicaux et paritaires"
            >?</button>
            <button
              type="button"
              class="sfx-toggle gear-btn"
              onclick={() => (settingsOpen = true)}
              aria-label="Réglages"
              title="Réglages (taille texte, contraste, daltonien, audio, style d'écriture)"
            >
              <svg
                class="gear-icon"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                aria-hidden="true"
                fill="currentColor"
              >
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
            </button>
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

      <div class="space-y-3" id="tab-content">
        {#if activeTab === 'mandat'}
          <!-- Bloc 1 : essentiel à la décision (toujours déplié) -->
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

          <!-- Bloc 2 : panneaux d'introspection, repliés par défaut sur
               mobile pour ne pas saturer la sidebar. Open par défaut sur
               desktop via media query. -->
          <details class="reflex-fold" open={detailsOpenByDefault}>
            <summary>Personnalité <em>· {TRAIT_LABELS[s.dominantTrait]}</em></summary>
            <PersonalityPanel state={s} />
          </details>

          <details class="reflex-fold" open={detailsOpenByDefault}>
            <summary>Mon œuvre <em>· {s.memory.builtInstitutions.length}</em></summary>
            <MyLegacyPanel memory={s.memory} />
          </details>

          <details class="reflex-fold" open={detailsOpenByDefault}>
            <summary>Trajectoire stratégique</summary>
            <StrategicRadar resources={s.resources} />
          </details>

          <details class="reflex-fold" open={detailsOpenByDefault}>
            <summary>Lexique du jour</summary>
            <GlossaryRefresher turn={s.turn} />
          </details>
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
          <span class="score-tag">Score</span>
          <span class="score-num">{liveScore}</span>
          <span class="score-den">/100</span>
        </div>
        <div class="flex-1"></div>
        <span class="turn-tag" aria-hidden="true">T{s.turn}/100</span>
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

<Glossary
  open={glossaryOpen}
  focusTerm={glossaryFocusTerm}
  onClose={() => { glossaryOpen = false; glossaryFocusTerm = null; }}
/>
<Settings open={settingsOpen} onClose={() => (settingsOpen = false)} />

{#if ceremony}
  <SignatureCeremony
    title={ceremony.title}
    location={ceremony.location}
    date={ceremony.date}
    blurb={ceremony.blurb}
    onSign={handleSign}
    onSkip={handleSkipCeremony}
    camp={gameState?.camp}
    posture={gameState?.dominantTrait as any}
    eraId={era?.id}
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
    gap: 0.32rem;
    border: 1px solid rgba(244, 213, 139, 0.45);
    border-radius: 999px;
    background: rgba(201, 154, 64, 0.1);
    padding: 0.3rem 0.85rem 0.35rem;
    font-family: 'Cinzel', Georgia, serif;
  }

  .score-tag {
    color: rgba(237, 228, 201, 0.7);
    font-size: 0.66rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
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

  .turn-tag {
    color: rgba(237, 228, 201, 0.55);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    margin-right: 0.3rem;
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
    /* Le focus-btn n'a d'effet visuel qu'à partir du breakpoint lg
       (la sidebar est en-dessous sur mobile, masquer ne sert à rien).
       Caché sur mobile pour ne pas occuper l'espace du toolbar. */
    display: none;
  }

  @media (min-width: 1024px) {
    .focus-btn {
      display: inline-flex;
      align-items: center;
    }
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

  /* === Panneaux d'introspection repliables ===
     Repliés par défaut sur mobile (sidebar saturée), dépliés sur
     desktop où la place ne manque pas. */
  .reflex-fold > summary {
    list-style: none;
    cursor: pointer;
    border: 1px solid rgba(237, 228, 201, 0.14);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.32);
    padding: 0.6rem 0.7rem;
    color: rgba(237, 228, 201, 0.85);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .reflex-fold > summary::-webkit-details-marker {
    display: none;
  }

  .reflex-fold > summary::before {
    content: '▸';
    color: rgba(244, 213, 139, 0.6);
    font-size: 0.85rem;
    transition: transform 0.18s ease;
    display: inline-block;
  }

  .reflex-fold[open] > summary::before {
    transform: rotate(90deg);
  }

  .reflex-fold > summary:hover {
    border-color: rgba(244, 213, 139, 0.4);
  }

  .reflex-fold[open] > summary {
    border-color: rgba(244, 213, 139, 0.55);
    background: rgba(201, 154, 64, 0.06);
    color: #f4d58b;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .reflex-fold > summary em {
    margin-left: auto;
    color: rgba(244, 213, 139, 0.7);
    font-style: normal;
    font-size: 0.72rem;
    text-transform: none;
  }

  /* Note : l'ouverture par défaut sur desktop est portée par
     l'attribut `open={detailsOpenByDefault}` dans le markup, calé
     sur matchMedia('(min-width: 1024px)') au mount. */

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
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(237, 228, 201, 0.22);
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.5);
    color: rgba(237, 228, 201, 0.78);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.9rem;
    line-height: 1;
    cursor: pointer;
    padding: 0;
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

  /* Icônes audio toujours visibles, qu'elles soient actives ou non.
     Le slash diagonal indique l'état coupé sans masquer l'icône. */
  .sfx-toggle .ico {
    width: 1.05rem;
    height: 1.05rem;
    pointer-events: none;
  }

  /* === Roue crantée des réglages === */
  .gear-btn {
    /* Le bouton garde la même taille mais doit centrer le SVG. */
    padding: 0;
  }

  .gear-icon {
    display: block;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: 50% 50%;
  }

  /* Au survol : rotation lente de 90°, comme iOS Réglages. */
  .gear-btn:hover .gear-icon,
  .gear-btn:focus-visible .gear-icon {
    transform: rotate(90deg);
  }

  /* Au clic : tour complet rapide pour signaler l'action. */
  .gear-btn:active .gear-icon {
    transform: rotate(180deg);
    transition-duration: 0.2s;
  }

  /* Respecte le toggle « animations réduites » de Settings. */
  :global(html.a11y-reduced-motion) .gear-icon {
    transition: none;
  }
  :global(html.a11y-reduced-motion) .gear-btn:hover .gear-icon,
  :global(html.a11y-reduced-motion) .gear-btn:active .gear-icon {
    transform: none;
  }
</style>
