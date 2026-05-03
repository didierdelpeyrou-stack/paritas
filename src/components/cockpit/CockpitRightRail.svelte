<script lang="ts">
  /* Rail droit du cockpit — 200px, sections empilées :
     - Personnalité (trait dominant + tension intérieure)
     - Mon œuvre (institutions construites count)
     - Trajectoire stratégique mini (modèle le plus proche)
     - Lexique
     Click head → ouvre un POPOVER ancré (pas un drawer plein écran). */
  import type { RebirthGameState } from '../../game/types';
  import { TRAIT_LABELS } from '../../game/narrative/personalityEngine';
  import { cockpit } from '$lib/stores/cockpit.svelte';
  import CockpitIcon from './CockpitIcon.svelte';

  interface Props {
    state: RebirthGameState;
  }
  let { state: gs }: Props = $props();

  function openSection(id: 'rail-personnalite' | 'rail-oeuvre' | 'rail-trajectoire' | 'rail-lexique') {
    cockpit.openRail(id, 'right');
  }

  /* Tension intérieure en mots (Damasio #58, Grandin #89) */
  function tensionLabel(stress: number): { label: string; tone: string } {
    if (stress < 25) return { label: 'Serein·e', tone: '#8DC09F' };
    if (stress < 50) return { label: 'En tension', tone: '#C9B26A' };
    if (stress < 75) return { label: 'Sous pression', tone: '#D9821C' };
    return { label: 'Au bord de la rupture', tone: '#E08F92' };
  }

  let tension = $derived(tensionLabel(gs.personalityStress));
  let dominantLabel = $derived(TRAIT_LABELS[gs.dominantTrait]);
  let dominantValue = $derived(gs.traits[gs.dominantTrait] ?? 0);

  /* Œuvre */
  let nbInstitutions = $derived(gs.memory.builtInstitutions?.length ?? 0);

  /* Trajectoire — modèle approché (juste un nom + score) */
  function nearestModel(): { name: string; pct: number } {
    /* Calcul simplifié : compare resources avec 3 modèles canon */
    const r = gs.resources;
    const MODELS: Array<{ name: string; vals: Record<string, number> }> = [
      { name: 'Jouhaux 1947', vals: { institution: 78, legitimite: 70, caisse: 55, rapportDeForce: 35, cohesionInterne: 65, confiance: 55, santeSociale: 60 } },
      { name: 'Croizat 1945', vals: { institution: 88, legitimite: 75, caisse: 65, rapportDeForce: 60, cohesionInterne: 55, confiance: 70, santeSociale: 80 } },
      { name: 'Maire 1968',   vals: { institution: 55, legitimite: 65, caisse: 45, rapportDeForce: 70, cohesionInterne: 70, confiance: 75, santeSociale: 60 } }
    ];
    let best = MODELS[0]!;
    let bestDist = Infinity;
    for (const m of MODELS) {
      let dist = 0;
      for (const k of Object.keys(m.vals)) {
        const a = (r as any)[k] ?? 0;
        dist += Math.abs(a - m.vals[k]!);
      }
      if (dist < bestDist) { bestDist = dist; best = m; }
    }
    /* Score 0-100 = 100 - normalized distance (max ~700 sur 7 jauges) */
    const pct = Math.max(0, Math.min(100, 100 - Math.round((bestDist / 700) * 100)));
    return { name: best.name, pct };
  }

  let trajectory = $derived(nearestModel());

  /* Nudges */
  let personalityAlert = $derived(gs.personalityStress >= 70);
  /* Détection institution qui vient d'être ajoutée — sparkle bref */
  let workSparkle = $state(false);
  let lastInstitutionCount = $state(0);
  $effect(() => {
    const current = nbInstitutions;
    if (current > lastInstitutionCount && lastInstitutionCount > 0) {
      workSparkle = true;
      setTimeout(() => { workSparkle = false; }, 2400);
    }
    lastInstitutionCount = current;
  });
</script>

