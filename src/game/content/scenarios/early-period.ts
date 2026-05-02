import type { Scenario } from '../../types';

/**
 * Période pré-1864 — 5 scénarios qui rythment les premiers tours du
 * jeu : compagnonnages médiévaux, cahiers de doléances, livret ouvrier,
 * sociétés de secours mutuel, procès des coalitions. Pose
 * progressivement les enjeux du syndicalisme avant son existence
 * légale.
 */

export const EARLY_PERIOD_SCENARIOS: Scenario[] = [
  {
    id: 'compagnonnage-1700',
    turn: 2,
    date: 'XVIIIe siècle',
    era: 'medieval',
    title: 'Le Tour de France',
    subtitle: 'Compagnonnage du Devoir',
    mood: 'calme',
    premium: true,
    historicalContext:
      "Avant la Révolution, les compagnons du Devoir circulent de ville en ville pour parfaire leur métier. Ils logent dans des « mères », s'organisent en sociétés serrées, défendent les tarifs face aux maîtres, et perpétuent des rites secrets que les corporations urbaines tolèrent à demi-mot.",
    setup: {
      reflechi:
        "Le compagnonnage tient un équilibre fragile : assez visible pour défendre les ouvriers itinérants, assez discret pour ne pas attirer la maréchaussée. La question est moins doctrinale que pratique : comment financer la mère, comment honorer les compagnons morts, comment refuser un maître qui paie mal.",
      compulsif:
        "À l'auberge de la Reine, on partage le pain et la chanson de métier. Le maître charpentier de Lyon refuse un tarif plus bas que celui de la Trinité. La table approuve d'un grognement collectif."
    },
    actors: ['base', 'adversaire', 'opinion'],
    voices: [
      { trait: 'batisseur', text: 'On bâtit en silence ce que le siècle suivant nommera syndicat.' },
      { trait: 'rupture', text: 'Une auberge n\'est pas une assemblée. Mais c\'est déjà beaucoup.' }
    ],
    choices: [
      {
        id: 'compagnonnage-rite',
        text: 'Renforcer les rites internes du compagnonnage.',
        intent: 'Cohésion par la tradition.',
        theoryHint: "Cohésion symbolique : un rite partagé crée une dette d'appartenance plus forte qu'un règlement.",
        effects: {
          resources: { confiance: 6, institution: 3, legitimite: -1 },
          actors: { base: { trust: 7 } }
        },
        consequence: {
          immediate:
            "Trois nouveaux compagnons sont reçus à la mère de Tours. Le rituel se prolonge tard ; on parle peu de salaires, beaucoup d'honneur."
        },
        traitShift: { batisseur: 2, paternaliste: 1 }
      },
      {
        id: 'compagnonnage-greve',
        text: 'Refuser collectivement les chantiers sous-payés.',
        intent: 'Coalition discrète des compagnons.',
        theoryHint: "Première forme de grève — sans le mot, sans la reconnaissance, mais avec la pratique.",
        effects: {
          resources: { rapportDeForce: 5, confiance: 4, caisse: -3 },
          actors: { adversaire: { trust: -4, patience: -3 }, base: { trust: 5 } }
        },
        consequence: {
          immediate:
            "Quatre maîtres charpentiers se retrouvent sans bras pendant trois semaines. L'un cède, les autres font venir des hommes de Picardie."
        },
        traitShift: { rupture: 2 },
        flag: 'epuise-mouvement'
      },
      {
        id: 'compagnonnage-corporation',
        text: 'Composer avec les jurandes municipales.',
        intent: 'S\'intégrer aux institutions corporatives.',
        theoryHint: "Cooptation : les jurandes peuvent être un canal de revendication si on accepte leurs règles.",
        effects: {
          resources: { institution: 4, legitimite: 3, rapportDeForce: -2 },
          actors: { etat: { trust: 3 } }
        },
        consequence: {
          immediate:
            "Le doyen des charpentiers signe un protocole avec la jurande de Lyon : tarifs respectés en échange d'un calme garanti pour deux ans."
        },
        traitShift: { pragmatique: 2, batisseur: 1 }
      }
    ]
  },
  {
    id: 'cahiers-doleances-1789',
    turn: 5,
    date: 'mars 1789',
    era: 'revolution',
    title: 'Cahiers de doléances',
    subtitle: 'La parole ouvrière dans les États généraux',
    mood: 'tendu',
    premium: true,
    historicalContext:
      "Convoqués par Louis XVI pour rédiger les cahiers de doléances avant les États généraux, les artisans et compagnons de Paris obtiennent, par négociation âpre, le droit de figurer parmi les rédacteurs du Tiers-état. Leurs revendications : tarifs garantis, abolition des maîtrises héréditaires, caisses de secours autonomes pour les compagnons.",
    setup: {
      reflechi:
        "Pour la première fois, les ouvriers ont une chance d'inscrire dans un texte officiel ce qu'ils veulent voir changé. L'enjeu est moins la rédaction que la façon dont les patriciens du Tiers-état arbitreront entre les exigences ouvrières et celles des bourgeois marchands.",
      compulsif:
        "L'écritoire grince sous quatre mains. Tu dictes, le greffier reformule en plus joli, le maître chapelier biffe ce qui sent trop fort la coalition. Le papier sera lu à Versailles. Il est tard."
    },
    actors: ['base', 'etat', 'opinion'],
    voices: [
      { trait: 'tribun', text: 'Une page écrite vaut mieux que cent réunions oubliées.' },
      { trait: 'pragmatique', text: 'Les bourgeois lisent. Adapte ta plume à leur oreille.' }
    ],
    quotes: [
      {
        text: "Demandons abolition des maîtrises et libre exercice du métier sous tarif fixé.",
        source: 'Cahier de doléances des charpentiers de Paris, mars 1789'
      }
    ],
    choices: [
      {
        id: 'cahiers-tarifs',
        text: 'Inscrire la demande de tarifs garantis et caisses de secours.',
        intent: 'Revendication concrète des compagnons.',
        theoryHint: "Stratégie d'institutionnalisation précoce : transformer une exigence ouvrière en proposition de loi.",
        effects: {
          resources: { institution: 6, legitimite: 5, confiance: 4, rapportDeForce: -2 },
          actors: { etat: { trust: 4 }, base: { trust: 5 } }
        },
        consequence: {
          immediate:
            "La doléance est consignée. Elle ne sera pas suivie, mais elle existe noir sur blanc dans les archives de Versailles."
        },
        traitShift: { batisseur: 2, technocrate: 1 }
      },
      {
        id: 'cahiers-abolition',
        text: 'Exiger l\'abolition pure des maîtrises.',
        intent: 'Trancher le nœud corporatif.',
        theoryHint: "Stratégie révolutionnaire : libérer le marché du travail sans préparer ce qui le protégera.",
        effects: {
          resources: { rapportDeForce: 6, legitimite: -3, institution: -4 },
          actors: { adversaire: { trust: -8 }, etat: { stance: 'instable' } }
        },
        consequence: {
          immediate:
            "La revendication choque les jurandes. Deux ans plus tard, la loi Le Chapelier abolira les corporations — sans rien mettre à la place."
        },
        traitShift: { rupture: 2 },
        flag: 'refuse-compromis'
      },
      {
        id: 'cahiers-commercants',
        text: 'S\'allier aux marchands pour faire passer un tronc commun.',
        intent: 'Front du Tiers-état.',
        theoryHint: "Stratégie de coalition : faire bloc avec les bourgeois pour faire bouger le Roi, quitte à diluer.",
        effects: {
          resources: { legitimite: 6, institution: 3, confiance: -2 },
          actors: { opinion: { trust: 6 } }
        },
        consequence: {
          immediate:
            "La rédaction est solennelle, lisible, neutre. Elle parlera plus tard d'égalité civile et fort peu de salaires."
        },
        traitShift: { pragmatique: 2 }
      }
    ]
  },
  {
    id: 'livret-ouvrier-1803',
    turn: 8,
    date: '12 avril 1803',
    era: 'xixe',
    title: 'Le livret ouvrier',
    subtitle: 'Bonaparte serre l’étau',
    mood: 'grave',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Le 22 germinal an XI (12 avril 1803), Bonaparte instaure le livret ouvrier : tout ouvrier doit le porter, tamponné par chaque patron. Sans livret, vagabondage présumé ; sans congé du patron, embauche interdite. C'est l'outil principal du contrôle policier de la main-d'œuvre au XIXe.",
    setup: {
      reflechi:
        "Le livret n'est pas seulement un papier : c'est un nœud coulant administratif. Le patron y inscrit motifs de renvoi et soldes dus, l'ouvrier porte sa servitude consignée. Refuser le livret, c'est risquer la prison ; l'accepter, c'est entériner le système.",
      compulsif:
        "Le carnet pèse trois grammes, dix lignes, deux tampons. À l'usine de Saint-Étienne, le contremaître y inscrit « impertinent » et la prochaine embauche s'éteint d'avance."
    },
    actors: ['base', 'etat', 'adversaire'],
    voices: [
      { trait: 'rupture', text: 'Un papier qui te suit jusqu\'à la mort, ce n\'est plus un papier.' },
      { trait: 'technocrate', text: 'Un papier qu\'on connaît est un papier qu\'on contourne.' }
    ],
    choices: [
      {
        id: 'livret-clandestin',
        text: 'Constituer un réseau de faux livrets.',
        intent: 'Résistance clandestine.',
        theoryHint: "Stratégie de contournement : la falsification comme première école de l'organisation collective.",
        effects: {
          resources: { confiance: 8, rapportDeForce: 5, legitimite: -4 },
          actors: { etat: { trust: -6, stance: 'dur' }, base: { trust: 9 } }
        },
        consequence: {
          immediate:
            "Quelques imprimeurs complaisants, beaucoup de courage. Quatre ouvriers sont arrêtés au bout de six mois ; une centaine continue."
        },
        traitShift: { rupture: 2, technocrate: 1 },
        flag: 'trahit-base'
      },
      {
        id: 'livret-petitionner',
        text: 'Pétitionner le préfet pour adoucir le règlement.',
        intent: 'Action légale, prudente.',
        theoryHint: "Stratégie d'institutionnalisation : utiliser les voies de recours administratives existantes.",
        effects: {
          resources: { legitimite: 4, institution: 3, rapportDeForce: -1 },
          actors: { etat: { trust: 4 } }
        },
        consequence: {
          immediate:
            "Le préfet reçoit la délégation, écoute, promet. Trois articles du règlement sont assouplis. Le système, lui, reste."
        },
        traitShift: { pragmatique: 2 }
      },
      {
        id: 'livret-mutuelle',
        text: 'Créer une caisse pour les ouvriers privés de livret.',
        intent: 'Solidarité matérielle.',
        theoryHint: "Stratégie mutualiste : la solidarité financière comme première institution syndicale.",
        effects: {
          resources: { caisse: -2, confiance: 6, santeSociale: 4, institution: 3 },
          actors: { base: { trust: 7, patience: 5 } }
        },
        consequence: {
          immediate:
            "La caisse de la rue des Compagnons recueille les cotisations volontaires. Quatre ouvriers chassés sont nourris pendant trois mois."
        },
        traitShift: { batisseur: 3 }
      }
    ]
  },
  {
    id: 'mutuelle-1820',
    turn: 9,
    date: '1820-1830',
    era: 'xixe',
    title: 'Sociétés de secours mutuel',
    subtitle: "L'art de cotiser sous l'interdit",
    mood: 'calme',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Sous la Restauration et la Monarchie de Juillet, les sociétés de secours mutuel se multiplient malgré la loi Le Chapelier (1791) renforcée par les articles 414-416 du Code pénal de 1810 qui sanctionnent toute coalition. Officiellement caisses de bienfaisance, elles servent aussi de relais clandestins pour la coordination ouvrière. La police les tolère tant qu'elles ne dépassent pas vingt membres.",
    setup: {
      reflechi:
        "La société de secours est un cheval de Troie : elle a la bénédiction de l'évêque et des autorités, mais ses statuts cachent des formes d'organisation que la loi prohibe ailleurs. La question est de savoir jusqu'où pousser la fonction syndicale sans déclencher la dissolution.",
      compulsif:
        "Le registre est tenu à la main, avec une minutie de comptable rural. Les cotisations payent les enterrements, les naissances, et — sans qu'on l'écrive — les jours de grève."
    },
    actors: ['base', 'etat', 'opinion'],
    voices: [
      { trait: 'pragmatique', text: 'On meurt mieux à plusieurs. C\'est par là qu\'on commence à vivre mieux.' },
      { trait: 'batisseur', text: 'Une caisse qui dure trente ans devient une institution.' }
    ],
    choices: [
      {
        id: 'mutuelle-stricte',
        text: 'Tenir la société dans son rôle officiel : secours, naissances, décès.',
        intent: 'Discrétion stratégique.',
        theoryHint: "Stratégie de longue durée : durer plutôt que briller.",
        effects: {
          resources: { institution: 4, santeSociale: 3, legitimite: -1, rapportDeForce: -2 },
          actors: { opinion: { trust: 2 }, base: { patience: 4 } }
        },
        consequence: {
          immediate:
            "La société rassemble 38 cotisants en trois ans. Trois enterrements payés, deux veuves nourries. Personne ne dérange — personne ne te connaît."
        },
        traitShift: { batisseur: 3 },
        flag: 'cree-mutuelle-1864'
      },
      {
        id: 'mutuelle-coordination',
        text: 'Utiliser la mutuelle pour organiser des arrêts coordonnés.',
        intent: 'Détournement clandestin.',
        theoryHint: "Stratégie hybride : l'institution officielle comme façade d'une activité interdite.",
        effects: {
          resources: { rapportDeForce: 6, confiance: 5, legitimite: -3 },
          actors: { etat: { trust: -5, stance: 'dur' }, base: { trust: 7 } }
        },
        consequence: {
          immediate:
            "La grève des fileurs de Mulhouse réussit à isoler trois usines pendant deux semaines. La police soupçonne, ne prouve pas."
        },
        traitShift: { rupture: 2 }
      },
      {
        id: 'mutuelle-fusion',
        text: 'Fusionner avec d\'autres sociétés pour atteindre une masse critique.',
        intent: 'Stratégie territoriale.',
        theoryHint: "Stratégie d'alliance : trois petites caisses font moins peur qu'une grande, et plus peur que rien.",
        effects: {
          resources: { institution: 6, legitimite: 4, caisse: 2 },
          actors: { adversaire: { trust: -2, patience: -3 } }
        },
        consequence: {
          immediate:
            "Trois sociétés de Lyon, Saint-Étienne et Roanne fusionnent en Caisse régionale du Devoir. Le préfet demande à voir le registre, repart sans rien à reprocher."
        },
        traitShift: { technocrate: 2, batisseur: 1 }
      }
    ]
  },
  {
    id: 'proces-coalitions-1845',
    turn: 11,
    date: '1845-1850',
    era: 'xixe',
    title: 'Le procès des coalitions',
    subtitle: 'Quand la grève passe en cour d\'assises',
    mood: 'grave',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Sous la Monarchie de Juillet et le Second Empire à venir, les coalitions ouvrières restent un délit pénal. Plusieurs procès retentissants — Saint-Étienne, Roubaix, Paris — voient des dizaines d'ouvriers condamnés à la prison pour s'être concertés sur le tarif. La défense de ces ouvriers devient une école politique.",
    setup: {
      reflechi:
        "Une trentaine d'ouvriers tisseurs comparaissent en cour d'assises pour entente illicite. L'avocat est un républicain notoire ; le procureur a déjà condamné cent fois. Le procès durera trois semaines et les chroniques judiciaires en parleront longtemps.",
      compulsif:
        "Le banc des accusés sent l'huile à machine. Le greffier énumère les noms, les âges, les ateliers. À la galerie, des compagnons venus de Lyon prennent des notes pour leur propre cause à venir."
    },
    actors: ['base', 'etat', 'opinion'],
    voices: [
      { trait: 'tribun', text: 'Un procès est une tribune si on sait s\'y tenir debout.' },
      { trait: 'pragmatique', text: 'Une condamnation perdue en bloc est moins lourde que dix individuelles.' }
    ],
    choices: [
      {
        id: 'proces-defense-collective',
        text: 'Organiser une défense collective autour d\'un avocat républicain.',
        intent: 'Faire du procès une tribune politique.',
        theoryHint: "Stratégie d'opinion : transformer le banc des accusés en chaire d'auditoire.",
        effects: {
          resources: { legitimite: 7, confiance: 5, rapportDeForce: 3 },
          actors: { opinion: { trust: 8 }, etat: { trust: -3 } }
        },
        consequence: {
          immediate:
            "Le plaidoyer dure deux heures. Trois feuilles parisiennes le reproduisent en partie. Les peines sont prononcées mais réduites de moitié pour la moitié des accusés."
        },
        traitShift: { tribun: 3, batisseur: 1 }
      },
      {
        id: 'proces-caisse-defense',
        text: 'Lancer une caisse nationale pour les familles des condamnés.',
        intent: 'Solidarité matérielle, durable.',
        theoryHint: "Stratégie d'enracinement : la caisse de défense devient un organe permanent.",
        effects: {
          resources: { caisse: -6, confiance: 8, santeSociale: 5 },
          actors: { base: { trust: 8, patience: 5 } }
        },
        consequence: {
          immediate:
            "La souscription rassemble 2 800 francs en six mois. Onze familles d'ouvriers emprisonnés tiennent l'hiver."
        },
        traitShift: { batisseur: 2, paternaliste: 2 }
      },
      {
        id: 'proces-presse',
        text: 'Faire pression sur les chambres par la presse ouvrière naissante.',
        intent: 'Cadrage médiatique.',
        theoryHint: "Stratégie d'opinion publique : faire entrer le procès dans le débat parlementaire.",
        effects: {
          resources: { legitimite: 5, institution: 3, caisse: -2 },
          actors: { opinion: { trust: 6 }, etat: { pressure: 4 } }
        },
        consequence: {
          immediate:
            "Trois journaux ouvriers reprennent l'affaire pendant deux mois. Un député républicain interpelle le garde des Sceaux à la Chambre."
        },
        traitShift: { technocrate: 2, tribun: 1 }
      }
    ]
  }
];
