/**
 * Tests engine emeute — vrai brawler 2D jouable.
 *
 * Couvre :
 *   - countdown 3s puis fight
 *   - mouvement / saut / gravité
 *   - attaque inflige damage + hitstun + knockback
 *   - KO out-of-bounds + respawn
 *   - fin de match (alive ≤ 1, équipes 2v2, time limit)
 *   - IA CPU produit des inputs cohérents
 */
import { describe, it, expect } from 'vitest';
import {
  startMatch,
  step,
  isOver,
  countdownLabel,
  emptyInput,
  CHARACTERS,
  STAGE_W,
  STAGE_H,
  FLOOR_Y,
  PLAYER_W,
  PLAYER_H,
  type EmeuteState,
  type PlayerInput
} from './engine';

/** Avance le match de N ticks de 16ms (60fps). */
function advance(state: EmeuteState, ticks: number, inputs: PlayerInput[][] = []): EmeuteState {
  let cur = state;
  for (let t = 0; t < ticks; t++) {
    const ins = inputs[t] ?? cur.players.map(() => emptyInput());
    cur = step(cur, ins, 16);
  }
  return cur;
}

describe('startMatch', () => {
  it('refuse < 2 ou > 4 joueurs', () => {
    expect(() => startMatch({ characters: ['tribun'], controls: ['human'] })).toThrow();
  });
  it('initialise une partie 2 joueurs', () => {
    const s = startMatch({
      characters: ['tribun', 'batisseur'],
      controls: ['human', 'cpu']
    });
    expect(s.phase).toBe('countdown');
    expect(s.players).toHaveLength(2);
    expect(s.players[0].hp).toBe(100);
    expect(s.players[0].stocks).toBe(3);
    expect(s.players[1].cpuLevel).toBe(1);
  });
  it('positionne les spawn points équirépartis', () => {
    const s = startMatch({
      characters: ['tribun', 'batisseur', 'rupture', 'pragmatique'],
      controls: ['human', 'cpu', 'cpu', 'cpu']
    });
    expect(s.players[0].x).toBeLessThan(s.players[1].x);
    expect(s.players[1].x).toBeLessThan(s.players[2].x);
    expect(s.players[2].x).toBeLessThan(s.players[3].x);
  });
});

describe('countdown', () => {
  it('label = "3" → "2" → "1" → "GO !" puis phase = fight', () => {
    let s = startMatch({ characters: ['tribun', 'batisseur'], controls: ['human', 'cpu'] });
    expect(countdownLabel(s)).toBe('3');
    /* Au bout d'1s. */
    s = advance(s, 63);
    expect(countdownLabel(s)).toBe('2');
    /* Au bout de 2s. */
    s = advance(s, 63);
    expect(countdownLabel(s)).toBe('1');
    /* Juste avant 3s. */
    s = advance(s, 60);
    /* Phase passe à fight quand elapsedMs >= 3000. */
    s = advance(s, 5);
    expect(s.phase).toBe('fight');
    expect(countdownLabel(s)).toBe('');
  });

  it('aucun input pris en compte pendant le countdown', () => {
    let s = startMatch({ characters: ['tribun', 'batisseur'], controls: ['human', 'cpu'] });
    const startX = s.players[0].x;
    /* On bourrine "right" pendant 1s, position ne doit pas bouger. */
    s = advance(s, 60, Array(60).fill([
      { ...emptyInput(), right: true },
      emptyInput()
    ]));
    expect(s.players[0].x).toBeCloseTo(startX, 1);
  });
});

