/* ============================================================
   Paritas — Modèle thermodynamique du moteur
   ============================================================
   - Entropie passive : décay sur les jauges si pas d'action
   - Détecteur de crise (Bar-Yam #30) : 3+ jauges critiques en 2 tours
   - Forçages externes (Bertalanffy #29) : vents historiques par tour
   - Conversion énergétique : aucune action ne crée du fluide pur,
     toujours une transformation (loi de conservation)

   Spec : V3_COCKPIT_THERMODYNAMIQUE.md
   ============================================================ */

import type { Resources, RebirthGameState } from '../../game/types';

/* ====== Entropie ====== */

/** Décay passif par tour, par ressource. Force le joueur à agir
 *  (Prigogine #26). */
const ENTROPY_DECAY: Partial<Record<keyof Resources, number>> = {
  caisse: 0.5,           // frais courants
  confiance: 0.3,        // l'oubli quotidien
  legitimite: 0.2,       // érosion politique
  rapportDeForce: 0.8,   // perd vite
  cohesionInterne: 0.4,  // refroidissement
  /* santeSociale et institution : ne décroissent pas */
};

/** Applique le tick d'entropie sur les ressources. À appeler à
 *  chaque advanceTurn(). Pure : retourne nouvelle struct. */
export function applyEntropyTick(resources: Resources): Resources {
  const next = { ...resources };
  for (const [k, decay] of Object.entries(ENTROPY_DECAY)) {
    const key = k as keyof Resources;
    if (typeof next[key] === 'number') {
      next[key] = Math.max(0, next[key] - (decay ?? 0));
    }
  }
  return next;
}

/* ====== Crisis detector ====== */

/** Seuil critique sous lequel une jauge est « en zone rouge ». */
const CRITICAL_THRESHOLD = 25;

/** Liste des ressources actuellement en zone critique. */
export function criticalResources(resources: Resources): Array<keyof Resources> {
  const out: Array<keyof Resources> = [];
  for (const [k, v] of Object.entries(resources)) {
    if (typeof v === 'number' && v < CRITICAL_THRESHOLD) {
      out.push(k as keyof Resources);
    }
  }
  return out;
}

/** Crisis active si 3+ jauges critiques (Bar-Yam #30). */
export function isCrisisActive(resources: Resources): boolean {
  return criticalResources(resources).length >= 3;
}

/* ====== Forçages externes (vents historiques) ====== */

export interface ExternalForcing {
  /** Tour de début */
  fromTurn: number;
  /** Tour de fin (inclus) */
  toTurn: number;
  /** Nom du vent affiché en bandeau */
  label: string;
  /** Description courte */
  description: string;
  /** Modificateurs appliqués aux actions ciblées */
  modifiers: ForcingModifier[];
}

export interface ForcingModifier {
  /** Action ciblée par id (ou wildcard '*' pour toutes) */
  actionId: string;
  /** Coût Caisse multiplié par ce facteur (0.5 = -50%) */
  costMultiplier?: number;
  /** Effets multipliés par ce facteur (2 = ×2) */
  effectMultiplier?: number;
  /** Cooldown divisé par ce facteur (2 = ÷2) */
  cooldownMultiplier?: number;
  /** Probabilité d'échec ajoutée/retirée (positif = + difficile) */
  failModifier?: number;
}

/* Catalogue des vents historiques alignés sur eras.ts.
   Voir docs/V3_COCKPIT_THERMODYNAMIQUE.md §III "Forçages externes". */
