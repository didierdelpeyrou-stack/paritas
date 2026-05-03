/* Paritas Rebirth — scenarios/1936-matignon.ts
 *
 * Scénario premium #7 (chronologique) de la V1.
 * Cf. 00_bibliographie_master.md §6.7
 *
 * Date : 7 juin 1936, soir. Hôtel Matignon.
 * Acteurs : Léon Blum (état) — CGT (base/Jouhaux) — CGPF (adversaire/Lambert-Ribot) — opinion (Front populaire).
 *
 * Setup : la grève générale a déclenché 2 millions de grévistes en mai-juin.
 * Blum convoque les partenaires sociaux à Matignon. Sur la table : 40h, congés payés,
 * conventions collectives, hausses de salaires, délégués du personnel.
 *
 * Premier grand "compromis paritaire ascendant" de l'histoire française.
 */

import type { Scenario } from '../../types';

export const SCENARIO_1936_MATIGNON: Scenario = {
  id: 'matignon-1936',
  turn: 20,
  date: '7 juin 1936',
  era: 'entre_deux_guerres',
  title: 'Hôtel Matignon',
  subtitle: 'Une nuit qui change le travail',
  mood: 'euphorique',
  premium: true,

  historicalContext:
    "Le Front populaire est au pouvoir depuis le 4 juin 1936. Plus de deux millions de grévistes occupent les usines. Blum convoque CGT et CGPF à Matignon. Sur la table : semaine de 40 heures, deux semaines de congés payés, conventions collectives, hausses de salaires de 7 à 15%, délégués du personnel. La nuit qui suit fondera le paritarisme français de négociation.",

  setup: {
    reflechi: `Hôtel Matignon, 19h. Blum a convoqué CGT et CGPF. Léon Jouhaux et Benoît Frachon mènent la délégation CGT. Alfred Lambert-Ribot représente la CGPF. Sur la table : 40h hebdo, deux semaines de congés payés, conventions collectives obligatoires, hausses de 7 à 15%, délégués du personnel.

Dehors, plus de deux millions de grévistes occupent les usines. Une décision est attendue avant minuit.`,

    compulsif: `Tu as cinquante-six ans. C'est la première fois.

Trois étages plus bas, Paris attend. Un Paris d'usines occupées. De machines arrêtées. De drapeaux rouges aux fenêtres. Blum est calme, presque las. À ta gauche, Frachon prend des notes en silence : la CGTU réunifiée surveille chaque virgule. En face, Lambert-Ribot a le regard d'un homme qui sent l'histoire glisser entre ses doigts.

Tu pourrais signer ce soir et sauver des semaines. Tu pourrais aussi pousser le patronat dans ses retranchements.`
  },

  actors: ['base', 'adversaire', 'etat', 'opinion'],

  voices: [
    {
      trait: 'pragmatique',
      text: 'Trois millions d\'ouvriers veulent rentrer chez eux ce soir.'
    },
    {
      trait: 'tribun',
      text: 'Trois millions d\'ouvriers veulent davantage que ce soir.'
    },
    {
      trait: 'batisseur',
      text: 'Si tu signes les conventions collectives, tu graves la table dans la pierre.'
    },
    {
      trait: 'rupture',
      text: 'Le patronat n\'a jamais été aussi faible. Pourquoi t\'arrêter ?'
    }
  ],

  quotes: [
    {
      text: 'Tout est possible !',
      source: 'Léon Jouhaux à la sortie de Matignon, 7 juin 1936'
    },
    {
      text: "Il faut donner aux travailleurs le sentiment qu'on leur a accordé quelque chose. Sinon, l'usine restera fermée pendant des mois.",
      source: "Alfred Lambert-Ribot, délégué CGPF, mémoire interne, juin 1936"
    },
    {
      text: "Pour la dignité du travail, il fallait élever le niveau de vie. Pour la santé du peuple, il fallait raccourcir le temps de la peine.",
      source: "Léon Blum, Discours à la Chambre, 6 juin 1936"
    }
  ],

  choices: [
    {
      id: 'matignon-signe',
      text: 'Signer les six points proposés par Blum.',
      campText: {
        patron: 'Signer les six points pour stopper l\'occupation et sauver l\'outil.',
        salarie: 'Signer les six points proposés par Blum.'
      },
      intent: 'Le compromis classique. Une victoire historique.',
      campIntent: {
        patron: 'Concession lourde mais ordonnée — l\'usine redémarre.',
        salarie: 'Le compromis classique. Une victoire historique.'
      },
      theoryHint:
        'Modèle classique du compromis paritaire ascendant. Première grande convention collective interprofessionnelle.',
      effects: {
        resources: {
          confiance: +8,
          legitimite: +12,
          institution: +18,
          rapportDeForce: +6,
          santeSociale: +10,
          caisse: +4
        },
        actors: {
          base: { trust: +10, patience: +20, stance: 'cooperatif' },
          adversaire: { trust: +6, patience: +10 },
          etat: { trust: +12 },
          opinion: { trust: +15 }
        }
      },
      consequence: {
        immediate:
          'Vous signez les six points à 23h47. À la sortie, dans la cour de l\'hôtel Matignon, Jouhaux lance aux journalistes : « Tout est possible ! » Le 11 juin, la loi sur les congés payés est promulguée ; le 12, la loi des 40h. Pour la première fois en France, des salariés vont prendre le train pour la mer.',
        longterm:
          'Les conventions collectives signées en 1936 deviennent la matrice juridique du paritarisme français. À la Libération, on s\'en souviendra.'
      },
      traitShift: { batisseur: +3, pragmatique: +2 },
      flag: 'signe-matignon',
      ability: 'table'
    },
    {
      id: 'matignon-pousse-echelle-mobile',
      text: 'Refuser de signer tant que l\'échelle mobile des salaires n\'est pas concédée.',
      campText: {
        patron: 'Refuser le texte tant que la sortie de grève n\'est pas garantie sans échelle mobile.',
        salarie: 'Refuser de signer tant que l\'échelle mobile des salaires n\'est pas concédée.'
      },
      intent: 'Pousser l\'avantage. Risque d\'escalade.',
      campIntent: {
        patron: 'Tenir la ligne CGPF — pas d\'indexation des salaires sur les prix.',
        salarie: 'Pousser l\'avantage. Risque d\'escalade.'
      },
      theoryHint:
        'L\'échelle mobile indexe les salaires sur les prix. Concession majeure que le patronat refusera frontalement.',
      effects: {
        resources: {
          confiance: +12,
          rapportDeForce: +12,
          santeSociale: -8,
          caisse: -4,
          institution: -6,
          legitimite: -4
        },
        actors: {
          base: { trust: +18, pressure: +10 },
          adversaire: { trust: -15, patience: -25, stance: 'dur' },
          etat: { trust: -8, patience: -15, stance: 'dur' },
          opinion: { trust: -5 }
        }
      },
      consequence: {
        immediate:
          'Vous claquez la porte à minuit dix. Lambert-Ribot vous traite de « factieux ». Blum, livide, vous demande de revenir. Dehors, la grève reprend. Trois jours plus tard, vous signerez sans l\'échelle mobile, mais avec une prime supplémentaire.',
        longterm:
          'Le patronat retiendra ce refus. En 1968, Pompidou s\'en souviendra encore : ne jamais laisser la rue dicter le tempo.'
      },
      traitShift: { rupture: +3, tribun: +1 },
      flag: 'refuse-compromis',
      ability: 'manifestation'
    },
    {
      id: 'matignon-cede-une-semaine-de-conges',
      text: 'Concéder un point pour gagner une troisième semaine de congés.',
      campText: {
        patron: 'Lâcher la fixation horaire pour solder une semaine de congés en plus — temps non travaillé plutôt que masse salariale.',
        salarie: 'Concéder un point pour gagner une troisième semaine de congés.'
      },
      intent: 'Un troc tactique. Tu sors de la table avec ce que personne n\'attendait.',
      campIntent: {
        patron: 'Échanger du flexible-horaire contre du temps libre — la masse salariale est sauvée.',
        salarie: 'Un troc tactique. Tu sors de la table avec ce que personne n\'attendait.'
      },
      theoryHint:
        'En 1936, le patronat préfère parfois céder du temps non travaillé que des hausses de masse salariale. À utiliser comme levier.',
      effects: {
        resources: {
          confiance: +6,
          legitimite: +6,
          institution: +12,
          santeSociale: +14,
          rapportDeForce: +2,
          caisse: -2
        },
        actors: {
          base: { trust: +14, patience: +15 },
          adversaire: { trust: +2, patience: +5 },
          etat: { trust: +6 },
          opinion: { trust: +10 }
        }
      },
      consequence: {
        immediate:
          'Vous concédez sur la fixation horaire des conventions collectives ; en échange, Lambert-Ribot vous accorde une semaine supplémentaire à inclure dans la loi à venir. Blum est surpris. Lambert-Ribot signe en pinçant les lèvres.',
        longterm:
          'Cette troisième semaine, anticipée de 1936, ne sera officialisée qu\'en 1956. Mais sa promesse, glissée à Matignon, restera dans les mémoires syndicales.'
      },
      traitShift: { pragmatique: +3, technocrate: +2 }
    },
    {
      id: 'matignon-tient-tant-quil-faut',
      text: 'Refuser tout accord tant que le droit de grève n\'est pas explicitement reconnu.',
      campText: {
        patron: 'Refuser tout accord tant que l\'évacuation des usines n\'est pas obtenue préalablement.',
        salarie: 'Refuser tout accord tant que le droit de grève n\'est pas explicitement reconnu.'
      },
      intent: 'Pari principiel. Tu joues la doctrine plutôt que la table.',
      campIntent: {
        patron: 'Pari principiel — pas de signature sous occupation.',
        salarie: 'Pari principiel. Tu joues la doctrine plutôt que la table.'
      },
      theoryHint:
        'Le droit de grève est de fait, non de droit, en 1936. Le faire reconnaître transformerait la nature du paritarisme.',
      effects: {
        resources: {
          confiance: +14,
          legitimite: -10,
          rapportDeForce: +6,
          santeSociale: -14,
          institution: -12,
          caisse: -8
        },
        actors: {
          base: { trust: +18, pressure: +18 },
          adversaire: { trust: -20, patience: -35, stance: 'dur' },
          etat: { trust: -15, patience: -25, stance: 'dur' },
          opinion: { trust: -12, stance: 'instable' }
        }
      },
      consequence: {
        immediate:
          'Blum perd patience. Lambert-Ribot quitte la table. À l\'aube, l\'accord n\'existe pas. La grève entre dans sa quatrième semaine, les usines tiennent mais les caisses CGT s\'épuisent. Le 11 juin, les lois passeront sans accord paritaire — par décret. Tu auras gagné une bataille de principe, perdu une bataille d\'institutions.',
        longterm:
          'Sans Matignon, sans accord paritaire, le modèle français glisse vers le décret. Les conventions collectives auront du mal à se généraliser. La Sécurité sociale, en 1945, en portera la marque.'
      },
      traitShift: { rupture: +3, tribun: +2 },
      flag: 'epuise-mouvement',
      requiresTrait: 'rupture'
    },

    /* === Branches PATRONALES exclusives ===
       Audit asymétrie patron, retour live test : le patron jouait
       jusqu\'ici les choix syndicalistes en miroir. Voici deux
       options stratégiques qui appartiennent en propre au camp
       CGPF de 1936 — historiquement attestées. */
    {
      id: 'matignon-jouer-division-cgt',
      text: 'En coulisses, faire jouer la division entre Jouhaux (réformistes) et Frachon (CGTU).',
      intent: 'Diviser pour contenir — exploiter la fracture syndicale plutôt que la nier.',
      theoryHint:
        'La CGT vient à peine de se réunifier (mars 1936). Lambert-Ribot sait que Jouhaux veut signer vite, Frachon veut tenir. Cliver la délégation peut faire basculer le rapport de force.',
      effects: {
        resources: {
          rapportDeForce: +10,
          legitimite: -4,
          institution: -2,
          confiance: -6,
          caisse: +2,
          santeSociale: -4
        },
        actors: {
          base: { trust: -8, patience: -6 },
          adversaire: { trust: -10, stance: 'instable' },
          etat: { trust: -4 },
          opinion: { trust: -3 }
        }
      },
      consequence: {
        immediate:
          'Pendant la suspension, tu envoies un émissaire à Jouhaux : « Signons cette nuit, sans Frachon, et nous évitons la généralisation des occupations. » Jouhaux hésite. La CGT entre en interne dans une nuit blanche. Au petit matin, l\'accord est signé — un demi-point de hausse en moins, mais sans l\'échelle mobile. Frachon claque la porte du bureau confédéral.',
        longterm:
          'La fracture entre confédérés et unitaires, ravivée à Matignon, ressurgira en 1947 avec la scission FO. Le patronat aura compris : la division syndicale est un outil paritaire à part entière.'
      },
      traitShift: { pragmatique: +3, technocrate: +2 },
      flag: 'jouer-cgt-cgtu',
      camp: 'patron'
    },
    {
      id: 'matignon-mediation-presidentielle',
      text: 'Demander l\'arbitrage personnel du président Lebrun pour neutraliser Blum.',
      intent: 'Sortir du tête-à-tête CGT/CGPF — appeler la République par-dessus le Front populaire.',
      theoryHint:
        'En 1936, Lebrun est conservateur. Une médiation présidentielle au-dessus du gouvernement Blum est une manœuvre institutionnelle audacieuse mais constitutionnellement fragile.',
      effects: {
        resources: {
          legitimite: +6,
          institution: +4,
          rapportDeForce: -4,
          confiance: -8,
          santeSociale: -6,
          caisse: -2
        },
        actors: {
          base: { trust: -12, pressure: +8 },
          adversaire: { trust: -8, stance: 'dur' },
          etat: { trust: -10, patience: -10, stance: 'instable' },
          opinion: { trust: -6 }
        }
      },
      consequence: {
        immediate:
          'À 22h, tu fais transmettre une note à l\'Élysée. Lebrun consulte, hésite, refuse de prendre position publiquement — la Constitution de 1875 ne lui donne pas ce levier face à un Premier ministre majoritaire. La rumeur fuite dans la presse de droite. Blum, prévenu à minuit, t\'ignore froidement et impose les six points sans amendements.',
        longterm:
          'L\'épisode renforcera la doctrine paritaire d\'autonomie : ni l\'État ni la présidence n\'arbitrent les négociations sociales. La CGPF en retiendra la leçon — passer par les institutions, jamais par-dessus.'
      },
      traitShift: { paternaliste: +2, technocrate: +2 },
      flag: 'mediation-elysee',
      camp: 'patron'
    }
  ]
};
