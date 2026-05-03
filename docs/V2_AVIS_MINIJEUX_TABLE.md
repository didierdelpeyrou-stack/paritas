# V2 — Design complet · 202 avis · 7 scénarios à mini-jeux · La Table · Roadmap

Document de **design + roadmap**. Fusionne la lecture du panel
[PANEL_202_PERSONAS.csv](PANEL_202_PERSONAS.csv) et la spec produit
V2 (mini-jeux systémiques + Table des Négociations + plan de
livraison sur 6 mois). Pour les tâches dev V1.x, voir
[ROADMAP_PANEL_INTEGRATION.md](ROADMAP_PANEL_INTEGRATION.md). Pour
l'architecture déjà draftée, voir
[PARITAS_V2_ARCHITECTURE.md](PARITAS_V2_ARCHITECTURE.md). Audit audio
cycles 1-2 dans [AUDIT_AUDIO_2026-05.md](AUDIT_AUDIO_2026-05.md).

---

## Plan du document

1. **Méthode** — panel 202, filtres, méta-méthode
2. **Synthèse 4 quadrants** — à maintenir / développer / supprimer / améliorer
3. **8 axes d'évaluation** — couverture du panel par axe (référence)
4. **6 tensions structurantes** — interprétation des verdicts
5. **7 scénarios V2 avec mini-jeux systémiques** — un mini-jeu par tour pivot
6. **Spec détaillée — La Table des Négociations** — module central, 4 modes
7. **Développement détaillé des 7 mini-jeux historiques** — Statut Juridique, Le Piège, Table, Voix Intérieures, QPC, BIT, Signaux Faibles
8. **7 mini-jeux de gestion permanente — l'épine dorsale gamifiée** — Mandat, Organisation, Monde, Trésorerie, Manifestation, Meeting, Talents
9. **Interface Cockpit — Le Pupitre Paritaire** — dashboard central, "Le Ciel" comme viewport scénario, instruments en laiton, menus glissants
10. **Principes de design systémique** — règles d'authenticité
11. **Roadmap V2 — 11 vagues sur ~38 semaines** — plan de livraison incluant cockpit

---

# 1. Méthode

| Sous-population | N | Critère |
|---|---|---|
| **Total panel** | **202** | Tous les profils du CSV |
| Rejoueurs (≥ 2 plays) | 79 | Colonne `Partie 2` non vide |
| Triple-rejoueurs (≥ 3 plays) | 4 | #16 Sid Meier, #85 Castel, #110 Morin, #123 Binet |
| Single-play | 123 | Verdicts focalisés sur un point |
| Personas décédées | 14 | Marqués « lecture probable » |

**Catégories** (19) couvrant : informaticiens, graphistes, UX, game
designers, mathématiciens, sysadmin, sound designers, historiens,
économistes, sociologues, neuro-psy, IA, psychologues, socio-éco,
philo/épistémo, anthropologues, paritarisme, neuroatypiques,
nobel, cybernéticiens, sciences éducation, syndicalistes salariés
(13), syndicalistes patronaux (12), politistes/syndical, biochimistes,
géographes, médecins, avocats, marketing, UX nouvelle gen, artistes
2026, futurologues.

Les 19 catégories ne se mappent pas un-à-un sur les 8 axes — un
économiste parle de ressources et d'international, un cybernéticien
parle d'architecture et de boucles.

---

# 2. Synthèse 4 quadrants

## À maintenir — ne pas casser (14 piliers)

