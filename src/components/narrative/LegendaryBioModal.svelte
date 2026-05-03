<script lang="ts">
  /* ============================================================
     LegendaryBioModal — fiche du personnage légendaire
     ============================================================
     Ouverte au clic sur la phrase légendaire dans la conséquence
     (cf. retour panel — Norman, Yasmine, Hélène : « Je voudrais
     savoir qui était ce personnage »).

     Contient bio longue, signature, années, ère. Lecture immersive,
     fond parchemin sépia.
     ============================================================ */
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import type { LegendaryCharacter } from '../../game/content/legendaryCharacters';

  interface Props {
    legendary: LegendaryCharacter;
    onClose: () => void;
  }
  let { legendary, onClose }: Props = $props();

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="bio-backdrop"
  in:fade={{ duration: 200 }} out:fade={{ duration: 160 }}
  onclick={onClose}
  role="presentation"
></div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="bio-card"
  in:fly={{ y: 16, duration: 280, easing: cubicOut }}
  out:fly={{ y: 16, duration: 200, easing: cubicOut }}
  role="dialog"
  tabindex="-1"
  aria-modal="true"
  aria-labelledby="bio-title"
  onclick={(e) => e.stopPropagation()}
>
  <header class="bio-head">
    <div class="bio-portrait" data-camp={legendary.camp}>
      <span>{legendary.init}</span>
    </div>
    <div class="bio-id">
      <h2 id="bio-title">{legendary.name}</h2>
      <p class="bio-meta">
        <span class="years">{legendary.years}</span>
        <span class="sep">·</span>
        <span class="era">{legendary.era}</span>
        <span class="sep">·</span>
        <span class="camp" data-camp={legendary.camp}>
          {legendary.camp === 'patron' ? 'Patronat' : 'Salariat'}
        </span>
      </p>
    </div>
    <button class="bio-close" type="button" onclick={onClose} aria-label="Fermer la fiche">×</button>
  </header>

  {#if legendary.signature}
    <blockquote class="bio-quote">
      « {legendary.signature} »
    </blockquote>
  {/if}

  <div class="bio-text">
    {#each legendary.bio.split('\n\n') as para}
      <p>{para}</p>
    {/each}
  </div>

  <footer class="bio-foot">
    <button type="button" class="bio-foot-btn" onclick={onClose}>
      Refermer la fiche
    </button>
  </footer>
</div>

<style>
  .bio-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(13, 16, 20, 0.85);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 90;
  }

  .bio-card {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 91;
    width: min(640px, calc(100vw - 2rem));
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    background:
      repeating-linear-gradient(0deg,
        rgba(180, 140, 90, 0.05) 0,
        rgba(180, 140, 90, 0.05) 1px,
        transparent 1px,
        transparent 5px),
      linear-gradient(180deg, #f4ead0 0%, #e8d8a8 100%);
    border: 1px solid #C9B26A;
    border-radius: 0.6rem;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.65);
    color: #2a1a0e;
    padding: 1.2rem 1.4rem 1.4rem;
  }

  .bio-head {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.85rem;
    align-items: center;
    padding-bottom: 0.85rem;
    margin-bottom: 0.85rem;
    border-bottom: 1px solid rgba(122, 70, 30, 0.25);
  }

  .bio-portrait {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 800;
    font-size: 1.05rem;
    letter-spacing: 0.04em;
    color: #f4ead0;
    border: 2px solid #5A2F1C;
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.25),
      inset 0 -2px 4px rgba(0, 0, 0, 0.25),
      0 2px 6px rgba(0, 0, 0, 0.35);
  }
  .bio-portrait[data-camp='salarie'] {
    background: linear-gradient(135deg, #B0181E 0%, #5A1410 100%);
  }
  .bio-portrait[data-camp='patron'] {
    background: linear-gradient(135deg, #1E5C8A 0%, #0F2C4A 100%);
  }

  .bio-id { min-width: 0; }
  .bio-id h2 {
    margin: 0 0 0.2rem 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.35rem;
    color: #4a2818;
    letter-spacing: 0.02em;
  }
  .bio-meta {
    margin: 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(74, 40, 24, 0.75);
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    align-items: baseline;
  }
  .sep { color: rgba(74, 40, 24, 0.4); }
  .camp[data-camp='salarie'] { color: #8B1F1B; font-weight: 700; }
  .camp[data-camp='patron']  { color: #1E5C8A; font-weight: 700; }

  .bio-close {
    background: transparent;
    border: 1px solid rgba(122, 70, 30, 0.4);
    color: #4a2818;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 1.1rem;
    cursor: pointer;
    line-height: 1;
    align-self: start;
    transition: background 0.15s ease;
  }
  .bio-close:hover {
    background: rgba(122, 70, 30, 0.12);
  }

  .bio-quote {
    margin: 0 0 1rem 0;
    padding: 0.7rem 1rem;
    background: rgba(122, 70, 30, 0.08);
    border-left: 3px solid #B0181E;
    font-family: 'Source Serif 4', Georgia, serif;
    font-style: italic;
    font-size: 1rem;
    color: #4a2818;
    line-height: 1.45;
  }

  .bio-text {
    font-family: 'Source Serif 4', Georgia, serif;
    color: #2a1a0e;
    font-size: 0.92rem;
    line-height: 1.6;
  }
  .bio-text p {
    margin: 0 0 0.85rem 0;
  }
  .bio-text p:last-child { margin-bottom: 0; }

  .bio-foot {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
    padding-top: 0.85rem;
    border-top: 1px solid rgba(122, 70, 30, 0.25);
  }

  .bio-foot-btn {
    padding: 0.5rem 1.2rem;
    background: linear-gradient(180deg, #5A2F1C 0%, #3D1E10 100%);
    color: #f4ead0;
    border: 1px solid #5A2F1C;
    border-radius: 0.35rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: filter 0.18s ease;
  }
  .bio-foot-btn:hover { filter: brightness(1.15); }

  @media (max-width: 600px) {
    .bio-card { padding: 1rem; }
    .bio-id h2 { font-size: 1.15rem; }
    .bio-text { font-size: 0.86rem; }
  }
</style>
