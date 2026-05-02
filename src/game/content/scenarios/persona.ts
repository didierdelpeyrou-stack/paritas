import type { Scenario } from '../../types';

export const PERSONA_SCENARIOS: Scenario[] = [
  {
    id: 'jouhaux-nobel-1951',
    turn: 26,
    date: '10 décembre 1951',
    era: 'guerre_froide',
    title: 'Le Prix Nobel',
    subtitle: 'Stockholm, à 72 ans',
    mood: 'melancolique',
    premium: true,
    campFilter: 'salarie',
    personaFilter: ['jouhaux'],
    historicalContext:
      'Le 10 décembre 1951, Léon Jouhaux reçoit le prix Nobel de la paix à Stockholm pour son rôle dans la construction du dialogue social européen et la fondation de Force ouvrière en 1947. Il a 72 ans, dirige FO depuis quatre ans, et la France est entrée dans une guerre froide qui divise déjà le mouvement ouvrier en deux blocs.',
    setup: {
      reflechi:
        'Le prix arrive au moment où FO doit choisir sa place : voix internationale du syndicalisme libre, simple ressource diplomatique américaine, ou intermédiaire patient entre les deux blocs ? Le discours de Stockholm engage la décennie à venir.',
      compulsif:
        'À Stockholm, on te tend un médaillon que tu n’avais pas demandé. Pendant la cérémonie, tu penses à 1936, à la prison de Vichy, à la scission de 1947. Le silence est plein. La phrase qui sortira de ta bouche tout à l’heure pèsera plus que la médaille.'
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'tribun', text: 'Un Nobel est un microphone. Tu choisis ce que tu y mets.' },
      { trait: 'pragmatique', text: 'On te regarde du Kremlin. On te regarde de Washington. Choisis lequel pèse le plus à Saint-Étienne.' },
      { trait: 'batisseur', text: 'L’institution que tu défends maintenant doit pouvoir te survivre.' }
    ],
    quotes: [
      {
        text: 'Le syndicalisme est une école de paix.',
        source: 'Léon Jouhaux, discours de réception du Nobel, Stockholm, 1951'
      }
    ],
    choices: [
      {
        id: 'jouhaux-nobel-paix-sociale',
        text: 'Faire de FO la voix du dialogue social européen.',
        intent: 'Capitaliser le prix sur la diplomatie syndicale.',
        theoryHint: 'Stratégie d’institutionnalisation internationale : le syndicat comme acteur diplomatique reconnu.',
        effects: {
          resources: { legitimite: 12, institution: 8, rapportDeForce: -3 },
          actors: { etat: { trust: 8 }, opinion: { trust: 10 } }
        },
        consequence: {
          immediate:
            'Tu fais le tour des capitales européennes. Bonn, Bruxelles, Rome. Le syndicalisme libre français trouve ses correspondants.',
          longterm:
            'FO restera, au-delà de toi, l’interlocuteur français privilégié de la Confédération internationale des syndicats libres.'
        },
        traitShift: { batisseur: 2, tribun: 2 }
      },
      {
        id: 'jouhaux-nobel-base-francaise',
        text: 'Refuser le voyage et rentrer parler aux militants.',
        intent: 'Le Nobel ne nourrit pas la base.',
        theoryHint: 'Choix de fidélité ouvrière : la consécration extérieure ne vaut rien sans ancrage interne.',
        effects: {
          resources: { confiance: 14, legitimite: -4, rapportDeForce: 4 },
          actors: { base: { trust: 12, patience: 8 }, opinion: { trust: -3 } }
        },
        consequence: {
          immediate:
            'Tu envoies un télégramme à Stockholm. À la place, tu fais une tournée des sections du Nord. Les militants apprécient. Le ministère, moins.',
          longterm:
            'Le geste deviendra une légende interne — le Nobel refusé pour la base. La presse européenne, elle, t’oubliera plus vite.'
        },
        traitShift: { rupture: 1, tribun: 2 }
      },
      {
        id: 'jouhaux-nobel-anticommuniste',
        text: 'Aligner ouvertement FO sur le bloc atlantique.',
        intent: 'Choisir un camp dans la guerre froide.',
        theoryHint: 'Stratégie d’alliance géopolitique : sécuriser des financements et des canaux contre l’influence CGT-PCF.',
        effects: {
          resources: { caisse: 8, institution: 4, confiance: -6, legitimite: -2 },
          actors: { etat: { trust: 6 }, base: { trust: -7 }, adversaire: { trust: -4 } }
        },
        consequence: {
          immediate:
            'Les fonds américains arrivent discrètement. Le syndicat respire. Mais une partie des cadres ne te le pardonnera pas.',
          longterm:
            'L’étiquette « FO finance par la CIA » naîtra de ces années — historiquement contestée, durablement collante.'
        },
        traitShift: { pragmatique: 2 },
        flag: 'trahit-base'
      }
    ]
  },
  {
    id: 'seilliere-rupture-unedic-2001',
    turn: 50,
    date: '6 juin 2001',
    era: 'cohabitations',
    title: 'Claquer la porte de l’Unédic',
    subtitle: 'Le geste fondateur',
    mood: 'tendu',
    premium: true,
    campFilter: 'patron',
    personaFilter: ['seilliere'],
    historicalContext:
      'Le 6 juin 2001, sous la présidence d’Ernest-Antoine Seillière, le MEDEF se retire de l’Unédic, paralysant l’assurance chômage paritaire pour forcer une nouvelle convention. C’est le geste emblématique de la « refondation sociale » et le précédent fondateur de toutes les futures menaces patronales de retrait.',
    setup: {
      reflechi:
        'La séquence est préparée depuis dix mois. Quitter la table est légalement possible, politiquement explosif. Le retrait force l’État à intervenir mais expose le MEDEF à l’accusation de désertion.',
      compulsif:
        'Dans la salle, tu sens les regards des syndicats. Ils te connaissent assez pour savoir que tu vas le faire. La presse économique, déjà prévenue, attend en bas. Tu prononces deux phrases, tu sors. La porte est lourde, le geste léger.'
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'rupture', text: 'Une refondation qui ne brise rien n’en est pas une.' },
      { trait: 'pragmatique', text: 'Tu peux casser une institution. Reconstruire en prend trois autres.' },
      { trait: 'technocrate', text: 'Le retrait n’a de valeur que s’il ouvre une renégociation immédiate.' }
    ],
    choices: [
      {
        id: 'seilliere-claquer',
        text: 'Sortir publiquement et théâtralement.',
        intent: 'Faire de la rupture un geste fondateur.',
        theoryHint: 'Stratégie de signal : le coût d’image est compensé par l’ouverture d’un nouveau rapport de force.',
        effects: {
          resources: { rapportDeForce: 12, institution: -7, legitimite: -6, confiance: -3 },
          actors: { adversaire: { trust: -12, patience: -10 }, etat: { trust: -5, stance: 'instable' }, opinion: { trust: -8 } }
        },
        consequence: {
          immediate:
            'Tu sors. Les caméras attendent. Les syndicats restent dans la salle, sidérés. L’État ouvre une cellule de crise dans l’heure.',
          longterm:
            'Le geste deviendra une référence patronale durable : « faire un Seillière », c’est claquer la porte pour rouvrir le dialogue à ses conditions.'
        },
        traitShift: { rupture: 4 },
        flag: 'epuise-mouvement'
      },
      {
        id: 'seilliere-negocier-fond',
        text: 'Rester à la table mais imposer un calendrier de refondation.',
        intent: 'Refonder par la pression interne plutôt que par la rupture.',
        theoryHint: 'Stratégie de durcissement institutionnel : conserver le siège pour reformuler les règles depuis l’intérieur.',
        effects: {
          resources: { institution: 8, rapportDeForce: 5, legitimite: 3, caisse: -2 },
          actors: { adversaire: { trust: -3 }, etat: { trust: 4 }, opinion: { trust: 4 } }
        },
        consequence: {
          immediate:
            'Tu poses un calendrier serré : six mois pour réécrire la convention. Les syndicats acceptent à contrecœur. La presse parle de « refondation maîtrisée ».',
          longterm:
            'Cette voie aurait épargné quelques années de procès idéologique au MEDEF — au prix d’une moindre rupture symbolique.'
        },
        traitShift: { batisseur: 2, technocrate: 2 },
        flag: 'refondation-paritaire'
      },
      {
        id: 'seilliere-temporiser',
        text: 'Reporter la décision à un congrès patronal extraordinaire.',
        intent: 'Diluer la responsabilité personnelle.',
        theoryHint: 'Stratégie de partage du coût politique : faire endosser la rupture par le collectif patronal.',
        effects: {
          resources: { caisse: 4, institution: 2, rapportDeForce: -2, legitimite: 1 },
          actors: { adversaire: { trust: 3 }, etat: { trust: 2 } }
        },
        consequence: {
          immediate:
            'Le congrès se tient deux semaines plus tard. Le retrait est voté, mais sans toi pour visage. Le geste perd son tranchant.',
          longterm:
            'L’histoire patronale française aurait pu retenir un autre nom que le tien — peut-être tant mieux pour toi.'
        },
        traitShift: { pragmatique: 2 }
      }
    ]
  }
];
