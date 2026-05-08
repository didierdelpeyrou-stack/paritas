/* Paritas Rebirth — endingEngine.ts
 * Choisit la fin narrative selon la mémoire et les ressources finales.
 */

import type { EndingId, RebirthGameState, RunStats } from '../types';
import type { Camp } from '../../lib/types';
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
    text: ENDING_TEXTS_BY_CAMP[id][state.camp](state),
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

/* P0 Ghys-08 (Sapeurs ORDA-015 PARITAS) — textes paramétrés par camp.
   La version précédente écrivait pour le camp salarié uniquement : un
   patron qui finit en `mutilation` lisait « les caisses sont prélevées »
   alors que l'arc patronal vit la mutilation comme la perte d'autonomie
   de gestion (l'État décrète, sans plus solliciter le patronat). Et un
   patron qui finit en `capture` ne « trahit » pas la base — il devient
   l'instrument d'une oligarchie qui le méprise.
   5 endings × 2 camps = 10 textes miroir. Ton Pope-grade : sobriété + cruauté.
   buildEnding lit ENDING_TEXTS_BY_CAMP[id][state.camp]. */
type EndingTextFn = (s: RebirthGameState) => string;

export const ENDING_TEXTS_BY_CAMP: Record<EndingId, Record<Camp, EndingTextFn>> = {
  mutilation: {
    salarie: (s) =>
      `Le paritarisme que tu as connu n'existe plus. Les caisses sont prélevées, l'État décrète, les partenaires sociaux sont consultés pour la forme. Tu as joué ${Math.min(100, s.turn)} tours, signé ${s.memory.signedMajorAccords.length} accord(s) majeur(s), construit ${s.memory.builtInstitutions.length} institution(s). Ce n'était pas assez.`,
    patron: (s) =>
      `Tes adhérents te quittent en silence. La base patronale signe ailleurs, ou ne signe plus du tout. L'État légifère sans te demander ton avis — et les TPE-PME enragent contre la branche que tu n'as pas tenue. ${Math.min(100, s.turn)} tours, ${s.memory.signedMajorAccords.length} accord(s) majeur(s), ${s.memory.builtInstitutions.length} institution(s). Trop peu, trop tard.`
  },
  resistance: {
    salarie: (s) =>
      `Tu as tenu. Les caisses sont défendues, les accords renégociés, les bases tiennent. Le paritarisme est blessé mais vivant. ${s.memory.builtInstitutions.length} institutions sous ton sceau. Demain est ouvert.`,
    patron: (s) =>
      `Tu as tenu la branche. Les conventions collectives n'ont pas cédé, l'autonomie de gestion reste, les adhérents paient encore leurs cotisations. Le paritarisme est blessé mais l'organisation patronale aussi tient. ${s.memory.builtInstitutions.length} institutions sous ton sceau. Demain reste à négocier.`
  },
  refondation: {
    salarie: (s) =>
      `Tu as basculé hors du cadre d'État. Mutuelles indépendantes, caisses confédérales, économie solidaire. Le paritarisme se refait à neuf. ${s.memory.builtInstitutions.length} institutions construites, dont plusieurs hors la loi du moment.`,
    patron: (s) =>
      `Tu as refondé la grammaire patronale. Branches autonomes, fonds de protection sociale gérés en propre, plateforme commune avec les syndicats sur les sujets paritaires durs. ${s.memory.builtInstitutions.length} institutions construites, dont plusieurs sans bénédiction étatique. Le ministère t'observe — il ne t'arrête plus.`
  },
  capture: {
    salarie: (s) =>
      `Tu as gagné un siège, perdu une base. Tes anciens militants te traitent de traître. ${s.memory.betrayedBase} fois la base t'a renié — elle s'en souvient. Le paritarisme te survivra ; pas ta légitimité.`,
    patron: (s) =>
      `Tu es devenu l'homme-lige du gouvernement. Les concessions s'enchaînent, les TPE-PME hurlent, le CAC 40 te lâche en coulisses. ${s.memory.betrayedBase} fois la base patronale s'est révoltée — elle ne te suit plus. La branche t'enterre dans une tribune polie. Tu deviens un visage que personne ne défend.`
  },
  inacheve: {
    salarie: (s) =>
      `La partie s'arrête en milieu de chemin. Tu as joué ${Math.min(100, s.turn)} tours. Beaucoup reste à écrire — peut-être à un autre.`,
    patron: (s) =>
      `Le mandat s'interrompt en cours de route. ${Math.min(100, s.turn)} tours joués. La fédération te remplace ; le successeur héritera du dossier — peut-être saura-t-il finir.`
  }
};
