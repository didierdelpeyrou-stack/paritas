# Roadmap — intégration du panel des 100 expert·es

Plan séquencé pour transformer les verdicts de [PANEL_EXPERTS_100.md](PANEL_EXPERTS_100.md)
et l'audit chat en tâches techniques. 4 vagues, 37 tâches, ~10 semaines
pour un dev solo + 1 pige historienne ponctuelle.

Format ligne : `# — Titre — expert·e(s) — livrable concret — effort (S<2j, M<5j, L<10j)`

Effort total : **~95 jours-dev + ~12 jours-piges externes**.

---

## Vague 1 — Sécurité éthique & UX critique (P0)

*Objectif : v1.1 sortie en 2 semaines. Verrouille les 3 risques nommés
en synthèse de l'audit.*

### 1A. Révélation progressive (densité cognitive)

1. **Disclosure des 6 ressources** — Norman, Dehaene — au tour 1, n'afficher que Confiance + Caisse ; déverrouiller les 4 autres au fil des tours pivots — `src/components/sidebar/ResourceBar.svelte`, ajouter `unlockedAt: number` dans `gameState.svelte` — **M**.
2. **Verrou + tooltip sur options grisées** — Nielsen — afficher icône cadenas + texte « réservé au trait *X* » au lieu d'un bouton inerte — `src/components/scene/ChoiceButton.svelte` — **S**.
3. **Toggle Réfléchi/Compulsif live** — Grandin — déplacer le sélecteur de mode de StartScreen vers le panneau Settings (accessible à tout moment) — `src/components/Settings.svelte`, `gameState.mode` mutable — **S**.
4. **Avertissement mode Compulsif** — Grandin — bandeau au démarrage : « voix intérieures, registre anxiogène, désactivable à tout moment » — `Landing.svelte` ou `StartScreen.svelte` — **XS**.

### 1B. Pipeline FALC — transparence

5. **Toggle « voir le texte source »** — Rudin — chaque scénario reformulé garde le texte original accessible par bouton discret — `src/game/narrative/pipelineContent.ts`, persister `sourceText` — **S**.
6. **Audit biais FALC sur figures non-blanches & colonies** — Gebru, Noiriel — pige externe : un·e historien·ne lit 100 % des scénarios touchant immigration/colonies/postcoloniel et flagge les euphémisations — **livrable doc** `docs/AUDIT_FALC_BIAIS.md` — **pige M**.

### 1C. Représentation

7. **Ajouter 4 figures légendaires féminines** — Perrot — Madeleine Pelletier (1874-1939), Lucie Baud (1870-1913), Jeanne Bouvier (1865-1964), Henriette Carlier (anarcho-syndicaliste) — `src/game/content/legendaryCharacters.ts` + bios + traits — **M**.
8. **Inventaire d'ambivalence pour les figures déjà présentes** — Boucheron — passe de relecture sur Jouhaux (Vichy), Schneider (Creusot), Léon Blum (Riom) — bio existante doit mentionner zone d'ombre — **S**.

### 1D. Inconfort assumé

9. **Une décision sans option honorable** — Romero — repérer 3 tours candidats (1940 Charte du Travail, 1947 scission CGT-FO, 1995 Plan Juppé) et y forcer un *trilemme* où chaque issue blesse — `src/game/content/scenarios/*.json` — **M**.
10. **Avertissement mémoriel pour ces tours** — Romero — bandeau « ce tour reproduit un dilemme historique réel — il n'y a pas de bonne réponse » — UI shared — **XS**.

**Total V1 : 8 tâches dev (S=4 / M=3 / XS=2) + 1 pige ≈ 14 jours.**

---

## Vague 2 — Profondeur narrative & théorique (P1)

*Objectif : v1.2 en 4 semaines après v1.1. Donne au jeu son armature
intellectuelle — c'est ce qui le rend citable par un·e chercheur·euse.*

### 2A. Découpage & rejouabilité

11. **5 chapitres autonomes** — Meier, Castel — découper les 100 tours en : *I. La protection rapprochée* (1789-1864), *II. La République sociale* (1864-1914), *III. La protection statutaire* (1914-1981), *IV. Les recompositions* (1981-2017), *V. La désaffiliation* (2017-2026). Chaque chapitre démarrable indépendamment — `src/game/engine/chapters.ts` (nouveau) — **L**.
12. **Cliffhanger fin de chapitre** — Meier — chaque chapitre se termine sur une décision-pivot (1864 Ollivier, 1936 Matignon, 1945 ordonnances, 2003 réforme Fillon) — contenu narratif — **M**.

