/* Paritas Rebirth — dialogueEngine.ts
 * V1 : stub. Les scènes V1 sont mono-étape. Ce module expose un type pour de futurs
 * dialogues multi-étapes (style Suzerain) sans bloquer le moteur principal.
 */

export interface DialogueStep {
  /** Qui parle */
  who: 'narrateur' | 'pnj' | 'self' | 'voix';
  /** Identifiant du PNJ si pertinent */
  pnjId?: string;
  /** Texte affiché */
  text: string;
  /** Sous-texte implicite (ce que la phrase signifie vraiment) */
  subtext?: string;
}

export interface DialogueScript {
  id: string;
  steps: DialogueStep[];
}

/** V1 : pass-through (à étendre en V1.5). */
export function nextStep(
  script: DialogueScript,
  index: number
): DialogueStep | null {
  return script.steps[index] ?? null;
}
