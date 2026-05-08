# Télémétrie UX — Microsoft Clarity

> *« Tu ne peux pas améliorer ce que tu ne mesures pas. »*
>
> *Argus, sprint UX 2026-05-08*

---

## Pourquoi Clarity et pas autre chose

| Outil | Coût | Heatmaps | Session replay | Limite |
|---|---|:---:|:---:|---|
| **Microsoft Clarity** | **0 €** | ✅ illimité | ✅ illimité | Aucune (tracker microsoft.com) |
| Hotjar | 39-440 €/mois | ✅ | ✅ | 35 sessions/mois en gratuit |
| FullStory | sur devis | ✅ | ✅ | Pricing entreprise |
| LogRocket | 99 €/mois+ | ✅ | ✅ | 1000 sessions / mois |

**Clarity** = produit Microsoft, gratuit illimité, RGPD-friendly (pas de fingerprinting agressif), s'installe en 1 snippet. C'est le bon outil pour un projet bêta-stade comme Paritas.

---

## Installation — 5 minutes

### 1. Créer un projet Clarity

1. https://clarity.microsoft.com → connexion (compte Microsoft, GitHub ou Google)
2. *Add new project* → nom : « Paritas », URL de production
3. Copie le **Project ID** (10 caractères alphanumériques, ex. `n8h2k3xy91`)

### 2. Configurer la variable d'environnement

Crée (ou édite) `.env.production` à la racine du repo :

```bash
VITE_CLARITY_ID=n8h2k3xy91
```

⚠️ Ne mets PAS le Project ID dans `.env` (qui est trackée par git). Utilise `.env.production` (déjà ignoré dans `.gitignore`) ou les variables d'environnement de ton CI / Cloudflare Pages / Vercel.

### 3. Vérifier l'intégration

```bash
npm run build && npm run preview
# Puis ouvre http://localhost:4173 et regarde le DOM :
# tu dois voir <script src="https://www.clarity.ms/tag/n8h2k3xy91"></script>
# injecté dynamiquement.
```

En **dev local** (`npm run dev`), Clarity n'est PAS chargé (vérifié par `import.meta.env.PROD`).

### 4. Vérifier la collecte

1. Ouvre ton app de prod 30 secondes (clic, scroll, navigation entre 2 écrans).
2. Va sur https://clarity.microsoft.com → ton projet → onglet **Live**.
3. Tu dois voir une session en cours dans les ~30 secondes (latence ~5 min en mode standard).

---

## Que regarder en priorité

### Heatmaps (carte de chaleur)

Indispensables sur :

- **`/`** (StartScreen) : où cliquent les joueurs ? Le bouton « Plutôt créer un personnage de zéro » est-il vu ?
- **`/?slot=1`** (CockpitShell turn 1-3) : les joueurs survolent-ils le portrait mentor ? Cliquent-ils sur le « ? » du score ?
- **Épilogue** : combien skipent les actes ? Quel ratio « Exporter le journal » / « Rejouer » ?

### Session recordings

Filtre les sessions **dead clicks** (clic sans réaction) → bug UX caché.
Filtre les sessions **rage clicks** (3+ clics rapides au même endroit) → frustration.

### Insights

Clarity calcule auto :

- **Smart events** : « clic sur Ratifier » par exemple
- **Funnel analysis** : créer un funnel `/` → choix slot → choix camp → entrer → tour 5 → tour 50 → épilogue
- **Drop-off** : à quel tour les joueurs ferment l'onglet ?

---

## Privacy & RGPD

Clarity respecte le RGPD si tu :

1. **Mentionnes Clarity** dans ta politique de confidentialité (extrait modèle dans `docs/PRIVACY_TEMPLATE.md` à créer si besoin).
2. **Masques les inputs sensibles** : Clarity masque par défaut les inputs `password` et `email`. Pour Paritas, l'input « Nom du protagoniste » est non-sensible (c'est le nom de personnage, pas l'identité du joueur), mais si tu veux jouer la sécurité :
   ```html
   <input type="text" data-clarity-mask="true" placeholder="ex. Marguerite, Léon…" />
   ```
3. **Ajoutes un opt-out cookie banner** si tu veux du zèle. Clarity sans consentement explicite est **toléré dans la plupart des juridictions UE** car les données sont **agrégées et anonymisées** côté Microsoft (similaire à GA en mode IP-anonymized).

Pour un projet bêta panel-30 où les joueurs sont des stagiaires en formation paritaire, **un simple paragraphe dans les Réglages** suffit :

```
Paritas utilise Microsoft Clarity (heatmaps anonymes) en production
pour améliorer l'ergonomie du jeu. Aucune donnée d'identification
n'est collectée. Tu peux désactiver le tracker en bloquant 
www.clarity.ms dans tes extensions navigateur.
```

---

## Désactivation locale

Si tu veux tester ta prod sans alimenter Clarity de tes propres clics :

```javascript
// Dans la console du navigateur :
localStorage.setItem('paritas_clarity_optout', '1');
location.reload();
```

(Le check est déjà câblé dans `index.html`.)

---

## Coût estimé

**0 €/mois indéfiniment.** Clarity est financé par Microsoft via un programme de collecte d'apprentissage UX agrégé. Pas de tier payant, pas de surprise.

---

## Évolution future

Quand le panel-30 aura généré assez de sessions (semaine 2-3), regarde **PostHog** ou **Mixpanel** pour des analytics produits avancés (funnels custom, A/B test). Ces outils sont complémentaires à Clarity (heatmaps) et coûtent ~0 € jusqu'à 1 M événements/mois en gratuit.

Mais **commence par Clarity**. Un graphe vaut mille hypothèses.
