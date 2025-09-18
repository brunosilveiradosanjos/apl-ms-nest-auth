import type { Config } from 'jest'

/**
 * This configuration is for END-TO-END (E2E) TESTS.
 * It is located in the 'test' directory and is used by 'npm run test:e2e'.
 */
const config: Config = {
  // Use 'ts-jest' to enable TypeScript support.
  preset: 'ts-jest',

  // Use the Node.js environment for testing.
  testEnvironment: 'node',

  // The root directory is one level up (the project root) from this file's location.
  rootDir: '..',

  // A glob pattern that specifically finds all files ending in .e2e-spec.ts
  // within the 'test' directory.
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],

  // Maps the '@/' path alias to the 'src' directory, allowing clean imports in tests.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Automatically clear mocks between every test.
  clearMocks: true,

  // Display individual test results.
  verbose: true,

  // Increase the default timeout for E2E tests, as they involve database
  // connections and can be slower than unit tests.
  testTimeout: 30000,
}

export default config
