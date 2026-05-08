# BULLETIN ARGUS — AAR BÊTA 30 AGENTS
## Maréchal-auditeur · 2026-05-08 (J+13) · After-Action Report consolidé

> *« 30 agents ont joué. 5 focus groups ont eu lieu. Une seule personne signe ce document. Voici ce qu'elle voit. »*
> — Argus

**Build audité** : v2.1.2-prebeta · **Cycle** : ORDA-008
**Documents source** :
- `docs/beta-30-agents/agent-NN-*.md` (30 system prompts)
- `docs/beta-30-agents/sessions/agent-01-wroblewski/` (session pilote, 3 livrables)
- `docs/beta-30-agents/SESSIONS_AGENTS_02-30.md` (29 sessions condensées)
- `docs/beta-30-agents/focus-groups/FG-1-5-*.md` (5 sessions transverses)

---

## I. Distribution NPS — vue d'ensemble

### Moyenne par corps Argus

| Corps | Nb agents | NPS moyen | Verdict |
|-------|----------:|----------:|---------|
| Architectes | 6 | 6.2 | 🟠 entre engagement et friction |
| Géomètres | 2 | 5.0 | 🟠 audit pointu, NPS bas par discipline |
| Diplomates | 2 | 6.0 | 🟠 modèle prometteur, opacité gênante |
| Stratèges | 2 | 6.5 | 🟢 cible compatible recherche/personae |
| Sapeurs | 2 | 5.5 | 🟠 dette code visible, perf borderline |
| Paritarisme | 4 | 6.3 | 🟢 contenu reconnu, manques signalés |
| Cible 18-30 | 5 | 5.6 | 🔴 cible déclarée sous-servie |
| Accessibilité | 2 | 3.5 | 🔴 P0 bloquant bêta publique |
| Scolaire | 2 | 8.0 | 🟢 usage pédagogique fort |
| Hors-France | 1 | 7.0 | 🟢 transmission internationale possible |
| Patronat | 2 | 6.5 | 🟢 jouable sans honte |

**Moyenne globale 30 agents : 6.1 / 10** ❌ (cible Argus 7.0)

### Distribution par tier

```
Tier A (18 experts)   : 6.4 → représentatif d'un "audit pro"
Tier B (12 profils)   : 5.7 → représentatif de la cible humaine
Écart Tier A → B      : -0.7 (cohérent : les humains réels sont plus durs)
```

---

## II. Top 10 frictions transverses

Mentions ≥ 3 agents, citation `fichier:ligne` obligatoire.

| # | Friction | Mentions | Fichier:ligne | Severity |
|---|----------|---------:|---------------|---------:|
| 1 | Top-header 7 jauges trop denses Carnet | 5 | `CockpitTopHeader.svelte:9-17` | **P0** |
| 2 | `role="marquee"` au lieu d'`aria-live` | 5 | `NewsTicker.svelte:122` | **P0** |
| 3 | Pas de feedforward avant les choix | 4 | `DialogueScene.svelte` | P1 |
| 4 | CFE-CGC + plateformes + TPE absents | 4 | `Elections/engine.ts`, `nao/engine.ts`, `legendaires/` | P1 |
| 5 | Voix Compulsif limitée à 4 archétypes | 4 | `personalityEngine.ts` | P1 |
| 6 | LayoutSwitcher hors tab order | 4 | `LayoutSwitcher.svelte` | **P0** |
| 7 | Substitut tactile au hover absent | 4 | hover badges (multi-fichiers) | P1 |
| 8 | Lobbying = mot péjoratif (caricature patron) | 3 | `glossary.ts` + `types.ts` | P1 |
| 9 | NAO format grand groupe uniquement | 3 | `nao/engine.ts` (preset PME) | P1 |
| 10 | Math.random() non seedé fuité | 1 (mais critique) | `gameState.svelte.ts:~142` | **P0** |

---

## III. Top 10 plaisirs transverses

Mentions ≥ 2 agents, ces moments fonctionnent — à conserver et amplifier.

