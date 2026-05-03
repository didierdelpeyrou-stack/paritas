<script lang="ts">
  /* ============================================================
     CockpitPopover — menu déroulant ancré aux rails
     ============================================================
     Contenu du popover s'ouvre à droite (rail gauche) ou à gauche
     (rail droit) du cockpit. Ne prend pas tout l'écran : ~440px
     de large max, hauteur = main area, scrollable interne.

     Différent du drawer plein écran réservé aux mini-jeux lourds.
     ============================================================ */
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import CockpitIcon from './CockpitIcon.svelte';
  import type { IconKey } from './icons';

  interface Props {
    open: boolean;
    side: 'left' | 'right';
    title: string;
    icon?: IconKey;
    onClose: () => void;
    children?: import('svelte').Snippet;
  }
  let { open, side, title, icon, onClose, children }: Props = $props();

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) onClose();
  }
</script>

<svelte:window onkeydown={onKey} />

{#if open}
  <!-- Backdrop discret (pas de blur agressif — on doit voir Le Ciel) -->
  <div class="popover-backdrop"
    in:fade={{ duration: 160 }}
    out:fade={{ duration: 140 }}
    onclick={onClose}
    role="presentation"
  ></div>

  <aside
    class="popover popover-{side}"
    in:fly={{ x: side === 'left' ? -12 : 12, duration: 240, easing: cubicOut }}
    out:fly={{ x: side === 'left' ? -12 : 12, duration: 180, easing: cubicOut }}
    aria-labelledby="popover-title"
  >
    <header class="popover-head">
      {#if icon}
        <span class="popover-icon"><CockpitIcon name={icon} size={18} /></span>
      {/if}
      <h2 id="popover-title">{title}</h2>
      <button type="button" class="popover-close" onclick={onClose}
        aria-label="Fermer">×</button>
    </header>

    <div class="popover-body">
      {@render children?.()}
    </div>
  </aside>
{/if}

<style>
  .popover-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(13, 11, 8, 0.32);
    z-index: 40;
  }

  .popover {
    position: fixed;
    top: 84px;            /* sous status (48) + era timeline (36) */
    bottom: 144px;        /* au-dessus instruments (88) + action (56) */
    width: min(440px, 88vw);
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.06), transparent 65%),
      linear-gradient(180deg, #211712 0%, #150F0B 100%);
    border: 1px solid #C9B26A;
    box-shadow:
      0 0 30px rgba(0, 0, 0, 0.55),
      inset 0 1px 0 rgba(244, 213, 140, 0.08);
    z-index: 41;
    display: flex;
    flex-direction: column;
    color: #F4EFE2;
    border-radius: 0.5rem;
  }

  /* Ancrage : popover gauche s'attache au rail gauche (juste à droite),
     popover droit s'attache au rail droit (juste à gauche).
     Tabs G = 80px + Rail G = 200px = 280px → popover left start
     Idem droite */
  .popover-left {
    left: 290px;
    border-left-width: 3px;
  }

  .popover-right {
    right: 290px;
    border-right-width: 3px;
  }

  /* Ornement : petite flèche/pointe vers le rail d'origine */
  .popover-left::before,
  .popover-right::before {
    content: '';
    position: absolute;
    top: 24px;
    width: 10px;
    height: 10px;
    background: inherit;
    border: 1px solid #C9B26A;
    transform: rotate(45deg);
  }

  .popover-left::before {
    left: -6px;
    border-right: none;
    border-top: none;
  }

  .popover-right::before {
    right: -6px;
    border-left: none;
    border-bottom: none;
  }

  .popover-head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(201, 178, 106, 0.25);
    background: linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
    border-radius: 0.4rem 0.4rem 0 0;
  }

  .popover-icon {
    display: inline-flex;
    color: #C9B26A;
  }

  .popover-head h2 {
    margin: 0;
    flex: 1 1 auto;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.95rem;
    color: #F4D58C;
    letter-spacing: 0.05em;
  }

  .popover-close {
    background: transparent;
    border: 1px solid rgba(201, 178, 106, 0.3);
    color: #F4D58C;
    width: 28px;
    height: 28px;
    border-radius: 0.3rem;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
    transition: background 0.18s ease, transform 0.18s ease;
  }

  .popover-close:hover {
    background: rgba(201, 178, 106, 0.14);
    transform: scale(1.06);
  }

  .popover-body {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 0.85rem 1rem 1rem;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(201, 178, 106, 0.3) transparent;
  }

  .popover-body::-webkit-scrollbar { width: 5px; }
  .popover-body::-webkit-scrollbar-thumb { background: rgba(201, 178, 106, 0.3); border-radius: 3px; }

  /* Mobile : popover devient drawer plein largeur */
  @media (max-width: 1024px) {
    .popover {
      left: 0 !important;
      right: 0 !important;
      width: 100vw;
      top: 0;
      bottom: 0;
      border-radius: 0;
    }
    .popover::before { display: none; }
  }
</style>
