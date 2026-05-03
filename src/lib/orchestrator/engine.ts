/* ============================================================
   Paritas — Moteur d'exécution des actions
   ============================================================
   Logique pure : prend un OrchestratorState + une ActionDef +
   un GameState lecture-seule, retourne ActionResult avec effets
   à appliquer. L'application au moteur principal est la
   responsabilité du caller (cockpit / store).
   ============================================================ */

import type { ActionDef, ActionResult, OrchestratorState, ActionPrecondition } from './types';
import type { RebirthGameState } from '../../game/types';
import { seededRandom } from '../seed';

/** Vérifie une précondition en lecture-seule sur le gameState. */
function checkPrecondition(
  pre: ActionPrecondition,
  state: RebirthGameState,
  orch: OrchestratorState
): { ok: boolean; reason?: string } {
  switch (pre.kind) {
    case 'turn-min':
      return state.turn >= pre.turn
        ? { ok: true }
        : { ok: false, reason: `Disponible au tour ${pre.turn}` };
    case 'turn-range':
      return (state.turn >= pre.from && state.turn <= pre.to)
        ? { ok: true }
        : { ok: false, reason: `Disponible entre les tours ${pre.from} et ${pre.to}` };
    case 'era-in':
      return pre.eras.includes(state.era as string)
        ? { ok: true }
        : { ok: false, reason: `Pas dans l'ère adéquate` };
    case 'flag-set': {
      const flags = (state.memory as any)?.flags as Record<string, boolean> | undefined;
      return flags?.[pre.flag]
        ? { ok: true }
        : { ok: false, reason: `Exige le flag « ${pre.flag} »` };
    }
    case 'flag-unset': {
      const flags = (state.memory as any)?.flags as Record<string, boolean> | undefined;
      return !flags?.[pre.flag]
        ? { ok: true }
        : { ok: false, reason: `Bloqué par le flag « ${pre.flag} »` };
    }
    case 'resource-min': {
      const r = (state.resources as any)[pre.resource] ?? 0;
      return r >= pre.min
        ? { ok: true }
        : { ok: false, reason: `${pre.resource} insuffisant (${r} < ${pre.min})` };
    }
    case 'camp-only': {
      /* RebirthGameState n'a pas de camp explicite — on infère via
       * un éventuel champ. Pour simplifier : on autorise tout le
       * temps et le caller doit vérifier (V1 GameState a camp). */
      return { ok: true };
    }
    case 'organization-has': {
      const orgAssets = (state.organization as any)?.inventory as Array<{ id: string }> | undefined;
      return orgAssets?.some(a => a.id === pre.assetId)
        ? { ok: true }
        : { ok: false, reason: `Exige : ${pre.assetId}` };
    }
  }
}

/** Vérifie si l'action peut être exécutée (cooldown + préconditions
 *  + coût payable + limite d'actions par tour). */
export function canExecute(
  action: ActionDef,
  state: RebirthGameState,
  orch: OrchestratorState
): { ok: boolean; reason?: string } {

  /* 1. Limite d'actions par tour */
  if (orch.actionsThisTurn >= orch.maxActionsPerTurn) {
    return { ok: false, reason: `Tu as atteint la limite de ${orch.maxActionsPerTurn} actions ce tour` };
  }

  /* 2. Cooldown */
  const cdEnd = orch.cooldowns[action.id];
  if (cdEnd !== undefined && state.turn < cdEnd) {
    const left = cdEnd - state.turn;
    return { ok: false, reason: `Indisponible avant ${left} tour${left > 1 ? 's' : ''}` };
  }

  /* 3. Préconditions */
  for (const pre of action.preconditions ?? []) {
    const r = checkPrecondition(pre, state, orch);
    if (!r.ok) return { ok: false, reason: r.reason };
  }

  /* 4. Coût payable */
  if (action.cost.caisse && (state.resources.caisse ?? 0) < action.cost.caisse) {
    return { ok: false, reason: `Caisse insuffisante (manque ${action.cost.caisse - state.resources.caisse} F)` };
  }
  /* mandat = capital politique : utilise legitimite comme proxy */
  if (action.cost.mandat && (state.resources.legitimite ?? 0) < action.cost.mandat) {
    return { ok: false, reason: `Mandat insuffisant (manque ${action.cost.mandat - state.resources.legitimite} de légitimité)` };
  }

  return { ok: true };
}

/** Exécute une action : applique les effets, gère cooldown,
 *  enregistre le log. Retourne le résultat à propager. */
export function executeAction(
  action: ActionDef,
  state: RebirthGameState,
  orch: OrchestratorState,
  seed: string
): ActionResult {

  const check = canExecute(action, state, orch);
  if (!check.ok) {
    return { outcome: 'blocked', blockReason: check.reason };
  }

  /* Tirage pour échec/succès. Seedé pour reproductibilité. */
  const failProba = action.failProbability ?? 0;
  const r = seededRandom(seed, `action:${action.id}:T${state.turn}`)();
  const failed = r < failProba;

  const eff = failed && action.effectsFail ? action.effectsFail : action.effects;

  return {
    outcome: failed ? 'fail' : 'success',
    effectsApplied: eff,
    narrative: eff.narrative
  };
}

/** Met à jour l'état d'orchestration après une action réussie. */
export function applyOrchestratorUpdate(
  orch: OrchestratorState,
  action: ActionDef,
  outcome: 'success' | 'fail',
  effectsApplied: import('./types').ActionEffect | undefined
): OrchestratorState {
  const cooldownEnd = action.cooldown
    ? orch.turn + action.cooldown
    : 0;
  return {
    ...orch,
    actionsThisTurn: orch.actionsThisTurn + 1,
    cooldowns: cooldownEnd > 0
      ? { ...orch.cooldowns, [action.id]: cooldownEnd }
      : orch.cooldowns,
    history: [
      ...orch.history,
      {
        turn: orch.turn,
        actionId: action.id,
        outcome,
        effectsApplied: effectsApplied ?? {}
      }
    ]
  };
}

/** Reset les compteurs de tour (à appeler à chaque advanceTurn). */
export function resetTurnCounters(orch: OrchestratorState, newTurn: number): OrchestratorState {
  return {
    ...orch,
    turn: newTurn,
    actionsThisTurn: 0
  };
}

export function freshOrchestratorState(maxActionsPerTurn = 2): OrchestratorState {
  return {
    turn: 1,
    cooldowns: {},
    actionsThisTurn: 0,
    maxActionsPerTurn,
    history: []
  };
}
