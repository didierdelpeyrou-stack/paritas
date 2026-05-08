# Journal — Camille (agent-27), lentille juriste droit social

> Note de cadrage : le profil canonique d'agent-27-camille.md est une étudiante L2 socio à Nanterre. La mission ORDA-014 me demande de tenir une **lentille juriste droit social** (TPE/PME) ; je l'assume comme posture de test, sans réécrire le profil. Le ton reste celui d'une lectrice attentive aux dates, aux noms de loi, et à l'usage pratique des institutions paritaires au quotidien.

Build testé : HEAD `0813c75`, v2.2.2-prebeta. 376 tests verts, 13 callbacks acteurs branchés, 13 institutions au catalogue (`src/game/simulation/institutions.ts`).

---

## Audit juridique du catalogue d'institutions

J'ouvre `src/game/simulation/institutions.ts` en premier. C'est la **source de vérité** que le moteur consulte quand le joueur « crée » une institution paritaire.

**Ce qui tient juridiquement** :
- `syndicat-1884` (l.40-44) : « 1884 / Loi Waldeck-Rousseau ». Date OK. Dans `scenarios/premium.ts:204` la mention est complète : « 21 mars 1884 ». Dans le catalogue elle est simplement « 1884 », ce qui passe.
- `conventions-collectives-1919` (l.51-56) : « 1919 / Loi du 25 mars 1919 ». Conforme.
- `secu-1945` (l.63-68) : « 1945 / Ordonnances du 4 octobre. Croizat / Laroque. ». **Petite imprécision** : la Sécurité sociale est issue des **ordonnances des 4 et 19 octobre 1945** — l'ordonnance du 4 organise les caisses, celle du 19 fixe le régime général. `scenarios/premium.ts:322` cite correctement les deux dates ; le catalogue n'en cite qu'une.
- `chsct-1982` (l.88-92) : « 1982 / Loi Auroux du 23 décembre. ». Là c'est **juridiquement exact** — la 4ᵉ loi Auroux (CHSCT) est bien la loi n° 82-1097 du 23 décembre 1982, distincte de la loi du 4 août 1982 sur les libertés des travailleurs (citée correctement dans `scenarios/patron.ts:444`). Le jeu tient bien la distinction entre les 4 lois Auroux : `glossary.ts:119` parle de « quatre lois sociales de 1982 ». Bon point.
- `prudhommes` (l.28-32) : « 1806 ». Stricto sensu les premiers prud'hommes (Lyon) datent de la **loi du 18 mars 1806** sous Napoléon. OK. `institutionsRegistry.ts:59` ajoute « refonte 1979 » (loi Boulin du 18 janvier 1979) — c'est une distinction utile que le catalogue principal ne rappelle pas.
- `matignon-1936` (l.58-62) : « Accords de Matignon, 1936, 40h, congés payés, délégués du personnel ». La loi sur les **40 heures** est du **21 juin 1936**, les **congés payés** du **20 juin 1936**, les **délégués du personnel** du **24 juin 1936**. Les accords Matignon eux-mêmes (7 juin 1936) ouvrent la voie ; les lois suivent. Le scénario `1936-matignon.ts:11` est précis sur la chronologie. Le catalogue, en étant elliptique (« 1936 ») amalgame accord et lois — pour un juriste TPE/PME qui cherche la base légale d'un congé, c'est approximatif.

**Ce qui m'inquiète juridiquement** : `src/game/content/institutionsRegistry.ts:32` (le panneau « Mon œuvre ») décrit l'Unédic 1958 comme une **« Convention collective interprofessionnelle de l'assurance chômage »**. Confusion : l'acte fondateur du 31 décembre 1958 est une **convention/accord nationale interprofessionnelle** (ANI au sens contemporain), pas une **convention collective** (CCN, art. L.2232-5 et s. C. trav.). Les deux instruments sont des produits de la négociation collective, mais leur régime de représentativité, d'extension et d'opposabilité diffère sensiblement. `scenarios/premium.ts:391` cite correctement : « Convention nationale interprofessionnelle du 31 décembre 1958 ». Il y a donc **divergence terminologique entre le scénario (juste) et le registre UI (faux)**. C'est l'erreur la plus litigieuse pour qui conseille des PME : la confusion CCN/ANI revient sans cesse en consultation.

