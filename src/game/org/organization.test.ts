import { describe, it, expect } from 'vitest';
import {
  freshOrganization,
  applyOrganizationDelta,
  expectedDuesIncome,
  expectedStaffCost,
  canDevelopOrganization,
  organizationUnlockLabel,
  formatOrgDelta,
  TREASURY_SOFT_CAP
} from './organization';

/* Couverture Vitest ORDA-013 — org/organization.ts (était 0%).
   Module pivot : structure persistante de l'organisation joueur,
   alimente le HUD financier et débloque le moteur de stratégies. */

describe('organization — freshOrganization', () => {
  it('configure un syndicat salarié avec les valeurs attendues', () => {
    const org = freshOrganization('salarie', 'Léon');
    expect(org.name).toBe('Syndicat de Léon');
    expect(org.camp).toBe('salarie');
    expect(org.doctrine).toBe('implantation');
    expect(org.treasury).toBe(28);
    expect(org.membership).toBe(420);
    expect(org.militants).toBe(32);
    expect(org.permanentStaff).toBe(2);
    expect(org.legalTeam).toBe(1);
  });

  it('configure une union patronale avec valeurs distinctes', () => {
    const org = freshOrganization('patron', 'Bertrand');
    expect(org.name).toBe('Union patronale de Bertrand');
    expect(org.camp).toBe('patron');
    expect(org.doctrine).toBe('influence');
    expect(org.treasury).toBe(42);
    expect(org.membership).toBe(90);
  });

  it('expose les 4 factions avec influences cohérentes', () => {
    const org = freshOrganization('salarie', 'X');
    expect(org.factions.length).toBe(4);
    const totalInfluence = org.factions.reduce((sum, f) => sum + f.influence, 0);
    expect(totalInfluence).toBe(100);
    const ids = org.factions.map(f => f.id).sort();
    expect(ids).toEqual(['institutionnels', 'radicaux', 'reformistes', 'territoriaux']);
  });

  it('initialise les collections vides', () => {
    const org = freshOrganization('salarie', 'X');
    expect(org.assets).toEqual([]);
    expect(org.engagedTalents).toEqual([]);
    expect(org.actionHistory).toEqual([]);
    expect(org.election).toBeNull();
  });
});

describe('organization — applyOrganizationDelta', () => {
  it('applique un delta simple', () => {
    const org = freshOrganization('salarie', 'X');
    const next = applyOrganizationDelta(org, { treasury: 10, militants: 5 });
    expect(next.treasury).toBe(38);
    expect(next.militants).toBe(37);
  });

  it('clamp la trésorerie à TREASURY_SOFT_CAP=300', () => {
    const org = { ...freshOrganization('salarie', 'X'), treasury: 290 };
    const next = applyOrganizationDelta(org, { treasury: 50 });
    expect(next.treasury).toBe(TREASURY_SOFT_CAP);
    expect(TREASURY_SOFT_CAP).toBe(300);
  });

  it('clamp la trésorerie à 0 (pas de négatif)', () => {
    const org = { ...freshOrganization('salarie', 'X'), treasury: 10 };
    const next = applyOrganizationDelta(org, { treasury: -100 });
    expect(next.treasury).toBe(0);
  });

  it('Math.max(0) sur les counts (membership, militants, etc.)', () => {
    const org = { ...freshOrganization('salarie', 'X'), militants: 5 };
    const next = applyOrganizationDelta(org, { militants: -100 });
    expect(next.militants).toBe(0);
  });

  it('clamp 0-100 sur cohesion / reputation / mobilisationFatigue', () => {
    const org = freshOrganization('salarie', 'X');
    const high = applyOrganizationDelta(org, { cohesion: 200 });
    expect(high.cohesion).toBeLessThanOrEqual(100);
    const low = applyOrganizationDelta(org, { reputation: -200 });
    expect(low.reputation).toBeGreaterThanOrEqual(0);
  });

  it('arrondit les counts (Math.round)', () => {
    const org = freshOrganization('salarie', 'X');
    const next = applyOrganizationDelta(org, { membership: 1.6 });
    expect(Number.isInteger(next.membership)).toBe(true);
  });

  it('immutabilité — ne mute pas la source', () => {
    const org = freshOrganization('salarie', 'X');
    const treasuryBefore = org.treasury;
    applyOrganizationDelta(org, { treasury: 50 });
    expect(org.treasury).toBe(treasuryBefore);
  });
});

describe('organization — expectedDuesIncome & expectedStaffCost', () => {
  it('expectedDuesIncome côté salarié = membership * 0.05 (P0 Sapeurs Duflo-11/Pascal-24)', () => {
    const org = freshOrganization('salarie', 'X');
    expect(expectedDuesIncome(org)).toBe(Math.round(420 * 0.05)); // 21
  });

  it('expectedDuesIncome côté patron = membership * 0.16 (P0 Sapeurs Duflo-11/Pascal-24)', () => {
    const org = freshOrganization('patron', 'X');
    expect(expectedDuesIncome(org)).toBe(Math.round(90 * 0.16)); // 14
  });

  it('expectedStaffCost = permanentStaff*2 + legalTeam*1', () => {
    const org = freshOrganization('salarie', 'X');
    /* salarie : permanent=2, legal=1 → 2*2 + 1*1 = 5 */
    expect(expectedStaffCost(org)).toBe(5);
    const patron = freshOrganization('patron', 'X');
    /* patron : permanent=4, legal=3 → 4*2 + 3*1 = 11 */
    expect(expectedStaffCost(patron)).toBe(11);
  });
});

describe('organization — canDevelopOrganization', () => {
  it('salarié débloqué à partir de turn 14 (1884 historique)', () => {
    expect(canDevelopOrganization(13, 'salarie')).toBe(false);
    expect(canDevelopOrganization(14, 'salarie')).toBe(true);
    expect(canDevelopOrganization(50, 'salarie')).toBe(true);
  });

  it('patron débloqué à partir de turn 12', () => {
    expect(canDevelopOrganization(11, 'patron')).toBe(false);
    expect(canDevelopOrganization(12, 'patron')).toBe(true);
  });
});

describe('organization — organizationUnlockLabel', () => {
  it('label distinct pour salarié vs patron', () => {
    const sal = organizationUnlockLabel('salarie');
    const pat = organizationUnlockLabel('patron');
    expect(sal).toMatch(/1884/);
    expect(pat).toMatch(/XIXe/);
    expect(sal).not.toBe(pat);
  });
});

describe('organization — formatOrgDelta', () => {
  it('filtre les valeurs zéro', () => {
    const out = formatOrgDelta({ treasury: 5, militants: 0, cohesion: 0 });
    expect(out).toContain('Caisse org.');
    expect(out).not.toContain('Militants');
    expect(out).not.toContain('Cohésion');
  });

  it('préfixe + sur les valeurs positives', () => {
    expect(formatOrgDelta({ treasury: 5 })).toBe('Caisse org. +5');
  });

  it('préserve le signe sur les valeurs négatives', () => {
    expect(formatOrgDelta({ treasury: -3 })).toBe('Caisse org. -3');
  });

  it('joint les entrées par " · "', () => {
    const out = formatOrgDelta({ treasury: 5, militants: 2 });
    expect(out).toContain(' · ');
  });

  it('delta vide retourne string vide', () => {
    expect(formatOrgDelta({})).toBe('');
  });
});
