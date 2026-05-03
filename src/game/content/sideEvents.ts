/* ============================================================
   Paritas — quêtes secondaires & rencontres diégétiques (V3)
   ============================================================
   Petits vignettes interactives qui se glissent entre deux
   scénarios principaux pour donner de la chair au camp joué.

   Règles d'écriture :
   - Très court (setup ≤ 4 lignes, choix ≤ 1 phrase)
   - Historiquement situé (un détail d'époque qui ancre)
   - Test de caractère, pas test stratégique : la décision
     révèle qui tu es plus qu'elle ne change la partie
   - Effets modérés (caisse ±5, confiance ±4, etc.) — pas
     d'événement game-changing, juste du grain
   - Au moins un choix avec failProbability pour le sel ludique
   ============================================================ */

import type { SideEvent } from '../types';

export const SIDE_EVENTS: SideEvent[] = [

  /* ============================================================
     SALARIÉ — événements syndicaux
     ============================================================ */

  {
    id: 'sergent-de-ville-1840',
    camp: 'salarie',
    eras: ['xixe'],
    weight: 2,
    title: 'Le sergent de ville',
    subtitle: 'Place de Grève, un dimanche d\'hiver',
    setup:
      `Un sergent de ville barre la place avec quatre hommes. Le meeting est interdit, dit-il, ordre du préfet. Mais sa moustache tremble, il a la solde en retard depuis trois mois. Il te regarde, te jauge. Une voix te chuchote à l'oreille : « Deux livres pour lui, une livre pour chacun de ses hommes, et la place est à toi. »`,
    choices: [
      {
        id: 'corrompre',
        text: 'Glisser six livres dans sa main et tenir le meeting.',
        intent: 'La corruption tranquille — efficace, sale.',
        effects: {
          resources: { caisse: -6, rapportDeForce: +6, confiance: +4 },
          actors: { base: { trust: +4 }, etat: { trust: -2 } }
        },
        outcome:
          'Le sergent empoche, fait demi-tour avec ses hommes. Le meeting tient deux heures. Personne n\'en parlera, c\'est entendu — mais tu sais désormais que le préfet a un prix, et que ses sergents ont faim.',
        traitShift: { pragmatique: +2, paternaliste: +1 },
        flag: 'corrompu-prefecture'
      },
      {
        id: 'la-police-avec-nous',
        text: 'Lever le poing et crier : « La police avec nous ! »',
        intent: 'Le pari fraternel — il bascule, ou tu te fais embarquer.',
        failProbability: 0.55,
        effects: {
          resources: { rapportDeForce: +14, confiance: +12, legitimite: +6 },
          actors: { base: { trust: +12, pressure: +8 }, etat: { trust: -6 } }
        },
        outcome:
          'Le sergent reste figé trois secondes. Puis il pose son sabre dans la neige et serre la main de l\'organisateur. Ses hommes suivent. Le meeting devient cortège, le cortège devient légende — on en parlera dans les ateliers pendant un mois.',
        failOutcome:
          'Le sergent dégaine. Trois manifestants au sol, toi à la geôle pour vingt-quatre heures. La caisse paye la caution. Au sortir, la base te trouve courageux mais imprudent.',
        failEffects: {
          resources: { caisse: -10, confiance: -3, rapportDeForce: -4 },
          actors: { base: { trust: -2 }, etat: { trust: -8, stance: 'dur' } }
        },
        traitShift: { tribun: +3, rupture: +1 },
        flag: 'police-avec-nous'
      },
      {
        id: 'annuler',
        text: 'Annuler, recoller au mur la nuit prochaine.',
        intent: 'La prudence — le combat n\'est pas pour ce jour.',
        effects: {
          resources: { confiance: -4, rapportDeForce: -2 },
          actors: { base: { trust: -3, patience: -3 } }
        },
        outcome:
          'Vous repliez. Les ouvriers présents s\'éparpillent dans le brouillard, déçus. Cette nuit, vous collez deux cents tracts — mais l\'élan du dimanche est perdu.',
        traitShift: { technocrate: +1 }
      }
    ]
  },

  {
    id: 'talent-trahit-marseille',
    camp: 'salarie',
    fromTurn: 12,
    weight: 1.5,
    requiresTrait: undefined,
    title: 'Désertion à Marseille',
    subtitle: 'Une lettre arrive du Sud',
    setup:
      `Pierre Caillou — un de tes meilleurs talents, formé à l'École syndicale, deux ans de tracts et de meetings — t'écrit qu'il a accepté un poste de contremaître au chantier naval de La Ciotat. « Le salaire est trois fois le tien. J'ai trois enfants. Je ne crois plus que ça change. »`,
    choices: [
      {
        id: 'retenir',
        text: 'Lui envoyer trente francs et la promesse d\'une place rémunérée à la fédération.',
        intent: 'Acheter sa fidélité — éthique floue, base solide.',
        effects: {
          resources: { caisse: -10, cohesionInterne: +6, confiance: +2 },
          actors: { base: { trust: +4 } }
        },
        outcome:
          'Caillou refuse l\'argent mais accepte la place. Il monte à Paris en novembre. Trois ans plus tard, il est secrétaire fédéral des dockers — l\'un des plus durs.',
        traitShift: { paternaliste: +2, pragmatique: +1 },
        flag: 'rachete-talent'
      },
      {
        id: 'denoncer',
        text: 'Le dénoncer dans le prochain bulletin syndical : « Un des nôtres a vendu sa carte. »',
        intent: 'L\'exemple par la honte — efficace en interne, dur sur l\'âme.',
        effects: {
          resources: { cohesionInterne: +4, confiance: -2, legitimite: -3 },
          actors: { base: { trust: -2, patience: +4 } }
        },
        outcome:
          'L\'article paraît. Caillou ne répondra jamais. À Marseille, il devient un patron dur, particulièrement dur avec les CGT. Ses ouvriers murmurent qu\'il a été syndicaliste, autrefois.',
        traitShift: { rupture: +2, tribun: +1 },
        flag: 'trahi-talent'
      },
      {
        id: 'silence',
        text: 'Lui répondre une lettre brève : « Bonne chance. Reviens quand tu voudras. »',
        intent: 'La porte ouverte — la dignité a son coût.',
        effects: {
          resources: { confiance: -1, cohesionInterne: -2 },
          actors: { base: { trust: +2 } }
        },
        outcome:
          'Caillou garde la lettre dans son portefeuille jusqu\'à sa mort en 1958. Il ne reviendra pas, mais il paiera sa cotisation par mandat-poste, anonymement, pendant vingt-deux ans.',
        traitShift: { batisseur: +2 }
      }
    ]
  },

  {
    id: 'imprimeur-clandestin',
    camp: 'salarie',
    eras: ['xixe', 'belle_epoque'],
    weight: 1,
    title: 'L\'imprimeur clandestin',
    subtitle: 'Atelier rue Mouffetard, dimanche 23h',
    setup:
      `Honoré Bertrand, l'imprimeur de la Bourse du Travail, te reçoit derrière sa devanture éteinte. Il a triplé son prix pour les prochains tracts. Sa main tremble. « Ma femme est malade. Si tu refuses, je passe au commissaire demain. Je connais trois noms. »`,
    choices: [
      {
        id: 'payer',
        text: 'Payer le triple, sans un mot.',
        intent: 'Le silence par la caisse — la solidarité a ses échelons.',
        effects: { resources: { caisse: -8, cohesionInterne: +2 } },
        outcome:
          'Bertrand prend l\'argent, baisse les yeux, imprime. Il ne te regardera plus jamais en face. Sa femme guérira au printemps. Il continuera à imprimer pour vous, mais à la moitié du prix d\'avant.',
        traitShift: { pragmatique: +2 }
      },
      {
        id: 'intimider',
        text: 'L\'intimider — deux camarades viennent passer la nuit dans son atelier.',
        intent: 'La discipline interne — efficace, dérangeant.',
        failProbability: 0.25,
        effects: {
          resources: { rapportDeForce: +4, cohesionInterne: +6, legitimite: -4 }
        },
        outcome:
          'Au matin, Bertrand a compris. Il imprime au prix d\'avant, plus jamais ne menace. Les deux camarades reviendront chaque semaine, comme apprentis.',
        failOutcome:
          'Bertrand parle quand même. Trois militants arrêtés, dont deux que tu connaissais bien. La rue Mouffetard sera surveillée pendant six mois.',
        failEffects: {
          resources: { caisse: -6, cohesionInterne: -8, legitimite: -8 },
          actors: { base: { trust: -8 }, etat: { trust: -6, stance: 'dur' } }
        },
        traitShift: { rupture: +2 }
      },
      {
        id: 'changer-imprimeur',
        text: 'Refuser et chercher un autre imprimeur, en assumant le risque.',
        intent: 'La dignité comptable — perte de trois jours, gain en honneur.',
        effects: {
          resources: { caisse: -3, rapportDeForce: -2, legitimite: +4 }
        },
        outcome:
          'Tu trouves Mathilde, typographe libertaire, qui imprime au coût. Bertrand parle au commissaire mais ses noms sont déjà éventés. Personne n\'est arrêté. Mathilde deviendra une plume essentielle du mouvement.',
        traitShift: { batisseur: +2, tribun: +1 }
      }
    ]
  },

  {
    id: 'greve-sauvage-section',
    camp: 'salarie',
    fromTurn: 18,
    weight: 1.5,
    title: 'Grève sauvage en Lorraine',
    subtitle: 'Un télégramme de Hayange',
    setup:
      `Section régionale de Hayange : 800 sidérurgistes en grève depuis l'aube, sans préavis, sans consultation. Le secrétaire local crie au téléphone : « On a voté à main levée à 6h. Le patron a annoncé 40 licenciements. Vous êtes avec nous ou pas ? » La presse appelle déjà. »`,
    choices: [
      {
        id: 'rejoindre',
        text: 'Annoncer publiquement le soutien fédéral et monter à Hayange dans l\'heure.',
        intent: 'Le geste solidaire — coûteux mais cohérent.',
        effects: {
          resources: { caisse: -8, rapportDeForce: +10, confiance: +8, legitimite: +4 },
          actors: { base: { trust: +12 }, adversaire: { trust: -6, stance: 'dur' } }
        },
        outcome:
          'Tu prends le train de 14h. À Hayange, tu parles deux heures sur la place de l\'Hôtel-de-ville. Les licenciements seront annulés, mais le patron ne te le pardonnera jamais. La presse parle de « victoire syndicale ».',
        traitShift: { tribun: +3, rupture: +1 }
      },
      {
        id: 'desavouer',
        text: 'Désavouer publiquement la grève sauvage : « Nous ne soutenons pas l\'irresponsabilité. »',
        intent: 'La discipline d\'appareil — protège la signature, écorche la base.',
        effects: {
          resources: { legitimite: +6, confiance: -10, cohesionInterne: -12 },
          actors: { base: { trust: -15, patience: -10 }, etat: { trust: +6 } }
        },
        outcome:
          'Le communiqué tombe à 16h. À Hayange, la section vote la rupture avec la fédération à 22h. Trois cents cartes seront déchirées dans le mois. La presse appelle ça « le pragmatisme syndical ».',
        traitShift: { technocrate: +2 },
        flag: 'desavoue-section'
      },
      {
        id: 'canaliser',
        text: 'Téléphoner discrètement au patron pour négocier une sortie de crise sans soutien public.',
        intent: 'La diplomatie occulte — efficace si tu l\'assumes.',
        failProbability: 0.30,
        effects: {
          resources: { rapportDeForce: +4, legitimite: +2, confiance: -2 }
        },
        outcome:
          'Trois heures de négociation par téléphone. 25 licenciements au lieu de 40, plan de reclassement, indemnités. La grève s\'éteint sans drapeau. La section t\'en voudra de leur avoir volé leur victoire.',
        failOutcome:
          'Le patron refuse. Le lendemain, ta démarche fuite dans la presse syndicale. Hayange t\'accuse d\'avoir négocié dans leur dos. La fédération entre en crise.',
        failEffects: {
          resources: { confiance: -10, cohesionInterne: -8, legitimite: -6 },
          actors: { base: { trust: -10 } }
        },
        traitShift: { pragmatique: +2 }
      }
    ]
  },

  /* ============================================================
     PATRON — événements CGPF / patronat
     ============================================================ */

  {
    id: 'prefet-recoit',
    camp: 'patron',
    eras: ['xixe', 'belle_epoque', 'entre_deux_guerres'],
    weight: 1.5,
    title: 'Le préfet vous reçoit',
    subtitle: 'Préfecture du département, 11h',
    setup:
      `Le préfet vous accueille personnellement, propose un porto. Il a, dit-il, quelques renseignements sur les meneurs CGT du département — noms, adresses, antécédents judiciaires. « Mon œuvre charitable manque de fonds, vous savez. Disons : trois mille francs pour la liste, et le procureur se montrera attentif aux plaintes que vous voudrez déposer. »`,
    choices: [
      {
        id: 'payer-prefet',
        text: 'Glisser une enveloppe à la fin de l\'entretien, prendre la liste.',
        intent: 'L\'arrangement de classe — discret, efficace, irréversible.',
        effects: {
          resources: { caisse: -10, rapportDeForce: +8, legitimite: -4 },
          actors: { base: { trust: -6 }, adversaire: { trust: +6 }, etat: { trust: +8 } }
        },
        outcome:
          'Trois meneurs licenciés dans la quinzaine, dont le secrétaire de section. La grève se déclenche pourtant — mais sans tête. Trois mois plus tard, le préfet vous demande discrètement « un nouveau geste pour l\'œuvre ».',
        traitShift: { paternaliste: +2, pragmatique: +1 },
        flag: 'paye-prefet'
      },
      {
        id: 'refuser-dignement',
        text: 'Décliner avec courtoisie. « Je préfère m\'en remettre au droit. »',
        intent: 'La dignité bourgeoise — ça se paie au comptant.',
        effects: {
          resources: { legitimite: +6, rapportDeForce: -2 },
          actors: { etat: { trust: -4 } }
        },
        outcome:
          'Le préfet sourit, change de sujet. Mais la prochaine fois qu\'il vous faudra une autorisation administrative, elle traînera six semaines. La presse libérale, elle, vous citera comme « patron de tradition républicaine ».',
        traitShift: { batisseur: +2 }
      },
      {
        id: 'payer-documenter',
        text: 'Payer, mais faire signer un reçu par le secrétaire général de la préfecture.',
        intent: 'Le chantage différé — risqué, redoutable.',
        failProbability: 0.40,
        effects: {
          resources: { caisse: -10, rapportDeForce: +8, legitimite: -2 }
        },
        outcome:
          'Le secrétaire général signe sans poser de questions. Le reçu repose dans votre coffre-fort. Dans dix ans, quand un sous-préfet voudra fermer un de vos sites, vous le ressortirez. Le département vous craint désormais.',
        failOutcome:
          'Le secrétaire général refuse de signer, prévient le préfet. Vous êtes éconduit, et l\'arrangement remonte au ministère. Aucun procureur ne vous écoutera plus avant deux ans.',
        failEffects: {
          resources: { legitimite: -10, rapportDeForce: -4 },
          actors: { etat: { trust: -12, stance: 'dur' } }
        },
        traitShift: { rupture: +2, technocrate: +2 }
      }
    ]
  },

  {
    id: 'contremaitre-reclame',
    camp: 'patron',
    fromTurn: 8,
    weight: 1.5,
    title: 'Le contremaître Vidal',
    subtitle: 'Atelier 4, lundi matin',
    setup:
      `Auguste Vidal, votre meilleur contremaître, vous attend dans le bureau directorial. Le chapeau à la main. « Trente ans de maison. Je vais à Lyon dimanche, on m\'offre une place de chef d\'atelier chez Berliet, vingt pour cent de plus. Je préférerais rester. Mais j\'ai dit à ma femme. »`,
    choices: [
      {
        id: 'augmenter',
        text: 'Aligner sur l\'offre de Berliet, lui serrer la main.',
        intent: 'Acheter la fidélité — la concurrence a un prix.',
        effects: {
          resources: { caisse: -6, cohesionInterne: +4 }
        },
        outcome:
          'Vidal pleure presque. Sa femme appelle à 14h pour vous remercier. Il restera douze ans de plus, formera trois générations de contremaîtres. Mais trois autres demandent leur augmentation dans la semaine.',
        traitShift: { paternaliste: +3 }
      },
      {
        id: 'retrograder',
        text: 'Le rétrograder à ouvrier qualifié sur-le-champ : « Tu choisis ou tu pars. »',
        intent: 'L\'humiliation comme discipline — efficace, glaçant.',
        effects: {
          resources: { caisse: +4, cohesionInterne: -10, rapportDeForce: +4 },
          actors: { base: { trust: -8, pressure: +6 } }
        },
        outcome:
          'Vidal accepte, livide. Le lendemain, il est à son ancien établi, casquette basse. Il restera six mois, puis disparaîtra sans préavis. L\'atelier vous craindra désormais — et vous haïra.',
        traitShift: { rupture: +2 }
      },
      {
        id: 'promouvoir-cadre',
        text: 'Le promouvoir cadre : bureau, retraite, voiture de fonction.',
        intent: 'L\'investissement de classe — fidélise, isole de l\'atelier.',
        effects: {
          resources: { caisse: -12, cohesionInterne: +8, legitimite: +4 },
          actors: { base: { trust: -2 } }
        },
        outcome:
          'Vidal devient « M. Vidal », costume gris, déjeuner au Cercle. Il quitte la cantine ouvrière. Les anciens compagnons le saluent encore, mais l\'écart est posé. Il vous sera fidèle jusqu\'à la mort.',
        traitShift: { batisseur: +2, paternaliste: +1 },
        flag: 'promu-vidal'
      }
    ]
  },

  {
    id: 'investisseur-britannique',
    camp: 'patron',
    fromTurn: 14,
    eras: ['belle_epoque', 'entre_deux_guerres', 'reconstruction', 'trente_glorieuses'],
    weight: 1,
    title: 'M. Whitfield à l\'Hôtel Crillon',
    subtitle: 'Suite 412, brunch dominical',
    setup:
      `M. Whitfield, banquier de la City, vous propose une participation. Trente pour cent du capital contre une injection qui doublerait votre trésorerie. Les conditions : un siège anglais au conseil, et la « réorganisation managériale conforme aux standards de Manchester ».`,
    choices: [
      {
        id: 'vendre-30',
        text: 'Signer. La modernisation passera avant la souveraineté.',
        intent: 'L\'ouverture au capital — gain immédiat, perte progressive.',
        effects: {
          resources: { caisse: +20, institution: +6, cohesionInterne: -6, legitimite: -4 }
        },
        outcome:
          'L\'argent arrive en six semaines. Whitfield envoie deux ingénieurs et un comptable. Vos chronométrages augmentent de 18%, vos coûts baissent de 12%. Mais à la première grève, le siège anglais exigera la fermeture du site.',
        traitShift: { technocrate: +3 },
        flag: 'capital-anglais'
      },
      {
        id: 'refuser-whitfield',
        text: 'Refuser poliment. « La famille tient à son indépendance. »',
        intent: 'La fierté patrimoniale — coûteuse, lisible.',
        effects: {
          resources: { caisse: -2, legitimite: +6, cohesionInterne: +4 }
        },
        outcome:
          'Whitfield comprend, repart. Vous resterez français, plus petit, plus libre. Vos chronométrages stagnent, mais vos ouvriers vous appellent encore « le patron ». Vidal a opiné en lisant la lettre de refus.',
        traitShift: { batisseur: +2, paternaliste: +1 }
      },
      {
        id: 'alliance-tech',
        text: 'Proposer une alliance technologique sans entrée au capital.',
        intent: 'L\'astuce diplomatique — risque réel d\'échec.',
        failProbability: 0.45,
        effects: {
          resources: { institution: +4, legitimite: +2 }
        },
        outcome:
          'Whitfield accepte un accord d\'échange de procédés contre redevance. Vos contremaîtres iront se former à Manchester, leurs ingénieurs viendront pour l\'inauguration de votre nouveau hall. Les coûts baissent de 6%, sans perte d\'indépendance.',
        failOutcome:
          'Whitfield éclate de rire. « Vous voulez le savoir-faire sans le capital ? Mon cher, ce n\'est pas la City, c\'est le Crédit Municipal. » Il reprend son chapeau et sort. La rumeur circulera : « Patron français refuse l\'or anglais. »',
        failEffects: {
          resources: { legitimite: -2 }
        },
        traitShift: { pragmatique: +2 }
      }
    ]
  },

  {
    id: 'employe-denonce',
    camp: 'patron',
    fromTurn: 10,
    weight: 1,
    title: 'Le mouchard volontaire',
    subtitle: 'Bureau directorial, soir',
    setup:
      `Émile Roux, ouvrier-monteur, frappe à la porte du directeur après l\'équipe. Casquette basse, voix tremblée. « Monsieur, le délégué CGT prépare une grève pour le 15. J\'ai tout entendu. Si vous me protégez, je vous donne les noms et la date. »`,
    choices: [
      {
        id: 'recompenser-promouvoir',
        text: 'Le remercier publiquement, le promouvoir chef d\'équipe à la prochaine vacance.',
        intent: 'L\'incitation visible — efficace pour démoraliser, lourde de conséquences.',
        effects: {
          resources: { caisse: -3, rapportDeForce: +6, cohesionInterne: -10, legitimite: -4 },
          actors: { base: { trust: -10, pressure: +6 }, adversaire: { trust: -8 } }
        },
        outcome:
          'Roux reçoit son galon le mardi. La grève du 15 est désamorcée — trois meneurs licenciés avant. Mais l\'atelier sait. Roux sera surnommé « la cravate » et ne mangera plus jamais à la cantine. Six mois plus tard, son outil sera saboté.',
        traitShift: { rupture: +2 },
        flag: 'protege-mouchard'
      },
      {
        id: 'refuser',
        text: 'Le congédier froidement : « Les méthodes de la dénonciation ne sont pas les miennes. »',
        intent: 'La morale de patron de tradition — coûteuse, propre.',
        effects: {
          resources: { legitimite: +8, rapportDeForce: -4 },
          actors: { base: { trust: +4 } }
        },
        outcome:
          'Roux s\'en va, mortifié. La grève du 15 a lieu : trois jours, finalement gérable. Le délégué CGT entendra parler de votre refus — il vous saluera désormais, sans plus.',
        traitShift: { batisseur: +2, paternaliste: +1 }
      },
      {
        id: 'recompenser-secret',
        text: 'Lui donner cinquante francs en main propre, lui demander de partir avant qu\'on le voie.',
        intent: 'La récompense invisible — efficace, malsaine, dissimulée.',
        effects: {
          resources: { caisse: -1, rapportDeForce: +6, cohesionInterne: -4 }
        },
        outcome:
          'Roux empoche, sort par l\'arrière. La grève est désamorcée sans qu\'on sache d\'où venait la fuite. Il reviendra trois fois dans les deux ans, à chaque fois un peu plus cher. Vous tenez un mouchard — qui vous tient aussi.',
        traitShift: { pragmatique: +2 },
        flag: 'mouchard-secret'
      }
    ]
  }
];

/** Retourne tous les événements compatibles avec l'état du joueur. */
export function compatibleSideEvents(opts: {
  camp: 'salarie' | 'patron';
  turn: number;
  era: import('../types').EraId;
  dominantTrait: import('../types').PlayerTrait;
  resources: import('../types').Resources;
  alreadyPlayedIds: Set<string>;
}): SideEvent[] {
  return SIDE_EVENTS.filter(ev => {
    if (opts.alreadyPlayedIds.has(ev.id)) return false;
    if (ev.camp && ev.camp !== opts.camp) return false;
    if (ev.fromTurn !== undefined && opts.turn < ev.fromTurn) return false;
    if (ev.toTurn !== undefined && opts.turn > ev.toTurn) return false;
    if (ev.eras && !ev.eras.includes(opts.era)) return false;
    if (ev.requiresTrait && ev.requiresTrait !== opts.dominantTrait) return false;
    if (ev.resourceCondition && !ev.resourceCondition(opts.resources)) return false;
    return true;
  });
}
