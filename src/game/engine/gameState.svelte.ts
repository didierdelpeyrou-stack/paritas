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
import { freshActors } from '../simulation/actors';
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
    this.state = advanceTurn(s);
    this.consequence = null;
    this.advanceToNextScenario();
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
}

export const rebirth = new RebirthGameStore();
