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

  /** Onglet ouvert dans le cockpit (`null` = aucun, sinon id du tab).
   *  Réservé aux MINI-JEUX lourds qui ouvrent un drawer plein écran. */
  openTab = $state<string | null>(null);

  /** Popover ouvert (`null` = aucun). Différent de openTab : un
   *  popover est ancré au déclencheur (rail), beaucoup plus léger
   *  qu'un drawer. Mutuellement exclusif avec openTab. */
  openPopover = $state<{ id: string; side: 'left' | 'right' } | null>(null);

  setEnabled(v: boolean) {
    this.enabled = v;
    if (!v) {
      this.openTab = null;
      this.openPopover = null;
    }
    try { localStorage.setItem(KEY, String(v)); } catch { /* ignore */ }
  }

  toggle() {
    this.setEnabled(!this.enabled);
  }

  /** Ouvre un onglet (drawer mini-jeu). Ferme le popover ouvert. */
  open(tabId: string) {
    this.openPopover = null;
    this.openTab = this.openTab === tabId ? null : tabId;
  }

  close() {
    this.openTab = null;
    this.openPopover = null;
  }

  /** Ouvre un popover (rail). Toggle si même id, ferme l'autre rail. */
  openRail(id: string, side: 'left' | 'right') {
    this.openTab = null;
    if (this.openPopover?.id === id) {
      this.openPopover = null;
    } else {
      this.openPopover = { id, side };
    }
  }
}

export const cockpit = new CockpitStore();
