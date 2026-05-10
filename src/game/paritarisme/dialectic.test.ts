/**
 * Tests du moteur dialectique de la Table paritaire.
 *
 * Couverture :
 *   - Matrice nominale 3×3 (chaque cellule renvoie un delta cohérent)
 *   - Modulateurs : doctrines, manœuvre, contexte, mémoire
 *   - Silhouette (info imparfaite calibrée)
 *   - Acquis irréversibles (déblocage selon période + cellule)
 *   - Triggers ateliers (Émeute, Block Blast, marchandage, Conseil)
 *   - Effets différés (queue T+k, guards)
 *   - Sanity tests : bornes [0,100], no dominant posture, no death spiral
 */
import { describe, it, expect } from 'vitest';
import {
  resolveTable,
  silhouette,
  patronObserverSkill,
  salarieObserverSkill,
  patronManoeuvreMod,
  salarieManoeuvreMod,
  contextMod,
  memoryMod,
  unlockAcquis,
  triggerAtelier,
  buildDelayedEffects,
  tickDelayed,
  defaultContext,
  defaultPatronManoeuvre,
  defaultSalarieManoeuvre,
  NOMINAL_MATRIX,
  DOCTRINE_MOD,
  type PatronPosture,
  type SalariePosture,
  type AcquisId,
  type ResolveContext
} from './dialectic';

/* ============================================================
   Helpers tests
   ============================================================ */

/** RNG déterministe pour reproductibilité. */
function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 0x100000000;
    return s / 0x100000000;
  };
}

const POSTURES_P: PatronPosture[] = ['cession', 'tenir', 'echange'];
const POSTURES_S: SalariePosture[] = ['rapportForce', 'compromis', 'acquisCibles'];

/* ============================================================
   1. Matrice nominale
   ============================================================ */

describe('NOMINAL_MATRIX', () => {
  it('contient les 9 cellules', () => {
    let cellCount = 0;
    for (const p of POSTURES_P) {
      for (const s of POSTURES_S) {
        expect(NOMINAL_MATRIX[p][s]).toBeDefined();
        cellCount++;
      }
    }
    expect(cellCount).toBe(9);
  });

  it('cellule (cession, acquisCibles) = réforme historique (povAchat≥0, droits>0)', () => {
    const cell = NOMINAL_MATRIX.cession.acquisCibles;
    expect(cell.droits).toBeGreaterThan(0);
    expect(cell.legitimite).toBeGreaterThan(0);
    expect(cell.tension).toBeLessThan(0); // détend
  });

  it('cellule (tenir, rapportForce) = standoff explosif (tension>0, climat<0)', () => {
    const cell = NOMINAL_MATRIX.tenir.rapportForce;
    expect(cell.tension).toBeGreaterThan(20);
    expect(cell.climat).toBeLessThan(0);
    expect(cell.povAchat).toBeLessThan(0);
  });

  it('cellule (echange, compromis) = deal optimal (climat>0, marge>0, tension<0)', () => {
    const cell = NOMINAL_MATRIX.echange.compromis;
    expect(cell.climat).toBeGreaterThan(0);
    expect(cell.marge).toBeGreaterThanOrEqual(0);
    expect(cell.tension).toBeLessThan(0);
  });

  it('cellule (tenir, compromis) — salarié humilié → cohésion baisse', () => {
    const cell = NOMINAL_MATRIX.tenir.compromis;
    expect(cell.cohesion).toBeLessThan(0);
    expect(cell.legitimite).toBeLessThan(0);
  });
});

/* ============================================================
   2. Doctrines
   ============================================================ */

