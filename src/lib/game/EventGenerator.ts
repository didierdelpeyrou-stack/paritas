/* ============================================================
   Paritas — generateur d'evenements historiques jouables
   ============================================================ */

import { ERAS, eraForTurn } from '../data/eras';
import { EVENTS, GENERIC_EVENTS } from '../data/events';
import { HISTORICAL_BASE, type HistoricalConflictType, type HistoricalMilestone } from '../data/historicalBase';
import type { Camp, Choice, ChoiceTag, Effects, GameEvent, GameState, SkillKey, StatKey } from '../types';

interface EventGeneratorOptions {
  seed?: number | string;
}

interface NextEventInput {
  turn: number;
  era: number;
  camp: Camp;
  state: GameState;
  seenIds?: Set<string>;
}

interface SimulateInput {
  camp: Camp;
  count: number;
  seed?: number | string;
}

interface WeightedMilestone {
  item: HistoricalMilestone;
  weight: number;
}

const TYPE_LABEL: Record<HistoricalConflictType, string> = {
  negociation: 'negociation',
  institution: 'institution',
  greve: 'rapport de force',
  loi: 'texte de loi',
  alliance: 'alliance',
  historique: 'moment historique',
  succession: 'succession',
  innovation: 'innovation sociale'
};

const STAT_KEYS = new Set<StatKey>([
  'negociation',
  'politique',
  'baratin',
  'production',
  'mobilisation',
  'expertise',
  'prestige',
  'caisse',
  'soutien',
  'influence',
  'sante',
  'economique',
  'social',
  'militant',
  'institutionnel',
  'symbolique'
]);

export class EventGenerator {
  private rng: () => number;
  private salt: string;

  constructor(opts: EventGeneratorOptions = {}) {
    this.salt = String(opts.seed ?? 'paritas');
    this.rng = mulberry32(hashString(this.salt));
  }

  next(input: NextEventInput): GameEvent {
    const seenIds = input.seenIds ?? new Set<string>();
    const premium = this.pickPremium(input, seenIds);
    if (premium) return premium;

    const milestone = this.pickMilestone(input, seenIds);
    if (milestone) return this.buildGeneratedEvent(milestone, input);

    return this.pickGeneric(input, seenIds);
  }

  simulate(input: SimulateInput): GameEvent[] {
    const generator = new EventGenerator({ seed: input.seed ?? this.salt });
    const state = makeSimulationState(input.camp);
    const seen = new Set<string>();
    const events: GameEvent[] = [];

    for (let i = 0; i < input.count; i++) {
      state.turn = i + 1;
      state.era = eraForTurn(state.turn).id;
      const ev = generator.next({ turn: state.turn, era: state.era, camp: input.camp, state, seenIds: seen });
      seen.add(ev.id);
      events.push(ev);
      nudgeSimulationState(state, ev);
    }

    return events;
  }

  private pickPremium(input: NextEventInput, seenIds: Set<string>): GameEvent | null {
    const premium = EVENTS.filter((event) => event.era === input.era && !seenIds.has(event.id));
    if (premium.length === 0) return null;

    const historicPressure =
      input.turn <= 5 ||
      input.state.activeTensions.length >= 2 ||
      input.state.resources.soutien < 28 ||
      input.state.resources.sante < 32;

    if (!historicPressure && this.rng() > 0.38) return null;
    return premium[Math.floor(this.rng() * premium.length)] ?? null;
  }

  private pickMilestone(input: NextEventInput, seenIds: Set<string>): HistoricalMilestone | null {
    const weighted: WeightedMilestone[] = HISTORICAL_BASE
      .filter((item) => item.era === input.era)
      .filter((item) => item.camps.includes('any') || item.camps.includes(input.camp))
      .filter((item) => !seenIds.has(this.generatedId(input.era, item)))
      .map((item) => ({ item, weight: this.scoreMilestone(item, input) }))
      .filter((entry) => entry.weight > 0);

    if (weighted.length === 0) return null;
    return weightedPick(weighted, this.rng);
  }

