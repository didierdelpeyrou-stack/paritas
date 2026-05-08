# FG-3 — Histoire & paritarisme · « Ce qu'on apprend en jouant »

**Date simulée** : J+9 · **Durée** : 60 min · **Animation** : Argus
**Composition** : Friot (#15), Beaud (#16), Jobert (#17), Béroud (#18), Sami plateforme (#22), Bruno CPME (#30)

---

## Question d'ouverture

> *« Qu'est-ce qu'on apprend en jouant à PARITAS qu'on n'apprend pas en lisant Le Crom ou Hatzfeld ? »*

---

## Tour de table

**Friot** : « On apprend que **le salaire socialisé est un capital**. Pas une cotisation. Mais le jeu ne le dit pas avec force. Il le dit en glossaire. Pas en mécanique. La ressource Institution monte de 5 à 28 sans qu'aucun acteur ne dise 'qui paye, qui décide'. »

**Beaud** : « On apprend que **les conflits ont un goût**. Florange 2012 dans le jeu, c'est texte + jauges. Mais Antoine Lebrun n'a pas de voix. Tous les dialogues sont militants ou syndicaux. **Aucune voix ouvrière non-syndiquée**. C'est le grand absent de la sociohistoire ouvrière 2010-2020. »

**Jobert** : « On apprend que **le paritarisme français est singulier** — le glossaire le dit. Mais on ne sait pas par rapport à quoi. Pas de cogestion allemande, pas de syndicat unique italien, pas de centralisation suédoise. Un public international ne perçoit pas la singularité. »

**Béroud** : « On apprend qu'**il y a des marges militantes**. Pelletier 1908 est jouable, c'est rare et c'est juste. Mais SUD-Solidaires (post-1995), CLAP-Coursiers (post-2010), Annick Coupé : absents. Le syndicalisme du jeu reste 5 confédérations. Les marges sont décoratives. »

**Sami** : « On apprend rien sur l'**ubérisation**. 2017 ordonnances Macron : c'est l'année de Deliveroo. Le jeu n'en parle pas. **Mon monde n'existe pas dans le jeu.** Le glossaire dit 'salarié' — qu'est-ce qu'un coursier auto-entrepreneur de plateforme ? »

**Bruno** : « On apprend que **la NAO existe**. Asselin (CPME) est jouable, bonne surprise. Mais le format NAO est calibré pour grands groupes : 60 pts, 4 thèmes complexes. Chez moi (28 salariés BTP), une NAO se signe en 2 séances avec un délégué unique. **Le tissu PME (95% du tissu économique français) est invisible.** »

---

## Désaccords identifiés

### Désaccord 1 — Friot (politique du capital salarial) vs Bruno (logique gestionnaire)

| Friot | Bruno |
|-------|-------|
| « Institution = capital salarial conquis » | « La gestion d'une PME = équilibre tension/budget » |
| Cible : conscience politique du joueur | Cible : crédibilité économique pour le patron |
| Le mot 'capital' est positif | Le mot 'lobbying' est négatif |

**Verdict du groupe** : **les deux niveaux coexistent mais ne se rencontrent pas**. Le mode Réfléchi pourrait porter Friot. Le mode Compulsif pourrait porter Bruno. **Action** : `narrative/dialogueEngine.ts` ajouter une dichotomie de **registres** (politique conquérant / gestionnaire pragmatique) selon le trait dominant du joueur.

### Désaccord 2 — Beaud (voix ouvrière concrète) vs Béroud (figures militantes périphériques)

| Beaud | Béroud |
|-------|--------|
| « Une ouvrière de Florange 2012 » | « Annick Coupé SUD-Solidaires » |
| Cible : ethnographie | Cible : figures militantes |

**Verdict du groupe** : **les deux sont des absences distinctes**. Beaud cherche le terrain, Béroud cherche les marges militantes. **Action** : `content/legendaires/` ajouter (a) 1 figure ouvrière non-syndiquée 2010-2020 (Beaud), (b) 1 figure SUD-Solidaires 1995-2010 (Béroud). 2 ajouts.

### Désaccord 3 — Sami (plateforme) vs Bruno (PME)

- Sami : « plateforme côté salarié sans cadre légal »
- Bruno : « PME côté patron avec NAO réelle »

**Verdict du groupe** : **les deux sont des trous structurants** dans le tissu économique français. **Action** : 2 scénarios à ajouter en post-2010 — (a) « Coursier en colère 2018-2020 », (b) « Patron de PME face à la NAO mensuelle 2024 ». Pas redondants.

---

## Accords du groupe (≥ 4 voix sur 6)

1. ✅ **Distinction salaire / salaire socialisé en mécanique** — `nao/engine.ts` (4 voix : Friot, Beaud, Jobert, Bruno)
2. ✅ **Voix non-syndicale 2010-2020** — `content/scenarios/2010-2020/` (5 voix : Beaud, Béroud, Sami, Aïcha (#23 absente mais documentée), Friot)
3. ✅ **Comparaison européenne explicite (au moins Mitbestimmung)** — `content/scenarios/1992-maastricht.ts` (4 voix : Jobert, Friot, Béroud, Bruno)
4. ✅ **Préset NAO TPE/PME** — `nao/engine.ts` (4 voix : Bruno, Sami, Friot, Beaud sur l'argument « les ouvriers de PME ne signent pas comme à Renault »)
5. ✅ **Annick Coupé + 1 coursier en légendaires** — `content/legendaires/` (4 voix : Béroud, Sami, Beaud, Friot)

---

## Top 3 P1 du groupe

| # | Fix | Fichier | Voix |
|---|-----|---------|----:|
| **P1-1** | 2 légendaires post-2000 (Annick Coupé + 1 coursier) | `src/game/content/legendaires/` | 4/6 |
| **P1-2** | 2 scénarios post-2010 (plateforme + PME NAO) | `src/game/content/scenarios/` | 4/6 |
| **P1-3** | Side event « cogestion allemande » au scénario Maastricht | `src/game/content/scenarios/1992-maastricht.ts` | 4/6 |

---

## Question fermée Argus

> *« Si vous deviez confier le jeu à un·e étudiant·e en M1 sciences sociales, sans préparation, lui donneriez-vous 1 livre à lire D'ABORD ou seriez-vous OK avec une découverte par le jeu ? »*

- Friot : *« Lire Hatzfeld d'abord — sinon le jeu donne une fausse impression de complétude. »*
- Beaud : *« Découvrir par le jeu — c'est le but pédagogique. »*
- Jobert : *« Mon Manuel + le jeu en parallèle. »*
- Béroud : *« Découverte par le jeu — j'ajoute Annick Coupé après. »*
- Sami : *« Pas un livre — un podcast Coursiers en colère. »*
- Bruno : *« Le rapport CPME 2024. »*

**Pas de consensus**. **Argus retient** : le jeu doit pouvoir **être joué seul** (Beaud, Béroud), mais avec **3 ressources d'extension** dans le journal IA (cf. McGonigal FG-2).

---

## Coda

> *« 6 voix d'un même camp ne disent pas la même chose. C'est rassurant. Un jeu qui prétend dire la vérité du paritarisme français trahit sa promesse. PARITAS doit dire des vérités multiples — et nommer ses absences. Une PME, un coursier, une cogestion allemande, une figure ouvrière non-syndiquée. Quatre ajouts. C'est tenable. »*
>
> — Argus, FG-3
