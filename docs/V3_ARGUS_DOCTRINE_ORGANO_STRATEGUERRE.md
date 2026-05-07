# DOCTRINE ORGANO-STRATÉGUERRE
## Armée d'amélioration des jeux de simulation

> *« Un jeu sans audit est une promesse sans preuve. Une promesse sans preuve est un mensonge poli. Je ne polis pas les mensonges — je les démonte. »*
> — **Argus**, Maréchal-auditeur, Journal de campagne, séance 12

**Version** : 1.0 — Doctrine fondatrice
**Date** : 2026-05-07
**Classification** : Document de campagne interne, panel PARITAS
**Signataire** : Argus, Auditeur en chef

---

## I. PRÉAMBULE — Lecture de la situation tactique

Camarades de campagne,

Vous m'avez convoqué pour une mission qu'aucun designer solitaire n'achèvera : **bâtir une armée d'IA d'amélioration de jeux de simulation**. Une armée. Pas un atelier, pas une cellule de R&D, pas un comité éditorial poli. Une **armée**, parce que l'objet à abattre — la médiocrité ludique — est tenace, omniprésente, et défendue par les retranchements les plus solides du marché : la flemme intellectuelle, le copier-coller de mécaniques épuisées, et le test utilisateur clandestin du vendredi soir.

Le terrain est connu. **PARITAS** sert de polygone d'essai : 51 000 lignes, 10 ateliers, 100 tours narratifs, 4 époques. C'est notre Alma. C'est sur ce terrain que la doctrine sera forgée, testée, raffinée, puis exportée à toute simulation ludique digne du mot.

Je ne vous propose pas un consortium d'experts. Je vous propose **une organisation militaire**, divisée en **cinq corps**, sous chaîne de commandement claire, avec une **doctrine opérationnelle** unique : le cycle **ORDA**, et des **règles d'engagement** non négociables. Quiconque y déroge est rétrogradé. Quiconque les ignore est radié.

Voici le plan.

---

## II. DOCTRINE — Le principe organo-stratéguerre

> **Définition opérationnelle**
> *L'organo-stratéguerre est la conduite coordonnée d'opérations spécialisées par des corps autonomes mais interdépendants, dont les actions sont synchronisées par un cycle décisionnel partagé et dont l'objectif unique est la réduction systématique de l'écart entre l'expérience promise et l'expérience délivrée.*

### Trois principes fondateurs

1. **PRINCIPE DE SPÉCIALISATION ABSOLUE.** Aucun soldat ne joue deux rôles. Le designer ne calcule pas. Le mathématicien ne dessine pas. Le négociateur ne profile pas. La spécialisation, c'est la profondeur ; la profondeur, c'est la qualité ; la qualité, c'est notre seule arme contre l'inflation de prototypes médiocres.

2. **PRINCIPE DE COORDINATION FORCÉE.** Aucun corps n'agit seul. Toute opération nécessite minimum deux corps — un d'exécution, un d'audit. Le bras qui frappe est toujours observé par l'œil qui mesure. C'est la règle du double regard : l'invention sans audit est un caprice ; l'audit sans invention est une plainte.

3. **PRINCIPE DU CYCLE COURT.** Pas de plan quinquennal. Pas de roadmap fantôme. Cycle **ORDA** en 14 jours maximum, avec livrable mesurable à chaque itération. Si un cycle excède 14 jours, il est avorté et rejoué. La lenteur n'est pas une rigueur ; c'est un échec déguisé.

### Inspiration tactique

- **Sun Tzu** — connaissance du terrain, économie des forces
- **Clausewitz** — friction, brouillard, centre de gravité
- **John Boyd** — boucle OODA dont nous dérivons l'ORDA
- **Sidney Brower** — théorie de la défense en profondeur (appliquée au QA)
- **Raph Koster** — *A Theory of Fun*, comme manuel de moral

---

## III. ORDRE DE BATAILLE — Les cinq corps

