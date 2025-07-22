module.exports = {
  // Use different configurations for unit and component tests
  projects: [
    {
      displayName: 'Unit Tests',
      preset: 'ts-jest',
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
      testMatch: [
        '**/lib/**/__tests__/**/*.(ts|tsx|js)',
        '**/lib/**/*.(test|spec).(ts|tsx|js)'
      ],
      collectCoverageFrom: [
        'src/lib/**/*.{ts,tsx}',
        '!src/lib/**/*.d.ts',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    },
    {
      displayName: 'Component Tests',
      preset: 'jest-expo',
      setupFilesAfterEnv: ['<rootDir>/src/test/component-setup.ts'],
      testMatch: [
        '**/components/**/__tests__/**/*.(ts|tsx|js)',
        '**/components/**/*.(test|spec).(ts|tsx|js)'
      ],
      collectCoverageFrom: [
        'src/components/**/*.{ts,tsx}',
        '!src/components/**/*.d.ts',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo|@expo|lucide-react-native)',
      ],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    }
  ]
};