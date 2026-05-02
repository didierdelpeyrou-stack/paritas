import type { Scenario } from '../../types';

/**
 * Scénarios chronologiques de remplissage — trous identifiés dans
 * la timeline T1-T100 après le redressement 1789.
 *
 * Couvre 8 bascules historiques critiques qui manquaient :
 *   T3  — 1796 Conspiration des Égaux (Babeuf)
 *   T11 — 1886 Décazeville
 *   T13 — 1895 Fondation CGT à Limoges
 *   T18 — 1921 Scission CGT / CGTU
 *   T22 — 1941 Charte du travail (Vichy)
 *   T39 — 1983 Tournant de la rigueur
 *   T51 — 2003 Réforme Fillon des retraites
 *   T60 — 2010 Réforme Woerth des retraites
 */

export const FILLER_SCENARIOS: Scenario[] = [
  /* ============================================================
     T3 — 1796 — Conspiration des Égaux
     ============================================================ */
  {
    id: 'babeuf-1796',
    turn: 3,
    date: 'mai 1796',
    era: 'revolution',
    title: 'Conspiration des Égaux',
    subtitle: 'Babeuf et la première communauté ouvrière',
    mood: 'tendu',
    premium: true,
    historicalContext:
      "Sous le Directoire, Gracchus Babeuf et un groupe de républicains radicaux préparent une insurrection au nom de l'« égalité réelle » — abolition de la propriété privée, communauté des biens, droit au travail garanti. Trahis par un infiltré, ils sont arrêtés le 10 mai 1796. Babeuf est guillotiné en 1797. Le babouvisme inspirera les premiers socialismes ouvriers du XIXe.",
    setup: {
      reflechi:
        "Tu es membre du Directoire secret des Égaux. Le moment de l'insurrection approche. Les ouvriers parisiens sont avec toi mais l'armée tient la ville. La question stratégique : insurrection immédiate, repli organisationnel pour préparer la suite, ou négociation discrète avec les modérés du Directoire ?",
      compulsif:
        "Cave d'imprimerie rue de la Grande-Truanderie. Babeuf relit l'affiche : « Tribun du peuple ». Sur la table, dix-huit signatures, deux pistolets, un manuscrit du Manifeste des Égaux. À la porte, un guetteur attendu. Il n'arrive pas."
    },
    actors: ['base', 'etat', 'opinion'],
    voices: [
      { trait: 'rupture', text: 'L\'égalité de droit ne suffit pas. Il faut l\'égalité de fait — sinon ce ne sont que des mots.' },
      { trait: 'pragmatique', text: 'Mourir trahi pour une idée juste, c\'est gagner cent ans plus tard. Ou perdre.' }
    ],
    quotes: [
      {
        text: 'Que la Révolution ne soit pas pour quelques-uns, qu\'elle ne profite qu\'à eux : c\'est pour cela que nous voulons qu\'elle continue.',
        source: 'Babeuf, Manifeste des Égaux, 1796'
      }
    ],
    choices: [
      {
        id: 'babeuf-insurrection',
        text: 'Lancer l\'insurrection malgré les signaux d\'infiltration.',
        intent: 'Prendre le pouvoir avant d\'être arrêté.',
        theoryHint: "Stratégie de saut : l'opportunité historique ne se représentera pas, même si elle est imparfaite.",
        effects: {
          resources: { rapportDeForce: 8, confiance: 6, legitimite: -8, institution: -4 },
          actors: { etat: { trust: -10, stance: 'dur' }, base: { trust: 7 } }
        },
        consequence: {
          immediate:
            "L'insurrection échoue en 48 heures. Babeuf et 6 autres sont arrêtés le 10 mai. Procès en mai 1797. Deux exécutions, le reste déporté.",
          longterm:
            "Le babouvisme entre dans la mémoire ouvrière clandestine. Buonarroti rééditera le Manifeste en 1828 et inspirera Auguste Blanqui."
        },
        traitShift: { rupture: 3, tribun: 1 },
        flag: 'epuise-mouvement'
      },
      {
        id: 'babeuf-repli',
        text: 'Replier les Égaux dans une société secrète durable.',
        intent: 'Préserver les cadres pour le siècle suivant.',
        theoryHint: 'Stratégie de longue durée : l\'idée survit aux militants morts.',
        effects: {
          resources: { institution: 5, confiance: 3, rapportDeForce: -3 },
          actors: { base: { trust: 3 }, etat: { trust: -2 } }
        },
        consequence: {
          immediate:
            "Le réseau s\'éparpille mais les cadres survivent. Buonarroti, exilé, gardera le manuscrit du Manifeste pendant 30 ans.",
          longterm:
            "Le babouvisme alimente la pensée socialiste utopique (Fourier, Cabet) puis ouvrière (Blanqui, Proudhon)."
        },
        traitShift: { batisseur: 3 }
      },
      {
        id: 'babeuf-negocier',
        text: 'Sonder les modérés du Directoire pour une réforme légale.',
        intent: 'Substituer la loi à la conjuration.',
        theoryHint: 'Stratégie d\'institutionnalisation : convertir une exigence radicale en proposition acceptable.',
        effects: {
          resources: { legitimite: 4, institution: 3, rapportDeForce: -4, confiance: -4 },
          actors: { etat: { trust: 3 }, base: { trust: -5 } }
        },
        consequence: {
          immediate:
            "Trois conventionnels écoutent, prennent des notes. Aucun ne s'engage. La trahison vient d'eux, pas de l'infiltré.",
          longterm:
            "Le projet babouviste est neutralisé sans procès retentissant. Pas de martyr, pas de mémoire militante. L'oubli."
        },
        traitShift: { pragmatique: 2 },
        flag: 'trahit-base'
      }
    ]
  },

  /* ============================================================
     T11 — 1886 — Décazeville
     ============================================================ */
  {
    id: 'decazeville-1886',
    turn: 11,
    date: 'janvier-juin 1886',
    era: 'xixe',
    title: 'Décazeville',
    subtitle: 'Le premier grand procès minier',
    mood: 'grave',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Le 26 janvier 1886, à Décazeville (Aveyron), les mineurs en grève défenestrent le sous-directeur Jules Watrin, qu'ils accusent d'avoir affamé les familles. La grève dure 108 jours, attire le soutien national (Clemenceau à la Chambre, souscription publique). Quatre meneurs sont condamnés. La législation minière en sort transformée. La fédération nationale des mineurs naît dans la foulée.",
    setup: {
      reflechi:
        "Tu es secrétaire de la grève à Décazeville. Le préfet a fait venir 1 500 soldats. La caisse de grève survit grâce à la souscription nationale lancée par Clemenceau. Trois questions cruciales : tenir au prix de la radicalité (Watrin défenestré) ou condamner le geste, accepter la médiation parlementaire ou refuser, fédérer immédiatement avec les mineurs du Nord et de Saint-Étienne.",
      compulsif:
        "Salle de la mère du compagnonnage, 11 février 1886. Sur la table : un télégramme de Clemenceau, un communiqué de la Compagnie, et une liste de 47 familles sans pain. Dehors, la neige et trois compagnies de troupe."
    },
    actors: ['base', 'etat', 'opinion', 'adversaire'],
    voices: [
      { trait: 'tribun', text: 'La défenestration de Watrin est une honte ou un signal. Tu choisis lequel des deux.' },
      { trait: 'batisseur', text: 'Une fédération nationale des mineurs, c\'est ce qui sortira de cette grève. Prépare-la.' }
    ],
    quotes: [
      {
        text: 'Quand on a affamé pendant des mois des hommes, des femmes, des enfants, on n\'a pas le droit de s\'étonner d\'un éclat.',
        source: 'Georges Clemenceau, Chambre des députés, février 1886'
      }
    ],
    choices: [
      {
        id: 'decazeville-tenir',
        text: 'Tenir la grève à 108 jours, refuser la médiation.',
        intent: 'Faire céder la Compagnie par épuisement.',
        theoryHint: 'Stratégie d\'épuisement : le coût d\'une grève longue dépasse celui d\'une concession.',
        effects: {
          resources: { rapportDeForce: 7, confiance: 6, caisse: -6, santeSociale: -4 },
          actors: { adversaire: { trust: -7, patience: -6 }, base: { trust: 8 }, opinion: { trust: 4 } }
        },
        consequence: {
          immediate:
            'La Compagnie cède en juin sur 6 revendications. 4 meneurs condamnés à des peines de 3-12 mois. La grève fait 9 morts (familles privées de soins).',
          longterm:
            "Le procès des coalitions ouvrières devient impopulaire. La Fédération nationale des mineurs est fondée en 1893 directement à partir des cadres de Décazeville."
        },
        traitShift: { rupture: 2, batisseur: 1 },
        flag: 'epuise-mouvement'
      },
      {
        id: 'decazeville-mediation',
        text: 'Accepter la médiation parlementaire de Clemenceau.',
        intent: 'Sortie par le haut, gain politique.',
        theoryHint: "Stratégie d'opinion : transformer le conflit en débat national pour gagner sur le terrain politique.",
        effects: {
          resources: { legitimite: 6, institution: 4, rapportDeForce: -2 },
          actors: { opinion: { trust: 7 }, etat: { trust: 3 }, base: { trust: -2 } }
        },
        consequence: {
          immediate:
            "L'accord est signé en avril sur 4 revendications. La caisse de grève finit à zéro mais aucune mort de famille. Watrin remplacé. Les mineurs reprennent.",
          longterm:
            "La législation minière est réformée en 1890 (8h de fond), directement issue des audits parlementaires post-Décazeville."
        },
        traitShift: { pragmatique: 2, batisseur: 1 }
      },
      {
        id: 'decazeville-federer',
        text: 'Lancer immédiatement l\'appel à fédération nationale des mineurs.',
        intent: 'Transformer le conflit local en organisation pérenne.',
        theoryHint: 'Stratégie d\'enracinement : utiliser le moment de visibilité pour bâtir l\'institution.',
        effects: {
          resources: { institution: 8, legitimite: 4, confiance: 5, caisse: -3 },
          actors: { base: { trust: 6 }, adversaire: { trust: -3 } }
        },
        consequence: {
          immediate:
            "Un comité d'unité minière se réunit à Saint-Étienne en mars. 4 fédérations régionales adhèrent en 6 mois.",
          longterm:
            'Cette base permettra à la Fédération nationale des mineurs (1893) d\'être l\'une des plus structurées de la CGT à sa fondation en 1895.'
        },
        traitShift: { batisseur: 3 },
        flag: 'cree-mutuelle-1864'
      }
    ]
  },

  /* ============================================================
     T13 — 1895 — Fondation de la CGT à Limoges
     ============================================================ */
  {
    id: 'cgt-limoges-1895',
    turn: 13,
    date: '23-28 septembre 1895',
    era: 'xixe',
    title: 'Limoges 1895',
    subtitle: 'Fondation de la CGT',
    mood: 'euphorique',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Du 23 au 28 septembre 1895, le congrès de Limoges fonde la Confédération Générale du Travail. 28 fédérations professionnelles et 18 Bourses du travail (Pelloutier) se rassemblent. La doctrine est encore floue : action directe ou réformisme ? Prix du livret bleu CGT : 25 centimes. Adhérents la première année : ~125 000.",
    setup: {
      reflechi:
        "Tu es délégué d'une fédération professionnelle au congrès. Trois lignes s'affrontent : la ligne Pelloutier (Bourses du travail comme cœur, pédagogie ouvrière), la ligne révolutionnaire (Émile Pouget, action directe et grève générale), la ligne réformiste (Auguste Keufer, négociation et conventions). Le vote sur la doctrine doctrinale fixera 30 ans de paritarisme.",
      compulsif:
        "Salle Berlioz, Limoges, 26 septembre. Pelloutier tousse — il mourra 5 ans plus tard. Pouget gribouille un pamphlet pour le Père Peinard. Keufer relit ses notes : conventions du livre, Allemagne, Belgique. Sur la tribune, le drapeau rouge et le drapeau noir."
    },
    actors: ['base', 'opinion', 'etat'],
    voices: [
      { trait: 'batisseur', text: 'Une Bourse du travail, c\'est une école et un syndicat à la fois. Pelloutier a raison.' },
      { trait: 'rupture', text: 'L\'action directe contre la négociation. Sinon on devient un syndicat britannique : domestiqué.' },
      { trait: 'pragmatique', text: 'Une convention collective signée vaut mille tracts. Keufer va trop loin mais il a raison sur le principe.' }
    ],
    quotes: [
      {
        text: 'Le syndicat n\'est pas une œuvre passagère. Il sera l\'institution durable d\'une classe nouvelle.',
        source: 'Fernand Pelloutier, congrès de Limoges, 1895'
      }
    ],
    choices: [
      {
        id: 'cgt-bourses-pelloutier',
        text: 'Voter la primauté des Bourses du travail (ligne Pelloutier).',
        intent: 'Faire du syndicalisme une école avant tout.',
        theoryHint: 'Stratégie d\'éducation populaire : la conscience ouvrière se construit avant la grève.',
        effects: {
          resources: { institution: 7, confiance: 6, legitimite: 4, caisse: -2 },
          actors: { base: { trust: 7 }, etat: { trust: 1 } }
        },
        consequence: {
          immediate:
            "Les Bourses du travail (157 en 1900) deviennent le cœur structurant de la CGT. Pelloutier dirige la Fédération nationale des Bourses jusqu\'à sa mort en 1901.",
          longterm:
            'Cette ligne survivra dans la CFDT 1964 (auto-éducation, militants permanents qualifiés) et structurera la formation syndicale française.'
        },
        traitShift: { batisseur: 3 },
        flag: 'cree-syndicat-1884'
      },
      {
        id: 'cgt-action-directe',
        text: 'Voter la primauté de l\'action directe (ligne Pouget).',
        intent: 'Doctrine révolutionnaire pure.',
        theoryHint: 'Stratégie de rupture : le syndicat comme machine de guerre, pas comme institution.',
        effects: {
          resources: { rapportDeForce: 8, confiance: 5, legitimite: -4, institution: -3 },
          actors: { etat: { trust: -5, stance: 'dur' }, base: { trust: 6 } }
        },
        consequence: {
          immediate:
            "La ligne Pouget gagne. Le journal Le Père Peinard et La Voix du Peuple deviennent les plumes officielles.",
          longterm:
            'Cette doctrine donne le syndicalisme révolutionnaire qui culminera à la Charte d\'Amiens 1906 et déclinera après 1914 (Union sacrée).'
        },
        traitShift: { rupture: 2, tribun: 1 }
      },
      {
        id: 'cgt-negociation-keufer',
        text: 'Privilégier la négociation collective (ligne Keufer).',
        intent: 'Modèle réformiste type allemand.',
        theoryHint: 'Stratégie d\'institutionnalisation : mieux vaut une convention médiocre signée qu\'une grève spectaculaire perdue.',
        effects: {
          resources: { institution: 6, legitimite: 6, rapportDeForce: -3 },
          actors: { adversaire: { trust: 4 }, etat: { trust: 4 }, base: { trust: -3 } }
        },
        consequence: {
          immediate:
            'Le congrès est divisé. La ligne Keufer obtient 28% des voix mais structure la Fédération du livre, modèle de réformisme français.',
          longterm:
            "Cette tradition réformiste française restera minoritaire jusqu\'à la scission FO 1947, puis dominera dans la CFDT post-Maire (1972+)."
        },
        traitShift: { pragmatique: 2, technocrate: 1 }
      }
    ]
  },

  /* ============================================================
     T18 — 1921 — Scission CGT / CGTU
     ============================================================ */
  {
    id: 'scission-cgtu-1921',
    turn: 18,
    date: '25-30 décembre 1921',
    era: 'entre_deux_guerres',
    title: 'Scission CGTU',
    subtitle: 'La fracture communiste',
    mood: 'grave',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Au congrès de Lille (juillet 1921), la majorité confédérée Jouhaux exclut les minorités révolutionnaires. Le 25 décembre 1921, ces minoritaires fondent la CGT-Unitaire (CGTU), affiliée à l'Internationale syndicale rouge (ISR) de Moscou. La CGT confédérée garde 350 000 adhérents, la CGTU en a 250 000. Pour 15 ans, le mouvement ouvrier français sera coupé en deux.",
    setup: {
      reflechi:
        "Tu es membre du bureau confédéral CGT. La rupture avec les minoritaires est consommée. Trois positions dans la majorité Jouhaux : durcir l'exclusion (lignes claires), tendre la main aux minoritaires (réintégration sous condition d'autonomie vis-à-vis du PCF), ou se tourner vers les confédérations européennes (FSI Amsterdam) pour reconstruire un horizon non-soviétique.",
      compulsif:
        "Bureau confédéral, rue Lafayette, 27 décembre. Une dépêche Tass arrive : « les unitaires félicités par Trotski ». Jouhaux, fatigué, dit : « ils ont choisi Moscou. Ils paieront en militants ce qu\'ils gagneront en romantisme. »"
    },
    actors: ['base', 'etat', 'opinion', 'adversaire'],
    voices: [
      { trait: 'pragmatique', text: 'Une CGT divisée est une CGT plus faible face au patronat. Trouve un pont, même fragile.' },
      { trait: 'rupture', text: 'Pas de pont avec ceux qui ont choisi Moscou. La trahison est consommée.' },
      { trait: 'batisseur', text: 'Reconstruis un projet syndical international hors du Komintern. C\'est ça le futur.' }
    ],
    choices: [
      {
        id: 'cgtu-durcir',
        text: 'Durcir l\'exclusion : pas de retour des minoritaires.',
        intent: 'Ligne claire indépendante.',
        theoryHint: 'Stratégie de pureté doctrinale : préserver l\'identité CGT face à l\'aimant communiste.',
        effects: {
          resources: { institution: 4, legitimite: 3, rapportDeForce: -4, confiance: -3 },
          actors: { base: { trust: -4 }, etat: { trust: 4 }, adversaire: { trust: 3 } }
        },
        consequence: {
          immediate:
            "La CGT confédérée publie une circulaire d'exclusion stricte. La CGTU radicalise sa ligne pro-Moscou.",
          longterm:
            "La fracture durera 15 ans. Les retrouvailles de 1936 (CGT réunifiée pour le Front populaire) seront chèrement payées."
        },
        traitShift: { batisseur: 1, rupture: 1 }
      },
      {
        id: 'cgtu-pont',
        text: 'Tendre un pont vers les minoritaires non-PCF.',
        intent: 'Préserver l\'unité ouvrière française.',
        theoryHint: "Stratégie d'unité : isoler la fraction Moscou pour préserver le reste.",
        effects: {
          resources: { confiance: 5, institution: 3, legitimite: -1 },
          actors: { base: { trust: 4 }, adversaire: { trust: -2 } }
        },
        consequence: {
          immediate:
            "10 fédérations minoritaires (textile, livre) refusent de rejoindre la CGTU et restent confédérées. Petit succès tactique.",
          longterm:
            'Cette ligne facilite les retrouvailles de 1936 — quand CGT et CGTU fusionnent à nouveau au congrès de Toulouse.'
        },
        traitShift: { pragmatique: 2, batisseur: 1 }
      },
      {
        id: 'cgtu-international',
        text: 'Investir massivement dans la FSI Amsterdam (international réformiste).',
        intent: 'Construire un pôle international non-stalinien.',
        theoryHint: "Stratégie de cadrage international : refuser le binaire Moscou / patronat occidental.",
        effects: {
          resources: { institution: 6, legitimite: 5, caisse: -4 },
          actors: { etat: { trust: 3 }, opinion: { trust: 4 } }
        },
        consequence: {
          immediate:
            "Jouhaux devient vice-président de la FSI en 1922. La CGT participe activement à l\'élaboration des conventions de l\'OIT.",
          longterm:
            'Cette ligne donnera au syndicalisme français un rayonnement international durable, et préparera Jouhaux comme père de l\'OIT et prix Nobel 1951.'
        },
        traitShift: { batisseur: 2, technocrate: 1 }
      }
    ]
  },

  /* ============================================================
     T22 — 1941 — Charte du travail (Vichy)
     ============================================================ */
  {
    id: 'charte-travail-vichy-1941',
    turn: 22,
    date: '4 octobre 1941',
    era: 'entre_deux_guerres',
    title: 'Charte du travail',
    subtitle: 'Le corporatisme imposé par Vichy',
    mood: 'grave',
    premium: true,
    historicalContext:
      "Le 4 octobre 1941, Pétain promulgue la Charte du travail : interdiction de la grève, dissolution des confédérations (CGT et CFTC), création de comités sociaux d'entreprise corporatistes regroupant patrons et ouvriers d'un même métier sous tutelle de l'État. La CGT clandestine (Saillant, Jouhaux interné) refuse. La Résistance ouvrière (Manifeste des Douze, novembre 1940) précède même la Charte. À la Libération, le CNR balaiera tout cela.",
    setup: {
      reflechi:
        "Tu es membre du bureau clandestin CGT. La Charte du travail est promulguée. Tes options : participer aux comités sociaux pour les retourner de l'intérieur (entrisme), refuser publiquement et passer en clandestinité totale, ou rejoindre les Résistances communistes/socialistes pour préparer la Libération.",
      compulsif:
        "Cave d'imprimerie clandestine, faubourg Saint-Antoine. Sur la table, le décret-loi de Vichy, le Manifeste des Douze (Saillant, Bothereau, Jouhaux), et un télégramme de Londres signé Léon Jouhaux. Dehors, la Milice."
    },
    actors: ['base', 'etat', 'adversaire', 'opinion'],
    voices: [
      { trait: 'rupture', text: 'Une charte qui interdit la grève n\'est pas une charte. C\'est l\'écrasement. Refuse.' },
      { trait: 'pragmatique', text: 'L\'entrisme dans les comités sociaux peut sauver des compagnons. Ne sous-estime pas les marges réelles.' }
    ],
    quotes: [
      {
        text: 'Le syndicalisme libre, indépendant des pouvoirs publics et patronaux, est la condition même de la liberté ouvrière.',
        source: 'Manifeste des Douze, 15 novembre 1940'
      }
    ],
    choices: [
      {
        id: 'vichy-entrisme',
        text: 'Pratiquer l\'entrisme dans les comités sociaux.',
        intent: 'Sauver les compagnons par l\'intérieur.',
        theoryHint: "Stratégie de présence : être là pour limiter les dégâts vaut mieux qu\'être absent.",
        effects: {
          resources: { confiance: -5, institution: 2, legitimite: -7, rapportDeForce: -4 },
          actors: { base: { trust: -7 }, etat: { trust: 3 } }
        },
        consequence: {
          immediate:
            "Quelques cadres CGT siègent dans les comités sociaux. Ils sauvent effectivement quelques renvois de STO et quelques familles. Mais la base vit cela comme une trahison.",
          longterm:
            "À la Libération, ces militants seront marginalisés au sein de la CGT renaissante. Leur trajectoire pèsera dans la scission FO 1947."
        },
        traitShift: { paternaliste: 2, pragmatique: 1 },
        flag: 'trahit-base'
      },
      {
        id: 'vichy-clandestinite',
        text: 'Refus public, clandestinité totale, presse syndicale interdite.',
        intent: 'Préserver la doctrine au prix de la sécurité.',
        theoryHint: 'Stratégie de pureté résistante : la légitimité d\'après-guerre se construit maintenant.',
        effects: {
          resources: { legitimite: 8, confiance: 7, rapportDeForce: 4, caisse: -5, santeSociale: -3 },
          actors: { base: { trust: 8 }, etat: { trust: -8, stance: 'dur' }, opinion: { trust: 6 } }
        },
        consequence: {
          immediate:
            "Le bureau clandestin publie La Vie ouvrière en 12 000 exemplaires en 1942. 47 militants CGT sont fusillés ou déportés entre 1941 et 1944. Bothereau est arrêté en 1943.",
          longterm:
            "La résistance syndicale donne à la CGT et à la CFTC clandestines la légitimité morale absolue à la Libération. Le Programme du CNR sera leur héritage direct."
        },
        traitShift: { rupture: 2, batisseur: 2 },
        flag: 'epuise-mouvement'
      },
      {
        id: 'vichy-cnr',
        text: 'Rejoindre les Résistances et préparer le Programme du CNR.',
        intent: 'Bâtir l\'après-guerre depuis maintenant.',
        theoryHint: 'Stratégie de refondation : la victoire sera politique et institutionnelle, pas seulement militaire.',
        effects: {
          resources: { institution: 9, legitimite: 7, confiance: 6, rapportDeForce: 3 },
          actors: { base: { trust: 5 }, etat: { trust: -5 }, opinion: { trust: 5 } }
        },
        consequence: {
          immediate:
            "Saillant rejoint le CNR en 1943 comme représentant CGT. Le Programme « Les Jours heureux » est adopté le 15 mars 1944.",
          longterm:
            "La Sécurité sociale (1945), les comités d'entreprise (1945), les conventions collectives (1946) sont toutes des héritiers directs de cette participation au CNR."
        },
        traitShift: { batisseur: 3, tribun: 1 },
        flag: 'cree-secu'
      }
    ]
  },

  /* ============================================================
     T39 — 1983 — Tournant de la rigueur
     ============================================================ */
  {
    id: 'rigueur-1983',
    turn: 39,
    date: 'mars 1983',
    era: 'mitterrand',
    title: 'Tournant de la rigueur',
    subtitle: 'Mitterrand abandonne la relance',
    mood: 'grave',
    premium: true,
    historicalContext:
      "En mars 1983, après deux dévaluations du franc et l'échec de la relance keynésienne par la consommation (1981-1982), Mitterrand opte pour la rigueur : austérité salariale, désindexation des salaires, plan d'économies de 65 milliards. Pour la première fois sous un gouvernement de gauche, le syndicalisme est confronté à un choix stratégique : soutenir Mitterrand par discipline politique, ou rompre par exigence ouvrière.",
    setup: {
      reflechi:
        "Tu es secrétaire confédéral d'une grande centrale (CGT, CFDT, FO). Le tournant de la rigueur est annoncé. Trois positions s'offrent : soutien critique à la rigueur (préserver l'alliance gauche-syndicat), opposition frontale (défense du pouvoir d'achat), ou tournant institutionnel (négocier paritairement la rigueur en gagnant des contreparties qualitatives).",
      compulsif:
        "Salle de réunion FO, 22 mars 1983. À la radio, Mauroy annonce la désindexation. André Bergeron lit un communiqué confédéral. Quelqu'un dit : « on a élu un président pour ça ? » Personne ne répond."
    },
    actors: ['base', 'etat', 'opinion', 'adversaire'],
    voices: [
      { trait: 'pragmatique', text: 'Si tu romps avec Mitterrand, tu offres 1986 à Chirac. Calcule.' },
      { trait: 'rupture', text: 'Le pouvoir d\'achat ouvrier ne se négocie pas. Pas même contre une élection.' },
      { trait: 'batisseur', text: 'Profite de la rigueur pour obtenir des droits institutionnels durables — c\'est l\'occasion.' }
    ],
    quotes: [
      {
        text: 'Le tournant de mars 1983 a fait basculer le syndicalisme français : de l\'allié programmatique du gouvernement à l\'institution autonome face à l\'État.',
        source: 'Henri Krasucki, secrétaire général CGT, mémoires'
      }
    ],
    choices: [
      {
        id: 'rigueur-soutien',
        text: 'Soutenir la rigueur par discipline politique.',
        intent: 'Préserver l\'alliance gauche-syndicat.',
        theoryHint: "Stratégie de loyauté politique : la défaite électorale 1986 serait pire que la rigueur.",
        effects: {
          resources: { institution: 3, legitimite: -3, confiance: -7, rapportDeForce: -4 },
          actors: { etat: { trust: 6 }, base: { trust: -8 }, adversaire: { trust: 2 } }
        },
        consequence: {
          immediate:
            "La CFDT signe quelques compromis sur la formation. La CGT critique mais ne mobilise pas. FO refuse mais sans grande grève.",
          longterm:
            "L'alliance gauche-syndicat ne se relèvera pas. Le PS perd les législatives 1986 malgré tout. Le syndicalisme est durablement délégitimé."
        },
        traitShift: { paternaliste: 2 },
        flag: 'trahit-base'
      },
      {
        id: 'rigueur-rupture',
        text: 'Rompre frontalement, mobilisation salariale nationale.',
        intent: 'Défendre le pouvoir d\'achat coûte que coûte.',
        theoryHint: 'Stratégie de pureté ouvrière : le syndicat n\'est pas une chambre d\'enregistrement.',
        effects: {
          resources: { rapportDeForce: 7, confiance: 7, legitimite: -2 },
          actors: { base: { trust: 8 }, etat: { trust: -7 }, adversaire: { trust: -3 } }
        },
        consequence: {
          immediate:
            'Grève nationale du 22 mars 1984 : 800 000 manifestants. Mitterrand recule légèrement (RMI prévu en 1988). Mais la rigueur tient.',
          longterm:
            "Le syndicalisme garde sa légitimité en interne. La CGT et FO maintiennent leurs adhérents. La CFDT pâtit longtemps de sa signature initiale."
        },
        traitShift: { rupture: 2, tribun: 1 }
      },
      {
        id: 'rigueur-paritaire',
        text: 'Négocier paritairement la rigueur — contreparties qualitatives.',
        intent: 'Refondation par la négociation institutionnelle.',
        theoryHint: 'Stratégie d\'opportunité : la rigueur impose des concessions, autant les obtenir bien.',
        effects: {
          resources: { institution: 7, legitimite: 5, confiance: -2, rapportDeForce: -3 },
          actors: { adversaire: { trust: 5 }, etat: { trust: 4 } }
        },
        consequence: {
          immediate:
            "Un accord sur la formation continue (1984), la prévoyance complémentaire (1985), et la 5ème semaine de congés payés (déjà en 1982) sont obtenus.",
          longterm:
            "Cette ligne CFDT inspirera la « refondation sociale » Notat-Seillière de 1999-2002. Elle marque le début du syndicalisme paritariste contemporain."
        },
        traitShift: { batisseur: 2, technocrate: 2 }
      }
    ]
  },

  /* ============================================================
     T51 — 2003 — Réforme retraites Fillon
     ============================================================ */
  {
    id: 'fillon-retraites-2003',
    turn: 51,
    date: '13 mai – 24 juillet 2003',
    era: 'cohabitations',
    title: 'Réforme Fillon',
    subtitle: 'La première grande défaite syndicale post-1995',
    mood: 'grave',
    premium: true,
    historicalContext:
      "François Fillon (ministre des Affaires sociales sous Raffarin) porte une réforme des retraites qui aligne le secteur public sur le privé : 40 ans de cotisations pour une retraite à taux plein, contre 37,5 dans le public. Mobilisation massive (13 mai : 1 million dans la rue, fonctionnaires en grève reconductible 3 semaines). La CFDT (François Chérèque) signe le compromis Fillon le 15 mai. La réforme passe le 24 juillet 2003. Pour 20 ans, le souvenir de cette défaite hantera le syndicalisme.",
    setup: {
      reflechi:
        "Tu es secrétaire confédéral pendant la mobilisation. Le mouvement tient depuis 3 semaines mais la grève s'effrite. Trois positions : tenir jusqu'au retrait total (1995-bis), signer le compromis Fillon (CFDT) pour sauver des points, ou pousser une stratégie de division : laisser CFDT signer mais maintenir CGT/FO/FSU contre.",
      compulsif:
        "Salle de réunion intersyndicale, 14 mai 2003 à 23h. Sur la table, le projet d'accord Fillon-Chérèque. Marc Blondel (FO) tape du poing. Bernard Thibault (CGT) reste de marbre. Une délégation CFDT n'est plus là — déjà sortie pour signer."
    },
    actors: ['base', 'etat', 'opinion', 'adversaire'],
    voices: [
      { trait: 'tribun', text: '1995 a fait reculer Juppé. 2003 peut faire reculer Fillon. Tiens.' },
      { trait: 'pragmatique', text: 'Le mouvement s\'effrite. Signer évite la déroute. Calcule.' }
    ],
    quotes: [
      {
        text: 'Sans cette réforme, le système est en faillite en 2010. Avec, il tient jusqu\'en 2020.',
        source: 'François Fillon, ministre des Affaires sociales, mai 2003'
      }
    ],
    choices: [
      {
        id: 'fillon-tenir',
        text: 'Tenir la grève reconductible jusqu\'au retrait.',
        intent: 'Refaire 1995 contre Fillon.',
        theoryHint: "Stratégie d'épuisement : tenir plus longtemps que la majorité parlementaire ne peut tenir politiquement.",
        effects: {
          resources: { rapportDeForce: 6, confiance: 5, legitimite: -3, caisse: -7 },
          actors: { etat: { trust: -5 }, base: { trust: 7 }, opinion: { trust: -4 } }
        },
        consequence: {
          immediate:
            "La grève s'effrite après 28 jours. Les cheminots et enseignants tiennent jusqu'au 13 juin. La réforme passe au Parlement le 24 juillet. Défaite nette.",
          longterm:
            "Cette défaite enseigne au syndicalisme que 1995 était une exception, pas une règle. La doctrine de la grève reconductible nationale s'effrite."
        },
        traitShift: { rupture: 2 },
        flag: 'epuise-mouvement'
      },
      {
        id: 'fillon-signer',
        text: 'Signer le compromis Fillon (ligne CFDT-Chérèque).',
        intent: 'Sauver des points en acceptant le principe.',
        theoryHint: "Stratégie d'institutionnalisation : préserver la place à la table pour les négociations futures.",
        effects: {
          resources: { institution: 4, legitimite: 4, confiance: -8, rapportDeForce: -3 },
          actors: { etat: { trust: 5 }, adversaire: { trust: 4 }, base: { trust: -10 } }
        },
        consequence: {
          immediate:
            "Le compromis Fillon-Chérèque est signé le 15 mai 2003. La CFDT obtient quelques aménagements (carrières longues, pénibilité partielle).",
          longterm:
            "La CFDT perd 100 000 adhérents en 18 mois. Le score CFDT aux élections prud'homales chute. Le souvenir de 2003 pèsera dans toutes les négociations retraite suivantes (2010, 2013, 2023)."
        },
        traitShift: { pragmatique: 2 },
        flag: 'trahit-base'
      },
      {
        id: 'fillon-division',
        text: 'Laisser CFDT signer, maintenir CGT/FO/FSU mobilisées.',
        intent: 'Stratégie de division tactique.',
        theoryHint: 'Stratégie de différenciation : préserver le crédit de la rupture en laissant un autre porter le compromis.',
        effects: {
          resources: { confiance: 4, legitimite: 2, rapportDeForce: 3, institution: -2 },
          actors: { base: { trust: 5 }, adversaire: { trust: 1 } }
        },
        consequence: {
          immediate:
            "La CGT et FO continuent la grève après la signature CFDT. La mobilisation tient encore 2 semaines mais s\'effrite.",
          longterm:
            "Cette ligne préserve le capital militant CGT/FO mais isole durablement la CFDT comme « collaboratrice ». Le paysage syndical se cristallise pour 20 ans."
        },
        traitShift: { batisseur: 1, rupture: 1 }
      }
    ]
  },

  /* ============================================================
     T60 — 2010 — Réforme Woerth (60→62 ans)
     ============================================================ */
  {
    id: 'woerth-retraites-2010',
    turn: 60,
    date: '7 septembre — 9 novembre 2010',
    era: 'sarkozy',
    title: 'Réforme Woerth',
    subtitle: 'L\'âge légal passe de 60 à 62 ans',
    mood: 'tendu',
    premium: true,
    historicalContext:
      "Éric Woerth (ministre du Travail sous Fillon Premier ministre, présidence Sarkozy) porte la réforme qui repousse l'âge légal de départ de 60 à 62 ans. 7 journées de mobilisation interprofessionnelles entre septembre et novembre 2010, dont la plus massive (12 octobre) rassemble 3,5 millions de personnes selon les syndicats. La grève des raffineries (Total, Grandpuits) crée la pénurie d'essence. La loi est promulguée le 9 novembre 2010. Première grande mobilisation interprofessionnelle unitaire depuis 1995, mais réforme qui passe quand même.",
    setup: {
      reflechi:
        "Tu es à la coordination intersyndicale 8 (CGT, CFDT, FO, FSU, Solidaires, UNSA, CFE-CGC, CFTC). 7 journées de grève en 2 mois. Le pic est à 3,5 millions le 12 octobre. La grève des raffineries pourrait basculer le rapport de force. Trois options : tenir la grève reconductible (radicalisation Solidaires/CGT), accepter la « pause » (négocier des aménagements branche par branche), ou pivoter vers une bataille électorale (préparer 2012).",
      compulsif:
        "Coordination intersyndicale, 23 octobre 2010. Sur la table, les chiffres : 3,5 millions le 12 octobre, 2 millions aujourd'hui. Bernadette Groison (FSU) propose la reconduction. Bernard Thibault (CGT) lit ses notes. Chérèque (CFDT) regarde sa montre."
    },
    actors: ['base', 'etat', 'opinion', 'adversaire'],
    voices: [
      { trait: 'tribun', text: 'Avec les raffineries paralysées, on a une chance. Tiens.' },
      { trait: 'pragmatique', text: '7 journées de grève, c\'est déjà historique. Accepte la pause, prépare 2012.' }
    ],
    quotes: [
      {
        text: 'La rue gagne souvent. Cette fois, elle a perdu de peu.',
        source: 'Mediapart, novembre 2010'
      }
    ],
    choices: [
      {
        id: 'woerth-grève-reconductible',
        text: 'Tenir la grève reconductible des raffineries.',
        intent: 'Faire céder le gouvernement par la pénurie.',
        theoryHint: 'Stratégie d\'épuisement énergétique : un pays sans essence cède plus vite qu\'un pays sans rail.',
        effects: {
          resources: { rapportDeForce: 7, confiance: 6, legitimite: -3, caisse: -5 },
          actors: { etat: { trust: -6, pressure: 6 }, base: { trust: 7 }, opinion: { trust: -5 } }
        },
        consequence: {
          immediate:
            "Les raffineries tiennent 17 jours. Le gouvernement réquisitionne. La pénurie touche 30% des stations-service. La loi passe le 9 novembre.",
          longterm:
            'Échec partiel : la réforme passe. Mais l\'impopularité de Sarkozy s\'enracine, ce qui contribuera à sa défaite en 2012.'
        },
        traitShift: { rupture: 2, tribun: 1 },
        flag: 'epuise-mouvement'
      },
      {
        id: 'woerth-pause',
        text: 'Accepter la pause, négocier aménagements branche.',
        intent: 'Sauver des points dans les conventions collectives.',
        theoryHint: 'Stratégie d\'institutionnalisation : si la loi nationale passe, les branches restent négociables.',
        effects: {
          resources: { institution: 5, legitimite: 3, confiance: -4, rapportDeForce: -3 },
          actors: { adversaire: { trust: 4 }, etat: { trust: 4 }, base: { trust: -4 } }
        },
        consequence: {
          immediate:
            "L\'intersyndicale appelle à la « vigilance ». Quelques branches (chimie, métallurgie) obtiennent des aménagements pénibilité.",
          longterm:
            "La défaite frontale est évitée mais l\'image d\'un syndicalisme « qui se rend » s'installe. Préparation faible pour 2013 ANI et 2023 retraites."
        },
        traitShift: { pragmatique: 2 },
        flag: 'trahit-base'
      },
      {
        id: 'woerth-electorale',
        text: 'Pivoter vers la bataille électorale 2012.',
        intent: 'Faire payer Sarkozy aux urnes plutôt que dans la rue.',
        theoryHint: "Stratégie de cadrage politique : transformer une défaite syndicale en levier électoral.",
        effects: {
          resources: { legitimite: 5, rapportDeForce: 1, confiance: 2, institution: 3 },
          actors: { opinion: { trust: 5 }, etat: { trust: -3 } }
        },
        consequence: {
          immediate:
            "L\'intersyndicale publie un livre blanc « Pour une autre réforme » en mai 2011. Audition des candidats à l\'Élysée 2012.",
          longterm:
            "François Hollande s'engage à abroger l\'âge à 62 ans (engagement n°18). Une fois élu, il l\'abrogera partiellement (carrières longues 2012, mais 62 ans tient)."
        },
        traitShift: { technocrate: 2, batisseur: 1 }
      }
    ]
  }
];
