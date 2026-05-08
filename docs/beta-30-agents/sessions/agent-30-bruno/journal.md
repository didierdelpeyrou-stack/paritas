# Session bêta — agent-30-bruno (Bruno P., 54 ans, dirigeant PME BTP, délégué CPME 44)

**Build** : v2.2.2-prebeta (HEAD 0813c75)
**Date** : 2026-05-08
**Durée simulée** : 2 parties (1 traversée CGT 1936→1995, 1 patron 1968→2017)
**Mission** : tester si le jeu prend au sérieux les TPE/PME, et — par lentille croisée demandée — si la mémoire militante CGT (callbacks "base") sonne juste pour quelqu'un qui a vu démissionner trois permanents.

> Note de cadrage. Le briefing reçu me décrit comme « ancien permanent CGT métallurgie Belfort 32 ans ».
> Mon profil canonique (`agent-30-bruno.md:1-30`) dit : dirigeant PME 28 salariés, délégué CPME, BTP Loire-Atlantique.
> J'ai joué les deux lentilles. Je signale la dissonance — elle change ce qu'un Bruno entend dans « Frachon t'écrit ».

---

## Partie 1 — Côté CGT, traversée 1936 → 1995 (lentille militant)

**T31 — Matignon, 7 juin 1936.** Je signe les six points (`1936-matignon.ts:81`, flag `signe-matignon`). Cinq tours plus tard, T36, le callback tombe : *« Frachon t'écrit, deux lignes : "Le 7 juin restera. Tu as bien fait." Tu plies la lettre soigneusement. »* (`choiceResolver.ts:111`).

J'ai relu trois fois. Le geste — *plier la lettre soigneusement* — c'est juste. C'est ce que faisait mon père avec les courriers de la fédé. Mais le ton est trop apaisé. Frachon, en juin 36, n'écrivait pas comme ça à un confédéré qui venait de signer avec Jouhaux. Il aurait écrit froid, ou il n'aurait pas écrit. La phrase actuelle ressemble plus à une réconciliation 1968 qu'à une note 1936. **Authentique en geste, faux en voix.**

**T31 (variante) — division CGT/CGTU.** J'ai rejoué en jouant la division (`1936-matignon.ts:245`, flag `jouer-cgt-cgtu`). Cinq tours plus tard : *« Une lettre de la base te parvient. Trois lignes. Elle sait que tu as joué la division. Elle ne te le redira pas. »* (`choiceResolver.ts:95`). **Là, oui.** Le « elle ne te le redira pas » fait mal comme il faut. C'est exactement le silence des AG après une trahison perçue.

**T62 — Grenelle 1968.** Je signe (`premium.ts:455`, flag `signe-grenelle`). T66 : *« Aux portes de Renault-Billancourt, on lit les accords à voix haute. La base te répond : "35% du SMIG, c'est bien. Mais ce n'est pas la révolution." »* (`choiceResolver.ts:123`). Bonne facture. Le « lu à voix haute » a une matérialité — c'est comme ça que ça se passait.

**T79 — épuisement.** J'ai déclenché `epuise-mouvement` (retraites 2023, `premium.ts:650`). T82 : *« Les permanences se vident. Trois militants démissionnent sans bruit. Personne ne te le dit, mais tu sens le silence aux assemblées. »* (`choiceResolver.ts:155`). **C'est la phrase la plus juste du jeu.** « Personne ne te le dit » — j'ai vu ça en 2023 dans ma propre boîte côté CFDT BTP. Le silence aux AG est plus dur que les démissions cassantes.

---

## Partie 2 — Côté patron, 1968 → ordonnances 2017 (lentille CPME)

**T31 patron — Grenelle CGPF.** Le scénario `cgpf-1936` existe (`patron.ts:92`), bien représenté. Mais ce n'est pas mon monde. Une PME BTP de 28 salariés en 1968 ne s'asseyait pas à Grenelle — elle subissait Grenelle. **Manque scénario** : la PME face aux délégués 1968 dans l'atelier.

**T71 — CPME ordonnances CSE 2017.** Là, le jeu me parle (`cpme.ts:11-97`). Asselin nommé (`cpme.ts:22, 27`). Le seuil 50 salariés cité (`cpme.ts:21`). La phrase d'Asselin (« quatre jours de réunion par an, deux formations obligatoires », `cpme.ts:36`) — j'ai entendu cette phrase en réunion fédé. **Le scénario CPME-CSE 2017 est le seul du jeu où je me reconnais comme dirigeant 28 salariés.** J'ai choisi `cpme-contre-projet` (`cpme.ts:79`, flag `refondation-paritaire`). T75 : *« Une circulaire DGT cite ton accord en exemple. »* (`choiceResolver.ts:147`). Crédible — c'est exactement ce qui se passe quand la CPME pose un livre blanc qui prend.

**T82 — U2P / OPCO EP 2024** (`cpme.ts:99-185`). Catherine Foucher nommée (`cpme.ts:125`). Le boulanger qui dit « apprenti en visio sur Excel alors qu'il ne sait pas tourner une pâte » — c'est de la voix vraie. **Excellent**.

**Manque criant** : entre `cpme.ts:11` (CSE 2017) et `cpme.ts:99` (U2P 2024), rien. Pas de PME face aux NAO obligatoires (`auroux-nao`, `premium.ts:516` n'est ni filtré PME ni nommé Asselin/Picon). Pas de scénario TPE face à la rupture conventionnelle 2008. Pas de PME face au CICE 2013. **2 scénarios PME en 100 tours, c'est l'épaisseur d'un alibi**.

---

## Synthèse Bruno

**Ce qui tient** : 13 callbacks branchés, 3 voix distinctes sur 4 acteurs (`choiceResolver.ts:83-193`). `epuise-mouvement` est la phrase la plus juste du jeu. Le scénario CPME-CSE 2017 est solide et nommé.

**Ce qui manque** : la PME au quotidien (NAO de 11 salariés, élections CSE à 25, première convention de branche signée seul face à un permanent FO). 2 scénarios CPME sur 100, c'est faux. Et le callback Frachon T36 a un ton 68 sur un événement 36 — détail mais c'est la dissonance qui trahit le manque de relecture par un permanent vivant.
