import tseslint from 'typescript-eslint';
import nextConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';

export const nextJsConfig = tseslint.config(
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'build/',
      'dist/',
      'coverage/',
    ],
  },
  {
    extends: [
      ...tseslint.configs.recommended,
      nextConfig,
      prettierConfig,
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/react-in-jsx-scope': 'off',
    },
  },
);
