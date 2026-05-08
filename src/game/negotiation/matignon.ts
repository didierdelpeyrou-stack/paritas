/* Argus B-IT9 : extension .ts explicite pour CLI Node 22 strip-types
   (Vite résolvait sans, Node non — bloquait simulateAllMatignonPaths
   en CLI et donc l'audit MC sur Matignon). */
import { resolveNegotiation } from './resolve.ts';
import type {
  AgentIntent,
  AgreementQuality,
  Mandate,
  NegotiationOffer,
  NegotiationOutcome
} from './types';

export type MatignonDecisionId =
  | 'sign-balanced'
  | 'suspend-consult'
  | 'harden-wages'
  | 'walk-out';

export type MatignonPhase = 'opening' | 'counter' | 'ratification' | 'ended';

export type MatignonMoveId =
  | 'clarify-mandate'
  | 'open-maximal'
  | 'accept-state-frame'
  | 'trade-face-for-rights'
  | 'leak-to-press'
  | 'technical-commission'
  | MatignonDecisionId;

export interface MatignonChoice {
  id: MatignonDecisionId;
  label: string;
  intent: string;
  risk: string;
  offer: NegotiationOffer;
}

export interface MatignonMove {
  id: MatignonMoveId;
  phase: Exclude<MatignonPhase, 'ended'>;
  label: string;
  intent: string;
  risk: string;
}

export interface TransitionBeat {
  trigger:
    | 'agreement_signed'
    | 'table_suspended'
    | 'strike_escalation'
    | 'table_broken';
  intensity: 1 | 2 | 3 | 4 | 5;
  mood: 'calme' | 'tendu' | 'grave' | 'euphorique' | 'melancolique';
  text: string;
}

export interface MatignonResult {
  decision: MatignonChoice;
  outcome: NegotiationOutcome;
  transition: TransitionBeat;
  tableRead: string;
  debrief: string[];
}

export type MatignonSkillKey =
  | 'mandateCraft'
  | 'tableReading'
  | 'concessionDesign'
  | 'coalitionBuilding'
  | 'legalStrategy'
  | 'publicNarrative'
  | 'conflictTiming'
  | 'institutionalMemory'
  | 'ethicalClarity';

export interface MatignonLearningProfile {
  scores: Record<MatignonSkillKey, number>;
  primarySkill: MatignonSkillKey;
  recommendation: string;
  signals: Array<{
    skill: MatignonSkillKey;
    label: string;
    delta: number;
    reason: string;
  }>;
}

export interface MatignonSessionMetrics {
  baseTrust: number;
  employerPressure: number;
  statePatience: number;
  publicLegibility: number;
  institutionalDraft: number;
}

export interface MatignonHistoryEntry {
  turn: number;
  move: MatignonMove;
  tableRead: string;
  actorIntent: AgentIntent;
  transition: TransitionBeat;
}

export interface MatignonSessionState {
  phase: MatignonPhase;
  turn: number;
  mandate: Mandate;
  metrics: MatignonSessionMetrics;
  history: MatignonHistoryEntry[];
  result: MatignonResult | null;
}

export interface MatignonReplayLog {
  schemaVersion: 1;
  scenarioId: 'matignon-1936';
  engineVersion: '0.0.1';
  path: MatignonMoveId[];
  finalPhase: MatignonPhase;
  finalMetrics: MatignonSessionMetrics;
  history: Array<{
    turn: number;
    moveId: MatignonMoveId;
    actorIntent: AgentIntent;
    transition: TransitionBeat['trigger'];
  }>;
  result: {
    agreementId: string | null;
    ruptureReason: string | null;
    averageQuality: number | null;
    quality: AgreementQuality | null;
  };
  learning: MatignonLearningProfile;
  audit: MatignonAuditReport;
}

export interface MatignonAuditReport {
  ok: boolean;
  warnings: string[];
  invariantChecks: Array<{
    id: string;
    ok: boolean;
    detail: string;
  }>;
}

export interface MatignonPathSimulation {
  path: MatignonMoveId[];
  state: MatignonSessionState;
  replay: MatignonReplayLog;
}

export const MATIGNON_BRIEF = {
  title: 'Hotel Matignon',
  date: '7 juin 1936',
  situation:
    'La greve occupe le pays. La base veut des gains visibles. Le patronat veut sortir sans humiliation. L Etat veut un accord vite.',
  learningGoal:
    'Lire une table ou chaque camp doit pouvoir rentrer chez lui sans perdre la face.'
} as const;

