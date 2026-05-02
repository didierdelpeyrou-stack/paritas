import type { Scenario } from '../../types';

/**
 * Scenario content is lazy-loaded as Vite code-split chunks. The
 * scenario catalog adds ~95 KB to the bundle but isn't needed until
 * the first scene resolves — well after StartScreen mount.
 *
 * Call `loadAllScenarios()` once at app mount (or before game start).
 * After resolution, `getAllScenarios()` returns the cached array
 * synchronously, so existing pure-function call sites keep working.
 */

let CACHE: Scenario[] | null = null;
let LOAD_PROMISE: Promise<Scenario[]> | null = null;

export async function loadAllScenarios(): Promise<Scenario[]> {
  if (CACHE) return CACHE;
  if (LOAD_PROMISE) return LOAD_PROMISE;

  LOAD_PROMISE = (async () => {
    const [premium, matignon, patron, persona, early, late] = await Promise.all([
      import('./premium'),
      import('./1936-matignon'),
      import('./patron'),
      import('./persona'),
      import('./early-period'),
      import('./late-period')
    ]);
    CACHE = [
      ...premium.PREMIUM_SCENARIOS,
      matignon.SCENARIO_1936_MATIGNON,
      ...patron.PATRON_SCENARIOS,
      ...persona.PERSONA_SCENARIOS,
      ...early.EARLY_PERIOD_SCENARIOS,
      ...late.LATE_PERIOD_SCENARIOS
    ].sort((a, b) => a.turn - b.turn);
    return CACHE;
  })();
  return LOAD_PROMISE;
}

export function getAllScenarios(): Scenario[] {
  return CACHE ?? [];
}

export function scenarioById(id: string): Scenario | undefined {
  return getAllScenarios().find(s => s.id === id);
}
