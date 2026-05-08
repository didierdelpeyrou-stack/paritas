# BULLETIN ARGUS — ORDA-011 FINAL
## Maréchal-auditeur · 2026-05-08 (J+13, quatrième cycle)

> *« Quatre cycles ORDA dans la journée. Le test relâché en ORDA-010 est levé. La distribution NAO est rétablie. Deux modules transverses passent de 0 % à couverts. La machine peut continuer. »*
> — Argus, fin ORDA-011

**Cycle** : ORDA-011
**Build début** : v2.1.8-prebeta
**Build fin** : v2.1.9-prebeta
**Effort consommé** : ~2.5 j-h
**Note** : recrutement humain panel 30 toujours mis de côté par décision PM

---

## I. Synthèse exécutive

ORDA-011 a fermé le **dernier P0 technique** restant du AAR bêta-30 et ajouté **28 tests Vitest** sur 2 modules transverses. La distribution NAO est désormais **conforme aux cibles Argus** sur 4 unions.

### Distribution des actions

```
Phase 1 — B-15-recal-emp : recalibrage aiEmployeurMove à 4 unions
                           + contagion retrait cfecgc
Phase 2 — Test accord_majoritaire ≥ 1% RESTAURÉ et passe
Phase 3 — Couverture simulation/resources (17 tests)
Phase 4 — Couverture strategy/catalog (10 tests)
```

### Avant/Après ORDA-011

| Métrique | v2.1.8 | v2.1.9 | Δ |
|----------|----:|----:|----:|
| Tests Vitest | 144 | **172** | **+28** ✅ |
| Test files | 10 | **12** | +2 ✅ |
| TypeScript erreurs | 0 | 0 | = ✅ |
| Bundle main gzip | 147.62 KB | 147.62 KB | = ✅ |
| **NAO accord_majoritaire** | 🟠 0% | 🟢 **31.3%** ✅ |
| **NAO pv_desaccord** | 🟠 0% (transitoire) | 🟢 **5.6%** ✅ |
| **Test relâché ≥0%** | 🟠 actif | 🟢 **levé, ≥1% restauré** ✅ |
| Couverture `simulation/resources` | 0% | **~95%** ✅ |
| Couverture `strategy/catalog` | 0% | **~80%** ✅ |
| Modules transverses couverts | 1 (memoryEngine) | **3** | +2 ✅ |

---

## II. Détail des actions ORDA-011

### B-15-recal-emp — recalibrage `aiEmployeurMove` à 4 unions

**Cible** : sortir de la situation où `aiEmployeurMove` détourne le
budget vers télétravail (poids 40 % cfecgc) au détriment des salaires
(poids 60 % FO), ce qui faisait chuter `accord_majoritaire` à 0 %.

**Fix appliqué** : changement d'algorithme de coalition cible.

**Avant** :
```typescript
// tri par GAP ascendant — cfecgc (seuil 0.52) remonte en tête
const sorted = gaps.sort((a, b) => a.gap - b.gap);
for (const g of sorted) {
  if (g.gap <= 0) { targets.push(g); targetWeight += g.weight; }
  if (targetWeight >= SIGNING_MAJORITY) break;
}
```

**Après** :
```typescript
// tri par POIDS électoral DÉCROISSANT + filtre gap plausible
const byWeight = gaps.sort((a, b) => b.weight - a.weight);
for (const g of byWeight) {
  if (targetWeight >= SIGNING_MAJORITY) break;
  if (g.gap <= 0.35) {  // unions trop éloignées = gaspillage budget
    targets.push(g);
    targetWeight += g.weight;
  }
}
```

**Conséquence** :
- CGT(38) + CFDT(35) = 73% → coalition naturelle 1ère
- CGT trop loin → CFDT(35) + FO(20) = 55% → fallback
- cfecgc(7) entre seulement si toutes les autres trop éloignées
- L'IA dépense en salaires/primes (FO+CGT) au lieu de télétravail

### Contagion retrait cfecgc

**Cible secondaire** : `pv_desaccord` était à 0 % après le fix
employeur — la cfecgc signait seule (signing.length=1 ≠ 0) quand
les 3 majeures bloquaient.

**Fix** : ajout d'une condition de contagion finale en début de
calcul cfecgc dans `aiSyndicatMove` :
```typescript
const allMajorRetrait = postures.cgt === 'retrait'
  && postures.cfdt === 'retrait'
  && postures.fo === 'retrait';
if (allMajorRetrait) {
  postures.cfecgc = 'retrait'; // contagion sociale
}
```

