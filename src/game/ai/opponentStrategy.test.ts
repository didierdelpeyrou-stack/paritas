/* P2 ORDA-017 PARITAS — couverture résiduelle opponentStrategy.ts.
   Vérifie que la sélection de stratégie adverse suit les seuils
   resources/actors/organization, et que le signal nomme bien la
   faction historique courante. */

import { describe, it, expect } from 'vitest';
import { chooseOpponentStrategy } from './opponentStrategy';
import { freshResources } from '../simulation/resources';
import { freshActors } from '../simulation/actors';
import { freshOrganization } from '../org/organization';
import { freshTraits } from '../narrative/personalityEngine';
import { freshMemory } from '../narrative/memoryEngine';
import type { RebirthGameState } from '../types';

function buildState(over: Partial<RebirthGameState> = {}): RebirthGameState {
  return {
    name: 'Test',
    camp: 'salarie',
    mode: 'reflechi',
    legendaryId: null,
    turn: 1,
    era: 'belle-epoque',
    currentScenarioId: null,
    traits: freshTraits(),
    dominantTrait: 'pragmatique',
    personalityStress: 0,
    resources: freshResources(),
    actors: freshActors(),
    organization: freshOrganization('salarie', 'Test'),
    activeStrategies: [],
    worldAI: { mode: 'neutral', aggression: 0, lastTrigger: null },
    activePipelines: [],
    memory: freshMemory(),
    objectives: [],
    objectiveProgress: [],
    phase: 'idle',
    lastChoice: null,
    lastConsequenceText: null,
    endingId: null,
    ...over
  } as unknown as RebirthGameState;
}

describe('opponentStrategy — chooseOpponentStrategy', () => {
  it('par défaut, état frais → compromis_limite (intensity 34)', () => {
    const s = buildState();
    const out = chooseOpponentStrategy(s);
    expect(out.id).toBe('compromis_limite');
    expect(out.intensity).toBe(34);
    expect(out.label).toBe('Compromis limité');
  });

  it('rapportDeForce ≥ 64 + cohésion ≥ 55 → division (intensity 62)', () => {
    const s = buildState();
    s.resources.rapportDeForce = 70;
    s.organization.cohesion = 60;
    const out = chooseOpponentStrategy(s);
    expect(out.id).toBe('division');
    expect(out.intensity).toBe(62);
  });

  it('legitimite ≥ 60 + mediaRelay ≥ 3 → campagne_media', () => {
    const s = buildState();
    s.resources.legitimite = 70;
    s.organization.mediaRelay = 4;
    const out = chooseOpponentStrategy(s);
    expect(out.id).toBe('campagne_media');
    expect(out.intensity).toBe(56);
  });

  it('legalTeam ≥ 4 → juridicisation', () => {
    const s = buildState();
    s.organization.legalTeam = 5;
    const out = chooseOpponentStrategy(s);
    expect(out.id).toBe('juridicisation');
    expect(out.intensity).toBe(52);
  });

  it('adversaire stance "dur" → ligne_dure', () => {
    const s = buildState();
    s.actors.adversaire.stance = 'dur';
    const out = chooseOpponentStrategy(s);
    expect(out.id).toBe('ligne_dure');
    expect(out.intensity).toBe(66);
  });

  it('camp salarié + caisse ≤ 35 + rien d\'autre → deplacement_production', () => {
    const s = buildState();
    s.resources.caisse = 30;
    s.actors.adversaire.patience = 50;
    s.actors.adversaire.stance = 'opportuniste';
    const out = chooseOpponentStrategy(s);
    expect(out.id).toBe('deplacement_production');
    expect(out.intensity).toBe(50);
  });

  it('signal et faction nommée sont surfacés (factionShort, factionId)', () => {
    const s = buildState({ turn: 16, camp: 'salarie' }); // Comité des Forges actif
    const out = chooseOpponentStrategy(s);
    expect(out.factionShort).toBeTruthy();
    expect(out.factionId).toBeTruthy();
    expect(out.signal).toContain(out.factionShort);
  });
});
