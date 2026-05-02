# Boucle d'apprentissage Paritas

Décidée le 2 mai 2026. Architecture **B + C + D** des choix utilisateur :

> B — Haiku génère du contenu nouveau en s'appuyant sur les patterns
> C — Le joueur apprend sa propre trajectoire
> D — Le jeu se réécrit lui-même : Haiku adapte les scénarios au profil

## Trois flux

### 1. Apprentissage du joueur (offline, déjà en place)

Le joueur apprend sa propre trajectoire via :

- `PersonalityPanel` : 6 traits visibles, sceau dominant, antagoniste
  rouge, niveaux symboliques (« Cherche encore » → « Doctrine forgée »)
- `MyLegacyPanel` : institutions construites, sceaux dorés
- `EraTimeline` (frise vivante) : sceaux à leur position chronologique
- `StrategicRadar` : comparaison avec figures historiques (Jouhaux,
  Croizat, Maire), affinité 0-100%
- `personalityStress` : tension intérieure CK3-like, monte quand le
  joueur agit contre son trait dominant
- Légendaire incarné : commentaires en marge de la conséquence
  (« Jouhaux hocherait la tête » / « Jouhaux t'aurait désavoué »)

### 2. Apprentissage du jeu (côté joueur, offline)

Stocké dans `localStorage`, **aucun serveur**, aucune télémétrie réseau.

| Clé | Valeur | Rôle |
|---|---|---|
| `paritas_played_count` | nombre | Bascule du tutoriel en mode express |
| `paritas_recent_defeats` | nombre | Modération de difficulté |
| `paritas_anon_id` | hash 16 hex | ID stable pour télémétrie future, sans PII |
| `paritas_text_mode` | `falc` / `litteraire` | Style demandé à Haiku |
| `paritas_gloss_seen` | { term: turn } | Espacement de re-exposition (Ebbinghaus) |

Le profil compact `PlayerProfile` (cf. `playerProfile.ts`) résume tout
ça pour le worker Haiku. Il **n'est PAS envoyé** si le joueur n'a pas
activé l'enrichissement (`isNarrativeEnrichmentEnabled` false).

### 3. Apprentissage de Haiku (online, opt-in, B + D)

Quand le joueur a activé l'enrichissement :

```
Front (NarrativePromptInput)
  ├── scenario : id, title, era, date
  ├── state : camp, turn, dominantTrait, organization
  ├── choice : text + intent
  ├── numericOutcome : effets numériques calculés côté front (déterministes)
  ├── tone : SceneMood
  ├── mode : 'falc' | 'litteraire'  ← NOUVEAU (mai 2026)
  └── player : PlayerProfile         ← NOUVEAU (mai 2026)
       ├── partiesPlayed
       ├── personalityStress
       ├── recentDifficulty : 'easy' | 'normal' | 'hard'
       └── anonId
        │
        ▼
Worker Cloudflare (paritas-narrative.didier-delpeyrou.workers.dev)
        │
        ├── reçoit le payload
        ├── lit `mode` et `player`
        ├── construit prompt système (FALC ou Littéraire)
        ├── injecte une consigne d'adoucissement si recentDifficulty === 'easy'
        ├── envoie à Anthropic Messages API en streaming
        └── forward le SSE en text/plain au front
        │
        ▼
Front (streamNarrativeEnrichment + applyNarrativeEnrichment)
        ├── parse [CONSEQUENCE] / [VOIX] / [JOURNAL] / [MEMOIRE]
        ├── met à jour ConsequenceRender en live
        └── fallback applyNarrativeFallback si timeout/erreur
```

**Code source du worker** : `src/server/paritas-worker.ts` (exclu du
bundle front via tsconfig). Mai 2026 : reprompt FALC + injection du
profil joueur. À redéployer via `wrangler deploy`.

## Sécurité et confidentialité

- Aucune donnée personnelle transmise. Pas de nom de joueur, pas
  d'email, pas d'IP nominative.
- `anonId` est un hash 16 hex stable mais non réversible (pas un nom).
- Le profil contient `partiesPlayed` (entier) et `personalityStress`
  (0-100). Aucune information individuelle réversible.
- Hors-ligne par défaut : si `VITE_NARRATIVE_API` n'est pas configurée,
  rien n'est envoyé. Le contenu écrit FALC suffit.

## Modération de difficulté (D, partiellement)

Si `recentDifficulty === 'easy'` (3+ défaites consécutives `mutilation`
ou `capture`) :

- Le worker Haiku injecte une note d'adoucissement dans la prompt :
  *« Adoucis légèrement le ton, donne-lui une perspective d'espoir
  crédible historiquement. »*
- Côté front (à venir) : le `scenarioEngine` peut prioriser des
  scénarios avec un `mood` plus calme.

## Ce qui n'est pas encore fait

- **Génération de scénarios entiers nouveaux par Haiku (B)** : le
  worker ne fait actuellement qu'enrichir un scénario écrit. Pour
  générer un scénario nouveau, il faudrait un endpoint séparé
  `POST /generate-scenario` qui prend `{ era, mood, profile }` et
  renvoie un Scenario complet validé.
- **Adaptation des scénarios écrits au profil (D, complet)** : les
  scénarios sont actuellement servis tels quels. Une réécriture
  dynamique en FALC à la volée selon `mode` demande un endpoint
  `POST /rewrite-scene` distinct.

Ces deux extensions sont possibles avec le worker actuel modifié,
mais hors du périmètre de mai 2026.
