<script lang="ts">
  /**
   * Atelier "L'Émeute" — vrai brawler 2D jouable (refonte 2026-05-10).
   *
   * Remontée user : « je voulais un vrai brawler jouable seul comme à 4 ».
   * Avant : BrawlArena.svelte = simulation auto 14s, joueur passif.
   * Maintenant : game loop 60fps, inputs claviers configurables, IA CPU,
   * 4 personnages, modes solo/1v1/2v2/4P FFA.
   *
   * Contrôles par défaut :
   *   P1 (WASD)  : A/D move, W jump, F attack, G special, V dash
   *   P2 (Arrows): ←→ move, ↑ jump, ; attack, ' special, . dash
   *   P3 (IJKL)  : J/L move, I jump, 1 attack, 2 special, 3 dash (numpad)
   *   P4 (8456)  : numpad 4/6 move, 8 jump, 0 attack, , special, 5 dash
   *
   * Pour 4P FFA tu peux aussi connecter 2 contrôleurs USB via mappings
   * navigateur natif (Gamepad API, P3-P4) — pas implémenté dans ce MVP.
   */
  import { onMount, onDestroy } from 'svelte';
  import {
    startMatch,
    step,
    isOver,
    countdownLabel,
    CHARACTERS,
    STAGE_W,
    STAGE_H,
    FLOOR_Y,
    PLAYER_W,
    PLAYER_H,
    PLATFORMS,
    emptyInput,
    type CharId,
    type EmeuteState,
    type PlayerInput,
    type MatchConfig
  } from '../../game/ateliers/emeute/engine';

  interface Props {
    /** Pré-config si appelé depuis un parent (ManifSimulator, etc.) */
    initialConfig?: Partial<MatchConfig>;
    /** Callback à la fin du match. */
    onresolve?: (winnerIndex: number | null, winnerTeam: 0 | 1 | 2 | null) => void;
    /** Mode embedded (overlay sur la scène principale) ou standalone. */
    embedded?: boolean;
  }

  let { initialConfig, onresolve, embedded = false }: Props = $props();

  /* === État du composant === */
  type Mode = 'menu' | 'playing' | 'over';
  let mode = $state<Mode>('menu');
  let gameState = $state<EmeuteState | null>(null);
  let canvas: HTMLCanvasElement | null = $state(null);
  let lastTimestamp = 0;
  let rafId = 0;

  /* === Configuration du match (modifiable depuis le menu) === */
  let nbPlayers = $state<2 | 3 | 4>(initialConfig?.characters?.length as 2|3|4 ?? 2);
  let charSel = $state<CharId[]>([
    initialConfig?.characters?.[0] ?? 'tribun',
    initialConfig?.characters?.[1] ?? 'batisseur',
    initialConfig?.characters?.[2] ?? 'rupture',
    initialConfig?.characters?.[3] ?? 'pragmatique'
  ]);
  let controlSel = $state<('human' | 'cpu')[]>([
    initialConfig?.controls?.[0] ?? 'human',
    initialConfig?.controls?.[1] ?? 'cpu',
    initialConfig?.controls?.[2] ?? 'cpu',
    initialConfig?.controls?.[3] ?? 'cpu'
  ]);
  let teamMode = $state<'ffa' | '2v2'>('ffa');
  let cpuLevel = $state<0 | 1 | 2>(1);
  let stocks = $state(3);

  /* === Inputs claviers — keymap par joueur === */
  type KeyMap = { left: string; right: string; jump: string; attack: string; special: string; dash: string };
  const KEY_MAPS: KeyMap[] = [
    { left: 'KeyA', right: 'KeyD', jump: 'KeyW', attack: 'KeyF', special: 'KeyG', dash: 'KeyV' },
    { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', attack: 'Semicolon', special: 'Quote', dash: 'Period' },
    { left: 'KeyJ', right: 'KeyL', jump: 'KeyI', attack: 'Numpad1', special: 'Numpad2', dash: 'Numpad3' },
    { left: 'Numpad4', right: 'Numpad6', jump: 'Numpad8', attack: 'Numpad0', special: 'NumpadDecimal', dash: 'Numpad5' }
  ];

  /* État live du clavier — mis à jour par les listeners. */
  const keyDown = new Set<string>();
  /* Edge-triggers pour jump/attack/special/dash : on n'envoie l'input
     QU'À LA TRANSITION up→down, sinon le joueur sauterait/attaquerait
     en continu en maintenant la touche. */
  const keyJustPressed = new Set<string>();

  function onKeyDown(e: KeyboardEvent) {
    if (mode !== 'playing') return;
    /* Anti-scroll page sur arrows + space. */
    const code = e.code;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(code)) {
      e.preventDefault();
    }
    if (!keyDown.has(code)) {
      keyJustPressed.add(code);
    }
    keyDown.add(code);
  }
  function onKeyUp(e: KeyboardEvent) {
    keyDown.delete(e.code);
  }

  /* Construit l'input d'un joueur humain à partir de l'état clavier. */
  function readHumanInput(playerIdx: number): PlayerInput {
    const km = KEY_MAPS[playerIdx];
    if (!km) return emptyInput();
    return {
      left: keyDown.has(km.left),
      right: keyDown.has(km.right),
      jump: keyJustPressed.has(km.jump),
      attack: keyJustPressed.has(km.attack),
      special: keyJustPressed.has(km.special),
      dash: keyJustPressed.has(km.dash)
    };
  }

  /* === Game loop === */
  /* Refonte 2026-05-10 : utilisation d'un $effect pour piloter le RAF.
     Avant : le RAF était démarré manuellement après mode='playing' et
     se planifiait lui-même. Bug observé : le tick s'auto-coupait après
     la première frame (probable interaction Svelte 5 $state proxy +
     closure du timestamp). Le $effect démarre le loop quand
     mode='playing' && gameState != null, et le coupe sinon. */
  function runFrame(timestamp: number) {
    if (lastTimestamp === 0) lastTimestamp = timestamp;
    const dtMs = Math.min(40, timestamp - lastTimestamp);
    lastTimestamp = timestamp;

    const cur = gameState;
    if (!cur) return;
    const inputs: PlayerInput[] = [];
    for (let i = 0; i < cur.players.length; i++) {
      inputs.push(
        cur.players[i].control === 'human'
          ? readHumanInput(i)
          : emptyInput()
      );
    }
    gameState = step(cur, inputs, dtMs);
    keyJustPressed.clear();

    if (canvas) draw(canvas);

    if (gameState && isOver(gameState)) {
      mode = 'over';
      onresolve?.(gameState.winnerIndex, gameState.winnerTeam);
    }
  }

  $effect(() => {
    if (mode !== 'playing' || !gameState) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      return;
    }
    /* Démarre / continue le loop. */
    function loop(ts: number) {
      runFrame(ts);
      /* On s'arrête naturellement si mode change : isOver passe mode à
         'over', et le re-run du $effect cancellera ce rafId. Mais
         pour éviter un tick résiduel, on check ici aussi. */
      if (mode === 'playing') {
        rafId = requestAnimationFrame(loop);
      } else {
        rafId = 0;
      }
    }
    rafId = requestAnimationFrame(loop);
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
  });

  /* === Render canvas === */
  function draw(cv: HTMLCanvasElement) {
    const ctx = cv.getContext('2d');
    if (!ctx || !gameState) return;
    /* Background — Place de la République stylisée. */
    const grd = ctx.createLinearGradient(0, 0, 0, STAGE_H);
    grd.addColorStop(0, '#1a1411');
    grd.addColorStop(1, '#0d0908');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);
    /* Grille au sol. */
    ctx.strokeStyle = 'rgba(244, 213, 139, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < STAGE_W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR_Y);
      ctx.lineTo(x, STAGE_H);
      ctx.stroke();
    }
    /* Sol. */
    ctx.fillStyle = '#2a1f17';
    ctx.fillRect(0, FLOOR_Y, STAGE_W, STAGE_H - FLOOR_Y);
    ctx.strokeStyle = 'rgba(244, 213, 139, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(STAGE_W, FLOOR_Y);
    ctx.stroke();
    /* Plateformes. */
    for (const p of PLATFORMS) {
      ctx.fillStyle = '#3a2f25';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = 'rgba(244, 213, 139, 0.4)';
      ctx.strokeRect(p.x, p.y, p.w, p.h);
    }
    /* Marianne stylisée centrale (placeholder décoratif). */
    ctx.fillStyle = 'rgba(244, 213, 139, 0.18)';
    ctx.fillRect(STAGE_W / 2 - 14, FLOOR_Y - 80, 28, 80);
    ctx.beginPath();
    ctx.arc(STAGE_W / 2, FLOOR_Y - 90, 14, 0, Math.PI * 2);
    ctx.fill();

    /* Joueurs. */
    for (const p of gameState.players) {
      if (p.ko) continue;
      const stats = CHARACTERS[p.char];
      /* Hitstun = clignote rouge. */
      const flash = p.hitstunMs > 0 && Math.floor(p.hitstunMs / 60) % 2 === 0;
      ctx.fillStyle = flash ? '#ff6b6b' : stats.color;
      ctx.fillRect(p.x, p.y, PLAYER_W, PLAYER_H);
      /* Outline équipe (2v2). */
      if (p.team !== 0) {
        ctx.strokeStyle = p.team === 1 ? '#7eb4ff' : '#d96a5b';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x - 1, p.y - 1, PLAYER_W + 2, PLAYER_H + 2);
      }
      /* Initiales centrales. */
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.font = 'bold 16px Cinzel, Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stats.short, p.x + PLAYER_W / 2, p.y + 14);
      /* Player number. */
      ctx.fillStyle = 'rgba(244, 213, 139, 0.85)';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`P${p.index + 1}`, p.x + PLAYER_W / 2, p.y - 18);
      /* HP bar au-dessus. */
      const barW = PLAYER_W;
      const hpRatio = Math.max(0, p.hp / p.maxHp);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(p.x, p.y - 10, barW, 4);
      ctx.fillStyle = hpRatio > 0.6 ? '#4ade80' : hpRatio > 0.3 ? '#fbbf24' : '#ef4444';
      ctx.fillRect(p.x, p.y - 10, barW * hpRatio, 4);
      /* Stocks (vies) en petit en bas. */
      ctx.fillStyle = '#f4d58b';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`×${p.stocks}`, p.x + PLAYER_W / 2, p.y + PLAYER_H + 10);
      /* Hitbox visuelle pendant attack (debug-friendly). */
      if (p.attackMs > 0) {
        const hbX = p.facing > 0 ? p.x + PLAYER_W : p.x - 32;
        ctx.fillStyle = 'rgba(244, 213, 139, 0.35)';
        ctx.fillRect(hbX, p.y + 8, 32, 32);
      }
      /* Dash glow trail. */
      if (p.dashMs > 0) {
        ctx.fillStyle = 'rgba(255, 213, 100, 0.25)';
        ctx.fillRect(p.x - p.facing * 18, p.y, PLAYER_W, PLAYER_H);
      }
    }

    /* Countdown. */
    if (gameState.phase === 'countdown') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(0, 0, STAGE_W, STAGE_H);
      ctx.fillStyle = '#f4d58b';
      ctx.font = 'bold 96px Cinzel, Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(countdownLabel(gameState), STAGE_W / 2, STAGE_H / 2);
    }
  }

  /* === Démarrage / arrêt === */
  function startGame() {
    const chars = charSel.slice(0, nbPlayers);
    const ctrls = controlSel.slice(0, nbPlayers);
    const teams: (0 | 1 | 2)[] = teamMode === '2v2' && nbPlayers === 4
      ? [1, 1, 2, 2]
      : new Array(nbPlayers).fill(0);
    const cpuLevels = ctrls.map(c => c === 'cpu' ? cpuLevel : 1) as (0 | 1 | 2)[];
    gameState = startMatch({
      characters: chars,
      controls: ctrls,
      teams,
      cpuLevels,
      stocks
    });
    mode = 'playing';
    lastTimestamp = 0;
    keyDown.clear();
    keyJustPressed.clear();
    /* Le $effect ci-dessus va observer la transition mode→'playing'
       et lancer requestAnimationFrame automatiquement. Pas besoin de
       l'amorcer manuellement (et ne PAS appeler tick — n'existe plus). */
  }

  function backToMenu() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    gameState = null;
    mode = 'menu';
  }

  /* === Lifecycle === */
  onMount(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  });
  onDestroy(() => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    if (rafId) cancelAnimationFrame(rafId);
  });
