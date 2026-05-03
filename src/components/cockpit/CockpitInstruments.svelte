<script lang="ts">
  /* ============================================================
     CockpitInstruments — strip d'instruments en cadrans laiton
     ============================================================
     7 jauges en cadrans analogiques + Honte/Fierté caché en mode
     épilogue. Hauteur fixe (compact) pour respecter le viewport-fit
     desktop. Mobile : scroll horizontal mais pas de wrap (préserve
     la métaphore strip).

     Direction : Vignelli #8 (sobriété) + Cooper #13 (icônes
     paritaires métaphoriques) + Soueidan #191 (a11y aria).
     ============================================================ */
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import type { Resources } from '../../game/types';
  import { RESOURCE_LABELS, RESOURCE_TOOLTIPS } from '../../game/simulation/resources';
  import CockpitIcon from './CockpitIcon.svelte';
  import type { IconKey } from './icons';

  interface Props {
    resources: Resources;
    turn: number;
    showHonteFierte?: boolean;
    honteFierte?: number;
  }
  let { resources, turn, showHonteFierte = false, honteFierte = 50 }: Props = $props();

  /* Révélation Norman progressive.
     ⚠ Caisse retirée des dials (retour live test patronat P1 §4 :
     « Je vois la caisse au top ET au dial, c'est redondant »).
     Caisse = chip top header (avec delta numérique), trop volatile
     pour un cadran analogique. Les dials se concentrent sur les
     6 « vital signs » à mouvement plus lent. */
  const REVEAL_AT: Record<string, number> = {
    confiance: 1,
    santeSociale: 5,
    legitimite: 10,
    rapportDeForce: 15,
    cohesionInterne: 18,
    institution: 25
  };

  const META: Record<string, { icon: IconKey; color: string }> = {
    confiance:       { icon: 'carte',     color: '#1E5C8A' },
    santeSociale:    { icon: 'epis',      color: '#3A6B47' },
    legitimite:      { icon: 'balance',   color: '#5C2D5C' },
    rapportDeForce:  { icon: 'pupitre',   color: '#D9821C' },
    cohesionInterne: { icon: 'poing',     color: '#8B1F1B' },
    institution:     { icon: 'rouage',    color: '#7A5C3A' }
  };

  const ORDER: Array<keyof Resources> = [
    'confiance', 'santeSociale', 'legitimite',
    'rapportDeForce', 'cohesionInterne', 'institution'
  ];

  /* Aiguille de -120° (val 0) à +120° (val 100) */
  function angleFor(value: number): number {
    const v = Math.max(0, Math.min(100, value));
    return -120 + (v / 100) * 240;
  }

  /* Couleur arc dynamique selon zone (ok / warn / crit) */
  function arcColor(value: number, base: string): string {
    if (value < 18) return '#B0181E';
    if (value < 30) return '#D9821C';
    return base;
  }

  let visible = $derived(ORDER.filter(k => turn >= REVEAL_AT[k]));
</script>

