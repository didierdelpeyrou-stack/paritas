# AAR Bêta 30 agents — Build v2.2.2-prebeta (commit 0813c75)
## Argus, Maréchal-auditeur · 2026-05-08

> Source : 30 sessions livrées dans `docs/beta-30-agents/sessions/agent-XX-NAME/`
> (fiche.yaml, entretien.yaml, journal.md). Toutes les voix citées sont issues
> du panel des 30. Aucune n'a été inventée.

---

## I. Verdict global

### NPS panel des 30
- **Moyenne : 6,97 / 10**
- **Médiane : 7**
- **Aucun NPS ≥ 9** (zéro promoteur fort)
- 6 détracteurs (NPS < 7), 24 passifs/promoteurs limites (NPS 7-8)

### Distribution
| Plage | Effectif | Agents |
|---|---|---|
| **≥ 9** (promoteur fort) | 0 | aucun |
| **7 ≤ X ≤ 8** (passif/promoteur limite) | 24 | 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 15, 17, 18, 19, 21, 23, 24, 25, 26, 27, 28, 29, 30 |
| **5 ≤ X < 7** (détracteur soft) | 5 | 01, 02, 14, 16, 20 |
| **< 5** (détracteur dur) | 1 | 22 |

### Verdict par segment
| Segment | Note moyenne | Verdict |
|---|---|---|
| **UX / Architectes** (01-06) | 7,0 | 🟠 Solide sur les wins (sceau, posture, identity anchor), mais tutorialisation et hiérarchie info fragiles |
| **Doctrine V3 / Géomètres-Sapeurs** (07-14) | 6,9 | 🟠 Moteur narratif CK3-grade reconnu, **mais doctrine V3 tachée par bug NAO non-seedée et pureté brisée** |
| **Paritarisme / Diplomates** (15-18) | 6,75 | 🟠 Justesse historique louée, asymétrie POV fins + voix CFDT + voix patronale PME = trous |
| **Joueurs ordinaires & cibles primaires** (19-22, 28-30) | 6,2 | 🔴 Le segment qui décide la viabilité grand public — Sami=3, Léa=5, plusieurs décrochages T15-T22 sur les ateliers non-tutorisés |
| **Pédagogique / scolaire** (23, 27) | 7,5 | 🟢 Justesse juridique et historique remarquable, demande mode "Séance prof" |
| **Accessibilité / a11y** (03, 25, 29) | 7,3 | 🟠 Bonne fondation a11y, mais 3 régressions WCAG 2.2 AA (focus ticker, pause toasts, taille texte palier "Grand") |

**Verdict global Argus :**
- 🟢 **Bêta privée → GO** (panel ciblé motivé, NPS 7 médiane suffit)
- 🔴 **Bêta publique → NO-GO** tant que P0 (cf. §VI) ne sont pas livrés. Aucun NPS ≥ 9 sur 30 testeurs experts est un signal : il manque le dernier cran de polish + symétrie POV pour qu'un joueur recommande activement.

---

## II. Convergences P0 (≥ 3 voix indépendantes)

### P0-1 · Stress / mémoire CK3 cosmétique — pas de conséquence mécanique
**Voix concordantes : 04 (Pope), 09 (Fåhraeus), 21 (Théo)**

Le système de stress (`personalityEngine.ts:94-108`) calcule, étiquette, mais **rien ne consomme** son palier ≥ 80 ("effondré"). Les 13 callbacks acteurs branchés (ORDA-012/013/014) sont narratifs purs : aucun champ `effects` numérique.

> « Une carte de Papers Please sans tampon, c'est rien. Une mémoire CK3 sans delta, c'est rien. » — Pope, agent-04
> « Le système est CK3-shaped mais pas CK3-active. » — Fåhraeus, agent-09
> « stressLevel() ne pilote aucun consommateur en aval. Le stress est un thermomètre, pas un facteur. » — Théo, agent-21

**Fix :** ajouter un champ optionnel `effects: Effects` à `ScheduledActorCallback` (`consequenceEngine.ts:146-158`), et brancher `stressLevel ≥ 80` sur `applyAbilityModulation` (`choiceResolver.ts:36-44`) avec malus -10/-15 % dégressif.

