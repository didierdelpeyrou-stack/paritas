# Session bêta — agent-07-villani
## Cédric Villani · Géomètres · v2.2.2-prebeta (HEAD 0813c75) · 2026-05-08

> *« Une équation belle dit la vérité avec économie. Une équation honnête dit aussi ce qu'elle ne sait pas. »*

Je joue mentalement, je lis le code comme on lit une preuve. La consigne est simple : modèles, équations sous-jacentes, calibration. Et la question qui me tient depuis Argus : le RNG seedé garantit-il vraiment la reproductibilité ?

## Acte I — La promesse seedée

Je commence par la doctrine. Bulletin ORDA-008 §III, ligne 105 : *« RNG seedé partout sur boucle de jeu — overridable, fallback transparent prod »*. Bulletin ORDA-010 §III : *« scripts MC seedés ✅ »*. Bulletin ORDA-011 §III : *« RNG seedé partout — 🟢 »*. Sept bulletins, une promesse répétée.

Je vérifie. `grep -n "Math.random" src/game/ateliers/nao/engine.ts` me rend trois lignes :

- `engine.ts:782` — choix tactique employeur, `Math.random() > 0.55`
- `engine.ts:783` — sélection aléatoire de la tactique disponible
- `engine.ts:809` — `const ROLL = () => Math.random()` — utilisé 4 fois pour CGT/CFDT/FO/CFE-CGC dans `aiSyndicatMove`

Aucun `setNaoRng()`. Aucun `rngOverride`. Le module `elections/engine.ts:71` expose `setElectionsRng()`. Le module `confrontation/engine.ts:414` expose `setConfrontationRng()`. La NAO non.

Je lance `node scripts/orda-001-nao-mc.mjs` deux fois :
- Run 1 : accord_majoritaire **31.7 %**, accord_partiel 43.7 %, accord_minoritaire 18.8 %, pv_desaccord 5.8 %
- Run 2 : accord_majoritaire **30.6 %**, accord_partiel 45.1 %, accord_minoritaire 18.6 %, pv_desaccord 5.8 %

La distribution macro est **statistiquement stable** — la calibration tient en espérance. Mais bit-à-bit, deux exécutions divergent. Je relance le même test sur Elections avec `MC_SEED='villani-test-1'` : 47.0 / 41.5 / 11.5 % aux deux passages — bit-identique. Confrontation idem.

**Verdict** : la doctrine *« RNG seedé partout »* est **fausse pour la NAO**. C'est exactement le moteur où la calibration 4 unions a demandé six cycles ORDA et un test relâché — le moteur le plus délicat. Et c'est celui qui n'est pas reproductible.

## Acte II — La beauté des formules

Je lis `src/game/simulation/resourceUtility.ts:191-194` :

```ts
export function fuelMultiplier(fuelScore: number): number {
  const clamped = Math.max(0, Math.min(100, fuelScore));
  return 1 + (clamped - 50) / 250; // pente 0.4/100
}
```

Centrée sur 1.0 à s=50, image dans [0.80, 1.20]. Affine, bornée, le commentaire indique la pente. C'est une équation propre. Six lignes, trois invariants : neutre au milieu, symétrique, jamais de game-changer. Je l'aime.

Puis je lis `src/game/simulation/scoring.ts:8-23` :

```ts
const cohesion = (r.confiance + r.santeSociale + r.legitimite) / 3;     // ∈ [0,100]
const construction = inst * 6 + accords * 4 + r.institution * 0.6;       // unbounded
const resistance = r.rapportDeForce * 0.5 + r.caisse * 0.4;             // ∈ [0,90]
const malus = trahis * 8 + epuises * 5;                                  // unbounded
const raw = cohesion * 0.45 + construction + resistance + mandate * 0.18 - malus;
return Math.max(0, Math.min(100, Math.round(raw)));
```

