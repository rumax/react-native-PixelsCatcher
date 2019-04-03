/* @flow */
import React from 'react';
import { AppRegistry, View } from 'react-native';

import { runSnapshots, Snapshot, registerSnapshot } from '../index';
import network from '../utils/network';

jest.mock('AppRegistry', () => ({ registerComponent: jest.fn() }));
jest.mock('../utils/network', () => ({ setBaseUrl: jest.fn() }));
jest.mock('../SnapshotsContainer', () => 'SnapshotsContainer');
jest.mock('../utils/log', () => ({ i: jest.fn() }));
jest.mock('../Snapshot', () => ({ default: 'Snapshot' }));
jest.mock('../snapshotsManager', () => ({ registerSnapshot: jest.fn() }));

describe('Snapshot component', () => {
  const appName = 'appName';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('provides Snapshot component', () => {
    expect(Snapshot).toBe('Snapshot');
  });

  it('allows to register snapshot', () => {
    registerSnapshot(<View />);
    expect(registerSnapshot).toHaveBeenCalledTimes(1);
  });

  it('register component and start snapshots', () => {
    runSnapshots(appName);

    expect(AppRegistry.registerComponent).toHaveBeenCalledTimes(1);
    expect((AppRegistry.registerComponent: any).mock.calls)
      .toMatchSnapshot('registerComponent');
    expect((AppRegistry.registerComponent: any).mock.calls[0][1]())
      .toBe('SnapshotsContainer');
    expect(network.setBaseUrl).toHaveBeenCalledTimes(0);
  });

  it('register component with custom IP and start snapshots', () => {
    const baseUrl = 'baseUrl';
    runSnapshots(appName, { baseUrl });

    expect(AppRegistry.registerComponent).toHaveBeenCalledTimes(1);
    expect((AppRegistry.registerComponent: any).mock.calls)
      .toMatchSnapshot('registerComponent');
    expect((AppRegistry.registerComponent: any).mock.calls[0][1]())
      .toBe('SnapshotsContainer');
    expect(network.setBaseUrl).toHaveBeenCalledTimes(1);
    expect(network.setBaseUrl).toHaveBeenCalledWith(baseUrl);
  });
});
