/* @flow */
import log from './utils/log';

const snapshots = [];
const TAG = 'APP::SNAPSHOTS_MANAGER';


export function registerSnapshot(component: any) {
  log.i(TAG, `Registering snapshot [${component.snapshotName}]`);
  snapshots.push(component);
}


export function getNextSnapshot(): any {
  const nextSnapshot = snapshots.shift();

  if (nextSnapshot) {
    log.i(TAG, `Next snapshot is [${nextSnapshot.snapshotName}]`);
  } else {
    log.i(TAG, 'No more snapshots left');
  }

  return nextSnapshot;
}
