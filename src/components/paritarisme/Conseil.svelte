<script lang="ts">
  /**
   * Paritas — Sous-jeu Conseil prud'homal (UI).
   *
   * Le joueur choisit 1-3 charges à plaider et 1 stratégie. L'IA
   * adverse choisit la sienne selon sa doctrine. Audience résolue
   * de manière déterministe à partir des KPI courants.
   */
  import {
    CHARGES,
    CHARGE_LABEL,
    STRAT_SALARIE_LABEL,
    STRAT_PATRON_LABEL,
    resolveConseil,
    defaultStrategieSalarie,
    defaultStrategiePatron,
    type Charge,
    type StrategieSalarie,
    type StrategiePatron,
    type ConseilOutcome,
    type Verdict
  } from '../../game/paritarisme/conseil';
  import type {
    DeltaVec,
    PatronKPI,
    SalarieKPI,
    AcquisId,
    Doctrine
  } from '../../game/paritarisme/dialectic';

  interface Props {
    patron: PatronKPI;
    salarie: SalarieKPI;
    acquis: Set<AcquisId>;
    cpuDoctrine: Doctrine;
    playerSide: 'patron' | 'salarie';
    onsettled?: (delta: Partial<DeltaVec>, outcome: ConseilOutcome) => void;
  }

  let { patron, salarie, acquis, cpuDoctrine, playerSide, onsettled }: Props = $props();

  /* Charges sélectionnées (1 à 3). */
  let selectedCharges = $state<Set<Charge>>(new Set(['licenciement']));

  /* Stratégie joueur. */
  let stratSalarie = $state<StrategieSalarie>('juridique');
  let stratPatron = $state<StrategiePatron>('procedural');

  let phase = $state<'choosing' | 'resolved'>('choosing');
  let outcome = $state<ConseilOutcome | null>(null);

  function toggleCharge(c: Charge) {
    if (selectedCharges.has(c)) {
      if (selectedCharges.size > 1) {
        selectedCharges.delete(c);
        selectedCharges = new Set(selectedCharges);
      }
    } else {
      selectedCharges.add(c);
      selectedCharges = new Set(selectedCharges);
    }
  }

  function handleResolve() {
    const charges = Array.from(selectedCharges);
    const finalStratSal: StrategieSalarie = playerSide === 'salarie'
      ? stratSalarie
      : defaultStrategieSalarie(cpuDoctrine);
    const finalStratPat: StrategiePatron = playerSide === 'patron'
      ? stratPatron
      : defaultStrategiePatron(cpuDoctrine);
    outcome = resolveConseil({
      patron, salarie, acquis, charges,
      strategieSalarie: finalStratSal,
      strategiePatron: finalStratPat
    });
    phase = 'resolved';
  }

  function handleConfirm() {
    if (outcome) onsettled?.(outcome.delta, outcome);
  }

  function fmtDelta(v: number | undefined): string {
    if (v == null || v === 0) return '·';
    const r = Math.round(v * 10) / 10;
    return r > 0 ? `+${r}` : `${r}`;
  }

  function verdictLabel(v: Verdict): string {
    if (v === 'favorableSalarie') return '✅ Favorable salarié';
    if (v === 'favorablePatron') return '⚖ Favorable patron';
    return '↻ Renvoi';
  }
</script>

