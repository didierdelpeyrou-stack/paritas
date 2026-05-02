/* ============================================================
   Paritas — moteur audio adaptatif (Tone.js)
   ============================================================

   Choix de design (mai 2026) :

   1. **Tout est génératif** — aucun fichier audio embarqué.
      Contrainte du jeu : hors-ligne 100 %, pas de licence payante.
      Tone.js (~ 240 KB / 62 KB gzip) reste lazy-loadé à la première
      activation par le joueur (musique ou SFX), exactement comme
      avant. Tant que personne n'active rien, coût bundle = 0.

   2. **Trois axes réactifs : ère / mood / trait dominant.**
      - Ère (15 palettes, une par EraId) : root, gamme, tempo, motif
        de basse. C'est l'identité historique.
      - Mood (5 valeurs : calme / tendu / grave / euphorique /
        melancolique) : modulateur global appliqué par-dessus la
        palette (gain, vitesse, dissonance, présence des voix).
      - Trait dominant (6 traits) : couleur de timbre — type
        d'oscillateur principal, gain de la voix, présence du brass.
        Effet subtil, jamais grandiloquent (cf. esprit FALC).

   3. **Crossfade** entre palettes (1.4 s par défaut, 0.4 s en mode
      « animations réduites » a11y). Plus de saut sec quand l'ère
      change.

   4. **SFX élargis** : 12 effets au lieu de 6, tous synthétisés.
      Les nouveaux servent les moments clés du jeu — signature
      d'accord, ratification, lancement de pipeline narratif,
      élection interne, interlude, choix verrouillé.

   5. **Thèmes d'ending** : 5 micro-thèmes (~ 6-8 s) déclenchés
      à l'écran de fin, un par EndingId. C'est l'instant pédagogique
      majeur du jeu — le son doit le porter.

   6. **Mute pendant les pivots** : la cérémonie de signature
      coupe l'ambient (fade-out 0.6 s) le temps du rituel, et le
      reprend au dismiss. Le silence est aussi un outil dramatique.

   ============================================================ */

import * as Tone from 'tone';

/* === Types === */

export type AudioEraId =
  | 'revolution'
  | 'xixe'
  | 'belle_epoque'
  | 'entre_deux_guerres'
  | 'reconstruction'
  | 'guerre_froide'
  | 'trente_glorieuses'
  | 'crise'
  | 'mitterrand'
  | 'cohabitations'
  | 'sarkozy'
  | 'hollande'
  | 'macron_i'
  | 'macron_ii'
  | 'present';

export type AudioMood = 'calme' | 'tendu' | 'grave' | 'euphorique' | 'melancolique';

export type AudioTrait =
  | 'batisseur'
  | 'rupture'
  | 'technocrate'
  | 'pragmatique'
  | 'paternaliste'
  | 'tribun';

export type EndingThemeId = 'mutilation' | 'resistance' | 'refondation' | 'capture' | 'inacheve';

interface EraPalette {
  /** Fréquence de la fondamentale (Hz) */
  root: number;
  /** Notes de basse (Hz) — le motif tourne en boucle */
  bass: number[];
  /** Notes de voix (Hz) — joués sporadiquement (mod 8) */
  voice: number[];
  /** Tempo de la boucle (ms par step). Plus haut = plus lent. */
  stepMs: number;
}

/* 15 palettes, une par ère. Tonalités et tempos ont été choisis pour
 * suggérer l'époque sans pasticher : tambour militaire pour la
 * Révolution, ostinato industriel au XIXe, brass discret aux Trente
 * Glorieuses, motif mécanique pour Macron, suspension pour le présent.
 * Tout reste sobre — la musique sert le jeu, pas l'inverse. */
