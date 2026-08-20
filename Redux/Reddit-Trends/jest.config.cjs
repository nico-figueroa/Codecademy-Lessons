module.exports = {
  testTimeout: 60000,
  projects: [
    {
      displayName: "unit",
      testEnvironment: "jsdom",
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
      transform: {
        "^.+\\.[tj]sx?$": "babel-jest"
      },
      testPathIgnorePatterns: [
        "<rootDir>/src/__tests__/e2e/"
      ]
    },
    {
      displayName: "e2e",
      testEnvironment: "node",
      setupFilesAfterEnv: [
        "<rootDir>/src/__tests__/e2e/config/selenium.setup.js"
      ],
      transform: {
        "^.+\\.[tj]sx?$": "babel-jest"
      },
      testMatch: ["<rootDir>/src/__tests__/e2e/tests/**/*.test.js"]
    }
  ]
};
