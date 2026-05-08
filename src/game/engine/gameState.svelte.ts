/* ============================================================
   Paritas Rebirth — gameState.svelte.ts
   Store réactif Svelte 5 (runes) pour l'expérience Rebirth.
   ============================================================ */

import type { Camp } from '../../lib/types';
import type {
  Choice,
  EndingId,
  RebirthGameState,
  RenderMode,
  Scenario
} from '../types';
import { applyResourceDelta, freshResources } from '../simulation/resources';
import { applyActorsDelta, freshActors } from '../simulation/actors';
import {
  applyTraitShift,
  computeDominantTrait,
  freshTraits
} from '../narrative/personalityEngine';
import { freshMemory } from '../narrative/memoryEngine';
import { resolveChoice } from './choiceResolver';
import {
  applyNarrativeEnrichment,
  applyNarrativeFallback,
  buildConsequence,
  type ConsequenceRender
} from './consequenceEngine';
import {
  buildNarrativePromptInput,
  isNarrativeEnrichmentEnabled,
  streamNarrativeEnrichment
} from '../narrative/narrativeClient';
import type { NarrativePromptOutput } from '../narrative/narrativeClient';
import { advanceTurn, isFinalTurn, processTurnCallbacks } from './gameLoop';
import { pickEnding, buildEnding, type EndingRender } from './endingEngine';
import { pickNextScenario } from '../narrative/scenarioEngine';
import { evaluateTensions, type TensionAlert } from '../simulation/tensions';
import { eraForTurn, yearForTurn } from '../content/eras';
import { presetForEra } from '../content/erasPresets';
import { causalTicker } from '../../lib/stores/causalTicker.svelte';
import {
  legendaryById,
  type LegendaryCharacter
} from '../content/legendaryCharacters';
import { assetById, ORG_ACTIONS } from '../org/catalog';
import {
  applyOrganizationDelta,
  canDevelopOrganization,
  expectedDuesIncome,
  expectedStaffCost,
  formatOrgDelta,
  freshOrganization
} from '../org/organization';
import { computeBudget } from '../org/treasury';
import type { OrgAction, EngagedTalent, TalentGroup } from '../org/types';
import { talentById } from '../org/talents';
import { availableStrategies, strategyById } from '../strategy/catalog';
import { startStrategy, tickStrategies } from '../strategy/resolver';
import { freshWorldAI, tickWorldAI } from '../ai/worldAI';
import {
  campaignInternalElection,
  startInternalElection,
  tickInternalElection,
  type ElectionCampaignMove
} from '../org/internalElections';
import { advancePipelineAfterScenario, syncPipelines } from '../narrative/pipelineEngine';
import { objectivesForRole } from '../objectives/catalog';
import { evaluateObjectives } from '../objectives/evaluator';

/* Slot actif (UX-#9). Trois sauvegardes possibles : 1, 2, 3.
   Le slot par défaut est 1. La clé legacy `paritas_rebirth_save_v1`
   reste lue pour migration transparente vers le slot 1. */
const SLOT_KEY = 'paritas_active_slot';
const LEGACY_SAVE_KEY = 'paritas_rebirth_save_v1';

function getActiveSlot(): 1 | 2 | 3 {
  try {
    const v = localStorage.getItem(SLOT_KEY);
    if (v === '1' || v === '2' || v === '3') return parseInt(v, 10) as 1 | 2 | 3;
  } catch {
    /* ignore */
  }
  return 1;
}

function saveKeyFor(slot: 1 | 2 | 3): string {
  return `paritas_rebirth_save_slot_${slot}`;
}

function activeSaveKey(): string {
  return saveKeyFor(getActiveSlot());
}

export function setActiveSlot(slot: 1 | 2 | 3) {
  try {
    localStorage.setItem(SLOT_KEY, String(slot));
  } catch {
    /* ignore */
  }
}

/** Métadonnées d'un slot pour l'écran de sélection. */
export interface SlotMeta {
  slot: 1 | 2 | 3;
  empty: boolean;
  name?: string;
  camp?: 'salarie' | 'patron';
  turn?: number;
  score?: number;
  dominantTrait?: string;
  institutions?: number;
}

export function readSlotMeta(slot: 1 | 2 | 3): SlotMeta {
  try {
    const raw = localStorage.getItem(saveKeyFor(slot))
      ?? (slot === 1 ? localStorage.getItem(LEGACY_SAVE_KEY) : null);
    if (!raw) return { slot, empty: true };
    const data = JSON.parse(raw) as { state?: RebirthGameState };
    const s = data.state;
    if (!s) return { slot, empty: true };
    return {
      slot,
      empty: false,
      name: s.name,
      camp: s.camp,
      turn: s.turn,
      score: 0, // calculé à la volée si besoin par le caller
      dominantTrait: s.dominantTrait,
      institutions: s.memory?.builtInstitutions?.length ?? 0
    };
  } catch {
    return { slot, empty: true };
  }
}

export function deleteSlot(slot: 1 | 2 | 3) {
  try {
    localStorage.removeItem(saveKeyFor(slot));
    if (slot === 1) localStorage.removeItem(LEGACY_SAVE_KEY);
  } catch {
    /* ignore */
  }
}

