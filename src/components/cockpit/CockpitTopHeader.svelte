<script lang="ts">
  /* ============================================================
     CockpitTopHeader — bandeau supérieur riche CK3-style
     ============================================================
     Remplace CockpitStatusBar pour un header dense :
     - Drapeau organisation (SVG syndical/patronal)
     - Portrait perso (initiale stylée laiton)
     - Nom + trait dominant + score
     - 7 mini-jauges chiffrées TOUTES visibles (Civ-style)
     - Mood + boutons système

     Avis Henrik Fåhraeus (CK3) : « Le portrait est OMNIPRÉSENT. »
     Avis Sid Meier (Civ) : « Toutes les ressources lisibles
     en UN coup d'œil. »
     ============================================================ */
  import type { EraId, RebirthGameState, ResourceKey, SceneMood } from '../../game/types';
  import { TRAIT_LABELS } from '../../game/narrative/personalityEngine';
  import { abilitiesFor, ABILITY_SHORT_LABEL } from '../../game/simulation/resourceUtility';
  import { sfx } from '../../game/audio/sfx';
  import CockpitIcon from './CockpitIcon.svelte';

  interface Props {
    state: RebirthGameState;
    era: EraId | null;
    mood: SceneMood | null;
    onOpenSettings?: () => void;
    onToggleClassic?: () => void;
    onOpenMobileMenu?: () => void;
    showMobileBurger?: boolean;
    /** Callback : rouvrir le hint mécanique (Nielsen #8). */
    onShowHint?: () => void;
  }
  let {
    state: gs, era, mood,
    onOpenSettings, onToggleClassic, onOpenMobileMenu,
    showMobileBurger = false,
    onShowHint
  }: Props = $props();

  const ERA_LABEL: Record<string, string> = {
    revolution: 'Révolution',
    xixe: 'XIXe',
    belle_epoque: 'Belle Époque',
    entre_deux_guerres: 'Entre-deux-guerres',
    reconstruction: 'Reconstruction',
    guerre_froide: 'Guerre froide',
    trente_glorieuses: 'Trente Glorieuses',
    crise: 'Crise',
    mitterrand: 'Mitterrand',
    cohabitations: 'Cohabitations',
    sarkozy: 'Sarkozy',
    hollande: 'Hollande',
    macron_i: 'Macron I',
    macron_ii: 'Macron II',
    present: 'Présent'
  };

  const MOOD_DOT: Record<string, string> = {
    calme: '#5CB6C8',
    tendu: '#D9821C',
    grave: '#B0181E',
    euphorique: '#F4D58C',
    melancolique: '#8E64C0'
  };

  const MOOD_LABEL: Record<string, string> = {
    calme: 'Calme',
    tendu: 'Tendu',
    grave: 'Grave',
    euphorique: 'Euphorique',
    melancolique: 'Mélancolique'
  };

  let initial = $derived(
    gs.name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  );

  let traitLabel = $derived(TRAIT_LABELS[gs.dominantTrait]);

  /* Score dialectique simple (V2 RebirthGameState n'a pas de
   * scoreDialectic exposé). Calcul moyenne pondérée des 7 jauges
   * avec ratio "santé sociale" (Sen). */
  let score = $derived(() => {
    const r = gs.resources;
    const total = (r.confiance + r.caisse + r.santeSociale + r.legitimite +
      r.rapportDeForce + r.cohesionInterne + r.institution) / 7;
    return Math.round(total);
  });

  /* Couleurs + symbole camp pour drapeau (Scher #4 : symboles
   * spécifiquement français paritaires, pas l'étoile US). */
  let campData = $derived.by(() => {
    const name = gs.organization?.name?.toLowerCase() ?? '';
    if (name.includes('cgt') || name.includes('cfdt') || name.includes('fo')
      || name.includes('cftc') || name.includes('solid')) {
      return { primary: '#B0181E', accent: '#F4D58C', symbol: 'epis' as const };
    }
    if (name.includes('medef') || name.includes('cnpf') || name.includes('cpme')
      || name.includes('u2p')) {
      return { primary: '#1E5C8A', accent: '#F4D58C', symbol: 'rouage' as const };
    }
    return { primary: '#5A2F1C', accent: '#C9B26A', symbol: 'fleuron' as const };
  });
  let campColor = $derived({ primary: campData.primary, accent: campData.accent });
  let campSymbol = $derived(campData.symbol);

  /* 7 ressources avec icônes paritaires + description longue
     pour tooltip enrichi (retour live test patronat P0 §1 :
     « Je ne sais pas ce que mesure "Force int" vs "Force ext". »). */
  const RES_META = [
    { key: 'caisse', label: 'Caisse', icon: 'sceau' as const, color: '#C9B26A',
      desc: 'Trésorerie de l\'organisation. Finance les actions, salaires, locaux. Décroît passivement (frais courants).' },
    { key: 'confiance', label: 'Confiance', icon: 'carte' as const, color: '#1E5C8A',
      desc: 'Confiance des adhérents et sympathisants. Conditionne la mobilisation et le renouvellement des mandats.' },
    { key: 'santeSociale', label: 'Santé soc', icon: 'epis' as const, color: '#3A6B47',
      desc: 'État social du pays (Sen). Indicateur global du bien-être collectif — c\'est ce que la lutte vise au final.' },
    { key: 'legitimite', label: 'Légitimité', icon: 'balance' as const, color: '#5C2D5C',
      desc: 'Reconnaissance institutionnelle (presse, État, opinion). Permet la signature et l\'accès aux tables.' },
    { key: 'rapportDeForce', label: 'Force ext', icon: 'pupitre' as const, color: '#D9821C',
      desc: 'Force EXTERNE — pression que tu exerces sur le camp adverse (manifestations, grèves, lockouts).' },
    { key: 'cohesionInterne', label: 'Force int', icon: 'poing' as const, color: '#8B1F1B',
      desc: 'Force INTERNE — cohésion de tes troupes (militants, cadres, base). Sans elle, pas de mobilisation tenue.' },
    { key: 'institution', label: 'Institution', icon: 'rouage' as const, color: '#7A5C3A',
      desc: 'Capital institutionnel — sièges, mandats, conventions. Capital long-terme qui survit aux défaites.' }
  ];

  /* Snapshot des ressources au début du tour pour calculer le
     delta. Mis à jour quand gs.turn change. */
  let snapshot = $state<Record<string, number>>({});
  let lastSnapshotTurn = $state(-1);

  $effect(() => {
    if (gs.turn !== lastSnapshotTurn) {
      snapshot = { ...(gs.resources as unknown as Record<string, number>) };
      lastSnapshotTurn = gs.turn;
    }
  });

  function deltaFor(key: string, current: number): number {
    const prev = snapshot[key];
    if (typeof prev !== 'number') return 0;
    return Math.round(current - prev);
  }

  function tooltipFor(key: string, label: string, desc: string, v: number): string {
    const d = deltaFor(key, v);
    const deltaStr = d === 0 ? '' : `\n\nCe tour : ${d > 0 ? '+' : ''}${d}`;
    const critStr = v < 25 ? '\n\n⚠ ZONE CRITIQUE — risque de cascade' : '';
    /* Lecture transverse : quelles abilities sont alimentées par cette
       ressource (autodétermination — le joueur voit l'utilité concrète). */
    const fuels = abilitiesFor(key as ResourceKey);
    let utilityStr = '';
    if (fuels.length > 0) {
      const top = fuels.slice(0, 3).map(a => `• ${ABILITY_SHORT_LABEL[a.ability]} (${a.impact})`).join('\n');
      utilityStr = `\n\n→ Alimente :\n${top}`;
    }
    return `${label} : ${Math.round(v)}/100${deltaStr}${critStr}\n\n${desc}${utilityStr}`;
  }

  let musicOn = $state(sfx.isMusicEnabled());
  $effect(() => sfx.onMusicChange((v) => (musicOn = v)));

  function toggleMusic() {
    sfx.toggleMusic();
  }