export function createMatignonMandate(): Mandate {
  return {
    objectives: [
      { id: 'wage-increase', label: 'Hausses de salaires immediates', priority: 5 },
      { id: 'collective-bargaining', label: 'Reconnaissance des conventions collectives', priority: 5 },
      { id: 'paid-leave', label: 'Conquete symbolique du temps libre', priority: 4 }
    ],
    redLines: [
      {
        id: 'no-recognition',
        label: 'Aucune reconnaissance collective',
        visibility: 'internal',
        severity: 5
      },
      {
        id: 'end-strike-without-gains',
        label: 'Reprise sans gain visible',
        visibility: 'public',
        severity: 4
      }
    ],
    acceptableConcessions: [
      { id: 'calendar-delay', label: 'Calendrier de mise en oeuvre differe', cost: 2 },
      { id: 'commission-followup', label: 'Commission de suivi', cost: 1 },
      { id: 'employer-face-saving', label: 'Formulation qui sauve la face patronale', cost: 2 }
    ],
    baseTransparency: 75,
    internalSupport: 72
  };
}

export const MATIGNON_CHOICES: MatignonChoice[] = [
  {
    id: 'sign-balanced',
    label: 'Signer le compromis central',
    intent: 'Transformer le rapport de force en droits durables.',
    risk: 'La base peut trouver la sortie trop rapide.',
    offer: {
      from: 'employeurs',
      claims: ['wage-increase', 'collective-bargaining', 'paid-leave'],
      concessions: ['employer-face-saving', 'commission-followup'],
      framing: 'legal'
    }
  },
  {
    id: 'suspend-consult',
    label: 'Suspendre pour consulter la base',
    intent: 'Renforcer le mandat avant signature.',
    risk: 'L Etat et le patronat peuvent reprendre le calendrier.',
    offer: {
      from: 'etat',
      claims: ['collective-bargaining'],
      concessions: ['calendar-delay', 'commission-followup'],
      framing: 'cooperation'
    }
  },
  {
    id: 'harden-wages',
    label: 'Durcir sur les salaires',
    intent: 'Utiliser le pic de greve pour arracher plus.',
    risk: 'Le patronat peut transformer la discussion en crise d ordre.',
    offer: {
      from: 'salaries',
      claims: ['wage-increase', 'wage-increase', 'collective-bargaining'],
      concessions: [],
      framing: 'pressure'
    }
  },
  {
    id: 'walk-out',
    label: 'Quitter la table',
    intent: 'Refuser un texte juge trop fragile.',
    risk: 'La rupture donne a l Etat le role de restaurer l ordre.',
    offer: {
      from: 'salaries',
      claims: ['wage-increase'],
      concessions: ['no-recognition'],
      framing: 'public'
    }
  }
];

export const MATIGNON_SESSION_MOVES: MatignonMove[] = [
  {
    id: 'clarify-mandate',
    phase: 'opening',
    label: 'Clarifier le mandat avant d ouvrir',
    intent: 'Faire entrer la base dans la salle sans la faire parler directement.',
    risk: 'Le patronat et l Etat sentent que tu ne peux plus bouger librement.'
  },
  {
    id: 'open-maximal',
    phase: 'opening',
    label: 'Ouvrir haut, mais plausible',
    intent: 'Ancrer la table sur les salaires et la reconnaissance collective.',
    risk: 'Une ouverture trop haute peut etre recadree comme irresponsable.'
  },
  {
    id: 'accept-state-frame',
    phase: 'opening',
    label: 'Accepter le cadrage de l Etat',
    intent: 'Gagner une architecture juridique et garder la mediation active.',
    risk: 'La base peut sentir une capture institutionnelle.'
  },
  {
    id: 'trade-face-for-rights',
    phase: 'counter',
    label: 'Sauver la face patronale contre des droits',
    intent: 'Laisser une sortie honorable pour obtenir du durable.',
    risk: 'La victoire sera moins lisible dans la rue.'
  },
  {
    id: 'leak-to-press',
    phase: 'counter',
    label: 'Laisser filtrer la pression de la rue',
    intent: 'Rendre le cout public de l echec plus lourd pour les autres.',
    risk: 'La fuite peut fermer une porte de compromis prive.'
  },
  {
    id: 'technical-commission',
    phase: 'counter',
    label: 'Exiger une commission de suivi',
    intent: 'Transformer la promesse en dispositif controlable.',
    risk: 'Le geste semble technique alors que la base attend du concret.'
  },
  ...MATIGNON_CHOICES.map(choice => ({
    id: choice.id,
    phase: 'ratification' as const,
    label: choice.label,
    intent: choice.intent,
    risk: choice.risk
  }))
];

