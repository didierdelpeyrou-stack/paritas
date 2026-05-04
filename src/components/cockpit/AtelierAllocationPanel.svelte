<script lang="ts">
  /* ============================================================
     AtelierAllocationPanel — panneau d'allocation Tycoon (gauche)
     ============================================================
     Phase 2 du pivot 3 modes : Atelier doit ressembler à
     Game Dev Tycoon, pas à un cockpit comprimé.

     Composition (de haut en bas) :
     1. Briefing déplié : top 3 actions du tour + risque
     2. Ressources en barres horizontales (les 7) avec delta visible
     3. Talents en résumé compact (par groupe d'affectation)

     Inspiration : Will Wright (« le système ouvert visible »),
     Sid Meier (« 1 décision intéressante par minute, lisible »).
     Wright avait demandé : « la cuillère que je cherchais dans
     Sims 4 — un panneau qui me dit POURQUOI cette action va bien
     marcher ou mal marcher. »
     ============================================================ */
  import { rebirth } from '../../game/engine/gameState.svelte';
  import {
    abilityFuelScore, fuelScoreLabel, ABILITY_SHORT_LABEL,
    thresholdFor, type AbilityId
  } from '../../game/simulation/resourceUtility';
  import type { ResourceKey } from '../../game/types';
  import CockpitIcon from './CockpitIcon.svelte';
  import type { IconKey } from './icons';

  const gs = $derived(rebirth.state);

  /* ====== Briefing : top 3 + bottom 1 ====== */
  const ABILITIES_TO_RANK: AbilityId[] =
    ['manifestation', 'meeting', 'tresorerie', 'talents', 'tracts', 'petition'];

  const ranked = $derived.by(() => {
    if (!gs) return [];
    return ABILITIES_TO_RANK
      .map(a => ({ ability: a, score: abilityFuelScore(a, gs.resources) }))
      .sort((x, y) => y.score - x.score);
  });

  const top3 = $derived(ranked.slice(0, 3));
  const bottom1 = $derived(ranked[ranked.length - 1]);

  function fuelStatus(score: number): 'excellent' | 'solid' | 'limited' | 'fragile' | 'empty' {
    if (score >= 75) return 'excellent';
    if (score >= 55) return 'solid';
    if (score >= 35) return 'limited';
    if (score >= 18) return 'fragile';
    return 'empty';
  }

  /* ====== Ressources : les 7 en barres horizontales ====== */
  /* Snapshot du tour précédent pour le delta. */
  let snapshot = $state<Record<string, number>>({});
  let lastSnapshotTurn = $state(-1);

  $effect(() => {
    if (!gs) return;
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

  const RES_META: Array<{ key: ResourceKey; label: string; color: string; icon: IconKey }> = [
    { key: 'caisse',          label: 'Caisse',     color: '#C9B26A', icon: 'sceau' },
    { key: 'confiance',       label: 'Confiance',  color: '#5BA3C8', icon: 'carte' },
    { key: 'cohesionInterne', label: 'Cohésion',   color: '#E08F92', icon: 'poing' },
    { key: 'rapportDeForce',  label: 'Force ext.', color: '#D9821C', icon: 'pupitre' },
    { key: 'legitimite',      label: 'Légitimité', color: '#9B5BC8', icon: 'balance' },
    { key: 'santeSociale',    label: 'Santé soc.', color: '#3A6B47', icon: 'epis' },
    { key: 'institution',     label: 'Institution', color: '#B09150', icon: 'rouage' }
  ];

  /* ====== Talents : résumé par groupe d'affectation ====== */
  /* Le state gs.organization expose talents et leurs affectations. */
  const talentSummary = $derived.by(() => {
    if (!gs?.organization) return null;
    const org = gs.organization;
    /* Groupes d'affectation : reflexion / action / communication.
       Compteur par groupe basé sur engagedTalents (cf. PlayerOrganization). */
    const totals = {
      reflexion: 0,
      action: 0,
      communication: 0,
      libre: 0
    };
    const talents = org.engagedTalents ?? [];
    for (const t of talents) {
      const g = t.group;
      if (g === 'reflexion' || g === 'action' || g === 'communication') totals[g]++;
      else totals.libre++;
    }
    return {
      total: talents.length,
      ...totals
    };
  });
</script>

{#if gs}
<aside class="atelier-panel" aria-label="Panneau d'allocation Atelier">

  <!-- 1. BRIEFING toujours déplié -->
  <section class="block briefing">
    <header class="block-head">
      <span class="head-glyph" aria-hidden="true">◎</span>
      <span class="head-label">Briefing tactique</span>
    </header>
    <ul class="briefing-list">
      {#each top3 as r (r.ability)}
        <li class="brief-row" data-status={fuelStatus(r.score)}>
          <span class="rank">●</span>
          <span class="row-name">{ABILITY_SHORT_LABEL[r.ability]}</span>
          <span class="row-score">{r.score}</span>
          <span class="row-tag">{fuelScoreLabel(r.score)}</span>
        </li>
      {/each}
    </ul>
    {#if bottom1 && bottom1.score < 50}
      <div class="brief-warn">
        <span class="warn-glyph" aria-hidden="true">⚠</span>
        <span class="warn-text">À éviter : <strong>{ABILITY_SHORT_LABEL[bottom1.ability]}</strong> ({bottom1.score})</span>
      </div>
    {/if}
  </section>

  <!-- 2. RESSOURCES en barres horizontales avec delta -->
  <section class="block resources">
    <header class="block-head">
      <span class="head-glyph" aria-hidden="true">▣</span>
      <span class="head-label">Les 7 ressources</span>
    </header>
    <ul class="res-list">
      {#each RES_META as r (r.key)}
        {@const v = (gs.resources as any)[r.key] ?? 0}
        {@const d = deltaFor(r.key, v)}
        {@const palier = thresholdFor(r.key, v)}
        {@const crit = v < 18}
        <li class="res-row" class:crit style:--c={r.color}
          title={`${r.label} : ${Math.round(v)}/100 — ${palier.level.toUpperCase()} : ${palier.unlock}`}
        >
          <span class="res-icon"><CockpitIcon name={r.icon} size={12} /></span>
          <span class="res-name">{r.label}</span>
          <span class="res-bar" aria-hidden="true">
            <i style:width="{Math.max(0, Math.min(100, v))}%"></i>
            <span class="tick" style:left="50%"></span>
            <span class="tick" style:left="75%"></span>
          </span>
          <span class="res-val">{Math.round(v)}</span>
          {#if d !== 0}
            <span class="res-delta" class:up={d > 0} class:down={d < 0}>
              {d > 0 ? '+' : ''}{d}
            </span>
          {:else}
            <span class="res-delta-empty"></span>
          {/if}
        </li>
      {/each}
    </ul>
  </section>

  <!-- 3. TALENTS résumé par groupe -->
  {#if talentSummary}
    <section class="block talents">
      <header class="block-head">
        <span class="head-glyph" aria-hidden="true">⚭</span>
        <span class="head-label">Talents — {talentSummary.total} actif{talentSummary.total > 1 ? 's' : ''}</span>
      </header>
      <div class="talents-grid">
        <div class="talent-cell" data-grp="reflexion" title="Réflexion : think tank, dossiers techniques, légitimité.">
          <span class="cell-num">{talentSummary.reflexion}</span>
          <span class="cell-label">Réflexion</span>
        </div>
        <div class="talent-cell" data-grp="action" title="Action : terrain, mobilisation, rapport de force.">
          <span class="cell-num">{talentSummary.action}</span>
          <span class="cell-label">Action</span>
        </div>
        <div class="talent-cell" data-grp="communication" title="Communication : médias, opinion, légitimité publique.">
          <span class="cell-num">{talentSummary.communication}</span>
          <span class="cell-label">Communication</span>
        </div>
        {#if talentSummary.libre > 0}
          <div class="talent-cell" data-grp="libre" title="Talents recrutés sans affectation.">
            <span class="cell-num">{talentSummary.libre}</span>
            <span class="cell-label">Libres</span>
          </div>
        {/if}
      </div>
      <p class="talents-hint">
        Affecte tes talents depuis le mini-jeu Talents.
      </p>
    </section>
  {/if}
</aside>
{/if}

<style>
  .atelier-panel {
    width: 280px;
    flex-shrink: 0;
    padding: 0.85rem 0.7rem;
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.04), transparent 70%),
      linear-gradient(180deg, #1F1813 0%, #110D0A 100%);
    border-right: 1px solid rgba(201, 178, 106, 0.25);
    color: #F4EFE2;
    font-family: 'Source Serif 4', Georgia, serif;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(201, 178, 106, 0.25) transparent;
  }

  .block {
    background: rgba(13, 11, 8, 0.4);
    border: 1px solid rgba(201, 178, 106, 0.18);
    border-radius: 0.4rem;
    padding: 0.55rem 0.65rem 0.65rem;
  }

  .block-head {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding-bottom: 0.4rem;
    margin-bottom: 0.45rem;
    border-bottom: 1px solid rgba(201, 178, 106, 0.18);
    color: #C9B26A;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .head-glyph { color: #C9B26A; font-size: 0.95rem; line-height: 1; }

  /* === Briefing === */
  .briefing-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .brief-row {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: baseline;
    gap: 0.45rem;
    padding: 0.28rem 0.5rem;
    background: rgba(201, 178, 106, 0.06);
    border-left: 2px solid rgba(201, 178, 106, 0.4);
    border-radius: 0.25rem;
  }
  .brief-row[data-status='excellent'] { border-left-color: #7BCBA1; }
  .brief-row[data-status='solid']     { border-left-color: #9CC8DD; }
  .brief-row[data-status='limited']   { border-left-color: #E0C97A; }
  .brief-row[data-status='fragile']   { border-left-color: #F0B870; }
  .brief-row[data-status='empty']     { border-left-color: #E08F92; background: rgba(176, 24, 30, 0.08); }

  .rank { color: currentColor; font-family: 'Courier Prime', monospace; font-size: 0.6rem; }
  .row-name {
    color: #F4D58C;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .row-score {
    font-family: 'Courier Prime', monospace;
    font-size: 0.78rem;
    font-weight: 700;
    color: rgba(244, 239, 226, 0.85);
  }
  .row-tag {
    font-size: 0.62rem;
    color: rgba(244, 239, 226, 0.55);
    font-style: italic;
  }

  .brief-warn {
    margin-top: 0.4rem;
    padding: 0.35rem 0.5rem;
    background: rgba(176, 24, 30, 0.10);
    border: 1px solid rgba(176, 24, 30, 0.4);
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.7rem;
    color: #E08F92;
  }
  .warn-glyph { line-height: 1; }
  .warn-text strong { color: #F4D58C; font-weight: 700; }

  /* === Ressources === */
  .res-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .res-row {
    --c: #C9B26A;
    display: grid;
    grid-template-columns: auto auto 1fr auto auto;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0;
    cursor: help;
    transition: background 0.18s ease;
  }
  .res-row:hover {
    background: rgba(201, 178, 106, 0.06);
  }
  .res-row.crit .res-val {
    color: #E08F92;
  }

  .res-icon {
    color: var(--c);
    display: inline-flex;
    line-height: 1;
  }
  .res-name {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgba(244, 239, 226, 0.75);
    width: 60px;
  }
  .res-bar {
    position: relative;
    height: 6px;
    background: rgba(13, 11, 8, 0.55);
    border-radius: 3px;
    overflow: visible;
  }
  .res-bar i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, var(--c), color-mix(in srgb, var(--c) 70%, #fff));
    border-radius: 3px;
    transition: width 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
    box-shadow: 0 0 4px color-mix(in srgb, var(--c) 50%, transparent);
  }
  .res-bar .tick {
    position: absolute;
    top: -1px;
    bottom: -1px;
    width: 1px;
    background: rgba(244, 213, 140, 0.4);
    pointer-events: none;
  }
  .res-val {
    font-family: 'Courier Prime', monospace;
    font-size: 0.74rem;
    font-weight: 700;
    color: var(--c);
    width: 22px;
    text-align: right;
  }
  .res-delta {
    font-family: 'Courier Prime', monospace;
    font-size: 0.6rem;
    font-weight: 700;
    width: 22px;
    text-align: right;
  }
  .res-delta.up { color: #7BCBA1; }
  .res-delta.down { color: #E08F92; }
  .res-delta-empty { width: 22px; }

  /* === Talents === */
  .talents-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.35rem;
  }
  .talent-cell {
    padding: 0.4rem 0.5rem;
    background: rgba(201, 178, 106, 0.06);
    border: 1px solid rgba(201, 178, 106, 0.2);
    border-radius: 0.3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: help;
    transition: background 0.18s ease, border-color 0.18s ease;
  }
  .talent-cell:hover {
    background: rgba(201, 178, 106, 0.14);
    border-color: rgba(201, 178, 106, 0.5);
  }
  .talent-cell[data-grp='reflexion']     { border-left: 2px solid #5BA3C8; }
  .talent-cell[data-grp='action']        { border-left: 2px solid #D9821C; }
  .talent-cell[data-grp='communication'] { border-left: 2px solid #9B5BC8; }
  .talent-cell[data-grp='libre']         { border-left: 2px solid rgba(201, 178, 106, 0.4); }

  .cell-num {
    font-family: 'Courier Prime', monospace;
    font-size: 1.4rem;
    font-weight: 700;
    color: #F4D58C;
    line-height: 1;
  }
  .cell-label {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.55rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(244, 239, 226, 0.6);
    margin-top: 0.18rem;
  }

  .talents-hint {
    margin: 0.45rem 0 0 0;
    font-size: 0.62rem;
    color: rgba(244, 239, 226, 0.55);
    font-style: italic;
    text-align: center;
  }

  /* Mobile/tablette : le panneau d'allocation Tycoon (280px fixes)
     déborde le viewport et casse le layout. On le masque sous 1024px
     ; le joueur accède aux infos via le dashboard footer + le menu
     burger. (À terme : drawer mobile dédié.) */
  @media (max-width: 1024px) {
    .atelier-panel { display: none; }
  }
</style>
