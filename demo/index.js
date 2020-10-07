/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

const snapshots = true;

if (snapshots) {
  require('./indexSnapshot');
} else {
  AppRegistry.registerComponent(appName, () => App);
}
