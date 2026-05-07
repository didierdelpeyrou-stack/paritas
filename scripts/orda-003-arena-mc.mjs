/* ════════════════════════════════════════════════════════════════
   Argus / ORDA-003 — Brawl Arena Monte Carlo
   ════════════════════════════════════════════════════════════════
   But : 10⁴ résolutions stochastiques. Vérifier qu'il existe les
   3 outcomes (victoire / nul / défaite) avec des distributions
   raisonnables selon le rapport de force initial.
   ──────────────────────────────────────────────────────────────── */
import {
  buildPlayerFaction, buildAdversaryFaction, resolveBrawl
} from '../src/game/org/factionBrawl.ts';

const N = 10000;

function runScenario(name, opts) {
  const out = { victoire: 0, nul: 0, defaite: 0 };
  const losses = { joueur: [], adversaire: [] };
  for (let i = 0; i < N; i++) {
    const j = buildPlayerFaction({ camp: 'salarie', ...opts.joueur });
    const a = buildAdversaryFaction({ camp: 'salarie', ...opts.adversaire });
    const result = resolveBrawl({
      joueur: j, adversaire: a, initialMomentum: opts.momentum ?? 0
    });
    out[result.result]++;
    losses.joueur.push(result.totalJoueurLosses);
    losses.adversaire.push(result.totalAdversaireLosses);
  }
  const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
  const pct = n => (100 * n / N).toFixed(1);
  console.log(`\n--- ${name} ---`);
  console.log(`  Power : joueur ${buildPlayerFaction({ camp: 'salarie', ...opts.joueur }).power} vs adversaire ${buildAdversaryFaction({ camp: 'salarie', ...opts.adversaire }).power}`);
  console.log(`  victoire ${pct(out.victoire)}% · nul ${pct(out.nul)}% · défaite ${pct(out.defaite)}%`);
  console.log(`  Pertes moyennes : joueur ${avg(losses.joueur).toFixed(0)} · adversaire ${avg(losses.adversaire).toFixed(0)}`);
}

console.log(`=== ORDA-003 / Arena Monte Carlo (${N} parties × 4 scénarios) ===`);

runScenario('Manif tranquille (5k foule, police modérée)', {
  joueur: { fouleParis: 5000, militants: 100, cadres: 5, cohesion: 60 },
  adversaire: { fouleParis: 5000, era: 'contemporain', policePressure: 30 },
  momentum: 0
});

runScenario('Manif massive (50k foule, police modérée)', {
  joueur: { fouleParis: 50000, militants: 100, cadres: 5, cohesion: 60 },
  adversaire: { fouleParis: 50000, era: 'contemporain', policePressure: 30 },
  momentum: 10
});

runScenario('Manif fragile (3k foule, police forte)', {
  joueur: { fouleParis: 3000, militants: 50, cadres: 2, cohesion: 30 },
  adversaire: { fouleParis: 3000, era: 'contemporain', policePressure: 80 },
  momentum: -20
});

runScenario('Manif d\'époque (révolution, faible pression)', {
  joueur: { fouleParis: 8000, militants: 80, cadres: 4, cohesion: 70 },
  adversaire: { fouleParis: 8000, era: 'revolution', policePressure: 20 },
  momentum: 5
});

console.log(`\n=== Test reproductibilité B-DT3 (seed) ===`);
const j = buildPlayerFaction({ camp: 'salarie', fouleParis: 10000, militants: 100, cadres: 5, cohesion: 60 });
const a = buildAdversaryFaction({ camp: 'salarie', fouleParis: 10000, era: 'contemporain', policePressure: 50 });
const r1 = resolveBrawl({ joueur: j, adversaire: a, seed: 42 });
const r2 = resolveBrawl({ joueur: j, adversaire: a, seed: 42 });
console.log(`  seed=42 run1 : ${r1.result}, pertes ${r1.totalJoueurLosses}/${r1.totalAdversaireLosses}`);
console.log(`  seed=42 run2 : ${r2.result}, pertes ${r2.totalJoueurLosses}/${r2.totalAdversaireLosses}`);
console.log(`  Reproductibilité : ${r1.result === r2.result && r1.totalJoueurLosses === r2.totalJoueurLosses ? '✅ identique' : '🔴 divergent'}`);

console.log(`\n=== Test branche patron retirée ===`);
try {
  buildPlayerFaction({ camp: 'patron', fouleParis: 0, militants: 100, cadres: 5, cohesion: 50 });
  console.log(`  🔴 La branche patron est encore appelable (devrait throw)`);
} catch (e) {
  console.log(`  ✅ La branche patron throw correctement : "${e.message.slice(0, 60)}..."`);
}