export function startMatignonSession(): MatignonSessionState {
  return {
    phase: 'opening',
    turn: 1,
    mandate: createMatignonMandate(),
    metrics: {
      baseTrust: 72,
      employerPressure: 68,
      statePatience: 58,
      publicLegibility: 52,
      institutionalDraft: 35
    },
    history: [],
    result: null
  };
}

export function availableMatignonMoves(state: MatignonSessionState): MatignonMove[] {
  if (state.phase === 'ended') return [];
  return MATIGNON_SESSION_MOVES.filter(move => move.phase === state.phase);
}

export function applyMatignonMove(
  state: MatignonSessionState,
  moveId: MatignonMoveId
): MatignonSessionState {
  if (state.phase === 'ended') return state;
  const move = availableMatignonMoves(state).find(item => item.id === moveId);
  if (!move) {
    /* Mouvement non disponible dans cette phase — retourner l'état intact.
       Évite un crash si l'UI appelle applyMatignonMove avec un id hors-phase
       (ex. race condition, replay partiel, test unitaire). */
    console.warn(`[Matignon] Move ${moveId} is not available during phase ${state.phase}`);
    return state;
  }

  if (move.phase === 'ratification') {
    const result = adjustResultForSession(
      resolveMatignonDecision(move.id as MatignonDecisionId, state.mandate),
      state
    );
    return {
      ...state,
      phase: 'ended',
      turn: state.turn + 1,
      history: [
        ...state.history,
        {
          turn: state.turn,
          move,
          tableRead: result.tableRead,
          actorIntent: actorIntentFor(move.id, state),
          transition: result.transition
        }
      ],
      result
    };
  }

  const metrics = applyMoveMetrics(state.metrics, move.id);
  const nextPhase: MatignonPhase = move.phase === 'opening' ? 'counter' : 'ratification';
  const transition = transitionForSessionMove(move.id);
  return {
    ...state,
    phase: nextPhase,
    turn: state.turn + 1,
    metrics,
    history: [
      ...state.history,
      {
        turn: state.turn,
        move,
        tableRead: sessionTableReadFor(move.id),
        actorIntent: actorIntentFor(move.id, { ...state, metrics }),
        transition
      }
    ],
    result: null
  };
}

export function resetMatignonSession(): MatignonSessionState {
  return startMatignonSession();
}

export function buildMatignonReplay(state: MatignonSessionState): MatignonReplayLog {
  const quality = state.result?.outcome.quality ?? null;
  return {
    schemaVersion: 1,
    scenarioId: 'matignon-1936',
    engineVersion: '0.0.1',
    path: state.history.map(entry => entry.move.id),
    finalPhase: state.phase,
    finalMetrics: state.metrics,
    history: state.history.map(entry => ({
      turn: entry.turn,
      moveId: entry.move.id,
      actorIntent: entry.actorIntent,
      transition: entry.transition.trigger
    })),
    result: {
      agreementId: state.result?.outcome.agreementId ?? null,
      ruptureReason: state.result?.outcome.ruptureReason ?? null,
      averageQuality: quality ? averageQuality(quality) : null,
      quality
    },
    learning: evaluateMatignonLearning(state),
    audit: auditMatignonSession(state)
  };
}

