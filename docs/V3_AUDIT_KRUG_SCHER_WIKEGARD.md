# Audit cockpit Paritas — 3 experts en chaîne

Suite de l'audit Norman. 3 experts complémentaires convoqués sur la
même build (commit 6ba24d7). Sessions de 10 min chacun.

---

## I. Steve Krug — *Don't Make Me Think*

Consultant UX, auteur de *Don't Make Me Think* (2000, 2014). Approche :
test de 5 utilisateurs > toute spec, simplicité radicale, "if you
can't make it self-evident, at least make it self-explanatory".

### Session 14:30 → 14:40

> *« OK je ne lis pas la doc. Je clique "Entrer dans l'histoire".
> Je passe les écrans intro, je suis Croizat, j'arrive sur le cockpit.
> Je vois le hint en haut "Bienvenue, Bâtisseur·e. Lis le scénario,
> puis clique l'une des options." Bien. C'est self-explanatory. »*

> *« Je lis le scénario "Sociétés de secours mutuel". Je vois 3
> options. Je clique la première : "Discrétion stratégique". »*

> *« Tour 2. Le hint a changé : "Mécanique : 1 décision scénarique +
> 0 à 2 actions libres par tour." Bien. Mais maintenant je le vois
> à chaque tour pendant 5 tours. Au 3ᵉ je le saute. Je lis pas. Toi
> tu me l'imposes — c'est l'inverse de Don't Make Me Think. »*

→ **Krug-Issue #1** : le hint persiste 5 tours. Devrait disparaître
dès qu'on a fait UNE action libre (preuve qu'on a compris).

> *« Je veux fermer le hint mais y a pas de croix. Je dois subir. »*

→ **Krug-Issue #2** : hint non dismissable.

> *« Les pilules de ressources en haut — Caisse 50, Confiance 50.
> Je clique sur "Caisse". Rien ne se passe. Mais je m'y attendais
> à voir un détail, un historique. C'est de l'info qui se présente
> comme cliquable mais ne l'est pas. »*

→ **Krug-Issue #3** : les chips de ressources en top header
ressemblent à des boutons (border, padding) mais ne sont pas
interactives. **Faux affordance** (Norman aurait dit la même chose).

> *« Le score en haut "S 90/100". Je passe la souris dessus. Pas de
> tooltip. Je sais pas ce que ça mesure. »*

→ **Krug-Issue #4** : score sans explication (= Norman fix #9).

### Verdict Krug

> *« 4 issues mineures. Le jeu est lisible. Le hint mécanique est un
> bon ajout. Mais : pour qu'un jeu de gestion soit "don't make me
> think", il faut que CHAQUE élément cliquable soit cliquable, et
> qu'aucun élément informatif n'ait l'apparence d'un bouton. Là,
> 8 chips de ressources ressemblent à des boutons. Soit tu les
> rends interactifs (popover détail), soit tu les dépourvois de
> leur affordance bouton. »*

---

## II. Paula Scher — Pentagram, typographie

Designer Pentagram NY, signature des identités du Public Theater,
Citi, Tiffany. Pratique du lettering monumental.

### Session 15:02 → 15:12

> *« Cinzel partout. Tu as choisi une romaine majuscule monumentale
> pour un dashboard syndical. C'est une bonne décision : ça pose
> l'autorité, l'archive, le sceau. Mais Cinzel est très chargé en
> contraste — il fatigue à petite taille. »*

> *« Le portrait "AC" en doré. C'est joli. Mais l'initiale en
> SourceSerif au lieu de Cinzel ? Incohérent. Le portrait c'est
> de l'identité — il devrait être en Cinzel. »*

