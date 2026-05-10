<script lang="ts">
  /**
   * Paritas — Placeholder pour le mini-jeu Block Blast cotisations.
   *
   * Le vrai composant BlockBlast 8×8 Tetris-like sera développé plus
   * tard (cf. audit Sprint 2 Proto_04). En attendant, ce placeholder
   * permet de scénariser un score via slider et de tester le pipeline
   * dialectique → atelier → delta KPI bout-en-bout.
   */
  import {
    configFromShared,
    applyBlockBlastResult,
    estimateAverageScore,
    type BlockBlastResult
  } from '../../game/paritarisme/blockblast_bridge';
  import type { DeltaVec, SharedKPI } from '../../game/paritarisme/dialectic';

  interface Props {
    shared: SharedKPI;
    onsettled?: (delta: Partial<DeltaVec>, result: BlockBlastResult) => void;
  }

  let { shared, onsettled }: Props = $props();

  const session = configFromShared(shared);
  const target = session.targetLines;
  const initialEstimate = estimateAverageScore(session);

  let lines = $state(initialEstimate.linesCleared);
  let tetris = $state(initialEstimate.tetrisCount);
  let overflow = $state(false);
  let phase = $state<'playing' | 'resolved'>('playing');
  let resultDelta = $state<Partial<DeltaVec> | null>(null);

  function handleResolve() {
    const result: BlockBlastResult = { linesCleared: lines, tetrisCount: tetris, overflow };
    resultDelta = applyBlockBlastResult(result);
    phase = 'resolved';
  }

  function handleConfirm() {
    if (resultDelta) {
      onsettled?.(resultDelta, { linesCleared: lines, tetrisCount: tetris, overflow });
    }
  }

  function fmtDelta(v: number | undefined): string {
    if (v == null || v === 0) return '·';
    const r = Math.round(v * 10) / 10;
    return r > 0 ? `+${r}` : `${r}`;
  }
</script>

