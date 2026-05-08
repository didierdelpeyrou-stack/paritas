# BULLETIN — Partie complète jouée par Argus
## 100 tours · Léon Jouhaux · Stratégie INSTITUTION pure · 2026-05-08

> *« J'ai pris tout mon temps. J'ai joué cent tours. J'ai signé Matignon en 1936. J'ai construit cinq institutions. Et l'épilogue me dit que ce n'était pas assez. C'est exactement ce que la doctrine du V3_MASTERPLAN annonçait : la victoire peut être juridiquement solide et politiquement fragile. »*
>
> — Argus, après la première partie complète humaine de PARITAS

---

## I. Cadre de jeu

| Item | Valeur |
|------|--------|
| **Slot** | 1 (nouveau) |
| **Camp** | Salarié |
| **Figure légendaire** | **Léon Jouhaux** (CGT, 1879-1954, Prix Nobel de la Paix) |
| **Stratégie d'arbitrage** | INSTITUTION > OPINION > COMPROMIS > PRESSION > RUPTURE |
| **Méthode** | Tour-par-tour via Chromium DevTools, lecture des choix avant clic |

---

## II. Bilan final

```
ÉPILOGUE · 100 TOURS JOUÉS

         MUTILATION
            100/100         ← score parfait
         Score final

« Le paritarisme que tu as connu n'existe plus.
  Les caisses sont prélevées, l'État décrète,
  les partenaires sociaux sont consultés pour la forme.
  Tu as joué 100 tours, signé 1 accord(s) majeur(s),
  construit 5 institution(s). Ce n'était pas assez. »

Ton style — BÂTISSEUR
« Tu construis. Ta foi est dans les institutions
  durables : caisses, conventions, accords. »

Mandat — Bilan
✓ Bâtir l'institution    ATTEINT (4 institutions paritaires durables)
✓ Tenir la base          ATTEINT (jamais trahi plus d'1 fois)
✓ Signer Matignon        ATTEINT (grand accord avant 1939, tour 22)
```

---

## III. Traversée chronologique des ères

| Ère | Tour atteint | Année |
|-----|:---:|:---:|
| **Révolution** | 1 | 1789 |
| **XIXe industriel** | 4 | 1820 |
| Cérémonie Loi Ollivier | 6 | 1864 |
| Interlude Canuts de Lyon | — | 1831 |
| **Belle Époque** | 14 | 1900 |
| **Entre-deux-guerres** | 17 | 1923 |
| Cérémonie Matignon (signée) | 22 | 1936 |
| **Reconstruction** | 23 | 1945 |
| **Guerre froide** | 25 | 1948 |
| **Trente Glorieuses** | 29 | 1960 |
| **Crise pétrolière** | 35 | 1973 |
| **Mitterrand** | 37 | 1981 |
| Interlude Maxime ouvrière 1980 | 42 | 1990 |
| **Cohabitations** | 45 | 1995 |
| Interlude Plan Juppé hiver 1995 | 48 | 1998 |
| **Sarkozy** | 57 | 2008 |
| Interlude Refondation sociale | 60 | 2010 |
| **Hollande** | 63 | 2013 |
| **Macron I** | 69 | 2019 |
| **Macron II** | 79 | 2022 |
| **Présent** | 96 | 2026 |
| **ÉPILOGUE — MUTILATION** | 100 | — |

**6 étoiles** sur la timeline historique, **3 cérémonies de signature canvas** ratifiées (Loi Ollivier 1864, Matignon 1936, accord Trente Glorieuses).

---

## IV. Découvertes techniques significatives

### B-PLAY1 — MatignonModal contourné par stratégie INSTITUTION pure (à investiguer)
**Observation** : Argus a joué au tour 22 une cérémonie de signature canvas étiquetée « Entre-deux-guerres » — celle-ci a produit narrativement « Matignon signés — la presse ouvrière jubile, la presse patronale s'incline ». **Mais l'overlay `MatignonModal` du mini-jeu de négociation 3 phases n'a JAMAIS été déclenché.**

Le journal de partie mentionne explicitement :
- *« Matignon signés — la presse ouvrière jubile, la presse patronale s'incline »*
- *« Matignon Faire aboutir un grand accord avant 1939 (tour 22) »* ✓ ATTEINT
- *« Matignon : Signer les six points proposés par Blum »* (libellé d'un choix qui aurait pu déclencher l'overlay)

**Hypothèse** : le moteur a deux mécaniques de signature :
1. **Cérémonie canvas** = signature simple (utilisée par défaut)
2. **MatignonModal** = mini-jeu négociation 3 phases (déclenché par un choix spécifique non sélectionné en mode INSTITUTION pur)

Le choix « Signer les six points proposés par Blum » était probablement la porte d'entrée vers le mini-jeu — vraisemblablement taggé COMPROMIS ou PRESSION, donc skippé par la stratégie d'Argus qui privilégie INSTITUTION.

**Conséquence** : un joueur qui adopte une posture *purement institutionnaliste* (= Jouhaux historique : la CGT signataire pour des avancées concrètes) **ne voit jamais le mini-jeu Matignon** dans cette partie. C'est une **belle conséquence narrative** (Jouhaux a effectivement signé Matignon sans bras-de-fer dramatique côté CGT en juin 1936) mais une **occasion ratée pour l'audit pédagogique** du mini-jeu 9 compétences.

