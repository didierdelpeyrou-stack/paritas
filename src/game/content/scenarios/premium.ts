import type { Scenario } from '../../types';

export const PREMIUM_SCENARIOS: Scenario[] = [
  {
    id: 'le-chapelier-1791',
    turn: 7,
    date: '14 juin 1791',
    era: 'revolution',
    title: 'La coalition interdite',
    subtitle: 'Loi Le Chapelier',
    mood: 'grave',
    premium: true,
    historicalContext:
      'La loi Le Chapelier interdit les corporations et toute coalition professionnelle. Pendant des décennies, l’action collective ouvrière sera repoussée vers la clandestinité, les secours mutuels et les sociétés discrètes.',
    setup: {
      reflechi:
        'L’Assemblée affirme la liberté individuelle contre les anciens corps. Mais en supprimant aussi les coalitions de travailleurs, elle rend presque impossible une parole collective sur le salaire, le temps et la dignité.',
      compulsif:
        'La salle applaudit la liberté. Dans les ateliers, le mot sonne creux. Chacun est libre, oui. Libre seul face au maître, au prix, à la faim.'
    },
    actors: ['base', 'etat', 'opinion'],
    voices: [
      { trait: 'rupture', text: 'S’ils interdisent la voix collective, il faudra apprendre à parler bas.' },
      { trait: 'batisseur', text: 'La solidarité survivra peut-être sous un autre nom.' }
    ],
    quotes: [{ text: 'Il n’y a plus de corporations dans l’État.', source: 'Esprit de la loi Le Chapelier, 1791' }],
    choices: [
      {
        id: 'chapelier-clandestin',
        text: 'Maintenir une société de secours discrète.',
        intent: 'Sauver le collectif sans provoquer la répression.',
        theoryHint: 'Quand l’association est interdite, la ressource clé devient la confiance interne.',
        effects: { resources: { confiance: 8, rapportDeForce: 4, legitimite: -3, caisse: -2 }, actors: { base: { trust: 8 }, etat: { trust: -8, stance: 'dur' } } },
        consequence: { immediate: 'Les réunions changent de lieu, de nom, parfois de langage. On parle de maladie, de veuvage, de caisse ; chacun comprend qu’il s’agit aussi de salaire et de dignité.', longterm: 'Cette mémoire clandestine nourrira les chambres syndicales du XIXe siècle.' },
        traitShift: { batisseur: 2, rupture: 1 }
      },
      {
        id: 'chapelier-respect-loi',
        text: 'Dissoudre les liens collectifs pour éviter les poursuites.',
        intent: 'Préserver les personnes au prix de l’organisation.',
        theoryHint: 'C’est une stratégie de moindre perte : tu protèges le court terme et affaiblis le long terme.',
        effects: { resources: { confiance: -10, institution: -5, santeSociale: -4, legitimite: 4 }, actors: { etat: { trust: 6 }, base: { trust: -12 } } },
        consequence: { immediate: 'La police ne vient pas. C’est presque pire : l’atelier devient silencieux. Les anciens compagnons évitent de se regarder quand le tarif baisse.' },
        traitShift: { pragmatique: 2, batisseur: -1 },
        flag: 'trahit-base'
      },
      {
        id: 'chapelier-pamphlet',
        text: 'Publier un texte sur la liberté sans fraternité.',
        intent: 'Déplacer la bataille vers l’opinion.',
        theoryHint: 'Cadrage : tu changes la manière dont le public nomme le problème.',
        effects: { resources: { legitimite: 7, rapportDeForce: 2, caisse: -3 }, actors: { opinion: { trust: 9 }, etat: { pressure: 6 } } },
        consequence: { immediate: 'Le texte circule, recopié à la main. Il ne change pas la loi, mais il donne aux humiliations quotidiennes une phrase qu’on peut retenir.' },
        traitShift: { tribun: 2 }
      }
    ]
  },
  {
    id: 'canuts-1831',
    turn: 10,
    date: '21 novembre 1831',
    era: 'xixe',
    title: 'Vivre en travaillant',
    subtitle: 'Révolte des canuts',
    mood: 'grave',
    premium: true,
    historicalContext:
      'À Lyon, les chefs d’atelier de la soie demandent un tarif minimum. Le refus des négociants déclenche une insurrection ouvrière majeure, souvent lue comme l’un des premiers grands soulèvements sociaux de l’Europe industrielle.',
    setup: {
      reflechi:
        'Le tarif minimum devait stabiliser le prix du travail. Son rejet transforme une négociation économique en crise politique.',
      compulsif:
        'La Croix-Rousse respire comme une forge. Dans la montée, on ne dit plus seulement “tarif”. On dit : vivre.'
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: [
      { trait: 'rupture', text: 'Le tarif n’existe que si quelqu’un accepte de le défendre.' },
      { trait: 'pragmatique', text: 'Un symbole peut mourir de faim avant de devenir une victoire.' }
    ],
    choices: [
      {
        id: 'canuts-tenir-tarif',
        text: 'Tenir le tarif minimum dans la rue.',
        intent: 'Transformer la négociation en rapport de force.',
        theoryHint: 'Jeu de la poule mouillée : si personne ne cède, le choc devient probable.',
        effects: { resources: { confiance: 12, rapportDeForce: 12, santeSociale: -14, legitimite: -3, caisse: -5 }, actors: { base: { trust: 15, pressure: 10 }, etat: { trust: -16, stance: 'dur' }, adversaire: { patience: -18 } } },
        consequence: { immediate: 'Les métiers s’arrêtent. Le drapeau noir apparaît. Pendant quelques heures, la ville comprend que le prix du travail n’est pas une abstraction.', longterm: 'Même réprimée, la révolte des canuts entre dans la mémoire ouvrière.' },
        traitShift: { rupture: 3, tribun: 1 },
        flag: 'epuise-mouvement'
      },
      {
        id: 'canuts-prefet',
        text: 'Chercher l’appui du préfet pour sanctuariser le tarif.',
        intent: 'Faire de l’État un garant provisoire.',
        theoryHint: 'Stratégie institutionnelle : tu cherches un tiers capable de rendre l’accord crédible.',
        effects: { resources: { institution: 8, legitimite: 5, rapportDeForce: -2 }, actors: { etat: { trust: 10 }, adversaire: { trust: -6 }, base: { patience: 6 } } },
        consequence: { immediate: 'Le préfet écoute. Il sait que la paix sociale vaut parfois un tarif. Mais Paris n’aime pas qu’une ville industrielle invente sa propre loi.' },
        traitShift: { batisseur: 2, technocrate: 1 }
      },
      {
        id: 'canuts-repli-mutuel',
        text: 'Replier le mouvement vers une caisse de solidarité.',
        intent: 'Préparer la prochaine bataille.',
        theoryHint: 'La ressource collective devient une assurance contre l’épuisement.',
        effects: { resources: { caisse: 8, confiance: 5, rapportDeForce: -4, institution: 4 }, actors: { base: { patience: 8 }, opinion: { trust: -2 } } },
        consequence: { immediate: 'Certains crient à la retraite. D’autres comprennent le calcul : une grève sans caisse est une flamme sans bois.' },
        traitShift: { pragmatique: 2, batisseur: 2 }
      }
    ]
  },
  {
    id: 'ollivier-1864',
    turn: 12,
    date: '25 mai 1864',
    era: 'xixe',
    title: 'Le délit qui tombe',
    subtitle: 'Loi Ollivier',
    mood: 'tendu',
    premium: true,
    historicalContext:
      'La loi Ollivier abroge le délit de coalition. La grève cesse d’être automatiquement pénale, mais l’organisation syndicale n’est pas encore reconnue.',
    setup: {
      reflechi: 'Une porte s’ouvre sans devenir un droit complet. Le conflit collectif entre dans une zone grise.',
      compulsif: 'La prison recule d’un pas. Elle n’a pas disparu. Elle attend au coin du texte.'
    },
    actors: ['base', 'etat', 'adversaire'],
    choices: [
      {
        id: 'ollivier-greve-limitee',
        text: 'Tester le nouveau cadre par une grève courte.',
        intent: 'Mesurer la marge réelle.',
        theoryHint: 'Expérimentation contrôlée : apprendre sans brûler toutes les ressources.',
        effects: { resources: { rapportDeForce: 8, confiance: 6, santeSociale: -4 }, actors: { base: { trust: 8 }, adversaire: { pressure: 8 }, etat: { pressure: 5 } } },
        consequence: { immediate: 'La grève dure deux jours. La police observe plus qu’elle ne frappe. L’atelier découvre que la peur a changé de forme.' },
        traitShift: { pragmatique: 2, rupture: 1 }
      },
      {
        id: 'ollivier-mutuelle',
        text: 'Fonder une caisse mutuelle avant d’affronter.',
        intent: 'Construire la durée avant le choc.',
        theoryHint: 'MESORE collective : meilleure solution de rechange si la négociation échoue.',
        effects: { resources: { caisse: 10, institution: 6, rapportDeForce: -2 }, actors: { base: { patience: 10, trust: 5 } } },
        consequence: { immediate: 'La caisse ne fait pas trembler les patrons. Pas encore. Mais le prochain refus se négociera avec quelques semaines de pain d’avance.' },
        traitShift: { batisseur: 3 },
        flag: 'cree-mutuelle-1864'
      },
      {
        id: 'ollivier-attendre',
        text: 'Attendre une vraie légalisation syndicale.',
        intent: 'Éviter la zone grise.',
        theoryHint: 'Aversion à la perte : parfois on surestime le coût d’un premier mouvement.',
        effects: { resources: { legitimite: 3, confiance: -6, rapportDeForce: -5 }, actors: { etat: { trust: 4 }, base: { trust: -8 } } },
        consequence: { immediate: 'Rien ne casse. Rien ne naît non plus. La base apprend que la prudence peut ressembler à une disparition.' },
        traitShift: { pragmatique: 1, tribun: -1 }
      }
    ]
  },
  {
    id: 'waldeck-1884',
    turn: 14,
    date: '21 mars 1884',
    era: 'xixe',
    title: 'Sortir de la clandestinité',
    subtitle: 'Loi Waldeck-Rousseau',
    mood: 'calme',
    premium: true,
    historicalContext:
      'La loi Waldeck-Rousseau autorise les syndicats professionnels. Elle transforme l’action ouvrière : on peut désormais durer, signer, administrer.',
    setup: {
      reflechi: 'Le syndicat légal change la nature du conflit : l’adversaire peut être reconnu, surveillé, parfois invité.',
      compulsif: 'Le local sent l’encre fraîche. Sur la porte, pour la première fois, le nom n’a plus besoin de se cacher.'
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    choices: [
      {
        id: 'waldeck-syndicat',
        text: 'Créer un syndicat professionnel ouvert.',
        intent: 'Transformer l’énergie militante en institution.',
        theoryHint: 'Passage du rapport de force ponctuel au capital institutionnel.',
        effects: { resources: { institution: 12, confiance: 8, legitimite: 7, caisse: -3 }, actors: { base: { trust: 10 }, etat: { trust: 6 }, adversaire: { trust: 2 } } },
        consequence: { immediate: 'On élit un bureau, on loue une salle, on tient un registre. La lutte cesse d’être seulement un cri : elle devient une adresse.', longterm: 'Les syndicats légaux rendront possibles les conventions collectives.' },
        traitShift: { batisseur: 3, technocrate: 1 },
        flag: 'cree-syndicat-1884'
      },
      {
        id: 'waldeck-action-directe',
        text: 'Utiliser le cadre légal pour préparer l’action directe.',
        intent: 'La loi comme abri, pas comme limite.',
        theoryHint: 'Théorie de l’agence : le mandat légal peut servir une stratégie plus dure que prévu.',
        effects: { resources: { rapportDeForce: 10, confiance: 7, institution: 3, legitimite: -4 }, actors: { adversaire: { trust: -10 }, etat: { pressure: 8 } } },
        consequence: { immediate: 'Le papier rassure la préfecture. Les réunions, elles, préparent autre chose : piquets, journaux, mots d’ordre.' },
        traitShift: { rupture: 3, tribun: 1 }
      },
      {
        id: 'waldeck-brancher-patrons',
        text: 'Inviter les employeurs à une chambre mixte.',
        intent: 'Faire reconnaître l’interlocuteur.',
        theoryHint: 'Jeu non nul : créer une table peut produire de la valeur pour les deux camps.',
        effects: { resources: { institution: 8, legitimite: 6, rapportDeForce: -3 }, actors: { adversaire: { trust: 8 }, base: { pressure: 5 }, etat: { trust: 5 } } },
        consequence: { immediate: 'Les militants murmurent. Pourtant, voir le patron s’asseoir face au registre a quelque chose d’inédit : il te reconnaît comme partie.' },
        traitShift: { pragmatique: 3 }
      }
    ]
  },
  {
    id: 'amiens-1906',
    turn: 16,
    date: '13 octobre 1906',
    era: 'belle_epoque',
    title: 'La Charte d’Amiens',
    subtitle: 'Indépendance syndicale',
    mood: 'tendu',
    premium: true,
    historicalContext:
      'Au congrès de la CGT, la Charte d’Amiens affirme l’indépendance du syndicalisme vis-à-vis des partis politiques et donne une place centrale à la grève générale.',
    setup: {
      reflechi: 'Le syndicat doit-il être un outil politique, un contre-pouvoir autonome, ou une institution de négociation ?',
      compulsif: 'Dans la salle, chaque mot arrache un avenir. Parti, syndicat, révolution, salaire : personne ne range les couteaux.'
    },
    actors: ['base', 'opinion', 'etat'],
    choices: [
      {
        id: 'amiens-independance',
        text: 'Voter l’indépendance syndicale stricte.',
        intent: 'Protéger le mandat de la base.',
        theoryHint: 'Théorie de l’agence : éviter que le représentant syndical ne devienne l’agent d’un parti.',
        effects: { resources: { confiance: 10, legitimite: 5, institution: 5 }, actors: { base: { trust: 12 }, etat: { trust: -3 } } },
        consequence: { immediate: 'La motion passe. Le syndicat parlera en son nom. Cela ne résout pas les conflits, mais cela clarifie la source du mandat.' },
        traitShift: { batisseur: 2, rupture: 1 }
      },
      {
        id: 'amiens-greve-generale',
        text: 'Faire de la grève générale la boussole absolue.',
        intent: 'Radicaliser la doctrine.',
        theoryHint: 'Engagement crédible : annoncer que tu peux aller au bout rend parfois la négociation plus sérieuse.',
        effects: { resources: { rapportDeForce: 12, confiance: 8, institution: -5, legitimite: -4 }, actors: { etat: { stance: 'dur', pressure: 10 }, opinion: { trust: -3 } } },
        consequence: { immediate: 'La salle se lève. La doctrine donne une ivresse. Elle donne aussi une pente : chaque compromis devra désormais se justifier devant l’absolu.' },
        traitShift: { rupture: 3, tribun: 2 }
      },
      {
        id: 'amiens-ouvrir-negociation',
        text: 'Ajouter une doctrine de négociation de branche.',
        intent: 'Préserver la rupture sans refuser l’accord.',
        theoryHint: 'Harvard : distinguer position affichée et intérêts durables.',
        effects: { resources: { institution: 8, legitimite: 6, rapportDeForce: 2 }, actors: { base: { trust: -2, patience: 5 }, adversaire: { trust: 5 } } },
        consequence: { immediate: 'La formulation passe difficilement. Les puristes grincent. Mais tu laisses une porte : la grève comme horizon, la convention comme outil.' },
        traitShift: { pragmatique: 2, technocrate: 1 }
      }
    ]
  },
  {
    id: 'conventions-1919',
    turn: 18,
    date: '25 mars 1919',
    era: 'entre_deux_guerres',
    title: 'Signer pour toute une branche',
    subtitle: 'Conventions collectives',
    mood: 'calme',
    premium: true,
    historicalContext:
      'La loi du 25 mars 1919 donne un cadre aux conventions collectives. La négociation peut désormais produire des normes applicables au-delà d’un seul atelier.',
    setup: {
      reflechi: 'La convention collective transforme une demande locale en règle professionnelle.',
      compulsif: 'Un texte court. Des mots secs. Et pourtant, dedans, l’idée qu’un salaire peut cesser d’être une solitude.'
    },
    actors: ['base', 'adversaire', 'etat'],
    choices: [
      {
        id: 'conventions-branche',
        text: 'Négocier une convention de branche complète.',
        intent: 'Faire tenir le compromis dans une règle.',
        theoryHint: 'Institutionnalisation : un accord devient une mémoire opposable.',
        effects: { resources: { institution: 12, legitimite: 7, confiance: 5, caisse: 2 }, actors: { adversaire: { trust: 5 }, etat: { trust: 8 }, base: { trust: 6 } } },
        consequence: { immediate: 'Les minima, les horaires, les catégories : tout devient ligne de texte. La branche acquiert une voix propre.', longterm: 'Les conventions deviendront un pilier du dialogue social français.' },
        traitShift: { batisseur: 3, technocrate: 2 },
        flag: 'cree-conventions-1919'
      },
      {
        id: 'conventions-atelier',
        text: 'Rester à l’accord d’atelier pour garder la main.',
        intent: 'Préférer le contrôle local.',
        theoryHint: 'Trade-off : plus une norme s’étend, plus elle échappe à son premier négociateur.',
        effects: { resources: { confiance: 4, rapportDeForce: 5, institution: -4 }, actors: { base: { trust: 5 }, adversaire: { patience: -4 } } },
        consequence: { immediate: 'Tu gagnes vite, près du sol. Mais la victoire ne voyage pas : l’atelier voisin recommence à zéro.' },
        traitShift: { pragmatique: 2 }
      },
      {
        id: 'conventions-refus',
        text: 'Refuser la convention au nom de l’action directe.',
        intent: 'Ne pas enfermer le mouvement dans le droit.',
        theoryHint: 'Dilemme classique : la règle protège, mais elle discipline.',
        effects: { resources: { rapportDeForce: 8, confiance: 5, institution: -8, legitimite: -5 }, actors: { etat: { trust: -6 }, adversaire: { stance: 'dur' } } },
        consequence: { immediate: 'Tu gardes les mains libres. Tu perds aussi la possibilité d’obliger l’autre camp demain.' },
        traitShift: { rupture: 3 }
      }
    ]
  },
  {
    id: 'securite-sociale-1945',
    turn: 22,
    date: '4 et 19 octobre 1945',
    era: 'reconstruction',
    title: 'Les caisses de la dignité',
    subtitle: 'Sécurité sociale',
    mood: 'euphorique',
    premium: true,
    historicalContext:
      'Les ordonnances des 4 et 19 octobre 1945 organisent la Sécurité sociale. Pierre Laroque et Alexandre Parodi structurent une ambition de protection généralisée, portée politiquement par Ambroise Croizat.',
    setup: {
      reflechi: 'Le conflit social devient administration de droits : maladie, vieillesse, famille, cotisation.',
      compulsif: 'La guerre vient à peine de finir. Sur les bureaux, les dossiers sentent la poussière et l’aube. On invente une promesse : ne plus tomber seul.'
    },
    actors: ['base', 'etat', 'adversaire', 'opinion'],
    choices: [
      {
        id: 'secu-caisses',
        text: 'Construire des caisses gouvernées par les intéressés.',
        intent: 'Faire du paritarisme une administration vivante.',
        theoryHint: 'Paritarisme de gestion : les représentants administrent une institution financée par cotisations.',
        effects: { resources: { institution: 18, santeSociale: 14, legitimite: 10, caisse: -5 }, actors: { base: { trust: 14 }, etat: { trust: 10 }, opinion: { trust: 12 }, adversaire: { trust: 2 } } },
        consequence: { immediate: 'On ouvre les guichets avant même que tout soit parfaitement stable. Les assurés arrivent avec des papiers froissés, des maladies anciennes, une espérance neuve.', longterm: 'Les caisses deviennent un cœur institutionnel du modèle social français.' },
        traitShift: { batisseur: 4, technocrate: 2 },
        flag: 'cree-secu'
      },
      {
        id: 'secu-etat',
        text: 'Confier davantage la conduite à l’État.',
        intent: 'Gagner en coordination, perdre en autonomie sociale.',
        theoryHint: 'Principal-agent : l’État peut sécuriser l’exécution mais capter le mandat.',
        effects: { resources: { institution: 10, legitimite: 6, confiance: -5, rapportDeForce: -4 }, actors: { etat: { trust: 15 }, base: { trust: -7 }, adversaire: { trust: 4 } } },
        consequence: { immediate: 'Les circulaires arrivent vite, les arbitrages aussi. La machine avance, mais la base se demande si on lui confie une institution ou un guichet.' },
        traitShift: { technocrate: 3, batisseur: 1 }
      },
      {
        id: 'secu-priorite-salaires',
        text: 'Repousser les caisses pour obtenir des salaires immédiats.',
        intent: 'Soulager tout de suite.',
        theoryHint: 'Aversion à la perte : après guerre, le manque présent écrase parfois le futur.',
        effects: { resources: { confiance: 8, caisse: 4, institution: -14, santeSociale: -5 }, actors: { base: { trust: 7 }, etat: { trust: -8 }, opinion: { trust: -4 } } },
        consequence: { immediate: 'Le bulletin de paie remonte. Le vieil ouvrier malade, lui, attendra encore. La victoire a le goût d’un repas chaud et d’une occasion manquée.' },
        traitShift: { pragmatique: 2, batisseur: -2 }
      }
    ]
  },
  {
    id: 'unedic-1958',
    turn: 26,
    date: '31 décembre 1958',
    era: 'trente_glorieuses',
    title: 'Assurer le chômage',
    subtitle: 'Création de l’Unédic',
    mood: 'calme',
    premium: true,
    historicalContext:
      'L’Unédic est créée par les partenaires sociaux pour gérer l’assurance chômage. C’est un pilier du paritarisme de gestion, toujours traversé par la tension entre autonomie sociale et cadrage étatique.',
    setup: {
      reflechi: 'Le chômage devient un risque social administré par les partenaires sociaux.',
      compulsif: 'Le mot chômage a encore l’air d’un accident. Tu sais déjà qu’il deviendra un pays entier.'
    },
    actors: ['base', 'adversaire', 'etat'],
    choices: [
      {
        id: 'unedic-paritaire',
        text: 'Signer une assurance chômage autonome.',
        intent: 'Confier la gestion aux partenaires sociaux.',
        theoryHint: 'Jeu non nul : patronat et syndicats peuvent stabiliser le marché du travail ensemble.',
        effects: { resources: { institution: 14, legitimite: 8, santeSociale: 8, caisse: -4 }, actors: { base: { trust: 8 }, adversaire: { trust: 10 }, etat: { trust: 4 } } },
        consequence: { immediate: 'La signature paraît technique. Elle ne l’est pas. Elle dit qu’un emploi perdu n’est pas seulement une affaire privée.', longterm: 'L’Unédic deviendra un terrain central des bras de fer entre État et partenaires sociaux.' },
        traitShift: { batisseur: 3, pragmatique: 2 },
        flag: 'cree-unedic'
      },
      {
        id: 'unedic-cotisations-basses',
        text: 'Exiger des cotisations faibles pour préserver la compétitivité.',
        intent: 'Limiter le coût économique immédiat.',
        theoryHint: 'Somme nulle apparente : moins de cotisation aujourd’hui, moins de protection demain.',
        effects: { resources: { caisse: 8, institution: -5, santeSociale: -6, legitimite: -2 }, actors: { adversaire: { trust: 10 }, base: { trust: -8 } } },
        consequence: { immediate: 'Les employeurs respirent. Les futurs chômeurs, eux, n’existent pas encore dans la pièce. C’est souvent ainsi qu’on perd une bataille morale.' },
        traitShift: { technocrate: 2, paternaliste: 1 }
      },
      {
        id: 'unedic-etat-garant',
        text: 'Demander à l’État d’être garant financier.',
        intent: 'Sécuriser le régime au prix d’une dépendance.',
        theoryHint: 'L’assurance gagne un filet, mais le principal peut reprendre la main sur l’agent.',
        effects: { resources: { institution: 8, legitimite: 4, rapportDeForce: -5 }, actors: { etat: { trust: 12, pressure: 8 }, adversaire: { trust: -2 } } },
        consequence: { immediate: 'Le régime paraît plus solide. Une ombre s’ajoute à la table : demain, qui paiera décidera peut-être.' },
        traitShift: { technocrate: 3 }
      }
    ]
  },
  {
    id: 'grenelle-1968',
    turn: 28,
    date: '27 mai 1968',
    era: 'trente_glorieuses',
    title: 'La table sous les pavés',
    subtitle: 'Accords de Grenelle',
    mood: 'tendu',
    premium: true,
    historicalContext:
      'Mai 68 produit une grève massive. Les accords de Grenelle proposent hausses salariales, relèvement du SMIG et reconnaissance accrue de la section syndicale d’entreprise.',
    setup: {
      reflechi: 'Le pays est bloqué. La négociation doit transformer une crise sociale et politique en compromis acceptable.',
      compulsif: 'Les radios crachent des chiffres. Des millions de corps ont quitté le travail. Au ministère, la table paraît trop petite pour le pays.'
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    choices: [
      {
        id: 'grenelle-signer',
        text: 'Signer les avancées salariales et syndicales.',
        intent: 'Convertir la crise en gains concrets.',
        theoryHint: 'Négociation raisonnée : saisir les intérêts obtenables avant que la fenêtre ne se referme.',
        effects: { resources: { confiance: 8, legitimite: 8, institution: 10, santeSociale: 6 }, actors: { base: { trust: 7, patience: 8 }, etat: { trust: 8 }, adversaire: { trust: 5 } } },
        consequence: { immediate: 'Les chiffres sont énormes, mais la rue les trouve parfois insuffisants. Tu découvres une vérité dure : une victoire négociée peut sembler pâle face à une espérance révolutionnaire.' },
        traitShift: { pragmatique: 3, batisseur: 2 },
        flag: 'signe-grenelle'
      },
      {
        id: 'grenelle-rejeter',
        text: 'Rejeter Grenelle devant la base.',
        intent: 'Rester à la hauteur de l’élan.',
        theoryHint: 'Chicken game : refuser peut arracher plus, ou provoquer l’isolement.',
        effects: { resources: { rapportDeForce: 10, confiance: 9, santeSociale: -12, institution: -6 }, actors: { base: { pressure: 12 }, etat: { stance: 'dur', patience: -10 }, opinion: { trust: -5 } } },
        consequence: { immediate: 'Dans l’assemblée, le refus soulève un grondement. Pendant quelques heures, tu te crois porté par le siècle. Puis les payes manquées reviennent dans les conversations.' },
        traitShift: { rupture: 3, tribun: 2 },
        flag: 'epuise-mouvement'
      },
      {
        id: 'grenelle-section',
        text: 'Prioriser la section syndicale d’entreprise.',
        intent: 'Gagner un pouvoir durable dans l’atelier.',
        theoryHint: 'Institution locale : le droit d’être présent tous les jours vaut parfois plus qu’une prime.',
        effects: { resources: { institution: 12, rapportDeForce: 4, legitimite: 4, caisse: -2 }, actors: { base: { trust: 8 }, adversaire: { trust: -3 }, etat: { trust: 5 } } },
        consequence: { immediate: 'La hausse se voit tout de suite. La section syndicale, elle, changera la lumière des couloirs pendant des années.' },
        traitShift: { batisseur: 3, technocrate: 1 }
      }
    ]
  },
  {
    id: 'auroux-1982',
    turn: 31,
    date: '1982',
    era: 'mitterrand',
    title: 'Faire entrer la parole',
    subtitle: 'Lois Auroux',
    mood: 'calme',
    premium: true,
    historicalContext:
      'Les lois Auroux renforcent les droits des salariés dans l’entreprise : expression directe, négociation annuelle obligatoire, CHSCT et droits syndicaux consolidés.',
    setup: {
      reflechi: 'Le pouvoir politique veut démocratiser l’entreprise. Reste à savoir si les acteurs s’en emparent.',
      compulsif: 'On promet la parole. Tu sais que la parole donnée peut devenir puissance, rituel ou décor.'
    },
    actors: ['base', 'adversaire', 'etat'],
    choices: [
      {
        id: 'auroux-nao',
        text: 'Faire de la négociation annuelle un rituel exigeant.',
        intent: 'Installer une routine de confrontation utile.',
        theoryHint: 'La répétition change le jeu : elle rend la défection plus coûteuse.',
        effects: { resources: { institution: 10, legitimite: 6, confiance: 5 }, actors: { base: { trust: 7 }, adversaire: { trust: 4 }, etat: { trust: 5 } } },
        consequence: { immediate: 'La première réunion ressemble à un théâtre. La troisième commence à produire des chiffres. Le rituel devient une contrainte.' },
        traitShift: { batisseur: 3, technocrate: 2 }
      },
      {
        id: 'auroux-chsct',
        text: 'Mettre la santé au travail au centre.',
        intent: 'Faire du corps un sujet politique.',
        theoryHint: 'Effet de cadrage : parler de santé change la valeur morale du conflit.',
        effects: { resources: { santeSociale: 12, legitimite: 7, institution: 8, caisse: -3 }, actors: { base: { trust: 10 }, opinion: { trust: 8 } } },
        consequence: { immediate: 'L’accident cesse d’être une fatalité individuelle. Il devient une question d’organisation, donc une question de pouvoir.' },
        traitShift: { batisseur: 2, technocrate: 2 },
        flag: 'cree-chsct'
      },
      {
        id: 'auroux-communication',
        text: 'Transformer les droits nouveaux en communication interne.',
        intent: 'Rendre visible sans trop concéder.',
        theoryHint: 'Agence : un représentant peut capter le mandat pour protéger son organisation.',
        effects: { resources: { legitimite: 5, institution: -4, confiance: -6, caisse: 4 }, actors: { base: { trust: -8 }, adversaire: { trust: 6 } } },
        consequence: { immediate: 'Les affiches sont belles. Les réunions aussi. Le jour où un salarié parle vraiment, tout le monde découvre que le décor n’était pas prêt.' },
        traitShift: { paternaliste: 2, pragmatique: 1 }
      }
    ]
  },
  {
    id: 'cse-2017',
    turn: 40,
    date: '22 septembre 2017',
    era: 'macron_i',
    title: 'Fusionner les instances',
    subtitle: 'Ordonnances CSE',
    mood: 'melancolique',
    premium: true,
    historicalContext:
      'Les ordonnances du 22 septembre 2017 créent le Comité social et économique, fusionnant délégués du personnel, comité d’entreprise et CHSCT.',
    setup: {
      reflechi: 'Simplifier peut rendre lisible. Simplifier peut aussi concentrer la charge et perdre des spécialités.',
      compulsif: 'Trois portes deviennent une seule. On appelle cela simplifier. Personne ne sait encore ce qui restera derrière.'
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    choices: [
      {
        id: 'cse-negocier-moyens',
        text: 'Négocier des moyens renforcés pour le CSE.',
        intent: 'Compenser la fusion par du temps et de l’expertise.',
        theoryHint: 'Négociation raisonnée : accepter le cadre, discuter les moyens réels.',
        effects: { resources: { institution: 8, legitimite: 5, caisse: -4, santeSociale: 4 }, actors: { base: { trust: 6 }, adversaire: { trust: 4 }, etat: { trust: 3 } } },
        consequence: { immediate: 'Le CSE naît chargé, mais pas nu. Quelques heures de délégation sauvent plus de vigilance qu’un discours indigné.' },
        traitShift: { pragmatique: 3, technocrate: 1 }
      },
      {
        id: 'cse-denoncer',
        text: 'Dénoncer la perte du CHSCT comme une mutilation.',
        intent: 'Préserver la mémoire d’un contre-pouvoir.',
        theoryHint: 'Aversion à la perte : certaines pertes institutionnelles mobilisent plus que des gains abstraits.',
        effects: { resources: { confiance: 8, rapportDeForce: 6, legitimite: -3, institution: -3 }, actors: { base: { trust: 10 }, etat: { trust: -8 }, opinion: { trust: 2 } } },
        consequence: { immediate: 'Le mot “mutilation” accroche. Il ne bloque pas l’ordonnance, mais il donne un nom au malaise qui monte dans les entreprises.' },
        traitShift: { tribun: 3, rupture: 1 }
      },
      {
        id: 'cse-performance',
        text: 'Vendre le CSE comme un outil de performance sociale.',
        intent: 'Faire accepter la réforme par l’efficacité.',
        theoryHint: 'Cadrage : présenter la contrainte comme simplification utile.',
        effects: { resources: { caisse: 7, legitimite: 4, confiance: -5, institution: 2 }, actors: { adversaire: { trust: 8 }, base: { trust: -6 }, opinion: { trust: 4 } } },
        consequence: { immediate: 'Le mot performance rassure les directions. Les élus, eux, regardent la pile de dossiers monter sur une seule table.' },
        traitShift: { technocrate: 3, paternaliste: 1 }
      }
    ]
  },
  {
    id: 'retraites-2023',
    turn: 44,
    date: '2023',
    era: 'macron_ii',
    title: 'La réforme et la rue',
    subtitle: 'Retraites à 64 ans',
    mood: 'grave',
    premium: true,
    historicalContext:
      'La réforme des retraites de 2023 reporte progressivement l’âge légal à 64 ans. Le conflit produit une intersyndicale durable et un débat sur la place du dialogue social face à la décision étatique.',
    setup: {
      reflechi: 'Le conflit oppose légalité institutionnelle, légitimité sociale et soutenabilité financière.',
      compulsif: 'Les cortèges reviennent comme une marée exacte. Le pouvoir compte les articles. La rue compte les corps.'
    },
    actors: ['base', 'etat', 'opinion', 'adversaire'],
    choices: [
      {
        id: 'retraites-intersyndicale',
        text: 'Tenir l’intersyndicale jusqu’au bout.',
        intent: 'Faire de l’unité une ressource rare.',
        theoryHint: 'Coalition : la discipline entre acteurs augmente le coût politique du passage en force.',
        effects: { resources: { confiance: 12, legitimite: 8, rapportDeForce: 8, santeSociale: -6 }, actors: { base: { trust: 12 }, opinion: { trust: 8 }, etat: { trust: -12, stance: 'dur' } } },
        consequence: { immediate: 'Les divergences restent, mais elles ne débordent pas. L’unité devient elle-même un événement : le pays voit des organisations rivales marcher au même pas.' },
        traitShift: { batisseur: 2, tribun: 2 }
      },
      {
        id: 'retraites-blocage',
        text: 'Durcir vers des blocages reconductibles.',
        intent: 'Transformer la protestation en contrainte économique.',
        theoryHint: 'Chicken game : plus le coût augmente, plus céder devient humiliant pour chacun.',
        effects: { resources: { rapportDeForce: 12, confiance: 6, santeSociale: -12, legitimite: -6, caisse: -8 }, actors: { etat: { stance: 'dur', patience: -15 }, opinion: { trust: -6 }, base: { pressure: 10 } } },
        consequence: { immediate: 'Les dépôts, les raffineries, les gares : le pays redevient matériel. Mais chaque jour de blocage change aussi la patience publique.' },
        traitShift: { rupture: 3, tribun: 1 },
        flag: 'epuise-mouvement'
      },
      {
        id: 'retraites-negocier-apres',
        text: 'Préparer une sortie par branches et pénibilité.',
        intent: 'Sauver des gains après la défaite nationale.',
        theoryHint: 'MESORE : si l’accord central échoue, déplacer le terrain vers des accords sectoriels.',
        effects: { resources: { institution: 8, santeSociale: 6, confiance: -3, legitimite: 4 }, actors: { base: { trust: -3, patience: 5 }, adversaire: { trust: 5 }, etat: { trust: 4 } } },
        consequence: { immediate: 'La colère n’aime pas les issues de secours. Pourtant, dans certaines branches, les nuits pénibles et les carrières longues reprennent un nom négociable.' },
        traitShift: { pragmatique: 3, technocrate: 2 }
      }
    ]
  }
];
