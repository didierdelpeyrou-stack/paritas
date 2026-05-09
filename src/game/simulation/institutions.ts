/* Paritas Rebirth — institutions.ts
 * Catalogue des institutions paritaires que le joueur peut construire/défendre.
 */

export interface InstitutionDef {
  id: string;
  name: string;
  /** Année de création historique */
  year: string;
  /** Description courte */
  desc: string;
}

export const INSTITUTIONS: InstitutionDef[] = [
  {
    id: 'collegia',
    name: 'Collegia romains',
    year: '~300 av. J.-C.',
    desc: 'Associations professionnelles autorisées par le Sénat romain.'
  },
  {
    id: 'corporations-medievales',
    name: 'Corporations',
    year: '1268',
    desc: 'Livre des métiers d\'Étienne Boileau. 96 corps codifiés.'
  },
  {
    id: 'prudhommes',
    name: 'Conseils de prud\'hommes',
    year: '1806',
    desc: 'Arbitrage gratuit patron/ouvrier.'
  },
  {
    id: 'caisse-mutuelle-1864',
    name: 'Caisses de secours mutuel',
    /* BUG-2 (Paritas-QA 2026-05-10) : 1864 = loi Ollivier sur la
       coalition (25 mai 1864), ce qui dépénalise les regroupements
       ouvriers et permet aux caisses informelles de prospérer.
       Les sociétés de secours mutuel existaient déjà (décret 26 mars
       1852) ; la Charte de la mutualité est posée par la loi du
       1er avril 1898. Le marqueur '1864+' couvre donc le contexte
       de coalition autorisée → essor mutualiste. */
    year: '1864 → 1898',
    desc: 'Loi Ollivier 1864 + Charte de la mutualité 1898. Solidarité ouvrière post-Le Chapelier.'
  },
  {
    id: 'syndicat-1884',
    name: 'Syndicats légalisés',
    year: '1884',
    desc: 'Loi Waldeck-Rousseau.'
  },
  {
    id: 'cgt-1895',
    name: 'CGT',
    year: '1895',
    desc: 'Première confédération interprofessionnelle.'
  },
  {
    id: 'conventions-collectives-1919',
    name: 'Conventions collectives',
    year: '1919',
    desc: 'Loi du 25 mars 1919.'
  },
  {
    id: 'matignon-1936',
    name: 'Accords de Matignon',
    year: '1936',
    desc: '40h, congés payés, délégués du personnel.'
  },
  {
    id: 'secu-1945',
    name: 'Sécurité sociale',
    year: '1945',
    desc: 'Ordonnances des 4 et 19 octobre 1945. Croizat / Laroque / Parodi.'
  },
  {
    id: 'unedic-1958',
    name: 'Unédic',
    year: '1958',
    desc: 'Assurance chômage paritaire.'
  },
  {
    id: 'action-logement-1953',
    name: 'Action Logement',
    year: '1953',
    desc: '1% Logement.'
  },
  {
    id: 'agirc-arrco',
    name: 'Agirc-Arrco',
    year: '1947 / 1961',
    desc: 'Retraites complémentaires paritaires.'
  },
  {
    id: 'chsct-1982',
    name: 'CHSCT',
    year: '1982',
    desc: 'Loi Auroux du 23 décembre.'
  }
];

export function institutionById(id: string): InstitutionDef | undefined {
  return INSTITUTIONS.find(i => i.id === id);
}
