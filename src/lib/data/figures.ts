/* Paritas — Carnet de l'historien : figures collectionnables */

import type { Figure } from '../types';

export const FIGURES: Figure[] = [
  { id: 'boileau', nom: 'Étienne Boileau', yr: 'v.1200-1270', init: 'EB', rarete: 'argent',
    bio: 'Prévôt de Paris sous Saint Louis, auteur du Livre des métiers (1268), première codification écrite des règlements corporatifs.',
    unlocks: ['Le Livre des métiers'], bonus: { expertise: 5 } },
  { id: 'lechapelier', nom: 'Le Chapelier', yr: '1754-1794', init: 'LC', rarete: 'or',
    bio: "Député breton, auteur de la loi du 14 juin 1791 interdisant les coalitions ouvrières et les corporations.",
    unlocks: ['Loi Le Chapelier'], bonus: { politique: 6 } },
  { id: 'louisblanc', nom: 'Louis Blanc', yr: '1811-1882', init: 'LB', rarete: 'or',
    bio: "Socialiste, membre du gouvernement provisoire de 1848. Préside la Commission du Luxembourg, première instance paritaire moderne.",
    unlocks: ['Commission du Luxembourg'], bonus: { baratin: 6 } },
  { id: 'waldeck', nom: 'P. Waldeck-Rousseau', yr: '1846-1904', init: 'WR', rarete: 'or',
    bio: "Ministre de l'Intérieur, fait voter la loi du 21 mars 1884 légalisant les syndicats professionnels.",
    unlocks: ['Loi Waldeck-Rousseau'], bonus: { politique: 8 } },
  { id: 'griffuelhes', nom: 'Victor Griffuelhes', yr: '1874-1922', init: 'VG', rarete: 'or',
    bio: "Secrétaire général de la CGT (1901-1909), principal rédacteur de la Charte d'Amiens (1906).",
    unlocks: ["Charte d'Amiens"], bonus: { mobilisation: 8 } },
  { id: 'jouhaux', nom: 'Léon Jouhaux', yr: '1879-1954', init: 'LJ', rarete: 'legendaire',
    bio: "Secrétaire général de la CGT (1909-1947). Signataire des accords de Matignon. Prix Nobel de la paix 1951.",
    unlocks: ['Accords de Matignon'], bonus: { negociation: 10, prestige: 5 } },
  { id: 'detoeuf', nom: 'Auguste Detoeuf', yr: '1883-1947', init: 'AD', rarete: 'or',
    bio: "Polytechnicien, président d'Alsthom. Figure du patronat éclairé de l'entre-deux-guerres, X-Crise.",
    unlocks: ['Patronat éclairé'], bonus: { politique: 5, production: 5 } },
  { id: 'croizat', nom: 'Ambroise Croizat', yr: '1901-1951', init: 'AC', rarete: 'legendaire',
    bio: 'Métallurgiste, ministre du Travail (1945-1947). Met en place la Sécurité sociale et les comités d\'entreprise.',
    unlocks: ['Sécurité sociale'], bonus: { politique: 8, mobilisation: 5 } },
  { id: 'laroque', nom: 'Pierre Laroque', yr: '1907-1997', init: 'PL', rarete: 'or',
    bio: "Conseiller d'État, architecte technique de la Sécurité sociale (ordonnances 4 et 19 octobre 1945).",
    unlocks: ['Plan Laroque'], bonus: { expertise: 10 } },
  { id: 'frachon', nom: 'Benoît Frachon', yr: '1893-1975', init: 'BF', rarete: 'or',
    bio: 'Secrétaire général de la CGT, communiste. Figure des grèves de 1936 et 1968.',
    unlocks: ['Grenelle 68'], bonus: { mobilisation: 8 } },
  { id: 'maire', nom: 'Edmond Maire', yr: '1931-2017', init: 'EM', rarete: 'or',
    bio: "Secrétaire général de la CFDT (1971-1988). Théoricien du syndicalisme contractuel.",
    unlocks: ['CFDT moderne'], bonus: { negociation: 8 } },
  { id: 'auroux', nom: 'Jean Auroux', yr: 'né 1942', init: 'JA', rarete: 'or',
    bio: 'Ministre du Travail (1981-1982). Auteur des quatre lois de 1982 : NAO, CHSCT, droit d\'expression, droit de retrait.',
    unlocks: ['Lois Auroux'], bonus: { expertise: 8 } },
  { id: 'notat', nom: 'Nicole Notat', yr: 'née 1947', init: 'NN', rarete: 'or',
    bio: 'Secrétaire générale de la CFDT (1992-2002). Signataire de la réforme Juppé (1995).',
    unlocks: ['Refondation sociale'], bonus: { negociation: 8, prestige: 3 } },
  { id: 'berger', nom: 'Laurent Berger', yr: 'né 1968', init: 'LBe', rarete: 'argent',
    bio: "Secrétaire général de la CFDT (2012-2023). Architecte de l'intersyndicale unie contre la réforme des retraites de 2023.",
    unlocks: ['Intersyndicale 2023'], bonus: { negociation: 6, mobilisation: 6 } }
];

export const FIG_BY_UNLOCK: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  FIGURES.forEach(f => f.unlocks.forEach(u => { m[u] = f.id; }));
  return m;
})();
