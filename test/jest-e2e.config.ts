import type { Config } from 'jest'

/**
 * This configuration is for END-TO-END (E2E) TESTS.
 * It is located in the 'test' directory and is used by 'npm run test:e2e'.
 * This configuration is now fully self-contained and does NOT extend the base config.
 */
const config: Config = {
  // Use 'ts-jest' to enable TypeScript support
  preset: 'ts-jest',
  // Use the Node.js environment for testing backend code
  testEnvironment: 'node',
  // The root directory is one level up (the project root) from this file's location
  rootDir: '..',
  // Tell Jest to only look for E2E test files inside the 'test' directory
  roots: ['<rootDir>/test'],
  // Define the file pattern for E2E tests
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
  // Map the '@/' path alias to the 'src' directory from the project root
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Automatically clear mocks between every test
  clearMocks: true,
  // Display individual test results
  verbose: true,
}

export default config
