<script lang="ts">
  /* ============================================================
     TopActionsBriefing — résumé d'avant-tour
     ============================================================
     Petit panneau discret qui classe les abilities par fuel score
     courant et signale les TOP 3 « ce que tu peux faire de mieux
     ce tour », et les BOTTOM 1 « ce qui va mal passer ».

     Cadre théorique : autodétermination — autonomie (« je sais où
     porter mon effort »), motivation (« je vois ma marge de
     manœuvre avant d'engager »).

     Affiché en toggle compact dans le bandeau du dashboard.
     ============================================================ */
  import { rebirth } from '../../game/engine/gameState.svelte';
  import {
    abilityFuelScore, fuelScoreLabel, ABILITY_SHORT_LABEL,
    type AbilityId
  } from '../../game/simulation/resourceUtility';

  interface Props {
    /** Liste des abilities à classer. Par défaut : les 6 principales
     *  qui ont une UI dédiée dans le cockpit. */
    abilities?: AbilityId[];
  }
  let { abilities = ['manifestation', 'meeting', 'tresorerie', 'talents', 'tracts', 'petition'] }: Props = $props();

  let open = $state(false);

  const ranked = $derived.by(() => {
    const r = rebirth.state?.resources;
    if (!r) return [];
    return abilities
      .map(a => ({ ability: a, score: abilityFuelScore(a, r) }))
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
</script>

<div class="briefing-wrap">
  <button
    type="button"
    class="briefing-toggle"
    class:open
    onclick={() => (open = !open)}
    aria-expanded={open}
    title="Voir tes 3 actions les plus puissantes ce tour, et celle qui va peiner."
  >
    <span class="bt-glyph">◎</span>
    <span class="bt-label">Briefing</span>
    {#if top3.length > 0}
      <span class="bt-best" data-status={fuelStatus(top3[0].score)}>
        {ABILITY_SHORT_LABEL[top3[0].ability]} {top3[0].score}
      </span>
    {/if}
  </button>

  {#if open && ranked.length > 0}
    <div class="briefing-pop" role="dialog" aria-label="Briefing d'avant-tour">
      <div class="bp-section">
        <h4>Top 3 ce tour</h4>
        <ul class="bp-list">
          {#each top3 as r (r.ability)}
            <li class="bp-row" data-status={fuelStatus(r.score)}>
              <span class="row-rank">●</span>
              <span class="row-name">{ABILITY_SHORT_LABEL[r.ability]}</span>
              <span class="row-score">{r.score}<small>/100</small></span>
              <span class="row-tag">{fuelScoreLabel(r.score)}</span>
            </li>
          {/each}
        </ul>
      </div>

      {#if bottom1 && bottom1.score < 50}
        <div class="bp-section warn">
          <h4>À éviter ce tour</h4>
          <div class="bp-row" data-status={fuelStatus(bottom1.score)}>
            <span class="row-rank">⚠</span>
            <span class="row-name">{ABILITY_SHORT_LABEL[bottom1.ability]}</span>
            <span class="row-score">{bottom1.score}<small>/100</small></span>
            <span class="row-tag">{fuelScoreLabel(bottom1.score)}</span>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .briefing-wrap {
    position: relative;
    display: inline-flex;
  }

  .briefing-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.6rem;
    background: linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
    border: 1px solid rgba(201, 178, 106, 0.45);
    border-radius: 0.35rem;
    color: #F4D58C;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: filter 0.18s ease, border-color 0.18s ease;
  }
  .briefing-toggle:hover {
    border-color: #C9B26A;
    filter: brightness(1.08);
  }
  .briefing-toggle.open {
    background: linear-gradient(180deg, #5A3622 0%, #3D2615 100%);
    border-color: #F4D58C;
  }
  .bt-glyph { color: #C9B26A; font-size: 0.88rem; line-height: 1; }
  .bt-label { line-height: 1; }
  .bt-best {
    display: inline-flex;
    align-items: baseline;
    gap: 0.18rem;
    padding: 0.05rem 0.4rem;
    border-radius: 999px;
    font-family: 'Courier Prime', monospace;
    font-size: 0.62rem;
    font-weight: 700;
    border: 1px solid;
  }
  .bt-best[data-status='excellent'] { background: rgba(58,107,71,0.18); color: #7BCBA1; border-color: rgba(58,107,71,0.55); }
  .bt-best[data-status='solid']     { background: rgba(91,163,200,0.16); color: #9CC8DD; border-color: rgba(91,163,200,0.5); }
  .bt-best[data-status='limited']   { background: rgba(201,178,106,0.16); color: #E0C97A; border-color: rgba(201,178,106,0.45); }
  .bt-best[data-status='fragile']   { background: rgba(217,130,28,0.18); color: #F0B870; border-color: rgba(217,130,28,0.5); }
  .bt-best[data-status='empty']     { background: rgba(176,24,30,0.22); color: #E08F92; border-color: rgba(176,24,30,0.6); }

  .briefing-pop {
    position: absolute;
    bottom: calc(100% + 8px);
    right: 0;
    z-index: 50;
    min-width: 280px;
    background: linear-gradient(180deg, #2A1A0E 0%, #1A1108 100%);
    border: 1px solid #C9B26A;
    border-radius: 0.5rem;
    padding: 0.7rem 0.85rem 0.85rem;
    color: #F4EFE2;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  }

  .bp-section + .bp-section { margin-top: 0.7rem; }

  .bp-section h4 {
    margin: 0 0 0.4rem 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #C9B26A;
  }
  .bp-section.warn h4 { color: #E08F92; }

  .bp-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .bp-row {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: baseline;
    gap: 0.45rem;
    padding: 0.32rem 0.5rem;
    background: rgba(201, 178, 106, 0.06);
    border-left: 2px solid rgba(201, 178, 106, 0.5);
    border-radius: 0.25rem;
    font-family: 'Source Serif 4', Georgia, serif;
  }
  .bp-row[data-status='excellent'] { border-left-color: #7BCBA1; }
  .bp-row[data-status='solid']     { border-left-color: #9CC8DD; }
  .bp-row[data-status='limited']   { border-left-color: #E0C97A; }
  .bp-row[data-status='fragile']   { border-left-color: #F0B870; }
  .bp-row[data-status='empty']     {
    border-left-color: #E08F92;
    background: rgba(176, 24, 30, 0.10);
  }

  .row-rank {
    color: var(--rank-color, currentColor);
    font-family: 'Courier Prime', monospace;
    font-size: 0.7rem;
  }
  .row-name {
    color: #F4D58C;
    font-weight: 700;
    font-size: 0.82rem;
  }
  .row-score {
    color: rgba(244, 239, 226, 0.85);
    font-family: 'Courier Prime', monospace;
    font-size: 0.78rem;
    font-weight: 700;
  }
  .row-score small { font-size: 0.62rem; opacity: 0.6; }
  .row-tag {
    color: rgba(244, 239, 226, 0.65);
    font-size: 0.68rem;
    font-style: italic;
  }

  @media (max-width: 600px) {
    .bt-label { display: none; }
    .briefing-pop { right: -8px; min-width: 240px; }
  }
</style>
