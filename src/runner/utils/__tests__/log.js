/* @flow */
import log from '../log';

global.console.log = jest.fn();

describe('logging', () => {
  const consoleLog = global.console.log;
  const logAll = () => {
    log.v('v');
    log.d('d');
    log.i('i');
    log.w('w');
    log.e('e');
  };

  afterEach(() => {
    log.setLevel('v');
  });

  it('Default logs i, w and e', () => {
    logAll();
    expect(consoleLog.mock.calls).toMatchSnapshot();
  });

  it('Allows to log including v', () => {
    log.setLevel('v');
    logAll();
    expect(consoleLog.mock.calls).toMatchSnapshot();
  });

  it('Allows to log including d', () => {
    log.setLevel('d');
    logAll();
    expect(consoleLog.mock.calls).toMatchSnapshot();
  });

  it('Allows to log including i', () => {
    log.setLevel('i');
    logAll();
    expect(consoleLog.mock.calls).toMatchSnapshot();
  });

  it('Allows to log including w', () => {
    log.setLevel('w');
    logAll();
    expect(consoleLog.mock.calls).toMatchSnapshot();
  });

  it('Allows to log including e', () => {
    log.setLevel('e');
    logAll();
    expect(consoleLog.mock.calls).toMatchSnapshot();
  });
});
