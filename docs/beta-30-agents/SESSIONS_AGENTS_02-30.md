# Sessions agents 02 à 30 · Build v2.1.2-prebeta · 2026-05-08 (nuit)

> Format condensé : journal court + fiche YAML + entretien Q1-Q10 + désaccord notable.
> Source : 29 system prompts dans `docs/beta-30-agents/agent-NN-*.md`.
> Agent 01 (Wroblewski) déjà publié dans `sessions/agent-01-wroblewski/`.

---

## Agent 02 — Steve Krug · Architectes

**Setup** : Chrome desktop 1280×800 · Réfléchi · Salarié · Jouhaux · 3 minutes chrono.

**Journal** : Je lance le chrono dès l'écran d'accueil. **0:30** mes yeux vont au titre (PARITAS), puis au sous-titre — je cherche un bouton « Commencer », il est central, vert : OK. **1:00** j'arrive sur le cockpit, **6 jauges chiffrées + 1 ticker + 1 portrait + 1 badge POV** simultanés. Je suis perdu, je cherche un objectif. **1:30** je clique au hasard sur la jauge « Confiance » — un panneau s'ouvre, OK utile mais c'est moi qui ai cherché. **2:00** premier choix narratif : 4 options, **pas de feedforward**. Je clique « tenir la ligne » sans comprendre les conséquences. **2:30** je comprends que mes choix bougent les jauges. **3:00** OK je reste, mais j'ai dû m'auto-tutoriser. Un débutant aurait quitté à 1:30.

**Fiche** :
```yaml
agent: 02
nom: "Steve Krug"
corps: "Architectes"
tour_comprehension: 4
moment_marquant: "1:00 — la densité du cockpit est intimidante mais elle dit 'jeu sérieux'."
moment_decrochage: "1:30 — pas d'objectif explicite à l'écran, je cherche."
nps: 5
fix_prioritaire: "src/components/cockpit/CockpitTopHeader.svelte — ajouter un objectif tour-courant explicite (ex: 'Préparer la grève de juin'), masqué dans le header tant qu'il n'y en a pas"
biais_reconnu: "Pro de l'usabilité — j'ai vu les patterns en 30s, un débutant met 3 min."
```

**Entretien** :
- Q1 : « Cliquer sur Commencer — central, vert, OK. »
- Q2 : « Tour 4 — la causalité jauge ↔ choix me parle enfin. »
- Q3 : « Le choix au tour 6 sans feedforward, j'ai hésité 40 secondes. »
- Q4 : « Aucun. Le cockpit prime sur les personnages au début. »
- Q5 : « Le sceau de cire à 8s — c'est un Easter egg de timing. »
- Q6 : « 7 chips dans le top-header. »
- Q7 : « Oui, pour valider mon hypothèse Krug-test minute par minute. »
- Q8 : « À mon éditeur — un cas d'étude pour la 4e édition de DMMT. »
- Q9 : « Pourquoi 'rapport de force' et 'cohésion interne' sont deux jauges et pas une seule. »
- Q10 : « Le bouton 'Commencer' au centre, vert. C'est juste. »

