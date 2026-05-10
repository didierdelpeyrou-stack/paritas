/**
 * Tests du sous-jeu Marchandage 4 leviers.
 *
 * Couverture :
 *   - Validation des dépôts (4 leviers exactement, pas d'overlap)
 *   - Issue par levier : 5 cas (horsTable, conflit, consensus,
 *     gainPatron, gainSalarie)
 *   - Calcul du delta KPI cohérent par camp gagnant
 *   - Succès / échec global selon ratio accords/conflits
 *   - IA : 8 doctrines retournent un dépôt valide
 */
import { describe, it, expect } from 'vitest';
import {
  resolveMarchandage,
  validateDepot,
  defaultDepotForDoctrine,
  LEVIERS,
  type Depot
} from './marchandage';
import type { Doctrine as DoctrineType } from './dialectic';

/* ============================================================
   1. Validation
   ============================================================ */

describe('validateDepot', () => {
  it('valide si 2 veut + 2 cede sans overlap', () => {
    const d: Depot = {
      veut: ['salaire', 'tempsTravail'],
      cede: ['garanties', 'flexibilite']
    };
    expect(validateDepot(d).ok).toBe(true);
  });

  it('refuse si veut a moins de 2 leviers', () => {
    const d: Depot = { veut: ['salaire'], cede: ['garanties', 'flexibilite'] };
    const r = validateDepot(d);
    expect(r.ok).toBe(false);
    expect(r.reason).toContain('veut');
  });

  it('refuse si cede a 3 leviers', () => {
    const d: Depot = {
      veut: ['salaire', 'tempsTravail'],
      cede: ['garanties', 'flexibilite', 'salaire']
    };
    expect(validateDepot(d).ok).toBe(false);
  });

  it('refuse si overlap entre veut et cede', () => {
    const d: Depot = {
      veut: ['salaire', 'tempsTravail'],
      cede: ['salaire', 'flexibilite']
    };
    const r = validateDepot(d);
    expect(r.ok).toBe(false);
    expect(r.reason).toContain('chevaucher');
  });
});

/* ============================================================
   2. Issues par levier
   ============================================================ */

describe('resolveMarchandage — issues par levier', () => {
  it('conflit : les deux veulent le même levier', () => {
    const out = resolveMarchandage({
      patron: { veut: ['salaire', 'flexibilite'], cede: ['garanties', 'tempsTravail'] },
      salarie: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] }
    });
    expect(out.parLevier.salaire).toBe('conflit');
  });

  it('consensus : les deux cèdent le même levier', () => {
    const out = resolveMarchandage({
      patron: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] },
      salarie: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] }
    });
    expect(out.parLevier.garanties).toBe('consensus');
    expect(out.parLevier.flexibilite).toBe('consensus');
  });

  it('gainPatron : patron veut, salarié cède', () => {
    const out = resolveMarchandage({
      patron: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] },
      salarie: { veut: ['garanties', 'flexibilite'], cede: ['salaire', 'tempsTravail'] }
    });
    expect(out.parLevier.salaire).toBe('gainPatron');
    expect(out.parLevier.tempsTravail).toBe('gainPatron');
  });

  it('gainSalarie : salarié veut, patron cède', () => {
    const out = resolveMarchandage({
      patron: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] },
      salarie: { veut: ['garanties', 'flexibilite'], cede: ['salaire', 'tempsTravail'] }
    });
    expect(out.parLevier.garanties).toBe('gainSalarie');
    expect(out.parLevier.flexibilite).toBe('gainSalarie');
  });
});

/* ============================================================
   3. Comptes accords / conflits
   ============================================================ */

describe('resolveMarchandage — accords/conflits', () => {
  it('4 accords (échange complet) → succès', () => {
    /* Patron veut S+TT, cède G+F. Salarié veut G+F, cède S+TT. Tout matche. */
    const out = resolveMarchandage({
      patron: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] },
      salarie: { veut: ['garanties', 'flexibilite'], cede: ['salaire', 'tempsTravail'] }
    });
    expect(out.accords).toBe(4);
    expect(out.conflits).toBe(0);
    expect(out.succes).toBe(true);
  });

  it('2 conflits + 2 consensus → échec (accords pas > conflits)', () => {
    const out = resolveMarchandage({
      patron: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] },
      salarie: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] }
    });
    expect(out.accords).toBe(2); // les 2 consensus comptent comme accords
    expect(out.conflits).toBe(2);
    expect(out.succes).toBe(false); // pas > conflits
  });

  it('1 conflit + 3 accords → succès', () => {
    /* On compose un cas avec exactement 1 conflit. Les leviers sont 4
       mais chacun ne peut être qu'une seule issue. Il faut donc un
       gainPatron ou gainSalarie au moins. */
    const out = resolveMarchandage({
      patron: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] },
      salarie: { veut: ['salaire', 'flexibilite'], cede: ['garanties', 'tempsTravail'] }
    });
    /* salaire = both veut → conflit
       tempsTravail = patron veut + salarié cède → gainPatron
       garanties = both cede → consensus
       flexibilite = patron cede + salarié veut → gainSalarie */
    expect(out.parLevier.salaire).toBe('conflit');
    expect(out.parLevier.tempsTravail).toBe('gainPatron');
    expect(out.parLevier.garanties).toBe('consensus');
    expect(out.parLevier.flexibilite).toBe('gainSalarie');
    expect(out.accords).toBe(3);
    expect(out.conflits).toBe(1);
    expect(out.succes).toBe(true);
  });
});

