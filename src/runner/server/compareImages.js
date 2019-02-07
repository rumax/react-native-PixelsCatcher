/* @flow */
const fs = require('fs');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

module.exports = (actual: any, expected: any, diffFile: any): number => {
  if (!actual || !fs.existsSync(actual)) {
    throw new Error(`Actual file is required, cannot get [${actual}] file`);
  }
  if (!expected || !fs.existsSync(expected)) {
    throw new Error(`Expected file is required, cannot get [${expected}] file`);
  }

  const imageActual = PNG.sync.read(fs.readFileSync(actual));
  const imageExpected = PNG.sync.read(fs.readFileSync(expected));

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
