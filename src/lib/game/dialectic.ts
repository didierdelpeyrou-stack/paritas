/* ============================================================
   Paritas — moteur dialectique
   Courbes 100 tours, tensions, score, profils émergents
   ============================================================ */

import type { GameState, ChoiceTag, Effects, StatKey, SkillKey } from '../types';
import { clamp, game } from '../stores/game.svelte';

/* ============================================================
   Courbes cibles 100 tours
   ============================================================ */

interface Curve {
  start: number;
  targetByTurn: Record<number, number>;
  vol?: number;
}

export const RESOURCE_CURVES: Record<string, Curve> = {
  caisse: { start: 50, targetByTurn: { 20: 55, 40: 60, 60: 65, 80: 70, 100: 60 }, vol: 8 },
  soutien: { start: 40, targetByTurn: { 20: 55, 40: 62, 60: 68, 80: 65, 100: 60 }, vol: 10 },
  influence: { start: 20, targetByTurn: { 20: 30, 40: 42, 60: 55, 80: 70, 100: 65 }, vol: 9 },
  prestige: { start: 30, targetByTurn: { 20: 38, 40: 50, 60: 62, 80: 75, 100: 70 }, vol: 11 },
  sante: { start: 80, targetByTurn: { 20: 75, 40: 68, 60: 58, 80: 50, 100: 45 }, vol: 7 }
};

export const SKILL_CURVES: Record<string, Curve> = {
  negociation: { start: 20, targetByTurn: { 20: 32, 40: 48, 60: 62, 80: 75, 100: 82 } },
  expertise: { start: 15, targetByTurn: { 20: 28, 40: 45, 60: 60, 80: 72, 100: 80 } },
  mobilisation: { start: 20, targetByTurn: { 20: 35, 40: 55, 60: 70, 80: 75, 100: 72 } },
  politique: { start: 20, targetByTurn: { 20: 28, 40: 42, 60: 58, 80: 70, 100: 78 } },
  production: { start: 20, targetByTurn: { 20: 32, 40: 45, 60: 55, 80: 65, 100: 70 } },
  baratin: { start: 20, targetByTurn: { 20: 30, 40: 42, 60: 55, 80: 65, 100: 72 } }
};

export const CAPITAL_CURVES: Record<string, Curve> = {
  economique: { start: 40, targetByTurn: { 20: 48, 40: 55, 60: 62, 80: 70, 100: 68 } },
  social: { start: 45, targetByTurn: { 20: 55, 40: 62, 60: 70, 80: 73, 100: 70 } },
  militant: { start: 30, targetByTurn: { 20: 42, 40: 58, 60: 72, 80: 75, 100: 65 } },
  institutionnel: { start: 20, targetByTurn: { 20: 30, 40: 45, 60: 60, 80: 75, 100: 80 } },
  symbolique: { start: 25, targetByTurn: { 20: 35, 40: 50, 60: 65, 80: 78, 100: 75 } }
};

export function interpolateCurve(curve: Curve, turn: number): number {
  const points = Object.keys(curve.targetByTurn).map(Number).sort((a, b) => a - b);
  let prevT = 0;
  let prevV = curve.start;
  for (const p of points) {
    const nextV = curve.targetByTurn[p]!;
    if (turn <= p) {
      const ratio = (turn - prevT) / (p - prevT || 1);
      return Math.round(prevV + ratio * (nextV - prevV));
    }
    prevT = p;
    prevV = nextV;
  }
  return prevV;
}

/* ============================================================
   Effets sur capitaux selon le tag du choix
   ============================================================ */

const TAG_CAPITAL: Record<ChoiceTag, Partial<Record<string, number>>> = {
  signe: { social: 1.5, institutionnel: 1.5, symbolique: 0.5 },
  negocie: { social: 1.5, institutionnel: 0.8, economique: 0.5 },
  institution: { institutionnel: 2.0, social: 0.5 },
  mobilise: { militant: 2.0, social: 0.5, symbolique: 0.5 },
  greve: { militant: 2.5, symbolique: 1.0, economique: -0.5 },
  refuse: { militant: 1.0, institutionnel: -0.5 },
  discours: { symbolique: 1.5, social: 0.5 },
  lobbying: { institutionnel: 1.0, economique: 0.5 },
  production: { economique: 1.5 },
  dur: { militant: 1.0, social: -0.5 },
  memoire: { symbolique: 2.0 }
};

export function applyCapitalEffects(tag: ChoiceTag | null, success: boolean) {
  if (!tag) return;
  const eff = TAG_CAPITAL[tag] || {};
  const c = game.state.capitaux as Record<string, number>;
  for (const k in eff) {
    let v = eff[k]!;
    if (!success) v *= 0.3;
    c[k] = clamp((c[k] ?? 30) + v, 0, 100);
  }
}

/* ============================================================
   Tensions dialectiques (effets de seuil + alertes)
   ============================================================ */

