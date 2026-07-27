import type { Config } from 'tailwindcss';

/** Kinaya OS — Tailwind bridge over tokens.css.
 *  Colors map to CSS vars so `data-theme="light"` switches modes with no class churn. */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        sunken: 'var(--bg-sunken)',
        fg: {
          DEFAULT: 'var(--fg-primary)',
          secondary: 'var(--fg-secondary)',
          muted: 'var(--fg-muted)',
        },
        hairline: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
          warm: 'var(--border-warm)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          muted: 'var(--accent-muted)',
          fg: 'var(--accent-fg)',
        },
        state: {
          paid: 'var(--state-paid)',
          due: 'var(--state-due)',
          late: 'var(--state-late)',
        },
        division: {
          studio: 'var(--div-studio)',
          atelier: 'var(--div-atelier)',
          label: 'var(--div-label)',
          general: 'var(--div-general)',
        },
      },
      fontFamily: {
        serif: ['Spectral', 'Georgia', 'serif'],
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        hero: ['48px', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        title: ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        subtitle: ['24px', { lineHeight: '1.3' }],
        lead: ['18px', { lineHeight: '1.45' }],
        body: ['15px', { lineHeight: '1.5' }],
        data: ['13px', { lineHeight: '1.35' }],
        label: ['11px', { lineHeight: '1.3', letterSpacing: '0.04em' }],
      },
      borderRadius: { sm: '6px', md: '12px', lg: '20px', pill: '999px' },
      spacing: { row: '40px' },
      keyframes: {
        'k-spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
      },
      animation: { 'k-spin': 'k-spin 1.6s linear infinite' },
    },
  },
  plugins: [],
};

export default config;
