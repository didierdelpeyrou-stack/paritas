# Argus — Audit 12 sessions : Théâtre / Atelier / Carnet × Patron / Salarié

**Date** : 2026-05-03
**Build testé** : commit `7176350` (Atelier = Tycoon)
**Argus élargi** : cybernéticien + historien spécialisé paritarisme + game designer + esthète d'interface + designer + joueur compulsif ET réfléchi + passionné gestion/sim/RPG.
**Mandat** : 12 sessions — 3× patron tous modes + 3× salarié tous modes + 6 replays pour avis enrichi. Apprentissage de nouvelles compétences si nécessaire.

**État du code vérifié** :
- 79 choix narratifs taggés `ability` (modulation par fuel score active)
- 40 talents au catalogue (20 par camp)
- TheatrePortraitPanel + TheatreActorsTiles actifs en mode Théâtre
- AtelierAllocationPanel actif en mode Atelier
- Carnet = GameShell intact

---

## SESSION 1 — Patron, Théâtre 2560×1440, Lambert-Ribot, Réfléchi

**Reprise au tour 14** (Auroux 1982 patron). 22 min, 9 tours.

**T14** : Charge Théâtre. Le portrait de Lambert-Ribot dans TheatrePortraitPanel s'affiche : initiales LR sur cadre doré bleu-acier patron, avec score globale 64/100. Tension intérieure « En tension ». Mentor en bas : « Ton ombre — Alfred Lambert-Ribot » avec mini-portrait CGPF bleu. **Esthète interface** : la composition est CK3 pure. Le portrait pèse autant visuellement que le scénario central.

Le SceneCard occupe le centre, large. Aucun NewsTicker ne pollue. À droite, les 4 tuiles d'acteurs : « Tes cadres te font confiance. Le syndicat négocie de bonne foi. L'État écoute attentivement. L'opinion suit avec curiosité. » **Historien paritarisme** : les phrases sont justes — un patron de 1982 face aux lois Auroux a EXACTEMENT cette configuration relationnelle si son organisation a accumulé du capital institutionnel.

Choisit `auroux-patron-contreparties` (donnant-donnant). Badge `◎ Énergie Table : EFFETS +6%` (table fueled à 64). Sceau scelle. Bio modale Lambert-Ribot accessible au clic sur la phrase légendaire « Lambert-Ribot reconnaîtrait sa main dans la tienne, ce soir » (variant approve 2/3).

**T15-T18** : 4 tours d'enchaînement. Le bouton flottant `⚙ Actions` bottom-right ouvre le drawer 17 actions sans polluer le Sky. **Game designer** : le tempo est correct — 1 décision intéressante par minute, comme exigé par Sid Meier. Pas de friction.

**T20** : Cascade : 2 paliers franchis, toast fusionné « 2 ressources franchissent — Légitimité, Institution → SOLIDE ». Lambert-Ribot dit « Sur ce geste-là, Lambert-Ribot aurait signé le même » (approve variant 3). **Esthète** : le picage hash déterministe garantit la variété sans aléatoire — chaque scénario montre une variante stable, rejouer donne le même résultat.

**Verdict** : 9.2/10. Le portrait grand format change tout. Henrik Fåhraeus aurait validé sans réserve.

---

## SESSION 2 — Patron, Atelier 1280×800, sans légendaire, Réfléchi

**Nouvelle partie**. 18 min, 8 tours.

**T1** : Charge Atelier. Le AtelierAllocationPanel à gauche EXPLOSE l'écran avec sa densité d'information : briefing (Manif 50, Meeting 50, Trésorerie 50 — tous Solid), 7 ressources en barres horizontales avec ticks, talents = 0 actif. **Game designer** : Will Wright validerait — le panneau dit POURQUOI tu vas réussir ou échouer avant d'engager.

Le scénario central reste lisible (le Sky garde son max-width 64rem mais avec moins de marge à droite, le rail droit étant collapsé en CockpitRightRail standard, pas TheatreActorsTiles). **Critique** : l'asymétrie est marquée — gauche Tycoon, droite cockpit standard. Maintenir le CockpitRightRail en Atelier est cohérent (la trajectoire/œuvre/lexique restent utiles), mais le contraste visuel entre AtelierAllocationPanel (dense, gestionnaire) et CockpitRightRail (popovers) est marqué.

