/* Paritas Rebirth — choiceResolver.ts
 * Applique un Choice : effets numériques sur ressources et acteurs,
 * traitShift sur la personnalité, mémoire (flag, longterm, accord, institution).
 * Pure function : prend un state, renvoie un nouveau state.
 */

import type { Choice, Effects, RebirthGameState, Scenario } from '../types';
import { applyResourceDelta } from '../simulation/resources';
import { applyActorsDelta } from '../simulation/actors';
import { abilityFuelScore, fuelMultiplier } from '../simulation/resourceUtility';
import {
  applyTraitShift,
  clampStress,
  computeDominantTrait,
  computeStressDelta
} from '../narrative/personalityEngine';
import {
  consumeChoice,
  markPlayed,
  addAccord,
  addInstitution
} from '../narrative/memoryEngine';
import { scheduleActorCallback } from './consequenceEngine';
import { applyOrganizationDelta } from '../org/organization';

export function resolveChoice(
  state: RebirthGameState,
  scenario: Scenario,
  choice: Choice
): RebirthGameState {
  // 1. Effets numériques — modulés par l'énergie courante de l'ability
  // d'attache si elle est définie (préparer ses ressources en amont rend
  // les choix narratifs correspondants plus puissants ; les négliger
  // les affaiblit, dans une fourchette ±20%).
  const modulatedEffects = applyAbilityModulation(choice, state);

  const nextResources = modulatedEffects.resources
    ? applyResourceDelta(state.resources, modulatedEffects.resources)
    : state.resources;

  const nextActors = choice.effects.actors
    ? applyActorsDelta(state.actors, choice.effects.actors)
    : state.actors;

  // 2. Traits & dominance + stress de personnalité (CK3-like)
  const nextTraits = choice.traitShift
    ? applyTraitShift(state.traits, choice.traitShift)
    : state.traits;
  const nextDominant = computeDominantTrait(nextTraits);
  const stressDelta = computeStressDelta(choice.traitShift, state.dominantTrait);
  const nextStress = clampStress(state.personalityStress + stressDelta);

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

  /* P1-10-branch (ORDA-012, AAR bêta-30 §V — Fåhraeus #09, Romero #05) :
     Mémoire des acteurs — programmer des callbacks différés selon
     les flags pivots. Les acteurs réagissent N+3..N+5 tours plus tard,
     ce qui produit la sensation CK3-grade que « les choix laissent
     une trace ». Démarrage sur 3 flags emblématiques de Matignon 1936
     + 1 sur la trahison générique. À étendre par les Diplomates. */
  if (choice.flag === 'refuse-compromis') {
    /* L'adversaire ricane et fait passer le mot. Tour +4. */
    scheduleActorCallback(
      nextMemory, state.turn + 4, 'adversaire',
      "L'adversaire n'a pas oublié ton refus. Le mot court chez les patrons : « Le syndicat ne signe rien. On peut continuer. »",
      choice.id, state.turn
    );
  }
  if (choice.flag === 'jouer-cgt-cgtu') {
    /* La base est divisée. Tour +5. Romero-grade. */
    scheduleActorCallback(
      nextMemory, state.turn + 5, 'base',
      'Une lettre de la base te parvient. Trois lignes. Elle sait que tu as joué la division. Elle ne te le redira pas.',
      choice.id, state.turn
    );
  }
  if (choice.flag === 'trahit-base') {
    /* La base perd confiance — opinion publique aussi. Tour +3. */
    scheduleActorCallback(
      nextMemory, state.turn + 3, 'opinion',
      "Une dépêche AFP nomme ta trahison. La presse syndicale relaie. L'opinion bascule, lentement.",
      choice.id, state.turn
    );
  }
  if (choice.flag === 'signe-matignon') {
    /* Reconnaissance différée — Frachon écrit. Tour +5. */
    scheduleActorCallback(
      nextMemory, state.turn + 5, 'base',
      'Frachon t\'écrit, deux lignes : « Le 7 juin restera. Tu as bien fait. » Tu plies la lettre soigneusement.',
      choice.id, state.turn
    );
  }

  /* ORDA-013 (extension Diplomates) : 5 callbacks supplémentaires
     sur les flags pivots des époques ultérieures. Même logique
     N+3..N+5 que le bloc Matignon ci-dessus. */
  if (choice.flag === 'signe-grenelle') {
    /* Mai 1968 — la base trouve les chiffres « pâles » face à l'espérance révolutionnaire. Tour +4. */
    scheduleActorCallback(
      nextMemory, state.turn + 4, 'base',
      "Aux portes de Renault-Billancourt, on lit les accords à voix haute. La base te répond : « 35% du SMIG, c'est bien. Mais ce n'est pas la révolution. »",
      choice.id, state.turn
    );
  }
  if (choice.flag === 'fonde-fo') {
    /* Scission 1947 — la CGT garde rancune, l'État reconnaît. Tour +5. */
    scheduleActorCallback(
      nextMemory, state.turn + 5, 'adversaire',
      "Une note interne CGT circule : « Jouhaux a fondé sa boutique avec l'argent américain. » L'attaque s'installe pour quarante ans.",
      choice.id, state.turn
    );
  }
  if (choice.flag === 'fait-victoire-historique') {
    /* Juppé 1995 — l'opinion retient le triomphe, l'État panse les plaies. Tour +5. */
    scheduleActorCallback(
      nextMemory, state.turn + 5, 'opinion',
      "Les sondages bougent tard. Six mois après, l'opinion te reconnaît la victoire. La rue, elle, n'a pas oublié les trois semaines de gel.",
      choice.id, state.turn
    );
  }
  if (choice.flag === 'refondation-paritaire') {
    /* Ordonnances 2017 / CSE / Florange — l'État valide la nouvelle grammaire. Tour +4. */
    scheduleActorCallback(
      nextMemory, state.turn + 4, 'etat',
      "Une circulaire DGT cite ton accord en exemple. Les préfets reçoivent consigne : « ce dialogue social-là, on l'accompagne, on ne le bloque pas. »",
      choice.id, state.turn
    );
  }
  if (choice.flag === 'epuise-mouvement') {
    /* Sur-usage de la mobilisation — la base se retire silencieusement. Tour +3. */
    scheduleActorCallback(
      nextMemory, state.turn + 3, 'base',
      "Les permanences se vident. Trois militants démissionnent sans bruit. Personne ne te le dit, mais tu sens le silence aux assemblées.",
      choice.id, state.turn
    );
  }

  /* ORDA-014 (extension Diplomates, vague 2) : 4 callbacks
     supplémentaires sur les flags institutionnels et patronaux. */
  if (choice.flag === 'cree-secu') {
    /* 1945 — Croizat fonde la Sécu. L'État institutionnalise. Tour +5. */
    scheduleActorCallback(
      nextMemory, state.turn + 5, 'etat',
      "Le ministère du Travail t'envoie copie d'une circulaire : « La gestion paritaire des caisses est désormais le canal officiel. » Tu lis deux fois — c'est inattendu venant d'eux.",
      choice.id, state.turn
    );
  }
  if (choice.flag === 'cree-chsct') {
    /* 1982 lois Auroux — la base découvre un nouveau levier juridique. Tour +4. */
    scheduleActorCallback(
      nextMemory, state.turn + 4, 'base',
      "Trois CHSCT déposent leur premier droit d'alerte la même semaine. Les militants se passent les comptes-rendus comme des relais — il y a quelque chose à apprendre.",
      choice.id, state.turn
    );
  }
  if (choice.flag === 'cgpf-cogestion') {
    /* CGPF années 30 — l'adversaire patronal serre les rangs. Tour +4. */
    scheduleActorCallback(
      nextMemory, state.turn + 4, 'adversaire',
      "Une réunion CGPF restreinte refuse ton ouverture. Le compte-rendu fuite : « Pas de cogestion. On garde la main, ou on perd tout. »",
      choice.id, state.turn
    );
  }
  if (choice.flag === 'mediation-elysee') {
    /* Médiation présidentielle — l'État reconnaît, l'opinion observe. Tour +3. */
    scheduleActorCallback(
      nextMemory, state.turn + 3, 'opinion',
      "Le palais publie un communiqué sobre : « Les partenaires sociaux ont fait preuve de responsabilité. » L'opinion enregistre — c'est rare, ça compte.",
      choice.id, state.turn
    );
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
    personalityStress: nextStress,
    memory: nextMemory,
    organization: nextOrganization,
    lastChoice: { scenarioId: scenario.id, choiceId: choice.id }
  };
}

/* Applique le multiplicateur d'énergie aux deltas de ressources d'un
   choix dont l'ability est définie. Effets sur acteurs/flags non
   touchés (rester narratif). Borné ±20% via fuelMultiplier. */
function applyAbilityModulation(choice: Choice, state: RebirthGameState): Effects {
  if (!choice.ability) return choice.effects;
  if (!choice.effects.resources) return choice.effects;
  const score = abilityFuelScore(choice.ability, state.resources);
  const mul = fuelMultiplier(score);
  if (mul === 1) return choice.effects;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(choice.effects.resources)) {
    out[k] = typeof v === 'number' ? Math.round(v * mul) : (v as number);
  }
  return { ...choice.effects, resources: out as Effects['resources'] };
}
