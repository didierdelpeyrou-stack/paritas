/* ============================================================
   Paritas — discours générés (TTS)
   ============================================================
   Génère un extrait de discours de ~15 s (≈ 35-40 mots à 150 mpm
   en français), puis le lit via window.speechSynthesis.

   Architecture :
   - **Sans Haiku** : tirage déterministe dans une banque de
     templates par (camp × posture × moment). Le jeu reste
     pleinement audible sans réseau.
   - **Avec Haiku** : si VITE_NARRATIVE_API est configuré, on
     demande un texte plus situé (date, scénario, dilemme courant).
     Fallback automatique si timeout > 3 s.

   Lecture :
   - SpeechSynthesisUtterance avec voix française (fr-FR ou fr-CA),
     pitch légèrement modulé selon le ton, vitesse 0.95.
   - Si aucune voix française dispo (rare), on coupe la lecture
     mais on retourne le texte (à afficher sous-titré).

   Gratuit, hors-ligne, zero dépendance.
   ============================================================ */

import type { Camp } from '../types';

export type SpeechMoment = 'manifestation' | 'meeting' | 'signature' | 'huis_clos';
export type SpeechPosture = 'rupture' | 'pragmatique' | 'paternaliste' | 'tribun' | 'technocrate' | 'batisseur';

export interface SpeechRequest {
  camp: Camp;
  moment: SpeechMoment;
  posture: SpeechPosture;
  /** Optionnel : titre du scénario en cours, pour Haiku. */
  scenarioTitle?: string;
  /** Optionnel : année (ex. 1936). */
  year?: number;
  /** Optionnel : eraId du jeu — détermine le registre de vocabulaire
   *  (« Citoyens » vs « salariés » vs « collègues »). Si absent, on
   *  utilise le registre contemporain. */
  eraId?: string;
}

/* === Banque de templates (déterministe, hors-ligne) ===
 *
 * Indexée par (eraGroup × camp × moment), 6 templates par combo
 * pour éviter la répétition après 3 parties (testeur Erwan).
 *
 * Trois groupes d'ères pour respecter les registres historiques
 * (Pr Petrović Aalto : « en 1789 on dit "Citoyens" ; en 2022 on dit
 * "salariés". Le TTS révèle l'anachronisme ») :
 *
 * - 'historique' (1789-1947) : revolution, xixe, belle_epoque,
 *   entre_deux_guerres, reconstruction. Vocabulaire « Citoyens,
 *   camarades, ouvriers, prolétaires, frères ».
 * - 'apres_guerre' (1947-1981) : guerre_froide, trente_glorieuses,
 *   crise. Vocabulaire « partenaires sociaux, dialogue social,
 *   travailleurs ».
 * - 'contemporain' (1981+) : mitterrand → present. Vocabulaire
 *   « salariés, collègues, branche, négociation ».
 */

type SpeechEraGroup = 'historique' | 'apres_guerre' | 'contemporain';

/** Mappe les 15 EraId vers les 3 groupes de registre. */
const ERA_GROUPS: Record<string, SpeechEraGroup> = {
  revolution: 'historique',
  xixe: 'historique',
  belle_epoque: 'historique',
  entre_deux_guerres: 'historique',
  reconstruction: 'historique',
  guerre_froide: 'apres_guerre',
  trente_glorieuses: 'apres_guerre',
  crise: 'apres_guerre',
  mitterrand: 'contemporain',
  cohabitations: 'contemporain',
  sarkozy: 'contemporain',
  hollande: 'contemporain',
  macron_i: 'contemporain',
  macron_ii: 'contemporain',
  present: 'contemporain',
};

