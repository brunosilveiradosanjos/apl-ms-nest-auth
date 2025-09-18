import type { Config } from 'jest'

const config: Config = {
  /**
   * Specifies the preset to use. 'ts-jest' automatically configures Jest
   * to handle TypeScript files, including transformation and source map support.
   */
  preset: 'ts-jest',

  /**
   * The environment in which the tests will be run. 'node' is essential for
   * backend applications as it provides a Node.js-like environment.
   */
  testEnvironment: 'node',

  /**
   * The root directory that Jest should scan for tests and modules within.
   * Since this config file is in 'test/', setting it to '..' makes the
   * project's base directory the root for all other paths.
   */
  rootDir: '..',

  /**
   * A glob pattern that tells Jest which files contain tests. This pattern is
   * specifically for E2E tests, looking for *.e2e-spec.ts files inside the 'test' directory.
   */
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],

  /**
   * A map from regular expressions to module names that allows for aliased
   * imports (e.g., '@/modules/auth'). This is crucial for clean imports.
   */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  /**
   * An array of file extensions your modules use. Jest will look for these
   * file types when resolving modules.
   */
  moduleFileExtensions: ['js', 'json', 'ts'],

  /**
   * Automatically clear mock calls, instances, and results before every test.
   * This is a best practice to ensure test isolation and prevent tests from
   * interfering with each other's mock states.
   */
  clearMocks: true,

  /**
   * Indicates whether each individual test should be reported during the run.
   * This provides more detailed output in the terminal.
   */
  verbose: true,
}

export default config
