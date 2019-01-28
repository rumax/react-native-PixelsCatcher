const childProcess = require('child_process');

const log = require('./log');

const TAG = 'PIXELS_CATCHER::UTIL_EXEC';

module.exports = function exec(cmd) {
  let result = '';

  try {
    result = childProcess.execSync(cmd).toString();
  } catch (err) {
    log.e(TAG, `Failed to execute [${cmd}], error: [${err.message}]`, err);
  }

  return result;
};
