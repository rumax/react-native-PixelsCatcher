/**
 * Copyright (c) Maksym Rusynyk 2018 - present
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// eslint-disable-next-line no-use-before-define
import React, { Component } from 'react';
import { View, Text } from 'react-native';
// @ts-ignore
import SaveView from 'react-native-save-view';

import { getNextSnapshot } from './snapshotsManager';
import compareToReference from './utils/compareToReference';
import log from './utils/log';
import network from './utils/network';

import Snapshot from './Snapshot';

const TAG = 'PIXELS_CATCHER::APP::SNAPSHOTS_CONTAINER';

type State = {
  isReady: boolean,
  ActiveSnapshot: typeof Snapshot | null,
};

export default class SnapshotsContainer extends Component<Record<never, never>, State> {
  _viewRef: any;

  _testStartedAt: number = new Date().getTime();

  _renderStartedAt: number = 0;

  constructor(props: Record<never, never>) {
    super(props);

    this.state = {
      ActiveSnapshot: null,
      isReady: false,
    };
  }

  componentDidMount() {
    requestAnimationFrame(() => {
      this._startTesting();
    });
  }

  render() {
    const { isReady, ActiveSnapshot } = this.state;

    if (!isReady) {
      return (
        <View>
          <Text>Initializing tests</Text>
        </View>
      );
    }

    if (!ActiveSnapshot) {
      log.i(TAG, 'No active snapshot');
      return null;
    }

    log.i(TAG, `rendering snapshot [${ActiveSnapshot.snapshotName}]`);

    this._renderStartedAt = new Date().getTime();

    return <ActiveSnapshot ref={this._onRef} onReady={this._onSnapshotReady} />;
  }

  _startTesting = async () => {
    await network.initTests();
    const ActiveSnapshot = getNextSnapshot();
    if (!ActiveSnapshot) {
      this._endOfTest();
      log.e(TAG, 'No snapshots registered');
      this._endOfTest();
      return;
    }
    log.v(TAG, 'Start testing');
    this.setState({
      ActiveSnapshot,
      isReady: true,
    });
  };

  _onRef = (ref: any) => {
    this._viewRef = ref;
  };

  _onSnapshotReady = () => {
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
      const name = ActiveSnapshot?.snapshotName;

      log.v(TAG, `snapshotName: [${name || '-'}]`);

      if (!name) {
        const errorMessage = 'Snapshot should has a proper name';

        log.w(TAG, errorMessage);
        network.reportTest({
          name: '-',
          failure: errorMessage,
          time: this._getTestExecutionTime(),
        });
        this._nextSnapshot();

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
      } catch (err: unknown) {
        failure = `Failed to save view: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`;
        log.e(TAG, failure);
      }

      log.v(TAG, `Reporting [${name}], failure: [${failure}]`);
      try {
        await network.reportTest({
          name,
          failure,
          time: this._getTestExecutionTime(),
          renderTime,
        });
      } catch (err) {
        log.e(TAG, 'Failed to report test', err);
      }
      this._nextSnapshot();
    }, 50);
  };

  _getTestExecutionTime(): number {
    const time = new Date().getTime() - this._testStartedAt;
    log.v(TAG, `Execution time: ${time}`);
    return time;
  }

  _nextSnapshot() {
    log.v(TAG, 'Trying to get next snapshot');
    const NextSnapshot = getNextSnapshot();

    if (!NextSnapshot) {
      log.v('No more snapshots left, exit testing');
      this._endOfTest();
      return;
    }

    log.v(`Switching to next snapshot ${NextSnapshot.snapshotName}`);
    this._testStartedAt = new Date().getTime();
    this.setState({ ActiveSnapshot: NextSnapshot });
  }

  _endOfTest() {
    network.endOfTests({ message: 'All tests completed' });
  }
}