function freshRebirthState(
  camp: Camp,
  name: string,
  mode: RenderMode,
  legendary?: LegendaryCharacter,
  startTurn: number = 1
): RebirthGameState {
  let traits = freshTraits();
  /* Mode "Séance prof" (ORDA-017) — si on démarre à un tour > 1, on
     applique la preset de ressources de l'ère correspondante au lieu
     de l'état frais T1. La preset 'revolution' est strictement
     identique à freshResources() (cf. erasPresets.test.ts). */
  const startEra = eraForTurn(startTurn);
  let resources = startTurn > 1 ? presetForEra(startEra.id) : freshResources();
  if (legendary) {
    traits = applyTraitShift(traits, legendary.traitBonus);
    if (legendary.resourceBonus) {
      resources = applyResourceDelta(resources, legendary.resourceBonus);
    }
  }
  const objectives = objectivesForRole(camp, legendary?.id);
  const draft: RebirthGameState = {
    name,
    camp,
    mode,
    legendaryId: legendary?.id ?? null,
    turn: startTurn,
    era: startEra.id,
    currentScenarioId: null,
    traits,
    dominantTrait: computeDominantTrait(traits),
    personalityStress: 0,
    resources,
    actors: freshActors(),
    organization: freshOrganization(camp, name),
    activeStrategies: [],
    worldAI: freshWorldAI(),
    activePipelines: [],
    memory: freshMemory(),
    objectives,
    objectiveProgress: [],
    phase: 'idle',
    lastChoice: null,
    lastConsequenceText: null,
    endingId: null
  };
  draft.objectiveProgress = evaluateObjectives(draft, objectives);
  return draft;
}

class RebirthGameStore {
  state = $state<RebirthGameState | null>(null);
  /** Scénario courant (rendu par scenarioEngine) */
  currentScenario = $state<Scenario | null>(null);
  /** Conséquence courante (en phase 'consequence') */
  consequence = $state<ConsequenceRender | null>(null);
  /** Alertes courantes */
  alerts = $state<TensionAlert[]>([]);
  /** Fin de partie rendue */
  ending = $state<EndingRender | null>(null);
  /** Journal d'événements (texte court) */
  log = $state<string[]>([]);

  /** Aborts the in-flight narrative enrichment, if any. */
  private narrativeAbort: AbortController | null = null;

  /** Démarre une nouvelle partie.
   *
   *  `startTurn` (défaut 1) — Mode "Séance prof" (ORDA-017, P0 panel-30
   *  Aïcha #23). Permet à un enseignant de démarrer la partie à un tour
   *  donné (ex : T17 Front populaire, T29 Trente Glorieuses, T69
   *  ordonnances Macron) pour focaliser un cours sur une période
   *  historique précise. Les ressources sont alors initialisées via la
   *  preset d'ère (cf. erasPresets.ts) plutôt que l'état frais T1. */
  start(opts: {
    name: string;
    camp: Camp;
    mode: RenderMode;
    legendaryId?: string;
    startTurn?: number;
  }) {
    const legendary = opts.legendaryId ? legendaryById(opts.legendaryId) : undefined;
    const startTurn = Math.max(1, Math.min(100, Math.floor(opts.startTurn ?? 1)));
    this.state = freshRebirthState(opts.camp, opts.name, opts.mode, legendary, startTurn);
    this.consequence = null;
    this.alerts = [];
    this.ending = null;
    const era = eraForTurn(startTurn);
    const intro = legendary
      ? `${opts.name} incarne ${legendary.name} (${legendary.years}) — côté ${opts.camp === 'patron' ? 'patronal' : 'salarié'}, mode ${opts.mode === 'reflechi' ? 'Réfléchi' : 'Compulsif'}.`
      : `${opts.name} entre dans l'histoire — côté ${opts.camp === 'patron' ? 'patronal' : 'salarié'}, mode ${opts.mode === 'reflechi' ? 'Réfléchi' : 'Compulsif'}.`;
    this.log = [intro];
    if (startTurn > 1) {
      this.log = [
        ...this.log,
        `Mode pédagogique — démarrage à ${era.name} (T${startTurn}, ${era.period}).`
      ];
    }
    if (legendary?.signature) {
      this.log = [...this.log, `« ${legendary.signature} » — ${legendary.name}`];
    }
    this.advanceToNextScenario();
    this.persist();
  }

  /** Charge la prochaine scène ou finit la partie. */
  advanceToNextScenario() {
    const s = this.state;
    if (!s) return;
    if (isFinalTurn(s)) {
      this.endRun();
      return;
    }
    const pick = pickNextScenario(s);
    if (!pick) {
      // Tous les scénarios joués
      this.endRun();
      return;
    }
    this.currentScenario = pick.scenario;
    const targetTurn = Math.max(s.turn, pick.scenario.turn);
    this.state = {
      ...s,
      currentScenarioId: pick.scenario.id,
      phase: 'scene',
      turn: targetTurn,
      era: eraForTurn(targetTurn).id
    };
  }

