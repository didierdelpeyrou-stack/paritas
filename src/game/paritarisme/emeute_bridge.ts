/**
 * Paritas — Pont entre le moteur dialectique et l'atelier Émeute.
 *
 * Quand resolveTable() retourne `atelier: 'emeute'` (cellule
 * Tenir × Rapport-de-force avec tension > 70), l'arbitrage de la
 * cellule devient une mêlée jouable. Ce module transforme :
 *
 *   1) ResolveOutcome + KPI courants → MatchConfig (Émeute)
 *      (cohésion → stocks, légitimité → IA, tension → durée,
 *       doctrines → personnages choisis)
 *
 *   2) Vainqueur de l'Émeute → DeltaVec (KPI à appliquer après
 *      la mêlée, en plus du delta dialectique nominal)
 *
 * Pure-function. Aucune dépendance UI.
 */

import type {
  ResolveOutcome,
  PatronKPI,
  SalarieKPI,
  SharedKPI,
  Doctrine,
  DeltaVec
} from './dialectic';
import type { MatchConfig, CharId } from '../ateliers/emeute/engine';

/* ============================================================
   1. Mapping doctrine → personnage Émeute
   ============================================================ */

/**
 * Choix du combattant selon la doctrine. La cohérence narrative
 * compte plus que l'équilibrage : un patron neoliberal incarne
 * "Rupture" (rush, agressif), un autogestionnaire prend "Batisseur"
 * (tank, lent mais résistant), etc.
 */
export function doctrineToChar(d: Doctrine): CharId {
  switch (d) {
    /* Patron */
    case 'paternalisme':      return 'pragmatique';   // équilibré, accommodant
    case 'neoliberal':        return 'rupture';        // agressif, rapide
    case 'technocratique':    return 'tribun';         // standard institutionnel
    case 'corporatiste':      return 'pragmatique';
    /* Salarié */
    case 'reformiste':        return 'pragmatique';
    case 'syndicalismeLutte': return 'rupture';        // combatif
    case 'autogestionnaire':  return 'batisseur';      // tank, base solide
    case 'juridiste':         return 'batisseur';      // résistance par cadrage
  }
}

/* ============================================================
   2. Cohésion → stocks (vies)
   ============================================================ */

/** Cohésion 0..100 → stocks 1..5 (floor). */
export function cohesionToStocks(cohesion: number): number {
  const v = Math.max(0, Math.min(100, cohesion));
  return Math.max(1, Math.min(5, Math.floor(v / 25) + 1));
}

/* ============================================================
   3. Niveau IA — quel camp force-t-il l'autre ?
   ============================================================ */

/**
 * Calcule le niveau d'IA pour le côté CPU. Le joueur humain défend
 * son camp ; l'IA prend l'autre. Si le joueur est SALARIÉ, l'IA
 * patron monte avec la marge restante (un patron riche peut payer
 * de meilleurs services d'ordre). Si le joueur est PATRON, l'IA
 * salarié monte avec la légitimité (la rue est plus organisée).
 */
export function cpuLevelForOpponent(
  playerSide: 'patron' | 'salarie',
  patron: PatronKPI,
  salarie: SalarieKPI
): 0 | 1 | 2 {
  const driver = playerSide === 'salarie' ? patron.marge : salarie.legitimite;
  if (driver >= 70) return 2;
  if (driver >= 40) return 1;
  return 0;
}

/* ============================================================
   4. Tension → durée du match (plus tendu = plus court & frénétique)
   ============================================================ */

/** Tension 0..100 → ms (90s à 30s). 0 = ample, 100 = frénétique. */
export function tensionToDurationMs(tension: number): number {
  const t = Math.max(0, Math.min(100, tension));
  return Math.round(90_000 - t * 600);
}

/* ============================================================
   5. kpiToMatchConfig — façade
   ============================================================ */

export interface BridgeOptions {
  /** Côté incarné par l'humain. Par défaut 'salarie'. */
  playerSide?: 'patron' | 'salarie';
}

