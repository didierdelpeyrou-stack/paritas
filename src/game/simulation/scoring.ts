/* Paritas Rebirth — scoring.ts
 * Score final consolidé.
 */

import type { RebirthGameState } from '../types';

export function computeFinalScore(state: RebirthGameState): number {
  const r = state.resources;
  const inst = state.memory.builtInstitutions.length;
  const accords = state.memory.signedMajorAccords.length;
  const trahis = state.memory.betrayedBase;
  const epuises = state.memory.exhaustedMovements;

  const cohesion =
    (r.confiance + r.santeSociale + r.legitimite) / 3;
  const construction = inst * 6 + accords * 4 + r.institution * 0.6;
  const resistance = r.rapportDeForce * 0.5 + r.caisse * 0.4;
  const malus = trahis * 8 + epuises * 5;

  const raw = cohesion * 0.5 + construction + resistance - malus;
  return Math.max(0, Math.min(100, Math.round(raw)));
}
