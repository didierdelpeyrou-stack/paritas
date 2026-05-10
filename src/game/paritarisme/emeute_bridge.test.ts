/**
 * Tests du pont dialectique × Émeute.
 *
 * Garantit :
 *   - mapping doctrine → personnage cohérent narrativement
 *   - cohésion → stocks (clamp [1, 5])
 *   - tension → durée du match (frénétique si tension haute)
 *   - IA adverse calibrée selon KPI joueur
 *   - applyEmeuteResult : signe correct des deltas selon vainqueur
 *   - margin module l'amplitude
 *   - draw → état intermédiaire stable
 */
import { describe, it, expect } from 'vitest';
import {
  doctrineToChar,
  cohesionToStocks,
  cpuLevelForOpponent,
  tensionToDurationMs,
  kpiToMatchConfig,
  applyEmeuteResult,
  emeuteResultFromIndex,
  shouldTriggerEmeute,
  type EmeuteOutcome
} from './emeute_bridge';
import {
  resolveTable,
  defaultContext,
  type ResolveOutcome
} from './dialectic';

/* ============================================================
   1. Mapping doctrine → personnage
   ============================================================ */

describe('doctrineToChar', () => {
  it('couvre les 8 doctrines sans throw', () => {
    expect(doctrineToChar('paternalisme')).toBe('pragmatique');
    expect(doctrineToChar('neoliberal')).toBe('rupture');
    expect(doctrineToChar('technocratique')).toBe('tribun');
    expect(doctrineToChar('corporatiste')).toBe('pragmatique');
    expect(doctrineToChar('reformiste')).toBe('pragmatique');
    expect(doctrineToChar('syndicalismeLutte')).toBe('rupture');
    expect(doctrineToChar('autogestionnaire')).toBe('batisseur');
    expect(doctrineToChar('juridiste')).toBe('batisseur');
  });

  it('neoliberal et syndicalismeLutte → rupture (les deux camps "agressifs")', () => {
    /* Cohérence : les doctrines combatives partagent un personnage,
       ce qui sera lisible visuellement à la mêlée. */
    expect(doctrineToChar('neoliberal')).toBe(doctrineToChar('syndicalismeLutte'));
  });

  it('autogestionnaire et juridiste → batisseur (les deux "résistants")', () => {
    expect(doctrineToChar('autogestionnaire')).toBe(doctrineToChar('juridiste'));
  });
});

/* ============================================================
   2. Cohésion → stocks
   ============================================================ */

describe('cohesionToStocks', () => {
  it('cohésion 0 → 1 stock', () => {
    expect(cohesionToStocks(0)).toBe(1);
  });
  it('cohésion 50 → 3 stocks', () => {
    expect(cohesionToStocks(50)).toBe(3);
  });
  it('cohésion 100 → 5 stocks', () => {
    expect(cohesionToStocks(100)).toBe(5);
  });
  it('cohésion 24 → 1 stock, 25 → 2 stocks (boundary)', () => {
    expect(cohesionToStocks(24)).toBe(1);
    expect(cohesionToStocks(25)).toBe(2);
  });
  it('clamp valeurs hors borne', () => {
    expect(cohesionToStocks(-50)).toBe(1);
    expect(cohesionToStocks(150)).toBe(5);
  });
});

/* ============================================================
   3. CPU level adverse
   ============================================================ */

describe('cpuLevelForOpponent', () => {
  it('joueur salarié, patron riche (marge 80) → CPU patron hard', () => {
    const lvl = cpuLevelForOpponent(
      'salarie',
      { marge: 80, climat: 50, capPol: 50, reputation: 50 },
      { povAchat: 50, droits: 50, cohesion: 50, legitimite: 50 }
    );
    expect(lvl).toBe(2);
  });

  it('joueur salarié, patron pauvre (marge 20) → CPU patron easy', () => {
    const lvl = cpuLevelForOpponent(
      'salarie',
      { marge: 20, climat: 50, capPol: 50, reputation: 50 },
      { povAchat: 50, droits: 50, cohesion: 50, legitimite: 50 }
    );
    expect(lvl).toBe(0);
  });

  it('joueur patron, salarié légitimé (légit 80) → CPU salarié hard', () => {
    const lvl = cpuLevelForOpponent(
      'patron',
      { marge: 50, climat: 50, capPol: 50, reputation: 50 },
      { povAchat: 50, droits: 50, cohesion: 50, legitimite: 80 }
    );
    expect(lvl).toBe(2);
  });
});

/* ============================================================
   4. Tension → durée
   ============================================================ */

describe('tensionToDurationMs', () => {
  it('tension 0 → 90s (90 000 ms)', () => {
    expect(tensionToDurationMs(0)).toBe(90_000);
  });
  it('tension 100 → 30s', () => {
    expect(tensionToDurationMs(100)).toBe(30_000);
  });
  it('tension 50 → 60s', () => {
    expect(tensionToDurationMs(50)).toBe(60_000);
  });
  it('clamp', () => {
    expect(tensionToDurationMs(-10)).toBe(90_000);
    expect(tensionToDurationMs(200)).toBe(30_000);
  });
});

