import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";

export default [
  js.configs.recommended,
  jsdoc.configs['flat/recommended'],
  {
    ignores: [
      "node_modules/",
      "dist/",
      "coverage/",
      "bench-results/"
    ]
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly"
      }
    },
    plugins: {
      jsdoc: jsdoc
    },
    rules: {
      "indent": ["error", 2, { "SwitchCase": 1 }],
      "quotes": ["error", "single", { "avoidEscape": true, "allowTemplateLiterals": true }],
      "semi": ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "camelcase": ["error", { "properties": "always" }],
      "jsdoc/require-jsdoc": ["error", {
        "require": {
          "MethodDefinition": true,
          "ClassDeclaration": true
        }
      }],
      "jsdoc/require-param": "error",
      "jsdoc/require-returns": "off"
    }
  }
];
