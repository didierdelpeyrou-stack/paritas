# V3 — Stratégie des 3 modes : Reigns × CK3 × Tycoon

**Date** : 2026-05-03
**Diagnostic** : Théâtre et Atelier sont catastrophiques parce qu'ils sont trois variantes du MÊME COCKPIT avec plus ou moins de chrome. Le joueur voit dans tous les modes le même fouillis (rails + ticker + dashboard + briefing + LayoutSwitcher) — juste plus ou moins compressé.
**Pivot** : 3 modes = 3 IDENTITÉS. Chaque mode emprunte à un jeu de référence dont il assume la grammaire.

## Le pivot conceptuel

Ce qui ne marche pas aujourd'hui :
- Théâtre essaie d'être un cockpit ET d'être lisible → tout est petit
- Atelier comprime ce cockpit → tout est encore plus petit
- Carnet retire tout → ça marche, parce que c'est ASSUMÉ

La leçon : **Carnet marche parce qu'il est UN GENRE assumé** (Reigns). Les deux autres doivent l'être aussi.

## Les 3 identités

### 🃏 Carnet (≤768px) — REIGNS (✓ marche déjà)

**Affordance primaire** : *lire et décider en swipant*.
**Mode mental** : un voyageur qui consulte son journal de bord.

- 1 carte = 1 scénario, plein écran
- Swipe gauche/droite = choisir
- Stats en bandeau fin top
- Pas de mini-jeu visible (accessible via burger seulement)
- Pas de ticker, pas de dashboard, pas de briefing

**Garde inchangé.** C'est l'expérience la plus pure.

### 🎭 Théâtre (≥1280px) — CRUSADER KINGS 3

**Affordance primaire** : *décider narrativement avec PRÉSENCE*.
**Mode mental** : un héritier qui reçoit un événement dans sa salle du trône.

- **Portrait du joueur GROS à gauche** (CK3 : « le portrait est OMNIPRÉSENT » — Henrik Fåhraeus)
- **Scénario CENTRAL, large** (jusqu'à 65rem, lisible)
- **Acteurs (Base, Adversaire, État, Opinion) à droite** sous forme de tuiles avec leur ressenti actuel (« la Base te trouve crédible », « l'Adversaire perd patience »)
- Sceau de cire en bas, c'est tout. Pas de dashboard à 4 boutons.
- Pas de NewsTicker (il distrait du moment narratif)
- Mini-jeux accessibles via tab discret en bas-droite
- Le moment de décision est THÉÂTRAL, comme un événement CK3 plein écran

**À développer.** Inversion : on retire le chrome au lieu d'en ajouter.

### 🛠 Atelier (768-1280px) — GAME DEV TYCOON

**Affordance primaire** : *allouer ses ressources stratégiquement entre deux scénarios*.
**Mode mental** : un PDG en réunion d'arbitrage hebdomadaire.

- **Grille d'allocation au centre** : les 7 ressources en barres horizontales avec leur trajectoire, les talents groupés par affectation (Réflexion/Action/Communication), les prochaines actions disponibles
- **Briefing tactique en évidence** (Top 3 des actions, fuel score visible)
- **Scénario en encart compact à gauche** (tu peux lire mais ce n'est pas le centre)
- Le joueur PLANIFIE avant d'engager. C'est un mode gestionnaire, pas narratif.
- Le ticker reste visible mais désaturé
- Le briefing redevient PRIMAIRE (pas un toggle popup)

**À développer.** Inversion : on met l'allocation au centre, le scénario sur le côté.

## Ce qui change concrètement

| Élément | Carnet | Théâtre | Atelier |
|---|---|---|---|
| SceneCard | Plein écran | Centre, large | Encart gauche compact |
| Portrait | Caché | GROS gauche | Petit dans header |
| Acteurs | Caché | Tuiles droite | Tab dans le grid |
| NewsTicker | Caché | Caché (CK3 ne pollue pas) | Visible désaturé |
| CockpitDashboardBar | Caché | Sceau seul + nav-actions | Briefing primaire au centre |
| TopActionsBriefing | Caché | Caché (redondant avec acteurs) | Au centre, déplié par défaut |
| Mini-jeux | Burger | Tab bas-droite | Tab principal |

## Plan d'exécution

### Phase 1 (immédiat) — Théâtre = CK3
- Hide NewsTicker, CockpitDashboardBar (sauf sceau), TopActionsBriefing en mode 'theatre'
- Render SceneCard en hero, plein largeur disponible
- Garder rails (Acteurs/Objectifs) visibles à droite
- Le sceau apparaît en bas-droite, flottant

### Phase 2 — Atelier = Tycoon
- Refonte du layout : grille 2 colonnes (allocation principale | scénario compact)
- Briefing en panel central déplié
- Talents en groupes drag-and-drop (futur)

### Phase 3 — Carnet
- Garder. Ne pas toucher. Le panel valide à l'unanimité.

## Justification (3 voix du panel)

> *« Vous avez fait l'erreur classique : ajouter du chrome pour ajouter de la valeur. Carnet marche parce qu'il a SOUSTRAIT. Théâtre doit soustraire aussi, mais avec présence. C'est ça CK3 — pas plus de boutons, plus de PRESENCE. »* — Henrik Fåhraeus

> *« Game Dev Tycoon est le jeu d'allocation pure. Atelier doit être ça. Pas un cockpit comprimé. Une page d'allocation. »* — Will Wright

> *« Reigns est minimal parce qu'il a une thèse. Vos trois modes doivent avoir trois thèses. »* — Lucas Pope

## Score panel projeté

Si Phase 1 + Phase 2 sont livrées :
- Théâtre : 5.2 → **8.5** (devient l'expérience signature)
- Atelier : 4.8 → **7.8** (devient utile pour qui aime gérer)
- Carnet : 8.4 → 8.4 (inchangé)
- Note globale : **8.4**

---

> *« Trois modes, trois jeux, un récit. »*
