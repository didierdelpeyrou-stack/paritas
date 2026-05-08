/* Paritas — journalAI.ts
 *
 * Client de génération de journal personnalisé en fin de partie.
 * S'appuie sur le même worker Cloudflare que `narrativeClient.ts`
 * (variable VITE_NARRATIVE_API) en passant un discriminant
 * `kind: 'journal'` dans le body — le worker dispatche.
 *
 * Coût estimé par journal (claude-haiku-4-5, ~1500 in / 1200 out) :
 * ~0.7 centime / partie. Pour la beta panel-30 c'est marginal.
 *
 * Fallback : si l'endpoint n'est pas configuré ou rate, l'UI
 * reste utilisable (le bouton "Exporter le journal" classique
 * en Markdown reste disponible).
 */

import type { EndingRender } from '../engine/endingEngine';
import type { RebirthGameState } from '../types';
import { TRAIT_LABELS } from './personalityEngine';

export interface JournalPromptInput {
  /** Discriminant pour le worker (cf. paritas-worker.ts dispatch). */
  kind: 'journal';
  state: {
    name: string;
    camp: 'salarie' | 'patron';
    organizationName: string;
    finalDominantTrait: string;
  };
  ending: {
    id: string;
    title: string;
    score: number;
    text: string;
  };
  stats: {
    turnsPlayed: number;
    institutionsBuilt: number;
    refusedCompromise: number;
    betrayedBase: number;
    exhaustedMovements: number;
  };
  /** Bilan condensé du mandat (3-4 lignes). */
  mandateBilan: { label: string; status: 'satisfied' | 'failed' | 'pending' }[];
  /** Tail du log narratif — les 12 dernières entrées suffisent. */
  recentLog: string[];
  /** P1-2 (ORDA-008, AAR bêta-30 §V) — directive de format pour le
   *  journal IA. Romero #05 veut la morsure (« tu as choisi la
   *  corruption »), McGonigal #06 veut l'action (« voilà ce que tu
   *  peux faire dans le réel »). Le worker peut ignorer ce hint —
   *  fallback côté client via splitJournalInTwoParagraphs(). */
  formatHint?: 'morsure-action' | 'free';
}

/** P1-2 — sépare un texte de journal IA en 2 paragraphes :
 *    (1) MORSURE  — confronte le joueur à ses choix
 *    (2) ACTION   — propose 1-3 actions concrètes dans le réel
 *
 *  Heuristique : si le texte contient un marqueur explicite
 *  (« [MORSURE] » / « [ACTION] » ou « ── » double tiret cadratin),
 *  on découpe dessus. Sinon on coupe au milieu logiquement (premier
 *  changement de paragraphe après ~60% du texte).
 *
 *  Garde-fou : si le découpage rate, on retourne `{ morsure: full,
 *  action: '' }` pour ne pas perdre le contenu. */
export function splitJournalInTwoParagraphs(
  full: string
): { morsure: string; action: string } {
  const text = full.trim();
  if (!text) return { morsure: '', action: '' };

  /* Marqueurs explicites privilégiés. */
  const markerRe = /\[(?:MORSURE|ACTION)\]|^\s*──+\s*$|^\s*\*\*\s*Action\s*\*\*/im;
  const markedSplit = text.split(/\n+/).reduce<{ buf: string[]; sect: string[][] }>(
    (acc, line) => {
      if (markerRe.test(line)) {
        if (acc.buf.length) acc.sect.push(acc.buf);
        acc.buf = [];
      } else {
        acc.buf.push(line);
      }
      return acc;
    },
    { buf: [], sect: [] }
  );
  if (markedSplit.buf.length) markedSplit.sect.push(markedSplit.buf);
  if (markedSplit.sect.length === 2) {
    return {
      morsure: markedSplit.sect[0]!.join('\n').trim(),
      action: markedSplit.sect[1]!.join('\n').trim()
    };
  }

  /* Fallback : split au milieu logique sur paragraphe vide. */
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length >= 2) {
    const cutAt = Math.max(1, Math.floor(paragraphs.length * 0.6));
    return {
      morsure: paragraphs.slice(0, cutAt).join('\n\n'),
      action: paragraphs.slice(cutAt).join('\n\n')
    };
  }

  /* Texte indécoupable : tout en morsure. */
  return { morsure: text, action: '' };
}