**Distinction CCN vs ANI dans le contenu** : sur l'ensemble du jeu, je vois bien l'emploi du mot « accord interprofessionnel » dans les scénarios modernes (`scenarios/futur.ts:33,79,162` ; `legendaryCharacters.ts:338`) et la formule « accords interprofessionnels » dans les conséquences patron (`scenarios/patron.ts:325,594,672`). La **loi du 25 mars 1919** est, elle, bien rattachée à la convention collective de branche (`premium.ts:267-276` : « article 31a du Livre I du Code du travail »). Donc la distinction tient dans la narration ; elle se perd seulement dans le label UI de l'institutionsRegistry pour Unédic.

---

## Partie 1 — traversée institution-builder (T1 → T55)

Je joue mentalement une partie côté syndicaliste, profil bâtisseur, en visant la création d'institutions.

- **T1 (1791, Le Chapelier)** — `premium.ts:14-29` cite la loi du 14 juin 1791 article 1. Texte juridique exact. Le mode Compulsif fonctionne : l'effet « libre seul face au maître » est plus poétique que juridique mais légitime.
- **T~30 (1864, Ollivier)** — choix `cree-mutuelle-1864` (`premium.ts:187`). Le label scénario dit « Société de secours dépénalisée (loi Ollivier) » ce qui est juste : la **loi du 25 mai 1864** dépénalise la coalition (art. 414 anc. C. pén.), mais c'est bien de la **dépénalisation de la coalition** qu'il s'agit, pas de la création des mutuelles (régies par la loi du 1er avril 1898 dite « charte de la mutualité »). Le glissement « caisse mutuelle ↔ loi Ollivier » est journalistique. Pour un juriste : **la mutuelle 1864 du jeu mélange en réalité deux histoires** (coalition dépénalisée + secours mutuel). Acceptable en serious game pour la fluidité, mais à signaler.
- **T~36 (1884)** — choix Waldeck-Rousseau (`cree-syndicat-1884`). Citation textuelle de l'art. 2 de la loi du 21 mars 1884 (`premium.ts:215-220`). **Excellent**. C'est l'écriture juridique la plus propre du jeu : on a la date, le texte, la source. C'est ce que je voudrais voir partout.
- **T~46 (1919, conventions collectives)** — `cree-conventions-1919` (callback en `choiceResolver.ts:64`). Le catalogue ajoute bien `conventions-collectives-1919` à `memory.builtInstitutions`. Article 31a Livre I cité : c'est l'ancien numérotage avant la recodification de 2008 (depuis : art. L.2232 et s.). À l'époque c'était bien 31a — donc historiquement juste pour 1919, mais un joueur juriste contemporain pourrait être troublé. Une note « ancien C. trav., recodifié 2008 art. L.2232+ » serait un plus pédagogique.
- **T~50 (1945, Sécu)** — `cree-secu` (callback ligne 60-62 puis 162-167). On crée `secu-1945`. Croizat est nommé. Le scénario `premium.ts:322` cite les deux ordonnances 4 et 19 octobre. Pour un juriste social, c'est conforme.

À T55 j'ai posé 5 institutions (mutuelle, syndicat, conventions, sécu, prud'hommes). Le panneau « Mon œuvre » s'allume ; je vois le label « Convention collective interprofessionnelle de l'assurance chômage » pour Unédic et là je tique (cf. supra). Premier décrochage juridique de la session.

---

## Partie 2 — patron qui doit composer (parcours `cpme.ts` + `patron.ts`)

