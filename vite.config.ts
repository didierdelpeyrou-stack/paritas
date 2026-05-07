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
  server: { port: 4321, host: true, strictPort: false },
  build: {
    rollupOptions: {
      input: {
        /* Jeu principal PARITAS */
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        /* Ateliers standalone */
        'mini-confrontation': fileURLToPath(new URL('./mini/confrontation/index.html', import.meta.url)),
        'mini-place':         fileURLToPath(new URL('./mini/place/index.html', import.meta.url)),
        'mini-matignon':      fileURLToPath(new URL('./mini/matignon/index.html', import.meta.url)),
        'mini-arena':         fileURLToPath(new URL('./mini/arena/index.html', import.meta.url)),
        'mini-manif':         fileURLToPath(new URL('./mini/manif/index.html', import.meta.url)),
        'mini-meeting':       fileURLToPath(new URL('./mini/meeting/index.html', import.meta.url)),
        /* Micro-apps paritaristes symétriques (salarié ⟺ patron) */
        'mini-table':         fileURLToPath(new URL('./mini/table/index.html', import.meta.url)),
        'mini-greve':         fileURLToPath(new URL('./mini/greve/index.html', import.meta.url)),
        'mini-elections':     fileURLToPath(new URL('./mini/elections/index.html', import.meta.url)),
        'mini-nao':           fileURLToPath(new URL('./mini/nao/index.html', import.meta.url))
      }
    }
  }
});
