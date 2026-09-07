import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

/**
 * Physical direction utilities break RTL. The project is bidirectional by default,
 * so they are banned in favour of logical properties (ms/me, ps/pe, start/end).
 * See CLAUDE.md §11.
 */
const PHYSICAL_DIRECTION_UTILITIES =
  /(^|\s|:)(-?(ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br)-[\w./[\]-]+|text-(left|right)|float-(left|right))(\s|$)/;

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },
  {
    files: ['src/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `JSXAttribute[name.name='className'] Literal[value=${PHYSICAL_DIRECTION_UTILITIES}]`,
          message:
            'Use logical direction utilities (ms-/me-/ps-/pe-/start-/end-/text-start/text-end) so the layout works in both RTL and LTR. See CLAUDE.md §11.',
        },
        {
          selector: `JSXAttribute[name.name='className'] TemplateElement[value.raw=${PHYSICAL_DIRECTION_UTILITIES}]`,
          message:
            'Use logical direction utilities (ms-/me-/ps-/pe-/start-/end-/text-start/text-end) so the layout works in both RTL and LTR. See CLAUDE.md §11.',
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
];

export default eslintConfig;
