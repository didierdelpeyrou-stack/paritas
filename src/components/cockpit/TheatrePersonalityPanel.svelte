<script lang="ts">
  /* ============================================================
     TheatrePersonalityPanel — colonne droite : PERSONNALITÉ +
     TRAJECTOIRE (portrait, score, tension, acteurs, mentor)
     ============================================================
     Brief UX expert : « la colonne droite informe, qualifie et
     raconte l'évolution du mouvement. (...) Elle fonctionne comme
     le portrait vivant du mouvement. »

     Composition (de haut en bas) :
     - Portrait + nom + organisation + camp
     - Score globale + tension intérieure
     - Trait dominant
     - Acteurs en tuiles compactes (sentiment narratif)
     - Mentor légendaire (cliquable → bio)

     Fusionne et remplace TheatrePortraitPanel + TheatreActorsTiles
     dans la nouvelle architecture (actions à gauche, scène centre,
     personnalité à droite).
     ============================================================ */
  import type { Actor, RebirthGameState } from '../../game/types';
  import type { Camp } from '$lib/types';
  import { TRAIT_LABELS } from '../../game/narrative/personalityEngine';
  import { legendaryById } from '../../game/content/legendaryCharacters';
  import CockpitIcon from './CockpitIcon.svelte';
  import type { IconKey } from './icons';

  interface Props {
    state: RebirthGameState;
    onOpenLegendaryBio?: () => void;
  }
  let { state: gs, onOpenLegendaryBio }: Props = $props();

  let initial = $derived(
    gs.name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  );

  let dominantLabel = $derived(TRAIT_LABELS[gs.dominantTrait]);

  let scoreGlobal = $derived.by(() => {
    const r = gs.resources;
    const total = (r.confiance + r.caisse + r.santeSociale + r.legitimite +
      r.rapportDeForce + r.cohesionInterne + r.institution) / 7;
    return Math.round(total);
  });

  let tension = $derived.by(() => {
    const s = gs.personalityStress;
    if (s < 25) return { label: 'Serein·e', tone: '#8DC09F', pct: s };
    if (s < 50) return { label: 'En tension', tone: '#C9B26A', pct: s };
    if (s < 75) return { label: 'Sous pression', tone: '#D9821C', pct: s };
    return { label: 'Au bord de la rupture', tone: '#E08F92', pct: s };
  });

  let legendary = $derived(gs.legendaryId ? legendaryById(gs.legendaryId) : undefined);

  let campAccent = $derived.by(() => {
    if (gs.camp === 'patron') return { primary: '#1E5C8A', shadow: '#0F2C4A' };
    return { primary: '#8B1F1B', shadow: '#5A1410' };
  });

  /* === Acteurs : tuiles compactes avec sentiment === */
  type ActorRole = 'base' | 'adversaire' | 'etat' | 'opinion';

  const ACTOR_LABEL: Record<ActorRole, (camp: Camp) => string> = {
    base: (c) => c === 'patron' ? 'Tes cadres' : 'La base',
    adversaire: (c) => c === 'patron' ? 'Le syndicat' : 'Le patronat',
    etat: () => 'L\'État',
    opinion: () => 'L\'opinion'
  };

  const ACTOR_GLYPH: Record<ActorRole, IconKey> = {
    base: 'poing',
    adversaire: 'pupitre',
    etat: 'rouage',
    opinion: 'parchemin'
  };

  function sentimentPhrase(role: ActorRole, a: Actor, c: Camp): string {
    const t = a.trust;
    const p = a.pressure;
    const pat = a.patience;
    const stance = a.stance;

    const impatient = pat < 25 ? ' et perd patience' : '';
    const tendu = p > 75 ? ' au bord de la rupture' : p > 55 ? ' sous pression' : '';
    const dur = stance === 'dur' ? ' et durcit le ton' : '';

    if (role === 'base') {
      const isPatron = c === 'patron';
      if (t >= 75) return isPatron ? `Tes cadres te suivent sans réserve${tendu}.` : `La base te suit aveuglément${tendu}.`;
      if (t >= 55) return isPatron ? `Tes cadres te font confiance${impatient}.` : `La base te porte${impatient}.`;
      if (t >= 35) return isPatron ? `Tes cadres t'observent encore${impatient}.` : `La base t'observe, partagée${impatient}.`;
      if (t >= 18) return isPatron ? `Tes cadres doutent${dur}${impatient}.` : `La base décroche${dur}${impatient}.`;
      return isPatron ? `Tes cadres se détournent.` : `La base te lâche.`;
    }
    if (role === 'adversaire') {
      const isPatron = c === 'patron';
      const advName = isPatron ? 'Le syndicat' : 'Le patronat';
      if (t >= 70) return `${advName} joue franc-jeu${tendu}.`;
      if (t >= 50) return `${advName} négocie de bonne foi${impatient}.`;
      if (t >= 30) return `${advName} garde ses distances${dur}.`;
      if (t >= 15) return `${advName} prépare la riposte${dur}.`;
      return `${advName} appelle à la rupture totale.`;
    }
    if (role === 'etat') {
      if (t >= 70) return `L'État écoute attentivement${tendu}.`;
      if (t >= 50) return `L'État temporise${impatient}.`;
      if (t >= 30) return `L'État prend ses distances${dur}.`;
      if (t >= 15) return `L'État menace${dur}.`;
      return `L'État intervient.`;
    }
    if (t >= 70) return `L'opinion te porte${tendu}.`;
    if (t >= 50) return `L'opinion suit avec curiosité${impatient}.`;
    if (t >= 30) return `L'opinion hésite.`;
    if (t >= 15) return `L'opinion se détourne${dur}.`;
    return `L'opinion te rejette.`;
  }

  function trustColor(t: number): string {
    if (t >= 65) return '#7BCBA1';
    if (t >= 45) return '#C9B26A';
    if (t >= 25) return '#D9821C';
    return '#E08F92';
  }

  const ROLES: ActorRole[] = ['base', 'adversaire', 'etat', 'opinion'];
