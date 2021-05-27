import getDevice from '../deviceProvider';

jest.mock('../AndroidEmulator', () => (class {
  constructor(name) {
    this._name = 'AndroidEmulator';
    this.deviceName = name;
  }
}));
jest.mock('../AndroidDevice', () => (class {
  constructor(name) {
    this._name = 'AndroidDevice';
    this.deviceName = name;
  }
}));
jest.mock('../IosSimulator', () => (class {
  constructor(name) {
    this._name = 'IosSimulator';
    this.deviceName = name;
  }
}));

describe('deviceProvider', () => {
  it('provide Android Emulator', () => {
    const device = getDevice('test', 'android');
    expect(device).toMatchSnapshot();
  });

  it('provide AndroidDevice', () => {
    const device = getDevice('test', 'android', true);
    expect(device).toMatchSnapshot();
  });

  it('provide iOS simulator', () => {
    const device = getDevice('test', 'ios');
    expect(device).toMatchSnapshot();
  });

  it('provide iOS device throws error (not implemented)', () => {
    let error;
    let device;
    try {
      device = getDevice('test', 'ios', true);
    } catch (err) {
      error = err;
    }

    expect(device).toBe(undefined);
    expect(error).toMatchSnapshot();
  });
});
