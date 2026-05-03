/* ============================================================
   Paritas — utilité des ressources (lecture transverse, V3)
   ============================================================
   Source unique de vérité : quelle ressource alimente quel
   mini-jeu / action, et avec quel impact lisible.

   But : autodétermination du joueur (Deci & Ryan) — compétence
   (« je sais ce que mes stats permettent »), autonomie (« je
   choisis quoi développer pour quel but »), motivation
   (« investir dans une ressource ouvre des branches »).

   Cette couche est purement DESCRIPTIVE pour l'UI : les vrais
   calculs des mini-jeux restent dans leurs simulateurs respectifs.
   On expose ici les LIENS pour que le joueur les voie.
   ============================================================ */

import type { Resources, ResourceKey } from '../types';

/** Identifiants des "consommateurs" de ressources qu'on signale au joueur. */
export type AbilityId =
  | 'tresorerie'      // panneau budget
  | 'manifestation'   // simulateur manif
  | 'meeting'         // simulateur meeting
  | 'talents'         // formation/recrutement
  | 'tracts'          // diffusion
  | 'petition'        // mobilisation institutionnelle
  | 'presse'          // article
  | 'delegation'      // négociation diplomatique
  | 'table'           // mini-jeu table des négociations
  | 'congres';        // congrès interne

export interface AbilityImpact {
  ability: AbilityId;
  /** Étiquette courte pour l'UI (3-4 mots). */
  label: string;
  /** Description tactique : « ce que cette ressource fait à cette ability ». */
  impact: string;
  /** Poids relatif dans l'ability (1 = secondaire, 2 = important, 3 = critique).
   *  Sert à classer les ressources affichées en tête de mini-jeu. */
  weight: 1 | 2 | 3;
}

/* ====== Map ressource → abilities qu'elle alimente ====== */

export const RESOURCE_FUELS: Record<ResourceKey, AbilityImpact[]> = {
  caisse: [
    { ability: 'tresorerie',    label: 'Trésorerie',    impact: 'Solde courant — paie tout', weight: 3 },
    { ability: 'manifestation', label: 'Manifestation', impact: 'Logistique : cars, sono, juristes', weight: 3 },
    { ability: 'meeting',       label: 'Meeting',       impact: 'Location de salle, presse', weight: 2 },
    { ability: 'tracts',        label: 'Tracts',        impact: 'Imprimerie, papier', weight: 2 },
    { ability: 'talents',       label: 'Talents',       impact: 'Salaire des cadres, école', weight: 2 }
  ],

  confiance: [
    { ability: 'meeting',       label: 'Meeting',       impact: 'Affluence : la base répond ou pas', weight: 3 },
    { ability: 'manifestation', label: 'Manifestation', impact: 'Mobilisation des militants', weight: 3 },
    { ability: 'talents',       label: 'Talents',       impact: 'Fidélité — ils partent si tu déçois', weight: 3 },
    { ability: 'petition',      label: 'Pétition',      impact: 'Signatures spontanées', weight: 2 },
    { ability: 'tracts',        label: 'Tracts',        impact: 'Réception : on lit ou jette', weight: 1 }
  ],

  legitimite: [
    { ability: 'table',         label: 'Table',         impact: 'Accès aux négociations majeures', weight: 3 },
    { ability: 'presse',        label: 'Presse',        impact: 'Articles publiés vs. coupés', weight: 3 },
    { ability: 'delegation',    label: 'Délégation',    impact: 'Reçue par les ministres ou pas', weight: 3 },
    { ability: 'meeting',       label: 'Meeting',       impact: 'Couverture médiatique', weight: 2 }
  ],

  rapportDeForce: [
    { ability: 'manifestation', label: 'Manifestation', impact: 'Pression résultante sur l\'adversaire', weight: 3 },
    { ability: 'table',         label: 'Table',         impact: 'Marge de manœuvre en négo', weight: 2 },
    { ability: 'delegation',    label: 'Délégation',    impact: 'Ton et exigences possibles', weight: 2 }
  ],

  cohesionInterne: [
    { ability: 'manifestation', label: 'Manifestation', impact: 'Unité du cortège — pas de débandade', weight: 3 },
    { ability: 'congres',       label: 'Congrès',       impact: 'Adoption des motions, pas de scission', weight: 3 },
    { ability: 'tracts',        label: 'Tracts',        impact: 'Distribution réelle vs. intentionnelle', weight: 2 },
    { ability: 'talents',       label: 'Talents',       impact: 'Discipline interne, formation tient', weight: 2 }
  ],

  santeSociale: [
    { ability: 'petition',      label: 'Pétition',      impact: 'Résonance dans la société civile', weight: 3 },
    { ability: 'meeting',       label: 'Meeting',       impact: 'Public au-delà des militants', weight: 2 },
    { ability: 'presse',        label: 'Presse',        impact: 'Intérêt grand public', weight: 2 }
  ],

  institution: [
    { ability: 'table',         label: 'Table',         impact: 'Légitimité institutionnelle à signer', weight: 3 },
    { ability: 'congres',       label: 'Congrès',       impact: 'Capital long-terme accumulé', weight: 2 },
    { ability: 'delegation',    label: 'Délégation',    impact: 'Réseau institutionnel mobilisable', weight: 2 }
  ]
};

/* ====== Index inverse : pour un mini-jeu donné, quelles ressources le carburant ? ====== */

