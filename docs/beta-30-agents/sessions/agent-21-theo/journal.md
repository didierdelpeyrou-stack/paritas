# Journal — Théo G., 27 ans, R&D Thales, CFE-CGC
## Session bêta PARITAS · build v2.2.2-prebeta · lentille Paradox/CK3

> Briefing reçu : "Théo dev backend, CGT-Métallurgie, joue Paradox / EU4 / CK3."
> Mon profil agent-21 dit autre chose : R&D Thales, CFE-CGC, Civ VI / Old World.
> Je note la divergence et je joue avec ma vraie tête : cadre catégoriel,
> joueur de 4X/grand stratégie. La lentille CK3 demandée par le PM est
> légitime — j'y joue à l'occasion chez un pote, et **c'est bien le bon
> repère** quand le bulletin ORDA-014 parle de "mémoire CK3-grade".

## Audit code avant de jouer

J'ouvre quatre fichiers, parce que je veux savoir si le marketing tient.

### `src/game/narrative/personalityEngine.ts`

73 lignes utiles. Six traits, antagonismes croisés (rupture↔batisseur,
tribun↔technocrate, pragmatique↔paternaliste). Stress = formule pure :
`+6 × antagonistPush, +4 si dominant ≤−2, −2 si dominant ≥2`
(`personalityEngine.ts:104-107`). Quatre paliers (serein/inquiet/tendu/
effondré) à 25/55/80 (`personalityEngine.ts:121-146`).

**Verdict CK3** : la formule est honnête — c'est exactement le pattern
*stress from off-character actions*. **Mais** : `stressLevel()` ne
retourne qu'un label + un hint. **Aucun consommateur du level "effondré"
ne change la mécanique du jeu.** J'ai grepé. Le stress est un thermomètre,
pas un facteur. CK3 fait pleurer ton perso, lui inflige du wounded,
le fait basculer en lifestyle alternatif. Ici, "tu n'es plus celui que
tu pensais être" est un texte qui s'affiche et c'est tout. **Theming
superficiel sur ce point précis.**

### `src/game/engine/choiceResolver.ts`

233 lignes. Je compte 14 appels `scheduleActorCallback` sur 13 flags
uniques (lignes 83-193). Le pattern est propre : flag → tour cible
(turn+3 à +5) → narrative typée par acteur. Je vois Matignon 1936,
Grenelle 1968, FO 1947, Juppé 1995, Sécu 1945, Auroux 1982, CGPF 30s,
ordonnances 2017. **Couverture historique 1936→2017 sérieuse.**

**Verdict** : 13 callbacks pour 100 tours, ça fait ~1 callback toutes
les 7-8 tours en pic d'activité, **et seulement si le joueur déclenche
les bons flags**. Ce n'est pas la densité CK3 (où chaque vassal a sa
file de griefs). C'est une orchestration sobre, scénarisée. **Plus
proche d'Old World que de CK3** — décisions historiques avec écho
plutôt que sandbox émergent. Et c'est OK, c'est un jeu pédagogique
100 tours, pas un sandbox dynastique 800 ans.

### `src/game/engine/consequenceEngine.ts`

