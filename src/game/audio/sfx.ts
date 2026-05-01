/**
 * Façade SFX. Tone.js (≈ 50 KB gzip) est chargé paresseusement à la
 * première activation : tant que le joueur n'a pas activé le son,
 * aucun coût bundle. La préférence est persistée dans localStorage.
 *
 * Usage côté UI : sfx.play('click'), sfx.play('manifLaunch'), etc.
 * Tous les sons sont synthétisés (pas de fichier audio à embarquer).
 */

const SFX_KEY = 'paritas_sfx_v1';
const MUSIC_KEY = 'paritas_music_v1';

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
    setMusicEnabled: (on: boolean) => void;
    startMusic: (eraId: number) => Promise<void>;
    stopMusic: () => void;
  };
}

import type { EraId } from '../types';

/**
 * Mapping EraId → index dans ERA_SCALES de audio.ts (4 scales actuelles).
 * On reste large : on regroupe les époques par grande période.
 */
const ERA_TO_AUDIO: Record<EraId, number> = {
  antiquite: 0,
  medieval: 0,
  revolution: 0,
  xixe: 1,
  belle_epoque: 2,
  entre_deux_guerres: 2,
  reconstruction: 3,
  guerre_froide: 3,
  trente_glorieuses: 3,
  crise: 3,
  mitterrand: 3,
  cohabitations: 3,
  sarkozy: 3,
  hollande: 3,
  macron_i: 3,
  macron_ii: 3,
  present: 3
};

class SfxClient {
  private enabled = false;
  private musicEnabled = false;
  private currentEraId: EraId | null = null;
  private modulePromise: Promise<AudioModule> | null = null;
  private listeners: Array<(enabled: boolean) => void> = [];
  private musicListeners: Array<(enabled: boolean) => void> = [];

  constructor() {
    if (typeof localStorage === 'undefined') return;
    try {
      this.enabled = localStorage.getItem(SFX_KEY) === 'on';
      this.musicEnabled = localStorage.getItem(MUSIC_KEY) === 'on';
    } catch {
      /* ignore */
    }
  }

  /* === SFX === */

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    try {
      localStorage.setItem(SFX_KEY, on ? 'on' : 'off');
    } catch {
      /* ignore */
    }
    if (on) void this.load();
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

  /* === Music === */

  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  async setMusicEnabled(on: boolean): Promise<void> {
    this.musicEnabled = on;
    try {
      localStorage.setItem(MUSIC_KEY, on ? 'on' : 'off');
    } catch {
      /* ignore */
    }
    this.musicListeners.forEach(l => l(on));
    if (!on) {
      try {
        const mod = await this.load();
        mod.audio.setMusicEnabled(false);
        mod.audio.stopMusic();
      } catch {
        /* ignore */
      }
      return;
    }
    /* Active la musique : load module, set enabled, start sur l'ère active. */
    try {
      const mod = await this.load();
      mod.audio.setMusicEnabled(true);
      const audioEra = this.currentEraId ? ERA_TO_AUDIO[this.currentEraId] : 0;
      await mod.audio.startMusic(audioEra);
    } catch {
      /* ignore */
    }
  }

  toggleMusic(): void {
    void this.setMusicEnabled(!this.musicEnabled);
  }

  /** À appeler quand l'ère in-game change. Si la musique est active, le
   *  moteur switche vers la scale correspondante. */
  setEra(eraId: EraId): void {
    if (this.currentEraId === eraId) return;
    this.currentEraId = eraId;
    if (!this.musicEnabled) return;
    void (async () => {
      try {
        const mod = await this.load();
        await mod.audio.startMusic(ERA_TO_AUDIO[eraId]);
      } catch {
        /* ignore */
      }
    })();
  }

  onMusicChange(listener: (enabled: boolean) => void): () => void {
    this.musicListeners.push(listener);
    return () => {
      this.musicListeners = this.musicListeners.filter(l => l !== listener);
    };
  }

  /* === Loader === */

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
