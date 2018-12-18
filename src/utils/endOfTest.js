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
