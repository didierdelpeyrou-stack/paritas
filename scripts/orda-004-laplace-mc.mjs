/* ════════════════════════════════════════════════════════════════
   Argus / ORDA-004 — La Place Monte Carlo
   ──────────────────────────────────────────────────────────────── */
import {
  startPlaceSession, getCurrentAct, applyAction
} from '../src/game/ateliers/laplace/engine.ts';

const N = 10000;
const out = { victoire: 0, compromis: 0, repression: 0, abandon: 0 };
const finalEscalade = []; const finalFoule = [];
const usage = { tenir: 0, pousser: 0, forcer: 0, reculer: 0 };

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

for (let i = 0; i < N; i++) {
  let s = startPlaceSession();
  let safety = 0;
  while (s.phase !== 'ended' && safety++ < 10) {
    const act = getCurrentAct(s);
    const a = pick(act.actions);
    usage[a.id]++;
    s = applyAction(s, a.id);
  }
  out[s.outcome]++;
  finalEscalade.push(s.escalade);
  finalFoule.push(s.foule);
}

const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
const pct = n => (100 * n / N).toFixed(1);

console.log(`\n=== ORDA-004 / La Place Monte Carlo (${N} parties random) ===\n`);
console.log('Distribution outcomes :');
console.log(`  ✅ victoire   : ${out.victoire.toString().padStart(5)} (${pct(out.victoire)} %)`);
console.log(`  📝 compromis  : ${out.compromis.toString().padStart(5)} (${pct(out.compromis)} %)`);
console.log(`  💢 repression : ${out.repression.toString().padStart(5)} (${pct(out.repression)} %)`);
console.log(`  🚪 abandon    : ${out.abandon.toString().padStart(5)} (${pct(out.abandon)} %)`);
console.log(`\nFin moyenne : escalade ${avg(finalEscalade).toFixed(1)} · foule ${avg(finalFoule).toFixed(1)}`);
console.log(`\nUsage actions :`);
const total = N * 3;
for (const [id, c] of Object.entries(usage)) console.log(`  ${id.padEnd(8)} : ${(100*c/total).toFixed(1)} %`);

console.log(`\n=== Diagnostic Argus ===`);
const dominant = Math.max(...Object.values(out));
const dPct = 100 * dominant / N;
const dKey = Object.keys(out).find(k => out[k] === dominant);
if (dPct > 60) console.log(`  🔴 DÉSÉQUILIBRE : ${dKey} domine à ${dPct.toFixed(1)}%`);
else console.log(`  ✅ Distribution acceptable (max ${dPct.toFixed(1)}%)`);
const minPct = 100 * Math.min(...Object.values(out)) / N;
const minKey = Object.keys(out).find(k => out[k] === Math.min(...Object.values(out)));
if (minPct < 5) console.log(`  🔴 OUTCOME RARE : ${minKey} à ${minPct.toFixed(1)}%`);
else console.log(`  ✅ Tous outcomes atteignables (min ${minPct.toFixed(1)}%)`);
