/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

const timeToSec = (ms: number): number => {
  const sec = ms / 1000;
  return Math.round(sec * 1000) / 1000;
};

export default timeToSec;