/* ============================================================
   5. kpiToMatchConfig — façade
   ============================================================ */

describe('kpiToMatchConfig', () => {
  function fakeOutcome(): ResolveOutcome {
    /* Construit un Outcome plausible via resolveTable pour avoir un
       vrai objet, sans être obligé de le mocker à la main. */
    const ctx = defaultContext();
    ctx.shared.tension = 60;
    return resolveTable('tenir', 'rapportForce', ctx);
  }

  it('produit un MatchConfig à 2 joueurs (humain + CPU)', () => {
    const cfg = kpiToMatchConfig(
      fakeOutcome(),
      { marge: 50, climat: 50, capPol: 50, reputation: 50 },
      { povAchat: 50, droits: 50, cohesion: 50, legitimite: 50 },
      { tension: 50 },
      { patron: 'paternalisme', salarie: 'reformiste' }
    );
    expect(cfg.characters).toHaveLength(2);
    expect(cfg.controls).toEqual(['human', 'cpu']);
  });

  it('par défaut, P1 = salarié (joueur), P2 = patron (CPU)', () => {
    const cfg = kpiToMatchConfig(
      fakeOutcome(),
      { marge: 50, climat: 50, capPol: 50, reputation: 50 },
      { povAchat: 50, droits: 50, cohesion: 50, legitimite: 50 },
      { tension: 50 },
      { patron: 'neoliberal', salarie: 'syndicalismeLutte' }
    );
    /* Salarié syndicalismeLutte → rupture, patron neoliberal → rupture aussi. */
    expect(cfg.characters[0]).toBe('rupture');
    expect(cfg.characters[1]).toBe('rupture');
  });

  it('option playerSide=patron inverse l\'ordre', () => {
    const cfg = kpiToMatchConfig(
      fakeOutcome(),
      { marge: 50, climat: 50, capPol: 50, reputation: 50 },
      { povAchat: 50, droits: 50, cohesion: 50, legitimite: 50 },
      { tension: 50 },
      { patron: 'paternalisme', salarie: 'reformiste' },
      { playerSide: 'patron' }
    );
    /* Patron paternalisme → pragmatique, salarié reformiste → pragmatique. */
    expect(cfg.characters[0]).toBe('pragmatique');
    expect(cfg.characters[1]).toBe('pragmatique');
  });

  it('cohésion salarié 75 → 4 stocks (joueur=salarié)', () => {
    const cfg = kpiToMatchConfig(
      fakeOutcome(),
      { marge: 50, climat: 50, capPol: 50, reputation: 50 },
      { povAchat: 50, droits: 50, cohesion: 75, legitimite: 50 },
      { tension: 50 },
      { patron: 'paternalisme', salarie: 'reformiste' }
    );
    expect(cfg.stocks).toBe(4);
  });

  it('tension 80 → match court (~42s)', () => {
    const cfg = kpiToMatchConfig(
      fakeOutcome(),
      { marge: 50, climat: 50, capPol: 50, reputation: 50 },
      { povAchat: 50, droits: 50, cohesion: 50, legitimite: 50 },
      { tension: 80 },
      { patron: 'paternalisme', salarie: 'reformiste' }
    );
    expect(cfg.durationMs).toBe(42_000);
  });

  it('teams [0, 0] (FFA en 1v1, pas de team mode)', () => {
    const cfg = kpiToMatchConfig(
      fakeOutcome(),
      { marge: 50, climat: 50, capPol: 50, reputation: 50 },
      { povAchat: 50, droits: 50, cohesion: 50, legitimite: 50 },
      { tension: 50 },
      { patron: 'paternalisme', salarie: 'reformiste' }
    );
    expect(cfg.teams).toEqual([0, 0]);
  });
});

/* ============================================================
   6. applyEmeuteResult — deltas
   ============================================================ */

