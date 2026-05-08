/* P2 ORDA-017 PARITAS — couverture résiduelle choicePosture.ts.
   Module modifié récemment ORDA-015 (Soren-10) : ajout du paramètre
   `multiplier` à previewResources pour éviter le feedforward menteur
   quand l'ability module ±20 %. Tests :
     - derivePosture : mapping trait→posture sur les 6 traits
     - derivePosture : neutre pour traitShift absent / nul
     - previewResources : direction up/down et magnitude major/minor
     - previewResources : multiplier change major→minor (P0 Soren-10)
     - resourceGlyph + RESOURCE_SHORT_LABEL exhaustif. */

import { describe, it, expect } from 'vitest';
import {
  derivePosture,
  previewResources,
  resourceGlyph,
  POSTURE_STYLES,
  RESOURCE_SHORT_LABEL
} from './choicePosture';
import type { Choice } from '../types';

function choice(over: Partial<Choice> = {}): Choice {
  return {
    id: 'c-x',
    text: 't',
    intent: 'i',
    effects: { resources: {} },
    consequence: { immediate: 'ok' },
    ...over
  } as Choice;
}

describe('choicePosture — derivePosture', () => {
  it('traitShift batisseur dominant → "institution"', () => {
    const p = derivePosture(choice({ traitShift: { batisseur: 3, technocrate: 1 } }));
    expect(p).toBe('institution');
  });

  it('traitShift rupture dominant → "rupture"', () => {
    const p = derivePosture(choice({ traitShift: { rupture: 4 } }));
    expect(p).toBe('rupture');
  });

  it('traitShift pragmatique → "compromis"', () => {
    const p = derivePosture(choice({ traitShift: { pragmatique: 2 } }));
    expect(p).toBe('compromis');
  });

  it('traitShift technocrate → "expertise"', () => {
    const p = derivePosture(choice({ traitShift: { technocrate: 2 } }));
    expect(p).toBe('expertise');
  });

  it('traitShift tribun → "opinion"', () => {
    const p = derivePosture(choice({ traitShift: { tribun: 3 } }));
    expect(p).toBe('opinion');
  });

  it('pas de traitShift → "neutre"', () => {
    const p = derivePosture(choice());
    expect(p).toBe('neutre');
  });

  it('traitShift présent mais tous ≤ 0 → "neutre"', () => {
    const p = derivePosture(choice({ traitShift: { batisseur: 0, rupture: -2 } }));
    expect(p).toBe('neutre');
  });
});

describe('choicePosture — previewResources', () => {
  it('aucune ressource → []', () => {
    const out = previewResources(choice({ effects: { resources: {} } }));
    expect(out).toEqual([]);
  });

  it('valeur 0 ignorée', () => {
    const out = previewResources(choice({ effects: { resources: { caisse: 0 } } }));
    expect(out).toEqual([]);
  });

  it('+5 → up + major (≥5 = majeur)', () => {
    const out = previewResources(choice({ effects: { resources: { caisse: 5 } } }));
    expect(out).toHaveLength(1);
    expect(out[0]!.direction).toBe('up');
    expect(out[0]!.magnitude).toBe('major');
  });

  it('+3 → up + minor (<5 = mineur)', () => {
    const out = previewResources(choice({ effects: { resources: { caisse: 3 } } }));
    expect(out[0]!.direction).toBe('up');
    expect(out[0]!.magnitude).toBe('minor');
  });

  it('-7 → down + major', () => {
    const out = previewResources(choice({ effects: { resources: { caisse: -7 } } }));
    expect(out[0]!.direction).toBe('down');
    expect(out[0]!.magnitude).toBe('major');
  });

  /* P0 Soren-10 (ORDA-015) : le multiplier déforme major↔minor pour
     coller au badge `EFFETS +X%`. */
  it('P0 Soren-10 : multiplier 0.85 transforme +5 (major) en +4.25 (minor)', () => {
    const out = previewResources(
      choice({ effects: { resources: { caisse: 5 } } }),
      0.85
    );
    expect(out[0]!.magnitude).toBe('minor');
    /* La direction reste up — multiplier positif. */
    expect(out[0]!.direction).toBe('up');
  });
});

describe('choicePosture — POSTURE_STYLES + glyphs', () => {
  it('toutes les postures ont un style complet (label, glyph, accent×3)', () => {
    for (const posture of Object.keys(POSTURE_STYLES) as (keyof typeof POSTURE_STYLES)[]) {
      const s = POSTURE_STYLES[posture];
      expect(s.label).toBeTruthy();
      expect(s.glyph).toBeTruthy();
      expect(s.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(s.accentSoft).toContain('rgba');
      expect(s.accentMuted).toContain('rgba');
    }
  });

  it('resourceGlyph + RESOURCE_SHORT_LABEL exhaustifs sur les 7 ressources', () => {
    const resources = [
      'confiance', 'caisse', 'santeSociale', 'legitimite',
      'rapportDeForce', 'cohesionInterne', 'institution'
    ] as const;
    for (const r of resources) {
      expect(resourceGlyph(r)).toBeTruthy();
      expect(RESOURCE_SHORT_LABEL[r]).toBeTruthy();
    }
  });
});