export function kpiToMatchConfig(
  outcome: ResolveOutcome,
  patron: PatronKPI,
  salarie: SalarieKPI,
  shared: SharedKPI,
  doctrines: { patron: Doctrine; salarie: Doctrine },
  opts: BridgeOptions = {}
): MatchConfig {
  const playerSide = opts.playerSide ?? 'salarie';

  const charPatron = doctrineToChar(doctrines.patron);
  const charSalarie = doctrineToChar(doctrines.salarie);

  /* P1 = humain (toujours), P2 = CPU. On positionne selon playerSide. */
  const characters: CharId[] = playerSide === 'salarie'
    ? [charSalarie, charPatron]
    : [charPatron, charSalarie];

  const controls: ('human' | 'cpu')[] = ['human', 'cpu'];

  /* Stocks : reflète la cohésion du camp joueur. */
  const playerCohesion = playerSide === 'salarie' ? salarie.cohesion : patron.climat;
  const stocks = cohesionToStocks(playerCohesion);

  /* IA : niveau du CPU adverse. */
  const cpuLevel = cpuLevelForOpponent(playerSide, patron, salarie);
  const cpuLevels: (0 | 1 | 2)[] = [1, cpuLevel];

  /* Durée selon tension. */
  const durationMs = tensionToDurationMs(shared.tension);

  return {
    characters,
    controls,
    teams: [0, 0], // FFA en 1v1
    cpuLevels,
    stocks,
    durationMs
  };
}

/* ============================================================
   6. applyEmeuteResult — transforme le résultat en delta KPI
   ============================================================ */

export type EmeuteOutcome =
  | { winner: 'patron'; margin: number }
  | { winner: 'salarie'; margin: number }
  | { winner: 'draw'; margin: 0 };

/**
 * Convertit le verdict de la mêlée en delta KPI à appliquer
 * APRÈS le delta dialectique nominal. Le margin (0..1) module
 * l'amplitude (0 = serré, 1 = écrasant).
 */
export function applyEmeuteResult(result: EmeuteOutcome): Partial<DeltaVec> {
  const m = Math.max(0, Math.min(1, result.margin));
  const amp = 0.5 + m * 0.5;            // 0.5..1 : un win serré pèse moitié

  if (result.winner === 'salarie') {
    return {
      cohesion: 5 * amp,
      legitimite: 8 * amp,
      povAchat: 3 * amp,                // gain de pression
      climat: -8 * amp,                 // terrain perdu côté patron
      capPol: -10 * amp,                // image écornée
      reputation: -5 * amp,
      tension: -10 * amp                // soupape lâchée
    };
  }
  if (result.winner === 'patron') {
    return {
      capPol: 8 * amp,                  // force restaurée
      climat: -5 * amp,                 // répression visible
      reputation: -3 * amp,             // image violente
      cohesion: -10 * amp,              // démobilisation
      legitimite: -5 * amp,
      povAchat: -2 * amp,
      tension: 5 * amp                  // rancœur, pas de soupape
    };
  }
  /* draw : tout le monde garde la face mais rien n'est résolu. */
  return {
    legitimite: 2,
    cohesion: 1,
    climat: -3,
    tension: -5
  };
}

/* ============================================================
   7. Helper : extrait l'EmeuteOutcome depuis le callback du composant
   ============================================================ */

/**
 * Le composant Emeute appelle onresolve(winnerIndex, winnerTeam).
 * Cette helper convertit l'index en side (sachant le playerSide
 * configuré dans kpiToMatchConfig).
 */
export function emeuteResultFromIndex(
  winnerIndex: number | null,
  playerSide: 'patron' | 'salarie' = 'salarie'
): EmeuteOutcome {
  if (winnerIndex == null) {
    return { winner: 'draw', margin: 0 };
  }
  /* Index 0 = humain, index 1 = CPU. Le humain incarne playerSide. */
  const humanWon = winnerIndex === 0;
  const winner = humanWon
    ? playerSide
    : (playerSide === 'salarie' ? 'patron' : 'salarie');
  /* Margin par défaut 0.7 (compromis entre 0.5 et 1) — on n'a pas
     de meta-info sur la marge réelle (HP restant, KO ratio) car
     l'API du composant n'expose que winnerIndex. À enrichir
     ultérieurement avec stats détaillées. */
  return { winner: winner as 'patron' | 'salarie', margin: 0.7 };
}

/* ============================================================
   8. Helper : prédicat si une émeute doit s'enclencher
   ============================================================ */

export function shouldTriggerEmeute(outcome: ResolveOutcome): boolean {
  return outcome.atelier?.kind === 'emeute';
}
