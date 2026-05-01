import type { Camp } from '../../lib/types';
import type { OrgAction, OrgAsset } from './types';

export const ORG_ACTIONS: OrgAction[] = [
  {
    id: 'recruter-adherents',
    label: 'Recruter des adhérents',
    description: 'Tourner dans les ateliers, bureaux ou entreprises pour élargir la base.',
    unlockTurn: 14,
    camp: 'salarie',
    cost: 6,
    doctrine: 'implantation',
    orgDelta: { membership: 140, militants: 6, cohesion: -2 },
    resourceDelta: { confiance: 4, rapportDeForce: 2 },
    actorDelta: { base: { trust: 3, pressure: 2 } },
    narrative: 'Les nouvelles cartes d’adhésion arrivent par paquets. La base grandit, avec ses attentes.'
  },
  {
    id: 'ouvrir-section',
    label: 'Ouvrir une section locale',
    description: 'Planter un drapeau durable dans un bassin de travail.',
    unlockTurn: 14,
    camp: 'salarie',
    cost: 10,
    doctrine: 'implantation',
    orgDelta: { localSections: 1, militants: 4, cohesion: 2 },
    resourceDelta: { institution: 3, confiance: 3 },
    narrative: 'Une nouvelle section tient sa première réunion. Le syndicat cesse d’être une adresse lointaine.'
  },
  {
    id: 'former-delegues',
    label: 'Former des délégués',
    description: 'Transformer la colère en méthode : droit, mandat, négociation.',
    unlockTurn: 14,
    cost: 8,
    doctrine: 'expertise',
    orgDelta: { permanentStaff: 1, legalTeam: 1, cohesion: 3 },
    resourceDelta: { institution: 4, legitimite: 2 },
    actorDelta: { base: { patience: 4 } },
    narrative: 'Les délégués apprennent à lire un texte, une fiche de paie, un silence patronal.'
  },
  {
    id: 'renforcer-caisse',
    label: 'Renforcer la caisse',
    description: 'Préparer les conflits longs en mettant de côté.',
    unlockTurn: 12,
    cost: 0,
    doctrine: 'compromis',
    orgDelta: { treasury: 8, cohesion: -1 },
    resourceDelta: { caisse: 3, rapportDeForce: 1 },
    narrative: 'La collecte n’est pas glorieuse, mais chacun sait ce qu’une caisse pleine change dans une grève.'
  },
  {
    id: 'campagne-presse',
    label: 'Lancer une campagne publique',
    description: 'Faire basculer le conflit du local vers l’opinion.',
    unlockTurn: 16,
    cost: 7,
    doctrine: 'influence',
    orgDelta: { mediaRelay: 2, reputation: 6 },
    resourceDelta: { legitimite: 5, rapportDeForce: 2 },
    actorDelta: { opinion: { trust: 6 }, adversaire: { pressure: 3 } },
    narrative: 'Le conflit change d’échelle. Les mots choisis le matin deviennent les titres du soir.'
  },
  {
    id: 'preparer-election',
    label: 'Préparer une élection interne',
    description: 'Tester le mandat avant qu’une crise ne l’impose.',
    unlockTurn: 18,
    cost: 5,
    doctrine: 'compromis',
    orgDelta: { cohesion: 7, reputation: 2 },
    resourceDelta: { confiance: 3, institution: 2 },
    actorDelta: { base: { trust: 5, patience: 3 } },
    narrative: 'La discussion interne révèle les fractures, mais elle évite qu’elles explosent au pire moment.'
  },
  {
    id: 'federer-branche',
    label: 'Fédérer une branche professionnelle',
    description: 'Passer du réseau de notables à une organisation patronale capable de signer.',
    unlockTurn: 12,
    camp: 'patron',
    cost: 10,
    doctrine: 'influence',
    orgDelta: { membership: 35, localSections: 1, reputation: 4 },
    resourceDelta: { institution: 4, legitimite: 2, caisse: 2 },
    actorDelta: { adversaire: { trust: 4 } },
    narrative: 'Les concurrents acceptent de s’asseoir ensemble. Le patronat devient un acteur collectif.'
  },
  {
    id: 'service-juridique-patronal',
    label: 'Monter un service juridique',
    description: 'Répondre aux conflits par dossiers, jurisprudence et procédures.',
    unlockTurn: 12,
    camp: 'patron',
    cost: 9,
    doctrine: 'expertise',
    orgDelta: { legalTeam: 2, permanentStaff: 1 },
    resourceDelta: { institution: 3, legitimite: 1, rapportDeForce: 2 },
    narrative: 'Les lettres deviennent plus précises. En face, on comprend que chaque virgule sera disputée.'
  },
  {
    id: 'reseau-parlementaire',
    label: 'Activer un réseau parlementaire',
    description: 'Déplacer le conflit vers la loi avant la rue.',
    unlockTurn: 16,
    camp: 'patron',
    cost: 8,
    doctrine: 'influence',
    orgDelta: { mediaRelay: 1, reputation: 5 },
    resourceDelta: { legitimite: 3, institution: 2, rapportDeForce: 3 },
    actorDelta: { etat: { trust: 5 }, opinion: { trust: -2 } },
    narrative: 'Le débat quitte la table sociale pour les couloirs. C’est efficace, et cela se voit.'
  }
];

