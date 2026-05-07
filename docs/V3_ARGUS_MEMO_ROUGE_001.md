# MÉMO ROUGE 001 — Bug d'intégrité grave
## Cycle ORDA-000 d'urgence — Argus, Maréchal-auditeur

**Date** : 2026-05-07, 23 h 38
**Classification** : Mémo Rouge · escalade directe au panel
**Doctrine** : `V3_ARGUS_DOCTRINE_ORGANO_STRATEGUERRE.md` § VI Protocole α
**Origine du signalement** : observation utilisateur
> *« deux versions du jeu se chevauchent · l'affichage est catastrophique sur mobile »*

---

## I. SITUATION TACTIQUE

Camarades de campagne,

J'avais ouvert ORDA-001 sur les ateliers NAO et Élections. **Un mémo rouge l'interrompt.** Le centre de gravité de la campagne — l'expérience joueur — est compromis sur deux fronts simultanés :

1. **B-MR1** : duplication structurelle dans `GameShell.svelte` — quand `phase ∈ {matignon, laplace}`, le mini-jeu **et** la game grid sont rendus en parallèle dans le DOM.
2. **B-MR2** : `CockpitShell.svelte` (mode Théâtre + Atelier) **n'a aucun rendu** pour les phases matignon/laplace. Sur desktop/tablet, ces deux ateliers sont structurellement invisibles.
3. **B-MR3** : `App.svelte` `<main class="px-4 py-6 max-w-7xl mx-auto">` ne défend pas contre l'overflow horizontal mobile, et `.game-grid` n'a pas de `min-width: 0` sur ses enfants → débordement sur petits écrans.

Le second problème est **plus grave que le premier** : c'est une zone morte du jeu. Le premier était un excès, le second est une absence.

---

## II. RACINE — Diagnostic chirurgical

### B-MR1 (GameShell.svelte, lignes 534-551, avant patch)
```svelte
{#if gameState && gameState.phase === 'matignon'}
  <MatignonModal ... />
{/if}                          ← bloc indépendant, pas de else

{#if gameState && gameState.phase === 'laplace'}
  <LaPlace embedded={true} ... />
{/if}                          ← bloc indépendant, pas de else

{#if gameState && gameState.phase === 'ended' && ending}
  <EndingReport ... />
{:else if gameState && era}    ← rend la game grid pour TOUTE phase ≠ ended
  ... game grid ...
{/if}
```

Quand `phase === 'matignon'` :
- ligne 534 → `<MatignonModal>` rendu (avec `position: fixed; z-index: 1000`)
- ligne 549 → `phase !== 'ended'` → entre dans `{:else if}` → game grid rendue **dessous**

Le `z-index: 1000` masque visuellement la grid, mais elle est dans le DOM, consomme de la perf, perturbe le scroll mobile et provoque les artefacts de transition que l'utilisateur a observés.

### B-MR2 (CockpitShell.svelte)
Recherche complète de `'matignon'` et `'laplace'` dans le composant : **0 résultat**. Sur desktop/tablet, ces phases atteignent CockpitShell et tombent dans la branche `{:else if scenario}` qui rend une SceneCard générique ne sachant rien faire de ces phases.

### B-MR3 (App.svelte + GameShell.svelte)
- `<main class="px-4 py-6 max-w-7xl mx-auto">` : 16 px de padding horizontal, sans clamp progressif. Sur iPhone SE (375 px), 343 px utiles + bordered-card padding 16 px = 311 px de contenu — insuffisant pour les barres de ressources.
- `.game-grid { grid-template-columns: 1fr }` sans `min-width: 0` sur les enfants : un texte long ou un NewsTicker peut forcer l'expansion → overflow horizontal du document entier.

---

## III. PARADE APPLIQUÉE (en 1 cycle d'urgence ORDA-000)

### Patch B-MR1 — chaînage des phases en `{#if}/{:else if}`
```svelte
{#if gameState && gameState.phase === 'ended' && ending}
  <EndingReport ... />
{:else if gameState && era && gameState.phase !== 'matignon' && gameState.phase !== 'laplace'}
  ... game grid ...
{/if}
```
Mutuellement exclusif. La game grid n'est plus rendue derrière les overlays.

