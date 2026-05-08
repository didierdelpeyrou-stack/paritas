/* Paritas Rebirth — consequenceEngine.ts
 * Wrapper autour de consequenceWriter : produit le texte final exposé dans
 * la phase 'consequence' du tour, et stocke ce texte dans le state.
 */

import type {
  ActorId, Choice, Memory, PlayerTrait, RebirthGameState,
  Scenario, ScheduledActorCallback, TraitScores
} from '../types';
import { composeConsequence } from '../narrative/consequenceWriter';
import { composeNarrativeFallback } from '../narrative/narrativeFallback';
import type { NarrativePromptOutput } from '../narrative/narrativeClient';
import { composeConcreteMeasures } from '../narrative/concreteMeasures';
import { yearForTurn } from '../content/eras';

export interface TraitShiftSummary {
  /** Trait du delta positif le plus important pour ce choix. */
  trait: PlayerTrait;
  /** Valeur du delta (≥ 1). */
  delta: number;
}

export interface TraitChange {
  from: PlayerTrait;
  to: PlayerTrait;
}

export interface ConsequenceRender {
  text: string;
  numericSummary: string | null;
  voice: string | null;
  innerVoice: string | null;
  newspaperHeadline: string | null;
  memoryLine: string | null;
  enriched: boolean;
  /** Trait le plus poussé par ce choix (peut être null si traitShift vide). */
  traitShift: TraitShiftSummary | null;
  /** Changement de trait dominant déclenché par ce choix (rare, marquant). */
  traitChange: TraitChange | null;
  /** Mesures concrètes traduisant les deltas en chiffres et lieux. */
  concreteMeasures: string[];
}

export function buildConsequence(
  state: RebirthGameState,
  _scenario: Scenario,
  choice: Choice,
  previousDominantTrait: PlayerTrait
): ConsequenceRender {
  const base = composeConsequence(state, choice, state.mode);
  const traitShift = pickDominantShift(choice.traitShift);
  const traitChange =
    previousDominantTrait !== state.dominantTrait
      ? { from: previousDominantTrait, to: state.dominantTrait }
      : null;
  const concreteMeasures = composeConcreteMeasures(
    { camp: state.camp, era: state.era, turn: state.turn },
    choice,
    yearForTurn(state.turn)
  );
  return {
    text: base.text,
    numericSummary: base.numericSummary,
    voice: base.voice,
    innerVoice: null,
    newspaperHeadline: null,
    memoryLine: null,
    enriched: false,
    traitShift,
    traitChange,
    concreteMeasures
  };
}

function pickDominantShift(shifts: Partial<TraitScores> | undefined): TraitShiftSummary | null {
  if (!shifts) return null;
  let bestTrait: PlayerTrait | null = null;
  let bestValue = 0;
  for (const [trait, value] of Object.entries(shifts) as [PlayerTrait, number][]) {
    if (typeof value !== 'number') continue;
    if (value > bestValue) {
      bestValue = value;
      bestTrait = trait;
    }
  }
  if (!bestTrait || bestValue < 1) return null;
  return { trait: bestTrait, delta: bestValue };
}

export function applyNarrativeEnrichment(
  current: ConsequenceRender,
  output: NarrativePromptOutput
): ConsequenceRender {
  const text = output.consequence?.trim() ? output.consequence : current.text;
  return {
    ...current,
    text,
    innerVoice: output.innerVoice ?? current.innerVoice,
    newspaperHeadline: output.newspaperHeadline ?? current.newspaperHeadline,
    memoryLine: output.memoryLine ?? current.memoryLine,
    enriched: true
  };
}

export function applyNarrativeFallback(
  current: ConsequenceRender,
  state: RebirthGameState,
  scenario: Scenario,
  choice: Choice
): ConsequenceRender {
  const fallback = composeNarrativeFallback(state, scenario, choice);
  return {
    ...current,
    innerVoice: fallback.innerVoice ?? current.innerVoice,
    newspaperHeadline: fallback.newspaperHeadline ?? current.newspaperHeadline,
    memoryLine: fallback.memoryLine ?? current.memoryLine,
    enriched: false
  };
}

/* ============================================================
   P1-10 (ORDA-009/010, AAR bêta-30 §V — Fåhraeus #09, Romero #05)
   ============================================================
   Mémoire des acteurs : callbacks programmés à un tour futur.

   Pattern usage :
     // Au moment d'un choix qui marque (ex: corruption préfet 1936) :
     scheduleActorCallback(state.memory, currentTurn + 4, 'adversaire',
       "Pinot n'a pas oublié — il fait passer le mot dans la presse.",
       'corrompre-prefet', currentTurn);

     // Dans le turn-resolver, à chaque début de tour :
     const due = dueActorCallbacks(state.memory, state.turn);
     // ...déclencher les narratives, afficher dans le ticker causal
     consumeActorCallbacks(state.memory, due);

   Le branchement effectif depuis les scénarios (programmation
   automatique via `traitShift` ou `flag` du choix) est en backlog
   ORDA-010. Cette infrastructure est l'API minimale requise pour
   que les Diplomates ajoutent les hooks dans le contenu narratif.
   ============================================================ */

/** Programme un callback d'acteur pour un tour futur (typiquement
 *  posedAtTurn + 3..5). Aucune limite de file ; le moteur déclenche
 *  quand atTurn ≤ currentTurn. */
export function scheduleActorCallback(
  memory: Memory,
  atTurn: number,
  actor: ActorId,
  narrative: string,
  fromChoiceId: string,
  posedAtTurn: number
): void {
  if (!memory.scheduledActorCallbacks) memory.scheduledActorCallbacks = [];
  memory.scheduledActorCallbacks.push({
    atTurn, actor, narrative, fromChoiceId, posedAtTurn
  });
}

/** Retourne les callbacks dus au tour courant (atTurn ≤ currentTurn). */
export function dueActorCallbacks(
  memory: Memory,
  currentTurn: number
): ScheduledActorCallback[] {
  const all = memory.scheduledActorCallbacks ?? [];
  return all.filter(cb => cb.atTurn <= currentTurn);
}

/** Consomme les callbacks dus (les retire de la file). À appeler
 *  après affichage / déclenchement par le moteur de tour. */
export function consumeActorCallbacks(
  memory: Memory,
  consumed: ScheduledActorCallback[]
): void {
  if (!memory.scheduledActorCallbacks || consumed.length === 0) return;
  const consumedSet = new Set(consumed.map(cb => `${cb.fromChoiceId}@${cb.atTurn}`));
  memory.scheduledActorCallbacks = memory.scheduledActorCallbacks.filter(
    cb => !consumedSet.has(`${cb.fromChoiceId}@${cb.atTurn}`)
  );
}
