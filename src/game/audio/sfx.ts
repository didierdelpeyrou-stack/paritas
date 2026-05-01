/**
 * Façade SFX. Tone.js (≈ 50 KB gzip) est chargé paresseusement à la
 * première activation : tant que le joueur n'a pas activé le son,
 * aucun coût bundle. La préférence est persistée dans localStorage.
 *
 * Usage côté UI : sfx.play('click'), sfx.play('manifLaunch'), etc.
 * Tous les sons sont synthétisés (pas de fichier audio à embarquer).
 */

const STORAGE_KEY = 'paritas_sfx_v1';

export type SfxName =
  | 'click'
  | 'consequence'
  | 'success'
  | 'fail'
  | 'fanfare'
  | 'impact'
  | 'criticalAlert'
  | 'pageTurn';

interface AudioModule {
  audio: {
    click: () => Promise<void>;
    success: () => Promise<void>;
    fail: () => Promise<void>;
    fanfare: () => Promise<void>;
    impact: () => Promise<void>;
    dice: () => Promise<void>;
  };
}

class SfxClient {
  private enabled = false;
  private modulePromise: Promise<AudioModule> | null = null;
  private listeners: Array<(enabled: boolean) => void> = [];

  constructor() {
    if (typeof localStorage === 'undefined') return;
    try {
      this.enabled = localStorage.getItem(STORAGE_KEY) === 'on';
    } catch {
      /* ignore */
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    try {
      localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
    } catch {
      /* ignore */
    }
    if (on) {
      /* Précharge le module pour la latence ; ne lance pas de son. */
      void this.load();
    }
    this.listeners.forEach(l => l(on));
  }

  toggle(): void {
    this.setEnabled(!this.enabled);
  }

  onChange(listener: (enabled: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private async load(): Promise<AudioModule> {
    if (!this.modulePromise) {
      this.modulePromise = import('../../lib/audio/audio') as Promise<AudioModule>;
    }
    return this.modulePromise;
  }

  async play(name: SfxName): Promise<void> {
    if (!this.enabled) return;
    try {
      const mod = await this.load();
      switch (name) {
        case 'click':
        case 'pageTurn':
          await mod.audio.click();
          break;
        case 'consequence':
          await mod.audio.dice();
          break;
        case 'success':
          await mod.audio.success();
          break;
        case 'fail':
          await mod.audio.fail();
          break;
        case 'fanfare':
          await mod.audio.fanfare();
          break;
        case 'impact':
        case 'criticalAlert':
          await mod.audio.impact();
          break;
      }
    } catch {
      /* Audio context refusé / Tone.js absent → silence. */
    }
  }
}

export const sfx = new SfxClient();
