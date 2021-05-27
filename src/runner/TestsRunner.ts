import * as fs from 'fs';
import * as path from 'path';

import log from './utils/log';
import Reporter from './utils/Reporter';
import server from './server/server';

const TAG = 'PIXELS_CATCHER';

type TestsRunnerParamsType =
{
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
};

class TestsRunner {
  _activityName: string;

  _appFile: string;

  _appFileFullPath: string | void;

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

  _stopByTimeoutID: ReturnType<typeof setTimeout> | void;

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


  _testingCompleted = async (isPassed: boolean = false) => {
    if (this._stopByTimeoutID) {
      clearTimeout(this._stopByTimeoutID);
    }
    if (!this._isDevMode) {
      log.i(TAG, 'Stopping the server and emulator');
      await server.stop();
      await this._device.stop();
      log.i(TAG, 'Server and emulator are stopped');

      if (!isPassed) {
        log.i(TAG, 'Some tests failed, exit with error');
        process.exit(-1);
      } else {
        log.i(TAG, 'No errors found');
      }
    }
  };


  _onTestsCompleted = async () => {
    const jUnitFile = path.join(process.cwd(), 'junit.xml');
    this._reporter.toLog();
    this._reporter.tojUnit(jUnitFile);
    this._testingCompleted(this._reporter.isPassed());
  };


  _onAppActivity = () => {
    this._stopByTimeout();
  }


  _stopByTimeout = () => {
    if (this._stopByTimeoutID) {
      clearTimeout(this._stopByTimeoutID);
    }
    this._stopByTimeoutID = setTimeout(() => {
      log.e(TAG, 'Stop tests by timeout');
      this._testingCompleted();
    }, this._timeout);
  };


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

    this._stopByTimeout();
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
      this._onTestsCompleted,
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
      this._startIOS();
    } else {
      this._startAndroid();
    }
  }
}


export default TestsRunner;