export interface JournalStreamHandlers {
  /** Appelé à chaque chunk reçu, avec le texte cumulé. */
  onChunk?: (cumulative: string) => void;
  /** Appelé une fois quand le stream se termine proprement. */
  onComplete?: (finalText: string) => void;
  /** Appelé une fois sur erreur transport / timeout / abort. */
  onError?: (reason: 'no-endpoint' | 'transport' | 'timeout' | 'abort') => void;
}

const FETCH_TIMEOUT_MS = 25000; // ~600 mots max ~10s ; on garde de la marge
const IDLE_TIMEOUT_MS = 8000;

function endpoint(): string | null {
  const url = import.meta.env.VITE_NARRATIVE_API;
  return typeof url === 'string' && url.length > 0 ? url : null;
}

export function isJournalAIEnabled(): boolean {
  return endpoint() !== null;
}

export function buildJournalInput(
  state: RebirthGameState,
  ending: EndingRender,
  log: string[] = []
): JournalPromptInput {
  /* Bilan du mandat compacté pour le prompt. */
  const mandateBilan = ending.objectives.map(obj => {
    const prog = ending.objectiveProgress.find(p => p.id === obj.id);
    let status: 'satisfied' | 'failed' | 'pending' = 'pending';
    if (prog?.satisfied) status = 'satisfied';
    else if (prog?.failed) status = 'failed';
    return { label: obj.label, status };
  });

  /* Tail du log : on prend les 12 dernières entrées. Le worker
     les recevra mais doit les utiliser parcimonieusement. */
  const tail = log.slice(-12);

  return {
    kind: 'journal',
    state: {
      name: state.name || 'Anonyme',
      camp: state.camp,
      organizationName: state.organization?.name || '—',
      finalDominantTrait: TRAIT_LABELS[state.dominantTrait] || state.dominantTrait
    },
    ending: {
      id: ending.id,
      title: ending.title,
      score: ending.score,
      text: ending.text
    },
    stats: {
      turnsPlayed: ending.stats.turnsPlayed,
      institutionsBuilt: ending.stats.institutionsBuilt,
      refusedCompromise: ending.stats.refusedCompromise,
      betrayedBase: ending.stats.betrayedBase,
      exhaustedMovements: ending.stats.exhaustedMovements
    },
    mandateBilan,
    recentLog: tail,
    formatHint: 'morsure-action'
  };
}

/**
 * Stream du journal personnalisé. Promesse résolue avec le texte
 * final (string), ou null si rien n'a été généré.
 *
 * Le worker renvoie du text/plain (pas de balises [SECTION]).
 * On accumule simplement.
 */
export async function streamJournalAI(
  input: JournalPromptInput,
  handlers: JournalStreamHandlers,
  signal?: AbortSignal
): Promise<string | null> {
  const url = endpoint();
  if (!url) {
    handlers.onError?.('no-endpoint');
    return null;
  }

  const controller = new AbortController();
  const hardTimeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let idleTimeout: ReturnType<typeof setTimeout> | null = null;
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  const armIdle = () => {
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => controller.abort(), IDLE_TIMEOUT_MS);
  };

  let cumulative = '';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal
    });
    if (!response.ok || !response.body) {
      handlers.onError?.('transport');
      return null;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    armIdle();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      armIdle();
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        cumulative += chunk;
        handlers.onChunk?.(cumulative);
      }
    }

    handlers.onComplete?.(cumulative);
    return cumulative || null;
  } catch (err) {
    const reason: JournalStreamHandlers['onError'] extends ((r: infer R) => void) | undefined
      ? R
      : never =
      controller.signal.aborted ? 'abort' : 'transport';
    handlers.onError?.(reason as never);
    return null;
  } finally {
    clearTimeout(hardTimeout);
    if (idleTimeout) clearTimeout(idleTimeout);
  }
}
