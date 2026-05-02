<script lang="ts">
  /**
   * Panneau d'options d'accessibilité — UX-6.
   *
   * Trois leviers minimums (cf. WCAG + recherche dyslexie/daltonisme) :
   * - Taille de texte (S / M / L) : scale relatif via CSS root
   * - Contraste renforcé : passe à du blanc pur sur fond plus sombre
   * - Mode redondance daltoniens : ajoute des chevrons + signes
   *   non-chromatiques sur les indicateurs positif/négatif
   *
   * Préférences persistées en localStorage et appliquées au mount via
   * SettingsApplier (ce composant) en attribuant des classes au <html>.
   */
  import { fade, fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { sfx } from '../game/audio/sfx';

  interface Props {
    open: boolean;
    onClose: () => void;
  }
  let { open, onClose }: Props = $props();

  type TextSize = 'sm' | 'md' | 'lg';
  let textSize = $state<TextSize>(loadTextSize());
  let highContrast = $state<boolean>(loadHighContrast());
  let colorBlindFriendly = $state<boolean>(loadColorBlind());
  let reducedMotion = $state<boolean>(loadReducedMotion());
  let swipeEnabled = $state<boolean>(loadSwipeEnabled());
  let textMode = $state<'falc' | 'litteraire'>(loadTextMode());
  const TS_KEY = 'paritas_text_size';
  const HC_KEY = 'paritas_high_contrast';
  const CB_KEY = 'paritas_color_blind';
  const RM_KEY = 'paritas_reduced_motion';
  const SW_KEY = 'paritas_swipe_enabled';
  const TM_KEY = 'paritas_text_mode';
  const MV_KEY = 'paritas_music_volume';
  const SV_KEY = 'paritas_sfx_volume';
  const VV_KEY = 'paritas_voice_volume';
  const SG_KEY = 'paritas_speech_granularity';

  /* Volumes (0-100). Persistés. Appliqués via la façade sfx. */
  let musicVolume = $state<number>(loadVolume(MV_KEY, 60));
  let sfxVolume = $state<number>(loadVolume(SV_KEY, 70));
  let voiceVolume = $state<number>(loadVolume(VV_KEY, 85));
  /* Granularité TTS : suggéré par le testeur Quentin. */
  type SpeechGranularity = 'always' | 'ceremonies' | 'never';
  let speechGranularity = $state<SpeechGranularity>(loadSpeechGranularity());
  let creditsOpen = $state(false);

  function loadVolume(key: string, def: number): number {
    try {
      const v = localStorage.getItem(key);
      const n = v === null ? def : Number(v);
      return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : def;
    } catch { return def; }
  }

  function loadSpeechGranularity(): SpeechGranularity {
    try {
      const v = localStorage.getItem(SG_KEY);
      if (v === 'always' || v === 'ceremonies' || v === 'never') return v;
    } catch { /* ignore */ }
    return 'ceremonies';
  }

  function loadTextMode(): 'falc' | 'litteraire' {
    try {
      return localStorage.getItem(TM_KEY) === 'litteraire' ? 'litteraire' : 'falc';
    } catch {
      return 'falc';
    }
  }

  function loadTextSize(): TextSize {
    try {
      const v = localStorage.getItem(TS_KEY);
      if (v === 'sm' || v === 'md' || v === 'lg') return v;
    } catch {
      /* ignore */
    }
    return 'md';
  }

  function loadHighContrast(): boolean {
    try { return localStorage.getItem(HC_KEY) === 'true'; } catch { return false; }
  }

  function loadColorBlind(): boolean {
    try { return localStorage.getItem(CB_KEY) === 'true'; } catch { return false; }
  }

  function loadReducedMotion(): boolean {
    try { return localStorage.getItem(RM_KEY) === 'true'; } catch { return false; }
  }

  function loadSwipeEnabled(): boolean {
    try { return localStorage.getItem(SW_KEY) === 'true'; } catch { return false; }
  }

  function apply() {
    const root = document.documentElement;
    root.classList.toggle('a11y-text-sm', textSize === 'sm');
    root.classList.toggle('a11y-text-md', textSize === 'md');
    root.classList.toggle('a11y-text-lg', textSize === 'lg');
    root.classList.toggle('a11y-high-contrast', highContrast);
    root.classList.toggle('a11y-color-blind', colorBlindFriendly);
    root.classList.toggle('a11y-reduced-motion', reducedMotion);
    try {
      localStorage.setItem(TS_KEY, textSize);
      localStorage.setItem(HC_KEY, highContrast ? 'true' : 'false');
      localStorage.setItem(CB_KEY, colorBlindFriendly ? 'true' : 'false');
      localStorage.setItem(RM_KEY, reducedMotion ? 'true' : 'false');
      localStorage.setItem(SW_KEY, swipeEnabled ? 'true' : 'false');
      localStorage.setItem(TM_KEY, textMode);
      localStorage.setItem(MV_KEY, String(musicVolume));
      localStorage.setItem(SV_KEY, String(sfxVolume));
      localStorage.setItem(VV_KEY, String(voiceVolume));
      localStorage.setItem(SG_KEY, speechGranularity);
    } catch {
      /* ignore */
    }
    /* Volumes appliqués via la façade. Music = synth + file (gérés
     * en interne au moteur), SFX = ambiances + applaudissements,
     * Voice = utterance.volume du SpeechSynthesis. */
    try {
      sfx.setMusicVolume(musicVolume / 100);
      sfx.setSfxVolume(sfxVolume / 100);
    } catch { /* ignore : sfx pas encore loadé */ }
  }

  /* Réapplique à chaque changement (hooks Svelte 5). */
  $effect(() => {
    void textSize; void highContrast; void colorBlindFriendly; void reducedMotion; void swipeEnabled; void textMode;
    void musicVolume; void sfxVolume; void voiceVolume; void speechGranularity;
    apply();
  });

  onMount(() => {
    apply();
  });

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) onClose();
  }
