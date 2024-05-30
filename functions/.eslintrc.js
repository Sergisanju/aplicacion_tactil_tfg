module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "quotes": ["error", "double"],
    "max-len": ["error", { code: 80 }],
    "indent": ["error", 2],
    "comma-dangle": ["error", "always-multiline"],
    "object-curly-spacing": ["error", "always"],
  },
};
