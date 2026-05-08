import { describe, it, expect } from 'vitest';
import {
  shouldSuggestElection,
  startInternalElection,
  campaignInternalElection,
  tickInternalElection
} from './internalElections';
import { freshOrganization } from './organization';
import { freshResources } from '../simulation/resources';
import { freshActors } from '../simulation/actors';
import type { RebirthGameState } from '../types';

/* Couverture Vitest ORDA-013 — org/internalElections.ts (était 0%).
   Élections internes : 4 mouvements de campagne, momentum joueur/opposition,
   résolution avec scoring factionSupport + reputation. */

function mkState(over: {
  turn?: number;
  organization?: ReturnType<typeof freshOrganization>;
  resourceOver?: Partial<ReturnType<typeof freshResources>>;
  betrayedBase?: number;
} = {}): RebirthGameState {
  return {
    turn: over.turn ?? 20,
    resources: { ...freshResources(), ...(over.resourceOver ?? {}) },
    actors: freshActors(),
    organization: over.organization ?? freshOrganization('salarie', 'X'),
    memory: {
      refusedCompromise: 0, signedMajorAccords: [], betrayedBase: over.betrayedBase ?? 0,
      builtInstitutions: [], exhaustedMovements: 0, flags: {},
      playedScenarios: [], pendingLongterm: []
    }
  } as unknown as RebirthGameState;
}

describe('internalElections — shouldSuggestElection', () => {
  it('false avant turn 18', () => {
    expect(shouldSuggestElection(mkState({ turn: 17 }))).toBe(false);
  });

  it('false si élection déjà active', () => {
    const org = freshOrganization('salarie', 'X');
    const active = {
      ...org,
      election: { active: true, startedTurn: 18, roundsLeft: 3, playerMomentum: 30, oppositionMomentum: 30, issue: 'X' }
    };
    expect(shouldSuggestElection(mkState({ turn: 22, organization: active }))).toBe(false);
  });

  it('true si cohesion < 42', () => {
    const org = { ...freshOrganization('salarie', 'X'), cohesion: 30 };
    expect(shouldSuggestElection(mkState({ turn: 19, organization: org }))).toBe(true);
  });

  it('true si betrayedBase > 0', () => {
    expect(shouldSuggestElection(mkState({ turn: 19, betrayedBase: 1 }))).toBe(true);
  });

  it('true sur multiple de 12', () => {
    expect(shouldSuggestElection(mkState({ turn: 24 }))).toBe(true);
  });
});

describe('internalElections — startInternalElection', () => {
  it('crée une élection active', () => {
    const next = startInternalElection(mkState({ turn: 20 }));
    expect(next.organization.election).toBeDefined();
    expect(next.organization.election!.active).toBe(true);
    expect(next.organization.election!.roundsLeft).toBe(3);
    expect(next.organization.election!.startedTurn).toBe(20);
  });

  it('no-op si élection déjà active', () => {
    const org = {
      ...freshOrganization('salarie', 'X'),
      election: { active: true, startedTurn: 18, roundsLeft: 2, playerMomentum: 50, oppositionMomentum: 30, issue: 'déjà' }
    };
    const state = mkState({ organization: org });
    const next = startInternalElection(state);
    expect(next).toBe(state);
  });

  it('issue par défaut basée sur l\'état', () => {
    const next = startInternalElection(mkState({ resourceOver: { rapportDeForce: 70 } }));
    expect(next.organization.election!.issue).toMatch(/durcir/);
  });

  it('issue custom respectée', () => {
    const next = startInternalElection(mkState(), 'Question custom');
    expect(next.organization.election!.issue).toBe('Question custom');
  });

  it('ajoute à actionHistory', () => {
    const next = startInternalElection(mkState({ turn: 25 }));
    expect(next.organization.actionHistory[0]).toMatch(/T25.*Élection.*ouverte/);
  });
});

