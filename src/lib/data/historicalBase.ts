/* ============================================================
   Paritas — base historique normalisee pour generation
   ============================================================ */

import type { Camp, CapitalKey, ChoiceTag, Effects, ResourceKey, SkillKey } from '../types';

export type HistoricalArc = 'origines' | 'entre-deux-guerres' | 'apres-guerre' | 'extension' | 'xxi';

export type HistoricalConflictType =
  | 'negociation'
  | 'institution'
  | 'greve'
  | 'loi'
  | 'alliance'
  | 'historique'
  | 'succession'
  | 'innovation';

export interface HistoricalMilestone {
  id: string;
  year: string;
  era: number;
  arc: HistoricalArc;
  type: HistoricalConflictType;
  title: string;
  summary: string;
  institution?: string;
  actors: string[];
  camps: Array<Camp | 'any'>;
  tags: ChoiceTag[];
  skills: SkillKey[];
  pressure: Array<ResourceKey | CapitalKey | SkillKey>;
  effectsHint: Effects;
  unlocks?: string;
}

export const HISTORICAL_BASE: HistoricalMilestone[] = [
  {
    id: 'hb-le-chapelier-1791',
    year: '1791',
    era: 0,
    arc: 'origines',
    type: 'loi',
    title: 'Loi Le Chapelier',
    summary: 'L’interdiction des coalitions casse les cadres collectifs, mais les solidarites survivent sous forme clandestine.',
    actors: ['Assemblee constituante', 'ouvriers', 'maitres'],
    camps: ['any'],
    tags: ['refuse', 'institution', 'mobilise'],
    skills: ['mobilisation', 'politique', 'expertise'],
    pressure: ['soutien', 'influence', 'militant'],
    effectsHint: { soutien: 5, mobilisation: 4, influence: -3 },
    unlocks: 'Loi Le Chapelier'
  },
  {
    id: 'hb-ollivier-1864',
    year: '1864',
    era: 1,
    arc: 'origines',
    type: 'loi',
    title: 'Loi Ollivier',
    summary: 'Le delit de coalition est abroge : la greve cesse d’etre automatiquement un crime, sans devenir un droit pleinement protege.',
    actors: ['Emile Ollivier', 'ouvriers', 'employeurs'],
    camps: ['any'],
    tags: ['negocie', 'greve', 'institution'],
    skills: ['politique', 'mobilisation', 'negociation'],
    pressure: ['influence', 'soutien', 'institutionnel'],
    effectsHint: { influence: 5, soutien: 4, institutionnel: 3 },
  },
  {
    id: 'hb-waldeck-1884',
    year: '1884',
    era: 2,
    arc: 'origines',
    type: 'loi',
    title: 'Loi Waldeck-Rousseau',
    summary: 'Les syndicats professionnels deviennent legaux et peuvent sortir de la clandestinite.',
    actors: ['Pierre Waldeck-Rousseau', 'syndicats professionnels'],
    camps: ['any'],
    tags: ['institution', 'mobilise', 'discours'],
    skills: ['politique', 'mobilisation', 'baratin'],
    pressure: ['institutionnel', 'soutien', 'symbolique'],
    effectsHint: { institutionnel: 6, soutien: 5, prestige: 3 },
    unlocks: 'Loi Waldeck-Rousseau'
  },
  {
    id: 'hb-cgt-1895',
    year: '1895',
    era: 2,
    arc: 'origines',
    type: 'alliance',
    title: 'Naissance de la CGT',
    summary: 'Les bourses du travail et federations de metiers cherchent une force confederale commune.',
    actors: ['CGT', 'bourses du travail', 'federations'],
    camps: ['salarie'],
    tags: ['mobilise', 'discours', 'institution'],
    skills: ['mobilisation', 'baratin', 'politique'],
    pressure: ['militant', 'soutien', 'symbolique'],
    effectsHint: { mobilisation: 6, soutien: 5, symbolique: 4 }
  },
  {
    id: 'hb-accidents-1898',
    year: '1898',
    era: 2,
    arc: 'origines',
    type: 'institution',
    title: 'Accidents du travail',
    summary: 'La responsabilite patronale est objectivee : l’accident devient un risque social a organiser.',
    institution: 'reparation des accidents du travail',
    actors: ['employeurs', 'salaries', 'assureurs'],
    camps: ['any'],
    tags: ['institution', 'negocie', 'production'],
    skills: ['expertise', 'negociation', 'production'],
    pressure: ['sante', 'economique', 'institutionnel'],
    effectsHint: { sante: 6, institutionnel: 4, caisse: -3 }
  },
  {
    id: 'hb-retraites-1910',
    year: '1910',
    era: 2,
    arc: 'origines',
    type: 'institution',
    title: 'Retraites ouvrieres et paysannes',
    summary: 'La vieillesse ouvriere entre dans une logique de droits sociaux, encore fragile et contestee.',
    institution: 'retraites ouvrieres et paysannes',
    actors: ['Etat', 'employeurs', 'salaries'],
    camps: ['any'],
    tags: ['signe', 'institution', 'refuse'],
    skills: ['expertise', 'politique', 'negociation'],
    pressure: ['institutionnel', 'social', 'caisse'],
    effectsHint: { institutionnel: 5, social: 4, caisse: -3 }
  },
  {
    id: 'hb-conventions-1919',
    year: '1919',
    era: 2,
    arc: 'entre-deux-guerres',
    type: 'negociation',
    title: 'Conventions collectives',
    summary: 'La loi du 25 mars 1919 donne un cadre juridique aux conventions collectives de travail.',
    institution: 'branches professionnelles',
    actors: ['syndicats', 'organisations patronales'],
    camps: ['any'],
    tags: ['negocie', 'signe', 'institution'],
    skills: ['negociation', 'expertise', 'politique'],
    pressure: ['institutionnel', 'social', 'prestige'],
    effectsHint: { negociation: 5, institutionnel: 5, soutien: 3 }
  },
  {
    id: 'hb-assurances-sociales-1930',
    year: '1930',
    era: 2,
    arc: 'entre-deux-guerres',
    type: 'institution',
    title: 'Assurances sociales',
    summary: 'Les assurances sociales obligatoires installent cotisations partagees et gestion de caisses dans le paysage social.',
    institution: 'assurances sociales',
    actors: ['caisses', 'employeurs', 'assures sociaux'],
    camps: ['any'],
    tags: ['institution', 'signe', 'lobbying'],
    skills: ['expertise', 'politique', 'negociation'],
    pressure: ['institutionnel', 'caisse', 'sante'],
    effectsHint: { institutionnel: 7, sante: 5, caisse: -4 }
  },
  {
    id: 'hb-matignon-1936',
    year: '1936',
    era: 2,
    arc: 'entre-deux-guerres',
    type: 'historique',
    title: 'Accords de Matignon',
    summary: 'La greve sur le tas impose conventions collectives, delegues du personnel et hausses de salaires.',
    institution: 'conventions collectives',
    actors: ['CGT', 'CGPF', 'Leon Blum'],
    camps: ['any'],
    tags: ['signe', 'mobilise', 'greve'],
    skills: ['negociation', 'mobilisation', 'politique'],
    pressure: ['soutien', 'prestige', 'sante'],
    effectsHint: { soutien: 8, prestige: 6, sante: -4 },
    unlocks: 'Accords de Matignon'
  },
  {
    id: 'hb-securite-sociale-1945',
    year: '1945',
    era: 2,
    arc: 'apres-guerre',
    type: 'institution',
    title: 'Ordonnances de securite sociale',
    summary: 'Les ordonnances des 4 et 19 octobre 1945 organisent la Securite sociale et son ambition de generalisation.',
    institution: 'Securite sociale',
    actors: ['Pierre Laroque', 'Alexandre Parodi', 'partenaires sociaux'],
    camps: ['any'],
    tags: ['institution', 'signe', 'memoire'],
    skills: ['expertise', 'politique', 'negociation'],
    pressure: ['institutionnel', 'social', 'sante'],
    effectsHint: { institutionnel: 9, social: 6, expertise: 4 },
    unlocks: 'Securite sociale'
  },
  {
    id: 'hb-cpam-caf-cnav',
    year: '1946',
    era: 2,
    arc: 'apres-guerre',
    type: 'institution',
    title: 'Caisses sociales',
    summary: 'CPAM, CAF et caisses vieillesse donnent une administration concrete aux droits sociaux.',
    institution: 'CPAM, CAF, CNAV',
    actors: ['administrateurs de caisses', 'assures', 'employeurs'],
    camps: ['any'],
    tags: ['institution', 'production', 'negocie'],
    skills: ['expertise', 'production', 'negociation'],
    pressure: ['institutionnel', 'sante', 'economique'],
    effectsHint: { sante: 6, institutionnel: 6, production: 3 }
  },
  {
    id: 'hb-unedic-1958',
    year: '1958',
    era: 2,
    arc: 'apres-guerre',
    type: 'institution',
    title: 'Creation de l’Unedic',
    summary: 'L’assurance chomage devient un terrain central de gestion paritaire entre patronat et syndicats.',
    institution: 'Unedic',
    actors: ['CNPF', 'organisations syndicales'],
    camps: ['any'],
    tags: ['signe', 'institution', 'lobbying'],
    skills: ['negociation', 'expertise', 'politique'],
    pressure: ['institutionnel', 'caisse', 'soutien'],
    effectsHint: { institutionnel: 7, soutien: 4, caisse: -4 }
  },
  {
    id: 'hb-grenelle-1968',
    year: '1968',
    era: 2,
    arc: 'apres-guerre',
    type: 'greve',
    title: 'Accords de Grenelle',
    summary: 'Mai 68 combine conflit massif, hausse salariale et reconnaissance de la section syndicale d’entreprise.',
    institution: 'section syndicale d’entreprise',
    actors: ['CGT', 'CFDT', 'gouvernement', 'patronat'],
    camps: ['any'],
    tags: ['greve', 'signe', 'mobilise'],
    skills: ['mobilisation', 'negociation', 'baratin'],
    pressure: ['mobilisation', 'soutien', 'sante'],
    effectsHint: { soutien: 8, mobilisation: 6, sante: -5 },
    unlocks: 'Grenelle 68'
  },
  {
    id: 'hb-formation-1971',
    year: '1971',
    era: 3,
    arc: 'apres-guerre',
    type: 'innovation',
    title: 'Formation professionnelle continue',
    summary: 'La formation devient une obligation financee, negociee et geree dans des circuits paritaires.',
    institution: 'FAF et OPCA',
    actors: ['branches', 'employeurs', 'salaries'],
    camps: ['any'],
    tags: ['institution', 'production', 'negocie'],
    skills: ['expertise', 'production', 'negociation'],
    pressure: ['expertise', 'institutionnel', 'economique'],
    effectsHint: { expertise: 7, institutionnel: 5, economique: 3 }
  },
  {
    id: 'hb-auroux-1982',
    year: '1982',
    era: 3,
    arc: 'extension',
    type: 'loi',
    title: 'Lois Auroux',
    summary: 'Expression des salaries, NAO et droits collectifs donnent une nouvelle epaisseur au dialogue social.',
    institution: 'NAO et instances representatives',
    actors: ['Jean Auroux', 'syndicats', 'directions'],
    camps: ['any'],
    tags: ['institution', 'discours', 'signe'],
    skills: ['politique', 'baratin', 'negociation'],
    pressure: ['soutien', 'institutionnel', 'social'],
    effectsHint: { soutien: 6, institutionnel: 5, negociation: 3 },
    unlocks: 'Lois Auroux'
  },
  {
    id: 'hb-complementaire-sante-2013',
    year: '2013-2016',
    era: 3,
    arc: 'xxi',
    type: 'negociation',
    title: 'Complementaire sante generalisee',
    summary: 'L’ANI de 2013 prepare l’obligation de couverture complementaire sante pour les salaries a partir de 2016.',
    institution: 'institutions de prevoyance et mutuelles',
    actors: ['partenaires sociaux', 'mutuelles', 'institutions de prevoyance'],
    camps: ['any'],
    tags: ['signe', 'institution', 'negocie'],
    skills: ['negociation', 'expertise', 'politique'],
    pressure: ['sante', 'caisse', 'social'],
    effectsHint: { sante: 7, social: 4, caisse: -4 }
  },
  {
    id: 'hb-representativite-2008',
    year: '2008',
    era: 3,
    arc: 'xxi',
    type: 'loi',
    title: 'Representativite syndicale',
    summary: 'La mesure de l’audience electorale reorganise la legitimite syndicale autour de seuils et resultats.',
    institution: 'elections professionnelles',
    actors: ['syndicats', 'employeurs', 'Etat'],
    camps: ['any'],
    tags: ['institution', 'discours', 'lobbying'],
    skills: ['politique', 'baratin', 'expertise'],
    pressure: ['soutien', 'prestige', 'institutionnel'],
    effectsHint: { prestige: 5, institutionnel: 5, soutien: 3 },
    unlocks: 'Representativite 2008'
  },
  {
    id: 'hb-opco-2018',
    year: '2018-2019',
    era: 3,
    arc: 'xxi',
    type: 'innovation',
    title: 'Des OPCA aux OPCO',
    summary: 'La loi Avenir professionnel transforme les collecteurs paritaires en operateurs de competences, agrees en 2019.',
    institution: 'OPCO',
    actors: ['branches professionnelles', 'operateurs de competences', 'Etat'],
    camps: ['any'],
    tags: ['institution', 'production', 'lobbying'],
    skills: ['expertise', 'production', 'politique'],
    pressure: ['expertise', 'institutionnel', 'economique'],
    effectsHint: { expertise: 6, production: 4, institutionnel: 4 }
  },
  {
    id: 'hb-cse-2017',
    year: '2017-2018',
    era: 3,
    arc: 'xxi',
    type: 'loi',
    title: 'Comite social et economique',
    summary: 'Les ordonnances du 22 septembre 2017 creent le CSE, fusionnant les anciennes instances representatives.',
    institution: 'CSE',
    actors: ['elus du personnel', 'directions', 'organisations syndicales'],
    camps: ['any'],
    tags: ['institution', 'negocie', 'refuse'],
    skills: ['expertise', 'negociation', 'politique'],
    pressure: ['institutionnel', 'soutien', 'sante'],
    effectsHint: { institutionnel: 5, expertise: 4, soutien: -2 },
    unlocks: 'CSE'
  },
  {
    id: 'hb-retraites-2023',
    year: '2023',
    era: 3,
    arc: 'xxi',
    type: 'greve',
    title: 'Reforme des retraites',
    summary: 'Le report de l’age legal a 64 ans rallume le debat sur legitimite sociale, gouvernance et financement.',
    institution: 'regimes de retraite',
    actors: ['intersyndicale', 'gouvernement', 'employeurs'],
    camps: ['any'],
    tags: ['mobilise', 'refuse', 'negocie'],
    skills: ['mobilisation', 'politique', 'negociation'],
    pressure: ['soutien', 'militant', 'caisse'],
    effectsHint: { mobilisation: 7, soutien: 5, sante: -5 },
    unlocks: 'Intersyndicale 2023'
  },
  {
    id: 'hb-teletravail-covid',
    year: '2020-2022',
    era: 3,
    arc: 'xxi',
    type: 'innovation',
    title: 'Teletravail et crise sanitaire',
    summary: 'Les accords de teletravail deviennent un test de confiance, de controle et de sante au travail.',
    institution: 'accords de teletravail',
    actors: ['CSE', 'directions RH', 'salaries'],
    camps: ['any'],
    tags: ['negocie', 'institution', 'production'],
    skills: ['negociation', 'expertise', 'production'],
    pressure: ['sante', 'production', 'social'],
    effectsHint: { sante: 5, production: 4, social: 3 }
  },
  {
    id: 'hb-transition-ecologique',
    year: '2020-2026',
    era: 3,
    arc: 'xxi',
    type: 'innovation',
    title: 'Transition ecologique negociee',
    summary: 'Les branches doivent articuler emplois, competences et contraintes climatiques sans casser le contrat social.',
    institution: 'branches professionnelles',
    actors: ['branches', 'OPCO', 'CSE', 'collectivites'],
    camps: ['any'],
    tags: ['negocie', 'institution', 'production'],
    skills: ['expertise', 'negociation', 'production'],
    pressure: ['expertise', 'social', 'economique'],
    effectsHint: { expertise: 6, social: 4, caisse: -3 }
  }
];