export interface FuelEntry {
  resource: ResourceKey;
  weight: 1 | 2 | 3;
  impact: string;
}

const FUELS_FOR_ABILITY: Map<AbilityId, FuelEntry[]> = (() => {
  const m = new Map<AbilityId, FuelEntry[]>();
  for (const [res, impacts] of Object.entries(RESOURCE_FUELS) as Array<[ResourceKey, AbilityImpact[]]>) {
    for (const it of impacts) {
      const arr = m.get(it.ability) ?? [];
      arr.push({ resource: res, weight: it.weight, impact: it.impact });
      m.set(it.ability, arr);
    }
  }
  /* Tri descendant par weight, puis on garde les 3 premières par défaut. */
  for (const [ability, arr] of m) {
    m.set(ability, arr.sort((a, b) => b.weight - a.weight));
  }
  return m;
})();

/** Renvoie les 3 ressources clés (par poids décroissant) qui alimentent
 *  l'ability donnée. À utiliser dans l'en-tête des mini-jeux. */
export function fuelsFor(ability: AbilityId, max = 3): FuelEntry[] {
  const all = FUELS_FOR_ABILITY.get(ability) ?? [];
  return all.slice(0, max);
}

/** Renvoie toutes les abilities qu'une ressource alimente — pour les
 *  tooltips du top header. */
export function abilitiesFor(resource: ResourceKey): AbilityImpact[] {
  return RESOURCE_FUELS[resource] ?? [];
}

/** Score de disponibilité 0-100 calculé par l'agrégat pondéré des
 *  ressources qui alimentent l'ability. Permet d'afficher un score
 *  composite « cette manif est fueled à 62% » par-dessus les valeurs
 *  individuelles. */
export function abilityFuelScore(ability: AbilityId, res: Resources): number {
  const entries = fuelsFor(ability, 5);
  if (entries.length === 0) return 0;
  const totalWeight = entries.reduce((s, e) => s + e.weight, 0);
  const weighted = entries.reduce((s, e) => {
    const v = (res[e.resource] as number) ?? 0;
    return s + v * e.weight;
  }, 0);
  return Math.round(weighted / totalWeight);
}

/** Étiquette courte pour le score composite. */
export function fuelScoreLabel(score: number): string {
  if (score >= 75) return 'Excellent';
  if (score >= 55) return 'Solide';
  if (score >= 35) return 'Limité';
  if (score >= 18) return 'Précaire';
  return 'À sec';
}

/** Multiplicateur appliqué au score d'un mini-jeu en fonction du fuel
 *  composite courant. Centré sur 1.0 pour fuel=50, va de 0.80 (à sec)
 *  à 1.20 (excellent). Volontairement borné pour ne pas dérégler la
 *  balance des simulateurs existants — c'est un LEVIER lisible, pas
 *  un game-changer. */
export function fuelMultiplier(fuelScore: number): number {
  const clamped = Math.max(0, Math.min(100, fuelScore));
  return 1 + (clamped - 50) / 250; // pente 0.4/100
}

/** Phrase d'attribution narrative : explique au joueur POURQUOI son
 *  mini-jeu a mieux ou moins bien marché en citant ses 1-2 ressources
 *  les plus pertinentes. Renforce le sentiment de compétence
 *  (Deci & Ryan) — les efforts du joueur sont reconnus dans le récit. */
export function fuelAttribution(
  ability: AbilityId,
  res: Resources,
  fuelScore: number
): string {
  const top = fuelsFor(ability, 2);
  if (top.length === 0) return '';
  const names = top
    .map(e => ({ name: ABILITY_SHORT_LABEL_BY_RESOURCE[e.resource], v: (res[e.resource] as number) ?? 0 }))
    .sort((a, b) => b.v - a.v);
  const best = names[0];
  const worst = names[names.length - 1];

  if (fuelScore >= 70) {
    return `Tes ${best.name} (${Math.round(best.v)}) ont porté l'action.`;
  }
  if (fuelScore >= 45) {
    return `Tes ${best.name} ont tenu, mais ${worst.name} a manqué.`;
  }
  if (fuelScore >= 25) {
    return `${worst.name} en panne — ça s'est vu sur le terrain.`;
  }
  return `Action engagée à sec : ni ${best.name} ni ${worst.name} n'étaient là.`;
}

/* Petit alias : noms français courts par ressource pour les attributions. */
const ABILITY_SHORT_LABEL_BY_RESOURCE: Record<ResourceKey, string> = {
  caisse:          'Caisse',
  confiance:       'Confiance',
  legitimite:      'Légitimité',
  rapportDeForce:  'Force ext.',
  cohesionInterne: 'Cohésion',
  santeSociale:    'Santé soc.',
  institution:     'Institution'
};

/** Étiquettes des abilities pour l'UI (utilisées dans les tooltips
 *  du top header : « → Alimente : Meeting, Manifestation, Talents »). */
export const ABILITY_SHORT_LABEL: Record<AbilityId, string> = {
  tresorerie:    'Trésorerie',
  manifestation: 'Manifestation',
  meeting:       'Meeting',
  talents:       'Talents',
  tracts:        'Tracts',
  petition:      'Pétition',
  presse:        'Presse',
  delegation:    'Délégation',
  table:         'Table',
  congres:       'Congrès'
};
