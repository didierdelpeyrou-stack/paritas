/**
 * Paritas — Bridge Block Blast → cotisations Sécu.
 *
 * Le mini-jeu Block Blast (Tetris-like 8×8) sera implémenté dans
 * src/components/ateliers/BlockBlast.svelte — pour l'instant ce
 * module fournit l'API pure-function qui transformera son score
 * en delta KPI dialectique.
 *
 * Sémantique narrative :
 *   - Les blocs représentent des cotisations qu'il faut équilibrer
 *     entre patronales (bleu) et salariales (rouge)
 *   - Une ligne complétée = équilibre réussi
 *   - Score = lignes complétées sur la session
 *
 * Mapping score → delta :
 *   - score < 5  : caisse en déficit (povAchat ↓, marge ↓ — tout le
 *                  monde paie)
 *   - score 5-15 : équilibre fragile (statu quo)
 *   - score 15+  : Sécu solide (povAchat ↑, droits ↑, légitimité ↑)
 *
 * Pure-function. Sera consommé par TableArbiter quand le trigger
 * blockblast_cotisations est levé.
 */

import type { DeltaVec } from './dialectic';

/* ============================================================
   1. Configuration de session
   ============================================================ */

export interface BlockBlastSession {
  /** Durée du round en secondes. Calibrée par tension. */
  durationSec: number;
  /** Difficulté (vitesse de spawn) : 0=facile, 1=normal, 2=difficile. */
  difficulty: 0 | 1 | 2;
  /** Cotisation cible (lignes à compléter pour seuil "équilibre"). */
  targetLines: number;
}

/* ============================================================
   2. Résultat de session
   ============================================================ */

export interface BlockBlastResult {
  /** Lignes complétées au total. */
  linesCleared: number;
  /** Tetris (4 lignes d'un coup) réussis. */
  tetrisCount: number;
  /** Game over par débordement (true) ou fin de timer (false). */
  overflow: boolean;
}

/* ============================================================
   3. Mapping result → delta KPI
   ============================================================ */

export function applyBlockBlastResult(result: BlockBlastResult): Partial<DeltaVec> {
  const lines = result.linesCleared;
  const tetris = result.tetrisCount;

  if (result.overflow) {
    /* Caisse débordée : crise Sécu. */
    return {
      povAchat: -8,
      droits: -5,
      legitimite: -4,
      marge: -3,        // les charges s'envolent
      tension: 12
    };
  }

  if (lines < 5) {
    /* Déficit : tout le monde paie. */
    return {
      povAchat: -3,
      droits: -2,
      marge: -2,
      tension: 4,
      legitimite: -1
    };
  }

  if (lines < 15) {
    /* Équilibre fragile : statu quo bénéfique. */
    return {
      povAchat: 1,
      climat: 2,
      tension: -3,
      legitimite: 2
    };
  }

  /* Sécu solide : 15+ lignes. */
  const bonus = Math.min(20, lines - 14);  // chaque ligne au-delà de 14
  return {
    povAchat: 4 + bonus * 0.4,
    droits: 5 + bonus * 0.3,
    legitimite: 6 + bonus * 0.2 + tetris * 1.5,
    cohesion: 3,
    climat: 2,
    tension: -8
  };
}

/* ============================================================
   4. Configuration depuis contexte dialectique
   ============================================================ */

import type { SharedKPI } from './dialectic';

/**
 * Calcule la session BlockBlast à partir de la tension partagée.
 * Plus la tension est haute, plus la session est courte et difficile.
 */
export function configFromShared(shared: SharedKPI): BlockBlastSession {
  const t = Math.max(0, Math.min(100, shared.tension));
  return {
    durationSec: Math.round(120 - t * 0.6),     // 120s → 60s
    difficulty: t < 35 ? 0 : t < 70 ? 1 : 2,
    targetLines: t < 35 ? 8 : t < 70 ? 12 : 16
  };
}

/* ============================================================
   5. Helpers test/dev — simulation d'un score
   ============================================================ */

/**
 * Estime un score "réaliste" pour un joueur moyen sur une session
 * donnée. Utile pour scénariser dans la démo en attendant le vrai
 * composant BlockBlast.
 */
export function estimateAverageScore(session: BlockBlastSession): BlockBlastResult {
  /* Approx : facile = 0.3 lignes/s, normal = 0.18, difficile = 0.10. */
  const ratesByDiff = [0.3, 0.18, 0.10];
  const rate = ratesByDiff[session.difficulty];
  const lines = Math.round(session.durationSec * rate);
  const tetris = Math.floor(lines / 8);
  return {
    linesCleared: lines,
    tetrisCount: tetris,
    overflow: false
  };
}