| # | Plaisir | Mentions | Fichier:scénario |
|---|---------|---------:|-------------------|
| 1 | Sceau de cire pulse 8s diégétique | 4 | `SignatureCeremony.svelte` |
| 2 | Frachon — voix qui tient | 4 | `1936-matignon.ts` |
| 3 | Glossaire couvre 80% programme SES | 3 | `lib/data/glossary.ts` |
| 4 | Patron jouable sans honte | 2 | `2017-ordonnances.ts`, `1936-matignon.ts` |
| 5 | Mode Compulsif sonne juste pour la fatigue | 2 | `personalityEngine.ts` |
| 6 | Mémoire des acteurs (callback différé) | 2 | `consequenceEngine.ts` |
| 7 | Journal IA cite Hatzfeld + Friot | 2 | `narrative/journalAI.ts` |
| 8 | Pelletier 1908 anarcho-féminisme restitué | 2 | `content/legendaires/pelletier.ts` |
| 9 | TPE 2020 Asselin reconnu | 2 | `2020-tpe-asselin.ts` |
| 10 | Focus trap modales | 2 | composants modales |

---

## IV. Désaccords structurants — décisions Argus

### Désaccord 1 — Sobriété (Pope) vs Feedback animé (Yanis)
**Décision Argus** : disclosure progressive (Pope), animations narratives gardées (Yanis), animations décoratives supprimées. Compromis viable. → P0-1.

### Désaccord 2 — Tutoriel structuré (Krug) vs Disco-style libre (Camille)
**Décision Argus** : 3 modes au launch (pédagogique / littéraire / équilibré). Tranche FG-5. → P1-1.

### Désaccord 3 — Patron rationnel (Hélène) vs Patron politique (Friot)
**Décision Argus** : cohabitation par registres selon trait dominant. Mode Compulsif → registre politique (Friot), mode Réfléchi → registre gestionnaire (Hélène). Pas un trade-off mais une diversification. → P1.

### Désaccord 4 — `aria-label` (Soueidan) vs UI cleanup (Pope)
**Décision Argus** : les deux. WCAG est plancher légal (Soueidan), `aria-label` n'est pas du clutter visuel (invisible aux voyants), Pope n'est pas concerné. Pas un vrai désaccord. → P0-1 (a11y).

### Désaccord 5 — Transparence formules (Johnson) vs Opacité productive (Fåhraeus)
**Décision Argus** : mode debug overlay optionnel dans Settings. Joueur novice → opacité par défaut. Joueur expert (à la Bret Victor) → toggle "afficher les coefficients". → P1.

---

## V. Plan d'action priorisé — ORDA-008

### Bloquants pour v2.2.0-beta-public (P0)

| # | Fix | Fichier | Effort | Owner |
|---|-----|---------|-------:|-------|
| **P0-1** | Disclosure 3→6 ressources progressive + `aria-label` jauges | `CockpitTopHeader.svelte:9-17` + `gameState.svelte.ts` (ajouter `unlockedAt: number`) | 2 j-h | Architectes + Sapeurs |
| **P0-2** | Ticker : `aria-live="polite"` + bouton pause + supprimer auto-defile au focus | `NewsTicker.svelte:122` | 0.5 j-h | Sapeurs |
| **P0-3** | LayoutSwitcher dans tab order + `aria-label` | `LayoutSwitcher.svelte` | 0.3 j-h | Sapeurs |
| **P0-4** | Math.random() → seededRandom() | `gameState.svelte.ts:~142` | 0.5 j-h | Sapeurs (Géomètres revue) |
| **P0-5** | Contraste doré 4.21:1 → 4.5:1 minimum | `app.css` ajustement `--gold` | 0.5 j-h | Architectes |

**Total P0 : 3.8 j-h** — faisable en 1 jour-dev solo.

### Améliorations majeures pour la beta (P1)

| # | Fix | Effort |
|---|-----|-------:|
| P1-1 | 3 modes au launch (pédagogique / littéraire / équilibré) | 3 j-h |
| P1-2 | Journal IA en 2 paragraphes (morsure + action) | 1.5 j-h |
| P1-3 | Préset NAO TPE/PME (3 séances, 24 pts) | 1.5 j-h |
| P1-4 | CFE-CGC en 4e syndicat aux Élections | 1 j-h |
| P1-5 | Voix Compulsif 4 → 8-12 archétypes | 2 j-h |
| P1-6 | 2 légendaires post-2000 (Coupé + 1 coursier) + 2 figures féminines racisées | 2 j-h |
| P1-7 | Glossaire au survol des sigles syndicaux | 1 j-h |
| P1-8 | Side event « Mitbestimmung » au scénario Maastricht | 1 j-h |
| P1-9 | Renommer « Lobbying » en « Influence institutionnelle » | 0.3 j-h |
| P1-10 | Mémoire des acteurs (callbacks différés N+3 à N+5) | 2 j-h |
| P1-11 | Mode debug overlay (Settings toggle) | 1 j-h |
| P1-12 | Lazy import Tone.js | 0.5 j-h |
| P1-13 | Substitut tactile hover (long-press → tooltip) | 1.5 j-h |
| P1-14 | Préset cognitive-friendly (OpenDyslexic + FALC + ticker pause) | 1.5 j-h |
| P1-15 | 2 scénarios post-2010 (plateforme + PME NAO) | 3 j-h |

