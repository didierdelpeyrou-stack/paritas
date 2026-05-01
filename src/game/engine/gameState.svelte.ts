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
import { buildConsequence, type ConsequenceRender } from './consequenceEngine';
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
  return {
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
    memory: freshMemory(),
    phase: 'idle',
    lastChoice: null,
    lastConsequenceText: null,
    endingId: null
  };
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
    const next = resolveChoice(s, scenario, choice);
    const render = buildConsequence(next, choice);
    const after: RebirthGameState = {
      ...next,
      phase: 'consequence',
      lastConsequenceText: render.text
    };
    this.state = after;
    this.consequence = render;
    this.alerts = evaluateTensions(after);
    this.log = [
      ...this.log,
      `T${after.turn} — ${scenario.title} : ${choice.text}`
    ].slice(-50);
    this.persist();
  }

  /** Continue après la phase 'consequence' : avance le tour, charge la suite. */
  continueAfterConsequence() {
    const s = this.state;
    if (!s) return;
    if (isFinalTurn(s)) {
      this.endRun();
      return;
    }
    this.state = this.applyOrganizationUpkeep(advanceTurn(s));
    this.consequence = null;
    this.advanceToNextScenario();
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

export const rebirth = new RebirthGameStore();
