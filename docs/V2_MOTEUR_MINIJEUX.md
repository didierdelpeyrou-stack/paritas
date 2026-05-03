# Paritas V2 — Moteur d'orchestration des mini-jeux

Document de design + spec d'implémentation. Décrit comment les
17 mini-jeux/actions (Trésorerie, Manifestation, Meeting, Tracts,
Affiches, Pétition, Délégation, Signature, Recrutement, Lock-out,
Boycott, Presse, Congrès, Table, Organisation, Talents, Monde)
s'orchestrent en une boucle de gameplay cohérente.

Vague β — squelette MVP livré dans `src/lib/orchestrator/`.

---

## 1. Principe

Chaque tour, le joueur peut déclencher **1 à 3 actions** parmi un
catalogue de 17. Chaque action :

- **Coûte** des ressources (Caisse, Mandat, temps, parfois Talents)
- **Produit** des effets garantis (deltas sur les jauges principales)
- **Risque** un échec avec proba (effets fail différents)
- **A** un cooldown (réutilisable après N tours)
- **A** des préconditions (déverrouillée à partir de tour X, exige
  un camp particulier, un flag posé, etc.)
- Peut **ouvrir un mini-jeu détaillé** (drawer cockpit ou popup
  séparée pour la Table)

---

## 2. Catalogue d'actions (17)

