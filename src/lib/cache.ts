/**
 * ORDA-021 PARITAS — utilitaires anti-cache (DX)
 *
 * Centralise la logique de purge des caches navigateur :
 *   - Caches API (Service Worker / fetch cache)
 *   - Service Workers enregistrés
 *   - Cache HTTP (via cache-bust URL au reload)
 *
 * IMPORTANT : ne touche PAS à localStorage (les sauvegardes du jeu
 * restent intactes — paritas_save_v1, paritas_rebirth_save_slot_*,
 * paritas_text_size, etc.).
 *
 * Consommé par :
 *   - DevVersionBadge.svelte (clic sur le badge dev)
 *   - App.svelte (raccourci clavier Shift+R global)
 *   - Settings.svelte (bouton "Vider le cache et recharger")
 */

/** Vide tous les caches API et SW enregistrés. Ne reload pas. */
export async function purgeCaches(): Promise<void> {
  try {
    /* 1. Caches API (Service Workers / fetch cache) */
    if (typeof caches !== 'undefined') {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    /* 2. Service Workers enregistrés */
    if (typeof navigator !== 'undefined' && navigator.serviceWorker?.getRegistrations) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
  } catch {
    /* ignore — best effort */
  }
}

/** Recharge la page en bypassant le cache HTTP via cache-bust URL. */
export function hardReloadCacheBust(): void {
  if (typeof window === 'undefined') return;
  const sep = window.location.href.includes('?') ? '&' : '?';
  window.location.href = `${window.location.href}${sep}_t=${Date.now()}`;
}

/** Combo : purge tous les caches puis hard reload. À utiliser sur un
 *  événement utilisateur (clic, raccourci) car le href change. */
export async function purgeCacheAndReload(): Promise<void> {
  await purgeCaches();
  hardReloadCacheBust();
}
