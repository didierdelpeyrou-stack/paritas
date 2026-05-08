import { simulateAllMatignonPaths } from '../src/game/negotiation/matignon.ts';

const sims = simulateAllMatignonPaths();
console.log(`✓ simulateAllMatignonPaths exécuté : ${sims.length} chemins simulés`);

// Distribution outcomes
const outcomes = {};
for (const s of sims) {
  const o = s.state.result?.outcome.agreementId ?? 'rupture';
  outcomes[o] = (outcomes[o] || 0) + 1;
}
console.log('Distribution sur les 36 chemins :');
for (const [k, v] of Object.entries(outcomes)) {
  console.log(`  ${k.padEnd(20)} : ${v} (${(100*v/sims.length).toFixed(1)}%)`);
}

// Profil pédagogique moyen
const learnings = sims.map(s => s.replay.learning);
const skills = ['mandateCraft','tableReading','concessionDesign','coalitionBuilding','legalStrategy','publicNarrative','conflictTiming','institutionalMemory','ethicalClarity'];
console.log('\nMoyenne des 9 compétences sur 36 chemins :');
for (const sk of skills) {
  const avg = learnings.reduce((acc, l) => acc + l.scores[sk], 0) / learnings.length;
  console.log(`  ${sk.padEnd(20)} : ${avg.toFixed(1)}/100`);
}
