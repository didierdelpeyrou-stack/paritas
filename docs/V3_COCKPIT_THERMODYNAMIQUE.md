# V3 — Cockpit thermodynamique : 30 experts pour un système d'actions interdépendant

Document de design fondateur pour la refonte cockpit V3. Réponse à
deux convergences fortes :
- **Mini-jeux en silos** : Trésorerie, Manif, Meeting, Table fonctionnent
  isolément. Pas de flux entre eux. Le joueur ne sent pas de système.
- **UX statique** : les ressources sont des stocks, pas des flux.
  Pas de pression qui monte, pas de chaleur qui se dissipe.

V3 propose un modèle **thermodynamique** : les actions ne sont plus
des boutons isolés mais des **conversions énergétiques** entre
ressources, avec conservation, entropie, dissipation, équilibre.

---

## I. Convocation de 30 experts

Format : nom · domaine · UNE recommandation pour le cockpit V3
(actionnable, mesurable).

### Game designers (15)

1. **Sid Meier** (Firaxis, Civilization) — *« Une décision intéressante
   = un trade-off où chaque option ferme une porte. Visualise
   explicitement les portes fermées au survol d'une action. »*
2. **Will Wright** (SimCity, Spore) — *« Émergence : cesse d'écrire
   les conséquences. Laisse les sous-systèmes se parler. Une manif
   doit pouvoir épuiser la trésorerie sans que tu l'aies codé. »*
3. **Hideo Kojima** (Kojima Productions, MGS) — *« La narration vit
   dans les transitions, pas dans les écrans. Anime CHAQUE flux de
   ressource entre deux actions comme une mini-cinématique. »*
4. **Jonathan Blow** (Braid, The Witness) — *« Une mécanique pure ne
   nécessite pas de tutoriel. Si l'utilisateur doit lire la doc
   pour comprendre l'orchestrator, c'est cassé. Un seul concept :
   l'énergie circule. »*
5. **Raph Koster** (Theory of Fun) — *« L'apprentissage est le plaisir.
   Chaque tour doit révéler UNE nouvelle interaction entre deux
   actions. Construis 100 tours = 100 micro-leçons. »*
6. **Brenda Romero** (Train) — *« Les coûts moraux doivent peser sur
   les ressources, pas dans un texte de conséquence. Faire un
   lock-out = -10 Mémoire ÉTERNEL, jamais récupérable. »*
7. **Reiner Knizia** (board games) — *« Élégance : un seul score
   final calculé en post-partie, pas 7 jauges concurrentes.
   Toutes les actions convergent vers UNE métrique. »*
8. **Soren Johnson** (Civ4 lead, Mohawk Games) — *« L'équilibrage est
   itératif. Expose le `cost / effect ratio` de chaque action en
   métadonnée pour qu'on puisse l'ajuster en playtest sans fouiller. »*
9. **Jane McGonigal** (Reality is Broken) — *« Le serious game se
   ratifie quand le joueur peut réutiliser ses choix dans la vraie
   vie. Ajoute un `journal-export` de fin de partie sous forme de
   manifeste imprimable. »*
10. **Marc LeBlanc** (MDA framework) — *« Mechanics → Dynamics →
    Aesthetics. Ne dessine pas les boutons, dessine d'abord le
    sentiment cible (« je suis débordé », « je suis en contrôle »).
    Les boutons découlent. »*
11. **Ian Bogost** (Persuasive Games) — *« Procedural rhetoric : la
    règle EST l'argument politique. Si les actions Patron sont
    moins coûteuses, le jeu argumente que le capital est plus fluide
    que le travail. Choix politique conscient. »*
12. **Frédérick Raynal** (Alone in the Dark FR) — *« Le francophone
    passionnant : pas d'anglicismes, pas de "cooldown" → "temps de
    repos", pas de "score" → "bilan". Lexique de la chair. »*
13. **Jenova Chen** (thatgamecompany, Journey) — *« L'émotion
    contemplative naît du silence. Insère une PAUSE forcée de 3s
    après chaque action lourde, sans bouton, juste pour respirer. »*
14. **Cliff Bleszinski** (Epic, Gears of War) — *« Feedback loops :
    chaque clic doit produire 3 retours sensoriels minimum (visuel
    + sonore + haptique simulé via micro-shake CSS). »*
15. **Eric Zimmerman** (Rules of Play) — *« Magic circle : l'écran
    doit être un espace SACRÉ. Pas de pop-up système, pas de
    notification externe. Le cockpit est un sanctuaire. »*

### Cybernéticiens (10)

