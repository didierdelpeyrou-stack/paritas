# Session agent-01-wroblewski · Journal

**Date simulée** : 2026-05-08 (soir) · **Build** : v2.1.2-prebeta · **Device** : Pixel 7 émulé, Chrome Android, viewport 390×844 px · **Mode** : Carnet (forcé), Réfléchi · **Camp** : Salarié · **Légendaire** : Léon Jouhaux · **Tours joués** : 15

---

## Tour 1 — Démarrage

J'ouvre la PWA depuis le raccourci écran d'accueil. **TTI ressenti** : ~1.4 s. L'écran de démarrage tient sur 390 px, pas de scroll horizontal. Bon point.

Je vois le `CockpitTopHeader` apparaître après l'écran d'accueil. Il a 7 mini-jauges chiffrées (le commentaire de code à `CockpitTopHeader.svelte:9-17` revendique « TOUTES visibles, Civ-style »). **Je compte** : confiance, caisse, légitimité, rapport de force, cohésion interne, institution, santé. Sur 390 px de large, chaque jauge fait ~50 px. **Friction P0** : un débutant qui n'a pas joué Civ ne sait pas hiérarchiser. C'est précisément le problème pointé par la roadmap d'intégration panel (cf. `docs/ROADMAP_PANEL_INTEGRATION.md` §1A.1 : « Disclosure des 6 ressources »).

J'observe : le ticker apparaît sous le header, en marquee. À `NewsTicker.svelte:122`, il a `role="marquee"` mais **pas** `aria-live`. Sur mobile, l'animation de défilement automatique me distrait pendant que je veux lire la scène. Je veux le mettre en pause — pas trouvé d'option visible.

## Tour 2-3 — Premier choix narratif

J'arrive au premier dialogue. Le bouton de choix fait à peu près 280×48 px, **OK pour le tactile** (au-dessus du minimum 44×44). Mais le texte du choix est en Source Serif 4 à ce qui semble être 14-15 px : sur 390 px, je tape parfois entre deux options.

Pas de feedforward avant le clic : je ne sais pas combien je vais perdre / gagner avant d'avoir cliqué. Soren Johnson râlerait. **Friction P1**.

## Tour 4-7 — Le LayoutSwitcher disparu

Je veux passer en mode Théâtre pour voir si l'expérience desktop me parle plus. Sur 390 px, le `LayoutSwitcher.svelte` est en haut à droite, presque collé à l'écran. **Je ne le trouve pas tout de suite** — il est visuellement confondu avec le bouton de fermeture ou un menu kebab. C'est exactement la friction notée par Tognazzini dans le panel curated (§I.5).

**Friction P0** : sur 390 px, le badge LayoutSwitcher devrait être DANS un menu burger explicite (déjà mentionné `CockpitTopHeader.svelte:showMobileBurger`), pas un badge top-right ambigu.

## Tour 8-10 — Le hover qui n'existe pas

Le badge POV (mon trait dominant) affiche, semble-t-il, une bio au survol. Sur tactile, **rien ne se passe** quand je tape une fois. Au double-tap, ça ouvre une modale (peut-être ?). Pas de long-press de substitution.

Je vérifie le panel V3_PANEL_50_CURATED.md §I.8 (mon propre verdict !) — c'est exactement l'angle mort que j'avais signalé. Confirmé en jeu.

**Friction P0** : implémenter un substitut tactile pour les hovers (long-press → tooltip).

## Tour 11-13 — Le clavier virtuel et le badge POV

Je tombe sur un scénario qui demande de **taper du texte** (peut-être un input pour nommer une revendication). Le clavier virtuel monte. Le `CockpitTopHeader` reste en haut, **mais** : le badge POV est masqué par le bandeau « auto-fill suggestions » de Chrome Android. Je perds mon ancrage.

**Friction P1** : utiliser `interactiveWidget=resizes-content` dans le viewport meta, ou repositionner le badge POV en bottom-bar quand un input est focus.

## Tour 14-15 — Le scroll horizontal involontaire

À un moment (je crois lors du passage à l'ère « Trente Glorieuses »), le ticker affiche un événement long. Mon doigt frôle la zone du ticker en scrollant verticalement → **le ticker devient scrollable horizontalement** et je me retrouve à mi-message sans pouvoir revenir au début. Pas de bouton « début ».

**Friction P1** : `overflow-x: auto` sur le ticker mobile a un coût UX. Soit c'est `clip` + animation, soit c'est un bouton « pause » + dot navigation.

---

## Bilan

15 tours, 30 minutes simulées. Plaisir cherché : « tout est là sur 390 px ». **Réponse** : à 60 %, oui. À 40 %, non — c'est une dégradation gracieuse, pas une version pensée. Le top-header dense, le ticker sans pause, le LayoutSwitcher invisible, le hover sans substitut tactile sont les 4 P0.

Mon biais reconnu : j'ai sous-noté l'élégance typographique du Cinzel ALL CAPS sur le mot « PARITAS » — ça **fonctionne** comme signature, même sur 390 px. C'est joli. Je l'ai presque oublié. Préférence personnelle pour la sobriété, ouvertement.