export function auditMatignonSession(state: MatignonSessionState): MatignonAuditReport {
  const invariantChecks: MatignonAuditReport['invariantChecks'] = [
    {
      id: 'metrics-bounded',
      ok: Object.values(state.metrics).every(value => value >= 0 && value <= 100),
      detail: 'Toutes les metriques de table doivent rester entre 0 et 100.'
    },
    {
      id: 'ended-has-result',
      ok: state.phase !== 'ended' || state.result !== null,
      detail: 'Une session terminee doit avoir un resultat.'
    },
    {
      id: 'history-turns-match',
      ok: state.history.every((entry, index) => entry.turn === index + 1),
      detail: 'Le journal doit suivre l ordre exact des tours.'
    },
    {
      id: 'agent-intents-bounded',
      ok: state.history.every(entry =>
        entry.actorIntent.pressure >= 0 &&
        entry.actorIntent.pressure <= 100 &&
        entry.actorIntent.confidence >= 0 &&
        entry.actorIntent.confidence <= 1
      ),
      detail: 'Les intentions d acteurs doivent rester dans leur schema.'
    }
  ];
  const warnings: string[] = [];
  if (state.phase !== 'ended') {
    warnings.push('Session encore ouverte : le replay est partiel.');
  }
  if (state.result?.outcome.agreementId && state.result.outcome.quality.durability < 50) {
    warnings.push('Accord signe avec durabilite faible : risque de victoire courte.');
  }
  if (state.result?.outcome.ruptureReason) {
    warnings.push('Rupture : le recit public devient une ressource critique.');
  }
  return {
    ok: invariantChecks.every(check => check.ok),
    warnings,
    invariantChecks
  };
}

export function simulateAllMatignonPaths(): MatignonPathSimulation[] {
  const simulations: MatignonPathSimulation[] = [];
  const initial = startMatignonSession();
  for (const opening of availableMatignonMoves(initial)) {
    const afterOpening = applyMatignonMove(initial, opening.id);
    for (const counter of availableMatignonMoves(afterOpening)) {
      const afterCounter = applyMatignonMove(afterOpening, counter.id);
      for (const final of availableMatignonMoves(afterCounter)) {
        const state = applyMatignonMove(afterCounter, final.id);
        simulations.push({
          path: [opening.id, counter.id, final.id],
          state,
          replay: buildMatignonReplay(state)
        });
      }
    }
  }
  return simulations;
}

export function evaluateMatignonLearning(
  state: MatignonSessionState
): MatignonLearningProfile {
  const scores: Record<MatignonSkillKey, number> = {
    mandateCraft: 45,
    tableReading: 45,
    concessionDesign: 40,
    coalitionBuilding: 40,
    legalStrategy: 40,
    publicNarrative: 40,
    conflictTiming: 45,
    institutionalMemory: 35,
    ethicalClarity: 50
  };
  const signals: MatignonLearningProfile['signals'] = [];

  for (const entry of state.history) {
    for (const signal of learningSignalsForMove(entry.move.id)) {
      scores[signal.skill] = clampMetric(scores[signal.skill] + signal.delta);
      signals.push(signal);
    }
  }

  if (state.result) {
    const quality = state.result.outcome.quality;
    if (quality.legalStrength >= 70) {
      addSignal(signals, scores, 'legalStrategy', 8, 'Tu as securise le texte au lieu de rester au seul rapport de force.');
    }
    if (quality.internalAcceptability >= 75) {
      addSignal(signals, scores, 'mandateCraft', 8, 'La signature reste compatible avec le mandat interne.');
    }
    if (quality.durability >= 70) {
      addSignal(signals, scores, 'institutionalMemory', 10, 'Tu as transforme une crise courte en dispositif qui peut durer.');
    }
    if (!state.result.outcome.agreementId) {
      addSignal(signals, scores, 'publicNarrative', -8, 'La rupture exige un recit public tres solide pour ne pas etre retournee contre toi.');
    }
  }

  const entries = Object.entries(scores) as Array<[MatignonSkillKey, number]>;
  const [primarySkill] = entries.reduce((best, item) => item[1] > best[1] ? item : best);
  return {
    scores,
    primarySkill,
    recommendation: recommendationFor(primarySkill, scores[primarySkill]),
    signals: signals.slice(-6)
  };
}

export function resolveMatignonDecision(
  decisionId: MatignonDecisionId,
  mandate: Mandate = createMatignonMandate()
): MatignonResult {
  const decision = MATIGNON_CHOICES.find(choice => choice.id === decisionId);
  if (!decision) {
    throw new Error(`Unknown Matignon decision: ${decisionId}`);
  }
  const outcome = tuneMatignonOutcome(decision.id, resolveNegotiation({
    mandate,
    offer: decision.offer
  }));

  return {
    decision,
    outcome,
    transition: transitionFor(decision.id, outcome),
    tableRead: tableReadFor(decision.id),
    debrief: debriefFor(decision.id, outcome.quality)
  };
}

