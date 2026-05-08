# Session agent-16-beaud · Journal

**Date simulée** : 2026-05-08 · **Build** : v2.2.2-prebeta (HEAD 0813c75) · **Mode** : Réfléchi · **Camps joués** : Salarié (Run A — épuisement de la base) puis Patron (Run B — refondation Seillière) · **Tours simulés** : 30 + 25 · **Lentille** : voix ouvrière contemporaine, Florange/Goodyear/Whirlpool

> *Je viens chercher une voix vraie — pas un militant qui récite, un ouvrier qui peste. Je vais regarder où la base parle, et où elle se tait.*

---

## Run A — Salarié, accumulation de mouvements (T1 → T30)

### T1-3 — La base, c'est quatre champs

Avant même de cliquer, je lis `src/game/simulation/actors.ts:8-15`. La base, c'est : `trust=60, pressure=30, patience=70, stance='cooperatif'`. Quatre nombres. Mêmes champs pour adversaire, État, opinion. **Friction P0** : la base et le patronat sont pesés à la même balance. Or l'ouvrier de Florange et Bernard Arnault ne se mesurent pas avec les mêmes jauges. La base, je la voudrais avec un champ « usure » distinct de patience, un champ « rumeur d'atelier » distinct de pressure. `actors.ts:8-15` : c'est là qu'il faudrait spécialiser. Pas urgent côté code, urgent côté incarnation.

### T4-9 — Premier dialogue, je tape « refuse-compromis »

Je joue Croizat 1945, je refuse un compromis sur les caisses. Quatre tours plus tard (T+4), je reçois le callback de `choiceResolver.ts:85-89` : *« L'adversaire n'a pas oublié ton refus. Le mot court chez les patrons : Le syndicat ne signe rien. On peut continuer. »* La phrase est juste. Elle a la note d'une note interne patronale. **Moment marquant**. Mais c'est **l'adversaire** qui parle, pas la base. La base, elle, à ce moment-là, ne dit rien. Je voulais entendre l'ouvrier de Saint-Étienne qui apprend que son SG a refusé. Je n'entends que le patron qui ricane.

### T10-15 — J'enchaîne trois mouvements (`epuise-mouvement` ×3)

Je joue les mouvements à la chaîne. Trois choix avec flag `epuise-mouvement` (cf. patron.ts:156, premium.ts:117, late-period.ts:155 — bizarrement le flag tombe aussi sur des choix patronaux, je note pour Run B). À chaque fois, fatigueGain += 25 (`choiceResolver.ts:198`). Je vois la fatigue de l'organisation monter. **Mais à T13, T17, T21, je reçois le même callback texte trois fois** :

> *« Les permanences se vident. Trois militants démissionnent sans bruit. Personne ne te le dit, mais tu sens le silence aux assemblées. »* (`choiceResolver.ts:155`)

**Friction P0** : le callback est statique. Trois militants démissionnent à T13. Trois autres à T17. Trois autres à T21. À la fin, neuf démissions, aucun nom, aucune section, aucun atelier. CK3-grade le promet — la mémoire qui « laisse une trace » — mais ici la trace est un copier-coller. **Les militants démissionnaires ne sont pas incarnés**. Pour Beaud, c'est le défaut majeur : le silence aux assemblées, on l'entend une fois, pas trois.

### T16 — La base répond... à un autre flag

Je signe Grenelle (1968). Callback à T20 (`choiceResolver.ts:121-125`) : *« Aux portes de Renault-Billancourt, on lit les accords à voix haute. La base te répond : 35% du SMIG, c'est bien. Mais ce n'est pas la révolution. »* **Là, oui**. Renault-Billancourt nommé. Le chiffre du SMIG dans la bouche de la base. La voix est juste. C'est le seul callback de la base qui sonne ouvrier. Les quatre autres callbacks `base` (`choiceResolver.ts:94, 110, 154, 173`) sont génériques : « une lettre te parvient », « Frachon t'écrit », « les permanences se vident », « trois CHSCT déposent ». Frachon écrit. Mais l'ouvrier de Sochaux n'écrit pas — il pousse une porte ou il ne la pousse plus.

### T22-30 — Florange, Goodyear, Whirlpool : où sont-ils ?

Je cherche dans le contenu post-2000. `grep -rn "Florange\|Goodyear\|Whirlpool\|ArcelorMittal\|Continental"` dans `src/game/content/scenarios/` : **zéro hit**. Le scénario `seilliere-rupture-unedic-2001` (persona.ts:91) est là. Les ordonnances 2017 sont là (flag `refondation-paritaire`). Mais les hauts fourneaux qu'on éteint, le baron qui ferme, l'amiante de Condé-sur-Noireau, l'usine de la Somme rachetée par Wessanen puis Whirlpool — rien. **Friction P0** : le contenu post-2000 est syndical-institutionnel (Seillière, Macron, CSE), pas ouvrier-territorial. Pour ma lentille, c'est le trou central.

---

## Run B — Patron, je teste `epuise-mouvement` côté patronal

Je joue Seillière 2001 (persona.ts:127), choix `seilliere-claquer`, flag `epuise-mouvement` (persona.ts:142). **Que vient faire ce flag sur un geste patronal ?** Le flag s'appelle « épuise mouvement » — pour un syndicat, c'est l'usure de la base. Pour un patron qui claque la porte de l'Unédic, c'est un autre concept. Le callback se déclenche à T+3 et me dit que les permanences syndicales se vident parce que j'ai claqué la porte de l'Unédic. **C'est mécaniquement mal câblé**. Le même flag ne peut pas vouloir dire « grève qui s'enlise » côté CGT et « MEDEF qui sort » côté patron. La base, ici, ne devrait pas se vider — c'est l'institution paritaire qui se vide.

Je relis `choiceResolver.ts:151-158` : la condition est `if (choice.flag === 'epuise-mouvement')`, pas filtrée par camp. **P1** : il faut soit deux flags distincts (`epuise-mouvement` côté salarié, `quitte-paritaire` côté patron), soit un branchement par camp dans le callback.

---

## Bilan — où la base a-t-elle du grain ?

| Callback `base` | Fichier:ligne | Voix juste ? |
|-----------------|---------------|:---:|
| signe-matignon (Frachon) | choiceResolver.ts:110 | Oui — Frachon nommé |
| signe-grenelle (Billancourt 35%) | choiceResolver.ts:122 | Oui — chiffre + lieu |
| jouer-cgt-cgtu (lettre 3 lignes) | choiceResolver.ts:94 | Tiède — anonyme |
| epuise-mouvement (3 démissions) | choiceResolver.ts:154 | Tiède — répétitif |
| cree-chsct (3 CHSCT) | choiceResolver.ts:173 | Plat — administratif |

**Score base** : 2/5 callbacks où la voix porte. Les trois autres sentent le rapport interne. Reconnaissance de mon biais : je cherche le pittoresque de l'usine — j'admets que `cree-chsct` parle juste aux délégués CHSCT, juste pas à l'OS de Sochaux.
