# Journal personnalisé IA — guide setup et usage

> *« Le score chiffré est froid. Le journal de Maire à 80 ans, lui, on s'en souvient. »*
>
> Argus UX-3, 2026-05-08

---

## Pourquoi cette feature

Après 100 tours, l'épilogue actuel délivre :

- un score (`100/100`),
- un texte canon (`Mutilation`, `Capture`, …),
- un trait dominant (`Bâtisseur`, `Pragmatique`, …).

C'est solide pour un **formateur paritaire**, mais **anonyme** pour le stagiaire. Le journal IA personnalise ce moment :

- **~600 mots** rédigés en première personne, dans la voix du trait dominant,
- **2-3 décisions précises** du parcours citées (pas reréécrites),
- **bilan moral** (regrets, fiertés) sans triomphalisme,
- **clôture tournée vers ce qui reste** (héritage, transmission, défaite acceptée).

Ce journal est **téléchargeable en .md** et **partageable** (formation paritaire, LinkedIn, archive personnelle).

---

## Architecture (déjà en place)

```
┌────────────┐    POST /  body kind:'journal'      ┌─────────────────────────┐
│  Browser   │  ────────────────────────────────▶  │  Cloudflare Worker      │
│  (Svelte)  │                                     │  paritas-worker.ts      │
│            │  ◀────  text/plain stream  ────     │   ↓                     │
│            │                                     │  https://api.anthropic   │
└────────────┘                                     │  /v1/messages (haiku)   │
                                                   └─────────────────────────┘
```

Le worker existe déjà pour l'enrichissement narratif **par scène** (formats `[CONSEQUENCE][VOIX][JOURNAL][MEMOIRE]`). UX-3 ajoute un **deuxième mode dispatché par le champ `kind` dans le body** :

| `kind` (body)     | Comportement                                    | Max tokens |
|-------------------|-------------------------------------------------|:----------:|
| `'scene'` ou absent | 4 sections narratives par choix (historique) | 600        |
| `'journal'`       | Journal end-of-game ~600 mots                    | 1200       |

Modèle utilisé : **`claude-haiku-4-5-20251001`** (cohérent avec scene). Coût estimé : **~0.7 centime / journal**.

---

## Setup (5 minutes si tu as déjà déployé le worker)

### 1. Worker Cloudflare

Si tu as déjà déployé le worker pour l'enrichissement par scène :

```bash
cd src/server
wrangler deploy paritas-worker.ts
# ou re-deploy après les modifs UX-3 :
wrangler deploy
```

Si tu pars de zéro :

1. `npm i -g wrangler`
2. `wrangler login`
3. Crée `wrangler.toml` :
   ```toml
   name = "paritas-narrative"
   main = "src/server/paritas-worker.ts"
   compatibility_date = "2024-09-01"
   ```
4. Stocke ta clé Anthropic en secret :
   ```bash
   wrangler secret put ANTHROPIC_API_KEY
   # colle ta clé sk-ant-xxxxx quand demandé
   ```
5. `wrangler deploy` → URL publique en sortie (ex. `https://paritas-narrative.<your-subdomain>.workers.dev`).

### 2. Variable d'environnement front

Dans `.env.production` (ignoré par git) :

```bash
VITE_NARRATIVE_API=https://paritas-narrative.<your-subdomain>.workers.dev/
```

(Ne mets PAS le slash final si ton worker route uniquement `/`. Vérifie en faisant un `curl` POST.)

### 3. Build & déploie le front

```bash
npm run build
# déploie dist/ sur ta plateforme habituelle (Cloudflare Pages, Vercel, Netlify…)
```

### 4. Vérification

1. Joue une partie complète (ou utilise `paritas_active_slot=1` avec une partie déjà finie).
2. Atteins l'acte 4 de l'épilogue.
3. Le bouton **« ✨ Journal personnalisé (IA) »** apparaît au-dessus de « Exporter le journal ».
4. Clic → modale s'ouvre, génération streame en ~5-8s.

Si la modale affiche **« Aucun endpoint IA configuré »**, c'est que `VITE_NARRATIVE_API` n'a pas été pris en compte au build. Re-build après edit du `.env.production`.

---

## Coût estimé

Avec **claude-haiku-4-5** :

- **Input** : ~1500 tokens (system + body avec stats, mandate, log tail) × 1 €/M tokens = **0.0015 €**
- **Output** : ~1200 tokens (journal ~600 mots) × 5 €/M tokens = **0.006 €**
- **Total** : **~0.0075 € / journal**

