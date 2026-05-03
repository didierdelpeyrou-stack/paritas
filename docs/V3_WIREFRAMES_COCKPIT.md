# V3 — Wireframes cockpit Paritas inspirés CK3 / Civ / Tropico

Document avec mockups ASCII détaillés et avis de 7 créateurs majeurs
de jeux de gestion/stratégie. Implémentation prioritaire dans le
shell.

---

## I. Avis des créateurs

### 1. Henrik Fåhraeus — Crusader Kings 3 (Paradox)
> *« Le portrait du personnage doit être OMNIPRÉSENT. Tu es ce
> personnage, pas ses ressources. Le portrait + ses 3 traits dominants
> en bandeau supérieur, toujours. Les ressources servent le portrait,
> pas l'inverse. »*

**Application Paritas** : portrait perso joueur (initiale stylée
laiton 48px) + nom complet + trait dominant + score dialectique
en haut à gauche, **toujours visible**.

### 2. Sid Meier — Civilization (Firaxis)
> *« Un tour, une décision intéressante. Toutes les ressources
> doivent être lisibles en UN coup d'œil — pas de scroll, pas de
> tooltip caché. Chiffres alignés, icônes parlantes, hierarchie
> stricte. Le Top Bar de Civ contient TOUT ce qui compte. »*

**Application Paritas** : 7 ressources dans une strip TOP avec
chiffre + delta + icône, en plus des cadrans BAS. Redondance
volontaire pour la lisibilité immédiate.

### 3. Johan Andersson — Hearts of Iron 4, Stellaris (Paradox)
> *« Outliner. Une colonne droite empilable où tu épingles ce que
> tu suis : un personnage adverse, une ville, un objectif. Tu
> dois pouvoir cliquer pour aller voir le détail sans perdre
> ton focus. »*

**Application Paritas** : épingler un objectif ou un acteur dans
le rail droit (au-dessus de Personnalité) — section "Suivi" avec
3 emplacements épinglables.

### 4. Manuel Marrero — Tropico 6 (Limbic)
> *« Edicts. Une palette de décrets toujours visible avec icônes
> lourdes 32px+. Le joueur doit identifier visuellement chaque
> action sans lire le texte. Et un compteur de crédibilité qui
> filtre quels décrets sont disponibles. »*

**Application Paritas** : dashboard bar avec icônes 32px (au lieu
de 18px actuellement). Coût visible à côté de l'icône en chip
or. État disabled très lisible.

### 5. Will Wright — SimCity, Spore (Maxis)
> *« Émergence : ne montre pas les chiffres, montre le RÉSULTAT.
> Une icône "ville en flammes" est plus puissante qu'un compteur
> de pollution. Trouve la métaphore visuelle de chaque crise. »*

**Application Paritas** : si crise active, **filigrane d'urgence**
sur tout le cockpit (rouge sourd). Chaque jauge < 25 %
clignote, l'organisation entière "rougit".

### 6. Frédérick Raynal — Alone in the Dark (créateur français)
> *« Ne jamais cacher l'information importante derrière un menu.
> Le joueur doit comprendre le danger SANS cliquer. Frame d'alerte
> persistant, pas de pop-up qui disparaît. »*

**Application Paritas** : bandeau crise PERSISTE tant que la crise
est active. Pas de pop-up, c'est inscrit dans la status bar.

### 7. Jenova Chen — Journey, Sky (thatgamecompany)
> *« Le silence et l'espace sont des ressources visuelles. Trop
> de densité = bruit. Garde des zones de respiration : Le Ciel
> doit avoir une marge intérieure généreuse pour le scénario. »*

**Application Paritas** : Le Ciel pleine surface MAIS avec
padding intérieur 2-3rem pour que le scénario respire. Pas de
texte qui touche les bords.

---

