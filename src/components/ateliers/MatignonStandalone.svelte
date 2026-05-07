<script lang="ts">
  /* ============================================================
     MatignonStandalone — version standalone de l'atelier Matignon 1936
     Accessible via /mini/matignon/
     ============================================================ */
  import { fade } from 'svelte/transition';
  import {
    startMatignonSession,
    applyMatignonMove,
    availableMatignonMoves,
    buildMatignonReplay,
    evaluateMatignonLearning,
    MATIGNON_BRIEF,
    type MatignonMoveId,
    type MatignonResult,
    type MatignonLearningProfile
  } from '../../game/negotiation/matignon';

  let session = $state(startMatignonSession());
  const availableMoves = $derived(availableMatignonMoves(session));
  const currentBeat = $derived(session.history.at(-1)?.transition ?? {
    trigger: 'table_suspended' as const,
    intensity: 2 as const,
    mood: 'tendu' as const,
    text: 'La table s\'ouvre. Chaque camp cherche encore ce qu\'il peut obtenir sans se perdre.'
  });

  let finalReplay: ReturnType<typeof buildMatignonReplay> | null = $state(null);
  let learning: MatignonLearningProfile | null = $state(null);

  function choose(id: MatignonMoveId) {
    session = applyMatignonMove(session, id);
    if (session.phase === 'ended') {
      finalReplay = buildMatignonReplay(session);
      learning = evaluateMatignonLearning(session);
    }
  }

  function restart() {
    session = startMatignonSession();
    finalReplay = null;
    learning = null;
  }

  const phaseLabel: Record<string, string> = {
    opening: 'Phase 1 — Ouverture',
    counter: 'Phase 2 — Contre-proposition',
    ratification: 'Phase 3 — Ratification',
    ended: 'Terminé'
  };

  const moodEmoji: Record<string, string> = {
    calme: '🕊', tendu: '⚡', grave: '🌑', euphorique: '✊', melancolique: '🌧'
  };

  const skillLabels: Record<string, string> = {
    mandateCraft: 'Lecture du mandat',
    tableReading: 'Lecture de table',
    concessionDesign: 'Architecture de concession',
    coalitionBuilding: 'Coalition',
    legalStrategy: 'Stratégie juridique',
    publicNarrative: 'Récit public',
    conflictTiming: 'Timing conflictuel',
    institutionalMemory: 'Mémoire institutionnelle',
    ethicalClarity: 'Clarté éthique'
  };
</script>

