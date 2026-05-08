# Journal — Hadi Soueidan (a11y · WCAG 2.2 AA · NVDA + Firefox + clavier)

Build : v2.2.2-prebeta · HEAD 0813c75 · 2026-05-08

## Préparation

J'ai branché NVDA, fermé la souris dans le tiroir. Firefox plein écran. Je
relis ORDA-013 et ORDA-014 avant de lancer : 376 Vitest verts, 13 callbacks
acteurs, mémoire CK3 1789-2017. Côté tests unitaires, c'est béton. Côté
moi — c'est mon métier — il s'agit de savoir si ça **se joue** au clavier
seul.

## Partie 1 — Léon Jouhaux, syndicaliste, mode réflechi

### T1-3 — Onboarding clavier

Tab depuis Landing : focus va sur "Lancer une partie", indicateur visible
(outline doré 2px via `var(--sem-action)`). Bon. Je lance, j'arrive sur
StartScreen. Le `role="radiogroup"` aria-label "Choisir le mode
d'expérience" (`StartScreen.svelte:159`) est annoncé proprement par NVDA.
Les boutons radio mode (réflechi/sensoriel/compulsif) sont navigables par
flèches gauche/droite — convention WAI-ARIA respectée. Bien.

J'arrive sur SceneCard du tour 1. NVDA lit le `<h2>` "Le serment du Jeu de
Paume" en doré sur fond noir. Le contraste passe (ratio ~7.5:1 sur surface
#1a1f26). **Mais** : la classe `.font-display` est en Cinzel ALL CAPS sur
le titre — NVDA épelle "S-E-R-M-E-N-T" sur certaines voix françaises.
Connu, j'en parle dans biais.

### T4-15 — Choix par clavier

`SceneCard.svelte:380` : la liste de choix est un `<ul aria-label="Choix
disponibles">`. Chaque `.choice-btn` (ligne 389) est un vrai `<button
type="button">`. Tab order : header → image → choix 1 → 2 → 3. Logique.

Le focus visible : `border-color: var(--accent)` + `box-shadow: -2px 0 0 0
var(--accent)` (ligne 540-543) **remplace** un `outline: none` (ligne
544). C'est une transgression WCAG SC 2.4.7 acceptable parce qu'il y a un
substitut visible — mais le substitut dépend de `--accent` qui varie par
posture (rupture rouge, compromis ambre, expertise vert, opinion violet,
etc.). Le rouge sur fond carbone est OK ; le jaune-ambre du
`compromis` (#c89b3c) sur fond `--accent-soft` à 12% mix
**borderline 3:1**. À mesurer.

La barre d'accent gauche 4px (`SceneCard.svelte:524-525`) — ORDA-015 fix
post-plume — fonctionne au clavier. Pas de surprise. Bonne décision UX.

Le `.coh-flag` ⚠/✓ porte un `aria-label` complet (ligne 411, 414) : NVDA
annonce "Ce choix va contre ton trait dominant" — clair, j'aime.

### T16-30 — ToastStack

Premier toast : `<div class="toast-stack" aria-live="polite"
aria-atomic="false">` à `ToastStack.svelte:175`. Polite + atomic=false →
NVDA n'interrompt pas la lecture en cours. Bon comportement. **Mais** : le
toast disparaît à 3.2-5s selon `tone` (durationFor:74-78). Si je suis en
train de lire le SceneCard, je rate le toast complet. **WCAG SC 2.2.1
Timing Adjustable** : pas de pause, pas de prolongation. P1.

Le tampon URGENT rouge `#8b1f1b` sur fond papier crème : contraste
~6.8:1, OK. Mais le `font-size: 0.55rem` du tampon (ligne 345) =
~8.8px — **WCAG SC 1.4.4 Resize Text** : non-zoomable sans rupture
layout. P2.

## Partie 2 — Patron, mode sensoriel

### T1-30 — Tab cockpit

Je traverse CockpitDashboardBar en Tab. Le bouton "Valider"
(`CockpitDashboardBar.svelte:154`) a un aria-label clair. Mais le ticker
causal `NewsTicker.svelte` : 38 items défilent. Chaque item interactif a
`tabindex={interactive ? 0 : -1}` (ligne 165) — **piège** : ils sont tous
dans le tab order pendant qu'ils défilent, focus saute sur un item qui
disparaît à 30s. P1.

Surtout, le `.ticker-item.interactive:focus-visible` à la ligne 297 retire
l'outline et ne garde QUE `background: color-mix(in srgb, var(--cat-color)
18%, transparent)` comme indicateur. Sur item peu coloré (cat-color
beige), je perds le focus à l'œil. **WCAG SC 2.4.11 Focus Not Obscured**
(AA en 2.2). P0.

## 7 ateliers (rapide — clavier seul)

1. **Tracts** : OK, mais labels de slider sans aria-valuetext.
2. **Manifestation** (`ManifMap.svelte:58`) : `role="button"` sur `<div>`,
   tabindex 0 — devrait être `<button>`. P2.
3. **Délégation** : OK.
4. **Pétition** : OK.
5. **Meeting** (`MeetingSimulator`) : `outline: none` ligne 450 sans
   substitut clair sur certains states. À vérifier.
6. **Brawl** : `role="dialog" tabindex="-1"` (ligne 532-533), focus trap
   correct.
7. **Congrès** : OK.

## Verdict

PARITAS est **jouable au clavier**. Pas de blocage dur. Mais 3 frictions
me coûteraient 20-30% de fatigue cognitive sur une session longue.
