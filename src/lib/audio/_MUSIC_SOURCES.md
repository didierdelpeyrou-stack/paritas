# Musique de Paritas — sources libres de droit

État au 2 mai 2026 : la musique est **entièrement générative** (Tone.js).
Adoucie en mai 2026 (reverb, filtre, brass FM, voix sans dissonance).
Si tu veux remplacer par de la musique réelle, voici les sources et
la méthode.

## Plateformes recommandées (pour Paritas)

| Source | Licence | Fort | Faible |
|---|---|---|---|
| **Free Music Archive** (freemusicarchive.org) | CC variées | Très large catalogue, classique/folk | Filtrer par licence (CC0 / CC-BY) |
| **Pixabay Music** (pixabay.com/music) | Pixabay (gratuit, sans attribution) | Recherche par mood, no-stress | Catalogue moins historique |
| **Incompetech** (incompetech.com) | CC-BY 4.0 (Kevin MacLeod) | Excellents motifs ambient, classique | Attribution obligatoire |
| **MusOpen** (musopen.org) | Domaine public | Enregistrements classiques d'œuvres tombées dans le DP | Format flac/mp3 lourd |
| **Bibliothèque nationale de France — Gallica** | DP | Enregistrements anciens (1900-1955) | Qualité variable |
| **archive.org/details/audio** | DP / CC | Discours historiques, chansons d'époque | Tri à faire |

## Suggestions par ère

### Révolution (1789-1799)

- **Ah ! Ça ira** (1790) — chant révolutionnaire, domaine public.
  Trouvable sur Gallica BNF.
- **La Marseillaise** (1792, Rouget de Lisle) — DP. Version
  instrumentale courte.
- **Carmagnole** (1792) — chant DP.

### XIXe industriel (1800-1900)

- **Le Chant des canuts** (1894, Aristide Bruant) — DP.
- **L'Internationale** (1888, Pottier/Degeyter) — DP en France
  depuis 2017 (Degeyter mort 1932 + 70 ans).
- Berlioz, Symphonie fantastique (1830) — DP.
- Chopin, Préludes (1839) — DP.

### Belle Époque (1900-1914)

- **Le Temps des cerises** (1866 mais popularisé 1900) — DP.
- Debussy, Préludes (1909-1913) — DP.
- Ravel, Pavane pour une infante défunte (1899) — DP.
- Satie, Gymnopédies (1888) — DP.

### Entre-deux-guerres (1919-1939)

- **L'Internationale** version Front Populaire (1936) — Gallica.
- Jazz début XXe — Free Music Archive section « 1920s ».
- Maurice Chevalier (refrains 1930) — vérifier DP (mort 1972 + 70 ans).

### Reconstruction (1944-1947)

- **Le Chant des partisans** (1943, Anna Marly) — DP en France.
- Charles Trenet (popularité d'époque, mais ND récente).

### Trente Glorieuses (1958-1973)

- Music Of France public domain : difficile, beaucoup d'œuvres sous
  copyright actif. Privilégier de l'instrumental Pixabay style yéyé.

### Crise et au-delà (1973+)

- Pixabay « 80s synth », « ambient industrial », « lo-fi ».
- Incompetech catégorie « Modern ».

## Comment intégrer les fichiers audio

Si tu décides de remplacer la musique générative par de vrais
fichiers, voici l'architecture proposée (non encore implémentée) :

### 1. Stockage

Place les fichiers dans `public/audio/eras/` :

```
public/audio/eras/
  revolution.mp3        ← ~30 s, loop-friendly, ~200 KB en 96 kbps
  xixe.mp3
  belle_epoque.mp3
  ...
  present.mp3
```

Convention : MP3 ou OGG, mono ou stéréo, **30-60 s loop-friendly**,
≤300 KB par fichier. Le poids total visé : ~5 MB pour 15 ères.

### 2. Loader

Modifie `audio.ts` pour ajouter un mode hybride :

```ts
async startMusic(eraId?: AudioEraId) {
  const fileUrl = `/audio/eras/${eraId}.mp3`;
  try {
    const res = await fetch(fileUrl, { method: 'HEAD' });
    if (res.ok) {
      // Fichier présent → utiliser Tone.Player en boucle
      const player = new Tone.Player(fileUrl).toDestination();
      player.loop = true;
      await Tone.loaded();
      player.start();
      return;
    }
  } catch { /* tomber sur générative */ }

  // Pas de fichier → générative actuelle
  return this.startGenerative(eraId);
}
```

### 3. Crossfade entre fichiers

Quand l'ère change, charger le nouveau Player puis fade in/out
sur 1.4 s avec deux Tone.Gain en parallèle.

### 4. Précautions

- **Bundle initial** : les MP3 sont en `public/`, pas bundlés. Le
  bundle reste léger. Le téléchargement est lazy (au démarrage de
  la musique).
- **Hors-ligne** : sans connexion, la musique générative reste le
  fallback. Si on veut hors-ligne avec musique réelle, ajouter
  les MP3 à un service worker pour cache.
- **Attribution CC-BY** : si tu utilises Incompetech ou autre CC-BY,
  il faut afficher quelque part le crédit. Proposition : modale
  Settings « Crédits musicaux » qui liste les pistes utilisées.

## Recommandation d'aujourd'hui

Tant que tu n'as pas le temps de chercher / nettoyer / convertir
des fichiers réels, **garde la générative améliorée** (mai 2026).
Le ressenti devrait passer de « horrible » à « ambient discret ».

Si vraiment tu veux du concret pour demain, le **plus rapide** :

1. Pixabay → tag « ambient orchestral » → 5 pistes ~30 s.
2. Les nommer `revolution.mp3`, `belle_epoque.mp3`, etc.
3. Les coller dans `public/audio/eras/`.
4. Activer le loader hybride (~30 lignes à ajouter dans audio.ts).

Délai estimé : 1-2 h de recherche + 30 min de code.
