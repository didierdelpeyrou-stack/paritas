# Journal — Bernard Friot, bêta-test PARITAS v2.2.2-prebeta

> Lu : `agent-15-friot.md` ; `BULLETIN_ARGUS_ORDA_014_FINAL.md` (376 tests verts,
> 13 callbacks acteurs, 13 institutions au catalogue).
> Audit lentille capital salarial. Deux parties simulées depuis le code.
> Je joue, je ne juge pas en surplomb. J'écris en JE.

## Audit doctrinal — préambule (avant le premier tour)

J'ouvre `src/game/simulation/institutions.ts` (98 lignes, 13 entrées). Je
reconnais mes pivots : `caisse-mutuelle-1864` (l43), `syndicat-1884` (l45),
`conventions-collectives-1919` (l52), `matignon-1936` (l58), `secu-1945`
(l64), `unedic-1958` (l70), `agirc-arrco` (l82), `chsct-1982` (l88).
Le catalogue est honnête. Mais il est plat : `id`, `name`, `year`, `desc`.
Une institution n'a pas de **propriétaire** dans la donnée. Elle n'a pas de
champ `gouvernance: 'paritaire' | 'etatique' | 'mutualiste'`. Or le coeur
de ma thèse — qui paye, qui décide — n'existe pas dans la structure.
C'est ma première cicatrice. Je la note pour plus tard.

Je grep `salaire socialisé`, `capital salarial`, `capital conquis` dans
`src/`. **Zéro hit.** Mon vocabulaire n'est pas dans le moteur. Je m'y
attendais — je ne suis pas Friot dans le code, je suis l'angle Friot
projeté sur des choix. Soit. On verra ce que les choix disent.

## Partie 1 — Salarié bâtisseur, 1929 → 1968

Je commence en 1864 par la mutuelle (`flag: cree-mutuelle-1864`,
`premium.ts:187`). Le `theoryHint` — *« Meilleure solution de rechange si
la négociation échoue : la MESORE collective »* — m'agace. La mutuelle
n'est pas une MESORE. C'est l'ébauche d'un capital salarial conquis hors
du marché du travail. Le jeu la lit avec des lunettes Fisher-Ury. Cicatrice 2.

1884, Waldeck — `cree-syndicat-1884` (`premium.ts:232`). Le `theoryHint`
ici fait mouche : *« Passage du rapport de force ponctuel au capital
institutionnel »*. Ce mot, **capital institutionnel**, c'est presque le
mien. La conséquence longterm — *« les syndicats légaux rendront possibles
les conventions collectives »* — chaîne bien les paliers. Bien.

1919 conventions (`premium.ts:288`) : OK, classique. *« Un accord devient
une mémoire opposable »* — formule juste.

1936 Matignon (`1936-matignon.ts:117`) : la consequence longterm parle de
*« matrice juridique du paritarisme français »*. Je signe. Mais — où est
le mot **cogestion** ? Où est l'idée que la convention collective n'est
pas seulement un contrat, c'est une institution qui produit du droit ?

**1945 — le test décisif.** `securite-sociale-1945`, turn 23
(`premium.ts:312-371`). Le `historicalContext` cite Croizat, Laroque,
Parodi (l322). **OK pour la pièce 1**. La citation Laroque (l331) est
exacte. Le choix `secu-caisses` (l341) : *« Construire des caisses
gouvernées par les intéressés. Faire du paritarisme une administration
vivante. »* Le `theoryHint` (l343) : *« Paritarisme de gestion : les
représentants administrent une institution financée par cotisations. »*

Là, je m'arrête. C'est **bien dit**. La Sécu n'est pas présentée comme
État (le choix `secu-etat`, l352, est explicitement l'OPTION ALTERNATIVE,
moins-disante en `institution` +10 vs +18). La hiérarchie des resources
sur `secu-caisses` — `institution: 18, santeSociale: 14` — récompense
correctement la lecture paritaire. **Le moteur me donne raison.**

