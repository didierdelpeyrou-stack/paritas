<script lang="ts">
  /* ============================================================
     TheatrePortraitPanel — panneau gauche en mode Théâtre (CK3)
     ============================================================
     Inspiration : Henrik Fåhraeus (CK3) — « Le portrait est
     OMNIPRÉSENT ». Donne à l'incarnation du joueur un poids
     visuel équivalent à celui de l'événement central.

     Composition :
     - Portrait circulaire 120px avec cadre doré gravé
     - Nom du joueur (Cinzel grand)
     - Camp + organisation
     - Trait dominant
     - Score globale (Courier Prime, large)
     - Tension intérieure (jauge fine)
     - Mentor légendaire en bas (mini-portrait + nom)
     ============================================================ */
  import type { RebirthGameState } from '../../game/types';
  import { TRAIT_LABELS } from '../../game/narrative/personalityEngine';
  import { legendaryById } from '../../game/content/legendaryCharacters';

  interface Props {
    state: RebirthGameState;
    onOpenLegendaryBio?: () => void;
  }
  let { state: gs, onOpenLegendaryBio }: Props = $props();

  let initial = $derived(
    gs.name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  );

  let dominantLabel = $derived(TRAIT_LABELS[gs.dominantTrait]);

  /* Score globale = moyenne pondérée 7 ressources, identique au top header. */
  let scoreGlobal = $derived.by(() => {
    const r = gs.resources;
    const total = (r.confiance + r.caisse + r.santeSociale + r.legitimite +
      r.rapportDeForce + r.cohesionInterne + r.institution) / 7;
    return Math.round(total);
  });

  /* Tension intérieure (Damasio #58, Grandin #89) */
  let tension = $derived.by(() => {
    const s = gs.personalityStress;
    if (s < 25) return { label: 'Serein·e', tone: '#8DC09F', pct: s };
    if (s < 50) return { label: 'En tension', tone: '#C9B26A', pct: s };
    if (s < 75) return { label: 'Sous pression', tone: '#D9821C', pct: s };
    return { label: 'Au bord de la rupture', tone: '#E08F92', pct: s };
  });

  let legendary = $derived(gs.legendaryId ? legendaryById(gs.legendaryId) : undefined);

  /* Couleurs camp pour le cadre du portrait. */
  let campAccent = $derived.by(() => {
    const c = gs.camp;
    if (c === 'patron') return { primary: '#1E5C8A', shadow: '#0F2C4A' };
    return { primary: '#8B1F1B', shadow: '#5A1410' };
  });
</script>

