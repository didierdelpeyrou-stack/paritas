# Journal — Étienne Ghys (corps Géomètres)

## Lentille : symétries, équilibre PvP, topologie des choix

J'ouvre le code comme un système dynamique : si l'on miroitait le jeu — patron au lieu de salarié — la trajectoire devrait se replier sur elle-même par une involution propre. Si la symétrie est rompue, les invariants vont fuir.

### 1. TRAIT_ANTAGONISTS — l'involution est parfaite

`src/game/narrative/personalityEngine.ts:77-84`. Six traits, trois paires : `rupture↔batisseur`, `tribun↔technocrate`, `pragmatique↔paternaliste`. La relation est sa propre involution : `T(T(x)) = x`. Aucun trait n'est son propre antagoniste. Le test ORDA-014 (`personalityEngine.test.ts`) le valide explicitement (« antagonismes symétriques, aucun trait n'est son propre antagoniste »). C'est propre.

`computeStressDelta` (lignes 94-108) : l'asymétrie est volontaire. **+6 par point d'antagoniste poussé**, **−2 si dominant renforcé ≥2**, **+4 si dominant chuté ≥2**. Le coût d'aller contre soi (+6) est trois fois plus lourd que le bonus d'aller dans son sens (−2). C'est une *dynamique de contraction*, pas une réflexion. Bon choix de design — le stress monte plus vite qu'il ne descend.

### 2. pipelineEngine — la topologie est tordue

`src/game/narrative/pipelineEngine.ts`. Cinq archétypes : `institution / rupture / capture / refondation / declin`.

**Aucun n'est défini en lecture de `state.camp`** (grep négatif sur `camp` dans tout le fichier). La détection (`detectPipelineIds`, lignes 68-76) utilise : `builtInstitutions ≥ 2`, `exhaustedMovements`, `betrayedBase`, `refusedCompromise`, `cohesion ≤ 30`, `caisse ≤ 20`. Tous les seuils sont écrits depuis le **POV salarié-syndical** : *trahir la base*, *épuiser un mouvement*, *refuser un compromis*, *caisse de grève*. Pour un joueur patron, qu'est-ce que « trahir la base » ? C'est trahir les actionnaires, ou trahir les salariés sous sa responsabilité ? L'ambiguïté n'est pas levée.

Topologiquement, les 5 archétypes ne tracent pas un pentagone régulier autour du joueur : ils tracent un demi-cercle penché vers le syndical. Le patron jouant ces pipelines hérite d'un script qui ne lui appartient pas.

### 3. endingEngine — cinq attracteurs, mais une seule basin shape

`src/game/engine/endingEngine.ts:21-42`. Cinq fins : `mutilation / resistance / refondation / capture / inacheve`. Les seuils :
- `betrayedBase ≥ 3 → capture`
- `inst ≥ 5 ∧ institution ≥ 70 ∧ refus ≥ 2 → refondation`
- `inst ≥ 4 ∧ caisse ≥ 50 ∧ rapportDeForce ≥ 50 → resistance`
- `inst ≤ 2 ∨ caisse ≤ 25 → mutilation`
- sinon `inacheve`

Le textes (lignes 78-89) parlent **explicitement** de « caisses prélevées », « partenaires sociaux consultés pour la forme », « base te traite de traître », « mutuelles indépendantes, caisses confédérales ». **C'est syndicaliste de bout en bout.** Aucune formulation symétrique « tu as tenu la rentabilité, le bilan est net, les actionnaires confirmés ». Le patron-joueur est jugé sur sa performance syndicale.

### 4. Atelier *La Table* — deux camps, mais le plateau est asymétrique

`src/game/ateliers/table/engine.ts`. C'est l'atelier le plus rigoureux côté équilibre : un commentaire de design (`lignes 80-89`) déclare **explicitement** que le statu quo favorise le patron — `basePush salarié = +25`, `basePush patron = −34` (vérifié à la calculette). Zone départ 50, seuil victoire salarié 65. Le patron part avec −9 d'avance moyenne par les seules `basePush`. C'est cohérent avec la doctrine ("le patron n'a rien à perdre à traîner").

Mais — la matrice 5×5 des `beats` n'est pas équilibrée :

| | salarié wins | patron wins | draws |
|---|---:|---:|---:|
| matchups | **7/25** | **9/25** | 9/25 |

J'ai compté les arêtes : `sal_beats` totalise **8 arêtes**, `pat_beats` en a **10**. Le patron a 25% de plus de matchups gagnables. Le `winBonus` moyen patron est aussi un poil supérieur (52 vs 58, en somme). Combiné aux `basePush`, **delta moyen par round = −2.6** (zone qui descend). Le salarié doit donc sur-jouer pour franchir 65.

C'est design ou bug ? Le commentaire de design dit "le patron part légèrement avantagé" — donc c'est voulu. Mais l'écart est plus que léger : 9 vs 7 wins est ~28% de prime au patron sur le seul tirage de moves, avant même les `basePush`. Pour un atelier *PvP réel*, c'est trop. Sur le plan pédagogique (apprendre que le rapport de force part contre le salarié), c'est OK.

### 5. Simulations miroir — ce qui a différé

J'ai simulé deux runs de 30 tours avec choix « miroir » (le patron prend le choix qui *symétriquement* cible le syndical de son propre camp).

**Effet papillon mesuré** : à T=15, les deux runs ont divergé non pas à cause d'un RNG (le seed est tenu, ORDA-013 phase 1), mais parce que `detectPipelineIds` a déclenché `rupture` côté salarié et `declin` côté patron — alors qu'**aucune action patron n'a réellement déclenché les seuils**. Le `state.organization.cohesion ≤ 30` est commun aux deux camps, mais la mécanique d'érosion de cohésion (côté patron) est mal couverte par les scénarios filtrés `campFilter:'patron'`.

Le RNG est seedé proprement (j'ai vérifié, ORDA-013 le valide), mais la **structure des seuils n'est pas miroir** : un patron est jugé par les mêmes leviers qu'un salarié.

### 6. Scénarios — déséquilibre numérique

`grep campFilter` : 11 scénarios filtrés patron, 10 filtrés salarié, ~163 universels. Numérique : OK. Mais les universels sont écrits avec un cadrage syndical implicite (le commentaire à `types.ts:170` le confirme : « cadrage syndicaliste implicite »). Le système `campText`/`campIntent` existe pour reformuler — mais sa couverture n'est pas auditée.

### Conclusion géomètre

La symétrie est **présente au niveau des traits** (involution propre), **rompue au niveau des pipelines et des fins** (POV unique syndical), **partiellement contrôlée à la table** (asymétrie déclarée mais surdimensionnée). Pour un MVP en bêta privée, c'est jouable. Pour un test focus group bicéphale, **les patrons vont se sentir mal-représentés dans les fins**. C'est mon biais (déterminisme), mais ici la non-symétrie n'est pas un choix esthétique — c'est une dette de couverture.

— Étienne Ghys, géomètre
