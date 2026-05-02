<script lang="ts">
  import { GLOSSARY, glossaryLookup } from '../game/content/glossary';

  interface Props {
    text: string;
    /** Pas de match sur les très petits termes (évite les faux positifs). */
    minTermLength?: number;
  }
  let { text, minTermLength = 4 }: Props = $props();

  /* Le clic émet un événement global capté par GameShell, qui ouvre
     la modale Glossary et défile sur le terme demandé. */
  function openGlossaryAt(term: string) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('paritas-open-glossary', { detail: { term } })
    );
  }

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
    <button
      type="button"
      class="gloss"
      title={s.marker ? `${s.def} (${s.marker})` : s.def}
      onclick={(e) => { e.stopPropagation(); openGlossaryAt(s.value); }}
    >{s.value}</button>
  {:else}
    {s.value}
  {/if}
{/each}

<style>
  /* Vocabulaire technique du paritarisme, syndicalisme, lois et État
     français : italique systématique + pointillé doré qui ouvre la
     définition glossaire au clic.

     Convention typographique : l'italique signale le vocabulaire
     spécialisé (savant français). Le clic ouvre la modale glossaire
     positionnée sur le bon terme. */
  .gloss {
    font-style: italic;
    border: 0;
    border-bottom: 1px dashed rgba(244, 213, 139, 0.55);
    background: transparent;
    color: #f4d58b;
    cursor: pointer;
    padding: 0;
    margin: 0;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    /* Permet au bouton inline de s'intégrer dans le flux du texte
       sans bloc rectangulaire visible. */
    display: inline;
  }

  .gloss:hover,
  .gloss:focus-visible {
    border-bottom-color: #f4d58b;
    color: #fde68a;
    background: rgba(201, 154, 64, 0.08);
    border-radius: 0.15rem;
    outline: none;
  }
</style>