const SPEECHES: Record<SpeechEraGroup, Record<Camp, Record<SpeechMoment, string[]>>> = {
  historique: {
    salarie: {
      manifestation: [
        "Citoyens ! Nos enfants travaillent douze heures, nos salaires baissent, et l'on nous parle encore de patience. Aujourd'hui, dans la rue, nous disons : assez. Que cette colère soit entendue.",
        "Camarades, nous ne mendions pas. Nous réclamons ce que nous avons gagné par notre sueur. Que ceux qui détiennent les usines comprennent : on ne fait pas plier un peuple uni.",
        "Frères ! Le pain manque, le froid mord, et l'on nous dit de remercier le ciel. C'est le ciel des autres. Le nôtre, on le construit ici, dans cette manifestation.",
        "On a brisé nos métiers, fermé nos confréries, dispersé nos sections. Mais on n'a pas brisé ce qui nous lie. Aujourd'hui, l'unité ouvrière reparle, plus forte que les lois Le Chapelier.",
        "Que vive la République sociale ! La République des bourgeois, nous la connaissons : elle parle de liberté quand elle veut dire propriété. Nous, nous voulons la liberté ET le pain.",
        "Nous marchons pour ceux qui sont morts dans les filatures de Lyon, à la Commune, dans les corons. Leur lutte n'est pas finie. Elle est entre nos mains aujourd'hui.",
      ],
      meeting: [
        "Mes camarades, l'heure est grave. La grève générale est devant nous. Nous devons décider en conscience, sans céder aux divisions que nos adversaires sèment entre nous.",
        "L'union des travailleurs est notre seule arme. Le capital, lui, parle d'une seule voix quand il s'agit de défendre ses intérêts. Apprenons de lui cette leçon.",
        "Je propose que cette assemblée vote la mobilisation. Pas un sou, pas un homme, pas une heure de travail tant que nos revendications ne sont pas inscrites sur le papier.",
        "Frères, nous avons le devoir de penser à ceux qui ne sont pas là. Aux femmes des usines textiles, aux mineurs du Nord, aux apprentis qu'on exploite. Notre vote les engage.",
        "On nous accuse d'être des révolutionnaires. Nous sommes simplement des ouvriers qui veulent vivre. Si cela fait de nous des révolutionnaires, qu'on le sache.",
        "L'Internationale est notre hymne, mais c'est ici, dans nos sections, dans nos bourses du travail, que se forge le mouvement. Pas dans les rêves. Dans le rapport de force.",
      ],
      signature: [
        "Cette signature consacre une étape. Nos pères se battaient pour le droit de coalition ; nous, pour la convention collective. Nos enfants poursuivront. La lutte est longue.",
        "Je signe au nom de la classe ouvrière française. Mais qu'on ne s'y trompe pas : ce papier vaut ce que vaut notre vigilance. Nous resterons aux portes des ateliers.",
        "L'heure n'est pas aux applaudissements. Aujourd'hui, on a obtenu ce qui ne peut plus nous être repris : des heures réduites, des salaires garantis, des congés. Demain, on en demandera plus.",
        "À ceux qui nous reprochent ce compromis, je dis : ce n'est pas une fin. C'est une preuve qu'on peut arracher quelque chose à un patronat qui jure n'avoir rien à donner.",
        "Que cet accord serve d'exemple à toute l'industrie française. Si Renault, si les mines, si la métallurgie le signent, alors plus aucune branche ne pourra prétexter l'impossibilité.",
        "Cette plume sur ce papier, c'est l'aboutissement de Lyon 1831, du juin 1848, de la Commune, des canuts, des grévistes de Carmaux. Je signe pour eux.",
      ],
      huis_clos: [
        "Soyons clairs avec vous, Messieurs du patronat. Nous sommes mandatés par nos sections. Sans avancée concrète sur les salaires d'ici demain, nous quittons cette table.",
        "Vous parlez de compétitivité. Nous parlons de la dignité ouvrière. Tant que ces deux mots ne se rencontrent pas, nous n'avancerons pas.",
        "Le préfet attend dehors, mais ce n'est pas lui qui décide. C'est vous, et c'est nous. Faites votre choix : un accord aujourd'hui, ou la grève qui s'étend dès lundi.",
        "Vous me parlez d'investissement. Je vous parle de tuberculose dans les ateliers, d'enfants qui n'ont pas le temps d'aller à l'école. Vos chiffres ne pèsent pas lourd à côté.",
      ],
    },
    patron: {
      manifestation: [
        "Je comprends la colère ouvrière. Mais l'industrie française ne peut pas tout. La concurrence anglaise, la concurrence allemande, ne nous laissent pas la main libre.",
        "Cette agitation est l'œuvre de meneurs. La grande masse des ouvriers est paisible, soucieuse de son ouvrage. Que les bonnes volontés se ressaisissent et reprennent l'atelier.",
        "Nous sommes des entrepreneurs, non des philanthropes. Mais nous savons que sans paix dans nos usines, il n'y a pas de prospérité possible. Acceptons une trêve.",
        "La nation a besoin de calme. La République repose sur l'ordre, et l'ordre passe d'abord par l'usine. Que chacun retourne à son poste, et la discussion pourra reprendre.",
        "Je dis aux familles ouvrières : vos hommes vous coûtent cher en grève. Ils ne gagnent rien. L'usine, elle, peut tenir des mois. Réfléchissez avant de les laisser partir.",
        "Je n'ai jamais refusé le dialogue. Mais je refuse le chantage à la rue. Que les ouvriers redescendent à l'atelier, et nous parlerons sérieusement.",
      ],
      meeting: [
        "Messieurs, nos intérêts sont liés. Le Comité des Forges, la Confédération générale du patronat français, le Comité interprofessionnel : tous nos organes parlent quand nous sommes unis.",
        "Cédons sur la forme, gardons le fond. C'est le b-a-ba de toute négociation. Nos amis politiques nous y aideront ; nos préfets, nos députés sont du nôtre quand il s'agit d'industrie.",
        "Je propose que nous tenions ferme sur le principe. Une concession aujourd'hui appelle dix concessions demain. C'est l'ABC de l'autorité dans une entreprise.",
        "Mes chers collègues, n'oublions jamais : l'épargne nationale est entre nos mains. Sans elle, pas de chemins de fer, pas de coloniale, pas de France moderne. Nous portons une responsabilité.",
        "L'Église, l'État, la magistrature : tous nous regardent. Nous devons nous montrer dignes. Pas de panique, pas de capitulation, pas de divisions internes.",
        "Si nous cédons aujourd'hui aux meneurs, demain c'est l'expropriation. Pensons à nos pères, à ceux qui ont fondé nos maisons. Nous leur devons cette fidélité.",
      ],
      signature: [
        "Cet accord nous engage tous. Il pèse sur nos comptes, mais il garantit aussi la paix dans les ateliers, qui est le premier capital d'une fabrique française.",
        "Je signe en homme d'industrie, en homme de patrimoine. Aujourd'hui c'est une concession ; mais c'est aussi un investissement dans la stabilité de nos maisons.",
        "Cet accord n'est pas un triomphe. C'est un compromis. L'équilibre vaut mieux qu'une victoire à courte vue qui aurait son lendemain en grève générale.",
        "Que les ouvriers comprennent : ce que nous accordons aujourd'hui, nous l'accordons par souci de la nation, non par faiblesse. Que la production reprenne, et que la France travaille.",
        "Cette plume scelle un accord obtenu après des semaines de discussion. Que ceux qui en doutaient apprennent : le patronat français sait reconnaître la nécessité quand elle se présente.",
        "Je signe au nom de mes pairs du Comité des Forges. Cet accord ouvre une nouvelle ère du dialogue entre maîtres et ouvriers. Que d'autres branches suivent notre exemple.",
      ],
      huis_clos: [
        "Notre offre est sérieuse. Elle représente un effort réel pour des entreprises qui affrontent la concurrence anglaise et allemande. N'attendez pas davantage de notre part.",
        "Je veux bien discuter du calendrier, des modalités. Mais le principe de la liberté d'entreprendre n'est pas négociable. C'est la limite fixée par notre Comité.",
        "Vous me parlez de salaires. Je vous parle de carnets de commande qui se vident. Si nous fermons les usines, qui retournera à la mine pour vous ?",
        "Soyez raisonnables. Nous avons les préfets de notre côté. Vous avez la rue. La rue est volatile, l'État est permanent. Concluez avec nous tant que c'est encore possible.",
      ],
    },
  },
  apres_guerre: {
    salarie: {
      manifestation: [
        "Travailleurs ! Nous avons reconstruit ce pays brique par brique. Aujourd'hui, on nous dit que la croissance ne suffit pas. Pour qui, alors ? Pas pour les nôtres. C'est inacceptable.",
        "Compagnons, le programme du Conseil National de la Résistance n'a pas été écrit pour rien. La Sécu, les retraites, les conventions collectives : on nous les arrache une à une. Défendons-les.",
        "On nous parle de progrès. Nous voyons les conditions de travail se dégrader, les cadences accélérer, les ateliers fermer. Le progrès, c'est nous. Pas la Bourse.",
        "Cette manifestation rappelle au gouvernement et au patronat que la classe ouvrière française n'est pas une variable d'ajustement. Nous sommes la France qui produit.",
        "Camarades, on a obtenu Grenelle en bloquant le pays. On obtiendra ce qui reste à arracher de la même manière. Le rapport de force, c'est nous qui le créons.",
        "Que les ministres et les patrons regardent : c'est dix millions de Français dans la rue. Pas une crispation passagère. Un mouvement de fond. Qu'ils en tirent les conséquences.",
      ],
      meeting: [
        "Mes camarades, nous sommes le syndicalisme français de l'après-guerre. Nous portons un héritage : la Sécu, les conventions, les comités d'entreprise. Pas question de les laisser détricoter.",
        "L'unité d'action n'est pas un mot creux. Avec la CGT, avec FO, avec la CFDT — quand nous parlons d'une seule voix, le patronat tremble. Quand nous nous divisons, il se frotte les mains.",
        "Je propose que nous renforcions le mandat de négociation. Pas une concession sans contrepartie. Le compromis, oui ; la capitulation, jamais.",
        "Nous votons pour ceux qui n'ont pas de voix : les intérimaires, les apprentis, les précaires. Notre mandat, c'est la solidarité, pas la corporation.",
        "L'État cherche à nous court-circuiter par la voie réglementaire. Soyons clairs : sans dialogue social, pas de paix sociale. Le gouvernement le découvrira à ses dépens.",
        "Compagnons, l'heure est aux décisions. Soit on accepte la modernisation à n'importe quel prix, soit on impose nos garde-fous. Je vous propose la seconde voie.",
      ],
      signature: [
        "Cette signature consacre des mois de négociation. Nos délégués branche, nos négociateurs interprofessionnels, nos camarades de section : ce papier porte leur travail.",
        "Je signe au nom des nôtres, sans illusion mais sans regret. L'accord vaut ce que vaut sa mise en œuvre. Nous resterons vigilants, entreprise par entreprise.",
        "L'heure n'est pas à la fête. Cet accord nous engage à une discipline : faire respecter chaque alinéa. La signature, c'est le début, pas la fin.",
        "À ceux qui critiquent ce compromis, je rappelle : nous avons obtenu sur les salaires, sur le temps de travail, sur la formation. Pas tout, mais l'essentiel.",
        "Que cet accord serve d'exemple à toute l'interprofession. Si la métallurgie, si le bâtiment, si la chimie le signent, alors la branche commerce et services suivra.",
        "Au nom de notre confédération, je signe. C'est le résultat de Grenelle, des Auroux, des grèves de 95. Une étape de plus dans la longue marche du droit social français.",
      ],
      huis_clos: [
        "Soyons clairs. Sans avancée sur les salaires d'ici la fin de la séance, nous quittons la table. Nous sommes mandatés. Nous ne sommes pas venus écouter des promesses.",
        "Vous parlez de compétitivité. Nous parlons de pouvoir d'achat. Tant que ces deux mots ne se rencontrent pas, on n'avance pas d'un mètre.",
        "Le ministre nous attend en fin de semaine. Vous savez comme nous ce qui se passera s'il doit trancher : ce sera moins favorable pour vous que pour nous. Concluons maintenant.",
        "Vous parlez de modernisation. Nous parlons de licenciements. Modernisez si vous voulez, mais pas sur le dos des travailleurs qu'on jette à la porte sans formation.",
      ],
    },
    patron: {
      manifestation: [
        "Je comprends la colère. Mais bloquer le pays ne crée pas un emploi. La France a besoin d'investissement, de stabilité, de confiance. Pas d'une nouvelle guerre sociale.",
        "Personne n'a intérêt à un conflit prolongé. Ni les salariés, ni les entreprises, ni nos clients à l'étranger. Reprenons le dialogue. Vite.",
        "Je dis aux salariés qui défilent : nous entendons votre inquiétude. Nous demandons en retour qu'on entende la nôtre. Sans entreprises performantes, il n'y a pas d'emplois.",
        "L'industrie française traverse une mutation. Nous ne pouvons pas la freiner par décret. Mais nous pouvons en partager le coût avec discernement. C'est ce que nous proposons.",
        "Je rappelle que notre patronat français n'a pas attendu la rue pour proposer des avancées. Le Plan, les comités d'entreprise, la formation continue : nous y avons contribué.",
        "Les salariés en colère ne représentent pas tous les salariés. Beaucoup, dans les usines et les bureaux, attendent simplement que le travail reprenne. Ne les oublions pas.",
      ],
      meeting: [
        "Mes chers collègues, la compétitivité française ne se décrète pas. Elle se construit accord après accord, branche après branche. Tenons le cap de la responsabilité.",
        "Notre responsabilité n'est pas de gagner contre les syndicats. Elle est de préserver l'emploi en France. Cela suppose des concessions intelligentes, pas des reculs.",
        "Le CNPF, devenu MEDEF, a besoin de parler d'une seule voix. Le patronat divisé est un patronat affaibli, et c'est l'économie tout entière qui en paie le prix.",
        "Nous représentons les entreprises françaises, des PME aux grands groupes. Nos intérêts sont divergents, mais notre cap doit être commun : préserver la création de richesse en France.",
        "Si nous cédons aujourd'hui à toutes les revendications, demain nos entreprises délocalisent. Préservons un équilibre — pas un statu quo, un équilibre.",
        "L'État joue son rôle d'arbitre. À nous de jouer le nôtre : celui de l'employeur responsable. Sans nous, pas de croissance ; sans dialogue, pas de paix sociale.",
      ],
      signature: [
        "Cet accord engage nos entreprises pour des années. Il pèse sur nos comptes, mais il garantit aussi la paix sociale, premier capital d'une entreprise française.",
        "Je signe en pleine conscience. C'est un coût immédiat. C'est aussi un investissement de long terme dans la confiance entre acteurs sociaux français.",
        "Cet accord n'est pas parfait. Il est équilibré. L'équilibre, en ces temps difficiles, vaut bien plus qu'une victoire à courte vue.",
        "Au nom des branches que je représente, je signe. Cet accord ouvre une nouvelle séquence du dialogue social français. Que d'autres branches suivent notre exemple.",
        "Cette signature consacre des mois de négociation menée par nos négociateurs et leurs équipes. Que la mise en œuvre soit à la hauteur des compromis acceptés.",
        "Je tiens à saluer le travail de mes interlocuteurs syndicaux. Le compromis n'est jamais une trahison. C'est la condition d'une République sociale qui fonctionne.",
      ],
      huis_clos: [
        "Notre offre est sérieuse. Elle représente un effort réel pour des entreprises qui affrontent une concurrence mondiale brutale. N'attendez pas davantage de notre côté.",
        "Je veux bien discuter du calendrier, des modalités, du périmètre. Mais le principe de la liberté de gestion n'est pas négociable. C'est la limite fixée par notre conseil.",
        "Vous parlez de salaires. Je vous parle de carnets de commande qui se vident. Si l'industrie française perd ses marges, qui paiera la formation et les retraites de demain ?",
        "Soyez réalistes. Le gouvernement attend un accord. Si vous le refusez, il imposera par décret. Vous savez que ce sera moins favorable. Concluons maintenant.",
      ],
    },
  },
  contemporain: {
    salarie: {
      manifestation: [
        "Salariés, salariées, nous sommes ici parce que la pénibilité augmente, les salaires stagnent, et l'on nous parle encore de souplesse. La souplesse, c'est sur notre dos. Assez.",
        "Je le dis aux ministres et aux DRH : on ne brade pas la dignité du travail contre une part variable. Le statut, la convention, le contrat — c'est ça notre socle.",
        "Cette manifestation n'est pas contre la France. Elle est pour la France qui se lève à 6h, qui livre, qui code, qui forme, qui soigne. Cette France-là demande du respect.",
        "Aux jeunes salariés en CDD, aux livreurs auto-entrepreneurs, aux intérimaires : votre place est ici. Le syndicalisme du XXIᵉ siècle, c'est nous, ou ce ne sera personne.",
        "On nous oppose les actifs aux retraités, le privé au public, les ouvriers aux cadres. Nous ne tomberons pas dans le piège. La solidarité, c'est notre seul vrai pouvoir.",
        "Que les algorithmes des plateformes, les IA des RH, les outsourceurs comprennent : derrière chaque code QR, il y a un travailleur. Ce travailleur a des droits, et il les défendra.",
      ],
      meeting: [
        "Mes camarades, le rapport de force se construit ici, dans cette salle, avant de se vivre demain. Voter clair, voter fort, voter uni — c'est notre force.",
        "L'unité du mouvement n'est pas un slogan. C'est notre seule arme face à un patronat qui sait, lui, parler d'une seule voix. CFDT, CGT, FO, Solidaires : marchons groupés.",
        "Je propose de renforcer le mandat. Pas une concession sans contrepartie. Pas une signature sans débat. Pas un accord qui sacrifie nos plus précaires.",
        "Le digital, l'IA, le télétravail bouleversent les règles. À nous de les négocier. Pas de les subir. Cette assemblée doit fixer notre cap pour les cinq ans qui viennent.",
        "L'État cherche à nous court-circuiter par les ordonnances et les 49.3. Soyons clairs : sans dialogue social, pas de paix sociale. Le gouvernement le découvrira.",
        "Aux jeunes adhérents qui nous rejoignent : votre mandat va plus loin que nos accords. Vous portez la mémoire des combats syndicaux du XXᵉ siècle ET le défi du XXIᵉ.",
      ],
      signature: [
        "Cette signature ne clôt pas un combat. Elle en consacre une étape. Ce que nous arrachons aujourd'hui, d'autres l'ont préparé pendant des années, et d'autres devront le défendre demain.",
        "Je signe au nom des miens, sans ivresse et sans regret. L'accord vaut ce que vaut sa mise en œuvre. Nous resterons vigilants, branche par branche, entreprise par entreprise.",
        "L'heure n'est pas aux célébrations. L'heure est au travail. Cet accord nous engage. Engageons-nous, nous aussi, à le faire respecter sur le terrain.",
        "À ceux qui critiquent ce compromis, je dis : ce n'est pas une fin, c'est une preuve qu'on peut arracher quelque chose à un patronat qui jure n'avoir rien à donner.",
        "Cet accord doit servir d'exemple à toute la branche. Que la chimie, le bâtiment, les services le déclinent. La signature ici n'a de sens que si elle se diffuse.",
        "Au nom de notre fédération, je signe. C'est l'aboutissement de mois de négociation. Que la mise en œuvre soit à la hauteur des compromis acceptés.",
      ],
      huis_clos: [
        "Soyons clairs. Sans avancée concrète sur les salaires d'ici la fin de la séance, nous quittons la table. Nous sommes venus négocier, pas écouter des promesses.",
        "Vous me parlez de compétitivité. Je vous parle de pouvoir d'achat. Tant que ces deux mots ne se rencontrent pas, nous n'avançons pas d'un mètre.",
        "Bercy attend un accord. Si on ne sort pas avec quelque chose de signé, le gouvernement passera par ordonnance. Ce sera pire pour vous que pour nous. Concluons.",
        "Vous me parlez de réforme. Je vous parle de pénibilité, de TMS, de burn-out. Réformez si vous voulez, mais pas sans contreparties pour celles et ceux qui paient l'addition.",
      ],
    },
    patron: {
      manifestation: [
        "Je comprends la colère. Mais bloquer le pays ne crée pas un emploi. La France a besoin d'investissement, de stabilité, de confiance. Pas d'une nouvelle guerre sociale.",
        "Personne n'a intérêt à un conflit prolongé. Ni les salariés, ni les entreprises, ni nos clients à l'étranger. Reprenons le dialogue. Vite.",
        "Je dis aux salariés qui défilent : nous entendons votre inquiétude. Nous demandons en retour qu'on entende la nôtre. Sans entreprises compétitives, il n'y a pas d'emplois.",
        "L'économie française est dans une transformation profonde. Numérique, transition écologique, IA. Nous ne pouvons pas freiner ces évolutions, mais nous pouvons en partager le coût.",
        "Le MEDEF n'est pas opposé à la négociation. Mais nous demandons que le gouvernement ne se substitue pas aux partenaires sociaux. Laissez-nous discuter.",
        "Aux salariés sincères qui défilent, je dis : ne vous laissez pas confisquer votre voix par les jusqu'au-boutistes. Le compromis est notre intérêt commun.",
      ],
      meeting: [
        "Mes chers collègues, la compétitivité ne se décrète pas. Elle se construit accord après accord, branche après branche. Tenons le cap de la responsabilité.",
        "Notre responsabilité n'est pas de gagner contre les syndicats. Elle est de préserver l'emploi en France. Cela suppose des concessions intelligentes, pas des reculs.",
        "Le MEDEF doit parler d'une seule voix. Le patronat divisé est un patronat affaibli, et c'est l'économie tout entière qui en paie le prix.",
        "Du grand groupe à la TPE, nos intérêts divergent parfois. Mais notre cap reste commun : préserver la création de valeur en France et lutter contre la délocalisation.",
        "L'État doit être un arbitre, pas un acteur. Notre tâche, à nous représentants des entreprises, c'est de proposer un cadre que le gouvernement n'aura pas besoin de réécrire.",
        "Si nous cédons aujourd'hui à toutes les revendications, demain nos entreprises ne sont plus compétitives. Préservons l'équilibre — pas un statu quo, un équilibre.",
      ],
      signature: [
        "Cet accord nous engage tous. Il pèse sur nos comptes, mais il garantit la paix sociale, premier capital d'une entreprise française.",
        "Je signe en pleine conscience. C'est un coût immédiat. C'est aussi un investissement à long terme dans la confiance entre acteurs sociaux.",
        "Cet accord n'est pas parfait. Il est équilibré. En ces temps difficiles, l'équilibre vaut largement mieux qu'une victoire à courte vue.",
        "Au nom des branches que je représente, je signe. Cet accord ouvre une nouvelle séquence du dialogue social français. Que d'autres branches s'en inspirent.",
        "Cette signature consacre plusieurs mois de négociation. Je salue le travail des équipes des deux côtés. La mise en œuvre sera la vraie épreuve.",
        "Je tiens à saluer mes interlocuteurs syndicaux. Le compromis n'est pas une trahison. C'est la condition d'un dialogue social qui fonctionne.",
      ],
      huis_clos: [
        "Notre offre est sérieuse. Elle représente un effort réel pour des entreprises qui affrontent une concurrence mondiale brutale. N'attendez pas davantage de notre côté.",
        "Je veux bien discuter du calendrier, des modalités, du périmètre. Mais le principe de la liberté de gestion n'est pas négociable. C'est la limite fixée par notre conseil.",
        "Vous parlez de salaires. Je vous parle de marges qui s'effondrent, d'investissements reportés. L'addition reviendra à tout le monde si nous ne trouvons pas un compromis.",
        "Soyez réalistes. Bercy attend un accord. Si vous refusez, le gouvernement passera par ordonnance. Vous savez que ce sera moins favorable. Concluons maintenant.",
      ],
    },
  },
};