Je relance, profil patron CPME.

- **`cpme.ts:22`** — la fusion CE/DP/CHSCT par les ordonnances Macron 22 septembre 2017 est correctement décrite, ainsi que la position CPME (refus du volet CSE) vs MEDEF (signature). Très précis sur l'effet seuil : l'arrivée du CSE dans les 11-49 salariés. **C'est le passage le plus juste juridiquement de tout le corpus**, et c'est précisément le sujet sur lequel un juriste TPE/PME se fait attaquer en clientèle. Bravo.
- **`patron.ts:444-452`** — Auroux 4 août 1982 cité, NAO + CHSCT + droit d'expression + section syndicale. L.2242 (NAO) et L.4612 (CHSCT puis CSE) sont implicitement là.
- **`patron.ts:475`** — « Stratégie de bornage : faire produire par la jurisprudence une interprétation restrictive ». C'est exactement le réflexe de conseil patronal post-réforme. La phrase est juridiquement juste et stratégiquement vraie. Bonus narratif.

Une partie patron **reste cohérente**. Les seules erreurs que je relève sont celles déjà notées sur le catalogue : Unédic-CCN/ANI, Sécu une seule ordonnance, Mutuelle/Ollivier qui condense deux régimes.

---

## Test des 7 ateliers — angle conformité juridique

Je passe rapidement les 7 ateliers (`src/components/ateliers/`) sous l'angle « est-ce que les concepts juridiques sont correctement représentés ? ».

1. **NaoSimulation** (`NaoSimulation.svelte` + `game/ateliers/nao/engine.ts`) : la mécanique de NAO (négociation annuelle obligatoire, art. L.2242-1 C. trav.) est bien représentée comme cycle de séances avec thèmes, postures, signature à majorité. **MAX_SEANCES** et **SIGNING_MAJORITY** existent — la majorité de 30% pour signer un accord (art. L.2232-12) est gérée côté `computeSatisfaction/willUnionSign`. À auditer plus finement la valeur du seuil. Conforme dans l'esprit.
2. **LaTable** : table paritaire abstraite. RAS juridique.
3. **MeetingStandalone** : assemblée syndicale. RAS.
4. **ArenaStandalone** (factionBrawl) : `factionBrawl.ts:224` note explicitement « atelier désormais ASSUMÉ comme côté manifestant ». Pas un sujet juridique.
5. **MatignonStandalone** : ouverture sur les négociations type-Matignon. La structure tripartite (État/patronat/syndicats) est correctement portée.
6. **LaGreve** : modélisation grève. La grève en droit français est un droit individuel exercé collectivement (préambule 1946 al. 7 + art. L.2511-1). Le jeu n'a pas à le rappeler mais ne le contredit pas.
7. **LesElections** : élections professionnelles. Représentativité 10% / 8% (art. L.2122-1 et 2). Pas vu de référence chiffrée dans le composant lui-même — c'est noyé dans la mécanique. Je n'ai pas pu vérifier que les seuils de représentativité sont matérialisés.

**Aucun atelier ne contient d'erreur juridique flagrante**. Il manque par moments la *traçabilité* — un juriste aimerait pouvoir cliquer sur un seuil pour lire l'article.

---

## Synthèse

Le moteur narratif `premium.ts` / `patron.ts` / `cpme.ts` est **d'une justesse remarquable** : citations datées, articles parfois nommés, sources signées. Quand le jeu écrit le droit, il l'écrit bien. Le décrochage est dans les **labels d'UI compacts** du catalogue : `institutionsRegistry.ts` simplifie au point de produire au moins une erreur de qualification (Unédic en CCN). Pour un produit qui prétend tenir devant un juriste, c'est un fix d'une heure.

Biais reconnu : je suis sortie du profil Camille-étudiante pour tenir la lentille juriste demandée par la mission. La voix est plus technique que ce qu'aurait écrit la vraie Camille de Nanterre.