### 2B. Audio adaptatif

13. **Streaming audio par chapitre** — Eno — preload uniquement les ères du chapitre courant (économie ~5 Mo) — `src/lib/audio/audio.ts` refactor — **M**.
14. **Couche basse bruit blanc d'époque** — Murch — cloches, machine à écrire, métro 70's, clavier électrique — sous la musique d'ère — `src/game/audio/sfx.ts` ambient layer — **M**.
15. **Silence pré-décision lourde** — Yamaoka — flag `weight: 'heavy'` sur scénarios → fade-out musique 2s avant l'apparition des choix — `pipelineContent.ts` + audio engine — **S**.

### 2C. Indicateurs finals

16. **Compteur « changements d'avis au survol »** — Kahneman — incrémenter à chaque hover qui change la pré-sélection > 800 ms ; afficher dans EndingReport sous forme « Système 1/Système 2 » — `src/game/engine/decisionStats.ts` — **S**.
17. **Classification Esping-Andersen** — au générique : la trajectoire du joueur tombe dans *libéral*, *conservateur-corporatiste*, *social-démocrate* (matrice sur ressources finales) — `src/components/ending/WelfareTypology.svelte` — **M**.
18. **Indicateur Capabilités (Sen)** — « combien de futurs ton personnage disposait-il ? » : ratio options ouvertes / options grisées sur l'ensemble de la partie — `EndingReport.svelte` — **S**.
19. **Coefficient Gini sectoriel** — Piketty — jauge persistante en sidebar : agrégat des effets distributifs des accords signés — `src/game/engine/giniMeter.ts` (nouveau) — **M**.
20. **7e jauge cachée Honte/Fierté** — Ernaux — invisible pendant la partie, révélée à l'épilogue avec le récit qui colle. Alimentée par décisions de trahison/fidélité à la base — `gameState` + `EndingReport` — **M**.

### 2D. Justification multiple

21. **Mode Réfléchi : 3 cités au lieu d'1 rappel** — Boltanski — chaque décision propose 2-3 grilles de justification concurrentes (industrielle/civique/marchande) — `src/game/narrative/justifications.ts` (nouveau) + contenu — **L**.

### 2E. Densité narrative

22. **Cartouche XIXe : 3-4 phrases max** — Raynal, Dehaene — passe éditoriale + lint qui bloque > 320 caractères en mode mobile — `scripts/lint-scenario-density.ts` — **S**.
23. **Vérification longueur de ligne** — Dehaene — CSS `max-width` mobile à 65ch sur tout texte narratif — `src/components/scene/*.svelte` audit — **S**.

**Total V2 : 13 tâches (S=5 / M=6 / L=2) ≈ 32 jours.**

---

## Vague 3 — Histoire sociale rigoureuse (P2)

*Objectif : v1.3 en 4 semaines. Vise la citabilité académique.*

### 3A. Paritarisme — fond historique

24. **Trois âges de Castel comme ossature** — Castel — chaque chapitre s'ouvre sur l'âge correspondant (protection rapprochée → sociale → statutaire → désaffiliation), avec définition cliquable au glossaire — contenu — **S**.
25. **Tour pivot Hatzfeld 1850→1945** — Hatzfeld — narrer le retournement *paupérisme → conquête sociale* en 1 mini-séquence (3 scénarios) au début du chapitre III — contenu — **M**.
26. **1945 collectif, pas Croizat seul** — Valat — réécrire les 5 scénarios autour de l'ordonnance pour montrer Laroque, Croizat, Parodi, Buisson — contenu — **M**.
27. **Salaire vs salaire socialisé** — Friot — entrée glossaire dédiée + une mécanique : option « réinvestir en cotisation socialisée » apparaît à partir du chapitre III — contenu + `scenarios.ts` — **M**.
28. **Pression interne / arrière-cour** — Omnès — refondre la jauge *Rapport de force* en deux composantes : *force externe* (face au camp adverse) et *cohésion interne* (face à sa base) — `gameState.svelte`, sidebar — **L**.