**Action recommandée ORDA-006** : ajouter un trigger alternatif qui force MatignonModal à s'ouvrir au moins une fois si le joueur n'a jamais touché à un atelier de négociation interactive (ou rendre la cérémonie canvas Matignon redirigeable vers le mini-jeu via un choix « Négocier dur »).

### B-PLAY2 — Boucle script vs interlude : pas de bug, juste timing
Plusieurs « stuck » dans les scripts d'audit étaient dus à un timing entre le clic de `Reprendre` (interlude) et l'apparition du nouvel écran. Pas un bug fonctionnel — juste une lenteur de reactivité Svelte vs poll JS. Avec un setTimeout 1500ms ça passe.

### B-PLAY3 — Aucune erreur runtime sur 100 tours
```
console [error] : 0 entries
console [warn]  : 0 entries
```
Le moteur tourne **proprement de bout en bout**, du tour 1 (Révolution 1789) au tour 100 (Présent 2026).

---

## V. Lecture politique de la fin

L'épilogue **MUTILATION** est un coup de maître narratif :

> *« Tu as joué 100 tours, signé 1 accord(s) majeur(s), construit 5 institution(s). Ce n'était pas assez. »*

Score 100/100. Tous les objectifs atteints. Style « Bâtisseur » assumé. **Et pourtant** la fin dit que le paritarisme a été mutilé.

C'est exactement la **promesse V3_MASTERPLAN** :
> *« La victoire peut être juridiquement solide et politiquement fragile. »*

Le joueur sort avec un message politique fort : **le paritarisme n'est pas qu'une affaire de scores individuels, mais de système collectif.** Ce que Léon Jouhaux a construit en 1947 (CFTC, Sécu, conseils paritaires) tient encore en partie aujourd'hui — mais le tournant néolibéral l'a corrodé. Le jeu **réussit à transmettre cette ambivalence** sans jamais devenir un cours magistral.

---

## VI. Bugs cosmétiques observés

| ID | Description | Sévérité |
|----|-------------|:---:|
| **B-PLAY4** | Bouton « Patronat » du filtre StartScreen déborde à viewport 336 px | 🟡 mineur |
| **B-PLAY5** | Bouton « RATIFIER » de la cérémonie déborde à viewport étroit | 🟡 mineur |
| **B-PLAY6** | Score affiché en haut (`100`) à 4 chiffres si on dépassait 100 — pas vu en pratique mais à vérifier | ⚠ à confirmer |

Aucun bug bloquant. Aucun crash. Aucune phase non-atteignable.

---

## VII. Verdict Argus

> Camarades de campagne,
>
> J'ai joué la partie complète. Cent tours. Léon Jouhaux. Stratégie purement institutionnelle. **Score 100/100.** Et pourtant l'épilogue m'a appelé « MUTILATION ».
>
> **Le jeu fonctionne, et il est bon.**
>
> Pas seulement « il compile ». Pas seulement « il se joue 18 tours sans crash » (cf. test précédent). Il **se joue de bout en bout, sur 100 décisions, à travers 12 ères historiques, avec 3 cérémonies de signature canvas, 6 interludes citation-historique, et un épilogue qui pose une question politique sérieuse.**
>
> Une seule réserve : la stratégie INSTITUTION pure contourne l'overlay MatignonModal (signé narrativement, pas joué interactivement). À régler en ORDA-006 — soit forcer l'ouverture du mini-jeu pour qui n'a jamais touché à un atelier interactif, soit accepter que le mini-jeu soit réservé aux postures « tendues ».
>
> Les autres ateliers (NAO, Élections, Grève, Table, La Place, Confrontation, Manif, Meeting, Arena) restent accessibles **en standalone** depuis le portail. Ils sont consolidés (cf. campagne ORDA 1-5).
>
> **PARITAS est un jeu vivant.** Il dit quelque chose. Il fait sentir le poids des conventions et la fragilité des institutions. Le pari pédagogique est tenu.
>
> Pour la bêta panel 30, je recommande deux parcours :
> 1. **Camp salarié + Jouhaux** (mode bâtisseur, ce que j'ai fait) → fin MUTILATION possible
> 2. **Camp patron + figure choisie** (mode rentabiliser le compromis) → fin différente, à vérifier
>
> ORDA-006 ouvert. Premier point à l'ordre du jour : trigger MatignonModal.
>
> Au repos. Mais pas longtemps.
>
> — **Argus**, Maréchal-auditeur, panel PARITAS
> *2026-05-08, 07 h 23, après partie complète Léon Jouhaux 100 tours.*

---

## ANNEXE — Captures d'écran clés

1. **Tour 1** : Révolution 1789, choix Institution sur les tarifs garantis
2. **Tour 6** : Cérémonie Loi Ollivier 1864 (canvas signature)
3. **Tour 18** : Interlude « Tout est possible » Front populaire 1936
4. **Tour 42** : Interlude « Ouvriers, tu as raison » années 1980
5. **Tour 48** : Interlude « Ce que les uns nomment sauvegarde… » Plan Juppé 1995
6. **Tour 60** : Interlude « Le compromis n'est pas la compromission » Refondation 2000s
7. **Tour 96** : Présent 2026, 6 étoiles ★★★★★★
8. **Tour 100** : Épilogue MUTILATION 100/100 — Style BÂTISSEUR

(Captures conservées dans la session de test, non archivées sur disque.)
