/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
import { AppRegistry } from 'react-native';

import log from './utils/log';

import SnapshotsContainer from './SnapshotsContainer';

export const Snapshot = require('./Snapshot').default;

export const registerSnapshot = require('./snapshotsManager').registerSnapshot;

const TAG = 'APP::SNAPSHOT';

export const runSnapshots = (appName: string) => {
  log.i(TAG, `Run snapshots for ${appName}`);
  AppRegistry.registerComponent(appName, () => SnapshotsContainer);
};
