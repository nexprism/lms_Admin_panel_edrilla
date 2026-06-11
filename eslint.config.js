import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Project policy: the codebase compiles under full `strict` tsc, but uses
      // pragmatic `any` at legacy/boundary sites (typed incrementally). Flagging
      // every `any` produced 1000+ errors with no actionable signal.
      '@typescript-eslint/no-explicit-any': 'off',
      // ts-ignore comments are allowed when they carry a justification; bare ones
      // are still rejected.
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': 'allow-with-description', minimumDescriptionLength: 3 },
      ],
      // Unused vars stay errors, but `_`-prefixed names are an explicit opt-out
      // (matches the convention already used in the student frontend).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },
)
