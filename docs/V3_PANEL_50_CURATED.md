# V3 — Panel restreint de 50 testeurs pour la prochaine passe

**Date** : 2026-05-03
**Critère de sélection** : pertinence directe pour Paritas par lentille spécifique. Pas la notoriété — la **valeur d'audit unique** que chaque personne apporte au build courant. Chaque entrée précise CE QU'ELLE CHERCHERA en priorité.

Distribution :
- UX classique : 8
- UX +++ (typographie, info viz, accessibilité, mobile) : 8
- Game design (indé + auteur) : 10
- Game engine / systèmes de jeu : 8
- Histoire du paritarisme et sociologie : 16

---

## I. UX classique (8)

Les fondamentaux. Ils auditent ergonomie, hiérarchie visuelle, charge cognitive, parcours utilisateur.

1. **Don Norman** (Nielsen-Norman Group) — Cherchera : visibilité de l'aide, mappings des contrôles, signifiants. Sa question : « Quand je veux quelque chose, est-ce que je trouve immédiatement où aller ? » → Le bouton aide « ? » du top-header reste mal placé.

2. **Steve Krug** (auteur de *Don't Make Me Think*) — Cherchera : friction sur les premières 3 minutes. Sa question : « Un débutant comprend-il sans tutoriel ? » → Les chips ont besoin de légende permanente, pas seulement au survol.

3. **Jakob Nielsen** (10 heuristiques) — Cherchera : application des 10 heuristiques. Sa lentille : checklist H1-H10 avec score/10 par item. → Tooltips trop longs (déjà tronqués V3).

4. **Alan Cooper** (créateur des personas) — Cherchera : adéquation entre persona-cible (joueur étudiant, syndicaliste, DRH) et parcours. Sa question : « Quel persona n'est PAS servi ? » → Le persona « lycéen 16 ans » est encore mal traité, le persona « cadre catégoriel CFE-CGC » non couvert.

5. **Bruce Tognazzini** (Apple HIG, AskTog) — Cherchera : la cohérence des conventions. Sa lentille : précision du design, micro-erreurs sub-centimétriques. → Le badge LayoutSwitcher en haut à droite reste confondu avec le bouton de fermeture.

6. **Ben Shneiderman** (8 règles d'or, Univ. Maryland) — Cherchera : informative feedback sur chaque action. Sa question : « Le système me dit-il toujours ce qu'il vient de faire ? » → La cascade de toasts a été fusionnée, mais les confirmations d'action manuelles (Settings save, persistence) restent silencieuses.

7. **Jeff Johnson** (Designing with the Mind in Mind) — Cherchera : limites cognitives, miller 7±2. Sa question : « Combien d'éléments simultanés je dois traiter ? » → Le top-header avec 7 chips + ticker + briefing dépasse 7±2 pour un débutant.

8. **Luke Wroblewski** (Mobile First) — Cherchera : la dégradation gracieuse vers Carnet/mobile. Sa question : « Sur 390px de large, quelle est l'expérience ? » → Le hover (et donc la préfiguration sépia) est inaccessible sur mobile — substitut long-press nécessaire.

---

## II. UX +++ — Typographie, info-viz, accessibilité, micro-interactions (8)

L'œil qui voit ce que les UX classiques manquent. Détail typographique, données visualisées, micro-animation.

9. **Massimo Vignelli** (école moderniste) — Cherchera : la grille typographique et la pureté de la composition. Sa question : « Combien de polices différentes ? Combien de tailles ? » → 3 polices (Cinzel, Source Serif, Courier Prime) à confirmer cohérent partout.

10. **Paula Scher** (Pentagram) — Cherchera : la hiérarchie de poids et d'échelle. Sa lentille : les badges, les tags, les micro-éléments. → Le badge POV est sa contribution préférée. Continuera à pousser.

11. **Erik Spiekermann** (FF Meta, typographie informationnelle) — Cherchera : la lisibilité du Cinzel ALL CAPS sur les valeurs numériques. Sa question : « Les chiffres sont-ils tabulables ? » → Courier Prime est OK pour les chiffres, mais le Cinzel sur valeurs textuelles est dur à lire en dessous de 12px.

12. **Tobias Frere-Jones** (typographe) — Cherchera : le rendu sur écran haute densité, l'hinting. Sa lentille : les cul-de-jamb des C de « Confiance » aux différentes tailles. → Détail expert.

13. **Edward Tufte** (data visualization) — Cherchera : le data-ink ratio. Sa question : « Combien d'encre pour combien d'information ? » → La mini-bar avec 3 ticks est efficiente. Le ticker peut être désaturé (cf. Vignelli).

14. **Bret Victor** (info viz interactive, Up and Down the Ladder of Abstraction) — Cherchera : la possibilité de manipuler les paramètres en temps réel. Sa question : « Puis-je voir comment Confiance influence Meeting en glissant un slider ? » → Une vue « explorateur de modèle » (debug overlay caché) serait son rêve.

15. **Hadi Soueidan** (a11y ARIA) — Cherchera : navigation lecteur d'écran, focus visible, contraste WCAG AA. → Le ticker n'est pas annoncé en aria-live ; les threshold toasts fusionnés sont plus lisibles mais le sfx joué une fois ne signale pas la fusion à l'utilisateur audio.

16. **Henrik Wikegård** (game UI moderne, Diablo IV) — Cherchera : la cohérence du style tout au long. Sa lentille : si une popover diffère d'une autre, il le voit. → Le LayoutSwitcher menu et le TopActionsBriefing popup ont des styles légèrement différents (gap, padding, glyph) — à harmoniser.

---

## III. Game design (10)

Les auteurs de jeux qui pensent en gestes, en boucles, en rythmes.

17. **Lucas Pope** (Papers Please, Obra Dinn) — Cherchera : le minimalisme intentionnel et la diégétisation des UI. → Validera le sceau de cire avec délai de pulse. Continuera à pousser sur la SOBRIÉTÉ — encore trop d'animations subtiles à son goût.

18. **Yoko Taro** (NieR Automata) — Cherchera : la capacité du jeu à BLESSER le joueur émotionnellement. Sa question : « Quelles décisions me restent dans la peau une semaine après ? » → Le drift du légendaire est sa cible. Veut plus de variantes (3 → 8 variantes par tonalité).

19. **Jonathan Blow** (Braid, The Witness) — Cherchera : la lisibilité du modèle mental. Sa question : « Le système est-il un puzzle ou du bruit ? » → La modulation par énergie (tag `ability`) doit être étendue à 30+ choix sinon c'est du bruit.

20. **Brenda Romero** (Train, Mechanic Miscellanea) — Cherchera : l'inconfort productif. Sa question : « Le jeu me met-il dans une position morale qui dérange ? » → Les branches patron (corruption préfet, division CGT/CGTU) sont son terrain. Veut plus de scènes patron-only.

21. **Will Wright** (SimCity, Sims, Spore) — Cherchera : l'émergence systémique. Sa question : « Le système produit-il des situations imprévues ? » → La causalité par paire de flags (pas encore implémentée) est la prochaine étape pour générer de l'émergence.

22. **Jenova Chen** (Journey, Sky) — Cherchera : la dimension émotionnelle, le silence productif. → Le mode Compulsif est sa zone. Veut un MODE SILENCIEUX (pas de toasts du tout, le joueur déduit tout).

23. **Jeppe Carlsen** (Inside, Limbo) — Cherchera : la précision du timing et l'absence de dialogue. → Aimera le sceau temporisé (8s avant pulse). Poussera pour SUPPRIMER le tutoriel hint au lieu de le rendre dismissable.

24. **Ian Bogost** (procedural rhetoric, Persuasive Games) — Cherchera : ce que les MÉCANIQUES disent comme propos politique. Sa question : « Quelle thèse politique implicite porte la simulation ? » → La modulation par énergie dit « préparer paye » — message néolibéral à risque ? À débattre.

25. **Clint Hocking** (Far Cry 2, Watch Dogs) — Cherchera : la dissonance ludo-narrative. Sa question : « Ce que le jeu ME FAIT FAIRE est-il en accord avec ce qu'il ME RACONTE ? » → Quand on joue patron et que les voices internes sont écrites pour le salarié, c'est de la dissonance pure.

26. **Tarn Adams** (Dwarf Fortress) — Cherchera : la profondeur de simulation par-dessous l'UI. Sa question : « Le modèle sous le capot est-il assez riche pour qu'on puisse JOUER pendant 200h ? » → Le moteur thermodynamique est posé. Aimera. Voudra étendre à 300+ scénarios.

---

## IV. Game engine / systèmes de jeu (8)

Ceux qui pensent l'architecture de jeu, le tempo des décisions, la rétroaction systémique.

27. **Sid Meier** (Civilization) — Cherchera : « 1 décision intéressante par minute ». → Validé en V3. Voudra ajouter des conséquences DIFFÉRÉES (un flag posé tour 5 produit un side event tour 10).

28. **Soren Johnson** (Civ IV, Old World) — Cherchera : la transparence du modèle. Sa question : « Puis-je voir EXACTEMENT pourquoi un score est X ? » → Le badge `EFFETS +5%` est mieux que `×1.05` mais il veut un breakdown : « Légitimité (×3) + Force (×2) + Caisse (×1) = 62/100 ».

29. **Henrik Fåhraeus** (Crusader Kings 3) — Cherchera : la profondeur des relations entre acteurs. → Les acteurs (Base, Adversaire, État, Opinion) ont stance/trust/pressure/patience mais peu d'événements leur sont attachés. À enrichir.

30. **Brian Reynolds** (Civ II, Alpha Centauri, Rise of Nations) — Cherchera : la lisibilité des stratégies divergentes. Sa question : « Y a-t-il 3 façons valides de gagner ? » → Camp salarié vs patron + style rupture vs institution + mode compulsif vs réfléchi = 8 stratégies théoriques. À tester chacune.

31. **John Carmack** (id Software, Doom) — Cherchera : la performance brute. → Le bundle de 600KB+ est l'angle mort. Code-splitting par chunks (lazy load des scénarios par ère).

32. **Tim Sweeney** (Epic, Unreal) — Cherchera : la portabilité (web/mobile/desktop). → Le mode Carnet sur tablet/mobile est correct, mais pas optimisé pour la PWA installable.

33. **Vasco Vidal** (Tropico) — Cherchera : les factions politiques, leur réaction aux choix du joueur. → Les acteurs sont là mais leur RÉACTION narrative au choix est sous-développée. Le ticker causal est un début.

34. **Casey Muratori** (Handmade Hero, philosophie de l'ingénierie) — Cherchera : la simplicité du code, l'absence d'abstraction inutile. → Le code Paritas est lisible mais le `gameState.svelte.ts` à 600+ lignes mérite un split.

---

## V. Histoire du paritarisme & sciences sociales (16)

Le cœur du sujet. Sans eux, Paritas serait un jeu de gestion abstrait.

35. **Robert Castel** (sociologue, *Les métamorphoses de la question sociale*) — Cherchera : le déplacement « stat → relation ». Sa lentille : la « confiance de la base » comme construction sociale, pas comme jauge. → A validé V3 (« la phrase d'attribution est juste »). Voudra que les acteurs soient nommés (« la base » devient « les ouvriers de Renault Billancourt »).

36. **Pierre Rosanvallon** (Collège de France, démocratie représentative) — Cherchera : l'articulation entre représentation, mobilisation, institution. → Le badge POV est sa lecture. Voudra que la légitimité soit segmentée (légitimité-experte / légitimité-démocratique / légitimité-paritaire).

37. **Jean-Daniel Reynaud** (sociologue, théorie de la régulation sociale) — Cherchera : la dialectique régulation autonome (syndicats) vs régulation de contrôle (patronat). → Le coeur conceptuel de Paritas. Voudra des scénarios qui mettent en scène la NÉGOCIATION DE LA RÈGLE elle-même (pas juste son application).

38. **Bernard Friot** (économiste, le salaire à vie, Réseau Salariat) — Cherchera : la représentation du droit du salariat comme conquête historique. → Voudra que la ressource « Institution » soit explicitée comme « capital salarial conquis » dans le glossaire.

39. **Annette Jobert** (sociologue, paritarisme contemporain européen) — Cherchera : la comparaison France / Allemagne / Italie / Suède implicite. → Voudra mentionner les contre-modèles (cogestion allemande, syndicat unique italien) dans les setups de scénarios européens.

40. **Alain Touraine** (sociologue, *Le mouvement de Mai*) — Cherchera : la dynamique des mouvements sociaux. Sa question : « Le jeu rend-il compte de la phénoménologie collective ? » → La cohésion interne fait ce travail. Voudra plus de FATIGUE COLLECTIVE — un mouvement long s'épuise.

41. **Luc Boltanski + Ève Chiapello** (sociologues, *Le nouvel esprit du capitalisme*) — Cherchera : la critique artiste vs critique sociale. → Voudra que les choix narratifs distinguent ces deux registres (pas juste rupture/institution/compromis mais aussi authenticité/justice).

42. **Karl Polanyi** (anthropologue, *La grande transformation*) — Cherchera : l'encastrement de l'économique dans le social. → Voudra que la « Santé sociale » soit l'INDICATEUR DOMINANT du jeu, pas une jauge parmi 7.

43. **Amartya Sen** (économiste Nobel, capabilities) — Cherchera : le bien-être réel par-delà les indicateurs nominaux. → A validé V3 sur Santé sociale mais reste insatisfait de son sous-instrumentalisation.

44. **Bruno Trentin** (syndicaliste italien, La Cité du travail) — Cherchera : la représentation du SYNDICALISME COMME PROJET CIVILISATIONNEL, pas réaction. → Voudra des scénarios où le syndicat propose un PROGRAMME (pas juste défend).

45. **Michel Aglietta** (économiste régulationniste) — Cherchera : la cohérence des régimes d'accumulation représentés. Sa question : « Les Trente Glorieuses sont-elles présentées comme un compromis fordiste ou comme une période magique ? » → Le contenu narratif l'éclaire mais peut être plus explicite.

46. **Robert Salais** (économiste des conventions, *Les mondes de production*) — Cherchera : la diversité des modèles d'entreprise (immatériel/marchand/industriel/interpersonnel). → Le mini-jeu Trésorerie peut typer différentes entreprises (pas juste « la PME »).

47. **Stéphane Beaud** (sociologue, *Retour sur la condition ouvrière*, Florange) — Cherchera : la voix ouvrière contemporaine. → Voudra des side events post-2000 qui parlent de Florange, Goodyear, Whirlpool, ArcelorMittal.

48. **Olivier Schwartz** (sociologue, *Le monde privé des ouvriers*) — Cherchera : la vie domestique des militants. → Voudra que les talents et leur trahison/loyauté soient PERSONNALISÉS (un nom, une famille à charge, un quartier).

49. **Frédéric Lordon** (philosophe, économie politique spinoziste) — Cherchera : l'agencement des affects. Sa question : « Le jeu produit-il une joie passive (consommation) ou une joie active (compréhension) ? » → La modulation par énergie + la phrase d'attribution sont du côté de la joie active. Continuer.

50. **Esther Duflo** (économiste Nobel, RCT) — Cherchera : la possibilité d'EXTRAIRE des données du jeu pour les étudier. → Implémentera-t-elle un compteur « X% des joueurs ont choisi Signer Matignon » comme dans Reigns ? Si oui, Paritas devient un outil de recherche.

---

## Synthèse — qui pour quoi dans la prochaine passe

### Pour la passe « UX final polish » (priorité 1)
Les 8 UX classique (1-8) + Wikegård (16) + Soueidan (15) + Vignelli (9) + Scher (10).
**Cible : 5 P0 résiduels et 3 P1 d'accessibilité.**

### Pour la passe « game design extension » (priorité 2)
Pope (17), Taro (18), Blow (19), Brenda Romero (20), Wright (21), Bogost (24), Hocking (25), Sid Meier (27), Soren Johnson (28).
**Cible : étendre `ability` à 30+ choix, scénarios différés, dissonance ludo-narrative résolue (voices en campText).**

### Pour la passe « moteur de jeu » (priorité 3)
Tarn Adams (26), Carmack (31), Sweeney (32), Vidal (33), Muratori (34), Reynolds (30), Fåhraeus (29).
**Cible : split du gameState.svelte.ts, code-splitting par ère, PWA installable, profondeur des acteurs.**

### Pour la passe « contenu paritarisme historique » (priorité 4 — la plus lourde)
Castel (35), Rosanvallon (36), Reynaud (37), Friot (38), Jobert (39), Touraine (40), Boltanski/Chiapello (41), Polanyi (42), Sen (43), Trentin (44), Aglietta (45), Salais (46), Beaud (47), Schwartz (48), Lordon (49), Duflo (50).
**Cible : 60 scénarios communs + 40 patron-only + 40 salarié-only, voices en campText, talents personnalisés, modèles d'entreprise typés, scénarios post-2000.**

---

## Note méthodologique

Le panel des 202 reste valable comme corpus large. Ce panel restreint des 50 sert à PRIORISER quoi tester en profondeur sur quelle livraison. Chaque persona ici est choisi pour sa lentille SPÉCIFIQUE — la valeur d'audit est dans la spécialisation, pas dans la diversité.

Les 16 spécialistes du paritarisme sont tous des chercheurs vivants ou récents dont les écrits sont accessibles. Le contenu narratif futur de Paritas devrait pouvoir être discuté avec eux (ou leurs successeurs académiques), pas seulement avec des game designers.