**Effort estimé : 1-1,5 j-h**

---

### P0-2 · NAO non reproductible — doctrine V3 "RNG seedé partout" ment
**Voix concordantes : 07 (Villani), 08 (Ghys partiellement — vérifie clean), 14 (Carmack)**

`scripts/orda-001-nao-mc.mjs` produit deux runs successifs avec accord_majoritaire = 31,7 % puis 30,6 %. Origine : `nao/engine.ts:782-783, 809` contient 3 `Math.random()` non-overridables. Aucune `setNaoRng()` symétrique aux patterns Elections/Confrontation.

> « La doctrine V3 "RNG seedé partout" ment sur l'atelier 1. » — Carmack, agent-14
> « Argus a fermé ORDA-008 trop tôt. » — Carmack, agent-14
> « La promesse seedée est usurpée pour le moteur le plus sensible. » — Villani, agent-07

**Fix :** ajouter `setNaoRng()` à `nao/engine.ts:790`, refacto les 3 `Math.random` vers une `function rng()` module-level (pattern Elections). Ajouter test Vitest `engines.determinism.test.ts` sur les 7 engines.

**Effort estimé : 0,5 j-h + 0,5 j-h tests**

---

### P0-3 · Incohérence numérique treasury (HUD ment)
**Voix concordantes : 11 (Duflo), 24 (Pascal)**

`organization.ts:55` déclare `cotisationRate = 0.32` côté patron, `treasury.ts:87` calcule `0.16`. Le HUD `expectedDuesIncome` ment de +24 % côté salarié, -52 % côté patron.

> « Le HUD a perdu sa virginité avant que je clique 'Entrer'. » — Duflo, agent-11
> « Soit on aligne les deux, soit on documente que 0,32 est le plein potentiel théorique et 0,16 le rendement réel — et alors il faut le dire à l'écran. » — Pascal, agent-24

**Fix :** harmoniser `organization.ts:55` avec `treasury.ts:87` (rate 0.16 — c'est l'option plus crédible selon Pascal patron PME). Ratio empirique 1:3, pas 1:8.

**Effort estimé : 0,5 j-h** (dont mise à jour test `organization.test.ts:114`)

> *Bien que seules 2 voix le remontent explicitement, la nature factuelle du bug et son impact transparence justifie le P0.*

---

### P0-4 · Tutorialisation absente sur 6/7 ateliers
**Voix concordantes : 02 (Krug), 19 (Yanis), 22 (Sami), 29 (Hélène)**

`NaoSimulation.svelte:260-273` a un aside tutoriel exemplaire (3 bullets, dismissable, persisté en localStorage). Les 6 autres ateliers — La Table, La Place, La Grève, Les Élections, Confrontation, Matignon — n'en ont pas. Décrochage T15-T22 garanti pour un joueur qui n'a pas le bagage.

> « 5 boutons sans intro, mécanique zone-cursor sans explication. J'ai cliqué au hasard. Si je n'étais pas en mission de test, j'aurais quitté à T20. » — Yanis, agent-19
> « 7 jauges au lieu des 6 promises par le tuto, vocabulaire abstrait (Légitimité, Force ext/int), je quitte. » — Sami, agent-22
> « Confrontation + Arena : trop nerveux, décrochage. » — Hélène, agent-29

**Fix :** cloner le pattern NAO sur les 6 ateliers manquants. Effort 6 × 30 min = 3 h.

**Effort estimé : 3 j-h**

---

### P0-5 · Tuto ↔ UI désaligné : 6 ressources annoncées vs 7 affichées
**Voix concordantes : 02 (Krug), 22 (Sami), 19 (Yanis indirectement via vocabulaire)**

`Tutorial.svelte:85, 127, 138` parle de 6 ressources, `CockpitTopHeader.svelte:121-136` affiche 7 chips, `game/types.ts:99-107` (`ALL_RESOURCES`) déclare 7 entrées. `cohesionInterne` est manquante du tuto.

