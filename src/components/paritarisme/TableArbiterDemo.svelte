<script lang="ts">
  /**
   * Démo TableArbiter — UI standalone permettant de scénariser
   * les 9 cellules de la matrice dialectique et d'observer le
   * déclenchement des sous-jeux d'arbitrage (Émeute, Marchandage,
   * Conseil, Block Blast cotisations).
   *
   * Pédagogique : chaque scénario explique POURQUOI tel atelier
   * se déclenche (cf. design doc §6 Seuils ateliers).
   */
  import TableArbiter from './TableArbiter.svelte';
  import {
    resolveTable,
    defaultContext,
    type ResolveOutcome,
    type PatronPosture,
    type SalariePosture,
    type DeltaVec,
    type Doctrine,
    type AcquisId
  } from '../../game/paritarisme/dialectic';

  /* === Catalogue de scénarios pré-cuits ===
     Chacun construit un contexte + une cellule jouée pour
     déclencher un atelier précis. */
  interface Scenario {
    id: string;
    title: string;
    expected: 'aucun' | 'emeute' | 'marchandage_4_leviers' | 'conseil' | 'blockblast_cotisations';
    description: string;
    play: () => ResolveOutcome;
    side: 'patron' | 'salarie';
  }

  function scenarioEmeute1968(): ResolveOutcome {
    const ctx = defaultContext();
    ctx.shared.tension = 65;
    ctx.period = '1968';
    ctx.event = 'mai_68';
    ctx.patronDoctrine = 'neoliberal';
    ctx.salarieDoctrine = 'syndicalismeLutte';
    ctx.salarieManoeuvre.preavisGreve = 50;
    ctx.salarieManoeuvre.greveReconductible = true;
    ctx.salarieManoeuvre.coalitionInter = 30;
    return resolveTable('tenir', 'rapportForce', ctx);
  }

  function scenarioMarchandageMatignon(): ResolveOutcome {
    const ctx = defaultContext();
    ctx.shared.tension = 45;
    ctx.patronDoctrine = 'paternalisme';
    ctx.salarieDoctrine = 'reformiste';
    return resolveTable('echange', 'compromis', ctx);
  }

  function scenarioConseilLicenciement(): ResolveOutcome {
    const ctx = defaultContext();
    ctx.salarieManoeuvre.saisinePrudhomale = 40;
    ctx.salarie.legitimite = 75;
    ctx.acquis = new Set<AcquisId>(['chsct_1982']);
    return resolveTable('tenir', 'acquisCibles', ctx);
  }

  function scenarioBlockBlastSecu(): ResolveOutcome {
    const ctx = defaultContext();
    ctx.period = '1945';
    ctx.acquis = new Set<AcquisId>(['secu_1945']);
    ctx.shared.tension = 40;
    return resolveTable('cession', 'acquisCibles', ctx);
  }

  function scenarioStable(): ResolveOutcome {
    const ctx = defaultContext();
    ctx.shared.tension = 25;
    return resolveTable('cession', 'compromis', ctx);
  }

  const scenarios: Scenario[] = [
    {
      id: 'emeute-1968',
      title: '⚔ Mai 68 · Émeute',
      expected: 'emeute',
      description: 'Patron neoliberal + Salarié syndicalisme de lutte, occupation Renault, grève reconductible armée. La cellule (T,R) avec tension > 70 finale déclenche la mêlée.',
      play: scenarioEmeute1968,
      side: 'salarie'
    },
    {
      id: 'marchandage',
      title: '🤝 Matignon · Marchandage',
      expected: 'marchandage_4_leviers',
      description: 'Patron paternalisme + Salarié réformiste, échange croisé. La cellule (E,M) ouvre toujours un sous-jeu de marchandage à 4 leviers.',
      play: scenarioMarchandageMatignon,
      side: 'salarie'
    },
    {
      id: 'conseil',
      title: '⚖ Saisine prud\'homale · Conseil',
      expected: 'conseil',
      description: 'Salarié dépose une saisine prud\'homale lourde + acquis CHSCT 1982 + cellule (T,A). Audience prud\'homale automatique.',
      play: scenarioConseilLicenciement,
      side: 'salarie'
    },
    {
      id: 'blockblast',
      title: '🧱 Sécu 1945 · Cotisations',
      expected: 'blockblast_cotisations',
      description: 'Cellule (C,A) après que l\'acquis Sécurité sociale 1945 a été débloqué. Sous-jeu d\'équilibrage de la caisse.',
      play: scenarioBlockBlastSecu,
      side: 'salarie'
    },
    {
      id: 'stable',
      title: '🕊️ Tour stable',
      expected: 'aucun',
      description: 'Cellule (C,M) en contexte calme : aucun atelier n\'est déclenché, on applique seulement le delta dialectique.',
      play: scenarioStable,
      side: 'salarie'
    }
  ];

  /* === État UI === */
  let selected = $state<Scenario | null>(null);
  let outcome = $state<ResolveOutcome | null>(null);
  let log = $state<string[]>([]);

  function runScenario(s: Scenario) {
    selected = s;
    outcome = s.play();
    log = [
      ...log,
      `[${s.id}] cell=${outcome.cell.patron}×${outcome.cell.salarie} · atelier=${outcome.atelier?.kind ?? 'aucun'} · tension finale=${Math.round(outcome.nextShared.tension)}`
    ];
  }

  function onArbiterSettled(combinedDelta: Partial<DeltaVec>) {
    log = [
      ...log,
      `  → delta combiné appliqué : ${
        Object.entries(combinedDelta)
          .filter(([, v]) => v != null && v !== 0)
          .map(([k, v]) => `${k}${v! >= 0 ? '+' : ''}${Math.round((v as number) * 10) / 10}`)
          .join(', ') || 'aucun changement'
      }`
    ];
    /* Reset pour permettre de relancer un autre scénario. */
    selected = null;
    outcome = null;
  }

  function clearLog() { log = []; }
