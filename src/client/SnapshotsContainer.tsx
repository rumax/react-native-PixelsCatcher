/**
 * Copyright (c) Maksym Rusynyk 2018 - present
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// eslint-disable-next-line no-use-before-define
import React, { Component } from 'react';
// @ts-ignore
import SaveView from 'react-native-save-view';

import { getNextSnapshot } from './snapshotsManager';
import compareToReference from './utils/compareToReference';
import log from './utils/log';
import network from './utils/network';

const TAG = 'PIXELS_CATCHER::APP::SNAPSHOTS_CONTAINER';

export default class SnapshotsContainer extends Component<any, any> {
  // eslint-disable-next-line react/sort-comp
  _viewRef: any;

  _testStartedAt: number = new Date().getTime();

  _renderStartedAt: number = 0;

  constructor(props: void) {
    super(props);

    const ActiveSnapshot = getNextSnapshot();

    if (!ActiveSnapshot) {
      this._endOfTest();
      log.e(TAG, 'No snapshots registered');
    }

    this.state = { ActiveSnapshot };
    // $FlowFixMe: ignore for bind
    this._onSnapshotReady = this._onSnapshotReady.bind(this);
    // $FlowFixMe: ignore for bind
    this._onRef = this._onRef.bind(this);
  }

  render() {
    const { ActiveSnapshot } = this.state;

    if (!ActiveSnapshot) {
      log.i(TAG, 'No active snapshot');
      return null;
    }

    log.i(TAG, `rendering snapshot [${ActiveSnapshot.snapshotName}]`);

    this._renderStartedAt = new Date().getTime();

    return <ActiveSnapshot ref={this._onRef} onReady={this._onSnapshotReady} />;
  }

  _onRef(ref: any) {
    this._viewRef = ref;
  }

  _onSnapshotReady() {
    const renderTime = new Date().getTime() - this._renderStartedAt;
    log.v(TAG, 'Snapshot ready');

    setTimeout(async () => {
      const ref = this._viewRef;

      if (!ref) {
        const errorMessage = 'Something when wrong, no ref to the component';
        log.e(TAG, errorMessage);
        throw new Error(errorMessage);
      }

      const { ActiveSnapshot } = this.state;
      const name = ActiveSnapshot.snapshotName;

      log.v(TAG, `snapshotName: [${name}]`);

      if (!name) {
        const errorMessage = 'Snapshot should has a proper name';

        log.w(TAG, errorMessage);
        network.reportTest({
          name,
          failure: errorMessage,
          time: this._getTestExecutionTime(),
        });
        this.nextSnapshot();

        return;
      }

      let failure: any;

      try {
        log.v(TAG, '++SaveView.save');
        const base64 = await SaveView.saveToPNGBase64(ref);
        log.v(TAG, `--SaveView.save, size is ${base64.length}`);

        failure = await compareToReference(name, base64);
        if (failure) {
          log.e(TAG, `Snapshot ${name} failed: ${failure}`);
        } else {
          log.i(TAG, `Snapshot ${name} passed`);
        }
      } catch (err) {
        failure = `Failed to save view: ${err.message}`;
        log.e(TAG, failure);
      }

      network.reportTest({
        name,
        failure,
        time: this._getTestExecutionTime(),
        renderTime,
      });

      this.nextSnapshot();
    }, 50);
  }

  _getTestExecutionTime(): number {
    return new Date().getTime() - this._testStartedAt;
  }

  nextSnapshot() {
    log.v(TAG, 'Trying to gen next snapshot');
    const nextSnapshot = getNextSnapshot();

    if (nextSnapshot) {
      log.v('Switching to next snapshot');
      this._testStartedAt = new Date().getTime();
      this.setState({ ActiveSnapshot: nextSnapshot });
    } else {
      log.v('No more snapshots left, exit testing');
      this._endOfTest();
    }
  }

  _endOfTest() {
    network.endOfTests({ message: 'All tests completed' });
  }
}
