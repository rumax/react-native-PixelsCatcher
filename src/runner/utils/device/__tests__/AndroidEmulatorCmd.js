/* @flow */

describe('AndroidEmulatorCmd', () => {
  beforeEach(() => {
    process.env.ANDROID_EMULATOR = '';
    jest.resetModules();
  });

  it('returns command provided via ANDROID_EMULATOR', () => {
    process.env.ANDROID_EMULATOR = 'cmdFrom_ANDROID_EMULATOR';
    const emulatorCmd = require('../AndroidEmulatorCmd').default;

    expect(emulatorCmd).toBe(process.env.ANDROID_EMULATOR);
  });

  it('returns command available in PATH', () => {
    process.env.ANDROID_EMULATOR = '';
    jest.mock('../../isCommand', () => () => true);
    const emulatorCmd = require('../AndroidEmulatorCmd').default;

    expect(emulatorCmd).toBe('emulator');
  });

  it('gets command from /Library/Android/sdk/emulator/emulator on mac', () => {
    process.env.ANDROID_EMULATOR = '';
    jest.mock('../../isCommand', () => () => false);
    jest.mock('../../exec', () => () => 'Darwin');
    const emulatorCmd = require('../AndroidEmulatorCmd').default;

    expect(emulatorCmd
      .indexOf('Library/Android/sdk/emulator/emulator') > 0).toBe(true);
  });
});
