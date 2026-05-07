<script lang="ts">
  /**
   * MatignonModal.svelte — Mini-jeu négociation Matignon 1936 (V3) intégré dans V2.
   * Déclenché quand gameState.phase === 'matignon'.
   * Émet 'resolve' avec le résultat quand la session se termine.
   */
  import {
    startMatignonSession,
    applyMatignonMove,
    availableMatignonMoves,
    buildMatignonReplay,
    evaluateMatignonLearning,
    auditMatignonSession,
    type MatignonMoveId,
    type MatignonSkillKey
  } from '../../game/negotiation/matignon';

  /* Argus ORDA-003 — Affichage du profil pédagogique (B-DT1) :
     evaluateMatignonLearning calcule un profil 9 compétences mais
     n'était pas affiché. Idem auditMatignonSession et ses warnings.
     Cette section comble la dette technique #1 du Tier 2.
     Ref : V3_ARGUS_PLAN_DE_CHARGE_10_ATELIERS.md § Atelier 5. */
  const SKILL_LABELS: Record<MatignonSkillKey, string> = {
    mandateCraft:        'Conduite du mandat',
    tableReading:        'Lecture de la table',
    concessionDesign:    'Architecture des concessions',
    coalitionBuilding:   'Construction de coalition',
    legalStrategy:       'Stratégie juridique',
    publicNarrative:     'Récit public',
    conflictTiming:      'Tempo du conflit',
    institutionalMemory: 'Mémoire institutionnelle',
    ethicalClarity:      'Clarté éthique'
  };
  const SKILL_DESC: Record<MatignonSkillKey, string> = {
    mandateCraft:        "Tenir le mandat reçu de la base sans le dévoyer.",
    tableReading:        "Lire les positions, postures, et silences à la table.",
    concessionDesign:    "Calibrer les concessions pour qu'elles débloquent sans trahir.",
    coalitionBuilding:   "Construire et maintenir une majorité de signataires.",
    legalStrategy:       "Sécuriser le texte juridique au-delà du rapport de force.",
    publicNarrative:     "Maîtriser le récit médiatique et la légitimité publique.",
    conflictTiming:      "Choisir le bon moment pour escalader, suspendre, signer.",
    institutionalMemory: "Inscrire l'accord dans le temps long de l'institution.",
    ethicalClarity:      "Refuser les compromissions qui détruisent l'autorité morale."
  };

  interface Props {
    onresolve: (result: { agreementId: string | null; quality: Record<string, number> }) => void;
    onskip: () => void;
  }

  const { onresolve, onskip }: Props = $props();

  let session = $state(startMatignonSession());
  const availableMoves = $derived(availableMatignonMoves(session));
  const currentBeat = $derived(session.history.at(-1)?.transition ?? {
    trigger: 'table_suspended',
    text: 'La table s\'ouvre. Chaque camp cherche encore ce qu\'il peut obtenir sans se perdre.'
  });

  function choose(id: MatignonMoveId) {
    session = applyMatignonMove(session, id);
  }

  function finish() {
    const replay = buildMatignonReplay(session);
    onresolve({
      agreementId: replay.result.agreementId,
      quality: replay.result.quality
        ? {
            materialGain: replay.result.quality.materialGain,
            legalStrength: replay.result.quality.legalStrength,
            internalAcceptability: replay.result.quality.internalAcceptability,
            publicLegibility: replay.result.quality.publicLegibility,
            durability: replay.result.quality.durability
          }
        : {}
    });
  }
</script>