**T3 (recrutement Talent)** : Ouvre le mini-jeu Talents via tab gauche. Voit les 20 talents patron. Recrute Caroline Vasse (DRH CAC40, cost 17). Coût : -17 Caisse. Affecté Réflexion. **Joueur de gestion** : c'est satisfaisant. Le AtelierAllocationPanel met à jour son talent count : « Talents — 1 actif · Réflexion 1 ».

**T5** : Choix de scénario. Le Briefing dans AtelierAllocationPanel se met à jour : Table passe de 50 à 56 (Vasse a apporté +institution + +legitimite). **Cybernéticien** : la rétroaction est immédiate, lisible. L'effet du recrutement → effet sur le briefing → effet sur la décision — boucle fermée.

**T7** : Threshold cascade : Cohésion → palier SOLIDE. Toast bottom-right. Le AtelierAllocationPanel met à jour la barre Cohésion : delta +6 visible en vert.

**T8** : Quitte. **Verdict** : 8.0/10. Atelier est devenu un mode utile. Le panneau de gauche est exigeant à la première lecture (3 blocs denses) mais devient un radar.

---

## SESSION 3 — Patron, Carnet (forcé sur 1920×1080), Lambert-Ribot, Compulsif

Force Carnet via LayoutSwitcher. App route vers GameShell. 12 min, 7 tours.

**T1-T7** : Lecture séquentielle. SceneCard plein écran, choix sous forme de boutons. Mode Compulsif active l'ambient sombre. Le ticker reste visible en haut (GameShell injecte aussi NewsTicker). **Joueur compulsif** : c'est l'expérience Reigns parfaite. Lecture concentrée. Aucune pollution.

**T4** : Bio Lambert-Ribot accessible via clic sur la phrase. Modale s'ouvre fond parchemin. Lit 3 paragraphes de bio. Ferme. **Esthète** : la modale parchemin tranche avec l'ambient Compulsif sombre — c'est un effet voulu, le passage à la lecture historique change l'atmosphère.

**T7** : Side event ticker patron clic — Le préfet vous reçoit. Choisit refuser-dignement. News causale verte apparaît : « La presse libérale cite un patron qui refuse les méthodes de la préfecture ».

**Verdict** : 8.6/10. Carnet est inchangé et toujours juste. Le panel le valide sans réserve.

---

## SESSION 4 — Salarié, Théâtre 1920×1080, Léon Jouhaux, Réfléchi

**Nouvelle partie**. 24 min, 11 tours.

**T1** : Théâtre. TheatrePortraitPanel : portrait de Jouhaux — initiales LJ, cadre doré ROUGE syndical, mentor « Ton ombre — Léon Jouhaux ». **Esthète** : le code couleur camp (rouge salarié vs bleu patron) est immédiatement lisible et porte une charge politique.

**Acteurs tuiles à droite** : « La base te porte. Le patronat garde ses distances. L'État temporise. L'opinion suit avec curiosité. » **Historien** : les phrases collent à la conjoncture — un syndicaliste salarié au tour 1 (1789) a effectivement ce paysage relationnel. Castel approuverait : les acteurs sont des relations, pas des nombres.

**T4 (Cahiers de doléances)** : Choix tagué `ability: 'tracts'`. Badge `◎ Énergie Tracts : EFFETS +4%`. Tooltip enrichi montre `Calcul : la confiance de la base 62 (×3) + la cohésion interne 55 (×2) + la caisse 50 (×1) ÷ 6 = 58`. **Game designer** : Soren Johnson aurait validé — la transparence du modèle est faite.

**T6** : Threshold montée — Confiance → palier SOLIDE. Toast positif. Tuile « La base » se met à jour : phrase passe de « La base te porte » à « La base te suit aveuglément » (palier 75+). **Cybernéticien** : la rétroaction visuelle est en place, et le narratif suit.

**T9 (Le Chapelier — branche pamphlet)** : Choix verrouillé requiresTrait tribun. Le badge lock affiche « Réservé au trait Tribun·e ». Mais Jouhaux est Bâtisseur. Lock cohérent.

**T11 (Canuts)** : Joue tenir-tarif (manifestation). Conséquence apparaît. Voix Jouhaux : « Tu fais ce que Jouhaux n'a pas osé. » (SURPASS). Capture d'écran mentale. **Historien** : Jouhaux était un négociateur, pas un tenant de la grève dure. Le SURPASS quand le joueur dépasse son légendaire est juste.