describe('applyEmeuteResult', () => {
  it('victoire salarié → légit ↑, climat patron ↓, tension ↓', () => {
    const d = applyEmeuteResult({ winner: 'salarie', margin: 1 });
    expect(d.legitimite!).toBeGreaterThan(0);
    expect(d.climat!).toBeLessThan(0);
    expect(d.tension!).toBeLessThan(0);
    expect(d.capPol!).toBeLessThan(0);
  });

  it('victoire patron → capPol ↑, cohésion ↓, tension ↑', () => {
    const d = applyEmeuteResult({ winner: 'patron', margin: 1 });
    expect(d.capPol!).toBeGreaterThan(0);
    expect(d.cohesion!).toBeLessThan(0);
    expect(d.tension!).toBeGreaterThan(0);
  });

  it('match nul → tension ↓ légère, légit + 2', () => {
    const d = applyEmeuteResult({ winner: 'draw', margin: 0 });
    expect(d.tension!).toBeLessThan(0);
    expect(d.legitimite!).toBeGreaterThan(0);
    expect(d.legitimite!).toBeLessThanOrEqual(5);
  });

  it('margin 0.5 < margin 1 (amplitude proportionnelle)', () => {
    const d_serre = applyEmeuteResult({ winner: 'salarie', margin: 0 });
    const d_total = applyEmeuteResult({ winner: 'salarie', margin: 1 });
    expect(Math.abs(d_total.legitimite!)).toBeGreaterThan(Math.abs(d_serre.legitimite!));
  });

  it('margin clampé à [0, 1]', () => {
    const d_under = applyEmeuteResult({ winner: 'salarie', margin: -1 } as EmeuteOutcome);
    const d_zero = applyEmeuteResult({ winner: 'salarie', margin: 0 });
    expect(d_under).toEqual(d_zero);
    /* margin > 1 = clamp à 1. */
    const d_over = applyEmeuteResult({ winner: 'salarie', margin: 5 } as EmeuteOutcome);
    const d_max = applyEmeuteResult({ winner: 'salarie', margin: 1 });
    expect(d_over).toEqual(d_max);
  });
});

/* ============================================================
   7. emeuteResultFromIndex — adapter callback
   ============================================================ */

describe('emeuteResultFromIndex', () => {
  it('winnerIndex = null → draw', () => {
    expect(emeuteResultFromIndex(null)).toEqual({ winner: 'draw', margin: 0 });
  });

  it('joueur=salarié, index 0 (humain) → vainqueur salarié', () => {
    expect(emeuteResultFromIndex(0, 'salarie').winner).toBe('salarie');
  });

  it('joueur=salarié, index 1 (CPU) → vainqueur patron', () => {
    expect(emeuteResultFromIndex(1, 'salarie').winner).toBe('patron');
  });

  it('joueur=patron, index 0 (humain) → vainqueur patron', () => {
    expect(emeuteResultFromIndex(0, 'patron').winner).toBe('patron');
  });

  it('joueur=patron, index 1 (CPU) → vainqueur salarié', () => {
    expect(emeuteResultFromIndex(1, 'patron').winner).toBe('salarie');
  });
});

/* ============================================================
   8. shouldTriggerEmeute — prédicat
   ============================================================ */

describe('shouldTriggerEmeute', () => {
  it('true si outcome.atelier.kind === "emeute"', () => {
    const ctx = defaultContext();
    ctx.shared.tension = 65; // doit dépasser 70 après modulation neoliberal
    ctx.patronDoctrine = 'neoliberal';
    ctx.salarieDoctrine = 'syndicalismeLutte';
    ctx.salarieManoeuvre.preavisGreve = 50;
    const out = resolveTable('tenir', 'rapportForce', ctx);
    expect(shouldTriggerEmeute(out)).toBe(true);
  });

  it('false si autre atelier (marchandage, blockblast)', () => {
    const ctx = defaultContext();
    const out = resolveTable('echange', 'compromis', ctx);
    expect(shouldTriggerEmeute(out)).toBe(false);
  });

  it('false si pas de trigger atelier du tout', () => {
    /* Cellule (T, C) ne déclenche aucun atelier dans le mapping actuel. */
    const ctx = defaultContext();
    const out = resolveTable('tenir', 'compromis', ctx);
    expect(shouldTriggerEmeute(out)).toBe(false);
  });
});

/* ============================================================
   9. INTÉGRATION — bout en bout
   ============================================================ */

describe('intégration : (T,R) tendu → Émeute → application delta', () => {
  it('scénario complet : standoff → mêlée → salarié gagne → légit ↑', () => {
    /* 1. Setup contexte standoff. */
    const ctx = defaultContext();
    ctx.shared.tension = 60;
    ctx.patronDoctrine = 'neoliberal';
    ctx.salarieDoctrine = 'syndicalismeLutte';
    ctx.salarieManoeuvre.preavisGreve = 50;
    ctx.salarieManoeuvre.greveReconductible = true;
    ctx.rng = () => 0.5;

    /* 2. Résolution dialectique → trigger emeute. */
    const out = resolveTable('tenir', 'rapportForce', ctx);
    expect(shouldTriggerEmeute(out)).toBe(true);

    /* 3. Bridge → MatchConfig. */
    const cfg = kpiToMatchConfig(
      out,
      ctx.patron,
      ctx.salarie,
      out.nextShared,
      { patron: ctx.patronDoctrine, salarie: ctx.salarieDoctrine }
    );
    expect(cfg.characters).toEqual(['rupture', 'rupture']);
    expect(cfg.cpuLevels).toBeDefined();

    /* 4. Mêlée jouée — résultat simulé : humain (salarié) gagne. */
    const result = emeuteResultFromIndex(0, 'salarie');
    expect(result.winner).toBe('salarie');

    /* 5. Application du delta post-mêlée. */
    const post = applyEmeuteResult(result);
    expect(post.legitimite!).toBeGreaterThan(0);
    expect(post.tension!).toBeLessThan(0);
  });
});