  /** Applique un choix, calcule la conséquence, passe en phase 'consequence'. */
  choose(choice: Choice) {
    const s = this.state;
    const scenario = this.currentScenario;
    if (!s || !scenario) return;
    if (choice.requiresTrait && choice.requiresTrait !== s.dominantTrait) return;

    /* Choix spécial : déclenche le mini-jeu Matignon (V3) */
    if (choice.flag === 'enter_matignon') {
      this.enterMatignon();
      return;
    }

    /* Choix spécial : déclenche l'Atelier La Place (fusion Arena+Rue) */
    if (choice.flag === 'enter_laplace') {
      this.enterLaPlace();
      return;
    }

    const previousDominantTrait = s.dominantTrait;
    const next = advancePipelineAfterScenario(resolveChoice(s, scenario, choice), scenario);
    const render = buildConsequence(next, scenario, choice, previousDominantTrait);
    const after: RebirthGameState = {
      ...next,
      phase: 'consequence',
      lastConsequenceText: render.text,
      objectiveProgress: evaluateObjectives(next, next.objectives, next.objectiveProgress)
    };
    this.state = after;
    this.consequence = render;
    this.alerts = evaluateTensions(after);
    this.log = [
      ...this.log,
      `T${after.turn} — ${scenario.title} : ${choice.text}`
    ].slice(-50);

    /* Causalité du ticker (cf. critique designer §Décision 5) :
       le monde émet une news en réaction au flag posé par le choix.
       Vit ~5 tours dans le bandeau d'actualités. */
    causalTicker.prune(after.turn);
    causalTicker.emitFor(choice.flag, after.turn, yearForTurn(after.turn) ?? 1789);

    this.persist();
    this.requestNarrativeEnrichment(after, scenario, choice);
  }

  private requestNarrativeEnrichment(
    state: RebirthGameState,
    scenario: Scenario,
    choice: Choice
  ) {
    this.narrativeAbort?.abort();
    const scenarioId = scenario.id;
    if (!isNarrativeEnrichmentEnabled()) {
      this.applyFallbackEnrichment(state, scenario, choice, scenarioId);
      return;
    }
    const controller = new AbortController();
    this.narrativeAbort = controller;
    const input = buildNarrativePromptInput(state, scenario, choice);

    const isStillCurrent = () =>
      !controller.signal.aborted &&
      this.consequence !== null &&
      this.state?.lastChoice?.scenarioId === scenarioId;

    void streamNarrativeEnrichment(
      input,
      {
        onUpdate: snapshot => {
          if (!isStillCurrent()) return;
          const current = this.consequence;
          if (!current) return;
          this.consequence = applyNarrativeEnrichment(current, snapshotToOutput(snapshot, current));
        },
        onComplete: output => {
          if (!isStillCurrent()) return;
          const current = this.consequence;
          if (!current) return;
          if (output) {
            this.consequence = applyNarrativeEnrichment(current, output);
          } else if (!current.enriched) {
            this.consequence = applyNarrativeFallback(current, state, scenario, choice);
          }
        },
        onError: () => {
          if (!isStillCurrent()) return;
          const current = this.consequence;
          if (!current) return;
          if (!current.enriched) {
            this.consequence = applyNarrativeFallback(current, state, scenario, choice);
          }
        }
      },
      controller.signal
    );
  }

  private applyFallbackEnrichment(
    state: RebirthGameState,
    scenario: Scenario,
    choice: Choice,
    scenarioId: string
  ) {
    queueMicrotask(() => {
      const current = this.consequence;
      if (!current) return;
      if (this.state?.lastChoice?.scenarioId !== scenarioId) return;
      this.consequence = applyNarrativeFallback(current, state, scenario, choice);
    });
  }

  /** Continue après la phase 'consequence' : avance le tour, charge la suite. */
  continueAfterConsequence() {
    const s = this.state;
    if (!s) return;
    this.narrativeAbort?.abort();
    this.narrativeAbort = null;
    if (isFinalTurn(s)) {
      this.endRun();
      return;
    }
    const upkept = this.applyOrganizationUpkeep(advanceTurn(s));
    /* P1-10-branch (ORDA-013) — déclenchement auto des callbacks
       acteurs au nouveau tour. Les callbacks dus sont consommés
       (retirés de la file) puis convertis en lignes de log avec
       préfixe acteur. */
    const callbackTick = processTurnCallbacks(upkept);
    const advanced = this.applyTalentGroupBonuses(callbackTick.state);
    const strategyTick = tickStrategies(advanced);
    const worldTick = tickWorldAI(strategyTick.state);
    const electionTick = tickInternalElection(worldTick.state);
    const pipelineState = syncPipelines(electionTick.state);
    this.state = {
      ...pipelineState,
      objectiveProgress: evaluateObjectives(
        pipelineState,
        pipelineState.objectives,
        pipelineState.objectiveProgress
      )
    };
    /* Préfixer chaque callback déclenché par "Mémoire {acteur} — " */
    const currentTurn = pipelineState.turn;
    const callbackLogs = callbackTick.triggered.map(cb => {
      const actorLabel = cb.actor === 'base' ? 'Base' :
                         cb.actor === 'adversaire' ? 'Adversaire' :
                         cb.actor === 'etat' ? 'État' :
                         cb.actor === 'opinion' ? 'Opinion' :
                         cb.actor === 'factions' ? 'Factions' :
                         cb.actor === 'joueur' ? 'Toi' : String(cb.actor);
      return `T${currentTurn} — Mémoire (${actorLabel}) : ${cb.narrative}`;
    });
    const logs = [
      ...callbackLogs,
      ...strategyTick.logs,
      ...worldTick.logs,
      ...electionTick.logs
    ];
    if (logs.length > 0) {
      this.log = [...this.log, ...logs].slice(-50);
    }
    this.consequence = null;
    this.advanceToNextScenario();
    this.persist();
  }

