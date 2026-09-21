export default {
  testEnvironment: 'node',
  verbose: true,

  // Load .env.test before test modules are evaluated.
  setupFiles: ['./src/tests/setup/envSetup.cjs'],

  // Run DB reset + seed AFTER env loads (Jest loads globalSetup as ESM)
  globalSetup: './src/tests/setup/globalSetup.mjs',
  globalTeardown: './src/tests/setup/globalTeardown.mjs',

  // IMPORTANT: Jest 30 forbids extensionsToTreatAsEsm for .js or .mjs
  // So we DO NOT include it.
  transform: {}
};
