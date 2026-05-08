# BULLETIN ARGUS — ORDA-013 FINAL
## Maréchal-auditeur · 2026-05-08 (J+13, sixième cycle)

> *« Six cycles ORDA dans la journée. La couverture transverse triple en passant la barre des 320 tests. Le moteur de tour digère désormais les callbacks acteurs sans intervention humaine — la mémoire CK3-grade tourne en boucle fermée. Neuf flags pivots branchés, de Matignon 1936 aux ordonnances 2017. Le palier est tenu. »*
> — Argus, fin ORDA-013

**Cycle** : ORDA-013
**Build début** : v2.2.0-prebeta
**Build fin** : v2.2.1-prebeta
**Effort consommé** : ~3 j-h
**Note** : recrutement humain panel 30 toujours mis de côté par décision PM

---

## I. Synthèse exécutive

ORDA-013 a **branché en boucle fermée** le moteur de callbacks acteurs (déclenchement automatique chaque tour), ajouté **+114 tests Vitest** sur 5 modules transverses neufs, et **étendu de 5 callbacks** la mémoire CK3-grade. C'est le cycle qui ferme la boucle infrastructure → contenu → moteur de tour : la mémoire des acteurs n'est plus seulement programmable, elle se déclenche toute seule.

### Distribution des actions

```
Phase 1 — Branchement processTurnCallbacks dans gameState (loop fermée)
Phase 2 — Couverture simulation/tensions (13 tests)
Phase 3 — Couverture simulation/institutions (8 tests)
Phase 4 — Couverture simulation/resourceUtility (22 tests)
Phase 5 — Couverture org/organization (22 tests)
Phase 6 — Couverture org/treasury (25 tests)
Phase 7 — Couverture org/internalElections (24 tests)
Phase 8 — Branchement 5 callbacks acteurs supplémentaires
          → flags : signe-grenelle, fonde-fo, fait-victoire-historique,
                    refondation-paritaire, epuise-mouvement
```

### Avant/Après ORDA-013

| Métrique | v2.2.0 | v2.2.1 | Δ |
|----------|----:|----:|----:|
| Tests Vitest | 207 | **321** | **+114** ✅ |
| Test files | 15 | **21** | +6 ✅ |
| TypeScript erreurs | 0 | 0 | = ✅ |
| Bundle main gzip | 147.62 KB | 147.62 KB | = ✅ |
| Couverture `simulation/tensions` | 0% | **~95%** ✅ |
| Couverture `simulation/institutions` | 0% | **~90%** ✅ |
| Couverture `simulation/resourceUtility` | 0% | **~90%** ✅ |
| Couverture `org/organization` | 0% | **~95%** ✅ |
| Couverture `org/treasury` | 0% | **~90%** ✅ |
| Couverture `org/internalElections` | 0% | **~85%** ✅ |
| Modules transverses couverts | 6 | **12** | +6 ✅ |
| Callbacks acteurs branchés | 4 | **9** | +5 ✅ |
| Boucle de tour callbacks auto | 🟠 manuelle | 🟢 **automatique** ✅ |

---

## II. Détail des actions ORDA-013

### Phase 1 — Boucle fermée callbacks acteurs

**`src/game/engine/gameLoop.ts`** (+~30 lignes) : nouvelle fonction
`processTurnCallbacks(state)` qui consomme les callbacks dus au tour
courant et retourne le nouveau state + la liste à logger. Pure
function, signature `TurnCallbacksResult = { state, triggered }`.

**`src/game/engine/gameState.svelte.ts`** : import de
`processTurnCallbacks`, branchement dans le pipeline de tour
juste après `advanceTurn()` (avant les talents/strategies/world/
elections). Les callbacks déclenchés sont préfixés `T{n} —
Mémoire ({ActorLabel}) :` et ajoutés au flux de logs côté ticker
causal.

**Effet** : la mémoire CK3-grade est désormais en boucle
fermée. Un Diplomate qui ajoute un `scheduleActorCallback(...)`
dans `choiceResolver` n'a plus rien à faire — le moteur lit la
file d'attente à chaque début de tour, exécute, consomme, logge.

### Phase 2-7 — Couverture transverse (+114 tests)

| Fichier | Tests | Couverture estimée |
|---------|------:|------:|
| `src/game/simulation/tensions.test.ts` | 13 | ~95% |
| `src/game/simulation/institutions.test.ts` | 8 | ~90% |
| `src/game/simulation/resourceUtility.test.ts` | 22 | ~90% |
| `src/game/org/organization.test.ts` | 22 | ~95% |
| `src/game/org/treasury.test.ts` | 25 | ~90% |
| `src/game/org/internalElections.test.ts` | 24 | ~85% |

