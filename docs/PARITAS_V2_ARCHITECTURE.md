# Paritas V2 — Architecture Produit Et Technique

## Intention

La V2 doit remplacer la V1 par un jeu où le joueur ne traverse pas seulement des événements historiques : il dirige une organisation vivante, négocie contre des acteurs qui ont leurs stratégies, construit ou abîme son syndicat, et voit l’histoire réagir à ses choix.

Le nom public reste **Paritas**. Les termes de chantier comme `Rebirth`, `V1` ou `V2` ne doivent jamais apparaître dans l’interface finale.

## Boucle De Jeu

La boucle cible est :

1. **Lire la situation historique**
   - Un événement majeur, une crise de branche, une échéance électorale ou une pression de l’État.
   - Le contexte dépend de la période, du camp, des choix passés et de l’état du syndicat.

2. **Préparer la stratégie**
   - Choisir une posture : compromis, rapport de force, expertise, communication, rupture, alliance.
   - Affecter des ressources : caisse, militants, juristes, relais médias, permanents, temps de négociation.

3. **Agir**
   - Acheter, vendre, recruter, former, mobiliser, négocier, faire campagne, signer, refuser, créer une institution.
   - Chaque action consomme des ressources et modifie l’organisation.

4. **Résoudre**
   - Le moteur compare : ressources du joueur, compétences, stratégie de l’État, stratégie adverse, opinion, mémoire historique.
   - La résolution produit des effets chiffrés, des conséquences narratives, des flags et des tensions.

5. **Faire évoluer l’organisation**
   - Le syndicat ou l’organisation patronale gagne des sections, perd des adhérents, construit une caisse, subit des dissidences, prépare des élections internes.

6. **Déclencher la suite**
   - Les prochains scénarios sont choisis par pipeline narratif : chronologie historique + état du monde + choix passés.

## Nouveaux Domaines De Simulation

### 1. Organisation Du Joueur

Nouveau module : `src/game/org/`

Types principaux :

```ts
export interface PlayerOrganization {
  name: string;
  camp: Camp;
  doctrine: Doctrine;
  treasury: number;
  membership: number;
  militants: number;
  permanentStaff: number;
  legalTeam: number;
  mediaRelay: number;
  localSections: Record<BranchId, LocalSection>;
  internalFactions: InternalFaction[];
  inventory: OrgAsset[];
  mandates: Mandate[];
  election: InternalElectionState | null;
}
```

Rôle :

- Donner au joueur quelque chose à construire entre les grands événements.
- Rendre les ressources concrètes : une grève longue coûte en caisse, une négociation technique exige des juristes, une campagne interne consomme du temps militant.
- Permettre des trajectoires différentes : syndicat de masse, appareil expert, organisation radicale, appareil institutionnel, patronat offensif, patronat de compromis.

### 2. Développement Du Syndicat

Fonction débloquée à partir de **1884** pour le camp salarié, après la loi Waldeck-Rousseau.

Pour le camp patronal, équivalent :

- **Développer ton organisation patronale**
- chambres professionnelles,
- fédérations de branche,
- service juridique,
- caisse de grève patronale / fonds de lock-out,
- réseau parlementaire,
- presse économique.

Actions possibles :

- `recruter_adherents`
- `ouvrir_section_locale`
- `former_delegues`
- `renforcer_caisse`
- `creer_service_juridique`
- `lancer_journal`
- `preparer_greve`
- `negocier_branche`
- `acheter_local`
- `vendre_actif`
- `financer_campagne_interne`
- `organiser_election_interne`

Chaque action a :

- coût,
- durée,
- condition historique,
- risque,
- effet immédiat,
- effet différé,
- trace narrative.

### 3. Marché Des Actifs Et Ressources

Nouveau module : `src/game/economy/`

Le joueur peut acheter ou vendre :

- local syndical,
- imprimerie / journal,
- caisse de secours,
- équipe juridique,
- réseau de correspondants,
- fonds de grève,
- centre de formation,
- institut d’expertise,
- réseau patronal de lobbying,
- réserve de communication.

Exemple :