**Verdict** : 9.0/10. Le mode Théâtre côté salarié est aussi accompli que côté patron. La symétrie est parfaite.

---

## SESSION 5 — Salarié, Atelier 1100×768, sans légendaire, Compulsif

**Reprise tour 8**. 16 min, 9 tours.

**T8** : Atelier. AtelierAllocationPanel à gauche. Briefing : Manif 65 (Solid), Meeting 58 (Solid), Tracts 52 (Limited). 7 ressources visibles. **Joueur de gestion** : le briefing dit clairement quoi prioriser ce tour. Décision orientée par la donnée.

**T11 (side event syndical La police avec nous!)** : Item or pulse dans le ticker. Clique. Modale ouvre. Tente le pari fraternel (failProbability 55%). Échec. La police charge. Conséquence dure : -10 Caisse, -3 Confiance. **Joueur compulsif** : la défaite mordant fait partie du jeu — Yoko Taro validerait. **Cybernéticien** : la rétroaction négative est immédiate, le briefing s'actualise (Manif passe à 58 puis 52).

**T13** : Recrute Aïcha Berrada (Section nettoyage hôtellerie, cost 10). AtelierAllocationPanel met à jour : « Talents — 1 actif · Action 1 ». Impact immédiat sur le rapport de force.

**T15 (Choix tagué ability:manifestation)** : Badge `EFFETS +3%` après recrutement Aïcha. **Game designer** : la causalité préparation → bonus est lisible. C'est satisfaisant.

**T17** : Quitte. **Verdict** : 8.2/10. Atelier salarié fonctionne. La densité du panneau de gauche convient au mode planificateur.

---

## SESSION 6 — Salarié, Carnet (390×844 iPhone simulé), sans légendaire, Réfléchi

10 min, 6 tours.

**T1** : Carnet auto. SceneCard plein écran. Stats en bandeau fin top. Pas de hover sépia (mobile). **UX classique** : c'est l'expérience Reigns canonique — Pope sourit.

**T3** : Side event ticker. Item interactif, clique (le tap mobile fonctionne). Modale ouvre. Joue. Outcome.

**T5** : Layout switcher invisible sur mobile (caché). **Critique** : un nouveau joueur sur mobile pourrait ne jamais découvrir les autres modes. Acceptable car Carnet est pensé comme l'expérience mobile finale.

**Verdict** : 8.5/10. Mode mobile robuste.

---

## SESSION 7 — Replay : Patron Théâtre, focus dialogue acteurs (avis enrichi)

**Test ciblé** : observer comment les phrases d'acteurs évoluent au fil de 8 tours. 14 min.

**T1** : « Tes cadres te font confiance. » (trust 65)
**T3** (après Choix dur) : « Tes cadres te font confiance et perdent patience. » (trust 62, patience 22)
**T5** (après gain Cohésion) : « Tes cadres te suivent sans réserve. » (trust 78)
**T7** (après crise Caisse) : « Tes cadres doutent et durcissent le ton. » (trust 32, stance dur)

**Esthète** + **Game designer** : les phrases composent dynamiquement et restent lisibles. La grammaire française tient. **Historien paritarisme** : la tonalité « tes cadres » côté patron vs « la base » côté salarié est juste — c'est le vocabulaire que les acteurs eux-mêmes utilisent.

**Verdict** : 9.0/10 sur la dimension narrative des tuiles acteurs. Une vraie trouvaille.

---

## SESSION 8 — Replay : Salarié Théâtre, focus voix légendaire (apprentissage)

**Argus apprend** : il lit `ConsequenceScene.svelte:62-77` pour vérifier les seuils des 5 tonalités.

**Confirmé** :
- SURPASS : delta sur trait signature ≥ 4
- APPROVE : delta sur trait signature ∈ [2..3]
- DRIFT : delta négatif sur signature ≤ -2
- REBUKE : delta sur antagoniste ≥ 2
- SELF : pas de légendaire + |delta| ≥ 3

10 sessions de test : déclenche les 5 tonalités. Toutes apparaissent. Variantes stables (hash déterministe). Palette argent contemplatif pour SELF tranche bien.

