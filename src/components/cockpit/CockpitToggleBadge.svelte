<script lang="ts">
  /* Badge flottant TOUJOURS visible — bouton de bascule
     cockpit ↔ classique. Existe pour s'assurer que le user
     peut activer/désactiver à tout moment, même si Settings
     n'est pas accessible. */
  import { cockpit } from '$lib/stores/cockpit.svelte';

  function toggle() {
    cockpit.toggle();
    /* Hard reload pour repartir clean — évite les bugs de
     * réactivité Svelte 5 lors du swap GameShell/CockpitShell.
     * 250ms pour laisser le localStorage se persister. */
    setTimeout(() => window.location.reload(), 250);
  }

  let label = $derived(cockpit.enabled
    ? '⊟ Mode classique'
    : '◆ Mode COCKPIT');
</script>

<button type="button"
  class="toggle-badge"
  class:on={cockpit.enabled}
  onclick={toggle}
  title={cockpit.enabled
    ? 'Basculer vers le mode classique (avec rechargement)'
    : 'Activer le mode cockpit (avec rechargement)'}
>
  {label}
</button>

<style>
  .toggle-badge {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 9999;
    padding: 0.4rem 0.85rem;
    background: linear-gradient(180deg, #c89b3c 0%, #a87a26 100%);
    color: #0d1014;
    border: 1px solid #c89b3c;
    border-radius: 0.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow:
      0 4px 14px rgba(122, 30, 27, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transition: filter 0.18s ease, transform 0.18s ease;
  }

  .toggle-badge:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .toggle-badge.on {
    background: linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
    color: #F4D58C;
    border-color: #C9B26A;
  }

  @media (max-width: 600px) {
    .toggle-badge {
      top: 8px;
      right: 8px;
      font-size: 0.7rem;
      padding: 0.3rem 0.6rem;
    }
  }
</style>
