/* P2 ORDA-017 PARITAS — couverture résiduelle playerProfile.ts.
   Tests de la boucle d'apprentissage côté localStorage :
     - recordEnding : compteur de défaites consécutives, reset sur
       victoire, pas d'incrément sur fin "inacheve"
     - buildPlayerProfile : shape (partiesPlayed/personalityStress/
       recentDifficulty/anonId), recentDifficulty="easy" si 3+ défaites
     - readModePreference : default 'falc', lit 'litteraire' si stocké
     - fallback gracieux quand localStorage absent (try/catch).
   Mock localStorage en in-memory pour rendre l'env Node testable. */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  recordEnding,
  buildPlayerProfile,
  readModePreference
} from './playerProfile';
import { freshResources } from '../simulation/resources';
import { freshActors } from '../simulation/actors';
import { freshOrganization } from '../org/organization';
import { freshTraits } from '../narrative/personalityEngine';
import { freshMemory } from '../narrative/memoryEngine';
import type { RebirthGameState } from '../types';

function buildState(stress = 25): RebirthGameState {
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
    personalityStress: stress,
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
    endingId: null
  } as unknown as RebirthGameState;
}

/* In-memory localStorage shim pour env Node. */
function installFakeLocalStorage(): void {
  const store = new Map<string, string>();
  (globalThis as { localStorage?: Storage }).localStorage = {
    get length() { return store.size; },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); }
  } as Storage;
}

function uninstallLocalStorage(): void {
  delete (globalThis as { localStorage?: Storage }).localStorage;
}

describe('playerProfile — recordEnding (compteur défaites consécutives)', () => {
  beforeEach(() => installFakeLocalStorage());
  afterEach(() => uninstallLocalStorage());

  it('défaite "mutilation" → +1 ; victoire "resistance" → reset à 0', () => {
    recordEnding('mutilation');
    recordEnding('mutilation');
    expect(localStorage.getItem('paritas_recent_defeats')).toBe('2');
    recordEnding('resistance');
    expect(localStorage.getItem('paritas_recent_defeats')).toBe('0');
  });

  it('défaite "capture" compte aussi ; "refondation" reset', () => {
    recordEnding('capture');
    recordEnding('capture');
    recordEnding('refondation');
    expect(localStorage.getItem('paritas_recent_defeats')).toBe('0');
  });

  it('"inacheve" ne touche pas le compteur', () => {
    recordEnding('mutilation');
    recordEnding('inacheve');
    expect(localStorage.getItem('paritas_recent_defeats')).toBe('1');
  });
});

describe('playerProfile — buildPlayerProfile', () => {
  beforeEach(() => installFakeLocalStorage());
  afterEach(() => uninstallLocalStorage());

  it('shape complète : partiesPlayed, stress, recentDifficulty, anonId', () => {
    const profile = buildPlayerProfile(buildState(45));
    expect(profile.partiesPlayed).toBe(0);
    expect(profile.personalityStress).toBe(45);
    expect(profile.recentDifficulty).toBe('normal');
    expect(typeof profile.anonId).toBe('string');
    expect(profile.anonId.length).toBe(16);
  });

  it('3+ défaites consécutives → recentDifficulty="easy"', () => {
    recordEnding('mutilation');
    recordEnding('mutilation');
    recordEnding('mutilation');
    const profile = buildPlayerProfile(buildState());
    expect(profile.recentDifficulty).toBe('easy');
  });

  it('anonId est stable entre appels (regénéré qu\'au premier appel)', () => {
    const p1 = buildPlayerProfile(buildState());
    const p2 = buildPlayerProfile(buildState());
    expect(p1.anonId).toBe(p2.anonId);
  });
});

describe('playerProfile — readModePreference', () => {
  beforeEach(() => installFakeLocalStorage());
  afterEach(() => uninstallLocalStorage());

  it('défaut = "falc" (FALC = Facile à Lire et à Comprendre)', () => {
    expect(readModePreference()).toBe('falc');
  });

  it('si "litteraire" stocké → renvoie "litteraire"', () => {
    localStorage.setItem('paritas_text_mode', 'litteraire');
    expect(readModePreference()).toBe('litteraire');
  });
});

describe('playerProfile — fallback sans localStorage (env Node sans shim)', () => {
  beforeEach(() => uninstallLocalStorage());

  it('buildPlayerProfile reste fonctionnel : recordEnding ne plante pas', () => {
    expect(() => recordEnding('mutilation')).not.toThrow();
  });

  it('buildPlayerProfile retourne profil dégradé sans plantage', () => {
    /* localStorage est absent → try/catch attrape, anonId fallback. */
    const profile = buildPlayerProfile(buildState(10));
    expect(profile.partiesPlayed).toBe(0);
    expect(profile.recentDifficulty).toBe('normal');
    expect(profile.anonId).toBe('anon-fallback');
  });
});
