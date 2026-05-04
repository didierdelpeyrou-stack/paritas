<script lang="ts">
  /* ============================================================
     BrawlArena — simulation temps-réel Place de la République
     ============================================================
     Port du build Phaser 3 dans canvas Svelte natif. Pack-based
     simulation avec animation continue rAF, HP bars, projectiles,
     supers automatiques, et bouton « Rallier » pour interaction
     joueur pendant le combat.

     Reste compatible avec resolveBrawl() : utilise l'outcome comme
     « cible » et interpole l'animation pour matcher les pertes
     prévues, tout en restant visuellement vivant.
     ============================================================ */
  import { fade, fly } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  import {
    BRAWLER_CATALOG,
    type FactionRoster,
    type BrawlOutcome,
    type BrawlerType,
    type Brawler
  } from '../../game/org/factionBrawl';

  interface Props {
    joueur: FactionRoster;
    adversaire: FactionRoster;
    outcome: BrawlOutcome;
    /** Reçoit le nombre de rallies effectivement déclenchés par le joueur,
     *  pour que ManifSimulator applique les bonus narratifs correspondants
     *  (cohésion, rapport de force). Le rally accélère le combat ET marque
     *  la rue : effet réel, pas cosmétique. */
    onClose: (rallyCount: number) => void;
  }
  let { joueur, adversaire, outcome, onClose }: Props = $props();

  /* ====== Etat de la simulation ====== */
  interface PackSim {
    type: BrawlerType;
    side: 'left' | 'right';
    initialCount: number;
    /** Compte courant (peut être fractionnaire pendant interpolation). */
    count: number;
    /** HP total restant (interpolé). */
    hp: number;
    initialHp: number;
    /** Position simulée (le pack avance vers le centre). */
    x: number;
    y: number;
    targetX: number;
    /** Cooldown super en cours (ms restants). */
    superCooldown: number;
    /** Telegraph super actif pendant 800ms après déclenchement. */
    superTelegraph: number;
  }

  let canvas: HTMLCanvasElement | null = $state(null);
  let packs = $state<PackSim[]>([]);
  let particles = $state<Array<{
    x: number; y: number; vx: number; vy: number;
    life: number; maxLife: number; color: string; kind: 'hit' | 'projectile';
    targetX?: number; targetY?: number;
  }>>([]);
  let elapsed = $state(0);            // ms écoulées dans la sim
  let phase = $state<'fight' | 'resolved'>('fight');
  let rallyCooldown = $state(0);      // ms avant prochain rally
  let rallyActive = $state(0);        // ms restants de boost
  let rallyCount = $state(0);         // nb de rallies effectivement déclenchés (pour bonus narratif)
  let lastTimestamp = 0;
  let rafId = 0;

  const ARENA_W = 360;
  const ARENA_H = 220;
  /* Durée + cooldown calibrés pour permettre 3 rallies effectifs
     (t=0, t=6.5, t=13). Argus P1.b 2026-05-04 — sinon l'agency est
     plafonnée à 2 clics et le rally reste cosmétique-plus. */
  const TOTAL_DURATION = 14000;
  const RALLY_COOLDOWN_MS = 6500;
  const RALLY_DURATION_MS = 3000;
  /* Cap visuel + cap effets pour éviter le spam si un futur dev
     baisse le cooldown. Argus P1.c. */
  const RALLY_BONUS_CAP = 3;

  /* ====== Initialisation ====== */
  function initPacks() {
    const list: PackSim[] = [];
    /* Côté joueur (gauche) */
    const jBrawlers = Object.entries(joueur.brawlers) as [BrawlerType, number][];
    jBrawlers.forEach(([type, count], i) => {
      if (!count) return;
      const meta = BRAWLER_CATALOG[type];
      const yOffset = (i - (jBrawlers.length - 1) / 2) * 36;
      list.push({
        type, side: 'left',
        initialCount: count, count,
        hp: count * meta.hp,
        initialHp: count * meta.hp,
        x: 40, y: ARENA_H * 0.55 + yOffset,
        targetX: ARENA_W * 0.38,
        superCooldown: meta.superCooldown * 0.4 + Math.random() * meta.superCooldown * 0.4,
        superTelegraph: 0
      });
    });
    /* Côté adversaire (droite) */
    const aBrawlers = Object.entries(adversaire.brawlers) as [BrawlerType, number][];
    aBrawlers.forEach(([type, count], i) => {
      if (!count) return;
      const meta = BRAWLER_CATALOG[type];
      const yOffset = (i - (aBrawlers.length - 1) / 2) * 36;
      list.push({
        type, side: 'right',
        initialCount: count, count,
        hp: count * meta.hp,
        initialHp: count * meta.hp,
        x: ARENA_W - 40, y: ARENA_H * 0.55 + yOffset,
        targetX: ARENA_W * 0.62,
        superCooldown: meta.superCooldown * 0.4 + Math.random() * meta.superCooldown * 0.4,
        superTelegraph: 0
      });
    });
    return list;
  }

  /* ====== Boucle de simulation ====== */
  function tick(timestamp: number) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = Math.min(50, timestamp - lastTimestamp);  // clamp à 50ms
    lastTimestamp = timestamp;

    if (phase === 'fight') {
      elapsed += dt;
      simulate(dt);

      if (elapsed >= TOTAL_DURATION) {
        phase = 'resolved';
        /* Force l'état final pour matcher l'outcome déterministe. */
        applyFinalOutcome();
      }
    }

    /* Cooldowns rally + actif */
    if (rallyCooldown > 0) rallyCooldown = Math.max(0, rallyCooldown - dt);
    if (rallyActive > 0) rallyActive = Math.max(0, rallyActive - dt);

    /* Particules */
    particles = particles.map(p => ({
      ...p,
      x: p.x + p.vx * (dt / 16.67),
      y: p.y + p.vy * (dt / 16.67),
      life: p.life - dt
    })).filter(p => p.life > 0);

    if (canvas) draw(canvas);
    rafId = requestAnimationFrame(tick);
  }

  function simulate(dt: number) {
    /* Cible totale : appliquer ~outcome.totalLosses sur la durée totale.
       Progress 0..1 selon elapsed/total. */
    const progress = Math.min(1, elapsed / TOTAL_DURATION);
    /* Courbe douce avec accélération au milieu. */
    const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);

    const targetJLossRatio = easedProgress * (outcome.totalJoueurLosses / Math.max(1, joueur.total));
    const targetALossRatio = easedProgress * (outcome.totalAdversaireLosses / Math.max(1, adversaire.total));

    /* Boost rally : multiplie la perte adverse pendant le rally. */
    const rallyMul = rallyActive > 0 ? 1.4 : 1;

    /* Move + simulate damage by side. */
    for (const pack of packs) {
      const meta = BRAWLER_CATALOG[pack.type];

      /* Mouvement vers targetX (avancée + recul léger). */
      const speedFactor = 0.0006 * meta.speed * (rallyActive > 0 && pack.side === 'left' ? 1.25 : 1);
      const dx = pack.targetX - pack.x;
      pack.x += dx * speedFactor * dt;

      /* Légère oscillation Y pour donner vie. */
      const baseY = ARENA_H * 0.55 + (packs.indexOf(pack) - (packs.length - 1) / 2) * 0.5;
      pack.y += (baseY - pack.y) * 0.05;
      pack.y += Math.sin((elapsed + pack.x * 7) / 200) * 0.15;

      /* Attaques : génère des particules */
      if (Math.random() < dt / meta.cooldown * 0.5) {
        spawnAttackEffect(pack);
      }

      /* Cooldown super */
      pack.superCooldown -= dt;
      pack.superTelegraph = Math.max(0, pack.superTelegraph - dt);
      if (pack.superCooldown <= 0) {
        triggerSuper(pack);
        pack.superCooldown = meta.superCooldown;
      }

      /* Apply target loss */
      if (pack.side === 'left') {
        const targetCount = Math.max(0, pack.initialCount * (1 - targetJLossRatio));
        pack.count = pack.count + (targetCount - pack.count) * 0.05;
      } else {
        const targetCount = Math.max(0, pack.initialCount * (1 - targetALossRatio * rallyMul));
        pack.count = pack.count + (targetCount - pack.count) * 0.05;
      }
      pack.hp = pack.count * meta.hp;
    }
  }

  function spawnAttackEffect(pack: PackSim) {
    const meta = BRAWLER_CATALOG[pack.type];
    /* Cible : pack ennemi le plus proche en X. */
    const enemies = packs.filter(p => p.side !== pack.side && p.count > 0.5);
    if (!enemies.length) return;
    const target = enemies.reduce((best, e) =>
      Math.abs(e.x - pack.x) < Math.abs(best.x - pack.x) ? e : best, enemies[0]);
    const dx = target.x - pack.x;
    const dy = target.y - pack.y;
    const dist = Math.hypot(dx, dy);

    if (meta.attackKind === 'projectile') {
      particles = [...particles, {
        x: pack.x, y: pack.y,
        vx: (dx / dist) * 4,
        vy: (dy / dist) * 4,
        life: 600, maxLife: 600,
        color: meta.color, kind: 'projectile',
        targetX: target.x, targetY: target.y
      }];
    } else if (meta.attackKind === 'thrown_arc') {
      /* Particle arc — vélocité avec gravité simulée */
      particles = [...particles, {
        x: pack.x, y: pack.y,
        vx: (dx / dist) * 3,
        vy: -2.5 + (dy / dist) * 2,
        life: 800, maxLife: 800,
        color: meta.color, kind: 'projectile',
        targetX: target.x, targetY: target.y
      }];
    } else {
      /* Mêlée : impact direct au centre de l'ennemi */
      particles = [...particles, {
        x: target.x + (Math.random() - 0.5) * 10,
        y: target.y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 3,
        vy: -1 - Math.random() * 2,
        life: 400, maxLife: 400,
        color: meta.color, kind: 'hit'
      }];
    }
  }

  function triggerSuper(pack: PackSim) {
    pack.superTelegraph = 800;
    const meta = BRAWLER_CATALOG[pack.type];
    /* Effet visuel : burst de particules */
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      particles = [...particles, {
        x: pack.x, y: pack.y,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        life: 700, maxLife: 700,
        color: meta.color, kind: 'hit'
      }];
    }
  }

  function applyFinalOutcome() {
    /* Snap les counts à l'outcome déterministe. */
    const jLossRatio = outcome.totalJoueurLosses / Math.max(1, joueur.total);
    const aLossRatio = outcome.totalAdversaireLosses / Math.max(1, adversaire.total);
    for (const pack of packs) {
      const ratio = pack.side === 'left' ? jLossRatio : aLossRatio;
      pack.count = Math.max(0, pack.initialCount * (1 - ratio));
      const meta = BRAWLER_CATALOG[pack.type];
      pack.hp = pack.count * meta.hp;
    }
  }

  function rally() {
    if (rallyCooldown > 0 || phase !== 'fight') return;
    rallyCooldown = RALLY_COOLDOWN_MS;
    rallyActive = RALLY_DURATION_MS;
    rallyCount += 1;
    /* Burst doré sur tous les packs joueur */
    for (const pack of packs.filter(p => p.side === 'left')) {
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        particles = [...particles, {
          x: pack.x, y: pack.y,
          vx: Math.cos(angle) * 2,
          vy: Math.sin(angle) * 2 - 1,
          life: 600, maxLife: 600,
          color: '#F4D58C', kind: 'hit'
        }];
      }
    }
  }

  /* ====== Rendu canvas ====== */
  function draw(cv: HTMLCanvasElement) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    /* Resync buffer avec la taille CSS réelle (responsive + dpr).
       La sim travaille en coords logiques ARENA_W × ARENA_H ; on
       applique une transformation pour que le draw remplisse le
       buffer quelle que soit sa taille. Évite l'étirement flou et
       les packs hors champ sur mobile (audit Argus 2026-05-04). */
    const dpr = window.devicePixelRatio || 1;
    const cssW = Math.max(1, cv.clientWidth);
    const cssH = Math.max(1, cv.clientHeight);
    const targetW = Math.round(cssW * dpr);
    const targetH = Math.round(cssH * dpr);
    if (cv.width !== targetW) cv.width = targetW;
    if (cv.height !== targetH) cv.height = targetH;
    ctx.setTransform(cv.width / ARENA_W, 0, 0, cv.height / ARENA_H, 0, 0);
    const W = ARENA_W;
    const H = ARENA_H;

    /* Background nuit + halo */
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1F1813');
    bg.addColorStop(1, '#0a0807');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* Halo central — réverbère */
    const halo = ctx.createRadialGradient(W/2, H*0.5, 20, W/2, H*0.5, W*0.6);
    halo.addColorStop(0, rallyActive > 0 ? 'rgba(244, 213, 140, 0.18)' : 'rgba(244, 213, 140, 0.10)');
    halo.addColorStop(1, 'transparent');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);

    /* Pavés */
    ctx.strokeStyle = 'rgba(201, 178, 106, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 24) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (let x = 0; x < W; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    /* Façades */
    ctx.fillStyle = '#2A1A0E';
    ctx.fillRect(0, 0, W, 28);
    ctx.fillStyle = '#3D2615';
    for (let x = 8; x < W - 8; x += 22) {
      ctx.fillRect(x, 4, 14, 20);
    }

    /* Marianne */
    drawStatue(ctx, W/2, H*0.4);

    /* Particules — derrière les packs si projectiles */
    drawParticles(ctx);

    /* Packs */
    for (const pack of packs) drawPack(ctx, pack);

    /* HP bars par camp */
    drawFactionHpBar(ctx, 'left', W, H);
    drawFactionHpBar(ctx, 'right', W, H);

    /* Indicateurs */
    drawTimer(ctx, W);
    /* Bannière résultat = overlay HTML sur le canvas (Argus P1.a). */
  }

  function drawStatue(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.fillStyle = '#3D2615';
    ctx.fillRect(cx - 14, cy + 18, 28, 12);
    ctx.fillStyle = '#5A2F1C';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 6, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - 12, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8B1F1B';
    ctx.beginPath();
    ctx.moveTo(cx - 4.5, cy - 14);
    ctx.lineTo(cx + 4.5, cy - 14);
    ctx.lineTo(cx + 3, cy - 19);
    ctx.lineTo(cx - 3, cy - 19);
    ctx.closePath();
    ctx.fill();
    /* Drapeau tricolore */
    ctx.fillStyle = '#1E5C8A'; ctx.fillRect(cx + 9, cy - 22, 3, 6);
    ctx.fillStyle = '#F4EFE2'; ctx.fillRect(cx + 12, cy - 22, 3, 6);
    ctx.fillStyle = '#B0181E'; ctx.fillRect(cx + 15, cy - 22, 3, 6);
  }

  function drawPack(ctx: CanvasRenderingContext2D, pack: PackSim) {
    if (pack.count < 0.5) {
      /* Pack décimé : croix grise */
      ctx.strokeStyle = 'rgba(244, 239, 226, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(pack.x - 8, pack.y - 8); ctx.lineTo(pack.x + 8, pack.y + 8);
      ctx.moveTo(pack.x + 8, pack.y - 8); ctx.lineTo(pack.x - 8, pack.y + 8);
      ctx.stroke();
      return;
    }
    const meta = BRAWLER_CATALOG[pack.type];
    const r = Math.min(22, 7 + Math.log2(pack.count + 1) * 2.2);

    /* Telegraph super (anneau pulse) */
    if (pack.superTelegraph > 0) {
      const pulse = 1 + (1 - pack.superTelegraph / 800) * 0.8;
      ctx.strokeStyle = '#F4D58C';
      ctx.lineWidth = 2;
      ctx.globalAlpha = pack.superTelegraph / 800;
      ctx.beginPath();
      ctx.arc(pack.x, pack.y, r * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    /* Halo */
    ctx.fillStyle = meta.color + '33';
    ctx.beginPath();
    ctx.arc(pack.x, pack.y, r + 4, 0, Math.PI * 2);
    ctx.fill();

    /* Disque */
    ctx.fillStyle = meta.color;
    ctx.strokeStyle = meta.colorDark;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(pack.x, pack.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    /* Glyph */
    ctx.fillStyle = '#F4EFE2';
    ctx.font = `bold ${Math.round(r * 0.95)}px "Cinzel", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(meta.glyph, pack.x, pack.y + 1);

    /* HP bar pack (étroite) */
    const barW = r * 1.8;
    const barH = 2.5;
    const hpRatio = pack.hp / Math.max(1, pack.initialHp);
    ctx.fillStyle = 'rgba(13, 11, 8, 0.7)';
    ctx.fillRect(pack.x - barW/2, pack.y - r - 6, barW, barH);
    ctx.fillStyle = hpRatio > 0.5 ? '#7BCBA1' : hpRatio > 0.25 ? '#F0B870' : '#E08F92';
    ctx.fillRect(pack.x - barW/2, pack.y - r - 6, barW * hpRatio, barH);

    /* Compteur */
    ctx.fillStyle = 'rgba(244, 239, 226, 0.85)';
    ctx.font = 'bold 11px "Courier Prime", monospace';
    ctx.textBaseline = 'top';
    ctx.fillText(String(Math.round(pack.count)), pack.x, pack.y + r + 3);
  }

  function drawParticles(ctx: CanvasRenderingContext2D) {
    for (const p of particles) {
      const a = p.life / p.maxLife;
      ctx.globalAlpha = a;
      if (p.kind === 'projectile') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        /* Traînée */
        ctx.strokeStyle = p.color + '88';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 4, p.y - p.vy * 4);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else {
        /* Hit : petite étoile/cross */
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawFactionHpBar(ctx: CanvasRenderingContext2D, side: 'left' | 'right', W: number, H: number) {
    const sidePacks = packs.filter(p => p.side === side);
    const totalHp = sidePacks.reduce((s, p) => s + p.hp, 0);
    const initialHp = sidePacks.reduce((s, p) => s + p.initialHp, 0);
    const ratio = initialHp > 0 ? totalHp / initialHp : 0;
    /* Label faction sorti du canvas → overlay HTML (Argus P1.a). */

    /* Bar */
    const barX = side === 'left' ? 8 : W - 100 - 8;
    const barY = H - 14;
    const barW = 100;
    ctx.fillStyle = 'rgba(13, 11, 8, 0.7)';
    ctx.fillRect(barX, barY, barW, 5);
    ctx.fillStyle = ratio > 0.5 ? '#7BCBA1' : ratio > 0.25 ? '#F0B870' : '#E08F92';
    ctx.fillRect(barX, barY, barW * ratio, 5);
    ctx.strokeStyle = 'rgba(201, 178, 106, 0.4)';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(barX, barY, barW, 5);
  }

  function drawTimer(ctx: CanvasRenderingContext2D, W: number) {
    if (phase === 'resolved') return;
    const ratio = elapsed / TOTAL_DURATION;
    ctx.fillStyle = 'rgba(13, 11, 8, 0.6)';
    ctx.fillRect(W/2 - 50, 38, 100, 3);
    ctx.fillStyle = '#C9B26A';
    ctx.fillRect(W/2 - 50, 38, 100 * ratio, 3);
  }

  /* drawResultBanner supprimé — bannière résultat affichée en HTML
     overlay sur le canvas (Argus P1.a, lisibilité mobile). */

  /* ====== Lifecycle ====== */
  onMount(() => {
    packs = initPacks();
    rafId = requestAnimationFrame(tick);
  });

  onDestroy(() => {
    if (rafId) cancelAnimationFrame(rafId);
  });
</script>

<div class="brawl-backdrop" in:fade={{ duration: 240 }} role="presentation"></div>

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<aside class="brawl-arena"
  in:fly={{ y: 18, duration: 320 }}
  role="dialog"
  tabindex="-1"
  aria-modal="true"
  aria-labelledby="brawl-title"
>
  <header class="arena-head">
    <span class="arena-tag">Place de la République</span>
    <h2 id="brawl-title">Affrontement</h2>
    <p class="arena-sub">{joueur.label} vs {adversaire.label}</p>
  </header>

  <div class="arena-body">
    <div class="canvas-wrap">
      <canvas
        bind:this={canvas}
        width={ARENA_W}
        height={ARENA_H}
        class="arena-canvas"
        aria-label="Combat à Place de la République en temps réel"
      ></canvas>

      <!-- Overlays HTML : labels factions + bannière résultat
           (Argus P1.a — sortis du canvas pour rester lisibles
            quand le canvas se rétrécit sur Carnet). -->
      <div class="faction-label faction-label-left">{joueur.label}</div>
      <div class="faction-label faction-label-right">{adversaire.label}</div>
      {#if phase === 'resolved'}
        <div class="result-banner result-banner-{outcome.result}" in:fade={{ duration: 280 }}>
          {outcome.result === 'victoire' ? '✓ VICTOIRE' : outcome.result === 'defaite' ? '✗ DÉFAITE' : '— NUL —'}
        </div>
      {/if}

      <!-- Bouton Rallier (interaction joueur) -->
      <button type="button"
        class="rally-btn"
        class:active={rallyActive > 0}
        class:cooling={rallyCooldown > 0 && rallyActive === 0}
        disabled={rallyCooldown > 0 || phase === 'resolved'}
        onclick={rally}
        title={rallyActive > 0 ? 'Boost actif' : rallyCooldown > 0 ? `Disponible dans ${(rallyCooldown / 1000).toFixed(1)}s` : 'Rallie tes troupes (boost 3s)'}
      >
        {#if rallyActive > 0}
          ✊ Boost {(rallyActive / 1000).toFixed(1)}s
        {:else if rallyCooldown > 0}
          ⏱ {(rallyCooldown / 1000).toFixed(1)}s
        {:else}
          ✊ Rallier !
        {/if}
      </button>
    </div>

    <div class="arena-narrative">
      <h3>Brawlers en présence</h3>
      <ul class="rosters">
        {#each Object.entries(joueur.brawlers) as [type, n]}
          {#if n}
            {@const meta = BRAWLER_CATALOG[type as BrawlerType]}
            <li class="roster-row" style:--c={meta.color}>
              <span class="roster-glyph">{meta.glyph}</span>
              <span class="roster-name">{meta.label}</span>
              <span class="roster-count">×{n}</span>
            </li>
          {/if}
        {/each}
      </ul>

      {#if phase === 'resolved'}
        <p class="final-line" in:fade={{ duration: 320 }}>
          {outcome.finalNarrative}
        </p>
        <div class="effects-block" in:fade={{ duration: 320, delay: 200 }}>
          <span class="effects-tag">Conséquences :</span>
          <ul class="effects-list">
            {#each Object.entries(outcome.effects) as [k, v]}
              {#if typeof v === 'number' && v !== 0}
                <li class={v > 0 ? 'pos' : 'neg'}>
                  {labelForResource(k)} {v > 0 ? '+' : ''}{v}
                </li>
              {/if}
            {/each}
            {#if rallyCount > 0}
              {@const cappedRallies = Math.min(RALLY_BONUS_CAP, rallyCount)}
              <li class="pos rally-bonus">
                Rallies × {rallyCount} → +{cappedRallies * 3} rapport de force, +{cappedRallies * 2} cohésion
              </li>
            {/if}
          </ul>
        </div>
      {:else}
        <p class="hint-line">
          Le sort de la mêlée est déjà joué — tes forces et celles d'en face
          étaient comptées avant le premier coup. Mais <strong>« Rallier »</strong>
          marque la rue : chaque appel rythme l'avancée
          (+25% vitesse, +40% dégâts pendant 3 s) et,
          surtout, soude la cohésion du cortège.
          {#if rallyCount > 0}
            <em class="rally-tally">Rallies déjà lancés : {rallyCount}</em>
          {/if}
        </p>
      {/if}
    </div>
  </div>

  <footer class="arena-foot">
    <button type="button" class="close-btn"
      onclick={() => onClose(rallyCount)}
      disabled={phase !== 'resolved'}
      title={phase !== 'resolved' ? 'Attends la fin du combat' : 'Refermer l\'arène'}>
      {phase !== 'resolved' ? 'Combat en cours…' : 'Refermer l\'arène'}
    </button>
  </footer>
</aside>

<script module lang="ts">
  function labelForResource(k: string): string {
    const map: Record<string, string> = {
      rapportDeForce: 'Force externe',
      confiance: 'Confiance',
      cohesionInterne: 'Cohésion',
      legitimite: 'Légitimité',
      santeSociale: 'Santé sociale',
      caisse: 'Caisse'
    };
    return map[k] ?? k;
  }
</script>

<style>
  .brawl-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(13, 16, 20, 0.86);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 100;
  }

  .brawl-arena {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 101;
    width: min(740px, calc(100vw - 2rem));
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    background: linear-gradient(180deg, #2A1A0E 0%, #1A1108 100%);
    border: 1px solid #C9B26A;
    border-radius: 0.6rem;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7);
    color: #F4EFE2;
    padding: 1.2rem 1.4rem 1rem;
    font-family: 'Source Serif 4', Georgia, serif;
  }

  .arena-head {
    border-bottom: 1px solid rgba(201, 178, 106, 0.25);
    padding-bottom: 0.7rem;
    margin-bottom: 0.85rem;
  }
  .arena-tag {
    display: inline-block;
    padding: 0.1rem 0.55rem;
    background: rgba(176, 24, 30, 0.16);
    border: 1px solid rgba(176, 24, 30, 0.5);
    border-radius: 999px;
    color: #E08F92;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.45rem;
  }
  .arena-head h2 {
    margin: 0 0 0.2rem 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.4rem;
    color: #F4D58C;
    letter-spacing: 0.04em;
  }
  .arena-sub {
    margin: 0;
    color: rgba(244, 239, 226, 0.75);
    font-style: italic;
    font-size: 0.85rem;
  }

  .arena-body {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }

  .canvas-wrap {
    position: relative;
    width: 360px;
    max-width: 100%;
  }

  .arena-canvas {
    border: 1px solid rgba(201, 178, 106, 0.35);
    border-radius: 0.4rem;
    background: #1F1813;
    width: 100%;
    height: auto;
    /* Pas d'aspect-ratio CSS : on s'appuie sur les attributs HTML
       width="360" height="220" du canvas (cf. <canvas> + <img>),
       comportement universel sans risque de quirk Safari iOS. */
    display: block;
  }

  /* Labels faction (HTML overlay sur le canvas — Argus P1.a). */
  .faction-label {
    position: absolute;
    bottom: calc(14 / 220 * 100% + 0.45rem);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    pointer-events: none;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  }
  .faction-label-left {
    left: 0.5rem;
    color: #E08F92;
  }
  .faction-label-right {
    right: 0.5rem;
    color: #7DB1D8;
  }

  /* Bannière résultat (HTML overlay — Argus P1.a). */
  .result-banner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0.45rem 1.1rem;
    background: rgba(13, 11, 8, 0.88);
    border: 1.5px solid;
    border-radius: 0.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    pointer-events: none;
    white-space: nowrap;
  }
  .result-banner-victoire {
    color: #7BCBA1;
    border-color: #7BCBA1;
  }
  .result-banner-defaite {
    color: #E08F92;
    border-color: #E08F92;
  }
  .result-banner-nul {
    color: #C9B26A;
    border-color: #C9B26A;
  }

  .rally-btn {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.4rem 0.9rem;
    background: linear-gradient(180deg, #c89b3c 0%, #a87a26 100%);
    color: #0d1014;
    border: 1px solid #c89b3c;
    border-radius: 999px;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    transition: filter 0.18s ease, transform 0.12s ease;
  }
  .rally-btn:hover:not(:disabled) {
    filter: brightness(1.15);
    transform: translateX(-50%) translateY(-2px);
  }
  .rally-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  .rally-btn.active {
    background: linear-gradient(180deg, #F4D58C 0%, #C9B26A 100%);
    box-shadow: 0 0 16px rgba(244, 213, 140, 0.55);
    animation: rally-pulse 0.8s ease-in-out infinite;
  }
  .rally-btn.cooling {
    background: linear-gradient(180deg, #4A3322 0%, #2A1A0E 100%);
    color: rgba(244, 213, 140, 0.65);
    border-color: rgba(201, 178, 106, 0.4);
  }
  @keyframes rally-pulse {
    0%, 100% { box-shadow: 0 0 16px rgba(244, 213, 140, 0.55); }
    50% { box-shadow: 0 0 24px rgba(244, 213, 140, 0.85); }
  }

  .arena-narrative {
    min-width: 0;
  }
  .arena-narrative h3 {
    margin: 0 0 0.45rem 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #C9B26A;
  }

  .rosters {
    list-style: none;
    margin: 0 0 0.75rem 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .roster-row {
    --c: #C9B26A;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.45rem;
    padding: 0.25rem 0.5rem;
    background: rgba(13, 11, 8, 0.4);
    border-left: 2px solid var(--c);
    border-radius: 0.25rem;
    font-size: 0.78rem;
  }
  .roster-glyph {
    color: var(--c);
    font-size: 0.95rem;
    line-height: 1;
  }
  .roster-name {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    color: rgba(244, 239, 226, 0.85);
    letter-spacing: 0.02em;
  }
  .roster-count {
    font-family: 'Courier Prime', monospace;
    font-size: 0.74rem;
    font-weight: 700;
    color: #F4D58C;
  }

  .hint-line {
    margin: 0.55rem 0 0 0;
    padding: 0.45rem 0.6rem;
    background: rgba(244, 213, 140, 0.08);
    border-left: 2px solid rgba(201, 178, 106, 0.45);
    border-radius: 0.25rem;
    font-size: 0.76rem;
    line-height: 1.45;
    color: rgba(244, 239, 226, 0.85);
  }
  .hint-line strong { color: #F4D58C; }
  .rally-tally {
    display: block;
    margin-top: 0.3rem;
    color: #F4D58C;
    font-style: italic;
    font-size: 0.74rem;
  }
  .effects-list li.rally-bonus {
    background: rgba(201, 154, 64, 0.18);
    color: #F4D58C;
    border-color: rgba(201, 154, 64, 0.55);
  }

  .final-line {
    margin: 0.55rem 0;
    padding: 0.55rem 0.7rem;
    background: rgba(244, 213, 140, 0.10);
    border-left: 3px solid #C9B26A;
    border-radius: 0.3rem;
    font-style: italic;
    line-height: 1.5;
    color: #F4D58C;
    font-size: 0.85rem;
  }

  .effects-block {
    margin-top: 0.55rem;
    padding-top: 0.55rem;
    border-top: 1px dashed rgba(201, 178, 106, 0.2);
  }
  .effects-tag {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(244, 213, 140, 0.7);
  }
  .effects-list {
    margin: 0.35rem 0 0 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }
  .effects-list li {
    padding: 0.1rem 0.5rem;
    border-radius: 999px;
    font-family: 'Courier Prime', monospace;
    font-size: 0.72rem;
    font-weight: 700;
  }
  .effects-list li.pos {
    background: rgba(58, 107, 71, 0.18);
    color: #7BCBA1;
    border: 1px solid rgba(58, 107, 71, 0.5);
  }
  .effects-list li.neg {
    background: rgba(176, 24, 30, 0.18);
    color: #E08F92;
    border: 1px solid rgba(176, 24, 30, 0.5);
  }

  .arena-foot {
    margin-top: 0.85rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(201, 178, 106, 0.18);
    display: flex;
    justify-content: flex-end;
  }
  .close-btn {
    padding: 0.55rem 1.2rem;
    background: linear-gradient(180deg, #c89b3c 0%, #a87a26 100%);
    color: #0d1014;
    border: 1px solid #c89b3c;
    border-radius: 0.35rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: filter 0.18s ease;
  }
  .close-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .close-btn:hover:not(:disabled) {
    filter: brightness(1.12);
  }

  @media (max-width: 740px) {
    .arena-body {
      grid-template-columns: 1fr;
    }
    .canvas-wrap {
      width: 100%;
    }
  }
</style>