<div class="conseil-root">
  <header class="banner">
    <h2>⚖ Conseil prud'homal · Audience</h2>
    <p class="sub">
      Vous incarnez le <b>{playerSide === 'patron' ? 'patron' : 'salarié'}</b>.
      Adversaire CPU : <b>{cpuDoctrine}</b>.
    </p>
  </header>

  {#if phase === 'choosing'}
    <section class="charges-block">
      <h3>1. Choisissez les charges à plaider</h3>
      <div class="charges">
        {#each CHARGES as c}
          <button
            type="button"
            class="charge-btn"
            class:active={selectedCharges.has(c)}
            onclick={() => toggleCharge(c)}
          >
            <span class="check">{selectedCharges.has(c) ? '✓' : '·'}</span>
            <span>{CHARGE_LABEL[c]}</span>
          </button>
        {/each}
      </div>
      <p class="hint-small">
        Au moins 1 charge obligatoire. Plus de charges = magnitude des effets ↑.
      </p>
    </section>

    <section class="strat-block">
      <h3>2. Votre stratégie de plaidoyer</h3>
      <div class="strats">
        {#if playerSide === 'salarie'}
          {#each ['temoignage', 'juridique', 'mediatique'] as sopt}
            <button
              type="button"
              class="strat-btn"
              class:active={stratSalarie === sopt}
              onclick={() => (stratSalarie = sopt as StrategieSalarie)}
            >
              {STRAT_SALARIE_LABEL[sopt as StrategieSalarie]}
            </button>
          {/each}
        {:else}
          {#each ['procedural', 'contreFaute', 'mediation'] as popt}
            <button
              type="button"
              class="strat-btn"
              class:active={stratPatron === popt}
              onclick={() => (stratPatron = popt as StrategiePatron)}
            >
              {STRAT_PATRON_LABEL[popt as StrategiePatron]}
            </button>
          {/each}
        {/if}
      </div>
    </section>

    <button type="button" class="cta" onclick={handleResolve}>
      Plaider →
    </button>

  {:else if outcome}
    <div class="result">
      <h3 class="verdict-title verdict-{outcome.verdict}">
        Verdict : {verdictLabel(outcome.verdict)}
      </h3>
      <p class="score">
        Score net : <b>{outcome.scoreNet > 0 ? '+' : ''}{Math.round(outcome.scoreNet * 10) / 10}</b>
      </p>
      <table class="charges-table">
        <thead>
          <tr><th>Charge</th><th>Verdict</th></tr>
        </thead>
        <tbody>
          {#each CHARGES as c}
            {#if selectedCharges.has(c)}
              <tr class={outcome.parCharge[c]}>
                <td>{CHARGE_LABEL[c]}</td>
                <td>{verdictLabel(outcome.parCharge[c])}</td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
      <div class="delta-summary">
        <h4>Delta KPI :</h4>
        <ul>
          {#if outcome.delta.legitimite}<li>Légitimité : <b>{fmtDelta(outcome.delta.legitimite)}</b></li>{/if}
          {#if outcome.delta.droits}<li>Droits : <b>{fmtDelta(outcome.delta.droits)}</b></li>{/if}
          {#if outcome.delta.povAchat}<li>Pouvoir d'achat : <b>{fmtDelta(outcome.delta.povAchat)}</b></li>{/if}
          {#if outcome.delta.marge}<li>Marge : <b>{fmtDelta(outcome.delta.marge)}</b></li>{/if}
          {#if outcome.delta.capPol}<li>Capital politique : <b>{fmtDelta(outcome.delta.capPol)}</b></li>{/if}
          {#if outcome.delta.reputation}<li>Réputation : <b>{fmtDelta(outcome.delta.reputation)}</b></li>{/if}
          {#if outcome.delta.cohesion}<li>Cohésion : <b>{fmtDelta(outcome.delta.cohesion)}</b></li>{/if}
          {#if outcome.delta.tension}<li>Tension : <b>{fmtDelta(outcome.delta.tension)}</b></li>{/if}
        </ul>
      </div>
      <button type="button" class="cta" onclick={handleConfirm}>
        Appliquer & continuer →
      </button>
    </div>
  {/if}
</div>

<style>
  .conseil-root {
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
  .charges-block, .strat-block { margin-bottom: 1.2rem; }
  .charges-block h3, .strat-block h3 {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.9rem;
    color: #c9b26a;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0 0 0.5rem;
  }
  .charges, .strats {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .charge-btn, .strat-btn {
    background: rgba(13, 9, 8, 0.85);
    border: 1px solid rgba(237, 228, 201, 0.18);
    color: rgba(237, 228, 201, 0.8);
    padding: 0.5rem 0.7rem;
    border-radius: 0.4rem;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.9rem;
    text-align: left;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .charge-btn:hover, .strat-btn:hover {
    border-color: #c9b26a;
    color: #f4d58b;
  }
  .charge-btn.active, .strat-btn.active {
    background: rgba(244, 213, 139, 0.12);
    border-color: #f4d58b;
    color: #f4d58b;
  }
  .check {
    width: 18px;
    color: #c9b26a;
    font-weight: bold;
  }
  .hint-small {
    font-size: 0.8rem;
    color: rgba(237, 228, 201, 0.5);
    font-style: italic;
    margin: 0.4rem 0 0;
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
  /* Result */
  .verdict-title {
    text-align: center;
    margin: 0 0 0.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.2rem;
  }
  .verdict-title.verdict-favorableSalarie { color: #4ade80; }
  .verdict-title.verdict-favorablePatron { color: #ffb09e; }
  .verdict-title.verdict-renvoi { color: #c9b26a; }
  .score {
    text-align: center;
    color: rgba(237, 228, 201, 0.7);
    font-family: 'Source Code Pro', monospace;
  }
  .score b { color: #f4d58b; }
  .charges-table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.8rem 0;
  }
  .charges-table th, .charges-table td {
    padding: 0.4rem 0.6rem;
    text-align: left;
    border-bottom: 1px solid rgba(237, 228, 201, 0.1);
    font-size: 0.88rem;
  }
  .charges-table tr.favorableSalarie td { color: #4ade80; }
  .charges-table tr.favorablePatron td { color: #ffb09e; }
  .charges-table tr.renvoi td { color: #c9b26a; font-style: italic; }
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
