import type { Scenario } from '../../types';

export const PATRON_SCENARIOS: Scenario[] = [
  {
    id: 'comite-forges-1864',
    turn: 13,
    date: '1864',
    era: 'xixe',
    title: 'Le Comité des Forges',
    subtitle: 'Le patronat s’organise',
    mood: 'tendu',
    premium: true,
    campFilter: 'patron',
    historicalContext:
      'Après la loi Ollivier (mai 1864), la grève cesse d’être un délit. Les maîtres de forges et grands industriels comprennent que la légalisation de la coalition ouvrière exige, en miroir, une coordination patronale durable. Le Comité des Forges, déjà actif, se renforce et prépare ce qui deviendra la matrice du patronat organisé.',
    setup: {
      reflechi:
        'La loi Ollivier ouvre une nouvelle économie politique du travail : on peut s’arrêter de travailler ensemble sans aller en prison. Le patronat doit choisir comment il occupe cet espace nouveau — par la concertation, la répression, ou l’organisation autonome.',
      compulsif:
        'Dans la fumée des hauts-fourneaux, des hommes en redingote discutent à voix basse. Personne n’aime le mot "syndicat", mais tout le monde sent qu’il faudra y répondre par autre chose qu’un règlement intérieur.'
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'pragmatique', text: 'Ne pas s’organiser maintenant, c’est laisser l’État arbitrer seul.' },
      { trait: 'paternaliste', text: 'Une œuvre sociale ferme bouche à mille discours.' }
    ],
    quotes: [
      {
        text: 'Tout accord pour faire cesser le travail ou en empêcher la reprise est dorénavant licite.',
        source: 'Esprit de la loi Ollivier, 25 mai 1864'
      }
    ],
    choices: [
      {
        id: 'forges-lobby',
        text: 'Structurer un patronat de combat parlementaire.',
        intent: 'Reprendre la main par la loi.',
        theoryHint: 'Lobby : le patronat investit le champ législatif pour borner la nouvelle liberté ouvrière.',
        effects: {
          resources: { rapportDeForce: 8, legitimite: 4, caisse: -4, confiance: -3 },
          actors: { etat: { trust: 6 }, base: { trust: -8, pressure: 6 }, opinion: { trust: -3 } }
        },
        consequence: {
          immediate:
            'Une délégation discrète part pour Paris. Le ministère écoute, prend des notes, promet des amendements à la prochaine session.',
          longterm: 'Le patronat des forges devient un acteur politique permanent — il l’est resté.'
        },
        traitShift: { pragmatique: 2, technocrate: 1 },
        flag: 'patronat-organise'
      },
      {
        id: 'forges-paternaliste',
        text: 'Investir dans les œuvres sociales d’entreprise.',
        intent: 'Couper l’herbe sous le pied de la coalition.',
        theoryHint: 'Paternalisme : sécurité matérielle accordée à l’ouvrier en échange de fidélité, sans représentation.',
        effects: {
          resources: { santeSociale: 7, legitimite: 5, caisse: -7, rapportDeForce: -1 },
          actors: { base: { patience: 8, trust: 4 }, opinion: { trust: 6 }, etat: { trust: 3 } }
        },
        consequence: {
          immediate:
            'Les premiers logements ouvriers sortent de terre. Une caisse de secours patronale est inaugurée. La presse économique applaudit l’industriel éclairé.',
          longterm:
            'Le paternalisme aura sa réussite — Le Creusot, Mulhouse — et son échec : il ne survivra pas à la première grande grève du XXe siècle.'
        },
        traitShift: { paternaliste: 3, batisseur: 1 }
      },
      {
        id: 'forges-repression',
        text: 'Refuser tout compromis, miser sur la force publique.',
        intent: 'L’État protégera l’ordre des ateliers.',
        theoryHint: 'Stratégie de répression : externaliser le coût social vers la police et la justice.',
        effects: {
          resources: { rapportDeForce: 5, legitimite: -6, santeSociale: -8, confiance: -5 },
          actors: { etat: { trust: 4 }, base: { trust: -14, pressure: 12 }, opinion: { trust: -8 } }
        },
        consequence: {
          immediate:
            'Une grève éclate dans une usine voisine. Les troupes interviennent. Le calme revient. Les noms des meneurs circulent dans les bureaux d’embauche.',
          longterm:
            'Cette posture nourrira pour des décennies l’hostilité de la classe ouvrière au patronat français.'
        },
        traitShift: { pragmatique: 1, paternaliste: -1 }
      }
    ]
  },
  {
    id: 'cgpf-1936',
    turn: 21,
    date: '7 juin – août 1936',
    era: 'entre_deux_guerres',
    title: 'Après Matignon, la CGPF tremble',
    subtitle: 'Refonder ou subir',
    mood: 'grave',
    premium: true,
    campFilter: 'patron',
    historicalContext:
      'Le 7 juin 1936, René-Paul Duchemin signe les accords Matignon : 40 heures, congés payés, conventions collectives, hausses de 7 à 15%. Pour beaucoup d’industriels, la signature est vécue comme une capitulation. En août, Duchemin est écarté ; la CGPF devient la Confédération générale du patronat français rénovée, dirigée par Claude-Joseph Gignoux, plus offensive.',
    setup: {
      reflechi:
        'La signature est faite. La question n’est plus de la défaire, mais de savoir comment le patronat réoccupe l’espace politique : par la cogestion sociale, par la riposte conservatrice, ou par la scission interne.',
      compulsif:
        'Dans les couloirs du siège de la CGPF, les conversations baissent quand tu entres. Personne n’a oublié ce que Duchemin a signé. Personne ne sait encore qui rédigera la suite.'
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'pragmatique', text: 'Tenir la signature, c’est gagner trois ans de paix sociale.' },
      { trait: 'rupture', text: 'Une signature obtenue sous occupation d’usines n’engage pas une politique.' }
    ],
    quotes: [
      {
        text: 'Il faut que le patronat français se réorganise, ou il sera réorganisé par d’autres.',
        source: 'Discours patronal, été 1936 (esprit)'
      }
    ],
    choices: [
      {
        id: 'cgpf-tenir',
        text: 'Tenir la ligne Duchemin et négocier l’application des accords.',
        intent: 'Sauver la cogestion sociale.',
        theoryHint: 'Stratégie d’institution : la signature acquise est mieux administrée par ses signataires.',
        effects: {
          resources: { institution: 8, legitimite: 5, rapportDeForce: -4, caisse: -2 },
          actors: { etat: { trust: 6 }, base: { trust: 4, patience: 6 }, opinion: { trust: 4 } }
        },
        consequence: {
          immediate:
            'Les conventions collectives sont signées branche par branche. La paix sociale tient quelques mois — assez pour normaliser ce qui paraissait scandaleux.',
          longterm:
            'La cogestion d’après-Matignon nourrira plus tard la doctrine du paritarisme français.'
        },
        traitShift: { batisseur: 2, pragmatique: 1 },
        flag: 'cgpf-cogestion'
      },
      {
        id: 'cgpf-gignoux',
        text: 'Soutenir Gignoux et la ligne offensive.',
        intent: 'Refonder la CGPF en lobby de combat.',
        theoryHint: 'Stratégie de récupération : reprendre par la pression politique ce qu’on a perdu en négociation.',
        effects: {
          resources: { rapportDeForce: 8, legitimite: 2, santeSociale: -6, confiance: -5 },
          actors: { adversaire: { patience: -8 }, etat: { trust: 3 }, base: { trust: -7, pressure: 8 } }
        },
        consequence: {
          immediate:
            'Gignoux prend la tête. La CGPF rénovée publie un manifeste qui parle de "redressement" et d’"autorité" plus que de paritarisme.',
          longterm:
            'Cette ligne pèsera lourd dans la radicalisation du conflit social de 1937 et le retour des grèves.'
        },
        traitShift: { rupture: 2, paternaliste: 1 },
        flag: 'epuise-mouvement'
      },
      {
        id: 'cgpf-scission',
        text: 'Quitter la CGPF pour fonder un comité patronal autonome.',
        intent: 'Refuser à la fois Matignon et Gignoux.',
        theoryHint: 'Scission : réduire le périmètre pour préserver la pureté doctrinale.',
        effects: {
          resources: { rapportDeForce: 4, legitimite: -4, institution: -6, caisse: -3 },
          actors: { adversaire: { trust: -2 }, etat: { trust: -2 }, base: { trust: -4 } }
        },
        consequence: {
          immediate:
            'Le nouveau comité regroupe quelques industriels durs. Il publie. Il se réunit. Il pèse moins que ce qu’il dit peser.',
          longterm: 'La fragmentation du patronat affaiblira sa position face à l’État pendant l’Occupation.'
        },
        traitShift: { rupture: 2 }
      }
    ]
  },
  {
    id: 'cnpf-1946',
    turn: 23,
    date: '12 juin 1946',
    era: 'reconstruction',
    title: 'CNPF, Villiers, refondation',
    subtitle: 'Le patronat sort de l’épuration',
    mood: 'tendu',
    premium: true,
    campFilter: 'patron',
    historicalContext:
      'Après la Libération, le patronat est sous le coup de l’épuration. Georges Villiers, déporté à Dachau pour faits de Résistance, refonde l’organisation en juin 1946 sous le nom de Conseil national du patronat français (CNPF). L’ordonnance de 1945 a établi une Sécurité sociale paritaire où les salariés sont majoritaires dans les caisses : la question est de savoir si le patronat accepte d’y siéger.',
    setup: {
      reflechi:
        'La Sécurité sociale paritaire est un fait. Le patronat peut s’y intégrer comme partenaire minoritaire mais reconnu, refuser pour défendre une autonomie patronale, ou ouvrir une bataille politique pour rééquilibrer les caisses.',
      compulsif:
        'Villiers convoque. Sa carte de déporté est encore visible dans son portefeuille. Tu sais que cette légitimité-là, ni toi ni les autres ne l’aurez. La question est de savoir comment l’utiliser.'
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'batisseur', text: 'Siéger, c’est exister. Refuser, c’est laisser la place.' },
      { trait: 'paternaliste', text: 'L’entreprise reste le lieu propre du social. Le reste est politique.' }
    ],
    choices: [
      {
        id: 'cnpf-siege',
        text: 'Siéger dans les caisses paritaires malgré la minorité.',
        intent: 'S’insérer dans le compromis républicain.',
        theoryHint: 'Stratégie d’insertion : la cogestion construit une légitimité patronale à reconstruire.',
        effects: {
          resources: { institution: 9, legitimite: 7, rapportDeForce: -3, caisse: -3 },
          actors: { etat: { trust: 8 }, adversaire: { trust: 4 }, opinion: { trust: 5 } }
        },
        consequence: {
          immediate:
            'Les administrateurs patronaux prennent leurs places. Ils découvrent que la minorité, dans une assemblée nombreuse, peut peser par la technique et par la durée.',
          longterm:
            'Cette insertion fera du paritarisme à la française une institution stable jusqu’aux années 1990.'
        },
        traitShift: { batisseur: 2, pragmatique: 1 },
        flag: 'cnpf-insertion'
      },
      {
        id: 'cnpf-autonomie',
        text: 'Privilégier les caisses patronales autonomes.',
        intent: 'Garder la main sur le périmètre social patronal.',
        theoryHint: 'Stratégie d’autonomie : préserver des espaces de décision sans cogestion ouvrière.',
        effects: {
          resources: { rapportDeForce: 5, caisse: 4, institution: -3, legitimite: -2 },
          actors: { etat: { trust: -2 }, adversaire: { trust: -4 }, opinion: { trust: -3 } }
        },
        consequence: {
          immediate:
            'Les caisses cadres et les organismes patronaux propres prennent de l’ampleur. La Sécurité sociale, elle, se construit sans grand-chose du patronat.',
          longterm:
            'Ce choix nourrira plus tard un sentiment durable : "le paritarisme s’est fait sans nous".'
        },
        traitShift: { paternaliste: 2, rupture: 1 }
      },
      {
        id: 'cnpf-rebattre',
        text: 'Plaider une réforme rapide pour rééquilibrer les caisses.',
        intent: 'Reprendre la main par la loi.',
        theoryHint: 'Stratégie de récupération institutionnelle : la majorité patronale se gagne au Parlement, pas dans la caisse.',
        effects: {
          resources: { rapportDeForce: 6, legitimite: 3, institution: 2, confiance: -4 },
          actors: { etat: { trust: 4 }, adversaire: { trust: -8, pressure: 6 } }
        },
        consequence: {
          immediate:
            'La proposition circule dans les cabinets. Elle attendra 1967 et les ordonnances Jeanneney pour devenir réalité — c’est-à-dire vingt ans.',
          longterm: 'L’histoire de la Sécu sera, pour partie, l’histoire de cette patience.'
        },
        traitShift: { pragmatique: 2, technocrate: 1 },
        flag: 'refuse-compromis'
      }
    ]
  },
  {
    id: 'medef-1998',
    turn: 36,
    date: '27 octobre 1998',
    era: 'cohabitations',
    title: 'Refondation sociale',
    subtitle: 'Le MEDEF reprend la main',
    mood: 'tendu',
    premium: true,
    campFilter: 'patron',
    historicalContext:
      'Le 27 octobre 1998, le CNPF devient le MEDEF (Mouvement des entreprises de France) sous l’impulsion d’Ernest-Antoine Seillière. La nouvelle direction lance la "Refondation sociale" : reprendre la main sur les organismes paritaires (UNEDIC, retraites complémentaires AGIRC-ARRCO, formation professionnelle), au besoin par la rupture. En 2001, le MEDEF claquera la porte de l’UNEDIC pour imposer une nouvelle convention.',
    setup: {
      reflechi:
        'Le paritarisme issu de 1945 paraît à beaucoup d’industriels obsolète : trop lourd, trop syndicalisé, trop coûteux. Trois lignes coexistent : refonder par le rapport de force, refonder par la négociation, ou défendre l’existant.',
      compulsif:
        'Seillière parle vite. Le mot "refondation" sort tous les deux paragraphes. Tu sais qu’il a déjà décidé. La question est de savoir si tu le suis ou si tu pèses sur la cadence.'
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'rupture', text: 'Une refondation qui ne rompt avec rien n’en est pas une.' },
      { trait: 'batisseur', text: 'Tu peux refonder la maison, ou la quitter. Pas les deux.' }
    ],
    quotes: [
      {
        text: 'Nous voulons refonder le pacte social français, pas le réformer à la marge.',
        source: 'Esprit de la communication MEDEF, 1999-2000'
      }
    ],
    choices: [
      {
        id: 'medef-rupture',
        text: 'Forcer la rupture avec les syndicats sur l’UNEDIC.',
        intent: 'Refonder par le rapport de force.',
        theoryHint: 'Stratégie de rupture : le retrait patronal force la renégociation sous menace de la désorganisation des caisses.',
        effects: {
          resources: { rapportDeForce: 9, institution: -4, legitimite: -5, confiance: -3 },
          actors: { adversaire: { trust: -10, patience: -8 }, etat: { trust: -4 }, opinion: { trust: -6 } }
        },
        consequence: {
          immediate:
            'La porte claque. Les caisses paritaires entrent en zone grise. L’État prépare un dispositif transitoire — le précédent est posé.',
          longterm:
            'La rupture de 2001 marquera un tournant : à partir de là, l’hypothèse étatique pèsera dans toute négociation paritaire.'
        },
        traitShift: { rupture: 3 },
        flag: 'epuise-mouvement'
      },
      {
        id: 'medef-negocier',
        text: 'Négocier une refondation par paliers.',
        intent: 'Réformer sans détruire.',
        theoryHint: 'Stratégie d’institution : transformer le paritarisme par accords successifs plutôt que par rupture.',
        effects: {
          resources: { institution: 6, legitimite: 4, rapportDeForce: 2, caisse: -3 },
          actors: { adversaire: { trust: 4 }, etat: { trust: 5 }, opinion: { trust: 3 } }
        },
        consequence: {
          immediate:
            'Une série d’accords interprofessionnels est négociée : santé, formation, complémentaires. La méthode prend, lente et coûteuse.',
          longterm:
            'Cette ligne définira pour les années 2000 une grammaire patronale du dialogue social — efficace, technique, peu lisible pour le grand public.'
        },
        traitShift: { batisseur: 2, pragmatique: 1 },
        flag: 'refondation-paritaire'
      },
      {
        id: 'medef-statu-quo',
        text: 'Défendre l’architecture paritaire existante.',
        intent: 'Préserver l’équilibre 1945.',
        theoryHint: 'Stratégie de conservation : la stabilité institutionnelle vaut mieux que tout pari de réforme.',
        effects: {
          resources: { institution: 5, caisse: 3, rapportDeForce: -3, legitimite: -1 },
          actors: { adversaire: { trust: 6 }, etat: { trust: 2 }, opinion: { trust: -2 } }
        },
        consequence: {
          immediate:
            'Le statu quo tient. Les industriels les plus offensifs grognent. Les autres respirent.',
          longterm:
            'Cette ligne perdra du terrain à l’intérieur du MEDEF — la refondation reviendra par d’autres canaux, lois Travail comprises.'
        },
        traitShift: { pragmatique: 2, paternaliste: 1 }
      }
    ]
  }
];
