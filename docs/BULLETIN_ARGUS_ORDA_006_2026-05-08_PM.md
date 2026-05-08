# BULLETIN ARGUS — ORDA-006 / Couverture moteur + Refacto Confrontation
## Maréchal-auditeur · 2026-05-08 (soir) · Suite à v2.1.0-prebeta

> Trois actions ouvertes en clôture de la pré-bêta : étendre Vitest aux 4 ateliers PvP restants (Elections, Grève, Table, Confrontation), produire un rapport de couverture baseline, et démarrer la refacto de la dette Confrontation (986 lignes).

---

## I. Extension Vitest — 4 nouveaux fichiers de tests

| Fichier | Tests | Cible |
|---------|------:|-------|
| `ateliers/elections/engine.test.ts` | 13 | constants, allocation math, scrutin resolution, AI variance, parité ≤60% MC, V2 effects |
| `ateliers/greve/engine.test.ts` | 9 | initial state, round mechanics, 5 outcomes ≥5% MC, V2 effects |
| `ateliers/table/engine.test.ts` | 9 | catalogues stables, 3 outcomes MC, V2 effects ordering |
| `ateliers/confrontation/engine.test.ts` | 13 | catalogues stables, 3 outcomes MC, **+ aiPolice/aiManif (post-refacto)** |
| **Total nouveaux** | **44** | tous engines PvP couverts |

**Plus** : NAO étendu avec simulation full session (10 000 parties random, IA random sur tactiques + postures + ajustements). Couverture NAO 13.49 % → **55.70 %**.

### Total tests V2.1.1-prebeta

```
Test Files  7 passed (7)
     Tests  88 passed (88)
  Duration  397ms
```

vs v2.1.0-prebeta : 36 tests → **88 tests** (+52, +144 %)

---

## II. Rapport de couverture Vitest (baseline)

### Engines de jeu — couverture par ligne

| Module | Lines | Statements | Branches | Functions |
|--------|------:|-----------:|---------:|----------:|
| `negotiation/resolve.ts` | **100.00 %** | 100.00 % | 87.50 % | 100.00 % |
| `ateliers/laplace` | **100.00 %** | 97.95 % | 90.90 % | 100.00 % |
| `ateliers/confrontation` | **98.33 %** | 93.15 % | 87.03 % | 100.00 % |
| `ateliers/table` | **98.21 %** | 92.85 % | 84.90 % | 100.00 % |
| `negotiation/matignon.ts` | **95.65 %** | 94.48 % | 87.85 % | 97.29 % |
| `ateliers/greve` | **95.16 %** | 91.78 % | 88.46 % | 100.00 % |
| `ateliers/elections` | **90.80 %** | 87.28 % | 86.36 % | 100.00 % |
| `ateliers/nao` | **56.32 %** | 55.70 % | 43.88 % | 71.11 % |

**Verdict Argus** : tous les engines de jeu (logique pure du combat système) sont au-dessus de **90 % de couverture lignes**, sauf NAO (56 %) qui reste partiellement couvert. La ligne moteur PvP est solide pour la bêta.

### Couverture globale `src/game/`

```
Statements   : 22.98 % ( 657 / 2859 )
Branches     : 20.10 % ( 424 / 2109 )
Functions    : 23.44 % ( 124 /  529 )
Lines        : 23.39 % ( 568 / 2428 )
```

Note : la couverture globale reflète que `src/game/` contient des modules non-PvP non testés ce sprint (narrative/, org/, simulation/, strategy/, learning/, ai/, content/) qui pèsent ~2 200 lignes. **Ce n'est pas l'objectif d'ORDA-006**, qui visait les engines des 7 ateliers PvP. À traiter en ORDA-007+.

### Modules non couverts (≥ 100 lignes, candidats ORDA-007)

