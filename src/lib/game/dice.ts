/* ============================================================
   Paritas — moteur de tirage
   brut 1-100 + skill/2 + bonus vs DC. Jackpot 95+, Critique 5-.
   ============================================================ */

export interface Bonus {
  src: string;
  v: number;
}

export interface RollOutcome {
  roll: number;
  total: number;
  dc: number;
  success: boolean;
  jackpot: boolean;
  epicFail: boolean;
  bonuses: Bonus[];
  skillContrib: number;
}

/** Tirage brut + skill/2 + somme des bonus, vs DC. */
export function rollDice(skillValue: number, dc: number, bonuses: Bonus[] = []): RollOutcome {
  const roll = Math.floor(Math.random() * 100) + 1;
  const skillContrib = Math.round(skillValue / 2);
  const bonusTotal = bonuses.reduce((acc, b) => acc + b.v, 0);
  const total = roll + skillContrib + bonusTotal;
  const success = total >= dc;
  const jackpot = roll >= 95;
  const epicFail = roll <= 5;
  return { roll, total, dc, success, jackpot, epicFail, bonuses, skillContrib };
}

/** Renvoie une copie d'un objet d'effets, modifiée pour jackpot ou critique. */
export function adjustEffectsByCriticals(eff: Record<string, number>, jackpot: boolean, epicFail: boolean) {
  const out: Record<string, number> = {};
  if (jackpot) {
    for (const k in eff) out[k] = Math.round(eff[k]! * 1.2);
    return out;
  }
  if (epicFail) {
    for (const k in eff) out[k] = Math.round(eff[k]! < 0 ? eff[k]! * 1.5 : eff[k]! * 0.5);
    return out;
  }
  return { ...eff };
}
