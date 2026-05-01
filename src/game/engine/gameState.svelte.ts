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
  buildConsequence,
  type ConsequenceRender
} from './consequenceEngine';
import {
  buildNarrativePromptInput,
  fetchNarrativeEnrichment,
  isNarrativeEnrichmentEnabled
} from '../narrative/narrativeClient';
import { advanceTurn, isFinalTurn } from './gameLoop';
import { pickEnding, buildEnding, type EndingRender } from './endingEngine';
import { pickNextScenario } from '../narrative/scenarioEngine';
import { evaluateTensions, type TensionAlert } from '../simulation/tensions';
import { eraForTurn } from '../content/eras';
import {
  legendaryById,
  type LegendaryCharacter
} from '../content/legendaryCharacters';
import { assetById, ORG_ACTIONS } from '../org/catalog';
import {
  applyOrganizationDelta,
  canDevelopOrganization,
  formatOrgDelta,
  freshOrganization
} from '../org/organization';
import type { OrgAction } from '../org/types';
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

const SAVE_KEY = 'paritas_rebirth_save_v1';

function freshRebirthState(
  camp: Camp,
  name: string,
  mode: RenderMode,
  legendary?: LegendaryCharacter
): RebirthGameState {
  let traits = freshTraits();
  let resources = freshResources();
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
    turn: 1,
    era: eraForTurn(1).id,
    currentScenarioId: null,
    traits,
    dominantTrait: computeDominantTrait(traits),
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

  /** Démarre une nouvelle partie. */
  start(opts: { name: string; camp: Camp; mode: RenderMode; legendaryId?: string }) {
    const legendary = opts.legendaryId ? legendaryById(opts.legendaryId) : undefined;
    this.state = freshRebirthState(opts.camp, opts.name, opts.mode, legendary);
    this.consequence = null;
    this.alerts = [];
    this.ending = null;
    const intro = legendary
      ? `${opts.name} incarne ${legendary.name} (${legendary.years}) — côté ${opts.camp === 'patron' ? 'patronal' : 'salarié'}, mode ${opts.mode === 'reflechi' ? 'Réfléchi' : 'Compulsif'}.`
      : `${opts.name} entre dans l'histoire — côté ${opts.camp === 'patron' ? 'patronal' : 'salarié'}, mode ${opts.mode === 'reflechi' ? 'Réfléchi' : 'Compulsif'}.`;
    this.log = [intro];
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
    const next = advancePipelineAfterScenario(resolveChoice(s, scenario, choice), scenario);
    const render = buildConsequence(next, scenario, choice);
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
    this.persist();
    this.requestNarrativeEnrichment(after, scenario, choice);
  }

  private requestNarrativeEnrichment(
    state: RebirthGameState,
    scenario: Scenario,
    choice: Choice
  ) {
    this.narrativeAbort?.abort();
    if (!isNarrativeEnrichmentEnabled()) return;
    const controller = new AbortController();
    this.narrativeAbort = controller;
    const input = buildNarrativePromptInput(state, scenario, choice);
    const scenarioId = scenario.id;
    void fetchNarrativeEnrichment(input, controller.signal).then(output => {
      if (controller.signal.aborted || !output) return;
      const current = this.consequence;
      if (!current) return;
      if (this.state?.lastChoice?.scenarioId !== scenarioId) return;
      this.consequence = applyNarrativeEnrichment(current, output);
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
    const advanced = this.applyOrganizationUpkeep(advanceTurn(s));
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
    const logs = [...strategyTick.logs, ...worldTick.logs, ...electionTick.logs];
    if (logs.length > 0) {
      this.log = [...this.log, ...logs].slice(-50);
    }
    this.consequence = null;
    this.advanceToNextScenario();
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
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
  }

  persist() {
    try {
      const payload = {
        state: this.state,
        log: this.log
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }

  load(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw) as { state?: RebirthGameState; log?: string[] };
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
      if (!s.activeStrategies) {
        s.activeStrategies = [];
      }
      if (!s.worldAI) {
        s.worldAI = freshWorldAI();
      }
      if (!s.activePipelines) {
        s.activePipelines = [];
      }
      if (!s.objectives) {
        s.objectives = objectivesForRole(s.camp);
      }
      s.objectiveProgress = evaluateObjectives(s, s.objectives, s.objectiveProgress ?? []);
      this.state = s;
      this.log = data.log ?? [];
      const pick = pickNextScenario(s);
      this.currentScenario = pick?.scenario ?? null;
      if (s.phase === 'ended') {
        this.ending = buildEnding(s);
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

  private applyOrganizationUpkeep(state: RebirthGameState): RebirthGameState {
    const upkeep = state.organization.assets
      .map(id => assetById(id)?.upkeep ?? 0)
      .reduce((sum, value) => sum + value, 0);
    if (upkeep <= 0) return state;
    const organization = applyOrganizationDelta(state.organization, {
      treasury: -upkeep,
      cohesion: state.organization.treasury <= upkeep ? -2 : 0
    });
    return {
      ...state,
      organization,
      resources: applyResourceDelta(state.resources, {
        caisse: state.organization.treasury <= upkeep ? -2 : 0
      })
    };
  }
}

function campaignLabel(move: ElectionCampaignMove): string {
  return {
    rassembler: 'motion de rassemblement',
    promettre_rupture: 'ligne de rupture',
    professionnaliser: 'preuve par les dossiers',
    terrain: 'tournée des sections'
  }[move];
}

export const rebirth = new RebirthGameStore();
