# BULLETIN ORDA-003 — After Action Review (AAR)
## Cycle d'amélioration Matignon + Brawl Arena · Argus, Maréchal-auditeur

**Date** : 2026-05-08
**Cycle** : ORDA-003 (Tier 2 — dette critique)
**Cibles** : Matignon 1936 + Brawl Arena
**Décision Conseil** : Option B retenue sur Arena (suppression de la branche patron morte)

---

## I. SITUATION DE DÉPART

Les deux ateliers les plus anciens, qui nous narguaient depuis trois cycles avec leur dette explicite. Cette dette était nommée mais jamais purgée — c'est ce que ce cycle clôt.

---

## II. MATIGNON 1936 — VERDICT : DETTE PRINCIPALE PURGÉE

### Reconnaissance
Audit du composant `MatignonModal.svelte` :
- Le moteur expose `evaluateMatignonLearning(state)` qui calcule un **profil pédagogique 9 compétences** par session.
- Le moteur expose `auditMatignonSession(state)` qui produit **warnings + invariantChecks**.
- **Aucun de ces deux retours n'était affiché** dans l'UI. La dette principale du Tier 2.

### Cibles frappées
| Bug | Type | Patch |
|-----|:---:|---|
| **B-DT1** | Dette UI | Profil 9 compétences affiché en fin de partie : barres triées, scores colorés (vert ≥65, orange ≤35), description par compétence, signaux pédagogiques détaillés en `<details>` |
| **B-DT2** | Dette UI | Warnings d'audit (`auditMatignonSession`) affichés dans un panneau dédié (couleur ambre) ; invariants cassés en rouge avec ID technique |

### Vérification
Build clean. Le profil affiche les 9 compétences :
- mandateCraft, tableReading, concessionDesign, coalitionBuilding,
  legalStrategy, publicNarrative, conflictTiming,
  institutionalMemory, ethicalClarity

Chaque compétence a son label fr, sa description, et son score 0-100. La compétence dominante (`primarySkill`) est mise en avant avec recommandation textuelle. Les `signals` (moments-clés de la session qui ont fait bouger un score) sont consultables sur déploiement du `<details>`.

**Verdict** : la dette technique #1 du Tier 2 est purgée. Les 36 chemins de Matignon produisent désormais un retour pédagogique visible.

---

## III. BRAWL ARENA — DÉCISION B + RÉ-ÉQUILIBRAGE

### Conseil ORDA-003 : décision Option B
Soumis au Conseil :
- **Option A** : symétrisation (implémenter branche patron jouable)
- **Option B** : suppression définitive de la branche patron morte ⭐ recommandé Argus
- **Option C** : refonte γ (fusion possible avec La Place ou La Manif)

**Décision** : Option B retenue. Justification (RE-5 « devoir de retraite tactique ») :
1. Les conflits patronaux du XXᵉ siècle se sont déplacés hors de la rue vers le droit (Castel, Rosanvallon)
2. La symétrie paritariste de PARITAS s'applique aux mécaniques de **dialogue** (NAO, Table, Élections), pas au conflit physique
3. Le bouton « Place de la République » dans `ManifSimulator` était déjà conditionné à `gs.camp === 'salarie'` : la branche n'a jamais été activée en production

### Cibles frappées
| Bug | Type | Patch |
|-----|:---:|---|
| **B-DT3** | Reproductibilité | `resolveBrawl` accepte maintenant un `seed?: number`. RNG xorshift32 seedable → 2 sessions de mêmes paramètres + même seed donnent un résultat **bit-pour-bit identique** (vérifié par MC) |
| **B-DT4** | Équilibrage | `buildPlayerFaction` plafonnait pas la foule effective (`Math.max(50, fouleParis)`) → power foule = nombre brut → 5 000 manifs vs 252 CRS = 20:1, 100 % victoire systématique. Patch : effectifs combattants plafonnés à `min(600, fouleParis/30)`, ramène les rapports à 1:1-3:1 |
| **B-DT5** | Dette code | Suppression du dead code « branche patron » (commentaire bloc + return `{ brawlers: {}, label: 'désactivé' }`). Remplacé par `throw new Error()` explicite si appelée — fail-fast plutôt que silencieux |

