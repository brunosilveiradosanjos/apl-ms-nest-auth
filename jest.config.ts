import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
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
