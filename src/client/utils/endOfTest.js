/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */

import reporter from './reporter';
import network from './network';

const endOfTest = async () => {
  try {
    await network.endOfTests({
      message: 'All tests completed',
      results: reporter.getResults(),
    });
  } catch (err) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('ERROR:endOfTest: ', err.message);
    }
  }
};

export default endOfTest;
