/* ============================================================
   Paritas — Theming par époque (V2.1)
   ============================================================
   Brief expert UX : « ne pas changer brutalement toute l'UX. Faire
   évoluer texture, icônes, polices, couleurs, sons. » Réponse —
   un meta-niveau de 5 époques regroupant les 15 ères granulaires
   du jeu, chacune avec ses tokens visuels.

   Ces 5 époques sont des SLOTS DE THÈME. Les 15 ères du jeu
   (cf. game/content/eras.ts) restent la granularité narrative.
   Le theming visuel ne change qu'aux 5 transitions époque, pas
   aux 15 transitions ères — sinon le joueur perdrait ses repères.

   Application : data-epoque="..." sur .cockpit root, puis CSS
   variables --epoque-* utilisées par les composants.
   ============================================================ */

import type { EraId } from '../../game/types';

export type EpoqueSlot =
  | 'ancien-regime'      // 1789-1815, Cahiers, Chapelier, premières coalitions
  | 'industrielle'       // XIXe industriel, Canuts, Ollivier, Waldeck
  | 'compromis-social'   // Belle Époque → Trente Glorieuses, Matignon, Sécu, Grenelle
  | 'tertiarisation'     // Crise → Hollande, plans sociaux, droit, médias
  | 'plateformes-ia';    // Macron, présent, IA, plateformes, données

export const EPOQUE_LABEL: Record<EpoqueSlot, string> = {
  'ancien-regime':    'Coalitions naissantes',
  'industrielle':     'Première industrie',
  'compromis-social': 'Compromis social',
  'tertiarisation':   'Tertiarisation',
  'plateformes-ia':   'Plateformes & IA'
};

export const EPOQUE_TAG: Record<EpoqueSlot, string> = {
  'ancien-regime':    'À la lumière des bougies',
  'industrielle':     'À la cadence des machines',
  'compromis-social': 'À la table des négociations',
  'tertiarisation':   'Au tournant des écrans',
  'plateformes-ia':   'Algorithmes et données'
};

export const EPOQUE_DATES: Record<EpoqueSlot, string> = {
  'ancien-regime':    '1789 – 1815',
  'industrielle':     '1815 – 1900',
  'compromis-social': '1900 – 1973',
  'tertiarisation':   '1973 – 2017',
  'plateformes-ia':   '2017 – présent'
};

/** Mappage des 15 ères du jeu vers les 5 époques de theming.
 *  L'ère est la granularité narrative ; l'époque est la granularité
 *  visuelle. Plusieurs ères partagent une époque pour stabilité UX. */
export function epoqueForEra(era: EraId | null | undefined): EpoqueSlot {
  if (!era) return 'compromis-social';
  switch (era) {
    case 'revolution':
      return 'ancien-regime';
    case 'xixe':
      return 'industrielle';
    case 'belle_epoque':
    case 'entre_deux_guerres':
    case 'reconstruction':
    case 'guerre_froide':
    case 'trente_glorieuses':
      return 'compromis-social';
    case 'crise':
    case 'mitterrand':
    case 'cohabitations':
    case 'sarkozy':
    case 'hollande':
      return 'tertiarisation';
    case 'macron_i':
    case 'macron_ii':
    case 'present':
      return 'plateformes-ia';
    default:
      return 'compromis-social';
  }
}