describe('internalElections — campaignInternalElection', () => {
  function withElection() {
    const org = {
      ...freshOrganization('salarie', 'X'),
      election: { active: true, startedTurn: 18, roundsLeft: 3, playerMomentum: 30, oppositionMomentum: 30, issue: 'X' }
    };
    return mkState({ turn: 20, organization: org });
  }

  it('rassembler boost reformistes', () => {
    const state = withElection();
    const before = state.organization.factions.find(f => f.id === 'reformistes')!.loyalty;
    const next = campaignInternalElection(state, 'rassembler');
    const after = next.organization.factions.find(f => f.id === 'reformistes')!.loyalty;
    expect(after).toBeGreaterThan(before);
  });

  it('promettre_rupture boost radicaux', () => {
    const state = withElection();
    const before = state.organization.factions.find(f => f.id === 'radicaux')!.loyalty;
    const next = campaignInternalElection(state, 'promettre_rupture');
    const after = next.organization.factions.find(f => f.id === 'radicaux')!.loyalty;
    expect(after).toBeGreaterThan(before);
  });

  it('professionnaliser boost institutionnels', () => {
    const state = withElection();
    const next = campaignInternalElection(state, 'professionnaliser');
    const inst = next.organization.factions.find(f => f.id === 'institutionnels')!;
    expect(inst.loyalty).toBeGreaterThan(state.organization.factions.find(f => f.id === 'institutionnels')!.loyalty);
  });

  it('terrain boost territoriaux', () => {
    const state = withElection();
    const next = campaignInternalElection(state, 'terrain');
    const terr = next.organization.factions.find(f => f.id === 'territoriaux')!;
    expect(terr.loyalty).toBeGreaterThan(state.organization.factions.find(f => f.id === 'territoriaux')!.loyalty);
  });

  it('décrémente roundsLeft', () => {
    const state = withElection();
    const next = campaignInternalElection(state, 'rassembler');
    expect(next.organization.election!.roundsLeft).toBe(2);
  });

  it('augmente playerMomentum', () => {
    const state = withElection();
    const next = campaignInternalElection(state, 'rassembler');
    expect(next.organization.election!.playerMomentum).toBeGreaterThan(30);
  });

  it('factions non ciblées perdent 1 loyalty (concurrence)', () => {
    const state = withElection();
    const next = campaignInternalElection(state, 'rassembler');
    const radicaux = next.organization.factions.find(f => f.id === 'radicaux')!;
    expect(radicaux.loyalty).toBeLessThan(state.organization.factions.find(f => f.id === 'radicaux')!.loyalty);
  });

  it('no-op si pas d\'élection active', () => {
    const state = mkState();
    const next = campaignInternalElection(state, 'rassembler');
    expect(next).toBe(state);
  });
});

describe('internalElections — tickInternalElection', () => {
  it('ouvre une élection si conditions réunies + retourne log', () => {
    const state = mkState({ turn: 24 }); // turn % 12 === 0
    const result = tickInternalElection(state);
    expect(result.state.organization.election?.active).toBe(true);
    expect(result.logs.length).toBeGreaterThan(0);
  });

  it('no-op silencieux si rien à faire', () => {
    const state = mkState({ turn: 5 });
    const result = tickInternalElection(state);
    expect(result.logs).toEqual([]);
  });

  it('augmente oppositionMomentum si élection en cours', () => {
    const org = {
      ...freshOrganization('salarie', 'X'),
      election: { active: true, startedTurn: 18, roundsLeft: 2, playerMomentum: 30, oppositionMomentum: 30, issue: 'X' }
    };
    const state = mkState({ turn: 20, organization: org });
    const result = tickInternalElection(state);
    expect(result.state.organization.election!.oppositionMomentum).toBeGreaterThan(30);
  });

  it('résout l\'élection quand roundsLeft = 0', () => {
    const org = {
      ...freshOrganization('salarie', 'X'),
      election: { active: true, startedTurn: 18, roundsLeft: 0, playerMomentum: 80, oppositionMomentum: 20, issue: 'X' }
    };
    const state = mkState({ turn: 21, organization: org });
    const result = tickInternalElection(state);
    expect(result.state.organization.election).toBeNull();
    expect(result.logs[0]).toMatch(/Élection interne/);
  });

  it('victoire (playerScore élevé) → pas de log "perdue"', () => {
    const org = {
      ...freshOrganization('salarie', 'X'),
      reputation: 80,
      cohesion: 80,
      election: { active: true, startedTurn: 18, roundsLeft: 0, playerMomentum: 95, oppositionMomentum: 10, issue: 'X' }
    };
    const result = tickInternalElection(mkState({ organization: org }));
    expect(result.logs[0]).toMatch(/renouvelé|gagnée/);
  });

  it('défaite (playerScore faible) → log "contestée"', () => {
    const org = {
      ...freshOrganization('salarie', 'X'),
      reputation: 5,
      cohesion: 10,
      election: { active: true, startedTurn: 18, roundsLeft: 0, playerMomentum: 5, oppositionMomentum: 95, issue: 'X' }
    };
    const result = tickInternalElection(mkState({ organization: org }));
    expect(result.logs[0]).toMatch(/contestée|perdue|scission/);
  });
});
