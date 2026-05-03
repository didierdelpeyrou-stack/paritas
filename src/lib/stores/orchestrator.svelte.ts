/* ============================================================
   Paritas — Store d'orchestration des actions (V3)
   ============================================================
   Wrapper réactif Svelte 5 autour du moteur orchestrator. Gère
   les cooldowns, le compteur d'actions par tour, l'application
   au gameState principal (rebirth) avec entropie + crise.

   Spec : V3_COCKPIT_THERMODYNAMIQUE.md + lib/orchestrator/*.
   ============================================================ */

import type { OrchestratorState, ActionDef, ActionEffect } from '../orchestrator/types';
import {
  freshOrchestratorState, canExecute, executeAction,
  applyOrchestratorUpdate, resetTurnCounters
} from '../orchestrator/engine';
import {
  isCrisisActive, criticalResources, modifierFor, activeForcing,
  upcomingForcing
} from '../orchestrator/thermodynamics';
import { rebirth } from '../../game/engine/gameState.svelte';
import type { Resources, RebirthGameState } from '../../game/types';

const KEY = 'paritas_orchestrator_v1';

function load(): OrchestratorState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshOrchestratorState();
    const data = JSON.parse(raw);
    if (typeof data.turn === 'number') return data as OrchestratorState;
  } catch { /* ignore */ }
  return freshOrchestratorState();
}

class OrchestratorStore {
  state = $state<OrchestratorState>(load());
  /** Dernière action exécutée — pour l'animation de feedback. */
  lastResult = $state<{ actionId: string; outcome: 'success' | 'fail' | 'blocked'; narrative?: string } | null>(null);

  /** Tente d'exécuter une action. Si OK, applique les effets au
   *  rebirth.state principal. Retourne le résultat. */
  dispatch(action: ActionDef) {
    const gs = rebirth.state;
    if (!gs) {
      this.lastResult = { actionId: action.id, outcome: 'blocked' };
      return;
    }

    /* Sync turn dans l'orchestrator state */
    if (this.state.turn !== gs.turn) {
      this.state = resetTurnCounters(this.state, gs.turn);
    }

    /* RebirthGameState n'a pas de champ seed (V1 GameState seul a
     * `seed`). On dérive un seed déterministe depuis l'identité du
     * personnage + tour. */
    const seed = `${gs.name}:${gs.legendaryId ?? 'na'}:T${gs.turn}`;
    const result = executeAction(action, gs, this.state, seed);
    if (result.outcome === 'blocked') {
      this.lastResult = {
        actionId: action.id,
        outcome: 'blocked',
        narrative: result.blockReason
      };
      return;
    }

    /* Applique les modificateurs des forçages externes (vents) */
    const forcing = modifierFor(action.id, gs.turn);
    const effects = applyForcing(result.effectsApplied!, forcing);

    /* Push dans rebirth.state */
    this.applyEffectsToRebirth(effects);

    /* Update orchestrator state (cooldown + history) */
    this.state = applyOrchestratorUpdate(
      this.state, action, result.outcome, effects
    );

    /* Persist */
    this.persist();

    this.lastResult = {
      actionId: action.id,
      outcome: result.outcome,
      narrative: effects.narrative ?? result.narrative
    };

    /* Append au journal du jeu principal */
    rebirth.log = [
      ...rebirth.log,
      `T${gs.turn} — ${action.label} : ${result.outcome === 'success' ? '✓' : '✗'} ${effects.narrative?.slice(0, 80) ?? ''}`
    ].slice(-50);
  }

  private applyEffectsToRebirth(effects: ActionEffect) {
    const gs = rebirth.state;
    if (!gs || !effects.resources) return;
    const r = { ...gs.resources };
    for (const [k, delta] of Object.entries(effects.resources)) {
      const key = k as keyof Resources;
      if (typeof r[key] === 'number' && typeof delta === 'number') {
        r[key] = clamp(r[key] + delta);
      }
    }
    let newState: RebirthGameState = { ...gs, resources: r };

    /* Acteurs deltas */
    if (effects.actors) {
      const actors = { ...gs.actors };
      for (const [aid, deltas] of Object.entries(effects.actors)) {
        const id = aid as 'base' | 'adversaire' | 'etat' | 'opinion';
        if (!actors[id] || !deltas) continue;
        actors[id] = {
          ...actors[id],
          trust: clamp(actors[id].trust + (deltas.trust ?? 0)),
          pressure: clamp(actors[id].pressure + (deltas.pressure ?? 0)),
          patience: clamp(actors[id].patience + (deltas.patience ?? 0))
        };
      }
      newState = { ...newState, actors };
    }

    /* Flag éventuel */
    if (effects.flag && newState.memory) {
      const flags = { ...((newState.memory as any).flags ?? {}) };
      flags[effects.flag] = (flags[effects.flag] ?? 0) + 1;
      newState = {
        ...newState,
        memory: { ...newState.memory, flags } as any
      };
    }

    rebirth.state = newState;
  }

  /** Crise active : 3+ jauges critiques. */
  get isCrisis(): boolean {
    const gs = rebirth.state;
    return gs ? isCrisisActive(gs.resources) : false;
  }

  /** Liste des ressources en zone rouge. */
  get criticalRes(): Array<keyof Resources> {
    const gs = rebirth.state;
    return gs ? criticalResources(gs.resources) : [];
  }

  /** Vent historique actif au tour courant. */
  get currentForcing() {
    const gs = rebirth.state;
    return gs ? activeForcing(gs.turn) : null;
  }

  /** Vent à venir dans <= 2 tours (Johnson #3 anticipation). */
  get upcomingForcing() {
    const gs = rebirth.state;
    return gs ? upcomingForcing(gs.turn, 2) : null;
  }

  /** Vérifie si une action est exécutable (helper pour UI). */
  canExec(action: ActionDef): { ok: boolean; reason?: string } {
    const gs = rebirth.state;
    if (!gs) return { ok: false, reason: 'Pas de partie en cours' };
    /* Sync turn si décalé */
    const orch = this.state.turn !== gs.turn
      ? resetTurnCounters(this.state, gs.turn)
      : this.state;
    return canExecute(action, gs, orch);
  }

  reset() {
    this.state = freshOrchestratorState();
    this.persist();
    this.lastResult = null;
  }

  private persist() {
    try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch { /* ignore */ }
  }
}

/* ====== Helpers ====== */

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function applyForcing(eff: ActionEffect, modif: ReturnType<typeof modifierFor>): ActionEffect {
  if (!modif.effectMultiplier || modif.effectMultiplier === 1) return eff;
  if (!eff.resources) return eff;
  const out: ActionEffect = {
    ...eff,
    resources: {}
  };
  for (const [k, v] of Object.entries(eff.resources)) {
    if (typeof v === 'number') {
      (out.resources as any)[k] = Math.round(v * modif.effectMultiplier);
    }
  }
  return out;
}

export const orchestrator = new OrchestratorStore();
