import { defineConfig, loadEnv, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

/* Build version stamp — affichée dans Settings pour confirmer
   que l'utilisateur charge bien la dernière version (anti cache
   browser bloqué). Format ISO court UTC. */
const BUILD_VERSION = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

/* Plugin Argus UX-1 : injecte automatiquement le snippet Microsoft
   Clarity dans toutes les entrées HTML (main + portail + reglages +
   10 ateliers). Garde-fous :
     - n'agit qu'en mode build production ;
     - n'agit que si VITE_CLARITY_ID est défini ;
     - le snippet lui-même skip localhost/127.0.0.1 et l'opt-out
       localStorage côté client.
   Doc : docs/UX_TELEMETRY_CLARITY.md. */
function clarityIdPlugin(): Plugin {
  let clarityId = '';
  let isProd = false;
  return {
    name: 'paritas-clarity-id',
    config(_config, env) {
      isProd = env.command === 'build';
      const e = loadEnv(env.mode, process.cwd(), 'VITE_');
      clarityId = e.VITE_CLARITY_ID || '';
    },
    transformIndexHtml(html) {
      if (!isProd || !clarityId) return html;
      const snippet = `\n    <script>\n      (function () {\n        try {\n          var id = ${JSON.stringify(clarityId)};\n          var host = location.hostname;\n          if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) return;\n          if (localStorage.getItem('paritas_clarity_optout') === '1') return;\n          (function (c, l, a, r, i, t, y) {\n            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };\n            t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;\n            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);\n          })(window, document, "clarity", "script", id);\n        } catch (e) { /* noop */ }\n      })();\n    </script>\n  `;
      return html.replace('</body>', snippet + '</body>');
    }
  };
}

export default defineConfig({
  plugins: [svelte(), clarityIdPlugin()],
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
  server: {
    port: 4321,
    host: true,
    strictPort: false,
    /* ORDA-021 P0 (DX) : empêcher le browser de cacher les ressources
       servies par Vite dev. Évite le besoin de hard-refresh manuel
       à chaque changement (cas courant Svelte 5 quand HMR échoue
       silencieusement). En prod, le serveur web décide de sa propre
       politique de cache. */
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  build: {
    rollupOptions: {
      input: {
        /* Jeu principal PARITAS */
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        /* Portail (page d'accueil avec jeu + ateliers) */
        portail: fileURLToPath(new URL('./portail/index.html', import.meta.url)),
        /* Réglages & accessibilité */
        reglages: fileURLToPath(new URL('./reglages/index.html', import.meta.url)),
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
        'mini-nao':           fileURLToPath(new URL('./mini/nao/index.html', import.meta.url)),
        /* Démos paritarisme (moteur dialectique + arbitrage tour-par-tour) */
        'mini-table-arbiter': fileURLToPath(new URL('./mini/table-arbiter/index.html', import.meta.url)),
        'mini-paritas-tour':  fileURLToPath(new URL('./mini/paritas-tour/index.html', import.meta.url))
      }
    }
  }
});
