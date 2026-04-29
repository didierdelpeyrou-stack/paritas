# Paritas — version Svelte 5

> Vingt-cinq siècles de paritarisme, joués en 100 tours, 8 chapitres historiques.
> Hybride **Reigns** (cartes swipe rapides) + **Suzerain** (dialogues multi-tours avec figures historiques nommées).

Refonte complète, en Svelte 5 + TypeScript + Vite + Tailwind v4 + Tone.js, du prototype HTML monolithique précédent.

---

## Lancement rapide

Prérequis : **Node.js 20+** et **pnpm** (ou npm).

```bash
cd paritarisme-svelte
pnpm install     # ou: npm install
pnpm dev         # dev server sur http://localhost:5173
pnpm build       # bundle de production dans /dist
pnpm preview     # tester le bundle de prod
pnpm check       # vérification TypeScript + Svelte
```

Le bundle de production fait environ **80 KB gzippé**, déployable en static (Vercel, Netlify, GitHub Pages, Cloudflare Pages, n'importe quel serveur de fichiers).

---

## Structure

```
paritarisme-svelte/
├── index.html                 # entry HTML
├── package.json               # deps : svelte 5, vite, tailwind v4, tone
├── vite.config.ts             # plugins : svelte + tailwindcss/vite
├── svelte.config.js           # runes activé
├── tsconfig.json              # paths $lib, $components
├── src/
│   ├── main.ts                # bootstrap (mount(App))
│   ├── App.svelte             # routing : intro → boucle de tour → épilogue
│   ├── app.css                # Tailwind + palette parchemin syndical
│   │
│   ├── lib/
│   │   ├── types.ts                       # GameState, Event, Choice, Figure…
│   │   ├── stores/game.svelte.ts          # store global ($state, $derived)
│   │   ├── game/dialectic.ts              # courbes 100 tours, tensions, score
│   │   ├── game/dice.ts                   # rollDice() + jackpot/critique
│   │   ├── audio/audio.ts                 # Tone.js adaptatif (musique + SFX)
│   │   └── data/
│   │       ├── eras.ts                    # 8 chapitres historiques
│   │       ├── profils.ts                 # 8 profils doctrinaux émergents
│   │       ├── figures.ts                 # 14 figures du carnet
│   │       └── events.ts                  # événements (Reigns + Suzerain)
│   │
│   └── components/
│       ├── Card.svelte                    # carte Reigns swipeable (drag horizontal)
│       ├── DialogueScene.svelte           # Suzerain : dialogue + sous-texte
│       ├── Sidebar.svelte                 # avatar, jauges, profil, tensions, rival
│       ├── ObjectiveBar.svelte            # 3 axes du score + chapitre/100
│       ├── Gauge.svelte                   # jauge animée (zones colorées + tweened)
│       ├── Dice3D.svelte                  # dé 3D modal (jackpot / critique)
│       └── Confetti.svelte                # confettis (jackpot, débloquage)
```

---

## Direction artistique

**Palette parchemin syndical moderne** (cohérente avec 25 siècles d'Histoire) :

| Token CSS                   | Hex       | Usage                                      |
|-----------------------------|-----------|--------------------------------------------|
| `--color-ink`               | `#0d1014` | Fond principal, encre                      |
| `--color-surface`           | `#1a1f26` | Panneaux, cartes en mode sombre            |
| `--color-parchment`         | `#ede4c9` | Cartes Reigns (texture parchemin)          |
| `--color-gold`              | `#c89b3c` | Or institutionnel, accent dominant         |
| `--color-syndical`          | `#c0392b` | Camp salarié, mobilisation                 |
| `--color-patronal`          | `#2e5e8a` | Camp employeur, institutions               |
| `--color-legit`             | `#5fb56b` | Légitimité, zones optimales                |
| `--color-purple`            | `#d18ab0` | Tensions dialectiques, dilemmes            |
| `--color-burnt`             | `#e07a3a` | Alertes, jackpots                          |

**Typographie** : Cinzel (titres, époque romaine), Source Serif 4 (corps), Inter (UI) — chargées via Google Fonts.

---

## Game design — modèle dialectique

Le score final n'est **pas** une somme. Il dépend de l'**équilibre** entre 3 axes :

```
Puissance   = (caisse + influence + mobilisation) / 3   × 25%
Légitimité  = (soutien + prestige + cap.social + cap.symbolique) / 4   × 30%
Durabilité  = (santé + expertise + cap.institutionnel) / 3   × 30%
Conflictualité = (mobilisation + cap.militant) / 2   × 15%

Pénalité de désalignement : 0.25 × |P-L| + 0.20 × |P-D| + 0.20 × |L-D|
Pénalité humaine : si santé < 35 → -0.8 × (35 - santé)
```

**Trois couches de stats** (modèle hybride à la Bourdieu) :

- **Ressources** : court terme (caisse, soutien, influence, prestige, santé)
- **Compétences** : capacité d'action (négociation, politique, baratin, production, mobilisation, expertise)
- **Capitaux** : structures longues (économique, social, militant, institutionnel, symbolique)

**Tensions dialectiques** (effets de seuil) :

- Caisse > 75 → soupçon de notabilisation, soutien -2
- Influence > 80 → capture institutionnelle, soutien -2, mobilisation -3
- Soutien > 80 + dernier choix "signe" → base exigeante, soutien -4
- Expertise > 80 → technocratisation, baratin/soutien -1
- Santé < 30 → épuisement, mobilisation -3
- ...

Voir `src/lib/game/dialectic.ts` pour la liste complète et les courbes cibles.

---

## Format des événements

Chaque événement (`src/lib/data/events.ts`) a un `format` :

- **`reigns`** : carte rapide, swipe gauche/droite (2 choix dominants) ou tap (3-4 choix). Boucle 30 secondes. Idéal mobile.
- **`suzerain`** : dialogue multi-tours avec PNJ portraituré (Boileau, Jouhaux, Berger…), sous-texte révélable, choix branchés. Pour les moments majeurs (Matignon, Grenelle, Retraites 2023, Canuts).
- **`dilemma`** : pleine page avec matrice de payoffs (mode Expert, théorie des jeux).
- **`recap`** : transition d'époque + quiz pédagogique (à venir).

Ratio cible : ~70% reigns, ~25% suzerain, ~5% dilemma.

---

## Plan de migration depuis le HTML monolithique

État actuel : **squelette fonctionnel jouable** avec 6 événements de démo (Antiquité, Moyen Âge, Révolution, Canuts, Matignon, Retraites 2023) + 2 événements génériques.

Reste à migrer depuis `paritarisme.html` :
- [ ] **Données** : importer les 25+ événements restants
- [ ] **Équipe à 6 rôles** + synergies
- [ ] **Quêtes secondaires** (8 actives)
- [ ] **Easter eggs** (6 cachés)
- [ ] **Mode Expert** : dilemme du prisonnier complet
- [ ] **Tables de négociation paritaire** (mini-jeu dédié)
- [ ] **Onboarding tutoriel premier choix**
- [ ] **Persistance étendue** (Dexie/IndexedDB pour les replays)
- [ ] **Illustrations SVG custom** (style Atelier populaire 1968)
- [ ] **Ink scripts** pour les arbres narratifs longs (optionnel)

---

## Conventions de code

- **Svelte 5 runes** : `$state()`, `$derived()`, `$effect()`, `$props()`. Le store global `game` (instance d'une classe avec champs runes) est la source de vérité.
- **TypeScript strict** : tous les events/figures/profils typés via `lib/types.ts`.
- **Tailwind v4** : palette via `@theme {}` dans `app.css`. Pas de `tailwind.config` séparé.
- **Animations** : utiliser les transitions natives Svelte (`fade`, `fly`, `scale`) et les motions (`tweened`, `spring`) plutôt que d'ajouter une lib externe.
- **Audio** : appeler `audio.click()`, `audio.success()`, `audio.fanfare()`, `audio.dice()` ; la musique se déclenche via `audio.startMusic(eraId)` au changement d'époque.

---

## Idées de polish à ajouter

- [ ] **Mode portrait mobile** avec swipe vertical sur les choix (Reigns natif)
- [ ] **Cinématique de transition d'époque** plein écran avec citation
- [ ] **Voice-over** des PNJ majeurs (TTS ou enregistrements brefs)
- [ ] **Replay** : timeline visualisable des décisions
- [ ] **Mode "duel"** : deux joueurs, deux camps, asymétrique
- [ ] **Editor d'événements** pour contributeurs externes (les .ts → JSON)
- [ ] **i18n** (anglais, espagnol)

---

## Crédits & sources

Mêmes sources que la version HTML — *Le Crom, Hatzfeld, Chatriot, Mériaux & Jobert, Castel, Friot…* — bibliographie complète à venir dans `src/lib/data/sources.ts`.

---

## Licence

Code MIT. Données historiques : sources publiques citées en encart dans le jeu.
