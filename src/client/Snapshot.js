/**
* Copyright (c) Maksym Rusynyk 2018 - present
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/* @flow */
/* global requestAnimationFrame */
import React, { Component } from 'react';
import { InteractionManager } from 'react-native';

import log from './utils/log';

type SnapshotPropsType = { onReady: Function };

const TAG = 'APP::SNAPSHOT';
const ERROR_NO_IMPLEMENTED = 'Not implemented. Should be implemented by actual snapshot';
// React does optimisation and some views can be removed if they are redundant
const PROPS_TO_KEEP_VIEW: any = { collapsable: false };

export default class Snapshot extends Component<SnapshotPropsType, void> {
  // Should be implemented by actual snapshot
  static snapshotName: string = '';


  componentDidMount() {
    log.e(TAG, 'Awaiting interaction');
    const startTime = (new Date()).getTime();
    InteractionManager.runAfterInteractions(() => {
      const time = (new Date()).getTime() - startTime;
      log.e(TAG, `Interaction completed in ${time} milliseconds`);
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
    return React.cloneElement(
      this.renderContent(),
      PROPS_TO_KEEP_VIEW,
    );
  }
}
