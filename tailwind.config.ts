import type { Config } from 'tailwindcss';
import base from './design/kinaya-design-system/tailwind.config';

const config: Config = {
  ...base,
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
};

export default config;
