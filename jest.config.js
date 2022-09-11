module.exports = {
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|lottie-react-native)'
  ],
  moduleFileExtensions: ['js', 'json', 'ts', 'vue'],
  transform: {
    '.*\\.(js|jsx)$': 'babel-jest',
    '.*\\.(ts|tsx)?$': 'ts-jest',
    '.*\\.(vue)$': 'vue-jest',
    // process `*.js` files with `babel-jest`
    '.*\\.(js)$': 'babel-jest'
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: [
    '<rootDir>/**/tests/unit/*.(test).{js,jsx,ts,tsx}'
  ]
};
