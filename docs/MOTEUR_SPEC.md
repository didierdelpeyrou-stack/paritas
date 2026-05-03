# Paritas — Spécification du moteur de scénarios

Document de référence formelle du moteur. Sert à :
- documenter les **invariants** que le moteur doit préserver (Berry #4) ;
- spécifier les **transitions interdites** entre phases (Knuth #1) ;
- garantir la **reproductibilité** des parties (seed, Pineau #65) ;
- nommer les **non-humains qui circulent** dans les transitions
  (Latour #51) — flags, formulaires, résolutions chiffrées.

Cette spec couvre le moteur V1 actif (`src/game/engine/`) ainsi
que les briques V2 en cours (`src/game/org/`, pipelines, IA monde).
Les éléments futurs sont marqués **(V2)**.

---

## 1. Modèle de données

### 1.1 État de jeu (V1)

`GameState` ([src/lib/types.ts:164-235](../src/lib/types.ts#L164-L235))
contient toutes les variables d'une partie :

- **Identité** : `name`, `camp`, `legendaryId`, `mode`, `difficulty`.
- **Progression** : `turn` (1-100), `era` (0-14).
- **Trois couches de stats** :
  - `skills` (6) : negociation, politique, baratin, production,
    mobilisation, expertise.
  - `resources` (5) : prestige, caisse, soutien, influence, sante.
  - `capitaux` (5) : economique, social, militant, institutionnel,
    symbolique.
- **Mémoire dialectique** : `lastChoiceTag`, `activeTensions`,
  `systemLog`, `flags`, `decisions`, `history`.
- **Méta** : `seed` (12 chars, **vague α**), `honteFierte`
  (caché, **vague α**, Ernaux #99), `ended`.

### 1.2 État de jeu (V2)

`RebirthGameState`
([src/game/types.ts:239-285](../src/game/types.ts#L239-L285))
ajoute :

- **Traits émergents** : `traits`, `dominantTrait`,
  `personalityStress`.
- **Simulation** : `actors`, `organization`, `activeStrategies`,
  `worldAI`, `activePipelines`.
- **Phase de tour** : `phase` (`idle | scene | consequence | ended`).
- **Objectifs** : `objectives`, `objectiveProgress`.

### 1.3 Non-humains qui circulent (Latour #51)

Le moteur fait circuler quatre types de non-humains :

| Non-humain | Circule de … | … vers | Effet |
|---|---|---|---|
| `flag` | `Choice.flag` | `state.flags` | Compteur durable (1, 2, 3+) ; conditionne les scénarios futurs |
| `tag` | `Choice.tag` | `state.lastChoiceTag` + `profilScores` | Détecte le profil de joueur (anarchiste / réformiste / …) |
| `effects` | `Choice.effects` | jauges concernées | Modifications chiffrées avec clamp 0-100 |
| `tension` | `applyChoice` | `state.activeTensions` | Alerte systémique affichée en sidebar |

---

## 2. Invariants

Le moteur **doit toujours** maintenir les invariants suivants. Une
violation = bug critique à fixer immédiatement.

### I-1 — Bornes des jauges
∀ `k ∈ keyof skills ∪ keyof resources ∪ keyof capitaux` :
`0 ≤ state[k] ≤ 100`.

Application : `clamp(n, 0, 100)` à la fin de chaque application
d'effet ([game.svelte.ts](../src/lib/stores/game.svelte.ts)).

### I-2 — Tour monotone croissant
`state.turn` ne décroît jamais en jeu normal. Cas autorisés où il
reste constant : changement de phase d'un même tour
(scene → consequence). Cas interdits : décrémentation ou saut
arrière hors mode debug/replay.

### I-3 — Phase déterministe
`state.phase` (V2) suit la machine d'état de la section 4. Aucune
transition hors-graphe n'est autorisée.

### I-4 — Seed immuable
`state.seed` est posé une fois au démarrage (`start()`) et ne change
plus jusqu'à la fin de la partie. Toute fonction qui appelle
`Math.random()` aujourd'hui devra à terme être migrée vers une PRNG
seedée (Pineau #65, **vague α-suite**).

### I-5 — Mémoire append-only
`state.decisions` et `state.history` sont append-only. Aucune
décision passée n'est modifiée après coup. (Replays = relancer une
partie depuis seed, pas réécrire l'historique.)

### I-6 — Honte/Fierté borné
`0 ≤ state.honteFierte ≤ 100`. Reste **caché** (non rendu en
Sidebar) jusqu'à `state.ended !== false` (révélation EndingReport,
Ernaux #99).

### I-7 — Camp figé
`state.camp` est posé au choix initial et ne change plus. Pas de
défection en jeu V1. (V2 : possible exclusion suite à mini-jeu
Mandat évincé.)

### I-8 — Mode interface ≠ mode mécanique
`state.mode` (`reflechi | compulsif`) influence l'**affichage** des
choix (preview vs voix intérieures). Les **effects** sont
identiques. Switch à tout moment autorisé (Grandin #89).

---

## 3. Phases du tour (V2)

```
idle ──start()──→ scene ──pickChoice()──→ consequence
                                                │
                                                └─advanceToNextScene()─→ scene
                                                                        │
                                                              checkEnding()
                                                                        │
                                                                        ▼
                                                                       ended
```

### 3.1 Transitions autorisées

| De | Vers | Déclencheur |
|---|---|---|
| `idle` | `scene` | `game.start(opts)` |
| `scene` | `consequence` | `game.pickChoice(c)` après résolution |
| `consequence` | `scene` | `game.advanceToNextScene()` (sauf si game over) |
| `consequence` | `ended` | `endingId` détecté en post-consequence |
| `ended` | `idle` | `game.reset()` (nouvelle partie) |

### 3.2 Transitions interdites

- `scene → scene` directement (doit passer par consequence pour
  enregistrer le choix dans `decisions`).
- `consequence → consequence` (un choix = une conséquence).
- `idle → consequence` (pas de conséquence sans scène préalable).
- `ended → scene` (partie finie, on doit reset d'abord).
- Tout retour arrière hors mode debug/replay (cf. I-2).

---

## 4. Résolution d'un choix (V1)

### 4.1 Pipeline

```
pickChoice(choice)
  │
  ├─ 1. resolveChoice(state, scenario, choice)
  │     └─ applique effects (avec clamp)
  │     └─ pose flag si Choice.flag
  │     └─ écrit lastChoiceTag
  │     └─ incrémente profilScores selon tag
  │
  ├─ 2. advancePipelineAfterScenario(next, scenario)  (V2)
  │     └─ avance les pipelines narratifs actifs
  │
  ├─ 3. buildConsequence(next, scenario, choice, prevTrait)
  │     └─ génère le ConsequenceRender (texte, effets, suite)
  │
  ├─ 4. updateOrganization(after)  (V2)
  │     └─ recalcule production passive Caisse / Adhérents
  │
  ├─ 5. checkEndingTriggers(after)
  │     └─ si conditions remplies : ending = X, phase = ended
  │
  └─ 6. persist(after)
        └─ sauvegarde localStorage par slot
```

### 4.2 Effects

Format : `Effects = Partial<Record<StatKey, number>>`. Application
([choiceResolver.ts:24](../src/game/engine/choiceResolver.ts#L24)) :

```
∀ (key, delta) ∈ effects :
  state[key] = clamp(state[key] + delta, 0, 100)
```

Variant `effectsFail` appliqué si tirage de compétence raté
(skillUp + dc).

### 4.3 Flags (durables)

`Choice.flag` est ajouté à `state.flags[name]++`. Les flags sont
des **drapeaux historiques** durables (ex. `signe_matignon`,
`refuse_charte_travail`). Ils conditionnent l'éligibilité de
scénarios futurs via `Choice.req(ctx)`.

---

## 5. Reproductibilité (vague α)

### 5.1 Seed

`state.seed` posé à la création (`makeSeed()` dans
[game.svelte.ts](../src/lib/stores/game.svelte.ts)). Format : 12
caractères dans l'alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
(sans 0, O, 1, I — anti-confusion).

### 5.2 Helper `seededRandom` — disponible

Module [`src/lib/seed.ts`](../src/lib/seed.ts) exporte 4 helpers :

- `seededRandom(seed, scope)` → `() => number` : PRNG xorshift32
  infini, chaque appel rend `[0, 1)`.
- `seededOnce(seed, scope)` → `number` : tirage one-shot.
- `seededPick(seed, scope, arr)` → `T` : sélection uniforme.
- `seededInt(seed, scope, min, max)` → `number` : entier dans
  l'intervalle inclus.

Le **scope** isole les flux : `seededRandom(s, 'rival-name')` et
`seededRandom(s, 'audio-variant')` ont des séquences indépendantes.
Cela évite la cascade où une décision modifie tous les tirages
futurs.

### 5.3 Sources de hasard — état de migration

| Site | Statut | Scope si migré |
|---|---|---|
| `pickRivalName(camp, seed)` ([game.svelte.ts](../src/lib/stores/game.svelte.ts)) | ✅ migré (vague α) | `rival:{camp}` |
| Tirages de compétence (résolution dc) | ⏳ à migrer | (proposé `roll:T{turn}:{skill}`) |
| Sélection de variantes audio (cycle 2) | ⏳ à migrer | (proposé `audio:{era}:{mood}`) |
| Pad random offset (cycle 2) | ⏳ à migrer | (proposé `pad:{padId}`) |

Les sites non-migrés continuent d'utiliser `Math.random()` et **ne
sont donc pas reproductibles**. Le seed reste néanmoins utile pour
la part déterministe de l'état (rival fixe, choix de scénarios
pivots, etc.).

### 5.4 Pourquoi un scope ?

Sans scope, deux tirages séquentiels avec le même seed produisent
des valeurs successives du PRNG : changer un tirage **décale**
tous les suivants (effet papillon). Avec scope :
`seededRandom(seed, 'rival')` est indépendant de
`seededRandom(seed, 'audio')`. Permet de modifier une partie de la
mécanique sans casser la reproductibilité du reste.

### 5.5 Export

Un export JSON anonyme est dispo dans Settings → « Données de
partie » → « Exporter ma partie en JSON ». Format `paritas-export-v1`,
n'inclut **pas** le nom (PII).

---

## 6. Multi-slots (V1)

3 slots indépendants ([gameState.svelte.ts:72-93](../src/game/engine/gameState.svelte.ts#L72-L93)) :

- `paritas_save_v1` (V1, slot unique historique)
- `paritas_rebirth_save_slot_1` (V2)
- `paritas_rebirth_save_slot_2` (V2)
- `paritas_rebirth_save_slot_3` (V2)

Slot actif persisté dans `paritas_active_slot`.

---

## 7. Validation et tests

### 7.1 Vérifications au load

`load()` ([game.svelte.ts:197-215](../src/lib/stores/game.svelte.ts#L197-L215))
applique des **migrations** sur les saves existantes :

- `mode === 'jet'` → `'compulsif'` (legacy).
- `mode === 'expert' | 'perspicacite'` → `'reflechi'`.
- `legendaryId` absent → `null`.
- `seed` absent ou non-string → `makeSeed()` (vague α).
- `honteFierte` absent → `50` (vague α).

### 7.2 Critères d'acceptation vague α

- [ ] Aucune régression sur partie golden-path (5 testeurs).
- [ ] `state.seed` jamais modifié après `start()` (test unitaire).
- [ ] `state.honteFierte` invisible dans Sidebar avant `ended !==
      false`.
- [ ] Export JSON anonyme = pas de `name`, pas de PII.
- [ ] Backward compat : save V1 sans seed/honteFierte se charge
      sans erreur, défauts appliqués.

---

## 8. Évolutions à venir (vagues β-κ)

### Vague β — mini-jeux gestion essentiels
- `state.organization` étendu (Le Siège, Talents).
- Nouveaux flags : `mandat_renouvele`, `urssaf_clean`, etc.

### Vague γ — mini-jeux scénarios solo simples
- `state.flags` + : `coalition_declaree_1864`, `voix_dominante_95`,
  `mitbestimmung_traduit`.

### Vague δ — Organisation + Monde
- `state.organization.localSections` activé.
- `state.worldMap` : couverture régions + accords EU.

### Vague ε — mini-jeux différés (1940 → 1944, 1995 → 2008)
- Système de **dette mémorielle** : un flag posé au tour T se
  déclenche au tour T+N (Bateson #104 double-bind). Spec dédiée à
  rédiger.

### Vague ζ — La Table des Négociations
- Nouvelle `NegotiationState` (cf. doc V2_AVIS_MINIJEUX_TABLE.md).
- Communication WebSocket via Cloudflare Durable Objects.

### Vague α-suite — PRNG seeded global
- `seededRandom(seed, scope)` exporté de `src/lib/seed.ts`.
- Migration de tous les `Math.random()` vers cette source.

---

## 9. Références panel

Liens entre invariants et personas du panel
([PANEL_202_PERSONAS.csv](PANEL_202_PERSONAS.csv)) :

| Invariant / spec | Personas-source |
|---|---|
| I-3 phase déterministe | Knuth #1, Berry #4 |
| I-4 seed immuable | Pineau #65, Doudna #156, Duflo #94 |
| I-5 mémoire append-only | Wiener #101, Bateson #104 |
| I-6 Honte/Fierté caché | Ernaux #99 |
| I-8 mode interface ≠ mécanique | Grandin #89 (a11y) |
| Loi de variété (V2) | Ashby #107 (« 7 leviers pour 6 ressources ») |
| Cohésion interne (V2) | Omnès #88 (split Force int/ext) |
| VSM identité (V2) | Beer #103 (« niveau 5 ignoré ») |
| Boucles causales viz (V2) | Wiener #101 |

---

*Doc maintenue par chaque vague — mettre à jour au fur et à mesure
des changements moteur. Si un invariant devient obsolète, l'archiver
dans une section « Invariants retirés » avec date et raison.*
