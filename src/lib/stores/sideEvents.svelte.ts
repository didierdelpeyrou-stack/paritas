/* ============================================================
   Paritas — store de pilotage des événements secondaires (V3)
   ============================================================
   Tire un événement compatible entre deux scénarios principaux,
   selon une probabilité par tour, en évitant la répétition.

   Convention : on tire au max un événement secondaire par tour,
   et seulement à partir du tour 3 (laisser le joueur entrer
   dans le jeu sans interruption immédiate).
   ============================================================ */

import { rebirth } from '../../game/engine/gameState.svelte';
import { SIDE_EVENTS, compatibleSideEvents } from '../../game/content/sideEvents';
import { yearForTurn } from '../../game/content/eras';
import { causalTicker } from './causalTicker.svelte';
import type { SideEvent, SideEventChoice, Resources, RebirthGameState } from '../../game/types';

const KEY = 'paritas_side_events_v1';

/** Probabilité de tirage d'un événement par tour (au passage scène→scène). */
const TRIGGER_PROBABILITY = 0.35;
/** Premier tour où un événement peut survenir. */
const FIRST_ELIGIBLE_TURN = 3;

interface PersistedState {
  /** IDs déjà joués pour ne pas les re-tirer. */
  played: string[];
  /** Tour du dernier événement (cooldown 2 tours). */
  lastTriggerTurn: number;
}

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { played: [], lastTriggerTurn: -1 };
    const data = JSON.parse(raw);
    if (Array.isArray(data.played)) return data as PersistedState;
  } catch { /* ignore */ }
  return { played: [], lastTriggerTurn: -1 };
}

class SideEventStore {
  /** L'événement actif présenté au joueur (null si aucun). */
  current = $state<SideEvent | null>(null);
  /** Résultat du dernier choix : pour afficher l'outcome avant fermeture. */
  lastOutcome = $state<{
    text: string;
    success: boolean;
    choiceId: string;
  } | null>(null);

  private persisted = $state<PersistedState>(load());

  /** Indique si un événement est ouvert et bloque le retour à la scène. */
  get isOpen(): boolean {
    return this.current !== null || this.lastOutcome !== null;
  }

  /** Tente de tirer un événement compatible. Appelé après une consequence
   *  ou quand le tour avance. Retourne true si un événement a été tiré. */
  maybeTrigger(): boolean {
    const gs = rebirth.state;
    if (!gs) return false;
    if (gs.turn < FIRST_ELIGIBLE_TURN) return false;
    /* Cooldown : pas deux événements consécutifs sur le même tour, ni
     * deux événements sur deux tours d'affilée. */
    if (this.persisted.lastTriggerTurn === gs.turn) return false;
    if (this.persisted.lastTriggerTurn >= 0
      && gs.turn - this.persisted.lastTriggerTurn < 2) return false;

    if (Math.random() > TRIGGER_PROBABILITY) return false;

    const candidates = compatibleSideEvents({
      camp: gs.camp,
      turn: gs.turn,
      era: gs.era,
      dominantTrait: gs.dominantTrait,
      resources: gs.resources,
      alreadyPlayedIds: new Set(this.persisted.played)
    });
    if (candidates.length === 0) return false;

    const picked = weightedPick(candidates);
    this.current = picked;
    return true;
  }

  /** Force le tir d'un événement spécifique par id (debug / test). */
  forceTrigger(id: string) {
    const ev = SIDE_EVENTS.find(e => e.id === id);
    if (ev) this.current = ev;
  }

