# PLAN DE CHARGE — CAMPAGNE DES 10 ATELIERS
## Bulletin de campagne ORDA-001 · Argus, Maréchal-auditeur

**Date** : 2026-05-07
**Cycle** : ORDA-001 → ORDA-005 (10 semaines, 70 jours)
**Doctrine de référence** : `V3_ARGUS_DOCTRINE_ORGANO_STRATEGUERRE.md`
**Théâtre d'opérations** : `src/components/ateliers/*` + `src/game/ateliers/*` + `src/game/negotiation/*` + `src/game/org/*`

---

## I. SITUATION TACTIQUE

### A. Reconnaissance du terrain

L'armée a inventorié **8 783 lignes** de code réparties sur **10 ateliers**. Tous compilent. Tous tournent. Tous sont, à des degrés divers, **invérifiés en conditions réelles**.

| # | Atelier | LOC composant | LOC moteur | Dette (TODO/Math.random) | Tier |
|---|---------|--------------:|-----------:|:------------------------:|:----:|
| 1 | **La NAO** | 900 | 726 | 2 | T1 |
| 2 | **Les Élections** | 557 | 331 | 1 | T1 |
| 3 | **La Grève** | 505 | 463 | 0 | T1 |
| 4 | **La Table** | 469 | 384 | 0 | T1 |
| 5 | **Confrontation** | 986 | 394 | 0 | T3 |
| 6 | **La Place** | 586 | 457 | 0 | T3 |
| 7 | **Matignon 1936** | 226 (wrap) | 1067 | 0 | T2 |
| 8 | **Brawl Arena** | 174 (wrap) | 457 (`factionBrawl.ts`) | **2** | T2 |
| 9 | **La Manif** | 37 (wrap) | (`ManifSimulator.svelte`) | 0 | T3 |
| 10 | **Le Meeting** | 64 (wrap) | (`MeetingSimulator.svelte`) | 0 | T3 |

### B. Catégorisation

- **Tier 1 — RÉCENTS, NON TESTÉS** (4 ateliers) : NAO, Élections, Grève, Table
  *Créés ces dernières semaines, audités sur le papier, jamais joués par 30 inconnus.*

- **Tier 2 — DETTE TECHNIQUE CRITIQUE** (2 ateliers) : Matignon, Brawl Arena
  *Matignon : profil d'apprentissage 9 compétences calculé mais **non affiché**. Arena : branche patron morte documentée, `Math.random` × 2 sans garantie de reproductibilité.*

- **Tier 3 — VÉTÉRANS, POLISH ATTENDU** (4 ateliers) : Confrontation, La Place, Manif, Meeting
  *Bugs cosmétiques fixés (cf cycle B3-B5), mais aucun audit Argus formel n'a été conduit dessus.*

### C. Centre de gravité (Clausewitz)

> Le **centre de gravité de la campagne** est l'expérience joueur novice qui ouvre PARITAS pour la première fois. Si elle se brise sur un atelier, c'est tout le rapport au jeu qui est perdu. **Tier 1 d'abord, sans concession.**

---

## II. ORDRE DE BATAILLE

### A. Principe d'engagement
**Deux ateliers par cycle ORDA**, en parallèle, avec **corps disjoints** pour éviter les goulots d'étranglement. Chaque cycle dure **14 jours**, conformément à la doctrine.

### B. Calendrier général (10 semaines)

```
Sem 1-2  · ORDA-001 ┃ ▓▓▓ NAO       │ ▓▓▓ ÉLECTIONS   │ Tier 1
Sem 3-4  · ORDA-002 ┃ ▓▓▓ GRÈVE     │ ▓▓▓ TABLE       │ Tier 1
Sem 5-6  · ORDA-003 ┃ ▓▓▓ MATIGNON  │ ▓▓▓ ARENA       │ Tier 2
Sem 7-8  · ORDA-004 ┃ ▓▓▓ CONFRONT. │ ▓▓▓ LA PLACE    │ Tier 3
Sem 9-10 · ORDA-005 ┃ ▓▓▓ MANIF     │ ▓▓▓ MEETING     │ Tier 3 + intégration
```

