/* Paritas Rebirth — endingEngine.ts
 * Choisit la fin narrative selon la mémoire et les ressources finales.
 */

import type { EndingId, RebirthGameState, RunStats } from '../types';
import type { ObjectiveProgress, RoleObjective } from '../objectives/types';
import { computeFinalScore } from '../simulation/scoring';

export interface EndingRender {
  id: EndingId;
  title: string;
  /** Texte écrit à la main, dépendant des trajectoires */
  text: string;
  /** Score final 0..100 */
  score: number;
  stats: RunStats;
  objectives: RoleObjective[];
  objectiveProgress: ObjectiveProgress[];
}

export function pickEnding(state: RebirthGameState): EndingId {
  const m = state.memory;
  const r = state.resources;

  const inst = m.builtInstitutions.length;
  const trahis = m.betrayedBase;
  const refus = m.refusedCompromise;

  // Capture : leader devient instrument ; base trahie souvent
  if (trahis >= 3) return 'capture';

  // Refondation : tu as tout reconstruit hors État
  if (inst >= 5 && r.institution >= 70 && refus >= 2) return 'refondation';

  // Résistance : institutions défendues, caisses pleines
  if (inst >= 4 && r.caisse >= 50 && r.rapportDeForce >= 50) return 'resistance';

  // Mutilation : peu d'institutions, caisses vidées
  if (inst <= 2 || r.caisse <= 25) return 'mutilation';

  return 'inacheve';
}

export function buildEnding(state: RebirthGameState): EndingRender {
  const id = pickEnding(state);
  const score = computeFinalScore(state);
  const turnsPlayed = Math.min(100, state.turn);
  const stats: RunStats = {
    turnsPlayed,
    scenariosPlayed: state.memory.playedScenarios.length,
    institutionsBuilt: state.memory.builtInstitutions.length,
    refusedCompromise: state.memory.refusedCompromise,
    betrayedBase: state.memory.betrayedBase,
    exhaustedMovements: state.memory.exhaustedMovements,
    finalResources: state.resources,
    finalDominantTrait: state.dominantTrait,
    endingId: id
  };
  return {
    id,
    title: ENDING_TITLES[id],
    text: ENDING_TEXTS[id](state),
    score,
    stats,
    objectives: state.objectives,
    objectiveProgress: state.objectiveProgress
  };
}

const ENDING_TITLES: Record<EndingId, string> = {
  mutilation: 'Mutilation',
  resistance: 'Résistance',
  refondation: 'Refondation',
  capture: 'Capture',
  inacheve: 'Inachevé'
};

const ENDING_TEXTS: Record<EndingId, (s: RebirthGameState) => string> = {
  mutilation: (s) =>
    `Le paritarisme que tu as connu n'existe plus. Les caisses sont prélevées, l'État décrète, les partenaires sociaux sont consultés pour la forme. Tu as joué ${Math.min(100, s.turn)} tours, signé ${s.memory.signedMajorAccords.length} accord(s) majeur(s), construit ${s.memory.builtInstitutions.length} institution(s). Ce n'était pas assez.`,
  resistance: (s) =>
    `Tu as tenu. Les caisses sont défendues, les accords renégociés, les bases tiennent. Le paritarisme est blessé mais vivant. ${s.memory.builtInstitutions.length} institutions sous ton sceau. Demain est ouvert.`,
  refondation: (s) =>
    `Tu as basculé hors du cadre d'État. Mutuelles indépendantes, caisses confédérales, économie solidaire. Le paritarisme se refait à neuf. ${s.memory.builtInstitutions.length} institutions construites, dont plusieurs hors la loi du moment.`,
  capture: (s) =>
    `Tu as gagné un siège, perdu une base. Tes anciens militants te traitent de traître. ${s.memory.betrayedBase} fois la base t'a renié — elle s'en souvient. Le paritarisme te survivra ; pas ta légitimité.`,
  inacheve: (s) =>
    `La partie s'arrête en milieu de chemin. Tu as joué ${Math.min(100, s.turn)} tours. Beaucoup reste à écrire — peut-être à un autre.`
};