> « Effet 'les développeurs ne se relisent pas'. Ça donne l'impression d'un truc bricolé. » — Sami, agent-22

**Fix :** réécrire `Tutorial.svelte:85,127,138` pour 7 ressources alignées sur `ALL_RESOURCES`.

**Effort estimé : 0,5 j-h**

---

### P0-6 · Asymétrie POV des 5 fins — patron jugé en POV salarié
**Voix concordantes : 08 (Ghys), 11 implicitement, 18 (Béroud sur cogestion-rejetee), 28 (Lukas)**

`endingEngine.ts:78-89` rédige les 5 textes de fin (mutilation/résistance/refondation/capture/inacheve) en POV syndical strict. Un patron-joueur termine 100 tours pour s'entendre traiter de "traître à la base". Ghys spécifie : "Bêta publique NON tant que ENDING_TEXTS n'a pas sa version patron."

> « La moitié du panel se sent ventriloqué. » — Ghys, agent-08
> « Côté salarié, NON : les flags `cogestion-rejetee` et `mitbestimmung-presented` du side event 1992 n'ont AUCUN callback. Asymétrie qui handicape la lentille comparatiste. » — Lukas, agent-28

**Fix :** paramétrer `ENDING_TEXTS` en `(s) => string` selon `s.camp`, rédiger 5 versions miroir patron.

**Effort estimé : 1,5 j-h**

---

### P0-7 · Voix patronale PME absente / "Caisse" calibrée grand groupe
**Voix concordantes : 24 (Pascal), 30 (Bruno), partiellement 18 (Béroud sur les marges)**

Sur ~100 scénarios, 2 sont CPME (cpme.ts) + 1 U2P. Aucun `patronType: 'TPE'|'PME'|'ETI'|'GE'`. La ressource "Caisse" est calibrée fédération/grand groupe (`premium.ts:344` Sécu : -5 caisse — irréaliste pour PME 28 salariés).

> « 2 scénarios sur 100 c'est faux. Entre 2008 et 2024, il y a 16 ans de réformes qui touchent en priorité les TPE-PME, et le jeu en couvre une. » — Bruno, agent-30
> « Sans cpme.ts, je quitte au tour 50. » — Pascal, agent-24

**Fix :** ajouter 4 scénarios PME 2008-2024 (rupture conventionnelle, CICE, ordonnances 2017 vue PME, accord de performance collective). Optionnellement : sous-filtre `patronType` granulaire.

**Effort estimé : 4-6 j-h** (P0 contenu, pas P0 code)

---

## III. Convergences P1 (2 voix indépendantes)

### P1-1 · Pureté `scheduleActorCallback` brisée
**Voix : 13 (Muratori), 09 (Fåhraeus en filigrane via collision)**

`consequenceEngine.ts:146-158` mute son argument `memory.scheduledActorCallbacks.push(...)` alors que `choiceResolver.ts:5` clame "Pure function". Bloque undo/replay déterministe.

> « L'écart entre l'intention déclarée et la réalité, en moins de 200 LoC. » — Muratori, agent-13

**Fix :** refactor en pure function retournant un nouveau Memory + propagation dans 10 sites d'appel.
**Effort : 1 j-h**

---

### P1-2 · `CockpitShell.svelte` 1491 lignes — splitter
**Voix : 13 (Muratori), 26 (Jules indirectement par 6 zones de lecture)**

> « Pas un god-object — c'est pire, c'est un god-SHELL. » — Muratori, agent-13

**Fix :** splitter en `TheatreShell` / `AtelierShell` / `CarnetShell` + `CockpitFrame` partagée.
**Effort : 2 j-h**

---

### P1-3 · Previews `▲▼` non modulés par `fuelMultiplier`
**Voix : 10 (S. Johnson), 06 (McGonigal indirectement sur transparence)**

`SceneCard.svelte:383` affiche les flèches sur le delta brut, pas sur le delta modulé ±20 %. Le badge EFFETS dit la formule, les flèches la contredisent. Feedforward menteur.

> « Une flèche ▲ majeur (+5) peut devenir mineur (+4) après modulation. » — S. Johnson, agent-10

