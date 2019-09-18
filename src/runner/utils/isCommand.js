/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
const exec = require('./exec');

function isCommand(cmd: string) {
  const out = exec(`whereis ${cmd}`);

  return Boolean(out.trim());
}

module.exports = isCommand;