### 3B. Sciences sociales

29. **Renommer les 6 ressources comme capitaux (Bourdieu)** — au moins en infobulle : Confiance ≈ capital social, Caisse ≈ économique, Légitimité ≈ symbolique, etc. — `src/game/types.ts` documentation + tooltips — **S**.
30. **Non-humains dans scénarios** — Latour — au moins 5 scénarios où le formulaire/grille indiciaire/timbre fiscal *est* l'agent décisif (URSSAF 1960, RIB 1973, déclaration en ligne 2019) — contenu — **M**.

### 3C. Outillage IA

31. **Outil interne d'audit biais FALC** — Gebru, Rudin — script qui rejoue les reformulations sur un set de figures non-blanches/femmes/colonisé·es et compare la longueur/registre — `scripts/audit-falc-bias.ts` — **M**.
32. **Fallback Mistral** — LeCun — wrapper qui bascule de Haiku vers Mistral Large si l'API EU est dispo — `worker/src/llm.ts` — **S**.
33. **Open-sourcing des scénarios** — Torvalds — séparer contenu (CC-BY-SA) et code (MIT) — `LICENSES/`, `CONTENT_LICENSE.md` — **S**.

**Total V3 : 10 tâches (S=4 / M=5 / L=1) ≈ 28 jours.**

---

## Vague 4 — Vision long terme (P3)

*Objectif : v2.0 en 6+ mois. Transforme le jeu en plateforme.*

34. **Debrief post-partie pédagogique** — McGonigal — un écran « ce que tu as joué dans la vraie histoire » avec liens : INA, Persée, archives CGT/MEDEF, Hatzfeld, Castel — `src/components/ending/Debrief.svelte` — **M**.
35. **Couleurs des camps configurables** — Tammet — paramètres accessibilité : permet d'inverser/personnaliser rouge/bleu — `Settings.svelte` — **S**.
36. **Thème musical original 3 notes** — Derivière — commande externe à un·e compositeur·trice francophone — **pige L**.
37. **Étude RCT publiable** — Duflo — pipeline d'export CSV anonymisé des décisions agrégées + protocole IRB léger pour publication — `scripts/export-anonymous-dataset.ts` + `docs/PROTOCOLE_RCT.md` — **L**.

**Total V4 : 4 tâches (S=1 / M=1 / L=1) + 1 pige ≈ 18 jours.**

---

## Récap par vague

| Vague | Sortie | Tâches | Jours-dev | Piges |
| --- | --- | --- | --- | --- |
| V1 — Éthique & UX critique | v1.1 (S+2) | 10 | 14 | 1 (M) |
| V2 — Profondeur narrative | v1.2 (S+6) | 13 | 32 | — |
| V3 — Histoire rigoureuse | v1.3 (S+10) | 10 | 28 | — |
| V4 — Vision long terme | v2.0 (S+24) | 4 | 18 | 1 (L) |
| **Total** | | **37** | **92** | **2** |

## Dépendances inter-vagues

- V2.11 (chapitres) bloque V2.12, V2.13, V3.24, V3.25.
- V1.5 (toggle FALC source) bloque V3.31 (audit) — il faut pouvoir comparer source/reformulation.
- V2.20 (jauge Honte/Fierté) bloque V4.34 (debrief affiche cette dimension).
- V3.28 (refonte rapport de force) est la plus risquée — peut casser l'équilibre. À traiter sur branche dédiée avec replay-tests sur 5 parties archivées.

## Mesure de succès par vague

- **V1** : aucun nouveau joueur n'abandonne avant le tour 5 (test usabilité 8 personnes).
- **V2** : durée médiane d'une partie passe de ~6 h à ~3 h (chapitres) ; taux de rejouabilité × 2.
- **V3** : 1 article ou recension académique français cite Paritas comme support pédagogique.
- **V4** : un dataset anonymisé exploitable est publié sur Zenodo ou data.gouv.fr.

---

**Maintenance vivante.** Cette roadmap doit être relue tous les 2 mois.
Une tâche qui n'a pas bougé en 2 cycles : la couper ou la requalifier.
Le panel n'est pas un cahier des charges, c'est un *baromètre* — si une
recommandation devient obsolète parce que le jeu a évolué, on l'archive
sans complexe.