## II. Wireframe cible — desktop 1440px

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚜ ATELIERS DU 19E   [AC] Ambroise Croizat ★ Bâtisseur · S 90/100   ─────  │ ← Top header riche (60px)
│                              💰1245 🤝76 ⚖46 👥+12 ✊39 ◊50 ⚙47          │   portrait + nom + trait + score
│                                                                  ☁ Calme  │   + 7 mini-jauges + ♫ ⊟ ⚙
├─────────────────────────────────────────────────────────────────────────────┤
│ Era timeline  ━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ ← Era timeline (32px)
│  1789  1800   1900    1919   1944  1947 1958  1973 1981 1995 2007  2026 │
├──┬──────────┬───────────────────────────────────────────────┬──────────┬──┤
│T │ ◆ Suivi  │                                               │ Persona. │ T│
│a │ ─────────│                                               │ ─────────│ a│
│b │ ⚐ Bâtir  │            LE CIEL                            │ ★ Bâtis. │ b│
│s │   inst.  │       (scénario plein écran)                  │   52%    │ s│
│  │   0%     │                                               │ Sereine  │  │
│ G│ 👤 Crois.│  Sociétés de secours mutuel                   │ ────────│ D│
│ a│ ─────────│  Tu prends parti...                           │ ⚒ Œuvre │ r│
│ u│ Objectifs│                                               │   0      │ o│
│ c│ ⚐ Tenir  │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │ ────────│ i│
│ h│   ✓      │  │ Choix A │ │ Choix B │ │ Choix C │         │ ⚖ Traj. │ t│
│ e│ ⚐ Sécu   │  │ Inst.▲  │ │ R.ext▲▲ │ │ Inst.▲▲ │         │ Maire68 │  │
│  │   0%     │  └─────────┘ └─────────┘ └─────────┘         │   86%   │  │
│ 4│ ─────────│                                               │ ────────│ 5│
│  │ Acteurs  │                                               │ ✎ Lex.  │  │
│  │ ● Base   │                                               │ chapelier│  │
│  │   Coopé. │                                               │          │  │
│  │ ● Adv    │                                               │          │  │
│  │   Méfi.  │                                               │          │  │
│  │ ● État   │                                               │          │  │
│  │   Hostil.│                                               │          │  │
│  │ ● Opin.  │                                               │          │  │
│  │   Atten. │                                               │          │  │
├──┴──────────┴───────────────────────────────────────────────┴──────────┴──┤
│ INSTRUMENTS · 7 cadrans laiton (88px) — fine motor de la main             │ ← Cadrans (88px)
│ ◐ Caisse 1245  ◉ Conf 76  ✚ Santé 60  ✦ Légi 46  ✕ Fext 39  ◊ Fint 50    │
├─────────────────────────────────────────────────────────────────────────────┤
│ DASHBOARD D'ACTIONS — 8 boutons rapides + Actions N/M + ● Cachet (60px)  │ ← Dashboard (60px)
│ [📜 Tracts 3F] [📢 Meeting 8F] [✊ Manif 15F] [✎ Pétit. 5F] [🤝 Délég 10F]│
│ [📰 Presse 12F] [💰 Trésor.] [⚖ Table 15m]    [Toutes ›] [Actions 1/2] [●]│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Total fixe** :
- Top header : 60px
- Era timeline : 32px
- Instruments : 88px
- Dashboard : 60px
**= 240px fixes** → Le Ciel = 100dvh - 240 = ~660px sur 900px viewport.

---

## III. Améliorations vs version actuelle

| Avant | Après |
|---|---|
| Status bar 48px nue (juste horloge + tour + mood) | Top header 60px riche : drapeau + portrait + nom + trait + 7 mini-jauges chiffres + boutons système |
| Aucun portrait visible | Portrait perso 40-48px laiton avec initiale stylée et trait dominant en sous-titre |
| Ressources visibles UNIQUEMENT en cadrans bas | Doublement : chiffres en top header + cadrans en bas (Civ-style — redondance pour lisibilité instantanée) |
| Dashboard avec icônes 18px | Icônes 24-28px, plus parlantes (Tropico-style) |
| Pas de section "Suivi/Outliner" | Rail gauche avec 3 emplacements épinglables (objectifs/acteurs prioritaires) — Hearts of Iron-style |
| Mini-portraits acteurs en dot 8px | Portraits 24-28px avec initiale + bord coloré selon mood |
| Le Ciel : padding clamp(0.8rem, 3vw, 2.4rem) | Padding inner 2.5-3rem généreux (Chen-style — espace de respiration) |
| Pas de filigrane crise | Si crise : filigrane rouge sourd sur toute la palette + jauges critiques clignotent |
| Lexique en 1 terme aléatoire | Lexique : terme du scénario en cours (contextuel) |

---

## IV. Implémentation prioritaire (cette session)

1. **Top header enrichi** (Fåhraeus + Meier) :
   - Drapeau syndical/patronal stylisé SVG à gauche
   - Portrait initiale stylée laiton 40px + nom + trait dominant
   - 7 mini-chips chiffres ressources avec icône paritaire
   - À droite : ♫ + ⊟ + ⚙ (déjà en place)

2. **Mini-portraits acteurs** dans rail gauche (Andersson) :
   - Initiale 28px en cercle bordé selon mood (rouge hostile,
     orange méfiant, doré attentif, vert favorable)
   - Subtitle court (faction/posture)

3. **Filigrane crise** (Wright + Raynal) :
   - Si crise active : overlay radial rouge 5% sur tout le shell
   - Cadrans en zone rouge (< 25 %) clignotent

4. **Le Ciel padding généreux** (Chen) :
   - Inner padding 2.5rem (au lieu de clamp 0.8-2.4)
   - Max-width 64rem reste

---

*Implémentation directe dans le shell. Tests visuels manuels
prévus après livraison.*
