# FG-5 — Pédagogie & transmission · « À qui transmettre ? »

**Date simulée** : J+10 · **Durée** : 60 min · **Animation** : Argus
**Composition** : Goodwin (#12), Duflo (#11), Léa caissière (#20), Aïcha (#23, invitée-doublon FG-4), Jules lycéen (#26), Camille socio L2 (#27)

---

## Question d'ouverture

> *« À qui montreriez-vous PARITAS demain matin ? Pourquoi cette personne précisément ? »*

---

## Tour de table

**Goodwin** : « 3 personas, 3 personnes : (a) Persona A = ma fille de 16 ans (échec décrochage tour 4), (b) Persona B = mon ami délégué CFDT 45 ans (succès), (c) Persona C = mon collègue DRH (succès avec inconfort). **Le persona A est mal servi**, c'est précisément la cible déclarée du jeu. »

**Duflo** : « À une équipe RCT pour mesurer l'effet civique. Le journal IA contient déjà du matériel. Mais pas de comparaison joueurs (« 37% des Jouhaux ont signé »). **PARITAS pourrait être un instrument de mesure**, pas seulement un jeu. »

**Léa** : « À ma collègue Christelle (caissière 28 ans, pas syndiquée). **Mais je lui dirais d'aller au tour 12 directement** où elle entendra une voix d'aide-soignante qui pourrait la toucher. La NAO du tour 6 ne lui parlera pas (télétravail caissière, blague). Si elle commence par là, elle quitte. »

**Aïcha** : « À ma collègue Fatima (aide-soignante racisée 27 ans). Mais je devrais lui prévenir : 'pas de figure féminine racisée au roster, c'est un manque'. Sinon elle se sentira invitée à une conversation entre hommes blancs syndiqués. »

**Jules** : « À ma classe de Terminale SES, **le lendemain de cette session**. Le jeu correspond au programme à 80%. Je le proposerais comme **devoir maison**. Mais en mode Réfléchi obligatoire, et avec une grille de questions à rendre. »

**Camille** : « À mon directeur de mémoire (Florange). Avec **disclaimer** : 'pas Disco Elysium, mais 70% de la profondeur narrative à 0% du budget'. Disco a 24 voix. Paritas a 4 archétypes Compulsif. Mais Matignon-écho tour 25 tient. »

---

## Désaccords identifiés

### Désaccord 1 — Goodwin (3 personas) vs Camille (1 cible Disco-grade)

| Goodwin | Camille |
|---------|---------|
| « 3 personas distinctes, 3 funnels » | « Disco Elysium est ouvert à tous, sans persona » |
| Cible : pédagogie ciblée | Cible : œuvre d'art universelle |
| FALC obligatoire pour persona A | Pas de FALC, écriture exigeante |

**Verdict du groupe** : **les deux peuvent coexister via un mode switchable**. Mode « pédagogique » (Goodwin, FALC, glossaire forcé, devoir maison) vs mode « littéraire » (Camille, voix multiples, dialogues complexes). → **Settings.svelte** : choix au launch « Mode pédagogique / Mode littéraire / Mode équilibré (par défaut) ».

### Désaccord 2 — Duflo (instrument RCT) vs Léa (jeu pour soi)

- Duflo : « comparaison joueurs anonymisée, statistiques globales »
- Léa : « je veux jouer pour moi, pas pour une étude »

**Verdict du groupe** : **opt-in RGPD explicite**. Léa peut jouer en local (localStorage), Duflo a la télémétrie si l'utilisateur consent. **Action** : `Settings.svelte` ajouter toggle « Contribuer au corpus de recherche (RCT) — opt-in », avec explication transparente.

### Désaccord 3 — Jules (devoir maison structuré) vs Camille (œuvre ouverte)

| Jules | Camille |
|-------|---------|
| « 600 mots structurés en intro/argumentation/conclusion » | « 600 mots libres comme Disco » |
| Cible : note bac SES | Cible : mémoire L2 sociologie |

**Verdict du groupe** : **2 templates de journal IA** (cf. FG-2 désaccord 1). Mode pédagogique → Jules. Mode littéraire → Camille. → étend la décision FG-2.

---

## Accords du groupe (≥ 4 voix sur 6)

1. ✅ **3 modes au launch (pédagogique / littéraire / équilibré)** — `Settings.svelte` + `Landing.svelte` (5 voix : Goodwin, Jules, Camille, Léa, Aïcha)
2. ✅ **Opt-in RGPD télémétrie** — `Settings.svelte` (4 voix : Duflo, Léa, Goodwin, Aïcha)
3. ✅ **Persona A (jeune curieux 16 ans) doit être servi** — `Landing.svelte` mode pédagogique (5 voix : Goodwin, Jules, Léa, Camille — qui veut un autre mode mais reconnaît la priorité, Aïcha)
4. ✅ **Recommandation contextuelle « commence par tour X »** dans le journal IA selon le persona auto-détecté (4 voix : Léa, Goodwin, Jules, Aïcha)
5. ✅ **2 figures féminines racisées au roster** (5 voix : Aïcha, Léa, Goodwin, Camille, Duflo — recoupe FG-4)

---

## Top 3 P1 du groupe

| # | Fix | Fichier | Voix |
|---|-----|---------|----:|
| **P1-1** | 3 modes pédagogique/littéraire/équilibré au launch | `src/components/Landing.svelte` + `Settings.svelte` + `gameState.mode` étendu | 5/6 |
| **P1-2** | Persona A « 16 ans curieux » servi (FALC + tutoriel guidé) | `src/components/Landing.svelte` (mode pédagogique) + `narrative/scenarioEngine.ts` filtrer | 5/6 |
| **P1-3** | 2 figures féminines racisées au roster | `src/game/content/legendaires/` | 5/6 |

---

## Question fermée Argus

> *« Combien d'heures de jeu pour qu'un joueur 'transmette' (recommande à 1 personne réelle) ? »*

- Goodwin : *« 30 min suffisent si Persona B »*
- Duflo : *« 2 h pour qu'il comprenne assez à expliquer »*
- Léa : *« 1 h, mais le tour 12 doit arriver vite »*
- Aïcha : *« 1 h si la voix le touche, jamais sinon »*
- Jules : *« 5 h (1 partie complète) pour devoir maison »*
- Camille : *« 8 h pour saisir comme une œuvre »*

**Médiane : 1 h 30**. Argus retient : **viser une expérience qui produit un retour en 1 h**. C'est le seuil de transmission.

---

## Coda

> *« 6 transmetteurs potentiels. 6 cibles différentes. La pédagogie n'est pas une cible — c'est un mode. PARITAS doit avoir trois modes au launch, parce qu'il a trois publics : la jeune curieuse, la lectrice de Beaud, et le prof qui prépare son cours. Si un seul mode prétend les servir tous, il en sert mal trois. »*
>
> — Argus, FG-5
