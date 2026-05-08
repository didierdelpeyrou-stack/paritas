/* P0 Ghys-08 (Sapeurs ORDA-015 PARITAS) — tests endingEngine.
   Vérifie que ENDING_TEXTS_BY_CAMP couvre les 10 entrées (5 endings × 2 camps)
   et que buildEnding lit le bon texte selon state.camp. */

import { describe, it, expect } from 'vitest';
import { ENDING_TEXTS_BY_CAMP, buildEnding, pickEnding } from './endingEngine';
import { freshResources } from '../simulation/resources';
import { freshActors } from '../simulation/actors';
import { freshTraits } from '../narrative/personalityEngine';
import { freshMemory } from '../narrative/memoryEngine';
import { freshOrganization } from '../org/organization';
import type { RebirthGameState, EndingId } from '../types';
import type { Camp } from '../../lib/types';

const ALL_ENDINGS: EndingId[] = [
  'mutilation', 'resistance', 'refondation', 'capture', 'inacheve'
];

function buildState(camp: Camp, overrides: Partial<RebirthGameState> = {}): RebirthGameState {
  return {
    name: 'Test',
    camp,
    mode: 'reflechi',
    legendaryId: null,
    turn: 100,
    era: 'paritarisme-fondateur',
    currentScenarioId: null,
    traits: freshTraits(),
    dominantTrait: 'pragmatique',
    personalityStress: 0,
    resources: freshResources(),
    actors: freshActors(),
    organization: freshOrganization(camp, 'Test'),
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
    ...overrides
  } as unknown as RebirthGameState;
}

describe('endingEngine — ENDING_TEXTS_BY_CAMP (P0 Sapeurs Ghys-08)', () => {
  it('expose les 5 endings × 2 camps = 10 textes', () => {
    let count = 0;
    for (const id of ALL_ENDINGS) {
      expect(ENDING_TEXTS_BY_CAMP[id]).toBeDefined();
      for (const camp of ['salarie', 'patron'] as Camp[]) {
        const fn = ENDING_TEXTS_BY_CAMP[id][camp];
        expect(typeof fn).toBe('function');
        const text = fn(buildState(camp));
        expect(typeof text).toBe('string');
        expect(text.length).toBeGreaterThan(40);
        count++;
      }
    }
    expect(count).toBe(10);
  });

  it('chaque (id, camp) produit un texte distinct entre camps (preuve du miroir)', () => {
    for (const id of ALL_ENDINGS) {
      const sal = ENDING_TEXTS_BY_CAMP[id].salarie(buildState('salarie'));
      const pat = ENDING_TEXTS_BY_CAMP[id].patron(buildState('patron'));
      expect(sal).not.toBe(pat);
    }
  });

  it('un patron qui finit en capture ne lit PAS « tu as gagné un siège, perdu une base »', () => {
    const text = ENDING_TEXTS_BY_CAMP.capture.patron(buildState('patron'));
    expect(text).not.toMatch(/gagné un siège/i);
  });

  it('un patron qui finit en mutilation lit un texte aligné sur l\'arc patronal', () => {
    const text = ENDING_TEXTS_BY_CAMP.mutilation.patron(buildState('patron'));
    // adhérents / branche / TPE-PME — registre patronal
    expect(text).toMatch(/adh[ée]rents|branche|TPE|PME/i);
  });

  it('buildEnding(state) lit le bon texte selon state.camp', () => {
    /* On force state vers `mutilation` : caisse basse + 0 institutions
       → pickEnding retourne mutilation pour les deux camps.
       Vérifier que les deux versions diffèrent. */
    const salState = buildState('salarie', {
      resources: { ...freshResources(), caisse: 10, institution: 0 }
    });
    const patState = buildState('patron', {
      resources: { ...freshResources(), caisse: 10, institution: 0 }
    });
    expect(pickEnding(salState)).toBe('mutilation');
    expect(pickEnding(patState)).toBe('mutilation');

    const salRender = buildEnding(salState);
    const patRender = buildEnding(patState);
    expect(salRender.id).toBe('mutilation');
    expect(patRender.id).toBe('mutilation');
    expect(salRender.text).not.toBe(patRender.text);
  });
});
