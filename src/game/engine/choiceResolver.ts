/* Paritas Rebirth — choiceResolver.ts
 * Applique un Choice : effets numériques sur ressources et acteurs,
 * traitShift sur la personnalité, mémoire (flag, longterm, accord, institution).
 * Pure function : prend un state, renvoie un nouveau state.
 */

import type { Choice, RebirthGameState, Scenario } from '../types';
import { applyResourceDelta } from '../simulation/resources';
import { applyActorsDelta } from '../simulation/actors';
import {
  applyTraitShift,
  computeDominantTrait
} from '../narrative/personalityEngine';
import {
  consumeChoice,
  markPlayed,
  addAccord,
  addInstitution
} from '../narrative/memoryEngine';
import { applyOrganizationDelta } from '../org/organization';

export function resolveChoice(
  state: RebirthGameState,
  scenario: Scenario,
  choice: Choice
): RebirthGameState {
  // 1. Effets numériques
  const nextResources = choice.effects.resources
    ? applyResourceDelta(state.resources, choice.effects.resources)
    : state.resources;

  const nextActors = choice.effects.actors
    ? applyActorsDelta(state.actors, choice.effects.actors)
    : state.actors;

  // 2. Traits & dominance
  const nextTraits = choice.traitShift
    ? applyTraitShift(state.traits, choice.traitShift)
    : state.traits;
  const nextDominant = computeDominantTrait(nextTraits);

  // 3. Mémoire (flag, longterm, played, dérivés)
  let nextMemory = consumeChoice(state.memory, scenario.id, choice, state.turn);
  nextMemory = markPlayed(nextMemory, scenario.id);

  // Dérivations : flag conventionnels
  if (choice.flag === 'signe-matignon') nextMemory = addAccord(nextMemory, 'matignon-1936');
  if (choice.flag === 'signe-grenelle') nextMemory = addAccord(nextMemory, 'grenelle-1968');
  if (choice.flag === 'cree-secu') nextMemory = addInstitution(nextMemory, 'secu-1945');
  if (choice.flag === 'cree-unedic') nextMemory = addInstitution(nextMemory, 'unedic-1958');
  if (choice.flag === 'cree-mutuelle-1864') nextMemory = addInstitution(nextMemory, 'caisse-mutuelle-1864');
  if (choice.flag === 'cree-syndicat-1884') nextMemory = addInstitution(nextMemory, 'syndicat-1884');
  if (choice.flag === 'cree-conventions-1919') nextMemory = addInstitution(nextMemory, 'conventions-collectives-1919');
  if (choice.flag === 'cree-prudhommes') nextMemory = addInstitution(nextMemory, 'prudhommes');
  if (choice.flag === 'cree-chsct') nextMemory = addInstitution(nextMemory, 'chsct-1982');
  if (choice.flag === 'refuse-compromis') {
    nextMemory = { ...nextMemory, refusedCompromise: nextMemory.refusedCompromise + 1 };
  }
  if (choice.flag === 'trahit-base') {
    nextMemory = { ...nextMemory, betrayedBase: nextMemory.betrayedBase + 1 };
  }
  if (choice.flag === 'epuise-mouvement') {
    nextMemory = { ...nextMemory, exhaustedMovements: nextMemory.exhaustedMovements + 1 };
  }

  // 4. Fatigue militante : croît avec mouvements épuisés et grosses
  // poussées de rapport de force ; récupère sinon dans applyOrganizationUpkeep.
  let fatigueGain = 0;
  if (choice.flag === 'epuise-mouvement') fatigueGain += 25;
  const rapportDelta = choice.effects.resources?.rapportDeForce ?? 0;
  if (rapportDelta >= 6) fatigueGain += Math.min(15, Math.round(rapportDelta));
  const nextOrganization = fatigueGain > 0
    ? applyOrganizationDelta(state.organization, { mobilisationFatigue: fatigueGain })
    : state.organization;

  return {
    ...state,
    resources: nextResources,
    actors: nextActors,
    traits: nextTraits,
    dominantTrait: nextDominant,
    memory: nextMemory,
    organization: nextOrganization,
    lastChoice: { scenarioId: scenario.id, choiceId: choice.id }
  };
}
