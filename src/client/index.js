/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
import { AppRegistry } from 'react-native';

import log from './utils/log';
import network from './utils/network';

import SnapshotsContainer from './SnapshotsContainer';

export const Snapshot = require('./Snapshot').default;

export const registerSnapshot = require('./snapshotsManager').registerSnapshot;

const TAG = 'PIXELS_CATCHER::APP::SNAPSHOT';

type ConfigType = {
  baseUrl?: string,
  /**
   * Callback to override AppRegistry.registerComponent with custom
   * implementation. Can be used for projects with react-native-navigation
   * @param snapshot Current snapshot
   */
  registerComponent?: (snapshot: typeof SnapshotsContainer) => void,
};

export const runSnapshots = (appName: string, config: ConfigType = {}) => {
  log.i(TAG, `Run snapshots for ${appName}`);
  log.i(TAG, `Config is:\n ${JSON.stringify(config, null, 2)}`);

  if (config.baseUrl) {
    network.setBaseUrl(config.baseUrl);
  }
  if (config.registerComponent) {
    config.registerComponent(SnapshotsContainer);
  } else {
    AppRegistry.registerComponent(appName, () => SnapshotsContainer);
  }
};