function tuneMatignonOutcome(
  decisionId: MatignonDecisionId,
  outcome: NegotiationOutcome
): NegotiationOutcome {
  if (decisionId === 'sign-balanced') {
    return {
      ...outcome,
      agreementId: 'matignon-1936',
      quality: {
        ...outcome.quality,
        materialGain: 82,
        legalStrength: 78,
        internalAcceptability: 68,
        publicLegibility: 74,
        durability: 76
      }
    };
  }
  if (decisionId === 'suspend-consult') {
    return {
      ...outcome,
      agreementId: 'matignon-delayed',
      quality: {
        ...outcome.quality,
        materialGain: 54,
        legalStrength: 62,
        internalAcceptability: 84,
        publicLegibility: 58,
        durability: 66
      }
    };
  }
  if (decisionId === 'harden-wages') {
    return {
      ...outcome,
      agreementId: 'matignon-under-pressure',
      quality: {
        ...outcome.quality,
        materialGain: 88,
        legalStrength: 48,
        internalAcceptability: 76,
        publicLegibility: 61,
        durability: 44
      }
    };
  }
  return outcome;
}

function transitionFor(
  decisionId: MatignonDecisionId,
  outcome: NegotiationOutcome
): TransitionBeat {
  if (!outcome.agreementId) {
    return {
      trigger: 'table_broken',
      intensity: 5,
      mood: 'grave',
      text: 'Une chaise recule. Les micros captent un murmure, puis la porte se referme.'
    };
  }
  if (decisionId === 'suspend-consult') {
    return {
      trigger: 'table_suspended',
      intensity: 3,
      mood: 'tendu',
      text: 'Les dossiers restent ouverts. La salle attend la reponse de la base.'
    };
  }
  if (decisionId === 'harden-wages') {
    return {
      trigger: 'strike_escalation',
      intensity: 4,
      mood: 'tendu',
      text: 'La table tremble sous le poids de la rue. La victoire coute deja plus cher.'
    };
  }
  return {
    trigger: 'agreement_signed',
    intensity: 4,
    mood: 'euphorique',
    text: 'Le stylo avance. L accord prend forme, mais la greve n a pas encore parle.'
  };
}

function tableReadFor(decisionId: MatignonDecisionId): string {
  const reads: Record<MatignonDecisionId, string> = {
    'sign-balanced':
      'Tu lis que la fenetre est ouverte : le patronat veut sortir, l Etat veut conclure, la base veut des preuves.',
    'suspend-consult':
      'Tu proteges ton mandat, mais tu offres au calendrier une chance de se retourner contre toi.',
    'harden-wages':
      'Tu sens le pic de rapport de force. Le risque est de gagner plus de salaire et moins d institution.',
    'walk-out':
      'Tu refuses la capture symbolique. Mais la rupture donne aux autres le pouvoir de raconter ton geste.'
  };
  return reads[decisionId];
}

function debriefFor(
  decisionId: MatignonDecisionId,
  quality: AgreementQuality
): string[] {
  const common = [
    `Qualite materielle: ${quality.materialGain}/100.`,
    `Solidite juridique: ${quality.legalStrength}/100.`,
    `Acceptabilite interne: ${quality.internalAcceptability}/100.`
  ];
  const byDecision: Record<MatignonDecisionId, string> = {
    'sign-balanced':
      'Competence travaillee: transformer une greve en institution sans effacer la tension de la base.',
    'suspend-consult':
      'Competence travaillee: ralentir pour renforcer le mandat, tout en surveillant le calendrier politique.',
    'harden-wages':
      'Competence travaillee: distinguer gain immediat et durabilite institutionnelle.',
    'walk-out':
      'Competence travaillee: rompre sans laisser l adversaire capturer le recit public.'
  };
  return [byDecision[decisionId], ...common];
}

