# FG-1 — UX & mobile · « Le geste premier »

**Date simulée** : J+8 · **Durée** : 60 min · **Animation** : Argus (Maréchal-auditeur)
**Composition** : Wroblewski (#01), Krug (#02), Soueidan (#03), Pope (#04), Carmack (#14), Yanis (#19)

---

## Question d'ouverture (Argus)

> *« Vous ouvrez Paritas sur votre téléphone le matin dans le bus. Décrivez les 90 premières secondes. »*

---

## Tour de table — premier geste (5 min/agent)

**Wroblewski** : « 0:00 — j'ouvre la PWA depuis le raccourci. TTI 1.4 s, OK. 0:30 — l'écran d'accueil tient sur 390 px sans scroll horizontal. Bon. 1:00 — j'arrive sur le cockpit, je vois 7 chips chiffrées, le ticker défile, le badge POV breathe. **Surcharge**. 1:30 — je cherche un moyen de masquer la moitié des chips. Je ne trouve pas. »

**Krug** : « 0:00 — je clique 'Commencer', central, vert, OK. 0:30 — cockpit. 6 jauges + 1 ticker + 1 portrait + 1 badge. **Pas d'objectif tour-courant**. Je suis perdu. 1:00 — j'attends de voir un message du genre 'préparer la grève de juin'. Rien. 1:30 — je clique au hasard sur la jauge Confiance. Un panneau s'ouvre. Utile, mais c'est moi qui ai cherché. »

**Soueidan** : « 0:00 — Tab. 0:30 — JAWS lit 'Commencer'. OK. Tab → skip-to-main caché ✅. 1:00 — j'arrive cockpit, ticker silencieux (`role="marquee"` pas `aria-live`). 1:30 — je tente Tab vers LayoutSwitcher : **pas dans le tab order**. Bloqué. »

**Pope** : « 0:00 — silence. Pas de musique. OK. 0:30 — écran propre. 1:00 — cockpit, **8 couleurs simultanées** à l'écran. Obra Dinn en a 2. 1:30 — je compte 4 animations idle en boucle (sceau, badge POV, portrait actor, ticker). C'est trop. »

**Carmack** : « 0:00 — TTI mesuré : 2.8 s sur Galaxy A53 émulé. **Au-dessus de cible <2 s**. 0:30 — boot bloqué par Tone.js eager (265 KB). 1:00 — première transition d'ère : 50-55 FPS, pas 60. Hardware mid-range pénalisé. 1:30 — bundle 437 KB raw / 145 KB gzip = 1.5 s sur 4G simulée. »

**Yanis** : « 0:00 — j'ouvre, c'est quoi le titre ? PARITAS. Pas compris. 0:30 — je clique 'Commencer' parce que c'est le seul vert. 1:00 — cockpit. Trop de boutons en haut. Je vais en bas voir si y a un truc plus simple. 1:30 — je tape sur 'Confiance' au pif. Un panneau. Bon, mais c'est lent. »

---

## Désaccords identifiés

### Désaccord 1 — Densité du cockpit

| Pôle « cacher » | Pôle « exposer » |
|-----------------|------------------|
| Wroblewski : *« 4 jauges max sur 390 px »* | Krug : *« j'ai besoin d'aide visible »* |
| Pope : *« 4 animations en idle, c'est trop »* | (Sid Meier hors panel, mais cité par CockpitTopHeader.svelte:9-17) |
| Manon (FG-4) : *« je ferme l'onglet »* | |
| Yanis : *« trop de boutons » mais aussi « j'ai besoin de feedback »* | |

**Verdict du groupe** : **disclosure progressive** est la bonne réponse — pas tout cacher (Krug), pas tout afficher (Wroblewski). 3 jauges au tour 1, déverrouillage au fil des tours pivots (mention `ROADMAP_PANEL_INTEGRATION.md §1A.1`).

### Désaccord 2 — Animations idle

- Pope (#04) : « supprimer 3 des 4 animations idle, garder juste le sceau »
- Yanis (#19) : « sans animation c'est mort, j'ai pas envie d'y revenir »
- Carmack (#14) : *neutre* — l'animation a un coût perf, mais c'est minime

**Verdict du groupe** : **garder le sceau (diégétique) + supprimer breathing du badge POV + supprimer zoom du portrait acteur + pause sur ticker quand focus**. Compromis Pope/Yanis : animations narratives oui, animations decoratives non.

### Désaccord 3 — Tutoriel obligatoire ou non

- Krug (#02) : « il faut un objectif tour-courant explicite à l'écran »
- Wroblewski (#01) : « un débutant comprend en 2 min si le cockpit est dégraissé »
- Yanis (#19) : « j'ai pas envie de lire un tuto, je veux jouer »

**Verdict du groupe** : **objectif diégétique en bandeau du cockpit** (« Tour 5 — Préparer la grève de juin »), pas un tuto bavard. Compromis : Krug obtient l'objectif, Yanis n'a pas de friction de tutoriel imposé.

---

## Accords du groupe (≥ 4 voix sur 6)

1. ✅ **Disclosure progressive des 6 ressources** — `CockpitTopHeader.svelte:9-17` (5 voix : Wroblewski, Krug, Pope, Yanis, Soueidan)
2. ✅ **Pause + `aria-live` sur ticker** — `NewsTicker.svelte:122` (5 voix : Soueidan, Pope, Wroblewski, Krug, Yanis)
3. ✅ **Objectif tour-courant en bandeau diégétique** (4 voix : Krug, Wroblewski, Yanis, Carmack)
4. ✅ **Lazy import Tone.js** — `src/game/audio/` (4 voix : Carmack + Pope + Wroblewski + Soueidan, sur la friction « son qui bloque le boot »)
5. ✅ **Substitut tactile au hover (long-press → tooltip)** (4 voix : Wroblewski, Soueidan, Yanis, Pope)

---

## Top 3 P0 du groupe

| # | Fix | Fichier | Voix |
|---|-----|---------|----:|
| **P0-1** | Disclosure 3→6 ressources progressive | `src/components/cockpit/CockpitTopHeader.svelte:9-17` + `gameState.svelte.ts` ajouter `unlockedAt: number` | 5/6 |
| **P0-2** | Ticker : pause + `aria-live` + supprimer animation auto | `src/components/cockpit/NewsTicker.svelte:122` | 5/6 |
| **P0-3** | Objectif tour-courant diégétique | `src/components/cockpit/CockpitTopHeader.svelte` (nouveau slot top-banner) | 4/6 |

---

## Question fermée Argus

> *« Si vous deviez un seul P0 pour la bêta — UN seul — lequel choisiriez-vous ? »*

- Wroblewski : disclosure ressources
- Krug : objectif tour-courant
- Soueidan : aria-live ticker
- Pope : ticker simplifié
- Carmack : lazy Tone.js
- Yanis : objectif tour-courant ou disclosure

**Argus arbitre** : **disclosure ressources** (3 voix sur 6 + cohérence avec FG-4 a11y).

---

## Coda

> *« Le cockpit dit 'je suis sérieux' avant de dire 'je suis jouable'. C'est une promesse à inverser. La sobriété est la promesse, la richesse est la récompense. Pas l'inverse. »*
>
> — Argus, FG-1