- **Mode Réfléchi a11y autistique** — Grandin (#89). *Est* l'a11y
  cognitive du jeu.
- **Mode Compulsif émotionnellement juste** — Hopkins (#91),
  Damasio (#58), Naccache (#57), Varela (#106). À étendre, pas
  atténuer.
- **Glossaire cliquable comme œuvre** — Henrot (#195), Charlot (#115).
- **Coût position réformiste isolée** — Notat (#132 ×2). Ne surtout
  pas adoucir.
- **Bonne épaisseur du XIXe** — Deluermoz (#40 ×2). Le contenu est
  solide ; ce qui sature, c'est la forme (cartouches), pas le fond.
- **Pédagogie juste** — Cohen (#44), Charlot (#115), Houdé (#112).
- **Beauté typographique de la landing** — Chimero (#189),
  Apeloig (#10).
- **Sobriété visuelle** — Chen (#18), Vignelli (#8). Pas de
  particules.
- **Couplages entre ressources** — Bertozzi (#159), Bateson (#104).
  À documenter, pas refondre.
- **Pari du sérieux assumé** — Koster (#21).
- **Rejouabilité par figures féminines** — Binet (#123 ×3).
- **Patrimoine DP intelligent** — Marseillaise 1907, Internationale,
  Garde Républicaine.
- **Audio mature cycle 1+2** — ducking pro, bus séparés, mood
  automation.
- **Inconfort éthique nommé** — Romero (#22 ×2), Monteiro (#184).

## À développer — manques explicites (68 ajouts en 8 clusters)

### Cluster A. Représentation (12)

| Ajout | Personas |
|---|---|
| Lucie Baud (1870-1913) figure jouable | #38 Perrot, #40 Deluermoz |
| Henriette Carlier figure jouable | #38, #128 Duteil |
| Postcolonialité (Outre-mer, immigration) | #196 Sondra Perry, #39 Noiriel, #63 Gebru |
| 1945 collectif (Croizat + Laroque + Parodi + Buisson) | #86 Valat ×2, #84 Hatzfeld ×2 |
| Marc Sangnier (christianisme social) | #126 Chabanier ×2 |
| Figure CGC 1944 (cadres) | #127 Hommeril |
| Figures rejetées de leur institution | #160 Karikó |
| Inscrire Vichy/Riom/Creusot dans bios | #37 Boucheron ×2, #39 Noiriel |
| Plus de violences de genre 1968+ | #123 Binet ×3, #129 Guilbert |
| Solidaires/SUD années 1990 | #128 Duteil ×2, #129 Guilbert ×2, #147 Béroud |
| Variantes culturelles cérémonie de signature | #108 Mead |
| Couleurs des camps configurables | #92 Tammet, #190 Frost |

### Cluster B. Ressources et formules (8)

| Ajout | Personas |
|---|---|
| Splitter Rapport de force interne / externe | #88 Omnès ×2, #150 Yon ×2 |
| 7e jauge cachée Honte/Fierté | #99 Ernaux ×2 |
| Gini sectoriel persistant en sidebar | #43 Piketty ×2, #94 Duflo |
| Renommer 6 ressources comme capitaux Bourdieu | #50 Bourdieu ×2 |
| Salaire vs salaire socialisé distincts | #87 Friot ×2 |
| Grilles de justification concurrentes Boltanski | #52 Boltanski ×2 |
| Indicateur Capabilités Sen | #95 Sen |
| Compteur changements d'avis au survol | #97 Kahneman ×2 |

### Cluster C. International et long terme (10)

| Ajout | Personas |
|---|---|
| Couche carte régions (Nord / IDF / Sud) | #161 Giblin ×2, #163 Lévy ×2, #71 Topalov |
| Mitbestimmung allemande (tour comparatif) | #157 Charpentier ×2, #133 O'Grady |
| CES, BusinessEurope, recours européens | #148 Pernot ×2, #170 Delmas-Marty |
| Comparatif Nordique vs Latin | #175 Lyon-Caen ×2, #49 Esping-Andersen ×2 |
| Modes régulation Boyer comme chapitres | #45 Boyer ×2, #48 Palier ×2 |
| Mondialisation 1990+ : OMC, délocalisations | #162 Grataloup ×2, #55 Sassen |
| Accumulation par dépossession 2010+ | #165 Harvey ×2 |
| Tour-pivot 2030+ IA + plateformes | #198 Harari ×2, #200 Webb ×2, #199 Kelly |
| Horizon 2050 (long now) | #202 Stewart Brand ×2 |
| Conversion écologique du travail | #54 Méda, #122 Léon ×2, #90 Thunberg |

### Cluster D. Conflit, droit, dilemmes (10)

| Ajout | Personas |
|---|---|
| Trilemmes sans option honorable (1940/1947/1995) | #22 Romero ×2, #104 Bateson ×2 |
| QPC + mini-jeu juridique | #169 Henriot, #173 Guérin-Bargues, #172 Levade |
| Préambule 1946 comme acte de jeu | #171 Rousseau ×2, #168 Badinter |
| Branches contre entreprise (inversion 2017) | #174 Lokiec ×2 |
| Rapport Supiot 1999 tour entier | #176 Supiot ×2 |
| Représentativité 2008 liée à 1995 | #146 Andolfatto ×2 |
| Spécificité contractualiste FO | #125 Souillot ×2 |
| Voie compromis revalorisée | #121 Berger ×2, #131 Chérèque |
| Coût Légitimité rupture 2016 majoré | #124 Martinez ×2 |
| Recours QPC sur lois sociales | #173 Guérin-Bargues, #177 Sureau |

### Cluster E. Pédagogie et onboarding (8)

| Ajout | Personas |
|---|---|
| 5 chapitres autonomes avec cliffhangers | #16 Sid Meier ×3, #85 Castel ×3 |
| Trois âges Castel comme structure de chapitres | #85 Castel ×3 |
| Tutoriel skip-ready, droit à l'erreur 5 tours | #119 Mitra ×2, #111 Meirieu ×2 |
| Glossaire forcé sur 5 termes au premier play | #115 Charlot ×2, #75 Descombes |
| Journal de jeu post-partie + cartes historiques | #114 Cifali, #20 McGonigal ×2 |
| Splitter cartouches XIXe en 2 cards mobile | #113 Tricot ×2, #19 Raynal ×2 |
| Mode express pour rejoueurs experts | #188 Hess |
| Corporel-kinesthésique étendu | #120 Gardner ×2 |

### Cluster F. Audio, visuel, méta-perception (6)

| Ajout | Personas |
|---|---|
| Bruit blanc d'époque en couche basse | #31 Murch ×2 |
| Silence 2 s avant choix lourd | #33 Yamaoka |
| Streaming audio par chapitre | #35 Eno |
| Thème original landing (vs Marseillaise) | #34 Derivière ×2, #35 Eno |
| Custom lettering PARITAS | #9 Hische |
| Objet visuel unique (table, sceau, signature) | #7 Sagmeister |

### Cluster G. Méta-jeu, données, IA (8)

| Ajout | Personas |
|---|---|
| Seed reproductible + export JSON anonyme | #65 Pineau, #94 Duflo |
| Replays randomisés (perturbation ε) | #156 Doudna, #27 Ghys |
| Mode auto-play / évolution dirigée | #194 Cheng, #158 Arnold |
| Fallback Mistral (UE) en plus de Haiku | #60 LeCun |
| Toggle « voir texte source » FALC | #64 Rudin |
| Audit biais FALC sur figures non-blanches | #63 Gebru, #98 Hinton |
| Sandbox + plan de reprise worker IA | #29 Limoncelli, #30 Frazelle |
| Logger reformulations IA | #61 Bengio, #62 Russell |

### Cluster H. Sciences sociales avancées (6)

| Ajout | Personas |
|---|---|
| Non-humains dans scénarios (formulaire URSSAF) | #51 Latour |
| Don/contre-don explicite | #81 Godelier |
| Cosmopolitique : ontologies du travail | #74 Stengers |
| 6 fondations morales Haidt jouables | #68 Haidt ×2 |
| Mood d'ères variés (1900 ≠ 1968 ≠ 2026) | #69 Barrett |
| Conventions de qualité (Niveaux) | #72 Orléan |

## À supprimer — ce qui sabote (9)

- **Gradient or sur PARITAS** — Vignelli (#8). « C'est un casino. »
- **Excès doré général** — Tammet (#92). Garder pour 2-3 accents max.
- **Anglicismes type "game over"** — Raynal (#19). → « la table se
  ferme », « la séance est levée ».
- **Letter-spacing 0.18em sous-titre** — Dehaene (#56). Descendre
  à 0.08-0.10.
- **Marseillaise comme musique d'ouverture par défaut** —
  Derivière (#34 ×2), Eno (#35). Garder pour les scénarios
  Révolution/Reconstruction. Retirer landing.
- **Formulation négative "pas un divertissement"** — McGonigal (#20).
  Reformuler en positif.
- **Tutoriel imposé** — Mitra (#119 ×2). Skip à proposer.
- **Densité cartouches XIXe single card mobile** — Tricot (#113 ×2),
  Raynal (#19 ×2). Splitter en 2 cards.
- **Filtre 2.4 kHz redondant musicFilter/distanceFilter** — Hannah
  Chen audit cycle 2. Descendre distanceFilter à 1.6 kHz.

## À améliorer — existe mais peut mieux (12)

| Amélioration | Personas |
|---|---|
| Voix TTS → ElevenLabs ou voix off | Bertrand audit, #142 Y. Gattaz |
| Cinzel diacritiques œ/ç (fallback Sabon/Le Monde Livre) | #186 Tatiana Mac, #10 Apeloig |
| Banque discours indexée par ère | Petrović audit, #69 Barrett |
| Crowd-protest 25 s → 90 s | Vasseur audit |
| Performance mobile 3G | #187 Friedman |
| Radar mobile portrait étroit | #5 Coutaz ×2 |
| Hint visuel iOS first-tap | audit cycle 2 |
| Wet mood mélancolique 0.26 → 0.20 | audit cycle 2 |
| High-shelf tendu -1.0 → -1.5 dB | audit cycle 2 |
| Branding Medef (logo, ton) | #179 Ritson ×2 |
| Pénétration mémorielle (vs adhésions seules) | #180 Sharp |
| Empathie expert : mode express | #188 Hess |

## Récap quadrants

| Quadrant | N | Effort | Priorité |
|---|---|---|---|
| À maintenir | 14 | 0 j (vigilance) | — |
| À développer | 68 | ~75 j-dev | mixte P0/P1/P2 |
| À supprimer | 9 | ~3 j-dev | **P0 immédiat** |
| À améliorer | 12 | ~15 j-dev | P1/P2 |

---

# 3. 8 axes d'évaluation — couverture du panel

Lecture transverse des 202 verdicts. Chaque persona se mappe à
1-3 axes ; somme dépasse 202 par recouvrement.

| Axe | N personas | % panel | Catégories dominantes |
|---|---|---|---|
| 1. Architecture, moteur, invariants | 24 | 12 % | Informaticiens, Mathématiciens, Sysadmin, Cybernéticiens |
| 2. Ressources, jauges, formules | 28 | 14 % | Économistes, Sociologues, Socio-éco, Paritarisme |
| 3. Représentation, figures, genre | 22 | 11 % | Historiens, Anthropologues, Syndicalistes, Neuroatypiques, Artistes |
| 4. International, long terme | 20 | 10 % | Géographes, Politistes, Avocats internationaux, Futurologues |
| 5. Pédagogie, onboarding | 28 | 14 % | UX, Game designers, Neuro-psy, Sciences éducation |
| 6. Conflit, dilemmes, droit | 35 | 17 % | Syndicalistes (×2), Politistes/syndical, Avocats |
| 7. Audio, UX polish | 30 | 15 % | Graphistes, Sound designers, Marketing, UX nouvelle gen, Artistes |
| 8. Méta-jeu, données, IA | 25 | 12 % | IA, Nobel, Biochimistes, Futurologues |

**Axe le plus peuplé** : conflit/dilemmes (35, 17 %). Logique : le
sujet *est* le conflit social.

**Axe le moins peuplé** : international (20). C'est aussi le trou
identifié — le panel le sait, le jeu l'ignore.

**5 convergences fortes** (≥ 8 personas distincts) :

| # | Convergence | N | Sévérité |
|---|---|---|---|
| C1 | Trilemmes sans option honorable + constitutionnalisme | 14 | **P0** |
| C2 | Galerie féminine + ambivalences + postcolonialité | 12 | **P0** |
| C3 | Ressources : capitaux, flux, Honte/Fierté, justifications | 17 | **P0** |
| C4 | International / EU / régional / long terme | 20 | **P1** |
| C5 | Méta-données, seed, auto-play, prospective | 11 | **P1** |

Les 7 scénarios V2 (section 5) couvrent ces 5 convergences.

---

# 4. 6 tensions structurantes développées

## Tension 1 — Compromis vs rupture

**Le débat**. Berger (#121) et Notat (#132) défendent la voie du
compromis — *« le jeu ne la valorise pas assez face à la rupture »*.
Martinez (#124) et Romero (#22) défendent la rupture — *« le coût
en Légitimité est sous-estimé en 2016 »*. Les deux ont raison
**simultanément** : le jeu paie trop la rupture *à court terme*
et ne paie pas assez le compromis *à long terme*.

**Implication V2**. Refondre la formule Légitimité × Mémoire en
fonction du **temps** : la rupture coûte plus à court terme
(pénalité Légitimité immédiate +50 % sur le tour de rupture), le
compromis paie en Mémoire à long terme (bonus Mémoire +30 % sur
les 3 tours suivants si compromis maintenu). C'est l'inverse de
la V1, qui paie la rupture comme dramatique (donc valorisée) et
le compromis comme tiède (donc dévalorisé).

## Tension 2 — Individuel vs distributif

**Le débat**. Bourdieu (#50), Piketty (#43), Boltanski (#52),
Ernaux (#99) convergent : les 6 ressources actuelles racontent
une **carrière individuelle** (Caisse → mon argent, Légitimité →
mon crédit). Ce qui manque est la **distribution sociale** que
le joueur produit ou abîme par ses choix : Gini sectoriel,
justifications plurielles, Honte collective.

**Implication V2**. Ajouter une **couche distributive** indépendante
des 6 jauges individuelles. Cette couche est invisible pendant la
partie, révélée à l'épilogue : *« ton personnage a fait carrière,
mais voici ce qu'il a laissé à la société »*. Couche : Gini +
taux de couverture sociale + taux d'adhésion syndicale + ratio
femmes/cadres. C'est l'écart entre **le récit individuel du
joueur** et **le bilan social produit par ses choix** — le
ressort tragique le plus puissant que le panel pointe.

## Tension 3 — National vs mondial / européen

**Le débat**. Pernot (#148), Charpentier (#157), Lyon-Caen (#175),
Esping-Andersen (#49), Thibault (#130), O'Grady (#133) demandent
**l'Europe** : Mitbestimmung allemande, comparaison Nordique-Latin,
CES, BIT/OIT. Sassen (#55), Grataloup (#162), Harvey (#165)
demandent **le monde** : OMC, délocalisations, plateformes,
accumulation par dépossession.

**Implication V2**. Pas de carte du monde (trop ambitieux), mais
un **dispositif de réflexivité comparée** : un personnage rencontré
qui parle un autre lexique syndical (allemand, anglo-saxon,
nordique), force le joueur à formuler ses choix dans cette autre
grammaire. Voir scénario V2-6 (« Mitbestimmung »).

## Tension 4 — Passé vs prospectif

**Le débat**. Le jeu actuel s'arrête à 2024-2026. Harari (#198 ×2),
Webb (#200 ×2), Brand (#202 ×2), Stiegler (#78), Méda (#54),
Mazzucato (#47), Thunberg (#90) demandent un **horizon prospectif**.
Castel (#85 ×3) propose la *désaffiliation* comme rupture déjà
visible en 2017+, qui se prolonge.

**Implication V2**. Un scénario explicitement **futur** (V2-7,
2030+, plateformes + IA), construit avec des **signaux faibles**
plutôt qu'avec une histoire connue. Mécaniquement : coefficients
ouverts, IA adversaires non déterministes, jauges nouvelles
(Plasticité institutionnelle, Acceptabilité IA). C'est le seul
scénario où le joueur ne joue pas *contre l'histoire connue*
mais *avec une histoire qui se fait*.

## Tension 5 — Contrôle vs émergence

**Le débat**. Knuth (#1), Berry (#4), Pineau (#65) cherchent la
**reproductibilité** (spec formelle, seed, replays). Ian Cheng
(#194), Frances Arnold (#158), Doudna (#156) cherchent
l'**émergence** (mode auto-play, perturbation ε, replays
randomisés). Morin (#110 ×3) trouve le verdict final *« trop
linéaire malgré la complexité »*.

**Implication V2**. Le mode debug doit comporter :
(a) un **seed** permettant la reproductibilité ;
(b) un **mode auto-play** qui fait défiler la partie sans le
joueur ;
(c) un **mode perturbation** qui rejoue la même partie avec ε
de bruit pour observer la stabilité.
Trois fonctions complémentaires, pas en concurrence.

## Tension 6 — Oral vs écrit

**Le débat**. Bertrand audit cycle 1 et Lasaux déplorent les voix
TTS système. Mais Lasaux ajoute : *« les étudiants sautent les TTS
pour aller plus vite, parce qu'ils ne sont pas sûrs que ces textes
soient dans le récap final »*. Le problème n'est pas la qualité
de la voix : c'est l'**économie attentionnelle** du joueur.

**Implication V2**. Au-delà de remplacer les TTS par ElevenLabs
(coûteux), ajouter un **archivage des discours marquants** dans
l'EndingReport, avec audio-replay et texte. Le joueur sait alors
que la voix vaut le détour — elle alimente le « peak-end ». C'est
une solution UX au problème audio, plus efficace qu'une amélioration
purement audio.

---

# 5. 7 scénarios V2 avec mini-jeux systémiques

Chaque scénario porte un **mini-jeu** qui matérialise sa mécanique
propre. Pas de mini-jeu hors-sol : chaque jeu sert un dilemme du
panel et engage des ressources du moteur principal. Les 7
scénarios suivent la chronologie. **V2-3 est le centre du système**
— c'est *La Table des Négociations*, dont la spec détaillée est
en section 6.

## Scénario V2-1 — « 1864, l'atelier qui se découvre coalition »

**Loi Ollivier — droit de coalition reconnu sous conditions**

**Mini-jeu : « Le Statut Juridique »**

Le joueur (chef d'atelier rouennais, commis bonapartiste, ouvrière
silkmaker lyonnaise — Lucie Baud) doit choisir sous quelle forme
déclarer la coalition. **Quatre formes** : mutualité de secours,
chambre syndicale, société de résistance, union confraternelle.

**Mécanique systémique** :
- Chaque forme = un *paquet* (coût administratif, plafond force
  interne, plafond force externe, niveau de surveillance préfet).
- Le joueur dépose 5 éléments dans le formulaire (objet social,
  cotisation, fréquence d'AG, périmètre géographique, critère
  d'adhésion). Chaque combinaison ouvre/ferme certaines formes.
- Issue : la coalition est déclarée légalement → bonus Légitimité
  durable, ou refusée → grève sauvage avec gros coût Caisse.

**Effort** : ~1,5 j.

## Scénario V2-2 — « 1940, la Charte du Travail sans sortie »

**Trilemme corporatiste sous Vichy — pas d'option honorable**

**Mini-jeu : « Le Piège »**

Trois choix : signer la corporation Vichy, refuser et entrer en
clandestinité, jouer la duplicité. **Aucun n'a d'issue propre.**

**Mécanique systémique** :
- Le mini-jeu est **différé** : la conséquence se déclenche au
  tour 1944 (épuration). Bateson (#104) double-bind explicite.
- À l'instant T (1940) : le joueur voit 3 options et leurs effets
  *immédiats*. Il ne voit pas les effets différés.
- Au tour 1944, le mini-jeu **rouvre la sauvegarde de 1940** et
  applique la dette : si signature → procès devant le comité
  d'épuration, perte Adhérents -40 + flag « collaborationniste »
  durable ; si clandestinité → bonus Mémoire +25 mais 30 % de
  Game Over avant 1944 si Caisse < seuil ; si duplicité →
  mini-jeu de défense (5 questions auxquelles le joueur doit
  répondre cohérent avec ses actes 40-44).

**Effort** : ~3 j.

## Scénario V2-3 — « 1945, quatre architectes pour la Sécurité sociale »

**Croizat + Laroque + Parodi + Buisson — la fondation collective**

**Mini-jeu : « La Table des Négociations »** (★ centre du système)

**Concept**. Le joueur incarne l'un des quatre architectes. Les
trois autres sont joués soit par d'autres humains (online ou
hot-seat), soit par des IA scriptées avec personnalités historiques
distinctes. La table négocie en 9 tours répartis sur 3 phases
(ouverture / concessions / vote). À l'issue : ordonnance
promulguée, ordonnance forcée, ou échec.

**Mécanique systémique** :
- Chaque architecte porte une **ligne rouge secrète** (ex.
  Croizat : couverture universelle non négociable ; Laroque :
  unification administrative ; Parodi : autonomie chrétienne ;
  Buisson : représentation ouvrière).
- Le compromis trouvé = un point dans le polytope des lignes
  rouges. Plus on s'éloigne d'une ligne rouge, plus l'acteur
  perd Mandat (et peut bloquer).
- Bluff possible (déclarer fausse ligne rouge).
- Coalitions privées (deux acteurs s'accordent sans dire aux
  autres).

**Spec détaillée → section 6.**

**Effort** : ~6 j (scénario) + **10,5 j (module Table)** = ~16,5 j
si développé d'abord, ~7 j ensuite (Table réutilisable sur 4
autres scénarios : 1936, 1947, 2013, 2017).

## Scénario V2-4 — « 1995, la fracture CFDT »

**Plan Juppé, scission Notat-Chérèque — Compulsif duel**

**Mini-jeu : « Voix Intérieures en Duel »**

Le joueur est Notat ou Chérèque. **Le mode Compulsif est imposé**
(Kojima #17 ×2). Mais ici, le mode Compulsif est **doublé** : deux
voix intérieures s'affrontent en temps réel (réformiste vs base),
au lieu d'une seule voix résonnante.

**Mécanique systémique** :
- Pendant que le joueur lit le scénario et hésite, deux *streams*
  textuels apparaissent côte à côte (gauche : « tu dois soutenir
  Juppé, le réformisme c'est aussi de tenir » ; droite : « tu vas
  perdre 30 ans de patient travail à la base »).
- Le joueur peut **augmenter le volume** de l'une des deux voix
  (au sens propre : plus de phrases s'affichent côté privilégié)
  pour s'aligner. Mais cela **pré-engage** son choix avant le
  vote — le moteur enregistre la pression.
- Si le joueur écoute longuement la voix qu'il finit par ne *pas*
  suivre, sa Légitimité chute davantage (contradiction interne
  enregistrée).
- Conséquence post-partie : **affichage du lien 1995 → 2008**
  (Andolfatto #146 ×2 — la représentativité 2008 est conséquence
  directe de cette scission).

**Effort** : ~3 j.

## Scénario V2-5 — « 2017, le constitutionnalisme du dialogue social »

**Ordonnances Macron + barèmes Prud'hommes — QPC en mini-jeu**

**Mini-jeu : « La Hiérarchie des Arguments »**

Le joueur peut déposer une QPC. Mini-jeu : 5 cartes-arguments à
hiérarchiser en pile (préambule 1946, conventions OIT, libertés
publiques, ordre constitutionnel, jurisprudence européenne).

**Mécanique systémique** :
- L'ordre choisi détermine la probabilité de **recevabilité** par
  le Conseil d'État, puis la probabilité de **succès** par le
  Conseil constitutionnel.
- Si succès → jurisprudence durable (effet sur tous les tours
  2017+).
- Si échec → Légitimité juridique chute, mais débloque une voie
  alternative : **recours européen CES** (long, mais avec +30 %
  de chances en 2019).
- Mini-jeu **rejouable** en mode debug pour tester la stabilité
  des arguments.

**Effort** : ~4 j.

## Scénario V2-6 — « Mitbestimmung — un détour comparatif »

**Comparer France-Allemagne sur la cogestion**

**Mini-jeu : « Le Congrès BIT »**

Tour transversal (déclenchable post-1990). Au congrès BIT/CES, le
joueur croise un·e syndicaliste allemand·e (Bot IA scripté). Le
mini-jeu : **expliquer** son système au visiteur en utilisant les
concepts de l'autre.

**Mécanique systémique** :
- 5 concepts allemands à mapper sur des choix passés du joueur :
  Mitbestimmung, Tarifautonomie, Betriebsrat, Sozialpartnerschaft,
  Konzertierte Aktion.
- Pour chaque concept, le joueur sélectionne un de ses choix
  passés et explique en quoi il est *traduisible* ou *intraduisible*
  dans la grammaire allemande.
- Sortie : un texte de **diagnostic comparatif** généré par IA
  (Mistral) qui replace la trajectoire dans la typologie
  Esping-Andersen. Reste durable dans le journal de jeu.

**Effort** : ~2 j.

## Scénario V2-7 — « 2030+, plateformes et IA — le paritarisme cassé »

**Premier scénario prospectif jouable**

**Mini-jeu : « Signaux Faibles »**

Pas d'événement historique connu. Le joueur reçoit au tour 1 cinq
**cartes prospectives** (signaux faibles) et doit choisir
lesquelles **amplifier** (action) et lesquelles **étouffer**
(non-action) sur 12 tours. Trois IA adversaires (plateforme
américaine, IA chinoise, État stratège français) répondent en
fonction de ce que le joueur amplifie.

**Mécanique systémique** :
- 5 signaux faibles initiaux : *« 18 % des emplois cadres
  remplacés par IA d'ici 2032 »*, *« plateformes échappent aux
  conventions collectives »*, *« télétravail dissout la branche »*,
  *« Mistral devient l'IA d'État »*, *« Sécu sociale en
  faillite démographique »*. Le joueur **doit en choisir 2 à
  amplifier** au tour 1, sans pouvoir revenir.
- Stiegler (#78) : la technique évolue en cours de partie. Les
  **outils** du joueur (CSE, branches, conventions) deviennent
  obsolètes ou se reconfigurent à des moments aléatoires.
- 3 jauges nouvelles : Plasticité institutionnelle, Vitesse de
  reconfiguration, Acceptabilité IA. Honte/Fierté redéfinie en
  « Dignité du travail à l'ère IA ».
- Issue rare (≈ 5 %) : **refondation** d'un nouveau paritarisme
  intégrant plateformes + collectifs IA. Débloque l'ending V3.

**Effort** : ~8 j.

## Récap mini-jeux

| # | Scénario | Mini-jeu | Mode | Effort |
|---|---|---|---|---|
| V2-1 | 1864 Loi Ollivier | Statut Juridique | solo | 1,5 j |
| V2-2 | 1940 Charte | Le Piège (différé) | solo | 3 j |
| V2-3 | 1945 Sécu | **★ La Table des Négociations** | online/hotseat/IA | 6 j scénario + 10,5 j mini-jeu |
| V2-4 | 1995 Plan Juppé | Voix Intérieures | solo | 3 j |
| V2-5 | 2017 QPC | Hiérarchie Arguments | solo | 4 j |
| V2-6 | Mitbestimmung | Congrès BIT | solo + IA | 2 j |
| V2-7 | 2030+ IA | Signaux Faibles | solo + 3 IA | 8 j |
| | **TOTAL** | | | **~38 j-dev** |

(L'écart vs roadmap globale est explicable : la roadmap budgète
tâches, ici on budgète scénarios + mini-jeux. La Table seule pèse
10,5 j et est **réutilisable** sur 4 autres scénarios.)

---

# 6. Spec détaillée — La Table des Négociations

Le mini-jeu central de V2-3 (1945 Sécu) est aussi **le squelette
réutilisable** pour 4 autres scénarios : Matignon 1936, Matignon
1947 (cogestion), ANI 2013, ordonnances 2017. C'est donc un
**module** plus qu'un mini-jeu unique.

## Concept

Une table virtuelle. **2 à 4 acteurs** négocient un accord sous
contrainte de temps. Chaque acteur a :
- Une **identité** (CGT 1945, CFDT 2013, Medef 2017, État, etc.).
- Des **ressources** d'entrée (Mandat, Caisse, Légitimité).
- Une **ligne rouge secrète** (red line non négociable).
- Un **agenda public** (revendications affichées).

L'accord est négocié en 9 tours répartis sur 3 phases. Issue :
accord signé (chaque acteur gagne/perd selon respect de sa ligne
rouge), accord forcé minoritaire (pénalité Légitimité massive
pour l'imposeur), ou impasse (tous perdent).

## Boucle de jeu (durée totale ~25 min)

### Phase A — Ouverture (3 tours × 90 s)

Chaque acteur, à son tour :
1. Présente sa **position publique** (3-5 revendications).
2. Dépose ses **revendications prioritaires** (max 3) sur la table.
3. (Optionnel) **Bluff sur ligne rouge** : déclare une fausse
   ligne rouge pour intimider. Si découvert plus tard → pénalité
   Légitimité massive ; si jamais découvert → bonus Légitimité.

### Phase B — Concessions (5 tours × 120 s)

Chaque tour, chaque acteur peut :
- **Offrir une concession** (retirer une revendication, accepter
  une revendication adverse) → coût Mandat selon distance à ligne
  rouge.
- **Demander une concession** → l'autre peut accepter, refuser,
  contre-proposer.
- **Former une coalition privée** : deux acteurs s'entendent en
  privé (chat secret, 30 s) sur un sub-deal qui modifie leurs
  positions publiques au tour suivant. Les deux autres acteurs
  voient les positions changer mais pas la coalition.
- **Activer un veto** (réservé à État) : annule une concession
  proposée, coût Caisse fixe.
- **Passer son tour** (rare, mais utile pour gagner du Mandat).

### Phase C — Vote final (1 tour × 60 s)

Le **texte courant** de l'accord est affiché en intégralité.
Chaque acteur vote :
- **Oui** (signe).
- **Non** (refuse).
- **Abstention** (laisse passer, ne signe pas).

Conditions de validation :
- **Unanimité requise** (1945, 1947) : 4/4 oui.
- **Majorité qualifiée** (ANI 2013) : 3/4 oui.
- **Majorité simple** (ordonnances 2017) : 2/4 oui (avec État
  obligatoire).

## Conditions de victoire / défaite

### Si accord signé
- Toutes lignes rouges respectées : +50 Mandat, +30 Légitimité.
- Une ligne rouge violée : −40 Mandat, −20 Légitimité.
- Bluff réussi (jamais découvert) : +30 Légitimité bonus.
- Bluff découvert : −60 Légitimité pénalité.

### Si pas d'accord
Tous : −20 Mandat, −10 Légitimité, +10 Mémoire.

### Si accord forcé minoritaire
L'imposeur : −80 Légitimité, +30 Caisse, flag « unilatéral »
durable sur 5 tours.

## Modes de jeu

### Mode 1 — En ligne

**Tech** : WebSocket via Cloudflare Durable Objects (un DO par
session). Latence cible <200 ms. État authoritative côté serveur.

**Matchmaking** :
- File d'attente par scénario.
- Filtrage ELO optionnel.
- 30 s de grace pour reconnexion.
- Si drop définitif → bot IA prend le relais.

**Privacy** :
- Handle généré côté serveur.
- Pas de chat libre — 40 phrases pré-faites par phase.
- Mute possible côté client.
- Replay anonymisé R2.

### Mode 2 — Hot-seat

**Tech** : pure client-side (IndexedDB).

**UX** :
- 2-4 joueurs sur même appareil.
- Overlay « Passez l'appareil à [acteur] » + PIN à 4 chiffres
  saisi à l'init de la session.
- Écran flouté tant que PIN non saisi (lignes rouges privées
  protégées).
- Pas de chrono entre tours, chrono uniquement pendant le tour
  actif.

**Cas d'usage** : 2 amis à voix haute, 4 joueurs en classe,
formation syndicale (Wendling #201 « kit prospective »).

### Mode 3 — Contre IA

**Chaîne LLM** :
1. **Mistral Large** (LeCun #60) — défaut, EU.
2. **Haiku** — fallback si Mistral down.
3. **Templates déterministes** — fallback ultime, 30 templates
   par phase et par persona.

**Personnalités V2-3** :
- **Croizat-bot** : ligne rouge = couverture universelle ; ferme
  + chaleur ; bluff modéré.
- **Laroque-bot** : ligne rouge = unification administrative ;
  technique + rigueur ; pas de bluff.
- **Parodi-bot** : ligne rouge = autonomie chrétienne ; conciliant
  + résistant ; bluff rare mais profond.
- **Buisson-bot** : ligne rouge = représentation ouvrière ;
  solidaire avec Croizat sur unanimité.

**Difficulté** :
- *Easy* : prévisibles, pas de bluff.
- *Normal* : bluff occasionnel.
- *Hard* : bluff stratégique, mémoire des 5 parties précédentes.

### Mode 4 — Solo storytelling (fallback ultime)

Si tout échoue : 3 bots templates déterministes. Pas de surprise,
pas de bluff. Garantie de jouabilité universelle.

## Stratégie de fallback

```
Tentative 1 : ONLINE
  ├── ✓ Connecté → match-making → partie
  └── ✗ Échec (offline, server down, timeout 10 s)
        ↓
Tentative 2 : IA Mistral
  ├── ✓ Mistral up → 3 bots IA
  └── ✗ Échec
        ↓
Tentative 3 : IA Haiku
  ├── ✓ Haiku up → 3 bots IA (qualité moindre)
  └── ✗ Échec
        ↓
Tentative 4 : Templates déterministes
  └── ✓ Toujours disponible
```

Le joueur peut **toujours** jouer en hot-seat à n'importe quelle
étape (bouton « Jouer en local »).

## Architecture technique

```
src/components/negotiation/
  ├── NegotiationTable.svelte
  ├── ActorPanel.svelte
  ├── DraftAccord.svelte
  ├── ConcessionDialog.svelte
  ├── PrivateChat.svelte
  ├── VotingBooth.svelte
  ├── HotSeatHandover.svelte
  └── TableTimer.svelte

src/game/negotiation/
  ├── types.ts
  ├── engine.ts
  ├── personas/{croizat,laroque,parodi,buisson}.ts
  └── fallback-templates.ts

src/lib/negotiation/
  ├── online.ts
  ├── matchmaking.ts
  └── llm.ts

worker/src/negotiation/
  ├── index.ts
  ├── DurableTable.ts
  ├── matchmaking.ts
  └── replay-storage.ts
```

## Données échangées

```ts
interface NegotiationState {
  scenario: ScenarioId;
  phase: 'opening' | 'concessions' | 'vote' | 'closed';
  turn: number;                    // 1-9
  speaker: ActorId;
  actors: Actor[];
  publicAgenda: AgendaItem[];
  privateMandates: Map<ActorId, RedLine[]>;  // owner only
  draft: AccordDraft;
  pendingConcessions: Concession[];
  privateCoalitions: Coalition[];
  votes: Map<ActorId, Vote>;
  timer: { remaining: number; serverTime: number };
}

interface Actor {
  id: ActorId;
  identity: { name: string; org: string; year: number };
  resources: { mandat: number; caisse: number; legitimite: number };
  redLine: RedLine;
  isBot: boolean;
  isHuman: boolean;
  status: 'connected' | 'disconnected' | 'replaced-by-bot';
}

interface RedLine {
  topic: string;
  threshold: number;               // 0-100, distance maxi tolérée
  declared: boolean;               // bluff possible si false
}
```

## Sécurité

- **État authoritative** côté Durable Object.
- **Anti-tampering** : actions client validées côté serveur.
- **Rate-limit** : 3 actions/sec, 1 modal/tour.
- **Anti-griefing** : bot prend le relais après 30 s de silence.
- **Données privées** : ligne rouge encryptée, jamais persistée
  en R2 sans anonymisation.

## Accessibilité (WCAG 2.2 AA)

- **Sous-titres permanents** sur répliques bot.
- **TTS optionnel**.
- **Daltonisme** : couleurs + patterns + nom toujours visible.
- **Contrast AAA** sur le draft.
- **Navigation clavier** uniquement (Soueidan, Berners-Lee).
- **Mode lent** : chronos doublés (90 s → 180 s, 120 s → 240 s).
- **`aria-live="polite"`** sur draft, `aria-label` sur actions.
- **Compulsif** étiqueté pour NVDA/JAWS.

## Effort tech

| Bloc | Effort |
|---|---|
| Engine + types | 1,5 j |
| UI Svelte | 2 j |
| Mode online (WS + DO) | 2,5 j |
| Mode hot-seat | 1 j |
| Mode IA (Mistral + Haiku + 4 personas) | 2 j |
| Templates fallback | 0,5 j |
| Accessibilité WCAG AA | 0,5 j |
| Replay + R2 anonyme | 0,5 j |
| **Total module** | **~10,5 j** |
| Contenu V2-3 (4 figures) | + 3 j |
| Réutilisation 1936/1947/2013/2017 | + 2 j × 4 |
| **Grand total bloc complet** | **~21,5 j** |

---

# 7. Développement détaillé des 7 mini-jeux — jouissif et beau

Les 7 mini-jeux doivent atteindre un niveau de finition qui les
rend **physiquement plaisants** à jouer (game feel, juice) et
**visuellement justes** (authenticité d'époque). Pas de mini-jeu
décoratif, pas de mini-jeu hors-sol. Chacun s'incarne dans son
moment historique par sa typographie, ses couleurs, ses sons, ses
gestes — et chacun produit des **moments de joie** identifiables :
le sceau de cire qui tombe, la cloche du Conseil constitutionnel,
le silence avant le vote unanime.

Pour chaque mini-jeu : pitch émotionnel, esthétique d'époque,
game feel, audio design, moments de jouissance, anti-patterns à
éviter.

---

## 7.1 — V2-1 « Le Statut Juridique » (1864)

> *Pitch émotionnel.* Tu es dans un atelier rouennais, novembre 1864.
> Tu remplis le premier formulaire qui rendra ton groupe légal, après
> 73 ans d'illégalité depuis Le Chapelier. Tes mains tremblent. Chaque
> case que tu coches détermine la prochaine vie de tes camarades.

### Esthétique d'époque

- **Référence visuelle** : papier officiel ministériel Second Empire.
  Cachet impérial à l'aigle en filigrane discret. Marges réglementaires.
- **Typographie** : *Romain du Roi* pour le corps du formulaire,
  *Didot* italique pour les en-têtes et libellés. Encre noire profonde
  qui « sèche » avec un bref blur.
- **Palette** : papier vélin crème (#F4EDD8), encre noire (#1A1411),
  sceau de cire rouge sang (#7A1E1B), filigrane impérial bleu très
  pâle (#C4D4E8 5 % alpha).
- **Cadrage** : grand format A3 simulé occupant 70 % de l'écran,
  scrolle léger sur mobile.

### Game feel — micro-interactions

- **Plume Sergent-Major** qui écrit lettre par lettre dans chaque
  case (réf. Pentiment). Vitesse 40 cps, jitter ±5 % pour casser
  la régularité.
- **Encre qui sèche** : 800 ms de blur léger, puis netteté définitive.
- **Vignettes des 4 formes juridiques** à droite (mutualité, chambre,
  société de résistance, union confraternelle) : **éteintes en sépia**
  par défaut, **illuminées en couleur saturée** dès que la combinaison
  les rend possibles. Animation crossfade 600 ms.
- **Le préfet** (silhouette en frock-coat, gravure XIXe) apparaît en
  haut à droite quand 3 cases sont remplies. À 5/5, il signe en
  hochant la tête lentement (ou raye la feuille d'un trait rouge
  énergique si forme illégale).
- **Sceau de cire rouge** : **compression visuelle** (scale 1.2 → 1
  en 200 ms easing-out) + son thump 60 Hz. La cire « bave » avec
  micro-particules de cire.

### Audio design

- **Plume sur papier** : loop 5 s, 4 variations aléatoires.
- **Tampon sec** quand on coche une case (click 4 kHz court).
- **Cire qui tombe** : thump 60 Hz + crackle 4 kHz, attaque rapide.
- **Préfet qui s'éclaircit la gorge** : cue 1 s avant son arrivée,
  prépare la tension.
- **Musique** : *quatuor à cordes* en mineur, années 1860 (Saint-Saëns
  Op. 41 ou similaire CC0 IMSLP), volume très bas en bg.

### Moments de jouissance

1. **L'instant où tu coches « cotisation hebdomadaire 0,50 F » et la
   vignette « société de résistance » s'illumine** — tu comprends que
   tu joues hors du cadre légal. Frisson.
2. **Le sceau de cire rouge qui tombe sur la feuille avec ce thump** —
   la coalition est ENFIN reconnue, après 73 ans d'illégalité.
3. **Le préfet qui hoche la tête** — silence puis musique qui monte
   d'un demi-ton.
4. **Si refus** : la feuille est barrée d'un trait rouge brutal +
   son de plume qui craque. Cinglant mais beau dans son refus même.

### Anti-patterns à éviter

- ❌ Pas d'icônes modernes (pas de checkbox 2024, pas de bouton arrondi).
- ❌ Pas de vibrations colorées flashy.
- ❌ Pas d'anglicismes type « validate » → « consigner », « apposer ».
- ❌ Pas de tutoriel inline qui casse l'immersion — le formulaire
  s'auto-explique par sa forme.

### Effort design (en plus du dev)

- Asset sceau de cire (1 SVG animé) — 0,5 j illustratrice/teur.
- Asset préfet en gravure XIXe (1 silhouette) — 0,3 j.
- Sonore : enregistrement plume sur vélin réel — 0,2 j Foley
  (ou Pixabay CC0 si pige indispo).

---

## 7.2 — V2-2 « Le Piège » (1940 → 1944)

> *Pitch émotionnel.* Tu signes en 1940 sans savoir que tu signes.
> Tu paies en 1944 sans savoir que tu paies. Le mini-jeu s'étend
> sur 4 ans. Aucune fin n'est honorable. Le double-bind Bateson
> incarné par un tiroir qui se ferme.

### Esthétique d'époque

**Phase 1 — 1940 (intérieur Vichy, ocres et sourds)** :
- Bureau lambrissé sombre, lampe banker's vert wagon (Émeralde-Vichy).
- Cadre francisque bronze sur le mur (filigrane discret en arrière).
- Lettre de Belin sur ton bureau, papier épais, encre violette.
- **Palette** : ocre brûlé (#7A5C3A), vert sombre (#2E4030), bronze
  patiné (#8C6E40), papier jauni (#E8DCC0).
- **Typographie** : *Didone* étroit, encre violette administrative.

**Phase 2 — 1944 (austérité résistance, lumière froide)** :
- Salle d'épuration. Drapeau tricolore élimé. Table de bois brut.
- 5 silhouettes de juges en backlight, vestes croisées, à contre-jour.
- Tableau noir avec craie (« Comité Local d'Épuration »).
- **Palette** : noir charbon (#0F0F0F), tricolore terne, lumière
  fluorescente blafarde (#E8E8E0).
- **Typographie** : *Bodoni* (officielle 1944) pour le verdict.

### Game feel — phase 1 (1940)

- **Boutons SIGNER / REFUSER / TEMPORISER** : chacun a son **poids
  visuel** propre.
  - SIGNER : descend lourdement quand on l'effleure (gravity
    simulée), comme si l'encre attirait la plume.
  - REFUSER : tremble légèrement (1 Hz, ±1 px) — la peur visible.
  - TEMPORISER : vibre à 4 Hz, comme une indécision.
- **Au clic** : la lettre se plie automatiquement en trois (3 plis
  séquentiels, 400 ms chacun), glisse dans un **tiroir métallique
  qui se ferme** avec un *click* lourd.
- **Fade au noir** total. Carton plein écran : « **4 ANS PLUS TARD** »
  en *Bodoni* gras 80 px. Tenu 2 s sans bruit.

### Game feel — phase 2 (1944)

- Le **tiroir s'ouvre** lentement (3 s, easing in-out), grincement.
- La lettre de 1940 **ressort jaunie**, pliée, tachée. Elle se
  déplie sur la table en 3 plis inverses (slow-motion 1,5 s).
- **5 questions** apparaissent une par une, chacune avec 3 options
  de réponse. Chaque réponse modifie la **position des silhouettes**
  des juges : ils se redressent (favorable), restent neutres, ou
  se penchent en avant (défavorable).
- **Verdict** : un juge prend la parole (TTS grave, voix d'homme âgé).
  Texte tape ligne par ligne (machine à écrire).

### Audio design

**Phase 1** :
- **Tic-tac d'horloge comtoise** (loop 4 s, lent 60 BPM).
- **Radio Vichy lointaine** très bas (musette ou discours filtré
  passe-bas 800 Hz).
- **Tiroir qui se ferme** : *click* métallique + grincement faible
  (300 ms).
- **Carton 4 ANS PLUS TARD** : silence absolu 2 s, puis sirène
  distante très brève (200 ms).

**Phase 2** :
- **Lumière fluo qui bourdonne** (50 Hz très bas).
- **Papier qui se déplie** : froissement doux 1,5 s.
- **Voix d'huissier** (TTS Mistral, voix française grave).
- **Marteau de juge** sur le verdict : *thump* résonnant 2 s.

### Moments de jouissance — version sombre

1. **Le tiroir qui se ferme**, sans pouvoir le rouvrir — la finalité
   du choix de 1940. Aucun bouton « annuler ».
2. **Le moment où la lettre de 1940 ressort 4 ans après**, jaunie.
   Tu la reconnais. Tu sais ce que tu as signé.
3. **La voix d'un juge qui dit « Vous mentez »** — silence absolu,
   coup de marteau. Chair de poule.
4. **Si tu as refusé en 1940 et survécu** : le juge dit *« La République
   vous remercie »* — court, presque sec. Tu sors de la salle
   avec +25 Mémoire durables. Pas de fanfare. Juste une dignité
   silencieuse.

### Anti-patterns à éviter

- ❌ Pas de feedback de victoire en 1940 (« vous avez bien joué »).
  C'est précisément le **piège** : on ne sait pas ce qu'on a fait.
- ❌ Pas de réponse facile en 1944 (pas de « la vraie réponse était »).
- ❌ Pas de score final type « 8/10 ». Juste un texte de verdict.
- ❌ Pas de musique pendant la phase 2 — le silence porte la scène.

### Effort design

- Asset bureau Vichy 1940 (illustration de fond) — 1 j.
- Asset salle 1944 (silhouettes 5 juges) — 0,8 j.
- Sonore : tiroir métallique + cire + horloge — 0,3 j Foley.

---

## 7.3 — V2-3 « La Table des Négociations » (1945)

> *Pitch émotionnel.* Quatre hommes autour d'une table en chêne,
> novembre 1945. Cendres au cendrier, fumée de pipe, lampe à abat-jour
> jaune chaud. Ils inventent la Sécurité sociale en six semaines.
> Toi, tu es l'un d'eux. Tu n'as ni gagné ni perdu : tu as participé.

(Spec technique complète en section 6 ; ici, la couche sensorielle.)

### Esthétique d'époque

- **Référence visuelle** : photos d'archive de la commission Croizat
  (4 octobre 1945). Pièce lambrissée, cheminée, fauteuils club.
- **Table en chêne sombre** vue en perspective légère (CSS 3D ou
  Three.js minimal — pas de 3D lourde). Veinures du bois visibles.
- **Lampes ampoule jaune chaud** (température ~2700 K), halos doux
  autour de chaque acteur.
- **Cendrier au centre** (s'illumine quand un acteur fume — flavor
  only, désactivable Settings).
- **Palette** : chêne sombre (#3D2A1A), papier tapé crème (#F4EFE2),
  jaune lampe (#F4D78C), accents tricolores discrets sur les dossiers.
- **Typographie** : *Garamond* corps, *machine à écrire* (Courier
  Prime) pour les drafts d'articles.

### Game feel — micro-interactions

- **Halo d'attention** : quand un acteur parle, son côté de la table
  s'illumine doucement (radial gradient jaune chaud, fade 600 ms).
- **Concession offerte** : un papier glisse de l'acteur émetteur vers
  le destinataire avec **inertie + bounce léger** (300 ms physics).
- **Draft modifié** : les articles changés clignotent 2 fois en jaune
  pâle (#FFF4C8) puis se posent en encre noire définitive.
- **Cendrier** : fumée animée (3 SVG paths, dérive 8 s loop).
- **Ligne rouge** (privée) : son dossier reste **fermé** vu des autres ;
  ouvert vu de toi, avec sa ligne rouge surlignée en sang.
- **Vote final** : les 4 cachets de cire descendent en cascade
  (séquentiels, 400 ms chacun, en spiral easing). Si unanimité : le
  4ᵉ cachet déclenche un **flash blanc bref** + résonance grave.

### Audio design

- **Murmures de fond** (loop 4 s, varié, 4 voix masculines basses
  inintelligibles).
- **Plume sur papier** quand on rédige.
- **Cendrier** : pas de smoking sounds, juste un cliquetis discret
  quand on tape la pipe.
- **Concession offerte** : papier qui glisse 800 ms.
- **Vote** : 4 thumps de cire en cascade, écart 400 ms.
- **Musique** : *aucune* pendant les phases A et B (la table parle).
  Sur l'unanimité finale : *La Marseillaise version Garde Républicaine
  1944* émerge à très bas volume puis monte sur 8 s.

### Moments de jouissance

1. **Le bluff réussi** — tu as déclaré une fausse ligne rouge,
   l'autre acteur recule, tu gagnes 30 Légitimité bonus, et tu as
   l'âme du diable parisien d'octobre 1945.
2. **La coalition privée** qui modifie 2 articles d'un coup au tour
   suivant — magie. Les deux autres acteurs voient le draft bouger
   sans comprendre pourquoi.
3. **Le vote final unanime**, les 4 cachets qui tombent ensemble en
   cascade — le moment historique. Tu as construit la Sécu.
4. **La voix de Croizat-bot** : *« Nous y sommes, camarades »* —
   prononcé une seule fois, à la fin, si l'ordonnance passe. Frisson
   garanti.

### Anti-patterns à éviter

- ❌ Pas de chat libre (toxic IRL en match online — 40 phrases pré-faites
  exclusivement).
- ❌ Pas de score visible en temps réel (le score se dévoile à la fin).
- ❌ Pas de minuteur agressif (chronos doux, pas de countdown rouge
  qui flashe).
- ❌ Pas de musique anachronique — *jamais* de Marseillaise pendant
  les négociations, seulement à l'unanimité finale.

### Effort design (en plus de la spec section 6)

- Asset table en chêne 3D minimal — 1 j.
- Asset cendrier + fumée animée SVG — 0,3 j.
- Asset 4 dossiers/cachets/lampes — 0,5 j.
- Sonore : murmures, plume, papier, cire — 0,5 j Foley.
- Pige musique : remix sobre Marseillaise GR 1944 (CC0 base) — 0,3 j.

---

## 7.4 — V2-4 « Voix Intérieures en Duel » (1995)

> *Pitch émotionnel.* Tu es Notat ou Chérèque, novembre 1995. Deux
> voix se disputent dans ta tête. L'une dit : tiens. L'autre dit :
> romps. Tu peux les écouter, l'une plus fort que l'autre. Mais ce
> que tu écoutes te change.

### Esthétique d'époque

- **Référence visuelle** : photos N&B Magnum du mouvement de
  novembre-décembre 1995. Manifestations Gare du Nord, fax SNCF,
  affiches tirées au noir.
- **Vue divisée verticalement** :
  - **Gauche (réformiste, Notat)** : palette **dorée chaude**, halo
    doux. Citations de Notat, Rocard.
  - **Droite (base, Chérèque/Chérèque)** : palette **gris bleuté froid**,
    contraste sec. Citations de la base CGT-CFDT 1995.
- **Centre** : palette neutre, scénario en *Le Monde* serif standard.
- **Élément d'époque** : un fax visible en bas d'écran qui crachote
  des dépêches AFP en arrière-plan (visuel uniquement, lisible mais
  non interactif).
- **Typographie** :
  - Gauche : *Garamond* élégant.
  - Droite : *Bell Centennial* épais, plus dur.
  - Centre : *Le Monde Livre*.

### Game feel — micro-interactions

- **Cliquer une voix** (« écouter plus fort ») :
  - Légère vibration CSS (transform 2 px shake 80 ms).
  - **Son de respiration plus rapprochée** côté écouté.
  - **Texte qui grossit** (font-size +20 % sur 400 ms easing).
  - **Fond qui pulse** très léger (1 Hz, ±5 % opacity).
- **Voix dominante** : si tu cliques 3+ fois côté gauche, la voix
  droite **s'estompe** (opacity 0.5, italique, plus distante).
- **Pré-engagement** : un petit **indicateur secret** en bas du choix,
  invisible pour le joueur, qui marque la voix dominante. Le moteur
  retient.
- **Au moment du vote** : silence absolu 1 s (couper les deux voix),
  puis les 3 options apparaissent au centre. Si tu votes contre la
  voix dominante : un **flash rouge subtil** sur ta ressource
  Légitimité (la contradiction est enregistrée).

### Audio design

- **Voix gauche (réformiste)** : ténor doux, *Bach Cantata BWV 147*
  en fond très bas (Jésus que ma joie demeure).
- **Voix droite (base)** : ouvrière qui chante *L'Internationale*
  très bas en boucle, légèrement filtrée passe-bande.
- **Quand tu cliques pour augmenter une voix** : crossfade instantané
  vers cette voix (200 ms equal-power, comme l'audit cycle 2 cycle 1).
- **Fax qui crachote** en bg (loop 12 s, très bas).
- **Au vote** : silence puis ding métallique discret.

### Moments de jouissance

1. **L'instant où les deux voix sont à 50/50**, parfaitement
   équilibrées — c'est insupportable. Tu DOIS cliquer.
2. **Le moment où tu réalises que tu écoutes la voix que tu vas
   pas suivre** — tu te trompes toi-même. Vertige.
3. **Le silence absolu d'1 s** au moment du vote — la rupture
   audio matérialise la rupture historique.
4. **L'écran post-partie qui révèle ta « contradiction interne
   enregistrée »** : *« Tu as écouté Notat 73 % du temps mais voté
   Chérèque. Ta CFDT 1995 n'a tenu qu'à un fil. »*

### Anti-patterns à éviter

- ❌ Pas de mini-bouton « égaliser les voix » — le déséquilibre
  est l'objet du jeu.
- ❌ Pas de réponse « bonne ». Les deux voix sont historiquement
  fondées.
- ❌ Pas de musique tonitruante — tout est en dessous de -18 dB LUFS,
  pour que la voix intérieure prime.

### Effort design

- Asset diviseur central + fax animé SVG — 0,4 j.
- Asset photos N&B Magnum 1995 stylisées (3-4 fonds) — 0,5 j.
- Sonore : 2 voix, fax, Internationale ouvrière, Bach BWV 147 — 0,5 j.

---

## 7.5 — V2-5 « La Hiérarchie des Arguments » (2017)

> *Pitch émotionnel.* Tu déposes une QPC contre les ordonnances Macron.
> Devant le Conseil constitutionnel, tu n'as que 5 cartes à hiérarchiser.
> L'ordre que tu choisis détermine si la jurisprudence change.

### Esthétique d'époque

- **Référence visuelle** : intérieur du Conseil constitutionnel
  (rue de Montpensier, Palais-Royal). Marbre. Tapisseries des
  Gobelins.
- **Marbre veiné gris** comme fond principal (#D8D2CC + veinures
  noires fines).
- **Sceau du Conseil** en filigrane discret (cercle avec balance).
- **5 cartes-arguments** :
  - **Préambule 1946** : carte tricolore (rouge/blanc/bleu en
    bandeau).
  - **Conventions OIT** : carte bleu ONU avec étoiles.
  - **Libertés publiques** : carte couleur drapeau libertés (gris
    pierre + accent rouge, type pavé bicolore).
  - **Ordre constitutionnel** : carte olive austère, sceau en relief.
  - **Jurisprudence européenne** : carte étoile EU bleu nuit + or.
- **Typographie** : *Le Monde Livre* + sceaux SVG officiels.
- **Format** des cartes : 90 mm × 50 mm, recto avec icône, verso
  avec citation.

### Game feel — micro-interactions

- **5 cartes dispersées au sol** (en désordre simulé, légère rotation
  aléatoire ±15°).
- **Hover sur une carte** :
  - **Élévation CSS** (translate-Z 8 px + box-shadow plus intense).
  - **Verso qui se révèle** sur 600 ms (flip 3D) → citation visible.
- **Drag-and-drop** :
  - La carte **flotte sous le curseur** (rotation 3°, ombre
    portée +20 % offset).
  - **Trail discret** (3 traces fade-out derrière le drag).
- **Drop dans la pile** :
  - **Snap satisfaisant** (translate vers position cible 200 ms,
    overshoot 10 % puis settle).
  - **Son sourd de marbre** (60 Hz court).
- **Jauge de recevabilité** (huissier en haut) :
  - Réagit en temps réel à chaque placement.
  - Animation gradient (rouge → orange → vert) sur 800 ms.
- **Bouton DÉPOSER LA QPC** :
  - **Pulse rouge** (sin wave 0.8 Hz, +5 % scale).
  - Le bouton **tremble légèrement** (signe de gravité).
  - Au clic : flash blanc puis fond noir 2 s + roue qui tourne.

### Audio design

- **Marbre qui résonne** (deep bass 80 Hz court) à chaque placement
  de carte.
- **Voix d'huissier** (TTS Mistral, voix grave française) :
  *« La QPC est déposée. Le Conseil délibère. »*
- **Roue qui tourne** : son de wheel of fortune subtil (3 s).
- **Cloche du Conseil** : *do grave* (150 Hz fondamental + harmoniques),
  écho 2 s.
- **Verdict positif** : cloche + tonalité ascendante.
- **Verdict négatif** : silence puis voix grave sentencieuse.

### Moments de jouissance

1. **L'instant où tu places la carte « préambule 1946 » en N°1** et
   la jauge de recevabilité **bondit à 78 %** avec un bruit de
   marbre — sentiment de maîtrise constitutionnelle.
2. **La cloche qui sonne**, le verdict qui s'affiche : *« QPC
   RECEVABLE — JURISPRUDENCE VALIDÉE »*. Une nouvelle ligne de
   jurisprudence apparaît dans ton journal de jeu, ton coup vaudra
   pour tous les tours futurs.
3. **Si échec** : la **voie européenne CES Bruxelles** s'illumine
   en bleu — espoir nouveau, recours débloqué.
4. **Le geste de drag-and-drop lui-même** : la carte qui flotte
   sous le curseur, le snap qui « clique » dans la pile. Tactile.

### Anti-patterns à éviter

- ❌ Pas de timer sur le drag-and-drop (le joueur réfléchit en droit
  constitutionnel — pas en arcade).
- ❌ Pas de feedback « bonne réponse / mauvaise réponse » avant le
  verdict — l'incertitude est l'objet du jeu.
- ❌ Pas d'animations flashy genre confettis si succès. Le verdict
  se mérite par sa sobriété.

### Effort design

- Asset 5 cartes-arguments illustrées — 1 j.
- Asset intérieur Conseil constitutionnel (fond marbre + sceau) — 0,5 j.
- Asset huissier silhouette + jauge — 0,3 j.
- Sonore : marbre, cloche, voix huissier — 0,4 j.

---

## 7.6 — V2-6 « Le Congrès BIT » (Mitbestimmung)

> *Pitch émotionnel.* Tu es à Genève, congrès BIT 1990s-2000s. Tu
> rencontres Anna, syndicaliste IG Metall. Elle ne comprend pas ton
> système — pas par mauvaise volonté, par grammaire différente. Tu
> dois lui expliquer. Et en l'expliquant, tu te comprends.

### Esthétique d'époque

- **Référence visuelle** : *Palais des Nations* à Genève, architecture
  moderniste. Halls en marbre clair, immenses fenêtres, drapeaux des
  États membres.
- **Architecture stylisée 2D** : grand hall avec pilier, fenêtres
  hautes, drapeaux multiples en filigrane.
- **Anna** : silhouette stylisée à droite (pas de visage détaillé —
  inclusivité, projection libre).
- **Toi** : silhouette à gauche, miroir.
- **Globe OIT** en filigrane au-dessus (cercle avec continents).
- **Palette** : bleu BIT (#005A9C), blanc cassé (#F0EDE5), jaune
  accent (#F4C430), gris architecture (#9E9D8E).
- **Typographie** : *Bauhaus 93* pour les concepts allemands flottants,
  *Helvetica Neue* pour la trame, *Akzidenz Grotesk* pour les
  citations.
- **Direct exécution Vignelli (#8)** : trois tailles maximum,
  pas de gradient.

### Game feel — micro-interactions

- **5 concepts allemands** flottent au-dessus de la timeline (lévitation
  sin wave, période 4 s, amplitude 6 px).
- **Survol d'un concept** :
  - **Définition apparaît** dans une carte translucide (Bauhaus).
  - **Concept s'agrandit** (1.05x scale).
- **Drag d'un concept** :
  - **Trail bleu lumineux** derrière le drag (5 traces fade).
  - **Timeline en bas** s'illumine (les choix passés deviennent
    cliquables).
- **Drop sur un choix passé** :
  - **Son métallique propre** (3 kHz, sec).
  - Le concept **s'aligne** sur le choix, ligne reliante apparaît
    (Bauhaus jaune, 1 px).
- **Anna réagit** :
  - Sourcil levé (silhouette qui se modifie en 2 étapes : neutre →
    intéressée / surprise / désapprobation).
  - **Texte de réplique** apparaît dans une bulle Bauhaus.
- **Diagnostic final** :
  - **Machine à écrire** qui tape ligne par ligne (effet typewriter
    classique, vitesse 4 mots/s).
  - **Fond qui s'estompe** progressivement vers Anna en silhouette.

### Audio design

- **Hall** : pas qui résonnent (sandstone reverb 2,5 s), ascenseur
  lointain, langues étrangères en fond (loop 8 s, 4 langues mêlées
  inintelligibles).
- **Drag** : whoosh harmonique léger (Brian Eno style).
- **Drop** : son métallique propre (3 kHz, 80 ms).
- **Anna parle** : voix synthétique allemande douce (TTS Mistral
  multilingue) avec sous-titres FR.
- **Diagnostic typewriter** : clack-clack 4 mots/s, sec.
- **Musique** : aucune. Le hall et les pas suffisent.

### Moments de jouissance

1. **Anna qui sourit** quand tu mappes correctement un concept —
   par exemple Mitbestimmung sur ton choix de cogestion 1947.
   Sa silhouette bascule en deux étapes, son sourire est invisible
   mais lisible.
2. **Le diagnostic final** qui tape ligne par ligne, puis le verdict :
   *« Trajectoire : corporatiste hybride avec dérive libérale post-2017.
   Vu de Berlin, votre 2003 ressemble à un Mitbestimmung manqué. »*
   Tu apprends quelque chose de toi.
3. **Le silence respectueux** quand le diagnostic est sévère — Anna
   n'argumente pas, elle constate.
4. **L'utilité durable** : ce diagnostic reste dans ton journal de
   jeu et **modifie le ton** de l'EndingReport en fin de partie.

### Anti-patterns à éviter

- ❌ Pas de quizz « la bonne réponse était... » — c'est un dialogue
  comparatif, pas un test.
- ❌ Pas d'avatars détaillés (Anna doit rester silhouette pour
  projection libre).
- ❌ Pas de drapeau allemand sur Anna (cliché). Juste un pin IG
  Metall discret sur sa veste.

### Effort design

- Asset hall BIT (architecture 2D moderniste) — 0,5 j.
- Asset Anna silhouette en 4 états (neutre/intéressée/surprise/désap.) — 0,3 j.
- Asset 5 cartes concepts Bauhaus — 0,3 j.
- Sonore : pas, langues, machine à écrire — 0,3 j.

---

## 7.7 — V2-7 « Signaux Faibles » (2030+)

> *Pitch émotionnel.* Tu es en 2032. L'IA a remplacé 18 % des emplois
> cadres. Tu reçois 5 cartes prospectives. Tu dois en amplifier 2.
> Le futur t'écoute. Il répond.

### Esthétique d'époque (anticipation)

- **Référence visuelle** : interfaces immersives (Apple Vision Pro,
  Microsoft Mesh), travaux de **Refik Anadol** (#193) sur la donnée
  comme matière, **Hito Steyerl** (#197) sur l'image et le pouvoir,
  **Ian Cheng** (#194) sur les simulations vivantes.
- **Espace 3D minimal** type interface holographique. Pas de skyline
  cyberpunk facile — sobriété glacée.
- **Cartes holographiques** : 5 tableaux flottant à mi-hauteur, légère
  inclinaison, bordure scintillante (sin wave 2 Hz, ±5 %).
- **Outils du joueur** (CSE, branches, conventions) sous forme
  d'**icônes en bas de l'écran** qui se transforment au cours de la
  partie (Stiegler #78).
- **Avatars des 3 IA adversaires** en haut de l'écran, silhouettes
  stylisées (USA / Chine / France).
- **Palette** : bleu nuit (#0A1226), accents néon cyan (#00E5FF) +
  magenta (#FF2F92), gris glacé (#A8B0BE), blanc froid (#F5F7FA).
- **Typographie** : *Inter* (UI) + *Haas Grotesk Display* (titres).
- **Glitch art subtil** : à intervalles aléatoires, micro-décalages
  RGB sur les outils (1 px max, 80 ms).

### Game feel — micro-interactions

- **5 cartes signaux faibles** flottent en arc de cercle.
  - **Lévitation** : sin wave 3 s, amplitude 8 px.
  - **Bord scintillant** : sin wave 2 Hz, opacity ±15 %.
- **Survol d'une carte** :
  - **Carte s'agrandit** (1.08x, 400 ms).
  - **Preview des conséquences** apparaît (estimées par les 3 IA),
    sous forme de 3 petites micro-cartes en arc autour.
  - **Le bord brille plus fort** (opacity boosted).
- **Drag d'une carte vers la zone AMPLIFIER** :
  - **Trail coloré** selon catégorie (signal techno = cyan, social
    = magenta, géopol = jaune).
  - La carte **rejoint sa zone** avec un *snap* + **flash blanc bref**.
- **Glitch d'outil** :
  - À intervalle aléatoire (toutes les 10-30 s), un outil clignote
    et **se reconfigure** : `CSE → CSE-IA augmenté`, `Branche
    métallurgie → Branche cobotique`.
  - Animation : décalage RGB 80 ms + texte qui scramble (Matrix-like
    bref) + nouveau texte stable.
- **IA adversaires** :
  - Avatars qui **bougent** quand elles parlent (silhouette simple,
    head bob léger).
  - Texte de leur réplique apparaît en sous-titres en bas.
- **Refondation rare (5 %)** :
  - Tous les outils s'illuminent simultanément en blanc.
  - Musique ascendante (8 s).
  - Carton ENDING V3.

### Audio design

- **Pad nature 2030 modifié par IA** : son organique (vent, oiseaux
  lointains) avec **micro-glitches** (toutes les 4-6 s, 80 ms).
- **Carte amplifiée** : whoosh harmonique (Brian Eno style, montant).
- **Reconfiguration outil** : son de modulation (filtre balayé sur
  600 ms, bandpass qui s'ouvre).
- **Glitch RGB** : tick numérique court (200 Hz, 40 ms).
- **IA chinoise** : voix synthétique mandarine (TTS multilingue) avec
  sous-titres FR.
- **IA US** : voix synthétique américaine.
- **IA française État stratège** : voix synthétique mais avec
  inflexion humaine plus forte (signature Mistral fr).
- **Refondation** : crescendo orchestral synthétique sur 8 s
  (nappe à la Eno + cordes synth).

### Moments de jouissance

1. **L'instant où tu amplifies la carte « plateformes échappent
   aux conventions »** et l'IA chinoise **plisse les yeux** dans
   son avatar — elle a noté. Tu as touché.
2. **Quand le CSE devient « CSE-IA augmenté »** au tour 5 — le
   jeu se transforme sous tes yeux. Stiegler t'a prévenu.
3. **La refondation rare** au tour 12 : tous les outils s'illuminent,
   musique ascendante, ending V3. Sentiment d'avoir touché quelque
   chose qui dépasse le possible.
4. **Le glitch RGB d'un outil** au moment où tu allais l'utiliser —
   bref vertige, puis nouvelle compétence à apprendre.

### Anti-patterns à éviter

- ❌ Pas de cyberpunk facile (néons saturés, hologrammes flashy).
- ❌ Pas de musique synthé années 80 (anachronisme inverse).
- ❌ Pas d'avatars d'IA en robots (silhouettes humaines stylisées).
- ❌ Pas de chronos rouge agressif (sobriété, comme la Table).

### Effort design

- Asset cartes prospectives holographiques (5 designs) — 1 j.
- Asset interface 3D minimale (zone amplifier, outils) — 1 j.
- Asset 3 avatars IA stylisés — 0,5 j.
- Sonore : pad 2030 modifié, glitches, voix multilingues, refondation — 0,8 j.
- Animation : glitch RGB + reconfiguration outils — 0,5 j.

---

## 7.8 — Direction artistique transversale — la signature Paritas

7 époques, 7 esthétiques, mais **1 signature commune**. Voici les
règles qui les unissent et qui font qu'un joueur reconnaît
*« je suis dans Paritas »* dès le premier écran de chaque mini-jeu.

### Règles transversales

1. **Sobriété assumée** (Vignelli #8, Chen #18). Trois tailles
   typographiques maximum par mini-jeu. Pas de gradient sauf
   accents délibérés (sceaux, médailles). Pas de particules.

2. **Une typographie d'époque, jamais générique**.
   - 1864 → Romain du Roi + Didot.
   - 1940 → Didone étroit (Vichy) + Bodoni officielle (1944).
   - 1945 → Garamond + Courier Prime (machine à écrire).
   - 1995 → Garamond / Bell Centennial / Le Monde Livre.
   - 2017 → Le Monde Livre.
   - Mitbestimmung → Bauhaus + Helvetica + Akzidenz Grotesk.
   - 2030+ → Inter + Haas Grotesk Display.
   La typographie *est* le décor temporel.

3. **Une palette stricte par mini-jeu**, dérivée d'une référence
   visuelle réelle (photo d'archive, peinture, architecture
   reconnaissable). Jamais d'inspiration "vibe" générique.

4. **Audio : silence avant choix lourd** (Yamaoka #33). Tous les
   mini-jeux respectent ce cue : 1-2 s de silence absolu juste
   avant la décision irréversible (vote Table, dépôt QPC,
   amplification finale, signature 1940).

5. **Game feel : un seul clic décisif, pas du clicker**. Le joueur
   pose des actes rares et lourds, pas des micro-clics répétés.
   Chaque clic doit avoir un poids visuel, sonore et systémique.

6. **Pas d'écran de défaite, pas d'écran de victoire**. Chaque
   issue est commentée par un texte de verdict, sobre. Romero (#22)
   et Monteiro (#184) : *« nommer l'inconfort, ne pas le célébrer »*.

7. **Mode Compulsif intégré, jamais en parallèle**. Les voix
   intérieures sont la signature émotionnelle de Paritas — chaque
   mini-jeu doit pouvoir les accueillir naturellement (Voix
   Intérieures, Le Piège phase 1, Table en bluff, QPC en
   délibération, Signaux Faibles en glitch).

8. **Cohérence audio cycle 1+2 conservée**. Tous les mini-jeux
   utilisent les bus audio existants (musicGain, fileGain, sfxGain,
   distance bus, master limiter -0,5 dB). Aucun mini-jeu n'introduit
   de chaîne audio parallèle.

9. **Accessibilité native, pas adaptée**. Sous-titres permanents,
   navigation clavier, mode lent, daltonisme par patterns,
   `aria-live`. Conçus dès l'esquisse design, pas ajoutés ensuite.

10. **Le joueur écrit l'histoire en signant, pas en cliquant**.
    Chaque mini-jeu produit un **artefact persistant** dans le
    journal de jeu : la déclaration 1864, la lettre 1940, le draft
    1945, la contradiction 1995, la jurisprudence 2017, le
    diagnostic Mitbestimmung, l'éventail des futurs 2030+.
    Réinjecté en fin de partie.

### Effort design transversal

| Bloc transversal | Effort |
|---|---|
| Direction artistique (palette, typographie, signature audio) | 2 j |
| Bibliothèque de composants UI partagés (boutons d'époque, cartes, dossiers) | 2 j |
| Pige design système (Hische lettering, Apeloig consultation typo) | 3 j (pige) |
| Pige son (Derivière thème original + signatures audio) | 3 j (pige) |
| **Total transversal** | **~4 j-dev + 6 j piges** |

### Effort total mini-jeux (game feel + esthétique en plus du dev)

| Mini-jeu | Dev (rappel) | Design + Foley |
|---|---|---|
| V2-1 Statut Juridique 1864 | 1,5 j | 1 j |
| V2-2 Le Piège 1940→1944 | 3 j | 2 j |
| V2-3 La Table 1945 | 6 j + 10,5 j module | 2,5 j |
| V2-4 Voix Intérieures 1995 | 3 j | 1,4 j |
| V2-5 Hiérarchie Arguments 2017 | 4 j | 2,2 j |
| V2-6 Congrès BIT | 2 j | 1,4 j |
| V2-7 Signaux Faibles 2030+ | 8 j | 3,8 j |
| **Sous-total mini-jeux** | **~38 j** | **~14,3 j** |
| Direction artistique transversale | — | 4 j + 6 j piges |
| **TOTAL game feel + esthétique** | | **~24,3 j** dont 6 j piges |

Ces 24 jours sont **en plus** du dev mécanique. Ils transforment
les mini-jeux fonctionnels en mini-jeux **mémorables**. La
différence entre un jeu qu'on rejoue et un jeu qu'on oublie tient
à ces 24 jours.

---

# 8. 7 mini-jeux de gestion permanente — l'épine dorsale gamifiée

Les 7 mini-jeux de la section 7 sont des **moments de cristallisation
historique** (déclenchés par scénarios). Ceux qui suivent sont
l'**épine dorsale** : ce que le joueur fait *entre* les grands
événements. Chaque mini-jeu de gestion est joué **à haute fréquence**
(15-50 fois par partie), avec une vraie boucle de gameplay, une
identité visuelle propre, et des **effets directs sur les autres
mini-jeux** — incluant les 7 mini-jeux historiques.

Pas de panneau de gestion plat type Tycoon. Chaque mini-jeu de
gestion est une **scène de prise de décision** avec son décor, sa
caméra, ses sons, ses gestes — un vrai mini-jeu, pas un menu.

**Ces 7 modules font passer Paritas de "lecteur de scénarios
historiques" à "vrai jeu de gestion d'organisation syndicale".**

---

## 8.1 — MANDAT — « La Salle du Congrès »

> *Pitch émotionnel.* Ton mandat de Secrétaire général arrive au
> terme. Tu présentes 5 motions devant 8 délégations internes. Le
> vote tombe. Tu es renouvelé, contesté, ou évincé. Les courants
> de ton syndicat décident.

**Fréquence** : 5-15 fois par partie (élections internes 4-7 ans).
**Durée** : ~8 minutes.

### Boucle de jeu

1. **Vue d'ouverture** : amphithéâtre vide qui se remplit
   progressivement (Maison du Peuple Aubervilliers ou Mutualité).
2. **8 délégations colorées** apparaissent : apparatchiks, militants
   de base, jeunes, ex-PCF, sociaux-chrétiens, féministes, retraités,
   cadres. Chacune avec sa **jauge de Soutien** (0-100), affichée
   en barre flottante.
3. **5 motions à présenter séquentiellement**. Tu choisis l'ordre
   et le contenu (parmi 8 motions disponibles : réformiste, dur,
   identitaire, économique, féministe, écologiste, gestionnaire,
   internationaliste).
4. Après chaque motion : **animation de réaction** des délégations
   (applaudissements debout / assis impassibles / dos tournés / huées).
5. **Vote final** : chaque délégation lève son carton (oui = blanc,
   non = rouge, abstention = noir). Compteur global qui tourne pendant
   le dépouillement.
6. **Issue** :
   - **Renouvelé** (>50 % oui) : Mandat +30, Légitimité +20, animation
     d'écharpe SG remise.
   - **Contesté** (40-50 %) : Mandat préservé mais flag « contesté »
     2 ans, malus Force interne.
   - **Évincé** (<40 %) : Game Over partiel, tu deviens spectateur de
     ta succession (mode replay sans intervention 3 tours).

### Esthétique d'époque

- **Référence visuelle** : amphithéâtre Maison du Peuple Aubervilliers
  (1932, Lurçat), ou Cirque d'Hiver pour les congrès historiques.
- **Palette** : rouge syndical sourd (#8B1F1B), bois clair (#C9A878),
  gris béton (#5A5A5A), accents drapeaux des délégations.
- **Typographie** : *League Spartan* (titres motions), *Inter* (UI),
  *Garamond* italique (citations).

### Game feel

- **Délégations en mosaïque** : chaque délégation = 8-15 silhouettes
  stylisées, couleur dominante.
- **À chaque motion** : animation par délégation
  - Applaudissement : silhouettes qui se lèvent + lèvent les bras
    (loop 4 s).
  - Soutien tiède : assis mais clappent (loop 2 s).
  - Désaccord : dos tournés (rotation 180° en 800 ms).
  - Hostilité : se lèvent et hurlent (animation gueules ouvertes SVG).
- **Jauges de Soutien** : barres flottantes au-dessus de chaque
  délégation, animation fluide à chaque modification (300 ms easing).
- **Vote final** : chaque délégation lève son carton (animation
  séquentielle 200 ms × 8 = 1,6 s). Le compteur global tourne en
  haut (animation digit qui défile, type tableau de bord SNCF
  années 80).
- **Renouvellement** : cérémonie d'écharpe (silhouette toi reçoit
  l'écharpe tricolore SG, micro-animation).

### Audio design

- **Murmures d'amphi** (loop 8 s) avant ouverture.
- **Coup de marteau** du président de séance pour ouvrir/fermer
  (thump bois 80 Hz).
- **Voix off du SG** (toi) qui présente chaque motion — TTS Mistral
  avec intonation passionnée.
- **Applaudissements 4 niveaux** : poli (faible) / chaleureux /
  enthousiaste / debout (rugby-style).
- **Huées 3 niveaux** : grognements / sifflets / cris hostiles.
- **Compteur de vote** : tic-tac mécanique ascendant pendant le
  dépouillement, finit par un *gong* grave au verdict.
- **Musique** : aucune pendant les motions. Sur renouvellement :
  *L'Internationale* à très bas volume sur le générique d'écharpe
  (8 s).

### Effets systémiques

- **Renouvelé** : bonus durable Légitimité + Force interne. Débloque
  motion plus ambitieuse au prochain congrès.
- **Contesté** : malus Force interne 2 ans. Pression accrue dans
  Voix Intérieures (V2-4 1995) au prochain scénario rupture.
- **Évincé** : changement de personnage jouable (le successeur, qui
  hérite de tes flags).
- **Cohésion interne** (Omnès #88) recalibrée selon ta performance.
- **Talents** disponibles dans la session formation suivante : ±2
  selon résultat.

### Moments de jouissance

1. **Quand toute la délégation jeunes se lève en applaudissant** ta
   motion féministe — tu as touché. Frisson militant.
2. **Le silence de la délégation conservatrice** quand tu présentes
   la motion écologiste — pesant, lisible.
3. **Le vote final qui tombe à 51,4 %** — la victoire à l'arraché,
   meilleur que 80 % parce qu'elle se mérite.
4. **Si évincé** : ton successeur prononce TON discours d'écharpe —
   silhouette anonyme, voix qui dit « Je m'inscris dans la continuité
   de mon prédécesseur ». Frisson amer.

### Anti-patterns à éviter

- ❌ Pas de feedback de victoire flashy (les congrès syndicaux sont
  solennels).
- ❌ Pas de skip-ready (le congrès EST l'événement).
- ❌ Pas de musique pendant les motions (silence respectueux des
  prises de parole).
- ❌ Pas de jauge "popularité" globale visible (cassserait la stratégie
  par délégation).

### Effort design

- Asset amphithéâtre 2D (illustration vectorielle) — 0,7 j.
- Asset 8 délégations × 4 états (assis, levé, applaudissant, dos
  tourné) — 1,5 j.
- Asset cartons de vote + tableau de bord vote — 0,3 j.
- Asset écharpe SG cérémonie — 0,2 j.
- Sonore : applaudissements 4 niveaux + huées 3 + marteau + gong + voix
  off — 0,7 j.
- **Total design** : ~3,4 j.

---

## 8.2 — ORGANISATION — « Le Siège »

> *Pitch émotionnel.* Ton siège syndical est un bâtiment vivant.
> Chaque pièce que tu ouvres consomme et produit. Tu architectures
> ton organisation, étage par étage, comme un Bauhaus ouvrier.

**Fréquence** : 30-50 fois par partie (restructurations ponctuelles).
**Durée** : ~5-10 minutes par session.

### Boucle de jeu

1. **Vue isométrique** d'un bâtiment 2.5D, 4-6 étages possibles.
2. **Au départ** : rez-de-chaussée seul (accueil + secrétariat).
3. **Tu peux acheter** (avec Caisse) : un étage supplémentaire ou
   aménager une pièce existante.
4. **Pièces disponibles** (drag-and-drop) :
   - Service juridique (utile pour QPC, Table)
   - École syndicale (alimente Talents)
   - Imprimerie / journal (boost médiatique pour Meeting)
   - Salle de réunion (cohésion interne)
   - Archives (boost Mémoire passif)
   - Médiathèque (production durable)
   - Café militant (lieu de mini-jeu Meeting)
   - Bureau du SG (passif, déverouille certaines motions Mandat)
5. **Chaque pièce** : coût initial + coût mensuel + production passive
   (par tour de jeu principal).
6. **Risques aléatoires** (rare) : incendie, expulsion, fuite — mini-
   événements de 30 s.
7. **Vue en activité** : silhouettes circulent dans les couloirs,
   lumières s'allument selon l'heure simulée.

### Esthétique d'époque

- **Référence visuelle** : Bourse du Travail Paris (rue du Château
  d'Eau), siège CGT Montreuil, Maison des syndicats Aubervilliers.
- **Palette** : brique rouge (#993D1A), plâtre crème (#F0E5D0), métal
  noir (#1A1A1A), verre (#A8C8D8 transparent).
- **Typographie** : *Reynolds Display* (enseignes des pièces),
  *Inter* (UI).

### Game feel

- **Vue isométrique douce** (pas de full 3D, juste perspective 2.5D
  CSS transform).
- **Étage vide** : tu cliques, il s'illumine en bleu pâle pour
  signaler "achetable".
- **Achat d'un étage** : animation de construction (poutres qui
  s'assemblent en 1,5 s + son métallique de soudure).
- **Drag d'une pièce** : la pièce flotte avec son ombre projetée
  (translate-Z 12 px).
- **Drop** : snap dans l'emplacement + son d'aménagement (boxes qui
  se posent + tournevis 800 ms).
- **Activité simulée** : 6-12 silhouettes circulent (3 SVG paths
  qui parcourent les couloirs en boucle 30 s), lumières s'allument
  selon l'heure (matin = jaune chaud, soir = bleu froid, nuit =
  fenêtre éclairée du SG seule).
- **Au survol d'une pièce** : tooltip Bauhaus avec ses stats
  (production, coût, état, occupants actuels).
- **Incendie** : gerbe de fumée SVG monte, alarme, tu cliques pour
  appeler les pompiers (mini-action 5 s).

### Audio design

- **Bruit de bureau ambiant** : claviers vintage, pas, papiers,
  téléphones (loop 12 s, varié).
- **Construction étage** : marteau-pilon + perceuse + soudure (3 s).
- **Aménagement pièce** : cartons qui se posent + tournevis + clic
  d'enseigne qui s'allume.
- **Incident incendie** : alarme stridente brève (1 s) + crépitement
  + sirène pompiers lointaine.
- **Musique** : aucune (le bâtiment vit par ses sons propres).

### Effets systémiques

- **Service juridique** : génère +1 juriste/mois (utilisable en QPC
  2017, Table, défense 1944).
- **École syndicale** : génère +1 cadre formé/mois → débloque
  sessions Talents.
- **Imprimerie** : bonus pénétration médiatique permanent (Sharp #180).
- **Médiathèque** : bonus Mémoire passif (+0,5/tour).
- **Café militant** : bonus cohésion interne + débloque mode hot-seat
  Meeting interne avant les meetings publics.
- **Archives** : bonus Mémoire historique long terme (effet sur
  EndingReport).
- **Bureau SG** : déverouille motions audacieuses au prochain Congrès.
- **Pièce détruite (incendie)** : malus 6 mois + obligation de
  reconstruire (coût Caisse).

### Moments de jouissance

1. **Le premier étage acheté** — sentiment de croissance
   organisationnelle. Animation de construction satisfaisante.
2. **Quand toutes les pièces sont aménagées et le bâtiment grouille
   à 19h** — c'est un siège syndical vivant, lumières partout, tu
   sens la masse des camarades.
3. **La nuit, les lumières s'éteignent une à une mais le bureau du
   SG reste éclairé** — détail beau, presque triste.
4. **L'incendie qui détruit l'imprimerie** — tu dois reconstruire.
   Drame narratif ; l'organisation se remet en marche, plus forte.

### Anti-patterns à éviter

- ❌ Pas de Tycoon-style optimization (pas de "min-max" agressif).
- ❌ Pas de pièces fantaisistes (pas de "salle de gym").
- ❌ Pas de pop-ups de notification pour chaque petit événement
  (sobriété, max 1 popup par heure simulée).
- ❌ Pas de scoring "siège efficace 92 %" (l'efficacité se voit
  dans les autres mini-jeux).

### Effort design

- Asset bâtiment isométrique (rez + 5 étages) — 1,2 j.
- Asset 8 pièces × 3 états (vide / aménagée / active) — 1,8 j.
- Asset silhouettes en mouvement (6 SVG paths) — 0,5 j.
- Asset incident incendie (fumée + sirène) — 0,3 j.
- Sonore : ambiance, construction, aménagement, alarme — 0,5 j.
- **Total design** : ~4,3 j.

---

## 8.3 — MONDE — « La Carte »

> *Pitch émotionnel.* Ta confédération s'étend ou se rétracte. Tu
> déploies des sections en région. Tu négocies avec tes camarades
> européens. La carte de France et de l'Europe est ton terrain.

**Fréquence** : 10-20 fois par partie (déploiements).
**Durée** : ~5-10 minutes par session.

### Boucle de jeu

1. **Vue carte stylisée** : France métropolitaine + UE proche.
2. **10-12 régions FR** (NUTS-2 simplifiées) : Île-de-France,
   Hauts-de-France, Grand Est, Auvergne-Rhône-Alpes, PACA, Occitanie,
   Nouvelle-Aquitaine, Pays de la Loire, Bretagne, Normandie +
   Outre-mer (cluster).
3. **5-6 partenaires européens** : DGB Allemagne, TUC UK, CGIL Italie,
   CCOO Espagne, FNV Pays-Bas, PSA Suède.
4. **Tu déploies des "drapeaux de section"** sur les régions (coût
   Caisse + Mandat).
5. **Tu négocies des accords transfrontaliers** via mini-table à 2
   (réutilisation simplifiée de La Table).
6. **Tu peux fermer une section déficitaire** (libère Caisse mais
   perd Mémoire et Adhérents en région).
7. **Vue dynamique** : lignes de connexion entre régions/partenaires,
   halo de couverture qui pulse selon Force locale.

### Esthétique d'époque

- **Référence visuelle** : cartes *Hérodote* (Béatrice Giblin #161),
  atlas géopolitique sobre, fond aquarelle.
- **Palette** : bleu mer Méditerranée (#1E5C8A), vert continental
  (#3A6B47), accents tricolores et drapeaux EU partenaires, papier
  vieilli (#F0E8D0).
- **Typographie** : *Galaad* (cartographie), *Inter* (UI).

### Game feel

- **Carte illustrée à la main** (style Hérodote, pas une carte Google).
  Reliefs subtils, traits aquarelle.
- **Drapeaux qui se posent** : animation poof + onde concentrique
  600 ms (radial gradient qui s'étend puis disparaît).
- **Halo de couverture** : pulse 1 Hz autour d'une section
  (intensité du halo = Force locale, couleur = camp).
- **Lignes de connexion** : tracées dynamiquement entre tes sections
  (animation polyline 800 ms easing-out).
- **Drag pour proposer un accord** à un partenaire EU : ligne
  pointillée jaune qui se trace de toi vers lui.
- **Si accord signé** : ligne devient continue + animation de poignée
  de main (icône stylisée Bauhaus).
- **Survol région** : tooltip avec stats (Adhérents locaux, Force,
  Caisse régionale).
- **Fermer une section** : animation drapeau qui descend, halo qui
  se rétracte. Triste mais propre.

### Audio design

- **Vent maritime/continental** (loop 10 s, très bas) en bg, varie
  selon la région survolée.
- **Drapeau qui claque** : impact 200 ms sec.
- **Halo qui pulse** : synth pad très bas (filtre balayé 4 s).
- **Accord signé** : cloche joyeuse (do majeur, harmoniques) +
  applaudissements lointains 2 s.
- **Section fermée** : grattement de craie sur ardoise (rayure courte).
- **Tracé de ligne** : whoosh subtil 600 ms.

### Effets systémiques

- **Section déployée** : +1 % Adhérents par mois en région (jusqu'à
  plafond local). Débloque scénarios régionaux.
- **Accord EU signé** : bonus durable Mémoire EU + débloque mini-jeu
  Mitbestimmung (V2-6) avec ce partenaire.
- **Section fermée** : −1 % Adhérents permanent + flag "rétractation"
  1 an, malus Mandat au prochain congrès.
- **Couverture régionale > 80 %** : bonus structurel +5 % sur tous
  les autres mini-jeux (effet plateau de masse).
- **Couverture EU >= 3 partenaires** : débloque scénario refondation
  V2-7 plus probable.

### Moments de jouissance

1. **Quand tu déploies ton 5e drapeau et la France est presque
   entièrement couverte** — sentiment de masse syndicale, tu vois
   ton organisation s'étendre comme une marée.
2. **La signature d'accord avec le DGB allemand** — cloche, poignée
   de main animée, la France devient européenne. Tu sors de
   l'hexagonalité.
3. **Les Outre-mer qui s'illuminent enfin** (rare, demande effort
   spécifique sur 3-4 tours) — coup de cœur militant, narratif fort
   (Sondra Perry #196 satisfait).
4. **La carte qui se rétracte** en cas de séisme stratégique
   (ex. retrait de la CFDT après scission 1995) — symbolisme fort,
   beauté triste.

### Anti-patterns à éviter

- ❌ Pas de carte Google Maps réaliste (Hérodote stylisé seulement).
- ❌ Pas de strat 4X classique (pas de "conquête" militaire).
- ❌ Pas de notifications de changement par région (synthèse 1×/an
  max).
- ❌ Pas de drapeaux "concurrents" sur les mêmes régions (sauf
  paritarisme : alors ce sont des couleurs cohabitantes, pas des
  adversaires).

### Effort design

- Asset carte France + UE stylisée (style Hérodote) — 1,5 j.
- Asset drapeaux + icônes partenaires EU — 0,5 j.
- Animation halos + lignes + onde concentrique — 0,5 j.
- Asset poignée de main signature — 0,2 j.
- Sonore : vent, drapeaux, cloche, pad — 0,4 j.
- **Total design** : ~3,1 j.

---

## 8.4 — TRÉSORERIE — « Le Bureau du Trésorier »

> *Pitch émotionnel.* Tu es le trésorier. Une fois par an, tu
> alloues le budget. Tes choix construisent ou tuent la confédération.
> URSSAF rôde. La balance comptable bascule.

**Fréquence** : 15-25 fois par partie (annuel + crises).
**Durée** : ~5-8 minutes par session.

### Boucle de jeu

1. **Vue** : bureau bois acajou, livre des comptes ouvert au centre,
   balance comptable au-dessus, lampe banker's verte à droite.
2. **Total disponible** : Caisse actuelle + cotisations annuelles
   estimées (calcul affiché dans le livre).
3. **5-7 enveloppes à remplir** :
   - Salaires permanents
   - Frais de fonctionnement
   - Caisse de grève (réserve pour Manifestation)
   - Investissement immobilier (alimente Organisation)
   - Mutuelle / prévoyance
   - Communication (alimente Meeting)
   - Formation (alimente Talents)
4. **Tu déposes des "tas de pièces"** dans chaque enveloppe (drag-and-
   drop fluide).
5. **Au-dessus** : jauge de "santé financière" qui réagit aux
   allocations (verte / orange / rouge).
6. **Événements aléatoires** (1/3 années) :
   - Contrôle URSSAF (mini-vérif rapide non-stressante).
   - Faillite d'une caisse régionale (urgence).
   - Don anonyme massif (rare, doux).
7. **Validation** : les tas sont scellés dans les enveloppes (sceau
   de cire + signature trésorier), le grand livre se ferme avec
   solennité.

### Esthétique d'époque

- **Référence visuelle** : bureau de trésorier syndical années
  1960-2000 (chêne acajou, lampe banker's vert wagon, livre relié
  cuir).
- **Palette** : bois acajou (#5A2F1C), cuir vert wagon (#2A4734),
  or pâle (#C9B26A), papier crème vergé (#F4EFE2).
- **Typographie** : *Garamond* (corps), *Courier Prime* (chiffres
  comptables), *Iowan Old Style* italique (en-têtes des enveloppes).

### Game feel

- **Pièces qui s'écoulent** en sablier visuel quand tu drag-and-drop
  (animation particles 800 ms, son cliquetis).
- **Balance comptable** au centre qui bascule en temps réel selon
  la répartition (visualisation poétique de l'équilibre/déséquilibre,
  inertie réaliste).
- **Livre des comptes** qui se feuillette automatiquement quand tu
  alloues (animation page 800 ms).
- **Bouton FERMER LE LIVRE** : effort visuel — le livre se ferme
  lentement (1,5 s), sceau apposé avec thump.
- **URSSAF événement** : porte qui s'ouvre avec un grincement,
  silhouette d'inspecteur entre, mini-vérif (tu pointes 5 colonnes
  du livre — quick-action non-stressante, 30 s tranquilles).
- **Don anonyme** : enveloppe blanche apparaît sur le bureau, tu
  l'ouvres, billets qui tombent en cascade lente.

### Audio design

- **Pièces qui tintent** (loop 4 s, 4 variations).
- **Balance qui craque doucement** quand elle bascule (créaks bois
  + métal, 1 s).
- **Page qui se tourne** (loop varié, 6 variations).
- **Sceau du livre fermé** : thump grave 80 Hz + craquement cuir.
- **URSSAF** : pas qui se rapprochent (heels sur parquet), porte qui
  grince. Voix grave : *« Bonjour. Contrôle URSSAF. »*
- **Don anonyme** : enveloppe glisse + froissement papier monnaie.
- **Musique** : aucune (le bureau respire).

### Effets systémiques

- **Salaires permanents bas** : -Talents disponibles + flag
  "dévalorisation".
- **Caisse de grève haute** : bonus durable lors des Manifestations
  (réduit Caisse consommée).
- **Investissement immobilier** : génère revenus passifs (location
  de salles à autres orgs) + débloque pièces premium dans Organisation.
- **Mutuelle haute** : bonus Honte/Fierté (Ernaux #99) — tu protèges
  les tiens.
- **Communication** : multiplicateur d'efficacité Meeting (impact
  Adhésion ×1,3).
- **Formation** : multiplicateur d'efficacité Talents (taux
  d'apprentissage ×1,5).
- **URSSAF passé** : +Légitimité institutionnelle (clean) ou amende
  massive (-30 % Caisse).
- **Don anonyme** : +Caisse exceptionnelle (+50 %) mais flag mystère
  durable.

### Moments de jouissance

1. **Le sceau qui ferme le livre des comptes** — solennité
   administrative, *thump* satisfaisant.
2. **La balance qui se stabilise parfaitement à l'équilibre** —
   sentiment d'expertise comptable, esthétique zen.
3. **L'inspecteur URSSAF qui dit « Tout est en ordre »** — soulagement
   palpable, tu as bien tenu tes comptes.
4. **Le don anonyme de 100 000 F** — surprise rare, romantique, tu
   ne sauras jamais qui c'est. Beauté narrative.

### Anti-patterns à éviter

- ❌ Pas de tableur Excel-like (l'esthétique compte autant que la
  fonction).
- ❌ Pas de QTE stressant pour l'URSSAF (vérification à tête reposée).
- ❌ Pas de bilan post-année avec note A-F (sobriété, comme les
  congrès).
- ❌ Pas de courbes de croissance flashy (juste la balance qui
  bascule).

### Effort design

- Asset bureau + balance + livre des comptes (3 états : ouvert /
  feuilleté / fermé scellé) — 1 j.
- Asset enveloppes + tas de pièces animés — 0,5 j.
- Asset inspecteur URSSAF (silhouette + 3 états) — 0,3 j.
- Asset événement don anonyme (enveloppe + billets) — 0,2 j.
- Sonore : pièces, balance, page, sceau, pas, voix URSSAF — 0,6 j.
- **Total design** : ~2,6 j.

---

## 8.5 — MANIFESTATION — « Le Cortège »

> *Pitch émotionnel.* Tu organises la manifestation. Tu places
> banderoles, sono, service d'ordre, tête de cortège, médias. Tu
> lances. Le boulevard prend vie. Tu décides en temps réel pendant
> que ton cortège défile.

**Fréquence** : 5-15 fois par partie (déclenché par scénarios de
grève).
**Durée** : ~8-12 minutes par session.

### Boucle de jeu

#### Phase A — Préparation (3 min)

1. Vue **carte de Paris** simplifiée (ou ville majeure selon
   scénario).
2. Tu choisis le **parcours** parmi 3 options pré-tracées
   (Bastille → République, République → Nation, Denfert → Invalides).
3. Tu places **5 ressources** sur le boulevard (drag-and-drop) :
   - Tête de cortège (figures syndicales en première ligne)
   - Banderoles (couleurs et slogans choisis)
   - Sono (camion avec slogans amplifiés)
   - Service d'ordre (encadrement)
   - Médias (équipes vidéo/photo)
4. Chaque placement modifie 3 jauges en temps réel : **Force externe
   (visibilité), Sécurité, Visibilité médiatique**.

#### Phase B — Défilé (5-8 min)

1. Vue **latérale du boulevard** en perspective, le cortège défile
   en temps réel (scroll horizontal lent, 4 écrans de large).
2. **Bruit de foule monte progressivement** (utilise loop
   crowd-protest cycle 2 audio existant — Vasseur l'avait demandé
   étendu à 90 s, voilà l'usage parfait).
3. **Incidents apparaissent en temps réel** :
   - Provocation flics (calmer / répondre)
   - Journalistes (interview / refuser)
   - Casseurs (isoler / accueillir)
   - Cri de slogan spontané (amplifier / laisser passer)
   - Météo (pluie / grand soleil / brouillard) — événement
     environnemental
   - Drone qui survole (post-2018) — flag visibilité
4. Tu cliques pour **intervenir**, sinon l'incident se résout selon
   tes ressources placées.

#### Phase C — Bilan (1 min)

Issue : succès médiatique (couverture JT 20h), dispersion (rentrée
volontaire / pluie), incident grave (heurts → Légitimité chute).

### Esthétique d'époque

- **Référence visuelle** : photos N&B 1995 (Magnum), photos couleur
  2016 et 2023 (manifs CGT-CFDT-Solidaires-FSU).
- **Palette** : gris pavé (#4A4A4A), rouge banderole (#B0181E), bleu
  CRS (#1A2E5C), jaune gilet (#E8C13E), tricolore français pour
  drapeaux.
- **Typographie** : *Anton* (banderoles, énorme), *Inter* (UI).

### Game feel

- **Phase A — Préparation** : drag-and-drop précis sur le boulevard,
  prévisualisation immédiate de l'effet (jauges qui bougent).
- **Phase B — Défilé** : scroll horizontal naturel (0,5 px/frame
  60 FPS = lent et hypnotique).
- **Bruit de foule qui MONTE** progressivement (0 → -6 dB en 2 s
  au démarrage). Sensation physique.
- **Banderoles** qui se déploient au vent (SVG animé, ondulation
  sinusoïdale 3 s).
- **Incidents apparaissent** en pop avec icône clignotante (1 Hz)
  + légère pulsation rouge si grave.
- **Drones qui survolent** (post-2018) — scroll horizontal opposé
  au tien (3× plus rapide), petit point noir en hauteur, son
  bourdonnement lointain.
- **Effet météo aléatoire** : pluie (visuels gouttes 60 FPS + son
  impacts variés) modifie Force externe.
- **Caméra TV** qui filme : si tu attires son focus, c'est un boost
  médiatique mais aussi un risque (interview imprévue).
- **Slogan amplifié** : texte géant Anton apparaît plein écran 1 s
  en flash (« RETRAITES ! », « LIBERTÉ ! »).

### Audio design

- **Bruit de foule étendu à 90 s** (loop crowd-protest cycle 2 enrichi).
- **Slogans rythmés par tambour** (loop 4 s, *« Et hop, et hop, et
  hop hop hop ! »*).
- **Sirènes lointaines** (cue 3 s avant heurts, distance simulée).
- **Hélicoptère** (cue 5 s avant incident grave, post-2010+).
- **Pluie** : impacts variés 4 s loop (gouttes sur pavés, gouttes
  sur banderoles, gouttes sur micros).
- **TV journaliste** : brouhaha de plateau quand tu acceptes
  l'interview.
- **Drone** : bourdonnement aigu lointain.
- **Musique** : aucune. La foule EST la musique.

### Effets systémiques

- **Succès médiatique** : +Légitimité durable + Visibilité +
  Honte/Fierté +20 + clip JT 20h archivé dans journal.
- **Dispersion** : −Force externe −10 + flag « essoufflé » 6 mois.
- **Incident grave** : −Légitimité massive + flag durable + débloque
  scénario QPC 2017 (recours juridique).
- **Manifestation consomme** Caisse de grève accumulée en Trésorerie.
- **Drone visible non géré** : flag « surveillé » durable post-2018.
- **3 manifestations succès consécutives** : débloque option
  refondation V2-7.

### Moments de jouissance

1. **Le bruit de foule qui MONTE** quand le cortège démarre — sensation
   physique, presque corporelle.
2. **Quand le journaliste arrive et te tend le micro** — hésitation,
   choix éthique, pression du temps réel sans QTE arcade.
3. **Le slogan qui se déploie sur les banderoles** — typo Anton géante,
   photographique, presque cinématographique.
4. **Si succès** : le clip TV qui s'affiche en post-partie, ton
   organisation est « en une » du JT.
5. **Si pluie** : le drame météo réel, tu n'y peux rien, c'est tragique
   et beau.

### Anti-patterns à éviter

- ❌ Pas de QTE arcade (pas de barre qui se remplit en bashant un
  bouton).
- ❌ Pas de score "kill count" sur incidents (immoral).
- ❌ Pas de musique épique sur dispersion (silence respectueux).
- ❌ Pas de gore sur les heurts (suggéré, pas montré).

### Effort design

- Asset boulevard parisien stylisé (3 parcours différents) — 1,5 j.
- Asset 5 ressources placables + animations (banderoles, sono, etc.) — 0,8 j.
- Asset incidents (flics, journalistes, casseurs, slogans) — 1 j.
- Asset effets météo (pluie + soleil + brouillard) — 0,4 j.
- Asset drones, TV (post-2018+) — 0,3 j.
- Sonore : foule 90 s, slogans, sirènes, hélico, pluie, TV, drone — 0,9 j.
- **Total design** : ~4,9 j.

---

## 8.6 — MEETING — « La Tribune »

> *Pitch émotionnel.* Tu montes sur scène. 800 personnes te regardent.
> Tu as 3 axes à choisir, 3 registres à incarner. À la fin : clip
> viral, controverse, ou silence poli. Le public te juge en temps réel.

**Fréquence** : 10-20 fois par partie (campagnes, congrès, meetings
de soutien).
**Durée** : ~5-8 minutes par session.

### Boucle de jeu

1. **Vue** : scène avec micro pupitre, public face caméra (silhouettes
   en gradient de profondeur, 800-3000 selon ta Légitimité).
2. **Toi** : silhouette derrière le pupitre, ombre projetée GRANDE
   sur le mur du fond (effet dramatique, référence cinéma muet).
3. **Tu choisis 3 axes** parmi 6 cartes-axes : économique, identitaire,
   mémoire, futur, justice, sécurité.
4. **Pour chaque axe**, tu choisis un registre : factuel (sobre),
   émotionnel (vibrant), polémique (clivant).
5. **Pendant ton discours** (animation TTS + sous-titres), 3 jauges
   réagissent en temps réel :
   - Adhésion (favorables)
   - Curiosité (neutres pensifs)
   - Colère (hostiles)
   Par segment de public (gauche/centre/droite de la salle).
6. **Possibilité d'improviser** : bouton « Improvise » (rare, +/−
   brutal selon ton trait).
7. **Issue** : clip viral (succès médiatique), controverse (mixte),
   silence poli (échec).

### Esthétique d'époque

- **Référence visuelle** : meeting Macron 2017 (acoustique sobre),
  Mélenchon 2022 (rouge dramatique), Léon 2024 (lumière chaude),
  meetings historiques type Mitterrand Place de la Bastille 1981.
- **Palette** : rouge tribune (#8B1F1B), bleu rideau de fond
  (#1A2E5C), lumière chaude poursuite (#F4D78C), ombre profonde
  (#0A0A0A).
- **Typographie** : *League Spartan* (titres axes), *Inter* (UI),
  bandeau JT en *Helvetica Neue Bold*.

### Game feel

- **Toi en silhouette** derrière le pupitre, ombre projetée GRANDE
  sur le mur du fond (effet expressionniste type *Cabinet du Dr
  Caligari*).
- **Micro qui s'allume** en pulse rouge (1 Hz, +5 % opacity).
- **Lumière de poursuite** qui te suit (animation tracking subtle).
- **Public en gradient de profondeur** :
  - **Premier rang** détaillé (10 silhouettes individuelles, micro-
    réactions visibles).
  - **Milieu de salle** (50 silhouettes, animations groupées).
  - **Fond de salle** (200+ pixels stylisés, animation collective).
- **Réactions** : applaudissements (silhouettes qui bougent), debout
  (acclamation, debout en V), bras croisés (immobiles), huées
  (bouche ouverte SVG).
- **Au moment d'improviser** : bouton qui pulse plus fort, ton ombre
  tremble.
- **Clip viral final** : mise en scène type extrait JT (zoom rapide
  sur ton visage en silhouette, bandeau actu Anton blanc sur rouge).

### Audio design

- **Murmures de public** avant ton entrée (loop 8 s, varié, quelques
  toux).
- **Micro qui s'allume** : Larsen bref (200 ms) + bourdonnement
  léger (loop 4 s).
- **Ta voix au pupitre** : TTS Mistral, voix incarnée selon ton
  personnage (Notat, Berger, Léon, etc.).
- **Réactions** :
  - Applaudissements 4 niveaux (poli / chaleureux / enthousiaste / debout).
  - Debout : acclamation type rugby (cri collectif 2 s).
  - Huées 3 niveaux (grognements / sifflets / cris hostiles).
- **Silence poli** : silence absolu après ton dernier mot — 3 s.
  C'est insupportable, c'est la pire défaite.
- **Clip viral** : jingle JT 20h (do-mi-sol synth, 1,5 s).
- **Musique** : aucune pendant le discours. Sur clip viral final :
  jingle court, puis silence.

### Effets systémiques

- **Clip viral** : +Légitimité durable + bonus Visibilité 1 an +
  débloque possibilité de Mandat plus large + flag média positif.
- **Controverse** : jauge Honte/Fierté qui oscille selon profondeur,
  +Visibilité mais flag « clivant » 6 mois.
- **Silence poli** : -Légitimité + flag « ennuyeux » 6 mois +
  malus prochain meeting.
- **Performance répétée** (3 meetings réussis d'affilée) : bonus
  Pénétration mémorielle (Sharp #180) durable.
- **Meeting consomme** Communication budgétée en Trésorerie.

### Moments de jouissance

1. **L'ombre projetée GRANDE sur le mur** quand tu commences à parler
   — théâtre cinématographique, frisson dramatique.
2. **La salle entière debout** après ton 3e axe — frisson collectif,
   ils sont avec toi, applaudissements en rugby.
3. **Le silence poli, brutal** — tu sais que tu as raté, 3 s
   d'enfer, plus puissant qu'un échec verbal.
4. **Le clip viral final** — ton image au JT 20h, fierté coupable,
   bandeau Anton « LE SG MONTE LA TRIBUNE ».

### Anti-patterns à éviter

- ❌ Pas de QTE pour rester sous tempo (pas un karaoké).
- ❌ Pas de "perfect speech" achievable (toujours un compromis ou
  un clivage).
- ❌ Pas de gradient/flashy sur l'ombre (sobriété cinéma muet).
- ❌ Pas de score "discours bien noté 8/10" (le verdict est dans
  les jauges).

### Effort design

- Asset scène + pupitre + lumière de poursuite — 0,8 j.
- Asset public en 3 plans de profondeur (silhouettes en 4 états
  chacun) — 1,5 j.
- Asset bandeau JT viral + animation zoom — 0,3 j.
- Asset ombre expressionniste sur mur — 0,3 j.
- Sonore : murmures, micro, voix, applaudissements 4 niveaux, huées
  3, silence — 1 j.
- **Total design** : ~3,9 j.

---

## 8.7 — TALENTS — « L'École Syndicale »

> *Pitch émotionnel.* Tu détectes, tu formes, tu déploies. Les
> talents que tu construis aujourd'hui jouent les Tables des
> Négociations de demain. Sans école, pas de relève.

**Fréquence** : 15-25 fois par partie (sessions de formation
trimestrielles).
**Durée** : ~5-10 minutes par session.

### Boucle de jeu

1. **Vue** : salle de formation (référence : amphi modeste IFSyn,
   école Renoult de la CFDT, école centrale CGT).
2. **6-8 cartes de "talents potentiels"** sur la table (silhouettes
   + 3 traits chacune, ex. "Camille — terrain / juridique / oratoire").
3. **Tu en sélectionnes 3 par session** pour formation.
4. **Tu choisis leur formation** :
   - Juridique (utile en QPC 2017, défense Table)
   - Médiatique (utile en Meeting, gestion journalistes Manifestation)
   - Négociation (utile en Table 1945+, ANI, etc.)
   - Terrain (utile en Manifestation, mobilisation)
5. **Animation de formation** (4-6 semaines simulées en 30 s) :
   cartes qui se retournent, insignes qui se posent.
6. **À l'issue** : 3 nouveaux talents formés, intégrés à ton roster.
7. **Risques aléatoires** :
   - Démission (1 talent peut partir avant la fin)
   - Scandale (révélation négative ancienne)
   - Départ chez le syndicat concurrent (en cas de mauvaise rétention)

### Esthétique d'époque

- **Référence visuelle** : amphi modeste IFSyn, école Renoult,
  Bourse du Travail salle de formation.
- **Palette** : bois clair (#C9A878), tableau noir (#1A1A1A) avec
  craie blanche, papiers manuscrits, insignes colorés (or formé,
  bronze formé partiel, gris non-formé).
- **Typographie** : *Reynolds Display* (titres formation, sur
  l'enseigne de la salle), *Garamond* italique (cartes talents).

### Game feel

- **Cartes talents** posées au verso (dos uniforme bois clair) sur
  la table, tu cliques pour révéler (flip 3D 600 ms easing).
- **Drag pour intégrer** dans la "session de formation" (zone centrale
  marquée sur la table).
- **Chaque talent a 3 traits** (icônes simples : poing levé pour
  terrain, balance pour juridique, micro pour oratoire, etc.),
  couleur du trait dominant.
- **Formation** : animation 30 s avec progress bar douce + craie
  qui écrit le nom du formé sur tableau noir (animation typewriter).
- **À la fin** : insigne (médaille en SVG) qui se pose sur la
  silhouette du talent (animation ribbon qui descend, attache,
  thump de cire pour le sceau).
- **Si démission** : la carte se retourne avec un X rouge, son court
  (porte qui claque). Triste.
- **Si scandale** : journal qui apparaît au-dessus de la carte,
  titre Anton noir sur jaune (« RÉVÉLATION : ... »), flag retiré.

### Audio design

- **Salle de classe** : papiers, chuchotements, craie sur tableau
  (loop 8 s).
- **Carte qui se retourne** : whoosh + thunk discret.
- **Craie sur tableau noir** : 5 variations courtes.
- **Insigne qui se pose** : cling discret (4 kHz court).
- **Démission** : porte qui claque + silence 2 s.
- **Scandale** : froissement journal + flash photo.
- **Musique** : aucune (la salle vit par ses sons).

### Effets systémiques

- **Talent juridique formé** : +1 dans roster pour QPC 2017 (réduit
  coût Caisse de la défense).
- **Talent médiatique** : +1 dans roster pour Meeting (boost Adhésion
  ×1,2).
- **Talent négociation** : +1 disponible pour Table (peut bluffer
  mieux ou tenir une ligne rouge plus dure).
- **Talent terrain** : +1 disponible pour Manifestation (réduit risque
  incident de 30 %).
- **Talent perdu** : −1 + flag "défection" affecte Mandat (-5 sur
  prochain Congrès).
- **Roster > 8 talents formés** : débloque mode "passerelle" (un
  talent peut être prêté à un partenaire EU dans Monde).

### Moments de jouissance

1. **La carte qui se retourne et révèle un talent rare** ("Marie —
   terrain / juridique / oratoire — TRIPLE compétence") — sentiment
   de découverte précieuse.
2. **La craie qui écrit le nom du formé sur le tableau** — ton
   organisation grandit en mémoire collective.
3. **L'insigne d'or qui se pose sur la silhouette** — ils sont prêts,
   ils peuvent négocier la Table en ton nom.
4. **Quand un de tes talents formés joue un rôle décisif dans une
   Table 1945** — fierté pédagogique, sentiment de continuité.
5. **La démission inattendue** — drame court, l'organisation est
   vivante, elle perd parfois.

### Anti-patterns à éviter

- ❌ Pas de stats RPG-like avec niveaux et XP visibles (ton ≠
  MMORPG).
- ❌ Pas de cartes "rare/légendaire" en couleur arc-en-ciel
  (sobriété, chaque talent vaut).
- ❌ Pas de skill tree complexe (3 traits suffisent).
- ❌ Pas de gacha (pas de loot crate ouvert au hasard).

### Effort design

- Asset salle de classe avec tableau noir + bancs — 0,5 j.
- Asset 30+ silhouettes de talents (générées par combinaison de 6
  silhouettes × 5 vêtements × 2 genres) — 0,8 j.
- Asset insignes (3 niveaux × 4 spécialités = 12 insignes SVG) — 0,4 j.
- Asset journal scandale (template + 5 titres) — 0,2 j.
- Sonore : chuchotements, craie, insigne, porte — 0,3 j.
- **Total design** : ~2,2 j.

---

## 8.8 — Boucle systémique — comment les 14 mini-jeux se nourrissent

Les 7 mini-jeux historiques (section 7) et les 7 mini-jeux de gestion
(section 8) forment **un seul système** où chaque action nourrit les
autres. Diagramme conceptuel des flux :

```
                  ┌─────────────────────────────────────┐
                  │           MINI-JEUX GESTION         │
                  └─────────────────────────────────────┘
                                    │
           ┌────────────┬───────────┼───────────┬────────────┐
           ▼            ▼           ▼           ▼            ▼
        TRÉSORERIE → finance toutes les autres orgs
           │
           ├─→ ORGANISATION (immobilier, achats pièces)
           │     │
           │     ├─→ TALENTS (école syndicale = +cadres formés)
           │     ├─→ TRÉSORERIE (immo loue = +revenus passifs)
           │     └─→ MÉMOIRE (médiathèque, archives)
           │
           ├─→ MANIFESTATION (caisse de grève consommée)
           │     │
           │     ├─→ MEETING (visibilité boost)
           │     └─→ V2-5 QPC 2017 (incident grave débloque recours)
           │
           ├─→ MEETING (communication boost)
           │     │
           │     ├─→ MANDAT (légitimité +)
           │     └─→ MONDE (notoriété internationale)
           │
           ├─→ FORMATION (TALENTS)
           │     │
           │     ├─→ V2-3 LA TABLE 1945 (4 architectes pré-formés)
           │     ├─→ V2-5 QPC 2017 (juristes recrutés)
           │     ├─→ MEETING (orateurs entraînés)
           │     └─→ MANIFESTATION (terrain expérimenté)
           │
           ├─→ MONDE (déploiement régional + EU)
           │     │
           │     ├─→ V2-6 MITBESTIMMUNG (accord EU déjà signé)
           │     ├─→ ORGANISATION (sections locales)
           │     └─→ V2-7 SIGNAUX FAIBLES 2030+ (bonus refondation EU)
           │
           ├─→ MANDAT (légitimité durable)
           │     │
           │     ├─→ V2-4 VOIX INTÉRIEURES 1995 (tension interne pesée)
           │     └─→ Tous les autres mini-jeux (boost passif)
           │
           └─→ Les 7 mini-jeux historiques consomment les ressources
               accumulées par les 7 mini-jeux de gestion
```

**C'est une vraie boucle de gestion**, pas 14 silos. Chaque fois que
le joueur joue un mini-jeu de gestion, il *prépare* les mini-jeux
historiques. Chaque fois qu'il joue un mini-jeu historique, il *valide
ou détruit* le travail accumulé.

## 8.9 — Fréquence et place dans la partie complète

| Mini-jeu | Type | Fréquence par partie 100 tours | Durée moy. | Total |
|---|---|---|---|---|
| **GESTION** | | | | |
| Mandat (Salle du Congrès) | Récurrent | 5-15 | 8 min | ~80 min |
| Organisation (Le Siège) | Récurrent | 30-50 | 7 min | ~280 min |
| Monde (La Carte) | Récurrent | 10-20 | 7 min | ~105 min |
| Trésorerie (Le Bureau) | Récurrent | 15-25 | 6 min | ~120 min |
| Manifestation (Le Cortège) | Sur déclencheur | 5-15 | 10 min | ~100 min |
| Meeting (La Tribune) | Sur déclencheur | 10-20 | 6 min | ~90 min |
| Talents (L'École) | Récurrent | 15-25 | 7 min | ~140 min |
| **Sous-total gestion** | | **~120 sessions** | | **~915 min (~15h)** |
| **HISTORIQUES** | | | | |
| V2-1 Statut Juridique 1864 | Pivot | 1 | 8 min | 8 min |
| V2-2 Le Piège 1940 | Pivot | 1-2 (différé en 1944) | 15 min | 15-30 min |
| V2-3 La Table | Pivot répété | 4-7 (1936/1945/1947/2013/2017) | 25 min | 100-175 min |
| V2-4 Voix Intérieures 1995 | Pivot | 1 | 12 min | 12 min |
| V2-5 QPC 2017 | Pivot | 1 | 15 min | 15 min |
| V2-6 Mitbestimmung | Transversal | 1-3 | 10 min | 10-30 min |
| V2-7 Signaux Faibles 2030+ | Pivot final | 1 | 20 min | 20 min |
| **Sous-total historiques** | | **~12 sessions** | | **~180-300 min (~3-5h)** |
| **TOTAL** | | **~132 sessions** | | **~18-20h** |

**Une partie complète V2 dure ~18-20h** (vs ~6h en V1). C'est cohérent
avec la cible Sid Meier (#16) : *« 100 tours = 8-12h, le joueur
décroche au tour 35-45 »* — d'où la décomposition en 5 chapitres
autonomes (V1.x roadmap V2.11). Chaque chapitre = 4-5h, jouable en
2-3 sessions.

## 8.10 — Effort total des 7 mini-jeux de gestion

| Mini-jeu | Dev mécanique | Design + Foley | Total |
|---|---|---|---|
| 8.1 Mandat (Salle du Congrès) | 4 j | 3,4 j | **7,4 j** |
| 8.2 Organisation (Le Siège) | 5 j | 4,3 j | **9,3 j** |
| 8.3 Monde (La Carte) | 4 j | 3,1 j | **7,1 j** |
| 8.4 Trésorerie (Le Bureau) | 3,5 j | 2,6 j | **6,1 j** |
| 8.5 Manifestation (Le Cortège) | 6 j | 4,9 j | **10,9 j** |
| 8.6 Meeting (La Tribune) | 4,5 j | 3,9 j | **8,4 j** |
| 8.7 Talents (L'École) | 3,5 j | 2,2 j | **5,7 j** |
| **TOTAL** | **~30,5 j-dev** | **~24,4 j design** | **~54,9 j** |

C'est un gros morceau (~11 semaines temps plein), mais c'est ce qui
transforme V2 d'un *« lecteur de scénarios historiques »* en un
**vrai jeu de gestion d'organisation syndicale**.

---

# 9. Interface Cockpit — Le Pupitre Paritaire

L'interface V2 doit héberger **14 mini-jeux + le moteur scénarios
+ 7 ressources permanentes** sans saturer le joueur. La métaphore
choisie : **un pupitre de Secrétaire général**, vu en POV joueur,
combinant l'élégance d'un bureau Bourse du Travail années 1960 et
la densité informationnelle d'une console Bloomberg moderne.

**Le Ciel** = la zone centrale, viewport principal où s'affiche le
scénario en cours. C'est la "fenêtre" du cockpit, ce qu'on regarde
en pilotant. Tout le reste — instruments, onglets, barre d'état,
barre d'action — gravite autour pour servir cette zone.

Pas un panel SaaS plat. Un **espace habité** où chaque élément a
sa matière (bois, laiton, parchemin, cuir), son ombre, son grain.

---

## 9.1 — Concept et métaphore

> *Tu es Secrétaire général d'une organisation syndicale. Devant toi,
> un grand pupitre en chêne acajou. Au centre, un large folio en
> parchemin où le scénario se déroule — c'est **Le Ciel**, la fenêtre
> par laquelle tu regardes l'histoire qui se fait. Autour, des
> instruments en laiton qui mesurent l'état de ton organisation. Sur
> les côtés, des onglets en cuir qui ouvrent les pièces de ton siège.
> En haut, l'horloge analogique et la radio. En bas, le tampon de
> validation. Tu n'es pas dans un avion — tu es dans un **cockpit
> administratif et politique**.*

**Référence visuelle composite** :
- Bureau du Secrétaire général Bourse du Travail Paris (1960s).
- Console Bloomberg terminal (densité informationnelle, mais en bois).
- Cockpit de DC-3 (instruments analogiques, cadrans laiton).
- Tableau de bord Citroën DS (élégance française des années 60).
- Console NASA Mission Control Apollo (multi-écrans, hiérarchie
  visuelle stricte).

**Pourquoi cette métaphore ?** Trois raisons :

1. **Le Ciel comme focus permanent** — le scénario à choisir reste
   au centre du regard, jamais caché par un menu. Les autres
   éléments servent ce focus.
2. **Les instruments comme densité acceptable** — un cockpit assume
   sa densité informationnelle parce que chaque instrument a un
   rôle clair. Bourdieu (#50), Norman (#11), Tricot (#113) sont
   tous compatibles avec ce modèle si la révélation est progressive.
3. **Les matières comme signature Paritas** — bois acajou + laiton
   patiné + parchemin = continuité avec l'identité Cinzel + ❦
   fleuron + sceaux de cire des mini-jeux historiques.

---

## 9.2 — Layout général

Grille 12 colonnes × 8 rangées sur desktop. Trois zones fixes
(Barre d'état, Le Ciel + Instruments, Barre d'action) + deux
colonnes d'onglets latéraux.

```
┌──────────────────────────────────────────────────────────────────┐
│ BARRE D'ÉTAT (12 col × 0,5 row)                                  │
│ 🕰 1908 · Belle Époque · ☁ Calme · ☀ · 🔔3 · ⚙                  │
├──┬────────────────────────────────────────────────────────────┬──┤
│  │                                                            │  │
│ T│                                                            │ T│
│ A│              LE CIEL                                       │ A│
│ B│              (viewport scénario, parchemin crème)          │ B│
│ S│                                                            │ S│
│  │  Titre du scénario · 1908 · Vizille                        │  │
│ G│  ─────────────────────────────                             │ D│
│ A│  Texte narratif (Le Monde Livre, max 65ch)                 │ R│
│ U│  Citations cliquables vers glossaire                       │ O│
│ C│                                                            │ I│
│ H│  Voix intérieure (si Compulsif) — chuchote en italique     │ T│
│ E│                                                            │ E│
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                  │  │
│ 4│  │ ◯ A  │  │ ◯ B  │  │ ◯ C  │  │ ◯ D  │  Choix-cartes    │ 5│
│  │  └──────┘  └──────┘  └──────┘  └──────┘                  │  │
│ T│                                                            │ T│
│ A│                                                            │ A│
│ B│  [Toggle FALC : voir source ⚙]                             │ B│
│ S│                                                            │ S│
├──┴────────────────────────────────────────────────────────────┴──┤
│ INSTRUMENTS (12 col × 1 row)                                     │
│ 💰 Caisse · 🤝 Confiance · ⚖ Légitimité · 👥 Adhérents          │
│ ✊ Force int · 📢 Force ext · 📜 Mémoire · [🎭 Honte/Fierté caché]│
├──────────────────────────────────────────────────────────────────┤
│ BARRE D'ACTION (12 col × 0,5 row)                                │
│ ⏪ Tour 38/100 · Chap. III ▶▶  [VALIDER ●]  Auto · ⚡ 1× 2× 4×  │
└──────────────────────────────────────────────────────────────────┘
```

**Tabs gauches** (haut → bas, 4 onglets) :
- 💰 **Trésorerie** (Le Bureau du Trésorier — section 8.4)
- 🏛 **Mandat** (La Salle du Congrès — section 8.1)
- 🌍 **Monde** (La Carte — section 8.3)
- ✊ **Manifestation** (Le Cortège — section 8.5)

**Tabs droites** (haut → bas, 5 onglets) :
- 🏢 **Organisation** (Le Siège — section 8.2)
- 🎓 **Talents** (L'École Syndicale — section 8.7)
- 📢 **Meeting** (La Tribune — section 8.6)
- 📓 **Journal** (mémoire de partie, exports)
- ⚙ **Settings** (Réfléchi/Compulsif, FALC, accessibilité)

**Total** : 7 mini-jeux gestion + Journal + Settings = **9 onglets
permanents**. Plus les mini-jeux historiques (Table, QPC, Voix,
etc.) qui s'ouvrent depuis Le Ciel quand le scénario les déclenche.

---

## 9.3 — Le Ciel — viewport central

C'est la zone la plus large (~60 % de l'écran desktop, 100 % mobile).
C'est ici que le scénario se présente, que le joueur lit, que les
choix se font. Tout le reste sert cette zone.

### Composants

1. **Titre du scénario** : typo *Cinzel* ou serif d'époque selon ère
   (Romain du Roi pour 1864, Bodoni pour 1944, Le Monde Livre pour
   2017). H1, 32 px, semi-bold.
2. **Sous-titre** : date + lieu en italique 18 px.
3. **Texte narratif** : *Le Monde Livre* serif, 18 px, line-height
   1.6, justifié, **max 65 ch** (Dehaene #56, Tricot #113).
4. **Citations historiques** : encadré filet doré 1 px, *Garamond
   italique*, cliquables → ouvre la fiche glossaire en tooltip.
5. **Choix-cartes** : 2-4 cartes flottantes en bas, chacune avec
   icône + libellé court (max 12 mots).
6. **Voix intérieure** (si Compulsif activé) : texte italique
   chuchoté sous chaque choix-carte, en alternance.
7. **Toggle FALC** : en haut à droite — petit bouton "voir le texte
   source" (Rudin #64). Au clic : split-view source/reformulé.

### Esthétique

- **Fond** : parchemin crème vergé (#F4EFE2), légère texture bruit
  alpha 3 % pour rendre la matière.
- **Gradient subtil** : haut un peu plus clair (#F8F4E8), bas
  légèrement assombri (#E8DCC8) — métaphore d'horizon.
- **Marges intérieures** : 60 px haut/bas, 80 px gauche/droite (mode
  desktop). Mobile : 24 px partout.
- **Pas d'ombre interne agressive** — Le Ciel est plat, propre.

### Interactions

- **Hover sur citation** : tooltip avec définition glossaire
  (Charlot #115).
- **Hover sur choix-carte** : la carte se soulève (translate-Z 8px,
  +5 % scale, 200 ms easing). En mode Réfléchi : preview des jauges
  qui vont bouger. En mode Compulsif : voix intérieure qui aime ce
  choix s'illumine côté approprié.
- **Click sur choix-carte** : sélectionne (border doré, pulse). Le
  bouton VALIDER en barre d'action commence à pulser. Choix
  modifiable jusqu'à validation.
- **Click sur VALIDER** : carte choisie s'envole vers Le Ciel
  (animation 600 ms easing-in), les autres s'estompent (400 ms),
  texte de conséquence apparaît en typewriter (4 mots/s).

---

## 9.4 — Les Instruments — jauges permanentes

Ligne en bas du Ciel, fond bois clair (#C9A878). 7 instruments
visibles + 1 caché.

| Jauge | Icône | Format | Couleur | Visible dès |
|---|---|---|---|---|
| Caisse | 💰 sceau pièce | Chiffre (F/€) | Or #C9B26A | Tour 1 |
| Confiance | 🤝 poignée main | Cadran 0-100 | Bleu #1E5C8A | Tour 1 |
| Adhérents | 👥 silhouettes | Chiffre + Δ | Vert #3A6B47 | Tour 5 |
| Légitimité | ⚖ balance | Cadran 0-100 | Pourpre #5C2D5C | Tour 10 |
| Force interne | ✊ poing levé | Cadran 0-100 | Rouge #8B1F1B | Tour 15 |
| Force externe | 📢 porte-voix | Cadran 0-100 | Orange #D9821C | Tour 20 |
| Mémoire | 📜 parchemin | Chiffre cumul | Sépia #7A5C3A | Tour 25 |
| Honte/Fierté | 🎭 masque | Cadran 0-100 | Noir/Or | **Épilogue** (Ernaux #99) |

### Présentation

Chaque jauge dans un **cadran laiton** (style horloge ancienne),
diamètre 56 px desktop, avec **aiguille analogique** SVG qui pointe
la valeur. Cadran patiné (#B09150), aiguille noire fine, chiffres
gravés.

**Animation d'évolution** : aiguille qui bouge avec **inertie**
(easing 300 ms, légère oscillation 1 Hz amortie).

### Interactions

- **Hover** : tooltip flottant avec valeur exacte + Δ dernier tour +
  petit graph sparkline 5 derniers tours.
- **Click** : zoom sur le détail (modal full screen) avec historique
  complet, sources d'évolution (qui contribue), projection 5 tours.
- **Right-click / long-press** : menu radial 4 options (Zoom,
  Projection, Sources, Épingler).
- **Aiguille en zone rouge** (par exemple Caisse < 10 % du max) :
  cadran clignote 1 Hz, alerte visuelle.
- **Δ massif** (>20 % en un tour) : flash bref jaune sur l'instrument.

### Révélation Norman

Au tour 1, **seulement 2 instruments** (Caisse + Confiance). Les
autres apparaissent un par un, à des milestones narratives, avec
animation **pop-in + halo doré** + petit message contextuel
("Légitimité : nouvelle ressource débloquée. C'est ta crédibilité
publique."). Ernaux #99 satisfaite : Honte/Fierté reste cachée
jusqu'à l'épilogue.

---

## 9.5 — Tabs latéraux — accès aux 7 mini-jeux

Sur les côtés du Ciel, des **onglets en cuir** (texture rivetée,
comme un dossier classeur). Chaque onglet correspond à un mini-jeu
gestion (section 8) ou utilitaire (Journal, Settings).

### Layout

- **4 onglets gauche** (Trésorerie / Mandat / Monde / Manifestation).
- **5 onglets droite** (Organisation / Talents / Meeting / Journal /
  Settings).
- Chaque onglet : 56 px haut, largeur 24 px (visible) qui s'étend à
  72 px au hover (avec libellé qui apparaît).

### États

- **Inactif** : couleur cuir naturel terne (#3D2615).
- **Hover** : couleur cuir tiré (#5C3622) + relief +2 px translate
  vers l'intérieur. Libellé apparaît en typo Inter 14 px blanc cassé.
- **Notification** : un petit point rouge (4 px diamètre) clignote
  sur l'onglet (par exemple Mandat = "élection interne dans 3 tours").
- **Désactivé** : cuir grisé, opacity 0.4, tooltip explique pourquoi
  (par exemple "Talents disponible dès le tour 8 — déverrouillé par
  l'ouverture de l'École Syndicale").

### Animation d'ouverture

Au clic sur un onglet :
1. L'onglet se **détache** du bord (translate +8 px, 200 ms easing).
2. Le panneau du mini-jeu **glisse** depuis le côté (slide 300 ms,
   `cubic-bezier(0.25, 0.46, 0.45, 0.94)`).
3. Le Ciel s'**estompe** en arrière-plan (opacity 1 → 0.15, blur 0
   → 8 px, 400 ms).
4. Les instruments se **compactent** vers le bord opposé (translate
   400 ms).
5. Une **bordure dorée** (1 px #C9B26A) encadre le mini-jeu avec un
   léger glow (200 ms fade-in).
6. Le mini-jeu prend **sa propre identité visuelle** (Le Bureau du
   Trésorier en chêne acajou, Le Siège en isométrique, etc.).

### Animation de fermeture

X en haut à droite du mini-jeu, ou clic en dehors du panneau :
1. Mini-jeu glisse vers le bord (300 ms inverse).
2. Le Ciel se révèle (opacity → 1, blur → 0, 400 ms).
3. Instruments reviennent à leur place (300 ms).
4. Aiguilles des instruments **s'ajustent** si modifiées par le
   mini-jeu (animation inertie 500 ms).

### Déverrouillage progressif

Au tour 1, **seulement 2 onglets actifs** (Trésorerie + Settings).
Les autres se déverrouillent par milestone narratif :

| Onglet | Déverrouillage |
|---|---|
| Trésorerie | Tour 1 (toujours) |
| Settings | Tour 1 (toujours) |
| Journal | Tour 1 (mais vide) |
| Mandat | Tour 5 (premier congrès) |
| Talents | Tour 8 (ouverture École) |
| Organisation | Tour 12 (premier achat siège) |
| Manifestation | Tour 18 (première grève) |
| Meeting | Tour 25 (première campagne) |
| Monde | Tour 30 (premier déploiement régional) |

À chaque déverrouillage : **animation halo doré** sur l'onglet +
**toast notification** ("Tu peux maintenant gérer tes Talents —
ouvre l'onglet pour découvrir l'École Syndicale") + **point
d'orientation** (pulse 1 Hz pendant 30 s).

---

## 9.6 — Barre d'état (top)

Ligne en haut, fond bois sombre (#3D2A1A), hauteur 48 px desktop.
Composants gauche → droite :

1. **🕰 Date & ère** : "1908 · Belle Époque" en *Garamond* 16 px.
   Click → ouvre la chronologie complète (modal avec timeline
   horizontale des 100 tours, scénarios déjà joués marqués).
2. **Mood actuel** : icône + nom (☁ Calme, ⚡ Tendu, 💔 Grave,
   🌅 Euphorique, 🌧 Mélancolique). L'icône **anime** selon le mood
   (glow doux Brian Eno pour Calme, pulsation rapide pour Tendu,
   etc.).
3. **Météo** : si déclenchée par scénario (☀ ☁ 🌧 ❄). Optionnel.
4. **Notifications** : 🔔 cloche avec badge si non-lus. Click →
   panneau latéral avec liste des derniers événements + accès rapide.
5. **Settings** : ⚙ engrenage. Click → ouvre l'onglet Settings.

L'**horloge** à gauche est analogique (vraies aiguilles SVG, taille
24 px) — tic-tac discret en audio bg (-30 dB).

---

## 9.7 — Barre d'action (bottom)

Ligne en bas, fond bois clair (#C9A878), hauteur 56 px desktop.
Composants :

1. **⏪ Tour actuel / total** : "Tour 38/100" + barre de progression
   sous-jacente fine (3 px haut).
2. **Chapitre courant** : "Chap. III — La protection statutaire"
   (Castel #85). Cliquable → résumé du chapitre.
3. **● VALIDER** : grand bouton central style **cachet de cire**
   (rond 48 px, couleur cire rouge sang #7A1E1B). Pulse doux
   (1 Hz) quand un choix est fait dans Le Ciel et non encore
   validé. Au clic : *thump* audio + animation cire qui s'écrase.
4. **Auto** : toggle pour mode auto-play debug (Cheng #194). Style
   bouton interrupteur laiton.
5. **⚡ Vitesse** : 1× / 2× / 4× pour mini-jeux longs (Manifestation,
   Meeting). Le 4× désactive les animations d'attente, conserve les
   décisions à pleine vitesse.
6. **🔄 Replay** : bouton retour au tour précédent (avec
   confirmation modale, **pénalité Honte/Fierté +5**).

---

## 9.8 — Menus contextuels et radial

### Hover sur instrument

Tooltip flottant 200 px avec :
- Valeur exacte (ex. "Caisse : 1 245 000 F").
- Δ dernier tour ("+50 000 depuis tour 37").
- Sparkline 5 derniers tours (mini-graph 80×20 px).
- Source dominante d'évolution ("← Cotisations annuelles").

### Long-press / right-click sur instrument

**Menu radial** 4 options en cercle (ouverture animation 200 ms
expansion radiale) :
- 🔍 **Zoom** (modal détail historique complet).
- 📈 **Projection** (extrapolation 5 tours basée sur tendance).
- 🔗 **Sources** (qui contribue à cette jauge ce tour).
- 📌 **Épingler** (la jauge reste visible plus grande).

### Hover sur choix-carte

- **Mode Réfléchi** : preview des jauges qui vont bouger (mini-icônes
  Δ ±N à côté de chaque ressource concernée, fade-in 300 ms).
- **Mode Compulsif** : voix intérieure qui aime ce choix s'illumine
  côté approprié (gauche/droite selon profil), citation italique
  apparaît sous la carte.

### Right-click sur Le Ciel

Menu vertical avec 5 options :
- 🔎 Glossaire (recherche terme)
- 💾 Sauvegarde rapide
- 📝 Notes personnelles (bloc-notes joueur, persistant)
- 🔇 Couper le son (toggle audio)
- 🐛 Mode debug (si activé en Settings)

---

## 9.9 — Mode focus mini-jeu

Quand un mini-jeu (gestion ou historique) s'ouvre, le cockpit
**s'éclipse** pour donner toute la place au mini-jeu :

1. **Le Ciel + Instruments + Tabs** → opacity 0.15, blur 8 px en
   400 ms.
2. **Mini-jeu** → plein écran avec son propre décor (Salle du
   Congrès en amphi rouge, Le Siège isométrique, Le Cortège
   boulevard parisien, etc.).
3. **Bordure dorée** discrète (1 px #C9B26A + glow 4 px) encadre le
   mini-jeu (signal visuel : "tu es dans un instrument").
4. **X en haut à droite** pour fermer / retour au cockpit
   (animation inverse 600 ms easing-out).
5. **Sons du cockpit** (tic-tac, bg ambient) → fade vers -∞ en
   400 ms ; sons du mini-jeu prennent le dessus.

À la fermeture : transition retour 600 ms, Le Ciel se révèle,
**les aiguilles bougent visiblement** si modifiées (effet
satisfaisant : tu vois l'impact systémique de ton mini-jeu).

---

## 9.10 — Onboarding progressif (révélation Norman)

L'interface se déploie au fil des tours. Au tour 1, **un débutant
voit un cockpit minimal**. Au tour 30, c'est le cockpit complet.

| Tour | Éléments visibles |
|---|---|
| 1 | Le Ciel + 2 instruments (Caisse, Confiance) + 2 tabs (Trésorerie, Settings) + Barre action minimale |
| 5 | + Adhérents (instrument) + Mandat (tab) |
| 8 | + Talents (tab) |
| 10 | + Légitimité (instrument) |
| 12 | + Organisation (tab) |
| 15 | + Force interne (instrument) |
| 18 | + Manifestation (tab) |
| 20 | + Force externe (instrument) |
| 25 | + Mémoire (instrument) + Meeting (tab) |
| 30 | + Monde (tab) — interface complète |
| Épilogue | + Honte/Fierté (jauge cachée révélée) |

À chaque déverrouillage :
- **Animation pop-in** sur l'élément (200 ms easing-out).
- **Halo doré** (1 s, fade out).
- **Toast notification** avec contexte ("Force interne — nouvelle
  ressource. Mesure la cohésion entre toi et ta base.").
- **Audio cue** : *ding* discret 800 Hz (-15 dB).

Mitra (#119 ×2) demande tutoriel skip-ready : un bouton "Mode
expert — tout afficher dès le tour 1" disponible dans Settings au
premier lancement.

---

## 9.11 — Modes Réfléchi / Compulsif (atmosphère du cockpit)

Le cockpit a deux **ambiances** lumineuses, basculables à tout
moment depuis Settings (Grandin #89).

### Mode Réfléchi

- **Lumière chaude jaune** (2700 K, simulée par overlay #F4D78C
  3 % alpha sur tout le cockpit).
- **Instruments brillent doucement**, lecture facile, contrastes
  doux.
- **Audio** : tic-tac discret (-30 dB), papiers, calme. Aucune voix
  intérieure.
- **Choix-cartes** : preview des conséquences affichée au hover.
- **Effet** : sentiment de bureau studieux, posé, pédagogique.

### Mode Compulsif

- **Lumière plus contrastée** : ombres plus marquées, halos plus
  serrés.
- **Instruments pulsent** plus visiblement (battements de cœur 1 Hz,
  ±3 % opacity).
- **Audio** : tic-tac plus présent (-20 dB), voix intérieures
  murmurent en bg (loop 8 s, à -30 dB par défaut, +volume si tu
  cliques sur la voix).
- **Choix-cartes** : pas de preview (intuition seule, plus
  émotionnel).
- **Voix intérieures** s'affichent en italique sous chaque choix.
- **Mode légèrement vibratoire** : micro-shake 0,5 px CSS sur le
  cockpit, +10 % opacity sur les ombres.
- **Effet** : sentiment de pression émotionnelle, voix qui
  s'opposent, immersion.

### Switch animation

1 s de transition entre les deux ambiances : la lumière bascule en
crossfade, les instruments s'ajustent, le tic-tac change de
volume. Damasio (#58) et Naccache (#57) confirment : la transition
elle-même est une expérience (passage du cerveau Système 2 →
Système 1).

---

## 9.12 — Responsive (desktop / tablet / mobile)

### Desktop (>1200 px)

Layout cockpit complet 12 col × 8 row. Tous les éléments visibles
simultanément. Cible : MacBook Pro 14"+, iMac, écran externe.

### Tablet (768-1199 px, iPad)

- **Tabs latéraux** deviennent un **drawer** (slide depuis le bord,
  ouvert à la demande via bouton de bord).
- **Instruments** compactés sur 2 lignes (au lieu de 1).
- **Le Ciel** reste central mais réduit à ~70 % width.
- **Barre d'état** et **Barre d'action** conservées.

### Mobile (<768 px, iPhone)

- **Le Ciel** prend 100 % width, occupe la majorité de l'écran.
- **Instruments** dans un **panneau dépliable en haut** (1 ligne
  réduite par défaut, déploie à 2 lignes au tap sur la flèche
  dépliante).
- **Tabs accessibles** via **burger menu** en haut à gauche (slide
  drawer de la gauche).
- **Barre d'action** en bas (compactée à 40 px).
- **Mini-jeux** : prennent 100 % écran obligatoirement (pas de mode
  fenêtre).

Coutaz (#5 ×2) satisfaite : portrait étroit, radar trajectoires
correctement replié.

---

## 9.13 — Esthétique : matières et signature visuelle

### Matières de référence

- **Bois acajou** (#5A2F1C) : structures porteuses (Barre d'état,
  Barre d'action, pupitre).
- **Bois clair pin** (#C9A878) : surface du pupitre (Instruments).
- **Cuir** (#3D2615) : onglets latéraux (Tabs).
- **Laiton patiné** (#C9B26A → #B09150) : cadrans des instruments,
  bordures dorées des mini-jeux ouverts.
- **Parchemin crème vergé** (#F4EFE2) : Le Ciel.
- **Verre subtil** (#A8C8D8 transparent 12 %) : overlays modaux.
- **Cire rouge sang** (#7A1E1B) : bouton VALIDER (cachet).

### Effet de profondeur

- **Léger drop-shadow** sur les éléments en relief (instruments,
  cartes-choix, onglets actifs) : `box-shadow: 0 4px 12px
  rgba(0,0,0,0.15)`.
- **Ombres internes** sur les cadrans (donnent l'impression
  d'instruments physiques) : `inset 0 2px 4px rgba(0,0,0,0.20)`.
- **Pas de skeuomorphisme excessif** (sobriété — Vignelli #8) : on
  suggère la matière par la couleur et l'ombre, pas par des
  textures hyper-détaillées.

### Typographie hiérarchisée

- **Titre scénario** (Le Ciel) : *Cinzel* ou serif d'époque, 32 px
  semi-bold.
- **Sous-titre** : italique 18 px.
- **Corps narratif** : *Le Monde Livre*, 18 px, line-height 1.6.
- **Citations** : *Garamond italique*, 16 px, encadré filet doré.
- **UI labels** (boutons, tabs, instruments) : *Inter*, 14 px
  medium.
- **Chiffres comptables** (Caisse, Adhérents) : *Courier Prime*,
  16 px.

Trois familles, jamais plus (Vignelli #8 direct).

---

## 9.14 — Animations d'ouverture des menus

Catalogue des animations principales du cockpit :

### Tab latéral qui s'ouvre

1. L'onglet sélectionné se **détache** du bord (translate +8 px,
   200 ms easing).
2. Le panneau du mini-jeu **glisse** depuis le côté (slide 300 ms,
   `cubic-bezier(0.25, 0.46, 0.45, 0.94)`).
3. Le Ciel **s'estompe** en arrière-plan (opacity 1 → 0.15, blur 0
   → 8 px, 400 ms).
4. Les instruments se **compactent** (translate vers le bord opposé,
   250 ms).
5. **Bordure dorée** du mini-jeu apparaît avec léger glow (200 ms).

### Menu radial sur instrument

1. Long-press / right-click → 4 icônes apparaissent en cercle autour
   du curseur.
2. **Animation expansion radiale** : depuis le centre, 200 ms,
   easing-out.
3. Hover sur une icône : agrandissement +10 % + label en tooltip.
4. Click : action exécutée + radial se referme (200 ms inverse).

### Notification toast (déverrouillage)

1. Halo doré pulse sur le nouvel élément (500 ms, fade out).
2. Toast slide depuis le haut (300 ms easing).
3. Auto-dismiss après 6 s, ou clic pour fermer.
4. Audio *ding* 800 Hz (-15 dB).

### Validation d'un choix

1. Carte sélectionnée pulse 1 fois (scale 1.05 → 1, 200 ms).
2. Bouton VALIDER pulse en bas (1 Hz jusqu'au clic).
3. Au clic : carte choisie **s'envole** vers Le Ciel (animation
   600 ms easing-in, suit une courbe de Bézier vers le haut).
4. Cartes non-choisies **s'estompent** (400 ms).
5. Texte de conséquence apparaît dans Le Ciel (typewriter 4 mots/s).
6. Instruments mettent à jour leurs aiguilles (300 ms inertie).
7. Audio : *thump* du cachet de cire + *plume sur papier* pour le
   typewriter.

### Mode focus mini-jeu

Détaillé en section 9.9. ~600 ms total entrée + sortie.

### Switch Réfléchi/Compulsif

Détaillé en section 9.11. 1 s crossfade.

---

## 9.15 — Accessibilité du cockpit (WCAG 2.2 AA)

Conçu dès l'esquisse, pas adapté ensuite.

### Navigation clavier

- **Tab** : parcourt tous les éléments interactifs (Le Ciel → cartes-
  choix → bouton Valider → instruments → tabs → barre état → barre
  action).
- **Espace** : active l'élément focalisé.
- **Flèches** : navigation entre cartes-choix dans Le Ciel.
- **Échap** : ferme un mini-jeu ouvert (retour cockpit).
- **Ctrl/Cmd + N** : ouvre un onglet par numéro (1-9 pour les 9
  tabs).

### Lecteurs d'écran (NVDA, JAWS, VoiceOver)

- **`aria-live="polite"`** sur Le Ciel : changements de scénario
  annoncés.
- **`aria-label`** détaillés sur chaque instrument (ex. "Caisse :
  un million deux cent quarante-cinq mille francs, hausse de
  cinquante mille depuis le tour précédent").
- **`role="navigation"`** sur les tabs.
- **Éléments décoratifs** (bois, laiton, ombres, textures) marqués
  `aria-hidden="true"`.
- **Mode Compulsif étiqueté** : *« voix intérieures du joueur — non
  destinées à la lecture »* (Watson #192).

### Mode contraste élevé

Toggle dans Settings. Remplace :
- Textures bois/cuir/parchemin → couleurs unies.
- Ombres → bordures noires nettes (2 px).
- Couleurs des jauges → palette WCAG AAA (jaune sur noir, blanc sur
  bleu profond).

### Mode lent

Toggle dans Settings. Toutes les animations à **50 % de vitesse**
(durées doublées).

### Mode FALC

Déjà en place dans le moteur Paritas. Toggle visible en haut du
Ciel (Rudin #64).

### Couleurs des camps configurables

Tammet (#92). Settings → palette personnalisée (rouge/bleu modifiable).

---

## 9.16 — Effort design + dev

| Bloc | Dev | Design |
|---|---|---|
| Layout général + grille responsive | 4 j | 1 j |
| Le Ciel (viewport + cartes-choix + typewriter) | 3 j | 1,5 j |
| Instruments (7 jauges + cadrans laiton + animations aiguilles) | 3 j | 2 j |
| Tabs latéraux (9 tabs + slide animations + déverrouillage progressif) | 2 j | 1 j |
| Barre d'état + Barre d'action | 1,5 j | 0,5 j |
| Menus contextuels + menu radial sur instruments | 1,5 j | 0,5 j |
| Onboarding progressif (révélation Norman) | 2 j | 0,5 j |
| Mode Réfléchi/Compulsif (ambiances lumineuses) | 1,5 j | 1 j |
| Animations d'ouverture (catalogue 6 anims) | 2 j | 1 j |
| Accessibilité WCAG AA (clavier, NVDA, contraste, lent) | 1 j | 0,3 j |
| Esthétique assets (bois, laiton, cuir, parchemin SVG) | — | 2,5 j |
| **TOTAL** | **~21,5 j** | **~11,3 j** |

**Total cockpit : ~33 j-dev + ~11,3 j design = ~45 j (~9 sem temps
plein)**.

C'est l'**infrastructure UI** qui héberge tous les mini-jeux. À
traiter **en parallèle de la vague α** (vague α-bis), ou comme
**vague préalable** très tôt dans le projet — sans cockpit, les
mini-jeux n'ont pas de maison.

### Principe critique

**Les mini-jeux sont conçus pour s'ouvrir DANS le cockpit**, pas en
remplacement. Si un mini-jeu prend le contrôle complet de l'écran
et oublie le cockpit, le joueur perd son fil. Le cockpit doit
toujours être **rappelé** (bordure dorée, X de fermeture, sons du
mini-jeu en avant-plan mais cockpit jamais détruit en mémoire).

---

# 10. Principes de design systémique authentique

Sept règles que **chaque mini-jeu** doit respecter, sinon il
n'est pas systémique mais décoratif :

1. **Effets durables**. Le mini-jeu modifie au moins une
   ressource du moteur principal pour ≥ 3 tours suivants.
   Contre-exemple à éviter : un mini-jeu qui produit juste un
   « bien joué » sans conséquence.
2. **Réutilisation des ressources existantes**. Pas de jauge
   nouvelle ad-hoc créée pour le mini-jeu. Les jauges nouvelles
   sont **structurelles** (Honte/Fierté, Plasticité institutionnelle)
   et **traversent le moteur**, pas un mini-jeu isolé.
3. **Rejouable en mode debug**. Tout mini-jeu peut être relancé
   avec un seed précis (Pineau, Doudna). Permet l'audit, la
   stabilité par perturbation, l'étude RCT (Duflo).
4. **Étiqueté pour export RCT**. Chaque action du mini-jeu est
   loggée avec timestamp, type, arguments. Format JSON anonyme
   exportable.
5. **Interactions inter-mini-jeux**. Au minimum 3 paires de
   mini-jeux qui se *parlent* :
   - V2-2 (1940 Le Piège) → V2-3 (1945 Table) : la dette de 1940
     conditionne la position d'ouverture en 1945.
   - V2-4 (1995 Voix Intérieures) → conséquences 2008
     (représentativité loi Bertrand).
   - V2-5 (2017 QPC) → V2-7 (2030+ Signaux Faibles) : si la QPC
     a réussi, l'option « cadre constitutionnel solide » est
     disponible en 2030.
6. **Authenticité historique**. Pas d'option fantaisiste. Si une
   issue n'est pas historiquement attestée, elle est marquée
   *uchronie* et a une probabilité < 5 %, avec un texte explicite
   (« et si... ») qui distingue ce chemin du tronc historique.
7. **Authenticité émotionnelle**. Le mode Compulsif (voix
   intérieures) est intégré au mini-jeu, pas en parallèle. La
   Table : voix intérieure quand on bluff. V2-4 : duel intérieur.
   V2-2 : voix de la dette qui parle en 1944.

---

# 11. Roadmap V2 — 11 vagues sur ~38 semaines

Plan de livraison séquencé pour un solo dev. Chaque vague :
**objectif, durée, livrables, dépendances, validation**. Cette
roadmap intègre **7 mini-jeux historiques (section 7) + 7 mini-jeux
de gestion permanente (section 8) + l'interface Cockpit (section 9)**
dans 11 vagues sur ~38 semaines (~9-10 mois).

**Vagues α + α-bis** s'exécutent **en parallèle si ressources
double** : la fondation moteur (α) ne dépend pas du cockpit
(α-bis), et inversement le cockpit peut se développer sur des
mocks de données moteur.

## Vague α — Fondation systémique (3-4 sem · ~14 j-dev)

**Objectif** : poser les briques avant de construire les mini-jeux.

**Livrables** :
- `docs/MOTEUR_SPEC.md` (Knuth #1, Berry #4) — invariants et
  transitions interdites du moteur de scénarios.
- Refonte Rapport de force → *interne* + *externe* (Omnès #88,
  Yon #150).
- 7e jauge cachée Honte/Fierté (Ernaux #99).
- Capitaux Bourdieu en infobulles sur les 6 ressources (Bourdieu
  #50).
- Justifications Boltanski (industrielle / civique / marchande)
  affichées en mode Réfléchi (Boltanski #52).
- Seed reproductible + export JSON anonyme (Pineau #65, Duflo
  #94).
- Mode auto-play debug minimal (Cheng #194, Arnold #158).
- **Suppressions immédiates** (P0) : gradient or PARITAS,
  anglicismes, letter-spacing 0.18em, Marseillaise par défaut
  landing, formulation négative "pas un divertissement".

**Dépendances** : aucune (vague de fondation).

**Validation** : 5 testeurs internes, golden-path stable.

## Vague α-bis — Interface Cockpit (5-6 sem · ~33 j-dev + 11,3 j design)

**Objectif** : livrer le pupitre paritaire qui hébergera tous les
mini-jeux. **En parallèle de α** si ressources double.

**Livrables** :
- Layout général (12 col × 8 row, responsive desktop/tablet/mobile)
  + grille (Coutaz #5).
- **Le Ciel** : viewport scénario, choix-cartes, typewriter, FALC
  toggle (Rudin #64).
- **7 Instruments** (Caisse, Confiance, Adhérents, Légitimité, Force
  int/ext, Mémoire) en cadrans laiton avec aiguilles analogiques —
  Honte/Fierté caché jusqu'à épilogue (Ernaux #99).
- **9 Tabs latéraux** (4 gauche + 5 droite) avec animations slide
  300 ms et déverrouillage progressif.
- **Barre d'état** (date, ère, mood, météo, notifications) avec
  horloge analogique + tic-tac audio.
- **Barre d'action** (tour, chapitre, bouton VALIDER cachet de cire,
  Auto, vitesse, replay).
- **Menus contextuels** + menu radial sur instruments (long-press /
  right-click).
- **Onboarding progressif** (Norman #11) : tour 1 = 2 instruments +
  2 tabs ; déverrouillage par milestone narratif.
- **Mode Réfléchi/Compulsif** (Grandin #89) : ambiances lumineuses
  bascule à tout moment.
- **Animations d'ouverture** (catalogue 6 anims documentées).
- **Accessibilité WCAG 2.2 AA** (clavier, NVDA, contraste, mode
  lent, FALC, couleurs configurables Tammet #92).
- **Assets esthétiques** : bois acajou + laiton patiné + cuir +
  parchemin SVG.

**Dépendances** : aucune (peut développer sur mocks de données
moteur). Idéal en parallèle de α.

**Validation** : 5 testeurs jouent un golden-path complet en
cockpit + 1 testeur en NVDA + 1 testeur mobile. Critère :
révélation Norman fonctionnelle (aucune saturation au tour 1).

## Vague β — Mini-jeux gestion ESSENTIELS (4 sem · ~19 j-dev)

**Objectif** : poser les 3 mini-jeux de gestion qui alimentent
toutes les autres orgs. Sans eux, les mini-jeux historiques sont
hors-sol.

**Livrables** :
- **8.4 TRÉSORERIE — Le Bureau du Trésorier** (6,1 j total : 3,5 j
  dev + 2,6 j design). Premier mini-jeu de gestion : si la Caisse
  est vide, rien ne tourne.
- **8.7 TALENTS — L'École Syndicale** (5,7 j : 3,5 j + 2,2 j).
  Sans formation, pas de relève pour la Table 1945.
- **8.1 MANDAT — La Salle du Congrès** (7,4 j : 4 j + 3,4 j). Sans
  Mandat, pas de Légitimité durable.

**Dépendances** : vague α (jauges nouvelles).

**Validation** : 5 testeurs internes jouent 10 cycles annuels
Trésorerie + Mandat + Talents et la boucle est cohérente.

## Vague γ — Mini-jeux scénarios solo simples (3-4 sem · ~7 j-dev)

**Objectif** : éprouver le format mini-jeu historique. Chaque
scénario consomme les ressources accumulées en β.

**Livrables** :
- **V2-1** 1864 Statut Juridique (1,5 j) — premier test du format
  4 issues × 6 écrans. Consomme Caisse de Trésorerie.
- **V2-4** 1995 Voix Intérieures duel (3 j) — premier test du
  Compulsif systémique. Pression interne pesée par Mandat.
- **V2-6** Mitbestimmung Congrès BIT (2 j) — premier test du
  diagnostic comparatif IA. Demande accord EU préalable
  (préfigure Monde).
- Polissages cycle 1+2 audio (audit) traités : wet mélancolique,
  high-shelf tendu, distanceFilter 1.6 kHz.

**Dépendances** : vague α (jauges) + vague β (Trésorerie, Talents,
Mandat).

**Validation** : alpha sur panel restreint (Romero #22, Castel #85,
Charpentier #157, Berger #121).

## Vague δ — Mini-jeux gestion EXTENSIBLES (3-4 sem · ~16,4 j-dev)

**Objectif** : étendre la boucle de gestion à l'organisation
physique et à la dimension géographique.

**Livrables** :
- **8.2 ORGANISATION — Le Siège** (9,3 j : 5 j + 4,3 j). Bâtiment
  isométrique, pièces achetables, vie permanente.
- **8.3 MONDE — La Carte** (7,1 j : 4 j + 3,1 j). Carte France +
  EU stylisée Hérodote, déploiement régional + accords EU.

**Dépendances** : vague β (Trésorerie alimente les achats
d'Organisation et Monde).

**Validation** : tester boucle complète gestion (5 mini-jeux) sur
20 cycles annuels. Vérifier cohésion économique.

## Vague ε — Mini-jeux scénarios à effets différés (4 sem · ~9 j-dev)

**Objectif** : système « dette » Bateson (double-bind) — premiers
scénarios vraiment systémiques avec effets temporels.

**Livrables** :
- **V2-2** 1940 Le Piège (3 j) avec dette épuration en 1944.
- **V2-5** 2017 QPC + recours européens (4 j). Consomme juristes
  formés en Talents, Caisse de Trésorerie.
- Liens systémiques :
  - 1995 → 2008 (représentativité loi Bertrand) (1 j).
  - 1940 → 1944 (épuration / défense) (1 j).

**Dépendances** : vagues α (Compulsif), β (Talents juridiques),
γ (format mini-jeu maîtrisé).

**Validation** : test système dette avec Bateson #104, Romero #22,
Henriot #169, Lokiec #174.

## Vague ζ — La Table des Négociations alpha solo (3-4 sem · ~10,5 j-dev)

**Objectif** : module central, version solo + IA + hot-seat. Pas
encore d'online. **Jalon majeur de V2**.

**Livrables** :
- Engine + types (1,5 j).
- UI Svelte vue table circulaire (2 j).
- Mode IA Mistral/Haiku/Templates avec 4 personas 1945 (2 j).
- Mode hot-seat PIN (1 j).
- Templates fallback (0,5 j).
- Accessibilité WCAG AA (0,5 j).
- Replay JSON (0,5 j).
- Contenu V2-3 1945 4 figures (3 j). Les 4 architectes sont
  pré-sélectionnés depuis Talents (boucle systémique).

**Dépendances** : vagues α (jauges, seed), β (Talents fournit
architectes), γ (format mini-jeu).

**Validation** : panel restreint de 11 personas portant les 5
piliers de design (Romero, Castel, Friot, Valat, Aglietta,
Boltanski, Bourdieu, Bateson, Mead, Sid Meier, Kojima). Si
adhésion ≥ 8/11, **release alpha publique**.

## Vague η — Mini-jeux gestion AVANCÉS + Table en ligne (4 sem · ~26,3 j-dev)

**Objectif** : terminer la boucle de gestion (Manifestation +
Meeting) ET ouvrir la Table au multijoueur en ligne.

**Livrables — gestion** :
- **8.5 MANIFESTATION — Le Cortège** (10,9 j : 6 j + 4,9 j).
  Consomme Caisse de grève accumulée en Trésorerie.
- **8.6 MEETING — La Tribune** (8,4 j : 4,5 j + 3,9 j). Consomme
  budget Communication. Talents oratoires boostent.

**Livrables — Table en ligne** (~7 j) :
- WebSocket Durable Objects (2,5 j).
- Matchmaking par scénario + ELO (1 j).
- Anti-griefing (bot après 30 s) + sécurité (1 j).
- Replay R2 anonyme (0,5 j).
- Coalition privée chat (0,5 j).
- Réutilisation Table sur 1936, 1947, 2013, 2017 — coût marginal
  ~0,5 j × 4 = 2 j (4 sets de personas + lignes rouges).

**Dépendances** : vague β (Trésorerie pour Manifestation, Caisse
grève), vague ζ (Table alpha validée).

**Validation** : tournoi interne 16 joueurs sur Table 1947 en
hot-seat puis online. Manifestation et Meeting testés sur 5
scénarios chacun.

## Vague θ — Scénario prospectif V2-7 (3 sem · ~8 j-dev)

**Objectif** : pari long terme — premier scénario non historique
jouable.

**Livrables** :
- 5 cartes signaux faibles + amplification (3 j).
- 3 IA prospectives non-déterministes (Mistral) (3 j).
- 3 jauges nouvelles : Plasticité, Vitesse, Acceptabilité (1 j).
- Ending V3 conditionnel (refondation, mission economy,
  effondrement, sécession EU) (1 j).

**Dépendances** : vague α (jauges). Vague η (Table en ligne — la
sécession EU appelle la Table sur Mitbestimmung). Tous les mini-jeux
gestion (V2-7 puise dans toutes les ressources accumulées).

**Validation** : panel futurologie (Harari, Webb, Brand,
Wendling, Stiegler, Kelly).

## Vague ι — Authenticité représentationnelle (4 sem · ~13 j-dev + 5 j piges)

**Objectif** : combler les manques cluster A (figures, postcolonial,
ambivalences).

**Livrables** :
- Lucie Baud + Henriette Carlier figures jouables (2 j).
- Postcolonialité : tour pivot dédié 1947 outre-mer (3 j) + pige
  histo (3 j).
- Marc Sangnier (christianisme social ~1900) (1 j).
- Figure CGC 1944 (cadres) (1 j).
- Inscriptions ambivalences bios (Vichy/Riom/Creusot) (1 j) +
  pige histo (2 j).
- Plus de violences de genre 1968+ (2 j) + pige sociologue (1 j).
- Solidaires/SUD (Duteil, Guilbert) (1 j).
- Variantes culturelles cérémonie de signature (Mead) (1 j).
- Couleurs camps configurables (Tammet) (1 j).

**Dépendances** : vague α (engine stable).

**Validation** : panel représentation
(Perrot, Binet, Sondra Perry, Boucheron, Valat, Chabanier,
Hommeril, Karikó, Guillaume, Béroud).

## Vague κ — Polissage final + audit V2 (3 sem · ~8 j-dev + 7 j piges)

**Objectif** : V2 prête pour communication grand public.

**Livrables** :
- Custom lettering PARITAS (Hische) — pige design ~3 j.
- Thème original landing (Derivière, Eno) — pige son ~3 j.
- Bruit blanc d'époque (Murch) — pige son ~1 j.
- Silence 2 s avant choix lourd (Yamaoka) (0,5 j).
- Streaming audio par chapitre (Eno) (1 j).
- Diacritiques Cinzel ou fallback Sabon (Tatiana Mac, Apeloig)
  (0,5 j).
- Performance mobile 3G (Friedman) — audit + fix (1 j).
- Radar mobile portrait étroit (Coutaz) (0,5 j).
- 5 chapitres avec cliffhangers (Sid Meier, Castel) (2 j).
- Trois âges Castel comme structure de chapitres (Castel) (1 j).
- Journal de jeu post-partie + cartes historiques (Cifali,
  McGonigal) (2 j).
- Mode express expert (Hess) (0,5 j).
- **Audit V2 cycle 3** : 22 testeurs + 10 critiques + 10 experts
  (parallèle à l'audit cycles 1-2 du moteur audio).

**Dépendances** : toutes les vagues précédentes.

**Validation** : audit V2 cycle 3 produit le go/no-go
communication grand public.

## Récap roadmap V2 (11 vagues sur ~38 semaines)

| Vague | Durée | J-dev | Piges | Livrable phare |
|---|---|---|---|---|
| α — Fondation systémique | 3-4 sem | ~14 j | — | Spec moteur, jauges nouvelles, suppressions P0 |
| **α-bis — Interface Cockpit** ★ | 5-6 sem | **~33 j + 11,3 j design** | — | **Pupitre Paritaire** (Le Ciel + Instruments + Tabs + animations) |
| β — Mini-jeux gestion ESSENTIELS | 4 sem | ~19 j | — | Trésorerie + Talents + Mandat |
| γ — Mini-jeux scénarios solo simples | 3-4 sem | ~7 j | — | V2-1 1864, V2-4 1995, V2-6 BIT |
| δ — Mini-jeux gestion EXTENSIBLES | 3-4 sem | ~16,4 j | — | Organisation (Le Siège) + Monde (La Carte) |
| ε — Mini-jeux scénarios différés | 4 sem | ~9 j | — | V2-2 Le Piège (dette 1944), V2-5 QPC |
| ζ — Table alpha solo | 3-4 sem | ~10,5 j | — | **★ La Table 1945 (solo+IA+hotseat)** |
| η — Mini-jeux gestion AVANCÉS + Table en ligne | 4 sem | ~26,3 j | — | Manifestation + Meeting + Table online + 4 réutilisations |
| θ — V2-7 prospectif | 3 sem | ~8 j | — | Signaux faibles + ending V3 |
| ι — Authenticité représentationnelle | 4 sem | ~13 j | ~5 j | Baud, Carlier, postcolonial, Sangnier, ambivalences |
| κ — Polissage + audit V2 | 3 sem | ~8 j | ~7 j | Custom lettering, thème original, audit cycle 3 |
| **TOTAL** | **~38 sem (~9-10 mois)** | **~164 j-dev + 11,3 j design** | **~12 j piges** | V2 complète avec 14 mini-jeux + cockpit |

**Note parallélisation** : α et α-bis peuvent s'exécuter en
parallèle si ressources double (un dev moteur + un dev UI). Sinon
α-bis suit α en série, ce qui décale tout de ~6 sem.

**Dépenses piges** : ~12 j externes — histo (Boucheron, Rouilhan,
Valat) ~5 j, juriste (Lokiec, Henriot) ~2 j, design (Hische) ~3 j,
son (Derivière) ~3 j, sociologue (Béroud, Guilbert) ~1 j,
postcolonial ~3 j (recouvrement avec histo).

**Marge** : ~10 % buffer = +3,5 sem en fin de projet pour les
imprévus. Total avec marge = **~39-40 semaines (~10 mois)**.

## Critères de réussite par vague

| Vague | Métrique de succès |
|---|---|
| α | Aucune régression sur partie golden-path. Seed reproductible vérifié sur 5 parties. |
| α-bis | 5 testeurs jouent un golden-path complet en cockpit ; 1 testeur NVDA navigue sans aide ; 1 testeur mobile complète 5 tours. Révélation Norman tour 1 = aucune saturation. |
| β | 5 testeurs jouent 10 cycles annuels Trésorerie+Mandat+Talents sans soft-lock. Boucle économique cohérente. |
| γ | 3 testeurs panel réussissent V2-1 sans aide. Voix intérieures V2-4 saluées par Notat-bot test. |
| δ | Boucle 5 mini-jeux gestion testée sur 20 cycles. Organisation génère revenus. Monde déploie une couverture > 60 %. |
| ε | Dette 1940→1944 ne se déclenche que sur sauvegarde correcte. QPC accepte/refuse cohérent avec hiérarchie. |
| ζ | 8/11 personas panel restreint adhèrent à la Table alpha. Mode IA finit la partie sans soft-lock 99 % du temps. |
| η | Latence WS médiane < 200 ms. Drop-rate < 5 %. Manifestation + Meeting testés sur 5 scénarios chacun. |
| θ | 3 endings V3 atteints en test. Refondation rare (≈ 5 %). Aucun ending unattainable. |
| ι | Panel représentation : ≥ 8/10 valident la postcolonialité ; aucune figure féminine obsolète. |
| κ | Audit cycle 3 : moyenne ≥ 7,5/10 (vs 7,2 cycle 1). Aucun P0 régressif. Communication grand public possible. |

## Dépendances inter-vagues

- **α bloque tout** (jauges + spec moteur).
- **β bloque γ, δ, ε, ζ** (les mini-jeux historiques consomment
  Caisse, Talents, Mandat).
- **β + γ peuvent paralléliser** (β = gestion, γ = scénarios) si
  ressources doublées.
- **δ peut paralléliser avec γ et ε** (Organisation/Monde
  indépendants des scénarios historiques).
- **ζ bloque η (Table en ligne)** — l'alpha solo doit convaincre.
- **η bloque θ** (la sécession EU 2030 appelle la Table 1947
  multijoueur).
- **ι peut paralléliser avec δ/ε/ζ/η** (contenu représentationnel
  indépendant du moteur).
- **κ est la dernière vague**, dépend de toutes.

## Diagramme dépendances visuelles

```
   α (Fondation) ──┬──→ β (Gestion essentielle: Trésorerie+Talents+Mandat)
                   │            │
                   │            ├──→ γ (Scénarios simples: 1864/1995/BIT)
                   │            │
                   │            ├──→ δ (Gestion extensible: Org+Monde) ──┐
                   │            │                                         │
                   │            └──→ ε (Scénarios différés: 1940/QPC) ──┐ │
                   │                                                     │ │
                   └──→ ζ (★ Table 1945 alpha) ←─────────────────────────┴─┘
                              │
                              └──→ η (Gestion avancée + Table online) ──┐
                                                                         │
                                                                         ├──→ θ (V2-7 prospectif 2030+)
                                                                         │
                                          ι (Représentation) ────────────┤
                                                                         │
                                                                         ▼
                                                                κ (Polissage + audit V2)
                                                                         │
                                                                         ▼
                                                            🚀 V2 release publique
```

---

## Recommandation finale

**Démarrer par α + β en parallèle si ressources double**, sinon α
puis β en série. La vague α débloque tout, la vague β débloque
toutes les autres mini-jeux historiques (qui consomment ses
ressources).

**Garder la vague ζ (La Table alpha solo) comme jalon majeur** :
c'est elle qui valide ou invalide la promesse V2 (un jeu paritaire
vraiment paritaire). Si l'alpha ζ ne convainc pas le panel
restreint, **arrêter la vague η et reprendre ζ**. Ne pas pousser
en ligne un module qui n'a pas convaincu en solo.

**La séquence β → γ → δ → ε est l'épine dorsale gameplay** : chaque
vague nourrit la suivante. La gestion (β+δ) précède toujours les
scénarios qui consomment ses ressources (γ+ε).

**La vague κ (audit V2 cycle 3) est la condition de communication
publique** — tant qu'elle n'a pas eu lieu, V2 reste en soft launch.

Le panel n'est pas un cahier des charges, c'est un baromètre. Si
une recommandation devient obsolète parce que le jeu a évolué, on
l'archive sans complexe.

## Effort total V2 récapitulatif

| Bloc | Effort dev | Notes |
|---|---|---|
| **Fondation systémique** | 14 j | Vague α |
| **★ Interface Cockpit** | 33 j + 11,3 j design | **Vague α-bis (nouveau)** |
| **7 mini-jeux historiques** (section 7) | ~38 j + 14,3 j design | dont Table 21,5 j |
| **7 mini-jeux gestion** (section 8) | ~30,5 j + 24,4 j design | l'épine dorsale gamifiée |
| **Authenticité représentationnelle** | 13 j + 5 j piges | Vague ι |
| **Polissage final + audit** | 8 j + 7 j piges | Vague κ |
| **Direction artistique transversale** | 4 j + 6 j piges | Section 7.8 |
| **TOTAL V2** | **~164 j-dev + ~50 j design + ~12 j piges** | **~9-10 mois** |

V2 = un VRAI jeu de gestion d'organisation syndicale, avec
14 mini-jeux interconnectés, une Table multijoueur, un horizon
prospectif 2030+, et une représentation honnête de l'histoire
sociale française. Pas un prototype amplifié — un jeu adulte.

---

*Document tiré de [PANEL_202_PERSONAS.csv](PANEL_202_PERSONAS.csv).
Roadmap des tâches V1.x : [ROADMAP_PANEL_INTEGRATION.md](ROADMAP_PANEL_INTEGRATION.md).
Architecture produit : [PARITAS_V2_ARCHITECTURE.md](PARITAS_V2_ARCHITECTURE.md).
Audit audio cycles 1-2 : [AUDIT_AUDIO_2026-05.md](AUDIT_AUDIO_2026-05.md).*
