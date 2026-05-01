/* ============================================================
   Paritas — store réactif (Svelte 5 runes)
   ============================================================ */

import type { GameState, Camp, GameMode, Difficulty, SkillKey, StatKey } from '../types';
import { LEGENDARY_CHARACTERS } from '../data/legendaryCharacters';

const SAVE_KEY = 'paritas_save_v1';

function freshState(): GameState {
  return {
    name: '',
    camp: null,
    legendaryId: null,
    mode: 'compulsif',
    difficulty: 1,
    turn: 1,
    era: 0,
    skills: {
      negociation: 20,
      politique: 20,
      baratin: 20,
      production: 20,
      mobilisation: 20,
      expertise: 15
    },
    resources: { prestige: 30, caisse: 50, soutien: 40, influence: 20, sante: 80 },
    capitaux: { economique: 40, social: 45, militant: 30, institutionnel: 20, symbolique: 25 },
    profil: null,
    profilScores: {},
    lastChoiceTag: null,
    lastChoiceFailed: false,
    activeTensions: [],
    systemLog: [],
    figures: [],
    team: {},
    flags: {},
    questsDone: {},
    eggsFound: [],
    jackpotCount: 0,
    epicFailCount: 0,
    refusedAccords: 0,
    resultStreak: { kind: null, count: 0 },
    rollStats: { total: 0, success: 0, fail: 0, jackpots: 0, crits: 0, bestRoll: 0, longestStreak: 0, bySkill: {} },
    history: [],
    decisions: [],
    rival: { name: '', score: 35, lastMove: null },
    log: [],
    ended: false
  };
}

/* ============================================================
   Store global avec runes
   ============================================================ */

class GameStore {
  state = $state<GameState>(freshState());

  /** Score classique (cumulatif simple, pour info). */
  scoreClassic = $derived(
    Math.round(
      Object.values(this.state.skills).reduce((a, b) => a + b, 0) * 0.5 +
        (this.state.resources.prestige + this.state.resources.soutien + this.state.resources.influence) *
          1.2 +
        Object.keys(this.state.flags).length * 8 +
        this.state.figures.length * 3
    )
  );

  /** Trois axes du score dialectique. */
  axes = $derived.by(() => {
    const r = this.state.resources;
    const s = this.state.skills;
    const c = this.state.capitaux;
    const puissance = (r.caisse + r.influence + s.mobilisation) / 3;
    const legitimite = (r.soutien + r.prestige + c.social + c.symbolique) / 4;
    const durabilite = (r.sante + s.expertise + c.institutionnel) / 3;
    const conflict = (s.mobilisation + c.militant) / 2;
    return { puissance, legitimite, durabilite, conflict };
  });

  /** Score dialectique final (0-100). */
  scoreDialectic = $derived.by(() => {
    const { puissance, legitimite, durabilite, conflict } = this.axes;
    const r = this.state.resources;
    const imbalance =
      Math.abs(puissance - legitimite) * 0.25 +
      Math.abs(puissance - durabilite) * 0.2 +
      Math.abs(legitimite - durabilite) * 0.2;
    const humanCost = r.sante < 35 ? (35 - r.sante) * 0.8 : 0;
    const score =
      puissance * 0.25 +
      legitimite * 0.3 +
      durabilite * 0.3 +
      conflict * 0.15 -
      imbalance -
      humanCost;
    return Math.round(Math.max(0, Math.min(100, score)));
  });

  /* ============== mutations ============== */

