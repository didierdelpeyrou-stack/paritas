/* ============================================================
   Paritas — personnages legendaires pour le mode expert
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
  archetype: string;
  theoryBias: TheorySchool;
  signature: string;
  skillAffinity: Partial<Record<SkillKey, number>>;
  statBias: Partial<Record<StatKey, number>>;
  phases: LegendaryPhase[];
}

export const LEGENDARY_CHARACTERS: LegendaryCharacter[] = [
  {
    id: 'bastiat',
    name: 'Frederic Bastiat',
    camp: 'patron',
    archetype: 'Liberal de combat',
    theoryBias: 'jeux',
    signature: 'Voir le cout cache derriere chaque concession visible.',
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
    archetype: 'Industriel paternaliste',
    theoryBias: 'agence',
    signature: 'Tenir la production sans rompre le pacte social local.',
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
    archetype: 'Modernisateur technocrate',
    theoryBias: 'harvard',
    signature: 'Convertir le conflit social en architecture d’organisation.',
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
    archetype: 'Insurge permanent',
    theoryBias: 'jeux',
    signature: 'Faire monter la pression jusqu’au point ou l’autre camp doit choisir.',
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
    archetype: 'Doctrine et parti',
    theoryBias: 'agence',
    signature: 'Garder l’agent syndical aligne sur la cause collective.',
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
    archetype: 'Architecte de protection sociale',
    theoryBias: 'harvard',
    signature: 'Transformer les interets opposes en institution durable.',
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
