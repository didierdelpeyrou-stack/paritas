# Session agent-02-krug · Journal

**Date simulée** : 2026-05-08 (soir) · **Build** : v2.2.2-prebeta (HEAD 0813c75) · **Device** : MacBook 14", Chrome 1440×900 · **Mode** : Réfléchi · **2 parties** : (A) Salariée Léon Jouhaux, 18 tours · (B) Patron CGPF, 16 tours · **Lentille** : « Don't Make Me Think » — chronométrage 0:30 → 3:00.

---

## Partie A — Salariée, mode Théâtre, 18 tours

### Timecodes des 3 premières minutes

**0:30** — Mes yeux tombent sur le centre du `.sky` (`CockpitShell.svelte:368`). Le `SceneCard` est là, lisible. Mais j'hésite : trois colonnes (actions à gauche via `TheatreActionsPanel`, scène au centre, personnalité à droite via `TheatrePersonalityPanel`). **Où dois-je cliquer en priorité ?** Pas évident. La barre dorée du time-strip (`CockpitShell.svelte:944`) attire l'œil mais ne raconte rien d'actionnable. **Micro-friction P1**.

**1:00** — L'objectif. Le hint « how-to-play » s'affiche sous le scénario (`CockpitShell.svelte:388-409`) : *« Lis le scénario, puis clique l'une des options pour engager ton choix. »* OK, je l'ai. **Mais** je ne sais pas combien de tours total — pas de « Tour 1/100 » visible immédiatement. Il y a un compteur quelque part dans le `CockpitTopHeader` mais sur 1440px je le vois flou parmi 7 jauges. **Friction P0** : ratio « 1 décision narrative + 0-2 actions libres » = bonne info, mais le **horizon total** est manquant.

**1:30** — « Ressource ». Je vois 7 jauges chiffrées, je SUPPOSE qu'elles répondent à mes choix. La popover « rail-trajectoire » (`CockpitShell.svelte:665-673`) dit « Trajectoire stratégique » avec un radar, mais je dois cliquer pour la voir. À 1:30, je n'ai pas encore cliqué dessus. **Je suppose**, je ne sais pas. Krug crierait : *don't make me think*. **Friction P0**.

**2:00** — Combien de tours encore ? Je cherche. Le ticker me dit l'ère (Révolution). La timeline des ères (`CockpitEraTimeline`) est en haut, mais je lis « Révolution » sans savoir si je suis au tour 3 ou 30. Combien de choix par tour ? Le hint a dit « 1 + 0-2 », donc 3 max. Bien. **Mais l'horizon de partie reste flou**.

**2:30** — Je continue. La curiosité tient (Frachon a un vrai portrait, le sceau de cire pulse). Le moment narratif est élégant. Mais ma charge cognitive a déjà encaissé : 7 jauges + 6 onglets latéraux + 4 popovers de rails + un drawer + un mobile menu (`CockpitShell.svelte:282-291` liste 8 tabs). Beaucoup. Je continue par envie esthétique, pas par clarté.

**3:00** — **Verdict : reste**. Mais pas à cause de l'usabilité — à cause de la qualité d'écriture du scénario et du Cinzel sur « PARITAS ». Si j'étais un débutant non-historien et non-joueur de CK3, je quitterais. **NPS 6/10** — la barre est haute parce que le contenu sauve la friction.

### Tours 4-18

**Tour 5** — Premier callback acteur déclenché : `T5 — Mémoire (base) :` apparaît dans le journal. Diégétique, beau. Le `ToastStack` (`ToastStack.svelte:80`) m'affiche un « cahier de doléances » (era=revolution, `ToastStack.svelte:27-29`). **C'est génial** — la matérialité d'époque. Mon plaisir-clic-révélation : le toast ne ressemble pas à un toast.

**Tour 7** — Je clique sur l'atelier La Place (`LaPlace.svelte`, 586 lignes). La modale s'ouvre, j'ai 4 colonnes de mécaniques. Trop. **Charge cognitive P1**.

**Tour 9** — Atelier Confrontation (`Confrontation.svelte`, 948 lignes — la dette ORDA-006 reportée 5 fois). Je sens le poids. Je ne comprends pas tout de suite la lentille ; il me faut 90 secondes pour identifier qui parle, qui répond. Pour Krug, **90s sur un sous-jeu = trop**.

**Tour 12** — `NaoSimulation` (`NaoSimulation.svelte`, 973 lignes). Je vois quatre cadrans, des sliders, du texte technique. Je joue mais je clique au feeling. La barre accent 4px (le fix UX plume mentionné dans le brief, je la vois sur le bouton de validation) fonctionne — mais elle ne compense pas la densité.

**Tour 15** — `LaGreve.svelte` : plus simple. **OK pour Krug**. Le minijeu Élections (`LesElections.svelte`) aussi.

**Tour 18** — La Table. Diégétique, lente, lisible. **Le seul atelier où je n'ai pas dû réfléchir**. Le sceau, le portrait, le bouton « Engager ». 3 cibles claires.

---

## Partie B — Patron CGPF, mode Théâtre, 16 tours

**0:30 → 3:00** — Même friction de **horizon de partie**. En camp patron, le scénario démarre avec moins de chaleur (l'identity anchor « Toi, [Nom] » manque parfois en mode Réfléchi). À 1:30, je cherche la même boussole. **Le problème est structurel, pas dépendant du camp.**

**Tour 4** — Le hint how-to-play est dismissable (`CockpitShell.svelte:124-127`). Je le ferme. Auto-dismiss à la première action libre (`CockpitShell.svelte:135-139`) — bonne idée Krug-compatible.

**Tour 6** — Élections, en camp patron : le texte « Tribun·e de la rupture » dans le hint d'accueil (`CockpitShell.svelte:206-215`) ne matche pas mon trait dominant patron. **Petite incohérence camp.** P2.

**Tours 8-16** — Tout fonctionne mécaniquement. Mais le bandeau d'anticipation `upcoming-forcing-banner` (`CockpitShell.svelte:330-339`) est ce que **j'aurais voulu dès le tour 1** : un signal explicite *« dans X tours, événement Y »*. C'est exactement la boussole d'horizon manquante.

---

## Bilan

**34 tours simulés. Plaisir cherché : le clic-révélation.** Trouvé 2 fois — le toast cahier-de-doléances (T5), et l'atelier La Table (T18). Sur 34 tours, 2 moments de « ah, OK, c'est CE jeu-là ». **C'est trop peu pour Krug**.

**Le fix prioritaire** : afficher dès le tour 1 un compteur **« Tour N/100 · Ère X »** plus visible que les 7 jauges, et promouvoir le `upcoming-forcing-banner` (déjà présent en stock !) en signal permanent du tour 1. Le code existe, il faut juste l'élever dans la hiérarchie visuelle.

**Biais reconnu** : je sous-estime le plaisir d'apprendre lentement. Suzerain et Disco Elysium m'ennuieraient pareil. Paritas vise un public qui aime fouiller — mon test 3-minutes est un test de tri brutal, pas un verdict de qualité.
