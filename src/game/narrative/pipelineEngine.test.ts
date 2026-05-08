import { describe, it, expect } from 'vitest';
import {
  syncPipelines,
  buildPipelineScenario,
  advancePipelineAfterScenario
} from './pipelineEngine';
import { freshResources } from '../simulation/resources';
import { freshActors } from '../simulation/actors';
import { freshOrganization } from '../org/organization';
import type { RebirthGameState, Memory, Scenario } from '../types';
import type { ActivePipeline, PipelineId } from './pipelineTypes';

/* Couverture Vitest P0 ORDA-016 PARITAS — narrative/pipelineEngine.ts (était 0%).
   Module pivot des arcs narratifs longs (~170 LoC, 3 exports + détecteur privé).
   Cible : déclencher les bons archétypes (institution / rupture / capture /
   refondation / declin) selon l'état, sélectionner un scénario quand la
   pression atteint le seuil, faire avancer l'arc après lecture. */

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
  turn?: number;
  resources?: Partial<ReturnType<typeof freshResources>>;
  memory?: Partial<Memory>;
  activePipelines?: ActivePipeline[];
  worldAIStateId?: string;
  organization?: Partial<ReturnType<typeof freshOrganization>>;
  actorEtatTrust?: number;
} = {}): RebirthGameState {
  const baseOrg = freshOrganization('salarie', 'X');
  return {
    turn: over.turn ?? 1,
    resources: { ...freshResources(), ...over.resources },
    actors: {
      ...freshActors(),
      etat: {
        ...freshActors().etat,
        trust: over.actorEtatTrust ?? freshActors().etat.trust
      }
    },
    organization: { ...baseOrg, ...over.organization },
    memory: emptyMemory(over.memory),
    activePipelines: over.activePipelines ?? [],
    worldAI: {
      state: { id: over.worldAIStateId ?? 'mediation' },
      opponent: { id: 'compromis_limite' },
      lastSignals: []
    }
  } as unknown as RebirthGameState;
}

describe('pipelineEngine — syncPipelines (détection archétypes)', () => {
  it('crée le pipeline INSTITUTION si ≥ 2 institutions construites', () => {
    const state = mkState({
      memory: { builtInstitutions: ['secu-1945', 'unedic-1958'] }
    });
    const next = syncPipelines(state);
    const inst = next.activePipelines.find(p => p.id === 'institution');
    expect(inst).toBeDefined();
    expect(inst!.stage).toBe(0);
    expect(inst!.label).toBe('Institution');
    expect(inst!.lastTurn).toBe(state.turn);
  });

  it('crée le pipeline RUPTURE si exhaustedMovements > 0', () => {
    const state = mkState({ memory: { exhaustedMovements: 1 } });
    const next = syncPipelines(state);
    expect(next.activePipelines.find(p => p.id === 'rupture')).toBeDefined();
  });

  it('crée le pipeline CAPTURE si betrayedBase > 0', () => {
    const state = mkState({ memory: { betrayedBase: 1 } });
    const next = syncPipelines(state);
    expect(next.activePipelines.find(p => p.id === 'capture')).toBeDefined();
  });

  it('crée le pipeline CAPTURE si worldAI.state.id === cooptation', () => {
    const state = mkState({ worldAIStateId: 'cooptation' });
    const next = syncPipelines(state);
    expect(next.activePipelines.find(p => p.id === 'capture')).toBeDefined();
  });

  it('crée le pipeline REFONDATION si refusedCompromise ≥ 2 ET reputation ≥ 48', () => {
    const state = mkState({
      memory: { refusedCompromise: 2 },
      organization: { reputation: 50 }
    });
    const next = syncPipelines(state);
    expect(next.activePipelines.find(p => p.id === 'refondation')).toBeDefined();
  });

  it('crée le pipeline DECLIN si treasury ≤ 14', () => {
    const state = mkState({
      organization: { treasury: 10 }
    });
    const next = syncPipelines(state);
    expect(next.activePipelines.find(p => p.id === 'declin')).toBeDefined();
  });

  it('met à jour la pressure d\'un pipeline existant (pas de duplication)', () => {
    const existing: ActivePipeline = {
      id: 'institution',
      label: 'Institution',
      stage: 1,
      pressure: 40,
      lastTurn: 0
    };
    const state = mkState({
      activePipelines: [existing],
      memory: { builtInstitutions: ['a', 'b'] },
      resources: { institution: 36 }
    });
    const next = syncPipelines(state);
    const insts = next.activePipelines.filter(p => p.id === 'institution');
    expect(insts.length).toBe(1);
    expect(insts[0].pressure).toBeGreaterThan(40);
    expect(insts[0].pressure).toBeLessThanOrEqual(100);
  });

  it('ne fait rien sur un pipeline existant dont stage > maxStage', () => {
    const existing: ActivePipeline = {
      id: 'institution',
      label: 'Institution',
      stage: 99,
      pressure: 50,
      lastTurn: 0
    };
    const state = mkState({
      activePipelines: [existing],
      memory: { builtInstitutions: ['a', 'b'] }
    });
    const next = syncPipelines(state);
    const inst = next.activePipelines.find(p => p.id === 'institution')!;
    expect(inst.pressure).toBe(50);
    expect(inst.stage).toBe(99);
  });

  it('idempotent — sans déclencheur, retourne un state aux mêmes pipelines', () => {
    const state = mkState();
    const next = syncPipelines(state);
    expect(next.activePipelines).toHaveLength(0);
  });
});

