/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
import * as fs from 'fs';
import { PNG } from 'pngjs';
import * as pixelmatch from 'pixelmatch';

export default (actual: any, expected: any, diffFile: any): number => {
  if (!actual || !fs.existsSync(actual)) {
    throw new Error(`Actual file is required, cannot get [${actual}] file`);
  }
  if (!expected || !fs.existsSync(expected)) {
    throw new Error(`Expected file is required, cannot get [${expected}] file`);
  }

  const imageActual = PNG.sync.read(fs.readFileSync(actual));
  const imageExpected = PNG.sync.read(fs.readFileSync(expected));

  if (imageActual.width !== imageExpected.width) {
    throw new Error(`Width mismatch: expected ${imageExpected.width}, actual: ${imageActual.width}`);
  }

  if (imageActual.height !== imageExpected.height) {
    throw new Error(`Height mismatch: expected ${imageExpected.height}, actual: ${imageActual.height}`);
  }

  const diff = new PNG({ width: imageExpected.width, height: imageExpected.height });

  const differentPixelsCount = pixelmatch(
    imageActual.data,
    imageExpected.data,
    diff.data,
    imageActual.width,
    imageActual.height,
    { threshold: 0.1 },
  );

  if (diffFile) {
    diff.pack().pipe(fs.createWriteStream(diffFile));
  }

  return differentPixelsCount;
};
