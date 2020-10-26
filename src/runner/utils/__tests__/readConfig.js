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
    const rawConfig = '{"PixelsCatcher":{"android":{"_content":"platform '
      + 'config content from package.json"}}}';

    (fs.existsSync: any).mockImplementationOnce(() => true);
    (fs.readFileSync: any).mockImplementationOnce(() => rawConfig);

    const config = readConfig();

    expect(config).toMatchSnapshot();
  });

  it('read config from pixels-catcher.json', () => {
    // package.json mock
    (fs.existsSync: any).mockImplementationOnce(() => true);
    (fs.readFileSync: any).mockImplementationOnce(() => '{}');
    // pixels-catcher.json mock
    const rawConfig = '{"ios":{"_content":"platform config content from '
      + 'pixels-catcher.json"}}';
    (fs.existsSync: any).mockImplementationOnce(() => true);
    (fs.readFileSync: any).mockImplementationOnce(() => rawConfig);

    const config = readConfig();

    expect(config).toMatchSnapshot();
  });
});
