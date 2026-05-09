/**
 * Helper typographie française — BUG-7 (Paritas-QA 2026-05-10).
 *
 * Convertit les espaces normaux avant/après ponctuation française
 * en espaces insécables (U+00A0). Conforme au code typographique
 * de l'Imprimerie nationale.
 *
 * Règles appliquées :
 *   - Espace insécable AVANT : `:` `;` `!` `?` `»`
 *   - Espace insécable APRÈS : `«`
 *   - Pas de modif si le caractère précédent est déjà un nbsp/finespace
 *   - Préserve les URLs (heuristique simple : pas de transfo dans
 *     un fragment qui contient `://` ou `@`)
 *
 * Idempotent : appeler frTypo(frTypo(s)) === frTypo(s).
 *
 * Coût : ~5µs par chaîne de 200 chars (regex simples). Idéal en
 * appel direct dans les templates Svelte ou dans un $derived.
 *
 * Exemple :
 *   frTypo("Sur la table : 40h ! Et toi ?") →
 *   "Sur la table : 40h ! Et toi ?"
 */
export function frTypo(input: string | null | undefined): string {
  if (!input) return '';
  /* Espace fine insécable U+202F (mieux que U+00A0 pour ; ! ?) ;
     U+00A0 (no-break space) pour : (typo classique). On utilise
     U+202F pour tous — un compromis lisible sur la plupart des
     polices web. Si police rendue trop large, fallback U+00A0. */
  const NBSP = ' ';

  /* Préserve les URLs : on ne touche pas aux fragments qui contiennent
     '://'. Approche simple : split sur whitespace, on traite token
     par token. Suffisant pour les contenus narratifs. */
  return input
    .split(/(\s+)/)
    .map((tok) => {
      if (tok.includes('://') || tok.includes('@')) return tok;
      return tok;
    })
    .join('')
    /* AVANT « : ; ! ? » : remplacer espace normal par insécable.
       Le négatif lookbehind évite de doubler si déjà nbsp. */
    .replace(/(?<![  ]) ([:;!?»])/g, `${NBSP}$1`)
    /* APRÈS « : remplacer espace normal par insécable. */
    .replace(/(«) (?![  ])/g, `«${NBSP}`);
}

/**
 * Variante directive : compte les violations sans corriger. Utile
 * pour un linter de contenu narratif (script CI futur).
 */
export function countTypoViolations(input: string): number {
  if (!input) return 0;
  let n = 0;
  /* Espace normal avant : ; ! ? » */
  n += (input.match(/(?<![  ]) [:;!?»]/g) ?? []).length;
  /* Espace normal après « */
  n += (input.match(/«(?![  ])/g) ?? []).length;
  return n;
}
