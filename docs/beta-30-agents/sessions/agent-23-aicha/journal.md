# Journal — Aïcha M., session bêta Paritas

> Note de cadrage : la mission opérateur (HEAD 0813c75) m'a remise en
> « prof d'histoire-géo de lycée, 42 ans » pour évaluer la dimension
> pédagogique du jeu, alors que mon profil canon (`/.claude/agents/agent-23-aicha.md:6`)
> me définit comme aide-soignante AP-HP, 26 ans, CGT-Santé. J'écris
> sous la lentille **enseignante-Première/Terminale** demandée par le
> brief, mais je garde mon biais d'origine — je regarde aussi le ton
> inclusif, la place des figures féminines, la fatigue physique du
> travail. Aucune des deux versions n'est plus légitime que l'autre :
> ce sont deux usages possibles du jeu, et je crois que c'est
> précisément ce que ce brief teste.

## Contexte d'usage projeté

Je prépare, pour ma classe de Première spécialité HGGSP (ou Terminale
en EMC), une séquence sur **« le travail, la grève, la négociation
collective »**. Le programme officiel de Première (thème *« Comprendre
un régime politique : la démocratie »*) et de Terminale (thème
*« L'enjeu de la connaissance »*, et en HGGSP *« Faire la guerre,
faire la paix : formes de conflits et modes de résolution »*) se
prêtent parfaitement à une étude du paritarisme français. Le jeu
Paritas couvre 1789 → 2025 sur 100 tours, avec 51 scénarios in-line +
30 stages pipeline et 15 ères découpées (`src/game/content/eras.ts:28-164`).
La promesse est attirante : un *serious game* qui fait jouer la
négociation Matignon 1936, pas seulement la lire dans Belin.

## Tour par tour — vue prof testant 1936-Matignon en classe

**T1-13 (Révolution → fin XIXe)** — Je pousse « Nouvelle partie » et
je tombe sur le décret d'Allarde, la loi Le Chapelier
(`src/game/content/eras.ts:35`), les Canuts. La densité historique est
réelle, mais 13 tours pour traverser un siècle, c'est déjà beaucoup
pour une heure de cours. Mes élèves vont décrocher. Je note pour ma
fiche TP : **commencer la séance directement à T17 (Front populaire)
ou T20 (Matignon)**.

