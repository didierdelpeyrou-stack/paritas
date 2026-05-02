import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{svelte,ts,js}'],
  theme: {
    extend: {
      colors: {
        // === Palette structurelle ===
        ink: '#0d1014',
        surface: '#1a1f26',
        'surface-2': '#232a33',
        line: '#2a3441',
        parchment: {
          DEFAULT: '#ede4c9',
          dim: '#c8c2b1'
        },
        gold: {
          DEFAULT: '#c89b3c',
          soft: '#e0b35a'
        },

        // === Identités de camp ===
        syndical: {
          DEFAULT: '#c0392b',
          deep: '#7a1d18'
        },
        patronal: {
          DEFAULT: '#2e5e8a',
          deep: '#1a3a5e'
        },

        // === Palette sémantique stricte (UX-2) ===
        // Une seule couleur par usage. Plus de gold qui veut dire 4 choses.
        // Voir CSS variables --sem-* dans app.css pour usage runtime.
        sem: {
          danger: '#dc2626',          // critique, ressource <20, fin tragique
          warning: '#f59e0b',         // tension warning, choix risqué
          positive: '#10b981',        // delta positif, objectif atteint
          info: '#3b82f6',            // tooltips, glossaire, didactique
          action: '#c89b3c',          // CTA primaire (= gold)
          select: '#8b5cf6',          // sélection, voix intérieure
          'loss-bg': '#7f1d1d',       // fond toast pertes (UX-N1, weighted)
          'gain-bg': '#064e3b'        // fond toast gains (moins saillant)
        },

        // Anciennes clés conservées pour compatibilité descendante
        burnt: '#e07a3a',
        legit: '#10b981',
        purple: { DEFAULT: '#8b5cf6' },
        alert: '#dc2626'
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        serif: ['"Source Serif 4"', '"Source Serif Pro"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config;
