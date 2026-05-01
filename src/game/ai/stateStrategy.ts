import type { RebirthGameState } from '../types';
import type { StateStrategyId, WorldStrategy } from './types';

const LABELS: Record<StateStrategyId, string> = {
  mediation: 'Médiation',
  decret: 'Passage par décret',
  repression: 'Maintien de l’ordre',
  cooptation: 'Cooptation',
  cadrage_budgetaire: 'Cadrage budgétaire',
  temporisation: 'Temporisation'
};

export function chooseStateStrategy(state: RebirthGameState): WorldStrategy<StateStrategyId> {
  const r = state.resources;
  const a = state.actors;
  const org = state.organization;
  let id: StateStrategyId = 'mediation';
  let intensity = 35;

  if (r.rapportDeForce >= 68 || a.etat.patience <= 28) {
    id = r.legitimite < 38 ? 'repression' : 'decret';
    intensity = 68;
  } else if (r.caisse <= 26 || r.institution >= 62) {
    id = 'cadrage_budgetaire';
    intensity = 58;
  } else if (org.reputation >= 62 && r.legitimite >= 55) {
    id = 'cooptation';
    intensity = 52;
  } else if (r.santeSociale <= 35 || a.opinion.trust <= 35) {
    id = 'temporisation';
    intensity = 48;
  } else if (a.etat.trust >= 58 && r.legitimite >= 45) {
    id = 'mediation';
    intensity = 45;
  }

  return {
    id,
    label: LABELS[id],
    intensity,
    signal: signalFor(id, intensity)
  };
}

function signalFor(id: StateStrategyId, intensity: number): string {
  const hard = intensity >= 60;
  switch (id) {
    case 'mediation':
      return 'Un conseiller évoque une table ronde et un médiateur accepté par tous.';
    case 'decret':
      return hard
        ? 'Les cabinets parlent de calendrier parlementaire fermé : l’accord social devient secondaire.'
        : 'Une rumeur de texte prêt à signer circule avant même la fin des échanges.';
    case 'repression':
      return 'Les préfets demandent des remontées quotidiennes. La rue est traitée comme un risque d’ordre public.';
    case 'cooptation':
      return 'Une invitation ministérielle arrive, personnelle, flatteuse, presque trop bien écrite.';
    case 'cadrage_budgetaire':
      return 'Bercy pose ses chiffres : les marges de négociation sont présentées comme déjà consommées.';
    case 'temporisation':
      return 'L’État laisse passer les jours. Il parie sur la fatigue plus que sur la conviction.';
  }
}
