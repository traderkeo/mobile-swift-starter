module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.pre.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm/)?(react-native|@react-native|@react-native-community|expo|@expo|expo-modules-core|@expo-google-fonts|react-navigation|@react-navigation|native-base|react-native-svg|@tanstack|nativewind|react-native-css-interop|tailwindcss))',
  ],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/workers/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/workers/**',
    '!**/*.d.ts',
    '!**/coverage/**',
  ],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
};
