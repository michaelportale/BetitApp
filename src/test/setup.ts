// Global setup for unit tests (jest-expo preset).
// betStore persists through AsyncStorage, so use the official in-memory mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
