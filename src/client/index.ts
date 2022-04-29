/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import { AppRegistry } from 'react-native';

import log from './utils/log';
import network from './utils/network';

import SnapshotsContainer from './SnapshotsContainer';

export const Snapshot = require('./Snapshot').default;

export const { registerSnapshot } = require('./snapshotsManager');

const TAG = 'PIXELS_CATCHER::APP::SNAPSHOT';

export type GetRootElementType = (element: React.ComponentType<any>) =>
  React.ComponentType<any>

interface ConfigType {
  baseUrl?: string;

  /**
   * Callback to override AppRegistry.registerComponent with custom
   * implementation. Can be used for projects with react-native-navigation
   * @param snapshot Current snapshot
   */
  // eslint-disable-next-line no-unused-vars
  registerComponent?: (snapshot: typeof SnapshotsContainer) => void;

  /**
   * Root element. Allows to wrap the SnapshotsContainer, which could be
   * useful to implement some providers, for example for react navigation.
   * Example:
   *
   * import { NavigationContainer } from '@react-navigation/native';
   * import { createStackNavigator } from '@react-navigation/stack';
   *
   * const Stack = createStackNavigator();
   *
   * function getRootElement(SnapshotsContainer) {
   *  const RootElement = ({children}) => (
   *     <NavigationContainer>
   *       <Stack.Navigator>
   *         <Stack.Screen
   *           name="SnapshotsContainer"
   *           options={{ headerShown: false, title: '' }}
   *           component={SnapshotsContainer} />
   *       </Stack.Navigator>
   *     </NavigationContainer>
   *   )
   *   return RootElement;
   * }
   *
   * runSnapshots(appName, { baseUrl, getRootElement });
   */
   getRootElement?: GetRootElementType;
}

export const runSnapshots = (appName: string, config: ConfigType = {}) => {
  log.i(TAG, `Run snapshots for ${appName}`);
  log.i(TAG, `Config is:\n ${JSON.stringify(config, null, 2)}`);

  if (config.baseUrl) {
    network.setBaseUrl(config.baseUrl);
  }

  if (config.registerComponent) {
    config.registerComponent(SnapshotsContainer);
    return;
  }

  if (config.getRootElement) {
    const RootElement = config.getRootElement(SnapshotsContainer);
    AppRegistry.registerComponent(appName, () => RootElement);
    return;
  }

  AppRegistry.registerComponent(appName, () => SnapshotsContainer);
};
