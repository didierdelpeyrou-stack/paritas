# Musique de Paritas — liste complète avec liens de téléchargement

État au 2 mai 2026 : la musique est **entièrement générative** (Tone.js).
Adoucie en mai 2026 (reverb, filtre, brass FM, voix sans dissonance).
Loader hybride en place : si un fichier existe dans
`public/audio/eras/{eraId}.mp3`, il prend le relais automatiquement.

**Contrat technique** :
- Format : MP3 ou OGG, mono ou stéréo
- Durée : **30-60 s loop-friendly** (s'enchaîne sans coupure visible)
- Poids cible : **≤ 300 KB** par fichier (96 kbps suffit pour de l'ambient)
- Nommage : `revolution.mp3`, `xixe.mp3`, etc. — voir tableau ci-dessous
- Volume : ne pas normaliser à -1 dB (la chaîne audio applique sa
  propre courbe). -14 LUFS est idéal.

---

## Vérification systématique avant de poser un fichier

1. La licence couvre-t-elle un usage en jeu vidéo gratuit en ligne ?
2. Si CC-BY : tu dois afficher l'attribution dans Settings → Crédits.
3. Convertir au besoin via [`ffmpeg`](https://ffmpeg.org) :
   ```
   ffmpeg -i source.flac -ar 44100 -ac 2 -b:a 96k -af "loudnorm=I=-14" out.mp3
   ```

---

## Tableau complet des 15 ères

### 1. `revolution.mp3` — Révolution (1789-1799)

| Œuvre | Compositeur | Licence | Lien |
|---|---|---|---|
| **La Marseillaise** (instrumental) | Rouget de Lisle, 1792 | DP | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:La_Marseillaise.ogg) |
| **Ah ! Ça ira** | Anonyme, 1790 | DP | [Wikimedia](https://commons.wikimedia.org/wiki/Category:Ça_ira) (chercher fichier audio) |
| **La Carmagnole** | Anonyme, 1792 | DP | [Wikimedia](https://commons.wikimedia.org/wiki/File:La_Carmagnole.ogg) |
| Backup ambient | Pixabay « revolution period » | Pixabay (libre) | [search](https://pixabay.com/music/search/revolution%20period/) |

### 2. `xixe.mp3` — XIXe industriel (1800-1900)

| Œuvre | Compositeur | Licence | Lien |
|---|---|---|---|
| **Le Chant des canuts** | Bruant, 1894 | DP | [Wikimedia search](https://commons.wikimedia.org/w/index.php?search=chant+des+canuts) |
| **Symphonie fantastique** (mvt I, extrait) | Berlioz, 1830 | DP | [MusOpen](https://musopen.org/music/4023-symphonie-fantastique-op-14/) |
| **Préludes op. 28** (n°4) | Chopin, 1839 | DP | [MusOpen](https://musopen.org/music/103-24-preludes-op-28/) |
| Backup industriel | Pixabay « steam factory » | Pixabay | [search](https://pixabay.com/music/search/steam%20factory/) |

### 3. `belle_epoque.mp3` — Belle Époque (1900-1914)

| Œuvre | Compositeur | Licence | Lien |
|---|---|---|---|
| **Gymnopédie n°1** | Satie, 1888 | DP | [MusOpen](https://musopen.org/music/3856-3-gymnopedies/) |
| **Pavane pour une infante défunte** | Ravel, 1899 | DP | [MusOpen](https://musopen.org/music/3019-pavane-pour-une-infante-defunte/) |
| **Préludes Livre I** (extraits) | Debussy, 1909-1910 | DP | [MusOpen](https://musopen.org/music/2155-preludes-livre-i/) |
| **Le Temps des cerises** | Renard/Clément, 1866 | DP | [Wikimedia search](https://commons.wikimedia.org/w/index.php?search=temps+des+cerises) |

### 4. `entre_deux_guerres.mp3` — Entre-deux-guerres (1919-1939)

| Œuvre | Compositeur | Licence | Lien |
|---|---|---|---|
| **Boléro** (extrait court) | Ravel, 1928 | DP en France 2018+ | [MusOpen](https://musopen.org/music/2547-bolero-orchestral/) |
| **L'Internationale** (orchestrale) | Pottier/Degeyter, 1888 | DP en France 2003+ | [Wikimedia](https://commons.wikimedia.org/wiki/File:Internationale-fr.ogg) |
| Jazz années 1920 (instrumental) | Various | DP US (1928 et avant) | [archive.org 78rpm](https://archive.org/details/78rpm) — filtrer par décennie |
| Backup ambient | Pixabay « 1930s ambient » | Pixabay | [search](https://pixabay.com/music/search/1930s/) |

### 5. `reconstruction.mp3` — Reconstruction (1944-1947)

| Œuvre | Compositeur | Licence | Lien |
|---|---|---|---|
| **Le Chant des partisans** (instrumental) | Marly, 1943 | DP en France | [Wikimedia search](https://commons.wikimedia.org/w/index.php?search=chant+des+partisans) |
| Marches de la Libération (DP) | Various 1944-45 | DP | [Gallica BNF](https://gallica.bnf.fr/services/engine/search/sru?operation=searchRetrieve&query=%28dc.subject%20all%20%22Libération%20de%20la%20France%22%29%20and%20dc.type%20all%20%22sonore%22) |
| Backup orchestral années 40 | Pixabay « 1940s orchestral » | Pixabay | [search](https://pixabay.com/music/search/1940s/) |

### 6. `guerre_froide.mp3` — Guerre froide (1947-1958)

| Œuvre | Compositeur | Licence | Lien |
|---|---|---|---|
| Crooner instrumental années 50 | Various DP US | DP | [archive.org 78rpm 1950s](https://archive.org/search?query=date%3A%5B1948-01-01+TO+1958-12-31%5D+collection%3A78rpm) |
| Variété française d'après-guerre | Domaine public à vérifier | DP/CC | [Gallica](https://gallica.bnf.fr/) (recherche audio 1947-1958) |
| Backup tension froide | Pixabay « tense cold war » | Pixabay | [search](https://pixabay.com/music/search/cold%20war/) |

### 7. `trente_glorieuses.mp3` — Trente Glorieuses (1958-1973)

| Œuvre | Source | Licence | Lien |
|---|---|---|---|
| Backup yéyé instrumental | Pixabay « 60s pop » | Pixabay | [search](https://pixabay.com/music/search/60s/) |
| Backup happy retro | Pixabay « happy retro » | Pixabay | [search](https://pixabay.com/music/search/happy%20retro/) |
| Free Music Archive « Sixties » | FMA divers | CC | [browse](https://freemusicarchive.org/genre/Surf/) |

*La plupart de la variété française des Trente Glorieuses est encore
sous copyright. Privilégier de l'instrumental Pixabay/FMA en style
yéyé/twist/folk.*

### 8. `crise.mp3` — Crise pétrolière (1973-1981)

| Œuvre | Source | Licence | Lien |
|---|---|---|---|
| Backup synthwave sombre | Pixabay « dark synthwave » | Pixabay | [search](https://pixabay.com/music/search/dark%20synth/) |
| Ambient industriel années 70 | Pixabay « industrial 70s » | Pixabay | [search](https://pixabay.com/music/search/industrial%2070s/) |
| Incompetech « Industrial » | Kevin MacLeod | CC-BY | [browse](https://incompetech.com/music/royalty-free/index.html?keywords=industrial) |

### 9. `mitterrand.mp3` — Mitterrand (1981-1995)

| Œuvre | Source | Licence | Lien |
|---|---|---|---|
| Backup new wave instrumental | Pixabay « new wave » | Pixabay | [search](https://pixabay.com/music/search/new%20wave/) |
| Backup synthpop années 80 | Pixabay « 80s synthpop » | Pixabay | [search](https://pixabay.com/music/search/80s%20synthpop/) |
| Incompetech « 80s » | Kevin MacLeod | CC-BY | [browse](https://incompetech.com/music/royalty-free/index.html?keywords=80s) |

### 10. `cohabitations.mp3` — Cohabitations (1995-2007)

| Œuvre | Source | Licence | Lien |
|---|---|---|---|
| Backup downtempo / trip-hop | Pixabay « downtempo » | Pixabay | [search](https://pixabay.com/music/search/downtempo/) |
| Backup ambient 90s | Pixabay « 90s ambient » | Pixabay | [search](https://pixabay.com/music/search/90s%20ambient/) |
| FMA Electronic | Various | CC | [browse](https://freemusicarchive.org/genre/Electronic/) |

### 11. `sarkozy.mp3` — Sarkozy (2007-2012)

| Œuvre | Source | Licence | Lien |
|---|---|---|---|
| Backup indie pop instrumental | Pixabay « indie pop » | Pixabay | [search](https://pixabay.com/music/search/indie%20pop/) |
| Backup électro tendue | Pixabay « tense electronic » | Pixabay | [search](https://pixabay.com/music/search/tense%20electronic/) |

### 12. `hollande.mp3` — Hollande (2012-2017)

| Œuvre | Source | Licence | Lien |
|---|---|---|---|
| Backup ambient contemporain | Pixabay « ambient contemporary » | Pixabay | [search](https://pixabay.com/music/search/ambient%20contemporary/) |
| Backup hip-hop instrumental | Pixabay « hip hop instrumental » | Pixabay | [search](https://pixabay.com/music/search/hip%20hop%20instrumental/) |

### 13. `macron_i.mp3` — Macron I (2017-2022)

| Œuvre | Source | Licence | Lien |
|---|---|---|---|
| Backup électro minimaliste | Pixabay « minimal electronic » | Pixabay | [search](https://pixabay.com/music/search/minimal%20electronic/) |
| Backup tension moderne | Pixabay « modern tension » | Pixabay | [search](https://pixabay.com/music/search/modern%20tension/) |

### 14. `macron_ii.mp3` — Macron II (2022-2026)

| Œuvre | Source | Licence | Lien |
|---|---|---|---|
| Backup sombre minimal | Pixabay « dark minimal » | Pixabay | [search](https://pixabay.com/music/search/dark%20minimal/) |
| Backup tension politique | Pixabay « political » | Pixabay | [search](https://pixabay.com/music/search/political/) |

### 15. `present.mp3` — Présent (2026 →)

| Œuvre | Source | Licence | Lien |
|---|---|---|---|
| Backup futuriste sobre | Pixabay « futuristic ambient » | Pixabay | [search](https://pixabay.com/music/search/futuristic/) |
| Backup IA cinematic | Pixabay « ai cinematic » | Pixabay | [search](https://pixabay.com/music/search/ai%20cinematic/) |

---

## Procédure de pose

### Option A — Pixabay (le plus rapide, 1 h pour tout)

1. Va sur [Pixabay Music](https://pixabay.com/music/).
2. Pour chaque ère, suis le lien de recherche ci-dessus.
3. Filtre **Durée : 30 s à 1 min** (sidebar gauche).
4. Écoute, choisis 1 piste qui te plaît.
5. Bouton « Télécharger » (gratuit, pas de compte).
6. Renomme en `{eraId}.mp3` selon le tableau.
7. Place dans `public/audio/eras/`.

**Pas d'attribution requise** sur Pixabay (depuis 2019). Mais
recommandé si tu veux soutenir l'artiste.

### Option B — Wikimedia Commons + IMSLP (DP authentique)

Pour les ères 1-5 (1789-1947), privilégie le domaine public :

1. Va sur le lien Wikimedia/MusOpen indiqué.
2. Télécharge le fichier (souvent .ogg ou .flac).
3. Convertis en MP3 court loop-friendly :
   ```bash
   # extrait 40 s en boucle propre
   ffmpeg -i source.ogg -ss 0:30 -t 40 -ar 44100 -b:a 96k \
     -af "loudnorm=I=-14:LRA=7,afade=t=in:st=0:d=2,afade=t=out:st=38:d=2" \
     revolution.mp3
   ```
4. Place dans `public/audio/eras/`.

### Option C — Mix DP + Pixabay

Le plus crédible historiquement :

- Ères 1-5 (1789-1947) : **DP authentique** (Wikimedia, MusOpen, Gallica)
- Ères 6-10 (1947-2007) : **Pixabay** style approprié
- Ères 11-15 (2007+) : **Pixabay** moderne

---

## Crédits à afficher (si CC-BY)

Si tu utilises Incompetech ou des pistes CC-BY de FMA, ajoute dans
Settings → nouvelle section « Crédits » :

```
Musique :
- « Titre de la piste » par Kevin MacLeod (incompetech.com)
  Licence : Creative Commons Attribution 4.0
  https://creativecommons.org/licenses/by/4.0/
```

Pixabay et Wikimedia Commons en domaine public n'exigent pas
d'attribution.

---

## Test après pose

1. `npm run dev` (ou recharge la prod déployée).
2. Démarre une partie.
3. Active **♫** dans la sidebar.
4. Écoute. Tu dois entendre ton fichier MP3 au lieu de la générative.
5. Avance jusqu'au tour 4 (passage `revolution` → `xixe`) — crossfade
   1.4 s entre les deux fichiers attendu.

Si tu n'entends pas le fichier mais la générative continue : vérifie
que le fichier est bien dans `public/audio/eras/`, accessible via
l'URL `https://didierdelpeyrou-stack.github.io/paritas/audio/eras/{era}.mp3`.

---

## Recommandation perso (si je devais choisir)

Pour démarrer **vite et bien**, sans m'embêter avec ffmpeg :

1. **Pixabay** pour les 15 ères, recherche par mood + durée.
2. 30-60 s par piste, total ~5 MB pour les 15.
3. Tag mental :
   - 1-5 : « orchestral / classical »
   - 6-10 : « ambient / film score »
   - 11-15 : « modern minimal / electronic »
4. Pose, teste, ajuste 2-3 fichiers qui ne plaisent pas.

Délai estimé : **1 h 30** pour tout faire, écouter, télécharger,
renommer, déployer.
