/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        surface: {
          0: 'rgb(var(--surface-0) / <alpha-value>)',
          1: 'rgb(var(--surface-1) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
          3: 'rgb(var(--surface-3) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          soft: 'rgb(var(--ink-soft) / <alpha-value>)',
          faint: 'rgb(var(--ink-faint) / <alpha-value>)',
        },
        line: 'rgb(var(--line) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        // Flow colours
        ingest:  '#6366f1',
        hubspot: '#f97316',
        memory:  '#10b981',
        // Zone colours (Tailwind-accessible names)
        zone: {
          client: '#6366f1',
          edge:   '#0ea5e9',
          orch:   '#8b5cf6',
          worker: '#ec4899',
          data:   '#22c55e',
          ext:    '#f59e0b',
        },
      },
      boxShadow: {
        card: '0 6px 24px -8px rgb(0 0 0 / 0.35), 0 2px 8px -3px rgb(0 0 0 / 0.25)',
      },
    },
  },
  plugins: [],
};
