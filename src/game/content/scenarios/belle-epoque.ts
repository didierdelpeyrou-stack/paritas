import type { Scenario } from '../../types';

/**
 * Période 1906-1948 — comble les manques signalés par les
 * syndicalistes 2026 :
 *  - Charte d'Amiens 1906 (T15) : indépendance vis-à-vis des partis
 *  - Grève des cheminots 1910 (T16) : grève générale écrasée par
 *    Briand, premier traumatisme du syndicalisme moderne
 *  - Scission CGT/FO 1947 (T24) : naissance de l'indépendance
 *    syndicale revendiquée
 *  - Matignon-bis 1948 (T25) : conventions collectives reprises
 */

export const BELLE_EPOQUE_SCENARIOS: Scenario[] = [
  {
    id: 'charte-amiens-1906',
    turn: 14,
    date: '13 octobre 1906',
    era: 'belle_epoque',
    title: "Charte d'Amiens",
    subtitle: "L'indépendance syndicale en quatre paragraphes",
    mood: 'tendu',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Au IXe Congrès confédéral d'Amiens, la CGT (fondée à Limoges en 1895) débat de son rapport au Parti socialiste unifié, créé deux ans plus tôt. Le rapporteur Victor Griffuelhes défend une motion qui sera adoptée par 830 voix contre 8 : le syndicat doit poursuivre une « double besogne » — revendication quotidienne et préparation de l'émancipation — sans se subordonner à aucun parti. Cette charte structurera l'identité syndicale française pour un siècle.",
    setup: {
      reflechi:
        "La question d'Amiens n'est pas l'union avec les socialistes — elle est l'autonomie. Le syndicat se dote ici de son premier acte doctrinal, et choisit délibérément de ne pas être un démembrement du parti. Pour le délégué que tu es, le vote pèse lourd : il fixe le cadre dans lequel tu pourras agir pour les vingt prochaines années.",
      compulsif:
        "La salle de la Bourse du travail d'Amiens sent le tabac et la sueur. Griffuelhes lit son texte d'une voix sans grandiloquence. Au fond, des délégués socialistes attendent leur tour. Quelqu'un dit : « la classe contre l'État, et pas un parti contre un autre »."
    },
    actors: ['base', 'opinion', 'etat'],
    voices: [
      { trait: 'tribun', text: 'Un syndicat qui n\'est plus que la voix d\'un parti n\'est plus un syndicat.' },
      { trait: 'pragmatique', text: 'Sans appui politique, on perd les votes au Parlement. Calcule ce que ça coûte.' },
      { trait: 'rupture', text: 'L\'indépendance, ce n\'est pas la neutralité. C\'est la primauté de la classe.' }
    ],
    quotes: [
      {
        text: "Le syndicalisme se suffit à lui-même. Cette déclaration est, à nos yeux, la reconnaissance de la lutte de classe.",
        source: "Charte d'Amiens, motion Griffuelhes, 13 octobre 1906"
      }
    ],
    choices: [
      {
        id: 'amiens-vote-charte',
        text: "Voter la charte : indépendance totale vis-à-vis des partis.",
        intent: 'Doctrine fondatrice.',
        theoryHint: "Stratégie d'autonomie : le syndicat se pose comme acteur politique propre, pas comme relais.",
        effects: {
          resources: { institution: 7, legitimite: 5, confiance: 6, rapportDeForce: 2 },
          actors: { base: { trust: 7 }, etat: { trust: -2 }, opinion: { trust: 3 } }
        },
        consequence: {
          immediate:
            "830 voix pour, 8 contre. Le texte est adopté. Les délégués partis politiques quittent la salle en silence.",
          longterm:
            "La charte structurera l'identité syndicale française pour un siècle. La FO de 1947 et la CFDT de 1964 s'en réclameront."
        },
        traitShift: { batisseur: 2, tribun: 1 },
        flag: 'pose-charte-independance'
      },
      {
        id: 'amiens-amender-pacte',
        text: "Amender la charte pour réserver des canaux de coopération avec les partis.",
        intent: 'Pragmatisme institutionnel.',
        theoryHint: "Stratégie d'alliance souple : préserver la coopération sans subordination.",
        effects: {
          resources: { institution: 4, legitimite: 4, rapportDeForce: -1 },
          actors: { etat: { trust: 3 }, opinion: { trust: 4 }, base: { trust: -2 } }
        },
        consequence: {
          immediate:
            "L'amendement passe de justesse. Le texte final autorise des « concertations utiles » avec les groupes parlementaires.",
          longterm:
            "Cette nuance permettra des accords ponctuels mais n'effacera pas la doctrine d'autonomie. Le congrès de 1908 reviendra sur la version pure."
        },
        traitShift: { pragmatique: 2, technocrate: 1 }
      },
      {
        id: 'amiens-rejet-charte',
        text: "Rejeter la charte : militer pour une articulation organique avec le PS unifié.",
        intent: "Stratégie d'unité ouvrière intégrée.",
        theoryHint: "Stratégie de fusion : confondre l'instrument syndical et l'instrument politique pour démultiplier la force.",
        effects: {
          resources: { rapportDeForce: 6, confiance: -4, legitimite: -5 },
          actors: { base: { trust: -5 }, etat: { trust: -4 }, opinion: { trust: -3 } }
        },
        consequence: {
          immediate:
            "La motion alternative recueille 8 voix. Tu es porteur d'une position minoritaire qui te marquera longtemps.",
          longterm:
            "Cette ligne sera défendue par les communistes après 1920. Elle structurera la CGTU puis la CGT post-fusion 1936 — au prix de l'éclatement du paysage syndical."
        },
        traitShift: { rupture: 3 },
        flag: 'refuse-compromis'
      }
    ]
  },
  {
    id: 'cheminots-1910',
    turn: 15,
    date: '10 octobre 1910',
    era: 'belle_epoque',
    title: 'Grève des cheminots',
    subtitle: 'Briand mobilise l\'armée',
    mood: 'grave',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Le 10 octobre 1910, les cheminots du Nord et de l'Ouest entament une grève générale pour les salaires et la retraite à 50 ans. Aristide Briand, président du Conseil et ancien socialiste qui avait théorisé la grève générale en 1899, mobilise les réservistes : les grévistes sont incorporés dans l'armée et placés sous régime militaire. La grève s'effondre en huit jours. Six cents cheminots sont révoqués. C'est le premier grand traumatisme du syndicalisme français au XXe siècle.",
    setup: {
      reflechi:
        "Tu es secrétaire de la Fédération nationale des travailleurs des chemins de fer. La grève est lancée, la mobilisation militaire annoncée. La question est triple : tenir au prix de la répression, suspendre pour préserver l'organisation, ou retourner la mobilisation contre Briand sur le terrain politique.",
      compulsif:
        "À la Bourse du travail de Lille, un télégraphe crépite sans arrêt. Les noms des révoqués s'affichent en colonnes. Une déléguée de Tourcoing propose de bloquer les triages. Une autre dit qu'il faut sauver les cartes des camarades avant qu'on les arrête."
    },
    actors: ['base', 'etat', 'adversaire', 'opinion'],
    voices: [
      { trait: 'tribun', text: 'Briand a trahi : il faut le hurler partout, pas se rendre dans le silence.' },
      { trait: 'pragmatique', text: 'Six cents révoqués c\'est six cents foyers brisés. Tiens compte des familles avant l\'honneur.' }
    ],
    quotes: [
      {
        text: "Si la patrie était en danger, on appellerait les réservistes. Eh bien, elle l'est : nous appelons les réservistes.",
        source: 'Aristide Briand, président du Conseil, 11 octobre 1910'
      }
    ],
    choices: [
      {
        id: 'cheminots-tenir',
        text: "Tenir la grève malgré la mobilisation, organiser la solidarité financière.",
        intent: 'Refuser la défaite par capitulation.',
        theoryHint: "Stratégie d'épuisement réciproque : tenir plus longtemps que la mobilisation politique de Briand.",
        effects: {
          resources: { rapportDeForce: 5, confiance: 4, legitimite: -2, caisse: -5 },
          actors: { etat: { trust: -8, pressure: 8 }, base: { trust: 6 }, opinion: { trust: -2 } }
        },
        consequence: {
          immediate:
            "La grève tient encore quatre jours. 600 cheminots sont révoqués, 200 emprisonnés. La défaite est nette.",
          longterm:
            "Cette défaite structurera la méfiance ouvrière vis-à-vis du Parti socialiste — Briand venait de la SFIO. La rupture entre syndicalisme révolutionnaire et politique parlementaire sera durable."
        },
        traitShift: { rupture: 3 },
        flag: 'epuise-mouvement'
      },
      {
        id: 'cheminots-suspendre',
        text: "Suspendre la grève, sauver l'organisation, négocier la réintégration.",
        intent: 'Tactique de retraite organisée.',
        theoryHint: "Stratégie de préservation : retirer les forces sans les disperser, pour pouvoir reconstruire.",
        effects: {
          resources: { institution: 4, legitimite: 3, rapportDeForce: -3, confiance: -3 },
          actors: { etat: { trust: 2 }, base: { trust: -4 } }
        },
        consequence: {
          immediate:
            "La reprise est ordonnée le 18 octobre. 350 cheminots seront réintégrés en six mois. La fédération survit.",
          longterm:
            "L'organisation reste debout pour préparer 1936. Mais la base te reproche pour vingt ans d'avoir « plié sous la peur »."
        },
        traitShift: { pragmatique: 2, batisseur: 1 }
      },
      {
        id: 'cheminots-tribune-politique',
        text: "Transformer la grève en campagne politique nationale contre Briand.",
        intent: 'Faire payer politiquement le ministre.',
        theoryHint: "Stratégie de cadrage : déplacer la défaite syndicale en victoire d'opinion contre l'homme.",
        effects: {
          resources: { legitimite: 6, rapportDeForce: 2, caisse: -3 },
          actors: { opinion: { trust: 6 }, etat: { trust: -5 } }
        },
        consequence: {
          immediate:
            "Une campagne de presse massive isole Briand. Le 26 février 1911, il démissionne — affaibli par cette séquence et la grève des chiffonniers de Paris qui suit.",
          longterm:
            "Le syndicalisme apprend ici la puissance du cadrage médiatique. La presse ouvrière (la Bataille syndicaliste, la Voix du peuple) y gagne en influence."
        },
        traitShift: { tribun: 3 }
      }
    ]
  },
  {
    id: 'scission-fo-1947',
    turn: 25,
    date: '19 décembre 1947',
    era: 'guerre_froide',
    title: 'Scission Force Ouvrière',
    subtitle: "L'indépendance syndicale, vingt ans après Amiens",
    mood: 'grave',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Après les grèves insurrectionnelles de novembre 1947 et les soupçons de manipulation par le PCF (qui a quitté le gouvernement Ramadier en mai), une fraction réformiste de la CGT — animée par Léon Jouhaux, vétéran de 1914 et père de l'OIT — quitte la confédération. Le 19 décembre 1947, ils publient un communiqué de rupture ; le 12 avril 1948, ils fondent la CGT-Force Ouvrière. La scission marque pour 80 ans le paysage syndical français : indépendance vis-à-vis des partis, attachement viscéral au paritarisme et à la Sécu paritaire de 1945.",
    setup: {
      reflechi:
        "Tu es membre du bureau confédéral CGT. Les grèves de novembre ont été perdues, l'opinion publique s'est retournée, le ministère de l'Intérieur (Jules Moch, SFIO) a déployé les CRS. À l'intérieur de la CGT, la majorité communiste exige la radicalisation. La minorité Jouhaux propose la rupture. Toi, tu choisis ton camp pour les quarante ans qui viennent.",
      compulsif:
        "Au siège de la CGT, rue Lafayette, deux groupes ne se parlent plus depuis trois jours. Jouhaux fume sans arrêt. Frachon répond aux questions par bloc. Un permanent déchire sa carte sur la table : « pas dans une CGT qui obéit à Thorez »."
    },
    actors: ['base', 'etat', 'adversaire', 'opinion'],
    voices: [
      { trait: 'pragmatique', text: 'Sans indépendance, le syndicat n\'est qu\'une courroie. Jouhaux a raison.' },
      { trait: 'rupture', text: 'Quitter la CGT, c\'est diviser la classe pour servir les Américains.' },
      { trait: 'batisseur', text: 'Les caisses paritaires de 45 sont notre bien commun. Qui les défendra ?' }
    ],
    quotes: [
      {
        text: "Notre mot d'ordre est et restera l'indépendance syndicale. Nous refusons d'être les supplétifs d'un parti, quel qu'il soit.",
        source: 'Léon Jouhaux, communiqué de rupture, 19 décembre 1947'
      }
    ],
    choices: [
      {
        id: 'fo-rejoindre-jouhaux',
        text: "Rejoindre la scission Jouhaux, fonder Force Ouvrière.",
        intent: "Acter l'indépendance syndicale comme doctrine.",
        theoryHint: "Stratégie de rupture instituée : créer un nouvel acteur plutôt que se battre dans l'ancien.",
        effects: {
          resources: { institution: 6, legitimite: 5, confiance: 3, rapportDeForce: -2 },
          actors: { etat: { trust: 4 }, base: { trust: -2 }, adversaire: { trust: 3 } }
        },
        consequence: {
          immediate:
            "Le 12 avril 1948, la CGT-FO est fondée. 400 000 cartes la première année — à comparer aux 5 millions CGT de 1946. Mais les positions paritaires Sécu, Unédic (à venir) sont solides.",
          longterm:
            "FO sera le pilier du paritarisme français : Sécu, Unédic 1958, Agirc 1947, Arrco 1961. La doctrine Jouhaux structurera 80 ans de gestion paritaire."
        },
        traitShift: { batisseur: 2, pragmatique: 2 },
        flag: 'fonde-fo'
      },
      {
        id: 'fo-rester-cgt-reformer',
        text: "Rester à la CGT et y défendre une ligne minoritaire pour la réformer.",
        intent: 'Réformisme interne.',
        theoryHint: "Stratégie d'entrisme : changer l'organisation par l'intérieur plutôt que la quitter.",
        effects: {
          resources: { institution: 3, confiance: 4, legitimite: -3 },
          actors: { base: { trust: 4 }, adversaire: { trust: -2 }, etat: { trust: -2 } }
        },
        consequence: {
          immediate:
            "Tu restes membre, voté minoritaire à 92% des congrès jusqu'en 1968. Tu es marginalisé mais pas exclu.",
          longterm:
            "Cette posture a peu d'effet à court terme. Mais elle prépare des ralliements ultérieurs : ta fraction sera courtisée par la CFDT post-1964."
        },
        traitShift: { batisseur: 1, technocrate: 1 }
      },
      {
        id: 'fo-radicaliser-cgt',
        text: "Radicaliser la CGT autour de la ligne Frachon (PCF).",
        intent: "Aligner le syndicat sur la ligne révolutionnaire.",
        theoryHint: "Stratégie de fusion : confondre instrument syndical et instrument politique pour la prise du pouvoir ouvrier.",
        effects: {
          resources: { rapportDeForce: 7, confiance: 5, legitimite: -7, institution: -3 },
          actors: { base: { trust: 5 }, etat: { trust: -8, stance: 'dur' }, opinion: { trust: -6 } }
        },
        consequence: {
          immediate:
            "La CGT s'aligne sur le PCF. La scission Jouhaux est rendue inévitable. La CGT perd 1,5 million de cartes en trois ans.",
          longterm:
            "La ligne tiendra jusqu'à la déstalinisation des années 1960. Elle pèsera sur la position de la CGT dans les organes paritaires : refus initial de l'Unédic en 1958, ralliement tardif."
        },
        traitShift: { rupture: 3 },
        flag: 'refuse-compromis'
      }
    ]
  }
];
