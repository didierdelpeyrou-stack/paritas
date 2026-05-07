/* ════════════════════════════════════════════════════════════════
   Argus / ORDA-002 — La Grève Monte Carlo
   ════════════════════════════════════════════════════════════════ */
import {
  startGreveSession, pickGreveMove, resolveGreveRound, nextGreveRound,
  SALARIE_GREVE_MOVES, PATRON_GREVE_MOVES
} from '../src/game/ateliers/greve/engine.ts';

const N = 10000;
const out = {
  accord_victorieux: 0, accord_partiel: 0, ouverture_negociation: 0,
  echec_greve: 0, patron_impose: 0
};
const finalSolid = [], finalProd = [], finalZone = [], rounds = [];
const sMoveCount = {}, pMoveCount = {};
SALARIE_GREVE_MOVES.forEach(m => sMoveCount[m.id] = 0);
PATRON_GREVE_MOVES.forEach(m => pMoveCount[m.id] = 0);

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

for (let i = 0; i < N; i++) {
  let s = startGreveSession();
  let safety = 0;
  while (s.phase !== 'ended' && safety++ < 20) {
    const sm = pick(SALARIE_GREVE_MOVES).id;
    const pm = pick(PATRON_GREVE_MOVES).id;
    sMoveCount[sm]++;
    pMoveCount[pm]++;
    s = pickGreveMove(s, 'salarie', sm);
    s = pickGreveMove(s, 'patron', pm);
    s = resolveGreveRound(s);
    if (s.phase === 'result') s = nextGreveRound(s);
  }
  out[s.matchOutcome]++;
  finalSolid.push(s.solidarite);
  finalProd.push(s.production);
  finalZone.push(s.zone);
  rounds.push(s.round);
}

const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
const pct = n => (100 * n / N).toFixed(1);

console.log(`\n=== ORDA-002 / Grève Monte Carlo (${N} parties random vs random) ===\n`);
console.log('Distribution outcomes :');
for (const k of Object.keys(out)) {
  const icon = { accord_victorieux: '🏆', accord_partiel: '✅', ouverture_negociation: '🤝', echec_greve: '❌', patron_impose: '🏭' }[k];
  console.log(`  ${icon} ${k.padEnd(22)} : ${out[k].toString().padStart(5)} (${pct(out[k])} %)`);
}

console.log(`\nFin de partie moyenne :`);
console.log(`  Solidarité : ${avg(finalSolid).toFixed(1)} (départ 80, échec ≤10)`);
console.log(`  Production : ${avg(finalProd).toFixed(1)} (départ 75, victoire si ≤10)`);
console.log(`  Zone       : ${avg(finalZone).toFixed(1)} (départ 50)`);
console.log(`  Rounds     : ${avg(rounds).toFixed(2)} / 5`);

console.log(`\nUsage des moves :`);
for (const [m, c] of Object.entries(sMoveCount)) {
  const total = Object.values(sMoveCount).reduce((s, x) => s + x, 0);
  console.log(`  salarié.${m.padEnd(15)} : ${(100*c/total).toFixed(1).padStart(5)} %`);
}
for (const [m, c] of Object.entries(pMoveCount)) {
  const total = Object.values(pMoveCount).reduce((s, x) => s + x, 0);
  console.log(`  patron.${m.padEnd(16)} : ${(100*c/total).toFixed(1).padStart(5)} %`);
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