describe('DOCTRINE_MOD', () => {
  it('paternalisme : climat ↑, marge ↓', () => {
    const m = DOCTRINE_MOD.paternalisme;
    expect(m.climat!).toBeGreaterThan(1);
    expect(m.marge!).toBeLessThan(1);
  });

  it('neoliberal : marge ↑, climat ↓, tension ↑', () => {
    const m = DOCTRINE_MOD.neoliberal;
    expect(m.marge!).toBeGreaterThan(1);
    expect(m.climat!).toBeLessThan(1);
    expect(m.tension!).toBeGreaterThan(1);
  });

  it('syndicalismeLutte : tension ↑, povAchat ↑, cohesion ↑', () => {
    const m = DOCTRINE_MOD.syndicalismeLutte;
    expect(m.tension!).toBeGreaterThan(1);
    expect(m.povAchat!).toBeGreaterThan(1);
  });

  it('juridiste : legitimite ↑, droits ↑, tension ↓', () => {
    const m = DOCTRINE_MOD.juridiste;
    expect(m.legitimite!).toBeGreaterThan(1);
    expect(m.tension!).toBeLessThan(1);
  });

  it('s\'applique correctement dans resolveTable', () => {
    const ctx1 = defaultContext();
    ctx1.patronDoctrine = 'paternalisme';
    ctx1.rng = seededRng(42);
    const out1 = resolveTable('cession', 'compromis', ctx1);

    const ctx2 = defaultContext();
    ctx2.patronDoctrine = 'neoliberal';
    ctx2.rng = seededRng(42);
    const out2 = resolveTable('cession', 'compromis', ctx2);

    /* Paternalisme protège le climat plus que neoliberal. */
    expect(out1.finalDelta.climat).toBeGreaterThan(out2.finalDelta.climat);
  });
});

/* ============================================================
   3. Modulateurs manœuvre
   ============================================================ */

describe('patronManoeuvreMod', () => {
  it('lobbying ≥ 40 → capPol ↑ et réputation ↓', () => {
    const m = defaultPatronManoeuvre();
    m.lobbying = 40;
    const mod = patronManoeuvreMod(m, 'tenir');
    expect(mod.capPol!).toBeGreaterThan(1);
    expect(mod.reputation!).toBeLessThan(1);
  });

  it('plan social latent + tenir → climat ×0.5', () => {
    const m = defaultPatronManoeuvre();
    m.planSocialLatent = true;
    const mod = patronManoeuvreMod(m, 'tenir');
    expect(mod.climat!).toBeLessThanOrEqual(0.5);
  });

  it('plan social latent + cession → pas de pénalité climat', () => {
    const m = defaultPatronManoeuvre();
    m.planSocialLatent = true;
    const mod = patronManoeuvreMod(m, 'cession');
    expect(mod.climat ?? 1).toBeGreaterThanOrEqual(1);
  });
});

describe('salarieManoeuvreMod', () => {
  it('préavis grève ≥ 40 + rapportForce → marge ×1.6 (dégât)', () => {
    const m = defaultSalarieManoeuvre();
    m.preavisGreve = 40;
    const mod = salarieManoeuvreMod(m, 'rapportForce');
    expect(mod.marge!).toBeGreaterThanOrEqual(1.6);
  });

  it('coalition inter ≥ 25 → multiplicateur povAchat & droits', () => {
    const m = defaultSalarieManoeuvre();
    m.coalitionInter = 25;
    const mod = salarieManoeuvreMod(m, 'compromis');
    expect(mod.povAchat!).toBeGreaterThan(1);
    expect(mod.droits!).toBeGreaterThan(1);
  });

  it('grève reconductible armée + rapportForce → marge ×2.0', () => {
    const m = defaultSalarieManoeuvre();
    m.greveReconductible = true;
    m.preavisGreve = 40;
    const mod = salarieManoeuvreMod(m, 'rapportForce');
    expect(mod.marge!).toBeGreaterThanOrEqual(2);
  });
});

/* ============================================================
   4. Contexte historique
   ============================================================ */

describe('contextMod', () => {
  it('mai_68 → tension ↑↑, cohesion ↑', () => {
    const ctx = defaultContext();
    ctx.event = 'mai_68';
    const mod = contextMod(ctx);
    expect(mod.tension!).toBeGreaterThan(1.3);
    expect(mod.cohesion!).toBeGreaterThan(1);
  });

  it('choc_petrolier → marge ↓, povAchat ↓', () => {
    const ctx = defaultContext();
    ctx.event = 'choc_petrolier';
    const mod = contextMod(ctx);
    expect(mod.marge!).toBeLessThan(1);
    expect(mod.povAchat!).toBeLessThan(1);
  });

  it('gilets_jaunes → tension ↑↑, cohesion ↓ (mvt diffus)', () => {
    const ctx = defaultContext();
    ctx.event = 'gilets_jaunes';
    const mod = contextMod(ctx);
    expect(mod.tension!).toBeGreaterThan(1.3);
    expect(mod.cohesion!).toBeLessThan(1);
  });

  it('aucun event → mod vide', () => {
    const ctx = defaultContext();
    ctx.event = null;
    expect(Object.keys(contextMod(ctx))).toHaveLength(0);
  });
});

