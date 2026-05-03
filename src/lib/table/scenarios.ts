/* ============================================================
   Paritas — Scénarios pour La Table des Négociations
   ============================================================
   Scénario phare V2-3 : 1945 Sécurité sociale (Croizat + Laroque
   + Parodi + Buisson). Spec : V2_AVIS_MINIJEUX_TABLE.md §5/§7.3.

   Chaque scénario définit :
   - 4 personas avec leur ligne rouge et leur agenda public
   - Articles initiaux du draft
   - Conditions de validation
   ============================================================ */

import type {
  AccordArticle, Actor, ActorPersona, NegotiationState,
  RedLine, TableScenarioId
} from './types';

/* ====== 1945 Sécurité sociale — 4 architectes ====== */

const CROIZAT_PERSONA: ActorPersona = {
  id: 'croizat',
  name: 'Ambroise Croizat',
  organization: 'CGT · Ministre du Travail',
  shortBio: 'Métallo CGT, ex-déporté, ministre du Travail PCF. Ligne : couverture universelle.',
  style: 'ferme-chaleur',
  bluffProbability: 0.18
};

const LAROQUE_PERSONA: ActorPersona = {
  id: 'laroque',
  name: 'Pierre Laroque',
  organization: 'Conseil d\'État · Haut fonctionnaire',
  shortBio: 'Inspecteur des Finances, architecte technique. Ligne : unification administrative.',
  style: 'technique-rigueur',
  bluffProbability: 0.05
};

const PARODI_PERSONA: ActorPersona = {
  id: 'parodi',
  name: 'Alexandre Parodi',
  organization: 'CFTC · Ancien ministre',
  shortBio: 'Conseiller d\'État, syndicaliste chrétien. Ligne : autonomie chrétienne.',
  style: 'conciliant-resistant',
  bluffProbability: 0.12
};

const BUISSON_PERSONA: ActorPersona = {
  id: 'buisson',
  name: 'Henri Buisson',
  organization: 'CFTC · Ouvriers chrétiens',
  shortBio: 'Délégué CFTC ouvrier, chrétien social. Ligne : représentation ouvrière.',
  style: 'solidaire-base',
  bluffProbability: 0.10
};

const SECU_1945_REDLINES: Record<string, RedLine> = {
  croizat: {
    topic: 'Couverture universelle',
    description: 'La Sécu doit couvrir TOUS les travailleurs. Pas d\'exception professionnelle.',
    threshold: 25,
    declared: false,
    realThreshold: 15
  },
  laroque: {
    topic: 'Unification administrative',
    description: 'Une seule caisse nationale, gestion centralisée. Pas de fragmentation.',
    threshold: 30,
    declared: true,
    realThreshold: 30
  },
  parodi: {
    topic: 'Autonomie chrétienne',
    description: 'Préservation des sociétés mutualistes confessionnelles dans le système.',
    threshold: 35,
    declared: true,
    realThreshold: 25
  },
  buisson: {
    topic: 'Représentation ouvrière paritaire',
    description: 'Les conseils d\'administration doivent être élus, pas nommés.',
    threshold: 28,
    declared: true,
    realThreshold: 28
  }
};

const SECU_1945_AGENDAS: Record<string, string[]> = {
  croizat: [
    'Couverture universelle des travailleurs',
    'Gestion par les bénéficiaires eux-mêmes',
    'Cotisations proportionnelles aux salaires',
    'Accident du travail unifié à la branche maladie'
  ],
  laroque: [
    'Une seule caisse nationale (URSSAF unifiée)',
    'Gestion administrative homogène',
    'Comptabilité publique transparente',
    'Coordination avec les régimes spéciaux progressivement'
  ],
  parodi: [
    'Préservation des mutualités confessionnelles',
    'Liberté de choix de la caisse pour les assurés',
    'Représentation des familles nombreuses',
    'Reconnaissance du rôle des œuvres sociales catholiques'
  ],
  buisson: [
    'Élection des conseils paritaires (50/50)',
    'Représentation des ouvriers du textile, du bâtiment',
    'Caisses de proximité ancrées en région',
    'Voix consultative aux artisans'
  ]
};