</script>

<div class="emeute-root" class:embedded>
  {#if mode === 'menu'}
    <div class="menu">
      <h1>L'Émeute · Place de la République</h1>
      <p class="tagline">Brawler 2D · seul ou jusqu'à 4 joueurs locaux</p>

      <section class="opt-row">
        <label class="opt-label">Joueurs</label>
        <div class="seg">
          {#each [2, 3, 4] as n}
            <button type="button" class:active={nbPlayers === n} onclick={() => (nbPlayers = n as 2|3|4)}>
              {n}
            </button>
          {/each}
        </div>
      </section>

      {#if nbPlayers === 4}
        <section class="opt-row">
          <label class="opt-label">Mode</label>
          <div class="seg">
            <button type="button" class:active={teamMode === 'ffa'} onclick={() => (teamMode = 'ffa')}>FFA</button>
            <button type="button" class:active={teamMode === '2v2'} onclick={() => (teamMode = '2v2')}>2v2</button>
          </div>
        </section>
      {/if}

      <section class="opt-row">
        <label class="opt-label">IA</label>
        <div class="seg">
          {#each [['Facile', 0], ['Normal', 1], ['Difficile', 2]] as [lbl, lvl]}
            <button type="button" class:active={cpuLevel === lvl} onclick={() => (cpuLevel = lvl as 0|1|2)}>
              {lbl}
            </button>
          {/each}
        </div>
      </section>

      <section class="opt-row">
        <label class="opt-label">Vies</label>
        <div class="seg">
          {#each [1, 3, 5] as s}
            <button type="button" class:active={stocks === s} onclick={() => (stocks = s)}>
              {s}
            </button>
          {/each}
        </div>
      </section>

      <h2 class="players-title">Combattants</h2>
      <div class="players-grid">
        {#each Array(nbPlayers) as _, i}
          <div class="player-card" style="--col: {CHARACTERS[charSel[i]].color}">
            <header>
              <span class="pn">P{i + 1}</span>
              <select bind:value={controlSel[i]} disabled={i === 0}>
                <option value="human">Humain</option>
                <option value="cpu">IA</option>
              </select>
            </header>
            <div class="char-grid">
              {#each Object.values(CHARACTERS) as c}
                <button
                  type="button"
                  class="char-btn"
                  class:active={charSel[i] === c.id}
                  style="--col: {c.color}"
                  onclick={() => (charSel[i] = c.id)}
                >
                  <span class="char-short">{c.short}</span>
                  <span class="char-label">{c.label}</span>
                </button>
              {/each}
            </div>
            {#if controlSel[i] === 'human'}
              <small class="kbinfo">
                {#if i === 0}WASD + F (jab) · G (special) · V (dash){/if}
                {#if i === 1}Flèches + ; (jab) · ' (special) · . (dash){/if}
                {#if i === 2}IJKL + Numpad 1 / 2 / 3{/if}
                {#if i === 3}Numpad 4/6/8 + 0 (jab) · , (special) · 5 (dash){/if}
              </small>
            {:else}
              <small class="kbinfo cpu">IA niveau {['easy','normal','hard'][cpuLevel]}</small>
            {/if}
          </div>
        {/each}
      </div>

      <button type="button" class="cta-fight" onclick={startGame}>
        Entrer dans la mêlée →
      </button>

      <details class="help-fold">
        <summary>Comment se battre ?</summary>
        <ul>
          <li><b>Déplacer</b> : touches direction, sauter pour éviter et atteindre les plateformes</li>
          <li><b>Frapper</b> : touche jab quand l'adversaire est à portée (hitbox 32×32 devant toi)</li>
          <li><b>Spécial</b> : grand coup à dégâts ×2, cooldown 4-6s selon le perso</li>
          <li><b>Dash</b> : burst de vitesse 0.24s, cooldown 1.2s — pour s'engager ou fuir</li>
          <li><b>KO</b> : si tu sors de la map (chute en dessous, mur lateral), tu perds 1 vie. Si tu n'as plus de vies, tu es éliminé.</li>
          <li><b>Knockback</b> : plus tu es blessé, plus tu voles loin (calibrage Smash). Un dégât à 100 hp envoie peu, à 10 hp envoie loin.</li>
        </ul>
      </details>
    </div>
  {:else if mode === 'playing' || mode === 'over'}
    <canvas
      bind:this={canvas}
      width={STAGE_W}
      height={STAGE_H}
      tabindex="0"
    ></canvas>
    {#if mode === 'over' && gameState}
      <div class="over-overlay">
        <h2>
          {#if gameState.winnerTeam !== null && gameState.winnerTeam !== 0}
            Équipe {gameState.winnerTeam === 1 ? 'Bleue' : 'Rouge'} l'emporte !
          {:else if gameState.winnerIndex !== null}
            P{gameState.winnerIndex + 1} ({CHARACTERS[gameState.players[gameState.winnerIndex].char].label}) l'emporte !
          {:else}
            Match nul
          {/if}
        </h2>
        <div class="kos-recap">
          {#each gameState.players as p}
            <div class="ko-line">
              <span style="color: {CHARACTERS[p.char].color}">P{p.index + 1} {CHARACTERS[p.char].short}</span>
              <span>{p.kos} KO · {p.stocks} vie{p.stocks > 1 ? 's' : ''}</span>
            </div>
          {/each}
        </div>
        <div class="over-btns">
          <button type="button" onclick={startGame}>Rejouer</button>
          <button type="button" class="ghost" onclick={backToMenu}>Menu</button>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .emeute-root {
    background: #080606;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ede4c9;
    font-family: 'Source Serif 4', Georgia, serif;
    padding: 1rem;
    position: relative;
  }
  .emeute-root.embedded {
    position: fixed;
    inset: 0;
    z-index: 900;
    background: rgba(8, 6, 6, 0.96);
  }

  canvas {
    border: 2px solid rgba(244, 213, 139, 0.4);
    border-radius: 6px;
    background: #0d0908;
    image-rendering: pixelated;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.6);
    max-width: 100%;
    height: auto;
  }

  /* ==== Menu ==== */
  .menu {
    max-width: 900px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }
  .menu h1 {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.8rem;
    color: #f4d58b;
    margin: 0;
    letter-spacing: 0.04em;
  }
  .tagline {
    color: rgba(237, 228, 201, 0.65);
    font-style: italic;
    margin: 0 0 0.5rem;
    font-size: 0.95rem;
  }
  .opt-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .opt-label {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #c9b26a;
    min-width: 90px;
  }
  .seg {
    display: inline-flex;
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.4rem;
    overflow: hidden;
  }
  .seg button {
    background: transparent;
    border: none;
    color: rgba(237, 228, 201, 0.7);
    padding: 0.4rem 0.9rem;
    font-family: inherit;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.15s;
    border-right: 1px solid rgba(237, 228, 201, 0.1);
  }
  .seg button:last-child { border-right: 0; }
  .seg button:hover { color: #f4d58b; background: rgba(244, 213, 139, 0.06); }
  .seg button.active {
    background: rgba(244, 213, 139, 0.15);
    color: #f4d58b;
  }

  .players-title {
    margin: 0.6rem 0 0.2rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #c9b26a;
  }
  .players-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.5rem;
  }
  .player-card {
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-left: 3px solid var(--col, #c9b26a);
    border-radius: 0.5rem;
    padding: 0.6rem 0.7rem;
    background: rgba(13, 9, 8, 0.6);
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .player-card header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .pn {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.95rem;
    color: var(--col, #f4d58b);
    font-weight: 700;
  }
  .player-card select {
    background: rgba(13, 9, 8, 0.9);
    color: #ede4c9;
    border: 1px solid rgba(237, 228, 201, 0.2);
    border-radius: 0.3rem;
    padding: 0.2rem 0.4rem;
    font-size: 0.78rem;
    cursor: pointer;
  }
  .player-card select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .char-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.3rem;
  }
  .char-btn {
    background: rgba(13, 9, 8, 0.7);
    border: 1px solid rgba(237, 228, 201, 0.14);
    border-radius: 0.35rem;
    padding: 0.35rem 0.4rem;
    color: rgba(237, 228, 201, 0.7);
    font-family: inherit;
    font-size: 0.72rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.15s;
  }
  .char-btn:hover {
    border-color: var(--col);
    color: var(--col);
  }
  .char-btn.active {
    border-color: var(--col);
    background: color-mix(in srgb, var(--col) 18%, transparent);
    color: var(--col);
  }
  .char-short {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    background: var(--col);
    color: #0d0908;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    flex-shrink: 0;
  }
  .kbinfo {
    color: rgba(237, 228, 201, 0.55);
    font-family: 'Source Code Pro', monospace;
    font-size: 0.65rem;
    line-height: 1.3;
  }
  .kbinfo.cpu {
    color: #c9b26a;
  }

  .cta-fight {
    margin-top: 0.6rem;
    background: linear-gradient(135deg, #c89b3c, #d96a5b);
    border: none;
    color: #0d0908;
    padding: 0.85rem 1.5rem;
    border-radius: 0.5rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .cta-fight:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(217, 106, 91, 0.3);
  }

  .help-fold {
    margin-top: 0.5rem;
    border: 1px dashed rgba(237, 228, 201, 0.18);
    border-radius: 0.4rem;
    padding: 0.5rem 0.75rem;
  }
  .help-fold summary {
    cursor: pointer;
    color: #c9b26a;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.8rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .help-fold ul {
    margin: 0.5rem 0 0;
    padding-left: 1.2rem;
    font-size: 0.82rem;
    line-height: 1.5;
    color: rgba(237, 228, 201, 0.78);
  }
  .help-fold li { margin-bottom: 0.3rem; }
  .help-fold b { color: #f4d58b; }

  /* ==== Game over overlay ==== */
  .over-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(13, 9, 8, 0.92);
    border: 2px solid #c9b26a;
    border-radius: 0.6rem;
    padding: 1.5rem 2rem;
    text-align: center;
    box-shadow: 0 0 60px rgba(0, 0, 0, 0.7);
  }
  .over-overlay h2 {
    margin: 0 0 1rem;
    font-family: 'Cinzel', Georgia, serif;
    color: #f4d58b;
    font-size: 1.4rem;
  }
  .kos-recap {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-bottom: 1rem;
    font-family: 'Source Code Pro', monospace;
    font-size: 0.85rem;
  }
  .ko-line {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    color: #ede4c9;
  }
  .over-btns {
    display: flex;
    gap: 0.6rem;
    justify-content: center;
  }
  .over-btns button {
    background: #c89b3c;
    border: none;
    color: #0d0908;
    padding: 0.5rem 1.2rem;
    border-radius: 0.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s;
  }
  .over-btns button:hover { background: #d4a020; }
  .over-btns button.ghost {
    background: transparent;
    border: 1px solid rgba(237, 228, 201, 0.3);
    color: rgba(237, 228, 201, 0.85);
  }
  .over-btns button.ghost:hover {
    border-color: #f4d58b;
    color: #f4d58b;
  }
</style>
