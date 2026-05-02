/**
 * Profil du joueur — boucle d'apprentissage.
 *
 * Trois rôles :
 *  1. **Côté front (offline)** : recommandation de scénarios, ton
 *     du Glossary Refresher, conseil au démarrage de partie.
 *  2. **Côté Haiku (online)** : passé au worker pour qu'il adapte
 *     le ton, la complexité, les références au profil du joueur.
 *  3. **Télémétrie anonyme** : un hash stable du profil sert d'ID
 *     pour suivre l'évolution sans identifier la personne.
 *
 * Stockage : localStorage uniquement, pas de serveur.
 */

import type { RebirthGameState } from '../types';
import type { PlayerProfile } from '../narrative/narrativeClient';

const KEY_PARTIES = 'paritas_played_count';
const KEY_DEFEATS = 'paritas_recent_defeats';
const KEY_ANON = 'paritas_anon_id';

/** Compteur de défaites consécutives (mutilation, capture). Reset
 *  à chaque victoire (resistance, refondation). Sert à modérer la
 *  difficulté ressentie. */
export function recordEnding(endingId: string) {
  try {
    const isDefeat = endingId === 'mutilation' || endingId === 'capture';
    const isVictory = endingId === 'resistance' || endingId === 'refondation';
    let n = parseInt(localStorage.getItem(KEY_DEFEATS) ?? '0', 10);
    if (!Number.isFinite(n)) n = 0;
    if (isVictory) n = 0;
    else if (isDefeat) n += 1;
    localStorage.setItem(KEY_DEFEATS, String(n));
  } catch {
    /* ignore */
  }
}

function difficultyFromDefeats(): 'easy' | 'normal' | 'hard' {
  try {
    const n = parseInt(localStorage.getItem(KEY_DEFEATS) ?? '0', 10);
    if (!Number.isFinite(n)) return 'normal';
    if (n >= 3) return 'easy';   // 3+ défaites consécutives → on adoucit
    if (n <= -2) return 'hard';  // (jamais atteint, juste pour symétrie)
    return 'normal';
  } catch {
    return 'normal';
  }
}

function partiesPlayed(): number {
  try {
    const n = parseInt(localStorage.getItem(KEY_PARTIES) ?? '0', 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/** Hash anonyme stable pour télémétrie. Pas de PII, pas d'ID
 *  réversible. Généré au premier appel et conservé. */
function anonId(): string {
  try {
    const existing = localStorage.getItem(KEY_ANON);
    if (existing) return existing;
    const generated = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    localStorage.setItem(KEY_ANON, generated);
    return generated;
  } catch {
    return 'anon-fallback';
  }
}

/** Construit un profil pour le payload Haiku. */
export function buildPlayerProfile(state: RebirthGameState): PlayerProfile {
  return {
    partiesPlayed: partiesPlayed(),
    personalityStress: state.personalityStress ?? 0,
    recentDifficulty: difficultyFromDefeats(),
    anonId: anonId()
  };
}

/** Lit la préférence de mode rédactionnel depuis Settings. */
export function readModePreference(): 'falc' | 'litteraire' {
  try {
    const v = localStorage.getItem('paritas_text_mode');
    if (v === 'litteraire') return 'litteraire';
  } catch {
    /* ignore */
  }
  return 'falc';
}
