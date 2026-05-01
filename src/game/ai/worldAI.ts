import type { RebirthGameState } from '../types';
import { applyActorsDelta } from '../simulation/actors';
import { applyResourceDelta } from '../simulation/resources';
import { applyOrganizationDelta } from '../org/organization';
import { chooseOpponentStrategy } from './opponentStrategy';
import { chooseStateStrategy } from './stateStrategy';
import type { WorldAIState } from './types';

export interface WorldAITick {
  state: RebirthGameState;
  logs: string[];
}

export function freshWorldAI(): WorldAIState {
  return {
    state: {
      id: 'mediation',
      label: 'Médiation',
      intensity: 35,
      signal: 'L’État observe encore : il cherche une table avant de choisir une contrainte.'
    },
    opponent: {
      id: 'compromis_limite',
      label: 'Compromis limité',
      intensity: 34,
      signal: 'L’autre camp garde une porte entrouverte, sans renoncer à ses intérêts.'
    },
    lastSignals: []
  };
}

export function tickWorldAI(state: RebirthGameState): WorldAITick {
  const stateStrategy = chooseStateStrategy(state);
  const opponentStrategy = chooseOpponentStrategy(state);
  let next: RebirthGameState = {
    ...state,
    worldAI: {
      state: stateStrategy,
      opponent: opponentStrategy,
      lastSignals: [stateStrategy.signal, opponentStrategy.signal].slice(0, 4)
    }
  };

  next = applyStateStrategy(next);
  next = applyOpponentStrategy(next);

  return {
    state: next,
    logs: [
      `T${state.turn} — État : ${stateStrategy.label}. ${stateStrategy.signal}`,
      `T${state.turn} — Adversaire : ${opponentStrategy.label}. ${opponentStrategy.signal}`
    ]
  };
}

function pressure(intensity: number, base = 1): number {
  return Math.max(base, Math.round(intensity / 18));
}

function applyStateStrategy(state: RebirthGameState): RebirthGameState {
  const strategy = state.worldAI.state;
  const p = pressure(strategy.intensity);
  switch (strategy.id) {
    case 'mediation':
      return {
        ...state,
        resources: applyResourceDelta(state.resources, { institution: p, legitimite: 1 }),
        actors: applyActorsDelta(state.actors, { etat: { trust: p }, adversaire: { patience: p } })
      };
    case 'decret':
      return {
        ...state,
        resources: applyResourceDelta(state.resources, { institution: -p, rapportDeForce: -1, legitimite: -p }),
        actors: applyActorsDelta(state.actors, { etat: { pressure: p + 1 }, base: { pressure: p } })
      };
    case 'repression':
      return {
        ...state,
        resources: applyResourceDelta(state.resources, { santeSociale: -p - 1, rapportDeForce: p, legitimite: -p }),
        actors: applyActorsDelta(state.actors, { etat: { pressure: p + 2, trust: -p }, opinion: { trust: -1 } })
      };
    case 'cooptation':
      return {
        ...state,
        resources: applyResourceDelta(state.resources, { legitimite: p, confiance: -1 }),
        organization: applyOrganizationDelta(state.organization, { reputation: p, cohesion: -1 }),
        actors: applyActorsDelta(state.actors, { etat: { trust: p + 1 }, base: { trust: -1 } })
      };
    case 'cadrage_budgetaire':
      return {
        ...state,
        resources: applyResourceDelta(state.resources, { caisse: -p, institution: -1 }),
        actors: applyActorsDelta(state.actors, { etat: { pressure: p }, adversaire: { trust: p } })
      };
    case 'temporisation':
      return {
        ...state,
        resources: applyResourceDelta(state.resources, { santeSociale: -1, rapportDeForce: -1 }),
        actors: applyActorsDelta(state.actors, { base: { patience: -p }, opinion: { patience: -1 } })
      };
  }
}

function applyOpponentStrategy(state: RebirthGameState): RebirthGameState {
  const strategy = state.worldAI.opponent;
  const p = pressure(strategy.intensity);
  switch (strategy.id) {
    case 'compromis_limite':
      return {
        ...state,
        resources: applyResourceDelta(state.resources, { legitimite: 1, institution: 1 }),
        actors: applyActorsDelta(state.actors, { adversaire: { trust: p }, base: { patience: -1 } })
      };
    case 'division':
      return {
        ...state,
        resources: applyResourceDelta(state.resources, { confiance: -p, rapportDeForce: -1 }),
        organization: applyOrganizationDelta(state.organization, { cohesion: -p }),
        actors: applyActorsDelta(state.actors, { base: { pressure: p, trust: -p } })
      };
    case 'campagne_media':
      return {
        ...state,
        resources: applyResourceDelta(state.resources, { legitimite: -p, confiance: -1 }),
        actors: applyActorsDelta(state.actors, { opinion: { trust: -p }, adversaire: { pressure: p } })
      };
    case 'juridicisation':
      return {
        ...state,
        resources: applyResourceDelta(state.resources, { institution: -1, caisse: -p }),
        actors: applyActorsDelta(state.actors, { adversaire: { trust: -1 }, etat: { trust: p } })
      };
    case 'ligne_dure':
      return {
        ...state,
        resources: applyResourceDelta(state.resources, { rapportDeForce: p, santeSociale: -p }),
        actors: applyActorsDelta(state.actors, { adversaire: { pressure: p + 1, patience: -p } })
      };
    case 'deplacement_production':
      return {
        ...state,
        resources: applyResourceDelta(state.resources, { caisse: -p, rapportDeForce: -1, santeSociale: -1 }),
        actors: applyActorsDelta(state.actors, { adversaire: { pressure: p }, opinion: { trust: -1 } })
      };
  }
}
