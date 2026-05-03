/* ============================================================
   Paritas — PRNG seedé déterministe
   ============================================================
   Permet de rejouer une partie à l'identique (Pineau #65) à partir
   d'un même seed + d'un scope (espace de tirage). Pousse l'audit
   RCT (Duflo #94), les replays randomisés (Doudna #156), et la
   stabilité par perturbation ε (Ghys #27).

   Usage :
     const r = seededRandom(state.seed, 'rival-name');
     const idx = Math.floor(r() * pool.length);
     // r() est un PRNG infini (xorshift32) qui rend [0, 1)

   Le scope sert à isoler les flux : deux scopes différents avec le
   même seed produisent des séquences indépendantes. Cela évite la
   « cascade » où une décision modifie tous les tirages futurs.

   Note : `Math.random()` reste utilisé tant que la migration n'est
   pas complète. Voir docs/MOTEUR_SPEC.md §5.3.
   ============================================================ */

/** Hash FNV-1a 32-bit d'une chaîne — déterministe et rapide.
 *  Sert à dériver une seed numérique d'un (seed string, scope string). */
function fnv1a32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

/** PRNG xorshift32 — petit, rapide, déterministe. Période ~4×10⁹.
 *  Largement suffisant pour des tirages narratifs ; pas pour de la
 *  crypto évidemment. */
function xorshift32(seed: number): () => number {
  let state = seed | 0;
  if (state === 0) state = 1; // xorshift ne supporte pas 0
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state = state | 0;
    /* Convertit l'entier signé 32 bits en [0, 1). */
    return ((state >>> 0) / 4294967296);
  };
}

/** Construit un PRNG infini déterministe à partir du couple
 *  (seed string, scope string). Deux appels avec les mêmes
 *  arguments produisent la même séquence. Deux scopes différents
 *  produisent des séquences indépendantes. */
export function seededRandom(seed: string, scope: string): () => number {
  const numeric = fnv1a32(`${seed}::${scope}`);
  return xorshift32(numeric);
}

/** Variante : utiliser pour un tirage one-shot (équivalent
 *  Math.random() seedé). Évite de garder un PRNG vivant. */
export function seededOnce(seed: string, scope: string): number {
  return seededRandom(seed, scope)();
}

/** Tire un élément uniformément dans un tableau, déterministe. */
export function seededPick<T>(seed: string, scope: string, arr: readonly T[]): T {
  if (arr.length === 0) throw new Error('seededPick: empty array');
  const r = seededOnce(seed, scope);
  return arr[Math.floor(r * arr.length)]!;
}

/** Tire un entier dans [min, max] inclus, déterministe. */
export function seededInt(seed: string, scope: string, min: number, max: number): number {
  if (max < min) throw new Error('seededInt: max < min');
  const r = seededOnce(seed, scope);
  return min + Math.floor(r * (max - min + 1));
}
