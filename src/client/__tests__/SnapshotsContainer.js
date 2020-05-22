/* @flow */
import React from 'react';
import renderer from 'react-test-renderer';

import SnapshotsContainer from '../SnapshotsContainer';
import network from '../utils/network';
import log from '../utils/log';
import { getNextSnapshot } from '../snapshotsManager';

jest.mock('../utils/log', () => ({
  i: jest.fn(),
  v: jest.fn(),
  w: jest.fn(),
  e: jest.fn(),
}));
jest.mock('../utils/network', () => ({ endOfTests: jest.fn() }));
jest.mock('../snapshotsManager', () => ({ getNextSnapshot: jest.fn() }));

describe('SnapshotsContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Renders empty view and reports it to the server if no snapshots are registered', () => {
    const tree = renderer.create(<SnapshotsContainer />);

    expect(tree).toMatchSnapshot();
    expect(network.endOfTests).toHaveBeenCalledTimes(1);
    expect(log.e).toMatchSnapshot('loggin error');
  });

  it('Renders registered snapshot', () => {
    (getNextSnapshot: any).mockImplementationOnce(() => 'SomeSnapshot');
    const tree = renderer.create(<SnapshotsContainer />);

    expect(tree).toMatchSnapshot();
    expect(network.endOfTests).toHaveBeenCalledTimes(0);
    expect(log.v).toMatchSnapshot('render snapshot reported');
  });
});
