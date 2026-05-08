/* Couverture Vitest P1 ORDA-016 — org/talents.ts (était 0%).
   Catalogue de 42 talents recrutables avec bonus par groupe
   d'affectation (réflexion / action / communication). Pivot du
   panneau "Recrutement" de l'organisation joueur. */

import { describe, it, expect } from 'vitest';
import {
  TALENT_CATALOG,
  talentsForCamp,
  talentById,
  GROUP_LABELS,
  GROUP_BLURBS,
  type TalentCatalogEntry
} from './talents';

const VALID_CAMPS = new Set(['salarie', 'patron']);
const VALID_GROUPS = new Set(['reflexion', 'action', 'communication']);

describe('talents — TALENT_CATALOG (cardinalité & structure)', () => {
  it('expose ≥30 talents', () => {
    expect(TALENT_CATALOG.length).toBeGreaterThanOrEqual(30);
  });

  it('chaque talent a un id unique', () => {
    const ids = TALENT_CATALOG.map(t => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(TALENT_CATALOG.length);
  });

  it('chaque entrée a les champs requis (id, nom, specialite, camp, cost, perTurn)', () => {
    for (const t of TALENT_CATALOG) {
      expect(typeof t.id).toBe('string');
      expect(t.id.length).toBeGreaterThan(0);
      expect(typeof t.nom).toBe('string');
      expect(t.nom.length).toBeGreaterThan(0);
      expect(typeof t.specialite).toBe('string');
      expect(t.specialite.length).toBeGreaterThan(0);
      expect(typeof t.blurb).toBe('string');
      expect(VALID_CAMPS.has(t.camp)).toBe(true);
      expect(typeof t.cost).toBe('number');
      expect(t.cost).toBeGreaterThan(0);
      expect(t.perTurn).toBeDefined();
    }
  });

  it('le coût (cost) reste dans une plage raisonnable [5, 25]', () => {
    for (const t of TALENT_CATALOG) {
      expect(t.cost).toBeGreaterThanOrEqual(5);
      expect(t.cost).toBeLessThanOrEqual(25);
    }
  });

  it('chaque clé de perTurn correspond à un groupe valide', () => {
    for (const t of TALENT_CATALOG) {
      const groups = Object.keys(t.perTurn);
      expect(groups.length).toBeGreaterThan(0);
      for (const g of groups) {
        expect(VALID_GROUPS.has(g)).toBe(true);
      }
    }
  });
});

describe('talents — répartition par camp', () => {
  it('contient des talents salariés ET patronaux', () => {
    const salaries = TALENT_CATALOG.filter(t => t.camp === 'salarie');
    const patrons = TALENT_CATALOG.filter(t => t.camp === 'patron');
    expect(salaries.length).toBeGreaterThanOrEqual(10);
    expect(patrons.length).toBeGreaterThanOrEqual(10);
  });

  it('talentsForCamp("salarie") ne renvoie que des talents salariés', () => {
    const list = talentsForCamp('salarie');
    expect(list.length).toBeGreaterThan(0);
    expect(list.every(t => t.camp === 'salarie')).toBe(true);
  });

  it('talentsForCamp("patron") ne renvoie que des talents patronaux', () => {
    const list = talentsForCamp('patron');
    expect(list.length).toBeGreaterThan(0);
    expect(list.every(t => t.camp === 'patron')).toBe(true);
  });

  it('la somme des deux camps = total du catalogue', () => {
    const sum = talentsForCamp('salarie').length + talentsForCamp('patron').length;
    expect(sum).toBe(TALENT_CATALOG.length);
  });
});

describe('talents — talentById', () => {
  it('retrouve un talent existant par son id', () => {
    const t = talentById('marie-leveque');
    expect(t).toBeDefined();
    expect(t?.nom).toBe('Marie Levêque');
    expect(t?.camp).toBe('salarie');
  });

  it('retourne undefined pour un id inconnu', () => {
    expect(talentById('inconnu-xxx')).toBeUndefined();
    expect(talentById('')).toBeUndefined();
  });
});

describe('talents — figures emblématiques présentes', () => {
  const expectedIds = [
    'marie-leveque',       // juriste prud'hommale (salarié)
    'margaux-sole',        // économiste IRES (salarié)
    'anne-dubois',         // tribune / communicante (salarié)
    'henri-bouvier',       // ancien préfet (patron)
    'jeanne-vidal',        // lobbyiste Bruxelles (patron)
    'caroline-vasse',      // DRH CAC40 (patron)
    'sophie-anne-granger'  // avocate droit social (salarié)
  ];

  it.each(expectedIds)('le talent emblématique "%s" est présent', (id) => {
    const t = talentById(id);
    expect(t).toBeDefined();
    expect(t?.id).toBe(id);
  });
});

describe('talents — GROUP_LABELS & GROUP_BLURBS', () => {
  it('expose les 3 groupes attendus avec labels non vides', () => {
    expect(GROUP_LABELS.reflexion).toBeTruthy();
    expect(GROUP_LABELS.action).toBeTruthy();
    expect(GROUP_LABELS.communication).toBeTruthy();
  });

  it('fournit un blurb non vide pour chaque groupe', () => {
    expect(GROUP_BLURBS.reflexion.length).toBeGreaterThan(10);
    expect(GROUP_BLURBS.action.length).toBeGreaterThan(10);
    expect(GROUP_BLURBS.communication.length).toBeGreaterThan(10);
  });
});

describe('talents — cohérence des bonus par groupe (cas représentatifs)', () => {
  it('Marie Levêque (juriste) apporte de l\'institution en réflexion', () => {
    const t = talentById('marie-leveque') as TalentCatalogEntry;
    expect(t.perTurn.reflexion?.resources?.institution).toBeGreaterThan(0);
  });

  it('Pierre Chassaigne (vétéran métallurgie) apporte du rapport de force en action', () => {
    const t = talentById('pierre-chassaigne') as TalentCatalogEntry;
    expect(t.perTurn.action?.resources?.rapportDeForce).toBeGreaterThan(0);
  });

  it('Anne Dubois (tribune) apporte de la légitimité en communication', () => {
    const t = talentById('anne-dubois') as TalentCatalogEntry;
    expect(t.perTurn.communication?.resources?.legitimite).toBeGreaterThan(0);
  });

  it('Margaux Solé (économiste IRES) apporte de l\'institution en réflexion', () => {
    const t = talentById('margaux-sole') as TalentCatalogEntry;
    expect(t.perTurn.reflexion?.resources?.institution).toBeGreaterThan(0);
  });

  it('un talent disposant d\'un hireOrg renvoie des deltas org cohérents', () => {
    const t = talentById('marie-leveque') as TalentCatalogEntry;
    expect(t.hireOrg).toBeDefined();
    // Les valeurs devraient être numériques quand présentes
    if (t.hireOrg?.legalTeam !== undefined) {
      expect(typeof t.hireOrg.legalTeam).toBe('number');
    }
  });
});