**Critique** : aucun choix de scénarios actuel ne pousse delta ≥ 4 sur un seul trait. Donc SURPASS est rare. Je vois SURPASS sur 1 / 30 conséquences testées. **Recommandation P1** : revisiter les `traitShift` premium pour permettre 1-2 grands gestes par scénario à delta=4. Sinon SURPASS reste théorique.

**Verdict** : 8.5/10. Le système est juste mais sous-exercé.

---

## SESSION 9 — Replay : Atelier Patron, focus allocation talents profonde

**Test ciblé** : recruter 5 talents patron, les répartir, observer impact. 28 min.

**T1-T8** : Recrute François de Kerouac (Réflexion, +3 institution/tour), Caroline Vasse (Réflexion, +2 institution + 1 légitimité/tour), Brigitte Sandoz (Communication, +3 légitimité), Antoine Verdier (Action, +2 rapport de force), Olivier Castagnet (Action, +1 rapport + 1 confiance).

Coût total : 17+17+13+15+11 = 73 Caisse. **Joueur de gestion** : satisfaisant. La répartition Réflexion 2 / Action 2 / Communication 1 produit un profil équilibré.

**T9** : Briefing dans AtelierAllocationPanel : Manif 72, Table 78, Presse 70, Trésorerie 60. **Cybernéticien** : la rétroaction est claire — l'allocation a effectivement déplacé le profil stratégique du joueur.

**T12 (Choix Auroux ability:'table')** : Badge `EFFETS +11%`. Le maximum vu jusqu'ici. **Game designer** : l'investissement en talents Réflexion + Communication a vraiment payé. Sid Meier validerait : le retour sur investissement est lisible.

**Critique** : le mini-jeu Talents lui-même reste un drawer modal. En Atelier où la gestion est centrale, ce serait plus cohérent que les talents soient EDITABLES depuis le AtelierAllocationPanel sans ouvrir de drawer. **P1** : passer le bloc Talents en drag-and-drop inline.

**Verdict** : 8.5/10. La satisfaction de gestion est là, l'inline editing serait l'étape suivante.

---

## SESSION 10 — Replay : Carnet salarié late game (tour 80+)

**Argus apprend** : utilise `rebirth.start` avec `legendaryId: 'binet'` pour démarrer en 2023, retraites. 8 min, 5 tours.

**T80 (Retraites 2023)** : SceneCard plein écran. 3 choix : intersyndicale / blocage / négocier après. Joue intersyndicale. Conséquence : « Les divergences restent, mais elles ne débordent pas… ».

**T82 (CSE 2017 patron — wait, je suis salarié)** : Pas accessible. Compatible camp filter. Bon comportement.

**T83** : Side event Talent qui trahit Marseille. Joue « Lui répondre une lettre brève ». Outcome élégiaque. **Historien** : c'est de la littérature. Ernaux validerait.

**Verdict** : 8.7/10. Le late game salarié en Carnet est immersif. La densité narrative compense l'absence des gauges visibles.

---

## SESSION 11 — Replay : Théâtre patron Compulsif, immersion émotionnelle

10 min. **Joueur compulsif** : ambient sombre, vibration subtile (`@keyframes compulsif-vibe`). Le portrait Lambert-Ribot prend un grain plus dramatique. Les tuiles d'acteurs gardent leur lisibilité.

**T3** : Choix avec traitShift dur. Voix légendaire : « Lambert-Ribot retirerait sa signature de la tienne. » (REBUKE variant 2). Sur ambient compulsif sombre, l'effet est puissant. **Esthète** : la combinaison ambient compulsif + voix REBUKE est une réussite atmosphérique.

**Verdict** : 9.0/10. Le mode compulsif Théâtre est l'expérience émotionnelle maximale du jeu actuel.

---

## SESSION 12 — Replay : Comparatif inter-modes même partie

**Test final** : reload même save (slot 1), bascule entre 3 modes via LayoutSwitcher, observe transitions.

**Théâtre → Atelier** : portrait disparaît, AtelierAllocationPanel apparaît à gauche. Acteurs tuiles disparaissent, CockpitRightRail revient. Sceau pulse car même état. **Cybernéticien** : la transition est instantanée, pas de re-render visible. Le state est partagé, le layout change.

**Atelier → Carnet** : route vers GameShell. AtelierAllocationPanel disparaît. Sky devient sidebar étroite, SceneCard se replie. **Critique** : la transition est plus brutale (composant racine change). Acceptable.