const ERA_PALETTES: Record<AudioEraId, EraPalette> = {
  // Révolution — D mineur, lent, basse pédale
  revolution:        { root: 147, bass: [73, 110, 73, 87],     voice: [220, 247, 220, 196], stepMs: 700 },
  // XIXe industriel — F dorien, ostinato
  xixe:              { root: 174, bass: [87, 130, 116, 130],   voice: [233, 261, 233, 207], stepMs: 660 },
  // Belle Époque — G majeur, modéré, voix tierce
  belle_epoque:      { root: 196, bass: [98, 147, 130, 147],   voice: [293, 330, 293, 261], stepMs: 620 },
  // Entre deux guerres — A mineur syncopé
  entre_deux_guerres:{ root: 220, bass: [110, 165, 138, 147],  voice: [277, 311, 277, 246], stepMs: 600 },
  // Reconstruction — C majeur, motif optimiste (CNR)
  reconstruction:    { root: 261, bass: [130, 196, 174, 196],  voice: [329, 392, 329, 293], stepMs: 600 },
  // Guerre froide — D dorien, lent
  guerre_froide:     { root: 147, bass: [73, 110, 98, 87],     voice: [220, 247, 220, 196], stepMs: 680 },
  // Trente Glorieuses — F majeur, soutenu
  trente_glorieuses: { root: 174, bass: [87, 130, 116, 130],   voice: [261, 293, 261, 233], stepMs: 580 },
  // Crise — B mineur, ralenti
  crise:             { root: 165, bass: [82, 123, 110, 98],    voice: [247, 277, 247, 220], stepMs: 700 },
  // Mitterrand — G mineur, voix lyrique
  mitterrand:        { root: 196, bass: [98, 146, 130, 116],   voice: [293, 311, 293, 261], stepMs: 620 },
  // Cohabitations — A dorien, hésitant
  cohabitations:     { root: 220, bass: [110, 164, 146, 138],  voice: [261, 293, 261, 246], stepMs: 640 },
  // Sarkozy — E mineur, nerveux
  sarkozy:           { root: 165, bass: [82, 123, 110, 123],   voice: [247, 277, 247, 220], stepMs: 560 },
  // Hollande — F mineur, ralenti
  hollande:          { root: 174, bass: [87, 130, 116, 130],   voice: [233, 261, 233, 207], stepMs: 660 },
  // Macron I — D majeur, mécanique
  macron_i:          { root: 147, bass: [73, 110, 110, 92],    voice: [220, 247, 220, 196], stepMs: 540 },
  // Macron II — D mineur, mécanique tendu
  macron_ii:         { root: 147, bass: [73, 110, 116, 87],    voice: [220, 233, 220, 196], stepMs: 540 },
  // Présent — C dorien, suspension
  present:           { root: 164, bass: [82, 123, 116, 110],   voice: [247, 277, 261, 233], stepMs: 660 }
};

interface MoodLayer {
  /** Multiplicateur de gain musique (1.0 = neutre) */
  gainMul: number;
  /** Multiplicateur de tempo (1.0 = neutre, > 1 = plus lent) */
  tempoMul: number;
  /** Probabilité que la voix joue (mod 8). 0 = jamais. */
  voiceProb: number;
  /** Multiplicateur du gain kick */
  kickMul: number;
  /** Demi-tons de désaccord ajoutés sur la 5e (dissonance) */
  detuneCents: number;
}

const MOOD_LAYERS: Record<AudioMood, MoodLayer> = {
  calme:        { gainMul: 1.0,  tempoMul: 1.0,   voiceProb: 1.0, kickMul: 1.0,  detuneCents: 0 },
  tendu:        { gainMul: 1.05, tempoMul: 0.95,  voiceProb: 0.7, kickMul: 1.15, detuneCents: 18 },
  grave:        { gainMul: 0.85, tempoMul: 1.18,  voiceProb: 0.0, kickMul: 0.85, detuneCents: 0 },
  euphorique:   { gainMul: 1.1,  tempoMul: 0.92,  voiceProb: 1.0, kickMul: 1.2,  detuneCents: 0 },
  melancolique: { gainMul: 0.9,  tempoMul: 1.10,  voiceProb: 1.0, kickMul: 0.7,  detuneCents: -8 }
};

interface TraitTimbre {
  bassWave: 'sine' | 'triangle' | 'sawtooth' | 'square';
  voiceWave: 'sine' | 'triangle' | 'sawtooth' | 'square';
  voiceMul: number; // 1.0 neutre
  brassMul: number; // 1.0 neutre, 0 = brass coupé
}

