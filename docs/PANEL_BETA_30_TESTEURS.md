# PANEL BÊTA — 30 testeurs · Composition Stratèges (Corps IV Argus)

**Date** : 2026-05-08 (soir)
**Mandat** : Argus → Corps IV (Stratèges)
**Référent** : `docs/V3_ARGUS_BETA_TESTEUR.md` § "Limites assumées" + "Évolution prévue"

> *« Le panel composite Argus simule. La bêta valide. La bêta ne se simule pas — elle se recrute. »*
> — Doctrine Stratèges

---

## I. Méthode de composition

Le panel des 202 personas (`PANEL_202_PERSONAS.csv`) et le curated des 50 (`V3_PANEL_50_CURATED.md`) sont des **outils internes d'audit** — ils alimentent l'agent Argus. Ils ne constituent **pas** un panel bêta utilisable tel quel : 80 % des personas sont des chercheurs/figures publiques contactables uniquement via leur affiliation, et certaines sont décédées (Le Goff †2014, Bourdieu †2002, Castel †2013, Latour †2022, etc.).

**Stratégie en 2 tiers** :

- **Tier A — 18 contacts depuis les armées Argus** : experts vivants, accessibles via mail/LinkedIn/Twitter/HAL, chacun apporte une **lentille spécialisée** mappée sur les 5 corps. Recrutement nominatif, taux d'acceptation réaliste 30-40 % → on en vise 18 pour en obtenir 5-7.
- **Tier B — 12 profils manquants à recruter activement** : profils sous-représentés signalés explicitement par `V3_ARGUS_BETA_TESTEUR.md` § "Évolution prévue" + analyse critique des 30 catégories du panel 202. Recrutement par canaux dédiés (forums, partenariats, snowball).

