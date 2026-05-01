/* Paritas Rebirth — characters.ts
 * Personnages historiques exposables dans les scènes (PNJ).
 * Cf. 00_bibliographie_master.md §4.
 */

import type { Camp } from '../../lib/types';

export interface HistoricalCharacter {
  id: string;
  name: string;
  /** Initiales pour avatar minimal */
  init: string;
  /** Période d'activité affichée */
  years: string;
  side: Camp | 'etat' | 'neutre';
  /** Bio courte */
  bio: string;
}

export const CHARACTERS: HistoricalCharacter[] = [
  /* Salariés / syndicalistes */
  {
    id: 'jouhaux',
    name: 'Léon Jouhaux',
    init: 'LJ',
    years: '1879–1954',
    side: 'salarie',
    bio: 'SG CGT 1909-1947. Prix Nobel de la paix 1951. Cofondateur de FO en 1948.'
  },
  {
    id: 'croizat',
    name: 'Ambroise Croizat',
    init: 'AC',
    years: '1901–1951',
    side: 'salarie',
    bio: 'Ministre du Travail et de la Sécurité sociale 1945-1947. Bâtisseur de la Sécu.'
  },
  {
    id: 'laroque',
    name: 'Pierre Laroque',
    init: 'PL',
    years: '1907–1997',
    side: 'etat',
    bio: 'Haut fonctionnaire gaulliste. Architecte juridique de la Sécurité sociale.'
  },
  {
    id: 'bothereau',
    name: 'Robert Bothereau',
    init: 'RB',
    years: '1901–1985',
    side: 'salarie',
    bio: 'Premier secrétaire général de FO (1948-1963). Réformiste anti-PCF.'
  },
  {
    id: 'maire',
    name: 'Edmond Maire',
    init: 'EM',
    years: '1931–2017',
    side: 'salarie',
    bio: 'SG CFDT 1971-1988. Théoricien de l\'autogestion puis du recentrage.'
  },
  {
    id: 'griffuelhes',
    name: 'Victor Griffuelhes',
    init: 'VG',
    years: '1874–1922',
    side: 'salarie',
    bio: 'SG CGT 1901-1909. Auteur de la Charte d\'Amiens.'
  },

  /* Patronat */
  {
    id: 'villiers',
    name: 'Georges Villiers',
    init: 'GV',
    years: '1899–1982',
    side: 'patron',
    bio: 'Premier président du CNPF (1946-1966). Ancien déporté résistant.'
  },
  {
    id: 'lambert-ribot',
    name: 'Alfred Lambert-Ribot',
    init: 'LR',
    years: '1885–1953',
    side: 'patron',
    bio: 'Délégué général de la Confédération générale du patronat français en 1936. Signataire de Matignon côté patronal.'
  },
  {
    id: 'seilliere',
    name: 'Ernest-Antoine Seillière',
    init: 'ES',
    years: '1937–',
    side: 'patron',
    bio: 'Président CNPF puis MEDEF 1997-2005. Architecte de la "refondation sociale".'
  },

  /* État */
  {
    id: 'le-chapelier',
    name: 'Isaac Le Chapelier',
    init: 'IC',
    years: '1754–1794',
    side: 'etat',
    bio: 'Constituant breton. Loi du 14 juin 1791 interdisant les coalitions. Guillotiné en 1794.'
  },
  {
    id: 'ollivier',
    name: 'Émile Ollivier',
    init: 'EO',
    years: '1825–1913',
    side: 'etat',
    bio: 'Loi du 25 mai 1864 abolissant le délit de coalition.'
  },
  {
    id: 'waldeck-rousseau',
    name: 'Pierre Waldeck-Rousseau',
    init: 'WR',
    years: '1846–1904',
    side: 'etat',
    bio: 'Loi du 21 mars 1884 légalisant les syndicats.'
  },
  {
    id: 'blum',
    name: 'Léon Blum',
    init: 'LB',
    years: '1872–1950',
    side: 'etat',
    bio: 'Président du Conseil 1936-1937. Arbitre des accords Matignon.'
  },
  {
    id: 'auroux',
    name: 'Jean Auroux',
    init: 'JA',
    years: '1942–',
    side: 'etat',
    bio: 'Ministre du Travail 1981-1983. Lois Auroux modifiant 300 articles du Code du travail.'
  }
];

export function characterById(id: string): HistoricalCharacter | undefined {
  return CHARACTERS.find(c => c.id === id);
}
