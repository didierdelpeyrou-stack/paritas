/* Paritas Rebirth — legendaryCharacters.ts
 *
 * Personnages légendaires jouables dès l'écran d'accueil.
 * Chaque figure historique vient avec :
 *   - un trait dominant initial (traitBonus)
 *   - des ressources de départ ajustées (resourceBonus)
 *   - une signature (citation iconique)
 *
 * Source : 00_bibliographie_master.md §4 (Personnages historiques).
 */

import type { Camp } from '../../lib/types';
import type { Resources, TraitScores } from '../types';

export interface LegendaryCharacter {
  id: string;
  /** Nom complet affiché */
  name: string;
  /** Initiales pour avatar */
  init: string;
  /** Années d'activité */
  years: string;
  /** Étiquette de période ("Front populaire", "Reconstruction", etc.) */
  era: string;
  /** Camp d'incarnation */
  camp: Camp;
  /** Bio courte (1-2 phrases) */
  blurb: string;
  /** Citation signature, optionnelle */
  signature?: string;
  /** Bonus de traits cumulés au démarrage */
  traitBonus: Partial<TraitScores>;
  /** Bonus de ressources de départ */
  resourceBonus?: Partial<Resources>;
  /** Rareté visuelle */
  rarity: 'or' | 'argent' | 'legendaire';
}