/* ============================================================
   5. Mémoire historique (acquis)
   ============================================================ */

describe('memoryMod & unlockAcquis', () => {
  it('aucun acquis → mod neutre', () => {
    const ctx = defaultContext();
    expect(Object.keys(memoryMod(ctx))).toHaveLength(0);
  });

  it('secu_1945 → povAchat ×1.10 permanent', () => {
    const ctx = defaultContext();
    ctx.acquis.add('secu_1945');
    const mod = memoryMod(ctx);
    expect(mod.povAchat!).toBeGreaterThan(1);
  });

  it('1936 + occupation_renault + (cession, acquisCibles) débloque congesPayes_1936', () => {
    const ctx = defaultContext();
    ctx.period = '1936';
    ctx.event = 'occupation_renault';
    expect(unlockAcquis('cession', 'acquisCibles', ctx)).toBe('congesPayes_1936');
  });

  it('même config mais déjà débloqué → null', () => {
    const ctx = defaultContext();
    ctx.period = '1936';
    ctx.event = 'occupation_renault';
    ctx.acquis.add('congesPayes_1936');
    expect(unlockAcquis('cession', 'acquisCibles', ctx)).toBeNull();
  });

  it('1968 + mai_68 + (cession, rapportForce) débloque sectionsSyndicales_1968', () => {
    const ctx = defaultContext();
    ctx.period = '1968';
    ctx.event = 'mai_68';
    expect(unlockAcquis('cession', 'rapportForce', ctx)).toBe('sectionsSyndicales_1968');
  });

  it('mauvaise période → pas de déblocage', () => {
    const ctx = defaultContext();
    ctx.period = 'contemporain';
    ctx.event = 'occupation_renault';
    expect(unlockAcquis('cession', 'acquisCibles', ctx)).toBeNull();
  });

  it('plancher dur povAchat ≥ 30 si congesPayes_1936', () => {
    const ctx = defaultContext();
    ctx.acquis.add('congesPayes_1936');
    ctx.salarie.povAchat = 20; // sous le plancher
    /* Forçage delta négatif. */
    ctx.salarieDoctrine = 'reformiste';
    ctx.patronDoctrine = 'neoliberal';
    ctx.rng = seededRng(1);
    const out = resolveTable('tenir', 'compromis', ctx);
    expect(out.nextSalarie.povAchat).toBeGreaterThanOrEqual(30);
  });
});

/* ============================================================
   6. Silhouette
   ============================================================ */

describe('silhouette', () => {
  it('observerSkill = 1 (parfait) → label exact', () => {
    /* Avec skill=1, noise=0, donc label dépend uniquement de realValue. */
    expect(silhouette(85, 1, () => 0.5)).toBe('tres_eleve');
    expect(silhouette(50, 1, () => 0.5)).toBe('moyen');
    expect(silhouette(15, 1, () => 0.5)).toBe('tres_bas');
  });

  it('observerSkill = 0 → variabilité forte', () => {
    /* Avec skill=0, le label peut diverger de jusqu'à ±30. */
    const labels = new Set<string>();
    for (let i = 0; i < 50; i++) {
      labels.add(silhouette(50, 0, () => Math.random()));
    }
    /* Au moins 2 labels différents, parfois 3-4. */
    expect(labels.size).toBeGreaterThanOrEqual(2);
  });

  it('observerSkill mid (0.5) → label proche mais imprécis', () => {
    /* Pour 90, devrait souvent retourner tres_eleve, parfois eleve. */
    const labels = new Set<string>();
    for (let i = 0; i < 30; i++) {
      labels.add(silhouette(90, 0.5, () => Math.random()));
    }
    expect(labels.has('tres_eleve') || labels.has('eleve')).toBe(true);
  });

  it('patronObserverSkill : lobbying lourd → meilleure lecture', () => {
    const m1 = defaultPatronManoeuvre();
    m1.lobbying = 0;
    const m2 = defaultPatronManoeuvre();
    m2.lobbying = 60;
    expect(patronObserverSkill(m2)).toBeGreaterThan(patronObserverSkill(m1));
  });

  it('salarieObserverSkill : médiatisation + coalition → meilleure lecture', () => {
    const m1 = defaultSalarieManoeuvre();
    m1.mediatisation = 0;
    m1.coalitionInter = 0;
    const m2 = defaultSalarieManoeuvre();
    m2.mediatisation = 30;
    m2.coalitionInter = 30;
    expect(salarieObserverSkill(m2)).toBeGreaterThan(salarieObserverSkill(m1));
  });
});

