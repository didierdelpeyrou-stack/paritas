/**
 * Catalogue d'images historiques hotlinked depuis Wikimedia Commons.
 * Toutes sont sous licence libre (domaine public ou CC-BY/CC-BY-SA).
 * Wikimedia Commons autorise explicitement le hotlinking depuis
 * upload.wikimedia.org.
 *
 * Crédits affichés en pied d'image dans HistoricalImage.svelte. Si une
 * URL casse, le composant tombe sur un fallback parchemin et le jeu
 * continue sans erreur.
 */

export interface HistoricalImage {
  id: string;
  /** URL complète Wikimedia. */
  src: string;
  /** Texte alternatif descriptif. */
  alt: string;
  /** Crédit court à afficher (auteur ou domaine public + Wikimedia). */
  credit: string;
}

const CHARACTER_IMAGES: HistoricalImage[] = [
  {
    id: 'jouhaux',
    src: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/L%C3%A9on_Jouhaux_nobel.jpg',
    alt: 'Léon Jouhaux, secrétaire général de la CGT puis président de Force ouvrière, vers 1951.',
    credit: 'Domaine public · Wikimedia Commons'
  },
  {
    id: 'croizat',
    src: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Ambroise_Croizat.jpg',
    alt: 'Ambroise Croizat, ministre du Travail, architecte politique de la Sécurité sociale.',
    credit: 'Domaine public · Wikimedia Commons'
  },
  {
    id: 'griffuelhes',
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Griffuelhes-1906.jpg',
    alt: 'Victor Griffuelhes en 1906, secrétaire général de la CGT, auteur de la Charte d’Amiens.',
    credit: 'Domaine public · Wikimedia Commons'
  },
  {
    id: 'bothereau',
    src: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Robert_Bothereau_en_1936.jpg',
    alt: 'Robert Bothereau en 1936, premier secrétaire général de Force ouvrière.',
    credit: 'Domaine public · Wikimedia Commons'
  },
  {
    id: 'maire',
    src: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Edmond_Maire_par_Claude_Truong-Ngoc.jpeg',
    alt: 'Edmond Maire, secrétaire général de la CFDT 1971-1988.',
    credit: 'Photo Claude Truong-Ngoc · CC BY-SA · Wikimedia Commons'
  },
  {
    id: 'binet',
    src: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Huma2023SophieBinet_2.jpg',
    alt: 'Sophie Binet à la Fête de l’Humanité 2023.',
    credit: 'CC BY-SA · Wikimedia Commons'
  },
  {
    id: 'souillot',
    src: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Fr%C3%A9d%C3%A9ric_Souillot_1_IMG_09352_%28cropped%29.jpg',
    alt: 'Frédéric Souillot, secrétaire général de Force ouvrière depuis 2022.',
    credit: 'CC BY-SA · Wikimedia Commons'
  },
  {
    id: 'seilliere',
    src: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Ernest-Antoine_Seilli%C3%A8re.jpg',
    alt: 'Ernest-Antoine Seillière, président du CNPF puis du MEDEF (1997-2005).',
    credit: 'CC BY-SA · Wikimedia Commons'
  },
  {
    id: 'parisot',
    src: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Laurence-Parisot-Mars-2017-2.jpg',
    alt: 'Laurence Parisot, première femme à présider le MEDEF (2005-2013).',
    credit: 'CC BY-SA · Wikimedia Commons'
  },
  {
    id: 'roux-de-bezieux',
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/27/REF.090_28_08_2019_cRM_I.jpg',
    alt: 'Geoffroy Roux de Bézieux, président du MEDEF (2018-2023).',
    credit: 'CC BY-SA · Wikimedia Commons'
  }
];

const SCENARIO_IMAGES: HistoricalImage[] = [
  {
    id: 'le-chapelier-1791',
    src: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Isaac_Le_Chapelier%2C_l%C3%A9gislateur_de_biribi.jpg',
    alt: 'Portrait de Isaac Le Chapelier, auteur de la loi du 14 juin 1791 abolissant les coalitions.',
    credit: 'Domaine public · Wikimedia Commons'
  },
  {
    id: 'canuts-1831',
    src: 'https://upload.wikimedia.org/wikipedia/commons/1/19/R%C3%A9volte_de_canuts_%C3%A0_Lyon_en_1834.jpg',
    alt: 'La révolte des canuts à Lyon, peinture du XIXe siècle.',
    credit: 'Domaine public · Wikimedia Commons'
  },
  {
    id: 'matignon-1936',
    src: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Rassemblement-populaire-14-juillet-1936_cropped.png',
    alt: 'Le rassemblement populaire du 14 juillet 1936, peu après les accords Matignon.',
    credit: 'Domaine public · Wikimedia Commons'
  },
  {
    id: 'amiens-1906',
    src: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Amiens%2C_rue_Rigollot%2C_plaque_comm%C3%A9morative_de_l%27adoption_de_la_charte_d%27Amiens%2C_le_13_octobre_1906.jpg',
    alt: 'Plaque commémorative de l’adoption de la Charte d’Amiens, le 13 octobre 1906.',
    credit: 'CC BY-SA · Wikimedia Commons'
  },
  {
    id: 'mai-68',
    src: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Le_pouvoir_aux_conseils_de_travailleurs.jpg',
    alt: 'Affiche de Mai 68 : « Le pouvoir aux conseils de travailleurs ».',
    credit: 'Atelier populaire des Beaux-Arts · Wikimedia Commons'
  },
  {
    id: 'medef-1998',
    src: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Si%C3%A8ge_du_MEDEF.jpg',
    alt: 'Siège du MEDEF, avenue Bosquet, Paris.',
    credit: 'CC BY-SA · Wikimedia Commons'
  }
];

const ALL_IMAGES = [...CHARACTER_IMAGES, ...SCENARIO_IMAGES];
const BY_ID = new Map(ALL_IMAGES.map(img => [img.id, img]));

export function imageFor(id: string | undefined | null): HistoricalImage | null {
  if (!id) return null;
  return BY_ID.get(id) ?? null;
}