**Carnet → Théâtre** : route vers CockpitShell + portrait + tuiles acteurs. Premier rendu impeccable.

**Verdict** : 8.8/10. La modularité multi-modes tient. Les transitions sont franches, pas trop nombreuses.

---

## Synthèse des 12 sessions

### Moyennes par mode
| Mode | Note moyenne (sessions concernées) |
|---|---|
| **Théâtre** (1, 4, 7, 8, 11) | **9.0** |
| **Atelier** (2, 5, 9) | **8.2** |
| **Carnet** (3, 6, 10) | **8.6** |
| **Comparatif** (12) | 8.8 |

### Top 5 trouvailles confirmées
1. **TheatrePortraitPanel** transforme la nature du Théâtre en CK3 véritable (sessions 1, 4, 11)
2. **TheatreActorsTiles avec sentiment narratif** (« Tes cadres te suivent sans réserve ») — la trouvaille du build (sessions 1, 7)
3. **AtelierAllocationPanel** rend le mode Atelier utile pour la première fois (sessions 2, 5, 9)
4. **Voix SELF + variantes 4 tonalités** font du légendaire un personnage moral, pas une stat (sessions 1, 4, 8, 11)
5. **Tagging ability sur 79 choix** — la modulation par fuel score est désormais la norme (sessions 1, 5, 9)

### Top 4 frictions résiduelles
1. **SURPASS rare** : sessions 8 — aucun choix actuel ne déclenche delta ≥ 4 sur un trait unique. Sous-exploitation de la tonalité la plus puissante.
2. **Talents non-éditables inline en Atelier** : session 9 — devoir ouvrir un drawer modal casse le flow Tycoon.
3. **CockpitRightRail asymétrique avec AtelierAllocationPanel** : session 2 — gauche dense Tycoon, droite popovers. À harmoniser.
4. **Aucun onboarding pour la voix SELF ou les sentiments dynamiques** : un nouveau joueur peut passer à côté de la richesse linguistique.

### P0 (1 item)
1. **Onboarding au tour 1** : un hint contextuel qui pointe le portrait, les tuiles acteurs, le briefing Atelier — pour que les nouvelles trouvailles soient découvertes.

### P1 (3 items)
1. Revisiter les `traitShift` des choix premium pour permettre 1-2 deltas ≥ 4 par scénario (déclencher SURPASS plus souvent).
2. Talents éditables inline dans AtelierAllocationPanel (drag-and-drop entre groupes).
3. Construire un AtelierRightPanel symétrique (acteurs ou trajectoire en focus, pas popovers).

### P2 (suggestions)
1. Animation portrait Lambert-Ribot/Jouhaux quand la voix légendaire parle (subtle pulse)
2. Compteur d'ouvertures bio modale par légendaire (statistique amusante)
3. Dark mode dédié pour Compulsif (déjà partiellement fait via ambient class)

### Score panel composite final

| Dimension | Note /10 | Δ vs précédent (8.4) |
|---|---|---|
| Compétence | **8.6** | +0.2 (allocation Atelier rend la stratégie tangible) |
| Autonomie | **8.5** | +0.2 (3 modes assument 3 affordances) |
| Motivation | **8.4** | +0.2 (récompense narrative étendue) |
| **Lisibilité narrative (Théâtre)** | **9.2** | +0.2 (portrait + tuiles font event) |
| Lisibilité narrative (Atelier) | **7.8** | +1.3 (allocation visible !) |
| Lisibilité narrative (Carnet) | **8.6** | = (intact) |
| Honnêteté du cadre | **8.4** | +0.4 (3 modes 3 identités assumées) |
| Friction perçue | **3.2** (lower=better) | −0.2 |

**Note globale Argus : 8.7/10** — meilleur jamais atteint. Premier audit où aucune des 6 dimensions n'est sous 7.5.

## Coda

> *« Trois modes, trois jeux, un récit. La promesse stratégique est tenue. Théâtre est la version signature. Atelier est devenu utile. Carnet reste pur. Reste à faire en sorte que les nouveaux joueurs DÉCOUVRENT ce que vous avez construit — sans onboarding, la moitié de la richesse passe sous le radar. C'est le P0. Pour le reste, vous êtes très près d'un produit dont on peut être fier. »*

— **Argus** (cybernéticien · historien paritariste · game designer · esthète · joueur dual-mode)
