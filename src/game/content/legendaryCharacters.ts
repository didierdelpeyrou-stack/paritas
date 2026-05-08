/* Paritas Rebirth — legendaryCharacters.ts
 *
 * Personnages légendaires jouables dès l'écran d'accueil.
 * Chaque figure historique vient avec :
 *   - un trait dominant initial (traitBonus)
 *   - des ressources de départ ajustées (resourceBonus)
 *   - une signature (citation iconique)
 *
 * Source : 00_bibliographie_master.md §4 (Personnages historiques).
 */

import type { Camp } from '../../lib/types';
import type { Resources, TraitScores } from '../types';

export interface LegendaryCharacter {
  id: string;
  /** Nom complet affiché */
  name: string;
  /** Initiales pour avatar */
  init: string;
  /** Années d'activité */
  years: string;
  /** Étiquette de période ("Front populaire", "Reconstruction", etc.) */
  era: string;
  /** Camp d'incarnation */
  camp: Camp;
  /** Bio courte (1-2 phrases) — affichée sur la carte */
  blurb: string;
  /** Bio longue (300-500 mots), ton romanesque, fidèle historique — affichée dans la modale détail. */
  bio: string;
  /** Citation signature, optionnelle */
  signature?: string;
  /** Bonus de traits cumulés au démarrage */
  traitBonus: Partial<TraitScores>;
  /** Bonus de ressources de départ */
  resourceBonus?: Partial<Resources>;
  /** Rareté visuelle */
  rarity: 'or' | 'argent' | 'legendaire';
}

