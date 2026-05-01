import type { Camp } from '../../lib/types';
import type { RoleObjective } from './types';

const SALARIE_BASE: RoleObjective[] = [
  {
    id: 'salarie-build-institutions',
    label: 'Bâtir l’institution',
    description: 'Faire édifier au moins 4 institutions paritaires durables.',
    condition: { kind: 'institutions-built', count: 4 },
    weight: 3
  },
  {
    id: 'salarie-no-betrayal',
    label: 'Tenir la base',
    description: 'Ne jamais trahir la base plus d’une fois sur toute la partie.',
    condition: { kind: 'no-betrayal', max: 1 },
    weight: 2
  }
];

const PATRON_BASE: RoleObjective[] = [
  {
    id: 'patron-keep-treasury',
    label: 'Garder la caisse pleine',
    description: 'Tenir la trésorerie au-dessus de 55 sur la durée.',
    condition: { kind: 'resource-min', resource: 'caisse', threshold: 55 },
    weight: 2
  },
  {
    id: 'patron-secure-legitimacy',
    label: 'Reconquérir la légitimité',
    description: 'Atteindre une légitimité publique d’au moins 60.',
    condition: { kind: 'resource-min', resource: 'legitimite', threshold: 60 },
    weight: 3
  }
];

const PER_CHARACTER: Record<string, RoleObjective[]> = {
  jouhaux: [
    {
      id: 'jouhaux-matignon',
      label: 'Signer Matignon',
      description: 'Faire aboutir un grand accord avant 1939 (tour 22).',
      condition: { kind: 'flag-set', flag: 'signe-matignon' },
      byTurn: 22,
      weight: 3
    }
  ],
  croizat: [
    {
      id: 'croizat-secu',
      label: 'Imposer la Sécurité sociale',
      description: 'Construire la Sécu paritaire avant la fin de la Reconstruction (tour 24).',
      condition: { kind: 'flag-set', flag: 'cree-secu' },
      byTurn: 24,
      weight: 3
    }
  ],
  griffuelhes: [
    {
      id: 'griffuelhes-rapport-de-force',
      label: 'Maintenir le rapport de force',
      description: 'Garder un rapport de force d’au moins 65 jusqu’à la Charte d’Amiens (tour 16).',
      condition: { kind: 'resource-min', resource: 'rapportDeForce', threshold: 65 },
      byTurn: 16,
      weight: 2
    }
  ],
  bothereau: [
    {
      id: 'bothereau-pragmatique',
      label: 'Tenir la doctrine pragmatique',
      description: 'Conserver le pragmatisme comme trait dominant en fin de partie.',
      condition: { kind: 'trait-dominant', trait: 'pragmatique' },
      weight: 2
    }
  ],
  maire: [
    {
      id: 'maire-cfdt-modernise',
      label: 'Moderniser le syndicalisme',
      description: 'Atteindre un capital institutionnel d’au moins 70 sans renoncer à la confiance (≥ 50).',
      condition: { kind: 'resource-min', resource: 'institution', threshold: 70 },
      weight: 3
    }
  ],
  souillot: [
    {
      id: 'souillot-defendre-reserves',
      label: 'Défendre les réserves',
      description: 'Maintenir une caisse syndicale supérieure à 50 face à la captation.',
      condition: { kind: 'resource-min', resource: 'caisse', threshold: 50 },
      weight: 2
    }
  ],
  binet: [
    {
      id: 'binet-confiance',
      label: 'Tenir la confiance de la base',
      description: 'Conserver une confiance d’au moins 65 jusqu’à la fin du mandat 2023 (tour 46).',
      condition: { kind: 'resource-min', resource: 'confiance', threshold: 65 },
      byTurn: 46,
      weight: 2
    }
  ],
  'lambert-ribot': [
    {
      id: 'lambert-ribot-compromis',
      label: 'Le compromis défensif',
      description: 'Signer Matignon en encaissant le moins possible (caisse ≥ 45 au tour 22).',
      condition: { kind: 'resource-min', resource: 'caisse', threshold: 45 },
      byTurn: 22,
      weight: 2
    }
  ],
  villiers: [
    {
      id: 'villiers-paritarisme-recu',
      label: 'Reconnaître le paritarisme',
      description: 'Rejoindre durablement les institutions paritaires (institution ≥ 60 d’ici tour 28).',
      condition: { kind: 'resource-min', resource: 'institution', threshold: 60 },
      byTurn: 28,
      weight: 3
    }
  ],
  seilliere: [
    {
      id: 'seilliere-refondation',
      label: 'Refonder par la rupture',
      description: 'Refuser au moins 3 compromis pour imposer la refondation sociale.',
      condition: { kind: 'refuse-compromise', count: 3 },
      weight: 3
    }
  ],
  parisot: [
    {
      id: 'parisot-image',
      label: 'Tenir l’image patronale',
      description: 'Garder une légitimité publique au-dessus de 65 sur tout le mandat (tour 38).',
      condition: { kind: 'resource-min', resource: 'legitimite', threshold: 65 },
      byTurn: 38,
      weight: 2
    }
  ],
  'roux-de-bezieux': [
    {
      id: 'roux-de-bezieux-rapport-de-force',
      label: 'Imposer le rapport patronal',
      description: 'Maintenir un rapport de force d’au moins 60 jusqu’à 2023 (tour 46).',
      condition: { kind: 'resource-min', resource: 'rapportDeForce', threshold: 60 },
      byTurn: 46,
      weight: 2
    }
  ]
};

export function objectivesForRole(camp: Camp, characterId?: string): RoleObjective[] {
  const base = camp === 'patron' ? PATRON_BASE : SALARIE_BASE;
  const extra = characterId ? PER_CHARACTER[characterId] ?? [] : [];
  return [...base, ...extra];
}
