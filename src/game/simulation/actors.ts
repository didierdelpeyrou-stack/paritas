/* Paritas Rebirth — actors.ts
 * Les 4 acteurs du modèle léger : base, adversaire, etat, opinion.
 */

import type { Actor, ActorId, Actors, ActorStance } from '../types';
import { clamp } from './resources';

export function freshActors(): Actors {
  return {
    base: { trust: 60, pressure: 30, patience: 70, stance: 'cooperatif' },
    adversaire: { trust: 30, pressure: 50, patience: 60, stance: 'opportuniste' },
    etat: { trust: 50, pressure: 40, patience: 50, stance: 'opportuniste' },
    opinion: { trust: 50, pressure: 20, patience: 80, stance: 'instable' }
  };
}

/** Applique un delta partiel à un acteur. */
export function applyActorDelta(actor: Actor, delta: Partial<Actor>): Actor {
  return {
    trust: clamp(actor.trust + (delta.trust ?? 0)),
    pressure: clamp(actor.pressure + (delta.pressure ?? 0)),
    patience: clamp(actor.patience + (delta.patience ?? 0)),
    stance: delta.stance ?? actor.stance
  };
}

/** Applique des deltas à plusieurs acteurs. */
export function applyActorsDelta(
  actors: Actors,
  deltas: Partial<Record<ActorId, Partial<Actor>>>
): Actors {
  const next: Actors = { ...actors };
  for (const k of Object.keys(deltas) as ActorId[]) {
    const d = deltas[k];
    if (!d) continue;
    next[k] = applyActorDelta(actors[k], d);
  }
  return next;
}

export const ACTOR_LABELS: Record<ActorId, string> = {
  base: 'Base',
  adversaire: 'Adversaire',
  etat: 'État',
  opinion: 'Opinion'
};

export const ACTOR_TOOLTIPS: Record<ActorId, string> = {
  base: 'Tes militants, les ouvriers, les adhérents.',
  adversaire: 'Ton interlocuteur en face de la table.',
  etat: 'Le pouvoir politique et administratif.',
  opinion: 'Le grand public, les médias, les sociologues.'
};

export function stanceLabel(s: ActorStance): string {
  switch (s) {
    case 'cooperatif':
      return 'Coopératif';
    case 'dur':
      return 'Dur';
    case 'instable':
      return 'Instable';
    case 'opportuniste':
      return 'Opportuniste';
  }
}
