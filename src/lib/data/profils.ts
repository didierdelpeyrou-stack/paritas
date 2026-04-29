/* Paritas — 8 profils doctrinaux émergents */

import type { Profil } from '../types';

export const PROFILS: Record<string, Profil> = {
  reformiste: {
    id: 'reformiste', nom: 'Réformiste', ico: '📜', camp: 'any',
    desc: "Tu crois au progrès par la négociation, l'accord signé, l'institution patiente.",
    figures: 'Lignée : Jouhaux, Maire, Berger.',
    bonus: { negociation: 1.0, institutionnel: 1.0 }
  },
  conflictuel: {
    id: 'conflictuel', nom: 'Conflictuel', ico: '⚔️', camp: 'any',
    desc: 'Tu tiens la ligne dure : sans rapport de force, pas de droit nouveau.',
    figures: 'Lignée : Krasucki, Frachon.',
    bonus: { mobilisation: 1.0, militant: 1.0 }
  },
  gestionnaire: {
    id: 'gestionnaire', nom: 'Gestionnaire', ico: '📊', camp: 'patron',
    desc: 'Tu gères le social comme un risque : prévisible, comptable, contractuel.',
    figures: 'Lignée : Detoeuf, Bloch-Lainé.',
    bonus: { production: 1.0, economique: 1.0 }
  },
  revolutionnaire: {
    id: 'revolutionnaire', nom: 'Révolutionnaire', ico: '🚩', camp: 'salarie',
    desc: 'Tu refuses la cogestion : ce qui est concédé peut être repris.',
    figures: 'Lignée : Pelloutier, Monatte, Besnard.',
    bonus: { mobilisation: 1.0, militant: 1.0 }
  },
  corporatiste: {
    id: 'corporatiste', nom: 'Corporatiste', ico: '🏛️', camp: 'patron',
    desc: 'Tu vois la branche comme une famille : règles internes, hiérarchie, transmission.',
    figures: 'Lignée : Boileau, jurandes médiévales.',
    bonus: { institutionnel: 1.0, social: 1.0 }
  },
  technocrate: {
    id: 'technocrate', nom: 'Technocrate', ico: '📚', camp: 'any',
    desc: "Tu domines par l'expertise : code du travail, données, ingénierie sociale.",
    figures: 'Lignée : Laroque, Kessler, Auroux.',
    bonus: { expertise: 1.5 }
  },
  batisseur: {
    id: 'batisseur', nom: "Bâtisseur d'institutions", ico: '🏗️', camp: 'any',
    desc: 'Tu transformes la lutte en droit durable, le compromis en architecture.',
    figures: 'Lignée : Croizat, Notat.',
    bonus: { institutionnel: 1.5, social: 0.5 }
  },
  rupture: {
    id: 'rupture', nom: 'Militant de rupture', ico: '💥', camp: 'salarie',
    desc: "Tu portes la conflictualité jusqu'à la rupture, refuses les institutions qui anesthésient.",
    figures: 'Lignée : Canuts, Solidaires, Sud.',
    bonus: { militant: 1.5, symbolique: 0.5 }
  }
};