**Fix :** passer `state.resources` à `previewResources(choice)` et appliquer `fuelMultiplier` avant classification.
**Effort : 0,5 j-h**

---

### P1-4 · Ticker focus piège & contraste limite 1080p
**Voix : 03 (Soueidan), 26 (Jules)**

Soueidan (a11y) : focus saute sur `.ticker-item.interactive` qui sort du DOM 800 ms plus tard, NVDA annonce "vide". Outline 2px manquante (`NewsTicker.svelte:297`), WCAG SC 2.4.11 / 1.4.11 fail.

Jules (streamer) : items neutres `rgba(244,239,226,0.7)` sur `#120B07` — AA limite 1080p, fail 720p.

> « NVDA me dit "vide, vide, vide" jusqu'au prochain tab utile. » — Soueidan, agent-03
> « Le ticker est l'élément le plus streamable du build — il doit être lisible sur les pires bitrates. » — Jules, agent-26

**Fix :** restaurer `outline:2px solid var(--sem-action)` sur `:focus-visible` du ticker, augmenter contraste texte neutre à `#E8DCB0`.
**Effort : 0,5 j-h**

---

### P1-5 · Callback "trois militants démissionnent" répété sans contexte
**Voix : 16 (Beaud), partiellement 30 (Bruno qui à l'inverse l'adore tel quel)**

Beaud : T13/T17/T21, trois fois la même phrase, copier-coller, flag partagé entre `persona.ts:142` (Seillière) et `patron.ts:156` (CGPF) — message ouvrier sur geste patronal.

> « À la première, ça serre. À la troisième, ça décroche. » — Beaud, agent-16

**Tension :** Bruno (PME) en parle comme "la phrase la plus juste du jeu", à garder telle quelle. **Compromis recommandé :** paramétrer `epuise-mouvement` avec contexte (section, ville, métier) **et** différencier par camp, sans toucher la ligne quand le contexte n'est pas posé.

**Effort : 1 j-h**

---

### P1-6 · Voix CFDT historique manquante (1947-2016)
**Voix : 12 (Goodwin), 28 (Lukas via confusion CGT/CFDT)**

Edmond Maire (1972-1988) absent. Eugène Descamps (1964) absent. Hyacinthe Dubreuil absent. Marc Blondel est FO. Marylise Léon en futur 2026. Une CFDT sans figure tutélaire historique entre 1947 et 2016.

> « Persona syndicaliste CFDT ne se reconnaît pas avant la moitié du jeu. » — Goodwin, agent-12

**Fix :** ajouter au moins une voix CFDT autour d'Auroux 1982 (Maire).
**Effort : 1 j-h**

---

### P1-7 · Aucun atelier ne lit la mémoire / le stress
**Voix : 05 (Romero), 09 (Fåhraeus)**

> « Sortie de mini-jeu = trou mémoriel. Aucun atelier ne pose de scheduleActorCallback. » — Romero, agent-05
> « Un stress effondré devrait faire trembler les mains au mini-jeu Matignon. » — Fåhraeus, agent-09

**Fix (CK3-cohérent) :** brancher mémoire + stress dans **au moins un** atelier (Matignon, le plus emblématique). Une intégration prouve le concept.
**Effort : 2 j-h**

---

### P1-8 · Anachronisme tonal callback Frachon/Matignon
**Voix : 12 (Goodwin), 30 (Bruno)**

`choiceResolver.ts:111` : Frachon écrit "Le 7 juin restera. Tu as bien fait." Goodwin et Bruno (deux profils éloignés) signalent : Frachon-CGTU 1936 face à un Jouhaux qui vient de signer SANS l'échelle mobile n'aurait pas écrit cette ligne. Ton 1968-1980 projeté sur 1936.

> « Authentique en geste, anachronique en voix. Un permanent vivant aurait corrigé ça. » — Bruno, agent-30
> « La lettre privée approbatrice est sentimentalement séduisante, mais historiquement faux. » — Goodwin, agent-12

**Fix :** réécrire en ambivalence : « Frachon t'écrit deux lignes : "Le 7 juin restera. Reste à voir si la base nous suit." »
**Effort : 0,25 j-h**

