import type { Scenario } from '../../types';

export const PATRON_SCENARIOS: Scenario[] = [
  {
    id: 'comite-forges-1864',
    turn: 9,
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
        flag: 'patronat-organise',
        ability: 'delegation'
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
        traitShift: { paternaliste: 3, batisseur: 1 },
        requiresTrait: 'paternaliste',
        ability: 'tresorerie'
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
        traitShift: { pragmatique: 1, paternaliste: -1 },
        ability: 'manifestation'
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
        flag: 'cgpf-cogestion',
        ability: 'table'
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
        flag: 'epuise-mouvement',
        ability: 'presse'
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
        traitShift: { rupture: 2 },
        ability: 'congres'
      }
    ]
  },
  {
    id: 'cnpf-1946',
    turn: 24,
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
      { trait: 'batisseur', text: "Siéger, c'est exister. Refuser, c'est laisser la place." },
      { trait: 'paternaliste', text: "L'entreprise reste le lieu propre du social. Le reste est politique." }
    ],
    quotes: [
      {
        text: "Le patronat n'a pas vocation à diriger ; il a vocation à se faire entendre. Cela suppose qu'il s'organise.",
        source: "Georges Villiers, discours fondateur du CNPF, 12 juin 1946"
      }
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
        flag: 'cnpf-insertion',
        ability: 'congres'
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
        traitShift: { paternaliste: 2, rupture: 1 },
        ability: 'tresorerie'
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
        flag: 'refuse-compromis',
        ability: 'delegation'
      }
    ]
  },
  {
    id: 'medef-1998',
    turn: 48,
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
        flag: 'epuise-mouvement',
        ability: 'manifestation'
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
        flag: 'refondation-paritaire',
        ability: 'table'
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
        traitShift: { pragmatique: 2, paternaliste: 1 },
        ability: 'congres'
      }
    ]
  },
  {
    id: 'grenelle-patron-1968',
    turn: 32,
    date: '27 mai 1968',
    era: 'trente_glorieuses',
    title: 'Grenelle, côté patronal',
    subtitle: 'Le CNPF face aux usines occupées',
    mood: 'tendu',
    premium: true,
    campFilter: 'patron',
    historicalContext:
      'À Grenelle, sous la pression de la grève générale et de l’occupation des usines, le CNPF négocie avec Georges Pompidou. Les protocoles prévoient un SMIG porté à 600 F (+35%), des hausses générales, le développement de la section syndicale d’entreprise. Côté patronal, l’option n’est plus de refuser, mais de doser ce qu’on donne et ce qu’on conserve.',
    setup: {
      reflechi:
        'L’économie productive est arrêtée. Le patronat n’a plus le choix de la signature. Il a encore celui de son rythme, de ses contreparties et de la manière dont il raconte cette signature à ses adhérents.',
      compulsif:
        'Au siège, on calcule à voix haute le coût d’une journée de grève multipliée par dix millions de salariés. Personne n’ose calculer le coût politique de la signature qu’on s’apprête à apposer.'
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'pragmatique', text: 'On signe maintenant. La productivité rattrapera ce qu’on aura concédé.' },
      { trait: 'rupture', text: 'Une signature obtenue sous occupation prépare la prochaine occupation.' }
    ],
    quotes: [
      {
        text: 'Mieux vaut une concession nette qu’un effondrement progressif de l’autorité dans l’usine.',
        source: 'Esprit des notes patronales, mai 1968'
      }
    ],
    choices: [
      {
        id: 'grenelle-patron-signer',
        text: 'Signer Grenelle et étaler les hausses.',
        intent: 'Sauver la rentrée économique.',
        theoryHint: 'Stratégie d’institution : la signature stabilise le marché du travail à un coût lissé.',
        effects: {
          resources: { institution: 7, legitimite: 5, rapportDeForce: -3, caisse: -5 },
          actors: { etat: { trust: 7 }, adversaire: { trust: 4, patience: 6 }, opinion: { trust: 5 } }
        },
        consequence: {
          immediate:
            'Les protocoles sont signés, la reprise s’organise. Quelques semaines plus tard, l’économie redémarre — et le coût de Grenelle commence à se diluer dans l’inflation.',
          longterm:
            'Cette signature ancrera, à droite comme à gauche, l’idée que le patronat sait reculer quand il faut.'
        },
        traitShift: { batisseur: 2, pragmatique: 1 },
        flag: 'cgpf-cogestion',
        ability: 'table'
      },
      {
        id: 'grenelle-patron-rejeter',
        text: 'Rejeter le protocole, demander l’intervention de l’État.',
        intent: 'Refuser la cogestion sous occupation.',
        theoryHint: 'Stratégie de rupture : externaliser la décision finale vers le pouvoir politique.',
        effects: {
          resources: { rapportDeForce: 6, legitimite: -4, santeSociale: -7, caisse: -3 },
          actors: { etat: { trust: 2 }, adversaire: { trust: -10, pressure: 10 }, opinion: { trust: -6 } }
        },
        consequence: {
          immediate:
            'Le rejet patronal est connu en quelques heures. Pompidou réplique en assumant lui-même les protocoles. La signature aura lieu — sans toi.',
          longterm:
            'Le geste sera relu plus tard comme une démission stratégique. Le patronat perdra du terrain dans le récit social français pendant une décennie.'
        },
        traitShift: { rupture: 2 },
        flag: 'epuise-mouvement',
        ability: 'delegation'
      },
      {
        id: 'grenelle-patron-section',
        text: 'Accepter la section syndicale en exigeant la paix dans l’atelier.',
        intent: 'Échanger reconnaissance contre stabilité.',
        theoryHint: 'Stratégie de cooptation : reconnaître l’organisation syndicale comme partenaire de la régulation interne.',
        effects: {
          resources: { institution: 5, confiance: 4, rapportDeForce: -2 },
          actors: { adversaire: { trust: 7 }, base: { trust: 5, patience: 5 }, etat: { trust: 4 } }
        },
        consequence: {
          immediate:
            'La section syndicale entre légalement dans l’entreprise. Les premiers délégués apprennent à négocier ; certains directeurs apprennent à négocier avec eux.',
          longterm:
            'Cette acceptation préparera, douze ans plus tard, l’accueil patronal pragmatique des lois Auroux.'
        },
        traitShift: { batisseur: 2, paternaliste: 1 },
        ability: 'congres'
      }
    ]
  },
  {
    id: 'auroux-patron-1982',
    turn: 38,
    date: '4 août 1982',
    era: 'mitterrand',
    title: 'Auroux : encadrer ou subir',
    subtitle: 'Le patronat face aux nouveaux droits',
    mood: 'tendu',
    premium: true,
    campFilter: 'patron',
    historicalContext:
      'Les lois Auroux (1982) instaurent la négociation annuelle obligatoire, le CHSCT, le droit d’expression directe et collective des salariés, la sanctuarisation de la section syndicale. Le CNPF de Yvon Chotard puis François Périgot doit choisir comment vivre avec un cadre largement renforcé en faveur de la représentation salariée dans l’entreprise.',
    setup: {
      reflechi:
        'Les lois sont votées. Reste à choisir si le patronat les conteste juridiquement, les met en œuvre en exigeant des contreparties, ou les internalise comme un nouveau standard de management.',
      compulsif:
        'Une circulaire interne au CNPF compare les textes Auroux à un "nouveau code du travail bis". Le ton est rude. Les industriels les plus modernes la trouvent déjà datée.'
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'rupture', text: "Une loi qu'on n'attaque pas devient un cadre acquis." },
      { trait: 'batisseur', text: "Une bonne DRH transforme un texte hostile en méthode de gestion." }
    ],
    quotes: [
      {
        text: "Les lois Auroux ne sont pas une attaque contre l'entreprise. Elles sont une opportunité de moderniser nos relations sociales — si nous savons nous en saisir.",
        source: "Yvon Chotard, président CNPF, communication interne, septembre 1982"
      }
    ],
    choices: [
      {
        id: 'auroux-patron-contester',
        text: 'Engager une contestation publique et juridique.',
        intent: 'Limiter la portée des lois.',
        theoryHint: 'Stratégie de bornage : faire produire par la jurisprudence une interprétation restrictive.',
        effects: {
          resources: { rapportDeForce: 5, legitimite: -3, institution: -2, caisse: -3 },
          actors: { etat: { trust: -5 }, adversaire: { trust: -6 }, opinion: { trust: -3 } }
        },
        consequence: {
          immediate:
            'Les recours partent. Les premiers arrêts arrivent, prudents. Quelques pans des lois sont durcis, d’autres sont confirmés sans bouger.',
          longterm:
            'Cette posture installera durablement l’idée d’un patronat structurellement hostile au droit du travail français.'
        },
        traitShift: { rupture: 2, technocrate: 1 },
        flag: 'refuse-compromis',
        ability: 'presse'
      },
      {
        id: 'auroux-patron-contreparties',
        text: 'Accepter Auroux en exigeant flexibilité et compétitivité.',
        intent: 'Croiser les concessions.',
        theoryHint: 'Stratégie d’échange : reconnaître les nouveaux droits contre une marge de manœuvre productive.',
        effects: {
          resources: { institution: 6, legitimite: 4, caisse: 2, rapportDeForce: -1 },
          actors: { etat: { trust: 5 }, adversaire: { trust: 4 }, opinion: { trust: 4 } }
        },
        consequence: {
          immediate:
            'Les négociations de branche se rouvrent. Quelques accords donnent-prennent voient le jour : journée de RTT contre annualisation, par exemple.',
          longterm:
            'Cette doctrine du donnant-donnant deviendra, dans les années 1990-2000, la grammaire dominante des accords de branche.'
        },
        traitShift: { batisseur: 2, pragmatique: 1 },
        flag: 'cgpf-cogestion',
        ability: 'table'
      },
      {
        id: 'auroux-patron-drh',
        text: 'Internaliser Auroux dans une nouvelle doctrine RH.',
        intent: 'Transformer la contrainte en avantage gestionnaire.',
        theoryHint: 'Stratégie d’acculturation : la fonction RH absorbe le droit du travail comme méthode managériale.',
        effects: {
          resources: { institution: 4, confiance: 3, legitimite: 3, caisse: -3 },
          actors: { base: { trust: 4 }, adversaire: { trust: 3 }, opinion: { trust: 5 } }
        },
        consequence: {
          immediate:
            'Les écoles de commerce se mettent à enseigner les NAO et les CHSCT comme des outils. Une génération de DRH apprend à parler aux représentants du personnel sans avocat.',
          longterm:
            'Le management français des trente années suivantes naîtra largement de cette acculturation discrète.'
        },
        traitShift: { batisseur: 2, technocrate: 2 },
        requiresTrait: 'technocrate',
        ability: 'talents'
      }
    ]
  },
  {
    id: 'loi-travail-patron-2016',
    turn: 68,
    date: '8 août 2016',
    era: 'hollande',
    title: 'Inversion des normes',
    subtitle: 'La loi Travail s’ouvre, le patronat choisit',
    mood: 'tendu',
    premium: true,
    campFilter: 'patron',
    historicalContext:
      'La loi Travail (El Khomri, 2016) consacre la primauté possible de l’accord d’entreprise sur l’accord de branche en matière de durée du travail et d’aménagement. Le MEDEF de Pierre Gattaz a obtenu un point doctrinal majeur. Reste à choisir comment l’utiliser sans casser la branche, qui sécurise jusque-là la concurrence loyale entre entreprises.',
    setup: {
      reflechi:
        'L’inversion des normes ouvre trois usages : descendre les négociations au plus bas niveau, construire une doctrine de branche défensive, ou sécuriser les grands accords pour éviter une remise en cause permanente.',
      compulsif:
        'Une note du MEDEF circule : "ne pas trop sortir le bazooka tout de suite." Tu sais que d’autres notes, plus internes, disent exactement l’inverse.'
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'rupture', text: 'À quoi bon avoir gagné l’inversion si on ne s’en sert pas ?' },
      { trait: 'batisseur', text: 'Une branche affaiblie, c’est une concurrence déréglée.' }
    ],
    choices: [
      {
        id: 'loi-travail-patron-entreprise',
        text: 'Pousser systématiquement la négociation au niveau de l’entreprise.',
        intent: 'Maximiser la flexibilité acquise.',
        theoryHint: 'Stratégie de décentralisation : la primauté de l’accord d’entreprise comme nouveau standard.',
        effects: {
          resources: { rapportDeForce: 6, caisse: 4, institution: -4, legitimite: -3 },
          actors: { etat: { trust: 2 }, adversaire: { trust: -8, patience: -4 }, base: { trust: -5 } }
        },
        consequence: {
          immediate:
            'Les premiers accords d’entreprise dérogeant à la branche sont publiés. Les TPE-PME demandent des modèles. Les syndicats accusent une concurrence à la baisse.',
          longterm:
            'Cette doctrine alimentera durablement les critiques du dialogue social français — y compris dans le camp patronal.'
        },
        traitShift: { rupture: 2, pragmatique: 1 },
        flag: 'epuise-mouvement',
        ability: 'table'
      },
      {
        id: 'loi-travail-patron-branche',
        text: 'Construire une doctrine de branche défensive.',
        intent: 'Sécuriser la concurrence loyale.',
        theoryHint: 'Stratégie de cadrage : la branche fixe les règles minimales pour éviter le dumping intra-sectoriel.',
        effects: {
          resources: { institution: 6, legitimite: 5, rapportDeForce: -2 },
          actors: { etat: { trust: 4 }, adversaire: { trust: 5 }, opinion: { trust: 4 } }
        },
        consequence: {
          immediate:
            'Les fédérations rouvrent leurs accords cadres. Plusieurs branches publient des "verrous" : pas de dérogation possible sur certains seuils.',
          longterm:
            'La branche, qu’on disait morte, redevient un acteur central — au prix d’un patronat plus discipliné qu’il ne le souhaitait.'
        },
        traitShift: { batisseur: 2, pragmatique: 1 },
        flag: 'refondation-paritaire',
        ability: 'congres'
      },
      {
        id: 'loi-travail-patron-stabiliser',
        text: 'Sécuriser les grands accords nationaux interprofessionnels.',
        intent: 'Acheter de la stabilité.',
        theoryHint: 'Stratégie d’institution : verrouiller les ANI pour éviter une remise en cause permanente.',
        effects: {
          resources: { institution: 7, legitimite: 4, caisse: -3 },
          actors: { adversaire: { trust: 6 }, etat: { trust: 5 }, opinion: { trust: 3 } }
        },
        consequence: {
          immediate:
            'Une nouvelle vague d’ANI est négociée. Lent, technique, peu visible — mais le coût juridique pour les entreprises baisse réellement.',
          longterm:
            'Ce choix discret deviendra, vu de loin, l’une des contributions patronales les plus durables des années 2010.'
        },
        traitShift: { batisseur: 2, technocrate: 1 },
        ability: 'table'
      }
    ]
  },
  {
    id: 'retraites-patron-2023',
    turn: 80,
    date: '14 avril 2023',
    era: 'macron_ii',
    title: 'Retraites 2023, la position patronale',
    subtitle: 'Soutenir, se taire ou refonder',
    mood: 'grave',
    premium: true,
    campFilter: 'patron',
    historicalContext:
      'La réforme portant l’âge légal à 64 ans est promulguée le 14 avril 2023, après plusieurs mois de mobilisation intersyndicale unanime et le recours à l’article 49.3. Le MEDEF de Geoffroy Roux de Bézieux est plutôt favorable, mais la séquence laisse durablement dégradée la confiance dans le dialogue social. Reste à choisir comment le patronat capitalise — ou non — sur cette réforme.',
    setup: {
      reflechi:
        'La réforme est passée. La question patronale est celle du jour d’après : soutenir publiquement la décision, se mettre en retrait pour préserver le dialogue futur, ou proposer un nouveau pacte social qui inclut les pertes politiques accumulées.',
      compulsif:
        'À l’avenue Bosquet, certains conseillers expliquent qu’"on a gagné la réforme et perdu le pays". D’autres haussent les épaules : c’est gagné, c’est suffisant.'
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'pragmatique', text: 'Une réforme passée vaut mieux qu’une réforme idéale qui ne passe pas.' },
      { trait: 'batisseur', text: 'Si tu ne reconstruis pas le dialogue maintenant, la prochaine réforme se fera sans toi.' }
    ],
    quotes: [
      {
        text: 'Le dialogue social français est sorti abîmé de cette séquence.',
        source: 'Constat partagé, partenaires sociaux, printemps 2023'
      }
    ],
    choices: [
      {
        id: 'retraites-patron-soutenir',
        text: 'Soutenir publiquement la réforme et son équilibre financier.',
        intent: 'Capitaliser politiquement.',
        theoryHint: 'Stratégie d’alignement : adosser la position patronale à la décision gouvernementale.',
        effects: {
          resources: { caisse: 4, rapportDeForce: 3, legitimite: -5, confiance: -4 },
          actors: { etat: { trust: 6 }, adversaire: { trust: -8, patience: -6 }, opinion: { trust: -7 } }
        },
        consequence: {
          immediate:
            'La position est claire et lisible. Les opposants la lisent comme un alignement de circonstance, ce qui est souvent vrai.',
          longterm:
            'Cette séquence pèsera dans la perception patronale du dialogue social pour la décennie suivante.'
        },
        traitShift: { pragmatique: 1, paternaliste: 1 },
        flag: 'epuise-mouvement',
        ability: 'presse'
      },
      {
        id: 'retraites-patron-retrait',
        text: 'Se mettre publiquement en retrait, défendre le paritarisme.',
        intent: 'Préserver le dialogue futur.',
        theoryHint: 'Stratégie de désengagement tactique : protéger le capital relationnel pour les négociations à venir.',
        effects: {
          resources: { legitimite: 5, institution: 4, rapportDeForce: -3 },
          actors: { adversaire: { trust: 5 }, etat: { trust: -2 }, opinion: { trust: 3 } }
        },
        consequence: {
          immediate:
            'Une déclaration sobre rappelle l’attachement au paritarisme. Les syndicats, sans rien renier, prennent acte. Une table de discussion rouvre — modeste — sur la pénibilité.',
          longterm:
            'Ce repli mesuré préparera la possibilité d’accords interprofessionnels nouveaux dans les deux à trois ans.'
        },
        traitShift: { batisseur: 2, pragmatique: 1 },
        flag: 'refondation-paritaire',
        ability: 'delegation'
      },
      {
        id: 'retraites-patron-pacte',
        text: 'Proposer un nouveau pacte social paritaire.',
        intent: 'Refonder par l’ambition.',
        theoryHint: 'Stratégie de refondation : transformer la défaite politique en programme commun.',
        effects: {
          resources: { institution: 7, legitimite: 6, confiance: 4, caisse: -5 },
          actors: { adversaire: { trust: 8, patience: 6 }, etat: { trust: 3 }, opinion: { trust: 6 } }
        },
        consequence: {
          immediate:
            'Le texte est ambitieux : pénibilité, transition écologique, formation. Il est lent à signer, mais il rouvre une grammaire commune.',
          longterm:
            'Cette tentative — réussie ou non — laissera trace : elle aura prouvé que le patronat peut prendre l’initiative quand il accepte d’en payer le prix.'
        },
        traitShift: { batisseur: 3, tribun: 1 },
        ability: 'table'
      }
    ]
  }
];
