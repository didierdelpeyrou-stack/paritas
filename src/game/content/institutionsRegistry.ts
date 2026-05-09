/**
 * Registre des institutions construites par le joueur.
 * Sert au panneau « Mon œuvre » (UX-N2, effet de dotation Thaler).
 *
 * Chaque entrée : ID stocké dans memory.builtInstitutions, label
 * affichable, année historique, blurb court, sceau (emoji ou char
 * unicode pour faire office de pictogramme jusqu'à ce qu'on dessine
 * de vrais SVGs).
 */

export interface InstitutionRecord {
  id: string;
  label: string;
  year: string;
  blurb: string;
  /** Sceau symbolique — sera remplacé par SVG dans UX-5 plus tard. */
  seal: string;
}

export const INSTITUTIONS: InstitutionRecord[] = [
  {
    id: 'secu-1945',
    label: 'Sécurité sociale',
    year: '1945',
    blurb: 'Ordonnances des 4 et 19 octobre 1945. Maladie, vieillesse, famille — gestion paritaire.',
    seal: '⚕'
  },
  {
    id: 'unedic-1958',
    label: 'Unédic',
    year: '1958',
    blurb: 'Convention nationale interprofessionnelle de l\'assurance chômage.',
    seal: '◈'
  },
  {
    id: 'caisse-mutuelle-1864',
    label: 'Caisse mutuelle',
    year: '1864',
    blurb: 'Société de secours dépénalisée (loi Ollivier).',
    seal: '◊'
  },
  {
    id: 'syndicat-1884',
    label: 'Syndicat professionnel',
    year: '1884',
    blurb: 'Légalisation par la loi Waldeck-Rousseau.',
    seal: '✊'
  },
  {
    id: 'conventions-collectives-1919',
    label: 'Conventions collectives',
    year: '1919',
    blurb: 'Loi du 25 mars : reconnaissance juridique du contrat collectif.',
    seal: '✒'
  },
  {
    id: 'prudhommes',
    label: 'Conseil de prud\'hommes',
    year: '1806 / refonte 1979',
    blurb: 'Juridiction paritaire du droit du travail.',
    seal: '⚖'
  },
  {
    id: 'chsct-1982',
    label: 'CHSCT',
    year: '1982',
    blurb: 'Comité hygiène, sécurité, conditions de travail (lois Auroux).',
    seal: '⛑'
  }
];

const INDEX = new Map(INSTITUTIONS.map(i => [i.id, i]));

export function institutionById(id: string): InstitutionRecord | undefined {
  return INDEX.get(id);
}
