import type { Scenario } from '../../types';

/**
 * ORDA-017 PARITAS (Diplomates content, P0 Beaud-16) — quatre scénarios
 * vue ouvrière, époque 2009-2019. Trou de contenu pointé par Stéphane
 * Beaud (panel-30) : « Florange, Goodyear, Whirlpool, ArcelorMittal,
 * Continental — 0 hit dans scenarios/. Post-2000 = Seillière / Macron /
 * CSE (institutionnel), pas l'usine qui ferme. »
 *
 * Vue salarié strictement (campFilter: 'salarie'). Cycle 2009-2019,
 * cinq fermetures emblématiques traitées en quatre scènes :
 *  - 2009 Continental Clairoix   — séquestration des dirigeants
 *  - 2013 Florange (ArcelorMittal) — bataille interconfédérale
 *  - 2017 Whirlpool Amiens       — Macron / Le Pen sur le parking
 *  - 2019 Goodyear Amiens-Nord   — cassation, repli, reconversion
 *
 * Faits sourcés : procès Continental Clairoix (Compiègne, mars 2010,
 * peines avec sursis) ; Florange / loi Florange du 29 mars 2014 ;
 * visite Macron-Whirlpool 26 avril 2017, Le Pen sur le parking le
 * même jour ; arrêt de la Cour de cassation des « Goodyear » 26 sept.
 * 2018 (relaxe partielle), reconversion sur le site de Riom.
 */