export const LEGENDARY_CHARACTERS: LegendaryCharacter[] = [
  /* ============== CÔTÉ SALARIÉ ============== */
  {
    id: 'jouhaux',
    name: 'Léon Jouhaux',
    init: 'LJ',
    years: '1879 – 1954',
    era: 'CGT, puis FO',
    camp: 'salarie',
    blurb:
      'Secrétaire général de la CGT pendant 38 ans. Bâtisseur des accords Matignon. Participe à la fondation de Force ouvrière en 1947, puis en devient président. Prix Nobel de la paix 1951.',
    signature: 'Tout est possible !',
    traitBonus: { batisseur: 3, pragmatique: 2 },
    resourceBonus: { institution: 8, legitimite: 6 },
    rarity: 'legendaire'
  },
  {
    id: 'croizat',
    name: 'Ambroise Croizat',
    init: 'AC',
    years: '1901 – 1951',
    era: 'Reconstruction',
    camp: 'salarie',
    blurb:
      'Métallurgiste, ministre du Travail 1945-1947. Porte politiquement la mise en œuvre de la Sécurité sociale conçue autour des ordonnances de 1945.',
    signature: 'Chacun cotise selon ses moyens, chacun est couvert selon ses besoins.',
    traitBonus: { batisseur: 3, tribun: 2 },
    resourceBonus: { institution: 10, confiance: 8 },
    rarity: 'legendaire'
  },
  {
    id: 'griffuelhes',
    name: 'Victor Griffuelhes',
    init: 'VG',
    years: '1874 – 1922',
    era: 'Belle Époque',
    camp: 'salarie',
    blurb:
      'Secrétaire général de la CGT 1901-1909. Auteur de la Charte d\'Amiens. Affirme l\'indépendance du syndicalisme vis-à-vis des partis politiques.',
    signature: 'Le syndicalisme se suffit à lui-même.',
    traitBonus: { rupture: 3, tribun: 2 },
    resourceBonus: { rapportDeForce: 10, confiance: 6 },
    rarity: 'or'
  },
  {
    id: 'bothereau',
    name: 'Robert Bothereau',
    init: 'RB',
    years: '1901 – 1985',
    era: 'Guerre froide',
    camp: 'salarie',
    blurb:
      'Premier secrétaire général de FO (1948-1963). Réformiste anti-PCF. Pose la doctrine de l\'indépendance vis-à-vis de tous les pouvoirs.',
    traitBonus: { pragmatique: 3, technocrate: 2 },
    resourceBonus: { legitimite: 8, institution: 4 },
    rarity: 'or'
  },
  {
    id: 'maire',
    name: 'Edmond Maire',
    init: 'EM',
    years: '1931 – 2017',
    era: 'Lois Auroux',
    camp: 'salarie',
    blurb:
      'Secrétaire général CFDT 1971-1988. Théoricien de l\'autogestion puis du recentrage. Visage de la modernisation syndicale.',
    traitBonus: { technocrate: 3, pragmatique: 2 },
    resourceBonus: { legitimite: 10, institution: 4 },
    rarity: 'or'
  },
  {
    id: 'souillot',
    name: 'Frédéric Souillot',
    init: 'FS',
    years: '2022 – ',
    era: 'Macron II',
    camp: 'salarie',
    blurb:
      'Secrétaire général de FO. Voix de la défense des réserves paritaires face à la captation par l\'État.',
    signature:
      'Quand l\'État a besoin d\'argent, il lorgne sur les réserves des institutions paritaires.',
    traitBonus: { batisseur: 2, tribun: 2 },
    resourceBonus: { confiance: 8, rapportDeForce: 6 },
    rarity: 'argent'
  },
  {
    id: 'binet',
    name: 'Sophie Binet',
    init: 'SB',
    years: '2023 – ',
    era: 'Macron II',
    camp: 'salarie',
    blurb:
      'Secrétaire générale de la CGT (depuis mars 2023). Première femme à diriger la CGT.',
    traitBonus: { tribun: 3, rupture: 2 },
    resourceBonus: { confiance: 10, rapportDeForce: 6 },
    rarity: 'argent'
  },

  /* ============== CÔTÉ PATRONAL ============== */
  {
    id: 'lambert-ribot',
    name: 'Alexandre Lambert-Ribot',
    init: 'LR',
    years: '1885 – 1953',
    era: 'Front populaire',
    camp: 'patron',
    blurb:
      'Délégué général de la CGPF en 1936. Signe Matignon contraint et forcé. Maître du compromis défensif.',
    traitBonus: { paternaliste: 2, pragmatique: 3 },
    resourceBonus: { caisse: 12, legitimite: 4 },
    rarity: 'or'
  },
  {
    id: 'villiers',
    name: 'Georges Villiers',
    init: 'GV',
    years: '1899 – 1982',
    era: 'Reconstruction',
    camp: 'patron',
    blurb:
      'Premier président du CNPF (1946-1966). Ancien déporté résistant. Libéralisme d\'ordre. Reconnaît le paritarisme à la française.',
    traitBonus: { paternaliste: 3, batisseur: 2 },
    resourceBonus: { caisse: 10, legitimite: 8 },
    rarity: 'legendaire'
  },
  {
    id: 'seilliere',
    name: 'Ernest-Antoine Seillière',
    init: 'ES',
    years: '1937 – ',
    era: '35h Aubry',
    camp: 'patron',
    blurb:
      'Président CNPF puis MEDEF (1997-2005). Architecte de la « refondation sociale ». Doctrinaire frontal du tournant patronal.',
    traitBonus: { technocrate: 2, rupture: 3 },
    resourceBonus: { rapportDeForce: 12, caisse: 6 },
    rarity: 'legendaire'
  },
  {
    id: 'parisot',
    name: 'Laurence Parisot',
    init: 'LP',
    years: '2005 – 2013',
    era: 'Sarkozy',
    camp: 'patron',
    blurb:
      'Première femme à présider le MEDEF. Modernisation de l\'image patronale, présence médiatique constante.',
    traitBonus: { technocrate: 3, pragmatique: 2 },
    resourceBonus: { legitimite: 10, caisse: 4 },
    rarity: 'or'
  },
  {
    id: 'roux-de-bezieux',
    name: 'Geoffroy Roux de Bézieux',
    init: 'RB',
    years: '2018 – 2023',
    era: 'Macron I',
    camp: 'patron',
    blurb:
      'Président du MEDEF (2018-2023). Entrepreneur tech, doctrine libérale assumée. Traverse COVID et réforme retraites.',
    traitBonus: { technocrate: 3, rupture: 2 },
    resourceBonus: { caisse: 8, legitimite: 6 },
    rarity: 'argent'
  }
];

export function legendaryById(id: string): LegendaryCharacter | undefined {
  return LEGENDARY_CHARACTERS.find(c => c.id === id);
}

export function legendariesByCamp(camp: Camp): LegendaryCharacter[] {
  return LEGENDARY_CHARACTERS.filter(c => c.camp === camp);
}
