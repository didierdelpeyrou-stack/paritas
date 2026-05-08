# Rébuttal Argus — P0-4 (Agent Ghys, audit RNG)

**Date** : 2026-05-08 (J+13)
**Origine** : `BULLETIN_ARGUS_PRE_BETA_2026-05-08_AM.md` § Désaccord Ghys
**Statut** : verdict ajusté, Ghys partiellement validé.

---

## Verdict de l'agent Ghys (#08)

> *« Tour 3 — divergence seed=42, fuite de Math.random() à `gameState.svelte.ts:~142`. »*

→ Fix prioritaire annoncé : remplacer `Math.random()` par `seededRandom()` à `gameState.svelte.ts:~142`.

---

## Vérification du Maréchal

```bash
$ grep -n "Math.random" src/game/engine/gameState.svelte.ts
(aucun résultat)
```

**`gameState.svelte.ts` ne contient aucun `Math.random()`.** Ghys s'est trompé sur la localisation.

---

## MAIS sa lentille pointait juste

Audit étendu à tout `src/game/` :

| Fichier:ligne | Usage | Sévérité |
|---------------|-------|---------:|
| `ateliers/elections/engine.ts:154` | Tirage 50/50 sur égalité de canal — fix Argus R1 ORDA-001 | 🟠 P1 |
| `ateliers/elections/engine.ts:277, 282, 285, 294, 302, 303` | IA `aiElectionAlloc` — 7 occurrences | 🟠 P1 |
| `ateliers/confrontation/engine.ts:415, 423` | IA `aiPolice`/`aiManif` extraites ORDA-006 | 🟠 P1 |
| `learning/playerProfile.ts:67` | Génération d'ID joueur (UUID-like) | 🟢 OK (hors boucle de jeu) |
| `org/factionBrawl.ts:336` | Fallback explicite si pas de seed (documenté) | 🟢 OK |

**Bilan** :
- 9 fuites RNG **dans la boucle de jeu** (Elections + Confrontation IA)
- 2 usages **hors boucle de jeu** (génération ID, fallback explicite)

Ghys s'est trompé de fichier mais sa thèse est juste : la doctrine V3 « RNG seedé partout sur boucle de jeu » n'est pas tenue à 100 %.

---

## Décision Argus

**P0-4 reclassé en P1-15 (j-h additionnel)** :

Le bulletin matinal annonçait `gameState.svelte.ts:~142` comme fix P0 bloquant la bêta. Vérification : la fuite n'est pas là. **Pas de P0 réel à clore.**

Mais 9 fuites RNG dans Elections + Confrontation IA méritent une intervention en **P1**, sans bloquer la bêta privée :

```
P1-15 (NOUVEAU) — Fuites RNG ateliers PvP
├── Elections/engine.ts (7 sites) → seededRandom via NaoRng injecté
├── Confrontation/engine.ts:415, 423 → idem
├── Effort : 2 j-h
└── Bénéfice : reproductibilité 100 % engines PvP
```

**Conséquence sur le calendrier ORDA-008** :
- 5 P0 deviennent **4 P0** (3.3 j-h restants)
- P1 grandit de 15 → 16 fixes (effort total ~25.8 j-h)

---

## Reconnaissance du biais

L'agent Ghys avait **reconnu son biais** dans sa fiche :
> *« Je peux être trop pointilleux sur le déterminisme — un joueur ordinaire ne le verra jamais. »*

Honnêteté Argus : la pointilleuse fonctionne. La localisation a glissé d'un tiroir, le diagnostic global tient. **Crédit Ghys conservé pour le futur cycle.**

---

> *« Un agent qui se trompe de fichier mais qui voit juste sur la doctrine vaut mieux qu'un agent qui cite parfaitement un fichier sans rien voir. La boussole de Ghys est calibrée. »*
>
> — Argus, J+13
