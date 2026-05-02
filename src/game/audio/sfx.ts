/**
 * Façade SFX. Tone.js (≈ 240 KB / 62 KB gzip) est chargé paresseusement à la
 * première activation : tant que le joueur n'a pas activé le son,
 * aucun coût bundle. Les préférences sont persistées dans localStorage.
 *
 * Trois axes réactifs branchés sur la simulation :
 *   - setEra(EraId) : change la palette historique (15 palettes)
 *   - setMood(SceneMood) : module l'intensité (calme..tendu..grave...)
 *   - setTrait(PlayerTrait) : colore le timbre (bois, brass, voix)
 *
 * Tous les sons sont synthétisés (pas de fichier audio à embarquer).
 *
 * Usage côté UI :
 *   sfx.play('click')                  — clic UI
 *   sfx.play('signature')              — apparition cérémonie
 *   sfx.play('ratify')                 — accord ratifié
 *   sfx.playEndingTheme('refondation') — thème de fin
 *   sfx.muteForCeremony()/unmute()     — silencieux pendant un pivot
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
  | 'pageTurn'
  | 'signature'
  | 'ratify'
  | 'pipelineLaunch'
  | 'electionWin'
  | 'electionLose'
  | 'interludeIn'
  | 'lock';

import type { EraId, SceneMood, PlayerTrait, EndingId } from '../types';
import type {
  AudioEraId,
  AudioMood,
  AudioTrait,
  EndingThemeId,
  SceneAudioId
} from '../../lib/audio/audio';

interface AudioModule {
  audio: {
    click: () => Promise<void>;
    success: () => Promise<void>;
    fail: () => Promise<void>;
    fanfare: () => Promise<void>;
    impact: () => Promise<void>;
    dice: () => Promise<void>;
    signature: () => Promise<void>;
    ratify: () => Promise<void>;
    pipelineLaunch: () => Promise<void>;
    electionWin: () => Promise<void>;
    electionLose: () => Promise<void>;
    interludeIn: () => Promise<void>;
    lock: () => Promise<void>;
    setMusicEnabled: (on: boolean) => void;
    startMusic: (eraId?: AudioEraId) => Promise<void>;
    stopMusic: () => void;
    setEra: (eraId: AudioEraId, opts?: { reducedMotion?: boolean }) => Promise<void>;
    setMood: (mood: AudioMood, opts?: { reducedMotion?: boolean }) => Promise<void>;
    setTrait: (trait: AudioTrait) => void;
    fadeMusicTo: (factor: number, ms?: number) => void;
    playEndingTheme: (id: EndingThemeId) => Promise<void>;
    beginScene: (scene: SceneAudioId) => Promise<void>;
    endScene: () => void;
    ovation: (intensity?: 'soft' | 'strong') => Promise<void>;
    sceneSignaturePaper: () => Promise<void>;
  };
}

/* EraId du jeu et AudioEraId du moteur partagent les 15 mêmes valeurs.
 * On garde un identity pass plutôt qu'un mapping pour ne pas perdre
 * d'info — chaque ère a sa palette dédiée. */
const eraPass = (e: EraId): AudioEraId => e as AudioEraId;