export const EXTERNAL_FORCINGS: ExternalForcing[] = [
  {
    fromTurn: 1, toTurn: 3,
    label: 'Souffle révolutionnaire',
    description: 'L\'effervescence des cahiers de doléances. Toute action laisse une trace double dans la mémoire collective.',
    modifiers: [{ actionId: '*', effectMultiplier: 1.5 }]
  },
  {
    fromTurn: 17, toTurn: 22,
    label: 'Front populaire',
    description: 'Mai 36 — la grève générale est dans l\'air. Manifestations puissamment soutenues.',
    modifiers: [
      { actionId: 'manifestation', costMultiplier: 0.5, effectMultiplier: 2 },
      { actionId: 'tracts', costMultiplier: 0.6 }
    ]
  },
  {
    fromTurn: 23, toTurn: 26,
    label: 'Vent du CNR',
    description: 'Programme du Conseil National de la Résistance — « Les Jours heureux » légitiment le paritarisme.',
    modifiers: [
      { actionId: 'signature', effectMultiplier: 1.6 },
      { actionId: 'table', cooldownMultiplier: 0.5 }
    ]
  },
  {
    fromTurn: 35, toTurn: 40,
    label: 'Crise pétrolière',
    description: 'Chômage de masse, inflation. La caisse fond plus vite, le rapport de force durcit.',
    modifiers: [
      { actionId: 'tresorerie', effectMultiplier: 0.7 },
      { actionId: 'manifestation', failModifier: 0.10 }
    ]
  },
  {
    fromTurn: 45, toTurn: 50,
    label: 'Refondation sociale',
    description: 'Plan Juppé puis Aubry. Le paritarisme se redéfinit.',
    modifiers: [
      { actionId: 'table', cooldownMultiplier: 0.5 },
      { actionId: 'congres', effectMultiplier: 1.3 }
    ]
  },
  {
    fromTurn: 69, toTurn: 80,
    label: 'Ordonnances Macron',
    description: 'Inversion de la hiérarchie des normes. Le patronat est en position de force.',
    modifiers: [
      { actionId: 'lockout', cooldownMultiplier: 0.7 },
      { actionId: 'signature', costMultiplier: 1.4 }
    ]
  },
  {
    fromTurn: 91, toTurn: 100,
    label: 'IA et plateformes',
    description: 'Une nouvelle économie reconfigure le paritarisme. Les talents formés sont décisifs.',
    modifiers: [{ actionId: '*', effectMultiplier: 1.2 }]
  }
];

/** Vent actif au tour donné (peut être null). Le PREMIER trouvé
 *  prime si plusieurs se chevauchent. */
export function activeForcing(turn: number): ExternalForcing | null {
  return EXTERNAL_FORCINGS.find(f => turn >= f.fromTurn && turn <= f.toTurn) ?? null;
}

/** Prochain vent à venir dans <= N tours (Johnson #3 : anticipation).
 *  Permet d'afficher « Front populaire dans 2 tours, prépare-toi ». */
export function upcomingForcing(turn: number, withinTurns = 2): {
  forcing: ExternalForcing;
  inTurns: number;
} | null {
  for (const f of EXTERNAL_FORCINGS) {
    if (f.fromTurn <= turn) continue;  // déjà passé ou actif
    const inTurns = f.fromTurn - turn;
    if (inTurns <= withinTurns) return { forcing: f, inTurns };
  }
  return null;
}

/** Retourne le modificateur applicable à une action donnée à un
 *  tour donné (cumulatif si plusieurs vents — on combine). */
export function modifierFor(actionId: string, turn: number): ForcingModifier {
  const out: ForcingModifier = { actionId };
  const f = activeForcing(turn);
  if (!f) return out;
  for (const m of f.modifiers) {
    if (m.actionId !== actionId && m.actionId !== '*') continue;
    if (m.costMultiplier !== undefined) {
      out.costMultiplier = (out.costMultiplier ?? 1) * m.costMultiplier;
    }
    if (m.effectMultiplier !== undefined) {
      out.effectMultiplier = (out.effectMultiplier ?? 1) * m.effectMultiplier;
    }
    if (m.cooldownMultiplier !== undefined) {
      out.cooldownMultiplier = (out.cooldownMultiplier ?? 1) * m.cooldownMultiplier;
    }
    if (m.failModifier !== undefined) {
      out.failModifier = (out.failModifier ?? 0) + m.failModifier;
    }
  }
  return out;
}

/* ====== Scaling non-linéaire (West #28) ====== */

/** Une organisation grandit en N^(3/4). Les coûts par adhérent
 *  diminuent mais les coûts absolus augmentent. */
export function scaledCostFactor(membership: number): number {
  const base = 1000;
  if (membership <= base) return 1;
  return Math.pow(membership / base, 0.75);
}

/* ====== Helpers d'application au state ====== */

/** Applique le tick global de fin de tour : entropie + check crise.
 *  Retourne nouveau state. À appeler depuis advanceTurn(). */
export function applyThermodynamicTick(state: RebirthGameState): RebirthGameState {
  const newResources = applyEntropyTick(state.resources);
  /* On n'applique pas directement le flag crise dans memory ;
   * c'est la responsabilité du caller de poser le flag s'il le veut. */
  return { ...state, resources: newResources };
}
