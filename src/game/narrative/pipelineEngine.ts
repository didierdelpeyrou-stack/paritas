import type { RebirthGameState, Scenario } from '../types';
import type { ActivePipeline, PipelineId } from './pipelineTypes';
import { pipelineMaxStage, pipelineSceneData } from './pipelineContent';

const LABELS: Record<PipelineId, string> = {
  institution: 'Institution',
  rupture: 'Rupture',
  capture: 'Capture',
  refondation: 'Refondation',
  declin: 'Déclin'
};

export function syncPipelines(state: RebirthGameState): RebirthGameState {
  const next = [...state.activePipelines];
  for (const id of detectPipelineIds(state)) {
    const existing = next.find(pipeline => pipeline.id === id);
    if (existing) {
      if (existing.stage > pipelineMaxStage(id)) continue;
      existing.pressure = Math.min(100, existing.pressure + pressureGain(state, id));
      continue;
    }
    next.push({
      id,
      label: LABELS[id],
      stage: 0,
      pressure: 35 + pressureGain(state, id),
      lastTurn: state.turn
    });
  }
  return { ...state, activePipelines: next };
}

export function buildPipelineScenario(state: RebirthGameState): Scenario | null {
  const candidates = state.activePipelines
    .filter(pipeline => pipeline.stage <= pipelineMaxStage(pipeline.id))
    .filter(pipeline => pipeline.pressure >= 45)
    .filter(pipeline => state.turn - pipeline.lastTurn >= 3)
    .filter(pipeline => !state.memory.playedScenarios.includes(scenarioId(pipeline)))
    .sort((a, b) => b.pressure - a.pressure);

  for (const pipeline of candidates) {
    const scenario = scenarioForPipeline(state, pipeline);
    if (scenario) return scenario;
  }

  return buildLongtermScenario(state);
}

export function advancePipelineAfterScenario(state: RebirthGameState, scenario: Scenario): RebirthGameState {
  if (!scenario.id.startsWith('pipeline-')) return state;
  if (scenario.id.startsWith('pipeline-longterm-')) return state;
  const [, id] = scenario.id.split('-') as ['pipeline', PipelineId, string, string];
  return {
    ...state,
    activePipelines: state.activePipelines.map(pipeline =>
      pipeline.id === id
        ? {
            ...pipeline,
            stage: pipeline.stage + 1,
            pressure: Math.max(10, pipeline.pressure - 35),
            lastTurn: state.turn
          }
        : pipeline
    )
  };
}

function detectPipelineIds(state: RebirthGameState): PipelineId[] {
  const ids: PipelineId[] = [];
  if (state.memory.builtInstitutions.length >= 2 || state.resources.institution >= 64) ids.push('institution');
  if (state.memory.exhaustedMovements > 0 || (state.resources.rapportDeForce >= 68 && state.resources.santeSociale <= 45)) ids.push('rupture');
  if (state.memory.betrayedBase > 0 || state.worldAI.state.id === 'cooptation') ids.push('capture');
  if (state.memory.refusedCompromise >= 2 && state.organization.reputation >= 48) ids.push('refondation');
  if (state.organization.treasury <= 14 || state.organization.cohesion <= 30 || state.resources.caisse <= 20) ids.push('declin');
  return ids;
}

function pressureGain(state: RebirthGameState, id: PipelineId): number {
  switch (id) {
    case 'institution':
      return Math.round(state.resources.institution / 18 + state.organization.legalTeam);
    case 'rupture':
      return Math.round(state.resources.rapportDeForce / 16 + (100 - state.resources.santeSociale) / 22);
    case 'capture':
      return Math.round((100 - state.resources.confiance) / 18 + state.actors.etat.trust / 28);
    case 'refondation':
      return Math.round(state.organization.reputation / 20 + state.memory.refusedCompromise * 2);
    case 'declin':
      return Math.round((100 - state.organization.cohesion) / 18 + (30 - Math.min(30, state.organization.treasury)) / 5);
  }
}

function scenarioId(pipeline: ActivePipeline): string {
  return `pipeline-${pipeline.id}-stage-${pipeline.stage}`;
}

function scenarioForPipeline(state: RebirthGameState, pipeline: ActivePipeline): Scenario | null {
  const data = pipelineSceneData(pipeline.id, pipeline.stage, state);
  if (!data) return null;
  return {
    id: scenarioId(pipeline),
    turn: state.turn,
    date: `Tour ${state.turn}`,
    era: state.era,
    title: data.title,
    subtitle: data.subtitle,
    mood: data.mood,
    premium: false,
    historicalContext: data.historicalContext,
    setup: {
      reflechi: data.reflechi,
      compulsif: data.compulsif
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: data.voices,
    choices: data.choices
  };
}

function buildLongtermScenario(state: RebirthGameState): Scenario | null {
  const pending = state.memory.pendingLongterm.find(item => state.turn - item.turnPosed >= 6);
  if (!pending) return null;
  const id = `pipeline-longterm-${pending.fromScenario}-${pending.turnPosed}`;
  if (state.memory.playedScenarios.includes(id)) return null;
  return {
    id,
    turn: state.turn,
    date: `Tour ${state.turn}`,
    era: state.era,
    title: 'Une conséquence revient',
    subtitle: 'Mémoire longue',
    mood: 'melancolique',
    premium: false,
    historicalContext: 'Certaines décisions ne produisent leur vrai sens qu’à distance.',
    setup: {
      reflechi: pending.text,
      compulsif: `Tu croyais cette décision derrière toi. Elle revient par une phrase, un visage, un dossier rouvert.\n\n${pending.text}`
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    choices: [
      {
        id: 'longterm-assumer',
        text: 'Assumer publiquement cette conséquence.',
        intent: 'Transformer la mémoire en mandat.',
        theoryHint: 'Pipeline narratif : cette scène existe parce que tes décisions précédentes ont laissé une trace.',
        effects: { resources: { legitimite: 4, confiance: 3 } },
        consequence: { immediate: 'Tu assumes. Tout le monde n’approuve pas, mais le fil redevient visible.' },
        traitShift: { batisseur: 1, pragmatique: 1 }
      },
      {
        id: 'longterm-enterrer',
        text: 'Enterrer le sujet dans la procédure.',
        intent: 'Éviter le coût immédiat.',
        theoryHint: 'Pipeline narratif : cette scène existe parce que tes décisions précédentes ont laissé une trace.',
        effects: { resources: { institution: 3, confiance: -4 } },
        consequence: { immediate: 'La procédure absorbe le choc. La base, elle, comprend très bien ce silence.' },
        traitShift: { batisseur: 1, pragmatique: 1 }
      },
      {
        id: 'longterm-reparer',
        text: 'Ouvrir une réparation ciblée.',
        intent: 'Payer pour refermer proprement.',
        theoryHint: 'Pipeline narratif : cette scène existe parce que tes décisions précédentes ont laissé une trace.',
        effects: { resources: { confiance: 5, caisse: -4, santeSociale: 3 } },
        consequence: { immediate: 'La réparation ne supprime pas l’erreur. Elle dit que l’organisation l’a vue.' },
        traitShift: { batisseur: 1, pragmatique: 1 }
      }
    ]
  };
}
