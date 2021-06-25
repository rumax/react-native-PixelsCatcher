/* eslint-disable max-len */
/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
import * as fs from 'fs';
import { compare } from 'odiff-bin';

export default async (actual: any, expected: any, diffFile: any): Promise<number> => {
  if (!actual || !fs.existsSync(actual)) {
    throw new Error(`Actual file is required, cannot get [${actual}] file`);
  }
  if (!expected || !fs.existsSync(expected)) {
    throw new Error(`Expected file is required, cannot get [${expected}] file`);
  }

  const options: any = {
    diffColor: 'red',
    outputDiffMask: true,
    failOnLayoutDiff: false,
  };

  const result = await compare(
    actual,
    expected,
    diffFile,
    options,
  );

  if (result.match) {
    return 0;
  }

  if (result.reason === 'layout-diff') {
    return -1;
  }

  return result.diffCount;
};