<div class="matignon-overlay">
  <div class="matignon-modal">

    <!-- Header -->
    <div class="matignon-header">
      <div class="header-left">
        <span class="eyebrow">7 juin 1936 · 23h40</span>
        <h2>Hôtel Matignon</h2>
        <p class="subtitle">La table des accords</p>
      </div>
      <button class="skip-btn" onclick={onskip} title="Passer la négociation">
        Passer →
      </button>
    </div>

    <!-- Table visuelle -->
    <div class="table-scene">
      <div class="actors">
        <div class="actor actor-cgt">CGT</div>
        <div class="actor actor-etat">État</div>
        <div class="actor actor-patronat">CGPF</div>
      </div>
      <div class="table-text">
        <span class="beat-trigger">{currentBeat.trigger.replaceAll('_', ' ')}</span>
        <p class="beat-text">{currentBeat.text}</p>
      </div>
    </div>

    <!-- Métriques -->
    {#if session.metrics}
      <div class="metrics-row">
        {#each Object.entries(session.metrics) as [key, value]}
          <div class="metric">
            <span class="metric-label">{key}</span>
            <div class="metric-bar">
              <div class="metric-fill" style="width: {value}%"></div>
            </div>
            <span class="metric-value">{value}</span>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Choix de négociation -->
    {#if session.phase !== 'ended'}
      <div class="choices-grid">
        {#each availableMoves as move}
          <button class="move-btn" onclick={() => choose(move.id)}>
            <strong>{move.label}</strong>
            <span>{move.intent}</span>
            <small class="risk">{move.risk}</small>
          </button>
        {/each}
      </div>
    {:else}
      <!-- Fin de négociation -->
      <div class="result-panel">
        {#if session.result}
          {@const learning = evaluateMatignonLearning(session)}
          {@const audit = auditMatignonSession(session)}
          {@const sortedSkills = (Object.entries(learning.scores) as Array<[MatignonSkillKey, number]>)
            .sort((a, b) => b[1] - a[1])}

          <div class="result-outcome" class:accord={session.result.outcome.agreementId} class:rupture={!session.result.outcome.agreementId}>
            <h3>{session.result.outcome.agreementId ? '🤝 Accord signé' : '💥 Table rompue'}</h3>
            {#if session.result.outcome.ruptureReason}
              <p class="rupture-reason">{session.result.outcome.ruptureReason}</p>
            {/if}
            {#if session.result.outcome.agreementId}
              <div class="quality-bars">
                {#each Object.entries(session.result.outcome.quality) as [key, val]}
                  <div class="quality-row">
                    <span>{key}</span>
                    <div class="quality-bar"><div style="width:{val}%"></div></div>
                    <em>{val}</em>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- ╔═══ Profil pédagogique 9 compétences (Argus ORDA-003 / B-DT1) ═══╗ -->
          <section class="learning-panel" aria-labelledby="learning-title">
            <h4 id="learning-title">📚 Ton profil de négociateur·trice</h4>
            <p class="learning-recommendation">
              <strong>Compétence dominante :</strong> {SKILL_LABELS[learning.primarySkill]}.
              <em>{learning.recommendation}</em>
            </p>
            <ul class="skill-list">
              {#each sortedSkills as [skill, score]}
                <li class="skill-row">
                  <div class="skill-head">
                    <span class="skill-name">{SKILL_LABELS[skill]}</span>
                    <span class="skill-score" class:high={score >= 65} class:low={score <= 35}>{score}/100</span>
                  </div>
                  <div class="skill-bar">
                    <div class="skill-fill" class:fill-high={score >= 65} class:fill-low={score <= 35} style="width:{score}%"></div>
                  </div>
                  <p class="skill-desc">{SKILL_DESC[skill]}</p>
                </li>
              {/each}
            </ul>

            {#if learning.signals.length > 0}
              <details class="signals-fold">
                <summary>Détail des moments-clés ({learning.signals.length})</summary>
                <ul class="signals-list">
                  {#each learning.signals as signal}
                    <li class="signal-item">
                      <span class="signal-skill">{SKILL_LABELS[signal.skill]}</span>
                      <span class="signal-delta" class:pos={signal.delta > 0} class:neg={signal.delta < 0}>
                        {signal.delta > 0 ? '+' : ''}{signal.delta}
                      </span>
                      <em class="signal-reason">{signal.reason}</em>
                    </li>
                  {/each}
                </ul>
              </details>
            {/if}
          </section>

          <!-- ╔═══ Warnings d'audit (Argus B-DT2) ═══╗ -->
          {#if audit.warnings.length > 0 || !audit.ok}
            <section class="audit-panel" aria-labelledby="audit-title">
              <h4 id="audit-title">⚠️ Avertissements d'audit</h4>
              <ul class="audit-list">
                {#each audit.warnings as warning}
                  <li class="audit-warning">{warning}</li>
                {/each}
                {#each audit.invariantChecks.filter(c => !c.ok) as failed}
                  <li class="audit-fail">Invariant cassé : <code>{failed.id}</code> — {failed.detail}</li>
                {/each}
              </ul>
            </section>
          {/if}
        {/if}
        <button class="finish-btn" onclick={finish}>
          Retourner au jeu →
        </button>
      </div>
    {/if}

    <!-- Historique (compact) -->
    {#if session.history.length > 0}
      <div class="history">
        {#each session.history.slice(-3) as entry}
          <div class="history-entry">
            <strong>T{entry.turn}</strong>
            <span>{entry.move.label}</span>
            <em>{entry.actorIntent.actor} : {entry.actorIntent.strategy} (p{entry.actorIntent.pressure})</em>
          </div>
        {/each}
      </div>
    {/if}

  </div>
</div>

<style>
  .matignon-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .matignon-modal {
    background: #1a1a1a;
    border: 1px solid #4a3728;
    border-radius: 12px;
    max-width: 680px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 2rem;
    color: #e8dcc8;
    font-family: 'Georgia', serif;
  }

  .matignon-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #4a3728;
    padding-bottom: 1rem;
  }

  .eyebrow {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #b8860b;
    display: block;
    margin-bottom: 0.25rem;
  }

  .matignon-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #e8dcc8;
  }

  .subtitle {
    margin: 0;
    font-size: 0.85rem;
    color: #8b7355;
    font-style: italic;
  }

  .skip-btn {
    background: transparent;
    border: 1px solid #4a3728;
    color: #8b7355;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s;
  }

  .skip-btn:hover {
    border-color: #b8860b;
    color: #e8dcc8;
  }

  .table-scene {
    background: #111;
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
    border: 1px solid #2a2a2a;
  }

  .actors {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .actor {
    font-size: 0.75rem;
    font-weight: bold;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    background: #2a1f0f;
    border: 1px solid #4a3728;
    color: #c4a46a;
  }

  .beat-trigger {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #b8860b;
  }

  .beat-text {
    margin: 0.5rem 0 0;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #d4c4a0;
    font-style: italic;
  }

  .metrics-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
  }

  .metric {
    flex: 1;
    min-width: 80px;
    font-size: 0.7rem;
  }

  .metric-label {
    display: block;
    color: #8b7355;
    margin-bottom: 0.2rem;
    white-space: nowrap;
  }

  .metric-bar {
    height: 4px;
    background: #2a2a2a;
    border-radius: 2px;
    margin-bottom: 0.2rem;
  }

  .metric-fill {
    height: 100%;
    background: #b8860b;
    border-radius: 2px;
    transition: width 0.3s;
  }

  .metric-value {
    color: #c4a46a;
    font-size: 0.65rem;
  }

  .choices-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .move-btn {
    background: #111;
    border: 1px solid #4a3728;
    border-radius: 8px;
    padding: 0.75rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
    color: #e8dcc8;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .move-btn:hover {
    border-color: #b8860b;
    background: #1f1a10;
  }

  .move-btn strong {
    font-size: 0.85rem;
    color: #e8dcc8;
  }

  .move-btn span {
    font-size: 0.75rem;
    color: #a09070;
    font-style: italic;
  }

  .move-btn .risk {
    font-size: 0.7rem;
    color: #8b4040;
  }

  .result-panel {
    text-align: center;
    padding: 1.5rem;
  }

  .result-outcome {
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .result-outcome.accord {
    background: #0f1f0f;
    border: 1px solid #2d5a27;
  }

  .result-outcome.rupture {
    background: #1f0f0f;
    border: 1px solid #5a2727;
  }

  .result-outcome h3 {
    margin: 0 0 0.75rem;
    font-size: 1.2rem;
  }

  .quality-bars {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-top: 0.75rem;
  }

  .quality-row {
    display: grid;
    grid-template-columns: 1fr 3fr auto;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.75rem;
  }

  .quality-row span {
    color: #8b7355;
    text-align: right;
  }

  .quality-bar {
    height: 6px;
    background: #2a2a2a;
    border-radius: 3px;
  }

  .quality-bar div {
    height: 100%;
    background: #2d8a27;
    border-radius: 3px;
  }

  .quality-row em {
    color: #c4a46a;
    min-width: 2em;
    text-align: right;
  }

  .finish-btn {
    background: #b8860b;
    border: none;
    color: #1a1a1a;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }

  .finish-btn:hover {
    background: #d4a020;
  }

  /* ── Profil pédagogique (ORDA-003 / B-DT1) ────────────────── */
  .learning-panel {
    margin-top: 1rem;
    padding: 1rem 1.25rem;
    background: rgba(184, 134, 11, 0.04);
    border: 1px solid rgba(184, 134, 11, 0.25);
    border-radius: 8px;
  }
  .learning-panel h4 {
    margin: 0 0 0.5rem;
    color: #c4a46a;
    font-size: 1rem;
    letter-spacing: 0.04em;
  }
  .learning-recommendation {
    margin: 0 0 0.75rem;
    padding: 0.6rem 0.8rem;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    font-size: 0.85rem;
    color: #d8c896;
    line-height: 1.5;
  }
  .learning-recommendation strong { color: #f4d58b; }
  .learning-recommendation em { color: #b8b0a0; font-style: italic; }

  .skill-list {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: 0.6rem;
  }
  .skill-row { padding: 0.4rem 0; }
  .skill-head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 0.3rem;
    font-size: 0.85rem;
  }
  .skill-name { color: #ede4c9; font-weight: 600; }
  .skill-score {
    font-family: 'Courier New', monospace;
    color: #94a3b8; font-size: 0.78rem;
  }
  .skill-score.high { color: #34d399; }
  .skill-score.low { color: #fca5a5; }
  .skill-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.25rem;
  }
  .skill-fill {
    height: 100%;
    background: #b8860b;
    transition: width 0.5s ease;
    border-radius: 3px;
  }
  .skill-fill.fill-high { background: #34d399; }
  .skill-fill.fill-low { background: #f59e0b; }
  .skill-desc {
    margin: 0; padding: 0.2rem 0;
    font-size: 0.75rem; color: #94a3b8; line-height: 1.45;
    font-style: italic;
  }

  .signals-fold { margin-top: 0.75rem; }
  .signals-fold > summary {
    cursor: pointer;
    font-size: 0.82rem;
    color: #c4a46a;
    padding: 0.4rem 0;
    user-select: none;
  }
  .signals-fold > summary:hover { color: #d4a020; }
  .signals-list {
    list-style: none; padding: 0.5rem 0 0; margin: 0;
    display: flex; flex-direction: column; gap: 0.35rem;
    font-size: 0.8rem;
  }
  .signal-item {
    display: flex; gap: 0.6rem;
    padding: 0.4rem 0.6rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  .signal-skill { color: #c4a46a; font-weight: 600; min-width: 11rem; }
  .signal-delta {
    font-family: 'Courier New', monospace;
    min-width: 2.5rem; text-align: right;
  }
  .signal-delta.pos { color: #34d399; }
  .signal-delta.neg { color: #fca5a5; }
  .signal-reason { color: #94a3b8; font-style: italic; flex: 1; }

  /* ── Audit warnings (B-DT2) ────────────────────────────────── */
  .audit-panel {
    margin-top: 1rem;
    padding: 0.85rem 1.1rem;
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.35);
    border-left: 3px solid #f59e0b;
    border-radius: 4px;
  }
  .audit-panel h4 {
    margin: 0 0 0.5rem;
    color: #f59e0b;
    font-size: 0.9rem;
  }
  .audit-list {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: 0.3rem;
    font-size: 0.82rem; color: #d8c896;
  }
  .audit-warning::before { content: '⚠ '; color: #f59e0b; }
  .audit-fail { color: #fca5a5; }
  .audit-fail::before { content: '✗ '; }
  .audit-fail code {
    font-family: 'Courier New', monospace;
    background: rgba(0,0,0,0.3);
    padding: 0.05rem 0.3rem;
    border-radius: 2px;
  }

  .history {
    border-top: 1px solid #2a2a2a;
    padding-top: 0.75rem;
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .history-entry {
    display: flex;
    gap: 0.75rem;
    font-size: 0.72rem;
    align-items: center;
  }

  .history-entry strong {
    color: #b8860b;
    min-width: 2em;
  }

  .history-entry span {
    color: #e8dcc8;
  }

  .history-entry em {
    color: #8b7355;
    font-style: normal;
    font-size: 0.65rem;
  }

  @media (max-width: 600px) {
    .choices-grid {
      grid-template-columns: 1fr;
    }
    .matignon-modal {
      padding: 1.25rem;
    }
  }
</style>
