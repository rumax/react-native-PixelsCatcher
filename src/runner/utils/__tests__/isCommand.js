/* @flow */
import isCommand from '../isCommand';
import exec from '../exec';

jest.mock('../exec', () => jest.fn());

describe('isCommand', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Returns true if command exists', () => {
    (exec: any).mockReturnValueOnce('/bin/ls');

    const exists = isCommand('ls');

    expect(exec).toHaveBeenCalledWith('whereis ls');
    expect(exists).toBe(true);
  });

  it('Returns false if command does not exists', () => {
    (exec: any).mockReturnValueOnce('');

    const exists = isCommand('sl');

    expect(exec).toHaveBeenCalledWith('whereis sl');
    expect(exists).toBe(false);
  });
});
