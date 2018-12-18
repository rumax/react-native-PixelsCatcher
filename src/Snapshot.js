/* @flow */
import React, { Component } from 'react';

import log from './utils/log';

type SnapshotProps = { onReady: Function };

const TAG = 'APP::SNAPSHOT';
const ERROR_NO_IMPLEMENTED = 'Not implemented. Should be implemented by actual snapshot';

export default class Snapshot extends Component<SnapshotProps, void> {
  // Should be implemented by actual snapshot
  static snapshotName = undefined;


  componentDidMount() {
    this.props.onReady();
  }


  renderContent() {
    log.e(TAG, ERROR_NO_IMPLEMENTED);
    throw new Error(ERROR_NO_IMPLEMENTED);
  }


  render() {
    return React.cloneElement(
      this.renderContent(),
      { collapsable: false },
    );
  }
}