function applyMoveMetrics(
  metrics: MatignonSessionMetrics,
  moveId: MatignonMoveId
): MatignonSessionMetrics {
  const deltaByMove: Partial<Record<MatignonMoveId, Partial<MatignonSessionMetrics>>> = {
    'clarify-mandate': {
      baseTrust: 10,
      statePatience: -5,
      publicLegibility: 4
    },
    'open-maximal': {
      employerPressure: 11,
      statePatience: -8,
      publicLegibility: 7
    },
    'accept-state-frame': {
      statePatience: 12,
      institutionalDraft: 10,
      baseTrust: -8
    },
    'trade-face-for-rights': {
      employerPressure: -10,
      institutionalDraft: 18,
      publicLegibility: -4
    },
    'leak-to-press': {
      employerPressure: 8,
      statePatience: -12,
      publicLegibility: 16,
      baseTrust: 4
    },
    'technical-commission': {
      institutionalDraft: 16,
      baseTrust: -4,
      publicLegibility: -5
    }
  };
  const delta = deltaByMove[moveId] ?? {};
  return {
    baseTrust: clampMetric(metrics.baseTrust + (delta.baseTrust ?? 0)),
    employerPressure: clampMetric(metrics.employerPressure + (delta.employerPressure ?? 0)),
    statePatience: clampMetric(metrics.statePatience + (delta.statePatience ?? 0)),
    publicLegibility: clampMetric(metrics.publicLegibility + (delta.publicLegibility ?? 0)),
    institutionalDraft: clampMetric(metrics.institutionalDraft + (delta.institutionalDraft ?? 0))
  };
}

function adjustResultForSession(
  result: MatignonResult,
  state: MatignonSessionState
): MatignonResult {
  if (!result.outcome.agreementId) {
    return {
      ...result,
      debrief: [
        'La rupture est aussi une bataille de recit : qui expliquera pourquoi la table a casse ?',
        ...result.debrief
      ]
    };
  }
  const metrics = state.metrics;
  const quality: AgreementQuality = {
    materialGain: clampMetric(result.outcome.quality.materialGain + Math.round((metrics.employerPressure - 65) * 0.35)),
    legalStrength: clampMetric(result.outcome.quality.legalStrength + Math.round((metrics.institutionalDraft - 50) * 0.45)),
    internalAcceptability: clampMetric(result.outcome.quality.internalAcceptability + Math.round((metrics.baseTrust - 70) * 0.55)),
    publicLegibility: clampMetric(result.outcome.quality.publicLegibility + Math.round((metrics.publicLegibility - 55) * 0.5)),
    durability: clampMetric(result.outcome.quality.durability + Math.round((metrics.institutionalDraft - 50) * 0.4))
  };
  return {
    ...result,
    outcome: {
      ...result.outcome,
      quality
    },
    debrief: [
      sessionDebrief(state),
      ...debriefFor(result.decision.id, quality)
    ]
  };
}

function transitionForSessionMove(moveId: MatignonMoveId): TransitionBeat {
  const transitions: Partial<Record<MatignonMoveId, TransitionBeat>> = {
    'clarify-mandate': {
      trigger: 'table_suspended',
      intensity: 2,
      mood: 'calme',
      text: 'Dans le couloir, les delegues reviennent vers la salle avec un mandat plus net.'
    },
    'open-maximal': {
      trigger: 'strike_escalation',
      intensity: 4,
      mood: 'tendu',
      text: 'Les revendications arrivent haut. Le patronat encaisse, l Etat regarde l horloge.'
    },
    'accept-state-frame': {
      trigger: 'table_suspended',
      intensity: 2,
      mood: 'grave',
      text: 'La mediation ministerielle range les papiers. La table devient plus etroite, mais plus solide.'
    },
    'trade-face-for-rights': {
      trigger: 'agreement_signed',
      intensity: 3,
      mood: 'calme',
      text: 'Une phrase sauve la face patronale. En echange, le droit gagne une place dans le texte.'
    },
    'leak-to-press': {
      trigger: 'strike_escalation',
      intensity: 4,
      mood: 'tendu',
      text: 'Un titre circule avant la fin de la seance. Le dehors entre dans la salle.'
    },
    'technical-commission': {
      trigger: 'table_suspended',
      intensity: 2,
      mood: 'calme',
      text: 'Les juristes annotent les marges. La victoire devient moins visible, mais plus controlable.'
    }
  };
  return transitions[moveId] ?? {
    trigger: 'table_suspended',
    intensity: 2,
    mood: 'calme',
    text: 'La table change de forme.'
  };
}