  /** Le joueur sélectionne un choix. Applique les effets, présente
   *  l'outcome, persiste le played-id. */
  resolve(choice: SideEventChoice) {
    const gs = rebirth.state;
    const ev = this.current;
    if (!gs || !ev) return;

    /* Tirage succès/échec */
    const failProb = choice.failProbability ?? 0;
    const failed = failProb > 0 && Math.random() < failProb;
    const effects = failed && choice.failEffects ? choice.failEffects : choice.effects;
    const outcomeText = failed && choice.failOutcome ? choice.failOutcome : choice.outcome;

    /* Applique les effets sur les ressources / acteurs */
    const next = applyEffects(gs, effects);

    /* TraitShift sur le state si fourni */
    if (choice.traitShift) {
      const traits = { ...next.traits };
      for (const [k, dv] of Object.entries(choice.traitShift)) {
        const key = k as keyof typeof traits;
        if (typeof dv === 'number') {
          traits[key] = Math.max(0, Math.min(100, (traits[key] ?? 0) + dv));
        }
      }
      next.traits = traits;
    }

    /* Flag éventuel dans la mémoire */
    if (choice.flag) {
      const flags = { ...((next.memory as any).flags ?? {}) };
      flags[choice.flag] = (flags[choice.flag] ?? 0) + 1;
      next.memory = { ...next.memory, flags } as any;
    }

    /* Append au journal */
    rebirth.state = next;
    rebirth.log = [
      ...rebirth.log,
      `T${gs.turn} — ${ev.title} : « ${choice.text} » ${failed ? '✗' : '✓'}`
    ].slice(-50);

    /* Marque comme joué + cooldown */
    this.persisted = {
      played: [...this.persisted.played, ev.id],
      lastTriggerTurn: gs.turn
    };
    this.persist();

    /* Causalité du ticker — émet une news en réaction au flag posé
       par le choix de side event (cf. Argus P0-1 — refus éthiques
       patron sans récompense narrative). */
    if (choice.flag) {
      causalTicker.emitFor(choice.flag, gs.turn, yearForTurn(gs.turn) ?? 1789);
    }

    this.lastOutcome = { text: outcomeText, success: !failed, choiceId: choice.id };
    this.current = null;
  }

  /** Le joueur ferme l'outcome — retour à la scène principale. */
  dismiss() {
    this.lastOutcome = null;
  }

  /** Reset complet (rejouer une partie). */
  reset() {
    this.persisted = { played: [], lastTriggerTurn: -1 };
    this.current = null;
    this.lastOutcome = null;
    this.persist();
  }

  private persist() {
    try { localStorage.setItem(KEY, JSON.stringify(this.persisted)); }
    catch { /* ignore */ }
  }
}

/* ====== Helpers ====== */

function weightedPick(events: SideEvent[]): SideEvent {
  const total = events.reduce((s, e) => s + (e.weight ?? 1), 0);
  let r = Math.random() * total;
  for (const e of events) {
    r -= e.weight ?? 1;
    if (r <= 0) return e;
  }
  return events[events.length - 1];
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function applyEffects(
  gs: RebirthGameState,
  effects: { resources?: Partial<Resources>; actors?: any }
): RebirthGameState {
  const r = { ...gs.resources };
  if (effects.resources) {
    for (const [k, dv] of Object.entries(effects.resources)) {
      const key = k as keyof Resources;
      if (typeof r[key] === 'number' && typeof dv === 'number') {
        r[key] = clamp(r[key] + dv);
      }
    }
  }
  let next: RebirthGameState = { ...gs, resources: r };

  if (effects.actors) {
    const actors = { ...gs.actors };
    for (const [aid, deltas] of Object.entries(effects.actors)) {
      const id = aid as keyof typeof actors;
      const d = deltas as any;
      if (!actors[id] || !d) continue;
      actors[id] = {
        ...actors[id],
        trust: clamp(actors[id].trust + (d.trust ?? 0)),
        pressure: clamp(actors[id].pressure + (d.pressure ?? 0)),
        patience: clamp(actors[id].patience + (d.patience ?? 0)),
        ...(d.stance ? { stance: d.stance } : {})
      };
    }
    next = { ...next, actors };
  }

  return next;
}

export const sideEvents = new SideEventStore();