  start(opts: { name: string; camp: Camp; mode: GameMode; difficulty: Difficulty; trait: SkillKey; legendaryId?: string | null }) {
    const next = freshState();
    next.name = opts.name;
    next.camp = opts.camp;
    next.legendaryId = opts.legendaryId ?? null;
    next.mode = opts.mode;
    next.difficulty = opts.difficulty;
    next.skills[opts.trait] += 10;
    const legendary = LEGENDARY_CHARACTERS.find((character) => character.id === opts.legendaryId && character.camp === opts.camp);
    if (legendary) {
      for (const [key, value] of Object.entries(legendary.skillAffinity)) {
        next.skills[key as SkillKey] = clamp(next.skills[key as SkillKey] + Math.round((value ?? 0) * 5), 0, 100);
      }
      for (const [key, value] of Object.entries(legendary.statBias)) {
        const delta = Math.round((value ?? 0) * 3);
        if (key in next.resources) next.resources[key as keyof typeof next.resources] = clamp(next.resources[key as keyof typeof next.resources] + delta, 0, 100);
        else if (key in next.capitaux) next.capitaux[key as keyof typeof next.capitaux] = clamp(next.capitaux[key as keyof typeof next.capitaux] + delta, 0, 100);
        else if (key in next.skills) next.skills[key as keyof typeof next.skills] = clamp(next.skills[key as keyof typeof next.skills] + delta, 0, 100);
      }
    }
    next.rival.name = pickRivalName(opts.camp);
    next.rival.score = 35 + opts.difficulty * 8;
    this.state = next;
    this.log(`<b>${opts.name}</b> entre dans l'histoire — côté ${opts.camp === 'patron' ? 'patronal' : 'salarié'}, mode ${opts.mode === 'reflechi' ? 'réfléchi' : 'compulsif'}${legendary ? `, lignée ${legendary.name}` : ''}.`);
    this.persist();
  }

  reset() {
    this.state = freshState();
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {}
  }

  log(msg: string) {
    this.state.log.push(msg);
    if (this.state.log.length > 200) this.state.log = this.state.log.slice(-200);
  }

  setStat(key: keyof typeof this.state.skills, value: number): void;
  setStat(key: keyof typeof this.state.resources, value: number): void;
  setStat(key: keyof typeof this.state.capitaux, value: number): void;
  setStat(key: string, value: number) {
    const v = clamp(value, 0, 100);
    if (key in this.state.skills) (this.state.skills as any)[key] = v;
    else if (key in this.state.resources) (this.state.resources as any)[key] = v;
    else if (key in this.state.capitaux) (this.state.capitaux as any)[key] = v;
  }

  getStat(key: string): number {
    if (key in this.state.skills) return (this.state.skills as any)[key];
    if (key in this.state.resources) return (this.state.resources as any)[key];
    if (key in this.state.capitaux) return (this.state.capitaux as any)[key];
    return 0;
  }

  /* ============== stats jets ============== */

  recordRoll(skill: SkillKey, roll: number, success: boolean, jackpot: boolean, crit: boolean) {
    const s = this.state.rollStats;
    s.total++;
    if (success) s.success++;
    else s.fail++;
    if (jackpot) s.jackpots++;
    if (crit) s.crits++;
    if (roll > s.bestRoll) s.bestRoll = roll;
    if (!s.bySkill[skill]) s.bySkill[skill] = { rolls: 0, success: 0, sumRoll: 0 };
    const sk = s.bySkill[skill]!;
    sk.rolls++;
    if (success) sk.success++;
    sk.sumRoll += roll;

    // tracking de la plus longue streak
    if (success) {
      if (this.state.resultStreak.kind === 's') this.state.resultStreak.count++;
      else this.state.resultStreak = { kind: 's', count: 1 };
      if (this.state.resultStreak.count > s.longestStreak) s.longestStreak = this.state.resultStreak.count;
    } else {
      this.state.resultStreak = { kind: 'f', count: this.state.resultStreak.kind === 'f' ? this.state.resultStreak.count + 1 : 1 };
    }
  }

  /* ============== persistance ============== */

  persist() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch {}
  }

  load(): boolean {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (!data) return false;
      const loaded = JSON.parse(data) as Record<string, unknown>;
      if (loaded.mode === 'jet') loaded.mode = 'compulsif';
      if (loaded.mode === 'expert' || loaded.mode === 'perspicacite') loaded.mode = 'reflechi';
      if (loaded.mode !== 'reflechi' && loaded.mode !== 'compulsif') loaded.mode = 'compulsif';
      if (!('legendaryId' in loaded)) loaded.legendaryId = null;
      this.state = loaded as unknown as GameState;
      return true;
    } catch {
      return false;
    }
  }
}

/* ============================================================
   Helpers
   ============================================================ */

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function pickRivalName(camp: Camp): string {
  const pool =
    camp === 'patron'
      ? ['Eugène Schneider', 'Henri de Wendel', 'François Périgot', 'Ernest-Antoine Seillière']
      : ['Edmond Maire', 'Henri Krasucki', 'Marc Blondel', 'Laurent Berger', 'Nicole Notat'];
  return pool[Math.floor(Math.random() * pool.length)]!;
}

/* Singleton exporté */
export const game = new GameStore();