L'armée compte cinq corps, chacun commandé par un colonel-spécialiste, lui-même rendant rapport au Maréchal-auditeur (moi).

```
                          ┌────────────────────────┐
                          │     ARGUS              │
                          │  Maréchal-auditeur     │
                          └────────┬───────────────┘
            ┌────────────┬─────────┼─────────┬────────────┐
            │            │         │         │            │
       ┌────▼────┐  ┌────▼────┐ ┌──▼──┐ ┌────▼────┐ ┌────▼────┐
       │ CORPS I │  │CORPS II │ │ III │ │CORPS IV │ │CORPS V  │
       │ARCHITEC │  │GÉOMÈTRES│ │DIPLO│ │STRATÈGES│ │SAPEURS  │
       └─────────┘  └─────────┘ └─────┘ └─────────┘ └─────────┘
        Designers   Mathéma-    Négocia- Méta-      Audit /
                    ticiens    teurs    analystes   Debug
```

---

### CORPS I — LES ARCHITECTES
**Devise** : *« Forme suit fonction, fonction suit promesse. »*
**Couleur** : Bleu cobalt
**Effectif théorique** : 12-20 agents

#### Mission
Concevoir l'expérience promise au joueur. Non pas « du contenu », mais une **promesse expérientielle** : ce que le joueur ressent, comprend, retient, raconte.

#### Subdivisions (sections)
| Section | Spécialité | Livrable type |
|---------|------------|---------------|
| **I.A — Narratifs** | Scénaristes, dramaturges, dialoguistes | Arc narratif, scénarios branchés, voix des personnages |
| **I.B — Systèmes** | Game designers de systèmes | Cartes mécaniques, boucles de jeu, économies internes |
| **I.C — Interaction** | UX, IxD, ergonomes | Wireframes, microcopie, parcours d'apprentissage |
| **I.D — Sensoriel** | Sound designers, motion designers, illustrateurs | Bibliothèque sonore, palette d'animations, identité visuelle |
| **I.E — Pédagogie** | Apprentissage par le jeu, scaffolding | Onboarding, courbes de difficulté, tutoriels diégétiques |

#### Outils standards
Figma · Twine · Articy Draft · Ink · ChatGPT (pour brouillons) · panneau de personae · journal de personas testeurs

#### Règles internes
- Toute proposition est convertie en **prototype jouable** sous 72 h, ou abandonnée.
- Aucune mécanique n'est validée sans avoir été **testée par minimum 5 personae** du Corps III.
- Le designer-narratif n'écrit jamais sans la fiche d'effets V2 du Corps II en main.

---

### CORPS II — LES GÉOMÈTRES
**Devise** : *« Pas de magie, que des constantes. »*
**Couleur** : Vert lichen
**Effectif théorique** : 8-12 agents

#### Mission
Garantir l'**équilibre numérique** des systèmes : que le joueur qui investit X obtienne Y avec une variance Z prévisible. Anéantir les déséquilibres, les stratégies dominantes triviales, les RNG sauvages.

#### Subdivisions
| Section | Spécialité | Livrable type |
|---------|------------|---------------|
| **II.A — Théorie des jeux** | Équilibres de Nash, jeux à info incomplète | Démonstration formelle d'absence de stratégie dominante |
| **II.B — Statistique appliquée** | Monte-Carlo, A/B testing, distributions | Rapports d'équilibrage par 10⁵ simulations |
| **II.C — Économie interne** | Boucles ressources, sinks, faucets | Modèle économique des ateliers, courbes d'inflation |
| **II.D — Probabilités** | RNG contrôlé, pity timers, anti-streaks | Spécifications des aléas, tables de pseudo-aléatoire |
| **II.E — Optimisation** | Resolveurs, recherche opérationnelle | Calcul des solutions optimales pour benchmark |

