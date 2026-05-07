<script lang="ts">
  import {
    startNaoSession, resolveSeance, nextSeance,
    setEmployeurMove, setSyndicatMove,
    aiEmployeurMove, aiSyndicatMove,
    emptyAdjustments, defaultPostures,
    getSeanceBudget, effectiveCost, totalAdjustment,
    computeSatisfaction, computeEffectiveSeuil, willUnionSign, computeSigningWeight,
    naoOutcomeToV2Effects,
    ALL_THEMES, ALL_UNIONS, MAX_SEANCES, SIGNING_MAJORITY,
    THEME_META, UNION_META, POSTURE_META,
    EMPLOYEUR_TACTIC_META, SYNDICAT_TACTIC_META,
    NAO_OUTCOME_LABELS,
    type NaoSide, type NaoOutcome, type NaoState,
    type EmployeurTactic, type SyndicatTactic, type UnionPosture,
    type ThemeAdjustments, type PostureMap
  } from '../../game/ateliers/nao/engine.ts';

  interface Props {
    embedded?:  boolean;
    startSide?: NaoSide | null;
    onresolve?: (outcome: NaoOutcome, effects: ReturnType<typeof naoOutcomeToV2Effects>) => void;
    onskip?:    () => void;
  }

  let {
    embedded   = false,
    startSide  = null,
    onresolve,
    onskip
  }: Props = $props();

  /* ── State ─────────────────────────────────────────────── */
  let gameState = $state<NaoState>(startNaoSession());

  // Mouvements locaux avant confirmation
  let empAdj     = $state<ThemeAdjustments>(emptyAdjustments());
  let empTactic  = $state<EmployeurTactic | null>(null);
  let synPostures = $state<PostureMap>(defaultPostures());
  let synTactic   = $state<SyndicatTactic | null>(null);

  // Hot-seat : qui a confirmé ?
  let empConfirmed = $state(false);
  let synConfirmed = $state(false);

  // Animation résultat
  let revealStep = $state(0); // 0=hidden, 1=themes, 2=unions, 3=full
  // Stockage des timer IDs pour pouvoir les annuler au restart / unmount
  let revealTimers: ReturnType<typeof setTimeout>[] = [];
  function clearRevealTimers() {
    revealTimers.forEach(id => clearTimeout(id));
    revealTimers = [];
  }

  /* ── Derived ───────────────────────────────────────────── */
  const isHotSeat   = $derived(startSide === null);
  const humanSide   = $derived(startSide ?? 'employeur'); // fallback (hot-seat uses both)

  const seanceBudget = $derived(getSeanceBudget(gameState));
  const empCost      = $derived(effectiveCost(empAdj, gameState.modifiers.mobilisationActive));
  const empBudgetOk  = $derived(empCost <= seanceBudget && empCost <= (gameState.enveloppeMax - gameState.enveloppeSpent));

  // Projection des thèmes avec les sliders courants
  const projectedThemes = $derived((() => {
    const t = { ...gameState.themes };
    ALL_THEMES.forEach(theme => { t[theme] = Math.min(100, t[theme] + (empAdj[theme] ?? 0)); });
    return t;
  })());

  // Poids signataires projetés (aperçu live)
  const projectedSigning = $derived(
    computeSigningWeight(projectedThemes, synPostures, gameState.modifiers.accordPartielActive)
  );

  const availableEmpTactics = $derived(
    (['offre_globale', 'ultimatum', 'communication', 'audit_bloquant'] as EmployeurTactic[])
      .filter(t => !gameState.tacticsUsed.employeur.includes(t))
  );
  const availableSynTactics = $derived(
    (['expertise', 'coordination', 'mobilisation', 'accord_partiel'] as SyndicatTactic[])
      .filter(t => !gameState.tacticsUsed.syndicat.includes(t))
  );

  const lastResult = $derived(gameState.history.at(-1));

  /* En hot-seat, masquer la projection live des thèmes au délégué :
     tant que l'employeur est en train de jouer, ses sliders sont privés.
     Une fois employeur confirmé, on continue à masquer pour éviter que
     le délégué ne voie EXACTEMENT où l'employeur a placé ses curseurs.
     On affiche les positions de référence (themes courants, sans projection). */
  const showProjection = $derived(
    !isHotSeat || (gameState.phase === 'proposing' && !empConfirmed) || gameState.phase !== 'proposing'
  );

  /* Le badge "% suffrages" projeté révèle les choix employeur en hot-seat
     pendant le tour syndicat. On ne l'affiche que pour le côté actif. */
  const showSigningBadge = $derived(
    !isHotSeat || (gameState.phase === 'proposing' && !empConfirmed) || gameState.phase !== 'proposing'
  );

  /* ── Helpers ───────────────────────────────────────────── */
  function fmt(n: number) { return Math.round(n * 100); }
  function pct(pos: number, demand: number) { return Math.min(100, Math.round(pos / demand * 100)); }

  function resetLocalMoves() {
    empAdj      = emptyAdjustments();
    empTactic   = null;
    synPostures = { ...gameState.postures };
    synTactic   = null;
    empConfirmed = false;
    synConfirmed = false;
  }

  /* ── Actions ───────────────────────────────────────────── */
  function confirmEmployeur() {
    if (empConfirmed) return;
    empConfirmed = true;
    if (!isHotSeat) maybeResolve();
    /* en hot-seat : ne pas résoudre, attendre confirmSyndicat */
  }

  function confirmSyndicat() {
    if (synConfirmed) return;
    synConfirmed = true;
    maybeResolve();
  }

  function maybeResolve() {
    /* Garde de phase : si on n'est plus en proposing, on ne ré-anime pas
       (évite double-trigger en VS AI) */
    if (gameState.phase !== 'proposing') return;

    const empReady = isHotSeat ? empConfirmed : true;
    const synReady = isHotSeat ? synConfirmed : true;
    if (!empReady || !synReady) return;

    // Calculer le move AI si nécessaire
    let empMove = { adjustments: empAdj, tactic: empTactic };
    let synMove = { postures: synPostures, tactic: synTactic };

    if (!isHotSeat && humanSide === 'syndicat') {
      empMove = aiEmployeurMove(gameState);
    }
    if (!isHotSeat && humanSide === 'employeur') {
      synMove = aiSyndicatMove(gameState);
    }

    let s = setEmployeurMove(gameState, empMove);
    s = setSyndicatMove(s, synMove);
    s = resolveSeance(s);
    gameState = s;

    /* Animation séquentielle — uniquement si phase 'result'.
       En phase 'ended' on saute directement à l'écran final. */
    clearRevealTimers();
    revealStep = 0;
    if (gameState.phase === 'result') {
      revealTimers.push(setTimeout(() => { revealStep = 1; }, 200));
      revealTimers.push(setTimeout(() => { revealStep = 2; }, 700));
      revealTimers.push(setTimeout(() => { revealStep = 3; }, 1200));
    } else {
      revealStep = 3;
    }
  }

  function handleNext() {
    if (gameState.phase === 'ended') {
      if (onresolve && gameState.outcome) {
        const effects = naoOutcomeToV2Effects(gameState.outcome, startSide ?? 'syndicat');
        onresolve(gameState.outcome, effects);
      }
      return;
    }
    gameState = nextSeance(gameState);
    resetLocalMoves();
  }

  function restart() {
    clearRevealTimers();
    gameState = startNaoSession();
    resetLocalMoves();
    revealStep = 0;
  }

  // Quand la phase passe à 'proposing', pré-remplir les postures depuis le state
  $effect(() => {
    if (gameState.phase === 'proposing') {
      synPostures = { ...gameState.postures };
    }
  });

  // En mode VS AI, confirmer automatiquement le côté AI lors du changement de phase
  $effect(() => {
    if (gameState.phase === 'proposing' && !isHotSeat) {
      empConfirmed = false;
      synConfirmed = false;
    }
  });

  /* ── Cleanup au démontage ─────────────────────────────── */
  $effect(() => () => clearRevealTimers());

  /* ── Tutoriel diégétique (Argus ORDA-001) ───────────────────
     Trois phrases au tour 1 pour expliquer enveloppe / seuil /
     poids syndical. Dismissable, persistance localStorage pour
     ne pas réimposer au joueur qui a déjà vu. */
  let tutorialDismissed = $state(false);
  if (typeof window !== 'undefined') {
    try { tutorialDismissed = localStorage.getItem('paritas_nao_tuto_seen') === '1'; }
    catch { /* ignore */ }
  }
  function dismissTutorial() {
    tutorialDismissed = true;
    try { localStorage.setItem('paritas_nao_tuto_seen', '1'); } catch { /* ignore */ }
  }
  const showTutorial = $derived(
    gameState.phase === 'proposing' && gameState.seance === 1 && !tutorialDismissed
  );
