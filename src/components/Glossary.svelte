<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { GLOSSARY, glossaryLookup } from '../game/content/glossary';

  interface Props {
    open: boolean;
    onClose: () => void;
    /** Terme à mettre en focus à l'ouverture (depuis un clic GlossaryText). */
    focusTerm?: string | null;
  }
  let { open, onClose, focusTerm = null }: Props = $props();

  let query = $state('');
  let openId = $state<string | null>(null);

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLOSSARY;
    return GLOSSARY.filter(
      e =>
        e.term.toLowerCase().includes(q) ||
        e.definition.toLowerCase().includes(q) ||
        (e.marker?.toLowerCase().includes(q) ?? false)
    );
  });

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) onClose();
  }

  function toggle(term: string) {
    openId = openId === term ? null : term;
  }

  /* Quand la modale s'ouvre AVEC un terme focus, on : reset le filtre,
     déplie l'entrée demandée, et défile vers elle. */
  $effect(() => {
    if (!open || !focusTerm) return;
    const entry = glossaryLookup(focusTerm);
    if (!entry) return;
    query = '';
    openId = entry.term;
    // Délai pour laisser la modale apparaître avant de scroller
    queueMicrotask(() => {
      setTimeout(() => {
        const el = document.getElementById(`gloss-entry-${slugify(entry.term)}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
    });
  });

  function slugify(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
</script>

<svelte:window onkeydown={onKey} />

{#if open}
  <div
    class="modal-backdrop"
    onclick={onClose}
    role="presentation"
    in:fade={{ duration: 200 }}
  >
    <div
      class="modal-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gloss-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      in:fly={{ y: 8, duration: 240 }}
    >
      <header class="modal-head">
        <h2 id="gloss-title" class="font-display text-xl text-gold leading-tight">Glossaire</h2>
        <button type="button" class="close-btn" onclick={onClose} aria-label="Fermer">×</button>
      </header>

      <input
        type="search"
        bind:value={query}
        placeholder="Chercher un terme : Unédic, Matignon, Le Chapelier…"
        class="search"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />

      <div class="toolbar">
        <button type="button" class="tool-btn" onclick={() => window.print()} title="Imprimer le glossaire pour la formation paritaire">
          Imprimer
        </button>
      </div>

      <ul class="entry-list">
        {#each filtered as e (e.term)}
          <li id={`gloss-entry-${slugify(e.term)}`}>
            <button type="button" class="entry-head" onclick={() => toggle(e.term)} data-open={openId === e.term}>
              <span class="entry-term">{e.term}</span>
              {#if e.marker}
                <em class="entry-marker">{e.marker}</em>
              {/if}
              <span class="chev">{openId === e.term ? '−' : '+'}</span>
            </button>
            <p class="entry-def" data-visible={openId === e.term}>{e.definition}</p>
          </li>
        {/each}
        {#if filtered.length === 0}
          <li class="empty">Aucun terme ne correspond.</li>
        {/if}
      </ul>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(13, 16, 20, 0.85);
    backdrop-filter: blur(2px);
    padding: 1rem;
  }

  .modal-card {
    width: 100%;
    max-width: 36rem;
    max-height: 88vh;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(200, 155, 60, 0.45);
    border-radius: 0.85rem;
    background: linear-gradient(180deg, #1a1f26, #232a33);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.04);
    padding: 1.2rem 1.3rem;
    color: #ede4c9;
  }

  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.85rem;
    border-bottom: 1px solid rgba(237, 228, 201, 0.12);
    padding-bottom: 0.65rem;
    margin-bottom: 0.65rem;
  }

  .close-btn {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.4rem;
    background: transparent;
    color: rgba(237, 228, 201, 0.7);
    font-size: 1.3rem;
    line-height: 1;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;
  }

  .close-btn:hover {
    border-color: rgba(244, 213, 139, 0.5);
    color: #f4d58b;
  }

  .search {
    width: 100%;
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.45rem;
    background: rgba(13, 16, 20, 0.55);
    color: #ede4c9;
    padding: 0.55rem 0.7rem;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.86rem;
    margin-bottom: 0.7rem;
  }

  .search:focus {
    outline: none;
    border-color: rgba(244, 213, 139, 0.6);
  }

  .entry-list {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .entry-list li.empty {
    color: rgba(237, 228, 201, 0.5);
    font-style: italic;
    font-size: 0.86rem;
    text-align: center;
    padding: 1rem 0;
  }

  .entry-head {
    display: flex;
    align-items: baseline;
    gap: 0.55rem;
    width: 100%;
    border: 1px solid rgba(237, 228, 201, 0.1);
    border-radius: 0.45rem;
    background: rgba(13, 16, 20, 0.32);
    padding: 0.5rem 0.7rem;
    color: #ede4c9;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .entry-head:hover {
    border-color: rgba(244, 213, 139, 0.5);
    background: rgba(201, 154, 64, 0.06);
  }

  .entry-head[data-open='true'] {
    border-color: rgba(244, 213, 139, 0.6);
    background: rgba(201, 154, 64, 0.1);
  }

  .entry-term {
    flex: 1;
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.82rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .entry-marker {
    color: rgba(237, 228, 201, 0.6);
    font-style: italic;
    font-size: 0.74rem;
  }

  .chev {
    color: rgba(244, 213, 139, 0.7);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1rem;
    line-height: 1;
    min-width: 0.7rem;
    text-align: center;
  }

  .entry-def {
    margin: 0.3rem 0 0.45rem 0.5rem;
    padding: 0.35rem 0.65rem 0.45rem;
    color: rgba(237, 228, 201, 0.85);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.86rem;
    line-height: 1.45;
    border-left: 2px solid rgba(244, 213, 139, 0.4);
    background: rgba(13, 16, 20, 0.4);
    border-radius: 0 0.4rem 0.4rem 0;
  }

  .entry-def[data-visible='false'] {
    display: none;
  }

  .toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-bottom: 0.55rem;
  }

  .tool-btn {
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.4rem;
    background: rgba(13, 16, 20, 0.55);
    color: rgba(237, 228, 201, 0.78);
    padding: 0.35rem 0.7rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;
  }

  .tool-btn:hover {
    border-color: rgba(244, 213, 139, 0.5);
    color: #f4d58b;
  }

  /* Mode impression — rend tout le glossaire lisible sur papier blanc.
     Utile pour les formations paritaires (IFOCAS, INTEFP) qui veulent
     un livret distribué aux stagiaires. */
  @media print {
    :global(body) {
      background: white !important;
      color: black !important;
    }

    .modal-backdrop {
      position: static !important;
      background: white !important;
      backdrop-filter: none !important;
      padding: 0 !important;
    }

    .modal-card {
      max-width: 100% !important;
      max-height: none !important;
      box-shadow: none !important;
      background: white !important;
      color: black !important;
      border: 0 !important;
      padding: 0 !important;
    }

    .close-btn,
    .search,
    .toolbar {
      display: none !important;
    }

    .entry-list {
      overflow: visible !important;
      gap: 0.4rem !important;
    }

    .entry-head {
      background: white !important;
      border-color: #ccc !important;
      page-break-inside: avoid;
    }

    .entry-term {
      color: black !important;
    }

    .entry-marker {
      color: #555 !important;
    }

    .chev {
      display: none !important;
    }

    .entry-def,
    .entry-def[data-visible='false'] {
      display: block !important;
      background: white !important;
      color: black !important;
      border-left-color: #999 !important;
      page-break-inside: avoid;
    }
  }
</style>
