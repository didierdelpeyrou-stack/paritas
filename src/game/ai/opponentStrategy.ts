import type { RebirthGameState } from '../types';
import { currentOpponentFaction } from './opponentFactions';
import type { OpponentStrategyId, OpponentWorldStrategy } from './types';

const LABELS: Record<OpponentStrategyId, string> = {
  compromis_limite: 'Compromis limité',
  division: 'Division du camp adverse',
  campagne_media: 'Campagne médiatique',
  juridicisation: 'Juridicisation',
  ligne_dure: 'Ligne dure',
  deplacement_production: 'Déplacement économique'
};

export function chooseOpponentStrategy(state: RebirthGameState): OpponentWorldStrategy {
  const r = state.resources;
  const a = state.actors;
  const org = state.organization;
  const faction = currentOpponentFaction(state.turn, state.camp);
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
    signal: signalFor(id, faction.shortName, state.camp),
    factionId: faction.id,
    factionName: faction.displayName,
    factionShort: faction.shortName
  };
}

function signalFor(
  id: OpponentStrategyId,
  factionShort: string,
  playerCamp: 'salarie' | 'patron'
): string {
  /* Le signal nomme l'organisation adverse pour éviter le "l'autre camp"
     générique des versions précédentes. */
  switch (id) {
    case 'compromis_limite':
      return `${factionShort} teste une concession étroite — assez visible pour séduire, trop faible pour régler le fond.`;
    case 'division':
      return playerCamp === 'salarie'
        ? `${factionShort} vient parler aux modérés sans toi. Une partie des sections reçoit des invitations.`
        : `${factionShort} cherche à diviser les fédérations patronales : grandes maisons contre PME.`;
    case 'campagne_media':
      return `${factionShort} occupe les éditoriaux. La presse reprend leurs mots avant les tiens.`;
    case 'juridicisation':
      return `${factionShort} bascule en mode procédural : recours, mémoires, expertises. On ne dit plus non — on demande des pièces.`;
    case 'ligne_dure':
      return `${factionShort} durcit la délégation. Peu d’apartés, beaucoup de notes, regards qui ne lâchent pas.`;
    case 'deplacement_production':
      return `${factionShort} évoque sous-traitance et délocalisation. La pression économique entre dans la salle.`;
  }
}
