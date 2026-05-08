# Session agent-11-duflo · Journal

**Date simulée** : 2026-05-08 · **Build** : v2.2.2-prebeta (HEAD 0813c75) · **Device** : MacBook + viewport mobile 390px audit · **Mode** : Théâtre desktop, Réfléchi · **Camps testés** : 2 (Salarié 40 tours / Patron 40 tours) · **Lentille** : justesse économique RCT, comparaison comptes CGT/CFDT publiés

---

## Audit économique préliminaire (avant partie)

J'ouvre `src/game/org/treasury.ts` et `src/game/org/organization.ts`. Lentille Duflo : *les paramètres sont-ils des données plausibles, ou des chiffres de game-feel ?*

**Découverte P0 immédiate** — incohérence interne entre **deux taux de cotisation** :

- `organization.ts:55` → `expectedDuesIncome` rate = `0.04` (salarié) / `0.32` (patron). Affichée dans le HUD via `OrganizationPanel.svelte:21` (`const dues = $derived(expectedDuesIncome(organization))`).
- `treasury.ts:87` → `cotisationRate = 0.05` (salarié) / `0.16` (patron). C'est ce qui est *réellement* débité chaque tour.

Le HUD ment au joueur : avec 420 adhérents salariés, il prédit `420 × 0.04 = 17` ; le tour produit `420 × 0.05 = 21`. Côté patron c'est pire : prédit `90 × 0.32 = 29`, réel `90 × 0.16 = 14`. **Le ratio salarié:patron par tête passe de 1:8 (HUD) à 1:3,2 (treasury)**. Deux modèles cohabitent. Pour un économiste, c'est rédhibitoire — la première chose qu'on regarde c'est l'égalité comptable.

**Réalisme externe** — comparaison comptes consolidés CGT 2022 (~85 M€ ressources / 670 k adhérents ≈ 127 €/adh./an) et CFDT (~120 €/adh./an). Côté patronal, U2P / Medef, cotisation par entreprise adhérente ~3 à 8× supérieure à un syndicat de salariés (variable selon taille). Le ratio **1:3 documenté en commentaire** (`treasury.ts:84-86`) est *la bonne fourchette empirique*. Le `1:8` du `expectedDuesIncome` est trop élevé. **Il faut harmoniser à 0.05 / 0.16, pas l'inverse.**

## Partie 1 — Salariée, distribution, 40 tours

T1-T8 — `freshOrganization('salarie')` : treasury 28, membership 420, permanents 2, juristes 1. Recettes T1 ≈ cotis 21 + presse 2 = 23 ; dépenses ≈ permanents −4, juristes −1, locaux −1, comm −1, fonct −1 = −8. **Net +15/tour** en équilibre. Stratégie distribution (`STRATEGY_MULT.distribution.depense = 1.35`) : dépenses passent à −11 (`strategyRound` ceil), net +12. Caisse passe de 28 → ~85 à T6.

T9 — Premier choix narratif. Pas de feedforward sur l'impact treasury. Friction P1 : *afficher le delta caisse en hover comme `formatOrgDelta` le fait pour les autres ressources* (`organization.ts:74`).

T15 — **Premier congrès** (`treasury.ts:282`, `turn % 8 === 0` à partir de T15... mais T15 % 8 = 7, pas 0 !). Vérification : le test `treasury.test.ts` valide T16, T24, T32. Le commentaire `// à partir du tour T15` du code (`treasury.ts:279`) **est faux** — le premier congrès tombe à T16. Petit P2, mais pour un économiste qui suit son budget, le commentaire trompe.

T16 — Congrès : `Math.max(4, Math.round(420/30 + 2*0.4)) = Math.max(4, 15) = 15`. Pic de dépense −15 sous distribution → −20. Avec un net courant +12, je perds 8 ce tour. **C'est exactement le rythme budgétaire que vit la CGT** (congrès confédéral tous les 3-4 ans, gros poste à anticiper). Réaliste.

T20 — Caisse atteint 142. Stratégie distribution OK, militants montent.

T23 — Subventions paritaires se débloquent (`treasury.ts:122`, `if (turn >= 23)`). Justification : « post-1945 Sécurité sociale ». Sur calendrier 1789-2025 / 100 tours, le tour 23 = ~1850 si linéaire — **incohérence pédagogique**. Si la map calendaire est non-linéaire (probable), c'est OK, mais il faut le vérifier ailleurs. P2.

T28 — Droits syndicaux loi 1968 (`treasury.ts:136`). Idem mapping turn→date à valider.

