/* ============================================================
   Paritas — ticker causal (V3, post-critique designer §5)
   ============================================================
   Items de news injectés dans le bandeau d'actualités en réaction
   directe aux choix du joueur (flag posé). « Le monde acquiesce.
   Ou il s'oppose. »

   Vie d'un item : poussé au tour T, vit jusqu'au tour T+windowSize.
   Au-delà, retiré du fil. Pas persisté en localStorage — c'est un
   feedback éphémère, pas un état de partie.
   ============================================================ */

import type { CausalNewsTemplate, NewsCategory } from '../../game/content/historicalNews';
import { CAUSAL_NEWS_BY_FLAG } from '../../game/content/historicalNews';

export interface CausalNewsItem {
  /** Identifiant unique pour clé Svelte. */
  id: string;
  category: NewsCategory;
  headline: string;
  tone?: 'acquiesce' | 'oppose' | 'neutral';
  /** Tour où l'item a été émis. */
  emittedAt: number;
  /** Tour de retrait du fil (inclus). */
  expiresAt: number;
  /** Année historique (le tour mappé en année — utilisé pour l'affichage). */
  year?: number;
}

const DEFAULT_WINDOW = 5; // tours

class CausalTickerStore {
  items = $state<CausalNewsItem[]>([]);

  /** Injecte les news liées à un flag, si le flag est connu. À appeler
   *  depuis rebirth.choose() après application des effets. */
  emitFor(flag: string | undefined, currentTurn: number, year: number) {
    if (!flag) return;
    const templates = CAUSAL_NEWS_BY_FLAG[flag];
    if (!templates || templates.length === 0) return;
    const expiresAt = currentTurn + DEFAULT_WINDOW;
    const fresh: CausalNewsItem[] = templates.map((t, i) => ({
      id: `${flag}:${currentTurn}:${i}`,
      category: t.category,
      headline: t.headline.replace('{year}', String(year)),
      tone: t.tone,
      emittedAt: currentTurn,
      expiresAt,
      year
    }));
    this.items = [...this.items, ...fresh];
  }

  /** Items encore valides au tour courant. */
  active(currentTurn: number): CausalNewsItem[] {
    return this.items.filter(i => i.expiresAt >= currentTurn);
  }

  /** Garbage-collect des items expirés — appelé périodiquement
   *  (par exemple à chaque advanceTurn). */
  prune(currentTurn: number) {
    this.items = this.items.filter(i => i.expiresAt >= currentTurn);
  }

  /** Vrai si l'item est « frais » (émis dans les 2 derniers tours). */
  isFresh(item: CausalNewsItem, currentTurn: number): boolean {
    return currentTurn - item.emittedAt <= 1;
  }

  reset() {
    this.items = [];
  }
}

export const causalTicker = new CausalTickerStore();