  private scoreMilestone(item: HistoricalMilestone, input: NextEventInput): number {
    const { resources, capitaux, skills, activeTensions } = input.state;
    let score = 10;

    if (item.arc === 'origines' && input.turn < 35) score += 5;
    if (item.arc === 'apres-guerre' && input.turn >= 40 && input.turn < 75) score += 5;
    if (item.arc === 'xxi' && input.turn >= 70) score += 6;
    if (item.unlocks && !input.state.figures.some(Boolean)) score += 1;

    if (resources.soutien < 30 && hasAny(item, ['soutien', 'social', 'symbolique'])) score += 8;
    if (resources.sante < 35 && hasAny(item, ['sante'])) score += 9;
    if (capitaux.institutionnel > 62 && item.tags.includes('institution')) score += 7;
    if (capitaux.militant > 60 && (item.tags.includes('greve') || item.tags.includes('mobilise'))) score += 7;
    if (skills.expertise > 58 && (item.skills.includes('expertise') || item.tags.includes('institution'))) score += 6;
    if (activeTensions.length > 0 && item.type !== 'historique') score += activeTensions.length * 2;
    if (input.camp === 'patron' && (item.tags.includes('production') || item.tags.includes('lobbying'))) score += 3;
    if (input.camp === 'salarie' && (item.tags.includes('mobilise') || item.tags.includes('greve'))) score += 3;

    return score;
  }

  private buildGeneratedEvent(item: HistoricalMilestone, input: NextEventInput): GameEvent {
    const era = ERAS.find((entry) => entry.id === input.era) ?? eraForTurn(input.turn);
    const institution = item.institution ? ` autour de ${item.institution}` : '';
    const situation =
      input.camp === 'patron'
        ? `Ton organisation patronale doit prendre position${institution}. ${item.summary}`
        : `Ton camp doit choisir comment transformer le rapport de force${institution}. ${item.summary}`;

    return {
      id: this.generatedId(input.era, item),
      era: input.era,
      format: 'reigns',
      title: `${item.year} — ${item.title}`,
      date: `${item.year}, ${era.name}`,
      situation,
      historical: this.historicalText(item),
      portee: this.scopeText(item),
      choices: this.buildChoices(item, input),
      unlocks: item.unlocks,
      illus: this.illustrationFor(item)
    };
  }

  private buildChoices(item: HistoricalMilestone, input: NextEventInput): Choice[] {
    const compromiseSkill = pickFirstSkill(item, ['negociation', 'expertise', 'politique']) ?? 'negociation';
    const forceSkill = pickFirstSkill(item, ['mobilisation', 'baratin', 'politique']) ?? 'mobilisation';
    const technicalSkill = pickFirstSkill(item, ['expertise', 'production', 'politique']) ?? 'expertise';
    const baseDc = baseDcFor(item.type, input.state.difficulty);

    return [
      {
        text: compromiseText(item, input.camp),
        icon: '⚖️',
        recommended: true,
        tag: item.tags.includes('signe') ? 'signe' : 'negocie',
        skillUp: compromiseSkill,
        dc: clampNumber(baseDc - 4, 35, 70),
        effects: normalizeEffects({
          ...scaleEffects(item.effectsHint, 0.75),
          soutien: 4,
          institutionnel: 4,
          negociation: 2
        }),
        effectsFail: normalizeEffects({ soutien: -4, prestige: -3, institutionnel: 1 }),
        explanation: 'Tu cherches la legitimite par l’accord et la reconnaissance mutuelle.',
        longterm: 'La decision renforce les routines de dialogue, mais elle expose aux critiques des plus impatients.'
      },
      {
        text: forceText(item, input.camp),
        icon: input.camp === 'salarie' ? '✊' : '⚔️',
        risky: true,
        tag: item.tags.includes('greve') ? 'greve' : item.tags.includes('mobilise') ? 'mobilise' : 'dur',
        skillUp: forceSkill,
        dc: clampNumber(baseDc + 10, 45, 75),
        effects: normalizeEffects({
          soutien: 8,
          mobilisation: 6,
          militant: 5,
          prestige: 3,
          influence: -5,
          sante: -6
        }),
        effectsFail: normalizeEffects({ soutien: -7, prestige: -6, sante: -8, influence: -3 }),
        explanation: 'Tu transformes le dossier en epreuve de force ouverte.',
        longterm: 'Le symbole peut survivre a la defaite, mais le cout humain et organisationnel monte vite.'
      },
      {
        text: technicalText(item, input.camp),
        icon: '📚',
        tag: item.tags.includes('institution') ? 'institution' : item.tags.includes('production') ? 'production' : 'lobbying',
        skillUp: technicalSkill,
        dc: clampNumber(baseDc + 2, 38, 72),
        effects: normalizeEffects({
          expertise: 5,
          production: 3,
          institutionnel: 5,
          economique: 3,
          soutien: -2
        }),
        effectsFail: normalizeEffects({ expertise: 1, caisse: -5, soutien: -4 }),
        explanation: 'Tu fais passer le conflit par les textes, les donnees et les circuits administratifs.',
        longterm: 'Le dispositif devient plus solide, mais aussi plus difficile a expliquer a la base.'
      }
    ];
  }

