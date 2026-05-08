import {
  simulateAllMatignonPaths,
  evaluateMatignonLearning,
  auditMatignonSession,
} from '../src/game/negotiation/matignon.ts';

const paths = simulateAllMatignonPaths();
console.log(`\n=== ORDA-003 / Matignon — Argus joue les ${paths.length} chemins ===\n`);

const outcomes = {};
for (const p of paths) {
  const id = p.state.result?.outcome.agreementId ?? 'rupture';
  outcomes[id] = (outcomes[id] ?? 0) + 1;
}

console.log('Distribution outcomes (sur ' + paths.length + ' chemins) :');
for (const [k, v] of Object.entries(outcomes).sort((a,b)=>b[1]-a[1])) {
  console.log(`  ${String(k).padEnd(40)} : ${v} (${(100*v/paths.length).toFixed(1)} %)`);
}

// Profil 9 compétences
const evals = paths.map(p => evaluateMatignonLearning(p.state));
console.log(`\nProfil moyen sur ${paths.length} chemins :`);
const sample = evals[0] ?? {};
const keys = Object.keys(sample.scores ?? {});
for (const k of keys) {
  const avg = evals.reduce((s,e) => s + (e.scores?.[k] ?? 0), 0) / evals.length;
  console.log(`  ${k.padEnd(28)} : ${avg.toFixed(2)}`);
}

console.log(`\nNombre de chemins distincts par outcome :`);
console.log(`  -> ${Object.keys(outcomes).length} outcomes distincts détectés`);
