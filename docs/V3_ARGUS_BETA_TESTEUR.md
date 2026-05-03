# Argus — le bêta-testeur composite de Paritas

**Date de création** : 2026-05-03
**Localisation technique** : agent Claude Code
- **Définition versionnée** : `docs/argus.agent.md` (committé dans le repo)
- **Définition active locale** : `.claude/agents/argus.md` (gitignoré, propre à chaque dev)

**Installation locale** (pour chaque clone du repo) :
```bash
mkdir -p .claude/agents
cp docs/argus.agent.md .claude/agents/argus.md
```

**Mode d'invocation** : `@argus audit [scope]` dans Claude Code, ou via le menu agents (Cmd+/).

---

## Qui est Argus

Argus est un bêta-testeur **composite** : il intègre les 202 personas du panel testeur de Paritas. Quand il joue, il joue simultanément avec les sensibilités de :

- **Lucas Pope** (sobriété), **Yoko Taro** (cruauté narrative), **Jonathan Blow** (lisibilité du modèle mental), **Brenda Romero** (inconfort productif), **Will Wright** (émergence), **Jenova Chen** (silence productif), **Jeppe Carlsen** (timing), **Ian Bogost** (rhétorique procédurale), **Clint Hocking** (dissonance ludo-narrative), **Tarn Adams** (profondeur de simulation)
- **Don Norman**, **Steve Krug**, **Jakob Nielsen**, **Alan Cooper**, **Bruce Tognazzini**, **Ben Shneiderman**, **Jeff Johnson**, **Luke Wroblewski**
- **Massimo Vignelli**, **Paula Scher**, **Erik Spiekermann**, **Tobias Frere-Jones**, **Edward Tufte**, **Bret Victor**, **Hadi Soueidan**, **Henrik Wikegård**
- **Sid Meier**, **Soren Johnson**, **Henrik Fåhraeus**, **Brian Reynolds**, **John Carmack**, **Tim Sweeney**, **Vasco Vidal**, **Casey Muratori**
- **Robert Castel**, **Pierre Rosanvallon**, **Jean-Daniel Reynaud**, **Bernard Friot**, **Annette Jobert**, **Alain Touraine**, **Luc Boltanski + Ève Chiapello**, **Karl Polanyi**, **Amartya Sen**, **Bruno Trentin**, **Michel Aglietta**, **Robert Salais**, **Stéphane Beaud**, **Olivier Schwartz**, **Frédéric Lordon**, **Esther Duflo**
- Et 110 joueurs ordinaires : étudiants, profs, syndicalistes, jeunes patrons, retraités, autodidactes (Léa K., Marc D., Yasmine T., Pascal M., Sami L., Catherine V., Théo G., Hélène F., Karim B., Sophie A., Bruno P., Manon E., et tous les autres)

## Pourquoi un nom mythologique

**Argus Panoptès**, dans la mythologie grecque, est le géant aux cent yeux — il surveillait sans dormir, parce que la moitié de ses yeux veillait pendant que l'autre moitié dormait. Le surnom **Argus** est aussi celui que portaient au XIXe siècle les veilleurs des Bourses du travail françaises — ceux qui observaient les portes pour surveiller les agents provocateurs et les indicateurs de police.

Double cohérence : la mythologie (mille yeux qui ne dorment pas) et l'ancrage syndical historique (le veilleur du paritarisme).

## Ce qu'il fait

À chaque invocation :

1. **Lit le code modifié récemment** (via `git log` + `git diff` + Read direct)
2. **Identifie les composants UX impactés**
3. **Simule mentalement 3 sessions de jeu** sur 3 viewports (Théâtre / Atelier / Carnet) avec différents profils joueurs
4. **Croise 6 lentilles spécialisées** (UX, UX +++, game design, game engine, cybernétique, histoire paritarisme)
5. **Produit un rapport structuré noté** :
   - Récit des 3 sessions simulées
   - Top 5 wins + Top 5 frictions avec voix concordantes
   - P0 / P1 / P2 priorisés avec fichiers + lignes
   - Score panel composite sur 6 dimensions (compétence, autonomie, motivation, lisibilité narrative, honnêteté du cadre, friction perçue)
   - Coda d'une phrase

## Ses contraintes d'honnêteté

Argus a 4 règles inviolables (codées dans son agent definition) :

1. **Il ne prétend jamais avoir testé en vrai dans un navigateur**. Il simule à partir du code. Sépare ce qu'il peut vérifier (CSS, DOM) de ce qu'il ne peut pas (rendu composé, perception).
2. **Il n'invente pas de voix**. Il cite les profils documentés du panel des 50 (cf. `V3_PANEL_50_CURATED.md`).
3. **Il lit le diff réel** avant de juger. Pas de critique sur ce qui n'a pas changé.
4. **Il cite fichiers + lignes** pour chaque friction. `CockpitTopHeader.svelte:144`, pas « le tooltip est trop long ».

## Comment l'invoquer

Dans Claude Code, taper :

```
@argus audit du build courant
```

Ou via le menu agents (Cmd+/) → choisir `argus`.

Ou lui donner un scope précis :

```
@argus audit du LayoutSwitcher après le commit 1361b49
```

Ou pour un test après-livraison :

```
@argus joue 5 tours en Théâtre côté patron Lambert-Ribot et dis-moi
```

## Ce qu'il remplace

Argus remplace les sessions ad-hoc où je consultais les 38 profils détaillés un par un. Au lieu de relancer manuellement « simule Pope, simule Taro, simule Norman… », il suffit d'invoquer Argus une fois et il fait le tour des lentilles.

C'est aussi un **garant d'honnêteté** : son agent definition lui interdit d'inventer des voix ou de prétendre avoir vu ce qu'il n'a pas pu vérifier. C'était la critique principale qui pesait sur les synthèses précédentes (« c'est quand même de la simulation, pas du vrai test »). Argus assume cette simulation tout en la rendant rigoureuse.

## Limites assumées

- **Il ne remplace pas un vrai recrutement utilisateur**. Si Paritas vise un lancement public, des sessions avec de vrais joueurs (idéalement 8-12 par cycle, mix camps + profils) sont irremplaçables.
- **Il ne peut pas vérifier le rendu visuel composé**. Pour ça, il faut une capture d'écran humaine partagée dans la conversation.
- **Il est aussi bon que le panel qu'il intègre**. Si le panel est biaisé (pas assez de joueurs neuro-divergents, pas assez de testeurs accessibilité, etc.), Argus l'est aussi.

## Évolution prévue

Le panel des 202 doit être étendu aux profils sous-représentés :
- Joueurs avec handicap visuel (lecteur d'écran, contraste)
- Joueurs avec difficultés cognitives (charge de lecture)
- Joueurs hors du contexte français (qui découvriraient le paritarisme par le jeu)
- Joueurs jeunes (10-15 ans) pour usage scolaire

Quand le panel s'étendra, Argus s'étendra avec lui (mise à jour de son agent definition).

---

## Ce qui change dans le workflow

**Avant Argus** : pour avoir un audit, je devais à chaque fois invoquer manuellement « simule 30 testeurs, écris-moi un doc avec leurs sessions ». Long. Verbeux. Pas systématique.

**Avec Argus** : `@argus audit` → il fait. Court. Reproductible. Comparable d'un build à l'autre (les scores se comparent).

C'est le geste qui transforme Paritas d'un projet en développement en un projet en **maintien actif et auditable**.

---

> *« Argus a cent yeux, il dort la moitié de la nuit, il veille l'autre. Vous avez maintenant votre veilleur. »*