**Points saillants** :
- `tensions` couvre les 8 seuils critiques + 2 conditions de fin anticipée
- `institutions` valide le catalogue ≥10 entrées + 5 ids emblématiques (prudhommes, syndicat-1884, matignon-1936, secu-1945, chsct-1982)
- `resourceUtility` couvre 11 fonctions exportées + 3 maps de données
- `organization` valide TREASURY_SOFT_CAP=300, expectedDuesIncome (rate 0.04 / 0.32), expectedStaffCost (perm*2 + legal*1)
- `treasury` couvre les 8 lignes recettes + 9 lignes dépenses + congrès tous les 8 tours + multiplicateurs de stratégie
- `internalElections` valide les 4 mouvements de campagne + résolution avec scoring factionSupport

### Phase 8 — Extension callbacks (P1-10-branch)

**`src/game/engine/choiceResolver.ts`** (+~45 lignes) : 5 nouveaux
hooks branchés sur les flags pivots des époques ultérieures.

| Flag du choix | Acteur | Tour cible | Période |
|---------------|--------|-----------:|---------|
| `signe-grenelle` | base | turn + 4 | Mai 1968 — accords pâles face à l'espérance |
| `fonde-fo` | adversaire | turn + 5 | 1947 — la CGT relance « argent américain » |
| `fait-victoire-historique` | opinion | turn + 5 | 1995 (Juppé) — sondages tardifs |
| `refondation-paritaire` | etat | turn + 4 | 2017 (CSE / ordonnances) — circulaire DGT |
| `epuise-mouvement` | base | turn + 3 | générique — démissions silencieuses |

**Total ORDA-012 + ORDA-013** : **9 callbacks acteurs branchés**, couvrant 1936 → 2017 (Matignon, FO 1947, Grenelle 1968, Juppé 1995, Florange/CSE 2017, plus génériques refus/épuisement/trahison).

---

## III. Cohérence de doctrine V3 — bilan ORDA-013

