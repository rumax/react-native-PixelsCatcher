/* @flow */
import network from '../network';
import compareToReference from '../compareToReference';

jest.mock('../network', () => ({ postBase64: jest.fn() }));

describe('compareToReference', () => {
  it('Returns failure if HTTP status is not 200', async () => {
    const snapshotName = 'snapshotName';
    const base64 = 'base64 data';

    network.postBase64.mockImplementationOnce(() => ({ status: 404 }));

    const failure = await compareToReference(snapshotName, base64);
    expect(failure).toMatchSnapshot();
  });

  it('Returns failure if result is not OK', async () => {
    const snapshotName = 'snapshotName';
    const base64 = 'base64 data';

    network.postBase64.mockImplementationOnce(() => ({
      status: 200,
      json: async () => ({
        result: 'ERROR',
        info: 'Files mismatch with 1 pixels',
      }),
    }));

    const failure = await compareToReference(snapshotName, base64);
    expect(failure).toMatchSnapshot();
  });

  it('Returns nothing if image matches the reference', async () => {
    const snapshotName = 'snapshotName';
    const base64 = 'base64 data';

    network.postBase64.mockImplementationOnce(() => ({
      status: 200,
      json: async () => ({
        result: 'OK',
        info: { differentPixelsCount: 0 },
      }),
    }));

    const result = await compareToReference(snapshotName, base64);
    expect(result).toBe(undefined);
  });
});