class SfxClient {
  private enabled = false;
  private musicEnabled = false;
  private currentEraId: EraId | null = null;
  private currentMood: SceneMood | null = null;
  private currentTrait: PlayerTrait | null = null;
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
      const audioEra = this.currentEraId ? eraPass(this.currentEraId) : 'revolution';
      // Pousse mood & trait courants si déjà connus
      if (this.currentMood) await mod.audio.setMood(this.currentMood as AudioMood);
      if (this.currentTrait) mod.audio.setTrait(this.currentTrait as AudioTrait);
      await mod.audio.startMusic(audioEra);
    } catch {
      /* ignore */
    }
  }

  toggleMusic(): void {
    void this.setMusicEnabled(!this.musicEnabled);
  }

  /** À appeler quand l'ère in-game change. Si la musique est active, le
   *  moteur effectue un crossfade vers la nouvelle palette. */
  setEra(eraId: EraId): void {
    if (this.currentEraId === eraId) return;
    this.currentEraId = eraId;
    if (!this.musicEnabled) return;
    void (async () => {
      try {
        const mod = await this.load();
        await mod.audio.setEra(eraPass(eraId), { reducedMotion: this.reducedMotion() });
      } catch {
        /* ignore */
      }
    })();
  }

  /** Mood courant (calme/tendu/grave/euphorique/melancolique).
   *  Branché à chaque scène — module l'ambiance sans changer la palette. */
  setMood(mood: SceneMood): void {
    if (this.currentMood === mood) return;
    this.currentMood = mood;
    if (!this.musicEnabled) return;
    void (async () => {
      try {
        const mod = await this.load();
        await mod.audio.setMood(mood as AudioMood, { reducedMotion: this.reducedMotion() });
      } catch {
        /* ignore */
      }
    })();
  }

  /** Trait dominant courant. Couleur de timbre subtile.
   *  Pas de crossfade — appliqué au prochain step musical. */
  setTrait(trait: PlayerTrait): void {
    if (this.currentTrait === trait) return;
    this.currentTrait = trait;
    if (!this.musicEnabled) return;
    void (async () => {
      try {
        const mod = await this.load();
        mod.audio.setTrait(trait as AudioTrait);
      } catch {
        /* ignore */
      }
    })();
  }

  /** Coupe progressivement la musique pour un pivot solennel
   *  (cérémonie de signature, ending). Le silence est aussi un outil. */
  muteForPivot(): void {
    if (!this.musicEnabled) return;
    void (async () => {
      try {
        const mod = await this.load();
        mod.audio.fadeMusicTo(0, 600);
      } catch {
        /* ignore */
      }
    })();
  }

  /** Reprise de la musique après un pivot. */
  unmute(): void {
    if (!this.musicEnabled) return;
    void (async () => {
      try {
        const mod = await this.load();
        mod.audio.fadeMusicTo(1, 800);
      } catch {
        /* ignore */
      }
    })();
  }

  /** Joue un thème d'ending (5 thèmes distincts ~6-8s). On coupe
   *  d'abord la boucle ambient — le thème porte la fin tout seul. */
  async playEndingTheme(id: EndingId): Promise<void> {
    // Le thème respecte le toggle SFX. La musique d'ambient est coupée
    // pour ne pas masquer le thème, indépendamment du toggle musique.
    if (!this.enabled) return;
    try {
      const mod = await this.load();
      try { mod.audio.stopMusic(); } catch { /* ignore */ }
      try { mod.audio.fadeMusicTo(0, 200); } catch { /* ignore */ }
      await mod.audio.playEndingTheme(id as EndingThemeId);
    } catch {
      /* ignore */
    }
  }

  onMusicChange(listener: (enabled: boolean) => void): () => void {
    this.musicListeners.push(listener);
    return () => {
      this.musicListeners = this.musicListeners.filter(l => l !== listener);
    };
  }

  /* === Scènes politiques (foules, ambiances) === */

  /** Démarre l'ambiance d'une scène politique : foule, murmures, etc.
   *  Boucle par-dessus la musique d'ère. À couper avec endScene(). */
  async beginScene(scene: SceneAudioId): Promise<void> {
    if (!this.enabled) return;
    try {
      const mod = await this.load();
      await mod.audio.beginScene(scene);
    } catch { /* ignore */ }
  }

  endScene(): void {
    void (async () => {
      try {
        const mod = await this.load();
        mod.audio.endScene();
      } catch { /* ignore */ }
    })();
  }

  /** Ovation one-shot (validation de signature, accord ratifié). */
  async ovation(intensity: 'soft' | 'strong' = 'strong'): Promise<void> {
    if (!this.enabled) return;
    try {
      const mod = await this.load();
      await mod.audio.ovation(intensity);
    } catch { /* ignore */ }
  }

  /** Bruit papier + crayon pour souligner un instant de signature. */
  async paperPen(): Promise<void> {
    if (!this.enabled) return;
    try {
      const mod = await this.load();
      await mod.audio.sceneSignaturePaper();
    } catch { /* ignore */ }
  }

  /* === Loader === */

  private async load(): Promise<AudioModule> {
    if (!this.modulePromise) {
      this.modulePromise = import('../../lib/audio/audio') as Promise<AudioModule>;
    }
    return this.modulePromise;
  }

  /** Lit la préférence a11y « animations réduites » pour raccourcir les
   *  crossfades. Lecture best-effort, en cas d'absence on rend false. */
  private reducedMotion(): boolean {
    if (typeof document === 'undefined') return false;
    try {
      if (document.documentElement.classList.contains('a11y-reduced-motion')) return true;
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
    } catch {
      /* ignore */
    }
    return false;
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
        case 'signature':
          await mod.audio.signature();
          break;
        case 'ratify':
          await mod.audio.ratify();
          break;
        case 'pipelineLaunch':
          await mod.audio.pipelineLaunch();
          break;
        case 'electionWin':
          await mod.audio.electionWin();
          break;
        case 'electionLose':
          await mod.audio.electionLose();
          break;
        case 'interludeIn':
          await mod.audio.interludeIn();
          break;
        case 'lock':
          await mod.audio.lock();
          break;
      }
    } catch {
      /* Audio context refusé / Tone.js absent → silence. */
    }
  }
}

export const sfx = new SfxClient();
