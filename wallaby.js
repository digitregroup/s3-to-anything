module.exports = function() {
  return {
    files: [
      'src/**/*.js',
      'test/**/*.js',
      'test/**/*.json',
      { pattern: 'test/**/*.test.js', ignore: true }
    ],
    tests: [
      'test/**/*.test.js'
    ],
    env: {type: 'node'}
  };
};
