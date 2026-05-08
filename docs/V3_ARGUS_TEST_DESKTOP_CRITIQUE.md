# BULLETIN — Test desktop critique du jeu principal
## Argus, Maréchal-auditeur · 2026-05-08
### Mode : Théâtre Cockpit · viewport 1440 × 900 · regard tatillon

> *« Le user m'a demandé d'être très critique. C'est ma deuxième nature. Voici ce que j'ai vu. »*

---

## I. Méthode

- Serveur : `npm run dev` sur port 59246
- Viewport : **1440 × 900** (au-dessus du seuil 1280 → mode Théâtre activé)
- Navigateur : Chromium via Preview MCP
- Reset complet localStorage avant démarrage
- Personnage : Léon Jouhaux, salarié, mode "Réfléchi"
- Stratégie initiale INSTITUTION puis bascule COMPROMIS/PRESSION pour tenter de déclencher des ateliers
- Captures : DOM accessibility tree + screenshots + console.log/warn/error

---

## II. Sous-systèmes testés

### Top bar (4 boutons système) ✅
| Bouton | aria-label | Résultat |
|--------|-----------|---------|
| `?` | « Aide mécaniques » | Modal "How to play" ouvre/ferme proprement |
| 🎵 | « Lancer la musique » → « Couper la musique » | Toggle correct |
| ⊟ Classique | « Basculer vers le mode classique » | Cockpit→GameShell instantané, état préservé |
| ⚙ | « Réglages » | Modal Settings ouvre |

### Left rail Atelier — actions par énergie ✅
8 actions visibles (Tracts/Meeting/Manif/Pétition/Délégation/Presse/Budget/Table) avec coût en F (livres en 1789, francs ensuite). Bouton "Toutes les actions" en bas pour drawer complet.

### Drawer "Trésorerie" ✅
Très riche :
- Caisse / limite / 3 stratégies (Épargne / **Équilibre** / Distribution)
- Recettes (+23) vs Dépenses (-10) → Solde +13
- 4 actions de gestion (Souscription, Hausse cotisations, Aide grévistes, Audit)
- Toast feedback après action

### Drawer "Toutes les actions" ✅ (avec réserves — voir B-DESK9-11)
5 catégories : MOBILISATION (4) · INSTITUTIONNEL (4) · FINANCE (3) · COMMUNICATION (3) · ORGANISATION (3)

### Drawer "Journal de partie" ✅
30 entrées listées au tour 41. Suit l'historique de la partie.

### Sub-tabs ORGANISATION (4) ✅
Trésorerie · Manifestation · Meeting · Talents — accessibles. ManifSimulator chargé avec carte stratégique 12 villes, sliders, 4 combinaisons.

### Bascule CLASSIQUE ↔ COCKPIT ✅
Switch instantané sans crash. État de partie préservé. Score, tour, ressources cohérents.

### Console runtime
```
[error] : 0 entries
[warn]  : 0 entries
```
**0 erreur runtime sur toute la session de test.**

---

## III. 15 BUGS / FRICTIONS IDENTIFIÉS

### 🟢 INVALIDÉS

**B-DESK1 — INVALIDÉ** : « Bienvenue, Bâtisseuse » suspecté → en réalité « Bienvenue, Bâtisseur·e » (écriture inclusive). Pas un bug.

### 🟠 FRICTIONS UX (à traiter ORDA-006)

**B-DESK2 — Onglets verrouillés sans contexte de progression**
Les onglets « Mandat ⌐ » et « Monde ⌐ » sont verrouillés dès le tour 1 avec une icône cadenas, mais aucun tooltip n'explique POURQUOI ni COMMENT les débloquer. Le joueur clique → rien. Friction silencieuse.
**Fix proposé** : tooltip au survol « Débloqué au tour X » + animation de déverrouillage quand atteint.

**B-DESK3 — Bandeau « Bienvenue, Bâtisseur·e » persiste après onboarding 3/3**
L'onboarding contextuel (3 étapes) se ferme proprement avec « COMPRIS », mais le bandeau hint « Bienvenue, Bâtisseur·e. Lis le scénario, puis clique l'une des options... » persiste à l'écran avec un `×` séparé. Deux mécaniques d'introduction superposées qui se chevauchent.
**Fix proposé** : unifier en une seule, ou auto-fermer le bandeau Welcome quand l'onboarding 3/3 termine.

**B-DESK4 — Clic sur onglet verrouillé : AUCUN feedback**
Test : `document.querySelector('.tab.locked').click()` → 0 modale, 0 toast, 0 notification, 0 hint.
**Fix proposé** : toast « Cet onglet sera disponible au tour X » au minimum.

