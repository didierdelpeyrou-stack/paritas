<script lang="ts">
  /* Rail gauche du cockpit — 200px, deux sections empilées :
     - Objectifs (3 mini-cards compactes)
     - Acteurs (4 mini-cards : base / adversaire / état / opinion)
     Click head → ouvre un POPOVER ancré (pas un drawer plein écran). */
  import type { RoleObjective, ObjectiveProgress } from '../../game/objectives/types';
  import type { Actor, ActorId, Actors } from '../../game/types';
  import { cockpit } from '$lib/stores/cockpit.svelte';
  import CockpitIcon from './CockpitIcon.svelte';

  interface Props {
    objectives: RoleObjective[];
    progress: ObjectiveProgress[];
    actors: Actors;
    turn: number;
  }
  let { objectives, progress, actors, turn }: Props = $props();

  function openSection(id: 'rail-objectifs' | 'rail-acteurs') {
    cockpit.openRail(id, 'left');
  }

  function status(o: RoleObjective): 'satisfied' | 'failed' | 'pending' {
    const item = progress.find(p => p.id === o.id);
    if (item?.satisfied) return 'satisfied';
    if (item?.failed) return 'failed';
    return 'pending';
  }
  function progressOf(o: RoleObjective): number {
    return progress.find(p => p.id === o.id)?.progress ?? 0;
  }

  /* Mood actor : 0 hostile - 3 favorable */
  function actorMood(a: Actor): { idx: 0 | 1 | 2 | 3; label: string; color: string } {
    const idx = a.stance === 'dur' || a.trust <= 30 ? 0
      : a.trust <= 45 ? 1
      : a.trust <= 65 ? 2
      : 3;
    const labels = ['Hostile', 'Méfiant', 'Attentif', 'Favorable'];
    const colors = ['#B0181E', '#D9821C', '#C9B26A', '#3A6B47'];
    return { idx: idx as 0 | 1 | 2 | 3, label: labels[idx]!, color: colors[idx]! };
  }

  /* Nudge actor : alerte si patience < 25 ou pression > 78 */
  function actorAlert(a: Actor): boolean {
    return a.patience <= 25 || a.pressure >= 78;
  }
  function objectiveAlert(o: RoleObjective): boolean {
    /* Alerte si objectif a deadline rapprochée (< 3 tours) et pas satisfait */
    if (status(o) !== 'pending') return false;
    if (o.byTurn === undefined) return false;
    return (o.byTurn - turn) <= 3 && (o.byTurn - turn) > 0;
  }

  const ACTOR_NAMES: Record<ActorId, string> = {
    base: 'Base',
    adversaire: 'Adversaire',
    etat: 'État',
    opinion: 'Opinion'
  };

  const ACTOR_ORDER: ActorId[] = ['base', 'adversaire', 'etat', 'opinion'];

  /* Limit to 3 most pertinents objectifs (pending d'abord, satisfied ensuite) */
  let topObjectives = $derived.by(() => {
    const sorted = [...objectives].sort((a, b) => {
      const sa = status(a) === 'pending' ? 0 : status(a) === 'satisfied' ? 1 : 2;
      const sb = status(b) === 'pending' ? 0 : status(b) === 'satisfied' ? 1 : 2;
      if (sa !== sb) return sa - sb;
      return progressOf(b) - progressOf(a);
    });
    return sorted.slice(0, 3);
  });

  /* Nudges count par section (badges) */
  let nbObjectifsAlerte = $derived(objectives.filter(objectiveAlert).length);
  let nbActeursAlerte = $derived(ACTOR_ORDER.filter(id => actorAlert(actors[id])).length);
</script>