</script>

<header class="top-header" style="--camp-primary: {campColor.primary}; --camp-accent: {campColor.accent}">
  <div class="header-left">
    {#if showMobileBurger}
      <button type="button" class="sys-btn burger"
        onclick={() => onOpenMobileMenu?.()}
        title="Ouvrir le menu" aria-label="Ouvrir le menu">
        <span class="burger-bars" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
      </button>
    {/if}

    <!-- Drapeau organisation — symbole adapté au camp (Scher #4 :
         évite l'étoile US, préfère épi de blé syndical / roue
         dentée patronale / fleuron neutre). -->
    <div class="flag" aria-hidden="true" title="Drapeau de ton organisation">
      <svg viewBox="0 0 32 32" class="flag-svg">
        <!-- Mât -->
        <line x1="6" y1="2" x2="6" y2="30" stroke="#3D2A1A" stroke-width="2" stroke-linecap="round"/>
        <!-- Tissu (drapé légèrement, ondulation tessellée) -->
        <g class="flag-cloth">
          <path d="M6 4 L26 4 L22 11 L26 18 L6 18 Z"
                fill="var(--camp-primary)"
                stroke="#1A1411"
                stroke-width="0.5"
                stroke-linejoin="round"/>
          <!-- Symbole français selon camp -->
          {#if campSymbol === 'epis'}
            <!-- Épi de blé stylisé (CGT historique) -->
            <line x1="16" y1="6.5" x2="16" y2="15.5" stroke="var(--camp-accent)" stroke-width="0.8" stroke-linecap="round"/>
            <path d="M16 8 Q14 8 13.5 9.5 Q15 9 16 9.5
                     M16 8 Q18 8 18.5 9.5 Q17 9 16 9.5
                     M16 10 Q14 10 13.5 11.5 Q15 11 16 11.5
                     M16 10 Q18 10 18.5 11.5 Q17 11 16 11.5
                     M16 12 Q14 12 13.5 13.5 Q15 13 16 13.5
                     M16 12 Q18 12 18.5 13.5 Q17 13 16 13.5"
                  stroke="var(--camp-accent)" stroke-width="0.7" fill="none"
                  stroke-linecap="round" stroke-linejoin="round"/>
          {:else if campSymbol === 'rouage'}
            <!-- Roue dentée patronat -->
            <circle cx="16" cy="11" r="2.6" stroke="var(--camp-accent)" stroke-width="1" fill="none"/>
            <circle cx="16" cy="11" r="0.8" fill="var(--camp-accent)"/>
            <g stroke="var(--camp-accent)" stroke-width="1" stroke-linecap="round">
              <line x1="16" y1="7.4" x2="16" y2="8.4"/>
              <line x1="16" y1="13.6" x2="16" y2="14.6"/>
              <line x1="12.4" y1="11" x2="13.4" y2="11"/>
              <line x1="18.6" y1="11" x2="19.6" y2="11"/>
              <line x1="13.5" y1="8.5" x2="14.2" y2="9.2"/>
              <line x1="17.8" y1="12.8" x2="18.5" y2="13.5"/>
              <line x1="13.5" y1="13.5" x2="14.2" y2="12.8"/>
              <line x1="17.8" y1="9.2" x2="18.5" y2="8.5"/>
            </g>
          {:else}
            <!-- Fleuron ❦ pour neutre -->
            <text x="16" y="13.5" text-anchor="middle"
                  fill="var(--camp-accent)"
                  font-family="Cinzel, Georgia, serif"
                  font-size="9"
                  font-weight="700">❦</text>
          {/if}
        </g>
      </svg>
    </div>

    <!-- Portrait + identité -->
    <div class="identity">
      <div class="portrait" title={gs.name}>{initial}</div>
      <div class="id-text">
        <div class="id-name">{gs.name || 'Joueur'}</div>
        <div class="id-meta">
          <span class="trait-star">★</span>
          <span class="trait-name">{traitLabel}</span>
          <span class="sep">·</span>
          <span class="score"
            title="Position globale — moyenne pondérée des 7 ressources. Indique le rapport de force général de ton organisation (0 critique, 100 excellent)."
          >P {score()}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Strip de ressources mini-chips (Civ-style) -->
  <div class="res-strip" aria-label="Ressources principales">
    {#each RES_META as r}
      {@const v = (gs.resources as any)[r.key] ?? 0}
      {@const crit = v < 25}
      {@const d = deltaFor(r.key, v)}
      <div class="res-chip" class:crit
        title={tooltipFor(r.key, r.label, r.desc, v)}
        style="--c: {r.color}"
      >
        <span class="res-ico"><CockpitIcon name={r.icon} size={14} /></span>
        <span class="res-val">{Math.round(v)}</span>
        {#if d !== 0}
          <span class="res-delta" class:up={d > 0} class:down={d < 0}>
            {d > 0 ? '▲' : '▼'}{Math.abs(d)}
          </span>
        {/if}
      </div>
    {/each}
  </div>

  <div class="header-right">
    <!-- Tour + Ère + Mood compacts -->
    <div class="ctx-meta">
      <span class="turn">T{gs.turn}<small>/100</small></span>
      {#if era}
        <span class="era">{ERA_LABEL[era] ?? era}</span>
      {/if}
      {#if mood}
        <span class="mood-mini" style="--md: {MOOD_DOT[mood]}" title={MOOD_LABEL[mood]}>
          <span class="mood-dot"></span>
          <span class="mood-name">{MOOD_LABEL[mood]}</span>
        </span>
      {/if}
    </div>

    <!-- Boutons système -->
    <div class="sys-buttons">
      {#if onShowHint}
        <button type="button" class="sys-btn" onclick={onShowHint}
          title="Rouvrir le rappel des mécaniques de jeu"
          aria-label="Aide mécaniques">?</button>
      {/if}
      <button type="button" class="sys-btn" onclick={toggleMusic}
        title={musicOn ? 'Couper la musique' : 'Lancer la musique'}
        aria-label={musicOn ? 'Couper la musique' : 'Lancer la musique'}
        aria-pressed={musicOn}>
        <CockpitIcon name="note" size={14} />
      </button>
      {#if onToggleClassic}
        <button type="button" class="sys-btn classic-btn" onclick={onToggleClassic}
          title="Tu es en mode Cockpit. Bascule vers l'interface classique."
          aria-label="Basculer vers le mode classique">
          <span class="classic-icon">⊟</span>
          <span class="classic-label">Classique</span>
        </button>
      {/if}
      {#if onOpenSettings}
        <button type="button" class="sys-btn" onclick={onOpenSettings}
          title="Réglages" aria-label="Réglages">
          <CockpitIcon name="rouage" size={14} />
        </button>
      {/if}
    </div>
  </div>
</header>

<style>
  .top-header {
    --camp-primary: #5A2F1C;
    --camp-accent: #C9B26A;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.85rem;
    height: 64px;
    padding: 0.5rem 0.95rem;
    background:
      linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 70%, #1F1308 100%);
    border-bottom: 1px solid rgba(201, 178, 106, 0.35);
    box-shadow:
      inset 0 1px 0 rgba(244, 213, 140, 0.06),
      0 2px 6px rgba(0, 0, 0, 0.4);
    color: #F4EFE2;
    font-family: 'Cinzel', Georgia, serif;
    flex-shrink: 0;
  }

  /* === Identité (gauche) === */
  .header-left {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-width: 0;
  }

  .flag {
    display: inline-flex;
    flex-shrink: 0;
  }

  .flag-svg {
    width: 32px;
    height: 32px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
    cursor: help;
  }

  /* Wikegård #4 : ondulation héraldique au hover */
  .flag:hover .flag-cloth {
    animation: flag-wave 1.6s ease-in-out;
    transform-origin: 6px 11px;
  }

  @keyframes flag-wave {
    0%, 100% { transform: skewY(0) translateX(0); }
    25%      { transform: skewY(-3deg) translateX(0.5px); }
    50%      { transform: skewY(0) translateX(0); }
    75%      { transform: skewY(3deg) translateX(-0.5px); }
  }

  .identity {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.55rem;
    align-items: center;
    min-width: 0;
  }

  .portrait {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--camp-accent) 0%, color-mix(in srgb, var(--camp-accent) 60%, #5A2F1C) 100%);
    color: #1A1411;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* Scher #1 : Cinzel pour cohérence d'identité */
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 800;
    font-size: 0.95rem;
    letter-spacing: 0.04em;
    border: 2px solid var(--camp-primary);
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.3),
      inset 0 -2px 4px rgba(0, 0, 0, 0.25),
      0 2px 6px rgba(0, 0, 0, 0.4);
    flex-shrink: 0;
  }

  .id-text { min-width: 0; }

  .id-name {
    font-size: 0.92rem;
    font-weight: 700;
    color: #F4D58C;
    letter-spacing: 0.04em;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .id-meta {
    display: flex;
    gap: 0.35rem;
    align-items: baseline;
    font-size: 0.7rem;
    color: rgba(244, 239, 226, 0.78);
    margin-top: 0.1rem;
  }

  .trait-star { color: var(--camp-accent); font-size: 0.85rem; }
  .trait-name { color: #F4D58C; font-style: italic; }
  .sep { color: rgba(201, 178, 106, 0.5); }
  .score {
    font-family: 'Courier Prime', monospace;
    color: var(--camp-accent);
    font-weight: 600;
  }

  /* === Strip ressources (centre) === */
  .res-strip {
    display: flex;
    gap: 0.35rem;
    align-items: center;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .res-strip::-webkit-scrollbar { display: none; }

  .res-chip {
    --c: #C9B26A;
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
    padding: 0.22rem 0.45rem;
    background: rgba(13, 11, 8, 0.45);
    border: 1px solid color-mix(in srgb, var(--c) 35%, transparent);
    border-radius: 0.3rem;
    color: var(--c);
    font-family: 'Courier Prime', monospace;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: help;
    transition: transform 0.18s ease, background 0.2s ease;
  }

  .res-chip:hover {
    transform: translateY(-1px);
    background: color-mix(in srgb, var(--c) 12%, rgba(13, 11, 8, 0.45));
  }

  .res-chip.crit {
    border-color: #B0181E;
    color: #E08F92;
    animation: chip-crit 1.4s ease-in-out infinite;
  }

  @keyframes chip-crit {
    0%, 100% { background: rgba(176, 24, 30, 0.10); }
    50%      { background: rgba(176, 24, 30, 0.30); }
  }

  .res-ico { display: inline-flex; }
  .res-val { line-height: 1; }

  /* Delta du tour : flèche + valeur, vert si gain rouge si perte
     (retour live test patronat P0 §1 — feedback immédiat sur
     l'effet d'une action). */
  .res-delta {
    margin-left: 0.18rem;
    padding-left: 0.25rem;
    border-left: 1px solid color-mix(in srgb, var(--c) 25%, transparent);
    font-family: 'Courier Prime', monospace;
    font-size: 0.62rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .res-delta.up   { color: #7BCBA1; }
  .res-delta.down { color: #E08F92; }

  /* === Contexte + boutons système (droite) === */
  .header-right {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .ctx-meta {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    font-size: 0.78rem;
  }

  .turn {
    color: #F4D58C;
    font-weight: 700;
    letter-spacing: 0.05em;
    font-family: 'Courier Prime', monospace;
  }
  .turn small { color: rgba(244, 213, 140, 0.55); font-size: 0.7em; }

  .era {
    color: rgba(244, 239, 226, 0.85);
    letter-spacing: 0.04em;
  }

  .mood-mini {
    --md: #C9B26A;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.18rem 0.5rem;
    background: rgba(201, 178, 106, 0.10);
    border: 1px solid color-mix(in srgb, var(--md) 35%, transparent);
    border-radius: 999px;
    color: rgba(244, 239, 226, 0.85);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .mood-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--md);
    box-shadow: 0 0 6px var(--md);
  }

  .sys-buttons {
    display: flex;
    gap: 0.3rem;
  }

  .sys-btn {
    background: transparent;
    border: 1px solid rgba(201, 178, 106, 0.30);
    color: #F4D58C;
    width: 28px; height: 28px;
    border-radius: 0.3rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .sys-btn:hover {
    background: rgba(201, 178, 106, 0.14);
    border-color: #C9B26A;
  }

  .sys-btn[aria-pressed="true"] {
    background: rgba(201, 178, 106, 0.18);
  }

  /* Bouton classique avec libellé (Norman fix #1) */
  .classic-btn {
    width: auto;
    padding: 0 0.5rem;
    gap: 0.3rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .classic-icon { font-size: 0.95rem; line-height: 1; }
  @media (max-width: 768px) {
    .classic-label { display: none; }
    .classic-btn { width: 28px; padding: 0; }
  }

  .burger-bars {
    display: inline-flex;
    flex-direction: column;
    gap: 3px;
    width: 14px;
  }
  .burger-bars span {
    display: block;
    height: 2px;
    background: currentColor;
    border-radius: 1px;
  }

  /* Mobile */
  @media (max-width: 1024px) {
    .top-header { grid-template-columns: auto 1fr auto; height: 56px; }
    .res-strip { gap: 0.25rem; }
    .res-chip { padding: 0.18rem 0.35rem; font-size: 0.72rem; }
    .id-meta { display: none; }
  }

  @media (max-width: 768px) {
    .top-header { padding: 0.4rem 0.55rem; height: 48px; }
    .flag-svg { width: 26px; height: 26px; }
    .portrait { width: 32px; height: 32px; font-size: 0.85rem; }
    .id-text { display: none; }
    .ctx-meta .era { display: none; }
    .mood-name { display: none; }
    .res-strip { gap: 0.2rem; }
    .res-chip { padding: 0.15rem 0.3rem; }
    .res-chip .res-val { font-size: 0.68rem; }
    .res-delta { display: none; }
  }
</style>
