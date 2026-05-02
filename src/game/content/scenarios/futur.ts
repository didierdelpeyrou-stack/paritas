import type { Scenario } from '../../types';

/**
 * Période 2026-2030 — répond à la demande la plus citée par les 100
 * syndicalistes 2026 : « et après 2023 ? ». Trois moments
 * projectifs ancrés sur du réel observable :
 *  - T76 — Algorithmisation du management (Amazon, plateformes,
 *    RH algorithmique)
 *  - T82 — Statut des travailleurs des plateformes (directive
 *    européenne 2024 transposée en France)
 *  - T88 — Transition GPEC verte (reconversions industrielles
 *    automobile, énergie, bâtiment)
 *
 * Tous trois posent la même question méta : le paritarisme
 * historique survit-il à des sujets qu'il n'a pas été conçu pour
 * traiter ?
 */

export const FUTUR_SCENARIOS: Scenario[] = [
  {
    id: 'algorithmisation-2026',
    turn: 93,
    date: '2026',
    era: 'present',
    title: "L'algorithme qui licencie",
    subtitle: 'Première négociation paritaire sur l\'IA managériale',
    mood: 'tendu',
    premium: true,
    historicalContext:
      "Depuis 2023-2024, les grandes entreprises (Amazon, Carrefour, Veolia, BNP, Air France) ont déployé des outils d'IA pour évaluer la performance, prédire le turn-over, recommander des sanctions disciplinaires, voire pré-rédiger les motifs de licenciement. La Commission européenne a publié le 13 mars 2024 le règlement IA (AI Act) qui classe ces usages en « risque élevé ». La France n'a pas encore de cadre paritaire spécifique. Une grande négociation interprofessionnelle s'ouvre en 2026 sur la transparence des algorithmes managériaux.",
    setup: {
      reflechi:
        "Tu sièges à la table de l'ANI Algorithmes managériaux. Les positions : MEDEF veut un cadre léger (transparence sur demande, secret commercial protégé), CGT veut une obligation de codécision sur tout déploiement algorithmique, CFDT propose un droit d'évaluation paritaire annuel. Le règlement européen impose un plancher minimum mais laisse le détail aux négociations nationales.",
      compulsif:
        "Salle de négociation, ministère du Travail, 18h. Sur l'écran, un consultant Bain montre comment l'algorithme « Mosaic » de Carrefour évalue 70 000 caissiers en temps réel. À la table, six confédérations, trois organisations patronales, un commissaire européen en visioconférence. La négociation dure depuis quatre mois."
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'rupture', text: 'Si on accepte la transparence sans codécision, on ne fait que documenter le licenciement automatique.' },
      { trait: 'technocrate', text: 'Un audit paritaire annuel avec sanctions, c\'est un point de levier réel. Ne renonce pas à l\'opérationnel.' },
      { trait: 'pragmatique', text: 'Tout obtenir, c\'est tout perdre. Choisis les deux droits qui changent la vie des salariés.' }
    ],
    quotes: [
      {
        text: "L'algorithme n'est pas un outil neutre. Il est l'expression formalisée d'une politique RH — donc négociable.",
        source: 'Marylise Léon, secrétaire générale CFDT, 2026'
      }
    ],
    choices: [
      {
        id: 'algo-codecision-totale',
        text: 'Exiger une codécision paritaire sur tout déploiement algorithmique en RH.',
        intent: 'Doctrine de contrôle ouvrier sur l\'outil.',
        theoryHint: "Stratégie maximaliste : poser un droit de veto comme position de départ pour négocier en redescendant.",
        effects: {
          resources: { rapportDeForce: 6, confiance: 5, legitimite: -2, institution: 4 },
          actors: { adversaire: { trust: -5, patience: -4 }, etat: { trust: -2 }, base: { trust: 6 } }
        },
        consequence: {
          immediate:
            "Le MEDEF claque la porte. La négociation est suspendue six semaines. À la reprise, le gouvernement menace d'agir par décret.",
          longterm:
            "Une partie des syndicats se rallie à un compromis amendé. La codécision est conservée pour les algorithmes de licenciement, pas pour les autres. Victoire partielle mais doctrinalement claire."
        },
        traitShift: { rupture: 2, batisseur: 1 },
        flag: 'epuise-mouvement'
      },
      {
        id: 'algo-audit-paritaire',
        text: 'Pousser un dispositif d\'audit paritaire annuel avec droit d\'amendement.',
        intent: 'Compromis institutionnel à fort levier.',
        theoryHint: "Stratégie d'institutionnalisation : créer un organe paritaire d'audit qui acquiert sa propre légitimité au fil du temps.",
        effects: {
          resources: { institution: 8, legitimite: 6, rapportDeForce: 2, caisse: -3 },
          actors: { adversaire: { trust: 3 }, etat: { trust: 5 }, opinion: { trust: 4 } }
        },
        consequence: {
          immediate:
            "L'ANI est signé en juin 2026. Une « Commission paritaire d'audit algorithmique » est créée, hébergée à France Compétences, dotée d'un budget de 12 M€/an.",
          longterm:
            "La CPAA devient une référence européenne. Plusieurs pays (Allemagne, Belgique) s'en inspirent. Elle révèle son premier scandale en 2028 (algorithme Geodis)."
        },
        traitShift: { batisseur: 2, technocrate: 2 },
        flag: 'refondation-paritaire'
      },
      {
        id: 'algo-droit-individuel',
        text: 'Centrer la négociation sur un droit individuel d\'opt-out et de recours.',
        intent: 'Approche libertarienne paritaire.',
        theoryHint: "Stratégie de droits individuels : protéger le salarié sans imposer de cadre collectif lourd.",
        effects: {
          resources: { legitimite: 5, confiance: 3, rapportDeForce: -2, institution: 2 },
          actors: { etat: { trust: 4 }, base: { trust: -2 }, opinion: { trust: 5 } }
        },
        consequence: {
          immediate:
            "L'ANI prévoit un droit individuel à demander l'examen humain de toute décision algorithmique défavorable. La signature est rapide.",
          longterm:
            "Le dispositif est utilisé par 0,7% des salariés concernés en 2027. Trop technique, mal connu. Le rapport CESE 2028 conclura à un échec partiel."
        },
        traitShift: { technocrate: 2 }
      }
    ]
  },
  {
    id: 'plateformes-directive-2026',
    turn: 94,
    date: 'mars 2026',
    era: 'present',
    title: 'Travailleurs des plateformes',
    subtitle: 'Transposer la directive européenne, vraiment',
    mood: 'tendu',
    premium: true,
    historicalContext:
      "La directive européenne 2024/2831 sur les travailleurs des plateformes (Uber, Deliveroo, Stuart, Frichti) introduit une présomption de salariat lorsque cinq critères sur sept sont remplis. La France doit transposer avant le 2 décembre 2026. Le gouvernement Lecornu II propose une transposition a minima qui maintient le statut d'auto-entrepreneur dans la majorité des cas. Les syndicats s'organisent avec les collectifs de livreurs (CLAP, Coursiers en colère). La CFDT-VTC et la CGT-coursiers appellent à une mobilisation nationale.",
    setup: {
      reflechi:
        "Pour la première fois depuis vingt ans, le paritarisme français doit intégrer une catégorie de travailleurs qui n'a jamais cotisé à l'Unédic, à l'Agirc-Arrco, ni eu de convention collective. La question est triple : pousser pour une requalification massive en salariat (mort des plateformes telles qu'on les connaît), construire un statut paritaire intermédiaire (« salarié de plateforme » sui generis), ou organiser le secteur dans un cadre indépendant assorti de protections nouvelles.",
      compulsif:
        "Place de la République, 6 mars 2026. 2 000 livreurs en gilets jaunes (les vrais, pas ceux de 2018) sont assis. À la tribune, un secrétaire national CGT et un porte-parole du CLAP partagent le micro. Sur les pancartes : « Nous ne sommes pas des entrepreneurs ». Plus loin, deux militants CFDT discutent avec un syndicaliste italien venu de Milan."
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'rupture', text: 'Cinq critères sur sept est un piège bureaucratique. Demande la requalification de tous.' },
      { trait: 'batisseur', text: 'Un statut paritaire nouveau, c\'est dix ans de construction — mais c\'est ce qui dure.' }
    ],
    quotes: [
      {
        text: "Nous n'avons pas créé Uber pour le détruire, mais nous n'allons pas non plus créer un sous-prolétariat numérique. Il faut un statut.",
        source: 'Le ministre du Travail, audition au Sénat, février 2026'
      }
    ],
    choices: [
      {
        id: 'plateformes-requalification-massive',
        text: 'Pousser pour la requalification massive en salariat des chauffeurs et livreurs.',
        intent: 'Restauration du salariat comme statut universel.',
        theoryHint: "Stratégie d'absorption : ramener les nouveaux travailleurs dans le cadre paritaire historique.",
        effects: {
          resources: { rapportDeForce: 7, confiance: 6, legitimite: 4, caisse: -5 },
          actors: { etat: { trust: -4, pressure: 6 }, base: { trust: 7 }, opinion: { trust: 3 } }
        },
        consequence: {
          immediate:
            "Une grève coordonnée bloque les centres logistiques de Rungis, Lyon-Corbas et Lille pendant 72 heures. Le gouvernement convoque une réunion d'urgence.",
          longterm:
            "Le seuil de présomption passe de 5/7 à 4/7 (au lieu de l'a minima 6/7 prévu). 40 000 chauffeurs Uber-Bolt-Heetch sont requalifiés en salariés sur trois ans. Uber France perd 15% de sa flotte."
        },
        traitShift: { tribun: 2, rupture: 2 }
      },
      {
        id: 'plateformes-statut-paritaire',
        text: 'Négocier la création d\'un statut paritaire « travailleur de plateforme ».',
        intent: 'Refondation par l\'invention.',
        theoryHint: "Stratégie d'innovation institutionnelle : créer une troisième catégorie entre salarié et indépendant.",
        effects: {
          resources: { institution: 9, legitimite: 6, confiance: 4, caisse: -4 },
          actors: { adversaire: { trust: 5, patience: 6 }, etat: { trust: 5 }, opinion: { trust: 5 } }
        },
        consequence: {
          immediate:
            "Un ANI signé en novembre 2026 crée le statut TPL (Travailleur de Plateforme Lié) : cotisations Unédic et Agirc-Arrco partagées 50/50, tarification minimale par km, droit syndical reconnu, conseil paritaire de branche.",
          longterm:
            "Le statut TPL est étudié par la Commission européenne comme modèle. La France devient un cas d'école positif. Les plateformes acceptent en échange d'une fiscalité simplifiée."
        },
        traitShift: { batisseur: 3, technocrate: 1 },
        flag: 'refondation-paritaire'
      },
      {
        id: 'plateformes-self-employed-protege',
        text: 'Organiser les indépendants dans un cadre syndical nouveau, sans requalification.',
        intent: 'Stratégie d\'organisation hors-statut.',
        theoryHint: "Stratégie de représentativité étendue : reconnaître la spécificité des indépendants tout en étendant la protection sociale.",
        effects: {
          resources: { confiance: 5, rapportDeForce: 3, institution: 3 },
          actors: { base: { trust: 5 }, etat: { trust: 2 }, adversaire: { trust: -1 } }
        },
        consequence: {
          immediate:
            "La CFDT-Indépendants, créée en 2025, prend de l'ampleur. Un accord de branche « Plateformes » fixe un revenu plancher horaire et l'accès à la formation pro.",
          longterm:
            "Le modèle reste minoritaire. 60% des livreurs gardent leur statut auto-entrepreneur, 40% basculent dans le statut TPL ou en salariat. La fragmentation persistante du secteur reste un point de tension."
        },
        traitShift: { pragmatique: 2, technocrate: 1 }
      }
    ]
  },
  {
    id: 'gpec-verte-2027',
    turn: 96,
    date: '2027',
    era: 'present',
    title: 'Reconversions industrielles',
    subtitle: 'GPEC verte automobile, énergie, bâtiment',
    mood: 'grave',
    premium: true,
    historicalContext:
      "L'interdiction de vente des véhicules thermiques neufs en 2035 (votée par l'UE en 2023) impose au secteur automobile français une transformation massive. Stellantis, Renault et leurs sous-traitants doivent reconvertir 250 000 emplois d'ici 2032. Le secteur du chauffage (chauffagistes, fioulistes) et de la rénovation énergétique connaissent une mutation parallèle. En 2027, l'État et les partenaires sociaux négocient un grand accord interprofessionnel sur la GPEC verte (Gestion prévisionnelle des emplois et compétences).",
    setup: {
      reflechi:
        "Tu sièges à la table de la GPEC verte. Trois logiques s'opposent : la logique branche (chaque secteur négocie son plan), la logique territoriale (les bassins d'emploi pilotent la transformation), la logique nationale (un cadre unique sécurisé par l'État avec garanties paritaires). Les enjeux : 250 000 reconversions automobile, 80 000 dans le bâtiment, 40 000 dans l'énergie.",
      compulsif:
        "Conférence sociale à l'Élysée, juin 2027. Sur l'écran, une carte de France grise montre 47 bassins d'emploi en risque. Au premier rang, les présidents de Stellantis, Renault, Schneider, Engie. À droite, les confédérations syndicales. La présidente de la République parle quarante minutes sans se rasseoir."
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'batisseur', text: 'Une GPEC qui ne transforme pas l\'urbanisme et la formation, c\'est un plan social déguisé.' },
      { trait: 'pragmatique', text: 'Si tu n\'as pas le compte des emplois équivalents en sortie, tout le reste est de la rhétorique.' },
      { trait: 'rupture', text: 'On parle de 370 000 vies. C\'est le moment d\'imposer le partage du temps de travail à 32 h.' }
    ],
    quotes: [
      {
        text: "La transition écologique se fera avec les ouvriers ou ne se fera pas.",
        source: 'Affiche CGT-Métaux, congrès 2026'
      }
    ],
    choices: [
      {
        id: 'gpec-32h',
        text: 'Imposer la semaine de 32 heures comme outil de partage du travail.',
        intent: 'Sortie par le haut : moins d\'heures pour plus d\'emplois.',
        theoryHint: "Stratégie de refondation du temps de travail : la transition écologique comme levier de la 32 h.",
        effects: {
          resources: { rapportDeForce: 6, confiance: 7, legitimite: 4, institution: 5, caisse: -6 },
          actors: { base: { trust: 8 }, adversaire: { trust: -7, patience: -5 }, etat: { trust: -3 } }
        },
        consequence: {
          immediate:
            "La proposition est défendue à la conférence. MEDEF refuse en bloc. La CFDT propose un compromis « 33 h annualisées dans les branches en transformation ».",
          longterm:
            "Trois branches expérimentent la 32 h en 2028-2030 (raffineries, automobile, ferroviaire). Les résultats sont mitigés mais le débat est rouvert pour vingt ans."
        },
        traitShift: { rupture: 2, tribun: 2 }
      },
      {
        id: 'gpec-territoriale',
        text: 'Bâtir un accord territorial bassin par bassin, piloté paritairement.',
        intent: 'Stratégie de proximité.',
        theoryHint: "Stratégie territorialisée : ancrer la GPEC dans les réalités locales avec un pilotage paritaire de bassin.",
        effects: {
          resources: { institution: 8, legitimite: 6, confiance: 5, caisse: -4 },
          actors: { adversaire: { trust: 5, patience: 6 }, etat: { trust: 4 }, base: { trust: 5 } }
        },
        consequence: {
          immediate:
            "47 « comités paritaires de bassin » sont créés en 2027-2028. Co-pilotés Préfet/syndicats/branches, dotés d'un budget reconverti FNE-Formation de 1,8 Md€/an.",
          longterm:
            "Le modèle français est cité au Conseil européen. 220 000 reconversions effectuées d'ici 2032 — l'objectif des 250 000 manque légèrement. Le bâtiment dépasse ses cibles."
        },
        traitShift: { batisseur: 3, pragmatique: 1 },
        flag: 'refondation-paritaire'
      },
      {
        id: 'gpec-securite-emploi',
        text: 'Pousser pour un grand droit à la sécurité sociale professionnelle.',
        intent: 'Reprise d\'une vieille idée CGT, modernisée.',
        theoryHint: "Stratégie de sécurité-statut : garantir les droits attachés à la personne, pas au contrat.",
        effects: {
          resources: { institution: 7, legitimite: 5, rapportDeForce: 3, caisse: -5 },
          actors: { base: { trust: 7 }, adversaire: { trust: 0, patience: 2 }, etat: { trust: 1 } }
        },
        consequence: {
          immediate:
            "Un accord-cadre est signé fin 2027 : tout salarié en transformation conserve 90% de son salaire pendant 18 mois de formation, droits Sécu et retraite intégralement maintenus.",
          longterm:
            "Le dispositif coûte 4 Md€/an, financé par CSG renforcée + cotisation employeur dédiée. Il devient un acquis durable, étendu aux secteurs en restructuration en 2030."
        },
        traitShift: { batisseur: 2, technocrate: 2 }
      }
    ]
  }
];