**B-DESK6 — Glossaire-au-clic absent en mode Théâtre Cockpit**
En mode Carnet (GameShell), les termes-clés (« paritarisme », « Le Chapelier », « Matignon ») sont des `<button class="gloss">` cliquables ouvrant la définition. **En mode Théâtre, 0 button.gloss détecté dans la SceneCard du Cockpit.**
**Fix proposé** : audit Sapeurs sur GlossaryText.svelte / SceneCard pour vérifier que le rendu glossaire est bien partagé entre les coques.

**B-DESK7 — Cascade de toasts empilés (6+ simultanés)**
Après plusieurs actions consécutives, on observe 6+ toasts « Un mémo Institution +X / -X » empilés à droite, qui peuvent prendre plusieurs secondes à se dissiper. Pollution visuelle.
**Fix proposé** : agréger les toasts identiques (« 3× Institution -5 → -15 ») ou stack max 3 visibles.

**B-DESK9 — 4/4 actions MOBILISATION marquées INDISPO sans filtre**
À T41 caisse vide, ouvrir le drawer « Toutes les actions » → catégorie MOBILISATION montre 4 cartes toutes étiquetées INDISPO « Caisse insuffisante ». **Le joueur doit lire chaque carte pour comprendre que rien n'est jouable.**
**Fix proposé** : un filtre top-bar « Disponibles seulement » + un compteur (« 0/4 disponibles ») par catégorie.

**B-DESK10 — Pourcentages sans légende**
Cartes d'action affichent « 35% », « 8% », « 12% » à côté d'une icône main (✋). Aucun tooltip. **Probabilité de quoi ? De succès ? De déclencher un événement spécial ?** Inconnu.
**Fix proposé** : tooltip « Probabilité de succès intégral » (ou équivalent réel selon la sémantique).

**B-DESK12 — Drawers ne s'excluent pas mutuellement**
Cliquer JOURNAL puis « Toutes les actions » → les **deux drawers s'affichent simultanément**, l'un derrière l'autre. UX confuse.
**Fix proposé** : ouvrir un drawer ferme automatiquement l'autre, ou les transformer en panneaux qui s'empilent latéralement.

**B-DESK15 — Drawer Organisation > Manifestation parallèle à un interlude**
Naviguer dans la sub-tab Manifestation alors qu'un interlude « Maxime ouvrière 1980 » est actif → le ManifSimulator s'ouvre à gauche, l'interlude reste au centre avec son bouton REPRENDRE. Deux contextes de jeu actifs simultanément.
**Fix proposé** : bloquer l'accès aux drawers Organisation pendant un interlude (ou inversement, fermer l'interlude en cliquant ailleurs).

### 🔴 BUGS SÉRIEUX

**B-DESK13 — « Tenir la base 0% » à T41 sans explication**
La sidebar Mandat affiche en GameShell :
- ✓ Bâtir l'institution — ATTEINT
- **Tenir la base 0% (jauge vide)** — alarmant
- ✓ Signer Matignon — ATTEINT (T22)