---

### P1-9 · NAO TPE-PME — preset insuffisant pour distribution / services
**Voix : 17 (Jobert sur preset cadres), 20 (Léa sur preset distribution)**

Jobert : la CFE-CGC affiche poids fixe 7 % alors qu'en scénario cadres elle peut atteindre 30 %. Manque preset `cadres`.
Léa (caissière) : poids télétravail 25-40 % du syndical, alors que personne dans son magasin ne télétravaille. Manque preset `distribution-services` (planning / temps-partiel).

> « C'est une NAO de col blanc. » — Léa, agent-20

**Fix :** dupliquer le pattern preset existant (`tpe-pme`) avec deux nouveaux : `cadres` et `distribution-services`.
**Effort : 2 j-h**

---

## IV. Voix isolées notables

### "Quand un seul l'a vu mais ça vaut"

- **Confusion CCN/ANI dans `institutionsRegistry.ts:32`** — Camille (juriste droit social, agent-27) seule à le voir : Unédic décrit comme "Convention collective interprofessionnelle" alors qu'au sens de L.2232-5 C. trav., c'est une convention/accord NATIONALE interprofessionnelle. Fix 5 minutes, P0 catalogue ↔ narration. Le scénario `premium.ts:391` est juste, c'est l'UI compacte qui ment.

- **Callback `signe-matignon` (`flag posé en 1936-matignon.ts:117`) jamais relu en aval** — Léa (agent-20) seule à le grep : « Soit c'est un bug, soit c'est une promesse non tenue. » Le sceau vit, sa cire ne sert ensuite jamais.

- **Pipeline rupture 1995-2020 absent (SUD-Solidaires, coordinations infirmières 1988, Sud-Rail 1995)** — Béroud (agent-18) seule (Sami 22 reste sur les plateformes 2026). « La rupture du jeu est celle de 1947, pas celle de 1995-2020. »

- **`ArenaStandalone.svelte:31` hardcode `camp: 'salarie'`** — Ghys (agent-08) : asymétrie de couverture. Soit retrait soit version patron.

- **Inclusion genre absente à Matignon (Henriette Carlier non nommée), Jouhaux-Nobel (Yvonne Modiano absente)** — Aïcha (agent-23) prof histoire-géo. « Pour une classe mixte de 2026, c'est un problème. »

- **Mode "Séance prof" (démarrage à ère choisie + dossier pédagogique)** — Aïcha (agent-23) : `eras.ts:167` expose déjà `eraForTurn`, le levier existe. P1 contenu, levier marketing scolaire.

- **`autoplay-banner` qui pulse en boucle même quand autoplay OFF** — Pope (agent-04) : `SceneCard.svelte:933-961` rend l'élément en permanence ; si autoplay OFF, ne pas rendre du tout. « Une animation en boucle = un yeux dans la pièce. »

- **`audio-DdP1Cr58.js = 265019 bytes`** — Muratori (agent-13) : c'est gros pour de l'audio, à investiguer (samples ou code mort ?).

- **Score final composite opaque (`mandate × 0.18` sans justification UI)** — S. Johnson (agent-10) + Villani (agent-07). Le score est une boîte semi-noire ; afficher le breakdown des 4 termes en fin de partie.

- **Seuil de représentativité loi 2008 (10 / 30 / 50 %) absent — seuil unique 50 %** — Jobert (agent-17). Pour un public DRH/IRP, simplification trop forte.

- **3 confusions persistantes Lukas (agent-28) côté pédagogique comparé** : pourquoi le patronat français refuse cogestion d'entreprise ; pourquoi 1945 = Sécu paritaire (vs NHS, vs Krankenkasse) ; articulation État/partenaires sociaux post-2018. Le jeu présente le fait, pas le choix.

- **Persona joueur naïf : "paritarisme" met 2 parties à infuser** — Yanis (agent-19) : « Si J'AI mis 2 parties pour intégrer le mot, un mobile-only Compulsif décroche à T5. »

---

## V. Bons points consensuels

### Ce qui passe — voix à l'appui

