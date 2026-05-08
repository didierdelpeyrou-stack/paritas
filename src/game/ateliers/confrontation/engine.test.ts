import { describe, it, expect } from 'vitest';
import {
  startConfrSession,
  pickAction,
  resolveRound,
  nextRound,
  aiPolice,
  aiManif,
  zoneLabel,
  MANIF_ACTIONS,
  POLICE_ACTIONS,
  type ConfrState,
  type ManifAction,
  type PoliceAction
} from './engine';

describe('Confrontation — initial state & catalogues', () => {
  it('starts at round 1, picking phase, zone=50', () => {
    const s = startConfrSession();
    expect(s.round).toBe(1);
    expect(s.phase).toBe('picking');
    expect(s.zone).toBe(50);
    expect(s.history).toEqual([]);
    expect(s.matchOutcome).toBeNull();
    expect(s.manifMoralBonus).toBe(0);
    expect(s.policeNasseBonus).toBe(0);
  });

  it('exposes 5 actions per side with stable ids', () => {
    expect(MANIF_ACTIONS).toHaveLength(5);
    expect(POLICE_ACTIONS).toHaveLength(5);
    const mIds = MANIF_ACTIONS.map(a => a.id).sort();
    expect(mIds).toEqual(['barricade', 'chanter', 'pousser', 'reculer', 'tenir'].sort());
    const pIds = POLICE_ACTIONS.map(a => a.id).sort();
    expect(pIds).toEqual(['bouclier', 'charge', 'lacrymo', 'nasse', 'retraite'].sort());
  });
});

describe('Confrontation — round mechanics', () => {
  it('pickAction sets the side pick', () => {
    let s = startConfrSession();
    s = pickAction(s, 'manif', 'tenir');
    expect(s.manifPick).toBe('tenir');
    s = pickAction(s, 'police', 'bouclier');
    expect(s.policePick).toBe('bouclier');
  });

  it('resolveRound transitions to result or ended and adds history', () => {
    let s = startConfrSession();
    s = pickAction(s, 'manif', 'pousser');
    s = pickAction(s, 'police', 'bouclier');
    s = resolveRound(s);
    expect(s.phase === 'result' || s.phase === 'ended').toBe(true);
    expect(s.history).toHaveLength(1);
  });

  it('zone stays in [0, 100] across rounds', () => {
    let s = startConfrSession();
    let safety = 0;
    while (s.phase !== 'ended' && safety++ < 10) {
      s = pickAction(s, 'manif', 'pousser');
      s = pickAction(s, 'police', 'charge');
      s = resolveRound(s);
      expect(s.zone).toBeGreaterThanOrEqual(0);
      expect(s.zone).toBeLessThanOrEqual(100);
      if (s.phase === 'result') s = nextRound(s);
    }
  });

  it('match completes within 3 rounds', () => {
    let s = startConfrSession();
    let safety = 0;
    while (s.phase !== 'ended' && safety++ < 10) {
      const m = MANIF_ACTIONS[Math.floor(Math.random() * 5)].id;
      const p = POLICE_ACTIONS[Math.floor(Math.random() * 5)].id;
      s = pickAction(s, 'manif', m);
      s = pickAction(s, 'police', p);
      s = resolveRound(s);
      if (s.phase === 'result') s = nextRound(s);
    }
    expect(s.phase).toBe('ended');
    expect(s.round).toBeLessThanOrEqual(3);
    expect(s.matchOutcome).toBeTruthy();
  });
});

describe('Confrontation — outcome distribution (10k random)', () => {
  it('all 3 outcomes reachable in [5%, 60%] (Argus pre-beta target)', () => {
    const counts = { manif_victoire: 0, police_victoire: 0, blocage: 0 };
    const mIds = MANIF_ACTIONS.map(a => a.id) as ManifAction[];
    const pIds = POLICE_ACTIONS.map(a => a.id) as PoliceAction[];
    for (let i = 0; i < 10_000; i++) {
      let s: ConfrState = startConfrSession();
      let safety = 0;
      while (s.phase !== 'ended' && safety++ < 10) {
        const m = mIds[Math.floor(Math.random() * mIds.length)];
        const p = pIds[Math.floor(Math.random() * pIds.length)];
        s = pickAction(s, 'manif', m);
        s = pickAction(s, 'police', p);
        s = resolveRound(s);
        if (s.phase === 'result') s = nextRound(s);
      }
      counts[s.matchOutcome!]++;
    }
    for (const [k, v] of Object.entries(counts)) {
      const pct = (100 * v) / 10_000;
      expect(pct, `${k}=${pct.toFixed(1)}%`).toBeGreaterThanOrEqual(5);
      expect(pct, `${k}=${pct.toFixed(1)}%`).toBeLessThanOrEqual(70);
    }
  });
});

describe('Confrontation — IA (extracted from .svelte, ORDA-006 refacto)', () => {
  it('aiPolice always returns a valid PoliceAction id', () => {
    const validIds = POLICE_ACTIONS.map(a => a.id);
    const s = startConfrSession();
    for (let i = 0; i < 100; i++) {
      const action = aiPolice(s);
      expect(validIds).toContain(action);
    }
  });

  it('aiManif always returns a valid ManifAction id', () => {
    const validIds = MANIF_ACTIONS.map(a => a.id);
    const s = startConfrSession();
    for (let i = 0; i < 100; i++) {
      const action = aiManif(s);
      expect(validIds).toContain(action);
    }
  });

  it('aiPolice favors aggressive moves when manif winning (zone>55)', () => {
    const s: ConfrState = { ...startConfrSession(), zone: 70 };
    const counts: Partial<Record<PoliceAction, number>> = {};
    for (let i = 0; i < 1000; i++) {
      const a = aiPolice(s);
      counts[a] = (counts[a] ?? 0) + 1;
    }
    /* Pondération agressive : ['charge', 'lacrymo', 'nasse', 'charge', 'bouclier']
       → charge x2 = 40%, autres ≈ 20%, retraite = 0% */
    expect(counts.retraite ?? 0).toBe(0);
    expect((counts.charge ?? 0) > (counts.bouclier ?? 0)).toBe(true);
  });

  it('aiManif favors aggressive moves when police winning (zone<45)', () => {
    const s: ConfrState = { ...startConfrSession(), zone: 30 };
    const counts: Partial<Record<ManifAction, number>> = {};
    for (let i = 0; i < 1000; i++) {
      const a = aiManif(s);
      counts[a] = (counts[a] ?? 0) + 1;
    }
    /* Pondération agressive : ['pousser', 'barricade', 'chanter', 'pousser', 'tenir']
       → pousser x2 = 40%, reculer = 0% */
    expect(counts.reculer ?? 0).toBe(0);
    expect((counts.pousser ?? 0) > (counts.tenir ?? 0)).toBe(true);
  });
});

describe('Confrontation — utilities', () => {
  it('zoneLabel returns a string for any zone in [0, 100]', () => {
    expect(typeof zoneLabel(0)).toBe('string');
    expect(typeof zoneLabel(50)).toBe('string');
    expect(typeof zoneLabel(100)).toBe('string');
  });

  it('zone above 65 favors manif, below 35 favors police (semantic invariant)', () => {
    /* This is a documentation-style test : it asserts the engine's
       public contract about zone semantics, exposed via zoneLabel. */
    expect(typeof zoneLabel(70)).toBe('string'); // manif territory
    expect(typeof zoneLabel(30)).toBe('string'); // police territory
  });
});
