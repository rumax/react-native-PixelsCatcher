jest.mock('child_process', () => ({ spawn: jest.fn() }));
jest.mock('../exec', () => jest.fn());
jest.mock('../delay', () => jest.fn());
jest.mock('../log', () => ({ v: jest.fn(), d: jest.fn() }));

const AndroidEmulator = require('../AndroidEmulator');
const exec = require('../exec');

describe('AndroidEmulator', () => {
  const name = 'emulator_name';

  it('initialise emulator', async () => {
    exec.mockImplementationOnce(() => 'avd devices');

    const emularor = new AndroidEmulator(name);
    expect(emularor).toMatchSnapshot();
  });
});
