/* Paritas Rebirth — resources.ts
 * Helpers sur les 6 ressources du modèle léger.
 */

import type { Resources, ResourceKey } from '../types';

export function freshResources(): Resources {
  return {
    confiance: 50,
    caisse: 40,
    santeSociale: 60,
    legitimite: 40,
    rapportDeForce: 30,
    cohesionInterne: 50,
    institution: 20
  };
}

export function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Applique un delta partiel aux ressources, en clampant 0..100. */
export function applyResourceDelta(
  current: Resources,
  delta: Partial<Resources>
): Resources {
  const next = { ...current };
  for (const k of Object.keys(delta) as ResourceKey[]) {
    const d = delta[k] ?? 0;
    next[k] = clamp(next[k] + d);
  }
  return next;
}

/** Texte court d'un delta de ressource pour le journal. */
export function formatResourceDelta(key: ResourceKey, delta: number): string {
  const sign = delta >= 0 ? '+' : '';
  return `${RESOURCE_LABELS[key]} ${sign}${Math.round(delta)}`;
}

export const RESOURCE_LABELS: Record<ResourceKey, string> = {
  confiance: 'Confiance',
  caisse: 'Caisse',
  santeSociale: 'Santé sociale',
  legitimite: 'Légitimité',
  rapportDeForce: 'Force externe',
  cohesionInterne: 'Cohésion interne',
  institution: 'Institution'
};

export const RESOURCE_TOOLTIPS: Record<ResourceKey, string> = {
  confiance: 'La base croit-elle en toi ?',
  caisse: 'Réserves financières — sesterces, livres tournois, francs ou euros selon l\'époque.',
  santeSociale: 'Santé du tissu social : trop bas → grèves, sabotage.',
  legitimite: 'Comment l\'opinion publique te perçoit.',
  rapportDeForce: 'Force EXTERNE — capacité à imposer face à l\'adversaire (manif, grève, presse). Pression du syndicat vers le dehors.',
  cohesionInterne: 'Force INTERNE — pression de la base sur toi (assemblée, conseil, vote). Si trop bas : risque de scission ou éviction au prochain congrès. (Omnès)',
  institution: 'Solidité durable des institutions paritaires construites.'
};
