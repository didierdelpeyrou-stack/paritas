import { applyActorsDelta } from '../simulation/actors';
import { applyResourceDelta, clamp } from '../simulation/resources';
import type { RebirthGameState } from '../types';
import { applyOrganizationDelta } from './organization';
import type { FactionId, InternalElectionState, PlayerOrganization } from './types';

export type ElectionCampaignMove = 'rassembler' | 'promettre_rupture' | 'professionnaliser' | 'terrain';

export interface ElectionTickResult {
  state: RebirthGameState;
  logs: string[];
}

export function shouldSuggestElection(state: RebirthGameState): boolean {
  const org = state.organization;
  if (org.election?.active) return false;
  if (state.turn < 18) return false;
  return org.cohesion < 42 || state.resources.confiance < 35 || state.memory.betrayedBase > 0 || state.turn % 12 === 0;
}

export function startInternalElection(state: RebirthGameState, issue?: string): RebirthGameState {
  if (state.organization.election?.active) return state;
  const election: InternalElectionState = {
    active: true,
    startedTurn: state.turn,
    roundsLeft: 3,
    playerMomentum: Math.round((state.organization.cohesion + state.resources.confiance) / 4),
    oppositionMomentum: Math.round((100 - state.organization.cohesion + state.actors.base.pressure) / 3),
    issue: issue ?? electionIssue(state)
  };
  return {
    ...state,
    organization: {
      ...state.organization,
      election,
      actionHistory: [`T${state.turn} — Élection interne ouverte`, ...state.organization.actionHistory].slice(0, 8)
    }
  };
}

export function campaignInternalElection(state: RebirthGameState, move: ElectionCampaignMove): RebirthGameState {
  const election = state.organization.election;
  if (!election?.active) return state;

  const config = moveConfig(move, state.organization.camp);
  const org = applyOrganizationDelta(state.organization, config.orgDelta);
  const factions = org.factions.map(faction =>
    config.faction === faction.id
      ? { ...faction, loyalty: clamp(faction.loyalty + config.loyalty), influence: clamp(faction.influence + config.influence) }
      : { ...faction, loyalty: clamp(faction.loyalty - 1) }
  );

  return {
    ...state,
    resources: config.resourceDelta ? applyResourceDelta(state.resources, config.resourceDelta) : state.resources,
    actors: config.actorDelta ? applyActorsDelta(state.actors, config.actorDelta) : state.actors,
    organization: {
      ...org,
      factions,
      election: {
        ...election,
        roundsLeft: Math.max(0, election.roundsLeft - 1),
        playerMomentum: clamp(election.playerMomentum + config.playerMomentum),
        oppositionMomentum: clamp(election.oppositionMomentum + config.oppositionMomentum)
      },
      actionHistory: [`T${state.turn} — Campagne : ${config.label}`, ...org.actionHistory].slice(0, 8)
    }
  };
}

export function tickInternalElection(state: RebirthGameState): ElectionTickResult {
  const election = state.organization.election;
  if (!election?.active) {
    if (!shouldSuggestElection(state)) return { state, logs: [] };
    return {
      state: startInternalElection(state),
      logs: [`T${state.turn} — Élection interne : la base exige un mandat clair.`]
    };
  }

  if (election.roundsLeft > 0) {
    const oppositionPressure = Math.max(1, Math.round((100 - state.organization.cohesion + state.actors.base.pressure) / 30));
    return {
      state: {
        ...state,
        organization: {
          ...state.organization,
          election: {
            ...election,
            oppositionMomentum: clamp(election.oppositionMomentum + oppositionPressure)
          }
        }
      },
      logs: [`T${state.turn} — Élection interne : l’opposition travaille les sections.`]
    };
  }

  return resolveInternalElection(state);
}

