# BULLETIN ARGUS — ÉTAT PRÉ-BÊTA
## Maréchal-auditeur · 2026-05-08 (après-midi) · Consolidation post-fixes ORDA-001/005

> Suite au bulletin matinal `BULLETIN_ARGUS_PARTIE_COMPLETE_2026-05-08.md`, les corps ont travaillé. Ce bulletin acte les fixes appliqués, vérifie chaque atelier en MC, et tranche la signature pour la bêta.

---

## I. Récapitulatif des fixes Argus (plan matinal vs réalité)

| # | Action prévue | Effort prévu | Statut |
|---|--------------|-------------:|:------:|
| 1 | Sapeurs : fix imports ESM (matignon) | 1 j-h | ✅ FAIT |
| 2 | Sapeurs : fix script `pts / 48` → `pts / 60` | 0.2 j-h | ✅ FAIT |
| 3 | Diplomates : recalibrage IA CGT (≥1% pv_desaccord) | 1.5 j-h | ✅ FAIT |
| 4 | Géomètres : ajustement pondérations Élections (parite ≤60%) | 2 j-h | ✅ FAIT |
| 5 | Géomètres : investiguer `patron_impose` Grève | 1 j-h | ✅ FAIT |
| 6 | Architectes : trancher plancher Meeting (6 vs 0) | 0.3 j-h | ✅ FAIT (intentionnel, doc) |
| 7 | Stratèges : recrutement panel 30 testeurs | 1 j-h | 🟡 EN COURS (humain) |

**Effort consommé** : 6 j-h sur 6 prévus pour la partie ingénieur. Plan tenu.

**Bonus hors-plan** :
- 🆕 Sapeurs : fix `argus-matignon-play.mjs` — accesseurs outcome incorrects + mauvais argument à `evaluateMatignonLearning`. Le script tournait avec 100% « inconnu » et plantait sur `state.history`. Désormais il rend la même distribution propre que `orda-003-matignon-mc.mjs`.

---

## II. État de chaque atelier (MC ré-exécutées)

### 🟦 1. NAO (10 000 parties) — ✅ ASSAINI

| Outcome | Avant fix (matin) | Maintenant | Cible Argus |
|---------|------------------:|-----------:|------------:|
| accord_majoritaire | 41.8 % | **31.6 %** | ≤ 60 % ✅ |
| accord_partiel | 58.2 % | **44.6 %** | ≤ 60 % ✅ |
| **accord_minoritaire** | **0 %** 💀 | **17.8 %** | ≥ 5 % ✅ |
| **pv_desaccord** | **0 %** 💀 | **6.0 %** | ≥ 5 % ✅ |

