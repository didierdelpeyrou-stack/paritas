/* ============================================================
   Paritas — personnages legendaires pour la lecture reflechie
   ============================================================ */

import type { Camp, SkillKey, StatKey } from '../types';

export type TheorySchool = 'jeux' | 'harvard' | 'perspectives' | 'agence';

export interface LegendaryPhase {
  id: 'youth' | 'prime' | 'legacy';
  label: string;
  narrative: string;
  trial: string;
  skillFocus: SkillKey[];
}

export interface LegendaryCharacter {
  id: string;
  name: string;
  camp: Camp;
  years: string;
  rarity: 'argent' | 'or' | 'legendaire';
  archetype: string;
  theoryBias: TheorySchool;
  signature: string;
  signatureKind: 'formule-de-jeu' | 'citation-attestee' | 'paraphrase';
  sourceLabel: string;
  sourceUrl: string;
  bio: string;
  skillAffinity: Partial<Record<SkillKey, number>>;
  statBias: Partial<Record<StatKey, number>>;
  phases: LegendaryPhase[];
}

export const LEGENDARY_CHARACTERS: LegendaryCharacter[] = [
  {
    id: 'bastiat',
    name: 'Frederic Bastiat',
    camp: 'patron',
    years: '1801-1850',
    rarity: 'or',
    archetype: 'Liberal de combat',
    theoryBias: 'jeux',
    signature: 'Voir le cout cache derriere chaque concession visible.',
    signatureKind: 'formule-de-jeu',
    sourceLabel: 'Britannica Money - Frederic Bastiat',
    sourceUrl: 'https://www.britannica.com/money/Frederic-Bastiat',
    bio: 'Economiste liberal et parlementaire de la IIe Republique. Dans Paritas, il incarne la lecture par les incitations, les couts caches et le cadrage public.',
    skillAffinity: { politique: 2, baratin: 2, negociation: 1 },
    statBias: { economique: 2, influence: 1, symbolique: 1 },
    phases: [
      { id: 'youth', label: 'Pamphletaire', narrative: 'Il apprend a gagner la bataille du cadrage public.', trial: 'Defendre une position minoritaire sans perdre la legitimite.', skillFocus: ['baratin', 'politique'] },
      { id: 'prime', label: 'Strategiste liberal', narrative: 'Il transforme chaque conflit en arbitrage entre liberte et contrainte.', trial: 'Prouver qu’un accord volontaire cree plus de valeur qu’un rapport de force impose.', skillFocus: ['politique', 'negociation'] },
      { id: 'legacy', label: 'Theoricien des incitations', narrative: 'Il lit les institutions comme des systemes d’incitations.', trial: 'Eviter que la caisse ou la branche ne devienne une rente opaque.', skillFocus: ['expertise', 'politique'] }
    ]
  },
  {
    id: 'schneider',
    name: 'Eugene Schneider',
    camp: 'patron',
    years: '1805-1875',
    rarity: 'legendaire',
    archetype: 'Industriel paternaliste',
    theoryBias: 'agence',
    signature: 'Tenir la production sans rompre le pacte social local.',
    signatureKind: 'formule-de-jeu',
    sourceLabel: 'Archives nationales - Schneider et Cie',
    sourceUrl: 'https://francearchives.gouv.fr/fr/agent/19187269',
    bio: 'Grand patron du Creusot, symbole du paternalisme industriel. Il donne une partie plus forte en production et en caisse, mais expose a la crise de legitimite.',
    skillAffinity: { production: 2, politique: 1, expertise: 1 },
    statBias: { economique: 2, caisse: 2, social: 1 },
    phases: [
      { id: 'youth', label: 'Maitre de forge', narrative: 'Il construit son autorite sur l’emploi, la discipline et l’investissement.', trial: 'Repondre a l’accident industriel sans reconnaitre une faiblesse totale.', skillFocus: ['production', 'expertise'] },
      { id: 'prime', label: 'Patron de systeme', narrative: 'Il comprend que logement, secours et atelier forment une meme organisation.', trial: 'Aligner contremaitres, actionnaires et ouvriers autour d’un compromis minimal.', skillFocus: ['production', 'politique'] },
      { id: 'legacy', label: 'Institution locale', narrative: 'Il devient presque une autorite publique dans son bassin.', trial: 'Eviter que le paternalisme ne bascule en crise de legitimite.', skillFocus: ['politique', 'negociation'] }
    ]
  },
  {
    id: 'mercier',
    name: 'Ernest Mercier',
    camp: 'patron',
    years: '1878-1955',
    rarity: 'or',
    archetype: 'Modernisateur technocrate',
    theoryBias: 'harvard',
    signature: 'Convertir le conflit social en architecture d’organisation.',
    signatureKind: 'formule-de-jeu',
    sourceLabel: 'Encyclopaedia Universalis - Ernest Mercier',
    sourceUrl: 'https://www.universalis.fr/encyclopedie/ernest-mercier/',
    bio: 'Ingenieur, dirigeant et organisateur patronal. Dans le jeu, il pousse vers l’expertise, la negotiation integrative et les compromis institutionnels.',
    skillAffinity: { negociation: 2, expertise: 2, production: 1 },
    statBias: { institutionnel: 2, economique: 1, prestige: 1 },
    phases: [
      { id: 'youth', label: 'Ingenieur organisateur', narrative: 'Il raisonne en reseaux, flux et grands equilibres.', trial: 'Transformer une contrainte sociale en chantier de productivite.', skillFocus: ['expertise', 'production'] },
      { id: 'prime', label: 'Patron moderniste', narrative: 'Il cherche un patronat capable de negocier sans se dissoudre.', trial: 'Elargir le gateau sans donner l’impression de capituler.', skillFocus: ['negociation', 'politique'] },
      { id: 'legacy', label: 'Architecte de compromis', narrative: 'Il laisse une methode : organiser avant que la rue n’impose.', trial: 'Concilier expertise, image publique et mandat patronal.', skillFocus: ['expertise', 'negociation'] }
    ]
  },
  {
    id: 'blanqui',
    name: 'Auguste Blanqui',
    camp: 'salarie',
    years: '1805-1881',
    rarity: 'legendaire',
    archetype: 'Insurge permanent',
    theoryBias: 'jeux',
    signature: 'Faire monter la pression jusqu’au point ou l’autre camp doit choisir.',
    signatureKind: 'formule-de-jeu',
    sourceLabel: 'Larousse - Auguste Blanqui',
    sourceUrl: 'https://www.larousse.fr/encyclopedie/personnage/Louis_Auguste_Blanqui/109315',
    bio: 'Revolutionnaire du XIXe siecle, figure de la rupture et de la prison politique. Il donne beaucoup de mobilisation, mais use la sante collective.',
    skillAffinity: { mobilisation: 2, baratin: 2, politique: 1 },
    statBias: { militant: 2, symbolique: 2, sante: -1 },
    phases: [
      { id: 'youth', label: 'Conspirateur', narrative: 'Il apprend que le secret et le symbole peuvent compenser la faiblesse materielle.', trial: 'Mobiliser avec peu de caisse et beaucoup de risque.', skillFocus: ['mobilisation', 'baratin'] },
      { id: 'prime', label: 'Strategiste de rupture', narrative: 'Il joue le conflit comme un chicken game : ceder, c’est disparaitre.', trial: 'Tenir une greve longue sans bruler la sante collective.', skillFocus: ['mobilisation', 'politique'] },
      { id: 'legacy', label: 'Mythe revolutionnaire', narrative: 'Sa defaite meme peut produire du capital symbolique.', trial: 'Transformer une repression en memoire mobilisatrice.', skillFocus: ['baratin', 'mobilisation'] }
    ]
  },
  {
    id: 'guesde',
    name: 'Jules Guesde',
    camp: 'salarie',
    years: '1845-1922',
    rarity: 'or',
    archetype: 'Doctrine et parti',
    theoryBias: 'agence',
    signature: 'Garder l’agent syndical aligne sur la cause collective.',
    signatureKind: 'formule-de-jeu',
    sourceLabel: 'Assemblee nationale - Jules Guesde',
    sourceUrl: 'https://www2.assemblee-nationale.fr/sycomore/fiche/3638?legislature=35',
    bio: 'Socialiste marxiste et organisateur politique. Il renforce la discipline collective, le mandat et la lecture des conflits d’agence.',
    skillAffinity: { politique: 2, mobilisation: 1, baratin: 1 },
    statBias: { militant: 2, institutionnel: 1, soutien: 1 },
    phases: [
      { id: 'youth', label: 'Propagandiste', narrative: 'Il donne un langage commun a des coleres dispersees.', trial: 'Faire monter la conscience collective sans fermer toute negociation.', skillFocus: ['baratin', 'politique'] },
      { id: 'prime', label: 'Chef de ligne', narrative: 'Il structure le mandat : qui parle, au nom de qui, et jusqu’ou.', trial: 'Eviter que le negociateur ne negocie pour lui-meme.', skillFocus: ['politique', 'mobilisation'] },
      { id: 'legacy', label: 'Gardien doctrinal', narrative: 'Il laisse une discipline collective, mais risque la rigidite.', trial: 'Conserver la base sans perdre les occasions d’accord utile.', skillFocus: ['politique', 'negociation'] }
    ]
  },
  {
    id: 'laroque',
    name: 'Pierre Laroque',
    camp: 'salarie',
    years: '1907-1997',
    rarity: 'legendaire',
    archetype: 'Architecte de protection sociale',
    theoryBias: 'harvard',
    signature: 'Transformer les interets opposes en institution durable.',
    signatureKind: 'formule-de-jeu',
    sourceLabel: 'Vie-publique - creation de la Securite sociale',
    sourceUrl: 'https://www.vie-publique.fr/eclairage/19474-la-securite-sociale-creation-et-fonctionnement',
    bio: 'Haut fonctionnaire associe a l’architecture de la Securite sociale de 1945. Il favorise l’expertise, la confiance et les institutions durables.',
    skillAffinity: { expertise: 2, negociation: 2, politique: 1 },
    statBias: { institutionnel: 2, social: 2, sante: 1 },
    phases: [
      { id: 'youth', label: 'Juriste social', narrative: 'Il apprend que le droit peut rendre la solidarite administrable.', trial: 'Traduire une revendication morale en mecanisme finançable.', skillFocus: ['expertise', 'politique'] },
      { id: 'prime', label: 'Batisseur de caisses', narrative: 'Il pense CPAM, retraite et famille comme une architecture de confiance.', trial: 'Faire accepter la cotisation comme prix d’une securite commune.', skillFocus: ['expertise', 'negociation'] },
      { id: 'legacy', label: 'Memoire institutionnelle', narrative: 'Il rappelle que le paritarisme n’est pas un guichet mais une responsabilite.', trial: 'Proteger l’institution contre l’opacite, le deficit et la capture.', skillFocus: ['expertise', 'negociation'] }
    ]
  }
];

export function mentorForSkill(camp: Camp, skill: SkillKey | undefined): LegendaryCharacter {
  const pool = LEGENDARY_CHARACTERS.filter((character) => character.camp === camp);
  if (!skill) return pool[0]!;
  return pool
    .slice()
    .sort((a, b) => (b.skillAffinity[skill] ?? 0) - (a.skillAffinity[skill] ?? 0))[0]!;
}
