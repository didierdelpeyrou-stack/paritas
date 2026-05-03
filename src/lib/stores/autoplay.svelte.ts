/* ============================================================
   Paritas — mode auto-play debug
   ============================================================
   Quand activé, le moteur clique automatiquement le premier choix
   non-verrouillé de chaque scénario après un délai. Utile pour :
   - profiler le worker (Brendan Gregg #28),
   - observer l'émergence sans intervention (Ian Cheng #194),
   - valider la stabilité par perturbation ε (Doudna #156),
   - faire défiler des parties témoins pour études RCT (Duflo #94).

   Persisté en localStorage. Activable depuis Settings.
   ============================================================ */

const KEY_ENABLED = 'paritas_autoplay';
const KEY_DELAY = 'paritas_autoplay_delay';

function loadEnabled(): boolean {
  try { return localStorage.getItem(KEY_ENABLED) === 'true'; } catch { return false; }
}

function loadDelay(): number {
  try {
    const v = Number(localStorage.getItem(KEY_DELAY));
    return Number.isFinite(v) && v >= 200 && v <= 5000 ? v : 1200;
  } catch {
    return 1200;
  }
}

class AutoplayStore {
  enabled = $state<boolean>(loadEnabled());
  /** Délai avant clic auto (ms). 1200 ms par défaut : assez pour
   *  voir le scénario, assez court pour défiler une partie en
   *  ~10 min. */
  delayMs = $state<number>(loadDelay());

  setEnabled(v: boolean) {
    this.enabled = v;
    try { localStorage.setItem(KEY_ENABLED, String(v)); } catch { /* ignore */ }
  }

  setDelay(ms: number) {
    const clamped = Math.max(200, Math.min(5000, Math.round(ms)));
    this.delayMs = clamped;
    try { localStorage.setItem(KEY_DELAY, String(clamped)); } catch { /* ignore */ }
  }

  toggle() {
    this.setEnabled(!this.enabled);
  }
}

export const autoplay = new AutoplayStore();
