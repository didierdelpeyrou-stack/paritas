/* ============================================================
   Paritas — événements de démo (mix Reigns / Suzerain)
   Chaque événement a un format (reigns / suzerain / dilemma).
   Les événements majeurs (Matignon, Grenelle…) sont en Suzerain.
   Les autres sont en Reigns rapide.
   ============================================================ */

import type { GameEvent } from '../types';

export const EVENTS: GameEvent[] = [
  /* ---------- Archives hors progression : proto-corporations, conservées comme matière de référence ---------- */
  {
    id: 'collegium-fabri',
    era: -99,
    format: 'reigns',
    title: 'Le collegium fabrorum',
    date: '105 ap. J.-C., Ostie',
    situation: ({ camp }) =>
      camp === 'patron'
        ? "Tu es magister d'un collegium d'artisans à Ostie. Le préfet de l'Annone exige 200 amphores en un mois."
        : "Tu es contremaître chez les fabri tignuarii. Le magister a accepté une corvée écrasante.",
    historical:
      "Les collegia, attestés dès Numa Pompilius (Plutarque, Vie de Numa, XVII), sont des associations religieuses et professionnelles. Source : J.-P. Waltzing, Étude sur les corporations chez les Romains, 1895.",
    saviez: "Le mot collegium a donné « collège » en français, au sens d'assemblée de pairs.",
    swipe: { left: 2, right: 0 },
    choices: [
      {
        text: "Négocier un prix supérieur en échange du délai",
        icon: '⚖️',
        recommended: true,
        tag: 'negocie',
        skillUp: 'negociation',
        dc: 50,
        effects: { caisse: 8, prestige: 3, soutien: -2 },
        explanation:
          "Tu utilises la position de force du collegium. Caisse +8 (prix supérieur), prestige +3 (auprès de tes pairs), soutien -2 (certains voulaient refuser).",
        longterm: "Ton collegium devient une référence. D'autres préfets viendront y commander."
      },
      {
        text: "Accepter sans condition pour gagner les faveurs du préfet",
        icon: '🎩',
        tag: 'institution',
        skillUp: 'politique',
        dc: 35,
        effects: { influence: 6, soutien: -6, caisse: -3 },
        explanation: "Pari politique. Influence +6, mais soutien -6 (tes membres te trouvent servile)."
      },
      {
        text: "Faire grève — bras croisés sur le port",
        icon: '✊',
        risky: true,
        tag: 'greve',
        skillUp: 'mobilisation',
        dc: 60,
        effects: { soutien: 8, prestige: 4, influence: -7, caisse: -5 },
        effectsFail: { soutien: -3, prestige: -3, sante: -5 },
        explanation: "Geste rare mais documenté (grève des boulangers d'Éphèse, IIᵉ s.). Risqué : si tu rates, tu finis aux arènes."
      }
    ]
  },

  /* ---------- Archives hors progression : jurandes, conservées comme matière de référence ---------- */
  {
    id: 'livre-metiers',
    era: -99,
    format: 'reigns',
    title: 'Le Livre des métiers',
    date: '1268, Paris',
    situation: () =>
      "Étienne Boileau, prévôt de Paris, vient consigner les usages de ton métier. Chaque article gravé devient loi.",
    historical:
      "Le Livre des métiers (1268) recense 101 métiers parisiens. Édition de référence : R. de Lespinasse & F. Bonnardot, 1879.",
    saviez: "Le boulanger devait jurer sur les saints qu'il ne mêlerait pas la farine à de la craie.",
    unlocks: 'Le Livre des métiers',
    illus: 'livre',
    swipe: { left: 1, right: 0 },
    choices: [
      {
        text: "Règles strictes (chefs-d'œuvre, années d'apprentissage)",
        icon: '🔒', recommended: true, tag: 'institution', skillUp: 'expertise', dc: 45,
        effects: { prestige: 6, caisse: 5, soutien: -4 }, flag: 'jurande_fermee',
        explanation: "Verrouillage de l'accès. Marges en hausse (rareté), mais ressentiment des compagnons exclus.",
        longterm: "Ta jurande devient prospère mais sclérosée — Turgot s'en plaindra dans 5 siècles."
      },
      {
        text: "Règles ouvertes (admission facilitée)",
        icon: '🔓', tag: 'negocie', skillUp: 'politique', dc: 40,
        effects: { soutien: 6, caisse: -3, mobilisation: 3 },
        explanation: "Plus de membres, plus de cotisations, mais plus de concurrence interne."
      },
      {
        text: "Glisser un salaire minimum pour les valets",
        icon: '⚖️', tag: 'signe', skillUp: 'negociation', dc: 55,
        effects: { soutien: 8, prestige: 4, caisse: -4 },
        explanation: "Innovation : ancêtre des minima conventionnels, six siècles avant l'heure.",
        longterm: "Pratique reprise dans d'autres jurandes — tu fais école."
      }
    ]
  },

  /* ---------- Avant la première révolution industrielle ---------- */
  {
    id: 'le-chapelier',
    era: 0,
    format: 'reigns',
    title: 'Loi Le Chapelier',
    date: '14 juin 1791',
    situation: () =>
      "L'Assemblée vote l'interdiction de toute coalition d'ouvriers ou de patrons. La grève devient un délit.",
    historical:
      "La loi Le Chapelier interdit corporations et coalitions au nom de la liberté individuelle. Restera en vigueur jusqu'à la loi Ollivier (1864) et la loi Waldeck-Rousseau (1884).",
    unlocks: 'Loi Le Chapelier',
    illus: 'chains',
    swipe: { left: 0, right: 1 },
    choices: [
      {
        text: "Société clandestine sous couvert religieux",
        icon: '🕯️', recommended: true, tag: 'refuse', skillUp: 'mobilisation', dc: 55,
        effects: { soutien: 8, mobilisation: 5, influence: -3, sante: -2 },
        flag: 'clandestin',
        explanation: "Beaucoup de mutuelles survivent ainsi sous l'Empire. Tu portes le flambeau.",
        longterm: "Ta société servira de base aux premières chambres syndicales en 1884."
      },
      {
        text: "Dissoudre et accepter le nouveau cadre",
        icon: '📄', tag: 'signe', skillUp: 'expertise', dc: 30,
        effects: { soutien: -10, caisse: -5, prestige: -3 },
        explanation: "Tu respectes la loi mais brises le tissu solidaire."
      }
    ]
  },

  /* ---------- Première révolution industrielle : Canuts (Suzerain — événement majeur) ---------- */
  {
    id: 'canuts-1831',
    era: 1,
    format: 'suzerain',
    title: 'Révolte des Canuts',
    date: '21-23 novembre 1831, Lyon',
    pnj: { name: 'Joachim Falconnet, chef d\'atelier', init: 'JF', side: 'salarie' },
    situation: ({ camp }) =>
      camp === 'salarie'
        ? "Le tarif négocié est rejeté par les négociants. La Croix-Rousse se soulève."
        : "Les chefs d'atelier exigent un tarif minimum. Tu es négociant en soie.",
    historical:
      "La première révolte des Canuts (21-23 nov. 1831) est l'un des premiers grands soulèvements ouvriers européens. Source : F. Rude, L'insurrection lyonnaise, 1969.",
    saviez: "Le drapeau noir des Canuts a précédé celui des anarchistes de plusieurs décennies.",
    illus: 'barricade',
    dialogue: [
      { who: 'narrateur', text: 'Lyon, novembre 1831. La fumée monte de la Croix-Rousse. Sur le drapeau noir des Canuts : « Vivre en travaillant ou mourir en combattant ».', subtext: "Une phrase qui annonce un siècle de luttes." },
      { who: 'pnj', text: "Le préfet Bouvier-Dumolart nous avait promis le tarif. Maintenant, les négociants le piétinent. Que faisons-nous ?", subtext: "Il sait déjà la réponse — il veut juste que tu la valides." },
      { who: 'self', text: '— …' }
    ],
    choices: [
      {
        text: "Tenir le tarif coûte que coûte (insurrection)",
        icon: '🚩', recommended: true, impact: 'INSURRECTION',
        req: ({ camp }) => camp === 'salarie',
        tag: 'greve', skillUp: 'mobilisation', dc: 65,
        effects: { soutien: 12, mobilisation: 8, sante: -15, influence: -8 },
        flag: 'canut_dur',
        explanation: "Tu entres dans la légende — au prix de morts et d'une répression brutale.",
        longterm: "L'historiographie te célébrera. Mais le tarif sera bel et bien aboli."
      },
      {
        text: "Négocier en sous-main avec le préfet",
        icon: '⚖️', tag: 'negocie', skillUp: 'negociation', dc: 60,
        effects: { negociation: 5, influence: 4, soutien: -3 },
        explanation: "Le préfet est pour le tarif. Bras de fer institutionnel.",
        longterm: "Le ministère désavouera Bouvier-Dumolart et toi avec lui."
      },
      {
        text: "Briser le tarif, fabriques de campagne",
        icon: '⚔️', risky: true, tag: 'refuse', skillUp: 'production', dc: 50,
        req: ({ camp }) => camp === 'patron',
        effects: { caisse: 10, soutien: -12, prestige: -5 },
        flag: 'casseur_canuts',
        explanation: "Tu fais sauter la régulation au prix d'une guerre civile.",
        longterm: "Lyon te haïra pendant un siècle."
      }
    ]
  },

  /* ---------- Deuxième révolution industrielle : Matignon (Suzerain) ---------- */
  {
    id: 'matignon-1936',
    era: 2,
    format: 'suzerain',
    title: 'Mai-juin 1936 — la grève sur le tas',
    date: 'mai-juin 1936',
    pnj: { name: 'Léon Jouhaux, secrétaire CGT', init: 'LJ', side: 'salarie' },
    situation: ({ camp }) =>
      camp === 'salarie'
        ? "Près de 2 millions de grévistes occupent les usines. Tu es délégué CGT chez Renault, Billancourt."
        : "Tes usines sont occupées. Le CGPF veut négocier vite. Tu vas à Matignon.",
    historical:
      "Les accords de Matignon (7 juin 1936), signés par Jouhaux (CGT) et Lambert-Ribot (CGPF), instaurent : conventions collectives, délégués du personnel, hausses 7-15%, droit syndical. Suivront 40h, 2 semaines de congés payés.",
    saviez:
      "Pendant les grèves de 36, les ouvriers organisaient des bals dans les ateliers occupés. Cartier-Bresson en a tiré une icône.",
    unlocks: 'Accords de Matignon',
    illus: 'matignon',
    dialogue: [
      { who: 'narrateur', text: '7 juin 1936. Hôtel Matignon. Léon Blum a convoqué CGT et CGPF.', subtext: "Aucune des deux organisations ne croyait à ce moment six mois plus tôt." },
      { who: 'pnj', text: "Camarade, le pays attend un texte. Si nous repartons sans signature, les usines basculeront. Si nous signons trop vite, la base nous désavouera.", subtext: "Jouhaux choisit ses mots — il pèse une vie." },
      { who: 'self', text: '— …' }
    ],
    choices: [
      {
        text: "Tenir l'occupation jusqu'à la convention",
        icon: '🚩', recommended: true, impact: 'MATIGNON',
        req: ({ camp }) => camp === 'salarie',
        tag: 'mobilise', skillUp: 'mobilisation', dc: 60,
        effects: { soutien: 15, mobilisation: 10, prestige: 8, sante: -5 },
        flag: 'matignon_dur',
        explanation: "Pression maximale. La convention sera obtenue.",
        longterm: "Référence absolue de la mémoire ouvrière."
      },
      {
        text: "Signer Matignon",
        icon: '✒️', impact: 'MATIGNON', tag: 'signe', skillUp: 'negociation', dc: 55,
        effects: { negociation: 10, prestige: 10, soutien: 5, influence: 5 },
        flag: 'matignon',
        explanation: "Acte fondateur du droit conventionnel français.",
        longterm: "Tu marques l'histoire — quel que soit ton camp."
      },
      {
        text: "Sabotage économique : fuite des capitaux",
        icon: '💸', risky: true,
        req: ({ camp }) => camp === 'patron',
        tag: 'refuse', skillUp: 'production', dc: 45,
        effects: { caisse: 10, prestige: -10, soutien: -15, influence: -5 },
        flag: 'deux_cents_familles',
        explanation: "Le mur d'argent contre le Front populaire.",
        longterm: "L'expression « deux cents familles » restera attachée à toi."
      },
      {
        text: "Patronat éclairé (Detoeuf, X-Crise)",
        icon: '💡', recommended: true,
        req: ({ camp }) => camp === 'patron',
        tag: 'institution', skillUp: 'politique', dc: 55,
        effects: { prestige: 8, influence: 6, soutien: 5 },
        flag: 'patronat_eclaire',
        explanation: "Tu vois plus loin que tes pairs. Bloch-Lainé citera ton exemple.",
        longterm: "Tu participeras à la reconstruction d'après-guerre."
      }
    ]
  },

  /* ---------- Troisième révolution industrielle : Retraites 2023 (Suzerain) ---------- */
  {
    id: 'retraites-2023',
    era: 3,
    format: 'suzerain',
    title: 'Réforme des retraites 2023',
    date: '14 avril 2023',
    pnj: { name: 'Laurent Berger, secrétaire CFDT', init: 'LB', side: 'salarie' },
    situation: () =>
      "Recul à 64 ans. 14 journées d'action, plus de 3,5 millions de manifestants. Article 49.3.",
    historical:
      "La loi du 14 avril 2023 (n° 2023-270). Intersyndicale unie — première depuis 12 ans. Adoption via 49.3. Validée pour l'essentiel par le Conseil constitutionnel.",
    unlocks: 'Intersyndicale 2023',
    illus: 'manif',
    dialogue: [
      { who: 'narrateur', text: 'Janvier 2023. Pour la première fois en douze ans, les huit organisations syndicales représentatives publient un communiqué commun.', subtext: "L'unité, en France, est un événement plus rare qu'une grève générale." },
      { who: 'pnj', text: "Si nous sortons de l'intersyndicale pour signer un compromis, on gagne peut-être deux ans pour les carrières longues. Mais on casse l'unité — pour vingt ans.", subtext: "Berger sait que sa propre maison est divisée." },
      { who: 'self', text: '— …' }
    ],
    choices: [
      {
        text: "Tenir l'unité intersyndicale",
        icon: '🚩', recommended: true, impact: 'UNITÉ',
        req: ({ camp }) => camp === 'salarie',
        tag: 'mobilise', skillUp: 'mobilisation', dc: 60,
        effects: { soutien: 12, mobilisation: 10, prestige: 10, sante: -5 },
        flag: 'intersyndicale_2023',
        explanation: "Unité historique. La réforme passe quand même mais l'intersyndicale en sort renforcée.",
        longterm: "Modèle pour les mobilisations à venir."
      },
      {
        text: "Sortir de l'intersyndicale pour négocier",
        icon: '⚖️', tag: 'negocie', skillUp: 'negociation', dc: 65,
        req: ({ camp }) => camp === 'salarie',
        effects: { negociation: 8, influence: 5, soutien: -10 }
      },
      {
        text: "Concessions (carrières longues, pénibilité)",
        icon: '⚖️', recommended: true,
        req: ({ camp }) => camp === 'patron',
        tag: 'negocie', skillUp: 'negociation', dc: 60,
        effects: { negociation: 8, prestige: 8, soutien: 5 },
        explanation: "Tu désamorces une partie de la mobilisation.",
        longterm: "Tu apparais comme un patron de dialogue."
      },
      {
        text: "Tenir bon, défendre la mesure",
        icon: '🛡️',
        req: ({ camp }) => camp === 'patron',
        tag: 'refuse', skillUp: 'politique', dc: 55,
        effects: { politique: 8, influence: 10, soutien: -10, prestige: -5 }
      }
    ]
  }
];

