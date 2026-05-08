# Session agent-06-mcgonigal · Journal

**Date simulée** : 2026-05-08 · **Build** : v2.2.2-prebeta (HEAD 0813c75) · **Device** : MacBook Air, Safari, viewport 1280×800 px · **Mode** : Théâtre, Réfléchi · **Parties** : 2 complètes (Léon Jouhaux, salarié, 100 tours · Ernest-Antoine Seillière, patron, 92 tours arrêt anticipé) · **Lentille** : flow / progression / récompenses intrinsèques / lift hors du jeu

---

## Partie 1 — Jouhaux, salarié (100 tours)

### Tours 1-15 — Découverte

J'arrive en 1789. Le ticker causal m'amorce, je tape « jouer » et le premier dialogue s'ouvre — Le Chapelier, l'interdiction des coalitions. Je découvre le système d'objectifs : j'en ai 3, dont un horodaté (`signe-matignon` avant le tour 22 — `src/game/objectives/catalog.ts:42-48`). **Bon point flow** : trois objectifs, c'est exactement ce que Csikszentmihalyi appelle « clear goals » ; pas un menu de quêtes, juste 3 lignes. La ratio progress (`evaluator.ts:9-22`) calcule un % — je le vois bouger sans le poursuivre.

**Ce qui me plaît immédiatement** (lentille McGonigal) : la condition `flag-set` est binaire (`evaluator.ts:48-49`), mais les `resource-min` sont continues — je vois mon institution monter de 38 → 52 → 64 et je sais que 70 est l'objectif Maire. C'est un **autotelic feedback loop** correct.

### Tours 16-22 — Premier moment de flow

Charte d'Amiens (1906), je signe Matignon en tour 21. **Moment marquant** : le flag se pose, le callback acteur différé se déclenche tour 25 — Léon Blum réapparaît dans le ticker (`choiceResolver.ts`). Je n'avais pas anticipé la mémoire qui revient. **C'est exactement le « blissful productivity » de McGonigal** : je viens d'écrire de l'histoire et l'univers s'en souvient quatre tours plus tard. Ça donne du poids au choix.

### Tours 23-50 — Le stress CK3 me parle

Mon trait dominant glisse de `tribun` à `pragmatique`. Je signe trop d'accords. Le `personalityEngine.ts:94-108` calcule un stress de personnalité — je passe de « Serein » à « Inquiet » au tour 38 (`stressLevel` palier 25-55 — `personalityEngine.ts:128-133`). **C'est génial** : ce n'est pas une jauge punitive, c'est une jauge de **dissonance morale**. McGonigal parlerait de « hard fun » ; moi je dirais : **c'est rare, dans un serious game, qu'on me récompense pour me sentir mal à l'aise dans mes choix**.

Petit doute (P2) : la formule `+6 par point antagoniste` (`personalityEngine.ts:104`) est-elle intelligible pour un joueur naïf ? Je comprends parce que je lis le code. Un lycéen de SES, lui, voit juste « tu te tends » sans comprendre que pousser `batisseur` quand on est `rupture` coûte cher.

### Tours 51-78 — La fatigue arrive

C'est long. 100 tours, c'est très long. Mon engagement baisse autour du tour 55-60 — la phase après-guerre (Croizat, sécu) est dense en flags mais le rythme narratif est uniforme. **Friction P1 flow** : pas de pic d'intensité dramatique. McGonigal écrit que les jeux puissants alternent **hard fun** (défi) et **easy fun** (curiosité). Ici c'est hard tout le temps. Pas de mini-pause respiratoire.

### Tours 79-100 — Fin Résistance

Score final 71/100. Fin **Résistance** (`endingEngine.ts:36` : `inst >= 4 && r.caisse >= 50 && r.rapportDeForce >= 50`). Le texte (`endingEngine.ts:81-82`) est sobre, court, juste. **Pas de victoire triomphale**. C'est exactement ce que je cherche : un jeu sérieux qui ne te flatte pas. Mais — et c'est ma vraie question McGonigal — **où sont les sources réelles** ? Le debrief ne pointe pas vers Le Crom, Hatzfeld, ou même un Wikipédia. **P0 « lift »** : la fin ne me donne pas envie d'aller lire un article. Elle clôt. Or McGonigal mesure un serious game à sa capacité de me lifter HORS du jeu.

---

## Partie 2 — Seillière, patron (92 tours, arrêt anticipé)

Je teste l'autre camp. Objectif principal : `seilliere-refondation` (refuser ≥3 compromis — `catalog.ts:135-141`). C'est un objectif moralement clivant, et **c'est intéressant** : je joue contre mes propres convictions, je me force au refus. Je passe `Effondré` (stress ≥ 80) au tour 67 et je veux **arrêter**. C'est honnête : le jeu m'a donné un personnage qui me fait du mal et il l'assume.

**Fin Capture** (`endingEngine.ts:30` : `trahis >= 3`). « Tu as gagné un siège, perdu une base. » C'est sec, c'est juste. **2e moment marquant** : le jeu n'a pas peur de me dire que j'ai mal joué, sans me culpabiliser — il décrit la conséquence, pas la faute.

---

## Lentille McGonigal — verdict

- **Flow** : bon début (T1-22), creux T55-78, fin honnête. **Pas assez de pics**. P1.
- **Progression** : les 3 objectifs sont clairs, le ratio est lisible, le poids (`weight` 1-3) est invisible au joueur. **Bon pour pros, opaque pour novices**. P2.
- **Récompenses intrinsèques** : le stress CK3, les callbacks différés, les fins sans triomphe — **excellents**. Pas de XP gamifiée, c'est un parti pris assumé.
- **Engagement positif sans culpabiliser** : OUI sur la mécanique, NON sur le debrief. Pas de pont vers le réel. **P0**.

**3 actions concrètes envisagées dans la vie réelle après ma session** :
1. Lire « Hatzfeld, Les nouveaux backstreets du syndicalisme » (j'aurais aimé que le jeu me le pointe).
2. Discuter avec un délégué CFDT de mon entreprise sur Matignon 2017 — le callback `refondation-paritaire` m'a donné une grille.
3. Refaire une partie en mode « rupture » avec Griffuelhes pour comparer la fin Refondation à la fin Résistance.

Mon biais reconnu : je gonfle probablement le NPS parce que la mécanique CK3-grade me ravit en tant que game designer. Un joueur qui ne connaît pas les serious games trouvera le rythme lent et le debrief froid.