<aside class="right-rail" aria-label="Personnalité, œuvre, trajectoire">
  <!-- ===== Personnalité ===== -->
  <section class="rail-section" class:has-alert={personalityAlert}>
    <button type="button" class="rail-head"
      class:active={cockpit.openPopover?.id === 'rail-personnalite'}
      onclick={() => openSection('rail-personnalite')}>
      <span class="rail-icon"><CockpitIcon name="masque" size={14} /></span>
      <span class="rail-title">Personnalité</span>
      {#if personalityAlert}
        <span class="rail-badge" title="Tension intérieure forte — risque d'éclatement">
          <CockpitIcon name="flamme" size={10} />
        </span>
      {/if}
      <span class="rail-expand" aria-hidden="true">›</span>
    </button>
    <div class="perso-body">
      <div class="perso-trait">
        <span class="trait-star" aria-hidden="true">★</span>
        <strong>{dominantLabel}</strong>
        <em class="trait-val">{dominantValue}</em>
      </div>
      <div class="tension" style:color={tension.tone}>
        <span class="tension-dot" style:background={tension.tone}></span>
        {tension.label}
      </div>
    </div>
  </section>

  <!-- ===== Mon œuvre ===== -->
  <section class="rail-section" class:has-sparkle={workSparkle}>
    <button type="button" class="rail-head"
      class:active={cockpit.openPopover?.id === 'rail-oeuvre'}
      onclick={() => openSection('rail-oeuvre')}>
      <span class="rail-icon"><CockpitIcon name="bourse" size={14} /></span>
      <span class="rail-title">Mon œuvre</span>
      {#if workSparkle}
        <span class="rail-badge sparkle-badge" title="Nouvelle institution construite !">
          <CockpitIcon name="sceau" size={10} />
        </span>
      {/if}
      <span class="rail-expand" aria-hidden="true">›</span>
    </button>
    <div class="work-body">
      <div class="work-count">
        <span class="count-num">{nbInstitutions}</span>
        <span class="count-label">institution{nbInstitutions !== 1 ? 's' : ''}<br/>construite{nbInstitutions !== 1 ? 's' : ''}</span>
      </div>
      {#if nbInstitutions === 0}
        <p class="work-hint">Tu n'as encore rien construit qui te survivra.</p>
      {/if}
    </div>
  </section>

  <!-- ===== Trajectoire ===== -->
  <section class="rail-section">
    <button type="button" class="rail-head"
      class:active={cockpit.openPopover?.id === 'rail-trajectoire'}
      onclick={() => openSection('rail-trajectoire')}>
      <span class="rail-icon"><CockpitIcon name="balance" size={14} /></span>
      <span class="rail-title">Trajectoire</span>
      <span class="rail-expand" aria-hidden="true">›</span>
    </button>
    <div class="traj-body">
      <span class="traj-hint">Tu te rapproches de</span>
      <strong class="traj-name">{trajectory.name}</strong>
      <div class="traj-bar"><i style:width="{trajectory.pct}%"></i></div>
      <span class="traj-pct">{trajectory.pct}%</span>
    </div>
  </section>

  <!-- ===== Lexique ===== -->
  <section class="rail-section lexique-section">
    <button type="button" class="rail-head"
      class:active={cockpit.openPopover?.id === 'rail-lexique'}
      onclick={() => openSection('rail-lexique')}>
      <span class="rail-icon"><CockpitIcon name="plume" size={14} /></span>
      <span class="rail-title">Lexique</span>
      <span class="rail-expand" aria-hidden="true">›</span>
    </button>
    <div class="lexique-body">
      <p class="lex-hint">Survole les termes <em>en italique</em> dans le scénario pour leur définition.</p>
    </div>
  </section>
</aside>

<style>
  .right-rail {
    width: 200px;
    flex-shrink: 0;
    background: linear-gradient(180deg, rgba(45, 26, 13, 0.45) 0%, rgba(30, 18, 10, 0.45) 100%);
    border-left: 1px solid rgba(201, 178, 106, 0.20);
    box-shadow: inset 1px 0 0 rgba(0, 0, 0, 0.25);
    padding: 0.5rem 0.55rem;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(201, 178, 106, 0.25) transparent;
    color: #F4EFE2;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .right-rail::-webkit-scrollbar { width: 4px; }
  .right-rail::-webkit-scrollbar-thumb { background: rgba(201, 178, 106, 0.25); border-radius: 2px; }

  .rail-section {
    position: relative;
    background: rgba(13, 11, 8, 0.4);
    border: 1px solid rgba(201, 178, 106, 0.18);
    border-radius: 0.4rem;
    overflow: hidden;
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
  }

  .rail-section.has-alert {
    border-color: rgba(217, 130, 28, 0.55);
    box-shadow:
      inset 0 0 0 1px rgba(217, 130, 28, 0.18),
      0 0 14px rgba(217, 130, 28, 0.18);
    animation: nudge-attention 3.5s ease-in-out infinite;
  }

  .rail-section.has-sparkle {
    border-color: rgba(244, 213, 140, 0.6);
    box-shadow:
      inset 0 0 0 1px rgba(244, 213, 140, 0.25),
      0 0 18px rgba(244, 213, 140, 0.32);
    animation: nudge-celebrate 2.4s ease-out;
  }

  @keyframes nudge-attention {
    0%, 100% { box-shadow: inset 0 0 0 1px rgba(217, 130, 28, 0.18), 0 0 10px rgba(217, 130, 28, 0.14); }
    50%      { box-shadow: inset 0 0 0 1px rgba(217, 130, 28, 0.32), 0 0 20px rgba(217, 130, 28, 0.30); }
  }

  @keyframes nudge-celebrate {
    0%   { box-shadow: inset 0 0 0 1px rgba(244, 213, 140, 0.5), 0 0 30px rgba(244, 213, 140, 0.5); }
    100% { box-shadow: inset 0 0 0 1px rgba(244, 213, 140, 0.18), 0 0 12px rgba(244, 213, 140, 0.18); }
  }

  .rail-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-left: -0.2rem;
    margin-right: 0.1rem;
    color: #D9821C;
    background: rgba(217, 130, 28, 0.15);
    border: 1px solid rgba(217, 130, 28, 0.45);
    border-radius: 50%;
    animation: badge-flash 1.8s ease-in-out infinite;
  }

  .sparkle-badge {
    color: #F4D58C;
    background: rgba(244, 213, 140, 0.18);
    border-color: rgba(244, 213, 140, 0.5);
    animation: sparkle-pop 1s ease-out;
  }

  @keyframes badge-flash {
    0%, 100% { opacity: 0.65; transform: scale(1); }
    50%      { opacity: 1;    transform: scale(1.1); }
  }

  @keyframes sparkle-pop {
    0%   { transform: scale(0.4); opacity: 0; }
    50%  { transform: scale(1.4); opacity: 1; }
    100% { transform: scale(1);   opacity: 1; }
  }

  .rail-head {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    width: 100%;
    padding: 0.35rem 0.55rem;
    background: linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
    border: none;
    border-bottom: 1px solid rgba(201, 178, 106, 0.18);
    color: #F4D58C;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: background 0.18s ease;
  }

  .rail-head:hover { background: linear-gradient(180deg, #4A3422 0%, #2D1C10 100%); }
  .rail-head.active {
    background: linear-gradient(180deg, #5C3622 0%, #3A2418 100%);
    color: #F4D58C;
    box-shadow: inset 0 -2px 0 #C9B26A;
  }

  .rail-icon { display: inline-flex; color: #C9B26A; }
  .rail-title { flex: 1 1 auto; text-align: left; }
  .rail-expand { color: rgba(244, 213, 140, 0.55); font-size: 1rem; line-height: 1; }

  /* ===== Personnalité ===== */
  .perso-body {
    padding: 0.5rem 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .perso-trait {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.85rem;
  }

  .trait-star {
    color: #C9B26A;
    font-size: 0.95rem;
  }

  .perso-trait strong { color: #F4D58C; flex: 1 1 auto; letter-spacing: 0.02em; }

  .trait-val {
    font-family: 'Courier Prime', monospace;
    font-style: normal;
    font-size: 0.85rem;
    color: rgba(244, 213, 140, 0.7);
  }

  .tension {
    font-size: 0.74rem;
    font-style: italic;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .tension-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    box-shadow: 0 0 5px currentColor;
  }

  /* ===== Œuvre ===== */
  .work-body {
    padding: 0.5rem 0.6rem;
    text-align: center;
  }

  .work-count {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
  }

  .count-num {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: #F4D58C;
    line-height: 1;
  }

  .count-label {
    font-size: 0.7rem;
    color: rgba(244, 239, 226, 0.7);
    text-align: left;
    line-height: 1.15;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .work-hint {
    margin: 0.35rem 0 0;
    font-size: 0.7rem;
    color: rgba(244, 239, 226, 0.55);
    font-style: italic;
    line-height: 1.35;
  }

  /* ===== Trajectoire ===== */
  .traj-body {
    padding: 0.5rem 0.6rem;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.2rem 0.4rem;
  }

  .traj-hint {
    grid-column: 1 / 3;
    font-size: 0.7rem;
    color: rgba(244, 239, 226, 0.6);
    font-style: italic;
  }

  .traj-name {
    grid-column: 1 / 3;
    color: #F4D58C;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.85rem;
    margin-bottom: 0.1rem;
  }

  .traj-bar {
    grid-column: 1;
    height: 4px;
    background: rgba(201, 178, 106, 0.18);
    border-radius: 2px;
    overflow: hidden;
  }

  .traj-bar i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #C9B26A, #F4D58C);
    transition: width 0.6s ease;
  }

  .traj-pct {
    grid-column: 2;
    font-family: 'Courier Prime', monospace;
    font-size: 0.7rem;
    color: rgba(244, 213, 140, 0.7);
    align-self: center;
  }

  /* ===== Lexique ===== */
  .lexique-body {
    padding: 0.5rem 0.6rem;
  }

  .lex-hint {
    margin: 0;
    font-size: 0.68rem;
    color: rgba(244, 239, 226, 0.55);
    font-style: italic;
    line-height: 1.4;
  }

  .lex-hint em {
    color: rgba(244, 213, 140, 0.85);
  }

  /* Mobile : rail caché */
  @media (max-width: 1024px) {
    .right-rail { display: none; }
  }
</style>
