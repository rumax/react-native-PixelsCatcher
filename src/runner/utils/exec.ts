/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
import * as childProcess from 'child_process';

import log from './log';

const TAG = 'PIXELS_CATCHER::UTIL_EXEC';

export default function exec(cmd: string): string {
  let result = '';

  try {
    result = childProcess.execSync(cmd).toString();
  } catch (err) {
    log.e(TAG, `Failed to execute [${cmd}], error: [${err instanceof Error ? err.message : 'Unknown error'}]`, err);
  }

  return result;
}