/** Évén. génériques (intercalaires entre événements historiques). */
export const GENERIC_EVENTS: GameEvent[] = [
  {
    id: 'gen-cotisations',
    era: -1, format: 'reigns', title: 'Caisse commune en baisse',
    situation: () => "La caisse commune se vide. Les membres hésitent à verser davantage, mais sans réserve le collectif perd sa capacité d'action.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Tournée porte-à-porte', icon: '🚪', tag: 'mobilise', skillUp: 'mobilisation', dc: 40,
        effects: { soutien: 5, caisse: 5, sante: -3 },
        explanation: "Tu retisses le lien direct avec la base." },
      { text: 'Augmenter la cotisation', icon: '💰', tag: 'institution', skillUp: 'negociation', dc: 35,
        effects: { caisse: 8, soutien: -3 },
        explanation: "Solution comptable, peu populaire." },
      { text: 'Réduire les tournées et les réunions', icon: '✂️', tag: 'production', skillUp: 'production', dc: 30,
        effects: { caisse: 10, soutien: -8, mobilisation: -3 },
        explanation: "Tu économises vite, mais tu fragilises la présence collective." }
    ]
  },
  {
    id: 'gen-tribune',
    era: -1, format: 'reigns', title: 'Prise de parole publique',
    situation: () => "Une feuille locale, un journal ou une assemblée te donne la parole. Le message peut rassembler, ou exposer le collectif.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Tribune offensive', icon: '📢', tag: 'discours', skillUp: 'baratin', dc: 45,
        effects: { baratin: 5, prestige: 3, influence: -2 },
        explanation: "Buzz garanti, mais tu te grilles auprès des modérés." },
      { text: 'Tribune mesurée et technique', icon: '📊', tag: 'institution', skillUp: 'expertise', dc: 50,
        effects: { expertise: 5, prestige: 5 },
        explanation: "Tu construis ton autorité technique." }
    ]
  },
  {
    id: 'gen-mutuelle-secours',
    era: 0, format: 'reigns', title: 'Société de secours mutuel',
    situation: () => "Les coalitions professionnelles sont interdites, mais une caisse de secours peut aider les familles touchées par la maladie, l'accident ou la perte d'ouvrage.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Fonder une caisse de secours discrète', icon: '🕯️', recommended: true, tag: 'institution', skillUp: 'expertise', dc: 44,
        effects: { expertise: 4, soutien: 6, caisse: -3, social: 2 },
        explanation: "Tu bâtis une solidarité légale en apparence, mais politiquement féconde." },
      { text: 'Assumer une coalition revendicative', icon: '✊', risky: true, tag: 'refuse', skillUp: 'mobilisation', dc: 60,
        effects: { mobilisation: 6, soutien: 5, influence: -6 },
        effectsFail: { soutien: -5, prestige: -4, sante: -5 },
        explanation: "Tu fais naître le rapport de force, au risque de la répression." }
    ]
  },
  {
    id: 'gen-livret-ouvrier',
    era: 0, format: 'reigns', title: 'Livret ouvrier',
    situation: () => "Le livret ouvrier suit les déplacements et les engagements. Sans visa, changer d'atelier ou de ville devient risqué.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Négocier les visas avec le patron', icon: '📘', tag: 'negocie', skillUp: 'negociation', dc: 46,
        effects: { negociation: 4, influence: 3, soutien: 2 },
        explanation: "Tu desserres la contrainte sans déclencher l'affrontement." },
      { text: 'Organiser une entraide pour les sans-livret', icon: '🤝', recommended: true, tag: 'mobilise', skillUp: 'mobilisation', dc: 52,
        effects: { mobilisation: 5, soutien: 6, caisse: -3 },
        explanation: "Tu protèges les plus vulnérables et crées une solidarité de fait." }
    ]
  },
  {
    id: 'gen-chambre-ouvriere',
    era: 1, format: 'reigns', title: 'Chambre ouvrière tolérée',
    situation: () => "Dans la ville industrielle, des ouvriers veulent tenir une chambre professionnelle. Le droit reste incertain, mais l'administration ferme parfois les yeux.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Rédiger des statuts prudents', icon: '📜', recommended: true, tag: 'institution', skillUp: 'politique', dc: 50,
        effects: { politique: 5, influence: 4, soutien: 3 },
        explanation: "Tu construis une organisation durable sans provoquer immédiatement l'interdiction." },
      { text: 'Faire de la chambre un foyer de grève', icon: '🔥', risky: true, tag: 'greve', skillUp: 'mobilisation', dc: 62,
        effects: { mobilisation: 7, soutien: 5, influence: -5, sante: -3 },
        effectsFail: { soutien: -6, influence: -7, prestige: -4 },
        explanation: "Tu assumes la chambre comme organe de lutte, avec un risque de fermeture." }
    ]
  },
  {
    id: 'gen-nao-salaires',
    era: 3, format: 'reigns', title: 'NAO sous tension',
    situation: ({ camp }) => camp === 'patron'
      ? "La négociation annuelle obligatoire démarre. Les syndicats arrivent avec l'inflation et des fiches de paie annotées."
      : "La direction ouvre les NAO avec une enveloppe floue. La base veut un signal clair sur les salaires.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Proposer un accord à paliers', icon: '⚖️', recommended: true, tag: 'negocie', skillUp: 'negociation', dc: 48,
        effects: { negociation: 4, soutien: 4, influence: 3, caisse: -3 },
        explanation: "Tu transformes une revendication frontale en trajectoire signable." },
      { text: 'Publier un comparatif inflation-salaires', icon: '📊', tag: 'institution', skillUp: 'expertise', dc: 52,
        effects: { expertise: 5, prestige: 4, influence: 2 },
        explanation: "Les chiffres déplacent le débat : moins de slogans, plus de preuves." },
      { text: 'Faire monter la pression avant la séance', icon: '📣', risky: true, tag: 'mobilise', skillUp: 'mobilisation', dc: 58,
        effects: { mobilisation: 5, soutien: 7, sante: -4, influence: -2 },
        effectsFail: { soutien: -4, prestige: -3, sante: -5 },
        explanation: "La pression peut arracher une enveloppe, ou fermer les portes." }
    ]
  },
  {
    id: 'gen-accident-travail',
    era: 1, format: 'reigns', title: 'Accident sur le site',
    situation: () => "Un accident grave survient au petit matin. Les versions divergent déjà entre atelier, encadrement et presse locale.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Déclencher une enquête contradictoire', icon: '🔎', recommended: true, tag: 'institution', skillUp: 'expertise', dc: 45,
        effects: { expertise: 5, prestige: 4, sante: 6, influence: 2 },
        explanation: "Tu sécurises les faits avant que chacun n'installe son récit." },
      { text: 'Organiser une heure d’arrêt collectif', icon: '✊', tag: 'mobilise', skillUp: 'mobilisation', dc: 50,
        effects: { soutien: 7, mobilisation: 4, sante: 3, caisse: -2 },
        explanation: "Le collectif marque le coup sans basculer immédiatement dans l'affrontement." },
      { text: 'Gérer la crise en cellule réduite', icon: '🧭', risky: true, tag: 'production', skillUp: 'production', dc: 54,
        effects: { production: 4, caisse: 4, influence: 2, soutien: -6 },
        effectsFail: { prestige: -6, soutien: -8, influence: -3 },
        explanation: "Efficace si tout est maîtrisé. Désastreux si la base découvre qu'elle a été contournée." }
    ]
  },
  {
    id: 'gen-rumeur-reseaux',
    era: 3, format: 'reigns', title: 'Rumeur sur les réseaux',
    situation: () => "Un extrait coupé d'une réunion circule. En trois heures, tout le monde croit avoir compris ce qui s'est passé.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Répondre par une vidéo courte', icon: '🎙️', recommended: true, tag: 'discours', skillUp: 'baratin', dc: 46,
        effects: { baratin: 5, prestige: 4, soutien: 3 },
        explanation: "Tu reprends le tempo avant que la rumeur ne devienne archive." },
      { text: 'Demander un droit de réponse formel', icon: '📄', tag: 'institution', skillUp: 'politique', dc: 50,
        effects: { politique: 4, influence: 5, prestige: 2 },
        explanation: "Moins viral, plus solide auprès des acteurs institutionnels." },
      { text: 'Ignorer pour ne pas amplifier', icon: '🤐', risky: true, tag: 'refuse', skillUp: 'expertise', dc: 44,
        effects: { expertise: 3, sante: 3, soutien: -3 },
        effectsFail: { prestige: -7, influence: -4 },
        explanation: "Le silence économise l'énergie, sauf quand il ressemble à un aveu." }
    ]
  },
  {
    id: 'gen-plan-productivite',
    era: 3, format: 'reigns', title: 'Plan productivité',
    situation: ({ camp }) => camp === 'patron'
      ? "Le comité exécutif exige un gain rapide de productivité. Le terrain prévient que les équipes sont déjà à flux tendu."
      : "La direction présente un plan productivité. Les mots sont polis, les cadences le seront moins.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Tester sur un atelier volontaire', icon: '🧪', recommended: true, tag: 'production', skillUp: 'production', dc: 46,
        effects: { production: 5, caisse: 5, sante: -2, soutien: 2 },
        explanation: "Tu limites le risque en apprenant sur un périmètre réel." },
      { text: 'Négocier des contreparties santé', icon: '🩺', tag: 'negocie', skillUp: 'negociation', dc: 55,
        effects: { negociation: 4, sante: 6, soutien: 5, caisse: -3 },
        explanation: "La performance devient acceptable parce qu'elle finance de la protection." },
      { text: 'Passer en force au nom de l’urgence', icon: '⚡', risky: true, tag: 'dur', skillUp: 'politique', dc: 60,
        effects: { politique: 5, caisse: 8, influence: 3, soutien: -10, sante: -6 },
        effectsFail: { soutien: -10, prestige: -5, sante: -8 },
        explanation: "Le coup de force donne parfois des chiffres, rarement de la confiance." }
    ]
  },
  {
    id: 'gen-formation-delegues',
    era: 2, format: 'reigns', title: 'Former la relève',
    situation: () => "Les anciens savent tout faire, les nouveaux n'osent pas encore parler. La prochaine table approche.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Monter une formation express au droit social', icon: '📚', recommended: true, tag: 'institution', skillUp: 'expertise', dc: 42,
        effects: { expertise: 6, influence: 2, soutien: 3, caisse: -2 },
        explanation: "Tu rends l'organisation moins dépendante de deux spécialistes." },
      { text: 'Faire répéter les prises de parole', icon: '🗣️', tag: 'discours', skillUp: 'baratin', dc: 45,
        effects: { baratin: 5, prestige: 3, mobilisation: 2 },
        explanation: "Un bon argument compte deux fois quand il est dit clairement." },
      { text: 'Confier la table aux plus jeunes', icon: '🌱', risky: true, tag: 'mobilise', skillUp: 'mobilisation', dc: 56,
        effects: { mobilisation: 6, soutien: 5, prestige: 2, influence: -2 },
        effectsFail: { prestige: -4, influence: -4, soutien: -2 },
        explanation: "La relève s'apprend en situation, mais la première marche est haute." }
    ]
  },
  {
    id: 'gen-mediation-prefet',
    era: 1, format: 'reigns', title: 'Médiation du préfet',
    situation: () => "Le conflit s'enlise. L'autorité préfectorale propose une médiation, avec procès-verbal et témoins à l'entrée.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Accepter avec mandat écrit', icon: '📜', recommended: true, tag: 'institution', skillUp: 'politique', dc: 48,
        effects: { politique: 5, influence: 6, prestige: 3 },
        explanation: "Tu entres dans l'arène institutionnelle sans perdre ton mandat." },
      { text: 'Exiger une réunion préparatoire bilatérale', icon: '⚖️', tag: 'negocie', skillUp: 'negociation', dc: 52,
        effects: { negociation: 5, influence: 3, soutien: 2 },
        explanation: "Tu clarifies les lignes rouges avant la mise en scène officielle." },
      { text: 'Refuser la médiation publique', icon: '🚪', risky: true, tag: 'refuse', skillUp: 'mobilisation', dc: 58,
        effects: { mobilisation: 5, soutien: 6, influence: -6 },
        effectsFail: { influence: -8, prestige: -5, soutien: -3 },
        explanation: "Tu gardes la main sur le conflit, mais tu peux paraître irresponsable." }
    ]
  },
  {
    id: 'gen-budget-campagne',
    era: 3, format: 'reigns', title: 'Budget de campagne',
    situation: () => "Une campagne d'information est prête. Il faut choisir où mettre l'argent : terrain, expertise ou image.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Financer les tournées d’équipes', icon: '🚐', tag: 'mobilise', skillUp: 'mobilisation', dc: 44,
        effects: { mobilisation: 5, soutien: 6, caisse: -4, sante: -2 },
        explanation: "Le terrain coûte cher, mais il transforme les hésitants en relais." },
      { text: 'Commander une étude indépendante', icon: '📈', recommended: true, tag: 'institution', skillUp: 'expertise', dc: 48,
        effects: { expertise: 6, prestige: 4, caisse: -5, influence: 3 },
        explanation: "Une étude crédible peut survivre à la bataille de communication." },
      { text: 'Acheter une campagne d’affichage', icon: '🪧', tag: 'discours', skillUp: 'baratin', dc: 50,
        effects: { baratin: 5, prestige: 5, caisse: -6, soutien: 2 },
        explanation: "L'image gagne du terrain, à condition que le message soit juste." }
    ]
  },
  {
    id: 'gen-rupture-coalition',
    era: -1, format: 'reigns', title: 'Coalition fragile',
    situation: () => "Un partenaire de coalition menace de partir. Il juge la ligne trop molle, ou trop dure selon le couloir où tu l'écoutes.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Réécrire une plateforme commune', icon: '📝', recommended: true, tag: 'signe', skillUp: 'negociation', dc: 56,
        effects: { negociation: 6, soutien: 5, prestige: 4, influence: 2 },
        explanation: "Tu fabriques un désaccord exprimable, donc négociable." },
      { text: 'Laisser partir pour clarifier la ligne', icon: '✂️', risky: true, tag: 'dur', skillUp: 'politique', dc: 54,
        effects: { politique: 5, prestige: 3, soutien: -5, influence: -3 },
        effectsFail: { soutien: -8, prestige: -5 },
        explanation: "La clarté peut mobiliser. Elle peut aussi isoler." },
      { text: 'Mettre en scène l’unité devant la base', icon: '🤝', tag: 'discours', skillUp: 'baratin', dc: 52,
        effects: { baratin: 5, soutien: 4, symbolique: 2 },
        explanation: "Le symbole tient quelques jours ; il faudra ensuite du contenu." }
    ]
  },
  {
    id: 'gen-audit-comptes',
    era: 2, format: 'reigns', title: 'Audit des comptes',
    situation: () => "Un financeur, une fédération ou un administrateur demande à voir les comptes. Les lignes sont justes, mais pas toutes racontables.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Ouvrir les comptes en transparence', icon: '🔓', recommended: true, tag: 'institution', skillUp: 'expertise', dc: 46,
        effects: { expertise: 5, prestige: 5, soutien: 3 },
        explanation: "La transparence coûte un peu de confort, mais achète beaucoup de confiance." },
      { text: 'Négocier le calendrier de publication', icon: '🗓️', tag: 'negocie', skillUp: 'negociation', dc: 50,
        effects: { negociation: 4, influence: 3, caisse: 2 },
        explanation: "Tu évites le piège du mauvais timing sans refuser le contrôle." },
      { text: 'Enterrer les lignes embarrassantes', icon: '🗄️', risky: true, tag: 'refuse', skillUp: 'politique', dc: 62,
        effects: { politique: 5, caisse: 5, prestige: -6 },
        effectsFail: { prestige: -12, soutien: -8, influence: -5 },
        explanation: "Manoeuvre efficace à court terme, très fragile si elle ressort." }
    ]
  },
  {
    id: 'gen-crise-service',
    era: 3, format: 'reigns', title: 'Service essentiel',
    situation: () => "Une grève ou un incident touche un service essentiel. Le public soutient encore le mouvement, mais l'impatience monte.",
    swipe: { left: 0, right: 1 },
    choices: [
      { text: 'Organiser un service minimum négocié', icon: '🧩', recommended: true, tag: 'negocie', skillUp: 'negociation', dc: 54,
        effects: { negociation: 5, soutien: 5, influence: 4, mobilisation: -2 },
        explanation: "Tu protèges le soutien public sans rendre les armes." },
      { text: 'Expliquer publiquement les causes de la crise', icon: '🎙️', tag: 'discours', skillUp: 'baratin', dc: 50,
        effects: { baratin: 5, prestige: 4, soutien: 3 },
        explanation: "Le public tolère mieux la gêne quand il comprend l'enjeu." },
      { text: 'Tenir le blocage complet', icon: '⛔', risky: true, tag: 'greve', skillUp: 'mobilisation', dc: 64,
        effects: { mobilisation: 7, soutien: -6, influence: -4, sante: -4 },
        effectsFail: { soutien: -12, prestige: -6, sante: -6 },
        explanation: "Le rapport de force devient limpide, et le coût politique aussi." }
    ]
  },
  {
    id: 'hist-1864-ollivier',
    era: 1, format: 'reigns', title: '1864 — supprimer le délit de coalition',
    date: '25 mai 1864',
    situation: () => "Sous le Second Empire, les grèves ouvrières se multiplient malgré la répression. La loi Ollivier ouvre une brèche : la coalition cesse d'être un délit, mais l'organisation syndicale reste interdite.",
    historical: "La loi du 25 mai 1864 supprime le délit de coalition et rend la grève possible sous conditions, sans reconnaître encore les syndicats.",
    portee: "Cette décision marque la première reconnaissance légale d'un moyen d'action collectif des travailleurs depuis 1791. Elle ne crée pas encore la liberté syndicale, mais elle rend le conflit social moins automatiquement criminel. Elle prépare le terrain à la loi Waldeck-Rousseau de 1884 et à la structuration durable du syndicalisme.",
    choices: [
      { text: 'Utiliser la grève légale avec discipline', icon: '✊', recommended: true, tag: 'greve', skillUp: 'mobilisation', dc: 54,
        effects: { mobilisation: 6, soutien: 5, prestige: 3, sante: -3 },
        explanation: "Tu exploites la brèche juridique sans donner prise à la répression." },
      { text: 'Créer une chambre ouvrière discrète', icon: '🕯️', risky: true, tag: 'institution', skillUp: 'politique', dc: 58,
        effects: { politique: 5, influence: 4, mobilisation: 3 },
        effectsFail: { influence: -6, prestige: -4, soutien: -3 },
        explanation: "Tu anticipes le syndicat légal, mais tu avances encore en terrain interdit." }
    ]
  },
  {
    id: 'hist-1884-waldeck',
    era: 2, format: 'reigns', title: '1884 — légaliser les syndicats',
    date: '21 mars 1884',
    situation: () => "La loi Waldeck-Rousseau ouvre la possibilité de constituer librement des syndicats professionnels. Les militants doivent décider comment sortir de la clandestinité sans perdre leur autonomie.",
    historical: "La loi du 21 mars 1884 reconnaît les syndicats professionnels de salariés comme d'employeurs et rompt avec l'interdiction issue de 1791.",
    portee: "Cette décision fait passer le groupement professionnel du registre pénal au registre institutionnel. Elle donne une base durable au syndicalisme français, tout en l'inscrivant dans un cadre juridique contrôlable. Elle ouvre aussi la voie à un paritarisme patronat-salariés, puisque les deux camps peuvent désormais s'organiser légalement.",
    choices: [
      { text: 'Déposer des statuts publics et recruter largement', icon: '📜', recommended: true, tag: 'institution', skillUp: 'politique', dc: 48,
        effects: { politique: 5, influence: 6, soutien: 4, institutionnel: 2 },
        explanation: "Tu acceptes l'institutionnalisation pour donner une existence durable au collectif." },
      { text: 'Garder un noyau combatif semi-clandestin', icon: '🕯️', risky: true, tag: 'mobilise', skillUp: 'mobilisation', dc: 55,
        effects: { mobilisation: 6, soutien: 5, influence: -4 },
        effectsFail: { soutien: -5, influence: -6, prestige: -3 },
        explanation: "Tu préserves la culture de lutte, mais tu exploites mal la fenêtre légale." }
    ]
  },
  {
    id: 'hist-1906-amiens',
    era: 2, format: 'reigns', title: '1906 — Charte d’Amiens',
    date: 'octobre 1906',
    situation: () => "Au congrès confédéral, la question brûle : le syndicat doit-il rester indépendant des partis ou chercher des relais politiques immédiats ?",
    historical: "La Charte d'Amiens affirme l'indépendance syndicale à l'égard des partis et fait de la grève générale un horizon d'émancipation.",
    portee: "La charte fixe une culture durable de l'autonomie syndicale française. Elle distingue l'action revendicative de la conquête électorale du pouvoir. Cette séparation structure encore les tensions entre négociation, mobilisation et stratégie politique.",
    choices: [
      { text: 'Affirmer l’indépendance syndicale', icon: '🧭', recommended: true, tag: 'memoire', skillUp: 'politique', dc: 52,
        effects: { politique: 5, prestige: 5, mobilisation: 3, symbolique: 2 },
        explanation: "Tu construis une ligne doctrinale lisible, capable de survivre aux alternances." },
      { text: 'Chercher un pacte avec les élus proches', icon: '🏛️', tag: 'lobbying', skillUp: 'negociation', dc: 50,
        effects: { negociation: 4, influence: 6, soutien: -3 },
        explanation: "Tu gagnes des relais, mais tu brouilles la frontière entre mandat syndical et mandat politique." }
    ]
  },
  {
    id: 'hist-1919-huit-heures',
    era: 2, format: 'reigns', title: '1919 — journée de huit heures',
    date: '23 avril 1919',
    situation: () => "Après la guerre, les attentes sociales explosent. La réduction du temps de travail devient une revendication centrale et mesurable.",
    historical: "La loi du 23 avril 1919 fixe la journée de huit heures et la semaine de quarante-huit heures.",
    portee: "Le temps de travail devient un objet central de régulation collective. La revendication ne porte plus seulement sur le salaire, mais sur la maîtrise sociale de la vie quotidienne. Elle installe un terrain durable de négociation entre productivité, santé et justice sociale.",
    choices: [
      { text: 'Faire du temps de travail la revendication pivot', icon: '⏱️', recommended: true, tag: 'signe', skillUp: 'negociation', dc: 50,
        effects: { negociation: 5, soutien: 5, sante: 5, caisse: -2 },
        explanation: "Tu rends la revendication précise, vérifiable et difficile à diluer." },
      { text: 'Échanger les heures contre des primes', icon: '💰', risky: true, tag: 'production', skillUp: 'production', dc: 48,
        effects: { production: 4, caisse: 6, sante: -5, soutien: -2 },
        effectsFail: { soutien: -6, sante: -6 },
        explanation: "Tu monétises la fatigue, ce qui peut satisfaire vite et coûter longtemps." }
    ]
  },
  {
    id: 'hist-1936-matignon',
    era: 2, format: 'reigns', title: '1936 — accords de Matignon',
    date: '7 juin 1936',
    situation: () => "Les occupations d'usines ont créé un rapport de force inédit. À Matignon, il faut décider si l'on signe maintenant ou si l'on pousse plus loin.",
    historical: "Les accords de Matignon reconnaissent notamment les conventions collectives, les délégués du personnel, la liberté syndicale et des hausses de salaires.",
    portee: "Matignon transforme une crise sociale en architecture de droits collectifs. Le compromis ne met pas fin à toutes les grèves, mais il donne au conflit une traduction juridique. Il devient un modèle de conversion du rapport de force en institutions du travail.",
    choices: [
      { text: 'Signer pour inscrire les droits dans le droit', icon: '✒️', recommended: true, tag: 'signe', skillUp: 'negociation', dc: 55,
        effects: { negociation: 6, prestige: 7, influence: 4, social: 2 },
        explanation: "Tu convertis la pression en conquête opposable." },
      { text: 'Continuer les occupations pour élargir le gain', icon: '🚩', risky: true, tag: 'greve', skillUp: 'mobilisation', dc: 63,
        effects: { mobilisation: 7, soutien: 6, sante: -6, influence: -4 },
        effectsFail: { soutien: -8, prestige: -5, sante: -8 },
        explanation: "Tu refuses de refermer trop vite la fenêtre historique." }
    ]
  },
  {
    id: 'hist-1945-secu',
    era: 2, format: 'reigns', title: '1945 — gérer la Sécurité sociale',
    date: '4 octobre 1945',
    situation: () => "Les ordonnances de 1945 organisent la Sécurité sociale. Les caisses doivent être administrées avec une forte présence des représentants des assurés sociaux.",
    historical: "L'ordonnance du 4 octobre 1945 organise la Sécurité sociale et prévoit l'administration des caisses par des représentants des travailleurs et des employeurs.",
    portee: "La protection sociale devient un terrain de gestion collective, pas seulement une assistance publique. Les représentants salariés entrent dans l'administration concrète des risques maladie, vieillesse et accidents. Le paritarisme prend ici une dimension matérielle : gérer des caisses, des droits et des budgets.",
    choices: [
      { text: 'Former des administrateurs de caisse', icon: '🏥', recommended: true, tag: 'institution', skillUp: 'expertise', dc: 52,
        effects: { expertise: 6, institutionnel: 3, influence: 5, soutien: 3 },
        explanation: "Tu passes du mot d'ordre à la gestion quotidienne des droits sociaux." },
      { text: 'Refuser la gestion pour rester dans la revendication', icon: '🚪', risky: true, tag: 'refuse', skillUp: 'mobilisation', dc: 54,
        effects: { mobilisation: 5, soutien: 2, influence: -6, expertise: -2 },
        effectsFail: { influence: -8, prestige: -4 },
        explanation: "Tu préserves une posture externe, mais tu laisses d'autres administrer la conquête." }
    ]
  },
  {
    id: 'hist-1946-delegues',
    era: 2, format: 'reigns', title: '1946 — délégués du personnel',
    date: '16 avril 1946',
    situation: () => "La représentation des salariés se stabilise dans l'entreprise. Le mandat local devient un outil pour traiter les réclamations du quotidien.",
    historical: "La loi du 16 avril 1946 organise l'élection des délégués du personnel dans les entreprises.",
    portee: "Le conflit social obtient un relais régulier à l'intérieur de l'entreprise. Les réclamations individuelles et collectives peuvent remonter par des représentants élus. Cette institutionnalisation donne au paritarisme une base de terrain, proche des ateliers et des bureaux.",
    choices: [
      { text: 'Construire un réseau de délégués de proximité', icon: '🧑‍🏭', recommended: true, tag: 'mobilise', skillUp: 'mobilisation', dc: 46,
        effects: { mobilisation: 5, soutien: 6, social: 2 },
        explanation: "Tu rends la représentation visible dans le quotidien du travail." },
      { text: 'Centraliser les dossiers au sommet', icon: '📁', tag: 'institution', skillUp: 'politique', dc: 48,
        effects: { politique: 4, influence: 4, soutien: -3 },
        explanation: "Tu gagnes en cohérence stratégique, mais tu éloignes le mandat du terrain." }
    ]
  },
  {
    id: 'hist-1958-unedic',
    era: 2, format: 'reigns', title: '1958 — assurance chômage paritaire',
    date: '31 décembre 1958',
    situation: () => "Les partenaires sociaux négocient un régime national interprofessionnel d'assurance chômage. Il faut choisir entre autonomie conventionnelle et intégration plus étatique.",
    historical: "L'accord national interprofessionnel du 31 décembre 1958 crée le régime d'assurance chômage et confie sa gestion à l'Unédic et aux Assédic.",
    portee: "L'assurance chômage devient un domaine majeur de la négociation interprofessionnelle. Les partenaires sociaux définissent des règles d'indemnisation et de financement dans un cadre autonome. Ce choix donne au paritarisme français l'un de ses terrains les plus emblématiques.",
    choices: [
      { text: 'Créer une caisse paritaire autonome', icon: '🤝', recommended: true, tag: 'signe', skillUp: 'negociation', dc: 56,
        effects: { negociation: 6, institutionnel: 3, influence: 5, caisse: 3 },
        explanation: "Tu installes un régime piloté par ceux qui cotisent et représentent les salariés." },
      { text: 'Demander une gestion intégralement étatique', icon: '🏛️', tag: 'lobbying', skillUp: 'politique', dc: 52,
        effects: { politique: 5, influence: 4, negociation: -2 },
        explanation: "Tu sécurises l'adossement public, mais tu réduis la capacité d'initiative conventionnelle." }
    ]
  },
  {
    id: 'hist-1968-section-syndicale',
    era: 2, format: 'reigns', title: '1968 — section syndicale d’entreprise',
    date: '27 décembre 1968',
    situation: () => "Après Grenelle, la présence syndicale dans l'entreprise devient un enjeu central. Il faut transformer l'élan social en implantation durable.",
    historical: "La loi du 27 décembre 1968 reconnaît l'exercice du droit syndical dans l'entreprise et accompagne la création de la section syndicale d'entreprise.",
    portee: "Le syndicat n'agit plus seulement aux portes de l'usine ou dans la branche. Il obtient une présence organisée dans le lieu même du travail. Cette implantation modifie profondément les rapports de force quotidiens et la négociation d'entreprise.",
    choices: [
      { text: 'Installer une section syndicale visible', icon: '🏭', recommended: true, tag: 'institution', skillUp: 'mobilisation', dc: 50,
        effects: { mobilisation: 6, soutien: 5, influence: 3, militant: 2 },
        explanation: "Tu enracines l'action collective dans l'entreprise elle-même." },
      { text: 'Rester sur une coordination extérieure', icon: '📬', tag: 'refuse', skillUp: 'baratin', dc: 45,
        effects: { baratin: 4, prestige: 2, influence: -3 },
        explanation: "Tu gardes une parole libre, mais tu perds l'accès aux scènes internes." }
    ]
  },
  {
    id: 'hist-1970-formation',
    era: 3, format: 'reigns', title: '1970-1971 — formation professionnelle',
    date: '9 juillet 1970 / 16 juillet 1971',
    situation: () => "Un accord interprofessionnel sur la formation précède une grande loi. Les partenaires sociaux peuvent traiter la qualification comme un droit négocié.",
    historical: "L'ANI du 9 juillet 1970 précède la loi du 16 juillet 1971, qui organise la formation professionnelle continue dans le cadre de l'éducation permanente.",
    portee: "La formation sort du seul face-à-face scolaire ou patronal. Elle devient un objet de négociation collective, lié à la promotion sociale et à l'adaptation au changement technique. Le paritarisme gagne un rôle d'anticipation des transformations productives.",
    choices: [
      { text: 'Négocier un droit individuel à la formation', icon: '🎓', recommended: true, tag: 'signe', skillUp: 'expertise', dc: 52,
        effects: { expertise: 7, soutien: 4, institutionnel: 2, caisse: -3 },
        explanation: "Tu relies qualification, mobilité et sécurisation des parcours." },
      { text: 'Limiter la formation aux besoins immédiats', icon: '🛠️', tag: 'production', skillUp: 'production', dc: 45,
        effects: { production: 6, caisse: 4, expertise: -2, soutien: -3 },
        explanation: "Tu gagnes en efficacité courte, mais tu réduis la portée émancipatrice du dispositif." }
    ]
  },
  {
    id: 'hist-1982-nao',
    era: 3, format: 'reigns', title: '1982 — négociation annuelle obligatoire',
    date: '13 novembre 1982',
    situation: () => "Les lois Auroux veulent relancer la négociation collective. L'entreprise doit devenir un lieu où salaires et temps de travail reviennent régulièrement à la table.",
    historical: "La loi du 13 novembre 1982 rend obligatoire une négociation annuelle sur les salaires effectifs, la durée effective et l'organisation du temps de travail.",
    portee: "La négociation n'est plus seulement déclenchée par la crise. Elle devient un rendez-vous régulier inscrit dans le droit du travail. Cette obligation transforme la conflictualité diffuse en agenda social négociable.",
    choices: [
      { text: 'Préparer une NAO chiffrée et annuelle', icon: '📊', recommended: true, tag: 'negocie', skillUp: 'negociation', dc: 50,
        effects: { negociation: 6, expertise: 3, soutien: 4 },
        explanation: "Tu transformes la revendication en rituel de négociation." },
      { text: 'Attendre le conflit pour ouvrir la table', icon: '🔥', risky: true, tag: 'greve', skillUp: 'mobilisation', dc: 58,
        effects: { mobilisation: 6, soutien: 5, sante: -5 },
        effectsFail: { soutien: -7, influence: -4, sante: -5 },
        explanation: "Tu gardes un rapport de force fort, mais tu perds la prévisibilité du dialogue." }
    ]
  },
  {
    id: 'hist-1982-chsct',
    era: 3, format: 'reigns', title: '1982 — santé, sécurité, conditions de travail',
    date: '23 décembre 1982',
    situation: () => "Les conditions de travail deviennent un champ institutionnel à part entière. La santé au travail n'est plus seulement une affaire technique.",
    historical: "Les lois Auroux créent le CHSCT et renforcent la prise en compte de l'hygiène, de la sécurité et des conditions de travail.",
    portee: "La santé au travail entre dans la représentation collective avec une instance spécialisée. Les risques professionnels deviennent discutables, documentables et contestables. Cette évolution déplace le paritarisme vers l'organisation concrète du travail.",
    choices: [
      { text: 'Documenter les risques avec les salariés', icon: '🩺', recommended: true, tag: 'institution', skillUp: 'expertise', dc: 49,
        effects: { expertise: 6, sante: 7, soutien: 3 },
        explanation: "Tu donnes une base factuelle à la protection du travail réel." },
      { text: 'Traiter la santé comme un sujet secondaire', icon: '📉', risky: true, tag: 'production', skillUp: 'production', dc: 50,
        effects: { production: 5, caisse: 4, sante: -8, soutien: -4 },
        effectsFail: { sante: -12, prestige: -6 },
        explanation: "Tu protèges la cadence, mais tu fabriques une dette sociale." }
    ]
  },
  {
    id: 'hist-1995-juppe',
    era: 3, format: 'reigns', title: '1995 — plan Juppé',
    date: 'novembre-décembre 1995',
    situation: () => "La réforme des retraites et de la Sécurité sociale provoque une mobilisation massive, notamment dans les transports publics. Le mouvement doit choisir entre tenir et négocier une sortie.",
    historical: "Les grèves de 1995 contre le plan Juppé marquent un moment fort de contestation sociale et conduisent au retrait du volet sur les régimes spéciaux de retraite.",
    portee: "La mobilisation rappelle que la protection sociale reste un objet politique majeur. Les services publics deviennent le point d'appui d'un conflit national sur les retraites. L'épisode pèse durablement sur la manière de réformer les systèmes sociaux en France.",
    choices: [
      { text: 'Construire une grève reconductible', icon: '🚆', recommended: true, tag: 'greve', skillUp: 'mobilisation', dc: 62,
        effects: { mobilisation: 8, soutien: 5, sante: -6, influence: -2 },
        explanation: "Tu relies secteurs stratégiques et opinion publique dans un rapport de force national." },
      { text: 'Négocier une sortie sectorielle rapide', icon: '🧾', tag: 'negocie', skillUp: 'politique', dc: 55,
        effects: { politique: 5, influence: 4, soutien: -4, sante: 3 },
        explanation: "Tu limites l'épuisement, mais tu risques de fragmenter le mouvement." }
    ]
  },
  {
    id: 'hist-1998-35h',
    era: 3, format: 'reigns', title: '1998-2000 — les 35 heures',
    date: '1998-2000',
    situation: () => "La réduction du temps de travail devient un chantier national. Chaque branche et chaque entreprise doit arbitrer entre emploi, organisation et intensification.",
    historical: "Les lois Aubry mettent en place la durée légale de 35 heures et s'appuient fortement sur la négociation d'accords collectifs.",
    portee: "Le temps de travail redevient une politique de l'emploi et de l'organisation productive. La loi fixe un cadre, mais sa traduction dépend massivement d'accords négociés. L'épisode montre que le paritarisme peut être un outil d'application concrète d'une réforme générale.",
    choices: [
      { text: 'Négocier embauches et réduction réelle du temps', icon: '🕰️', recommended: true, tag: 'signe', skillUp: 'negociation', dc: 56,
        effects: { negociation: 6, soutien: 6, sante: 4, caisse: -4 },
        explanation: "Tu fais de la réduction du temps un compromis social complet." },
      { text: 'Annualiser pour préserver la production', icon: '📆', tag: 'production', skillUp: 'production', dc: 50,
        effects: { production: 6, caisse: 5, soutien: -4, sante: -3 },
        explanation: "Tu absorbes la réforme dans l'organisation, au risque de rendre le gain moins lisible." }
    ]
  },
  {
    id: 'hist-2008-representativite',
    era: 3, format: 'reigns', title: '2008 — représentativité syndicale',
    date: '20 août 2008',
    situation: () => "La représentativité syndicale doit désormais se mesurer par l'audience électorale. Les organisations doivent choisir entre implantation patiente et alliances tactiques.",
    historical: "La loi du 20 août 2008 fonde la représentativité syndicale sur plusieurs critères, dont l'audience mesurée aux élections professionnelles.",
    portee: "La légitimité syndicale est davantage reliée au vote des salariés. Le système rompt avec une partie des présomptions historiques de représentativité. La négociation collective devient plus dépendante du résultat électoral et de la transparence organisationnelle.",
    choices: [
      { text: 'Investir les élections professionnelles', icon: '🗳️', recommended: true, tag: 'mobilise', skillUp: 'mobilisation', dc: 52,
        effects: { mobilisation: 5, soutien: 5, influence: 4 },
        explanation: "Tu transformes l'audience en ressource stratégique." },
      { text: 'Construire une liste commune tactique', icon: '🤝', tag: 'negocie', skillUp: 'politique', dc: 54,
        effects: { politique: 5, influence: 4, soutien: -2 },
        explanation: "Tu maximises le seuil, mais tu compliques la lisibilité de ta ligne." }
    ]
  },
  {
    id: 'hist-2013-ani',
    era: 3, format: 'reigns', title: '2013 — sécurisation de l’emploi',
    date: '11 janvier / 14 juin 2013',
    situation: () => "Un ANI sur la sécurisation de l'emploi est transposé dans la loi. La complémentaire santé et les droits rechargeables entrent dans le compromis.",
    historical: "L'ANI du 11 janvier 2013, signé par plusieurs organisations patronales et syndicales, est transposé par la loi du 14 juin 2013.",
    portee: "Le compromis articule flexibilité pour les entreprises et droits nouveaux pour les salariés. Il généralise la complémentaire santé d'entreprise et introduit des mécanismes de sécurisation des parcours. Il illustre la capacité des accords interprofessionnels à préparer la loi.",
    choices: [
      { text: 'Signer un compromis droits contre flexibilité', icon: '⚖️', recommended: true, tag: 'signe', skillUp: 'negociation', dc: 58,
        effects: { negociation: 6, influence: 5, soutien: 3, institutionnel: 2 },
        explanation: "Tu acceptes un compromis imparfait pour créer des droits nouveaux." },
      { text: 'Refuser l’accord au nom des garanties collectives', icon: '✋', risky: true, tag: 'refuse', skillUp: 'baratin', dc: 52,
        effects: { baratin: 5, prestige: 4, influence: -3 },
        effectsFail: { prestige: -5, soutien: -4 },
        explanation: "Tu rends visible le coût social du compromis, mais tu quittes la table de transposition." }
    ]
  },
  {
    id: 'hist-2017-cse',
    era: 3, format: 'reigns', title: '2017 — comité social et économique',
    date: '22 septembre 2017',
    situation: () => "Les ordonnances réorganisent la représentation du personnel. DP, CE et CHSCT fusionnent dans une instance unique : le CSE.",
    historical: "L'ordonnance du 22 septembre 2017 crée le comité social et économique, qui fusionne plusieurs institutions représentatives du personnel.",
    portee: "La représentation du personnel est simplifiée institutionnellement, mais concentrée dans moins de mandats. Les enjeux économiques, réclamations et santé au travail se retrouvent dans une même instance. Cette réforme change l'économie pratique du paritarisme d'entreprise : moins de lieux séparés, plus d'arbitrages internes.",
    choices: [
      { text: 'Spécialiser des élus CSE par dossier', icon: '🧩', recommended: true, tag: 'institution', skillUp: 'expertise', dc: 54,
        effects: { expertise: 6, institutionnel: 3, influence: 3, sante: 2 },
        explanation: "Tu compenses la fusion par une division claire du travail militant." },
      { text: 'Tout miser sur une équipe réduite et agile', icon: '⚡', tag: 'production', skillUp: 'production', dc: 50,
        effects: { production: 5, caisse: 3, sante: -3, soutien: -2 },
        explanation: "Tu gagnes en rapidité, mais tu risques la surcharge des mandats." }
    ]
  }
];