→ **Scher-Issue #1** : police initiale du portrait ≠ Cinzel
(incohérence d'identité).

> *« Les chips ressources : tu mélanges Courier Prime (chiffre) et
> SVG icônes monochromes. La Courier est trop technique pour ce
> dashboard d'époque. C'est Civ 4, pas Paradox 2026. Tu devrais
> utiliser des chiffres en Cinzel light, ou une numérique humaniste
> comme Inter Tabular. »*

→ **Scher-Issue #2** : Courier Prime sur les chiffres = anachronique.
Substituer par Inter Tabular / Cinzel light.

> *« Hiérarchie : le titre du scénario "Sociétés de secours mutuel"
> est en taille 32 px Cinzel. Bien. Mais le hint "Bienvenue
> Bâtisseur·e" juste au-dessus est en SourceSerif 16 px. Le hint
> attire MOINS que le titre — paradoxal car le hint est censé
> guider. Soit le hint passe en gros et bref, soit il devient
> petit ET en haut à droite (toast persistant). »*

→ **Scher-Issue #3** : hiérarchie typographique inversée
(hint < scénario alors que hint = guide d'action).

> *« Le drapeau SVG — étoile à 5 branches ? C'est américain. Le
> syndicalisme français a des symboles propres : épi de blé (CGT
> historique), faisceau (sinistre — éviter), main d'œuvre serrée
> (CGT 1968), poing levé (mai 68). Substitue ton étoile. »*

→ **Scher-Issue #4** : étoile 5 branches sur le drapeau = trope
américain. Substituer par épi de blé ou poing levé selon camp.

### Verdict Scher

> *« Le système graphique est fort, cohérent, sait ce qu'il veut.
> Mais 4 incohérences typo/iconiques à corriger pour que le tout
> respire la France paritaire et pas un mash-up Civ-Paradox-Civic
> Tech. Le portrait en Cinzel et l'épi de blé sur le drapeau
> seront tes 2 quick wins de prestige. »*

---

## III. Jakob Wikegård — UI Lead Paradox (CK3, Stellaris, HoI4)

Designer UI senior Paradox Interactive, 12 ans sur les grands jeux
de stratégie. Spécialiste de la densité d'information sans bruit.

### Session 16:15 → 16:25

> *« Premier coup d'œil. C'est CK3 inspiré, je le vois. Top header
> avec drapeau + portrait + ressources. Bien. Bottom dashboard avec
> 8 boutons d'actions. Bien. Sidebars avec sections empilables.
> Bien. »*

> *« Mais regarde la HIÉRARCHIE de tes 3 zones d'action :
>   - Top header : 7 chips ressources (passive, lecture)
>   - Le Ciel : choix-cartes (actif, décision principale)
>   - Bottom dashboard : 8 boutons actions (actif, décision libre)
>   - Sidebars : 6 sections avec popovers
> Tu as 4 zones d'action concurrentes. À CK3 on en a 2 max :
> portrait/event au centre, action bar en bas. Le reste est
> contextuel ou caché. Trop de zones ouvertes = paralysie. »*

→ **Wikegård-Issue #1** : trop de zones d'action concurrentes.
Hiérarchiser : Le Ciel = primaire, dashboard bottom = secondaire,
top header + rails = passif (lecture).

> *« Tes cadrans laiton bottom — beaux, mais redondants avec les
> chips top. À Paradox on dirait : "either/or". Soit cadrans, soit
> chips. Pas les deux. La redondance est rassurante au tutoriel
> mais devient bruit après 3 tours. »*

→ **Wikegård-Issue #2** : redondance cadrans bottom ↔ chips top.
Choisir une seule représentation OU passer les cadrans bottom en
dépliage on-demand.

> *« La barre du bas dashboard — 8 boutons + Toutes + Actions N/M
> + Cachet. C'est dense. Mais tous les 8 boutons ont la MÊME forme,
> taille, accent visuel. Donc le joueur ne sait pas lequel est le
> plus important. À Paradox, on aurait : 1 bouton principal lourd
> (la décision majeure du tour) + 7 secondaires plus discrets +
> 1 "more" bouton pour la suite. »*

→ **Wikegård-Issue #3** : 8 boutons d'actions à plat = pas de
hiérarchie. Élever 1-2 actions principales selon contexte (crise,
ère, dominantTrait) et reléguer les 6 autres en taille moindre.

> *« Le drapeau en haut. Joli mais STATIQUE. À CK3, le drapeau
> bouge légèrement quand on hover (subtle ondulation). Donne-lui
> de la vie. C'est ton "héraldique" — il doit vivre. »*

→ **Wikegård-Issue #4** : drapeau statique. Animation d'ondulation
au hover (CSS keyframe).

> *« Et : où sont mes "messages personnels" ? À CK3 j'ai des
> notifications de mes vassaux qui s'épinglent à droite avec
> portrait. Toi : aucun système de notification persistant. Tes
> Acteurs (Base, Adversaire, État, Opinion) sont visibles mais
> ils ne me PARLENT pas. »*

→ **Wikegård-Issue #5** : pas de système de message/notification
des acteurs. Quand un acteur change radicalement de mood, devrait
épingler une mini-notification 5-7 secondes ("La Base est
mécontente : tu as signé sans la consulter").

### Verdict Wikegård

> *« Bonne fondation cockpit, exécution propre. Mais 5 leviers à
> tirer pour passer du "très inspiré" au "mémorable" :
>   1. Hiérarchiser les 4 zones d'action (Le Ciel domine, dashboard
>      seconde, sidebars passives, top header lecture seule)
>   2. Choisir cadrans OU chips, pas les deux
>   3. Élever 1-2 actions principales selon contexte
>   4. Animer le drapeau (vie héraldique)
>   5. Notifications acteurs persistantes 5-7 sec
> Ça fait passer le jeu d'une "démo dense" à une "lutte vivante". »*

---

## IV. Synthèse globale — 9 nouvelles issues

| Source | # | Issue | Sévérité | Fix |
|---|---|---|---|---|
| Krug | 1 | Hint persiste 5 tours sans s'auto-éteindre | 3 | XS |
| Krug | 2 | Hint non dismissable | 2 | XS |
| Krug | 3 | Chips ressources = faux affordance | 3 | S |
| Krug | 4 | Score S/100 sans tooltip | 2 | XS |
| Scher | 1 | Portrait initiale ≠ Cinzel (incohérence identité) | 2 | XS |
| Scher | 2 | Courier Prime = anachronique | 2 | S |
| Scher | 3 | Hiérarchie typo inversée hint < titre | 3 | S |
| Scher | 4 | Étoile drapeau = trope américain (épi/poing) | 3 | XS |
| Wikegård | 1 | 4 zones d'action concurrentes (paralysie) | 3 | M |
| Wikegård | 2 | Redondance cadrans/chips | 2 | S |
| Wikegård | 3 | 8 actions à plat sans hiérarchie | 4 | M |
| Wikegård | 4 | Drapeau statique | 2 | XS |
| Wikegård | 5 | Pas de notifications acteurs | 4 | L |

13 issues nouvelles. **2 P0 (sévérité ≥ 4)** : Wikegård #3 et #5.

---

## V. Quick wins implémentables maintenant

### Lot 1 — Visuels (Scher quick wins)
- Portrait initiale en **Cinzel** au lieu de défaut SourceSerif
- Drapeau SVG : remplacer étoile 5 branches par **épi de blé**
  (camp salarié) ou **roue dentée** (camp patron) — symboles
  spécifiquement français
- Animation d'ondulation au hover sur le drapeau

### Lot 2 — Hint mécanique (Krug fixes)
- Bouton ✕ fermer sur le hint
- Auto-dismiss après 1ʳᵉ action libre (détecter via
  `orchestrator.state.history.length > 0`)

### Lot 3 — Tooltip Score (Krug + Norman)
- Title attribute riche sur "S 90/100" :
  *« Score dialectique — moyenne pondérée des 7 ressources.
  Indique la santé globale de ton organisation. »*

### Lot 4 (plus lourd, à différer) :
- Wikegård #3 : élever 1-2 actions principales selon contexte
- Wikegård #5 : système notifications acteurs

---

*Sessions du 2 mai 2026, 3 experts, 30 min cumulées.*
