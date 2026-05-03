# Audit cockpit Paritas — 3 experts vague 3

Suite de Norman + Krug/Scher/Wikegård. 3 experts complémentaires
sur la build commit d8da076.

---

## I. Jakob Nielsen — heuristic evaluation

Co-fondateur Nielsen Norman Group, auteur des 10 heuristiques
d'usabilité (1994, mises à jour 2020). Approche systématique :
chaque interface est évaluée contre les 10 heuristiques.

### Évaluation systématique — 18 minutes

#### H1 — Visibilité de l'état du système
> *« Bien. Tour visible (T1/100), Mood, Ère, ressources en chips.
> Le Score dialectique est visible mais son tooltip arrive
> seulement au hover — devrait être affiché au load première
> partie. Sinon : excellent retour visuel des deltas (chips
> clignotent quand une jauge baisse). »*

**Score : 8/10.**

#### H2 — Match between system and real world
> *« "Mandat", "Caisse", "Légitimité", "Force interne/externe",
> "Cohésion" — vocabulaire syndical authentique. Bien. Mais "Score
> dialectique" est un terme philosophique. Un syndicaliste dirait
> "rapport de force global" ou "position". À reconsidérer. »*

→ **Nielsen-Issue #1** : "Score dialectique" → terminologie
philosophique. "Indice de position" ou "Rapport de force global"
plus accessible.

#### H3 — User control and freedom
> *« Bouton ⊟ Classique pour quitter le cockpit. Bien. Bouton
> ✕ pour fermer le hint. Bien. Mais : aucun "Annuler la dernière
> action" — si je clique Tracts par erreur, je ne peux pas
> revenir. »*

→ **Nielsen-Issue #2** : pas d'annulation d'une action déclenchée
par erreur depuis le dashboard bottom. Confirmer ? Ou undo 1 fois ?

#### H4 — Consistency and standards
> *« Tabs latéraux ouvrent un drawer plein écran. Rails ouvrent
> des popovers ancrés. Bouton Actions ouvre un drawer recouvrant.
> Trois patterns différents pour des actions similaires. À unifier. »*

→ **Nielsen-Issue #3** : 3 patterns d'ouverture (drawer plein écran,
popover ancré, drawer recouvrant) pour des fonctionnalités UI
proches. Unifier ou justifier visuellement la différence.

#### H5 — Error prevention
> *« Excellente : bouton Actions affiche le coût avant clic. Si
> impossible, bouton désactivé avec raison en tooltip. Pas de
> piège. »*

**Score : 10/10.**

#### H6 — Recognition rather than recall
> *« Icônes paritaires SVG bien dessinées (épis, sceau, balance,
> poing). Le joueur n'a pas à mémoriser. Mais aucun label PERMANENT
> à côté des chips ressources : juste icône + chiffre. Le label
> n'apparaît qu'au tooltip. Pour 7 chips à comprendre, c'est
> beaucoup. »*

→ **Nielsen-Issue #4** : chips ressources sans label permanent.
Ajouter un mini-label sous l'icône (sm font), ou compromis
hybride : label visible si hover sur le strip entier.

#### H7 — Flexibility and efficiency
> *« Aucun raccourci clavier. À CK3 j'ai Espace pour pause,
> Échap pour menu, F1-F12 pour panels. Toi : juste Échap pour
> fermer un drawer. Joueur expert sera frustré. »*

→ **Nielsen-Issue #5** : pas de raccourcis clavier. Au moins :
1-9 pour les actions rapides, A pour ouvrir Actions drawer,
S pour Settings, Échap pour tout fermer.

#### H8 — Aesthetic and minimalist design
> *« Densité : très haute. Chaque pixel compte. Mais : Wikegård
> a raison, redondance entre cadrans bottom et chips top. Et le
> drapeau, le portrait, le nom, le trait, le score — c'est 5
> éléments d'identité dans 200px de large. Trop. »*

→ **Nielsen-Issue #6** : densité identité top-left = 5 éléments
dans 200px (drapeau, portrait, nom, trait, score). Réduire à 3.

#### H9 — Help users recognize, diagnose, recover from errors
> *« Crisis banner s'affiche quand 3+ jauges < 25. Bien. Mais le
> message dit juste "Crise systémique — N jauges en zone critique".
> Aucune SUGGESTION sur quoi faire. À CK3 si vassal en révolte,
> on me suggère "négocier", "réprimer", "céder". »*

→ **Nielsen-Issue #7** : crise sans suggestion d'action concrète.
Ajouter dans le bandeau crise 1-2 actions recommandées
contextuelles ("Trésorerie urgente" si Caisse < 25).

#### H10 — Help and documentation
> *« Hint au tour 1-5 OK. Mais aucun "?" cliquable pour rouvrir
> l'aide. Si je dismiss et que je veux la revoir : impossible. »*

→ **Nielsen-Issue #8** : pas de bouton "?" pour rouvrir le hint
dismissed.

### Verdict Nielsen

