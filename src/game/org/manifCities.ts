/**
 * Catalogue des villes pour la carte stratégique des manifestations.
 * Chaque ville porte sa propre tradition mobilisatrice et un poids
 * spécifique : Paris pour la visibilité nationale, Lyon pour la mémoire
 * canuts/CFDT, Marseille pour les ports, Lille pour les mineurs et le
 * textile, etc. Les combinaisons activent des bonus.
 */

export interface ManifCity {
  id: string;
  name: string;
  tradition: string;
  /** Coordonnées dans le viewBox 100×100 (notre silhouette de France stylisée). */
  x: number;
  y: number;
  /** Poids relatif de la mobilisation (1 = standard). */
  weight: number;
  /** Coût supplémentaire en caisse pour intégrer cette ville. */
  cost: number;
}

export const MANIF_CITIES: ManifCity[] = [
  {
    id: 'paris',
    name: 'Paris',
    tradition: 'CGT et intersyndicale, République / Bastille / Nation. Visibilité nationale.',
    x: 50,
    y: 26,
    weight: 1.6,
    cost: 6
  },
  {
    id: 'lyon',
    name: 'Lyon',
    tradition: 'Mémoire canuts, CFDT historique. Croix-Rousse, Place Bellecour.',
    x: 67,
    y: 55,
    weight: 1.1,
    cost: 4
  },
  {
    id: 'marseille',
    name: 'Marseille',
    tradition: 'Ports, dockers, métallurgie. Vieux-Port, traditionnellement combative.',
    x: 70,
    y: 80,
    weight: 1.1,
    cost: 4
  },
  {
    id: 'lille',
    name: 'Lille',
    tradition: 'Mineurs et textile, mémoire des coups durs. Grand-Place, République.',
    x: 56,
    y: 8,
    weight: 1.05,
    cost: 4
  },
  {
    id: 'toulouse',
    name: 'Toulouse',
    tradition: 'Aérospatiale, Sud-Aviation, FNAC. Traditionnellement à gauche.',
    x: 44,
    y: 76,
    weight: 0.95,
    cost: 3
  },
  {
    id: 'bordeaux',
    name: 'Bordeaux',
    tradition: 'Tertiaire, viticulture. Mobilisation discrète mais persistante.',
    x: 31,
    y: 65,
    weight: 0.85,
    cost: 3
  },
  {
    id: 'nantes',
    name: 'Nantes',
    tradition: 'Chantiers navals, métallurgie. Mai 68 régional, manifestations longues.',
    x: 22,
    y: 42,
    weight: 0.95,
    cost: 3
  },
  {
    id: 'rennes',
    name: 'Rennes',
    tradition: 'Étudiants, fonction publique, Citroën. Manifestations jeunes.',
    x: 19,
    y: 33,
    weight: 0.85,
    cost: 3
  },
  {
    id: 'strasbourg',
    name: 'Strasbourg',
    tradition: 'Frontière, paritarisme alsacien-mosellan particulier. Plus institutionnel.',
    x: 86,
    y: 26,
    weight: 0.8,
    cost: 3
  }
];

/** Combos historiques qui débloquent un bonus narratif. */
export interface CityCombo {
  id: string;
  cities: string[];
  label: string;
  description: string;
  /** Bonus appliqué au score brut (0-100). */
  scoreBonus: number;
}

export const CITY_COMBOS: CityCombo[] = [
  {
    id: 'axe-historique',
    cities: ['paris', 'lyon', 'marseille'],
    label: 'Axe historique',
    description: 'Paris + Lyon + Marseille : la diagonale ouvrière classique.',
    scoreBonus: 12
  },
  {
    id: 'arc-industriel',
    cities: ['lille', 'paris', 'lyon'],
    label: 'Arc industriel',
    description: 'Lille + Paris + Lyon : axe métallurgique et grands sites.',
    scoreBonus: 10
  },
  {
    id: 'facade-atlantique',
    cities: ['rennes', 'nantes', 'bordeaux'],
    label: 'Façade atlantique',
    description: 'Rennes + Nantes + Bordeaux : ouest mobilisé, surprise nationale.',
    scoreBonus: 9
  },
  {
    id: 'national-eclair',
    cities: ['paris', 'lyon', 'marseille', 'lille', 'toulouse'],
    label: 'Mobilisation nationale',
    description: 'Cinq grandes villes en simultané : la grève prend le pays entier.',
    scoreBonus: 18
  }
];

export function findCombosFor(cityIds: string[]): CityCombo[] {
  const setIds = new Set(cityIds);
  return CITY_COMBOS.filter(c => c.cities.every(x => setIds.has(x)));
}