  private pickGeneric(input: NextEventInput, seenIds: Set<string>): GameEvent {
    const candidates = GENERIC_EVENTS.filter((event) => (event.era === -1 || event.era === input.era) && !seenIds.has(event.id));
    const pool = candidates.length > 0 ? candidates : GENERIC_EVENTS.filter((event) => event.era === -1 || event.era === input.era);
    const source = pool[Math.floor(this.rng() * pool.length)] ?? GENERIC_EVENTS[0]!;
    const id = this.genericId(input, source);
    return {
      ...source,
      id,
      era: input.era,
      title: source.era === input.era ? source.title : `${source.title} — ${eraForTurn(input.turn).arc}`
    };
  }

  private genericId(input: NextEventInput, source: GameEvent): string {
    const slug = source.title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 34);
    const hash = hashString(`${this.salt}:${source.id}:${input.era}:${input.turn}`).toString(36).slice(0, 5);
    return `gen-${input.era}-historique-${slug}-${hash}`;
  }

  private generatedId(era: number, item: HistoricalMilestone): string {
    const slug = item.title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 34);
    const hash = hashString(`${this.salt}:${item.id}:${era}`).toString(36).slice(0, 5);
    return `gen-${era}-${item.type}-${slug}-${hash}`;
  }

  private historicalText(item: HistoricalMilestone): string {
    const actors = item.actors.length ? ` Acteurs : ${item.actors.join(', ')}.` : '';
    const institution = item.institution ? ` Institution : ${item.institution}.` : '';
    return `${item.summary}${institution}${actors}`;
  }

  private scopeText(item: HistoricalMilestone): string {
    return `Ce jalon travaille le paritarisme comme ${TYPE_LABEL[item.type]} : il met en tension pouvoir economique, legitimite sociale et capacite institutionnelle.`;
  }

  private illustrationFor(item: HistoricalMilestone): string {
    if (item.type === 'greve') return 'manif';
    if (item.type === 'loi') return 'livre';
    if (item.type === 'institution') return 'matignon';
    if (item.type === 'alliance') return 'barricade';
    return 'livre';
  }
}

export function validateGeneratedEvent(event: GameEvent, camp: Camp): string[] {
  const errors: string[] = [];
  if (!event.id) errors.push('missing id');
  if (!event.title) errors.push(`missing title for ${event.id}`);
  if (!event.choices || event.choices.length < 2) errors.push(`${event.id}: expected at least 2 choices`);

  const enabled = event.choices.filter((choice) => !choice.req || choice.req({ camp }));
  if (enabled.length < 2) errors.push(`${event.id}: expected at least 2 enabled choices for ${camp}`);

  for (const choice of event.choices) {
    for (const key of Object.keys(choice.effects)) {
      if (!STAT_KEYS.has(key as StatKey)) errors.push(`${event.id}: invalid effect key ${key}`);
    }
    if (choice.effectsFail) {
      for (const key of Object.keys(choice.effectsFail)) {
        if (!STAT_KEYS.has(key as StatKey)) errors.push(`${event.id}: invalid fail effect key ${key}`);
      }
    }
  }

  return errors;
}

