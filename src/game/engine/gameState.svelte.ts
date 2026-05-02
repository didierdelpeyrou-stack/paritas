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
    legendaryId: legendary?.id ?? null,
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
    if (choice.requiresTrait && choice.requiresTrait !== s.dominantTrait) return;
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
    const advanced = this.applyTalentGroupBonuses(upkept);
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
        log: this.log,
        consequence: this.consequence
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