> *« 8 issues. Plus de la moitié sur la consistance et la
> documentation. Le jeu est lisible et bien fait, mais manque
> les 'comforts' qui distinguent un produit fini d'un prototype
> avancé : raccourcis clavier, suggestions contextuelles en
> crise, aide rappelable, undo. **Score moyen heuristique :
> 7,4/10**. Bon, pas excellent. »*

---

## II. Alan Cooper — *About Face*, goal-directed design

Inventeur des personas (1990s), auteur *About Face* (1995, 4ᵉ éd
2014). Approche : 3 personas cibles → comment chacun vit le jeu.

### Personas pour Paritas

**Persona A — Sophie, 28 ans, doctorante en sociologie politique**
- Curieuse, lit Castel/Friot, joue aux jeux indé narratifs
- Goal : comprendre le paritarisme français, ressentir les
  dilemmes
- Tolérance UX : moyenne (impatiente avec les bugs, patiente
  avec la complexité)

**Persona B — Mohamed, 45 ans, délégué CGT en région**
- Pratique syndicale réelle, peu de jeu vidéo
- Goal : revivre des moments historiques, transmettre à ses jeunes
- Tolérance UX : faible (frustré par les interfaces denses)

**Persona C — Benjamin, 19 ans, étudiant Sciences Po**
- Joueur Civ + EU4 + Disco Elysium, lit *Le Monde* et *Brennus*
- Goal : optimiser, débloquer, jouer 4-5 parties pour voir tous
  les endings
- Tolérance UX : très haute (aime la densité)

### Tour Sophie

> *« Sophie ouvre le jeu. Cockpit. Trop dense. "Où est mon
> personnage ? Ah, en haut à gauche — Croizat. Bâtisseur. OK."
> Elle clique sur le scénario. Lit. Tente une option par
> intuition. Conséquence apparait. Bien. Elle scrolle. Personnage
> "AC" dans le portrait — elle ne fait pas le lien immédiatement
> avec Croizat. »*

→ **Cooper-Issue #1** : portrait initiale "AC" sans visage ne
crée pas l'attachement émotionnel attendu pour Sophie. Solution :
miniature illustration historique ou silhouette caractérisée.

### Tour Mohamed

> *« Mohamed joue Berger (CFDT). Il voit le drapeau rouge avec
> épis (mais CFDT historique a un logo différent — une étoile
> blanche dans un cercle, pas du rouge CGT). »*

→ **Cooper-Issue #2** : le drapeau actuel ne distingue pas les
sous-camps salariés (CGT rouge / CFDT bleu+étoile / FO bleu+marin /
CFTC vert+croix / Solidaires arc-en-ciel). Tous mélangés en
"rouge avec épi" = inexact pour les vrais syndicalistes.

> *« Il essaie de cliquer sur "Caisse" en haut. Rien. Il tente le
> cadran "Caisse" en bas. Rien. Frustré. »*

→ Confirme **Krug #3** : chips ressources non-cliquables alors
qu'elles ressemblent à des boutons.

### Tour Benjamin

> *« Benjamin clique TOUS les onglets latéraux en 30 secondes.
> Découvre les popovers, les drawers, La Table en popup.
> Identifie immédiatement les 8 actions rapides. Frustré : "Y a
> pas de hotkey ? Sérieux ?" »*

→ Confirme **Nielsen #5** : raccourcis clavier manquants.

> *« Il joue 10 tours en 4 minutes. À la fin : "C'est trop lent.
> Je veux un mode rapide où Espace = avance et tooltip = pause." »*

→ **Cooper-Issue #3** : pas de mode "expert" qui accélère le
flow (hover = pause auto, espace = action par défaut).

### Verdict Cooper

> *« 3 personas → 3 issues. Mais surtout, le jeu n'a PAS de
> persona explicite ciblée. Tu codes pour Sophie en théorie
> (densité narrative + accessible) mais Mohamed dérangé par
> l'inexactitude historique des drapeaux et Benjamin frustré
> par l'absence de hotkeys. **Choisis une persona PRINCIPALE
> et code pour elle. Les 2 autres peuvent attendre.** »*

---

## III. Soren Johnson — Civilization 4 lead, Mohawk Games

Lead designer de Civilization IV (Firaxis), Spore, Offworld
Trading Company (Mohawk). Approche : équilibrage économique,
boucles d'optimisation.

### Session

> *« Je regarde les coûts/effets des 17 actions. Les chips
> ressources me disent où en sont les jauges. La crise alerte
> me prévient. Mais : aucune VISIBILITÉ sur l'évolution des
> jauges. Quelle ressource a le plus chuté ces 5 derniers tours ?
> Je dois mémoriser. »*

→ **Johnson-Issue #1** : pas de courbe d'évolution des
ressources. À Civ4 j'ai un graph 50 derniers tours pour chaque
jauge. Ajouter un mini-sparkline 10 derniers tours dans les chips
top, OU un panel "Tendances" dans le rail droit.

