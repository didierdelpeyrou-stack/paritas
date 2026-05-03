/* ============================================================
   Paritas — Engine de La Table des Négociations
   ============================================================
   Logique pure : applique des actions à un NegotiationState et
   produit un nouvel état. Compatible bots IA (boucle simple) et
   joueur humain (UI Svelte).
   ============================================================ */

import type {
  AccordArticle, Actor, ActorId, Concession, ConcessionType,
  NegotiationState, TableOutcome
} from './types';
import { seededRandom } from '../seed';

/* ====== Helpers ====== */

function clamp(v: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, v));
}

function nextSpeaker(state: NegotiationState): ActorId | null {
  if (!state.currentSpeaker) return state.speakingOrder[0]!;
  const idx = state.speakingOrder.indexOf(state.currentSpeaker);
  if (idx < 0) return state.speakingOrder[0]!;
  return state.speakingOrder[(idx + 1) % state.speakingOrder.length]!;
}

function findActor(state: NegotiationState, id: ActorId): Actor | undefined {
  return state.actors.find(a => a.persona.id === id);
}

/* ====== Cost calc ====== */

/** Coût Mandat d'une concession selon distance à la ligne rouge.
 *  Plus l'acteur s'éloigne, plus ça coûte cher. */
export function concessionMandatCost(actor: Actor, articleDistance: number): number {
  const distance = Math.max(0, articleDistance);
  const threshold = actor.redLine.realThreshold;
  if (distance <= threshold) return Math.round(distance * 0.4);
  // Au-delà du seuil : coût exponentiel
  const overshoot = distance - threshold;
  return Math.round(threshold * 0.4 + overshoot * 1.6);
}

/* ====== Actions ====== */

export interface OfferConcessionInput {
  by: ActorId;
  type: ConcessionType;
  articleId?: string;
  newText?: string;
  /** Distance estimée à la ligne rouge si concession acceptée. 0-100. */
  estimatedDistance?: number;
}

export function offerConcession(
  state: NegotiationState,
  input: OfferConcessionInput
): NegotiationState {
  const actor = findActor(state, input.by);
  if (!actor) return state;

  const distance = input.estimatedDistance ?? 30;
  const cost = concessionMandatCost(actor, distance);

  const concession: Concession = {
    id: `c-${state.concessions.length + 1}`,
    by: input.by,
    type: input.type,
    articleId: input.articleId,
    newText: input.newText,
    mandatCost: cost,
    turn: state.turn
  };

  /* Applique le coût Mandat sur l'acteur. */
  const newActors = state.actors.map(a =>
    a.persona.id === input.by
      ? { ...a, resources: { ...a.resources, mandat: clamp(a.resources.mandat - cost) } }
      : a
  );

  /* Applique la modification au draft. */
  let newDraft = state.draft;
  if (input.type === 'add-article' && input.newText) {
    newDraft = [
      ...state.draft,
      {
        id: `art-${state.draft.length + 1}-${Date.now()}`,
        text: input.newText,
        proposedBy: [input.by],
        opposedBy: [],
        redLineDistance: Object.fromEntries(
          state.actors.map(a => [a.persona.id, distance])
        )
      }
    ];
  } else if (input.type === 'remove-article' && input.articleId) {
    newDraft = state.draft.filter(a => a.id !== input.articleId);
  } else if (input.type === 'modify-article' && input.articleId && input.newText) {
    newDraft = state.draft.map(a =>
      a.id === input.articleId ? { ...a, text: input.newText! } : a
    );
  } else if (input.type === 'support' && input.articleId) {
    newDraft = state.draft.map(a =>
      a.id === input.articleId
        ? { ...a, proposedBy: Array.from(new Set([...a.proposedBy, input.by])) }
        : a
    );
  } else if (input.type === 'oppose' && input.articleId) {
    newDraft = state.draft.map(a =>
      a.id === input.articleId
        ? { ...a, opposedBy: Array.from(new Set([...a.opposedBy, input.by])) }
        : a
    );
  }

  return {
    ...state,
    actors: newActors,
    draft: newDraft,
    concessions: [...state.concessions, concession]
  };
}

/* ====== Phase transitions ====== */

export function advanceTurn(state: NegotiationState): NegotiationState {
  const newTurn = state.turn + 1;
  const newSpeaker = nextSpeaker(state);

  /* Phases :
   * Tours 1-3 : opening  (chaque acteur présente)
   * Tours 4-8 : concessions
   * Tour 9    : vote */
  let newPhase = state.phase;
  if (newTurn === 4) newPhase = 'concessions';
  else if (newTurn === 9) newPhase = 'vote';
  else if (newTurn > 9) newPhase = 'outcome';

  return {
    ...state,
    turn: newTurn,
    phase: newPhase,
    currentSpeaker: newPhase === 'vote' || newPhase === 'outcome' ? null : newSpeaker
  };
}