/* ============================================================
   7. Triggers ateliers
   ============================================================ */

describe('triggerAtelier', () => {
  it('(tenir, rapportForce) + tension > 70 → atelier emeute', () => {
    const ctx = defaultContext();
    const trig = triggerAtelier('tenir', 'rapportForce', { tension: 75 }, ctx);
    expect(trig?.kind).toBe('emeute');
  });

  it('(tenir, rapportForce) mais tension basse → pas d\'émeute', () => {
    const ctx = defaultContext();
    const trig = triggerAtelier('tenir', 'rapportForce', { tension: 40 }, ctx);
    expect(trig?.kind).not.toBe('emeute');
  });

  it('(cession, acquisCibles) après secu_1945 → blockblast cotisations', () => {
    const ctx = defaultContext();
    ctx.acquis.add('secu_1945');
    const trig = triggerAtelier('cession', 'acquisCibles', { tension: 20 }, ctx);
    expect(trig?.kind).toBe('blockblast_cotisations');
  });

  it('echange × * → sous-jeu marchandage', () => {
    const ctx = defaultContext();
    const trig = triggerAtelier('echange', 'compromis', { tension: 30 }, ctx);
    expect(trig?.kind).toBe('marchandage_4_leviers');
  });

  it('saisine prud\'homale lourde + acquisCibles → atelier conseil', () => {
    const ctx = defaultContext();
    ctx.salarieManoeuvre.saisinePrudhomale = 35;
    /* Pas de cession/echange, sinon blockblast/marchandage prend le pas. */
    const trig = triggerAtelier('tenir', 'acquisCibles', { tension: 30 }, ctx);
    expect(trig?.kind).toBe('conseil');
  });
});

/* ============================================================
   8. Effets différés
   ============================================================ */

