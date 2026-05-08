# Journal — Henrik Fåhraeus / Agent-09 (CK3)
## Session bêta-30 · PARITAS v2.2.2-prebeta · 2026-05-08

> *Lentille : « le world remembers ». 13 callbacks acteurs branchés (1789→2017),
> stress de personnalité 4 paliers, 4 acteurs (base/adversaire/etat/opinion).
> Question : a-t-on de la mémoire CK3-grade ou un système d'animations différées ?*

---

## I. Lecture du code (pré-jeu)

J'ai lu les trois bulletins ORDA-012/013/014 et ouvert l'API mémoire.

L'API est minimale et propre :
- `scheduleActorCallback(memory, atTurn, actor, narrative, fromChoiceId, posedAtTurn)` — pousse dans `memory.scheduledActorCallbacks` (`consequenceEngine.ts:146-158`).
- `dueActorCallbacks(memory, currentTurn)` — filtre `cb.atTurn <= currentTurn` (`consequenceEngine.ts:161-167`).
- `consumeActorCallbacks(memory, consumed)` — retire par clé `${fromChoiceId}@${atTurn}` (`consequenceEngine.ts:171-180`).
- `processTurnCallbacks(state)` — pure, clone défensif de la file (`gameLoop.ts:39-54`), branché juste après `advanceTurn()` (`gameState.svelte.ts:376`).

Les callbacks sont préfixés `T{n} — Mémoire ({ActorLabel}) :` et injectés dans le ticker (`gameState.svelte.ts:392-399`). C'est élégant : la file et le moteur de tour sont découplés.

## II. Partie 1 — campagne salariée 1789-1968 (47 tours)

T1-19 : période ouvrière, scénarios pré-Matignon. Stress reste bas (10/100). La voix
de l'avatar n'a pas encore d'antagonisme actif — `computeStressDelta` dépend du
`dominantTrait` qui démarre par défaut sur `pragmatique` (`personalityEngine.ts:32`,
fallback initial).

**T20 — Matignon.** Je signe les six points (flag `signe-matignon`). `confiance +8,
legitimite +12, institution +18`. Le résolveur programme un callback `base` à T25.
Memorable : la phrase inscrite dur dans le code du résolveur — *« Frachon t'écrit,
deux lignes : Le 7 juin restera. Tu as bien fait. »* (`choiceResolver.ts:111`).

**T25 — le ticker tombe.** *« T25 — Mémoire (Base) : Frachon t'écrit, deux lignes... »*
**Là ça touche.** C'est exactement le pattern CK3 : un événement passé revient avec un
nom et une personne. Pas un buff, pas une notif système — une lettre.

T28 — je joue `refuse-compromis` sur un patronat patron. Callback `adversaire` à
T32 : *« L'adversaire n'a pas oublié ton refus... »* — **arrive bien à T32**, le moteur
auto-déclenche.

T35-47 : Grenelle 1968. Je signe (`signe-grenelle`). Callback `base` T39 *« 35% du
SMIG, c'est bien. Mais ce n'est pas la révolution. »* — la voix de la base diffère
nettement de Frachon. Bonne distinction.

**Score final P1** : 5 callbacks déclenchés sur 47 tours. Stress final 38 (« Inquiet »).

## III. Partie 2 — campagne longue 1936-2017 (52 tours)

J'ai joué « rupture » dur : `refuse-compromis` x3, `epuise-mouvement` x2,
`trahit-base` x1.

**Trouvaille gênante** — collision de clés. La fonction de consommation utilise
`${fromChoiceId}@${atTurn}` comme clé (`consequenceEngine.ts:176`). Si un même choix
(même `choice.id`) est joué deux fois aux mêmes intervalles, la deuxième instance
**efface** la première à la consommation. J'ai vérifié : oui, j'ai trahi la base à T18
puis T31, callbacks programmés à T21 et T34 — clés différentes (atTurn distinct), pas
de collision. Mais si un Diplomate ajoute un callback à `turn + 4` toujours, deux
appels au même tour produiront le même fromChoiceId@atTurn. **À documenter ou à
hardener** (P1).

**Trouvaille majeure** — `processTurnCallbacks` filtre `cb.atTurn <= currentTurn`
(consequenceEngine.ts:166). Si le joueur saute des tours (skip ?) ou si un callback
est programmé pour T-passé par bug, il s'auto-déclenche immédiatement, sans alerte.
Pas vu dans la pratique mais le filtre `<=` plutôt que `===` est étonnant. P2.

**Le moment marquant — T44 (Florange/CSE 2017).** J'ai signé `refondation-paritaire`.
Callback `etat` T48 : *« Une circulaire DGT cite ton accord en exemple. »* — combiné
avec un callback `epuise-mouvement` programmé en T41 qui tombe T44 *« Trois militants
démissionnent sans bruit. »* On a deux voix d'acteurs sur le même tour, divergentes.
Effet d'épaisseur. C'est la première fois que je sens une polyphonie CK3 dans le jeu.

## IV. Audit du stress (lentille CK3)

Le système de stress (`personalityEngine.ts:94-108`) est **léger mais juste** :
- +6 par point d'antagoniste poussé
- −2 si dominant ≥+2 (renforcé)
- +4 si dominant ≤−2 (attaqué)
- 4 paliers (`personalityEngine.ts:116-147`) : serein < 25, inquiet [25,55), tendu
  [55,80), effondré ≥80.

**Comparaison CK3** : CK3 a ~30+ traits avec des stress-on-action très spécifiques
(un trait Pieux stressé par actes impies, etc.). Ici, on a 6 traits et 3 paires
d'antagonistes. C'est **assez** pour un jeu pédagogique — ça marche, l'antagonisme
est défini symétriquement (`personalityEngine.test.ts` valide ça).

**Manque** : aucune **conséquence mécanique** du stress effondré. Dans CK3, stress
élevé déclenche des « mental break » events (alcoolisme, paranoïa, etc.). Ici,
`stressLevel` retourne juste un label/hint pour l'UI (`PersonalityPanel.svelte`,
`CockpitRightRail.svelte:64` qui affiche un alert ≥70). **Pas de consequence
émergente.** P1.

## V. Audit ateliers

Sur 7 ateliers, aucun ne lit ou consulte `personalityStress` ou
`scheduledActorCallbacks` au démarrage. Les ateliers (matignon-main, nao-main,
greve-main...) sont des mini-jeux fermés, sans lecture de mémoire d'acteurs. Donc :
les conséquences à long terme s'arrêtent à la frontière de l'atelier. **C'est un
manque CK3 : un stress « effondré » devrait pénaliser le mini-jeu Matignon (mains
qui tremblent), un callback `base` négatif devrait empoisonner les NAO.** P1-P2.

## VI. Synthèse

Le « world remembers » fonctionne — je l'ai senti. 13 callbacks ne suffisent pas
pour 100 tours mais le pattern est extensible (les Diplomates n'ont qu'à ajouter
un `if (choice.flag === 'X') scheduleActorCallback(...)`). C'est sain.

**Ce qui manque pour vraiment être CK3** :
1. Le stress doit avoir des conséquences mécaniques, pas juste un label.
2. Les ateliers doivent être teintés par la mémoire (les acteurs y portent les
   blessures du passé).
3. La collision de clés `fromChoiceId@atTurn` est un risque à hardener.

Mais le squelette est là. **Frachon est mon roi mémorable.**