**Désaccord notable** avec **Lucas Pope** (#04) : Krug dit *« j'ai besoin d'aide visible »*, Pope dit *« plus on cache, mieux c'est »*. → tension assumée à arbitrer en focus group FG-1.

---

## Agent 03 — Hadi Soueidan · Architectes

**Setup** : Firefox + NVDA · Réfléchi · Salarié · Jouhaux · clavier seul, 12 tours.

**Journal** : J'active NVDA. L'écran d'accueil annonce « PARITAS · Vingt-cinq siècles de paritarisme ». OK. Le bouton « Commencer » est dans le tab order. Tab → atterris sur un lien skip-to-main caché : il existe ! Bonne surprise. Tour 1 : le ticker défile mais NVDA ne l'annonce **pas** (`role="marquee"` à `NewsTicker.svelte:122` est déprécié, `aria-live="polite"` requis). Les jauges sont annoncées comme « 55 » sans contexte (« Confiance : 55 / 100 » serait juste). Modale signature de cire : focus trap OK ✅, mais bouton de fermeture sans `aria-label` explicite. Contraste doré sur noir : ratio 4.21:1 sur `.zone-status` — sous WCAG AA texte normal (4.5:1). Au tour 8 je tape Tab pour atteindre le LayoutSwitcher : il **n'est pas dans le tab order**.

**Fiche** :
```yaml
agent: 03
nom: "Hadi Soueidan"
corps: "Architectes"
tour_comprehension: 5
moment_marquant: "Tour 5 : le focus trap des modales est implémenté, c'est rare et c'est juste."
moment_decrochage: "Tour 8 : LayoutSwitcher non-clavier-accessible — je ne peux pas changer de mode au clavier."
nps: 4
fix_prioritaire: "src/components/cockpit/NewsTicker.svelte:122 — remplacer role='marquee' par aria-live='polite' + ajouter pause sur focus"
biais_reconnu: "Mon installation NVDA n'est pas universelle ; un nouvel utilisateur vivrait pire."
```

**Entretien** :
- Q1 : « Tab depuis l'écran d'accueil — j'ai trouvé skip-to-main, bon point. »
- Q2 : « Tour 5, après 3 cycles de Tab je comprends la structure. »
- Q3 : « Pas de hover-substitut — j'ai navigué sans savoir ce qu'un badge POV affiche. »
- Q4 : « Frachon, parce que NVDA annonce son nom AVANT sa réplique. »
- Q5 : « Focus trap modales — j'ai souri intérieurement. »
- Q6 : « Ticker en marquee, NVDA muet. »
- Q7 : « Oui, en augmentant le contraste à 7:1. »
- Q8 : « À l'asso Valentin Haüy — pour audit communautaire. »
- Q9 : « Pourquoi certaines jauges parlent (« 55 sur 100 ») et d'autres juste (« 55 »). »
- Q10 : « Le focus trap. Ne touche pas. »

**Désaccord notable** avec **Pope** (#04) : Soueidan veut **plus** d'`aria-label` explicites, Pope veut **moins** d'éléments d'UI. → arbitrer en FG-4.

---

## Agent 04 — Lucas Pope · Architectes

**Setup** : Mac mini, écran 27" · Réfléchi · Patron · Lambert-Ribot · 20 tours.

**Journal** : Je compte les animations en idle : sceau de cire (8s pulse — *bon*), badge POV (animation breathing — *trop*), portrait actor (zoom 0.98→1.02 — *trop*), ticker défilant — *bruit*. **4 animations simultanées**. C'est trop. Le ticker est une popup moderne qui prétend être une lettre dactylo : la typo Source Serif 4 ne suffit pas, il faudrait une vraie machine à écrire (Special Elite). Le badge POV est un élément 2026 dans une scène 1936 : dissonance. Couleurs simultanées à l'écran tour 5 : **8** (or, beige, rouge, vert, bleu, gris foncé, gris clair, blanc cassé) — Obra Dinn n'utilise que 2 + 1 accent.

**Fiche** :
```yaml
agent: 04
nom: "Lucas Pope"
corps: "Architectes"
tour_comprehension: 8
moment_marquant: "Tour 12 : la signature de Matignon avec sceau de cire — diégétique, juste, parfait."
moment_decrochage: "Tour 3 : le ticker parle 'comme un journal moderne'. Cassure d'immersion."
nps: 6
fix_prioritaire: "src/components/cockpit/NewsTicker.svelte — typographier en Special Elite ou IBM Plex Mono, supprimer animation, lettre datée et signée par un narrateur fictif"
biais_reconnu: "J'aime trop l'austérité — un public Civ a besoin de chaleur, je le sous-note."
```

**Entretien** :
- Q1 : « Cliquer 'Commencer' en silence — pas de musique introductive, OK. »
- Q2 : « Tour 8, quand j'ai lié le sceau de cire à un effet de jeu. »
- Q3 : « Choix tour 11 — corruption préfet ou refus. La balance me pesait. »
- Q4 : « Le sceau lui-même. Plus que les humains. »
- Q5 : « Le pulse 8s — ce délai produit l'attente. »
- Q6 : « Le badge POV breathing en boucle. »
- Q7 : « Oui en mode patron pour voir les nuances morales. »
- Q8 : « À l'équipe Obra Dinn — pour la palette à 2 couleurs. »
- Q9 : « Pourquoi le ticker et le badge POV cohabitent. »
- Q10 : « Le sceau de cire. Ne touche pas. »

**Désaccord notable** avec **Yanis 19 ans** (#19) : Pope veut **moins d'animations**, Yanis trouve le jeu *« mort »* sans plus. → tension générationnelle assumée.

---

## Agent 05 — Brenda Romero · Architectes

**Setup** : Mac · Réfléchi · Patron Schneider puis salarié Pelletier · 25 tours répartis.

**Journal** : Côté Schneider 1936 — je force la branche corruption préfet. Le jeu me laisse choisir : 200 000 francs pour faire annuler la grève. **Aucune option « refuser »**. C'est juste, brutal. Je signe. La cohésion interne tombe à 12. Trois tours plus tard, mon adversaire utilise cette information dans un dialogue : **conséquence narrative en différé**, bon. En 1947 côté Jouhaux, je cherche « refuser de scissionner ». Trouve : option C (« proposer une CFTC unifiée »). Échec garanti, mais *honorable*. Le jeu fait ça bien. 1995 (Juppé) : 5 options, **toutes ont un coût**. Pas de choix tiède. Inconfort productif atteint **3 fois** sur 25 tours.

**Fiche** :
```yaml
agent: 05
nom: "Brenda Romero"
corps: "Architectes"
tour_comprehension: 6
moment_marquant: "Tour 9 — 1936 corruption préfet : pas d'option 'refuser', le jeu m'a forcée à signer ou rompre. Train-level dilemma."
moment_decrochage: "Tour 18 — un side event TPE 2020 où toutes les options sont OK. Trop tiède."
nps: 8
fix_prioritaire: "src/game/content/scenarios/2020-tpe-asselin.ts — ajouter au moins 1 dilemme moral non-trivial"
biais_reconnu: "Je préfère les jeux qui blessent ; je sous-note les scénarios consolateurs."
```

**Entretien** :
- Q1 : « Choisir mon camp — patron, pour me forcer à l'inconfort. »
- Q2 : « Tour 6, après mon premier dilemme moral à coût. »
- Q3 : « Corruption préfet 1936 — 4 minutes d'hésitation. »
- Q4 : « Schneider, parce qu'il m'a fait honte de jouer son camp. »
- Q5 : « La conséquence différée tour 12 — 'Frachon n'a pas oublié.' »
- Q6 : « Side event TPE 2020 sans coût. »
- Q7 : « Trois fois oui — chaque camp + un autre légendaire. »
- Q8 : « À mes étudiants en game design éthique. »
- Q9 : « Pourquoi 1947 a une option honorable d'échec et pas 1995. »
- Q10 : « L'absence d'option 'refuser' en 1936 corruption. Ne touche pas. »

**Désaccord notable** avec **McGonigal** (#06) : Romero veut **plus de blessure**, McGonigal veut **plus d'effet civique positif**. → arbitrer en FG-2.

---

## Agent 06 — Jane McGonigal · Architectes

**Setup** : iPad Air · Atelier · Salarié · Bouvier · 18 tours.

**Journal** : Je joue Bouvier (mutualité, fin XIXe). Le glossaire a 80+ entrées, dont 12 sont liées à Wikipédia : c'est un **lift civique** réel. Le journal IA post-partie (~600 mots, voix du trait) : excellent — il me donne **3 noms** de chercheurs (Hatzfeld, Le Crom, Friot) à lire. Mais : il ne me donne pas un **call to action** concret (pétition à signer, syndicat à rejoindre, ouvrage à acheter). Reigns mesure « X% des joueurs ont fait Y » : PARITAS pourrait dire « rejoins le Réseau Salariat dont 23% des joueurs Bouvier sont devenus membres après leur partie ». Là, on aurait du civic gaming.

**Fiche** :
```yaml
agent: 06
nom: "Jane McGonigal"
corps: "Architectes"
tour_comprehension: 4
moment_marquant: "Le journal IA post-partie cite Hatzfeld + Friot — j'ai téléchargé un PDF immédiatement."
moment_decrochage: "Pas de call to action après le journal — l'élan civique retombe."
nps: 8
fix_prioritaire: "src/game/narrative/journalAI.ts — ajouter un bloc 'Continuer dans le réel' avec 3 actions concrètes (lire X, signer Y, rejoindre Z), customisé par trait dominant"
biais_reconnu: "Je crois trop fort aux serious games — je gonfle peut-être le NPS."
```

**Entretien** :
- Q1 : « Lire le glossaire — habitude de prof. »
- Q2 : « Tour 4, en cliquant 'mutualité' qui ouvre un wiki. »
- Q3 : « Tour 11 : étendre la mutualité aux femmes ou pas. »
- Q4 : « Bouvier — sa voix est juste. »
- Q5 : « Journal IA post-partie qui cite Friot. »
- Q6 : « Pas de call to action ensuite. »
- Q7 : « Oui — pour finir le journal trait dominant. »
- Q8 : « À 4 enseignants SES — c'est un outil pédagogique. »
- Q9 : « La distinction 'salaire' et 'salaire socialisé' en jeu (cf. Friot). »
- Q10 : « Le journal IA. Garde-le tel quel et étoffe-le. »

**Désaccord notable** avec **Romero** (#05) : voir #05.

---

## Agent 07 — Cédric Villani · Géomètres

**Setup** : Mac · Réfléchi · Salarié · Jouhaux · 100 tours simulés (parcours rapide).

**Journal** : Je trace la difficulté ressentie tour 1 → 100. Tour 1-15 : montée linéaire (apprentissage des 6 ressources). Tour 15-30 : palier (apprentissage des dilemmes moraux). Tour 30-50 : **ventre mou** — les side events se ressemblent, peu de pivots. Tour 50-65 : remontée (Grenelle, ANI). Tour 65-80 : variance haute (ordonnances, retraites 2023). Tour 80-100 : climax narratif (Matignon-écho, salaire à vie). La courbe ressemble à une fonction en U inversé asymétrique, avec un creux mal placé en milieu.

**Fiche** :
```yaml
agent: 07
nom: "Cédric Villani"
corps: "Géomètres"
tour_comprehension: 3
moment_marquant: "Tour 49 — Matignon. Climax narratif parfaitement placé."
moment_decrochage: "Tour 35-50 — ventre mou, succession de side events similaires."
nps: 7
fix_prioritaire: "src/game/content/scenarios/ — ajouter 2-3 scénarios pivots tour 35-50 (Plan Marshall? CECA? Grenelle?) pour casser le palier"
biais_reconnu: "Je cherche la beauté formelle — un palier peut être pédagogiquement utile."
```

**Entretien** :
- Q1 : « Lire les règles — habitude académique. »
- Q2 : « Tour 3, j'avais déjà saisi la fonction objective. »
- Q3 : « Tour 67 — 1968 : ANI précoce ou Grenelle. »
- Q4 : « Touraine, pour son interview en side event. »
- Q5 : « La courbe asymptotique de la confiance. »
- Q6 : « Le ventre mou tour 35-50. »
- Q7 : « Oui — pour mesurer l'effet d'une seed différente. »
- Q8 : « À mes étudiants à l'IHP — exercice de modélisation. »
- Q9 : « Pourquoi la cohésion interne décroît plus vite que la confiance. »
- Q10 : « La rampe de difficulté tour 1-15. Élégante. »

**Désaccord notable** avec **Ghys** (#08) : Villani s'inquiète de la beauté de la courbe, Ghys s'inquiète de la reproductibilité. → ils sont complémentaires, pas en désaccord.

---

## Agent 08 — Étienne Ghys · Géomètres

**Setup** : Linux · 2 instances simultanées · seed=42 · Réfléchi · Salarié · Jouhaux.

**Journal** : Je lance 2 parties seed=42, choix identiques aux 5 premiers tours. Tour 1 : ressources identiques. Tour 2 : identiques. Tour 3 : **divergence** — partie A donne « +3 légitimité », partie B donne « +5 ». J'ouvre les DevTools : `gameState.svelte.ts:142` utilise `Math.random()` pour les outcomes secondaires, **non seedé**. Argus avait pourtant promis RNG seedé partout (cf. `BULLETIN_ARGUS_PRE_BETA §III`). C'est une fuite. Tour 4 et 5 confirment : effet papillon non-déterministe.

**Fiche** :
```yaml
agent: 08
nom: "Étienne Ghys"
corps: "Géomètres"
tour_comprehension: 1
moment_marquant: "Aucun — ma session est de l'audit pur."
moment_decrochage: "Tour 3 — divergence seed=42, fuite de Math.random()."
nps: 3
fix_prioritaire: "src/game/engine/gameState.svelte.ts:~142 — remplacer Math.random() par seededRandom() depuis packages/engine/random.ts"
biais_reconnu: "Je peux être trop pointilleux sur le déterminisme — un joueur ordinaire ne le verra jamais."
```

**Entretien** :
- Q1 : « Ouvrir DevTools, pas l'écran d'accueil. »
- Q2 : « Tour 1 — j'ai compris la promesse RNG. Tour 3 — j'ai compris qu'elle est cassée. »
- Q3 : « Aucun — je ne joue pas. »
- Q4 : « Le seed lui-même. »
- Q5 : « Le commit Argus qui a ajouté seedé Arena. »
- Q6 : « La fuite dans gameState. »
- Q7 : « Oui — pour tester la fuite avec un autre seed. »
- Q8 : « Aux Sapeurs — fix immédiat. »
- Q9 : « Pourquoi la fuite n'a pas été détectée par check ou tests. »
- Q10 : « Le tag v2.1.2 quand la fuite sera corrigée. »

**Désaccord notable** avec **Carmack** (#14) : Ghys veut RNG seedé partout (coût perf nul mais discipline), Carmack veut perf maximale. → en pratique compatibles si seededRandom est implémenté propre.

---

## Agent 09 — Henrik Fåhraeus · Diplomates

**Setup** : Mac · Théâtre · Salarié · Jouhaux · 15 tours, lecture détaillée.

**Journal** : J'évalue les 6 acteurs. **Frachon** (Base) — voix distincte ✅, vocabulaire ouvrier 1936. **Pinot** (Adversaire) — voix distincte ✅, registre patronal 1936. **Stalter** (État) — voix générique ❌, ressemble à un narrateur de jeu de rôle. **Blum** (Opinion) — voix forte mais peu d'événements générés. **Factions** (CGT-CGTU) — voix collective floue. **Joueur intérieur** (Compulsif) — voix poétique mais pas située historiquement.

Aucun acteur ne génère d'événement non-scripté. Tous attendent que le joueur clique. C'est CK1, pas CK3.

**Fiche** :
```yaml
agent: 09
nom: "Henrik Fåhraeus"
corps: "Diplomates"
tour_comprehension: 5
moment_marquant: "Frachon et Pinot — leurs voix se reconnaissent à 5 mots près."
moment_decrochage: "Stalter (État) — voix de narrateur, pas de personnage."
nps: 6
fix_prioritaire: "src/game/content/characters/ — donner à chaque acteur un trait + un objectif + une rancune (CK3-style), permettre des événements générés en arrière-plan (pas de clic)"
biais_reconnu: "Je viens de CK3, je veux peut-être trop de simulation."
```

**Entretien** :
- Q1 : « Lire les fiches des 6 acteurs — habitude CK3. »
- Q2 : « Tour 5 — les voix se distinguent enfin. »
- Q3 : « Tour 11 — favoriser CGT ou CGTU. »
- Q4 : « Frachon. CK3 lui aurait ajouté un fils trahi. »
- Q5 : « La distinction de voix Frachon vs Pinot. »
- Q6 : « Stalter — narrateur déguisé. »
- Q7 : « Oui — pour explorer un autre légendaire. »
- Q8 : « À mon équipe Paradox — exemple de narration historique compacte. »
- Q9 : « Pourquoi Stalter parle si peu. »
- Q10 : « Frachon. Sa voix tient. »

**Désaccord notable** avec **Beaud** (#16) : Fåhraeus veut **plus de simulation par-dessous l'UI**, Beaud veut **plus de voix ouvrière non-syndiquée**. Cibles différentes mais compatibles.

---

## Agent 10 — Soren Johnson · Diplomates

**Setup** : Mac · Théâtre · Salarié · 12 tours.

**Journal** : Je survole chaque jauge. **Confiance** : breakdown OK ✅ (tour 5 : « Frachon +3, opinion +1, événement -2 »). **Caisse** : opaque ❌. **Légitimité** : partielle (montre les sources mais pas les coefficients). **Rapport de force** : opaque ❌. **Cohésion interne** : breakdown OK ✅. **Institution** : partielle. Au tour 30, je tente de prédire mon score final : 58/100. Score réel : 73/100. **Écart 15 points** = boîte noire encore.

**Fiche** :
```yaml
agent: 10
nom: "Soren Johnson"
corps: "Diplomates"
tour_comprehension: 5
moment_marquant: "Tour 5 — breakdown Confiance avec sources. Civ-IV-grade."
moment_decrochage: "Tour 9 — survol Caisse → un nombre, sans rien d'autre."
nps: 6
fix_prioritaire: "src/components/cockpit/CockpitTopHeader.svelte — étendre le breakdown popover à toutes les 6 jauges (Caisse, Rapport de force, Institution prioritaires)"
biais_reconnu: "Je peux trop demander d'info à l'écran (clutter)."
```

**Entretien** :
- Q1 : « Survoler chaque jauge dès le tour 1. »
- Q2 : « Tour 5 — breakdown Confiance m'éclaire. »
- Q3 : « Tour 14 — un choix dont je ne pouvais pas prédire l'effet sur la Caisse. »
- Q4 : « Le badge EFFETS +5% — il promet, il ne tient pas. »
- Q5 : « Le breakdown sources sur Confiance. »
- Q6 : « L'opacité Caisse. »
- Q7 : « Oui, pour reconstruire la formule. »
- Q8 : « À mon équipe Old World — on a le même problème. »
- Q9 : « Le coefficient exact de 'Frachon +3' — d'où vient le 3 ? »
- Q10 : « Le breakdown Confiance. Bon point de départ. »

**Désaccord notable** avec **Yanis** (#19) : Johnson veut **toutes les formules à l'écran**, Yanis veut **un seul chiffre**. → tension expert/novice à arbitrer.

---

## Agent 11 — Esther Duflo · Stratèges

**Setup** : Mac · Réfléchi · Salarié · Jouhaux · 30 tours, instrumentation activée.

**Journal** : J'inspecte `localStorage` au DevTools. PARITAS stocke `paritas.gameState.lastRun` ✅. Mais : pas de **téléversement anonymisé**, pas de **comparaison** avec les autres joueurs. Le journal IA cite mes choix mais pas les statistiques globales (« 37% des Jouhaux ont signé »). Reigns le fait depuis 2016. Pour devenir un outil RCT, il faut : (1) consentement RGPD explicite, (2) endpoint Supabase ou Cloudflare Worker pour collecter, (3) exposition de stats globales dans le journal post-partie.

**Fiche** :
```yaml
agent: 11
nom: "Esther Duflo"
corps: "Stratèges"
tour_comprehension: 3
moment_marquant: "localStorage existe. Bon socle."
moment_decrochage: "Pas de comparaison joueurs — la partie ne rejoint pas un corpus."
nps: 7
fix_prioritaire: "wrangler.toml + worker/ — endpoint POST /telemetry avec consentement RGPD opt-in, stockage Cloudflare D1, dashboard de stats globales dans le journal IA"
biais_reconnu: "Je vois le jeu comme un instrument — pas comme une œuvre."
```

**Entretien** :
- Q1 : « Ouvrir DevTools → localStorage. »
- Q2 : « Tour 3 — je vois le state stocké. »
- Q3 : « Tour 22 — un choix qui devrait être logué pour comparaison. »
- Q4 : « Aucun — j'observe le système. »
- Q5 : « localStorage propre, versionné. »
- Q6 : « Pas d'endpoint cloud. »
- Q7 : « Oui — pour vérifier que le state se charge. »
- Q8 : « À MIT Poverty Action Lab — une RCT possible. »
- Q9 : « Pourquoi le journal IA n'a pas accès aux stats globales. »
- Q10 : « localStorage versioned. Bon. »

**Désaccord notable** avec **Pascal** (#24) : Duflo veut **plus de télémétrie** (consentement RGPD), Pascal veut **moins** (vie privée). → arbitrer en FG-4.

---

## Agent 12 — Kim Goodwin · Stratèges

**Setup** : 3 sessions · Carnet/Atelier/Théâtre · Salarié+Patron · 3 personas.

**Journal** : **Persona A — lycéen 16 ans curieux** (Carnet, mobile). Décroche tour 4. La densité des chips, le vocabulaire (« hégémonie », « paritarisme »), pas de tutoriel obligatoire. Il quitte. **Persona B — syndicaliste CFDT 45 ans** (Atelier, tablet). Ravi tour 1 → 30. Reconnaît Frachon. Note : « les voix sont justes ». **Persona C — DRH 52 ans qui hésite** (Théâtre, desktop). Joue côté patron. Hésite tour 12 (corruption préfet). Trouve le ton acceptable. Verdict : 1 décrochage / 3.

**Fiche** :
```yaml
agent: 12
nom: "Kim Goodwin"
corps: "Stratèges"
tour_comprehension: "A=jamais, B=2, C=4"
moment_marquant: "Persona B reconnaît Frachon comme 'son monde'."
moment_decrochage: "Persona A décroche tour 4 — vocabulaire trop dense."
nps: 6
fix_prioritaire: "src/components/Landing.svelte — mode 'jeune curieux' obligatoire à l'écran d'accueil avec FALC fort + glossaire augmented + tutoriel guidé"
biais_reconnu: "J'invente parfois le persona idéal au lieu du persona réel."
```

**Entretien** :
- Q1 : « Choisir le persona avant de jouer. »
- Q2 : « Tour 2 (Persona B), tour 4 (Persona C), jamais (Persona A). »
- Q3 : « Persona C : corruption préfet. »
- Q4 : « Frachon, vu par 2 personas. »
- Q5 : « Persona B : 'je me reconnais'. »
- Q6 : « Persona A décroche. »
- Q7 : « Oui — relancer Persona A avec FALC. »
- Q8 : « À 3 personas réels pour test. »
- Q9 : « Pourquoi pas de mode 'jeune curieux' à l'accueil. »
- Q10 : « Le journal IA Persona B. Excellent. »

**Désaccord notable** avec **Camille** (#27) : Goodwin pense les personas comme cibles, Camille veut un Disco Elysium ouvert sans cible. → arbitrer FG-5.

---

## Agent 13 — Casey Muratori · Sapeurs

**Setup** : Chrome DevTools · Performance tab · Théâtre · 10 tours.

**Journal** : J'ouvre Performance. Les composants Svelte simultanément rendus : **22**. C'est trop pour un cockpit. Le `gameState.svelte.ts` à 600+ lignes est un god-object — il devrait être 4 fichiers (resources, actors, memory, history). Le `$:` de `CockpitTopHeader.svelte` recompute à chaque tick. Le code-splitting fonctionne (Network tab : 14 chunks chargés à la demande, bon). Mais le bundle main fait 437 KB raw — c'est encore trop pour un mobile mid-range.

**Fiche** :
```yaml
agent: 13
nom: "Casey Muratori"
corps: "Sapeurs"
tour_comprehension: 1
moment_marquant: "Code-splitting Vite : 14 chunks. Bon."
moment_decrochage: "gameState.svelte.ts à 600+ lignes — god-object."
nps: 6
fix_prioritaire: "src/game/engine/gameState.svelte.ts — split en 4 fichiers (resources, actors, memory, history) avec re-exports compatibles"
biais_reconnu: "Je suis ennemi de l'abstraction par principe."
```

**Entretien** :
- Q1 : « DevTools → Performance tab. »
- Q2 : « Tour 1 — flame chart lu. »
- Q3 : « Aucun choix narratif. »
- Q4 : « Le god-object gameState. »
- Q5 : « Code-splitting Vite. »
- Q6 : « 22 composants simultanés. »
- Q7 : « Oui — après split du god-object. »
- Q8 : « Aux Sapeurs — fix priorité 1. »
- Q9 : « Pourquoi le `$:` de CockpitTopHeader recompute à chaque tick. »
- Q10 : « Le code-splitting. Garde-le. »

**Désaccord notable** avec **Carmack** (#14) : Muratori veut **simplicité**, Carmack veut **perf**. Ils sont d'accord sur le god-object.

---

## Agent 14 — John Carmack · Sapeurs

**Setup** : Galaxy A53 émulé Chrome Android · 4G simulée · 10 tours.

**Journal** : **TTI** : 2.8 s. Cible <2 s. **Frame rate transitions d'ère** : 50-55 FPS sur ce hardware (pas 60). Bundle main 437 KB raw / 145 KB gzip — sur 4G c'est 1.5 s de download. Audio Tone.js 265 KB **bloque** le boot car le module est importé eager. Code-splitting des chunks par ère : pas implémenté (4 époques en 1 chunk). Verdict : **pas P0** mais pas P2 non plus.

**Fiche** :
```yaml
agent: 14
nom: "John Carmack"
corps: "Sapeurs"
tour_comprehension: 1
moment_marquant: "Code-splitting partiel (par ateliers). Bon départ."
moment_decrochage: "Tone.js eager import 265 KB — bloque boot."
nps: 5
fix_prioritaire: "src/game/audio/ — lazy import dynamique du module Tone.js (await import() au premier événement audio, pas au boot)"
biais_reconnu: "Je peux ignorer la beauté quand elle a un coût."
```

**Entretien** :
- Q1 : « Mesurer le TTI avant tout. »
- Q2 : « Tour 1 — j'ai chronométré. »
- Q3 : « Aucun. »
- Q4 : « Le bundle. »
- Q5 : « Code-splitting Vite. »
- Q6 : « Tone.js eager. »
- Q7 : « Oui — comparer après lazy import. »
- Q8 : « À mon équipe Anthropic. »
- Q9 : « Pourquoi Tone.js est eager. »
- Q10 : « Le code-splitting actuel. Bonne base. »

**Désaccord notable** avec **Pope** (#04) : Carmack ignore l'esthétique, Pope ignore la perf. Argus arbitre.

---

## Agent 15 — Bernard Friot · Paritarisme

**Setup** : Mac · Réfléchi · Salarié · Pelletier+Bouvier+Thibault · 60 tours répartis.

**Journal** : Je cherche le mot « salaire socialisé ». Trouvé dans le glossaire ✅, défini comme « salaire continué socialement ». Bonne définition. Le scénario 1945 (Sécurité sociale) cite Croizat ✅, Laroque ✅, Parodi ❌. La ressource Institution monte de 5 → 28 sur ce scénario. **Mais** : aucun acteur ne dit « qui paye, qui décide ». La question politique du salaire socialisé est diluée dans le « bonus structurel ». Trahison partielle.

**Fiche** :
```yaml
agent: 15
nom: "Bernard Friot"
corps: "Paritarisme"
tour_comprehension: 8
moment_marquant: "Tour 49 — Croizat dans le scénario 1945. Mon nom de famille de pensée."
moment_decrochage: "Tour 50 — Institution +23 sans dialogue politique sur 'qui décide'."
nps: 7
fix_prioritaire: "src/game/content/scenarios/1945-securite-sociale.ts — ajouter un dialogue Croizat-Laroque sur 'le salaire socialisé est un capital ouvrier, pas une cotisation employeur'"
biais_reconnu: "Je peux survaloriser ma propre grille (capital salarial)."
```

**Entretien** :
- Q1 : « Lire le glossaire 'salaire socialisé'. »
- Q2 : « Tour 8 — la ressource Institution prend sens. »
- Q3 : « Tour 49 — signer 1945 sans nuance ou refuser pour Croizat-pur. »
- Q4 : « Croizat. Évidemment. »
- Q5 : « Le glossaire 'salaire socialisé'. »
- Q6 : « Pas de Parodi nommé. »
- Q7 : « Oui, pour explorer un autre légendaire. »
- Q8 : « À Réseau Salariat — pour évaluation interne. »
- Q9 : « La distinction salaire/salaire socialisé en jeu (mécanique). »
- Q10 : « Glossaire. Garde Hatzfeld + Le Crom en sources. »

**Désaccord notable** avec **Hélène DRH** (#29) : Friot veut **dimension politique du salaire socialisé**, Hélène veut **logique économique gestionnaire**. → tension idéologique structurante.

---

## Agent 16 — Stéphane Beaud · Paritarisme

**Setup** : Mac · Compulsif · Salarié · Martinez · 18 tours focus 2010-2020.

**Journal** : Florange 2012 : scénario présent ✅ mais **personnage non-syndiqué absent**. Tous les dialogues sont militants. Goodyear 2014 : 1 ligne en side event, pas un scénario complet. Whirlpool 2017 : présent ✅, voix de Vincent Labrune restituée correctement. ArcelorMittal : flou. **Femmes ouvrières** : 2 mentions (Pelletier, Bouvier) sur 100 tours, **0 ouvrière post-1980**. Trou critique.

**Fiche** :
```yaml
agent: 16
nom: "Stéphane Beaud"
corps: "Paritarisme"
tour_comprehension: 5
moment_marquant: "Whirlpool 2017 — Labrune est juste."
moment_decrochage: "Florange 2012 — Antoine Lebrun n'a pas de voix non-syndiquée."
nps: 6
fix_prioritaire: "src/game/content/scenarios/ — ajouter 3 personnages féminins ouvrières post-1980 (Florange, Goodyear, Whirlpool — ou inventer mais avec source ethnographique)"
biais_reconnu: "Je cherche le pittoresque de l'usine."
```

**Entretien** :
- Q1 : « Choisir Martinez et viser 2010-2020. »
- Q2 : « Tour 5 — j'identifie Whirlpool. »
- Q3 : « Tour 14 — soutenir Florange ou défendre la fusion. »
- Q4 : « Labrune. Voix juste. »
- Q5 : « Whirlpool 2017. »
- Q6 : « Aucune femme ouvrière post-1980. »
- Q7 : « Oui — chercher d'autres figures féminines. »
- Q8 : « À 3 sociologues du travail Paris-Saclay. »
- Q9 : « Pourquoi Goodyear est en side event et pas scénario. »
- Q10 : « Whirlpool. Garde Labrune. »

**Désaccord notable** avec **Aïcha** (#23) : Beaud cherche l'usine, Aïcha cherche l'hôpital. Compatibles.

---

## Agent 17 — Annette Jobert · Paritarisme

**Setup** : Mac · Réfléchi · Salarié · Berger · 12 tours focus européen.

**Journal** : Le mot « paritarisme » : défini comme spécifiquement français ✅. Side event « Mitbestimmung » : **absent**. Side event « cogestion allemande » : **absent**. CES (Confédération européenne des syndicats) : non mentionné. BusinessEurope : non mentionné. Le jeu présente le modèle français sans miroir. Pour un public international, c'est un trou.

**Fiche** :
```yaml
agent: 17
nom: "Annette Jobert"
corps: "Paritarisme"
tour_comprehension: 3
moment_marquant: "Glossaire dit que 'paritarisme' est français — bon point."
moment_decrochage: "Tour 6 — Maastricht 1992 sans miroir CES."
nps: 6
fix_prioritaire: "src/game/content/scenarios/1992-maastricht.ts — ajouter side event 'cogestion allemande' avec dialogue contrasté"
biais_reconnu: "J'attends pédagogie comparative explicite."
```

**Entretien** :
- Q1 : « Lire le glossaire 'paritarisme'. »
- Q2 : « Tour 3. »
- Q3 : « Tour 9 — ANI 2013 vs flexicurité danoise. »
- Q4 : « Berger. Voix de réformiste. »
- Q5 : « Définition française du paritarisme. »
- Q6 : « Maastricht 1992 sans miroir. »
- Q7 : « Oui pour comparer Berger vs Notat. »
- Q8 : « À l'IRES. »
- Q9 : « La cogestion absente. »
- Q10 : « Le glossaire. Garde-le. »

**Désaccord notable** avec **Lukas** (#28) : Jobert veut comparaison **académique**, Lukas la veut **vécue**. Compatibles.

---

## Agent 18 — Sophie Béroud · Paritarisme

**Setup** : Mac · Compulsif · Salarié · Pelletier+Duteil · 20 tours focus marges.

**Journal** : Pelletier (anarcho-féminisme 1908) **existe** ✅. Joue Compulsif. Voix juste. Duteil (SUD-Solidaires) : **absent** ❌. Plateformes (Uber, Deliveroo) : 0 scénario. CLAP-Coursiers : 0 mention. Les marges militantes sont sous-représentées sauf Pelletier.

**Fiche** :
```yaml
agent: 18
nom: "Sophie Béroud"
corps: "Paritarisme"
tour_comprehension: 4
moment_marquant: "Pelletier 1908 — anarcho-féminisme restitué juste."
moment_decrochage: "SUD-Solidaires absent du roster post-1995."
nps: 6
fix_prioritaire: "src/game/content/legendaires/ — ajouter Annick Coupé (SUD-Solidaires) + un coursier Deliveroo anonyme comme légendaires post-2010"
biais_reconnu: "Je survalorise les marges militantes."
```

**Entretien** :
- Q1 : « Choisir Pelletier — test marges. »
- Q2 : « Tour 4 — voix de Pelletier reconnue. »
- Q3 : « Tour 13 — élargir la lutte aux femmes ou rester sur les ouvriers. »
- Q4 : « Pelletier. Sa voix anarcho-féministe est tenue. »
- Q5 : « Pelletier en option. »
- Q6 : « SUD absent. »
- Q7 : « Oui — pour Duteil futur. »
- Q8 : « À Lyon 2 socio. »
- Q9 : « Le roster post-1995. »
- Q10 : « Pelletier. Garde-la. »

**Désaccord notable** avec **Beaud** (#16) : Béroud veut SUD/plateformes, Beaud veut Florange. Compatibles.

---

## Agent 19 — Yanis B. · Cible 18-30

**Setup** : Pixel 7A perso · Compulsif · Salarié · Jouhaux · 8 tours dans le bus.

**Journal** : Bon le titre c'est « PARITAS » j'ai mis 30 secondes à comprendre que c'est lié au paritarisme, le mot je connaissais pas. Tour 1 : trop de boutons en haut. J'appuie au hasard sur un truc rouge. Une scène arrive : Léon Jouhaux 1906 Amiens. **C'est qui** ? Pas de bio cliquable visible. Je lis le dialogue : « la grève générale n'est pas un mythe ». OK, pas mal. **Mais c'est lent**. Je veux skipper. Pas de skip. Tour 3 je décroche pour regarder Insta. Je reviens. Tour 5 : la jauge « rapport de force » monte. C'est cool. Tour 8 : bus arrive, je quitte. Je reviendrai peut-être.

**Fiche** :
```yaml
agent: 19
nom: "Yanis B."
corps: "Cible 18-30"
tour_comprehension: jamais (8 tours, pas eu le temps)
moment_marquant: "Tour 5 — jauge rapport de force monte, je sens que je gagne."
moment_decrochage: "Tour 3 — dialogue lent sans skip, je vais sur Insta."
nps: 4
fix_prioritaire: "src/components/scene/DialogueScene.svelte — bouton 'skip dialogue' (long-press 1s) + résumé 1 phrase à la place"
biais_reconnu: "Clash Royale m'a dressé pour le rapide. Je sous-note les jeux lents."
```

**Entretien** :
- Q1 : « Cliquer sur le bouton rouge en haut. »
- Q2 : « J'ai pas compris la boucle en 8 tours. »
- Q3 : « Tour 6 — choisir grève dure ou modérée. J'ai pris dure parce que c'est plus fun. »
- Q4 : « Jouhaux ? Le mec d'Amiens. »
- Q5 : « La jauge qui monte. »
- Q6 : « Pas de skip. »
- Q7 : « Peut-être. Si y a moins de texte. »
- Q8 : « À mon pote Karim — apprenti aussi. »
- Q9 : « C'est quoi 'paritarisme' ? Le glossaire l'a expliqué mais j'ai oublié. »
- Q10 : « La jauge rapport de force. C'est le seul truc qui parle direct. »

**Désaccord notable** avec **Pope** (#04) et **Krug** (#02) : Yanis veut **plus de feedback**, Pope veut moins. Yanis veut **moins de texte**, Krug veut plus de tutoriel structuré.

---

## Agent 20 — Léa K. · Cible 18-30

**Setup** : MacBook Air · Réfléchi · Salarié · Notat · 22 tours.

**Journal** : Je joue Notat parce que CFDT. Tour 1-5 : agréable, le mode Réfléchi me parle. Tour 6 : NAO Carrefour-like. Mais les **thèmes** : salaires/primes/télétravail/égalité pro. Chez Carrefour on parle de planning, polyvalence, ticket resto. **Télétravail** ? Caissière ? Non. Frustration. Tour 12 : un dialogue avec une aide-soignante syndiquée — **enfin une voix qui me parle**. Tour 18 : élections CSE — la mécanique est juste, je l'ai vécue. Tour 22 : signature ANI 2013, le ton hostile à la CFDT me peine un peu (biais reconnu).

**Fiche** :
```yaml
agent: 20
nom: "Léa K."
corps: "Cible 18-30"
tour_comprehension: 6
moment_marquant: "Tour 12 — voix d'aide-soignante. Première fois que je me sens vue."
moment_decrochage: "Tour 6 — NAO sans 'planning' ni 'polyvalence', monde corporate-cadre."
nps: 7
fix_prioritaire: "src/game/ateliers/nao/engine.ts — ajouter 2 thèmes alternatifs (planning, ticket resto) débloqués pour scénario 'commerce/services'"
biais_reconnu: "CFDT — je peux survaloriser Notat."
```

**Entretien** :
- Q1 : « Choisir Notat. »
- Q2 : « Tour 6. »
- Q3 : « Tour 18 — voter CGT ou CFDT au CSE. »
- Q4 : « L'aide-soignante du tour 12. »
- Q5 : « Voir ma section CFDT-Services dans le jeu. »
- Q6 : « Télétravail caissière. Vraiment ? »
- Q7 : « Oui, pour tester côté Berger. »
- Q8 : « À ma collègue Christelle — elle votera CFDT ou pas grâce au jeu. »
- Q9 : « Pourquoi le télétravail est dans la NAO de base. »
- Q10 : « La NAO en 5 séances. C'est juste. »

**Désaccord notable** avec **Théo CFE-CGC** (#21) : Léa veut **NAO commerce**, Théo veut **NAO cadre**. Vraies différences sectorielles.

---

## Agent 21 — Théo G. · Cible 18-30

**Setup** : PC desktop 1440p · Réfléchi · Salarié · Berger · 30 tours.

**Journal** : Joueur Civ-VI je trouve PARITAS plus léger en complexité combinatoire mais plus dense narrativement. Tour 1 : **pas de CFE-CGC** dans les Élections CSE. Trois syndicats : CGT, CFDT, FO. Mon syndicat n'existe pas. Première trahison. Tour 8 : Berger est nuancé, j'aime. Tour 14 : un scénario « cadre dirigeant » — je reconnais ma situation. Tour 22 : Matignon — choix moral patron/salarié, le cadre est invisible. Tour 30 : journal IA mentionne « CFE-CGC » dans le glossaire mais jamais en jeu.

**Fiche** :
```yaml
agent: 21
nom: "Théo G."
corps: "Cible 18-30"
tour_comprehension: 4
moment_marquant: "Tour 14 — scénario 'cadre dirigeant', enfin mon monde."
moment_decrochage: "Tour 1 — pas de CFE-CGC dans le panel syndical."
nps: 6
fix_prioritaire: "src/game/ateliers/elections/engine.ts — ajouter CFE-CGC comme 4e syndicat avec poids spécifique cadres (10% en moyenne)"
biais_reconnu: "Civ-VI — je trouve Paritas léger en combinatoire."
```

**Entretien** :
- Q1 : « Choisir Berger — réformiste. »
- Q2 : « Tour 4. »
- Q3 : « Tour 22 — Matignon côté cadre. »
- Q4 : « Berger. Réformisme nuancé. »
- Q5 : « Le scénario cadre dirigeant. »
- Q6 : « Pas de CFE-CGC en Élections. »
- Q7 : « Oui — tester la version avec CFE-CGC. »
- Q8 : « À mon syndicat — feedback constructif. »
- Q9 : « Pourquoi 3 syndicats et pas 4 ou 5. »
- Q10 : « Berger. Voix juste. »

**Désaccord notable** avec **Léa** (#20) et **Sami** (#22) : Théo veut **CFE-CGC**, Léa veut **commerce**, Sami veut **plateformes**. → 3 absences distinctes.

---

## Agent 22 — Sami L. · Cible 18-30

**Setup** : PS5 désactivée · iPhone 14 · Compulsif · Salarié · Pelletier · 12 tours.

**Journal** : J'ai pas de syndicat, je suis « auto-entrepreneur ». Le jeu commence et je dois choisir un syndicat. **Aucun ne représente les coursiers**. Je prends Pelletier (anarcho-féminisme — la plus proche du CLAP). Tour 5 : j'ai aimé le dialogue avec une ouvrière de 1908 qui parle de la « solidarité hors syndicat ». Tour 8 : 2017 ordonnances Macron — pas de scénario plateforme. C'est l'année où Deliveroo est devenu Deliveroo. **Trou** énorme. Tour 12 : je quitte. Pas mon monde.

**Fiche** :
```yaml
agent: 22
nom: "Sami L."
corps: "Cible 18-30"
tour_comprehension: 5
moment_marquant: "Tour 5 — Pelletier 1908, 'la solidarité hors syndicat'. Mon CLAP la dit déjà."
moment_decrochage: "Tour 8 — 2017 sans plateformes."
nps: 5
fix_prioritaire: "src/game/content/scenarios/2017-ordonnances.ts + 2020-uberisation.ts — ajouter scénario 'salariés des plateformes' avec choix CLAP/Solidaires/auto-entrepreneuriat"
biais_reconnu: "Je peux être radical — un jeu syndical sans plateformes c'est mort."
```

**Entretien** :
- Q1 : « Chercher mon syndicat — pas trouvé. Choisir Pelletier en remplaçement. »
- Q2 : « Tour 5. »
- Q3 : « Aucun — pas de choix qui parle. »
- Q4 : « Pelletier. La seule. »
- Q5 : « Solidarité hors syndicat 1908. »
- Q6 : « 2017 sans plateforme. »
- Q7 : « Pas tant qu'il n'y a pas Deliveroo. »
- Q8 : « À mon collectif CLAP — pour qu'ils l'engueulent en email. »
- Q9 : « Pourquoi 2010-2020 c'est creux. »
- Q10 : « Pelletier. Garde-la. »

**Désaccord notable** avec **Bruno CPME** (#30) : Sami veut **plateformes côté salarié**, Bruno veut **PME côté patron**. Les 2 absents.

---

## Agent 23 — Aïcha M. · Cible 18-30

**Setup** : iPad Air · Compulsif · Salarié · Bouvier · 18 tours.

**Journal** : Je joue Bouvier (mutualité fin XIXe). Le mode Compulsif fait monter une voix intérieure « tu es épuisée, tu dors mal ». Je reconnais l'épuisement émotionnel. Tour 8 : un side event hôpital de campagne XIXe — première fois que mon métier remonte. Tour 12 : grève hospitalière 2022 ? **Absente**. Tour 15 : Pelletier mentionnée mais pas en légendaire jouable (dépendant du roster). Femmes racisées : 0 nom historique. Le jeu a une voix féminine mais pas une voix de **femme racisée soignante**.

**Fiche** :
```yaml
agent: 23
nom: "Aïcha M."
corps: "Cible 18-30"
tour_comprehension: 7
moment_marquant: "Tour 8 — voix intérieure 'tu es épuisée'. Je l'ai sentie physiquement."
moment_decrochage: "Tour 12 — grève hospitalière 2022 absente. C'est ma vie, c'est pas dans le jeu."
nps: 6
fix_prioritaire: "src/game/content/scenarios/2022-greve-hospitaliere.ts — créer scénario AP-HP avec voix d'aide-soignante + au moins 1 nom féminin racisé historique (ex: Eunice Foote ou figure CGT-Santé)"
biais_reconnu: "Je peux être plus dure que la moyenne sur l'inclusion."
```

**Entretien** :
- Q1 : « Choisir Compulsif — habitude de fatigue. »
- Q2 : « Tour 7. »
- Q3 : « Tour 14 — grève dure ou conciliation. »
- Q4 : « La voix intérieure de Bouvier — proche de la mienne. »
- Q5 : « Voix intérieure 'tu es épuisée'. »
- Q6 : « Grève 2022 absente. »
- Q7 : « Oui — pour 2022 quand il sera ajouté. »
- Q8 : « À ma collègue Fatima. »
- Q9 : « Pourquoi pas de femme racisée au roster. »
- Q10 : « Voix intérieure Compulsif. Garde-la. »

**Désaccord notable** avec **Beaud** (#16) : Aïcha veut **hôpital + racisation**, Beaud veut **usine + classe**. Compatibles.

---

## Agent 24 — Pascal V. · Accessibilité

**Setup** : Windows 11 · JAWS 2024 · Firefox · Salarié · Jouhaux · 10 tours.

**Journal** : Écran d'accueil : titre annoncé ✅, sous-titre annoncé ✅, bouton Commencer annoncé ✅. Tab order tour 1 : header → ticker (silencieux car role=marquee) → portrait acteur → choix narratifs ❌ chemin chaotique, je dois Tab 14 fois pour atteindre les choix. Modale tour 5 : focus trap ✅. Bouton fermeture sans `aria-label` ❌. Jauge tour 6 : « 55 » sans contexte ❌, devrait être « Confiance, 55 sur 100 ». LayoutSwitcher tour 8 : pas dans tab order ❌. Sceau de cire pulse 8s : aucun signal sonore JAWS ❌.

**Fiche** :
```yaml
agent: 24
nom: "Pascal V."
corps: "Accessibilité"
tour_comprehension: 6
moment_marquant: "Focus trap modales — implémenté juste."
moment_decrochage: "Tab order chaotique, 14 Tab pour atteindre les choix."
nps: 3
fix_prioritaire: "src/components/cockpit/CockpitTopHeader.svelte + DialogueScene.svelte — ajouter tabindex correct, aria-label sur jauges (Confiance, 55 sur 100), pause sur ticker, sceau accessible clavier"
biais_reconnu: "Mon JAWS est différent d'un nouvel utilisateur."
```

**Entretien** :
- Q1 : « Tab depuis l'accueil. »
- Q2 : « Tour 6. »
- Q3 : « Aucun — mes choix sont navigation, pas narratif. »
- Q4 : « Frachon, JAWS annonce son nom AVANT sa réplique. »
- Q5 : « Focus trap modales. »
- Q6 : « Tab order. »
- Q7 : « Oui — après corrections. »
- Q8 : « À l'asso Valentin Haüy. »
- Q9 : « Pourquoi LayoutSwitcher hors tab order. »
- Q10 : « Focus trap. Ne touche pas. »

**Désaccord notable** avec **Pope** (#04) et **Soueidan** (#03) : Pascal veut **plus d'aria**, Pope veut **moins**, Soueidan veut **mieux**.

---

## Agent 25 — Manon E. · Accessibilité

**Setup** : MacBook · Chrome · OpenDyslexic activé · Compulsif · Salarié · Pelletier · 12 tours.

**Journal** : Pas d'option **OpenDyslexic** native. Source Serif 4 est OK pour moi avec mes outils, mais le **Cinzel ALL CAPS** sur les valeurs numériques est illisible (`f` et `t` se confondent). Le top-header avec 7 chips : je suis noyée, je ferme l'onglet 3 fois en 12 tours. Le ticker défile : distraction TDAH max. Le mode FALC (vu sur un scénario tour 9) : **vrai FALC** ✅, paragraphes courts, vocabulaire simple. Bon. Mais activé tard. Une option « FALC dès le début » serait magique.

**Fiche** :
```yaml
agent: 25
nom: "Manon E."
corps: "Accessibilité"
tour_comprehension: 4
moment_marquant: "Tour 9 — FALC apparaît, je respire."
moment_decrochage: "Tour 1-8 — top-header dense, ticker en fond, je ferme l'onglet."
nps: 4
fix_prioritaire: "src/components/Settings.svelte + app.css — ajouter option 'OpenDyslexic + FALC + ticker pause' en preset 'cognitive-friendly' au launch"
biais_reconnu: "TDAH = NPS bas, je peux sous-noter."
```

**Entretien** :
- Q1 : « Activer OpenDyslexic. Pas trouvé en option. »
- Q2 : « Tour 4. »
- Q3 : « Aucun — j'étais en surcharge. »
- Q4 : « Pelletier. Mode Compulsif aide. »
- Q5 : « FALC tour 9. »
- Q6 : « Top-header dense. »
- Q7 : « Oui — avec preset cognitive. »
- Q8 : « À mon asso étudiants dys. »
- Q9 : « Pourquoi le Cinzel ALL CAPS sur les valeurs. »
- Q10 : « FALC. Garde-le. »

**Désaccord notable** avec **Pope** (#04) : Manon veut **simplification visuelle**, Pope veut **moins d'éléments mais sophistiqués**. Compatibles avec preset.

---

## Agent 26 — Jules O. · Scolaire

**Setup** : MacBook lycée · Réfléchi · Salarié · Jouhaux · 25 tours.

**Journal** : Je joue Jouhaux (Amiens 1906, programme SES). Tour 1-5 : reconnaissance — c'est mon manuel mais animé. Glossaire : couvre 80% des notions du programme ✅. Tour 9 : un side event « grève des Canuts » qui n'est pas au programme mais qui éclaire. Tour 18 : Mai 68 → Grenelle. Match parfait avec mon prof. Tour 25 : Matignon-écho, je signe le journal IA. **C'est devenu mon devoir maison.**

**Fiche** :
```yaml
agent: 26
nom: "Jules O."
corps: "Scolaire"
tour_comprehension: 3
moment_marquant: "Tour 18 — Grenelle conforme manuel SES."
moment_decrochage: "Aucun majeur en 25 tours."
nps: 9
fix_prioritaire: "src/game/narrative/journalAI.ts — option 'mode devoir maison' qui génère 600 mots structuré (intro/argumentation/conclusion) pour reprise scolaire"
biais_reconnu: "Je confonds rigueur académique et qualité ludique. Le jeu m'a peut-être semblé bon parce qu'il m'a aidé à réviser."
```

**Entretien** :
- Q1 : « Choisir Jouhaux — c'est dans le programme. »
- Q2 : « Tour 3. »
- Q3 : « Tour 18 — Grenelle ANI ou rejet. »
- Q4 : « Jouhaux. Évidemment. »
- Q5 : « Match avec mon manuel. »
- Q6 : « Le mode Compulsif, je l'ai pas activé — sonne pas sérieux. »
- Q7 : « Oui — pour le bac. »
- Q8 : « À mon prof Mme Renaud — outil de cours. »
- Q9 : « Le mode Compulsif. Je l'ai évité. »
- Q10 : « Glossaire. Garde-le. »

**Désaccord notable** avec **McGonigal** (#06) : Jules veut **devoir maison**, McGonigal veut **call to action**. Compatibles via 2 modes journal.

---

## Agent 27 — Camille D. · Scolaire

**Setup** : MacBook Nanterre · Réfléchi · Salarié · Bouvier · 30 tours · comparaison Disco Elysium.

**Journal** : Disco Elysium : 24 skills qui parlent au joueur. PARITAS : 6 ressources qui chiffrent. **Disparité expressive**. Le mode Compulsif : voix intérieures bien là, mais 4 voix génériques (le moi militant, le moi fatigué, le moi cynique, le moi solaire). Disco a 24 voix. Tour 12 : un dialogue avec Frachon — proche de Kim Kitsuragi en sobriété mais sans la profondeur émotionnelle. Tour 25 : un Suzerain-moment (négociation Matignon) tient bien. Le textuel est 70% Disco-niveau.

**Fiche** :
```yaml
agent: 27
nom: "Camille D."
corps: "Scolaire"
tour_comprehension: 4
moment_marquant: "Tour 25 — Matignon, Suzerain-grade. Bien tenu."
moment_decrochage: "Tour 8 — voix intérieures Compulsif, 4 archétypes. Disco en a 24."
nps: 7
fix_prioritaire: "src/game/narrative/personalityEngine.ts — étendre les voix Compulsif de 4 à 8-12 archétypes (analogie skills Disco), modulables par trait dominant"
biais_reconnu: "Disco a coûté 5M$, Paritas 0$ — comparaison injuste."
```

**Entretien** :
- Q1 : « Choisir Bouvier (sujet de mémoire). »
- Q2 : « Tour 4. »
- Q3 : « Tour 22 — étendre la mutualité aux femmes. »
- Q4 : « Bouvier. Voix solide. »
- Q5 : « Matignon-écho tour 25. »
- Q6 : « 4 voix Compulsif. »
- Q7 : « Oui — pour la profondeur narrative. »
- Q8 : « À mon directeur de mémoire. »
- Q9 : « Pourquoi 4 archétypes seulement. »
- Q10 : « Matignon. Tient. »

**Désaccord notable** avec **Yanis** (#19) : Camille veut **plus de texte**, Yanis veut **moins**. Tension expert/novice.

---

## Agent 28 — Lukas K. · Hors-France

**Setup** : ThinkPad Stuttgart · Réfléchi · Salarié · Jouhaux · 15 tours en français B2.

**Journal** : « Paritarisme » — je devine via cognat (« Parität »). OK. Tour 3 : la CGT est radicale, OK. La CFDT est réformiste, OK. **FO** : je confonds avec un sigle technique pendant 8 tours. Mitbestimmung : 0 mention. Allemagne 1949 : 0 référence. Mon modèle de cogestion n'apparaît jamais. Tour 12 : Matignon 1936 — l'État médiateur est central, c'est différent de l'Allemagne (pas d'État entre patron et syndicat). **Je retiens ce point**. Bon enseignement. Tour 15 : journal IA me dit que j'ai joué « comme un cadre allemand habitué au consensus ». Bon analyseur.

**Fiche** :
```yaml
agent: 28
nom: "Lukas K."
corps: "Hors-France"
tour_comprehension: 6
moment_marquant: "Tour 12 — l'État français comme médiateur, ≠ Allemagne. Je retiens."
moment_decrochage: "Tour 1-8 — FO confondue avec sigle technique."
nps: 7
fix_prioritaire: "src/lib/data/glossary.ts — au premier hover sur 'FO', popup explicatif 'Force Ouvrière, scission CGT 1947' (pas glossaire à chercher)"
biais_reconnu: "Je compare en permanence à l'Allemagne."
```

**Entretien** :
- Q1 : « Lire le glossaire — habitude internationale. »
- Q2 : « Tour 6. »
- Q3 : « Tour 11 — Matignon : signer ou rompre. »
- Q4 : « Frachon. La CGT comme contre-modèle d'IG Metall. »
- Q5 : « État médiateur 1936. »
- Q6 : « FO confondue avec sigle. »
- Q7 : « Oui — pour reproduire avec un collègue allemand. »
- Q8 : « À l'OFAJ — pour traduction allemande. »
- Q9 : « Pourquoi pas de scénario Mitbestimmung. »
- Q10 : « État médiateur. Ne change pas. »

**Désaccord notable** avec **Friot** (#15) : Lukas veut **comparaison nationale**, Friot veut **profondeur classe**. Compatibles.

---

## Agent 29 — Hélène F. · Patronat

**Setup** : MacBook · Théâtre · Patron · Lambert-Ribot puis Schneider · 25 tours.

**Journal** : Côté patron 1936 Lambert-Ribot. La position patronale est restituée comme **rationnelle** ✅, pas seulement idéologique. Le scénario explique : « la Confédération générale du patronat français refuse car elle perd 60% de la production en 3 mois ». OK, c'est juste. Tour 14 : option « corruption préfet » — j'ai été tentée, j'ai refusé pour `Cohésion Interne`. Le jeu m'a laissée jouer le patron éthique. Bien. Tour 22 : ressource « Lobbying » — caricature : c'est juste de l'influence en RP/relations institutionnelles. Le mot « lobbying » est négatif en France, pas neutre. Trahison de la profession.

**Fiche** :
```yaml
agent: 29
nom: "Hélène F."
corps: "Patronat"
tour_comprehension: 5
moment_marquant: "Tour 14 — option 'corruption préfet' refusable, le patron éthique existe."
moment_decrochage: "Tour 22 — ressource 'Lobbying' caricaturale."
nps: 7
fix_prioritaire: "src/game/types.ts + lib/data/glossary.ts — renommer 'Lobbying' en 'Influence institutionnelle' ou 'Représentation' (terme neutre côté patron)"
biais_reconnu: "Je peux être trop défensive du camp patron."
```

**Entretien** :
- Q1 : « Choisir patron — par curiosité. »
- Q2 : « Tour 5. »
- Q3 : « Tour 14 — corruption préfet. »
- Q4 : « Lambert-Ribot. Voix professionnelle. »
- Q5 : « Patron éthique possible. »
- Q6 : « 'Lobbying'. »
- Q7 : « Oui — pour Schneider. »
- Q8 : « À l'ANDRH. »
- Q9 : « Pourquoi 'Lobbying' et pas 'Influence'. »
- Q10 : « Patron éthique = vraie option. Garde-le. »

**Désaccord notable** avec **Friot** (#15) : Hélène veut **patron rationnel**, Friot veut **patron politique**. Tension idéologique structurante.

---

## Agent 30 — Bruno P. · Patronat

**Setup** : iPad Pro · Atelier · Patron · Asselin (CPME 2020) · 20 tours.

**Journal** : Asselin existe ✅ (CPME). Picon (artisanat) **absent**. Tour 1-10 : la NAO est calibrée pour grand groupe (60 pts, 4 thèmes complexes). Chez moi, on signe en 2 séances avec un délégué unique. Tour 14 : un scénario TPE 2020 → présent ✅, voix juste. Tour 18 : la « Caisse » à 50 000 (niveau) : c'est du grand groupe. Une PME a 2 000 dans la caisse de bonne année. Tour 20 : journal IA me dit « bonne stratégie d'asset » — je ne sais pas ce que ça veut dire.

**Fiche** :
```yaml
agent: 30
nom: "Bruno P."
corps: "Patronat"
tour_comprehension: 5
moment_marquant: "Tour 14 — scénario TPE Asselin, je m'y reconnais."
moment_decrochage: "Tour 1 — NAO format grand groupe, mon entreprise n'a pas 60 pts à dépenser."
nps: 6
fix_prioritaire: "src/game/ateliers/nao/engine.ts — preset 'TPE/PME' (3 séances, 2 thèmes, enveloppe 24 pts) débloqué pour Asselin/Picon, plus court et plus crédible"
biais_reconnu: "Je survalorise la spécificité TPE/PME."
```

**Entretien** :
- Q1 : « Choisir Asselin — CPME, mon syndicat patronal. »
- Q2 : « Tour 5. »
- Q3 : « Tour 14 — TPE 2020 : signer ou rompre. »
- Q4 : « Asselin. Voix juste. »
- Q5 : « TPE 2020 reconnu. »
- Q6 : « NAO format grand groupe. »
- Q7 : « Oui — quand le preset PME existera. »
- Q8 : « À mon UD CPME — pour le débat. »
- Q9 : « Pourquoi 60 pts et pas 24. »
- Q10 : « Asselin. Garde-le. »

**Désaccord notable** avec **Sami** (#22) : Bruno veut **PME comme victime de la complexité**, Sami veut **plateformes comme victimes du non-droit**. Les 2 absents structurellement.

---

# Synthèse rapide pour Argus

## Distribution NPS
- Tier A moyenne : 6.4 / 10 (18 agents : Krug 5, Soueidan 4, Pope 6, Romero 8, McGonigal 8, Villani 7, Ghys 3, Fåhraeus 6, Johnson 6, Duflo 7, Goodwin 6, Muratori 6, Carmack 5, Friot 7, Beaud 6, Jobert 6, Béroud 6, Wroblewski 6)
- Tier B moyenne : 5.7 / 10 (12 agents : Yanis 4, Léa 7, Théo 6, Sami 5, Aïcha 6, Pascal 3, Manon 4, Jules 9, Camille 7, Lukas 7, Hélène 7, Bruno 6)
- **Moyenne globale 30 agents : 6.1 / 10** ❌ cible Argus 7.0

## Top 5 frictions transverses (≥ 4 mentions)
1. **`CockpitTopHeader.svelte:9-17` — 7 jauges trop denses en Carnet** (Wroblewski, Krug, Manon, Pascal, Yanis = 5 mentions)
2. **`NewsTicker.svelte:122` — `role="marquee"` au lieu d'`aria-live`** (Soueidan, Pascal, Manon, Wroblewski, Pope = 5 mentions)
3. **Pas de feedforward avant les choix** (Johnson, Krug, Wroblewski, Yanis = 4 mentions)
4. **CFE-CGC + plateformes + TPE absents** (Théo, Sami, Bruno, Béroud = 4 mentions)
5. **Voix Compulsif limitée à 4 archétypes** (Camille, Aïcha, Manon, Yanis = 4 mentions)

## Top 5 plaisirs transverses
1. **Sceau de cire pulse 8s diégétique** (Pope, Krug, Wroblewski, Carmack = 4 mentions positives)
2. **Frachon — voix qui tient** (Fåhraeus, Soueidan, Wroblewski, Camille = 4 mentions)
3. **Glossaire couvre 80% programme SES** (Jules, McGonigal, Lukas = 3 mentions)
4. **Patron jouable sans honte** (Romero, Hélène = 2 mentions, fortes)
5. **Mode Compulsif sonne juste pour la fatigue** (Aïcha, Camille = 2 mentions, très juste)

## Désaccords structurants (à arbitrer en focus group)
- **Pope vs Yanis** : sobriété vs feedback animé (FG-1)
- **Krug vs Camille** : tutoriel structuré vs Disco-style libre (FG-1 + FG-5)
- **Friot vs Hélène** : patron politique vs patron rationnel (FG-3)
- **Soueidan vs Pope** : `aria-label` vs UI-cleanup (FG-4)
- **Johnson vs Yanis** : transparence formules vs un seul chiffre (FG-2)

→ **5 focus groups thématiques** à animer pour résoudre ces tensions.
