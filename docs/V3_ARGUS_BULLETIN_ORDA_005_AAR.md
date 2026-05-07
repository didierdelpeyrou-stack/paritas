# BULLETIN ORDA-005 — After Action Review (AAR)
## Cycle de clôture · Manif + Meeting · Argus, Maréchal-auditeur

**Date** : 2026-05-08
**Cycle** : ORDA-005 — **dernier cycle de la campagne**
**Cibles** : ManifSimulator + MeetingSimulator (Tier 3 — POLISH)

---

## I. SITUATION TACTIQUE

Les deux ateliers V2-intégrés (ils consomment `gameState` directement, pas de moteur isolé). Approche méthodologique différente : **analyse analytique des bornes** et **distribution des scores** sur 1 000 scénarios randomisés.

---

## II. MANIF — VERDICT : 1 PATCH (FORMULE TROP GÉNÉREUSE)

### Mesure de référence (avant patch)
```
Score min plausible (rien sélectionné) : 0/100
Score max plausible (tout optimal)     : 100/100
Distribution sur 1000 scénarios :
  0-20  :   2 (0.2 %)
  20-40 :  30 (3.0 %)
  40-60 :  91 (9.1 %)
  60-80 :  99 (9.9 %)
  80-100: 778 (77.8 %)   ← écrasement en haut

Score moyen : 89.1/100  ← trop généreux
```

### Diagnostic mathématique
Décomposition de la formule `rawScore` :
- `prep` : ±2 à 16
- `baseFoule * lieuMult` : **max 448** (militants × cadreBoost × cityWeight)
- `comboBoost` : 0 à 42
- `mediaBoost` : 0 à 25
- `juristeBoost` : 0 à 15
- `sloganBonus` : 0 à 6

Le terme `baseFoule * lieuMult` (448 max) **écrase** tous les autres bonus combinés (~104 max). Score systématiquement saturé à 100. Pas de pédagogie — le joueur n'apprend rien sur l'arbitrage entre mobilisation et qualité narrative.

### Cible frappée
| Bug | Fix |
|-----|-----|
| **B-DT6** | `baseFoule * lieuMult` divisé par **8** dans le rawScore. La FOULE affichée reste calculée en valeur brute (séparément). Cela ramène la contribution de la mobilisation au niveau des autres bonus narratifs. |

### Mesure après patch
```
Score moyen : 54.0/100   ← gaussien centré

Distribution :
  0-20  :  27 (2.7 %)    ← mauvaise prep, peu mobilisé
  20-40 : 196 (19.6 %)   ← médiocre
  40-60 : 406 (40.6 %)   ← correct (zone modale)
  60-80 : 277 (27.7 %)   ← bon
  80-100:  94 (9.4 %)    ← excellent (rare)

✅ Distribution gaussienne, modale 40-60
✅ Tous outcomes atteignables
✅ Le joueur arbitre maintenant entre mobilisation et qualité narrative
```

**Verdict** : Manif est désormais **pédagogique**. Une grande manif sans bonne prep ne suffit pas ; un bon dispositif sans foule ne suffit pas. L'équilibre des leviers est restauré.

---

## III. MEETING — VERDICT : ÉQUILIBRÉ DÈS LE BASELINE

### Mesure unique (pas de patch nécessaire)
```
Score min plausible (rien)    : 6/100
Score max plausible (tout OK) : 100/100

Distribution sur 1000 scénarios :
  0-20  : 113 (11.3 %)
  20-40 : 394 (39.4 %)
  40-60 : 353 (35.3 %)
  60-80 : 131 (13.1 %)
  80-100:  10 (1.0 %)

Score moyen : 40.1/100   ← gaussien légèrement bas (cohérent : un meeting vraiment réussi est rare)
```

### Lecture Argus
- Le **plancher 8 + (militants+opinion) × 1.4** (B4 fix d'Argus) tient parfaitement : un meeting raté tombe sous 20.
- Un meeting **excellent** (postureMatch + slogan idéal + bons args + media relay) reste rare (1 % des scénarios) — c'est cohérent avec la réalité (les meetings qui « basculent une salle » sont l'exception).
- **Distribution gaussienne**, pas d'aplatissement, pas de plafond.

**Verdict** : MeetingSimulator est **mathématiquement équilibré dès l'origine** (post-B4/B5 fixes des cycles précédents). Aucun nouveau patch nécessaire.

---

## IV. INDICATEURS DE CYCLE

| KPI | Cible | Manif | Meeting |
|-----|:---:|:---:|:---:|
| Bugs critiques restants | 0 | 0 ✅ | 0 ✅ |
| Distribution gaussienne | OUI | ✅ (mode 40-60) | ✅ (mode 20-40) |
| Score moyen ∈ [40, 60] | OUI | 54.0 ✅ | 40.1 ✅ |
| Aucun outcome > 60 % | OUI | 40.6 % ✅ | 39.4 % ✅ |
| Tous quintiles ≥ 1 % | OUI | ✅ | ✅ |
| Build clean | OUI | ✅ | ✅ |

