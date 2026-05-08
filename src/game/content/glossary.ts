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
  },
  {
    term: 'plan juppé',
    definition:
      'Réforme de la Sécurité sociale et des régimes spéciaux annoncée par Alain Juppé le 15 novembre 1995. Trois semaines de grève générale firent reculer le volet retraites.',
    marker: 'novembre-décembre 1995'
  },
  {
    term: 'loi el khomri',
    definition:
      "Loi Travail du 8 août 2016 portée par Myriam El Khomri. Première inversion de la hiérarchie des normes : l'accord d'entreprise peut déroger à la convention collective de branche.",
    marker: '2016'
  },
  {
    term: 'loi travail',
    definition:
      "Voir Loi El Khomri (2016). Première inversion légale de la hiérarchie des normes en droit du travail français.",
    marker: '2016'
  },
  {
    term: 'ordonnances macron',
    definition:
      "Cinq ordonnances signées le 22 septembre 2017 : fusion CE/DP/CHSCT en un Comité social et économique unique (CSE), barème prud'homal, primauté de l'accord d'entreprise.",
    marker: '2017'
  },
  {
    term: 'réforme fillon',
    definition:
      "Réforme des retraites de 2003 portée par François Fillon. Aligne 40 ans de cotisation pour le secteur public sur le privé. Première grande défaite syndicale post-1995.",
    marker: '2003'
  },
  {
    term: 'réforme woerth',
    definition:
      "Réforme des retraites de 2010 portée par Éric Woerth. Repousse l'âge légal de 60 à 62 ans malgré 7 journées de mobilisation interprofessionnelle.",
    marker: '2010'
  },
  {
    term: 'bercy',
    definition:
      "Métonymie pour le ministère de l'Économie et des Finances, situé à Bercy à Paris. Souvent associé aux logiques d'austérité budgétaire.",
    marker: 'Paris'
  },
  {
    term: 'élysée',
    definition:
      "Palais de la République française, résidence et bureau du président. Lieu d'arbitrage final pour les grandes réformes sociales.",
    marker: 'Paris'
  },
  {
    term: 'préfet',
    definition:
      "Représentant de l'État dans un département. Sous le XIXe siècle, principal interlocuteur (et parfois adversaire) des grèves locales.",
    marker: 'depuis 1800'
  },
  {
    term: 'conseil d\'état',
    definition:
      "Plus haute juridiction administrative française. Statue sur les recours contre les décisions de l'État, y compris les décrets sociaux.",
    marker: '1799'
  },
  {
    term: 'conseil constitutionnel',
    definition:
      "Veille à la conformité des lois à la Constitution. Sanctionne ou valide les réformes contestées par 60 députés ou sénateurs.",
    marker: '1958'
  },
  {
    term: 'chsct',
    definition:
      "Comité d'hygiène, de sécurité et des conditions de travail. Créé par les lois Auroux de 1982, fusionné dans le CSE en 2017.",
    marker: '1982-2017'
  },
  {
    term: 'branche',
    definition:
      "Secteur professionnel régi par sa propre convention collective. La négociation de branche structure historiquement le paritarisme français.",
    marker: 'depuis 1919'
  },
  {
    term: 'pénibilité',
    definition:
      "Reconnaissance officielle des conditions de travail dégradantes (charges lourdes, gestes répétitifs, nuit, etc.). Donne droit à un compte personnel de prévention.",
    marker: '2010+'
  },
  {
    term: 'prud\'hommes',
    definition:
      "Conseil de prud'hommes : juridiction paritaire (employeurs/salariés élus à parité) qui tranche les litiges individuels du travail.",
    marker: '1806 / refonte 1979'
  },
  {
    term: 'opco',
    definition:
      "Opérateur de compétences. Organisme paritaire qui finance la formation professionnelle dans une branche depuis la loi « Avenir professionnel » de 2018.",
    marker: '2018'
  },
  {
    term: 'gpec',
    definition:
      "Gestion prévisionnelle des emplois et des compétences. Outil paritaire de planification des évolutions de métiers, des reconversions, de la formation.",
    marker: '2005+'
  },
  {
    term: 'cnpf',
    definition:
      "Conseil national du patronat français. Organisation patronale fondée par Georges Villiers en juin 1946, refondée en MEDEF en 1998.",
    marker: '1946-1998'
  },
  {
    term: 'cpme',
    definition:
      'Confédération des petites et moyennes entreprises (avant 2017 : CGPME). Représente le patronat des PME-TPE, voix souvent distincte du MEDEF.',
    marker: '2017 (depuis 1944 sous CGPME)'
  },
  {
    term: 'u2p',
    definition:
      "Union des entreprises de proximité. Représente les artisans, commerçants et professions libérales. Voix patronale spécifique aux TPE.",
    marker: '2016'
  },
  {
    term: 'fsu',
    definition:
      "Fédération syndicale unitaire. Principale organisation syndicale de l'éducation nationale et de la fonction publique d'État, créée en 1993.",
    marker: '1993'
  },
  {
    term: 'solidaires',
    definition:
      "Union syndicale Solidaires (anciennement Sud-Solidaires). Confédération issue de la scission CFDT télécoms en 1989, ligne d'autonomie radicale.",
    marker: '1989'
  },
  {
    term: 'unsa',
    definition:
      "Union nationale des syndicats autonomes. Confédération créée en 1993 sur une ligne réformiste indépendante des grandes confédérations historiques.",
    marker: '1993'
  },
  {
    term: 'ai act',
    definition:
      "Règlement européen sur l'intelligence artificielle (avril 2024). Classe les usages d'IA en risques (interdits, élevés, limités) et encadre l'IA dans la gestion RH.",
    marker: 'avril 2024'
  },
  {
    term: 'directive',
    definition:
      "Acte juridique de l'Union européenne fixant des objectifs aux États membres, qui doivent transposer en droit national dans un délai donné.",
    marker: 'instrument UE'
  },
  {
    term: 'cgpf',
    definition:
      "Confédération générale du patronat français. Organisation patronale majeure entre 1936 et 1946. Ancêtre direct du CNPF puis du MEDEF.",
    marker: '1936-1946'
  },
  {
    term: 'cgtu',
    definition:
      "CGT-Unitaire. Confédération issue de la scission de la CGT au congrès de Lille en 1921. Affiliée à l'Internationale syndicale rouge (Moscou). Refusionne en 1936 pour le Front populaire.",
    marker: '1921-1936'
  },
  {
    term: 'collegia',
    definition:
      'Associations professionnelles romaines (artisans, marchands, dockers). Reconnues et encadrées par le Sénat. Ancêtre lointain des corporations médiévales.',
    marker: 'IIIe s. av. - IVe s.'
  },
  {
    term: 'allarde',
    definition:
      "Décret des 2 et 17 mars 1791. Abolit les corporations et instaure la liberté du commerce et de l'industrie. Précède la loi Le Chapelier de trois mois.",
    marker: 'mars 1791'
  },
  {
    term: 'tour de france',
    definition:
      "Voyage initiatique des compagnons (Compagnonnage du Devoir). De ville en ville, ils approfondissent leur métier auprès de différents maîtres.",
    marker: 'depuis le XIIe siècle'
  },
  {
    term: 'mineur',
    definition:
      "Ouvrier travaillant dans les mines (charbon, fer, sel). Métier longtemps emblématique du syndicalisme industriel français — Décazeville 1886, fédération nationale 1893.",
    marker: 'XIXe-XXe s.'
  },
  {
    term: 'institution',
    definition:
      "Capital salarial conquis et institutionnalisé. La cotisation EST du salaire, socialisé via mutuelle (1864), syndicat (1884), conventions (1919), Sécu (1945) et leurs descendants paritaires. La gestion paritaire les distingue des dispositifs étatiques — l'institution n'est pas l'État, ni le marché : c'est la part socialisée du salaire que les travailleurs gèrent eux-mêmes.",
    marker: '1864 → 1945 → ajd.'
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