export const ORG_ASSETS: OrgAsset[] = [
  {
    id: 'local-syndical',
    label: 'Local syndical',
    type: 'local',
    description: 'Un lieu fixe pour recevoir, archiver, former, tenir.',
    unlockTurn: 14,
    camp: 'salarie',
    purchaseCost: 14,
    upkeep: 1,
    resaleValue: 7,
    orgDelta: { localSections: 1, cohesion: 4, reputation: 2 },
    resourceDelta: { institution: 2 }
  },
  {
    id: 'journal-militant',
    label: 'Journal militant',
    type: 'media',
    description: 'Une voix régulière pour cadrer les conflits et transmettre la mémoire.',
    unlockTurn: 15,
    camp: 'salarie',
    purchaseCost: 12,
    upkeep: 2,
    resaleValue: 5,
    orgDelta: { mediaRelay: 3, reputation: 5 },
    resourceDelta: { legitimite: 3, confiance: 2 }
  },
  {
    id: 'fonds-greve',
    label: 'Fonds de grève',
    type: 'strikeFund',
    description: 'Une réserve dédiée aux conflits longs.',
    unlockTurn: 14,
    camp: 'salarie',
    purchaseCost: 16,
    upkeep: 0,
    resaleValue: 12,
    orgDelta: { treasury: 4, cohesion: 3 },
    resourceDelta: { rapportDeForce: 4, caisse: 2 }
  },
  {
    id: 'institut-expertise',
    label: 'Institut d’expertise sociale',
    type: 'research',
    description: 'Chiffrer, contester, produire des contre-propositions.',
    unlockTurn: 22,
    purchaseCost: 18,
    upkeep: 3,
    resaleValue: 8,
    orgDelta: { legalTeam: 2, permanentStaff: 1, reputation: 4 },
    resourceDelta: { institution: 4, legitimite: 3 }
  },
  {
    id: 'federation-branche',
    label: 'Fédération de branche',
    type: 'lobbying',
    description: 'Coordonner les employeurs et parler d’une seule voix.',
    unlockTurn: 12,
    camp: 'patron',
    purchaseCost: 16,
    upkeep: 2,
    resaleValue: 8,
    orgDelta: { membership: 45, localSections: 1, reputation: 4 },
    resourceDelta: { institution: 4, caisse: 2 }
  },
  {
    id: 'cabinet-juridique',
    label: 'Cabinet juridique',
    type: 'legal',
    description: 'Transformer le conflit social en terrain procédural.',
    unlockTurn: 12,
    camp: 'patron',
    purchaseCost: 14,
    upkeep: 2,
    resaleValue: 7,
    orgDelta: { legalTeam: 3, reputation: 2 },
    resourceDelta: { rapportDeForce: 3, institution: 2 }
  },
  {
    id: 'lettre-economique',
    label: 'Lettre économique',
    type: 'media',
    description: 'Un outil pour peser dans l’opinion des décideurs.',
    unlockTurn: 16,
    camp: 'patron',
    purchaseCost: 12,
    upkeep: 2,
    resaleValue: 5,
    orgDelta: { mediaRelay: 3, reputation: 4 },
    resourceDelta: { legitimite: 3 }
  }
];

export function availableOrgActions(turn: number, camp: Camp): OrgAction[] {
  return ORG_ACTIONS.filter(
    action => action.unlockTurn <= turn && (!action.camp || action.camp === 'any' || action.camp === camp)
  );
}

export function availableOrgAssets(turn: number, camp: Camp, owned: string[]): OrgAsset[] {
  return ORG_ASSETS.filter(
    asset =>
      asset.unlockTurn <= turn &&
      !owned.includes(asset.id) &&
      (!asset.camp || asset.camp === 'any' || asset.camp === camp)
  );
}

export function assetById(id: string): OrgAsset | undefined {
  return ORG_ASSETS.find(asset => asset.id === id);
}
