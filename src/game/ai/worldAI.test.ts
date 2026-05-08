import { describe, it, expect } from 'vitest';
import { freshWorldAI, tickWorldAI } from './worldAI';
import { freshResources } from '../simulation/resources';
import { freshActors } from '../simulation/actors';
import { freshOrganization } from '../org/organization';
import type { RebirthGameState, Memory } from '../types';

/* Couverture Vitest P0 ORDA-016 PARITAS — ai/worldAI.ts (était 0%).
   Module qui pilote l'État + adversaire à chaque tour. ~198 LoC.
   Cible : structure freshWorldAI, déterminisme tickWorldAI, application
   des effets selon la stratégie choisie (mediation / cooptation / ...). */

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
  camp?: 'salarie' | 'patron';
  resources?: Partial<ReturnType<typeof freshResources>>;
  organization?: Partial<ReturnType<typeof freshOrganization>>;
  actorsOver?: {
    etat?: Partial<ReturnType<typeof freshActors>['etat']>;
    base?: Partial<ReturnType<typeof freshActors>['base']>;
    adversaire?: Partial<ReturnType<typeof freshActors>['adversaire']>;
    opinion?: Partial<ReturnType<typeof freshActors>['opinion']>;
  };
} = {}): RebirthGameState {
  const a = freshActors();
  const o = freshOrganization(over.camp ?? 'salarie', 'X');
  return {
    turn: over.turn ?? 1,
    camp: over.camp ?? 'salarie',
    resources: { ...freshResources(), ...over.resources },
    actors: {
      ...a,
      etat: { ...a.etat, ...over.actorsOver?.etat },
      base: { ...a.base, ...over.actorsOver?.base },
      adversaire: { ...a.adversaire, ...over.actorsOver?.adversaire },
      opinion: { ...a.opinion, ...over.actorsOver?.opinion }
    },
    organization: { ...o, ...over.organization },
    memory: emptyMemory(),
    worldAI: freshWorldAI()
  } as unknown as RebirthGameState;
}

describe('worldAI — freshWorldAI', () => {
  it('expose une structure stable initiale', () => {
    const w = freshWorldAI();
    expect(w.state.id).toBe('mediation');
    expect(w.state.label).toBe('Médiation');
    expect(w.state.faction).toBe('unitaire');
    expect(w.state.cycle).toBe('mid_term');
    expect(typeof w.state.intensity).toBe('number');
    expect(typeof w.state.signal).toBe('string');
    expect(w.opponent.id).toBe('compromis_limite');
    expect(w.opponent.factionId).toBe('patronat');
    expect(w.lastSignals).toEqual([]);
  });

  it('chaque appel retourne un nouvel objet (pas de partage de référence)', () => {
    const w1 = freshWorldAI();
    const w2 = freshWorldAI();
    expect(w1).not.toBe(w2);
    expect(w1.lastSignals).not.toBe(w2.lastSignals);
  });
});

describe('worldAI — tickWorldAI structure de retour', () => {
  it('retourne { state, logs } avec 2 lignes de log nommées', () => {
    const tick = tickWorldAI(mkState({ turn: 3 }));
    expect(tick.state).toBeDefined();
    expect(Array.isArray(tick.logs)).toBe(true);
    expect(tick.logs).toHaveLength(2);
    expect(tick.logs[0]).toMatch(/^T3 — État/);
    expect(tick.logs[1]).toMatch(/^T3 — Adversaire/);
  });

  it('met à jour worldAI.state, worldAI.opponent et lastSignals', () => {
    const tick = tickWorldAI(mkState());
    expect(tick.state.worldAI.state).toBeDefined();
    expect(tick.state.worldAI.opponent).toBeDefined();
    expect(tick.state.worldAI.lastSignals).toHaveLength(2);
    /* Les signaux sont les phrases des deux stratégies choisies. */
    expect(tick.state.worldAI.lastSignals[0]).toBe(tick.state.worldAI.state.signal);
    expect(tick.state.worldAI.lastSignals[1]).toBe(tick.state.worldAI.opponent.signal);
  });

  it('déterministe — deux appels sur le même état produisent les mêmes ids et intensités', () => {
    const base = mkState({ turn: 5 });
    const a = tickWorldAI(base);
    const b = tickWorldAI(base);
    expect(a.state.worldAI.state.id).toBe(b.state.worldAI.state.id);
    expect(a.state.worldAI.state.intensity).toBe(b.state.worldAI.state.intensity);
    expect(a.state.worldAI.opponent.id).toBe(b.state.worldAI.opponent.id);
    expect(a.state.worldAI.opponent.intensity).toBe(b.state.worldAI.opponent.intensity);
  });
});