const TRAIT_TIMBRES: Record<AudioTrait, TraitTimbre> = {
  batisseur:    { bassWave: 'triangle', voiceWave: 'sine',     voiceMul: 1.0, brassMul: 1.0 },
  rupture:      { bassWave: 'sawtooth', voiceWave: 'sawtooth', voiceMul: 1.1, brassMul: 1.1 },
  technocrate:  { bassWave: 'sine',     voiceWave: 'sine',     voiceMul: 0.85, brassMul: 0.4 },
  pragmatique:  { bassWave: 'triangle', voiceWave: 'sine',     voiceMul: 1.0, brassMul: 0.85 },
  paternaliste: { bassWave: 'triangle', voiceWave: 'triangle', voiceMul: 0.95, brassMul: 1.05 },
  tribun:       { bassWave: 'triangle', voiceWave: 'triangle', voiceMul: 1.25, brassMul: 1.0 }
};

/* === Moteur === */

class AudioEngine {
  private started = false;
  private isMusicOn = false;

  // État réactif
  private currentEra: AudioEraId = 'revolution';
  private currentMood: AudioMood = 'calme';
  private currentTrait: AudioTrait = 'pragmatique';

  // Coupure temporaire (cérémonies)
  private muteFactor = 1.0; // 0..1, multiplicateur appliqué au gain musique

  // Synths
  private bassSynth?: Tone.Synth;
  private voiceSynth?: Tone.Synth;
  private brassSynth?: Tone.PolySynth;
  private kickSynth?: Tone.MembraneSynth;
  private noiseSynth?: Tone.NoiseSynth;
  private sfxSynth?: Tone.PolySynth;
  private themeSynth?: Tone.PolySynth;

  // Loop
  private loopId?: number;
  private step = 0;

  // Gains
  private musicGain?: Tone.Gain;
  private sfxGain?: Tone.Gain;
  private musicVol = 0.08;
  private sfxVol = 0.42;

  /* ================= init ================= */

