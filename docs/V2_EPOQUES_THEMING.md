# V2.1 — Theming par époque : fondations + roadmap

**Date** : 2026-05-03
**Brief** : « ne pas changer brutalement toute l'UX. Faire évoluer texture, icônes, polices, couleurs, sons. » Réponse — un méta-niveau de **5 époques** regroupant les 15 ères narratives, chacune avec ses tokens visuels, sans casser la grille canonique.

## Architecture

### Mapping ères → époques

15 ères narratives (granularité du jeu) → 5 époques visuelles (granularité du theming).

| Époque slot | Ères regroupées | Dates | Tonalité |
|---|---|---|---|
| `ancien-regime` | revolution | 1789–1815 | À la lumière des bougies |
| `industrielle` | xixe | 1815–1900 | À la cadence des machines |
| `compromis-social` | belle_epoque, entre_deux_guerres, reconstruction, guerre_froide, trente_glorieuses | 1900–1973 | À la table des négociations |
| `tertiarisation` | crise, mitterrand, cohabitations, sarkozy, hollande | 1973–2017 | Au tournant des écrans |
| `plateformes-ia` | macron_i, macron_ii, present | 2017– | Algorithmes et données |

**Règle de regroupement** : plusieurs ères partagent une époque pour stabiliser les repères visuels. Le joueur traverse ~3 ères dans une époque sans changement de palette — le passage d'époque devient un événement.

### Implémentation

```ts
// src/lib/themes/epoques.ts
export type EpoqueSlot = 'ancien-regime' | 'industrielle'
                       | 'compromis-social' | 'tertiarisation'
                       | 'plateformes-ia';

export function epoqueForEra(era: EraId | null): EpoqueSlot { ... }
```

```svelte
<!-- src/components/cockpit/CockpitShell.svelte -->
<div class="cockpit ambient-{mode} era-{eraId}" data-epoque={epoque}>
```

```css
/* CSS variables exposées par .cockpit, héritées par tous les enfants */
.cockpit[data-epoque='ancien-regime'] {
  --epoque-accent: #C9B26A;
  --epoque-deep: #5A2F1C;
  --epoque-glow: rgba(244, 213, 140, 0.20);
  --epoque-paper: #f4ead0;
  /* ... */
}
```

## Tokens définis (V2.1)

| Token | Rôle |
|---|---|
| `--epoque-accent` | Couleur d'accent principale (titres, surlignements) |
| `--epoque-accent-soft` | Variante désaturée pour fonds |
| `--epoque-deep` | Couleur sombre profonde (boutons, cadres) |
| `--epoque-glow` | Halo translucide (ombres colorées) |
| `--epoque-paper` | Couleur de « papier » (parchemin, dossier, écran) |
| `--epoque-tone` | Phrase d'ambiance (string, pour bandeau optionnel) |

## Palettes par époque (V2.1)

### 1. Ancien Régime (1789–1815)
- Accent : `#C9B26A` (or vieilli)
- Paper : `#f4ead0` (papier vergé crème)
- Deep : `#5A2F1C` (acajou foncé)
- Glow : `rgba(244, 213, 140, 0.20)` — lumière de bougie
- Texture cible : grain papier, encre noire, sceaux de cire

### 2. Industrielle (1815–1900)
- Accent : `#c89b3c` (or industriel)
- Paper : `#ddc890` (affiche typographique)
- Deep : `#2a2520` (charbon)
- Glow : `rgba(217, 130, 28, 0.22)` — halo cheminée
- Texture cible : fonte typo, plans d'usine, journaux ouvriers

### 3. Compromis social (1900–1973)
- Accent : `#c89b3c` (or institutionnel)
- Paper : `#ede4c9` (dossier administratif)
- Deep : `#1E5C8A` (bleu institutionnel)
- Glow : `rgba(30, 92, 138, 0.18)`
- Texture cible : tampons, schémas d'organisation, affiches syndicales

### 4. Tertiarisation (1973–2017)
- Accent : `#5BA3C8` (bleu écran)
- Paper : `#d4e0e8` (tableur, écran)
- Deep : `#1A2F3D` (cathodique)
- Glow : `rgba(91, 163, 200, 0.22)`
- Texture cible : grille tableur, fax, photocopies

### 5. Plateformes & IA (2017–)
- Accent : `#7BCBA1` (vert terminal)
- Paper : `#c8d4d8` (dashboard numérique)
- Deep : `#0F2C3A` (noir bleuté)
- Glow : `rgba(123, 203, 161, 0.20)`
- Texture cible : grille de flux, alertes, neon ambre/vert

## Premières utilisations visibles (V2.1)

1. **Time-strip border-bottom** : `border-bottom: 1px solid var(--epoque-accent)` + `box-shadow var(--epoque-glow)`. Une fine bande qui change de teinte à chaque transition d'époque — signal persistant non intrusif.
2. **Seam Théâtre** : `inset 1px 0 0 0 var(--epoque-glow)` sur les panneaux gauche/droite remplace le doré fixe.

## Roadmap V2.2 (chantiers à venir)

### Textures par époque
- Ancien Régime : SVG papier vergé en background-image
- Industrielle : repeating-linear-gradient pour grille fonte
- Compromis social : motif de tampon administratif
- Tertiarisation : grille tableur subtile
- Plateformes-IA : pattern de flux/données

### Polices par époque
- Ancien Régime / Industrielle : `Cinzel` (Caslon-like, déjà présent)
- Compromis social : `Cinzel` + `Source Serif 4` body
- Tertiarisation : ajouter une police machine à écrire (`Special Elite` ?) pour les titres
- Plateformes-IA : ajouter une police mono terminal (`JetBrains Mono` ?) pour les chiffres

### Icônes par époque
Les `CockpitIcon` actuels sont neutres. Variation possible : trait plus épais/gras en époque ancienne, plus fin en époque moderne, vert terminal en plateformes-IA.

### Sons par époque
Hors scope V2.1 — chantier audio séparé (cf. `audit_audio_2026-05.md`).

## Règles intangibles

1. **La grille canonique ne bouge pas** : Actions← Scène→ Personnalité reste invariante. Seuls les tokens visuels changent.
2. **Transitions douces** : `transition: ... 0.6s ease` sur les variables époque pour que le passage soit perceptible mais pas brutal.
3. **Fallback partout** : `var(--epoque-accent, #C9B26A)` — si l'attribut data-epoque manque, défaut compromis-social.
4. **Pas de surcharge** : on n'utilise pas tous les tokens partout. Choisir 2-3 surfaces stratégiques par époque max.
5. **Mobile (Carnet) intact** : le theming par époque s'applique au cockpit (Théâtre + Atelier). Carnet reste GameShell, hors scope theming.

## Vérification panel

Pour Argus : tester chacune des 5 époques en forçant turn=1 / turn=10 / turn=20 / turn=40 / turn=80 et observer la transition de la time-strip border-bottom + des seams. Vérifier que le contraste reste lisible sur les 5 époques (notamment plateformes-ia avec son fond très bleu sombre).

---

> *« Cinq époques, cinq textures, une grille. »*