Mais à T18 (avant Matignon), le bilan disait « Tenir la base — ATTEINT ». **Comment passe-t-on de ATTEINT à 0% ?** Soit la métrique est inversée (0% = "trahisons restantes avant échec", 100% = jamais trahi), soit l'objectif est tracké tour-par-tour avec rotation. **Sans explication, le joueur panique.**
**Fix proposé** : libellé clair « Confiance de la base : 0% (objectif réussi : ne jamais trahir plus d'1× au total) » ou inversement.

**B-DESK14 — INCOHÉRENCE DES SCORES entre coques**
Trois nombres affichés simultanément :
- **Cockpit right rail** : « 59 » (T40) → « POSITION GLOBALE - SCÈNE 1 »
- **Cockpit top bar** : « P 39 » (palier ?), « PRAGMATIQUE » (style courant), valeurs ressources (41, 74, 18, 100, 41)
- **GameShell top center** : « SCORE 100 / 100 »

L'utilisateur voit **trois grandeurs différentes** sans légende. Le score 100/100 est probablement `computeFinalScore()` (déjà observé en partie complète Léon Jouhaux), le 59 est probablement la « position globale » courante de la scène. Mais **rien ne le dit au joueur**.
**Fix proposé** : libeller chaque nombre clairement (« Score final projeté : 100/100 », « Position dans cette scène : 59/100 », « Palier de carrière : Pragmatique (P 39 = position dans le panneau de 100 personae) »).

**B-DESK11 — Onglet INSTITUTIONNEL filtre mal initialement**
Au premier passage de MOBILISATION → INSTITUTIONNEL dans le drawer « Toutes les actions », j'ai vu encore les actions du left rail (Tracts, Meeting...) au lieu des actions Institutionnel (Ouvrir la table, Signer un accord...). Au second test, c'était correct. **Possiblement un problème de timing/cache de tab svelte.**
**Fix proposé** : audit Sapeur sur le composant CockpitActionsDrawer — peut-être que la tab par défaut est `mobilisation` mais que le DOM n'a pas filtré au premier rendu.

### 🟡 MINEURS / À CONFIRMER

**B-DESK5 — NewsTicker masqué en Théâtre** : intentionnel selon le code (`{#if !isTheatre} <NewsTicker />`). À documenter dans les réglages d'accessibilité (« en mode Théâtre, le ticker est masqué pour préserver le moment narratif »).

**B-DESK8 — Terminologie « P 39 » / « PRAGMATIQUE »**
Le top bar Cockpit affiche « LÉON JOUHAUX · PRAGMATIQUE · P 39 ». Le « P 39 » n'a pas d'unité explicite. À expliciter : « P » pour « Persona » ? « Palier » ? « Position » ?

---

## IV. Forces réelles du Cockpit (à préserver)

✅ **Onboarding 3/3** contextuel et dismissable (Krug #2 respecté)
✅ **ARIA labels** propres sur les 4 boutons système (audit a11y maintenu)
✅ **Bascule CLASSIQUE ↔ COCKPIT instantanée**, état préservé — c'est rare et précieux
✅ **Drawers riches** : Trésorerie (caisse + 3 stratégies + 4 actions), Toutes les actions (5 catégories), Journal (30 entrées)
✅ **ManifSimulator** : carte stratégique 12 villes, 4 combinaisons, sliders militants/cadres
✅ **Right rail acteurs** : 4 acteurs (Base / Patronat / État / Opinion) avec scores et ressentis textuels
✅ **0 erreur runtime** sur toute la session

---

## V. Verdict Argus

> Camarades de campagne,
>
> Le Cockpit est **techniquement sain**. Pas un crash, pas une erreur console, pas un bouton qui n'aboutit. C'est un travail soigné.
>
> Mais sur le plan **UX**, j'ai consigné **15 frictions** dont **3 sérieuses** (B-DESK11/13/14) et **8 mérirantes une attention** en ORDA-006 (B-DESK2/3/4/6/7/9/10/12/15).
>
> Le **score affiché diffère selon la coque** (59 en Cockpit vs 100 en GameShell) sans explicitation — c'est la friction n°1 à régler. Un joueur peut penser qu'il a 100/100 alors qu'il a 59 dans la scène en cours, ou inversement.
>
> L'objectif **« Tenir la base 0% »** au tour 41 alors qu'il était **ATTEINT** au tour 22 est confus — soit bug, soit métrique inversée, soit affichage tour-par-tour. À régler.
>
> Les **onglets verrouillés** (Mandat ⌐, Monde ⌐) sans tooltip et sans feedback au clic sont un trou UX classique — un joueur ne saura jamais comment les débloquer.
>
> Et la **profondeur du Cockpit** (4 catégories d'actions, ManifSimulator complet, Trésorerie 3 stratégies, Right rail 4 acteurs) est largement supérieure à ce que voit un nouveau joueur en mode Carnet — il devrait être présenté plus tôt.
>
> Bilan : **PARITAS Cockpit fonctionne, mais demande beaucoup au joueur**. Le panel 30 va le confirmer.
>
> ORDA-006 ouvert. Priorité aux 3 bugs sérieux.
>
> — **Argus**, Maréchal-auditeur, panel PARITAS
> *2026-05-08, 08 h 14, après test desktop critique 1440 × 900.*

---

## ANNEXE — Indicateurs

| KPI | Résultat |
|-----|----------|
| Erreurs runtime console | **0** ✅ |
| Warnings runtime console | **0** ✅ |
| Boutons système ARIA-labellés | **4/4** ✅ |
| Drawers fonctionnels | **5/5** (Trésorerie, Toutes actions, Journal, Talents, Réglages) ✅ |
| Onglets ORGANISATION accessibles | **4/4** (Trésorerie, Manifestation, Meeting, Talents) ✅ |
| Bascule Cockpit↔Classique | OK, état préservé ✅ |
| **Bugs sérieux UX** | **3** (B-DESK11/13/14) 🔴 |
| **Frictions UX modérées** | **8** (B-DESK2/3/4/6/7/9/10/12/15) 🟠 |
| Bugs cosmétiques mineurs | **2** (B-DESK5/8) 🟡 |
| **TOTAL bugs** | **13** (B-DESK1 invalidé sur 14 candidats) |
