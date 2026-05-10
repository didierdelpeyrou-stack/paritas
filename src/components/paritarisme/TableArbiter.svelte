<script lang="ts">
  /**
   * Paritas — TableArbiter : orchestrateur de la Table paritaire.
   *
   * Reçoit un ResolveOutcome du moteur dialectique. Selon le trigger
   * d'atelier, il monte le sous-jeu correspondant et compose le
   * résultat final.
   *
   * MVP — couvre uniquement le trigger "emeute" (mêlée). Les autres
   * triggers (blockblast, marchandage, conseil) sont posés en
   * placeholder ; ils seront câblés au fur et à mesure.
   *
   * Boucle complète :
   *   props.outcome → match config → <Emeute /> → onresolve →
   *   delta post-mêlée → onsettled (delta combiné transmis au parent)
   */
  import Emeute from '../ateliers/Emeute.svelte';
  import Marchandage from './Marchandage.svelte';
  import Conseil from './Conseil.svelte';
  import BlockBlastPlaceholder from './BlockBlastPlaceholder.svelte';
  import {
    kpiToMatchConfig,
    applyEmeuteResult,
    emeuteResultFromIndex,
    shouldTriggerEmeute
  } from '../../game/paritarisme/emeute_bridge';
  import type {
    ResolveOutcome,
    PatronKPI,
    SalarieKPI,
    SharedKPI,
    Doctrine,
    DeltaVec,
    AcquisId
  } from '../../game/paritarisme/dialectic';
  import type { MatchConfig } from '../../game/ateliers/emeute/engine';

  interface Props {
    /** Résultat du moteur dialectique pour le tour courant. */
    outcome: ResolveOutcome;
    /** KPI patron au début du tour (avant delta dialectique). */
    patron: PatronKPI;
    /** KPI salarié au début du tour. */
    salarie: SalarieKPI;
    /** KPI partagés. */
    shared: SharedKPI;
    /** Doctrines actives ce tour. */
    doctrines: { patron: Doctrine; salarie: Doctrine };
    /** Acquis irréversibles déjà débloqués (utilisé par Conseil). */
    acquis?: Set<AcquisId>;
    /** Côté incarné par le joueur. */
    playerSide?: 'patron' | 'salarie';
    /** Callback quand l'arbitrage est fini.
       Reçoit le delta combiné = delta dialectique + delta post-atelier. */
    onsettled?: (combinedDelta: Partial<DeltaVec>) => void;
  }

  let {
    outcome, patron, salarie, shared, doctrines,
    acquis = new Set<AcquisId>(),
    playerSide = 'salarie',
    onsettled
  }: Props = $props();

  /* === Étape courante de l'arbitrage ===
     - 'showing-result'   : si pas d'atelier, on montre juste le delta dialectique
     - 'in-emeute'        : mêlée brawler
     - 'in-marchandage'   : sous-jeu 4 leviers
     - 'in-conseil'       : audience prud'homale
     - 'in-blockblast'    : Block Blast cotisations (placeholder)
     - 'done'             : terminé, onsettled appelé. */
  type Stage =
    | 'showing-result'
    | 'in-emeute'
    | 'in-marchandage'
    | 'in-conseil'
    | 'in-blockblast'
    | 'done';

  /* `stage` est mutable : passe à 'done' à la fin de l'arbitrage.
     Initialisé via $derived… non — un état mutable doit rester
     $state. On capture la valeur initiale au mount via une IIFE :
     l'arbitre est un composant éphémère (un par tour), pas de
     reactive update sur outcome attendu. */
  function computeInitialStage(): Stage {
    if (outcome.atelier == null) return 'showing-result';
    switch (outcome.atelier.kind) {
      case 'emeute':                  return 'in-emeute';
      case 'marchandage_4_leviers':   return 'in-marchandage';
      case 'conseil':                 return 'in-conseil';
      case 'blockblast_cotisations':  return 'in-blockblast';
    }
  }
  let stage = $state<Stage>(computeInitialStage());

  /* === Config Émeute dérivée — réactive (mais en pratique stable). === */
  const emeuteConfig = $derived<MatchConfig | null>(
    shouldTriggerEmeute(outcome)
      ? kpiToMatchConfig(outcome, patron, salarie, shared, doctrines, { playerSide })
      : null
  );

  /* === Combinaison delta dialectique + delta post-mêlée === */
  function combineWithEmeute(winnerIndex: number | null): Partial<DeltaVec> {
    const result = emeuteResultFromIndex(winnerIndex, playerSide);
    const post = applyEmeuteResult(result);
    /* Somme membre à membre des deux deltas (dialectique + post). */
    const combined: Partial<DeltaVec> = { ...outcome.finalDelta };
    for (const k of Object.keys(post) as (keyof DeltaVec)[]) {
      const v = post[k];
      if (v == null) continue;
      combined[k] = (combined[k] ?? 0) + v;
    }
    return combined;
  }

  function handleEmeuteResolve(winnerIndex: number | null, _winnerTeam: 0 | 1 | 2 | null) {
    const delta = combineWithEmeute(winnerIndex);
    stage = 'done';
    onsettled?.(delta);
  }

  function skipShowingResult() {
    stage = 'done';
    onsettled?.(outcome.finalDelta);
  }

  /** Combine le delta dialectique avec un delta post-atelier quelconque. */
  function combineWithDelta(post: Partial<DeltaVec>): Partial<DeltaVec> {
    const combined: Partial<DeltaVec> = { ...outcome.finalDelta };
    for (const k of Object.keys(post) as (keyof DeltaVec)[]) {
      const v = post[k];
      if (v == null) continue;
      combined[k] = (combined[k] ?? 0) + v;
    }
    return combined;
  }

  function handleAtelierResolve(post: Partial<DeltaVec>) {
    stage = 'done';
    onsettled?.(combineWithDelta(post));
  }

  /** Doctrine du CPU = celle du camp opposé au joueur. */
  const cpuDoctrine = $derived(
    playerSide === 'salarie' ? doctrines.patron : doctrines.salarie
  );

  /* === Helpers d'affichage === */
  function fmtDelta(v: number | undefined): string {
    if (v == null || v === 0) return '·';
    const r = Math.round(v * 10) / 10;
    return r > 0 ? `+${r}` : `${r}`;
  }

  const cellLabel = $derived(
    `${outcome.cell.patron} × ${outcome.cell.salarie}`
  );
