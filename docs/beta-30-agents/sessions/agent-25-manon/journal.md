# Journal — Manon E. (agent 25)

> **Note méthodo.** Le profil canonique `agent-25-manon.md` me cadre comme
> dyslexique + TDAH (24 ans, psycho L3, OpenDyslexic). Le brief de session
> me demande la lentille « designer UX freelance Strasbourg, joue Inscryption
> / Disco Elysium / FTL ». Je tiens les deux : je lis comme une dyslexique
> (la forme prime), je critique comme une UI designer indé (la cohérence
> de système prime). Si tension entre les deux, je dis laquelle parle.

## Avant de lancer — premier contact avec le code

J'ai lu le commit `0813c75` avant d'ouvrir le jeu. Honnêtement, ça m'a
rassurée. Quelqu'un a regardé une capture, a vu que la silhouette SVG
sépia + le mot CINZEL en filigrane *encombraient* le SceneCard, et a
tranché : retire le filigrane, mets une barre 4px en pleine couleur.
C'est exactement le genre d'arbitrage qu'un dev product fait quand il
préfère un système lisible à un système « riche ». 170 lignes virées
contre 21 ajoutées (`git show --stat 0813c75`). C'est un bon ratio de
courage.

Le wrapper `.preview-overlay` est conservé invisible dans
`ScenePreviewOverlay.svelte:23-27` — geste sain, on garde le hook
`data-posture` au cas où une expé visuelle voudrait s'y rebrancher.
Pas de code mort, juste un point d'amarrage.

## Partie 1 — Réfléchi · Jouhaux/syndical · ~30 tours regardés

**T1 — entrée.** Le hint `how-to-play` (`CockpitShell.svelte:388-409`)
arrive en bandeau doré, fond translucide `rgba(201, 178, 106, 0.08)`,
filet gauche 3px. Net, pas envahissant. Le bouton de fermeture est en
haut-droite, 24×24 — limite tactile mais OK desktop.

**T2-T5 — premier scénario, hover.** Je passe la souris sur les choix.
La barre d'accent gauche 4px (`SceneCard.svelte:525`) prend la couleur
posture en hover et le card entier reçoit une box-shadow tintée
(`SceneCard.svelte:489-512`). C'est *propre*. Six postures, six teintes
distinctes : rupture corail `#d96a5b`, institution bleu `#7eb4ff`,
compromis or `#c89b3c`, expertise vert d'eau `#8db4a8`, opinion violet
`#b497d6`, paternaliste vert sage `#7aa37a`. La palette est
**identitaire**, pas Material Design. C'est rare. Bravo.

**T6-T12 — le glyph, le label, la barre.** Trois indices redondants
(barre + label CINZEL + glyph en cercle). Comme designer indé je
valide : redondance = robustesse pour les daltoniens et les distraits.
Ma version dyslexique me dit aussi que le label `INSTITUTION · attendre
la circulaire` lu en CINZEL 0.72rem letter-spacing 0.08em,
**majuscules**, c'est *plus* dur à lire qu'en sans-serif normal —
mais c'est là pour le ton, pas pour l'info principale (qui est dans
`.text` en Source Serif, lisible). Cohabitation acceptable.

**T15-T20 — le top-header.** 7 jauges visibles d'un coup
(`CockpitTopHeader.svelte` plus le drapeau, le portrait, le nom, le
trait, le score, le mood, les boutons système). Mon TDAH dit *trop*.
Mon œil designer dit : « c'est CK3 assumé ». Le brief ORDA-009
(P1-14, `app.css:62-77`) a déjà prévu un preset `a11y-cognitive` qui
calme la chose (line-height 1.7, ticker en pause). Mais il faut le
trouver dans Settings, et tour 1 personne ne sait. **Le mode
cognitive-friendly devrait être proposé proactivement à l'écran
d'accueil**, pas planqué.

**T22 — première préfiguration sépia post-fix.** Je hover trois choix
de suite. La box-shadow change de couleur, la bordure aussi, le card
respire. **Le SceneCard reste lisible**. C'est l'effet recherché par
le commit. La plume a disparu et personne ne la regrette. La
préfiguration vit dans la chrome (bordure + halo), pas dans le contenu.
Lentille designer indé : c'est un pattern Disco-Elysium-grade —
l'ambiance se signale *autour* du texte, pas *par-dessus*.

**T28 — passage de l'ère Belle Époque à Entre-deux-guerres.** Le
`.cockpit::before` (CockpitShell.svelte:822-912) change de gradient.
J'ai dû relire le code pour comprendre que ça transitionne en 1.6s.
Joli. Lentille dyslexique : c'est un signal d'époque que je peux *sentir*
sans le lire. C'est une des trois choses qui me sauvent ici.