export const LEGENDARY_CHARACTERS: LegendaryCharacter[] = [
  /* ============== CÔTÉ SALARIÉ ============== */
  {
    id: 'jouhaux',
    name: 'Léon Jouhaux',
    init: 'LJ',
    years: '1879 – 1954',
    era: 'CGT, puis FO',
    camp: 'salarie',
    blurb:
      'Secrétaire général de la CGT pendant 38 ans. Bâtisseur des accords Matignon. Cofonde Force ouvrière en 1947 et préside la centrale jusqu’à sa mort. Prix Nobel de la paix 1951.',
    bio:
      `Né à Pantin en 1879, fils d’un ouvrier des allumettes, Jouhaux entre à l’atelier dès quatorze ans. Il y apprend ce que les manuels d’économie ne disent pas : un salaire est une menace, une cotisation est une promesse.

À trente ans, il devient secrétaire général de la CGT. Il y restera trente-huit années — un record. La Première Guerre le surprend partisan de l’Union sacrée ; ses adversaires lui en feront grief, ses amis y verront le pragmatisme d’un homme qui sait que les drapeaux pèsent moins qu’une retraite ouvrière.

Vient juin 1936. Il a cinquante-six ans, et c’est la première fois qu’un secrétaire général de la CGT signe à Matignon. « Tout est possible ! », lance-t-il en sortant. Les conventions collectives, les congés payés, les quarante heures : il en a porté la grammaire. Le Front populaire portera la signature, l’histoire portera son nom.

Vichy le déporte. Buchenwald, puis Itter. Il en revient avec un titre de pair de France et le silence des survivants.

Quand 1947 fait éclater la CGT sur fond de guerre froide, il choisit le camp de l’indépendance syndicale et fonde Force ouvrière. Les communistes diront qu’il s’est vendu aux Américains ; lui répétera qu’un syndicat libre est meilleur qu’un syndicat aligné. En 1951, le comité Nobel d’Oslo le récompense — premier syndicaliste à recevoir le prix de la paix.

Il meurt en 1954, président de FO, dans un appartement modeste du XIVe arrondissement. Sur la table de chevet : un dossier sur la Sécurité sociale et un exemplaire de Jaurès.`,
    signature: 'Tout est possible !',
    traitBonus: { batisseur: 3, pragmatique: 2 },
    resourceBonus: { institution: 8, legitimite: 6 },
    rarity: 'legendaire'
  },
  {
    id: 'croizat',
    name: 'Ambroise Croizat',
    init: 'AC',
    years: '1901 – 1951',
    era: 'Reconstruction',
    camp: 'salarie',
    blurb:
      'Métallurgiste, ministre du Travail 1945-1947. Porte politiquement la Sécurité sociale issue des ordonnances de 1945.',
    bio:
      `Né en Savoie en 1901, fils d’un mineur invalide, Croizat entre en usine à treize ans. Il sera tourneur sur métaux toute sa vie ouvrière. La métallurgie l’élève secrétaire général de sa fédération en 1936 ; le Parti communiste, dont il est membre depuis 1928, en fait son visage syndical.

La guerre le rattrape. Vichy l’interne en Algérie ; Alger le libère et l’élit député. Il rentre en France par le port de Marseille, dans un costume usé.

Le 21 novembre 1945, il devient ministre du Travail et de la Sécurité sociale. Il a quarante-quatre ans, six mois pour faire voter, écrire, organiser ce que Pierre Laroque a conçu : un système où l’on cotise selon ses moyens et où l’on est soigné selon ses besoins. Les caisses paritaires sortent de terre dans des préfabriqués, les premiers administrateurs sont élus en mai 1946 ; un million d’ouvriers signent leur premier bulletin de cotisation comme on signe un acte de naissance.

Il meurt en février 1951, à quarante-neuf ans, d’un cancer. Un million de Parisiens marchent derrière son cercueil — le plus grand cortège ouvrier depuis Jaurès. À Suresnes, l’Hôpital Foch portait alors sur ses murs : « Croizat, le ministre des travailleurs ».

Aujourd’hui encore, beaucoup ignorent son nom. La Sécurité sociale, elle, continue de fonctionner sur les principes qu’il a fait inscrire dans la loi en six mois — le temps qu’il restait avant que la Reconstruction ne se referme.`,
    signature: 'Chacun cotise selon ses moyens, chacun est couvert selon ses besoins.',
    traitBonus: { batisseur: 3, tribun: 2 },
    resourceBonus: { institution: 10, confiance: 8 },
    rarity: 'legendaire'
  },
  {
    id: 'griffuelhes',
    name: 'Victor Griffuelhes',
    init: 'VG',
    years: '1874 – 1922',
    era: 'Belle Époque',
    camp: 'salarie',
    blurb:
      'Secrétaire général de la CGT 1901-1909. Cheville ouvrière de la Charte d’Amiens. Théoricien de l’indépendance syndicale.',
    bio:
      `Né en Corrèze en 1874, cordonnier de métier, Griffuelhes monte à Paris par la troisième classe. Il y devient l’une des figures de l’anarcho-syndicalisme français — un courant qui croit que le syndicat se suffit à lui-même et qu’aucun parti, fût-il socialiste, ne portera la libération ouvrière à sa place.

Secrétaire général de la CGT en 1901, il a vingt-sept ans et un cuir de cordonnier qui durcit ses mots. Sous sa direction, la centrale passe de quelques dizaines de milliers d’adhérents à plus de six cent mille. Les grèves se multiplient, les métiers s’unissent : verriers de Carmaux, postiers, cheminots, électriciens.

Octobre 1906 : congrès d’Amiens. Griffuelhes y fait adopter une motion de huit lignes qui deviendra la Charte d’Amiens — texte fondateur du syndicalisme français : « Le syndicalisme constate qu’en dehors et au-dessus des partis politiques il poursuit ses propres buts. » L’indépendance vis-à-vis des appareils politiques sera, jusqu’aux années 1940, la règle non négociable.

Affaibli par les coups de la répression Clemenceau, lâché par certains de ses lieutenants, il démissionne en 1909. La CGT bascule progressivement vers le réformisme. Lui restera un militant minoritaire, plumitif sec, fréquentant les bouges et les bibliothèques — figure ingrate, indispensable.

Il meurt en 1922, à quarante-huit ans, dans une chambre d’hôtel parisienne. Quatre lignes dans *L’Humanité*. Sa Charte d’Amiens, elle, sera citée à chaque congrès de la CGT pendant cent ans.`,
    signature: 'Le syndicalisme se suffit à lui-même.',
    traitBonus: { rupture: 3, tribun: 2 },
    resourceBonus: { rapportDeForce: 10, confiance: 6 },
    rarity: 'or'
  },
  {
    id: 'bothereau',
    name: 'Robert Bothereau',
    init: 'RB',
    years: '1901 – 1985',
    era: 'Guerre froide',
    camp: 'salarie',
    blurb:
      'Premier secrétaire général de FO (1948-1963). Réformiste assumé, doctrine d’indépendance face à tous les pouvoirs.',
    bio:
      `Né dans le Loiret en 1901, fils de boulanger, Bothereau passe de l’instruction publique à la fédération des fonctionnaires CGT, puis à l’appareil confédéral. Il est de ceux qui, dès l’entre-deux-guerres, se méfient des prises de parole vibrantes : il préfère la note interne, l’amendement, la contre-proposition chiffrée.

Décembre 1947 : la CGT vient d’éclater sur la question de l’alignement communiste. Léon Jouhaux fonde Force ouvrière. Bothereau en est le premier secrétaire général. Il a quarante-six ans, un costume gris, et la conviction qu’un syndicalisme libre s’écrit en lettres minuscules — par la négociation et par la cotisation.

Pendant quinze ans, il assoit FO comme la troisième confédération française, à distance égale du PCF, du gouvernement et du patronat. La doctrine bothereaunienne : on signe ce qu’on peut défendre devant la base, on refuse ce qui ne tient pas une convention écrite, on n’entre dans aucun cartel politique. Cela lui vaudra l’étiquette américaine — fondée sur les financements de la CIA aux confédérations anti-communistes — qui ne le lâchera jamais, contestée jusqu’à ses dernières années.

Ouvrier de l’ombre, il décline les ministères, refuse les mandats électifs, signe trois livres austères dont *Le Syndicalisme français*, qui reste une référence. Quand il quitte le secrétariat général en 1963, l’organisation compte cinq cent mille adhérents et un siège à toutes les caisses paritaires.

Il meurt en 1985, dans la discrétion qui aura été sa marque. Une dépêche AFP, deux colonnes dans *Le Monde*. Au bureau confédéral de FO, on dira ce jour-là : « Le réformisme français vient de perdre son architecte. »`,
    traitBonus: { pragmatique: 3, technocrate: 2 },
    resourceBonus: { legitimite: 8, institution: 4 },
    rarity: 'or'
  },
  {
    id: 'maire',
    name: 'Edmond Maire',
    init: 'EM',
    years: '1931 – 2017',
    era: 'Lois Auroux',
    camp: 'salarie',
    blurb:
      'Secrétaire général de la CFDT 1971-1988. Théoricien de l’autogestion, puis architecte du « recentrage » réformiste.',
    bio:
      `Né en 1931 à Épinay-sur-Seine, fils d’ouvrier mineur, Edmond Maire est un militant de la première heure des Jeunes Ouvriers Chrétiens. Diplômé chimiste, il entre à Pechiney puis bascule, à trente ans, dans le syndicalisme à plein temps.

En 1964, la CFTC se déconfessionnalise pour devenir la CFDT. Sept ans plus tard, Maire en prend le secrétariat général. Il a quarante ans, une voix calme, et l’ambition de faire de sa centrale autre chose qu’un appareil — une école politique. Sous sa plume, l’autogestion devient le mot-clé d’une génération syndicale : ni étatisme communiste, ni capitalisme libéral, mais le pouvoir des travailleurs sur leur outil.

1981 : la gauche au pouvoir. Maire négocie les lois Auroux avec un naturel de patron de cabinet — comités d’hygiène, négociation annuelle obligatoire, droit d’expression directe. Mais l’austérité de 1983 retourne le récit. Il opère alors le tournant qu’on appellera le « recentrage » : la CFDT abandonne la rhétorique antagoniste et investit la cogestion paritaire, l’expertise, le contrat. Une partie de ses militants lui en voudront — ils partiront fonder SUD.

Il quitte la confédération en 1988, écrit, donne des conférences, refuse les mandats politiques. Il meurt en 2017, dans la maison qu’il avait achetée en bord de Vienne, lecteur tardif de Castoriadis.

Le syndicalisme français contemporain — ses équilibres, ses contradictions — porte sa marque. Comme l’a écrit un commentateur le jour de sa mort : « Maire avait compris avant tout le monde que le rapport de force ne se gagnait plus dans la rue, mais dans les annexes techniques. »`,
    traitBonus: { technocrate: 3, pragmatique: 2 },
    resourceBonus: { legitimite: 10, institution: 4 },
    rarity: 'or'
  },
  {
    id: 'souillot',
    name: 'Frédéric Souillot',
    init: 'FS',
    years: '2022 – ',
    era: 'Macron II',
    camp: 'salarie',
    blurb:
      'Secrétaire général de Force ouvrière depuis 2022. Tient bon contre la captation des réserves paritaires.',
    bio:
      `Métallurgiste lorrain, né en 1968, Frédéric Souillot est entré chez Renault Trucks à dix-neuf ans. C’est là, sur les chaînes de Vénissieux, qu’il devient délégué FO — élu sur sa réputation de quelqu’un qui sait expliquer un bulletin de paie ligne par ligne.

Après vingt ans dans la métallurgie, il monte au secrétariat fédéral, puis devient secrétaire confédéral chargé du dossier brûlant des retraites complémentaires. Il y mène, avec ses homologues CFDT et CFTC, la négociation Agirc-Arrco — où patronat et syndicats finissent par sauver, sur le fil, l’architecture paritaire des cadres et non-cadres.

En 2022, le congrès de Rouen l’élit secrétaire général. Force ouvrière compte alors environ 280 000 adhérents et reste, par doctrine, à l’écart des grandes intersyndicales unitaires. Souillot rompt sur ce point : sur la réforme des retraites de 2023, il rejoint le front des huit confédérations, bat le pavé, parle peu mais ferme.

Sa vraie ligne, lisible à toute interview : la défense des **réserves paritaires** — Unédic, Agirc-Arrco, Action Logement, formation professionnelle — face à l’État qui, déficit oblige, vient régulièrement y puiser. « Quand l’État a besoin d’argent, il lorgne sur les réserves des institutions paritaires », répète-t-il. Phrase de comptable qui se transforme, dans la bouche d’un syndicaliste, en credo politique : le paritarisme tient ou il meurt.`,
    signature:
      'Quand l’État a besoin d’argent, il lorgne sur les réserves des institutions paritaires.',
    traitBonus: { batisseur: 2, tribun: 2 },
    resourceBonus: { confiance: 8, rapportDeForce: 6 },
    rarity: 'argent'
  },
  {
    id: 'binet',
    name: 'Sophie Binet',
    init: 'SB',
    years: '2023 – ',
    era: 'Macron II',
    camp: 'salarie',
    blurb:
      'Secrétaire générale de la CGT depuis mars 2023. Première femme à diriger la confédération.',
    bio:
      `Née en 1981 à Paris, fille d’une mère psychanalyste et d’un père chirurgien, Sophie Binet entre à la CGT par la voie des cadres — elle est passée par Sciences Po Paris et le Centre de formation des journalistes, mais a finalement choisi le syndicalisme contre une carrière de journaliste, attirée par l’idée d’organiser plutôt que d’écrire sur les autres.

À l’UGICT-CGT (Union générale des ingénieurs, cadres et techniciens), elle pilote pendant dix ans des dossiers techniques — égalité femmes-hommes, télétravail, classification des cadres. Sa fiche signalétique au siège de Montreuil dit : « Construit des dossiers étanches. »

Mars 2023 : la CGT organise son 53e congrès dans un climat tendu. Philippe Martinez quitte son mandat ; sa dauphine annoncée trébuche sur des accusations de violences politiques internes. Le congrès, dans un retournement inédit, plébiscite Sophie Binet — alors qu’elle n’était même pas candidate trois jours plus tôt. Elle a quarante et un ans, et devient la première femme à diriger la CGT depuis sa fondation en 1895.

Elle prend ses fonctions au pic de la mobilisation contre la réforme des retraites. Pendant six mois, elle fédère une intersyndicale unanime — fait historique — puis l’encaisse, après le 49.3, comme une défaite politique partagée. Depuis, elle pilote la CGT à travers la longue traversée d’après — comment maintenir une centrale combative dans un cycle gouvernemental qui systématise l’ordonnance et l’article 49 alinéa 3.

Son style : pédagogique, féministe, attentive aux dossiers techniques que ses prédécesseurs traitaient à grands traits. Sa plus grande adversité : faire entrer la CGT dans un siècle qui ne lui ressemble plus.`,
    traitBonus: { tribun: 3, rupture: 2 },
    resourceBonus: { confiance: 10, rapportDeForce: 6 },
    rarity: 'argent'
  },

  /* ============== CÔTÉ PATRONAL ============== */
  {
    id: 'lambert-ribot',
    name: 'Alexandre Lambert-Ribot',
    init: 'LR',
    years: '1885 – 1953',
    era: 'Front populaire',
    camp: 'patron',
    blurb:
      'Délégué général de la CGPF en 1936. Signe Matignon contraint et forcé. Maître du compromis défensif.',
    bio:
      `Fils du président du Conseil Alexandre Ribot, formé à Sciences Po, ancien préfet, Lambert-Ribot bascule entre-deux-guerres dans le service du patronat. Délégué général du Comité des Forges puis de la CGPF, il y représente la grande industrie sidérurgique — celle qui ne dort pas, qui exporte, qui pèse.

Au matin du 7 juin 1936, il est convoqué à Matignon par Léon Blum. Avec lui : Pierre Richemond et René Duchemin. En face : Léon Jouhaux et Benoît Frachon. Dehors, deux millions de grévistes. Au-dessus, l’horloge de la salle des fêtes qui décompte les heures où le pays se tient. À deux heures du matin, il signe — la légende veut qu’il l’ait fait avec la main qui tremblait, ou avec un visage de pierre, selon la mémoire des témoins.

Six points concédés : conventions collectives, hausse des salaires, délégués du personnel, congés payés, quarante heures, libertés syndicales. La CGPF lui en fera porter le poids. Quelques mois plus tard, sous la pression des industriels durs, il est écarté ; la CGPF rénovée de Gignoux prendra une ligne offensive.

Lambert-Ribot retourne aux comités sectoriels, écrit, donne des avis. Sous Vichy, il garde des fonctions modestes au comité d’organisation de la sidérurgie. À la Libération, on lui reproche peu et on l’épargne. Il meurt en 1953, dans une obscurité qui ressemble à un soulagement.

L’histoire patronale française aurait préféré un autre signataire à Matignon. Elle n’en a pas eu. Le rôle ingrat du patron qui cède quand il faut céder — c’est lui.`,
    traitBonus: { paternaliste: 2, pragmatique: 3 },
    resourceBonus: { caisse: 12, legitimite: 4 },
    rarity: 'or'
  },
  {
    id: 'villiers',
    name: 'Georges Villiers',
    init: 'GV',
    years: '1899 – 1982',
    era: 'Reconstruction',
    camp: 'patron',
    blurb:
      'Premier président du CNPF (1946-1966). Ancien déporté résistant, il reconnaît le paritarisme à la française.',
    bio:
      `Né à Lyon dans une famille catholique aisée, Georges Villiers reprend en 1925 la direction d’une fabrique de matériel hydraulique de la rive gauche du Rhône. Maire élu de Lyon en 1941 sous Vichy, il refuse de remettre les Juifs étrangers à Klaus Barbie ; il est arrêté, déporté à Dachau, en revient diminué mais vivant.

À la Libération, il est l’un des très rares grands patrons à pouvoir se présenter au pays sans dossier d’épuration. C’est pour cette raison — autant que pour ses qualités personnelles — qu’on l’élit, en juin 1946, premier président du Conseil national du patronat français nouvellement refondé.

Pendant vingt ans, il assoit la doctrine d’un libéralisme d’ordre : reconnaître la Sécurité sociale paritaire, siéger dans les caisses, négocier convention par convention. Il refuse les coups d’éclat ; il dit non aux grandes manœuvres politiques contre le Plan Mendès-France ou contre De Gaulle. Sous sa présidence, le patronat français devient une institution républicaine — interlocuteur reconnu de l’État et des syndicats, partenaire des grands accords interprofessionnels qui refondent les retraites complémentaires (Agirc 1947, Arrco 1961) et l’assurance-chômage (Unédic 1958).

Quand il quitte le CNPF en 1966, il a une Sécurité sociale qui couvre désormais l’écrasante majorité des salariés français, six grandes confédérations en face de lui, et le sentiment d’avoir, sans bruit, transformé la culture du capitalisme français.

Il meurt en 1982 dans la maison familiale de la Croix-Rousse. Son épitaphe pourrait être : *celui qui a fait dire au patronat français qu’il acceptait la table*.`,
    traitBonus: { paternaliste: 3, batisseur: 2 },
    resourceBonus: { caisse: 10, legitimite: 8 },
    rarity: 'legendaire'
  },
  {
    id: 'seilliere',
    name: 'Ernest-Antoine Seillière',
    init: 'ES',
    years: '1937 – ',
    era: 'Refondation sociale',
    camp: 'patron',
    blurb:
      'Président CNPF puis MEDEF (1997-2005). Architecte de la « refondation sociale ». Doctrinaire frontal du tournant patronal.',
    bio:
      `Baron, héritier de la grande famille des Wendel, polytechnicien, énarque, banquier d’affaires : peu d’hommes incarnent autant que lui le patronat français de tradition — celui qui se transmet en latin, en latifundia et en archives notariales.

Il prend la présidence du CNPF en juillet 1997. Il a soixante ans, l’élégance d’un homme qui n’a jamais douté de son rang, et un projet : refonder le pacte social français, c’est-à-dire reprendre par la pression patronale la direction des grandes institutions paritaires que le syndicalisme avait conquises depuis 1945.

Octobre 1998 : le CNPF devient le **MEDEF** (Mouvement des entreprises de France). Le sigle est neuf, le programme aussi. La « refondation sociale » se déploie en quelques années : retrait de l’Unédic en 2001, négociations brutales sur les retraites complémentaires, refonte de la formation professionnelle, vote de la loi Fillon de 2003 — chaque dossier est arraché par la menace de claquer la porte.

Seillière a transformé la grammaire du dialogue social français. Avant lui, le patronat acceptait la cogestion paritaire avec une certaine bonhomie. Après lui, le retrait est une menace permanente, et chaque négociation se déroule sous l’ombre du précédent.

Il quitte le MEDEF en 2005, prend la présidence de BusinessEurope (le patronat européen), puis se retire dans ses propriétés. Son legs, contesté à gauche, salué à droite, structure aujourd’hui encore les rapports patronat-syndicats français — pour le meilleur et pour le pire, selon où l’on se trouve.`,
    traitBonus: { technocrate: 2, rupture: 3 },
    resourceBonus: { rapportDeForce: 12, caisse: 6 },
    rarity: 'legendaire'
  },
  {
    id: 'parisot',
    name: 'Laurence Parisot',
    init: 'LP',
    years: '2005 – 2013',
    era: 'Sarkozy',
    camp: 'patron',
    blurb:
      'Première femme à présider le MEDEF. Modernisation de l’image patronale, présence médiatique constante.',
    bio:
      `Née en 1959 à Luxeuil, fille d’industriels du meuble vosgiens, Laurence Parisot étudie à Sciences Po Paris puis prend la direction de l’Ifop, le grand institut de sondage français. Quinze ans à la tête de l’Ifop la familiarisent avec les outils du débat public : courbes, tendances, perception.

Juillet 2005 : elle prend le MEDEF. Elle a quarante-six ans, et devient la première femme à diriger un patronat français qui, deux ans plus tôt encore, rangeait ses présidents par ordre de fortune. Sa formule signature, *« la liberté de penser s’arrête là où commence le code du travail »*, fait scandale en 2006 — elle l’assume, en sourit, en tire un livre.

Pendant huit ans, elle redessine l’image patronale : moins de barons, plus d’entrepreneurs ; moins de banquets feutrés, plus de plateaux télé. Sous sa présidence, le MEDEF s’ouvre aux PME, aux start-ups, aux femmes — non pas par doctrine, mais par stratégie de communication appliquée à la durée.

Sur le fond, elle hérite des dossiers Seillière et les gère sans les renier : retraites Sarkozy 2010, accords interprofessionnels sur la flexisécurité, négociations Unédic. Ses détracteurs disent qu’elle a maquillé la doctrine sans la changer ; ses défenseurs répondent qu’elle a sauvé le patronat français d’une marginalisation médiatique annoncée.

Elle quitte le MEDEF en 2013, écrit, milite contre Marine Le Pen avant 2017. Reste, dans la mémoire patronale, l’une des présidences les plus politiques de la maison.`,
    traitBonus: { technocrate: 3, pragmatique: 2 },
    resourceBonus: { legitimite: 10, caisse: 4 },
    rarity: 'or'
  },
  {
    id: 'roux-de-bezieux',
    name: 'Geoffroy Roux de Bézieux',
    init: 'RB',
    years: '2018 – 2023',
    era: 'Macron I',
    camp: 'patron',
    blurb:
      'Président du MEDEF (2018-2023). Entrepreneur tech, doctrine libérale assumée. Traverse COVID et réforme retraites.',
    bio:
      `Né en 1962 à Boulogne-sur-Seine, descendant d’une famille de la noblesse provinciale, Roux de Bézieux passe par Saint-Cyr et HEC avant d’entrer dans l’économie réelle — pas dans les grands groupes, mais dans les opérateurs mobiles, où il prend en charge le lancement de The Phone House, puis crée Virgin Mobile France.

C’est un patron de la deuxième génération du capitalisme français — celui qui ne vient ni des Forges ni des banques mais de la tech mobile et du capital-risque. Quand il prend le MEDEF en juillet 2018, il a cinquante-six ans, l’assurance d’un homme qui a vendu plusieurs entreprises, et l’ambition d’incarner un patronat de start-uppeurs sans complexe.

Son mandat est marqué par trois événements qu’aucun de ses prédécesseurs n’avaient anticipés : la crise des Gilets jaunes, la pandémie de COVID-19, et la réforme des retraites de 2023. Sur les Gilets jaunes, il défend une ligne mesurée — il sait que le capitalisme français se joue aussi dans les ronds-points. Sur la COVID, il négocie avec Bercy et l’Élysée des centaines de milliards d’aides aux entreprises ; le MEDEF y gagne en visibilité ce que la doctrine y perd en pureté libérale.

Sur les retraites 2023 enfin, il tient une ligne de soutien public à la réforme, mais sans triomphalisme — conscient que le patronat français, à un certain moment, ne peut plus se permettre d’apparaître comme le seul gagnant.

Il quitte le MEDEF en juillet 2023, juste après le 49.3. Il a passé cinq ans à essayer d’incarner un patronat de gestionnaires plutôt que de grands seigneurs. L’histoire dira si la tentative a tenu.`,
    traitBonus: { technocrate: 3, rupture: 2 },
    resourceBonus: { caisse: 8, legitimite: 6 },
    rarity: 'argent'
  },
  {
    id: 'patrick-martin',
    name: 'Patrick Martin',
    init: 'PM',
    years: '2023 – présent',
    era: 'Macron II / présent',
    camp: 'patron',
    blurb:
      "Président du MEDEF (depuis juillet 2023). Patron d'ETI familiale (Martin Belaysoud Expansion). Doctrine de proximité avec le tissu PME-ETI.",
    bio:
      `Né en 1959 à Lyon, fils et petit-fils d'industriels rhônalpins, Patrick Martin dirige depuis 1989 Martin Belaysoud Expansion, distributeur industriel familial passé de 35 à plus de 4 000 salariés sous sa direction. Il représente une figure rare au sommet du MEDEF : un patron d'ETI, ni grand-groupe-CAC40 ni start-uppeur, ancré dans l'industrie de province et les chaînes d'approvisionnement réelles.

Élu président du MEDEF en juillet 2023, juste après le passage en force de la réforme des retraites, il prend ses fonctions dans un climat de dialogue social dégradé. Sa première séquence forte est l'accord ANI sur le partage de la valeur (signé fin 2023 avec CFDT, CFTC, FO, CFE-CGC) — un accord paritaire dans les règles, qui contraste volontairement avec le rouleau-compresseur retraite.

Sa doctrine assumée : « le paritarisme est un actif compétitif français, pas une faiblesse ». Il défend la branche professionnelle comme niveau primordial, contre la dilution dans les ordonnances Macron. Il porte aussi une critique discrète mais réelle de la concentration parisienne du dialogue social — beaucoup de ses interventions publiques se font à Lyon, Lille, Bordeaux.

Au moment où ce jeu est joué, son mandat est en cours. L'historique se jugera sur sa capacité à reconstruire un dialogue social abîmé sans renoncer à la doctrine d'efficacité économique.`,
    traitBonus: { batisseur: 3, pragmatique: 2 },
    resourceBonus: { institution: 8, legitimite: 5 },
    rarity: 'argent'
  },
  {
    id: 'asselin',
    name: 'François Asselin',
    init: 'FA',
    years: '2015 – 2024',
    era: 'Hollande / Macron I-II',
    camp: 'patron',
    blurb:
      "Président de la CPME (2015-2024). Patron d'entreprise familiale du bâtiment. Voix la plus écoutée du patronat des PME-TPE.",
    bio:
      `Né en 1963, formé à HEC, François Asselin reprend l'entreprise familiale Asselin SA — charpentes et restauration de monuments historiques — au début des années 1990. Il y emploie une centaine de compagnons, dont plusieurs Compagnons du Devoir. Cet ancrage dans le bâtiment artisanal façonne sa vision du patronat : ni capitalisme financier, ni grand groupe, mais entrepreneur de proximité confronté aux charges, à l'embauche, aux marges.

Élu président de la CGPME en janvier 2015 (l'organisation devient CPME en 2017), il porte pendant neuf ans la voix d'une organisation représentant 60% des entreprises et la moitié des salariés du privé. Sa critique récurrente : le paritarisme français est conçu pour les grands groupes, l'ANI passe au-dessus de la tête des PME, les conventions de branche sont écrites par les CAC40.

Il pousse pour une meilleure représentation des TPE-PME dans les organes paritaires (Unédic, Agirc-Arrco, OPCO), défend les seuils sociaux contre la fusion CSE de 2017 (la CPME a refusé de signer les ordonnances Macron sur ce point), milite pour la simplification du Code du travail. Sa ligne sur les retraites 2023 a été nuancée : soutien au principe, critique de la méthode.

Il quitte la présidence en avril 2024. Son successeur Amir Reza-Tofighi continue dans la même ligne. Au moment où ce jeu est joué, sa figure incarne ce que le patronat des PME refuse : être absorbé dans un dialogue social pensé pour le CAC40.`,
    traitBonus: { pragmatique: 3, batisseur: 2 },
    resourceBonus: { confiance: 7, legitimite: 5 },
    rarity: 'or'
  },

  /* ============================================================
     P1-6 (ORDA-009/010, AAR bêta-30 §V) — légendaires post-2000
     + figures féminines racisées
     ============================================================
     Béroud #18 (FG-3) : SUD-Solidaires absent du roster.
     Sami #22 (FG-3) : pas de figure plateforme/coursier.
     Aïcha #23 (FG-4) : 0 nom féminin racisé au roster.

     4 légendaires ajoutés ci-dessous (3 salariés + 1 patron) :
     - Annick Coupé (SUD-Solidaires fondatrice, 1995)
     - Jean-Daniel Levy (coursier CLAP composite, 2018-2024)
     - Rachida Brahim-Djelloul (composite : déléguée CGT-Santé
       AP-HP post-Covid, figure aide-soignante racisée)
     - Sayanti Mukherjee (composite : DRH d'ETI tech d'origine
       indo-britannique, voix patronale plurielle)

     Note méthodologique : pour Brahim-Djelloul et Mukherjee,
     personnages composites assumés (pas de personnage public
     unique disponible). Inspirés de témoignages dans Le Crom,
     Beaud, et entretiens publics CGT-Santé / ANDRH 2022-2024.
     ============================================================ */
  {
    id: 'coupe',
    name: 'Annick Coupé',
    init: 'AC',
    years: '1956 – aujourd\'hui',
    era: 'SUD-Solidaires (1989 – 2014)',
    camp: 'salarie',
    blurb:
      "Cofondatrice de SUD-PTT (1989) puis porte-parole de Solidaires (2002-2014). Figure du syndicalisme de transformation sociale — ligne d'autonomie radicale.",
    bio:
      `Née en 1956, militante CFDT-PTT puis exclue lors de la « refondation » de 1988-1989 que Notat impose pour réorienter la confédération. Avec d'autres exclus, elle cofonde SUD-PTT en 1989 — premier des syndicats SUD qui formeront ensuite l'Union syndicale Solidaires en 1998.

Porte-parole nationale de Solidaires de 2002 à 2014. Sa ligne : refus du dialogue social institutionnalisé quand il vide la lutte de sa substance, défense des « précaires », alliance avec Attac et les altermondialistes (elle siège à son conseil scientifique). Elle théorise un syndicalisme de transformation sociale : pas seulement défendre les acquis, mais préparer une autre organisation du travail.

Trois batailles emblématiques : la défense des sans-papiers (grève des travailleurs sans-papiers 2008-2010, 6800 régularisations obtenues) ; la lutte contre la réforme des retraites Sarkozy 2010 (où elle pousse pour la généralisation de la grève reconductible) ; le soutien aux mouvements précaires (intermittents 2003, coursiers à partir de 2017).

Au moment où ce jeu est joué, elle est retraitée mais reste consultée. Sa figure incarne dans Paritas la voix qui rappelle qu'avant les confédérations établies (CGT, CFDT, FO), il y a toujours eu et il y aura toujours des marges militantes qui inventent les formes futures du syndicalisme.`,
    signature: "« Le syndicalisme n'est pas que ses confédérations. »",
    traitBonus: { rupture: 4, tribun: 2 },
    resourceBonus: { rapportDeForce: 8, cohesionInterne: 5, legitimite: 2 },
    rarity: 'or'
  },
  {
    id: 'levy-coursier',
    name: 'Jean-Daniel Lévy',
    init: 'JL',
    years: '1992 – aujourd\'hui',
    era: 'CLAP / Coursiers en colère (2017 – 2024)',
    camp: 'salarie',
    blurb:
      "Coursier Deliveroo depuis 2017, militant du Collectif des Livreurs Autonomes Parisiens (CLAP). Figure composite du syndicalisme de plateforme.",
    bio:
      `Né en 1992, formé en sociologie L2 à Nanterre puis décrocheur. Coursier Deliveroo à partir de 2017. Auto-entrepreneur — donc « salarié sans patron », statut hybride imposé par la plateforme qui contourne le droit du travail.

Il rejoint le CLAP (Collectif des Livreurs Autonomes Parisiens) après une grève spontanée d'octobre 2017 quand la plateforme baisse unilatéralement la rémunération à la course. Il devient l'une des voix médiatiques du collectif, présent sur les plateaux de Mediapart et France Inter.

Trois fronts simultanés : la requalification (procès au Conseil de prud'hommes — décisions favorables aux coursiers en 2020 et 2022) ; l'organisation horizontale (le CLAP refuse la forme syndicale traditionnelle, fonctionne en assemblées générales mobiles) ; la solidarité européenne (rencontres avec les coursiers d'IWGB Londres, Riders Madrid, NIDIL-CGIL Italie).

Son rapport au paritarisme français est ambivalent. D'un côté, il critique les confédérations (« elles ne nous voient pas, on n'existe pas dans leur grille ») ; de l'autre, il les rejoint quand il le faut (alliance avec Solidaires Transports, soutien CGT-Métaux 2018).

Au moment où ce jeu est joué, il continue, vacille, espère un statut. Sa figure incarne dans Paritas le syndicalisme du XXIe siècle qui ne ressemble plus aux trois lettres CGT/CFDT/FO mais qui invente — comme Pelletier en 1908, comme SUD en 1989.`,
    signature: "« Il faudra bien qu'on existe quelque part dans leur droit. »",
    traitBonus: { rupture: 3, technocrate: 1, tribun: 2 },
    resourceBonus: { rapportDeForce: 6, cohesionInterne: 4 },
    rarity: 'argent'
  },
  {
    id: 'brahim-djelloul',
    name: 'Rachida Brahim-Djelloul',
    init: 'RB',
    years: '1979 – aujourd\'hui',
    era: 'CGT-Santé AP-HP (2010 – aujourd\'hui)',
    camp: 'salarie',
    blurb:
      "Aide-soignante en gériatrie à l'AP-HP, déléguée CGT-Santé depuis la grève de 2022. Figure composite de la voix soignante racisée et féminine post-Covid.",
    bio:
      `Née en 1979 à Bagnolet de parents algériens kabyles, scolarisée en Seine-Saint-Denis, formée aide-soignante en 1999 à l'Hôpital Bichat. Vingt-cinq ans à l'AP-HP, dont quinze en gériatrie et dix en oncologie pédiatrique. Mère de deux enfants, élevée seule depuis 2018.

Son entrée en syndicalisme est tardive — 2020, pendant le premier confinement. Comme nombreuses de ses collègues, elle vit l'expérience d'être à la fois « héroïne de la nation » (applaudissements à 20h) et invisible dans les arbitrages budgétaires (prime Covid versée tardivement, conditions de travail durcies). Cette dissonance la pousse à rejoindre la CGT-Santé.

Elle devient déléguée en 2022 lors de la grande grève hospitalière. Sa ligne : ne pas séparer les revendications matérielles (salaires, ratios soignant/lit, RTT) des revendications symboliques (reconnaissance professionnelle, droit à parler à la presse, fin du racisme institutionnel dans les promotions). Elle pousse la CGT-Santé à porter explicitement la question de la racisation des soignantes — un terrain où les confédérations historiques restent prudentes.

Son rapport au paritarisme français est lucide : « Le paritarisme dans le public, c'est la médiation avec une administration qui ne te voit pas comme négociatrice mais comme exécutante. On apprend à utiliser le droit. Mais on n'oublie pas qu'il a été écrit par des hommes blancs. »

Au moment où ce jeu est joué, elle est en première ligne des négociations sur la prochaine convention collective hospitalière. Sa figure incarne dans Paritas la voix qui manquait : femme, racisée, soignante, post-2020. Personnage composite assumé — synthèse de témoignages publics de plusieurs déléguées CGT-Santé et SUD-Santé.`,
    signature: "« On était essentielles pendant le Covid. On est restées invisibles. Ça change maintenant. »",
    traitBonus: { tribun: 3, batisseur: 2 },
    resourceBonus: { cohesionInterne: 7, legitimite: 4, rapportDeForce: 3 },
    rarity: 'or'
  },
  {
    id: 'mukherjee',
    name: 'Sayanti Mukherjee',
    init: 'SM',
    years: '1976 – aujourd\'hui',
    era: 'DRH ETI tech (2015 – aujourd\'hui)',
    camp: 'patron',
    blurb:
      "DRH d'une ETI française de 800 salariés en cybersécurité (Bordeaux). Profil patronal pluriel, formé au Royaume-Uni, voix de la diversité dans l'ANDRH.",
    bio:
      `Née en 1976 à Birmingham (Royaume-Uni) de parents indo-bengalis migrants, formée à la London School of Economics (RH et droit du travail comparé), expatriée en France en 2008 pour rejoindre une ETI cyber bordelaise dont elle devient DRH en 2015.

Son profil détonne dans le paysage RH français : binationale franco-britannique, racisée, diplômée d'une école de gestion étrangère. Elle apporte une lecture comparative qu'aucune DRH formée à HEC n'a aussi instinctivement : la France est un pays singulier dans son rapport au paritarisme, et cette singularité a un coût quand on recrute international.

Sa ligne managériale : transparence salariale (publication de la grille interne dès 2018, avant l'index égalité), CSE pris au sérieux (refus de la fusion expéditive 2017, négociation lente de 18 mois), partenariat avec les écoles de banlieue parisienne (Pôle Sup'93, IUT Saint-Denis) pour diversifier les recrutements tech. Elle siège à l'ANDRH où elle pousse une critique discrète : la profession RH française est « monoculturelle au-delà du raisonnable », ce qui crée des angles morts dans les négociations sur la diversité, le racisme institutionnel, le voile au travail.

Son rapport au syndicalisme français est paradoxalement positif : elle préfère négocier avec un délégué CGT formé que d'avoir une assemblée générale spontanée. Elle a une formule reprise plusieurs fois en conférence : « Le paritarisme français est lent, lourd, contestable — mais il existe. Aux États-Unis, je n'aurais personne à qui parler avant la grève. »

Au moment où ce jeu est joué, elle pèse sur les arbitrages de la prochaine convention de branche cybersécurité. Sa figure incarne dans Paritas le patronat pluriel qui manquait : ni HEC blanc francophone, ni caricature anglo-saxonne — une voix qui prend au sérieux le paritarisme tout en pointant ses angles morts.`,
    signature: "« Le paritarisme français est lent. Mais quelqu'un répond au téléphone. »",
    traitBonus: { pragmatique: 3, technocrate: 2 },
    resourceBonus: { institution: 6, legitimite: 5, confiance: 4 },
    rarity: 'or'
  }
];

export function legendaryById(id: string): LegendaryCharacter | undefined {
  return LEGENDARY_CHARACTERS.find(c => c.id === id);
}

export function legendariesByCamp(camp: Camp): LegendaryCharacter[] {
  return LEGENDARY_CHARACTERS.filter(c => c.camp === camp);
}
