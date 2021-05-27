/* @flow */
// eslint-disable-next-line no-use-before-define
import React from 'react';
import { View, Text } from 'react-native';

import { registerSnapshot, getNextSnapshot } from '../snapshotsManager';
import Snapshot from '../Snapshot';

jest.mock('../utils/log', () => ({ i: jest.fn() }));

describe('snapshotsManager', () => {
  it('Default snapshots list is empty', () => {
    const nextSnapshot = getNextSnapshot();
    expect(nextSnapshot).toBe(undefined);
  });

  it('register snapshot and get it', () => {
    class SnapshotClass extends Snapshot {
      static snapshotName = 'someComponent';

      renderContent() {
        return (
          <View><Text>Some component</Text></View>
        );
      }
    }
    registerSnapshot(SnapshotClass);

    expect(getNextSnapshot()).toBe(SnapshotClass);
    expect(getNextSnapshot()).toBe(undefined);
  });
});
