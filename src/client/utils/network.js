/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
/* global: fetch */
import { Platform } from 'react-native';

let baseUrl = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://127.0.0.1:3000',
});

const fetchRequest = async (url: string, body: Object): Promise<*> => {
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


  postBase64: async (body: Object): Promise<*> => {
    const response = await fetchRequest(`${baseUrl}/base64`, body);
    return response;
  },


  serverLog: async (body: Object): Promise<void> => {
    await fetchRequest(`${baseUrl}/log`, body);
  },


  endOfTests: async (body: Object): Promise<void> => {
    await fetchRequest(`${baseUrl}/endOfTests`, body);
  },
};
