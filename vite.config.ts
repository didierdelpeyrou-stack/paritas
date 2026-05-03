import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

/* Build version stamp — affichée dans Settings pour confirmer
   que l'utilisateur charge bien la dernière version (anti cache
   browser bloqué). Format ISO court UTC. */
const BUILD_VERSION = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

export default defineConfig({
  plugins: [svelte()],
  base: './',
  resolve: {
    alias: {
      $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
      $components: fileURLToPath(new URL('./src/components', import.meta.url))
    }
  },
  define: {
    __BUILD_VERSION__: JSON.stringify(BUILD_VERSION)
  },
  server: { port: 4321, host: true, strictPort: false }
});
