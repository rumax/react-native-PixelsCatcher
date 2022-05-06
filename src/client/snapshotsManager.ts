/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
import type Snapshot from './Snapshot';
import log from './utils/log';
import network from './utils/network';

const snapshots: Array<typeof Snapshot> = [];
const TAG = 'PIXELS_CATCHER::APP::SNAPSHOTS_MANAGER';


export function registerSnapshot(Component: typeof Snapshot): void {
  log.i(TAG, `Registering snapshot [${Component.snapshotName}]`);
  snapshots.push(Component);
  network.registerTest(Component.snapshotName);
}


export function getNextSnapshot(): typeof Snapshot | undefined {
  const NextSnapshot = snapshots.shift();
  return NextSnapshot;
}