### C. Doctrine de phasage

- Les Tier 1 sont **consolidés en premier** parce qu'ils sont les plus jeunes et les plus susceptibles de cacher des défauts d'équilibrage non détectés en lecture.
- Les Tier 2 viennent ensuite parce qu'ils sont **chargés en dette explicitement reconnue** : on s'y attaque quand l'armée est rodée par les deux premiers cycles.
- Les Tier 3 ferment la marche, **après calibrage panel**, pour limiter le risque de modifier des ateliers qui fonctionnent juste pour les modifier.
- Le **dernier cycle ORDA-005** intègre une **demi-charge d'intégration narrative** (cohérence inter-ateliers, raccordement V2).

---

## III. FICHES DE CHARGE PAR ATELIER

### Légende

- **CIBLES** : ce qu'il faut frapper (bugs, manques, dettes)
- **CORPS** : qui est mobilisé. Notation : `Lead → Audit`
- **EFFORT** : en jours-homme (j-h) répartis entre développement et audit
- **SUCCÈS** : critères mesurables de fin de cycle
- **LIVRABLE** : artefact concret produit

---

### 🟦 ATELIER 1 — La NAO
**Cycle** : ORDA-001 (sem 1-2) · **Tier** : 1 — RÉCENT
**État actuel** : 900 lignes UI, 726 lignes moteur. Audit Argus complet (cf B1-B11). 9 bugs corrigés, build clean. **Non joué par humains.**

#### CIBLES
1. **Bêta panel 30** : faire jouer le mode hot-seat à 30 binômes (15 amis × 2)
2. **Calibrage difficulté IA** : la simulation a montré pv_désaccord systématique avec CGT en pression continue → l'IA syndicat est trop conservatrice
3. **Tutoriel diégétique** : 3 phrases qui apparaissent au tour 1 pour expliquer l'enveloppe, le seuil, le poids syndical
4. **Audit cohérence légale** : faire valider par un juriste expert NAO que les % suffrages, la règle des 50 %, et les outcomes sont conformes au Code du travail français
5. **Effets V2 ajustés** : équilibrer les effets `naoOutcomeToV2Effects` après bêta

#### CORPS
- **Lead** : Corps IV (Stratèges) — collecte bêta + analyse
- **Co-lead** : Corps III (Diplomates) — recalibrage IA
- **Support** : Corps I (Architectes) — tutoriel diégétique
- **Audit** : Corps V (Sapeurs)

#### EFFORT
- Stratèges : 4 j-h (recrutement + entretiens + analyse)
- Diplomates : 3 j-h (recalibrage IA)
- Architectes : 2 j-h (tutoriel)
- Sapeurs : 1 j-h (audit final)
- **TOTAL : 10 j-h**

#### SUCCÈS
- ≥ 25 parties hot-seat menées à terme
- Distribution des outcomes : ≥ 30 % accord_majoritaire, ≤ 25 % pv_désaccord (sur 30 parties)
- 0 plainte joueur sur "je comprends pas"
- Validation juridique signée

#### LIVRABLE
- `BULLETIN_ORDA_001_NAO_AAR.md` + données de partie (CSV)
- v1.1 du moteur avec IA ajustée

---

### 🟦 ATELIER 2 — Les Élections Pro
**Cycle** : ORDA-001 (sem 1-2) · **Tier** : 1 — RÉCENT
**État actuel** : 557 lignes UI, 331 lignes moteur, 1 `Math.random` (bruit IA). Build clean. Aucun audit formel.