</script>

<div class="root">
  {#if !outcome}
    <header>
      <h1>TableArbiter — Démo dialectique</h1>
      <p class="lede">
        Choisissez un scénario pour scénariser une cellule de la matrice
        Patron × Salarié. Le moteur calcule le delta KPI et déclenche
        l'atelier d'arbitrage approprié quand un seuil est franchi.
      </p>
    </header>

    <div class="scenarios">
      {#each scenarios as s}
        <article class="scenario-card" data-expected={s.expected}>
          <header class="card-header">
            <h2>{s.title}</h2>
            <span class="badge badge-{s.expected}">{s.expected.replace('_', ' ')}</span>
          </header>
          <p class="card-desc">{s.description}</p>
          <button type="button" class="cta" onclick={() => runScenario(s)}>
            Lancer le scénario →
          </button>
        </article>
      {/each}
    </div>

    {#if log.length > 0}
      <section class="log">
        <header>
          <h3>Journal d'exécution</h3>
          <button type="button" class="link" onclick={clearLog}>Effacer</button>
        </header>
        <pre>{log.join('\n')}</pre>
      </section>
    {/if}

  {:else if selected}
    <header class="run-header">
      <button type="button" class="back" onclick={() => { selected = null; outcome = null; }}>
        ← Retour
      </button>
      <h2>{selected.title}</h2>
    </header>

    <TableArbiter
      outcome={outcome}
      patron={defaultContext().patron}
      salarie={defaultContext().salarie}
      shared={defaultContext().shared}
      doctrines={{
        patron: defaultContext().patronDoctrine as Doctrine,
        salarie: defaultContext().salarieDoctrine as Doctrine
      }}
      acquis={new Set<AcquisId>()}
      playerSide={selected.side}
      onsettled={onArbiterSettled}
    />
  {/if}
</div>

<style>
  .root {
    background: #0d0908;
    color: #ede4c9;
    font-family: 'Source Serif 4', Georgia, serif;
    min-height: 100vh;
    padding: 1.5rem;
  }
  header {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  h1 {
    font-family: 'Cinzel', Georgia, serif;
    color: #f4d58b;
    margin: 0 0 0.5rem;
    letter-spacing: 0.04em;
  }
  .lede {
    color: rgba(237, 228, 201, 0.7);
    max-width: 720px;
    margin: 0 auto;
    line-height: 1.5;
    font-size: 0.95rem;
  }
  .scenarios {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    max-width: 1100px;
    margin: 0 auto;
  }
  .scenario-card {
    background: rgba(13, 9, 8, 0.85);
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.5rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }
  .scenario-card .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0;
  }
  .scenario-card h2 {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1rem;
    color: #f4d58b;
    margin: 0;
  }
  .badge {
    font-size: 0.7rem;
    padding: 0.15rem 0.45rem;
    border-radius: 0.25rem;
    background: rgba(237, 228, 201, 0.1);
    color: #c9b26a;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-family: 'Source Code Pro', monospace;
    white-space: nowrap;
  }
  .badge-emeute { background: rgba(217, 106, 91, 0.18); color: #ffb09e; }
  .badge-marchandage_4_leviers { background: rgba(244, 213, 139, 0.15); color: #f4d58b; }
  .badge-conseil { background: rgba(126, 180, 255, 0.15); color: #aac8ff; }
  .badge-blockblast_cotisations { background: rgba(74, 222, 128, 0.15); color: #88e0a3; }
  .badge-aucun { background: rgba(237, 228, 201, 0.05); color: rgba(237, 228, 201, 0.5); }
  .card-desc {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.45;
    color: rgba(237, 228, 201, 0.78);
  }
  .cta {
    align-self: flex-start;
    background: linear-gradient(135deg, #c89b3c, #d4a020);
    border: none;
    color: #0d0908;
    padding: 0.5rem 1rem;
    border-radius: 0.35rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: transform 0.15s;
  }
  .cta:hover { transform: translateY(-2px); }

  .log {
    max-width: 1100px;
    margin: 2rem auto 0;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(237, 228, 201, 0.1);
    border-radius: 0.4rem;
    padding: 0.8rem;
  }
  .log header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 0.5rem;
  }
  .log h3 {
    margin: 0;
    font-family: 'Cinzel', Georgia, serif;
    color: #c9b26a;
    font-size: 0.85rem;
    text-transform: uppercase;
  }
  .link {
    background: none;
    border: none;
    color: #c9b26a;
    text-decoration: underline;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.78rem;
  }
  .log pre {
    font-family: 'Source Code Pro', monospace;
    font-size: 0.78rem;
    color: rgba(237, 228, 201, 0.85);
    white-space: pre-wrap;
    margin: 0;
  }

  .run-header {
    text-align: left;
    max-width: 720px;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .run-header h2 {
    font-family: 'Cinzel', Georgia, serif;
    color: #f4d58b;
    margin: 0;
    font-size: 1.1rem;
  }
  .back {
    background: transparent;
    border: 1px solid rgba(237, 228, 201, 0.3);
    color: rgba(237, 228, 201, 0.85);
    padding: 0.4rem 0.8rem;
    border-radius: 0.35rem;
    font-family: inherit;
    cursor: pointer;
  }
  .back:hover { color: #f4d58b; border-color: #f4d58b; }
</style>
