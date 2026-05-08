# Journal de session — Brenda Romero (agent-05)
## Bêta-test PARITAS v2.2.2-prebeta · 2026-05-08

> *"J'ai fait Train. Je sais ce qu'un jeu peut faire à une mémoire. La question que je
> pose à PARITAS n'est pas 'est-ce que je gagne ?' — c'est 'est-ce que mes choix me
> reviennent dessus, plus tard, sans que je puisse les ranger ?'"*

---

## Partie 1 — Patron, 1936-Matignon, branche dure

J'entre par le scénario `1936-matignon.ts`. Je joue côté patron. Je cherche
**la branche corruption préfet** annoncée dans le briefing. Je ne la trouve
pas — elle n'existe pas dans `patron.ts:354-450` (Grenelle patron) ni dans
`patron.ts:91-180` (cgpf-1936). Les trois choix patronaux à Matignon sont :
*tenir la ligne Duchemin*, *soutenir Gignoux*, *scission*. Tous moralement
gris — pas de bouton "corrompre" frontal. **Premier soulagement, premier
malaise**: le jeu refuse la corruption-spectacle. Bien. Mais ne me laisse pas
non plus l'inconfort de la corruption-banale — celle qui s'écrit au stylo
plume dans un café près du ministère.

Je choisis `cgpf-gignoux` (rupture, +rapport, -santé sociale). Le flag
`epuise-mouvement` se pose. Cinq tours plus tard, log :
> *T26 — Mémoire (Base) : Les permanences se vident. Trois militants
> démissionnent sans bruit.*

`choiceResolver.ts:151-158`. **Ça mord.** Pas le tour suivant — cinq tours
après. J'avais déjà oublié. C'est exactement ce que je cherche dans Train :
le retour différé sans excuse. Note : la voix est sobre, pas accusatrice.
Romero-grade.

Je continue. T29, je vois l'alerte budget congrès. T31, je pousse `cgpf-tenir`
sur le suivi — flag `cgpf-cogestion`. T35, log :
> *T35 — Mémoire (Adversaire) : Une réunion CGPF restreinte refuse ton
> ouverture. "Pas de cogestion. On garde la main, ou on perd tout."*

`choiceResolver.ts:178-185`. **L'adversaire patronal est mon propre camp** —
le jeu me dit que même côté patron, signer Matignon te coupe d'une partie
des tiens. C'est la trace la plus honnête de la session.

## Partie 2 — Salarié, 1968 Grenelle, "refuser de scissionner"

Reset. Camp salarié. Tour 31, scénario `grenelle-1968` (`premium.ts:428`).
Trois choix : signer (`signe-grenelle`), rejeter (`epuise-mouvement`),
prioriser la section (pas de flag callback).

Je cherche l'option Romero : *honneur dans le refus*. Le rejet existe
(`grenelle-rejeter`), mais il est marqué `epuise-mouvement` — autrement dit,
le jeu **lit le refus comme un sur-usage**. Tour 34, log :
> *T34 — Mémoire (Base) : Les permanences se vident.*

C'est inconfortable au bon sens : rejeter Grenelle au nom de l'élan
révolutionnaire **t'épuise**. Pas de récompense morale. Le jeu ne console
pas le refusenik. Je note `agent-05-romero.md` — *"jeu qui blesse"* :
réussite.

Mais : je teste signer. Tour 35, log :
> *T35 — Mémoire (Base) : Aux portes de Renault-Billancourt, on lit les
> accords à voix haute. "35% du SMIG, c'est bien. Mais ce n'est pas la
> révolution."*

`choiceResolver.ts:119-126`. **Aucun choix n'est propre.** C'est ce que je
cherche.

## Test des 7 ateliers — angle trace mémorielle

Je passe les 7 ateliers (arena, table, place, elections, nao, manif, greve,
meeting + matignon + confrontation = 10 standalones, 7 actifs en cockpit).
Verdict : **les ateliers sont jouables, pas mémoriels**. Aucun atelier ne
pose de `scheduleActorCallback`. Une fois sortie de l'atelier, je n'ai plus
de trace narrative différée — seulement les deltas de ressources. Or les
mini-jeux sont là où le joueur **transpire** ; c'est là que la trace devrait
mordre le plus. Trou actuel : `LaPlace.svelte`, `LaTable.svelte`,
`Confrontation.svelte` n'écrivent pas dans `memory.scheduledActorCallbacks`.

## Audit code — flags pivots manqués

Je cross-réfèrence les 13 callbacks (`choiceResolver.ts:83-193`) avec les
flags du catalogue scénarios. **9 flags pivots sans écho différé** :
- `cnpf-insertion`, `cpme-divergence-medef`, `patronat-organise`,
  `pose-charte-independance`, `enter_matignon` → vrais trous narratifs
- `cree-conventions-1919`, `cree-mutuelle-1864`, `cree-syndicat-1884`,
  `cree-unedic`, `cree-prudhommes` → posent une institution
  (`choiceResolver.ts:60-66`) mais aucun acteur ne réagit. Or créer la Sécu
  fait écrire l'État (`cree-secu` → callback etat T+5) ; pourquoi créer les
  prud'hommes ne fait écrire personne ?

**Asymétrie patron** : sur 13 callbacks, 4 seulement servent le camp patron
(`cgpf-cogestion`, `epuise-mouvement` partagé, `mediation-elysee` partagé,
`refondation-paritaire` partagé). Le patron a **moins de mémoire** que le
salarié. C'est lisible comme parti pris politique — assumé ou involontaire ?

## Conclusion (~520 mots)

Le moteur de mémoire CK3-grade fonctionne — la boucle est fermée
(`gameLoop.ts:39-54`, branchement `gameState.svelte.ts:376`). Treize
callbacks, 1789-2017, sobres, tardifs, sans excès. **Romero approuve la
forme.** Reste deux dettes : (1) les ateliers ne posent pas de callbacks —
le moteur respire, les mini-jeux sont muets ; (2) le camp patron est
sous-mémorisé. Dans l'état, le jeu te laisse trop tranquille **côté
patron** : je peux jouer Gignoux et n'avoir qu'**une** lettre tardive.
Trois suffiraient à rendre Matignon insupportable au bon sens.
