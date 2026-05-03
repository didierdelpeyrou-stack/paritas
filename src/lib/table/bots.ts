/* ============================================================
   Paritas — Bots IA pour La Table des Négociations
   ============================================================
   Templates déterministes par personnalité, fallback ultime si
   pas de LLM disponible. Chaque bot a son style, sa probabilité
   de bluff, et un répertoire de répliques contextuelles.

   Spec : V2_AVIS_MINIJEUX_TABLE.md §6 — "Templates déterministes
   ultimes — 30 templates par phase et par persona".
   ============================================================ */

import type { Actor, NegotiationState } from './types';
import type { OfferConcessionInput } from './engine';
import { seededRandom, seededPick } from '../seed';

interface BotTurnDecision {
  /** Réplique narrative (affichée dans le journal de table). */
  speech: string;
  /** Action à appliquer (null = pas d'action, juste parle). */
  action: OfferConcessionInput | null;
}

/* ====== Répertoires de répliques par persona × phase ====== */

const SPEECHES = {
  croizat: {
    opening: [
      'Mes camarades, ce que nous bâtissons ici, c\'est la dignité ouvrière en chiffres.',
      'L\'universalité, ce n\'est pas un slogan : c\'est une promesse aux veuves de Verdun et aux mineurs du Nord.',
      'Je ne signerai aucun texte qui exclut un seul travailleur de la couverture.'
    ],
    concessions: [
      'Acceptons cette unification administrative — à condition que la couverture reste universelle.',
      'Je peux céder sur la forme. Pas sur le fond.',
      'Ce paragraphe me coûte un mandat de mes camarades. Mais l\'Histoire le mérite.'
    ],
    vote: [
      'Je vote pour. La Sécurité sociale est plus grande que nous tous.'
    ]
  },
  laroque: {
    opening: [
      'Une administration unique. Une comptabilité publique. Sans cela, le système s\'effondre en six mois.',
      'Je parle technique, vous parlez politique. Les deux doivent se rejoindre dans le texte.',
      'Le coût budgétaire de cette ordonnance est calculé. Il dépasse de 12 % nos prévisions.'
    ],
    concessions: [
      'L\'élection des conseils est acceptable si l\'unité comptable est sauvegardée.',
      'Je peux concéder sur la représentation, à condition que les flux financiers passent par une seule caisse.',
      'Cette modification ajoute trois ans à la mise en œuvre. C\'est mesurable.'
    ],
    vote: [
      'Je vote pour. Le compromis est techniquement viable.'
    ]
  },
  parodi: {
    opening: [
      'Les œuvres mutualistes catholiques ont une histoire de soixante ans. Elles méritent leur place dans le système.',
      'La liberté de choix de l\'assuré n\'est pas une concession — c\'est un principe.',
      'La famille doit être un ayant droit reconnu, pas un appendice.'
    ],
    concessions: [
      'Je peux accepter l\'unification si la mutualité chrétienne reste comme caisse complémentaire reconnue.',
      'Cette formulation respecte la liberté de conscience. Je l\'accepte.',
      'Sur ce point, je résiste — mais je suis prêt à dialoguer.'
    ],
    vote: [
      'Je vote pour, en mon nom et au nom de Paul Bacon.'
    ]
  },
  buisson: {
    opening: [
      'Sans représentation ouvrière élue, ce ne sera jamais notre Sécu — ce sera celle de l\'administration.',
      'Les conseils paritaires doivent être élus, pas nommés. C\'est non négociable.',
      'Les travailleurs du textile et du bâtiment doivent avoir voix au chapitre, pas seulement les fonctionnaires de Paris.'
    ],
    concessions: [
      'L\'élection paritaire est dans le texte — donc je peux céder sur la périodicité.',
      'Cette concession me coûte du mandat. Mais elle ouvre la voie au scrutin.',
      'Avec Croizat, je tiens. Avec lui seul, ça suffit.'
    ],
    vote: [
      'Je vote pour. Croizat a tenu — je tiens avec lui.'
    ]
  }
} as const;

/* ====== Décision de tour ====== */

export function botDecideTurn(
  bot: Actor,
  state: NegotiationState
): BotTurnDecision {
  const phase = state.phase;
  const id = bot.persona.id as keyof typeof SPEECHES;
  const repertoire = SPEECHES[id];

  if (!repertoire) {
    return {
      speech: `${bot.persona.name} reste silencieux.`,
      action: null
    };
  }

  /* Speech selon phase. Tirage seedé pour reproductibilité. */
  const phaseKey = phase === 'opening' ? 'opening'
    : phase === 'concessions' ? 'concessions'
    : phase === 'vote' ? 'vote'
    : 'opening';
  const speech = seededPick(state.seed, `speech:${id}:${state.turn}`, repertoire[phaseKey]);

  /* Action : en phase concessions, le bot peut offrir un soutien à un
   * article aligné, ou s'opposer à un article qui dépasse sa ligne rouge. */
  let action: OfferConcessionInput | null = null;
  if (phase === 'concessions') {
    /* Trouver un article aligné (distance < threshold) qu'il ne soutient pas encore */
    const alignedArt = state.draft.find(art => {
      const d = art.redLineDistance[bot.persona.id] ?? 0;
      return d < bot.redLine.realThreshold * 0.6
        && !art.proposedBy.includes(bot.persona.id);
    });
    /* Trouver un article qui dépasse la ligne rouge */
    const opposedArt = state.draft.find(art => {
      const d = art.redLineDistance[bot.persona.id] ?? 0;
      return d > bot.redLine.realThreshold * 1.3
        && !art.opposedBy.includes(bot.persona.id);
    });

    const r = seededRandom(state.seed, `action:${id}:${state.turn}`)();
    if (alignedArt && r < 0.5) {
      action = {
        by: bot.persona.id,
        type: 'support',
        articleId: alignedArt.id,
        estimatedDistance: alignedArt.redLineDistance[bot.persona.id] ?? 0
      };
    } else if (opposedArt && r < 0.85) {
      action = {
        by: bot.persona.id,
        type: 'oppose',
        articleId: opposedArt.id,
        estimatedDistance: opposedArt.redLineDistance[bot.persona.id] ?? 0
      };
    }
    /* Sinon, le bot ne fait rien (parle uniquement). */
  }

  return { speech, action };
}
