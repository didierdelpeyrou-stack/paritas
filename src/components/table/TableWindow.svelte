<script lang="ts">
  /* ============================================================
     TableWindow — vue principale de La Table des Négociations
     ============================================================
     Conçue pour s'afficher en plein écran dans une fenêtre popup
     (window.open). Lit l'URL pour récupérer scenarioId + sessionId
     + playerCamp via query string.

     Communique avec le jeu principal via BroadcastChannel pour
     renvoyer le résultat (effets sur ressources joueur).
     ============================================================ */
  import { onDestroy, onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { table } from '$lib/stores/table.svelte';
  import { makeTableSync } from '$lib/table/sync';
  import type { TableSync } from '$lib/table/sync';
  import type { TableScenarioId } from '$lib/table/types';

  import TableSeat from './TableSeat.svelte';
  import TableDraft from './TableDraft.svelte';

  /* Lecture URL */
  const params = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const sessionId = params.get('session') ?? 'standalone';
  const scenarioId = (params.get('scenario') ?? 'secu-1945') as TableScenarioId;
  const playerActorId = params.get('actor') ?? 'croizat';
  const seed = params.get('seed') ?? sessionId;

  let sync: TableSync | null = null;

  onMount(() => {
    table.init(scenarioId, { playerActorId, seed });
    if (typeof window !== 'undefined') {
      sync = makeTableSync(sessionId);
      sync.send({ kind: 'ready', sessionId });
      window.addEventListener('beforeunload', cleanup);
    }
  });

  onDestroy(() => cleanup());

  function cleanup() {
    if (sync) {
      sync.send({ kind: 'close', sessionId });
      sync.close();
      sync = null;
    }
  }

  /* Surveille le passage en outcome pour remonter le résultat. */
  $effect(() => {
    if (table.state?.phase === 'outcome' && table.state.outcome && sync) {
      sync.send({
        kind: 'outcome',
        sessionId,
        outcome: table.state.outcome
      });
    }
  });

  let s = $derived(table.state);
  let me = $derived(s?.actors.find(a => a.isPlayer) ?? null);
  let myTurn = $derived(s ? s.currentSpeaker === me?.persona.id : false);
  let canVote = $derived(s?.phase === 'vote' && me?.vote === null);

  function endTurn() {
    table.playerEndTurn();
  }

  function voteOui() { table.playerVote('oui'); }
  function voteNon() { table.playerVote('non'); }
  function voteAbst() { table.playerVote('abstention'); }

  /* Speech rapide pour humain — 3 répliques contextuelles selon phase */
  function quickSpeech(phase: string): string[] {
    if (phase === 'opening') return [
      'Je présente ma position.',
      'Voici mon mandat — je le défendrai.',
      'Mes camarades attendent que je tienne.'
    ];
    if (phase === 'concessions') return [
      'Je peux céder sur ce point.',
      'Pas dans ces termes.',
      'Je propose une formulation alternative.'
    ];
    return ['Que la séance avance.'];
  }
</script>

<svelte:head>
  <title>La Table des Négociations · Paritas</title>
</svelte:head>

{#if !s}
  <div class="loading">
    <p>Préparation de la table…</p>
  </div>
{:else}
  <div class="table-window">

    <!-- Bandeau scénario -->
    <header class="header">
      <div>
        <h1>{s.scenarioTitle}</h1>
        <p class="subtitle">{s.scenarioDate} · Tour {s.turn}/{s.totalTurns}
          · {s.phase === 'opening' ? 'Ouverture'
            : s.phase === 'concessions' ? 'Concessions'
            : s.phase === 'vote' ? 'Vote'
            : 'Issue'}</p>
      </div>
      <div class="header-meta">
        Validation : {s.validation === 'unanimite' ? 'Unanimité requise (4/4)'
          : s.validation === 'majorite-qualifiee' ? 'Majorité qualifiée (3/4)'
          : 'Majorité simple'}
      </div>
    </header>

    {#if s.phase === 'opening' && s.turn === 1}
      <div class="context" in:fade>
        <p>{s.scenarioContext}</p>
      </div>
    {/if}

    <!-- Layout circulaire : table au centre, 4 sièges autour -->
    <main class="table-layout">
      <div class="seat-wrap seat-top">
        <TableSeat actor={s.actors[0]!} isCurrentSpeaker={s.currentSpeaker === s.actors[0]?.persona.id} position="top" />
      </div>
      <div class="seat-wrap seat-left">
        <TableSeat actor={s.actors[2]!} isCurrentSpeaker={s.currentSpeaker === s.actors[2]?.persona.id} position="left" />
      </div>
      <div class="center-zone">
        <TableDraft articles={s.draft} actors={s.actors} />

        {#if s.phase === 'outcome' && s.outcome}
          <div class="outcome outcome-{s.outcome.result}" in:fly={{ y: 12, duration: 360, easing: cubicOut }}>
            <h2>
              {s.outcome.result === 'signe' ? 'Accord signé.'
                : s.outcome.result === 'force-minoritaire' ? 'Accord forcé.'
                : 'Séance levée — impasse.'}
            </h2>
            <p class="outcome-epilogue">{s.outcome.epilogue}</p>
            <div class="outcome-effects">
              {#each Object.entries(s.outcome.playerEffects) as [k, v]}
                {#if k !== 'flag' && typeof v === 'number' && v !== 0}
                  <span class="effect" class:positive={v > 0} class:negative={v < 0}>
                    {k} {v > 0 ? '+' : ''}{v}
                  </span>
                {/if}
              {/each}
            </div>
            <button type="button" class="primary-btn" onclick={() => window.close()}>
              Fermer la table
            </button>
          </div>
        {/if}
      </div>
      <div class="seat-wrap seat-right">
        <TableSeat actor={s.actors[3]!} isCurrentSpeaker={s.currentSpeaker === s.actors[3]?.persona.id} position="right" />
      </div>
      <div class="seat-wrap seat-bottom">
        <TableSeat actor={s.actors[1]!} isCurrentSpeaker={s.currentSpeaker === s.actors[1]?.persona.id} position="bottom" />
      </div>
    </main>

    <!-- Journal de session -->
    <aside class="log" aria-label="Journal de séance">
      <h3>Journal de séance</h3>
      <ol class="log-list">
        {#each table.log.slice(-12).reverse() as entry (entry.id)}
          <li in:fly={{ y: -6, duration: 240 }}>
            <span class="log-speaker">{entry.speaker}</span>
            <span class="log-text">{entry.text}</span>
          </li>
        {/each}
      </ol>
    </aside>

    <!-- Barre d'action joueur (bottom) -->
    <footer class="action-bar">
      {#if s.phase === 'outcome'}
        <span class="hint">L'issue est rendue. Le résultat est transmis au jeu principal.</span>
      {:else if canVote}
        <span class="hint">Le vote final. Tu choisis :</span>
        <div class="vote-buttons">
          <button type="button" class="vote-btn vote-oui" onclick={voteOui}>✓ Je signe</button>
          <button type="button" class="vote-btn vote-abst" onclick={voteAbst}>— Abstention</button>
          <button type="button" class="vote-btn vote-non" onclick={voteNon}>✗ Je refuse</button>
        </div>
      {:else if myTurn}
        <span class="hint">C'est à toi.</span>
        <div class="speech-buttons">
          {#each quickSpeech(s.phase) as line}
            <button type="button" class="speech-btn"
              onclick={() => { table.playerSpeak(line); endTurn(); }}>
              {line}
            </button>
          {/each}
          <button type="button" class="end-btn" onclick={endTurn}>Passer</button>
        </div>
      {:else}
        <span class="hint">
          {s.phase === 'vote'
            ? 'Vote en cours…'
            : `${s.actors.find(a => a.persona.id === s.currentSpeaker)?.persona.name ?? 'Quelqu\'un'} parle.`}
        </span>
      {/if}
    </footer>

  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    background: linear-gradient(180deg, #2A1A0E 0%, #1A1411 100%);
    color: #F4EFE2;
    font-family: 'Source Serif 4', Georgia, serif;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100dvh;
    font-style: italic;
    color: rgba(244, 239, 226, 0.7);
  }

  .table-window {
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    height: 100dvh;
    padding: 0.85rem 1.2rem;
    gap: 0.6rem;
    box-sizing: border-box;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.55rem 0.85rem;
    background: linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
    border: 1px solid rgba(201, 178, 106, 0.25);
    border-radius: 0.4rem;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .header h1 {
    margin: 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.05rem;
    color: #F4D58C;
    letter-spacing: 0.04em;
  }

  .subtitle {
    margin: 0.15rem 0 0;
    font-size: 0.78rem;
    color: rgba(244, 239, 226, 0.7);
    letter-spacing: 0.04em;
  }

  .header-meta {
    font-size: 0.78rem;
    color: rgba(201, 178, 106, 0.85);
    font-style: italic;
  }

  .context {
    padding: 0.7rem 1rem;
    background: rgba(244, 213, 140, 0.06);
    border-left: 2px solid #C9B26A;
    border-radius: 0.3rem;
    font-size: 0.92rem;
    color: rgba(244, 239, 226, 0.88);
    line-height: 1.5;
    font-style: italic;
  }

  .table-layout {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      'top    top    top'
      'left   center right'
      'bottom bottom bottom';
    gap: 0.7rem;
    align-items: start;
    min-height: 0;
  }

  .seat-top    { grid-area: top;    justify-self: center; }
  .seat-left   { grid-area: left;   align-self: center; }
  .seat-right  { grid-area: right;  align-self: center; justify-self: end; }
  .seat-bottom { grid-area: bottom; justify-self: center; }

  .center-zone {
    grid-area: center;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    align-self: stretch;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .log {
    /* Journal en bas-droite, intégré dans la barre d'action visuellement */
    background: rgba(13, 11, 8, 0.55);
    border: 1px solid rgba(201, 178, 106, 0.18);
    border-radius: 0.4rem;
    padding: 0.55rem 0.7rem;
    max-height: 12rem;
    overflow-y: auto;
    font-size: 0.82rem;
    line-height: 1.4;
  }

  .log h3 {
    margin: 0 0 0.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    color: #F4D58C;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .log-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .log-list li {
    padding: 0.3rem 0.5rem;
    background: rgba(244, 213, 140, 0.04);
    border-left: 2px solid rgba(201, 178, 106, 0.4);
    border-radius: 0.2rem;
  }

  .log-speaker {
    color: #F4D58C;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    margin-right: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .log-text {
    color: rgba(244, 239, 226, 0.88);
    font-style: italic;
  }

  .action-bar {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.6rem 0.85rem;
    background: linear-gradient(180deg, #3D2A1A 0%, #2A1A0E 100%);
    border: 1px solid rgba(201, 178, 106, 0.25);
    border-radius: 0.4rem;
    flex-wrap: wrap;
  }

  .hint {
    color: rgba(244, 239, 226, 0.78);
    font-style: italic;
    font-size: 0.85rem;
  }

  .speech-buttons,
  .vote-buttons {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .speech-btn,
  .end-btn,
  .vote-btn,
  .primary-btn {
    background: rgba(201, 178, 106, 0.10);
    border: 1px solid rgba(201, 178, 106, 0.35);
    color: #F4D58C;
    padding: 0.45rem 0.85rem;
    border-radius: 0.35rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.82rem;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: background 0.18s ease, transform 0.18s ease, border-color 0.18s ease;
  }

  .speech-btn:hover,
  .end-btn:hover,
  .vote-btn:hover,
  .primary-btn:hover {
    background: rgba(201, 178, 106, 0.18);
    border-color: #C9B26A;
    transform: translateY(-1px);
  }

  .vote-oui  { background: rgba(58, 107, 71, 0.18); border-color: rgba(58, 107, 71, 0.4); color: #8DC09F; }
  .vote-oui:hover { background: rgba(58, 107, 71, 0.3); }
  .vote-non  { background: rgba(176, 24, 30, 0.18); border-color: rgba(176, 24, 30, 0.4); color: #E08F92; }
  .vote-non:hover { background: rgba(176, 24, 30, 0.3); }
  .vote-abst { background: rgba(140, 110, 64, 0.18); border-color: rgba(140, 110, 64, 0.4); }

  .end-btn {
    background: transparent;
    color: rgba(244, 213, 140, 0.65);
  }

  .primary-btn {
    background: #c89b3c;
    color: #0d1014;
    border-color: #c89b3c;
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 0.6rem;
  }

  .primary-btn:hover {
    filter: brightness(1.08);
  }

  .outcome {
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.12), transparent 70%),
      linear-gradient(180deg, #FFF8E5 0%, #F4EFE2 100%);
    border: 1px solid #C9B26A;
    border-radius: 0.5rem;
    padding: 1rem 1.2rem;
    color: #1A1411;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
  }

  .outcome h2 {
    margin: 0 0 0.6rem;
    font-family: 'Cinzel', Georgia, serif;
    color: #5A2F1C;
    letter-spacing: 0.06em;
  }

  .outcome-signe h2  { color: #1F4A2C; }
  .outcome-impasse h2 { color: #5A2F1C; font-style: italic; }
  .outcome-force-minoritaire h2 { color: #6B1014; }

  .outcome-epilogue {
    line-height: 1.6;
    margin: 0 0 0.8rem;
  }

  .outcome-effects {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0.6rem 0 0.8rem;
  }

  .effect {
    padding: 0.2rem 0.55rem;
    border-radius: 0.3rem;
    font-family: 'Courier Prime', monospace;
    font-size: 0.85rem;
    background: rgba(140, 110, 64, 0.18);
    border: 1px solid rgba(140, 110, 64, 0.4);
  }

  .effect.positive { background: rgba(58, 107, 71, 0.18); color: #1F4A2C; border-color: rgba(58, 107, 71, 0.4); }
  .effect.negative { background: rgba(176, 24, 30, 0.18); color: #6B1014; border-color: rgba(176, 24, 30, 0.4); }

  /* Mobile */
  @media (max-width: 900px) {
    .table-layout {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto auto;
      grid-template-areas: 'top' 'left' 'center' 'right' 'bottom';
    }
    .seat-wrap { justify-self: stretch !important; }
  }
</style>
