import type { Camp } from '../../lib/types';
import { clamp } from '../simulation/resources';
import type { FactionId, PlayerOrganization, OrganizationDelta } from './types';

export function freshOrganization(camp: Camp, playerName: string): PlayerOrganization {
  const salarie = camp === 'salarie';
  return {
    name: salarie ? `Syndicat de ${playerName}` : `Union patronale de ${playerName}`,
    camp,
    doctrine: salarie ? 'implantation' : 'influence',
    treasury: salarie ? 28 : 42,
    membership: salarie ? 420 : 90,
    militants: salarie ? 32 : 12,
    permanentStaff: salarie ? 2 : 4,
    legalTeam: salarie ? 1 : 3,
    mediaRelay: salarie ? 1 : 3,
    localSections: salarie ? 2 : 1,
    cohesion: 58,
    reputation: 42,
    mobilisationFatigue: 18,
    factions: freshFactions(salarie),
    election: null,
    assets: [],
    engagedTalents: [],
    budgetStrategy: 'equilibre',
    actionHistory: [],
    treasuryActionTurns: {}
  };
}

/** Trésorerie : pas de plafond bas-niveau ; un cap doux à 300 évite l'inflation visuelle. */
export const TREASURY_SOFT_CAP = 300;

export function applyOrganizationDelta(
  org: PlayerOrganization,
  delta: OrganizationDelta
): PlayerOrganization {
  return {
    ...org,
    treasury: Math.max(0, Math.min(TREASURY_SOFT_CAP, org.treasury + (delta.treasury ?? 0))),
    membership: Math.max(0, Math.round(org.membership + (delta.membership ?? 0))),
    militants: Math.max(0, Math.round(org.militants + (delta.militants ?? 0))),
    permanentStaff: Math.max(0, Math.round(org.permanentStaff + (delta.permanentStaff ?? 0))),
    legalTeam: Math.max(0, Math.round(org.legalTeam + (delta.legalTeam ?? 0))),
    mediaRelay: Math.max(0, Math.round(org.mediaRelay + (delta.mediaRelay ?? 0))),
    localSections: Math.max(0, Math.round(org.localSections + (delta.localSections ?? 0))),
    cohesion: clamp(org.cohesion + (delta.cohesion ?? 0)),
    reputation: clamp(org.reputation + (delta.reputation ?? 0)),
    mobilisationFatigue: clamp(org.mobilisationFatigue + (delta.mobilisationFatigue ?? 0))
  };
}

/** Flux de trésorerie entrant par tour, calibré selon le camp.
   P0 Duflo-11 + Pascal-24 (Sapeurs ORDA-015 PARITAS) — réaligné sur le ratio
   1:3 documenté dans treasury.ts (un syndicat patronal U2P/CPME a moins
   d'adhérents mais cotisations plus lourdes ; l'écart par tête est sensible
   mais pas écrasant comme l'ancien 1:8). Tarifs 0.05 / 0.16 cohérents avec
   computeRecettes() — source unique de vérité. */
export function expectedDuesIncome(org: PlayerOrganization): number {
  const rate = org.camp === 'salarie' ? 0.05 : 0.16;
  return Math.round(org.membership * rate);
}

/** Flux sortant par tour : salaires des permanents et juristes. */
export function expectedStaffCost(org: PlayerOrganization): number {
  return org.permanentStaff * 2 + org.legalTeam * 1;
}

export function canDevelopOrganization(turn: number, camp: Camp): boolean {
  return camp === 'salarie' ? turn >= 14 : turn >= 12;
}

export function organizationUnlockLabel(camp: Camp): string {
  return camp === 'salarie'
    ? 'Débloqué à partir de 1884, quand les syndicats professionnels deviennent légaux.'
    : 'Débloqué au XIXe siècle, quand les chambres et fédérations patronales structurent la négociation.';
}

export function formatOrgDelta(delta: OrganizationDelta): string {
  const labels: Record<keyof OrganizationDelta, string> = {
    treasury: 'Caisse org.',
    membership: 'Adhérents',
    militants: 'Militants',
    permanentStaff: 'Permanents',
    legalTeam: 'Juristes',
    mediaRelay: 'Médias',
    localSections: 'Sections',
    cohesion: 'Cohésion',
    reputation: 'Réputation',
    mobilisationFatigue: 'Fatigue'
  };
  return (Object.entries(delta) as Array<[keyof OrganizationDelta, number]>)
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => `${labels[key]} ${value > 0 ? '+' : ''}${value}`)
    .join(' · ');
}

function freshFactions(salarie: boolean): PlayerOrganization['factions'] {
  const labels: Record<FactionId, string> = salarie
    ? {
        reformistes: 'Réformistes',
        radicaux: 'Radicaux',
        institutionnels: 'Gestionnaires',
        territoriaux: 'Sections locales'
      }
    : {
        reformistes: 'Sociaux-libéraux',
        radicaux: 'Ligne dure',
        institutionnels: 'Fédérations',
        territoriaux: 'Territoires industriels'
      };

  return [
    {
      id: 'reformistes',
      label: labels.reformistes,
      influence: 28,
      loyalty: 58,
      demand: salarie ? 'des accords visibles et applicables' : 'des compromis qui évitent la rupture'
    },
    {
      id: 'radicaux',
      label: labels.radicaux,
      influence: 24,
      loyalty: 48,
      demand: salarie ? 'un rapport de force assumé' : 'une ligne ferme contre les concessions'
    },
    {
      id: 'institutionnels',
      label: labels.institutionnels,
      influence: 26,
      loyalty: 62,
      demand: 'des dossiers solides et des mandats maîtrisés'
    },
    {
      id: 'territoriaux',
      label: labels.territoriaux,
      influence: 22,
      loyalty: 54,
      demand: 'des moyens concrets sur le terrain'
    }
  ];
}
