// @ts-check

// Using modern ES Module 'import' syntax
import eslint from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

import * as tseslint from 'typescript-eslint'

// Using 'export default' for ES Modules
export default tseslint.config(
  {
    settings: {
      'import/resolver': {
        // This tells eslint-plugin-import to use this resolver
        typescript: {
          alwaysTryTypes: true, // always try to resolve types under `<root>@types`
        },
        // This is the default resolver, keeping it ensures regular node modules are still found
        node: true,
      },
    },
  },
  {
    ignores: ['dist', 'node_modules', '.env', 'coverage', 'eslint.config.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        project: true,
        // --- CommonJS runtime environment where this file is executed.    ---
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/unbound-method': 'warn', // Also disabling this rule from the log
    },
  },
)
