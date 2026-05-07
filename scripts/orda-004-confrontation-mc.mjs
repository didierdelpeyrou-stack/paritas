/* ════════════════════════════════════════════════════════════════
   Argus / ORDA-004 — Confrontation Monte Carlo
   Corps II Géomètres en lead.
   ──────────────────────────────────────────────────────────────── */
import {
  startConfrSession, pickAction, resolveRound, nextRound,
  MANIF_ACTIONS, POLICE_ACTIONS
} from '../src/game/ateliers/confrontation/engine.ts';

const N = 10000;
const out = { manif_victoire: 0, police_victoire: 0, blocage: 0 };
const finalZones = []; const rounds = [];
const mUsage = {}, pUsage = {};
MANIF_ACTIONS.forEach(a => mUsage[a.id] = 0);
POLICE_ACTIONS.forEach(a => pUsage[a.id] = 0);

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

for (let i = 0; i < N; i++) {
  let s = startConfrSession();
  let safety = 0;
  while (s.phase !== 'ended' && safety++ < 20) {
    const m = pick(MANIF_ACTIONS).id;
    const p = pick(POLICE_ACTIONS).id;
    mUsage[m]++; pUsage[p]++;
    s = pickAction(s, 'manif', m);
    s = pickAction(s, 'police', p);
    s = resolveRound(s);
    if (s.phase === 'result') s = nextRound(s);
  }
  out[s.matchOutcome]++;
  finalZones.push(s.zone);
  rounds.push(s.round);
}

const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
const pct = n => (100 * n / N).toFixed(1);

console.log(`\n=== ORDA-004 / Confrontation Monte Carlo (${N} parties random) ===\n`);
console.log('Distribution outcomes :');
console.log(`  ✊ manif_victoire  : ${out.manif_victoire.toString().padStart(5)} (${pct(out.manif_victoire)} %)`);
console.log(`  🛡  police_victoire : ${out.police_victoire.toString().padStart(5)} (${pct(out.police_victoire)} %)`);
console.log(`  ⚖️  blocage         : ${out.blocage.toString().padStart(5)} (${pct(out.blocage)} %)`);

console.log(`\nZone finale moyenne : ${avg(finalZones).toFixed(1)}`);
console.log(`Rounds moyens : ${avg(rounds).toFixed(2)}`);

console.log(`\nUsage moves :`);
const total = N * 3;
for (const [id, c] of Object.entries(mUsage)) console.log(`  manif.${id.padEnd(14)} : ${(100*c/total).toFixed(1).padStart(5)} %`);
for (const [id, c] of Object.entries(pUsage)) console.log(`  police.${id.padEnd(13)} : ${(100*c/total).toFixed(1).padStart(5)} %`);

console.log(`\n=== Diagnostic Argus ===`);
const dominant = Math.max(...Object.values(out));
const dPct = 100 * dominant / N;
const dKey = Object.keys(out).find(k => out[k] === dominant);
if (dPct > 60) console.log(`  🔴 DÉSÉQUILIBRE : ${dKey} domine à ${dPct.toFixed(1)}% (cible : ≤ 60%)`);
else console.log(`  ✅ Distribution acceptable (max ${dPct.toFixed(1)}%)`);
const minPct = 100 * Math.min(...Object.values(out)) / N;
const minKey = Object.keys(out).find(k => out[k] === Math.min(...Object.values(out)));
if (minPct < 5) console.log(`  🔴 OUTCOME RARE : ${minKey} à ${minPct.toFixed(1)}% (cible : ≥ 5%)`);
else console.log(`  ✅ Tous outcomes atteignables (min ${minPct.toFixed(1)}%)`);
