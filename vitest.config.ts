import { defineConfig } from 'vitest/config';

/* Vitest config minimal — focus moteur pur (pas Svelte components).
   - environment: node, le moteur n'a aucune dépendance UI
   - includes: tests à côté du code (*.test.ts) dans src/game/
   - excludes: composants Svelte, scripts MC (testés via npm run check) */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/game/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.wrangler'],
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/game/**/*.ts'],
      exclude: ['src/game/**/*.test.ts', 'src/game/**/types.ts'],
      reporter: ['text', 'json-summary']
    }
  }
});
