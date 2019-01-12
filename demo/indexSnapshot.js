/* @flow */
import React from 'react';
import { View, Text } from 'react-native';
import {
  registerSnapshot,
  runSnapshots,
  Snapshot,
} from 'pixels-catcher';

import App from './src/App';
import { name as appName } from './app.json';

registerSnapshot(class SnapshotClass extends Snapshot {
  static snapshotName = 'AppSnapshot';

  renderContent() {
    return (
      <App />
    );
  }
});

registerSnapshot(class SnapshotClass extends Snapshot {
  static snapshotName = 'AppSnapshotWithWrongRefImg';

  renderContent() {
    return (
      <App />
    );
  }
});

registerSnapshot(class SnapshotClass extends Snapshot {
  static snapshotName = 'someComponent';

  renderContent() {
    return (
      <View><Text>Some component</Text></View>
    );
  }
});

runSnapshots(appName);