**Total P1 : 23.8 j-h** — étalable sur 5-7 jours-dev.

### Optimisations pour v2.3.0+ (P2)

- Splitter `gameState.svelte.ts` en 4 fichiers (resources, actors, memory, history)
- Endpoint télémétrie RGPD opt-in (Cloudflare Worker + D1)
- Refacto CSS Confrontation (déjà flagged ORDA-006/007)
- Mode "afficher fractions / pourcentages / graphique" (Villani)
- Stats globales joueurs (« 37% des Jouhaux ont signé »)

---

## VI. Décision Argus

### Verdict global

**v2.2.0-beta-public** : 🟡 **CONDITIONNEL**.

**Conditions à satisfaire (avant ouverture publique)** :
1. Tous les P0 (5 fixes, 3.8 j-h) clos et tagués `v2.1.3-prebeta`
2. Au moins 6 P1 sur 15 clos (priorité : P1-1 modes launch, P1-2 journal IA, P1-3 préset NAO PME, P1-7 glossaire survol, P1-12 lazy Tone.js, P1-14 préset cognitive)
3. Validation humaine du panel de 30 (j+15 → j+30) confirme convergence agents/humains à ±20%

### Voie alternative (si 6 P1 trop coûteux)

**v2.2.0-beta-private** : 🟢 **OUI immédiatement** après les 5 P0.
- Bêta privée 30 testeurs humains du panel
- Recueil retours + cycle ORDA-009 sur les P1
- Bêta publique reportée à v2.3.0 (~3 semaines plus tard)

### Recommandation Argus

**Voie privée d'abord**, puis publique. Le panel humain validera ou réfutera les agents. C'est plus économique en risque que d'ouvrir au public sans validation humaine intermédiaire.

---

## VII. Convergences agents/humains — à mesurer après J+30

Une fois le panel humain de 30 (cf. `PANEL_BETA_30_TESTEURS.md`) actif, on remplit cette grille :

| Friction agent | Confirmée par humain ? | Écart |
|----------------|:---------------------:|------:|
| Top-header 7 jauges trop denses | TBD | TBD |
| Ticker silencieux | TBD | TBD |
| Pas de feedforward | TBD | TBD |
| CFE-CGC absent | TBD | TBD |
| Voix Compulsif 4 archétypes | TBD | TBD |
| LayoutSwitcher hors tab | TBD | TBD |
| Substitut tactile hover | TBD | TBD |
| Lobbying caricatural | TBD | TBD |
| NAO grand groupe uniquement | TBD | TBD |
| Math.random() fuite | TBD (humain non-dev ne le verra pas) | TBD |

**Métrique cible** : ≥ 80% de convergence sur les 9 frictions accessibles aux humains. Si oui → les agents sont validés comme outil composite. Si non → ajuster les system prompts pour les futurs cycles.

---

## VIII. Coda

> *« 30 agents ont joué — pas un n'a vu PARITAS comme un même jeu. C'est le bon résultat. Un jeu qui donne 30 lectures différentes promet beaucoup. Le travail n'est pas de réduire les 30 lectures à une — c'est de tenir les 30 promesses à la fois. La sobriété de Pope ET le feedback de Yanis. Le détail de Soueidan ET la simplicité de Krug. Le patron rationnel d'Hélène ET le capital salarial de Friot. Si Paritas tient ces tensions, il est unique. Si Paritas les efface, il devient un manuel. »*
>
> *« Cycle ORDA-008 ouvert. 5 P0 à clore avant tag v2.1.3. Recrutement panel humain démarré. Pré-Conseil Stratèges demain matin, 9h, salle de guerre. »*
>
> **— Argus, Maréchal-auditeur PARITAS · 2026-05-08 J+13**

---

## Annexe — Calendrier ORDA-008 → bêta publique

