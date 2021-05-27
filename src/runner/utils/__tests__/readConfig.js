import fs from 'fs';

import readConfig from '../readConfig';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}));

process.exit = jest.fn();
process.cwd = jest.fn(() => 'path_to_file');

describe('readConfig', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('read config from package.json', () => {
    const rawConfig = '{"PixelsCatcher":{"android":{"_content":"platform '
      + 'config content from package.json"}}}';

    fs.existsSync.mockImplementationOnce(() => true);
    fs.readFileSync.mockImplementationOnce(() => rawConfig);

    const config = readConfig();

    expect(config).toMatchSnapshot();
  });

  it('read config from pixels-catcher.json', () => {
    // package.json mock
    fs.existsSync.mockImplementationOnce(() => true);
    fs.readFileSync.mockImplementationOnce(() => '{}');
    // pixels-catcher.json mock
    const rawConfig = '{"ios":{"_content":"platform config content from '
      + 'pixels-catcher.json"}}';
    fs.existsSync.mockImplementationOnce(() => true);
    fs.readFileSync.mockImplementationOnce(() => rawConfig);

    const config = readConfig();

    expect(config).toMatchSnapshot();
  });
});
