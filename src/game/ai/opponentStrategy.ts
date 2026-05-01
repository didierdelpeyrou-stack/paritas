import type { RebirthGameState } from '../types';
import type { OpponentStrategyId, WorldStrategy } from './types';

const LABELS: Record<OpponentStrategyId, string> = {
  compromis_limite: 'Compromis limité',
  division: 'Division du camp adverse',
  campagne_media: 'Campagne médiatique',
  juridicisation: 'Juridicisation',
  ligne_dure: 'Ligne dure',
  deplacement_production: 'Déplacement économique'
};

export function chooseOpponentStrategy(state: RebirthGameState): WorldStrategy<OpponentStrategyId> {
  const r = state.resources;
  const a = state.actors;
  const org = state.organization;
  let id: OpponentStrategyId = 'compromis_limite';
  let intensity = 34;

  if (r.rapportDeForce >= 64 && org.cohesion >= 55) {
    id = 'division';
    intensity = 62;
  } else if (r.legitimite >= 60 && org.mediaRelay >= 3) {
    id = 'campagne_media';
    intensity = 56;
  } else if (org.legalTeam >= 4 || r.institution >= 58) {
    id = 'juridicisation';
    intensity = 52;
  } else if (a.adversaire.patience <= 32 || a.adversaire.stance === 'dur') {
    id = 'ligne_dure';
    intensity = 66;
  } else if (state.camp === 'salarie' && r.caisse <= 35) {
    id = 'deplacement_production';
    intensity = 50;
  }

  return {
    id,
    label: LABELS[id],
    intensity,
    signal: signalFor(id)
  };
}

function signalFor(id: OpponentStrategyId): string {
  switch (id) {
    case 'compromis_limite':
      return 'L’autre camp teste une concession étroite, assez visible pour séduire, trop faible pour régler le fond.';
    case 'division':
      return 'Des messages différents arrivent à tes alliés. Quelqu’un cherche à séparer les modérés des durs.';
    case 'campagne_media':
      return 'La presse reprend les mots de l’adversaire avant les tiens. Le cadrage public se déplace.';
    case 'juridicisation':
      return 'Les réponses deviennent procédurales. On ne te dit plus non : on te demande des pièces.';
    case 'ligne_dure':
      return 'La délégation adverse parle peu, note beaucoup, et refuse les apartés.';
    case 'deplacement_production':
      return 'Des sites alternatifs, sous-traitants ou reports d’investissement entrent dans la conversation.';
  }
}
