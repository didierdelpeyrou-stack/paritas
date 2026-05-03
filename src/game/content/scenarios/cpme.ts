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
  }
];
