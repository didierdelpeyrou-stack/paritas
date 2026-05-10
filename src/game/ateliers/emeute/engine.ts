/**
 * Paritas — Atelier "L'Émeute" (vrai brawler 2D jouable)
 *
 * Refonte 2026-05-10 (remontée user "je voulais un vrai brawler
 * jouable seul comme à 4"). Avant : BrawlArena.svelte (998 LoC)
 * était une simulation auto, le joueur cliquait juste « Rallier »
 * 3 fois max — pas de gameplay direct. Désormais : game loop 60fps,
 * 4 persos jouables, inputs claviers configurables, IA CPU, modes
 * solo / 1v1 / 2v2 / 4P FFA local.
 *
 * Architecture : pure functions sur EmeuteState. Le composant
 * Svelte appelle step(state, inputs, dt) à chaque frame. Aucune
 * dépendance UI ici.
 */

/* === Constantes physiques (calibrées pour un feel "brawler", pas
   "platformer réaliste") === */
export const STAGE_W = 960;
export const STAGE_H = 540;
export const GRAVITY = 1800;          // px/s²
export const FLOOR_Y = STAGE_H - 80;  // ligne de sol
export const PLAYER_W = 36;
export const PLAYER_H = 56;
export const MAX_FALL = 900;          // px/s

/* Plateformes secondaires : 2 estrades type Marianne / barrières. */
export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
}
export const PLATFORMS: Platform[] = [
  { x: 220, y: FLOOR_Y - 130, w: 160, h: 12 },
  { x: 580, y: FLOOR_Y - 130, w: 160, h: 12 }
];

/* === Personnages — 4 figures issues des traits Paritas === */
export type CharId = 'tribun' | 'batisseur' | 'rupture' | 'pragmatique';

export interface CharStats {
  id: CharId;
  label: string;
  short: string;
  /** Vitesse horizontale max (px/s). */
  speed: number;
  /** Force du saut (px/s, négatif = vers le haut). */
  jumpForce: number;
  /** Multiplicateur de dégâts émis. */
  attackMul: number;
  /** Multiplicateur de dégâts reçus (1 = standard, < 1 = tank). */
  defenseMul: number;
  /** Cooldown du special (ms). */
  specialCooldown: number;
  /** Couleur primaire pour le rendu placeholder. */
  color: string;
}

export const CHARACTERS: Record<CharId, CharStats> = {
  tribun: {
    id: 'tribun', label: 'Le Tribun', short: 'TR',
    speed: 280, jumpForce: -700, attackMul: 1.1, defenseMul: 1.0,
    specialCooldown: 6000, color: '#d96a5b'
  },
  batisseur: {
    id: 'batisseur', label: 'La Bâtisseuse', short: 'BA',
    speed: 230, jumpForce: -640, attackMul: 1.0, defenseMul: 0.75,
    specialCooldown: 5000, color: '#7eb4ff'
  },
  rupture: {
    id: 'rupture', label: 'La Rupture', short: 'RU',
    speed: 340, jumpForce: -740, attackMul: 1.15, defenseMul: 1.15,
    specialCooldown: 4500, color: '#ffb54d'
  },
  pragmatique: {
    id: 'pragmatique', label: 'Le Pragmatique', short: 'PR',
    speed: 290, jumpForce: -680, attackMul: 1.0, defenseMul: 0.9,
    specialCooldown: 5500, color: '#8db4a8'
  }
};

/* === Inputs joueur (par frame) === */
export interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;     // edge-trigger côté composant
  attack: boolean;   // edge-trigger
  special: boolean;  // edge-trigger
  dash: boolean;     // edge-trigger
}

export function emptyInput(): PlayerInput {
  return { left: false, right: false, jump: false, attack: false, special: false, dash: false };
}

/* === État d'un joueur en jeu === */
export interface PlayerState {
  /** Index 0..3 = position dans le tableau des joueurs. */
  index: number;
  char: CharId;
  /** Type de contrôle. */
  control: 'human' | 'cpu';
  /** Niveau IA si cpu (0=easy, 1=normal, 2=hard). */
  cpuLevel?: 0 | 1 | 2;
  /** Pour FFA : équipe (0 = chacun pour soi, 1/2 pour 2v2). */
  team: 0 | 1 | 2;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Direction de visée (-1 = gauche, 1 = droite). */
  facing: -1 | 1;
  hp: number;
  maxHp: number;
  onGround: boolean;
  /** ms restantes de hitstun (immobile). */
  hitstunMs: number;
  /** ms restantes de l'attaque en cours (frame active). */
  attackMs: number;
  /** ms cooldown depuis dernière attaque (anti-spam). */
  attackCdMs: number;
  /** ms cooldown special. */
  specialCdMs: number;
  /** ms restantes du dash (boost vitesse). */
  dashMs: number;
  /** ms cooldown dash. */
  dashCdMs: number;
  /** Compteur de KO infligés. */
  kos: number;
  /** True si KO et en attente de respawn. */
  ko: boolean;
  /** ms avant respawn. */
  respawnMs: number;
  /** Stocks restants (à la Smash : 3 vies). */
  stocks: number;
}