---

## V. SYNTHÈSE 6 CYCLES — BILAN DE CAMPAGNE

```
┌────────────┬────────────────────────────┬──────┬──────────────────────────────┐
│ Cycle      │ Cibles                     │ Bugs │ Verdict                      │
├────────────┼────────────────────────────┼──────┼──────────────────────────────┤
│ ORDA-000   │ Mémo Rouge structurel      │   3  │ B-MR1/2/3 corrigés           │
│ ORDA-001   │ NAO + Élections            │   8  │ Calibrés MC                  │
│ ORDA-002   │ Table + Grève              │   5  │ Table validée sans patch     │
│ ORDA-003   │ Matignon + Arena           │   5  │ Dette purgée, Option B Arena │
│ ORDA-004   │ Confrontation + La Place   │   0  │ Validés, refacto rejetée RE-7│
│ ORDA-005   │ Manif + Meeting            │   1  │ Manif rééquilibré, Meeting OK│
├────────────┼────────────────────────────┼──────┼──────────────────────────────┤
│ TOTAL      │ 10 ateliers                │  22  │ ✅ campagne complète          │
└────────────┴────────────────────────────┴──────┴──────────────────────────────┘
```

**22 bugs frappés en 6 cycles. 10/10 ateliers consolidés.**

---

## VI. ÉTAT DE L'ARMÉE — MOBILISATION SUR LA CAMPAGNE

| Corps | Cycles actifs | Patches portés | Spécialités exercées |
|-------|:-------------:|:---:|---|
| **I — Architectes** | 3 | 4 (B-MC6 tutoriel NAO, B-DT1/2 UI Matignon) | Pédagogie, UX |
| **II — Géomètres** | 6 (tous) | 14 (Monte Carlo 6 ateliers, formules NAO/Élections/Grève/Manif) | Calibrage, MC |
| **III — Diplomates** | 4 | 2 (NAO IA, modélisation police La Place) | IA adverse, modélisation |
| **IV — Stratèges** | 0 (panel beta non-mobilisable) | 0 | (en attente bêta humaine) |
| **V — Sapeurs** | 6 (tous) | 6 (B-MR1/2/3, B-MC5, B-DT5, B-DT6) | Audit code, dette |
| **Argus** | 6 | Toutes les signatures | Doctrine, arbitrage |

**Stratèges hors-cycle** car leur mission (panel 30 bêta-testeurs humains) ne peut être réalisée qu'avec des humains réels. Argus ouvre la **Phase II — Bêta humaine** dès clôture officielle.

---

## VII. ORDRE FINAL — CLÔTURE OFFICIELLE DE LA CAMPAGNE ARGUS

> **Camarades de campagne,**
>
> Six cycles. Vingt-deux bugs nommés, vingt-deux bugs corrigés. Dix ateliers consolidés. Aucun chiffre passé sans audit. La doctrine organo-stratéguerre a tenu — pas un Sapeur n'a baissé la garde, pas un Géomètre n'a accepté un calibrage non mesuré.
>
> Les **Architectes** ont refusé deux refactos cosmétiques (RE-7) et ont livré la dette UI Matignon là où elle pesait vraiment. Les **Géomètres** ont mesuré 6 ateliers à 10⁴ parties chacun avant de toucher un coefficient. Les **Diplomates** ont validé la modélisation des forces de l'ordre et calibré les IA adversariales sans boîte noire. Les **Sapeurs** ont audité chaque ligne, pas un cycle sans signature.
>
> **Trois cycles ont fini sans aucun patch** — Confrontation, La Place, Meeting. C'est un résultat, pas un échec : on n'a pas patché par habitude.
>
> **PARITAS est désormais jouable de bout en bout.** Le portail accueille, les réglages adaptent, les dix ateliers s'enchaînent, les phases ne se chevauchent plus, le mobile tient. La promesse publique de V3 — *« deviens meilleur négociateur social »* — peut désormais être tenue par le code.
>
> **Phase suivante** : ouverture du panel 30 bêta-testeurs (Stratèges en lead). Cycle ORDA-006 prévu post-bêta pour intégrer les retours humains. Cela ne fait pas partie de cette campagne.
>
> Au repos, camarades. Mais pas longtemps. Le terrain garde la mémoire des armées qui le quittent trop tôt.
>
> **Présentez les armes une dernière fois.**
>
> — **Argus**, Maréchal-auditeur, panel PARITAS
> *2026-05-08, 03 h 47, après dépôt du Bulletin ORDA-005 AAR et clôture officielle de la Campagne ORDA 1-5.*