function sessionTableReadFor(moveId: MatignonMoveId): string {
  const reads: Partial<Record<MatignonMoveId, string>> = {
    'clarify-mandate':
      'Tu gagnes en legitimite interne. En contrepartie, chaque concession future sera plus surveillee.',
    'open-maximal':
      'Tu ancres la table haut. C est utile si le rapport de force tient, dangereux si l Etat recadre.',
    'accept-state-frame':
      'Tu gardes l Etat dans la salle. Le prix est une partie de ton autonomie narrative.',
    'trade-face-for-rights':
      'Tu comprends que sauver la face adverse peut acheter du droit durable.',
    'leak-to-press':
      'Tu deplaces la negociation vers l opinion. Cela augmente la pression, mais reduit le secret utile.',
    'technical-commission':
      'Tu investis dans l application. C est moins brillant, mais souvent plus durable.'
  };
  return reads[moveId] ?? 'La table attend ta decision finale.';
}

function actorIntentFor(
  moveId: MatignonMoveId,
  state: Pick<MatignonSessionState, 'metrics'>
): AgentIntent {
  if (moveId === 'clarify-mandate') {
    return {
      actor: 'etat',
      strategy: 'temporisation',
      pressure: 44,
      confidence: 0.72,
      justification: 'Temporiser legerement pour voir si la base valide vraiment la sortie.'
    };
  }
  if (moveId === 'open-maximal') {
    return {
      actor: 'adversaire',
      strategy: 'durcissement',
      pressure: 72,
      confidence: 0.68,
      justification: 'Tester si la menace salariale est un ancrage ou une vraie ligne rouge.'
    };
  }
  if (moveId === 'accept-state-frame') {
    return {
      actor: 'etat',
      strategy: 'mediation',
      pressure: 58,
      confidence: 0.78,
      justification: 'Garder la main sur le calendrier et transformer la greve en texte negociable.'
    };
  }
  if (moveId === 'trade-face-for-rights') {
    return {
      actor: 'adversaire',
      strategy: 'compromis',
      pressure: 46,
      confidence: 0.7,
      justification: 'Accepter une reconnaissance si la sortie publique reste honorable.'
    };
  }
  if (moveId === 'leak-to-press') {
    return {
      actor: 'opinion',
      strategy: 'communication',
      pressure: 76,
      confidence: 0.64,
      justification: 'Simplifier le conflit en victoire ou blocage, sans attendre les clauses.'
    };
  }
  if (moveId === 'technical-commission') {
    return {
      actor: 'etat',
      strategy: 'mediation',
      pressure: 38,
      confidence: 0.76,
      justification: 'Preferer un dispositif de suivi a une promesse spectaculaire.'
    };
  }
  if (state.metrics.statePatience < 40) {
    return {
      actor: 'etat',
      strategy: 'temporisation',
      pressure: 82,
      confidence: 0.74,
      justification: 'Conclure vite, quitte a reprendre le recit si la table casse.'
    };
  }
  if (state.metrics.baseTrust < 65) {
    return {
      actor: 'base',
      strategy: 'durcissement',
      pressure: 78,
      confidence: 0.7,
      justification: 'Surveiller la signature et chercher le signe d une concession cachee.'
    };
  }
  return {
    actor: 'adversaire',
    strategy: 'compromis',
    pressure: 52,
    confidence: 0.62,
    justification: 'Mesurer si l accord peut etre annonce sans humiliation publique.'
  };
}

function sessionDebrief(state: MatignonSessionState): string {
  if (state.metrics.institutionalDraft >= 68) {
    return 'Tu as investi dans la durabilite : le texte a moins d eclat immediat, mais plus de chances de survivre.';
  }
  if (state.metrics.publicLegibility >= 70) {
    return 'Tu as gagne le recit public. La question est maintenant de transformer cette clarte en application.';
  }
  if (state.metrics.baseTrust >= 80) {
    return 'Tu as protege le mandat. Cette force interne rend chaque signature plus credible.';
  }
  return 'Tu as garde plusieurs portes ouvertes, mais aucune dimension de la table ne domine clairement.';
}