describe('pipelineEngine — buildPipelineScenario', () => {
  it('retourne null si aucun pipeline n\'a la pression ≥ 45', () => {
    const state = mkState({
      activePipelines: [
        { id: 'institution', label: 'I', stage: 0, pressure: 40, lastTurn: -10 }
      ],
      turn: 5
    });
    expect(buildPipelineScenario(state)).toBeNull();
  });

  it('retourne null si turn - lastTurn < 3', () => {
    const state = mkState({
      activePipelines: [
        { id: 'institution', label: 'I', stage: 0, pressure: 80, lastTurn: 4 }
      ],
      turn: 5
    });
    expect(buildPipelineScenario(state)).toBeNull();
  });

  it('retourne null si le scénario du pipeline a déjà été joué', () => {
    const state = mkState({
      activePipelines: [
        { id: 'institution', label: 'I', stage: 0, pressure: 80, lastTurn: -5 }
      ],
      turn: 5,
      memory: { playedScenarios: ['pipeline-institution-stage-0'] }
    });
    /* Pas de scénario candidat → fallback longterm. Pas de pendingLongterm
       non plus → null. */
    expect(buildPipelineScenario(state)).toBeNull();
  });

  it('fallback longterm : retourne un scénario si pendingLongterm est mûr (≥ 6 tours)', () => {
    const state = mkState({
      turn: 10,
      memory: {
        pendingLongterm: [
          { fromScenario: 'sc-x', text: 'Une promesse oubliée.', turnPosed: 3 }
        ]
      }
    });
    const scenario = buildPipelineScenario(state);
    expect(scenario).not.toBeNull();
    expect(scenario!.id).toMatch(/^pipeline-longterm-/);
    expect(scenario!.choices.length).toBeGreaterThanOrEqual(3);
  });

  it('ignore un pendingLongterm trop frais (< 6 tours posés)', () => {
    const state = mkState({
      turn: 6,
      memory: {
        pendingLongterm: [
          { fromScenario: 'sc-x', text: 'Trop tôt.', turnPosed: 4 }
        ]
      }
    });
    expect(buildPipelineScenario(state)).toBeNull();
  });

  it('le contenu pipeline n\'étant pas chargé synchronement, fallback longterm s\'active', () => {
    /* pipelineSceneData() retourne null tant que le chunk
       pipelineContentData n'est pas hydraté. buildPipelineScenario doit
       alors tomber sur buildLongtermScenario. */
    const state = mkState({
      activePipelines: [
        { id: 'institution', label: 'I', stage: 0, pressure: 80, lastTurn: -5 }
      ],
      turn: 5,
      memory: {
        pendingLongterm: [
          { fromScenario: 'sc-y', text: 'Long.', turnPosed: -2 }
        ]
      }
    });
    const scenario = buildPipelineScenario(state);
    expect(scenario).not.toBeNull();
    expect(scenario!.id).toMatch(/^pipeline-longterm-/);
  });
});

describe('pipelineEngine — advancePipelineAfterScenario', () => {
  function fakeScenario(id: string): Scenario {
    return { id } as unknown as Scenario;
  }

  it('ignore les scénarios non-pipeline', () => {
    const state = mkState({
      activePipelines: [
        { id: 'institution', label: 'I', stage: 0, pressure: 60, lastTurn: 0 }
      ]
    });
    const next = advancePipelineAfterScenario(state, fakeScenario('matignon-1936'));
    expect(next).toBe(state);
  });

  it('ignore les scénarios pipeline-longterm-*', () => {
    const state = mkState({
      activePipelines: [
        { id: 'institution', label: 'I', stage: 0, pressure: 60, lastTurn: 0 }
      ]
    });
    const next = advancePipelineAfterScenario(state, fakeScenario('pipeline-longterm-x-3'));
    expect(next).toBe(state);
  });

  it('incrémente stage, décrémente pressure (de 35) et met lastTurn pour le pipeline ciblé', () => {
    const state = mkState({
      turn: 7,
      activePipelines: [
        { id: 'institution', label: 'I', stage: 1, pressure: 80, lastTurn: 1 },
        { id: 'rupture', label: 'R', stage: 0, pressure: 50, lastTurn: 1 }
      ]
    });
    const next = advancePipelineAfterScenario(
      state,
      fakeScenario('pipeline-institution-stage-1')
    );
    const inst = next.activePipelines.find(p => p.id === 'institution')!;
    const rupt = next.activePipelines.find(p => p.id === 'rupture')!;
    expect(inst.stage).toBe(2);
    expect(inst.pressure).toBe(45);
    expect(inst.lastTurn).toBe(7);
    /* L'autre pipeline n'est pas touché. */
    expect(rupt.stage).toBe(0);
    expect(rupt.pressure).toBe(50);
    expect(rupt.lastTurn).toBe(1);
  });

  it('plancher à 10 quand pressure - 35 descendrait sous 10', () => {
    const state = mkState({
      turn: 4,
      activePipelines: [
        { id: 'declin', label: 'D', stage: 0, pressure: 30, lastTurn: 0 }
      ]
    });
    const next = advancePipelineAfterScenario(
      state,
      fakeScenario('pipeline-declin-stage-0')
    );
    const decl = next.activePipelines.find(p => p.id === 'declin')!;
    expect(decl.pressure).toBe(10);
    expect(decl.stage).toBe(1);
  });
});
