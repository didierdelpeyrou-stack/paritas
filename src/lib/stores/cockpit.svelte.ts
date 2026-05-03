/* ============================================================
   Paritas — préférence de layout (V3, post-critique designer)
   ============================================================
   Un seul jeu, trois layouts assumés :
   - Théâtre  (≥1280px) : 3 panneaux + ticker, l'expérience pleine
   - Atelier  (768-1280px) : 2 panneaux empilés, ticker compact
   - Carnet   (≤768px) : plein écran, lecture séquentielle (ex-classique)

   Le mode est résolu en `auto` selon le viewport, mais le joueur
   peut forcer un layout (ex : préférer Carnet sur desktop pour
   une lecture concentrée). Plus de toggle binaire « cockpit on/off ».
   ============================================================ */

export type LayoutPref = 'auto' | 'theatre' | 'atelier' | 'carnet';
export type EffectiveLayout = 'theatre' | 'atelier' | 'carnet';

const KEY = 'paritas_layout_v3';
/* Migration de l'ancienne clé binaire : si présente, on déduit. */
const LEGACY_KEY = 'paritas_cockpit_enabled';

function load(): LayoutPref {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'auto' || v === 'theatre' || v === 'atelier' || v === 'carnet') return v;
    /* Migration ancienne clé : enabled=true → auto, enabled=false → carnet. */
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy === 'false') return 'carnet';
    return 'auto';
  } catch {
    return 'auto';
  }
}

/** Calcule le layout effectif à partir de la préférence et du viewport. */
export function resolveLayout(pref: LayoutPref, viewportWidth: number): EffectiveLayout {
  if (pref !== 'auto') return pref;
  if (viewportWidth >= 1280) return 'theatre';
  if (viewportWidth >= 768)  return 'atelier';
  return 'carnet';
}

export const LAYOUT_LABEL: Record<LayoutPref, string> = {
  auto:    'Auto',
  theatre: 'Théâtre',
  atelier: 'Atelier',
  carnet:  'Carnet'
};

export const LAYOUT_DESC: Record<LayoutPref, string> = {
  auto:    'Choisi automatiquement selon ton écran.',
  theatre: '3 panneaux + ticker — pour grand écran (≥1280px). L\'expérience pleine.',
  atelier: '2 panneaux empilés, ticker compact — pour tablette / fenêtre moyenne.',
  carnet:  'Plein écran, lecture séquentielle — pour mobile, ou pour se concentrer sur le récit.'
};

class CockpitStore {
  /** Préférence de layout du joueur (auto par défaut). */
  preference = $state<LayoutPref>(load());

  /** Compatibilité ascendante : `enabled` reste exposé pour les
   *  composants qui ne sont pas migrés. true ↔ pref ≠ 'carnet'. */
  get enabled(): boolean {
    return this.preference !== 'carnet';
  }

  /** Onglet ouvert dans le cockpit (`null` = aucun, sinon id du tab).
   *  Réservé aux MINI-JEUX lourds qui ouvrent un drawer plein écran. */
  openTab = $state<string | null>(null);

  /** Popover ouvert (`null` = aucun). Différent de openTab : un
   *  popover est ancré au déclencheur (rail), beaucoup plus léger
   *  qu'un drawer. Mutuellement exclusif avec openTab. */
  openPopover = $state<{ id: string; side: 'left' | 'right' } | null>(null);

  setPreference(p: LayoutPref) {
    this.preference = p;
    if (p === 'carnet') {
      this.openTab = null;
      this.openPopover = null;
    }
    try { localStorage.setItem(KEY, p); } catch { /* ignore */ }
  }

  /** Compat : ancienne API. true → pref='auto', false → pref='carnet'. */
  setEnabled(v: boolean) {
    this.setPreference(v ? 'auto' : 'carnet');
  }

  /** Compat : ancien toggle binaire. Bascule auto ↔ carnet. */
  toggle() {
    this.setPreference(this.preference === 'carnet' ? 'auto' : 'carnet');
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
