/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
function delay(milliseconds: number): Promise<unknown> {
  return new Promise((resolve: Function) => {
    setTimeout(resolve, milliseconds);
  });
}

export default delay;
