# FG-4 — Accessibilité & inclusion · « Sans barrière, sans bruit »

**Date simulée** : J+9 · **Durée** : 60 min · **Animation** : Argus
**Composition** : Soueidan (#03, invité-doublon), Pascal NVDA (#24), Manon dys+TDAH (#25), Aïcha (#23), Lukas allemand (#28), Villani (#07, invité)

---

## Question d'ouverture

> *« Sans barrière, sans bruit : qu'est-ce qui empêche la moitié de l'humanité de rentrer dans Paritas ? »*

---

## Tour de table

**Soueidan** : « WCAG 2.2 AA. **5 violations** au tour 1 : `role='marquee'` au lieu d'`aria-live`, contraste doré sur noir 4.21:1 (sous AA), Tab order chaotique (14 Tab pour atteindre les choix), LayoutSwitcher hors tab order, jauges annoncées sans contexte ('55' au lieu de 'Confiance, 55 sur 100'). »

**Pascal** : « Avec JAWS, je peux jouer 6 tours puis je décroche. **Ce n'est pas l'a11y bloquante** — j'arrive à naviguer — c'est la **friction continue** : Tab → Tab → Tab → Tab pour atteindre un choix narratif. C'est de la maintenance d'attention coûteuse. Un joueur voyant clique en 0,5 s. Moi je mets 8 s. **15× plus lent**. »

**Manon** : « OpenDyslexic non-natif. Cinzel ALL CAPS sur valeurs numériques : illisible (f/t confondus). Top-header avec 7 chips : surcharge cognitive. **Je ferme l'onglet 3 fois** en 12 tours. Le mode FALC (tour 9) me sauve mais arrive trop tard. »

**Aïcha** : « Le mode Compulsif rend la fatigue, mais **pas la fatigue physique de soignante**. Voix intérieures = 4 archétypes politiques. Pas une voix de soignante en burnout. Aussi : 0 nom féminin racisé au roster. **Je ne peux pas me reconnaître**. »

**Lukas** : « Français B2. Les mots : 'paritarisme' (devine via Parität), 'délégué' (OK), 'CGT/CFDT/FO' (j'ai mis 8 tours pour distinguer). **FO** = je l'ai prise pour un sigle technique (Force Ouvrière, j'ai compris qu'au glossaire). Le glossaire sauve mais demande effort. »

**Villani** (invité hors corps) : « Pédagogiquement, l'accessibilité passe aussi par la **vulgarisation des chiffres**. La jauge Confiance à 55/100 ne dit rien à un non-mathématicien. Une formulation 'trois cinquièmes' ou un secteur graphique ferait mieux pour les non-quantitatifs. »

---

## Désaccords identifiés

### Désaccord 1 — Soueidan/Pascal (a11y formelle WCAG) vs Manon (a11y cognitive)

| Soueidan/Pascal | Manon |
|-----------------|-------|
| WCAG 2.2 AA mesurable | Lisibilité cognitive sentie |
| `aria-label` + tab order + contraste 4.5:1 | OpenDyslexic + paragraphes courts + ticker en pause |
| Cible : screen readers | Cible : neurodivergents |

**Verdict du groupe** : **les deux sont prioritaires et complémentaires**. Pascal fait remarquer : « WCAG est un plancher légal, pas un objectif d'expérience. » Manon : « OpenDyslexic n'est pas dans WCAG. » → **action** : (a) corriger les 5 violations WCAG en P0, (b) ajouter un preset « cognitive-friendly » avec OpenDyslexic + FALC + ticker pause en P1.

### Désaccord 2 — Aïcha (inclusion identitaire) vs Lukas (inclusion linguistique)

- Aïcha : « pas de femme racisée au roster, je ne me reconnais pas »
- Lukas : « pas de glossaire au survol, j'ai galéré 8 tours sur FO »

**Verdict du groupe** : **deux trous d'inclusion distincts**. Aïcha cherche reconnaissance, Lukas cherche compréhension. **Action** : (a) ajouter 1-2 figures féminines racisées au roster (peut être inventées avec source, ou figures comme Eunice Foote ou des figures CGT-Santé), (b) **glossaire au survol** sur les sigles syndicaux dès leur première apparition (pas dans le glossaire à chercher).

### Désaccord 3 — Villani (vulgarisation) vs Soueidan (précision)

- Villani : « 55/100 ne parle pas, mettre 'trois cinquièmes' ou un graphique »
- Soueidan : « les chiffres sont essentiels pour JAWS, l'imagerie n'aide pas »

**Verdict du groupe** : **garder les chiffres ET ajouter un secteur graphique optionnel**. Toggle « afficher les valeurs en fractions / en pourcentages / en graphique ». Compromis sain. → P2.

---

## Accords du groupe (≥ 4 voix sur 6)

1. ✅ **Corriger les 5 violations WCAG 2.2 AA** (5 voix : Soueidan, Pascal, Manon, Lukas, Aïcha)
2. ✅ **Preset cognitive-friendly au launch** (5 voix : Manon, Pascal, Soueidan, Aïcha, Villani)
3. ✅ **Glossaire au survol des sigles syndicaux** (4 voix : Lukas, Manon, Aïcha, Villani)
4. ✅ **2 figures féminines racisées au roster** (4 voix : Aïcha, Manon, Soueidan, Pascal — solidarité a11y/inclusion)
5. ✅ **Pause + `aria-live` ticker** — `NewsTicker.svelte:122` (4 voix : Soueidan, Pascal, Manon, Lukas — recoupe FG-1)

---

## Top 3 P0 du groupe

| # | Fix | Fichier | Voix |
|---|-----|---------|----:|
| **P0-1** | 5 violations WCAG 2.2 AA | `NewsTicker.svelte:122`, `CockpitTopHeader.svelte` jauges, `LayoutSwitcher.svelte` tab order, `app.css` contraste, modales `aria-label` | 5/6 |
| **P0-2** | Preset cognitive-friendly (OpenDyslexic + FALC + ticker pause) | `Settings.svelte` + `app.css` + `gameState.svelte.ts` ajouter `preset: 'default' \| 'cognitive'` | 5/6 |
| **P0-3** | Glossaire au survol sigles syndicaux | `lib/data/glossary.ts` + `components/scene/GlossaryText.svelte` étendre aux sigles à la première occurrence | 4/6 |

---

## Question fermée Argus

> *« Si vous deviez décrire l'expérience PARITAS à votre asso (Valentin Haüy / FFDys / FNATH / asso étudiants), seriez-vous fiers ou gênés ? »*

- Soueidan : *« Gêné — 5 violations AA. »*
- Pascal : *« Gêné — friction continue, je décroche tour 6. »*
- Manon : *« Gênée — j'ai fermé 3 fois l'onglet. »*
- Aïcha : *« Mitigée — la voix Compulsif m'a touchée mais le roster m'a déçue. »*
- Lukas : *« Pas concerné — je ne suis pas porteur de handicap. »*
- Villani : *« Fier de l'ambition pédagogique, gêné de la barrière numérique. »*

**4 voix sur 6 disent "gêné"**. **Argus retient** : avant la bêta publique, l'a11y est un **gate non-négociable**. Pas de v2.2.0-beta-public sans P0-1.

---

## Coda

> *« Une jauge à 55, c'est lisible pour qui peut lire. Une jauge à 'Confiance, 55 sur 100, en hausse', c'est lisible pour tous. La différence est de 12 caractères dans le code. Et de la moitié de l'humanité dans la salle. »*
>
> — Argus, FG-4