```ts
export interface OrgAsset {
  id: string;
  label: string;
  type: 'local' | 'media' | 'legal' | 'training' | 'strikeFund' | 'lobbying' | 'research';
  purchaseCost: number;
  upkeep: number;
  resaleValue: number;
  effects: StrategyModifiers;
  unlockYear?: number;
}
```

Objectif : créer du plaisir de gestion, de progression et de spécialisation.

### 4. Élections Internes

Nouveau module : `src/game/politics/internalElections.ts`

Déclencheurs :

- tous les X tours après 1895,
- après une défaite sociale,
- après trahison de la base,
- après signature très contestée,
- après crise de doctrine.

Variables :

- confiance de la base,
- doctrine dominante,
- factions internes,
- ressources de campagne,
- prestige historique,
- fatigue militante,
- opposants internes.

Le joueur peut :

- faire campagne sur le compromis,
- promettre la rupture,
- purger / marginaliser une faction,
- intégrer l’opposition,
- négocier une motion commune,
- truquer symboliquement l’ordre du jour (risqué).

Conséquences :

- changement de doctrine,
- bonus/malus de cohésion,
- départ d’adhérents,
- naissance d’une scission,
- renforcement d’un leader.

## IA Des Acteurs

### 1. État Stratège

Nouveau module : `src/game/ai/stateStrategy.ts`

L’État doit avoir une stratégie tour par tour, calculée depuis tous les paramètres :

- état des finances publiques,
- légitimité du gouvernement,
- niveau de conflit social,
- période historique,
- doctrine du pouvoir,
- rapport avec patronat/syndicats,
- opinion publique,
- institutions déjà construites.

Stratégies possibles :

- `mediation` : inviter à la table, chercher compromis.
- `decret` : contourner les partenaires sociaux.
- `repression` : police, interdictions, sanctions.
- `cooptation` : intégrer certains représentants.
- `cadrage_budgetaire` : imposer contraintes financières.
- `lettre_cadrage` : borner la négociation, surtout assurance chômage.
- `reforme_structurelle` : imposer une réforme globale.
- `temporisation` : attendre l’usure.

Le choix de l’État devient visible par indices narratifs :

- rumeurs de décret,
- fuite dans la presse,
- invitation ministérielle,
- nomination d’un médiateur,
- lettre de cadrage,
- pression budgétaire.

### 2. Adversaire Stratège

Nouveau module : `src/game/ai/opponentStrategy.ts`

Pour le patronat :

- accepter un compromis limité,
- diviser les syndicats,
- jouer la branche contre l’entreprise,
- déplacer la production,
- médiatiser la responsabilité économique,
- proposer une prime au lieu d’un droit durable,
- faire du lobbying.

Pour le camp salarié adverse si le joueur est patron :

- grève courte,
- grève reconductible,
- campagne médiatique,
- alliance intersyndicale,
- recours juridique,
- occupation,
- demande de négociation de branche.

## Pipelines Narratifs

Nouveau module : `src/game/narrative/pipelines/`

Un pipeline narratif est une chaîne de scènes qui peut s’ouvrir, bifurquer, se refermer ou revenir plus tard.

### Pipeline 1 — Institution

Déclencheurs :

- expertise élevée,
- choix de compromis,
- soutien de l’État,
- caisse suffisante.

Étapes :

1. revendication,
2. négociation,
3. texte,
4. mise en œuvre,
5. crise de gestion,
6. mémoire historique.

Exemple : conventions collectives → Sécurité sociale → Unédic → CSE.

### Pipeline 2 — Rupture

Déclencheurs :

- rapport de force élevé,
- confiance de la base forte,
- santé sociale basse,
- adversaire dur.

Étapes :

1. colère locale,
2. mot d’ordre,
3. mobilisation,
4. répression ou concession,
5. mémoire symbolique,
6. scission ou institutionnalisation.

Exemple : Canuts → grève 1936 → Grenelle → retraites 2023.

### Pipeline 3 — Capture

Déclencheurs :

- trop de proximité avec l’État,
- base trahie,
- institution forte mais confiance basse.

Étapes :

1. invitation,
2. siège obtenu,
3. compromis opaque,
4. base frustrée,
5. crise interne,
6. perte d’élection interne ou scission.

### Pipeline 4 — Refondation

Déclencheurs :