L'API callbacks : `scheduleActorCallback / dueActorCallbacks /
consumeActorCallbacks` (lignes 146-180). Pure, testée à ~90% (vu
ORDA-014). Le contrat est minimal et bon : pas de file bornée, pas
d'expiration silencieuse, dedupe sur `fromChoiceId@atTurn`. **C'est
une API que j'écrirais au boulot.** TypeScript strict, no-side-effects
(modulo la mutation de `memory.scheduledActorCallbacks` — choix
discutable mais cohérent avec le reste du moteur).

### `src/game/narrative/pipelineEngine.ts`

5 archétypes (institution/rupture/capture/refondation/declin) × 6 stages
= 30 scènes max, gates sur ressources + mémoire (`pipelineEngine.ts:68-76`),
priorité par pression. **C'est la grammaire stratégique
qui me manquait dans la lecture rapide du jeu** : tu es sur un trail
narratif déterminé par tes choix de ressources, pas un menu à 4 branches.
EU4 mission tree, mais sociologique.

## Partie 1 — Bâtisseur réformiste (60 tours)

**Objectif self-imposé** : pousser `batisseur` + `pragmatique`, signer
tout ce qui se signe, voir si la CFE-CGC apparaît quelque part.

- T1-T8 : tutoriel mode équilibré, je trouve mes marques. Atelier NAO
  dispo dès T6 — j'y vais. **CFE-CGC présente comme 4e syndicat**
  (vu ORDA-009, P1-4, voix de Théo #21 cité dans le bulletin —
  c'est-à-dire moi, signal flatteur).
- T15 : premier `signe-matignon`. À T20 (tour+5), Frachon m'écrit
  *"Le 7 juin restera. Tu as bien fait."* (`choiceResolver.ts:111`).
  **Premier moment CK3-grade ressenti**. Pas un trigger de mission, un
  écho d'acteur. Je note.
- T25-T40 : pipeline `institution` se déclenche (j'ai 2 institutions
  + ressource institution ≥64). Trail "Gestion s'installe" → "Réforme
  à écrire". Je sens le rail mais c'est cohérent.
- T48 : NAO multi-syndicats. **Bémol cadre** : la CFE-CGC vote, mais
  les questions débattues restent salaire/temps de travail/primes.
  **Aucune scène ne thématise spécifiquement la question cadre**
  (forfait-jours, RTT cadre, plafond Sécu, retraite Agirc-Arrco).
  Cf. mon livrable §3 ci-dessous.
- T55 : trait dominant bascule batisseur→pragmatique. `traitChange`
  affiché. C'est le moment marquant : le miroir bouge.

## Partie 2 — Tribun de rupture (60 tours)

**Objectif** : pousser `rupture` + `tribun`, refuser les compromis,
voir si le stress devient mécanique.

- T8 : `refuse-compromis`. T12 (turn+4), l'adversaire ricane :
  *"« Le syndicat ne signe rien. On peut continuer. »"*
  (`choiceResolver.ts:87`). **Bonne friction.**
- T20-T35 : pipeline `rupture` se déclenche. Trail "Mémoire de la
  rupture" → "Mot d'ordre" → "Répression ou concession". **Divergence
  narrative claire vs partie 1** — pas le même trail, pas les mêmes
  scènes. Émergence vraie.
- T28 : 4e refus consécutif. Stress monte à 62 (palier "tendu").
  Label + hint. **Je lis. Rien ne change ailleurs.** Mes choix
  rapportent autant. C'est le défaut diagnostiqué dans l'audit
  `personalityEngine.ts`. **Frustration.**
- T40 : `epuise-mouvement`. T43 (turn+3), la base se vide :
  *"trois militants démissionnent sans bruit"* (`choiceResolver.ts:155`).
  Là, ça mord — fatigue militante +25 (`choiceResolver.ts:198`),
  effet réel. C'est la mécanique que je voudrais sur stress effondré.
- T55 : stress 84 (palier effondré). Texte beau, conséquence zéro.

## Tour des 7 ateliers

Confrontation, Élections, Grève, Laplace, NAO, Table, plus la grande
boucle narrative. NAO solide (calibrée 4 unions, accord_majoritaire 31%
en MC ORDA-011). Confrontation dense (969 lignes CSS, refacto reporté
ORDA-006→014). Élections seedées (ORDA-010). **Profondeur réelle sur
NAO et Confrontation.** Les autres sont plus légers.

## Verdict global Paradox-grade

**Holds up à 70%.** Le système callback + pipelines + traits est
authentiquement émergent — pas du theming. Mais le stress sans
conséquence et la densité callbacks (13 sur 100 tours) plafonnent
l'expérience à "Old World scénarisé", pas "CK3 sandbox". C'est
défendable pour un jeu pédagogique. Pas vendable comme "CK3-grade"
sans le fix stress mécanique.

## Livrable spécifique cadre — 3 scénarios où la CFE-CGC manque

1. **Forfait-jours en NAO 2008** — la loi du 20 août 2008 a inversé
   la hiérarchie des normes. Aucune scène n'en parle. La CFE-CGC est
   pourtant la première syndicat sur ce dossier.
2. **Plafond Sécu / Agirc-Arrco fusion 2019** — la fusion régimes
   cadres/non-cadres est un trauma CFE-CGC. Pipeline `institution`
   stage 4 "L'État avance ses pions" pourrait l'accueillir.
3. **Droit à la déconnexion 2017** — loi El Khomri art. 55. C'est
   une victoire CFE-CGC. Le bulletin ORDA-009 dit *"weights télétravail-heavy"*
   pour cfecgc — il y a un crochet, pas de scène.
