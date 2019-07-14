/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
/* global requestAnimationFrame */
import React, { Component } from 'react';
import { InteractionManager, View } from 'react-native';

import log from './utils/log';

type SnapshotPropsType = { onReady: Function };

const TAG = 'APP::SNAPSHOT';
const ERROR_NO_IMPLEMENTED = 'Not implemented. Should be implemented by actual snapshot';

export default class Snapshot extends Component<SnapshotPropsType, void> {
  // Should be implemented by actual snapshot
  static snapshotName: string = '';


  componentDidMount() {
    log.v(TAG, 'Awaiting interaction');
    const startTime = (new Date()).getTime();
    InteractionManager.runAfterInteractions(() => {
      const time = (new Date()).getTime() - startTime;
      log.v(TAG, `Interaction completed in ${time} milliseconds`);
      requestAnimationFrame(() => {
        this.props.onReady();
      });
    });
  }


  renderContent() {
    log.e(TAG, ERROR_NO_IMPLEMENTED);
    throw new Error(ERROR_NO_IMPLEMENTED);
  }


  render() {
    return (
      <View style={{ flex: 1 }} collapsable={false}>
        {this.renderContent()}
      </View>
    );
  }
}
