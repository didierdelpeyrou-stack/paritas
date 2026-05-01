import type { Camp } from '../../lib/types';
import type { PlayerOrganization } from '../org/types';
import type { StrategyDefinition } from './types';

export const STRATEGIES: StrategyDefinition[] = [
  {
    id: 'compromis-branche',
    label: 'Compromis de branche',
    description: 'Préparer un accord qui dépasse l’atelier et stabilise la profession.',
    unlockTurn: 18,
    target: 'institution',
    duration: 4,
    risk: 18,
    costPerTurn: { treasury: 3, resource: { rapportDeForce: -1 } },
    progressWeights: { legalTeam: 2.2, permanentStaff: 1.5, reputation: 0.35, cohesion: 0.25 },
    success: {
      orgDelta: { reputation: 5, cohesion: 3 },
      resourceDelta: { institution: 10, legitimite: 6, confiance: 2 },
      actorDelta: { adversaire: { trust: 6 }, etat: { trust: 5 }, base: { patience: 4 } },
      narrative: 'Le compromis prend forme avant même la réunion finale. Les acteurs savent déjà quels mots pourront tenir.'
    },
    failure: {
      orgDelta: { cohesion: -4, reputation: -3 },
      resourceDelta: { institution: -4, confiance: -3 },
      actorDelta: { base: { trust: -4 }, adversaire: { trust: -3 } },
      narrative: 'La branche ne suit pas. L’accord rêvé reste un brouillon, et chaque camp rentre avec ses soupçons.'
    }
  },
  {
    id: 'greve-reconductible',
    label: 'Grève reconductible',
    description: 'Préparer une pression longue, coûteuse, mais capable de déplacer la table.',
    unlockTurn: 14,
    target: 'adversaire',
    duration: 3,
    risk: 34,
    costPerTurn: { treasury: 5, cohesion: -1, resource: { santeSociale: -2 } },
    progressWeights: { militants: 1.8, localSections: 3, cohesion: 0.45 },
    success: {
      orgDelta: { reputation: 4, militants: 3 },
      resourceDelta: { rapportDeForce: 12, confiance: 6, legitimite: -2 },
      actorDelta: { adversaire: { pressure: 12, patience: -10 }, base: { trust: 8 } },
      narrative: 'La reconduction tient. Le conflit devient matériel : horaires, stocks, fatigue, peur de perdre.'
    },
    failure: {
      orgDelta: { treasury: -6, cohesion: -8, militants: -4 },
      resourceDelta: { rapportDeForce: -6, santeSociale: -8, confiance: -5 },
      actorDelta: { base: { trust: -8, patience: -8 }, adversaire: { trust: -3 } },
      narrative: 'La reconduction s’effrite. Quelques ateliers tiennent, puis cèdent. La fatigue laisse une trace plus lourde que la colère.'
    }
  },
  {
    id: 'professionnalisation',
    label: 'Professionnalisation',
    description: 'Investir dans permanents, expertise et méthode pour gagner les dossiers longs.',
    unlockTurn: 14,
    target: 'institution',
    duration: 5,
    risk: 12,
    costPerTurn: { treasury: 4 },
    progressWeights: { permanentStaff: 2.5, legalTeam: 2, reputation: 0.25 },
    success: {
      orgDelta: { permanentStaff: 1, legalTeam: 1, reputation: 4 },
      resourceDelta: { institution: 9, legitimite: 4 },
      actorDelta: { etat: { trust: 6 }, adversaire: { trust: 3 }, base: { patience: 3 } },
      narrative: 'L’organisation apprend à durer. Les dossiers deviennent mieux tenus, les rendez-vous moins subis.'
    },
    failure: {
      orgDelta: { treasury: -4, cohesion: -4 },
      resourceDelta: { confiance: -3 },
      actorDelta: { base: { trust: -4 } },
      narrative: 'La base voit surtout des bureaux et des frais. La compétence progresse, mais la distance aussi.'
    }
  },
  {
    id: 'conquete-interne',
    label: 'Conquête interne',
    description: 'Préparer une élection interne et verrouiller le mandat avant une crise.',
    unlockTurn: 18,
    target: 'base',
    duration: 3,
    risk: 26,
    costPerTurn: { treasury: 2, cohesion: -1 },
    progressWeights: { militants: 1.2, localSections: 2.4, mediaRelay: 0.8, cohesion: 0.5 },
    success: {
      orgDelta: { cohesion: 12, reputation: 3 },
      resourceDelta: { confiance: 8, institution: 3 },
      actorDelta: { base: { trust: 12, patience: 8 } },
      narrative: 'Le mandat ressort clarifié. L’opposition interne n’a pas disparu, mais elle sait où se trouve la majorité.'
    },
    failure: {
      orgDelta: { cohesion: -12, reputation: -3 },
      resourceDelta: { confiance: -8, rapportDeForce: -3 },
      actorDelta: { base: { trust: -10, pressure: 8 } },
      narrative: 'La campagne interne ouvre une fissure. Chacun prétend parler au nom de la base ; la base, elle, commence à douter.'
    }
  },
  {
    id: 'lobbying-parlementaire',
    label: 'Lobbying parlementaire',
    description: 'Déplacer le rapport de force vers l’État, les cabinets et la loi.',
    unlockTurn: 16,
    target: 'etat',
    duration: 4,
    risk: 24,
    costPerTurn: { treasury: 4, resource: { legitimite: -1 } },
    progressWeights: { mediaRelay: 2.2, legalTeam: 1.8, reputation: 0.35 },
    success: {
      orgDelta: { reputation: 5 },
      resourceDelta: { institution: 6, rapportDeForce: 5, legitimite: 2 },
      actorDelta: { etat: { trust: 10 }, adversaire: { pressure: 4 }, opinion: { trust: -2 } },
      narrative: 'La bataille remonte dans les textes. L’État ne promet rien, mais il reprend tes mots.'
    },
    failure: {
      orgDelta: { reputation: -5, treasury: -4 },
      resourceDelta: { legitimite: -6, confiance: -3 },
      actorDelta: { opinion: { trust: -6 }, base: { trust: -4 } },
      narrative: 'Le lobbying se voit trop. La presse parle de couloirs, pas de démocratie sociale.'
    }
  },
  {
    id: 'media-opinion',
    label: 'Bataille de l’opinion',
    description: 'Construire un cadrage public avant que l’adversaire ne nomme le conflit.',
    unlockTurn: 16,
    target: 'opinion',
    duration: 3,
    risk: 20,
    costPerTurn: { treasury: 3 },
    progressWeights: { mediaRelay: 3, reputation: 0.5, militants: 0.7 },
    success: {
      orgDelta: { reputation: 8 },
      resourceDelta: { legitimite: 9, confiance: 3 },
      actorDelta: { opinion: { trust: 12 }, etat: { pressure: 4 } },
      narrative: 'Le vocabulaire bascule. Ce qui paraissait technique devient une question de justice ou de responsabilité.'
    },
    failure: {
      orgDelta: { reputation: -4 },
      resourceDelta: { legitimite: -5 },
      actorDelta: { opinion: { trust: -8 } },
      narrative: 'Le message se disperse. L’adversaire n’a même pas besoin de répondre : le public n’a pas compris.'
    }
  }
];

export function availableStrategies(turn: number, camp: Camp, org: PlayerOrganization, activeIds: string[]): StrategyDefinition[] {
  return STRATEGIES.filter(strategy => {
    if (strategy.unlockTurn > turn) return false;
    if (activeIds.includes(strategy.id)) return false;
    if (strategy.id === 'greve-reconductible' && camp === 'patron') return false;
    if (strategy.id === 'lobbying-parlementaire' && org.mediaRelay < 2) return false;
    if (strategy.id === 'compromis-branche' && org.legalTeam < 1) return false;
    return true;
  });
}

export function strategyById(id: string): StrategyDefinition | undefined {
  return STRATEGIES.find(strategy => strategy.id === id);
}
