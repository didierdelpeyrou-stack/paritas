/* ============================================================
   Paritas — fil d'actualités historiques (V3)
   ============================================================
   Bandeau qui défile en continu sous la timeline des ères.
   4 catégories : technologie, géopolitique, politique
   intérieure, faits divers.

   Certains items sont CLIQUABLES quand ils sont liés à un
   `sideEventId` et que le camp du joueur correspond — ils
   ouvrent alors la quête secondaire correspondante.
   ============================================================ */

import type { Camp } from '../../lib/types';

export type NewsCategory = 'tech' | 'geopolitique' | 'politique' | 'faitsdivers';

export interface HistoricalNews {
  id: string;
  /** Tour minimum d'apparition. */
  fromTurn: number;
  /** Tour de retrait du bandeau (au-delà, l'item disparaît). */
  toTurn: number;
  category: NewsCategory;
  /** Headline courte (≤ 80 caractères de préférence). */
  headline: string;
  /** Année affichée en préfixe (sinon dérivée de fromTurn). */
  year?: number;
  /** Si défini, l'item est cliquable et ouvre cet événement secondaire
   *  — sous réserve que le camp matche. */
  sideEventId?: string;
  /** Camp pour lequel l'item est interactif. Si absent → tous. */
  camp?: Camp;
}

/* ============================================================
   Causal news : items injectés dans le ticker en réaction aux
   choix du joueur (cf. critique designer §Décision 5 : « Donner
   au ticker du haut une vraie causalité »).

   Indexé par flag du choix (pose le drapeau qui matche dans la
   mémoire historique). Le store causalTicker prend cet item, le
   place en tête du fil avec un marqueur "fresh" pour quelques
   tours, puis il vit avec les autres news.
   ============================================================ */

export interface CausalNewsTemplate {
  category: NewsCategory;
  /** Headline avec un placeholder optionnel {year} qui sera remplacé. */
  headline: string;
  /** Tonalité : 'world-acquiesce' (le monde valide) / 'world-oppose'
   *  (le monde résiste). UI peut le coloriser plus tard. */
  tone?: 'acquiesce' | 'oppose' | 'neutral';
}

/** Un flag de choix → un (ou plusieurs) item de news que le monde
 *  émet en réponse. La news vit dans le ticker pendant ~6 tours. */
export const CAUSAL_NEWS_BY_FLAG: Record<string, CausalNewsTemplate[]> = {
  /* === Matignon 1936 === */
  'signe-matignon': [
    { category: 'politique', tone: 'acquiesce',
      headline: 'Accords Matignon signés — la presse ouvrière jubile, la presse patronale s\'incline.' },
    { category: 'faitsdivers', tone: 'acquiesce',
      headline: 'Premiers trains de congés payés vers la mer, Gare d\'Austerlitz pleine.' }
  ],
  'refuse-compromis': [
    { category: 'politique', tone: 'oppose',
      headline: 'Échec à Matignon — le patronat se reprend, l\'occupation des usines continue.' }
  ],
  /* === Matignon 1936 — branches patronales === */
  'jouer-cgt-cgtu': [
    { category: 'politique', tone: 'oppose',
      headline: 'Tensions internes à la CGT — la presse patronale parle de « fissure réformiste ».' }
  ],
  'mediation-elysee': [
    { category: 'politique', tone: 'oppose',
      headline: 'Lebrun consulté en pleine nuit — l\'Élysée refuse de prendre position.' }
  ],

  /* === Side-events syndicaux === */
  'corrompu-prefecture': [
    { category: 'faitsdivers', tone: 'oppose',
      headline: 'Rumeur en préfecture : un sergent de ville aurait été acheté pour un meeting.' }
  ],
  'police-avec-nous': [
    { category: 'faitsdivers', tone: 'acquiesce',
      headline: 'Un sergent de ville se range du côté des grévistes — chronique d\'un miracle.' }
  ],
  'rachete-talent': [
    { category: 'faitsdivers',
      headline: 'Caillou retire sa démission, monte à Paris — la fédération recase ses cadres.' }
  ],
  'trahi-talent': [
    { category: 'faitsdivers', tone: 'oppose',
      headline: 'Le bulletin syndical publie « Un des nôtres a vendu sa carte ». Indignation interne.' }
  ],

  /* === Side-events patronaux === */
  'paye-prefet': [
    { category: 'politique', tone: 'oppose',
      headline: 'Trois meneurs CGT licenciés en quinzaine — le patronat satisfait.' }
  ],
  /* Refus éthique du préfet : récompense narrative pour le geste de
     dignité (cf. retour Argus — Patrick R., Rosanvallon : sans cette
     news le bon choix éthique côté patron est silencieux). */
  'refuse-prefet': [
    { category: 'faitsdivers', tone: 'acquiesce',
      headline: 'La presse libérale cite un patron qui « refuse les méthodes de la préfecture ».' }
  ],
  'protege-mouchard': [
    { category: 'faitsdivers', tone: 'oppose',
      headline: 'Un nouveau chef d\'équipe nommé sans ancienneté — l\'atelier murmure.' }
  ],
  /* Refus éthique du mouchard interne : moralité d'entreprise reconnue. */
  'refuse-mouchard': [
    { category: 'faitsdivers', tone: 'acquiesce',
      headline: 'Un délégué CGT salue un patron qui « refuse les méthodes de dénonciation ».' }
  ],
  'capital-anglais': [
    { category: 'geopolitique',
      headline: 'La City prend pied dans l\'industrie française — chronométrages à Manchester.' }
  ],
  'promu-vidal': [
    { category: 'faitsdivers',
      headline: 'Un nouveau cadre sort des rangs ouvriers — déjeuner au Cercle des dirigeants.' }
  ],

  /* === Long-terme === */
  'epuise-mouvement': [
    { category: 'faitsdivers', tone: 'oppose',
      headline: 'Manifestants épuisés s\'éparpillent. Les caisses syndicales se vident.' }
  ],
  'desavoue-section': [
    { category: 'politique', tone: 'oppose',
      headline: 'Une section régionale rompt avec la fédération — début de scission ?' }
  ]
};