  /** Déclenche le mini-jeu Matignon (passe en phase 'matignon'). */
  enterMatignon() {
    const s = this.state;
    if (!s) return;
    this.state = { ...s, phase: 'matignon', matignonPending: true };
  }

  /** Applique le résultat de la table Matignon aux ressources V2, puis continue. */
  resolveMatignon(result: { agreementId: string | null; quality: Record<string, number> }) {
    const s = this.state;
    if (!s) return;

    let deltaConfiance = 0;
    let deltaCaisse = 0;
    let deltaLegitimite = 0;
    let deltaRapportDeForce = 0;
    let logLine = '';

    if (result.agreementId) {
      // Accord → gains mesurés sur la qualité de l'accord
      const avgQuality = Object.values(result.quality).reduce((a, b) => a + b, 0) / Object.keys(result.quality).length;
      deltaConfiance = Math.round(avgQuality * 0.4);       // max ~40
      deltaCaisse = 25;
      deltaLegitimite = Math.round(avgQuality * 0.25);     // max ~25
      deltaRapportDeForce = 5;
      logLine = `Matignon : accord signé (qualité ${Math.round(avgQuality)}/100). +${deltaConfiance} confiance, +${deltaCaisse}k caisse.`;
    } else {
      // Rupture → coût confiance, gain légitimité radicale
      deltaConfiance = -25;
      deltaCaisse = -10;
      deltaLegitimite = 15;
      deltaRapportDeForce = 10;
      logLine = 'Matignon : table rompue. La base se radicalise. -25 confiance, +15 légitimité.';
    }

    const next: typeof s = {
      ...s,
      phase: 'consequence',
      matignonPending: false,
      resources: {
        ...s.resources,
        confiance: Math.max(0, Math.min(100, s.resources.confiance + deltaConfiance)),
        caisse: Math.max(0, s.resources.caisse + deltaCaisse),
        legitimite: Math.max(0, Math.min(100, s.resources.legitimite + deltaLegitimite)),
        rapportDeForce: Math.max(0, Math.min(100, s.resources.rapportDeForce + deltaRapportDeForce))
      },
      lastConsequenceText: result.agreementId
        ? 'L\'accord sur les salaires passe. La base respire. Mais l\'État pose déjà des conditions pour l\'application.'
        : 'La table casse. La rue se radicalise. Le patronat jubile en coulisses, mais la rue ne se laissera pas oublier.',
      memory: {
        ...s.memory,
        playedScenarios: [...s.memory.playedScenarios, 'matignon-1936']
      }
    };
    this.state = next;
    this.consequence = {
      text: next.lastConsequenceText!,
      numericSummary: `Confiance ${deltaConfiance > 0 ? '+' : ''}${deltaConfiance} · Caisse ${deltaCaisse > 0 ? '+' : ''}${deltaCaisse}k · Légitimité ${deltaLegitimite > 0 ? '+' : ''}${deltaLegitimite}`,
      voice: null,
      innerVoice: result.agreementId
        ? 'On a tenu. La base a sa victoire. Pour l\'instant.'
        : 'On a refusé un accord trop fragile. C\'est cher. Mais parfois le refus est le seul langage qui compte.',
      newspaperHeadline: result.agreementId
        ? 'Matignon : les syndicats arrachent un accord historique sur les salaires'
        : 'Rupture à Matignon : les négociations échouent, la grève reprend',
      memoryLine: result.agreementId
        ? 'L\'accord de Matignon inaugure une ère de conventions collectives en France.'
        : 'La rupture de Matignon renforce les courants radicaux pendant cinq ans.',
      enriched: true,
      traitShift: null,
      traitChange: null,
      concreteMeasures: result.agreementId
        ? ['Hausses salariales immédiates signées', 'Conventions collectives reconnues', 'Congés payés acquis']
        : ['La rue reprend les barricades', 'L\'État prépare des décrets d\'ordre']
    };
    this.log = [...this.log, logLine].slice(-50);
    this.persist();
  }

  /** Déclenche l'Atelier La Place (fusion Arena+Rue). */
  enterLaPlace() {
    const s = this.state;
    if (!s) return;
    this.state = { ...s, phase: 'laplace', laplacePending: true };
  }

