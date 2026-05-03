/* ============================================================
   Paritas — onboarding tour (P0 Argus 12 sessions)
   ============================================================
   Argus a remonté : « la moitié de la richesse passe sous le radar
   sans onboarding ». Réponse — un coachmark contextuel par mode
   qui pointe les trouvailles (portrait CK3, tuiles acteurs,
   briefing Atelier) au tour 1, dismissable et persisté.

   Persisté par mode : un joueur qui découvre Théâtre verra le
   tour Théâtre une fois ; s'il bascule en Atelier plus tard, il
   verra le tour Atelier la première fois — pas avant.
   ============================================================ */

const KEY_PREFIX = 'paritas_onboarding_v1';

export type OnboardingMode = 'theatre' | 'atelier' | 'carnet';

class OnboardingStore {
  /** Tour est-il actif (visible à l'écran) ? */
  active = $state<{ mode: OnboardingMode; step: number } | null>(null);

  /** Vérifie si le tour pour ce mode a déjà été dismissed. */
  isSeen(mode: OnboardingMode): boolean {
    try {
      return localStorage.getItem(`${KEY_PREFIX}_${mode}`) === '1';
    } catch {
      return false;
    }
  }

  /** Active le tour pour le mode si pas déjà vu. */
  start(mode: OnboardingMode) {
    if (this.isSeen(mode)) return;
    this.active = { mode, step: 0 };
  }

  /** Avance d'une étape. Si dépasse, marque comme vu et ferme. */
  next(maxSteps: number) {
    if (!this.active) return;
    if (this.active.step + 1 >= maxSteps) {
      this.dismiss();
    } else {
      this.active = { mode: this.active.mode, step: this.active.step + 1 };
    }
  }

  /** Recule d'une étape (≥ 0). */
  prev() {
    if (!this.active) return;
    this.active = { mode: this.active.mode, step: Math.max(0, this.active.step - 1) };
  }

  /** Marque comme vu et ferme. */
  dismiss() {
    if (!this.active) return;
    try {
      localStorage.setItem(`${KEY_PREFIX}_${this.active.mode}`, '1');
    } catch { /* ignore */ }
    this.active = null;
  }

  /** Pour debug / replay. */
  reset(mode: OnboardingMode) {
    try { localStorage.removeItem(`${KEY_PREFIX}_${mode}`); } catch { /* ignore */ }
  }
}

export const onboarding = new OnboardingStore();
