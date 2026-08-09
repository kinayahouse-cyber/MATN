import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--matn-bg) / <alpha-value>)',
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
        DEFAULT: '0px',
        sm: '2px',
        md: '2px',
        lg: '3px',
        full: '9999px',
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