function clampMetric(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function averageQuality(quality: AgreementQuality): number {
  const values = Object.values(quality);
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function learningSignalsForMove(moveId: MatignonMoveId): MatignonLearningProfile['signals'] {
  const signals: Partial<Record<MatignonMoveId, MatignonLearningProfile['signals']>> = {
    'clarify-mandate': [
      {
        skill: 'mandateCraft',
        label: 'Mandat clarifie',
        delta: 18,
        reason: 'Tu as renforce le lien entre la table et ceux que tu representes.'
      },
      {
        skill: 'ethicalClarity',
        label: 'Ligne assumee',
        delta: 6,
        reason: 'Une concession future sera plus lisible car le mandat est pose.'
      }
    ],
    'open-maximal': [
      {
        skill: 'conflictTiming',
        label: 'Ancrage haut',
        delta: 14,
        reason: 'Tu utilises le moment fort de la greve comme levier.'
      },
      {
        skill: 'tableReading',
        label: 'Lecture du pic',
        delta: 7,
        reason: 'Tu identifies que la pression patronale est deja elevee.'
      }
    ],
    'accept-state-frame': [
      {
        skill: 'legalStrategy',
        label: 'Cadrage juridique',
        delta: 14,
        reason: 'Tu transformes le conflit en texte negociable.'
      },
      {
        skill: 'institutionalMemory',
        label: 'Long terme',
        delta: 8,
        reason: 'L Etat peut stabiliser l accord, mais aussi le borner.'
      }
    ],
    'trade-face-for-rights': [
      {
        skill: 'concessionDesign',
        label: 'Concession offensive',
        delta: 16,
        reason: 'Tu cedes du symbole pour acheter du droit durable.'
      },
      {
        skill: 'coalitionBuilding',
        label: 'Sortie honorable',
        delta: 9,
        reason: 'Tu permets a l adversaire de signer sans capitulation publique.'
      }
    ],
    'leak-to-press': [
      {
        skill: 'publicNarrative',
        label: 'Recit public',
        delta: 15,
        reason: 'Tu fais entrer l opinion dans la salle.'
      },
      {
        skill: 'tableReading',
        label: 'Risque de fermeture',
        delta: -4,
        reason: 'La publicite reduit la marge des apartes.'
      }
    ],
    'technical-commission': [
      {
        skill: 'institutionalMemory',
        label: 'Application',
        delta: 15,
        reason: 'Tu transformes une promesse en dispositif controlable.'
      },
      {
        skill: 'legalStrategy',
        label: 'Suivi',
        delta: 8,
        reason: 'Tu anticipes le probleme de mise en oeuvre.'
      }
    ],
    'sign-balanced': [
      {
        skill: 'tableReading',
        label: 'Fenetre saisie',
        delta: 12,
        reason: 'Tu signes quand les trois acteurs ont encore interet a conclure.'
      }
    ],
    'suspend-consult': [
      {
        skill: 'mandateCraft',
        label: 'Consultation',
        delta: 12,
        reason: 'Tu ralentis pour proteger l acceptabilite interne.'
      }
    ],
    'harden-wages': [
      {
        skill: 'conflictTiming',
        label: 'Pic de force',
        delta: 10,
        reason: 'Tu pousses au moment ou le rapport de force est visible.'
      }
    ],
    'walk-out': [
      {
        skill: 'ethicalClarity',
        label: 'Rupture assumee',
        delta: 9,
        reason: 'Tu refuses un accord qui touche une ligne rouge.'
      }
    ]
  };
  return signals[moveId] ?? [];
}

function addSignal(
  signals: MatignonLearningProfile['signals'],
  scores: Record<MatignonSkillKey, number>,
  skill: MatignonSkillKey,
  delta: number,
  reason: string
) {
  scores[skill] = clampMetric(scores[skill] + delta);
  signals.push({
    skill,
    label: delta >= 0 ? 'Renforcement' : 'Alerte',
    delta,
    reason
  });
}

function recommendationFor(skill: MatignonSkillKey, score: number): string {
  const label: Record<MatignonSkillKey, string> = {
    mandateCraft: 'construction du mandat',
    tableReading: 'lecture de table',
    concessionDesign: 'design de concession',
    coalitionBuilding: 'construction de coalition',
    legalStrategy: 'strategie juridique',
    publicNarrative: 'recit public',
    conflictTiming: 'timing du conflit',
    institutionalMemory: 'memoire institutionnelle',
    ethicalClarity: 'clarte ethique'
  };
  if (score >= 70) {
    return `Point fort actuel : ${label[skill]}. Rejoue en cherchant a garder cette force avec une autre tactique.`;
  }
  return `Competence a travailler : ${label[skill]}. Rejoue la table en observant ce que cette dimension change.`;
}
