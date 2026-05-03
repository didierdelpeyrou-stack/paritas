<script lang="ts">
  /* ============================================================
     LayoutSwitcher — sélecteur de layout (post-critique designer)
     ============================================================
     Remplace l'ancien CockpitToggleBadge binaire (cockpit ↔ classique)
     par un contrôle 3-états explicite : Théâtre / Atelier / Carnet.

     Le layout est résolu en `auto` selon le viewport, mais le joueur
     peut forcer un layout — ex : Carnet sur desktop pour lecture
     concentrée. Le label « Auto · Théâtre » indique la résolution
     courante quand auto est actif.

     Cf. critique designer §Décision 1 : « Tuer le double mode
     Cockpit/Classique. Garder un seul mode, le Théâtre, et trois
     layouts. Le toggle binaire actuel entretient l'idée que Cockpit
     serait "plus" et Classique "moins". Faux : ce sont deux corps
     du même esprit. »
     ============================================================ */
  import {
    cockpit, LAYOUT_LABEL, LAYOUT_DESC, type LayoutPref, type EffectiveLayout
  } from '$lib/stores/cockpit.svelte';

  interface Props {
    /** Layout actuellement résolu (passé par App.svelte). */
    effectiveLayout: EffectiveLayout;
  }
  let { effectiveLayout }: Props = $props();

  let open = $state(false);

  const PREFS: LayoutPref[] = ['auto', 'theatre', 'atelier', 'carnet'];

  const PREF_GLYPH: Record<LayoutPref, string> = {
    auto:    '◎',
    theatre: '▣',
    atelier: '▤',
    carnet:  '▥'
  };

  function pick(p: LayoutPref) {
    cockpit.setPreference(p);
    open = false;
  }

  /* Texte du badge quand fermé : layout effectif + indicateur 'auto'
     si la préférence est auto. */
  const badgeLabel = $derived(
    cockpit.preference === 'auto'
      ? `Auto · ${LAYOUT_LABEL[effectiveLayout]}`
      : LAYOUT_LABEL[cockpit.preference]
  );
</script>

<div class="layout-wrap" class:open>
  <button
    type="button"
    class="layout-badge"
    onclick={() => (open = !open)}
    aria-haspopup="menu"
    aria-expanded={open}
    title="Choisir le layout — Théâtre (large), Atelier (moyen), Carnet (concentré). Auto = selon ton écran."
  >
    <span class="badge-glyph">{PREF_GLYPH[cockpit.preference]}</span>
    <span class="badge-label">{badgeLabel}</span>
  </button>

  {#if open}
    <div class="layout-menu" role="menu">
      {#each PREFS as p (p)}
        <button
          type="button"
          class="layout-row"
          class:active={cockpit.preference === p}
          role="menuitemradio"
          aria-checked={cockpit.preference === p}
          onclick={() => pick(p)}
        >
          <span class="row-glyph">{PREF_GLYPH[p]}</span>
          <span class="row-body">
            <span class="row-name">{LAYOUT_LABEL[p]}</span>
            <span class="row-desc">{LAYOUT_DESC[p]}</span>
          </span>
          {#if cockpit.preference === p}
            <span class="row-tick" aria-hidden="true">✓</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .layout-wrap {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 9999;
  }

  .layout-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    background: linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
    color: #F4D58C;
    border: 1px solid #C9B26A;
    border-radius: 0.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.74rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow:
      0 4px 14px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(244, 213, 140, 0.08);
    transition: filter 0.18s ease, transform 0.18s ease;
  }

  .layout-badge:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
  .layout-wrap.open .layout-badge {
    background: linear-gradient(180deg, #5A3622 0%, #3D2615 100%);
  }

  .badge-glyph { color: #C9B26A; font-size: 0.95rem; line-height: 1; }
  .badge-label { line-height: 1; }

  .layout-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 280px;
    background: linear-gradient(180deg, #2A1A0E 0%, #1A1108 100%);
    border: 1px solid #C9B26A;
    border-radius: 0.5rem;
    padding: 0.45rem;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
    display: flex;
    flex-direction: column;
    gap: 0.18rem;
  }

  .layout-row {
    display: grid;
    grid-template-columns: 1.4rem 1fr auto;
    align-items: flex-start;
    gap: 0.55rem;
    padding: 0.5rem 0.6rem;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 0.35rem;
    color: #F4EFE2;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .layout-row:hover {
    background: rgba(201, 178, 106, 0.08);
    border-color: rgba(201, 178, 106, 0.25);
  }
  .layout-row.active {
    background: rgba(201, 178, 106, 0.12);
    border-color: rgba(201, 178, 106, 0.5);
  }

  .row-glyph {
    color: #C9B26A;
    font-size: 1rem;
    line-height: 1.1;
  }
  .row-body { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
  .row-name {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #F4D58C;
  }
  .row-desc {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.74rem;
    line-height: 1.35;
    color: rgba(244, 239, 226, 0.7);
    font-style: italic;
  }
  .row-tick {
    color: #C9B26A;
    font-weight: 700;
    align-self: center;
  }

  @media (max-width: 600px) {
    .layout-wrap { top: 8px; right: 8px; }
    .layout-badge { font-size: 0.68rem; padding: 0.3rem 0.55rem; }
    .badge-label { display: none; }
    .layout-menu { right: -4px; min-width: 240px; }
  }
</style>
