const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/e2e/'],
  transformIgnorePatterns: [
    'node_modules/(?!(@mapbox|@deck\\.gl|@loaders\\.gl|@luma\\.gl|deck\\.gl|mapbox-gl)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@mapbox/tiny-sdf$': '<rootDir>/src/__mocks__/@mapbox/tiny-sdf.js',
    '^deck\\.gl$': '<rootDir>/src/__mocks__/deck.gl.js',
    '^@deck\\.gl/(.*)$': '<rootDir>/src/__mocks__/@deck.gl/$1.js',
  },
  collectCoverageFrom: [
    'src/components/ui/**/*.{js,jsx,ts,tsx}',
    'src/components/custom/**/*.{js,jsx,ts,tsx}',
    'src/utils/**/*.{js,jsx,ts,tsx}',
    'src/lib/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/**/index.ts',
    '!src/**/index.tsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 9,
      functions: 12,
      lines: 16,
      statements: 16,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
