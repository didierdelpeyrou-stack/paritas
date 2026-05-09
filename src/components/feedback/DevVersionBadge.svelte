<script lang="ts">
  /* ORDA-021 P0 (DX anti-cache) — Badge version visible en mode dev.
     Coup d'œil bas-droite : `dev — 11h42:38` ou `BUILD 2026-05-09T20:44:25Z`.
     Permet de vérifier instantanément qu'on n'est pas sur un cache stale.
     Click → purgeCacheAndReload() (même comportement que Settings).
     En production : ne s'affiche pas. */

  /* import.meta.env.DEV est true en dev, false en build prod */
  const isDev = import.meta.env.DEV;

  /* __BUILD_VERSION__ injecté par vite.config.ts au build (ISO UTC).
     En dev, on affiche l'heure de chargement de la page (proxy du
     « moment où Vite a recompilé »). */
  const buildVersion: string = (typeof __BUILD_VERSION__ !== 'undefined'
    ? __BUILD_VERSION__
    : new Date().toISOString().replace(/\.\d+Z$/, 'Z'));

  /* Affichage compact : juste l'heure si dev, ISO court si prod-preview. */
  const display = $derived(
    isDev
      ? `dev · ${new Date().toLocaleTimeString('fr-FR')}`
      : buildVersion.replace('T', ' ').replace('Z', '')
  );

  let busy = $state(false);
  async function purgeAndReload() {
    if (busy) return;
    busy = true;
    try {
      if (typeof caches !== 'undefined') {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if (navigator.serviceWorker?.getRegistrations) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch { /* ignore */ }
    /* Cache-bust URL puis reload pour bypasser le cache HTTP. */
    const sep = window.location.href.includes('?') ? '&' : '?';
    window.location.href = `${window.location.href}${sep}_t=${Date.now()}`;
  }
</script>

{#if isDev}
  <button
    type="button"
    class="dev-badge"
    onclick={purgeAndReload}
    aria-label="Vider le cache et recharger"
    title="Cliquer pour purger le cache + reload (équivalent Cmd+Shift+R + Caches API)"
  >
    <span class="dot" aria-hidden="true"></span>
    <span class="label">{display}</span>
  </button>
{/if}

<style>
  .dev-badge {
    position: fixed;
    bottom: 0.5rem;
    right: 0.5rem;
    z-index: 9999;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.55rem;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(244, 213, 139, 0.3);
    border-radius: 0.4rem;
    color: rgba(244, 213, 139, 0.85);
    font-family: 'Source Code Pro', 'Courier New', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.04em;
    cursor: pointer;
    opacity: 0.4;
    transition: opacity 0.15s ease, border-color 0.15s ease;
  }
  .dev-badge:hover {
    opacity: 1;
    border-color: rgba(244, 213, 139, 0.7);
  }
  .dev-badge .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px rgba(74, 222, 128, 0.6);
    animation: dev-pulse 2s ease-in-out infinite;
  }
  @keyframes dev-pulse {
    0%, 100% { opacity: 0.7; }
    50%      { opacity: 1; }
  }

  /* a11y : écran lecteur n'a pas besoin du badge (il n'apporte pas
     de contenu utile). Bouton sémantique reste accessible si besoin. */
  @media (prefers-reduced-motion: reduce) {
    .dev-badge .dot { animation: none; }
  }
</style>
