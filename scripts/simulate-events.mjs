import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error'
});

try {
  const { EventGenerator, validateGeneratedEvent } = await server.ssrLoadModule('/src/lib/game/EventGenerator.ts');
  const { eraForTurn } = await server.ssrLoadModule('/src/lib/data/eras.ts');

  const reports = [];
  for (const camp of ['salarie', 'patron']) {
    const generator = new EventGenerator({ seed: `simulation-${camp}` });
    const events = generator.simulate({ camp, count: 100, seed: `simulation-${camp}` });
    const ids = new Set();
    const errors = [];
    const byEra = new Map();

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const expectedEra = eraForTurn(i + 1).id;
      if (ids.has(event.id)) errors.push(`${camp}: duplicate id ${event.id}`);
      if (event.era !== expectedEra) errors.push(`${camp}: ${event.id} expected era ${expectedEra}, got ${event.era}`);
      ids.add(event.id);
      byEra.set(event.era, (byEra.get(event.era) ?? 0) + 1);
      errors.push(...validateGeneratedEvent(event, camp));
    }

    reports.push({ camp, total: events.length, unique: ids.size, byEra: Object.fromEntries(byEra), errors });
  }

  const failures = reports.flatMap((report) => report.errors);
  console.log(JSON.stringify(reports, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await server.close();
}
