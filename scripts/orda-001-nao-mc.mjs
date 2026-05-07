/* ════════════════════════════════════════════════════════════════
   Argus / ORDA-001 — NAO Monte Carlo de référence
   ════════════════════════════════════════════════════════════════
   But : mesurer la distribution des outcomes sur 10 000 parties
   IA vs IA. Identifier les déséquilibres (outcome dominant à
   >50 %, ou outcome impossible <2 %).
   ──────────────────────────────────────────────────────────────── */
import {
  startNaoSession, resolveSeance,
  setEmployeurMove, setSyndicatMove,
  aiEmployeurMove, aiSyndicatMove,
  ALL_THEMES, ALL_UNIONS, MAX_SEANCES
} from '../src/game/ateliers/nao/engine.ts';

const N = 10000;
const out = { accord_majoritaire: 0, accord_partiel: 0, accord_minoritaire: 0, pv_desaccord: 0 };
const seances = [];
const enveloppes = [];
const cgtSign = []; const cfdtSign = []; const foSign = [];

for (let i = 0; i < N; i++) {
  let s = startNaoSession();
  let safety = 0;
  while (s.phase !== 'ended' && safety++ < 50) {
    const empMove = aiEmployeurMove(s);
    const synMove = aiSyndicatMove(s);
    s = setEmployeurMove(s, empMove);
    s = setSyndicatMove(s, synMove);
    s = resolveSeance(s);
    if (s.phase === 'result') s = { ...s, phase: 'proposing' };
  }
  out[s.outcome]++;
  seances.push(s.seance);
  enveloppes.push(s.enveloppeSpent);
  if (s.signingUnions.includes('cgt'))  cgtSign.push(1); else cgtSign.push(0);
  if (s.signingUnions.includes('cfdt')) cfdtSign.push(1); else cfdtSign.push(0);
  if (s.signingUnions.includes('fo'))   foSign.push(1); else foSign.push(0);
}

const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
const pct = n => (100 * n / N).toFixed(1);

console.log(`\n=== ORDA-001 / NAO Monte Carlo (${N} parties IA vs IA) ===\n`);
console.log('Distribution des outcomes :');
console.log(`  ✅ accord_majoritaire :  ${out.accord_majoritaire.toString().padStart(5)} (${pct(out.accord_majoritaire)} %)`);
console.log(`  📝 accord_partiel    :  ${out.accord_partiel.toString().padStart(5)} (${pct(out.accord_partiel)} %)`);
console.log(`  ⚠️  accord_minoritaire:  ${out.accord_minoritaire.toString().padStart(5)} (${pct(out.accord_minoritaire)} %)`);
console.log(`  ❌ pv_desaccord      :  ${out.pv_desaccord.toString().padStart(5)} (${pct(out.pv_desaccord)} %)`);
console.log(`\nMétriques agrégées :`);
console.log(`  Séances moyennes : ${avg(seances).toFixed(2)} (max ${MAX_SEANCES})`);
console.log(`  Enveloppe moyenne dépensée : ${avg(enveloppes).toFixed(1)} pts / 48`);
console.log(`  Taux signature CGT  : ${pct(cgtSign.filter(x => x).length)} %`);
console.log(`  Taux signature CFDT : ${pct(cfdtSign.filter(x => x).length)} %`);
console.log(`  Taux signature FO   : ${pct(foSign.filter(x => x).length)} %`);

// Diagnostic Argus
console.log(`\n=== Diagnostic Argus ===`);
const dominant = Math.max(...Object.values(out));
const dominantOut = Object.keys(out).find(k => out[k] === dominant);
const dPct = 100 * dominant / N;
if (dPct > 60) {
  console.log(`  🔴 DÉSÉQUILIBRE : ${dominantOut} domine à ${dPct.toFixed(1)}% (cible : ≤ 60%)`);
} else if (dPct > 50) {
  console.log(`  🟠 Tendance dominante : ${dominantOut} à ${dPct.toFixed(1)}% (acceptable mais à surveiller)`);
} else {
  console.log(`  ✅ Distribution équilibrée (max ${dPct.toFixed(1)}% ≤ 50%)`);
}
const minOut = Math.min(...Object.values(out));
const minOutKey = Object.keys(out).find(k => out[k] === minOut);
const minPct = 100 * minOut / N;
if (minPct < 5) {
  console.log(`  🔴 OUTCOME RARE : ${minOutKey} à ${minPct.toFixed(1)}% (cible : ≥ 5%)`);
} else {
  console.log(`  ✅ Tous les outcomes atteignables (min ${minPct.toFixed(1)}%)`);
}
