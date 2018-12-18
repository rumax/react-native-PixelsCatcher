const consoleLog = global.console.log;

module.exports = {
  v: (tag, ...args) => {
    consoleLog(`${tag}:`, ...args);
  },

  d: (tag, ...args) => {
    consoleLog(`${tag}:`, ...args);
  },

  i: (tag, ...args) => {
    consoleLog(`${tag}:`, ...args);
  },

  w: (tag, ...args) => {
    consoleLog(`${tag} WARNING:`, ...args);
  },

  e: (tag, ...args) => {
    consoleLog(`${tag} ERROR:`, ...args);
  },
};
