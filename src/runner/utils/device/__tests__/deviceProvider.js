/* @flow */
jest.mock('../AndroidEmulator', () => (class {
  constructor(name: string) {
    (this: any)._name = 'AndroidEmulator';
    (this: any).deviceName = name;
  }
}));
jest.mock('../AndroidDevice', () => (class {
  constructor(name: string) {
    (this: any)._name = 'AndroidDevice';
    (this: any).deviceName = name;
  }
}));
jest.mock('../IosSimulator', () => (class {
  constructor(name: string) {
    (this: any)._name = 'IosSimulator';
    (this: any).deviceName = name;
  }
}));

const getDevice = require('../deviceProvider');

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
