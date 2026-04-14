/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/config/seed.js'],
  coverageThreshold: { global: { lines: 70 } },
  setupFilesAfterFramework: ['./src/__tests__/setup.js'],
}