#### CIBLES
1. **Audit Argus complet** (équivalent de NAO B1-B11)
2. **Validation théorique** : prouver formellement qu'il n'existe pas de stratégie dominante pour 8 jetons sur 4 canaux à valeurs (3,2,1,1)
3. **Bêta panel 20** : 10 binômes hot-seat
4. **Calibrage IA adaptative** : l'IA switche de stratégie selon le score, vérifier que ce switch ne crée pas de pattern exploitable
5. **Réglage des effets V2** post-bêta

#### CORPS
- **Lead** : Corps V (Sapeurs) — audit code
- **Co-lead** : Corps II (Géomètres) — preuve formelle d'absence de stratégie dominante
- **Support** : Corps IV (Stratèges) — bêta + analyse
- **Audit final** : Argus en personne

#### EFFORT
- Sapeurs : 3 j-h (audit ligne par ligne)
- Géomètres : 4 j-h (Monte Carlo 10⁵ parties + preuve formelle)
- Stratèges : 2 j-h (bêta 20)
- Argus : 1 j-h (signature finale)
- **TOTAL : 10 j-h**

#### SUCCÈS
- 0 stratégie dominante détectée par 100 000 simulations Monte-Carlo
- Distribution outcomes équilibrée (≤ 60 % salarie_majorite OU patron_majorite, ≥ 25 % parite)
- Audit formel publié (`audit_elections_2026-05.md`)

#### LIVRABLE
- Notebook reproductible (numpy) de simulation Monte-Carlo
- Audit signé Argus + Géomètre référent

---

### 🟦 ATELIER 3 — La Grève
**Cycle** : ORDA-002 (sem 3-4) · **Tier** : 1 — RÉCENT
**État actuel** : 505 lignes UI, 463 lignes moteur. **Le plus complexe des récents** (double attrition + zone + special move négocier).

#### CIBLES
1. **Audit Argus complet** : double attrition est un système non trivial, susceptible d'oscillations ou d'équilibres bloqués
2. **Validation des 5 issues** : `accord_victorieux / accord_partiel / ouverture_negociation / echec_greve / patron_impose` — chacune doit être atteignable et avoir une fréquence raisonnable (entre 10 % et 30 %)
3. **Audit historique** : faire valider par un historien des grèves françaises (CGT 1968, 1995, 2003, 2010, 2023) que les paramètres sont fidèles à des grèves réelles
4. **Bêta 20 binômes** + entretiens
5. **Tuto onboarding** : la double-jauge nécessite explication

#### CORPS
- **Lead** : Corps III (Diplomates — c'est leur expertise première sur l'adversariel)
- **Co-lead** : Corps II (Géomètres) — validation des issues
- **Support** : Corps I (Architectes) — tuto onboarding
- **Audit** : Corps V (Sapeurs)

#### EFFORT
- Diplomates : 4 j-h
- Géomètres : 3 j-h
- Architectes : 2 j-h
- Sapeurs : 2 j-h
- **TOTAL : 11 j-h**

#### SUCCÈS
- 5 issues toutes atteignables avec fréquence > 10 %
- Validation historique signée (historien spécialisé)
- 0 partie infinie ni boucle morte (smoke test 10⁴ parties IA vs IA)
- Bêta 20 sans plainte « j'ai pas compris »

#### LIVRABLE
- Notebook équilibrage Monte-Carlo
- `audit_greve_historique.md`
- v1.1 du moteur

---

### 🟦 ATELIER 4 — La Table
**Cycle** : ORDA-002 (sem 3-4) · **Tier** : 1 — RÉCENT
**État actuel** : 469 lignes UI, 384 lignes moteur. **Le plus simple des récents** — curseur de zone + 5 mouvements.

#### CIBLES
1. **Audit Argus** ciblé sur la mécanique du curseur (asymétrie patron favorisée par statu quo)
2. **Validation théorique** : démonter ou confirmer le « patron slightly advantaged » documenté
3. **Beats system** : auditer le `winBonus` et le `salarieMoralBonus` post-`consulter` (cf engine)
4. **Bêta 15 binômes**
5. **Polissage UI** : SVG worker/employer avatars, side panels — doivent rester lisibles sur mobile

