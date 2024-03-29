module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'plugin:vue/base',
    'plugin:vue/essential',
    'plugin:vue/strongly-recommended',
    'plugin:vue/recommended',
    '@vue/airbnb',
    '@vue/typescript',
    'eslint:recommended'
  ],

  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  rules: {
    'max-len': [
      'warn',
      {
        code: 160,
        ignoreTemplateLiterals: true
      }
    ],
    'global-require': 0,
    'no-var': 'off',
    'new-cap': 'off',
    'no-console': 'off',
    'no-undef': 'off',
    'object-curly-spacing': 'off',
    'import/newline-after-import': 'off',
    'comma-dangle': ['error', 'never'],
    'vue/html-closing-bracket-spacing': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/mustache-interpolation-spacing': 'warn',
    'vue/max-attributes-per-line': 'off',
    'vue/attributes-order': 'warn',
    'vue/attribute-hyphenation': 'off',
    // note you must disable the base rule as it can report incorrect errors
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'import/no-named-as-default': 'off',
    'class-methods-use-this': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'lines-between-class-members': 'off',
    'linebreak-style': 0,
    'arrow-parens': ['error', 'as-needed'],
    'object-curly-newline': 'off'
  }
};