const SECU_1945_INITIAL_ARTICLES: AccordArticle[] = [
  {
    id: 'art-1',
    text: 'L\'ordonnance institue une organisation de Sécurité sociale pour tous les travailleurs salariés.',
    proposedBy: ['croizat'],
    opposedBy: [],
    redLineDistance: { croizat: 5, laroque: 10, parodi: 35, buisson: 15 }
  },
  {
    id: 'art-2',
    text: 'La gestion est confiée à des caisses dont les conseils sont élus par les bénéficiaires et les employeurs.',
    proposedBy: ['buisson', 'croizat'],
    opposedBy: ['laroque'],
    redLineDistance: { croizat: 0, laroque: 45, parodi: 15, buisson: 0 }
  },
  {
    id: 'art-3',
    text: 'Les cotisations sont assises sur les salaires et collectées par un organisme unique (URSSAF).',
    proposedBy: ['laroque'],
    opposedBy: [],
    redLineDistance: { croizat: 10, laroque: 0, parodi: 40, buisson: 20 }
  }
];

/* ====== Factory ====== */

function makeActor(persona: ActorPersona, isPlayer: boolean, isBot: boolean): Actor {
  return {
    persona,
    isPlayer,
    isBot,
    resources: { mandat: 70, caisse: 50, legitimite: 65 },
    redLine: SECU_1945_REDLINES[persona.id]!,
    publicAgenda: SECU_1945_AGENDAS[persona.id]!,
    vote: null
  };
}

export function freshSecu1945State(opts: {
  playerActorId?: string;
  seed: string;
}): NegotiationState {
  const playerId = opts.playerActorId ?? 'croizat';
  const personas: ActorPersona[] = [
    CROIZAT_PERSONA, LAROQUE_PERSONA, PARODI_PERSONA, BUISSON_PERSONA
  ];
  const actors: Actor[] = personas.map(p => makeActor(p, p.id === playerId, p.id !== playerId));

  return {
    scenarioId: 'secu-1945',
    scenarioTitle: 'Sécurité sociale — l\'ordonnance fondatrice',
    scenarioDate: 'Octobre 1945',
    scenarioContext:
      'Six semaines pour inventer la Sécurité sociale. Croizat, ' +
      'Laroque, Parodi et Buisson partagent une même salle, des ' +
      'visions opposées du financement et de la gouvernance, et un ' +
      'délai impossible. Chacun défend sa ligne rouge. Un compromis ' +
      'doit sortir avant le 4 octobre.',

    phase: 'opening',
    turn: 1,
    totalTurns: 9,

    currentSpeaker: 'croizat',
    speakingOrder: ['croizat', 'laroque', 'parodi', 'buisson'],

    actors,
    draft: [...SECU_1945_INITIAL_ARTICLES],
    concessions: [],

    validation: 'unanimite',  // 1945 demande l'accord des quatre

    outcome: null,
    startedAt: Date.now(),
    seed: opts.seed
  };
}

/* ====== Registry ====== */

export const SCENARIO_FACTORY: Record<TableScenarioId,
  (opts: { playerActorId?: string; seed: string }) => NegotiationState> = {
  'secu-1945': freshSecu1945State,
  // Stubs pour les futurs scénarios — réutilisent secu pour l'instant
  'matignon-1936':   (o) => ({ ...freshSecu1945State(o), scenarioId: 'matignon-1936' }),
  'cogestion-1947':  (o) => ({ ...freshSecu1945State(o), scenarioId: 'cogestion-1947' }),
  'ani-2013':        (o) => ({ ...freshSecu1945State(o), scenarioId: 'ani-2013' }),
  'ordonnances-2017': (o) => ({ ...freshSecu1945State(o), scenarioId: 'ordonnances-2017' })
};

export function makeScenario(
  id: TableScenarioId,
  opts: { playerActorId?: string; seed: string }
): NegotiationState {
  return SCENARIO_FACTORY[id](opts);
}