describe('worldAI — applyStateStrategy (effets selon stratégie État)', () => {
  it('mediation (faction unitaire, cas par défaut) : institution +p, etat.trust +p', () => {
    /* freshActors → etat.trust=50, etat.patience=50, opinion.trust=50.
       Avec freshResources, on est dans la branche défaut → mediation 35. */
    const state = mkState({ turn: 1 });
    const before = state.resources.institution;
    const tick = tickWorldAI(state);
    expect(tick.state.worldAI.state.id).toBe('mediation');
    expect(tick.state.resources.institution).toBeGreaterThan(before);
    expect(tick.state.actors.etat.trust).toBeGreaterThan(state.actors.etat.trust);
  });

  it('decret (rapportDeForce ≥ 68 + legitimite ≥ 38) : institution baisse, opinion impactée', () => {
    const state = mkState({
      turn: 1,
      resources: { rapportDeForce: 80, legitimite: 60 }
    });
    const before = state.resources.institution;
    const tick = tickWorldAI(state);
    expect(tick.state.worldAI.state.id).toBe('decret');
    expect(tick.state.resources.institution).toBeLessThan(before);
  });

  it('repression (rapportDeForce ≥ 68 + legitimite < 38) : santeSociale chute', () => {
    const state = mkState({
      turn: 1,
      resources: { rapportDeForce: 80, legitimite: 20, santeSociale: 80 }
    });
    const tick = tickWorldAI(state);
    expect(tick.state.worldAI.state.id).toBe('repression');
    expect(tick.state.resources.santeSociale).toBeLessThan(80);
  });

  it('temporisation (santeSociale basse) : base.patience baisse', () => {
    const state = mkState({
      turn: 1,
      resources: { santeSociale: 20 },
      actorsOver: { base: { patience: 70 } }
    });
    const tick = tickWorldAI(state);
    expect(tick.state.worldAI.state.id).toBe('temporisation');
    expect(tick.state.actors.base.patience).toBeLessThan(70);
  });

  it('cadrage_budgetaire (faction bercy, caisse basse) : caisse baisse', () => {
    /* Tour ≥ 25 active la segmentation en factions. caisse ≤ 32 + cycle pre_plfss
       → bercy. Sa stratégie de prédilection caisse-low est cadrage_budgetaire. */
    const state = mkState({
      turn: 27, // 27 % 5 = 2 → pre_plfss
      resources: { caisse: 20, rapportDeForce: 40, legitimite: 50 },
      actorsOver: { etat: { trust: 30, patience: 60 }, opinion: { trust: 50 } }
    });
    const tick = tickWorldAI(state);
    expect(tick.state.worldAI.state.faction).toBe('bercy');
    expect(tick.state.worldAI.state.id).toBe('cadrage_budgetaire');
    expect(tick.state.resources.caisse).toBeLessThan(20);
  });
});

describe('worldAI — applyOpponentStrategy (effets selon stratégie adverse)', () => {
  it('compromis_limite (cas par défaut) : adversaire.trust monte', () => {
    const state = mkState();
    const before = state.actors.adversaire.trust;
    const tick = tickWorldAI(state);
    expect(tick.state.worldAI.opponent.id).toBe('compromis_limite');
    expect(tick.state.actors.adversaire.trust).toBeGreaterThan(before);
  });

  it('division (rapportDeForce ≥ 64 + cohesion ≥ 55) : confiance et cohesion baissent', () => {
    const state = mkState({
      turn: 1,
      resources: { rapportDeForce: 70, confiance: 80, legitimite: 30 },
      organization: { cohesion: 60, mediaRelay: 0, legalTeam: 0 }
    });
    const tick = tickWorldAI(state);
    expect(tick.state.worldAI.opponent.id).toBe('division');
    expect(tick.state.resources.confiance).toBeLessThan(80);
    expect(tick.state.organization.cohesion).toBeLessThan(60);
  });

  it('juridicisation (legalTeam ≥ 4 ou institution ≥ 58) : caisse baisse', () => {
    const state = mkState({
      turn: 1,
      resources: { caisse: 60, institution: 60, rapportDeForce: 30, legitimite: 30 },
      organization: { legalTeam: 1, mediaRelay: 0 }
    });
    const tick = tickWorldAI(state);
    expect(tick.state.worldAI.opponent.id).toBe('juridicisation');
    expect(tick.state.resources.caisse).toBeLessThan(60);
  });

  it('ligne_dure (adversaire.patience basse) : santeSociale baisse, rapportDeForce monte', () => {
    const state = mkState({
      turn: 1,
      resources: { santeSociale: 80, rapportDeForce: 30, legitimite: 30, institution: 30 },
      actorsOver: { adversaire: { patience: 20 } },
      organization: { mediaRelay: 0, legalTeam: 0 }
    });
    const tick = tickWorldAI(state);
    expect(tick.state.worldAI.opponent.id).toBe('ligne_dure');
    expect(tick.state.resources.santeSociale).toBeLessThan(80);
    expect(tick.state.resources.rapportDeForce).toBeGreaterThan(30);
  });
});

describe('worldAI — purity / immutability', () => {
  it('ne mute pas le state d\'entrée', () => {
    const state = mkState({ turn: 1 });
    const beforeInst = state.resources.institution;
    const beforeEtat = state.actors.etat.trust;
    tickWorldAI(state);
    /* L'état d'origine reste inchangé : tickWorldAI retourne un nouveau state. */
    expect(state.resources.institution).toBe(beforeInst);
    expect(state.actors.etat.trust).toBe(beforeEtat);
  });
});