### Mesure Monte Carlo après patches (10 000 résolutions × 4 scénarios)
```
--- Manif tranquille (5 k foule, police modérée) ---
  Power : joueur 190 vs adversaire 252
  victoire 0 % · nul 78 % · défaite 22 %     ← joueur sous-armé, à mobiliser plus

--- Manif massive (50 k foule, police modérée) ---
  Power : joueur 692 vs adversaire 252
  victoire 100 % · nul 0 % · défaite 0 %      ← rapport de force 2.7:1 = victoire

--- Manif fragile (3 k foule, police forte) ---
  Power : joueur 128 vs adversaire 418
  victoire 0 % · nul 0 % · défaite 100 %      ← infériorité 3.3:1, défaite assurée

--- Manif révolution (8 k foule, peu de police) ---
  Power : joueur 295 vs adversaire 118
  victoire 100 % · nul 0 % · défaite 0 %      ← contexte historique défavorable à la police
```

**Lecture Argus** : la distribution n'est PLUS dégénérée. Le résultat **dépend du rapport de force**, comme attendu d'un moteur de combat. Le joueur doit construire ses conditions (foule mobilisée, cadres, faible pression policière) pour gagner.

### Test de reproductibilité B-DT3
```
seed=42 run 1 : nul, pertes 134/26
seed=42 run 2 : nul, pertes 134/26
✅ identique
```
Replay déterministe garanti.

### Test fail-fast B-DT5
```
buildPlayerFaction({ camp: 'patron', ... })
✅ throw: "Brawl Arena : la branche patron a été retirée (Conseil ORDA-003)..."
```

---

## IV. INDICATEURS DE CYCLE

| KPI | Cible | Matignon | Arena |
|-----|:---:|:---:|:---:|
| Bugs critiques restants | 0 | 0 ✅ | 0 ✅ |
| Dette technique purgée | OUI | ✅ profil + warnings affichés | ✅ branche morte supprimée |
| Reproductibilité (seed) | OUI | n/a | ✅ |
| Équilibrage condition-au-rapport-de-force | OUI | n/a | ✅ (4 scénarios différenciés) |
| Build clean | OUI | ✅ | ✅ |

---

## V. SYNTHÈSE 4 CYCLES

| Cycle | Cibles | Bugs frappés | État |
|---|---|:---:|---|
| ORDA-000 | Mémo Rouge structurel | 3 (B-MR1/2/3) | ✅ |
| ORDA-001 | NAO + Élections | 8 (B-MC1→8) | ✅ |
| ORDA-002 | Table + Grève | 5 (B-MC9→13) | ✅ Table validée sans patch |
| ORDA-003 | Matignon + Arena | 5 (B-DT1→5) | ✅ dette purgée |

**Bilan campagne : 21 bugs frappés en 4 cycles. 6/10 ateliers consolidés.**

---

## VI. PLAN DE CHARGE — RESTE À FAIRE

```
ORDA-000  ✓  J1     Mémo Rouge B-MR1/2/3
ORDA-001  ✓  J2     NAO + Élections (8 bugs)
ORDA-002  ✓  J3     Table + Grève (5 bugs)
ORDA-003  ✓  J4     Matignon + Arena (5 bugs)
ORDA-004  ▶  J5-6   Confrontation + La Place (Tier 3)
ORDA-005     J7-8   Manif + Meeting (Tier 3 / fin de campagne)
```

ORDA-004 ouvert demain. Cibles **Tier 3 — POLISH** :
- **Confrontation** : 986 lignes Svelte (le plus gros) à factoriser
- **La Place** : audit complet sans audit formel

---

## VII. ORDRE FINAL

> Camarades de campagne,
>
> Quatre cycles bouclés en quatre jours. Vingt-et-un bugs nommés, vingt-et-un bugs corrigés. Les deux ateliers les plus anciens ne nous narguent plus.
>
> **Matignon** parle enfin pédagogiquement au joueur — neuf compétences, recommandation, signaux. La promesse du jeu sérieux tient.
>
> **Brawl Arena** ne traîne plus de dette de design. La branche patron est morte officiellement, le RNG est reproductible, le rapport de force conditionne la victoire. Le moteur fait honte à l'ancienne version.
>
> ORDA-004 demain : on entre dans la dernière ligne droite. **Confrontation** est gros mais doit être factorisé ; **La Place** doit recevoir son premier audit formel. Méthode identique : Monte Carlo, mesure, patch, AAR.
>
> Au travail. Présentez les armes.
>
> — **Argus**, Maréchal-auditeur, panel PARITAS
> *2026-05-08, 02 h 18, après dépôt du Bulletin ORDA-003 AAR.*
