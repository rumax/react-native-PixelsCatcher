/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
import network from './network';

const consoleLog = global.console && global.console.log
  // eslint-disable-next-line no-unused-vars
  ? global.console.log : (...args: any) => {};

type LogLevelType = 'v' | 'd' | 'i' | 'w' | 'e';

const serverLog = async (logLevel: LogLevelType, tag: string, ...args: any) => {
  try {
    network.serverLog({
      logLevel,
      tag,
      args,
    });
  } catch (err) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('ERROR:serverLog: ', err.message);
    }
  }
};

const log = {
  v: (tag: string, ...args: any) => {
    global.requestAnimationFrame(() => {
      consoleLog(tag, ...args);
      serverLog('v', tag, ...args);
    });
  },

  d: (tag: string, ...args: any) => {
    global.requestAnimationFrame(() => {
      consoleLog(tag, ...args);
      serverLog('d', tag, ...args);
    });
  },

  i: (tag: string, ...args: any) => {
    global.requestAnimationFrame(() => {
      consoleLog(tag, ...args);
      serverLog('i', tag, ...args);
    });
  },

  w: (tag: string, ...args: any) => {
    global.requestAnimationFrame(() => {
      consoleLog(`${tag} WARNING:`, ...args);
      serverLog('w', `${tag} WARNING:`, ...args);
    });
  },

  e: (tag: string, ...args: any) => {
    global.requestAnimationFrame(() => {
      consoleLog(`${tag} ERROR:`, ...args);
      serverLog('e', `${tag} ERROR:`, ...args);
    });
  },
};

export default log;