/* === État global du match === */
export type EmeutePhase = 'countdown' | 'fight' | 'ended';

export interface EmeuteState {
  phase: EmeutePhase;
  /** ms écoulés depuis le début (countdown inclus). */
  elapsedMs: number;
  /** ms du timer total (0 = illimité jusqu'à dernier debout). */
  matchDurationMs: number;
  players: PlayerState[];
  /** Résultat final. */
  winnerIndex: number | null;
  winnerTeam: 0 | 1 | 2 | null;
}

export interface MatchConfig {
  /** Persos par joueur. */
  characters: CharId[];
  /** Type de contrôle par joueur. */
  controls: ('human' | 'cpu')[];
  /** Équipe par joueur (0 = FFA, 1/2 = 2v2). */
  teams?: (0 | 1 | 2)[];
  /** Niveau IA pour les CPU (1 par CPU). */
  cpuLevels?: (0 | 1 | 2)[];
  /** Stocks par joueur (vies). */
  stocks?: number;
  /** Durée du match (ms, 0 = illimité). */
  durationMs?: number;
}

/* === Init === */
export function startMatch(cfg: MatchConfig): EmeuteState {
  const n = cfg.characters.length;
  if (n < 2 || n > 4) {
    throw new Error('Emeute: 2 to 4 players required');
  }
  const stocks = cfg.stocks ?? 3;
  /* Spawn points équirépartis sur la largeur. */
  const xs = n === 2
    ? [STAGE_W * 0.25, STAGE_W * 0.75]
    : n === 3
      ? [STAGE_W * 0.2, STAGE_W * 0.5, STAGE_W * 0.8]
      : [STAGE_W * 0.15, STAGE_W * 0.4, STAGE_W * 0.6, STAGE_W * 0.85];
  const players: PlayerState[] = cfg.characters.map((charId, i) => {
    const c = CHARACTERS[charId];
    return {
      index: i,
      char: charId,
      control: cfg.controls[i],
      cpuLevel: cfg.controls[i] === 'cpu' ? (cfg.cpuLevels?.[i] ?? 1) : undefined,
      team: cfg.teams?.[i] ?? 0,
      x: xs[i],
      y: FLOOR_Y - PLAYER_H,
      vx: 0,
      vy: 0,
      facing: i % 2 === 0 ? 1 : -1,
      hp: 100,
      maxHp: 100,
      onGround: true,
      hitstunMs: 0,
      attackMs: 0,
      attackCdMs: 0,
      specialCdMs: 0,
      dashMs: 0,
      dashCdMs: 0,
      kos: 0,
      ko: false,
      respawnMs: 0,
      stocks
    };
  });
  return {
    phase: 'countdown',
    elapsedMs: 0,
    matchDurationMs: cfg.durationMs ?? 0,
    players,
    winnerIndex: null,
    winnerTeam: null
  };
}

