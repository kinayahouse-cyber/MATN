import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--matn-bg) / <alpha-value>)',
        surface: 'rgb(var(--matn-surface) / <alpha-value>)',
        fg: 'rgb(var(--matn-fg) / <alpha-value>)',
        muted: 'rgb(var(--matn-muted) / <alpha-value>)',
        line: 'rgb(var(--matn-line) / <alpha-value>)',
        'line-strong': 'rgb(var(--matn-line-strong) / <alpha-value>)',
        accent: 'rgb(var(--matn-accent) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        display: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '10px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.4), 0 8px 24px -8px rgb(0 0 0 / 0.5)',
      },
      transitionDuration: {
        fast: '120ms',
        normal: '180ms',
        slow: '260ms',
      },
      transitionTimingFunction: {
        matn: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
