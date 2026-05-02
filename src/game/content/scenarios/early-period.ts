import type { Scenario } from '../../types';

/**
 * Période 1789-1850 — 4 scénarios fondateurs qui rythment les
 * premiers tours du jeu : cahiers de doléances, livret ouvrier
 * impérial, sociétés de secours mutuel post-Le Chapelier, procès
 * des coalitions. Pose progressivement les enjeux du syndicalisme
 * avant son existence légale.
 */

export const EARLY_PERIOD_SCENARIOS: Scenario[] = [
  {
    id: 'cahiers-doleances-1789',
    turn: 1,
    date: 'mars 1789',
    era: 'revolution',
    title: 'Cahiers de doléances',
    subtitle: 'La parole ouvrière dans les États généraux',
    mood: 'tendu',
    premium: true,
    historicalContext:
      "Louis XVI convoque les États généraux. Avant la séance, chaque corps doit rédiger un cahier de doléances. Les artisans et compagnons de Paris obtiennent, après négociation, le droit d'écrire avec le Tiers-état. Ils demandent trois choses : des tarifs garantis, la fin des maîtrises héréditaires, des caisses de secours autonomes pour les compagnons.",
    setup: {
      reflechi:
        "C'est la première fois que les ouvriers peuvent écrire ce qu'ils veulent dans un texte officiel. La question n'est pas comment écrire. La question est comment les bourgeois du Tiers-état trancheront. Les exigences ouvrières contre les exigences marchandes. À toi de placer ta voix.",
      compulsif:
        "L'écritoire grince sous quatre mains. Tu dictes. Le greffier reformule plus joliment. Le maître chapelier raye ce qui sent trop la coalition. Le papier partira à Versailles. Il est tard."
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
        text: 'Inscrire les tarifs garantis et les caisses de secours.',
        intent: 'Revendication concrète.',
        theoryHint: "Transformer une exigence ouvrière en proposition de loi : c'est le pari de l'institutionnalisation précoce.",
        effects: {
          resources: { institution: 6, legitimite: 5, confiance: 4, rapportDeForce: -2 },
          actors: { etat: { trust: 4 }, base: { trust: 5 } }
        },
        consequence: {
          immediate:
            "La doléance entre dans le cahier. Elle ne sera pas suivie d'effet. Mais elle existe, noir sur blanc, dans les archives de Versailles. Ton nom y figure."
        },
        traitShift: { batisseur: 2, technocrate: 1 }
      },
      {
        id: 'cahiers-abolition',
        text: 'Exiger l\'abolition pure et simple des maîtrises.',
        intent: 'Trancher le nœud corporatif.',
        theoryHint: "Libérer le marché du travail sans rien mettre à la place : c'est la stratégie révolutionnaire pure.",
        effects: {
          resources: { rapportDeForce: 6, legitimite: -3, institution: -4 },
          actors: { adversaire: { trust: -8 }, etat: { stance: 'instable' } }
        },
        consequence: {
          immediate:
            "La revendication choque les jurandes. Deux ans plus tard, la loi Le Chapelier abolira les corporations — sans rien mettre à la place. Les ouvriers se retrouveront seuls face à l'employeur."
        },
        traitShift: { rupture: 2 },
        flag: 'refuse-compromis'
      },
      {
        id: 'cahiers-commercants',
        text: 'S\'allier aux marchands pour un tronc commun du Tiers.',
        intent: 'Front du Tiers-état.',
        theoryHint: "Faire bloc avec les bourgeois pour bouger le Roi, quitte à diluer ses propres exigences.",
        effects: {
          resources: { legitimite: 6, institution: 3, confiance: -2 },
          actors: { opinion: { trust: 6 } }
        },
        consequence: {
          immediate:
            "La rédaction est solennelle. Lisible. Neutre. Elle parlera d'égalité civile. Elle parlera fort peu de salaires."
        },
        traitShift: { pragmatique: 2 }
      }
    ]
  },
  {
    id: 'livret-ouvrier-1803',
    turn: 4,
    date: '12 avril 1803',
    era: 'xixe',
    title: 'Le livret ouvrier',
    subtitle: 'Bonaparte serre l’étau',
    mood: 'grave',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Le 12 avril 1803, Bonaparte signe une loi : le livret ouvrier devient obligatoire. Chaque ouvrier doit le porter sur lui. Chaque patron y appose son tampon. Sans livret, l'ouvrier est présumé vagabond. Sans congé écrit du patron, il ne peut être embauché ailleurs. C'est l'outil principal du contrôle policier de la main-d'œuvre au XIXe siècle.",
    setup: {
      reflechi:
        "Le livret n'est pas qu'un papier. C'est un nœud coulant administratif. Le patron y inscrit ses motifs de renvoi. Il y inscrit les soldes dus. L'ouvrier porte sa servitude écrite. Refuser le livret, c'est risquer la prison. L'accepter, c'est entériner le système. À toi de choisir comment tu réponds.",
      compulsif:
        "Le carnet pèse trois grammes. Dix lignes, deux tampons. À l'usine de Saint-Étienne, le contremaître écrit « impertinent ». Sans même le savoir, ta prochaine embauche est déjà éteinte."
    },
    actors: ['base', 'etat', 'adversaire'],
    voices: [
      { trait: 'rupture', text: 'Un papier qui te suit jusqu\'à la mort, ce n\'est plus un papier.' },
      { trait: 'technocrate', text: 'Un papier qu\'on connaît est un papier qu\'on contourne.' }
    ],
    quotes: [
      {
        text: "Tout ouvrier voyageant sans être muni d'un livret régulier sera réputé vagabond, et pourra être arrêté et puni comme tel.",
        source: 'Loi du 22 germinal an XI (12 avril 1803), article 12'
      }
    ],
    choices: [
      {
        id: 'livret-clandestin',
        text: 'Monter un réseau de faux livrets.',
        intent: 'Résistance clandestine.',
        theoryHint: "Falsifier le papier, c'est la première école de l'organisation collective.",
        effects: {
          resources: { confiance: 8, rapportDeForce: 5, legitimite: -4 },
          actors: { etat: { trust: -6, stance: 'dur' }, base: { trust: 9 } }
        },
        consequence: {
          immediate:
            "Quelques imprimeurs complaisants, beaucoup de courage. Au bout de six mois, quatre ouvriers sont arrêtés. Une centaine continue. Le réseau survit dans les caves et les arrière-boutiques."
        },
        traitShift: { rupture: 2, technocrate: 1 },
        flag: 'trahit-base'
      },
      {
        id: 'livret-petitionner',
        text: "Pétitionner le préfet pour adoucir le règlement.",
        intent: 'Action légale, prudente.',
        theoryHint: "Utiliser les voies de recours administratives existantes : c'est lent mais c'est durable.",
        effects: {
          resources: { legitimite: 4, institution: 3, rapportDeForce: -1 },
          actors: { etat: { trust: 4 } }
        },
        consequence: {
          immediate:
            "Le préfet reçoit la délégation. Il écoute. Il promet. Trois articles du règlement sont assouplis. Le système, lui, reste."
        },
        traitShift: { pragmatique: 2 }
      },
      {
        id: 'livret-mutuelle',
        text: 'Créer une caisse pour les ouvriers privés de livret.',
        intent: 'Solidarité matérielle.',
        theoryHint: "La solidarité financière comme première institution syndicale.",
        effects: {
          resources: { caisse: -2, confiance: 6, santeSociale: 4, institution: 3 },
          actors: { base: { trust: 7, patience: 5 } }
        },
        consequence: {
          immediate:
            "La caisse de la rue des Compagnons recueille les cotisations volontaires. Quatre ouvriers chassés sont nourris pendant trois mois. Le précédent est posé."
        },
        traitShift: { batisseur: 3 }
      }
    ]
  },
  {
    id: 'mutuelle-1820',
    turn: 5,
    date: '1820-1830',
    era: 'xixe',
    title: 'Sociétés de secours mutuel',
    subtitle: "L'art de cotiser sous l'interdit",
    mood: 'calme',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Entre 1820 et 1830, les ouvriers s'organisent en cachette. La loi Le Chapelier (1791) interdit toute coalition. Le Code pénal de 1810 sanctionne durement. Pourtant, les sociétés de secours mutuel se multiplient. Officiellement, elles aident les veuves et les malades. En réalité, elles servent aussi à coordonner les ouvriers. La police ferme les yeux tant que la société compte moins de vingt membres.",
    setup: {
      reflechi:
        "La société de secours est un cheval de Troie. Elle a la bénédiction de l'évêque et des autorités. Mais ses statuts cachent une organisation que la loi interdit. La question est simple : jusqu'où pousser la fonction syndicale sans déclencher la dissolution ?",
      compulsif:
        "Le registre est tenu à la main. La minutie d'un comptable rural. Les cotisations paient les enterrements. Elles paient les naissances. Et — sans qu'on l'écrive — les jours de grève."
    },
    actors: ['base', 'etat', 'opinion'],
    voices: [
      { trait: 'pragmatique', text: 'On meurt mieux à plusieurs. C\'est par là qu\'on commence à vivre mieux.' },
      { trait: 'batisseur', text: 'Une caisse qui dure trente ans devient une institution.' }
    ],
    quotes: [
      {
        text: "Toute coalition entre les ouvriers pour faire cesser en même temps de travailler […] sera, si elle a été suivie d'une tentative ou d'un commencement d'exécution, punie d'un emprisonnement.",
        source: 'Code pénal de 1810, article 414'
      },
      {
        text: "Le bonheur de la classe la plus nombreuse et la plus pauvre doit être l'objet de la sollicitude générale.",
        source: 'Henri de Saint-Simon, Catéchisme des industriels, 1823-1824'
      }
    ],
    choices: [
      {
        id: 'mutuelle-stricte',
        text: 'Tenir la société dans son rôle officiel : secours, naissances, décès.',
        intent: 'Discrétion stratégique.',
        theoryHint: "Durer plutôt que briller. C'est la stratégie de longue durée.",
        effects: {
          resources: { institution: 4, santeSociale: 3, legitimite: -1, rapportDeForce: -2 },
          actors: { opinion: { trust: 2 }, base: { patience: 4 } }
        },
        consequence: {
          immediate:
            "La société rassemble 38 cotisants en trois ans. Trois enterrements payés. Deux veuves nourries. Personne ne dérange. Personne ne te connaît."
        },
        traitShift: { batisseur: 3 },
        flag: 'cree-mutuelle-1864'
      },
      {
        id: 'mutuelle-coordination',
        text: 'Utiliser la mutuelle pour organiser des arrêts coordonnés.',
        intent: 'Détournement clandestin.',
        theoryHint: "L'institution officielle comme façade d'une activité interdite.",
        effects: {
          resources: { rapportDeForce: 6, confiance: 5, legitimite: -3 },
          actors: { etat: { trust: -5, stance: 'dur' }, base: { trust: 7 } }
        },
        consequence: {
          immediate:
            "La grève des fileurs de Mulhouse isole trois usines pendant deux semaines. La police soupçonne. Elle ne prouve pas. Le risque, lui, ne disparaît pas."
        },
        traitShift: { rupture: 2 }
      },
      {
        id: 'mutuelle-fusion',
        text: "Fusionner avec d'autres sociétés pour atteindre une masse critique.",
        intent: 'Stratégie territoriale.',
        theoryHint: "Trois petites caisses font moins peur qu'une grande, et plus peur que rien.",
        effects: {
          resources: { institution: 6, legitimite: 4, caisse: 2 },
          actors: { adversaire: { trust: -2, patience: -3 } }
        },
        consequence: {
          immediate:
            "Trois sociétés — Lyon, Saint-Étienne, Roanne — fusionnent en Caisse régionale du Devoir. Le préfet demande à voir le registre. Il repart sans rien à reprocher."
        },
        traitShift: { technocrate: 2, batisseur: 1 }
      }
    ]
  },
  {
    id: 'proces-coalitions-1845',
    turn: 7,
    date: '1845-1850',
    era: 'xixe',
    title: 'Le procès des coalitions',
    subtitle: 'Quand la grève passe en cour d\'assises',
    mood: 'grave',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Sous la Monarchie de Juillet et le Second Empire qui s'annonce, la coalition ouvrière reste un délit. Plusieurs procès retentissants éclatent — Saint-Étienne, Roubaix, Paris. Des dizaines d'ouvriers sont condamnés à la prison pour s'être concertés sur le tarif. La défense de ces ouvriers devient une école politique.",
    setup: {
      reflechi:
        "Une trentaine d'ouvriers tisseurs comparaissent. Le motif : entente illicite. L'avocat est un républicain notoire. Le procureur a déjà condamné cent fois. Le procès durera trois semaines. Les chroniques judiciaires en parleront longtemps.",
      compulsif:
        "Le banc des accusés sent l'huile à machine. Le greffier énumère les noms, les âges, les ateliers. À la galerie, des compagnons venus de Lyon prennent des notes. Pour leur propre cause à venir."
    },
    actors: ['base', 'etat', 'opinion'],
    voices: [
      { trait: 'tribun', text: 'Un procès est une tribune si on sait s\'y tenir debout.' },
      { trait: 'pragmatique', text: 'Une condamnation collective est moins lourde que dix individuelles.' }
    ],
    quotes: [
      {
        text: "Tant que le travail sera traité comme une marchandise, la concurrence anarchique des ouvriers entre eux perpétuera leur misère.",
        source: 'Louis Blanc, Organisation du travail, 1839'
      }
    ],
    choices: [
      {
        id: 'proces-defense-collective',
        text: 'Organiser une défense collective autour d\'un avocat républicain.',
        intent: 'Faire du procès une tribune politique.',
        theoryHint: "Transformer le banc des accusés en chaire d'auditoire.",
        effects: {
          resources: { legitimite: 7, confiance: 5, rapportDeForce: 3 },
          actors: { opinion: { trust: 8 }, etat: { trust: -3 } }
        },
        consequence: {
          immediate:
            "Le plaidoyer dure deux heures. Trois feuilles parisiennes le reproduisent. Les peines tombent. Mais elles sont réduites de moitié pour la moitié des accusés."
        },
        traitShift: { tribun: 3, batisseur: 1 }
      },
      {
        id: 'proces-caisse-defense',
        text: 'Lancer une caisse nationale pour les familles des condamnés.',
        intent: 'Solidarité matérielle, durable.',
        theoryHint: "La caisse de défense devient un organe permanent.",
        effects: {
          resources: { caisse: -6, confiance: 8, santeSociale: 5 },
          actors: { base: { trust: 8, patience: 5 } }
        },
        consequence: {
          immediate:
            "La souscription rassemble 2 800 francs en six mois. Onze familles d'ouvriers emprisonnés tiennent l'hiver. La caisse, elle, durera bien après."
        },
        traitShift: { batisseur: 2, paternaliste: 2 }
      },
      {
        id: 'proces-presse',
        text: 'Faire pression sur les chambres par la presse ouvrière.',
        intent: 'Cadrage médiatique.',
        theoryHint: "Faire entrer le procès dans le débat parlementaire.",
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
