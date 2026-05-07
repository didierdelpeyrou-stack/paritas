/* ════════════════════════════════════════════════════════════════
   Argus / ORDA-001 — Les Élections Monte Carlo
   ════════════════════════════════════════════════════════════════
   But : 10 000 parties IA vs IA. Vérifier la distribution
   parite / salarie_majorite / patron_majorite et l'absence
   de stratégie dominante triviale.
   ──────────────────────────────────────────────────────────────── */
import {
  startElectionSession, resolveScrutin, nextScrutin,
  setElectionAlloc, aiElectionAlloc
} from '../src/game/ateliers/elections/engine.ts';

const N = 10000;
const out = { salarie_majorite: 0, patron_majorite: 0, parite: 0 };
const sSeats = []; const pSeats = [];
const sChannelWins = { terrain: 0, reunions: 0, affiches: 0, tractage: 0 };
const pChannelWins = { terrain: 0, reunions: 0, affiches: 0, tractage: 0 };
const ties = { terrain: 0, reunions: 0, affiches: 0, tractage: 0 };

for (let i = 0; i < N; i++) {
  let s = startElectionSession();
  let safety = 0;
  while (s.phase !== 'ended' && safety++ < 20) {
    const sAlloc = aiElectionAlloc(s, 'salarie');
    const pAlloc = aiElectionAlloc(s, 'patron');
    s = setElectionAlloc(s, 'salarie', sAlloc);
    s = setElectionAlloc(s, 'patron', pAlloc);
    s = resolveScrutin(s);
    if (s.phase === 'result') s = nextScrutin(s);
    // Stats canaux du scrutin courant (le dernier dans l'historique)
    const last = s.history[s.history.length - 1];
    if (last) {
      for (const c of last.channels) {
        if (c.winner === 'salarie') sChannelWins[c.channel]++;
        else if (c.winner === 'patron') pChannelWins[c.channel]++;
        else ties[c.channel]++;
      }
    }
  }
  out[s.matchOutcome]++;
  sSeats.push(s.salarieTotal);
  pSeats.push(s.patronTotal);
}

const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
const pct = n => (100 * n / N).toFixed(1);

console.log(`\n=== ORDA-001 / Élections Monte Carlo (${N} parties IA vs IA) ===\n`);
console.log('Distribution outcomes :');
console.log(`  ✊ salarie_majorite : ${out.salarie_majorite.toString().padStart(5)} (${pct(out.salarie_majorite)} %)`);
console.log(`  📋 patron_majorite  : ${out.patron_majorite.toString().padStart(5)} (${pct(out.patron_majorite)} %)`);
console.log(`  ⚖️  parite          : ${out.parite.toString().padStart(5)} (${pct(out.parite)} %)`);

console.log(`\nSièges moyens : salarié ${avg(sSeats).toFixed(2)} · patron ${avg(pSeats).toFixed(2)} (sur 21)`);

console.log(`\nVictoires par canal (sur 3×N = ${3*N} scrutins observés) :`);
for (const c of ['terrain', 'reunions', 'affiches', 'tractage']) {
  const sw = sChannelWins[c], pw = pChannelWins[c], t = ties[c];
  const total = sw + pw + t;
  console.log(`  ${c.padEnd(10)} : salarié ${(100*sw/total).toFixed(1)}% · patron ${(100*pw/total).toFixed(1)}% · égalité ${(100*t/total).toFixed(1)}%`);
}

console.log(`\n=== Diagnostic Argus ===`);
const dominant = Math.max(...Object.values(out));
const dominantOut = Object.keys(out).find(k => out[k] === dominant);
const dPct = 100 * dominant / N;
if (dPct > 60) {
  console.log(`  🔴 DÉSÉQUILIBRE : ${dominantOut} domine à ${dPct.toFixed(1)}% (cible : ≤ 60%)`);
} else {
  console.log(`  ✅ Distribution acceptable (max ${dPct.toFixed(1)}%)`);
}
const minOut = Math.min(...Object.values(out));
const minOutKey = Object.keys(out).find(k => out[k] === minOut);
const minPct = 100 * minOut / N;
if (minPct < 5) {
  console.log(`  🔴 OUTCOME RARE : ${minOutKey} à ${minPct.toFixed(1)}% (cible : ≥ 5%)`);
} else {
  console.log(`  ✅ Tous outcomes atteignables (min ${minPct.toFixed(1)}%)`);
}
// Stratégie dominante par canal ?
for (const c of ['terrain', 'reunions', 'affiches', 'tractage']) {
  const sw = sChannelWins[c], pw = pChannelWins[c];
  const ratio = Math.max(sw, pw) / Math.min(sw + 1, pw + 1);
  if (ratio > 4) {
    console.log(`  🟠 Canal "${c}" : un camp gagne ${ratio.toFixed(1)}× plus souvent (asymétrie)`);
  }
}