/* === Sélection d'une voix française === */

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickFrenchVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) {
    // getVoices() peut retourner [] avant le premier `voiceschanged`.
    // On laisse cachedVoice undefined pour réessayer plus tard.
    return null;
  }
  // Préfère fr-FR > fr-CA > fr*. Voix locale > distante.
  const fr = voices.filter((v) => v.lang.startsWith('fr'));
  if (fr.length === 0) {
    cachedVoice = null;
    return null;
  }
  fr.sort((a, b) => {
    const score = (v: SpeechSynthesisVoice) =>
      (v.lang === 'fr-FR' ? 4 : v.lang === 'fr-CA' ? 2 : 1) +
      (v.localService ? 1 : 0);
    return score(b) - score(a);
  });
  cachedVoice = fr[0];
  return cachedVoice;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  // Réinit le cache quand la liste change (Chrome charge async).
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = undefined;
  });
}

/* === API publique === */

/** Pioche un texte de discours (déterministe, hors-ligne).
 *  Tirage stable sur (eraGroup × camp × moment) modulo seed
 *  lié au scenarioTitle/posture pour varier d'une partie à l'autre. */
export function pickSpeechText(req: SpeechRequest): string {
  const eraGroup: SpeechEraGroup = req.eraId
    ? (ERA_GROUPS[req.eraId] ?? 'contemporain')
    : 'contemporain';
  const pool = SPEECHES[eraGroup]?.[req.camp]?.[req.moment];
  if (!pool || pool.length === 0) return '';
  const seedSrc = `${eraGroup}|${req.camp}|${req.moment}|${req.posture}|${req.scenarioTitle ?? ''}`;
  let seed = 0;
  for (let i = 0; i < seedSrc.length; i++) seed = (seed * 31 + seedSrc.charCodeAt(i)) >>> 0;
  return pool[seed % pool.length];
}