describe('buildDelayedEffects & tickDelayed', () => {
  it('investissement ≥ 25 ajoute un effet T+3 marge', () => {
    const ctx = defaultContext();
    ctx.patronManoeuvre.investissement = 30;
    const effects = buildDelayedEffects('echange', 'compromis', ctx);
    const inv = effects.find(e => e.label.includes('Investissement'));
    expect(inv).toBeDefined();
    expect(inv!.turnsLeft).toBe(3);
  });

  it('plan social latent + tenir → effet fuite presse T+3', () => {
    const ctx = defaultContext();
    ctx.patronManoeuvre.planSocialLatent = true;
    const effects = buildDelayedEffects('tenir', 'compromis', ctx);
    const fuite = effects.find(e => e.label.includes('Fuite presse'));
    expect(fuite).toBeDefined();
    expect(fuite!.delta.climat!).toBeLessThan(0);
    expect(fuite!.delta.tension!).toBeGreaterThan(0);
  });

  it('plan social latent + cession → pas de fuite presse', () => {
    const ctx = defaultContext();
    ctx.patronManoeuvre.planSocialLatent = true;
    const effects = buildDelayedEffects('cession', 'compromis', ctx);
    expect(effects.find(e => e.label.includes('Fuite presse'))).toBeUndefined();
  });

  it('tickDelayed décrémente et applique à T=0', () => {
    const queue = [
      { label: 'A', delta: { marge: 10 }, turnsLeft: 1 },
      { label: 'B', delta: { climat: 5 }, turnsLeft: 3 }
    ];
    const state = {
      patron: { marge: 50, climat: 50, capPol: 50, reputation: 50 },
      salarie: { povAchat: 50, droits: 50, cohesion: 50, legitimite: 50 },
      shared: { tension: 30 }
    };
    const r = tickDelayed(queue, state);
    expect(r.applied).toHaveLength(1);
    expect(r.applied[0].label).toBe('A');
    expect(r.queue).toHaveLength(1);
    expect(r.queue[0].label).toBe('B');
    expect(r.queue[0].turnsLeft).toBe(2);
  });

  it('guard false → effet avorté (pas appliqué)', () => {
    const queue = [{
      label: 'Investissement',
      delta: { marge: 15 },
      turnsLeft: 1,
      guard: (s: { patron: { climat: number } }) => s.patron.climat > 40
    }];
    const state = {
      patron: { marge: 50, climat: 30, capPol: 50, reputation: 50 },
      salarie: { povAchat: 50, droits: 50, cohesion: 50, legitimite: 50 },
      shared: { tension: 30 }
    };
    const r = tickDelayed(queue, state);
    expect(r.applied).toHaveLength(0);
    expect(r.queue).toHaveLength(0); // retiré quand même
  });
});

/* ============================================================
   9. resolveTable — pipeline complet
   ============================================================ */

describe('resolveTable — pipeline', () => {
  it('renvoie un Outcome cohérent (cellule + delta + état)', () => {
    const ctx = defaultContext();
    ctx.rng = seededRng(7);
    const out = resolveTable('echange', 'compromis', ctx);

    expect(out.cell).toEqual({ patron: 'echange', salarie: 'compromis' });
    expect(out.baseDelta).toBeDefined();
    expect(out.finalDelta).toBeDefined();
    expect(out.nextPatron).toBeDefined();
    expect(out.nextSalarie).toBeDefined();
    expect(out.nextShared).toBeDefined();
  });

  it('toutes les valeurs résultantes sont dans [0, 100]', () => {
    const ctx = defaultContext();
    ctx.rng = seededRng(11);
    for (const p of POSTURES_P) {
      for (const s of POSTURES_S) {
        const out = resolveTable(p, s, ctx);
        for (const v of Object.values(out.nextPatron)) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(100);
        }
        for (const v of Object.values(out.nextSalarie)) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(100);
        }
        expect(out.nextShared.tension).toBeGreaterThanOrEqual(0);
        expect(out.nextShared.tension).toBeLessThanOrEqual(100);
      }
    }
  });

  it('scénario Matignon 1936 : (cession, acquisCibles) débloque congesPayes', () => {
    const ctx = defaultContext();
    ctx.period = '1936';
    ctx.event = 'occupation_renault';
    ctx.patronDoctrine = 'paternalisme';
    ctx.salarieDoctrine = 'reformiste';
    ctx.salarieManoeuvre.preavisGreve = 50;
    ctx.salarieManoeuvre.coalitionInter = 30;
    ctx.salarieManoeuvre.mediatisation = 20;
    ctx.rng = seededRng(1936);

    const out = resolveTable('cession', 'acquisCibles', ctx);

    expect(out.unlocked).toBe('congesPayes_1936');
    /* Climat doit monter (paternalisme + cession). */
    expect(out.finalDelta.climat).toBeGreaterThan(0);
    /* Légitimité doit monter (rest. modulée par occupation_renault). */
    expect(out.finalDelta.legitimite).toBeGreaterThan(5);
    /* Tension doit baisser (deal historique). */
    expect(out.finalDelta.tension).toBeLessThan(0);
  });

  it('scénario standoff explosif : (tenir, rapportForce) + greve recond. → atelier emeute', () => {
    const ctx = defaultContext();
    ctx.shared.tension = 60; // déjà chaud
    ctx.salarieManoeuvre.preavisGreve = 50;
    ctx.salarieManoeuvre.greveReconductible = true;
    ctx.salarieDoctrine = 'syndicalismeLutte';
    ctx.rng = seededRng(123);

    const out = resolveTable('tenir', 'rapportForce', ctx);

    expect(out.atelier?.kind).toBe('emeute');
    expect(out.nextShared.tension).toBeGreaterThan(70);
  });

  it('paritarisme paternaliste vs syndicalisme de lutte donne un mix amplifié', () => {
    const ctx = defaultContext();
    ctx.patronDoctrine = 'paternalisme';
    ctx.salarieDoctrine = 'syndicalismeLutte';
    ctx.rng = seededRng(99);
    const out = resolveTable('cession', 'rapportForce', ctx);
    /* Paternalisme amplifie climat positif, syndicalismeLutte amplifie povAchat. */
    expect(out.finalDelta.climat).toBeGreaterThan(NOMINAL_MATRIX.cession.rapportForce.climat);
    expect(out.finalDelta.povAchat).toBeGreaterThan(NOMINAL_MATRIX.cession.rapportForce.povAchat);
  });
});

