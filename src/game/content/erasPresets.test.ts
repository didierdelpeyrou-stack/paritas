/* Couverture Vitest ORDA-017 — content/erasPresets.ts.
 *
 * Mode "Séance prof" (P0 panel-30, agent-23 Aïcha) — l'enseignant peut
 * démarrer une partie à n'importe laquelle des 15 ères. On vérifie ici
 * que toutes les ères ont une preset complète et que les valeurs sont
 * dans les bornes 0-100 (clamp implicite des ressources). */

import { describe, it, expect } from 'vitest';
import { ERA_START_PRESETS, presetForEra } from './erasPresets';
import { ERAS } from './eras';
import { ALL_RESOURCES, type EraId, type ResourceKey } from '../types';
import { freshResources } from '../simulation/resources';

const ALL_ERA_IDS: EraId[] = [
  'revolution',
  'xixe',
  'belle_epoque',
  'entre_deux_guerres',
  'reconstruction',
  'guerre_froide',
  'trente_glorieuses',
  'crise',
  'mitterrand',
  'cohabitations',
  'sarkozy',
  'hollande',
  'macron_i',
  'macron_ii',
  'present'
];

describe('erasPresets — ERA_START_PRESETS (cardinalité & couverture)', () => {
  it('expose une preset pour les 15 EraId', () => {
    expect(Object.keys(ERA_START_PRESETS).length).toBe(15);
    for (const eraId of ALL_ERA_IDS) {
      expect(ERA_START_PRESETS[eraId]).toBeDefined();
    }
  });

  it('couvre toutes les ères listées dans ERAS', () => {
    for (const era of ERAS) {
      expect(ERA_START_PRESETS[era.id]).toBeDefined();
    }
  });

  it('chaque preset définit les 7 ressources requises', () => {
    for (const eraId of ALL_ERA_IDS) {
      const preset = ERA_START_PRESETS[eraId];
      for (const key of ALL_RESOURCES) {
        expect(preset[key]).toBeDefined();
        expect(typeof preset[key]).toBe('number');
      }
    }
  });
});

describe('erasPresets — bornes 0..100', () => {
  it('toutes les valeurs sont dans [0, 100]', () => {
    for (const eraId of ALL_ERA_IDS) {
      const preset = ERA_START_PRESETS[eraId];
      for (const key of ALL_RESOURCES as ResourceKey[]) {
        const v = preset[key];
        expect(v, `${eraId}.${key}`).toBeGreaterThanOrEqual(0);
        expect(v, `${eraId}.${key}`).toBeLessThanOrEqual(100);
      }
    }
  });

  it('toutes les valeurs sont des entiers', () => {
    for (const eraId of ALL_ERA_IDS) {
      const preset = ERA_START_PRESETS[eraId];
      for (const key of ALL_RESOURCES as ResourceKey[]) {
        expect(Number.isInteger(preset[key]), `${eraId}.${key}`).toBe(true);
      }
    }
  });
});

describe('erasPresets — cohérence historique (sanity)', () => {
  it('la preset revolution est identique à freshResources()', () => {
    /* Garantit que démarrer en mode pédagogique sur la Révolution
       est strictement équivalent au démarrage par défaut tour 1. */
    expect(ERA_START_PRESETS.revolution).toEqual(freshResources());
  });

  it('institution monte globalement avec le temps (1789 < 2026)', () => {
    expect(ERA_START_PRESETS.revolution.institution)
      .toBeLessThan(ERA_START_PRESETS.trente_glorieuses.institution);
    expect(ERA_START_PRESETS.xixe.institution)
      .toBeLessThan(ERA_START_PRESETS.reconstruction.institution);
  });

  it('reconstruction (CNR 1944-47) a la légitimité la plus haute', () => {
    const peak = ERA_START_PRESETS.reconstruction.legitimite;
    for (const eraId of ALL_ERA_IDS) {
      expect(ERA_START_PRESETS[eraId].legitimite).toBeLessThanOrEqual(peak);
    }
  });

  it('santeSociale chute en période de crise vs trente_glorieuses', () => {
    expect(ERA_START_PRESETS.crise.santeSociale)
      .toBeLessThan(ERA_START_PRESETS.trente_glorieuses.santeSociale);
    expect(ERA_START_PRESETS.macron_ii.santeSociale)
      .toBeLessThan(ERA_START_PRESETS.trente_glorieuses.santeSociale);
  });
});

describe('erasPresets — presetForEra()', () => {
  it('retourne une copie (mutation safe)', () => {
    const a = presetForEra('revolution');
    const b = presetForEra('revolution');
    expect(a).toEqual(b);
    a.confiance = 0;
    expect(b.confiance).not.toBe(0);
    expect(ERA_START_PRESETS.revolution.confiance).not.toBe(0);
  });

  it('retourne les mêmes valeurs que ERA_START_PRESETS', () => {
    for (const eraId of ALL_ERA_IDS) {
      expect(presetForEra(eraId)).toEqual(ERA_START_PRESETS[eraId]);
    }
  });
});
