/* @flow */

const timeToSec = (ms: number): number => {
  const sec = ms / 1000;
  return Math.round(sec * 1000) / 1000;
};

module.exports = timeToSec;
