/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
import exec from './exec';

function isCommand(cmd: string): boolean {
  const out = exec(`whereis ${cmd}`);

  return Boolean(out.trim());
}

export default isCommand;
