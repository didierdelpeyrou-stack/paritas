import type { Choice, RebirthGameState, Scenario } from '../types';
import { eraForTurn } from './eras';

const THEMES = [
  {
    title: 'La réunion qui dure',
    subtitle: 'Ordre du jour impossible',
    setup: 'Une table de négociation s’enlise. Chacun répète sa position, mais les silences commencent à dire autre chose.',
    compulsif: 'La pendule fait plus de bruit que les arguments. Tu comprends que personne ne veut vraiment être le premier à sortir.'
  },
  {
    title: 'La note confidentielle',
    subtitle: 'Chiffres contestés',
    setup: 'Une note circule : les coûts annoncés par l’autre camp seraient surestimés. Si tu l’utilises mal, elle se retournera contre toi.',
    compulsif: 'Le papier est mince, presque ridicule. Pourtant tu sens qu’il peut couper plus profondément qu’un discours.'
  },
  {
    title: 'La base s’impatiente',
    subtitle: 'Mandat sous pression',
    setup: 'Dans les ateliers et les permanences, on demande un signe. La négociation avance, mais trop lentement pour ceux qui payent le prix de l’attente.',
    compulsif: 'Les messages arrivent par dizaines. Pas des analyses : des vies courtes, fatiguées, qui demandent quand ça change.'
  },
  {
    title: 'Le compromis invisible',
    subtitle: 'Gagner sans triompher',
    setup: 'Un accord discret devient possible. Il n’aura pas la beauté d’une victoire publique, mais il peut empêcher une dégradation durable.',
    compulsif: 'Personne n’applaudira. C’est peut-être à ça que ressemblent les décisions utiles.'
  },
  {
    title: 'Le témoin de l’ancienne lutte',
    subtitle: 'Mémoire sociale',
    setup: 'Une figure plus âgée rappelle un conflit passé. Sa mémoire éclaire le présent, mais elle peut aussi l’enfermer.',
    compulsif: 'Sa voix tremble à peine. Tu ne sais pas s’il te transmet une boussole ou une dette.'
  },
  {
    title: 'L’administration demande un tableau',
    subtitle: 'Le réel en colonnes',
    setup: 'L’État exige des indicateurs avant de valider une orientation. Le conflit doit entrer dans des cases.',
    compulsif: 'On te demande un tableau. Tu voudrais répondre par des visages.'
  }
];

export function buildTransitionScenario(state: RebirthGameState): Scenario {
  const era = eraForTurn(state.turn);
  const theme = THEMES[(state.turn + state.memory.playedScenarios.length) % THEMES.length]!;
  const isPatron = state.camp === 'patron';
  const id = `transition-${state.turn}-${theme.title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}`;

  return {
    id,
    turn: state.turn,
    date: era.period,
    era: era.id,
    title: theme.title,
    subtitle: theme.subtitle,
    mood: state.resources.santeSociale < 35 ? 'grave' : state.resources.confiance > 70 ? 'euphorique' : 'tendu',
    premium: false,
    historicalContext:
      `${era.blurb} Cette scène n’est pas un grand jalon, mais une micro-décision : c’est dans ces gestes répétés que le paritarisme tient ou se vide.`,
    setup: {
      reflechi: theme.setup,
      compulsif: theme.compulsif
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'pragmatique', text: 'Le meilleur accord est parfois celui que personne ne raconte.' },
      { trait: 'rupture', text: 'À force d’éviter le conflit, on finit par accepter la défaite.' },
      { trait: 'batisseur', text: 'Une institution ne se construit pas seulement les jours historiques.' }
    ],
    choices: transitionChoices(state.turn, isPatron)
  };
}

function transitionChoices(turn: number, isPatron: boolean): Choice[] {
  const suffix = String(turn);
  return [
    {
      id: `transition-${suffix}-compromis`,
      text: isPatron ? 'Ouvrir une concession limitée mais vérifiable.' : 'Proposer un compromis contrôlé par la base.',
      intent: 'Créer de la valeur sans perdre le mandat.',
      theoryHint: 'Jeu non nul : chercher le point où chaque camp gagne assez pour respecter l’accord.',
      effects: {
        resources: { institution: 4, legitimite: 3, confiance: 2, rapportDeForce: -1 },
        actors: {
          base: { trust: 2, patience: 4 },
          adversaire: { trust: 4, patience: 3 },
          opinion: { trust: 2 }
        }
      },
      consequence: {
        immediate:
          'Le compromis ne fait pas de bruit. Pourtant, dans les jours suivants, les échanges changent légèrement de ton : on se parle encore, et c’est déjà une victoire fragile.'
      },
      traitShift: { pragmatique: 2, batisseur: 1 }
    },
    {
      id: `transition-${suffix}-rapport-force`,
      text: isPatron ? 'Durcir la ligne pour tester la résistance adverse.' : 'Organiser une démonstration de force.',
      intent: 'Rendre le coût du refus visible.',
      theoryHint: 'Chicken game : plus la pression monte, plus la sortie honorable devient rare.',
      effects: {
        resources: { rapportDeForce: 6, confiance: 4, santeSociale: -5, legitimite: -3, caisse: -2 },
        actors: {
          base: { trust: 5, pressure: 5 },
          adversaire: { trust: -6, patience: -6, stance: 'dur' },
          opinion: { trust: -2 }
        }
      },
      consequence: {
        immediate:
          'La pression réussit : l’autre camp te prend au sérieux. Elle laisse aussi des traces. Certains visages à la table se ferment pour longtemps.'
      },
      traitShift: { rupture: 2, tribun: 1 }
    },
    {
      id: `transition-${suffix}-expertise`,
      text: 'Déplacer le conflit vers une expertise contradictoire.',
      intent: 'Faire parler les preuves avant les postures.',
      theoryHint: 'Négociation raisonnée : séparer les personnes du problème, puis discuter des critères.',
      effects: {
        resources: { institution: 5, legitimite: 3, caisse: -2, rapportDeForce: -2 },
        actors: {
          etat: { trust: 5 },
          adversaire: { trust: 2 },
          base: { patience: -2 }
        }
      },
      consequence: {
        immediate:
          'Les chiffres ne suppriment pas le conflit, mais ils le ralentissent assez pour empêcher le geste irréparable. La base trouve cela froid ; l’institution, elle, respire.'
      },
      traitShift: { technocrate: 2, batisseur: 1 }
    }
  ];
}
