/* ============================================================
   Paritas — bus d'événements visuels (DeltaPop, screen shake…)
   Permet à n'importe quel module de demander un effet visuel.
   ============================================================ */

import type { StatKey } from '../types';

export interface DeltaPop {
  id: number;
  stat: StatKey;
  value: number;
  ts: number;
}

class FxBus {
  pops = $state<DeltaPop[]>([]);
  private nextId = 1;

  pushDelta(stat: StatKey, value: number) {
    if (Math.round(value) === 0) return;
    const pop: DeltaPop = { id: this.nextId++, stat, value, ts: Date.now() };
    this.pops.push(pop);
    setTimeout(() => {
      this.pops = this.pops.filter(p => p.id !== pop.id);
    }, 1500);
  }

  pushDeltas(deltas: Array<[StatKey, number]>) {
    for (const [k, v] of deltas) this.pushDelta(k, v);
  }
}

export const fx = new FxBus();
