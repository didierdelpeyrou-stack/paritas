# Journal — Yanis B. / Agent-19
## Session bêta-30 · PARITAS v2.2.2-prebeta · 2026-05-08

> *Lentille : étudiant L3 Sciences Po Lyon, 21 ans, joueur ordinaire jeune.
> Le syndicalisme reste abstrait — je connais "CGT" parce que ma grand-mère
> en parle, mais "paritarisme" n'a aucune chair. Je joue mentalement deux
> parties depuis le code, en mode Réfléchi (le pédago), pour tester si le
> jeu m'apprend ou s'il me parle déjà comme à un syndiqué.*

---

## I. Pré-jeu — l'onboarding (Tutorial.svelte)

J'ouvre le tuto novice, 4 écrans (`Tutorial.svelte:39`). Premier écran, la
définition canonique :

> *« Le patron et le salarié ne sont presque jamais d'accord. Parfois, ils
> acceptent de s'asseoir à la même table. »* (`Tutorial.svelte:108-117`)

C'est bien — phrase courte, pas de jargon, le mot *paritarisme* arrive en
toute fin avec un pointillé doré qui ouvre le glossaire. **Premier point
gagné.** Je le comprends en 30 secondes. Je n'aurais pas compris si on
m'avait sorti « gestion partagée à parité d'instances sociales ».

Écran 2 : six ressources. *Confiance, Caisse, Santé sociale, Légitimité,
Rapport de force, Institution* (`Tutorial.svelte:131-138`). Sept secondes
de lecture. OK.

Écran 3 : six postures. **Là je décroche un peu.** *Rupture, Institution,
Compromis, Expertise, Opinion, Paternaliste* (`Tutorial.svelte:53`). Le
mot « posture » est abstrait. À 21 ans, je dirais « style de jeu » ou
« façon de jouer ». « Posture politique » sonne prof de sciences-po.

Écran 4 : anatomie du scénario, 5 parties. Bien fait, mais long. **Je
serais tenté de cliquer "Passer" en haut à droite.** Le bouton est bien
visible (`Tutorial.svelte:202`). Risque réel.

## II. Partie 1 — campagne salariée, 30 tours (Réfléchi)

### Tour 1-3 : la prise en main

Écran de jeu, le hint mécanique apparaît au tour 1
(`CockpitShell.svelte:388-409`) :

> *« Bienvenue Yanis. Lis le scénario, puis clique l'une des options pour
> engager ton choix. Tu peux aussi déclencher 1 à 2 actions libres
> (tracts, meeting, manif…) depuis la barre du bas. »*

Le hint est dismissable, persisté en localStorage
(`CockpitShell.svelte:118-127`). Bien. Je l'ai lu. **Mais l'expression
"action libre" me parle pas tout de suite.** C'est une mécanique de jeu
spécifique. À T2, je tâtonne — qu'est-ce qui se passe si je ne fais
qu'une seule chose par tour ? Ça avance pareil ?

T1 — *Loi Le Chapelier, 1791* — survole le mot : pop-up glossaire dorée
(`GlossaryText.svelte:103-108`). **Ce détail est super.** Pointillé doré
+ italique = signal lisible. Je clique, modale s'ouvre. Confirmé.

### Tour 4-9 : je commence à comprendre

À T6, je sens le rythme : 1 décision scénario + 0 à 2 actions. Le hint a
disparu après ma 1ère action libre (`CockpitShell.svelte:386`). OK. À
**T9 je modélise** : 6 jauges, j'optimise rapport de force et caisse
parce que je veux faire grève.

### Tour 12 — premier atelier : *La Place* (LaPlace.svelte)

Header : `ATELIER · LA RUE` puis « La Place » (`LaPlace.svelte:88-90`).
**Confusion :** le tag dit RUE et le titre dit PLACE. Je ne sais pas
pourquoi deux mots. Ça arrive partout (`LaTable.svelte`,
`LaGreve.svelte`, etc.) — chaque atelier a un nom poétique
+ un tag descriptif. Esthétiquement c'est beau, mais pour moi qui découvre,
**je dois deviner que "La Table" = négociation et "La Place" = manif**.
Pas d'écran d'intro qui me dise « tu vas jouer une scène de manif, voici
comment ça marche ».

Je tâtonne 3 actes, j'apprends en jouant. *escalade ⚡* / *foule 👥* —
les jauges sont visuelles (`LaPlace.svelte:99-115`). OK pour ça.

### Tour 18 — *La Table* (LaTable.svelte)

**Là je décroche un peu.** L'atelier est entre Salarié et Patron en
duel, 3 rounds, mécanique zone-cursor. Aucun tutoriel intra-atelier
contrairement à la NAO. Je vois 5 boutons côté Salarié : *ancrer,
concéder, médiatiser, consulter, rompre* (`LaTable.svelte:40-49`). Je
clique au hasard 4 fois. Je ne comprends pas la zone. **Verdict : je
joue mais je ne sais pas pourquoi je gagne ou perds.**

### Tour 24 — *NaoSimulation* (NaoSimulation.svelte)

**Excellent.** Tutoriel diégétique en aside, ouvert à la 1ère séance
(`NaoSimulation.svelte:260-273`). Trois bullets clairs : enveloppe
employeur, posture syndicat, seuil 50 %. Je comprends en 20 sec.
**C'est exactement ce qui manque aux 6 autres ateliers.**

### T30 — fin partie 1

J'ai compris le moteur principal vers T9. J'ai compris les ateliers
*La Place* (par tâtonnement T12-15) et *NAO* (instantanément T24). Je
n'ai pas compris *La Table* (T18-22) — je l'ai joué sans modèle mental.
**Comprendre le paritarisme comme concept ?** Pas vraiment. J'ai compris
le jeu *autour* du paritarisme. Le mot reste flou.

## III. Partie 2 — campagne patronale, 25 tours

J'expérimente l'autre camp. Je pensais que ça allait inverser les
boutons — c'est plus subtil : c'est une lentille différente sur les
mêmes scénarios. **Bien fait.** Mais à T8, je tombe sur *Auroux 1982*
(`glossary.ts:117-120`). Je clique le glossaire — définition claire,
marker `1982`. **Les 59 entrées de glossaire** (`glossary.ts`, 396
lignes) sauvent la lecture pour 80 % des termes que je ne connais pas.
Sigles `cse`, `fo`, `cgt`, `cfdt` matchent à 2 caractères
(`GlossaryText.svelte:14, 16`). Excellent fix.

**Manque cependant** : à T15, je vois « ANI 2008 » dans une consigne et
le mot ANI n'est pas défini. Trou de glossaire (à vérifier en exhaustif).

## IV. Synthèse personnelle

Au bout de **2 parties (~55 tours)**, je peux dire à un pote :
« Le paritarisme, c'est quand patron et syndicat décident ensemble des
règles du boulot, sans l'État. » C'est pédago-réussi. **Mais ça m'a pris
2 parties — pas 5 tours comme promis dans le pitch.**

Si je joue ce jeu une seule fois et que je décroche à T15, je n'aurai
appris ni le mot ni le concept. **Le risque de décrochage est T15-25 sur
les ateliers non-tutorisés.**