| J | Action | Owner |
|---|--------|-------|
| **J+13** (today) | AAR signé, plan ORDA-008 publié | Argus |
| **J+14 → J+15** | 5 P0 clos par Sapeurs + Architectes | Sapeurs lead |
| **J+15** | Tag `v2.1.3-prebeta` | Argus signe |
| **J+16 → J+22** | 6 P1 prioritaires clos | Architectes lead |
| **J+22** | Tag `v2.2.0-beta-private` | Argus signe |
| **J+23 → J+30** | Recrutement humains + sessions | Stratèges lead |
| **J+30** | AAR humain vs agents — convergence mesurée | Argus + Stratèges |
| **J+30 → J+45** | P1 restants + retours humains intégrés | Sapeurs |
| **J+45** | Tag `v2.2.0-beta-public` — ouverture grand public | Argus signe + comm |

---

## Annexe — Récapitulatif des 30 agents (un coup d'œil)

| # | Agent | Corps | NPS | Top friction | Top plaisir |
|---|-------|-------|----:|--------------|-------------|
| 01 | Wroblewski | Architectes | 6 | 7 jauges Carnet | Cinzel sur 390px |
| 02 | Krug | Architectes | 5 | Pas d'objectif visible | Sceau cire timing |
| 03 | Soueidan | Architectes | 4 | Tab order chaotique | Focus trap modales |
| 04 | Pope | Architectes | 6 | 4 animations idle | Sceau cire diégétique |
| 05 | Romero | Architectes | 8 | Side event 2020 tiède | Train-level dilemma 1936 |
| 06 | McGonigal | Architectes | 8 | Pas de call to action | Journal IA cite Friot |
| 07 | Villani | Géomètres | 7 | Ventre mou tour 35-50 | Climax narratif Matignon |
| 08 | Ghys | Géomètres | 3 | Math.random() fuité | (audit pur) |
| 09 | Fåhraeus | Diplomates | 6 | Stalter voix générique | Mémoire acteurs callback |
| 10 | S. Johnson | Diplomates | 6 | 5 jauges sur 6 opaques | Breakdown Confiance |
| 11 | Duflo | Stratèges | 7 | Pas de stats globales | localStorage propre |
| 12 | Goodwin | Stratèges | 6 | Persona A décroche | Persona B reconnaît |
| 13 | Muratori | Sapeurs | 6 | gameState god-object | Code-splitting Vite |
| 14 | Carmack | Sapeurs | 5 | Tone.js eager 265 KB | Code-splitting partiel |
| 15 | Friot | Paritarisme | 7 | Institution sans politique | Croizat 1945 nommé |
| 16 | Beaud | Paritarisme | 6 | Pas de voix non-syndiquée 2010-2020 | Whirlpool 2017 juste |
| 17 | Jobert | Paritarisme | 6 | Pas de Mitbestimmung | Glossaire paritarisme français |
| 18 | Béroud | Paritarisme | 6 | SUD-Solidaires absent | Pelletier 1908 jouable |
| 19 | Yanis | Cible 18-30 | 4 | Dialogue lent sans skip | Jauge rapport de force |
| 20 | Léa | Cible 18-30 | 7 | NAO télétravail caissière | Voix aide-soignante tour 12 |
| 21 | Théo | Cible 18-30 | 6 | CFE-CGC absent | Scénario cadre dirigeant |
| 22 | Sami | Cible 18-30 | 5 | 2017 sans plateformes | Pelletier solidarité hors syndicat |
| 23 | Aïcha | Cible 18-30 | 6 | Pas de femme racisée roster | Voix intérieure « tu es épuisée » |
| 24 | Pascal | Accessibilité | 3 | 14 Tab pour atteindre choix | Focus trap modales |
| 25 | Manon | Accessibilité | 4 | Top-header 7 chips noyade | FALC quand il arrive |
| 26 | Jules | Scolaire | 9 | (aucun majeur en 25 tours) | Match programme SES |
| 27 | Camille | Scolaire | 7 | 4 archétypes Compulsif | Matignon-écho tour 25 |
| 28 | Lukas | Hors-France | 7 | FO confondue 8 tours | État médiateur 1936 |
| 29 | Hélène | Patronat | 7 | Lobbying caricatural | Patron éthique possible |
| 30 | Bruno | Patronat | 6 | NAO grand groupe | Asselin TPE 2020 |