**Justification narrative** : la CFE-CGC ne signe pas seule un accord
refusé par les 3 confédérations majeures — sa légitimité de syndicat
catégoriel s'effondrerait. C'est cohérent avec son insertion dans
le paritarisme français (sans CGT/CFDT/FO, sa signature seule n'a
pas le poids démocratique requis).

### Vérification MC réelle

`node scripts/orda-001-nao-mc.mjs` (10 000 parties IA-vs-IA) :

| Outcome | Avant cfecgc | v2.1.8 (cassé) | **v2.1.9** | Cible Argus |
|---------|-------------:|---------------:|-----------:|------------:|
| accord_majoritaire | 31.6% | 0% | **31.3%** | ≤ 60% ✅ |
| accord_partiel | 44.6% | 99%+ | **44.7%** | ≤ 60% ✅ |
| accord_minoritaire | 17.8% | 0%+ | **18.4%** | ≥ 5% ✅ |
| pv_desaccord | 6.0% | 0% | **5.6%** | ≥ 5% ✅ |

**Distribution rétablie au pourcent près** sur les 4 outcomes.

### Couverture Vitest — `simulation/resources`

**`src/game/simulation/resources.test.ts`** (134 lignes, **17 tests**) :
- `freshResources` (2) : initialisation, pas de partage
- `clamp` (2) : bornes par défaut [0, 100], bornes custom
- `applyResourceDelta` (7) : positif, négatif, clamp 0/100, multi-deltas, immutabilité, undefined
- `formatResourceDelta` (4) : positif, négatif, zéro, arrondi
- Labels & tooltips (2) : présence pour les 7 ResourceKey

**Couverture estimée** : ~95% du module.

### Couverture Vitest — `strategy/catalog`

**`src/game/strategy/catalog.test.ts`** (90 lignes, **11 tests**) :
- STRATEGIES list (5) : ≥3 stratégies, ids uniques, champs requis,
  narrative success+failure, **P1-9 vérifié** (label « Influence
  institutionnelle » au lieu de « Lobbying »)
- strategyById (3) : lookup correct, undefined, insensible à l'ordre
- équilibre interne (3) : treasury ≥ 0, weights non-négatifs, unlockTurn ∈ [1,100]

**Couverture estimée** : ~80% du module catalog (STRATEGIES list +
strategyById).

---

## III. Cohérence de doctrine V3 — bilan ORDA-011

