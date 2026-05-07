/* ============================================================
   Mock RebirthGameState — utilisé par les ateliers standalone
   Données réalistes mais non connectées au moteur V2.
   ============================================================ */
import type { RebirthGameState } from '../game/types';

export const MOCK_GAME_STATE: RebirthGameState = {
  name: 'Syndicat de démonstration',
  camp: 'salarie',
  mode: 'reflechi',
  legendaryId: null,
  turn: 18,
  era: 'trente_glorieuses',
  currentScenarioId: null,
  traits: {
    batisseur: 42,
    rupture: 28,
    technocrate: 35,
    pragmatique: 58,
    paternaliste: 18,
    tribun: 40
  },
  dominantTrait: 'pragmatique',
  personalityStress: 18,
  resources: {
    confiance: 62,
    caisse: 45,
    santeSociale: 68,
    legitimite: 55,
    rapportDeForce: 48,
    cohesionInterne: 60,
    institution: 38
  },
  actors: {
    base:       { trust: 65, pressure: 28, patience: 72, stance: 'cooperatif' },
    adversaire: { trust: 28, pressure: 62, patience: 42, stance: 'dur' },
    etat:       { trust: 44, pressure: 38, patience: 58, stance: 'instable' },
    opinion:    { trust: 52, pressure: 22, patience: 80, stance: 'opportuniste' }
  },
  organization: {
    name: 'Fédération de démonstration',
    camp: 'salarie',
    doctrine: 'compromis',
    treasury: 42,
    membership: 5200,
    militants: 130,
    permanentStaff: 9,
    legalTeam: 2,
    mediaRelay: 3,
    localSections: 14,
    cohesion: 65,
    reputation: 58,
    mobilisationFatigue: 18,
    factions: [],
    election: null,
    assets: [],
    engagedTalents: [],
    budgetStrategy: 'equilibre',
    actionHistory: []
  },
  activeStrategies: [],
  /* worldAI minimal — les simulateurs ne l'utilisent pas directement. */
  worldAI: {
    adversaireStance: 'dur',
    etatMood: 'attentiste',
    opinionTrend: 'stable',
    externalPressure: 30,
    crisisLevel: 0
  } as RebirthGameState['worldAI'],
  activePipelines: [],
  memory: {
    refusedCompromise: 0,
    signedMajorAccords: [],
    betrayedBase: 0,
    builtInstitutions: [],
    exhaustedMovements: 0,
    flags: {},
    playedScenarios: [],
    pendingLongterm: []
  },
  objectives: [],
  objectiveProgress: [],
  phase: 'idle',
  lastChoice: null,
  lastConsequenceText: null,
  endingId: null
};

export const MOCK_PATRON_GAME_STATE: RebirthGameState = {
  ...MOCK_GAME_STATE,
  camp: 'patron',
  name: 'Patronat de démonstration',
  organization: {
    ...MOCK_GAME_STATE.organization,
    name: 'Syndicat patronal de démonstration',
    camp: 'patron'
  }
};