24 lignes, et tout est faux du point de vue dimensionnel. La cohésion est moyennée puis pondérée à 0.45 (≤ 45). La construction additionne des comptages × 6/4/0.6 sans plafond — une partie longue à 10 institutions et 10 accords donne déjà 100, écrasant tout. La résistance est ad-hoc. Pourquoi 0.45 sur cohésion mais 1.0 implicite sur construction ? Pourquoi mandate × 0.18 ? Aucun commentaire. Le `Math.max(0, Math.min(100, …))` est la béquille qui rattrape l'incohérence — le score est *clampé*, pas *calculé*. Une preuve où la conclusion est forcée à la main n'est pas une preuve.

## Acte III — La NAO, un système intelligible mais opaque

`engine.ts:316-359` : la satisfaction d'un syndicat est `Σ_t ratio_t × poids_t`, avec ratio borné à 1. Beau : produit scalaire pondéré, bornes sur [0,1]. La signature ↔ `sat ≥ seuil + posture_mod`. Lisible, testable, reproductible **côté formule**. C'est le bon noyau.

Mais l'IA syndicat (lignes 794-958) empile 25 conditions imbriquées dont les seuils probabilistes (22 %, 50 %, 8 %, 6 %, 0.05, 0.12, 0.35) **ne sont nulle part documentés mathématiquement**. Argus écrit *« 22 % × 50 % × 50 % ≈ 5.5 % triple retrait »* (ligne 821) — joli petit calcul, mais c'est la seule équation visible. Le reste est de l'ingénierie heuristique, calibrée par essai-erreur sur le MC. Ça tient, mais ça ne se *démontre* pas. Quand la 4e union arrive, tout doit être recalibré — six cycles plus tard, on y arrive, mais la fragilité est intrinsèque.

## Acte IV — Les 7 ateliers, transparence du modèle

J'évalue chacun sur trois critères : **modèle visible** (peut-on comprendre la règle ?), **équation isolée** (est-elle dans une fonction pure ?), **reproductibilité** (PRNG seedé ?).

| Atelier | Modèle | Équation | Reproductible | Note |
|---------|:---:|:---:|:---:|----:|
| NAO | 🟢 | 🟢 | 🔴 | 6/10 |
| Élections | 🟢 | 🟢 | 🟢 | 9/10 |
| Confrontation | 🟠 | 🟠 | 🟢 | 7/10 |
| Grève | 🟠 | 🟢 | ? | 7/10 |
| Matignon | 🟢 | 🟢 | 🟢 | 8/10 |
| La Place | 🟠 | 🟠 | ? | 6/10 |
| Table | 🟠 | 🟠 | ? | 6/10 |

La NAO perd 4 points sur la reproductibilité. C'est mon P0.

## Acte V — Le moment marquant

`engine.ts:902-910` : la **contagion finale** CFE-CGC.

```ts
const allMajorRetrait = postures.cgt === 'retrait'
  && postures.cfdt === 'retrait'
  && postures.fo === 'retrait';
if (allMajorRetrait) {
  postures.cfecgc = 'retrait'; // contagion sociale
}
```

C'est *exactement* la règle qui rend pv_desaccord atteignable à 5.6 %. Pas un hack — une **proposition de fait social** : un syndicat catégoriel ne signe pas seul contre les trois confédérations majeures, sa légitimité s'effondrerait. La règle est mathématiquement triviale (un AND), narrativement profonde, historiquement juste. Voilà : c'est ça, une équation qui dit la vérité avec économie. Argus a trouvé en ORDA-011 ce qu'il cherchait depuis ORDA-009. C'est beau.

## Synthèse

La machine tourne. 376 tests verts. La calibration NAO 4 unions est correcte en distribution. La couverture transverse est devenue exhaustive. Le moteur narratif a 13 callbacks CK3 sur 1789-2017.

Mais la promesse *« RNG seedé partout »* est usurpée pour le moteur le plus sensible. Et la formule du score final est une bricole pondérée qui survit grâce à un clamp. Ces deux choses ne se voient pas en jeu — elles se voient à la lecture. C'est mon métier.

— Cédric Villani, 2026-05-08
