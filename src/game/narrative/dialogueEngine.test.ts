/* P2 ORDA-017 PARITAS — couverture résiduelle dialogueEngine.ts.
   Module est un stub V1 (mono-étape pass-through) : on couvre
   exhaustivement les cas index in-bounds / out-of-bounds /
   script vide, et on documente la shape des DialogueStep
   pour la future V1.5 multi-étapes. */

import { describe, it, expect } from 'vitest';
import { nextStep, type DialogueScript, type DialogueStep } from './dialogueEngine';

function script(steps: DialogueStep[]): DialogueScript {
  return { id: 'sc-test', steps };
}

describe('dialogueEngine — nextStep', () => {
  it('index 0 sur script à 1 étape → retourne l\'étape', () => {
    const s = script([{ who: 'narrateur', text: 'Le jour se lève.' }]);
    const step = nextStep(s, 0);
    expect(step).not.toBeNull();
    expect(step!.text).toBe('Le jour se lève.');
    expect(step!.who).toBe('narrateur');
  });

  it('index hors borne (1 sur script à 1 étape) → null', () => {
    const s = script([{ who: 'narrateur', text: 'A.' }]);
    expect(nextStep(s, 1)).toBeNull();
  });

  it('script vide → null pour tout index', () => {
    const s = script([]);
    expect(nextStep(s, 0)).toBeNull();
    expect(nextStep(s, 5)).toBeNull();
  });

  it('script multi-étapes : index 0..n-1 retourne les étapes successives', () => {
    const s = script([
      { who: 'narrateur', text: 'Intro.' },
      { who: 'pnj', pnjId: 'pinot', text: 'Que voulez-vous ?', subtext: 'Refus' },
      { who: 'self', text: 'La parité.' }
    ]);
    expect(nextStep(s, 0)!.text).toBe('Intro.');
    expect(nextStep(s, 1)!.pnjId).toBe('pinot');
    expect(nextStep(s, 2)!.who).toBe('self');
    /* Bord supérieur : 3 → null */
    expect(nextStep(s, 3)).toBeNull();
  });

  it('index négatif (cas dégénéré) → null', () => {
    const s = script([{ who: 'narrateur', text: 'X.' }]);
    expect(nextStep(s, -1)).toBeNull();
  });

  it('preserve les champs optionnels (subtext, pnjId) sur les étapes retournées', () => {
    const s = script([
      { who: 'pnj', pnjId: 'frachon', text: 'Trois lignes.', subtext: 'Il sait.' }
    ]);
    const step = nextStep(s, 0);
    expect(step!.subtext).toBe('Il sait.');
    expect(step!.pnjId).toBe('frachon');
  });
});