  /** Applique le résultat de La Place aux ressources V2, puis continue. */
  resolveLaPlace(effects: {
    confiance: number; rapportDeForce: number; santeSociale: number;
    legitimite: number; caisse: number; cohesionInterne: number;
  }) {
    const s = this.state;
    if (!s) return;

    const sign = (n: number) => n > 0 ? `+${n}` : `${n}`;
    const summaryParts: string[] = [];
    if (effects.confiance !== 0) summaryParts.push(`Confiance ${sign(effects.confiance)}`);
    if (effects.rapportDeForce !== 0) summaryParts.push(`Rapport de force ${sign(effects.rapportDeForce)}`);
    if (effects.santeSociale !== 0) summaryParts.push(`Santé sociale ${sign(effects.santeSociale)}`);

    const victoire = effects.confiance > 10;
    const repression = effects.santeSociale < -10;

    const next: typeof s = {
      ...s,
      phase: 'consequence',
      laplacePending: false,
      resources: {
        ...s.resources,
        confiance: Math.max(0, Math.min(100, s.resources.confiance + effects.confiance)),
        rapportDeForce: Math.max(0, Math.min(100, s.resources.rapportDeForce + effects.rapportDeForce)),
        santeSociale: Math.max(0, Math.min(100, s.resources.santeSociale + effects.santeSociale)),
        legitimite: Math.max(0, Math.min(100, s.resources.legitimite + effects.legitimite)),
        caisse: Math.max(0, s.resources.caisse + effects.caisse),
        cohesionInterne: Math.max(0, Math.min(100, s.resources.cohesionInterne + effects.cohesionInterne))
      },
      lastConsequenceText: victoire
        ? 'La place tient. Le cortège a montré sa force. Ce soir, les journaux parleront de vous — en bien.'
        : repression
        ? 'Les CRS ont chargé. Des blessés dans les rangs. La base est ébranlée, mais pas brisée.'
        : 'La manif se disperse sur un bilan mitigé. On a tenu, sans victoire nette. La prochaine fois.'
    };
    this.state = next;
    this.consequence = {
      text: next.lastConsequenceText!,
      numericSummary: summaryParts.join(' · '),
      voice: null,
      innerVoice: victoire
        ? 'La rue a parlé. Le patronat a entendu.'
        : repression
        ? 'On paie le prix de la rue. Mais la colère ne s\'efface pas.'
        : 'Pas de victoire. Pas de défaite. On continue.',
      newspaperHeadline: victoire
        ? 'Grande manifestation — le cortège impose son passage'
        : repression
        ? 'Affrontements en marge de la manifestation — plusieurs interpellations'
        : 'Manifestation nationale : mobilisation en demi-teinte',
      memoryLine: victoire
        ? 'La rue a prouvé sa capacité à tenir face aux forces de l\'ordre.'
        : 'La manif laisse des traces dans les rangs militants.',
      enriched: true,
      traitShift: null,
      traitChange: null,
      concreteMeasures: victoire
        ? ['Cortège pacifique et massif', 'Presse favorable', 'Patronat contraint de négocier']
        : repression
        ? ['Interpellations dans les rangs', 'Blessés légers', 'Ministre de l\'Intérieur en alerte']
        : ['Mobilisation dans les objectifs', 'Aucun incident majeur']
    };
    this.log = [...this.log, `La Place : ${victoire ? 'victoire' : repression ? 'répression' : 'compromis'}.`].slice(-50);
    this.persist();
  }

  startStrategy(strategyId: string) {
    const s = this.state;
    if (!s || !canDevelopOrganization(s.turn, s.camp)) return;
    const definition = strategyById(strategyId);
    if (!definition) return;
    const activeIds = s.activeStrategies.map(strategy => strategy.id);
    const available = availableStrategies(s.turn, s.camp, s.organization, activeIds);
    if (!available.some(strategy => strategy.id === strategyId)) return;
    if (s.organization.treasury < (definition.costPerTurn.treasury ?? 0)) return;

    this.state = startStrategy(s, definition);
    this.log = [
      ...this.log,
      `T${s.turn} — Stratégie lancée : ${definition.label}. ${definition.description}`
    ].slice(-50);
    this.persist();
  }

  startInternalElection() {
    const s = this.state;
    if (!s || !canDevelopOrganization(s.turn, s.camp)) return;
    this.state = startInternalElection(s);
    this.log = [...this.log, `T${s.turn} — Élection interne : tu demandes un mandat clair.`].slice(-50);
    this.persist();
  }

  campaignInternalElection(move: ElectionCampaignMove) {
    const s = this.state;
    if (!s?.organization.election?.active) return;
    this.state = campaignInternalElection(s, move);
    this.log = [...this.log, `T${s.turn} — Campagne interne : ${campaignLabel(move)}.`].slice(-50);
    this.persist();
  }

  /**
   * Applique un delta générique (ressources / acteurs / organisation) issu
   * d'un simulateur (meeting, manifestation, formation…) et inscrit une
   * ligne dans le journal. Pas de gating turn-based ici : c'est au caller
   * (le simulateur) de vérifier ses propres conditions.
   */
  applyOperation(input: {
    label: string;
    resourceDelta?: Partial<import('../types').Resources>;
    actorDelta?: Partial<Record<import('../types').ActorId, { trust?: number; pressure?: number; patience?: number }>>;
    organizationDelta?: import('../org/types').OrganizationDelta;
  }) {
    const s = this.state;
    if (!s) return;
    const resources = input.resourceDelta
      ? applyResourceDelta(s.resources, input.resourceDelta)
      : s.resources;
    const actors = input.actorDelta ? applyActorsDelta(s.actors, input.actorDelta) : s.actors;
    const organization = input.organizationDelta
      ? applyOrganizationDelta(s.organization, input.organizationDelta)
      : s.organization;
    this.state = { ...s, resources, actors, organization };
    this.log = [...this.log, `T${s.turn} — ${input.label}`].slice(-50);
    this.persist();
  }

