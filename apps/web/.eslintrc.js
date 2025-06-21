module.exports = {
  extends: ['@repo/eslint-config/next.js'],
  rules: {
    // Suppress turbo env warnings during development
    'turbo/no-undeclared-env-vars': 'off',
    // Allow any type for now during development
    '@typescript-eslint/no-explicit-any': 'warn',
    // Allow unused vars with underscore prefix
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
  },
};