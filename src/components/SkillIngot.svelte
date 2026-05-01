<script lang="ts">
  /* ============================================================
     SkillIngot.svelte — brique d'or compétence
     Reflet animé qui passe régulièrement (style trophée).
     Hover/clic révèle une citation syndicaliste sourcée.
     Tier visuel selon palier 0/30/50/70/90.
     ============================================================ */
  import { fade, scale } from 'svelte/transition';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  import type { SkillKey } from '$lib/types';
  import { SKILL_QUOTES } from '$lib/data/quotes';
  import { game } from '$lib/stores/game.svelte';
  import { fx } from '$lib/stores/fx.svelte';

  interface Props {
    skill: SkillKey;
    icon: string;
    label: string;
  }

  let { skill, icon, label }: Props = $props();

  let value = $derived(game.state.skills[skill]);
  let displayed = new Tween(0, { duration: 700, easing: cubicOut });
  $effect(() => { displayed.target = value; });

  /* Tier visuel selon palier */
  let tier = $derived(value >= 90 ? 4 : value >= 70 ? 3 : value >= 50 ? 2 : value >= 30 ? 1 : 0);

  /* Citation tournante (par run, mais varie chaque rechargement) */
  const seed = Math.floor(Math.random() * 100);
  let quote = $derived(SKILL_QUOTES[skill][seed % SKILL_QUOTES[skill].length]!);

  /* Stats du skill */
  let stats = $derived(game.state.rollStats.bySkill[skill]);
  let avgRoll = $derived(stats && stats.rolls > 0 ? Math.round(stats.sumRoll / stats.rolls) : null);
  let successRate = $derived(stats && stats.rolls > 0 ? Math.round((stats.success / stats.rolls) * 100) : null);

  /* Pop sur changement de valeur */
  let pop = $state(false);
  let lastValue = $state(0);
  $effect(() => {
    if (value !== lastValue) {
      pop = true;
      setTimeout(() => (pop = false), 600);
      lastValue = value;
    }
  });

  /* Pops actifs sur ce skill */
  let activePops = $derived(fx.pops.filter(p => p.stat === skill));

  let expanded = $state(false);
</script>

