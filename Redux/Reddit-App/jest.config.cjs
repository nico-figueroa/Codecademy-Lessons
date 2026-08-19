module.exports = {
  testEnvironment: "jsdom",

  // Load both your general jest setup AND Selenium setup
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js",
    "<rootDir>/src/__tests__/e2e/config/selenium.setup.js"
  ],

  transform: {
    "^.+\\.[tj]sx?$": "babel-jest"
  },

  // Ignore ALL config files in e2e/config
  testPathIgnorePatterns: [
    "<rootDir>/src/__tests__/e2e/config/"
  ],

  testTimeout: 60000
};