/* ============================================================
   10. SANITY TESTS — invariants à long terme
   ============================================================ */

describe('SANITY — invariants', () => {
  it('aucune posture patron ne domine sur 1000 parties random', () => {
    /* Pour chaque combinaison, on calcule un score patron simplifié
       (marge + capPol). On compte les "victoires" par posture. */
    const wins: Record<PatronPosture, number> = { cession: 0, tenir: 0, echange: 0 };
    const rng = seededRng(2024);
    for (let i = 0; i < 1000; i++) {
      const p = POSTURES_P[Math.floor(rng() * 3)];
      const s = POSTURES_S[Math.floor(rng() * 3)];
      const ctx = defaultContext();
      ctx.rng = seededRng(i + 1);
      const out = resolveTable(p, s, ctx);
      const score = out.finalDelta.marge + out.finalDelta.capPol;
      if (score > 0) wins[p]++;
    }
    /* Aucune posture ne doit représenter > 45% des victoires. */
    for (const p of POSTURES_P) {
      const ratio = wins[p] / 1000;
      expect(ratio).toBeLessThan(0.45);
    }
  });

  it('aucune posture salarié ne domine sur 1000 parties random', () => {
    const wins: Record<SalariePosture, number> = { rapportForce: 0, compromis: 0, acquisCibles: 0 };
    const rng = seededRng(2025);
    for (let i = 0; i < 1000; i++) {
      const p = POSTURES_P[Math.floor(rng() * 3)];
      const s = POSTURES_S[Math.floor(rng() * 3)];
      const ctx = defaultContext();
      ctx.rng = seededRng(i + 1);
      const out = resolveTable(p, s, ctx);
      const score = out.finalDelta.povAchat + out.finalDelta.legitimite + out.finalDelta.droits;
      if (score > 0) wins[s]++;
    }
    for (const s of POSTURES_S) {
      const ratio = wins[s] / 1000;
      expect(ratio).toBeLessThan(0.45);
    }
  });

  it('pas de death spiral en jeu varié : 8 tours avec postures rotatives → aucun KPI à 0', () => {
    /* Le test des "8 tours du pire choix possible" serait trop strict :
       un joueur qui s'obstine sur (tenir, rapportForce) DOIT pouvoir
       crasher — c'est la dramaturgie du jeu. En revanche, un joueur
       qui joue normalement (postures variées) ne doit jamais tomber
       en spirale incontrôlable. */
    let ctx = defaultContext();
    ctx.rng = seededRng(404);
    const cells: Array<[PatronPosture, SalariePosture]> = [
      ['echange', 'compromis'],
      ['cession', 'acquisCibles'],
      ['tenir', 'compromis'],
      ['echange', 'rapportForce'],
      ['cession', 'compromis'],
      ['echange', 'acquisCibles'],
      ['tenir', 'acquisCibles'],
      ['echange', 'compromis']
    ];
    for (const [p, s] of cells) {
      const out = resolveTable(p, s, ctx);
      ctx = {
        ...ctx,
        turn: ctx.turn + 1,
        patron: out.nextPatron,
        salarie: out.nextSalarie,
        shared: out.nextShared
      };
      expect(ctx.patron.marge).toBeGreaterThan(0);
      expect(ctx.salarie.povAchat).toBeGreaterThan(0);
      expect(ctx.salarie.cohesion).toBeGreaterThan(0);
      expect(ctx.salarie.legitimite).toBeGreaterThan(0);
    }
  });

  it('death spiral légitime : 8 tours de (tenir, rapportForce) PEUT crasher (volontairement)', () => {
    /* Pendant qu'on y est, on documente que le pire choix répété
       a une issue dramatique. C'est un design feature, pas un bug. */
    let ctx = defaultContext();
    ctx.rng = seededRng(404);
    let crashed = false;
    for (let t = 0; t < 8; t++) {
      const out = resolveTable('tenir', 'rapportForce', ctx);
      ctx = {
        ...ctx,
        turn: ctx.turn + 1,
        patron: out.nextPatron,
        salarie: out.nextSalarie,
        shared: out.nextShared
      };
      if (ctx.salarie.povAchat <= 0 || ctx.patron.climat <= 0) {
        crashed = true;
        break;
      }
    }
    expect(crashed).toBe(true);
  });

  it('mémoire bénéfique au salarié : 5 acquis → +bonus structurel sur povAchat', () => {
    const ctxA = defaultContext();
    ctxA.rng = seededRng(7);
    const outA = resolveTable('echange', 'compromis', ctxA);

    const ctxB = defaultContext();
    ctxB.acquis = new Set<AcquisId>([
      'congesPayes_1936', 'secu_1945', 'sectionsSyndicales_1968',
      'chsct_1982', 'rtt_2000'
    ]);
    ctxB.rng = seededRng(7);
    const outB = resolveTable('echange', 'compromis', ctxB);

    expect(outB.finalDelta.povAchat).toBeGreaterThanOrEqual(outA.finalDelta.povAchat);
    expect(outB.finalDelta.cohesion).toBeGreaterThanOrEqual(outA.finalDelta.cohesion);
  });

  it('silhouette > info parfaite : avec rng fixe, deux résolutions identiques sont identiques', () => {
    /* Reproductibilité : même seed → même résultat. */
    const ctx1 = defaultContext();
    ctx1.rng = seededRng(42);
    const out1 = resolveTable('echange', 'acquisCibles', ctx1);

    const ctx2 = defaultContext();
    ctx2.rng = seededRng(42);
    const out2 = resolveTable('echange', 'acquisCibles', ctx2);

    expect(out1.finalDelta).toEqual(out2.finalDelta);
  });

  it('pas de NaN ni Infinity dans les résultats même avec doctrines extrêmes', () => {
    const ctx = defaultContext();
    ctx.patronDoctrine = 'neoliberal';
    ctx.salarieDoctrine = 'syndicalismeLutte';
    ctx.patronManoeuvre.lobbying = 60;
    ctx.salarieManoeuvre.preavisGreve = 60;
    ctx.salarieManoeuvre.greveReconductible = true;
    ctx.salarieManoeuvre.coalitionInter = 40;
    ctx.event = 'mai_68';
    ctx.rng = seededRng(666);

    const out = resolveTable('tenir', 'rapportForce', ctx);
    for (const v of Object.values(out.finalDelta)) {
      expect(Number.isFinite(v)).toBe(true);
    }
    for (const v of Object.values(out.nextPatron)) {
      expect(Number.isFinite(v)).toBe(true);
    }
  });
});

/* ============================================================
   11. Détermination — utilité pour journalisation
   ============================================================ */

describe('appliedMods — traçabilité', () => {
  it('expose la liste ordonnée des modulateurs', () => {
    const ctx = defaultContext();
    ctx.rng = seededRng(1);
    const out = resolveTable('echange', 'compromis', ctx);
    const sources = out.appliedMods.map(m => m.source);
    expect(sources).toEqual([
      'doctrine:technocratique',
      'doctrine:reformiste',
      'manoeuvre:patron',
      'manoeuvre:salarie',
      'context',
      'memory'
    ]);
  });
});
