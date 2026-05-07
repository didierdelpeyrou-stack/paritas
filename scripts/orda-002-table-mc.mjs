/* ════════════════════════════════════════════════════════════════
   Argus / ORDA-002 — La Table Monte Carlo
   ════════════════════════════════════════════════════════════════
   Pas d'AI dans l'engine — on utilise random play pour mesurer
   le baseline de l'engine lui-même. Si random produit 100 % d'un
   outcome, c'est un déséquilibre intrinsèque du moteur.
   ──────────────────────────────────────────────────────────────── */
import {
  startTableSession, pickTableMove, resolveTableRound, nextTableRound,
  SALARIE_MOVES, PATRON_MOVES
} from '../src/game/ateliers/table/engine.ts';

const N = 10000;
const out = { accord_ambitieux: 0, accord_minimal: 0, rupture: 0 };
const finalZones = [];
const sMoveCount = {};
const pMoveCount = {};
SALARIE_MOVES.forEach(m => sMoveCount[m.id] = 0);
PATRON_MOVES.forEach(m => pMoveCount[m.id] = 0);

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

for (let i = 0; i < N; i++) {
  let s = startTableSession();
  let safety = 0;
  while (s.phase !== 'ended' && safety++ < 20) {
    const sm = pick(SALARIE_MOVES).id;
    const pm = pick(PATRON_MOVES).id;
    sMoveCount[sm]++;
    pMoveCount[pm]++;
    s = pickTableMove(s, 'salarie', sm);
    s = pickTableMove(s, 'patron', pm);
    s = resolveTableRound(s);
    if (s.phase === 'result') s = nextTableRound(s);
  }
  out[s.matchOutcome]++;
  finalZones.push(s.zone);
}

const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
const pct = n => (100 * n / N).toFixed(1);

console.log(`\n=== ORDA-002 / Table Monte Carlo (${N} parties random vs random) ===\n`);
console.log('Distribution outcomes :');
console.log(`  ✅ accord_ambitieux : ${out.accord_ambitieux.toString().padStart(5)} (${pct(out.accord_ambitieux)} %)`);
console.log(`  📝 accord_minimal   : ${out.accord_minimal.toString().padStart(5)} (${pct(out.accord_minimal)} %)`);
console.log(`  ❌ rupture          : ${out.rupture.toString().padStart(5)} (${pct(out.rupture)} %)`);

console.log(`\nZone finale moyenne : ${avg(finalZones).toFixed(1)} (départ 50, ambitieux ≥65, rupture ≤34)`);

console.log(`\nUsage des moves (par camp, random uniforme attendu) :`);
for (const [m, c] of Object.entries(sMoveCount)) {
  console.log(`  salarié.${m.padEnd(12)} : ${(100*c/(N*3)).toFixed(1).padStart(5)} %`);
}
for (const [m, c] of Object.entries(pMoveCount)) {
  console.log(`  patron.${m.padEnd(13)} : ${(100*c/(N*3)).toFixed(1).padStart(5)} %`);
}

console.log(`\n=== Diagnostic Argus ===`);
const dominant = Math.max(...Object.values(out));
const dominantOut = Object.keys(out).find(k => out[k] === dominant);
const dPct = 100 * dominant / N;
if (dPct > 60) console.log(`  🔴 DÉSÉQUILIBRE : ${dominantOut} domine à ${dPct.toFixed(1)}% (cible : ≤ 60%)`);
else console.log(`  ✅ Distribution acceptable (max ${dPct.toFixed(1)}%)`);
const minOut = Math.min(...Object.values(out));
const minOutKey = Object.keys(out).find(k => out[k] === minOut);
const minPct = 100 * minOut / N;
if (minPct < 5) console.log(`  🔴 OUTCOME RARE : ${minOutKey} à ${minPct.toFixed(1)}% (cible : ≥ 5%)`);
else console.log(`  ✅ Tous outcomes atteignables (min ${minPct.toFixed(1)}%)`);
