<script lang="ts">
  /**
   * Sélecteur de slot de sauvegarde — UX-#9.
   *
   * 3 slots indépendants. Chaque slot affiche son aperçu (nom, camp,
   * tour, trait dominant, institutions). Cliquer un slot avec partie
   * → reprendre. Cliquer un slot vide → nouvelle partie. Bouton
   * supprimer pour ré-utiliser un slot rempli.
   */
  import { fade } from 'svelte/transition';
  import { readSlotMeta, setActiveSlot, deleteSlot, type SlotMeta } from '../../game/engine/gameState.svelte';
  import { TRAIT_LABELS } from '../../game/narrative/personalityEngine';
  import type { PlayerTrait } from '../../game/types';

  interface Props {
    onPick: (action: 'continue' | 'new', slot: 1 | 2 | 3) => void;
  }
  let { onPick }: Props = $props();

  let metas = $state<SlotMeta[]>([]);
  refresh();

  function refresh() {
    metas = [readSlotMeta(1), readSlotMeta(2), readSlotMeta(3)];
  }

  function pick(meta: SlotMeta) {
    setActiveSlot(meta.slot);
    onPick(meta.empty ? 'new' : 'continue', meta.slot);
  }

  function confirmDelete(slot: 1 | 2 | 3, e: Event) {
    e.stopPropagation();
    if (!confirm(`Supprimer définitivement la partie du slot ${slot} ?`)) return;
    deleteSlot(slot);
    refresh();
  }
</script>

<div class="slot-picker" in:fade={{ duration: 240 }}>
  <h2 class="font-display text-xl text-gold">Reprendre ou commencer</h2>
  <p class="text-xs italic text-parchment-dim/70 mb-2">
    Trois sauvegardes indépendantes. Tu peux mener plusieurs trajectoires en parallèle.
  </p>

  <div class="slots">
    {#each metas as m (m.slot)}
      <div class="slot-wrap">
        <button
          type="button"
          class="slot"
          data-empty={m.empty}
          data-camp={m.camp}
          onclick={() => pick(m)}
        >
          <div class="slot-num">Slot {m.slot}</div>

          {#if m.empty}
            <div class="slot-empty">+ Nouvelle partie</div>
          {:else}
            <div class="slot-name">{m.name ?? '—'}</div>
            <div class="slot-meta">
              <span class="camp-tag">{m.camp === 'patron' ? 'Patronat' : 'Salariat'}</span>
              <span>·</span>
              <span>T{m.turn}/100</span>
            </div>
            <div class="slot-trait">
              Trait : <b>{m.dominantTrait ? TRAIT_LABELS[m.dominantTrait as PlayerTrait] : '—'}</b>
            </div>
            <div class="slot-inst">
              {m.institutions} institution{(m.institutions ?? 0) > 1 ? 's' : ''} construite{(m.institutions ?? 0) > 1 ? 's' : ''}
            </div>
          {/if}
        </button>
        {#if !m.empty}
          <button
            type="button"
            class="slot-del"
            onclick={(e) => confirmDelete(m.slot, e)}
            aria-label={`Supprimer la partie du slot ${m.slot}`}
            title="Supprimer cette partie"
          >×</button>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .slot-picker {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .slots {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.7rem;
    margin-top: 0.5rem;
  }

  @media (min-width: 640px) {
    .slots {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .slot-wrap {
    position: relative;
  }

  .slot {
    width: 100%;
    text-align: left;
    border: 1px solid rgba(237, 228, 201, 0.15);
    border-radius: 0.7rem;
    background: rgba(13, 16, 20, 0.4);
    padding: 0.85rem 0.95rem;
    color: #ede4c9;
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
    min-height: 9rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .slot:hover {
    border-color: rgba(244, 213, 139, 0.55);
    background: rgba(201, 154, 64, 0.07);
    transform: translateY(-1px);
  }

  .slot[data-camp='salarie'] {
    border-left: 3px solid #c0392b;
  }

  .slot[data-camp='patron'] {
    border-left: 3px solid #2e5e8a;
  }

  .slot[data-empty='true'] {
    border-style: dashed;
    background: transparent;
    justify-content: center;
    align-items: center;
  }

  .slot-num {
    color: rgba(244, 213, 139, 0.65);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .slot-empty {
    color: rgba(237, 228, 201, 0.55);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.86rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .slot-name {
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.05rem;
    line-height: 1.2;
  }

  .slot-meta {
    display: flex;
    gap: 0.3rem;
    color: rgba(237, 228, 201, 0.65);
    font-size: 0.75rem;
  }

  .camp-tag {
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
  }

  .slot-trait {
    color: rgba(237, 228, 201, 0.78);
    font-size: 0.78rem;
  }

  .slot-trait b {
    color: #ede4c9;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
  }

  .slot-inst {
    color: rgba(237, 228, 201, 0.6);
    font-size: 0.74rem;
    font-style: italic;
  }

  .slot-del {
    position: absolute;
    top: 0.45rem;
    right: 0.55rem;
    width: 1.4rem;
    height: 1.4rem;
    border: 1px solid rgba(224, 122, 110, 0.28);
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.55);
    color: rgba(224, 122, 110, 0.7);
    font-size: 0.95rem;
    line-height: 1;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
  }

  .slot-del:hover {
    border-color: #dc2626;
    color: #fca5a5;
    background: rgba(127, 29, 29, 0.4);
  }
</style>