export interface SpeakOptions {
  /** Vitesse de lecture (0.5-2). 0.95 par défaut, posé. */
  rate?: number;
  /** Pitch (0-2). Défaut 1.0. */
  pitch?: number;
  /** Volume (0-1). Défaut 0.85. */
  volume?: number;
  /** Si true, attend que le discours soit fini avant de résoudre. */
  await?: boolean;
  /** Callback exécuté à la fin (succès ou erreur), pour unduck etc. */
  onEnd?: () => void;
}

/** Lit le texte avec la voix française disponible. Retourne false si
 *  aucune voix dispo (l'appelant peut alors afficher en sous-titré). */
export async function speakText(text: string, opts: SpeakOptions = {}): Promise<boolean> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    opts.onEnd?.();
    return false;
  }
  const voice = pickFrenchVoice();
  if (!voice) {
    await new Promise((r) => setTimeout(r, 200));
    if (!pickFrenchVoice()) { opts.onEnd?.(); return false; }
  }
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }

  const utt = new SpeechSynthesisUtterance(text);
  if (cachedVoice) utt.voice = cachedVoice;
  utt.lang = cachedVoice?.lang ?? 'fr-FR';
  utt.rate = opts.rate ?? 0.95;
  utt.pitch = opts.pitch ?? 1.0;
  utt.volume = opts.volume ?? 0.85;

  let onEndFired = false;
  const fireEnd = () => { if (!onEndFired) { onEndFired = true; opts.onEnd?.(); } };

  if (opts.await) {
    return new Promise<boolean>((resolve) => {
      utt.onend = () => { fireEnd(); resolve(true); };
      utt.onerror = () => { fireEnd(); resolve(false); };
      try { window.speechSynthesis.speak(utt); }
      catch { fireEnd(); resolve(false); }
    });
  }
  utt.onend = fireEnd;
  utt.onerror = fireEnd;
  try { window.speechSynthesis.speak(utt); }
  catch { fireEnd(); return false; }
  return true;
}