</script>

<!-- ═══════════════════════════════════════════════════════════
     STRUCTURE PRINCIPALE
═══════════════════════════════════════════════════════════ -->
<div class="nao-root" class:embedded>

  <!-- ── HEADER ── -->
  <header class="nao-header">
    <div class="header-left">
      <span class="header-icon">🏛️</span>
      <div>
        <h1 class="header-title">NAO — Négociation Annuelle</h1>
        <p class="header-sub">Séance {gameState.seance} / {MAX_SEANCES}</p>
      </div>
    </div>
    <div class="header-right">
      <div class="envelope-display">
        <span class="env-label">Enveloppe</span>
        <span class="env-value">
          {#if gameState.enveloppeRevealed || (startSide === 'employeur' || startSide === null)}
            {gameState.enveloppeMax - gameState.enveloppeSpent} / {gameState.enveloppeMax} pts
          {:else}
            ?? pts restants
          {/if}
        </span>
      </div>
      {#if showSigningBadge}
        <div class="majority-badge" class:ok={projectedSigning.weight >= SIGNING_MAJORITY}>
          {projectedSigning.weight}% suffrages
          {projectedSigning.weight >= SIGNING_MAJORITY ? '✅' : '⚠️'}
        </div>
      {:else}
        <div class="majority-badge hidden">
          ?? % suffrages 🔒
        </div>
      {/if}
    </div>
  </header>

  <!-- ── TUTORIEL DIÉGÉTIQUE (1er tour) ── -->
  {#if showTutorial}
    <aside class="nao-tuto" role="note" aria-label="Comment ça marche">
      <div class="nao-tuto-head">
        <span class="nao-tuto-icon" aria-hidden="true">📋</span>
        <h2 class="nao-tuto-title">Comment ça marche — première séance</h2>
        <button type="button" class="nao-tuto-close" onclick={dismissTutorial} aria-label="Fermer le tutoriel">×</button>
      </div>
      <ol class="nao-tuto-list">
        <li><strong>Côté employeur</strong> : tu disposes d'une <em>enveloppe totale</em> de {gameState.enveloppeMax} pts à répartir sur 5 séances. Chaque thème touché monte d'un cran.</li>
        <li><strong>Côté syndical</strong> : chaque syndicat (CGT, CFDT, FO) a son <em>seuil d'accord</em> et son <em>poids électoral</em>. Tu choisis sa posture (pression, attente, compromis) à chaque séance.</li>
        <li><strong>Pour signer un accord valide</strong> : il faut convaincre des syndicats représentant ≥ 50 % des suffrages. CFDT (35 %) + FO (20 %) suffit. Sans CGT, mais avec elle l'accord pèse plus.</li>
      </ol>
    </aside>
  {/if}

  <!-- ── BARRES THÈMES ── -->
  <section class="themes-section">
    {#each ALL_THEMES as theme}
      {@const meta = THEME_META[theme]}
      {@const empPos = gameState.themes[theme]}
      {@const projPos = projectedThemes[theme]}
      {@const empPct = pct(empPos, meta.unionDemand)}
      {@const projPct = pct(projPos, meta.unionDemand)}
      <div class="theme-row">
        <div class="theme-label">
          <span class="theme-icon">{meta.icon}</span>
          <span>{meta.label}</span>
        </div>
        <div class="theme-bar-wrap">
          <div class="theme-bar">
            <div class="bar-fill employer" style="width:{empPct}%"></div>
            {#if showProjection && projPct > empPct}
              <div class="bar-fill projected" style="width:{projPct}%;opacity:0.45"></div>
            {/if}
          </div>
          <div class="bar-labels">
            <span class="bar-current">{empPct}%</span>
            <span class="bar-demand">Demande : {meta.demandLabel}</span>
          </div>
        </div>
      </div>
    {/each}
  </section>

  <!-- ══════════════════════════════════════════════════════
       PHASE : PROPOSING
  ══════════════════════════════════════════════════════ -->
  {#if gameState.phase === 'proposing'}

    <!-- ── En mode hot-seat, afficher un bandeau de tour ── -->
    {#if isHotSeat && !empConfirmed}
      <div class="turn-banner emp">🏢 Tour de l'Employeur — le délégué détourne les yeux</div>
    {:else if isHotSeat && empConfirmed && !synConfirmed}
      <div class="turn-banner syn">✊ Tour du Délégué Syndical — l'employeur détourne les yeux</div>
    {/if}

    <div class="panels">

      <!-- ── PANNEAU EMPLOYEUR ── -->
      {#if !isHotSeat && humanSide !== 'employeur'}
        <!-- AI joue l'employeur — afficher info -->
        <div class="panel ai-panel">
          <h2 class="panel-title">🤖 Employeur (IA)</h2>
          <p class="ai-hint">L'IA prépare sa proposition…</p>
        </div>
      {:else if isHotSeat && empConfirmed}
        <div class="panel locked-panel">
          <h2 class="panel-title">🏢 Employeur</h2>
          <div class="locked-badge">✅ Proposition verrouillée</div>
        </div>
      {:else}
        <div class="panel emp-panel">
          <h2 class="panel-title">🏢 Employeur</h2>
          <p class="panel-sub">Budget ce tour : <strong>{seanceBudget - empCost} pts restants</strong>
            {#if gameState.modifiers.mobilisationActive}
              <span class="malus-badge">⚠️ +3 pts/thème (mobilisation)</span>
            {/if}
          </p>

          <!-- Sliders thèmes -->
          {#each ALL_THEMES as theme}
            {@const meta = THEME_META[theme]}
            {@const cur  = gameState.themes[theme]}
            {@const proj = projectedThemes[theme]}
            <label class="theme-adj adj-label-wrap">
              <div class="adj-label">
                {meta.icon} {meta.label}
                <span class="adj-delta">
                  {cur}% → {proj}%
                  {#if empAdj[theme] > 0}<span class="delta-pos">+{empAdj[theme]}</span>{/if}
                </span>
              </div>
              <input
                type="range" min="0" max="20"
                value={empAdj[theme]}
                oninput={e => {
                  const el = e.target as HTMLInputElement;
                  const v = parseInt(el.value);
                  const newAdj = { ...empAdj, [theme]: v };
                  const newCost = effectiveCost(newAdj, gameState.modifiers.mobilisationActive);
                  const maxAllowed = Math.min(seanceBudget, gameState.enveloppeMax - gameState.enveloppeSpent);
                  if (newCost <= maxAllowed) {
                    empAdj = newAdj;
                  } else {
                    /* Rejeter et resynchroniser le DOM avec la valeur acceptée */
                    el.value = String(empAdj[theme]);
                  }
                }}
                disabled={empConfirmed}
                class="adj-slider"
              />
            </label>
          {/each}

          <!-- Cartes tactiques -->
          <div class="tactics-section">
            <h3 class="tactics-title">Tactiques disponibles</h3>
            <div class="tactics-grid">
              {#each availableEmpTactics as t}
                {@const m = EMPLOYEUR_TACTIC_META[t]}
                <button
                  class="tactic-card"
                  class:selected={empTactic === t}
                  onclick={() => { empTactic = empTactic === t ? null : t; }}
                  disabled={empConfirmed}
                  title={m.description}
                >
                  <span class="tactic-icon">{m.icon}</span>
                  <span class="tactic-label">{m.label}</span>
                </button>
              {/each}
              {#if availableEmpTactics.length === 0}
                <p class="tactics-empty">Toutes les tactiques ont été jouées.</p>
              {/if}
            </div>
            {#if empTactic}
              <p class="tactic-desc">{EMPLOYEUR_TACTIC_META[empTactic].description}</p>
            {/if}
          </div>

          <button
            class="confirm-btn emp-btn"
            onclick={confirmEmployeur}
            disabled={!empBudgetOk || empConfirmed}
          >
            {empConfirmed ? '✅ Verrouillé' : 'Valider la proposition'}
          </button>
        </div>
      {/if}

      <!-- ── SÉPARATEUR ── -->
      <div class="panel-sep">⟺</div>

      <!-- ── PANNEAU SYNDICAT ── -->
      {#if !isHotSeat && humanSide !== 'syndicat'}
        <div class="panel ai-panel">
          <h2 class="panel-title">🤖 Délégué Syndical (IA)</h2>
          <p class="ai-hint">L'IA détermine les postures…</p>
        </div>
      {:else if isHotSeat && !empConfirmed}
        <div class="panel locked-panel waiting">
          <h2 class="panel-title">✊ Délégué Syndical</h2>
          <p class="waiting-msg">⏳ En attente de la proposition employeur…</p>
        </div>
      {:else if isHotSeat && synConfirmed}
        <div class="panel locked-panel">
          <h2 class="panel-title">✊ Délégué Syndical</h2>
          <div class="locked-badge">✅ Postures verrouillées</div>
        </div>
      {:else}
        <div class="panel syn-panel">
          <h2 class="panel-title">✊ Délégué Syndical</h2>
          <p class="panel-sub">Choisissez la posture de chaque syndicat</p>

          <!-- Postures syndicats —
               En hot-seat, la satisfaction est calculée sur les positions
               EMPLOYEUR ACTUELLES (sans la proposition cachée), pour préserver
               l'asymétrie d'information « simultanée ».
               En vs IA / standalone : projection complète. -->
          {#each ALL_UNIONS as union}
            {@const meta    = UNION_META[union]}
            {@const pos     = synPostures[union]}
            {@const refThemes = isHotSeat ? gameState.themes : projectedThemes}
            {@const sat     = computeSatisfaction(refThemes, union, gameState.modifiers.accordPartielActive)}
            {@const seuil   = computeEffectiveSeuil(union, pos)}
            {@const signs   = willUnionSign(refThemes, union, pos, gameState.modifiers.accordPartielActive)}
            <div class="union-row">
              <div class="union-header">
                <span class="union-icon" style="color:{meta.color}">{meta.icon}</span>
                <span class="union-name">{meta.label}</span>
                <span class="union-weight">({meta.electoralWeight}%)</span>
                <span class="union-sign-badge" class:will-sign={signs} class:wont-sign={!signs}>
                  {signs ? '✅ Signera' : '✗ Refus'}
                </span>
              </div>
              <!-- Barre de satisfaction -->
              <div class="sat-bar-wrap">
                <div class="sat-bar">
                  <div class="sat-fill" style="width:{Math.min(100, sat*100)}%;background:{meta.color}"></div>
                  <div class="sat-seuil" style="left:{Math.min(100, seuil*100)}%"></div>
                </div>
                <div class="sat-labels">
                  <span>{fmt(sat)}%</span>
                  <span class="seuil-label">seuil {fmt(seuil)}%</span>
                </div>
              </div>
              <!-- Sélecteur de posture -->
              <div class="posture-picker">
                {#each (['pression','patience','compromis','retrait'] as UnionPosture[]) as p}
                  <button
                    class="posture-btn"
                    class:active={synPostures[union] === p}
                    onclick={() => { synPostures = { ...synPostures, [union]: p }; }}
                    disabled={synConfirmed}
                    title={POSTURE_META[p].description}
                  >
                    {POSTURE_META[p].icon} {POSTURE_META[p].label}
                  </button>
                {/each}
              </div>
            </div>
          {/each}

          <!-- Cartes tactiques -->
          <div class="tactics-section">
            <h3 class="tactics-title">Tactiques disponibles</h3>
            <div class="tactics-grid">
              {#each availableSynTactics as t}
                {@const m = SYNDICAT_TACTIC_META[t]}
                <button
                  class="tactic-card"
                  class:selected={synTactic === t}
                  onclick={() => { synTactic = synTactic === t ? null : t; }}
                  disabled={synConfirmed}
                  title={m.description}
                >
                  <span class="tactic-icon">{m.icon}</span>
                  <span class="tactic-label">{m.label}</span>
                </button>
              {/each}
              {#if availableSynTactics.length === 0}
                <p class="tactics-empty">Toutes les tactiques ont été jouées.</p>
              {/if}
            </div>
            {#if synTactic}
              <p class="tactic-desc">{SYNDICAT_TACTIC_META[synTactic].description}</p>
            {/if}
          </div>

          <button
            class="confirm-btn syn-btn"
            onclick={confirmSyndicat}
            disabled={synConfirmed}
          >
            {synConfirmed ? '✅ Verrouillé' : 'Valider les postures'}
          </button>
        </div>
      {/if}

    </div><!-- /panels -->

    <!-- Déclencher la résolution dès que les deux confirment en mode VS AI -->
    {#if !isHotSeat && (humanSide === 'employeur' ? empConfirmed : synConfirmed)}
      <!-- La résolution est déclenchée dans confirmEmployeur / confirmSyndicat -->
    {/if}

  <!-- ══════════════════════════════════════════════════════
       PHASE : RESULT
  ══════════════════════════════════════════════════════ -->
  {:else if gameState.phase === 'result' && lastResult}

    <div class="result-section" class:visible={revealStep >= 1}>
      <!-- Narrative -->
      <div class="narrative-box">
        <p>{lastResult.narrative}</p>
      </div>

      <!-- Thèmes après -->
      {#if revealStep >= 1}
        <div class="result-themes">
          {#each ALL_THEMES as theme}
            {@const meta = THEME_META[theme]}
            {@const before = lastResult.themesBefore[theme]}
            {@const after  = lastResult.themesAfter[theme]}
            {@const gain   = after - before}
            <div class="result-theme-row">
              <span class="theme-icon">{meta.icon}</span>
              <span class="theme-name">{meta.label}</span>
              <div class="result-bar">
                <div class="result-bar-fill" style="width:{pct(after, meta.unionDemand)}%"></div>
              </div>
              <span class="theme-after">{pct(after, meta.unionDemand)}%</span>
              {#if gain > 0}
                <span class="gain-badge">+{gain}</span>
              {:else}
                <span class="no-gain">—</span>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      <!-- Syndicats -->
      {#if revealStep >= 2}
        <div class="result-unions">
          {#each ALL_UNIONS as union}
            {@const meta  = UNION_META[union]}
            {@const us    = lastResult.unionStates[union]}
            <div class="result-union-card" class:signing={us.willSign}>
              <div class="ruc-header">
                <span style="color:{meta.color}">{meta.icon} {meta.label}</span>
                <span class="ruc-weight">{meta.electoralWeight}%</span>
                <span class="ruc-verdict" class:yes={us.willSign}>{us.willSign ? '✅ SIGNE' : '✗ REFUSE'}</span>
              </div>
              <div class="ruc-sat">
                Satisfaction : {fmt(us.satisfaction)}% / seuil {fmt(us.effectiveSeuil)}%
                <span class="ruc-posture">{POSTURE_META[us.posture].icon} {POSTURE_META[us.posture].label}</span>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Poids signataires -->
      {#if revealStep >= 3}
        <div class="signing-weight-box" class:valid={lastResult.signingWeight >= SIGNING_MAJORITY}>
          <strong>Poids signataire : {lastResult.signingWeight}%</strong>
          {#if lastResult.signingWeight >= SIGNING_MAJORITY}
            <span>✅ Accord valide si clôture maintenant</span>
          {:else}
            <span>⚠️ Insuffisant — {SIGNING_MAJORITY - lastResult.signingWeight}% manquants</span>
          {/if}
        </div>

        <div class="next-actions">
          {#if gameState.seance <= MAX_SEANCES}
            <button class="next-btn" onclick={handleNext}>
              Séance {gameState.seance} →
            </button>
          {/if}
        </div>
      {/if}
    </div>

  <!-- ══════════════════════════════════════════════════════
       PHASE : ENDED
  ══════════════════════════════════════════════════════ -->
  {:else if gameState.phase === 'ended' && gameState.outcome}

    {@const olabel = NAO_OUTCOME_LABELS[gameState.outcome]}
    {@const side   = startSide ?? 'syndicat'}
    {@const effects = naoOutcomeToV2Effects(gameState.outcome, side)}

    <div class="outcome-screen">
      <div class="outcome-emoji">{olabel.emoji}</div>
      <h2 class="outcome-title">{olabel.title}</h2>
      <p class="outcome-subtitle">{olabel.subtitle}</p>

      {#if lastResult}
        <div class="narrative-box ended-narrative">
          <p>{lastResult.narrative}</p>
        </div>
      {/if}

      <div class="outcome-perspectives">
        <div class="perspective emp-perspective">
          <h3>🏢 Employeur</h3>
          <p>{olabel.employeur}</p>
        </div>
        <div class="perspective syn-perspective">
          <h3>✊ Syndicat</h3>
          <p>{olabel.syndicat}</p>
        </div>
      </div>

      <!-- Syndicats signataires -->
      <div class="final-unions">
        {#each ALL_UNIONS as union}
          {@const meta  = UNION_META[union]}
          {@const signs = gameState.signingUnions.includes(union)}
          <div class="final-union" class:signed={signs}>
            <span style="color:{meta.color}">{meta.icon} {meta.label}</span>
            <span class="final-weight">{meta.electoralWeight}%</span>
            <span>{signs ? '✅' : '✗'}</span>
          </div>
        {/each}
        <div class="final-total">
          Poids signataire : {gameState.signingUnions.reduce((s,u) => s + UNION_META[u].electoralWeight, 0)}%
        </div>
      </div>

      <!-- Effets V2 -->
      {#if embedded}
        <div class="v2-effects">
          {#each Object.entries(effects) as [key, val]}
            <div class="effect-chip" class:pos={val > 0} class:neg={val < 0}>
              {val > 0 ? '+' : ''}{val} {key}
            </div>
          {/each}
        </div>
      {/if}

      <div class="outcome-actions">
        {#if onresolve}
          <button class="resolve-btn" onclick={() => handleNext()}>
            Continuer →
          </button>
        {/if}
        <button class="restart-btn" onclick={restart}>
          Rejouer
        </button>
        {#if onskip}
          <button class="skip-btn" onclick={() => onskip?.()}>
            Passer l'atelier
          </button>
        {/if}
      </div>

      <!-- Historique des séances -->
      <div class="history-strip">
        {#each gameState.history as hr}
          <div class="history-chip" class:ok={hr.signingWeight >= SIGNING_MAJORITY}>
            S{hr.seance} · {hr.signingWeight}%
          </div>
        {/each}
      </div>
    </div>

  {/if}

</div>

<!-- ═══════════════════════════════════════════════════════════
     STYLES
═══════════════════════════════════════════════════════════ -->
<style>
  .nao-root {
    font-family: 'Inter', system-ui, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    min-height: 100vh;
    padding: 1.25rem;
    box-sizing: border-box;
  }
  .nao-root.embedded {
    min-height: unset;
    border-radius: 0.75rem;
    border: 1px solid #334155;
  }

  /* ── Header ── */
  .nao-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #1e3a5f;
  }
  .header-left { display: flex; align-items: center; gap: 0.75rem; }
  .header-icon { font-size: 2rem; }
  .header-title { margin: 0; font-size: 1.25rem; font-weight: 700; color: #f1f5f9; }
  .header-sub { margin: 0; font-size: 0.8rem; color: #64748b; }
  .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; }
  .envelope-display { font-size: 0.85rem; color: #94a3b8; }
  .env-label { margin-right: 0.4rem; }
  .env-value { font-weight: 600; color: #f1f5f9; }
  .majority-badge {
    font-size: 0.8rem; padding: 0.25rem 0.6rem;
    border-radius: 9999px; background: #1e293b;
    border: 1px solid #374151;
  }
  .majority-badge.ok { border-color: #10b981; color: #34d399; }
  .majority-badge.hidden { color: #64748b; border-style: dashed; }

  /* ── Tutoriel diégétique ── */
  .nao-tuto {
    background: linear-gradient(135deg, rgba(201,162,91,0.08), rgba(52,211,153,0.04));
    border: 1px solid #475569;
    border-left: 3px solid #c9a25b;
    border-radius: 0.5rem;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
  }
  .nao-tuto-head {
    display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem;
  }
  .nao-tuto-icon { font-size: 1.2rem; }
  .nao-tuto-title {
    flex: 1;
    font-size: 0.92rem;
    font-weight: 700;
    color: #c9a25b;
    margin: 0;
  }
  .nao-tuto-close {
    background: transparent;
    border: 1px solid #475569;
    color: #94a3b8;
    width: 28px; height: 28px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
  }
  .nao-tuto-close:hover { border-color: #c9a25b; color: #c9a25b; }
  .nao-tuto-list {
    margin: 0; padding-left: 1.25rem;
    font-size: 0.85rem; color: #cbd5e1; line-height: 1.55;
  }
  .nao-tuto-list li { margin-bottom: 0.4rem; }
  .nao-tuto-list li:last-child { margin-bottom: 0; }
  .nao-tuto-list strong { color: #f1f5f9; }
  .nao-tuto-list em { color: #c9a25b; font-style: normal; }

  /* ── Themes section ── */
  .themes-section {
    background: #1e293b; border-radius: 0.6rem;
    padding: 0.75rem 1rem; margin-bottom: 1.25rem;
    display: flex; flex-direction: column; gap: 0.6rem;
  }
  .theme-row { display: flex; align-items: center; gap: 0.75rem; }
  .theme-label { display: flex; align-items: center; gap: 0.4rem; width: 11rem; font-size: 0.82rem; color: #94a3b8; }
  .theme-icon { font-size: 1rem; }
  .theme-bar-wrap { flex: 1; }
  .theme-bar { height: 10px; background: #334155; border-radius: 5px; position: relative; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 5px; position: absolute; top: 0; left: 0; transition: width 0.5s ease; }
  .bar-fill.employer  { background: #3b82f6; }
  .bar-fill.projected { background: #60a5fa; }
  .bar-labels { display: flex; justify-content: space-between; font-size: 0.72rem; color: #64748b; margin-top: 2px; }
  .bar-current { color: #93c5fd; font-weight: 600; }

  /* ── Turn banner ── */
  .turn-banner {
    text-align: center; padding: 0.5rem; border-radius: 0.4rem;
    font-weight: 600; margin-bottom: 0.75rem;
  }
  .turn-banner.emp { background: #1e3a5f; color: #93c5fd; }
  .turn-banner.syn { background: #1f2d1f; color: #86efac; }

  /* ── Panels ── */
  .panels { display: grid; grid-template-columns: 1fr 2.5rem 1fr; gap: 0.5rem; margin-bottom: 1rem; }
  .panel-sep { display: flex; align-items: center; justify-content: center; color: #475569; font-size: 1.2rem; }
  .panel {
    background: #1e293b; border-radius: 0.75rem;
    padding: 1rem; border: 1px solid #334155;
  }
  .locked-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.7; }
  .locked-panel.waiting { opacity: 0.5; }
  .locked-badge { margin-top: 0.75rem; padding: 0.4rem 0.8rem; background: #0f4c2b; color: #34d399; border-radius: 0.4rem; font-size: 0.85rem; }
  .waiting-msg { color: #64748b; font-size: 0.85rem; margin-top: 0.5rem; }
  .ai-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .ai-hint { color: #64748b; font-size: 0.82rem; margin-top: 0.5rem; }

  .panel-title { margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 700; }
  .panel-sub { font-size: 0.78rem; color: #64748b; margin-bottom: 0.75rem; }
  .malus-badge { display: inline-block; margin-left: 0.4rem; padding: 0.1rem 0.4rem; background: #7f1d1d; color: #fca5a5; border-radius: 0.3rem; font-size: 0.72rem; }

  /* Adjustments */
  .theme-adj { margin-bottom: 0.6rem; }
  .adj-label { display: flex; justify-content: space-between; font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.2rem; }
  .adj-delta { color: #93c5fd; }
  .delta-pos { color: #34d399; margin-left: 0.25rem; }
  .adj-slider { width: 100%; accent-color: #3b82f6; }

  /* Tactics */
  .tactics-section { margin-top: 0.75rem; }
  .tactics-title { font-size: 0.78rem; color: #64748b; margin: 0 0 0.4rem 0; }
  .tactics-grid { display: flex; flex-wrap: wrap; gap: 0.3rem; }
  .tactic-card {
    padding: 0.3rem 0.5rem; background: #334155; border: 1px solid #475569;
    border-radius: 0.4rem; cursor: pointer; font-size: 0.72rem; color: #e2e8f0;
    display: flex; gap: 0.25rem; align-items: center; transition: all 0.15s;
  }
  .tactic-card:hover { background: #3b4f6b; }
  .tactic-card.selected { background: #1e3a5f; border-color: #3b82f6; color: #93c5fd; }
  .tactic-card:disabled { opacity: 0.4; cursor: not-allowed; }
  .tactic-icon { font-size: 0.9rem; }
  .tactic-label { font-size: 0.7rem; }
  .tactic-desc { font-size: 0.72rem; color: #64748b; margin-top: 0.3rem; padding: 0.3rem; background: #0f172a; border-radius: 0.3rem; }
  .tactics-empty { font-size: 0.72rem; color: #475569; }

  .confirm-btn {
    width: 100%; margin-top: 0.75rem; padding: 0.6rem;
    border-radius: 0.5rem; border: none; cursor: pointer;
    font-weight: 700; font-size: 0.85rem; transition: all 0.15s;
  }
  .emp-btn { background: #1e40af; color: #fff; }
  .emp-btn:hover:not(:disabled) { background: #2563eb; }
  .syn-btn { background: #065f46; color: #fff; }
  .syn-btn:hover:not(:disabled) { background: #10b981; }
  .confirm-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Union rows in syndicat panel */
  .union-row { margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid #1e293b; }
  .union-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.3rem; font-size: 0.82rem; }
  .union-icon { font-size: 1.1rem; }
  .union-name { font-weight: 600; }
  .union-weight { color: #64748b; font-size: 0.72rem; }
  .union-sign-badge { margin-left: auto; font-size: 0.72rem; padding: 0.1rem 0.4rem; border-radius: 0.3rem; }
  .union-sign-badge.will-sign { background: #0f4c2b; color: #34d399; }
  .union-sign-badge.wont-sign { background: #3f1f1f; color: #f87171; }

  .sat-bar-wrap { margin-bottom: 0.3rem; }
  .sat-bar { height: 6px; background: #334155; border-radius: 3px; position: relative; overflow: visible; margin-bottom: 2px; }
  .sat-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
  .sat-seuil { position: absolute; top: -3px; width: 2px; height: 12px; background: #f59e0b; border-radius: 1px; }
  .sat-labels { display: flex; justify-content: space-between; font-size: 0.68rem; color: #64748b; }
  .seuil-label { color: #f59e0b; }

  .posture-picker { display: flex; gap: 0.25rem; flex-wrap: wrap; }
  .posture-btn {
    padding: 0.25rem 0.5rem; font-size: 0.7rem;
    background: #334155; border: 1px solid #475569; border-radius: 0.3rem;
    cursor: pointer; color: #94a3b8; transition: all 0.15s;
  }
  .posture-btn.active { background: #0f4c2b; border-color: #10b981; color: #34d399; }
  .posture-btn:hover:not(:disabled) { background: #3b4f6b; }
  .posture-btn:disabled { opacity: 0.4; }

  /* ── Result section ── */
  .result-section { opacity: 0; transition: opacity 0.4s ease; }
  .result-section.visible { opacity: 1; }
  .narrative-box {
    background: #1e293b; border-left: 3px solid #3b82f6;
    padding: 0.75rem 1rem; border-radius: 0.4rem; margin-bottom: 1rem;
    font-size: 0.88rem; line-height: 1.5; color: #cbd5e1;
  }
  .result-themes { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.75rem; }
  .result-theme-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; }
  .theme-name { width: 9rem; color: #94a3b8; }
  .result-bar { flex: 1; height: 8px; background: #334155; border-radius: 4px; overflow: hidden; }
  .result-bar-fill { height: 100%; background: #3b82f6; border-radius: 4px; transition: width 0.6s ease; }
  .theme-after { width: 3rem; text-align: right; color: #93c5fd; font-weight: 600; font-size: 0.78rem; }
  .gain-badge { background: #0f4c2b; color: #34d399; padding: 0.1rem 0.35rem; border-radius: 0.25rem; font-size: 0.72rem; }
  .no-gain { color: #475569; font-size: 0.72rem; }

  .result-unions { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.75rem; }
  .result-union-card {
    padding: 0.5rem 0.75rem; background: #1e293b; border-radius: 0.4rem;
    border: 1px solid #334155;
  }
  .result-union-card.signing { border-color: #10b981; }
  .ruc-header { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 0.2rem; }
  .ruc-weight { color: #64748b; font-size: 0.72rem; }
  .ruc-verdict { margin-left: auto; font-size: 0.8rem; font-weight: 700; }
  .ruc-verdict.yes { color: #34d399; }
  .ruc-sat { font-size: 0.75rem; color: #64748b; }
  .ruc-posture { margin-left: 0.5rem; }

  .signing-weight-box {
    padding: 0.6rem 1rem; background: #1e293b; border-radius: 0.4rem;
    border: 1px solid #334155; display: flex; justify-content: space-between;
    align-items: center; font-size: 0.85rem; margin-bottom: 0.75rem;
  }
  .signing-weight-box.valid { border-color: #10b981; background: #0f2d1f; }

  .next-actions { display: flex; justify-content: flex-end; }
  .next-btn {
    padding: 0.6rem 1.5rem; background: #1e40af; color: #fff;
    border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 700;
    font-size: 0.9rem; transition: background 0.15s;
  }
  .next-btn:hover { background: #2563eb; }

  /* ── Outcome screen ── */
  .outcome-screen {
    text-align: center; padding: 1.5rem 1rem;
    background: #1e293b; border-radius: 0.75rem;
  }
  .outcome-emoji { font-size: 3.5rem; margin-bottom: 0.5rem; }
  .outcome-title { font-size: 1.6rem; font-weight: 900; margin: 0 0 0.25rem 0; }
  .outcome-subtitle { color: #94a3b8; margin: 0 0 1.25rem 0; font-size: 0.9rem; }
  .ended-narrative { background: #0f172a; margin-bottom: 1rem; }

  .outcome-perspectives { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem; }
  .perspective { padding: 0.75rem; border-radius: 0.5rem; text-align: left; }
  .emp-perspective { background: #1e3a5f; }
  .syn-perspective { background: #1f2d1f; }
  .perspective h3 { margin: 0 0 0.4rem 0; font-size: 0.85rem; }
  .perspective p  { margin: 0; font-size: 0.8rem; color: #94a3b8; line-height: 1.4; }

  .final-unions { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 0.75rem; flex-wrap: wrap; }
  .final-union {
    display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem;
    background: #334155; border-radius: 0.4rem; font-size: 0.82rem; border: 1px solid #475569;
  }
  .final-union.signed { border-color: #10b981; background: #0f2d1f; }
  .final-weight { color: #64748b; font-size: 0.72rem; }
  .final-total { width: 100%; text-align: center; font-size: 0.82rem; color: #64748b; margin-top: 0.3rem; }

  .v2-effects { display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: center; margin-bottom: 1rem; }
  .effect-chip { padding: 0.25rem 0.5rem; border-radius: 0.3rem; font-size: 0.72rem; font-weight: 600; }
  .effect-chip.pos { background: #0f4c2b; color: #34d399; }
  .effect-chip.neg { background: #3f1f1f; color: #f87171; }

  .outcome-actions { display: flex; justify-content: center; gap: 0.75rem; margin-bottom: 1rem; }
  .resolve-btn { padding: 0.6rem 1.5rem; background: #10b981; color: #fff; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 700; }
  .restart-btn { padding: 0.6rem 1rem; background: #334155; color: #e2e8f0; border: none; border-radius: 0.5rem; cursor: pointer; }
  .skip-btn { padding: 0.6rem 1rem; background: transparent; color: #64748b; border: 1px solid #334155; border-radius: 0.5rem; cursor: pointer; }

  .history-strip { display: flex; gap: 0.4rem; justify-content: center; flex-wrap: wrap; margin-top: 0.75rem; }
  .history-chip {
    padding: 0.2rem 0.5rem; background: #334155; border-radius: 0.3rem;
    font-size: 0.7rem; color: #94a3b8; border: 1px solid #475569;
  }
  .history-chip.ok { border-color: #10b981; color: #34d399; }

  /* Mobile */
  @media (max-width: 700px) {
    .panels { grid-template-columns: 1fr; }
    .panel-sep { display: none; }
    .outcome-perspectives { grid-template-columns: 1fr; }
    .theme-label { width: 7rem; }
  }
</style>
