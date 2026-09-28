import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,

      // ==== Style ====
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-console": "off",
      "prefer-const": "error",
      "eqeqeq": "error",

      // ==== Security ====
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // ==== Node best practices ====
      "callback-return": "warn",
      "handle-callback-err": "warn",
      "no-buffer-constructor": "error",
      "no-path-concat": "error",

      // ==== Express best practices ====
      "no-mixed-requires": "warn",
      "no-process-exit": "warn",
    },
  },
];