16. **Norbert Wiener** (MIT, †1964 — fondateur cybernétique) —
    *« Toute boucle de feedback doit être visible. Dessine les
    flèches de retour entre les ressources et les actions, pas
    juste les coûts/effets unidirectionnels. »*
17. **Stafford Beer** (Cybersyn, †2002) — *« Viable System Model :
    5 niveaux. Le cockpit doit avoir : Opération (instruments),
    Coordination (rails), Optimisation (orchestrator), Stratégie
    (objectifs), Identité (épilogue). Tu n'en as que 4. »*
18. **Heinz von Foerster** (BCL, †2002) — *« Second-order :
    l'observateur fait partie du système. Affiche un méta-compteur
    "le joueur s'observe-t-il jouer ?" basé sur ses hovers, pauses,
    re-clics. »*
19. **Gregory Bateson** (Macy, †1980) — *« Double-bind : la grande
    décision politique impose un choix qui blesse dans tous les cas.
    Un mini-jeu sur 7 doit être un trilemme strict (cf. V2-2). »*
20. **Humberto Maturana** (Santiago, †2021 — autopoïèse) — *« Une
    organisation est autopoïétique si elle maintient ses frontières.
    Affiche un seuil critique sous lequel le syndicat n'est plus
    "lui-même" et bascule en autre faction. »*
21. **Francisco Varela** (Polytechnique, †2001 — embodied) — *« Le
    corps cognitif : le cockpit doit fatiguer le joueur (lourdeur
    visuelle progressive après 20 min). Anti-pattern : l'écran qui
    reste toujours pétillant. »*
22. **W. Ross Ashby** (BCL, †1972) — *« Loi de variété requise :
    7 leviers pour 6 ressources, sinon l'État absorbe la variété.
    Vérifie que les actions exposées au joueur sont au moins aussi
    nombreuses que les états critiques du système. »*
23. **Margaret Mead** (Columbia, †1978 — Macy) — *« Variantes
    culturelles : chaque période historique doit imposer une
    variation rituelle des actions. La signature en 1900 ≠ la
    signature en 2017. »*
24. **Gordon Pask** (Brunel, †1996 — conversation theory) — *« Le
    cockpit doit être conversationnel. Chaque action ouvre un
    DIALOGUE avec le système (« si je fais ça, qu'est-ce qui change
    pour toi ? »). »*
25. **Edgar Morin** (EHESS, complexité) — *« Refuser le binaire.
    Aucune action ne doit être 100% bonne ou mauvaise. Toujours
    au moins 2 effets opposés sur 2 jauges différentes. »*

### Thermodynamique et systèmes complexes (5)

26. **Ilya Prigogine** (Bruxelles, Nobel 1977 — structures
    dissipatives) — *« L'ordre émerge de la dissipation. Un syndicat
    qui ne consomme RIEN se sclérose. Crée une "entropie minimale"
    qui force à dépenser au moins une jauge par tour. »*
27. **Donella Meadows** (Limits to Growth, †2001) — *« Identifie les
    points de levier (12 leviers de Meadows, du plus faible — chiffres
    — au plus fort — paradigme). La V3 doit les nommer
    explicitement dans la doc design. »*
28. **Geoffrey West** (Santa Fe Institute, scaling laws) — *« Une
    organisation grandit en N^(3/4) — pas linéairement. Les coûts
    d'une manif doivent croître non-linéairement avec ton nombre
    d'adhérents. »*
29. **Ludwig von Bertalanffy** (general systems theory, †1972) —
    *« Système ouvert : il y a un environnement qui pousse depuis
    l'extérieur. Modélise les "vents" historiques (1929 crise, 1968
    pression jeunesse, 2008 subprimes) comme forçages externes. »*
30. **Yaneer Bar-Yam** (NECSI, complex systems) — *« Une crise
    systémique survient quand 3 sous-systèmes basculent
    simultanément. Code un détecteur "cascade alert" qui prévient
    le joueur quand 3 jauges franchissent leur seuil critique
    dans les 2 mêmes tours. »*

---

## II. Synthèse — 7 axes de refonte

Aggregation des 30 recommandations.