> *« Les actions ont des coûts CAISSE et MANDAT visibles, mais
> aucun "ROI estimé". Si je hover Manifestation : -15F -8 mandat,
> +12 RFE +5 Légi. ROI = 17 / 23 = 0.74. Je dois calculer mentalement.
> À Civ4, hover sur production montre "+5 hammers/tour, durée 8
> tours, total 40 hammers". Calcul fait pour moi. »*

→ **Johnson-Issue #2** : pas de ROI estimé sur les actions. Au
moins un indicateur qualitatif "★★☆ Rentable" / "★☆☆ Coûteux"
basé sur ratio effets/coûts.

> *« Les vents historiques sont géniaux conceptuellement. Mais
> au tour 17 quand Front populaire commence, je le découvre dans
> le drawer Actions. À Civ je devrais le SAVOIR avant. À Civ
> on a la "demand notification" épinglée 3 tours avant. Tu
> devrais avoir une notification "Front populaire dans 2 tours —
> prépare tes manifs" 2 tours avant. »*

→ **Johnson-Issue #3** : vents historiques surprennent au lieu
de prévenir. Notification anticipée 2 tours avant l'activation.

> *« Et : aucun "score final attendu" projeté. À Civ je vois
> "victoire scientifique dans 32 tours si tu maintiens ce rythme".
> Toi : aucune projection. Le joueur ne sait pas s'il gagne ou
> perd. »*

→ **Johnson-Issue #4** : pas de projection de score final.
Affichage en post-partie seulement. Devrait être "Position
projetée : Croizat-style à 87%, ending probable Refondation".

### Verdict Johnson

> *« Bonne fondation économique. Les 17 actions sont calibrées
> avec soin. Mais le META-jeu (lecture de tendances, anticipation,
> projection) manque. Un joueur Civ-style veut OPTIMISER, donc
> a besoin de DATA. Tu donnes l'état actuel mais pas les
> trajectoires. **Ajoute 4 indicateurs méta : sparklines 10
> tours sur chips, ROI sur actions, notification vents -2 tours,
> projection ending.** »*

---

## IV. Synthèse — 15 nouvelles issues

| Source | # | Issue | Sévérité | Effort |
|---|---|---|---|---|
| Nielsen H2 | 1 | "Score dialectique" terminologie philo | 2 | XS |
| Nielsen H3 | 2 | Pas d'annulation action déclenchée par erreur | 3 | M |
| Nielsen H4 | 3 | 3 patterns d'ouverture concurrents | 3 | M |
| Nielsen H6 | 4 | Chips ressources sans label permanent | 3 | S |
| Nielsen H7 | 5 | Aucun raccourci clavier | 3 | S |
| Nielsen H8 | 6 | Densité identité top-left = 5 éléments | 2 | XS |
| Nielsen H9 | 7 | Crise sans suggestion d'action | **4** | M |
| Nielsen H10 | 8 | Pas de bouton "?" pour rouvrir hint | 2 | XS |
| Cooper | 1 | Portrait initiale ne crée pas attachement | 3 | M |
| Cooper | 2 | Drapeau ne distingue pas sous-camps | 2 | M |
| Cooper | 3 | Pas de mode "expert" rapide | 2 | L |
| Johnson | 1 | Pas de sparklines évolution ressources | 3 | M |
| Johnson | 2 | Pas de ROI sur actions | 3 | S |
| Johnson | 3 | Vents historiques surprennent | **4** | S |
| Johnson | 4 | Pas de projection ending | 3 | M |

15 issues. **2 P0 (sévérité 4)** : Nielsen #7 et Johnson #3.

---

## V. Quick wins implémentables maintenant

### Lot A — Communication & docs (Nielsen)
1. **Bouton "?" dans top header** pour rouvrir le hint mécanique
   (Nielsen #8) — XS
2. **Renommer "Score dialectique" → "Position globale"** (Nielsen #1)
   — XS
3. **Suggestion d'action dans crise banner** : si crise active,
   afficher 1-2 actions recommandées contextuelles dans le bandeau
   (Nielsen #7) — M

### Lot B — Anticipation (Johnson)
4. **Notification vent historique -2 tours** : bandeau d'avertissement
   « ☄ Front populaire dans 2 tours — prépare tes manifestations »
   (Johnson #3) — S
5. **ROI qualitatif sur actions** : badge ★★★ / ★★☆ / ★☆☆ sur
   chaque action selon ratio effets utiles / coûts (Johnson #2)
   — S

### Lot C — Reste pour plus tard
- Cooper #1 : portrait silhouette historique
- Cooper #2 : sous-camps drapeaux distincts
- Nielsen #5 : raccourcis clavier
- Johnson #1 : sparklines
- Johnson #4 : projection ending
- Nielsen #2/3/4 : refactoring patterns / undo / labels chips

---

*Sessions du 2 mai 2026. 3 experts, 50 min cumulées. 15 issues
nouvelles. 5 quick wins prévus.*
