import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{svelte,ts,js}'],
  theme: {
    extend: {
      colors: {
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
        burnt: '#e07a3a',
        syndical: {
          DEFAULT: '#c0392b',
          deep: '#7a1d18'
        },
        patronal: {
          DEFAULT: '#2e5e8a',
          deep: '#1a3a5e'
        },
        legit: '#5fb56b',
        purple: {
          DEFAULT: '#d18ab0'
        },
        alert: '#e07a6e'
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