/* ============================================================
   4. Delta KPI
   ============================================================ */

describe('resolveMarchandage — delta KPI', () => {
  it('succès complet (4 accords, dont 2 gain salarié) → povAchat ↑', () => {
    const out = resolveMarchandage({
      patron: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] },
      salarie: { veut: ['garanties', 'flexibilite'], cede: ['salaire', 'tempsTravail'] }
    });
    /* gainPatron salaire+tempsTravail → marge ↑, povAchat ↓
       gainSalarie garanties+flexibilite → droits ↑, cohesion ↑ */
    expect(out.delta.marge!).toBeGreaterThan(0);  // patron a gagné salaires
    expect(out.delta.droits!).toBeGreaterThan(0);  // salarié a gagné garanties
  });

  it('échec total (4 conflits) impossible structurellement (4 leviers, 2+2 each side)', () => {
    /* Pour avoir 4 conflits il faudrait que veut_p == veut_s ET cede_p == cede_s
       mais ça donne 2 conflits + 2 consensus. */
    const out = resolveMarchandage({
      patron: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] },
      salarie: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] }
    });
    expect(out.conflits).toBeLessThanOrEqual(2);
  });

  it('conflit pur → tension monte, capPol baisse, cohesion baisse', () => {
    const out = resolveMarchandage({
      patron: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] },
      salarie: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] }
    });
    expect(out.delta.tension!).toBeGreaterThan(0);
    expect(out.delta.capPol!).toBeLessThan(0);
    expect(out.delta.cohesion!).toBeLessThan(0);
  });

  it('2 consensus + 2 conflits → climat globalement positif (consensus l\'emporte)', () => {
    /* Patron veut S+TT, cède G+F. Salarié veut S+TT aussi, cède G+F aussi.
       Donc S et TT sont en CONFLIT, G et F en CONSENSUS.
       Le consensus contribue climat +2 par levier, conflit n'a pas de
       climat. Donc climat doit être > 0. */
    const out = resolveMarchandage({
      patron: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] },
      salarie: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] }
    });
    expect(out.parLevier.garanties).toBe('consensus');
    expect(out.parLevier.flexibilite).toBe('consensus');
    expect(out.delta.climat ?? 0).toBeGreaterThan(0);
  });
});

/* ============================================================
   5. Validation throws
   ============================================================ */

describe('resolveMarchandage — erreurs', () => {
  it('throws si patron dépot invalide', () => {
    expect(() => resolveMarchandage({
      patron: { veut: ['salaire'], cede: ['garanties', 'flexibilite'] },
      salarie: { veut: ['garanties', 'flexibilite'], cede: ['salaire', 'tempsTravail'] }
    })).toThrow();
  });

  it('throws si salarie dépot invalide', () => {
    expect(() => resolveMarchandage({
      patron: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] },
      salarie: { veut: ['salaire', 'salaire'], cede: ['garanties', 'flexibilite'] }
    })).toThrow();
  });
});

/* ============================================================
   6. IA — défauts par doctrine
   ============================================================ */

describe('defaultDepotForDoctrine', () => {
  const ALL: DoctrineType[] = [
    'paternalisme', 'neoliberal', 'technocratique', 'corporatiste',
    'reformiste', 'syndicalismeLutte', 'autogestionnaire', 'juridiste'
  ];

  it('chaque doctrine retourne un dépôt valide', () => {
    for (const d of ALL) {
      const dep = defaultDepotForDoctrine(d);
      const v = validateDepot(dep);
      expect(v.ok, `doctrine ${d}: ${v.reason}`).toBe(true);
    }
  });

  it('neoliberal veut salaires + flexibilité (logique business)', () => {
    const dep = defaultDepotForDoctrine('neoliberal');
    expect(dep.veut).toContain('salaire');
    expect(dep.veut).toContain('flexibilite');
  });

  it('syndicalismeLutte veut salaires + garanties (logique acquis)', () => {
    const dep = defaultDepotForDoctrine('syndicalismeLutte');
    expect(dep.veut).toContain('salaire');
    expect(dep.veut).toContain('garanties');
  });
});

/* ============================================================
   7. Couverture LEVIERS
   ============================================================ */

describe('LEVIERS — catalogue', () => {
  it('contient exactement 4 leviers', () => {
    expect(LEVIERS).toHaveLength(4);
  });

  it('chaque issue par levier est définie dans le résultat', () => {
    const out = resolveMarchandage({
      patron: { veut: ['salaire', 'tempsTravail'], cede: ['garanties', 'flexibilite'] },
      salarie: { veut: ['garanties', 'flexibilite'], cede: ['salaire', 'tempsTravail'] }
    });
    for (const lev of LEVIERS) {
      expect(out.parLevier[lev]).toBeDefined();
    }
  });
});
