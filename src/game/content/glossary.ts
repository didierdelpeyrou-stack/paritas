/**
 * Glossaire syndical et paritaire — termes susceptibles de bloquer un
 * joueur novice. Chaque entrée porte une définition courte (1-2
 * phrases) et, si pertinent, l'année ou la loi associée pour ancrer
 * historiquement.
 *
 * Les clés sont les formes canoniques (singulier, sans accent
 * ambigu). La fonction `glossaryLookup` est case-insensitive et
 * supporte aussi les pluriels les plus simples.
 */

export interface GlossaryEntry {
  term: string;
  /** Définition affichée dans le tooltip. */
  definition: string;
  /** Année ou repère historique (optionnel). */
  marker?: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'paritarisme',
    definition:
      "Mode de gouvernance partagé entre représentants des employeurs et des salariés (à parité) sur des sujets sociaux : retraites, chômage, santé, formation. L'État y arbitre rarement.",
    marker: 'France 1944 →'
  },
  {
    term: 'convention collective',
    definition:
      "Accord écrit entre syndicats de salariés et organisations patronales qui fixe des règles supérieures au Code du travail pour une branche ou une entreprise.",
    marker: 'loi de 1919, refonte en 1950'
  },
  {
    term: 'paritaire',
    definition:
      "Qualifie une instance gouvernée à part égale par employeurs et salariés (ex. caisse paritaire, commission paritaire). Modèle inverse de la gestion étatique."
  },
  {
    term: 'unédic',
    definition:
      "Union nationale interprofessionnelle pour l'emploi dans l'industrie et le commerce. Gère l'assurance chômage, fondée par accord paritaire.",
    marker: '31 décembre 1958'
  },
  {
    term: 'agirc-arrco',
    definition:
      "Régimes de retraite complémentaire des salariés du privé, gérés paritairement. Agirc pour les cadres (1947), Arrco pour les non-cadres (1961).",
    marker: '1947 / 1961'
  },
  {
    term: 'cgt',
    definition:
      "Confédération générale du travail. Première confédération syndicale française, fondée à Limoges, longtemps proche du Parti communiste.",
    marker: '1895'
  },
  {
    term: 'cfdt',
    definition:
      "Confédération française démocratique du travail. Issue de la déconfessionnalisation de la CFTC, ligne réformiste, ancrage paritariste.",
    marker: '1964'
  },
  {
    term: 'fo',
    definition:
      "Force ouvrière. Confédération issue d'une scission de la CGT en 1947, attachée à l'indépendance syndicale et au paritarisme.",
    marker: '1947-1948'
  },
  {
    term: 'medef',
    definition:
      "Mouvement des entreprises de France. Successeur du CNPF en 1998, principale organisation patronale interprofessionnelle.",
    marker: '1998'
  },
  {
    term: 'cnpf',
    definition:
      "Conseil national du patronat français. Organisation patronale fondée après-guerre par Georges Villiers, refondée en MEDEF en 1998.",
    marker: '1946-1998'
  },
  {
    term: 'le chapelier',
    definition:
      "Loi du 14 juin 1791 qui interdit toute coalition ouvrière ou patronale, ainsi que les corporations. Reste en vigueur jusqu'en 1864.",
    marker: '1791'
  },
  {
    term: 'délégué syndical',
    definition:
      "Salarié mandaté par son syndicat pour le représenter dans l'entreprise et négocier les accords collectifs.",
    marker: 'loi de 1968'
  },
  {
    term: 'cse',
    definition:
      "Comité social et économique. Instance unique de représentation du personnel issue des ordonnances Macron de 2017, fusionnant CE, DP et CHSCT.",
    marker: '2017'
  },
  {
    term: 'matignon',
    definition:
      "Accords signés à l'Hôtel Matignon dans la nuit du 7-8 juin 1936 entre CGT, CGPF et le gouvernement Blum. Reconnaissance des conventions collectives, hausses de salaires, congés payés.",
    marker: '1936'
  },
  {
    term: 'grenelle',
    definition:
      "Accords négociés rue de Grenelle (ministère du Travail) en mai-juin 1968. SMIG +35%, salaires +10%, droit syndical d'entreprise.",
    marker: '1968'
  },
  {
    term: 'jeanneney',
    definition:
      "Convention collective nationale interprofessionnelle de 1967 (ministre Jean-Marcel Jeanneney). Étend l'assurance chômage à tous les salariés du privé.",
    marker: '1967'
  },
  {
    term: 'auroux',
    definition:
      "Quatre lois sociales de 1982 (ministre Jean Auroux) qui élargissent les droits syndicaux dans l'entreprise : négociation annuelle obligatoire, droit d'expression directe, élargissement des CHSCT.",
    marker: '1982'
  },
  {
    term: 'ani',
    definition:
      "Accord national interprofessionnel. Texte signé entre confédérations syndicales et organisations patronales, souvent transposé ensuite en loi.",
    marker: 'mécanisme permanent'
  },
  {
    term: 'sécurité sociale',
    definition:
      "Système d'assurance sociale obligatoire couvrant maladie, vieillesse, famille, accidents du travail. Ordonnances du 4 octobre 1945, gestion paritaire à l'origine.",
    marker: '4 octobre 1945'
  },
  {
    term: 'cnr',
    definition:
      "Conseil national de la Résistance. Programme du 15 mars 1944 dit « Les Jours heureux », fondement social de la Libération (Sécu, nationalisations, paritarisme).",
    marker: '1944'
  },
  {
    term: 'livret ouvrier',
    definition:
      "Document obligatoire instauré par Bonaparte le 12 avril 1803 : tout ouvrier doit le faire tamponner par son patron. Outil de contrôle policier de la main-d'œuvre.",
    marker: '1803-1890'
  },
  {
    term: 'corporation',
    definition:
      "Organisation médiévale et d'Ancien Régime regroupant tous les artisans d'un même métier dans une ville. Abolies par le décret d'Allarde (1791).",
    marker: 'XIIe-1791'
  },
  {
    term: 'compagnonnage',
    definition:
      "Système de formation et d'entraide ouvrière par le voyage (Tour de France des compagnons). Existe encore aujourd'hui pour les métiers du bâtiment.",
    marker: 'XIIIe → présent'
  },
  {
    term: 'charte d\'amiens',
    definition:
      "Texte adopté au congrès CGT d'Amiens en 1906. Affirme l'indépendance du syndicat vis-à-vis des partis politiques et la « double besogne » : revendiquer + préparer l'émancipation.",
    marker: '1906'
  },
  {
    term: 'code pénal',
    definition:
      "Articles 414-416 du Code pénal de 1810. Renforcent la loi Le Chapelier en sanctionnant pénalement les coalitions ouvrières (jusqu'à la loi Ollivier de 1864).",
    marker: '1810-1864'
  },
  {
    term: 'ollivier',
    definition:
      "Loi du 25 mai 1864 (Émile Ollivier) qui dépénalise le droit de coalition et de grève en France. Première reconnaissance légale du conflit collectif.",
    marker: '1864'
  },
  {
    term: 'waldeck-rousseau',
    definition:
      "Loi du 21 mars 1884 qui légalise les syndicats professionnels. Pierre fondatrice du syndicalisme français moderne.",
    marker: '1884'
  }
];

const INDEX = new Map<string, GlossaryEntry>(
  GLOSSARY.map(e => [normalize(e.term), e])
);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** Cherche un terme (insensible à la casse, aux accents et au pluriel simple). */
export function glossaryLookup(term: string): GlossaryEntry | null {
  const k = normalize(term);
  const direct = INDEX.get(k);
  if (direct) return direct;
  // Pluriels/singuliers simples
  if (k.endsWith('s')) {
    const sing = INDEX.get(k.slice(0, -1));
    if (sing) return sing;
  } else {
    const plur = INDEX.get(k + 's');
    if (plur) return plur;
  }
  return null;
}