</script>

<aside class="theatre-personality-panel" aria-label="Personnalité et trajectoire">

  <!-- Bloc Identité -->
  <header class="identity-block" style:--c-primary={campAccent.primary} style:--c-shadow={campAccent.shadow}>
    <div class="portrait" title={gs.name}>
      <span class="initials">{initial}</span>
      <span class="camp-glyph" data-camp={gs.camp} aria-hidden="true">
        {gs.camp === 'patron' ? '◆' : '✦'}
      </span>
    </div>
    <div class="id-text">
      <h2 class="player-name">{gs.name || 'Joueur·se'}</h2>
      {#if gs.organization?.name}
        <p class="org-name">{gs.organization.name}</p>
      {/if}
      <p class="trait-line">
        <span class="trait-glyph">★</span>
        <span class="trait-label">{dominantLabel}</span>
      </p>
    </div>
  </header>

  <!-- Score + Tension côte à côte -->
  <div class="metrics-row">
    <div class="metric score" title="Position globale — moyenne pondérée des 7 ressources.">
      <div class="metric-num">{scoreGlobal}</div>
      <div class="metric-tag">Position globale</div>
    </div>
    <div class="metric tension" title="Tension intérieure : monte quand tu agis contre ton trait dominant.">
      <div class="metric-bar">
        <i style:width="{tension.pct}%" style:background={tension.tone}></i>
      </div>
      <div class="metric-tag" style:color={tension.tone}>{tension.label}</div>
    </div>
  </div>

  <!-- Acteurs en tuiles compactes -->
  <section class="actors-block">
    <header class="block-head">
      <span class="head-glyph" aria-hidden="true">⚭</span>
      <span class="head-label">Acteurs en scène</span>
    </header>
    <div class="actors-list">
      {#each ROLES as role (role)}
        {@const actor = gs.actors[role]}
        {#if actor}
          {@const sentiment = sentimentPhrase(role, actor, gs.camp)}
          {@const trustC = trustColor(actor.trust)}
          <article class="actor-tile" data-stance={actor.stance ?? 'cooperatif'}>
            <header class="tile-head">
              <span class="actor-glyph" style:color={trustC}>
                <CockpitIcon name={ACTOR_GLYPH[role]} size={14} />
              </span>
              <span class="actor-name">{ACTOR_LABEL[role](gs.camp)}</span>
              <span class="trust-num" style:color={trustC} title="Confiance / 100">
                {Math.round(actor.trust)}
              </span>
            </header>
            <div class="trust-bar" aria-hidden="true">
              <i style:width="{Math.max(0, Math.min(100, actor.trust))}%"
                 style:background={trustC}></i>
            </div>
            <p class="tile-sentiment">{sentiment}</p>
            {#if actor.pressure > 75 || actor.patience < 25}
              <div class="tile-flags">
                {#if actor.pressure > 75}
                  <span class="flag pressure" title="Pression élevée">⚡</span>
                {/if}
                {#if actor.patience < 25}
                  <span class="flag patience" title="Patience entamée">⌛</span>
                {/if}
              </div>
            {/if}
          </article>
        {/if}
      {/each}
    </div>
  </section>

  <!-- Mentor légendaire -->
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
  .theatre-personality-panel {
    width: 280px;
    flex-shrink: 0;
    padding: 0.85rem 0.7rem 0.85rem;
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.05), transparent 70%),
      linear-gradient(180deg, #1F1813 0%, #110D0A 100%);
    border-left: 1px solid rgba(201, 178, 106, 0.25);
    color: #F4EFE2;
    font-family: 'Source Serif 4', Georgia, serif;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(201, 178, 106, 0.25) transparent;
  }

  /* === Identité (portrait compact + nom à droite) === */
  .identity-block {
    --c-primary: #5A2F1C;
    --c-shadow: #2A1A0E;
    display: grid;
    grid-template-columns: 64px 1fr;
    gap: 0.65rem;
    align-items: center;
    padding-bottom: 0.65rem;
    border-bottom: 1px solid rgba(201, 178, 106, 0.2);
  }

  .portrait {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%,
      color-mix(in srgb, var(--c-primary) 80%, #F4D58C) 0%,
      var(--c-primary) 60%,
      var(--c-shadow) 100%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      inset 0 2px 5px rgba(255, 255, 255, 0.18),
      inset 0 -2px 5px rgba(0, 0, 0, 0.28),
      0 3px 8px rgba(0, 0, 0, 0.45),
      0 0 0 2px rgba(244, 213, 140, 0.4);
    flex-shrink: 0;
  }
  .initials {
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 800;
    font-size: 1.25rem;
    color: #F4EFE2;
    letter-spacing: 0.04em;
  }
  .camp-glyph {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(180deg, #2A1A0E 0%, #110D0A 100%);
    border: 1.2px solid #C9B26A;
    color: #F4D58C;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.62rem;
  }
  .camp-glyph[data-camp='patron'] { color: #7DB1D8; }
  .camp-glyph[data-camp='salarie'] { color: #E08F92; }

  .id-text { min-width: 0; }
  .player-name {
    margin: 0 0 0.1rem 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.88rem;
    color: #F4D58C;
    letter-spacing: 0.04em;
    line-height: 1.15;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .org-name {
    margin: 0 0 0.25rem 0;
    font-size: 0.66rem;
    color: rgba(244, 239, 226, 0.65);
    font-style: italic;
    line-height: 1.15;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .trait-line {
    margin: 0;
    display: inline-flex;
    align-items: baseline;
    gap: 0.25rem;
    padding: 0.1rem 0.45rem;
    background: rgba(201, 178, 106, 0.10);
    border: 1px solid rgba(201, 178, 106, 0.32);
    border-radius: 999px;
    font-size: 0.62rem;
  }
  .trait-glyph { color: #C9B26A; }
  .trait-label { color: #F4D58C; font-style: italic; }

  /* === Métriques (score + tension) === */
  .metrics-row {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.55rem;
    align-items: center;
  }
  .metric {
    cursor: help;
  }
  .metric.score {
    text-align: center;
  }
  .metric-num {
    font-family: 'Courier Prime', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    color: #F4D58C;
    line-height: 1;
    text-shadow: 0 0 8px rgba(244, 213, 140, 0.25);
  }
  .metric.tension { min-width: 0; }
  .metric-bar {
    height: 4px;
    background: rgba(13, 11, 8, 0.55);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 0.25rem;
  }
  .metric-bar i {
    display: block;
    height: 100%;
    transition: width 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
  }
  .metric-tag {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.55rem;
    color: rgba(244, 239, 226, 0.65);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  /* === Acteurs === */
  .block-head {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding-bottom: 0.35rem;
    margin-bottom: 0.4rem;
    border-bottom: 1px solid rgba(201, 178, 106, 0.18);
    color: #C9B26A;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .head-glyph { font-size: 0.85rem; line-height: 1; }

  .actors-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .actor-tile {
    padding: 0.4rem 0.5rem;
    background: rgba(13, 11, 8, 0.45);
    border: 1px solid rgba(201, 178, 106, 0.18);
    border-left: 2px solid rgba(201, 178, 106, 0.45);
    border-radius: 0.32rem;
  }
  .actor-tile[data-stance='dur']         { border-left-color: rgba(176, 24, 30, 0.7); }
  .actor-tile[data-stance='instable']    { border-left-color: rgba(217, 130, 28, 0.7); }
  .actor-tile[data-stance='cooperatif']  { border-left-color: rgba(58, 107, 71, 0.7); }
  .actor-tile[data-stance='opportuniste'] { border-left-color: rgba(91, 163, 200, 0.7); }

  .tile-head {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.25rem;
  }
  .actor-glyph { display: inline-flex; line-height: 1; }
  .actor-name {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.65rem;
    font-weight: 700;
    color: #F4D58C;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .trust-num {
    font-family: 'Courier Prime', monospace;
    font-size: 0.74rem;
    font-weight: 700;
    cursor: help;
  }
  .trust-bar {
    height: 2px;
    background: rgba(13, 11, 8, 0.6);
    border-radius: 1px;
    overflow: hidden;
    margin-bottom: 0.3rem;
  }
  .trust-bar i {
    display: block;
    height: 100%;
    transition: width 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
  }
  .tile-sentiment {
    margin: 0;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.7rem;
    line-height: 1.3;
    color: rgba(244, 239, 226, 0.85);
    font-style: italic;
  }
  .tile-flags {
    display: flex;
    gap: 0.2rem;
    margin-top: 0.25rem;
  }
  .flag {
    font-size: 0.7rem;
    line-height: 1;
    cursor: help;
  }
  .flag.pressure { color: #F0B870; }
  .flag.patience { color: #E08F92; }

  /* === Mentor === */
  .mentor-block {
    margin-top: auto;
    display: grid;
    grid-template-columns: 36px 1fr;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0.55rem;
    background: rgba(201, 178, 106, 0.06);
    border: 1px solid rgba(201, 178, 106, 0.25);
    border-radius: 0.35rem;
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
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #B0181E 0%, #5A1410 100%);
    color: #F4EFE2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.7rem;
    border: 1.4px solid rgba(201, 178, 106, 0.55);
  }
  .mentor-portrait[data-camp='patron'] {
    background: linear-gradient(135deg, #1E5C8A 0%, #0F2C4A 100%);
  }
  .mentor-portrait.empty {
    background: rgba(40, 45, 55, 0.4);
    color: rgba(200, 210, 220, 0.65);
  }
  .mentor-text { display: flex; flex-direction: column; min-width: 0; }
  .mentor-tag {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.52rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(244, 213, 140, 0.6);
  }
  .mentor-name {
    font-size: 0.7rem;
    color: #F4D58C;
    font-style: italic;
    line-height: 1.15;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 1280px) {
    .theatre-personality-panel { display: none; }
  }
</style>
