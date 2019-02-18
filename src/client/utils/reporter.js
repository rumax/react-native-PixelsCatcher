/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */

type TestResultType = {
  snapshotName: string,
  executionTime: number,
  status: 'PASSED' | 'FAILED',
  message?: string,
};

const results = [];


const report = (testResult: TestResultType) => {
  results.push(testResult);
};


const getResults = (): Array<TestResultType> => results;


export default { report, getResults };
