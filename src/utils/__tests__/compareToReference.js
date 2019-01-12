/* @flow */
import network from '../network';
import compareToReference from '../compareToReference';

jest.mock('../network', () => ({ postBase64: jest.fn() }));

describe('compareToReference', () => {
  it('Throws exception if HTTP status is not 200', async () => {
    const snapshotName = 'snapshotName';
    const base64 = 'base64 data';
    let exception;

    (network.postBase64: any).mockImplementationOnce(() => ({ status: 404 }));

    try {
      await compareToReference(snapshotName, base64);
    } catch (err) {
      exception = err;
    }

    expect(exception).toMatchSnapshot();
  });

  it('Throws exception if result is not OK', async () => {
    const snapshotName = 'snapshotName';
    const base64 = 'base64 data';
    let exception;

    (network.postBase64: any).mockImplementationOnce(() => ({
      status: 200,
      json: async () => ({
        result: 'ERROR',
        info: { differentPixelsCount: 1 },
      }),
    }));

    try {
      await compareToReference(snapshotName, base64);
    } catch (err) {
      exception = err;
    }

    expect(exception).toMatchSnapshot();
  });

  it('Returns success if image matches the reference', async () => {
    const snapshotName = 'snapshotName';
    const base64 = 'base64 data';

    (network.postBase64: any).mockImplementationOnce(() => ({
      status: 200,
      json: async () => ({
        result: 'OK',
        info: { differentPixelsCount: 0 },
      }),
    }));

    const result = await compareToReference(snapshotName, base64);
    expect(result).toBe(true);
  });
});
