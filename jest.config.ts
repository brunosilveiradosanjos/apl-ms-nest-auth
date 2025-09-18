import type { Config } from 'jest'

/**
 * This configuration is for UNIT TESTS.
 * It is located in the project root and is used by the `npm test` command.
 */
const config: Config = {
  // Use 'ts-jest' to enable TypeScript support
  preset: 'ts-jest',
  // Use the Node.js environment for testing backend code
  testEnvironment: 'node',
  // The root directory for this test run is the project root
  rootDir: '.',
  // Tell Jest to only look for test files inside the 'src' directory
  roots: ['<rootDir>/src'],
  // Map the '@/' path alias to the 'src' directory
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Ignore the E2E test folder to ensure separation
  testPathIgnorePatterns: ['/node_modules/', '/test/'],
  // Automatically clear mocks between every test for isolation
  clearMocks: true,
  // Detailed test output
  verbose: true,
  // Define files to be excluded from the coverage report
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
