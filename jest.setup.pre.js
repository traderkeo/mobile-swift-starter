// Pre-setup file that runs before the test environment is set up
// This mocks expo's winter runtime to prevent import errors

// Provide structuredClone polyfill for older Node versions
if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Set up global mocks before expo is loaded
global.__ExpoImportMetaRegistry = {};

// Mock the expo winter runtime
jest.mock('expo/src/winter/runtime.native', () => ({}), { virtual: true });
jest.mock('expo/src/winter/installGlobal', () => ({}), { virtual: true });