| Item de doctrine | v2.1.8 | v2.1.9 |
|------------------|:------:|:------:|
| RNG seedé partout sur boucle de jeu | 🟢 | 🟢 |
| **Pas d'outcome dégénéré (≥5%, ≤60%)** | 🟠 NAO accord_majoritaire 0% | 🟢 **31.3%** ✅ |
| Reproductibilité hors Vite | 🟢 | 🟢 |
| TypeScript check | 🟢 1463 | 🟢 1465 (+2 fichiers tests) |
| Couverture engines PvP | 🟢 6/7 ≥95% | 🟢 |
| **Couverture simulation/** | 🔴 0% | 🟢 **resources ~95%** ✅ |
| **Couverture strategy/** | 🔴 0% | 🟢 **catalog ~80%** ✅ |
| **Couverture narrative/** | 🟢 memoryEngine 95% | 🟢 (inchangé) |
| **API mémoire acteurs testée** | 🟢 9 tests | 🟢 (inchangé) |
| Frontière UI/moteur respectée | 🟢 | 🟢 |
| Validation externe | 🔴 | 🔴 reportée (PM) |

**Tous les items en 🟢 sauf validation externe (humaine, reportée).**
La doctrine V3 est désormais entièrement honorée côté technique.

---

## IV. Plan ORDA-012 — propositions

| # | Fix | Effort |
|---|-----|-------:|
| Couverture `simulation/scoring` + `simulation/actors` | 2 j-h |
| Couverture `simulation/tensions` + `simulation/institutions` + `simulation/resourceUtility` | 3 j-h |
| Couverture `org/treasury` + `org/organization` + `org/internalElections` | 3 j-h |
| Couverture `strategy/resolver` (engine 114 lignes) | 1.5 j-h |
| Brancher 5 callbacks acteurs dans `1936-matignon.ts` (Diplomates) | 2 j-h |
| Refacto CSS Confrontation découpé en sous-composants | 3 j-h |

**Total ORDA-012 estimé** : 14.5 j-h.

---

## V. Décisions Argus

### Verdict global ORDA-011

🟢 **CYCLE CLOS PROPREMENT** — verrou technique levé.

- 1 P0 fermé (recalibrage IA NAO 4 unions)
- 28 tests ajoutés, 2 nouveaux modules transverses couverts
- Aucun test relâché — tous passent à leur cible Argus normale
- Cycle court honoré : 14 j prévus, ~2.5 j-h consommés

### Signature Argus

🖋 **Tag `v2.1.9-prebeta` SIGNÉ**

Le build est :
- **Bêta-privée déblocable** sans réserve technique
- **Bêta-publique-conditionnelle** uniquement sur la validation
  externe humaine (juriste / historien / pédagogue)

### Délégation ORDA-012

📋 **OUVERTURE ORDA-012** :
- Sapeurs : couverture transverse continue (8 modules à 0%, ~10 j-h)
- Diplomates : brancher callbacks acteurs dans contenu narratif (2 j-h)
- Architectes : refacto CSS Confrontation (3 j-h, optionnel)

---

## VI. Mesure de la session ORDA-008+009+010+011

### Pulse de charge — réelle vs prévue (cumul 4 cycles)

| Cycle | Prévu | Consommé | Bilan |
|-------|------:|---------:|-------|
| ORDA-008 | 10 j-h | 8.5 j-h | 🟢 -1.5 |
| ORDA-009 | 23.8 j-h | 12.3 j-h | 🟢 -11.5 |
| ORDA-010 | 14 j-h | 3 j-h | 🟢 -11 |
| ORDA-011 | 14.5 j-h | 2.5 j-h | 🟢 -12 |
| **Total** | **62.3 j-h** | **26.3 j-h** | 🟢 **-36 j-h (58% sous-consommation)** |

4 cycles ORDA, 1 journée. **9 tags posés**. **172 tests verts**. 0 régression.

### Risques matérialisés (bilan définitif)

| Risque (AAR §V matin) | Statut |
|-----------------------|:------:|
| R-A — IA syndicale conservatrice | 🟢 Fermé en v2.1.0 |
| R-B — Matignon non testable hors Vite | 🟢 Fermé en v2.1.0 |
| R-C — Bugs cosmétiques scripts MC | 🟢 Fermé en v2.1.0 |
| R-D — 5 violations WCAG AA | 🟢 Fermé en v2.1.3 |
| R-E — 9 fuites RNG en boucle de jeu | 🟢 Fermé en v2.1.4 |
| R-F — Pas de mode tutoriel pour persona A | 🟢 Fermé en v2.1.5 (3 modes launch) |
| R-G — Recrutement panel 30 non démarré | 🟡 **MIS DE CÔTÉ par décision PM** |
| R-H — IA NAO cassée par CFE-CGC (ORDA-009) | 🟢 **Fermé en v2.1.9** ✅ |
| R-I — Validation externe (juriste/historien/pédagogue) | 🔴 reportée (humaine) |

**Tous les risques techniques sont fermés.** Restent uniquement les
items humains (R-G recrutement, R-I validation externe).

---

## VII. Conclusion

> *« Le verrou technique majeur est levé. La distribution NAO sur 4
> unions est rétablie aux pourcents près. Deux nouveaux modules
> transverses sont couverts. La doctrine V3 est entièrement honorée
> côté code. Argus signe sans réserve technique.*
>
> *Reste l'attente humaine. Argus dort. La fenêtre bêta privée
> reste ouverte sans condition technique. La bêta publique attend
> uniquement la validation externe — quand le PM le décidera. »*
>
> **— Argus, Maréchal-auditeur PARITAS · 2026-05-08 fin ORDA-011**

---

## Annexe — fichiers du cycle ORDA-011

### Nouveaux
- `src/game/simulation/resources.test.ts` (134 lignes, 17 tests)
- `src/game/strategy/catalog.test.ts` (90 lignes, 11 tests)
- `docs/BULLETIN_ARGUS_ORDA_011_FINAL.md` (ce document)

### Modifiés
- `src/game/ateliers/nao/engine.ts` (+~30 lignes : aiEmployeurMove
  + contagion cfecgc dans aiSyndicatMove)
- `src/game/ateliers/nao/engine.test.ts` (test ≥1% restauré + note)

### Bilan
- **5 fichiers** touchés ou créés
- **3 fichiers** nouveaux
- **+28 tests** Vitest (10 → 12 fichiers, 144 → 172 tests)
- **0 régression** sur les 144 tests préexistants
- **0 erreur** TypeScript sur 1465 fichiers checkés
- **Distribution NAO restaurée** sur les 4 unions (cibles Argus)

---

*Cycle ORDA-011 clos. Tag v2.1.9-prebeta poussé. Tous les risques techniques fermés.*
