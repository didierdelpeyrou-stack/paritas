import { describe, it, expect } from 'vitest';
import { computeBudget, strategyLabel, strategyDescription } from './treasury';
import { freshOrganization } from './organization';

/* Couverture Vitest ORDA-013 — org/treasury.ts (était 0%).
   Module pivot du HUD financier : produit le BudgetSnapshot consommé
   par le panneau Caisse et l'upkeep par tour. 8 lignes recettes max,
   9 lignes dépenses max + congrès tous les 8 tours. */

describe('treasury — strategyLabel & strategyDescription', () => {
  it('expose un label pour les 3 stratégies', () => {
    expect(strategyLabel('epargne')).toBe('Épargne');
    expect(strategyLabel('equilibre')).toBe('Équilibre');
    expect(strategyLabel('distribution')).toBe('Distribution');
  });

  it('expose une description non vide pour les 3 stratégies', () => {
    expect(strategyDescription('epargne').length).toBeGreaterThan(10);
    expect(strategyDescription('equilibre').length).toBeGreaterThan(10);
    expect(strategyDescription('distribution').length).toBeGreaterThan(10);
  });
});

describe('treasury — computeBudget structure', () => {
  it('retourne un BudgetSnapshot complet', () => {
    const org = freshOrganization('salarie', 'X');
    const b = computeBudget(org, 1);
    expect(b.recettes).toBeDefined();
    expect(b.depenses).toBeDefined();
    expect(typeof b.totalRecettes).toBe('number');
    expect(typeof b.totalDepenses).toBe('number');
    expect(typeof b.net).toBe('number');
    expect(b.strategy).toBe(org.budgetStrategy);
  });

  it('totalRecettes = somme des amounts recettes', () => {
    const org = freshOrganization('salarie', 'X');
    const b = computeBudget(org, 1);
    const sum = b.recettes.reduce((s, l) => s + l.amount, 0);
    expect(b.totalRecettes).toBe(sum);
  });

  it('totalDepenses = somme des amounts dépenses (négatif)', () => {
    const org = freshOrganization('salarie', 'X');
    const b = computeBudget(org, 1);
    const sum = b.depenses.reduce((s, l) => s + l.amount, 0);
    expect(b.totalDepenses).toBe(sum);
    expect(b.totalDepenses).toBeLessThan(0);
  });

  it('net = totalRecettes + totalDepenses', () => {
    const org = freshOrganization('salarie', 'X');
    const b = computeBudget(org, 1);
    expect(b.net).toBe(b.totalRecettes + b.totalDepenses);
  });
});

describe('treasury — recettes', () => {
  it('cotisations présentes côté salarié (rate 0.05)', () => {
    const org = freshOrganization('salarie', 'X');
    const b = computeBudget(org, 1);
    const cot = b.recettes.find(l => l.id === 'cotisations');
    expect(cot).toBeDefined();
    expect(cot!.amount).toBe(Math.round(420 * 0.05)); // 21
  });

  it('cotisations côté patron sont supérieures (rate 0.16)', () => {
    const org = freshOrganization('patron', 'X');
    const b = computeBudget(org, 1);
    const cot = b.recettes.find(l => l.id === 'cotisations');
    expect(cot).toBeDefined();
    expect(cot!.amount).toBe(Math.round(90 * 0.16)); // 14
  });

  it('presse syndicale apparaît si mediaRelay >= 1', () => {
    const org = freshOrganization('salarie', 'X');
    const b = computeBudget(org, 1);
    const presse = b.recettes.find(l => l.id === 'presse');
    expect(presse).toBeDefined();
  });

  it('subventions paritaires absentes avant turn 23', () => {
    const org = freshOrganization('salarie', 'X');
    const b = computeBudget(org, 22);
    expect(b.recettes.find(l => l.id === 'subventions')).toBeUndefined();
  });

  it('subventions paritaires présentes au turn 23+', () => {
    const org = { ...freshOrganization('salarie', 'X'), localSections: 5 };
    const b = computeBudget(org, 23);
    expect(b.recettes.find(l => l.id === 'subventions')).toBeDefined();
  });

  it('droit syndical absent avant turn 28', () => {
    const org = freshOrganization('salarie', 'X');
    const b = computeBudget(org, 27);
    expect(b.recettes.find(l => l.id === 'droits-syndicaux')).toBeUndefined();
  });

  it('droit syndical présent au turn 28+', () => {
    const org = freshOrganization('salarie', 'X');
    const b = computeBudget(org, 28);
    expect(b.recettes.find(l => l.id === 'droits-syndicaux')).toBeDefined();
  });

  it('FNE présent au turn 30+ avec legalTeam >= 2', () => {
    const org = { ...freshOrganization('salarie', 'X'), legalTeam: 3 };
    const b = computeBudget(org, 30);
    expect(b.recettes.find(l => l.id === 'fne')).toBeDefined();
  });
});

