# Journal — agent-13-muratori (Casey Muratori, Handmade Hero)

**Build** : v2.2.2-prebeta · HEAD `0813c75`
**Date** : 2026-05-08
**Corps** : Sapeurs
**Mode de session** : audit code-only, lecture profilée du tick. Pas de DevTools en runtime — j'ai joué le moteur dans ma tête, ligne par ligne.

---

## J'ouvre `gameState.svelte.ts`. 1061 lignes.

D'abord la bonne nouvelle : ce n'est pas un god-object au sens classique. C'est une CLASSE store, et 90% des lignes sont des méthodes verticalement empilées qui muent vers les vraies pure functions de `src/game/engine/`. Le séparation des préoccupations est faite. Le store coordonne, les engines calculent. Bien.

Puis je commence à compter les `this.state = { ... }` dans `choose()` (ligne 250-293), `continueAfterConsequence()` (ligne 362-413), `resolveMatignon()` (ligne 423-492), `resolveLaPlace()` (501-566). C'est SIX endroits où la logique de tour se branche, plus deux ateliers (Matignon, La Place) qui ré-implémentent leur propre `phase: 'consequence'` à la main avec leurs propres deltas. Si un Diplomate ajoute un troisième atelier demain, il copie-colle 60 lignes. Mauvais signe.

## Ligne 14-25 de `consequenceEngine.ts` : la purity claim ment.

`scheduleActorCallback(memory, atTurn, ...)` fait `memory.scheduledActorCallbacks.push(...)`. C'est une fonction void qui MUTE son argument. Et `choiceResolver.ts:5` clame en commentaire : *« Pure function : prend un state, renvoie un nouveau state »*. Faux. Quand `resolveChoice` appelle `scheduleActorCallback(nextMemory, state.turn + 4, ...)` à la ligne 85, le `nextMemory` provient de `consumeChoice/markPlayed/addAccord` qui font `{...memory, ...}` — shallow clone. La RÉFÉRENCE `scheduledActorCallbacks` est partagée avec le state original. Le push mute donc l'array d'entrée. **Pas pur**. Heureusement, `gameLoop.ts:46-48` fait `[...(state.memory.scheduledActorCallbacks ?? [])]` avant `consumeActorCallbacks` — donc le DEUXIÈME mutateur ne fuit pas. Mais le premier, si.

C'est exactement le genre de bug qu'on ne voit pas tant que l'undo/redo ou le replay déterministe ne sont pas en place. Le jour où ces features arrivent, ça va péter en silence.

## Le bundle. 147.62 KB gzip pour le main.

Sur 87 composants Svelte 5 (composants seuls, hors src/lib) et 67k LoC, c'est honnête. Svelte 5 a un overhead de ~15 KB. Le reste est code applicatif + 11 entry points (cf. vite.config.ts:50-71). Le chunk `pipelineContentData-DTvNuQgj.js` à 45 KB raw (~13 KB gzip estimé) est BIEN séparé : import dynamique réussi, validé `dist/assets/`. Bravo. Le `audio-DdP1Cr58.js` à 265 KB raw m'inquiète davantage — c'est où ?

## Le tick. Je le lis.

`continueAfterConsequence()` ligne 371-389 : `applyOrganizationUpkeep` → `processTurnCallbacks` → `applyTalentGroupBonuses` → `tickStrategies` → `tickWorldAI` → `tickInternalElection` → `syncPipelines` → `evaluateObjectives`. SEPT passes successives qui réallouent chacune un nouveau state object. Pour 100 tours × deux parties, ça fait 1400 allocations de RebirthGameState. Pas un drame, mais chaque pass spread `{...state, x: y}`. Un seul `applyTick(state)` qui ferait les sept en un objet final économiserait ~85% des allocations intermédiaires. Pas critique, mais c'est de la graisse.

## CockpitShell.svelte, 1491 lignes.

Le 20% du fichier est du markup ; 80% est du script. 24 imports de composants enfants. Trois `$derived` clean (gameState, scenario, consequence). Quelques `$state` locaux propres. Ce qui me dérange : ce composant orchestre le THEATRE, l'ATELIER ET le carnet via des `if (isTheatre)` / `if (isAtelier)` au lieu de trois fichiers `TheatreShell`, `AtelierShell`, `CarnetShell` qui partagent une `<CockpitFrame>`. Le découpage était à faire avant 1500 lignes. Maintenant il faut le faire à reculons.

## Verdict de jeu

J'ai « joué » deux runs mentalement : Léon Jouhaux 1936 et un Patron CGPF 1968. Le moteur tient. Les pure functions de `src/game/simulation/`, `src/game/org/`, `src/game/strategy/` sont effectivement pures (j'ai vérifié 4 d'entre elles). Le store fait son boulot. Mais il y a deux fissures qui vont s'élargir : (1) la purity-leak des callbacks acteurs, (2) la duplication de logique de phase entre `choose / continueAfterConsequence / resolveMatignon / resolveLaPlace`.

Le code est PROPORTIONNEL au jeu. Pas de framework gratuit, pas d'abstraction performative. Je respecte. Mais il commence à porter les cicatrices d'un refactor reporté.

---

**Biais reconnu** : je suis ennemi de l'abstraction par principe — donc quand je dis « il faut splitter CockpitShell en 3 », je sais que je le dirais aussi pour 800 lignes. À 1491, c'est juste objectif.
