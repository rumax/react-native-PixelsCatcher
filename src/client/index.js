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