- Taux signature CGT : 4.5 % → **3.4 %** (la CGT bloque maintenant, signe quand l'accord est solide).
- Enveloppe moyenne : `60.0 / 60` (label corrigé).
- Diagnostic Argus interne : ✅ Distribution équilibrée · ✅ Tous outcomes atteignables.

### 🟦 2. Élections (10 000 parties) — ✅ ASSAINI

| Outcome | Avant | Maintenant | Cible |
|---------|------:|-----------:|------:|
| salarie_majorite | 18.8 % | **46.5 %** | équilibre |
| patron_majorite | 15.4 % | **41.8 %** | équilibre |
| **parite** | **65.7 %** ⚠ | **11.7 %** | ≤ 60 % ✅ |

Stratégies de canal différenciées :
- terrain : salarié domine (54 %) — *avant : 48 %, neutre*
- réunions : patron domine (57 %) — *avant : 49 %, neutre*
- affiches/tractage : neutres (≈ 50/50)

L'investissement de canal est désormais **diégétiquement lisible** : un joueur qui mise tout terrain remporte vraiment plus de sièges que celui qui éparpille.

### 🟦 3. Grève (10 000 parties) — ✅ STABILISÉ

| Outcome | Avant | Maintenant | Cible |
|---------|------:|-----------:|------:|
| accord_victorieux | 55.2 % | 54.8 % | ≤ 60 % ✅ |
| ouverture_negociation | 16.0 % | 16.3 % | ≥ 5 % ✅ |
| accord_partiel | 13.3 % | ~14 % | ≥ 5 % ✅ |
| echec_greve | 12.6 % | 11.5 % | ≥ 5 % ✅ |
| **patron_impose** | **2.9 %** 🟠 | **6.6 %** | ≥ 5 % ✅ |

Tous les outcomes sont au-dessus du seuil 5 %. Pas d'outcome rare-mais-juste à documenter.

### 🟦 4. Table (10 000 parties) — ✅ STABLE (pas de régression)

`accord_minimal 57.9 %` · `rupture 29.7 %` · `accord_ambitieux 12.4 %`. Conforme bulletin matinal.

### 🟥 5. Matignon — ✅ DÉBLOQUÉ

**Bulletin matinal** : non auditable hors Vite (import ESM cassé) → audit du profil 9 compétences impossible.

**Maintenant** :
- `node scripts/orda-003-matignon-mc.mjs` ✅ tourne en CLI
- `node scripts/argus-matignon-play.mjs` ✅ tourne en CLI (post-fix Sapeurs)

Distribution sur les 36 chemins déterministes :

| Outcome | Chemins | % |
|---------|--------:|--:|
| matignon-1936 (accord historique) | 9 | 25.0 % |
| matignon-delayed | 9 | 25.0 % |
| matignon-under-pressure | 9 | 25.0 % |
| rupture | 9 | 25.0 % |

**Verdict** : distribution parfaitement équilibrée. Aucune route dégénérée. La mécanique des 4×4×4 = 36 chemins fonctionne, et chaque chemin produit un état terminal cohérent.

Profil moyen 9 compétences (sur 36) :

| Compétence | Score moyen |
|-----------|-----------:|
| mandateCraft | 58.0 |
| ethicalClarity | 54.3 |
| conflictTiming | 52.2 |
| legalStrategy | 49.3 |
| tableReading | 49.0 |
| institutionalMemory | 45.7 |
| concessionDesign | 45.3 |
| coalitionBuilding | 43.0 |
| publicNarrative | 43.0 |

Distribution centrée 43–58, écart 15 points : **profil pédagogique différenciable mais non extrême**, ce qui est sain pour un débriefing « voici ta dominante, voici tes angles morts ».

### 🟦 6. Brawl Arena — ✅ AVEC RÉSERVE (inchangé)

Reproductibilité seedée OK. Branche patron retirée (throw ORDA explicite). Scénario-déterministe au-delà du seuil de power : à briefer en amont diégétiquement (pas un bug d'engine).

### 🟦 7. Confrontation (10 000 parties) — ✅ STABLE

`blocage 45.1 %` · `police_victoire 35.5 %` · `manif_victoire 19.4 %`. Conforme. Dette de maintenabilité (986 lignes) à voir en ORDA-006.

### 🟦 8. La Place (10 000 parties) — 🟠 SURVEILLER (hors plan)

| Outcome | Maintenant | Cible |
|---------|-----------:|------:|
| compromis | 45.3 % | ≤ 60 % ✅ |
| victoire | 40.6 % | ≥ 5 % ✅ |
| repression | 12.4 % | ≥ 5 % ✅ |
| **abandon** | **1.8 %** | ≥ 5 % 🔴 |

`abandon` reste sous-cible (1.7 % matin → 1.8 % maintenant). Ce n'était pas dans le plan ORDA-001 mais Argus l'avait signalé. **À traiter en ORDA-006** (Diplomates + Géomètres) — non bloquant pour la bêta dès lors que les 3 autres outcomes sont sains.

### 🟦 9. Manif — ✅ STABLE

Score borné `[0, 100]`, distribution répartie, score moyen 53.9. Clamp effectif. RAS.

### 🟦 10. Meeting — ✅ TRANCHÉ ARCHITECTES

**Décision Architectes** : le plancher 6/100 (vs 0/100 pour Manif) est **assumé narrativement**, pas un bug. Justification documentée dans `src/components/org/MeetingSimulator.svelte:155-165` :

> Un meeting tenu (cost = 8 pts payés) a une présence minimum non nulle. Le 8 représente la « garantie de fait » d'un événement organisé : la salle existe, des gens sont passés, la presse mentionne. Score < 8 sans fuelMul signifierait « personne n'est venu malgré l'organisation », ce qui est sémantiquement faux dès lors que le coût est payé. Le score peut descendre à ~6/100 via fuelMul=0.8.

Verdict : **pas un bug**, asymétrie diégétique entre Manif (action de masse, peut tomber à 0) et Meeting (parole rhétorique, laisse toujours trace).

---

## III. Cohérence de doctrine — révision

| Item de doctrine | Bulletin matin | Maintenant |
|------------------|:--------------:|:----------:|
| RNG seedé partout | 🟠 Arena confirmé | 🟢 Arena + NAO + Élections + Grève + La Place + Manif + Meeting confirmés |
| Pas d'outcome dégénéré (≥5%, ≤60%) | 🔴 5 problèmes | 🟢 1 reste (La Place abandon, hors plan) |
| Reproductibilité hors Vite | 🔴 Matignon non auditable | 🟢 Tous scripts CLI fonctionnels |
| TypeScript check | inconnu | 🟢 **1401 fichiers, 0 erreurs, 0 warnings** |
| Build production | inconnu | 🟢 **build 4.3 s, bundle main 145 KB gzip** |

---

## IV. Décisions de signature

1. **ORDA-001 (NAO + Élections)** : 🟢 **JE SIGNE** l'AAR. Les 4 outcomes NAO sont vivants, la parité Élections est ramenée sous 12%, les stratégies de canaux sont différenciées. Plan matinal exécuté intégralement.

2. **ORDA-002 (Grève + Table)** : 🟢 **JE SIGNE**. `patron_impose` ramené à 6.6 %, Table inchangé sain.

3. **ORDA-003 (Matignon + Arena)** : 🟢 **JE SIGNE**. Matignon désormais auditable hors Vite, 36 chemins équilibrés, profil 9 compétences calculable. Arena Option B actée précédemment.

4. **ORDA-004 (Confrontation + La Place)** : 🟡 **JE SIGNE SOUS RÉSERVE**. Confrontation OK. La Place : `abandon` reste à 1.8 %, à traiter ORDA-006 mais non bloquant bêta (3 outcomes sur 4 sont sains).

5. **ORDA-005 (Manif + Meeting)** : 🟢 **JE SIGNE**. Manif borné, Meeting plancher tranché par Architectes (intentionnel + documenté).

---

## V. Statut bêta

**État technique** :
- ✅ TypeScript : 0 erreur sur 1401 fichiers
- ✅ Build : 4.3 s, bundle main 437 KB raw / 145 KB gzippé
- ✅ Code splitting actif (mini-jeux séparés en chunks 18-33 KB chacun)
- ✅ Audio en chunk séparé (265 KB raw / 68 KB gzip — chargé à la demande)
- ✅ 9 scripts MC CLI exécutables sans Vite
- ✅ 100 tours testés (Léon Jouhaux 100/100, bulletin du 4 mai)
- ✅ PWA installable + tarball offline (commit 69196b3)

**État doctrinal** :
- ✅ 6 fixes Argus appliqués
- ✅ 79 choix narratifs taggés
- ✅ 40 talents (20 par camp)
- ✅ 8 side events historiquement situés
- ✅ Branches camp-only patron sur Matignon
- ✅ Onboarding tour contextuel par mode

**Reste pour bêta** :
1. 🟡 Recrutement panel 30 testeurs (Stratèges, en cours)
2. 🟠 La Place — `abandon` 1.8 % → 5 % (ORDA-006, non bloquant)
3. 🟠 Refacto Confrontation 986 lignes (dette technique, non bloquant)
4. 🟡 Validation externe (juriste, historien, pédagogue) — non commencée
5. 🟡 Couverture moteur Vitest — pas encore mesurée

---

## VI. Conclusion

> *Pré-Conseil ORDA-001 reporté : il n'a pas lieu d'être. Les corps ont exécuté le plan matinal en moins de 6 heures. Cinq ateliers signables sans réserve, un sous réserve mineure (La Place), aucun atelier refusé. Les conditions techniques de la bêta sont réunies : `check` vert, `build` propre, scripts CLI tous fonctionnels.*
>
> *La fenêtre bêta s'ouvre dès que le panel 30 est constitué et qu'au moins une session de validation externe (juriste OU historien OU pédagogue) est planifiée. ORDA-006 prendra La Place et la dette de Confrontation à un rythme calme.*
>
> **— Argus, Maréchal-auditeur PARITAS · 2026-05-08 (après-midi)**

---

## VII. Addendum (après-midi prolongée)

Suite à la signature du bulletin, deux ouvertures ORDA-006 prises **immédiatement** :

### A. La Place — `abandon` ramené dans la zone (Argus seuil ≥ 5 %)

**Diagnostic** : `abandon` à 1.8 % nécessitait 3 reculs consécutifs (probabilité random ≈ 1.56 %). Mathématiquement sous-cible.

**Patch** (`src/game/ateliers/laplace/engine.ts:382-401`) : élargissement de `resolveOutcome` pour intégrer un décrochage diégétique « mouvement essoufflé » : 2 reculs cumulés + foule mince (< 35) → `abandon`. Foule effondrée (< 20) reste l'autre voie.

**Mesure post-patch** (10 000 parties random) :

| Outcome | Avant (matin) | Après patch | Cible |
|---------|--------------:|------------:|------:|
| victoire | 40.6 % | 40.7 % | ≤ 60 % ✅ |
| compromis | 45.3 % | 39.3 % | ≤ 60 % ✅ |
| repression | 12.4 % | 12.7 % | ≥ 5 % ✅ |
| **abandon** | **1.8 %** 🔴 | **7.3 %** | ≥ 5 % ✅ |

Diagnostic interne : ✅ Distribution acceptable · ✅ Tous outcomes atteignables.

### B. Vitest installé — couverture moteur démarrée

**Réponse à la question ouverte du bulletin matinal** : « Couverture moteur réelle (Vitest) : un rapport est-il disponible ? »

**État** :
- `vitest@4.1.5` + `@vitest/coverage-v8` installés
- `vitest.config.ts` créé (environment node, includes `src/game/**/*.test.ts`)
- Scripts npm : `test`, `test:watch`, `test:coverage`
- Premiers fichiers de tests sur les modules critiques :

| Fichier | Tests | Couverture |
|---------|------:|-----------|
| `src/game/ateliers/laplace/engine.test.ts` | 11 | invariants, 10k random distribution, V2 effects mapping |
| `src/game/ateliers/nao/engine.test.ts` | 14 | constantes (TOTAL_ENVELOPPE = 60), math, willUnionSign, retrait |
| `src/game/negotiation/matignon.test.ts` | 11 | invariants, 36-paths simulation, 9 skills, replay log |

**Résultat** : `Test Files 3 passed · Tests 36 passed · Duration 309ms`

**Cohérence de doctrine — révision (2)** :

| Item | Bulletin matin | Après-midi |
|------|:--------------:|:----------:|
| Couverture moteur ≥ 80 % | inconnue | 🟡 démarrée — 36 tests, 3 modules critiques couverts |
| Pas d'outcome dégénéré (≥5%, ≤60%) | 🔴 5 problèmes | 🟢 **0 reste** (La Place fixée) |

### C. Statut final pré-bêta

- ✅ TypeScript : 1453 fichiers, 0 erreur, 0 warning
- ✅ Build : 4.26 s, bundle inchangé (145 KB gzip main)
- ✅ Tests : 3 fichiers, 36 tests verts en 309 ms
- ✅ 9 ateliers : tous outcomes ≥5%, ≤60%
- ✅ Matignon CLI auditable + 36 chemins équilibrés
- 🟡 Refacto Confrontation 986 lignes (dette, non bloquant)
- 🟡 Validation externe (juriste/historien/pédagogue) — non commencée
- 🟡 Recrutement panel 30 — humain, non bloquant pour milestone code

> *La fenêtre bêta est ouverte côté code. Plus aucun outcome rare ni dégénéré, plus aucun script CLI cassé, premiers tests Vitest verts. Tag à poser : **v2.1.0-prebeta**.*
>
> **— Argus, Maréchal-auditeur PARITAS · 2026-05-08 (après-midi prolongée)**

---

## Annexe : commande de reproductibilité

```bash
cd paritarisme-svelte
npm run check                                       # 0 errors expected (1453 files)
npm run build                                       # 4-5 s expected
npm test                                            # 36 tests pass < 1s
node scripts/orda-001-nao-mc.mjs                    # 4 outcomes ≥6%
node scripts/orda-001-elections-mc.mjs              # parité ≤12%
node scripts/orda-002-greve-mc.mjs                  # patron_impose ≥5%
node scripts/orda-002-table-mc.mjs                  # 3 outcomes ≥12%
node scripts/orda-003-matignon-mc.mjs               # 36 paths, 4 outcomes 25% chacun
node scripts/argus-matignon-play.mjs                # 9 compétences calculées
node scripts/orda-003-arena-mc.mjs                  # 4 scénarios déterministes
node scripts/orda-004-confrontation-mc.mjs          # 3 outcomes ≥19%
node scripts/orda-004-laplace-mc.mjs                # abandon ≥5% (post-patch)
node scripts/orda-005-manif-meeting-bornes.mjs      # bornes [0-100] et [6-100]
```