| Zone | Modules clés | Effort estimé |
|------|--------------|--------------:|
| `narrative/` | scenarioEngine, pipelineEngine, consequenceWriter | 4 j-h |
| `simulation/` | actors, resources, scoring, tensions, institutions | 3 j-h |
| `org/` | organization, treasury, internalElections, talents | 4 j-h |
| `strategy/` | catalog, resolver | 2 j-h |
| `objectives/` | catalog, evaluator | 1.5 j-h |
| `learning/` | playerProfile | 1 j-h |
| **TOTAL** | — | **~15 j-h** |

---

## III. Refacto Confrontation — extraction IA → engine

### Avant
```
src/components/ateliers/Confrontation.svelte   986 lignes
  ├── <script>  : 164 lignes
  │   └── aiPolice() + aiManif() : 18 lignes (logique pure)
  ├── <markup>  : 229 lignes
  └── <style>   : 589 lignes
```

### Après
```
src/components/ateliers/Confrontation.svelte   969 lignes (-17)
  ├── <script>  : 147 lignes (-17, IA importée)
  └── (markup + style inchangés)

src/game/ateliers/confrontation/engine.ts      +20 lignes
  └── export function aiPolice(state) : PoliceAction
      export function aiManif(state)  : ManifAction
```

**Bénéfices** :
1. ✅ Les IA sont désormais **testables** (4 nouveaux tests, couverture 100 % de ces fonctions)
2. ✅ Réutilisables hors composant (scripts MC, autres modes IA-vs-IA)
3. ✅ Frontière UI/moteur respectée (doctrine V3) — **plus aucune logique de jeu dans les .svelte des ateliers PvP**

**Limites** :
- Le gros de la dette Confrontation (589 lignes de CSS) n'a pas été touché. Refacto cosmétique en sous-composants (Header, Board, Hand, Modal) à voir en ORDA-007 si besoin. Non bloquant pour la bêta.

---

## IV. État technique consolidé V2.1.1-prebeta

| Vérification | Résultat |
|--------------|---------|
| TypeScript check | **1457 fichiers, 0 erreur, 0 warning** ✅ |
| Tests Vitest | **88/88 verts en 397 ms** ✅ |
| Build production | **4.20 s, bundle main 145 KB gzip** ✅ |
| Coverage 7 engines PvP | **90-100 % (sauf NAO 56 %)** ✅ |
| 9 ateliers Argus MC | **tous outcomes ∈ [5%, 60%]** ✅ |
| Frontière UI/moteur | **respectée pour Confrontation** ✅ |

---

## V. Décisions

1. **Signature ORDA-006** : 🟢 **JE SIGNE**
   - Couverture engines PvP au-dessus de 90 % (sauf NAO 56 %, à améliorer ORDA-007)
   - Refacto Confrontation : extraction IA réussie, frontière UI/moteur tenue
   - Aucune régression : 88 tests verts, build 4.20 s

2. **Tag à poser** : `v2.1.1-prebeta`

3. **Reste avant bêta publique** :
   - 🟡 Refacto cosmétique Confrontation CSS (969 → cible ~600 lignes via sous-composants) — **non bloquant**
   - 🟡 Couverture NAO 56 % → 90 %+ (ORDA-007)
   - 🟡 Couverture narrative + simulation + org + strategy (ORDA-007+, ~15 j-h)
   - 🟡 Recrutement panel 30 (Stratèges) — humain
   - 🟡 Validation externe (juriste/historien/pédagogue)

---

## VI. Conclusion

> *La doctrine V3 « pas de dépendance UI dans le moteur » est désormais respectée pour les 7 ateliers PvP. La couverture moteur (engines de jeu) atteint 90-100 % sur 6 des 7 ateliers. La fenêtre bêta reste ouverte. Tag à poser : **v2.1.1-prebeta**.*
>
> *ORDA-007 ouvert (sans urgence) sur la couverture des modules transverses (narrative, simulation, org). 15 j-h estimés, à étaler.*
>
> **— Argus, Maréchal-auditeur PARITAS · 2026-05-08 (soir)**
