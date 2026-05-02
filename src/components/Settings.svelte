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

  const TS_KEY = 'paritas_text_size';
  const HC_KEY = 'paritas_high_contrast';
  const CB_KEY = 'paritas_color_blind';
  const RM_KEY = 'paritas_reduced_motion';
  const SW_KEY = 'paritas_swipe_enabled';

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
    } catch {
      /* ignore */
    }
  }

  /* Réapplique à chaque changement (hooks Svelte 5). */
  $effect(() => {
    void textSize; void highContrast; void colorBlindFriendly; void reducedMotion; void swipeEnabled;
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
