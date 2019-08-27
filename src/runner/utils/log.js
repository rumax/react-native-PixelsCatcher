/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
const TAG = 'PIXELS_CATCHER::UTIL_LOG';
const logLevels = {
  v: 4,
  d: 3,
  i: 2,
  w: 1,
  e: 0,
};
let activeLevel = logLevels.i;

module.exports = {
  v(tag: string, ...args: any) {
    if (activeLevel >= logLevels.v) {
      global.console.log(`${tag}:`, ...args);
    }
  },

  d: (tag: string, ...args: any) => {
    if (activeLevel >= logLevels.d) {
      global.console.log(`${tag}:`, ...args);
    }
  },

  i: (tag: string, ...args: any) => {
    if (activeLevel >= logLevels.i) {
      global.console.log(`${tag}:`, ...args);
    }
  },

  w: (tag: string, ...args: any) => {
    if (activeLevel >= logLevels.w) {
      global.console.log(`${tag} WARNING:`, ...args);
    }
  },

  e: (tag: string, ...args: any) => {
    if (activeLevel >= logLevels.e) {
      global.console.log(`${tag} ERROR:`, ...args);
    }
  },

  setLevel(level?: string = 'i') {
    let nextLevel = logLevels[level];
    if (nextLevel === undefined) {
      global.console.log(`${TAG} WARNING:`, `Invalid level [${level}]. Supported levels: ${Object.keys(logLevels).join(', ')}`);
      nextLevel = logLevels.i;
    }
    activeLevel = nextLevel;
  },
};
