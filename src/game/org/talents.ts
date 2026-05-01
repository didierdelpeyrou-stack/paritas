/**
 * Catalogue des talents recrutables et de leurs bonus par groupe.
 * Chaque talent peut être affecté à un seul groupe à la fois :
 *   - Réflexion : think tank, dossiers techniques (institution / légitimité)
 *   - Action : terrain, mobilisation (rapport de force / cohésion)
 *   - Communication : médias, opinion (légitimité / opinion)
 *
 * Le bonus s'applique à chaque tour pendant que le talent est dans le
 * groupe — d'où l'intérêt de bien doser ses affectations.
 */

import type { Camp } from '../../lib/types';
import type { OrganizationDelta } from './types';
import type { ActorId, Resources } from '../types';

export interface TalentCatalogEntry {
  id: string;
  nom: string;
  specialite: string;
  blurb: string;
  camp: Camp;
  cost: number;
  /** Effet immédiat à l'engagement. */
  hireResource?: Partial<Resources>;
  hireOrg?: OrganizationDelta;
  /** Bonus par tour selon le groupe d'affectation. */
  perTurn: Partial<Record<'reflexion' | 'action' | 'communication',
    {
      resources?: Partial<Resources>;
      organization?: OrganizationDelta;
      actors?: Partial<Record<ActorId, { trust?: number; pressure?: number; patience?: number }>>;
    }>>;
}

export const TALENT_CATALOG: TalentCatalogEntry[] = [
  /* ============== Côté salarié ============== */
  {
    id: 'marie-leveque',
    nom: 'Marie Levêque',
    specialite: 'Juriste prud’hommale',
    blurb: 'Quinze ans aux prud’hommes de Bobigny. Lit les contrats comme on lit la pluie.',
    camp: 'salarie',
    cost: 14,
    hireResource: { legitimite: 3 },
    hireOrg: { legalTeam: 2, reputation: 3 },
    perTurn: {
      reflexion: { resources: { institution: 2, legitimite: 1 } },
      action: { resources: { rapportDeForce: 1 } },
      communication: { resources: { legitimite: 1 } }
    }
  },
  {
    id: 'karim-benhamouda',
    nom: 'Karim Benhamouda',
    specialite: 'Organisateur de sections',
    blurb: 'Vient de la fédération des transports, sait tenir une AG sans micro.',
    camp: 'salarie',
    cost: 12,
    hireResource: { confiance: 4 },
    hireOrg: { permanentStaff: 1, militants: 5, cohesion: 3 },
    perTurn: {
      reflexion: { resources: { institution: 1 } },
      action: { resources: { rapportDeForce: 2, confiance: 1 }, organization: { militants: 1 } },
      communication: { actors: { base: { trust: 1 } } }
    }
  },
  {
    id: 'anne-dubois',
    nom: 'Anne Dubois',
    specialite: 'Écrivaine et tribune',
    blurb: 'Anciennement journaliste à L’Humanité. Sait choisir les mots qui restent.',
    camp: 'salarie',
    cost: 10,
    hireResource: { legitimite: 5, confiance: 2 },
    hireOrg: { mediaRelay: 1 },
    perTurn: {
      reflexion: { resources: { legitimite: 1 } },
      action: { actors: { opinion: { trust: 1 } } },
      communication: { resources: { legitimite: 2, confiance: 1 }, actors: { opinion: { trust: 2 } } }
    }
  },
  {
    id: 'pierre-chassaigne',
    nom: 'Pierre Chassaigne',
    specialite: 'Vétéran de la métallurgie',
    blurb: 'A fait Renault-Billancourt 1973, Talbot 1983. Connu, redouté, respecté.',
    camp: 'salarie',
    cost: 13,
    hireResource: { rapportDeForce: 4 },
    hireOrg: { militants: 8, cohesion: 4 },
    perTurn: {
      reflexion: { resources: { confiance: 1 } },
      action: { resources: { rapportDeForce: 3 }, organization: { militants: 1, cohesion: 1 } },
      communication: { resources: { legitimite: 1 } }
    }
  },

  /* ============== Côté patron ============== */
  {
    id: 'henri-bouvier',
    nom: 'Henri de Bouvier',
    specialite: 'Ancien préfet',
    blurb: 'Connaît tous les directeurs de cabinet. Ses dîners ouvrent des portes.',
    camp: 'patron',
    cost: 16,
    hireResource: { legitimite: 4 },
    hireOrg: { mediaRelay: 2, reputation: 4 },
    perTurn: {
      reflexion: { resources: { institution: 2 }, actors: { etat: { trust: 1 } } },
      action: { resources: { rapportDeForce: 1 } },
      communication: { resources: { legitimite: 2 }, actors: { opinion: { trust: 1 } } }
    }
  },
  {
    id: 'marc-leblanc',
    nom: 'Marc Leblanc',
    specialite: 'DRH expérimenté',
    blurb: 'Vingt ans chez Saint-Gobain, sait écrire un accord d’entreprise sur un coin de table.',
    camp: 'patron',
    cost: 13,
    hireResource: { institution: 4 },
    hireOrg: { permanentStaff: 1, legalTeam: 1 },
    perTurn: {
      reflexion: { resources: { institution: 2, legitimite: 1 } },
      action: { resources: { rapportDeForce: 1 } },
      communication: { resources: { legitimite: 1 } }
    }
  },
  {
    id: 'jeanne-vidal',
    nom: 'Jeanne Vidal',
    specialite: 'Lobbyiste à Bruxelles',
    blurb: 'Comprend les dossiers BusinessEurope avant qu’ils n’atterrissent à Paris.',
    camp: 'patron',
    cost: 18,
    hireResource: { institution: 6, legitimite: 3 },
    hireOrg: { reputation: 5 },
    perTurn: {
      reflexion: { resources: { institution: 3 }, actors: { etat: { trust: 1 } } },
      action: { resources: { rapportDeForce: 1, caisse: 1 } },
      communication: { resources: { legitimite: 1 } }
    }
  },
  {
    id: 'sophie-martens',
    nom: 'Sophie Martens',
    specialite: 'Juriste social',
    blurb: 'Sait obtenir une suspension d’extension de convention en quarante-huit heures.',
    camp: 'patron',
    cost: 14,
    hireResource: { institution: 4, rapportDeForce: 2 },
    hireOrg: { legalTeam: 2 },
    perTurn: {
      reflexion: { resources: { institution: 2 } },
      action: { resources: { rapportDeForce: 2 } },
      communication: { resources: { legitimite: 1 } }
    }
  }
];

export function talentsForCamp(camp: Camp): TalentCatalogEntry[] {
  return TALENT_CATALOG.filter(t => t.camp === camp);
}

export function talentById(id: string): TalentCatalogEntry | undefined {
  return TALENT_CATALOG.find(t => t.id === id);
}

export const GROUP_LABELS: Record<'reflexion' | 'action' | 'communication', string> = {
  reflexion: 'Réflexion',
  action: 'Action',
  communication: 'Communication'
};

export const GROUP_BLURBS: Record<'reflexion' | 'action' | 'communication', string> = {
  reflexion:
    'Think tank et dossiers techniques. Institution, légitimité, accès à l’État.',
  action:
    'Terrain et mobilisation. Rapport de force, militants, cohésion.',
  communication:
    'Médias et opinion. Légitimité publique, image, presse.'
};
