/** @format */

import { AppRegistry } from 'react-native';

import App from './App';
import { name as appName } from './app.json';

const snapshots = false;

if (snapshots) {
   require('./indexSnapshot');
} else {
  AppRegistry.registerComponent(appName, () => App);
}