  /** Engage un talent. Coût caisse + bonus immédiat + ajout au pool. */
  engageTalent(catalogId: string) {
    const s = this.state;
    if (!s) return;
    const t = talentById(catalogId);
    if (!t) return;
    if (t.camp !== s.camp) return;
    if (s.organization.engagedTalents.some(e => e.catalogId === catalogId)) return;
    if (s.organization.treasury < t.cost) return;

    const orgWithBonus = applyOrganizationDelta(s.organization, {
      ...t.hireOrg,
      treasury: -(t.cost) + (t.hireOrg?.treasury ?? 0)
    });
    const resources = t.hireResource ? applyResourceDelta(s.resources, t.hireResource) : s.resources;
    const newEngaged: EngagedTalent = {
      catalogId: t.id,
      nom: t.nom,
      specialite: t.specialite,
      hiredTurn: s.turn,
      group: null
    };

    this.state = {
      ...s,
      resources,
      organization: {
        ...orgWithBonus,
        engagedTalents: [...orgWithBonus.engagedTalents, newEngaged]
      }
    };
    this.log = [...this.log, `T${s.turn} — Engagement : ${t.nom} (${t.specialite}) rejoint l’équipe.`].slice(-50);
    this.persist();
  }

  /** Affecte un talent à un groupe (ou le remet en réserve avec null). */
  assignTalent(catalogId: string, group: TalentGroup | null) {
    const s = this.state;
    if (!s) return;
    const next = s.organization.engagedTalents.map(e =>
      e.catalogId === catalogId ? { ...e, group } : e
    );
    this.state = {
      ...s,
      organization: { ...s.organization, engagedTalents: next }
    };
    this.persist();
  }

  /** Retire un talent du pool (rare — généralement on le réaffecte plutôt). */
  dismissTalent(catalogId: string) {
    const s = this.state;
    if (!s) return;
    const next = s.organization.engagedTalents.filter(e => e.catalogId !== catalogId);
    this.state = {
      ...s,
      organization: { ...s.organization, engagedTalents: next }
    };
    this.log = [...this.log, `T${s.turn} — Départ d’un talent du pool.`].slice(-50);
    this.persist();
  }

  performOrgAction(actionId: string) {
    const s = this.state;
    if (!s || !canDevelopOrganization(s.turn, s.camp)) return;
    const action = ORG_ACTIONS.find(item => item.id === actionId);
    if (!action || !this.canUseOrgAction(action)) return;

    const organization = applyOrganizationDelta(s.organization, {
      ...action.orgDelta,
      treasury: (action.orgDelta.treasury ?? 0) - action.cost
    });
    const resources = action.resourceDelta
      ? applyResourceDelta(s.resources, action.resourceDelta)
      : s.resources;
    const actors = action.actorDelta ? applyActorsDelta(s.actors, action.actorDelta) : s.actors;

    this.state = {
      ...s,
      resources,
      actors,
      organization: {
        ...organization,
        doctrine: action.doctrine ?? organization.doctrine,
        actionHistory: [`T${s.turn} — ${action.label}`, ...organization.actionHistory].slice(0, 8)
      }
    };
    this.log = [
      ...this.log,
      `T${s.turn} — Organisation : ${action.narrative} ${formatOrgDelta(action.orgDelta)}`
    ].slice(-50);
    this.persist();
  }

  buyAsset(assetId: string) {
    const s = this.state;
    if (!s || !canDevelopOrganization(s.turn, s.camp)) return;
    const asset = assetById(assetId);
    if (!asset || s.organization.assets.includes(asset.id)) return;
    if (asset.unlockTurn > s.turn) return;
    if (asset.camp && asset.camp !== 'any' && asset.camp !== s.camp) return;
    if (s.organization.treasury < asset.purchaseCost) return;

    const organization = applyOrganizationDelta(s.organization, {
      ...asset.orgDelta,
      treasury: (asset.orgDelta.treasury ?? 0) - asset.purchaseCost
    });
    this.state = {
      ...s,
      resources: asset.resourceDelta ? applyResourceDelta(s.resources, asset.resourceDelta) : s.resources,
      organization: {
        ...organization,
        assets: [...organization.assets, asset.id],
        actionHistory: [`T${s.turn} — Achat : ${asset.label}`, ...organization.actionHistory].slice(0, 8)
      }
    };
    this.log = [...this.log, `T${s.turn} — Achat : ${asset.label}. ${asset.description}`].slice(-50);
    this.persist();
  }

