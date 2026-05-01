import type { RebirthGameState } from '../types';
import type { PoliticalCycle, StateFaction, StateStrategyId, StateWorldStrategy } from './types';

const STRATEGY_LABELS: Record<StateStrategyId, string> = {
  mediation: 'Médiation',
  decret: 'Passage par décret',
  repression: 'Maintien de l’ordre',
  cooptation: 'Cooptation',
  cadrage_budgetaire: 'Cadrage budgétaire',
  temporisation: 'Temporisation'
};

export const FACTION_LABELS: Record<StateFaction, string> = {
  unitaire: 'État',
  bercy: 'Bercy',
  travail: 'Ministère du Travail',
  elysee: 'Élysée'
};

/** À partir du tour 25 (≈ 1945, ordonnances de la Sécu) on segmente l'État
 *  en factions. Avant, l'État est unitaire — préfectoral, pas de Bercy
 *  moderne. */
const FACTIONS_ENABLED_FROM_TURN = 25;

/** Phase de cycle politique : un cycle stylisé sur 5 tours. */
export function politicalCycle(turn: number): PoliticalCycle {
  switch (turn % 5) {
    case 0:
      return 'post_election';
    case 1:
      return 'mid_term';
    case 2:
      return 'pre_plfss';
    case 3:
      return 'pre_election';
    default:
      return 'fin_mandat';
  }
}

export const CYCLE_LABELS: Record<PoliticalCycle, string> = {
  pre_election: 'pré-électoral',
  post_election: 'post-électoral',
  mid_term: 'milieu de mandat',
  pre_plfss: 'pré-PLFSS',
  fin_mandat: 'fin de mandat'
};

export function chooseStateStrategy(state: RebirthGameState): StateWorldStrategy {
  const cycle = politicalCycle(state.turn);
  const faction: StateFaction =
    state.turn < FACTIONS_ENABLED_FROM_TURN
      ? 'unitaire'
      : pickFaction(state, cycle);
  const { id, intensity } = pickStrategy(state, faction, cycle);

  return {
    id,
    label: STRATEGY_LABELS[id],
    intensity,
    signal: signalFor(id, intensity, faction, cycle),
    faction,
    cycle
  };
}

function pickFaction(state: RebirthGameState, cycle: PoliticalCycle): StateFaction {
  const r = state.resources;
  const a = state.actors;

  const elyseeScore =
    (r.rapportDeForce >= 65 ? 4 : 0) +
    (cycle === 'fin_mandat' ? 3 : cycle === 'pre_election' ? 2 : 0) +
    (a.opinion.trust <= 35 ? 2 : 0);

  const bercyScore =
    (r.caisse <= 32 ? 3 : 0) +
    (r.institution >= 60 ? 2 : 0) +
    (cycle === 'pre_plfss' ? 3 : cycle === 'mid_term' ? 1 : 0);

  const travailScore =
    (a.etat.trust >= 50 ? 2 : 0) +
    (cycle === 'post_election' ? 3 : cycle === 'mid_term' ? 2 : 0) +
    (r.santeSociale >= 45 ? 1 : 0);

  if (elyseeScore >= bercyScore && elyseeScore >= travailScore) return 'elysee';
  if (bercyScore >= travailScore) return 'bercy';
  return 'travail';
}

function pickStrategy(
  state: RebirthGameState,
  faction: StateFaction,
  cycle: PoliticalCycle
): { id: StateStrategyId; intensity: number } {
  const r = state.resources;
  const a = state.actors;
  const org = state.organization;

  /* État unitaire : règles d'origine. */
  if (faction === 'unitaire') {
    if (r.rapportDeForce >= 68 || a.etat.patience <= 28) {
      return { id: r.legitimite < 38 ? 'repression' : 'decret', intensity: 68 };
    }
    if (r.santeSociale <= 35 || a.opinion.trust <= 35) {
      return { id: 'temporisation', intensity: 48 };
    }
    if (a.etat.trust >= 58 && r.legitimite >= 45) {
      return { id: 'mediation', intensity: 45 };
    }
    return { id: 'mediation', intensity: 35 };
  }

  /* État segmenté : la faction dominante choisit son outil de prédilection. */
  if (faction === 'elysee') {
    if (r.rapportDeForce >= 70 || a.etat.patience <= 26) {
      return { id: r.legitimite < 35 ? 'repression' : 'decret', intensity: 72 };
    }
    if (cycle === 'fin_mandat') {
      return { id: 'decret', intensity: 60 };
    }
    return { id: 'decret', intensity: 55 };
  }

  if (faction === 'bercy') {
    if (r.caisse <= 26 || r.institution >= 64) {
      return { id: 'cadrage_budgetaire', intensity: 62 };
    }
    return { id: 'cadrage_budgetaire', intensity: 48 };
  }

  /* travail */
  if (org.reputation >= 60 && r.legitimite >= 50) {
    return { id: 'cooptation', intensity: 52 };
  }
  if (a.etat.trust >= 50) {
    return { id: 'mediation', intensity: 50 };
  }
  return { id: 'temporisation', intensity: 40 };
}

function signalFor(
  id: StateStrategyId,
  intensity: number,
  faction: StateFaction,
  cycle: PoliticalCycle
): string {
  const hard = intensity >= 60;
  const factionPrefix =
    faction === 'unitaire'
      ? ''
      : `${FACTION_LABELS[faction]} (${CYCLE_LABELS[cycle]}) — `;
  const body = (() => {
    switch (id) {
      case 'mediation':
        return 'un conseiller évoque une table ronde et un médiateur accepté par tous.';
      case 'decret':
        return hard
          ? 'les cabinets parlent de calendrier parlementaire fermé : l’accord social devient secondaire.'
          : 'une rumeur de texte prêt à signer circule avant même la fin des échanges.';
      case 'repression':
        return 'les préfets demandent des remontées quotidiennes. La rue est traitée comme un risque d’ordre public.';
      case 'cooptation':
        return 'une invitation ministérielle arrive, personnelle, flatteuse, presque trop bien écrite.';
      case 'cadrage_budgetaire':
        return 'les chiffres tombent : les marges de négociation sont présentées comme déjà consommées.';
      case 'temporisation':
        return 'les jours s’allongent. On parie sur la fatigue plus que sur la conviction.';
    }
  })();
  return `${factionPrefix}${body}`;
}
