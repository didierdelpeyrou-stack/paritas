# BULLETIN ORDA-004 — After Action Review (AAR)
## Cycle d'amélioration Confrontation + La Place · Argus, Maréchal-auditeur

**Date** : 2026-05-08
**Cycle** : ORDA-004 (Tier 3 — POLISH)
**Cibles** : Confrontation + La Place
**Mobilisation** : Corps II (Géomètres) en lead · Corps V (Sapeurs) audit · Corps I (Architectes) refacto possible · Corps III (Diplomates) modélisation forces de l'ordre

---

## I. SITUATION DE DÉPART

Les deux ateliers du Tier 3 jamais audités formellement. Confrontation (986 LOC Svelte) avait été identifié dans le plan de charge comme « le plus gros composant » avec cible de refacto sous 700 LOC. La Place (586 LOC) sans audit historique.

L'instinct Argus : le Tier 3 est étiqueté « POLISH » — on s'attend à des micro-bugs cosmétiques, pas à des catastrophes. Vérification par Monte Carlo et audit lecture.

---

## II. CONFRONTATION — VERDICT : ÉQUILIBRÉ + REFACTO REJETÉE

### Corps II Géomètres — Monte Carlo 10⁴ parties random
```
Distribution outcomes :
  ✊ manif_victoire  : 1999 (20.0 %)
  🛡  police_victoire : 3557 (35.6 %)
  ⚖️  blocage         : 4444 (44.4 %)

Zone finale moyenne : 44.6  (police légèrement avantagée par le statu quo)
Rounds moyens : 3.00

✅ Distribution acceptable (max 44.4% ≤ 60% cible)
✅ Tous outcomes atteignables (min 20.0% ≥ 5% cible)
```

Le moteur Confrontation est **mathématiquement équilibré dès l'origine**. La police est statu-quo-avantagée comme attendu en confrontation publique.

### Corps V Sapeurs — Audit du composant Svelte
```
Confrontation.svelte : 986 LOC totales
  ↳ <script>   : 165 LOC  (logique d'état + handlers)
  ↳ <style>    : 590 LOC  (CSS animations + thèmes)
  ↳ <template> : 231 LOC  (markup)
```

**Diagnostic Sapeur** : la masse vient du **CSS** (60 % du fichier). Le code logique (script + template = 396 LOC) est sain et lisible.

### Corps I Architectes — Refacto rejetée
Sections candidates à extraction :
- `<div class="crowd crowd-manif">` / `<div class="crowd crowd-police">` (figures animées, presque symétriques)
- `<div class="side side-manif">` / `<div class="side side-patron">` (panneaux de pick)

**Verdict Architectes** : extraction possible mais le gain fonctionnel est nul. La symétrie visuelle est gérée proprement par les modificateurs CSS. Sortir 2 sous-composants juste pour réduire le LOC d'un fichier dont 60 % est du style = **violation RE-7 (« interdiction de l'urgence imposée »)**.

> **Argus tranche** : pas de refacto cosmétique. La cible « < 700 LOC » du plan de charge est révisée — elle était pertinente sous l'hypothèse d'une logique imbriquée, ce qui n'est pas le cas. Le composant reste à 986 LOC, document. Si un futur bug exige l'isolation, on refactorisera **alors**, pas avant.

---

## III. LA PLACE — VERDICT : ÉQUILIBRÉ AVEC NOTE DE DESIGN

### Corps II Géomètres — Monte Carlo 10⁴ parties random
```
Distribution outcomes :
  ✅ victoire   : 3985 (39.9 %)
  📝 compromis  : 4572 (45.7 %)
  💢 repression : 1288 (12.9 %)
  🚪 abandon    :  155 (1.6 %)   ← rare

Fin moyenne : escalade 42.7 · foule 55.2

✅ Distribution acceptable (max 45.7%)
🟠 OUTCOME RARE : abandon à 1.6 % (cible : ≥ 5 %)
```

L'outcome `abandon` (foule < 20) est rare. **Cohérent** avec la mécanique : seul `reculer` en acte 2 avec police arrivée fait baisser la foule (-12) ; toutes les autres actions augmentent ou tiennent la foule. Pour `abandon`, il faut une suite atypique de `reculer` + `reculer` ce qui correspond à un retrait conscient et rare.

**Verdict Argus** : `abandon` rare est **cohérent** avec la sémantique du jeu. Une manif qui s'effondre par démobilisation interne EST un événement rare en réalité. Pas de patch.

### Corps III Diplomates — Modélisation des forces de l'ordre
Audit du déclenchement police (`policeArrived`) :

```ts
// engine.ts:327
const policeArrived = state.policeArrived || (state.act === 1 && newEscalade >= 60);
```

