/* @flow */
const fs = require('fs');

const readConfig = require('../readConfig');

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));
jest.mock('path', () => ({
  join: jest.fn((...args: any) => args.join('/')),
}));

(process: any).exit = jest.fn();
(process: any).cwd = jest.fn(() => 'path_to_file');

describe('readConfig', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('read config from package.json', () => {
    const rawConfig = '{"PixelsCatcher":{"platform":{"_content":"platform '
      + 'config content from package.json"}}}';

    fs.existsSync.mockImplementationOnce(() => true);
    fs.readFileSync.mockImplementationOnce(() => rawConfig);

    const config = readConfig('platform');

    expect(config).toMatchSnapshot();
  });

  it('read config from pixels-catcher.json', () => {
    // package.json mock
    fs.existsSync.mockImplementationOnce(() => true);
    fs.readFileSync.mockImplementationOnce(() => '{}');
    // pixels-catcher.json mock
    const rawConfig = '{"platform":{"_content":"platform config content from '
      + 'pixels-catcher.json"}}';
    fs.existsSync.mockImplementationOnce(() => true);
    fs.readFileSync.mockImplementationOnce(() => rawConfig);

    const config = readConfig('platform');

    expect(config).toMatchSnapshot();
  });
});