function resolveInternalElection(state: RebirthGameState): ElectionTickResult {
  const election = state.organization.election;
  if (!election) return { state, logs: [] };
  const factionSupport = state.organization.factions.reduce(
    (sum, faction) => sum + (faction.influence * faction.loyalty) / 100,
    0
  );
  const playerScore = election.playerMomentum + factionSupport + state.organization.reputation / 3;
  const oppositionScore = election.oppositionMomentum + (100 - state.organization.cohesion) / 2;
  const won = playerScore >= oppositionScore;
  const narrow = Math.abs(playerScore - oppositionScore) < 8;

  const nextOrg = applyOrganizationDelta(state.organization, won
    ? { cohesion: narrow ? 4 : 10, reputation: narrow ? 2 : 5, militants: narrow ? 1 : 4 }
    : { cohesion: narrow ? -8 : -16, reputation: -6, militants: narrow ? -3 : -8, membership: narrow ? -40 : -110 }
  );

  const nextState: RebirthGameState = {
    ...state,
    resources: applyResourceDelta(state.resources, won ? { confiance: narrow ? 3 : 8, institution: 2 } : { confiance: -10, rapportDeForce: -5 }),
    actors: applyActorsDelta(state.actors, won ? { base: { trust: narrow ? 4 : 10, patience: 6 } } : { base: { trust: -12, pressure: 10 } }),
    organization: {
      ...nextOrg,
      election: null,
      actionHistory: [
        `T${state.turn} — Élection ${won ? 'gagnée' : 'perdue'}${narrow ? ' de justesse' : ''}`,
        ...nextOrg.actionHistory
      ].slice(0, 8)
    }
  };

  return {
    state: nextState,
    logs: [
      won
        ? `T${state.turn} — Élection interne : mandat renouvelé${narrow ? ', mais fragile' : ''}.`
        : `T${state.turn} — Élection interne : la direction est contestée, une scission menace.`
    ]
  };
}

function electionIssue(state: RebirthGameState): string {
  if (state.resources.rapportDeForce > 65) return 'Faut-il durcir ou préserver la caisse ?';
  if (state.resources.institution > 60) return 'L’organisation gère-t-elle trop et mobilise-t-elle trop peu ?';
  if (state.resources.confiance < 40) return 'La base croit-elle encore au mandat ?';
  return 'Quelle ligne pour la prochaine séquence sociale ?';
}

function moveConfig(move: ElectionCampaignMove, camp: PlayerOrganization['camp']) {
  const salarie = camp === 'salarie';
  const configs: Record<ElectionCampaignMove, {
    label: string;
    faction: FactionId;
    loyalty: number;
    influence: number;
    playerMomentum: number;
    oppositionMomentum: number;
    orgDelta: Parameters<typeof applyOrganizationDelta>[1];
    resourceDelta?: Partial<RebirthGameState['resources']>;
    actorDelta?: Parameters<typeof applyActorsDelta>[1];
  }> = {
    rassembler: {
      label: 'motion de rassemblement',
      faction: 'reformistes',
      loyalty: 7,
      influence: 1,
      playerMomentum: 9,
      oppositionMomentum: -3,
      orgDelta: { cohesion: 4, treasury: -2 },
      resourceDelta: { confiance: 2 }
    },
    promettre_rupture: {
      label: salarie ? 'promesse de rupture' : 'ligne ferme assumée',
      faction: 'radicaux',
      loyalty: 10,
      influence: 2,
      playerMomentum: 8,
      oppositionMomentum: 2,
      orgDelta: { cohesion: -2, reputation: 3, treasury: -2 },
      resourceDelta: { rapportDeForce: 3, legitimite: -1 },
      actorDelta: { base: { pressure: 3 } }
    },
    professionnaliser: {
      label: 'preuve par les dossiers',
      faction: 'institutionnels',
      loyalty: 9,
      influence: 1,
      playerMomentum: 7,
      oppositionMomentum: -1,
      orgDelta: { reputation: 2, treasury: -3 },
      resourceDelta: { institution: 3 }
    },
    terrain: {
      label: 'tournée des sections',
      faction: 'territoriaux',
      loyalty: 9,
      influence: 2,
      playerMomentum: 8,
      oppositionMomentum: -2,
      orgDelta: { cohesion: 3, treasury: -3 },
      resourceDelta: { confiance: 3 },
      actorDelta: { base: { trust: 4 } }
    }
  };
  return configs[move];
}