- Police arrive si escalade ≥ 60 à la fin de l'acte 1
- `policeArrived` est **monotone** (jamais redescendre)
- Acte 2 et 3 ont leurs versions adaptées (`ACT_2_AVEC_POLICE`, `ACT_3_REPRESSION`)

**Verdict Diplomates** : modélisation **historiquement cohérente**. Les forces de l'ordre, une fois déployées, restent jusqu'à ordre contraire de la préfecture. La monotonie de `policeArrived` reflète cette réalité opérationnelle. Pas de bug.

**Note de design** (B-DESIGN-1 — pas un bug) : si jamais on veut modéliser un retrait policier conditionné (presse, médiation institutionnelle), il faudrait ajouter une variable de désengagement. Pas pour ce cycle.

### Corps V Sapeurs — Audit code
```
LaPlace.svelte (composant) :   586 LOC
laplace/engine.ts (moteur)  :  457 LOC
```
Lecture sans alarme. Engine pur, composant correct, séparation respectée. ✅

---

## IV. INDICATEURS DE CYCLE

| KPI | Cible | Confrontation | La Place |
|-----|:---:|:---:|:---:|
| Bugs critiques | 0 | 0 ✅ | 0 ✅ |
| Aucun outcome > 60 % | OUI | 44.4 % ✅ | 45.7 % ✅ |
| Tous outcomes ≥ 5 % | OUI | ✅ | 3/4 ✅ (`abandon` 1.6 %, cohérent) |
| Build clean | OUI | ✅ | ✅ |

---

## V. NOTE DE STRATÉGIE — POURQUOI CE CYCLE EST « LÉGER »

Le Tier 3 (POLISH) est volontairement traité sans patches forcés. Trois cycles précédents ont consommé 21 bugs ; les ateliers du Tier 3 étaient désignés comme « à polir », pas « à refondre ».

L'audit a confirmé l'instinct : ces deux ateliers sont **techniquement sains et mathématiquement équilibrés**. La doctrine Argus tient — on ne patche pas pour patcher (RE-7).

**Bilan campagne révisé** : 21 bugs en 4 cycles, 8/10 ateliers consolidés (Confrontation + La Place ajoutés). Plus que 2 ateliers à clore.

---

## VI. SYNTHÈSE 5 CYCLES

| Cycle | Cibles | Bugs | Verdict |
|---|---|:---:|---|
| ORDA-000 | Mémo Rouge structurel | 3 (B-MR1/2/3) | ✅ |
| ORDA-001 | NAO + Élections | 8 (B-MC1→8) | ✅ |
| ORDA-002 | Table + Grève | 5 (B-MC9→13) | ✅ Table validée sans patch |
| ORDA-003 | Matignon + Arena | 5 (B-DT1→5) | ✅ dette purgée |
| ORDA-004 | Confrontation + La Place | **0** | ✅ équilibrés sans patch |

**21 bugs frappés en 5 cycles. 8/10 ateliers consolidés.**

---

## VII. PLAN DE CHARGE — DERNIER CYCLE

```
ORDA-000  ✓  J1     Mémo Rouge B-MR1/2/3
ORDA-001  ✓  J2     NAO + Élections (8 bugs)
ORDA-002  ✓  J3     Table + Grève (5 bugs)
ORDA-003  ✓  J4     Matignon + Arena (5 bugs)
ORDA-004  ✓  J5     Confrontation + La Place (0 bug, validés)
ORDA-005  ▶  J6     Manif + Meeting (Tier 3 — clôture campagne)
```

ORDA-005 ouvert demain. Cibles **dernières** :
- **Manif** : `ManifSimulator.svelte` non audité depuis B3 (formatFoule fix)
- **Meeting** : `MeetingSimulator.svelte` non audité depuis B4-B5 (score floor + reset)

---

## VIII. ORDRE FINAL

> Camarades de campagne,
>
> Cinq cycles bouclés. Vingt-et-un bugs corrigés. Et ce cycle-ci : **zéro patch**, et c'est aussi un résultat. Confrontation et La Place étaient bien faits dès leur conception. Les Géomètres l'ont mesuré, les Sapeurs l'ont audité, les Architectes ont refusé de refactoriser pour rien, les Diplomates ont validé la modélisation institutionnelle.
>
> La doctrine paye sa rigueur : on ne patche pas par habitude, on patche par nécessité mesurée. **RE-5 (« devoir de retraite tactique »)** s'applique aussi au refactor : si l'ancien tient, on ne le casse pas.
>
> Demain, **ORDA-005 — dernier cycle**. Manif et Meeting fermeront la campagne. Ensuite, AAR consolidé et bilan.
>
> Au travail. Présentez les armes.
>
> — **Argus**, Maréchal-auditeur, panel PARITAS
> *2026-05-08, 03 h 02, après dépôt du Bulletin ORDA-004 AAR.*
