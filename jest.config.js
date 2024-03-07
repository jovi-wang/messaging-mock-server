// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "test-coverage",
  collectCoverageFrom: ["src/**/*.js", "!src/server.js"],
  setupFiles: ["dotenv/config"],
  testEnvironment: "node",
  testTimeout: 10000,
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};

export default config;
