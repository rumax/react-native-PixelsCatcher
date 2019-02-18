/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
function delay(milliseconds: number): Promise<*> {
  return new Promise((resolve: Function) => {
    setTimeout(resolve, milliseconds);
  });
}

module.exports = delay;
