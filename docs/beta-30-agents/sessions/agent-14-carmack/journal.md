# Journal — Agent 14 / John Carmack
## Session bêta-test PARITAS · v2.2.2-prebeta · 2026-05-08

> *"Determinism is not a feature. It's a precondition. If two players with the same seed get different outcomes, you don't have a game — you have a slot machine you forgot to label."*

## Setup

Galaxy A53 émulé hors-cadre cette session : la mission s'est recentrée sur le bulletin ORDA-008 (rebuttal Ghys, fuites RNG Elections+Confrontation). Lentille déterminisme PRNG, pas FPS. Build `HEAD 0813c75` v2.2.2-prebeta. 376 Vitest verts vérifiés en `1.17s` localement. Bundle gzip 147.62 KB (cible <300 KB ✅).

## Audit du noyau PRNG

`src/lib/seed.ts:24-56` — xorshift32 + FNV-1a 32-bit. Période ~4×10⁹, isolation par `scope`, `state===0` clampé à 1. Deux appels à `seededRandom('CARMACK-001', 'monte-carlo')` produisent la même séquence : vérifié, **bit-exact**. Le noyau est correct. Pas de Math.random caché, pas de Date.now, pas de leak via `crypto.getRandomValues`. C'est propre.

## Test reproductibilité — Élections

J'ai joué deux parties IA-vs-IA scriptées, même seed `CARMACK-001`, scope `session`. `setElectionsRng(seededRandom(...))` posé en module-level avant `startElectionSession`. Trois scrutins, allocations IA via `aiElectionAlloc`, `resolveScrutin`+`nextScrutin`. Run A et Run B : `{sT:8, pT:13, outcome:'patron_majorite'}` identique. **Reproductible**. L'override module-level (`elections/engine.ts:70-76`) fonctionne. Pareil sur Confrontation (`confrontation/engine.ts:413-419`) : même mécanisme, même propreté.

## Test reproductibilité — NAO (le moment marquant)

J'ai cherché `setNaoRng`. **Il n'existe pas**. J'ai grepé les leaks : `nao/engine.ts:782-783, 809` — trois `Math.random()` purs, non-overridables :

```ts
// nao/engine.ts:782
if (!tactic && available.length > 0 && Math.random() > 0.55) {
  tactic = available[Math.floor(Math.random() * available.length)];
// nao/engine.ts:809
const ROLL = () => Math.random();
```

Le commentaire ORDA-001 R1 (lignes 798-807) explique que cette variance stochastique est **intentionnelle** pour produire des `pv_desaccord` ≥5%. Mais le hook seed n'a jamais été ajouté. J'ai joué 5 parties IA-vs-IA depuis le même état initial : 3 outcomes différents (`accord_majoritaire` x3, `pv_desaccord` x1, `accord_minoritaire` x1). **NAO n'est pas reproductible**. Le script `scripts/orda-001-nao-mc.mjs` n'appelle aucun setter — il ne pouvait pas, le setter manque. Le bulletin ORDA-008 §VI affirme "RNG seedé partout sur boucle de jeu 🟢 overridable". **C'est faux pour NAO**, qui est l'atelier 1 du jeu.

## Couverture des tests

Les tests Vitest des engines ne *vérifient* pas la reproductibilité. `elections/engine.test.ts` ne contient aucun appel à `setElectionsRng`. Idem `confrontation/engine.test.ts`. Les hooks existent en code de prod mais ne sont *jamais* exercés en CI. Si quelqu'un casse `setElectionsRng` demain (régression silencieuse), aucun test ne le détecte. C'est un déterminisme "garanti" sans canari.

## Autres leaks audités

`playerProfile.ts:67` — UUID via Math.random. Acceptable (identité, pas gameplay).
`factionBrawl.ts:330-336` — `Math.random` *avec fallback documenté* ; bon pattern mais pas seedé par défaut.
Composants UI (Confetti, BrawlArena, ManifSimulator, SkillSlot) — Math.random pour effets visuels. Hors scope déterminisme moteur.

## Verdict

Le noyau PRNG est solide. Elections + Confrontation sont reproductibles via override module-level. **NAO est un trou** : 3 leaks non-overridables, 0 setter, 1 script MC qui ment sur sa reproductibilité. Et **aucun test Vitest ne valide la reproductibilité** des engines déjà fixés — la régression du fix Ghys ORDA-008 passerait silencieusement en CI.

## Biais reconnu

J'ignore complètement la beauté, la narration, l'ergonomie. Je n'ai joué aucun "vrai" tour. Mon échantillonnage est uniquement IA-vs-IA scripté. Un humain qui joue à PARITAS en tirage manuel ne verra jamais cette friction — elle frappe seulement les replays, l'audit Argus, et la bêta-test reproductible. Mais pour un serious game qui prétend tenir une doctrine V3 "RNG seedé partout", c'est un mensonge de doctrine.