- institutions affaiblies,
- forte expertise,
- capital militant et social élevés,
- refus répétés de compromis classiques.

Étapes :

1. diagnostic d’échec,
2. expérimentation locale,
3. caisse autonome,
4. alliance ESS / mutuelles / branches,
5. reconnaissance partielle,
6. nouvelle doctrine.

### Pipeline 5 — Déclin

Déclencheurs :

- caisse basse,
- santé sociale basse,
- défaite électorale,
- adhérents en baisse.

Étapes :

1. dette,
2. vente d’actif,
3. licenciement de permanents,
4. perte de sections,
5. radicalisation ou recentrage,
6. disparition ou fusion.

## Sélection Des Scénarios

La V1 choisit surtout le prochain scénario chronologique. La V2 doit utiliser un routeur narratif.

Nouveau module : `src/game/narrative/scenarioRouter.ts`

Entrées :

- tour,
- année,
- camp,
- ressources,
- organisation,
- acteurs,
- pipelines actifs,
- flags historiques,
- élections internes,
- stratégie de l’État,
- stratégie adverse.

Sortie :

```ts
export interface ScenarioCandidate {
  scenarioId: string;
  priority: number;
  reason: string;
  pipelineId?: string;
}
```

Règle :

- Les grands jalons historiques restent des ancres.
- Les micro-scènes dépendent des paramètres.
- Les scènes de développement d’organisation deviennent accessibles entre les jalons.
- Les scénarios peuvent bifurquer : Matignon signé, Matignon refusé, Matignon contourné par décret ne doivent pas ouvrir les mêmes suites.

## Stratégies Joueur

Nouveau module : `src/game/strategy/`

Une stratégie est plus qu’un choix de bouton. C’est un plan sur plusieurs tours.

Exemples :

- `strategie_compromis_branche`
- `strategie_greve_reconductible`
- `strategie_professionnalisation`
- `strategie_conquete_interne`
- `strategie_lobbying_parlementaire`
- `strategie_refondation_mutualiste`
- `strategie_capture_institutionnelle`
- `strategie_media_opinion`

Chaque stratégie :

- a des conditions,
- consomme des ressources par tour,
- modifie les probabilités,
- ouvre des scènes,
- peut réussir, échouer ou muter.

Exemple :

```ts
export interface ActiveStrategy {
  id: string;
  startedTurn: number;
  duration: number;
  investment: Partial<ResourceWallet>;
  target: 'state' | 'opponent' | 'base' | 'opinion' | 'institution';
  progress: number;
  risk: number;
}
```

## Interface V2

### Écran Principal

Disposition recommandée :

- colonne gauche : organisation du joueur,
- centre : scène narrative,
- colonne droite : État, adversaire, opinion, pipelines actifs.

### Nouvel Onglet Organisation

Contenu :

- adhérents,
- caisse,
- sections locales,
- factions,
- actifs,
- prochaines élections internes,
- stratégies en cours.

### Nouvel Onglet Stratégie

Contenu :

- plans disponibles,
- coût par tour,
- chances estimées,
- risques,
- rappel théorique.

### Nouvel Onglet Marché / Actifs

Contenu :

- acheter,
- vendre,
- entretenir,
- investir.

## IA Haiku Plus Tard

La clé API ne doit jamais être intégrée dans le client GitHub Pages.

Architecture finale recommandée :

- frontend statique GitHub Pages,
- backend léger serverless :
  - Cloudflare Workers,
  - Vercel Functions,
  - Netlify Functions,
  - ou petit serveur Node.
- variable serveur :
  - `ANTHROPIC_API_KEY`
- endpoint :
  - `POST /api/narrative`

Le modèle Haiku sert uniquement à enrichir :

- variation de conséquences narratives,
- reformulation selon le trait dominant,
- lettres internes,
- discours de meeting,
- journaux de presse,
- voix intérieures,
- résumés de fin de chapitre.

Il ne doit pas décider seul des effets numériques. Les règles du jeu restent déterministes et auditées côté moteur.

Contrat proposé :

