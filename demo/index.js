/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import AppWithNavigation from './AppWithNavigation';
import {name as appName} from './app.json';

const snapshots = true;
const checkNavigation = false

if (snapshots) {
  require('./indexSnapshot');
} else if (checkNavigation) {
  AppRegistry.registerComponent(appName, () => AppWithNavigation);
} else {
  AppRegistry.registerComponent(appName, () => App);
}
