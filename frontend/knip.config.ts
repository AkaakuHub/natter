import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignoreDependencies: [
    // ESLint dependencies required by Next.js
    'eslint',
    'eslint-config-next',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
  ],
  ignore: [
    // Keep UI components that might be used in the future
    'src/components/ui/**',
  ],
};

export default config;