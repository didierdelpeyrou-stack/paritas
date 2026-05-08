/* Paritas — narrativeFallback.ts
 * Hand-written enrichment used whenever Haiku is unavailable. Produces
 * the same shape as fetchNarrativeEnrichment so callers can treat
 * fallback and live-fetched output uniformly.
 */

import type { Choice, PlayerTrait, RebirthGameState, Scenario, SceneMood } from '../types';
import type { NarrativePromptOutput } from './narrativeClient';

/* P1-5 (ORDA-009/010, AAR bêta-30 §V — Camille D. #27 L2 socio,
   Aïcha M. #23 aide-soignante, Manon E. #25 dys+TDAH, Yanis B. #19
   apprenti, FG-2 + FG-5).
   Camille compare à Disco Elysium (24 voix-skills). Précédent : 6
   traits × 2 voix = 12 voix. Étendu à 6 traits × 4 voix = 24 voix.
   Calibrage par trait : voix #1+2 = registres usuels, voix #3 =
   doute/fissure (fatigue, ambivalence), voix #4 = grâce/élan
   (sens, suite imaginée). */
const INNER_VOICE_BY_TRAIT: Record<PlayerTrait, string[]> = {
  batisseur: [
    'Tu reconnais ta voix : ce qui se construit ne demande pas d’éclat, juste de la suite.',
    'La trace que tu laisses ressemble à toi : lente, patiente, vérifiable.',
    'Parfois tu te demandes si la lenteur est encore une vertu ou si elle est devenue une excuse.',
    'Tu travailles pour celles et ceux qui viendront après — c’est suffisant. Et c’est presque assez.'
  ],
  rupture: [
    'Quelque chose en toi pousse encore vers le risque ; tu ne sais pas si c’est de la lucidité ou de la fatigue.',
    'Le geste te coûte mais il te ressemble. Tu ne saurais pas faire autrement.',
    'Tu as déjà pensé : et si je m’étais trompé partout ? La pensée passe, elle revient, elle s’en va.',
    'Le moment où tout cède est aussi celui où tu te sens vivant. Tu ne le diras à personne.'
  ],
  technocrate: [
    'Tu mets de l’ordre dans le bruit. La méthode te tient debout.',
    'Tu as confiance dans le tableau qui résume. Tu sais que quelque part il manque une ligne.',
    'Quand le tableau craque, tu cherches une autre colonne. Pas une autre méthode. Pas encore.',
    'Tu te dis qu’une note correctement classée vaut deux discours. Tu sais que c’est faux ; tu le penses quand même.'
  ],
  pragmatique: [
    'Tu ne demandes pas si c’était juste, tu demandes si c’était utile.',
    'Tu acceptes la part de gris. Personne ne te remerciera, et tu peux vivre avec.',
    'Tu te demandes parfois si l’habitude du compromis n’est pas devenue ta seule conviction.',
    'Quelqu’un, un jour, te dira merci pour un geste que tu ne te souviens pas avoir fait. Ce sera assez.'
  ],
  paternaliste: [
    'Tu sens, sans le formuler, que tu protèges. C’est la façon que tu connais d’aimer le commun.',
    'Tu te répètes : ils auront besoin de moi demain. Tu ne sais pas s’ils en sont d’accord.',
    'Tu reconnais en toi le geste de celui qui t’a tenu lieu de père. Tu n’es pas sûr d’en vouloir.',
    'Quand ils t’écoutent, tu te sens utile. Quand ils ne t’écoutent pas, tu te sens vieux.'
  ],
  tribun: [
    'Tu cherches les mots qui resteront. Tu sais qu’une phrase juste fait plus que dix décrets.',
    'Tu vois la salle avant les chiffres. C’est ce qui te rend dangereux et utile.',
    'Tu redoutes le silence après ton meilleur discours. Le silence te dit la vérité que les applaudissements masquent.',
    'Tu comptes celles et ceux qui ont changé d’avis ce soir. Le chiffre est petit. Tu continues quand même.'
  ]
};

const HEADLINES_BY_CAMP_AND_MOOD: Record<string, Record<SceneMood, string[]>> = {
  salarie: {
    calme: [
      'Discrètement, le syndicat avance ses pions',
      'Une signature, et déjà la prochaine en préparation'
    ],
    tendu: [
      'Bras de fer en cours, l’opinion suit du coin de l’œil',
      'Les permanents tiennent, les sections grondent'
    ],
    grave: [
      'Une décision lourde dans le silence des couloirs',
      'Le syndicat assume, à voix basse'
    ],
    euphorique: [
      'La rue redécouvre une voix qu’on croyait perdue',
      'Une victoire courte, mais une victoire lue'
    ],
    melancolique: [
      'On replie les drapeaux, on garde la mémoire',
      'Quelque chose s’éteint, autre chose se prépare'
    ]
  },
  patron: {
    calme: [
      'Le patronat avance sans bruit, le marché suit',
      'Un accord qu’on dit "technique" — il ne l’est pas'
    ],
    tendu: [
      'À l’avenue Bosquet, on calcule à voix basse',
      'La fédération hésite, les industriels grondent'
    ],
    grave: [
      'Le patronat assume une ligne qui ne séduira personne',
      'Une signature qu’il faudra défendre longtemps'
    ],
    euphorique: [
      'Le patronat reprend la main sur un chantier qu’on disait perdu',
      'Une victoire patronale, lente, technique, durable'
    ],
    melancolique: [
      'Une époque se ferme à l’avenue Bosquet',
      'Le patronat regarde sa propre histoire passer'
    ]
  }
};

const MEMORY_LINES = [
  'Cette décision aura un visage, dans cinq ans, dans dix ans.',
  'On en parlera moins comme d’un choix que comme d’un tournant.',
  'Quelque part, quelqu’un commence à écrire la première phrase de l’histoire de ce moment.'
];

export function composeNarrativeFallback(
  state: RebirthGameState,
  scenario: Scenario,
  choice: Choice
): NarrativePromptOutput {
  const camp = state.camp === 'patron' ? 'patron' : 'salarie';
  const headlinePool = HEADLINES_BY_CAMP_AND_MOOD[camp][scenario.mood];
  const voicePool = INNER_VOICE_BY_TRAIT[state.dominantTrait];

  return {
    consequence: choice.consequence.immediate,
    innerVoice: pick(voicePool, scenario.id, choice.id, 0),
    newspaperHeadline: pick(headlinePool, scenario.id, choice.id, 1),
    memoryLine: choice.consequence.longterm
      ? pick(MEMORY_LINES, scenario.id, choice.id, 2)
      : undefined
  };
}

function pick<T>(pool: T[], scenarioId: string, choiceId: string, salt: number): T {
  if (pool.length === 0) {
    throw new Error('narrativeFallback: empty pool');
  }
  const seed = hash(`${scenarioId}::${choiceId}::${salt}`);
  return pool[seed % pool.length]!;
}

function hash(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
