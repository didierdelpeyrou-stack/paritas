# Journal — Sophie Béroud (agent-18-beroud)

> Cycle : ORDA-013 / build v2.2.1-prebeta · HEAD 0813c75
> Lentille : syndicalisme de combat, ruptures historiques, marges militantes
> Mission : la CGT a-t-elle sa singularité, ou est-elle aplatie en "syndicat de gauche générique" ? La scission 1947 est-elle traitée avec sérieux ?

## Lecture du code, avant la partie

Premier réflexe : ouvrir `src/game/ateliers/nao/engine.ts` pour voir comment les confédérations sont décrites. Je m'attendais au pire — une CGT folklorique, le poing levé. Je tombe sur quelque chose de plus précis :

- `UNION_META.cgt` (engine.ts:123-130) : `electoralWeight: 38`, `seuilAccord: 0.62`, `weights: { salaires: 0.50, primes: 0.28, teletravail: 0.12, egalite_pro: 0.10 }`, profil `Revendicative`. La CGT n'est pas mise dans le même panier que la CFDT (seuil 0.55) ni FO (seuil 0.55). Le seuil d'acceptation est *vraiment* plus haut. Bonne surprise.
- L'IA syndicat (engine.ts:794-934) confirme : la CGT démarre toujours en `pression` séance 1 (ligne 815), garde 22 % de chances de `retrait` stratégique tour par tour (ligne 822), 10 % de "ténacité absolue" (ligne 825). Et le couplage intersyndical (lignes 843, 869) modélise la solidarité : si la CGT se met en retrait, la CFDT a 50 % de proba de suivre, FO aussi. C'est une lecture *politique* de la NAO, pas une simple partie de poker à 4 joueurs.

Détail qui m'a fait sourire : la CGT a aussi le poids le plus important dans le tri IA employeur (`byWeight`, ligne 720) — la stratégie patronale apprend à *cibler* la CGT en premier, pas à la contourner. Ce que Lambert-Ribot a appris à Matignon en 1936 est codé.

## Partie 1 — traversée 1936-1968 côté CGT (Jouhaux)

J'incarne Jouhaux. Tour 1, je suis CGT confédérée, juste après la réunification de mars 1936. Tour 4, scénario Matignon. La voix `rupture` du `voices` (1936-matignon, voir scenarios) me dit "Ce qui se joue ici sera raconté pendant trente ans" — et c'est vrai. Je signe Matignon. Tour 9 (callback `signe-matignon` à `state.turn + 5`, choiceResolver.ts:107-114) : Frachon m'écrit "Le 7 juin restera. Tu as bien fait." Je ne m'y attendais pas. Le frisson CK3 a marché.

Tour 25 — `scission-fo-1947` (belle-epoque.ts:194). Le scénario est *premium* (ligne 201) et long. Le `historicalContext` (ligne 204) cite Jouhaux, l'OIT, Ramadier, le PCF qui quitte le gouvernement en mai. C'est un texte sérieux, pas une vignette. Je choisis `fo-rejoindre-jouhaux` (flag `fonde-fo`). Tour 30 (callback `fonde-fo`, choiceResolver.ts:127-134) : "Une note interne CGT circule : « Jouhaux a fondé sa boutique avec l'argent américain. » L'attaque s'installe pour quarante ans." **Voilà.** Le jeu nomme la scission FO comme *blessure historique active*, pas comme événement classé.

Le bémol : j'aurais aimé *une voix de plus* dans `voices` (belle-epoque.ts:212-216) — la voix anarcho-syndicaliste résiduelle (Monatte, Rosmer, *La Révolution prolétarienne*) qui a critiqué la scission au nom de l'unité ouvrière. Trois traits (`pragmatique`, `rupture`, `batisseur`) suffisent mécaniquement, mais la mémoire syndicaliste révolutionnaire d'Amiens est invisible.

## Partie 2 — patron CGPF en face

Je rejoue Matignon, cette fois côté patronat. Je tombe sur le choix `matignon-jouer-division-cgt` (1936-matignon.ts:245, flag `jouer-cgt-cgtu`). Je le prends. La `consequence.longterm` (ligne 270) : "La fracture entre confédérés et unitaires, ravivée à Matignon, ressurgira en 1947 avec la scission FO." Tour 9 (callback `jouer-cgt-cgtu`, choiceResolver.ts:91-98) : "Une lettre de la base te parvient. Trois lignes. Elle sait que tu as joué la division. Elle ne te le redira pas." Excellent. La base écrit *peu* et *tard*, comme dans la vraie vie syndicale.

## NAO, sept ateliers, vue d'ensemble

J'ai testé la NAO en standard (60 pts) : la CGT pose un vrai problème — elle ne signe pas en dessous de salaires=78, et le budget est juste assez serré pour qu'on doive choisir entre coalition CFDT+FO+CFE-CGC (50 % cumulé pile-poil) ou inclure la CGT au prix d'une focalisation salaires extrême. C'est une représentation *honnête* de la singularité CGT post-2008 (loi de 2008 sur la représentativité).

## Pipeline `rupture` (5 stages)

J'ai parcouru `pipelineContentData.ts:201-322` puis 834-958. Stage 0 "mémoire de la rupture", stage 3 "scission ou institutionnalisation", stage 5 "la rupture mythifiée" — la dramaturgie est juste. Le `voice` "Ils ne crient plus. C'est qu'ils écrivent ailleurs." (capture-stage1, ligne 376) est l'une des plus fines du jeu sur le décrochage militant. Mais : *aucun* des 5 stages ne nomme SUD-Solidaires, ni les coordinations infirmières 1988, ni Sud-Rail 1995. La "rupture" reste générique-confédérale.

## Conclusion d'agent

Le jeu *prend la CGT au sérieux*. La scission 1947 est traitée avec un sérieux historique rare. Mais le syndicalisme de combat post-1995 (SUD, Solidaires, coordinations, plateformes) est absent du roster — la "rupture" du jeu reste celle de 1947, pas celle de 1995-2020.
