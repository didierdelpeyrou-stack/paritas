<script lang="ts">
  /**
   * Paritas — Sous-jeu Marchandage 4 leviers (UI).
   *
   * Le joueur dépose ses 4 cartes (2 veut, 2 cède). Le CPU adverse
   * a déjà déposé selon sa doctrine. On résout puis on rend le
   * delta au TableArbiter parent.
   */
  import {
    LEVIERS,
    LEVIER_LABEL,
    resolveMarchandage,
    defaultDepotForDoctrine,
    type Levier,
    type Depot,
    type MarchandageOutcome
  } from '../../game/paritarisme/marchandage';
  import type { DeltaVec, Doctrine } from '../../game/paritarisme/dialectic';

  interface Props {
    /** Doctrine du camp adverse (CPU). */
    cpuDoctrine: Doctrine;
    /** Côté incarné par le joueur. */
    playerSide: 'patron' | 'salarie';
    /** Callback à la fin avec delta + outcome détaillé. */
    onsettled?: (delta: Partial<DeltaVec>, outcome: MarchandageOutcome) => void;
  }

  let { cpuDoctrine, playerSide, onsettled }: Props = $props();

  /* Sélection joueur — chaque levier peut être : 'veut' | 'cede' | null. */
  type Choice = 'veut' | 'cede' | null;
  let choices = $state<Record<Levier, Choice>>({
    salaire: null, tempsTravail: null, garanties: null, flexibilite: null
  });

  let phase = $state<'choosing' | 'resolved'>('choosing');
  let outcome = $state<MarchandageOutcome | null>(null);

  /* Compte les choix actuels du joueur pour validation. */
  const veutCount = $derived(LEVIERS.filter(l => choices[l] === 'veut').length);
  const cedeCount = $derived(LEVIERS.filter(l => choices[l] === 'cede').length);
  const isValid = $derived(veutCount === 2 && cedeCount === 2);

  function setChoice(lev: Levier, c: Choice) {
    /* Si on coche 'veut' alors qu'on a déjà 2 veut → on ignore (sécu UI). */
    if (c === 'veut' && veutCount >= 2 && choices[lev] !== 'veut') return;
    if (c === 'cede' && cedeCount >= 2 && choices[lev] !== 'cede') return;
    choices[lev] = c;
  }

  function buildPlayerDepot(): Depot {
    return {
      veut: LEVIERS.filter(l => choices[l] === 'veut'),
      cede: LEVIERS.filter(l => choices[l] === 'cede')
    };
  }

  function handleResolve() {
    if (!isValid) return;
    const cpuDepot = defaultDepotForDoctrine(cpuDoctrine);
    const playerDepot = buildPlayerDepot();
    const out = playerSide === 'patron'
      ? resolveMarchandage({ patron: playerDepot, salarie: cpuDepot })
      : resolveMarchandage({ patron: cpuDepot, salarie: playerDepot });
    outcome = out;
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

  function issueLabel(issue: string): string {
    switch (issue) {
      case 'consensus': return '🤝 Consensus';
      case 'gainPatron': return playerSide === 'patron' ? '✅ Vous gagnez' : '⬇ Patron gagne';
      case 'gainSalarie': return playerSide === 'salarie' ? '✅ Vous gagnez' : '⬇ Salarié gagne';
      case 'conflit': return '⚔ Conflit';
      case 'horsTable': return '— Hors-table';
      default: return issue;
    }
  }
</script>

<div class="march-root">
  <header class="banner">
    <h2>🤝 Marchandage · 4 leviers</h2>
    <p class="sub">
      Vous incarnez le <b>{playerSide === 'patron' ? 'patron' : 'salarié'}</b>.
      L'adversaire est <b>{cpuDoctrine}</b> (a déjà déposé).
    </p>
  </header>

  {#if phase === 'choosing'}
    <p class="hint">
      Cochez <b>2 leviers à conquérir</b> et <b>2 à céder</b>.
      Plus vos cartes croisent celles de l'adversaire, plus l'accord est riche.
    </p>

    <div class="grid">
      {#each LEVIERS as lev}
        <article class="card" class:has-choice={choices[lev] != null}>
          <h3>{LEVIER_LABEL[lev]}</h3>
          <div class="actions">
            <button
              type="button"
              class="action-btn veut"
              class:active={choices[lev] === 'veut'}
              onclick={() => setChoice(lev, choices[lev] === 'veut' ? null : 'veut')}
            >
              ✊ Vouloir
            </button>
            <button
              type="button"
              class="action-btn cede"
              class:active={choices[lev] === 'cede'}
              onclick={() => setChoice(lev, choices[lev] === 'cede' ? null : 'cede')}
            >
              🤲 Céder
            </button>
          </div>
        </article>
      {/each}
    </div>

    <footer class="footer">
      <span class="counter">
        Veut : <b>{veutCount}/2</b> · Cède : <b>{cedeCount}/2</b>
      </span>
      <button
        type="button"
        class="cta"
        disabled={!isValid}
        onclick={handleResolve}
      >
        Déposer →
      </button>
    </footer>

  {:else if outcome}
    <div class="result">
      <h3>
        {#if outcome.succes}
          ✅ Accord trouvé
        {:else}
          ⚠ Pas d'accord ({outcome.accords} accords / {outcome.conflits} conflits)
        {/if}
      </h3>
      <table class="result-table">
        <thead>
          <tr><th>Levier</th><th>Issue</th></tr>
        </thead>
        <tbody>
          {#each LEVIERS as lev}
            <tr class={outcome.parLevier[lev]}>
              <td>{LEVIER_LABEL[lev]}</td>
              <td>{issueLabel(outcome.parLevier[lev])}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <div class="delta-summary">
        <h4>Delta KPI :</h4>
        <ul>
          {#if outcome.delta.marge}<li>Marge : <b>{fmtDelta(outcome.delta.marge)}</b></li>{/if}
          {#if outcome.delta.climat}<li>Climat : <b>{fmtDelta(outcome.delta.climat)}</b></li>{/if}
          {#if outcome.delta.povAchat}<li>Pouvoir d'achat : <b>{fmtDelta(outcome.delta.povAchat)}</b></li>{/if}
          {#if outcome.delta.droits}<li>Droits : <b>{fmtDelta(outcome.delta.droits)}</b></li>{/if}
          {#if outcome.delta.cohesion}<li>Cohésion : <b>{fmtDelta(outcome.delta.cohesion)}</b></li>{/if}
          {#if outcome.delta.legitimite}<li>Légitimité : <b>{fmtDelta(outcome.delta.legitimite)}</b></li>{/if}
          {#if outcome.delta.tension}<li>Tension : <b>{fmtDelta(outcome.delta.tension)}</b></li>{/if}
          {#if outcome.delta.capPol}<li>Capital politique : <b>{fmtDelta(outcome.delta.capPol)}</b></li>{/if}
        </ul>
      </div>
      <button type="button" class="cta" onclick={handleConfirm}>
        Appliquer & continuer →
      </button>
    </div>
  {/if}
</div>

<style>
  .march-root {
    background: #0d0908;
    color: #ede4c9;
    font-family: 'Source Serif 4', Georgia, serif;
    padding: 1.2rem;
    max-width: 720px;
    margin: 0 auto;
  }
  .banner {
    text-align: center;
    margin-bottom: 1rem;
  }
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
  .hint {
    background: rgba(244, 213, 139, 0.08);
    border-left: 3px solid #c9b26a;
    padding: 0.6rem 0.8rem;
    margin-bottom: 1rem;
    font-size: 0.88rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.7rem;
    margin-bottom: 1rem;
  }
  @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
  .card {
    background: rgba(13, 9, 8, 0.85);
    border: 1px solid rgba(237, 228, 201, 0.15);
    border-radius: 0.5rem;
    padding: 0.7rem;
  }
  .card.has-choice { border-color: #c9b26a; }
  .card h3 {
    margin: 0 0 0.5rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.95rem;
    color: #ede4c9;
  }
  .actions { display: flex; gap: 0.4rem; }
  .action-btn {
    flex: 1;
    background: transparent;
    border: 1px solid rgba(237, 228, 201, 0.2);
    color: rgba(237, 228, 201, 0.7);
    padding: 0.4rem 0.5rem;
    border-radius: 0.3rem;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.85rem;
    transition: all 0.15s;
  }
  .action-btn:hover { color: #f4d58b; border-color: #c9b26a; }
  .action-btn.veut.active {
    background: rgba(217, 106, 91, 0.2);
    border-color: #d96a5b;
    color: #ffb09e;
  }
  .action-btn.cede.active {
    background: rgba(126, 180, 255, 0.15);
    border-color: #7eb4ff;
    color: #aac8ff;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.6rem;
  }
  .counter {
    font-family: 'Source Code Pro', monospace;
    color: rgba(237, 228, 201, 0.7);
    font-size: 0.85rem;
  }
  .counter b { color: #f4d58b; }
  .cta {
    background: linear-gradient(135deg, #c89b3c, #d4a020);
    border: none;
    color: #0d0908;
    padding: 0.6rem 1.3rem;
    border-radius: 0.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: transform 0.15s;
  }
  .cta:hover:not(:disabled) { transform: translateY(-2px); }
  .cta:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #555;
  }
  /* Result */
  .result h3 {
    font-family: 'Cinzel', Georgia, serif;
    color: #f4d58b;
    margin: 0 0 0.8rem;
  }
  .result-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }
  .result-table th, .result-table td {
    padding: 0.4rem 0.6rem;
    text-align: left;
    border-bottom: 1px solid rgba(237, 228, 201, 0.1);
    font-size: 0.88rem;
  }
  .result-table tr.consensus td { color: #aac8ff; }
  .result-table tr.gainSalarie td { color: #4ade80; }
  .result-table tr.gainPatron td { color: #ffb09e; }
  .result-table tr.conflit td { color: #d96a5b; font-style: italic; }
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