<div class="bb-root">
  <header class="banner">
    <h2>🧱 Block Blast · Cotisations Sécu</h2>
    <p class="sub">
      Session : {session.durationSec}s · difficulté
      <b>{['Facile', 'Normal', 'Difficile'][session.difficulty]}</b>
      · objectif <b>{target}</b> lignes
    </p>
  </header>

  {#if phase === 'playing'}
    <div class="placeholder-notice">
      <p>
        ⚙️ <em>Composant BlockBlast réel non encore implémenté.</em>
      </p>
      <p>
        Pour valider le pipeline, scénarisez votre score ci-dessous
        (en attendant la vraie grille 8×8 Tetris-like).
      </p>
    </div>

    <div class="sliders">
      <label>
        Lignes complétées : <b>{lines}</b>
        <input type="range" min="0" max="40" bind:value={lines} />
      </label>
      <label>
        Tetris (4-line clears) : <b>{tetris}</b>
        <input type="range" min="0" max={Math.max(1, Math.floor(lines / 4))} bind:value={tetris} />
      </label>
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={overflow} />
        Game over par débordement (échec catastrophique)
      </label>
    </div>

    <div class="seuils">
      <div class:active={overflow}>💥 Overflow → crise Sécu</div>
      <div class:active={!overflow && lines < 5}>📉 &lt; 5 → déficit</div>
      <div class:active={!overflow && lines >= 5 && lines < 15}>⚖ 5-14 → équilibre</div>
      <div class:active={!overflow && lines >= 15}>✅ 15+ → Sécu solide</div>
    </div>

    <button type="button" class="cta" onclick={handleResolve}>
      Soumettre le score →
    </button>

  {:else if resultDelta}
    <div class="result">
      <h3>Résultat de la session</h3>
      <p class="recap">
        <b>{lines}</b> lignes · <b>{tetris}</b> tetris ·
        {overflow ? '💥 overflow' : '✓ session terminée'}
      </p>
      <div class="delta-summary">
        <h4>Delta KPI :</h4>
        <ul>
          {#if resultDelta.povAchat}<li>Pouvoir d'achat : <b>{fmtDelta(resultDelta.povAchat)}</b></li>{/if}
          {#if resultDelta.droits}<li>Droits : <b>{fmtDelta(resultDelta.droits)}</b></li>{/if}
          {#if resultDelta.legitimite}<li>Légitimité : <b>{fmtDelta(resultDelta.legitimite)}</b></li>{/if}
          {#if resultDelta.cohesion}<li>Cohésion : <b>{fmtDelta(resultDelta.cohesion)}</b></li>{/if}
          {#if resultDelta.climat}<li>Climat : <b>{fmtDelta(resultDelta.climat)}</b></li>{/if}
          {#if resultDelta.marge}<li>Marge : <b>{fmtDelta(resultDelta.marge)}</b></li>{/if}
          {#if resultDelta.tension}<li>Tension : <b>{fmtDelta(resultDelta.tension)}</b></li>{/if}
        </ul>
      </div>
      <button type="button" class="cta" onclick={handleConfirm}>
        Appliquer & continuer →
      </button>
    </div>
  {/if}
</div>

<style>
  .bb-root {
    background: #0d0908;
    color: #ede4c9;
    font-family: 'Source Serif 4', Georgia, serif;
    padding: 1.2rem;
    max-width: 720px;
    margin: 0 auto;
  }
  .banner { text-align: center; margin-bottom: 1rem; }
  .banner h2 {
    font-family: 'Cinzel', Georgia, serif;
    color: #f4d58b;
    margin: 0 0 0.3rem;
    font-size: 1.4rem;
  }
  .sub {
    color: rgba(237, 228, 201, 0.7);
    font-style: italic;
    margin: 0;
    font-size: 0.9rem;
  }
  .sub b { color: #c9b26a; font-style: normal; }
  .placeholder-notice {
    background: rgba(244, 213, 139, 0.06);
    border: 1px dashed rgba(244, 213, 139, 0.3);
    border-radius: 0.4rem;
    padding: 0.8rem;
    margin-bottom: 1rem;
    font-size: 0.85rem;
  }
  .placeholder-notice p { margin: 0.2rem 0; }
  .sliders {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    margin-bottom: 1rem;
  }
  .sliders label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.9rem;
  }
  .sliders b {
    color: #f4d58b;
    font-family: 'Source Code Pro', monospace;
  }
  .sliders input[type="range"] {
    width: 100%;
    accent-color: #c89b3c;
  }
  .checkbox-label {
    flex-direction: row !important;
    align-items: center;
    gap: 0.5rem !important;
  }
  .seuils {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
    margin-bottom: 1rem;
    font-size: 0.82rem;
  }
  .seuils > div {
    padding: 0.4rem 0.6rem;
    border: 1px solid rgba(237, 228, 201, 0.15);
    border-radius: 0.3rem;
    color: rgba(237, 228, 201, 0.5);
    transition: all 0.15s;
  }
  .seuils > div.active {
    color: #f4d58b;
    border-color: #f4d58b;
    background: rgba(244, 213, 139, 0.1);
  }
  .cta {
    display: block;
    margin: 1rem auto 0;
    background: linear-gradient(135deg, #c89b3c, #d4a020);
    border: none;
    color: #0d0908;
    padding: 0.7rem 1.4rem;
    border-radius: 0.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: transform 0.15s;
  }
  .cta:hover { transform: translateY(-2px); }
  .result h3 {
    font-family: 'Cinzel', Georgia, serif;
    color: #f4d58b;
    margin: 0 0 0.4rem;
    text-align: center;
  }
  .recap {
    text-align: center;
    color: rgba(237, 228, 201, 0.7);
    font-family: 'Source Code Pro', monospace;
    margin: 0 0 1rem;
  }
  .recap b { color: #f4d58b; }
  .delta-summary { margin-bottom: 1rem; }
  .delta-summary h4 {
    margin: 0 0 0.4rem;
    color: #c9b26a;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.85rem;
    text-transform: uppercase;
  }
  .delta-summary ul {
    list-style: none;
    padding: 0;
    margin: 0;
    columns: 2;
    font-family: 'Source Code Pro', monospace;
    font-size: 0.85rem;
  }
  .delta-summary b { color: #f4d58b; }
</style>