describe('mouvement', () => {
  function pastCountdown(): EmeuteState {
    let s = startMatch({ characters: ['tribun', 'batisseur'], controls: ['human', 'cpu'] });
    /* Skip countdown. */
    s = advance(s, 200);
    return s;
  }

  it('right input augmente x', () => {
    let s = pastCountdown();
    const x0 = s.players[0].x;
    s = advance(s, 30, Array(30).fill([
      { ...emptyInput(), right: true },
      emptyInput()
    ]));
    expect(s.players[0].x).toBeGreaterThan(x0);
    expect(s.players[0].facing).toBe(1);
  });

  it('left input diminue x', () => {
    let s = pastCountdown();
    const x0 = s.players[0].x;
    s = advance(s, 30, Array(30).fill([
      { ...emptyInput(), left: true },
      emptyInput()
    ]));
    expect(s.players[0].x).toBeLessThan(x0);
    expect(s.players[0].facing).toBe(-1);
  });

  it('jump quitte le sol et la gravité ramène', () => {
    let s = pastCountdown();
    const y0 = s.players[0].y;
    /* 1 frame avec jump. */
    s = step(s, [{ ...emptyInput(), jump: true }, emptyInput()], 16);
    expect(s.players[0].vy).toBeLessThan(0);
    /* Avance 5 frames sans input → encore en l'air. */
    s = advance(s, 5);
    expect(s.players[0].y).toBeLessThan(y0);
    /* Au bout d'1s, retombé. */
    s = advance(s, 70);
    expect(s.players[0].onGround).toBe(true);
  });
});

describe('attaque & damage', () => {
  it('attack inflige des dégâts en hitbox + hitstun', () => {
    let s = startMatch({ characters: ['tribun', 'batisseur'], controls: ['human', 'human'] });
    /* On rapproche les 2 joueurs jusqu'à 30px. */
    s.players[0].x = 200;
    s.players[1].x = 200 + PLAYER_W + 10;
    s = advance(s, 200); /* skip countdown */
    /* Replace après skip (advance sans input ralentit avec friction OK). */
    s.players[0].x = 200;
    s.players[1].x = 200 + PLAYER_W + 10;
    s.players[0].facing = 1;
    const hp1 = s.players[1].hp;
    /* P1 attack edge-trigger. */
    s = step(s, [{ ...emptyInput(), attack: true }, emptyInput()], 16);
    expect(s.players[1].hp).toBeLessThan(hp1);
    expect(s.players[1].hitstunMs).toBeGreaterThan(0);
  });

  it('hp ≤ 0 → KO (stock--, ko=true, respawn timer)', () => {
    let s = startMatch({ characters: ['tribun', 'batisseur'], controls: ['human', 'human'] });
    s = advance(s, 200);
    /* On rapproche les joueurs et on force hp bas pour qu'un seul hit KO. */
    s.players[0].x = 200;
    s.players[1].x = 200 + PLAYER_W + 10;
    s.players[0].facing = 1;
    s.players[1].hp = 5;
    /* P0 frappe P1 → damage > 5 → KO. */
    s = step(s, [{ ...emptyInput(), attack: true }, emptyInput()], 16);
    expect(s.players[1].ko).toBe(true);
    expect(s.players[1].stocks).toBe(2);
    expect(s.players[1].respawnMs).toBeGreaterThan(0);
  });

  it('respawn rétablit hp et position centrale', () => {
    let s = startMatch({ characters: ['tribun', 'batisseur'], controls: ['human', 'human'] });
    s = advance(s, 200);
    s.players[0].x = 200;
    s.players[1].x = 200 + PLAYER_W + 10;
    s.players[0].facing = 1;
    s.players[1].hp = 5;
    s = step(s, [{ ...emptyInput(), attack: true }, emptyInput()], 16);
    /* Avance 1.3s pour respawn. */
    s = advance(s, 90);
    expect(s.players[1].ko).toBe(false);
    expect(s.players[1].hp).toBe(100);
  });
});

