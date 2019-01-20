jest.mock('child_process', () => ({ spawn: jest.fn() }));
jest.mock('../exec', () => jest.fn());
jest.mock('../delay', () => jest.fn());
jest.mock('../log', () => ({
  v: jest.fn(),
  d: jest.fn(),
  e: jest.fn(),
}));

const { spawn } = require('child_process');

const AndroidEmulator = require('../AndroidEmulator');
const exec = require('../exec');
const delay = require('../delay');

describe('AndroidEmulator', () => {
  const name = 'emulator_name';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('initialise emulator', () => {
    exec.mockImplementationOnce(() => 'avd devices');

    const emularor = new AndroidEmulator(name);
    expect(emularor).toMatchSnapshot();
  });

  it('start emulator when it is not available should throw error', async () => {
    exec.mockImplementation(() => 'avd devices');

    const emularor = new AndroidEmulator(name);
    let exception;

    try {
      await emularor.start();
    } catch (err) {
      exception = err;
    }

    expect(exception).toMatchSnapshot();
  });

  it('start emulator when it is available but not started throws error if not started', async () => {
    exec.mockImplementation(() => `avd devices including ${name}`);
    const spawnMock = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn(),
    };
    spawn.mockImplementationOnce(() => spawnMock);

    const emularor = new AndroidEmulator(name);

    let exception;

    try {
      await emularor.start();
    } catch (err) {
      exception = err;
    }

    expect(exception).toMatchSnapshot();
  });

  it('start emulator when it is available but not started', async () => {
    exec.mockImplementation(() => `avd devices including ${name}`);
    const spawnMock = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn(),
    };
    spawn.mockImplementationOnce(() => spawnMock);

    const emularor = new AndroidEmulator(name);

    const startPromise = emularor.start();

    const dataCallback = spawnMock.stdout.on.mock.calls[0][1];
    dataCallback('boot completed');

    await startPromise;
  });

  it('start emulator when it is available and already started should stop it before starting', async () => {
    exec.mockImplementation((cmd) => {
      if (cmd === 'emulator -avd -list-avds') {
        return `avd devices including ${name}`;
      }
      return 'List of devices attached\nemulator-5554 device';
    });
    const spawnMock = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn(),
    };
    spawn.mockImplementationOnce(() => spawnMock);
    delay.mockImplementation(() => {
      const spawnMockCalls = spawnMock.stdout.on.mock.calls;
      if (spawnMockCalls && spawnMockCalls[0] && spawnMockCalls[0][1]) {
        const dataCallback = spawnMock.stdout.on.mock.calls[0][1];
        dataCallback('boot completed');
      }
    });

    const emularor = new AndroidEmulator(name);

    const startPromise = emularor.start();

    await startPromise;
  });
});