## Partie 2 — Compulsif · Seillière/patron · ~22 tours regardés

**T1 compulsif — identity anchor.** `Toi, [Manon], Section CGPF. Le
téléphone à manivelle attend, les Gauloises planent.`
(`SceneCard.svelte:262-267`). En italique CINZEL `rgba(244, 213, 140,
0.78)`, séparé par un filet doré. **Moment marquant**. C'est
exactement le ton Disco Elysium — la voix intérieure ancre le corps
avant le choix. Mon ego designer indé est jaloux.

**T8 — animation `compulsif-vibe`.** Le `filter: contrast(1.04)
brightness(0.97)` à 4s ease-in-out (`CockpitShell.svelte:813-816`)
est sub-perceptible. Bien dosé. Mode Réfléchi a la lumière chaude
jaune apaisante, mode Compulsif a un halo rouge serré
(`CockpitShell.svelte:806-811`). **L'identité par mode est tenue.**

**T14 — le 3e indice qui manque.** Le coherence-flag (✓ aligned / ⚠
opposed) en haut-droite du choice-btn (`SceneCard.svelte:411-416`)
est la chose la plus *CK3-grade* du jeu. Ça devrait être célébré dans
l'onboarding. À la place c'est juste là, sans tutoriel. Designer indé :
**P1, sous-utilisé**.

## Tour des 7 ateliers — angle polish

| Atelier | Verdict polish |
|---|---|
| Trésorerie (`TreasuryPanel`) | OK, tabular-nums, lisible |
| Talents/Formation | tuiles serrées, dense mais cohérent |
| Organisation | bon, charte typo respectée |
| Manifestation (sim) | attention asset photo manquant T18, vide gris |
| Meeting (sim) | sympa, le pupitre comme métaphore tient |
| Mandat — Table Négociations 1945 | placeholder + lien vers mini-jeu pivot ; *dette assumée*, OK |
| Monde — Statut Juridique 1864 | placeholder + mini-jeu pivot livré |

Les deux placeholders Mandat/Monde (`CockpitShell.svelte:496-518`)
disent honnêtement « en construction (vague β/δ) » et offrent un mini-jeu
pivot à la place. C'est un *bon pattern d'attente* — mieux que de
masquer un onglet verrouillé.

## Identité globale — verdict designer indé

- **Typographie assumée.** Cinzel en titre + Source Serif 4 en corps,
  cohérent partout (cf. `app.css:130, 145-147`). Pas de Roboto, pas
  d'Inter. Le jeu *a une voix typographique*. Rare.
- **Palette cohérente.** 5 époques × tokens (`CockpitShell.svelte:733-772`),
  6 postures × accents (`choicePosture.ts:52-98`). Les couleurs
  *racontent quelque chose* (corail rupture, bleu institution).
  C'est de la palette éditoriale, pas un design system corporate.
- **Sépia/parchemin tenu.** Mode sombre `#0d1014` pour le sky,
  parchemin `#ede4c9` pour les overlays clairs (mini-jeu Statut
  Juridique). Le mode dark *est l'identité*, le parchemin signale
  un saut hors-cockpit (vers un dispositif imprimé). Ça aussi
  c'est rare et bien tenu.

## Trois endroits où la mise en forme me sauve (lentille dyslexique)

1. **L'identity anchor compulsif** (`SceneCard.svelte:325-329`) —
   une seule ligne italique, séparée du setup par un filet or. Je
   commence à lire *là*, pas dans le pavé.
2. **La barre d'accent 4px** (`SceneCard.svelte:525`) — couleur =
   posture, je *sais* sans lire si c'est rupture ou compromis.
3. **Les `.previews` des ressources en mode Réfléchi**
   (`SceneCard.svelte:455-465`) — pastilles ▲/▼ colorées vert/rouge
   avec glyph ressource. Je décode l'impact en 1 seconde.

## Trois endroits où j'ai relu trois fois

1. **L'`ability-hint` `EFFETS +12%` / `-23%`**
   (`SceneCard.svelte:444-453`) — la formule est dans le `title=`
   tooltip, mais le badge tout seul est cryptique sans hover. Mobile
   = condamné à être incompris.
2. **La table `ERA_SENSORY`** (`SceneCard.svelte:245-261`) — quand
   l'ère bascule à `cohabitations` ou `sarkozy`, l'ancrage sensoriel
   est *tellement* dense (« ton BlackBerry vibre, l'open space
   bourdonne ») que je relis pour identifier ce qu'on me décrit.
   Sublime mais lourd.
3. **Le ticker de news** (`NewsTicker`) — défile en arrière-plan,
   bruit de fond. Mon TDAH décroche. Heureusement le mode Théâtre le
   masque (`CockpitShell.svelte:325-329`) et le mode cognitive le
   met en pause.
