<script lang="ts">
  /**
   * Démo "Tour complet" PARITAS — bout-en-bout du moteur paritaire.
   *
   * 5 phases enchainées :
   *   ① Veille      : presse + événement + briefing rapide
   *   ② Manœuvre    : les 2 pupitres déposent en parallèle (séquentiel
   *                   en démo : on simule le patron d'abord, puis le
   *                   salarié)
   *   ③ Table       : on appelle resolveTable() avec les 2 inputs
   *   ④ Arbitrage   : TableArbiter monte le sous-jeu (Émeute /
   *                   Marchandage / Conseil / BlockBlast / aucun)
   *   ⑤ Résultat    : KPI mis à jour, journal du tour, possibilité
   *                   de relancer un tour avec l'état hérité
   *
   * En démo, le joueur incarne le SALARIÉ par défaut. Le patron est
   * pré-rempli (humain optionnel pour tester les 2 côtés).
   */
  import PupitreDirection from './PupitreDirection.svelte';
  import PupitreIntersyndicale from './PupitreIntersyndicale.svelte';
  import TableArbiter from './TableArbiter.svelte';
  import {
    resolveTable,
    silhouette,
    patronObserverSkill,
    salarieObserverSkill,
    type PatronKPI,
    type SalarieKPI,
    type SharedKPI,
    type PatronPosture,
    type SalariePosture,
    type PatronManoeuvre,
    type SalarieManoeuvre,
    type Doctrine,
    type ResolveContext,
    type ResolveOutcome,
    type AcquisId,
    type DeltaVec,
    type SilhouetteLabel
  } from '../../game/paritarisme/dialectic';

  type Phase = 'veille' | 'patron-depose' | 'salarie-depose' | 'arbitrage' | 'resultat';

  /* === État global du tour (mutable) === */
  let phase = $state<Phase>('veille');
  let turn = $state(1);

  let patronKPI = $state<PatronKPI>({ marge: 60, climat: 45, capPol: 55, reputation: 50 });
  let salarieKPI = $state<SalarieKPI>({ povAchat: 45, droits: 40, cohesion: 60, legitimite: 55 });
  let sharedKPI = $state<SharedKPI>({ tension: 40 });
  let acquis = $state<Set<AcquisId>>(new Set());

  /* Inputs déposés (remplis au fil du tour). */
  let patronInput = $state<{ doctrine: Doctrine; manoeuvre: PatronManoeuvre; posture: PatronPosture } | null>(null);
  let salarieInput = $state<{ doctrine: Doctrine; manoeuvre: SalarieManoeuvre; posture: SalariePosture } | null>(null);
  let outcome = $state<ResolveOutcome | null>(null);
  let lastDelta = $state<Partial<DeltaVec> | null>(null);
  let log = $state<string[]>([]);

  /* === Phase Veille — événement aléatoire et briefing === */
  const events = [
    { id: 'occupation_renault', label: 'Occupation chez Renault — 600 usines arrêtées', period: '1936' as const },
    { id: 'choc_petrolier', label: 'Choc pétrolier — inflation +13%', period: 'contemporain' as const },
    { id: 'mai_68', label: 'Mai 68 — grève générale', period: '1968' as const },
    { id: 'plan_juppe', label: 'Plan Juppé — manifestations massives', period: 'contemporain' as const },
    { id: null, label: 'Période calme — agenda paritaire ordinaire', period: 'contemporain' as const }
  ];
  let currentEvent = $state(events[Math.floor(Math.random() * events.length)]);

  /* === Silhouettes (info imparfaite) === */
  function silhouetteForSalarie(): { label: string; marge: string } {
    const skill = salarieInput
      ? salarieObserverSkill(salarieInput.manoeuvre)
      : 0.4;
    const margeLabel = silhouette(patronKPI.marge, skill);
    return {
      label: `silhouette ${labelSilhouette(margeLabel)}`,
      marge: labelSilhouette(margeLabel)
    };
  }
  function silhouetteForPatron(): { label: string; legitimite: string } {
    const skill = patronInput
      ? patronObserverSkill(patronInput.manoeuvre)
      : 0.4;
    const legitLabel = silhouette(salarieKPI.legitimite, skill);
    return {
      label: `silhouette ${labelSilhouette(legitLabel)}`,
      legitimite: labelSilhouette(legitLabel)
    };
  }
  function labelSilhouette(s: SilhouetteLabel): string {
    return ({
      tres_bas: 'très bas',
      bas: 'bas',
      moyen: 'moyen',
      eleve: 'élevé',
      tres_eleve: 'très élevé'
    } as Record<SilhouetteLabel, string>)[s];
  }

  /* === Handlers === */
  function passToManoeuvre() {
    phase = 'patron-depose';
    log = [...log, `[T${turn}] ${currentEvent.label}`];
  }

  function onPatronSubmit(input: typeof patronInput) {
    patronInput = input;
    phase = 'salarie-depose';
    log = [...log, `[T${turn}] Patron dépose : ${input!.posture} (${input!.doctrine})`];
  }

  function onSalarieSubmit(input: typeof salarieInput) {
    salarieInput = input;
    log = [...log, `[T${turn}] Salarié dépose : ${input!.posture} (${input!.doctrine})`];
    /* Compose le contexte et résout. */
    if (!patronInput) return;
    const ctx: ResolveContext = {
      turn,
      period: currentEvent.period,
      event: currentEvent.id as ResolveContext['event'],
      patronDoctrine: patronInput.doctrine,
      salarieDoctrine: input!.doctrine,
      patronManoeuvre: patronInput.manoeuvre,
      salarieManoeuvre: input!.manoeuvre,
      patron: patronKPI,
      salarie: salarieKPI,
      shared: sharedKPI,
      acquis,
      delayed: []
    };
    outcome = resolveTable(patronInput.posture, input!.posture, ctx);
    log = [
      ...log,
      `[T${turn}] Cellule ${outcome.cell.patron} × ${outcome.cell.salarie} → atelier=${outcome.atelier?.kind ?? 'aucun'}`
    ];
    phase = 'arbitrage';
  }

  function onArbitrageSettled(combinedDelta: Partial<DeltaVec>) {
    lastDelta = combinedDelta;
    /* Applique le delta à l'état global. */
    patronKPI = {
      marge: clamp(patronKPI.marge + (combinedDelta.marge ?? 0)),
      climat: clamp(patronKPI.climat + (combinedDelta.climat ?? 0)),
      capPol: clamp(patronKPI.capPol + (combinedDelta.capPol ?? 0)),
      reputation: clamp(patronKPI.reputation + (combinedDelta.reputation ?? 0))
    };
    salarieKPI = {
      povAchat: clamp(salarieKPI.povAchat + (combinedDelta.povAchat ?? 0)),
      droits: clamp(salarieKPI.droits + (combinedDelta.droits ?? 0)),
      cohesion: clamp(salarieKPI.cohesion + (combinedDelta.cohesion ?? 0)),
      legitimite: clamp(salarieKPI.legitimite + (combinedDelta.legitimite ?? 0))
    };
    sharedKPI = { tension: clamp(sharedKPI.tension + (combinedDelta.tension ?? 0)) };
    if (outcome?.unlocked) {
      acquis.add(outcome.unlocked);
      acquis = new Set(acquis);
      log = [...log, `[T${turn}] 🏛️ ACQUIS DÉBLOQUÉ : ${outcome.unlocked}`];
    }
    log = [
      ...log,
      `[T${turn}] Delta appliqué : ${
        Object.entries(combinedDelta)
          .filter(([, v]) => v != null && v !== 0)
          .map(([k, v]) => `${k}${v! >= 0 ? '+' : ''}${Math.round((v as number) * 10) / 10}`)
          .join(', ')
      }`
    ];
    phase = 'resultat';
  }

  function nextTurn() {
    turn++;
    patronInput = null;
    salarieInput = null;
    outcome = null;
    lastDelta = null;
    currentEvent = events[Math.floor(Math.random() * events.length)];
    phase = 'veille';
  }

  function clamp(v: number): number {
    return Math.max(0, Math.min(100, v));
  }

  function fmtDelta(v: number | undefined): string {
    if (v == null || v === 0) return '·';
    const r = Math.round(v * 10) / 10;
    return r > 0 ? `+${r}` : `${r}`;
  }
