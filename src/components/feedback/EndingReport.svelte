<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { EndingRender } from '../../game/engine/endingEngine';
  import { TRAIT_LABELS, TRAIT_BLURBS } from '../../game/narrative/personalityEngine';
  import { rebirth } from '../../game/engine/gameState.svelte';

  interface Props {
    ending: EndingRender;
    onReplay: () => void;
  }
  let { ending, onReplay }: Props = $props();

  const trait = $derived(ending.stats.finalDominantTrait);

  function statusOf(id: string): 'satisfied' | 'failed' | 'pending' {
    const item = ending.objectiveProgress.find(p => p.id === id);
    if (item?.satisfied) return 'satisfied';
    if (item?.failed) return 'failed';
    return 'pending';
  }

  /**
   * Export du journal de partie en Markdown — pensé pour le mode
   * formation paritaire : le formateur peut récupérer un compte-rendu
   * propre par stagiaire, l'imprimer ou l'archiver.
   */
  function exportJournal() {
    const s = rebirth.state;
    if (!s) return;
    const lines: string[] = [];
    lines.push(`# Paritas — Journal de partie`);
    lines.push('');
    lines.push(`**Joueur** : ${s.name || '—'}`);
    lines.push(`**Camp** : ${s.camp === 'salarie' ? 'Salarié' : 'Patronat'}`);
    lines.push(`**Tours joués** : ${ending.stats.turnsPlayed}`);
    lines.push(`**Score final** : ${ending.score}/100`);
    lines.push(`**Trait dominant** : ${TRAIT_LABELS[trait]}`);
    lines.push('');
    lines.push(`## Épilogue`);
    lines.push('');
    lines.push(`### ${ending.title}`);
    lines.push('');
    lines.push(ending.text);
    lines.push('');
    if (ending.objectives.length > 0) {
      lines.push(`## Mandat — bilan`);
      lines.push('');
      for (const o of ending.objectives) {
        const status = statusOf(o.id);
        const mark = status === 'satisfied' ? '✓' : status === 'failed' ? '✗' : '·';
        lines.push(`- **${mark} ${o.label}** — ${o.description}`);
      }
      lines.push('');
    }
    lines.push(`## Statistiques`);
    lines.push('');
    lines.push(`- Institutions construites : ${ending.stats.institutionsBuilt}`);
    lines.push(`- Compromis refusés : ${ending.stats.refusedCompromise}`);
    lines.push(`- Base trahie : ${ending.stats.betrayedBase}`);
    lines.push(`- Mouvements épuisés : ${ending.stats.exhaustedMovements}`);
    lines.push('');
    lines.push(`## Journal complet (${rebirth.log.length} entrées)`);
    lines.push('');
    for (const entry of rebirth.log) {
      lines.push(`- ${entry}`);
    }
    lines.push('');
    lines.push(`---`);
    lines.push(`*Exporté depuis Paritas le ${new Date().toLocaleDateString('fr-FR')}.*`);

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (s.name || 'partie').replace(/[^a-zA-Z0-9-_]/g, '_');
    a.download = `paritas-${safeName}-T${ending.stats.turnsPlayed}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<article class="bordered-card p-6 space-y-4 max-w-2xl mx-auto" in:fade={{ duration: 360 }}>
  <header class="text-center space-y-1">
    <div class="text-xs uppercase tracking-wider text-parchment-dim/85">
      Épilogue · {ending.stats.turnsPlayed} tours joués
    </div>
    <h2 class="font-display text-3xl text-gold">{ending.title}</h2>
  </header>

  <div class="text-center">
    <div class="font-display text-6xl text-gold leading-none">
      {ending.score}<span class="text-2xl text-parchment-dim/80">/100</span>
    </div>
    <p class="text-xs italic text-parchment-dim/85 mt-1">Score final</p>
  </div>

  <p class="text-parchment leading-relaxed text-sm whitespace-pre-line">
    {ending.text}
  </p>

  <div class="border-t border-line/60 pt-4 space-y-1.5 text-sm">
    <div class="font-display uppercase tracking-wider text-gold text-xs">
      Ton style — {TRAIT_LABELS[trait]}
    </div>
    <p class="italic text-parchment-dim leading-snug">
      {TRAIT_BLURBS[trait]}
    </p>
  </div>

  {#if ending.objectives.length > 0}
    <div class="border-t border-line/60 pt-4 space-y-2">
      <div class="font-display uppercase tracking-wider text-gold text-xs">
        Mandat — bilan
      </div>
      <ul class="space-y-1.5">
        {#each ending.objectives as objective}
          {@const s = statusOf(objective.id)}
          <li class="objective-line" data-status={s}>
            <span class="dot" aria-hidden="true">
              {#if s === 'satisfied'}✓{:else if s === 'failed'}✗{:else}·{/if}
            </span>
            <div class="min-w-0 flex-1">
              <b>{objective.label}</b>
              <small>{objective.description}</small>
            </div>
            <em>
              {#if s === 'satisfied'}atteint{:else if s === 'failed'}manqué{:else}inachevé{/if}
            </em>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="grid grid-cols-2 gap-3 text-xs">
    <div class="rounded-md border border-line/60 p-2">
      <div class="text-parchment-dim/85 uppercase">Institutions</div>
      <div class="font-display text-gold text-lg">
        {ending.stats.institutionsBuilt}
      </div>
    </div>
    <div class="rounded-md border border-line/60 p-2">
      <div class="text-parchment-dim/85 uppercase">Compromis refusés</div>
      <div class="font-display text-gold text-lg">
        {ending.stats.refusedCompromise}
      </div>
    </div>
    <div class="rounded-md border border-line/60 p-2">
      <div class="text-parchment-dim/85 uppercase">Base trahie</div>
      <div class="font-display text-gold text-lg">
        {ending.stats.betrayedBase}
      </div>
    </div>
    <div class="rounded-md border border-line/60 p-2">
      <div class="text-parchment-dim/85 uppercase">Mouvements épuisés</div>
      <div class="font-display text-gold text-lg">
        {ending.stats.exhaustedMovements}
      </div>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2 mt-2">
    <button type="button" class="btn-ghost" onclick={exportJournal}>
      Exporter le journal
    </button>
    <button type="button" class="btn-primary" onclick={onReplay}>
      Rejouer
    </button>
  </div>
  <p class="text-[0.7rem] italic text-parchment-dim/65 text-center">
    L'export Markdown contient la partie complète — utile pour le mode formation paritaire.
  </p>
</article>

<style>
  .objective-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid rgba(201, 154, 64, 0.18);
    border-radius: 0.5rem;
    background: rgba(201, 154, 64, 0.05);
    padding: 0.45rem 0.55rem;
  }

  .objective-line[data-status='satisfied'] {
    border-color: rgba(95, 181, 107, 0.4);
    background: rgba(95, 181, 107, 0.07);
  }

  .objective-line[data-status='failed'] {
    border-color: rgba(224, 122, 110, 0.4);
    background: rgba(224, 122, 110, 0.05);
    opacity: 0.78;
  }

  .objective-line .dot {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.45);
    color: rgba(244, 213, 139, 0.75);
    font-size: 0.78rem;
    line-height: 1;
  }

  .objective-line[data-status='satisfied'] .dot {
    background: rgba(95, 181, 107, 0.16);
    color: #aedab5;
  }

  .objective-line[data-status='failed'] .dot {
    background: rgba(224, 122, 110, 0.16);
    color: #e8a09b;
  }

  .objective-line b {
    display: block;
    color: #ede4c9;
    font-size: 0.78rem;
    line-height: 1.2;
  }

  .objective-line small {
    display: block;
    color: rgba(237, 228, 201, 0.62);
    font-size: 0.74rem;
    line-height: 1.3;
    margin-top: 0.1rem;
  }

  .objective-line em {
    flex-shrink: 0;
    font-style: normal;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #f4d58b;
  }

  .objective-line[data-status='satisfied'] em {
    color: #aedab5;
  }

  .objective-line[data-status='failed'] em {
    color: #e8a09b;
  }
</style>
