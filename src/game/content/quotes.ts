/* Paritas Rebirth — quotes.ts
 * Citations verbatim sourcées, exposables dans les scènes.
 * Cf. 00_bibliographie_master.md §5.
 */

export interface Quote {
  id: string;
  text: string;
  source: string;
  year?: string;
}

export const QUOTES: Quote[] = [
  {
    id: 'canuts-1831',
    text: 'Vivre en travaillant ou mourir en combattant.',
    source: 'Drapeau noir des Canuts',
    year: '21 nov. 1831'
  },
  {
    id: 'le-chapelier-1791',
    text: 'Il n\'y a plus de corporations dans l\'État ; il n\'y a plus que l\'intérêt particulier de chaque individu et l\'intérêt général.',
    source: 'Isaac Le Chapelier',
    year: '14 juin 1791'
  },
  {
    id: 'cnr-doctrine',
    text: 'Chacun cotise selon ses moyens, chacun est couvert selon ses besoins.',
    source: 'Doctrine de la Sécurité sociale (CNR / 1945)'
  },
  {
    id: 'cnr-interesses',
    text: 'Représentants des intéressés.',
    source: 'Programme du CNR',
    year: '15 mars 1944'
  },
  {
    id: 'altereco-paritarisme',
    text: 'Gestion conjointe des organismes sociaux par les syndicats de salariés et les organisations d\'employeurs.',
    source: 'Alternatives Économiques'
  },
  {
    id: 'souillot-2024',
    text: 'Quand l\'État a besoin d\'argent, il lorgne sur les réserves des institutions paritaires.',
    source: 'Frédéric Souillot, FO',
    year: '2024'
  },
  {
    id: 'lemaire-2024',
    text: 'L\'État devrait reprendre la main sur l\'assurance chômage de façon définitive.',
    source: 'Bruno Le Maire',
    year: 'mars 2024'
  },
  {
    id: 'freyssinet-rupture',
    text: 'Rupture intervenue depuis 2017 ; l\'État a remis la recherche de compromis pour imposer des réformes définies unilatéralement.',
    source: 'Jacques Freyssinet, IRES'
  },
  {
    id: 'amiens-suffit',
    text: 'Le syndicalisme se suffit à lui-même.',
    source: 'Charte d\'Amiens',
    year: 'octobre 1906'
  },
  {
    id: 'amiens-greve',
    text: 'La grève générale, c\'est la grève de l\'expropriation capitaliste.',
    source: 'Charte d\'Amiens',
    year: 'octobre 1906'
  },
  {
    id: 'ani-2022',
    text: 'Paritarisme ambitieux adapté aux enjeux du monde du travail en mutation.',
    source: 'ANI',
    year: '14 avril 2022'
  },
  {
    id: 'jouhaux-tout-possible',
    text: 'Tout est possible !',
    source: 'Léon Jouhaux à la sortie de Matignon',
    year: '7 juin 1936'
  }
];

export function quoteById(id: string): Quote | undefined {
  return QUOTES.find(q => q.id === id);
}
