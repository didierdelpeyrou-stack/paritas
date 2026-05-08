import type { Scenario } from '../../types';

/**
 * Scénarios CPME / U2P — répond à la critique unanime des panels
 * patronaux : « nous représentons 60% des entreprises et 50% des
 * salariés du privé, et nous existons à peine dans ce jeu ». Deux
 * moments où la voix PME diverge nettement de la ligne MEDEF.
 */

export const CPME_SCENARIOS: Scenario[] = [
  {
    id: 'cpme-ordonnances-cse-2017',
    turn: 71,
    date: '22 septembre 2017',
    era: 'macron_i',
    title: 'CPME face aux ordonnances',
    subtitle: 'Le seuil de 50 salariés et la fusion CSE',
    mood: 'tendu',
    premium: true,
    campFilter: 'patron',
    historicalContext:
      "Les ordonnances Macron de septembre 2017 fusionnent CE, DP et CHSCT en un Comité social et économique unique. Pour les entreprises de plus de 50 salariés, c'est une simplification. Pour celles entre 11 et 49 — cœur du tissu CPME —, c'est l'apparition d'une instance qu'elles n'avaient pas, avec délégués élus, formation obligatoire, heures de délégation. La CPME (François Asselin) refuse de signer le volet CSE des ordonnances ; le MEDEF (Pierre Gattaz puis Roux de Bézieux) signe.",
    setup: {
      reflechi:
        "Tu es président de la CPME. Le gouvernement attend ta signature pour acter le consensus patronal. Ton bureau confédéral est divisé : la moitié des fédérations veulent signer pour ne pas être marginalisées, l'autre moitié veulent maintenir une opposition lisible sur les seuils sociaux.",
      compulsif:
        "Salle de réunion CPME, avenue Victor-Hugo. La feuille de route ministérielle est sur la table. Quelqu'un dit : « si on signe, on se fait laminer en interne ; si on signe pas, on passe pour des grincheux qui bloquent ». Asselin tape un crayon contre son verre."
    },
    actors: ['base', 'adversaire', 'etat'],
    voices: [
      { trait: 'pragmatique', text: 'Refuser visiblement, c\'est exister. Signer en silence, c\'est disparaître.' },
      { trait: 'batisseur', text: 'Quelle alternative concrète tu portes ? Sans contre-projet, le refus est nu.' }
    ],
    quotes: [
      {
        text: "Pour une PME de 30 salariés, mettre en place un CSE c'est quatre jours de réunion par an, deux formations obligatoires, et un climat à gérer. Ce n'est pas une simplification.",
        source: 'François Asselin, président CPME, septembre 2017'
      }
    ],
    choices: [
      {
        id: 'cpme-refuser-cse',
        text: 'Refuser publiquement de signer le volet CSE.',
        intent: 'Ligne de divergence visible avec le MEDEF.',
        theoryHint: "Stratégie de différenciation : exister dans le paysage patronal comme voix distincte des grands groupes.",
        effects: {
          resources: { legitimite: 6, confiance: 7, rapportDeForce: 3, institution: -2 },
          actors: { base: { trust: 8 }, adversaire: { trust: -2 }, etat: { trust: -3 } }
        },
        consequence: {
          immediate:
            "La signature MEDEF passe seule. La CPME publie un communiqué de désolidarisation. La presse économique titre « les PME refusent la fusion CSE ».",
          longterm:
            "Cette posture renforce la CPME dans les TPE-PME pour les cinq années suivantes. Elle alimente aussi un débat permanent sur la représentativité patronale qui culminera dans les arrêtés de 2021."
        },
        traitShift: { pragmatique: 2, batisseur: 1 },
        flag: 'cpme-divergence-medef',
        ability: 'presse'
      },
      {
        id: 'cpme-signer-amenagements',
        text: 'Signer en obtenant des aménagements sur le seuil de 50 salariés.',
        intent: 'Pragmatisme négocié.',
        theoryHint: "Stratégie d'influence : préserver la place à la table en échange d'amendements ciblés.",
        effects: {
          resources: { institution: 5, legitimite: 3, caisse: 3, confiance: -3 },
          actors: { etat: { trust: 5 }, adversaire: { trust: 3, patience: 4 }, base: { trust: -3 } }
        },
        consequence: {
          immediate:
            "Tu obtiens un délai de 18 mois pour la mise en place du CSE dans les entreprises de moins de 50 salariés. Tu signes. Les fédérations PME sont divisées.",
          longterm:
            "L'aménagement aide effectivement le passage. Mais l'image d'une CPME « MEDEF-bis » colle pour deux mandats. Le risque : voir surgir une organisation patronale plus radicale (U2P + dissidents)."
        },
        traitShift: { technocrate: 2, batisseur: 1 },
        ability: 'table'
      },
      {
        id: 'cpme-contre-projet',
        text: 'Proposer un contre-projet de représentation simplifiée pour les TPE.',
        intent: 'Refondation par l\'ambition.',
        theoryHint: "Stratégie de prise d'initiative : poser une alternative crédible, pas seulement un refus.",
        effects: {
          resources: { institution: 7, legitimite: 7, confiance: 4, caisse: -5 },
          actors: { adversaire: { trust: 4, patience: 5 }, etat: { trust: 2 } }
        },
        consequence: {
          immediate:
            "La CPME publie un livre blanc « Représentation simplifiée TPE-PME » en novembre 2017. Le ministère du Travail organise une concertation dédiée en janvier 2018.",
          longterm:
            "Le projet inspirera la création des Conseils d'entreprise expérimentaux (CEE) en 2020-2022 dans certaines branches. La CPME y gagne durablement en stature politique."
        },
        traitShift: { batisseur: 2, technocrate: 1 },
        flag: 'refondation-paritaire',
        ability: 'congres'
      }
    ]
  },
  {
    id: 'u2p-artisanat-2024',
    turn: 82,
    date: '2024',
    era: 'macron_ii',
    title: 'L\'artisanat face à la formation pro',
    subtitle: 'Réforme des OPCO et CPF, voix U2P',
    mood: 'tendu',
    premium: true,
    campFilter: 'patron',
    historicalContext:
      "Depuis la loi « Avenir professionnel » de 2018, le système de formation professionnelle est piloté par les OPCO (Opérateurs de compétences) — onze OPCO de branche succèdent aux 20 OPCA antérieurs. L'U2P (Union des entreprises de proximité, regroupant artisans, commerçants, professions libérales) défend l'OPCO EP (entreprises de proximité). En 2024, le gouvernement Attal envisage de fusionner les OPCO pour réduire à 5-6 organismes. L'artisanat se retrouve menacé d'absorption dans un OPCO services à dominante grands groupes.",
    setup: {
      reflechi:
        "Tu présides l'U2P. La fusion proposée ferait disparaître l'OPCO EP. Les fédérations artisanales (boulangers, coiffeurs, menuisiers, plombiers) réagissent vivement : la formation des apprentis est une affaire culturelle autant que technique pour ces métiers, et les grands OPCO ont historiquement mal servi les TPE.",
      compulsif:
        "Au siège U2P, rue de Lille à Paris, les présidents de fédération arrivent un à un. Le boulanger raconte que son apprenti a fait un trimestre de cours en visio sur Excel — alors qu'il ne sait pas encore tourner une pâte sans fissure. La salle écoute, en silence."
    },
    actors: ['base', 'adversaire', 'etat'],
    voices: [
      { trait: 'rupture', text: 'Si l\'OPCO EP disparaît, l\'apprentissage artisanal meurt en cinq ans. Bats-toi.' },
      { trait: 'pragmatique', text: 'Une bataille frontale contre Bercy se perd huit fois sur dix. Construis une coalition d\'abord.' }
    ],
    quotes: [
      {
        text: "Un boulanger ne se forme pas comme un commercial d'assurance. Le compagnonnage et l'OPCO EP, c'est notre Académie.",
        source: "Catherine Foucher, présidente de la Confédération nationale de l'artisanat, mars 2024"
      }
    ],
    choices: [
      {
        id: 'u2p-mobilisation-artisans',
        text: 'Lancer une mobilisation publique des fédérations artisanales.',
        intent: 'Faire entendre la voix artisanale dans le débat public.',
        theoryHint: "Stratégie de visibilité : transformer le débat technocratique en sujet public défendable.",
        effects: {
          resources: { legitimite: 6, confiance: 6, rapportDeForce: 4, caisse: -3 },
          actors: { opinion: { trust: 6 }, etat: { trust: -3, pressure: 4 }, base: { trust: 7 } }
        },
        consequence: {
          immediate:
            "La fédération de la boulangerie organise une journée portes ouvertes nationale le 16 mai 2024. La presse régionale relaie massivement. Le ministère reçoit l'U2P en urgence.",
          longterm:
            "Le projet de fusion est repoussé à 2026, puis officiellement abandonné dans sa forme initiale. L'OPCO EP est préservé."
        },
        traitShift: { tribun: 2, batisseur: 1 },
        flag: 'fait-victoire-historique',
        ability: 'manifestation'
      },
      {
        id: 'u2p-coalition-cpme',
        text: 'Construire une coalition U2P-CPME pour peser ensemble sur Bercy.',
        intent: 'Stratégie d\'alliance patronale TPE-PME.',
        theoryHint: "Stratégie d'influence : additionner les représentativités pour exister face au MEDEF et à l'État.",
        effects: {
          resources: { institution: 7, legitimite: 5, rapportDeForce: 2 },
          actors: { adversaire: { trust: 5, patience: 6 }, etat: { trust: 1 } }
        },
        consequence: {
          immediate:
            "Une plateforme commune U2P-CPME est publiée en avril 2024. Le gouvernement accepte une concertation à 4 (MEDEF, U2P, CPME, syndicats salariés) au lieu d'une bilatérale MEDEF.",
          longterm:
            "Cette coalition reste active sur d'autres dossiers (apprentissage, prud'hommes, branches). Elle structurera durablement la voix patronale TPE-PME face au MEDEF."
        },
        traitShift: { batisseur: 2, pragmatique: 1 },
        ability: 'congres'
      },
      {
        id: 'u2p-contentieux-conseil-etat',
        text: 'Préparer un recours au Conseil d\'État contre le décret de fusion.',
        intent: 'Bataille juridique technique.',
        theoryHint: "Stratégie contentieuse : utiliser le droit administratif comme arme syndicale patronale.",
        effects: {
          resources: { institution: 6, legitimite: 4, caisse: -4 },
          actors: { etat: { trust: -4 } }
        },
        consequence: {
          immediate:
            "Un cabinet d'avocats du conseil prépare le recours pour vice de consultation des partenaires sociaux. Le décret n'est pas pris dans la foulée.",
          longterm:
            "Le recours est jugé recevable en 2025. Il fait jurisprudence sur l'obligation de concertation paritaire avant toute réforme structurelle de la formation pro."
        },
        traitShift: { technocrate: 3 },
        ability: 'delegation'
      }
    ]
  },

  /* ========================================================
     ORDA-015 PARITAS — comblement du trou 2008-2024
     côté patronal (panel Pascal-24, Bruno-30).
     Quatre scénarios PME ajoutés : rupture conventionnelle
     2008, Florange 2013, ordonnances Macron 2017 (vu côté
     CPME complémentaire), retraites + APC 2023.
     ======================================================== */

  {
    id: 'cpme-rupture-conventionnelle-2008',
    turn: 64,
    date: '11 janvier 2008',
    era: 'sarkozy',
    title: 'L\'ANI sur la modernisation du marché du travail',
    subtitle: 'Rupture conventionnelle, période d\'essai, chômage partiel',
    mood: 'tendu',
    premium: true,
    campFilter: 'patron',
    historicalContext:
      "L'accord national interprofessionnel (ANI) du 11 janvier 2008, signé par CFDT, CFTC, CGC et toutes les organisations patronales (MEDEF, CGPME — futur CPME — et UPA), est transposé par la loi du 25 juin 2008 portant modernisation du marché du travail. Il crée la rupture conventionnelle — séparation à l'amiable indemnisée et ouvrant droit à l'assurance chômage — et allonge les périodes d'essai. Pour les PME, c'est la première fois qu'un mode de séparation négocié remplace la friction licenciement / démission. Mais la signature CGPME ne s'est pas faite sans débat : certaines fédérations craignaient un coût indemnitaire généralisé.",
    setup: {
      reflechi:
        "Tu es président de la CGPME. La négociation interprofessionnelle s'achève rue du Faubourg-Saint-Honoré. Le MEDEF (Laurence Parisot) pousse pour la signature. Les fédérations PME hésitent : la rupture conventionnelle ouvre une porte de sortie utile, mais le coût (indemnité + droit chômage) inquiète les TPE de moins de 20 salariés.",
      compulsif:
        "Salle de négo, Avenue Bosquet. Onze heures du soir. Le texte tient sur dix-sept pages. Parisot a déjà annoncé sa signature à la presse. Tu regardes ton bureau confédéral : la moitié dit oui, un tiers s'inquiète, le reste demande des amendements impossibles à cette heure. Il faut décider avant le matin."
    },
    actors: ['base', 'adversaire', 'etat'],
    voices: [
      { trait: 'pragmatique', text: 'Une porte de sortie négociée, c\'est moins coûteux qu\'un prud\'hommes mal mené. Signe.' },
      { trait: 'rupture', text: 'Tu offres aux salariés un droit chômage qu\'ils n\'avaient pas. C\'est un cadeau pour le MEDEF, pas pour toi.' },
      { trait: 'batisseur', text: 'Si tu refuses sec, tu seras invisible pendant cinq ans. Si tu signes seul, tu trahis les TPE.' }
    ],
    quotes: [
      {
        text: "Cet accord n'est pas un solde de tout compte du Code du travail. C'est un compromis lisible : flexibilité contre droits nouveaux.",
        source: 'Laurence Parisot, présidente du MEDEF, 11 janvier 2008'
      }
    ],
    choices: [
      {
        id: 'cpme-signer-ani-2008',
        text: 'Signer l\'ANI aux côtés du MEDEF.',
        intent: 'Front patronal commun, quitte à arrondir les angles.',
        theoryHint: "Stratégie d'unité patronale : préserver la place à la table en restant aligné sur le grand frère MEDEF.",
        effects: {
          resources: { institution: 6, legitimite: 3, caisse: 2, confiance: -4 },
          actors: { etat: { trust: 5 }, adversaire: { trust: 4, patience: 3 }, base: { trust: -3 } }
        },
        consequence: {
          immediate:
            "Tu paraphes le texte à 23h47. Le matin, l'AFP titre « ANI : front patronal uni ». La rupture conventionnelle devient loi le 25 juin. Les fédérations TPE râlent en interne mais la ligne tient.",
          longterm:
            "La rupture conventionnelle s'impose : 437 000 ruptures homologuées dès 2010, près d'un demi-million de procédures par an d'ici 2015. Les PME y trouvent un outil. Mais l'image d'une CGPME « MEDEF-bis » s'installe pour deux mandats."
        },
        traitShift: { pragmatique: 2, batisseur: 1 },
        flag: 'signe-rupture-conv',
        ability: 'table'
      },
      {
        id: 'cpme-accord-entreprise-2008',
        text: 'Renvoyer la rupture à un accord d\'entreprise dérogatoire pour les TPE.',
        intent: 'Sauver le principe sans imposer le coût aux plus petits.',
        theoryHint: "Stratégie de différenciation par seuils : protéger les TPE en obtenant un régime allégé.",
        effects: {
          resources: { institution: 4, legitimite: 5, confiance: 4, caisse: -2 },
          actors: { adversaire: { trust: -1, patience: 2 }, etat: { trust: 1 }, base: { trust: 5 } }
        },
        consequence: {
          immediate:
            "Tu obtiens en marge du texte un avenant interprétatif : pour les entreprises de moins de 20 salariés, l'indemnité minimale est réduite. Le MEDEF grince, mais la signature CGPME devient un atout politique.",
          longterm:
            "L'avenant TPE survit deux décrets et un changement de gouvernement. Il sera repris dans l'argumentaire CPME des années 2010 sur les seuils sociaux. Tu gagnes en crédibilité auprès des fédérations artisanales."
        },
        traitShift: { batisseur: 2, pragmatique: 1 },
        flag: 'accord-entreprise',
        ability: 'congres'
      },
      {
        id: 'cpme-refuser-ani-2008',
        text: 'Refuser de signer : la flexicurité est un piège.',
        intent: 'Voix dissonante dans le concert patronal.',
        theoryHint: "Stratégie de rupture : poser une ligne PME irréductible, quitte à être marginalisé un temps.",
        effects: {
          resources: { legitimite: 4, rapportDeForce: 3, confiance: 6, institution: -4 },
          actors: { adversaire: { trust: -5 }, etat: { trust: -3 }, base: { trust: 7 } }
        },
        consequence: {
          immediate:
            "La signature se fait sans toi. Le matin, Parisot évoque « un regret ». La presse économique te qualifie de « grincheuse ». Au congrès suivant, les fédérations artisanales t'applaudissent debout.",
          longterm:
            "Cinq ans plus tard, les juristes rouvrent le dossier : indemnités revalorisées, contestations en série. Ton refus de 2008 te donne une autorité morale au moment des ordonnances Macron 2017."
        },
        traitShift: { rupture: 2, tribun: 1 },
        flag: 'refuse-compromis',
        ability: 'presse'
      }
    ]
  },

  {
    id: 'cpme-florange-2013',
    turn: 68,
    date: '24 avril 2013',
    era: 'hollande',
    title: 'Florange — l\'ombre des hauts fourneaux',
    subtitle: 'ArcelorMittal, Hayange, et la promesse Hollande',
    mood: 'grave',
    premium: true,
    campFilter: 'patron',
    historicalContext:
      "Le 1er octobre 2011, ArcelorMittal annonce la mise sous cocon des deux hauts fourneaux de Florange (Moselle), à Hayange. Lakshmi Mittal refuse les repreneurs. La promesse de campagne du candidat Hollande (« la sidérurgie est française ») se heurte à la nationalisation temporaire évoquée puis abandonnée par Arnaud Montebourg. Le 24 avril 2013, ArcelorMittal annonce la fermeture définitive de la phase liquide. Le tissu PME mosellan — sous-traitants, mécanique, transport — vacille. Le MEDEF national soutient ArcelorMittal au nom de la liberté d'entreprise. La CPME locale est tiraillée entre solidarité avec ses adhérents sous-traitants et ligne fédérale.",
    setup: {
      reflechi:
        "Tu présides la CGPME Moselle. Tes adhérents — soixante-dix sous-traitants directs d'ArcelorMittal — t'écrivent en série. Le siège parisien CGPME relaie le MEDEF : pas de stigmatisation de Mittal, défense du climat d'investissement. Mais à Hayange, la perte d'emplois directs (629) double les emplois indirects menacés. Hollande hésite entre intervention et abandon.",
      compulsif:
        "Réunion des fédérations CGPME Lorraine, Metz, salle de l'hôtel consulaire. Sur la table, deux courriers : l'un du président national, prudent ; l'autre de tes adhérents, brûlant. Quelqu'un dit : « Mittal s'en fout, Hollande aussi, mais nous on reste. » Dehors, Hayange s'éteint. Tu dois choisir une ligne d'ici vendredi."
    },
    actors: ['base', 'adversaire', 'etat'],
    voices: [
      { trait: 'pragmatique', text: 'Aligne-toi sur le MEDEF. Sortir des rangs te coûtera la prochaine commission.' },
      { trait: 'rupture', text: 'Tes adhérents crèvent. Si tu te tais, tu signes leur arrêt avec Mittal.' },
      { trait: 'batisseur', text: 'Joue la médiation État-territoire. Tu as plus à gagner à exister entre les deux qu\'à mourir avec Mittal.' }
    ],
    quotes: [
      {
        text: "La nationalisation temporaire n'est pas une option taboue. Mais elle ne se décrète pas sans repreneur crédible.",
        source: 'Arnaud Montebourg, ministre du Redressement productif, novembre 2012'
      }
    ],
    choices: [
      {
        id: 'cpme-florange-medef',
        text: 'Aligner la CPME locale sur le MEDEF national.',
        intent: 'Discipline patronale au prix du tissu PME mosellan.',
        theoryHint: "Stratégie d'alignement : protéger l'institution patronale interprofessionnelle en sacrifiant l'écho local.",
        effects: {
          resources: { institution: 5, caisse: 1, confiance: -7, legitimite: -5 },
          actors: { adversaire: { trust: 5, patience: 4 }, base: { trust: -8 }, opinion: { trust: -4 } }
        },
        consequence: {
          immediate:
            "Tu publies un communiqué tiède : « Soutien aux salariés, mais respect du droit de propriété. » Les adhérents mosellans t'écrivent une lettre ouverte. Trois fédérations menacent de quitter la CGPME locale.",
          longterm:
            "L'image PME-aligné-MEDEF s'imprime durablement en Lorraine. Aux élections consulaires suivantes, ta liste perd la majorité chambre par chambre. Le MEDEF te garde, mais ta légitimité régionale est cassée."
        },
        traitShift: { pragmatique: 1, technocrate: 2 },
        flag: 'florange-medef',
        ability: 'table'
      },
      {
        id: 'cpme-florange-cpme',
        text: 'Tenir une ligne CPME indépendante, défendre les sous-traitants.',
        intent: 'Voix patronale autonome, ancrée dans le territoire.',
        theoryHint: "Stratégie de différenciation territoriale : faire de la CPME la voix des PME concrètes face aux groupes globaux.",
        effects: {
          resources: { legitimite: 7, confiance: 6, rapportDeForce: 3, caisse: -3 },
          actors: { base: { trust: 8 }, opinion: { trust: 5 }, adversaire: { trust: -5 } }
        },
        consequence: {
          immediate:
            "Tu publies une lettre ouverte à Lakshmi Mittal : « Vous fermez Florange, vous fermez aussi soixante-dix PME mosellanes. » Les médias locaux relaient. Le MEDEF national te désavoue à demi-mot. Tes adhérents te défendent sur RTL.",
          longterm:
            "La rupture avec le MEDEF national s'installe sur le dossier industrie. Mais tu construis une notoriété nationale comme « voix des sous-traitants ». Le tissu Lorraine reste fidèle. Le congrès CGPME 2014 retient ton nom comme exemple."
        },
        traitShift: { rupture: 1, batisseur: 2, tribun: 1 },
        flag: 'florange-cpme',
        ability: 'presse'
      },
      {
        id: 'cpme-florange-mediation',
        text: 'Proposer une médiation discrète entre Hollande, Mittal et le tissu PME.',
        intent: 'Diplomatie patronale en coulisses.',
        theoryHint: "Stratégie d'influence : exister par le canal direct État-territoire-grand groupe sans afficher de ligne publique.",
        effects: {
          resources: { institution: 7, legitimite: 3, confiance: 1, caisse: -4 },
          actors: { etat: { trust: 6 }, adversaire: { trust: 1 }, base: { trust: 1 } }
        },
        consequence: {
          immediate:
            "Tu obtiens un rendez-vous Élysée et Tour ArcelorMittal Saint-Denis dans la même semaine. Tu portes un dossier « plan de continuité sous-traitants ». Mittal écoute, Hollande hoche la tête. Aucun communiqué ne sort.",
          longterm:
            "Trois mois plus tard, un fonds État-CGPME de 30 M€ est lancé pour la reconversion des sous-traitants mosellans. Pas de victoire spectaculaire, mais 18 PME sauvées. Tu gagnes l'oreille de Bercy pour les décennies suivantes."
        },
        traitShift: { batisseur: 2, technocrate: 2 },
        flag: 'mediation-elysee',
        ability: 'delegation'
      }
    ]
  },

  {
    id: 'cpme-ordonnances-macron-2017',
    turn: 70,
    date: '22 septembre 2017',
    era: 'macron_i',
    title: 'Le grand soir des ordonnances',
    subtitle: 'CSE, accord d\'entreprise, plafonnement prud\'hommes',
    mood: 'tendu',
    premium: true,
    campFilter: 'patron',
    historicalContext:
      "Les cinq ordonnances Macron sont prises le 22 septembre 2017 sur le fondement de la loi d'habilitation du 15 septembre. Elles fusionnent CHSCT, DP et CE en un Comité social et économique (CSE) unique, élargissent la primauté de l'accord d'entreprise sur l'accord de branche, plafonnent les indemnités prud'homales et créent la rupture conventionnelle collective. Pour les PME, deux signaux opposés : simplification CSE pour les +50 (utile), mais création d'un CSE obligatoire pour les 11-49 (qui n'avaient que les délégués du personnel auparavant). La CPME (François Asselin) doit décider entre l'accord enthousiaste, la dénonciation des nouvelles charges, ou la négociation d'un accord d'entreprise dérogatoire élargi.",
    setup: {
      reflechi:
        "Tu présides la CPME. Le ministère du Travail te reçoit en bilatérale. Pénicaud veut une signature visible côté patronat pour donner un consensus à la communication présidentielle. Tes fédérations 11-49 redoutent la formation obligatoire CSE et les heures de délégation. Tes fédérations 50+ y voient une simplification réelle. Tu dois écrire une position publique.",
      compulsif:
        "Salle Trône, ministère du Travail, rue de Grenelle. Pénicaud a apporté des viennoiseries. La presse attend en bas. À ta gauche, Geoffroy Roux de Bézieux (MEDEF) sourit déjà. À ta droite, Alain Griset (UPA / future U2P) hésite. Trois lignes possibles, et trois flux d'adhérents qui te regardent."
    },
    actors: ['base', 'adversaire', 'etat'],
    voices: [
      { trait: 'pragmatique', text: 'Embrasse le CSE. Pour tes +50, c\'est une vraie simplification. Le reste se négociera après.' },
      { trait: 'rupture', text: 'Pour tes 11-49, c\'est une nouvelle obligation. Si tu signes, tu trahis 60% de tes adhérents.' },
      { trait: 'batisseur', text: 'Négocie un seuil dérogatoire. Refuser sec, c\'est exister en parlant fort. Mais bâtir, c\'est exister en pesant.' }
    ],
    quotes: [
      {
        text: "Pour une entreprise de 30 salariés, mettre en place un CSE c'est quatre jours de réunion par an, deux formations obligatoires, et un climat à gérer. Ce n'est pas une simplification.",
        source: 'François Asselin, président CPME, septembre 2017'
      }
    ],
    choices: [
      {
        id: 'cpme-cse-embrasse',
        text: 'Embrasser le CSE comme grande simplification patronale.',
        intent: 'Signature enthousiaste, alignement sur le MEDEF et l\'Élysée.',
        theoryHint: "Stratégie d'alignement gouvernemental : capter le bénéfice politique en assumant le coût de la fusion pour les TPE-PME.",
        effects: {
          resources: { institution: 5, caisse: 4, legitimite: -2, confiance: -4 },
          actors: { etat: { trust: 7 }, adversaire: { trust: 5, patience: 4 }, base: { trust: -5 } }
        },
        consequence: {
          immediate:
            "Tu cosignes le communiqué patronal. Pénicaud te cite à 13h. Les fédérations 11-49 publient un communiqué de désaccord interne le lendemain. Asselin doit calmer trois bureaux régionaux.",
          longterm:
            "Le bénéfice institutionnel se confirme : la CPME récupère deux sièges au COCT (Conseil d'orientation des conditions de travail). Mais la base TPE accuse l'organisation de s'être « MEDEF-isée ». Aux élections représentativité 2021, la CPME perd des voix au profit de l'U2P."
        },
        traitShift: { pragmatique: 2, technocrate: 1 },
        flag: 'cse-embrasse',
        ability: 'table'
      },
      {
        id: 'cpme-cse-denonce',
        text: 'Dénoncer publiquement la perte de prérogatives et les charges nouvelles.',
        intent: 'Voix patronale dissidente, refus signé.',
        theoryHint: "Stratégie de différenciation : capitaliser sur le mécontentement TPE-PME pour exister face au MEDEF aligné.",
        effects: {
          resources: { legitimite: 6, confiance: 7, rapportDeForce: 3, institution: -3 },
          actors: { base: { trust: 8 }, adversaire: { trust: -3 }, etat: { trust: -4 } }
        },
        consequence: {
          immediate:
            "Tu refuses publiquement de signer le volet CSE. Tu publies un communiqué : « Cette ordonnance crée des obligations nouvelles pour 600 000 entreprises. Ce n'est pas une simplification. » Le Figaro Économie te met en une.",
          longterm:
            "Cette posture renforce la CPME dans les TPE-PME pour les cinq années suivantes. Elle alimente aussi un débat permanent sur la représentativité patronale qui culminera dans les arrêtés de 2021 — où la CPME consolide sa place."
        },
        traitShift: { rupture: 2, tribun: 1 },
        flag: 'cse-denonce',
        ability: 'presse'
      },
      {
        id: 'cpme-cse-derogation',
        text: 'Négocier un accord d\'entreprise dérogatoire pour les 11-49.',
        intent: 'Refondation par seuils sociaux différenciés.',
        theoryHint: "Stratégie de prise d'initiative : poser une alternative crédible (CSE allégé) plutôt qu'un refus nu ou un alignement coûteux.",
        effects: {
          resources: { institution: 7, legitimite: 6, confiance: 3, caisse: -3 },
          actors: { etat: { trust: 3 }, adversaire: { trust: 2, patience: 5 }, base: { trust: 4 } }
        },
        consequence: {
          immediate:
            "Tu publies un livre blanc « CSE simplifié pour les 11-49 » dès novembre 2017. Le ministère du Travail organise une concertation dédiée en janvier 2018. La presse économique évoque la « doctrine Asselin ».",
          longterm:
            "Le projet inspirera les Conseils d'entreprise expérimentaux (CEE) en 2020-2022 dans certaines branches, avec instances paritaires plus légères. La CPME y gagne durablement en stature politique et capte la voix de la refondation paritaire."
        },
        traitShift: { batisseur: 2, technocrate: 1 },
        flag: 'refondation-paritaire',
        ability: 'congres'
      }
    ]
  },

  {
    id: 'cpme-retraites-apc-2023',
    turn: 78,
    date: '14 avril 2023',
    era: 'macron_ii',
    title: 'Retraites + accord performance collective',
    subtitle: 'L\'APC comme sortie de crise des 64 ans',
    mood: 'tendu',
    premium: true,
    campFilter: 'patron',
    historicalContext:
      "La loi du 14 avril 2023 portant réforme des retraites recule l'âge légal à 64 ans malgré quatorze journées de mobilisation et une censure constitutionnelle partielle. Pour les PME, l'allongement de la vie active pose des questions concrètes : pénibilité, fin de carrière, productivité. L'accord de performance collective (APC), créé par les ordonnances Macron 2017 (article L2254-2 du Code du travail), permet de modifier durée du travail, rémunération et mobilité géographique par accord majoritaire. Au printemps 2023, plusieurs branches PME (BTP, transport, services) examinent l'APC comme outil de gestion post-réforme. Trois lignes patronales se dessinent : APC offensif (gel des salaires contre maintien de l'emploi), APC défensif (souplesse horaires sans toucher au salaire), refus de négocier dans le climat d'après-49.3.",
    setup: {
      reflechi:
        "Tu présides la CPME. Les fédérations BTP et transport te demandent une position de branche. La CFDT (Berger), traumatisée par les 49.3, a posé une condition : pas d'APC offensif sans contrepartie pénibilité. Le MEDEF (Roux de Bézieux) penche pour l'offensif. L'État, par Olivier Dussopt, presse à la signature pour montrer que « le dialogue social repart ».",
      compulsif:
        "CPME, Avenue Victor-Hugo. Sur la table, trois projets d'accord type. Sur l'écran, les chiffres : 64 ans, deux ans de travail en plus pour 15 millions de salariés. Au téléphone, ton président de fédération BTP : « Si je prolonge mes maçons jusqu'à 64 ans, je veux pouvoir ajuster horaires et primes. » À côté, l'AFP attend un communiqué d'ici 18h."
    },
    actors: ['base', 'adversaire', 'etat'],
    voices: [
      { trait: 'rupture', text: 'L\'APC offensif, c\'est la guerre sociale post-49.3. Tu la perds en six mois, tu la signes en deux jours.' },
      { trait: 'pragmatique', text: 'L\'APC défensif, souplesse horaires sans gel salaires : le compromis qui passe la CFDT.' },
      { trait: 'batisseur', text: 'Refuser de négocier maintenant, c\'est laisser le MEDEF écrire seul la doctrine APC. Tu te désuniras en interne.' }
    ],
    quotes: [
      {
        text: "L'accord de performance collective n'est pas un outil de gel des salaires. C'est un instrument d'ajustement à un choc — et le 64 ans en est un.",
        source: "Olivier Dussopt, ministre du Travail, mars 2023"
      }
    ],
    choices: [
      {
        id: 'cpme-apc-offensif',
        text: 'APC offensif : gel des salaires contre maintien de l\'emploi.',
        intent: 'Profiter du momentum réforme pour imposer un cadre dur.',
        theoryHint: "Stratégie de rapport de force : capter l'asymétrie post-49.3 pour ancrer un APC favorable au capital.",
        effects: {
          resources: { caisse: 7, institution: 3, legitimite: -6, confiance: -5, santeSociale: -4 },
          actors: { adversaire: { trust: 6 }, base: { trust: -7 }, opinion: { trust: -5 }, etat: { trust: 2 } }
        },
        consequence: {
          immediate:
            "Tu signes un APC type avec gel des salaires sur 18 mois et clause emploi. La CFDT le qualifie de « provocation post-49.3 ». La CGT appelle au boycott. Trois fédérations PME refusent d'appliquer.",
          longterm:
            "L'APC offensif déclenche une vague contentieuse en 2024 : 47 saisines prud'homales sur le caractère « majoritaire » réel. Deux décisions Cour de cassation invalident l'accord type. La CPME doit retirer le modèle en 2025."
        },
        traitShift: { rupture: 1, technocrate: 1 },
        flag: 'apc-offensif',
        ability: 'table'
      },
      {
        id: 'cpme-apc-defensif',
        text: 'APC défensif : souplesse horaires sans toucher au salaire.',
        intent: 'Compromis lisible, signature CFDT possible.',
        theoryHint: "Stratégie de compromis : préserver l'outil APC en évitant le sujet salaire qui rendrait l'accord politiquement intenable.",
        effects: {
          resources: { institution: 6, caisse: 3, legitimite: 4, confiance: 2 },
          actors: { adversaire: { trust: 3, patience: 5 }, base: { trust: 1 }, etat: { trust: 4 }, opinion: { trust: 2 } }
        },
        consequence: {
          immediate:
            "L'accord type APC souplesse-horaires est signé par CFDT, CFTC et CGC dans trois branches PME. Berger te remercie publiquement. Le MEDEF grommelle mais s'aligne.",
          longterm:
            "L'APC défensif devient le standard 2024-2026 dans les PME. La CPME consolide sa doctrine : « négocier l'horaire pour ne pas perdre le salarié ». Aux élections 2025, la CFDT progresse dans les branches signataires — et cite la CPME comme partenaire fiable."
        },
        traitShift: { pragmatique: 2, batisseur: 1 },
        flag: 'apc-defensif',
        ability: 'congres'
      },
      {
        id: 'cpme-apc-refus-2023',
        text: 'Refuser de négocier dans le climat d\'après-49.3.',
        intent: 'Posture de retrait, dénonciation du forçage gouvernemental.',
        theoryHint: "Stratégie d'attente : protéger l'image patronale en refusant de cosigner l'agenda gouvernemental après 49.3.",
        effects: {
          resources: { legitimite: 5, confiance: 5, rapportDeForce: 2, caisse: -3, institution: -3 },
          actors: { base: { trust: 5 }, etat: { trust: -5 }, adversaire: { trust: -3 } }
        },
        consequence: {
          immediate:
            "Tu publies un communiqué : « Le climat post-49.3 ne permet pas un dialogue social loyal. La CPME suspend toute négociation APC nationale. » Le MEDEF te désavoue. La CFDT te remercie en privé.",
          longterm:
            "Ce retrait coûte des sièges paritaires en 2024 (formation, prévoyance). Mais tu gagnes une stature de garant de la dignité du dialogue social. En 2025, lorsque le climat se détend, tu reviens à la table avec un poids moral réévalué."
        },
        traitShift: { rupture: 2, tribun: 1 },
        flag: 'refuse-compromis',
        ability: 'presse'
      }
    ]
  }
];
