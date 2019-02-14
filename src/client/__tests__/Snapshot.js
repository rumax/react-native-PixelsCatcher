/* @flow */
import React from 'react';
import { View } from 'react-native';
import renderer from 'react-test-renderer';

import Snapshot from '../Snapshot';

jest.mock('../utils/log', () => ({ e: () => {} }));
global.console.error = () => {};


describe('Snapshot component', () => {
  const onReadyMock = jest.fn();

  it('throws exception if renderContent is not implemented', () => {
    let exception;

    try {
      renderer.create(<Snapshot onReady={onReadyMock} />);
    } catch (err) {
      exception = err;
    }

    expect(exception).toMatchSnapshot();
  });

  it('renders snpashot component', () => {
    class SnapshotClass extends Snapshot {
      static snapshotName = 'AppSnapshot';

      renderContent() {
        return (
          <View />
        );
      }
    }

    const tree = renderer.create(<SnapshotClass onReady={onReadyMock} />);

    expect(tree).toMatchSnapshot();
  });
});