```ts
export interface NarrativePromptInput {
  scenario: PublicScenarioSummary;
  state: PublicGameStateSummary;
  choice: PublicChoiceSummary;
  numericOutcome: ResolvedOutcome;
  tone: 'calme' | 'tendu' | 'grave' | 'euphorique' | 'melancolique';
}

export interface NarrativePromptOutput {
  consequence: string;
  innerVoice?: string;
  newspaperHeadline?: string;
  memoryLine?: string;
}
```

Fallback obligatoire :

- si Haiku échoue,
- si quota dépassé,
- si réseau absent,
- si délai > 2 secondes,

alors Paritas utilise les textes écrits à la main.

## Migration Depuis La V1

### Étape 1 — Renommer Les Concepts Internes

Objectif : nettoyer les noms `Rebirth` internes avant V2.

- `RebirthGameState` → `GameStateV2`
- `rebirth` → `gameV2`
- commentaires “Rebirth” → “Paritas”

### Étape 2 — Ajouter Organisation

Créer :

- `src/game/org/types.ts`
- `src/game/org/freshOrganization.ts`
- `src/game/org/orgActions.ts`
- `src/game/org/internalElections.ts`

### Étape 3 — Ajouter Stratégies

Créer :

- `src/game/strategy/types.ts`
- `src/game/strategy/strategyCatalog.ts`
- `src/game/strategy/strategyResolver.ts`
- `src/game/strategy/strategyEffects.ts`

### Étape 4 — Ajouter IA État / Adversaire

Créer :

- `src/game/ai/stateStrategy.ts`
- `src/game/ai/opponentStrategy.ts`
- `src/game/ai/strategySignals.ts`

### Étape 5 — Remplacer Le Routeur

Remplacer :

- `src/game/narrative/scenarioEngine.ts`

Par :

- `src/game/narrative/scenarioRouter.ts`
- `src/game/narrative/pipelineEngine.ts`

### Étape 6 — Ajouter Les Écrans

Créer :

- `src/components/org/OrganizationPanel.svelte`
- `src/components/org/AssetMarket.svelte`
- `src/components/org/InternalElectionScene.svelte`
- `src/components/strategy/StrategyPlanner.svelte`
- `src/components/strategy/ActiveStrategies.svelte`
- `src/components/world/StatePanel.svelte`
- `src/components/world/OpponentPanel.svelte`
- `src/components/narrative/PipelineTimeline.svelte`

### Étape 7 — IA Narrative Optionnelle

Créer :

- `src/game/narrative/narrativeClient.ts`
- `src/game/narrative/manualFallbacks.ts`

Puis backend séparé :

- `api/narrative.ts` ou Worker Cloudflare.

## Priorité De Développement

### Sprint 1 — Organisation Jouable

- Ajouter `PlayerOrganization`.
- Ajouter actions d’organisation débloquées en 1884.
- Ajouter achat/vente d’actifs.
- Ajouter panneau organisation.

### Sprint 2 — Stratégies Tour Par Tour

- Ajouter stratégies actives.
- Ajouter coûts par tour.
- Ajouter résolutions multi-tours.
- Ajouter panneau stratégie.

### Sprint 3 — État Et Adversaire

- Ajouter `StateStrategy`.
- Ajouter `OpponentStrategy`.
- Afficher leurs signaux narratifs.
- Faire varier les scénarios selon leurs choix.

### Sprint 4 — Élections Internes

- Ajouter factions internes.
- Ajouter élections.
- Ajouter crise de mandat.

### Sprint 5 — Pipelines

- Ajouter pipelines actifs.
- Router les scénarios par flags.
- Faire revenir les conséquences à long terme.

### Sprint 6 — Haiku

- Backend serverless.
- Endpoint narratif.
- Fallback manuel.
- Aucune clé dans le frontend.

## Critères De Réussite

La V2 est prête à remplacer la V1 si :

- le joueur comprend ce qu’il construit ;
- chaque grand événement historique modifie l’organisation ;
- les choix passés changent réellement les scénarios futurs ;
- l’État n’est plus un décor mais un acteur stratégique ;
- l’adversaire a une logique lisible ;
- les élections internes peuvent sauver ou casser une trajectoire ;
- acheter/vendre/recruter/former produit de vraies différences ;
- une partie salarié et une partie patronale racontent deux histoires différentes ;
- l’IA narrative est un enrichissement, jamais une dépendance.