/** Coupe immédiatement tout discours en cours et restaure les volumes. */
export function stopSpeech() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
  // Sécurité : restaure la musique au cas où l'unduck onEnd ne tirerait
  // pas (Safari avale parfois l'event onend après cancel()).
  import('../../game/audio/sfx').then((m) => {
    m.sfx.duckMusic(1, 400);
    m.sfx.duckSfx(1, 300);
  }).catch(() => { /* ignore */ });
}

/** Lit la pref granularity TTS (Settings) : 'always', 'ceremonies', 'never'. */
function readSpeechGranularity(): 'always' | 'ceremonies' | 'never' {
  try {
    const v = localStorage.getItem('paritas_speech_granularity');
    if (v === 'always' || v === 'never') return v;
  } catch { /* ignore */ }
  return 'ceremonies';
}

/** Lit le volume voix (0-100) depuis Settings, défaut 85. */
function readVoiceVolume(): number {
  try {
    const v = localStorage.getItem('paritas_voice_volume');
    const n = v === null ? 85 : Number(v);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) / 100 : 0.85;
  } catch { return 0.85; }
}

/** Pioche un texte + le lit. Renvoie le texte (toujours) pour affichage
 *  en sous-titre — qu'il soit lu ou non.
 *
 *  Respecte la granularité TTS de Settings (always/ceremonies/never).
 *
 *  Side-chain ducking : pendant la lecture, la musique baisse à 25 %
 *  (-12 dB env) et les SFX à 35 %. Au end de l'utterance, on rétablit. */