<div class="ingot-wrap relative">
  <button
    type="button"
    class="ingot ingot-tier-{tier}"
    class:pop
    onclick={() => (expanded = !expanded)}
    aria-expanded={expanded}>
    <!-- Sheen reflet animé -->
    <span class="sheen"></span>

    <!-- Icône en relief -->
    <span class="ico">{icon}</span>

    <!-- Label compétence -->
    <span class="lbl">{label}</span>

    <!-- Valeur centrale gravée -->
    <span class="val">{Math.round(displayed.current)}</span>

    <!-- Étoiles tier -->
    {#if tier > 0}
      <span class="tier-stars">{'★'.repeat(tier)}</span>
    {/if}

    <!-- DeltaPops -->
    {#each activePops as p (p.id)}
      <span class="delta-pop"
            class:up={p.value > 0}
            class:down={p.value < 0}
            in:fade={{ duration: 100 }}>
        {p.value > 0 ? '+' : ''}{Math.round(p.value)}
      </span>
    {/each}
  </button>

  <!-- Citation déployée -->
  {#if expanded}
    <div class="quote-box" in:scale={{ duration: 250, start: 0.92, easing: cubicOut }}>
      <div class="quote-text">« {quote.text} »</div>
      <div class="quote-author">— {quote.author}</div>
      <div class="quote-context">{quote.context}</div>

      {#if stats && stats.rolls > 0}
        <div class="quote-stats">
          <span><b>{stats.rolls}</b> tirages</span>
          <span><b class="text-emerald-400">{successRate}%</b> succès</span>
          <span>moy. brut : <b>{avgRoll}</b></span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .ingot-wrap { width: 100%; }

  .ingot {
    position: relative;
    width: 100%;
    height: 64px;
    background: linear-gradient(135deg, #3a2f1a 0%, #2a2310 50%, #3a2f1a 100%);
    border: 1px solid #4a3a1a;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: 1fr 1fr;
    grid-template-areas:
      "ico lbl val"
      "ico stars val";
    align-items: center;
    padding: 6px 14px 6px 10px;
    gap: 0 10px;
    font-family: 'Cinzel', Georgia, serif;
  }
  .ingot:hover { transform: translateY(-1px); border-color: #6a5430; box-shadow: 0 8px 16px rgba(0,0,0,0.4); }
  .ingot.pop { box-shadow: 0 0 0 1px rgba(255,224,144,0.35), 0 0 28px rgba(255,224,144,0.28); }
  .ingot:active { transform: translateY(0); }

  /* Tiers : à mesure que la valeur monte, le lingot devient plus or */
  .ingot-tier-0 {
    background: linear-gradient(135deg, #2a2620 0%, #1f1c18 50%, #2a2620 100%);
    border-color: #3a342a;
  }
  .ingot-tier-1 {
    background: linear-gradient(135deg, #3d3220 0%, #2a2010 50%, #3d3220 100%);
    border-color: #5a4a25;
  }
  .ingot-tier-2 {
    background: linear-gradient(135deg, #6a4f1e 0%, #4a3712 50%, #6a4f1e 100%);
    border-color: #8a6a30;
  }
  .ingot-tier-3 {
    background: linear-gradient(135deg, #b08530 0%, #8a661e 50%, #b08530 100%);
    border-color: #d4a040;
    box-shadow: 0 0 12px rgba(212, 160, 64, 0.25);
  }
  .ingot-tier-4 {
    background: linear-gradient(135deg, #f0c070 0%, #c89b3c 50%, #f0c070 100%);
    border-color: #ffe090;
    box-shadow: 0 0 20px rgba(255, 224, 144, 0.4);
  }

  .ico {
    grid-area: ico;
    font-size: 1.6rem;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.25);
    border-radius: 6px;
    border: 1px solid rgba(0,0,0,0.3);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .lbl {
    grid-area: lbl;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(237, 228, 201, 0.85);
    text-shadow: 0 1px 0 rgba(0,0,0,0.5);
    align-self: end;
    line-height: 1;
  }
  .ingot-tier-3 .lbl, .ingot-tier-4 .lbl {
    color: rgba(13, 16, 20, 0.85);
    text-shadow: 0 1px 0 rgba(255,255,255,0.2);
  }

  .val {
    grid-area: val;
    font-size: 1.7rem;
    font-weight: 700;
    color: #ede4c9;
    text-shadow: 0 2px 0 rgba(0,0,0,0.55), 0 0 8px rgba(200,155,60,0.2);
    line-height: 1;
    font-variant-numeric: tabular-nums;
    transition: color 0.3s, text-shadow 0.3s;
  }
  .ingot-tier-3 .val { color: #fff8e0; text-shadow: 0 2px 0 rgba(0,0,0,0.5), 0 0 12px rgba(255,224,144,0.6); }
  .ingot-tier-4 .val { color: #fff; text-shadow: 0 2px 0 rgba(0,0,0,0.5), 0 0 16px rgba(255,255,200,0.8); }

  .tier-stars {
    grid-area: stars;
    font-size: 0.74rem;
    letter-spacing: 0.15em;
    color: rgba(255, 224, 144, 0.85);
    align-self: start;
    line-height: 1;
  }
  .ingot-tier-3 .tier-stars, .ingot-tier-4 .tier-stars { color: rgba(13, 16, 20, 0.7); }

  /* Sheen — reflet qui balaye régulièrement */
  .sheen {
    position: absolute;
    top: 0;
    left: -50%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      105deg,
      transparent 0%,
      transparent 30%,
      rgba(255, 255, 255, 0.18) 50%,
      transparent 70%,
      transparent 100%
    );
    transform: translateX(0);
    animation: sheen-pass 4.5s ease-in-out infinite;
    pointer-events: none;
  }
  .ingot-tier-3 .sheen, .ingot-tier-4 .sheen {
    background: linear-gradient(
      105deg,
      transparent 0%,
      transparent 30%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 70%,
      transparent 100%
    );
    animation-duration: 3s;
  }
  @keyframes sheen-pass {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(400%); }
  }

  /* Pop sur changement de valeur */
  .pop .val { animation: ingot-pop 0.5s ease; }
  .pop .sheen { animation: sheen-strike 0.62s ease-out 1; }
  @keyframes ingot-pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.25); }
    100% { transform: scale(1); }
  }
  @keyframes sheen-strike {
    0% { transform: translateX(0); opacity: 0; }
    15% { opacity: 1; }
    100% { transform: translateX(430%); opacity: 0; }
  }

  /* DeltaPops qui jaillissent au-dessus */
  .delta-pop {
    position: absolute;
    top: 0;
    right: 12px;
    font-size: 1.1rem;
    font-weight: bold;
    pointer-events: none;
    animation: delta-rise 1.4s ease-out forwards;
    text-shadow: 0 2px 4px rgba(0,0,0,0.7);
  }
  .delta-pop.up { color: #5fb56b; }
  .delta-pop.down { color: #e07a6e; }
  @keyframes delta-rise {
    0% { transform: translateY(0); opacity: 0; }
    20% { opacity: 1; }
    100% { transform: translateY(-32px); opacity: 0; }
  }

  /* Citation déployée */
  .quote-box {
    margin-top: 4px;
    padding: 12px 14px;
    background: linear-gradient(180deg, #1a1f26, #0f1014);
    border: 1px solid rgba(200, 155, 60, 0.3);
    border-radius: 8px;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.85rem;
    line-height: 1.45;
  }
  .quote-text {
    color: #ede4c9;
    font-style: italic;
    font-size: 0.92rem;
  }
  .quote-author {
    color: #c89b3c;
    font-family: 'Cinzel', serif;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    margin-top: 6px;
  }
  .quote-context {
    color: rgba(200, 194, 177, 0.65);
    font-size: 0.72rem;
    font-style: italic;
    margin-top: 2px;
  }
  .quote-stats {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dotted rgba(200, 155, 60, 0.2);
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    font-family: 'Cinzel', serif;
    font-size: 0.78rem;
    letter-spacing: 0.05em;
    color: rgba(200, 194, 177, 0.7);
  }
  .quote-stats b { color: #ede4c9; }
</style>
