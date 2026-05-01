/* Paritas Rebirth — tensions.ts
 * Calcul des seuils de bascule : grève, dissolution, démission, etc.
 */

import type { RebirthGameState } from '../types';

export interface TensionAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  text: string;
}

/** Évalue les seuils critiques après une mutation du state. */
export function evaluateTensions(state: RebirthGameState): TensionAlert[] {
  const alerts: TensionAlert[] = [];
  const r = state.resources;
  const a = state.actors;

  if (r.santeSociale <= 20) {
    alerts.push({
      id: 'tension_haute',
      level: 'critical',
      text: 'Le tissu social s\'effondre. Grèves, sabotage, accidents en chaîne.'
    });
  }
  if (a.base.patience <= 15) {
    alerts.push({
      id: 'base_rupture',
      level: 'critical',
      text: 'Ta base est à bout. Une seule provocation suffirait.'
    });
  }
  if (a.base.trust <= 20) {
    alerts.push({
      id: 'base_defiance',
      level: 'warning',
      text: 'La base ne croit plus en toi.'
    });
  }
  if (r.legitimite <= 20) {
    alerts.push({
      id: 'legitimite',
      level: 'warning',
      text: 'L\'opinion publique te lâche.'
    });
  }
  if (r.caisse <= 15) {
    alerts.push({
      id: 'caisse_basse',
      level: 'warning',
      text: 'Les réserves paritaires sont presque vides.'
    });
  }
  if (r.rapportDeForce <= 15) {
    alerts.push({
      id: 'rapport_force_bas',
      level: 'info',
      text: 'Tu n\'as plus aucun levier dans la négociation.'
    });
  }
  return alerts;
}

/** Renvoie true si l'état déclenche une fin de partie anticipée. */
export function shouldEndEarly(state: RebirthGameState): boolean {
  const r = state.resources;
  const a = state.actors;
  // base totalement perdue : démission forcée
  if (a.base.trust <= 5 && state.turn > 10) return true;
  // tension extrême + caisse vide : effondrement
  if (r.santeSociale <= 5 && r.caisse <= 5) return true;
  return false;
}
