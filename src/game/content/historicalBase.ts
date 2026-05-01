/* Paritas Rebirth — historicalBase.ts
 * Notes historiques courtes pour le mode Réfléchi (theoryHint).
 * Indexées par concept clé. Cf. 00_bibliographie_master.md §3.
 */

export interface HistoricalNote {
  id: string;
  /** Court titre */
  label: string;
  /** Définition pédagogique en 1-3 phrases */
  text: string;
}

export const HISTORICAL_NOTES: Record<string, HistoricalNote> = {
  paritarisme_negociation: {
    id: 'paritarisme_negociation',
    label: 'Paritarisme de négociation',
    text: 'Production de normes sociales par accord entre partenaires sociaux. Conventions collectives, ANI.'
  },
  paritarisme_gestion: {
    id: 'paritarisme_gestion',
    label: 'Paritarisme de gestion',
    text: 'Cogestion d\'organismes (Sécu, Agirc-Arrco, Unédic, Action Logement, AT-MP). Cœur historique français.'
  },
  paritarisme_representation: {
    id: 'paritarisme_representation',
    label: 'Paritarisme de représentation',
    text: 'Présence des partenaires sociaux dans des instances consultatives (CESE, prud\'hommes).'
  },
  democratie_sociale: {
    id: 'democratie_sociale',
    label: 'Démocratie sociale',
    text: 'Production de normes et gestion de dispositifs collectifs par les partenaires sociaux, distincte de la démocratie politique.'
  },
  modele_bismarckien: {
    id: 'modele_bismarckien',
    label: 'Modèle bismarckien',
    text: 'Protection sociale liée à l\'emploi, financée par cotisations, gérée par les partenaires sociaux. Allemagne, France, Belgique.'
  },
  lettre_cadrage: {
    id: 'lettre_cadrage',
    label: 'Lettre de cadrage',
    text: 'Document de l\'État (depuis 2018) qui borne la négociation Unédic. Si l\'accord en sort, le gouvernement peut décréter à la place.'
  },
  ani: {
    id: 'ani',
    label: 'ANI',
    text: 'Accord national interprofessionnel. Outil principal du paritarisme de négociation depuis les années 1970.'
  },
  cse: {
    id: 'cse',
    label: 'CSE',
    text: 'Comité social et économique (ordonnances Macron 2017). Fusion DP + CE + CHSCT.'
  },
  hierarchie_normes: {
    id: 'hierarchie_normes',
    label: 'Hiérarchie des normes',
    text: 'Ordre de priorité loi > convention de branche > accord d\'entreprise. Inversée partiellement depuis 2016/2017 sur certains thèmes.'
  },
  inversion_hierarchique: {
    id: 'inversion_hierarchique',
    label: 'Inversion hiérarchique',
    text: 'Situation où l\'accord d\'entreprise prime sur la convention de branche. Levier patronal majeur.'
  },
  coalition: {
    id: 'coalition',
    label: 'Coalition',
    text: 'Terme révolutionnaire pour "association des travailleurs". Interdit par Le Chapelier 1791, légalisé par Ollivier 1864.'
  },
  charte_amiens: {
    id: 'charte_amiens',
    label: 'Charte d\'Amiens',
    text: 'Motion Griffuelhes du congrès CGT 1906. Affirme l\'indépendance du syndicalisme vis-à-vis des partis politiques.'
  },
  matignon_1936: {
    id: 'matignon_1936',
    label: 'Accords de Matignon (1936)',
    text: '40h, 15 jours de congés payés, délégués du personnel, hausses de salaires +7-15%. Modèle classique du compromis paritaire ascendant.'
  },
  cnr_jours_heureux: {
    id: 'cnr_jours_heureux',
    label: 'Programme "Les Jours heureux"',
    text: 'Plan complet du CNR adopté le 15 mars 1944. Gestion par les "représentants des intéressés".'
  },
  ordonnances_1945: {
    id: 'ordonnances_1945',
    label: 'Ordonnances du 4 octobre 1945',
    text: 'Création de la Sécurité sociale. Architecture juridique : Pierre Laroque. Maître d\'œuvre politique : Ambroise Croizat.'
  }
};

export function noteById(id: string): HistoricalNote | undefined {
  return HISTORICAL_NOTES[id];
}