  sellAsset(assetId: string) {
    const s = this.state;
    if (!s) return;
    const asset = assetById(assetId);
    if (!asset || !s.organization.assets.includes(asset.id)) return;
    const organization = applyOrganizationDelta(s.organization, {
      treasury: asset.resaleValue,
      reputation: -2,
      cohesion: -1
    });
    this.state = {
      ...s,
      organization: {
        ...organization,
        assets: organization.assets.filter(id => id !== asset.id),
        actionHistory: [`T${s.turn} — Vente : ${asset.label}`, ...organization.actionHistory].slice(0, 8)
      }
    };
    this.log = [...this.log, `T${s.turn} — Vente : ${asset.label}. La caisse respire, l’organisation se contracte.`].slice(-50);
    this.persist();
  }

  /** Fin de partie. */
  endRun() {
    const s = this.state;
    if (!s) return;
    const endingId: EndingId = pickEnding(s);
    const ending = buildEnding(s);
    this.state = { ...s, phase: 'ended', endingId };
    this.ending = ending;
    this.persist();
  }

  reset() {
    this.state = null;
    this.currentScenario = null;
    this.consequence = null;
    this.ending = null;
    this.alerts = [];
    this.log = [];
    causalTicker.reset();
    try {
      localStorage.removeItem(activeSaveKey());
      localStorage.removeItem(LEGACY_SAVE_KEY); // best effort
    } catch {
      /* ignore */
    }
  }

