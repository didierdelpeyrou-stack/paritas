<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { GLOSSARY } from '../game/content/glossary';

  interface Props {
    open: boolean;
    onClose: () => void;
  }
  let { open, onClose }: Props = $props();

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

      <ul class="entry-list">
        {#each filtered as e (e.term)}
          <li>
            <button type="button" class="entry-head" onclick={() => toggle(e.term)} data-open={openId === e.term}>
              <span class="entry-term">{e.term}</span>
              {#if e.marker}
                <em class="entry-marker">{e.marker}</em>
              {/if}
              <span class="chev">{openId === e.term ? '−' : '+'}</span>
            </button>
            {#if openId === e.term}
              <p class="entry-def" in:fly={{ y: 4, duration: 200 }}>{e.definition}</p>
            {/if}
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
</style>
