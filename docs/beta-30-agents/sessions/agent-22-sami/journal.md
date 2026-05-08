# Session Agent 22 — Sami L. (coursier Deliveroo, CLAP)

> Note de lentille — je suis pas joueur de stratégie. Mon FIFA, c'est le geste : un bouton, un effet. Ici je joue 100 tours. Cinq écrans avant même de toucher un truc. Je vais être franc.

## Avant de jouer — l'écran d'accueil

J'ai cliqué sur « Côté salarié » parce que c'est la seule case qui pouvait me ressembler. Sous le bouton, ça dit « Délégué, syndicaliste » (`src/components/intro/StartScreen.svelte:135`). Je suis pas délégué — je suis auto-entrepreneur, je suis CLAP. Le jeu m'oblige déjà à porter une casquette qui n'est pas la mienne. Premier soupir.

## Tour 1 — partie « salarié »

Le hint apparaît : *« Bienvenue Sami. Lis le scénario, puis clique l'une des options... »* (`src/components/cockpit/CockpitShell.svelte:388-405`). OK, c'est gentil.

Je lève les yeux : **7 jauges en haut**. Caisse, Confiance, Santé soc, **Légitimité**, **Force ext**, **Force int**, Institution (`CockpitTopHeader.svelte:121-136`). Le mot « Légitimité » — j'ai dû relire trois fois. Force ext / Force int : je sais pas la différence sans le tooltip. Le **tutoriel** que je viens de lire m'avait dit *« Tu as 6 jauges »* (`src/components/intro/Tutorial.svelte:127`) — il en manque une. Le code et le tuto ne disent pas la même chose. Découragement net.

8 boutons d'action en bas (`CockpitDashboardBar.svelte:36-45`) : Tracts, Meeting, Manif, Pétition, Délégation, Presse, Budget, Table. Ça je connais. C'est la seule partie de l'écran qui me parle. Mais on me dit *« 1 décision + 0 à 2 actions libres »* — donc je peux pas spammer la manif comme je voudrais.

## Tours 2-5 — « salarié »

Le scénario du tour 2 parle de coalitions interdites avant Ollivier. Je sais pas qui est Ollivier. Je clique le mot pointillé, glossaire, OK. Mais à chaque tour deux ou trois mots à survoler. Ça casse le rythme.

Au **tour 3**, je tente un meeting. Tooltip : *« boosté par Caisse + Confiance »*. Pas mal, je commence à comprendre : les jauges nourrissent les actions (`resourceUtility.ts:46`). Ça c'est cool, j'aurais aimé qu'on me le dise plus tôt.

**Tour 5** : je décroche. Je viens de lire 3 paragraphes de contexte historique sur le compromis Engel-Dollfus 1830-quelque-chose. J'ai 95 tours devant moi. Je quitte. NPS bas.

## Reprise — « patronal », curiosité

Je relance, camp patron. Pareil — 7 jauges, mêmes mots compliqués. Le vocabulaire ne change pas selon le camp. Au **tour 8** je tombe sur un scénario CPME / U2P (`src/game/content/scenarios/cpme.ts`) — ça parle de trucs pros que mon père connaîtrait. Pour moi, opaque.

## Tour 94 — le scénario qui me concerne ENFIN

Je saute en avant pour voir si le jeu me parle un jour. **Tour 94, scénario `plateformes-directive-2026`** (`src/game/content/scenarios/futur.ts:106-187`). Et là — claque. Place de la République, 2 000 livreurs, gilets jaunes, CGT-coursiers, **CLAP nommé** (`futur.ts:115`). Trois choix : requalification massive, statut paritaire TPL, organisation hors-statut. **C'est moi**. C'est exactement ma vie.

Mais il a fallu attendre le tour 94 sur 100. Je joue 93 tours d'histoire qui n'est pas la mienne pour un tour qui l'est.

## Bilan en jeu

Le jeu existe pour moi — au tour 94. Avant, c'est un cours d'histoire avec une UI dense. SUD-Solidaires : seulement dans le glossaire (`glossary.ts:309-311`), pas jouable. Annick Coupé citée comme **manquante** au roster (`legendaryCharacters.ts:373-378`). Le coursier CLAP composite est listé comme TODO (`legendaryCharacters.ts:379`), pas implémenté. Je suis pas dans le casting.