/* ====== Vote ====== */

export function castVote(
  state: NegotiationState,
  actorId: ActorId,
  vote: 'oui' | 'non' | 'abstention'
): NegotiationState {
  return {
    ...state,
    actors: state.actors.map(a =>
      a.persona.id === actorId ? { ...a, vote } : a
    )
  };
}

export function tallyVotes(state: NegotiationState): { oui: number; non: number; abstention: number; total: number } {
  let oui = 0, non = 0, abstention = 0;
  for (const a of state.actors) {
    if (a.vote === 'oui') oui++;
    else if (a.vote === 'non') non++;
    else if (a.vote === 'abstention') abstention++;
  }
  return { oui, non, abstention, total: state.actors.length };
}

export function isAccordValidated(state: NegotiationState): boolean {
  const t = tallyVotes(state);
  if (state.validation === 'unanimite') return t.oui === t.total;
  if (state.validation === 'majorite-qualifiee') return t.oui >= Math.ceil(t.total * 0.75);
  if (state.validation === 'majorite-simple') return t.oui > t.non;
  return false;
}

/* ====== Outcome ====== */

export function computeOutcome(state: NegotiationState): TableOutcome {
  const t = tallyVotes(state);
  const allVoted = state.actors.every(a => a.vote !== null);
  const validated = isAccordValidated(state);

  const playerActor = state.actors.find(a => a.isPlayer);
  if (!playerActor) {
    return {
      result: 'impasse',
      epilogue: 'Aucun joueur identifié — session annulée.',
      playerEffects: { mandat: 0, caisse: 0, legitimite: 0, honteFierte: 0 },
      signedArticles: []
    };
  }

  if (validated) {
    /* Accord signé. Vérifier si la ligne rouge du joueur est respectée. */
    const lineRespected = !state.draft.some(art =>
      (art.redLineDistance[playerActor.persona.id] ?? 0) > playerActor.redLine.realThreshold
    );

    return {
      result: 'signe',
      epilogue: lineRespected
        ? `L'ordonnance est promulguée. Tu as obtenu ce que tu défendais — ${playerActor.redLine.topic.toLowerCase()} est dans le texte. Les quatre signatures sont sur le papier le 4 octobre.`
        : `L'ordonnance est promulguée, mais ta ligne rouge (${playerActor.redLine.topic.toLowerCase()}) a cédé. Tu signes par discipline collective. L'histoire en gardera trace.`,
      playerEffects: {
        mandat: lineRespected ? +30 : -25,
        caisse: +15,
        legitimite: lineRespected ? +20 : +5,
        honteFierte: lineRespected ? +25 : -15,
        flag: 'secu_1945_signee'
      },
      signedArticles: state.draft
    };
  }

  if (t.oui >= 1 && allVoted) {
    /* Accord forcé minoritaire — quelqu'un a passé en force */
    return {
      result: 'force-minoritaire',
      epilogue: 'L\'accord n\'a pas l\'unanimité requise. Croizat passe en force par ordonnance ministérielle. Le texte est promulgué mais sa légitimité est blessée.',
      playerEffects: {
        mandat: -40,
        caisse: +10,
        legitimite: -50,
        honteFierte: -30,
        flag: 'secu_1945_imposee'
      },
      signedArticles: state.draft
    };
  }

  /* Impasse — séance levée sans accord */
  return {
    result: 'impasse',
    epilogue: 'La séance est levée sans accord. Les quatre architectes se quittent dans la nuit du 4 octobre. La Sécurité sociale attendra. L\'histoire en gardera trace.',
    playerEffects: {
      mandat: -20,
      caisse: -5,
      legitimite: -20,
      honteFierte: -10,
      flag: 'secu_1945_impasse'
    },
    signedArticles: []
  };
}

/* ====== Auto-vote IA en fin ====== */

/** Calcule le vote d'un bot selon sa satisfaction face au draft. */
export function botVote(actor: Actor, state: NegotiationState): 'oui' | 'non' | 'abstention' {
  /* Score = somme des distances négatives à la ligne rouge sur le draft. */
  let totalDistance = 0;
  for (const art of state.draft) {
    totalDistance += art.redLineDistance[actor.persona.id] ?? 0;
  }
  const avgDistance = state.draft.length > 0 ? totalDistance / state.draft.length : 0;

  const r = seededRandom(state.seed, `vote:${actor.persona.id}`)();
  if (avgDistance < actor.redLine.realThreshold * 0.75) {
    return 'oui';
  }
  if (avgDistance > actor.redLine.realThreshold * 1.5) {
    return 'non';
  }
  /* Zone grise — abstention probable, parfois oui par discipline */
  return r > 0.5 ? 'abstention' : 'oui';
}
