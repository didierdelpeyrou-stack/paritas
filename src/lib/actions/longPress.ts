/* ============================================================
   P1-13 (ORDA-009, AAR bêta-30 §V) — long-press → tooltip
   ============================================================
   Wroblewski #01, Soueidan #03, Yanis #19 (4 mentions FG-1) :
   sur tactile, les hovers (badge POV, jauges, sceaux) ne se
   déclenchent jamais. Solution : action Svelte `longPress` qui
   simule un hover après 500 ms d'appui maintenu.

   Usage :
     import { longPress } from '$lib/actions/longPress';
     <div use:longPress={{ onTrigger: () => showTooltip() }}>...</div>

   L'action gère :
   - touchstart / touchend / touchcancel (mobile)
   - mousedown / mouseup / mouseleave (desktop fallback)
   - cleanup automatique à l'unmount
   - délai configurable (default 500 ms)
   - annulation si l'utilisateur bouge le doigt > 8 px
     (évite le déclenchement en plein scroll)
   ============================================================ */

export interface LongPressOptions {
  /** Callback déclenché après un appui maintenu de `delayMs`. */
  onTrigger: () => void;
  /** Callback déclenché à la libération (avant ou après trigger). */
  onRelease?: () => void;
  /** Délai en ms avant trigger. Default 500. */
  delayMs?: number;
  /** Distance max en px tolérée pour ne pas annuler. Default 8. */
  moveTolerancePx?: number;
}

export function longPress(node: HTMLElement, options: LongPressOptions) {
  let opts = options;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let startX = 0;
  let startY = 0;
  let triggered = false;

  function clearTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function onStart(x: number, y: number) {
    startX = x;
    startY = y;
    triggered = false;
    clearTimer();
    timer = setTimeout(() => {
      triggered = true;
      timer = null;
      opts.onTrigger();
    }, opts.delayMs ?? 500);
  }

  function onMove(x: number, y: number) {
    const tol = opts.moveTolerancePx ?? 8;
    if (Math.abs(x - startX) > tol || Math.abs(y - startY) > tol) {
      clearTimer();
    }
  }

  function onEnd() {
    clearTimer();
    if (opts.onRelease) opts.onRelease();
  }

  /* Touch handlers (mobile) */
  function onTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    if (t) onStart(t.clientX, t.clientY);
  }
  function onTouchMove(e: TouchEvent) {
    const t = e.touches[0];
    if (t) onMove(t.clientX, t.clientY);
  }
  function onTouchEnd() {
    onEnd();
  }

  /* Mouse handlers (desktop fallback — surtout pour test) */
  function onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    onStart(e.clientX, e.clientY);
  }
  function onMouseUp() {
    onEnd();
  }
  function onMouseLeave() {
    clearTimer();
  }

  node.addEventListener('touchstart', onTouchStart, { passive: true });
  node.addEventListener('touchmove', onTouchMove, { passive: true });
  node.addEventListener('touchend', onTouchEnd);
  node.addEventListener('touchcancel', onTouchEnd);
  node.addEventListener('mousedown', onMouseDown);
  node.addEventListener('mouseup', onMouseUp);
  node.addEventListener('mouseleave', onMouseLeave);

  return {
    update(newOptions: LongPressOptions) {
      opts = newOptions;
    },
    destroy() {
      clearTimer();
      node.removeEventListener('touchstart', onTouchStart);
      node.removeEventListener('touchmove', onTouchMove);
      node.removeEventListener('touchend', onTouchEnd);
      node.removeEventListener('touchcancel', onTouchEnd);
      node.removeEventListener('mousedown', onMouseDown);
      node.removeEventListener('mouseup', onMouseUp);
      node.removeEventListener('mouseleave', onMouseLeave);
    }
  };
}
