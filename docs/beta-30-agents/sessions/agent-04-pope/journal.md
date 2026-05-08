# Session agent-04-pope · Journal

**Date simulée** : 2026-05-08 (nuit) · **Build** : v2.2.2-prebeta + fix UX (HEAD `0813c75`) · **Device** : MacBook 14" + Pixel 7 émulé · **Mode** : Théâtre puis Carnet · **Tours simulés** : 22 (partie A salarié rupture) + 21 (partie B patron pragmatique) · **Ateliers** : 7/7 testés (LaTable, LaGrève, LaPlace, Confrontation, Élections, NaoSimulation, Matignon)

---

## Préambule — ce que je cherche

Je suis Pope. Je joue *Papers Please* en silence. Je veux que **rien** ne soit superflu, que chaque pixel serve la fiction. La consigne du panel m'envoie lire post-fix : le sépia de la plume géante en filigrane, est-il vraiment parti ? Et quand le moteur me dit qu'un acteur me ricane « 4 tours plus tard », est-ce que ça pèse ? Ou c'est de la garniture verbale ?

## Audit avant-jeu (avant les 22 tours)

J'ouvre `src/components/cockpit/ScenePreviewOverlay.svelte`. **Bonne nouvelle** : le composant est devenu un wrapper invisible (`ScenePreviewOverlay.svelte:22-27` ne rend qu'un `<div class="preview-overlay">` vide, plus aucun `<svg>` plume, plus aucun mot Cinzel géant en filigrane). Le commentaire à `ScenePreviewOverlay.svelte:3-15` explicite que le retrait est volontaire (ORDA-015). Le store `scenePreview` reste branché, mais ne sert plus qu'à passer un `data-preview-posture` au SceneCard pour un halo de bordure. **C'est ce que je voulais : signal par halo, pas par silhouette.** La plume sépia est partie.

Je compte les éléments diégétiques restants. La plume est encore là dans deux endroits — et c'est OK : `CockpitRightRail.svelte:153` (icône Cinzel 14px du rail Lexique, donc objet du carnet du joueur, diégétique), et `StatutJuridique.svelte:13,220` (« sept ouvriers du bâtiment signent en bas, plumes tremblantes » — texte narratif 1864, diégétique pur). Ces deux usages survivent à mon scalpel.

## Partie A — Salarié rupture (Marius, CGTU 1936 → 1968)

**Tour 1-3.** Le SceneCard ouvre 1936. Le badge POV à `SceneCard.svelte:296-311` annonce honnêtement « ✦ Vue syndicale ». OK. Le mode Compulsif active l'identity anchor (`SceneCard.svelte:262-267`) : « Toi, Marius, CGTU. Le téléphone à manivelle attend, les Gauloises planent. » C'est sec, c'est physique, c'est juste — Pope-grade.

**Tour 4.** Premier vrai choix : « refuser le compromis » contre « négocier ». Je clique « refuse-compromis ». Le `choiceResolver.ts:83-90` programme un callback adversaire à T+4. Le ticker dit « la mémoire prend ». Bien.

**Tour 8.** Le callback tombe : *« L'adversaire n'a pas oublié ton refus. Le mot court chez les patrons : "Le syndicat ne signe rien. On peut continuer." »* (`choiceResolver.ts:87`). Je lis. Je m'arrête. Je vais voir le moteur. **Découverte qui me serre l'estomac** : le callback ne modifie **aucune** valeur d'acteur. Pas de `actors.adversaire.trust -= 4`. Le `processTurnCallbacks` à `gameLoop.ts:39-54` consomme et affiche, mais la cruauté est purement textuelle. Le mot du patron court — mais ne coûte rien.

C'est ma plus grande déception du build. Le N+4 est un beau geste CK3, mais sans poids numérique il devient garniture. Pope-axiome : *si tu écris « ils n'ont pas oublié » et que la jauge de confiance ne bouge pas, tu mens au joueur.* **Issue P0**.

**Tour 12.** Trahit la base. Callback à T+15 : « Une dépêche AFP nomme ta trahison. » Idem — pas d'effet sur opinion. La presse syndicale relaie, mais le compteur ne tousse pas.

**Tour 18.** Je teste la cohérence. Mon trait dominant est rupture. Je prends un choix `aligned ✓` à `SceneCard.svelte:413-415` — flag vert discret, OK. Puis un `opposed ⚠` (un compromis Matignon-style). Stress monte de +12 selon `personalityEngine.ts:104` (antagonist push x6). **Là, ça pèse.** La jauge bouge, le hint « Tu as agi trop souvent contre toi-même » à `personalityEngine.ts:138` apparaît dès 55. **C'est exactement ce que j'attendais.** Le stress est cruel, parce qu'il est numérique.

**Tour 22.** Pipeline rupture déclenché (`pipelineEngine.ts:71-76` : `exhaustedMovements > 0` → ids.push('rupture')). Scénario stage 0 servi. Mood `melancolique` → halo violet sur le card. Sobre.

## Partie B — Patron pragmatique (Lambert-Ribot, CGPF 1936)

**Tour 1-5.** Camp `patron`. Filtre choix (`SceneCard.svelte:51-53`) marche : les options « branche syndicale » sont bien masquées. Le badge « Vue patronale » bleu (`SceneCard.svelte:709-712`) est un peu trop saturé — un cran trop fort à mon goût, mais pas critique.

**Tour 7.** Flag `cgpf-cogestion`. Callback adversaire à T+11 (`choiceResolver.ts:178-185`). Texte fuite : « Pas de cogestion. On garde la main, ou on perd tout. » C'est un beau morceau de fiction. Mais — encore — pas d'effet numérique. **P0 confirmé.**

**Tour 10.** `mediation-elysee`. Callback opinion T+13 : communiqué présidentiel. Sobre. Bien. Mais idem.

## Les 7 ateliers

- **LaTable** (NAO 3 rounds) : sec, lisible, le slider de zone est diégétique (la marge de négociation). Pope-OK.
- **LaGrève** : l'ennui sobre fonctionne — durée, fatigue militante (`organization.mobilisationFatigue` à `choiceResolver.ts:198-203`). Bon.
- **LaPlace** : foule animée, peut-être un poil trop d'animations boucle. À surveiller.
- **Confrontation** : duel. Sec. Bon.
- **Élections** : interne, factions. OK.
- **NaoSimulation** : doublon avec LaTable ? Frontière floue.
- **Matignon** : standalone. Ambiance. Bien.

Aucun atelier ne m'a *ennuyé sobrement* — c'est-à-dire ennuyé d'une bonne façon, à la *Papers Please*, où la répétition devient elle-même la mécanique. Ils sont tous trop courts pour ça. **Issue P2**.

## Bilan

22 + 21 tours, ~75 minutes simulées. La sobriété visuelle est tenue : la plume sépia est partie, le card reste opaque (correctif `SceneCard.svelte:474-512`), les halos posture sont discrets. La cruauté narrative est **présente en surface** (les phrases callback sont bonnes) mais **absente en mécanique** (les chiffres ne suivent pas). Le stress de personnalité, lui, tient parole.

Mon biais reconnu : j'ai sur-pondéré l'austérité. Le badge « Vue patronale » bleu m'a énervé alors qu'il est honnête et utile.
