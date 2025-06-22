/* eslint-env node */

const productionErrorOtherwiseWarning = process.env.NODE_ENV === 'production' ? 'error' : 'warn'
const productionError = process.env.NODE_ENV === 'production' ? 'error' : 0
const productionWarning = process.env.NODE_ENV === 'production' ? 'warn' : 0

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  ignorePatterns: ['**/.*', '**/*.md', '**/package.json', '**/package-lock.json', '**/tsconfig.json', '**/scripts/**'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  rules: {
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-constant-condition': productionWarning,
    'no-debugger': productionErrorOtherwiseWarning,
    'no-empty-pattern': 'off',
    'prettier/prettier': productionError,
    'spaced-comment': [productionErrorOtherwiseWarning, 'always', { markers: ['/'] }],
  },
}