  async init() {
    if (this.started) return;
    await Tone.start();
    this.musicGain = new Tone.Gain(this.musicVol).toDestination();
    this.sfxGain = new Tone.Gain(this.sfxVol).toDestination();

    this.bassSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.05, decay: 0.4, sustain: 0.3, release: 0.5 }
    }).connect(this.musicGain);

    this.voiceSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.08, decay: 0.2, sustain: 0.3, release: 0.4 }
    }).connect(this.musicGain);

    this.brassSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.4, release: 0.3 }
    }).connect(this.musicGain);

    this.kickSynth = new Tone.MembraneSynth().connect(this.musicGain);
    this.noiseSynth = new Tone.NoiseSynth({
      envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
    }).connect(this.musicGain);

    this.sfxSynth = new Tone.PolySynth(Tone.Synth).connect(this.sfxGain);
    this.themeSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.06, decay: 0.4, sustain: 0.4, release: 0.8 }
    }).connect(this.sfxGain);

    this.started = true;
  }

  /* ================= musique adaptative ================= */

  /** Démarre la boucle ambient sur la palette courante. */
  async startMusic(eraId?: AudioEraId) {
    await this.init();
    if (eraId) this.currentEra = eraId;
    this.stopMusic();
    if (!this.isMusicOn) return;

    const playStep = () => {
      const palette = ERA_PALETTES[this.currentEra];
      const mood = MOOD_LAYERS[this.currentMood];
      const timbre = TRAIT_TIMBRES[this.currentTrait];
      if (!palette || !mood || !timbre) return;

      // Ajuste les timbres si le trait a changé
      if (this.bassSynth) this.bassSynth.oscillator.type = timbre.bassWave;
      if (this.voiceSynth) this.voiceSynth.oscillator.type = timbre.voiceWave;

      const now = Tone.now();
      // Basse continue, transposée selon mood (grave = octave en dessous)
      const bassNote = palette.bass[this.step % palette.bass.length];
      if (bassNote) {
        const bassFreq = this.currentMood === 'grave' ? bassNote / 2 : bassNote;
        try {
          this.bassSynth?.triggerAttackRelease(bassFreq, '8n', now);
        } catch {
          /* synth surchargé : on saute le step */
        }
      }

      // Voix sporadique (mod 8). Probabilité dépend du mood.
      if (this.step % 8 === 5 && Math.random() < mood.voiceProb) {
        const v = palette.voice[this.step % palette.voice.length];
        if (v) {
          const detune = mood.detuneCents;
          try {
            this.voiceSynth?.triggerAttackRelease(v, '16n', now + 0.05, timbre.voiceMul);
            if (detune !== 0) {
              // 2nde voix légèrement désaccordée → dissonance tendue
              this.voiceSynth?.triggerAttackRelease(
                v * Math.pow(2, detune / 1200),
                '16n',
                now + 0.08,
                timbre.voiceMul * 0.4
              );
            }
          } catch { /* ignore */ }
        }
      }

      // Brass (mod 16) — coupé en mood mélancolique, multiplié par trait
      if (this.step % 16 === 0 && timbre.brassMul > 0 && this.currentMood !== 'melancolique') {
        const r = palette.root * 2;
        try {
          this.brassSynth?.triggerAttackRelease(
            [r, r * 1.25],
            '16n',
            now + 0.1,
            timbre.brassMul * 0.55
          );
        } catch { /* ignore */ }
      }

      // Kick (mod 8) — module l'intensité par mood
      if (this.step % 8 === 0) {
        try {
          this.kickSynth?.triggerAttackRelease('C2', '32n', now, mood.kickMul * 0.7);
        } catch { /* ignore */ }
      }
      this.step++;
    };

    const palette = ERA_PALETTES[this.currentEra];
    const mood = MOOD_LAYERS[this.currentMood];
    const interval = Math.round((palette?.stepMs ?? 620) * (mood?.tempoMul ?? 1));
    this.loopId = window.setInterval(playStep, interval);
  }

  stopMusic() {
    if (this.loopId !== undefined) {
      clearInterval(this.loopId);
      this.loopId = undefined;
    }
  }

  setMusicEnabled(on: boolean) {
    this.isMusicOn = on;
    this.applyMusicGain();
    if (!on) {
      this.stopMusic();
    }
  }

  setMusicVolume(v: number) {
    this.musicVol = v;
    this.applyMusicGain();
  }

  setSfxVolume(v: number) {
    this.sfxVol = v;
    if (this.sfxGain) this.sfxGain.gain.value = v;
  }

  /** Coupure progressive (cérémonies, interlude solennel).
   *  factor = 0 → coupé. factor = 1 → plein volume. */
  fadeMusicTo(factor: number, ms = 600) {
    this.muteFactor = factor;
    if (!this.musicGain) return;
    try {
      this.musicGain.gain.rampTo(this.targetMusicGain(), ms / 1000);
    } catch {
      this.musicGain.gain.value = this.targetMusicGain();
    }
  }

  private targetMusicGain(): number {
    return this.isMusicOn ? this.musicVol * this.muteFactor : 0;
  }

  private applyMusicGain() {
    if (this.musicGain) this.musicGain.gain.value = this.targetMusicGain();
  }

  /* ================= changements réactifs ================= */

  /** Change l'ère avec crossfade musical court. Si la musique est
   *  active, on relance la boucle avec la nouvelle palette ; pendant
   *  la transition, on baisse-monte le gain pour éviter le saut sec. */
  async setEra(eraId: AudioEraId, opts?: { reducedMotion?: boolean }) {
    if (this.currentEra === eraId) return;
    this.currentEra = eraId;
    if (!this.isMusicOn) return;
    await this.crossfadeRestart(opts?.reducedMotion ? 280 : 1200);
  }

  /** Mood courant — modulateur global. */
  async setMood(mood: AudioMood, opts?: { reducedMotion?: boolean }) {
    if (this.currentMood === mood) return;
    this.currentMood = mood;
    if (!this.isMusicOn) return;
    // Mood change = re-tempo + re-voice. Crossfade plus court.
    await this.crossfadeRestart(opts?.reducedMotion ? 200 : 700);
  }

  /** Trait dominant — couleur de timbre. Pas de restart, on laisse
   *  le prochain step appliquer les nouveaux oscillateurs. */
  setTrait(trait: AudioTrait) {
    this.currentTrait = trait;
  }

  /** Helper interne : ramp down → restart → ramp up. */
  private async crossfadeRestart(ms: number) {
    if (!this.musicGain) {
      await this.startMusic();
      return;
    }
    const half = ms / 2 / 1000;
    try {
      this.musicGain.gain.rampTo(0, half);
    } catch { /* ignore */ }
    await new Promise(res => setTimeout(res, ms / 2));
    await this.startMusic();
    try {
      this.musicGain.gain.rampTo(this.targetMusicGain(), half);
    } catch {
      this.musicGain.gain.value = this.targetMusicGain();
    }
  }

  /* ================= SFX ================= */

  async click() {
    await this.init();
    try { this.sfxSynth?.triggerAttackRelease('C5', '32n'); } catch { /* ignore */ }
  }

  async success() {
    await this.init();
    const now = Tone.now();
    try {
      ['C5', 'E5', 'G5'].forEach((n, i) => {
        this.sfxSynth?.triggerAttackRelease(n, '8n', now + i * 0.08);
      });
    } catch { /* ignore */ }
  }

  async fail() {
    await this.init();
    const now = Tone.now();
    try {
      this.sfxSynth?.triggerAttackRelease('A3', '8n', now);
      this.sfxSynth?.triggerAttackRelease('F3', '4n', now + 0.12);
    } catch { /* ignore */ }
  }

  async fanfare() {
    await this.init();
    const now = Tone.now();
    try {
      [['C5', 'E5', 'G5'], ['D5', 'F5', 'A5'], ['E5', 'G5', 'B5'], ['C5', 'G5', 'C6']].forEach((ch, i) => {
        this.sfxSynth?.triggerAttackRelease(ch, '4n', now + i * 0.22);
      });
    } catch { /* ignore */ }
  }

  async impact() {
    await this.init();
    const now = Tone.now();
    try {
      this.kickSynth?.triggerAttackRelease('A1', '4n', now);
      this.noiseSynth?.triggerAttackRelease('4n', now);
    } catch { /* ignore */ }
    void this.fanfare();
  }

  async dice() {
    await this.init();
    const now = Tone.now();
    try {
      [440, 510, 580, 660, 580, 500].forEach((f, i) => {
        this.sfxSynth?.triggerAttackRelease(f, '32n', now + i * 0.04);
      });
    } catch { /* ignore */ }
  }

  /* === Nouveaux SFX (pivots) === */

  /** Apparition de la cérémonie — sceau lourd, basse + chœur tenu.
   *  themeSynth est routé via sfxGain pour rester audible même si la
   *  musique d'ambient est coupée (pivots solennels). */
  async signature() {
    await this.init();
    const now = Tone.now();
    try {
      this.themeSynth?.triggerAttackRelease(['C2'], '4n', now, 0.6);
      this.themeSynth?.triggerAttackRelease(['C3', 'G3', 'C4'], '2n', now + 0.05, 0.45);
    } catch { /* ignore */ }
  }

  /** Validation : accord ratifié, cloche + fanfare brève. */
  async ratify() {
    await this.init();
    const now = Tone.now();
    try {
      this.themeSynth?.triggerAttackRelease(['G4', 'B4', 'D5'], '4n', now, 0.5);
      this.themeSynth?.triggerAttackRelease(['C5', 'E5', 'G5'], '2n', now + 0.18, 0.55);
      this.sfxSynth?.triggerAttackRelease('C6', '16n', now + 0.42);
    } catch { /* ignore */ }
  }

  /** Lancement de pipeline narratif — montée arpégée 4 notes. */
  async pipelineLaunch() {
    await this.init();
    const now = Tone.now();
    try {
      ['C4', 'E4', 'G4', 'C5'].forEach((n, i) => {
        this.sfxSynth?.triggerAttackRelease(n, '16n', now + i * 0.06);
      });
    } catch { /* ignore */ }
  }

  /** Élection interne gagnée — fanfare brève. */
  async electionWin() {
    await this.init();
    const now = Tone.now();
    try {
      [['C5', 'E5', 'G5'], ['F5', 'A5', 'C6']].forEach((ch, i) => {
        this.sfxSynth?.triggerAttackRelease(ch, '4n', now + i * 0.18);
      });
      this.themeSynth?.triggerAttackRelease(['C5'], '2n', now + 0.4, 0.4);
    } catch { /* ignore */ }
  }

  /** Élection interne perdue — descente mineure + drone sourd. */
  async electionLose() {
    await this.init();
    const now = Tone.now();
    try {
      ['G4', 'F4', 'D4', 'C4'].forEach((n, i) => {
        this.sfxSynth?.triggerAttackRelease(n, '8n', now + i * 0.1);
      });
      this.themeSynth?.triggerAttackRelease(['A1'], '2n', now + 0.05, 0.5);
    } catch { /* ignore */ }
  }

  /** Début d'interlude — cloche + voix legato. */
  async interludeIn() {
    await this.init();
    const now = Tone.now();
    try {
      this.themeSynth?.triggerAttackRelease(['F4', 'A4'], '2n', now, 0.4);
      this.sfxSynth?.triggerAttackRelease('C5', '8n', now + 0.6);
    } catch { /* ignore */ }
  }

  /** Choix verrouillé (requiresTrait non satisfait). */
  async lock() {
    await this.init();
    const now = Tone.now();
    try {
      this.sfxSynth?.triggerAttackRelease('E2', '16n', now);
      this.sfxSynth?.triggerAttackRelease('D2', '8n', now + 0.06);
    } catch { /* ignore */ }
  }

  /* ================= thèmes d'ending ================= */

  /** Joue un thème court (~ 6-8 s) à l'écran de fin. La musique
   *  ambient doit être stoppée par le caller avant — ce thème prend
   *  toute la place. */
  async playEndingTheme(id: EndingThemeId) {
    await this.init();
    const now = Tone.now();
    try {
      switch (id) {
        case 'mutilation': {
          // Dépouillement : basse seule sur deux notes, puis silence.
          // themeSynth est routé via sfxGain pour rester audible quand
          // l'ambient est coupée.
          this.themeSynth?.triggerAttackRelease(['C2'], '2n', now, 0.5);
          this.themeSynth?.triggerAttackRelease(['C3'], '1n', now + 0.3, 0.35);
          this.themeSynth?.triggerAttackRelease(['G2'], '1n', now + 1.6, 0.3);
          break;
        }
        case 'resistance': {
          // Tenue : basse + voix soutenues. themeSynth est routé via
          // sfxGain pour rester audible quand l'ambient est coupée.
          this.themeSynth?.triggerAttackRelease(['F3', 'C4'], '1n', now, 0.4);
          this.themeSynth?.triggerAttackRelease(['F3', 'A3', 'C4'], '1n', now + 1.2, 0.45);
          this.themeSynth?.triggerAttackRelease(['F4', 'A4'], '2n', now + 2.4, 0.35);
          break;
        }
        case 'refondation': {
          // Élargi : progression IV-V-I, fanfare contenue
          this.themeSynth?.triggerAttackRelease(['F3', 'A3', 'C4'], '2n', now, 0.45);
          this.themeSynth?.triggerAttackRelease(['G3', 'B3', 'D4'], '2n', now + 1.0, 0.5);
          this.themeSynth?.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '1n', now + 2.0, 0.55);
          this.themeSynth?.triggerAttackRelease(['C5', 'E5'], '2n', now + 2.4, 0.5);
          break;
        }
        case 'capture': {
          // Mécanique + dissonance, finit sur un accord faux
          for (let i = 0; i < 6; i++) {
            this.sfxSynth?.triggerAttackRelease('E4', '16n', now + i * 0.18, 0.3);
          }
          this.themeSynth?.triggerAttackRelease(['E3', 'G3', 'B3'], '2n', now + 1.3, 0.5);
          this.themeSynth?.triggerAttackRelease(['F3', 'A3', 'C4'], '1n', now + 2.6, 0.55);
          break;
        }
        case 'inacheve': {
          // Suspension : boucle qui ne se résout pas
          this.themeSynth?.triggerAttackRelease(['D3', 'F3'], '2n', now, 0.4);
          this.themeSynth?.triggerAttackRelease(['G3', 'A3'], '2n', now + 1.0, 0.4);
          this.themeSynth?.triggerAttackRelease(['D3', 'F3'], '2n', now + 2.2, 0.35);
          this.themeSynth?.triggerAttackRelease(['G3'], '1n', now + 3.5, 0.25);
          break;
        }
      }
    } catch { /* ignore */ }
  }
}

export const audio = new AudioEngine();