/* ============================================================
   Pool : ~40 items répartis sur 100 tours, mélange de catégories
   ============================================================ */
export const HISTORICAL_NEWS: HistoricalNews[] = [

  /* ====== Révolution & Empire (T1–T3) ====== */
  { id: 'guillotine-1792', fromTurn: 1, toTurn: 3, category: 'politique', year: 1792,
    headline: 'La Convention décrète l\'abolition de la royauté.' },
  { id: 'cugnot-fardier', fromTurn: 1, toTurn: 4, category: 'tech', year: 1791,
    headline: 'Le fardier à vapeur de Cugnot exposé au Conservatoire des Arts et Métiers.' },
  { id: 'le-chapelier-1791', fromTurn: 1, toTurn: 4, category: 'politique', year: 1791,
    headline: 'Loi Le Chapelier : interdiction des associations ouvrières et corporations.' },
  { id: 'corsaire-surcouf', fromTurn: 2, toTurn: 5, category: 'faitsdivers', year: 1796,
    headline: 'Le corsaire Surcouf capture trois navires anglais en mer d\'Oman.' },

  /* ====== XIXe (T4–T13) ====== */
  { id: 'metro-londres', fromTurn: 5, toTurn: 8, category: 'tech', year: 1825,
    headline: 'Stockton-Darlington : la première ligne de chemin de fer ouvre en Angleterre.' },
  { id: 'monroe-doctrine', fromTurn: 4, toTurn: 6, category: 'geopolitique', year: 1823,
    headline: 'Doctrine Monroe : « L\'Amérique aux Américains. »' },
  { id: 'sergent-de-ville-rumeur', fromTurn: 5, toTurn: 9, category: 'faitsdivers', year: 1840,
    headline: 'Place de Grève : un meeting interdit, un sergent de ville hésite.',
    sideEventId: 'sergent-de-ville-1840', camp: 'salarie' },
  { id: 'comite-des-forges', fromTurn: 6, toTurn: 10, category: 'politique', year: 1864,
    headline: 'Création du Comité des Forges : naissance du patronat sidérurgique organisé.' },
  { id: 'commune-1871', fromTurn: 7, toTurn: 9, category: 'politique', year: 1871,
    headline: 'La Commune de Paris : 72 jours qui ébranleront le siècle.' },
  { id: 'marx-capital', fromTurn: 6, toTurn: 10, category: 'politique', year: 1867,
    headline: 'Karl Marx publie le premier livre du Capital à Hambourg.' },
  { id: 'edison-ampoule', fromTurn: 9, toTurn: 12, category: 'tech', year: 1879,
    headline: 'Edison brevette la première ampoule à incandescence durable.' },
  { id: 'imprimeur-clandestin', fromTurn: 8, toTurn: 12, category: 'faitsdivers', year: 1878,
    headline: 'Rumeur d\'un imprimeur clandestin rue Mouffetard menacé de dénonciation.',
    sideEventId: 'imprimeur-clandestin', camp: 'salarie' },

  /* ====== Belle Époque (T14–T16) ====== */
  { id: 'curie-radium', fromTurn: 14, toTurn: 16, category: 'tech', year: 1898,
    headline: 'Pierre et Marie Curie isolent le radium dans un hangar à Paris.' },
  { id: 'dreyfus-affair', fromTurn: 13, toTurn: 16, category: 'politique', year: 1898,
    headline: 'Émile Zola publie « J\'accuse... ! » dans L\'Aurore.' },
  { id: 'wright-flyer', fromTurn: 14, toTurn: 17, category: 'tech', year: 1903,
    headline: 'Premier vol motorisé des frères Wright à Kitty Hawk.' },
  { id: 'separation-eglises', fromTurn: 14, toTurn: 16, category: 'politique', year: 1905,
    headline: 'Loi de séparation des Églises et de l\'État.' },

  /* ====== Entre-deux-guerres (T17–T22) ====== */
  { id: 'tsf-radio-paris', fromTurn: 17, toTurn: 20, category: 'tech', year: 1922,
    headline: 'Radio Paris diffuse son premier journal parlé depuis la tour Eiffel.' },
  { id: 'krach-1929', fromTurn: 18, toTurn: 21, category: 'geopolitique', year: 1929,
    headline: 'Wall Street s\'effondre : Black Thursday et début de la crise mondiale.' },
  { id: 'matignon-rumeur', fromTurn: 19, toTurn: 21, category: 'politique', year: 1936,
    headline: 'Front populaire : Blum convoque CGT et CGPF à Matignon dans la nuit.' },
  { id: 'preposition-pour', fromTurn: 17, toTurn: 22, category: 'faitsdivers', year: 1925,
    headline: 'Un préfet de l\'Aisne prêt à fournir « une liste utile » contre une contribution charitable.',
    sideEventId: 'prefet-recoit', camp: 'patron' },
  { id: 'whitfield-londres', fromTurn: 18, toTurn: 22, category: 'geopolitique', year: 1928,
    headline: 'La City de Londres pousse à l\'investissement dans l\'industrie française.',
    sideEventId: 'investisseur-britannique', camp: 'patron' },
  { id: 'contremaitre-vidal', fromTurn: 18, toTurn: 24, category: 'faitsdivers', year: 1932,
    headline: 'Pénurie de contremaîtres expérimentés : Berliet débauche dans toute la province.',
    sideEventId: 'contremaitre-reclame', camp: 'patron' },

  /* ====== Reconstruction & Guerre froide (T23–T28) ====== */
  { id: 'cnr-1944', fromTurn: 23, toTurn: 25, category: 'politique', year: 1944,
    headline: 'Programme du Conseil National de la Résistance : « Les Jours heureux ».' },
  { id: 'secu-1945', fromTurn: 23, toTurn: 26, category: 'politique', year: 1945,
    headline: 'Création de la Sécurité sociale : « De chacun selon ses moyens... »' },
  { id: 'bombe-bikini', fromTurn: 24, toTurn: 27, category: 'tech', year: 1946,
    headline: 'Essais nucléaires américains à l\'atoll de Bikini.' },
  { id: 'plan-marshall', fromTurn: 25, toTurn: 28, category: 'geopolitique', year: 1947,
    headline: 'Plan Marshall : 13 milliards de dollars pour reconstruire l\'Europe.' },
  { id: 'fo-scission-1947', fromTurn: 25, toTurn: 28, category: 'politique', year: 1947,
    headline: 'Scission CGT-FO : la non-communiste prend le large.' },

  /* ====== Trente Glorieuses (T29–T34) ====== */
  { id: 'sputnik-1957', fromTurn: 29, toTurn: 31, category: 'tech', year: 1957,
    headline: 'Lancement de Spoutnik : l\'URSS prend l\'avantage spatial.' },
  { id: 'evian-1962', fromTurn: 29, toTurn: 32, category: 'geopolitique', year: 1962,
    headline: 'Accords d\'Évian : indépendance de l\'Algérie.' },
  { id: 'mai-68', fromTurn: 30, toTurn: 33, category: 'politique', year: 1968,
    headline: 'Mouvement de mai : 10 millions de grévistes, accords de Grenelle.' },
  { id: 'concorde-1969', fromTurn: 30, toTurn: 33, category: 'tech', year: 1969,
    headline: 'Premier vol du Concorde à Toulouse.' },
  { id: 'greve-hayange', fromTurn: 30, toTurn: 33, category: 'faitsdivers', year: 1967,
    headline: 'Hayange : grève sauvage à la sidérurgie, 800 ouvriers en colère.',
    sideEventId: 'greve-sauvage-section', camp: 'salarie' },

  /* ====== Crise (T35–T36) ====== */
  { id: 'choc-petrolier', fromTurn: 35, toTurn: 38, category: 'geopolitique', year: 1973,
    headline: 'Premier choc pétrolier : le baril quadruple en six mois.' },
  { id: 'micro-altair', fromTurn: 35, toTurn: 38, category: 'tech', year: 1975,
    headline: 'Sortie de l\'Altair 8800 : premier micro-ordinateur grand public.' },
  { id: 'libe-fonde', fromTurn: 35, toTurn: 38, category: 'faitsdivers', year: 1973,
    headline: 'Sartre lance Libération : un journal autogéré sans hiérarchie.' },

  /* ====== Mitterrand & cohabitations (T37–T56) ====== */
  { id: 'auroux-lois', fromTurn: 38, toTurn: 42, category: 'politique', year: 1982,
    headline: 'Lois Auroux : nouveaux droits des salariés dans l\'entreprise.' },
  { id: 'minitel-1982', fromTurn: 38, toTurn: 42, category: 'tech', year: 1982,
    headline: 'Le Minitel se déploie dans tous les foyers français.' },
  { id: 'tchernobyl', fromTurn: 40, toTurn: 43, category: 'geopolitique', year: 1986,
    headline: 'Catastrophe nucléaire de Tchernobyl : le nuage s\'arrête à la frontière française.' },
  { id: 'mur-berlin', fromTurn: 41, toTurn: 44, category: 'geopolitique', year: 1989,
    headline: 'Chute du mur de Berlin : un monde bascule.' },
  { id: 'plan-juppe', fromTurn: 45, toTurn: 49, category: 'politique', year: 1995,
    headline: 'Plan Juppé : grève des cheminots, paralysie de Paris pendant trois semaines.' },
  { id: 'web-1991', fromTurn: 44, toTurn: 47, category: 'tech', year: 1991,
    headline: 'Tim Berners-Lee met en ligne la première page web au CERN.' },
  { id: 'aubry-35h', fromTurn: 47, toTurn: 51, category: 'politique', year: 1998,
    headline: 'Loi Aubry : passage progressif aux 35 heures hebdomadaires.' },

  /* ====== Sarkozy / Hollande (T57–T68) ====== */
  { id: 'subprimes-2008', fromTurn: 58, toTurn: 61, category: 'geopolitique', year: 2008,
    headline: 'Faillite de Lehman Brothers : crise financière mondiale.' },
  { id: 'iphone-2007', fromTurn: 57, toTurn: 60, category: 'tech', year: 2007,
    headline: 'Steve Jobs présente le premier iPhone à la conférence Macworld.' },
  { id: 'gilets-jaunes-precoce', fromTurn: 60, toTurn: 64, category: 'politique', year: 2010,
    headline: 'Mouvement contre la réforme des retraites : 2 millions dans la rue.' },
  { id: 'loi-travail-2016', fromTurn: 65, toTurn: 68, category: 'politique', year: 2016,
    headline: 'Loi El Khomri : printemps de mobilisation contre la « loi travail ».' },

  /* ====== Macron I (T69–T78) ====== */
  { id: 'ordonnances-macron', fromTurn: 69, toTurn: 72, category: 'politique', year: 2017,
    headline: 'Ordonnances Macron : inversion de la hiérarchie des normes.' },
  { id: 'gilets-jaunes', fromTurn: 70, toTurn: 74, category: 'politique', year: 2018,
    headline: 'Gilets jaunes : occupation des ronds-points, samedis de manifestation.' },
  { id: 'covid-2020', fromTurn: 73, toTurn: 78, category: 'geopolitique', year: 2020,
    headline: 'Pandémie de Covid-19 : confinement mondial, chômage partiel massif.' },
  { id: 'gpt-3', fromTurn: 74, toTurn: 78, category: 'tech', year: 2020,
    headline: 'OpenAI dévoile GPT-3 : un modèle de langage capable d\'écrire seul.' },

  /* ====== Macron II & présent (T79–T100) ====== */
  { id: 'guerre-ukraine', fromTurn: 79, toTurn: 84, category: 'geopolitique', year: 2022,
    headline: 'Invasion russe de l\'Ukraine : retour de la guerre conventionnelle en Europe.' },
  { id: 'retraites-2023', fromTurn: 80, toTurn: 86, category: 'politique', year: 2023,
    headline: 'Réforme des retraites : 14 journées d\'action, 49.3 et incendies de poubelles.' },
  { id: 'chatgpt-2023', fromTurn: 80, toTurn: 86, category: 'tech', year: 2023,
    headline: 'ChatGPT atteint 100 millions d\'utilisateurs en deux mois.' },
  { id: 'tesla-cybertruck', fromTurn: 82, toTurn: 87, category: 'tech', year: 2023,
    headline: 'Tesla livre les premiers Cybertruck après quatre ans de retard.' },
  { id: 'jo-paris-2024', fromTurn: 84, toTurn: 88, category: 'faitsdivers', year: 2024,
    headline: 'Jeux Olympiques de Paris : la Seine, théâtre de la cérémonie d\'ouverture.' },
  { id: 'ai-act-2024', fromTurn: 85, toTurn: 90, category: 'politique', year: 2024,
    headline: 'L\'AI Act européen entre en vigueur : premier cadre mondial sur l\'IA.' },
  { id: 'plateformes-uber-2024', fromTurn: 85, toTurn: 92, category: 'politique', year: 2024,
    headline: 'Directive européenne sur le travail des plateformes : présomption de salariat.' },
  { id: 'climate-2025', fromTurn: 88, toTurn: 95, category: 'geopolitique', year: 2025,
    headline: 'Records de chaleur en juin : la France dépasse les 45°C dans le Sud.' },
  { id: 'talent-marseille', fromTurn: 90, toTurn: 96, category: 'faitsdivers', year: 2025,
    headline: 'Pénurie de cadres syndicaux : un militant sur trois quitte le mouvement en 5 ans.',
    sideEventId: 'talent-trahit-marseille', camp: 'salarie' },
  { id: 'employe-denonce-2025', fromTurn: 88, toTurn: 96, category: 'faitsdivers', year: 2025,
    headline: 'Hotline RH anonyme chez TotalEnergies : 1200 signalements en six mois.',
    sideEventId: 'employe-denonce', camp: 'patron' }
];

const CATEGORY_LABEL: Record<NewsCategory, string> = {
  tech: 'Tech',
  geopolitique: 'Géopolitique',
  politique: 'Politique',
  faitsdivers: 'Société'
};

const CATEGORY_COLOR: Record<NewsCategory, string> = {
  tech: '#5CB6C8',
  geopolitique: '#D9821C',
  politique: '#B0181E',
  faitsdivers: '#8E64C0'
};

export function categoryLabel(c: NewsCategory): string { return CATEGORY_LABEL[c]; }
export function categoryColor(c: NewsCategory): string { return CATEGORY_COLOR[c]; }

/** Items actifs au tour donné, triés chronologiquement. */
export function activeNews(turn: number): HistoricalNews[] {
  return HISTORICAL_NEWS
    .filter(n => turn >= n.fromTurn && turn <= n.toTurn)
    .sort((a, b) => (a.year ?? a.fromTurn) - (b.year ?? b.fromTurn));
}

/** Vrai si l'item est cliquable pour le camp donné — c.-à-d. lié à un
 *  side event accessible. */
export function isInteractive(news: HistoricalNews, camp: Camp): boolean {
  if (!news.sideEventId) return false;
  if (news.camp && news.camp !== camp) return false;
  return true;
}