1. **Mémoire CK3-grade narrative — l'ossature plaît** (Pope 04, Romero 05, McGonigal 06, S. Johnson 10, Théo 21, Yanis 19, Béroud 18)
   > « Le système holds up. » — Théo, agent-21
   > « 13 hooks lisibles, sans dépendance circulaire, sans test à reécrire. » — Romero, agent-05

2. **Sceau de cire pulsant 8s — diégétique réussi** (Wroblewski 01, Krug 02)
   > « C'est lent, c'est diégétique, c'est juste — Lucas Pope serait fier. » — Wroblewski, agent-01

3. **ToastStack diégétique (cahier de doléances → télégramme → fax)** (Krug 02, Jules 26)
   > « Un toast qui change de support selon l'ère — je n'avais jamais vu ça dans un serious game. » — Krug, agent-02

4. **Identity anchor en mode Compulsif (`SceneCard.svelte:262-267`)** (Pope 04, Manon 25, Goodwin 12)
   > « Le téléphone à manivelle attend, les Gauloises planent. C'est du Pope dans le texte. » — Pope, agent-04

5. **Posture du choix — barre 4px + label CINZEL + glyph (commit 0813c75)** (Soueidan 03, Manon 25, Pope 04)
   > « Trois indices redondants discrets — robustesse daltoniens + distraits + dyslexiques. » — Manon, agent-25

6. **Couplage intersyndical NAO (CGT-en-retrait → CFDT/FO → contagion CFE-CGC)** (Jobert 17, Béroud 18, Villani 07)
   > « Huit lignes de code mais 30 ans de littérature. Ne touche pas. » — Jobert, agent-17

7. **`futur.ts:35` "algorithme Mosaic de Carrefour évalue 70 000 caissiers"** (Léa 20, Sami 22)
   > « Quelqu'un a pensé à moi en écrivant ça. » — Léa, agent-20

8. **5 fins sans happy ending** (McGonigal 06, Ghys 08)
   > « Pas de happy ending. C'est honnête, c'est sérieux, ça classe Paritas comme jeu civique adulte. » — McGonigal, agent-06

9. **Discipline du commit 0813c75 — 170 lignes virées contre 21 ajoutées** (Manon 25, Pope 04)
   > « Le dev a préféré la lisibilité à la richesse. Indé-grade. » — Manon, agent-25

10. **Justesse historique et juridique des scénarios** (Goodwin 12, Camille 27, Aïcha 23, Béroud 18)
    > « Une historienne professionnelle validerait. » — Aïcha, agent-23
    > « 11 datations sur 13 sont correctes ou défendables. » — Camille, agent-27

11. **Rythme calme — pas de timer, pas d'auto-advance** (Hélène 29)
    > « Lent comme la lecture du soir, pas lent comme une attente. » — Hélène, agent-29

12. **376 tests Vitest verts, 0 régression — base saine** (Carmack 14, Muratori 13)
    > « La machine est saine côté perf. C'est la cohérence interne qui pèche, pas la vélocité. » — Carmack, agent-14

---

## VI. Recommandations ORDA-015 — priorisé

### Bloquants pour bêta privée (cette semaine)

1. **P0-2 (Carmack/Villani)** — `setNaoRng()` + test déterminisme 7 engines · 1 j-h
2. **P0-3 (Duflo/Pascal)** — Aligner `organization.ts:55` et `treasury.ts:87` (rate 0.16) · 0,5 j-h
3. **P0-5 (Krug/Sami)** — `Tutorial.svelte` 6 → 7 ressources · 0,5 j-h
4. **Voix isolée Camille P0** — `institutionsRegistry.ts:32` "Convention nationale interprofessionnelle" · 5 min

**Effort total bloquants bêta privée : ~2 j-h.**

### Bloquants pour bêta publique (sprint actuel)