export const OUVRIERS_POST_2000_SCENARIOS: Scenario[] = [
  {
    id: 'continental-clairoix-2009',
    turn: 56,
    date: '11 mars 2009',
    era: 'sarkozy',
    title: 'Continental Clairoix',
    subtitle: 'L\'usine ferme, les dirigeants sortent par la fenêtre',
    mood: 'grave',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Le 11 mars 2009, Continental annonce la fermeture de l'usine de pneus de Clairoix (Oise) — 1 120 salariés. La direction allemande avait pourtant signé en 2007 un accord donnant-donnant : passage aux 40 heures sans hausse de salaire contre maintien du site. Quinze jours plus tard, après l'annonce, des salariés saccagent la sous-préfecture de Compiègne. En mars 2010, six d'entre eux sont condamnés à des peines de prison avec sursis pour la séquestration de cadres. Xavier Mathieu, délégué CGT, devient le visage médiatique de la lutte.",
    setup: {
      reflechi:
        "L'accord de 2007 est trahi par écrit. Le plan social prévoit 50 000 € par tête — un chiffre élevé, qui divise. Une partie de la base veut signer pour partir avec une indemnité décente. L'autre veut frapper fort pour faire payer la trahison. Et au-delà : Goodyear et Michelin annoncent eux aussi des restructurations. Une coordination des trois pneumatiques est techniquement possible.",
      compulsif:
        "Le piquet brûle des palettes devant l'entrée. Xavier Mathieu prend le mégaphone. Quelqu'un lance : « Ils nous prennent pour des cons depuis 2007. » À la sous-préfecture, les vitres sont en train de céder. Au siège CGT-Métallurgie, on regarde les images en boucle, sans rien dire."
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'pragmatique', text: '50 000 € la tête, c\'est rare. Sécurise les familles avant que la direction ne se rétracte.' },
      { trait: 'rupture', text: 'L\'accord de 2007 a été signé. Ils l\'ont déchiré. Tu signes encore ?' },
      { trait: 'batisseur', text: 'Goodyear, Michelin, Continental — trois sites, une stratégie. Coordonne, ou perds isolé.' }
    ],
    quotes: [
      {
        text: "On a accepté le passage aux 40 heures pour sauver l'usine. Ils nous ont menti.",
        source: 'Xavier Mathieu, délégué CGT Continental Clairoix, mars 2009'
      },
      {
        text: "Ce qui s'est passé à Compiègne est inacceptable. La République ne peut tolérer la violence.",
        source: 'Brice Hortefeux, ministre de l\'Intérieur, avril 2009'
      }
    ],
    choices: [
      {
        id: 'continental-negocie-plan',
        text: 'Signer le plan social négocié à 50 000 € par tête.',
        intent: 'Sécuriser le départ, refermer la séquence.',
        theoryHint: "Stratégie de sortie négociée : on ne sauve pas l'usine, on sauve les familles.",
        effects: {
          resources: { caisse: 4, institution: 4, legitimite: 3, rapportDeForce: -3, confiance: -4 },
          actors: { etat: { trust: 3 }, adversaire: { trust: 4, patience: 4 }, base: { trust: -4 } }
        },
        consequence: {
          immediate:
            "Le plan est signé fin avril. 1 120 chèques partent, certains dans la semaine. Trois quarts de la base accepte, à reculons. Le site est fermé en septembre.",
          longterm:
            "Les anciens de Clairoix se retrouveront vingt ans plus tard, sans jamais revoir le bassin de Compiègne renaître industriellement. La signature reste un reproche permanent dans la fédération métallurgie."
        },
        traitShift: { pragmatique: 2, technocrate: 1 },
        flag: 'negocie-plan-social',
        ability: 'table'
      },
      {
        id: 'continental-sequestre',
        text: 'Durcir : occupation, séquestration des dirigeants, saccage assumé.',
        intent: 'Faire payer la trahison de l\'accord 2007.',
        theoryHint: "Stratégie de rupture : seule la médiatisation violente impose une renégociation.",
        effects: {
          resources: { rapportDeForce: 8, confiance: 7, legitimite: -5, caisse: -3 },
          actors: { etat: { trust: -7, pressure: 8, stance: 'dur' }, base: { trust: 7 }, opinion: { trust: -3 } }
        },
        consequence: {
          immediate:
            "Quatre cadres sont retenus six heures dans le bureau du DRH. La sous-préfecture de Compiègne est saccagée. Six militants sont mis en examen. La presse parle de « Continental », à la une, deux semaines.",
          longterm:
            "Mars 2010 : peines de prison avec sursis. Xavier Mathieu devient figure médiatique. La direction lâche 30 000 € de plus par tête. La trace politique reste : la séquestration patronale entre dans le répertoire syndical des années 2010."
        },
        traitShift: { rupture: 3, tribun: 2 },
        flag: 'sequestre-dirigeants',
        ability: 'manifestation'
      },
      {
        id: 'continental-coordination-pneus',
        text: 'Ouvrir une coordination Continental-Goodyear-Michelin.',
        intent: 'Construire une bataille de filière.',
        theoryHint: "Stratégie de filière : transformer trois fermetures isolées en lutte de secteur.",
        effects: {
          resources: { institution: 6, confiance: 6, rapportDeForce: 4, legitimite: 3, caisse: -3 },
          actors: { adversaire: { trust: -3, patience: -4 }, base: { trust: 6 }, opinion: { trust: 4 } }
        },
        consequence: {
          immediate:
            "Trois assemblées intersites se tiennent à Compiègne, Amiens-Nord, Clermont-Ferrand. La fédération CGT-Caoutchouc relaie. Le ministère reçoit la coordination en juin.",
          longterm:
            "La coordination ne sauve aucun des trois sites — Continental ferme en 2009, Goodyear en 2014, Michelin réduit en 2015. Mais elle pose les bases organisationnelles qu'on retrouvera pour Florange, Whirlpool, Goodyear : penser fermeture comme bataille politique nationale, pas comme drame local."
        },
        traitShift: { batisseur: 2, tribun: 1 },
        flag: 'coordination-pneus',
        ability: 'congres'
      }
    ]
  },
  {
    id: 'florange-2013',
    turn: 64,
    date: '6 octobre 2012 — 30 avril 2013',
    era: 'hollande',
    title: 'Florange',
    subtitle: 'Les hauts fourneaux, Mittal, Hollande, et un délégué CFDT',
    mood: 'grave',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Le 1er octobre 2011, ArcelorMittal annonce la mise en sommeil des hauts fourneaux de Florange (Moselle). Le candidat Hollande s'engage en février 2012 sur le site : il fera voter une loi obligeant à céder un site rentable refusé à un repreneur. Élu, il négocie en novembre 2012 avec Lakshmi Mittal — sans nationalisation. Les hauts fourneaux sont définitivement arrêtés en avril 2013. Édouard Martin, délégué CFDT, devient le visage syndical de la lutte. La CGT-Métallurgie reste sur une ligne plus dure. La loi Florange du 29 mars 2014 tente de codifier l'engagement présidentiel — elle restera largement symbolique.",
    setup: {
      reflechi:
        "L'option nationalisation est sur la table — Montebourg la défend, Hollande recule. Trois lignes possibles côté syndical : alliance interconfédérale CGT-CFDT pour faire bloc politique ; ligne médiatique Edouard Martin (CFDT) qui parle aux caméras et au pouvoir ; occupation longue durée pour faire trancher par la rue.",
      compulsif:
        "Sur le piquet, les hauts fourneaux sont éteints depuis octobre. Édouard Martin parle France-Inter à 8h20. Au siège fédéral CGT, on lit son interview en silence — sa voix est claire, mais elle parle au pouvoir, et on s'en méfie. À l'Élysée, Hollande lit la note de Montebourg. Il ne prendra pas la nationalisation."
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'tribun', text: 'Edouard Martin parle bien. Trop bien. Méfie-toi des belles voix qui ne dérangent personne.' },
      { trait: 'pragmatique', text: 'Une intersyndicale CGT-CFDT à Florange, c\'est un précédent. Ne le casse pas pour la pureté.' },
      { trait: 'rupture', text: 'L\'occupation, c\'est la dernière langue qui force le pouvoir à parler vrai.' }
    ],
    quotes: [
      {
        text: "Quand un grand groupe ne voudra plus d'un site rentable, nous obligerons ce grand groupe à céder ce site à un repreneur.",
        source: 'François Hollande, candidat à la présidence, Florange, 24 février 2012'
      },
      {
        text: "On ne peut pas accepter que des décisions financières condamnent des bassins entiers. Nous ne lâcherons pas Florange.",
        source: 'Édouard Martin, délégué CFDT ArcelorMittal Florange, novembre 2012'
      }
    ],
    choices: [
      {
        id: 'florange-interconf',
        text: 'Construire une intersyndicale CGT-CFDT pour peser sur l\'Élysée.',
        intent: 'Faire bloc syndical malgré les divergences.',
        theoryHint: "Stratégie de coalition : sortir d'une habitude de divergence pour gagner un rapport de force politique.",
        effects: {
          resources: { institution: 6, legitimite: 6, confiance: 4, rapportDeForce: 3, caisse: -3 },
          actors: { etat: { trust: 4, pressure: 5 }, base: { trust: 5 }, opinion: { trust: 5 } }
        },
        consequence: {
          immediate:
            "L'intersyndicale tient, fragile, jusqu'à la décision de novembre. Hollande reçoit ensemble Martin et le délégué CGT. La nationalisation est refusée — mais la concertation existe.",
          longterm:
            "L'expérience Florange laisse une dette : la CGT-Métallurgie acceptera plus facilement les fronts unitaires entre 2013 et 2017. Mais le site ferme. La question reste : un front uni qui perd, vaut-il un front divisé qui perd ?"
        },
        traitShift: { batisseur: 2, pragmatique: 1 },
        flag: 'florange-interconf',
        ability: 'congres'
      },
      {
        id: 'florange-mediatique',
        text: 'Confier à Édouard Martin la ligne médiatique nationale.',
        intent: 'Faire entrer la lutte dans le récit présidentiel.',
        theoryHint: "Stratégie de visibilité : l'écho médiatique transforme un conflit local en sujet politique.",
        effects: {
          resources: { legitimite: 7, confiance: 2, rapportDeForce: 2, institution: 3 },
          actors: { etat: { trust: 3 }, opinion: { trust: 7 }, base: { trust: -1 } }
        },
        consequence: {
          immediate:
            "Édouard Martin est sur tous les plateaux pendant six mois. Sa parole atteint l'Élysée. La nationalisation est étudiée puis écartée. L'image syndicale gagne en respectabilité, peut-être trop.",
          longterm:
            "Édouard Martin sera élu eurodéputé PS en 2014. Une partie de la base CGT y verra une démonstration : « la médiatisation finit toujours par embourgeoiser ». La leçon nourrira la défiance envers les figures syndicales médiatiques pour une décennie."
        },
        traitShift: { tribun: 3, pragmatique: 1 },
        flag: 'florange-mediatique',
        ability: 'presse'
      },
      {
        id: 'florange-occupation-longue',
        text: 'Tenir l\'occupation des hauts fourneaux jusqu\'à arbitrage présidentiel.',
        intent: 'Forcer la décision politique par la durée.',
        theoryHint: "Stratégie d'usure : l'occupation rend le maintien du statu quo politiquement insoutenable.",
        effects: {
          resources: { rapportDeForce: 8, confiance: 6, legitimite: -2, caisse: -6 },
          actors: { etat: { trust: -4, pressure: 7 }, adversaire: { trust: -5, patience: -5 }, base: { trust: 7 } }
        },
        consequence: {
          immediate:
            "L'occupation tient sept mois. Les hauts fourneaux restent éteints. Hollande arbitre en novembre 2012 sans nationaliser. La fatigue militante est lourde — le piquet se vide en avril 2013.",
          longterm:
            "L'occupation longue laisse une trace : la loi Florange du 29 mars 2014 codifie partiellement l'engagement présidentiel. La loi sera largement décorative. Mais le souvenir reste : on a tenu sept mois."
        },
        traitShift: { rupture: 2, batisseur: 1 },
        flag: 'occupation-longue',
        ability: 'manifestation'
      }
    ]
  },
  {
    id: 'whirlpool-amiens-2017',
    turn: 70,
    date: '26 avril 2017',
    era: 'macron_i',
    title: 'Whirlpool Amiens',
    subtitle: 'Macron sur le parking, Le Pen aussi',
    mood: 'tendu',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "En janvier 2017, Whirlpool annonce la fermeture de son site amiénois — 290 salariés, sèche-linge délocalisés en Pologne. Le 26 avril 2017, entre les deux tours de la présidentielle, Marine Le Pen se présente sur le parking de l'usine et serre des mains. Quelques heures plus tard, Emmanuel Macron arrive et discute pendant une heure avec les salariés. Une scène politique majeure de la campagne. Un an plus tard, Nicolas Decayeux reprend le site avec promesse d'embauche partielle. La reprise échoue — mise en redressement en 2019, liquidation en 2020.",
    setup: {
      reflechi:
        "Trois lignes traversent le piquet : accepter la reprise par WN (Nicolas Decayeux) pour sauver une partie des emplois ; durcir contre la reprise (CGT) parce qu'elle reproduit la précarité ; médiatiser sans accepter (CFDT) pour garder la pression. La visite Macron-Le Pen complique : on est devenu un théâtre national.",
      compulsif:
        "Le parking d'Amiens, 16h. Marine Le Pen part. Macron arrive en costume sombre. Les caméras tournent. Une déléguée CGT lui dit : « Vous êtes le candidat des riches, qu'est-ce que vous venez faire ici ? » Macron répond longuement. Le journal de 20h ouvre dessus. Le piquet reste seul à 22h."
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'pragmatique', text: 'WN propose 220 embauches sur 290. Ce n\'est pas une victoire, c\'est une survie. Prends-la.' },
      { trait: 'rupture', text: 'WN, c\'est le même salaire en moins, le même travail en pire. Refuse, ou tu valides.' },
      { trait: 'tribun', text: 'Le pays nous regarde. Joue le micro, joue la durée. Ne signe pas avant l\'élection.' }
    ],
    quotes: [
      {
        text: "Vous croyez que je vais venir vous serrer la main et repartir ? Non, je vais discuter avec vous tant que vous voudrez.",
        source: 'Emmanuel Macron, candidat à la présidence, parking Whirlpool Amiens, 26 avril 2017'
      },
      {
        text: "On a vu défiler beaucoup de candidats. Aucun n'a empêché que l'usine ferme.",
        source: 'Patrice Sinoquet, délégué CGT Whirlpool Amiens, mai 2017'
      }
    ],
    choices: [
      {
        id: 'whirlpool-accepte',
        text: 'Accepter le projet de reprise WN — sauver les emplois récupérables.',
        intent: 'Choix de survie collective.',
        theoryHint: "Stratégie de sauvetage partiel : 220 emplois sauvés valent mieux qu'un refus pur.",
        effects: {
          resources: { caisse: 4, institution: 5, legitimite: 3, confiance: -4, rapportDeForce: -3 },
          actors: { etat: { trust: 4 }, adversaire: { trust: 4 }, base: { trust: -3 } }
        },
        consequence: {
          immediate:
            "La CFDT signe la reprise WN en juin 2018. 220 salariés Whirlpool sont rembauchés sur le site, à des conditions dégradées. La CGT signe le préavis de grève le même mois.",
          longterm:
            "WN dépose le bilan en mai 2019, redressement judiciaire. Liquidation en 2020. Les anciens de Whirlpool perdent leur emploi une seconde fois. La leçon : la reprise précaire vaut parfois moins que la fermeture nette. Beaud notera dans ses entretiens : « ils ont accepté pour ne pas mourir, ils sont morts deux fois »."
        },
        traitShift: { pragmatique: 2 },
        flag: 'whirlpool-accepte',
        ability: 'table'
      },
      {
        id: 'whirlpool-durcit',
        text: 'Durcir contre la reprise — refuser le projet WN.',
        intent: 'Refuser la précarité comme issue.',
        theoryHint: "Stratégie de cohérence : ne pas valider une issue qui transforme les salariés en variable d'ajustement.",
        effects: {
          resources: { rapportDeForce: 6, confiance: 6, legitimite: -3, caisse: -4 },
          actors: { etat: { trust: -4, pressure: 5 }, adversaire: { trust: -3 }, base: { trust: 5 } }
        },
        consequence: {
          immediate:
            "La CGT obtient une indemnité supra-légale et le départ négocié de 70 salariés en formation longue. La reprise se fait sans elle. Le piquet est levé à l'automne 2018.",
          longterm:
            "Les 70 partis en formation s'en sortent à 60% selon une enquête Pôle emploi de 2020. La CGT garde sa cohérence — et le bassin amiénois retient qu'elle n'a pas signé. Quand WN ferme en 2020, la lecture syndicale est tranchée : « on l'avait dit »."
        },
        traitShift: { rupture: 2, tribun: 1 },
        flag: 'whirlpool-durcit',
        ability: 'manifestation'
      },
      {
        id: 'whirlpool-mediatise',
        text: 'Médiatiser sans signer — garder la pression jusqu\'au bout.',
        intent: 'Faire de la fermeture un sujet présidentiel permanent.',
        theoryHint: "Stratégie de visibilité tendue : ni signer ni rompre, peser par la durée médiatique.",
        effects: {
          resources: { legitimite: 5, rapportDeForce: 3, confiance: 3, institution: 2 },
          actors: { etat: { trust: -2, pressure: 4 }, opinion: { trust: 6 }, base: { trust: 3 } }
        },
        consequence: {
          immediate:
            "La CFDT-Whirlpool tient une ligne médiatique dense pendant huit mois. Macron reçoit deux fois la délégation à l'Élysée. La reprise WN se fait avec un suivi présidentiel direct.",
          longterm:
            "La médiatisation a obtenu un suivi politique exceptionnel. Elle n'a pas empêché l'échec de la reprise en 2020. Mais elle a posé un précédent : la fermeture industrielle reste un sujet de Premier ministre, pas de préfet. Macron II maintiendra ce niveau d'attention."
        },
        traitShift: { tribun: 2, pragmatique: 1 },
        flag: 'whirlpool-mediatise',
        ability: 'presse'
      }
    ]
  },
  {
    id: 'goodyear-amiens-nord-2019',
    turn: 73,
    date: '31 janvier 2019',
    era: 'macron_i',
    title: 'Goodyear Amiens-Nord',
    subtitle: 'La cassation, et après ?',
    mood: 'melancolique',
    premium: true,
    campFilter: 'salarie',
    historicalContext:
      "Goodyear Amiens-Nord ferme en 2014 — 1 173 emplois. En janvier 2014, huit délégués CGT (« les Goodyear ») séquestrent deux cadres pendant trente heures. Procès en mai 2014, condamnations à 24 mois de prison dont 9 fermes — peine sans précédent depuis 1968 pour ce type d'action. Cour d'appel d'Amiens en 2017 : peines confirmées mais avec sursis. Cour de cassation, 26 septembre 2018 : cassation partielle, renvoi à Douai. En janvier 2019, après cinq ans de procédure, les Goodyear envisagent un dernier recours en révision. Le site est partiellement repris (logistique, distribution) mais ne refera plus de pneus.",
    setup: {
      reflechi:
        "La séquence dure depuis 2014. La défense juridique a tenu — peines réduites au sursis. La question est : que reste-t-il à faire ? Trois options : un dernier recours en révision pour blanchir les noms ; un repli politique en s'inscrivant dans les organisations PCF / France Insoumise pour porter la mémoire ; une reconversion concrète, en transformant la coopérative de défense en outil de formation et reprise.",
      compulsif:
        "Mickaël Wamen, ancien délégué Goodyear, regarde l'arrêt de cassation depuis cinq mois. Au local CGT-Caoutchouc d'Amiens-Nord, il y a moins de monde qu'en 2014. Le site a été cédé. Personne ne refera de pneus ici. La question n'est plus de gagner le procès. La question est : comment continue-t-on à exister ?"
    },
    actors: ['base', 'etat', 'opinion'],
    voices: [
      { trait: 'tribun', text: 'Un recours en révision, c\'est la mémoire. Ce qu\'on grave dans la jurisprudence dure plus que les indemnités.' },
      { trait: 'rupture', text: 'Le PCF, la France Insoumise — on porte la voix dans les institutions politiques, ou on se tait.' },
      { trait: 'batisseur', text: 'Une reconversion-formation, c\'est ce qui transforme un échec industriel en outil syndical durable.' }
    ],
    quotes: [
      {
        text: "On nous a condamnés pour avoir défendu nos emplois. La justice a fini par le reconnaître. Mais Goodyear ne refera plus de pneus à Amiens.",
        source: 'Mickaël Wamen, ancien délégué CGT Goodyear, octobre 2018'
      },
      {
        text: "Ce que nous avons vécu, c'est l'épuisement organisé d'un bassin industriel par une multinationale.",
        source: 'Reynald Jurek, délégué CGT Goodyear Amiens-Nord, mai 2014'
      }
    ],
    choices: [
      {
        id: 'goodyear-recours-revision',
        text: 'Engager un dernier recours en révision pour blanchir les huit Goodyear.',
        intent: 'Boucler la séquence judiciaire par la mémoire.',
        theoryHint: "Stratégie contentieuse mémorielle : la jurisprudence est un texte qui dure plus longtemps que la lutte.",
        effects: {
          resources: { legitimite: 6, institution: 4, caisse: -3 },
          actors: { etat: { trust: -2 }, opinion: { trust: 4 }, base: { trust: 3 } }
        },
        consequence: {
          immediate:
            "Le recours est déposé en mai 2019. La Chambre criminelle l'examine en 2020. La relaxe partielle est confirmée — les peines de prison ferme sont définitivement effacées du casier judiciaire de quatre des huit Goodyear.",
          longterm:
            "La jurisprudence Goodyear sera citée dans les défenses syndicales pendant quinze ans. La séquestration n'est plus traitée automatiquement comme crime. Le bassin Amiens-Nord, lui, ne se reconstitue pas — mais les noms sont blanchis."
        },
        traitShift: { technocrate: 2, tribun: 1 },
        flag: 'goodyear-recours',
        ability: 'delegation'
      },
      {
        id: 'goodyear-repli-politique',
        text: 'Investir le PCF / France Insoumise pour porter la mémoire.',
        intent: 'Transformer la lutte en présence politique.',
        theoryHint: "Stratégie de relais partidaire : quand le syndicat ne peut plus, le parti porte le récit.",
        effects: {
          resources: { legitimite: 4, rapportDeForce: 2, confiance: -2, caisse: -2 },
          actors: { etat: { trust: -3 }, opinion: { trust: 3 }, base: { trust: -2 } }
        },
        consequence: {
          immediate:
            "Mickaël Wamen rejoint la France Insoumise. Il sera candidat aux législatives en 2022. Le local CGT-Caoutchouc d'Amiens-Nord ferme en 2020. La continuité passe par les listes électorales.",
          longterm:
            "Le repli politique préserve le récit Goodyear, mais le coupe de l'usine — il devient un thème de campagne, pas un outil de mobilisation. Le débat sur l'autonomie syndicale (Charte d'Amiens 1906) se rejoue cent treize ans plus tard, dans la même ville. Beaud notera : « le syndicalisme ouvrier survit comme mémoire politique, pas comme outil collectif »."
        },
        traitShift: { tribun: 2, rupture: 1 },
        flag: 'goodyear-politique',
        ability: 'meeting'
      },
      {
        id: 'goodyear-reconversion',
        text: 'Transformer la caisse de défense en coopérative de reconversion-formation.',
        intent: 'Tirer un outil syndical durable de la défaite industrielle.',
        theoryHint: "Stratégie de capitalisation : la défaite industrielle devient capital social et formationnel.",
        effects: {
          resources: { institution: 7, confiance: 5, legitimite: 4, caisse: -4 },
          actors: { etat: { trust: 2 }, base: { trust: 5, patience: 5 }, opinion: { trust: 3 } }
        },
        consequence: {
          immediate:
            "La caisse de défense est requalifiée en association de formation Goodyear-Solidarité. 80 anciens passent par les modules CFDT-Métallurgie en 2019-2020. Trois quarts retrouvent un emploi qualifié.",
          longterm:
            "L'association Goodyear-Solidarité forme encore des délégués en 2025. Elle devient un référent Hauts-de-France de la reconversion industrielle ouvrière. Le modèle inspire d'autres bassins (Continental, Bridgestone). La leçon est posée : la défaite industrielle ne tue le syndicalisme que si elle reste racontée comme défaite — racontée comme école, elle se prolonge."
        },
        traitShift: { batisseur: 3, pragmatique: 1 },
        flag: 'goodyear-reconversion',
        ability: 'tresorerie'
      }
    ]
  }
];