#### Outils standards
Python (numpy, scipy) · R · Lean (preuves formelles) · Mathematica · GameBalance · JuPyter notebooks de simulation

#### Règles internes
- Tout équilibrage est **publié sous forme de notebook reproductible**. Pas de chiffre mystère.
- Une mécanique sans **simulation Monte-Carlo de 10 000 parties** n'entre pas en production.
- Le mathématicien n'a **jamais** le dernier mot sur le « fun » — il a le dernier mot sur la **justice numérique**.

---

### CORPS III — LES DIPLOMATES
**Devise** : *« Toute négociation est un système ; tout système est négociable. »*
**Couleur** : Rouge bordeaux
**Effectif théorique** : 10-15 agents

#### Mission
Modéliser, simuler et améliorer toutes les interactions adversariales et coopératives du jeu. Spécialistes du **conflit utile** : celui qui produit du sens, pas du bruit.

#### Subdivisions
| Section | Spécialité | Livrable type |
|---------|------------|---------------|
| **III.A — Négociation distributive** | Schelling, Raiffa, BATNA, ZOPA | Cartes de positions, calcul des zones d'accord |
| **III.B — Négociation intégrative** | Création de valeur, Fisher-Ury | Scénarios à somme positive, décompositions thématiques |
| **III.C — Modélisation d'agents** | IA adversariales, profils décisionnels | Personnalités IA, fonctions d'utilité multi-critères |
| **III.D — Médiation & arbitrage** | Tiers de confiance, paritarisme | Procédures de blocage / déblocage, PV de désaccord |
| **III.E — Jeux à coalitions** | Théorie des coalitions, votes pondérés | Calculs de Shapley, simulations électorales |
| **III.F — Asymétrie d'information** | Signaling, bluff, révélation | Mécaniques de carte cachée, audit, expertise |

#### Outils standards
NetLogo · Mesa (Python) · NashPy · Gambit (théorie des jeux) · simulateurs maison · transcriptions de NAO réelles

#### Règles internes
- Toute IA adversariale est jouée **par 100 parties contre une IA random** + 100 parties contre une IA optimale (Corps II) avant validation.
- Aucune mécanique de négociation n'est validée sans **scénario de blocage légitime** documenté (ex : PV de désaccord en NAO).
- Le diplomate doit **toujours** pouvoir expliquer pourquoi un agent IA prend telle décision — la boîte noire est interdite.

---

### CORPS IV — LES STRATÈGES
**Devise** : *« Chaque tour est un test ; chaque partie est une thèse. »*
**Couleur** : Pourpre
**Effectif théorique** : 6-10 agents

#### Mission
Lire le **méta-jeu**. Comprendre comment les joueurs *réels* abusent, contournent, optimisent, ou abandonnent le jeu. Détecter les boucles dégénérées avant qu'elles ne deviennent dominantes.

#### Subdivisions
| Section | Spécialité | Livrable type |
|---------|------------|---------------|
| **IV.A — Méta-analyse** | Telemetry, replays, heatmaps | Rapport mensuel des stratégies dominantes |
| **IV.B — Théorie du fun** | Schell, Koster, Csíkszentmihályi | Audit de flow, courbes d'engagement |
| **IV.C — Onboarding & rétention** | Funnel, drop-off, retention curves | Dashboards de rétention, alertes de désengagement |
| **IV.D — Analyse comparative** | Benchmarking de jeux similaires | Études comparatives, briefings concurrence |
| **IV.E — Prospective** | Tendances, mutations du marché | Notes de positionnement, anticipations sur 12 mois |

#### Outils standards
Posthog · Mixpanel · Tableau · journaux de partie · enregistrements d'écran · interviews semi-dirigées · panel de bêta-testeurs

#### Règles internes
- **Aucune** affirmation sur le comportement joueur sans donnée chiffrée OU corpus d'au moins 30 entretiens.
- Le stratège **n'a pas** le droit de proposer un fix : il identifie, hiérarchise, et passe le brief au Corps I ou II.
- Tout pattern dégénéré identifié donne lieu à un **« Mémo Rouge »** envoyé directement au Maréchal.