</script>

<div class="root">
  <header class="app-header">
    <div>
      <h1>PARITAS · Tour {turn}</h1>
      <p class="phase-indicator">
        Phase : <b>{phaseLabel(phase)}</b>
        {#if currentEvent.id}· Événement : <em>{currentEvent.label}</em>{/if}
      </p>
    </div>
    <div class="tension-meter">
      <span class="lbl">Tension</span>
      <span class="meter">
        <span class="meter-fill" style="width: {sharedKPI.tension}%"></span>
      </span>
      <span class="val">{Math.round(sharedKPI.tension)}</span>
    </div>
  </header>

  {#if phase === 'veille'}
    <div class="veille-screen">
      <h2>Veille — Briefing du tour {turn}</h2>
      <div class="briefing">
        <p class="event">{currentEvent.label}</p>
        <p class="period">Période : <b>{currentEvent.period}</b></p>
      </div>
      {#if acquis.size > 0}
        <div class="acquis-list">
          <h3>Acquis irréversibles</h3>
          <ul>
            {#each Array.from(acquis) as a}
              <li>🏛️ {a}</li>
            {/each}
          </ul>
        </div>
      {/if}
      <button type="button" class="cta" onclick={passToManoeuvre}>
        Commencer le tour →
      </button>
    </div>

  {:else if phase === 'patron-depose'}
    <div class="depot-screen">
      <p class="step-label">⏵ Étape 1/2 — Le patron dépose en premier</p>
      <PupitreDirection
        kpi={patronKPI}
        silhouetteAdversaire={silhouetteForPatron()}
        onsubmit={onPatronSubmit}
      />
    </div>

  {:else if phase === 'salarie-depose'}
    <div class="depot-screen">
      <p class="step-label">⏵ Étape 2/2 — Au salarié de jouer</p>
      <PupitreIntersyndicale
        kpi={salarieKPI}
        silhouetteAdversaire={silhouetteForSalarie()}
        onsubmit={onSalarieSubmit}
      />
    </div>

  {:else if phase === 'arbitrage' && outcome && patronInput && salarieInput}
    <TableArbiter
      outcome={outcome}
      patron={patronKPI}
      salarie={salarieKPI}
      shared={sharedKPI}
      doctrines={{ patron: patronInput.doctrine, salarie: salarieInput.doctrine }}
      acquis={acquis}
      playerSide="salarie"
      onsettled={onArbitrageSettled}
    />

  {:else if phase === 'resultat' && lastDelta}
    <div class="result-screen">
      <h2>Résultat du tour {turn}</h2>
      <div class="kpi-summary">
        <article>
          <h3>Direction</h3>
          <ul>
            <li>Marge : <b>{Math.round(patronKPI.marge)}</b> ({fmtDelta(lastDelta.marge)})</li>
            <li>Climat : <b>{Math.round(patronKPI.climat)}</b> ({fmtDelta(lastDelta.climat)})</li>
            <li>Cap. politique : <b>{Math.round(patronKPI.capPol)}</b> ({fmtDelta(lastDelta.capPol)})</li>
            <li>Réputation : <b>{Math.round(patronKPI.reputation)}</b> ({fmtDelta(lastDelta.reputation)})</li>
          </ul>
        </article>
        <article>
          <h3>Intersyndicale</h3>
          <ul>
            <li>Pouvoir d'achat : <b>{Math.round(salarieKPI.povAchat)}</b> ({fmtDelta(lastDelta.povAchat)})</li>
            <li>Droits : <b>{Math.round(salarieKPI.droits)}</b> ({fmtDelta(lastDelta.droits)})</li>
            <li>Cohésion : <b>{Math.round(salarieKPI.cohesion)}</b> ({fmtDelta(lastDelta.cohesion)})</li>
            <li>Légitimité : <b>{Math.round(salarieKPI.legitimite)}</b> ({fmtDelta(lastDelta.legitimite)})</li>
          </ul>
        </article>
      </div>
      <div class="log-view">
        <h3>Journal des tours</h3>
        <pre>{log.join('\n')}</pre>
      </div>
      <button type="button" class="cta" onclick={nextTurn}>
        Tour {turn + 1} →
      </button>
    </div>
  {/if}
</div>

<script lang="ts" module>
  type PhaseLocal = 'veille' | 'patron-depose' | 'salarie-depose' | 'arbitrage' | 'resultat';
  function phaseLabel(p: PhaseLocal): string {
    return {
      'veille': 'Veille',
      'patron-depose': 'Manœuvre patron',
      'salarie-depose': 'Manœuvre salarié',
      'arbitrage': 'Table & arbitrage',
      'resultat': 'Résultat'
    }[p];
  }
</script>

<style>
  .root {
    background: #080606;
    color: #ede4c9;
    font-family: 'Source Serif 4', Georgia, serif;
    min-height: 100vh;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  .app-header {
    background: rgba(13, 9, 8, 0.95);
    border-bottom: 1px solid rgba(244, 213, 139, 0.3);
    padding: 0.75rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .app-header h1 {
    font-family: 'Cinzel', Georgia, serif;
    color: #f4d58b;
    margin: 0;
    font-size: 1.2rem;
    letter-spacing: 0.05em;
  }
  .phase-indicator {
    margin: 0.1rem 0 0;
    color: rgba(237, 228, 201, 0.7);
    font-size: 0.85rem;
  }
  .phase-indicator b { color: #c9b26a; }
  .phase-indicator em { color: #ffb09e; font-style: italic; }
  .tension-meter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .tension-meter .lbl {
    font-size: 0.78rem;
    color: rgba(237, 228, 201, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .tension-meter .meter {
    width: 120px;
    height: 8px;
    background: rgba(237, 228, 201, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }
  .meter-fill {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #4ade80, #fbbf24, #d96a5b);
    transition: width 0.5s;
  }
  .tension-meter .val {
    font-family: 'Source Code Pro', monospace;
    font-weight: 700;
    color: #f4d58b;
    min-width: 28px;
    text-align: right;
  }

  /* Phase veille */
  .veille-screen {
    text-align: center;
    padding: 3rem 1rem;
    max-width: 600px;
    margin: 0 auto;
  }
  .veille-screen h2 {
    font-family: 'Cinzel', Georgia, serif;
    color: #f4d58b;
    margin: 0 0 1rem;
  }
  .briefing {
    background: rgba(13, 9, 8, 0.85);
    border: 1px solid rgba(244, 213, 139, 0.3);
    border-radius: 0.5rem;
    padding: 1.2rem;
    margin: 0 0 1rem;
  }
  .briefing .event {
    font-style: italic;
    color: #ede4c9;
    margin: 0 0 0.4rem;
    font-size: 1.05rem;
  }
  .briefing .period {
    color: rgba(237, 228, 201, 0.6);
    margin: 0;
    font-size: 0.85rem;
  }
  .acquis-list {
    background: rgba(244, 213, 139, 0.05);
    border-left: 3px solid #f4d58b;
    padding: 0.6rem 1rem;
    margin-bottom: 1rem;
    text-align: left;
  }
  .acquis-list h3 {
    margin: 0 0 0.3rem;
    color: #c9b26a;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.85rem;
  }
  .acquis-list ul {
    margin: 0;
    padding-left: 1.2rem;
    font-family: 'Source Code Pro', monospace;
    font-size: 0.82rem;
  }

  /* Phase dépôt */
  .depot-screen {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }
  .step-label {
    text-align: center;
    color: #c9b26a;
    font-family: 'Cinzel', Georgia, serif;
    margin: 0 0 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.85rem;
  }

  /* Phase résultat */
  .result-screen {
    padding: 2rem 1rem;
    max-width: 900px;
    margin: 0 auto;
    flex: 1;
  }
  .result-screen h2 {
    font-family: 'Cinzel', Georgia, serif;
    color: #f4d58b;
    text-align: center;
    margin: 0 0 1rem;
  }
  .kpi-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  @media (max-width: 700px) { .kpi-summary { grid-template-columns: 1fr; } }
  .kpi-summary article {
    background: rgba(13, 9, 8, 0.85);
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.5rem;
    padding: 1rem;
  }
  .kpi-summary h3 {
    margin: 0 0 0.6rem;
    font-family: 'Cinzel', Georgia, serif;
    color: #c9b26a;
    font-size: 0.85rem;
    text-transform: uppercase;
  }
  .kpi-summary ul {
    list-style: none;
    margin: 0;
    padding: 0;
    font-family: 'Source Code Pro', monospace;
    font-size: 0.85rem;
  }
  .kpi-summary li {
    padding: 0.2rem 0;
    border-bottom: 1px dashed rgba(237, 228, 201, 0.1);
    color: rgba(237, 228, 201, 0.85);
  }
  .kpi-summary b { color: #f4d58b; }
  .log-view {
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(237, 228, 201, 0.1);
    border-radius: 0.4rem;
    padding: 0.8rem;
    margin-bottom: 1.2rem;
  }
  .log-view h3 {
    margin: 0 0 0.4rem;
    color: #c9b26a;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.85rem;
  }
  .log-view pre {
    margin: 0;
    font-family: 'Source Code Pro', monospace;
    font-size: 0.78rem;
    color: rgba(237, 228, 201, 0.85);
    white-space: pre-wrap;
  }

  /* CTA */
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
    font-size: 0.95rem;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: transform 0.15s;
  }
  .cta:hover { transform: translateY(-2px); }
</style>
