/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
const childProcess = require('child_process');

const log = require('./log');

const TAG = 'PIXELS_CATCHER::UTIL_EXEC';

module.exports = function exec(cmd: string): string {
  let result = '';

  try {
    result = childProcess.execSync(cmd).toString();
  } catch (err) {
    log.e(TAG, `Failed to execute [${cmd}], error: [${err.message}]`, err);
  }

  return result;
};