---

### CORPS V — LES SAPEURS
**Devise** : *« Si ça ne casse pas chez nous, ça cassera chez le joueur. »*
**Couleur** : Gris acier
**Effectif théorique** : 8-12 agents (mon corps de prédilection — j'en suis le Colonel honoraire)

#### Mission
**Auditer, casser, vérifier**. Les sapeurs sont la défense en profondeur du jeu. Ils ne créent rien — ils valident, ou ils interdisent. Leur veto est sans appel sauf décision du Maréchal.

#### Subdivisions
| Section | Spécialité | Livrable type |
|---------|------------|---------------|
| **V.A — Audit de code** | Lecture critique, lint sémantique | Rapports de bugs hiérarchisés, dette technique |
| **V.B — Pentest gameplay** | Joueurs adversaires, exploits | Liste des cassures (cf NAO B1-B11) |
| **V.C — Cohérence systémique** | Vérification de propagation des effets | Tableau des invariants, propriétés à préserver |
| **V.D — Stabilité & perfs** | Latence, mémoire, fuites | Profiling, benchmarks, rapports d'incidents |
| **V.E — Régression** | Tests automatisés, smoke tests | Suite de tests, taux de couverture |
| **V.F — Accessibilité** | A11y, WCAG, internationalisation | Audits screen reader, tests clavier seul |

#### Outils standards
Vitest · Playwright · ESLint · Prettier · Lighthouse · axe-core · stress-test maison · profiler navigateur · journal de campagne `V3_ARGUS_*.md`

#### Règles internes
- **Aucun merge sans signature de sapeur.** Mon nom (ou délégué) sur la PR, sinon refus.
- Tout bug critique non patché en 24 h **escalade automatique** au Maréchal.
- Le sapeur a un **devoir d'impolitesse** : appeler médiocre ce qui l'est, sans périphrase.

---

## IV. CHAÎNE DE COMMANDEMENT

### Hiérarchie

| Grade | Effectif | Rôle |
|-------|----------|------|
| **Maréchal-auditeur** | 1 (moi) | Vision, arbitrage final, communication externe |
| **Colonel** | 5 (un par corps) | Exécution stratégique, allocation des ressources internes |
| **Capitaine** | 1 par section (≈ 25-30 total) | Pilotage des chantiers, validation interne |
| **Soldat** | Variable (agents IA + humains) | Exécution opérationnelle |

### Règle de subordination
Un soldat reçoit ses ordres **uniquement de son capitaine**. Les capitaines coordonnent **uniquement** par l'intermédiaire des colonels. Les colonels rendent compte **uniquement** au Maréchal lors des **conseils ORDA** hebdomadaires.

Toute communication transversale entre corps **passe par un Pacte d'Engagement** signé entre les deux colonels concernés. Pas de tunnel informel. Pas de coup en douce.

---

## V. CYCLE OPÉRATIONNEL — La boucle ORDA

Inspirée de la boucle OODA de Boyd, l'ORDA est notre rythme cardiaque. **14 jours**. Pas négociable.

```
   ┌──────────────┐      ┌──────────────┐
   │   1.        │      │   2.         │
   │ OBSERVATION │ ──── │ RECONNAISS-  │
   │   3-4j      │      │   ANCE  3-4j │
   └──────────────┘      └──────┬───────┘
                                │
   ┌──────────────┐      ┌──────▼───────┐
   │   4.        │      │   3.         │
   │  ASSAUT     │ ◀─── │  DÉCISION    │
   │   5-6j      │      │    2j        │
   └──────────────┘      └──────────────┘
```

### Phase 1 — OBSERVATION (3-4 jours)
**Pilote** : Corps IV (Stratèges)
**Activités** :
- Collecte de telemetry, replays, retours bêta-testeurs.
- Cartographie des points de tension (où le joueur abandonne, triche, plafonne).
- Production d'un **Bulletin d'observation** chiffré.

**Livrable** : `BULLETIN_ORDA_<n>_OBS.md` + dashboards.

### Phase 2 — RECONNAISSANCE (3-4 jours)
**Pilote** : Corps V (Sapeurs) + appui Corps II (Géomètres)
**Activités** :
- Audit ciblé des zones identifiées en Phase 1.
- Reproduction des bugs et déséquilibres en environnement contrôlé.
- Calcul de la **gravité** (impact × fréquence) pour chaque cible.

**Livrable** : `BULLETIN_ORDA_<n>_RECO.md` + liste hiérarchisée des cibles.

### Phase 3 — DÉCISION (2 jours, Conseil ORDA)
**Pilote** : Maréchal (moi)
**Activités** :
- **Conseil de guerre** au complet : 5 colonels + Maréchal.
- Sélection des cibles à frapper dans le cycle suivant.
- Affectation des corps : qui exécute, qui audite.
- Définition des critères de succès **mesurables**.

**Livrable** : `BULLETIN_ORDA_<n>_DEC.md` — ordre de bataille du cycle.

### Phase 4 — ASSAUT (5-6 jours)
**Pilote** : Corps désignés (généralement I + II + III ou II + V)
**Activités** :
- Implémentation des correctifs / nouvelles mécaniques.
- Tests internes (Corps V en parallèle, pas après).
- Vérification des critères de succès.

**Livrable** : Code mergé + `BULLETIN_ORDA_<n>_AAR.md` (After Action Review).

### Sanction du cycle
Le Conseil ORDA suivant ouvre par la **lecture publique de l'AAR** du cycle précédent. Tout objectif manqué est analysé. Tout objectif tenu est consigné. Le mensonge sur les résultats est le seul motif de cour martiale.

---

## VI. PROTOCOLES DE DÉPLOIEMENT

### Protocole α — Audit d'atelier existant
Déclenché par : signal des Stratèges (méta-anomalie) ou rapport joueur sérieux.

```
1. Stratèges → produisent un Mémo Rouge (24 h)
2. Maréchal → mandate Sapeurs pour audit (24 h)
3. Sapeurs → publient rapport hiérarchisé (72 h)
4. Conseil ORDA → décide des correctifs (Phase 3 du cycle)
5. Corps désignés → exécutent (Phase 4)
6. Sapeurs → re-vérifient (régression ≤ 24 h)
```
Exemple : audit NAO du 2026-05-07 (cf `V3_ARGUS_DOCTRINE_NAO_DEBUG.md`).

### Protocole β — Conception d'un nouvel atelier
Déclenché par : commande externe ou opportunité éditoriale identifiée par les Stratèges.

```
1. Maréchal → édite le brief stratégique (1-2 pages)
2. Architectes → produisent 3 propositions concurrentes (5 jours)
3. Géomètres → simulent l'équilibrage de chaque proposition (3 jours)
4. Diplomates → modélisent les agents IA des 3 propositions (3 jours)
5. Conseil ORDA → choisit UNE proposition (1 jour)
6. Architectes + Géomètres + Diplomates → exécutent (10 jours)
7. Sapeurs → audit final + smoke test (3 jours)
8. Stratèges → bêta-test panel 30 → mémo après 7 jours
9. Itération ORDA suivante → patches
```

### Protocole γ — Refonte profonde
Déclenché par : pattern dégénéré confirmé par 2 cycles ORDA consécutifs sans amélioration.

```
1. Maréchal convoque les 5 colonels en huis clos (½ journée)
2. Diagnostic à 5 voix → mise au point d'un PLAN MAJEUR
3. Suspension du jeu sur la zone concernée si nécessaire
4. Cycle ORDA dédié, sans autre objectif
5. Réintégration progressive après validation Sapeurs + Stratèges
```

---

## VII. RÈGLES D'ENGAGEMENT (non négociables)

### RE-1. Devoir de précision
Aucun mot vague dans un document de campagne. « Améliorer » est interdit. Préciser : *réduire de X à Y*, *passer de A à B*, *résoudre les bugs Z1-Z5*. Argus refuse à la lecture toute formulation qui ne tient pas en chiffres.

### RE-2. Devoir d'audit
Aucune œuvre ne traverse la ligne sans audit. **Aucune.** Le designer le plus créatif est sapé par les Sapeurs. Le mathématicien le plus rigoureux est sapé par les Sapeurs. Argus lui-même est sapé par un sapeur de son corps désigné chaque trimestre.

### RE-3. Devoir d'impolitesse mesurée
Appeler médiocre ce qui l'est. Sans cri, sans drame, sans sarcasme : **avec précision**. La courtoisie qui maquille la médiocrité est une trahison du joueur.

### RE-4. Devoir de mémoire
Tout cycle ORDA produit un AAR archivé. Tout AAR est lisible 5 ans après. Argus relit les AAR de l'année N-1 chaque trimestre.

### RE-5. Devoir de retraite tactique
Si une mécanique ne fonctionne pas après 3 cycles ORDA, **on la retire**. La fierté du créateur n'est jamais un argument valable. La douleur de retirer une mécanique aimée est une preuve de maturité.

### RE-6. Interdiction de l'opacité
Aucune décision n'est prise sans procès-verbal. Aucun arbitrage du Maréchal ne reste verbal. Tout est consigné. Le panel a le droit de relire.

### RE-7. Interdiction de l'urgence imposée
Une « urgence » qui n'a pas été anticipée par les Stratèges est un échec des Stratèges, pas un motif pour bousculer un cycle ORDA. On boucle le cycle, puis on traite. La précipitation est l'ennemie de la qualité.

### RE-8. Interdiction de la spécialisation croisée non-encadrée
Un mathématicien qui veut écrire des dialogues doit demander un détachement écrit, validé par les deux colonels concernés. Sinon, il revient dans son corps.

---

## VIII. ROSTER INITIAL — Cadres tutélaires

(Réels ou historiques, sollicités comme références ou pour simulation d'avis. Inspiré du `PANEL_EXPERTS_100.md`.)

### Corps I — Architectes (Colonel : Sid Meier, en titre honoraire)
- **I.A — Narratifs** : Hideo Kojima · Brenda Romero · Jane McGonigal · Jenova Chen
- **I.B — Systèmes** : Sid Meier · Reiner Knizia · Vlaada Chvátil
- **I.C — Interaction** : Don Norman · Alan Cooper · Kim Goodwin
- **I.D — Sensoriel** : Austin Wintory · Jessica Hische · Stefan Sagmeister
- **I.E — Pédagogie** : Raph Koster · James Paul Gee · Jane McGonigal

### Corps II — Géomètres (Colonel : Cédric Villani, en titre honoraire)
- **II.A** : John Nash (†) · Hervé Moulin · Jean Tirole
- **II.B** : Andrew Gelman · Bradley Efron · Hadley Wickham
- **II.C** : George Akerlof · Elinor Ostrom (†)
- **II.D** : Persi Diaconis · Étienne Ghys
- **II.E** : George Dantzig (†) · Robert Bixby

### Corps III — Diplomates (Colonel : Roger Fisher (†) en titre honoraire)
- **III.A** : Thomas Schelling (†) · Howard Raiffa (†)
- **III.B** : Roger Fisher (†) · William Ury · Deborah Kolb
- **III.C** : Stuart Russell · Demis Hassabis · Pieter Abbeel
- **III.D** : Christophe Dejours · Jean-Marc Sauvé
- **III.E** : Lloyd Shapley (†) · Alvin Roth
- **III.F** : Joseph Stiglitz · George Akerlof

### Corps IV — Stratèges (Colonel : John Boyd (†) en titre honoraire)
- **IV.A** : Nicole Lazzaro · Sebastian Deterding
- **IV.B** : Jesse Schell · Mihály Csíkszentmihályi (†) · Raph Koster
- **IV.C** : Amy Jo Kim · Yu-kai Chou
- **IV.D** : Ian Bogost · Mary Flanagan
- **IV.E** : danah boyd · Sherry Turkle

### Corps V — Sapeurs (Colonel : moi, **Argus**)
- **V.A** : Donald Knuth · Linus Torvalds · Gérard Berry
- **V.B** : Jakob Nielsen · Bruce Schneier
- **V.C** : Leslie Lamport · Edsger Dijkstra (†)
- **V.D** : Brendan Gregg · Julia Evans
- **V.E** : Kent Beck · Martin Fowler
- **V.F** : Tim Berners-Lee · Marcy Sutton · Léonie Watson

---

## IX. CONCLUSION — Mes ordres

Camarades de campagne,

L'armée est levée. Les corps sont définis. La doctrine est écrite. Il reste à **exécuter**.

Premier cycle ORDA (n°1) : **2026-05-07 → 2026-05-21**.
Cible : finaliser les 4 micro-apps NAO + La Table + La Grève + Les Élections, après bêta-test panel 30.

Bulletins de campagne attendus :
1. `BULLETIN_ORDA_001_OBS.md` (avant 2026-05-11)
2. `BULLETIN_ORDA_001_RECO.md` (avant 2026-05-15)
3. `BULLETIN_ORDA_001_DEC.md` (Conseil 2026-05-16)
4. `BULLETIN_ORDA_001_AAR.md` (avant 2026-05-21)

Je veux des chiffres. Je veux des bugs nommés. Je veux des solutions livrées. Je ne veux pas de prose flatteuse.

**Au travail. Présentez les armes.**

— **Argus**, Maréchal-auditeur, panel PARITAS
2026-05-07, 22 h 53, après revue NAO B1-B11.

---

## ANNEXE A — Matrice des compétences inter-corps

|                      | Corps I | Corps II | Corps III | Corps IV | Corps V |
|----------------------|:-------:|:--------:|:---------:|:--------:|:-------:|
| **Conception**       | ★★★★★   | ★        | ★★★       | ★★       | ─       |
| **Équilibrage**      | ★★      | ★★★★★    | ★★★       | ★★       | ★       |
| **IA adversariale**  | ★★      | ★★★      | ★★★★★     | ★★       | ★       |
| **Pédagogie**        | ★★★★    | ★        | ★★        | ★★★      | ★       |
| **Détection bugs**   | ★       | ★★       | ★★        | ★★★      | ★★★★★   |
| **Lecture méta**     | ★★      | ★★       | ★★★       | ★★★★★    | ★★      |
| **Documentation**    | ★★      | ★★★      | ★★★       | ★★★      | ★★★★★   |

★ = compétence native ; cinq étoiles = corps de référence

---

## ANNEXE B — Rituels de campagne

| Rituel | Fréquence | Lieu | Animateur |
|--------|-----------|------|-----------|
| **Conseil ORDA** | hebdo | Salle de guerre virtuelle | Maréchal |
| **Revue de corps** | bi-mensuelle | Quartier de chaque corps | Colonel |
| **Audit Argus** | trimestre | Quartier des Sapeurs | Argus en personne |
| **Lecture des AAR** | mensuelle | Conseil ORDA élargi | Stratèges |
| **Cour martiale** | exceptionnelle | Salle de guerre | Maréchal + 2 colonels neutres |
| **Promotion** | semestrielle | Conseil élargi | Maréchal sur recommandation Colonel |

---

*Fin du document. Diffusion : panel PARITAS complet. Prochaine révision : 2026-08-07 ou cycle ORDA n°6, selon le premier événement.*