**Cible utilisable** : 30 contacts initiaux → ~12-18 sessions effectives jouées (taux d'acceptation 40-60 %).

---

## II. TIER A — 18 contacts issus des armées Argus

### Corps I — ARCHITECTES (UX + game design + pédagogie) · 6 contacts

| # | Nom | Affiliation | Lentille spécifique | Méthode de contact | Priorité |
|---|-----|-------------|---------------------|--------------------|---------:|
| 1 | **Luke Wroblewski** | Google — Mobile First | Dégradation gracieuse mobile/Carnet 390px (→ persona "lycéen 16 ans" non couvert) | Twitter @lukew, mail public | **P0** |
| 2 | **Steve Krug** | Auteur *Don't Make Me Think* | Friction sur les 3 premières minutes (premier choix narratif) | Mail via éditeur, LinkedIn | **P0** |
| 3 | **Hadi Soueidan** | A11y / ARIA spécialiste | Lecteur d'écran + contraste WCAG AA (ticker non `aria-live`) | Twitter, conférences a11y | **P0** |
| 4 | **Lucas Pope** | Papers Please / Obra Dinn | Sobriété intentionnelle — validation des animations subtiles | Mail studio, Twitter | P1 |
| 5 | **Brenda Romero** | Romero Games — *Train* | Éthique du jeu mémoriel sur sujet historique lourd (1940 Charte, 1947 scission) | Mail Romero Games | P1 |
| 6 | **Jane McGonigal** | Institute for the Future | Serious games civiques — debrief mode post-partie (`V3_ARGUS_PLAN_DE_CHARGE` → cible) | Mail IFTF, Twitter | P1 |

**Charge attendue** : 1 session × 30 min, retour écrit 1 page. Coût : 0 € (gratuit, prestige).

### Corps II — GÉOMÈTRES (math + équilibrage + Monte-Carlo) · 2 contacts

| # | Nom | Affiliation | Lentille spécifique | Contact | Priorité |
|---|-----|-------------|---------------------|---------|---------:|
| 7 | **Cédric Villani** | IHP — Médaille Fields, vulgarisation | Audit des courbes d'équilibrage (NAO, Élections distrib.) | Mail IHP, suite éditoriale | P1 |
| 8 | **Étienne Ghys** | ENS Lyon — dynamiques | Équilibre stochastique des ressources, RNG seedé reproductible | Mail ENS, HAL | P1 |

### Corps III — DIPLOMATES (IA adverse + dialogue + négociation) · 2 contacts

| # | Nom | Affiliation | Lentille spécifique | Contact | Priorité |
|---|-----|-------------|---------------------|---------|---------:|
| 9 | **Henrik Fåhraeus** | Paradox — Crusader Kings 3 | Profondeur des relations entre acteurs (Base/Adversaire/État/Opinion sous-développés) | Mail Paradox, Twitter | **P0** |
| 10 | **Soren Johnson** | Mohawk Games — Civ IV, Old World | Transparence du modèle (« je veux voir EXACTEMENT pourquoi un score est X ») | Mail Mohawk, Twitter | P1 |

### Corps IV — STRATÈGES (panel + bêta + vision long terme) · 2 contacts

| # | Nom | Affiliation | Lentille spécifique | Contact | Priorité |
|---|-----|-------------|---------------------|---------|---------:|
| 11 | **Esther Duflo** | MIT, Nobel — RCT | Possibilité d'extraire des **données comparatives** du jeu (% des joueurs qui signent Matignon, etc.) → Paritas comme outil de recherche | Mail MIT Poverty Action Lab | P1 |
| 12 | **Kim Goodwin** | Goal-Directed Design | Définir 3 personas cibles + tester les 3 funnels (testeur novice / syndicaliste / prof) | LinkedIn, mail public | **P0** |

### Corps V — SAPEURS (audit code + tests + dette) · 2 contacts

| # | Nom | Affiliation | Lentille spécifique | Contact | Priorité |
|---|-----|-------------|---------------------|---------|---------:|
| 13 | **Casey Muratori** | Handmade Hero — philosophie ingénierie | Simplicité du code, absence d'abstraction inutile (`gameState.svelte.ts` à 600+ lignes mérite un split) | Twitter, mail | P1 |
| 14 | **John Carmack** | Anthropic / id Software | Performance brute, bundle 437 KB (cible <300 KB code-splitting par ère) | Twitter, conférences | P2 |

### Hors corps — Chercheurs paritarisme · 4 contacts

| # | Nom | Affiliation | Lentille spécifique | Contact | Priorité |
|---|-----|-------------|---------------------|---------|---------:|
| 15 | **Bernard Friot** | Paris Nanterre — Réseau Salariat | Salaire socialisé · « Institution » comme **capital salarial conquis** | Mail Réseau Salariat | **P0** |
| 16 | **Stéphane Beaud** | Univ. de Poitiers — sociologie ouvrière | Voix ouvrière contemporaine 1980-2000 (Florange, Goodyear, Whirlpool) | Mail Univ. Poitiers, HAL | **P0** |
| 17 | **Annette Jobert** | Sociologue — paritarisme européen | Comparaison France/Allemagne/Italie/Suède implicite (cogestion, syndicat unique) | Mail / IRES | P1 |
| 18 | **Sophie Béroud** | Lyon 2 — syndicalisme aux marges | Syndicalismes périphériques (services, plateformes, SUD-Solidaires) | Mail Lyon 2, Twitter | P1 |

---

## III. TIER B — 12 profils manquants à recruter activement

### Cible primaire : jeunes salariés 18-30 (5 contacts)

C'est **la cible déclarée du jeu** dans `INDEX-MAITRE-2026.md`. **Aucun profil de cette tranche n'existe dans le panel 202.** C'est le trou le plus critique.

| # | Profil | Recherche dans | Verdict-cible |
|---|--------|----------------|---------------|
| 19 | **Apprenti·e en alternance, 19-21 ans, métallurgie/transport/services** | CFA, contacts FNPF, Mission Locale | Le terrain n'a-t-il pas vieilli ? Vivait-il déjà la NAO 2024 quand le jeu commence ? |
| 20 | **Caissier·e / employé·e libre-service, 22-25 ans, première NAO récente** | Réseau syndical CFDT-Services / FO-FGTA | La NAO du jeu correspond-elle à la sienne ? Le ton sonne-t-il vrai ? |
| 21 | **Ingénieur·e R&D 26-30 ans, syndiqué·e CFE-CGC** | LinkedIn ciblé "syndicaliste cadre 30 ans" | Le persona "cadre catégoriel CFE-CGC" est explicitement non couvert (cf. `V3_PANEL_50_CURATED.md` §I.4) |
| 22 | **Travailleur·se de plateforme (Uber/Deliveroo), 23-28 ans** | Collectifs CLAP / Coursiers en colère | Le jeu rend-il compte du salariat ubérisé ? (Béroud §Tier A le réclame) |
| 23 | **Aide-soignant·e hospitalier, 24-28 ans, post-Covid** | Réseaux SUD-Santé / CGT-Santé | La grève de 2022-2023 hospitalière trouve-t-elle un écho dans le jeu ? |

**Recrutement** : annonce dédiée sur le site Réseau Salariat + relais syndicats jeunes (UNEF, Unsa Jeunes, Génération Précaires). **Indemnisation 30 € / session** recommandée.

### Profils accessibilité / neurodivergence (2 contacts)

`V3_ARGUS_BETA_TESTEUR.md` § "Évolution prévue" — explicitement signalé comme **angle mort du panel**.

| # | Profil | Recherche dans | Verdict-cible |
|---|--------|----------------|---------------|
| 24 | **Joueur·se utilisant lecteur d'écran (NVDA / VoiceOver)** | Association Valentin Haüy, forum a11y FR | Le ticker non-`aria-live` est-il bloquant ? Le LayoutSwitcher est-il navigable au clavier ? |
| 25 | **Joueur·se dyslexique / TDAH** | Association FFDys, forums HelloDyslexia | Le mode FALC est-il vraiment lisible ? La densité du top-header est-elle gérable ? |

**Recrutement** : partenariat avec une asso d'accessibilité numérique (Valentin Haüy, FFDys), session compensée 30 €.

### Profils scolaires (2 contacts)

L'usage pédagogique est mentionné comme cas d'usage dans le README. Aucun lycéen / étudiant L1-L2 dans le panel 202.

| # | Profil | Recherche dans | Verdict-cible |
|---|--------|----------------|---------------|
| 26 | **Lycéen·ne 16-17 ans, terminale, programme SES** | Lycée partenaire (1 enseignant SES = 30 élèves) | Persona « lycéen 16 ans » explicitement signalé non-traité (Cooper §Tier A #4) |
| 27 | **Étudiant·e L2 sciences sociales / droit du travail** | Associations étudiantes Paris-Sorbonne / Nanterre | Le jeu peut-il servir de support de TD ? Quelle progression pédagogique ? |

**Recrutement** : démarchage 3-5 enseignants SES + 2 prof. droit social → 1 ou 2 acceptent → accès classe.

### Profil hors-France (1 contact)

Argus signale : *« Joueurs hors du contexte français (qui découvriraient le paritarisme par le jeu) »*. Le doc V3_PANEL_50_CURATED §39 (Annette Jobert) demande aussi cette comparaison — mais elle viendra côté académique. Côté usage, manque le **joueur étranger naïf**.

| # | Profil | Recherche dans | Verdict-cible |
|---|--------|----------------|---------------|
| 28 | **Salarié·e allemand·e 25-35 ans, Mitbestimmung connue** | LinkedIn DGB / IG Metall, Erasmus francophones | Le jeu produit-il une lecture comparable au modèle de cogestion allemand ? Le mot "paritarisme" parle-t-il sans glossaire intensif ? |

**Recrutement** : contact via réseau Goethe-Institut Paris ou OFAJ.

### Côté patronat — manque criant (2 contacts)

Le panel 202 contient des **figures patronales historiques** (Schneider, Seillière, Roux de Bézieux) mais **aucun praticien actuel non-figure**. La doctrine paritarisme exige que « le patronat ne soit pas caricatural » (`V3_VERTICAL_SLICE_MATIGNON.md` §Critères).

| # | Profil | Recherche dans | Verdict-cible |
|---|--------|----------------|---------------|
| 29 | **DRH d'ETI 200-2000 salariés, 35-50 ans** | LinkedIn ANDRH (Asso Nationale DRH) | Le camp patron est-il jouable sans ressentiment ? Les choix patronaux ont-ils du sens en 2026 ? |
| 30 | **Délégué·e syndical·e patronal·e (CPME / U2P / MEDEF local)** | Annuaire CPME régionale | La ressource « Lobbying » correspond-elle à son métier réel ? Les tactiques patronales sont-elles plausibles ? |

---

## IV. CATÉGORIES SOUS-REPRÉSENTÉES — analyse critique du panel 202

Le panel 202 couvre 30 catégories. Voici les **6 catégories absentes ou sous-représentées** que la bêta réelle doit combler :

| # | Catégorie absente / faible | Pourquoi c'est un trou | Profil ajouté Tier B |
|---|----------------------------|------------------------|----------------------|
| 1 | **Salariés ordinaires 18-30 (cible déclarée)** | 0 sur 202. Le panel parle de jeunes salariés sans en avoir un seul. | #19-23 |
| 2 | **Joueurs en situation de handicap réelle** | Seul Grandin (autisme) en proxy ; aucun lecteur d'écran réel testant le HUD. | #24, #25 |
| 3 | **Lycéens 16-18 / étudiants L1-L2** | Mentionné par Cooper et Charlot, mais aucun élève réel dans le panel. | #26, #27 |
| 4 | **Joueurs hors France (naïfs)** | Jobert/Pernot couvrent l'académique européen ; aucun joueur étranger candide. | #28 |
| 5 | **Praticiens RH/patronaux contemporains** | Figures historiques uniquement (Schneider, Seillière). Aucun DRH actif 2026. | #29, #30 |
| 6 | **Joueurs neuro-divergents non célèbres** | Grandin/Thunberg/Hopkins/Tammet sont des figures publiques — pas représentatifs du joueur lambda neurodivergent. | #25 (TDAH) |

### Catégories bien couvertes (à NE PAS dupliquer en bêta)
- Sociologues académiques du paritarisme : Castel, Friot, Jobert, Beaud, etc. → couverts en Tier A
- Game designers grands noms : Pope, Romero, Chen, etc. → couverts en Tier A
- Historiens : Boucheron, Perrot, Noiriel → couverts en Tier A indirectement (via lectures)

### Catégories du panel 202 dont la bêta peut se passer (faible ROI)
- Mathématiciens Fields : 1-2 suffisent (Villani #7) — l'audit math est déjà fait par les Géomètres internes (scripts MC).
- Nobel : 1 suffit (Duflo #11) — diversifier les Nobel n'apporte rien à un jeu de simulation.
- Artistes 2026 / Sound designers : reportés post-bêta (le son n'est pas encore au cœur de l'expérience).

---

## V. PROTOCOLE DE RECRUTEMENT (J-15 à J-1)

### Phase 1 — J-15 à J-10 : Tier A (experts)

**Mail-type "expert"** :

```
Objet : Paritas — bêta privée d'un jeu sur l'histoire du paritarisme français
        (10 min de votre temps)

Bonjour [Nom],

Je développe Paritas, un jeu de simulation narratif sur 25 siècles
de paritarisme français (Antiquité → 2026, 100 tours, mobile-first).
Le moteur, les 10 ateliers et le contenu sont en place ; nous
préparons la première bêta privée fin mai 2026.

Votre travail sur [LENTILLE SPÉCIFIQUE] nous a directement nourris :
nous avons documenté en interne ce que vous chercheriez en priorité
sur ce build (cf. V3_PANEL_50_CURATED.md §[N]).

Demande : 1 session de jeu ~30 min sur navigateur, retour écrit
1 page (ou simple email). Pas d'indemnisation, juste l'attribution
dans les crédits si vous acceptez d'être cité·e.

URL bêta privée : [À ENVOYER J-2]
Calendrier souhaité : entre [DATE] et [DATE+10j].

Merci pour votre temps,
Zachary Delpeyrou — Paritas
```

### Phase 2 — J-10 à J-5 : Tier B profils manquants

- **Jeunes salariés (#19-23)** : annonce sur Réseau Salariat + relais syndicats jeunes. **Indemnisation 30 €**.
- **Accessibilité (#24, 25)** : partenariat asso (Valentin Haüy / FFDys). **Indemnisation 30 €**.
- **Scolaires (#26, 27)** : démarcher 5 enseignants SES en région parisienne, 1 acceptera (taux observé). Pas d'indemnisation directe, mais pack pédagogique en retour.
- **Hors-France (#28)** : Goethe-Institut Paris ou OFAJ. **Indemnisation 50 €** (effort linguistique).
- **Patronat (#29, 30)** : LinkedIn ANDRH ciblé. **Indemnisation 0 €** mais NDA possible.

### Phase 3 — J-5 à J-1 : confirmation + envoi URL bêta

- Envoi URL bêta privée (Vercel preview ou tag `v2.1.x-prebeta`)
- Compte de test par testeur (auth Supabase preview, non encore implémentée — pour l'instant URL publique masquée)
- Calendrier de sessions étalé sur 14 jours

---

## VI. PROTOCOLE DE BÊTA (J0 à J+14)

### Sessions individuelles

- **Durée cible** : 30 min (1 partie complète possible si Réfléchi rapide, sinon les 30 premiers tours + bilan).
- **Modalité** : libre, à distance, sur navigateur.
- **Retour attendu** : email 1 page OU formulaire structuré (ci-dessous).

### Formulaire de retour (5 questions)

1. **À quel tour avez-vous senti que vous compreniez la boucle ?** (mesure courbe d'apprentissage)
2. **Qu'avez-vous trouvé le plus surprenant ou marquant ?** (mesure mémoire)
3. **Qu'est-ce qui vous a fait quitter ou décrocher ?** (mesure friction)
4. **Recommanderiez-vous Paritas à un·e ami·e ? (NPS 0-10)** + pourquoi.
5. **Une chose à changer en priorité.** (top P0 selon le testeur)

### Métriques agrégées (post-bêta J+14)

| Métrique | Cible | Mesure |
|----------|------:|--------|
| Sessions effectives | ≥ 12 sur 30 | comptage |
| NPS moyen | ≥ 7/10 | moyenne Q4 |
| « Compréhension à tour ≤ 10 » | ≥ 60 % | Q1 ≤ 10 |
| Friction P0 commune (≥ 3 mentions) | identifier 3-5 | thématisation Q3+Q5 |
| Bug critique en prod | 0 | observation |

### Livrable Stratèges (J+15)

`docs/BULLETIN_BETA_30_AAR_2026-06-XX.md` consolidant :
- Distribution des 30 contacts (acceptés / refusés / sans réponse)
- Sessions effectives et leurs verdicts résumés
- Top 5 frictions communes priorisées P0/P1/P2
- Décision Argus : v2.2.0-beta-public ou nouveau cycle ORDA

---

## VII. SYNTHÈSE — qui contacter cette semaine

### **P0 — Cette semaine (8 contacts)**

| # | Nom | Corps |
|---|-----|-------|
| 1 | Luke Wroblewski | Architectes |
| 2 | Steve Krug | Architectes |
| 3 | Hadi Soueidan | Architectes |
| 9 | Henrik Fåhraeus | Diplomates |
| 12 | Kim Goodwin | Stratèges |
| 15 | Bernard Friot | Paritarisme |
| 16 | Stéphane Beaud | Paritarisme |
| 19 | Apprenti·e métallurgie 19-21 ans | Cible primaire |

### **P1 — Semaine 2 (15 contacts)**

Tous les autres Tier A + #20-23 (jeunes salariés) + #24-25 (accessibilité).

### **P2 — Semaine 3 (7 contacts)**

#14 Carmack, #26-30 (scolaires + hors-France + patronat).

---

## VIII. NOTE DE STRATÈGES

Le panel 202 est **excellent pour Argus** (audit composite simulé). Il est **partiel pour la bêta** (manque le joueur réel ordinaire, le profil cible 18-30, l'utilisateur en situation de handicap, le scolaire, l'étranger).

Le pli pris dans `V3_PANEL_50_CURATED.md` reste valide : on **priorise la lentille**, pas la notoriété. Mais en bêta, on ajoute une dimension absente du panel : la **représentativité de la cible**. Sans 5 jeunes salariés réels qui jouent, la bêta ne mesure pas ce qu'elle prétend mesurer.

> *Argus a 100 yeux pour simuler. La bêta nous donne 30 yeux pour voir vraiment. L'écart entre les deux est la mesure de notre humilité.*
>
> **— Stratèges (Corps IV), 2026-05-08**

---

## Annexe — sources

- `docs/V3_ARGUS_BETA_TESTEUR.md` § Évolution prévue
- `docs/V3_PANEL_50_CURATED.md` § Synthèse
- `docs/V3_ARGUS_DOCTRINE_ORGANO_STRATEGUERRE.md` § Corps IV Stratèges
- `docs/PANEL_202_PERSONAS.csv` (catégorisation analysée)
- `docs/PANEL_EXPERTS_100.md` (verdicts-cibles)
- `docs/PROFILS_ARMEE_CODEURS_SENIORS.md` § Stratèges (charge ORDA)
