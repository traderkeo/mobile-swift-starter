// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettier = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettier,
  {
    ignores: [
      'dist/*',
      'workers/*',
      'scripts/*',
      'jest.setup.js',
      'jest.setup.pre.js',
      '**/__tests__/*',
    ],
  },
]);