5. **P0-1 (Pope/Fåhraeus/Théo)** — Brancher stress ≥80 + champ `effects` sur callbacks · 1,5 j-h
6. **P0-4 (Krug/Yanis/Sami/Hélène)** — Cloner pattern aside tutoriel NAO sur 6 ateliers · 3 j-h
7. **P0-6 (Ghys/Lukas)** — `ENDING_TEXTS` paramétrés par camp + 5 versions miroir patron · 1,5 j-h
8. **P0-7 (Pascal/Bruno)** — 4 scénarios PME 2008-2024 · 4-6 j-h

**Effort total bloquants bêta publique : ~10-12 j-h.**

### Sprint suivant (P1 prioritaires)

9. P1-1 (Muratori) — Pureté `scheduleActorCallback` · 1 j-h
10. P1-3 (S. Johnson) — Previews ▲▼ modulés par `fuelMultiplier` · 0,5 j-h
11. P1-4 (Soueidan/Jules) — Ticker focus + contraste · 0,5 j-h
12. P1-5 (Beaud) — `epuise-mouvement` paramétré par contexte · 1 j-h
13. P1-7 (Romero/Fåhraeus) — Brancher mémoire+stress dans Matignon · 2 j-h
14. P1-8 (Goodwin/Bruno) — Réécrire callback Frachon en ambivalence · 0,25 j-h
15. P1-9 (Jobert/Léa) — Presets NAO `cadres` + `distribution-services` · 2 j-h
16. P1-6 (Goodwin/Lukas) — Voix CFDT historique (Maire 1982) · 1 j-h
17. P1-2 (Muratori) — Splitter `CockpitShell.svelte` · 2 j-h

### P2 / dette

- Voix Aïcha — Mode "Séance prof" (démarrage à ère choisie + dossier pédagogique)
- Voix Béroud — Pipeline rupture 1995-2020 (SUD, coordinations, Sud-Rail)
- Voix Aïcha — Inclusion genre Carlier/Modiano/Pelletier
- Voix Lukas — Side event "Triangle paritaire" Sécu+Unédic+Agirc-Arrco
- Voix Pope — Diégétiser posture-tag, badge POV, ticker (typo machine à écrire)
- Voix Muratori — Audit chunk audio 265 KB
- Voix Camille — Aligner `institutions.ts:67` "ordonnances 4 et 19 octobre 1945"

---

## VII. Liste exhaustive des 30 NPS + fiches