#### CORPS
- **Lead** : Corps V (Sapeurs)
- **Co-lead** : Corps II (Géomètres) — preuve d'asymétrie patron
- **Support** : Corps I (Architectes) — UX mobile
- **Audit** : Argus

#### EFFORT
- Sapeurs : 2 j-h
- Géomètres : 2 j-h
- Architectes : 1 j-h
- Argus : 1 j-h
- **TOTAL : 6 j-h** (atelier le plus léger du Tier 1)

#### SUCCÈS
- Asymétrie patron quantifiée (X % d'avantage en jeu équilibré)
- 0 bug bloquant
- UX mobile validée par 5 testeurs (smartphone direct)

#### LIVRABLE
- `audit_table_asymetrie.md` avec graphes
- v1.1 UI mobile-first

---

### 🟥 ATELIER 5 — Matignon 1936
**Cycle** : ORDA-003 (sem 5-6) · **Tier** : 2 — DETTE CRITIQUE
**État actuel** : Engine 1067 lignes (le plus gros du jeu), wrapper standalone 226 lignes. **Profil d'apprentissage 9 compétences calculé via `evaluateMatignonLearning` mais NON AFFICHÉ dans l'UI** (cf audit B2). 36 chemins simulables (`simulateAllMatignonPaths`).

#### CIBLES
1. **Affichage du profil 9 compétences** dans `MatignonModal.svelte` (barres horizontales par compétence) — c'est la **dette technique #1** du Tier 2
2. **Affichage des warnings audit** (`auditMatignonSession`) après chaque partie
3. **Replay system** : exposer `buildMatignonReplay` dans l'UI pour rejouer les 36 chemins en mode démo
4. **Validation pédagogique** : faire valider par 3 enseignants (sciences sociales, droit du travail) que les 9 compétences mesurées correspondent à des compétences réelles
5. **Audit historique** : Matignon est un événement historique majeur — tout écart doit être documenté

#### CORPS
- **Lead** : Corps I (Architectes — section I.E Pédagogie)
- **Co-lead** : Corps IV (Stratèges) — analyse des 36 chemins
- **Support** : Corps V (Sapeurs) — branchement UI
- **Audit** : Argus + historien externe

#### EFFORT
- Architectes : 5 j-h (UI profil + warnings + replay) **— gros effort UI**
- Stratèges : 3 j-h (analyse chemins + curation)
- Sapeurs : 2 j-h
- Argus + historien : 2 j-h
- **TOTAL : 12 j-h** (atelier le plus chargé du Tier 2)

#### SUCCÈS
- Profil 9 compétences visible et compréhensible (test 5 personae)
- Replay des 36 chemins fonctionnel
- Validation pédagogique signée (3 enseignants)
- Validation historique signée
- 0 régression sur le moteur (couverture tests : 100 % sur paths)

#### LIVRABLE
- `MatignonModal.svelte` v2 avec profil + warnings + replay
- `audit_matignon_pedagogique.md`
- Suite de tests Vitest sur les 36 chemins

---

### 🟥 ATELIER 6 — Brawl Arena
**Cycle** : ORDA-003 (sem 5-6) · **Tier** : 2 — DETTE CRITIQUE
**État actuel** : `factionBrawl.ts` 457 lignes, `Math.random` × 2, **branche patron documentée comme code mort**. `BrawlArena.svelte` 998 lignes.

#### CIBLES
1. **Suppression de la branche patron morte** OU implémentation symétrique complète (décision en Conseil ORDA)
2. **Reproductibilité** : remplacer `Math.random` par RNG seedé pour permettre replays
3. **Test statistique** : 10⁵ simulations pour vérifier que les outcomes ont une distribution acceptable
4. **Refonte ou suppression** : si l'atelier ne tient pas la promesse de symétrie paritariste, **refonte γ** (Protocole de refonte profonde)
5. **UI cleanup** : 998 lignes Svelte est très long, factoriser

#### CORPS
- **Lead** : Corps III (Diplomates) — décision sur symétrie
- **Co-lead** : Corps II (Géomètres) — RNG seedé + tests stat
- **Support** : Corps V (Sapeurs) — refacto UI
- **Audit** : Argus

#### EFFORT
- Diplomates : 3 j-h
- Géomètres : 4 j-h
- Sapeurs : 4 j-h (refacto Svelte 998 lignes c'est lourd)
- Argus : 1 j-h
- **TOTAL : 12 j-h**

#### DÉCISION ATTENDUE EN CONSEIL ORDA-003
> **OPTION A** — Symétrisation : implémenter la branche patron, faire jouer Brawl Arena des deux côtés (`patron` peut jouer la police).
> **OPTION B** — Suppression : retirer la branche patron documentée morte, assumer un atelier mono-côté (côté manifestant uniquement, contre IA police).
> **OPTION C** — Refonte γ : repenser entièrement l'atelier, possiblement le fusionner avec La Place ou La Manif.

Recommandation Argus à ce jour : **Option B** (suppression de la dette + assumer asymétrie). Justification : Brawl Arena n'est pas une négociation, c'est un combat. La symétrie paritariste s'applique aux mécaniques de dialogue, pas au conflit physique.

#### SUCCÈS (selon option choisie)
- Option A : moteur symétrique testé Monte-Carlo, distribution équilibrée
- Option B : code mort supprimé, atelier vendu honnêtement comme « côté manifestant »
- Option C : nouveau brief stratégique soumis pour Protocole β

#### LIVRABLE
- `factionBrawl.ts` v2 (selon option) + tests
- `BrawlArena.svelte` factorisé
- Décision en PV de Conseil ORDA-003

---

### 🟩 ATELIER 7 — Confrontation
**Cycle** : ORDA-004 (sem 7-8) · **Tier** : 3 — POLISH
**État actuel** : 986 lignes Svelte, 394 lignes engine. Le plus gros composant Svelte de tous les ateliers. **Aucun audit formel.**

#### CIBLES
1. **Audit Argus complet** (B1-B11 style)
2. **Réduction LOC** : 986 lignes Svelte sans factorisation = code-smell. Cible : ramener sous 700 lignes par extraction de sous-composants
3. **Couverture des tactiques** : vérifier que toutes les tactiques engine sont jouables UI
4. **Bêta 15 binômes**

#### CORPS
- **Lead** : Corps V (Sapeurs)
- **Co-lead** : Corps I (Architectes) — refactorisation
- **Support** : Corps IV (Stratèges) — bêta
- **Audit** : Argus

#### EFFORT
- Sapeurs : 4 j-h
- Architectes : 3 j-h (factorisation)
- Stratèges : 2 j-h
- Argus : 1 j-h
- **TOTAL : 10 j-h**

#### SUCCÈS
- LOC composant ≤ 700
- 100 % des tactiques moteur exposées en UI
- Audit publié

#### LIVRABLE
- `Confrontation.svelte` v2 factorisé en ≥ 4 sous-composants
- `audit_confrontation.md`

---

### 🟩 ATELIER 8 — La Place
**Cycle** : ORDA-004 (sem 7-8) · **Tier** : 3 — POLISH
**État actuel** : 586 lignes UI, 457 lignes engine. **Aucun audit formel.**

#### CIBLES
1. **Audit Argus complet**
2. **Validation historique** : occupation de places (Nuit Debout, Place de la République, ronds-points Gilets jaunes) — paramètres réalistes ?
3. **Bêta 15**

#### CORPS
- **Lead** : Corps V (Sapeurs)
- **Co-lead** : Corps III (Diplomates) — modélisation des forces de l'ordre
- **Support** : Corps IV (Stratèges) — bêta + validation historique
- **Audit** : Argus

#### EFFORT
- Sapeurs : 3 j-h
- Diplomates : 2 j-h
- Stratèges : 3 j-h
- Argus : 1 j-h
- **TOTAL : 9 j-h**

#### SUCCÈS
- Audit publié
- Validation historique (références citées)
- Bêta 15 sans plainte de cohérence

#### LIVRABLE
- `audit_laplace.md` avec références historiques
- v1.1 si correctifs

---

### 🟩 ATELIER 9 — La Manif
**Cycle** : ORDA-005 (sem 9-10) · **Tier** : 3 — POLISH
**État actuel** : Wrapper standalone 37 lignes (utilise `ManifSimulator.svelte`). **Bug B3 corrigé** (formatFoule branche morte). Validation calibrage non faite.

#### CIBLES
1. **Audit Argus complet** sur `ManifSimulator.svelte` (pas relu intégralement depuis B3)
2. **Calibrage des 7 paramètres** : foule / cadres / cohésion / météo / parcours / ordre de service / pression policière → vérifier qu'aucune combinaison ne produit toujours le même résultat
3. **Validation historique** : nombres de manifestants, météo, pression policière → cohérents avec manifs réelles
4. **Bêta 10**

#### CORPS
- **Lead** : Corps III (Diplomates)
- **Co-lead** : Corps II (Géomètres) — calibrage 7 params
- **Support** : Corps IV (Stratèges)
- **Audit** : Sapeurs

#### EFFORT
- Diplomates : 2 j-h
- Géomètres : 3 j-h
- Stratèges : 2 j-h
- Sapeurs : 1 j-h
- **TOTAL : 8 j-h**

#### SUCCÈS
- 0 combinaison dégénérée (always_win / always_lose) sur grille des 7 params
- Validation historique signée

#### LIVRABLE
- `audit_manif_calibrage.md`

---

### 🟩 ATELIER 10 — Le Meeting
**Cycle** : ORDA-005 (sem 9-10) · **Tier** : 3 — POLISH
**État actuel** : Wrapper 64 lignes. **Bugs B4 (score floor) + B5 (reset) corrigés**.

#### CIBLES
1. **Audit Argus complet** sur `MeetingSimulator.svelte`
2. **Validation rhétorique** : faire relire par un spécialiste de la rhétorique syndicale (Christophe Aguiton ? Jean-Marie Vincent ?)
3. **Bêta 10**
4. **Polish UI** : argumentaire composable est puissant mais peut être confus

#### CORPS
- **Lead** : Corps I (Architectes — section I.A Narratifs)
- **Co-lead** : Corps IV (Stratèges)
- **Support** : Corps V (Sapeurs)

#### EFFORT
- Architectes : 3 j-h
- Stratèges : 2 j-h
- Sapeurs : 1 j-h
- **TOTAL : 6 j-h**

#### SUCCÈS
- Audit publié
- Validation rhétorique signée

#### LIVRABLE
- `audit_meeting_rhetorique.md`
- v1.1 UI

---

## IV. MATRICE D'AFFECTATION (corps × atelier)

Lecture : ★ = lead · ◆ = co-lead · ○ = support · ✓ = audit

| Atelier | Cycle | I-Archi | II-Géom | III-Diplo | IV-Strat | V-Sapeurs | Argus | Total j-h |
|---------|:-----:|:-------:|:-------:|:---------:|:--------:|:---------:|:-----:|:---------:|
| 1. NAO            | 001 | ○ | – | ◆ | ★ | ✓ | – | **10** |
| 2. Élections      | 001 | – | ◆ | – | ○ | ★ | ✓ | **10** |
| 3. Grève          | 002 | ○ | ◆ | ★ | – | ✓ | – | **11** |
| 4. Table          | 002 | ○ | ◆ | – | – | ★ | ✓ | **6**  |
| 5. Matignon       | 003 | ★ | – | – | ◆ | ○ | ✓ | **12** |
| 6. Arena          | 003 | – | ◆ | ★ | – | ○ | ✓ | **12** |
| 7. Confrontation  | 004 | ◆ | – | – | ○ | ★ | ✓ | **10** |
| 8. La Place       | 004 | – | – | ◆ | ○ | ★ | ✓ | **9**  |
| 9. Manif          | 005 | – | ◆ | ★ | ○ | ✓ | – | **8**  |
| 10. Meeting       | 005 | ★ | – | – | ◆ | ○ | – | **6**  |
| **CHARGE PAR CORPS (j-h)** | | **20** | **18** | **14** | **17** | **22** | **6** | **94** |

### Observations stratégiques

- **Charge totale** : 94 jours-homme sur 70 jours calendaires → l'armée doit travailler en parallèle, c'est exactement la doctrine.
- **Charge la plus lourde** : Sapeurs (22 j-h) — cohérent, ils sont sur tous les fronts pour audit. Architectes (20 j-h) — beaucoup de polish UI à produire. C'est aussi cohérent.
- **Charge la plus légère** : Argus (6 j-h) — c'est le maréchal, pas le soldat. Il signe, il ne creuse pas.
- **Goulot d'étranglement potentiel** : Corps V Sapeurs sur ORDA-003 (5 j-h sur Matignon + Arena) et ORDA-004 (8 j-h sur Confrontation + La Place). **Surveiller leur charge**.

---

## V. INDICATEURS DE CAMPAGNE (KPI)

### A. Indicateurs par atelier (mesurés en fin de cycle ORDA)

| KPI | Cible | Source de mesure |
|-----|:-----:|------------------|
| **Bugs critiques restants** | 0 | Audit Sapeurs |
| **Couverture moteur testée** | ≥ 80 % | Vitest |
| **Bêta-testeurs panel** | ≥ 10 par atelier | Inscriptions panel 30 |
| **Plaintes "j'ai pas compris"** | ≤ 1/10 testeurs | Entretiens semi-dirigés |
| **Distribution outcomes équilibrée** | aucun outcome > 60 % ni < 5 % | Logs de partie |
| **Validation externe** (juriste/historien) | 1 par atelier | Signature email |

### B. Indicateurs de campagne (agrégés sur les 5 cycles)

| KPI | Cible J+70 |
|-----|:----------:|
| **Ateliers consolidés** | 10 / 10 |
| **Bugs Argus archivés (résolus)** | ≥ 50 |
| **Audits publiés** | ≥ 10 (1 par atelier) |
| **Bêta-testeurs distincts** | ≥ 30 |
| **Validations externes** | ≥ 5 |
| **AAR archivés** | 5 (1 par cycle) |

### C. Pulse hebdomadaire
Chaque vendredi à 18 h, tableau de pulse au Conseil ORDA :
1. Cibles frappées cette semaine
2. Cibles ratées (avec raison)
3. Charge réelle vs charge prévue (par corps)
4. Mémo Rouge éventuels (Stratèges)

---

## VI. RISQUES & PARADES

### Risque 1 — Surcharge Sapeurs sur ORDA-003 et ORDA-004
**Probabilité** : Élevée. **Impact** : Retard cycle.
**Parade** : Détacher temporairement 1 sapeur supplémentaire (ou 1 architecte formé en code review) pour ces deux cycles. Validation par Maréchal en Conseil ORDA-002.

### Risque 2 — Validation externe (juriste/historien) bloquée
**Probabilité** : Moyenne. **Impact** : Atelier non clôturable.
**Parade** : **Lister les 5 experts externes dès la semaine 0** et caler leurs rendez-vous **avant** le début de chaque cycle concerné. Pas de "on demandera quand on sera prêt" — anticiper.

### Risque 3 — Bêta panel 30 insuffisant
**Probabilité** : Moyenne. **Impact** : Données joueur non fiables.
**Parade** : Le Corps IV (Stratèges) doit recruter **avant ORDA-001** et confirmer 30 bêta-testeurs activés. Si < 25, signaler en Mémo Rouge.

### Risque 4 — Décision impossible sur Brawl Arena (Option A/B/C)
**Probabilité** : Élevée. **Impact** : Cycle ORDA-003 retardé.
**Parade** : Forcer la décision en pré-Conseil dès la semaine 4 (avant ouverture ORDA-003). Pas de débat en cours de cycle.

### Risque 5 — Régression introduite par les refactos
**Probabilité** : Moyenne. **Impact** : Bug en production.
**Parade** : Suite de tests Vitest **obligatoire** sur chaque atelier avant refacto. Pas de refacto sans tests préalables.

### Risque 6 — Dérive temporelle (cycles qui s'étirent)
**Probabilité** : Élevée (loi de Hofstadter).
**Parade** : Règle d'engagement RE-7 : pas d'urgence imposée. **Si un cycle dérape de + 2 jours, on coupe la cible la moins prioritaire** plutôt que d'allonger le cycle. La discipline du cycle court est non négociable.

---

## VII. ORDRE DE BATAILLE FINAL

> **Camarades de campagne,**
>
> 10 ateliers. 70 jours. 94 jours-homme. 5 corps en parallèle. La discipline du cycle court est notre seule garantie. La spécialisation est notre seule force. Le double regard (lead + audit) est notre seule sécurité.
>
> J'ouvre **ORDA-001** ce 2026-05-07 sur les ateliers **NAO** et **Élections**. Premier conseil : 2026-05-09 à 09 h, salle de guerre. Présence obligatoire des 5 colonels.
>
> Bulletins attendus :
> - `BULLETIN_ORDA_001_OBS.md` — 2026-05-11
> - `BULLETIN_ORDA_001_RECO.md` — 2026-05-15
> - `BULLETIN_ORDA_001_DEC.md` — 2026-05-16
> - `BULLETIN_ORDA_001_AAR.md` — 2026-05-21
>
> Je veux des chiffres. Je veux des bugs nommés. Je veux des solutions livrées.
>
> **Au travail. Présentez les armes.**
>
> — **Argus**, Maréchal-auditeur, panel PARITAS
> *2026-05-07, 23 h 12, après dépôt du portail PARITAS.*

---

## ANNEXE A — Carte de campagne synthétique

```
Cycles    │ Sem 1-2  │ Sem 3-4  │ Sem 5-6   │ Sem 7-8     │ Sem 9-10
══════════╪══════════╪══════════╪═══════════╪═════════════╪═════════════
ORDA      │  001     │  002     │  003      │  004        │  005
Tier      │  T1      │  T1      │  T2       │  T3         │  T3
Atelier A │  NAO     │  GRÈVE   │  MATIGNON │  CONFRONT.  │  MANIF
Atelier B │  ÉLECTI. │  TABLE   │  ARENA    │  LA PLACE   │  MEETING
Charge j-h│  20      │  17      │  24       │  19         │  14
Lead corps│ III/V    │ III/V    │ I/III     │ V/V         │ III/I
═══════════════════════════════════════════════════════════════════════
Cumul     │  20      │  37      │  61       │  80         │  94 j-h
```

---

## ANNEXE B — Rituels de la campagne

| Rituel | Fréquence | Animateur | Livrable |
|--------|-----------|-----------|----------|
| **Pré-Conseil ORDA** | début cycle | Argus | Brief stratégique |
| **Standup quotidien** | 9 h, 15 min | Colonel de chaque corps | Pulse |
| **Pulse vendredi 18 h** | hebdo | Colonels | Tableau pulse |
| **Conseil ORDA** | bi-mensuel | Argus | PV décision |
| **AAR cycle** | fin de cycle | Argus + colonels | `BULLETIN_ORDA_<n>_AAR.md` |
| **Cour martiale** | si nécessaire | Argus + 2 colonels neutres | PV de sanction |

---

*Fin du Bulletin ORDA-001. Diffusion : panel PARITAS complet. Prochaine révision : Conseil ORDA-001 le 2026-05-09.*

**Argus.**
