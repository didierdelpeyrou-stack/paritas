/* ============================================================
   Paritas — Catalogue d'actions du moteur d'orchestration
   ============================================================
   17 actions définies, regroupées en 5 catégories. Chaque action
   a son coût, ses effets, ses préconditions, son cooldown.

   Vague β — squelette MVP. Les valeurs numériques sont des
   estimations à ajuster en playtest.
   ============================================================ */

import type { ActionDef } from './types';

export const ACTIONS: ActionDef[] = [

  /* ===== MOBILISATION ===== */
  {
    id: 'manifestation',
    label: 'Organiser une manifestation',
    description: 'Mobilise la base dans la rue. Coûteux mais visible.',
    icon: 'poing',
    accent: '#D9821C',
    category: 'mobilisation',
    cost: { caisse: 15, mandat: 8, temps: 2, talents: { terrain: 1 } },
    effects: {
      resources: { rapportDeForce: +12, legitimite: +5, caisse: -15 },
      actors: { adversaire: { pressure: +15 }, opinion: { trust: +5 } },
      narrative: 'Le cortège défile. Banderoles, slogans, médias.'
    },
    effectsFail: {
      resources: { rapportDeForce: -8, legitimite: -10, santeSociale: -5 },
      narrative: 'Heurts avec les forces de l\'ordre. La presse retient les images.'
    },
    failProbability: 0.20,
    cooldown: 4,
    preconditions: [{ kind: 'turn-min', turn: 8 }],
    opensMinigame: 'manifestation',
    journalTag: 'manif'
  },

  {
    id: 'meeting',
    label: 'Tenir un meeting public',
    description: 'Discours devant 800 à 3000 personnes. Le public te juge en temps réel.',
    icon: 'pupitre',
    accent: '#5C2D5C',
    category: 'mobilisation',
    cost: { caisse: 8, mandat: 3, temps: 1, talents: { mediatique: 1 } },
    effects: {
      resources: { confiance: +10, legitimite: +6 },
      actors: { base: { trust: +5 } },
      narrative: 'Le micro s\'allume. La salle écoute.'
    },
    effectsFail: {
      resources: { confiance: -8, legitimite: -5 },
      narrative: 'Silence poli. Trois personnes applaudissent. La séance se termine froidement.'
    },
    failProbability: 0.18,
    cooldown: 3,
    preconditions: [{ kind: 'turn-min', turn: 12 }],
    opensMinigame: 'meeting',
    journalTag: 'meeting'
  },

  {
    id: 'tracts',
    label: 'Distribuer des tracts',
    description: 'Tirage et distribution de tracts à la sortie d\'usine ou sur les marchés.',
    icon: 'tract',
    accent: '#7A5C3A',
    category: 'mobilisation',
    cost: { caisse: 3, mandat: 1, temps: 1 },
    effects: {
      resources: { confiance: +3, legitimite: +2, rapportDeForce: +1 },
      actors: { base: { trust: +2 }, opinion: { trust: +1 } },
      narrative: '500 tracts distribués. Quelques-uns finiront dans les filets, d\'autres dans les poches.'
    },
    failProbability: 0.05,
    cooldown: 1,
    preconditions: [{ kind: 'turn-min', turn: 4 }],
    journalTag: 'tracts'
  },

  {
    id: 'affiches',
    label: 'Coller une campagne d\'affiches',
    description: 'Colleurs nocturnes, papier indigeste, encre qui tient une semaine.',
    icon: 'affiche',
    accent: '#993D1A',
    category: 'mobilisation',
    cost: { caisse: 6, mandat: 2, temps: 1 },
    effects: {
      resources: { legitimite: +4, rapportDeForce: +3 },
      actors: { opinion: { trust: +4, pressure: +2 } },
      narrative: 'Au matin, la ville est tapissée. La police arrache, mais d\'autres restent.'
    },
    cooldown: 2,
    preconditions: [{ kind: 'turn-min', turn: 6 }],
    journalTag: 'affiches'
  },

  /* ===== INSTITUTIONNEL ===== */

  {
    id: 'table',
    label: 'Ouvrir La Table des Négociations',
    description: 'Convoque les 4 architectes. Sécurité sociale, Matignon, ANI, Ordonnances.',
    icon: 'balance',
    accent: '#C9B26A',
    category: 'institutionnel',
    cost: { mandat: 15, temps: 3, talents: { negociation: 2 } },
    effects: {
      narrative: 'La séance s\'ouvre. Quatre fauteuils, quatre lignes rouges. Dans une autre fenêtre.'
    },
    cooldown: 8,
    preconditions: [{ kind: 'turn-min', turn: 18 }],
    opensMinigame: 'table',
    journalTag: 'table'
  },

  {
    id: 'signature',
    label: 'Signer un accord',
    description: 'Geste manuscrit. Plume, sceau de cire, témoins. Engage durablement.',
    icon: 'signature',
    accent: '#7A1E1B',
    category: 'institutionnel',
    cost: { mandat: 10, temps: 1 },
    effects: {
      resources: { legitimite: +12, institution: +15, rapportDeForce: -3 },
      flag: 'accord_signe',
      narrative: 'La plume gratte le papier vélin. Le sceau tombe. C\'est fait.'
    },
    cooldown: 5,
    preconditions: [{ kind: 'turn-min', turn: 10 }],
    opensMinigame: 'signature',
    journalTag: 'signature'
  },

  {
    id: 'delegation',
    label: 'Envoyer une délégation au pouvoir',
    description: 'Trois représentants au ministère, à l\'Élysée, à Matignon.',
    icon: 'delegation',
    accent: '#1E5C8A',
    category: 'institutionnel',
    cost: { caisse: 10, mandat: 6, temps: 2, talents: { negociation: 1 } },
    effects: {
      resources: { legitimite: +8, institution: +5 },
      actors: { etat: { trust: +6, pressure: -3 } },
      narrative: 'La délégation est reçue. Café et silences calculés.'
    },
    effectsFail: {
      resources: { legitimite: -5, institution: -3 },
      actors: { etat: { trust: -4 } },
      narrative: 'La délégation attend deux heures dans l\'antichambre. On lui fait dire qu\'on est en réunion.'
    },
    failProbability: 0.25,
    cooldown: 5,
    preconditions: [{ kind: 'turn-min', turn: 14 }],
    journalTag: 'delegation'
  },

  {
    id: 'congres',
    label: 'Tenir un congrès interne',
    description: 'Présenter ton mandat à 8 délégations. Vote final.',
    icon: 'urne',
    accent: '#8B1F1B',
    category: 'institutionnel',
    cost: { caisse: 25, mandat: 5, temps: 3 },
    effects: {
      resources: { confiance: +15, cohesionInterne: +20, legitimite: +10 },
      flag: 'congres_renouvele',
      narrative: 'Tu es renouvelé·e dans tes fonctions. La confiance interne se renforce.'
    },
    effectsFail: {
      resources: { confiance: -25, cohesionInterne: -30 },
      narrative: 'Vote contesté. Tu termines le mandat sous pression interne.'
    },
    failProbability: 0.30,
    cooldown: 24,  // 1 fois par "période" de mandat (~5-7 ans)
    preconditions: [{ kind: 'turn-min', turn: 20 }],
    opensMinigame: 'congres',
    journalTag: 'congres'
  },

  /* ===== FINANCE / RH ===== */

  {
    id: 'tresorerie',
    label: 'Allouer le budget',
    description: 'Le bureau du trésorier. Salaires, caisse de grève, formation, mutuelle.',
    icon: 'sceau',
    accent: '#C9B26A',
    category: 'finance',
    cost: { mandat: 3, temps: 1 },
    effects: {
      resources: { caisse: +20, institution: +3 },
      narrative: 'Les enveloppes sont scellées. Le grand livre se referme.'
    },
    cooldown: 12,  // annuel
    preconditions: [{ kind: 'turn-min', turn: 1 }],
    opensMinigame: 'tresorerie',
    journalTag: 'tresorerie'
  },

  {
    id: 'recrutement',
    label: 'Lancer une campagne de recrutement',
    description: 'Bureaux ouverts, démarchage usine, premières adhésions.',
    icon: 'recrutement',
    accent: '#3A6B47',
    category: 'finance',
    cost: { caisse: 8, mandat: 4, temps: 2 },
    effects: {
      resources: { confiance: +8, cohesionInterne: +6 },
      actors: { base: { trust: +5 } },
      narrative: 'Trente nouveaux camarades signent leur première carte. Le mouvement grandit.'
    },
    cooldown: 6,
    preconditions: [{ kind: 'turn-min', turn: 6 }],
    journalTag: 'recrutement'
  },

  {
    id: 'lockout',
    label: 'Décréter un lock-out',
    description: 'Patron : ferme l\'usine. Affame la grève.',
    icon: 'lockout',
    accent: '#5A2F1C',
    category: 'finance',
    cost: { caisse: 35, mandat: 18, temps: 3 },
    effects: {
      resources: { rapportDeForce: +20, legitimite: -15, santeSociale: -12 },
      actors: { adversaire: { pressure: -10, patience: -8 }, opinion: { trust: -8 } },
      narrative: 'Les portes de la manufacture se ferment. Trois cents ouvriers à la rue.'
    },
    cooldown: 10,
    preconditions: [
      { kind: 'turn-min', turn: 14 },
      { kind: 'camp-only', camp: 'patron' }
    ],
    journalTag: 'lockout'
  },

  /* ===== COMMUNICATION ===== */

  {
    id: 'presse',
    label: 'Publier un article de presse',
    description: 'Le Petit Parisien, L\'Humanité, Le Monde — selon époque.',
    icon: 'presse',
    accent: '#5C2D5C',
    category: 'communication',
    cost: { caisse: 12, mandat: 4, temps: 1, talents: { mediatique: 1 } },
    effects: {
      resources: { legitimite: +10, confiance: +5 },
      actors: { opinion: { trust: +8 } },
      narrative: 'L\'article paraît à la une. Trois lecteurs sur dix le lisent en entier.'
    },
    effectsFail: {
      resources: { legitimite: -6 },
      narrative: 'L\'article est censuré ou retourné contre toi. Le journal coupe les passages clés.'
    },
    failProbability: 0.15,
    cooldown: 4,
    preconditions: [{ kind: 'turn-min', turn: 10 }],
    journalTag: 'presse'
  },

  {
    id: 'petition',
    label: 'Lancer une pétition',
    description: 'Chaque signature compte. 10 000, 50 000, 100 000…',
    icon: 'petition',
    accent: '#7A5C3A',
    category: 'communication',
    cost: { caisse: 5, mandat: 2, temps: 2, talents: { terrain: 1 } },
    effects: {
      resources: { legitimite: +6, confiance: +4 },
      actors: { opinion: { trust: +6, pressure: +3 } },
      narrative: 'Les feuilles circulent. Bureaux, marchés, sorties d\'écoles.'
    },
    cooldown: 6,
    preconditions: [{ kind: 'turn-min', turn: 8 }],
    opensMinigame: 'petition',
    journalTag: 'petition'
  },

  {
    id: 'boycott',
    label: 'Appeler au boycott',
    description: 'Geste fort, risque social. La cible peut riposter.',
    icon: 'boycott',
    accent: '#B0181E',
    category: 'communication',
    cost: { mandat: 12, temps: 2, talents: { mediatique: 1, terrain: 1 } },
    effects: {
      resources: { rapportDeForce: +10, legitimite: +5 },
      actors: { adversaire: { trust: -12, pressure: +18 } },
      narrative: 'L\'appel au boycott est lancé. Les rayons se vident.'
    },
    effectsFail: {
      resources: { legitimite: -15, confiance: -8 },
      actors: { opinion: { trust: -10 } },
      narrative: 'Le boycott s\'essouffle en 5 jours. La cible a la presse de son côté.'
    },
    failProbability: 0.30,
    cooldown: 8,
    preconditions: [{ kind: 'turn-min', turn: 15 }],
    journalTag: 'boycott'
  },

  /* ===== ORGANISATION ===== */

  {
    id: 'organisation',
    label: 'Aménager le siège',
    description: 'Le Bureau, l\'Imprimerie, l\'École, la Médiathèque, le Café militant.',
    icon: 'bourse',
    accent: '#993D1A',
    category: 'organisation',
    cost: { caisse: 30, mandat: 5, temps: 2 },
    effects: {
      resources: { institution: +12 },
      narrative: 'Le bâtiment grandit. Une pièce de plus au siège.'
    },
    cooldown: 8,
    preconditions: [{ kind: 'turn-min', turn: 12 }],
    opensMinigame: 'organisation',
    journalTag: 'organisation'
  },

  {
    id: 'talents',
    label: 'Former un talent',
    description: 'École syndicale. Juridique, médiatique, négociation, terrain.',
    icon: 'cocarde',
    accent: '#3A6B47',
    category: 'organisation',
    cost: { caisse: 15, mandat: 4, temps: 2 },
    effects: {
      resources: { institution: +6, cohesionInterne: +4 },
      narrative: 'Un nouveau cadre formé. Il pourra siéger en commission paritaire.'
    },
    cooldown: 6,
    preconditions: [{ kind: 'turn-min', turn: 8 }],
    opensMinigame: 'talents',
    journalTag: 'talents'
  },

  {
    id: 'monde',
    label: 'Déployer une section régionale',
    description: 'Carte de France + Europe. Drapeaux, accords transfrontaliers.',
    icon: 'hexagone',
    accent: '#1E5C8A',
    category: 'organisation',
    cost: { caisse: 20, mandat: 8, temps: 2 },
    effects: {
      resources: { confiance: +6, institution: +5 },
      narrative: 'Une nouvelle section est ouverte en région. Le drapeau est planté.'
    },
    cooldown: 10,
    preconditions: [{ kind: 'turn-min', turn: 30 }],
    opensMinigame: 'monde',
    journalTag: 'monde'
  }
];

/* ====== Helpers ====== */

export function actionsByCategory(): Record<string, ActionDef[]> {
  const out: Record<string, ActionDef[]> = {};
  for (const a of ACTIONS) {
    if (!out[a.category]) out[a.category] = [];
    out[a.category]!.push(a);
  }
  return out;
}

export function findAction(id: string): ActionDef | undefined {
  return ACTIONS.find(a => a.id === id);
}