| # | Agent | Rôle / lentille | NPS | Fix prioritaire signalé |
|---|---|---|---|---|
| 01 | Luke Wroblewski | Architecte UX mobile-first | **6** | Masquer 4 jauges sur 7 par défaut Carnet (`CockpitTopHeader.svelte:9-17`) |
| 02 | Steve Krug | Architecte UX 3-secondes | **6** | Compteur "Tour N/100 · Ère X" promu, hisser upcoming-forcing-banner (`CockpitShell.svelte:330-339`) |
| 03 | Hadi Soueidan | Architecte a11y / NVDA | **7** | Outline visible `.ticker-item.interactive:focus-visible` (`NewsTicker.svelte:297`) |
| 04 | Lucas Pope | Architecte sobriété / diégétique | **7** | `effects: Effects` sur `ScheduledActorCallback` (`gameLoop.ts:39-54` + `consequenceEngine.ts:146-158`) |
| 05 | Brenda Romero | Architecte cruauté narrative | **8** | 4 callbacks symétriques pour `cree-prudhommes`/`cree-syndicat-1884`/`cree-conventions-1919`/`cree-unedic` |
| 06 | Jane McGonigal | Architecte rythme/flow | **8** | Enrichir `ENDING_TEXTS` avec liens "pour aller plus loin" (`endingEngine.ts:78-89`) |
| 07 | Cédric Villani | Géomètre / cohérence formelle | **7** | `setNaoRng()` + router `Math.random()` (`nao/engine.ts:782-784,809`) |
| 08 | Étienne Ghys | Géomètre / topologie | **7** | Symétriser `ENDING_TEXTS` patron (`endingEngine.ts:78-89`) |
| 09 | Henrik Fåhraeus | Diplomate / système CK3 | **8** | Stress ≥80 → malus mécanique -10% dégressif |
| 10 | Soren Johnson | Diplomate / transparence modèle | **8** | Previews `▲▼` modulés par `fuelMultiplier` (`SceneCard.svelte:383`) |
| 11 | Esther Duflo | Stratège RCT / arithmétique | **7** | Harmoniser `cotisationRate` (`organization.ts:55` ↔ `treasury.ts:87`) |
| 12 | Kim Goodwin (lentille historienne) | Stratège / historiographie | **8** | Réécrire callback `signe-matignon` en ambivalence (`choiceResolver.ts:111`) |
| 13 | Casey Muratori | Sapeur / pureté & god-shell | **7** | Refactor `scheduleActorCallback` en pure function |
| 14 | John Carmack | Sapeur / déterminisme | **5** | `setNaoRng()` à `nao/engine.ts:790`, refacto 3 sites |
| 15 | Bernard Friot | Paritarisme doctrinal | **7** | Champ `gouvernance` sur `InstitutionDef` + entrée glossary "capital salarial" |
| 16 | Stéphane Beaud | Paritarisme voix ouvrière | **5** | Paramétrer `epuise-mouvement` par contexte + camp (`choiceResolver.ts:151-158`) |
| 17 | Annette Jobert | Diplomate / sociologie syndicale | **8** | Ajouter preset NAO `cadres` (`nao/engine.ts:147-157`) |
| 18 | Sophie Béroud | Diplomate / syndicalisme post-1995 | **7** | Ajouter SUD/Solidaires comme 5e NaoUnion |
| 19 | Yanis B. (étudiant L3) | Joueur ordinaire jeune | **7** | Cloner aside tutoriel NAO sur 6 ateliers restants |
| 20 | Léa K. (caissière CFDT-Services) | Base / militante terrain | **5** | Preset NAO `distribution-services` (planning/temps-partiel) |
| 21 | Théo G. (R&D Thales CFE-CGC) | Diplomate / Old World | **7** | Stress ≥80 → malus mécanique réel (`choiceResolver.ts:36-44`) |
| 22 | Sami L. (cible primaire 18-30) | Plateforme / coursier | **3** | Aligner `Tutorial.svelte` 6 → 7 ressources |
| 23 | Aïcha M. (lentille prof H-G lycée) | Pédagogique scolaire | **7** | Mode "Séance prof" — démarrage à ère choisie + dossier péda |
| 24 | Pascal M. (patron PME Lyon CPME) | Patronat TPE/PME | **7** | Cohérence treasury (`organization.ts:55` vs `treasury.ts:87`) |
| 25 | Manon E. | Diplomate / design indé | **8** | Mode `a11y-cognitive` proposé en hint tour 1 (`CockpitShell.svelte:388-409`) |
| 26 | Jules O. (lentille streamer Twitch) | Streamer / créateur de contenu | **7** | Contraste NewsTicker neutre — `#E8DCB0` plein |
| 27 | Camille D. (lentille juriste droit social) | Scolaire / juriste | **8** | Corriger `institutionsRegistry.ts:32` CCN → "Convention nationale" |
| 28 | Lukas K. (Stuttgart, IG-Metall) | Hors-France / comparé | **7** | Callbacks symétriques flags Mitbestimmung (`choiceResolver.ts:178-193`) |
| 29 | Hélène F. (67 ans, retraitée CFDT) | Senior / accessibilité | **7** | "Texte Grand" 18px → 22-24px (`app.css:38`) |
| 30 | Bruno P. (dirigeant PME BTP CPME 44) | Patronat TPE/PME | **7** | 4 scénarios PME 2008-2024 (rupture conventionnelle, CICE, ord. 2017 vue PME, APC) |

---

**Argus, Maréchal-auditeur**
*Mille yeux pour ce panel de trente. Le veilleur a vu, le veilleur a noté.*
*Le moteur tient. La doctrine V3 doit être révisée sur RNG-NAO. Le panel CK3 est ravi mais demande sa conséquence mécanique. La cible primaire 18-30 décroche sur les ateliers non-tutorisés. La voix patronale PME existe à 2 % du corpus — il faut la doubler. Et aucun NPS sur 30 n'a atteint 9. C'est le signe que tout est presque là — pas encore là.*