### Axe 1 — Visualisation des flux énergétiques
*Wiener (#16), Pask (#24), Kojima (#3), Wright (#2)*

**Principe** : chaque ressource est un fluide, chaque action est une
conversion. Au survol d'une action, dessine **les flèches de flux** :
ce qui est consommé (rouge sortant), ce qui est produit (vert
entrant), ce qui est différé (bleu retardé).

**Implémentation** :
- Animation de particules sortant d'une jauge vers une action
- Estampe « -15 F » sur Caisse + « +12 Légitimité » sur la jauge cible
- Overlay opacity reduce sur les jauges non-impactées (focus sur ce
  qui bouge)

### Axe 2 — Conservation et entropie
*Prigogine (#26), Bateson (#19), Bertalanffy (#29)*

**Principe** : chaque tour, une « entropie de fond » consume des
ressources passivement (Mandat -1, Confiance -1). On ne peut pas
THESAURISER. Forcer l'action.

**Implémentation** :
- Tick de fin de tour : -1 sur 2 jauges aléatoires (seedé)
- Si toutes les jauges sont au max sans action, alerte "stagnation"
- Cumulatif : 5 tours sans action = chute brutale Légitimité

### Axe 3 — Cascades et seuils critiques
*Bar-Yam (#30), Beer (#17), Maturana (#20)*

**Principe** : quand 3+ jauges franchissent un seuil critique
simultanément, le système entre en **état de crise**. Affichage
visuel global (red overlay subtil + sound cue grave). Certaines
actions sont temporairement débloquées (réformes d'urgence,
ordonnance, lock-out étendu).

**Implémentation** :
- Détecteur `crisisDetector(state)` qui tracke nb jauges < seuil
- Si ≥ 3 → flag `crise_active` + débloque actions « urgence »
- Cockpit applique ambient `mood-grave` automatiquement

### Axe 4 — Forçages externes (vents historiques)
*Bertalanffy (#29), Mead (#23), Romero (#6)*

**Principe** : aux tours pivots historiques (1789, 1848, 1871, 1914,
1929, 1936, 1944, 1968, 1995, 2007, 2020, 2030+), un **vent** souffle
depuis l'extérieur. Modificateur visible sur certaines actions
(coût halved, effet doublé, cooldown réduit).

**Implémentation** :
- Catalogue `EXTERNAL_FORCINGS: TurnRange → ForceModifier`
- Affichage bandeau supérieur : « ☄ Vent de Mai 68 — Manifestation
  coûte -50% »
- Décay sur 3-5 tours

### Axe 5 — Loi de variété requise
*Ashby (#22), Meier (#1), Knizia (#7)*

**Principe** : le nombre d'actions exposées doit ≥ nombre d'états
critiques du système. Si seulement 5 jauges critiques mais 17
actions, on a trop de bruit. Si 7 jauges critiques mais 4 actions,
le système absorbe la variété (le joueur subit).

**Implémentation** :
- Filtre dynamique : seules les actions PERTINENTES au tour courant
  sont affichées en haut du Drawer
- Les autres restent accessibles en sections « avancé »
- Calcul `relevance(action, state)` qui priorise

### Axe 6 — Scaling non-linéaire
*West (#28), Johnson (#8)*

**Principe** : les coûts grandissent en N^(3/4) avec la taille de
l'organisation. Une manif coûte 15F à 1000 adhérents, 60F à 100k.
Plus tu grandis, moins chaque action est efficace **par adhérent**.
Modèle qui pousse à diversifier les stratégies.

**Implémentation** :
- `costFor(action, state.organization.membership)` recalcul dynamique
- Affichage `coût × facteur d'échelle` au survol

### Axe 7 — Conversation et observation
*Pask (#24), von Foerster (#18), Varela (#21)*

**Principe** : le cockpit est un dialogue. Chaque action propose une
question implicite (« qu'est-ce qui change ? »), le système répond
en montrant les conséquences. Méta-niveau : un compteur silencieux
mesure la réflexivité du joueur (hovers, re-clics, retours).

**Implémentation** :
- Tooltip riche au survol qui simule la réponse du système
- `reflectivityScore` calculé sur hover-time / decision-time ratio
- Affichage post-partie : « Tu as observé le système 73% du temps,
  tu as agi 27% — profil d'analyste »

---

## III. Modèle thermodynamique des ressources

Les 7 ressources V2 (Caisse, Confiance, Légitimité, Adhérents,
Force int/ext, Mémoire) deviennent des **fluides** avec :

| Propriété | Description |
|---|---|
| **Flux** | Vitesse de variation par tour (peut être négative) |
| **Stock** | Valeur actuelle 0-100 |
| **Capacité** | Max (souvent 100 mais variable selon institutions) |
| **Conductivité** | Vitesse à laquelle l'action peut transférer ce fluide |
| **Entropie** | Décay passif par tour (varie par ressource) |
| **Réservoir** | Sources externes (cotisations, dons, État) |
| **Dissipation** | Pertes par friction (corruption, fuites, démotivation) |

### Conservation et flux

**Loi de conservation** : aucune action ne crée ou détruit de la
ressource « pure ». Toute action est une **conversion** entre fluides.
- Manif : convertit Caisse + Mandat → Force externe + Légitimité
- Trésorerie : convertit Adhérents (cotisations) → Caisse
- Signature : convertit Mandat → Légitimité + Institution
- Lock-out (patron) : convertit Caisse → Rapport de force, perd
  Légitimité par friction

### Entropie passive (par tour, sans action)

| Ressource | Décay/tour | Justification |
|---|---|---|
| Caisse | -0,5 | Frais courants |
| Confiance | -0,3 | L'oubli quotidien |
| Légitimité | -0,2 | L'érosion politique |
| Adhérents | -0,1 | Mortalité naturelle |
| Force ext | -0,8 | Perd vite si pas entretenu |
| Cohésion int | -0,4 | Refroidissement |
| Mémoire | 0 | Cumulative, ne décroît pas |

### Cascade alert (Bar-Yam)

Si 3 jauges franchissent leur seuil critique (< 25 %) dans une
fenêtre de 2 tours → flag `crise_active` :
- Ambient cockpit passe en `mood-grave` automatique
- Sound cue grave en boucle (low rumble -25 dB)
- Actions « urgence » se débloquent : ordonnance forcée
  (patron/État), grève générale (salarié), congrès extraordinaire
- Cooldowns divisés par 2 pendant la crise

### Forçages externes (vents historiques)

| Tour | Vent | Effet |
|---|---|---|
| 1-3 | Souffle révolutionnaire | Toute action +Mémoire double |
| 17-22 | Crise Front populaire | Manif coût ÷2, effet ×2 |
| 23-26 | Vent CNR | Signature +30 Légitimité |
| 35-40 | Crise pétrolière | Caisse décroît 2× |
| 45-50 | Refondation sociale | Table cooldown ÷2 |
| 79-90 | Macron 2017+ | Lock-out patron débloqué |
| 91-100 | IA/plateformes | Toutes actions avec talents +20% |

---

## IV. UX — Drawer d'Actions thermodynamique

Le composant central V3 : **`CockpitActionsDrawer`** ouvert depuis
un bouton « ⚙ Actions » dans la barre d'action cockpit.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ACTIONS · Tour 38/100  ⊠ Cascade alerte    Actions 1/2     │
├─────────────────────────────────────────────────────────────┤
│  [Mobilisation]  [Institutionnel]  [Finance]  [Communication]│
│  [Organisation]  [Urgence ⚠]                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Manifestn│  │ Meeting  │  │ Tracts   │                  │
│  │ ●●○      │  │ ●○○      │  │ ●        │                  │
│  │ -15 -8   │  │ -8 -3    │  │ -3 -1    │                  │
│  │ +12 RFE  │  │ +10 Conf │  │ +3 Conf  │                  │
│  │ +5 Lég   │  │ +6 Lég   │  │ +2 Lég   │                  │
│  │ Échec 20%│  │ Échec 18%│  │ Échec 5% │                  │
│  │ CD 4t    │  │ CD 3t    │  │ CD 1t    │                  │
│  │ [▶]      │  │ [▶]      │  │ [▶]      │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                             │
│  Au survol : flux énergétiques visualisés sur les jauges    │
│  cockpit en arrière-plan (popover semi-transparent)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Carte d'action

Chaque carte affiche :
- **Icône** SVG paritaire (16 dispo dans icons.ts)
- **Nom** court (Cinzel)
- **Coût** : 3 dots ●●○ pour temps + chiffres pour Caisse + Mandat
- **Effets garantis** (jauges + delta), couleur selon delta (vert/rouge)
- **Probabilité d'échec** (si > 5%)
- **Cooldown** restant (si en attente)
- **Bouton EXÉCUTER** (disabled si bloqué)

État de la carte :
- **Disponible** : bordure laiton, hover translate-Y +2px + glow
- **Coût trop élevé** : grisé, badge « Caisse insuffisante »
- **Cooldown** : grisé + chiffre ⏳ « Encore 3 tours »
- **Précondition KO** : grisé + raison
- **Urgence débloquée** : bordure rouge pulsante

### Visualisation des flux (HOVER)

Au survol d'une action, le **cockpit en arrière-plan** s'anime :
- Les jauges concernées (sortantes) **brillent en rouge** avec
  particules animées qui sortent vers la carte d'action
- Les jauges cibles (entrantes) **brillent en vert** avec particules
  qui arrivent depuis la carte
- Les jauges non-touchées **s'estompent** à opacity 0.4
- Si différé (effet en N tours) : particules **bleues** qui pulsent
  lentement

### Cascade alerte (panel dédié)

Si `crise_active`, un **bandeau supérieur rouge sang** apparaît :
```
⚠ CRISE SYSTÉMIQUE — 3 jauges en zone critique
Actions d'urgence débloquées · Cooldowns ÷2 · Tente de stabiliser
```

Et une section **« Urgence »** apparaît dans les catégories du
drawer avec les actions exceptionnelles.

---

## V. Améliorations UX cockpit (synthèse experts)

### Lexique francisé (Raynal #12)
- « cooldown » → « repos »
- « cooldown timer » → « temps de repos »
- « score » → « bilan »
- « game over » → « la table se ferme »
- « level up » → « passage de grade »

### Pause forcée 3s (Chen #13)
Après chaque action LOURDE (Manif, Table, Congrès), 3s de pause
forcée sans bouton, juste pour respirer. Affichage textuel
contemplatif :
- *« La séance se ferme. Le silence prend la salle. »*
- *« La banderole retombe. Les militants rentrent chez eux. »*

### Triple feedback sensoriel (Bleszinski #14)
Chaque clic d'action produit :
- **Visuel** : flash bref + scale-in du résultat
- **Sonore** : SFX paritaire (cire de cire, plume, applaudissements)
- **Haptique** : micro-shake CSS 200ms (simulé sur desktop)

### Pas de pop-up système (Zimmerman #15)
Le cockpit est sacré. Aucune `alert()`, aucun `confirm()`, aucune
notification browser. Tout dans le canvas du jeu.

### Méta-compteur réflexivité (von Foerster #18, Varela #21)
Mesure silencieuse :
- Hovers / decisions
- Temps de pause moyen avant action
- Re-clics (annulations / hésitations)
- Affiché en post-partie : profil "analyste / impulsif / contemplatif"

### Variantes culturelles par ère (Mead #23)
Chaque ère module l'esthétique :
- 1789-1830 : papier vélin, plume Sergent-Major, sceau de cire rouge
- 1900-1940 : papier officiel typo Didot, cachet violet
- 1944-1980 : papier mécanographique, tampons noirs, machine à écrire
- 2000+ : interfaces digitales, signatures électroniques

---

## VI. Roadmap d'implémentation V3

### Étape A — Drawer d'actions thermodynamique (~5 j)
- `CockpitActionsDrawer.svelte` (les 17 actions du moteur)
- Hover → flux énergétiques visualisés sur cockpit en arrière-plan
- Catégories filtrables, urgence highlighting

### Étape B — Entropie + cascade detector (~3 j)
- `entropyTick()` à chaque advanceTurn
- `crisisDetector()` qui pose `flag.crise_active`
- Cockpit ambient passe en mood-grave automatique

### Étape C — Forçages externes (~2 j)
- Catalogue `EXTERNAL_FORCINGS`
- Bandeau bandeau ☄ supérieur dans status bar
- Modificateurs appliqués en `executeAction`

### Étape D — Pause forcée + triple feedback (~2 j)
- 3s de pause après actions lourdes
- SFX paritaires (existants : cire, plume, applaudissements)
- Micro-shake CSS 200ms

### Étape E — Méta-compteur réflexivité (~1,5 j)
- Track hovers + decision time
- Affichage post-partie (EndingReport)

### Étape F — Variantes culturelles par ère (~3 j, contenu)
- 4 thèmes esthétiques par grande période
- Application automatique selon `era`

### Étape G — Lexique francisé (~1 j, refacto string)
- Recherche-remplace global des anglicismes
- Validation par revue éditoriale

**Total V3 : ~17,5 j-dev** + 6 j de pige (Foley audio + design ère).

---

## VII. Critères de succès V3

- [ ] Au survol d'une action, le joueur VOIT instantanément où
      l'énergie va (flèches/particules animées)
- [ ] Le joueur ne peut pas thesauriser (entropie force l'action)
- [ ] Au moins 1 cascade alerte par partie de 100 tours
- [ ] Les vents historiques sont identifiables sans glossaire
- [ ] Aucun anglicisme dans l'UI (audit Raynal)
- [ ] Aucun pop-up système browser (audit Zimmerman)
- [ ] Le profil de joueur est lisible en post-partie (analyste vs
      impulsif vs contemplatif)
- [ ] L'esthétique 1789 ≠ l'esthétique 2026 visuellement

---

*30 experts convoqués. Implémentation prioritaire : Étape A
(Drawer d'actions) + Étape B (entropie/cascade). Les autres
peuvent suivre incrémentalement.*