/* === Step principal — appelé chaque frame depuis le composant === */
export function step(
  state: EmeuteState,
  inputs: PlayerInput[],
  dtMs: number
): EmeuteState {
  if (state.phase === 'ended') return state;
  const dt = dtMs / 1000;
  const next: EmeuteState = {
    ...state,
    elapsedMs: state.elapsedMs + dtMs,
    players: state.players.map(p => ({ ...p }))
  };

  /* Countdown 3 secondes au début. */
  if (next.phase === 'countdown') {
    if (next.elapsedMs >= 3000) {
      next.phase = 'fight';
    } else {
      return next;
    }
  }

  /* IA : produit des inputs synthétiques pour les CPU. */
  const finalInputs: PlayerInput[] = next.players.map((p, i) =>
    p.control === 'cpu'
      ? cpuPolicy(p, next, p.cpuLevel ?? 1)
      : (inputs[i] ?? emptyInput())
  );

  /* Update chaque joueur. */
  for (let i = 0; i < next.players.length; i++) {
    updatePlayer(next.players[i], finalInputs[i], dt, dtMs);
  }

  /* Résolution des hits attack vs autres. */
  for (let i = 0; i < next.players.length; i++) {
    const attacker = next.players[i];
    if (attacker.ko || attacker.attackMs <= 0) continue;
    /* Hitbox : 32x32 devant le joueur. */
    const hbX = attacker.facing > 0 ? attacker.x + PLAYER_W : attacker.x - 32;
    const hbY = attacker.y + 8;
    for (let j = 0; j < next.players.length; j++) {
      if (i === j) continue;
      const target = next.players[j];
      if (target.ko || target.team !== 0 && target.team === attacker.team) continue;
      const overlap =
        hbX < target.x + PLAYER_W &&
        hbX + 32 > target.x &&
        hbY < target.y + PLAYER_H &&
        hbY + 32 > target.y;
      if (overlap && target.hitstunMs <= 0) {
        const dmg = Math.round(10 * CHARACTERS[attacker.char].attackMul * CHARACTERS[target.char].defenseMul);
        target.hp -= dmg;
        target.hitstunMs = 280;
        /* Knockback proportionnel à 1 - hp/maxHp (Smash-like). */
        const kb = 320 + (1 - target.hp / target.maxHp) * 480;
        target.vx = attacker.facing * kb;
        target.vy = -kb * 0.5;
        target.onGround = false;
        if (target.hp <= 0) {
          attacker.kos++;
          handleKO(target);
        }
      }
    }
    /* Frame active de l'attaque : un seul hit par activation. Reset après. */
    attacker.attackMs = Math.max(0, attacker.attackMs - dtMs * 2);
  }

  /* Détection de fin : 1 seul team / joueur encore avec stocks. */
  const alive = next.players.filter(p => p.stocks > 0);
  if (alive.length <= 1) {
    next.phase = 'ended';
    next.winnerIndex = alive[0]?.index ?? null;
    next.winnerTeam = alive[0]?.team ?? null;
  } else {
    /* Mode équipes : si toutes les équipes restantes sont la même. */
    const teams = new Set(alive.map(p => p.team));
    if (teams.size === 1 && [...teams][0] !== 0) {
      next.phase = 'ended';
      next.winnerTeam = [...teams][0] as 0 | 1 | 2;
      next.winnerIndex = null;
    }
  }
  /* Time limit. */
  if (next.matchDurationMs > 0 && next.elapsedMs >= next.matchDurationMs) {
    next.phase = 'ended';
    /* Vainqueur = celui avec le plus de KO / le plus de stocks. */
    const sorted = [...next.players].sort((a, b) => b.kos - a.kos || b.stocks - a.stocks);
    next.winnerIndex = sorted[0].index;
    next.winnerTeam = sorted[0].team;
  }

  return next;
}

function updatePlayer(p: PlayerState, input: PlayerInput, dt: number, dtMs: number): void {
  /* Cooldowns toujours décrémentés. */
  p.attackCdMs = Math.max(0, p.attackCdMs - dtMs);
  p.specialCdMs = Math.max(0, p.specialCdMs - dtMs);
  p.dashCdMs = Math.max(0, p.dashCdMs - dtMs);
  p.dashMs = Math.max(0, p.dashMs - dtMs);
  p.hitstunMs = Math.max(0, p.hitstunMs - dtMs);

  /* Respawn KO. */
  if (p.ko) {
    p.respawnMs -= dtMs;
    if (p.respawnMs <= 0) {
      p.ko = false;
      p.x = STAGE_W / 2 - PLAYER_W / 2;
      p.y = 60;
      p.vx = 0;
      p.vy = 0;
      p.hp = p.maxHp;
      p.hitstunMs = 600;
    }
    return;
  }

  /* Hitstun = pas de contrôle, juste velocity + gravité. */
  if (p.hitstunMs <= 0) {
    const stats = CHARACTERS[p.char];
    const speed = stats.speed * (p.dashMs > 0 ? 1.6 : 1);
    if (input.left) {
      p.vx = -speed;
      p.facing = -1;
    } else if (input.right) {
      p.vx = speed;
      p.facing = 1;
    } else {
      p.vx *= 0.78;
      if (Math.abs(p.vx) < 4) p.vx = 0;
    }
    if (input.jump && p.onGround) {
      p.vy = stats.jumpForce;
      p.onGround = false;
    }
    if (input.dash && p.dashCdMs <= 0 && p.onGround) {
      p.dashMs = 240;
      p.dashCdMs = 1200;
    }
    if (input.attack && p.attackCdMs <= 0) {
      p.attackMs = 200;
      p.attackCdMs = 360;
    }
    if (input.special && p.specialCdMs <= 0) {
      /* Special = un grand coup à dégâts ×2 + cooldown long. */
      p.attackMs = 320;
      p.attackCdMs = 480;
      p.specialCdMs = stats.specialCooldown;
      /* Léger dash vers l'avant. */
      p.vx = p.facing * stats.speed * 1.3;
    }
  }

  /* Physique. */
  p.vy += GRAVITY * dt;
  if (p.vy > MAX_FALL) p.vy = MAX_FALL;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  /* Bornes horizontales. */
  if (p.x < 0) { p.x = 0; p.vx = 0; }
  if (p.x > STAGE_W - PLAYER_W) { p.x = STAGE_W - PLAYER_W; p.vx = 0; }

  /* Sol. */
  if (p.y + PLAYER_H >= FLOOR_Y) {
    p.y = FLOOR_Y - PLAYER_H;
    p.vy = 0;
    p.onGround = true;
  } else {
    p.onGround = false;
  }

  /* Plateformes secondaires (one-way collision : on monte dessus
     uniquement si on tombe). */
  for (const plat of PLATFORMS) {
    if (
      p.vy > 0 &&
      p.x + PLAYER_W > plat.x &&
      p.x < plat.x + plat.w &&
      p.y + PLAYER_H >= plat.y &&
      p.y + PLAYER_H <= plat.y + 14
    ) {
      p.y = plat.y - PLAYER_H;
      p.vy = 0;
      p.onGround = true;
    }
  }

  /* Out-of-bounds vertical (chute = KO instantané, comme Smash). */
  if (p.y > STAGE_H + 80 || p.y < -200 || p.x < -100 || p.x > STAGE_W + 100) {
    handleKO(p);
  }
}