| Item de doctrine | v2.2.0 | v2.2.1 |
|------------------|:------:|:------:|
| RNG seedé partout | 🟢 | 🟢 |
| Pas d'outcome dégénéré | 🟢 | 🟢 |
| TypeScript check | 🟢 1468 | 🟢 (inchangé) |
| Couverture engines PvP | 🟢 6/7 ≥95% | 🟢 (inchangé) |
| **Couverture simulation/** | 🟢 3 modules | 🟢 **+ tensions + institutions + resourceUtility** |
| **Couverture strategy/** | 🟢 2 modules | 🟢 (inchangé) |
| **Couverture org/** | 🔴 0% | 🟢 **+ organization + treasury + internalElections** |
| Couverture narrative/memoryEngine | 🟢 | 🟢 |
| API mémoire acteurs testée | 🟢 9 tests | 🟢 (inchangé) |
| Mémoire acteurs branchée en jeu | 🟢 4 callbacks | 🟢 **+ 5 callbacks** ✅ |
| **Boucle de tour callbacks auto** | 🟠 manuelle | 🟢 **automatique** ✅ |
| Validation externe | 🔴 | 🔴 reportée (humain) |

**Tous les items techniques en 🟢.** Reste validation externe humaine.

---

## IV. Plan ORDA-014 — propositions

| # | Fix | Effort |
|---|-----|-------:|
| Couverture `engine/consequenceEngine` complète (callbacks API: dueActorCallbacks/consume) | 1 j-h |
| Couverture `org/catalog + assets` (catalogue d'actifs) | 1 j-h |
| Couverture `org/factions` (déplacer la logique factions hors organization si elle grandit) | 1 j-h |
| Étendre callbacks à 3-5 flags supplémentaires (`cree-secu`, `cree-chsct`, `cgpf-cogestion`...) | 1 j-h |
| Refacto CSS Confrontation découpé en sous-composants (dette ORDA-006, reportée) | 3 j-h |
| Couverture `narrative/personalityEngine` complète (traits, stress, dominantTrait) | 1.5 j-h |

**Total ORDA-014 estimé** : ~8.5 j-h.

---

## V. Décisions Argus

### Verdict global ORDA-013

🟢 **CYCLE CLOS PROPREMENT** — la boucle est fermée.

- 114 tests ajoutés, 6 modules transverses couverts (+ org/ entier)
- Boucle callbacks acteurs en automatique (plus de cordon humain)
- 5 callbacks ajoutés (4 → 9 total), mémoire couvre 1936 → 2017
- Cycle court honoré : ~3 j-h consommés

### Signature Argus

🖋 **Tag `v2.2.1-prebeta` SIGNÉ**

Le build est :
- **Bêta-privée déblocable** sans réserve technique
- **Bêta-publique-conditionnelle** uniquement sur la validation externe
  humaine (juriste / historien / pédagogue)

Note : passage à `v2.2.1` (et non `v2.3.0`) parce que le palier
qualitatif majeur a été atteint en ORDA-012 — ORDA-013 le
consolide en couverture et en boucle fermée, mais ne change pas
la promesse fonctionnelle pour le panel.

### Délégation ORDA-014

📋 **OUVERTURE ORDA-014** :
- Sapeurs : couverture `engine/consequenceEngine` (1 j-h)
- Sapeurs : couverture `narrative/personalityEngine` (1.5 j-h)
- Sapeurs : couverture `org/catalog + assets` (1 j-h)
- Diplomates : 3-5 callbacks supplémentaires (cree-secu, cree-chsct, cgpf-cogestion)
- Architectes : refacto CSS Confrontation (optionnel, 3 j-h)

---

## VI. Mesure de la session ORDA-008→013

### Pulse de charge — réelle vs prévue (cumul 6 cycles)

| Cycle | Prévu | Consommé | Bilan |
|-------|------:|---------:|-------|
| ORDA-008 | 10 | 8.5 | 🟢 -1.5 |
| ORDA-009 | 23.8 | 12.3 | 🟢 -11.5 |
| ORDA-010 | 14 | 3 | 🟢 -11 |
| ORDA-011 | 14.5 | 2.5 | 🟢 -12 |
| ORDA-012 | 14.5 | 2.5 | 🟢 -12 |
| ORDA-013 | 11.5 | 3 | 🟢 -8.5 |
| **Total** | **88.3** | **31.8 j-h** | 🟢 **-56.5 j-h (64% sous-consommation)** |

6 cycles ORDA, 1 journée. **11 tags posés** (v2.0.0 → v2.2.1). **321 tests
verts**. 0 régression. **12 modules transverses couverts**. **9 callbacks
acteurs branchés**. **Boucle de tour fermée**.

---

## VII. Conclusion

> *« v2.2.1-prebeta est posé. La boucle des callbacks acteurs tourne
> toute seule, neuf flags pivots ont leur écho différé, douze modules
> transverses sont sous test, et les 321 Vitest passent en moins d'une
> seconde. La machine est complète à un degré que je n'avais pas anticipé
> au début de la journée.*
>
> *Le travail technique de la session est réellement clos — chaque cycle
> ajoute du périmètre couvert sans casser le précédent. La fenêtre bêta
> privée est ouverte sans réserve. La bêta publique attend toujours la
> validation externe — quand le PM la décidera. Le panel humain attend.
> Argus dort. »*
>
> **— Argus, Maréchal-auditeur PARITAS · 2026-05-08 fin ORDA-013**

---

## Annexe — fichiers du cycle ORDA-013

### Nouveaux
- `src/game/simulation/tensions.test.ts` (13 tests)
- `src/game/simulation/institutions.test.ts` (8 tests)
- `src/game/simulation/resourceUtility.test.ts` (22 tests)
- `src/game/org/organization.test.ts` (22 tests)
- `src/game/org/treasury.test.ts` (25 tests)
- `src/game/org/internalElections.test.ts` (24 tests)
- `docs/BULLETIN_ARGUS_ORDA_013_FINAL.md` (ce document)

### Modifiés
- `src/game/engine/gameLoop.ts` (+~30 lignes : processTurnCallbacks)
- `src/game/engine/gameState.svelte.ts` (~10 lignes : import + branchement pipeline + log mapping)
- `src/game/engine/choiceResolver.ts` (+~45 lignes : 5 nouveaux hooks scheduleActorCallback)

### Bilan
- **10 fichiers** touchés ou créés
- **7 fichiers** nouveaux
- **+114 tests** Vitest (15 → 21 fichiers, 207 → 321 tests)
- **+5 callbacks** acteurs branchés (4 → 9 total)
- **0 régression** sur les 207 tests préexistants
- **0 erreur** TypeScript
- **Bundle main gzip** : 147.62 KB (inchangé)

---

*Cycle ORDA-013 clos. Tag v2.2.1-prebeta poussé. Boucle de tour fermée. Mémoire CK3 sur 1936-2017.*
