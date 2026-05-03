<script lang="ts">
  /* Instruments — 7 jauges en cadrans laiton (vague α-bis MVP).
     V1 affiche les ressources V2 (Resources interface). Cadran
     analogique simulé avec aiguille SVG qui pivote selon la valeur
     0-100. Hover = tooltip Bourdieu. Honte/Fierté caché jusqu'à
     épilogue (Ernaux #99). */
  import type { Resources } from '../../game/types';
  import { RESOURCE_LABELS, RESOURCE_TOOLTIPS } from '../../game/simulation/resources';

  interface Props {
    resources: Resources;
    /** Tour actuel — sert à la révélation Norman progressive. */
    turn: number;
    /** Honte/Fierté caché tant que la partie n'est pas terminée. */
    showHonteFierte?: boolean;
    /** Si fournie, affiche aussi cette jauge cachée. */
    honteFierte?: number;
  }
  let { resources, turn, showHonteFierte = false, honteFierte = 50 }: Props = $props();

  /* Révélation Norman : tour 1 = Caisse + Confiance seulement.
     Les autres se déverrouillent à des milestones narratifs. */
  const REVEAL_AT: Record<keyof Resources | 'honteFierte', number> = {
    caisse: 1,
    confiance: 1,
    santeSociale: 5,
    legitimite: 10,
    rapportDeForce: 15,
    cohesionInterne: 18,
    institution: 25,
    honteFierte: 9999  // jamais en partie, révélée à l'épilogue seulement
  };

  /* Métadonnées d'affichage (icône + couleur dominante du cadran). */
  const META: Record<keyof Resources, { ico: string; color: string }> = {
    caisse:          { ico: '💰', color: '#C9B26A' },
    confiance:       { ico: '🤝', color: '#1E5C8A' },
    santeSociale:    { ico: '✚',  color: '#3A6B47' },
    legitimite:      { ico: '⚖',  color: '#5C2D5C' },
    rapportDeForce:  { ico: '📢', color: '#D9821C' },
    cohesionInterne: { ico: '✊',  color: '#8B1F1B' },
    institution:    { ico: '⚙',  color: '#7A5C3A' }
  };

  const ORDER: Array<keyof Resources> = [
    'caisse', 'confiance', 'santeSociale', 'legitimite',
    'rapportDeForce', 'cohesionInterne', 'institution'
  ];

  /* Aiguille tourne de -120° (valeur 0) à +120° (valeur 100). */
  function angleFor(value: number): number {
    const v = Math.max(0, Math.min(100, value));
    return -120 + (v / 100) * 240;
  }

  let visible = $derived(ORDER.filter(k => turn >= REVEAL_AT[k]));
</script>

