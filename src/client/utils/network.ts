/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
import { Platform } from 'react-native';

let baseUrl = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://127.0.0.1:3000',
});

type TestCaseType = {
  name: string,
  failure?: string,
  isSkipped?: boolean,
  time: number,
  renderTime?: number,
};

const fetchRequest = async (url: string, body: Object): Promise<unknown> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response;
};


export default {

  setBaseUrl(url: string) {
    baseUrl = url;
  },


  initTests: async (): Promise<void> => {
    await fetchRequest(`${baseUrl}/initTests`, {});
  },


  postBase64: async (body: Object): Promise<unknown> => {
    const response = await fetchRequest(`${baseUrl}/base64`, body);
    return response;
  },


  serverLog: async (body: Object): Promise<void> => {
    await fetchRequest(`${baseUrl}/log`, body);
  },


  reportTest: async (testCase: TestCaseType): Promise<void> => {
    await fetchRequest(`${baseUrl}/reportTest`, testCase);
  },


  endOfTests: async (body: Object): Promise<void> => {
    await fetchRequest(`${baseUrl}/endOfTests`, body);
  },
};