describe('treasury — dépenses', () => {
  it('permanents présents si permanentStaff > 0', () => {
    const org = freshOrganization('salarie', 'X');
    const b = computeBudget(org, 1);
    const perm = b.depenses.find(l => l.id === 'permanents');
    expect(perm).toBeDefined();
    expect(perm!.amount).toBeLessThan(0);
  });

  it('juristes absents si legalTeam = 0', () => {
    const org = { ...freshOrganization('salarie', 'X'), legalTeam: 0 };
    const b = computeBudget(org, 1);
    expect(b.depenses.find(l => l.id === 'juristes')).toBeUndefined();
  });

  it('frais de fonctionnement toujours présents', () => {
    const org = freshOrganization('salarie', 'X');
    const b = computeBudget(org, 1);
    expect(b.depenses.find(l => l.id === 'fonctionnement')).toBeDefined();
  });

  it('aide sociale apparaît seulement si mobilisationFatigue >= 50', () => {
    const calme = { ...freshOrganization('salarie', 'X'), mobilisationFatigue: 30 };
    const tendu = { ...freshOrganization('salarie', 'X'), mobilisationFatigue: 75 };
    expect(computeBudget(calme, 1).depenses.find(l => l.id === 'aide-sociale')).toBeUndefined();
    expect(computeBudget(tendu, 1).depenses.find(l => l.id === 'aide-sociale')).toBeDefined();
  });

  it('formation interne apparaît si militants >= 10', () => {
    const peu = { ...freshOrganization('salarie', 'X'), militants: 5 };
    const beaucoup = { ...freshOrganization('salarie', 'X'), militants: 50 };
    expect(computeBudget(peu, 1).depenses.find(l => l.id === 'formation-interne')).toBeUndefined();
    expect(computeBudget(beaucoup, 1).depenses.find(l => l.id === 'formation-interne')).toBeDefined();
  });
});

describe('treasury — congrès tous les 8 tours', () => {
  it('absent avant turn 15', () => {
    const org = freshOrganization('salarie', 'X');
    expect(computeBudget(org, 8).depenses.find(l => l.id === 'congres')).toBeUndefined();
  });

  it('présent au turn 16 (multiple de 8 ≥ 15)', () => {
    const org = freshOrganization('salarie', 'X');
    expect(computeBudget(org, 16).depenses.find(l => l.id === 'congres')).toBeDefined();
  });

  it('absent aux turns non-multiples de 8', () => {
    const org = freshOrganization('salarie', 'X');
    expect(computeBudget(org, 17).depenses.find(l => l.id === 'congres')).toBeUndefined();
    expect(computeBudget(org, 23).depenses.find(l => l.id === 'congres')).toBeUndefined();
  });
});

describe('treasury — stratégies budgétaires', () => {
  it('épargne réduit les dépenses (-35%)', () => {
    const base = freshOrganization('salarie', 'X');
    const eq = computeBudget({ ...base, budgetStrategy: 'equilibre' }, 1);
    const ep = computeBudget({ ...base, budgetStrategy: 'epargne' }, 1);
    /* Dépenses sont négatives, "réduire" = se rapprocher de 0. */
    expect(ep.totalDepenses).toBeGreaterThan(eq.totalDepenses);
  });

  it('distribution amplifie les dépenses (+35%)', () => {
    const base = freshOrganization('salarie', 'X');
    const eq = computeBudget({ ...base, budgetStrategy: 'equilibre' }, 1);
    const dist = computeBudget({ ...base, budgetStrategy: 'distribution' }, 1);
    expect(dist.totalDepenses).toBeLessThan(eq.totalDepenses);
  });

  it('équilibre = pas de modification', () => {
    const org = { ...freshOrganization('salarie', 'X'), budgetStrategy: 'equilibre' as const };
    const b = computeBudget(org, 1);
    /* Vérifier que le snapshot reflète la stratégie. */
    expect(b.strategy).toBe('equilibre');
  });
});