<div class="min-h-screen bg-stone-950 text-parchment font-body">
  <!-- Header -->
  <header class="border-b border-stone-800 p-4">
    <div class="max-w-2xl mx-auto flex items-center justify-between">
      <div>
        <span class="text-xs uppercase tracking-widest text-stone-500">Atelier PARITAS</span>
        <h1 class="font-display text-gold text-xl mt-0.5">🏛️ Hôtel Matignon</h1>
        <p class="text-xs text-stone-400">{MATIGNON_BRIEF.date} · {MATIGNON_BRIEF.situation}</p>
      </div>
      {#if session.phase !== 'opening' || session.history.length > 0}
        <button
          type="button"
          onclick={restart}
          class="text-xs text-stone-500 hover:text-stone-300 border border-stone-700 px-3 py-1.5 rounded"
        >Recommencer</button>
      {/if}
    </div>
  </header>

  <main class="max-w-2xl mx-auto p-4 space-y-6">

    {#if session.phase !== 'ended'}
      <!-- Phase courante -->
      <div class="text-center" in:fade={{ duration: 200 }}>
        <div class="text-xs uppercase tracking-widest text-stone-500 mb-1">
          {phaseLabel[session.phase] ?? session.phase}
        </div>

        <!-- Scène de table -->
        <div class="bg-stone-900 border border-stone-700 rounded-lg p-4 text-center space-y-2 my-4">
          <div class="flex justify-center gap-6 text-sm font-medium">
            <span class="text-red-400">CGT</span>
            <span class="text-stone-500">—</span>
            <span class="text-blue-400">État</span>
            <span class="text-stone-500">—</span>
            <span class="text-amber-400">CGPF</span>
          </div>
          <div class="text-stone-400 text-xs">
            {moodEmoji[currentBeat.mood] ?? ''}
            {currentBeat.trigger.replaceAll('_', ' ')}
          </div>
          <p class="text-sm text-parchment leading-relaxed italic">
            "{currentBeat.text}"
          </p>
        </div>

        <!-- Métriques -->
        <div class="grid grid-cols-5 gap-2 text-xs mb-4">
          {#each Object.entries(session.metrics) as [key, val]}
            <div class="bg-stone-900 border border-stone-800 rounded p-2 text-center">
              <div class="text-stone-500 text-[10px] uppercase leading-none mb-1">
                {key === 'baseTrust' ? 'Base' :
                 key === 'employerPressure' ? 'Pression' :
                 key === 'statePatience' ? 'État' :
                 key === 'publicLegibility' ? 'Lisibilité' : 'Draft'}
              </div>
              <div class="text-gold font-medium">{val}</div>
            </div>
          {/each}
        </div>

        <!-- Choix disponibles -->
        <div class="space-y-2">
          <div class="text-xs text-stone-500 uppercase tracking-wider mb-2">Ton prochain mouvement</div>
          {#each availableMoves as move}
            <button
              type="button"
              onclick={() => choose(move.id)}
              class="w-full bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-gold/40 rounded-lg p-3 text-left transition-colors group"
            >
              <div class="font-medium text-sm text-parchment group-hover:text-gold transition-colors">
                {move.label}
              </div>
              <div class="text-xs text-stone-400 mt-0.5">{move.intent}</div>
              <div class="text-xs text-amber-700/70 mt-0.5">⚠ {move.risk}</div>
            </button>
          {/each}
        </div>
      </div>

    {:else if finalReplay && learning}
      <!-- Résultat final -->
      <div in:fade={{ duration: 300 }}>
        {#if finalReplay.result.agreementId}
          <div class="text-center py-4">
            <div class="text-4xl mb-2">✍️</div>
            <h2 class="font-display text-gold text-lg">Accord de Matignon signé</h2>
            <p class="text-stone-400 text-sm mt-1">
              Un accord historique. La grève peut être levée dans l'honneur.
            </p>
          </div>
          {#if finalReplay.result.quality}
            <div class="grid grid-cols-5 gap-2 text-xs mb-4">
              {#each Object.entries(finalReplay.result.quality) as [k, v]}
                <div class="bg-stone-900 border border-stone-800 rounded p-2 text-center">
                  <div class="text-stone-500 text-[10px] uppercase leading-none mb-1">
                    {k === 'materialGain' ? 'Gain mat.' :
                     k === 'legalStrength' ? 'Force jur.' :
                     k === 'internalAcceptability' ? 'Accepta.' :
                     k === 'publicLegibility' ? 'Lisib.' : 'Durée'}
                  </div>
                  <div class="font-medium" style="color: {Number(v) >= 70 ? '#C9A84C' : Number(v) >= 50 ? '#9ca3af' : '#f87171'}">
                    {v}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        {:else}
          <div class="text-center py-4">
            <div class="text-4xl mb-2">🚪</div>
            <h2 class="font-display text-red-400 text-lg">Table rompue</h2>
            <p class="text-stone-400 text-sm mt-1">
              {finalReplay.result.ruptureReason ?? 'La négociation a échoué. Le récit public devient une ressource critique.'}
            </p>
          </div>
        {/if}

        <!-- Profil d'apprentissage -->
        <div class="bg-stone-900 border border-stone-700 rounded-lg p-4 space-y-3">
          <div class="text-xs uppercase tracking-widest text-stone-500">Profil Argus — Compétences mobilisées</div>
          <div class="space-y-1.5">
            {#each Object.entries(learning.scores) as [skill, score]}
              <div class="flex items-center gap-2">
                <div class="text-xs text-stone-400 w-36 shrink-0">{skillLabels[skill] ?? skill}</div>
                <div class="flex-1 bg-stone-800 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full bg-gold/70"
                    style="width: {score}%"
                  ></div>
                </div>
                <div class="text-xs text-stone-500 w-6 text-right">{score}</div>
              </div>
            {/each}
          </div>
          <p class="text-xs text-stone-400 italic border-t border-stone-800 pt-2">
            {learning.recommendation}
          </p>
        </div>

        <!-- Audit -->
        {#if !finalReplay.audit.ok}
          <div class="bg-red-950/30 border border-red-800/40 rounded p-3 text-xs text-red-300">
            ⚠ Audit: {finalReplay.audit.warnings.join(' — ')}
          </div>
        {/if}

        <button
          type="button"
          onclick={restart}
          class="w-full bg-gold/10 hover:bg-gold/20 border border-gold/40 text-gold rounded-lg py-3 text-sm font-medium transition-colors"
        >
          Rejouer — autre chemin
        </button>
      </div>
    {/if}
  </main>
</div>