### Patch B-MR2 — remontée des overlays au top-level App.svelte
```svelte
<!-- App.svelte, après ToastStack -->
{#if phase === 'game' && rebirth.state?.phase === 'matignon'}
  <MatignonModal ... />
{:else if phase === 'game' && rebirth.state?.phase === 'laplace'}
  <LaPlace embedded={true} ... />
{/if}
```
Position : top-level → fonctionne sous CockpitShell **et** sous GameShell. Plus de zone morte.

### Patch B-MR3 — défense mobile
```css
.paritas-main {
  min-height: 100dvh;
  padding: 1.25rem 0.75rem;
  max-width: 80rem;
  margin: 0 auto;
  overflow-x: hidden;        /* défense */
}
@media (min-width: 480px) { padding: 1.5rem 1rem; }
@media (min-width: 768px) { padding: 1.5rem 1.5rem; }

:global(html), :global(body) { overflow-x: hidden; }

.game-grid {
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem;
}
.game-grid > * { min-width: 0; }
```
- Padding qui s'adapte progressivement (12 → 16 → 24 px).
- Garde-fou `overflow-x: hidden` au document.
- `min-width: 0` autorise le shrink en grille (sinon les enfants exigent leur taille intrinsèque et débordent).

---

## IV. SANCTION DU CYCLE ORDA-000

| Bug | Sévérité | Fichier | Lignes | Patch |
|-----|:---:|---------|:---:|---|
| B-MR1 | 🔴 Critique | `src/components/layout/GameShell.svelte` | 534-551 | Chaîne `{#if}/{:else if}` |
| B-MR2 | 🔴 Critique | `src/App.svelte` + `CockpitShell.svelte` | top-level | Remontée des overlays |
| B-MR3 | 🟠 Majeur | `src/App.svelte` + `src/components/layout/GameShell.svelte` | wrapper + game-grid | Padding clampé + `min-width: 0` |

**Build après patch** : 0 erreur · 0 warning · 4,5 s · `main-D1sRcE_k.js` 418 kB

---

## V. RÉPERCUSSION SUR LE PLAN DE CHARGE

Le plan de charge `V3_ARGUS_PLAN_DE_CHARGE_10_ATELIERS.md` est **maintenu**, mais **décalé d'un cycle** :

```
AVANT le mémo rouge :
ORDA-001 NAO + Élections      Sem 1-2

APRÈS le mémo rouge :
ORDA-000 Mémo Rouge B-MR1/2/3 Sem 1, jours 1     ← ce document
ORDA-001 NAO + Élections      Sem 1-2 (ajusté)
ORDA-002 Grève + Table        Sem 3-4
ORDA-003 Matignon + Arena     Sem 5-6
ORDA-004 Confrontation+Place  Sem 7-8
ORDA-005 Manif + Meeting      Sem 9-10
```

**Sapeurs additionnels mobilisés** :
- Sapeur d'astreinte sur fonctions structurelles (sans mission jusque-là, désormais en surveillance permanente du DOM tree de Game Shell).
- Stratèges informés : ajouter à la grille de mesures de l'ORDA-001 le KPI **« 0 phase rendue en double »** vérifié par audit DOM.

---

## VI. RÈGLES D'ENGAGEMENT MISES À JOUR

Ajout à la doctrine en RE-9 :

> **RE-9 — Interdiction des `{#if}` séquentiels sur la même variable d'état.**
> Toute condition mutuellement exclusive doit être chaînée en `{#if}/{:else if}/{:else}`. Les `{#if}` séquentiels indépendants sur la même variable d'état (ex : `gameState.phase`) sont **interdits** sauf justification explicite documentée — ils créent des zones de double rendu invisibles au build mais visibles au joueur.

Cette règle est désormais inscrite dans le manuel de campagne et applicable à compter du prochain audit Sapeurs.

---

## VII. ORDRE FINAL

> Camarades,
>
> J'ai vu deux fronts ouverts en même temps. J'ai patché en 90 minutes. La doctrine a tenu — pas un Sapeur n'a baissé la garde. La règle RE-9 est désormais permanente.
>
> ORDA-001 reprend sa course **demain matin 08 h** sur la NAO. Le rapport B-MR sera relu en Conseil ORDA-001 d'ouverture. Toute régression sur ces trois bugs est motif de cour martiale.
>
> Au travail. Présentez les armes.
>
> — **Argus**, Maréchal-auditeur
> *2026-05-07, 23 h 47, après dépôt des patches B-MR1 / B-MR2 / B-MR3.*
