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

/** Identifiants des SFX fichiers présents dans /public/audio/sfx/.
 *  Téléchargés via scripts/download-sfx.sh (CC0/PD/CC-BY archive.org+Wikimedia). */
export type SfxFileId =
  | 'crowd-cheer'        // foule applaudit + cris (CC0)
  | 'crowd-protest'      // manifestation, sifflets, gronde (CC BY)
  | 'crowd-whisper'      // murmures lointains, ambiance lobby (CC0)
  | 'applause-soft'      // applaudissement isolé (CC0)
  | 'applause-strong'    // ovation courte (extrait crowd-cheer)
  | 'shout-victory'      // cri triomphant (mégaphone CC0)
  | 'shout-anger'        // cri colérique (CC0)
  | 'whispers-assembly'  // chuchotements de salle (CC0)
  | 'paper-rustle'       // papier froissé (CC0)
  | 'pen-sign';          // crayon sur papier (CC0)

/** Scènes politiques avec ambiance sonore associée.
 *  Déclenchées via audio.beginScene(...) / audio.endScene(). */
export type SceneAudioId = 'manifestation' | 'meeting' | 'ceremonie' | 'huis_clos';

interface SceneLayer { id: SfxFileId; gain: number; loop?: boolean }

/** Couches sonores par scène. La musique d'ère continue par-dessous. */
const SCENE_LAYERS: Record<SceneAudioId, SceneLayer[]> = {
  // Manifestation : foule en colère + sifflets, dominante mais pas
  // écrasante (testeur Dorian hyperacousie). 0.65 + duck musique
  // suffit pour la sensation d'immersion.
  manifestation: [
    { id: 'crowd-protest', gain: 0.65, loop: true },
  ],
  // Meeting / congrès : murmures de salle en attendant le discours
  meeting: [
    { id: 'whispers-assembly', gain: 0.5, loop: true },
  ],
  // Cérémonie de signature : ambiance feutrée de salle officielle
  ceremonie: [
    { id: 'crowd-whisper', gain: 0.35, loop: true },
  ],
  // Huis clos / négociation tendue
  huis_clos: [
    { id: 'crowd-whisper', gain: 0.25, loop: true },
  ],
};

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
  /* Détune réduit (était jusqu'à 18 cents → 6 max), volumes
     atténués, tempos plus lents pour laisser respirer la reverb. */
  calme:        { gainMul: 1.0,  tempoMul: 1.4,   voiceProb: 0.6, kickMul: 0.8,  detuneCents: 0 },
  tendu:        { gainMul: 1.05, tempoMul: 1.25,  voiceProb: 0.5, kickMul: 1.0,  detuneCents: 6 },
  grave:        { gainMul: 0.7,  tempoMul: 1.6,   voiceProb: 0.2, kickMul: 0.6,  detuneCents: 0 },
  euphorique:   { gainMul: 1.05, tempoMul: 1.2,   voiceProb: 0.8, kickMul: 0.9,  detuneCents: 0 },
  melancolique: { gainMul: 0.8,  tempoMul: 1.5,   voiceProb: 0.7, kickMul: 0.5,  detuneCents: -4 }
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
  private musicGain?: Tone.Gain;          // synth générative (post-reverb)
  private fileGain?: Tone.Gain;           // musique fichier (Pixabay/DP, déjà mastered)
  private sfxGain?: Tone.Gain;
  private musicVol = 0.045;               // synth ambient, fond
  private fileVol = 0.55;                 // fichier mastered -14 LUFS, doit ressortir
  private sfxVol = 0.42;
  private musicReverb?: Tone.Reverb;
  private musicFilter?: Tone.Filter;
  private sfxComp?: Tone.Compressor;
  private fileReverb?: Tone.Reverb;
  /** Multiplicateurs de duck (1 = pas de duck, 0.4 = -8dB env). */
  private musicDuckFactor = 1;
  private sfxDuckFactor = 1;

  /* ================= init =================
     Refonte mai 2026 : la musique générative paraissait sèche et
     dissonante. On rajoute reverb + filtre passe-bas + chorus +
     enveloppes plus douces. Volume baissé à 0.045 (vraiment fond). */

  async init() {
    if (this.started) {
      // Si le contexte audio a été suspendu (sessions longues, onglet
      // en arrière-plan), on tente de le réveiller. Sans ça, après
      // plusieurs parties d'affilée le son devient silencieux
      // (testeur Kevin).
      try {
        if (Tone.getContext().state === 'suspended') {
          await Tone.start();
        }
      } catch { /* ignore */ }
      return;
    }
    await Tone.start();

    /* Chaîne d'effets musique : Synth → Filter (passe-bas) →
       Reverb (large) → Gain → Destination. Sépare la voix
       artisanale du reverb pour ne pas la noyer. */
    this.musicGain = new Tone.Gain(this.musicVol).toDestination();
    this.musicReverb = new Tone.Reverb({ decay: 4, wet: 0.45 }).connect(this.musicGain);
    this.musicFilter = new Tone.Filter({ frequency: 2400, type: 'lowpass', rolloff: -12 }).connect(this.musicReverb);
    /* fileGain est séparé : la musique fichier est déjà mastered à
       -14 LUFS. On ne la passe PAS par le filter+reverb fort du synth
       (ça la noie). Mais l'expert Alaerts d'Ubisoft a raison : sans
       AUCUN reverb, les fichiers sonnent « collés sur » la voix TTS,
       l'oreille perçoit la disjonction stéréo. Solution : reverb
       très léger (decay 1.2 s, wet 0.10) avant le gain — assez pour
       partager l'espace spatial, pas assez pour boueux les Pixabay. */
    this.fileGain = new Tone.Gain(this.fileVol).toDestination();
    this.fileReverb = new Tone.Reverb({ decay: 1.2, wet: 0.10 }).connect(this.fileGain);

    /* SFX → Compresseur léger → Destination. Plage dynamique des SFX
       trop large dans les transports en commun (testeur Ahmed) : les
       chuchotements deviennent inaudibles, les applaudissements
       trop forts. Compresseur 3:1 à -18 dB tasse les pics sans
       masquer les bas niveaux. */
    this.sfxComp = new Tone.Compressor({
      threshold: -18,
      ratio: 3,
      attack: 0.005,
      release: 0.12,
      knee: 6,
    }).toDestination();
    this.sfxGain = new Tone.Gain(this.sfxVol).connect(this.sfxComp);

    /* Bass : triangle doux, attaque allongée, release long. */
    this.bassSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.18, decay: 0.6, sustain: 0.25, release: 1.2 },
      volume: -10
    }).connect(this.musicFilter);

    /* Voix : sine pur, attaque douce, release moelleux. */
    this.voiceSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.22, decay: 0.4, sustain: 0.3, release: 1.5 },
      volume: -14
    }).connect(this.musicFilter);

    /* Brass : était sawtooth (criard) → maintenant fmsine, plus chaud,
       plus rare, mixé bas. Détune léger pour épaissir. */
    this.brassSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fmsine', modulationIndex: 1.2 } as any,
      envelope: { attack: 0.4, decay: 0.5, sustain: 0.35, release: 1.5 },
      volume: -16
    }).connect(this.musicFilter);

    /* Kick : très léger, doux, juste un battement de cœur. */
    this.kickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 1.0 },
      volume: -18
    }).connect(this.musicGain);

    this.noiseSynth = new Tone.NoiseSynth({
      envelope: { attack: 0.005, decay: 0.1, sustain: 0 },
      volume: -24
    }).connect(this.musicGain);

    this.sfxSynth = new Tone.PolySynth(Tone.Synth).connect(this.sfxGain);
    this.themeSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.06, decay: 0.4, sustain: 0.4, release: 0.8 }
    }).connect(this.sfxGain);

    this.started = true;
  }

  /* ================= musique adaptative ================= */

  /** Player de fichier audio si un MP3 d'ère est trouvé. Lazy-créé. */
  private filePlayer?: Tone.Player;
  /** Cache des disponibilités de fichiers d'ère testées. */
  private fileAvailability: Partial<Record<AudioEraId, boolean>> = {};

  /**
   * Tente de charger un fichier audio d'ère. Renvoie true si trouvé
   * et joué en boucle (avec crossfade si un player précédent existe).
   * Formats testés : .mp3 puis .ogg dans /audio/eras/{eraId}.{ext}.
   */
  private async tryLoadEraFile(eraId: AudioEraId): Promise<boolean> {
    if (this.fileAvailability[eraId] === false) return false;
    const base = `${import.meta.env.BASE_URL ?? '/'}audio/eras/${eraId}`;
    let url: string | null = null;
    for (const ext of ['mp3', 'ogg'] as const) {
      try {
        const candidate = `${base}.${ext}`;
        const head = await fetch(candidate, { method: 'HEAD' });
        if (head.ok) { url = candidate; break; }
      } catch { /* try next */ }
    }
    if (!url) {
      this.fileAvailability[eraId] = false;
      return false;
    }
    this.fileAvailability[eraId] = true;
    /* Charge le buffer via le callback onload du player plutôt que
     * Tone.loaded() (qui résout parfois trop tôt entre deux loads
     * consécutifs et fait que .start() joue avec un buffer vide). */
    let next: Tone.Player;
    try {
      next = await new Promise<Tone.Player>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout')), 8000);
        const p: Tone.Player = new Tone.Player({
          url,
          loop: true,
          fadeIn: 1.4,
          fadeOut: 1.0,
          onload: () => { clearTimeout(timer); resolve(p); },
          onerror: () => { clearTimeout(timer); reject(new Error('decode')); },
        });
      });
    } catch {
      this.fileAvailability[eraId] = false;
      return false;
    }
    try {
      next.connect(this.fileReverb ?? this.fileGain!);
      next.start();
      if (this.filePlayer) {
        const old = this.filePlayer;
        old.fadeOut = 1.4;
        old.stop('+1.4');
        setTimeout(() => { try { old.dispose(); } catch { /* ignore */ } }, 1800);
      }
      this.filePlayer = next;
      return true;
    } catch {
      try { next.dispose(); } catch { /* ignore */ }
      this.fileAvailability[eraId] = false;
      return false;
    }
  }

  /** Démarre la boucle ambient sur la palette courante. */
  async startMusic(eraId?: AudioEraId) {
    await this.init();
    if (eraId) this.currentEra = eraId;
    this.stopMusic();
    if (!this.isMusicOn) return;

    // Tentative fichier d'abord — si un MP3 d'ère existe, on l'utilise
    // au lieu de la générative. Permet d'ajouter de la musique réelle
    // simplement en posant des fichiers dans public/audio/eras/.
    const fileOk = await this.tryLoadEraFile(this.currentEra);
    if (fileOk) return;

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
    if (this.filePlayer) {
      try {
        this.filePlayer.fadeOut = 0.6;
        this.filePlayer.stop('+0.6');
        const p = this.filePlayer;
        setTimeout(() => { try { p.dispose(); } catch { /* ignore */ } }, 800);
      } catch { /* ignore */ }
      this.filePlayer = undefined;
    }
  }

  setMusicEnabled(on: boolean) {
    const wasOn = this.isMusicOn;
    this.isMusicOn = on;
    if (!on) {
      this.applyMusicGain();
      this.stopMusic();
      return;
    }
    /* Fade-in en douceur lors de la PREMIÈRE activation : on part
     * de 0 et on monte sur 1.5 s. Évite l'attaque brutale dont
     * plusieurs testeurs ont fait remonter (« la musique démarre
     * trop fort dès le 1er clic »). Les activations suivantes
     * réutilisent la transition naturelle. */
    if (!wasOn) {
      if (this.musicGain) this.musicGain.gain.value = 0;
      if (this.fileGain) this.fileGain.gain.value = 0;
      this.applyAllGains(1500);
    } else {
      this.applyMusicGain();
    }
  }

  setMusicVolume(v: number) {
    this.musicVol = v;
    this.applyMusicGain();
  }

  setSfxVolume(v: number) {
    this.sfxVol = v;
    this.applyAllGains(0);
  }

  setFileVolume(v: number) {
    this.fileVol = v;
    this.applyAllGains(0);
  }

  /** Coupure progressive (cérémonies, interlude solennel).
   *  factor = 0 → coupé. factor = 1 → plein volume. */
  fadeMusicTo(factor: number, ms = 600) {
    this.muteFactor = factor;
    this.applyAllGains(ms);
  }

  private targetMusicGain(): number {
    return this.isMusicOn ? this.musicVol * this.muteFactor * this.musicDuckFactor : 0;
  }

  private targetFileGain(): number {
    return this.isMusicOn ? this.fileVol * this.muteFactor * this.musicDuckFactor : 0;
  }

  private targetSfxGain(): number {
    return this.sfxVol * this.sfxDuckFactor;
  }

  private applyMusicGain() {
    this.applyAllGains(0);
  }

  /** Applique les 3 gains avec ramp uniforme.
   *  ms = 0 → application instantanée (init/setVolume). */
  private applyAllGains(ms: number) {
    const tg = (g: Tone.Gain | undefined, target: number) => {
      if (!g) return;
      if (ms <= 0) { g.gain.value = target; return; }
      try { g.gain.rampTo(target, ms / 1000); }
      catch { g.gain.value = target; }
    };
    tg(this.musicGain, this.targetMusicGain());
    tg(this.fileGain, this.targetFileGain());
    tg(this.sfxGain, this.targetSfxGain());
  }

  /* ================= Ducking (side-chain pro) =================
     Quand une scène SFX joue (foule, manif, meeting), la musique
     doit baisser de 6 dB (~0.5x) pour laisser la couche d'ambiance
     respirer. Quand le TTS parle par-dessus, on duck encore plus
     (-12 dB ~0.25x), puis on rétablit en fin de discours. */

  /** Duck la musique à `factor` (0 < factor ≤ 1) avec un fade de `ms`.
   *  factor=0.5 ≈ -6 dB. factor=0.25 ≈ -12 dB. factor=1 = restore. */
  duckMusic(factor: number, ms = 350) {
    this.musicDuckFactor = Math.max(0, Math.min(1, factor));
    this.applyAllGains(ms);
  }

  /** Duck les SFX (utile quand le TTS parle pour que les chuchotements
   *  ne masquent pas le discours). */
  duckSfx(factor: number, ms = 250) {
    this.sfxDuckFactor = Math.max(0, Math.min(1, factor));
    this.applyAllGains(ms);
  }

  /* ================= changements réactifs ================= */

  /** Change l'ère avec crossfade musical court. Si la musique est
   *  active, on relance la boucle avec la nouvelle palette ; pendant
   *  la transition, on baisse-monte le gain pour éviter le saut sec. */
  async setEra(eraId: AudioEraId, opts?: { reducedMotion?: boolean }) {
    if (this.currentEra === eraId) return;
    this.currentEra = eraId;
    if (!this.isMusicOn) return;
    // Stinger court (~700 ms) qui annonce le passage d'époque.
    // Sans ça, les testeurs (Astrid) ne sentaient pas la transition
    // — la musique changeait sans signal narratif.
    void this.eraTransitionStinger();
    // 2000 ms (au lieu de 1200) : transition plus organique.
    await this.crossfadeRestart(opts?.reducedMotion ? 320 : 2000);
  }

  /** Stinger de transition d'ère — gong-cloche court 5e + octave +
   *  tierce, joué via themeSynth (routé via sfxGain donc audible
   *  même quand la musique est ducké pendant le crossfade). */
  private async eraTransitionStinger() {
    await this.init();
    if (this.sfxVol <= 0) return;
    const now = Tone.now();
    try {
      // Cloche fondamentale (sous-marine), puis 5e qui s'épanouit
      this.themeSynth?.triggerAttackRelease(['C3'], '2n', now, 0.55);
      this.themeSynth?.triggerAttackRelease(['G3', 'C4'], '2n', now + 0.18, 0.4);
      // Étincelle aiguë qui marque le changement
      this.sfxSynth?.triggerAttackRelease('E5', '8n', now + 0.45, 0.35);
    } catch { /* ignore */ }
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

  /** Helper interne : ramp down → restart → ramp up.
   *  Synchrone sur musicGain ET fileGain (sinon le file player garde
   *  son volume pendant la transition d'ère). */
  private async crossfadeRestart(ms: number) {
    if (!this.musicGain) {
      await this.startMusic();
      return;
    }
    const half = ms / 2 / 1000;
    try {
      this.musicGain.gain.rampTo(0, half);
      this.fileGain?.gain.rampTo(0, half);
    } catch { /* ignore */ }
    await new Promise(res => setTimeout(res, ms / 2));
    await this.startMusic();
    try {
      this.musicGain.gain.rampTo(this.targetMusicGain(), half);
      this.fileGain?.gain.rampTo(this.targetFileGain(), half);
    } catch {
      this.musicGain.gain.value = this.targetMusicGain();
      if (this.fileGain) this.fileGain.gain.value = this.targetFileGain();
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

  /** Easter egg « Internationale » — joué à la place du thème
   *  générique sur les endings refondation et resistance. Demande
   *  formulée par la testeuse Hélène (déléguée CGT). On charge le
   *  fichier entre_deux_guerres.mp3 (déjà déployé en DP) et on le
   *  joue 30 s en boucle douce, puis fadeOut. */
  async playInternationaleEasterEgg() {
    await this.init();
    if (this.sfxVol <= 0 && this.musicVol <= 0) return;
    const url = `${import.meta.env.BASE_URL ?? '/'}audio/eras/entre_deux_guerres.mp3`;
    try {
      const player = await new Promise<Tone.Player>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout')), 8000);
        const p: Tone.Player = new Tone.Player({
          url,
          loop: false,
          fadeIn: 1.6,
          fadeOut: 2.5,
          onload: () => { clearTimeout(timer); resolve(p); },
          onerror: () => { clearTimeout(timer); reject(new Error('decode')); },
        });
      });
      // Routé via sfxGain comme les thèmes d'ending (audible sans
      // dépendre de la musique d'ambient qui est coupée à l'ending).
      player.connect(this.sfxGain!);
      player.start();
      // Stop programmé après ~25 s avec fadeOut 2.5 s
      setTimeout(() => { try { player.stop(); } catch { /* ignore */ } }, 25000);
      setTimeout(() => { try { player.dispose(); } catch { /* ignore */ } }, 30000);
    } catch { /* fallback : on laisse l'ending generic */ }
  }

  /* ================= SFX fichiers (foule, applaudissements…) ================= */

  /** Cache de Tone.Player par identifiant SFX. Lazy-créé. */
  private sfxFilePlayers: Partial<Record<SfxFileId, Tone.Player>> = {};
  /** Cache des disponibilités (HEAD probe). undefined = jamais testé. */
  private sfxFileAvailability: Partial<Record<SfxFileId, boolean>> = {};

  private async loadSfxFile(id: SfxFileId): Promise<Tone.Player | null> {
    if (this.sfxFilePlayers[id]) return this.sfxFilePlayers[id]!;
    if (this.sfxFileAvailability[id] === false) return null;
    const url = `${import.meta.env.BASE_URL ?? '/'}audio/sfx/${id}.mp3`;
    try {
      const head = await fetch(url, { method: 'HEAD' });
      if (!head.ok) {
        this.sfxFileAvailability[id] = false;
        return null;
      }
      this.sfxFileAvailability[id] = true;
    } catch {
      this.sfxFileAvailability[id] = false;
      return null;
    }
    try {
      /* Idem hybrid loader d'ère : on attend onload pour éviter la
       * race condition de Tone.loaded() entre plusieurs SFX files. */
      const player = await new Promise<Tone.Player>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout')), 8000);
        const p: Tone.Player = new Tone.Player({
          url,
          fadeIn: 0.05,
          fadeOut: 0.4,
          onload: () => { clearTimeout(timer); resolve(p); },
          onerror: () => { clearTimeout(timer); reject(new Error('decode')); },
        });
      });
      player.connect(this.sfxGain!);
      this.sfxFilePlayers[id] = player;
      return player;
    } catch {
      this.sfxFileAvailability[id] = false;
      return null;
    }
  }

  /** Joue un SFX fichier en one-shot. Idempotent : un nouveau déclenchement
   *  pendant que le précédent joue le coupe et le redémarre.
   *
   *  Sur les one-shots (pas en loop), on applique une micro-variation :
   *  pitch ±5 % (~80 cents) + gain ±2 dB. Évite l'effet « robot » des
   *  applaudissements qui sonnent à l'identique 10 fois d'affilée. */
  async playSfxFile(id: SfxFileId, opts?: { gain?: number; loop?: boolean; vary?: boolean }) {
    if (this.sfxVol <= 0) return;
    await this.init();
    const player = await this.loadSfxFile(id);
    if (!player) return;
    const isLoop = opts?.loop ?? false;
    const vary = opts?.vary ?? !isLoop; // par défaut on varie les one-shots
    try {
      if (player.state === 'started') player.stop();
      const baseGain = opts?.gain ?? 1;
      const gainVar = vary ? (1 + (Math.random() - 0.5) * 0.45) : 1;
      const pitchVar = vary ? (1 + (Math.random() - 0.5) * 0.10) : 1;
      player.volume.value = Tone.gainToDb(baseGain * gainVar);
      player.playbackRate = pitchVar;
      player.loop = isLoop;
      player.start();
    } catch { /* ignore */ }
  }

  /** Stoppe un SFX en boucle (foule, ambiance). */
  stopSfxFile(id: SfxFileId, fadeOut = 0.6) {
    const player = this.sfxFilePlayers[id];
    if (!player) return;
    try {
      player.fadeOut = fadeOut;
      player.stop();
    } catch { /* ignore */ }
  }

  /* ================= scènes audio (manif / meeting / signature) ================= */

  /** Active la couche d'ambiance sonore d'une scène politique.
   *  Boucle la foule appropriée par-dessus la musique d'ère.
   *  Appeler `endScene()` pour couper.
   *
   *  Side-chain ducking : la musique baisse de ~6 dB pour laisser
   *  la couche d'ambiance respirer (technique standard du sound
   *  design de jeu — diff entre amateur et pro). */
  async beginScene(scene: SceneAudioId) {
    if (this.sfxVol <= 0) return;
    await this.init();
    this.endScene();
    this.activeScene = scene;
    const layers = SCENE_LAYERS[scene];
    for (const layer of layers) {
      this.playSfxFile(layer.id, { gain: layer.gain, loop: layer.loop ?? true });
    }
    // Duck la musique : attaque rapide (120 ms) pour qu'on sente le
    // déclenchement de la scène ; release plus lent ailleurs.
    this.duckMusic(0.5, 120);
  }

  endScene() {
    if (!this.activeScene) return;
    const layers = SCENE_LAYERS[this.activeScene];
    for (const layer of layers) {
      if (layer.loop ?? true) this.stopSfxFile(layer.id);
    }
    this.activeScene = undefined;
    // Restitue la musique
    this.duckMusic(1, 800);
  }

  private activeScene?: SceneAudioId;

  /** Petit crescendo d'applaudissements one-shot (validation, ovation). */
  async ovation(intensity: 'soft' | 'strong' = 'strong') {
    await this.playSfxFile(intensity === 'strong' ? 'crowd-cheer' : 'applause-soft', {
      gain: intensity === 'strong' ? 0.9 : 0.7,
    });
  }

  /** Bruit de stylo + papier pour souligner un instant de signature. */
  async sceneSignaturePaper() {
    await this.init();
    if (this.sfxVol <= 0) return;
    // Papier d'abord, plume ensuite (court enchaînement)
    this.playSfxFile('paper-rustle', { gain: 0.7 });
    setTimeout(() => this.playSfxFile('pen-sign', { gain: 0.8 }), 700);
  }
}

export const audio = new AudioEngine();
