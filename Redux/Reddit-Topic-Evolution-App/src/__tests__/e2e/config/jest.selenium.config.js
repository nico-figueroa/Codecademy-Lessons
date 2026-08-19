export default {
  testEnvironment: "node",
  testMatch: ["**/selenium/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/selenium/config/selenium.setup.js"],
  testTimeout: 30000
};