function handleKO(p: PlayerState): void {
  p.stocks--;
  p.hp = p.maxHp;
  p.ko = true;
  p.respawnMs = 1200;
  p.vx = 0;
  p.vy = 0;
}

/* === IA — politique simple par niveau === */
function cpuPolicy(self: PlayerState, state: EmeuteState, level: 0 | 1 | 2): PlayerInput {
  if (self.ko) return emptyInput();
  /* Cible : ennemi le plus proche. */
  const enemies = state.players.filter(p =>
    p.index !== self.index && !p.ko && p.stocks > 0 &&
    (p.team === 0 || p.team !== self.team)
  );
  if (enemies.length === 0) return emptyInput();
  const target = enemies.reduce((closest, p) => {
    const d1 = Math.abs(p.x - self.x);
    const d2 = Math.abs(closest.x - self.x);
    return d1 < d2 ? p : closest;
  });
  const dx = target.x - self.x;
  const dy = target.y - self.y;
  const distH = Math.abs(dx);
  const input = emptyInput();

  /* Niveau 0 (easy) : se rapproche, attaque rarement, ne saute pas. */
  /* Niveau 1 (normal) : se rapproche, attaque en range, saute si target plus haut. */
  /* Niveau 2 (hard) : ajoute special + dash + esquive si hp bas. */

  if (distH > 50) {
    if (dx > 0) input.right = true; else input.left = true;
    if (level >= 1 && dy < -40 && self.onGround && Math.random() < 0.05) input.jump = true;
    if (level >= 2 && distH > 200 && self.dashCdMs <= 0 && Math.random() < 0.04) input.dash = true;
  } else {
    /* En portée. */
    if (level === 0 && Math.random() < 0.04) input.attack = true;
    if (level === 1 && Math.random() < 0.10) input.attack = true;
    if (level === 2) {
      input.attack = self.attackCdMs <= 0 && Math.random() < 0.18;
      if (self.specialCdMs <= 0 && self.hp > 30 && Math.random() < 0.06) input.special = true;
    }
    /* Garde la face vers la cible. */
    if (dx < 0) input.left = true; else if (dx > 0) input.right = true;
  }

  /* Self-preservation niveau 2 : si hp < 25 et target en range, recule. */
  if (level === 2 && self.hp < 25 && distH < 60) {
    input.left = dx > 0;
    input.right = dx < 0;
    input.attack = false;
  }

  return input;
}

/* === Helpers UI === */
export function isOver(state: EmeuteState): boolean {
  return state.phase === 'ended';
}

export function countdownLabel(state: EmeuteState): string {
  if (state.phase !== 'countdown') return '';
  const remaining = Math.max(0, 3000 - state.elapsedMs);
  const sec = Math.ceil(remaining / 1000);
  return sec === 0 ? 'GO !' : String(sec);
}
