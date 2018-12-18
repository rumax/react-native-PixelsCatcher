/* @flow */

type TestResultType = {
  snapshotName: string,
  executionTime: number,
  status: 'PASSED' | 'FAILED',
  message?: string,
};

const results = [];


const report = (testResult: TestResultType): void => {
  results.push(testResult);
};


const getResults = (): Array<TestResultType> => results;


export default { report, getResults };
