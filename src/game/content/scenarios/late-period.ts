import type { Scenario } from '../../types';

/**
 * Période 1995-2023 — comble le désert T48-T100 du jeu de base. Trois
 * moments charnières du paritarisme français contemporain :
 *  - 1995 Plan Juppé (T48) : la dernière grève reconductible, la « gauche
 *    de la gauche » contre la réforme Sécu/retraites
 *  - 2016 Loi El Khomri (T68) : inversion de la hiérarchie des normes,
 *    accord d'entreprise > convention collective
 *  - 2017 Ordonnances Macron (T72) : CSE, fusion CE/DP/CHSCT, plafonnement
 *    des indemnités prud'homales
 */

export const LATE_PERIOD_SCENARIOS: Scenario[] = [
  {
    id: 'plan-juppe-1995',
    turn: 45,
    date: '15 novembre — 15 décembre 1995',
    era: 'cohabitations',
    title: 'Plan Juppé',
    subtitle: 'La grève qui a fait reculer un Premier ministre',
    mood: 'tendu',
    premium: true,
    historicalContext:
      "Le 15 novembre 1995, Alain Juppé annonce devant l'Assemblée son plan de réforme de la Sécurité sociale et des régimes spéciaux de retraite. La SNCF et la RATP s'arrêtent. La grève dure trois semaines, paralyse le pays, est largement soutenue par l'opinion (60-70 % selon les sondages). Le 15 décembre, Juppé retire le volet retraites. Le « plan Juppé » devient le grand récit de la résistance syndicale moderne — et la dernière fois où le paritarisme triomphe par la rue.",
    setup: {
      reflechi:
        "Le plan touche trois choses à la fois : la maîtrise étatique des comptes de la Sécu (reprise sur le paritarisme), l'alignement des régimes spéciaux sur le régime général, et la création de la CSG comme impôt social. Pour le syndicalisme, la question est de savoir s'il défend une corporation (les régimes spéciaux), une institution (la Sécu paritaire) ou une vision (le salaire socialisé).",
      compulsif:
        "Sur le quai vide de la gare de Lyon, des étudiants venus en renfort partagent les sandwichs avec les cheminots. À la radio, Juppé répète qu'il « ne cédera pas ». À l'Élysée, Chirac écoute les notes de l'IFOP."
    },
    actors: ['base', 'etat', 'opinion'],
    voices: [
      { trait: 'tribun', text: 'Trois semaines de pluie et de soutien populaire — c\'est rare, prends-en la mesure.' },
      { trait: 'pragmatique', text: 'On peut gagner sur les retraites en cédant sur la CSG. Sépare les batailles.' },
      { trait: 'rupture', text: 'Tout céder maintenant ou tout conserver — l\'entre-deux ferait perdre les deux.' }
    ],
    quotes: [
      {
        text: 'Le mouvement social a gagné, mais ce qu\'il a gagné, c\'est de freiner. Pas d\'inverser.',
        source: 'Marc Blondel, FO, décembre 1995'
      },
      {
        text: "Je sais bien que c'est un projet difficile, qu'il y a des oppositions. Mais je ne céderai pas sur l'essentiel.",
        source: "Alain Juppé, Premier ministre, allocution télévisée, 12 décembre 1995"
      }
    ],
    choices: [
      {
        id: 'juppe-greve-reconductible',
        text: 'Pousser la grève reconductible jusqu\'au retrait total du plan.',
        intent: 'Maximaliser le rapport de force.',
        theoryHint: "Stratégie d'épuisement : tenir plus longtemps que le gouvernement ne peut tenir politiquement.",
        effects: {
          resources: { rapportDeForce: 9, confiance: 7, legitimite: 5, caisse: -8 },
          actors: { etat: { trust: -6, pressure: 8 }, base: { trust: 8 }, opinion: { trust: 4 } }
        },
        consequence: {
          immediate:
            'La grève tient trois semaines. Les TGV redémarrent le 15 décembre quand Juppé annonce le retrait du volet retraites. Le plan Sécu, lui, passe.',
          longterm:
            "1995 reste le grand récit de la victoire syndicale. Mais l'État apprendra : plus jamais une réforme retraite ne sera annoncée sans concertation préalable et sans 49.3 prêt."
        },
        traitShift: { tribun: 2, rupture: 2 },
        flag: 'fait-victoire-historique',
        ability: 'manifestation'
      },
      {
        id: 'juppe-ouvrir-negociation',
        text: "Accepter l'ouverture d'une concertation cadrée et lever la grève par étapes.",
        intent: 'Sortir par le haut, garder la main institutionnelle.',
        theoryHint: 'Stratégie de désescalade pilotée : transformer le rapport de force en gain négocié.',
        effects: {
          resources: { institution: 6, legitimite: 5, rapportDeForce: -2 },
          actors: { etat: { trust: 4 }, adversaire: { trust: 3, patience: 4 }, base: { trust: -3 } }
        },
        consequence: {
          immediate:
            'Le retrait des régimes spéciaux est obtenu. La CSG passe. Une table de concertation s\'ouvre sur la gouvernance des caisses.',
          longterm:
            "Le paritarisme retrouve un peu de souffle dans les caisses, mais la base te reprochera longtemps d'avoir « lâché les cheminots »."
        },
        traitShift: { pragmatique: 2, batisseur: 1 },
        ability: 'table'
      },
      {
        id: 'juppe-defendre-secu',
        text: "Concentrer le combat sur la défense paritaire de la Sécurité sociale.",
        intent: 'Choisir la bataille institutionnelle plutôt que corporative.',
        theoryHint: "Stratégie d'institutionnalisation : protéger ce qui dure (la Sécu paritaire) plutôt que ce qui galvanise (les régimes spéciaux).",
        effects: {
          resources: { institution: 8, legitimite: 4, rapportDeForce: -1, confiance: -2 },
          actors: { etat: { trust: -2 }, opinion: { trust: 5 }, base: { trust: -2 } }
        },
        consequence: {
          immediate:
            'La CSG est encadrée par une « cotisation affectée » paritaire. Les régimes spéciaux passent. La presse syndicale parle de « victoire de classe pour le siècle ».',
          longterm:
            'La Sécu garde sa gouvernance paritaire pour quinze ans encore. Mais la base cheminote et électricienne ne te le pardonne pas avant longtemps.'
        },
        traitShift: { batisseur: 2, technocrate: 1 },
        ability: 'congres'
      }
    ]
  },
  {
    id: 'el-khomri-2016',
    turn: 67,
    date: '8 août 2016',
    era: 'hollande',
    title: 'Loi El Khomri',
    subtitle: "L'inversion de la hiérarchie des normes",
    mood: 'grave',
    premium: true,
    historicalContext:
      "La loi Travail du 8 août 2016 (Myriam El Khomri, ministre du Travail) inverse pour la première fois la hiérarchie des normes en matière de durée du travail : l'accord d'entreprise peut désormais déroger à la convention collective de branche, y compris dans un sens moins favorable au salarié. Adoptée trois fois par 49.3, elle est combattue par CGT, FO, FSU, Solidaires et l'aile gauche du PS. L'extension du référendum d'entreprise et la nouvelle architecture du licenciement économique ouvrent la voie à une décennie de réformes du même type.",
    setup: {
      reflechi:
        "Le principe de faveur (l'accord plus protecteur l'emporte) était la pierre angulaire du droit social français depuis 1936. La loi le retourne : c'est désormais l'accord le plus proche du terrain qui peut emporter, même s'il dégrade. Pour le syndicalisme, c'est un choix existentiel : combattre à mort la primauté de la branche, accepter la décentralisation et investir l'entreprise, ou tenter de redéfinir la branche elle-même.",
      compulsif:
        "Place de la République, les jeunes et les salariés se mélangent. Nuit Debout improvise des AG à minuit. Au ministère, on recompte les amendements. Sur les pancartes : « La loi du marché, c'est pas la loi »."
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'tribun', text: 'L\'inversion des normes, c\'est la fin de quatre-vingts ans de droit du travail. Dis-le clairement.' },
      { trait: 'technocrate', text: 'Une branche qui meurt, ce sont mille négociations à recréer entreprise par entreprise. Calcule.' }
    ],
    quotes: [
      {
        text: "Avec cette loi, la République recule de l'entreprise vers le marché.",
        source: "Philippe Martinez, secrétaire général CGT, mars 2016"
      },
      {
        text: "Le contrat de travail est devenu trop rigide. Cette loi rend la France compétitive et donne plus de pouvoir aux salariés sur leur quotidien.",
        source: "Myriam El Khomri, ministre du Travail, présentation du projet de loi, février 2016"
      }
    ],
    choices: [
      {
        id: 'elkhomri-blocage',
        text: 'Engager une bataille frontale : blocages, raffineries, journées d\'action massives.',
        intent: 'Faire reculer le gouvernement par la rue.',
        theoryHint: "Stratégie d'épuisement frontal — la même qu'en 1995, dans un pays qui n'est plus celui de 1995.",
        effects: {
          resources: { rapportDeForce: 7, confiance: 5, legitimite: -3, caisse: -6 },
          actors: { etat: { trust: -7, pressure: 7 }, base: { trust: 6 }, opinion: { trust: -4 } }
        },
        consequence: {
          immediate:
            'Les raffineries sont bloquées dix jours. Le 49.3 passe trois fois. La loi est promulguée. La rue retient son souffle.',
          longterm:
            "1995 ne se rejoue pas. La majorité de l'opinion finit par se lasser. La défaite politique laisse une trace : la légitimité du syndicalisme à bloquer le pays s'effrite."
        },
        traitShift: { rupture: 2, tribun: 1 },
        flag: 'epuise-mouvement',
        ability: 'manifestation'
      },
      {
        id: 'elkhomri-amendements',
        text: "Négocier des amendements limitatifs (référendum, branche dérogeable).",
        intent: 'Adoucir le texte, préserver les conventions de branche.',
        theoryHint: "Stratégie d'institutionnalisation : sauver ce qu'on peut sauver dans le cadre légistique.",
        effects: {
          resources: { institution: 5, legitimite: 4, confiance: -3, rapportDeForce: -2 },
          actors: { etat: { trust: 4 }, adversaire: { trust: 3 }, base: { trust: -4 } }
        },
        consequence: {
          immediate:
            "Trois amendements protègent les branches dans le bâtiment, le transport et le commerce. La loi passe quand même, allégée. La CFDT signe.",
          longterm:
            'Les branches protégées tiendront mieux dans les années qui suivent. Mais les confédérations qui ont signé portent l\'étiquette « collabo de la loi Travail » pour une décennie.'
        },
        traitShift: { pragmatique: 2, technocrate: 1 },
        ability: 'table'
      },
      {
        id: 'elkhomri-investir-entreprise',
        text: "Accepter le terrain de l'entreprise et y déployer une stratégie d'implantation massive.",
        intent: 'Prendre acte du nouveau cadre, gagner sur le nouveau terrain.',
        theoryHint: "Stratégie de relocalisation : si la négociation descend à l'entreprise, le syndicat doit y être plus fort que jamais.",
        effects: {
          resources: { confiance: 6, institution: 4, rapportDeForce: 3, caisse: -3 },
          actors: { adversaire: { trust: -2, patience: -3 }, base: { trust: 5 } }
        },
        consequence: {
          immediate:
            "Une campagne d'implantation lance 200 nouveaux délégués syndicaux dans les PME. Le réseau de juristes d'entreprise double en un an.",
          longterm:
            'Les négociations d\'entreprise produisent des accords mixtes — quelques bons, beaucoup de médiocres. Le syndicalisme apprend un nouveau métier en marche forcée.'
        },
        traitShift: { batisseur: 2, pragmatique: 1 },
        flag: 'refondation-paritaire',
        ability: 'talents'
      }
    ]
  },
  {
    id: 'ordonnances-macron-2017',
    turn: 70,
    date: '22 septembre 2017',
    era: 'macron_i',
    title: 'Ordonnances Macron',
    subtitle: "Le CSE, le barème et la fin du dialogue à l'ancienne",
    mood: 'tendu',
    premium: true,
    historicalContext:
      "Cinq ordonnances signées le 22 septembre 2017 transforment le droit du travail : fusion CE/DP/CHSCT en un Comité social et économique unique (CSE), plafonnement des indemnités prud'homales (« barème Macron »), élargissement du référendum d'entreprise sur initiative de l'employeur, primauté quasi totale de l'accord d'entreprise. La concertation a été expresse — six semaines — et symboliquement brutale : Édouard Philippe rappelle que « la concertation a duré le temps qu'elle a duré ». Pour les confédérations, c'est le moment de tester ce qu'on peut encore négocier dans un quinquennat qui n'écoute pas.",
    setup: {
      reflechi:
        "Le CSE supprime des élus, fusionne des compétences, simplifie pour les patrons et complique pour les salariés. Le barème enferme les juges du travail dans des fourchettes d'indemnisation prévisibles. La question stratégique est claire : combat frontal, négociation ciblée sur le CSE, ou prise d'acte et reconstruction du modèle de représentation ?",
      compulsif:
        "Salle de réunion à Bercy, 11h du matin. Le DRH-en-chef du gouvernement explique avec un PowerPoint sobre que « les entreprises souhaitent simplifier ». Sur la table, des cafés tièdes et trois feuilles de notes."
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'pragmatique', text: 'Le CSE est passé. La question est maintenant : qu\'est-ce qu\'on en fait ?' },
      { trait: 'rupture', text: 'Une concertation de six semaines, c\'est une insulte. Réponds-y comme une insulte.' }
    ],
    quotes: [
      {
        text: "Nous avons consulté, écouté, parfois infléchi. La concertation a duré le temps qu'elle a duré.",
        source: 'Édouard Philippe, Premier ministre, septembre 2017'
      }
    ],
    choices: [
      {
        id: 'ordonnances-mobilisation',
        text: 'Appeler à des journées d\'action interprofessionnelles successives.',
        intent: 'Marquer le coup et tester la mobilisation.',
        theoryHint: 'Stratégie de signal : protester sans illusion sur l\'issue, mais préserver la légitimité à mobiliser ensuite.',
        effects: {
          resources: { rapportDeForce: 5, confiance: 4, legitimite: -2 },
          actors: { etat: { trust: -4, pressure: 4 }, base: { trust: 4 }, opinion: { trust: -2 } }
        },
        consequence: {
          immediate:
            "Les journées rassemblent 200 000, 150 000, 100 000 personnes. Les ordonnances passent. Mais la base sait que la confédération ne s'est pas couchée.",
          longterm:
            'Le coût en militants est limité, le bénéfice en cohérence interne est réel. La séquence prépare 2019.'
        },
        traitShift: { tribun: 2, batisseur: 1 },
        ability: 'manifestation'
      },
      {
        id: 'ordonnances-cse',
        text: 'Investir massivement la formation des nouveaux élus CSE.',
        intent: 'Transformer la défaite en chantier d\'apprentissage.',
        theoryHint: "Stratégie d'adaptation : la formation comme arme syndicale principale dans le nouveau cadre.",
        effects: {
          resources: { institution: 6, legitimite: 4, confiance: 2, caisse: -4 },
          actors: { adversaire: { trust: -1 }, base: { trust: 4, patience: 5 } }
        },
        consequence: {
          immediate:
            "Trois mille élus CSE passent par les modules de formation confédérale en six mois. Les premiers accords d'entreprise nouvelle génération sortent en 2018.",
          longterm:
            'La maîtrise technique du CSE devient un avantage compétitif dans les négociations d\'entreprise. Quelques victoires locales nourrissent la confédération en récits.'
        },
        traitShift: { technocrate: 2, batisseur: 1 },
        flag: 'refondation-paritaire',
        ability: 'talents'
      },
      {
        id: 'ordonnances-bareme-prudhommes',
        text: 'Lancer une bataille juridique contre le barème prud\'homal.',
        intent: "Casser le barème par la jurisprudence.",
        theoryHint: 'Stratégie contentieuse : utiliser le droit international (OIT, charte sociale européenne) contre la loi nationale.',
        effects: {
          resources: { legitimite: 5, institution: 5, caisse: -3 },
          actors: { etat: { trust: -3 }, opinion: { trust: 4 } }
        },
        consequence: {
          immediate:
            'Plusieurs conseils de prud\'hommes écartent le barème en 2018-2019 en s\'appuyant sur la convention OIT 158. La Cour de cassation tranchera le 11 mai 2022 — en faveur du barème, mais en laissant une marge.',
          longterm:
            'La bataille juridique a renforcé l\'image d\'un syndicalisme expert, sérieux. Quelques jurisprudences servent dans les négociations futures.'
        },
        traitShift: { technocrate: 2, tribun: 1 },
        ability: 'delegation'
      }
    ]
  }
];