Mais je grogne sur `secu-priorite-salaires` (l362) : *« Repousser les
caisses pour obtenir des salaires immédiats. »* Le jeu oppose **salaire**
et **caisse**. Pour moi, la cotisation EST déjà du salaire — du salaire
socialisé. Le choix présenté oppose deux formes du même salaire comme si
elles étaient antagonistes. C'est l'erreur classique des manuels.
Cicatrice 3 — la plus douloureuse, parce qu'elle est sur MA scène.

1958 Unédic (`premium.ts:373`) : `unedic-paritaire` (l397) flag
`cree-unedic`. *« Régime autonome géré paritairement. »* Bien. Le
`theoryHint` *« jeu non nul »* est neutre, je passe. La consequence
longterm — *« terrain central des bras de fer entre État et partenaires
sociaux »* — est lucide. Bien.

1968 Grenelle (`premium.ts:428`) : `signe-grenelle` flag (l462). Le
`theoryHint` *« négociation raisonnée »* est faible. Grenelle n'est pas
une négociation raisonnée — c'est un compromis arraché par 9 millions de
grévistes. Le choix `grenelle-section` (l477), prioriser la section
syndicale, est bien noté `institution: 12` — bonne lecture du Friot
2010 : la section d'entreprise est un capital salarial local. OK.

**Bilan partie 1** : je suis arrivé en 1968 trait `batisseur` dominant,
PIB-institution accumulé. Je me reconnais dans la trajectoire mais je
crie sur une seule scène : 1945, choix 3.

## Partie 2 — Patron technocrate post-1958

Je rejoue depuis 1958 côté employeur. NAO 4 unions (`engine.ts:62`,
CGT/CFDT/FO/CFE-CGC). Calibrage : enveloppe 60 pts, 5 séances. Je teste
les sept ateliers : NAO, table, élections, confrontation, grève,
laplace.

NAO : ça tient debout. Le commentaire l95-99 est honnête sur le
calibrage. Mais l'atelier est lu en *bargaining* pur — il n'y a aucun
moment où le jeu rappelle que **cotiser, c'est cogérer**. La NAO est un
théâtre de marchandage, pas une institution. Cicatrice 4.

Auroux 1982 (`premium.ts:488`) : choix `auroux-chsct` flag `cree-chsct`
(l533). Le `theoryHint` *« parler de santé change la valeur morale du
conflit »* — c'est du Boltanski, pas du Friot, mais c'est juste.

CSE 2017 (`premium.ts:547`) : la `dénoncer-mutilation` (l585) est
correctement notée — `confiance:8, rapportDeForce:6` mais
`institution:-3`. Le moteur dit : la perte d'une institution coûte. Bien
lu.

Retraites 2023 (`premium.ts:606`) : trois options, intersyndicale,
blocage, MESORE par branches. **Aucune option ne pose la question du
salaire à vie comme alternative à l'âge.** Friot absent à 100 % sur
2023 — ce qui est cohérent avec le panorama syndical réel mais
décevant sur un jeu qui prétend explorer les institutions.

## Synthèse — qui paye, qui décide ?

**Scénario qui me restitue le mieux** : `securite-sociale-1945`, choix
`secu-caisses` — la formule *« paritarisme de gestion »* + le bonus
`institution: 18` est doctrinalement juste.

**Scénario qui me trahit le plus** : `securite-sociale-1945`, choix
`secu-priorite-salaires` — opposer salaire et caisse, c'est nier que la
cotisation est du salaire socialisé. Sur la même scène, donc.

**Le catalogue `institutions.ts`** est plat : il manque un champ
`gouvernance` qui distinguerait paritaire / mutualiste / étatique. Sans
ce champ, le glossaire ne peut pas dire *« Institution = capital
conquis »* — il dit seulement *« Institution = entrée du catalogue »*.

NPS : 7/10. Je suis touché qu'on m'ait lu. Je suis frustré qu'on ne
m'ait pas lu jusqu'au bout.