export function applyDialecticalTensions(): string[] {
  const s = game.state;
  const r = s.resources;
  const c = s.capitaux;
  const sk = s.skills;
  const tensions: string[] = [];

  // Seuils HAUT
  if (r.caisse > 75) {
    delta('soutien', -2, 'Soupçon de notabilisation');
    delta('prestige', -1, 'Soupçon de notabilisation');
    tensions.push('Soupçon de notabilisation');
  }
  if (r.influence > 80) {
    delta('soutien', -2, 'Capture institutionnelle');
    sk.mobilisation = clamp(sk.mobilisation - 3, 0, 100);
    tensions.push('Capture institutionnelle');
  }
  if (r.soutien > 80 && s.lastChoiceTag === 'signe') {
    delta('soutien', -4, 'Base exigeante : compromis mal vécu');
    delta('negociation', 2, 'Apprentissage par le conflit');
    tensions.push('Base exigeante');
  }
  if (sk.mobilisation > 85) {
    delta('sante', -3, 'Fatigue collective');
    tensions.push('Fatigue collective');
  }
  if (r.prestige > 80 && s.lastChoiceFailed) {
    delta('prestige', -8, 'Chute publique');
    tensions.push('Figure exposée — chute');
  }
  if (sk.expertise > 80) {
    delta('baratin', -1, 'Langage technocratique');
    delta('soutien', -1, 'Langage technocratique');
    tensions.push('Technocratisation');
  }
  if (c.institutionnel > 80) {
    sk.mobilisation = clamp(sk.mobilisation - 3, 0, 100);
    delta('expertise', 1, 'Inertie bureaucratique');
    tensions.push('Institutionnalisation lourde');
  }
  if (c.militant > 80) {
    delta('influence', -2, 'Radicalité périphérique');
    delta('soutien', 2, 'Énergie militante');
    tensions.push('Radicalité forte');
  }

  // Seuils BAS
  if (r.caisse < 25) {
    delta('influence', -2, 'Fragilité matérielle');
    delta('sante', -1, 'Fragilité matérielle');
    tensions.push('Fragilité matérielle');
  }
  if (r.soutien < 25) {
    delta('prestige', -3, 'Perte de mandat');
    sk.mobilisation = clamp(sk.mobilisation - 2, 0, 100);
    tensions.push('Perte de mandat');
  }
  if (r.influence < 20) {
    delta('negociation', -2, 'Isolement politique');
    tensions.push('Isolement politique');
  }
  if (r.sante < 30) {
    delta('negociation', -2, 'Épuisement');
    sk.mobilisation = clamp(sk.mobilisation - 3, 0, 100);
    tensions.push('Épuisement collectif');
  }

  // Configurations remarquables
  if (r.soutien > 60 && r.influence > 55 && c.institutionnel > 55 && r.sante > 50) {
    tensions.push('Compromis durable ✓');
  }
  if (r.influence > 70 && r.soutien < 35) {
    tensions.push('Puissance sans légitimité');
  }

  s.activeTensions = tensions;
  return tensions;
}

function delta(stat: string, d: number, reason?: string) {
  const v = game.getStat(stat);
  game.setStat(stat as any, v + d);
  if (!game.state.systemLog) game.state.systemLog = [];
  game.state.systemLog.push({ turn: game.state.turn, resource: stat, delta: d, reason });
}

/* ============================================================
   Pression d'équilibrage (rappel doux vers les courbes)
   ============================================================ */

export function applyBalancingPressure() {
  const turn = game.state.turn;
  for (const k of Object.keys(RESOURCE_CURVES)) {
    const exp = interpolateCurve(RESOURCE_CURVES[k]!, turn);
    const cur = game.getStat(k);
    const gap = cur - exp;
    if (gap > 20) game.setStat(k as any, cur - 1.5);
    if (gap < -20) game.setStat(k as any, cur + 1.5);
  }
  for (const k of Object.keys(SKILL_CURVES)) {
    const exp = interpolateCurve(SKILL_CURVES[k]!, turn);
    const cur = game.getStat(k);
    const gap = cur - exp;
    if (gap > 25) game.setStat(k as any, cur - 1);
    if (gap < -25) game.setStat(k as any, cur + 1);
  }
  for (const k of Object.keys(CAPITAL_CURVES)) {
    const exp = interpolateCurve(CAPITAL_CURVES[k]!, turn);
    const c = game.state.capitaux as Record<string, number>;
    const cur = c[k] ?? exp;
    const gap = cur - exp;
    if (gap > 25) c[k] = clamp(cur - 1, 0, 100);
    if (gap < -25) c[k] = clamp(cur + 1, 0, 100);
  }
}

/* ============================================================
   Application d'effets directs (via skills/resources/capitaux)
   ============================================================ */

export function applyEffects(eff: Effects): Array<[StatKey, number]> {
  const deltas: Array<[StatKey, number]> = [];
  for (const k in eff) {
    const v = eff[k as StatKey]!;
    const cur = game.getStat(k);
    const adj = softCap(cur, v);
    game.setStat(k as any, cur + adj);
    deltas.push([k as StatKey, adj]);
  }
  return deltas;
}

function softCap(stat: number, delta: number): number {
  if (delta > 0 && stat > 80) return delta * 0.5;
  if (delta < 0 && stat < 20) return delta * 0.5;
  return delta;
}

/* ============================================================
   Pipeline complet appelé après un choix
   ============================================================ */

export function applyChoicePipeline(opts: {
  tag: ChoiceTag | null;
  success: boolean;
  effects: Effects;
}): { deltas: Array<[StatKey, number]>; tensions: string[] } {
  game.state.lastChoiceTag = opts.tag;
  game.state.lastChoiceFailed = !opts.success;
  const deltas = applyEffects(opts.effects);
  applyCapitalEffects(opts.tag, opts.success);
  const tensions = applyDialecticalTensions();
  if (game.state.turn % 5 === 0) applyBalancingPressure();
  // Snapshot d'historique pour les tendances
  game.state.history.push({
    turn: game.state.turn,
    skills: { ...game.state.skills },
    resources: { ...game.state.resources },
    capitaux: { ...game.state.capitaux },
    score: game.scoreClassic
  });
  if (game.state.history.length > 200) game.state.history = game.state.history.slice(-200);
  return { deltas, tensions };
}