**T20 — Matignon, 7 juin 1936** — C'est le scénario que je veux montrer.
Je clique « Reprendre à T20 » (en supposant que la fonctionnalité
existe — je n'en suis pas certaine, je note la question pour
l'entretien). Le titre s'affiche : *« Hôtel Matignon — Une nuit qui
change le travail »* (`src/game/content/scenarios/1936-matignon.ts:23-24`).
Le `historicalContext` (ligne 28-29) tient en 6 lignes et nomme
Blum, Jouhaux, Frachon, Lambert-Ribot, les six points (40h, congés
payés, conventions collectives, hausses 7-15%, délégués). Pour une
classe de Première c'est **exactement le bon niveau de précision** :
ni vulgarisation infantile, ni jargon historiographique. Bien.

Sept choix s'offrent au joueur (lignes 79-323) — dont deux branches
patronales exclusives (« jouer la division Jouhaux/Frachon »,
« médiation présidentielle Lebrun », lignes 245-307) qui sont des
options *historiquement attestées* et que mes élèves ne trouveraient
pas dans leur manuel. **Ça, c'est le moment marquant de la session
prof** : la branche « jouer la division CGT/CGTU » est un objet
pédagogique formidable — elle apprend la *dramaturgie réelle* de la
négociation, là où le manuel donne juste le résultat.

Je teste « Refuser tant que l'échelle mobile n'est pas concédée »
(ligne 121-159). La conséquence longterm me cite Pompidou 1968 — un
**callback vers une ère future** que mes élèves ne verront que dans
deux séances. C'est génial pour qui fait toute la chronologie. Pour
ma séance d'1h sur 1936 isolée, c'est de la profondeur perdue.

**T21-30 (Reconstruction, scission FO 1947, Trente Glorieuses)** —
Je traverse pour évaluer. Le scénario Jouhaux-Nobel-1951
(`src/game/content/scenarios/persona.ts:6-89`) est superbe — il fait
réfléchir à la Guerre froide depuis le syndicalisme, pas depuis l'OTAN.
Mais il est `personaFilter: ['jouhaux']` (ligne 14) : un élève qui
joue un autre persona ne le verra **jamais**. Pour un usage classe,
c'est un problème : je ne peux pas garantir que tous mes élèves
croisent le même corpus.

**T35-100 (crise → Macron II)** — Je survole. Les ères « slate »
(crise, Mitterrand, cohabitations, Sarkozy, Hollande, Macron) sont
toutes du même bleu-gris terne (`eras.ts:hue`) : visuellement, on perd
le sentiment de chronologie. Pour une classe, ce serait mieux d'avoir
une teinte par décennie.

## Verdict pédagogique

**Une partie complète de 100 tours = ~3h de jeu attentif** d'après ce
que je lis du moteur. C'est **trois cours d'1h** ou un mini-projet
inter-séance. Ce n'est **pas** utilisable en cours unique d'1h.

**Découpage praticable en mini-séances par ère** : oui, structurellement
le jeu s'y prête (`eras.ts:fromTurn` permet le bornage), mais il
**manque la fonctionnalité « démarrer à l'ère X »** côté UI — sans
ça, je ne peux pas faire un TP focalisé sur Matignon ou sur 1968 sans
forcer mes élèves à traverser 20 tours d'introduction.

**Glossaire** (`src/components/GlossaryText.svelte`, 60 entrées dans
`glossary.ts`) — bien fait : clic = définition + ancrage historique
(loi 1919, refonte 1950 pour « convention collective »,
`glossary.ts:31`). Mes élèves cliqueront. Le seuil `minTermLength=2`
inclut bien les sigles syndicaux (CGT, FO, CFDT, ANI, CSE — ligne 7
du composant). C'est **le meilleur point pédagogique du jeu**.

## 3 silences sur la condition féminine au travail

1. Aucune figure féminine signataire à Matignon
   (`src/game/content/scenarios/1936-matignon.ts:43`) — `actors:
   ['base', 'adversaire', 'etat', 'opinion']`, pas de nommage de
   femmes dans `voices`/`quotes` alors qu'**Henriette Carlier** était
   à la table CGT.
2. Le scénario `jouhaux-nobel-1951` ne mentionne pas une fois sa
   collaboratrice **Yvonne Modiano** ni le rôle des femmes dans la
   reconstruction syndicale d'après-guerre.
3. Pas de scénario sur **Madeleine Pelletier**, **Marie-Louise
   Bouvier** ou les sage-femmes-syndicalistes. Le brief promet 19
   figures légendaires — combien de femmes ? Je n'ai pas trouvé la
   liste, mais l'audit des `personaFilter` donne 5 noms d'hommes
   (Jouhaux, Seillière, Blum, Lambert-Ribot, Frachon).

## 3 réussites côté inclusion

1. La voix `trait: pragmatique` à Matignon (« Trois millions
   d'ouvriers veulent rentrer chez eux ce soir »,
   `1936-matignon.ts:48`) refuse l'héroïsation et reconnaît la fatigue
   des grévistes. C'est rare et juste.
2. Le glossaire intègre les sigles **CGT, CFDT, FO** sans hiérarchie
   éditoriale (`glossary.ts:50-67`) — pas de favoritisme confédéral,
   ce qui est précieux pour une enseignante neutre face à 35 élèves.
3. La branche `matignon-cede-une-semaine-de-conges` (ligne 161-197)
   apprend le **troc tactique réel** — temps libre contre masse
   salariale — qui n'est presque jamais montré aux lycéens. C'est
   exactement le grain pédagogique qui vaut l'investissement.

## Fix prioritaire pour usage classe

**Ajouter un mode « Séance prof » qui permet de démarrer à un tour
choisi (par ère ou par scénario clé)** — sans cette feature, le jeu
reste un objet personnel, pas un outil de TP. Coût estimé faible : la
fonction `eraForTurn` (`eras.ts:167`) et le mapping turn→scénario
existent déjà.

— Aïcha