  persist() {
    try {
      const payload = {
        state: this.state,
        log: this.log,
        consequence: this.consequence
      };
      localStorage.setItem(activeSaveKey(), JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }

  load(): boolean {
    try {
      const key = activeSaveKey();
      let raw = localStorage.getItem(key);
      // Migration : si le slot actif est 1 et qu'aucune sauvegarde n'existe,
      // tenter la clé legacy (paritas_rebirth_save_v1).
      if (!raw && getActiveSlot() === 1) {
        raw = localStorage.getItem(LEGACY_SAVE_KEY);
        if (raw) {
          try { localStorage.setItem(key, raw); localStorage.removeItem(LEGACY_SAVE_KEY); } catch {}
        }
      }
      if (!raw) return false;
      const data = JSON.parse(raw) as {
        state?: RebirthGameState;
        log?: string[];
        consequence?: ConsequenceRender | null;
      };
      const s = data.state;
      if (!s) return false;
      if (!s.organization) {
        s.organization = freshOrganization(s.camp, s.name);
      }
      if (!s.organization.factions) {
        s.organization = {
          ...s.organization,
          factions: freshOrganization(s.camp, s.name).factions,
          election: null
        };
      }
      if (typeof s.organization.mobilisationFatigue !== 'number') {
        s.organization = { ...s.organization, mobilisationFatigue: 18 };
      }
      if (!s.organization.engagedTalents) {
        s.organization = { ...s.organization, engagedTalents: [] };
      }
      if (!s.organization.budgetStrategy) {
        s.organization = { ...s.organization, budgetStrategy: 'equilibre' };
      }
      if (!s.activeStrategies) {
        s.activeStrategies = [];
      }
      if (!s.worldAI) {
        s.worldAI = freshWorldAI();
      }
      if (!s.worldAI.state.faction) {
        s.worldAI = {
          ...s.worldAI,
          state: { ...s.worldAI.state, faction: 'unitaire', cycle: 'mid_term' }
        };
      }
      if (!s.worldAI.opponent.factionId) {
        s.worldAI = {
          ...s.worldAI,
          opponent: {
            ...s.worldAI.opponent,
            factionId: 'patronat',
            factionName: s.camp === 'salarie' ? 'Patronat' : 'Syndicats',
            factionShort: s.camp === 'salarie' ? 'Patronat' : 'Syndicats'
          }
        };
      }
      if (!s.activePipelines) {
        s.activePipelines = [];
      }
      if (!s.objectives) {
        s.objectives = objectivesForRole(s.camp);
      }
      if (s.legendaryId === undefined) {
        s.legendaryId = null;
      }
      if (typeof s.personalityStress !== 'number') {
        s.personalityStress = 0;
      }
      s.objectiveProgress = evaluateObjectives(s, s.objectives, s.objectiveProgress ?? []);
      this.state = s;
      this.log = data.log ?? [];
      const pick = pickNextScenario(s);
      this.currentScenario = pick?.scenario ?? null;
      if (s.phase === 'ended') {
        this.ending = buildEnding(s);
      } else if (s.phase === 'consequence') {
        if (data.consequence) {
          this.consequence = data.consequence;
        } else {
          /* Old save — no persisted consequence, but state stuck mid-turn.
             Roll forward to the next scene so the UI is never stuck blank. */
          this.state = { ...s, phase: 'scene' };
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  private canUseOrgAction(action: OrgAction): boolean {
    const s = this.state;
    if (!s) return false;
    if (action.unlockTurn > s.turn) return false;
    if (action.camp && action.camp !== 'any' && action.camp !== s.camp) return false;
    return s.organization.treasury >= action.cost;
  }

  private applyTalentGroupBonuses(state: RebirthGameState): RebirthGameState {
    const engaged = state.organization.engagedTalents.filter(t => t.group !== null);
    if (engaged.length === 0) return state;

    let resources = state.resources;
    let actors = state.actors;
    let organization = state.organization;

    for (const e of engaged) {
      const def = talentById(e.catalogId);
      if (!def || !e.group) continue;
      const bonus = def.perTurn[e.group];
      if (!bonus) continue;
      if (bonus.resources) resources = applyResourceDelta(resources, bonus.resources);
      if (bonus.actors) actors = applyActorsDelta(actors, bonus.actors);
      if (bonus.organization) organization = applyOrganizationDelta(organization, bonus.organization);
    }

    return { ...state, resources, actors, organization };
  }

  private applyOrganizationUpkeep(state: RebirthGameState): RebirthGameState {
    const org = state.organization;
    /* Le module treasury produit un snapshot complet (lignes nommées,
       multiplicateur de stratégie). On en applique le solde net. */
    const budget = computeBudget(org, state.turn);

    const cashAfter = org.treasury + budget.net;
    const broke = cashAfter < 0;
    const cohesionHit = broke ? -3 : 0;
    const membershipHit = broke ? -Math.min(15, Math.ceil(-cashAfter / 4)) : 0;

    /* La stratégie budgétaire affecte la cohésion : la distribution
       (aides, formations massives) fidélise la base ; l'épargne (gels,
       reports) la frustre. Effet réel, faible mais visible sur la durée. */
    const strategyCohesion =
      org.budgetStrategy === 'distribution' ? 1
      : org.budgetStrategy === 'epargne' ? -1
      : 0;

    /* Mobilisation recovers slowly each turn (-3) ; if fatigue stays high
       (≥70), militants drift away — the social cost of overexertion. */
    const fatigueRecovery = -3;
    const burnoutMembership = org.mobilisationFatigue >= 70 ? -3 : 0;
    const burnoutMilitants = org.mobilisationFatigue >= 70 ? -1 : 0;

    const organization = applyOrganizationDelta(org, {
      treasury: budget.net,
      cohesion: cohesionHit + strategyCohesion,
      membership: membershipHit + burnoutMembership,
      militants: burnoutMilitants,
      mobilisationFatigue: fatigueRecovery
    });

    const resources = broke
      ? applyResourceDelta(state.resources, { caisse: -2, confiance: -1 })
      : state.resources;

    /* Si la trésorerie a reçu un don/legs ce tour, le journaliser
       avec un nom inventé : ça donne au joueur le sens de l'événement
       au lieu d'une ligne anonyme dans le tableau. */
    const donLine = budget.recettes.find(l => l.id === 'dons-legs');
    if (donLine) {
      const benefactor = pickBenefactor(state.turn);
      this.log = [
        ...this.log,
        `T${state.turn} — ${benefactor} verse ${donLine.amount} à la caisse (don / legs).`
      ].slice(-50);
    }

    return { ...state, organization, resources };
  }

  /** Change la stratégie budgétaire active. */
  setBudgetStrategy(strategy: import('../org/types').BudgetStrategy) {
    const s = this.state;
    if (!s) return;
    if (s.organization.budgetStrategy === strategy) return;
    this.state = {
      ...s,
      organization: { ...s.organization, budgetStrategy: strategy }
    };
    this.log = [...this.log, `T${s.turn} — Stratégie budgétaire : ${strategy}.`].slice(-50);
    this.persist();
  }

  /**
   * Inscrit le tour auquel une action ponctuelle de la trésorerie a été
   * jouée — sert au gating des cooldowns côté UI (TreasuryPanel).
   */
  recordTreasuryAction(actionId: string) {
    const s = this.state;
    if (!s) return;
    const turns = { ...(s.organization.treasuryActionTurns ?? {}), [actionId]: s.turn };
    this.state = {
      ...s,
      organization: { ...s.organization, treasuryActionTurns: turns }
    };
    this.persist();
  }
}

/** Un nom de bienfaiteur déterministe pour la ligne de journal des dons. */
function pickBenefactor(turn: number): string {
  const NAMES = [
    'Marie-Anne Béluse',
    'Le Cercle des amis du Devoir',
    'Une veuve anonyme de Lyon',
    'L\'imprimerie Champollion',
    'Henri Forestier',
    'La Société de Saint-Vincent',
    'Émilienne Roux',
    'Le syndicat frère de Roubaix',
    'Un legs testamentaire',
    'Le café des Halles'
  ];
  return NAMES[turn % NAMES.length]!;
}

function campaignLabel(move: ElectionCampaignMove): string {
  return {
    rassembler: 'motion de rassemblement',
    promettre_rupture: 'ligne de rupture',
    professionnaliser: 'preuve par les dossiers',
    terrain: 'tournée des sections'
  }[move];
}

/**
 * Turns a partial streaming snapshot into a NarrativePromptOutput
 * suitable for applyNarrativeEnrichment. Falls back to the current
 * consequence text when the streamed `consequence` section hasn't
 * started arriving yet — so partial updates can flow without losing
 * the immediate text already shown to the player.
 */
function snapshotToOutput(
  snapshot: Partial<NarrativePromptOutput>,
  current: ConsequenceRender
): NarrativePromptOutput {
  return {
    consequence: snapshot.consequence ?? current.text,
    innerVoice: snapshot.innerVoice,
    newspaperHeadline: snapshot.newspaperHeadline,
    memoryLine: snapshot.memoryLine
  };
}

export const rebirth = new RebirthGameStore();