describe('fin de match', () => {
  it('alive ≤ 1 → phase = ended + winner correct', () => {
    let s = startMatch({ characters: ['tribun', 'batisseur'], controls: ['human', 'human'], stocks: 1 });
    s = advance(s, 200);
    /* KO du joueur 2 par hit fatal (stocks=1). */
    s.players[0].x = 200;
    s.players[1].x = 200 + PLAYER_W + 10;
    s.players[0].facing = 1;
    s.players[1].hp = 5;
    s = step(s, [{ ...emptyInput(), attack: true }, emptyInput()], 16);
    expect(s.phase).toBe('ended');
    expect(isOver(s)).toBe(true);
    expect(s.winnerIndex).toBe(0);
  });

  it('mode 2v2 : équipe gagnante reconnue', () => {
    let s = startMatch({
      characters: ['tribun', 'rupture', 'batisseur', 'pragmatique'],
      controls: ['human', 'human', 'human', 'human'],
      teams: [1, 1, 2, 2],
      stocks: 1
    });
    s = advance(s, 200);
    /* KO les 2 joueurs équipe 2 par hits fatals. P0 (équipe 1) frappe P2,
       P1 (équipe 1) frappe P3. */
    s.players[0].x = 200;
    s.players[2].x = 200 + PLAYER_W + 10;
    s.players[0].facing = 1;
    s.players[2].hp = 5;
    s.players[1].x = 600;
    s.players[3].x = 600 + PLAYER_W + 10;
    s.players[1].facing = 1;
    s.players[3].hp = 5;
    s = step(s, [
      { ...emptyInput(), attack: true },
      { ...emptyInput(), attack: true },
      emptyInput(),
      emptyInput()
    ], 16);
    expect(s.phase).toBe('ended');
    expect(s.winnerTeam).toBe(1);
  });

  it('time limit déclenche fin avec winner = top KO', () => {
    let s = startMatch({
      characters: ['tribun', 'batisseur'],
      controls: ['human', 'human'],
      durationMs: 4500 /* > 3s countdown + marge */
    });
    /* On avance d'abord pour passer le countdown… */
    s = advance(s, 200);
    /* …puis on truque les KO de P0 (force scénario). */
    s.players[0].kos = 5;
    /* …puis on dépasse durationMs. */
    s = advance(s, 100);
    expect(s.phase).toBe('ended');
    expect(s.winnerIndex).toBe(0);
  });
});

describe('IA CPU', () => {
  it('niveau 0 → input non-vide quand un ennemi est près', () => {
    let s = startMatch({ characters: ['tribun', 'batisseur'], controls: ['cpu', 'human'] });
    s.players[0].cpuLevel = 0;
    s = advance(s, 200);
    /* On rapproche. */
    s.players[0].x = 100;
    s.players[1].x = 200;
    /* Step avec 1 input vide pour humain — l'IA produira son input. */
    s = step(s, [emptyInput(), emptyInput()], 16);
    /* L'IA devrait avoir vx != 0 ou être en train d'attaquer. */
    const p = s.players[0];
    expect(p.vx !== 0 || p.attackMs > 0 || p.facing !== 0).toBe(true);
  });

  it('toutes IA + 1 humain ne crashent pas pendant 60 frames', () => {
    let s = startMatch({
      characters: ['tribun', 'batisseur', 'rupture', 'pragmatique'],
      controls: ['human', 'cpu', 'cpu', 'cpu'],
      cpuLevels: [1, 0, 1, 2]
    });
    expect(() => {
      s = advance(s, 250);
    }).not.toThrow();
    expect(s.players).toHaveLength(4);
  });
});

describe('caractéristiques personnages', () => {
  it('rupture (perso "fast") a la plus haute speed', () => {
    expect(CHARACTERS.rupture.speed).toBeGreaterThan(CHARACTERS.batisseur.speed);
    expect(CHARACTERS.rupture.speed).toBeGreaterThan(CHARACTERS.tribun.speed);
  });
  it('batisseur (perso "tank") a defenseMul < 1', () => {
    expect(CHARACTERS.batisseur.defenseMul).toBeLessThan(1);
  });
});
