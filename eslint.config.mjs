// import js from "@eslint/js";
// import globals from "globals";
// import { defineConfig } from "eslint/config";

// export default defineConfig([
//   { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
//   { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } ,
//     rules: {
//       semi: ["error", "always"],
//       quotes: ["error", "single"],
//       "no-unused-vars": "warn",
//       camelcase: ["error", { properties: "always" },
//       "prettier/prettier": ["error", {
//       "semi": true,
//       "singleQuote": true,
//       "trailingComma": "all"
//     }]
//       ]
//     },
//   plugins: ["prettier"],
// extends: [...compat.extends("eslint:recommended", "plugin:prettier/recommended")]
//   },

// ]);

import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "single"],
      "no-unused-vars": "warn",
      camelcase: ["error", { properties: "always" }],
    },
  },

  {
    files: ["**/*.mjs"],
    languageOptions: {
      sourceType: "module",
    },
  },
];
