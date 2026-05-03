/* ============================================================
   Paritas — toggle interface Cockpit (vague α-bis)
   ============================================================
   Active l'interface « Pupitre Paritaire » (cockpit) à la place de
   GameShell classique. Toggleable à chaud depuis Settings — l'état
   de partie est inchangé, seule la peau change.

   Spec design : V2_AVIS_MINIJEUX_TABLE.md §9.
   ============================================================ */

const KEY = 'paritas_cockpit_enabled';

function load(): boolean {
  try { return localStorage.getItem(KEY) === 'true'; } catch { return false; }
}

class CockpitStore {
  enabled = $state<boolean>(load());

  /** Onglet ouvert dans le cockpit (`null` = aucun, sinon id du tab). */
  openTab = $state<string | null>(null);

  setEnabled(v: boolean) {
    this.enabled = v;
    if (!v) this.openTab = null;
    try { localStorage.setItem(KEY, String(v)); } catch { /* ignore */ }
  }

  toggle() {
    this.setEnabled(!this.enabled);
  }

  /** Ouvre un onglet (ferme le précédent si différent). */
  open(tabId: string) {
    this.openTab = this.openTab === tabId ? null : tabId;
  }

  close() {
    this.openTab = null;
  }
}

export const cockpit = new CockpitStore();
