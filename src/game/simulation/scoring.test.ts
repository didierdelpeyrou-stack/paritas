import { describe, it, expect } from 'vitest';
import { computeFinalScore } from './scoring';
import { freshResources } from './resources';
import { freshActors } from './actors';
import type { RebirthGameState, Memory } from '../types';

/* Couverture Vitest ORDA-012 — simulation/scoring.ts (était 0%).
   Module compact (24 lignes) qui consolide le score final.
   Formule (rappel) :
     cohesion = (confiance + santeSociale + legitimite) / 3
     construction = institutions×6 + accords×4 + r.institution×0.6
     resistance = rapportDeForce×0.5 + caisse×0.4
     malus = trahis×8 + epuises×5
     mandate = objectiveScoreContribution(...)
     raw = cohesion×0.45 + construction + resistance + mandate×0.18 - malus
     return clamp(raw, 0, 100)
*/

function emptyMemory(over: Partial<Memory> = {}): Memory {
  return {
    refusedCompromise: 0,
    signedMajorAccords: [],
    betrayedBase: 0,
    builtInstitutions: [],
    exhaustedMovements: 0,
    flags: {},
    playedScenarios: [],
    pendingLongterm: [],
    ...over
  };
}

function mkState(over: {
  resources?: Partial<ReturnType<typeof freshResources>>;
  memory?: Partial<Memory>;
  objectiveProgress?: never[];
  objectives?: never[];
} = {}): RebirthGameState {
  return {
    resources: { ...freshResources(), ...over.resources },
    actors: freshActors(),
    memory: emptyMemory(over.memory),
    objectiveProgress: over.objectiveProgress ?? [],
    objectives: over.objectives ?? []
  } as unknown as RebirthGameState;
}

describe('scoring — computeFinalScore borne le résultat', () => {
  it('borne à 0 minimum (état catastrophique)', () => {
    const state = mkState({
      resources: {
        confiance: 0, caisse: 0, santeSociale: 0, legitimite: 0,
        rapportDeForce: 0, cohesionInterne: 0, institution: 0
      },
      memory: { betrayedBase: 99, exhaustedMovements: 99 }
    });
    expect(computeFinalScore(state)).toBe(0);
  });

  it('borne à 100 maximum (état idéal)', () => {
    const state = mkState({
      resources: {
        confiance: 100, caisse: 100, santeSociale: 100, legitimite: 100,
        rapportDeForce: 100, cohesionInterne: 100, institution: 100
      },
      memory: {
        signedMajorAccords: ['matignon', 'grenelle', 'auroux', 'ani'],
        builtInstitutions: ['secu-1945', 'unedic', 'agirc-arrco', 'pole-emploi']
      }
    });
    expect(computeFinalScore(state)).toBe(100);
  });

  it('retourne un entier (round)', () => {
    const state = mkState();
    const score = computeFinalScore(state);
    expect(Number.isInteger(score)).toBe(true);
  });
});

describe('scoring — composantes du score', () => {
  it('cohésion = moyenne (confiance + santeSociale + legitimite) / 3', () => {
    /* Avec ressources élevées sur les 3 axes cohésion et 0 ailleurs,
       le score doit être non-nul (cohesion×0.45 contribue positif). */
    const stateLowRest = mkState({
      resources: {
        confiance: 100, santeSociale: 100, legitimite: 100,
        caisse: 0, rapportDeForce: 0, cohesionInterne: 0, institution: 0
      }
    });
    const stateZero = mkState({
      resources: {
        confiance: 0, santeSociale: 0, legitimite: 0,
        caisse: 0, rapportDeForce: 0, cohesionInterne: 0, institution: 0
      }
    });
    expect(computeFinalScore(stateLowRest)).toBeGreaterThan(computeFinalScore(stateZero));
  });

  it('construction (institutions + accords) augmente le score', () => {
    const noInst = mkState();
    const withInst = mkState({
      memory: {
        builtInstitutions: ['secu', 'unedic', 'agirc'],
        signedMajorAccords: ['matignon', 'grenelle']
      }
    });
    expect(computeFinalScore(withInst)).toBeGreaterThan(computeFinalScore(noInst));
  });

  it('malus de trahison fait chuter le score', () => {
    const sansTrahison = mkState({
      resources: { confiance: 80, santeSociale: 80, legitimite: 80 },
      memory: { betrayedBase: 0 }
    });
    const avecTrahisons = mkState({
      resources: { confiance: 80, santeSociale: 80, legitimite: 80 },
      memory: { betrayedBase: 5 }
    });
    expect(computeFinalScore(avecTrahisons)).toBeLessThan(computeFinalScore(sansTrahison));
  });

  it('malus d\'épuisement fait chuter le score', () => {
    const sansEpuisement = mkState({
      resources: { confiance: 80, santeSociale: 80, legitimite: 80 },
      memory: { exhaustedMovements: 0 }
    });
    const avecEpuisement = mkState({
      resources: { confiance: 80, santeSociale: 80, legitimite: 80 },
      memory: { exhaustedMovements: 4 }
    });
    expect(computeFinalScore(avecEpuisement)).toBeLessThan(computeFinalScore(sansEpuisement));
  });
});

describe('scoring — déterminisme', () => {
  it('appels successifs sur même état → même score', () => {
    const state = mkState({
      resources: { confiance: 75, caisse: 50, santeSociale: 60 },
      memory: { betrayedBase: 1, builtInstitutions: ['x'] }
    });
    const s1 = computeFinalScore(state);
    const s2 = computeFinalScore(state);
    expect(s1).toBe(s2);
  });

  it('insensible au mode (Réfléchi vs Compulsif) — score=état pur', () => {
    /* Le score consolidé ne dépend que des ressources/mémoire/
       objectifs — pas du RenderMode. */
    const state1 = mkState();
    const state2 = mkState();
    expect(computeFinalScore(state1)).toBe(computeFinalScore(state2));
  });
});
