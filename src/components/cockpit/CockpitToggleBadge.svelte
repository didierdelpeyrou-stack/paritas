<script lang="ts">
  /* Badge flottant TOUJOURS visible — bouton de bascule
     cockpit ↔ classique. Existe pour s'assurer que le user
     peut activer/désactiver à tout moment, même si Settings
     n'est pas accessible.

     Retour live test patronat (P0 §3) : un clic accidentel sur
     ⊟ éjectait le joueur sans confirmation. On ajoute une modale
     « Tu vas perdre la vue cockpit » avant de basculer.

     Sous 768px, le mode classique est forcé par App.svelte
     (cockpitEffective). Le badge est donc masqué pour ne pas
     proposer un toggle sans effet. */
  import { cockpit } from '$lib/stores/cockpit.svelte';

  let isMobile = $state(false);
  let showConfirm = $state(false);

  $effect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => { isMobile = mq.matches; };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  });

  function onClick() {
    /* Si on est en cockpit → demander confirmation avant de
     * passer en classique (le geste est destructif visuellement,
     * pas pour la save). Sinon (classique → cockpit) c'est un
     * upgrade visuel : on bascule direct. */
    if (cockpit.enabled) {
      showConfirm = true;
    } else {
      cockpit.toggle();
    }
  }

  function confirmSwitch() {
    cockpit.toggle();
    showConfirm = false;
  }

  function cancelSwitch() {
    showConfirm = false;
  }

  let label = $derived(cockpit.enabled
    ? '⊟ Mode classique'
    : '◆ Mode COCKPIT');
</script>

{#if !isMobile}
<button type="button"
  class="toggle-badge"
  class:on={cockpit.enabled}
  onclick={onClick}
  title={cockpit.enabled
    ? 'Basculer vers le mode classique'
    : 'Activer le mode cockpit'}
>
  {label}
</button>

{#if showConfirm}
  <div class="confirm-backdrop" onclick={cancelSwitch} role="presentation">
    <div class="confirm-card"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="confirm-title">
      <h3 id="confirm-title">Quitter le mode cockpit ?</h3>
      <p>
        Tu vas basculer vers l'interface <strong>classique</strong> (lecture
        narrative simple, sans cadrans ni instruments). Ta partie est
        conservée — tu peux revenir au cockpit à tout moment.
      </p>
      <div class="confirm-actions">
        <button type="button" class="btn-cancel" onclick={cancelSwitch}>
          Annuler
        </button>
        <button type="button" class="btn-confirm" onclick={confirmSwitch}>
          Passer en classique
        </button>
      </div>
    </div>
  </div>
{/if}
{/if}

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

  .confirm-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(13, 16, 20, 0.72);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .confirm-card {
    background: linear-gradient(180deg, #2A1A0E 0%, #1A1108 100%);
    border: 1px solid #C9B26A;
    border-radius: 0.6rem;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
    padding: 1.5rem;
    max-width: 28rem;
    color: #F4D58C;
  }

  .confirm-card h3 {
    margin: 0 0 0.75rem 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.1rem;
    letter-spacing: 0.04em;
  }

  .confirm-card p {
    margin: 0 0 1.25rem 0;
    color: #E8D7A8;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .confirm-card strong {
    color: #F4D58C;
  }

  .confirm-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  .btn-cancel,
  .btn-confirm {
    padding: 0.5rem 1rem;
    border-radius: 0.3rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: filter 0.18s ease;
  }

  .btn-cancel {
    background: transparent;
    color: #E8D7A8;
    border: 1px solid #6b5530;
  }

  .btn-cancel:hover {
    background: rgba(201, 178, 106, 0.08);
  }

  .btn-confirm {
    background: linear-gradient(180deg, #c89b3c 0%, #a87a26 100%);
    color: #0d1014;
    border: 1px solid #c89b3c;
  }

  .btn-confirm:hover {
    filter: brightness(1.1);
  }
</style>
