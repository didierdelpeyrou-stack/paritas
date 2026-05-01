/* ============================================================
   Paritas — moteur audio adaptatif (Tone.js)
   Mix réactif aux ressources : tempo, voix militante, dissonance
   ============================================================ */

import * as Tone from 'tone';

interface EraScale {
  root: number;
  bass: number[];
  voice: number[];
}

const ERA_SCALES: EraScale[] = [
  { root: 165, bass: [82, 123, 110, 123], voice: [247, 262, 247, 220] }, // Coalitions interdites
  { root: 146, bass: [73, 110, 103, 98], voice: [220, 233, 220, 196] }, // Première révolution industrielle
  { root: 196, bass: [98, 147, 130, 147], voice: [293, 330, 293, 261] }, // Deuxième révolution industrielle
  { root: 164, bass: [82, 123, 116, 110], voice: [247, 277, 261, 233] } // Troisième révolution industrielle
];

class AudioEngine {
  private started = false;
  private currentEra = 0;
  private isMusicOn = false;
  private musicVol = 0.08;
  private sfxVol = 0.42;

  // Synths
  private bassSynth?: Tone.Synth;
  private voiceSynth?: Tone.Synth;
  private brassSynth?: Tone.PolySynth;
  private kickSynth?: Tone.MembraneSynth;
  private noiseSynth?: Tone.NoiseSynth;
  private sfxSynth?: Tone.PolySynth;

  // Loop
  private loopId?: number;
  private step = 0;

  // Gains
  private musicGain?: Tone.Gain;
  private sfxGain?: Tone.Gain;

  async init() {
    if (this.started) return;
    await Tone.start();
    this.musicGain = new Tone.Gain(this.musicVol).toDestination();
    this.sfxGain = new Tone.Gain(this.sfxVol).toDestination();

    this.bassSynth = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.05, decay: 0.4, sustain: 0.3, release: 0.5 } }).connect(this.musicGain);
    this.voiceSynth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.08, decay: 0.2, sustain: 0.3, release: 0.4 } }).connect(this.musicGain);
    this.brassSynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.4, release: 0.3 } }).connect(this.musicGain);
    this.kickSynth = new Tone.MembraneSynth().connect(this.musicGain);
    this.noiseSynth = new Tone.NoiseSynth({ envelope: { attack: 0.005, decay: 0.1, sustain: 0 } }).connect(this.musicGain);
    this.sfxSynth = new Tone.PolySynth(Tone.Synth).connect(this.sfxGain);

    this.started = true;
  }

  /* ================= musique adaptative ================= */

  async startMusic(eraId: number) {
    await this.init();
    this.currentEra = eraId;
    this.stopMusic();
    if (!this.isMusicOn) return;

    const playStep = () => {
      const scale = ERA_SCALES[this.currentEra] ?? ERA_SCALES[0]!;
      const now = Tone.now();
      // basse continue
      const bass = scale.bass[this.step % scale.bass.length]!;
      this.bassSynth?.triggerAttackRelease(bass, '8n', now);
      // voix rare, pour eviter la boucle insistante
      if (this.step % 8 === 5) {
        const v = scale.voice[this.step % scale.voice.length]!;
        this.voiceSynth?.triggerAttackRelease(v, '16n', now + 0.05);
      }
      // brass discret
      if (this.step % 16 === 0) {
        const r = scale.root * 2;
        this.brassSynth?.triggerAttackRelease([r, r * 1.25], '16n', now + 0.1);
      }
      if (this.step % 8 === 0) this.kickSynth?.triggerAttackRelease('C2', '32n', now);
      this.step++;
    };

    this.loopId = window.setInterval(playStep, 620);
  }

  stopMusic() {
    if (this.loopId !== undefined) {
      clearInterval(this.loopId);
      this.loopId = undefined;
    }
  }

  setMusicEnabled(on: boolean) {
    this.isMusicOn = on;
    if (this.musicGain) this.musicGain.gain.value = on ? this.musicVol : 0;
    if (!on) this.stopMusic();
    else this.startMusic(this.currentEra);
  }

  setMusicVolume(v: number) {
    this.musicVol = v;
    if (this.musicGain) this.musicGain.gain.value = this.isMusicOn ? v : 0;
  }

  setSfxVolume(v: number) {
    this.sfxVol = v;
    if (this.sfxGain) this.sfxGain.gain.value = v;
  }

  /* ================= SFX ================= */

  async click() {
    await this.init();
    this.sfxSynth?.triggerAttackRelease('C5', '32n');
  }

  async success() {
    await this.init();
    const now = Tone.now();
    ['C5', 'E5', 'G5'].forEach((n, i) => {
      this.sfxSynth?.triggerAttackRelease(n, '8n', now + i * 0.08);
    });
  }

  async fail() {
    await this.init();
    const now = Tone.now();
    this.sfxSynth?.triggerAttackRelease('A3', '8n', now);
    this.sfxSynth?.triggerAttackRelease('F3', '4n', now + 0.12);
  }

  async fanfare() {
    await this.init();
    const now = Tone.now();
    [['C5', 'E5', 'G5'], ['D5', 'F5', 'A5'], ['E5', 'G5', 'B5'], ['C5', 'G5', 'C6']].forEach((ch, i) => {
      this.sfxSynth?.triggerAttackRelease(ch, '4n', now + i * 0.22);
    });
  }

  async impact() {
    await this.init();
    const now = Tone.now();
    this.kickSynth?.triggerAttackRelease('A1', '4n', now);
    this.noiseSynth?.triggerAttackRelease('4n', now);
    this.fanfare();
  }

  async dice() {
    await this.init();
    const now = Tone.now();
    [440, 510, 580, 660, 580, 500].forEach((f, i) => {
      this.sfxSynth?.triggerAttackRelease(f, '32n', now + i * 0.04);
    });
  }
}

export const audio = new AudioEngine();
