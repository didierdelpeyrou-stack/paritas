/**
 * Pipeline content — façade léger. Le contenu narratif lourd
 * (≈ 60 KB de prose) est dans pipelineContentData.ts, importé
 * dynamiquement et caché ici. Tant que le chunk n'est pas arrivé,
 * pipelineSceneData() retourne null et le moteur tombe sur un
 * scénario de transition — pas de blocage côté joueur.
 */

import type { Choice, RebirthGameState, Scenario } from '../types';
import type { PipelineId } from './pipelineTypes';

export interface PipelineSceneData {
  title: string;
  subtitle: string;
  mood: Scenario['mood'];
  historicalContext: string;
  reflechi: string;
  compulsif: string;
  voices: Scenario['voices'];
  choices: Choice[];
}

export type StageBuilder = (state: RebirthGameState) => PipelineSceneData;

/** Toutes les pipelines ont 6 étapes (0..5). Constante stable plutôt
 *  que dérivée du contenu, pour permettre les checks synchrones avant
 *  que le chunk soit arrivé. */
const MAX_STAGE = 5;

const STAGE_LABELS: Record<PipelineId, string[]> = {
  institution: [
    'Gestion s’installe',
    'Réforme à écrire',
    'Mémoire institutionnelle',
    'Crise budgétaire',
    'L’État avance ses pions',
    'Héritage en débat'
  ],
  rupture: [
    'Mémoire de la rupture',
    'Mot d’ordre',
    'Répression ou concession',
    'Scission ou institutionnalisation',
    'Transmission générationnelle',
    'Mythe à défendre'
  ],
  capture: [
    'Siège confortable',
    'Murmure de la base',
    'Avant l’élection interne',
    'Au sortir des urnes',
    'L’État se recompose',
    'Récit de la capture'
  ],
  refondation: [
    'Refaire autrement',
    'Coalition mutualiste',
    'Doctrine en débat',
    'Passage à l’échelle',
    'Récupération guettée',
    'Doctrine devenue norme'
  ],
  declin: [
    'Comptes et fatigue',
    'Permanences fermées',
    'Disparition ou refondation',
    'Second souffle',
    'Recommencement',
    'Trace dans l’histoire'
  ]
};

let CACHE: Record<PipelineId, StageBuilder[]> | null = null;
let LOAD_PROMISE: Promise<Record<PipelineId, StageBuilder[]>> | null = null;

export async function loadPipelineContent(): Promise<void> {
  if (CACHE) return;
  if (!LOAD_PROMISE) {
    LOAD_PROMISE = import('./pipelineContentData').then(mod => {
      CACHE = mod.PIPELINE_STAGES;
      return CACHE;
    });
  }
  await LOAD_PROMISE;
}

export function pipelineStageLabel(id: PipelineId, stage: number): string | null {
  return STAGE_LABELS[id][stage] ?? null;
}

export function pipelineMaxStage(_id: PipelineId): number {
  return MAX_STAGE;
}

export function pipelineSceneData(
  id: PipelineId,
  stage: number,
  state: RebirthGameState
): PipelineSceneData | null {
  if (!CACHE) return null;
  const builder = CACHE[id]?.[stage];
  if (!builder) return null;
  return builder(state);
}
