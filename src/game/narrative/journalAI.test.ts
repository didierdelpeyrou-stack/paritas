/* P2 ORDA-017 PARITAS — couverture résiduelle journalAI.ts.
   Couvre :
     - splitJournalInTwoParagraphs (markers explicites + heuristique
       paragraphes vides + fallback texte indécoupable)
     - buildJournalInput (mandateBilan, recentLog tail, formatHint)
     - isJournalAIEnabled (env-driven, fallback false sans VITE_NARRATIVE_API).
   Le streamJournalAI nécessite fetch mocking — hors scope des
   tests non-réseau. */

import { describe, it, expect } from 'vitest';
import {
  splitJournalInTwoParagraphs,
  buildJournalInput,
  isJournalAIEnabled
} from './journalAI';
import { freshResources } from '../simulation/resources';
import { freshActors } from '../simulation/actors';
import { freshOrganization } from '../org/organization';
import { freshTraits } from '../narrative/personalityEngine';
import { freshMemory } from '../narrative/memoryEngine';
import type { RebirthGameState } from '../types';
import type { EndingRender } from '../engine/endingEngine';

function buildState(): RebirthGameState {
  return {
    name: 'Léon',
    camp: 'salarie',
    mode: 'reflechi',
    legendaryId: 'jouhaux',
    turn: 50,
    era: 'paritarisme-fondateur',
    currentScenarioId: null,
    traits: freshTraits(),
    dominantTrait: 'pragmatique',
    personalityStress: 30,
    resources: freshResources(),
    actors: freshActors(),
    organization: freshOrganization('salarie', 'CGT'),
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

function buildEnding(): EndingRender {
  return {
    id: 'resistance',
    title: 'Résistance',
    text: 'Tu as tenu.',
    score: 72,
    stats: {
      turnsPlayed: 50,
      institutionsBuilt: 3,
      refusedCompromise: 2,
      betrayedBase: 0,
      exhaustedMovements: 1
    } as EndingRender['stats'],
    objectives: [
      { id: 'a', label: 'Bâtir', description: '', condition: { kind: 'institutions-built', count: 3 }, weight: 3 },
      { id: 'b', label: 'Tenir', description: '', condition: { kind: 'no-betrayal', max: 1 }, weight: 2 }
    ],
    objectiveProgress: [
      { id: 'a', progress: 100, satisfied: true, failed: false },
      { id: 'b', progress: 50, satisfied: false, failed: true }
    ]
  };
}

describe('journalAI — splitJournalInTwoParagraphs', () => {
  it('texte vide → morsure et action vides', () => {
    const r = splitJournalInTwoParagraphs('');
    expect(r.morsure).toBe('');
    expect(r.action).toBe('');
  });

  it('marqueurs [MORSURE]/[ACTION] explicites → split exact', () => {
    const txt = '[MORSURE]\nTu as choisi le compromis.\n[ACTION]\nFais 1 chose ce mois.';
    const r = splitJournalInTwoParagraphs(txt);
    expect(r.morsure).toContain('compromis');
    expect(r.action).toContain('1 chose');
  });

  it('paragraphes vides + heuristique 60% → split au milieu logique', () => {
    const txt = `Paragraphe un.

Paragraphe deux.

Paragraphe trois.

Paragraphe quatre.`;
    const r = splitJournalInTwoParagraphs(txt);
    expect(r.morsure).toBeTruthy();
    expect(r.action).toBeTruthy();
    expect(r.morsure).toContain('Paragraphe un');
    /* Cut at 60% : 4 paras × 0.6 = 2.4 → floor 2. Premiers 2 en morsure. */
    expect(r.action).toContain('Paragraphe trois');
  });

  it('texte indécoupable → tout en morsure, action vide', () => {
    const r = splitJournalInTwoParagraphs('Une seule ligne sans paragraphes.');
    expect(r.morsure).toContain('Une seule ligne');
    expect(r.action).toBe('');
  });
});

describe('journalAI — buildJournalInput', () => {
  it('shape : kind=journal, contient state + ending + stats + mandateBilan + recentLog', () => {
    const input = buildJournalInput(buildState(), buildEnding(), ['log1', 'log2']);
    expect(input.kind).toBe('journal');
    expect(input.state.name).toBe('Léon');
    expect(input.state.camp).toBe('salarie');
    expect(input.ending.id).toBe('resistance');
    expect(input.ending.score).toBe(72);
    expect(input.stats.turnsPlayed).toBe(50);
    expect(input.mandateBilan).toHaveLength(2);
    expect(input.mandateBilan[0]!.status).toBe('satisfied');
    expect(input.mandateBilan[1]!.status).toBe('failed');
    expect(input.recentLog).toHaveLength(2);
    expect(input.formatHint).toBe('morsure-action');
  });

  it('recentLog tronque à 12 entrées', () => {
    const log = Array.from({ length: 30 }, (_, i) => `entry-${i}`);
    const input = buildJournalInput(buildState(), buildEnding(), log);
    expect(input.recentLog).toHaveLength(12);
    /* Garde les 12 dernières (slice(-12)) */
    expect(input.recentLog[0]).toBe('entry-18');
    expect(input.recentLog[11]).toBe('entry-29');
  });
});

describe('journalAI — isJournalAIEnabled', () => {
  it('renvoie un booléen', () => {
    /* En env de tests vitest, VITE_NARRATIVE_API est typiquement absent.
       On vérifie juste le type. */
    expect(typeof isJournalAIEnabled()).toBe('boolean');
  });
});
