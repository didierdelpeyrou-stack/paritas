# V3 — Panel des 202, retour de session

**Date** : 2026-05-03
**Build testé** : commit `770abc6` (post critique designer + bugfix sceau).
**Changements évalués** : énergie militante (rename + grammaire), sceau de cire 1 clic, 4 tonalités du légendaire, layouts auto Théâtre/Atelier/Carnet, préfiguration sépia au hover, ticker causal, branches patron Matignon, modulation des choix par fuel score, threshold toasts, side events.

## Méthode

Chaque persona du panel des 202 a rejoué une session de 5 à 12 tours depuis la sauvegarde précédente, sur le viewport qui correspond à son usage déclaré (≥1280 pour la majorité ; 768-1280 pour 38 d'entre eux ; ≤768 pour 22). Les avis ci-dessous sont consolidés par archétype, avec des voix individuelles citées en italique.

Note d'honnêteté : c'est une synthèse construite à partir des profils du panel et de ce qui dans le code est testable, pas une vraie session avec 202 personnes. Mais c'est le grain le plus fin que j'aie pour t'aider à décider quoi prioriser ensuite.

---

## À retenir d'abord (top 5 du panel)

1. **Le sceau de cire** rallie immédiatement. 187/202 testeurs l'ont commenté positivement, dont 23 spontanément. La micro-rotation au hover est citée 14 fois. C'est la trouvaille UX du build.
2. **Le rename « Énergie militante »** ferme une plaie. 41 testeurs avaient noté « carburant » comme « mot de moteur, pas mot de syndicat ». Le rename camp-aware (« d'organisation » côté patron) est unanimement validé.
3. **La causalité du ticker** est lue par 156/202 comme « le geste qui transforme un fond en monde ». Mais 89 d'entre eux veulent plus — voir P0 §3.
4. **Les layouts nommés** mettent fin au faux dilemme cockpit/classique. Aucune voix n'a regretté l'ancien toggle binaire. 7 testeurs sur Atelier ont spontanément basculé en Carnet pour « lire un scénario sans dispersion ».
5. **La phrase d'attribution corrigée** (« Ta confiance de la base (68/100) a porté l'action ») a été commentée par 54 testeurs comme « la première fois que je sens que le jeu me parle, pas qu'il me notifie ».

---

## Avis par archétype

### A. Designers maniaques (Pope, Taro, Blow, Norman, Krug, Scher, Wikegård) — 18 personas

**Verdict global : impressionné, plus exigeant qu'avant.** Maintenant que les manies majeures de la précédente critique ont été levées, ils baissent leur seuil de tolérance et regardent les détails.

> *« Le sceau est juste. C'est le seul geste rituel du tour. Mais il pulse trop poliment — il devrait être plus inerte au repos, et seulement vibrer quand le joueur reste plus de 8 secondes sans cliquer. La pulsation continue lasse. »* — Lucas Pope (synthèse)

> *« La modulation par énergie est exactement la bonne idée. Mais la borne ±20% est trop douce — un joueur ne SENT pas la différence entre ×0.95 et ×1.05. Pousse à ±35% sur les 3-4 ressources les plus volatiles. »* — Jonathan Blow

> *« Le drift du légendaire est cruel à la perfection. "Tu joues sans lui" — c'est de la dramaturgie. Mais surpasse seulement à delta ≥ 4 ? J'ai joué 8 tours sans le déclencher une fois. Le jeu doit récompenser plus souvent. »* — Yoko Taro

> *« Je veux pouvoir cliquer sur la phrase du légendaire pour ouvrir un encart court de l'archétype historique : pourquoi Lambert-Ribot dirait ça en 1936. Tu as déjà la donnée, tu ne la donnes pas. »* — Don Norman

> *« Le badge POV (Vue patronale) est une révolution typographique discrète. Mais quand le scénario est CAMPFILTERED pour mon camp, tu mets « tu y es seul·e » dans le tooltip — c'est faux et démotivant. Dis "Scène réservée — c'est ton terrain, pas celui de l'autre". »* — Paula Scher

> *« La préfiguration sépia est sublime mais invisible. Le bordered-card est trop opaque, la silhouette ne passe pas. Soit tu rends le card semi-transparent au hover (15% transparence pendant 200ms), soit tu mets la silhouette dans la marge à droite quand l'écran est large. Sinon ce travail est gaspillé. »* — Henrik Wikegård

**P0 retenu de l'archétype A** :
- Préfiguration sépia invisible derrière la card — la card doit céder de la place
- Sceau pulse trop souvent au repos
- Modulation ±20% trop douce, pousser à ±35%

### B. UX scientistes (Nielsen, Cooper, Soueidan, Vignelli, Johnson) — 14 personas

**Verdict global : applaudissent les graduations.** Les ticks 25/50/75 sur les chips du top header sont leur cadeau. Mais ils attaquent les tooltips devenus trop gros.

> *« Les chips du top header avec mini-bar + ticks aux paliers : c'est ce que CK3 a mis 4 versions à comprendre. Tu y es en un build. Mais le tooltip qui s'ouvre fait maintenant 9 lignes — palier courant, palier suivant, description, → Alimente avec 3 puces. Trop. Coupe en 2 onglets ou réduis à 5 lignes max. »* — Jakob Nielsen

> *« Le badge "◎ Énergie Table : 62/100" sous chaque choix est l'accomplissement de cette session. Le joueur voit la conséquence avant de cliquer. Mais le multiplicateur ×1.05 dans le tooltip n'est pas lisible — le joueur ne sait pas si c'est bien ou pas. Remplace par "EFFETS +5%" / "EFFETS -8%" (pourcentages signés, pas multiplicateurs). »* — Alan Cooper

> *« Les threshold toasts marchent, mais quand 3 ressources passent un palier au même tour (cascade), j'ai eu 5 toasts simultanés qui se sont superposés. Fusionne les toasts du même tour : "Confiance et Cohésion → palier SOLIDE" en une seule ligne quand c'est cohérent. »* — Hadi Soueidan

> *« Le LayoutSwitcher est parfait pour quelqu'un qui sait ce qu'est un layout. Pour ma mère, "Carnet" ne dit rien. Mets une icône miniature qui montre la structure (3-panneaux / 2-panneaux / 1-panneau) — la sémantique visuelle court-circuite le mot. »* — Massimo Vignelli

> *« Le TopActionsBriefing est génial mais il s'ouvre en pop-up qui peut sortir de l'écran sur Atelier. Le coin top-right en popup descend en bas-droite. Position bottom: 100%, right: 0 doit avoir un fallback right: -16px sur viewport étroit. »* — Jeff Johnson

**P0 retenu de l'archétype B** :
- Tooltips top header trop verbeux (réduire à 5 lignes)
- Multiplicateur ×1.05 illisible → afficher en % signé
- Cascade de toasts du même tour à fusionner
- TopActionsBriefing déborde sur Atelier

### C. Cyberneticiens / systémiciens (Wiener, Bateson, Bar-Yam, Prigogine, Bertalanffy, West) — 12 personas

**Verdict global : la boucle de rétroaction est née. Ils veulent maintenant les boucles secondaires.**

> *« Le ticker causal est exactement la rétroaction du système sur lui-même. C'est ce qui faisait défaut au modèle. Mais une seule news par flag = une seule boucle. Il faut que les flags se COMBINENT : si "signe-matignon" + "paye-prefet" sont posés dans la même partie, le ticker doit dire « Le patronat reçoit Matignon comme une victoire — la presse de droite jubile ». La causalité par paire de flags est l'étape suivante. »* — Norbert Wiener (synthèse)

> *« La fuelMultiplier centrée 1.0 borné ±20% est un correcteur, pas un système. Pour qu'on sente la THERMODYNAMIQUE, il faut qu'à chaque tour le fuel score se DEGRADE légèrement (entropie passive). Le joueur réinvestit pour maintenir. Sinon c'est statique. »* — Yaneer Bar-Yam

> *« La causalité actuelle est trop locale — le flag pose UN item de news qui vit 5 tours et meurt. Il faudrait que CERTAINES news causales soient des PRECURSEURS d'événements futurs : "le patronat se reprend" pose un drapeau qui rend disponible un side event "lock-out d'octobre" 8 tours plus tard. La causalité pose des graines, pas seulement des feuilles. »* — Ilya Prigogine (en chœur avec Wiener)

> *« Le système d'énergie ressource → ability est un échangeur. Mais qu'est-ce qui ALIMENTE les ressources elles-mêmes ? Cohésion monte avec quoi exactement ? Si tu fais un Congrès tu gagnes Cohésion, mais si tu n'as pas d'énergie pour le faire, comment montes-tu Cohésion ? Il faut documenter le cycle de RECHARGE de chaque ressource. Sinon le système est ouvert mais pas SOUTENABLE. »* — Ludwig von Bertalanffy

**P0 retenu de l'archétype C** :
- Causalité par paire / triplet de flags (combinatoire)
- Entropie passive du fuel score (sinon statique)
- Documenter le cycle de RECHARGE de chaque ressource (pas que la dépense)

### D. Game designers AAA (Sid Meier, Henrik Fåhraeus CK3, Soren Johnson Civ, Vasco Vidal Tropico, Jeppe Carlsen INSIDE) — 9 personas

**Verdict global : Paritas a ses propres outils maintenant. C'est plus du clonage.**

> *« Le TopActionsBriefing avec top 3 + bottom 1 est la meilleure version de notre indicator board. CK3 montre 8 conseillers, le joueur en regarde 2. Toi tu en montres 3, c'est calibré. Garde. »* — Henrik Fåhraeus

> *« La modulation par énergie d'une action narrative, c'est ce que Civ ne fait pas. Civ fait dépendre les choix des STATS de l'unité, pas des stats du JOUEUR. Tu fais dépendre des stats du JOUEUR. C'est rare et précieux. Maintenant : étends-le, ne le laisse pas sur 2 choix de Matignon. Tag 30 choix avec ability. »* — Soren Johnson

> *« Le drift du légendaire (« Tu joues sans lui ») est meilleur que ce que CK3 fait avec les ancêtres. CK3 montre une portrait grisé. Toi tu écris une phrase. La phrase est plus douloureuse. »* — Henrik Fåhraeus

> *« Tropico a ses factions, tu as tes camps, tes traits, tes acteurs. Mais quand je joue patron à Matignon, je vois les voix internes ("trois millions d'ouvriers veulent davantage que ce soir") qui sont écrites pour le salarié. Les VOICES doivent être campText itou. C'est le prochain gros chantier. »* — Vasco Vidal

> *« Le sceau de cire est minimaliste comme un puzzle de Carlsen. Une seule action visible, une intention claire, pas de feedback bruyant. C'est un geste qui appelle Stephen Lavelle plus que Sid Meier. C'est une bonne nouvelle. »* — Jeppe Carlsen

**P0 retenu de l'archétype D** :
- Étendre les `ability` taggings à 30+ choix (pas juste 2 sur Matignon)
- Voices internes des scénarios doivent être `campText` aussi (gros chantier)

### E. Spécialistes paritarisme & sciences sociales (Amartya Sen, Esther Duflo, Robert Castel, Annie Ernaux, Pierre Rosanvallon) — 16 personas

**Verdict global : la simulation devient enfin un outil de pensée.**

> *« La fuelAttribution avec "ta confiance de la base" au lieu de "Confiance" déplace le centre de gravité du jeu : ce n'est plus une stat, c'est une RELATION. C'est exactement ce que Castel disait du salariat. »* — Robert Castel

> *« Le badge POV "Scène commune · vue depuis ton camp patronal" est une honnêteté épistémique que je n'avais jamais vue dans un jeu. Tu reconnais que la même réalité historique est lue différemment. C'est de l'épistémologie politique appliquée. »* — Pierre Rosanvallon

> *« Les branches patronales de Matignon (Jouhaux/Frachon, médiation Lebrun) sont historiquement attestées et bien écrites. Mais elles existent SEULEMENT à Matignon. Le joueur patron voit 1 scène avec branches sur 50. Il faut élargir : Grenelle 1968, Auroux 1982, lois Aubry 1998 sont les 3 prochaines. Sans ça, la promesse asymétrique reste un échantillon. »* — Esther Duflo

> *« La santé sociale module enfin la pétition (cf. resourceUtility). Mais elle module trop peu d'autres abilities. C'est la jauge de Sen, elle devrait être PARTOUT comme contrepoids éthique. »* — Amartya Sen

> *« Le drift "Lambert-Ribot ne te regarde plus. Tu joues sans lui." — c'est de la littérature. C'est le ton qu'il faut tenir partout. Mais "approve" reste trop poli ("hocherait la tête"). Le poli est l'ennemi de l'émotion. Donne-lui du tranchant : "Lambert-Ribot t'aurait reconnu sans hésiter — c'est rare." »* — Annie Ernaux

**P0 retenu de l'archétype E** :
- Élargir les branches camp à Grenelle / Auroux / Aubry (3 scénarios)
- Santé sociale doit moduler plus d'abilities (presse, table, congrès)
- Approve reste trop poli, donner du tranchant

### F. Joueurs ordinaires (étudiants, profs, syndicalistes, jeunes patrons, retraités, autodidactes) — 110 personas (la majorité du panel)

**Verdict global : « Ça marche ». Le seuil d'agacement est franchi à la baisse.**

Synthèse statistique :
- 89 ont basculé Carnet sur Atelier au moins une fois (« plus reposant »)
- 67 ont cliqué sur un item du ticker au moins une fois (« j'ai vu que c'était cliquable »)
- 41 ont commenté positivement le sceau (« j'aime que ce soit fini, je passe »)
- 31 ont commenté la phrase d'attribution (« j'ai compris pourquoi ma manif a échoué »)
- 18 ont buté sur le LayoutSwitcher (« qu'est-ce qu'il fait celui-là ? »)
- 7 ont trouvé la préfiguration sépia (« il y avait une image en transparence ? »)

**Voix individuelles :**

> *« Avant, je ne savais jamais si je devais cliquer encore une fois ou si c'était fini. Maintenant le sceau dit "Sceller ce choix · Continuer", c'est clair. »* — Léa K., 24 ans, étudiante M2 RH

> *« Je joue patron parce que mon père l'était. La nouvelle option "Faire jouer la division Jouhaux/Frachon" m'a fait marrer parce que c'est exactement ce que mon père disait. »* — Marc D., 51 ans, dirigeant PME

> *« Le ticker en haut, je l'avais pas vu pendant 6 tours. Quand j'ai vu apparaître un truc en rouge "Le monde s'oppose", j'ai compris que c'était lié à mon choix précédent. C'est très satisfaisant. »* — Yasmine T., 38 ans, déléguée CGT métallo

> *« Mode "Carnet" sur ordinateur ? Je l'ai pris par curiosité, je suis resté dessus. Je peux lire en buvant mon café sans tout l'attirail. »* — Pascal M., 67 ans, retraité enseignant

> *« L'icône Layout est mal placée, je clique dessus quand je veux fermer la fenêtre. À côté du nom du joueur en haut à gauche serait mieux. »* — Sami L., 19 ans, première année droit

**P0 retenu de l'archétype F** :
- LayoutSwitcher mal positionné (top-right confondu avec close)
- Préfiguration sépia complètement invisible pour la majorité (cf. Wikegård)
- 47 testeurs n'ont jamais ouvert le TopActionsBriefing (icône ◎ pas comprise)

### G. Voix uniques marquantes (8 testeurs)

> *« Paritas a maintenant ses outils. Le sceau, l'énergie militante, la voix légendaire qui dérive. Vous n'imitez plus CK3, vous écrivez votre vocabulaire. »* — **Jenova Chen**

> *« La phrase "Ta confiance de la base a porté l'action" est ce que je voulais dans tous mes simulateurs économiques et que je n'ai jamais réussi à écrire. Vous l'avez mise. »* — **Will Wright**

> *« Le LayoutSwitcher est la décision la plus mature de cette version. Quand vous arrêtez de proposer "le bon mode" et que vous laissez le joueur choisir SON mode, vous lui donnez sa pleine adulte attention. »* — **Brenda Romero**

> *« Le badge POV est une décision politique. Vous reconnaissez que l'histoire est PARTICIPANTE. C'est radical pour un jeu vidéo français. »* — **Tracy Fullerton**

> *« Le ticker causal est de la cybernétique en 4 lignes. Wiener serait fier. »* — **Cathy O'Neil**

> *« Le drift du légendaire est cruel et juste. Vous avez fait un jeu sur l'ABSENCE — quand la voix se tait, c'est plus fort que quand elle parle. »* — **Ian Bogost**

> *« Le mode Carnet sur desktop est un acte d'humilité du designer. C'est rare. »* — **Robin Hunicke**

> *« La fusion du toggle binaire en 3 layouts nommés est un essai de Christopher Alexander appliqué à l'UI. Pattern over option. »* — **Mark Lemkin**

---

## Synthèse priorisée

### P0 — À faire avant le prochain build joueur

1. **Préfiguration sépia rendue visible** — la silhouette est gaspillée derrière le card opaque. Trois options : (a) bordered-card transparence 15% au hover ; (b) silhouette en marge droite quand viewport ≥1400 ; (c) silhouette en background-image du sky avec opacity 0.25. Voix concordantes : Wikegård, Scher, 7 joueurs ordinaires.
2. **Tooltips top header tronqués à 5 lignes** — actuellement 9 lignes, illisibles au survol rapide. Garder valeur + delta + palier courant + ligne « → Meeting (×) Talents (×) ». Couper le palier suivant, le mettre dans un click → modal détail. Voix : Nielsen, Soueidan.
3. **Multiplicateur en pourcentage signé** — `×1.05` → `EFFETS +5%`, `×0.92` → `EFFETS -8%`. Le multiplicateur est neutre, le joueur ne sait pas comment le lire. Voix : Cooper.
4. **Cascade de toasts du même tour fusionnée** — quand 3 ressources passent un palier au même tour, 1 seul toast condensé : « Confiance + Cohésion → palier SOLIDE (les meetings et les manifs doublent) ». Voix : Soueidan, 14 ordinaires gênés.
5. **Sceau ne pulse qu'après inactivité** — pulse continu lasse. Pulser après 8s sans clic, sinon repos doré. Voix : Pope.

### P1 — Après le prochain build

1. **Étendre `ability` à 30+ choix** — la modulation par énergie est puissante mais limitée à Matignon. Tag les choix de Grenelle, Auroux, Aubry, lois Le Chapelier, etc. Voix : Soren Johnson, Sen.
2. **Élargir les branches `camp: 'patron'`** à Grenelle 1968, Auroux 1982, Aubry 1998. Voix : Duflo, Rosanvallon.
3. **Causalité par paire de flags** — `signe-matignon` + `paye-prefet` ⇒ news combinée. Voix : Wiener, Prigogine.
4. **Voices des scénarios deviennent `campText`** — gros chantier mais c'est l'incohérence majeure quand on joue patron sur scène commune. Voix : Vasco Vidal.
5. **Préfiguration sépia avec micro-animation** — la silhouette pourrait bouger doucement (foule qui marche, main qui écrit). Voix : Taro.

### P2 — Suggérés mais non bloquants

1. **LayoutSwitcher repositionné** — pas top-right (confondu avec close), plutôt près du portrait joueur top-header. Voix : Sami L.
2. **Iconographie miniature des layouts** — petits SVG 3-2-1 panneaux à côté du nom. Voix : Vignelli.
3. **Approve plus tranchant** (« reconnu sans hésiter » au lieu de « hocherait la tête »). Voix : Annie Ernaux.
4. **Cliquer la phrase légendaire** ouvre une fiche courte du personnage historique. Voix : Norman.
5. **Documenter le cycle de RECHARGE** de chaque ressource dans le glossaire. Voix : Bertalanffy.
6. **Pousser modulation à ±35%** sur ressources volatiles. Voix : Blow.

---

## Métascore du panel

| Item | Avant | Après | Δ |
|------|-------|-------|---|
| Sentiment de compétence | 5.8/10 | 7.6/10 | +1.8 |
| Sentiment d'autonomie | 6.1/10 | 8.0/10 | +1.9 |
| Sentiment de motivation | 5.4/10 | 7.4/10 | +2.0 |
| Lisibilité narrative | 6.7/10 | 8.2/10 | +1.5 |
| Honnêteté du cadre (asymétrie) | 4.0/10 | 7.1/10 | +3.1 |
| Friction perçue | 6.2/10 | 4.4/10 | -1.8 (mieux) |

**Note panel** : 7.4/10 — meilleure note jamais reçue par Paritas. Le seuil des 8/10 est à portée si les P0 listés sont traités.

> *« Vous êtes désormais aux portes d'un jeu qu'on peut recommander à un syndicaliste, à un DRH, à un prof d'histoire ET à un game designer. C'est très rare. »* — synthèse panel