export async function deliverSpeech(req: SpeechRequest, opts: SpeakOptions = {}): Promise<string> {
  const text = pickSpeechText(req);
  if (!text) return text;

  // Granularité utilisateur : si 'never', on retourne le texte mais
  // on ne lit pas. Si 'ceremonies', seuls signature et huis_clos sont lus.
  const gran = readSpeechGranularity();
  const allowedMoments: SpeechMoment[] =
    gran === 'never' ? [] :
    gran === 'ceremonies' ? ['signature', 'huis_clos'] :
    ['manifestation', 'meeting', 'signature', 'huis_clos'];
  if (!allowedMoments.includes(req.moment)) return text;

  const pitchByPosture: Record<SpeechPosture, number> = {
    rupture: 1.05,
    tribun: 1.10,
    pragmatique: 0.95,
    technocrate: 0.92,
    paternaliste: 0.98,
    batisseur: 1.0,
  };
  let unduck: (() => void) | null = null;
  try {
    const sfxMod = await import('../../game/audio/sfx');
    sfxMod.sfx.duckMusic(0.25, 250);
    sfxMod.sfx.duckSfx(0.35, 250);
    unduck = () => {
      sfxMod.sfx.duckMusic(1, 600);
      sfxMod.sfx.duckSfx(1, 400);
    };
  } catch { /* ignore */ }

  speakText(text, {
    ...opts,
    pitch: opts.pitch ?? pitchByPosture[req.posture],
    volume: opts.volume ?? readVoiceVolume(),
    onEnd: unduck ?? undefined,
  }).catch(() => { unduck?.(); });

  return text;
}
