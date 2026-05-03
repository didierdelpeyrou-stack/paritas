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
  },

  /* ============== Côté salarié — extension à 20 ============== */
  {
    id: 'josephine-pelletier',
    nom: 'Joséphine Pelletier',
    specialite: 'Sage-femme militante',
    blurb: 'Pionnière de la santé au travail des femmes ouvrières. Pétitionnaire infatigable.',
    camp: 'salarie',
    cost: 11,
    hireResource: { santeSociale: 5, confiance: 2 },
    hireOrg: { reputation: 2, militants: 3 },
    perTurn: {
      reflexion: { resources: { santeSociale: 1, legitimite: 1 } },
      action: { actors: { base: { trust: 2 } } },
      communication: { resources: { santeSociale: 2 } }
    }
  },
  {
    id: 'lucien-mathieu',
    nom: 'Lucien Mathieu',
    specialite: 'Cheminot, vétéran 1936',
    blurb: 'A tenu Saint-Lazare pendant l\'occupation des dépôts. Voix qui porte sans micro.',
    camp: 'salarie',
    cost: 13,
    hireResource: { rapportDeForce: 5, cohesionInterne: 3 },
    hireOrg: { militants: 7, cohesion: 3 },
    perTurn: {
      reflexion: { resources: { confiance: 1 } },
      action: { resources: { rapportDeForce: 3, cohesionInterne: 1 } },
      communication: { actors: { base: { trust: 1 } } }
    }
  },
  {
    id: 'aicha-berrada',
    nom: 'Aïcha Berrada',
    specialite: 'Section nettoyage, hôtellerie',
    blurb: 'A fait gagner la grève des femmes de chambre du Park Hyatt en 2019. Précaires organisés.',
    camp: 'salarie',
    cost: 10,
    hireResource: { confiance: 4, rapportDeForce: 2 },
    hireOrg: { militants: 5, cohesion: 2 },
    perTurn: {
      reflexion: { resources: { santeSociale: 1 } },
      action: { resources: { rapportDeForce: 2, confiance: 1 }, organization: { militants: 1 } },
      communication: { resources: { legitimite: 1 } }
    }
  },
  {
    id: 'theo-vasseur',
    nom: 'Théo Vasseur',
    specialite: 'Apprenti BTP, jeune CGT',
    blurb: 'Vingt ans, déjà délégué de chantier. Apprend vite. Sa vidéo TikTok a franchi le million.',
    camp: 'salarie',
    cost: 8,
    hireResource: { confiance: 3, legitimite: 2 },
    hireOrg: { militants: 4, mediaRelay: 1 },
    perTurn: {
      reflexion: { resources: { confiance: 1 } },
      action: { resources: { rapportDeForce: 1 }, organization: { militants: 1 } },
      communication: { resources: { legitimite: 2 }, actors: { opinion: { trust: 2 } } }
    }
  },
  {
    id: 'margaux-sole',
    nom: 'Margaux Solé',
    specialite: 'Économiste IRES',
    blurb: 'Ancienne CNRS. Sait démonter un rapport patronal en quatre heures, chiffres sourcés.',
    camp: 'salarie',
    cost: 17,
    hireResource: { institution: 6, legitimite: 4 },
    hireOrg: { reputation: 3 },
    perTurn: {
      reflexion: { resources: { institution: 3, legitimite: 2 } },
      action: { actors: { etat: { trust: 1 } } },
      communication: { resources: { legitimite: 2 } }
    }
  },
  {
    id: 'oumar-diallo',
    nom: 'Oumar Diallo',
    specialite: 'Délégué hôtellerie-restauration',
    blurb: 'A négocié la prime nuit du 13e arrondissement. Connaît les pourboires comme la convention 51.',
    camp: 'salarie',
    cost: 12,
    hireResource: { confiance: 4, rapportDeForce: 2 },
    hireOrg: { militants: 4, permanentStaff: 1 },
    perTurn: {
      reflexion: { resources: { institution: 1 } },
      action: { resources: { rapportDeForce: 2, confiance: 1 } },
      communication: { actors: { base: { trust: 1 } } }
    }
  },
  {
    id: 'helene-brousse',
    nom: 'Hélène Brousse',
    specialite: 'Institutrice, FSU',
    blurb: 'Quarante ans d\'école publique. Sait qu\'une AG de profs commence par le café.',
    camp: 'salarie',
    cost: 11,
    hireResource: { santeSociale: 3, cohesionInterne: 3 },
    hireOrg: { militants: 4, cohesion: 4 },
    perTurn: {
      reflexion: { resources: { santeSociale: 1, legitimite: 1 } },
      action: { resources: { cohesionInterne: 2 }, organization: { cohesion: 1 } },
      communication: { actors: { opinion: { trust: 1 } } }
    }
  },
  {
    id: 'vincent-roy',
    nom: 'Vincent Roy',
    specialite: 'Secrétaire fédéral FO',
    blurb: 'A tenu douze conférences de presse pendant la réforme retraites. Voix calme, ligne claire.',
    camp: 'salarie',
    cost: 15,
    hireResource: { legitimite: 5, institution: 3 },
    hireOrg: { mediaRelay: 2, permanentStaff: 1 },
    perTurn: {
      reflexion: { resources: { institution: 2 } },
      action: { resources: { rapportDeForce: 1 } },
      communication: { resources: { legitimite: 3 }, actors: { opinion: { trust: 2 } } }
    }
  },
  {
    id: 'nadia-tahar',
    nom: 'Nadia Tahar',
    specialite: 'Livreuse Deliveroo, plateformes',
    blurb: 'A monté la première coopérative de livreurs marseillais. Algorithme et micro tracts.',
    camp: 'salarie',
    cost: 9,
    hireResource: { confiance: 3, rapportDeForce: 2 },
    hireOrg: { militants: 6, mediaRelay: 1 },
    perTurn: {
      reflexion: { resources: { confiance: 1, institution: 1 } },
      action: { resources: { rapportDeForce: 2 }, organization: { militants: 2 } },
      communication: { actors: { opinion: { trust: 1 } } }
    }
  },
  {
    id: 'sophie-anne-granger',
    nom: 'Sophie-Anne Granger',
    specialite: 'Avocate droit social',
    blurb: 'Cabinet aux Lilas. Plaide pour les comités d\'entreprise dissous. Six victoires sur dix au CSE.',
    camp: 'salarie',
    cost: 16,
    hireResource: { legitimite: 5, institution: 3 },
    hireOrg: { legalTeam: 3 },
    perTurn: {
      reflexion: { resources: { institution: 3, legitimite: 1 } },
      action: { resources: { rapportDeForce: 1 } },
      communication: { resources: { legitimite: 1 } }
    }
  },
  {
    id: 'patrice-ndombasi',
    nom: 'Patrice Ndombasi',
    specialite: 'Représentant santé hospitalière',
    blurb: 'Aide-soignant à La Salpêtrière. A déclenché la grève des urgences de 2019.',
    camp: 'salarie',
    cost: 12,
    hireResource: { santeSociale: 5, confiance: 2 },
    hireOrg: { militants: 4 },
    perTurn: {
      reflexion: { resources: { santeSociale: 2 } },
      action: { resources: { rapportDeForce: 2, santeSociale: 1 } },
      communication: { actors: { opinion: { trust: 2 } } }
    }
  },
  {
    id: 'camille-rouquette',
    nom: 'Camille Rouquette',
    specialite: 'Documentariste indépendante',
    blurb: 'Trois films sur les luttes ouvrières. Sait mettre une caméra dans une AG sans la troubler.',
    camp: 'salarie',
    cost: 10,
    hireResource: { legitimite: 4 },
    hireOrg: { mediaRelay: 2, reputation: 2 },
    perTurn: {
      reflexion: { resources: { legitimite: 1 } },
      action: { actors: { opinion: { trust: 1 } } },
      communication: { resources: { legitimite: 2 }, actors: { opinion: { trust: 3 } } }
    }
  },
  {
    id: 'jean-bouvard',
    nom: 'Jean Bouvard',
    specialite: 'Vétéran intersyndical',
    blurb: 'Soixante-quinze ans, a fait la sidérurgie en Lorraine, puis le tertiaire. A vu trois cycles.',
    camp: 'salarie',
    cost: 13,
    hireResource: { cohesionInterne: 4, confiance: 3 },
    hireOrg: { cohesion: 4, militants: 2 },
    perTurn: {
      reflexion: { resources: { confiance: 1, cohesionInterne: 1 } },
      action: { resources: { cohesionInterne: 2 } },
      communication: { actors: { base: { trust: 2 } } }
    }
  },
  {
    id: 'emilie-roussin',
    nom: 'Émilie Roussin',
    specialite: 'Cadre IT, CFE-CGC',
    blurb: 'Ingénieure software dans la finance. A négocié le télétravail post-Covid. Catégorielle assumée.',
    camp: 'salarie',
    cost: 14,
    hireResource: { institution: 4, legitimite: 2 },
    hireOrg: { permanentStaff: 1, reputation: 2 },
    perTurn: {
      reflexion: { resources: { institution: 2, legitimite: 1 } },
      action: { resources: { confiance: 1 } },
      communication: { resources: { legitimite: 1 } }
    }
  },
  {
    id: 'mehdi-bourquia',
    nom: 'Mehdi Bourquia',
    specialite: 'Animateur jeune CFDT',
    blurb: 'Trente ans, formateur en organisation. Sait écrire un tract qui circule par messagerie.',
    camp: 'salarie',
    cost: 9,
    hireResource: { confiance: 3, legitimite: 2 },
    hireOrg: { militants: 3, mediaRelay: 1 },
    perTurn: {
      reflexion: { resources: { confiance: 1 } },
      action: { resources: { confiance: 1 }, organization: { militants: 1 } },
      communication: { resources: { legitimite: 2 }, actors: { opinion: { trust: 1 } } }
    }
  },
  {
    id: 'suzanne-lariviere',
    nom: 'Suzanne Larivière',
    specialite: 'Anthropologue du travail',
    blurb: 'A travaillé sur Florange, Goodyear, Whirlpool. Ses analyses sont citées au Sénat.',
    camp: 'salarie',
    cost: 18,
    hireResource: { institution: 5, legitimite: 5, santeSociale: 2 },
    hireOrg: { reputation: 4 },
    perTurn: {
      reflexion: { resources: { institution: 3, santeSociale: 1 } },
      action: { actors: { etat: { trust: 1 } } },
      communication: { resources: { legitimite: 2 }, actors: { opinion: { trust: 1 } } }
    }
  },

  /* ============== Côté patron — extension à 20 ============== */
  {
    id: 'francois-de-kerouac',
    nom: 'François de Kerouac',
    specialite: 'Conseiller d\'État, ex-DGT',
    blurb: 'A passé sept ans Direction générale du travail. Carnet d\'adresses gouvernemental étendu.',
    camp: 'patron',
    cost: 20,
    hireResource: { institution: 6, legitimite: 5 },
    hireOrg: { reputation: 5, mediaRelay: 1 },
    perTurn: {
      reflexion: { resources: { institution: 3 }, actors: { etat: { trust: 2 } } },
      action: { resources: { rapportDeForce: 1 } },
      communication: { resources: { legitimite: 2 } }
    }
  },
  {
    id: 'caroline-vasse',
    nom: 'Caroline Vasse',
    specialite: 'DRH groupe CAC40',
    blurb: 'Passée chez L\'Oréal, Total, Stellantis. Architectes des accords majoritaires depuis 2017.',
    camp: 'patron',
    cost: 17,
    hireResource: { institution: 5, legitimite: 3 },
    hireOrg: { permanentStaff: 2, legalTeam: 2 },
    perTurn: {
      reflexion: { resources: { institution: 2, legitimite: 1 } },
      action: { resources: { rapportDeForce: 1, institution: 1 } },
      communication: { resources: { legitimite: 1 } }
    }
  },
  {
    id: 'antoine-verdier',
    nom: 'Antoine Verdier',
    specialite: 'Avocat MEDEF',
    blurb: 'Cabinet rue de Rivoli. Spécialiste du contentieux représentativité syndicale.',
    camp: 'patron',
    cost: 15,
    hireResource: { institution: 4, rapportDeForce: 3 },
    hireOrg: { legalTeam: 3 },
    perTurn: {
      reflexion: { resources: { institution: 2 } },
      action: { resources: { rapportDeForce: 2 } },
      communication: { resources: { legitimite: 1 } }
    }
  },
  {
    id: 'brigitte-sandoz',
    nom: 'Brigitte Sandoz',
    specialite: 'Stratège com\' B2B',
    blurb: 'Vingt ans de communication corporate. Sait positionner une note sectorielle dans Les Échos.',
    camp: 'patron',
    cost: 13,
    hireResource: { legitimite: 4 },
    hireOrg: { mediaRelay: 3, reputation: 2 },
    perTurn: {
      reflexion: { resources: { legitimite: 1 } },
      action: { actors: { opinion: { trust: 1 } } },
      communication: { resources: { legitimite: 3 }, actors: { opinion: { trust: 2 } } }
    }
  },
  {
    id: 'henrik-lindqvist',
    nom: 'Henrik Lindqvist',
    specialite: 'DG filiale française d\'un groupe nordique',
    blurb: 'Suédois, parle six langues. Apporte les méthodes scandinaves de cogestion à la française.',
    camp: 'patron',
    cost: 18,
    hireResource: { institution: 5, legitimite: 4, caisse: 2 },
    hireOrg: { permanentStaff: 1, reputation: 4 },
    perTurn: {
      reflexion: { resources: { institution: 2, legitimite: 1 } },
      action: { resources: { rapportDeForce: 1 } },
      communication: { actors: { etat: { trust: 1 }, opinion: { trust: 1 } } }
    }
  },
  {
    id: 'guillaume-de-beaufort',
    nom: 'Guillaume de Beaufort',
    specialite: 'Patron BTP, dynastie',
    blurb: 'Quatrième génération. Travaux publics dans le Sud-Ouest. Conservateur, paternaliste, efficace.',
    camp: 'patron',
    cost: 14,
    hireResource: { institution: 3, caisse: 4 },
    hireOrg: { militants: 3, reputation: 3 },
    perTurn: {
      reflexion: { resources: { institution: 1 } },
      action: { resources: { rapportDeForce: 2, caisse: 1 } },
      communication: { actors: { base: { trust: 1 } } }
    }
  },
  {
    id: 'aurelie-stein',
    nom: 'Aurélie Stein',
    specialite: 'Économiste OCDE',
    blurb: 'Détachée auprès du patronat européen. Sait quel chiffre sortir au bon moment.',
    camp: 'patron',
    cost: 19,
    hireResource: { institution: 6, legitimite: 4 },
    hireOrg: { reputation: 4 },
    perTurn: {
      reflexion: { resources: { institution: 3, legitimite: 2 } },
      action: { resources: { caisse: 1 } },
      communication: { resources: { legitimite: 2 } }
    }
  },
  {
    id: 'jean-marc-polet',
    nom: 'Jean-Marc Polet',
    specialite: 'Lobbyiste CPME Bruxelles',
    blurb: 'Spécialiste des seuils PME et des dérogations communautaires. Trinque sec mais signe sobre.',
    camp: 'patron',
    cost: 14,
    hireResource: { institution: 4, legitimite: 2 },
    hireOrg: { reputation: 3, mediaRelay: 1 },
    perTurn: {
      reflexion: { resources: { institution: 2 }, actors: { etat: { trust: 1 } } },
      action: { resources: { rapportDeForce: 1 } },
      communication: { resources: { legitimite: 1 } }
    }
  },
  {
    id: 'yasmine-el-hadad',
    nom: 'Yasmine El Hadad',
    specialite: 'DSI transformation digitale RH',
    blurb: 'A monté la plateforme RH d\'un grand assureur. Conformité RGPD et entretiens annuels.',
    camp: 'patron',
    cost: 13,
    hireResource: { institution: 4, caisse: 1 },
    hireOrg: { permanentStaff: 1, reputation: 2 },
    perTurn: {
      reflexion: { resources: { institution: 2, caisse: 1 } },
      action: { resources: { rapportDeForce: 1 } },
      communication: { resources: { legitimite: 1 } }
    }
  },
  {
    id: 'vincent-latour',
    nom: 'Vincent Latour',
    specialite: 'Avocat fiscaliste',
    blurb: 'Optimisation des cotisations sociales et patrimoniales. Dossiers à treize chiffres.',
    camp: 'patron',
    cost: 16,
    hireResource: { caisse: 6, institution: 2 },
    hireOrg: { legalTeam: 2 },
    perTurn: {
      reflexion: { resources: { caisse: 2, institution: 1 } },
      action: { resources: { caisse: 1 } },
      communication: { resources: { legitimite: 1 } }
    }
  },
  {
    id: 'pierre-henri-dargent',
    nom: 'Pierre-Henri Dargent',
    specialite: 'Banquier d\'affaires, fusions',
    blurb: 'Arrange les rachats de PME en difficulté. Sait quand suggérer un PSE et quand l\'éviter.',
    camp: 'patron',
    cost: 18,
    hireResource: { caisse: 5, institution: 3 },
    hireOrg: { reputation: 4 },
    perTurn: {
      reflexion: { resources: { caisse: 2, institution: 1 } },
      action: { resources: { caisse: 2, rapportDeForce: 1 } },
      communication: { resources: { legitimite: 1 } }
    }
  },
  {
    id: 'elisabeth-breard',
    nom: 'Élisabeth Bréard',
    specialite: 'Présidente union patronale régionale',
    blurb: 'Préside le MEDEF Pays-de-la-Loire. Sait lire un budget de Région et l\'orienter.',
    camp: 'patron',
    cost: 15,
    hireResource: { institution: 4, legitimite: 3 },
    hireOrg: { permanentStaff: 1, reputation: 3 },
    perTurn: {
      reflexion: { resources: { institution: 2 } },
      action: { actors: { etat: { trust: 1 } } },
      communication: { resources: { legitimite: 2 } }
    }
  },
  {
    id: 'marc-holtzer',
    nom: 'Marc Holtzer',
    specialite: 'Consultant transformation',
    blurb: 'McKinsey alumni, dix ans en cabinet. Diapos parfaites, change management certifié.',
    camp: 'patron',
    cost: 17,
    hireResource: { institution: 5, caisse: 2 },
    hireOrg: { reputation: 3 },
    perTurn: {
      reflexion: { resources: { institution: 3 } },
      action: { resources: { caisse: 1 } },
      communication: { resources: { legitimite: 2 } }
    }
  },
  {
    id: 'sophie-renard',
    nom: 'Sophie Renard',
    specialite: 'Directrice com groupe énergie',
    blurb: 'EDF puis TotalEnergies. Maîtrise les éléments de langage du dialogue social.',
    camp: 'patron',
    cost: 14,
    hireResource: { legitimite: 4, institution: 1 },
    hireOrg: { mediaRelay: 3 },
    perTurn: {
      reflexion: { resources: { legitimite: 1 } },
      action: { actors: { opinion: { trust: 1 } } },
      communication: { resources: { legitimite: 3 }, actors: { opinion: { trust: 2 } } }
    }
  },
  {
    id: 'olivier-castagnet',
    nom: 'Olivier Castagnet',
    specialite: 'Représentant U2P artisanat',
    blurb: 'Boulanger lui-même, 30 ans, élu CCI. Voix de l\'artisanat à la table interpro.',
    camp: 'patron',
    cost: 11,
    hireResource: { confiance: 3, institution: 2 },
    hireOrg: { militants: 4, reputation: 2 },
    perTurn: {
      reflexion: { resources: { institution: 1 } },
      action: { resources: { rapportDeForce: 1, confiance: 1 } },
      communication: { actors: { base: { trust: 1 }, opinion: { trust: 1 } } }
    }
  },
  {
    id: 'charlotte-vendeenne',
    nom: 'Charlotte Vendéenne',
    specialite: 'Spécialiste seuils sociaux PME',
    blurb: 'Sait calculer 49,5 employés au plus juste. Boîte à outils des dérogations légales.',
    camp: 'patron',
    cost: 12,
    hireResource: { institution: 3, caisse: 2 },
    hireOrg: { legalTeam: 2 },
    perTurn: {
      reflexion: { resources: { institution: 2, caisse: 1 } },
      action: { resources: { rapportDeForce: 1 } },
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