<aside class="theatre-portrait-panel" aria-label="Profil du joueur">
  <!-- Portrait : grand cercle avec cadre gravé, ombre intérieure -->
  <div class="portrait-frame" style:--c-primary={campAccent.primary} style:--c-shadow={campAccent.shadow}>
    <div class="portrait-circle" title={gs.name}>
      <span class="initials">{initial}</span>
    </div>
    <!-- Camp pictogramme en bas-droite du portrait -->
    <span class="camp-glyph" data-camp={gs.camp} aria-hidden="true">
      {gs.camp === 'patron' ? '◆' : '✦'}
    </span>
  </div>

  <!-- Identité textuelle -->
  <div class="identity">
    <h2 class="player-name">{gs.name || 'Joueur·se'}</h2>
    {#if gs.organization?.name}
      <p class="org-name">{gs.organization.name}</p>
    {/if}
    <p class="trait-line">
      <span class="trait-glyph">★</span>
      <span class="trait-label">{dominantLabel}</span>
    </p>
  </div>

  <!-- Score globale -->
  <div class="score-block" title="Position globale — moyenne pondérée des 7 ressources.">
    <div class="score-num">{scoreGlobal}</div>
    <div class="score-tag">/ 100 · Position globale</div>
  </div>

  <!-- Tension intérieure -->
  <div class="tension-block" title="Tension intérieure : monte quand tu agis contre ton trait dominant.">
    <div class="tension-label">
      <span>Tension</span>
      <strong style:color={tension.tone}>{tension.label}</strong>
    </div>
    <div class="tension-bar">
      <i style:width="{tension.pct}%" style:background={tension.tone}></i>
    </div>
  </div>

  <!-- Mentor légendaire (bas du panel, optionnel) -->
  {#if legendary}
    <button type="button" class="mentor-block"
      onclick={() => onOpenLegendaryBio?.()}
      title={`Cliquer pour ouvrir la fiche de ${legendary.name}.`}
    >
      <div class="mentor-portrait" data-camp={legendary.camp}>
        <span>{legendary.init}</span>
      </div>
      <div class="mentor-text">
        <span class="mentor-tag">Ton ombre</span>
        <span class="mentor-name">{legendary.name}</span>
      </div>
    </button>
  {:else}
    <div class="mentor-block self-mentor">
      <div class="mentor-portrait empty"><span>◯</span></div>
      <div class="mentor-text">
        <span class="mentor-tag">Sans mentor</span>
        <span class="mentor-name">Tu es seul·e</span>
      </div>
    </div>
  {/if}
</aside>

<style>
  .theatre-portrait-panel {
    --c-primary: #5A2F1C;
    --c-shadow: #2A1A0E;
    width: 200px;
    flex-shrink: 0;
    padding: 1.25rem 0.85rem 1rem;
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.06), transparent 70%),
      linear-gradient(180deg, #1F1813 0%, #110D0A 100%);
    border-right: 1px solid rgba(201, 178, 106, 0.25);
    color: #F4EFE2;
    font-family: 'Source Serif 4', Georgia, serif;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.95rem;
    /* scrollbar discret */
    scrollbar-width: thin;
    scrollbar-color: rgba(201, 178, 106, 0.25) transparent;
  }

  /* === Portrait grand format === */
  .portrait-frame {
    position: relative;
    width: 130px;
    height: 130px;
    margin: 0 auto;
  }

  .portrait-circle {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background:
      radial-gradient(circle at 35% 30%,
        color-mix(in srgb, var(--c-primary) 80%, #F4D58C) 0%,
        var(--c-primary) 60%,
        var(--c-shadow) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      inset 0 4px 10px rgba(255, 255, 255, 0.18),
      inset 0 -6px 12px rgba(0, 0, 0, 0.32),
      0 6px 18px rgba(0, 0, 0, 0.55),
      0 0 0 3px rgba(244, 213, 140, 0.45),
      0 0 0 4px var(--c-shadow);
  }

  .initials {
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 800;
    font-size: 2.4rem;
    color: #F4EFE2;
    letter-spacing: 0.05em;
    text-shadow:
      0 1px 0 rgba(255, 255, 255, 0.35),
      0 -1px 2px rgba(0, 0, 0, 0.4);
  }

  .camp-glyph {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(180deg, #2A1A0E 0%, #110D0A 100%);
    border: 1.5px solid #C9B26A;
    color: #F4D58C;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.85rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  }
  .camp-glyph[data-camp='patron'] { color: #7DB1D8; }
  .camp-glyph[data-camp='salarie'] { color: #E08F92; }

  /* === Identité === */
  .identity {
    text-align: center;
  }
  .player-name {
    margin: 0 0 0.18rem 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.05rem;
    color: #F4D58C;
    letter-spacing: 0.04em;
    line-height: 1.2;
  }
  .org-name {
    margin: 0 0 0.35rem 0;
    font-size: 0.74rem;
    color: rgba(244, 239, 226, 0.7);
    font-style: italic;
    line-height: 1.2;
  }
  .trait-line {
    margin: 0;
    display: inline-flex;
    align-items: baseline;
    gap: 0.3rem;
    padding: 0.18rem 0.55rem;
    background: rgba(201, 178, 106, 0.10);
    border: 1px solid rgba(201, 178, 106, 0.32);
    border-radius: 999px;
    font-size: 0.72rem;
  }
  .trait-glyph { color: #C9B26A; }
  .trait-label {
    color: #F4D58C;
    font-style: italic;
    letter-spacing: 0.02em;
  }

  /* === Score globale === */
  .score-block {
    text-align: center;
    padding: 0.55rem 0;
    border-top: 1px solid rgba(201, 178, 106, 0.18);
    border-bottom: 1px solid rgba(201, 178, 106, 0.18);
    cursor: help;
  }
  .score-num {
    font-family: 'Courier Prime', monospace;
    font-size: 2.2rem;
    font-weight: 700;
    color: #F4D58C;
    line-height: 1;
    text-shadow: 0 0 12px rgba(244, 213, 140, 0.3);
  }
  .score-tag {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.6rem;
    color: rgba(244, 239, 226, 0.55);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 0.1rem;
  }

  /* === Tension intérieure === */
  .tension-block { cursor: help; }
  .tension-label {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 0.68rem;
    color: rgba(244, 239, 226, 0.7);
    font-family: 'Cinzel', Georgia, serif;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.25rem;
  }
  .tension-label strong {
    font-style: italic;
    text-transform: none;
    font-family: 'Source Serif 4', Georgia, serif;
    font-weight: 600;
    font-size: 0.74rem;
  }
  .tension-bar {
    height: 4px;
    background: rgba(13, 11, 8, 0.5);
    border-radius: 2px;
    overflow: hidden;
  }
  .tension-bar i {
    display: block;
    height: 100%;
    transition: width 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
    box-shadow: 0 0 6px currentColor;
  }

  /* === Mentor légendaire === */
  .mentor-block {
    margin-top: auto; /* pousse vers le bas */
    display: grid;
    grid-template-columns: 40px 1fr;
    align-items: center;
    gap: 0.55rem;
    padding: 0.55rem 0.65rem;
    background: rgba(201, 178, 106, 0.06);
    border: 1px solid rgba(201, 178, 106, 0.25);
    border-radius: 0.4rem;
    color: #F4EFE2;
    text-align: left;
    font: inherit;
    cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease;
  }
  .mentor-block:hover:not(.self-mentor) {
    background: rgba(201, 178, 106, 0.14);
    border-color: rgba(201, 178, 106, 0.5);
  }
  .mentor-block.self-mentor { cursor: default; }

  .mentor-portrait {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #B0181E 0%, #5A1410 100%);
    color: #F4EFE2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.78rem;
    border: 1.5px solid rgba(201, 178, 106, 0.6);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  .mentor-portrait[data-camp='patron'] {
    background: linear-gradient(135deg, #1E5C8A 0%, #0F2C4A 100%);
  }
  .mentor-portrait.empty {
    background: rgba(40, 45, 55, 0.4);
    color: rgba(200, 210, 220, 0.65);
  }

  .mentor-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .mentor-tag {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.58rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(244, 213, 140, 0.65);
  }
  .mentor-name {
    font-size: 0.78rem;
    color: #F4D58C;
    font-style: italic;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 1280px) {
    /* En Atelier le panneau ne devrait pas être rendu (CockpitShell
       gate via isTheatre) — fallback safety si jamais. */
    .theatre-portrait-panel { display: none; }
  }
</style>
