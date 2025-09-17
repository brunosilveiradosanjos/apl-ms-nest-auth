import type { Config } from 'jest'

const config: Config = {
  // Use 'ts-jest' preset for automatic TypeScript configuration
  preset: 'ts-jest',

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The root of the project, relative to this config file's location (test/)
  rootDir: '..',

  // The glob patterns Jest uses to detect E2E test files
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],

  // A map from regular expressions to module names for path aliases
  // This path is now relative to the rootDir we set above (the project root)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'json', 'ts'],
}

export default config
