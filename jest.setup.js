// Jest setup file
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve(null)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'WHEN_UNLOCKED',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