<div class="instruments-strip" role="status" aria-label="Tableau des ressources">
  {#each visible as key}
    {@const value = resources[key]}
    {@const meta = META[key]}
    <button
      type="button"
      class="instrument"
      title={RESOURCE_TOOLTIPS[key]}
      aria-label="{RESOURCE_LABELS[key]} : {Math.round(value)} sur 100"
    >
      <div class="cadran">
        <svg viewBox="0 0 100 60" class="cadran-svg" aria-hidden="true">
          <!-- Arc de fond (zone passive) -->
          <path d="M 12 50 A 38 38 0 0 1 88 50" fill="none"
            stroke="rgba(176, 145, 80, 0.30)" stroke-width="3" stroke-linecap="round"/>
          <!-- Arc de remplissage (selon valeur) -->
          <path d="M 12 50 A 38 38 0 0 1 88 50" fill="none"
            stroke={meta.color} stroke-width="3" stroke-linecap="round"
            stroke-dasharray="119" stroke-dashoffset={119 - (value / 100) * 119}
            class="cadran-arc"/>
          <!-- Aiguille -->
          <line x1="50" y1="50" x2="50" y2="14" stroke="#1A1411"
            stroke-width="2" stroke-linecap="round"
            transform="rotate({angleFor(value)} 50 50)"
            class="cadran-needle"/>
          <!-- Pivot central -->
          <circle cx="50" cy="50" r="3" fill="#B09150"/>
        </svg>
      </div>
      <div class="instrument-label">
        <span class="instrument-ico" aria-hidden="true">{meta.ico}</span>
        <span class="instrument-name">{RESOURCE_LABELS[key]}</span>
      </div>
      <div class="instrument-value" style="color: {meta.color}">
        {Math.round(value)}
      </div>
    </button>
  {/each}

  {#if showHonteFierte}
    <button type="button" class="instrument hidden-jauge"
      title="Jauge cachée — révélée à l'épilogue. Mesure la cohérence entre tes actes et la fidélité à ta base. (Annie Ernaux)"
      aria-label="Honte ou fierté : {Math.round(honteFierte)} sur 100"
    >
      <div class="cadran">
        <svg viewBox="0 0 100 60" class="cadran-svg" aria-hidden="true">
          <path d="M 12 50 A 38 38 0 0 1 88 50" fill="none"
            stroke="rgba(176, 145, 80, 0.30)" stroke-width="3" stroke-linecap="round"/>
          <path d="M 12 50 A 38 38 0 0 1 88 50" fill="none"
            stroke="#C9B26A" stroke-width="3" stroke-linecap="round"
            stroke-dasharray="119" stroke-dashoffset={119 - (honteFierte / 100) * 119}/>
          <line x1="50" y1="50" x2="50" y2="14" stroke="#1A1411"
            stroke-width="2" stroke-linecap="round"
            transform="rotate({angleFor(honteFierte)} 50 50)"/>
          <circle cx="50" cy="50" r="3" fill="#B09150"/>
        </svg>
      </div>
      <div class="instrument-label">
        <span class="instrument-ico" aria-hidden="true">🎭</span>
        <span class="instrument-name">Honte / Fierté</span>
      </div>
      <div class="instrument-value">{Math.round(honteFierte)}</div>
    </button>
  {/if}
</div>

<style>
  .instruments-strip {
    display: flex;
    gap: 0.6rem;
    padding: 0.6rem 1rem;
    background: linear-gradient(180deg, #C9A878 0%, #B89568 100%);
    border-top: 1px solid rgba(90, 47, 28, 0.3);
    border-bottom: 1px solid rgba(90, 47, 28, 0.3);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .instrument {
    flex: 1 1 auto;
    min-width: 78px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    padding: 0.4rem 0.3rem 0.5rem;
    background: linear-gradient(180deg, #D8C088 0%, #C9A878 100%);
    border: 1px solid #8C6E40;
    border-radius: 0.4rem;
    box-shadow:
      inset 0 1px 2px rgba(255, 255, 255, 0.3),
      inset 0 -2px 4px rgba(90, 47, 28, 0.15),
      0 2px 4px rgba(0, 0, 0, 0.15);
    color: #1A1411;
    font-family: 'Cinzel', Georgia, serif;
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  .instrument:hover,
  .instrument:focus-visible {
    transform: translateY(-1px);
    box-shadow:
      inset 0 1px 2px rgba(255, 255, 255, 0.4),
      inset 0 -2px 4px rgba(90, 47, 28, 0.2),
      0 4px 8px rgba(0, 0, 0, 0.2);
    outline: none;
  }

  .cadran {
    width: 100%;
    max-width: 64px;
  }

  .cadran-svg {
    width: 100%;
    height: auto;
    display: block;
  }

  .cadran-arc {
    transition: stroke-dashoffset 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
  }

  .cadran-needle {
    transform-origin: 50px 50px;
    transition: transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
  }

  .instrument-label {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1;
  }

  .instrument-ico {
    font-size: 0.78rem;
  }

  .instrument-name {
    color: rgba(26, 20, 17, 0.78);
    white-space: nowrap;
  }

  .instrument-value {
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1;
    font-family: 'Courier New', monospace;
  }

  .hidden-jauge {
    background: linear-gradient(180deg, #2A1810 0%, #1A1411 100%);
    border-color: #C9B26A;
    color: #F4D58C;
  }

  .hidden-jauge .instrument-name {
    color: rgba(244, 213, 140, 0.78);
  }

  /* Mobile : strip horizontale qui scroll */
  @media (max-width: 768px) {
    .instrument {
      min-width: 64px;
      padding: 0.3rem 0.2rem;
    }
    .cadran { max-width: 48px; }
    .instrument-value { font-size: 0.9rem; }
    .instrument-label { font-size: 0.55rem; }
  }
</style>