function weightedPick(entries: WeightedMilestone[], rng: () => number): HistoricalMilestone {
  const total = entries.reduce((acc, entry) => acc + entry.weight, 0);
  let cursor = rng() * total;
  for (const entry of entries) {
    cursor -= entry.weight;
    if (cursor <= 0) return entry.item;
  }
  return entries[entries.length - 1]!.item;
}

function hasAny(item: HistoricalMilestone, keys: string[]): boolean {
  return item.pressure.some((key) => keys.includes(key)) || item.tags.some((key) => keys.includes(key));
}

function pickFirstSkill(item: HistoricalMilestone, preferred: SkillKey[]): SkillKey | null {
  return preferred.find((skill) => item.skills.includes(skill)) ?? null;
}

function baseDcFor(type: HistoricalConflictType, difficulty: 0 | 1 | 2): number {
  const byType: Record<HistoricalConflictType, number> = {
    negociation: 48,
    institution: 52,
    greve: 58,
    loi: 54,
    alliance: 50,
    historique: 56,
    succession: 48,
    innovation: 52
  };
  return byType[type] + difficulty * 5;
}

function compromiseText(item: HistoricalMilestone, camp: Camp): string {
  if (camp === 'patron') return `Signer un compromis encadre sur ${item.title}`;
  return `Obtenir un accord paritaire sur ${item.title}`;
}

function forceText(item: HistoricalMilestone, camp: Camp): string {
  if (camp === 'patron') return `Durcir la ligne et tester le rapport de force`;
  return `Mobiliser la base jusqu’au rapport de force`;
}

function technicalText(item: HistoricalMilestone, camp: Camp): string {
  if (camp === 'patron') return `Passer par l’expertise et la branche professionnelle`;
  return `Construire un dossier technique incontestable`;
}

function scaleEffects(effects: Effects, ratio: number): Effects {
  const out: Effects = {};
  for (const [key, value] of Object.entries(effects)) {
    out[key as StatKey] = Math.round((value ?? 0) * ratio);
  }
  return out;
}

function normalizeEffects(effects: Effects): Effects {
  const out: Effects = {};
  for (const [key, value] of Object.entries(effects)) {
    if (!STAT_KEYS.has(key as StatKey) || value === undefined || value === 0) continue;
    out[key as StatKey] = clampNumber(Math.round(value), -12, 12);
  }
  return out;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeSimulationState(camp: Camp): GameState {
  return {
    name: 'Simulation',
    camp,
    legendaryId: null,
    mode: 'compulsif',
    difficulty: 1,
    turn: 1,
    era: 0,
    skills: { negociation: 35, politique: 32, baratin: 28, production: 34, mobilisation: 36, expertise: 35 },
    resources: { prestige: 35, caisse: 50, soutien: 42, influence: 28, sante: 76 },
    capitaux: { economique: 42, social: 45, militant: 34, institutionnel: 28, symbolique: 32 },
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
    rival: { name: 'Rival', score: 35, lastMove: null },
    log: [],
    ended: false
  };
}

function nudgeSimulationState(state: GameState, event: GameEvent) {
  const first = event.choices[0];
  if (!first) return;
  for (const [key, value] of Object.entries(first.effects)) {
    const stat = key as StatKey;
    if (stat in state.resources) state.resources[stat as keyof typeof state.resources] = clampNumber(state.resources[stat as keyof typeof state.resources] + (value ?? 0), 0, 100);
    else if (stat in state.skills) state.skills[stat as keyof typeof state.skills] = clampNumber(state.skills[stat as keyof typeof state.skills] + (value ?? 0), 0, 100);
    else if (stat in state.capitaux) state.capitaux[stat as keyof typeof state.capitaux] = clampNumber(state.capitaux[stat as keyof typeof state.capitaux] + (value ?? 0), 0, 100);
  }
}