Regroupées en 5 catégories sémantiques, chacune avec son icône
SVG paritaire (palette laiton + couleur d'accent) :

### 2.1 Mobilisation (4 actions)
- **Manifestation** — `poing`, accent orange `#D9821C`. Coûteux
  (15F, 8 mandat, 2 temps), forte action sur rapport de force et
  visibilité. Ouvre `ManifSimulator`. Cooldown 4 tours.
- **Meeting** — `pupitre`, accent pourpre `#5C2D5C`. Discours public
  800-3000 personnes, gain Confiance + Légitimité. Ouvre
  `MeetingSimulator`. Cooldown 3 tours.
- **Tracts** — `tract`, accent sépia. Action courte (3F, 1 mandat,
  1 temps), petits gains durables. Cooldown 1 tour.
- **Affiches** — `affiche`, accent rouge brique. Campagne 6F + 2
  mandat, gain Légitimité + pression sur Opinion.

### 2.2 Institutionnel (4 actions)
- **La Table des Négociations** — `balance`, accent doré. Ouvre la
  popup séparée (V2-3 Sécu 1945). Coût 15 mandat, 3 temps. Cooldown
  8 tours. **Geste lourd, dispo dès tour 18**.
- **Signature** — `signature`, accent cire rouge. Geste manuscrit
  qui ratifie un accord. +12 Légitimité, +15 Institution. Pose
  flag `accord_signe`. Cooldown 5 tours.
- **Délégation** — `delegation`, accent bleu. Trois représentants
  au pouvoir. Coût 10F + 6 mandat, gain Légitimité + Institution +
  trust État. **Risque échec 25 %** (antichambre).
- **Congrès interne** — `urne`, accent rouge syndical. Présenter
  ton mandat à 8 délégations. Coût 25F + 5 mandat. Renouvellement
  ou défaite. Cooldown **24 tours** (1× par mandat).

### 2.3 Finance / RH (3 actions)
- **Trésorerie** — `sceau`, accent or. Allouer le budget annuel
  (cooldown 12 tours). Ouvre `TreasuryPanel`.
- **Recrutement** — `recrutement`, accent vert. Bureau ouvert,
  démarchage usine. Gain Confiance + Cohésion interne.
- **Lock-out** — `lockout`, accent acajou. **Patron-only**.
  Ferme l'usine. Coûteux (35F, 18 mandat) mais +20 Rapport de force
  contre l'adversaire.

### 2.4 Communication (3 actions)
- **Presse** — `presse`, accent pourpre. Article dans Le Monde /
  L'Humanité. +Légitimité + Confiance. Risque censure 15 %.
- **Pétition** — `petition`, accent sépia. Faire signer.
  Ouvre `petition` minigame.
- **Boycott** — `boycott`, accent rouge sang. Geste fort, risque
  social. **Risque échec 30 %** (s'essouffle).

### 2.5 Organisation (3 actions)
- **Aménager le siège** — `bourse`. Pièce supplémentaire (Bureau
  SG, Imprimerie, École, Médiathèque, Café militant). Ouvre
  `OrganizationPanel`. +12 Institution.
- **Former un talent** — `cocarde`. École syndicale, +6 Institution
  + 4 Cohésion interne. Ouvre `FormationTalentsPanel`.
- **Déployer une section régionale** — `hexagone`. Carte de
  France + EU. Ouvre futur Monde mini-jeu (vague δ).

---

## 3. Architecture du moteur

### 3.1 Types

`src/lib/orchestrator/types.ts` :

```ts
interface ActionDef {
  id: MiniJeuId | string;
  label, description, icon, accent, category,
  cost: { caisse?, mandat?, temps?, talents? },
  effects: ActionEffect,
  effectsFail?: ActionEffect,
  failProbability?: number,  // 0-1
  cooldown?: number,
  preconditions?: ActionPrecondition[],
  opensMinigame?: MiniJeuId,
  journalTag?: string,
}

interface OrchestratorState {
  turn: number;
  cooldowns: Record<actionId, turnEnd>;
  actionsThisTurn: number;
  maxActionsPerTurn: number;
  history: ActionLog[];
}
```

### 3.2 Engine

`src/lib/orchestrator/engine.ts` expose 4 fonctions pures :

- `canExecute(action, state, orch)` → vérifie cooldown +
  préconditions + coût payable + limite par tour
- `executeAction(action, state, orch, seed)` → tirage seedé
  (succès/échec) + retourne `ActionResult` avec effets à appliquer
- `applyOrchestratorUpdate(orch, action, outcome, effects)` →
  pose le cooldown, incrémente `actionsThisTurn`, append au history
- `resetTurnCounters(orch, newTurn)` → reset à chaque
  `advanceTurn()` du moteur principal

### 3.3 Catalogue

`src/lib/orchestrator/actions.ts` exporte les 17 `ActionDef` +
helpers `actionsByCategory()` / `findAction(id)`.

---

## 4. Intégration au moteur principal

### 4.1 Boucle de tour (proposée)

```
1. State.turn++
2. orchestrator = resetTurnCounters(orch, newTurn)
3. Pose le scénario du tour (currentScenario)
4. Le joueur fait son CHOIX scénario (choice cards de Le Ciel)
   → applique effects via resolveChoice
5. PUIS le joueur peut déclencher 1-2 ACTIONS (orchestrator)
   → bouton "Actions" dans la barre d'action cockpit
6. Quand actionsThisTurn == max OU le joueur passe :
   → advanceToNextScene()
```

L'action ne remplace PAS le scénario : elle s'ajoute. Un tour =
un scénario obligatoire + des actions optionnelles.

### 4.2 UI proposée

**Bouton "Actions" dans CockpitActionBar** (à ajouter) →
ouvre un drawer plein écran "Actions disponibles" avec :

- 5 catégories en colonnes (Mobilisation, Institutionnel, Finance,
  Communication, Organisation)
- Pour chaque catégorie : les actions de cette catégorie sous
  forme de cartes avec icône + nom + coût + effets preview +
  bouton "Exécuter" (disabled si cooldown ou précondition KO,
  avec raison en tooltip)
- Compteur en haut : "Actions restantes ce tour : 1/2"
- Animation nudge au déverrouillage d'une action (halo doré
  comme les onglets)

**Indicateur de cooldown** sur les onglets cockpit existants : le
chiffre du cooldown apparaît en badge si l'action principale du
tab est en cooldown.

### 4.3 Mapping action → mini-jeu existant

| Action | Composant existant | Statut |
|---|---|---|
| Trésorerie | `TreasuryPanel.svelte` | ✅ Wiré |
| Manifestation | `ManifSimulator.svelte` | ✅ Wiré |
| Meeting | `MeetingSimulator.svelte` | ✅ Wiré |
| Organisation | `OrganizationPanel.svelte` | ✅ Wiré |
| Talents | `FormationTalentsPanel.svelte` | ✅ Wiré |
| Table | `TableWindow.svelte` (popup) | ✅ Wiré |
| Tracts | (à créer — squelette inline) | ⏳ |
| Affiches | (à créer — squelette inline) | ⏳ |
| Pétition | (à créer) | ⏳ |
| Délégation | (action sans mini-jeu — narrative) | ⏳ |
| Signature | (geste — animation + cire) | ⏳ |
| Congrès | (mini-jeu Salle du Congrès dédié) | ⏳ vague β |
| Recrutement | (action sans mini-jeu — narrative) | ⏳ |
| Lock-out | (action sans mini-jeu — narrative) | ⏳ |
| Boycott | (action sans mini-jeu — narrative) | ⏳ |
| Presse | (mini-jeu rédaction simple) | ⏳ |
| Monde | (carte régionale — vague δ) | ⏳ |

**6/17 wirés** (les org panels existants). Les 11 autres :
- Soit narratives pures (Délégation, Recrutement, Lock-out,
  Boycott — 1 modal avec texte d'épilogue + effets)
- Soit mini-jeux rapides à créer (Tracts, Affiches, Pétition,
  Presse — vague β, 1-2 j chacun)
- Soit gros mini-jeux dédiés (Congrès, Monde — vague β/δ, 5-7 j)

---

## 5. Reproductibilité (seed)

`executeAction()` utilise `seededRandom(seed, 'action:{id}:T{turn}')`
pour les tirages succès/échec. Reproductible parfait avec le seed
de la partie (`gameState.seed`).

L'export JSON post-partie inclut désormais `orch.history` —
chaque action exécutée est traçable.

---

## 6. Équilibrage initial (à valider en playtest)

**Caisse de départ : 50 F** (tour 1).
**Coûts moyens** : action légère ~3-8 F, action moyenne ~10-20 F,
action lourde ~25-35 F.

**Estimation budget par mandat (24 tours)** :
- 1 Trésorerie / an = 5 budgets dans une partie
- 1 Congrès / mandat ≈ 4-5 dans une partie
- 1 Table / 8 tours ≈ 12 dans une partie
- 1 Manif / 4 tours ≈ 25 dans une partie
- ~10-15 actions courtes par tour, en moyenne 1.5/tour

**Risques d'échec** :
- 5-15 % pour actions courtes (Tracts, Affiches, Recrutement)
- 18-25 % pour actions moyennes (Meeting, Délégation)
- 25-30 % pour actions risquées (Boycott, Congrès)

---

## 7. Roadmap d'implémentation

### Étape 1 — Engine + catalogue (livré)
- ✅ `types.ts` (110 lignes)
- ✅ `actions.ts` (17 actions, 360 lignes)
- ✅ `engine.ts` (canExecute + executeAction + apply, 145 lignes)

### Étape 2 — UI Actions (à faire, ~2-3 j)
- `CockpitActionsDrawer.svelte` — drawer plein écran avec 5
  catégories, cartes d'actions, bouton Exécuter
- Bouton "⚙ Actions" dans `CockpitActionBar`
- Compteur visuel "1/2 actions ce tour"
- Indicateurs de cooldown sur cartes

### Étape 3 — Wiring au gameState (à faire, ~1-2 j)
- Ajouter `orchestrator: OrchestratorState` dans `RebirthGameState`
- Modifier `pickChoice()` pour pas reset les actions du tour
- Ajouter `dispatchAction(id)` dans le store rebirth
- Backward compat dans `load()` pour `orchestrator` absent

### Étape 4 — Mini-jeux narratifs simples (à faire, ~3-5 j)
- Tracts (modal narrative + chiffrage)
- Affiches (drag d'affiches sur boulevard)
- Pétition (compteur signatures temps réel)
- Délégation, Recrutement, Lock-out, Boycott (modal narrative
  + cire/sceau finale)
- Presse (mini-jeu rédaction : titre + 3 angles + chapeau)

### Étape 5 — Mini-jeux dédiés (vague β/γ/δ)
- Congrès "La Salle du Congrès" (mini-jeu Mandat)
- Monde "La Carte" (vague δ)
- Signature (animation + cire de cire)

---

## 8. Principes de design réaffirmés

- **Une action = un coût lisible**. Toujours afficher coût en
  preview (Caisse + Mandat + temps).
- **Effets durables** : chaque action modifie au moins une
  ressource pour ≥ 3 tours.
- **Pas de spam** : cooldowns calibrés pour éviter le clicker.
- **Échec narratif** : effectsFail produit une scène
  d'échec lisible, pas juste un malus chiffré.
- **Reproductible** : tirage seedé (Pineau #65, Duflo #94).
- **Authentique** : pas d'action fantaisie. Toutes ancrées dans
  le répertoire syndical historique français.

---

*Doc à mettre à jour à chaque ajout d'action ou ajustement
d'équilibrage. Si une action devient obsolète parce que le jeu
a évolué, l'archiver avec date + raison.*
