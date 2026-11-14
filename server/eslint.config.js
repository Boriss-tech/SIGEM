import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules', 'dist'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: { sourceType: 'module', globals: { ...globals.node } },
    rules: {
      'no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_' }],
    },
  },
];
