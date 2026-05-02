<script lang="ts">
  import { GLOSSARY, glossaryLookup } from '../game/content/glossary';

  interface Props {
    text: string;
    /** Pas de match sur les très petits termes (évite les faux positifs). */
    minTermLength?: number;
  }
  let { text, minTermLength = 4 }: Props = $props();

  /* Pré-trie par longueur décroissante : « charte d'amiens » avant
     « charte », pour que la regex matche d'abord les expressions
     longues. Échappe les caractères spéciaux. */
  const TERMS = GLOSSARY
    .map(e => e.term)
    .filter(t => t.length >= minTermLength)
    .sort((a, b) => b.length - a.length);

  function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* Pattern unique : tous les termes en alternance, capturé.
     Drapeau `i` pour la casse, `g` pour le scan. Frontières souples :
     les apostrophes typographiques (’) et tirets sont autorisés
     dans/autour. */
  const pattern = new RegExp(
    `(?:^|(?<=[\\s.,;:!?'"’«»()\\[\\]—-]))(${TERMS.map(escapeRegex).join('|')})(?=[\\s.,;:!?'"’«»()\\[\\]—-]|$)`,
    'gi'
  );

  type Segment = { kind: 'text' | 'term'; value: string; def?: string; marker?: string };

  const segments = $derived.by<Segment[]>(() => {
    const out: Segment[] = [];
    let lastIndex = 0;
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      const matched = m[1];
      const start = m.index + (m[0].length - matched.length);
      if (start > lastIndex) {
        out.push({ kind: 'text', value: text.slice(lastIndex, start) });
      }
      const entry = glossaryLookup(matched);
      if (entry) {
        out.push({
          kind: 'term',
          value: matched,
          def: entry.definition,
          marker: entry.marker
        });
      } else {
        out.push({ kind: 'text', value: matched });
      }
      lastIndex = start + matched.length;
    }
    if (lastIndex < text.length) {
      out.push({ kind: 'text', value: text.slice(lastIndex) });
    }
    return out;
  });
</script>

{#each segments as s, i (i)}
  {#if s.kind === 'term'}
    <span
      class="gloss"
      title={s.marker ? `${s.def} (${s.marker})` : s.def}
    >{s.value}</span>
  {:else}
    {s.value}
  {/if}
{/each}

<style>
  .gloss {
    border-bottom: 1px dashed rgba(244, 213, 139, 0.55);
    cursor: help;
  }

  .gloss:hover {
    border-bottom-color: #f4d58b;
    color: #f4d58b;
  }
</style>
