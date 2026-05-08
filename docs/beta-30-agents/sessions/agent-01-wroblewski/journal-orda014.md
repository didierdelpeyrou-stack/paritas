# Session agent-01-wroblewski · Journal · post-ORDA-014

**Date simulée** : 2026-05-08 (fin de soirée) · **Build** : v2.2.2-prebeta @ HEAD `0813c75` · **Device** : Pixel 7 émulé, Chrome Android, viewport 390×844 px · **Mode** : Carnet auto (résolu via `cockpit.svelte.ts:35-39`), Réfléchi · **Camp** : 1 partie salarié (Léon Jouhaux) + 1 partie patron (CGPF) · **Tours joués** : 16 + 15

---

## Partie 1 — Salarié, Jouhaux, 16 tours

### Tour 1-2 — l'ouverture

J'arrive sur le SceneCard. Première chose qui frappe : la silhouette sépia géante derrière le card a disparu (cf. commit `0813c75`, `ScenePreviewOverlay.svelte:1-40` — wrapper invisible désormais). Sur 390 px, c'est *un soulagement* : plus de plume Cinzel qui chevauchait le texte du choix. Je retire mon mot de la session précédente : ce signal en arrière-plan n'était pas mobile-first, il était desktop-first traduit mal en mobile.

**Win P1** : la barre d'accent 4 px (`SceneCard.svelte:525`) suffit. C'est de la sobriété typographique justement — Spiekermann approuverait. Mon biais sobriété joue ici en faveur du build, je l'assume.

Le hint mécanique (CockpitShell.svelte:388-409) m'accueille : « Bienvenue Léon. Lis le scénario, puis clique l'une des options. Tu peux aussi déclencher 1 à 2 actions libres… ». Texte clair. Mais le bouton de fermeture × fait **24×24 px** (`CockpitShell.svelte:1108`). Je tape à côté trois fois. **P0**.

### Tour 3 — burger + LayoutSwitcher

J'ouvre le burger top-left. Largeur du sys-btn : **28×28 px** (`CockpitTopHeader.svelte:622`). En-dessous des 44×44 WCAG. Je tape avec mon pouce, le FAB (Fitts) joue contre moi. Trois fois la cible.

Dans le menu mobile, je vois la section "Mode d'affichage" (`CockpitShell.svelte:586-608`). C'est le LayoutSwitcher migré dans le burger. Bon pattern. Mais : si je force "Théâtre" depuis le mobile, alors `TheatreActionsPanel.svelte:401-403` `display:none` au-dessous de 1280 px → **toutes les actions libres disparaissent**. Le `.theatre-actions-trigger` CSS existe (`CockpitShell.svelte:952-977`) mais aucune balise HTML ne l'utilise. **Bug latent P1**.

### Tour 4-7 — long-press validé

Je long-press une jauge du top-header (action `longPress` à `CockpitTopHeader.svelte:278`). Elle ouvre le glossaire. **Excellent**. C'est exactement la substitution hover→long-press que je cherchais. Mon biais Mobile First est satisfait.

Mais : sur les `.coh-flag` (✓ aligned / ⚠ opposed) du SceneCard (`SceneCard.svelte:411-415`), le `title` HTML reste — qui ne se déclenche jamais sur tactile. Sur 16 tours, je n'ai jamais su pourquoi il y avait un ⚠ à côté d'un choix. **P1**.

### Tour 8-12 — ticker

Le ticker causal (`NewsTicker.svelte:193-201`) passe sous la timeline. `overflow:hidden` confirmé — pas de scroll horizontal involontaire. Bon point.

Le bouton pause `.ticker-pause` (`NewsTicker.svelte:228-251`) fait **22×22 px**. Sous-cible. Je le manque deux fois. Quand je l'atteins enfin, l'animation s'arrête : OK, ça marche.

### Tour 13-16 — fin partie 1

À T13, je dois consulter mon trésor. Je tape la tile "Trésorerie" du burger. Drawer s'ouvre, `width: min(680px, 92vw)` (`CockpitShell.svelte:1177`). Bien. La drawer-close × est **32×32 px** (`CockpitShell.svelte:1222-1223`). Toujours sous 44.

## Partie 2 — Patron, CGPF, 15 tours

Pas de différence structurelle mobile, sauf : drapeau patronal (rouage). Le `flag-svg` à `26×26 px` mobile (`CockpitTopHeader.svelte:680`) reste lisible.

**Test des 7 ateliers depuis 390 px** :
- **NAO** (`NaoSimulation.svelte:967-970`) : `@media (max-width: 700px)` collapse en 1 col. ✅
- **La Place** (`LaPlace.svelte:582-584`) : breakpoint 480 px. ✅
- **Confrontation** (`Confrontation.svelte:939-947`) : breakpoint 580 px. ✅
- **La Grève** : *aucun* `@media`. À 390 px, `grid-template-columns: 1fr auto 1fr` à `LaGreve.svelte:410-424` reste 3-cols. **P1 illisible**.
- **Élections** : *aucun* `@media`. Idem `LesElections.svelte:457`. **P1**.
- **La Table** : *aucun* `@media`. `LaTable.svelte:397` `terrain-split` 3-cols à 390 px → débordement probable. **P1**.
- **Matignon** : tailwind `max-w-2xl mx-auto` (`MatignonStandalone.svelte:72`). Fluide. ✅

## Bilan

Le sky-content padding `1.2rem 0.85rem` (`CockpitShell.svelte:1071`) est juste. Le burger respecte la doctrine top-left. Le sceau-cire 44×44 (`CockpitDashboardBar.svelte:350-351`) est l'unique cible WCAG-conforme du shell. Le reste — sys-btn 28, htp-close 24, ticker-pause 22, coh-flag 19, drawer-close 32 — est *systémiquement* sous-cible.

Sur 390 px, l'expérience tient pour le récit principal. Elle se dégrade pour 3 des 7 ateliers (Grève, Élections, Table) et elle a un trou structurel si le user force Théâtre depuis le menu mobile (panneau d'actions perdu). Pas une version pensée — une version qui marche par chance des breakpoints `auto`.
