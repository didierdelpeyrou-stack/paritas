# Journal — Soren Johnson · PARITAS v2.2.2-prebeta
## Beta-test simulé · 2026-05-08

> *Je joue, je ne juge pas en surplomb. Je veux savoir si je peux PRÉDIRE — pas si c'est joli.*

---

## Lentille initiale

J'ouvre `src/game/engine/choiceResolver.ts`. Première lecture sereine : la fonction est pure (`state in → state out`), les effets sont décomposés en 4 étapes lisibles (résolution numérique → traits/stress → mémoire → fatigue militante). C'est rare, et je le note. Old World aurait approuvé.

Mais ligne 35 : `applyAbilityModulation`. Les effets ressources sont modulés par `fuelMultiplier(score)`, pente 0.4/100, bornée ±20%. Le badge `EFFETS +X%` est bien affiché côté `SceneCard.svelte:452` avec breakdown `Légitimité 70 (×3) + Force 60 (×2) + ...` dans le tooltip — j'applaudis. Score arrondi pour cohérence badge↔calcul (`resourceUtility.ts:140`, commentaire « Argus P0 »). Bonne hygiène.

Mais je remarque immédiatement : **les `previews` de SceneCard n'utilisent PAS le multiplier** (`choicePosture.ts:120`). Les flèches ▲/▼ sont calculées sur le delta brut. Donc le joueur voit `+5 confiance` (mineur) qui devient en réalité `+6` (×1.20) ou `+4` (×0.80). Le seuil mineur/majeur (5) est juste à la frontière. **Mauvaise feedforward.**

Pire : en mode `compulsif` (instinct), AUCUN preview ne s'affiche (`SceneCard.svelte:383`). Le badge `EFFETS +X%` reste, mais les flèches disparaissent. C'est cohérent narrativement (« choix au feeling ») mais pour mon archétype c'est un trou noir.

---

## Partie 1 — Cible : Refondation

Je vise `endingEngine.ts:33` : `inst >= 5 && r.institution >= 70 && refus >= 2`. Lecture du modèle : il me faut 5 institutions, institution≥70, et 2 refus de compromis. Clair, lisible, prédictible. Soren content.

Tour 1-12 (1789-Le Chapelier → 1864-coalition). Je joue en `reflechi`. Les flèches s'affichent. Je farme `legitimite` et `institution` via choix « table » et « congrès ». Atelier **Trésorerie** : `MiniGameFuelHeader` me dit clairement que `caisse` (×3, ●●●) est critique. Je sais ce que je fais.

Tour 30 : je peux prédire mon score à ±15 % ? **Oui** sur `cohesion`, `construction`, `resistance` (formules visibles dans `scoring.ts:15-19`). **Non** sur `mandate`, qui dépend de `objectiveScoreContribution` — la pondération `* 0.18` n'est nulle part visible côté UI. Score final = boîte semi-noire.

Tour 60-100. Je signe Matignon (institution+1), Sécu 1945 (institution+1), CHSCT 1982 (institution+1), conventions 1919 (institution+1), prudhommes (institution+1). 5 institutions. r.institution monté à 74 par effets cumulés. Refus de compromis : 2 (sur `traite-flexibilite-2017` et `accepte-jaunes`). **Refondation verrouillée.** Score final 71/100. Predicted 65-75 ✓.

**Marquant** : tour 64, callback `signe-matignon` (`choiceResolver.ts:107`) — Frachon t'écrit, T+5. Je n'attendais plus ce moment, il arrive. CK3-grade authentique. Ça compense LARGEMENT mes griefs sur la transparence.

---

## Partie 2 — Cible : Capture

`endingEngine.ts:31` : `trahis >= 3` → seuil net. Je multiplie les `trahit-base`. Effet immédiat : `betrayedBase++`. Mais le score est puni par `malus = trahis * 8` (`scoring.ts:19`). Score final 28/100 — la « capture » est punitive, c'est cohérent avec la lentille morale du jeu. Je note : **les fins ne sont pas équivalentes en score**, ce qui est correct narrativement mais induit une asymétrie de design : un complétiste optimisera la Refondation, jamais la Capture. Civ IV faisait pareil avec Cultural vs Conquest victories — choix conscient ou pas ?

---

## Audit ressources × pertinence

7 ressources. Toutes citées dans `RESOURCE_FUELS` (`resourceUtility.ts:45-93`). `institution` apparaît 3× (table×3, congres×2, delegation×2). `santeSociale` apparaît 3× seulement (petition, meeting, presse) — sous-utilisée vs `confiance` qui apparaît 5×. Pas grave en soi, mais `santeSociale` est faible levier dans le scoring final (poids 1/3 dans `cohesion`).

`rapportDeForce` × `cohesionInterne` : la distinction (force EXTERNE vs INTERNE) est bien expliquée dans `RESOURCE_TOOLTIPS` (`resources.ts:57-58`). C'est élégant — Old World n'avait pas cette dualité, je la trouve juste.

---

## Tempo

Choix résolus en 1 frame (pure function). Callbacks différés N+3..N+5 = excellent rythme — l'écho narratif arrive 2-3 minutes après la décision, pile dans la fenêtre de mémoire courte. **Tempo validé.**

---

## Verdict

Le moteur est lisible, transparent à 80 %. Le badge `EFFETS +X%` avec breakdown est exactement ce que je demandais dans le panel — j'ai été entendu. Reste le trou : **les previews ne reflètent pas le multiplier**, et la contribution `mandate` au score final n'est pas tracée. Deux fixes ciblés et je signe le bêta-public.
