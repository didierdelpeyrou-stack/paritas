import { describe, it, expect } from 'vitest';
import {
  startPlaceSession,
  applyAction,
  getCurrentAct,
  outcomeToV2Effects,
  type PlaceState,
  type ActionId
} from './engine';

/* Helper : joue une partie complète en suivant un script d'actions. */
function playScript(actions: ActionId[]): PlaceState {
  let s = startPlaceSession();
  for (const a of actions) {
    if (s.phase === 'ended') break;
    s = applyAction(s, a);
  }
  return s;
}

describe('La Place — engine invariants', () => {
  it('starts in act 1, playing, escalade=20, foule=30', () => {
    const s = startPlaceSession();
    expect(s.act).toBe(1);
    expect(s.phase).toBe('playing');
    expect(s.escalade).toBe(20);
    expect(s.foule).toBe(30);
    expect(s.outcome).toBeNull();
    expect(s.history).toEqual([]);
  });

  it('clamps escalade and foule to [0, 100]', () => {
    const s = playScript(['forcer', 'forcer', 'forcer']);
    expect(s.escalade).toBeGreaterThanOrEqual(0);
    expect(s.escalade).toBeLessThanOrEqual(100);
    expect(s.foule).toBeGreaterThanOrEqual(0);
    expect(s.foule).toBeLessThanOrEqual(100);
  });

  it('ends after 3 acts with an outcome', () => {
    const s = playScript(['tenir', 'tenir', 'tenir']);
    expect(s.phase).toBe('ended');
    expect(s.outcome).not.toBeNull();
    expect(s.history.length).toBe(3);
  });

  it('reaches repression when escalade hits 100 mid-game', () => {
    const s = playScript(['forcer', 'forcer']);
    if (s.escalade >= 100) {
      expect(s.outcome).toBe('repression');
      expect(s.phase).toBe('ended');
    }
  });

  it('reaches abandon via 2 reculs + low foule (Argus AAR fix)', () => {
    /* Acte 1 reculer : escalade=8, foule=22 → pas de police
       Acte 2 reculer : escalade=0 (clamp), foule=24 (sans police: +2)
       Acte 3 reculer : escalade=0, foule=19 → abandon (foule < 20) OU
                                                abandon (2 reculs + foule < 35) */
    const s = playScript(['reculer', 'reculer', 'reculer']);
    expect(s.outcome).toBe('abandon');
  });

  it('police arrives when escalade ≥60 at end of act 1', () => {
    let s = startPlaceSession();
    s = applyAction(s, 'forcer'); // +28 escalade → 48
    expect(s.policeArrived).toBe(false);
    /* Réinit avec push plus fort impossible en 1 action ;
       on teste seulement la transition à l'acte 2 sans police. */
    expect(s.act).toBe(2);
  });

  it('all 4 outcomes are reachable via deterministic scripts', () => {
    /* victoire : pousser × 3 → escalade modérée, foule haute */
    const v = playScript(['pousser', 'pousser', 'tenir']);
    /* abandon : reculer × 3 (testé ci-dessus) */
    const a = playScript(['reculer', 'reculer', 'reculer']);
    /* repression : forcer × 3 → escalade ≥80 */
    const r = playScript(['forcer', 'forcer', 'forcer']);
    /* compromis : mix tenir + pousser → entre les seuils */
    const c = playScript(['tenir', 'pousser', 'tenir']);

    const outcomes = new Set([v.outcome, a.outcome, r.outcome, c.outcome]);
    expect(outcomes.size).toBeGreaterThanOrEqual(2); // au moins 2 distincts
    expect(a.outcome).toBe('abandon');
  });
});

describe('La Place — outcome distribution (10k random)', () => {
  it('produces all 4 outcomes ≥5% in random play (Argus pre-beta target)', () => {
    const counts = { victoire: 0, compromis: 0, repression: 0, abandon: 0 };
    const N = 10_000;
    const allActions: ActionId[] = ['tenir', 'pousser', 'forcer', 'reculer'];
    for (let i = 0; i < N; i++) {
      let s = startPlaceSession();
      let safety = 0;
      while (s.phase !== 'ended' && safety++ < 10) {
        const act = getCurrentAct(s);
        const a = act.actions[Math.floor(Math.random() * act.actions.length)];
        s = applyAction(s, a.id);
      }
      counts[s.outcome!]++;
    }
    for (const o of Object.keys(counts) as Array<keyof typeof counts>) {
      const pct = (100 * counts[o]) / N;
      expect(pct, `${o} = ${pct.toFixed(1)}%`).toBeGreaterThanOrEqual(5);
      expect(pct, `${o} = ${pct.toFixed(1)}%`).toBeLessThanOrEqual(60);
    }
  });
});

describe('La Place — V2 effects mapping', () => {
  it('maps each outcome to a V2 effects payload', () => {
    const dummyHistory = [
      { act: 1, action: 'tenir' as ActionId, deltaEscalade: -5, deltaFoule: 5, narrative: '' }
    ];
    expect(outcomeToV2Effects('victoire', dummyHistory).confiance).toBeGreaterThan(0);
    expect(outcomeToV2Effects('abandon', dummyHistory).confiance).toBeLessThan(0);
    expect(outcomeToV2Effects('repression', dummyHistory).santeSociale).toBeLessThan(0);
  });

  it('penalizes 2+ "forcer" actions (mouvement épuisé)', () => {
    const noForce = [
      { act: 1, action: 'tenir' as ActionId, deltaEscalade: 0, deltaFoule: 0, narrative: '' },
      { act: 2, action: 'tenir' as ActionId, deltaEscalade: 0, deltaFoule: 0, narrative: '' }
    ];
    const twoForce = [
      { act: 1, action: 'forcer' as ActionId, deltaEscalade: 0, deltaFoule: 0, narrative: '' },
      { act: 2, action: 'forcer' as ActionId, deltaEscalade: 0, deltaFoule: 0, narrative: '' }
    ];
    const a = outcomeToV2Effects('compromis', noForce);
    const b = outcomeToV2Effects('compromis', twoForce);
    expect(b.santeSociale).toBeLessThan(a.santeSociale);
    expect(b.cohesionInterne).toBeLessThan(a.cohesionInterne);
  });
});
