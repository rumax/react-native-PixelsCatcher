/* @flow */
import React from 'react';
import { View, Text, Platform } from 'react-native';
import {
  registerSnapshot,
  runSnapshots,
  Snapshot,
} from 'pixels-catcher';

import App from './src/App';
import { name as appName } from './app.json';

const baseUrl = Platform.select({ // Put real IP of your server to run on real device
  android: 'http://10.0.2.2:3000',
  ios: 'http://127.0.0.1:3000',
});

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

runSnapshots(appName, { baseUrl });
