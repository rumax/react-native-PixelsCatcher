/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
import network from './network';

// Throws exception
const compareToReference = async (snapshotName: string, base64: string): Promise<boolean> => {
  const response = await network.postBase64({
    base64,
    fileName: `${snapshotName}.png`,
  });

  if (response.status !== 200) {
    throw new Error(`Invalid status ${response.status}`);
  }
  const responseJSON = await response.json();

  if (responseJSON.result !== 'OK') {
    throw new Error(`Files mistmatch with ${responseJSON.info.differentPixelsCount} pixels`);
  }

  return true;
};

export default compareToReference;
