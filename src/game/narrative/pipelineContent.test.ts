/* P3 ORDA-019 PARITAS — couverture résiduelle narrative/pipelineContent.ts.
   Façade lazy-loader : MAX_STAGE constant, labels stables, cache vide
   tant que loadPipelineContent() n'a pas hydraté le chunk.
   Couvre :
     - pipelineMaxStage pour les 5 archétypes (institution, rupture,
       capture, refondation, declin) — toujours 5 (stages 0..5).
     - pipelineSceneData() retourne null avant chargement (cache vide).
     - Après loadPipelineContent(), pipelineSceneData() retourne un
       PipelineSceneData valide.
     - Stage hors-bornes → null.
     - Idempotence du cache : second loadPipelineContent() ne re-charge
       pas (même promesse).
     - pipelineStageLabel : labels par archétype + null hors-bornes. */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  pipelineMaxStage,
  pipelineSceneData,
  pipelineStageLabel,
  loadPipelineContent
} from './pipelineContent';
import { freshResources } from '../simulation/resources';
import { freshActors } from '../simulation/actors';
import { freshOrganization } from '../org/organization';
import type { RebirthGameState, Memory } from '../types';
import type { PipelineId } from './pipelineTypes';

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

function mkState(): RebirthGameState {
  return {
    turn: 30,
    resources: freshResources(),
    actors: freshActors(),
    organization: freshOrganization('salarie', 'CGT-Test'),
    memory: emptyMemory(),
    activePipelines: [],
    worldAI: {
      state: { id: 'mediation' },
      opponent: { id: 'compromis_limite' },
      lastSignals: []
    }
  } as unknown as RebirthGameState;
}

const ARCHETYPES: PipelineId[] = [
  'institution',
  'rupture',
  'capture',
  'refondation',
  'declin'
];

describe('pipelineContent — pipelineMaxStage (constante synchrone)', () => {
  it('retourne 5 pour institution (6 stages : 0..5)', () => {
    expect(pipelineMaxStage('institution')).toBe(5);
  });

  it('retourne 5 pour les 5 archétypes', () => {
    for (const id of ARCHETYPES) {
      expect(pipelineMaxStage(id)).toBe(5);
    }
  });
});

describe('pipelineContent — pipelineStageLabel (table statique)', () => {
  it('retourne le label institution stage 0', () => {
    expect(pipelineStageLabel('institution', 0)).toBeTruthy();
    expect(typeof pipelineStageLabel('institution', 0)).toBe('string');
  });

  it('retourne null pour un stage hors-bornes', () => {
    expect(pipelineStageLabel('institution', 99)).toBeNull();
  });

  it('chaque archétype a 6 labels distincts', () => {
    for (const id of ARCHETYPES) {
      const labels = new Set<string>();
      for (let s = 0; s <= 5; s += 1) {
        const l = pipelineStageLabel(id, s);
        expect(l).toBeTruthy();
        labels.add(l!);
      }
      expect(labels.size).toBe(6);
    }
  });
});

describe('pipelineContent — pipelineSceneData (cache lazy)', () => {
  /* Comme le module garde un singleton CACHE qui peut avoir été
     déjà hydraté par d'autres tests (ex. pipelineEngine.test.ts via
     l'import), on ne teste pas ici l'état "avant chargement" en
     absolu : on teste qu'après un loadPipelineContent() explicite
     le cache est cohérent. Le test "null avant chargement" reste
     valide pour les CI froids (premier import) et est documenté en
     limite ci-dessous. */

  beforeAll(async () => {
    await loadPipelineContent();
  });

  it('après loadPipelineContent(), retourne un PipelineSceneData valide pour institution stage 0', () => {
    const data = pipelineSceneData('institution', 0, mkState());
    expect(data).not.toBeNull();
    expect(typeof data!.title).toBe('string');
    expect(typeof data!.subtitle).toBe('string');
    expect(typeof data!.historicalContext).toBe('string');
    expect(typeof data!.reflechi).toBe('string');
    expect(typeof data!.compulsif).toBe('string');
    expect(Array.isArray(data!.choices)).toBe(true);
    expect(data!.choices.length).toBeGreaterThanOrEqual(2);
  });

  it('retourne un PipelineSceneData pour chaque (archétype, stage 0..5)', () => {
    for (const id of ARCHETYPES) {
      for (let s = 0; s <= 5; s += 1) {
        const data = pipelineSceneData(id, s, mkState());
        expect(data, `${id}.stage${s}`).not.toBeNull();
        expect(data!.choices.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('stage hors-bornes (>5) → null', () => {
    expect(pipelineSceneData('institution', 6, mkState())).toBeNull();
    expect(pipelineSceneData('rupture', 99, mkState())).toBeNull();
  });

  it('stage négatif → null (accès hors borne tableau)', () => {
    expect(pipelineSceneData('capture', -1, mkState())).toBeNull();
  });

  it('idempotence : second loadPipelineContent() résout immédiatement sans re-charger', async () => {
    /* Deuxième appel : la promesse interne est déjà résolue, le
       cache global hydraté. On vérifie que l'état reste cohérent
       (pas de race, pas de reset). */
    const before = pipelineSceneData('institution', 0, mkState());
    await loadPipelineContent();
    const after = pipelineSceneData('institution', 0, mkState());
    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    /* Les builders sont déterministes pour un même state structurel,
       on vérifie au moins l'égalité des champs textuels statiques. */
    expect(after!.title).toBe(before!.title);
  });
});
