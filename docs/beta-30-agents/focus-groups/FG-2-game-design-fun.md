# FG-2 — Game design & plaisir · « Une décision, une morsure »

**Date simulée** : J+8 · **Durée** : 60 min · **Animation** : Argus
**Composition** : Pope (#04, invité-doublon), Romero (#05), Fåhraeus (#09), S. Johnson (#10), McGonigal (#06), Théo R&D (#21)

---

## Question d'ouverture

> *« Décrivez le moment où vous avez ressenti le plus de plaisir actif. Ou si jamais : pourquoi pas. »*

---

## Tour de table — moment de plaisir

**Pope** : « Tour 12 — la signature de Matignon avec sceau de cire pulse 8s. Le délai produit l'attente, l'attente produit la décision. C'est diégétique pur. **Le plaisir est dans le timing**. »

**Romero** : « Tour 9 — corruption préfet 1936. Le jeu m'a forcée à signer ou rompre. **Pas d'option neutre, pas de softening**. Train-level dilemma. **Inconfort productif atteint**. »

**Fåhraeus** : « Tour 11 — première fois où Frachon réagit à un de mes choix de tour 7 (différé). **Mémoire des acteurs activée**. C'est CK3-grade. Pas systématique malheureusement. »

**Johnson** : « Tour 5 — survol Confiance et le breakdown s'ouvre avec sources : Frachon +3, Opinion +1, Événement -2. **Civ-IV-grade**. Mais 5 jauges sur 6 sont opaques, donc le plaisir s'étiole. »

**McGonigal** : « Le journal IA post-partie cite Hatzfeld + Friot. **J'ai téléchargé un PDF immédiatement**. Le plaisir civique : sortir du jeu en sachant quelque chose de plus. Mais pas de call to action. »

**Théo** : « Tour 14 — un scénario 'cadre dirigeant' qui correspond à ma vie pro. **Reconnaissance**. Disco-grade narrativement. Mais le panel syndical (CGT/CFDT/FO) sans CFE-CGC m'a fait chuter le NPS. »

---

## Désaccords identifiés

### Désaccord 1 — Romero (blesser) vs McGonigal (édifier)

| Romero | McGonigal |
|--------|-----------|
| « Le jeu doit me laisser un goût amer après une victoire » | « Le jeu doit me donner envie d'agir dans le réel après ma défaite » |
| Cible : inconfort productif | Cible : lift civique positif |
| Tour 9 corruption préfet est un succès | Tour 9 corruption préfet manque de call to action |

**Verdict du groupe** : **les deux sont compatibles**. Le journal IA peut faire **les deux** : (a) confronter le joueur à la trahison qu'il a commise (Romero), (b) lui proposer une action concrète dans le réel (McGonigal). **Action** : `journalAI.ts` doit générer 2 paragraphes — un de morsure (« tu as choisi la corruption »), un d'action (« le RSA paritaire que tu as refusé existe vraiment, signe la pétition X »).

### Désaccord 2 — Pope (sobriété) vs Théo (densité combinatoire)

| Pope | Théo |
|------|------|
| « 4 animations idle, c'est trop » | « Civ-VI a 50+ paramètres, Paritas en a 6, c'est léger » |
| Cible : minimalisme intentionnel | Cible : profondeur stratégique |

**Verdict du groupe** : pas d'accord. **Théo veut + de paramètres, Pope veut moins de bruit visuel**. Compatible si on ajoute des paramètres **non-visuels** (ex: arbre des relations Fåhraeus). → P1.

### Désaccord 3 — Johnson (transparence) vs Fåhraeus (opacité productive)

- Johnson : « toutes les formules à l'écran »
- Fåhraeus : « CK3 cache les formules pour produire de la surprise — un joueur qui voit le seed perd le plaisir »

**Verdict du groupe** : **mode développeur (debug overlay) optionnel**. Joueur novice : opacité. Joueur expert (à la Bret Victor) : breakdown complet. → `Settings.svelte` ajouter toggle « afficher les coefficients ».

---

## Accords du groupe (≥ 4 voix sur 6)

1. ✅ **Mémoire des acteurs (callback différé tour N)** — `gameState.svelte.ts` (5 voix : Fåhraeus, Romero, Johnson, McGonigal, Théo). Augmenter la fréquence des rappels acteurs.
2. ✅ **Journal IA = morsure + action** — `journalAI.ts` (4 voix : Romero, McGonigal, Pope, Théo)
3. ✅ **Breakdown étendu aux 6 jauges** — `CockpitTopHeader.svelte` (4 voix : Johnson, Théo, McGonigal, Pope avec réserve sur clutter)
4. ✅ **CFE-CGC + plateformes en panel syndical** — `Elections/engine.ts` (4 voix : Théo + Romero/McGonigal/Pope qui valident la cible inclusivité)
5. ✅ **Mode debug overlay** — `Settings.svelte` (4 voix : Johnson, Fåhraeus, McGonigal, Pope)

---

## Top 3 P1 du groupe

| # | Fix | Fichier | Voix |
|---|-----|---------|----:|
| **P1-1** | Callback différé acteurs (N+3 à N+5) | `src/game/engine/consequenceEngine.ts` + `narrative/memoryEngine.ts` | 5/6 |
| **P1-2** | Journal IA en 2 paragraphes (morsure + action) | `src/game/narrative/journalAI.ts` | 4/6 |
| **P1-3** | CFE-CGC + plateformes en panel syndical | `src/game/ateliers/elections/engine.ts` + content/legendaires | 4/6 |

---

## Question fermée Argus

> *« Si vous deviez décrire PARITAS en UN MOT à un game designer qui ne le connaît pas, lequel choisiriez-vous ? »*

- Pope : *« Sobre »* (avec réserve)
- Romero : *« Honnête »*
- Fåhraeus : *« Promet »*
- Johnson : *« Opaque »* (avec frustration)
- McGonigal : *« Édifiant »*
- Théo : *« Léger »*

**Pas de mot consensuel**. Argus retient : *« promet »* (Fåhraeus) — c'est ce que les autres appellent l'écart entre la promesse expérientielle et le rendu.

---

## Coda

> *« 6 game designers ont joué. 6 mots différents. C'est exactement ce qu'on cherche : un jeu qui ne se laisse pas réduire. La friction reste sur l'opacité — et l'opacité tient une promesse. À toi de décider si tu veux la tenir. »*
>
> — Argus, FG-2
