import type { Config } from 'jest'

/**
 * This configuration is for UNIT TESTS.
 * It is located in the project root and is used by the `npm test` command.
 */
const config: Config = {
  // Use the 'ts-jest' preset to enable TypeScript support and transformation.
  preset: 'ts-jest',

  // Use the Node.js environment for testing backend code.
  testEnvironment: 'node',

  // The root directory for this test run is the project root.
  rootDir: '.',

  // A glob pattern that tells Jest which files contain unit tests.
  // This correctly targets all files ending in .spec.ts inside the src directory.
  testMatch: ['<rootDir>/src/**/*.spec.ts'],

  // Maps the '@/' path alias to the 'src' directory for clean imports.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Ignore the E2E test folder to ensure unit and E2E tests are separated.
  testPathIgnorePatterns: ['/node_modules/', '/test/'],

  // Automatically clear mocks between every test for perfect test isolation.
  clearMocks: true,

  // Display detailed test output in the console.
  verbose: true,

  // A list of glob patterns for files to be excluded from code coverage reports.
  // This provides a more accurate coverage metric by ignoring boilerplate and configuration files.
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    'main.ts',
    '.module.ts',
    '.dto.ts',
    '.entity.ts',
    'i-.*.repository.ts',
    'i-.*.provider.ts',
    '.config.ts',
    'generate-unique-id.ts',
    '.controller.ts',
  ],
}

export default config
