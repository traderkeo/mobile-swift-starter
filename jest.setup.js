// Jest setup file for React Native Testing Library
import '@testing-library/jest-native/extend-expect';

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
  isLoaded: () => true,
}));

// Mock expo-asset
jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn(),
    fromModule: jest.fn(() => ({ downloadAsync: jest.fn() })),
  },
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {},
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  return {
    default: {
      call: () => {},
      createAnimatedComponent: (component) => component,
      Value: jest.fn(),
      event: jest.fn(),
      add: jest.fn(),
      eq: jest.fn(),
      set: jest.fn(),
      cond: jest.fn(),
      interpolate: jest.fn(),
      View: 'View',
      Text: 'Text',
      Image: 'Image',
      ScrollView: 'ScrollView',
      FlatList: 'FlatList',
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((value) => value),
    withSpring: jest.fn((value) => value),
    withSequence: jest.fn(),
    withDelay: jest.fn(),
    withRepeat: jest.fn(),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      bezier: jest.fn(),
    },
    runOnJS: jest.fn((fn) => fn),
    runOnUI: jest.fn((fn) => fn),
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  Link: 'Link',
  Stack: {
    Screen: 'Screen',
  },
  Tabs: {
    Screen: 'Screen',
  },
}));