</script>

<div class="arbiter-root">
  {#if stage === 'showing-result'}
    <section class="result-card">
      <h2>Résultat de la table</h2>
      <p class="cell-id">{cellLabel}</p>
      <div class="delta-grid">
        <div class="delta-col">
          <h3>Patron</h3>
          <ul>
            <li>Marge : <b>{fmtDelta(outcome.finalDelta.marge)}</b></li>
            <li>Climat : <b>{fmtDelta(outcome.finalDelta.climat)}</b></li>
            <li>Cap. politique : <b>{fmtDelta(outcome.finalDelta.capPol)}</b></li>
            <li>Réputation : <b>{fmtDelta(outcome.finalDelta.reputation)}</b></li>
          </ul>
        </div>
        <div class="delta-col">
          <h3>Salarié</h3>
          <ul>
            <li>Pouvoir d'achat : <b>{fmtDelta(outcome.finalDelta.povAchat)}</b></li>
            <li>Droits : <b>{fmtDelta(outcome.finalDelta.droits)}</b></li>
            <li>Cohésion : <b>{fmtDelta(outcome.finalDelta.cohesion)}</b></li>
            <li>Légitimité : <b>{fmtDelta(outcome.finalDelta.legitimite)}</b></li>
          </ul>
        </div>
        <div class="delta-col shared">
          <h3>Partagé</h3>
          <ul>
            <li>Tension : <b>{fmtDelta(outcome.finalDelta.tension)}</b></li>
          </ul>
          {#if outcome.unlocked}
            <p class="acquis">🏛️ Acquis débloqué : <b>{outcome.unlocked}</b></p>
          {/if}
        </div>
      </div>
      <button type="button" class="cta" onclick={skipShowingResult}>
        Continuer →
      </button>
    </section>

  {:else if stage === 'in-emeute' && emeuteConfig}
    <section class="atelier-wrap">
      <header class="banner">
        <h2>⚔ Émeute · Place de la République</h2>
        <p class="banner-sub">
          Cellule <b>{cellLabel}</b> · tension {Math.round(outcome.nextShared.tension)} —
          la rue tranche.
        </p>
      </header>
      <Emeute
        initialConfig={emeuteConfig}
        onresolve={handleEmeuteResolve}
        embedded={true}
      />
    </section>

  {:else if stage === 'in-marchandage'}
    <section class="atelier-wrap">
      <header class="banner">
        <h2>🤝 Marchandage · Échange croisé</h2>
        <p class="banner-sub">
          Cellule <b>{cellLabel}</b> — sous-jeu 4 leviers.
        </p>
      </header>
      <Marchandage
        cpuDoctrine={cpuDoctrine}
        playerSide={playerSide}
        onsettled={handleAtelierResolve}
      />
    </section>

  {:else if stage === 'in-conseil'}
    <section class="atelier-wrap">
      <header class="banner">
        <h2>⚖ Conseil prud'homal</h2>
        <p class="banner-sub">
          Cellule <b>{cellLabel}</b> — saisine prud'homale, audience.
        </p>
      </header>
      <Conseil
        patron={patron}
        salarie={salarie}
        acquis={acquis}
        cpuDoctrine={cpuDoctrine}
        playerSide={playerSide}
        onsettled={handleAtelierResolve}
      />
    </section>

  {:else if stage === 'in-blockblast'}
    <section class="atelier-wrap">
      <header class="banner">
        <h2>🧱 Block Blast · Cotisations Sécu</h2>
        <p class="banner-sub">
          Cellule <b>{cellLabel}</b> — équilibrage de la caisse Sécurité sociale.
        </p>
      </header>
      <BlockBlastPlaceholder
        shared={outcome.nextShared}
        onsettled={handleAtelierResolve}
      />
    </section>

  {:else}
    <p class="done-msg">Arbitrage terminé.</p>
  {/if}
</div>

<style>
  .arbiter-root {
    background: #0d0908;
    color: #ede4c9;
    font-family: 'Source Serif 4', Georgia, serif;
    padding: 1rem;
    min-height: 70vh;
  }

  /* === Result card === */
  .result-card {
    max-width: 720px;
    margin: 2rem auto;
    background: rgba(13, 9, 8, 0.85);
    border: 1px solid rgba(244, 213, 139, 0.35);
    border-radius: 0.6rem;
    padding: 1.5rem;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
  }
  .result-card h2 {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.4rem;
    color: #f4d58b;
    margin: 0 0 0.3rem;
  }
  .cell-id {
    font-style: italic;
    color: rgba(237, 228, 201, 0.65);
    margin: 0 0 1rem;
    font-size: 0.9rem;
  }
  .delta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.2rem;
  }
  @media (max-width: 720px) {
    .delta-grid { grid-template-columns: 1fr; }
  }
  .delta-col h3 {
    margin: 0 0 0.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #c9b26a;
  }
  .delta-col ul {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.88rem;
  }
  .delta-col li {
    padding: 0.15rem 0;
    border-bottom: 1px dashed rgba(237, 228, 201, 0.1);
  }
  .delta-col b {
    color: #f4d58b;
    font-family: 'Source Code Pro', monospace;
  }
  .acquis {
    margin-top: 0.6rem;
    padding: 0.4rem 0.6rem;
    background: rgba(244, 213, 139, 0.1);
    border-left: 3px solid #f4d58b;
    font-size: 0.85rem;
  }
  .acquis b {
    font-family: 'Source Code Pro', monospace;
    color: #f4d58b;
  }

  /* === Atelier wrap (Émeute / Marchandage / Conseil / BlockBlast) === */
  .atelier-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .banner {
    text-align: center;
    padding: 0.5rem 1rem;
    background: linear-gradient(90deg, transparent, rgba(217, 106, 91, 0.18), transparent);
    border-bottom: 1px solid rgba(244, 213, 139, 0.3);
  }
  .banner h2 {
    margin: 0;
    font-family: 'Cinzel', Georgia, serif;
    color: #f4d58b;
    font-size: 1.2rem;
    letter-spacing: 0.05em;
  }
  .banner-sub {
    margin: 0.2rem 0 0;
    color: rgba(237, 228, 201, 0.7);
    font-size: 0.85rem;
    font-style: italic;
  }
  .banner-sub b {
    color: #c9b26a;
    font-family: 'Source Code Pro', monospace;
  }

  /* === Done message === */
  .done-msg {
    text-align: center;
    margin: 4rem auto;
    color: rgba(237, 228, 201, 0.5);
    font-style: italic;
  }

  /* === CTA buttons === */
  .cta {
    background: linear-gradient(135deg, #c89b3c, #d4a020);
    border: none;
    color: #0d0908;
    padding: 0.7rem 1.4rem;
    border-radius: 0.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(217, 106, 91, 0.25);
  }
</style>
