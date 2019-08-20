module.exports = {
  preset: 'react-native',
  collectCoverageFrom: [
    'src/**/*.js',
    'utils/**/*.js',
    'server/**/*.js',
    'cli.js',
    '!demo/**/*',
  ],
  modulePathIgnorePatterns: ['demo']
};
