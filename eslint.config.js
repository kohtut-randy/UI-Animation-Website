import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },

  // Type-aware rules are deliberately NOT enabled. typescript-eslint@8 declares a
  // `typescript >=4.8.4 <6.1.0` peer range, so type-aware linting is the one thing that
  // would break on a newer compiler. See docs/05-DEPENDENCIES.md.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, reactHooks.configs.flat['recommended-latest']],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    rules: {
      // Matches the reference codebase: dependency arrays are verified by hand. Needed here
      // since `useGSAP` intentionally takes no dependencies (gsap.matchMedia owns rebuilds),
      // a shape this rule cannot model.
      'react-hooks/exhaustive-deps': 'off',
      'prefer-const': 'error',
      camelcase: 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  // RULE 1: one GSAP registration point. The previous codebase this pattern comes from had
  // `gsap.registerPlugin(ScrollTrigger)` duplicated across six files in two different
  // styles. Registration is global and idempotent, so the duplication was invisible until
  // one file registered a plugin the others did not. Now it cannot happen.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/motion/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'gsap', message: 'Import from motion/gsapClient instead.' },
            { name: 'gsap/ScrollTrigger', message: 'Import from motion/gsapClient instead.' },
            { name: 'gsap/all', message: 'Never gsap/all: it pulls in ~40 kB of unused plugins. Use motion/gsapClient.' },
            { name: '@gsap/react', message: 'Import useGSAP from motion/gsapClient instead.' },
          ],
        },
      ],
    },
  },

  // RULE 2: no inline motion literals. Six eases and three drifting ScrollTrigger start
  // offsets ('top 95%' / 'top 92%' / 'top 90%' for the same intent) is what this replaces.
  // Every value lives in src/constants/motion.ts or it does not exist.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/constants/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^(power|expo|back|circ|sine|elastic)[0-4]?\\.(in|out|inOut)/]',
          message: 'Use an EASE_* constant from constants/motion.ts.',
        },
        {
          selector: 'Literal[value=/^(top|bottom|left|right)\\s+-?[\\d.]+%?$/]',
          message: 'Use a SCROLL_TRIGGER_* constant from constants/motion.ts.',
        },
      ],
    },
  },
)