</script>

<svelte:window onkeydown={onKey} />

{#if open}
  <div
    class="modal-backdrop"
    onclick={onClose}
    role="presentation"
    in:fade={{ duration: 200 }}
  >
    <div
      class="modal-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      in:fly={{ y: 8, duration: 240 }}
    >
      <header class="modal-head">
        <h2 id="settings-title" class="font-display text-xl text-gold">Accessibilité</h2>
        <button type="button" class="close-btn" onclick={onClose} aria-label="Fermer">×</button>
      </header>

      <section class="opt-group">
        <h3>Taille de texte</h3>
        <div class="seg-control" role="radiogroup">
          {#each (['sm', 'md', 'lg'] as TextSize[]) as ts}
            <button
              type="button"
              role="radio"
              aria-checked={textSize === ts}
              data-active={textSize === ts}
              onclick={() => (textSize = ts)}
            >
              {ts === 'sm' ? 'Petit' : ts === 'md' ? 'Standard' : 'Grand'}
            </button>
          {/each}
        </div>
      </section>

      <section class="opt-toggle">
        <label>
          <input type="checkbox" bind:checked={highContrast} />
          <span class="lbl">
            <b>Contraste renforcé</b>
            <small>Texte plus clair sur fond plus sombre. Améliore la lecture en plein soleil ou avec une vue fatiguée.</small>
          </span>
        </label>
      </section>

      <section class="opt-toggle">
        <label>
          <input type="checkbox" bind:checked={colorBlindFriendly} />
          <span class="lbl">
            <b>Mode daltonien</b>
            <small>Ajoute des chevrons (▲/▼) aux gains et pertes. Ne dépend plus uniquement des couleurs vert/rouge.</small>
          </span>
        </label>
      </section>

      <section class="opt-toggle">
        <label>
          <input type="checkbox" bind:checked={reducedMotion} />
          <span class="lbl">
            <b>Animations réduites</b>
            <small>Désactive pulses, shakes et compteurs animés pour les sensibilités vestibulaires.</small>
          </span>
        </label>
      </section>

      <section class="opt-toggle">
        <label>
          <input type="checkbox" bind:checked={swipeEnabled} />
          <span class="lbl">
            <b>Choix par glissement (mobile)</b>
            <small>Active le swipe pour choisir : gauche / haut / droite. <b>Désactivé par défaut</b> — gardé pour les joueurs habitués au geste tactile. Sinon, taper le bouton fonctionne toujours.</small>
          </span>
        </label>
      </section>

      <section class="opt-group">
        <h3>Volumes</h3>
        <label class="vol-row">
          <span class="vol-label">Musique <small>{musicVolume}</small></span>
          <input type="range" min="0" max="100" step="5" bind:value={musicVolume} />
        </label>
        <label class="vol-row">
          <span class="vol-label">Bruitages, foules <small>{sfxVolume}</small></span>
          <input type="range" min="0" max="100" step="5" bind:value={sfxVolume} />
        </label>
        <label class="vol-row">
          <span class="vol-label">Voix (discours TTS) <small>{voiceVolume}</small></span>
          <input type="range" min="0" max="100" step="5" bind:value={voiceVolume} />
        </label>
        <p class="opt-hint">
          Trois leviers indépendants — utile si la voix de synthèse de votre
          navigateur est plus forte ou plus faible que la musique.
        </p>
      </section>

      <section class="opt-group">
        <h3>Discours générés (TTS)</h3>
        <div class="seg-control" role="radiogroup">
          <button type="button" role="radio"
            aria-checked={speechGranularity === 'always'}
            data-active={speechGranularity === 'always'}
            onclick={() => (speechGranularity = 'always')}>Tout</button>
          <button type="button" role="radio"
            aria-checked={speechGranularity === 'ceremonies'}
            data-active={speechGranularity === 'ceremonies'}
            onclick={() => (speechGranularity = 'ceremonies')}>Cérémonies</button>
          <button type="button" role="radio"
            aria-checked={speechGranularity === 'never'}
            data-active={speechGranularity === 'never'}
            onclick={() => (speechGranularity = 'never')}>Jamais</button>
        </div>
        <p class="opt-hint">
          <b>Cérémonies</b> : voix lue uniquement aux signatures et endings
          (par défaut, pour ne pas couper la conversation à voix haute).
          <b>Tout</b> : aussi pendant manifestations et meetings.
          <b>Jamais</b> : sous-titres seulement.
        </p>
      </section>

      <section class="opt-group">
        <h3>Crédits audio</h3>
        <button type="button" class="credits-btn" onclick={() => (creditsOpen = !creditsOpen)}>
          {creditsOpen ? 'Masquer' : 'Voir les sources'}
        </button>
        {#if creditsOpen}
          <div class="credits-content" in:fade={{ duration: 200 }}>
            <h4>Musiques d'ères — domaine public</h4>
            <ul>
              <li><em>La Marseillaise</em> (1792, Rouget de Lisle), enregistrement DP via Wikimedia Commons.</li>
              <li><em>L'Internationale</em> (Pottier / Degeyter), CC0 via Wikimedia Commons.</li>
              <li><em>La Marseillaise</em> version Garde Républicaine, DP via Wikimedia Commons.</li>
            </ul>
            <h4>Musiques d'ères — Pixabay (libre)</h4>
            <p>12 morceaux instrumentaux Pixabay (xixe, belle_epoque, …, present).
              Pas d'attribution requise sous la licence Pixabay.</p>
            <h4>Effets sonores — CC0 1.0</h4>
            <p>The Designer's Choice UCS Collection (Nicholas Judy) sur archive.org —
              applaudissements, cris, chuchotements, papier, plume.</p>
            <h4>Effets sonores — CC BY 4.0 (attribution requise)</h4>
            <p><em>2017-07-01 manif-motards-belfort.ogg</em> par contributeur
              Wikimedia Commons. Licence : <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank" rel="noopener">CC BY 4.0</a>.
              Source : Wikimedia Commons.</p>
            <h4>Discours générés</h4>
            <p>Banque déterministe de textes pré-écrits, lus par
              <code>window.speechSynthesis</code> (voix française du système).</p>
            <h4>Moteur génératif</h4>
            <p>Synthèse temps réel via Tone.js quand un fichier d'ère est
              indisponible. Code source dans <code>src/lib/audio/audio.ts</code>.</p>
          </div>
        {/if}
      </section>

      <section class="opt-group">
        <h3>Style d'écriture</h3>
        <div class="seg-control" role="radiogroup">
          <button
            type="button"
            role="radio"
            aria-checked={textMode === 'falc'}
            data-active={textMode === 'falc'}
            onclick={() => (textMode = 'falc')}
          >FALC</button>
          <button
            type="button"
            role="radio"
            aria-checked={textMode === 'litteraire'}
            data-active={textMode === 'litteraire'}
            onclick={() => (textMode = 'litteraire')}
          >Littéraire</button>
        </div>
        <p class="opt-hint">
          <b>FALC</b> : phrases courtes, vocabulaire simple, pédagogique. <b>Littéraire</b> :
          style dense (uniquement quand Haiku enrichit la scène — sinon le contenu écrit est en FALC).
        </p>
      </section>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(13, 16, 20, 0.85);
    backdrop-filter: blur(2px);
    padding: 1rem;
  }

  .modal-card {
    width: 100%;
    max-width: 30rem;
    border: 1px solid rgba(200, 155, 60, 0.45);
    border-radius: 0.85rem;
    background: linear-gradient(180deg, #1a1f26, #232a33);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
    padding: 1.2rem 1.3rem;
    color: #ede4c9;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(237, 228, 201, 0.12);
    padding-bottom: 0.65rem;
  }

  .close-btn {
    width: 2rem;
    height: 2rem;
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.4rem;
    background: transparent;
    color: rgba(237, 228, 201, 0.7);
    font-size: 1.3rem;
    cursor: pointer;
  }

  .opt-group h3 {
    color: rgba(237, 228, 201, 0.85);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin: 0 0 0.45rem;
  }

  .seg-control {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.5rem;
    overflow: hidden;
    background: rgba(13, 16, 20, 0.4);
  }

  .seg-control button {
    border: 0;
    background: transparent;
    color: rgba(237, 228, 201, 0.7);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    padding: 0.5rem;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .seg-control button + button {
    border-left: 1px solid rgba(237, 228, 201, 0.08);
  }

  .seg-control button:hover {
    color: #ede4c9;
  }

  .seg-control button[data-active='true'] {
    color: #f4d58b;
    background: rgba(201, 154, 64, 0.13);
  }

  /* Sliders volume — la valeur live à droite du label, pour qu'on
     ait un retour numérique pendant le drag (ne pas confondre 30 et 60). */
  .vol-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.35rem;
    margin-bottom: 0.5rem;
  }

  .vol-label {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    color: #ede4c9;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.84rem;
  }

  .vol-label small {
    color: rgba(237, 228, 201, 0.55);
    font-size: 0.78rem;
    font-family: 'Inter', system-ui, sans-serif;
    letter-spacing: 0.04em;
  }

  .vol-row input[type='range'] {
    width: 100%;
    accent-color: #c89b3c;
  }

  .credits-btn {
    background: transparent;
    border: 1px solid rgba(244, 213, 139, 0.35);
    color: #f4d58b;
    border-radius: 0.4rem;
    padding: 0.45rem 0.85rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.82rem;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .credits-btn:hover {
    background: rgba(201, 154, 64, 0.08);
  }

  .credits-content {
    margin-top: 0.7rem;
    padding: 0.85rem 1rem;
    background: rgba(13, 16, 20, 0.55);
    border: 1px solid rgba(244, 213, 139, 0.18);
    border-radius: 0.4rem;
    font-size: 0.84rem;
    color: rgba(237, 228, 201, 0.85);
    line-height: 1.55;
  }

  .credits-content h4 {
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.85rem;
    margin: 0.6rem 0 0.25rem;
  }

  .credits-content h4:first-child { margin-top: 0; }

  .credits-content ul {
    margin: 0;
    padding-left: 1.2rem;
  }

  .credits-content a {
    color: #f4d58b;
    text-decoration: underline;
  }

  .credits-content code {
    font-family: 'Source Code Pro', ui-monospace, monospace;
    font-size: 0.82rem;
    background: rgba(244, 213, 139, 0.08);
    padding: 0 0.3em;
    border-radius: 0.2rem;
  }

  .opt-toggle label {
    display: grid;
    grid-template-columns: 1.5rem 1fr;
    gap: 0.7rem;
    align-items: start;
    cursor: pointer;
    padding: 0.4rem 0.2rem;
    border-radius: 0.4rem;
    transition: background 0.15s ease;
  }

  .opt-toggle label:hover {
    background: rgba(201, 154, 64, 0.04);
  }

  .opt-toggle input[type='checkbox'] {
    margin-top: 0.18rem;
    width: 1.1rem;
    height: 1.1rem;
    accent-color: #c89b3c;
  }

  .lbl b {
    display: block;
    color: #ede4c9;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.84rem;
    letter-spacing: 0.04em;
  }

  .lbl small {
    display: block;
    margin-top: 0.18rem;
    color: rgba(237, 228, 201, 0.65);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.78rem;
    line-height: 1.35;
  }
</style>