Pour la beta panel-30 (30 joueurs × 3 parties chacun + replays = ~150 journaux) : **~1.20 € au total**. Marginal.

Si tu passes à **claude-sonnet-4-5** pour plus de finesse littéraire :

- Coût : ~0.024 € / journal × 150 = **3.60 €** total.

Reste très raisonnable. Pour passer à Sonnet, change `model: 'claude-haiku-4-5-20251001'` → `'claude-sonnet-4-5-20250928'` dans `paritas-worker.ts` (la branche `kind === 'journal'` utilise déjà le même modèle que scene — tu peux dispatcher si tu veux différencier).

---

## Comportement attendu

### Journal-type pour Edmond Maire (style Pragmatique)

> *Je relis ces feuilles de cinquante ans avant de les classer. La CFDT que j'ai laissée n'est pas celle que j'ai prise. Je ne le regrette pas — ou si peu. À Auroux je signais un compromis ; à Plan Juppé je laissais filer un mouvement que la base avait raison de porter, peut-être. (...) On me dira que j'ai trahi. Je pèse mes signatures comme un homme pèse ses comptes. Quatre caisses tiennent. Une convention de branche est née. Une cogestion qui aurait pu être paritaire ne l'est qu'à moitié. Un siège supplémentaire à la commission, contre la dignité du langage : qui de nous oserait dire si c'était un bon échange ? (...) Mon successeur fera mieux ou pire. Le cadre tient. C'est tout ce qu'on peut demander à un militant qui n'a pas fait la grève la plus belle.*

### Journal-type pour Léon Jouhaux (style Bâtisseur)

> *Je laisse ce cahier ouvert, sachant que d'autres l'écriront après moi. La Sécurité sociale a tenu cinquante ans, et tiendra cinquante autres si on prend soin des piliers. Matignon n'était pas un compromis : c'était une fondation. (...) Force ouvrière s'est faite contre nous, mais elle se fera avec nous quand l'État pèsera trop. Cinq institutions paritaires, c'est ce que j'ai vu poser. Les murs valent ceux qui les ont scellés. (...) Je m'éteins en sachant que l'édifice tient. C'est tout ce que demande un Bâtisseur — et c'est plus que beaucoup ne l'imaginent.*

(Ces exemples sont indicatifs ; le résultat réel sera différent à chaque génération.)

---

## Privacy & RGPD

- Le journal IA envoie au worker **uniquement** :
  - le nom de personnage (saisi par le joueur, pseudonyme),
  - le camp (salarié/patron),
  - les statistiques agrégées,
  - les 12 dernières entrées du log narratif.
- **Aucune donnée personnelle** (email, IP, fingerprint) n'est transmise.
- Le worker ne **logge rien** par défaut. Si tu actives le `wrangler tail`, vérifie ta politique.
- Ajoute un paragraphe dans tes mentions légales : *« Si vous activez la génération IA en fin de partie, votre nom de personnage et les statistiques agrégées sont transmis à un service Anthropic via un proxy Cloudflare. Aucune donnée d'identification personnelle n'est envoyée. »*

---

## Désactivation / opt-out

- **Par config** : ne définis pas `VITE_NARRATIVE_API` → bouton invisible.
- **Par instance** : pas d'opt-out user-level pour l'instant ; à ajouter dans Settings si demandé par le panel-30.

---

## Évolutions possibles

- **A/B test du modèle** : Haiku vs Sonnet sur 30 journaux, comparer feedback formateur.
- **Multi-langue** : ajouter un prompt english pour stagiaires anglophones, dispatch via `Accept-Language`.
- **Mémoire de partie** : stocker les journaux générés en localStorage par slot, pour comparer les replays.
- **Mode dialogué** : après génération, un mini-chat « Pose une question à ton personnage » pour creuser une décision spécifique (~3 turns de chat, budget +1 centime/partie).

---

## Fichiers concernés

| Fichier | Rôle |
|---|---|
| `src/server/paritas-worker.ts` | Worker Cloudflare, dispatch `kind: scene\|journal` |
| `src/game/narrative/journalAI.ts` | Client front : `streamJournalAI`, `buildJournalInput`, `isJournalAIEnabled` |
| `src/components/feedback/AIJournalModal.svelte` | Modale qui affiche le streaming + boutons copy/download |
| `src/components/feedback/EndingReport.svelte` | Bouton acte 4 + montage conditionnel de la modale |
| `src/vite-env.d.ts` | Type `VITE_NARRATIVE_API` (déjà existant) |
| `docs/UX_AI_JOURNAL.md` | Ce document |