<div class="instruments-strip" role="status" aria-label="Tableau des ressources">
  {#each visible as key (key)}
    {@const value = resources[key]}
    {@const meta = META[key]}
    {@const arc = arcColor(value, meta.color)}
    <button
      type="button"
      class="instrument"
      title={RESOURCE_TOOLTIPS[key]}
      aria-label="{RESOURCE_LABELS[key]} : {Math.round(value)} sur 100"
      in:fly={{ y: 8, duration: 280, easing: cubicOut }}
    >
      <div class="cadran" style:color={meta.color}>
        <svg viewBox="0 0 100 64" class="cadran-svg" aria-hidden="true">
          <!-- Halo lumineux subtil derrière le cadran -->
          <defs>
            <radialGradient id="halo-{key}">
              <stop offset="0%" stop-color={meta.color} stop-opacity="0.08"/>
              <stop offset="80%" stop-color={meta.color} stop-opacity="0"/>
            </radialGradient>
          </defs>
          <ellipse cx="50" cy="50" rx="44" ry="20" fill="url(#halo-{key})"/>

          <!-- Arc de fond (zone passive, gris laiton) -->
          <path d="M 12 50 A 38 38 0 0 1 88 50" fill="none"
            stroke="rgba(176, 145, 80, 0.32)" stroke-width="3"
            stroke-linecap="round"/>

          <!-- Arc rempli selon valeur -->
          <path d="M 12 50 A 38 38 0 0 1 88 50" fill="none"
            stroke={arc} stroke-width="3" stroke-linecap="round"
            stroke-dasharray="119"
            stroke-dashoffset={119 - (Math.max(0, Math.min(100, value)) / 100) * 119}
            class="cadran-arc"/>

          <!-- Graduations 0/50/100 -->
          <line x1="12" y1="50" x2="14" y2="48" stroke="rgba(90,47,28,0.5)" stroke-width="1"/>
          <line x1="50" y1="12" x2="50" y2="14" stroke="rgba(90,47,28,0.5)" stroke-width="1"/>
          <line x1="88" y1="50" x2="86" y2="48" stroke="rgba(90,47,28,0.5)" stroke-width="1"/>

          <!-- Aiguille -->
          <g transform="rotate({angleFor(value)} 50 50)" class="cadran-needle">
            <line x1="50" y1="50" x2="50" y2="16" stroke="#1A1411"
              stroke-width="2" stroke-linecap="round"/>
            <line x1="50" y1="50" x2="50" y2="56" stroke="#1A1411"
              stroke-width="2.5" stroke-linecap="round"/>
          </g>

          <!-- Pivot central style horloge -->
          <circle cx="50" cy="50" r="3.5" fill="#3D2615" stroke="#B09150" stroke-width="0.8"/>
          <circle cx="50" cy="50" r="1.4" fill="#C9B26A"/>
        </svg>
      </div>
      <div class="instrument-meta">
        <span class="instrument-icon">
          <CockpitIcon name={meta.icon} size={14} />
        </span>
        <span class="instrument-name">{RESOURCE_LABELS[key]}</span>
      </div>
      <div class="instrument-value" style:color={meta.color}>
        {Math.round(value)}
      </div>
    </button>
  {/each}

  {#if showHonteFierte}
    <button type="button" class="instrument hidden-jauge"
      title="Jauge cachée — révélée à l'épilogue. Mesure la cohérence entre tes actes et la fidélité à ta base. (Annie Ernaux #99)"
      aria-label="Honte ou fierté : {Math.round(honteFierte)} sur 100"
    >
      <div class="cadran" style:color="#C9B26A">
        <svg viewBox="0 0 100 64" class="cadran-svg" aria-hidden="true">
          <path d="M 12 50 A 38 38 0 0 1 88 50" fill="none"
            stroke="rgba(176, 145, 80, 0.32)" stroke-width="3" stroke-linecap="round"/>
          <path d="M 12 50 A 38 38 0 0 1 88 50" fill="none"
            stroke="#C9B26A" stroke-width="3" stroke-linecap="round"
            stroke-dasharray="119"
            stroke-dashoffset={119 - (Math.max(0, Math.min(100, honteFierte)) / 100) * 119}/>
          <g transform="rotate({angleFor(honteFierte)} 50 50)">
            <line x1="50" y1="50" x2="50" y2="16" stroke="#F4D58C"
              stroke-width="2" stroke-linecap="round"/>
            <line x1="50" y1="50" x2="50" y2="56" stroke="#F4D58C"
              stroke-width="2.5" stroke-linecap="round"/>
          </g>
          <circle cx="50" cy="50" r="3.5" fill="#1A1411" stroke="#C9B26A" stroke-width="0.8"/>
          <circle cx="50" cy="50" r="1.4" fill="#F4D58C"/>
        </svg>
      </div>
      <div class="instrument-meta">
        <span class="instrument-icon"><CockpitIcon name="masque" size={14} /></span>
        <span class="instrument-name">Honte / Fierté</span>
      </div>
      <div class="instrument-value">{Math.round(honteFierte)}</div>
    </button>
  {/if}
</div>

<style>
  .instruments-strip {
    display: flex;
    align-items: stretch;
    gap: 0.55rem;
    padding: 0.5rem 0.85rem;
    background:
      repeating-linear-gradient(
        90deg,
        rgba(90, 47, 28, 0) 0,
        rgba(90, 47, 28, 0.03) 1px,
        rgba(90, 47, 28, 0) 2px,
        rgba(90, 47, 28, 0) 8px
      ),
      linear-gradient(180deg, #C9A878 0%, #B89568 100%);
    border-top: 1px solid rgba(90, 47, 28, 0.4);
    border-bottom: 1px solid rgba(90, 47, 28, 0.4);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.18),
      inset 0 -1px 2px rgba(90, 47, 28, 0.15);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(90, 47, 28, 0.3) transparent;
  }

  .instruments-strip::-webkit-scrollbar {
    height: 4px;
  }
  .instruments-strip::-webkit-scrollbar-thumb {
    background: rgba(90, 47, 28, 0.25);
    border-radius: 2px;
  }

  .instrument {
    flex: 1 1 110px;
    min-width: 92px;
    max-width: 140px;
    display: grid;
    grid-template-rows: auto auto auto;
    align-items: center;
    justify-items: center;
    gap: 0.15rem;
    padding: 0.35rem 0.4rem 0.4rem;
    background: linear-gradient(180deg, #D8C088 0%, #C9A878 100%);
    border: 1px solid rgba(140, 110, 64, 0.55);
    border-radius: 0.4rem;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.32),
      inset 0 -2px 3px rgba(90, 47, 28, 0.18),
      0 1px 3px rgba(0, 0, 0, 0.18);
    color: #1A1411;
    font-family: 'Cinzel', Georgia, serif;
    cursor: pointer;
    transition:
      transform 0.22s cubic-bezier(0.34, 1.2, 0.64, 1),
      box-shadow 0.22s ease,
      border-color 0.18s ease;
  }

  .instrument:hover,
  .instrument:focus-visible {
    transform: translateY(-2px);
    border-color: #8C6E40;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      inset 0 -2px 3px rgba(90, 47, 28, 0.22),
      0 4px 10px rgba(0, 0, 0, 0.22);
    outline: none;
  }

  .cadran {
    width: 100%;
    max-width: 76px;
  }

  .cadran-svg {
    width: 100%;
    height: auto;
    display: block;
  }

  .cadran-arc {
    transition: stroke-dashoffset 0.65s cubic-bezier(0.34, 1.2, 0.64, 1),
                stroke 0.4s ease;
  }

  .cadran-needle {
    transform-origin: 50px 50px;
    transition: transform 0.65s cubic-bezier(0.34, 1.2, 0.64, 1);
  }

  .instrument-meta {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.05;
    color: rgba(26, 20, 17, 0.78);
  }

  .instrument-icon {
    display: inline-flex;
    align-items: center;
    color: rgba(26, 20, 17, 0.82);
  }

  .instrument-name {
    white-space: nowrap;
  }

  .instrument-value {
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1;
    font-family: 'Courier Prime', 'Courier New', monospace;
    color: var(--ink, #1A1411);
  }

  .hidden-jauge {
    background: linear-gradient(180deg, #2A1810 0%, #1A1411 100%);
    border-color: #C9B26A;
    color: #F4D58C;
  }

  .hidden-jauge .instrument-meta,
  .hidden-jauge .instrument-icon {
    color: rgba(244, 213, 140, 0.78);
  }

  .hidden-jauge .instrument-value {
    color: #F4D58C;
  }

  /* Mobile : strip qui scroll horizontalement, jauges plus compactes */
  @media (max-width: 768px) {
    .instruments-strip {
      padding: 0.4rem 0.5rem;
      gap: 0.4rem;
    }
    .instrument {
      min-width: 78px;
      flex: 0 0 78px;
      padding: 0.3rem;
    }
    .cadran { max-width: 56px; }
    .instrument-value { font-size: 0.92rem; }
    .instrument-meta { font-size: 0.55rem; gap: 0.2rem; }
  }
</style>
