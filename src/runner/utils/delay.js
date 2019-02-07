/* @flow */
function delay(milliseconds: number): Promise<*> {
  return new Promise((resolve: Function) => {
    setTimeout(resolve, milliseconds);
  });
}

module.exports = delay;