<aside class="left-rail" aria-label="Objectifs et acteurs">
  <!-- ===== Objectifs ===== -->
  <section class="rail-section" class:has-alert={nbObjectifsAlerte > 0}>
    <button type="button" class="rail-head"
      class:active={cockpit.openPopover?.id === 'rail-objectifs'}
      onclick={() => openSection('rail-objectifs')}>
      <span class="rail-icon"><CockpitIcon name="parchemin" size={14} /></span>
      <span class="rail-title">Objectifs</span>
      {#if nbObjectifsAlerte > 0}
        <span class="rail-badge" title="Échéance proche !">
          <CockpitIcon name="alerte" size={10} />
        </span>
      {/if}
      <span class="rail-expand" aria-hidden="true">›</span>
    </button>
    <ul class="objectives-mini">
      {#each topObjectives as o}
        {@const st = status(o)}
        {@const pct = Math.min(100, Math.max(0, progressOf(o)))}
        <li class="obj-mini status-{st}">
          <div class="obj-label">{o.label}</div>
          {#if st === 'satisfied'}
            <span class="obj-tag tag-ok">✓</span>
          {:else if st === 'failed'}
            <span class="obj-tag tag-ko">✗</span>
          {:else}
            <div class="obj-bar"><i style:width="{pct}%"></i></div>
            <span class="obj-pct">{pct}%</span>
          {/if}
        </li>
      {/each}
      {#if topObjectives.length === 0}
        <li class="obj-empty">Aucun objectif assigné.</li>
      {/if}
    </ul>
  </section>

  <!-- ===== Acteurs ===== -->
  <section class="rail-section" class:has-alert={nbActeursAlerte > 0}>
    <button type="button" class="rail-head"
      class:active={cockpit.openPopover?.id === 'rail-acteurs'}
      onclick={() => openSection('rail-acteurs')}>
      <span class="rail-icon"><CockpitIcon name="carte" size={14} /></span>
      <span class="rail-title">Acteurs</span>
      {#if nbActeursAlerte > 0}
        <span class="rail-badge" title="Patience limite ou pression extrême">
          <CockpitIcon name="flamme" size={10} />
        </span>
      {/if}
      <span class="rail-expand" aria-hidden="true">›</span>
    </button>
    <ul class="actors-mini">
      {#each ACTOR_ORDER as id}
        {@const a = actors[id]}
        {@const m = actorMood(a)}
        {@const alert = actorAlert(a)}
        <li class="actor-mini" class:alert>
          <span class="actor-dot" style:background={m.color}></span>
          <div class="actor-id">
            <strong>{ACTOR_NAMES[id]}</strong>
            <em>{m.label}</em>
          </div>
          {#if alert}
            <span class="actor-alert" title="Risque de rupture imminent">
              <CockpitIcon name="flamme" size={11} />
            </span>
          {/if}
          <div class="actor-bars" title="Confiance / Pression / Patience">
            <span class="actor-bar"><i style:width="{a.trust}%" style:background={m.color}></i></span>
          </div>
        </li>
      {/each}
    </ul>
  </section>
</aside>

<style>
  .left-rail {
    width: 200px;
    flex-shrink: 0;
    background: linear-gradient(180deg, rgba(45, 26, 13, 0.45) 0%, rgba(30, 18, 10, 0.45) 100%);
    border-right: 1px solid rgba(201, 178, 106, 0.20);
    box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.25);
    padding: 0.5rem 0.55rem;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(201, 178, 106, 0.25) transparent;
    color: #F4EFE2;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .left-rail::-webkit-scrollbar { width: 4px; }
  .left-rail::-webkit-scrollbar-thumb { background: rgba(201, 178, 106, 0.25); border-radius: 2px; }

  .rail-section {
    position: relative;
    background: rgba(13, 11, 8, 0.4);
    border: 1px solid rgba(201, 178, 106, 0.18);
    border-radius: 0.4rem;
    overflow: hidden;
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
  }

  /* Nudge gamifié — quand une section a des alertes, halo
     orange-doré pulsant subtil pour attirer l'œil */
  .rail-section.has-alert {
    border-color: rgba(217, 130, 28, 0.55);
    box-shadow:
      inset 0 0 0 1px rgba(217, 130, 28, 0.18),
      0 0 14px rgba(217, 130, 28, 0.18);
    animation: nudge-attention 3.5s ease-in-out infinite;
  }

  @keyframes nudge-attention {
    0%, 100% { box-shadow: inset 0 0 0 1px rgba(217, 130, 28, 0.18), 0 0 10px rgba(217, 130, 28, 0.14); }
    50%      { box-shadow: inset 0 0 0 1px rgba(217, 130, 28, 0.32), 0 0 20px rgba(217, 130, 28, 0.30); }
  }

  /* Badge alerte dans le head — petit triangle orange */
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

  @keyframes badge-flash {
    0%, 100% { opacity: 0.65; transform: scale(1); }
    50%      { opacity: 1;    transform: scale(1.1); }
  }

  /* Acteur en alerte — small flame icon next to name */
  .actor-mini.alert .actor-dot {
    box-shadow:
      0 0 8px currentColor,
      0 0 16px rgba(217, 130, 28, 0.5);
  }

  .actor-alert {
    display: inline-flex;
    color: #D9821C;
    margin-left: 0.2rem;
    align-self: center;
    grid-column: 3;
    animation: actor-flame 2.4s ease-in-out infinite;
  }

  @keyframes actor-flame {
    0%, 100% { opacity: 0.55; transform: translateY(0); }
    50%      { opacity: 1;    transform: translateY(-1px); }
  }

  .actor-mini.alert {
    grid-template-columns: auto 1fr auto;
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

  .rail-icon {
    display: inline-flex;
    color: #C9B26A;
  }

  .rail-title {
    flex: 1 1 auto;
    text-align: left;
  }

  .rail-expand {
    color: rgba(244, 213, 140, 0.55);
    font-size: 1rem;
    line-height: 1;
  }

  /* ===== Objectifs ===== */
  .objectives-mini {
    list-style: none;
    margin: 0;
    padding: 0.35rem 0.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .obj-mini {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.2rem 0.4rem;
    font-size: 0.74rem;
    line-height: 1.25;
  }

  .obj-label {
    color: rgba(244, 239, 226, 0.88);
    grid-column: 1 / 3;
  }

  .status-satisfied .obj-label { color: rgba(141, 192, 159, 0.95); }
  .status-failed .obj-label { color: rgba(224, 143, 146, 0.85); text-decoration: line-through; }

  .obj-bar {
    grid-column: 1;
    height: 3px;
    background: rgba(201, 178, 106, 0.18);
    border-radius: 2px;
    overflow: hidden;
  }

  .obj-bar i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #C9B26A, #F4D58C);
    transition: width 0.4s ease;
  }

  .obj-pct {
    grid-column: 2;
    font-family: 'Courier Prime', monospace;
    font-size: 0.68rem;
    color: rgba(244, 213, 140, 0.7);
    text-align: right;
  }

  .obj-tag {
    grid-column: 2;
    grid-row: 1;
    align-self: start;
    font-size: 0.78rem;
    font-weight: 700;
  }

  .tag-ok { color: #8DC09F; }
  .tag-ko { color: #E08F92; }

  .obj-empty {
    color: rgba(244, 239, 226, 0.4);
    font-style: italic;
    font-size: 0.74rem;
    text-align: center;
    padding: 0.5rem 0;
  }

  /* ===== Acteurs ===== */
  .actors-mini {
    list-style: none;
    margin: 0;
    padding: 0.4rem 0.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .actor-mini {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.4rem;
    align-items: center;
  }

  .actor-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    box-shadow: 0 0 6px currentColor;
  }

  .actor-id {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
    min-width: 0;
  }

  .actor-id strong {
    color: rgba(244, 239, 226, 0.92);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
  }

  .actor-id em {
    color: rgba(244, 213, 140, 0.6);
    font-size: 0.62rem;
    font-style: italic;
  }

  .actor-bars {
    grid-column: 1 / 3;
    margin-top: 0.15rem;
  }

  .actor-bar {
    display: block;
    height: 2px;
    background: rgba(201, 178, 106, 0.15);
    border-radius: 1px;
    overflow: hidden;
  }

  .actor-bar i {
    display: block;
    height: 100%;
    transition: width 0.4s ease, background 0.4s ease;
  }

  /* Mobile : rail caché */
  @media (max-width: 1024px) {
    .left-rail { display: none; }
  }
</style>
