/* @flow */
const fs = require('fs');
const path = require('path');

const log = require('./utils/log');
const Reporter = require('./utils/Reporter');
const server = require('./server/server');

const TAG = 'PIXELS_CATCHER';

type TestsRunnerParamsType =
{|
  activityName: string,
  appFile: string,
  device: any,
  deviceName: string,
  deviceParams: string,
  isDevMode: boolean,
  locale: string,
  packageName: string,
  platform: string,
  port: number,
  snapshotsPath: string,
  testRunName: string,
  timeout: number,
|};

class TestsRunner {
  _activityName: string;

  _appFile: string;

  _appFileFullPath: string;

  _device: any;

  _deviceName: string;

  _deviceParams: Object;

  _isDevMode: boolean;

  _locale: string;

  _packageName: string;

  _platform: string;

  _port: number;

  _reporter: Reporter;

  _snapshotsPath: string;

  _stopByTimeoutID: TimeoutID | void;

  _timeout: number;


  constructor(params: TestsRunnerParamsType) {
    this._activityName = params.activityName;
    this._appFile = params.appFile;
    this._device = params.device;
    this._deviceName = params.deviceName;
    this._deviceParams = params.deviceParams;
    this._isDevMode = params.isDevMode;
    this._locale = params.locale;
    this._packageName = params.packageName;
    this._platform = params.platform;
    this._port = params.port;
    this._snapshotsPath = params.snapshotsPath;
    this._timeout = params.timeout;

    if (!this._isDevMode) {
      if (!this._appFile) {
        log.e(TAG, 'Valid ap file is required, check config');
        process.exit(-1);
      }

      this._appFileFullPath = path.isAbsolute(this._appFile)
        ? this._appFile : path.join(process.cwd(), this._appFile);

      if (!fs.existsSync(this._appFileFullPath)) {
        log.e(TAG, `Valid app file is required, cannot find [${this._appFile}] file`);
        process.exit(-1);
      }
    }

    this._reporter = new Reporter(params.testRunName, this._snapshotsPath);
  }


  _stopAllTests = async (isTimeout?: boolean) => {
    log.i(TAG, 'Stopping the server and emulator');
    await server.stop();
    await this._device.stop();
    log.i(TAG, 'Server and emulator are stopped');

    if (isTimeout) {
      this._reporter.reportTimeout();
    }

    this._generateReport();

    if (isTimeout || !this._reporter.isPassed()) {
      log.e(TAG, 'Some tests failed, exit with error');
      process.exit(-1);
    } else {
      log.i(TAG, 'No errors found');
    }
  }


  _testingCompleted = async (isTimeout?: boolean) => {
    log.v(TAG, 'Testing Completed');
    if (this._stopByTimeoutID) {
      log.v(TAG, 'Stopping timer');
      clearTimeout(this._stopByTimeoutID);
      this._stopByTimeoutID = undefined;
    }
    if (this._isDevMode) {
      log.v(TAG, 'Dev mode, nothing to do more');
      return;
    }

    // Some delay so that all log calls are received from the app
    const timeout = 5000;
    log.v(TAG, `Stopping all tests in ${timeout / 1000} sec`);
    setTimeout(() => {
      this._stopAllTests(isTimeout);
    }, timeout);
  };


  _generateReport() {
    const jUnitFile = path.join(process.cwd(), 'junit.xml');
    const deviceLogsFile = path.join(
      process.cwd(),
      `${this._platform}_logs.log`,
    );
    this._reporter.deviceLogsToFile(deviceLogsFile);
    this._reporter.toLog();
    this._reporter.tojUnit(jUnitFile);
  }


  _onAppActivity = () => {
    if (this._stopByTimeoutID) {
      clearTimeout(this._stopByTimeoutID);
    }
    this._stopByTimeoutID = setTimeout(() => {
      this._testingCompleted(true);
    }, this._timeout);
  }


  async _startAndroid() {
    log.d(TAG, `Start emulator [${this._deviceName}]`);
    try {
      await this._device.start(this._deviceParams);
    } catch (err) {
      process.exit(-1);
    }
    log.d(TAG, 'Emulator started');

    log.d(TAG, 'Installing APK');
    await this._device.installApp(this._packageName, this._appFileFullPath);
    log.d(TAG, 'APK installed');

    log.d(TAG, 'Starting application');
    if (this._locale) {
      log.w(TAG, `[${this._locale} is ignored for android]`);
    }
    await this._device.startApp(this._packageName, this._activityName);
    log.d(TAG, 'Application started');

    this._stopByTimeoutID = setTimeout(() => {
      this._testingCompleted(true);
    }, this._timeout);
  }


  async _startIOS() {
    log.d(TAG, `Start emulator [${this._deviceName}]`);
    try {
      await this._device.start(this._deviceParams);
    } catch (err) {
      log.e(TAG, `Failed to start device: [${err.mesage}]`);
      process.exit(-1);
    }
    log.d(TAG, 'Emulator started');

    log.d(TAG, 'Installing APP');
    await this._device.installApp(this._packageName, this._appFileFullPath);
    log.d(TAG, 'APP installed');

    log.d(TAG, 'Starting application');
    await this._device.startApp(this._packageName, this._activityName, this._locale);
    log.d(TAG, 'Application started');
  }


  async start() {
    log.d(TAG, 'Starting server');
    await server.start(
      this._reporter,
      this._testingCompleted,
      this._snapshotsPath,
      this._onAppActivity,
      this._port,
    );
    log.d(TAG, 'Server started');

    if (this._isDevMode) {
      log.d(TAG, 'Only server is used in DEV mode. Waiting for tests');
      return;
    }

    if (this._platform === 'ios') {
      await this._startIOS();
    } else {
      await this._startAndroid();
    }

    this._reporter.collectLogs(this._platform, this._packageName);
  }
}


module.exports = TestsRunner;