T32 — Deuxième congrès. Caisse stable autour de 200.

T40 — Caisse 247, plafond doux 300 (`organization.ts:32`) jamais atteint. Cohésion +1/tour distribution → 98. Le système est bien calibré côté salarié.

## Partie 2 — Patronale, épargne, 40 tours

T1 — `freshOrganization('patron')` : treasury 42, membership 90, permanents 4, juristes 3. Recettes T1 = cotis `Math.round(90*0.16) = 14` + presse `3*2 = 6` = 20. Dépenses = permanents −8, juristes −3, locaux −1 (1 section), comm −3, fonct −1 = −16. **Net +4/tour** équilibre. **Stratégie épargne** (mult dépenses 0.65) : −16 × 0.65 = −10 (`strategyRound` floor proche zéro). Net +10.

T6 — Caisse 102. Très vite gras. Le ratio recettes/dépenses patronal est trop favorable en épargne.

T16 — Congrès : `Math.max(4, Math.round(90/30 + 1*0.4)) = Math.max(4, 3) = 4`. Sous épargne : `4 × 0.65 = 2.6 → -2` (floor proche zéro). **Le congrès patronal coûte −2 alors que le congrès salarié coûte −15** (mêmes 8 tours plus tard). Asymétrie comptable assumée par la formule mais qui surprend : un congrès U2P coûte cher en proportion (location de salle, hébergement) tout autant qu'un congrès CGT. **P1 réalisme** : la formule `membership/30 + sections*0.4` favorise structurellement les organisations à faible adhérence, ce qui est anti-réaliste pour le patronat où les frais fixes (per capita patronal élevé) dominent.

T20 — Caisse 168. Ennui : aucune contrainte. Lentille Duflo : *un agent patronal en épargne n'a aucune décision budgétaire significative à prendre pendant 30 tours*. L'asymétrie économique masque le game-design.

T28 — Droits syndicaux loi 1968 : **+4 (4 permanents × 1)**. Mais — anachronisme — cette compensation est **versée par l'État aux syndicats de salariés** (heures de délégation, art. L2143-13 sqq.), **pas aux organisations patronales**. Côté patron, ce poste recettes ne devrait pas exister. **Bug réalisme P0** : `treasury.ts:135-146` ne filtre pas par `org.camp`.

T40 — Caisse 287, près du soft cap 300. Cohésion 18 (épargne -1/tour → plancher). Partie sans tension. *« Ennui mesurable »*.

## Audit des 7 ateliers (lentille économique)

Je ne joue pas chaque atelier intégralement (6 tours × 7 = trop), mais j'audite leur cohérence économique :

1. **NAO** (`ateliers/nao-main.ts`) — négociation annuelle. Jeu attendu : input salaire/temps. Cohérent.
2. **Élections** (`elections-main.ts`) — élections CSE. Cohérent post-2017.
3. **La Table** (`table-main.ts`) — paritaire. Cohérent.
4. **Arena** (`arena-main.ts`) — confrontation. Lien budget faible.
5. **La Place** (`place-main.ts`) — meeting public. Lien budget faible.
6. **La Grève** (`greve-main.ts`) — devrait consommer caisse via `aide-sociale` (treasury.ts:232). Couplage à vérifier — l'atelier passe-t-il un `mobilisationFatigue ≥ 50` au state principal ?
7. **Meeting** (`meeting-main.ts`) — idem.

**Constat transverse** : les ateliers utilisent `mockGameState.ts` (standalone). Le couplage avec `computeBudget` n'est pas garanti. P1 : *la conséquence économique d'une grève réussie/échouée doit revenir dans le budget principal*.

## Bilan RCT — données à logger

(Livrable spécifique du profil) — 5 traces à instrumenter pour faire de PARITAS un outil RCT :

1. **`{turn, camp, strategy, treasury, net}`** chaque tour → courbe de trajectoire budgétaire par seed.
2. **`{turn, choiceId, treasuryBefore, treasuryAfter}`** → utilité économique révélée des choix.
3. **`{turn, ratioRecettesDepenses}`** → indicateur de stress financier joueur.
4. **`{congrèsTurn, anticipated:bool}`** → mesure si le joueur épargne en T13-15 avant T16.
5. **`{strategySwitchTurn, reason}`** → quand le joueur passe distribution→épargne (révèle la pression ressentie).

Tout ça anonymisé, opt-in RGPD, agrégé > N=200 pour rendre publiable.
