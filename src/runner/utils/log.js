/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
const consoleLog = global.console.log;

module.exports = {
  v: (tag: string, ...args: any) => {
    consoleLog(`${tag}:`, ...args);
  },

  d: (tag: string, ...args: any) => {
    consoleLog(`${tag}:`, ...args);
  },

  i: (tag: string, ...args: any) => {
    consoleLog(`${tag}:`, ...args);
  },

  w: (tag: string, ...args: any) => {
    consoleLog(`${tag} WARNING:`, ...args);
  },

  e: (tag: string, ...args: any) => {
    consoleLog(`${tag} ERROR:`, ...args);
  },
};
